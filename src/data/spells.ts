/**
 * Los doce hechizos, en cuatro elementos de tres.
 *
 * Dos reglas que se confunden a menudo:
 *  1. **Los hechizos no gastan puntos de mente.** Cada carta se lanza UNA vez
 *     por misión y se descarta. La mente es un atributo que usan algunos
 *     efectos (el Sueño compara mentes), no un depósito de maná.
 *  2. Al empezar se eligen elementos: el mago TRES, el hada DOS y el elfo UNO.
 *
 * Cotejado con el reglamento oficial de 2021 y con el texto de las cartas. Como los
 * efectos son datos y no código, corregir uno es cambiar un número aquí.
 */

export type Elemento = "aire" | "agua" | "tierra" | "fuego";

export type IdHechizo =
  | "vientoVeloz" | "tempestad" | "genio"
  | "sueno" | "veloDeNiebla" | "aguaCurativa"
  | "pielDePiedra" | "atravesarLaRoca" | "curacion"
  | "bolaDeFuego" | "coraje" | "fuegoDeLaIra";

/** A quién se puede apuntar. */
export type Objetivo = "unEnemigo" | "unHeroe" | "unoMismo" | "enemigosDeLaSala";

/** Qué hace. El motor sabe ejecutar cada uno de estos casos. */
export type Efecto =
  | { clase: "curar"; maximo: number }
  | { clase: "bonusAtaque"; dados: number }
  | { clase: "bonusDefensa"; dados: number }
  | { clase: "dormir" }
  | { clase: "perderTurno" }
  | { clase: "movimientoExtra"; dados: number }
  | { clase: "atravesarMuros" }
  | { clase: "atravesarFiguras" }
  | { clase: "invocar"; dados: number }
  /**
   * Daño fijo del que el objetivo puede librarse en parte. Tira `salvacion`
   * dados rojos y cada 5 o 6 le quita un punto al daño. Es la mecánica de los
   * dos hechizos de fuego, y no se parece a la del combate: no cuenta
   * calaveras, y los dados los tira quien lo recibe.
   */
  | { clase: "danoConSalvacion"; dano: number; salvacion: number };

export interface Hechizo {
  id: IdHechizo;
  nombre: string;
  elemento: Elemento;
  objetivo: Objetivo;
  efecto: Efecto;
  /** Hace falta línea de visión hasta el objetivo. */
  requiereVision: boolean;
  descripcion: string;
  porVerificar?: boolean;
}

export const HECHIZOS: Readonly<Record<IdHechizo, Hechizo>> = {
  // ---- Aire ----
  vientoVeloz: {
    id: "vientoVeloz", nombre: "Viento veloz", elemento: "aire",
    objetivo: "unHeroe", efecto: { clase: "movimientoExtra", dados: 2 }, requiereVision: true,
    descripcion: "El héroe elegido tira cuatro dados de movimiento en vez de dos.",
  },
  tempestad: {
    id: "tempestad", nombre: "Tempestad", elemento: "aire",
    objetivo: "unEnemigo", efecto: { clase: "perderTurno" }, requiereVision: true,
    descripcion: "Un torbellino envuelve al monstruo elegido, que pierde su siguiente turno.",
  },
  genio: {
    id: "genio", nombre: "Genio", elemento: "aire",
    objetivo: "unEnemigo", efecto: { clase: "invocar", dados: 5 }, requiereVision: true,
    descripcion:
      "Invoca un genio que ataca con 5 dados de combate al monstruo elegido. " +
      "(En la mesa también puede abrir una puerta: eso lo lleváis a mano.)",
  },

  // ---- Agua ----
  sueno: {
    id: "sueno", nombre: "Sueño", elemento: "agua",
    objetivo: "unEnemigo", efecto: { clase: "dormir" }, requiereVision: true,
    descripcion: "El monstruo cae dormido si su mente no supera la del lanzador.",
  },
  veloDeNiebla: {
    id: "veloDeNiebla", nombre: "Velo de niebla", elemento: "agua",
    objetivo: "unHeroe", efecto: { clase: "atravesarFiguras" }, requiereVision: true,
    descripcion: "En su próximo movimiento, el héroe elegido pasa a través de los monstruos sin ser visto.",
  },
  aguaCurativa: {
    id: "aguaCurativa", nombre: "Agua curativa", elemento: "agua",
    objetivo: "unHeroe", efecto: { clase: "curar", maximo: 4 }, requiereVision: true,
    descripcion: "Recupera hasta 4 puntos de cuerpo, sin pasar de su máximo.",
  },

  // ---- Tierra ----
  pielDePiedra: {
    id: "pielDePiedra", nombre: "Piel de piedra", elemento: "tierra",
    objetivo: "unHeroe", efecto: { clase: "bonusDefensa", dados: 1 }, requiereVision: true,
    descripcion: "Suma 1 dado de defensa. Se rompe en cuanto le hagan un punto de daño.",
  },
  atravesarLaRoca: {
    id: "atravesarLaRoca", nombre: "Atravesar la roca", elemento: "tierra",
    objetivo: "unHeroe", efecto: { clase: "atravesarMuros" }, requiereVision: true,
    descripcion: "En su próximo movimiento, el héroe elegido atraviesa cuantos muros le dé la tirada.",
  },
  curacion: {
    id: "curacion", nombre: "Curación", elemento: "tierra",
    objetivo: "unHeroe", efecto: { clase: "curar", maximo: 4 }, requiereVision: true,
    descripcion: "Recupera hasta 4 puntos de cuerpo, sin pasar de su máximo.",
  },

  // ---- Fuego ----
  bolaDeFuego: {
    id: "bolaDeFuego", nombre: "Bola de fuego", elemento: "fuego",
    objetivo: "unEnemigo", efecto: { clase: "danoConSalvacion", dano: 2, salvacion: 2 },
    requiereVision: true,
    descripcion: "2 puntos de daño. El objetivo tira 2 dados rojos y cada 5 o 6 le resta uno.",
  },
  coraje: {
    id: "coraje", nombre: "Coraje", elemento: "fuego",
    objetivo: "unHeroe", efecto: { clase: "bonusAtaque", dados: 2 }, requiereVision: true,
    descripcion: "La próxima vez que ataque, tira 2 dados de combate más.",
  },
  fuegoDeLaIra: {
    id: "fuegoDeLaIra", nombre: "Fuego de la ira", elemento: "fuego",
    objetivo: "unEnemigo", efecto: { clase: "danoConSalvacion", dano: 1, salvacion: 1 },
    requiereVision: true,
    descripcion: "1 punto de daño, salvo que el objetivo saque un 5 o un 6 con un dado rojo.",
  },
};

export const ELEMENTOS: readonly Elemento[] = ["aire", "agua", "tierra", "fuego"];

export const hechizosDelElemento = (e: Elemento): Hechizo[] =>
  Object.values(HECHIZOS).filter((h) => h.elemento === e);

export const HECHIZOS_POR_VERIFICAR = Object.values(HECHIZOS).filter((h) => h.porVerificar);
