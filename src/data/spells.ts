/**
 * Los doce hechizos, en cuatro elementos de tres.
 *
 * Dos reglas que se confunden a menudo:
 *  1. **Los hechizos no gastan puntos de mente.** Cada carta se lanza UNA vez
 *     por misión y se descarta. La mente es un atributo que usan algunos
 *     efectos (el Sueño compara mentes), no un depósito de maná.
 *  2. El mago elige TRES elementos al empezar y el elfo UNO.
 *
 * ⚠ VALORES POR VERIFICAR CONTRA TUS CARTAS
 * La estructura y a quién apunta cada hechizo la tengo clara; algunas
 * cantidades exactas no. Van marcadas con `porVerificar: true`. Como los
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
  | { clase: "danoDirecto"; dados: number }
  | { clase: "curar"; maximo: number }
  | { clase: "bonusAtaque"; dados: number }
  | { clase: "bonusDefensa"; dados: number }
  | { clase: "dormir" }
  | { clase: "perderTurno" }
  | { clase: "movimientoExtra" }
  | { clase: "atravesarMuros" }
  | { clase: "intangible" }
  | { clase: "invocar" };

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
    objetivo: "unHeroe", efecto: { clase: "movimientoExtra" }, requiereVision: true,
    descripcion: "El héroe elegido puede volver a moverse este turno.", porVerificar: true,
  },
  tempestad: {
    id: "tempestad", nombre: "Tempestad", elemento: "aire",
    objetivo: "enemigosDeLaSala", efecto: { clase: "perderTurno" }, requiereVision: true,
    descripcion: "Los monstruos de la sala pierden su siguiente turno.", porVerificar: true,
  },
  genio: {
    id: "genio", nombre: "Genio", elemento: "aire",
    objetivo: "unEnemigo", efecto: { clase: "invocar" }, requiereVision: true,
    descripcion: "Invoca un genio que combate junto a los héroes.", porVerificar: true,
  },

  // ---- Agua ----
  sueno: {
    id: "sueno", nombre: "Sueño", elemento: "agua",
    objetivo: "unEnemigo", efecto: { clase: "dormir" }, requiereVision: true,
    descripcion: "El monstruo cae dormido si su mente no supera la del lanzador.",
  },
  veloDeNiebla: {
    id: "veloDeNiebla", nombre: "Velo de niebla", elemento: "agua",
    objetivo: "unoMismo", efecto: { clase: "intangible" }, requiereVision: false,
    descripcion: "El lanzador no puede ser atacado hasta su siguiente turno.", porVerificar: true,
  },
  aguaCurativa: {
    id: "aguaCurativa", nombre: "Agua curativa", elemento: "agua",
    objetivo: "unHeroe", efecto: { clase: "curar", maximo: 4 }, requiereVision: true,
    descripcion: "Recupera hasta 4 puntos de cuerpo.", porVerificar: true,
  },

  // ---- Tierra ----
  pielDePiedra: {
    id: "pielDePiedra", nombre: "Piel de piedra", elemento: "tierra",
    objetivo: "unHeroe", efecto: { clase: "bonusDefensa", dados: 2 }, requiereVision: true,
    descripcion: "Suma 2 dados de defensa.", porVerificar: true,
  },
  atravesarLaRoca: {
    id: "atravesarLaRoca", nombre: "Atravesar la roca", elemento: "tierra",
    objetivo: "unoMismo", efecto: { clase: "atravesarMuros" }, requiereVision: false,
    descripcion: "El lanzador atraviesa muros durante este movimiento.", porVerificar: true,
  },
  curacion: {
    id: "curacion", nombre: "Curación", elemento: "tierra",
    objetivo: "unHeroe", efecto: { clase: "curar", maximo: 4 }, requiereVision: true,
    descripcion: "Recupera hasta 4 puntos de cuerpo.", porVerificar: true,
  },

  // ---- Fuego ----
  bolaDeFuego: {
    id: "bolaDeFuego", nombre: "Bola de fuego", elemento: "fuego",
    objetivo: "unEnemigo", efecto: { clase: "danoDirecto", dados: 2 }, requiereVision: true,
    descripcion: "Tira 2 dados de combate; cada calavera quita un punto de cuerpo.", porVerificar: true,
  },
  coraje: {
    id: "coraje", nombre: "Coraje", elemento: "fuego",
    objetivo: "unHeroe", efecto: { clase: "bonusAtaque", dados: 2 }, requiereVision: true,
    descripcion: "Suma 2 dados a su siguiente ataque.", porVerificar: true,
  },
  fuegoDeLaIra: {
    id: "fuegoDeLaIra", nombre: "Fuego de la ira", elemento: "fuego",
    objetivo: "unEnemigo", efecto: { clase: "danoDirecto", dados: 1 }, requiereVision: true,
    descripcion: "Tira 1 dado de combate; cada calavera quita un punto de cuerpo.", porVerificar: true,
  },
};

export const ELEMENTOS: readonly Elemento[] = ["aire", "agua", "tierra", "fuego"];

export const hechizosDelElemento = (e: Elemento): Hechizo[] =>
  Object.values(HECHIZOS).filter((h) => h.elemento === e);

export const HECHIZOS_POR_VERIFICAR = Object.values(HECHIZOS).filter((h) => h.porVerificar);
