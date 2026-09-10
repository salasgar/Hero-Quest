# T77 · Quitarle el fondo a la portada

**Precondición:** ninguna. **No a la vez que T37, T45, T59, T69, T41** (`EleccionDeHeroes.tsx`,
`estilos.css`) si alguna estuviera viva —hoy ninguna lo está, todas LISTA—.
**Banda de modelo:** MEDIO — no hay reglas que implementar; es criterio de pantalla, igual
que T41 y T59.
**Duración esperada:** 1 h · **Encadenable con:** T78 (las dos MEDIO, cortas, sin ningún
fichero en común).
**Ficheros que toca:** `public/portada.webp` (se regenera), `public/portada-original.png`
(se conserva o se sustituye por un recorte con alfa, según lo que se decida), `public/IMAGENES.md`
(actualizar la fila), `src/data/imagenes.ts` (actualizar `procedencia` si cambia cómo se
generó el fichero).
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Lo que pidió Juan Luis

El 2026-09-10, jugando: la imagen de cabecera de la pantalla «¿Quién baja a la mazmorra?»
(la portada, `public/portada.webp`, importada como `PORTADA` en
`src/ui/EleccionDeHeroes.tsx:181`) se ve como un rectángulo de fondo que no encaja; pide
quitarle el fondo «de forma que quede bien».

## Por qué se nota, aunque T59 ya midió el alfa

T59 comprobó el alfa de la imagen original y lo dio por bueno porque las cuatro esquinas,
el centro y un muestreo disperso salían opacas a 255 y «casi igualan `--fondo`
(#14161c)» (`hechos/terminadas/59--s-20260907T140727-559d19ac.md`). En la pantalla, sin
embargo, la imagen no se sirve sobre `--fondo` a secas: `.eleccion-cabecera` (`estilos.css`)
le pone detrás un `radial-gradient(60% 100% at 50% 0%, #3a1f18 0%, rgba(58,31,24,0) 70%)`
—un resplandor de antorcha, marrón/naranja— y la propia imagen lleva `border-radius: 10px`
(`.eleccion-portada`). El negro casi puro de la imagen (bastante más oscuro que `#14161c`,
y sin ningún matiz cálido) recorta un rectángulo con esquinas redondeadas sobre ese
resplandor: se ve el marco, no solo el dibujo. «Casi igualar el fondo liso» no bastaba
para «encajar con el degradado detrás»; son dos comprobaciones distintas y la ficha de T59
solo hizo la primera.

## Antes de empezar: mira si ya está hecho

```sh
grep -n "eleccion-portada" src/estilos.css
```

Si el selector ya no fija `border-radius` sobre un fondo sólido y `portada.webp` tiene un
canal alfa con transparencia real fuera del dibujo (compruébalo con el muestreo de
esquinas que ya usó T59, `public/IMAGENES.md`, «Cómo se hizo `logotipo.webp`»), está hecho.

## Qué hay que hacer

1. **Recortar el fondo negro de la imagen**, dejando transparente todo lo que no es el
   dibujo (el rótulo «Hero Quest», el hada, el escudo, las salpicaduras): un recorte por
   color (el fondo es prácticamente un solo negro, `#0a0a0f`-ish, sin degradado) con la
   receta de `public/IMAGENES.md` («Cómo se hizo `logotipo.webp}`», que ya resolvió el
   mismo problema para el logotipo con la misma imagen original) — `magick`/`convert` con
   `-fuzz` y `-transparent`, o el equivalente en Python con Pillow si no hay ImageMagick.
   El original (`Portada Hero Quest.png` / `public/portada-original.png`) **no se toca**:
   el recorte se hace sobre una copia y el original opaco se conserva, como ya hacen
   `letras-hero-quest.png` y `portada-original.png` hoy.
2. **Comprueba el resultado a ojo** (leyendo el PNG resultante con la herramienta de
   lectura de imágenes) antes de darlo por bueno: que no queden restos de negro rectangular
   en los bordes ni un halo duro alrededor de las letras por un `-fuzz` demasiado corto o
   demasiado largo.
3. **Regenera `public/portada.webp`** a partir del recorte (mismo procedimiento de
   compresión que usó T59/T41, `cwebp -q 90`), y compara el peso con el actual.
4. **Actualiza `public/IMAGENES.md`** (la fila de `portada.webp`: `procedencia` pasa a
   contar el recorte de fondo, no solo la compresión) y **`src/data/imagenes.ts`** igual.
5. **No hace falta tocar `EleccionDeHeroes.tsx` ni `.eleccion-portada`** salvo que, con el
   fondo ya transparente, el resplandor se vea demasiado flojo o demasiado fuerte detrás
   del dibujo: en ese caso, ajusta el propio `radial-gradient` de `.eleccion-cabecera`
   (más ancho o con más opacidad), nunca metas un fondo sólido nuevo detrás de la imagen,
   que es volver al problema de hoy.

## Trampas conocidas

- **El alfa «RGBA» no garantiza transparencia real** (T41, con
  `letras-hero-quest.png`: 23 616 píxeles muestreados a 255) y **tampoco garantiza que no
  la tenga**: compruébalo con esta imagen concreta, con el muestreo de T59 primero (puede
  que el negro de fondo sí sea recortable con `-fuzz` bajo porque es muy uniforme, a
  diferencia del rótulo, que tiene degradados de rojo).
- **`npm run preview` no sirve la página** en esta versión de vite: usa el enlace simbólico
  a `dist/` y `python3 -m http.server`, como dice el README (T56).
- **La `base` de Pages** (T34): la imagen se referencia siempre con `rutaDe()` /
  `import.meta.env.BASE_URL`, nunca con una ruta escrita a mano.
- **`tests/imagenes.test.ts`** falla si `public/` tiene un fichero de imagen sin fila en
  `src/data/imagenes.ts`: no cambia el nombre del fichero (`portada.webp` sigue siendo
  `portada.webp`), así que no hace falta tocar nada ahí salvo la `procedencia`.

## Tests que hay que añadir

Ninguno de pantalla; no hay lógica nueva. `tests/imagenes.test.ts` sigue en verde en
cuanto la fila de `src/data/imagenes.ts` siga cuadrando con `public/`.

## Prohibido

- Tocar el original opaco (`public/portada-original.png`) en vez de trabajar sobre una
  copia.
- Meter un fondo sólido nuevo detrás de la imagen en `estilos.css` para tapar el problema
  en vez de recortarlo en la propia imagen.
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md`. Enséñale a Juan Luis, en el mensaje de cierre,
el PNG recortado (con la herramienta de lectura de imágenes) para que confirme que «queda
bien»: aquí el criterio final es suyo, igual que en T41 y T59.
