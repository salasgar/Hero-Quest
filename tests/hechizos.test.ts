import { describe, expect, it } from "vitest";
import { EQUIPO, POR_VERIFICAR, type IdEquipo } from "../src/data/equipment";
import { HECHIZOS, HECHIZOS_POR_VERIFICAR } from "../src/data/spells";
import { alcanzables } from "../src/engine/board";
import { aplicarAccion } from "../src/engine/reducer";
import { objetivosDeAtaque } from "../src/engine/selectors";
import { claveCelda, type EstadoPartida, type Evento } from "../src/engine/types";
import { c, conMovimiento, hacer, partida, situar } from "./ayuda";

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
      "curar", "bonusAtaque", "bonusDefensa", "dormir", "perderTurno",
      "movimientoExtra", "atravesarMuros", "atravesarFiguras", "invocar",
      "danoConSalvacion",
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
  // La carta dice: "en su próximo movimiento pasa a través de los monstruos sin
  // ser visto". No es invulnerabilidad —eso me lo había inventado yo— sino
  // permiso para cruzar la casilla que ocupa un monstruo.
  const conOrcoEnMedio = () => {
    const e = conMago({
      heroes: [{ clase: "mago", elementos: ["agua"] }],
      monstruos: [{ id: "orco1", especie: "orco", celda: c(2, 1) }],
    });
    // Dos casillas justas: por la línea recta se llega, rodeando no. Con más
    // movimiento el orco no taponaría nada, porque la sala mide 4 x 4.
    return conMovimiento(e, 2);
  };

  it("sin el hechizo, el monstruo tapona el paso", () => {
    const e = conOrcoEnMedio();
    expect(alcanzables(e, e.heroes[0]!, 2).has(claveCelda(c(3, 1)))).toBe(false);
  });

  it("con el hechizo se pasa a través del monstruo", () => {
    let e = conOrcoEnMedio();
    e = hacer(e, { tipo: "lanzarHechizo", hechizo: "veloDeNiebla", objetivo: "mago" });
    expect(tiene(e, "mago", "atravesarFiguras")).toBe(true);
    expect(alcanzables(e, e.heroes[0]!, 2).has(claveCelda(c(3, 1)))).toBe(true);
    e = hacer(e, { tipo: "mover", destino: c(3, 1) });
    expect(e.heroes[0]!.celda).toEqual(c(3, 1));
  });

  it("pero no se aterriza encima del monstruo", () => {
    let e = conOrcoEnMedio();
    e = hacer(e, { tipo: "lanzarHechizo", hechizo: "veloDeNiebla", objetivo: "mago" });
    expect(alcanzables(e, e.heroes[0]!, 2).has(claveCelda(c(2, 1)))).toBe(false);
  });

  it("vale para un movimiento y se gasta", () => {
    let e = conOrcoEnMedio();
    e = hacer(e, { tipo: "lanzarHechizo", hechizo: "veloDeNiebla", objetivo: "mago" });
    e = hacer(e, { tipo: "mover", destino: c(3, 1) });
    expect(tiene(e, "mago", "atravesarFiguras")).toBe(false);
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

  it("vale para un movimiento y se gasta ahí", () => {
    let e = conMovimiento(conMago(), 6);
    e = hacer(e, { tipo: "lanzarHechizo", hechizo: "atravesarLaRoca", objetivo: "mago" });
    e = hacer(e, { tipo: "mover", destino: c(0, 1) });
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

  it("sobre uno mismo antes de tirar, se tiran cuatro dados este turno", () => {
    // La carta: cuatro dados en vez de dos. Los dos de más los tira la
    // aplicación, porque los otros dos ya se han tirado en la mesa.
    let e = situar(dosHeroes(), "mago", c(1, 1));
    e = hacer(e, { tipo: "lanzarHechizo", hechizo: "vientoVeloz", objetivo: "mago" });
    e = hacer(e, { tipo: "tirarMovimiento", dados: [1, 1] });
    expect(e.turno.movimientoTotal).toBeGreaterThan(2); // 2 de la mesa + 2 dados más
    expect(e.turno.movimientoTotal).toBeLessThanOrEqual(14);
    expect(tiene(e, "mago", "movimientoExtra")).toBe(false);
  });

  it("sobre otro héroe, espera a su tirada", () => {
    let e = conMovimiento(situar(situar(dosHeroes(), "mago", c(1, 1)), "barbaro", c(2, 1)), 5);
    e = hacer(e, { tipo: "lanzarHechizo", hechizo: "vientoVeloz", objetivo: "barbaro" });
    expect(tiene(e, "barbaro", "movimientoExtra")).toBe(true);
    expect(e.turno.movimientoRestante).toBe(5); // al mago no le toca nada

    e = hacer(e, { tipo: "terminarTurno" });
    e = hacer(e, { tipo: "tirarMovimiento", dados: [1, 1] });
    expect(e.turno.movimientoTotal).toBeGreaterThan(2);
    expect(tiene(e, "barbaro", "movimientoExtra")).toBe(false); // se gasta una vez
  });

  it("no se acumula: la siguiente tirada ya es normal", () => {
    let e = situar(dosHeroes(), "barbaro", c(2, 1));
    e = hacer(e, { tipo: "terminarTurno" });
    e = { ...e, heroes: e.heroes.map((h) => h.id === "barbaro"
      ? { ...h, efectos: [{ clase: "movimientoExtra", dados: 2, duracion: "mision" as const }] }
      : h) };
    e = hacer(e, { tipo: "tirarMovimiento", dados: [2, 2] });
    expect(e.turno.movimientoTotal).toBeGreaterThan(4);
    e = hacer(e, { tipo: "terminarTurno" });
    e = hacer(e, { tipo: "terminarTurno" }); // zargon
    const r = aplicarAccion(e, { tipo: "tirarMovimiento", dados: [2, 2] });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.estado.turno.movimientoTotal).toBe(4);
  });
});

describe("valores cotejados con el reglamento de 2021", () => {
  // Esto no prueba comportamiento: fija los números que costó encontrar, para
  // que nadie los cambie de memoria sin volver a mirar la fuente.
  it("los hechizos dicen lo que dicen las cartas", () => {
    expect(HECHIZOS.genio.efecto).toEqual({ clase: "invocar", dados: 5 });
    expect(HECHIZOS.pielDePiedra.efecto).toEqual({ clase: "bonusDefensa", dados: 1 });
    expect(HECHIZOS.coraje.efecto).toEqual({ clase: "bonusAtaque", dados: 2 });
    expect(HECHIZOS.bolaDeFuego.efecto).toEqual({ clase: "danoConSalvacion", dano: 2, salvacion: 2 });
    expect(HECHIZOS.fuegoDeLaIra.efecto).toEqual({ clase: "danoConSalvacion", dano: 1, salvacion: 1 });
    expect(HECHIZOS.vientoVeloz.efecto).toEqual({ clase: "movimientoExtra", dados: 2 });
    // La tempestad va contra UN monstruo, no contra la sala entera.
    expect(HECHIZOS.tempestad.objetivo).toBe("unEnemigo");
    // Y estos dos se pueden echar sobre cualquier héroe, no solo sobre uno mismo.
    expect(HECHIZOS.atravesarLaRoca.objetivo).toBe("unHeroe");
    expect(HECHIZOS.veloDeNiebla.objetivo).toBe("unHeroe");
  });

  it("no queda ningún valor sin cotejar", () => {
    expect(HECHIZOS_POR_VERIFICAR).toHaveLength(0);
    expect(POR_VERIFICAR).toHaveLength(0);
  });

  it("el equipo también", () => {
    expect(EQUIPO.lanza.precio).toBe(150);
    expect(EQUIPO.herramientas.precio).toBe(250);
    expect(EQUIPO.armaduraDePlacas.penalizacionMovimiento).toBe(2);
    // Alcanzan en diagonal las armas largas, y el hacha no es una de ellas.
    expect(EQUIPO.baston.atacaEnDiagonal).toBe(true);
    expect(EQUIPO.lanza.atacaEnDiagonal).toBe(true);
    expect(EQUIPO.hachaDeBatalla.atacaEnDiagonal).toBeUndefined();
  });
});

describe("las reglas de equipo que el motor tiene que aplicar", () => {
  const conEquipo = (equipo: IdEquipo[]) => {
    const e = partida({
      heroes: [{ clase: "barbaro" }],
      monstruos: [{ id: "orco1", especie: "orco", celda: c(2, 2) }],
    });
    return {
      ...situar(e, "barbaro", c(1, 1)),
      heroes: e.heroes.map((h) => ({ ...h, celda: c(1, 1), equipo })),
      salasReveladas: ["a"],
    };
  };

  it("la armadura de placas resta 2 a la tirada de movimiento", () => {
    const sin = hacer(conEquipo(["espadaAncha"]), { tipo: "tirarMovimiento", dados: [3, 3] });
    expect(sin.turno.movimientoTotal).toBe(6);
    const con = hacer(conEquipo(["armaduraDePlacas"]), { tipo: "tirarMovimiento", dados: [3, 3] });
    expect(con.turno.movimientoTotal).toBe(4);
  });

  it("y no deja el movimiento en negativo", () => {
    const e = hacer(conEquipo(["armaduraDePlacas"]), { tipo: "tirarMovimiento", dados: [1, 1] });
    expect(e.turno.movimientoTotal).toBe(0);
  });

  it("el bastón alcanza en diagonal y la espada no", () => {
    // El orco está en (2,2) y el héroe en (1,1): diagonal pura.
    const conBaston = conEquipo(["baston"]);
    expect(objetivosDeAtaque(conBaston).map((o) => o.id)).toContain("orco1");

    const conEspada = conEquipo(["espadaAncha"]);
    expect(objetivosDeAtaque(conEspada).map((o) => o.id)).not.toContain("orco1");
  });
});
