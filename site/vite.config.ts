import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  base: "/pico-dub-siren/",
  plugins: [react()],
  server: {
    proxy: {
      "/pico-dub-siren/breadboard/docs": {
        target: "http://127.0.0.1:3101",
        changeOrigin: true,
        ws: true,
      },
      "/pico-dub-siren/lessons": {
        target: "http://127.0.0.1:3102",
        changeOrigin: true,
        ws: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
