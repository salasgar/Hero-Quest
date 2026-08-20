/**
 * Calibración de la foto del tablero (`public/tablero-referencia.webp`).
 *
 * Los números salen de ajustar la rejilla a los píxeles de la foto: se busca el
 * origen y el paso que minimizan el brillo sobre las líneas candidatas, porque
 * las juntas entre casillas son oscuras. El resultado da casillas cuadradas
 * (37,14 x 37,35 px), lo que confirma de paso la geometría de 26 x 19.
 *
 * Sirve para superponer la foto exactamente debajo del tablero dibujado en la
 * pantalla de verificación.
 */

export const FOTO = {
  archivo: "/tablero-referencia.webp",
  anchoPx: 1000,
  altoPx: 1000,
  /** Esquina superior izquierda de la casilla (0,0) dentro de la foto. */
  origenX: 18.25,
  origenY: 144,
  /** Tamaño de casilla en píxeles de la foto. */
  pasoX: 37.14,
  pasoY: 37.345,
} as const;

/**
 * Dónde y de qué tamaño hay que pintar la foto para que su rejilla caiga encima
 * de un tablero dibujado con casillas de `lado` px y origen en (0,0).
 */
export function encajeDeLaFoto(lado: number) {
  // Basta con llevar el paso de la foto al lado de la casilla dibujada.
  const escalaX = lado / FOTO.pasoX;
  const escalaY = lado / FOTO.pasoY;
  return {
    x: -FOTO.origenX * escalaX,
    y: -FOTO.origenY * escalaY,
    width: FOTO.anchoPx * escalaX,
    height: FOTO.altoPx * escalaY,
  };
}
