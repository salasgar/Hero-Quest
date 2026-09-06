/**
 * Qué versión de la aplicación está corriendo esta pestaña.
 *
 * No es un adorno. GitHub Pages guarda en caché con ganas: una pestaña abierta
 * ayer sigue ejecutando el código de ayer aunque el sitio se haya vuelto a
 * publicar, y en red eso significa dos casas aplicando reglas distintas a la
 * misma lista de acciones. Cuando algo no cuadre, lo primero que hay que poder
 * comparar es esto, y sin abrir la consola: en la mesa hay una tableta.
 *
 * El hash lo inyecta el flujo de trabajo de Pages al construir
 * (`VITE_COMMIT`). En el Mac no hay ninguno y pone «local», que es la verdad.
 *
 * **Ojo, que se confunden:** esto NO es la versión del protocolo de red. Esa es
 * `VERSION`, en `src/red/protocolo.ts`, y se sube a mano cuando cambian las
 * reglas. Por qué son dos cosas distintas está en `server/README.md`.
 */
export function Version() {
  const commit = import.meta.env.VITE_COMMIT;
  const texto = commit ? commit.slice(0, 7) : "local";

  return (
    <p
      style={{
        position: "fixed",
        right: 6,
        bottom: 2,
        margin: 0,
        fontSize: 10,
        opacity: 0.45,
        // Que no se coma un clic del tablero: es una etiqueta, no un botón.
        pointerEvents: "none",
      }}
      title={commit ? `Publicado desde el commit ${commit}` : "Construcción local, sin publicar"}
    >
      {texto}
    </p>
  );
}
