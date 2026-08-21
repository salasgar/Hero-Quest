/**
 * Los héroes jugables.
 *
 * Los cuatro de la caja básica más el hada, que es añadido nuestro. Cada clase
 * se puede jugar en masculino o en femenino: el nombre cambia (Elfo/Elfa,
 * Mago/Hechicera) pero las reglas son exactamente las mismas, porque en la mesa
 * lo que decide una partida es el número de dados, no quién lleva la miniatura.
 */

export type ClaseHeroe = "barbaro" | "enano" | "elfo" | "mago" | "hada";

export type Genero = "m" | "f";

export interface PlantillaHeroe {
  clase: ClaseHeroe;
  /**
   * Cómo se llama la clase en cada género. Cuando las dos formas coinciden
   * —el hada— la clase no distingue y solo se imprime una carta.
   */
  nombre: Readonly<Record<Genero, string>>;
  cuerpo: number;
  mente: number;
  /** Dados de defensa sin armadura. Todos los héroes defienden con 2. */
  defensa: number;
  /** Equipo con el que empieza la campaña. */
  equipoInicial: string[];
  /** Cuántos grupos de hechizos elige al empezar (de los cuatro elementos). */
  gruposDeHechizos: number;
  /** Solo el enano desarma trampas sin riesgo, con sus herramientas. */
  desarmaTrampasSinRiesgo: boolean;
  /**
   * Vuela: al moverse pasa por encima de muebles y de otras figuras (no puede
   * terminar sobre ellos) y no cae en los fosos. Ni los muros ni las puertas
   * cerradas la dejan pasar, y un bloque desprendido sigue cortando el paso.
   */
  vuela: boolean;
  /** La línea que la distingue, tal cual sale impresa en su carta. */
  especial: string;
}

/**
 * Los textos de `especial` están escritos sin género a propósito ("nadie
 * golpea más fuerte", no "el más fuerte"): así la misma carta vale para las dos
 * versiones y no hay que mantener dos redacciones que se desincronizan.
 */
export const HEROES: Readonly<Record<ClaseHeroe, PlantillaHeroe>> = {
  barbaro: {
    clase: "barbaro",
    nombre: { m: "Bárbaro", f: "Bárbara" },
    cuerpo: 8,
    mente: 2,
    defensa: 2,
    equipoInicial: ["espadaAncha"],
    gruposDeHechizos: 0,
    desarmaTrampasSinRiesgo: false,
    vuela: false,
    especial: "Nadie aguanta ni golpea más en el cuerpo a cuerpo. No usa magia.",
  },
  enano: {
    clase: "enano",
    nombre: { m: "Enano", f: "Enana" },
    cuerpo: 7,
    mente: 3,
    defensa: 2,
    equipoInicial: ["espadaCorta", "herramientas"],
    gruposDeHechizos: 0,
    desarmaTrampasSinRiesgo: true,
    vuela: false,
    especial: "Desarma trampas sin riesgo gracias a sus herramientas.",
  },
  elfo: {
    clase: "elfo",
    nombre: { m: "Elfo", f: "Elfa" },
    cuerpo: 6,
    mente: 4,
    defensa: 2,
    equipoInicial: ["espadaCorta"],
    gruposDeHechizos: 1,
    desarmaTrampasSinRiesgo: false,
    vuela: false,
    especial: "Pelea con espada y además lanza magia: elige un elemento al empezar.",
  },
  mago: {
    clase: "mago",
    nombre: { m: "Mago", f: "Hechicera" },
    cuerpo: 4,
    mente: 6,
    defensa: 2,
    equipoInicial: ["daga"],
    gruposDeHechizos: 3,
    desarmaTrampasSinRiesgo: false,
    vuela: false,
    especial: "Nueve hechizos: elige tres elementos al empezar. En combate, poca cosa.",
  },
  hada: {
    clase: "hada",
    nombre: { m: "Hada", f: "Hada" },
    cuerpo: 3,
    mente: 7,
    defensa: 2,
    equipoInicial: ["daga"],
    gruposDeHechizos: 2,
    desarmaTrampasSinRiesgo: false,
    vuela: true,
    especial:
      "Vuela: cruza por encima de muebles y de otras figuras, y los fosos no la tragan. " +
      "Elige dos elementos de hechizos. Es la más frágil de todos.",
  },
};

export const CLASES_HEROE = Object.keys(HEROES) as ClaseHeroe[];

/** Cómo se llama esta clase jugada en este género. */
export const nombreDeClase = (clase: ClaseHeroe, genero: Genero = "m"): string =>
  HEROES[clase].nombre[genero];

export interface VarianteHeroe {
  clase: ClaseHeroe;
  genero: Genero;
  nombre: string;
}

/**
 * Una entrada por personaje elegible, que es también una carta a imprimir: las
 * clases con forma femenina propia salen dos veces, el hada una sola.
 */
export const VARIANTES_HEROE: readonly VarianteHeroe[] = CLASES_HEROE.flatMap((clase) => {
  const { m, f } = HEROES[clase].nombre;
  return m === f
    ? [{ clase, genero: "f" as Genero, nombre: f }]
    : [
        { clase, genero: "m" as Genero, nombre: m },
        { clase, genero: "f" as Genero, nombre: f },
      ];
});
