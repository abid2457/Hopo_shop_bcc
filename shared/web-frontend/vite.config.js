import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// HOPO SHOP INDIA — Standard Vite + React + Tailwind CSS Build Configuration (JavaScript)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 8080,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 8080,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
