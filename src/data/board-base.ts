/**
 * Geometría del tablero base de HeroQuest (edición Avalon Hill 2021).
 *
 * Transcrito de la foto del tablero en `public/tablero-referencia.webp`
 * ajustando la rejilla a los píxeles: 26 x 19 casillas de 25,9 px.
 *
 * Este fichero es GEOMETRÍA FIJA: nunca cambia entre misiones. Lo que sí varía
 * por misión (puertas, mobiliario, monstruos, trampas, tesoros) vive en los
 * ficheros de misión, no aquí.
 *
 * El mapa ASCII es la fuente de la verdad: una letra por sala, '.' para pasillo.
 * Si alguna casilla no coincide con tu tablero físico, corrígela en la pantalla
 * de verificación (`/verificar`) y pega aquí el mapa que te genere.
 */

import type { Celda, IdSala, Region } from "../engine/types";

export const ANCHO_TABLERO = 26;
export const ALTO_TABLERO = 19;

// prettier-ignore
export const MAPA_TABLERO: readonly string[] = [
  //01234567890123456789012345
  "..........................", //  0
  ".aaaabbbbccc..dddeeeeffff.", //  1
  ".aaaabbbbccc..dddeeeeffff.", //  2
  ".aaaabbbbccc..dddeeeeffff.", //  3
  ".gggghhhhccc..dddeeeeffff.", //  4
  ".gggghhhhccc..dddiiiijjjj.", //  5
  ".gggghhhh........iiiijjjj.", //  6
  ".gggghhhh.kkkkkk.iiiijjjj.", //  7
  ".gggghhhh.kkkkkk.iiiijjjj.", //  8
  "..........kkkkkk..........", //  9
  ".llllmmnn.kkkkkk.oooopppp.", // 10
  ".llllmmnn.kkkkkk.oooopppp.", // 11
  ".llllmmnn........oooopppp.", // 12
  ".llllrrrrsss..ttttooopppp.", // 13
  ".qqqqrrrrsss..ttttuuuvvvv.", // 14
  ".qqqqrrrrsss..ttttuuuvvvv.", // 15
  ".qqqqrrrrsss..ttttuuuvvvv.", // 16
  ".qqqqrrrrsss..ttttuuuvvvv.", // 17
  "..........................", // 18
];

/** Nombres provisionales, tomados del aspecto del suelo de cada sala.
 *  Se renombran cuando cada misión les dé un nombre propio. */
export const NOMBRES_SALAS: Readonly<Record<string, string>> = {
  a: "Sala de la tarima",
  b: "Sala de losas rojas",
  c: "Sala turquesa",
  d: "Sala de roca roja",
  e: "Sala gris azulada",
  f: "Sala de ladrillo ocre",
  g: "Sala oscura",
  h: "Sala verde oliva",
  i: "Sala del enrejado",
  j: "Sala verde amarillenta",
  k: "Sala central",
  l: "Sala dorada",
  m: "Sala de los rombos",
  n: "Sala turquesa agrietada",
  o: "Sala ajedrezada",
  p: "Sala de las aspas",
  q: "Sala de piedra gris",
  r: "Sala salmón",
  s: "Sala ámbar",
  t: "Sala roja",
  u: "Sala naranja",
  v: "Sala verde agrietada",
};

export const dentroDelTablero = (x: number, y: number): boolean =>
  x >= 0 && y >= 0 && x < ANCHO_TABLERO && y < ALTO_TABLERO;

/** Letra del mapa en una casilla, o null si cae fuera del tablero. */
export function claveEn(x: number, y: number): string | null {
  if (!dentroDelTablero(x, y)) return null;
  return MAPA_TABLERO[y]![x]!;
}

export function regionEn(x: number, y: number): Region | null {
  const k = claveEn(x, y);
  if (k === null) return null;
  return k === "." ? { tipo: "pasillo" } : { tipo: "sala", id: k };
}

/** Id de la sala en una casilla, o null si es pasillo o cae fuera. */
export function salaEn(x: number, y: number): IdSala | null {
  const k = claveEn(x, y);
  return k === null || k === "." ? null : k;
}

export function esPasillo(x: number, y: number): boolean {
  return claveEn(x, y) === ".";
}

/**
 * ¿Hay un muro entre dos casillas ortogonalmente adyacentes?
 *
 * La regla del tablero de HeroQuest es simple: dos casillas están comunicadas
 * si pertenecen a la misma región (las dos al mismo cuarto, o las dos a
 * pasillo). Cualquier cambio de región es un muro. Las puertas son datos de
 * misión y se colocan encima de estos muros para abrirlos.
 */
export function hayMuroEntre(a: Celda, b: Celda): boolean {
  const ka = claveEn(a.x, a.y);
  const kb = claveEn(b.x, b.y);
  if (ka === null || kb === null) return true; // el borde del tablero es muro
  return ka !== kb;
}

/** Todas las casillas de una sala. */
export function celdasDeSala(id: IdSala): Celda[] {
  const out: Celda[] = [];
  for (let y = 0; y < ALTO_TABLERO; y++)
    for (let x = 0; x < ANCHO_TABLERO; x++) if (MAPA_TABLERO[y]![x] === id) out.push({ x, y });
  return out;
}

/** Ids de todas las salas presentes en el mapa, en orden alfabético. */
export function idsDeSalas(): IdSala[] {
  const s = new Set<string>();
  for (const fila of MAPA_TABLERO) for (const c of fila) if (c !== ".") s.add(c);
  return [...s].sort();
}

/** Rectángulo que envuelve una sala. Útil para centrar la vista y para el editor. */
export function marcoDeSala(id: IdSala): { x0: number; y0: number; x1: number; y1: number } | null {
  const celdas = celdasDeSala(id);
  if (celdas.length === 0) return null;
  return {
    x0: Math.min(...celdas.map((c) => c.x)),
    y0: Math.min(...celdas.map((c) => c.y)),
    x1: Math.max(...celdas.map((c) => c.x)),
    y1: Math.max(...celdas.map((c) => c.y)),
  };
}

/** Vecinas ortogonales dentro del tablero, sin tener en cuenta muros. */
export function vecinas(c: Celda): Celda[] {
  const d = [
    { x: c.x + 1, y: c.y },
    { x: c.x - 1, y: c.y },
    { x: c.x, y: c.y + 1 },
    { x: c.x, y: c.y - 1 },
  ];
  return d.filter((n) => dentroDelTablero(n.x, n.y));
}
