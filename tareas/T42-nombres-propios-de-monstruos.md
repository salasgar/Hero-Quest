# T42 · Cada monstruo con su nombre propio

**Precondición:** ninguna. **Va antes que T37, T38 y T39**, que tocan los mismos ficheros o
la necesitan.
**Banda de modelo:** MEDIO — escribir 120 nombres con sabor es criterio, no reglas; la
parte técnica es corta pero con una trampa de reproducibilidad.
**Duración esperada:** 2 h · **Encadenable con:** 40 (misma banda, cortas, sin ficheros en
común).
**Ficheros que toca:** `src/data/nombres.ts` (nuevo), `src/engine/partida.ts` (asignar al
crear la partida), `src/engine/types.ts` (`Monstruo.nombre`), `src/narrator/local.ts`
(`nombreDe`), `src/ui/TurnPanel.tsx` (donde se nombra al monstruo que actúa),
`tests/nombres.test.ts` (nuevo). **No toca `reducer.ts`.**
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Lo que pidió Juan Luis

El 2026-09-06:

> Genera aleatoriamente una serie de nombres de monstruos. Dentro de cada partida, cada
> monstruo debe tener un nombre de pila único en esa partida, igual que lo tienen los
> héroes. Entre partidas distintas los nombres se pueden repetir. Genera nombres que le
> peguen a cada tipo de criatura. No deben sonar igual los nombres de los orcos que los
> nombres de los espectros o de las gárgolas. Cuando hayas generado una lista de 12 nombres
> para cada tipo de criatura, muéstrame las listas por si se pueden mejorar.
>
> Opción para pensar: alguno de los nombres puede aparecer como parte del objetivo de una
> misión. Por ejemplo: "Encontrar a la criatura llamada Bórgorum y darle muerte". O:
> "Recuperar el medallón mágico de Érumir, que está en manos de un orco llamado Jújrur".
> El problema es ¿cómo saben los héroes el nombre de cada monstruo? Pensar si es viable.

## Lo que hay hoy, medido

- `Monstruo` (`types.ts`) tiene `especie` y no tiene nombre. `nombreDe` (`local.ts`) da el
  nombre de la especie: los dos goblins de la sala `s` salen los dos como «Goblin», y T20 lo
  dejó apuntado como tarea aparte.
- Diez especies en `monsters.ts`: goblin, orco, fimir, esqueleto, zombi, momia,
  guerreroDelCaos, gargola, hechiceroDelCaos, trollDeLasCavernas.
- El generador vive en el estado y `crearPartida` ya lo consume (baraja el mazo de tesoros,
  entre otras cosas). T35 hizo su arreglo en `crearPartida` para no tocar `reducer.ts`.

## Antes de empezar: mira si ya está hecho

```sh
ls src/data/nombres.ts 2>/dev/null; grep -n 'nombre' src/engine/types.ts | head
```

## Qué hay que hacer

1. **`nombres.ts`: doce nombres por especie**, con una fonética propia por familia. Orcos y
   goblins guturales y cortos (Glupfch, Jújrur); no muertos (esqueleto, zombi, momia) con
   nombres viejos, egipcios o sepulcrales (Anhotep, Sarkhem); fimir y gárgola pétreos, de
   consonantes duras (Bórgorum); hechicero y guerrero del Caos con nombres altisonantes;
   el troll, torpe y largo. Acentúa como en castellano para que se lean en voz alta en la
   mesa: son los niños quienes los van a decir. Sin nombres de personajes con derechos.
2. **Asignación en `crearPartida`**, con el generador del estado, **después** de todo lo que
   ya consume el generador y sobre una copia derivada si hace falta, para que los tests con
   semilla fija no cambien de resultado. Cada monstruo recibe un nombre distinto de los ya
   dados en esa partida; si una misión trae más monstruos de una especie que nombres,
   se añade un ordinal («Glupfch II») en vez de repetir. La misión puede fijar un nombre
   (`nombre` en su lista de monstruos) y entonces no se sortea: es lo que hace viable lo de
   los objetivos.
3. **`nombreDe` devuelve «el orco Glupfch»**: especie y nombre, con el artículo por género
   gramatical de la especie (la gárgola, la momia). Es lo que leen el diario (T39), el
   panel de turno (T17: «Le toca a Goblin») y `motivoDeLaJugada`.
4. **El monstruo errante** nace en el reductor (T18) y no pasa por `crearPartida`. Para no
   tocar `reducer.ts`, guarda en el estado la lista de nombres sorteados para el errante
   (uno por especie, sin usar) y que el reductor solo lo lea; si eso resulta más enrevesado
   que una línea en `reducer.ts`, hazlo en el reductor y dilo en la terminada, con quién
   tiene reservado ese fichero mirado antes.
5. **Las listas a Juan Luis**: en el mensaje de cierre, las diez listas enteras. Es un paso
   de la tarea, no una firma: se cierra con las listas que haya, y si él cambia alguna es un
   commit de datos que puede hacer cualquiera.
6. **Lo del objetivo con nombre, pensado y escrito, no hecho.** Es viable: el nombre se
   fija en la misión (punto 2) y los héroes lo saben porque el diario y el panel lo dicen
   al descubrir al monstruo, igual que sabrían que «el que lleva el medallón es un orco».
   Lo que no existe es un objetivo «recuperar un objeto» ni «matar a uno concreto sin ser
   el guardián» más allá de `matarA`. Deja en la terminada qué haría falta; la tarea la
   escribe quien diseñe la siguiente misión.

## Trampas conocidas

- **Cambia la forma del estado** (`Monstruo.nombre`): quien guarde partidas tiene que
  saberlo. Hazlo obligatorio en el tipo y rellénalo en todos los sitios que crean
  monstruos, o el compilador no te avisará del que falte.
- **Consumir el generador en otro orden cambia todos los tests con semilla** (barajado del
  mazo, tiradas). Por eso va al final o sobre un generador derivado. Comprueba que
  `tests/integracion.test.ts` da los mismos resultados antes y después.
- **En red, las dos casas reciben el montaje** y rehacen la partida: si el nombre sale
  del generador del estado, coinciden; si saliera de `Math.random()`, cada casa vería
  nombres distintos sin ningún error.
- **`MONSTRUOS[f.especie].nombre[0]`** en `BoardMirror.tsx` es la inicial de la especie
  en el tablero. Se queda así: el tablero no tiene sitio para nombres.

## Tests que hay que añadir

- Doce nombres por especie, sin repetidos dentro de una especie ni entre especies.
- En una partida, ningún nombre repetido; con la misma semilla, los mismos nombres; con
  otra semilla, otros.
- Una misión que fija un nombre lo conserva.
- `nombreDe` da «el orco X» y «la gárgola Y».

## Prohibido

- `Math.random()` o `Date.now()` en el motor (no hay ninguno hoy; que siga así).
- Tocar `reducer.ts` salvo lo dicho en el punto 4, y con el candado mirado.
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md`. Las diez listas van en la terminada y en el
mensaje a Juan Luis.
