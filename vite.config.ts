import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom/client", "react/jsx-runtime", "border-beam", "metal-fx"],
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
  },
});
