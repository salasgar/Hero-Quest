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

## La cadena de versión son dos cosas, y conviene no mezclarlas (T34)

T34 decía «sustituye la versión por el hash del commit publicado». **No se ha
hecho, y el motivo es medible**, así que queda escrito aquí:

`crearRegistro` compara la versión que trae el montaje con la constante `VERSION`
del **relevo**. La página se publica desde GitHub Pages y el relevo se despliega
en Cloudflare con `wrangler`, que no pasa por vite y por tanto no recibe ninguna
variable `VITE_*`: si la página llevara el hash de su commit, el relevo seguiría
con el suyo y **rechazaría todas las partidas nuevas** en cuanto una de las dos
se volviera a publicar sin la otra. Sería un despliegue acoplado al otro para
siempre, y en dos servicios con calendarios distintos.

Así que hay dos cosas, con dos usos:

- **`VERSION`, en `src/red/protocolo.ts`** — la versión de **las reglas**. Se sube
  a mano cuando cambia algo que altere cómo se aplica una acción, y es lo que
  impide que dos casas diverjan en silencio. Si la subes, redespliega las dos.
- **El hash del commit, en la esquina de la pantalla** — qué construcción está
  corriendo esa pestaña. Sirve para lo que la caché de Pages estropea: una
  pestaña de ayer ejecutando el código de ayer. Se mira, no se compara.

Si algún día quieres que la del protocolo sea el hash, lo que hay que cambiar es
que el relevo **deje de comparar con su propia constante** y solo guarde la del
montaje: quien se une ya compara contra la suya en `unirse` (`cliente.ts`), que es
donde de verdad se detecta que dos casas llevan código distinto. Eso toca el
protocolo, así que es decisión de Juan Luis (regla 4 del tablón).

## Este directorio tiene otro inquilino pendiente

`server/` está reservado desde agosto para el **proxy de la API de Claude** de la
Fase 5, para que la clave no llegue nunca al navegador. Todavía no existe.
Convivirán: no borres lo que no entiendas.
