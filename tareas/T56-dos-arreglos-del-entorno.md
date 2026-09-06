# T56 · Dos arreglos del entorno: vitest cuenta los worktrees y `preview` no sirve la página

**Precondición:** ninguna. No comparte ficheros con nadie.
**Banda de modelo:** BAJO — dos cambios pequeños, dichos con su forma exacta, fáciles de
comprobar.
**Duración esperada:** 30 min · **Encadenable con:** 57 (MEDIO; si la sesión es MEDIO, esta
se hace primero).
**Ficheros que toca:** `vite.config.ts`, `README.md`, `tareas/_COMUN.md` (dos líneas).
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## De dónde sale

Dos incidencias del 2026-09-06 que nadie tenía asignadas:

1. **`npx vitest run` en el árbol principal cuenta los tests de los worktrees ajenos**
   (`.claude/worktrees/`): 3072 tests en vez de 450. Lo encontraron las sesiones de T40 y
   T11; está en `tareas/_COMUN.md`, «Trampas del entorno», con el arreglo.
2. **`npm run preview` responde 404 a lo que lleve `Sec-Fetch-Dest: script`** (vite 7.3.6),
   así que la página sale en blanco y no se puede comprobar la construcción en local, que
   es justo lo que `vite.config.ts` y la ficha de T34 recomiendan hacer. Está en
   `hechos/incidencias/s-20260906T125522-43d82a6b.md`, con la receta que sí funciona.

## Antes de empezar: mira si ya está hecho

```sh
grep -n "exclude" vite.config.ts
grep -n "http.server" README.md
```

## Qué hay que hacer

1. En `vite.config.ts`, dentro de `test`:
   `exclude: ['**/node_modules/**', '**/dist/**', '**/.claude/**']`. Los dos primeros se
   repiten a propósito: dar `exclude` sustituye el valor por defecto de vitest. Comprobar:
   `npx vitest run` en el árbol principal tiene que dar los mismos ficheros que
   `npx vitest run --exclude "**/node_modules/**" --exclude "**/.claude/**"`.
2. En `README.md`, en «Publicada en GitHub Pages», un apartado «Comprobar la construcción
   en local» con la receta de la incidencia:
   ```sh
   npm run build
   mkdir -p sitio && ln -sfn "$PWD/dist" sitio/Hero-Quest
   (cd sitio && python3 -m http.server 5200 --bind 127.0.0.1)
   # http://127.0.0.1:5200/Hero-Quest/ se comporta como GitHub Pages
   ```
   y una línea diciendo que `npm run preview` no vale en esta versión de vite y por qué.
   Si en **veinte minutos** encuentras una opción de vite que lo arregle (`preview.headers`
   o similar), ponla y deja el README con `npm run preview`; si no, no insistas.
   `sitio/` va al `.gitignore` si lo creas.
3. En `tareas/_COMUN.md`, la trampa de vitest deja de decir «está sin hacer» y pasa a decir
   que está hecha y desde qué commit; y la nota de `vite.config.ts` sobre `preview` se
   corrige igual.

## Prohibido

- Tocar cualquier otro fichero.
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md`. En la terminada, el número de ficheros y tests
que da `npx vitest run` a secas en el árbol principal.
