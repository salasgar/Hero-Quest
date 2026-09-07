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
 *
 * **T38 añadió abajo una segunda cosa que no es de especie, sino de figura**: el
 * temperamento. La personalidad dice cómo pelea un goblin; el temperamento, si
 * este goblin quiere pelear. Viven en el mismo fichero porque los dos contestan
 * a «cómo se comporta este bicho» y porque el reparto de temperamentos es por
 * especie —un esqueleto nunca sale miedoso—, pero no se mezclan: la
 * personalidad tuerce pesos y el temperamento decide si se huye.
 */

import type { EspecieMonstruo } from "../data/monsters";
import { entero, type Rng } from "../engine/rng";
import {
  esHeroe,
  temperamentoDe,
  type EstadoPartida,
  type Figura,
  type Temperamento,
} from "../engine/types";
import { distanciaAOjo, heroesVivos, type Pesos } from "./targeting";

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
  // Le persigue lo mismo que al guerrero: neutralizar el hechizo antes de que
  // se lance a él, no simplemente pegar.
  brujo: { nombre: "rencoroso", sesgos: { lanzaHechizos: 2, danoEsperado: 0.7 } },
  // Igual de rencorosa, pero paciente: no le penaliza tanto la distancia
  // porque una maldición no tiene prisa.
  bruja: { nombre: "traicionera", sesgos: { remate: 2, porCasillaDeDistancia: 0.7 } },
  // Con diez de movimiento llega a cualquiera igual: la distancia le da casi
  // igual, y se ceba con el que ya sangra porque no tiene fuerza para más.
  arañaGigante: { nombre: "acechante", sesgos: { heridoPrimero: 2, porCasillaDeDistancia: 0.5 } },
  // Guarda su sala y no se mueve por gusto: penaliza la distancia más que la
  // gárgola y todavía más la casilla desde la que no llega.
  monstruoDeArena: { nombre: "inamovible", sesgos: { porCasillaDeDistancia: 3, descuentoPorNoLlegar: 2 } },
  // Un enjambre no razona: remata al que ya está herido, sin fijarse en lo
  // demás.
  rataGigante: { nombre: "enjambre", sesgos: { heridoPrimero: 3 } },
  // Traslúcido y errático: la distancia casi no le cuesta.
  espectro: { nombre: "errático", sesgos: { porCasillaDeDistancia: 0.3 } },
  // Aplasta al que tiene más cerca, sin táctica: no distingue a quien lanza
  // hechizos de quien no.
  ogro: { nombre: "aplastante", sesgos: { danoEsperado: 2, lanzaHechizos: 0.3 } },
  // Guarda su cripta como la gárgola guarda su sala, un poco más paciente.
  serpienteDeLasTumbas: { nombre: "sigilosa", sesgos: { porCasillaDeDistancia: 2.5, heridoPrimero: 1.5 } },
};

// ------------------------------------------------------- temperamento (T38)

/**
 * Con qué probabilidad sale cada temperamento en cada especie.
 *
 * Es el reparto, no la decisión: quién huye de verdad y cuándo lo dice
 * `ganasDeHuir`, más abajo. Las tres cifras de cada fila suman 1; si alguna no
 * sumara, el sorteo seguiría funcionando —reparte por tramos— pero el número
 * dejaría de significar «uno de cada tantos», así que se escriben normalizadas
 * a mano y hay un test que lo comprueba.
 *
 * El criterio es de ficción, no está medido, y se puede discutir entero: **los
 * no muertos no tienen miedo** —un esqueleto obedece a Zargon y no le importa
 * morir dos veces—, los goblins son casi todos miedosos, y las especies que
 * guardan una sala (gárgola, monstruo de arena, serpiente) no huyen porque
 * huir sería abandonar lo que custodian. Lo que sí está medido, y va en la
 * terminada de T38, es qué le hace este reparto al porcentaje de victorias.
 */
export const REPARTO_DE_TEMPERAMENTOS: Readonly<
  Record<EspecieMonstruo, Readonly<Record<Temperamento, number>>>
> = {
  // El cobarde de T9, ahora también en los pies: la mitad de los goblins sale
  // corriendo en cuanto ve el grupo entero.
  goblin: { agresivo: 0.2, miedoso: 0.5, prudente: 0.3 },
  orco: { agresivo: 0.6, miedoso: 0.1, prudente: 0.3 },
  fimir: { agresivo: 0.6, miedoso: 0.1, prudente: 0.3 },
  // Los no muertos, sin miedo por definición.
  esqueleto: { agresivo: 1, miedoso: 0, prudente: 0 },
  zombi: { agresivo: 1, miedoso: 0, prudente: 0 },
  momia: { agresivo: 1, miedoso: 0, prudente: 0 },
  guerreroDelCaos: { agresivo: 0.8, miedoso: 0, prudente: 0.2 },
  // Guarda su sala: no la abandona ni acorralada.
  gargola: { agresivo: 1, miedoso: 0, prudente: 0 },
  // Sabe lo que le conviene: si se le juntan encima, se retira.
  hechiceroDelCaos: { agresivo: 0.3, miedoso: 0.1, prudente: 0.6 },
  trollDeLasCavernas: { agresivo: 0.9, miedoso: 0, prudente: 0.1 },
  brujo: { agresivo: 0.3, miedoso: 0.2, prudente: 0.5 },
  bruja: { agresivo: 0.3, miedoso: 0.2, prudente: 0.5 },
  arañaGigante: { agresivo: 0.5, miedoso: 0.2, prudente: 0.3 },
  monstruoDeArena: { agresivo: 1, miedoso: 0, prudente: 0 },
  // Un enjambre no huye de uno en uno.
  rataGigante: { agresivo: 0.4, miedoso: 0.4, prudente: 0.2 },
  espectro: { agresivo: 0.7, miedoso: 0.1, prudente: 0.2 },
  ogro: { agresivo: 0.8, miedoso: 0, prudente: 0.2 },
  serpienteDeLasTumbas: { agresivo: 1, miedoso: 0, prudente: 0 },
};

