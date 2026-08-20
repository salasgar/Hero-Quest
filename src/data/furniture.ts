/**
 * Catálogo de mobiliario, con lo que hay que construir en cartón.
 *
 * Las medidas van en CASILLAS, que es lo único que no admite discusión: la
 * aplicación razona en casillas y el cartón tiene que encajar en el tablero.
 * En el tablero de 2021 cada casilla mide unos 2,55 cm, pero mide la tuya antes
 * de cortar nada.
 *
 * La distinción entre `bloqueaPaso` y `bloqueaVista` no es un capricho: sobre
 * una mesa no te pones, pero ves y disparas por encima; una estantería tapa.
 * Eso decide qué hechizos y qué tiros de ballesta llegan al objetivo.
 */

import type { TipoMueble } from "../engine/types";

export interface PlantillaMueble {
  tipo: TipoMueble;
  nombre: string;
  /** Tamaño en casillas: ancho x alto. */
  ancho: number;
  alto: number;
  bloqueaPaso: boolean;
  bloqueaVista: boolean;
  /** Cuántas piezas conviene construir. */
  cuantas: number;
  nota?: string;
}

export const MOBILIARIO: readonly PlantillaMueble[] = [
  { tipo: "mesa",       nombre: "Mesa",              ancho: 2, alto: 1, bloqueaPaso: true, bloqueaVista: false, cuantas: 2, nota: "La de comer, en salas de guardia y comedores." },
  { tipo: "estanteria", nombre: "Estantería",        ancho: 2, alto: 1, bloqueaPaso: true, bloqueaVista: true,  cuantas: 2, nota: "Alta: tapa la vista. Buen sitio para esconder cosas." },
  { tipo: "arcon",      nombre: "Arcón",             ancho: 1, alto: 1, bloqueaPaso: true, bloqueaVista: false, cuantas: 3, nota: "El clásico del tesoro. Haz varios." },
  { tipo: "armario",    nombre: "Armario",           ancho: 2, alto: 1, bloqueaPaso: true, bloqueaVista: true,  cuantas: 1, nota: "Alto: tapa la vista." },
  { tipo: "trono",      nombre: "Trono",             ancho: 1, alto: 1, bloqueaPaso: true, bloqueaVista: false, cuantas: 1, nota: "Para la sala del jefe." },
  { tipo: "tumba",      nombre: "Tumba",             ancho: 2, alto: 1, bloqueaPaso: true, bloqueaVista: false, cuantas: 1, nota: "De ahí salen los no-muertos." },
  { tipo: "altar",      nombre: "Altar",             ancho: 2, alto: 1, bloqueaPaso: true, bloqueaVista: false, cuantas: 1 },
  { tipo: "banco",      nombre: "Banco de trabajo",  ancho: 2, alto: 1, bloqueaPaso: true, bloqueaVista: false, cuantas: 1, nota: "El del alquimista." },
  { tipo: "escritorio", nombre: "Escritorio",        ancho: 2, alto: 1, bloqueaPaso: true, bloqueaVista: false, cuantas: 1, nota: "El del hechicero." },
  { tipo: "bastidor",   nombre: "Bastidor de armas", ancho: 1, alto: 1, bloqueaPaso: true, bloqueaVista: true,  cuantas: 1, nota: "Alto: tapa la vista." },
];

export const TOTAL_PIEZAS = MOBILIARIO.reduce((s, m) => s + m.cuantas, 0);

/** Lado de la casilla en el tablero de la edición 2021, en centímetros. */
export const LADO_CASILLA_CM = 2.55;

/**
 * Cuántas puertas construir.
 *
 * El tablero admite 259 posiciones distintas de puerta (168 entre sala y
 * pasillo y 91 entre dos salas contiguas), pero eso es el máximo teórico: una
 * misión abre como mucho un par de accesos por sala. Con 22 salas, 25 puertas
 * cubren una misión que abra todas y sobran tres para las salas con dos
 * entradas.
 *
 * El editor de misiones de la Fase 6 avisará si una misión pide más de las que
 * tienes construidas.
 */
export const PUERTAS_A_CONSTRUIR = 25;

/** Marcadores planos para las puertas secretas, que no se ven hasta encontrarlas. */
export const MARCADORES_SECRETOS = 4;

/** Posiciones donde el tablero admite una puerta. Calculado de la geometría. */
export const POSICIONES_DE_PUERTA_EN_EL_TABLERO = 259;
