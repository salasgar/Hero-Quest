/**
 * Armas, armaduras y objetos de la caja básica.
 *
 * Los valores están cotejados con el reglamento oficial de la edición de 2021
 * (Avalon Hill, F3649) y con las cartas de equipo. Donde las ediciones difieren
 * —el precio de la cota de malla, el escudo contra ataques a distancia— se sigue
 * la línea estadounidense de 2021 y se deja dicho en la nota.
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
  /** Ataca también en diagonal por su longitud: el bastón y la lanza. */
  atacaEnDiagonal?: boolean;
  /** Se puede lanzar a distancia (daga, lanza). */
  arrojadiza?: boolean;
  /** Dispara con línea de visión y NO puede atacar cuerpo a cuerpo. */
  aDistancia?: boolean;
  /** Ocupa las dos manos: incompatible con el escudo. */
  aDosManos?: boolean;
  /** Lo que resta a cada tirada de movimiento. Solo la armadura de placas. */
  penalizacionMovimiento?: number;
  notas?: string;
  porVerificar?: boolean;
}

export const EQUIPO: Readonly<Record<IdEquipo, Equipo>> = {
  daga:             { id: "daga",             nombre: "Daga",               ranura: "arma", ataque: 1, precio:  25, arrojadiza: true },
  espadaCorta:      { id: "espadaCorta",      nombre: "Espada corta",       ranura: "arma", ataque: 2, precio: 150 },
  espadaAncha:      { id: "espadaAncha",      nombre: "Espada ancha",       ranura: "arma", ataque: 3, precio: 250 },
  hachaDeBatalla:   { id: "hachaDeBatalla",   nombre: "Hacha de batalla",   ranura: "arma", ataque: 4, precio: 450, aDosManos: true },
  baston:           { id: "baston",           nombre: "Bastón",             ranura: "arma", ataque: 1, precio: 100, atacaEnDiagonal: true },
  lanza:            { id: "lanza",            nombre: "Lanza",              ranura: "arma", ataque: 2, precio: 150, atacaEnDiagonal: true, arrojadiza: true },
  ballesta:         { id: "ballesta",         nombre: "Ballesta",           ranura: "arma", ataque: 3, precio: 350, aDistancia: true, notas: "No puede atacar a un enemigo adyacente." },

  escudo:           { id: "escudo",           nombre: "Escudo",             ranura: "armadura", defensa: 1, precio: 150, notas: "Incompatible con armas a dos manos." },
  yelmo:            { id: "yelmo",            nombre: "Yelmo",              ranura: "armadura", defensa: 1, precio: 125 },
  cotaDeMalla:      { id: "cotaDeMalla",      nombre: "Cota de malla",      ranura: "armadura", defensa: 1, precio: 500, notas: "En la edición británica cuesta 450." },
  armaduraDePlacas: { id: "armaduraDePlacas", nombre: "Armadura de placas", ranura: "armadura", defensa: 2, precio: 850, penalizacionMovimiento: 2, notas: "Pesa: resta 2 a cada tirada de movimiento." },

  herramientas:     { id: "herramientas",     nombre: "Herramientas",       ranura: "objeto", precio: 250, notas: "Permite desarmar trampas. Enanos y enanas lo hacen sin riesgo." },
};

export const ARMAS = Object.values(EQUIPO).filter((e) => e.ranura === "arma");
export const ARMADURAS = Object.values(EQUIPO).filter((e) => e.ranura === "armadura");
/** Lo que todavía no está cotejado con una fuente. Hoy, nada. */
export const POR_VERIFICAR = Object.values(EQUIPO).filter((e) => e.porVerificar);
