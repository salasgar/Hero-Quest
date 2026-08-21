# Traspaso

Estado del proyecto a **22 de agosto de 2026**, para quien lo coja a partir de aquí.
El README cuenta qué es y cómo se usa; esto cuenta **en qué punto está, qué decisiones no
conviene deshacer y dónde están los cables pelados**.

---

## En una frase

Aplicación web que hace de máster de HeroQuest sobre un tablero físico, en el Mac, para
jugar con niños. Repositorio propio y público en <https://github.com/salasgar/Hero-Quest>,
rama `main`, último commit `df12fa9`.

## Qué se puede hacer hoy

- **Jugar una misión entera en la mesa.** `npm run dev`, se elige el grupo y se juega «El
  calabozo del guardián» de principio a fin: mover, abrir puertas, revelar salas, combatir,
  trampas, tesoros, hechizos, victoria y derrota. Con deshacer.
- **Imprimir todo el material**: 57 cartas y el tablero en cuatro folios.
- **Verificar el tablero** contra una foto, en la segunda pantalla.

Lo que **todavía hace un humano** y no debería: en el turno de Zargon hay que activar cada
monstruo y moverlo a mano. Eso es la Fase 4, y es lo siguiente.

## Qué NO existe todavía

Que no despiste el README ni el plan: describen el destino, no lo construido.

| Ruta | Estado |
|---|---|
| `src/ai/` | **No existe.** Es la Fase 4. |
| `server/` | **Vacío.** `npm run server` falla: ni hay código ni está instalado `tsx`. |
| `src/narrator/` | Solo `local.ts`. No hay voz ni cliente de Claude. |
| Editor, generador, campaña | Fases 6, 7 y 8. Nada escrito. |

## Cómo se verifica

```sh
npm test        # 174 tests en 12 ficheros
npm run typecheck
```

Las dos herramientas que más fallos han encontrado, y que conviene seguir usando:

1. **El test de juego al azar** (`tests/integracion.test.ts`): juega partidas enteras
   eligiendo acciones legales al azar y comprueba las invariantes en cada paso. Ha
   encontrado tres fallos reales del motor que ninguna lectura vio, incluido uno que dejaba
   a un héroe de pie sobre la casilla que un bloque acababa de sellar.
2. **Mirar el dibujo.** `npx vite-node scripts/render-tablero.tsx x.svg` vuelca el tablero
   a un SVG; los PDF de `imprimibles/` se abren y se miran. Así se vio que el marco del
   tablero salía a media línea, cosa que ningún test iba a notar nunca.

## Las decisiones que no conviene deshacer

**Claude no mueve monstruos.** La mecánica y la táctica las decide un motor determinista,
instantáneo y siempre legal. Claude será director de escena: narra y da sesgos de
personalidad en JSON validado. Con niños esperando en la mesa, unos segundos de latencia o
una jugada ilegal arruinan la partida. El narrador local es el que manda; la ruta de Claude
es una mejora, nunca un punto de fallo.

**El motor es un reductor puro** — `aplicarAccion(estado, accion) → { estado, eventos }` —
con el generador aleatorio **dentro** del estado. De ahí salen deshacer (rehacer la partida
con una acción menos da idéntico), guardar/reanudar (el estado es JSON y nada más) y los
tests. Las acciones ilegales devuelven `{ ok: false, motivo }`; no lanzan.

**Los dados están repartidos**: los niños tiran los suyos de verdad en la mesa y aquí solo
se teclea el resultado; los de los monstruos los tira la aplicación. Por eso las acciones
de ataque y movimiento aceptan resultados de fuera.

**El papel sale de los mismos datos que la pantalla.** Las cartas, la lista de mobiliario y
el tablero se generan de `src/data/`. Si mañana cambia el precio de un arma, cambia en los
dos sitios a la vez. No hay dos verdades que mantener sincronizadas a mano.

**Dos reglas de HeroQuest que casi todo el mundo recuerda mal** y que aquí están bien:
los hechizos **no gastan puntos de mente** (una carta, un uso por misión) y **abrir una
puerta es gratis** (ni movimiento ni acción).

## Cables pelados

Por orden de cuándo van a morder:

1. **Quien lleva ballesta no puede atacar cuerpo a cuerpo**, ni con una daga en la otra
   mano: `objetivosDeAtaque` encuentra el arma a distancia y descarta a los adyacentes. Hoy
   no molesta porque ningún héroe empieza con ballesta; en cuanto haya tienda (F8) se nota.
   Arreglarlo es separar el ataque en dos modos y que `dadosDeAtaque` sepa cuál.
2. **Cuatro hechizos no hacen nada.** Genio, Atravesar la roca, Velo de niebla y Viento
   veloz están en los datos y en las cartas, pero sus efectos caen en el `default` del
   reductor: gastan la carta y se narran, y ahí acaba todo.
3. **Los valores marcados `porVerificar`** en `equipment.ts` y `spells.ts` decían
   «cotéjalo con tus cartas originales». Ya no tiene sentido: **no hay caja original**.
   O se congelan como nuestros y se quita el aviso de las cartas, o se buscan en el
   reglamento. Es una decisión pendiente, no una tarea.
4. **La casilla impresa mide 1,9 cm.** Está sin confirmar que las figuras de cartón que ya
   están hechas quepan. Si no caben, la salida es sacar el tablero en 6 o 9 folios, no
   tocar el reparto: el 1,9 sale de dividir un A4, no de un capricho.

## Lo siguiente: la Fase 4

Zargon automático. Puntuación de objetivos (priorizar al herido, al mago, al que defiende
poco), pathfinding sobre `alcanzables`, personalidades por especie y tres dificultades.
**El nivel torpe importa**: jugando con niños quieres que ganen a veces. La forma de saber
si está bien es simular cien partidas por nivel y mirar el porcentaje de victorias, no leer
el código.

Todo lo que necesita ya está: el motor sabe qué es legal, `alcanzables` da los caminos y
`selectors.ts` da los objetivos. La IA solo tiene que elegir entre acciones legales.

## Cosas prácticas del entorno

- Node 26 y npm 11. `tsc -b` **se cuelga** en este repo: no hay `composite: true`. Usar
  `tsc -p tsconfig.json --noEmit`, que es lo que hace `npm run typecheck`.
- `npm run cartas` y `npm run tablero` invocan Google Chrome sin ventana desde
  `/Applications`. Sin Chrome, se queda en el HTML.
- **El Mac se satura a menudo** (carga por encima de 12) y `tsc` y `vitest` pasan de
  segundos a varios minutos. Conviene encadenar verificación y commit en una sola tarea en
  segundo plano en lugar de ir sondeando.
- La clave de la API de Claude vivirá **solo en el servidor**, en un `.env` que no se
  commitea. Nunca en el navegador.
- El repositorio es público e incluye `public/tablero-referencia.webp`, que es una foto del
  tablero de Hasbro. Está avisado y asumido.
