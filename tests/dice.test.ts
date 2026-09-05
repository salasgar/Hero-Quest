import { describe, it, expect } from "vitest";
import {
  contarCalaveras,
  contarEscudosBlancos,
  contarEscudosNegros,
  equivalenciaDeDados,
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

describe("dados corrientes que hacen de dado de combate", () => {
  it("el d6 se lee 1-3 calavera, 4-5 escudo blanco, 6 escudo negro", () => {
    expect(equivalenciaDeDados(6)).toEqual([
      { cara: "calavera", numeros: [1, 2, 3] },
      { cara: "escudoBlanco", numeros: [4, 5] },
      { cara: "escudoNegro", numeros: [6] },
    ]);
  });

  it("el d12 dobla cada tramo", () => {
    expect(equivalenciaDeDados(12)).toEqual([
      { cara: "calavera", numeros: [1, 2, 3, 4, 5, 6] },
      { cara: "escudoBlanco", numeros: [7, 8, 9, 10] },
      { cara: "escudoNegro", numeros: [11, 12] },
    ]);
  });

  it("reparte todas las caras del dado, sin huecos ni repetidos", () => {
    for (const lados of [6, 12, 18, 24]) {
      const numeros = equivalenciaDeDados(lados).flatMap((t) => t.numeros);
      expect(numeros).toEqual([...Array(lados)].map((_, i) => i + 1));
    }
  });

  it("mantiene las probabilidades del dado de combate", () => {
    for (const lados of [6, 12, 24]) {
      const tramos = equivalenciaDeDados(lados);
      const proporcion = (cara: string) =>
        tramos.find((t) => t.cara === cara)!.numeros.length / lados;
      expect(proporcion("calavera")).toBeCloseTo(1 / 2);
      expect(proporcion("escudoBlanco")).toBeCloseTo(1 / 3);
      expect(proporcion("escudoNegro")).toBeCloseTo(1 / 6);
    }
  });

  it("rechaza un dado cuyas caras no se reparten por igual", () => {
    // Un d10 daría tramos desiguales y cambiaría el juego sin avisar.
    expect(() => equivalenciaDeDados(10)).toThrow();
    expect(() => equivalenciaDeDados(0)).toThrow();
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
