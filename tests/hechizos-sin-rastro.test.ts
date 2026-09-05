/**
 * T21 · Los hechizos que se lanzaban sin dejar rastro.
 *
 * Juan Luis, después de jugar: «El mago ha lanzado un hechizo contra un orco. El
 * orco no se ha muerto y el diario no ha dicho qué es lo que ha pasado.» Medido:
 * de las once ramas de `lanzarHechizo` solo cuatro emitían un segundo evento, y
 * siete hechizos de doce se lanzaban mudos. Peor que el silencio era el fallo
 * silencioso: un Sueño que no prende dejaba **la misma línea** que uno que sí.
 *
 * El test que sostiene la tarea es el primero: los doce dejan algo escrito. Si
 * mañana entra un hechizo nuevo y nace mudo, salta ahí.
 */

import { describe, expect, it } from "vitest";
import { HECHIZOS, type IdHechizo } from "../src/data/spells";
import { narrar, narrarTodos } from "../src/narrator/local";
import { aplicarAccion, repetir } from "../src/engine/reducer";
import type { Accion, EstadoPartida, Evento, IdFigura } from "../src/engine/types";
import { c, hacer, partida, situar } from "./ayuda";

/**
 * El mago en la sala `a` (columnas 1-4, filas 1-4) con los doce hechizos en la
 * mano. La sala va revelada: a oscuras no hay línea de visión ni para la magia.
 */
const conMago = (op: Parameters<typeof partida>[0] = {}): EstadoPartida => {
  const e = partida({ heroes: [{ clase: "mago", elementos: ["aire", "agua", "tierra"] }], ...op });
  const base = { ...situar(e, "mago", c(1, 1)), salasReveladas: ["a"] };
  return {
    ...base,
    heroes: base.heroes.map((h) => ({ ...h, hechizos: Object.keys(HECHIZOS) as IdHechizo[] })),
  };
};

const lanzar = (e: EstadoPartida, hechizo: IdHechizo, objetivo?: IdFigura) => {
  const r = aplicarAccion(e, { tipo: "lanzarHechizo", hechizo, objetivo });
  if (!r.ok) throw new Error(`rechazado ${hechizo}: ${r.motivo}`);
  return { estado: r.estado, eventos: r.eventos, frases: narrarTodos(r.estado, r.eventos) };
};

const tipos = (evs: readonly Evento[]) => evs.map((x) => x.tipo);
const monstruo = (e: EstadoPartida, id: string) => e.monstruos.find((m) => m.id === id)!;

describe("los doce hechizos dejan algo escrito", () => {
  const escena = () =>
    conMago({ monstruos: [{ id: "orco1", especie: "orco", celda: c(4, 1) }] });

  for (const h of Object.values(HECHIZOS)) {
    it(`${h.nombre} no se lanza mudo`, () => {
      const { frases } = lanzar(escena(), h.id, h.objetivo === "unEnemigo" ? "orco1" : undefined);

      // La primera línea es siempre «Mago lanza X»: eso ya estaba. Lo que
      // faltaba es la segunda, la que dice qué ha pasado.
      expect(frases[0]).toMatch(new RegExp(`lanza ${h.nombre}`, "i"));
      expect(frases.length).toBeGreaterThan(1);
      expect(frases[1]!.length).toBeGreaterThan(0);
    });
  }
});

