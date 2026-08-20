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
| F1 | Geometría del tablero y catálogos | tablero hecho y verificado |
| F2 | Motor de reglas | siguiente |
| F3 | Pantalla de máster · **primer hito jugable** | |
| F4 | IA de monstruos (Zargon automático) | |
| F5 | Narrador: voz, banco local y API de Claude | |
| F6 | Editor de misiones | |
| F7 | Generador de mazmorras | |
| F8 | Campaña y progresión | |

## Arranque

```sh
npm install
npm run dev        # http://localhost:5173
npm test           # tests del motor y de los datos
npm run typecheck
```

La pantalla actual es la **verificación del tablero**: compara el tablero digital con el
físico, permite corregir casillas a mano y genera el mapa listo para pegar en
`src/data/board-base.ts`.

## Cómo está montado

- `src/engine/` — motor de reglas, TypeScript puro, sin React y testeable.
- `src/data/` — geometría del tablero y catálogos (monstruos, hechizos, equipo).
- `src/ai/` — la táctica de los monstruos: determinista, instantánea y siempre legal.
- `src/narrator/` — narración: banco de frases local, voz del navegador y API de Claude.
- `src/ui/` — la pantalla del máster.
- `server/` — proxy de la API de Claude (la clave nunca llega al navegador).

**Claude no mueve monstruos.** La mecánica y la táctica las decide el motor determinista;
Claude es director de escena: narra y da sesgos de personalidad. Si se cae la red, la
partida sigue con el narrador local.

## El tablero

`src/data/board-base.ts` contiene la geometría transcrita de la foto del tablero midiendo
la rejilla píxel a píxel: 22 salas, 352 casillas de sala y 142 de pasillo. La regla de
muros es la del tablero real: dos casillas comunican si están en la misma región (la misma
sala, o las dos pasillo); cualquier cambio de región es muro, y las puertas se colocan
encima como datos de misión.

La sala ajedrezada (columnas 17-20, filas 10-13) **no es rectangular**: le falta la esquina
inferior izquierda, que ocupa la sala roja contigua. Es la única irregularidad del tablero.
