# T20 · El turno de Zargon pasa sin que el diario cuente nada

**Precondición:** ninguna. Toca `types.ts`, **`reducer.ts`** y `narrator/local.ts`: mira el
candado de ficheros en `_ESTADO.md` antes de empezar.
**Banda de modelo:** MEDIO — no hay regla nueva que decidir; hay que añadir eventos sin
romper el `switch` exhaustivo del narrador ni llenar el diario de ruido.
**Ficheros que bloquea:** `src/engine/types.ts`, **`src/engine/reducer.ts`**,
`src/narrator/local.ts`, `src/ui/TurnPanel.tsx`, `tests/`.
**Duración esperada:** 2 h · **Encadenable con:** — · **Ficheros que toca:** los de
«Ficheros que bloquea», arriba.
(Líneas añadidas en la migración del reparto del 2026-09-06; la tarea ya estaba LISTA,
`hechos/terminadas/20--*`. El cierre es el de `proyecto.md`, con terminada en `hechos/`.)
Lee `_COMUN.md` primero.

## Lo que contó Juan Luis

El 5 de septiembre de 2026, después de jugar una partida: «Los monstruos no se mueven. Se
quedan quietos y no atacan. El diario no dice qué es lo que han hecho los monstruos.»

Son **dos cosas distintas** y conviene separarlas antes de tocar nada, porque solo una es
esta tarea:

1. **Nadie mueve a los monstruos.** El motor sabe moverlos; lo que no existe todavía es
   quien decida a dónde. Eso es **T8** (objetivos y caminos) y **T11** (el turno sin clics).
2. **El diario no cuenta el turno de Zargon.** Aunque el adulto mueva los monstruos a mano,
   la mitad de lo que pasa no deja línea. Eso es **esta tarea**.

## Medido, no supuesto

Partida real (`crearPartida`, misión del calabozo, semilla 7): el bárbaro abre `ps`, se
revelan los dos goblins, los cuatro héroes terminan turno y entra Zargon. Cada acción, con
lo que el narrador devuelve:

```
activar goblin1        -> (el diario no dice nada)   eventos: ninguno
mover el goblin        -> «Goblin avanza 3 casillas.»
terminar la activación -> (el diario no dice nada)   eventos: ninguno
```

De ahí salen los tres agujeros:

