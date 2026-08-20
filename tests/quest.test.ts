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
