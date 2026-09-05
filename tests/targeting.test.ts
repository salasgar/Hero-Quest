/**
 * T8 · A quién ataca un monstruo cuando puede elegir.
 *
 * Aquí se prueba la puntuación, que es pura; el turno entero es
 * `zargon.test.ts`.
 *
 * **Los cuatro héroes tienen la misma defensa —2 dados— y ninguno lleva armadura
 * al empezar.** Eso importa al leer estos tests: al principio de la partida el
 * daño esperado es idéntico contra cualquiera de ellos, así que lo que decide es
 * todo lo demás —la mente, las heridas, el remate y la distancia—, y un test que
 * se apoye en el daño esperado sin herir a nadie no está probando nada.
 */

import { describe, expect, it } from "vitest";
import {
  danoEsperado,
  mejorObjetivo,
  objetivosPuntuados,
  puntuarObjetivo,
  probabilidadDeTumbar,
  P_CALAVERA,
  P_ESCUDO_BLANCO,
} from "../src/ai/targeting";
import type { EstadoPartida, Heroe, Mision } from "../src/engine/types";
import { c, enTablero, MISION_PRUEBA, partida, situar } from "./ayuda";

/**
 * La misión de prueba con sitio para dos héroes.
 *
 * `MISION_PRUEBA` tiene una sola casilla de entrada, y desde T6 `crearPartida`
 * se niega a arrancar si no caben todos sin apilarse: dos figuras en la misma
 * casilla es un estado ilegal desde el turno cero. Aquí da igual dónde entren
 * —cada test los coloca con `situar`—, pero tienen que caber.
 */
const MISION: Mision = { ...MISION_PRUEBA, entrada: [c(1, 1), c(1, 2)] };

const turnoDeZargon = (e: EstadoPartida): EstadoPartida =>
  enTablero({
    ...e,
    turno: { ...e.turno, indice: e.turno.orden.indexOf("zargon") },
    salasReveladas: ["a"],
  });

/** Le quita cuerpo a un héroe sin pasar por el motor: es una escena, no una regla. */
const herir = (e: EstadoPartida, id: string, puntos: number): EstadoPartida => ({
  ...e,
  heroes: e.heroes.map((h) => (h.id === id ? { ...h, cuerpo: h.cuerpo - puntos } : h)),
});

const heroe = (e: EstadoPartida, id: string): Heroe => e.heroes.find((h) => h.id === id)!;
const monstruo = (e: EstadoPartida, id: string) => e.monstruos.find((m) => m.id === id)!;

/**
 * Dos bárbaros, para que la clase no meta ruido: lo único que los distingue en
 * cada test es lo que el test cambia.
 *
 * `crearPartida` da los identificadores `barbaro` y `barbaro2`.
 */
const dosIguales = (): EstadoPartida => {
  let e = turnoDeZargon(
    partida({
      mision: MISION,
      heroes: [{ clase: "barbaro" }, { clase: "barbaro" }],
      monstruos: [{ id: "orco", especie: "orco", celda: c(2, 2) }],
    }),
  );
  e = situar(e, "barbaro", c(2, 1));
  e = situar(e, "barbaro2", c(2, 3));
  return e;
};

describe("el daño esperado, que es lo único que no es una hipótesis", () => {
  it("sale de los dados y del reparto de caras, no de una estimación", () => {
    const e = dosIguales();
    // Orco: 3 dados de ataque. Bárbaro: 2 de defensa y para con el escudo blanco.
    const esperado = 3 * P_CALAVERA - 2 * P_ESCUDO_BLANCO;
    expect(danoEsperado(e, monstruo(e, "orco"), heroe(e, "barbaro"))).toBeCloseTo(esperado);
  });

  it("rematar NO se decide con la media, y esa es la trampa de esta tarea", () => {
    // La primera versión cobraba el remate cuando «daño esperado ≥ cuerpo que le
    // queda». Contra un héroe con 1 de cuerpo, un orco tiene una media de 0,83:
    // la condición no se cumplía **nunca** y el monstruo pasaba de largo del
    // moribundo. La media dice cuánto se saca por término medio; rematar es una
    // pregunta de cola. Este test fija las dos cifras juntas para que se vea.
    let e = dosIguales();
    e = herir(e, "barbaro", 7);
    const orco = monstruo(e, "orco");
    expect(danoEsperado(e, orco, heroe(e, "barbaro"))).toBeLessThan(1);
    expect(probabilidadDeTumbar(e, orco, heroe(e, "barbaro"))).toBeGreaterThan(0.5);
  });

  it("a un héroe entero no se le tumba de un golpe", () => {
    const e = dosIguales();
    // Ocho de cuerpo y tres dados: no hay tirada que lo haga.
    expect(probabilidadDeTumbar(e, monstruo(e, "orco"), heroe(e, "barbaro"))).toBe(0);
  });

  it("los héroes paran más que los monstruos con los mismos dados", () => {
    // Es la asimetría del dado de combate: 2 caras de escudo blanco contra 1 de
    // escudo negro. Si esto se invirtiera, la táctica entera puntuaría al revés.
    expect(P_ESCUDO_BLANCO).toBeGreaterThan(1 / 6);
    expect(P_CALAVERA).toBe(0.5);
  });
});

