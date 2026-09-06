/**
 * La personalidad de cada especie: cómo tuerce los pesos de T8.
 *
 * **Todo esto es hipótesis nuestra, no regla del juego**, igual que los pesos
 * base: el reglamento presupone un máster humano y no dice cómo juega un goblin.
 * Por eso cada personalidad es un puñado de multiplicadores con nombre sobre
 * `Pesos`, y no una táctica aparte: **sesga la puntuación de T8, no la
 * sustituye**, que es lo que manda T9. Si una especie necesitara un término que
 * `Pesos` no tiene —miedo a la respuesta, por ejemplo—, eso es ensanchar la
 * puntuación base y es una conversación con T8, no un número aquí.
 *
 * Ninguna cifra está medida: están puestas para que T10 las mida, como las de
 * `targeting.ts`.
 */

import type { EspecieMonstruo } from "../data/monsters";
import type { Pesos } from "./targeting";

export interface Personalidad {
  /** Para la pantalla y para leerse en la mesa: «el goblin es cobarde». */
  nombre: string;
  /**
   * Multiplicadores término a término sobre los pesos que lleguen. Lo que no se
   * nombra queda en ×1: una personalidad dice en qué se fija de más o de menos
   * esa especie, no redefine la táctica entera.
   */
  sesgos: Partial<Record<keyof Pesos, number>>;
}

/**
 * Una por especie, exhaustivo a propósito: si mañana entra una especie nueva en
 * `monsters.ts`, esto deja de compilar y la decisión de cómo juega se toma en
 * vez de heredarse por accidente.
 */
export const PERSONALIDADES: Readonly<Record<EspecieMonstruo, Personalidad>> = {
  // Se ceba con los heridos y no se aleja del rincón donde está: pegar al que
  // ya sangra es lo que haría un matón asustado, y cruzar el tablero él solo, no.
  goblin: { nombre: "cobarde", sesgos: { heridoPrimero: 2.5, porCasillaDeDistancia: 3 } },
  // Va al bulto: le importa cuánto daño mete, no a quién le quedan hechizos.
  orco: { nombre: "bruto", sesgos: { danoEsperado: 1.5, lanzaHechizos: 0.5 } },
  // Disfruta rematando al que está en el suelo.
  fimir: { nombre: "maton", sesgos: { remate: 1.5 } },
  // La línea de base sin sesgos, a propósito: en los tests hace de control, y
  // un esqueleto que obedece órdenes sin criterio propio es además la ficción
  // correcta.
  esqueleto: { nombre: "implacable", sesgos: {} },
  // La distancia no le desanima: anda poco (movimiento 4) pero nunca cambia de
  // opinión por lejanía. El descuento por no llegar NO se toca: sin él, el
  // zombi con un héroe al lado se iría andando a por otro, que es el fallo que
  // T8 pagó por descubrir.
  zombi: { nombre: "terco", sesgos: { porCasillaDeDistancia: 0.5 } },
  momia: { nombre: "paciente", sesgos: { porCasillaDeDistancia: 0.5 } },
  // El campeón de Zargon caza al que puede hacerle daño de verdad: quien aún
  // guarda hechizos.
  guerreroDelCaos: { nombre: "cazador", sesgos: { lanzaHechizos: 3 } },
  // Guarda su sala: pega fuerte a lo que tiene cerca y no persigue por gusto.
  gargola: { nombre: "centinela", sesgos: { porCasillaDeDistancia: 2 } },
  // Piensa como Zargon: remata lo que puede morir y no pierde ataques en
  // arañazos improbables.
  hechiceroDelCaos: { nombre: "calculador", sesgos: { remate: 1.5, danoEsperado: 0.8 } },
  // Con dos casillas por turno, elegir presa lejana es pasarse la misión andando
  // y en la mesa se lee como que la aplicación se ha perdido: va a por el que
  // tiene más cerca, siempre. Torpe también en esto, que es como lo pidió
  // Juan Luis al firmarlo.
  trollDeLasCavernas: { nombre: "lerdo", sesgos: { porCasillaDeDistancia: 2 } },
};

/** Los pesos que llegan, torcidos por la especie. Puro: no toca `base`. */
export function conPersonalidad(base: Pesos, especie: EspecieMonstruo): Pesos {
  const { sesgos } = PERSONALIDADES[especie];
  const salida = { ...base };
  for (const [termino, factor] of Object.entries(sesgos) as [keyof Pesos, number][]) {
    salida[termino] = base[termino] * factor;
  }
  return salida;
}
