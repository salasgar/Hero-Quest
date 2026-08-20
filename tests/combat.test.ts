import { describe, it, expect } from "vitest";
import { dadosDeAtaque, dadosDeDefensa, resolverAtaque } from "../src/engine/combat";
import { crearRng } from "../src/engine/rng";
import type { CaraCombate } from "../src/engine/dice";
import { c, partida } from "./ayuda";

const conMonstruo = () =>
  partida({ monstruos: [{ id: "orco1", especie: "orco", celda: c(2, 1) }] });

describe("dados de ataque y defensa", () => {
  it("el arma del héroe marca su ataque", () => {
    const e = partida({ heroes: [{ clase: "barbaro" }] });
    expect(dadosDeAtaque(e.heroes[0]!)).toBe(3); // espada ancha
    const mago = partida({ heroes: [{ clase: "mago" }] });
    expect(dadosDeAtaque(mago.heroes[0]!)).toBe(1); // daga
  });

  it("la armadura suma defensa", () => {
    const e = partida({ heroes: [{ clase: "barbaro" }] });
    expect(dadosDeDefensa(e.heroes[0]!)).toBe(2);
    const conEscudo = { ...e.heroes[0]!, equipo: [...e.heroes[0]!.equipo, "escudo" as const] };
    expect(dadosDeDefensa(conEscudo)).toBe(3);
  });

  it("los bonus de hechizo suman", () => {
    const e = partida();
    const h = {
      ...e.heroes[0]!,
      efectos: [{ clase: "bonusAtaque", dados: 2, duracion: "siguienteAtaque" as const }],
    };
    expect(dadosDeAtaque(h)).toBe(5);
  });

  it("el monstruo saca sus valores de su especie", () => {
    const e = conMonstruo();
    expect(dadosDeAtaque(e.monstruos[0]!)).toBe(3); // orco
    expect(dadosDeDefensa(e.monstruos[0]!)).toBe(2);
  });
});

describe("resolución del ataque", () => {
  const CAL: CaraCombate = "calavera";
  const BLA: CaraCombate = "escudoBlanco";
  const NEG: CaraCombate = "escudoNegro";

  it("usa los dados que se le pasan, sin tirar nada", () => {
    const e = conMonstruo();
    const [res, rng] = resolverAtaque(e.rng, e.heroes[0]!, e.monstruos[0]!, [CAL, CAL, CAL], [NEG, BLA]);
    expect(res.calaveras).toBe(3);
    expect(res.escudos).toBe(1); // monstruo: solo cuenta el negro
    expect(res.dano).toBe(2);
    expect(rng).toEqual(e.rng); // no ha gastado azar
  });

  it("el monstruo solo para con escudos negros", () => {
    const e = conMonstruo();
    const [res] = resolverAtaque(e.rng, e.heroes[0]!, e.monstruos[0]!, [CAL, CAL], [BLA, BLA]);
    expect(res.escudos).toBe(0);
    expect(res.dano).toBe(2);
  });

  it("el héroe solo para con escudos blancos", () => {
    const e = conMonstruo();
    const [res] = resolverAtaque(e.rng, e.monstruos[0]!, e.heroes[0]!, [CAL, CAL], [NEG, NEG]);
    expect(res.escudos).toBe(0);
    expect(res.dano).toBe(2);
  });

  it("el daño nunca es negativo", () => {
    const e = conMonstruo();
    const [res] = resolverAtaque(e.rng, e.monstruos[0]!, e.heroes[0]!, [CAL], [BLA, BLA, BLA]);
    expect(res.dano).toBe(0);
  });

  it("la asimetría de escudos hace al monstruo más frágil de lo que parece", () => {
    // Un monstruo con 4 dados de defensa para de media 4/6 calaveras;
    // un héroe con 2 dados para exactamente lo mismo.
    const e = conMonstruo();
    let r = crearRng(31337);
    let paradasMonstruo = 0;
    let paradasHeroe = 0;
    const N = 40000;
    const momia = { ...e.monstruos[0]!, especie: "momia" as const }; // defensa 4
    for (let i = 0; i < N; i++) {
      const [a, r1] = resolverAtaque(r, e.heroes[0]!, momia, [CAL]);
      paradasMonstruo += a.escudos;
      const [b, r2] = resolverAtaque(r1, e.monstruos[0]!, e.heroes[0]!, [CAL]);
      paradasHeroe += b.escudos;
      r = r2;
    }
    expect(paradasMonstruo / N).toBeCloseTo(4 / 6, 1);
    expect(paradasHeroe / N).toBeCloseTo(2 / 3, 1);
  });
});
