# De dónde sale cada imagen

Todo lo que hay en `public/` y se ve en pantalla está aquí, con su origen y su permiso.
La condición la puso Juan Luis al firmar T41 el 2026-09-06: «lo descargado, con licencia
que permita usarlo y con su origen apuntado». **Sin línea en esta tabla, la imagen no
entra**, y hay un test que lo comprueba (`tests/imagenes.test.ts`): si aparece un fichero
de imagen en `public/` que no esté declarado en `src/data/imagenes.ts`, la batería se
pone roja.

La lista que lee la aplicación es `src/data/imagenes.ts`, no este fichero. Este cuenta el
porqué; aquel es el que se ejecuta. Al añadir una imagen hay que tocar los dos.

| Fichero | Para qué | Origen | Permiso |
|---|---|---|---|
| `letras-hero-quest.png` | el original, tal como llegó; **no se usa en pantalla** | lo dio Juan Luis el 2026-09-06 | suyo |
| `logotipo.webp` | el logotipo que sí se ve, en tres sitios | retoque del anterior, hecho aquí | el mismo que el original |
| `piedra.svg` | textura de los paneles | generada aquí, ruido procedural | propia |
| `tablero-referencia.webp` | la foto con la que se midió el tablero físico | de Juan Luis, ya estaba antes de T41 | suyo; uso interno |
| `portada-original.png` | el original de la portada, tal como llegó; **no se usa en pantalla** | lo dio Juan Luis el 2026-09-07 | suyo |
| `portada.webp` | la portada, en la pantalla de elección de héroes | recorte de fondo + compresión del anterior, hecho aquí (T77) | el mismo que el original |

**No se ha descargado nada de Internet.** Estaba autorizado, pero no ha hecho falta: el
logotipo salió de la imagen que dio Juan Luis y la ambientación se genera con SVG y
degradados de CSS, que no pesan casi nada y no arrastran ninguna licencia que vigilar.
Si alguna vez se descarga algo, va en la tabla con la licencia concreta (CC0, CC BY,
dominio público…) y el enlace de donde salió; el test exige que la licencia se nombre.

## Cómo se hizo `logotipo.webp`

Importa porque hay que poder rehacerlo si Juan Luis cambia el original.

El PNG que llegó tiene las letras rojas sobre **fondo blanco opaco** —no transparente:
se midió, y los 23 616 píxeles muestreados tenían alfa 255—. Sobre el fondo oscuro de la
aplicación eso es un rectángulo blanco de 654 × 574 en mitad de la pantalla. Así que:

1. **Recortar el fondo.** Se trata el blanco como papel y la letra como tinta encima, que
   es lo que es: `C = a·Tinta + (1−a)·255`. De ahí `a = 1 − min(r,g,b)/255`, y la tinta se
   despeja. Con letras rojas el canal mínimo es el azul, que en el trazo pleno vale casi
   cero, así que el alfa sale bien también en los bordes suavizados y **no quedan halos
   blancos** alrededor de las letras.
2. **Normalizar.** El trazo más oscuro de esta imagen es `#691b0a`: su canal mínimo vale
   10, no 0. Sin dividir por 245 en vez de por 255, el negro del logotipo se quedaba al
   96 % de opacidad y sobre el fondo oscuro se veía lavado.
3. **Recortar los márgenes.** El original tiene casi la mitad de superficie en blanco.
   Recortado al contenido con 4 px de aire queda en 611 × 538, y así se puede colocar en
   un hueco sin ir midiendo el vacío a ojo.
4. **A WebP**, `cwebp -q 90 -alpha_q 100`: de 70 KB en PNG a 46 KB, sin diferencia
   apreciable (se comprobó volviendo a decodificarlo y componiéndolo sobre el fondo
   oscuro de la aplicación).

Los pasos 1 a 3 son un script de unas ochenta líneas de Python sin dependencias —lee y
escribe el PNG con `zlib` y `struct`—, escrito para esto y no guardado en el repositorio
porque es de un solo uso; lo que hay que conservar es la receta, que es esta. El paso 4
es `cwebp`, que en este Mac está en `/opt/homebrew/bin`.

## Cómo se hizo `portada.webp` (T59)

