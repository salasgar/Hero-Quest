# T2 · Los héroes pasan por encima de otros héroes

**Precondición:** ninguna. **Fichero que bloquea:** `src/engine/board.ts`.
Lee `_COMUN.md` primero.

## Antes de empezar: mira si ya está hecho

Pon dos héroes en fila en un test y comprueba si el de detrás puede cruzar al de delante.
O más rápido: si `celdaAtravesable` en `src/engine/board.ts` ya distingue héroe de
monstruo, está hecha.

## Lo que dice el reglamento

Página 12:

> - You cannot pass over monsters, move through walls, or move diagonally.
> - You *may* pass over other heroes.
> - You may only enter rooms through doors.
> - You may not share a square with another hero or with a monster except when you are on
>   the stairs or in a pit trap.

Tres cosas exactas:

1. Un héroe **atraviesa** la casilla de otro héroe mientras se mueve.
2. **No** atraviesa la de un monstruo. Los monstruos siguen taponando.
3. **No puede terminar** encima de nadie. Pasar sí, aterrizar no.

## Dónde encaja

En `src/engine/board.ts` ya existe la maquinaria, porque el hada vuela y el velo de niebla
deja atravesar monstruos:

- `celdaAtravesable(estado, celda, figura)` — si se puede cruzar sin pararse.
- `celdaLibre(estado, celda, salvo?)` — si se puede terminar ahí.
- `vuela(figura)`, `atraviesaFiguras(figura)`.
- `alcanzables()` ya distingue cruzar de aterrizar. **Mira cómo lo hace antes de escribir
  nada**: la pieza que necesitas seguramente ya está.

Deja el comportamiento de los monstruos como está: la regla citada está escrita para los
héroes.

## Trampa conocida, encontrada y no resuelta

Un subagente que empezó esta tarea dejó apuntado esto antes de detenerse, y merece la pena:

> La trampa de bloque hace **retroceder** a la figura a la casilla anterior de su
> recorrido. Con la regla nueva, esa casilla anterior puede estar ocupada por un
> compañero, porque acaba de pasar por encima de él.

Búscalo en `mover()` dentro de `src/engine/reducer.ts`, en la rama `efecto.retrocede`.
Hoy retrocede sin comprobar nada. **Compruébalo y decide qué pasa**, porque dos figuras en
la misma casilla rompen una invariante del test de juego al azar. Escribe en el commit qué
decidiste y por qué.

## Segunda parte: devolver la entrada de la misión a un pasillo de una casilla

**Autorizado por Juan Luis el 22 de agosto de 2026.** Está en `_ESTADO.md`.

La misión «El calabozo del guardián» (`src/data/quests/calabozo.ts`) entra hoy por un
pasillo de **dos** casillas de ancho, columnas 12-13:

```ts
entrada: [c(12, 17), c(13, 17), c(12, 18), c(13, 18)],
```

Eso no fue una decisión de diseño: fue un parche. Con la regla vieja, cuatro héroes en
fila india se taponaban y el primero no podía salir. En cuanto tengas hecha la primera
parte de esta tarea, el parche sobra.

**Hazlo en el mismo commit que la regla**, no antes: si cambias la entrada con la regla
vieja todavía en pie, reproduces el atasco.

### Qué entrada poner

Recomendación: el pasillo de abajo, en fila hacia el oeste.

```ts
entrada: [c(12, 18), c(11, 18), c(10, 18), c(9, 18)],
```

La fila 18 es pasillo de punta a punta y tiene una sola casilla de alto: sala por encima,
borde del tablero por debajo. El primer héroe de la lista es el que va en cabeza.

**No pongas la fila recta por la columna 12** (filas 15 a 18), que es la otra opción
evidente: la casilla **(12,15) es el vano de la puerta `ps`**, y dejarías a un héroe
empezando dentro de la puerta que el grupo tiene que abrir. Compruébalo tú mismo en
`PUERTAS_CALABOZO` antes de decidir otra cosa.

Sea cual sea tu elección, las cuatro casillas tienen que ser pasillo, contiguas y estar
libres de puertas, muebles y trampas. Hay invariantes en `tests/quest.test.ts` que lo
comprueban: déjalas pasar sin tocarlas.

**Esa recomendación está comprobada contra `board-base.ts`** (sesión `47e1fced`,
2026-08-22), no supuesta. Las cuatro casillas dan `esPasillo` verdadero y `salaEn` nulo,
y `hayMuroEntre` es falso en los tres tramos, así que la fila es contigua de verdad.
Ninguna coincide con puerta, mueble ni trampa de la misión: la puerta `pr` está en la
columna 6, y las trampas en (12,14), (15,16) y (7,15).