- **`activarMonstruo` no emite ni un evento** ([`reducer.ts:312`](../src/engine/reducer.ts#L312)):
  devuelve `terminar(estado, [])`. En el diario no aparece **qué monstruo** está actuando.
- **Cerrar la activación tampoco** ([`reducer.ts:868`](../src/engine/reducer.ts#L868)): mientras
  queden monstruos, `terminarTurno` devuelve `terminar(..., [])`. Solo el último emite
  `cambioDeTurno`.
- **Por tanto, un turno de Zargon en el que los monstruos no hagan nada deja el diario
  exactamente igual que antes.** El jugador ve «— Turno de Zargon —» y la línea siguiente ya
  es la del héroe. Es literalmente lo que contó Juan Luis.

Y lo que sí funciona, para que nadie lo rehaga: activar un monstruo le pone su movimiento de
especie (el goblin, 10) y el tablero le pinta las casillas alcanzables —12 en la medición—;
moverlo con las flechas o pulsando una casilla **sí** narra («Goblin avanza 3 casillas»), y
atacar narra desde siempre. **El motor está bien. Lo que falta es contarlo.**

## Lo que decidió Juan Luis

Preguntado el 5 de septiembre de 2026, respondió: **contar ahora y desbloquear T8.** Es
decir:

- Esta tarea **no escribe ninguna IA**, ni siquiera provisional. Un «avanza hacia el héroe
  más cercano» sería T8 hecha a medias y habría que tirarlo.
- Esta tarea **sí se ocupa de que T8 quede cogible**. Su precondición escrita es T1–T7, y
  las tres que de verdad la bloquean —T1, T4 y T5, las que cambian qué es legal para un
  monstruo— llevan hechas desde el 5 de septiembre; el tablón lo explica en «La dependencia
  real de la Fase 4». **Mira el estado de T6 antes de tocar la fila**, que era la última de
  las siete y estaba en curso cuando se escribió esto: si ya está cerrada, T8 pasa a
  pendiente y se dice en el registro que es la tarea que hace que los monstruos se muevan
  solos. Si no, deja la fila como esté y limítate a decirlo.

## Cómo hacerlo

- **Un evento nuevo al activar**, del estilo `{ tipo: "monstruoActiva", monstruo }`, narrado
  con el nombre y, si lo tienes a mano, el motivo que ya calcula
  [`motivoDeActivacion`](../src/ai/orden.ts) para la pantalla: «Le toca al goblin: te tiene a
  tiro». En la mesa, saber **cuál** de los seis se está moviendo es la mitad de la
  información.
- **Una línea cuando un monstruo termina sin hacer nada.** Es el caso que se lee como
  «la aplicación está rota», y es el que hay que cubrir sí o sí: si al cerrar la activación
  no hubo ni movimiento ni ataque, que el diario lo diga —«El goblin se queda donde está»—.
  Si sí actuó, **no añadas una línea de cierre**: ya está contado y sobra.
- **Una línea cuando Zargon no tiene a nadie que mover.** La pantalla ya distingue los dos
  motivos desde T18 («Los héroes todavía no han encontrado a nadie» / «No queda ningún
  monstruo por mover»); el diario no distingue ninguno de los dos porque no dice nada.
- **La pantalla también tiene un hueco:** la pista «Mueve con las flechas ←↑↓→ o pulsa una
  casilla verde» de [`TurnPanel.tsx`](../src/ui/TurnPanel.tsx) está condicionada a
  `activa && !esZargon`, así que **con un monstruo activo no sale**. Mientras T8 y T11 no
  estén, el adulto los mueve a mano y la pantalla no le dice cómo. Quítale el `!esZargon` o
  escribe la variante que corresponda.

## Trampas conocidas

- **`narrar` es un `switch` exhaustivo sobre `Evento`.** Añadir un caso a `Evento` en
  `types.ts` sin añadirlo en `narrator/local.ts` rompe el `typecheck`, y eso está bien: es la
  red que impide que un evento nuevo nazca mudo. No lo esquives con un `default`.
- **Un evento por monstruo, no tres.** Seis monstruos × tres líneas es un diario que nadie
  lee y que se come la pantalla en la mesa. Si dudas, quita.
- **`repetir` rehace la partida desde cero** para el deshacer: los eventos nuevos tienen que
  salir iguales al repetir. No metas nada que dependa del reloj ni de `Math.random()`.
- **No cambies quién cierra el turno de Zargon.** `monstruosActivables` está compartida por
  la pantalla, la guarda y el cierre del turno, y el comentario de
  [`reducer.ts:66`](../src/engine/reducer.ts#L66) explica que si se desincronizan, el turno
  de Zargon **no termina nunca**. Añade eventos; no toques la condición.
- **T18 está tocando estos mismos ficheros** (`types.ts`, `reducer.ts`, `TurnPanel.tsx`).
  Comprueba el candado antes, y si sigue viva, espera.

## Tests que hay que añadir

En `tests/turno-de-zargon.test.ts`, sobre el motor y el narrador —la interfaz no se prueba
aquí, `vite.config.ts` dice `environment: "node"`—:

- Activar un monstruo emite un evento, y `narrar` lo convierte en una frase con su nombre.
- Un monstruo que se activa y termina sin moverse ni atacar deja una línea que lo dice.
- Un monstruo que se mueve y ataca **no** deja además la línea de «no ha hecho nada».
- Un turno de Zargon completo, con los seis monstruos, deja tantas líneas como monstruos
  actuaron y ninguna más.
- El caso que abrió la tarea: entrar en el turno de Zargon **sin ningún monstruo en el
  tablero** deja una línea, no cero.
- La receta de T1: revirtiendo los eventos nuevos, los tests fallan.

## Prohibido

- Escribir la IA de Zargon: es T8.
- Quitar la activación manual (lo prohíben T11 y T17).
- Que la interfaz llame al motor saltándose `usePartida`.
- Marcar T8 como hecha: aquí solo se desbloquea.

## Al terminar

Commit en `main`, push, y en el registro de `_ESTADO.md`: qué eventos nuevos hay, qué línea
deja cada uno y **por qué T8 pasa a cogible**. Y juega un turno de Zargon de verdad antes de
darlo por bueno: lo que hay que comprobar no es que compile, es que quien mira la pantalla
sepa qué acaba de hacer cada monstruo.
