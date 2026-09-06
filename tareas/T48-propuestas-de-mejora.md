# T48 · Qué más se puede mejorar: una lista para que Juan Luis elija

**Precondición:** ninguna. Sale mejor cuando T11 y T36 estén LISTA, porque entonces se
puede jugar una partida entera sin clics de más y ver lo que de verdad falta; pero se puede
coger antes.
**Banda de modelo:** ALTO — es criterio puro: leer el proyecto entero, jugar, y decir qué
merece la pena y qué no. Una lista de veinte ideas sin prioridad no le sirve.
**Duración esperada:** 2 h · **Encadenable con:** —.
**Ficheros que toca:** `tareas/_PROPUESTAS-2026-09.md` (nuevo). **Ningún fichero de código
ni ninguna ficha de otra tarea.**
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Lo que pidió Juan Luis

El 2026-09-06: «Pensar qué otras mejoras se pueden hacer.»

## Qué es la salida

Un solo fichero, `tareas/_PROPUESTAS-2026-09.md`, con **como mucho quince propuestas**,
ordenadas por lo que aportan en la mesa, y cada una en cinco líneas: qué se nota jugando
hoy, qué cambiaría, qué ficheros tocaría, banda y duración estimadas, y qué tiene que
decidir Juan Luis, si algo. Con eso, convertir una propuesta en tarea es copiarla a una
ficha. Sin prioridad ni estimación no es una propuesta, es una ocurrencia.

Es una lista para que **él elija**: la sesión no abre ninguna tarea ni toca código.

## Por dónde empezar: lo que ya está apuntado y nadie ha recogido

Sale de las terminadas, incidencias y firmas que hay en `_ESTADO-antiguo-2026-09-06.md`,
`autorizaciones.md` y los registros de las tareas. Comprueba cada punto en el código antes
de proponerlo (alguno puede haberse hecho ya):

- **Guardar y cargar partidas** (Fase 8 del plan de `TRASPASO.md`): hoy una partida vive
  en la pestaña. Tres tareas han cambiado la forma del estado (T6, T13, T18) y T37, T38 y
  T42 la cambian más; quien haga esto necesita una versión del formato.
- **La prueba con dos navegadores de la partida en red** (T32) sigue sin hacerse; y el
  relevo espera firma para desplegarse.
- **El tesoro especial de misión** (p. 14 del reglamento) no existe: `Mision` no lo tiene y
  «solo el primero que busca» está a medias. Va bien con T46.
- **Buscar dentro del foso «como si fuera una sala»** (p. 17): divergencia conocida y a
  propósito desde T5.
- **La lista de armas grandes del mago** está vacía a propósito (T7): hacen falta las
  cartas de equipo.
- **La Tempestad sobre un héroe** está preguntada y sin firma.
- **`pierdeTurno` y `dormido` viven en `Monstruo` y no en `Heroe`**: ningún hechizo enemigo
  afecta a los héroes porque no hay hechicero que lance. El hechicero del Caos existe en
  el bestiario sin hechizos.
- **Un selector de dificultad en la pantalla** (torpe, normal, astuto): T11 lo deja en
  `normal` salvo que se pida.
- **Ocho hojas de héroe en la barra lateral** es el doble de alto (T16): mirar en pantalla.
- **Las cartas impresas del troll y de las heroínas**: `npm run cartas` no se ha vuelto a
  correr desde que entraron.
- **`tareas/_COMUN.md` tiene dos líneas desfasadas** («cuántos tests hay lo dice
  `_ESTADO.md`»; «no hay un worktree por sesión»): es una tarea de cinco minutos, BAJO.
- **La misión con un monstruo con nombre en el objetivo** (T42, punto 6) y **objetivos
  nuevos** (recuperar un objeto): cambian el motor.
- **El equipo y la armería**: comprar entre misiones no existe; `equipo: IdEquipo[]` está
  en el héroe y `equipment.ts` tiene datos. Es lo que da sentido al oro del tesoro.
- **Campaña**: héroes que sobreviven de una misión a la siguiente con su equipo y su oro,
  que es la mitad de HeroQuest; depende de guardar partidas y del catálogo (T45).

## Cómo hacerlo

1. Lee `TRASPASO.md` (el plan en ocho fases y su porqué), el registro de finalizaciones
   del tablón antiguo y las trampas de las fichas. Es una hora, y es la parte que vale.
2. Juega una misión entera en `npm run dev` con cuatro héroes, apuntando cada vez que la
   aplicación te obligue a un clic que sobra, te esconda un dato o te haga preguntarte
   qué acaba de pasar. Esa lista pesa más que la de arriba.
3. Escribe el fichero. Descarta con motivo lo que no merezca la pena: un descarte
   razonado también evita que alguien lo proponga otra vez.

## Prohibido

- Tocar código, fichas o el tablón: la salida es un fichero de propuestas y nada más.
- Proponer sin haber comprobado en el código que no está hecho ya.

## Al terminar

El orden de cierre es el de `proyecto.md`, con el fichero de propuestas como única salida
(commit de ese fichero → terminada con el hash → `CERRADA` → tablón → `push`). En el
mensaje a Juan Luis, las cinco primeras propuestas en una línea cada una, y la pregunta de
cuáles convierte en tareas.
