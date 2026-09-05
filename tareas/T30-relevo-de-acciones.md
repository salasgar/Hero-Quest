# T30 · El relevo de acciones: el servicio que reparte la partida

**Precondición:** ninguna. Se puede coger hoy.
**Por qué el bloque empieza en T30 y hay un hueco:** las cinco tareas de la fase de red
—T30 a T34— se escribieron el 5 de septiembre de 2026 a la vez que otra sesión reclamaba
los nombres T19 a T22 para cuatro tareas de reglas. Se renumeró **este** bloque, no el
suyo, y se dejó hueco a propósito por si su serie sigue creciendo. El hueco no es un
descuido ni esconde tareas perdidas.
**Banda de modelo:** ALTO — el protocolo lo heredan T31, T32 y T33, y cambiarlo después
obliga a redesplegar el servicio mientras hay partidas vivas.
**Ficheros que bloquea:** `server/relevo.ts` (nuevo), `server/wrangler.toml` (nuevo),
`server/README.md` (nuevo), `src/red/protocolo.ts` (nuevo),
`tests/red-protocolo.test.ts` (nuevo). **No toca ni un fichero del motor ni de la
pantalla**, y por eso puede ir en paralelo con cualquier otra tarea del tablón.
Lee `_COMUN.md` primero.

## Lo que pidió Juan Luis

El 5 de septiembre de 2026: «Quiero que se pueda jugar online con otra persona que esté en
otro lugar.» Y, preguntado por las cuatro decisiones que cambiaban el trabajo, firmó estas:

1. **Quien está lejos es un héroe más del grupo.** La mesa física sigue en su casa, con el
   tablero, las miniaturas y los demás jugadores. No son dos mesas ni un árbitro remoto.
2. **Ve el tablero digital con niebla**: solo lo que el grupo ha descubierto.
3. **La aplicación se publica en `salasgar.github.io`** y las acciones pasan por un
   **relevo alojado y gratuito**. Descartó el túnel al portátil y descartó el navegador a
   navegador.
4. **Los dados de quien está lejos: las dos opciones**, a elegir por él.

Esta tarea es solo la tercera, y solo su mitad de servidor.

## Por qué esto es tan pequeño

Porque el trabajo ya estaba hecho hace semanas sin saberlo. `aplicarAccion` es pura, el
generador aleatorio vive **dentro** del estado y `Accion` es JSON plano. Medido: en
`src/engine/` no hay un solo `Math.random()` ni un solo `Date.now()`. De ahí sale la idea
entera de la fase:

> **Jugar en red no es sincronizar el estado: es repartir la lista de acciones.** Cada
> pantalla rehace la partida con `repetir(inicial, acciones)`, que es exactamente lo que ya
> hace el «deshacer» de `usePartida`.

El relevo, por tanto, **no sabe jugar a HeroQuest y no debe aprender**. Guarda una lista y
la reparte en orden. Si alguna vez te encuentras importando algo de `src/engine/` dentro de
`server/`, te has salido de la tarea.

## Antes de empezar: mira si ya está hecho

```sh
ls server/ src/red/ 2>/dev/null
```

Si `server/` sigue vacío, está pendiente. Ojo: `server/` está reservado desde agosto para
el proxy de la API de Claude de la Fase 5, que **tampoco existe**. Convivirán; no borres
nada que encuentres ahí ni des por muerto lo que no entiendas.

## El montaje: qué hace falta para que dos casas jueguen la misma partida

Una partida en red son dos cosas: **el montaje**, que se escribe una vez, y **el registro
de acciones**, que solo crece.

```ts
export interface Montaje {
  /** Identifica la versión del código. Ver «la trampa de la versión», abajo. */
  version: string;
  /** La semilla del generador. Se decide aquí, una vez, y viaja a las dos casas. */
  semilla: number;
  /** El identificador de la misión, no la misión entera: cada casa la tiene en su código. */
  mision: string;
  /** Lo mismo que recibe `crearPartida`, tal cual. */
  heroes: HeroeElegido[];
  /** Qué jugador lleva qué héroe: `{ "elfa": "marta", "barbaro": "mesa" }`. */
  reparto: Record<string, string>;
}
```

