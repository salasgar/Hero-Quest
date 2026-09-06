# T50 · Poderes de monstruo: hechizos enemigos, telarañas y emboscadas

**Precondición:** T49 LISTA (las especies existen y llevan apuntado qué poder les falta) y
**T42 LISTA** (`types.ts`). **No a la vez que ninguna tarea que toque `reducer.ts`**: mira
el tablón.
**Banda de modelo:** ALTO — es una regla nueva en el motor (hoy ningún monstruo hace nada
que no sea mover y pegar), cambia la forma del estado, afecta a la IA y a lo que les pasa a
los héroes, y la fuente no es el reglamento sino el encargo de Juan Luis.
**Duración esperada:** 5 h · **Encadenable con:** —.
**Ficheros que toca:** `src/engine/types.ts`, `src/engine/reducer.ts`,
`src/engine/selectors.ts`, `src/data/monsters.ts` (el campo de poder), `src/ai/zargon.ts`
(que la IA sepa usar el poder), `src/narrator/local.ts` (contarlo), `tests/`.
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre. Y el
registro de T21 y T8 en el tablón antiguo: cómo se resolvieron los efectos de hechizo y
cómo puntúa la IA.

## De dónde sale

Del encargo del 2026-09-06 («brujo, bruja, araña gigante, monstruo de arena... Dale a la
imaginación»): un brujo que no lanza nada es un orco flaco. T49 pone los números; esta pone
lo que los hace distintos. La fuente es Juan Luis, y va citada en el código.

## Lo que hay hoy, medido

- `Monstruo` tiene `efectos`, `dormido` y `pierdeTurno`, todos **sufridos**; ningún campo
  de poder propio. `hechiceroDelCaos` existe desde el principio sin un solo hechizo.
- Los hechizos de héroe (`spells.ts`, doce) se resuelven en el reductor con `efectoDeHechizo`
  y `hechizoSinEfecto` (T21), y el objetivo es siempre un monstruo o un compañero: **no
  hay ningún camino por el que un héroe reciba un efecto hostil**. `pierdeTurno` y
  `dormido` viven en `Monstruo`, no en `Heroe` (está preguntado en `autorizaciones.md` para
  la Tempestad).
- La IA elige entre mover, atacar, abrir y cerrar (`siguienteAccionDelMonstruo`); una
  acción nueva de monstruo no existe hasta que `zargon.ts` la proponga y el simulador la
  mida.

## Antes de empezar: mira si ya está hecho

```sh
grep -n 'poder' src/data/monsters.ts src/engine/types.ts
```

## Qué hay que hacer

1. **Pocos poderes, bien elegidos, y cada uno con su regla escrita antes que su código**:
   - **Hechizo enemigo** (brujo, bruja, hechicero del Caos): una acción de Zargon que
     lanza sobre un héroe a la vista un efecto de una lista corta (dormir, perder el turno,
     un daño que se salva con mente). Obliga a que `Heroe` gane `dormido` y `pierdeTurno`,
     a que el paso de turno los respete y a decidir en la mesa **cómo se despierta** (tirada
     de mente al empezar su turno, como el reglamento hace con el Sueño). Aquí conviene
     preguntarle a Juan Luis antes de escribir: quitarle el turno a un niño no es lo mismo
     que a un goblin (`autorizaciones.md`, pendiente de la Tempestad).
   - **Telaraña** (araña): al atacar y acertar, el héroe queda **enredado**: no se mueve
     hasta que supere una tirada. Es un efecto con duración, como `bonusAtaque`.
   - **Emboscada** (monstruo de arena): empieza la misión **oculto** en una casilla de sala
     y se revela cuando un héroe entra en ella o la registra, actuando ese mismo turno.
     Encaja con `monstruosEnTablero` (T18) y con las trampas: es una trampa que muerde.
2. **Un campo `poder?` en `PlantillaMonstruo`** con un tipo cerrado, y en el reductor una
   acción `poderDeMonstruo` (o el poder se dispara dentro de `atacar`, según el caso), con
   sus eventos para el narrador y sus `hechizoSinEfecto` cuando no prende.
3. **La IA lo usa**: en `zargon.ts`, el poder es una acción candidata más que se puntúa
   con los pesos de T8 (daño esperado, remate, distancia). Sin esto, el poder existe y
   nadie lo lanza.
4. **Medir con el simulador** sobre una misión que tenga esas especies (T46 o T47 pueden
   añadirlas), y mirar que el porcentaje de victorias no se hunde: un brujo que duerme al
   bárbaro cada turno acaba la partida él solo.

## Trampas conocidas

- **Todo lo que cambia la forma del estado se dice dos veces** (T6): en la terminada y en
  el comentario del tipo, para quien guarde partidas.
- **Las acciones ilegales devuelven `{ ok: false, motivo }`**, no lanzan (`_COMUN.md`).
- **El test de juego al azar** (`integracion.test.ts`) va a lanzar poderes en cualquier
  orden; si se rompe, sospecha del poder.
- **`comoLoVe` (T32) devuelve un estado para pintar**: un monstruo emboscado no debe
  aparecer en la vista remota antes de revelarse; `monstruosEnTablero` ya lo resuelve si la
  emboscada pasa por ahí.
- **Los subagentes trabajan bajo tu sid**; si lanzas uno a escribir tests, tú no tocas
  `hechos/` mientras corre.

## Tests que hay que añadir

- Cada poder: prende, no prende (motivo en el dato), se cuenta en el diario, y el motor lo
  acepta desde la IA en una escena real.
- El héroe dormido o enredado no actúa, y se libera como diga la regla.
- La receta de T1: desconectar cada poder tumba sus tests y solo esos.

## Prohibido

- Inventar más de tres poderes en esta tarea: cada uno es una regla que los niños tienen
  que entender en la mesa.
- Implementar un poder sobre un héroe sin haber preguntado lo de arriba a Juan Luis.
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md`. En la terminada, las tres reglas escritas en una
frase cada una, tal como se leen en la mesa.
