/**
 * T8 · Zargon juega: la jugada de cada monstruo y el turno entero.
 *
 * La invariante que más importa de este fichero no es ninguna táctica concreta:
 * es que **todo lo que la IA propone lo acepta el motor**. Una jugada ilegal no
 * se ve como un test rojo, se ve en la mesa como un monstruo que no se mueve, con
 * cuatro niños mirando. Por eso el último bloque juega turnos enteros sobre la
 * misión de verdad y comprueba que ninguna acción se cae.
 */

import { describe, expect, it } from "vitest";
import {
  MISION_CALABOZO,
  MONSTRUOS_CALABOZO,
  MUEBLES_CALABOZO,
  PUERTAS_CALABOZO,
  TRAMPAS_CALABOZO,
} from "../src/data/quests/calabozo";
import {
  siguienteAccionDeZargon,
  siguienteAccionDelMonstruo,
  turnoDeZargon,
} from "../src/ai/zargon";
import { aplicarAccion } from "../src/engine/reducer";
import { esTurnoDeZargon } from "../src/engine/selectors";
import type { EstadoPartida, Mision } from "../src/engine/types";
import { c, enTablero, hacer, MISION_PRUEBA, partida, situar } from "./ayuda";

/**
 * **La sala `a` mide 4 × 3, no 4 × 4.** Columnas 1-4 y filas **1-3**: la fila 4
 * ya es la sala `g`, medido sobre `MAPA_TABLERO`. `tareas/_COMUN.md` dice 4 × 4 y
 * es un dato equivocado; colocar un héroe en la fila 4 lo deja **detrás de un
 * muro**, sin camino, y entonces la escena no prueba lo que dice probar. Aquí
 * costó dos tests en verde falso.
 */
const MISION: Mision = { ...MISION_PRUEBA, entrada: [c(1, 1), c(1, 2)] };

const turnoDeZargonEn = (e: EstadoPartida): EstadoPartida =>
  enTablero({
    ...e,
    turno: { ...e.turno, indice: e.turno.orden.indexOf("zargon") },
    salasReveladas: ["a"],
  });

/**
 * La escena base: un orco en la sala `a`, con el bárbaro y el mago colocados por
 * cada test. El orco se llama `orco` y no `a`/`b` porque aquí no hay desempate
 * alfabético que pueda dar un falso verde: solo hay un monstruo.
 */
const escena = (): EstadoPartida =>
  turnoDeZargonEn(
    partida({
      mision: MISION,
      // El mago con sus tres elementos, que es como se juega: sin elementos no
      // tiene hechizos y deja de ser el objetivo preferido, con razón.
      heroes: [{ clase: "barbaro" }, { clase: "mago", elementos: ["fuego", "aire", "agua"] }],
      monstruos: [{ id: "orco", especie: "orco", celda: c(2, 2) }],
    }),
  );

/** Activa al monstruo por la vía del motor, que es la única que vale. */
const conElOrcoActivo = (e: EstadoPartida): EstadoPartida =>
  hacer(e, { tipo: "activarMonstruo", monstruo: "orco" });

describe("la jugada de un monstruo", () => {
  it("si ya tiene a alguien al lado y nadie mejor a mano, pega sin moverse", () => {
    let e = escena();
    e = situar(e, "barbaro", c(2, 1));
    // El mago, encerrado lejos y sin camino: la única jugada es el bárbaro.
    e = situar(e, "mago", c(20, 15));
    e = conElOrcoActivo(e);

    expect(siguienteAccionDelMonstruo(e)).toEqual({ tipo: "atacar", objetivo: "barbaro" });
  });

  it("con el bárbaro pegado y el mago a tres casillas, va a por el mago", () => {
    // Es el sesgo que pidió el plan —id a por quien lanza hechizos— y aquí se
    // ve entero: mover no cuesta el ataque, así que cambiar de víctima sale
    // gratis. La primera acción es moverse; el ataque llega en la siguiente.
    let e = escena();
    e = situar(e, "barbaro", c(2, 1));
    e = situar(e, "mago", c(4, 3));
    e = conElOrcoActivo(e);

    const primera = siguienteAccionDelMonstruo(e);
    expect(primera?.tipo).toBe("mover");

    const despues = hacer(e, primera!);
    expect(siguienteAccionDelMonstruo(despues)).toEqual({ tipo: "atacar", objetivo: "mago" });
  });

  it("pero no se va andando a por el mago si con eso no llega a pegarle a nadie", () => {
    // La misma escena con el mago fuera de alcance: sin el descuento por no
    // llegar, el orco se iría hacia él y acabaría el turno sin atacar. En la
    // mesa eso se lee como que la aplicación se ha despistado.
    let e = escena();
    e = situar(e, "barbaro", c(2, 1));
    e = situar(e, "mago", c(4, 3));
    e = conElOrcoActivo(e);
    e = { ...e, turno: { ...e.turno, movimientoTotal: 1, movimientoRestante: 1 } };

    expect(siguienteAccionDelMonstruo(e)).toEqual({ tipo: "atacar", objetivo: "barbaro" });
  });

  it("sin nadie a quien pegar, se acerca al mejor objetivo", () => {
    let e = escena();
    e = situar(e, "barbaro", c(4, 1));
    e = situar(e, "mago", c(4, 3));
    e = conElOrcoActivo(e);

    const jugada = siguienteAccionDelMonstruo(e);
    expect(jugada?.tipo).toBe("mover");
    // Y acerca de verdad: la casilla elegida está pegada a uno de los dos.
    const despues = hacer(e, jugada!);
    expect(siguienteAccionDelMonstruo(despues)?.tipo).toBe("atacar");
  });

  it("es determinista: la misma escena da la misma jugada", () => {
    // De esto vive el «deshacer»: rehacer la partida con una acción menos tiene
    // que dar exactamente lo mismo, y si la IA eligiera al azar no daría.
    let e = escena();
    e = situar(e, "barbaro", c(4, 3));
    e = situar(e, "mago", c(1, 3));
    e = conElOrcoActivo(e);

    expect(siguienteAccionDelMonstruo(e)).toEqual(siguienteAccionDelMonstruo(e));
  });
});

