# T59 · La portada del juego

**Precondición:** ninguna. **No a la vez que T37** (`EleccionDeHeroes.tsx`, `estilos.css`)
**ni que T45** (`EleccionDeHeroes.tsx`).
**Banda de modelo:** MEDIO — no hay reglas que implementar; hay que decidir dónde cabe la
portada sin quitarle sitio al tablero ni al formulario de héroes, que es criterio de
pantalla (igual que T41).
**Duración esperada:** 1,5 h · **Encadenable con:** — (comparte `EleccionDeHeroes.tsx` y
`estilos.css` con T37 y T45; no va en paralelo con ninguna de las dos, así que no hay con
qué encadenar hoy).
**Ficheros que toca:** `Portada Hero Quest.png` (el fichero de la raíz, movido con
`git mv`), `public/` (la versión que se sirve), `public/IMAGENES.md` (nueva fila),
`src/data/imagenes.ts` (nueva entrada), `src/ui/EleccionDeHeroes.tsx`, `src/estilos.css`.
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

Esta imagen es distinta del logotipo de **T41** (`logotipo.webp`, las letras «Hero Quest»
en tres sitios pequeños). La portada es una ilustración aparte, para la pantalla de
entrada, tal como la pidió Juan Luis.

## Lo que pidió Juan Luis

El 2026-09-07:

> He dejado un archivo llamado "Portada Hero Quest.png" en la carpeta del proyecto. Usa esa
> imagen como portada del videojuego.

## Lo que hay hoy, medido

- `Portada Hero Quest.png`: 1758 × 1190, PNG RGBA de 8 bits, en la raíz del repositorio y
  sin rastrear (495 KB). **No está comprobado si el canal alfa es opaco o transparente de
  verdad** —T41 se encontró con que «RGBA» no quería decir nada: el PNG de las letras tenía
  alfa 255 en los 23 616 píxeles muestreados—. Compruébalo igual antes de usarla tal cual;
  la receta para recortar un fondo opaco está en `public/IMAGENES.md`, «Cómo se hizo
  `logotipo.webp`».
- `EleccionDeHeroes.tsx` es la primera pantalla que se ve (`src/App.tsx` la muestra antes de
  elegir héroes) y ya trae el `logotipo.webp` en grande, importado de
  `src/data/imagenes.ts` (`LOGOTIPO`, `rutaDe`). La portada nueva entra ahí, no sustituye al
  logotipo: son dos imágenes con función distinta (una es el título, la otra es la escena).
- `public/IMAGENES.md` y `src/data/imagenes.ts` son la lista con permiso de cada imagen que
  se sirve; hay un test (`tests/imagenes.test.ts`) que pone la batería roja si aparece un
  fichero de imagen en `public/` sin su fila en `src/data/imagenes.ts`. Una portada sin
  declarar no pasa la verificación.

## Antes de empezar: mira si ya está hecho

```sh
ls public/ | grep -i portada; grep -n 'portada\|PORTADA' src/data/imagenes.ts src/ui/EleccionDeHeroes.tsx
```

## Qué hay que hacer

1. **Comprueba el alfa** de `Portada Hero Quest.png` (cuatro esquinas y el centro alcanzan
   para saber si hay transparencia real o un fondo opaco disfrazado de RGBA). Si el fondo es
   opaco y no combina con el fondo oscuro de la aplicación, decide si se recorta, se deja
   como rectángulo con marco, o se usa de fondo a sangre completa (más fácil con un fondo
   opaco: cubre toda la pantalla y no hace falta recortar nada).
2. **El PNG entra en el repositorio** con `git mv "Portada Hero Quest.png"
   public/portada.png` (o `.webp` si se comprime; sin espacios ni mayúsculas). Si se retoca,
   el original se conserva con otro nombre, igual que hizo T41 con `letras-hero-quest.png`.
3. **Dónde va**: en la pantalla de elección de héroes (`EleccionDeHeroes.tsx`), que es la
   primera que ve Juan Luis y hoy es un formulario sobre fondo liso. Sitios razonables —
   decide tú cuál lee mejor con el resto de la pantalla ya escrita por T41 y (si están
   hechas antes) T37/T45 —: de fondo a pantalla completa detrás del formulario (con
   contraste suficiente para leer los botones encima), o como cabecera grande antes del
   formulario, con el logotipo pequeño superpuesto o al lado. **Nunca tape los controles ni
   los deje ilegibles**: si la imagen es oscura o muy detallada, un velo semitransparente
   detrás del texto (ya usado en los paneles con `piedra.svg`) es más seguro que confiar en
   el contraste de la imagen tal cual.