**La semilla va en el montaje y no se calcula en el navegador.** Hoy sale de
`Date.now() % 100000` en `Juego.tsx:54`, y dos navegadores que hagan eso a la vez obtienen
números distintos: el mazo de tesoros se baraja distinto en cada casa y las dos partidas
divergen sin que nadie vea un error. Es el fallo más caro de esta fase y el más silencioso.

**La misión viaja por identificador, no entera.** Es un objeto grande y las dos casas ya lo
tienen en su propio código. Eso obliga a lo siguiente.

## La trampa de la versión, que es la de verdad

Si las dos casas corren código distinto —una con la pestaña abierta desde ayer, la otra
recién cargada de Pages— pueden aplicar reglas distintas a la misma lista de acciones y
**divergir en silencio**. No hay excepción, no hay pantalla roja: simplemente el orco está
vivo en una casa y muerto en la otra, y se descubre media hora después.

Por eso el montaje lleva `version` y **el relevo rechaza a quien no la traiga igual**, con
un motivo legible: «esta partida se creó con otra versión de la aplicación; recarga la
página». Rechazar es correcto; adivinar, no.

De dónde sale la cadena: la decide T34, que es quien monta la publicación. Mientras T34 no
esté, vale una constante en `src/red/protocolo.ts` y **una línea diciendo que T34 la
sustituye**. No inventes un hash del contenido: eso es trabajo de la publicación.

## El protocolo

Cuatro operaciones. Los nombres van en español, como el resto del código.

```
POST /partidas
     { montaje }                        → 200 { codigo, secreto }
GET  /partidas/:codigo?desde=N
                                        → 200 { montaje, acciones, total }
POST /partidas/:codigo/acciones
     { esperado: N, accion, autor }     → 200 { total }
                                        | 409 { total, acciones }   ← te habías quedado atrás
POST /partidas/:codigo/truncar
     { esperado: N, secreto }           → 200 { total } | 409 | 403
```

- **`esperado` es el mecanismo entero.** Es cuántas acciones creía tener quien escribe: si
  no coincide con las que hay, la escritura se rechaza y se le devuelven las que le
  faltaban, para que rehaga su jugada sobre el estado bueno. Sin esto, dos jugadores que
  pulsan a la vez meten dos acciones en un orden que ninguna de las dos pantallas ha visto,
  y ahí es donde se rompe la reproducibilidad. **Es el mismo candado que el push de `git`
  en el protocolo de este repositorio**, y por el mismo motivo.
- **`truncar` es el deshacer.** Deshacer aquí es rehacer la partida con una acción menos,
  así que en red es acortar el registro. Lo hace **solo la mesa**, y por eso lleva
  `secreto`: el que se devuelve al crear la partida y no viaja a los demás. Un niño que
  deshace desde su casa la jugada de otro es un problema de mesa, no de software, pero
  cuesta una línea evitarlo.
- **`autor` se guarda y no se comprueba.** El relevo no sabe qué figura mueve una acción
  —`{ tipo: "mover", destino }` no nombra a nadie—, así que **no puede** validar que te
  toque a ti. Eso lo hace el cliente en T31. Queda escrito aquí para que nadie lo lea como
  un descuido.

## Cómo hacerlo

- **La lógica pura va en `src/red/protocolo.ts`, no en el Worker.** Los tipos y las dos
  funciones que deciden algo —añadir con `esperado`, truncar con `esperado`— se escriben
  puras y se prueban con vitest sin levantar nada. `server/relevo.ts` queda como una
  cáscara que traduce HTTP a esas funciones. Si la decisión vive dentro del Durable Object,
  probarla exige desplegar, y entonces no se prueba.
- **Un Durable Object por partida**, con el código de partida como nombre. Es lo que da
  serialización de escrituras gratis: dentro de un objeto no hay dos peticiones a la vez, y
  el `esperado` se comprueba sin carreras.
