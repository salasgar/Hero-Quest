/** Tipos geométricos básicos. El motor de reglas completo llega en la Fase 2. */

export interface Celda {
  x: number;
  y: number;
}

export type IdSala = string;

/** Una casilla es pasillo o pertenece a una sala. No hay roca impasable:
 *  en HeroQuest todo el interior del tablero se puede pisar. */
export type Region = { tipo: "pasillo" } | { tipo: "sala"; id: IdSala };

export const mismaCelda = (a: Celda, b: Celda): boolean => a.x === b.x && a.y === b.y;

export const claveCelda = (c: Celda): string => `${c.x},${c.y}`;

/** Adyacencia ortogonal: en HeroQuest no existe el movimiento en diagonal. */
export const sonAdyacentes = (a: Celda, b: Celda): boolean =>
  Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
