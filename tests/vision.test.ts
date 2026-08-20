import { describe, it, expect } from "vitest";
import { lineaDeVision, puedeVer } from "../src/engine/vision";
import { c, partida } from "./ayuda";

const conPuertaAbierta = () =>
  partida({
    puertas: [{ id: "p", a: c(0, 2), b: c(1, 2), abierta: true, secreta: false, descubierta: true }],
  });

describe("la regla de las salas", () => {
  it("una sala sin revelar está a oscuras aunque haya línea recta", () => {
    const e = { ...conPuertaAbierta(), salasReveladas: [] };
    expect(puedeVer(e, c(0, 2), c(1, 2))).toBe(false);
  });

  it("desde el vano de la puerta se ve la sala entera", () => {
    const e = { ...conPuertaAbierta(), salasReveladas: ["a"] };
    expect(puedeVer(e, c(0, 2), c(1, 2))).toBe(true);
    expect(puedeVer(e, c(0, 2), c(4, 3))).toBe(true); // el rincón del fondo
  });

  it("desde el pasillo pero lejos de la puerta no se ve dentro", () => {
    const e = { ...conPuertaAbierta(), salasReveladas: ["a"] };
    expect(puedeVer(e, c(0, 5), c(2, 2))).toBe(false);
  });

  it("dentro de la sala se ve todo sin trazar rectas", () => {
    const e = { ...partida(), salasReveladas: ["a"] };
    expect(puedeVer(e, c(1, 1), c(4, 3))).toBe(true);
  });

  it("desde una sala no se ve la de al lado", () => {
    const e = { ...partida(), salasReveladas: ["a", "b"] };
    expect(puedeVer(e, c(4, 1), c(5, 1))).toBe(false);
  });
});

describe("línea de visión geométrica", () => {
  it("se ve a lo largo de un pasillo recto", () => {
    const e = partida();
    expect(lineaDeVision(e, c(0, 0), c(10, 0))).toBe(true);
  });

  it("un muro corta la línea", () => {
    const e = partida();
    expect(lineaDeVision(e, c(0, 1), c(3, 1))).toBe(false); // cruza a la sala 'a'
  });

  it("el mobiliario que tapa corta la línea", () => {
    const conMesa = partida({
      muebles: [{ id: "m", tipo: "estanteria", celdas: [c(5, 0)], bloqueaPaso: true, bloqueaVista: true }],
    });
    expect(lineaDeVision(conMesa, c(0, 0), c(10, 0))).toBe(false);
  });

  it("el mobiliario de las casillas extremas no cuenta", () => {
    const conMesa = partida({
      muebles: [{ id: "m", tipo: "estanteria", celdas: [c(10, 0)], bloqueaPaso: true, bloqueaVista: true }],
    });
    expect(lineaDeVision(conMesa, c(0, 0), c(10, 0))).toBe(true);
  });

  it("una figura no tapa la vista", () => {
    const e = partida({ monstruos: [{ id: "orco1", especie: "orco", celda: c(5, 0) }] });
    expect(lineaDeVision(e, c(0, 0), c(10, 0))).toBe(true);
  });

  it("verse a sí mismo siempre vale", () => {
    const e = partida();
    expect(lineaDeVision(e, c(3, 3), c(3, 3))).toBe(true);
  });
});
