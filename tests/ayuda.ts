/** Utilidades para montar partidas de prueba sobre el tablero real. */

import { crearPartida, type OpcionesPartida } from "../src/engine/partida";
import { aplicarAccion } from "../src/engine/reducer";
import type { Accion, Celda, EstadoPartida, Mision, Resultado } from "../src/engine/types";

export const c = (x: number, y: number): Celda => ({ x, y });

export const MISION_PRUEBA: Mision = {
  id: "prueba",
  titulo: "Misión de prueba",
  introduccion: "",
  /**
   * Ocho casillas, en fila por el pasillo de la columna 0.
   *
   * Era una sola, y como `crearPartida` repartía con `i % entrada.length`, los
   * tests que montan dos, tres o cuatro héroes los ponían **todos encima de la
   * misma casilla** sin que nadie se enterara: un estado que el motor prohíbe
   * —`celdaLibre`— y sobre el que se estaban comprobando movimiento, visión y
   * ataques. Pasaban porque casi todos llaman a `situar` acto seguido.
   *
   * Ocho y no cuatro para que la suite pueda montar el grupo máximo que pide
   * T16 sin volver a tropezar con esto.
   */
  entrada: [c(0, 1), c(0, 2), c(0, 3), c(0, 4), c(0, 5), c(0, 6), c(0, 7), c(0, 8)],
  textosDeSala: { a: "Un olor a moho lo llena todo." },
  // Un rincón al que ningún test llega: así la partida no se acaba sola.
  objetivo: { clase: "llegarA", celdas: [c(25, 18)] },
};

export function partida(op: Partial<OpcionesPartida> = {}): EstadoPartida {
  return crearPartida({
    mision: MISION_PRUEBA,
    heroes: [{ clase: "barbaro" }],
    monstruos: [],
    semilla: 42,
    ...op,
  });
}

/** Aplica una acción y falla el test si era ilegal. */
export function hacer(e: EstadoPartida, a: Accion): EstadoPartida {
  const r = aplicarAccion(e, a);
  if (!r.ok) throw new Error(`acción rechazada: ${r.motivo}  (${JSON.stringify(a)})`);
  return r.estado;
}

/** Aplica una acción esperando que sea rechazada, y devuelve el motivo. */
export function rechaza(e: EstadoPartida, a: Accion): string {
  const r: Resultado = aplicarAccion(e, a);
  if (r.ok) throw new Error(`se esperaba rechazo pero pasó: ${JSON.stringify(a)}`);
  return r.motivo;
}

/** Coloca una figura en una casilla concreta, saltándose las reglas. */
export function situar(e: EstadoPartida, id: string, celda: Celda): EstadoPartida {
  return {
    ...e,
    heroes: e.heroes.map((h) => (h.id === id ? { ...h, celda } : h)),
    monstruos: e.monstruos.map((m) => (m.id === id ? { ...m, celda } : m)),
  };
}

/**
 * Da por descubiertos unos monstruos, saltándose las reglas.
 *
 * Desde T18, Zargon solo puede activar los que están puestos sobre el tablero, y
 * eso ocurre al abrir la puerta de su sala o al verlos por un pasillo. Un test
 * que planta un monstruo con `situar` y lo activa necesita esto; si no, el motor
 * le contesta que los héroes todavía no lo han encontrado. Sin argumentos, pone
 * a todos los de la partida.
 */
export const enTablero = (e: EstadoPartida, ...ids: string[]): EstadoPartida => ({
  ...e,
  monstruosEnTablero: [
    ...new Set([...e.monstruosEnTablero, ...(ids.length > 0 ? ids : e.monstruos.map((m) => m.id))]),
  ],
});

/** Da al actor de turno un movimiento concreto sin depender del azar. */
export const conMovimiento = (e: EstadoPartida, puntos: number): EstadoPartida => ({
  ...e,
  turno: { ...e.turno, movimientoTotal: puntos, movimientoRestante: puntos },
});
