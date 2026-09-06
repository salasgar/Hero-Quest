/**
 * T9 · Personalidades por especie y tres dificultades.
 *
 * Cada escena de este fichero está montada para que el nivel o la personalidad
 * **cambien la jugada**, no para que un número interno cambie de valor: si
 * `torpe` y `astuto` eligen lo mismo, o el goblin juega igual que el esqueleto,
 * el test cae. El esqueleto hace de control a propósito: es la única especie
 * sin sesgos, así que jugar contra él es jugar con los pesos del nivel a secas.
 *
 * Ojo con la geometría, heredado de T8: **la sala `a` mide 4 × 3** (columnas
 * 1-4, filas 1-3); `tareas/_COMUN.md` dice 4 × 4 y está equivocado.
 */

import { describe, expect, it } from "vitest";
import {
  MISION_CALABOZO,
  MONSTRUOS_CALABOZO,
  MUEBLES_CALABOZO,
  PUERTAS_CALABOZO,
  TRAMPAS_CALABOZO,
} from "../src/data/quests/calabozo";
import { ESPECIES, type EspecieMonstruo } from "../src/data/monsters";
import {
  accionDeZargon,
  jugarTurnoDeZargon,
  pesosPara,
  PESOS_POR_NIVEL,
} from "../src/ai/difficulty";
import { conPersonalidad, PERSONALIDADES } from "../src/ai/personalities";
import { PESOS } from "../src/ai/targeting";
import { aplicarAccion } from "../src/engine/reducer";
import { esTurnoDeZargon } from "../src/engine/selectors";
import type { EstadoPartida, Mision } from "../src/engine/types";
import { c, enTablero, hacer, MISION_PRUEBA, partida, situar } from "./ayuda";

const MISION: Mision = { ...MISION_PRUEBA, entrada: [c(1, 1), c(1, 2)] };

const turnoDeZargonEn = (e: EstadoPartida): EstadoPartida =>
  enTablero({
    ...e,
    turno: { ...e.turno, indice: e.turno.orden.indexOf("zargon") },
    salasReveladas: ["a"],
  });

/** Deja a un héroe con el cuerpo justo que pide la escena. */
const conCuerpo = (e: EstadoPartida, id: string, cuerpo: number): EstadoPartida => ({
  ...e,
  heroes: e.heroes.map((h) => (h.id === id ? { ...h, cuerpo } : h)),
});

/** Le pone armadura a un héroe, para que defienda con más que los demás. */
const acorazado = (e: EstadoPartida, id: string): EstadoPartida => ({
  ...e,
  heroes: e.heroes.map((h) =>
    h.id === id ? { ...h, equipo: [...h.equipo, "escudo", "yelmo"] as typeof h.equipo } : h,
  ),
});

/**
 * Un monstruo en (2,2) con el bárbaro pegado en (2,1) y el mago donde diga cada
 * escena. El mago va con sus tres elementos, como se juega: sin ellos no tiene
 * hechizos y no atrae a nadie, que es el falso verde que avisó T8.
 */
const escena = (especie: EspecieMonstruo, magoEn = c(3, 2)): EstadoPartida => {
  let e = turnoDeZargonEn(
    partida({
      mision: MISION,
      heroes: [{ clase: "barbaro" }, { clase: "mago", elementos: ["fuego", "aire", "agua"] }],
      monstruos: [{ id: especie, especie, celda: c(2, 2) }],
    }),
  );
  e = situar(e, "barbaro", c(2, 1));
  e = situar(e, "mago", magoEn);
  return hacer(e, { tipo: "activarMonstruo", monstruo: especie });
};

describe("torpe contra astuto: la misma escena, dos jugadas", () => {
  // El bárbaro está pegado; el mago, herido de muerte y con sus nueve hechizos,
  // a dos pasos. Rematarlo es la jugada buena, y solo el nivel decide si se ve.
  const con = (especie: EspecieMonstruo) => conCuerpo(escena(especie, c(4, 3)), "mago", 1);

  it("torpe pega a quien tiene delante, sin recolocarse", () => {
    expect(accionDeZargon(con("orco"), "torpe")).toEqual({ tipo: "atacar", objetivo: "barbaro" });
  });

  it("astuto se mueve y remata al mago", () => {
    const e = con("orco");
    expect(accionDeZargon(e, "astuto")?.tipo).toBe("mover");
    const { acciones } = jugarTurnoDeZargon(e, "astuto");
    expect(acciones.some((a) => a.tipo === "atacar" && a.objetivo === "mago")).toBe(true);
    expect(acciones.some((a) => a.tipo === "atacar" && a.objetivo === "barbaro")).toBe(false);
  });

  it("y torpe no le toca al mago ni por accidente", () => {
    const { acciones } = jugarTurnoDeZargon(con("orco"), "torpe");
    expect(acciones.some((a) => a.tipo === "atacar" && a.objetivo === "mago")).toBe(false);
  });

  it("torpe pega al acorazado que tiene delante aunque el blando esté a dos pasos", () => {
    // Con escudo y yelmo el bárbaro defiende con 4 y el daño esperado contra él
    // es peor que contra el mago. Un torpe hecho solo de pesos se iría a por el
    // blando; el de verdad ni considera moverse cuando ya pega a alguien. Esta
    // escena es la que defiende esa mitad estructural.
    const e = acorazado(escena("orco", c(4, 3)), "barbaro");
    expect(accionDeZargon(e, "torpe")).toEqual({ tipo: "atacar", objetivo: "barbaro" });
  });
});

