# T34 · Publicar la aplicación en GitHub Pages

**Precondición:** ninguna técnica. **Sí hace falta la línea de autorización de Juan Luis**
en el tablón: publicar es hacia fuera y no lo decide una sesión.
**Banda de modelo:** MEDIO — el despliegue es mecánico; lo que pide criterio es la cadena
de versión, de la que depende que dos casas no diverjan.
**Ficheros que bloquea:** `.github/workflows/pages.yml` (nuevo), `vite.config.ts`,
`README.md`. **No toca `src/`** salvo el fichero de configuración que decidas para la URL
del relevo.
**Duración esperada:** 2 h · **Encadenable con:** — · **Ficheros que toca:** los de
«Ficheros que bloquea», arriba, más `src/main.tsx` y `src/ui/BoardVerify.tsx` (la `base`).
La firma que pide vive en `autorizaciones.md`, no en el tablón (firmada el 2026-09-06).
(Líneas añadidas en la migración del reparto del 2026-09-06; la tarea ya estaba LISTA,
`hechos/terminadas/34--*`. El cierre es el de `proyecto.md`, con terminada en `hechos/`.)
Lee `_COMUN.md` primero.

## De dónde sale

Juan Luis preguntó, el 5 de septiembre de 2026: «¿No se puede alojar en
salasgar.github.io?» La respuesta corta es **sí para la aplicación y no para la partida**:
Pages sirve ficheros y no corre ningún proceso, así que dos navegadores que abran esa
página no se ven entre sí. De ahí salió la pregunta del canal y de ahí salió T30, el
relevo. Esta tarea es la otra mitad: la página.

Medido el 5 de septiembre: el repositorio `salasgar/Hero-Quest` es **público** y **Pages no
está activado todavía**. Así que la publicación es gratis y sale de un `vite build`.

## Antes de empezar: mira si ya está hecho

```sh
gh api repos/salasgar/Hero-Quest/pages 2>&1 | head -3
ls .github/workflows/ 2>/dev/null
```

## Cómo hacerlo

- **`base` en `vite.config.ts`.** El sitio cuelga de `/Hero-Quest/`, no de la raíz. Sin
  eso, la página carga y sale en blanco, porque busca los recursos donde no están. Es el
  fallo número uno de Pages y no da ningún error legible.
- **El flujo de trabajo construye y publica**, con `npm ci`, `npm run build` y la acción
  oficial de Pages. Que construya **también con `npm test` y `npm run typecheck` delante**:
  publicar una versión rota es peor que no publicar, porque la que está jugando en otra
  casa se la encuentra al recargar.
- **La cadena de versión que pide T30 se decide aquí.** El montaje de una partida la lleva
  dentro y el relevo rechaza a quien no la traiga igual, para que dos casas con código
  distinto no apliquen reglas distintas a la misma lista de acciones. El hash corto del
  commit vale y lo da el propio flujo de trabajo: inyéctalo en la construcción. **Deja
  escrito en `server/README.md` que quien despliegue una versión nueva corta las partidas
  vivas**, que es el precio de rechazar en vez de adivinar.
- **La URL del relevo va en la configuración de construcción**, no escrita a mano en un
  componente. Y con un valor por defecto que no reviente si no hay ninguno: sin relevo, la
  aplicación juega en local, que es su caso normal.
- **La pantalla «Verificar tablero» y los imprimibles**: piensa si tienen sentido en la
  versión publicada. No hace falta quitarlos, pero decídelo a propósito.
- **En el `README.md`, la URL** y una línea de cómo se publica.

## Trampas conocidas

- **Pages guarda en caché con ganas.** Una pestaña abierta desde ayer sigue corriendo el
  código de ayer. Eso es exactamente lo que la cadena de versión existe para atrapar.
- **`base` rompe el desarrollo si lo pones a mano en el sitio equivocado.** Compruébalo con
  `npm run dev` y con `npm run preview` antes de empujar.
- **El repositorio es público y la aplicación también lo será.** No hay claves en el
  cliente hoy y no debe haberlas nunca: la de la API de Claude de la Fase 5 va detrás del
  servidor, que es justo por lo que `server/` existe desde agosto.
- **Activar Pages es una operación sobre su cuenta**, y necesita su línea en el tablón,
  igual que el despliegue del relevo de T30.

## Tests

No hay tests que añadir; la comprobación es de despliegue:

- La página publicada carga y se puede jugar una partida local entera.
- Una construcción con los tests en rojo **no publica**.
- El hash de la versión que sale en la página es el del commit publicado.

## Prohibido

- Publicar sin la autorización escrita.
- Meter ninguna clave en el cliente.
- Publicar saltándose los tests y el `typecheck`.
- Tocar `imprimibles/` ni el reparto de los cuatro folios.

## Al terminar

Commit y push. Línea en el registro con la URL, **cómo se genera la cadena de versión** —lo
necesita T30— y qué se decidió sobre la pantalla de verificar tablero.
