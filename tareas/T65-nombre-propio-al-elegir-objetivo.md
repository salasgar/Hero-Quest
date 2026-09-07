# T65 · Dos botones de «Atacar a Goblin» sin decir cuál es cuál

**Precondición:** ninguna. **No choca con nada vivo hoy** (comprobar el tablón al
reclamar).
**Banda de modelo:** BAJO — el criterio ya está fijado (mostrar el nombre propio, que ya
existe en el dato), es un cambio de una expresión en dos sitios casi idénticos.
**Duración esperada:** 30 min · **Encadenable con:** T64 (las dos MEDIO/BAJO, cortas, sin
fichero en común).
**Ficheros que toca:** `src/ui/TurnPanel.tsx`.
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Lo que contó Juan Luis

El 2026-09-07:

> La hechicera está entre dos goblins. Aparecen dos botones y en los dos pone lo mismo:
> "Atacar a goblin". ¿Cómo sé cuál es cuál?. Debería poner su nombre propio.

## Diagnóstico medido en el código

`src/ui/TurnPanel.tsx:333`, el botón de atacar:

```tsx
{objetivos.map((o) => (
  <button key={o.id} onClick={() => acciones.atacar(o.id)} className="atacar">
    Atacar a {esHeroe(o) ? o.nombre : MONSTRUOS[o.especie].nombre}
  </button>
))}
```

Para un monstruo, el botón usa `MONSTRUOS[o.especie].nombre` — el nombre de la **especie**
(«Goblin»), no el nombre propio del monstruo (`o.nombre`, p. ej. «Snik», el que reparte
`repartirNombres` desde T42 y el que ya usa el diario: `nombreDe()` en
`src/narrator/local.ts:33-39` hace `${conArticulo(m.especie)} ${m.nombre}`). Con dos
goblins en la sala, los dos botones muestran literalmente el mismo texto.

**El mismo patrón, con el mismo defecto, está también en el selector de objetivo de
hechizo**, `TurnPanel.tsx:393`:

```tsx
{pendiente.objetivos.map((o) => (
  <button key={o.id} onClick={() => acciones.lanzarSobre(o.id)} className="principal">
    {esHeroe(o) ? o.nombre : MONSTRUOS[o.especie].nombre} ({o.cuerpo})
  </button>
))}
```

Aquí pasaría exactamente lo mismo lanzando un hechizo con dos goblins como objetivo posible:
dos botones iguales, sin poder distinguir cuál es cuál.

## Antes de empezar: mira si ya está hecho

```sh
grep -n "MONSTRUOS\[o.especie\].nombre" src/ui/TurnPanel.tsx
```

## Qué hay que hacer

En los dos sitios (líneas 333 y 393), cambia `MONSTRUOS[o.especie].nombre` por `o.nombre`
—el nombre propio, ya presente en el objeto—. El resultado pasa de «Atacar a Goblin» /
«Atacar a Goblin» a «Atacar a Snik» / «Atacar a Górbak» (o los nombres que toquen esa
partida).

Comprueba si, tras el cambio, sigue haciendo falta la importación de `MONSTRUOS` en
`TurnPanel.tsx` (`grep -n "MONSTRUOS" src/ui/TurnPanel.tsx` antes y después): si ya no se
usa en ningún otro sitio del fichero, quita la importación; TypeScript se queja de
importaciones sin usar y `npm run typecheck` lo dice si se te olvida.

## Trampas conocidas

- **No es solo el botón de atacar.** El selector de objetivo de hechizo (línea 393) tiene
  el mismo defecto; arréglalos los dos a la vez, o el fallo reaparece en cuanto alguien
  lance un hechizo con dos monstruos iguales delante.
- **Los héroes ya estaban bien** (`esHeroe(o) ? o.nombre : ...`): no toques esa rama.
- **No hay ambigüedad entre partidas, solo dentro de una**: `repartirNombres` (T42) ya
  garantiza que dos monstruos de la misma especie en la misma partida no comparten nombre
  propio, así que el cambio basta sin ningún otro ajuste de datos.

## Tests que hay que añadir

Ninguno de pantalla (los componentes no se prueban). Si quieres blindarlo, un test de
`src/data/nombres.ts` o de `objetivosDeAtaque`/`selectors.ts` que compruebe que dos
monstruos de la misma especie en la misma sala tienen `nombre` distinto ya existiría de
T42; no hace falta uno nuevo solo para este cambio de pantalla.

## Prohibido

- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md`. En el mensaje de cierre, describe (o pega) los
dos botones con dos monstruos de la misma especie en pantalla, para que se vea que ya dicen
nombres distintos.

## Lo que encontró la sesión que la hizo (`s-20260907T205502-6241d5c8`, 2026-09-07)

Hecha y cerrada, encadenada tras la 64. Dos cosas que no estaban escritas aquí:

- **La importación de `MONSTRUOS` se queda.** Además de los dos sitios de la ficha, la usa
  el titular del turno de Zargon (`MONSTRUOS[activa.especie].nombre`, hacia la línea 143),
  donde la especie sí es lo que se quiere decir. Quitarla habría roto el typecheck.
- **Para «pegar los dos botones» sin montar una partida entera** basta un guion de
  `vite-node` que construya la escena con `partida()` y `situar()` de `tests/ayuda.ts`
  (un mago con `elementos` en (2,2), dos goblins en (1,2) y (3,2), `salasReveladas:
  ["a"]`), calcule `objetivosDeAtaque` y `hechizosLanzables`, y renderice `TurnPanel` con
  `renderToStaticMarkup` de `react-dom/server`: los botones salen como texto. Sin
  `elementos`, el mago no tiene hechizos y el selector de objetivo no se pinta.
