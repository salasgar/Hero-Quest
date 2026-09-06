# T49 · Más especies de monstruo para las misiones avanzadas

**Precondición:** T42 LISTA (cada especie nueva necesita sus doce nombres, y `nombres.ts`
será exhaustivo por especie). **No a la vez que T38** (`personalities.ts`) **ni T47**
(`monsters.ts`).
**Banda de modelo:** MEDIO — son datos con criterio (números que se entiendan en la mesa y
un bestiario con sabor); los poderes que exijan motor son T50.
**Duración esperada:** 3 h · **Encadenable con:** —.
**Ficheros que toca:** `src/data/monsters.ts`, `src/ai/personalities.ts` (una entrada por
especie, es exhaustivo), `src/data/nombres.ts` (doce nombres por especie nueva),
`scripts/generar-cartas.ts` solo si el bestiario impreso necesita algo, `tests/monstruos.test.ts`.
**No toca `reducer.ts` ni `types.ts`.**
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Lo que pidió Juan Luis

El 2026-09-06:

> Para misiones más avanzadas: hay que añadir más variedad de monstruos, como por ejemplo,
> brujo, bruja, araña gigante, monstruo de arena, ... Dale a la imaginación.

`_COMUN.md` prohíbe inventarse una regla sin fuente. **La fuente de estas criaturas es él**,
con esta fecha: va en el comentario de `monsters.ts` y en el mensaje de commit, como se
hizo con el hada y con el troll. Lo que sale del reglamento (las diez especies de hoy) se
queda como está.

## Lo que hay hoy, medido

- `EspecieMonstruo` es una unión de diez literales y `MONSTRUOS` un `Record` exhaustivo de
  `PlantillaMonstruo`: `movimiento` (fijo, no se tira), `ataque`, `defensa`, `cuerpo`,
  `mente`, `noMuerto` (mente 0 e inmune a lo que apunta a la mente). Nada más: **una
  especie hoy es sus números**.
- `PERSONALIDADES` (`personalities.ts`) es exhaustivo por especie a propósito: una especie
  nueva no compila hasta que se decide cómo juega. T38 le añade el reparto de
  temperamentos; si T38 ya está LISTA, la entrada nueva lleva también eso.
- `generar-cartas.ts` imprime el bestiario desde `MONSTRUOS` y `ESPECIES`: una especie
  nueva sale sola en la próxima regeneración (`npm run cartas`).
- `tests/monstruos.test.ts` fija la forma del troll (el más lento, el que menos pega, el
  que más defiende y aguanta): el patrón para fijar lo que distingue a cada especie nueva.
- **No hay figuras de cartón** de nada que no sea el bestiario original: cada especie
  nueva es una figura que Juan Luis tiene que confeccionar.

## Antes de empezar: mira si ya está hecho

```sh
grep -c '^  [a-zA-Z]*: {' src/data/monsters.ts
```

Diez es lo que hay hoy.

## Qué hay que hacer

1. **Entre seis y ocho especies nuevas, cada una con un papel táctico distinto**, no ocho
   orcos con otro nombre. Las cuatro suyas y las que se te ocurran; por ejemplo:
   - **Brujo** y **bruja**: mente alta (5-6), cuerpo bajo, ataque 2, defensa 2: los
     objetivos naturales de los hechizos y quienes los lanzan cuando T50 lo permita.
   - **Araña gigante**: movimiento 10, ataque 2, defensa 2, cuerpo 2: rápida y frágil, para
     pasillos.
   - **Monstruo de arena**: movimiento 4, ataque 3, defensa 4, cuerpo 4, mente 1: lento y
     duro, para guardar una sala.
   - Otros que casan con el tablero y las cartas de tesoro: **rata gigante** (enjambre
     débil), **espectro** (no muerto rápido, cuerpo 1, defensa 3), **ogro** (entre el
     guerrero del Caos y el troll), **serpiente de las tumbas**.
   Cada una con su línea en `MONSTRUOS`, su comentario de dos líneas (qué papel juega y por
   qué esos números) y su `Personalidad`.
2. **Los números se justifican comparando**: el bestiario original va de goblin (1/1/1) a
   gárgola (4/4/3). Que ninguna especie nueva sea estrictamente mejor que la gárgola en
   todo salvo el troll, que ya es el techo de resistencia. Un test que lo fije, como el del
   troll.
3. **Doce nombres por especie** en `nombres.ts`, con la fonética que T42 dejó decidida por
   familia (no muertos, bestias, humanoides). El sorteo de nombres de T42 usa un generador
   **derivado** de la semilla (`crearRng(semilla + 0x5bf03635)`), no el del estado, para no
   mover el barajado ni las tiradas; si el temperamento de T38 o cualquier dato nuevo se
   sortea, se hace igual, con otro desplazamiento, y hay un test de T42 que lo fija.
4. **`npm run cartas`** para ver que el bestiario impreso sigue saliendo, y avisar en el
   cierre de qué figuras faltan.
5. Si alguna especie **necesita una regla nueva** para tener sentido (la araña teje, el de
   arena emerge, el brujo lanza), aquí se le ponen los números y la regla se deja anotada
   para T50 con una línea en su ficha: `pendiente de poder: <cuál>`. No se implementa aquí.

## Trampas conocidas

- **La exhaustividad es a propósito**: si al añadir una especie te salen errores de
  compilación en `personalities.ts` o `nombres.ts`, eso es lo que tienen que hacer. No los
  tapes con un `default`.
- **`noMuerto: true` implica mente 0** y cambia qué hechizos le afectan (T21): no lo pongas
  por sabor.
- **El simulador (T10) y los tests de escena usan el calabozo**, que no cambia: una especie
  nueva no altera ninguna medida hasta que una misión la use. Es lo esperado.
- **`sesgos` de la personalidad son multiplicadores sobre los pesos de T8**; un brujo con
  `lanzaHechizos` alto es un brujo que persigue al mago, no uno que lanza.

## Tests que hay que añadir

- Cada especie nueva tiene personalidad y doce nombres (sale solo si el tipo es exhaustivo,
  pero un test lo dice en rojo y no en un error de compilación críptico).
- Ninguna especie nueva domina a la gárgola en ataque, defensa y cuerpo a la vez.
- Lo que distinga a cada una (la araña es la más rápida; el de arena, el más duro por
  debajo del troll), como en `monstruos.test.ts`.

## Prohibido

- Cambiar los números de las diez especies del reglamento.
- Tocar el motor: un poder nuevo es T50.
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md`. En el mensaje a Juan Luis, la tabla de especies
nuevas con sus números en una línea cada una, las figuras que hacen falta, y los poderes que
quedan apuntados para T50.

## Hecho (2026-09-06, `s-20260906T174538-5671d1b5`)

Ocho especies: brujo, bruja, araña gigante, monstruo de arena, rata gigante, espectro, ogro
y serpiente de las tumbas. Trampa para quien repita este patrón: **el ataque de la especie
nueva no puede valer 1**, o empata con el troll y rompe su test («pega menos que cualquier
otro» exige que sea estrictamente el único con ataque 1); pasó con el primer borrador del
brujo y de la rata gigante. Y **`tests/nombres.test.ts` tenía el total de nombres fijado a
120** (diez especies × doce): con especies nuevas hay que dejarlo en
`ESPECIES.length * 12`, no en el número de hoy, o la próxima tarea que añada especies vuelve
a tropezar con lo mismo. `npm run cartas` no hace falta tocarlo: itera `ESPECIES` solo y saca
las 18 especies en la tabla del bestiario sin cambiar el script.
