# T15 · Buscar un libro de hechizos en una estantería (regla de la casa)

**Precondición:** **T13 y T14 hechas.** No es una dependencia de temas: T13 tiene
`types.ts`, `reducer.ts` y `selectors.ts`, y T14 tiene `TurnPanel.tsx` y `Juego.tsx`, que
son los cinco ficheros que esta tarea necesita escribir.
**Banda de modelo:** ALTO — es una regla nueva que no está en el reglamento, y decidir mal
su equilibrio se paga en la mesa durante toda la campaña.
**Ficheros que bloquea:** `src/engine/types.ts`, `src/engine/reducer.ts`,
`src/engine/selectors.ts`, `src/data/quests/calabozo.ts`, `src/ui/TurnPanel.tsx`,
`src/ui/Juego.tsx`.
Lee `_COMUN.md` primero.

## De dónde sale, y por qué eso importa

Lo pidió Juan Luis el 5 de septiembre de 2026, con estas palabras:

> Si, como parte del mobiliario, hay una estantería con libros y el mago se sitúa a su
> lado, entonces una acción que puede hacer el mago es «buscar libro de hechizos». El
> máster decide si lo encuentra o no y qué hechizos hay en el libro.

`_COMUN.md` prohíbe inventarse una regla y exige citar la fuente. **La fuente de esta es
él, no el reglamento de 2021**, y eso tiene que quedar escrito en el comentario del código
y en el mensaje del commit, con esta fecha. Si dentro de seis meses alguien coteja el
motor contra el reglamento y encuentra esta acción, la explicación tiene que estar dentro
del repositorio, no en el recuerdo de una conversación.

## Antes de que ninguna sesión escriba código: faltan cuatro decisiones suyas

Están en «Pendientes de su palabra» de `_ESTADO.md`. **Si siguen ahí, no empieces: pregunta
y espera.** Escribir esto a ojo es exactamente el fallo que ya costó once valores de
hechizo mal.

1. **¿Se le apilan a los nueve que ya tiene, o los sustituye?** El mago empieza la misión
   con nueve hechizos —el reglamento, página 13— y en la aplicación los tiene ya. Un libro
   que dé más es un añadido de poder; uno que devuelva hechizos ya gastados es una segunda
   oportunidad. Son dos juegos distintos.
2. **¿Qué hechizos trae el libro?** ¿Los de un elemento que el mago no eligió al empezar?
   ¿Uno suelto al azar del mazo de doce? ¿Los elige Juan Luis a mano en el momento?
3. **¿Solo el mago, o cualquier lanzador?** El elfo y el hada también lanzan hechizos. El
   bárbaro no sabe leer magia, eso está claro; los otros dos no.
4. **¿Con qué se decide si lo encuentra?** «El máster decide» puede ser literalmente él
   pulsando sí o no, o una tirada del motor como la de buscar tesoro. Y si se falla, ¿se
   puede reintentar en el turno siguiente, o esa estantería queda agotada?

De la 4 depende si esta acción es determinista o consume el `rng` del estado, y eso cambia
los tests y el «deshacer». No la dejes para el final.

## Lo que sí está decidido y puedes ir preparando

- **Hace falta una estantería en la misión.** `MOBILIARIO` (`src/data/furniture.ts`) ya
  tiene el tipo `estanteria`: 2 × 1, `bloqueaPaso: true`, `bloqueaVista: true`, con la nota
  «Alta: tapa la vista. Buen sitio para esconder cosas». No hay que inventar el mueble: hay
  que **poner una en `MUEBLES_CALABOZO`**, que hoy solo tiene una mesa, un arcón y una
  tumba. Elige dos casillas contiguas libres, dentro de una sala, que no tapen la puerta
  secreta de (4,13)-(4,14) —la tumba ya se movió una vez por eso mismo, y está explicado en
  el comentario de `calabozo.ts`— y que no dejen ciega la entrada de ninguna sala: la
  estantería tapa la vista, y eso cambia qué se puede hechizar desde dónde.
