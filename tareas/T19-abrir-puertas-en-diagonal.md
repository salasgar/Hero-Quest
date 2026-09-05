# T19 · Una puerta se abre también desde la diagonal

**Precondición:** ninguna de reglas. Pero toca `reducer.ts` y `selectors.ts`, que son el
cuello del reparto: mira en `_ESTADO.md` quién los tiene reservados antes de empezar.
**Banda de modelo:** MEDIO — el cambio son dos condiciones, pero la geometría de «compartir
un vértice» no es la que parece y equivocarse abre salas desde el otro lado de un muro.
**Ficheros que bloquea:** `src/engine/board.ts` (la función nueva),
**`src/engine/reducer.ts`**, `src/engine/selectors.ts`, `tests/`.
Lee `_COMUN.md` primero.

## Lo que pidió Juan Luis

El 5 de septiembre de 2026: «Una puerta debería poder abrirse también desde una casilla
adyacente en diagonal —es decir, una casilla que comparta un vértice con la puerta— y no
solamente desde una casilla que comparte un lado con la puerta.»

Es **regla de la casa**, no reglamento: en HeroQuest la puerta se abre desde el vano. Va
escrito aquí para que nadie la «corrija» dentro de tres semanas creyendo que es un fallo.

## Antes de empezar: mira si ya está hecho

```sh
grep -n "pegado" src/engine/reducer.ts; grep -n "mismaCelda(p.a" src/engine/selectors.ts
```

Si las dos siguen comparando la casilla de la figura con `p.a` y `p.b` y nada más, está
pendiente.

## Dónde está la regla hoy, y por qué son dos sitios

Está escrita **dos veces**, y las dos tienen que cambiar en el mismo commit:

