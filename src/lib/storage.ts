import { validChatUrl } from "./assistant";
import { openDB } from "idb";
import { seedWorkspace } from "./seeds";
import {
  emptyWorkspace,
  type Workspace,
  type Project,
  type Task,
  type Session,
  type Prompt,
} from "./types";
const db = () =>
  openDB("facu-hub", 1, {
    upgrade(db) {
      db.createObjectStore("workspaces");
    },
  });
export async function readWorkspace(key = "guest"): Promise<Workspace | null> {
  const d = await db();
  return (await d.get("workspaces", key)) ?? null;
}
export async function writeWorkspace(data: Workspace, key = "guest") {
  const d = await db();
  await d.put("workspaces", data, key);
}
const obj = (x: unknown): x is Record<string, unknown> =>
  !!x && typeof x === "object" && !Array.isArray(x);
const text = (x: unknown, max = 10000) =>
  typeof x === "string" && x.length <= max;
const date = (x: unknown): x is number =>
  typeof x === "number" && Number.isFinite(x) && x >= 0;
const id = (x: unknown) => text(x, 128) && !!x && !String(x).includes("/");
const priority = (x: unknown) => ["Alta", "Media", "Baja"].includes(String(x));
export function isProject(x: unknown): x is Project {
  return (
    obj(x) &&
    id(x.id) &&
    text(x.name, 200) &&
    !!x.name &&
    text(x.category, 200) &&
    priority(x.priority) &&
    text(x.status, 100) &&
    text(x.version, 100) &&
    text(x.url, 2048) &&
    text(x.github, 2048) &&
    text(x.notes) &&
    text(x.next, 1000) &&
    date(x.updatedAt) &&
    (x.dueAt === undefined || date(x.dueAt)) &&
    (x.snoozedUntil === undefined || date(x.snoozedUntil)) &&
    (x.chatUrl === undefined ||
      (text(x.chatUrl, 2048) &&
        (!x.chatUrl || validChatUrl(String(x.chatUrl)))))
  );
}
export function isTask(x: unknown): x is Task {
  return (
    obj(x) &&
    id(x.id) &&
    id(x.projectId) &&
    text(x.title, 220) &&
    !!x.title &&
    priority(x.priority) &&
    ["Pendiente", "En curso", "Terminado"].includes(String(x.status)) &&
    date(x.updatedAt) &&
    (x.dueAt === undefined || date(x.dueAt)) &&
    (x.snoozedUntil === undefined || date(x.snoozedUntil))
  );
}
export function isSession(x: unknown): x is Session {
  return (
    obj(x) &&
    id(x.id) &&
    id(x.projectId) &&
    date(x.startedAt) &&
    (x.runningSince === null || date(x.runningSince)) &&
    date(x.accumulatedMs) &&
    (x.endedAt === null || date(x.endedAt)) &&
    date(x.updatedAt) &&
    (x.endedAt === null || x.runningSince === null)
  );
}
export function isPrompt(x: unknown): x is Prompt {
  return (
    obj(x) &&
    id(x.id) &&
    text(x.title, 200) &&
    !!x.title &&
    text(x.text) &&
    date(x.updatedAt)
  );
}
export function validateWorkspace(x: unknown): Workspace {
  if (!obj(x) || x.schema !== 5)
    throw Error("El archivo no es un respaldo de FACU HUB 5.");
  for (const [key, validator] of Object.entries({
    projects: isProject,
    tasks: isTask,
    sessions: isSession,
    prompts: isPrompt,
  })) {
    const rows = x[key];
    if (!Array.isArray(rows) || rows.length > 2000 || !rows.every(validator))
      throw Error(`Datos inválidos en ${key}.`);
    if (new Set(rows.map((r) => r.id)).size !== rows.length)
      throw Error(`IDs duplicados en ${key}.`);
  }
  const data = x as unknown as Workspace;
  if (data.sessions.filter((s) => s.endedAt === null).length > 1)
    throw Error(
      "Hay más de una sesión abierta. Finalizá las sesiones antes de importar.",
    );
  if (
    [...data.tasks, ...data.sessions].some(
      (x) => !data.projects.some((p) => p.id === x.projectId),
    )
  )
    throw Error("Una tarea o sesión apunta a un proyecto inexistente.");
  return data;
}
export function migrateLegacy(storage: Pick<Storage, "getItem">): {
  data: Workspace;
  warnings: string[];
} {
  const warnings: string[] = [];
  function read(key: string): unknown {
    try {
      const raw = storage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      warnings.push(`No se pudo leer ${key}; el original se conserva.`);
      return null;
    }
  }
  const data = seedWorkspace();
  const legacy = read("facu_hub_projects");
  const aliases: Record<string, string> = {
    "1": "henris",
    "2": "mamba",
    "3": "blackmamba",
    "4": "margoush",
    "5": "exiliados",
    "6": "cepiphone",
    "7": "sobrinas",
    "8": "sap",
  };
  if (Array.isArray(legacy)) {
    const migrated: Project[] = [];
    for (const row of legacy) {
      if (!obj(row) || !id(row.id) || !text(row.name, 200) || !row.name) {
        warnings.push(
          "Se omitió un proyecto inválido; el original se conserva.",
        );
        continue;
      }
      const mapped = aliases[String(row.id)] || String(row.id);
      const base = data.projects.find((p) => p.id === mapped);
      const p = {
        ...base,
        id: mapped,
        name: String(row.name),
        category: typeof row.category === "string" ? row.category : "Personal",
        priority: priority(row.priority) ? row.priority : "Media",
        status: typeof row.status === "string" ? row.status : "Pendiente",
        version: typeof row.version === "string" ? row.version : "",
        url:
          typeof row.url === "string"
            ? row.url
            : typeof row.demo === "string"
              ? row.demo
              : "",
        github: typeof row.github === "string" ? row.github : "",
        notes: typeof row.notes === "string" ? row.notes : "",
        next: base?.next || "",
        updatedAt: Date.now(),
      };
      if (isProject(p) && !migrated.some((x) => x.id === p.id))
        migrated.push(p);
      else
        warnings.push(
          "Proyecto fuera de formato; conservado en almacenamiento original.",
        );
    }
    if (migrated.length) data.projects = migrated;
  }
  const overrides = read("facu-ai-hub-v12-projects");
  if (obj(overrides))
    for (const [key, value] of Object.entries(overrides)) {
      if (!obj(value)) continue;
      let p = data.projects.find((p) => p.id === key);
      if (!p) {
        p = {
          id: key,
          name: key,
          category: "Importado",
          priority: "Media",
          status: "Pendiente",
          version: "",
          url: "",
          github: "",
          notes: "",
          next: "",
          updatedAt: 0,
        };
      }
      const candidate = {
        ...p,
        status: typeof value.status === "string" ? value.status : p.status,
        next: typeof value.next === "string" ? value.next : p.next,
        notes: typeof value.context === "string" ? value.context : p.notes,
        url: typeof value.url === "string" ? value.url : p.url,
        updatedAt: Date.now(),
      };
      if (isProject(candidate)) {
        if (data.projects.some((x) => x.id === candidate.id))
          Object.assign(p, candidate);
        else data.projects.push(candidate);
      } else warnings.push("No se pudo migrar un cambio de proyecto.");
    }
  const tasks = read("facu-ai-hub-v14-tasks");
  if (Array.isArray(tasks))
    for (const row of tasks) {
      if (!obj(row)) continue;
      const t = {
        id: row.id,
        projectId: row.project,
        title: row.title,
        priority: row.priority,
        status: row.status,
        updatedAt: Date.now(),
      };
      if (
        isTask(t) &&
        data.projects.some((p) => p.id === t.projectId) &&
        !data.tasks.some((x) => x.id === t.id)
      )
        data.tasks.push(t);
      else warnings.push("Tarea incompatible; el original se conserva.");
    }
  const tracking = read("facu_hub_tracking");
  if (
    obj(tracking) &&
    typeof tracking.projectId === "string" &&
    data.projects.some(
      (p) =>
        p.id === (aliases[String(tracking.projectId)] || tracking.projectId),
    ) &&
    typeof tracking.elapsed === "number" &&
    Number.isFinite(tracking.elapsed) &&
    tracking.elapsed >= 0 &&
    tracking.elapsed <= Number.MAX_SAFE_INTEGER / 1000
  ) {
    // Preserve recorded time paused: the old timer did not reliably measure background time.
    data.sessions.push({
      id: "legacy-session",
      projectId: aliases[tracking.projectId] || tracking.projectId,
      startedAt: date(tracking.startTime) ? tracking.startTime : Date.now(),
      runningSince: null,
      accumulatedMs: tracking.elapsed * 1000,
      endedAt: null,
      updatedAt: Date.now(),
    });
    warnings.push(
      "El contador anterior se recuperó en pausa con su tiempo registrado.",
    );
  }
  const executive = read("facu-ai-hub-v15-executive");
  if (obj(executive) && Object.keys(executive).length)
    warnings.push(
      "Los metadatos ejecutivos v1.5 permanecen en el almacenamiento original; exportalos desde esa versión antes de borrar datos.",
    );
  return { data: validateWorkspace(data), warnings };
}
export const blankWorkspace = emptyWorkspace;
