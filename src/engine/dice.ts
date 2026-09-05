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

/**
 * Cómo se lee un dado corriente de `lados` caras como si fuera un dado de
 * combate: qué números valen por cada cara, en tramos consecutivos.
 *
 * En la mesa no tenemos los dados de la caja, sino d6 normales y un
 * dodecaédrico. Como el dado de combate reparte sus seis caras en 3/2/1, un d6
 * vale directamente (1-3 calavera, 4-5 escudo blanco, 6 escudo negro) y el d12
 * también, doblando cada tramo. Cualquier dado con un número de caras múltiplo
 * de seis conserva las probabilidades exactas.
 *
 * Se calcula a partir de `CARAS_COMBATE` en vez de escribirse a mano para que
 * la pantalla de instrucciones no pueda contradecir al motor: si algún día
 * cambia el reparto de caras, la tabla que leen los niños cambia con él.
 */
export function equivalenciaDeDados(
  lados: number,
): Array<{ cara: CaraCombate; numeros: number[] }> {
  if (lados <= 0 || lados % CARAS_COMBATE.length !== 0) {
    throw new Error(`Un dado de ${lados} caras no reparte las seis del de combate por igual`);
  }
  const porCara = lados / CARAS_COMBATE.length;
  const tramos: Array<{ cara: CaraCombate; numeros: number[] }> = [];
  CARAS_COMBATE.forEach((cara, i) => {
    const numeros = Array.from({ length: porCara }, (_, k) => i * porCara + k + 1);
    const ultimo = tramos[tramos.length - 1];
    if (ultimo && ultimo.cara === cara) ultimo.numeros.push(...numeros);
    else tramos.push({ cara, numeros });
  });
  return tramos;
}

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
