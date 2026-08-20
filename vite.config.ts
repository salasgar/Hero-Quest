import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // La partida se juega en el Mac, en localhost. host: true se queda por si
  // algún día quieres abrirlo desde otro dispositivo de la casa.
  server: { host: true, port: 5173 },
  test: { environment: "node" },
});
