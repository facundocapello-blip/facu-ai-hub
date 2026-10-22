import publicConfig from "../config/firebase.public.json";
import { initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  initializeAuth,
  indexedDBLocalPersistence,
  connectAuthEmulator,
} from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  connectFirestoreEmulator,
} from "firebase/firestore";
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || publicConfig.apiKey,
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || publicConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || publicConfig.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || publicConfig.appId,
};
export const firebaseConfigured =
  import.meta.env.VITE_LOCAL_ONLY !== "true" &&
  Object.values(config).every(Boolean);
export function createFirebase() {
  if (!firebaseConfigured) return null;
  const app = initializeApp(config);
  const auth = initializeAuth(app, {
    persistence: [indexedDBLocalPersistence, browserLocalPersistence],
  });
  const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
  if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === "true") {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", {
      disableWarnings: true,
    });
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
  }
  return { auth, db };
}
export type FirebaseServices = NonNullable<ReturnType<typeof createFirebase>>;
