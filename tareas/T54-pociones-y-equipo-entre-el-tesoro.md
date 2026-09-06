# T54 · Pociones que se guardan y equipo que se encuentra

**Precondición:** T53 LISTA (comparten `reducer.ts` y `types.ts`). **No a la vez que 50**
(`reducer.ts`), **37, 38** (`types.ts`), **39** (`narrator/local.ts`) **ni 22**
(`HeroSheet.tsx`): si la 22 está EN CURSO cuando llegues a la hoja, espera a que cierre.
**Banda de modelo:** ALTO — cambia la forma del héroe (una mochila), añade dos acciones al
motor y decide cómo se reparten objetos entre héroes delante de niños.
**Duración esperada:** 4 h · **Encadenable con:** 55 (misma banda; la 55 necesita esta).
**Ficheros que toca:** `src/engine/types.ts` (`Heroe.mochila`, acciones, eventos),
`src/engine/partida.ts` (la mochila vacía al crear), `src/engine/reducer.ts`
(`buscarTesoro`, `usarPocion`, `darObjeto`), `src/engine/selectors.ts` (qué se puede usar
y a quién dar), `src/engine/combat.ts` (dos yelmos no son dos dados), `src/data/treasure.ts`
(las cartas), `src/narrator/local.ts`, `src/ui/HeroSheet.tsx` (la mochila y sus botones),
`tests/` (`reducer.test.ts`, `equipo.test.ts`, `ayuda.ts` si genera acciones al azar),
`imprimibles/` regenerados con `npm run cartas`.
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Lo que pidió Juan Luis

El 2026-09-06, probando la página publicada:

> En la primera misión hay un montón de habitaciones vacías. Debería haber monstruos,
> tesoros, etc. Si la idea es que la misión sea fácil de llevar a cabo, puedes poner
> pociones curativas en las habitaciones, de manera que cuando un héroe busque un tesoro,
> encuentre, además de monedas, gemas, etc, alguna poción curativa que le restituya a él o
> a otro héroe los puntos de vida perdidos. También pueden hallar armas, escudos, yelmos,
> etc que les otorguen más puntos de ataque o de defensa a los héroes.

Está transcrito como firma en `autorizaciones.md` (2026-09-06). Esta tarea es **la parte de
motor**: que una poción se guarde y sirva para otro héroe, y que el equipo pueda salir del
tesoro. **Poblar las salas es T55**, que viene después.

## Lo que hay hoy, medido

- `BARAJA_TESOROS` (`treasure.ts`): 24 cartas; tres «Poción curativa» (+4 de cuerpo) y
  dos «Poción de fuerza». **La curación se aplica en el acto al héroe que roba la carta**
  (`buscarTesoro`, `case "curacion"`): si estaba entero, la carta se pierde, y nunca
  puede curar a otro.
- No hay ningún efecto de tesoro de clase «equipo». `Heroe.equipo: IdEquipo[]` existe y
  `combat.ts` **suma todas las armaduras que lleve**: dos yelmos darían +2, y hoy no pasa
  porque nadie encuentra nada.
- El mago no puede llevar armadura (`SIN_ARMADURA`, `heroes.ts`, T7); las armas grandes
  vetadas están sin lista a propósito.
- `generar-cartas.ts` imprime la baraja desde `BARAJA_TESOROS` y el equipo desde `EQUIPO`:
  una carta nueva sale sola en `npm run cartas`.
- `HeroSheet.tsx` enseña cuerpo, dados, oro y hechizos; no tiene botones.

## Antes de empezar: mira si ya está hecho

```sh
grep -n "mochila\|usarPocion" src/engine/types.ts
```

## Qué hay que hacer

1. **Leer las páginas 14-15 del reglamento de 2021** (página 8 del PDF, `_COMUN.md`):
   cuándo se puede beber una poción (si gasta la acción o no, si vale en el turno de
   otro) y si los héroes pueden pasarse objetos (y con qué condición: adyacentes o no).
   La cita va en el comentario. Lo que el reglamento no diga lo cubre la firma de Juan
   Luis: **una poción curativa cura al portador o a otro héroe**. Si el reglamento exige
   adyacencia para dar, se aplica; si no dice nada, no se inventa: dar vale a cualquier
   héroe vivo, que es lo más sencillo en una mesa con niños, y se deja escrito.
