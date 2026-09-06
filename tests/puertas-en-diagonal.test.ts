/**
 * T19 · Una puerta se abre también desde la diagonal.
 *
 * Regla de la casa, no del reglamento (Juan Luis, 2026-09-05): vale cualquier
 * casilla que comparta un **vértice con la puerta**, no con sus casillas. Son
 * seis, no diez: `a`, `b` y las cuatro que flanquean el vano. Y una diagonal
 * solo cuenta desde el mismo lado del muro: nadie abre una puerta metiendo el
 * brazo por dentro de la pared.
 *
 * El test que sostiene la tarea es el último: el selector que pinta el botón y
 * la guarda del motor tienen que decir lo mismo en las 494 casillas del
 * tablero. La regla estaba escrita dos veces y así es como volvería a estarlo.
 */

import { describe, expect, it } from "vitest";
import { ALTO_TABLERO, ANCHO_TABLERO } from "../src/data/board-base";
import {
  MISION_CALABOZO,
  MUEBLES_CALABOZO,
  PUERTAS_CALABOZO,
  TRAMPAS_CALABOZO,
} from "../src/data/quests/calabozo";
import { celdasQueAbren } from "../src/engine/board";
import { aplicarAccion } from "../src/engine/reducer";
import { puertasAlAlcance } from "../src/engine/selectors";
import type { Celda, Puerta } from "../src/engine/types";
import { c, partida, rechaza, situar } from "./ayuda";

/**
 * El calabozo con un solo héroe: los otros tres estorbarían al ir plantando al
 * bárbaro por todo el tablero. Sin monstruos, por lo mismo.
 */
const calabozo = (puertas: Puerta[] = PUERTAS_CALABOZO) =>
  partida({
    mision: MISION_CALABOZO,
    heroes: [{ clase: "barbaro" }],
    monstruos: [],
    puertas,
    muebles: MUEBLES_CALABOZO,
    trampas: TRAMPAS_CALABOZO,
  });

/** `psecreta` ya descubierta: hasta entonces la guarda del secreto va primero. */
const conSecretaDescubierta = PUERTAS_CALABOZO.map((p) =>
  p.id === "psecreta" ? { ...p, descubierta: true } : p,
);

const clave = (x: Celda) => `${x.x},${x.y}`;
const claves = (cs: readonly Celda[]) => cs.map(clave).sort();

const abre = (celda: Celda, puerta: string, puertas?: Puerta[]) => {
  const e = situar(calabozo(puertas), "barbaro", celda);
  return aplicarAccion(e, { tipo: "abrirPuerta", puerta }).ok;
};

describe("qué casillas tocan la puerta", () => {
  it("son seis: el vano y las cuatro que lo flanquean", () => {
    const ps = PUERTAS_CALABOZO.find((p) => p.id === "ps")!;

    // `ps` es (12,15)-(11,15), horizontal: las diagonales van en vertical.
    expect(claves(celdasQueAbren(ps))).toEqual(
      claves([c(12, 15), c(11, 15), c(12, 14), c(12, 16), c(11, 14), c(11, 16)]),
    );
  });

  it("una puerta vertical las cuenta en horizontal", () => {
    const pr = PUERTAS_CALABOZO.find((p) => p.id === "pr")!;

    // `pr` es (6,18)-(6,17): mismo criterio girado, y es la comprobación de que
    // la perpendicular no está escrita a mano para el caso horizontal.
    expect(claves(celdasQueAbren(pr))).toEqual(
      claves([c(6, 18), c(6, 17), c(5, 18), c(7, 18), c(5, 17), c(7, 17)]),
    );
  });

  it("ninguna puerta del calabozo pasa de seis", () => {
    for (const p of PUERTAS_CALABOZO) expect(celdasQueAbren(p).length).toBeLessThanOrEqual(6);
  });
});

describe("abrir `ps` desde cada una de las seis", () => {
  for (const celda of [c(12, 15), c(11, 15), c(12, 14), c(12, 16), c(11, 14), c(11, 16)]) {
    it(`desde ${clave(celda)}`, () => {
      expect(abre(celda, "ps")).toBe(true);
    });
  }

  it("desde (13,14) no: toca un vértice de (12,15), pero no de la puerta", () => {
    // Es el error fácil —las ocho vecinas de `a`— y además esa casilla existe:
    // es el vano de `pt`, la puerta de al lado.
    expect(rechaza(situar(calabozo(), "barbaro", c(13, 14)), {
      tipo: "abrirPuerta",
      puerta: "ps",
    })).toMatch(/junto a la puerta/i);
  });

  it("desde (13,15) tampoco: está en línea con el vano, no lo toca", () => {
    expect(abre(c(13, 15), "ps")).toBe(false);
  });
});