De paso quedó confirmado por qué la columna 12 no vale como fila recta: (12,15) es
pasillo, sí, pero es el vano de `ps`, como dice el aviso de arriba.

### Los tests que hablan de la entrada, uno por uno

Todos en `tests/integracion.test.ts`. No los busques a ciegas:

- **«los cuatro héroes entran en un pasillo de dos de ancho y no se hacen tapón»**
  (~línea 60). Su premisa se invierte entera. Ya no hay que demostrar que la entrada es
  ancha, sino que **en fila india el de detrás puede pasar por encima del de delante**.
  Reescríbelo con ese sentido y cambia también el comentario, que explica el motivo viejo.
- **`expect(e.heroes[0]!.celda).toEqual({ x: 12, y: 17 })`** (~línea 69). La casilla de
  salida cambia.
- **El movimiento hasta `{ x: 12, y: 15 }`** y su `expect(...movimientoRestante).toBe(4)`
  (~líneas 72-73). Desde la entrada nueva la distancia es otra: **recalcula el número, no
  lo ajustes hasta que pase.** Si no te sale a mano, tienes mal el camino.
  La cuenta, para que puedas contrastarla en vez de fiarte: con la entrada recomendada el
  primer héroe sale de (12,18) y sube por la columna 12, o sea (12,17), (12,16) y (12,15),
  **tres** casillas donde antes eran dos. Con `[3, 3]` el total es 6 y sin lastre, así que
  el resto esperado pasa de 4 a **3**. Si te sale otro número, no des por buena esta línea:
  la escribió una sesión que soltó la tarea sin llegar a ejecutar la suite con la entrada
  cambiada.
- **El test del foso** (~línea 101), que mueve hacia `{ x: 12, y: 13 }` y comprueba que el
  héroe se queda en el foso de `(12, 14)`. La distancia cambia; el desenlace no: son
  cuatro pasos en vez de tres, y el foso sigue cortando el movimiento en (12,14). Los 12
  puntos de `[6, 6]` sobran en los dos casos, que es justo por lo que el desenlace aguanta.

### Medido por otra sesión, y verificado por ella

La sesión `47e1fced` llevó T2 y la soltó sin escribir código, pero dejó esto comprobado el
2026-08-22. Está aquí para que no lo midas dos veces, no para que lo copies:

- **La entrada recomendada de arriba es válida.** Las cuatro casillas
  `[(12,18), (11,18), (10,18), (9,18)]` son pasillo, contiguas, sin muros entre ellas y sin
  puerta, mueble ni trampa encima. Pasa las invariantes de `tests/quest.test.ts`.
- **`heroes[0]` sale en `(12,18)`**, no en `(12,17)`.
- **De `(12,18)` a `(12,15)` hay 3 casillas**, así que con la tirada `[3, 3]` el
  `movimientoRestante` esperado de la línea ~73 pasa de **4 a 3**.
- **El test del foso sigue acabando en `(12,14)`**, pero el héroe llega tras **4 pasos** en
  vez de 3. El desenlace no cambia; la distancia sí.

Sigue en pie la regla de la sección anterior: **deriva tú los números y comprueba que te
salen**. Si el tuyo no coincide con el de aquí, manda el tuyo, pero averigua por qué
difieren antes de seguir: uno de los dos caminos está mal trazado.

### Qué NO cambia

El foso de `(12, 14)`, la puerta `ps` y los goblins siguen donde están. Esto es un cambio
de dónde empiezan los héroes, no un rediseño de la misión.

## Tests que hay que añadir

- Un héroe cruza a otro héroe y llega más allá.
- No puede pararse encima de él.
- Un monstruo en medio sigue taponando a un héroe.
- Un monstruo no cruza a un héroe.

## Prohibido

- Mover monstruos, trampas, puertas o mobiliario de la misión. Solo cambia `entrada`.
- Cambiar la entrada **antes** que la regla, o en un commit distinto.
- Dejar que alguien termine el movimiento encima de otra figura, ni siquiera «por un
  momento».
- Ajustar un número esperado en un test hasta que pase. Si no sabes por qué sale ese
  número, no has entendido el cambio.

## Al terminar

Commit en `main` y push, con las dos partes juntas. Línea en el registro de `_ESTADO.md`
diciendo qué entrada elegiste y por qué.
