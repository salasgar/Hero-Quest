# T40 · Todas las salas del tablero, accesibles en la primera misión

**Precondición:** ninguna.
**Banda de modelo:** MEDIO — es diseño de misión con una comprobación mecánica detrás; lo
que pide criterio es dónde poner cada puerta para que la misión siga siendo corta y ganable.
**Duración esperada:** 2 h · **Encadenable con:** 42 (misma banda, cortas, sin ficheros en
común).
**Ficheros que toca:** `src/data/quests/calabozo.ts` (`PUERTAS_CALABOZO`),
`tests/quest.test.ts`. **No toca `src/data/board-base.ts`** (prohibido en `_COMUN.md`) ni
`reducer.ts`.
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Lo que pidió Juan Luis

El 2026-09-06:

> En la primera misión hay muchas habitaciones que no tienen puerta. Todas deben ser
> accesibles desde algún sitio.

## Medido, no supuesto

Ejecutado el 2026-09-06 sobre `main` (`salaEn` de `board-base.ts` contra
`PUERTAS_CALABOZO`):

```
salas en el mapa: 22 -> a b c d e f g h i j k l m n o p q r s t u v
con puerta en el calabozo: l q r s t
sin puerta: 17 -> a b c d e f g h i j k m n o p u v
```

El calabozo tiene cinco puertas (`ps`, `pt`, `pr`, `pq` y la secreta `psecreta`) y usa
cuatro salas (`s`, `t`, `r`, `q`, con sus seis monstruos). Las otras diecisiete son muros
cerrados: la geometría del tablero las dibuja, la misión no les da entrada.

## Antes de empezar: mira si ya está hecho

Repite la medida de arriba (un script de diez líneas con `vite-node`, como el de
`scripts/`). Si «sin puerta» da 0, está hecha.

## Qué hay que hacer

1. **Una puerta por sala como mínimo**, en `PUERTAS_CALABOZO`. Cada puerta son dos casillas
   `a` y `b` a un lado y otro de un muro (`hayMuroEntre(a, b)` tiene que ser verdad), una de
   sala y otra de pasillo o de otra sala. Elige el muro mirando `MAPA_TABLERO` y
   `NOMBRES_SALAS`, no de memoria: T13 midió que `pq` es la única que no se ve desde la
   escalera, y esa clase de dato sale del mapa.
2. **Algunas pueden ser secretas** (`secreta: true`, `descubierta: false`): es fiel al
   juego y da sentido a buscar puertas secretas. Pero ninguna sala puede depender solo de
   una secreta para que la misión sea ganable: el guardián sigue en la sala que está y su
   camino sigue abierto.
3. **Un test de alcanzabilidad** en `tests/quest.test.ts`: desde la escalera, con todas las
   puertas abiertas (secretas incluidas), se llega a todas las casillas de todas las salas.
   Usa `alcanzables`/`rutaHasta` de `board.ts` con un héroe y sin monstruos en medio, o un
   recorrido propio sobre `pasoAbierto`. Y su mitad negativa: con la lista de puertas
   vieja el test tiene que fallar (17 salas).
4. **Que la misión siga siendo corta.** Más salas accesibles son más sitios donde buscar
   tesoro y más monstruos errantes. No añadas monstruos ni muebles: eso es diseño de
   misión aparte y de banda ALTA. Si al jugar se hace larga, se dice en la terminada.

## Trampas conocidas

- **Una puerta no puede caer sobre un mueble ni sobre una trampa**: `tests/quest.test.ts`
  ya afirma cosas parecidas sobre la entrada; extiéndelo a las puertas.
- **`celdasQueAbren` (T19) da seis casillas por puerta**: una puerta pegada a otra puede
  compartir casillas de apertura. Funciona, pero conviene no ponerlas de dos en dos.
- **`puertasVisibles` decide qué se pinta** (T13): una puerta nueva en una sala sin revelar
  no se ve hasta que alguien la mira. Es lo correcto; no lo «arregles».
- **Los tests de escena de T8 y T9 juegan sobre el calabozo real**: con puertas nuevas,
  Zargon tiene más caminos. Si alguno cambia de resultado, mira si la escena sigue
  probando lo que decía antes de tocar el test.
- **`test de juego al azar` (`integracion.test.ts`)** es el que encuentra los fallos de
  verdad. Si se rompe, la sospecha por defecto es que una puerta está mal puesta.

## Prohibido

- Tocar `board-base.ts` o `board-print.ts`: la geometría está medida sobre la foto e
  impresa.
- Cambiar la entrada (`mision.entrada`), que está firmada dos veces.
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md`. En la terminada, la medida final («sin puerta:
0») y la lista de puertas nuevas con sus casillas.