const TEMPERAMENTOS: readonly Temperamento[] = ["agresivo", "miedoso", "prudente"];

/**
 * Un temperamento para esta especie, con su reparto.
 *
 * Sortea sobre milésimas con `entero`, que es el único generador del proyecto:
 * un `Math.random()` aquí haría que la misma semilla diera dos partidas
 * distintas, y con ella se van los cuarenta y tantos tests que fijan semilla.
 */
export function sortearTemperamento(
  especie: EspecieMonstruo,
  rng: Rng,
): [Temperamento, Rng] {
  const reparto = REPARTO_DE_TEMPERAMENTOS[especie];
  const [tirada, siguiente] = entero(rng, 1000);
  let acumulado = 0;
  for (const t of TEMPERAMENTOS) {
    acumulado += reparto[t] * 1000;
    if (tirada < acumulado) return [t, siguiente];
  }
  // Solo se llega aquí si la fila no suma 1 y la tirada cae en el sobrante.
  return ["agresivo", siguiente];
}

/** Un temperamento por monstruo, en orden y con un solo generador. */
export function repartirTemperamentos(
  monstruos: ReadonlyArray<{ especie: EspecieMonstruo; temperamento?: Temperamento }>,
  rng: Rng,
): Temperamento[] {
  let r = rng;
  return monstruos.map((m) => {
    // El que fija la misión **gasta su tirada igual** y la tira a la basura. Es
    // al revés de lo que parece: si no la gastara, cada monstruo fijado correría
    // la corriente un puesto y cambiaría el temperamento de todos los que vienen
    // detrás. Así, ponerle un temperamento a un jefe no toca a nadie más.
    const [sorteado, siguiente] = sortearTemperamento(m.especie, r);
    r = siguiente;
    return m.temperamento ?? sorteado;
  });
}

/**
 * A cuántas casillas mira el prudente para contar cuántos héroes tiene encima.
 * Cuatro es «los que pueden llegar a pegarme en su turno»: casi todos los
 * héroes tiran 2 dados de movimiento.
 */
export const CERCA_PARA_EL_PRUDENTE = 4;

/** A partir de cuántos héroes cerca el prudente prefiere retirarse. */
export const HEROES_QUE_ASUSTAN = 3;

/**
 * Más allá de esta distancia, alejarse ya no tranquiliza a nadie.
 *
 * Sin este tope, un miedoso con sitio por delante **se pasa la partida
 * corriendo** —cada casilla de más puntúa igual que la anterior— y la misión no
 * termina nunca: es la trampa que la ficha de T38 mandaba medir. Con él, huye
 * hasta ponerse a salvo y ahí se planta, que además es lo que se entiende al
 * verlo en la mesa.
 */
export const DISTANCIA_QUE_TRANQUILIZA = 6;

/**
 * Cuánto quiere irse este monstruo de donde está: 1 si quiere, 0 si no.
 *
 * **Se pregunta una vez, en la casilla donde está el monstruo**, y el resultado
 * vale para puntuar todas las casillas candidatas de esa jugada. Si se
 * preguntara casilla a casilla, el prudente que se aleja dejaría de tener
 * héroes cerca en la casilla de destino, sus ganas de huir caerían a cero allí
 * y la huida no puntuaría: decidiría no huir por haber huido.
 *
 * No mira si hay por dónde escapar. Eso lo contesta la puntuación sola: si
 * ninguna casilla lo aleja, el término vale lo mismo en todas y gana lo que
 * gane por lo demás, que estando acorralado es atacar.
 */
export function ganasDeHuir(e: EstadoPartida, monstruo: Figura): number {
  if (esHeroe(monstruo)) return 0;
  switch (temperamentoDe(monstruo)) {
    case "agresivo":
      return 0;
    case "miedoso":
      return 1;
    case "prudente":
      return heroesCerca(e, monstruo) >= HEROES_QUE_ASUSTAN ? 1 : 0;
  }
}

/** Héroes vivos a `CERCA_PARA_EL_PRUDENTE` casillas o menos, a ojo. */
export function heroesCerca(e: EstadoPartida, monstruo: Figura): number {
  return heroesVivos(e).filter(
    (h) => distanciaAOjo(h.celda, monstruo.celda) <= CERCA_PARA_EL_PRUDENTE,
  ).length;
}

/** Los pesos que llegan, torcidos por la especie. Puro: no toca `base`. */
export function conPersonalidad(base: Pesos, especie: EspecieMonstruo): Pesos {
  const { sesgos } = PERSONALIDADES[especie];
  const salida = { ...base };
  for (const [termino, factor] of Object.entries(sesgos) as [keyof Pesos, number][]) {
    salida[termino] = base[termino] * factor;
  }
  return salida;
}
