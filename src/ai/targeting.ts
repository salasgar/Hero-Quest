/**
 * A quién ataca un monstruo cuando puede elegir.
 *
 * **Todo lo de aquí es una hipótesis, no una regla del juego.** El reglamento no
 * dice a quién ataca un monstruo porque presupone un máster humano decidiéndolo,
 * y esa decisión es justo la que esta aplicación le quita de encima al adulto.
 * Por eso los pesos van separados, con nombre y en un objeto que se puede
 * sustituir: **T9 los tuerce por personalidad y T10 mide si aciertan.** Una
 * fórmula de una línea con cinco sumandos y sin desglose es lo que después nadie
 * se atreve a tocar.
 *
 * Lo que **no** es hipótesis es el daño esperado: sale de los dados que tira cada
 * figura y del reparto de caras del dado de combate, que está en `dice.ts`. Se
 * calcula, no se estima a ojo.
 */

import { CARAS_COMBATE, type CaraCombate } from "../engine/dice";
import { dadosDeAtaque, dadosDeDefensa, modoDeAtaqueContra, type ModoAtaque } from "../engine/combat";
import { alcanzables, pasoAbierto } from "../engine/board";
import {
  claveCelda,
  esHeroe,
  mismaCelda,
  type Celda,
  type EstadoPartida,
  type Figura,
  type Heroe,
} from "../engine/types";

/**
 * Qué parte del dado de combate es cada cara.
 *
 * Se cuenta sobre `CARAS_COMBATE` en vez de escribir 1/2, 1/3 y 1/6 a mano, por
 * el mismo motivo por el que `dice.ts` deriva de ahí su tabla: si algún día
 * cambia el reparto de caras, la táctica cambia con él en vez de quedarse
 * calculando sobre un dado que ya no existe.
 */
const proporcionDe = (cara: CaraCombate): number =>
  CARAS_COMBATE.filter((c) => c === cara).length / CARAS_COMBATE.length;

export const P_CALAVERA = proporcionDe("calavera");
export const P_ESCUDO_BLANCO = proporcionDe("escudoBlanco");
export const P_ESCUDO_NEGRO = proporcionDe("escudoNegro");

/**
 * Cuántos puntos de cuerpo se espera quitarle a `objetivo` de un ataque.
 *
 * Los héroes paran con el escudo blanco (1 de cada 3 caras) y los monstruos con
 * el negro (1 de cada 6), así que la misma cifra de dados de defensa vale la
 * mitad en un monstruo. Puede salir negativo —un ataque flojo contra una momia—,
 * y se deja tal cual: un número negativo dice «ni lo intentes» mejor que un cero.
 */
export function danoEsperado(
  e: EstadoPartida,
  atacante: Figura,
  objetivo: Figura,
  modo: ModoAtaque = "cuerpo",
): number {
  const calaveras = dadosDeAtaque(atacante, modo, e) * P_CALAVERA;
  const escudos =
    dadosDeDefensa(objetivo, e) * (esHeroe(objetivo) ? P_ESCUDO_BLANCO : P_ESCUDO_NEGRO);
  return calaveras - escudos;
}

/**
 * La probabilidad de dejar a `objetivo` en cero de un solo ataque.
 *
 * **No vale usar el daño esperado para esto**, y se descubrió midiendo: la media
 * de un orco contra un héroe es 0,83 puntos, así que «media ≥ cuerpo que le
 * queda» **nunca** se cumple contra un héroe con 1 de cuerpo, y el monstruo
 * pasaba de largo del moribundo. La media dice cuánto se saca por término medio;
 * rematar es una pregunta de cola, no de media.
 *
 * Se calcula exacto, que con estos dados es barato: las calaveras son una
 * binomial de `ataque` dados a 1/2 y los escudos otra de `defensa` dados a 1/3 o
 * 1/6. Ninguna figura del juego pasa de cinco dados.
 */
function binomial(n: number, p: number): number[] {
  const salida: number[] = [];
  let combinaciones = 1;
  for (let k = 0; k <= n; k++) {
    salida.push(combinaciones * p ** k * (1 - p) ** (n - k));
    combinaciones = (combinaciones * (n - k)) / (k + 1);
  }
  return salida;
}

export function probabilidadDeTumbar(
  e: EstadoPartida,
  atacante: Figura,
  objetivo: Figura,
  modo: ModoAtaque = "cuerpo",
): number {
  if (objetivo.cuerpo <= 0) return 0;
  const calaveras = binomial(dadosDeAtaque(atacante, modo, e), P_CALAVERA);
  const escudos = binomial(
    dadosDeDefensa(objetivo, e),
    esHeroe(objetivo) ? P_ESCUDO_BLANCO : P_ESCUDO_NEGRO,
  );

  let total = 0;
  calaveras.forEach((pc, k) => {
    escudos.forEach((pe, j) => {
      if (Math.max(0, k - j) >= objetivo.cuerpo) total += pc * pe;
    });
  });
  return total;
}

