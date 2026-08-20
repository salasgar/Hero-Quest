/** Los cuatro héroes de la caja básica. */

export type ClaseHeroe = "barbaro" | "enano" | "elfo" | "mago";

export interface PlantillaHeroe {
  clase: ClaseHeroe;
  nombre: string;
  cuerpo: number;
  mente: number;
  /** Dados de defensa sin armadura. Los cuatro héroes defienden con 2. */
  defensa: number;
  /** Equipo con el que empieza la campaña. */
  equipoInicial: string[];
  /** Cuántos grupos de hechizos elige al empezar (de los cuatro elementos). */
  gruposDeHechizos: number;
  /** Solo el enano desarma trampas sin riesgo, con sus herramientas. */
  desarmaTrampasSinRiesgo: boolean;
}

export const HEROES: Readonly<Record<ClaseHeroe, PlantillaHeroe>> = {
  barbaro: {
    clase: "barbaro",
    nombre: "Bárbaro",
    cuerpo: 8,
    mente: 2,
    defensa: 2,
    equipoInicial: ["espadaAncha"],
    gruposDeHechizos: 0,
    desarmaTrampasSinRiesgo: false,
  },
  enano: {
    clase: "enano",
    nombre: "Enano",
    cuerpo: 7,
    mente: 3,
    defensa: 2,
    equipoInicial: ["espadaCorta", "herramientas"],
    gruposDeHechizos: 0,
    desarmaTrampasSinRiesgo: true,
  },
  elfo: {
    clase: "elfo",
    nombre: "Elfo",
    cuerpo: 6,
    mente: 4,
    defensa: 2,
    equipoInicial: ["espadaCorta"],
    gruposDeHechizos: 1,
    desarmaTrampasSinRiesgo: false,
  },
  mago: {
    clase: "mago",
    nombre: "Mago",
    cuerpo: 4,
    mente: 6,
    defensa: 2,
    equipoInicial: ["daga"],
    gruposDeHechizos: 3,
    desarmaTrampasSinRiesgo: false,
  },
};

export const CLASES_HEROE = Object.keys(HEROES) as ClaseHeroe[];
