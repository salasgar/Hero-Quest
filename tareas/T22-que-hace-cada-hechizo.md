# T22 · Saber qué hace cada hechizo antes de lanzarlo

**Precondición:** **`src/ui/Instrucciones.tsx` en `main`.** Hoy es un fichero sin
commitear que está escribiendo otra sesión, y esta tarea le añade una sección. Además
necesita `TurnPanel.tsx` libre. **Va a la cola**: es lo último de las cuatro del 5 de
septiembre, por decisión de Juan Luis, y se coge cuando de verdad se pueda.
**Banda de modelo:** MEDIO — no hay reglas ni motor; hay que decidir qué cabe en pantalla en
mitad de una partida sin tapar el tablero.
**Ficheros que bloquea:** `src/ui/TurnPanel.tsx`, `src/ui/Instrucciones.tsx`,
`src/ui/HeroSheet.tsx`, `src/estilos.css` (mira su candado: lo ha tenido reservado otra
sesión).
**Duración esperada:** 2 h · **Encadenable con:** T11 y T36 (misma banda, cortas, y
comparten `TurnPanel.tsx` con esta: **no van en paralelo**, van seguidas en la misma sesión
o de una en una).
**Ficheros que toca:** `src/ui/TurnPanel.tsx`, `src/ui/Instrucciones.tsx`,
`src/ui/HeroSheet.tsx`, `src/estilos.css`, `tests/` (el test de las doce descripciones).
**Precondición, al día de la migración del 2026-09-06:** `src/ui/Instrucciones.tsx` **ya está
en `main`** desde `b47310f` (el rescate de la sesión `6f2f1053`), así que la precondición se
cumple y la tarea es cogible; el «a la cola» era el orden que quiso Juan Luis entre las
cuatro del 5 de septiembre, y las otras tres ya están LISTA. El cierre es el de
`proyecto.md`, con terminada en `hechos/`; la «línea en el registro de `_ESTADO.md`» de abajo
es del reparto viejo.
Lee `_COMUN.md` primero.

## Lo que preguntó Juan Luis

El 5 de septiembre de 2026: «Cuando estoy jugando y veo que tengo varios hechizos
disponibles, ¿cómo puedo saber qué hace cada hechizo antes de usarlos?»

Es una pregunta, no un informe de fallo, pero la respuesta de hoy es mala y por eso es una
tarea.

## Cómo se responde hoy

- **El texto existe, y para los doce.** `descripcion` está en
  [`spells.ts`](../src/data/spells.ts), redactada y cotejada con las cartas.
- **En pantalla solo se ve como `title` de HTML**, o sea, como globo del ratón: en el botón
  del hechizo ([`TurnPanel.tsx:196`](../src/ui/TurnPanel.tsx#L196)) y en la etiqueta de la
  hoja del héroe ([`HeroSheet.tsx`](../src/ui/HeroSheet.tsx)). **En una tableta el `title` no
  aparece nunca**, y con el ratón hay que acertar y esperar un segundo. Un niño no lo
  encuentra.
- **Y la botonera no enseña la mano entera:** `Juego.tsx` filtra los hechizos a los que
  ahora mismo tienen algún objetivo a la vista, así que justo cuando estás decidiendo qué
  hacer, la mitad de las cartas no está en la pantalla.
- **Lo que sí funciona hoy, y conviene decirlo en la mesa:** las cartas impresas. `npm run
  cartas` genera las doce en `imprimibles/cartas.pdf`, con el texto completo, el elemento y
  «un uso por misión» ([`generar-cartas.ts:74`](../scripts/generar-cartas.ts#L74)).

## Lo que decidió Juan Luis

Preguntado el 5 de septiembre de 2026: **las dos cosas**, y a la cola.

1. **En el panel**, al elegir un hechizo: que se lea qué hace sin depender del globo del
   ratón.
2. **En Instrucciones**, la lista completa de los hechizos del grupo, para consultarla entre
   turnos.

## Cómo hacerlo

- **El texto sale de `HECHIZOS`, siempre.** Ni una descripción escrita a mano en la
  interfaz: son datos, y una copia envejece. Esa es justamente la razón por la que las
  cartas impresas se generan desde el mismo sitio.
- **En el panel, al elegir.** El segundo paso —«¿sobre quién?»— ya existe en `TurnPanel` y
  es el sitio natural: junto al nombre del hechizo, su descripción. Cuidado con el caso de
  un solo objetivo: hoy sale disparado sin pasar por ese paso
  ([`Juego.tsx`](../src/ui/Juego.tsx), `elegirHechizo`), así que ahí el texto tiene que estar
  **antes**, en el propio botón o debajo de la botonera.
- **En Instrucciones, la mano completa**, incluidos los que ahora no tienen objetivo y los
  ya gastados —tachados, como en la hoja del héroe—: saber que la Curación ya se usó es la
  mitad de la información. Agrúpalos por elemento, que es como están las cartas y como se
  eligen al empezar la partida.
- **Instrucciones se abre encima de la partida y no la desmonta** (está razonado en
  [`App.tsx`](../src/App.tsx)): no muevas ese comportamiento, y respeta su regla de **no
  escuchar el teclado**, que su propia cabecera explica: la ventana de dados tiene un
  escuchador global y `Escape` es suyo.
- **En la mesa hay cuatro héroes.** Si metes los hechizos de los cuatro en Instrucciones,
  que se vea de quién es cada uno; el bárbaro y el enano no tienen ninguno y no deben
  ocupar sitio.

## Trampas conocidas

- **No dupliques la pista de «ninguno alcanza».** T14 dejó una línea que explica el panel
  vacío, y existe porque el malentendido de «la aplicación se ha comido mis hechizos» ya
  pasó de verdad. Amplíala si hace falta; no la sustituyas por otra que diga lo mismo.
- **Deja el `title`.** Con ratón funciona y no estorba; lo que se añade es la vía que
  funciona sin ratón.
- **`estilos.css` es compartido y ha estado reservado.** Reutiliza las clases que ya hay
  —`grupo`, `botonera`, `pista`, `apagado`, `etiqueta`, `instr-bloque`— antes de inventar
  ninguna, y mira el candado antes de tocarlo.
- **Los componentes de React no se prueban aquí** (`vite.config.ts` dice
  `environment: "node"`). Lo que sí se puede probar es el dato.

## Tests que hay que añadir

- Los doce hechizos tienen `descripcion` no vacía. Es el test que impide que uno nuevo entre
  mudo, y el que sostiene toda esta tarea.
- Si sacas una función que arma la lista de un héroe (los que le quedan, los gastados,
  agrupados por elemento), pruébala: con el mago de tres elementos, con el elfo de uno y con
  el bárbaro, que no tiene ninguno y debe dar lista vacía sin reventar.

## Prohibido

- Escribir las descripciones en la interfaz en vez de leerlas de `spells.ts`.
- Que Instrucciones escuche el teclado.
- Desmontar la partida para enseñar la lista.

## Al terminar

Commit en `main`, push y línea en el registro de `_ESTADO.md`. Y pruébalo como se va a usar:
con el mago de nueve hechizos, en una tableta o al menos sin tocar el ratón, decidiendo cuál
lanzar. Si para saber qué hace uno hay que pasar el cursor por encima, no está hecho.
