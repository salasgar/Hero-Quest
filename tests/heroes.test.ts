import { describe, expect, it } from "vitest";
import { HEROES, VARIANTES_HEROE, nombreDeClase } from "../src/data/heroes";
import { alcanzables, vuela } from "../src/engine/board";
import { claveCelda } from "../src/engine/types";
import { c, conMovimiento, hacer, partida, situar } from "./ayuda";

/** El hada sola en la sala 'a', que ocupa las columnas 1-4 y las filas 1-4. */
const conHada = (op: Parameters<typeof partida>[0] = {}) =>
  situar(partida({ heroes: [{ clase: "hada", elementos: ["aire", "agua"] }], ...op }), "hada", c(1, 1));

const mueble = (id: string, celdas: ReturnType<typeof c>[]) => ({
  id, tipo: "mesa" as const, celdas, bloqueaPaso: true, bloqueaVista: false,
});

describe("héroes y heroínas", () => {
  it("cada clase con forma femenina propia da dos variantes, y el hada una", () => {
    const nombres = VARIANTES_HEROE.map((v) => v.nombre);
    expect(nombres).toContain("Elfo");
    expect(nombres).toContain("Elfa");
    expect(nombres).toContain("Mago");
    expect(nombres).toContain("Hechicera");
    expect(nombres.filter((n) => n === "Hada")).toHaveLength(1);
    expect(new Set(nombres).size).toBe(nombres.length);
  });

  it("el género cambia el nombre y nada más", () => {
    const m = partida({ heroes: [{ clase: "elfo", elementos: ["agua"] }] }).heroes[0]!;
    const f = partida({ heroes: [{ clase: "elfo", genero: "f", elementos: ["agua"] }] }).heroes[0]!;
    expect(m.nombre).toBe("Elfo");
    expect(f.nombre).toBe("Elfa");
    // Igualadas las dos cosas que el género sí toca, no debe quedar diferencia.
    const igualadas = (h: typeof m) => ({ ...h, nombre: "", genero: "m" as const });
    expect(igualadas(f)).toEqual(igualadas(m));
  });

  it("nombreDeClase da la forma pedida", () => {
    expect(nombreDeClase("mago")).toBe("Mago");
    expect(nombreDeClase("mago", "f")).toBe("Hechicera");
    expect(nombreDeClase("hada", "m")).toBe("Hada");
  });

  it("el nombre que pone quien juega gana al de la clase", () => {
    const h = partida({ heroes: [{ clase: "barbaro", genero: "f", nombre: "  Nube  " }] }).heroes[0]!;
    expect(h.nombre).toBe("Nube");
  });

  it("dos héroes de la misma clase no comparten identificador", () => {
    const e = partida({
      heroes: [
        { clase: "elfo", genero: "f", elementos: ["agua"] },
        { clase: "elfo", elementos: ["fuego"] },
      ],
    });
    expect(e.heroes.map((h) => h.id)).toEqual(["elfo", "elfo2"]);
    expect(e.turno.orden).toEqual(["elfo", "elfo2", "zargon"]);
  });

  it("solo el hada vuela", () => {
    const e = partida({ heroes: [{ clase: "hada" }, { clase: "barbaro" }] });
    expect(vuela(e.heroes[0]!)).toBe(true);
    expect(vuela(e.heroes[1]!)).toBe(false);
  });
});

describe("volar", () => {
  it("pasa por encima de un mueble que a los demás les cierra el paso", () => {
    const conMesa = { muebles: [mueble("mesa1", [c(2, 1)])] };

    const volando = conHada(conMesa);
    expect(alcanzables(volando, volando.heroes[0]!, 2).has(claveCelda(c(3, 1)))).toBe(true);

    const andando = situar(partida(conMesa), "barbaro", c(1, 1));
    expect(alcanzables(andando, andando.heroes[0]!, 2).has(claveCelda(c(3, 1)))).toBe(false);
  });

  it("no puede aterrizar sobre el mueble que sobrevuela", () => {
    const e = conHada({ muebles: [mueble("mesa1", [c(2, 1)])] });
    expect(alcanzables(e, e.heroes[0]!, 4).has(claveCelda(c(2, 1)))).toBe(false);
  });

  it("pasa por encima de otra figura, pero tampoco aterriza sobre ella", () => {
    const e = conHada({ monstruos: [{ id: "orco1", especie: "orco", celda: c(2, 1) }] });
    const mapa = alcanzables(e, e.heroes[0]!, 2);
    expect(mapa.has(claveCelda(c(3, 1)))).toBe(true);
    expect(mapa.has(claveCelda(c(2, 1)))).toBe(false);
  });

  it("volar no atraviesa muros: de la sala al pasillo sigue haciendo falta una puerta", () => {
    const e = conHada();
    expect(alcanzables(e, e.heroes[0]!, 6).has(claveCelda(c(0, 1)))).toBe(false);
  });

  it("un bloque desprendido corta el paso también en el aire", () => {
    const e = { ...conHada(), celdasBloqueadas: [c(2, 1)] };
    const mapa = alcanzables(e, e.heroes[0]!, 2);
    expect(mapa.has(claveCelda(c(3, 1)))).toBe(false);
  });
});

describe("volar y las trampas", () => {
  const foso = { trampas: [{ id: "f1", tipo: "foso" as const, celda: c(2, 1), descubierta: false, gastada: false }] };
  const lanza = { trampas: [{ id: "l1", tipo: "lanza" as const, celda: c(2, 1), descubierta: false, gastada: false }] };

  it("el foso no traga a quien vuela", () => {
    const e = hacer(conMovimiento(conHada(foso), 4), { tipo: "mover", destino: c(3, 1) });
    const hada = e.heroes[0]!;
    expect(hada.cuerpo).toBe(HEROES.hada.cuerpo);
    expect(hada.celda).toEqual(c(3, 1)); // ni se hunde ni se le corta el movimiento
  });

  it("pero el mismo foso sí traga a quien va andando", () => {
    const base = situar(partida(foso), "barbaro", c(1, 1));
    const e = hacer(conMovimiento(base, 4), { tipo: "mover", destino: c(3, 1) });
    expect(e.heroes[0]!.cuerpo).toBeLessThan(HEROES.barbaro.cuerpo);
    expect(e.heroes[0]!.celda).toEqual(c(2, 1)); // el foso corta el movimiento
  });

  it("una lanza sale de la pared y alcanza también a quien vuela", () => {
    const e = hacer(conMovimiento(conHada(lanza), 4), { tipo: "mover", destino: c(3, 1) });
    expect(e.heroes[0]!.cuerpo).toBeLessThan(HEROES.hada.cuerpo);
  });
});
