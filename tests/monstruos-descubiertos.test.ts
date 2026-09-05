/**
 * T18 · Un monstruo no actúa hasta que los héroes lo descubren.
 *
 * La regla no es «descubierto», que es palabra nuestra: es **estar puesto sobre
 * el tablero**. Reglamento p. 11, «Zargon may move all monsters currently on the
 * gameboard», y p. 12, que dice cuándo se ponen: al abrir la puerta de su sala, o
 * al quedar en la línea de visión de un héroe por un pasillo. Y no se retiran:
 * una figura que está en la mesa se queda en la mesa aunque el grupo se aleje.
 */

import { describe, expect, it } from "vitest";
import {
  MISION_CALABOZO,
  MONSTRUOS_CALABOZO,
  MUEBLES_CALABOZO,
  PUERTAS_CALABOZO,
  TRAMPAS_CALABOZO,
} from "../src/data/quests/calabozo";
import { monstruosPorActivar } from "../src/engine/selectors";
import type { EstadoPartida } from "../src/engine/types";
import { c, hacer, partida, rechaza, situar } from "./ayuda";

const calabozo = () =>
  partida({
    mision: MISION_CALABOZO,
    heroes: [{ clase: "barbaro" }, { clase: "enano" }, { clase: "elfo" }, { clase: "mago" }],
    monstruos: MONSTRUOS_CALABOZO,
    puertas: PUERTAS_CALABOZO,
    muebles: MUEBLES_CALABOZO,
    trampas: TRAMPAS_CALABOZO,
  });

/** Pasa los turnos de los cuatro héroes sin hacer nada, hasta Zargon. */
const hastaZargon = (e: EstadoPartida): EstadoPartida =>
  e.heroes.reduce((acc) => hacer(acc, { tipo: "terminarTurno" }), e);

const ids = (ms: readonly { id: string }[]) => ms.map((m) => m.id).sort();

describe("Zargon solo mueve lo que está sobre el tablero", () => {
  it("en el primer turno de Zargon no hay ni un monstruo que activar", () => {
    const e = hastaZargon(calabozo());

    // Los seis están dentro de salas que nadie ha abierto. Antes de T18 salían
    // los seis, y el fimir del fondo del pasillo se podía sacar de su sala en el
    // turno 1, con su figura todavía dentro de la caja.
    expect(e.salasReveladas).toEqual([]);
    expect(monstruosPorActivar(e)).toEqual([]);
    expect(rechaza(e, { tipo: "activarMonstruo", monstruo: "guardian" })).toMatch(
      /no lo han encontrado/i,
    );
  });

  it("Zargon puede cerrar su turno sin tener ningún monstruo en el tablero", () => {
    // El estado normal del turno 1, que antes de T18 no ocurría nunca y por eso
    // no lo cubría ningún test: es el candidato número uno a dejar la partida
    // parada en la mesa.
    const e = hacer(hastaZargon(calabozo()), { tipo: "terminarTurno" });
    expect(e.turno.orden[e.turno.indice]).toBe("barbaro");
  });

  it("abrir la puerta de una sala pone en el tablero a todos sus monstruos, y solo a ellos", () => {
    // La sala `s` tiene dos goblins; la `t`, un orco y un goblin.
    let e = hacer(situar(calabozo(), "barbaro", c(12, 15)), {
      tipo: "abrirPuerta",
      puerta: "ps",
    });

    expect(e.salasReveladas).toContain("s");
    expect(ids(e.monstruos.filter((m) => e.monstruosEnTablero.includes(m.id)))).toEqual([
      "goblin1",
      "goblin2",
    ]);

    e = hastaZargon(e);
    expect(ids(monstruosPorActivar(e))).toEqual(["goblin1", "goblin2"]);
  });

  it("un monstruo puesto sigue activable cuando los héroes se van y dejan de verlo", () => {
    let e = hacer(situar(calabozo(), "barbaro", c(12, 15)), {
      tipo: "abrirPuerta",
      puerta: "ps",
    });
    // Los cuatro a la otra punta del tablero: la figura ya está en la mesa y de
    // la mesa no se retira. Esta es la mitad que un cálculo al vuelo no cumple.
    e = e.heroes.reduce((acc, h, i) => situar(acc, h.id, c(20 + i, 18)), e);
    e = hastaZargon(e);

    expect(ids(monstruosPorActivar(e))).toEqual(["goblin1", "goblin2"]);
  });

  it("un monstruo plantado en un pasillo a la vista entra sin que nadie abra nada", () => {
    // La otra vía de la p. 12: «When a hero looks down a corridor, place on the
    // gameboard any monsters directly within the hero's line of sight».
    let e = partida({ monstruos: [{ id: "orco1", especie: "orco", celda: c(0, 3) }] });
    expect(e.monstruosEnTablero).toContain("orco1"); // el bárbaro entra en (0,1) y lo ve

    e = hacer(e, { tipo: "terminarTurno" });
    expect(ids(monstruosPorActivar(e))).toEqual(["orco1"]);
  });

  it("el monstruo errante nace puesto: lo acaban de sacar de la carta", () => {
    // Con el mazo trucado para que salga el orco errante. Sin esto el errante no
    // podría actuar jamás y nadie lo notaría hasta que la carta saliera en una
    // partida de verdad: nace de la nada, ya al lado del héroe, así que no pasa
    // por ninguna de las dos vías de descubrimiento.
    let e = partida({ mision: { ...MISION_CALABOZO, entrada: [c(1, 1)] }, monstruos: [] });
    e = { ...e, mazoTesoros: ["errOrco"], salasReveladas: ["a"] };
    e = hacer(e, { tipo: "buscarTesoro" });

    const errante = e.monstruos.find((m) => m.id.startsWith("errante"));
    expect(errante, "no ha salido la carta del monstruo errante").toBeDefined();
    expect(e.monstruosEnTablero).toContain(errante!.id);

    e = hastaZargon(e);
    expect(ids(monstruosPorActivar(e))).toContain(errante!.id);
  });
});
