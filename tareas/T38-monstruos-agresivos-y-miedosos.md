# T38 · Monstruos agresivos, miedosos y prudentes: la huida

**Precondición:** T42 LISTA (comparten `types.ts` y `partida.ts`; y un monstruo que huye
tiene que tener nombre en el diario, o no se sabe cuál huyó). La parte de **verlo
despacio en la mesa es T11**, no esta: aquí se decide qué hace el monstruo, no a qué ritmo
se enseña.
**Banda de modelo:** ALTO — añade a la IA un comportamiento que hoy no existe (retirarse),
cambia lo que hacen los monstruos delante de los niños y hay que medirlo con el simulador
para no romper el 100 % de la primera misión, que Juan Luis dio por bueno el 2026-09-06.
**Duración esperada:** 4 h · **Encadenable con:** —.
**Ficheros que toca:** `src/ai/zargon.ts`, `src/ai/targeting.ts`, `src/ai/personalities.ts`,
`src/ai/difficulty.ts`, `src/engine/types.ts` (un campo en `Monstruo`),
`src/engine/partida.ts` (asignar el temperamento al crear la partida), `scripts/simular.ts`
(medir), `tests/`. **No toca `reducer.ts`**: huir es mover, y mover ya es legal.
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre. Y lee el
registro de T8, T9 y T10 en `_ESTADO-antiguo-2026-09-06.md`: los pesos, la miopía del
torpe y el «pega y se va» que ya se arregló una vez.

## Lo que pidió Juan Luis

El 2026-09-06:

> Los monstruos deberían estar manejados por el máster o tomar decisiones de forma
> autónoma. Sugerencia: puede haber orcos más agresivos y orcos más miedosos. Unos atacarán
> siempre al héroe más cercano. Otros huirán siempre que puedan (y atacarán si no pueden
> huir). Y otros huirán o atacarán en función de la situación (si hay muchos héroes cerca,
> intentarán huir y si hay pocos, atacarán). Y lo mismo para otros tipos de monstruos. Los
> movimientos y los ataques de los monstruos deben aparecer en la pantalla lo
> suficientemente lentos como para que yo los pueda ver.

Dos cosas separadas: **que decidan solos** (T8, T9 y esta) y **que se vea** (T11).

## Lo que hay hoy, medido

- `siguienteAccionDelMonstruo` (`zargon.ts`) puntúa casillas por `Pesos` (`targeting.ts`:
  `danoEsperado`, `remate`, `heridoPrimero`, `lanzaHechizos`, `porCasillaDeDistancia`,
  `descuentoPorNoLlegar`). **No hay ningún peso que valore alejarse**: la casilla donde ya
  está puntúa (arreglo de `29e878b`) y moverse exige superarla, pero irse lejos del héroe
  nunca gana.
- `Personalidad` (`personalities.ts`) es un nombre y **multiplicadores** sobre esos pesos,
  **por especie**. Un «goblin cobarde» hoy es un goblin que valora menos el daño; no huye.
- `Monstruo` (`types.ts`) no tiene temperamento: dos orcos son iguales.
- `npm run sim` (T10) juega 100 partidas y saca el porcentaje de victorias y el «pega y
  se va» por tirada. Hoy los tres niveles dan 100 % en el calabozo, y eso está firmado como
  correcto: la dificultad se diseña por misión.

## Antes de empezar: mira si ya está hecho

```sh
grep -n 'temperamento\|huir\|huida' src/ai/*.ts src/engine/types.ts
```

## Qué hay que hacer

1. **Un temperamento por monstruo**, no solo por especie: `Monstruo.temperamento:
   "agresivo" | "miedoso" | "prudente"`. Se asigna en `crearPartida` con el generador del
   estado (o lo declara la misión si quiere un jefe fijo), **después** de todo lo que ya
   consume el generador, para que los tests con semilla no cambien de resultado; T42 hace
   lo mismo con los nombres y conviene compartir el mecanismo. Cada especie lleva su
   reparto de probabilidades en `personalities.ts` (los no muertos, casi todos agresivos:
   un esqueleto no tiene miedo; los goblins, muchos miedosos).
2. **La huida como opción de la puntuación**, no como excepción: un peso `distanciaDeLosHeroes`
   que valore las casillas lejos de los héroes, con signo según el temperamento. El
   miedoso huye si tiene por dónde y ataca si está acorralado (no hay casilla que lo aleje):
   eso sale solo si acorralado significa que atacar es lo que más puntúa. El prudente
   cuenta héroes a N casillas y decide (dos o menos, ataca; más, huye). El agresivo va a por
   el más cercano, que es casi lo que hace `astuto` hoy.
3. **Medirlo antes de darlo por bueno**: `npm run sim` con los tres temperamentos
   repartidos y con cada uno forzado. Lo que se busca: que el porcentaje de victorias del
   calabozo no baje del 100 % (firmado), que el «pega y se va» no vuelva a subir, y que un
   monstruo miedoso no se pase la partida corriendo por el pasillo sin que nadie lo alcance
   (mide cuántos turnos seguidos huye). Los números van a la terminada.
4. `motivoDeLaJugada` tiene que saber decirlo: «el goblin huye: hay tres héroes cerca».
   Es lo que la pantalla enseña y lo que Juan Luis lee para saber si la IA está bien.

## Trampas conocidas

- **`distancia()` no sirve para apuntar** (T8): mide hasta casilla libre. Para «lejos de
  los héroes» vale una distancia geométrica; para «puedo pegarle» sigue siendo
  `pasosParaAtacar`.
- **El torpe es miope por estructura** (T9): si ya pega a alguien, no se recoloca. Un
  miedoso torpe tiene que poder huir igualmente, o el nivel torpe se queda sin miedosos.
- **Zargon solo mueve monstruos descubiertos** (T18, `monstruosEnTablero`). Un monstruo que
  huye a una sala sin revelar sigue en el tablero: comprueba que no desaparece de la vista
  ni de la cuenta.
- **El simulador mide por `accionDeZargon`** (`4a68069`). Si el temperamento entra por otra
  vía, el simulador no lo verá y medirás otra cosa.
- **La receta de T1**: cada test nuevo tiene que fallar al desconectar lo que prueba. Con
  el peso de huida a cero deben caer los tests del miedoso y del prudente, y solo esos.

## Tests que hay que añadir

- Miedoso con salida: se aleja. Miedoso acorralado: ataca. Prudente con un héroe cerca:
  ataca; con tres: huye. Agresivo: va a por el más cercano aunque haya un herido más lejos.
- Escenas sobre la misión real: cinco turnos de Zargon con temperamentos forzados, y **el
  motor acepta todas las acciones propuestas** (patrón del test de T8).
- `crearPartida` reparte temperamentos de forma reproducible con la misma semilla.

## Prohibido

- Tocar `reducer.ts` o inventar una regla de reglamento: huir es mover, con las reglas de
  movimiento que ya hay.
- «Arreglar» el calabozo para que Zargon gane más: firmado el 2026-09-06 que la dificultad
  va por misión.
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md`. En la terminada, los porcentajes medidos con
cada temperamento: sin números esta tarea no está terminada.
