# T43 · Quitar la pestaña «Verificar tablero» sin borrar su código

**Precondición:** ninguna. **No a la vez que T41** (`App.tsx`, `estilos.css`).
**Banda de modelo:** BAJO — mecánico y reversible: esconder un botón y una pantalla.
**Duración esperada:** 1 h · **Encadenable con:** —.
**Ficheros que toca:** `src/App.tsx`, `src/estilos.css` (solo si queda una clase sin uso).
**No toca `src/ui/BoardVerify.tsx`**, que se conserva entero.
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Lo que pidió Juan Luis

El 2026-09-06:

> Ya no es necesaria la pestaña "Verificar tablero" en la aplicación. Hay que quitarla. No
> borres todo el código, por si en el futuro hay que verificar otro tablero, pero que no
> aparezca en la aplicación.

## Lo que hay hoy, medido

`App.tsx` tiene `pantalla: "juego" | "verificar"` y una barra `navegacion` con tres
botones: Partida, Verificar tablero e Instrucciones. `BoardVerify.tsx` pinta el tablero
sobre `public/tablero-referencia.webp` para cotejarlo con la foto; es lo que permitió medir
la geometría, y T34 lo dejó publicado a propósito porque no estorbaba. Ahora sí sobra.

## Antes de empezar: mira si ya está hecho

```sh
grep -n 'Verificar tablero' src/App.tsx
```

Si no aparece, está hecha.

## Qué hay que hacer

1. Quitar el botón «Verificar tablero» de la barra y la rama `pantalla === "verificar"`
   del render. `BoardVerify.tsx` sigue en el repositorio, sin importar desde ningún sitio
   que se vea.
2. Dejar una puerta trasera **que no se vea**: si la URL lleva `?verificar`, se enseña
   `BoardVerify` en vez de la partida. Así se puede cotejar otro tablero el día que haga
   falta sin tocar código, y nadie la encuentra sin saberlo. `App.tsx` ya lee la URL para
   `codigoDelEnlace`; hazlo al lado.
3. `npm run typecheck` tiene que seguir en verde: un `import` sin uso lo marca `tsc` con
   la configuración de este repositorio.

## Trampas conocidas

- **`estilos.css` lo tocan T37 y T41**: si una clase queda sin uso, déjala; borrarla no
  vale la reserva del fichero.
- **Los componentes no se prueban.** Comprueba en `npm run dev` que la barra tiene dos
  botones y que `?verificar` enseña la pantalla vieja.

## Prohibido

- Borrar `BoardVerify.tsx` o la foto de referencia.
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md` (pruebas en verde → commit de `App.tsx` →
`hechos/terminadas/43--<sid>.md` con el hash → `CERRADA` → regenerar `_ESTADO.md` → commit
con rutas explícitas → `push`).
