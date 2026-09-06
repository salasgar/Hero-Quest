/**
 * «El calabozo del guardián» — primera misión, escrita a mano.
 *
 * Corta y ganable: cuatro salas, seis monstruos y un jefe blando (un fimir, no
 * un guerrero del caos) para que la primera partida con niños se gane.
 *
 * Los héroes entran por las columnas 12-13, que es el único tramo de pasillo de
 * DOS casillas de ancho del tablero. Importa, y de dos maneras: en un pasillo de
 * una sola casilla los cuatro se hacen tapón y el primero no puede ni salir,
 * porque en HeroQuest no se atraviesan las figuras; y colocados en dos filas de
 * dos, la de delante tiene que quedar mirando hacia dentro de la mazmorra, o se
 * queda encajonada por la de atrás.
 */

import type { Celda, Mision, Mueble, Puerta, Trampa } from "../../engine/types";
import type { EspecieMonstruo } from "../monsters";

const c = (x: number, y: number): Celda => ({ x, y });

export const MISION_CALABOZO: Mision = {
  id: "calabozo",
  titulo: "El calabozo del guardián",
  introduccion:
    "Bajo el castillo hay un calabozo que nadie ha vuelto a abrir en cien años. " +
    "Dicen que algo se quedó dentro montando guardia, y que todavía espera. " +
    "Vosotros vais a averiguar qué.",
  /**
   * Fila india por el pasillo de abajo, con el bárbaro en cabeza.
   *
   * Era un rectángulo de dos de ancho (columnas 12-13, filas 17-18), y eso no
   * fue diseño sino parche: con la regla vieja los cuatro héroes se taponaban
   * porque nadie podía cruzar a nadie. Con la regla de la p. 12 en pie —«You
   * may pass over other heroes»— el parche sobra, y una entrada de dos de ancho
   * no es lo que hay en el tablero. Autorizado por Juan Luis el 2026-08-22.
   *
   * La fila 18 es pasillo de punta a punta, con sala por encima y el borde del
   * tablero por debajo, así que la fila es contigua de verdad y no roza ninguna
   * puerta, mueble ni trampa. La columna 12 en vertical era la otra opción
   * evidente y **no vale**: (12,15) es el vano de la puerta `ps`, y dejaría a un
   * héroe empezando dentro de la puerta que el grupo tiene que abrir.
   */
  entrada: [c(12, 18), c(11, 18), c(10, 18), c(9, 18)],
  textosDeSala: {
    s: "Una sala de piedra ámbar. Hay huesos pequeños amontonados en un rincón.",
    t: "Paredes rojizas y una mesa larga volcada. Todavía huele a humo.",
    r: "El techo gotea. Cada gota suena como un paso a tu espalda.",
    q: "La piedra gris está cubierta de arañazos. Alguien intentó salir de aquí a manotazos.",
    l: "Un cuarto dorado y silencioso. Demasiado silencioso.",
  },
  objetivo: { clase: "matarA", figura: "guardian" },
};

/**
 * Las puertas de la misión, una por sala como mínimo.
 *
 * El tablero dibuja veintidós salas y la misión solo daba entrada a cinco: las
 * otras diecisiete eran cuartos pintados detrás de un muro cerrado, que se ven
 * en la mesa y no se pueden pisar. Juan Luis lo pidió el 2026-09-06: «todas
 * deben ser accesibles desde algún sitio».
 *
 * Criterio con el que están puestas, por si hay que mover alguna:
 *
 *  - **Cada sala tiene una puerta normal**, casi siempre al pasillo más cercano.
 *    Las salas del borde (a, b, e, f, g, l, p, u, v) salen al pasillo perimetral;
 *    las de en medio (c, d, h, i, j, k, m, n, o) a los pasillos interiores.
 *  - **Ninguna sala depende de una secreta para entrar.** Es la regla que hace
 *    la misión ganable pase lo que pase: si nadie registra en busca de puertas
 *    secretas, se puede recorrer el calabozo entero igual. La sala dorada `l`
 *    colgaba de `psecreta` y ahora tiene la suya (`pl`), con lo que la secreta
 *    pasa a ser lo que debía ser: un atajo, no la única entrada.
 *  - **Las secretas van siempre encima de una sala que ya tiene su puerta
 *    normal.** Lo que dan es camino, no acceso: un atajo que se ahorra media
 *    vuelta al tablero. Así buscar puertas secretas sigue mereciendo la pena
 *    sin que la misión se atasque si nadie busca.
 *  - **Ningún vano se comparte y ninguna casilla de apertura se solapa**, para
 *    que las seis casillas que abren cada puerta (T19) no abran dos a la vez.
 *
 * Veintidós normales y tres secretas: caben en las 25 puertas y los 4
 * marcadores que dice `furniture.ts` que hay construidos de cartón.
 *
 * Lo que esto NO hace, a propósito (`_COMUN.md`: nada de inventarse diseño):
 * no añade monstruos, ni muebles, ni textos de sala a las diecisiete salas
 * nuevas. Se abren vacías, y llenarlas es diseño de misión aparte.
 */
