/**
 * La baraja de tesoros.
 *
 * Es la misma fuente para las cartas que se imprimen y para lo que roba la
 * aplicación, así que no pueden desincronizarse: si aquí cambia una carta,
 * cambia en las dos partes.
 *
 * El reparto está pensado para niños: una cuarta parte de las cartas son malas
 * (bastante para que registrar una sala dé respeto) pero ninguna es demoledora.
 * La baraja original castiga bastante más.
 */

import type { IdEquipo } from "./equipment";
import type { EspecieMonstruo } from "./monsters";

export type EfectoTesoro =
  | { clase: "oro"; cantidad: number }
  /** Una poción: no se aplica al robarla, va a la mochila (T54). */
  | { clase: "curacion"; cuerpo: number }
  | { clase: "bonusAtaque"; dados: number }
  /** Una pieza de equipo: el héroe se la pone si su clase puede y no lleva otra igual; si no, a la mochila. */
  | { clase: "equipo"; id: IdEquipo }
  | { clase: "monstruoErrante"; especie: EspecieMonstruo }
  | { clase: "peligro"; dano: number };

/** El id de una carta: es lo que viaja en el mazo y en la mochila de cada héroe. */
export type IdCartaTesoro = string;

export interface CartaTesoro {
  id: IdCartaTesoro;
  nombre: string;
  texto: string;
  efecto: EfectoTesoro;
  /** Cuántas copias van en la baraja. */
  copias: number;
}

export const BARAJA_TESOROS: readonly CartaTesoro[] = [
  // ---- oro y valores (13 cartas) ----
  { id: "oro10",  nombre: "Puñado de monedas", texto: "Unas monedas sueltas entre la paja.",              efecto: { clase: "oro", cantidad: 10 },  copias: 3 },
  { id: "oro25",  nombre: "Bolsa de monedas",  texto: "Una bolsa de cuero atada con un cordón.",          efecto: { clase: "oro", cantidad: 25 },  copias: 3 },
  { id: "oro50",  nombre: "Cofrecillo",        texto: "Un cofrecillo con la cerradura ya rota.",          efecto: { clase: "oro", cantidad: 50 },  copias: 2 },
  { id: "gema",   nombre: "Gema",              texto: "Una piedra verde del tamaño de una nuez.",         efecto: { clase: "oro", cantidad: 75 },  copias: 2 },
  { id: "joya",   nombre: "Joya antigua",      texto: "Un broche de oro con un escudo que nadie conoce.", efecto: { clase: "oro", cantidad: 100 }, copias: 2 },
  { id: "corona", nombre: "Corona pequeña",    texto: "Demasiado pequeña para una cabeza humana.",        efecto: { clase: "oro", cantidad: 150 }, copias: 1 },

  // ---- objetos buenos (5 cartas) ----
  { id: "pocionCura",  nombre: "Poción curativa",  texto: "Un frasco azul. Recupera 4 puntos de cuerpo.",                efecto: { clase: "curacion", cuerpo: 4 }, copias: 3 },
  { id: "pocionFuerza",nombre: "Poción de fuerza", texto: "Sabe a hierro. Suma 2 dados a tu siguiente ataque.",          efecto: { clase: "bonusAtaque", dados: 2 }, copias: 2 },

  // ---- equipo (4 cartas; firma de Juan Luis del 2026-09-06: «pueden hallar armas, escudos, yelmos…») ----
  { id: "eqYelmo",        nombre: "Yelmo abollado",   texto: "Pesa, pero sigue entero. Un dado más de defensa para quien pueda ponérselo.", efecto: { clase: "equipo", id: "yelmo" },        copias: 1 },
  { id: "eqEscudo",       nombre: "Escudo olvidado",  texto: "Apoyado en la pared, como si alguien fuera a volver a por él.",               efecto: { clase: "equipo", id: "escudo" },       copias: 1 },
  { id: "eqEspadaCorta",  nombre: "Espada corta",     texto: "Todavía afilada. Dos dados de ataque para quien la lleve.",                   efecto: { clase: "equipo", id: "espadaCorta" },  copias: 1 },
  { id: "eqHerramientas", nombre: "Herramientas",     texto: "Ganzúas y pinzas en un rollo de cuero. Con ellas se desarman trampas.",       efecto: { clase: "equipo", id: "herramientas" }, copias: 1 },

  // ---- lo que sale mal (6 cartas) ----
  { id: "errGoblin", nombre: "Monstruo errante", texto: "Un goblin te ha estado siguiendo. Aparece a tu lado.",        efecto: { clase: "monstruoErrante", especie: "goblin" }, copias: 2 },
  { id: "errOrco",   nombre: "Monstruo errante", texto: "Un orco entra por donde has venido. Aparece a tu lado.",      efecto: { clase: "monstruoErrante", especie: "orco" },   copias: 2 },
  { id: "gas",       nombre: "Gas venenoso",     texto: "Al abrir el arcón sale una nube verde. Pierdes 1 de cuerpo.", efecto: { clase: "peligro", dano: 1 }, copias: 1 },
  { id: "telarana",  nombre: "Telaraña",         texto: "Algo peludo te muerde la mano. Pierdes 1 de cuerpo.",         efecto: { clase: "peligro", dano: 1 }, copias: 1 },
  { id: "viga",      nombre: "Viga floja",       texto: "El techo cruje y te cae encima un pedazo de madera. Pierdes 1 de cuerpo.", efecto: { clase: "peligro", dano: 1 }, copias: 1 },
  { id: "esquirla",  nombre: "Esquirla de piedra", texto: "Una losa se rompe bajo tu pie y salta una esquirla afilada. Pierdes 1 de cuerpo.", efecto: { clase: "peligro", dano: 1 }, copias: 1 },
  { id: "aguja",     nombre: "Aguja oculta",     texto: "Escondida entre la paja, una aguja te pincha el dedo. Pierdes 1 de cuerpo.", efecto: { clase: "peligro", dano: 1 }, copias: 1 },
];

/** La carta con ese id, o undefined si no existe (un id que no es de la baraja). */
export const cartaDeTesoro = (id: IdCartaTesoro): CartaTesoro | undefined =>
  BARAJA_TESOROS.find((c) => c.id === id);

/** ¿Es una poción, de las que se guardan y se beben cuando hacen falta? */
export const esPocion = (c: CartaTesoro): boolean =>
  c.efecto.clase === "curacion" || c.efecto.clase === "bonusAtaque";

/** La baraja desplegada, una entrada por copia. */
export const MAZO_COMPLETO: CartaTesoro[] = BARAJA_TESOROS.flatMap((c) =>
  Array.from({ length: c.copias }, () => c),
);

export const TOTAL_CARTAS = MAZO_COMPLETO.length;

/** Cuántas cartas de cada clase, para comprobar que el reparto es el que queremos. */
export function repartoDeLaBaraja() {
  const cuenta: Record<string, number> = {};
  for (const c of MAZO_COMPLETO) cuenta[c.efecto.clase] = (cuenta[c.efecto.clase] ?? 0) + 1;
  return cuenta;
}
