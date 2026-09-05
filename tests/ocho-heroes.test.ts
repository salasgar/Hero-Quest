/**
 * Grupos de hasta ocho héroes, con clases repetidas.
 *
 * Lo que se prueba aquí es `crearPartida`, no la pantalla: `vite.config.ts`
 * monta el entorno `node` y no hay DOM. Y es donde estaba el fallo — la
 * pantalla solo pedía cuatro, así que el apilamiento no se veía.
 */

import { describe, expect, it } from "vitest";
import { crearPartida } from "../src/engine/partida";
import { hacer, c, partida, situar, MISION_PRUEBA } from "./ayuda";
import { claveCelda, type EstadoPartida } from "../src/engine/types";

const OCHO = [
  { clase: "barbaro" as const },
  { clase: "enano" as const },
  { clase: "elfo" as const, elementos: ["agua" as const] },
  { clase: "mago" as const, elementos: ["fuego" as const, "tierra" as const, "aire" as const] },
  { clase: "hada" as const, elementos: ["aire" as const, "agua" as const] },
  { clase: "mago" as const, elementos: ["fuego" as const, "tierra" as const, "aire" as const] },
  { clase: "elfo" as const, elementos: ["fuego" as const] },
  { clase: "barbaro" as const },
];

describe("ocho héroes caben, y cada uno en su casilla", () => {
  it("los ocho salen en ocho casillas distintas", () => {
    // El test de la captura del fallo. Antes `crearPartida` repartía la entrada
    // en círculo con `i % entrada.length`, así que con más héroes que casillas
    // salían apilados de dos en dos: aquí serían 8 héroes en 4 casillas. En
    // este motor dos figuras no caben en una —`celdaLibre` lo prohíbe—, así que
    // eso es un estado ilegal desde antes del primer turno.
    const e = partida({ heroes: OCHO });

    expect(e.heroes).toHaveLength(8);
    const casillas = new Set(e.heroes.map((h) => claveCelda(h.celda)));
    expect(casillas.size).toBe(8);
  });

  it("cada héroe sale en la casilla de entrada que le toca, en orden", () => {
    // Que no se pisen no basta: si alguna vez se repartieran salteados, el
    // grupo empezaría desordenado respecto a la fila de la mesa.
    const e = partida({ heroes: OCHO });
    e.heroes.forEach((h, i) => {
      expect(claveCelda(h.celda)).toBe(claveCelda(MISION_PRUEBA.entrada[i]!));
    });
  });

  it("un grupo de uno solo sigue funcionando", () => {
    // Se permite hoy y no debe romperse: es como se juega media suite de tests.
    const e = partida({ heroes: [{ clase: "barbaro" }] });
    expect(e.heroes).toHaveLength(1);
    expect(claveCelda(e.heroes[0]!.celda)).toBe(claveCelda(MISION_PRUEBA.entrada[0]!));
  });
});

describe("si no caben, la partida no se crea en silencio", () => {
  it("más héroes que casillas de entrada es un error, no una partida apilada", () => {
    const estrecha = { ...MISION_PRUEBA, entrada: [c(0, 1), c(0, 2)] };
    expect(() =>
      crearPartida({
        mision: estrecha,
        heroes: [{ clase: "barbaro" }, { clase: "enano" }, { clase: "elfo" }],
        monstruos: [],
        semilla: 42,
      }),
    ).toThrow(/no caben sin apilarse/);
  });

  it("justo los que caben sí se crean", () => {
    // La otra mitad del límite: fallar de más sería tan malo como fallar de
    // menos, porque dejaría misiones legales sin poder jugarse.
    const estrecha = { ...MISION_PRUEBA, entrada: [c(0, 1), c(0, 2)] };
    const e = crearPartida({
      mision: estrecha,
      heroes: [{ clase: "barbaro" }, { clase: "enano" }],
      monstruos: [],
      semilla: 42,
    });
    expect(e.heroes.map((h) => claveCelda(h.celda))).toEqual(["0,1", "0,2"]);
  });
});

describe("dos de la misma clase son dos héroes de verdad", () => {
  const dosMagos = (): EstadoPartida => {
    const e = partida({
      heroes: [
        { clase: "mago", elementos: ["fuego"] },
        { clase: "mago", elementos: ["fuego"] },
      ],
      monstruos: [{ id: "orco1", especie: "orco", celda: c(4, 1) }],
    });
    // A la sala 'a' (columnas 1-4, filas 1-4) y con luz: a oscuras no hay línea
    // de visión y la bola de fuego se rechaza por eso, no por lo que se prueba.
    return { ...situar(e, "mago", c(1, 1)), salasReveladas: ["a"] };
  };

  it("llevan identificadores distintos", () => {
    const e = dosMagos();
    expect(e.heroes.map((h) => h.id)).toEqual(["mago", "mago2"]);
  });

  it("gastar un hechizo del primero no se lo quita al segundo", () => {
    // Es la comprobación que de verdad importa: si `crearPartida` compartiera
    // el array de hechizos entre los dos —la forma más fácil de equivocarse al
    // repetir una clase—, el segundo mago se quedaría sin bola de fuego sin
    // haberla lanzado, y en la mesa eso no se atribuye nunca a este código.
    let e = dosMagos();
    expect(e.heroes[1]!.hechizos).toContain("bolaDeFuego");

    e = hacer(e, { tipo: "lanzarHechizo", hechizo: "bolaDeFuego", objetivo: "orco1" });

    const [uno, dos] = e.heroes;
    expect(uno!.hechizos).not.toContain("bolaDeFuego");
    expect(uno!.hechizosGastados).toContain("bolaDeFuego");
    expect(dos!.hechizos).toContain("bolaDeFuego");
    expect(dos!.hechizosGastados).toEqual([]);
  });

  it("el turno los cuenta a los dos por separado", () => {
    // Con ocho héroes, entre dos turnos de uno mismo pasan ocho más. No cambia
    // el código, pero sí el ritmo en la mesa, y conviene que quede escrito.
    const e = partida({ heroes: OCHO });
    expect(e.turno.orden).toHaveLength(9); // los ocho, y Zargon al final
    expect(e.turno.orden[8]).toBe("zargon");
    expect(new Set(e.turno.orden).size).toBe(9);
  });
});
