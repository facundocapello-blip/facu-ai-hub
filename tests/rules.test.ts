import { readFileSync } from "node:fs";
import { beforeAll, afterAll, beforeEach, it } from "vitest";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  deleteDoc,
} from "firebase/firestore";
import { seedProjects } from "../src/lib/seeds";
let env: RulesTestEnvironment;
beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-facu-hub",
    firestore: { rules: readFileSync("firestore.rules", "utf8") },
  });
});
afterAll(async () => {
  await env?.cleanup();
});
beforeEach(async () => {
  await env.clearFirestore();
});
it("allows owner CRUD and collection list", async () => {
  const db = env.authenticatedContext("alice").firestore();
  const ref = doc(db, "users/alice/projects/sap");
  await assertSucceeds(setDoc(ref, { ...seedProjects[7] }));
  await assertSucceeds(getDoc(ref));
  await assertSucceeds(getDocs(collection(db, "users/alice/projects")));
  await assertSucceeds(deleteDoc(ref));
});
it("denies anonymous and cross-account reads/writes", async () => {
  const anon = env.unauthenticatedContext().firestore(),
    bob = env.authenticatedContext("bob").firestore();
  await assertFails(getDoc(doc(anon, "users/alice/projects/sap")));
  await assertFails(
    setDoc(doc(bob, "users/alice/projects/sap"), seedProjects[7]),
  );
  await assertFails(getDocs(collection(bob, "users/alice/projects")));
});
it("rejects invalid types, extra fields and ID spoofing", async () => {
  const db = env.authenticatedContext("alice").firestore(),
    ref = doc(db, "users/alice/projects/sap");
  await assertFails(setDoc(ref, { ...seedProjects[7], priority: "root" }));
  await assertFails(setDoc(ref, { ...seedProjects[7], admin: true }));
  await assertFails(setDoc(ref, { ...seedProjects[7], id: "other" }));
});
it("validates tasks, prompts and session transitions", async () => {
  const db = env.authenticatedContext("alice").firestore();
  await assertSucceeds(
    setDoc(doc(db, "users/alice/tasks/t"), {
      id: "t",
      projectId: "sap",
      title: "Diagnóstico",
      priority: "Alta",
      status: "Pendiente",
      updatedAt: 0,
    }),
  );
  await assertFails(
    setDoc(doc(db, "users/alice/tasks/bad"), {
      id: "bad",
      projectId: "sap",
      title: "",
      priority: "Alta",
      status: "invalid",
      updatedAt: 0,
    }),
  );
  await assertSucceeds(
    setDoc(doc(db, "users/alice/prompts/p"), {
      id: "p",
      title: "SAP",
      text: "Revisá PT60",
      updatedAt: 0,
    }),
  );
  const s = {
    id: "s",
    projectId: "sap",
    startedAt: 0,
    runningSince: 0,
    accumulatedMs: 0,
    endedAt: null,
    updatedAt: 0,
  };
  await assertSucceeds(setDoc(doc(db, "users/alice/sessions/s"), s));
  await assertFails(
    setDoc(doc(db, "users/alice/sessions/s"), { ...s, endedAt: 100 }),
  );
  await assertFails(setDoc(doc(db, "intentLimits/alice"), { count: 0 }));
});
