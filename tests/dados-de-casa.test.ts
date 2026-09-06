/**
 * T33 · Que los tire yo o que los tire la aplicación.
 *
 * Los componentes de React no se prueban aquí (`vite.config.ts` monta el entorno
 * `node`), así que lo que se prueba es lo que sostiene la pantalla: que **las dos
 * modalidades son la misma acción con el campo `dados` o sin él**, y que la de
 * «los tira la aplicación» sigue siendo reproducible, que es de lo que viven el
 * deshacer y la partida en red.
 *
 * Si esto se rompiera, el síntoma no sería un error: sería que deshacer deja de
 * salir igual, o que las dos casas dejan de ver la misma partida.
 */

import { describe, expect, it } from "vitest";
import { aplicarAccion } from "../src/engine/reducer";
import { dadosDeDefensa } from "../src/engine/combat";
import type { Accion, EstadoPartida } from "../src/engine/types";
import { c, conMovimiento, enTablero, hacer, partida, situar } from "./ayuda";

/** El bárbaro pegado a un orco, con la sala abierta y el orco descubierto. */
const cuerpoACuerpo = (): EstadoPartida => {
  let e = partida({ monstruos: [{ id: "orco", especie: "orco", celda: c(2, 2) }] });
  e = { ...e, salasReveladas: ["a"] };
  e = enTablero(situar(e, "barbaro", c(2, 1)), "orco");
  return conMovimiento(e, 6);
};

const atacar = (dados?: Accion): Accion => dados ?? { tipo: "atacar", objetivo: "orco" };

describe("las dos modalidades son la misma acción", () => {
  it("sin `dados`, el motor tira y la acción es legal", () => {
    const r = aplicarAccion(cuerpoACuerpo(), { tipo: "atacar", objetivo: "orco" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.eventos.some((ev) => ev.tipo === "ataque")).toBe(true);
  });

  it("con `dados`, manda la tirada de la mesa y la acción también es legal", () => {
    const r = aplicarAccion(cuerpoACuerpo(), {
      tipo: "atacar",
      objetivo: "orco",
      dadosAtaque: ["calavera", "calavera", "calavera"],
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const ataque = r.eventos.find((ev) => ev.tipo === "ataque");
    expect(ataque?.tipo === "ataque" && ataque.calaveras).toBe(3);
  });

  it("la de «los tira la aplicación» es reproducible: dos veces el mismo estado, el mismo resultado", () => {
    // Esta es la que importa. La tirada sale del generador que vive **dentro**
    // del estado, no de `Math.random()`, y por eso rehacer la partida con una
    // acción menos sigue saliendo idéntico y las dos casas siguen viendo lo
    // mismo. Si alguien cambiara esto por un azar de verdad, el deshacer y la
    // partida en red se romperían a la vez, y en silencio.
    const base = cuerpoACuerpo();
    const una = aplicarAccion(base, atacar());
    const otra = aplicarAccion(base, atacar());
    expect(una.ok && otra.ok).toBe(true);
    if (!una.ok || !otra.ok) return;
    expect(JSON.stringify(otra.estado)).toBe(JSON.stringify(una.estado));
  });

  it("y las dos dejan la partida en un estado legal, aunque no en el mismo", () => {
    const base = cuerpoACuerpo();
    const tiraLaApp = aplicarAccion(base, { tipo: "atacar", objetivo: "orco" });
    const tiraElHeroe = aplicarAccion(base, {
      tipo: "atacar",
      objetivo: "orco",
      dadosAtaque: ["calavera", "calavera", "calavera"],
    });
    expect(tiraLaApp.ok && tiraElHeroe.ok).toBe(true);
    if (!tiraLaApp.ok || !tiraElHeroe.ok) return;
    // Las dos han gastado la acción del turno: es el mismo ataque.
    expect(tiraLaApp.estado.turno.haActuado).toBe(true);
    expect(tiraElHeroe.estado.turno.haActuado).toBe(true);
  });
});

describe("el movimiento, igual", () => {
  it("sin `dados` lo tira el motor y sale un total entre 2 y 12", () => {
    const e = partida();
    const r = aplicarAccion(e, { tipo: "tirarMovimiento" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const ev = r.eventos.find((x) => x.tipo === "tiradaMovimiento");
    expect(ev?.tipo === "tiradaMovimiento" && ev.total >= 2 && ev.total <= 12).toBe(true);
  });

  it("con `dados` manda lo que se ha tecleado", () => {
    const r = aplicarAccion(partida(), { tipo: "tirarMovimiento", dados: [5, 4] });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.estado.turno.movimientoTotal).toBe(9);
  });
});

describe("el foso descuenta un dado en las dos modalidades", () => {
  it("dentro de un foso se defiende con uno menos, lo tire quien lo tire", () => {
    // El número de dados no depende de quién los tire: sale de `combat.ts`. Se
    // comprueba aquí porque la pantalla pregunta por «tus dados de defensa» y
    // ya hubo una divergencia por pedir uno de más a quien estaba en un foso.
    // `gastada: true`, no `descubierta`: estar en un foso es estar en la casilla
    // de uno **ya disparado**, que es como lo guarda el motor —sin un campo
    // `enFoso` en la figura, que sería el mismo dato dos veces—. Con la trampa
    // solo descubierta, el héroe está al borde, no dentro, y no descuenta nada.
    let e = partida({
      trampas: [{ id: "f1", tipo: "foso", celda: c(2, 1), descubierta: true, gastada: true }],
    });
    e = situar(e, "barbaro", c(2, 1));
    const heroe = e.heroes.find((h) => h.id === "barbaro")!;

    const fuera = partida();
    const heroeFuera = fuera.heroes.find((h) => h.id === "barbaro")!;

    expect(dadosDeDefensa(heroe, e)).toBe(dadosDeDefensa(heroeFuera, fuera) - 1);
  });
});

describe("una partida entera con el motor tirándolo todo", () => {
  it("se puede jugar un turno sin teclear ni un dado", () => {
    // Es lo que hace quien juega desde su casa sin dados en la mano: ninguna de
    // sus acciones lleva el campo `dados`, y ninguna se rechaza por eso.
    let e = partida();
    e = hacer(e, { tipo: "tirarMovimiento" });
    e = hacer(e, { tipo: "terminarTurno" });
    expect(e.turno.movimientoTotal).toBe(null);
  });
});
