import { describe, expect, it } from "vitest";
import { ALTO_TABLERO, ANCHO_TABLERO } from "../src/data/board-base";
import {
  CASILLAS_CUBIERTAS,
  FOLIOS,
  HOJA_ALTO_MM,
  HOJA_ANCHO_MM,
  LADO_CASILLA_MM,
  RECORTE_MM,
  TABLERO_ALTO_MM,
  TABLERO_ANCHO_MM,
} from "../src/data/board-print";
import { LADO_CASILLA_CM } from "../src/data/furniture";

/**
 * Lo que ninguna impresora doméstica alcanza a imprimir. Si algo del dibujo cae
 * dentro de esta franja, sale cortado y las mitades ya no pegan.
 */
const BORDE_MUERTO_MM = 5;

describe("el tablero repartido en cuatro folios", () => {
  it("los cuatro cuadrantes cubren cada casilla una sola vez", () => {
    const vistas = new Set<string>();
    for (const f of FOLIOS) {
      for (let j = 0; j < f.filas; j++) {
        for (let i = 0; i < f.columnas; i++) {
          const k = `${f.columna0 + i},${f.fila0 + j}`;
          expect(vistas.has(k), `la casilla ${k} sale en dos folios`).toBe(false);
          vistas.add(k);
        }
      }
    }
    expect(vistas.size).toBe(ANCHO_TABLERO * ALTO_TABLERO);
    expect(CASILLAS_CUBIERTAS).toBe(ANCHO_TABLERO * ALTO_TABLERO);
  });

  it("los cuadrantes encajan: los de arriba con los de abajo y los de la izquierda con los de la derecha", () => {
    const [uno, dos, tres, cuatro] = FOLIOS;
    expect(uno!.columna0 + uno!.columnas).toBe(dos!.columna0);
    expect(tres!.columna0 + tres!.columnas).toBe(cuatro!.columna0);
    expect(uno!.fila0 + uno!.filas).toBe(tres!.fila0);
    expect(dos!.fila0 + dos!.filas).toBe(cuatro!.fila0);
  });

  it("cada folio cabe en un A4 apaisado con margen imprimible por los cuatro lados", () => {
    for (const f of FOLIOS) {
      const derecha = f.x + f.columnas * LADO_CASILLA_MM;
      const abajo = f.y + f.filas * LADO_CASILLA_MM;
      expect(derecha, `folio ${f.numero} se sale a la derecha`).toBeLessThanOrEqual(HOJA_ANCHO_MM);
      expect(abajo, `folio ${f.numero} se sale por abajo`).toBeLessThanOrEqual(HOJA_ALTO_MM);
      for (const [borde, hueco] of [
        ["izquierdo", f.x],
        ["derecho", HOJA_ANCHO_MM - derecha],
        ["superior", f.y],
        ["inferior", HOJA_ALTO_MM - abajo],
      ] as const) {
        expect(hueco, `folio ${f.numero}: el borde ${borde} queda a ${hueco} mm`)
          .toBeGreaterThanOrEqual(BORDE_MUERTO_MM);
      }
    }
  });

  it("cada folio recorta exactamente los dos bordes que dan a otro folio", () => {
    for (const f of FOLIOS) {
      expect(f.recorta, `folio ${f.numero}`).toHaveLength(2);
      const vertical = f.recorta.filter((b) => b === "izquierda" || b === "derecha");
      const horizontal = f.recorta.filter((b) => b === "arriba" || b === "abajo");
      expect(vertical, `folio ${f.numero}: un corte vertical y solo uno`).toHaveLength(1);
      expect(horizontal, `folio ${f.numero}: un corte horizontal y solo uno`).toHaveLength(1);
      // El cuadrante se pega contra el borde que se recorta.
      const pegadoIzquierda = f.recorta.includes("izquierda");
      const pegadoArriba = f.recorta.includes("arriba");
      expect(pegadoIzquierda ? f.x : HOJA_ANCHO_MM - (f.x + f.columnas * LADO_CASILLA_MM)).toBe(RECORTE_MM);
      expect(pegadoArriba ? f.y : HOJA_ALTO_MM - (f.y + f.filas * LADO_CASILLA_MM)).toBe(RECORTE_MM);
    }
  });

  it("una vez recortados y pegados, el tablero mide lo que dice medir", () => {
    const ancho = FOLIOS.filter((f) => f.fila0 === 0).reduce((s, f) => s + f.columnas, 0);
    const alto = FOLIOS.filter((f) => f.columna0 === 0).reduce((s, f) => s + f.filas, 0);
    expect(ancho).toBe(ANCHO_TABLERO);
    expect(alto).toBe(ALTO_TABLERO);
    expect(TABLERO_ANCHO_MM).toBe(ANCHO_TABLERO * LADO_CASILLA_MM);
    expect(TABLERO_ALTO_MM).toBe(ALTO_TABLERO * LADO_CASILLA_MM);
  });

  it("el mobiliario se corta a la medida del tablero que imprimimos", () => {
    // Si alguien cambia el tamaño de la casilla y no el del cartón, las piezas
    // dejan de encajar y no hay test de reglas que lo note.
    expect(LADO_CASILLA_CM).toBe(LADO_CASILLA_MM / 10);
  });
});