describe("la diagonal no atraviesa el muro", () => {
  // `psecreta` es (4,13)-(4,14), y une las salas `l` y `q`. Sus diagonales de
  // la izquierda —(3,13) y (3,14)— están en esas mismas salas; las de la
  // derecha —(5,13) y (5,14)— están en la sala `r`, al otro lado del muro.
  it("desde su lado, sí", () => {
    expect(abre(c(3, 13), "psecreta", conSecretaDescubierta)).toBe(true);
    expect(abre(c(3, 14), "psecreta", conSecretaDescubierta)).toBe(true);
  });

  it("desde la sala de al lado, no", () => {
    expect(abre(c(5, 13), "psecreta", conSecretaDescubierta)).toBe(false);
    expect(abre(c(5, 14), "psecreta", conSecretaDescubierta)).toBe(false);
  });

  it("y `celdasQueAbren` no las devuelve siquiera", () => {
    const secreta = PUERTAS_CALABOZO.find((p) => p.id === "psecreta")!;
    expect(claves(celdasQueAbren(secreta))).toEqual(
      claves([c(4, 13), c(4, 14), c(3, 13), c(3, 14)]),
    );
  });

  it("una secreta sin descubrir sigue siendo muro, también desde la diagonal", () => {
    expect(abre(c(3, 13), "psecreta")).toBe(false);
  });
});

describe("el selector y el motor no divergen", () => {
  it("en las 494 casillas del tablero dicen lo mismo", () => {
    const base = calabozo(conSecretaDescubierta);
    let miradas = 0;
    let acuerdos = 0;

    for (let y = 0; y < ALTO_TABLERO; y++)
      for (let x = 0; x < ANCHO_TABLERO; x++) {
        const e = situar(base, "barbaro", c(x, y));
        const delSelector = new Set(puertasAlAlcance(e).map((p) => p.id));
        for (const p of conSecretaDescubierta) {
          miradas++;
          const delMotor = aplicarAccion(e, { tipo: "abrirPuerta", puerta: p.id }).ok;
          if (delSelector.has(p.id) === delMotor) acuerdos++;
          else
            throw new Error(
              `en (${x},${y}) el selector dice ${delSelector.has(p.id)} y el motor ${delMotor} sobre ${p.id}`,
            );
        }
      }

    expect(miradas).toBe(ALTO_TABLERO * ANCHO_TABLERO * conSecretaDescubierta.length);
    expect(acuerdos).toBe(miradas);
  });

  it("y el acuerdo no es que digan que no a todo", () => {
    // Sin esto, el test de arriba pasaría con las dos mitades rotas a la vez.
    const base = calabozo(conSecretaDescubierta);
    const conPuerta = [];
    for (let y = 0; y < ALTO_TABLERO; y++)
      for (let x = 0; x < ANCHO_TABLERO; x++) {
        const e = situar(base, "barbaro", c(x, y));
        if (puertasAlAlcance(e).length > 0) conPuerta.push(clave(c(x, y)));
      }
    // El número sale de la misión, no de la regla, así que cambia cuando cambia
    // la lista de puertas del calabozo: la T40 la subió de cinco a veinticinco
    // para que se pueda entrar en las veintidós salas, y esto pasó de 28 a 134.
    // Si vuelve a fallar por aquí, vuelve a medirlo antes de tocar nada.
    //
    // De las veinticinco, este montaje solo cuenta veintitrés: las dos secretas
    // nuevas siguen sin descubrir y el selector no las ofrece. Veinte abren
    // desde seis casillas, dos desde cinco (`pm` y `pn`, con una diagonal al
    // otro lado del muro) y `psecreta` desde cuatro. 20·6 + 2·5 + 4 = 134, sin
    // una sola casilla compartida entre dos puertas.
    expect(conPuerta.length).toBe(134);
    // Y esto es lo que de verdad quería decir el número, escrito de forma que
    // no haya que volver a medirlo: toda puerta ofrecida se abre al menos desde
    // sus dos casillas del vano.
    const ofrecidas = conSecretaDescubierta.filter((p) => !p.secreta || p.descubierta);
    expect(conPuerta.length).toBeGreaterThanOrEqual(ofrecidas.length * 2);
  });
});
