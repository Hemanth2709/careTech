import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  assetsInclude: ["**/*.wasm", "**/*.fs"],
  optimizeDeps: {
    exclude: ["@electric-sql/pglite"],
  },
  worker: {
    format: "es",
  },
  build: {
    target: ["esnext"],
  },
});