/**
 * Cuántos pasos le faltan a este monstruo para poder pegarle a este héroe.
 *
 * **No es la distancia hasta el héroe, y la diferencia no es un matiz.** La
 * casilla del héroe está ocupada por el héroe, así que `distancia()` —que mide
 * hasta una casilla libre— devuelve `Infinity` contra cualquier objetivo vivo, y
 * una puntuación construida sobre eso deja a todos los héroes en `-Infinity` y a
 * los monstruos sin nadie a quien ir. Se midió: fue el primer fallo de esta
 * tarea.
 *
 * Lo que se mide es el camino hasta la casilla más barata **desde la que se le
 * puede pegar**: cero si ya está al lado. Se exige `pasoAbierto` entre esa
 * casilla y el héroe, porque estar pared con pared no es estar al lado.
 *
 * `mapa` se pasa desde fuera para recorrer el tablero una vez por monstruo en
 * lugar de una vez por héroe.
 */
const VECINAS: readonly Celda[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

/**
 * Un recorrido que no se corta por falta de movimiento: aquí se pregunta «¿está
 * a mi alcance en algún momento?», no «¿llego este turno?».
 */
const ALCANCE = 60;

export const mapaDePasos = (e: EstadoPartida, monstruo: Figura) =>
  alcanzables(e, monstruo, ALCANCE);

export function pasosParaAtacar(
  e: EstadoPartida,
  monstruo: Figura,
  objetivo: Heroe,
  mapa = mapaDePasos(e, monstruo),
): number {
  let mejor = Infinity;
  for (const d of VECINAS) {
    const desde: Celda = { x: objetivo.celda.x + d.x, y: objetivo.celda.y + d.y };
    if (!pasoAbierto(e, desde, objetivo.celda)) continue;
    const pasos = mismaCelda(desde, monstruo.celda)
      ? 0
      : (mapa.get(claveCelda(desde))?.coste ?? Infinity);
    if (pasos < mejor) mejor = pasos;
  }
  return mejor;
}

/**
 * Los pesos de la puntuación. Cada uno multiplica a un término con nombre, y el
 * desglose que devuelve `puntuarObjetivo` los enseña por separado.
 */
export interface Pesos {
  /** Lo que vale cada punto de cuerpo que se espera quitarle. */
  danoEsperado: number;
  /**
   * Lo que vale rematar, **multiplicado por la probabilidad de conseguirlo**. Un
   * héroe caído deja de pegar para siempre, y eso vale mucho más que repartir
   * arañazos entre cuatro. Al ir por probabilidad y no por un umbral, no hay
   * salto: un moribundo al que casi seguro se tumba puntúa más que otro al que
   * quizá.
   */
  remate: number;
  /** Por cada punto de cuerpo que ya ha perdido. Se acaba lo empezado. */
  heridoPrimero: number;
  /**
   * Por cada hechizo que al héroe le queda **sin lanzar**. Es el sesgo «id a por
   * el mago», escrito por lo que ese héroe puede hacerle a Zargon y no por su
   * clase: una misión futura con otro lanzador lo hereda sin tocar nada.
   *
   * Se contó primero por puntos de mente, y estaba mal por dos motivos. Uno, que
   * la mente es un sustituto: el enano tiene 3 y no lanza nada, así que la
   * pantalla llegó a decir en la mesa «el enano lanza hechizos», que es
   * mentira. Y dos, que **cada carta se lanza una vez y se descarta**: un mago
   * que ya ha gastado los nueve es un objetivo con 4 de cuerpo y una daga, y la
   * táctica tiene que enterarse sola según avanza la misión.
   */
  lanzaHechizos: number;
  /** Penalización por casilla de distancia. Lo que está lejos vale menos. */
  porCasillaDeDistancia: number;
  /**
   * Lo que se descuenta a una casilla desde la que **todavía no se puede
   * atacar**. Es la diferencia entre una jugada y una intención.
   *
   * Sin este descuento, un monstruo con un héroe pegado y el mago a cinco
   * casillas se va andando hacia el mago **y no ataca a nadie**, porque la
   * casilla intermedia puntúa por la promesa. En la mesa eso se lee como que la
   * aplicación se ha despistado, y con niños delante no hay forma de explicarlo.
   *
   * Solo cambia algo cuando hay elección: si no se puede atacar desde ninguna
   * casilla, el descuento es el mismo para todas y el orden no se mueve.
   */
  descuentoPorNoLlegar: number;
}

/**
 * Los pesos de partida.
 *
 * Las cifras salen de una idea sencilla: **rematar manda sobre todo lo demás**,
 * el daño esperado decide entre los que no se pueden rematar, y la mente y las
 * heridas solo desempatan. Están puestas para que se puedan medir, no porque se
 * sepa que son las buenas: eso lo dirá T10.
 */
export const PESOS: Pesos = {
  danoEsperado: 10,
  remate: 25,
  heridoPrimero: 3,
  // Uno por hechizo sin gastar: el mago recién salido de la escalera vale nueve
  // puntos más que el bárbaro, que es un sesgo fuerte pero no tanto como para
  // que un monstruo cruce la sala dejándose un ataque servido por el camino.
  lanzaHechizos: 1,
  porCasillaDeDistancia: 1,
  descuentoPorNoLlegar: 15,
};

/**
 * Los pesos que puntúan a un objetivo. `descuentoPorNoLlegar` queda fuera porque
 * no es del objetivo sino de la casilla desde la que se le mira, y mezclarlos
 * haría que el desglose enseñara un término que no depende del héroe.
 */
export type TerminoDeObjetivo = Exclude<keyof Pesos, "descuentoPorNoLlegar">;

export interface Puntuacion {
  objetivo: Heroe;
  total: number;
  /** Cada término por separado, para que T10 pueda mirarlos y T9 torcerlos. */
  desglose: Record<TerminoDeObjetivo, number>;
  /** Si puede atacarlo desde donde está ahora, y de qué manera. */
  modo: ModoAtaque | null;
}

/**
 * Cómo de apetecible es este héroe como objetivo de este monstruo.
 *
 * La distancia entra aquí, y no solo al elegir camino, porque la pregunta que
 * contesta esta función es «¿a por quién voy?»: un mago a doce casillas detrás de
 * dos puertas cerradas no es un objetivo, es una intención.
 */
export function puntuarObjetivo(
  e: EstadoPartida,
  monstruo: Figura,
  objetivo: Heroe,
  pesos: Pesos = PESOS,
  mapa = mapaDePasos(e, monstruo),
): Puntuacion {
  const modo = modoDeAtaqueContra(e, monstruo, objetivo);
  const dano = danoEsperado(e, monstruo, objetivo, modo ?? "cuerpo");
  // A quien no se llega no se le puntúa la cercanía: multiplicar `Infinity` por
  // un peso contamina la suma entera.
  const lejania = pasosParaAtacar(e, monstruo, objetivo, mapa);
  const alcanzable = Number.isFinite(lejania);

  const desglose: Record<TerminoDeObjetivo, number> = {
    danoEsperado: dano * pesos.danoEsperado,
    remate: probabilidadDeTumbar(e, monstruo, objetivo, modo ?? "cuerpo") * pesos.remate,
    heridoPrimero: (objetivo.cuerpoMax - objetivo.cuerpo) * pesos.heridoPrimero,
    lanzaHechizos: hechizosSinGastar(objetivo) * pesos.lanzaHechizos,
    porCasillaDeDistancia: alcanzable ? -lejania * pesos.porCasillaDeDistancia : 0,
  };

  const total = alcanzable
    ? Object.values(desglose).reduce((s, x) => s + x, 0)
    : // Sin camino no hay objetivo. `-Infinity` lo deja el último sin casos
      // especiales en quien ordena, y sin fingir que un cero es «regular».
      -Infinity;

  return { objetivo, total, desglose, modo };
}

const vivos = (xs: readonly Heroe[]): Heroe[] => xs.filter((h) => h.cuerpo > 0);

/** Hechizos que le quedan por lanzar. Cada carta se usa una vez por misión. */
export const hechizosSinGastar = (h: Heroe): number =>
  h.hechizos.filter((id) => !h.hechizosGastados.includes(id)).length;

/**
 * Todos los héroes puntuados, de mejor a peor. Puro: mismo estado, mismo orden.
 *
 * El desempate va por identificador y está escrito, no dejado al `sort`: con
 * cuatro héroes recién salidos de la escalera los empates son la norma, y
 * `Array.prototype.sort` solo promete ser estable respecto al orden de entrada.
 */
export function objetivosPuntuados(
  e: EstadoPartida,
  monstruo: Figura,
  pesos: Pesos = PESOS,
): Puntuacion[] {
  // Un solo recorrido del tablero para los cuatro héroes. Con esto dentro del
  // bucle, puntuar una casilla candidata costaba un recorrido por héroe.
  const mapa = mapaDePasos(e, monstruo);
  return vivos(e.heroes)
    .map((h) => puntuarObjetivo(e, monstruo, h, pesos, mapa))
    .sort((a, b) => b.total - a.total || a.objetivo.id.localeCompare(b.objetivo.id));
}

/** El mejor objetivo, o `null` si no queda ninguno al que se pueda llegar. */
export function mejorObjetivo(
  e: EstadoPartida,
  monstruo: Figura,
  pesos: Pesos = PESOS,
): Puntuacion | null {
  const [mejor] = objetivosPuntuados(e, monstruo, pesos);
  return mejor && Number.isFinite(mejor.total) ? mejor : null;
}
