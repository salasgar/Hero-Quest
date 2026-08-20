import { describe, it, expect } from "vitest";
import { adyacentes, alcanzables, celdaLibre, pasoAbierto, rutaHasta } from "../src/engine/board";
import { claveCelda } from "../src/engine/types";
import { c, partida, situar } from "./ayuda";

const puerta = (id: string, a: ReturnType<typeof c>, b: ReturnType<typeof c>, abierta = false) => ({
  id, a, b, abierta, secreta: false, descubierta: true,
});

describe("muros y puertas", () => {
  it("dos casillas de la misma región comunican", () => {
    const e = partida();
    expect(pasoAbierto(e, c(1, 1), c(2, 1))).toBe(true); // dentro de la sala 'a'
    expect(pasoAbierto(e, c(0, 1), c(0, 2))).toBe(true); // pasillo con pasillo
  });

  it("un cambio de región es muro", () => {
    const e = partida();
    expect(pasoAbierto(e, c(0, 2), c(1, 2))).toBe(false); // pasillo -> sala 'a'
    expect(pasoAbierto(e, c(4, 1), c(5, 1))).toBe(false); // sala 'a' -> sala 'b'
  });

  it("una puerta cerrada sigue bloqueando; abierta deja pasar", () => {
    const cerrada = partida({ puertas: [puerta("p", c(0, 2), c(1, 2), false)] });
    expect(pasoAbierto(cerrada, c(0, 2), c(1, 2))).toBe(false);

    const abierta = partida({ puertas: [puerta("p", c(0, 2), c(1, 2), true)] });
    expect(pasoAbierto(abierta, c(0, 2), c(1, 2))).toBe(true);
  });

  it("una puerta secreta sin descubrir se comporta como un muro", () => {
    const e = partida({
      puertas: [{ id: "s", a: c(0, 2), b: c(1, 2), abierta: true, secreta: true, descubierta: false }],
    });
    expect(pasoAbierto(e, c(0, 2), c(1, 2))).toBe(false);
  });
});

describe("ocupación", () => {
  it("no se puede entrar donde hay otra figura", () => {
    const e = partida({
      mision: { ...partida().mision, entrada: [c(1, 1)] },
      monstruos: [{ id: "orco1", especie: "orco", celda: c(2, 1) }],
    });
    expect(celdaLibre(e, c(2, 1))).toBe(false);
    expect(celdaLibre(e, c(3, 1))).toBe(true);
  });

  it("el mobiliario que bloquea impide el paso", () => {
    const e = partida({
      muebles: [{ id: "mesa", tipo: "mesa", celdas: [c(2, 2)], bloqueaPaso: true, bloqueaVista: false }],
    });
    expect(celdaLibre(e, c(2, 2))).toBe(false);
  });

  it("un monstruo derrotado deja de ocupar su casilla", () => {
    let e = partida({ monstruos: [{ id: "orco1", especie: "orco", celda: c(2, 1) }] });
    expect(celdaLibre(e, c(2, 1))).toBe(false);
    e = { ...e, monstruos: e.monstruos.map((m) => ({ ...m, cuerpo: 0 })) };
    expect(celdaLibre(e, c(2, 1))).toBe(true);
  });
});

describe("alcance de movimiento", () => {
  const enSala = () => {
    const base = partida();
    return situar(base, "barbaro", c(1, 1)); // dentro de la sala 'a'
  };

  it("no permite diagonales", () => {
    const e = enSala();
    const mapa = alcanzables(e, e.heroes[0]!, 1);
    expect(mapa.has(claveCelda(c(2, 1)))).toBe(true); // derecha
    expect(mapa.has(claveCelda(c(1, 2)))).toBe(true); // abajo
    expect(mapa.has(claveCelda(c(2, 2)))).toBe(false); // diagonal, no
  });

  it("con 2 puntos sí llega a la diagonal, rodeando", () => {
    const e = enSala();
    const mapa = alcanzables(e, e.heroes[0]!, 2);
    expect(mapa.get(claveCelda(c(2, 2)))?.coste).toBe(2);
  });

  it("no se sale de la sala si la puerta está cerrada", () => {
    const e = enSala();
    const mapa = alcanzables(e, e.heroes[0]!, 12);
    // La sala 'a' son 12 casillas; con 12 puntos y sin puertas, no sale de ahí.
    expect(mapa.size).toBe(11); // las 12 menos la de origen
    expect(mapa.has(claveCelda(c(0, 1)))).toBe(false);
  });

  it("con la puerta abierta sí sale al pasillo", () => {
    const base = partida({ puertas: [puerta("p", c(0, 2), c(1, 2), true)] });
    const e = situar(base, "barbaro", c(1, 2));
    const mapa = alcanzables(e, e.heroes[0]!, 1);
    expect(mapa.has(claveCelda(c(0, 2)))).toBe(true);
  });

  it("rodea a las figuras en vez de atravesarlas", () => {
    const base = partida({
      monstruos: [{ id: "orco1", especie: "orco", celda: c(2, 1) }],
    });
    const e = situar(base, "barbaro", c(1, 1));
    const mapa = alcanzables(e, e.heroes[0]!, 4);
    expect(mapa.has(claveCelda(c(2, 1)))).toBe(false); // ocupada
    // Rodeando por abajo: (1,2) (2,2) (3,2) (3,1) son cuatro pasos, no dos.
    expect(mapa.get(claveCelda(c(3, 1)))?.coste).toBe(4);
  });

  it("la ruta que devuelve tiene exactamente la longitud del coste", () => {
    const e = enSala();
    const ruta = rutaHasta(e, e.heroes[0]!, c(4, 3), 12);
    expect(ruta).not.toBeNull();
    expect(ruta!).toHaveLength(3 + 2); // 3 a la derecha y 2 abajo
    expect(ruta![ruta!.length - 1]).toEqual(c(4, 3));
  });

  it("devuelve null si no se llega con esos puntos", () => {
    const e = enSala();
    expect(rutaHasta(e, e.heroes[0]!, c(4, 3), 4)).toBeNull();
  });
});

describe("adyacencia para atacar", () => {
  it("solo cuenta ortogonal y sin muro de por medio", () => {
    const base = partida({
      monstruos: [
        { id: "pegado", especie: "orco", celda: c(2, 1) },
        { id: "diagonal", especie: "orco", celda: c(2, 2) },
      ],
    });
    const e = situar(base, "barbaro", c(1, 1));
    const ids = adyacentes(e, e.heroes[0]!).map((f) => f.id);
    expect(ids).toContain("pegado");
    expect(ids).not.toContain("diagonal");
  });

  it("un muro entre dos salas impide el cuerpo a cuerpo", () => {
    const base = partida({ monstruos: [{ id: "otroLado", especie: "orco", celda: c(5, 1) }] });
    const e = situar(base, "barbaro", c(4, 1)); // sala 'a' pegado a la sala 'b'
    expect(adyacentes(e, e.heroes[0]!).map((f) => f.id)).not.toContain("otroLado");
  });
});
