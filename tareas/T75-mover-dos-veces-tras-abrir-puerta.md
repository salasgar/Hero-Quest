# T75 · Un héroe puede volver a moverse después de abrir una puerta

**Precondición:** ninguna. **No a la vez que ninguna otra tarea viva sobre `reducer.ts`**
(comprobar el tablón al reclamar: a fecha de escribir esto, T50 y T66 ya no lo tocan, pero
compruébalo de nuevo).
**Banda de modelo:** ALTO — no es un cambio mecánico: la lectura ingenua del síntoma lleva a
un arreglo que **rompería** el paso normal por una puerta (ver «Por qué no es tan simple»
abajo). Hace falta reproducirlo, leer el reglamento y decidir con criterio antes de tocar el
motor.
**Duración esperada:** 2 h · **Encadenable con:** —.
**Ficheros que toca:** `src/engine/reducer.ts` (con toda probabilidad; puede que la solución
sea de pantalla en vez de motor — ver abajo), `tests/reducer.test.ts`.
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Lo que contó Juan Luis

El 2026-09-08:

> Me he dado cuenta de un fallo. Después de mover un héroe sigue habiendo casillas
> destacadas en verde y me deja volverlo a mover. Me deja mover, abrir una puerta y volver a
> mover, todo dentro de un mismo turno. Sin embargo, un héroe sólo se puede mover una vez
> por turno. Puede, por ejemplo, abrir puerta primero y moverse después o moverse primero y
> abrir puerta después. Pero no debería poder moverse dos veces en un mismo turno.

## Lo que está confirmado en el código (medido, no supuesto)

1. **El total de casillas movidas SÍ está bien acotado.** `mover()`
   (`src/engine/reducer.ts:394-524`) resta `gastado` (las casillas realmente recorridas) de
   `turno.movimientoRestante` en cada llamada, y rechaza moverse si
   `movimientoRestante <= 0` (línea 399). Repetir `mover()` varias veces en el mismo turno
   **no deja usar más casillas que las tiradas**: si sacó 10 y ya anduvo 10 en total (en una
   llamada o en varias), la siguiente llamada falla con «No te queda movimiento.» Esto ya
   funciona bien; no es la parte rota.

2. **`abrirPuerta` (líneas 537-559) no toca el estado del turno en absoluto**: no llama a
   `cerrarAccion`, no marca `haActuado`, no marca `movimientoCerrado`. Su propio comentario
   lo dice a propósito: «Abrir una puerta es GRATIS en HeroQuest: no gasta movimiento ni
   consume la acción del turno. Se abre al pasar por delante y se sigue andando.»

3. **Las demás acciones (atacar, buscar tesoro, buscar trampas, desarmar trampa, lanzar
   hechizo, usar poción) sí cierran el movimiento si ya te habías movido**, vía la función
   compartida `cerrarAccion` (línea 619-623):
   ```ts
   const cerrarAccion = (t: EstadoPartida["turno"]) => ({
     ...t,
     haActuado: true,
     movimientoCerrado: t.haMovido,
   });
   ```
   Es decir: el patrón ya implementado es «mover, luego actuar» o «actuar, luego mover»,
   nunca las dos cosas alrededor de una acción real — y funciona porque cada acción real
   pasa por `cerrarAccion`. `abrirPuerta` es la única excepción: no pasa por ahí.

## Por qué no es tan simple: una puerta cerrada bloquea el camino

Antes de tocar nada, entiende esto o el arreglo obvio rompe el juego:
**una puerta cerrada actúa como un muro para el pathing** (`src/engine/board.ts:10-11`,
comentario de `pasoAbierto`: «haya una puerta y esté abierta»). Eso significa que la
secuencia «moverse hasta la puerta → abrirla → seguir andando hacia dentro de la sala» **es
el flujo normal y necesario** para cruzar una puerta cerrada: no hay forma de llegar al otro
lado en una sola llamada a `mover()` porque, hasta que se abre, el camino no existe.

**Si simplemente se hace que `abrirPuerta` cierre el movimiento igual que `cerrarAccion`
(`movimientoCerrado: t.haMovido`)**, un héroe que ya haya andado unos pasos y luego abra una
puerta que tenía delante **se queda sin poder cruzarla**: exactamente el caso más común de
la partida (moverse hacia una puerta cerrada, abrirla, entrar), roto. Eso no es lo que pidió
Juan Luis, y sería peor que el fallo actual.

## Qué hay que averiguar antes de decidir el arreglo

1. **Reproduce el caso exacto que describe Juan Luis.** ¿Ocurre con cualquier apertura de
   puerta después de moverse, o solo cuando la puerta abierta *no* estaba en el camino que
   necesitaba (p. ej., abre una puerta de al lado, ajena a por dónde iba, después de haber
   terminado de moverse a donde quería) y luego se mueve otra vez *en una dirección
   distinta*? Esa distinción importa: pasar por una puerta que sí bloqueaba el camino es
   necesario; abrir una puerta cualquiera y aprovechar para irse por otro lado no lo es.
