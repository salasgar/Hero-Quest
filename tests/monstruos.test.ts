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