describe("normal contra astuto: cuánto vale el que guarda hechizos", () => {
  // El esqueleto —sin personalidad— con dos héroes pegados: el bárbaro a media
  // vida y el mago fresco con las nueve cartas. Para `normal` pesa más lo
  // empezado; para `astuto`, lo que el mago aún puede hacerle a Zargon.
  const e = () => conCuerpo(escena("esqueleto"), "barbaro", 3);

  it("normal remata lo empezado: el bárbaro herido", () => {
    expect(accionDeZargon(e(), "normal")).toEqual({ tipo: "atacar", objetivo: "barbaro" });
  });

  it("astuto va a por el mago cargado de hechizos", () => {
    expect(accionDeZargon(e(), "astuto")).toEqual({ tipo: "atacar", objetivo: "mago" });
  });
});

describe("la personalidad tuerce la jugada de la especie", () => {
  it("el goblin cobarde se ceba con el herido; el esqueleto, no", () => {
    // Bárbaro con dos heridas y mago fresco, los dos al alcance. Con los pesos
    // a secas, los nueve hechizos pesan más que dos heridas; el sesgo cobarde
    // (heridoPrimero ×2.5) da la vuelta a esa cuenta y solo a esa.
    const con = (especie: EspecieMonstruo) => conCuerpo(escena(especie), "barbaro", 6);
    expect(accionDeZargon(con("esqueleto"), "normal")).toEqual({ tipo: "atacar", objetivo: "mago" });
    expect(accionDeZargon(con("goblin"), "normal")).toEqual({ tipo: "atacar", objetivo: "barbaro" });
  });

  it("el guerrero del caos caza al mago; el esqueleto sigue con el herido", () => {
    // Aquí las heridas son cuatro: suficientes para que el control prefiera al
    // bárbaro, y pocas para el cazador, que triplica lo que valen los hechizos.
    const con = (especie: EspecieMonstruo) => conCuerpo(escena(especie), "barbaro", 4);
    expect(accionDeZargon(con("esqueleto"), "normal")).toEqual({
      tipo: "atacar",
      objetivo: "barbaro",
    });
    expect(accionDeZargon(con("guerreroDelCaos"), "normal")).toEqual({
      tipo: "atacar",
      objetivo: "mago",
    });
  });
});

describe("los pesos por nivel y especie", () => {
  it("torpe apaga el remate, los heridos y la caza de magos en todas las especies", () => {
    for (const especie of ESPECIES) {
      const p = pesosPara(especie, "torpe");
      expect(p.remate).toBe(0);
      expect(p.heridoPrimero).toBe(0);
      expect(p.lanzaHechizos).toBe(0);
    }
  });

  it("normal sin personalidad es exactamente la hipótesis de T8", () => {
    // El esqueleto es la especie sin sesgos: si esto cae, o alguien le puso
    // personalidad al control o `normal` ya no es la base de T8.
    expect(pesosPara("esqueleto", "normal")).toEqual(PESOS);
  });

  it("el sesgo multiplica el peso base, y no toca el objeto original", () => {
    const antes = JSON.stringify(PESOS);
    const p = conPersonalidad(PESOS, "goblin");
    expect(p.heridoPrimero).toBe(PESOS.heridoPrimero * PERSONALIDADES.goblin.sesgos.heridoPrimero!);
    expect(JSON.stringify(PESOS)).toBe(antes);
    expect(JSON.stringify(PESOS_POR_NIVEL.normal)).toBe(antes);
  });

  it("cada especie tiene su personalidad, con nombre", () => {
    for (const especie of ESPECIES) {
      expect(PERSONALIDADES[especie].nombre.length).toBeGreaterThan(0);
    }
  });
});

describe("en los tres niveles, todo lo que se propone es legal", () => {
  // La invariante heredada de T8: una jugada ilegal no es un test rojo, es un
  // monstruo parado en la mesa. Se juega el turno sobre la misión de verdad y
  // se reaplica cada acción con el motor.
  const enTurnoDeZargon = (): EstadoPartida => {
    const base = partida({
      mision: MISION_CALABOZO,
      heroes: [
        { clase: "barbaro" },
        { clase: "enano" },
        { clase: "elfo", elementos: ["agua"] },
        { clase: "mago", elementos: ["fuego", "tierra", "aire"] },
      ],
      monstruos: MONSTRUOS_CALABOZO,
      puertas: PUERTAS_CALABOZO,
      muebles: MUEBLES_CALABOZO,
      trampas: TRAMPAS_CALABOZO,
      semilla: 9,
    });
    return enTablero({
      ...base,
      turno: { ...base.turno, indice: base.turno.orden.indexOf("zargon") },
      salasReveladas: [...base.salasReveladas, "s"],
    });
  };

  it.each(["torpe", "normal", "astuto"] as const)("nivel %s: el motor acepta cada acción", (nivel) => {
    const inicial = enTurnoDeZargon();
    const { acciones, estado } = jugarTurnoDeZargon(inicial, nivel);
    let e = inicial;
    for (const a of acciones) {
      const r = aplicarAccion(e, a);
      expect(r.ok, `rechazada en ${nivel}: ${JSON.stringify(a)}`).toBe(true);
      if (!r.ok) return;
      e = r.estado;
    }
    // El turno se cierra de verdad: no se cortó por el tope ni por un rechazo.
    expect(esTurnoDeZargon(estado)).toBe(false);
  });

  it("la jugada es la misma cada vez: sin azar fuera del estado", () => {
    const inicial = enTurnoDeZargon();
    const una = jugarTurnoDeZargon(inicial, "astuto");
    const otra = jugarTurnoDeZargon(inicial, "astuto");
    expect(JSON.stringify(una.acciones)).toBe(JSON.stringify(otra.acciones));
  });
});
