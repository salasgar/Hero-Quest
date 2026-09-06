# T13 · En el tablero solo se pintan las puertas que alguien ha visto

**Precondición:** ninguna. **Banda de modelo:** ALTO — cambia la forma del estado y decide
una regla que luego heredan T15 y toda la Fase 4.
**Ficheros que bloquea:** `src/engine/types.ts`, `src/engine/partida.ts`,
`src/engine/reducer.ts`, `src/engine/selectors.ts`, `src/ui/BoardMirror.tsx` — mira en
`_ESTADO.md` quién tiene `reducer.ts`, que lo tocan T2, T3, T4, T5, T6 y T15.
**Duración esperada:** 3 h · **Encadenable con:** — · **Ficheros que toca:** los de
«Ficheros que bloquea», arriba, más `tests/`.
(Líneas añadidas en la migración del reparto del 2026-09-06; la tarea ya estaba LISTA,
`hechos/terminadas/13--*`. El cierre es el de `proyecto.md`, con terminada en `hechos/`.)
Lee `_COMUN.md` primero.

## El fallo, medido

Juan Luis abrió la partida y vio en pantalla una puerta que desde la escalera no se puede
ver. No es impresión suya: `BoardMirror.tsx` pinta **todas** las puertas no secretas del
estado, sin preguntar si alguien las ha visto.

```
src/ui/BoardMirror.tsx, bloque «Puertas»:
  estado.puertas.filter((p) => !p.secreta || p.descubierta).map(...)
```

Ese filtro tapa las secretas y nada más. Con «El calabozo del guardián» al empezar, los
cuatro héroes están en la escalera —(12,17), (13,17), (12,18), (13,18)— y esto es lo que
ve cada puerta, comprobado ejecutando `puedeVer` contra el estado inicial:

| Puerta | Casillas | La ve al empezar |
|---|---|---|
| `ps` | (12,15)–(11,15) | bárbaro, enano |
| `pt` | (13,14)–(14,14) | bárbaro, enano |
| `pr` | (6,18)–(6,17) | elfo |
| `pq` | **(0,15)–(1,15)** | **nadie** |
| `psecreta` | (4,13)–(4,14) | nadie (y ya está tapada por ser secreta) |

**`pq` es la puerta de la captura.** Está en el extremo izquierdo del pasillo, a doce
casillas de la escalera, y se pinta igual que las tres que sí se ven.

Ojo antes de tocar nada: **`ps`, `pt` y `pr` sí tienen que seguir viéndose.** Si tu cambio
las apaga también, has roto la partida, no la has arreglado. Ese es el test que de verdad
separa el arreglo del apagón.

## Antes de empezar: mira si ya está hecho

```sh
grep -n "puertasVistas\|puertasVisibles" src/engine/types.ts src/engine/selectors.ts src/ui/BoardMirror.tsx
```

Si no hay nada, está pendiente.

## La decisión de diseño, y por qué esta y no la fácil

La tentación es un selector puro: «pinta las puertas que algún héroe vea **ahora**». Es
media hora de trabajo y está mal, por una razón que solo se ve en la mesa: **una puerta
vista no se desve**. En cuanto los héroes la ven, Juan Luis pone la puerta de cartón sobre
el tablero físico y ahí se queda. Con el selector puro, la puerta parpadearía en pantalla
cada vez que el grupo dobla la esquina, y el espejo dejaría de corresponderse con la mesa
—que es lo único que esta aplicación tiene que hacer bien—.

Así que hace falta **memoria en el estado**: un campo nuevo, acumulativo, que nunca quita.

También descartado: acumular el conjunto en el `useState` de `BoardMirror`. Rompe
**deshacer**, que rehace la partida repitiendo acciones sobre el estado inicial
(`usePartida.ts`); lo que viva fuera del estado no se rebobina y la pantalla quedaría
mostrando puertas de un futuro que se ha deshecho.

## Cómo modelarlo

Sugerencia; si encuentras algo mejor, decídelo tú y escribe por qué en `_ESTADO.md`.

- `EstadoPartida` gana `puertasVistas: string[]` (ids de puerta), junto a `salasReveladas`,
  que es exactamente el mismo patrón y ya está probado.
