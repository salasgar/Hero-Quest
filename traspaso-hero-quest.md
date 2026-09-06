# Traspaso — HeroQuest

Actualizado: 2026-09-06 · Sesión que lo escribe: `66e4a4ea`

## Objetivo

Que se pueda jugar a HeroQuest **con alguien que está en otra casa**, sin renunciar a lo
que es el proyecto: el tablero físico en la mesa del salón y la aplicación haciendo de
máster. Quien está lejos es un héroe más del grupo y juega desde su pantalla.

Es una fase dentro del proyecto grande, que está descrito en `README.md` y `TRASPASO.md`.

## Estado actual

**El estado de cada tarea está en `_ESTADO.md`, que es la fuente de verdad.** Aquí solo lo
que el tablón no recoge.

La fase de red son cinco tareas, T30 a T34. Cuatro están hechas y empujadas: el relevo
(T30), la partida en red en el cliente (T31, de otra sesión), la pantalla de quien juega
desde su casa (T32) y quién tira los dados (T33). **Se puede jugar en red de punta a punta
en local.** Falta T34: publicar en GitHub Pages y desplegar el relevo.

El tablón queda al día: las cinco filas y los registros de T32 y T33 están escritos y
empujados, y esta sesión no retiene ningún candado.

## Siguiente paso

1. **Probar la partida en red con dos navegadores.** Es lo que T32 exige para darse por
   buena y ninguna sesión lo ha hecho todavía: lo que hay que comprobar no es que compile,
   sino que una jugada hecha en una ventana aparece en la otra y que la niebla no enseña
   de más.
   ```sh
   npm run relevo     # el relevo en memoria, en localhost:8787
   npm run dev        # la aplicación, en localhost:5173
   ```
   Se abre `http://localhost:5173/?relevo=http://localhost:8787`, se eligen héroes, se
   pulsa «Jugar con alguien fuera», se escribe un nombre junto a un héroe y se copia el
   enlace que sale. Ese enlace, abierto en una ventana de incógnito, es la casa de fuera.
2. **T34**, cuando Juan Luis firme las dos autorizaciones que están apuntadas en el
   tablón, en «Pendientes de su palabra»: activar GitHub Pages y crear la cuenta de
   Cloudflare para desplegar el relevo.

Banda de modelo para retomar: **MEDIO** — probar con dos navegadores y corregir lo que
salga es trabajo de entender y ajustar, no de diseñar; el diseño de la fase ya está
decidido y escrito.

## Decisiones tomadas

| Decisión | Por qué |
|---|---|
| Quien está lejos es **un héroe más**, no otra mesa ni el árbitro | Lo eligió Juan Luis el 2026-09-05. La mesa física sigue en su salón |
| Ve el **tablero con niebla**: solo lo descubierto | Lo eligió él, por encima de «solo su hoja». Así se juega **sin depender de una videollamada** apuntando a la mesa |
| La aplicación se publicará en `salasgar.github.io` | Lo pidió él. El repositorio ya es público y Pages sale de un `vite build` |
| Las acciones pasan por un **relevo alojado** (Cloudflare Worker + Durable Object) | Pages sirve ficheros y no corre ningún proceso: dos navegadores que abran esa página no se ven entre sí |
| Los dados de quien juega fuera: **las dos opciones**, a elegir por él | Pidió expresamente las dos. Quien tenga dados querrá tirarlos; quien no los tenga no puede jugar si la app no se los tira |
| **Jugar en red es repartir la lista de acciones**, no sincronizar el estado | El motor ya era determinista: `aplicarAccion` es pura, el generador vive dentro del estado y `Accion` es JSON plano. Cada casa rehace la partida con `repetir`, que es lo que ya hacía el deshacer. Consecuencia: **el motor no se toca en toda la fase** |
| La semilla se decide **una vez, al crear**, y viaja en el montaje | Si cada navegador la calculara, las dos casas barajarían el mazo distinto y divergirían desde el turno cero **sin dar ningún error** |
| El relevo **no sabe jugar** a HeroQuest | Guarda una lista y la reparte. Las reglas las aplica cada pantalla con el motor |
| Quién puede actuar lo decide **el cliente**, no el relevo | Una acción no nombra a su figura: `{tipo:"mover", destino}` no dice quién se mueve. El relevo **no puede** comprobarlo |
| La preferencia de dados vive en el **navegador**, no en el registro | Dice quién tiene dados en la mano, que es un dato del salón de cada uno. Si viajara, cambiarla sería una acción y ensuciaría el deshacer |
| En la pantalla de la mesa **no se pregunta** quién tira | `localStorage` es por navegador: probando las dos pantallas en el mismo, la mesa heredaría «que los tire la aplicación» y se pondría a tirar sola |

