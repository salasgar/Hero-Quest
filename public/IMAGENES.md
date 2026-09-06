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

## Dónde se ve cada cosa

- **`logotipo.webp` grande** en la pantalla de elección de héroes (`EleccionDeHeroes`),
  que es la primera que se ve y no tiene tablero al que quitarle sitio.
- **`logotipo.webp` grande otra vez** en la pantalla de paso (`Transicion`), los dos
  segundos entre pulsar «empezar» y ver el calabozo. Se salta con cualquier tecla o clic.
- **`logotipo.webp` pequeño** en la barra de navegación durante la partida, a 1,6 rem de
  alto. La barra ya existía y tenía hueco de sobra a la izquierda.
- **`piedra.svg`** de fondo en la barra y en los paneles de turno, hojas, diario y
  desenlace. Va de fondo y no de marco a propósito: un marco le quitaría ancho al texto.

**Encima del tablero no hay nada, y ningún panel ha encogido.** Era la condición de la
ficha: el tablero es lo que se mira mientras se juega.

## Lo que queda por hacer, y no es de T41

- **El icono de la pestaña del navegador** (`favicon`). Cabría bien un recorte del
  logotipo, pero se pone en `index.html`, que T41 no declara entre sus ficheros. Es una
  línea de trabajo para quien toque `index.html`.
- **Una ilustración por clase de héroe** en su hoja: eso es **T37**, la de los iconos.
- **Los sonidos** son **T44**. Cuando lleguen, `public/sonidos/` no es una imagen y el
  test de esta lista ya lo tiene en cuenta: solo mira ficheros de imagen.
