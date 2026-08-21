import { describe, expect, it } from "vitest";
import { HECHIZOS } from "../src/data/spells";
import { alcanzables } from "../src/engine/board";
import { aplicarAccion } from "../src/engine/reducer";
import { objetivosDeAtaque } from "../src/engine/selectors";
import { claveCelda, type EstadoPartida, type Evento } from "../src/engine/types";
import { c, conMovimiento, hacer, partida, rechaza, situar } from "./ayuda";

const CAL = "calavera" as const;

/**
 * El mago de turno en la sala 'a', que ocupa las columnas 1-4 y las filas 1-4.
 * La sala va revelada: a oscuras no hay línea de visión ni para los hechizos.
 */
const conMago = (op: Parameters<typeof partida>[0] = {}) => {
  const e = partida({ heroes: [{ clase: "mago", elementos: ["aire", "agua", "tierra"] }], ...op });
  return { ...situar(e, "mago", c(1, 1)), salasReveladas: ["a"] };
};

const tiene = (e: EstadoPartida, id: string, clase: string) =>
  e.heroes.find((h) => h.id === id)!.efectos.some((x) => x.clase === clase);

describe("los hechizos que antes gastaban la carta y no hacían nada", () => {
  it("todos los efectos declarados los ejecuta el motor", () => {
    // La comprobación de fondo: ninguna clase de efecto puede quedarse sin
    // implementar sin que este test se entere.
    const clases = new Set(Object.values(HECHIZOS).map((h) => h.efecto.clase));
    const implementadas = new Set([
      "danoDirecto", "curar", "bonusAtaque", "bonusDefensa", "dormir",
      "perderTurno", "movimientoExtra", "atravesarMuros", "intangible", "invocar",
    ]);
    for (const clase of clases) expect(implementadas.has(clase), `${clase} sin implementar`).toBe(true);
  });
});

describe("genio", () => {
  const escena = () =>
    conMago({ monstruos: [{ id: "orco1", especie: "orco", celda: c(4, 1) }] });

  it("cae sobre el enemigo señalado y le hace daño", () => {
    const e = hacer(escena(), {
      tipo: "lanzarHechizo",
      hechizo: "genio",
      objetivo: "orco1",
      dados: [CAL, CAL, CAL, CAL],
    });
    const orco = e.monstruos[0]!;
    expect(orco.cuerpo).toBe(0); // el orco tiene 1 de cuerpo: cuatro calaveras sobran
    expect(e.registro.some((x: Evento) => x.tipo === "danoDeHechizo")).toBe(true);
  });

  it("el daño del genio no admite tirada de defensa", () => {
    const e = hacer(escena(), {
      tipo: "lanzarHechizo",
      hechizo: "genio",
      objetivo: "orco1",
      dados: [CAL],
    });
    const dano = e.registro.find((x: Evento) => x.tipo === "danoDeHechizo");
    if (dano?.tipo !== "danoDeHechizo") throw new Error("no se registró el daño");
    expect(dano.dano).toBe(1);
  });
});

describe("velo de niebla", () => {
  const escena = () =>
    conMago({
      heroes: [{ clase: "mago", elementos: ["agua"] }, { clase: "barbaro" }],
      monstruos: [{ id: "orco1", especie: "orco", celda: c(2, 1) }],
    });

  it("mientras dura, nadie puede atacar al lanzador", () => {
    let e = situar(escena(), "mago", c(1, 1));
    e = hacer(e, { tipo: "lanzarHechizo", hechizo: "veloDeNiebla", objetivo: "mago" });
    expect(tiene(e, "mago", "intangible")).toBe(true);

    // Le toca a Zargon y el orco lo intenta.
    e = hacer(e, { tipo: "terminarTurno" });
    e = hacer(e, { tipo: "terminarTurno" }); // el bárbaro pasa
    e = hacer(e, { tipo: "activarMonstruo", monstruo: "orco1" });
    expect(rechaza(e, { tipo: "atacar", objetivo: "mago" })).toMatch(/niebla/i);
    expect(objetivosDeAtaque(e).map((o) => o.id)).not.toContain("mago");
  });

  it("aguanta la ronda entera de Zargon y se deshace al volverle a tocar", () => {
    let e = situar(escena(), "mago", c(1, 1));
    e = hacer(e, { tipo: "lanzarHechizo", hechizo: "veloDeNiebla", objetivo: "mago" });
    e = hacer(e, { tipo: "terminarTurno" }); // bárbaro
    expect(tiene(e, "mago", "intangible")).toBe(true);
    e = hacer(e, { tipo: "terminarTurno" }); // zargon
    expect(tiene(e, "mago", "intangible")).toBe(true);
    e = hacer(e, { tipo: "terminarTurno" }); // vuelve el mago
    expect(tiene(e, "mago", "intangible")).toBe(false);
  });
});

