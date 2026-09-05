import { describe, it, expect } from "vitest";
import {
  ANCHO_TABLERO,
  ALTO_TABLERO,
  MAPA_TABLERO,
  NOMBRES_SALAS,
  celdasDeSala,
  claveEn,
  esPasillo,
  hayMuroEntre,
  idsDeSalas,
  marcoDeSala,
  salaEn,
  vecinas,
} from "../src/data/board-base";

describe("dimensiones del mapa", () => {
  it("tiene 19 filas de 26 columnas", () => {
    expect(MAPA_TABLERO).toHaveLength(ALTO_TABLERO);
    for (const fila of MAPA_TABLERO) expect(fila).toHaveLength(ANCHO_TABLERO);
  });

  it("solo usa '.' y letras minúsculas", () => {
    expect(MAPA_TABLERO.join("")).toMatch(/^[.a-z]+$/);
  });
});

describe("salas", () => {
  it("toda sala del mapa tiene nombre y todo nombre tiene sala", () => {
    expect(idsDeSalas()).toEqual(Object.keys(NOMBRES_SALAS).sort());
  });

  it("cada sala es una región conexa", () => {
    for (const id of idsDeSalas()) {
      const celdas = celdasDeSala(id);
      const vistas = new Set<string>([`${celdas[0]!.x},${celdas[0]!.y}`]);
      const pila = [celdas[0]!];
      while (pila.length) {
        const c = pila.pop()!;
        for (const n of vecinas(c)) {
          const k = `${n.x},${n.y}`;
          if (salaEn(n.x, n.y) === id && !vistas.has(k)) {
            vistas.add(k);
            pila.push(n);
          }
        }
      }
      expect(vistas.size, `la sala '${id}' está partida en trozos`).toBe(celdas.length);
    }
  });

  it("ninguna sala toca el borde del tablero", () => {
    // El anillo exterior es siempre pasillo: es por donde se entra a la mazmorra.
    for (let x = 0; x < ANCHO_TABLERO; x++) {
      expect(esPasillo(x, 0)).toBe(true);
      expect(esPasillo(x, ALTO_TABLERO - 1)).toBe(true);
    }
    for (let y = 0; y < ALTO_TABLERO; y++) {
      expect(esPasillo(0, y)).toBe(true);
      expect(esPasillo(ANCHO_TABLERO - 1, y)).toBe(true);
    }
  });

  it("la sala central ocupa las columnas 10-15 y las filas 7-11", () => {
    // La fila 12 era un error de transcripción: en el tablero real es pasillo
    // (revisado contra la foto el 2026-09-05, autorización en _ESTADO.md).
    expect(marcoDeSala("k")).toEqual({ x0: 10, y0: 7, x1: 15, y1: 11 });
    expect(celdasDeSala("k")).toHaveLength(30);
  });

  it("la sala ajedrezada tiene el escalón medido en la foto", () => {
    // Cols 17-20 en las filas 10-12, pero solo 18-20 en la fila 13:
    // la esquina (17,13) la ocupa la sala roja de al lado.
    expect(celdasDeSala("o")).toHaveLength(15);
    expect(salaEn(17, 12)).toBe("o");
    expect(salaEn(17, 13)).toBe("t");
    expect(salaEn(18, 13)).toBe("o");
  });
});

describe("pasillos", () => {
  it("todo el pasillo forma una única red conexa", () => {
    const pasillos: Array<[number, number]> = [];
    for (let y = 0; y < ALTO_TABLERO; y++)
      for (let x = 0; x < ANCHO_TABLERO; x++) if (esPasillo(x, y)) pasillos.push([x, y]);

    const vistas = new Set<string>(["0,0"]);
    const pila = [{ x: 0, y: 0 }];
    while (pila.length) {
      const c = pila.pop()!;
      for (const n of vecinas(c)) {
        const k = `${n.x},${n.y}`;
        if (esPasillo(n.x, n.y) && !vistas.has(k)) {
          vistas.add(k);
          pila.push(n);
        }
      }
    }
    expect(vistas.size, "hay pasillo inalcanzable desde la entrada").toBe(pasillos.length);
  });
});

describe("muros", () => {
  it("no hay muro entre dos casillas de la misma región", () => {
    expect(hayMuroEntre({ x: 1, y: 1 }, { x: 2, y: 1 })).toBe(false); // dentro de la sala 'a'
    expect(hayMuroEntre({ x: 0, y: 0 }, { x: 1, y: 0 })).toBe(false); // pasillo con pasillo
  });

  it("hay muro al cambiar de región", () => {
    expect(hayMuroEntre({ x: 0, y: 1 }, { x: 1, y: 1 })).toBe(true); // pasillo -> sala 'a'
    expect(hayMuroEntre({ x: 4, y: 1 }, { x: 5, y: 1 })).toBe(true); // sala 'a' -> sala 'b'
  });

  it("el borde exterior del tablero es muro", () => {
    expect(hayMuroEntre({ x: 0, y: 0 }, { x: -1, y: 0 })).toBe(true);
  });
});

describe("recuento global", () => {
  it("cuadra el reparto entre sala y pasillo", () => {
    const total = ANCHO_TABLERO * ALTO_TABLERO;
    const deSala = MAPA_TABLERO.join("").split("").filter((c) => c !== ".").length;
    expect(total).toBe(494);
    expect(deSala).toBe(346);
    expect(total - deSala).toBe(148);
  });

  it("hay 22 salas", () => {
    expect(idsDeSalas()).toHaveLength(22);
  });

  it("claveEn devuelve null fuera del tablero", () => {
    expect(claveEn(-1, 0)).toBeNull();
    expect(claveEn(ANCHO_TABLERO, 0)).toBeNull();
  });
});
