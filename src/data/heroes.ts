/**
 * Los héroes jugables.
 *
 * Los cuatro de la caja básica más el hada, que es añadido nuestro. Cada clase
 * se puede jugar en masculino o en femenino: el nombre cambia (Elfo/Elfa,
 * Mago/Hechicera) pero las reglas son exactamente las mismas, porque en la mesa
 * lo que decide una partida es el número de dados, no quién lleva la miniatura.
 */

import { EQUIPO, type IdEquipo, type RanuraEquipo } from "./equipment";

export type ClaseHeroe = "barbaro" | "enano" | "elfo" | "mago" | "hada";

export type Genero = "m" | "f";

/**
 * Qué no puede comprar ni llevar una clase.
 *
 * Todavía no hay tienda —es la Fase 8—, así que esto no interviene en ninguna
 * partida: es la regla escrita y probada, a la espera de quien la use.
 */
export interface RestriccionesEquipo {
  /** Ranuras enteras vetadas. Al mago se le veta `armadura` completa. */
  ranurasVetadas: readonly RanuraEquipo[];
  /** Piezas vetadas una a una, además de las ranuras. */
  equipoVetado: readonly IdEquipo[];
  /**
   * `true` mientras `equipoVetado` esté incompleta a sabiendas. Ver la nota de
   * `SIN_ARMADURA` abajo: es la marca que busca quien venga a completarla.
   */
  armasGrandesPorConfirmar: boolean;
}

const SIN_RESTRICCIONES: RestriccionesEquipo = {
  ranurasVetadas: [],
  equipoVetado: [],
  armasGrandesPorConfirmar: false,
};

/**
 * Lo que el reglamento de 2021 (Avalon Hill F3649) dice del mago, y lo que no.
 *
 * Dice, en la página 13: «they are hindered by their inability to wear normal
 * armor or use large weapons». La primera mitad se puede implementar tal cual y
 * está aquí: ninguna pieza de la ranura `armadura` —yelmo, cota, placas y
 * escudo—. La página 22 lo confirma desde el otro lado: «Wizard: Since there
 * are so few things that you can buy from the armory, it would be wise for you
 * to save your money».
 *
 * La segunda mitad **no se puede implementar**: en ninguna de las 24 páginas del
 * reglamento se enumera qué es un «arma grande». La página 13, en «A Trip to the
 * Armory», remite a las cartas («see the equipment deck») y las cartas no las
 * tenemos. Por eso `equipoVetado` va vacía y con la marca puesta: escribir aquí
 * de memoria «el hacha y la espada ancha» sería inventarse una regla, que es lo
 * que ya salió mal con los hechizos.
 *
 * Quien consiga las cartas: rellena `equipoVetado`, cita la fuente y pon
 * `armasGrandesPorConfirmar: false`.
 */
const SIN_ARMADURA: RestriccionesEquipo = {
  ranurasVetadas: ["armadura"],
  equipoVetado: [],
  armasGrandesPorConfirmar: true,
};

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
  equipoInicial: IdEquipo[];
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
  /** Qué no puede llevar esta clase. Se consulta con `puedeLlevar`. */
  restricciones: RestriccionesEquipo;
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
    restricciones: SIN_RESTRICCIONES,
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
    restricciones: SIN_RESTRICCIONES,
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
    // El elfo lanza magia y aun así el reglamento no le pone ninguna traba de
    // equipo: la restricción es del mago, no de saber magia.
    restricciones: SIN_RESTRICCIONES,
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
    restricciones: SIN_ARMADURA,
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
    /**
     * El hada es añadido nuestro y el reglamento no dice nada de ella, así que
     * esto es equilibrio, no regla. Va con las mismas trabas que el mago porque
     * su carta promete que es «la más frágil de todos», y con cuerpo 3 la
     * armadura es justo lo que borraría esa fragilidad: es lo único que paga
     * sus dos grupos de hechizos y el vuelo. Sin la traba quedaría por encima
     * del elfo (más magia, y encima vuela) sin ninguna desventaja a cambio.
     */
    restricciones: SIN_ARMADURA,
    especial:
      "Vuela: cruza por encima de muebles y de otras figuras, y los fosos no la tragan. " +
      "Elige dos elementos de hechizos. Es la más frágil de todos.",
  },
};

export const CLASES_HEROE = Object.keys(HEROES) as ClaseHeroe[];

/** Cómo se llama esta clase jugada en este género. */
export const nombreDeClase = (clase: ClaseHeroe, genero: Genero = "m"): string =>
  HEROES[clase].nombre[genero];

/**
 * Si esta clase puede llevar esta pieza de equipo.
 *
 * Pura y sin estado de partida: sirve tanto para filtrar la tienda de la Fase 8
 * como para comprobar que el equipo inicial de cada clase se respeta a sí mismo.
 */
export const puedeLlevar = (clase: ClaseHeroe, idEquipo: IdEquipo): boolean => {
  const { ranurasVetadas, equipoVetado } = HEROES[clase].restricciones;
  return !equipoVetado.includes(idEquipo) && !ranurasVetadas.includes(EQUIPO[idEquipo].ranura);
};

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