describe("atravesar la roca", () => {
  it("sin el hechizo, de la sala al pasillo hay muro", () => {
    const e = conMovimiento(conMago(), 6);
    expect(alcanzables(e, e.heroes[0]!, 6).has(claveCelda(c(0, 1)))).toBe(false);
  });

  it("con el hechizo se cruza la pared", () => {
    let e = conMovimiento(conMago(), 6);
    e = hacer(e, { tipo: "lanzarHechizo", hechizo: "atravesarLaRoca", objetivo: "mago" });
    expect(alcanzables(e, e.heroes[0]!, 6).has(claveCelda(c(0, 1)))).toBe(true);
    e = hacer(e, { tipo: "mover", destino: c(0, 1) });
    expect(e.heroes[0]!.celda).toEqual(c(0, 1));
  });

  it("los muros vuelven a su sitio al acabar el turno", () => {
    let e = conMovimiento(conMago(), 6);
    e = hacer(e, { tipo: "lanzarHechizo", hechizo: "atravesarLaRoca", objetivo: "mago" });
    e = hacer(e, { tipo: "terminarTurno" });
    expect(tiene(e, "mago", "atravesarMuros")).toBe(false);
  });

  it("entrar en una sala sin abrir su puerta la revela igual", () => {
    // Si no, el héroe se queda de pie en una sala que la partida sigue
    // considerando a oscuras, con sus monstruos sin anunciar. Aquí la sala
    // arranca sin revelar a propósito: es lo que se está comprobando.
    const base = partida({ heroes: [{ clase: "mago", elementos: ["tierra"] }] });
    let e = conMovimiento(situar(base, "mago", c(0, 1)), 6); // en el pasillo
    expect(e.salasReveladas).not.toContain("a");
    e = hacer(e, { tipo: "lanzarHechizo", hechizo: "atravesarLaRoca", objetivo: "mago" });
    e = hacer(e, { tipo: "mover", destino: c(1, 1) });
    expect(e.heroes[0]!.celda).toEqual(c(1, 1));
    expect(e.salasReveladas).toContain("a");
  });
});

describe("viento veloz", () => {
  const dosHeroes = () => ({
    ...partida({
      heroes: [
        { clase: "mago", elementos: ["aire"] },
        { clase: "barbaro" },
      ],
    }),
    salasReveladas: ["a"],
  });

  it("sobre quien está jugando, le devuelve otra tanda de movimiento ahí mismo", () => {
    let e = conMovimiento(situar(dosHeroes(), "mago", c(1, 1)), 5);
    e = hacer(e, { tipo: "mover", destino: c(4, 1) }); // gasta 3
    expect(e.turno.movimientoRestante).toBe(2);
    e = hacer(e, { tipo: "lanzarHechizo", hechizo: "vientoVeloz", objetivo: "mago" });
    expect(e.turno.movimientoRestante).toBe(7); // 2 que le quedaban + los 5 de la tirada
    expect(e.turno.movimientoCerrado).toBe(false); // y puede volver a moverse
    e = hacer(e, { tipo: "mover", destino: c(1, 1) });
    expect(e.heroes[0]!.celda).toEqual(c(1, 1));
  });

  it("sobre otro héroe, espera a su tirada y la dobla", () => {
    let e = conMovimiento(situar(situar(dosHeroes(), "mago", c(1, 1)), "barbaro", c(2, 1)), 5);
    e = hacer(e, { tipo: "lanzarHechizo", hechizo: "vientoVeloz", objetivo: "barbaro" });
    expect(tiene(e, "barbaro", "movimientoExtra")).toBe(true);
    expect(e.turno.movimientoRestante).toBe(5); // al mago no le toca nada

    e = hacer(e, { tipo: "terminarTurno" });
    e = hacer(e, { tipo: "tirarMovimiento", dados: [2, 3] });
    expect(e.turno.movimientoTotal).toBe(10);
    expect(tiene(e, "barbaro", "movimientoExtra")).toBe(false); // se gasta una vez
  });

  it("no se acumula: la segunda tirada ya es normal", () => {
    let e = situar(dosHeroes(), "barbaro", c(2, 1));
    e = hacer(e, { tipo: "terminarTurno" });
    e = { ...e, heroes: e.heroes.map((h) => h.id === "barbaro"
      ? { ...h, efectos: [{ clase: "movimientoExtra", duracion: "mision" as const }] }
      : h) };
    e = hacer(e, { tipo: "tirarMovimiento", dados: [2, 2] });
    expect(e.turno.movimientoTotal).toBe(8);
    e = hacer(e, { tipo: "terminarTurno" });
    e = hacer(e, { tipo: "terminarTurno" }); // zargon
    const r = aplicarAccion(e, { tipo: "tirarMovimiento", dados: [2, 2] });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.estado.turno.movimientoTotal).toBe(4);
  });
});
