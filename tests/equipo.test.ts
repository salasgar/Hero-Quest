import { describe, expect, it } from "vitest";
import { ARMADURAS, ARMAS, EQUIPO, type IdEquipo } from "../src/data/equipment";
import { CLASES_HEROE, HEROES, puedeLlevar } from "../src/data/heroes";

const TODO = Object.keys(EQUIPO) as IdEquipo[];

describe("qué puede llevar cada clase", () => {
  it("el mago no lleva ninguna pieza de armadura", () => {
    // Reglamento 2021 (F3649), p. 13: «their inability to wear normal armor».
    expect(puedeLlevar("mago", "yelmo")).toBe(false);
    expect(puedeLlevar("mago", "cotaDeMalla")).toBe(false);
    expect(puedeLlevar("mago", "armaduraDePlacas")).toBe(false);
    expect(puedeLlevar("mago", "escudo")).toBe(false);
    expect(ARMADURAS.every((a) => !puedeLlevar("mago", a.id))).toBe(true);
  });

  it("el mago sí lleva su daga", () => {
    // La p. 13 le da la daga como arma inicial: la regla no puede quitársela.
    expect(puedeLlevar("mago", "daga")).toBe(true);
  });

  it("el bárbaro puede llevarlo todo", () => {
    expect(TODO.filter((id) => !puedeLlevar("barbaro", id))).toEqual([]);
  });

  it("el enano y el elfo tampoco tienen ninguna traba", () => {
    // El elfo lanza magia y aun así compra lo que quiera: la traba es del mago.
    expect(TODO.filter((id) => !puedeLlevar("enano", id))).toEqual([]);
    expect(TODO.filter((id) => !puedeLlevar("elfo", id))).toEqual([]);
  });

  it("el hada va con las mismas trabas que el mago", () => {
    // Decisión nuestra, no del reglamento: el hada no viene en la caja. El
    // porqué está escrito en su plantilla y en el registro de _ESTADO.md.
    expect(ARMADURAS.every((a) => !puedeLlevar("hada", a.id))).toBe(true);
    expect(puedeLlevar("hada", "daga")).toBe(true);
  });

  it("el equipo inicial de las cinco clases pasa su propia validación", () => {
    // El fallo que este test caza es de los que aparecen solos tres semanas
    // después: alguien veta una pieza que otra clase ya lleva puesta.
    const incoherentes = CLASES_HEROE.flatMap((clase) =>
      HEROES[clase].equipoInicial
        .filter((id) => !puedeLlevar(clase, id))
        .map((id) => `${clase} empieza con ${id}`),
    );
    expect(incoherentes).toEqual([]);
    expect(CLASES_HEROE).toHaveLength(5);
  });
});

describe("las armas grandes del mago, sin confirmar", () => {
  it("hoy no hay ninguna arma vetada, y está marcado como pendiente", () => {
    // La p. 13 dice que el mago no usa «large weapons» y en ninguna de las 24
    // páginas del reglamento se dice cuáles son: la lista vive en la carta de
    // personaje, que no tenemos. Este test fija que la lista está vacía **a
    // propósito**, no por olvido. Quien consiga las cartas rellenará
    // `equipoVetado`, quitará la marca y vendrá aquí a cambiar el test.
    for (const clase of CLASES_HEROE) {
      const { equipoVetado, armasGrandesPorConfirmar } = HEROES[clase].restricciones;
      expect(equipoVetado).toEqual([]);
      expect(armasGrandesPorConfirmar).toBe(clase === "mago" || clase === "hada");
    }
    // Y mientras siga así, el mago puede coger cualquier arma sin que le pare
    // nada. Es lo confirmado; lo demás sería inventárselo.
    expect(ARMAS.every((a) => puedeLlevar("mago", a.id))).toBe(true);
  });
});
