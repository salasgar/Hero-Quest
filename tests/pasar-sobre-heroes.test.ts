/**
 * Reglamento de 2021 (Avalon Hill F3649), página 12:
 *
 * > - You cannot pass over monsters, move through walls, or move diagonally.
 * > - You *may* pass over other heroes.
 * > - You may not share a square with another hero or with a monster except when
 * >   you are on the stairs or in a pit trap.
 *
 * Tres cosas distintas y las tres se prueban aquí: se cruza a un compañero, no
 * se cruza a un monstruo, y no se aterriza encima de nadie.
 *
 * La sala `a` mide 4 × 4 —columnas 1-4, filas 1-4— y **el movimiento va justo a
 * propósito**: con 4 puntos o más se rodea por debajo y el bloqueo no se nota,
 * así que un test generoso pasaría sin probar nada. Con 2 no hay rodeo.
 */

import { describe, expect, it } from "vitest";
import { alcanzables } from "../src/engine/board";
import { claveCelda, type EstadoPartida } from "../src/engine/types";
import { c, conMovimiento, hacer, partida, situar } from "./ayuda";

const llega = (e: EstadoPartida, id: string, puntos: number, destino: ReturnType<typeof c>) => {
  const f = [...e.heroes, ...e.monstruos].find((x) => x.id === id)!;
  return alcanzables(e, f, puntos).has(claveCelda(destino));
};

/** Turno de Zargon, para preguntar por lo que puede hacer un monstruo. */
const turnoDeZargon = (e: EstadoPartida): EstadoPartida => ({
  ...e,
  turno: { ...e.turno, indice: e.turno.orden.indexOf("zargon") },
});

describe("pasar por encima de otras figuras", () => {
  /** Bárbaro en (1,1) y quien estorbe en (2,1); el objetivo es (3,1). */
  const enFila = (estorbo: "heroe" | "monstruo") => {
    let e =
      estorbo === "heroe"
        ? partida({ heroes: [{ clase: "barbaro" }, { clase: "elfo", elementos: ["agua"] }] })
        : partida({ monstruos: [{ id: "orco1", especie: "orco", celda: c(2, 1) }] });
    e = situar(e, "barbaro", c(1, 1));
    if (estorbo === "heroe") e = situar(e, "elfo", c(2, 1));
    return e;
  };

  it("un héroe cruza a otro héroe y llega más allá", () => {
    expect(llega(enFila("heroe"), "barbaro", 2, c(3, 1))).toBe(true);
  });

  it("pero no puede pararse encima de él", () => {
    // Cruzar y aterrizar son dos permisos distintos: `celdaAtravesable` deja
    // pasar y `celdaLibre` no deja quedarse.
    expect(llega(enFila("heroe"), "barbaro", 2, c(2, 1))).toBe(false);
  });

  it("un monstruo en medio sigue taponando a un héroe", () => {
    // La regla del reglamento es «pass over other **heroes**», y solo eso.
    expect(llega(enFila("monstruo"), "barbaro", 2, c(3, 1))).toBe(false);
  });

  it("y un monstruo tampoco cruza a un héroe", () => {
    // El permiso está escrito para el turno de los héroes y de nadie más.
    let e = partida({ monstruos: [{ id: "orco1", especie: "orco", celda: c(1, 1) }] });
    e = turnoDeZargon(situar(e, "barbaro", c(2, 1)));
    expect(llega(e, "orco1", 2, c(3, 1))).toBe(false);
  });
});

describe("el bloque desprendido y el camino de vuelta ocupado", () => {
  it("retrocede hasta la primera casilla donde de verdad quepa, sin apilarse", () => {
    // El caso que abre la regla nueva: el bárbaro cruza al elfo, pisa el bloque
    // en (3,1) —que ciega la casilla y le obliga a salir de ella— y la casilla
    // de la que venía está ocupada por el elfo, porque acaba de pasarle por
    // encima. Tiene que seguir desandando hasta (1,1). Dos figuras en la misma
    // casilla rompen una invariante del test de juego al azar.
    let e = partida({
      heroes: [{ clase: "barbaro" }, { clase: "elfo", elementos: ["agua"] }],
      trampas: [{ id: "bloque1", tipo: "bloque", celda: c(3, 1), descubierta: false, gastada: false }],
    });
    e = situar(situar(e, "barbaro", c(1, 1)), "elfo", c(2, 1));

    const tras = hacer(conMovimiento(e, 2), { tipo: "mover", destino: c(3, 1) });
    const barbaro = tras.heroes.find((h) => h.id === "barbaro")!;
    const elfo = tras.heroes.find((h) => h.id === "elfo")!;

    expect(barbaro.celda).toEqual(c(1, 1)); // ni en el bloque ni encima del elfo
    expect(elfo.celda).toEqual(c(2, 1));
    expect(tras.celdasBloqueadas).toContainEqual(c(3, 1));

    const ocupadas = [...tras.heroes, ...tras.monstruos]
      .filter((f) => f.cuerpo > 0)
      .map((f) => claveCelda(f.celda));
    expect(new Set(ocupadas).size).toBe(ocupadas.length);
  });
});
