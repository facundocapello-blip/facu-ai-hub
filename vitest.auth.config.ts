import { defineConfig } from "vitest/config";
export default defineConfig({
  test: { include: ["tests/auth.test.ts"], testTimeout: 15000 },
});
