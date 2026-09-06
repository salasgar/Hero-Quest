/**
 * Los monstruos de la caja básica.
 *
 * Ojo con una diferencia importante frente a los héroes: los monstruos **se
 * mueven un número fijo de casillas**, no tiran 2d6. Y se defienden con el
 * escudo negro, que sale en 1 de cada 6 caras, mientras que los héroes usan el
 * blanco, que sale en 2 de cada 6. Por eso un monstruo con 4 dados de defensa
 * aguanta menos de lo que parece.
 */

export type EspecieMonstruo =
  | "goblin"
  | "orco"
  | "fimir"
  | "esqueleto"
  | "zombi"
  | "momia"
  | "guerreroDelCaos"
  | "gargola"
  | "hechiceroDelCaos"
  | "trollDeLasCavernas";

export interface PlantillaMonstruo {
  especie: EspecieMonstruo;
  nombre: string;
  /** Casillas por turno. Fijo, no se tira. */
  movimiento: number;
  ataque: number;
  defensa: number;
  cuerpo: number;
  mente: number;
  /** Los no-muertos tienen mente 0 y son inmunes a lo que apunta a la mente. */
  noMuerto: boolean;
}

export const MONSTRUOS: Readonly<Record<EspecieMonstruo, PlantillaMonstruo>> = {
  goblin:           { especie: "goblin",           nombre: "Goblin",             movimiento: 10, ataque: 2, defensa: 1, cuerpo: 1, mente: 1, noMuerto: false },
  orco:             { especie: "orco",             nombre: "Orco",               movimiento:  8, ataque: 3, defensa: 2, cuerpo: 1, mente: 2, noMuerto: false },
  fimir:            { especie: "fimir",            nombre: "Fimir",              movimiento:  6, ataque: 3, defensa: 3, cuerpo: 2, mente: 3, noMuerto: false },
  esqueleto:        { especie: "esqueleto",        nombre: "Esqueleto",          movimiento:  6, ataque: 2, defensa: 2, cuerpo: 1, mente: 0, noMuerto: true  },
  zombi:            { especie: "zombi",            nombre: "Zombi",              movimiento:  4, ataque: 2, defensa: 3, cuerpo: 1, mente: 0, noMuerto: true  },
  momia:            { especie: "momia",            nombre: "Momia",              movimiento:  4, ataque: 3, defensa: 4, cuerpo: 2, mente: 0, noMuerto: true  },
  guerreroDelCaos:  { especie: "guerreroDelCaos",  nombre: "Guerrero del Caos",  movimiento:  7, ataque: 4, defensa: 4, cuerpo: 3, mente: 3, noMuerto: false },
  gargola:          { especie: "gargola",          nombre: "Gárgola",            movimiento:  6, ataque: 4, defensa: 5, cuerpo: 3, mente: 4, noMuerto: false },
  hechiceroDelCaos: { especie: "hechiceroDelCaos", nombre: "Hechicero del Caos", movimiento:  6, ataque: 3, defensa: 4, cuerpo: 2, mente: 6, noMuerto: false },
  /**
   * Añadido nuestro, no de la caja: lo pidió Juan Luis el 2026-09-06 para las
   * misiones difíciles que vendrán, y está firmado en `_ESTADO.md`. Su idea,
   * con sus palabras: muy fuerte y resistente pero muy torpe, un solo dado de
   * ataque y dos casillas por turno como mucho, y a cambio muchos dados de
   * defensa. Lo que él fijó es eso —movimiento 2, ataque 1—; la defensa 6 y el
   * cuerpo 10 son la concreción de «muchos» y «muchísimos», elegidos para que
   * sea un muro que avanza, no un verdugo: pega poco, casi no llega, y aun así
   * hay que decidir si el grupo lo desgasta entre cuatro o le huye. Se ajustan
   * en esta línea si al jugarlo no cuadran; el reglamento no tiene troll, así
   * que no hay nada que cotejar.
   */
  trollDeLasCavernas: { especie: "trollDeLasCavernas", nombre: "Troll de las Cavernas", movimiento: 2, ataque: 1, defensa: 6, cuerpo: 10, mente: 1, noMuerto: false },
};

export const ESPECIES = Object.keys(MONSTRUOS) as EspecieMonstruo[];
