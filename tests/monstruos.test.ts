/**
 * El bestiario. De momento, lo único que necesita tests propios es el troll de
 * las cavernas, que es contenido de la casa: el reglamento no lo tiene, así que
 * no hay nada que cotejar y sí una intención que fijar —el molde de T7 con las
 * armas grandes—. Estos tests defienden la forma que firmó Juan Luis el
 * 2026-09-06, no las dos cifras ajustables: la defensa exacta y el cuerpo
 * exacto se pueden tocar en su línea de `monsters.ts` sin que nada de aquí se
 * queje, pero hacerlo rápido, matón o blando ya no es ajustar, es otra especie.
 */

import { describe, expect, it } from "vitest";
import { ESPECIES, MONSTRUOS } from "../src/data/monsters";
import { PERSONALIDADES } from "../src/ai/personalities";
import { NOMBRES } from "../src/data/nombres";

describe("el troll de las cavernas, tal como se firmó", () => {
  const troll = MONSTRUOS.trollDeLasCavernas;
  const losDemas = ESPECIES.filter((e) => e !== "trollDeLasCavernas").map((e) => MONSTRUOS[e]);

  it("se mueve dos casillas por turno, y es el más lento con diferencia", () => {
    expect(troll.movimiento).toBe(2);
    for (const m of losDemas) expect(m.movimiento).toBeGreaterThan(troll.movimiento);
  });

  it("ataca con un solo dado: pega menos que cualquier otro", () => {
    expect(troll.ataque).toBe(1);
    for (const m of losDemas) expect(m.ataque).toBeGreaterThan(troll.ataque);
  });

  it("y a cambio es el que más defiende y el que más aguanta", () => {
    for (const m of losDemas) {
      expect(troll.defensa).toBeGreaterThan(m.defensa);
      expect(troll.cuerpo).toBeGreaterThan(m.cuerpo);
    }
  });

  it("no es un no-muerto: los hechizos de mente le afectan", () => {
    // Torpe no es lo mismo que sin mente: la mente 0 es el convenio de los
    // no-muertos y arrastra la inmunidad a lo que apunta a la mente.
    expect(troll.noMuerto).toBe(false);
    expect(troll.mente).toBeGreaterThan(0);
  });
});

describe("las ocho especies de T49 (encargo de Juan Luis, 2026-09-06)", () => {
  const NUEVAS = [
    "brujo", "bruja", "arañaGigante", "monstruoDeArena",
    "rataGigante", "espectro", "ogro", "serpienteDeLasTumbas",
  ] as const;
  const gargola = MONSTRUOS.gargola;

  it("cada especie nueva tiene su plantilla, su personalidad y sus doce nombres", () => {
    // Sale en rojo aquí y no en un error de compilación críptico si a alguna
    // le falta una entrada exhaustiva.
    for (const especie of NUEVAS) {
      expect(MONSTRUOS[especie]).toBeDefined();
      expect(PERSONALIDADES[especie]).toBeDefined();
      expect(NOMBRES[especie]).toHaveLength(12);
    }
  });

  it("ninguna domina a la gárgola en ataque, defensa y cuerpo a la vez", () => {
    for (const especie of NUEVAS) {
      const m = MONSTRUOS[especie];
      const dominaEnTodo =
        m.ataque >= gargola.ataque && m.defensa >= gargola.defensa && m.cuerpo >= gargola.cuerpo;
      expect(dominaEnTodo).toBe(false);
    }
  });

  it("la araña gigante es la más rápida de las nuevas, y frágil", () => {
    const arana = MONSTRUOS.arañaGigante;
    for (const especie of NUEVAS) {
      if (especie === "arañaGigante") continue;
      expect(arana.movimiento).toBeGreaterThanOrEqual(MONSTRUOS[especie].movimiento);
    }
    expect(arana.cuerpo).toBeLessThan(gargola.cuerpo);
  });

  it("el monstruo de arena aguanta más golpes que la gárgola, aunque pega y defiende menos", () => {
    const arena = MONSTRUOS.monstruoDeArena;
    expect(arena.cuerpo).toBeGreaterThan(gargola.cuerpo);
    expect(arena.ataque).toBeLessThan(gargola.ataque);
    expect(arena.defensa).toBeLessThan(gargola.defensa);
  });

  it("el ogro va entre el guerrero del Caos y el troll en cuerpo y movimiento", () => {
    const guerrero = MONSTRUOS.guerreroDelCaos;
    const troll = MONSTRUOS.trollDeLasCavernas;
    const ogro = MONSTRUOS.ogro;
    expect(ogro.cuerpo).toBeGreaterThan(guerrero.cuerpo);
    expect(ogro.cuerpo).toBeLessThan(troll.cuerpo);
    expect(ogro.movimiento).toBeLessThan(guerrero.movimiento);
    expect(ogro.movimiento).toBeGreaterThan(troll.movimiento);
  });

  it("el brujo y la bruja son, tras el hechicero del Caos, los de más mente", () => {
    const brujo = MONSTRUOS.brujo;
    const bruja = MONSTRUOS.bruja;
    const hechicero = MONSTRUOS.hechiceroDelCaos;
    expect(brujo.mente).toBeLessThan(hechicero.mente);
    expect(bruja.mente).toBeLessThan(hechicero.mente);
    for (const especie of ESPECIES) {
      if (especie === "brujo" || especie === "bruja" || especie === "hechiceroDelCaos") continue;
      expect(brujo.mente).toBeGreaterThan(MONSTRUOS[especie].mente);
    }
  });

  it("el espectro y la serpiente de las tumbas son no-muertos: mente 0", () => {
    expect(MONSTRUOS.espectro.noMuerto).toBe(true);
    expect(MONSTRUOS.espectro.mente).toBe(0);
    expect(MONSTRUOS.serpienteDeLasTumbas.noMuerto).toBe(true);
    expect(MONSTRUOS.serpienteDeLasTumbas.mente).toBe(0);
  });
});