4. **Declárala**: fila nueva en `public/IMAGENES.md` (para qué, origen «aportada», de quién
   y cuándo, licencia «de Juan Luis») y entrada nueva en `src/data/imagenes.ts` (`archivo`,
   `para`, `origen: "aportada"`, `procedencia`, `licencia`), con una constante exportada
   (p. ej. `PORTADA`) para no repetir el nombre del fichero en el componente, igual que
   `LOGOTIPO`.
5. **Peso**: comprime a WebP si el PNG es grande servido a pantalla completa (`cwebp -q 90`
   desde `/opt/homebrew/bin`, como hizo T41) y compara `npm run build` antes y después.

## Trampas conocidas

- **El alfa de un PNG «RGBA» no garantiza transparencia real** (T41, con `letras-hero-quest.png`: 23 616 píxeles muestreados a 255). Compruébalo con esta imagen antes de
  suponer nada.
- **La `base` de Pages** (T34): toda ruta a `public/` pasa por `rutaDe()` /
  `import.meta.env.BASE_URL`, nunca una ruta escrita a mano, o la imagen sale en
  `npm run dev` y rota en la página publicada.
- **`estilos.css` lo tocan T37 y T45 si están vivas a la vez**: mira el candado del árbol y,
  si hay conflicto, reutiliza las clases que ya existan en vez de duplicar.
- **`npm run preview` no sirve la página** en esta versión de vite: usa el enlace simbólico
  a `dist/` y `python3 -m http.server` que describe el README (T56), no confíes en que la
  pantalla en blanco sea un fallo tuyo.
- **Nada de red en la página**: la imagen vive en `public/`, no se enlaza a un servidor
  ajeno.

## Tests que hay que añadir

Ninguno de pantalla. El test de datos que ya existe (`tests/imagenes.test.ts`) cubre la
entrada nueva en cuanto declares el fichero en `src/data/imagenes.ts`; compruébalo en verde,
no hace falta escribir uno propio salvo que cambies su forma.

## Prohibido

- Meter la imagen sin fila en `public/IMAGENES.md` y en `src/data/imagenes.ts`.
- Tapar el tablero, el formulario de héroes o cualquier control con la portada.
- Enlazar la imagen desde otro servidor.
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md`. Enséñale a Juan Luis una captura de la pantalla
con la portada puesta en el mensaje de cierre: aquí el criterio es suyo, igual que en T41.

## Cómo quedó (para quien la lea después)

- **El alfa era opaco de verdad** (255 en las cuatro esquinas, el centro y un muestreo
  disperso cada 7 px): no hizo falta recortar ni recolorear, al revés que
  `letras-hero-quest.png` en T41. Las esquinas ya casi igualan `--fondo` (#14161c).
- **La imagen resultó ser una carátula completa, no una escena**: trae pintado «Hero
  Quest» con el mismo trazo de pincel que `logotipo.webp`, más un hada de perfil,
  salpicaduras rojas y «Versión Salas Oliver, para todas las edades». Por eso **sustituye
  al logotipo grande** en la cabecera de `EleccionDeHeroes.tsx` en vez de ir junto a él,
  al revés de lo que suponía esta ficha antes de ver el contenido: los dos juntos habrían
  repetido el mismo texto dos veces. Razonado en
  `hechos/incidencias/s-20260907T140727-559d19ac.md`; el logotipo sigue igual en
  `Transicion.tsx` y en la barra de la partida (T41 no se toca).
- **Sin navegador en el entorno**: no se pudo hacer una captura real. Verificado por
  lectura del componente, `npx vitest run` y `npm run build`. Si Juan Luis prefiere ver
  las dos imágenes juntas, es un cambio de una línea (volver a poner `LOGOTIPO` junto a
  `PORTADA`), no hay que deshacer nada más.
- `public/portada-original.png` se publica igual que `letras-hero-quest.png`: no la usa
  ningún componente, solo queda declarada para poder recomprimir o recortar en el futuro.
