# HeroQuest · el máster es la aplicación

Aplicación web para jugar a HeroQuest **con el tablero físico en la mesa**, donde la
aplicación hace de máster (Zargon): lleva la misión, mueve y hace atacar a los monstruos,
tira los dados que le tocan, dispara las trampas, reparte los tesoros y narra la partida
en voz alta.

Tablero de referencia: edición Avalon Hill 2021, 26 × 19 casillas.

## Cómo se juega

El tablero, las miniaturas y las cartas son físicos. La aplicación corre en el portátil,
al lado del tablero, y mantiene un espejo digital de la partida:

- Los héroes anuncian su movimiento y se introduce en la app (dos clics o el teclado).
- Los niños tiran sus dados y teclean cuántas calaveras han sacado.
- El turno de los monstruos es automático: la app decide, tira y narra. El adulto solo
  mueve la miniatura.

## Estado

| Fase | Qué es | Estado |
|---|---|---|
| F0 | Andamiaje (Vite + React + TS + Vitest) | hecho |
| F1 | Geometría del tablero y catálogos | hecho |
| F2 | Motor de reglas | hecho |
| F3 | Pantalla de máster · **primer hito jugable** | hecho |
| — | Material imprimible: cartas, mobiliario y tablero | hecho |
| F4 | IA de monstruos (Zargon automático) | **siguiente** |
| F5 | Narrador: voz, banco local y API de Claude | |
| F6 | Editor de misiones | |
| F7 | Generador de mazmorras | |
| F8 | Campaña y progresión | |

`src/ai/`, `server/` y el resto de `src/narrator/` **todavía no existen**: aparecen más
abajo como el sitio donde irán, no como código escrito. Cuántos tests hay en verde, en
`_ESTADO.md`.

## Arranque

```sh
npm install
npm run dev        # http://localhost:5173
npm test           # tests del motor y de los datos
npm run typecheck

npm run cartas     # imprimibles/cartas.pdf  — 57 cartas en 7 hojas
npm run tablero    # imprimibles/tablero.pdf — 4 folios A4 en 2 x 2
```

Los dos últimos necesitan Google Chrome instalado en `/Applications`: generan el HTML y
lo imprimen a PDF con Chrome sin ventana.

### Publicada en GitHub Pages

<https://salasgar.github.io/Hero-Quest/> — para jugar desde la tableta o desde
cualquier trasto de casa con navegador, sin arrancar nada en el Mac.

Se publica sola: cada empujón a `main` dispara `.github/workflows/pages.yml`, que
pasa `npm run typecheck` y `npm test` **antes** de construir y solo publica si
están en verde. En la esquina de abajo a la derecha sale el hash del commit que
está corriendo esa pestaña, que es como se pilla la caché de Pages sirviendo
código viejo.

Lo que la página publicada **no** hace es juntar dos casas: Pages sirve ficheros
y no corre ningún proceso, así que dos navegadores que la abran no se ven entre
sí. Para eso hace falta el relevo (`server/`), que se despliega aparte y todavía
no lo está.

#### Cuando algo salga mal: descargar la partida

Por lo mismo —al otro lado no hay ningún proceso que recoja nada—, la aplicación
no puede mandar a ningún sitio lo que ha ido pasando. Lo que hace es guardarlo en
el navegador según se juega, y el botón **«Descargar partida»** de la barra baja
un `.json` con todo: la semilla, el grupo, la lista de acciones, **las acciones
que la aplicación rechazó** —«pulsé y no pasó nada», que es lo más difícil de
reconstruir después— y el diario tal cual salió en pantalla.

Ese fichero se guarda en `partidas/` de este repositorio (ya está en
`.gitignore`, así que no se sube a git) y se repite con:

```sh
npm run repetir partidas/heroquest-calabozo-2026-09-06-1830.json
```

El guion rehace la partida acción a acción y va imprimiendo lo que la pantalla
enseñaba en cada paso: quién actuaba, el movimiento que le quedaba, las casillas
verdes, los objetivos a tiro, las puertas al alcance y las pintadas, y los
monstruos puestos sobre el tablero. Nada de eso se guarda en el fichero: se
recalcula, porque el motor es determinista y el generador aleatorio va dentro del
estado. Al final compara una huella de la partida; si no cuadra, es que el código
de este Mac no es el que corría en la página, y el propio fichero dice desde qué
commit se publicó (`git worktree add /tmp/repro <commit>`).

Hay dos pantallas:

- **Partida**: primero se elige el grupo (clase, género, nombre y elementos de hechizos) y
  después se juega. Ya se puede jugar «El calabozo del guardián» de principio a fin, con
  las reglas completas.
- **Verificar tablero**: compara el tablero digital con el físico, permite corregir
  casillas a mano y genera el mapa listo para pegar en `src/data/board-base.ts`.

### Atajos de teclado

El teclado es la entrada rápida; el ratón es la alternativa. Un turno de héroe se
despacha en tres o cuatro pulsaciones.

| Tecla | Qué hace |
|---|---|
| `T` | Pide la tirada de movimiento (`⇧T` la tira la aplicación) |
| `←` `↑` `↓` `→` | Mueve una casilla |
| `A` | Ataca al objetivo disponible |
| `P` | Abre la puerta que tienes al lado |
| `B` / `R` | Busca tesoro / busca trampas y pasadizos |
| `0`–`9` | Responde cuántas calaveras o escudos has sacado |
| `↵` | Termina el turno (o activa el siguiente monstruo) |
| `Z` | Deshace |

