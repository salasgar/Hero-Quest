import { describe, it, expect } from "vitest";
import { esPasillo, salaEn, dentroDelTablero, hayMuroEntre } from "../src/data/board-base";
import {
  MISION_CALABOZO,
  MONSTRUOS_CALABOZO,
  MUEBLES_CALABOZO,
  PUERTAS_CALABOZO,
  TRAMPAS_CALABOZO,
} from "../src/data/quests/calabozo";
import { crearPartida } from "../src/engine/partida";
import { claveCelda, type Celda } from "../src/engine/types";

const todas = (): Celda[] => [
  ...MISION_CALABOZO.entrada,
  ...MONSTRUOS_CALABOZO.map((m) => m.celda),
  ...TRAMPAS_CALABOZO.map((t) => t.celda),
  ...MUEBLES_CALABOZO.flatMap((m) => m.celdas),
  ...PUERTAS_CALABOZO.flatMap((p) => [p.a, p.b]),
];

describe("«El calabozo del guardián» encaja en el tablero", () => {
  it("todas las coordenadas caen dentro del tablero", () => {
    for (const c of todas())
      expect(dentroDelTablero(c.x, c.y), `fuera del tablero: ${claveCelda(c)}`).toBe(true);
  });

  it("los héroes entran por casillas de pasillo", () => {
    for (const c of MISION_CALABOZO.entrada)
      expect(esPasillo(c.x, c.y), `la entrada ${claveCelda(c)} no es pasillo`).toBe(true);
  });

  it("cada puerta une dos regiones distintas y adyacentes", () => {
    for (const p of PUERTAS_CALABOZO) {
      const adyacente = Math.abs(p.a.x - p.b.x) + Math.abs(p.a.y - p.b.y) === 1;
      expect(adyacente, `la puerta ${p.id} une casillas no contiguas`).toBe(true);
      expect(hayMuroEntre(p.a, p.b), `la puerta ${p.id} no está sobre un muro`).toBe(true);
    }
  });

  it("no hay dos figuras en la misma casilla", () => {
    const ocupadas = [
      ...MISION_CALABOZO.entrada.slice(0, 4),
      ...MONSTRUOS_CALABOZO.map((m) => m.celda),
    ].map(claveCelda);
    expect(new Set(ocupadas).size).toBe(ocupadas.length);
  });

  it("ningún monstruo empieza encima del mobiliario", () => {
    const muebles = new Set(MUEBLES_CALABOZO.flatMap((m) => m.celdas).map(claveCelda));
    for (const m of MONSTRUOS_CALABOZO)
      expect(muebles.has(claveCelda(m.celda)), `${m.id} está sobre un mueble`).toBe(false);
  });

  it("ninguna trampa está debajo de un mueble ni en la entrada", () => {
    const prohibidas = new Set([
      ...MUEBLES_CALABOZO.flatMap((m) => m.celdas),
      ...MISION_CALABOZO.entrada,
    ].map(claveCelda));
    for (const t of TRAMPAS_CALABOZO)
      expect(prohibidas.has(claveCelda(t.celda)), `la trampa ${t.id} está mal puesta`).toBe(false);
  });

  it("toda sala con texto tiene al menos una puerta que lleve a ella", () => {
    const alcanzables = new Set(
      PUERTAS_CALABOZO.flatMap((p) => [salaEn(p.a.x, p.a.y), salaEn(p.b.x, p.b.y)]).filter(Boolean),
    );
    for (const sala of Object.keys(MISION_CALABOZO.textosDeSala))
      expect(alcanzables.has(sala), `a la sala '${sala}' no se llega por ninguna puerta`).toBe(true);
  });

  it("el objetivo de la misión existe entre los monstruos", () => {
    expect(MISION_CALABOZO.objetivo.clase).toBe("matarA");
    if (MISION_CALABOZO.objetivo.clase !== "matarA") return;
    const objetivo = MISION_CALABOZO.objetivo.figura;
    expect(MONSTRUOS_CALABOZO.some((m) => m.id === objetivo)).toBe(true);
  });

  it("cada monstruo está en la sala que le toca", () => {
    // Los seis están dentro de salas, ninguno suelto en un pasillo.
    for (const m of MONSTRUOS_CALABOZO)
      expect(salaEn(m.celda.x, m.celda.y), `${m.id} está en un pasillo`).not.toBeNull();
  });

  it("la partida se construye sin reventar y no empieza terminada", () => {
    const e = crearPartida({
      mision: MISION_CALABOZO,
      heroes: [{ clase: "barbaro" }, { clase: "enano" }, { clase: "elfo" }, { clase: "mago" }],
      monstruos: MONSTRUOS_CALABOZO,
      puertas: PUERTAS_CALABOZO,
      muebles: MUEBLES_CALABOZO,
      trampas: TRAMPAS_CALABOZO,
      semilla: 1,
    });
    expect(e.heroes).toHaveLength(4);
    expect(e.monstruos).toHaveLength(6);
    expect(e.desenlace).toBeNull();
    expect(e.salasReveladas).toEqual([]);
    // Los cuatro héroes en casillas distintas.
    expect(new Set(e.heroes.map((h) => claveCelda(h.celda))).size).toBe(4);
  });
});

