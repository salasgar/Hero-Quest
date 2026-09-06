/**
 * T32 · La niebla: qué ve quien juega desde su casa.
 *
 * Lo que se prueba es la función pura, porque los componentes de React no se
 * prueban en este repositorio (`vite.config.ts` monta el entorno `node`). Esa es
 * justo la razón de que la niebla viva en una función y no dentro del JSX.
 *
 * **Trampa que se lleva por delante a quien monta estos tests dentro de una
 * sala:** `puedeVer` da por visto todo lo que hay en una sala revelada, sin
 * trazar rectas. Aquí no se usa `puedeVer` —la niebla filtra por
 * `salasReveladas`, `puertasVistas` y `monstruosEnTablero`, que son campos del
 * estado— pero el aviso vale igual: hay que montar el caso donde la regla se
 * nota, y no uno donde todo sale visible de rebote.
 */

import { describe, expect, it } from "vitest";
import { comoLoVe, monstruosQueVe } from "../src/red/niebla";
import type { EstadoPartida } from "../src/engine/types";
import { c, enTablero, partida, situar } from "./ayuda";

/**
 * Dos monstruos elegidos a propósito: uno dentro de la sala `a` y otro en el
 * pasillo. El del pasillo es el que distingue una niebla de verdad de una que
 * filtra por «¿está su sala abierta?»: un pasillo no es ninguna sala, así que
 * ese filtro lo dejaría ver siempre.
 */
const escena = (): EstadoPartida => {
  const e = partida({
    monstruos: [
      { id: "enLaSala", especie: "orco", celda: c(2, 2) },
      { id: "enElPasillo", especie: "goblin", celda: c(0, 6) },
    ],
  });
  // `crearPartida` **ya descubre** a quien se vea desde la entrada, y hace bien:
  // el goblin del pasillo está a la vista del grupo desde la primera pantalla,
  // así que sale con `monstruosEnTablero` puesto. Estos tests prueban el filtro,
  // no el descubrimiento, así que se parte de cero y se va descubriendo a mano
  // con `enTablero`. Se supo porque tres de ellos fallaron afirmando lo
  // contrario.
  return { ...e, monstruosEnTablero: [] };
};

describe("lo que ve la mesa", () => {
  it("es el estado entero, sin recortar", () => {
    const e = escena();
    // El mismo objeto, no una copia: en la mesa no hay nada que revisar.
    expect(comoLoVe(e, "mesa")).toBe(e);
  });

  it("incluye a los monstruos que los héroes no han encontrado", () => {
    expect(monstruosQueVe(escena(), "mesa").sort()).toEqual(["enElPasillo", "enLaSala"]);
  });
});

describe("lo que ve quien juega desde su casa", () => {
  it("no ve ningún monstruo sin descubrir, ni en sala ni en pasillo", () => {
    // Sin `enTablero`, ninguno de los dos está descubierto.
    expect(monstruosQueVe(escena(), "desdeCasa")).toEqual([]);
  });

  it("ve al que ya está sobre el tablero, y solo a ese", () => {
    const e = enTablero(escena(), "enElPasillo");
    expect(monstruosQueVe(e, "desdeCasa")).toEqual(["enElPasillo"]);
  });

  it("descubrir a uno cambia lo que ve, sin tocar el estado", () => {
    const antes = escena();
    const despues = enTablero(antes, "enLaSala");

    expect(monstruosQueVe(antes, "desdeCasa")).toEqual([]);
    expect(monstruosQueVe(despues, "desdeCasa")).toEqual(["enLaSala"]);
    // La niebla mira, no toca: el estado de partida sigue teniendo a los dos.
    expect(antes.monstruos).toHaveLength(2);
    expect(despues.monstruos).toHaveLength(2);
  });

  it("no ve una puerta que nadie ha mirado", () => {
    const e = escena();
    const conPuerta: EstadoPartida = {
      ...e,
      puertas: [
        { id: "px", a: c(4, 2), b: c(5, 2), abierta: false, secreta: false, descubierta: false },
      ],
      puertasVistas: [],
    };
    expect(comoLoVe(conPuerta, "desdeCasa").puertas).toHaveLength(0);
    expect(comoLoVe({ ...conPuerta, puertasVistas: ["px"] }, "desdeCasa").puertas).toHaveLength(1);
  });

  it("sí ve una puerta secreta ya encontrada, aunque no esté en `puertasVistas`", () => {
    // Este es el caso que se coló al filtrar a mano por `puertasVistas`: las
    // secretas van por `descubierta`, así que la puerta que el enano acababa de
    // encontrar desaparecía del tablero de quien juega desde su casa. Se
    // arregló consumiendo `puertasVisibles`, que es el selector del motor.
    const secreta: EstadoPartida = {
      ...escena(),
      puertas: [
        { id: "ps", a: c(4, 3), b: c(5, 3), abierta: false, secreta: true, descubierta: true },
      ],
      puertasVistas: [],
    };
    expect(comoLoVe(secreta, "desdeCasa").puertas.map((p) => p.id)).toEqual(["ps"]);
    expect(
      comoLoVe({ ...secreta, puertas: [{ ...secreta.puertas[0]!, descubierta: false }] }, "desdeCasa")
        .puertas,
    ).toHaveLength(0);
  });

  it("no ve una trampa que sigue oculta", () => {
    const e = escena();
    const conTrampas: EstadoPartida = {
      ...e,
      trampas: [
        { id: "oculta", tipo: "foso", celda: c(3, 3), descubierta: false, gastada: false },
        { id: "vista", tipo: "foso", celda: c(3, 4), descubierta: true, gastada: false },
      ],
    };
    expect(comoLoVe(conTrampas, "desdeCasa").trampas.map((t) => t.id)).toEqual(["vista"]);
    // Y la mesa las ve las dos, que es lo que hace útil el aviso ⚠ del máster.
    expect(comoLoVe(conTrampas, "mesa").trampas).toHaveLength(2);
  });

  it("no se lleva el orden del mazo de tesoros", () => {
    const e = escena();
    expect(e.mazoTesoros.length).toBeGreaterThan(0);
    expect(comoLoVe(e, "desdeCasa").mazoTesoros).toEqual([]);
  });

  it("ve a los héroes, que son el grupo y no un secreto", () => {
    const e = situar(escena(), "barbaro", c(1, 1));
    expect(comoLoVe(e, "desdeCasa").heroes).toHaveLength(e.heroes.length);
  });

  it("una sala abierta deja ver lo que hay dentro", () => {
    // Revelar la sala no basta por sí solo —el monstruo tiene que estar
    // descubierto— y esa es exactamente la regla que puso T18. Se comprueban las
    // dos mitades juntas para que no se cuele una a costa de la otra.
    const soloRevelada: EstadoPartida = { ...escena(), salasReveladas: ["a"] };
    expect(monstruosQueVe(soloRevelada, "desdeCasa")).toEqual([]);
    expect(monstruosQueVe(enTablero(soloRevelada, "enLaSala"), "desdeCasa")).toEqual(["enLaSala"]);
  });
});
