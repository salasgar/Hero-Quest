import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  /**
   * En GitHub Pages el sitio cuelga de `/Hero-Quest/`, no de la raíz del
   * dominio. Sin esto la página carga **en blanco y sin ningún error legible**,
   * porque busca `/assets/…` donde no está: es el fallo número uno de Pages.
   *
   * Solo al construir. Con `npm run dev` la raíz sigue siendo `/`, que es donde
   * vite la sirve en el Mac; `npm run preview` sí la sirve bajo `/Hero-Quest/`,
   * que es exactamente lo que hay que probar antes de empujar.
   *
   * Quien necesite este valor desde el código, que lo lea de
   * `import.meta.env.BASE_URL` y no lo escriba a mano: es como se llega a lo que
   * hay en `public/`.
   */
  base: command === "build" ? "/Hero-Quest/" : "/",
  // La partida se juega en el Mac, en localhost. host: true se queda por si
  // algún día quieres abrirlo desde otro dispositivo de la casa.
  server: { host: true, port: 5173 },
  test: { environment: "node" },
}));
