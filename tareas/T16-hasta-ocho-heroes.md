# T16 · Hasta ocho héroes, y repetir clase

**Precondición:** ninguna, pero **antes de escribir código hace falta una decisión de Juan
Luis** sobre la entrada (abajo, y anotada en `_ESTADO.md`).
**Banda de modelo:** ALTO — no por el código, que es corto, sino porque choca de frente con
una autorización ya firmada y hay que resolver ese choque, no rodearlo.
**Ficheros que bloquea:** `src/ui/EleccionDeHeroes.tsx`, `src/engine/partida.ts`,
`src/data/quests/calabozo.ts`, `tests/quest.test.ts`, `tests/integracion.test.ts`.
Ojo: `partida.ts` lo toca también **T13**, y `calabozo.ts` lo tocan **T2** y **T15**.
Lee `_COMUN.md` primero.

## Lo que pidió Juan Luis

El 5 de septiembre de 2026: que se puedan elegir **hasta ocho** héroes y que se pueda
llevar **varios de la misma clase** —dos magos, dos elfas— en el mismo grupo.

## Antes de empezar: mira si ya está hecho

```sh
grep -n "MAXIMO" src/ui/EleccionDeHeroes.tsx
```

Si dice `= 4`, está pendiente.

## Lo que hay que cambiar, y en qué orden

Hay una parte fácil y una que muerde. Haz la que muerde primero, o construirás una pantalla
que produce partidas ilegales.

### 1. La que muerde: dónde se ponen ocho héroes

`crearPartida` los coloca así (`partida.ts:73`):

```ts
celda: op.mision.entrada[i % op.mision.entrada.length]!,
```

«El calabozo del guardián» tiene **cuatro** casillas de entrada —(12,17), (13,17), (12,18),
(13,18)—. Con ocho héroes, ese `%` los **apila de dos en dos**. Comprobado ejecutándolo:

```
barbaro@12,17 | enano@13,17 | elfo@12,18 | mago@13,18 | hada@12,17 | mago2@13,17 | elfo2@12,18 | barbaro2@13,18
casillas distintas: 4 de 8
```

Eso no es una colocación apretada: es un **estado ilegal desde el turno cero**. En este
motor no hay dos figuras en una casilla —`figuraEn` devuelve la primera que encuentra y
`celdaLibre` lo prohíbe—, así que a partir de ahí el movimiento, la línea de visión y los
ataques razonan sobre un tablero que no existe.

Y hay una segunda razón para no dejarlo pasar: **`mision.entrada` no es solo el punto de
salida**. `reducer.ts:145` la usa para decidir el objetivo «salir»: la misión se gana cuando
todos los héroes vivos están en una casilla de entrada. Si hay ocho héroes y cuatro
casillas, esa victoria se vuelve **imposible de conseguir**, no difícil.

**Dos cosas distintas que hay que resolver, y conviene no confundirlas:**

- **`crearPartida` no debe apilar nunca**, ni siquiera si la misión trae pocas casillas.
  Si no caben, que falle de forma visible o que los reparta por las casillas libres de
  alrededor —decídelo tú—, pero **no en silencio**.
- **Cuántas casillas de entrada tiene la misión** es una decisión de tablero, y esa no es
  tuya. Va abajo.

### 2. La decisión que es de Juan Luis, y por qué hay que preguntarle

En `_ESTADO.md` hay una autorización firmada el 22 de agosto de 2026:

> **La entrada de «El calabozo del guardián» vuelve a un pasillo de una casilla de ancho.**
> Está en uno de dos (columnas 12-13) solo porque con la regla vieja los cuatro héroes se
> taponaban; era un parche, no diseño. **Se hace dentro de T2 y en el mismo commit que la
> regla.**

Es decir: **T2 va a estrechar la entrada a una casilla de ancho justo cuando esta tarea
necesita el doble de sitio.** Las dos cosas no caben a la vez y las dos están pedidas por
él. Esto no se arregla eligiendo por tu cuenta cuál de las dos gana.

Lo que hay que preguntarle está escrito en «Pendientes de su palabra» de `_ESTADO.md`.
En corto: si ocho héroes entran por un pasillo de una casilla en fila india —posible en
cuanto T2 deje pasar por encima de un compañero, que es exactamente lo que T2 hace—, o si
la entrada crece, o si el tope de ocho es para misiones futuras y el calabozo se queda con
cuatro.

