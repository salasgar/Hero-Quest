# T70 · Mostrar la ruta de movimiento en el tablero

**Precondición:** ninguna. **No a la vez que T51, T58, T37** (`BoardMirror.tsx`).
**Banda de modelo:** MEDIO — animación de UI, rastro visual, flujo de eventos.
**Duración esperada:** 2 h · **Encadenable con:** —.
**Ficheros que toca:** `src/ui/BoardMirror.tsx`, `src/ui/Juego.tsx`, `src/estilos.css`.
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Lo que se nota jugando hoy

Cuando un monstruo se mueve, la ficha salta de una casilla a otra y el panel dice «Se mueve»
a secas (`TurnPanel.tsx`, `frase`, a propósito: «el tablero de cartón no tiene los números
pintados»). El adulto tiene que empujar la miniatura y adivinar por dónde: alrededor de una
mesa o entre dos héroes hay más de un camino. Con los héroes pasa lo mismo cuando se pulsa
una casilla verde lejana: el motor elige la ruta (`rutaHasta`) y **puede pasar por una
trampa**, y el niño no sabe por dónde fue.

## Qué cambiaría

El evento `movimiento` ya lleva `ruta`. Que el personaje se traslade por esa ruta a
velocidad constante. Pintar la última ruta como un rastro (puntos o una línea) durante los
segundos que tarde el personaje en trasladarse y un poco más, con la casilla de origen
marcada, en `BoardMirror`; en la vista de casa sale igual porque es el mismo pintor. Sin
animación de la figura: bastante trabajo tiene la mesa con la miniatura.

## Antes de empezar: mira si ya está hecho

```sh
grep -n 'ruta' src/ui/BoardMirror.tsx && grep -n 'rastro' src/estilos.css
```

Si ambas cosas aparecen, está hecha.

## Cómo funciona hoy

1. `Juego.tsx` recibe eventos de `narrador`, incluyendo `movimiento` con `ruta: Casilla[]`.

2. `BoardMirror.tsx` pinta el tablero. Hoy no usa `ruta` para nada; pinta la figura en su
   posición final.

3. El motor calcula `rutaHasta` en `movimiento` (ya está hecho, T2 y T18 usan eso).

## Qué hay que hacer

1. **En `Juego.tsx`**: cuando llegue un evento `movimiento`, guardar la ruta y un timestamp
   (para saber cuándo empieza). Pasar eso a `BoardMirror` como props nuevas
   (`rutaEnProceso`, `ahora` o similar).

2. **En `BoardMirror.tsx`**: si hay una ruta en proceso,
   - Calcular cuánto tiempo lleva de animación (ahora - timestamp).
   - Dibujar un rastro de puntos (o líneas) por las casillas de la ruta.
   - Marcar la casilla de origen con un color o un círculo.
   - Cuando el tiempo supere la duración de la ruta (típicamente ruta.length × 300ms o lo
     que sea), dejar de dibujar el rastro pero mantenerlo visible un segundo más, luego
     borrarlo.

3. **En `estilos.css`**: estilos para el rastro (color, tamaño de puntos, opacidad), la
   casilla de origen (borde o fondo), y posiblemente una transición para que fade-out al
   desaparecer.

## Trampas conocidas

- **T51, T58, T37 tocan `BoardMirror.tsx`.** Coordinad si estáis en paralelo: esta tarea no
  puede ir a la vez que esas.

- **«El rastro saldrá en los dos sitios» no es automático.** `VistaDeHeroe.tsx` comparte
  `BoardMirror`, sí, pero tiene su propio `ejecutar` (de su propia `usePartida`) y no lo
  envuelve para detectar el evento `movimiento`: hecha así la tarea, la vista de casa no
  calcula ningún rastro propio y `BoardMirror` simplemente no recibe el prop `rastro` (por
  defecto `null`, así que sigue compilando y pintando igual que antes). Si se quiere
  también en casa, hay que envolver su `ejecutar` igual que en `Juego.tsx` — y entonces
  `VistaDeHeroe.tsx` pasa a ser un fichero que esta tarea toca, cosa que su ficha no
  declaraba.

- **Sin navegador en este entorno.** No hay Playwright ni una herramienta de captura para
  comprobar visualmente el rastro; se verificó leyendo el render (mismas coordenadas que
  el resto de `BoardMirror`) y arrancando el `dev server`. Conviene jugar una partida con
  un movimiento largo para verlo de verdad.

- **Velocidad de la animación.** Si la ruta pasa por muchas casillas (7-8), la animación
  puede ser lenta. Ajustar tiempo por casilla para que sea visible pero rápido.

- **La vista de casa (`VistaDeHeroe.tsx`)** usa el mismo `BoardMirror`, así que el rastro
  saldrá en los dos sitios. Eso es lo que se quiere: el jugador en casa ve por dónde va su
  héroe.

- **Sin `requestAnimationFrame` a propósito.** Calcular posición con timestamp y redraw en
  cada evento (de diario o de actualización) basta; no hace falta un bucle de animación
  suave. El diario y la interfaz ya se renderizan frecuente.

## Prohibido

- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).
- Animar la figura: solo el rastro.

## Al terminar

El orden de cierre es el de `proyecto.md` (pruebas en verde → commit de código →
`hechos/terminadas/70--<sid>.md` con el hash → `CERRADA` → regenerar `_ESTADO.md` → commit
con rutas explícitas → `push`).
