# T76 · Un personaje solo se mueve una vez por turno (regla de la casa)

**Precondición:** la firma de Juan Luis en `autorizaciones.md` («Un personaje solo se mueve
una vez por turno; abrir una puerta remata el movimiento»). Sin esa línea firmada, esta tarea
está BLOQUEADA: es una regla de la casa que **contradice la lectura del reglamento** que
fijó T75, y `tareas/_COMUN.md` prohíbe inventar reglas. **No a la vez que ninguna otra
tarea viva sobre `reducer.ts`** (50, 71).
**Banda de modelo:** ALTO — cambia una regla del motor que doce ficheros de tests dan por
sentada, y hay que distinguir con honestidad qué test afirmaba la regla vieja y cuál
detecta un fallo nuevo (`_COMUN.md`, «Trampas del código»).
**Duración esperada:** 1,5 h · **Encadenable con:** —.
**Ficheros que toca:** `src/engine/reducer.ts`, `src/engine/types.ts` (solo el comentario de
`Turno`), `tests/reducer.test.ts`, y `tests/integracion.test.ts` si el juego al azar lo
necesita.
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## De dónde sale

T75 (`hechos/terminadas/75--s-20260908T221009-8416a271.md`) reprodujo lo que Juan Luis vio
jugando el 2026-09-08 —mover, abrir una puerta y volver a mover en el mismo turno— y
concluyó que el reglamento de 2021 lo permite: abrir una puerta no es acción y se hace
«while you are moving» (p. 12), y lo único que parte el movimiento es una acción (p. 11).
Juan Luis lo leyó y **reafirmó su regla** el 2026-09-09: «cualquier personaje (héroe o
monstruo) solamente se puede mover una vez dentro de su turno». Preguntado por el caso
más común (un héroe llega andando a una puerta cerrada y la abre), eligió la lectura
literal: **las casillas que le quedaban se pierden; entra al turno siguiente**. Para entrar
en una sala el mismo turno hay que empezar pegado a su puerta, abrirla y moverse después.
Descartó las otras dos opciones (seguir solo a través de esa puerta; que la ruta atraviese
puertas cerradas y las abra al pasar).

## Qué hay que hacer

1. **Una llamada a `mover()` por turno y por figura.** Tras un `mover` que haya recorrido al
   menos una casilla, el movimiento de esa figura se acaba: `movimientoRestante` pasa a 0
   (lo que sobraba se pierde, y la pantalla lo enseña así en «N de M») y un segundo `mover`
   se rechaza con un motivo que diga la regla de la casa («Ya te has movido este turno: un
   personaje solo se mueve una vez»), comprobado **antes** que «No te queda movimiento»
   para que el jugador entienda por qué. `haMovido` ya existe y ya se pone a `true`: la
   guarda es sobre él.
2. **Vale para héroes y monstruos**: `activarMonstruo` pone `haMovido: false` por monstruo,
   así que cada monstruo tiene su propio movimiento único. Comprueba que ningún generador
   de acciones (`src/ai/zargon.ts`, `scripts/simular.ts`, `accionesPosibles` de
   `tests/integracion.test.ts`) mueva dos veces al mismo actor: todos van por
   `casillasDeMovimiento`, que ya devuelve vacío con `movimientoRestante <= 0`. No hace
   falta tocar `selectors.ts`.
3. **Las puertas siguen siendo gratis** (`abrirPuerta` no se toca): abrir primero y moverse
   después vale; moverse primero y abrir después vale; lo que no vale es moverse otra vez
   tras abrir. `movimientoCerrado` (mover-acción-mover, reglamento p. 11) se queda como está;
   esta regla es más estricta y se apoya en `haMovido`.
