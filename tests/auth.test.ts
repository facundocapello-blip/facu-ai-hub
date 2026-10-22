import { it, expect } from "vitest";
import { initializeApp, deleteApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
it("creates an account, signs out, signs back in and rejects an incorrect password", async () => {
  const app = initializeApp(
    { apiKey: "demo-key", projectId: "demo-facu-hub", appId: "demo-app" },
    `auth-test-${Date.now()}`,
  );
  const auth = getAuth(app);
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  try {
    const email = `auth-${Date.now()}@example.test`,
      password = "test-password-123";
    const created = await createUserWithEmailAndPassword(auth, email, password);
    const uid = created.user.uid;
    expect(await created.user.getIdToken()).toBeTruthy();
    await signOut(auth);
    expect(auth.currentUser).toBeNull();
    await expect(
      signInWithEmailAndPassword(auth, email, "incorrect-password"),
    ).rejects.toThrow();
    const returned = await signInWithEmailAndPassword(auth, email, password);
    expect(returned.user.uid).toBe(uid);
  } finally {
    await signOut(auth);
    await deleteApp(app);
  }
});
