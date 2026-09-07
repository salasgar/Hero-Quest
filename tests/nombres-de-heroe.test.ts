import { describe, expect, it } from "vitest";
import { CLASES_HEROE, nombreDeClase, type ClaseHeroe, type Genero } from "../src/data/heroes";
import { NOMBRES_HEROE, repartirNombresDeHeroe } from "../src/data/nombresHeroe";
import { crearPartida, type HeroeElegido } from "../src/engine/partida";
import { crearRng } from "../src/engine/rng";
import { MISION_PRUEBA, c } from "./ayuda";

const GENEROS: readonly Genero[] = ["m", "f"];

/** Una partida solo con héroes: lo que hace falta para mirar sus nombres. */
const conHeroes = (heroes: HeroeElegido[], semilla = 42) =>
  crearPartida({ mision: MISION_PRUEBA, heroes, monstruos: [], semilla });

describe("la lista de nombres de héroe", () => {
  it("cubre las cinco clases en los dos géneros, con diez o más cada una", () => {
    expect(Object.keys(NOMBRES_HEROE).sort()).toEqual([...CLASES_HEROE].sort());
    for (const clase of CLASES_HEROE) {
      for (const genero of GENEROS) {
        expect(NOMBRES_HEROE[clase][genero].length).toBeGreaterThanOrEqual(10);
      }
    }
  });

  it("no repite ningún nombre dentro de una lista", () => {
    for (const clase of CLASES_HEROE) {
      for (const genero of GENEROS) {
        const lista = NOMBRES_HEROE[clase][genero];
        expect(new Set(lista).size).toBe(lista.length);
      }
    }
  });

  it("no llama a nadie como su clase, que es el fallo que vino a arreglar", () => {
    for (const clase of CLASES_HEROE) {
      for (const genero of GENEROS) {
        expect(NOMBRES_HEROE[clase][genero]).not.toContain(nombreDeClase(clase, genero));
      }
    }
  });

  it("trae nombres de varias palabras, como los pidió Juan Luis", () => {
    // Los dos ejemplos que dio el 2026-09-07, tal cual.
    expect(NOMBRES_HEROE.enano.m).toContain("Ácomer, hijo de Ádormir");
    expect(NOMBRES_HEROE.elfo.f).toContain("Groa de Cáliran");
    for (const clase of CLASES_HEROE) {
      for (const genero of GENEROS) {
        const largos = NOMBRES_HEROE[clase][genero].filter((n) => n.includes(" "));
        expect(largos.length).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it("no usa epítetos con artículo, que chocarían con el molde del relato", () => {
    // El relato compone «{nombre} el {Clase}» (`relato.ts`). Un nombre que
    // arrancara con un epíteto —«Brúno el Tuerto»— daría «Brúno el Tuerto el
    // Bárbaro», con dos artículos seguidos peleándose. Los de dentro de una
    // aposición no molestan («hijo de la Aurora»), así que lo que se prohíbe es
    // el artículo pegado al nombre de pila, no el artículo en cualquier sitio.
    for (const clase of CLASES_HEROE) {
      for (const genero of GENEROS) {
        for (const n of NOMBRES_HEROE[clase][genero]) {
          expect(n).not.toMatch(/^\S+ (el|la|los|las) /i);
        }
      }
    }
  });
});

describe("el reparto de nombres de héroe", () => {
  it("da nombres distintos a dos héroes de la misma clase y género", () => {
    const e = conHeroes([{ clase: "enano" }, { clase: "enano" }]);
    expect(e.heroes[0]!.nombre).not.toBe(e.heroes[1]!.nombre);
  });

  it("no le pone a nadie el nombre de su clase", () => {
    const e = conHeroes(
      CLASES_HEROE.flatMap((clase) => GENEROS.map((genero) => ({ clase, genero }))),
    );
    for (const h of e.heroes) {
      expect(h.nombre).not.toBe(nombreDeClase(h.clase, h.genero));
    }
  });

  it("respeta el nombre propio y no se lo da a nadie más de su clase y género", () => {
    // «Bórin» está en la lista de enano masculino: si el reparto no lo sacara
    // de la bolsa, el segundo enano podría salir Bórin también.
    const propio = NOMBRES_HEROE.enano.m[1]!;
    const heroes: HeroeElegido[] = [
      { clase: "enano", nombre: propio },
      { clase: "enano" },
      { clase: "enano" },
    ];
    const e = conHeroes(heroes);
    expect(e.heroes[0]!.nombre).toBe(propio);
    expect(e.heroes[1]!.nombre).not.toBe(propio);
    expect(e.heroes[2]!.nombre).not.toBe(propio);
    expect(new Set(e.heroes.map((h) => h.nombre)).size).toBe(3);
  });

  it("limpia los espacios del nombre propio, y uno en blanco cuenta como sin nombre", () => {
    const e = conHeroes([{ clase: "mago", nombre: "  Sabino  " }, { clase: "mago", nombre: "   " }]);
    expect(e.heroes[0]!.nombre).toBe("Sabino");
    expect(e.heroes[1]!.nombre).not.toBe("");
    expect(NOMBRES_HEROE.mago.m).toContain(e.heroes[1]!.nombre);
  });

  it("con la misma semilla da los mismos nombres, y con otra no los mismos", () => {
    const grupo: HeroeElegido[] = [{ clase: "barbaro" }, { clase: "elfo", genero: "f" }];
    const a = conHeroes(grupo, 7).heroes.map((h) => h.nombre);
    const b = conHeroes(grupo, 7).heroes.map((h) => h.nombre);
    expect(a).toEqual(b);

    // No es garantía teórica —dos semillas pueden coincidir—, pero con estas
    // dos no coinciden, y sirve de red por si el sorteo dejara de mirar la
    // semilla: entonces esto fallaría siempre.
    expect(conHeroes(grupo, 8).heroes.map((h) => h.nombre)).not.toEqual(a);
  });

  it("aguanta ocho héroes de la misma clase y género sin repetir (T16)", () => {
    const ocho: HeroeElegido[] = Array.from({ length: 8 }, () => ({
      clase: "enano" as ClaseHeroe,
      genero: "f" as Genero,
    }));
    const e = conHeroes(ocho);
    expect(new Set(e.heroes.map((h) => h.nombre)).size).toBe(8);
  });

  it("si se agota la lista, da otra vuelta con ordinal en vez de repetir", () => {
    // Más héroes que nombres hay: en una partida no puede pasar (ocho como
    // mucho, T16), pero la reserva tiene que existir igual, como en T42.
    const cuantos = NOMBRES_HEROE.hada.m.length + 3;
    const muchos = Array.from({ length: cuantos }, () => ({ clase: "hada" as ClaseHeroe }));
    const nombres = repartirNombresDeHeroe(muchos, crearRng(1));
    expect(new Set(nombres).size).toBe(cuantos);
    expect(nombres.filter((n) => n.endsWith(" II"))).toHaveLength(3);
  });

  it("no da el mismo nombre a un hada masculina y a una femenina", () => {
    // Las dos comparten lista (`NOMBRES_HADA`) y sortean en bolsas distintas:
    // sin el conjunto de usados global, saldrían repetidas tarde o temprano.
    const seis: HeroeElegido[] = [
      { clase: "hada", genero: "m" },
      { clase: "hada", genero: "f" },
      { clase: "hada", genero: "m" },
      { clase: "hada", genero: "f" },
      { clase: "hada", genero: "m" },
      { clase: "hada", genero: "f" },
    ];
    for (const semilla of [1, 2, 3, 42, 1000]) {
      const e = conHeroes(seis, semilla);
      expect(new Set(e.heroes.map((h) => h.nombre)).size).toBe(6);
    }
  });

  it("no toca la corriente de los monstruos ni la de los temperamentos", () => {
    // La prueba de que el desplazamiento de la semilla no choca con los otros
    // dos: el mismo calabozo con uno y con cinco héroes tiene que dar los
    // mismos monstruos, con el mismo nombre y el mismo temperamento.
    const monstruos = [
      { id: "g1", especie: "goblin" as const, celda: c(10, 10) },
      { id: "g2", especie: "goblin" as const, celda: c(11, 10) },
      { id: "o1", especie: "orco" as const, celda: c(12, 10) },
    ];
    const con = (heroes: HeroeElegido[]) =>
      crearPartida({ mision: MISION_PRUEBA, heroes, monstruos, semilla: 99 }).monstruos.map((m) => [
        m.nombre,
        m.temperamento,
      ]);

    const uno = con([{ clase: "barbaro" }]);
    const cinco = con([
      { clase: "barbaro" },
      { clase: "enano" },
      { clase: "elfo", genero: "f" },
      { clase: "mago" },
      { clase: "hada" },
    ]);
    expect(cinco).toEqual(uno);
  });

  it("no se come tiradas de la partida: el generador del estado no se mueve", () => {
    // Si el sorteo tirase del generador de la partida en vez de uno derivado,
    // el `rng` del estado inicial cambiaría al añadir un héroe, y con él todas
    // las tiradas de todos los tests con semilla fija.
    const uno = conHeroes([{ clase: "barbaro" }], 5).rng;
    const cuatro = conHeroes(
      [{ clase: "barbaro" }, { clase: "enano" }, { clase: "elfo" }, { clase: "mago" }],
      5,
    ).rng;
    expect(cuatro).toEqual(uno);
  });
});
