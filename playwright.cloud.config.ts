import { existsSync } from "node:fs";
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests",
  testMatch: "cloud.spec.ts",
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:5174",
    launchOptions: {
      executablePath:
        process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
        (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
      args: ["--no-sandbox"],
    },
  },
  webServer: {
    command:
      "VITE_FIREBASE_API_KEY=fake-key VITE_FIREBASE_AUTH_DOMAIN=demo-facu-hub.firebaseapp.com VITE_FIREBASE_PROJECT_ID=demo-facu-hub VITE_FIREBASE_APP_ID=demo-app VITE_USE_EMULATORS=true npm run dev -- --host 127.0.0.1 --port 5174 --strictPort",
    url: "http://127.0.0.1:5174",
    reuseExistingServer: false,
  },
  reporter: "list",
});
