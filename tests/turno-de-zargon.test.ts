/**
 * T20 · El turno de Zargon deja rastro en el diario.
 *
 * Juan Luis, después de jugar: «Los monstruos no se mueven. Se quedan quietos y
 * no atacan. El diario no dice qué es lo que han hecho los monstruos.» Son dos
 * cosas y esta es la segunda: quién decide a dónde va cada monstruo es T8; que
 * la pantalla cuente lo que ha pasado es esto.
 *
 * El agujero medido era literal: `activarMonstruo` y el cierre de la activación
 * devolvían cero eventos, así que un turno entero de Zargon podía dejar el
 * diario exactamente igual que antes. Debajo de «— Turno de Zargon —» venía ya
 * la línea del héroe siguiente.
 */

import { describe, expect, it } from "vitest";
import { narrar, narrarTodos } from "../src/narrator/local";
import { aplicarAccion, repetir } from "../src/engine/reducer";
import type { Accion, EstadoPartida, Evento } from "../src/engine/types";
import { c, enTablero, hacer, partida, situar } from "./ayuda";

/**
 * El bárbaro en la esquina de la sala `a`, con el goblin pegado y el orco al
 * fondo. Los dos monstruos, ya descubiertos: desde T18, Zargon no puede activar
 * lo que los héroes no han encontrado.
 */
const escena = (): EstadoPartida =>
  enTablero(
    situar(
      partida({
        monstruos: [
          { id: "goblin1", especie: "goblin", celda: c(2, 1) },
          { id: "orco1", especie: "orco", celda: c(4, 1) },
        ],
      }),
      "barbaro",
      c(1, 1),
    ),
  );

/** Pasa el turno del único héroe: el siguiente actor es Zargon. */
const enZargon = () => hacer(escena(), { tipo: "terminarTurno" });

/** Aplica una acción legal y devuelve sus eventos. */
function eventosDe(e: EstadoPartida, a: Accion): [EstadoPartida, Evento[]] {
  const r = aplicarAccion(e, a);
  if (!r.ok) throw new Error(`acción rechazada: ${r.motivo}  (${JSON.stringify(a)})`);
  return [r.estado, r.eventos];
}

const tipos = (evs: readonly Evento[]) => evs.map((x) => x.tipo);

describe("se sabe qué monstruo está actuando", () => {
  it("activar un monstruo lo anuncia con su nombre", () => {
    const e = enZargon();
    expect(e.turno.orden[e.turno.indice]).toBe("zargon");

    const [tras, evs] = eventosDe(e, { tipo: "activarMonstruo", monstruo: "goblin1" });

    expect(tipos(evs)).toEqual(["monstruoActiva"]);
    expect(narrarTodos(tras, evs)).toEqual(["Le toca a Goblin."]);
  });

  it("antes de T20 esta acción no emitía ni un evento", () => {
    // El test de arriba con otra ropa, y va aparte a propósito: lo que se fija
    // no es la frase, es que la acción no sea muda.
    const [, evs] = eventosDe(enZargon(), { tipo: "activarMonstruo", monstruo: "orco1" });
    expect(evs.length).toBeGreaterThan(0);
  });
});

describe("un monstruo que no hace nada lo dice", () => {
  it("activarlo y cerrar su activación deja una línea", () => {
    let e = enZargon();
    [e] = eventosDe(e, { tipo: "activarMonstruo", monstruo: "goblin1" });
    const [tras, evs] = eventosDe(e, { tipo: "terminarTurno" });

    expect(tipos(evs)).toContain("monstruoSinActuar");
    const frases = narrarTodos(tras, evs);
    expect(frases[0]).toMatch(/Goblin/);
    expect(frases[0]).toMatch(/no se mueve ni ataca|se queda donde está/);
  });

  it("el que se ha movido no la deja: ya está contado", () => {
    let e = enZargon();
    [e] = eventosDe(e, { tipo: "activarMonstruo", monstruo: "goblin1" });
    const [movido, evsMov] = eventosDe(e, { tipo: "mover", destino: c(2, 3) });
    expect(tipos(evsMov)).toContain("movimiento");

    const [, evs] = eventosDe(movido, { tipo: "terminarTurno" });
    expect(tipos(evs)).not.toContain("monstruoSinActuar");
  });

  it("el que ha atacado, tampoco", () => {
    // El goblin ya está pegado al bárbaro: ataca sin moverse, así que `haMovido`
    // sigue en false y solo `haActuado` lo salva de la línea de «no ha hecho
    // nada». Es el caso que se escapa si se mira solo el movimiento.
    let e = enZargon();
    [e] = eventosDe(e, { tipo: "activarMonstruo", monstruo: "goblin1" });
    const [atacado, evsAtaque] = eventosDe(e, {
      tipo: "atacar",
      objetivo: "barbaro",
      dadosAtaque: ["calavera", "calavera"],
      dadosDefensa: ["escudoBlanco", "escudoBlanco"],
    });
    expect(tipos(evsAtaque)).toContain("ataque");

    const [, evs] = eventosDe(atacado, { tipo: "terminarTurno" });
    expect(tipos(evs)).not.toContain("monstruoSinActuar");
  });
});

