# T11 · El turno de Zargon, sin un solo clic

**Precondición:** T8 y T9 terminadas. **Fichero que bloquea:** `src/ui/`.
**Banda de modelo:** MEDIO — el motor y la IA ya están escritos y probados; esto es
conectarlos a la pantalla con el ritmo de la mesa, que pide criterio pero no decide reglas.
**Duración esperada:** 3 h · **Encadenable con:** T22 y T36 (misma banda, cortas, y
comparten `TurnPanel.tsx` con esta: **no van en paralelo**, van seguidas en la misma sesión
o de una en una). T38 (la huida) decide qué hace el monstruo; esta decide a qué ritmo se ve.
**Ficheros que toca:** `src/ui/Juego.tsx`, `src/ui/TurnPanel.tsx`,
`src/ui/useAccionesDeTurno.ts`, `tests/`; `src/ui/usePartida.ts` solo si hace falta, y
**nada de `src/engine/` ni de `src/ai/`**. Ajusta esta lista en tu reclamo si al empezar ves
que es otra. El punto de entrada con dificultad es `accionDeZargon(e, nivel)`, en
`src/ai/difficulty.ts` (lo dejó dicho el registro de T9); la pantalla necesita un selector
de nivel o fijar `normal` hasta que se pida.
(Cabecera añadida en la migración del reparto del 2026-09-06; la banda no sale del texto
original. El cierre es el de `proyecto.md`, con terminada en `hechos/`; la «línea en el
registro de `_ESTADO.md`» de abajo es del reparto viejo.)
Lee `_COMUN.md` primero.

## Qué hay que hacer

Conectar la IA a la pantalla. Hoy, en el turno de Zargon, el adulto tiene que **activar
cada monstruo y moverlo a mano** desde `src/ui/Juego.tsx`. Después de esta tarea, el turno
de Zargon debe costar **cero clics**: la aplicación decide, tira sus dados, lo cuenta en el
diario, y el adulto solo mueve la miniatura sobre el tablero de cartón.

## El detalle que decide si esto sirve

**La gente tiene que poder seguir lo que pasa.** Si la app resuelve el turno entero de seis
monstruos de golpe, nadie sabe qué acaba de ocurrir en la mesa y hay que reconstruirlo
leyendo el diario hacia atrás.

Cada monstruo tiene que anunciarse antes de actuar y dejar tiempo a mover la figura. Piensa
en el ritmo de la mesa, no en el de la CPU: esto se está jugando con niños y miniaturas de
cartón que hay que empujar con el dedo.

Una pausa entre monstruos, o un «siguiente» que avance de uno en uno, son dos formas
razonables. Pruébalo jugando de verdad antes de darlo por bueno.

## Lo que no se toca

- **El reparto de los dados.** Los héroes siguen tirando los suyos físicos y tecleando el
  resultado; los de los monstruos los tira la aplicación. Eso no cambia.
- **Deshacer** tiene que seguir funcionando durante el turno de Zargon. El «deshacer»
  rehace la partida repitiendo acciones desde el principio: si la IA mete acciones por un
  camino distinto al de `usePartida`, lo rompes. Compruébalo explícitamente.

## Prohibido

- Que la interfaz llame al motor por su cuenta, saltándose `usePartida`. Ese hook es el que
  guarda el historial de acciones, y el historial es lo que sostiene el deshacer.
- Quitar la posibilidad de mover un monstruo a mano. Tiene que seguir ahí para cuando la IA
  haga algo raro en mitad de una partida: con niños en la mesa no se puede parar a depurar.

## Al terminar

Commit en `main` y push. Línea en el registro de `_ESTADO.md`.

Y luego, lo que de verdad cierra la Fase 4: **jugar una misión entera con los niños y
anotar cada vez que la aplicación obligue a un clic que sobra.** Esa lista vale más que
cualquier test.
