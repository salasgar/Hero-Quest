import { describe, expect, it } from "vitest";
import { GRUPOS_DE_ICONOS, Icono, NOMBRE_ICONO, type IdIcono } from "../src/ui/iconos";
import { crearPartida, type HeroeElegido } from "../src/engine/partida";
import { MISION_PRUEBA } from "./ayuda";

const conHeroes = (heroes: HeroeElegido[]) =>
  crearPartida({ mision: MISION_PRUEBA, heroes, monstruos: [], semilla: 7 });

describe("el juego de iconos", () => {
  it("cada clave tiene dibujo: Icono({id}) no revienta y devuelve un <svg>", () => {
    for (const id of Object.keys(NOMBRE_ICONO) as IdIcono[]) {
      const el = Icono({ id });
      expect(el).toBeTruthy();
      expect(el.type).toBe("svg");
    }
  });

  it("la rejilla de EleccionDeHeroes.tsx cubre exactamente las mismas claves, sin repetir ninguna", () => {
    const todas = Object.keys(NOMBRE_ICONO).sort();
    const enLaRejilla = GRUPOS_DE_ICONOS.flatMap((g) => g.iconos).sort();
    expect(enLaRejilla).toEqual(todas);
    expect(new Set(enLaRejilla).size).toBe(enLaRejilla.length);
  });
});

describe("el icono en la partida (T37)", () => {
  it("crearPartida deja el icono elegido en el héroe", () => {
    const e = conHeroes([{ clase: "barbaro", icono: "espada" }]);
    expect(e.heroes[0]!.icono).toBe("espada");
  });

  it("sin icono elegido, el héroe queda sin él (se pinta la letra)", () => {
    const e = conHeroes([{ clase: "barbaro" }]);
    expect(e.heroes[0]!.icono).toBeUndefined();
  });
});
