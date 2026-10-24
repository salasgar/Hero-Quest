# T84 · La Tempestad no hace nada en una partida real

**Precondición:** ninguna. **No a la vez que T50, T66, T71, T75, T76, T78, T79** si
alguna volviera a estar viva (`reducer.ts`) — hoy todas LISTA o PENDIENTE sin reclamo.
**Banda de modelo:** MEDIO — corrección acotada con test; la regla ya está firmada.
**Duración esperada:** 1 h · **Encadenable con:** T85 (sin ficheros en común salvo
`reducer.ts`: van seguidas, no a la vez).
**Ficheros que toca:** `src/engine/reducer.ts` (`avanzarActor`),
`tests/tempestad-turno.test.ts` (nuevo).
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## El fallo

Lo encontró otra sesión leyendo el código en `main` `07e6d4a`. Lanzar la Tempestad marca
`pierdeTurno` en el monstruo (`lanzarHechizo`, caso `perderTurno`), pero `avanzarActor`
borraba `pierdeTurno` de **todos** los monstruos en cuanto entraba el turno de Zargon, que
es justo el que sigue al del héroe que la lanzó. Resultado: el monstruo actuaba igual y el
hechizo no hacía nada. Los tests de T21 miraban el campo recién lanzado, sin pasar el
turno, y por eso no lo veían.

## La regla en que se basa

`autorizaciones.md`, «La Tempestad envuelve a un solo ser, no a la sala entera (T21)»,
firma de Juan Luis, 2026-09-06: «un pequeño remolino que envuelve a un único ser (monstruo
o héroe) a quien se le lanza y **lo deja un turno sin jugar**». El reglamento de 2021 (p. 14)
remite a la carta del hechizo, que no tenemos; no decide la duración. Un turno = el
siguiente turno de Zargon en el que ese monstruo habría actuado. No se inventa nada: es la
lectura literal de la firma.

## Qué se hizo

`avanzarActor` borra `pierdeTurno` al **salir** del turno de Zargon, no al entrar. Lo del
Sueño (`dormido`) no se toca: su dado de despertar sigue tirándose al entrar Zargon. T78
(`aplicarDano` limpia `dormido` y `pierdeTurno` al morir) no se ve afectada.

## Fuera de alcance, ya firmado y sin hacer

Lanzar la Tempestad sobre un **héroe** (firma de Juan Luis, 2026-09-10) sigue siendo tarea
aparte: `pierdeTurno` no existe en `Heroe`. No se ha tocado.

## Al terminar

El orden de cierre es el de `proyecto.md`.
