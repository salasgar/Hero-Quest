/**
 * T22 · Saber qué hace cada hechizo antes de lanzarlo.
 *
 * Los componentes de React no se prueban aquí (`vite.config.ts` dice
 * `environment: "node"`), así que lo que se prueba es el dato: que los doce
 * hechizos tienen `descripcion` (es lo que sostiene el botón de `TurnPanel` y
 * la lista de `Instrucciones`), y la función que agrupa por elemento la mano
 * de un héroe para esa lista.
 */

import { describe, expect, it } from "vitest";
import { HECHIZOS, type IdHechizo } from "../src/data/spells";
import { elementosDe } from "../src/ui/Instrucciones";
import { partida } from "./ayuda";

describe("los doce hechizos tienen descripción", () => {
  const ids = Object.keys(HECHIZOS) as IdHechizo[];

  it("son doce", () => {
    expect(ids).toHaveLength(12);
  });

  it.each(ids)("%s no tiene la descripción vacía", (id) => {
    expect(HECHIZOS[id].descripcion.trim().length).toBeGreaterThan(0);
  });
});

describe("elementosDe agrupa la mano de un héroe por elemento", () => {
  it("con el mago de tres elementos, salen los tres, en el orden de siempre", () => {
    const e = partida({ heroes: [{ clase: "mago", elementos: ["fuego", "aire", "agua"] }] });
    const mago = e.heroes[0]!;
    // El orden de `elementosDe` es el de `ELEMENTOS` (aire, agua, tierra,
    // fuego), no el de elección del héroe: es el mismo orden que las cartas.
    expect(elementosDe(mago.hechizos)).toEqual(["aire", "agua", "fuego"]);
  });

  it("con el elfo de un elemento, sale uno solo", () => {
    const e = partida({ heroes: [{ clase: "elfo", elementos: ["tierra"] }] });
    const elfo = e.heroes[0]!;
    expect(elementosDe(elfo.hechizos)).toEqual(["tierra"]);
  });

  it("con el bárbaro, que no tiene ninguno, da lista vacía sin reventar", () => {
    const e = partida({ heroes: [{ clase: "barbaro" }] });
    const barbaro = e.heroes[0]!;
    expect(barbaro.hechizos).toEqual([]);
    expect(elementosDe(barbaro.hechizos)).toEqual([]);
  });

  it("con hechizos ya gastados, también los agrupa: la lista no distingue por sí sola", () => {
    // `elementosDe` solo agrupa una lista de ids; a quién enseñarla con o sin
    // tachar es cosa de `HechizosDelGrupo`, que le pasa `hechizos` y
    // `hechizosGastados` juntos. Aquí basta con que no le importe de dónde
    // vengan los ids.
    const e = partida({ heroes: [{ clase: "elfo", elementos: ["agua"] }] });
    const elfo = e.heroes[0]!;
    const gastado = elfo.hechizos[0]!;
    expect(elementosDe([gastado])).toEqual([HECHIZOS[gastado].elemento]);
  });
});