// -------------------------------------------------------------- baraja y mobiliario

import { BARAJA_TESOROS, MAZO_COMPLETO, repartoDeLaBaraja, TOTAL_CARTAS } from "../src/data/treasure";
import { MARCADORES_SECRETOS, MOBILIARIO, PUERTAS_A_CONSTRUIR, TOTAL_PIEZAS } from "../src/data/furniture";
import { aplicarAccion } from "../src/engine/reducer";

describe("la baraja de tesoros", () => {
  it("tiene el número de cartas que se van a imprimir", () => {
    expect(TOTAL_CARTAS).toBe(MAZO_COMPLETO.length);
    expect(TOTAL_CARTAS).toBe(BARAJA_TESOROS.reduce((s, c) => s + c.copias, 0));
  });

  it("no hay identificadores repetidos", () => {
    expect(new Set(BARAJA_TESOROS.map((c) => c.id)).size).toBe(BARAJA_TESOROS.length);
  });

  it("una cuarta parte de la baraja sale mal, pero nada es demoledor", () => {
    const r = repartoDeLaBaraja();
    const malas = (r.monstruoErrante ?? 0) + (r.peligro ?? 0);
    expect(malas / TOTAL_CARTAS).toBeGreaterThan(0.2);
    expect(malas / TOTAL_CARTAS).toBeLessThan(0.32);
    for (const c of BARAJA_TESOROS)
      if (c.efecto.clase === "peligro") expect(c.efecto.dano).toBeLessThanOrEqual(1);
  });

  it("se baraja distinto con semillas distintas y siempre entera", () => {
    const a = crearPartida({ mision: MISION_CALABOZO, heroes: [{ clase: "barbaro" }], monstruos: [], semilla: 1 });
    const b = crearPartida({ mision: MISION_CALABOZO, heroes: [{ clase: "barbaro" }], monstruos: [], semilla: 2 });
    expect(a.mazoTesoros).toHaveLength(TOTAL_CARTAS);
    expect(a.mazoTesoros.sort()).toEqual(b.mazoTesoros.sort());
    const a2 = crearPartida({ mision: MISION_CALABOZO, heroes: [{ clase: "barbaro" }], monstruos: [], semilla: 1 });
    expect(a2.mazoTesoros).toEqual(
      crearPartida({ mision: MISION_CALABOZO, heroes: [{ clase: "barbaro" }], monstruos: [], semilla: 1 }).mazoTesoros,
    );
  });

  it("registrar una sala consume una carta del mazo", () => {
    let e = crearPartida({
      mision: MISION_CALABOZO,
      heroes: [{ clase: "barbaro" }],
      monstruos: [],
      semilla: 9,
    });
    e = { ...e, heroes: e.heroes.map((h) => ({ ...h, celda: { x: 2, y: 15 } })) };
    const antes = e.mazoTesoros.length;
    const r = aplicarAccion(e, { tipo: "buscarTesoro" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.estado.mazoTesoros).toHaveLength(antes - 1);
    expect(r.eventos.some((x) => x.tipo === "cartaDeTesoro")).toBe(true);
  });
});

describe("el mobiliario que hay que construir", () => {
  it("todas las piezas caben en el tablero", () => {
    for (const m of MOBILIARIO) {
      expect(m.ancho).toBeGreaterThanOrEqual(1);
      expect(m.ancho).toBeLessThanOrEqual(3);
      expect(m.alto).toBeGreaterThanOrEqual(1);
      expect(m.alto).toBeLessThanOrEqual(3);
    }
  });

  it("todo el mobiliario impide plantarse encima", () => {
    for (const m of MOBILIARIO) expect(m.bloqueaPaso, `${m.nombre}`).toBe(true);
  });

  it("solo lo alto tapa la vista", () => {
    const tapan = MOBILIARIO.filter((m) => m.bloqueaVista).map((m) => m.tipo);
    expect(tapan.sort()).toEqual(["armario", "bastidor", "estanteria"]);
  });

  it("el recuento total cuadra", () => {
    expect(TOTAL_PIEZAS).toBe(MOBILIARIO.reduce((s, m) => s + m.cuantas, 0));
    expect(TOTAL_PIEZAS).toBeGreaterThan(10);
  });
});

describe("la misión cabe en el cartón que hay construido", () => {
  it("no usa más puertas de las que hay", () => {
    const normales = PUERTAS_CALABOZO.filter((p) => !p.secreta).length;
    const secretas = PUERTAS_CALABOZO.filter((p) => p.secreta).length;
    expect(normales).toBeLessThanOrEqual(PUERTAS_A_CONSTRUIR);
    expect(secretas).toBeLessThanOrEqual(MARCADORES_SECRETOS);
  });

  it("no usa más mobiliario del que hay construido", () => {
    const usadas: Record<string, number> = {};
    for (const m of MUEBLES_CALABOZO) usadas[m.tipo] = (usadas[m.tipo] ?? 0) + 1;
    for (const [tipo, n] of Object.entries(usadas)) {
      const disponibles = MOBILIARIO.find((x) => x.tipo === tipo)?.cuantas ?? 0;
      expect(n, `la misión usa ${n} de '${tipo}' y solo hay ${disponibles}`).toBeLessThanOrEqual(disponibles);
    }
  });

  it("cada mueble ocupa el número de casillas que dice su plantilla", () => {
    for (const m of MUEBLES_CALABOZO) {
      const plantilla = MOBILIARIO.find((x) => x.tipo === m.tipo);
      expect(plantilla, `no hay plantilla para '${m.tipo}'`).toBeTruthy();
      expect(m.celdas.length, `${m.id} ocupa ${m.celdas.length} casillas`).toBe(
        plantilla!.ancho * plantilla!.alto,
      );
    }
  });

  it("ningún mueble tapa la casilla de una puerta", () => {
    // Un mueble que bloquea el paso encima del vano deja la puerta inservible:
    // se puede abrir pero no se puede cruzar.
    const ocupadas = new Set(
      MUEBLES_CALABOZO.filter((m) => m.bloqueaPaso).flatMap((m) => m.celdas).map(claveCelda),
    );
    for (const p of PUERTAS_CALABOZO) {
      expect(ocupadas.has(claveCelda(p.a)), `un mueble tapa el vano de '${p.id}'`).toBe(false);
      expect(ocupadas.has(claveCelda(p.b)), `un mueble tapa el vano de '${p.id}'`).toBe(false);
    }
  });

  it("ningún mueble cae sobre la entrada de los héroes", () => {
    const ocupadas = new Set(MUEBLES_CALABOZO.flatMap((m) => m.celdas).map(claveCelda));
    for (const c of MISION_CALABOZO.entrada)
      expect(ocupadas.has(claveCelda(c)), `un mueble ocupa la entrada ${claveCelda(c)}`).toBe(false);
  });

  it("hay piezas de sobra para el total declarado", () => {
    expect(TOTAL_PIEZAS).toBeGreaterThanOrEqual(MUEBLES_CALABOZO.length);
  });
});

// -------------------------------------------------------------- todas las salas se pisan

import { celdasDeSala, idsDeSalas } from "../src/data/board-base";
import { alcanzables } from "../src/engine/board";
import type { Puerta } from "../src/engine/types";

/**
 * La lista de puertas que tenía la misión antes de la T40.
 *
 * Está copiada aquí a propósito y no importada: es lo que hace que el test de
 * alcanzabilidad tenga una mitad negativa de verdad. Sin ella, un test que
 * afirma «se llega a las 22 salas» pasa igual de verde estando bien la misión
 * que estando mal la medida, y no habría manera de notarlo.
 */
const PUERTAS_ANTES_DE_T40: Puerta[] = [
  { id: "ps", a: { x: 12, y: 15 }, b: { x: 11, y: 15 }, abierta: false, secreta: false, descubierta: true },
  { id: "pt", a: { x: 13, y: 14 }, b: { x: 14, y: 14 }, abierta: false, secreta: false, descubierta: true },
  { id: "pr", a: { x: 6, y: 18 }, b: { x: 6, y: 17 }, abierta: false, secreta: false, descubierta: true },
  { id: "pq", a: { x: 0, y: 15 }, b: { x: 1, y: 15 }, abierta: false, secreta: false, descubierta: true },
  { id: "psecreta", a: { x: 4, y: 13 }, b: { x: 4, y: 14 }, abierta: false, secreta: true, descubierta: false },
];

/**
 * Salas a cuyas casillas pisables llega un héroe desde la escalera con todas
 * las puertas abiertas, las secretas incluidas.
 *
 * Va por el motor de verdad (`alcanzables`) y no por un recorrido propio, para
 * que cuente como camino exactamente lo que contará en la mesa. Sin monstruos,
 * porque un monstruo no es un muro: se mata y se sigue. El mobiliario sí, que
 * no se quita de en medio, así que sus casillas no entran en la cuenta.
 */
function salasQueSePisan(puertas: Puerta[]): Set<string> {
  const e = crearPartida({
    mision: MISION_CALABOZO,
    heroes: [{ clase: "barbaro" }],
    monstruos: [],
    puertas: puertas.map((p) => ({ ...p, abierta: true, descubierta: true })),
    muebles: MUEBLES_CALABOZO,
    trampas: TRAMPAS_CALABOZO,
    semilla: 1,
  });
  const heroe = e.heroes[0]!;
  // 500 puntos: el tablero entero son 494 casillas, así que nada se queda
  // fuera por falta de movimiento y solo cuentan los muros.
  const mapa = alcanzables(e, heroe, 500);
  const ocupadas = new Set(
    MUEBLES_CALABOZO.filter((m) => m.bloqueaPaso).flatMap((m) => m.celdas).map(claveCelda),
  );
  const enteras = new Set<string>();
  for (const sala of idsDeSalas()) {
    const pisables = celdasDeSala(sala).filter((c) => !ocupadas.has(claveCelda(c)));
    if (pisables.every((c) => mapa.has(claveCelda(c)))) enteras.add(sala);
  }
  return enteras;
}

describe("todas las salas del tablero son accesibles", () => {
  it("desde la escalera se llega a las 22 salas enteras", () => {
    const enteras = salasQueSePisan(PUERTAS_CALABOZO);
    const sinAlcanzar = idsDeSalas().filter((s) => !enteras.has(s));
    expect(sinAlcanzar, `salas sin alcanzar: ${sinAlcanzar.join(" ")}`).toEqual([]);
    expect(enteras.size).toBe(22);
  });

  it("con la lista de puertas vieja solo se llegaba a cinco", () => {
    const enteras = salasQueSePisan(PUERTAS_ANTES_DE_T40);
    expect([...enteras].sort()).toEqual(["l", "q", "r", "s", "t"]);
    expect(idsDeSalas().length - enteras.size).toBe(17);
  });

  it("ninguna sala depende de una puerta secreta para entrar", () => {
    // Si la única entrada de una sala fuese secreta, un grupo que no registre
    // en busca de puertas secretas se quedaría sin poder terminar la misión.
    const conNormal = new Set(
      PUERTAS_CALABOZO.filter((p) => !p.secreta).flatMap((p) => [
        salaEn(p.a.x, p.a.y),
        salaEn(p.b.x, p.b.y),
      ]),
    );
    for (const sala of idsDeSalas())
      expect(conNormal.has(sala), `a la sala '${sala}' solo se entra por una secreta`).toBe(true);
  });

  it("sin abrir las secretas se sigue llegando a las 22 salas", () => {
    const soloNormales = PUERTAS_CALABOZO.filter((p) => !p.secreta);
    expect(salasQueSePisan(soloNormales).size).toBe(22);
  });

  it("no hay dos puertas sobre la misma casilla", () => {
    // Dos puertas que comparten vano son dos marcadores de cartón peleándose
    // por una casilla del tablero físico.
    const vanos = PUERTAS_CALABOZO.flatMap((p) => [p.a, p.b]).map(claveCelda);
    expect(new Set(vanos).size).toBe(vanos.length);
  });

  it("ninguna trampa cae debajo del vano de una puerta", () => {
    const trampas = new Set(TRAMPAS_CALABOZO.map((t) => claveCelda(t.celda)));
    for (const p of PUERTAS_CALABOZO)
      for (const v of [p.a, p.b])
        expect(trampas.has(claveCelda(v)), `una trampa está en el vano de '${p.id}'`).toBe(false);
  });
});
