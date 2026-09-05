# T17 · Zargon elige qué monstruo actúa, no el jugador

**Precondición:** **T14 hecha** — no por el tema, sino porque T14 tiene `TurnPanel.tsx` y
`Juego.tsx`, que son los dos ficheros de pantalla que esta tarea reescribe. **T15 también
depende de T14 y toca los mismos dos: T15 y T17 no pueden ir a la vez.**
**Banda de modelo:** MEDIO — la heurística es corta y reversible; lo que pide criterio es
dónde ponerla para que T8 la herede en vez de tirarla.
**Ficheros que bloquea:** `src/ai/orden.ts` (nuevo), `src/ui/TurnPanel.tsx`,
`src/ui/Juego.tsx`. **`src/ai/` es el territorio de T8**, que está bloqueada: lee abajo el
apartado de cómo no estorbarla.
Lee `_COMUN.md` primero.

## Lo que pidió Juan Luis

El 5 de septiembre de 2026: «El máster debería decidir qué monstruo ataca primero. Ahora
mismo la aplicación me permite a mí elegirlo.»

Tiene razón y es literal: en el turno de Zargon, `TurnPanel.tsx` pinta un botón por
monstruo —«Elige el monstruo que actúa:»— y `Juego.tsx` activa `porActivar[0]` al pulsar
Enter. El adulto que hace de árbitro está tomando una decisión que le corresponde al
enemigo, y eso es justo lo que esta aplicación existe para quitarle de encima.

## Antes de empezar: mira si ya está hecho

```sh
ls src/ai 2>/dev/null; grep -n "porActivar" src/ui/TurnPanel.tsx
```

Si `TurnPanel` sigue pintando una botonera de monstruos, está pendiente.

## Esto NO es T8

Conviene tenerlo claro antes de la primera línea, porque el riesgo de esta tarea es
crecer hasta comerse la Fase 4 entera.

| Esto sí | Esto no, es T8 y T11 |
|---|---|
| **En qué orden** se activan los monstruos | A quién ataca cada uno |
| Que el orden lo decida la aplicación | Por dónde se mueve cada uno |
| Anunciar quién actúa ahora | Resolver el turno entero sin intervención |

T8 está bloqueada esperando a T1–T7 por un motivo concreto: **T1, T4 y T5 cambian qué es
legal para un monstruo**, y una IA de objetivos y caminos escrita antes hay que rehacerla.
El orden de activación no depende de esas tres reglas, y por eso esta tarea se puede hacer
hoy. **Si te encuentras escribiendo puntuación de objetivos o búsqueda de caminos, para:
eso es T8 y todavía no toca.**

## Cómo no estorbar a T8

T8 declara `src/ai/` como su carpeta y va a escribir `src/ai/targeting.ts` y
`src/ai/zargon.ts`. Esta tarea escribe **un fichero nuevo y solo uno: `src/ai/orden.ts`**.
No crees `zargon.ts` ni `targeting.ts` «ya que estás», ni un `index.ts` que reexporte, ni un
tipo compartido que T8 tenga que negociar: cada fichero que dejes ahí es un choque futuro.

Y deja en la cabecera de `orden.ts` una línea diciendo que T8 puede sustituir esta
heurística por la suya. Es lo que evita que dentro de un mes alguien encuentre dos
ordenaciones y no sepa cuál manda.

## Cómo hacerlo

- **`src/ai/orden.ts` expone una función pura** que recibe el estado y devuelve los
  monstruos por activar en el orden en que Zargon los va a mover. Pura: mismo estado, mismo
  orden. Nada de `Math.random()` —si quieres desempatar al azar, saca el dado del `rng` del
  estado, que es lo que hace que deshacer siga siendo exacto.
- **Parte de `monstruosPorActivar(e)`**, en `selectors.ts`, que ya filtra los muertos, los
  dormidos y los que pierden turno. No repitas ese filtro: consúmelo.
- **La heurística es una hipótesis, no una verdad.** Escríbela con los criterios separados y
  con nombre —el que ya puede atacar sin moverse; el que está más cerca de un héroe; el más
  duro primero, para que absorba los golpes— de forma que T9 pueda torcerla y T10 medir si
  acierta. Un `sort` con tres condiciones encadenadas y sin explicación es lo que después
  nadie se atreve a cambiar.
- **La pantalla anuncia en vez de preguntar.** Donde había una botonera, ahora va el nombre
  del que actúa, y una razón corta si la tienes: en la mesa, «el orco te tiene a tiro» es lo
  que hace que un niño entienda por qué le ha tocado a él.
- **Sigue despachando la acción `activarMonstruo` por `usePartida`.** No llames al motor por
  tu cuenta: ese hook es el que guarda el historial, y el historial es lo que sostiene el
  deshacer. Es la misma prohibición que T11.

## El botón manual se queda

T11 lo prohíbe expresamente y vale aquí igual: **no quites la posibilidad de activar un
monstruo a mano.** Tiene que seguir habiendo una salida —detrás de un «cambiar», si estorba
a la vista— para cuando la aplicación haga algo raro en mitad de una partida. Con niños en
la mesa no se puede parar a depurar.

## Trampas conocidas

- **`e.monstruos` conserva a los caídos con cuerpo 0.** `monstruosPorActivar` ya filtra por
  `cuerpo > 0`; si ordenas sobre `e.monstruos` directamente, ordenas también a los muertos.
- **El orden se recalcula después de cada activación**, no una vez al empezar el turno: un
  monstruo que muere o que se duerme a mitad del turno de Zargon cambia quién va después.
  Guardar la lista ordenada al principio es el fallo evidente de esta tarea.
- **`puedeVer` y la regla de las salas**: un monstruo dentro de una sala sin revelar no ve
  nada, ni siquiera la casilla de al lado. Si tu criterio es «el que ya tiene a un héroe a
  tiro», la mayoría de los monstruos empezarán empatados a cero y el desempate será lo que
  de verdad decida el orden. Piensa el desempate, no lo dejes al `sort`.
- **El test de juego al azar** juega el turno de Zargon con acciones legales al azar. Tu
  función tiene que sobrevivir a que le pidan el orden en estados raros: sin monstruos
  vivos, con uno solo, con todos dormidos.
- **`estilos.css` lo tiene reclamado la sesión `6f2f1053`** según el tablón. Reutiliza las
  clases que ya hay —`turno`, `grupo`, `botonera`, `apagado`— y no lo edites por debajo.

## Tests que hay que añadir

Los componentes de React no se prueban aquí —`vite.config.ts` dice `environment: "node"`—,
así que prueba la función pura, que es donde está la decisión:

- Con dos monstruos y uno de ellos pegado a un héroe, ese va primero.
- La función es determinista: llamarla dos veces con el mismo estado da el mismo orden.
- Con la lista vacía devuelve vacío, sin reventar.
- Un monstruo dormido o que pierde turno no aparece en el orden.
- Activar al primero y volver a pedir el orden devuelve a los que faltan, sin él.

## Prohibido

- Escribir puntuación de objetivos o caminos: es T8.
- Crear en `src/ai/` cualquier fichero que no sea `orden.ts`.
- Quitar la activación manual.
- Que la interfaz llame al motor saltándose `usePartida`.

## Al terminar

Commit en `main` y push. Línea en el registro de `_ESTADO.md` con los criterios de la
heurística **y por qué ese orden y no otro**, para que T8 sepa qué está heredando y T10 qué
tiene que medir. Y juega un turno de Zargon de verdad antes de darlo por bueno: lo que hay
que comprobar no es que compile, es que en la mesa se entienda quién acaba de moverse.
