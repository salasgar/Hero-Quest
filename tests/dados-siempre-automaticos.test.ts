/**
 * T36 · Todos los dados los tira la aplicación.
 *
 * Los componentes de React no se prueban aquí (`vite.config.ts` monta el
 * entorno `node`), así que lo que se prueba es lo que el hook despacha de
 * verdad: desde esta tarea, `useAccionesDeTurno` nunca añade un campo `dados`
 * —ni `dadosAtaque`, ni `dadosDefensa`, ni `dados`— a las acciones de atacar,
 * defenderse o tirar movimiento; siempre las manda peladas, como hace
 * `pedirAtaque`, `lanzar` (Genio) y `pedirMovimiento` tras esta tarea. Eso
 * deja el resultado íntegramente en manos del generador que vive dentro del
 * estado, así que comprobarlo es comprobar que `aplicarAccion` con la acción
 * pelada es determinista y legal, tanto si ataca un héroe como si ataca un
 * monstruo. `dados-de-casa.test.ts` (T33) ya cubre el caso en el que ataca el
 * héroe; aquí se cierra el que faltaba, cuando el héroe se defiende.
 */

import { describe, expect, it } from "vitest";
import { aplicarAccion } from "../src/engine/reducer";
import { c, enTablero, hacer, partida, situar } from "./ayuda";
import type { EstadoPartida } from "../src/engine/types";

/**
 * El orco pegado al bárbaro, sala abierta y monstruo descubierto, ya activo:
 * listo para que ataque él, que es el caso que faltaba (T33 solo probó el
 * ataque del héroe). Se llega ahí con acciones normales —pasar turno y
 * activar al monstruo—, nunca a mano: `aplicarAccion` decide el atacante por
 * quién esté activo, no por un campo de la acción.
 */
const orcoActivo = (): EstadoPartida => {
  let e = partida({ monstruos: [{ id: "orco", especie: "orco", celda: c(2, 2) }] });
  e = { ...e, salasReveladas: ["a"] };
  e = enTablero(situar(e, "barbaro", c(2, 1)), "orco");
  e = hacer(e, { tipo: "terminarTurno" });
  return hacer(e, { tipo: "activarMonstruo", monstruo: "orco" });
};

describe("defenderse (el héroe recibe), sin dados, es igual que atacar (el héroe pega)", () => {
  it("el motor tira los dos lados y la acción es legal, sin que nadie haya tecleado nada", () => {
    const r = aplicarAccion(orcoActivo(), { tipo: "atacar", objetivo: "barbaro" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const ataque = r.eventos.find((ev) => ev.tipo === "ataque");
    expect(ataque?.tipo === "ataque" && ataque.atacante).toBe("orco");
  });

  it("es reproducible: la misma acción pelada sobre el mismo estado da el mismo resultado", () => {
    // Es la garantía que hace posible el deshacer y la partida en red: sin
    // dados que vengan de fuera, todo lo que decide la tirada está en el
    // generador que ya lleva el estado dentro.
    const base = orcoActivo();
    const accion = { tipo: "atacar" as const, objetivo: "barbaro" };
    const una = aplicarAccion(base, accion);
    const otra = aplicarAccion(base, accion);
    expect(una.ok && otra.ok).toBe(true);
    if (!una.ok || !otra.ok) return;
    expect(JSON.stringify(otra.estado)).toBe(JSON.stringify(una.estado));
  });
});

describe("la tirada de movimiento pelada también es determinista", () => {
  it("aplicarAccion sin `dados`, dos veces sobre el mismo estado, da el mismo total", () => {
    const base = partida();
    const accion = { tipo: "tirarMovimiento" as const };
    const una = aplicarAccion(base, accion);
    const otra = aplicarAccion(base, accion);
    expect(una.ok && otra.ok).toBe(true);
    if (!una.ok || !otra.ok) return;
    expect(una.estado.turno.movimientoTotal).toBe(otra.estado.turno.movimientoTotal);
  });
});
