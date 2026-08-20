/**
 * Los dados de HeroQuest.
 *
 * Hay dos clases:
 *  - los dados rojos normales de seis caras, que se usan para el movimiento;
 *  - los dados de combate, con 3 calaveras, 2 escudos blancos y 1 escudo negro.
 *
 * Reparto del dado de combate: calavera 1/2, escudo blanco 1/3, escudo negro 1/6.
 * Los héroes se defienden con los escudos blancos y los monstruos con el negro,
 * que es justo por lo que los monstruos son más frágiles de lo que sugiere su
 * número de dados de defensa.
 */

import { entero, tandas, type Rng } from "./rng";

export type CaraCombate = "calavera" | "escudoBlanco" | "escudoNegro";

/** Las seis caras del dado de combate, en orden. */
export const CARAS_COMBATE: readonly CaraCombate[] = [
  "calavera",
  "calavera",
  "calavera",
  "escudoBlanco",
  "escudoBlanco",
  "escudoNegro",
];

export function tirarDadoCombate(rng: Rng): [CaraCombate, Rng] {
  const [i, r] = entero(rng, 6);
  return [CARAS_COMBATE[i]!, r];
}

export function tirarDadosCombate(rng: Rng, cuantos: number): [CaraCombate[], Rng] {
  return tandas(rng, cuantos, tirarDadoCombate);
}

/** Un dado de seis caras corriente, de 1 a 6. */
export function tirarD6(rng: Rng): [number, Rng] {
  const [i, r] = entero(rng, 6);
  return [i + 1, r];
}

/** La tirada de movimiento: dos dados rojos. */
export function tirarMovimiento(rng: Rng): [[number, number], Rng] {
  const [a, r1] = tirarD6(rng);
  const [b, r2] = tirarD6(r1);
  return [[a, b], r2];
}

export const contarCalaveras = (caras: readonly CaraCombate[]): number =>
  caras.filter((c) => c === "calavera").length;

export const contarEscudosBlancos = (caras: readonly CaraCombate[]): number =>
  caras.filter((c) => c === "escudoBlanco").length;

export const contarEscudosNegros = (caras: readonly CaraCombate[]): number =>
  caras.filter((c) => c === "escudoNegro").length;
