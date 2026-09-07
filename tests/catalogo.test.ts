import { describe, expect, it } from "vitest";
import { MISION_POR_DEFECTO, MISIONES, misionPorId, nivelDe, opcionesDe } from "../src/data/quests";
import { MISION_CALABOZO, PUERTAS_CALABOZO } from "../src/data/quests/calabozo";
import { crearPartida } from "../src/engine/partida";
import { partidaDelMontaje } from "../src/red/cliente";
import { VERSION } from "../src/red/protocolo";

/**
 * El catálogo de misiones (T45): lo que tiene que cumplir la lista en sí, con
 * independencia de lo que haya dentro de cada misión. La estructura de cada
 * misión —entrada en pasillo, puertas sobre muro, monstruos dentro de sala—
 * se comprueba en `quest.test.ts`, recorriendo este mismo catálogo.
 */
describe("el catálogo de misiones", () => {
  it("tiene al menos una misión, y la primera es el calabozo", () => {
    // El calabozo es la misión de referencia: su 100 % de victorias está
    // firmado (2026-09-06) y las demás se ordenan detrás de ella.
    expect(MISIONES.length).toBeGreaterThanOrEqual(1);
    expect(MISIONES[0]!.mision).toBe(MISION_CALABOZO);
    expect(MISION_POR_DEFECTO).toBe(MISIONES[0]);
  });

  it("no repite identificadores ni títulos", () => {
    const ids = MISIONES.map((m) => m.mision.id);
    expect(new Set(ids).size).toBe(ids.length);
    const titulos = MISIONES.map((m) => m.mision.titulo);
    expect(new Set(titulos).size).toBe(titulos.length);
  });

  it("cada misión lleva una frase de dificultad para la mesa", () => {
    for (const m of MISIONES) expect(m.dificultad.trim().length, m.mision.id).toBeGreaterThan(0);
  });

  it("el nivel es la posición en la lista, empezando en 1", () => {
    MISIONES.forEach((m, i) => expect(nivelDe(m)).toBe(i + 1));
  });

  it("se encuentra por identificador, y un identificador desconocido da undefined", () => {
    for (const m of MISIONES) expect(misionPorId(m.mision.id)).toBe(m);
    // Puede venir de un montaje de red creado con una versión más nueva o de
    // un fichero de partida viejo: no puede reventar.
    expect(misionPorId("la-torre-de-kellar")).toBeUndefined();
    expect(misionPorId("")).toBeUndefined();
  });

  it("está congelado hasta el fondo: ni la lista, ni las misiones, ni sus casillas", () => {
    expect(Object.isFrozen(MISIONES)).toBe(true);
    for (const m of MISIONES) {
      expect(Object.isFrozen(m), m.mision.id).toBe(true);
      expect(Object.isFrozen(m.mision)).toBe(true);
      expect(Object.isFrozen(m.mision.entrada)).toBe(true);
      expect(Object.isFrozen(m.puertas)).toBe(true);
      for (const p of m.puertas) expect(Object.isFrozen(p), `puerta ${p.id}`).toBe(true);
      for (const mo of m.monstruos) expect(Object.isFrozen(mo.celda), `monstruo ${mo.id}`).toBe(true);
    }
    // Y las constantes de origen son las mismas referencias, así que también
    // quedan congeladas: quien las importe directamente tampoco puede tocarlas.
    expect(Object.isFrozen(PUERTAS_CALABOZO)).toBe(true);
  });

  it("opcionesDe da copias que se pueden tocar sin alterar el catálogo", () => {
    const m = MISIONES[0]!;
    const op = opcionesDe(m);
    expect(op.mision).toBe(m.mision);
    expect(op.puertas).toEqual(m.puertas);
    expect(op.puertas).not.toBe(m.puertas);
    const puertasAntes = m.puertas.length;
    const monstruosAntes = m.monstruos.length;
    op.puertas!.length = 0;
    op.monstruos.push({ id: "intruso", especie: "goblin", celda: { x: 1, y: 1 } });
    expect(m.puertas).toHaveLength(puertasAntes);
    expect(m.monstruos).toHaveLength(monstruosAntes);
  });

  it("toda misión del catálogo monta una partida que no empieza terminada", () => {
    for (const m of MISIONES) {
      const e = crearPartida({
        ...opcionesDe(m),
        heroes: [{ clase: "barbaro" }, { clase: "enano" }, { clase: "elfo" }, { clase: "mago" }],
        semilla: 1,
      });
      expect(e.mision.id).toBe(m.mision.id);
      expect(e.monstruos, m.mision.id).toHaveLength(m.monstruos.length);
      expect(e.desenlace, m.mision.id).toBeNull();
    }
  });

  it("el montaje de red la encuentra por su identificador, igual que la mesa", () => {
    // `partidaDelMontaje` y `Juego.tsx` tienen que montar la misma partida
    // desde el mismo catálogo: un montaje con el id de cada misión tiene que
    // dar la misma misión y los mismos monstruos que `crearPartida` a pelo.
    for (const m of MISIONES) {
      const r = partidaDelMontaje({
        version: VERSION,
        semilla: 3,
        mision: m.mision.id,
        heroes: [{ clase: "barbaro" }],
        reparto: { barbaro: "mesa" },
      });
      expect(r.ok, m.mision.id).toBe(true);
      if (!r.ok) return;
      const directa = crearPartida({ ...opcionesDe(m), heroes: [{ clase: "barbaro" }], semilla: 3 });
      expect(r.valor.mision).toEqual(directa.mision);
      expect(r.valor.monstruos).toEqual(directa.monstruos);
      expect(r.valor.mazoTesoros).toEqual(directa.mazoTesoros);
    }
  });
});