## Descartado — no volver a proponer

| Se descartó | Motivo |
|---|---|
| **Un túnel al portátil** (cloudflared/ngrok) en vez de un relevo alojado | Lo descartó Juan Luis al elegir el relevo alojado, que da URL fija y no depende de que el portátil esté encendido |
| **Navegador a navegador** (WebRTC/PeerJS) | También descartado por él. Es lo más frágil: hay redes donde no conecta y depende de un servicio ajeno de señalización |
| **Guardar el estado de la partida en el servidor** | Rompe el deshacer, los tests y la reproducibilidad. Lo que viaja son acciones. Es el atajo que más veces parece buena idea |
| **Tapar la niebla de verdad, por red** | Quien juega desde su casa recibe el registro entero y puede reconstruir el estado en su navegador. Taparlo exigiría un servidor dueño del estado sirviendo una vista por jugador: otra aplicación. **Es un límite conocido, no un fallo pendiente**; se juega en familia |
| **Una pantalla con `if (esRemoto)` por dentro** | Son dos productos distintos. La diferencia es **qué estado se pinta**, en una línea; repartida por seis sitios es como se cuela una sala sin abrir |
| **Filtrar la niebla por «¿está abierta su sala?»** | Parece equivalente y no lo es: un pasillo no es ninguna sala, así que deja ver a cualquier monstruo del pasillo. Se filtra por `monstruosEnTablero` |
| **Filtrar las puertas a mano por `puertasVistas`** | Borraba del tablero de casa la **puerta secreta recién encontrada**: las secretas van por `descubierta`. Se consume `puertasVisibles`, del motor |
| **WebSocket para el sondeo** | Un turno dura un minuto largo: un segundo de retraso no se nota, y a cambio no hay máquina de estados de reconexión |

## Archivos

Los de esta fase. Todos con su porqué dentro, en la cabecera.

- `src/red/protocolo.ts` — qué se guarda de una partida y quién puede escribir. Puro y probado.
- `src/red/cliente.ts` — el transporte y `SesionDeRed`. De otra sesión (T31).
- `src/red/niebla.ts` — `comoLoVe(estado, quien)`. **Devuelve un estado para pintar, nunca para pasárselo al motor.**
- `server/relevo.ts` + `server/wrangler.toml` — el relevo de Cloudflare. Escrito y probado, **sin desplegar**.
- `server/relevo-local.ts` — el mismo protocolo en Node, en memoria. `npm run relevo`. Es lo que permite probar sin desplegar nada.
- `server/README.md` — el protocolo, cómo se despliega y qué comprobar antes.
- `src/ui/VistaDeHeroe.tsx` — la pantalla de quien juega desde su casa.
- `src/ui/EntrarEnPartida.tsx` — crear la partida y unirse por enlace.
- `src/ui/useAccionesDeTurno.ts` — lo que comparten las dos pantallas: diálogos de dados, teclado y reparto de quién tira.
- `tareas/T30-…` a `tareas/T34-…` — las cinco tareas, con las cuatro decisiones firmadas copiadas en la cabecera de T30.

## Contexto que no está en los archivos

- **Un dato que nadie ha comprobado y que no se debe inventar:** si los Durable Objects
  entran hoy en la capa gratuita de Cloudflare. Está escrito como primer paso del
  despliegue en `server/README.md`, con la orden de parar y avisar si no entran. La
  decisión de pagar o cambiar de servicio es de Juan Luis.
- **Redesplegar corta las partidas vivas.** El montaje lleva la versión dentro y el relevo
  rechaza a quien no la traiga igual. Es deliberado —dos casas con código distinto pueden
  aplicar reglas distintas a las mismas acciones y divergir en silencio— pero conviene no
  redesplegar un sábado por la tarde.
- **La numeración salta de T18 a T30 a propósito.** Los nombres T19–T22 los reclamó otra
  sesión el mismo día para cuatro tareas de reglas. Se renumeró el bloque de red.
- **En este repositorio se edita con las herramientas de edición, no con `sed` ni
  heredocs**, porque el hook de candados solo ve `Edit|Write`. Esta sesión lo incumplió dos
  veces —en `estilos.css` y en `Instrucciones.tsx`—; no pisó a nadie, pero está apuntado en
  el registro del tablón para que no se repita.