- `crearPartida` lo rellena **antes de devolver el estado**, no vacío: en el turno 1 el
  grupo ya está mirando el pasillo, y si empieza vacío la primera pantalla no enseña
  ninguna puerta.
- Se actualiza en **`terminar()`** (`reducer.ts:155`), que es el embudo por el que pasan
  todas las acciones legales sin excepción. Añadirlo ahí evita la lista de sitios —mover,
  abrir puerta, atravesar la roca, teletransportes futuros— que siempre se queda corta.
  Cuidado: `terminar()` se llama mucho, así que la función tiene que ser barata; son cinco
  puertas por seis héroes, pero mídelo si alguna misión trae veinte.
- Una puerta pasa a vista cuando **algún héroe vivo** ve **cualquiera de sus dos casillas**
  (`puedeVer(e, heroe.celda, p.a) || puedeVer(e, heroe.celda, p.b)`). Los monstruos no
  cuentan: lo que Zargon vea no lo pinta el espejo de los héroes.
- `selectors.ts` expone `puertasVisibles(e): Puerta[]`, y `BoardMirror` pinta esa lista en
  vez de filtrar por su cuenta. La interfaz no debe volver a decidir reglas.

## Las secretas siguen aparte

`p.secreta && !p.descubierta` **no** se sustituye por lo nuevo: son dos condiciones
distintas y las dos tienen que cumplirse. Una puerta secreta ya descubierta y que además
se ve, se pinta; una secreta descubierta que quedó a la espalda del grupo, también, porque
descubrirla es un hecho, como haberla visto. Junta las dos condiciones, no las mezcles.

## Trampas conocidas

- **`puedeVer` devuelve `false` para cualquier casilla de una sala sin revelar**, incluso
  desde la casilla de al lado. Una puerta entre dos salas a oscuras no la ve nadie, y está
  bien: se verá al revelar una de las dos. Pero significa que **el orden importa** dentro
  de `terminar()`: si actualizas las puertas vistas antes de revelar la sala, la puerta que
  acabas de abrir tarda un turno en aparecer. Revelar primero.
- Una puerta cerrada **tapa la línea de visión**, pero solo si está *en medio*: `vision.ts`
  no deja que nada se tape a sí mismo ni tape a su propio objetivo. Aun así, comprueba con
  un test que una puerta cerrada no se esconde detrás de sí misma.
- El estado tiene que seguir sobreviviendo a `JSON.parse(JSON.stringify(e))`: nada de
  `Set`, que se serializa como `{}` y se pierde al guardar la partida.
- **El test de juego al azar de `tests/integracion.test.ts` es el que encuentra los fallos
  de verdad.** Si lo rompes, la sospecha por defecto es que has metido un bug.

## Tests que hay que añadir

- Al empezar «El calabozo del guardián», `pq` **no** está en las visibles y `ps`, `pt` y
  `pr` **sí**. Es el caso exacto de la captura y el que fija la regla.
- Una vez vista, una puerta sigue visible después de que todos los héroes se alejen. Es la
  mitad que un selector puro no cumple, y sin este test nadie notaría que falta.
- Abrir una puerta revela la sala y, en el mismo paso, las puertas de esa sala pasan a
  vistas. Cubre el orden dentro de `terminar()`.
- Una puerta secreta descubierta pero fuera de la vista se sigue pintando.
- La prueba de T1, que es la que decide si un test vale: **revierte `reducer.ts` y
  `selectors.ts` y comprueba que estos tests fallan.** Uno que pasa igual con el código
  viejo no está probando nada.

## Prohibido

- **Tocar `src/data/quests/calabozo.ts` para mover o quitar `pq`.** La puerta está bien
  donde está: lo que está mal es pintarla. Borrarla haría desaparecer el síntoma y dejaría
  el fallo dentro para las otras veintiuna salas.
- Guardar el conjunto de puertas vistas fuera del estado.
- Dejar que `BoardMirror` decida la regla por su cuenta: la regla va en el motor y la
  interfaz solo la consulta.

## Al terminar

Commit en `main` y push. Línea en el registro de `_ESTADO.md` **diciendo explícitamente
que la forma del estado ha cambiado** (lo mismo que pide T6, y por el mismo motivo: quien
venga a guardar partidas necesita saberlo).
