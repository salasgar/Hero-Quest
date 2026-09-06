import { describe, expect, it } from "vitest";
import { ESPECIES } from "../src/data/monsters";
import { GENERO_ESPECIE, NOMBRES, RESERVA_POR_ESPECIE, repartirNombres } from "../src/data/nombres";
import { crearRng } from "../src/engine/rng";
import { crearPartida } from "../src/engine/partida";
import { nombreDe } from "../src/narrator/local";
import { MISION_PRUEBA, c } from "./ayuda";

describe("la lista de nombres", () => {
  it("tiene doce por especie, y todas las especies", () => {
    expect(Object.keys(NOMBRES).sort()).toEqual([...ESPECIES].sort());
    for (const especie of ESPECIES) {
      expect(NOMBRES[especie]).toHaveLength(12);
    }
  });

  it("no repite ningún nombre, ni dentro de una especie ni entre especies", () => {
    const todos = ESPECIES.flatMap((especie) => NOMBRES[especie]);
    expect(todos).toHaveLength(ESPECIES.length * 12);
    expect(new Set(todos).size).toBe(ESPECIES.length * 12);
  });

  it("da género gramatical a todas las especies", () => {
    for (const especie of ESPECIES) {
      expect(GENERO_ESPECIE[especie]).toMatch(/^[mf]$/);
    }
    // Las dos únicas femeninas de la caja: la gárgola y la momia.
    expect(GENERO_ESPECIE.gargola).toBe("f");
    expect(GENERO_ESPECIE.momia).toBe("f");
    expect(GENERO_ESPECIE.orco).toBe("m");
  });
});

describe("el reparto", () => {
  const seis = [
    { especie: "goblin" as const },
    { especie: "goblin" as const },
    { especie: "orco" as const },
    { especie: "orco" as const },
    { especie: "fimir" as const },
    { especie: "gargola" as const },
  ];

  it("da un nombre distinto a cada monstruo", () => {
    const { nombres } = repartirNombres(seis, crearRng(7));
    expect(nombres).toHaveLength(6);
    expect(new Set(nombres).size).toBe(6);
  });

  it("saca cada nombre de la lista de su especie", () => {
    const { nombres } = repartirNombres(seis, crearRng(7));
    seis.forEach((m, i) => {
      expect(NOMBRES[m.especie]).toContain(nombres[i]);
    });
  });

  it("deja una reserva por especie para los que nazcan después", () => {
    const { libres } = repartirNombres(seis, crearRng(7));
    for (const especie of ESPECIES) {
      expect(libres[especie]).toHaveLength(RESERVA_POR_ESPECIE);
    }
  });

  it("respeta el nombre que fija la misión y no se lo da a otro", () => {
    const conJefe = [
      { especie: "fimir" as const, nombre: "Bórgorum" },
      { especie: "fimir" as const },
      { especie: "fimir" as const },
    ];
    const { nombres, libres } = repartirNombres(conJefe, crearRng(3));
    expect(nombres[0]).toBe("Bórgorum");
    expect(nombres.slice(1)).not.toContain("Bórgorum");
    expect(libres.fimir).not.toContain("Bórgorum");
  });

  it("con más monstruos que nombres, añade un ordinal en vez de repetir", () => {
    const trece = Array.from({ length: 13 }, () => ({ especie: "goblin" as const }));
    const { nombres } = repartirNombres(trece, crearRng(1));
    expect(new Set(nombres).size).toBe(13);
    expect(nombres.filter((n) => n.endsWith(" II"))).toHaveLength(1);
  });
});

describe("los nombres en la partida", () => {
  const monstruos = [
    { id: "gob1", especie: "goblin" as const, celda: c(10, 5) },
    { id: "gob2", especie: "goblin" as const, celda: c(11, 5) },
    { id: "orc1", especie: "orco" as const, celda: c(12, 5) },
  ];

  const conSemilla = (semilla: number) =>
    crearPartida({
      mision: MISION_PRUEBA,
      heroes: [{ clase: "barbaro" }],
      monstruos,
      semilla,
    });

  it("ningún monstruo repite nombre", () => {
    const e = conSemilla(42);
    const nombres = e.monstruos.map((m) => m.nombre);
    expect(new Set(nombres).size).toBe(nombres.length);
    expect(nombres.every((n) => n.length > 0)).toBe(true);
  });

  it("con la misma semilla salen los mismos nombres", () => {
    expect(conSemilla(42).monstruos.map((m) => m.nombre)).toEqual(
      conSemilla(42).monstruos.map((m) => m.nombre),
    );
  });

  it("con otra semilla salen otros", () => {
    // Con dos goblins y un orco de tres listas de doce, dos semillas distintas
    // podrían coincidir por casualidad; se comparan varias para que el test no
    // dependa de la suerte.
    const distintas = [1, 2, 3, 4, 5].map((s) => conSemilla(s).monstruos.map((m) => m.nombre).join("|"));
    expect(new Set(distintas).size).toBeGreaterThan(1);
  });

  it("el sorteo de nombres no toca el generador de la partida", () => {
    // La trampa de la ficha: si los nombres consumieran el generador del
    // estado, cambiarían el mazo de tesoros y todas las tiradas siguientes.
    const conMonstruos = conSemilla(42);
    const sinMonstruos = crearPartida({
      mision: MISION_PRUEBA,
      heroes: [{ clase: "barbaro" }],
      monstruos: [],
      semilla: 42,
    });
    expect(conMonstruos.rng).toEqual(sinMonstruos.rng);
    expect(conMonstruos.mazoTesoros).toEqual(sinMonstruos.mazoTesoros);
  });

  it("una misión puede fijar el nombre de un monstruo", () => {
    const e = crearPartida({
      mision: MISION_PRUEBA,
      heroes: [{ clase: "barbaro" }],
      monstruos: [{ id: "jefe", especie: "orco", celda: c(10, 5), nombre: "Jújrur" }],
      semilla: 42,
    });
    expect(e.monstruos[0]!.nombre).toBe("Jújrur");
  });

  it("el estado sigue siendo JSON puro con la reserva dentro", () => {
    const e = conSemilla(42);
    expect(JSON.parse(JSON.stringify(e)).nombresLibres).toEqual(e.nombresLibres);
  });
});

describe("nombreDe", () => {
  const e = crearPartida({
    mision: MISION_PRUEBA,
    heroes: [{ clase: "barbaro", nombre: "Aldric" }],
    monstruos: [
      { id: "orc1", especie: "orco", celda: c(10, 5), nombre: "Górbak" },
      { id: "gar1", especie: "gargola", celda: c(11, 5), nombre: "Vórtiga" },
      { id: "mom1", especie: "momia", celda: c(12, 5), nombre: "Anhotep" },
    ],
    semilla: 42,
  });

  it("da «el orco Górbak», con el artículo del género de la especie", () => {
    expect(nombreDe(e, "orc1")).toBe("el orco Górbak");
  });

  it("las especies femeninas llevan «la»", () => {
    expect(nombreDe(e, "gar1")).toBe("la gárgola Vórtiga");
    expect(nombreDe(e, "mom1")).toBe("la momia Anhotep");
  });

  it("los héroes van sin artículo, como antes", () => {
    expect(nombreDe(e, "barbaro")).toBe("Aldric");
  });
});
