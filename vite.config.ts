import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // host: true expone el servidor en la LAN para poder abrirlo desde la tablet.
  server: { host: true, port: 5173 },
  test: { environment: "node" },
});