describe("el Sueño ya no falla en silencio", () => {
  it("sobre un no muerto: lo dice, y el esqueleto sigue despierto", () => {
    const e = conMago({ monstruos: [{ id: "hueso", especie: "esqueleto", celda: c(4, 1) }] });
    const { estado, eventos, frases } = lanzar(e, "sueno", "hueso");

    expect(tipos(eventos)).toEqual(["hechizoLanzado", "hechizoSinEfecto"]);
    expect(monstruo(estado, "hueso").dormido).toBeFalsy();
    expect(frases[1]).toMatch(/no muertos no duermen/i);
  });

  it("contra una mente más fuerte: lo dice, y el hechicero sigue despierto", () => {
    // El elfo tiene mente 4 y el hechicero del Caos, 6. Con el mago (mente 6)
    // no se ve: 6 no supera a 6 y el monstruo se duerme.
    const base = partida({
      heroes: [{ clase: "elfo", elementos: ["agua"] }],
      monstruos: [{ id: "brujo", especie: "hechiceroDelCaos", celda: c(4, 1) }],
    });
    const e = { ...situar(base, "elfo", c(1, 1)), salasReveladas: ["a"] };
    const { estado, eventos, frases } = lanzar(e, "sueno", "brujo");

    expect(tipos(eventos)).toEqual(["hechizoLanzado", "hechizoSinEfecto"]);
    expect(monstruo(estado, "brujo").dormido).toBeFalsy();
    expect(frases[1]).toMatch(/resiste/i);
  });

  it("y cuando prende, se dice que prende", () => {
    const e = conMago({ monstruos: [{ id: "orco1", especie: "orco", celda: c(4, 1) }] });
    const { estado, eventos, frases } = lanzar(e, "sueno", "orco1");

    expect(tipos(eventos)).toEqual(["hechizoLanzado", "efectoDeHechizo"]);
    expect(monstruo(estado, "orco1").dormido).toBe(true);
    expect(frases[1]).toMatch(/dormido/i);
    // Las tres frases son distintas: ese era el fallo que contó Juan Luis.
    expect(frases[1]).not.toMatch(/no muertos|resiste/i);
  });
});

describe("curar a quien no lo necesita", () => {
  it("gasta la carta y ahora lo dice", () => {
    const e = conMago();
    const { estado, eventos, frases } = lanzar(e, "curacion");

    expect(tipos(eventos)).toEqual(["hechizoLanzado", "hechizoSinEfecto"]);
    expect(frases[1]).toMatch(/ni un rasguño/i);

    // La carta se gasta igual aunque no haga efecto: eso es la regla y no cambia.
    const mago = estado.heroes[0]!;
    expect(mago.hechizos).not.toContain("curacion");
    expect(mago.hechizosGastados).toContain("curacion");
  });

  it("y al herido lo cura como siempre", () => {
    const e = conMago();
    const herido = { ...e, heroes: e.heroes.map((h) => ({ ...h, cuerpo: h.cuerpo - 3 })) };
    const { eventos } = lanzar(herido, "curacion");
    expect(tipos(eventos)).toEqual(["hechizoLanzado", "curacion"]);
  });
});

