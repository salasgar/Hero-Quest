# T31 · La partida en red, en el cliente

**Precondición:** **T30 hecha** — necesitas el protocolo escrito y probado, no imaginado.
**Banda de modelo:** ALTO — aquí es donde dos casas divergen sin dar un error, y un fallo
se descubre media hora después, en mitad de una partida con niños delante.
**Ficheros que bloquea:** `src/red/cliente.ts` (nuevo), `src/ui/usePartida.ts`,
`tests/red-cliente.test.ts` (nuevo). **No toca el motor.**
**Duración esperada:** 4 h · **Encadenable con:** — · **Ficheros que toca:** los de
«Ficheros que bloquea», arriba, más `tests/red-protocolo.test.ts` (su conversor provisional).
(Líneas añadidas en la migración del reparto del 2026-09-06; la tarea ya estaba LISTA,
`hechos/terminadas/31--*`. El cierre es el de `proyecto.md`, con terminada en `hechos/`.)
Lee `_COMUN.md` primero, y la cabecera de `tareas/T30-relevo-de-acciones.md`, que es donde
están las cuatro decisiones firmadas de la fase.

## Qué hay que conseguir

Que `usePartida` pueda vivir de un registro compartido en vez de uno local, **sin que la
partida de sobremesa cambie ni un ápice**. Hoy el hook guarda `acciones: Accion[]` en
memoria y rehace el estado con `repetir(inicial, acciones)`. En red, esa misma lista vive
en el relevo. La forma del hook no cambia; cambia de dónde sale la lista.

## Antes de empezar: mira si ya está hecho

```sh
ls src/red/cliente.ts 2>/dev/null; grep -n "codigo\|relevo" src/ui/usePartida.ts
```

## La regla que manda sobre todas

**Sin red, la aplicación tiene que seguir funcionando exactamente igual.** El caso normal
de este proyecto es una familia alrededor de un tablero, sin nadie fuera de casa. Si un
fallo del relevo, una wifi caída o un servicio de Cloudflare con problemas dejan sin jugar
en el salón, la fase entera ha empeorado el producto.

En la práctica: el modo local es el que hay hoy y **no se reescribe encima**. La red es un
camino aparte que se elige al empezar la partida.

## Cómo hacerlo

- **`src/red/cliente.ts` no sabe React.** Expón algo pequeño: `crear(montaje)`,
  `unirse(codigo)`, `suscribir(cb)`, `enviar(accion)`, `truncar()`. Devuelve el registro
  completo y avisa cuando crece. Que no sepa React es lo que permite probarlo con vitest,
  que corre en `node`.
- **Sondeo cada segundo, no WebSocket.** Un turno de HeroQuest dura un minuto largo: un
  segundo de retraso no se nota, y a cambio te ahorras la máquina de estados de
  reconexión, que es donde viven los fallos que solo aparecen cuando a alguien se le
  duerme el portátil. `GET /partidas/:codigo?desde=N` con el total que ya tienes. Si algún
  día molesta, el mismo extremo puede quedarse esperando; el cliente no se entera.
- **Al recibir acciones nuevas, `repetir(inicial, acciones)` y ya.** No apliques solo las
  que faltan «para ir más rápido»: rehacer la partida entera es barato —son decenas de
  acciones, no millones— y es la única forma de estar seguro de que tu estado es el mismo
  que el de la otra casa.
- **El 409 no es un error, es el caso normal.** Cuando el relevo te diga que te habías
  quedado atrás, incorpora lo que te manda, **vuelve a comprobar que tu acción sigue
  siendo legal** con `aplicarAccion` y solo entonces reenvíala. Si ya no es legal —el orco
  al que ibas a pegar acaba de morir—, explícalo en pantalla en vez de reintentar en
  bucle.
- **Enviar es optimista, pero se revierte.** Pinta la acción en cuanto se pulsa; si el
  relevo la rechaza, vuelve al estado del registro. Con niños, una pantalla que tarda un
  segundo en responder se pulsa tres veces.
- **Quién puede actuar lo decide el cliente**, con el `reparto` del montaje: si el turno es
  de una figura que no llevas, la pantalla no ofrece acciones. **El relevo no puede
  comprobarlo** —una acción no nombra a su figura—, así que si esto no se hace aquí, no se
  hace en ningún sitio.
- **El turno de Zargon es de la mesa.** Los monstruos los mueve la casa donde está el
  tablero, siempre: es quien tiene las miniaturas en la mano.
- **Deshacer solo la mesa**, con el `secreto`. En las demás pantallas, el botón no está.

## Trampas conocidas

- **La semilla.** `Juego.tsx:54` la saca de `Date.now() % 100000`. En red viene del
  montaje. Si se te cuela un `Date.now()` en el camino, las dos casas barajan el mazo de
  tesoros distinto y divergen desde el turno cero, sin error visible.
- **`crearPartida` recibe la misión entera; el montaje solo lleva su identificador.** Haz
  la conversión en un sitio y uno solo. Si dos sitios construyen las opciones, algún día
  construirán dos partidas distintas.
- **El estado no se envía nunca por la red.** Si te descubres serializando
  `EstadoPartida`, para: eso rompe el deshacer y convierte un fallo de reglas en un estado
  imposible de reproducir. Lo que viaja son acciones.
- **La niebla es de pantalla, no de red.** Quien está en su casa recibe el registro entero
  y puede reconstruir todo el estado en su navegador. Está explicado en T30; no lo
  arregles aquí ni lo presentes como resuelto.
- **Dos pestañas del mismo jugador** son dos clientes con el mismo `autor`. No hay que
  impedirlo, pero que no se rompa: el `esperado` ya las serializa.

## Tests que hay que añadir

Con un relevo de mentira en memoria —el mismo `protocolo.ts` de T30, sin HTTP—:

- Dos clientes sobre el mismo montaje llegan al **mismo estado** después de una tanda de
  acciones. Compara el JSON completo.
- Un cliente que envía con el `esperado` viejo recibe el 409, se pone al día y su acción
  acaba en el registro **una sola vez**.
- Una acción que deja de ser legal tras ponerse al día no se reenvía.
- El cliente sin `secreto` no puede truncar.
- Un cliente que no lleva la figura del turno no ofrece acciones.
- **El modo local sigue pasando todos los tests que ya tenía `usePartida`.**

## Prohibido

- Reescribir el modo local encima del de red. Si el relevo se cae, se sigue jugando.
- Enviar el estado en vez de las acciones.
- Que la interfaz llame a `aplicarAccion` saltándose el hook: el historial es lo que
  sostiene el deshacer, y en red además es lo que sostiene la partida entera.
- Reintentar un envío en bucle sin volver a comprobar la legalidad.

## Al terminar

Commit y push. En el registro de finalizaciones, **cómo quedó la reconciliación del 409**,
que es lo que T32 y T33 dan por hecho, y si en la práctica el sondeo de un segundo se nota
o no.
