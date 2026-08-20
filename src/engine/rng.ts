/**
 * Generador aleatorio con semilla.
 *
 * Va dentro del estado de la partida, no en una variable global, y cada tirada
 * devuelve un estado nuevo. Eso da tres cosas de golpe:
 *  - tests deterministas,
 *  - partidas que se pueden guardar y reanudar exactamente donde estaban,
 *  - y repetición: con la semilla y la lista de acciones se reconstruye la
 *    partida entera, que es lo que hace posible el «deshacer».
 *
 * El algoritmo es mulberry32: pequeño, rápido y de calidad de sobra para tirar
 * dados. No sirve para criptografía, y aquí no hace falta.
 */

export interface Rng {
  readonly semilla: number;
}

export const crearRng = (semilla: number): Rng => ({ semilla: semilla >>> 0 });

/** Devuelve un real en [0,1) y el estado siguiente. Nunca muta el que recibe. */
export function siguiente(rng: Rng): [number, Rng] {
  let s = (rng.semilla + 0x6d2b79f5) >>> 0;
  let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const valor = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return [valor, { semilla: s }];
}

/** Entero en [0, n). */
export function entero(rng: Rng, n: number): [number, Rng] {
  const [v, r] = siguiente(rng);
  return [Math.floor(v * n), r];
}

/** Tira `veces` y devuelve todos los resultados junto al estado final. */
export function tandas<T>(
  rng: Rng,
  veces: number,
  tirada: (r: Rng) => [T, Rng],
): [T[], Rng] {
  const out: T[] = [];
  let r = rng;
  for (let i = 0; i < veces; i++) {
    const [v, r2] = tirada(r);
    out.push(v);
    r = r2;
  }
  return [out, r];
}

/** Elige un elemento al azar. Devuelve undefined si la lista está vacía. */
export function elegir<T>(rng: Rng, xs: readonly T[]): [T | undefined, Rng] {
  if (xs.length === 0) return [undefined, rng];
  const [i, r] = entero(rng, xs.length);
  return [xs[i], r];
}
