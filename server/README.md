# El relevo de acciones

El servicio que reparte una partida entre dos casas. Es lo que hace posible que
alguien juegue un héroe desde otro sitio mientras el tablero físico sigue en el
salón.

**No sabe jugar a HeroQuest.** Guarda una lista de acciones y la reparte en orden;
las reglas las aplica cada pantalla con el motor, que es puro y determinista. Todo
lo que decide algo está en `src/red/protocolo.ts` y probado en
`tests/red-protocolo.test.ts`, sin desplegar nada. `relevo.ts` es la cáscara HTTP.

## Por qué esto basta

`aplicarAccion` es pura, el generador de dados vive **dentro** del estado y
`Accion` es JSON plano. Así que jugar en red no es sincronizar el estado: es
repartir la lista de acciones, y cada casa rehace la partida con
`repetir(inicial, acciones)` —lo mismo que ya hace el «deshacer»—. Lo que viaja
por el cable son decenas de objetos pequeños, no un tablero.

## El protocolo

```
POST /partidas
     { montaje }                        → 200 { codigo, secreto }
GET  /partidas/:codigo?desde=N
                                        → 200 { montaje, entradas, total }
POST /partidas/:codigo/acciones
     { esperado: N, accion, autor }     → 200 { total }
                                        | 409 { motivo, entradas, total }
POST /partidas/:codigo/truncar
     { esperado: N, secreto }           → 200 { total } | 409 | 403
```

Tres cosas que no son evidentes leyendo la lista:

- **`esperado` es el mecanismo entero.** Es cuántas acciones creía tener quien
  escribe. Si no coincide, se rechaza y se le devuelve lo que le faltaba, para que
  se ponga al día y reintente. Es el mismo candado que el `git push` del protocolo
  del tablón, y por el mismo motivo.
- **El 409 no es un fallo**, es el caso normal de dos jugadores que pulsan a la
  vez.
- **`autor` se guarda y no se comprueba.** Una acción no nombra a su figura
  —`{ tipo: "mover", destino }` no dice quién se mueve—, así que el relevo no
  **puede** validar de quién es el turno. Eso lo hace el cliente (T31). No es un
  descuido.

## Lo que no protege

**La niebla es de pantalla, no de red.** Quien juega desde su casa recibe el
registro entero y puede reconstruir todo el estado en su navegador. Taparlo de
verdad exigiría que el servidor fuese el dueño del estado y sirviera una vista
recortada por jugador: otra aplicación, no esta. Se juega en familia.

## Desplegar

**Necesita la autorización escrita de Juan Luis en `_ESTADO.md`**: es su cuenta y
es un servicio de terceros donde quedan guardadas las partidas. Lo que hay en este
directorio se escribe y se prueba sin cuenta; lo que requiere su palabra es el
despliegue.

```sh
npx wrangler deploy --config server/wrangler.toml
```

Antes de dar el despliegue por bueno:

1. **Comprueba que los Durable Objects entran en el plan gratuito** que tenga la
   cuenta ese día, en vez de fiarte de esta página. Si no entran, **para y
   escríbelo en el tablón**: pagar o cambiar de servicio lo decide él.
2. Crea una partida, únete desde otro navegador y juega un turno.
3. Recarga las dos pestañas: el registro está en el relevo, así que la partida
   sigue.

## Dos cosas que hay que saber antes de redesplegar

- **Una versión nueva corta las partidas vivas.** El montaje lleva dentro la
  cadena de versión y el relevo rechaza a quien no la traiga igual. Es
  deliberado: dos casas con código distinto pueden aplicar reglas distintas a la
  misma lista de acciones y divergir en silencio, y eso es peor que un mensaje
  claro pidiendo recargar. No redespliegues un sábado por la tarde.
- **Las partidas caducan a los treinta días** sin tocarlas, con un `alarm` del
  Durable Object que las borra. Holgado para una campaña de fin de semana.

## Este directorio tiene otro inquilino pendiente

`server/` está reservado desde agosto para el **proxy de la API de Claude** de la
Fase 5, para que la clave no llegue nunca al navegador. Todavía no existe.
Convivirán: no borres lo que no entiendas.
