/** Utilidades para montar partidas de prueba sobre el tablero real. */

import { crearPartida, type OpcionesPartida } from "../src/engine/partida";
import { aplicarAccion } from "../src/engine/reducer";
import type { Accion, Celda, EstadoPartida, Mision, Resultado } from "../src/engine/types";

export const c = (x: number, y: number): Celda => ({ x, y });

export const MISION_PRUEBA: Mision = {
  id: "prueba",
  titulo: "Misión de prueba",
  introduccion: "",
  entrada: [c(0, 1)],
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

/** Da al actor de turno un movimiento concreto sin depender del azar. */
export const conMovimiento = (e: EstadoPartida, puntos: number): EstadoPartida => ({
  ...e,
  turno: { ...e.turno, movimientoTotal: puntos, movimientoRestante: puntos },
});
