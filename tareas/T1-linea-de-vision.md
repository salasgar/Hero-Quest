# T1 · Las figuras cortan la línea de visión

**Precondición:** ninguna. **Fichero que bloquea:** `src/engine/vision.ts`.
**Banda de modelo:** MEDIO · **Duración esperada:** 2 h · **Encadenable con:** — ·
**Ficheros que toca:** `src/engine/vision.ts`, `tests/vision.test.ts`, `tests/reducer.test.ts`.
(Cabecera añadida a posteriori en la migración del reparto del 2026-09-06; la tarea ya estaba
LISTA —`hechos/terminadas/01--*`— y la banda no sale de su texto original. El cierre de una
tarea es hoy el de `proyecto.md`, con terminada en `hechos/`; la «línea en el registro de
`_ESTADO.md`» de abajo es del reparto viejo.)
Lee `_COMUN.md` primero.

## Antes de empezar: mira si ya está hecho

```sh
grep -n "NO tapan la línea de visión" src/engine/vision.ts
```

Si no aparece nada, la tarea ya está hecha: ese comentario es el que afirma la regla
equivocada. Comprueba también la rama `worktree-agent-a087aa61fe4700ed8` (abajo).

## Lo que dice el reglamento

Página 14, «See (Line of Sight)»:

> For a hero to cast a spell, the target must be visible. Heroes and monsters are only
> visible if an unobstructed straight line can be traced from the spellcaster to the
> target.
>
> **A Good Rule of Thumb:** Draw an invisible straight line between the center of the
> square the spellcaster is on and the center of the square the target is on. If the line
> does not cross a wall, closed door, hero, or monster, the target is declared visible,
> even if the line just touches a corner or wall edge.

Es decir: muro, puerta cerrada, **héroe** y **monstruo** bloquean. Rozar una esquina no.

## Lo que tenemos

`src/engine/vision.ts` afirma lo contrario, y por escrito, en su comentario de cabecera:

> «Las figuras NO tapan la línea de visión: se ve por encima de un goblin.»

Hay que cambiar el código **y ese comentario**, que si no queda mintiendo.

## Qué tener en cuenta

- Ni quien mira ni el objetivo se bloquean a sí mismos: solo cuentan las figuras que están
  **en medio**.
- Solo las vivas (`cuerpo > 0`).
- El mobiliario alto (`bloqueaVista`) ya bloquea y debe seguir; el bajo no.
- La **regla de las salas** (una sala está a oscuras hasta que se abre; dentro se ve
  entera) es otra regla distinta, está bien, y no se toca.
- `puedeVer` la usan `objetivosDeAtaque` (la ballesta), `hechizosLanzables`,
  `puedeBuscarTesoro` y `revelarSala`. Este cambio les afecta a todas: es lo esperado, y
  probablemente rompa algún test que asumía lo viejo.

## Hay una rama con un intento

`worktree-agent-a087aa61fe4700ed8` tiene un intento completo y en verde, hecho por un
subagente que se detuvo antes de que nadie lo revisara. Toca `vision.ts`,
`tests/vision.test.ts` y `tests/reducer.test.ts`.

```sh
git log --oneline main..worktree-agent-a087aa61fe4700ed8
git diff main..worktree-agent-a087aa61fe4700ed8
```

**Léela antes de escribir nada.** O la validas y la fusionas, o la descartas con
`git branch -D worktree-agent-a087aa61fe4700ed8`. Nadie la ha revisado, así que no la des
por buena porque los tests pasen: comprueba que los tests que cambió los cambió por el
motivo correcto.

## Tests que hay que añadir

- Una figura en medio bloquea.
- El propio objetivo, al final de la línea, no se bloquea a sí mismo.
- Una figura con `cuerpo: 0` no bloquea.
- Rozar una esquina no bloquea (ese caso ya existe en `tests/vision.test.ts`: no lo
  rompas).

## Prohibido

- Cambiar la regla de las salas para «arreglar» un test.
- Hacer que las figuras bloqueen también el **movimiento**: eso es T2 y es otra regla.

## Al terminar

Commit en `main` y push. Apunta la línea en el registro de `_ESTADO.md`, y di si el cambio
se nota en la mesa (se nota: con un compañero delante, el mago deja de poder apuntar).
