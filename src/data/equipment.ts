/**
 * Armas, armaduras y objetos de la caja básica.
 *
 * ⚠ VALORES POR VERIFICAR CONTRA TUS CARTAS
 * Los dados de ataque y defensa los tengo claros; algunos **precios en oro** y
 * algún detalle de las armaduras no. Están marcados con `porVerificar: true`.
 * Cotéjalos con las cartas de equipo cuando tengas la caja delante: corregirlos
 * es cambiar un número aquí, nada más. Ninguno afecta al motor de la Fase 2,
 * solo a la tienda entre misiones (Fase 8).
 */

export type IdEquipo =
  | "daga" | "espadaCorta" | "espadaAncha" | "hachaDeBatalla"
  | "baston" | "lanza" | "ballesta"
  | "escudo" | "yelmo" | "cotaDeMalla" | "armaduraDePlacas"
  | "herramientas";

export type RanuraEquipo = "arma" | "armadura" | "objeto";

export interface Equipo {
  id: IdEquipo;
  nombre: string;
  ranura: RanuraEquipo;
  /** Dados de ataque que aporta el arma. */
  ataque?: number;
  /** Dados de defensa que suma la armadura. */
  defensa?: number;
  precio: number;
  /** Ataca también en diagonal (bastón, lanza, hacha de batalla). */
  atacaEnDiagonal?: boolean;
  /** Se puede lanzar a distancia (daga, lanza). */
  arrojadiza?: boolean;
  /** Dispara con línea de visión y NO puede atacar cuerpo a cuerpo. */
  aDistancia?: boolean;
  /** Ocupa las dos manos: incompatible con el escudo. */
  aDosManos?: boolean;
  notas?: string;
  porVerificar?: boolean;
}

export const EQUIPO: Readonly<Record<IdEquipo, Equipo>> = {
  daga:             { id: "daga",             nombre: "Daga",               ranura: "arma", ataque: 1, precio:  25, arrojadiza: true },
  espadaCorta:      { id: "espadaCorta",      nombre: "Espada corta",       ranura: "arma", ataque: 2, precio: 150 },
  espadaAncha:      { id: "espadaAncha",      nombre: "Espada ancha",       ranura: "arma", ataque: 3, precio: 250 },
  hachaDeBatalla:   { id: "hachaDeBatalla",   nombre: "Hacha de batalla",   ranura: "arma", ataque: 4, precio: 450, atacaEnDiagonal: true, aDosManos: true },
  baston:           { id: "baston",           nombre: "Bastón",             ranura: "arma", ataque: 1, precio: 100, atacaEnDiagonal: true },
  lanza:            { id: "lanza",            nombre: "Lanza",              ranura: "arma", ataque: 2, precio: 250, atacaEnDiagonal: true, arrojadiza: true },
  ballesta:         { id: "ballesta",         nombre: "Ballesta",           ranura: "arma", ataque: 3, precio: 350, aDistancia: true, notas: "No puede atacar a un enemigo adyacente." },

  escudo:           { id: "escudo",           nombre: "Escudo",             ranura: "armadura", defensa: 1, precio: 150, notas: "Incompatible con armas a dos manos." },
  yelmo:            { id: "yelmo",            nombre: "Yelmo",              ranura: "armadura", defensa: 1, precio: 125, porVerificar: true },
  cotaDeMalla:      { id: "cotaDeMalla",      nombre: "Cota de malla",      ranura: "armadura", defensa: 1, precio: 500, porVerificar: true },
  armaduraDePlacas: { id: "armaduraDePlacas", nombre: "Armadura de placas", ranura: "armadura", defensa: 2, precio: 850, porVerificar: true, notas: "Revisar si tu carta impone penalización al movimiento." },

  herramientas:     { id: "herramientas",     nombre: "Herramientas",       ranura: "objeto", precio: 0, notas: "Permite desarmar trampas. Enanos y enanas lo hacen sin riesgo." },
};

export const ARMAS = Object.values(EQUIPO).filter((e) => e.ranura === "arma");
export const ARMADURAS = Object.values(EQUIPO).filter((e) => e.ranura === "armadura");
/** Lo que aún hay que cotejar con las cartas físicas. */
export const POR_VERIFICAR = Object.values(EQUIPO).filter((e) => e.porVerificar);