describe("un turno de Zargon entero", () => {
  it("deja una línea por monstruo y ninguna de más", () => {
    let e = enZargon();
    const frases: string[] = [];

    for (const id of ["goblin1", "orco1"]) {
      for (const a of [
        { tipo: "activarMonstruo", monstruo: id } as const,
        { tipo: "terminarTurno" } as const,
      ]) {
        const [tras, evs] = eventosDe(e, a);
        frases.push(...narrarTodos(tras, evs));
        e = tras;
      }
    }

    // Dos activaciones, dos «no ha hecho nada» y el cambio de turno. Ni una más:
    // seis monstruos por tres líneas es un diario que en la mesa no lee nadie.
    expect(frases).toEqual([
      "Le toca a Goblin.",
      "Goblin no se mueve ni ataca.",
      "Le toca a Orco.",
      // La segunda frase es la misma variante porque cada tanda se narra desde
      // su propio índice. En el diario, que numera seguido, alternan.
      "Orco no se mueve ni ataca.",
      "— Turno de Bárbaro —",
    ]);
  });
});

describe("Zargon sin nadie a quien mover", () => {
  it("el caso que abrió la tarea: sin monstruos en el tablero deja una línea, no cero", () => {
    // El turno 1 de cualquier partida: los héroes todavía no han abierto ninguna
    // puerta. Antes de T20 aquí el diario ponía «— Turno de Zargon —» y debajo,
    // sin nada en medio, el turno del héroe siguiente.
    const e = hacer(escena(), { tipo: "terminarTurno" });
    const sinDescubrir = { ...e, monstruosEnTablero: [] };

    const [tras, evs] = eventosDe(sinDescubrir, { tipo: "terminarTurno" });

    expect(tipos(evs)).toEqual(["zargonSinMonstruos", "cambioDeTurno"]);
    expect(narrarTodos(tras, evs)[0]).toBe("Zargon espera: todavía no habéis encontrado a nadie.");
  });

  it("y cuando ya han actuado todos, lo dice de otra manera", () => {
    let e = enZargon();
    for (const id of ["goblin1", "orco1"]) {
      [e] = eventosDe(e, { tipo: "activarMonstruo", monstruo: id });
      [e] = eventosDe(e, { tipo: "terminarTurno" });
    }
    // El segundo cierre ya pasó el turno: los dos motivos no se pueden dar en la
    // misma partida seguidos, así que se monta el estado a mano.
    const todosHechos = {
      ...enZargon(),
      turno: { ...enZargon().turno, monstruosHechos: ["goblin1", "orco1"] },
    };

    const [tras, evs] = eventosDe(todosHechos, { tipo: "terminarTurno" });
    expect(tipos(evs)).toEqual(["zargonSinMonstruos", "cambioDeTurno"]);
    expect(narrarTodos(tras, evs)[0]).toBe("Zargon no tiene ya a quién mover.");
  });

  it("el turno de un héroe no dice nada de esto", () => {
    const [, evs] = eventosDe(escena(), { tipo: "terminarTurno" });
    expect(tipos(evs)).toEqual(["cambioDeTurno"]);
  });
});

describe("el deshacer sigue funcionando", () => {
  it("repetir la partida da los mismos eventos", () => {
    const acciones: Accion[] = [
      { tipo: "terminarTurno" },
      { tipo: "activarMonstruo", monstruo: "goblin1" },
      { tipo: "terminarTurno" },
      { tipo: "activarMonstruo", monstruo: "orco1" },
      { tipo: "terminarTurno" },
    ];
    const inicial = escena();
    const jugada = acciones.reduce((acc, a) => hacer(acc, a), inicial);

    // `repetir` rehace la partida desde cero, que es lo que sostiene el
    // «deshacer». Si un evento nuevo dependiera del reloj o del azar, aquí se
    // vería: el registro entero tiene que salir igual.
    expect(repetir(inicial, acciones).registro).toEqual(jugada.registro);
    expect(jugada.registro.map((x) => x.tipo)).toContain("monstruoActiva");
  });
});

describe("las frases no nacen mudas", () => {
  it("los tres eventos nuevos se cuentan", () => {
    const e = enZargon();
    const nuevos: Evento[] = [
      { tipo: "monstruoActiva", monstruo: "goblin1" },
      { tipo: "monstruoSinActuar", monstruo: "goblin1" },
      { tipo: "zargonSinMonstruos", motivo: "ningunoDescubierto" },
      { tipo: "zargonSinMonstruos", motivo: "todosHanActuado" },
    ];
    for (const ev of nuevos) expect(narrar(e, ev, 0)).toBeTruthy();
  });
});
