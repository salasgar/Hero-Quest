/**
 * Geometría del tablero imprimible en cuatro folios A4.
 *
 * Los cuatro folios van apaisados formando un rectángulo de 2 x 2. De ahí sale
 * el número que manda sobre todo lo demás: **el lado de la casilla**. El
 * tablero tiene 19 filas, que es impar, así que la mitad de arriba lleva 10 y
 * la de abajo 9; la mitad con 10 filas es la que aprieta, porque diez casillas
 * más los márgenes tienen que caber en los 210 mm de alto de un A4 apaisado.
 *
 *     (210 - 6 de recorte - 14 de margen exterior) / 10 filas = 19 mm
 *
 * De ahí 19 mm por casilla, y no más. Con 20 mm no quedaría margen para el
 * borde que ninguna impresora doméstica alcanza a imprimir.
 *
 * Como el mobiliario se corta en casillas, este número manda también sobre el
 * cartón: `LADO_CASILLA_CM` sale de aquí y no de ninguna otra parte.
 */

import { ALTO_TABLERO, ANCHO_TABLERO } from "./board-base";

/** Lado de la casilla impresa, en milímetros. */
export const LADO_CASILLA_MM = 19;

/** A4 apaisado. */
export const HOJA_ANCHO_MM = 297;
export const HOJA_ALTO_MM = 210;

/**
 * Papel que se recorta en los dos bordes interiores de cada folio, para que las
 * cuatro mitades peguen sin costura. Los bordes exteriores no se tocan.
 */
export const RECORTE_MM = 6;

/** Reparto de casillas entre folios. 26 columnas parten en dos; 19 filas, no. */
export const COLUMNAS_IZQUIERDA = ANCHO_TABLERO / 2; // 13
export const COLUMNAS_DERECHA = ANCHO_TABLERO - COLUMNAS_IZQUIERDA; // 13
export const FILAS_ARRIBA = Math.ceil(ALTO_TABLERO / 2); // 10
export const FILAS_ABAJO = ALTO_TABLERO - FILAS_ARRIBA; // 9

export const TABLERO_ANCHO_MM = ANCHO_TABLERO * LADO_CASILLA_MM;
export const TABLERO_ALTO_MM = ALTO_TABLERO * LADO_CASILLA_MM;

/** Lo que queda de folio fuera del tablero, en el borde que no se recorta. */
export const MARGEN_LATERAL_MM =
  HOJA_ANCHO_MM - RECORTE_MM - COLUMNAS_IZQUIERDA * LADO_CASILLA_MM; // 44
export const MARGEN_SUPERIOR_MM =
  HOJA_ALTO_MM - RECORTE_MM - FILAS_ARRIBA * LADO_CASILLA_MM; // 14
export const MARGEN_INFERIOR_MM =
  HOJA_ALTO_MM - RECORTE_MM - FILAS_ABAJO * LADO_CASILLA_MM; // 33

export interface Folio {
  numero: 1 | 2 | 3 | 4;
  rotulo: string;
  /** Primera columna y primera fila del tablero que salen en este folio. */
  columna0: number;
  fila0: number;
  columnas: number;
  filas: number;
  /** Esquina del contenido dentro del folio, en milímetros. */
  x: number;
  y: number;
  /** Bordes por los que hay que recortar este folio. */
  recorta: Array<"arriba" | "abajo" | "izquierda" | "derecha">;
}

export const FOLIOS: readonly Folio[] = [
  {
    numero: 1, rotulo: "arriba · izquierda",
    columna0: 0, fila0: 0, columnas: COLUMNAS_IZQUIERDA, filas: FILAS_ARRIBA,
    x: MARGEN_LATERAL_MM, y: MARGEN_SUPERIOR_MM,
    recorta: ["derecha", "abajo"],
  },
  {
    numero: 2, rotulo: "arriba · derecha",
    columna0: COLUMNAS_IZQUIERDA, fila0: 0, columnas: COLUMNAS_DERECHA, filas: FILAS_ARRIBA,
    x: RECORTE_MM, y: MARGEN_SUPERIOR_MM,
    recorta: ["izquierda", "abajo"],
  },
  {
    numero: 3, rotulo: "abajo · izquierda",
    columna0: 0, fila0: FILAS_ARRIBA, columnas: COLUMNAS_IZQUIERDA, filas: FILAS_ABAJO,
    x: MARGEN_LATERAL_MM, y: RECORTE_MM,
    recorta: ["derecha", "arriba"],
  },
  {
    numero: 4, rotulo: "abajo · derecha",
    columna0: COLUMNAS_IZQUIERDA, fila0: FILAS_ARRIBA, columnas: COLUMNAS_DERECHA, filas: FILAS_ABAJO,
    x: RECORTE_MM, y: RECORTE_MM,
    recorta: ["izquierda", "arriba"],
  },
];

/** Comprobación de que los cuatro folios cubren el tablero exactamente una vez. */
export const CASILLAS_CUBIERTAS = FOLIOS.reduce((s, f) => s + f.columnas * f.filas, 0);