describe("entre dos héroes iguales", () => {
  it("va al herido", () => {
    // `barbaro2` es el **último** por orden alfabético, así que si la heurística
    // no hiciera nada el desempate por identificador pondría a `barbaro` primero
    // y este test fallaría. El orden esperado no es el que sale solo.
    const e = herir(dosIguales(), "barbaro2", 4);
    expect(mejorObjetivo(e, monstruo(e, "orco"))?.objetivo.id).toBe("barbaro2");
  });

  it("y si ninguno está herido, decide el desempate escrito, no el sort", () => {
    const e = dosIguales();
    const orden = objetivosPuntuados(e, monstruo(e, "orco")).map((p) => p.objetivo.id);
    expect(orden).toEqual(["barbaro", "barbaro2"]);
    // Puro: dos llamadas, el mismo orden. De esto vive el «deshacer».
    expect(objetivosPuntuados(e, monstruo(e, "orco")).map((p) => p.objetivo.id)).toEqual(orden);
  });

  it("rematar pesa más que acabar de herir", () => {
    // A uno le queda 1 de cuerpo —el orco puede tumbarlo— y al otro le faltan 5,
    // que suma más por «heridoPrimero» pero no se puede rematar. Gana el remate:
    // un héroe caído deja de pegar para siempre.
    let e = dosIguales();
    e = herir(e, "barbaro", 3);
    e = herir(e, "barbaro2", 7);
    const mejor = mejorObjetivo(e, monstruo(e, "orco"));
    expect(mejor?.objetivo.id).toBe("barbaro2");
    expect(mejor?.desglose.remate).toBeGreaterThan(0);
  });
});

describe("el sesgo de ir a por quien lanza hechizos", () => {
  it("con todo lo demás igual, el mago vale más que el bárbaro", () => {
    let e = turnoDeZargon(
      partida({
        mision: MISION,
        // Con sus elementos: un mago sin elementos no tiene hechizos, y sin
        // hechizos este sesgo no se aplica —correctamente— y la escena no
        // probaría nada.
        heroes: [{ clase: "mago", elementos: ["fuego", "aire", "agua"] }, { clase: "barbaro" }],
        monstruos: [{ id: "orco", especie: "orco", celda: c(2, 2) }],
      }),
    );
    // A la misma distancia, para que no sea la cercanía la que decide.
    e = situar(e, "mago", c(2, 1));
    e = situar(e, "barbaro", c(2, 3));
    expect(mejorObjetivo(e, monstruo(e, "orco"))?.objetivo.id).toBe("mago");
  });

  it("cuenta hechizos sin gastar, no puntos de mente", () => {
    // El enano tiene 3 de mente y no lanza ni uno. Contar mente hacía que la
    // pantalla dijera en la mesa «el enano lanza hechizos», que es mentira, y
    // que un mago con las nueve cartas gastadas siguiera siendo la presa
    // preferida. Un bárbaro no suma nada por este término.
    const e = dosIguales();
    const p = puntuarObjetivo(e, monstruo(e, "orco"), heroe(e, "barbaro"));
    expect(heroe(e, "barbaro").mente).toBeGreaterThan(0);
    expect(p.desglose.lanzaHechizos).toBe(0);
  });

  it("y un mago que ya ha gastado sus hechizos deja de ser el preferido", () => {
    let e = turnoDeZargon(
      partida({
        mision: MISION,
        heroes: [{ clase: "mago", elementos: ["fuego", "aire", "agua"] }, { clase: "barbaro" }],
        monstruos: [{ id: "orco", especie: "orco", celda: c(2, 2) }],
      }),
    );
    e = situar(e, "mago", c(2, 1));
    e = situar(e, "barbaro", c(2, 3));
    expect(mejorObjetivo(e, monstruo(e, "orco"))?.objetivo.id).toBe("mago");

    // Gastadas las nueve cartas, es un héroe de 4 de cuerpo con una daga.
    const gastado: EstadoPartida = {
      ...e,
      heroes: e.heroes.map((h) => (h.id === "mago" ? { ...h, hechizosGastados: [...h.hechizos] } : h)),
    };
    expect(mejorObjetivo(gastado, monstruo(gastado, "orco"))?.desglose.lanzaHechizos).toBe(0);
  });
});

describe("lo que está lejos, y lo que no está", () => {
  it("a igualdad de todo, gana el más cercano", () => {
    let e = dosIguales();
    e = situar(e, "barbaro2", c(4, 4));
    expect(mejorObjetivo(e, monstruo(e, "orco"))?.objetivo.id).toBe("barbaro");
  });

  it("un héroe sin camino no es un objetivo: es -Infinity, no un cero", () => {
    // Fuera de la sala `a` y sin puertas en la misión de prueba: no hay ruta.
    // Un cero diría «regular» y podría ganarle a un objetivo malo pero posible.
    let e = dosIguales();
    e = situar(e, "barbaro2", c(20, 15));
    const p = puntuarObjetivo(e, monstruo(e, "orco"), heroe(e, "barbaro2"));
    expect(p.total).toBe(-Infinity);
    expect(objetivosPuntuados(e, monstruo(e, "orco"))[1]?.objetivo.id).toBe("barbaro2");
  });

  it("si no se llega a ninguno, no hay mejor objetivo", () => {
    let e = dosIguales();
    e = situar(e, "barbaro", c(20, 15));
    e = situar(e, "barbaro2", c(21, 15));
    expect(mejorObjetivo(e, monstruo(e, "orco"))).toBeNull();
  });

  it("a los caídos no se les puntúa", () => {
    const e = herir(dosIguales(), "barbaro2", 8);
    expect(objetivosPuntuados(e, monstruo(e, "orco")).map((p) => p.objetivo.id)).toEqual([
      "barbaro",
    ]);
  });
});