export const PUERTAS_CALABOZO: Puerta[] = [
  // Las cuatro de la misión original, las de las salas con monstruo.
  { id: "ps", a: c(12, 15), b: c(11, 15), abierta: false, secreta: false, descubierta: true },
  { id: "pt", a: c(13, 14), b: c(14, 14), abierta: false, secreta: false, descubierta: true },
  { id: "pr", a: c(6, 18), b: c(6, 17), abierta: false, secreta: false, descubierta: true },
  { id: "pq", a: c(0, 15), b: c(1, 15), abierta: false, secreta: false, descubierta: true },

  // Fila de arriba, al pasillo del borde norte y a los dos pasillos verticales.
  { id: "pa", a: c(2, 0), b: c(2, 1), abierta: false, secreta: false, descubierta: true },
  { id: "pb", a: c(6, 0), b: c(6, 1), abierta: false, secreta: false, descubierta: true },
  { id: "pc", a: c(12, 3), b: c(11, 3), abierta: false, secreta: false, descubierta: true },
  { id: "pd", a: c(13, 3), b: c(14, 3), abierta: false, secreta: false, descubierta: true },
  { id: "pe", a: c(18, 0), b: c(18, 1), abierta: false, secreta: false, descubierta: true },
  { id: "pf", a: c(22, 0), b: c(22, 1), abierta: false, secreta: false, descubierta: true },

  // Franja de en medio. La sala central `k` abre al pasillo de la fila 6.
  { id: "pg", a: c(0, 6), b: c(1, 6), abierta: false, secreta: false, descubierta: true },
  { id: "ph", a: c(9, 7), b: c(8, 7), abierta: false, secreta: false, descubierta: true },
  { id: "pi", a: c(16, 7), b: c(17, 7), abierta: false, secreta: false, descubierta: true },
  { id: "pj", a: c(22, 9), b: c(22, 8), abierta: false, secreta: false, descubierta: true },
  { id: "pk", a: c(12, 6), b: c(12, 7), abierta: false, secreta: false, descubierta: true },

  // Franja de abajo. `pl` es la que quita a la sala dorada de depender de la
  // secreta; `pp` sale al pasillo del borde este porque encima tiene a `pj`.
  { id: "pl", a: c(0, 11), b: c(1, 11), abierta: false, secreta: false, descubierta: true },
  { id: "pm", a: c(5, 9), b: c(5, 10), abierta: false, secreta: false, descubierta: true },
  { id: "pn", a: c(8, 9), b: c(8, 10), abierta: false, secreta: false, descubierta: true },
  { id: "po", a: c(16, 11), b: c(17, 11), abierta: false, secreta: false, descubierta: true },
  { id: "pp", a: c(25, 12), b: c(24, 12), abierta: false, secreta: false, descubierta: true },
  { id: "pu", a: c(19, 18), b: c(19, 17), abierta: false, secreta: false, descubierta: true },
  { id: "pv", a: c(22, 18), b: c(22, 17), abierta: false, secreta: false, descubierta: true },

  // Las tres secretas. Todas son prescindibles: cada una de las salas que
  // tocan tiene ya su puerta normal, así que ninguna hace falta para terminar.
  // Un atajo escondido entre la sala de piedra gris y el cuarto dorado.
  { id: "psecreta", a: c(4, 13), b: c(4, 14), abierta: false, secreta: true, descubierta: false },
  // Salida trasera de la sala central al pasillo del sur: quien la encuentre se
  // ahorra volver a salir por arriba y rodear el bloque entero.
  { id: "psecreta-k", a: c(12, 12), b: c(12, 11), abierta: false, secreta: true, descubierta: false },
  // Paso entre las dos salas del noroeste, sin bajar al pasillo del borde.
  { id: "psecreta-ab", a: c(4, 3), b: c(5, 3), abierta: false, secreta: true, descubierta: false },
];

export const MONSTRUOS_CALABOZO: Array<{ id: string; especie: EspecieMonstruo; celda: Celda }> = [
  { id: "goblin1", especie: "goblin", celda: c(10, 15) },
  { id: "goblin2", especie: "goblin", celda: c(9, 16) },
  { id: "orco1", especie: "orco", celda: c(15, 15) },
  { id: "goblin3", especie: "goblin", celda: c(16, 16) },
  { id: "orco2", especie: "orco", celda: c(6, 15) },
  { id: "guardian", especie: "fimir", celda: c(2, 16) },
];

export const TRAMPAS_CALABOZO: Trampa[] = [
  { id: "foso1", tipo: "foso", celda: c(12, 14), descubierta: false, gastada: false },
  { id: "lanza1", tipo: "lanza", celda: c(15, 16), descubierta: false, gastada: false },
  { id: "bloque1", tipo: "bloque", celda: c(7, 15), descubierta: false, gastada: false },
];

export const MUEBLES_CALABOZO: Mueble[] = [
  { id: "mesa1", tipo: "mesa", celdas: [c(16, 14), c(17, 14)], bloqueaPaso: true, bloqueaVista: false },
  { id: "arcon1", tipo: "arcon", celdas: [c(11, 13)], bloqueaPaso: true, bloqueaVista: false },
  // Dos casillas, como dice el catálogo. Van en (2,14)-(3,14) y no en (4,14),
  // porque ahí desemboca la puerta secreta y la dejaría inservible.
  { id: "tumba1", tipo: "tumba", celdas: [c(2, 14), c(3, 14)], bloqueaPaso: true, bloqueaVista: false },
];
