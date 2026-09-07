# T58 · Al pasar el ratón por una figura, su ficha en un cuadro flotante

**Precondición:** ninguna. **No a la vez que 51 ni 37** (`BoardMirror.tsx`) **ni 22**
(`estilos.css`); si la 37 va después, hereda el icono en el cuadro.
**Banda de modelo:** MEDIO — pantalla sin reglas; lo que pide criterio es qué cabe en un
cuadro que se lee de reojo y cómo se abre en una tableta, donde no hay ratón.
**Duración esperada:** 2 h · **Encadenable con:** 37 (misma banda; comparten
`BoardMirror.tsx` y `estilos.css`: seguidas, nunca en paralelo).
**Ficheros que toca:** `src/ui/FichaFlotante.tsx` (nuevo), `src/ui/BoardMirror.tsx` (el
enganche), `src/estilos.css`, `tests/ficha-flotante.test.ts` (nuevo, sobre la función que
decide qué se enseña). **No toca el motor, `Juego.tsx`, `TurnPanel.tsx` ni `HeroSheet.tsx`.**
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Lo que pidió Juan Luis

El 2026-09-06: «Cuando pase el ratón por encima de un personaje, saldrá un cuadro flotante
con sus características (su nombre, su tipo, sus puntos de vida, etc).»

## Lo que hay hoy, medido

- `BoardMirror.tsx` pinta cada figura como un `<g>` con un círculo, una inicial y una
  chapita con el cuerpo (líneas ~240-295). Tiene `onClick` (`alPulsarFigura`: atacar,
  activar o señalar objetivo de hechizo) y nada más: ni `title`, ni `onPointerEnter`.
- La misma componente la usan la pantalla de la mesa (`Juego.tsx`) y la de quien juega
  desde casa (`VistaDeHeroe.tsx`, con el estado ya recortado por la niebla): lo que se
  añada aquí sale en las dos sin tocarlas.
- Los datos existen: héroes con `nombre`, clase (`HEROES[clase].nombre[genero]`), cuerpo
  y `cuerpoMax`, mente, `dadosDeAtaque(f, "cuerpo", estado)` y `dadosDeDefensa(f, estado)`
  de `combat.ts` (con el estado, que descuenta el foso), equipo, hechizos que le quedan
  (`HeroSheet.tsx` ya los pinta así); monstruos con `nombre` propio (T42), especie
  (`MONSTRUOS[especie].nombre`), cuerpo y `cuerpoMax`, mente, ataque, defensa, movimiento,
  y estados (`dormido`, `pierdeTurno`, `efectos`).

## Antes de empezar: mira si ya está hecho

```sh
grep -n "FichaFlotante" src/ui/BoardMirror.tsx
```

## Qué hay que hacer

1. **Una función pura `fichaDe(figura, estado)`** que devuelva las líneas del cuadro, para
   probarla sin React: título (nombre; para un monstruo «Górbak, orco»), tipo (clase con su
   género, o especie), cuerpo «3 de 8», mente, ⚔ ataque y 🛡 defensa **con el estado**
   (foso, bonus activos), movimiento del monstruo, y una línea de estado si la hay
   («dormido», «pierde el turno», «+2 dados en el próximo ataque»). Para un héroe, además
   el equipo y cuántos hechizos le quedan; los nombres de los hechizos ya están en la hoja
   lateral, aquí no caben.
2. **`FichaFlotante.tsx`**: un `<div>` posicionado sobre el tablero, al lado de la figura y
   sin taparla, que no se salga de la ventana (si está a la derecha, se abre a la
   izquierda). Sale al `pointerenter` del `<g>` de la figura y se va al `pointerleave`.
   `pointer-events: none` en el cuadro, para que no robe el clic de atacar.
3. **En la tableta no hay ratón.** Un toque sobre una figura que **no** es objetivo ni
   activable abre el cuadro y otro toque en cualquier sitio lo cierra; si la figura sí es
   objetivo, el toque sigue siendo atacar (o activar, o lanzar), como hoy: la ficha no
   puede costar un clic a la acción. Pruébalo con el simulador de dispositivo táctil de
   Chrome antes de darlo por hecho.