2. **Lee el reglamento** sobre el movimiento y la apertura de puertas: el PDF de
   `tareas/_COMUN.md` («Trampas del entorno»), páginas 12-13 del libro (página 7 del PDF,
   «las seis acciones del héroe»). Busca si dice algo explícito sobre mover-abrir-mover, o
   si el «se abre al pasar por delante y se sigue andando» del comentario de `abrirPuerta`
   ya es la lectura correcta y lo único que falta acotar es que **no se puede reanudar el
   movimiento después de abrir una puerta que no estaba en el camino que se estaba
   recorriendo**.
3. **Decide si el arreglo es de motor o de pantalla.** Una posibilidad, sin tocar
   `movimientoCerrado`: en `TurnPanel.tsx`/`BoardMirror.tsx`, dejar de ofrecer casillas
   verdes de movimiento (aunque `movimientoRestante > 0`) una vez que el jugador ha hecho
   ya un desplazamiento y no está a un paso de una puerta recién abierta que forme parte de
   la ruta hacia donde iba. Eso es más delicado de acertar en pantalla que en el motor, así
   que probablemente el motor sea el sitio correcto, pero **decide con datos, no a ojo**:
   apunta en la terminada qué reprodujiste y qué dice el reglamento.

## Un camino de arreglo razonable, a validar contra el punto anterior

Si el reglamento confirma que abrir una puerta no debería «reactivar» un movimiento ya
completado salvo que sea la puerta que se estaba cruzando, una forma de distinguirlo sin
romper el paso normal: en `mover()`, cuando la ruta atraviesa una puerta cerrada, ya falla
hoy (`celdaLibre`/`rutaHasta` no encuentran camino). El jugador de hecho **ya tiene que**
parar en la casilla de delante de la puerta, abrirla, y volver a pulsar mover. Si el
problema real es que, tras eso, **también puede alejarse en cualquier otra dirección** (no
solo seguir hacia donde iba), la distinción que hace falta es «¿la casilla de destino de
este segundo `mover()` queda al otro lado de la puerta que se acaba de abrir, en la
continuación lógica del camino?» — y eso es bastante más complejo de acotar bien que un
booleano. **No inventes esta regla si el reglamento no la sostiene** (`_COMUN.md`,
«Prohibido»): si no encuentras una base clara, dilo en la terminada con lo que reprodujiste
y dónde se necesita el criterio de Juan Luis, y para ahí en vez de forzar una solución.

## Antes de empezar: mira si ya está hecho

```sh
grep -n "movimientoCerrado" src/engine/reducer.ts
```

## Trampas conocidas

- **Resuelto el 2026-09-08 sin cambiar ninguna regla** (`s-20260908T221009-8416a271`,
  banda ALTO): el reglamento **no sostiene** que abrir una puerta parta el movimiento.
  P. 11, «On a Hero's Turn»: «you may move and then perform an action, or perform an
  action and then move. You may not, however, move part way, perform an action, and then
  finish your movement». P. 12, «Looking and Opening Doors»: «As a hero, while you are
  moving you may look down a corridor or through an open door. […] On your turn, you may
  move adjacent to a closed door and ask Zargon to open it. […] Opening a door is also not
  one of the six actions. Both looking and opening doors are simply considered to be
  additional things you may do on your turn». Y p. 11: «You do not have to move the entire
  distance indicated by the dice roll». Lo único que parte el movimiento es **una acción**,
  y eso ya lo cierra `movimientoCerrado`. Mover, abrir y seguir andando —hacia la sala o
  hacia otro lado— es **un** movimiento con una puerta en medio, y `movimientoRestante`
  lo acota (reproducido en `tests/reducer.test.ts`, describe «mover, abrir una puerta y
  seguir andando (T75)»). Lo que Juan Luis vio es el reglamento funcionando; si quiere otra
  cosa es una **regla de la casa** que necesita su firma en `autorizaciones.md`, y las
  opciones están en la terminada de `hechos/terminadas/75--s-20260908T221009-8416a271.md`.
- **El arreglo ingenuo rompe el cruce normal de puertas.** Está explicado arriba entero;
  no lo repitas sin leerlo.
- **`movimientoRestante` ya limita el total de casillas correctamente.** No es ahí donde
  está el fallo; no toques esa cuenta.
- **`abrirPuerta` revela salas** (`revelarSala`, dentro de la función): cualquier cambio
  tiene que seguir revelando la sala al abrir, eso no es parte del fallo.

## Tests que hay que añadir

Depende de lo que decidas tras investigar, pero como mínimo:
- Un héroe se mueve hasta una puerta cerrada, la abre, y sigue moviéndose **hacia el mismo
  lado de la puerta que acaba de cruzar**: tiene que seguir pudiendo (no romper el flujo
  normal).
- El caso que describe Juan Luis, tal como lo reproduzcas: comprobado que ya no puede
  moverse en una dirección ajena a la puerta que abrió, tras haberse movido ya antes.

## Prohibido

- Inventarte una regla que el reglamento no sostenga (`tareas/_COMUN.md`, «Prohibido»): si
  no la encuentras, para y dilo, no la fuerces.
- Romper el paso normal por una puerta cerrada (moverse hasta ella, abrirla, entrar).
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md`. En el mensaje de cierre, describe exactamente qué
reprodujiste, qué dice el reglamento (con página) y por qué el arreglo elegido no rompe el
paso normal por una puerta — con un ejemplo de las dos cosas si puedes.
