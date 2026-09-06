/**
 * T52 · En el turno de Zargon no salen los mandos de los héroes.
 *
 * `mandosDeHeroe` es la única regla que decide si atacar, abrir puerta,
 * buscar, lanzar hechizos, terminar turno, las casillas verdes y el teclado
 * que los dispara tienen que estar en pantalla. La comparten `TurnPanel.tsx`
 * (qué botones pinta) y `Juego.tsx` (qué le pasa a `BoardMirror`); aquí se
 * prueba la función pura, sin montar ningún componente.
 */

import { describe, expect, it } from "vitest";
import { casillasDeMovimiento, esTurnoDeZargon } from "../src/engine/selectors";
import { mandosDeHeroe } from "../src/ui/useAccionesDeTurno";
import { c, enTablero, hacer, partida, situar } from "./ayuda";

/** El bárbaro pasa turno, Zargon activa al goblin descubierto. */
const conMonstruoActivo = () => {
  let e = partida({ monstruos: [{ id: "goblin1", especie: "goblin", celda: c(2, 2) }] });
  e = { ...e, salasReveladas: ["a"] };
  e = enTablero(situar(e, "barbaro", c(2, 1)));
  e = hacer(e, { tipo: "terminarTurno" });
  expect(esTurnoDeZargon(e)).toBe(true);
  return hacer(e, { tipo: "activarMonstruo", monstruo: "goblin1" });
};

describe("mandosDeHeroe", () => {
  it("con un héroe activo, siempre hay mandos", () => {
    const e = partida();
    expect(esTurnoDeZargon(e)).toBe(false);
    expect(mandosDeHeroe(e, null)).toBe(true);
    expect(mandosDeHeroe(e, { pausado: false, averia: null })).toBe(true);
  });

  it("con un monstruo activo y Zargon en automático, no hay mandos", () => {
    const e = conMonstruoActivo();
    expect(mandosDeHeroe(e, { pausado: false, averia: null })).toBe(false);
    // Sin objeto de Zargon (la pantalla de casa, que nunca lo trae), tampoco.
    expect(mandosDeHeroe(e, null)).toBe(false);
    expect(mandosDeHeroe(e, undefined)).toBe(false);
  });

  it("con un monstruo activo y Zargon en pausa, el máster tiene los mandos", () => {
    const e = conMonstruoActivo();
    expect(mandosDeHeroe(e, { pausado: true, averia: null })).toBe(true);
  });

  it("con un monstruo activo y Zargon averiado, el máster tiene los mandos", () => {
    const e = conMonstruoActivo();
    expect(mandosDeHeroe(e, { pausado: false, averia: "algo se ha roto" })).toBe(true);
  });
});

describe("sin mandos, las casillas verdes del monstruo activo no llegan al tablero", () => {
  it("el selector de movimiento no está vacío: la barrera de verdad es mandosDeHeroe", () => {
    // `Juego.tsx` pasa a `BoardMirror` `mandos ? turno.movimiento : []`: el
    // selector, por sí solo, no sabe nada de mandos ni de quién mira la
    // pantalla, así que sin esta comprobación el goblin activo pintaría sus
    // casillas de movimiento igual que un héroe.
    const e = conMonstruoActivo();
    expect(casillasDeMovimiento(e).length).toBeGreaterThan(0);
    expect(mandosDeHeroe(e, { pausado: false, averia: null })).toBe(false);
  });
});