Los dados se reparten así: **los héroes tiran los suyos de verdad en la mesa** y aquí solo
se teclea el resultado; **los de los monstruos los tira la aplicación**, que para eso hace
de máster.

## El motor

`aplicarAccion(estado, accion) → { estado, eventos }` es una función pura: no muta lo que
recibe, no tira dados fuera del generador con semilla que lleva dentro el estado y no sabe
nada de React. De ahí salen tres cosas que importan jugando con niños:

- **Deshacer**: rehacer la partida desde el principio con una acción menos sale idéntica.
- **Guardar y reanudar**: el estado es JSON y nada más.
- **Tests**: se comprueba una regla sin levantar un solo píxel de interfaz.

Las acciones ilegales no lanzan excepciones: devuelven `{ ok: false, motivo }` para que la
interfaz pueda explicar por qué no se puede hacer eso.

Dos reglas que se confunden a menudo y que aquí están implementadas como manda el juego:

- **Los hechizos no gastan puntos de mente.** Cada carta se lanza una vez por misión y se
  descarta. La mente es un atributo que usan algunos efectos, no un depósito de maná.
- **Abrir una puerta es gratis**: ni gasta movimiento ni consume la acción del turno.

## Herramientas

```sh
npx vite-node scripts/render-tablero.tsx tablero.svg
```

Renderiza el tablero a un SVG suelto para revisarlo sin abrir el navegador. Útil para ver
de un vistazo si la niebla, los resaltados y las puertas se pintan donde toca.

## Cómo está montado

- `src/engine/` — motor de reglas, TypeScript puro, sin React y testeable.
- `src/data/` — geometría del tablero, catálogos y medidas de lo imprimible.
- `src/ui/` — la pantalla del máster y la elección de héroes.
- `src/narrator/` — de momento solo `local.ts`, el banco de frases en español.
- `scripts/` — generadores de las cartas y del tablero, y el volcado del tablero a SVG.
- `src/ai/` *(por escribir, F4)* — la táctica de los monstruos: determinista y siempre legal.
- `server/` *(vacío, F5)* — irá el proxy de la API de Claude, para que la clave no llegue
  nunca al navegador. `npm run server` todavía no funciona: no hay código ni `tsx`.

**Claude no mueve monstruos.** La mecánica y la táctica las decide el motor determinista;
Claude es director de escena: narra y da sesgos de personalidad. Si se cae la red, la
partida sigue con el narrador local.

## Los héroes

Los cuatro de la caja más el hada. **Cada clase se juega en masculino o en femenino**
—Bárbaro/Bárbara, Enano/Enana, Elfo/Elfa, Mago/Hechicera— y eso no cambia ninguna regla:
solo el nombre. Por eso los textos de `especial` de cada clase están escritos sin género,
para que una sola redacción valga para las dos cartas.

| Clase | Cuerpo | Mente | Empieza con | Lo suyo |
|---|---|---|---|---|
| Bárbaro / Bárbara | 8 | 2 | Espada ancha | El cuerpo a cuerpo |
| Enano / Enana | 7 | 3 | Espada corta, herramientas | Desarma trampas sin riesgo |
| Elfo / Elfa | 6 | 4 | Espada corta | Espada y un elemento de hechizos |
| Mago / Hechicera | 4 | 6 | Daga | Tres elementos: nueve hechizos |
| Hada | 3 | 7 | Daga | **Vuela**, y dos elementos |

El hada no viene en la caja. Vuela: cruza por encima de los muebles y de las otras figuras
—sin poder aterrizar sobre ellos— y los fosos no la tragan. Los muros, las puertas
cerradas y los bloques desprendidos la paran igual que a los demás.

## El material de la mesa

No hay caja original: todo sale del repositorio, de los mismos datos que usa la
aplicación, para que el papel y la pantalla no puedan decir cosas distintas.

- `npm run cartas` → **57 cartas** en 7 hojas A4 (9 de héroe, 12 de hechizo, 12 de equipo,
  24 de tesoro), más reversos, la tabla de monstruos y la lista de mobiliario.
- `npm run tablero` → el tablero en **cuatro folios A4 apaisados** que se recortan por los
  bordes interiores y se pegan en un rectángulo de 2 × 2.

El lado de la casilla impresa son **19 mm**, y no es una elección estética: las 19 filas
del tablero son impares, la mitad de arriba lleva 10, y diez casillas más el recorte más
el margen que ninguna impresora doméstica alcanza no caben en los 210 mm de un A4
apaisado con más. Como el mobiliario se corta en casillas, `furniture.ts` importa esa
medida de `board-print.ts` en lugar de llevar la suya.

Hay que construir además **14 piezas de mobiliario, 25 puertas y 4 marcadores** de puerta
secreta. Solo las piezas altas —estantería, armario y bastidor— tapan la línea de visión,
y esa distinción decide qué hechizos y qué disparos llegan al objetivo.

## El tablero

`src/data/board-base.ts` contiene la geometría transcrita de la foto del tablero midiendo
la rejilla píxel a píxel: 22 salas, 352 casillas de sala y 142 de pasillo. La regla de
muros es la del tablero real: dos casillas comunican si están en la misma región (la misma
sala, o las dos pasillo); cualquier cambio de región es muro, y las puertas se colocan
encima como datos de misión.

La sala ajedrezada (columnas 17-20, filas 10-13) **no es rectangular**: le falta la esquina
inferior izquierda, que ocupa la sala roja contigua. Es la única irregularidad del tablero.
