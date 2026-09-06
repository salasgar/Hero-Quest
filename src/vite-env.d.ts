/// <reference types="vite/client" />

// Sin esta línea, `import.meta.env` no existe para TypeScript y hay que
// esquivarlo con un cast en cada sitio que lo use (hay uno así en
// `EntrarEnPartida.tsx`, de antes de T34). Con ella, `BASE_URL` —de dónde cuelga
// el sitio— y las variables `VITE_*` de la construcción se escriben tal cual.
interface ImportMetaEnv {
  /** El hash del commit publicado. Lo inyecta el flujo de trabajo de Pages. */
  readonly VITE_COMMIT?: string;
  /** Dónde vive el relevo de partidas en red. Vacío = se juega en local. */
  readonly VITE_RELEVO?: string;
}