2. **La mochila**: `Heroe.mochila: IdCartaTesoro[]` (los ids de `treasure.ts`, para que la
   carta impresa y la de la pantalla sean la misma). Las cartas de clase `curacion` y
   `bonusAtaque` van a la mochila en vez de aplicarse. Acción `usarPocion { carta;
   objetivo?: IdFigura }`: cura al objetivo (otro héroe o uno mismo) hasta su máximo; si
   la poción no cura nada porque está entero, el motor la **rechaza** («ya está entero»),
   no la gasta. Acción `darObjeto { que; a }` para pasar una carta de la mochila (o una
   pieza de equipo que no pueda usar) a otro héroe.
3. **Equipo en el tesoro**: efecto `{ clase: "equipo"; id: IdEquipo }` y cartas para él
   (por ejemplo yelmo, escudo, espada corta, daga, herramientas; pocas copias, que es un
   tesoro). Al robarla, el héroe la equipa si su clase lo admite (`heroes.ts`) y **si no
   tiene ya una igual**; si no, va a la mochila para dársela a otro. En `combat.ts`, la
   armadura cuenta **una por pieza distinta** (dos yelmos no suman dos) y el escudo no
   cuenta con un arma a dos manos (`aDosManos`, ya anotado en `equipment.ts`).
4. **La hoja (`HeroSheet.tsx`)**: enseña la mochila con el nombre de cada carta y, en el
   turno del portador, los botones «Beber» (si está herido) y «Dar a …» por cada otro
   héroe vivo; si el reglamento permite beber fuera del turno, el botón sale siempre.
   Las acciones salen por `ejecutar`, como todas: así el deshacer y la red siguen exactos.
   Sin `estilos.css` (T22, T37): con las clases que ya hay.
5. **Narrador**: frases para «bebe», «da a», «encuentra y se pone», «encuentra y guarda».
6. **`npm run cartas`** y mirar que las cartas nuevas salen legibles.

## Tests que hay que añadir

- Una poción robada va a la mochila y no cura en el acto; `usarPocion` sobre otro héroe
  herido lo cura y gasta la carta; sobre uno entero se rechaza sin gastarla.
- `darObjeto` mueve la carta entre mochilas; nunca a un caído.
- Un yelmo encontrado por el mago va a la mochila, no a `equipo`; por el bárbaro, a
  `equipo`; un segundo yelmo, a la mochila.
- `dadosDeDefensa` con dos yelmos en `equipo` (estado forzado) da lo mismo que con uno.
- El juego al azar (`integracion.test.ts`) genera también las dos acciones nuevas cuando
  son legales (mira `tests/ayuda.ts` o el generador que use), y las invariantes aguantan.

## Trampas conocidas

- **`mazoTesoros` es una lista de ids barajada en `crearPartida`**: cambiar la baraja
  cambia el barajado de todas las partidas con semilla fija; los tests que fijan qué carta
  sale primera hay que revisarlos con calma, no «arreglarlos».
- **La curación por hechizo** (`case "curacion"` de `lanzarHechizo`, línea ~799) no cambia:
  es otra cosa.
- **`VERSION` del protocolo de red** si el estado o las acciones viajan por el relevo:
  mirar `src/red/protocolo.ts` y decirlo en la terminada.
- **Los ids de acción nuevos tienen que entrar en `narrar`** (`switch` exhaustivo) o no
  compila; eso es lo esperado.

## Prohibido

- Tocar `TurnPanel.tsx`, `Juego.tsx` o `useAccionesDeTurno.ts` (cadena 52, 36, 22): los
  botones van en la hoja.
- Cambiar los números de las cartas de oro o inventar una regla de pociones sin cita o
  sin firma.
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md`. En la terminada, la baraja final (cuántas de
cada clase), la cita del reglamento sobre beber y dar, y lo que T55 puede dar por hecho.
