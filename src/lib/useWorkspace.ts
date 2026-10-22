import { useEffect, useRef, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  type User,
} from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  writeBatch,
  terminate,
  clearIndexedDbPersistence,
  waitForPendingWrites,
} from "firebase/firestore";
import {
  createFirebase,
  firebaseConfigured,
  type FirebaseServices,
} from "./firebase";
import {
  readWorkspace,
  writeWorkspace,
  migrateLegacy,
  validateWorkspace,
  isProject,
  isTask,
  isSession,
  isPrompt,
} from "./storage";
import {
  emptyWorkspace,
  type Workspace,
  type Collection,
  type Entity,
} from "./types";
let services: FirebaseServices | null = null;
const validators = {
  projects: isProject,
  tasks: isTask,
  sessions: isSession,
  prompts: isPrompt,
};
const collections: Collection[] = ["projects", "tasks", "sessions", "prompts"];
export function useWorkspace() {
  const [data, setData] = useState<Workspace>(emptyWorkspace);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [online, setOnline] = useState(navigator.onLine);
  const [pending, setPending] = useState(false);
  const [cached, setCached] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const ref = useRef(data);
  const userRef = useRef(user);
  const queue = useRef(Promise.resolve());
  const epoch = useRef(0);
  const [authReady, setAuthReady] = useState(!firebaseConfigured);
  const channel = useRef<BroadcastChannel | null>(null);
  useEffect(() => {
    if (!("BroadcastChannel" in window)) return;
    const c = new BroadcastChannel("facu-hub-local");
    channel.current = c;
    c.onmessage = () => {
      const generation = epoch.current;
      if (userRef.current) return;
      void readWorkspace()
        .then((d) => {
          if (d && generation === epoch.current && !userRef.current) {
            ref.current = validateWorkspace(d);
            setData(ref.current);
          }
        })
        .catch((e) => setError(message(e)));
    };
    return () => {
      c.close();
      channel.current = null;
    };
  }, []);
  useEffect(() => {
    const fn = () => setOnline(navigator.onLine);
    window.addEventListener("online", fn);
    window.addEventListener("offline", fn);
    return () => {
      window.removeEventListener("online", fn);
      window.removeEventListener("offline", fn);
    };
  }, []);
  useEffect(() => {
    if (!firebaseConfigured) return;
    try {
      services ??= createFirebase();
      return onAuthStateChanged(
        services!.auth,
        (u) => {
          userRef.current = u;
          epoch.current++;
          setReady(false);
          setUser(u);
          setAuthReady(true);
          setError("");
        },
        (e) => {
          setError(e.message);
          setAuthReady(true);
        },
      );
    } catch (e) {
      setError(message(e));
      setAuthReady(true);
    }
  }, []);
  useEffect(() => {
    if (!authReady) return;
    let disposed = false;
    setReady(false);
    setPending(false);
    setCached(false);
    if (!user) {
      void (async () => {
        try {
          let saved = await readWorkspace();
          if (!saved) {
            const migration = migrateLegacy(localStorage);
            saved = migration.data;
            setWarnings(migration.warnings);
            await writeWorkspace(saved);
          }
          saved = validateWorkspace(saved);
          if (!disposed) {
            ref.current = saved;
            setData(saved);
            setReady(true);
          }
        } catch (e) {
          if (!disposed)
            setError("No se pudo abrir el almacenamiento local. " + message(e));
        }
      })();
      return () => {
        disposed = true;
      };
    }
    const current = emptyWorkspace();
    const seen = new Set<Collection>();
    const pendingBy = new Map<Collection, boolean>();
    const cachedBy = new Map<Collection, boolean>();
    ref.current = current;
    setData(current);
    const stops = collections.map((key) =>
      onSnapshot(
        collection(services!.db, "users", user.uid, key),
        { includeMetadataChanges: true },
        (snapshot) => {
          if (disposed) return;
          const rows = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
          if (!rows.every(validators[key])) {
            setError(`Datos inválidos en ${key}; no se cargaron.`);
            return;
          }
          Object.assign(current, { [key]: rows });
          seen.add(key);
          pendingBy.set(key, snapshot.metadata.hasPendingWrites);
          cachedBy.set(key, snapshot.metadata.fromCache);
          ref.current = { ...current };
          setData({ ...current });
          setPending([...pendingBy.values()].some(Boolean));
          setCached([...cachedBy.values()].some(Boolean));
          if (seen.size === collections.length) setReady(true);
        },
        (e) => {
          if (!disposed) setError("No se pudo sincronizar. " + message(e));
        },
      ),
    );
    return () => {
      disposed = true;
      stops.forEach((fn) => fn());
    };
  }, [authReady, user]);
  function saveLocal(update: (current: Workspace) => Workspace) {
    const generation = epoch.current;
    const persist = async () => {
      const current = (await readWorkspace()) || ref.current;
      const next = validateWorkspace(update(current));
      await writeWorkspace(next);
      if (generation === epoch.current) {
        ref.current = next;
        setData(next);
      }
      channel.current?.postMessage("updated");
    };
    const job = queue.current.then(async () => {
      if (navigator.locks)
        await navigator.locks.request("facu-hub-guest", async () => {
          await persist();
        });
      else await persist();
    });
    queue.current = job.catch(() => {});
    return job;
  }

  async function put(key: Collection, item: Entity) {
    setError("");
    if (!validators[key](item)) throw Error("Datos inválidos.");
    if (userRef.current && services) {
      const generation = epoch.current;
      void setDoc(
        doc(services.db, "users", userRef.current.uid, key, item.id),
        item,
      ).catch((e) => {
        if (generation === epoch.current)
          setError("No se pudo guardar en la nube. " + message(e));
      });
      return;
    }
    await saveLocal(
      (current) =>
        ({
          ...current,
          [key]: [...current[key].filter((x) => x.id !== item.id), item],
        }) as Workspace,
    );
  }
  async function remove(key: Collection, id: string) {
    setError("");
    if (userRef.current && services) {
      const generation = epoch.current;
      void deleteDoc(
        doc(services.db, "users", userRef.current.uid, key, id),
      ).catch((e) => {
        if (generation === epoch.current) setError(message(e));
      });
      return;
    }
    await saveLocal((current) => ({
      ...current,
      [key]: current[key].filter((x) => x.id !== id),
    }));
  }
  async function importData(next: Workspace) {
    validateWorkspace(next);
    // Merge by ID; do not silently replace unrelated cloud documents.
    const active = ref.current.sessions.find((s) => s.endedAt === null);
    if (
      next.sessions.some(
        (s) => s.endedAt === null && active && s.id !== active.id,
      )
    )
      throw Error(
        "Finalizá la sesión actual antes de importar otra sesión abierta.",
      );
    if (userRef.current && services) {
      const total = collections.reduce((n, k) => n + next[k].length, 0);
      if (total > 450)
        throw Error(
          "La importación en nube admite hasta 450 registros por respaldo.",
        );
      const batch = writeBatch(services.db);
      for (const key of collections)
        for (const item of next[key])
          batch.set(
            doc(services.db, "users", userRef.current.uid, key, item.id),
            item,
          );
      const generation = epoch.current;
      void batch.commit().catch((e) => {
        if (generation === epoch.current) setError(message(e));
      });
    } else {
      await saveLocal((current) => {
        const merged = { ...current };
        for (const k of collections)
          Object.assign(merged, {
            [k]: [
              ...new Map(
                [...current[k], ...next[k]].map((x) => [x.id, x]),
              ).values(),
            ],
          });
        return validateWorkspace(merged);
      });
    }
  }
  async function login(email: string, password: string, signup = false) {
    if (!services) throw Error("Firebase todavía no está configurado.");
    setBusy(true);
    setError("");
    try {
      await queue.current;
      await (
        signup ? createUserWithEmailAndPassword : signInWithEmailAndPassword
      )(services.auth, email, password);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    if (!services) return;
    if (pending || !online)
      throw Error(
        "Conectate y esperá a que se sincronicen los cambios antes de salir.",
      );
    setBusy(true);
    try {
      await waitForPendingWrites(services.db);
      await signOut(services.auth);
      await terminate(services.db);
      await clearIndexedDbPersistence(services.db);
      location.reload();
    } catch (e) {
      throw Error(
        "No se pudo limpiar la caché. Cerrá otras pestañas y recargá FACU HUB. Borrá los datos del sitio si compartís el dispositivo. " +
          message(e),
      );
    } finally {
      setBusy(false);
    }
  }
  return {
    data,
    user,
    ready,
    error,
    setError,
    online,
    pending,
    cached,
    warnings,
    busy,
    configured: firebaseConfigured,
    put,
    remove,
    importData,
    login,
    logout,
    verifyEmail: async () => {
      if (userRef.current) await sendEmailVerification(userRef.current);
    },
    resetPassword: async (email: string) => {
      if (!services) throw Error("Firebase no está configurado.");
      await sendPasswordResetEmail(services.auth, email);
    },
  };
}
export const message = (e: unknown) =>
  e instanceof Error ? e.message : "Ocurrió un error inesperado.";
