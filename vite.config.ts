import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      // The preview CDN redirects PNGs to GitHub Raw; Workbox cannot precache
      // redirected cross-origin responses. Keep normal hosting unchanged.
      includeManifestIcons: process.env.VITE_CDN_PREVIEW !== "true",
      includeAssets:
        process.env.VITE_CDN_PREVIEW === "true"
          ? ["icon.svg"]
          : [
              "icon.svg",
              "icon-192.png",
              "icon-512.png",
              "apple-touch-icon.png",
            ],
      manifest: {
        name: "FACU AI HUB",
        short_name: "FACU HUB",
        description: "Tu centro de control personal, incluso sin conexión.",
        theme_color: "#0b0f19",
        background_color: "#0b0f19",
        display: "standalone",
        lang: "es",
        start_url: ".",
        scope: ".",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: [
          process.env.VITE_CDN_PREVIEW === "true"
            ? "**/*.{js,css,html,svg,woff2}"
            : "**/*.{js,css,html,svg,png,woff2}",
        ],
        navigateFallback: "index.html",
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 3000000,
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          firebase: ["firebase/app", "firebase/auth", "firebase/firestore"],
        },
      },
    },
  },
});