4. **Respeta la niebla**: la componente recibe el estado que le den; en la vista de casa
   solo hay figuras visibles, y el cuadro no consulta nada fuera de `estado`.
5. **Sin animación que retrase**: aparece al instante; en la mesa se pasa el ratón para
   comprobar un dato y seguir.

## Trampas conocidas

- **El tablero es un SVG de tamaño fijo dentro de `.juego-tablero`**: el cuadro va fuera
  del SVG, en HTML, con coordenadas calculadas desde el `<g>` (`getBoundingClientRect`),
  o no se podrá poner texto con saltos de línea ni fondo legible.
- **`aviso-error` ya flota sobre el tablero** con `position: absolute` (`estilos.css`,
  línea ~143): que los dos no se pisen en la esquina de abajo.
- **`estilos.css` lo tocan T22 y T37**: añade una clase propia (`.ficha-flotante`) al
  final y no reordenes nada.
- **`INICIALES` y los colores de figura** son de `BoardMirror.tsx` y los cambia T37: no
  los muevas de sitio.

## Cómo quedó (para quien la lea después)

- **`.tablero` no tiene escala propia** (no hay `max-width` ni `transform` que lo encoja):
  las coordenadas de grid (`LADO`, `MARGEN`) ya son píxeles de `.juego-tablero`. No hizo
  falta `getBoundingClientRect`; el centro de una figura es
  `f.celda.x * LADO + LADO/2 + MARGEN` (e igual en `y`), y de ahí sale directo si el cuadro
  se abre a la derecha o a la izquierda comparando con `ancho / 2`. Si algún día `.tablero`
  gana una escala CSS, este cálculo hay que revisarlo.
- **Ratón y tableta se distinguen por `e.pointerType`** (`"mouse"` / `"touch"`), no por
  `onMouseEnter`/`onClick`: en la `<g>` de cada figura, `pointerenter`/`pointerleave`
  filtrados a `"mouse"` abren y cierran con el ratón; `pointerup` filtrado a `"touch"` (y
  con `stopPropagation`, para que no lo cierre el manejador del `<svg>`) abre con el toque.
  El `<svg>` lleva su propio `pointerup` sin filtrar por figura, que cierra con cualquier
  toque en otro sitio (casillas, muros, fondo).
- **`esObjetivo` decide si el toque ataca o abre el cuadro**, y sale del prop `objetivos`
  que ya llega a `BoardMirror` (cubre ataque y el objetivo de un hechizo a medio lanzar).
  Lo que **no** cubre es «elegir a mano qué monstruo actúa» (T52, `mandos` con Zargon al
  volante): esa lista (`porActivar`) vive en `useAccionesDeTurno` y no llega a
  `BoardMirror`. En una tableta, tocar un monstruo activable en ese momento lo activa
  (el `onClick` sigue llamando a `alPulsarFigura`, que no cambia) pero también abre el
  cuadro un instante, porque `BoardMirror` no sabe que era objetivo. Ruido visual, no un
  fallo de la acción; para quitarlo del todo habría que pasarle `porActivar` como prop.
- **Sin navegador en el entorno**: no se pudo probar de verdad en una tableta ni el
  `pointerenter`/`pointerleave` con un ratón físico. Verificado por lectura y con
  `tests/ficha-flotante.test.ts`, que prueba `fichaDe` (la función pura) contra partidas
  reales (`tests/ayuda.ts`), incluido el descuento del foso con el estado.

## Prohibido

- Tocar el motor, los selectores o `HeroSheet.tsx`: los números salen de `combat.ts` tal
  cual, sin recalcular nada aquí.
- Añadir dependencias (librerías de tooltips).
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md`. En la terminada, qué líneas lleva el cuadro
para un héroe y para un monstruo, y cómo se abre en la tableta.