describe("la Tempestad dice a quién alcanza", () => {
  /**
   * Está implementada sobre **toda la sala** y su carta dice «el monstruo
   * elegido». La divergencia no se resuelve aquí y no es un descuido: el
   * reglamento de 2021 no describe los hechizos uno a uno —p. 14: «A spell and
   * its effects are explained in detail on its corresponding spell card»— y las
   * cartas no las tenemos. Queda esperando la palabra de Juan Luis, apuntada en
   * el tablón. Este test **fija lo que hace hoy**, para que el día que él
   * conteste se vea exactamente qué cambia.
   */
  const escena = () =>
    conMago({
      monstruos: [
        { id: "orco1", especie: "orco", celda: c(4, 1) },
        { id: "orco2", especie: "orco", celda: c(4, 2) },
        { id: "lejano", especie: "orco", celda: c(6, 1) }, // sala `b`
      ],
    });

  it("hoy alcanza a los de la sala del objetivo, y solo a ésos", () => {
    const { estado, eventos, frases } = lanzar(escena(), "tempestad", "orco1");

    const efecto = eventos.find((x) => x.tipo === "efectoDeHechizo");
    if (efecto?.tipo !== "efectoDeHechizo") throw new Error("la Tempestad no contó nada");
    expect(efecto.objetivos.sort()).toEqual(["orco1", "orco2"]);

    expect(monstruo(estado, "orco1").pierdeTurno).toBe(true);
    expect(monstruo(estado, "orco2").pierdeTurno).toBe(true);
    expect(monstruo(estado, "lejano").pierdeTurno).toBeFalsy();
    expect(frases[1]).toMatch(/torbellino/i);
    expect(frases[1]).toMatch(/Orco y Orco/);
  });

  it("en el pasillo alcanza al elegido y a nadie más", () => {
    // `salaEn` devuelve null fuera de las salas, y comparar null con null metía
    // en el hechizo a todos los monstruos de todos los pasillos del tablero. Un
    // pasillo no es una sala.
    const base = conMago({
      monstruos: [
        { id: "enPasillo", especie: "orco", celda: c(12, 16) },
        { id: "otroPasillo", especie: "orco", celda: c(0, 15) },
      ],
    });
    // El mago, en el pasillo de la entrada, con el orco tres casillas más
    // arriba en línea recta: los dos fuera de toda sala.
    const e = situar(base, "mago", c(12, 18));
    const { estado, eventos } = lanzar(e, "tempestad", "enPasillo");

    const efecto = eventos.find((x) => x.tipo === "efectoDeHechizo");
    if (efecto?.tipo !== "efectoDeHechizo") throw new Error("la Tempestad no contó nada");
    expect(efecto.objetivos).toEqual(["enPasillo"]);
    expect(monstruo(estado, "otroPasillo").pierdeTurno).toBeFalsy();
  });

  it("no alcanza a un monstruo que ya está derrotado", () => {
    const base = escena();
    const conCaido = {
      ...base,
      monstruos: base.monstruos.map((m) => (m.id === "orco2" ? { ...m, cuerpo: 0 } : m)),
    };
    const { eventos } = lanzar(conCaido, "tempestad", "orco1");

    const efecto = eventos.find((x) => x.tipo === "efectoDeHechizo");
    if (efecto?.tipo !== "efectoDeHechizo") throw new Error("la Tempestad no contó nada");
    expect(efecto.objetivos).toEqual(["orco1"]);
  });
});

describe("ninguna frase nace vacía", () => {
  it("las siete clases de efecto y los cuatro motivos se cuentan", () => {
    const e = conMago({ monstruos: [{ id: "orco1", especie: "orco", celda: c(4, 1) }] });
    const clases = [
      "dormir", "perderTurno", "bonusAtaque", "bonusDefensa",
      "atravesarMuros", "atravesarFiguras", "movimientoExtra",
    ] as const;
    const motivos = ["noMuerto", "menteSuperior", "yaEstabaSano", "sinObjetivo"] as const;

    for (const clase of clases) {
      const uno = narrar(e, { tipo: "efectoDeHechizo", hechizo: "tempestad", clase, objetivos: ["orco1"] });
      const dos = narrar(e, {
        tipo: "efectoDeHechizo", hechizo: "tempestad", clase, objetivos: ["orco1", "mago"],
      });
      expect(uno, clase).toBeTruthy();
      expect(dos, `${clase} en plural`).toBeTruthy();
      expect(uno).not.toBe(dos);
    }
    for (const motivo of motivos) {
      expect(narrar(e, { tipo: "hechizoSinEfecto", hechizo: "sueno", objetivo: "orco1", motivo }), motivo).toBeTruthy();
    }
  });
});

describe("el deshacer sigue funcionando", () => {
  it("repetir la partida da el mismo registro", () => {
    const inicial = conMago({ monstruos: [{ id: "orco1", especie: "orco", celda: c(4, 1) }] });
    const acciones: Accion[] = [
      { tipo: "lanzarHechizo", hechizo: "sueno", objetivo: "orco1" },
      { tipo: "terminarTurno" },
    ];
    const jugada = acciones.reduce((acc, a) => hacer(acc, a), inicial);

    expect(repetir(inicial, acciones).registro).toEqual(jugada.registro);
    expect(jugada.registro.map((x) => x.tipo)).toContain("efectoDeHechizo");
  });
});
