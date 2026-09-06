# T41 · El logotipo y las imágenes de ambientación

**Precondición:** ninguna. **No a la vez que T37** (`EleccionDeHeroes.tsx`, `estilos.css`)
**ni que T43** (`App.tsx`, `estilos.css`).
**Banda de modelo:** MEDIO — no hay reglas; hay que decidir dónde cabe cada imagen sin
quitar sitio al tablero, y eso es criterio de pantalla.
**Duración esperada:** 3 h · **Encadenable con:** 37 (misma banda; comparten ficheros:
seguidas, no en paralelo).
**Ficheros que toca:** `public/letras-hero-quest.png` (el PNG de la raíz, movido con
`git mv`), `public/` (las imágenes nuevas), `public/IMAGENES.md` (nuevo: de dónde sale cada
una), `src/App.tsx`, `src/ui/EleccionDeHeroes.tsx`, `src/ui/Transicion.tsx` (nuevo, si
se hace la pantalla de paso), `src/estilos.css`.
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

Los sonidos son **T44**; los iconos de héroe, **T37**. Esta es la de las imágenes.

## Lo que pidió Juan Luis

El 2026-09-06:

> He puesto una imagen en la carpeta del proyecto que se llama "Letras Hero Quest.png".
> Esas letras se pueden usar tal cual o modificarlas de alguna manera (modificar el fondo,
> o los colores, ...). Piensa dónde se pueden colocar. Además, hay que crear o descargar de
> internet más imágenes, iconos, sonidos, etc que le den ambientación.

Y sobre la «decoración», el mismo día:

> Buscar un hueco donde el logotipo no estorbe. También puede estar en grande en una breve
> pantalla de transición desde la pantalla donde se eligen los héroes y la pantalla donde
> comienza la partida. Piensa dónde queda mejor, y si hay que cambiarle el fondo, el tamaño,
> el color, descargar otra imagen diferente de Internet, generar tú otra, ... Piensa qué
> otras imágenes se pueden usar y en qué huecos se pueden poner de manera que no quiten
> espacio al juego.

## Lo que hay hoy, medido

- `Letras Hero Quest.png`: 654 × 574, RGBA, en la raíz del repositorio y sin rastrear.
- `App.tsx` tiene una barra `navegacion` con tres botones (Partida, Verificar tablero,
  Instrucciones) y elige entre `EleccionDeHeroes`, `Juego` y `VistaDeHeroe`. No hay
  pantalla de transición: elegir el grupo lleva a la partida en el acto.
- `public/` solo tiene `tablero-referencia.webp`. Todo lo que está en `public/` se sirve
  bajo `import.meta.env.BASE_URL` (T34: la página cuelga de `/Hero-Quest/`).

## Antes de empezar: mira si ya está hecho

```sh
ls public/; grep -n 'letras\|logo' src/App.tsx src/ui/EleccionDeHeroes.tsx
```

## Qué hay que hacer

1. **El PNG entra en el repositorio** con `git mv "Letras Hero Quest.png"
   public/letras-hero-quest.png` (sin espacios ni mayúsculas: las URLs y `git` lo
   agradecen). Si se retoca (fondo transparente, recorte), se guarda el retocado con otro
   nombre y el original se queda.
2. **Dónde va el logotipo**: en grande en la pantalla de elección de héroes, que es la
   primera que se ve y tiene sitio; pequeño en la barra de navegación durante la partida,
   donde hoy no hay nada que diga qué es esto. **Nunca encima del tablero ni quitándole
   ancho** al panel de turno: el tablero es lo que se mira mientras se juega.
3. **La pantalla de transición**, si cabe en el tiempo: al pulsar «empezar», el logotipo
   en grande sobre fondo oscuro un par de segundos, o hasta que se pulse. Con niños delante
   un par de segundos es mucho: que se pueda saltar con cualquier tecla o clic. Y que no
   desmonte la partida: T22 ya avisa de que `Instrucciones` se abre encima y no desmonta;
   aquí igual.
4. **Otras imágenes**: fondos de piedra para los paneles, un marco para el diario, una
   ilustración por clase de héroe en su hoja. Cada imagen o se genera aquí (SVG, degradados
   CSS, lo que no pese) o se descarga con licencia que permita usarla y redistribuirla
   (CC0 o equivalente), y **cada una queda apuntada en `public/IMAGENES.md`** con su
   origen y su licencia. Sin esa línea, la imagen no entra.
5. **Peso**: Pages sirve lo que hay en `dist/`; una imagen de varios megas se nota en la
   tableta. Comprime (WebP para fotos, SVG para lo dibujado) y mira `npm run build` antes
   y después.

## Trampas conocidas

- **El PNG que dio Juan Luis tiene el fondo BLANCO OPACO, no transparente.** Que sea RGBA
  no quiere decir que se haya usado el alfa: los 23 616 píxeles muestreados valen 255 y las
  cuatro esquinas son `ffffffff`. Pegarlo tal cual sobre el fondo oscuro pone un rectángulo
  blanco de 654 × 574 en mitad de la pantalla. Hay que recortarle el fondo —la firma lo
  autoriza—, y la receta exacta está en `public/IMAGENES.md`. *(Medido por la sesión que
  hizo la tarea, 2026-09-06.)*
- **`npm run preview` no sirve la aplicación en esta versión de vite (7.3.6)**: devuelve 404
  a toda petición con la cabecera `Sec-Fetch-Dest: script`, que es la que manda el navegador
  para un `<script type="module">`, así que la página sale **en blanco** y parece que la has
  roto tú. No es de esta tarea: pasa igual con `index.html`. Para mirar la construcción como
  la sirve Pages, `ln -s "$PWD/dist" sitio/Hero-Quest` y `python3 -m http.server` dentro de
  `sitio/`. Está en `hechos/incidencias/s-20260906T125522-43d82a6b.md`.
- **La `base` de Pages** (T34): toda ruta a `public/` lleva `import.meta.env.BASE_URL`
  delante, o la imagen sale en `npm run dev` y no en la página publicada. `FOTO.archivo`
  ya pasó por esto.
- **`estilos.css` lo tocan T37 y T43**: mira el candado y reutiliza clases.
- **La vista remota** (`VistaDeHeroe.tsx`) es una pantalla distinta: lo que pongas en la
  barra tiene que verse bien también allí, o no ponerlo.
- **Nada de red en la página**: las imágenes viven en `public/`, no se enlazan a un
  servidor ajeno.

## Tests que hay que añadir

Ninguno de pantalla (los componentes no se prueban). Sí uno de datos si sacas la lista de
imágenes a un módulo: que cada ruta declarada existe en `public/`.

## Prohibido

- Enlazar imágenes de otro servidor, o meter imágenes sin origen y licencia apuntados.
- Tapar el tablero o reducir el panel de turno.
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md`. Enséñale a Juan Luis las pantallas (una captura
por sitio donde haya imagen) en el mensaje de cierre: aquí el criterio es suyo.