Sin retoque de contenido: `Portada Hero Quest.png` (1758×1190, RGBA de 8 bits) llegó con
el alfa a 255 en todo el muestreo (esquinas y centro, y disperso cada 7 px) —opaca de
verdad, no «RGBA» de mentira como la de T41—, y sus esquinas ya son casi del mismo color
que el fondo de la aplicación (`rgb(16,17-19,21-23)` frente a `--fondo: #14161c`), así
que no hacía falta recortar nada. Solo se comprimió a WebP (`cwebp -q 90`): de 495 KB a
133 KB, sin pérdida apreciable.

## El recorte de `portada.webp` (T77)

T59 midió bien el alfa (opaco de verdad) y las esquinas de la imagen, pero «casi igualar el
fondo liso» no es lo mismo que «encajar con el degradado detrás»: `.eleccion-cabecera`
(`estilos.css`) pinta un `radial-gradient` marrón/naranja (`#3a1f18` hacia transparente)
detrás de la portada, y el negro casi puro de la imagen (`rgb(16,19,23)`, uniforme en todo
el fondo, sin degradado) recortaba un rectángulo con esquinas redondeadas sobre ese
resplandor. Se ve en cualquier captura de la pantalla real, no solo comparando colores
sueltos.

Sin ImageMagick ni Pillow instalados en este entorno (comprobado: ni `magick`/`convert` ni
el módulo `PIL` estaban disponibles), se instaló Pillow con `pip3 install --user Pillow`
—una herramienta de trabajo, no una dependencia del proyecto— y se recortó el fondo a mano
con un color-key por distancia euclídea en RGB: cualquier píxel a menos de 30 de distancia
de `(16,19,23)` pasa a alfa 0, entre 30 y 70 el alfa se difumina linealmente (para que el
borde no quede dentado), y por encima de 70 el píxel se queda igual. El fondo es tan
uniforme y tan distinto del rojo del rótulo (el rojo más oscuro muestreado, `(169,46,24)`,
está a una distancia de unos 180) y del blanco del hada que no hizo falta un recorte por
selección de región (flood fill): el umbral global basta y no come ni un píxel del dibujo.
El script no se ha guardado en el repositorio (era de un solo uso; la receta está aquí para
poder repetirla si Juan Luis cambia el original). El original opaco
(`public/portada-original.png`) no se ha tocado: el recorte se hizo sobre una copia,
comprimida después con `cwebp -q 90` igual que hizo T59. El PNG con alfa pesa más que el
opaco (183 KB frente a 133 KB: el canal alfa se comprime sin pérdida incluso en modo `-q
90`), pero sigue siendo ligero para una imagen de cabecera.

## Dónde se ve cada cosa

- **`portada.webp`** en la pantalla de elección de héroes (`EleccionDeHeroes`), en el
  lugar donde antes iba `logotipo.webp` en grande. La propia ilustración ya trae pintado
  el rótulo «Hero Quest» y la coletilla «Versión Salas Oliver, para todas las edades»
  (T59): repetir el logotipo suelto justo debajo habría puesto el mismo texto dos veces
  en la misma pantalla, así que ahí se sustituye. El logotipo solo, sin la escena, sigue
  siendo el que se ve en los otros dos sitios.
- **`logotipo.webp` grande** en la pantalla de paso (`Transicion`), los dos segundos
  entre pulsar «empezar» y ver el calabozo. Se salta con cualquier tecla o clic.
- **`logotipo.webp` pequeño** en la barra de navegación durante la partida, a 1,6 rem de
  alto. La barra ya existía y tenía hueco de sobra a la izquierda.
- **`piedra.svg`** de fondo en la barra y en los paneles de turno, hojas, diario y
  desenlace. Va de fondo y no de marco a propósito: un marco le quitaría ancho al texto.

**Encima del tablero no hay nada, y ningún panel ha encogido.** Era la condición de la
ficha de T41: el tablero es lo que se mira mientras se juega.

## Lo que queda por hacer, y no es de T41 ni de T59

- **El icono de la pestaña del navegador** (`favicon`). Cabría bien un recorte del
  logotipo, pero se pone en `index.html`, que ninguna de las dos declara entre sus
  ficheros. Es una línea de trabajo para quien toque `index.html`.
- **Una ilustración por clase de héroe** en su hoja: eso es **T37**, la de los iconos.
- **Los sonidos** son **T44**. Cuando lleguen, `public/sonidos/` no es una imagen y el
  test de esta lista ya lo tiene en cuenta: solo mira ficheros de imagen.