- **La forma de la acción ya tiene molde.** `buscarTesoro` es el patrón exacto: un
  `puedeBuscarLibro(e)` en `selectors.ts` con sus condiciones, una entrada en `Accion`
  (`types.ts`), un caso en el reductor, y un botón en `TurnPanel` que solo aparece cuando
  el selector dice que sí. Cópiale la estructura, no la reinventes.
- **«Situarse al lado» hay que definirlo en casillas.** Una estantería ocupa dos, así que
  «al lado» es estar en una casilla adyacente a **cualquiera** de las dos. Decide si vale
  la diagonal y déjalo escrito: en este motor las diagonales cuentan para ver y no para
  todo lo demás, así que no se deduce solo.
- **Una estantería se registra una vez**, como una sala en `buscadoTesoro`. Sin eso, el
  mago se queda plantado buscando cada turno hasta vaciar el mazo, que es lo que pasaría el
  primer día.

## Trampas conocidas

- **El estado tiene que seguir siendo JSON puro** y sobrevivir a
  `JSON.parse(JSON.stringify(e))`. Nada de `Set` ni de `Map` en el campo nuevo.
- **Si la acción tira dados, tienen que salir del `rng` del estado**, nunca de
  `Math.random()`. Si no, deshacer deja de ser exacto y el test de juego al azar de
  `tests/integracion.test.ts` empieza a fallar de forma intermitente, que es la peor forma
  de fallar.
- **Buscar consume la acción del turno** (`haActuado`), como buscar tesoro. Si no la
  consume, el mago busca y además ataca, y eso no es lo que hace ninguna otra búsqueda.
- **El test de juego al azar juega acciones legales al azar.** En cuanto la acción exista,
  la va a ejecutar sola miles de veces. Comprueba que las invariantes que afirma —sobre
  todo las que cuentan hechizos— siguen valiendo cuando un héroe gana hechizos a mitad de
  partida. Si ese test se rompe, **la sospecha por defecto es que has metido un bug**.
- **La estantería tapa la vista.** Al ponerla, vuelve a mirar los tests de `vision.test.ts`
  y `reducer.test.ts` que usan «El calabozo del guardián»: un mueble alto en medio puede
  volver ilegal un disparo que un test daba por bueno. Si eso pasa, el test no está mal por
  sí solo —la geometría ha cambiado— y hay que decirlo en el commit.

## Tests que hay que añadir

- El mago pegado a la estantería puede buscar; a dos casillas, no.
- El bárbaro pegado a la estantería no puede buscar (o sí, según la decisión 3: prueba lo
  que se haya decidido, y que el test lo diga en su nombre).
- La misma estantería no se puede registrar dos veces.
- Buscar consume la acción del turno.
- Encontrar un libro deja los hechizos nuevos en `heroe.hechizos`, y son lanzables después
  —que es lo que conecta esta tarea con T14—.
- Deshacer justo después de encontrar el libro devuelve al héroe a sus hechizos de antes.
- La prueba de T1: revierte el código de producción y comprueba que estos tests fallan.

## Prohibido

- **Empezar sin las cuatro decisiones firmadas en `_ESTADO.md`.** Es el punto entero de
  esta tarea.
- **Tocar `src/data/board-base.ts` ni `board-print.ts`** para hacerle sitio a la
  estantería. El tablero está impreso y pegado; el mueble se coloca en casillas que ya
  existen.
- Presentar esta regla como si viniera del reglamento oficial, en un comentario, en un
  test o en el mensaje del commit.
- Dar hechizos a un héroe que no sea lanzador «porque encontró el libro», salvo que la
  decisión 3 diga exactamente eso.

## Al terminar

Commit en `main` y push. Línea en el registro de `_ESTADO.md` con las cuatro decisiones tal
como quedaron y dónde se colocó la estantería. Y avisa de que **hay que construir la pieza
de cartón**: `MOBILIARIO` dice que conviene tener dos estanterías, y si en la mesa no hay
ninguna, la acción existe en la pantalla y no en el tablero.