**Mientras eso no esté firmado, se puede hacer todo lo demás**: la pantalla de elección, el
que `crearPartida` no apile, y los tests. Lo que no se puede es tocar `calabozo.ts`.

### 3. La parte fácil: la pantalla

En `src/ui/EleccionDeHeroes.tsx`:

- `const MAXIMO = 4` pasa a 8.
- **`alternar(clase, genero)` hoy funciona como un interruptor**: si la variante ya está en
  el grupo, la quita. Con repetidos eso deja de tener sentido —pulsar «Mago» por segunda vez
  tiene que añadir un segundo mago, no quitar el primero—. Hacen falta un «añadir» y un
  «quitar este de aquí» separados; el botón «quitar» de cada fila del grupo ya existe y es
  el que se queda con esa función.
- **`claveDe(clase, genero)` deja de valer como `key` de React** en la lista del grupo: con
  dos magos hay dos claves iguales y React se lía al reordenar. Cada elección necesita un
  identificador propio.
- `elegida(clase, genero)` y la clase `ficha-sel` pasan de «sí/no» a «cuántos llevas». Una
  ficha con «×2» dice más que una marca.
- Ocho hojas de personaje en la barra lateral de `Juego.tsx` es el doble de alto. Míralo en
  pantalla antes de darlo por bueno; **no toques `estilos.css`**, que lo tiene reclamado la
  sesión `6f2f1053` según el tablón. Si hace falta CSS, déjalo escrito en `_ESTADO.md`.

## Lo que ya funciona y no hay que tocar

`crearPartida` **ya sabe repetir clases**: lleva la cuenta y el segundo mago sale con id
`mago2`. Está comprobado con los ocho de arriba. No lo reescribas.

## Trampas conocidas

- **El turno crece.** `turno.orden` son los héroes y luego Zargon; con ocho, entre dos
  turnos de un mismo héroe pasan ocho más. Eso cambia el ritmo de la partida en la mesa,
  pero no el código. Dilo en el registro.
- **`tests/quest.test.ts` afirma cosas sobre `entrada`**: que todas sus casillas son
  pasillo, que ningún mueble ni trampa cae encima. Si la entrada crece, esos tests hay que
  volver a pasarlos, no volverlos a escribir para que pasen.
- **`tests/integracion.test.ts:63`** comprueba que la entrada tiene más de una columna,
  con el comentario «Si la entrada fuera un pasillo de una casilla, el primero no podría
  salir». Ese test y la autorización de T2 se contradicen entre sí desde hace dos semanas;
  quien resuelva la decisión del punto 2 tiene que dejar los dos de acuerdo.
- **El test de juego al azar** va a jugar partidas con el grupo que le des. Pásale ocho
  héroes al menos una vez: es la forma más barata de descubrir que algo asumía cuatro.

## Tests que hay que añadir

- Ocho héroes salen en **ocho casillas distintas**. Es el test de la captura de este fallo.
- Dos magos en el mismo grupo tienen ids distintos y hechizos independientes: gastar uno del
  primero no se lo quita al segundo.
- Un grupo de un solo héroe sigue funcionando (hoy se permite y no debe romperse).
- Si la misión trae menos casillas de entrada que héroes, la partida no se crea en silencio
  con figuras apiladas.
- La prueba de T1: revierte `partida.ts` y comprueba que el test de las ocho casillas falla.

## Prohibido

- **Subir `MAXIMO` a 8 sin arreglar la colocación.** Deja el juego en un estado ilegal desde
  el primer turno y el síntoma aparece tres acciones después, donde nadie lo relaciona.
- **Tocar `calabozo.ts` antes de que la decisión del punto 2 esté firmada en `_ESTADO.md`**,
  ni cambiar la autorización de T2 por tu cuenta.
- Tocar `src/data/board-base.ts` ni `board-print.ts` para hacer sitio: el tablero está
  impreso y pegado.

## Al terminar

Commit en `main` y push. Línea en el registro de `_ESTADO.md` con lo que se decidió sobre la
entrada y qué hace `crearPartida` cuando no caben. Y **avisa de cuántas figuras de héroe hay
que construir en cartón**: si el tope es ocho y en la caja hay cuatro, la mitad del grupo no
tiene miniatura.
