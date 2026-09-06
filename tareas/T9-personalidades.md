# T9 · Personalidades por especie y tres dificultades

**Precondición:** T8 terminada. **Fichero que bloquea:** `src/ai/`.
**Banda de modelo:** ALTO · **Duración esperada:** 3 h · **Encadenable con:** — ·
**Ficheros que toca:** `src/ai/personalities.ts` (nuevo), `src/ai/difficulty.ts` (nuevo),
`src/ai/zargon.ts`, `scripts/simular.ts` (solo la línea que elige la entrada de la IA), `tests/`.
(Cabecera añadida a posteriori en la migración del reparto del 2026-09-06; la tarea ya estaba
LISTA —`hechos/terminadas/09--*`— y la banda no sale de su texto original. El cierre de una
tarea es hoy el de `proyecto.md`, con terminada en `hechos/`.)
Lee `_COMUN.md` primero.

## Lo que hay que escribir

`src/ai/personalities.ts` y `src/ai/difficulty.ts`, encima de la puntuación de T8:

- **Personalidad por especie.** Un goblin cobarde no pelea igual que un guerrero del caos.
  Las especies están en `src/data/monsters.ts`. La personalidad **sesga** la puntuación de
  T8; no la sustituye.
- **Tres dificultades: `torpe`, `normal`, `astuto`.**

## Por qué el nivel torpe es el que importa

Esto se juega con niños. Un Zargon que juegue perfecto no es un buen Zargon: es uno que
hace llorar. El objetivo del plan es que en `torpe` los héroes ganen alrededor del **80 %**
de las partidas y en `astuto` alrededor del **40 %**.

`torpe` no debe ser «la IA buena con ruido aleatorio»: eso se nota raro, porque a veces
hace jugadas brillantes y a veces absurdas. Es más creíble un Zargon que **mira menos
lejos** —que no calcule más allá de un turno, o que solo mire a quien tiene delante— que
uno que decide bien y luego tira un dado para equivocarse.

## Prohibido

- Que la dificultad haga trampas con los dados o con los puntos de cuerpo. Se cambia
  **cómo decide**, nunca los números: si un niño descubre que el juego le regala tiradas,
  se acabó el juego.
- Tocar la puntuación base de T8. Esta capa la sesga desde fuera.

## Al terminar

Commit en `main` y push. Línea en el registro de `_ESTADO.md`. Si ya tienes T10, mete los
porcentajes medidos; si no, dilo y deja el hueco.
