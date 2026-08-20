import { describe, it, expect } from "vitest";
import { MAPA_TABLERO } from "../src/data/board-base";
import { comoLiteralTS, pintarCelda, revisarMapa } from "../src/data/board-check";

const errores = (m: readonly string[]) => revisarMapa(m).filter((a) => a.gravedad === "error");
const avisos = (m: readonly string[]) => revisarMapa(m).filter((a) => a.gravedad === "aviso");

describe("revisarMapa sobre el tablero real", () => {
  it("no encuentra ningún error", () => {
    expect(errores(MAPA_TABLERO)).toEqual([]);
  });

  it("avisa solo de la sala ajedrezada, que no es rectangular", () => {
    const a = avisos(MAPA_TABLERO);
    expect(a).toHaveLength(1);
    expect(a[0]!.texto).toContain("'o'");
    expect(a[0]!.texto).toContain("no es un rectángulo");
  });
});

describe("revisarMapa detecta mapas rotos", () => {
  it("caza una sala partida en dos", () => {
    // Pintamos de 'a' una casilla suelta lejos de la sala 'a'.
    const roto = pintarCelda(MAPA_TABLERO, 12, 9, "a");
    expect(errores(roto).some((e) => e.texto.includes("'a' está partida"))).toBe(true);
  });

  it("caza una sala pegada al borde", () => {
    const roto = pintarCelda(MAPA_TABLERO, 5, 0, "b");
    expect(errores(roto).some((e) => e.texto.includes("borde superior"))).toBe(true);
  });

  it("caza el pasillo partido en dos redes", () => {
    // Taponamos el pasillo vertical de las columnas 12-13 en la fila 9,
    // y los laterales, dejando el norte incomunicado del sur.
    let roto: readonly string[] = MAPA_TABLERO;
    for (const [x, y] of [[9, 9], [16, 9]] as const) roto = pintarCelda(roto, x, y, "k");
    for (const [x, y] of [[12, 9], [13, 9]] as const) roto = pintarCelda(roto, x, y, "k");
    for (const y of [9]) for (const x of [0, 25]) roto = pintarCelda(roto, x, y, "k");
    expect(errores(roto).some((e) => e.texto.includes("pasillo está partido"))).toBe(true);
  });

  it("no avisa de sala partida cuando la corrección es válida", () => {
    // Ampliar la sala 'a' por una casilla contigua sigue siendo una sola pieza.
    const ampliada = pintarCelda(MAPA_TABLERO, 1, 4, "a");
    expect(errores(ampliada).some((e) => e.texto.includes("'a' está partida"))).toBe(false);
  });
});

describe("pintarCelda", () => {
  it("no muta el mapa original", () => {
    const antes = MAPA_TABLERO.join("|");
    pintarCelda(MAPA_TABLERO, 3, 3, ".");
    expect(MAPA_TABLERO.join("|")).toBe(antes);
  });

  it("cambia exactamente una casilla", () => {
    const m = pintarCelda(MAPA_TABLERO, 3, 3, ".");
    expect(m[3]![3]).toBe(".");
    expect(m[3]!.length).toBe(MAPA_TABLERO[3]!.length);
    const distintas = m.filter((f, j) => f !== MAPA_TABLERO[j]).length;
    expect(distintas).toBe(1);
  });
});

describe("comoLiteralTS", () => {
  it("produce algo que se puede pegar y volver a leer", () => {
    const txt = comoLiteralTS(MAPA_TABLERO);
    expect(txt).toContain("export const MAPA_TABLERO");
    const filas = [...txt.matchAll(/"([.a-z]+)"/g)].map((m) => m[1]!);
    expect(filas).toEqual([...MAPA_TABLERO]);
  });
});
