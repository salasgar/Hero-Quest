# Traspaso

Estado del proyecto a **22 de agosto de 2026**, para quien lo coja a partir de aquí.
El README cuenta qué es y cómo se usa; esto cuenta **en qué punto está, qué decisiones no
conviene deshacer y dónde están los cables pelados**.

---

## En una frase

Aplicación web que hace de máster de HeroQuest sobre un tablero físico, en el Mac, para
jugar con niños. Repositorio propio y público en <https://github.com/salasgar/Hero-Quest>,
rama `main`. **En qué commit está y qué tests pasan lo dice `_ESTADO.md`**: este documento
cuenta el porqué, que no caduca, y no lleva cifras que caduquen cada tarde.

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
npm test
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

### Arreglados

- ~~La ballesta anulaba el cuerpo a cuerpo~~. El ataque tiene ahora dos modos y lo decide
  la casilla del objetivo, no el arma más gorda del inventario: pegado se apuñala con la
  daga, de lejos se dispara con la ballesta. Sin arma de cuerpo a cuerpo se pelea igual,
  con un dado. `modoDeAtaqueContra` es la única función que lo decide, y la usan el motor
  y la interfaz, para que no puedan discrepar.
- ~~Cuatro hechizos no hacían nada~~. Genio, Atravesar la roca, Velo de niebla y Viento
  veloz ya se ejecutan. Un test recorre las clases de efecto declaradas y falla si alguna
  se queda sin implementar, que era el agujero de fondo.
- ~~Los `porVerificar` se quedaron sin referencia~~. Se buscaron en el **reglamento oficial
  de 2021** (Avalon Hill F3649, descargable de instructions.hasbro.com) y en el texto de
  las cartas. No queda ninguno: `POR_VERIFICAR` y `HECHIZOS_POR_VERIFICAR` están vacíos y
  hay un test que lo exige. Lo que cambió está en «Lo que decía el reglamento», abajo.
- ~~Faltaba confirmar que las figuras quepan en 1,9 cm~~. Confirmado por el usuario el
  22 de agosto de 2026: **caben**. El tablero de cuatro folios es válido.

### Lo que decía el reglamento (y nosotros no)

Casi nada de lo que yo había supuesto sobrevivió al cotejo:

| | Lo que teníamos | Lo que dice |
|---|---|---|
| Velo de niebla | Nadie podía atacarte | Atraviesas **monstruos** en tu próximo movimiento |
| Viento veloz | Doblaba la tirada | Tiras **cuatro dados** en vez de dos |
| Tempestad | Toda la sala pierde el turno | **Un** monstruo pierde su turno |
| Genio | 4 dados | **5** dados (y también puede abrir una puerta) |
| Piel de piedra | +2 defensa toda la misión | **+1**, y se rompe al recibir un punto de daño |
| Bola de fuego / Fuego de la ira | Dados de combate, contar calaveras | Daño **fijo**, y el objetivo tira dados rojos: cada 5 o 6 le resta uno |
| Atravesar la roca, Velo de niebla | Solo sobre uno mismo | Sobre **cualquier héroe** |
| Lanza | 250 monedas | **150** |
| Herramientas | Gratis | **250** monedas |
| Armadura de placas | Sin penalización | **Resta 2** a cada tirada de movimiento |
| Hacha de batalla | Atacaba en diagonal | **No**: en diagonal alcanzan el bastón y la lanza |

El ataque en diagonal, que estaba declarado en los datos y en las cartas pero no lo
aplicaba el motor, ya funciona: es la regla que permite que dos héroes ataquen a la vez al
monstruo que tapona un vano de puerta, en vez de hacer cola.

> **Este trabajo está repartido.** Las siete divergencias de abajo y la Fase 4 son once
> tareas con su fichero en `tareas/`, coordinadas por el tablón `_ESTADO.md`. Si vas a
> ponerte con alguna, **empieza por el tablón**, no por aquí.

### Pendientes: lo que el reglamento dice y el motor todavía no hace

Encontrado al cotejar, no arreglado. **Son cambios de regla, así que decidid antes**:

1. **Los héroes pueden pasar por encima de otros héroes.** «You *may* pass over other
   heroes» —solo los monstruos taponan. El motor bloquea a todos, y esto es lo que obligó a
   buscar un pasillo de dos casillas para la entrada de la misión.
2. **Las figuras cortan la línea de visión de los hechizos.** «If the line does not cross a
   wall, closed door, hero, or monster, the target is declared visible.» Nuestro
   `vision.ts` dice lo contrario, y por escrito.
3. **Buscar trampas y pasadizos exige que no se vea ningún monstruo**, igual que buscar
   tesoro. `puedeBuscarTrampas` no lo comprueba.
4. **Los monstruos no disparan las trampas ocultas.** El motor se las dispara a cualquiera.
5. **Dentro de un foso se ataca y se defiende con un dado menos** (mínimo uno). Y un foso
   ya disparado no se puede desarmar.
6. **Cada héroe puede registrar una sala una vez**, no la sala una vez en total.
7. **El mago no puede llevar armadura normal ni armas grandes.** No está modelado.

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
