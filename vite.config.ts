import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const localEnv = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    resolve: {
      dedupe: ["react", "react-dom"],
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom/client",
        "react/jsx-runtime",
        "border-beam",
        "metal-fx",
      ],
    },
    server: {
      host: "127.0.0.1",
      port: 5173,
      strictPort: true,
      proxy: {
        "/api": {
          target: "http://127.0.0.1:8000",
          changeOrigin: false,
          configure(proxy) {
            proxy.on("proxyReq", (request) => {
              // Existing private gate stays server-side; never expose it as VITE_*.
              request.setHeader(
                "X-Prototype-Key",
                localEnv.PROTOTYPE_KEY || "",
              );
            });
          },
        },
      },
    },
  };
});