- **El código de partida, cuatro o cinco letras** de un alfabeto sin `I`, `O`, `0` ni `1`:
  se dicta por teléfono y lo teclea alguien de diez años. Sale de `crypto.getRandomValues`
  en el servidor —**no** del `rng` del estado, que es el de los dados y tiene que quedar
  intacto—.
- **CORS abierto para la página de Pages.** Sin cabeceras `Access-Control-Allow-*` el
  navegador rechaza cada petición y el fallo se lee como «el relevo no responde».
- **Caducidad:** una partida abandonada no puede quedarse ahí para siempre. Un `alarm` del
  Durable Object que la borre a los treinta días basta, y treinta días es holgado para una
  campaña de fin de semana. Escríbelo en `server/README.md`.
- **`server/README.md` explica cómo se despliega**, con los comandos exactos. Quien lo lea
  dentro de tres meses no habrá estado en esta conversación.

## Lo que NO protege esto, y hay que decirlo

**La niebla es de pantalla, no de red.** Quien juega en su casa recibe la lista de acciones
entera y rehace el estado completo en su navegador: con las herramientas de desarrollo
puede ver las salas sin revelar. Taparlo de verdad exigiría que el servidor fuese el dueño
del estado y sirviera una vista recortada por jugador —otra aplicación, no esta— y no lo
pide nadie: se juega en familia.

**Está escrito aquí a propósito, como límite conocido y no como fallo**, para que quien
abra T32 no crea que la niebla que va a pintar guarda un secreto que no guarda.

## Trampas conocidas

- **No importes `src/engine/` en `server/`.** El relevo no valida reglas. Además el Worker
  no corre Node: `tsconfig.node.json` no es su sitio.
- **`vite.config.ts` dice `environment: "node"`**, así que los tests de esta tarea prueban
  funciones puras. No intentes montar el Durable Object dentro de vitest.
- **El plan gratuito de Cloudflare y los Durable Objects**: compruébalo el día que
  despliegues en vez de fiarte de lo que diga cualquiera, incluida esta línea. Si resultara
  que no entran en el plan gratuito, **para y escríbelo en el tablón**: la decisión de
  pagar o de cambiar de servicio es de Juan Luis, no tuya.
- **Desplegar necesita su cuenta.** Todo lo de esta tarea se escribe y se prueba sin cuenta;
  el `wrangler deploy` lo ejecuta él o lo ejecutas con su permiso escrito en el tablón.

## Tests que hay que añadir

En `tests/red-protocolo.test.ts`, sobre las funciones puras:

- Añadir con el `esperado` correcto deja el registro con una acción más.
- Añadir con un `esperado` viejo se rechaza **y devuelve las acciones que faltaban**.
- Dos añadidos seguidos con el mismo `esperado`: el segundo se rechaza.
- Truncar con el `esperado` correcto quita la última; con uno viejo, se rechaza.
- Truncar sin el `secreto` se rechaza.
- Un montaje con otra `version` se rechaza con motivo legible.
- **Y el que prueba la idea entera**: partiendo del mismo montaje, aplicar el registro con
  `repetir` da el mismo estado que jugarlo del tirón. Compara el JSON completo, no solo un
  campo. Es el test que sostiene toda la fase.

## Prohibido

- Meter reglas de HeroQuest en el relevo.
- Guardar el estado del juego en el servidor en vez del registro de acciones. Es la puerta
  de atrás que parece un atajo y rompe el deshacer, los tests y la reproducibilidad.
- Desplegar nada con una cuenta de Juan Luis sin su línea en el tablón.
- Tocar `src/ui/`, `src/engine/` o `_ESTADO.md` más allá de tu fila.

## Al terminar

Commit en `main` y push, con los ficheros añadidos por nombre. Línea en el registro de
finalizaciones con **el protocolo tal como haya quedado**, porque es lo que T31 va a
programar contra él, y con lo que hayas medido del plan gratuito de Cloudflare.