describe("el turno de Zargon de principio a fin", () => {
  it("activa al monstruo que le toca sin que nadie se lo diga", () => {
    let e = escena();
    e = situar(e, "barbaro", c(2, 1));
    expect(siguienteAccionDeZargon(e)).toEqual({ tipo: "activarMonstruo", monstruo: "orco" });
  });

  it("cuando el monstruo activo no tiene nada mejor, cierra su activación", () => {
    let e = escena();
    // Los dos héroes sin camino: no hay a quién ir ni a quién pegar.
    e = situar(e, "barbaro", c(20, 15));
    e = situar(e, "mago", c(21, 15));
    e = conElOrcoActivo(e);
    expect(siguienteAccionDeZargon(e)).toEqual({ tipo: "terminarTurno" });
  });

  it("fuera del turno de Zargon no propone nada", () => {
    const e = partida({ mision: MISION, heroes: [{ clase: "barbaro" }, { clase: "mago" }] });
    expect(siguienteAccionDeZargon(e)).toBeNull();
  });

  it("el turno acaba: se juega entero y le devuelve el turno a los héroes", () => {
    let e = escena();
    e = situar(e, "barbaro", c(2, 1));
    e = situar(e, "mago", c(3, 3));

    const { acciones, estado } = turnoDeZargon(e);
    expect(acciones.length).toBeGreaterThan(0);
    expect(esTurnoDeZargon(estado)).toBe(false);
  });
});

describe("la invariante que de verdad importa: nada de lo que propone es ilegal", () => {
  const calabozo = (): EstadoPartida =>
    partida({
      mision: MISION_CALABOZO,
      heroes: [{ clase: "barbaro" }, { clase: "enano" }, { clase: "elfo" }, { clase: "mago" }],
      monstruos: MONSTRUOS_CALABOZO,
      puertas: PUERTAS_CALABOZO,
      muebles: MUEBLES_CALABOZO,
      trampas: TRAMPAS_CALABOZO,
    });

  it("sobre la misión de verdad, el motor acepta todas las acciones de Zargon", () => {
    let e = turnoDeZargonEn(calabozo());
    let jugadas = 0;

    // Cinco turnos seguidos de Zargon, devolviéndole el turno a mano: basta para
    // que los seis monstruos salgan de sus salas y se encuentren con el grupo.
    for (let ronda = 0; ronda < 5; ronda++) {
      let vueltas = 0;
      while (esTurnoDeZargon(e) && vueltas++ < 200) {
        const accion = siguienteAccionDeZargon(e);
        if (!accion) break;
        const r = aplicarAccion(e, accion);
        // El mensaje lleva la acción dentro: si esto falla alguna vez, lo que
        // hace falta saber es cuál fue, no que hubo una.
        expect(r.ok, `rechazada: ${JSON.stringify(accion)}`).toBe(true);
        if (!r.ok) return;
        e = r.estado;
        jugadas++;
      }
      e = turnoDeZargonEn(e);
    }

    expect(jugadas).toBeGreaterThan(10);
  });

  it("y con las salas sin revelar tampoco se atasca", () => {
    // Al empezar la misión los seis monstruos están en salas cerradas: no ven a
    // nadie y nadie los ha descubierto. El turno de Zargon tiene que terminar
    // igual, no quedarse dando vueltas.
    let e = {
      ...calabozo(),
      turno: { ...calabozo().turno, indice: calabozo().turno.orden.indexOf("zargon") },
    };
    const { estado } = turnoDeZargon(e);
    expect(esTurnoDeZargon(estado)).toBe(false);
  });
});