4. **Tests.** Los de T75 en `tests/reducer.test.ts` («mover, abrir una puerta y seguir andando
   (T75)») afirmaban la regla del libro y ahora **se corrigen a propósito**, diciéndolo en
   el commit: el cruce en dos pasos se rechaza, el caso de Juan Luis se rechaza, y sigue
   valiendo abrir-y-entrar desde la casilla de al lado. «El movimiento gastado se descuenta»
   pasa a «el movimiento sobrante se pierde». Cualquier otro test que mueva dos veces al
   mismo actor en un turno se revisa uno a uno: si afirmaba la regla vieja se corrige y se
   dice; si falla por otra cosa es un fallo tuyo.
5. **Cita en el código**: el comentario de la guarda nombra la firma de `autorizaciones.md`
   y la fecha, y deja dicho que el reglamento (p. 12) lo permitía; que quien lo lea dentro
   de un año sepa que fue una decisión y no un descuido.

## Antes de empezar: mira si ya está hecho

```sh
grep -n "solo se mueve una vez" src/engine/reducer.ts
```

## Trampas conocidas

- **`movimientoRestante = 0` sin más no basta**: el mensaje sería «No te queda movimiento»,
  que es mentira cuando sobraban cinco casillas. Por eso la guarda sobre `haMovido` va
  primero.
- **Las trampas que hacen retroceder (`retrocede`) y los saltos fallidos** ya cierran el
  turno o devuelven al héroe: con la regla nueva el héroe tampoco vuelve a moverse después,
  que es lo mismo que antes cuando `turnoAcabado` era `true`. No hay que tocar ese bloque.
- **El simulador (`scripts/simular.ts`) es de T73, en curso**: no se edita. Va por
  `casillasDeMovimiento`, así que no debería ofrecer un segundo movimiento; si lo hace, se
  anota en la terminada y se avisa a T73, no se arregla desde aquí.
- **T75 queda como está**: su terminada y su comentario en `abrirPuerta` son la lectura del
  libro y siguen siendo verdad; esta tarea añade la regla de la casa encima y lo dice en
  el mismo comentario.

Aprendido al cerrarla (sesión `s-20260910T094424-d923ffa6`, 2026-09-10):

- **Hecha, por relevo.** El código lo preparó la sesión de la T75 antes de la firma
  (`d0a1fed`, rama `origin/worktree-t75-puerta-mover`, sin fusionar); la sesión que la cerró
  lo verificó sobre `origin/main` y lo heredó como cherry-pick. La terminada
  (`hechos/terminadas/76--s-20260910T094424-d923ffa6.md`) lleva la lista de tests corregidos.
- **La firma de la regla de la casa se escribió a mano el 2026-09-10** en el árbol
  principal y en ese momento no estaba comiteada: una sesión que compruebe la firma solo
  en `origin/main` la verá vacía hasta que Juan Luis la empuje. La señal es el fichero en
  disco, no el tablón ni git.
- **Se hizo en paralelo con la 50 sobre `reducer.ts`**, contra lo que dice esta ficha,
  por decisión explícita de Juan Luis en conversación (incidencia
  `hechos/incidencias/s-20260910T094424-d923ffa6.md`). Si la 50 rebasa sobre esto: la guarda
  de `haMovido` va **antes** de «No te queda movimiento» y `movimientoRestante` queda a 0
  al final de `mover()` siempre, no solo con `turnoAcabado`.
- **Ningún generador de acciones mueve dos veces**: `destinos` de `zargon.ts` devuelve
  vacío con `movimientoRestante <= 0` y además simula cada destino por el motor;
  `casillasDeMovimiento` (simulador y juego al azar) también. No hubo que avisar a T73.

## Prohibido

- Implementarla sin la firma en `autorizaciones.md` (`_COMUN.md`, «Prohibido»).
- Tocar `abrirPuerta` (sigue siendo gratis) ni `movimientoCerrado` (es otra regla, la del libro).
- Editar `scripts/simular.ts` (T73 en curso) ni `selectors.ts` (no hace falta).
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md`. En la terminada, la lista exacta de tests que
se corrigieron por afirmar la regla vieja, y el recuento antes y después.
