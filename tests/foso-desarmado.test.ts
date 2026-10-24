/**
 * T85 · Un foso desarmado seguía siendo foso.
 *
 * `desarmarTrampa` marcaba la trampa `gastada`, que en un foso significa «ya
 * disparado, agujero abierto»: el héroe que cruzaba la casilla tenía que tirar
 * el dado de salto y podía caer en un agujero que nunca existió.
 *
 * Reglamento 2021, p. 19: «A disarmed trap is considered gone and is not put
 * out on the gameboard». La p. 17 solo prohíbe desarmar un foso ya disparado:
 * «Once a pit trap is sprung and a pit tile placed on the board, the trap
 * cannot be disarmed and removed».
 */

import { describe, expect, it } from "vitest";
import { enUnFoso } from "../src/engine/combat";
import { aplicarAccion } from "../src/engine/reducer";
import type { EstadoPartida } from "../src/engine/types";
import { c, conMovimiento, hacer, partida, rechaza, situar } from "./ayuda";

const escena = (): EstadoPartida =>
  conMovimiento(
    situar(
      partida({
        heroes: [{ clase: "enano" }], // desarma sin riesgo y lleva herramientas
        trampas: [{ id: "t1", tipo: "foso", celda: c(1, 2), descubierta: true, gastada: false }],
      }),
      "enano",
      c(1, 1),
    ),
    6,
  );

describe("un foso desarmado es suelo normal (T85)", () => {
  it("el enano lo desarma y el siguiente turno se cruza sin dado, sin daño y sin caer", () => {
    let e = hacer(escena(), { tipo: "desarmarTrampa", trampa: "t1" });
    expect(e.registro.some((x) => x.tipo === "trampaDesarmada")).toBe(true);

    // Turno siguiente del héroe: Zargon no tiene a nadie y vuelve al enano.
    e = hacer(e, { tipo: "terminarTurno" });
    e = hacer(e, { tipo: "terminarTurno" });
    e = conMovimiento(e, 6);
    const cuerpo = e.heroes[0]!.cuerpo;

    const r = aplicarAccion(e, { tipo: "mover", destino: c(1, 3) });
    if (!r.ok) throw new Error(r.motivo);
    expect(r.eventos.some((x) => x.tipo === "saltoDeTrampa" || x.tipo === "trampaDisparada")).toBe(false);
    expect(r.estado.heroes[0]!.cuerpo).toBe(cuerpo);
    expect(r.estado.heroes[0]!.celda).toEqual(c(1, 3));
  });

  it("y se puede pisar a propósito sin que salte nada", () => {
    let e = hacer(escena(), { tipo: "desarmarTrampa", trampa: "t1" });
    e = hacer(e, { tipo: "terminarTurno" });
    e = hacer(e, { tipo: "terminarTurno" });
    e = conMovimiento(e, 6);
    const r = aplicarAccion(e, { tipo: "mover", destino: c(1, 2) });
    if (!r.ok) throw new Error(r.motivo);
    expect(r.eventos.some((x) => x.tipo === "trampaDisparada")).toBe(false);
    expect(r.estado.heroes[0]!.cuerpo).toBe(e.heroes[0]!.cuerpo);
    expect(enUnFoso(r.estado, r.estado.heroes[0]!)).toBe(false);
  });

  it("no se vuelve a poder desarmar (ya no hay nada)", () => {
    const e = hacer(escena(), { tipo: "desarmarTrampa", trampa: "t1" });
    const siguiente = hacer(hacer(e, { tipo: "terminarTurno" }), { tipo: "terminarTurno" });
    expect(rechaza(siguiente, { tipo: "desarmarTrampa", trampa: "t1" })).toMatch(/desarmada|gastada/i);
  });
});
