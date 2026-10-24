/**
 * T84 · La Tempestad no hacía nada en una partida real.
 *
 * `lanzarHechizo` marcaba `pierdeTurno` en el monstruo, y `avanzarActor` lo
 * borraba de todos al entrar el turno de Zargon, que es justo el siguiente: el
 * monstruo actuaba igual. Los tests de T21 miraban el campo justo después de
 * lanzar, sin pasar el turno, y por eso no lo veían.
 *
 * Estos recorren la escena entera con acciones reales: lanzar, turno de Zargon,
 * turno siguiente.
 *
 * Regla: «un pequeño remolino que envuelve a un único ser a quien se le lanza y
 * lo deja un turno sin jugar» (Juan Luis, 2026-09-06, `autorizaciones.md`, T21).
 */

import { describe, expect, it } from "vitest";
import { HECHIZOS, type IdHechizo } from "../src/data/spells";
import { monstruosActivables } from "../src/engine/reducer";
import type { EstadoPartida } from "../src/engine/types";
import { c, hacer, partida, rechaza, situar } from "./ayuda";

const escena = (soloUno = false): EstadoPartida => {
  const e = partida({
    heroes: [{ clase: "mago", elementos: ["aire", "agua", "tierra"] }],
    monstruos: [
      { id: "orco1", especie: "orco", celda: c(4, 1) },
      ...(soloUno ? [] : [{ id: "orco2", especie: "orco" as const, celda: c(4, 2) }]),
    ],
  });
  const base = { ...situar(e, "mago", c(1, 1)), salasReveladas: ["a"] };
  return {
    ...base,
    monstruosEnTablero: base.monstruos.map((m) => m.id),
    heroes: base.heroes.map((h) => ({ ...h, hechizos: Object.keys(HECHIZOS) as IdHechizo[] })),
  };
};

const activables = (e: EstadoPartida) => monstruosActivables(e).map((m) => m.id).sort();

describe("la Tempestad hace perder de verdad el siguiente turno (T84)", () => {
  it("lanzar, turno de Zargon: el monstruo no actúa; al turno siguiente, sí", () => {
    let e = hacer(escena(), { tipo: "lanzarHechizo", hechizo: "tempestad", objetivo: "orco1" });
    e = hacer(e, { tipo: "terminarTurno" }); // el mago cierra; entra Zargon

    // Turno de Zargon: solo puede activar al orco que no fue envuelto.
    expect(e.turno.orden[e.turno.indice]).toBe("zargon");
    expect(activables(e)).toEqual(["orco2"]);
    expect(rechaza(e, { tipo: "activarMonstruo", monstruo: "orco1" })).toMatch(/pierde/i);

    e = hacer(e, { tipo: "activarMonstruo", monstruo: "orco2" });
    e = hacer(e, { tipo: "terminarTurno" }); // orco2 acaba y Zargon cierra
    expect(e.turno.orden[e.turno.indice]).toBe("mago");

    // «Un turno»: ya pasó, el remolino se acaba.
    expect(e.monstruos.find((m) => m.id === "orco1")!.pierdeTurno).toBe(false);

    e = hacer(e, { tipo: "terminarTurno" }); // el mago cierra sin lanzar nada
    expect(activables(e)).toEqual(["orco1", "orco2"]);
    hacer(e, { tipo: "activarMonstruo", monstruo: "orco1" });
  });

  it("si Zargon no tiene a nadie más que activar, el turno se pierde igual y se limpia", () => {
    let e = hacer(escena(true), { tipo: "lanzarHechizo", hechizo: "tempestad", objetivo: "orco1" });
    e = hacer(e, { tipo: "terminarTurno" });
    expect(activables(e)).toEqual([]);

    e = hacer(e, { tipo: "terminarTurno" }); // Zargon cierra sin activar a nadie
    expect(e.monstruos.find((m) => m.id === "orco1")!.pierdeTurno).toBe(false);
    e = hacer(e, { tipo: "terminarTurno" });
    expect(activables(e)).toEqual(["orco1"]);
  });

  it("no toca al Sueño: el dormido sigue tirando su dado al entrar Zargon y sigue dormido si no saca 6", () => {
    let e = hacer(escena(), { tipo: "lanzarHechizo", hechizo: "tempestad", objetivo: "orco1" });
    e = { ...e, monstruos: e.monstruos.map((m) => (m.id === "orco2" ? { ...m, dormido: true } : m)) };
    e = hacer(e, { tipo: "terminarTurno" });

    // orco1 pierde el turno, orco2 duerme (o se despierta con un 6, que es del
    // Sueño y no de la Tempestad): en ningún caso orco1 es activable.
    expect(activables(e)).not.toContain("orco1");
    expect(e.monstruos.find((m) => m.id === "orco1")!.pierdeTurno).toBe(true);
  });
});