- [`reducer.ts:454`](../src/engine/reducer.ts#L454) — la guarda de `abrirPuerta`:
  `const pegado = mismaCelda(puerta.a, f.celda) || mismaCelda(puerta.b, f.celda);`
- [`selectors.ts:60-69`](../src/engine/selectors.ts#L60) — `puertasAlAlcance`, que es lo que
  decide si la pantalla pinta el botón «Abrir puerta» y qué hace la tecla `P`.

Si cambias solo el selector, sale un botón que el motor rechaza. Si cambias solo el motor,
la regla nueva existe pero nadie la ve. **La forma de que no vuelvan a separarse es sacar la
condición a una función y llamarla desde los dos**, no copiarla.

## La geometría: qué casillas comparten un vértice con la puerta

Aquí está la única trampa de la tarea. Una puerta no es una casilla: es el **lado** que
separa sus dos casillas, `a` y `b`, que siempre son ortogonales entre sí (`types.ts:88`:
«las dos casillas adyacentes que une, de regiones distintas»). Ese lado tiene dos extremos,
y las casillas que tocan alguno de los dos son **seis**: `a`, `b` y cuatro más.

Con la puerta `ps`, que es `(12,15)-(11,15)` —horizontal—, las cuatro nuevas son
`(12,14)`, `(12,16)`, `(11,14)` y `(11,16)`.

En general, siendo `d` el vector unitario **perpendicular** a `b − a`: `a+d`, `a−d`,
`b+d`, `b−d`.

**Lo que NO entra, y es el error fácil:** las ocho vecinas de `a` más las ocho de `b`. Las
diagonales «de fuera» —`(13,14)` y `(13,16)` para `ps`— tocan un vértice de la casilla `a`,
pero **no tocan la puerta**. Y las casillas en línea con la puerta —`(13,15)`, `(10,15)`—
comparten un lado con `a` o `b` y tampoco tocan el vano. Si tu función devuelve más de seis
casillas, está mal.

## La decisión firmada: no se abre a través de un muro

Preguntado a Juan Luis el 5 de septiembre de 2026 y respondido: **la casilla diagonal vale
solo si está del mismo lado**, es decir, si está en la misma región —sala o pasillo— que la
casilla del vano a la que flanquea. Nadie abre una puerta metiendo el brazo por dentro de la
pared, y sin esta condición un héroe podría abrir una sala desde el pasillo de al lado sin
haber llegado a la puerta.

La comprobación ya existe y no hay que inventarla: `hayMuroEntre(a, b)`, exportada en
[`board-base.ts:105`](../src/data/board-base.ts#L105). La diagonal `p` vale para la casilla
del vano `c` si `!hayMuroEntre(p, c)`.

**No uses `pasoAbierto`**: además del muro mira si hay puerta y si está abierta, y aquí la
puerta que se quiere abrir está cerrada por definición. Se colaría un `false` que deja la
regla nueva sin efecto y con los tests en verde por el motivo equivocado.

### Ya hay una regla diagonal en el código: mírala antes

El bastón y la lanza **atacan en diagonal**, y eso está resuelto en
[`combat.ts:93`](../src/engine/combat.ts#L93), `alcanzaEnDiagonal`. Allí el «¿hay algo en
medio?» se resuelve con `puedeVer`, no con `hayMuroEntre`. Las dos reglas no tienen por qué
usar la misma comprobación —una mira si ves a quien atacas, la otra si puedes alcanzar la
puerta—, pero **elige a sabiendas y déjalo escrito**: si dentro de un mes las dos diagonales
del juego se comportan distinto sin motivo apuntado, alguien las «arreglará» hasta romper
una. Con `puedeVer` hay además una trampa conocida (T14): dentro de una sala revelada da por
visto todo sin trazar rectas.

## Cómo hacerlo

- **Una función pura en `board.ts`**, del estilo `celdasQueAbren(estado, puerta): Celda[]`,
  que devuelve `a`, `b` y las diagonales que pasen el filtro del muro. Va en `board.ts`
  porque ahí viven `hayMuroEntre` y compañía, y porque `selectors.ts` ya importa de ahí.
- **`abrirPuerta` y `puertasAlAlcance` la consumen.** Ninguna de las dos vuelve a escribir la
  condición.
- **El mensaje de fallo cambia.** «Tienes que estar junto a la puerta para abrirla» sigue
  valiendo, pero ahora «junto» incluye la diagonal: si lo tocas, que siga siendo una frase
  que un niño entienda en la mesa.
- **Abrir sigue siendo gratis** y **la figura no se mueve**: se abre desde donde está. No
  aproveches para meterla en el vano.
- **Vale para quien esté activo, héroe o monstruo.** `abrirPuerta` usa `figuraActiva`, así
  que la regla nueva se la aplica también a los monstruos de Zargon. Es coherente y no hay
  que impedirlo, pero **déjalo escrito en el registro**: T8 va a consumir `puertasAlAlcance`
  para decidir caminos y tiene que saber que el alcance de una puerta son seis casillas.

## Trampas conocidas

- **Revelar la sala desde la diagonal.** `abrirPuerta` llama a `salasDeLaPuerta` y enciende
  las dos regiones. Con la regla nueva, quien abre puede estar en una casilla desde la que
  no ve el interior. Es lo que pidió Juan Luis y no hay que impedirlo, pero compruébalo:
  con T13 ya en `main`, una sala revelada pone sus monstruos en `monstruosEnTablero`
  (T18) y eso cambia el turno de Zargon.
- **Puertas secretas.** La guarda `secreta && !descubierta` se queda **antes** que la de la
  distancia y no la toques: una puerta secreta sin descubrir es muro, y desde la diagonal
  también.
- **Los tests de integración cuentan casillas.** T2 dejó dos comprobaciones que dependen de
  cuánto movimiento gasta el bárbaro hasta la puerta `ps`. Con esta regla puede que abra una
  casilla antes; si algún número cambia, **cámbialo entendiendo por qué**, no hasta que pase.

## Tests que hay que añadir

En un fichero propio, `tests/puertas-en-diagonal.test.ts`:

- Las seis casillas de `ps`, una a una: el motor acepta `abrirPuerta` desde las cuatro
  diagonales, además de las dos del vano.
- Desde `(13,14)` —diagonal de `a`, pero no toca la puerta— el motor **rechaza**.
- Desde una diagonal separada por un muro de su casilla del vano, el motor **rechaza**.
  Búscala midiendo sobre `board-base.ts`, no de memoria; si en el calabozo no existe ese
  caso para ninguna de las cinco puertas, dilo en el registro en vez de inventar un tablero.
- **El selector y el motor no divergen**: para toda casilla del tablero, poniendo ahí al
  héroe, `puertasAlAlcance` incluye la puerta si y solo si `abrirPuerta` devuelve `ok`. Es
  el test que impide que dentro de un mes vuelvan a estar escritas dos veces distintas.
- Y la receta de T1: **comprueba que tus tests prueban algo** volviendo a la condición vieja.
  Si con `mismaCelda(a) || mismaCelda(b)` siguen pasando todos, no valen.

## Prohibido

- Copiar la condición en un tercer sitio.
- Aceptar las ocho vecinas de `a` y `b`: eso no es «compartir un vértice con la puerta».
- Mover a la figura al abrir.
- Tocar la geometría del tablero (regla 4 de `_ESTADO.md`).

## Al terminar

Commit en `main`, push y línea en el registro de `_ESTADO.md` diciendo **cuáles son las seis
casillas y qué pasa con el muro**, que es lo que va a preguntar quien lea el código dentro de
un mes. Si algún número de los tests de integración ha cambiado, di cuál y por qué.
