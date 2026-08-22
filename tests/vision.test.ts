import { describe, it, expect } from "vitest";
import { lineaDeVision, puedeVer } from "../src/engine/vision";
import { c, partida, situar } from "./ayuda";

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

  it("una figura en medio corta la línea", () => {
    const e = partida({ monstruos: [{ id: "orco1", especie: "orco", celda: c(5, 0) }] });
    expect(lineaDeVision(e, c(0, 0), c(10, 0))).toBe(false);
  });

  it("los héroes tapan igual que los monstruos", () => {
    const e = situar(partida(), "barbaro", c(5, 0));
    expect(lineaDeVision(e, c(0, 0), c(10, 0))).toBe(false);
  });

  it("la figura del propio objetivo no se tapa a sí misma", () => {
    const e = partida({ monstruos: [{ id: "orco1", especie: "orco", celda: c(10, 0) }] });
    expect(lineaDeVision(e, c(0, 0), c(10, 0))).toBe(true);
  });

  it("ni quien mira se tapa a sí mismo", () => {
    // El bárbaro está en la casilla desde la que se traza: el elfo con ballesta
    // dispararía desde debajo de su propia figura si esto no fuese así.
    const e = situar(partida({ monstruos: [{ id: "orco1", especie: "orco", celda: c(10, 0) }] }), "barbaro", c(0, 0));
    expect(lineaDeVision(e, c(0, 0), c(10, 0))).toBe(true);
  });

  it("una figura caída ya no tapa", () => {
    const viva = partida({ monstruos: [{ id: "orco1", especie: "orco", celda: c(5, 0) }] });
    const e = { ...viva, monstruos: viva.monstruos.map((m) => ({ ...m, cuerpo: 0 })) };
    expect(lineaDeVision(e, c(0, 0), c(10, 0))).toBe(true);
  });

  it("una figura a la que la recta solo le roza la esquina no tapa", () => {
    // Diagonal limpia dentro de la sala 'a': la recta (1,1)-(3,3) pasa por el
    // vértice de (2,1), no por dentro.
    const e = partida({ monstruos: [{ id: "orco1", especie: "orco", celda: c(2, 1) }] });
    expect(lineaDeVision(e, c(1, 1), c(3, 3))).toBe(true);
  });

  it("pero la que está justo sobre la diagonal sí tapa", () => {
    const e = partida({ monstruos: [{ id: "orco1", especie: "orco", celda: c(2, 2) }] });
    expect(lineaDeVision(e, c(1, 1), c(3, 3))).toBe(false);
  });

  it("verse a sí mismo siempre vale", () => {
    const e = partida();
    expect(lineaDeVision(e, c(3, 3), c(3, 3))).toBe(true);
  });
});
