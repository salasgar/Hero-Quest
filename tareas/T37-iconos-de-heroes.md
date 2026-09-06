# T37 · Un icono para cada héroe en el tablero

**Precondición:** ninguna. **No a la vez que T42 ni T38** (los tres tocan `types.ts` y
`partida.ts`; el orden sugerido es 42 → 37 → 38) **ni que T41** (`EleccionDeHeroes.tsx` y
`estilos.css`).
**Banda de modelo:** MEDIO — pantalla sin reglas; lo que pide criterio es un juego de
iconos que se distinga a 1,9 cm y una elección que no estorbe al empezar.
**Duración esperada:** 3 h · **Encadenable con:** 41 (misma banda; comparten ficheros:
seguidas, no en paralelo).
**Ficheros que toca:** `src/ui/iconos.tsx` (nuevo), `src/ui/BoardMirror.tsx`,
`src/ui/EleccionDeHeroes.tsx`, `src/engine/types.ts` (un campo en `Heroe`),
`src/engine/partida.ts` (`HeroeElegido`), `src/estilos.css`, `tests/`.
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Lo que pidió Juan Luis

El 2026-09-06:

> En el tablero ahora mismo aparece una letra representando a cada héroe. Debería aparecer
> un icono que represente al héroe. En la primera pantalla, cuando se elige a los héroes y
> se les pone nombre, la aplicación debería darme a elegir entre usar una letra o un icono
> (que pueda elegir entre varios iconos). Que haya suficientes iconos donde elegir (varios
> que tengan que ver con un enano, varios relacionados con la magia, varios que recuerden a
> los elfos, varios que no sean específicos de ninguna clase concreta de héroe, ...).

## Lo que hay hoy, medido

- `BoardMirror.tsx` pinta un círculo azul y encima `INICIALES[f.clase]`; los monstruos, la
  inicial de la especie en rojo. La misma vista la usa `VistaDeHeroe.tsx` (T32).
- `HeroeElegido` (`partida.ts`) lleva `clase`, `genero`, `nombre` y `elementos`; `Heroe`
  (`types.ts`) no sabe nada de cómo se pinta.
- `EleccionDeHeroes.tsx` (230 líneas) ya elige clase, género y nombre, y desde T16 admite
  hasta ocho con clases repetidas: con dos magos, la letra ya no distingue a nadie.

## Antes de empezar: mira si ya está hecho

```sh
ls src/ui/iconos.tsx 2>/dev/null; grep -n 'icono' src/engine/types.ts src/ui/BoardMirror.tsx
```

## Qué hay que hacer

1. **Un juego de iconos en SVG, dentro del repositorio** (`src/ui/iconos.tsx`): cada uno
   una función que devuelve un `<g>` o `<svg>` pequeño, sin dependencias. La página
   publicada no puede cargar nada de fuera (T34, y el sandbox de Pages), así que **nada de
   URLs ni de fuentes de iconos externas**. Mínimo, y con nombre en español: cuatro de enano
   (hacha, yelmo, martillo, barba), cuatro de magia (sombrero, báculo, estrella, libro),
   cuatro de elfo (arco, hoja, flecha, luna), dos o tres de bárbaro (espada, escudo), dos o
   tres de hada (alas, varita) y cuatro que no sean de nadie (rombo, torre, llama, ojo).
   Tienen que leerse en un círculo de unos 14 px: trazo grueso, sin detalle.
2. `Heroe` gana `icono?: string` (la clave del icono, o ausente para «letra»). Es un dato
   de pantalla que viaja en el estado a propósito: la vista remota (T32) recibe el
   montaje y tiene que pintar lo mismo que la mesa. `HeroeElegido` lo lleva igual y
   `crearPartida` lo copia.
3. En `EleccionDeHeroes.tsx`, junto al nombre: **letra o icono**, con los iconos a la
   vista en una rejilla, agrupados (enano, magia, elfo, bárbaro, hada, cualquiera). Por
   omisión, letra: quien no elija nada ve lo de siempre.
4. `BoardMirror.tsx` pinta el icono si lo hay y la letra si no. Los monstruos siguen con su
   inicial; eso es tema de T42 (nombres), no de esta.

## Trampas conocidas

- **Dos héroes pueden elegir el mismo icono.** Permítelo (dos magos con el mismo sombrero
  ya se distinguen por el nombre en la hoja), pero avísalo en la pantalla de elección.
- **El estado gana un campo**: quien guarde partidas (Fase 8) tiene que saberlo. El campo
  es opcional para que ninguna misión ni test viejo tenga que cambiar.
- **Los componentes de React no se prueban aquí.** Lo que sí: que el icono elegido llega
  a `estado.heroes[i].icono` desde `crearPartida`, y que cada clave del juego de iconos
  existe (un test que recorra la lista y compruebe que cada función devuelve algo).
- **`estilos.css` lo tocan también T41 y T43**: reutiliza las clases que hay
  (`ficha`, `ficha-sel`, `grupo`) antes de inventar ninguna, y mira el candado.

## Tests que hay que añadir

- `crearPartida` con `icono` en un `HeroeElegido` lo deja en el héroe; sin él, `undefined`.
- Todas las claves de iconos tienen dibujo, y no hay dos claves iguales.

## Prohibido

- Cargar iconos de una URL o de una fuente web.
- Tocar `reducer.ts`: el icono no es una regla.
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md` (pruebas en verde → commit del código, solo estos
ficheros → `hechos/terminadas/37--<sid>.md` con el hash → `CERRADA` → regenerar
`_ESTADO.md` → commit con rutas explícitas → `push`). Enseña la pantalla a Juan Luis con
ocho héroes elegidos: es la única prueba de que los iconos se distinguen.
