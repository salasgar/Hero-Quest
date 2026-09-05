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

describe("dentro de un foso se tira un dado menos", () => {
  // Reglamento p. 17: «When in a pit, you may also attack and defend, but you
  // must roll one fewer combat dice when doing so. (This applies to monsters as
  // well.)» Estar dentro no es un campo de la figura: es estar en la casilla de
  // un foso ya disparado.
  const enFoso = (e: ReturnType<typeof partida>, celda: { x: number; y: number }) => ({
    ...e,
    trampas: [{ id: "t1", tipo: "foso" as const, celda, descubierta: true, gastada: true }],
  });

  it("el bárbaro con espada ancha ataca con 2 en vez de con 3", () => {
    const e = partida({ heroes: [{ clase: "barbaro" }] });
    const h = e.heroes[0]!;
    expect(dadosDeAtaque(h, "cuerpo", e)).toBe(3); // fuera no pierde nada
    expect(dadosDeAtaque(h, "cuerpo", enFoso(e, h.celda))).toBe(2);
  });

  it("el mago con daga sigue atacando con 1, no con 0", () => {
    const e = partida({ heroes: [{ clase: "mago" }] });
    const h = e.heroes[0]!;
    expect(dadosDeAtaque(h, "cuerpo", enFoso(e, h.celda))).toBe(1);
  });

  // El suelo no se llega a tocar defendiendo: todos los héroes defienden con 2
  // y la armadura solo suma, así que dentro del foso lo peor es bajar a 1. Este
  // test fija que la penalización también se aplica a la defensa, no el suelo.
  it("la defensa también pierde su dado", () => {
    const e = partida({ heroes: [{ clase: "mago" }] });
    const h = e.heroes[0]!;
    expect(dadosDeDefensa(h, e)).toBe(2);
    expect(dadosDeDefensa(h, enFoso(e, h.celda))).toBe(1);
  });

  it("el monstruo también pierde su dado", () => {
    const e = conMonstruo();
    const m = e.monstruos[0]!;
    expect(dadosDeAtaque(m, "cuerpo", e)).toBe(3); // orco
    expect(dadosDeAtaque(m, "cuerpo", enFoso(e, m.celda))).toBe(2);
    expect(dadosDeDefensa(m, enFoso(e, m.celda))).toBe(1); // 2 - 1
  });

  it("un foso en otra casilla no le quita nada a nadie", () => {
    const e = conMonstruo();
    const lejos = enFoso(e, c(20, 20));
    expect(dadosDeAtaque(e.heroes[0]!, "cuerpo", lejos)).toBe(3);
    expect(dadosDeDefensa(e.monstruos[0]!, lejos)).toBe(2);
  });

  it("un foso que todavía no ha saltado no es un foso: nadie está dentro", () => {
    const e = partida({ heroes: [{ clase: "barbaro" }] });
    const h = e.heroes[0]!;
    const sinSaltar = {
      ...e,
      trampas: [{ id: "t1", tipo: "foso" as const, celda: h.celda, descubierta: false, gastada: false }],
    };
    expect(dadosDeAtaque(h, "cuerpo", sinSaltar)).toBe(3);
  });

  it("el ataque resuelto tira los dados ya descontados", () => {
    const e = conMonstruo();
    const h = e.heroes[0]!;
    const [res] = resolverAtaque(enFoso(e, h.celda), h, e.monstruos[0]!);
    expect(res.dadosAtaque).toHaveLength(2); // 3 - 1: los tira el motor
  });
});

describe("resolución del ataque", () => {
  const CAL: CaraCombate = "calavera";
  const BLA: CaraCombate = "escudoBlanco";
  const NEG: CaraCombate = "escudoNegro";

  it("usa los dados que se le pasan, sin tirar nada", () => {
    const e = conMonstruo();
    const [res, rng] = resolverAtaque(e, e.heroes[0]!, e.monstruos[0]!, [CAL, CAL, CAL], [NEG, BLA]);
    expect(res.calaveras).toBe(3);
    expect(res.escudos).toBe(1); // monstruo: solo cuenta el negro
    expect(res.dano).toBe(2);
    expect(rng).toEqual(e.rng); // no ha gastado azar
  });

  it("el monstruo solo para con escudos negros", () => {
    const e = conMonstruo();
    const [res] = resolverAtaque(e, e.heroes[0]!, e.monstruos[0]!, [CAL, CAL], [BLA, BLA]);
    expect(res.escudos).toBe(0);
    expect(res.dano).toBe(2);
  });

  it("el héroe solo para con escudos blancos", () => {
    const e = conMonstruo();
    const [res] = resolverAtaque(e, e.monstruos[0]!, e.heroes[0]!, [CAL, CAL], [NEG, NEG]);
    expect(res.escudos).toBe(0);
    expect(res.dano).toBe(2);
  });

  it("el daño nunca es negativo", () => {
    const e = conMonstruo();
    const [res] = resolverAtaque(e, e.monstruos[0]!, e.heroes[0]!, [CAL], [BLA, BLA, BLA]);
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
      const [a, r1] = resolverAtaque({ ...e, rng: r }, e.heroes[0]!, momia, [CAL]);
      paradasMonstruo += a.escudos;
      const [b, r2] = resolverAtaque({ ...e, rng: r1 }, e.monstruos[0]!, e.heroes[0]!, [CAL]);
      paradasHeroe += b.escudos;
      r = r2;
    }
    expect(paradasMonstruo / N).toBeCloseTo(4 / 6, 1);
    expect(paradasHeroe / N).toBeCloseTo(2 / 3, 1);
  });
});
