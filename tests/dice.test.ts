import { describe, it, expect } from "vitest";
import {
  contarCalaveras,
  contarEscudosBlancos,
  contarEscudosNegros,
  tirarDadoCombate,
  tirarDadosCombate,
  tirarMovimiento,
} from "../src/engine/dice";
import { crearRng, siguiente } from "../src/engine/rng";

describe("generador con semilla", () => {
  it("la misma semilla da la misma secuencia", () => {
    const a = [...Array(20)].reduce(
      (acc: { v: number[]; r: ReturnType<typeof crearRng> }) => {
        const [v, r] = siguiente(acc.r);
        return { v: [...acc.v, v], r };
      },
      { v: [], r: crearRng(7) },
    ).v;
    const b = [...Array(20)].reduce(
      (acc: { v: number[]; r: ReturnType<typeof crearRng> }) => {
        const [v, r] = siguiente(acc.r);
        return { v: [...acc.v, v], r };
      },
      { v: [], r: crearRng(7) },
    ).v;
    expect(a).toEqual(b);
  });

  it("semillas distintas dan secuencias distintas", () => {
    const [x] = siguiente(crearRng(1));
    const [y] = siguiente(crearRng(2));
    expect(x).not.toBe(y);
  });

  it("no muta el estado que recibe", () => {
    const r = crearRng(99);
    siguiente(r);
    siguiente(r);
    expect(r.semilla).toBe(99);
  });
});

describe("dado de combate", () => {
  it("reparte 3 calaveras, 2 escudos blancos y 1 negro", () => {
    let r = crearRng(12345);
    const cuenta = { calavera: 0, escudoBlanco: 0, escudoNegro: 0 };
    const N = 60000;
    for (let i = 0; i < N; i++) {
      const [cara, r2] = tirarDadoCombate(r);
      cuenta[cara]++;
      r = r2;
    }
    // Márgenes holgados: comprobamos el reparto, no la calidad del generador.
    expect(cuenta.calavera / N).toBeGreaterThan(0.48);
    expect(cuenta.calavera / N).toBeLessThan(0.52);
    expect(cuenta.escudoBlanco / N).toBeGreaterThan(0.31);
    expect(cuenta.escudoBlanco / N).toBeLessThan(0.35);
    expect(cuenta.escudoNegro / N).toBeGreaterThan(0.15);
    expect(cuenta.escudoNegro / N).toBeLessThan(0.18);
  });

  it("el escudo blanco sale el doble que el negro", () => {
    let r = crearRng(555);
    let blancos = 0;
    let negros = 0;
    for (let i = 0; i < 60000; i++) {
      const [cara, r2] = tirarDadoCombate(r);
      if (cara === "escudoBlanco") blancos++;
      if (cara === "escudoNegro") negros++;
      r = r2;
    }
    expect(blancos / negros).toBeGreaterThan(1.85);
    expect(blancos / negros).toBeLessThan(2.15);
  });

  it("tira tantos dados como se le piden", () => {
    const [caras] = tirarDadosCombate(crearRng(3), 5);
    expect(caras).toHaveLength(5);
  });

  it("los contadores cuentan lo suyo", () => {
    const caras = ["calavera", "calavera", "escudoBlanco", "escudoNegro"] as const;
    expect(contarCalaveras(caras)).toBe(2);
    expect(contarEscudosBlancos(caras)).toBe(1);
    expect(contarEscudosNegros(caras)).toBe(1);
  });
});

describe("dados de movimiento", () => {
  it("siempre caen entre 2 y 12", () => {
    let r = crearRng(2024);
    for (let i = 0; i < 5000; i++) {
      const [[a, b], r2] = tirarMovimiento(r);
      expect(a).toBeGreaterThanOrEqual(1);
      expect(a).toBeLessThanOrEqual(6);
      expect(a + b).toBeGreaterThanOrEqual(2);
      expect(a + b).toBeLessThanOrEqual(12);
      r = r2;
    }
  });
});
