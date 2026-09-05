/**
 * Lo que la pantalla le pregunta al motor para pintar los botones de hechizo.
 *
 * Los componentes de React no se prueban aquí: `vite.config.ts` monta el
 * entorno `node` y no hay DOM. Lo que sí es puro —y es donde estaría el fallo—
 * es `hechizosLanzables`, que hasta ahora no lo llamaba nadie.
 */

import { describe, expect, it } from "vitest";
import { hechizosLanzables } from "../src/engine/selectors";
import { repetir } from "../src/engine/reducer";
import type { EstadoPartida } from "../src/engine/types";
import { c, hacer, partida, situar } from "./ayuda";

/** El grupo con el que se juega si nadie elige, en el mismo orden. */
const GRUPO_CLASICO = [
  { clase: "barbaro" as const },
  { clase: "enano" as const },
  { clase: "elfo" as const, elementos: ["agua" as const] },
  { clase: "mago" as const, elementos: ["fuego" as const, "tierra" as const, "aire" as const] },
];

/** Sin esto, `puedeVer` deja la sala a oscuras y todo sale sin objetivos. */
const conLuz = (e: EstadoPartida): EstadoPartida => ({ ...e, salasReveladas: ["a"] });

/** Pone a este héroe de turno saltándose los turnos de los anteriores. */
const turnoDe = (e: EstadoPartida, id: string): EstadoPartida => ({
  ...e,
  turno: { ...e.turno, indice: e.turno.orden.indexOf(id) },
});

describe("qué hechizos puede lanzar el héroe de turno", () => {
  const grupo = conLuz(partida({ heroes: GRUPO_CLASICO }));

  it("el mago tiene nueve, el elfo tres, y el bárbaro y el enano ninguno", () => {
    // El fallo que vio Juan Luis no era que el mago no tuviera hechizos: los
    // tiene desde el primer turno. Era que no había forma de lanzarlos.
    expect(hechizosLanzables(turnoDe(grupo, "mago"))).toHaveLength(9);
    expect(hechizosLanzables(turnoDe(grupo, "elfo"))).toHaveLength(3);
    expect(hechizosLanzables(turnoDe(grupo, "barbaro"))).toHaveLength(0);
    expect(hechizosLanzables(turnoDe(grupo, "enano"))).toHaveLength(0);
  });

  it("un hechizo cuyo único objetivo está tapado por una figura sale sin objetivos", () => {
    // En el pasillo, que es donde la regla de T1 se nota: dentro de una sala
    // `puedeVer` da por visto todo sin trazar rectas, así que un compañero
    // delante solo tapa en fila. La columna 0 es pasillo de arriba abajo.
    let e = partida({
      heroes: [{ clase: "elfo", elementos: ["fuego"] }, { clase: "barbaro" }],
      monstruos: [{ id: "orco1", especie: "orco", celda: c(0, 3) }],
    });
    e = situar(situar(e, "elfo", c(0, 1)), "barbaro", c(0, 2));

    const bola = hechizosLanzables(e).find((h) => h.hechizo === "bolaDeFuego")!;
    expect(bola.objetivos).toEqual([]);

    // Y con el bárbaro apartado de la fila, el mismo hechizo sí alcanza: lo
    // que falla es la visión, no el hechizo.
    const despejado = situar(e, "barbaro", c(0, 6));
    const otra = hechizosLanzables(despejado).find((h) => h.hechizo === "bolaDeFuego")!;
    expect(otra.objetivos.map((o) => o.id)).toEqual(["orco1"]);
  });

  it("después de actuar no queda ninguno: la acción del turno ya está gastada", () => {
    const e = conLuz(partida({ heroes: [{ clase: "mago", elementos: ["fuego"] }] }));
    expect(hechizosLanzables(e)).toHaveLength(3);
    expect(hechizosLanzables(hacer(e, { tipo: "buscarTrampas" }))).toHaveLength(0);
  });
});

describe("lanzar y deshacer", () => {
  it("deshacer devuelve el hechizo a la mano: la pantalla no guarda nada por su cuenta", () => {
    // `deshacer` de la interfaz es `repetir(inicial, acciones sin la última)`.
    // Si esto falla, es que el motor no es puro, no que la pantalla esté mal.
    let inicial = conLuz(
      partida({
        heroes: [{ clase: "mago", elementos: ["fuego"] }],
        monstruos: [{ id: "orco1", especie: "orco", celda: c(3, 1) }],
      }),
    );
    inicial = situar(inicial, "mago", c(1, 1));

    const lanzado = hacer(inicial, {
      tipo: "lanzarHechizo",
      hechizo: "bolaDeFuego",
      objetivo: "orco1",
    });
    expect(lanzado.heroes[0]!.hechizos).not.toContain("bolaDeFuego");
    expect(lanzado.heroes[0]!.hechizosGastados).toContain("bolaDeFuego");

    const deshecho = repetir(inicial, []);
    expect(deshecho.heroes[0]!.hechizos).toContain("bolaDeFuego");
    expect(deshecho.heroes[0]!.hechizosGastados).toEqual([]);
    expect(hechizosLanzables(deshecho).find((h) => h.hechizo === "bolaDeFuego")).toBeTruthy();
  });
});
