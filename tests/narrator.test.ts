import { describe, it, expect } from "vitest";
import { narrar, narrarTodos, nombreDe } from "../src/narrator/local";
import { calaveras, componerDados, escudosBlancos } from "../src/ui/DiceInput";
import { c, partida, situar } from "./ayuda";

const estado = () =>
  situar(partida({ monstruos: [{ id: "orco1", especie: "orco", celda: c(2, 1) }] }), "barbaro", c(1, 1));

describe("nombres", () => {
  // Hasta T42 esto afirmaba `nombreDe(e, "orco1") === "Orco"`. La regla cambió:
  // ahora cada monstruo tiene nombre de pila y se le nombra con su especie
  // delante, para que dos orcos de la misma sala no sean los dos «Orco».
  it("usa el nombre del héroe y, del monstruo, especie y nombre de pila", () => {
    const e = estado();
    expect(nombreDe(e, "barbaro")).toBe("Bárbaro");
    const orco = e.monstruos.find((m) => m.id === "orco1")!;
    expect(nombreDe(e, "orco1")).toBe(`el orco ${orco.nombre}`);
  });
});

describe("frases del narrador", () => {
  it("cuenta la tirada de movimiento metida a mano sin inventarse los dados", () => {
    const e = estado();
    const texto = narrar(e, { tipo: "tiradaMovimiento", actor: "barbaro", dados: [8, 0], total: 8 });
    expect(texto).toBe("Bárbaro saca 8 casillas de movimiento.");
    expect(texto).not.toMatch(/ y 0/);
  });

  it("cuenta los dos dados cuando los ha tirado la aplicación", () => {
    const e = estado();
    expect(narrar(e, { tipo: "tiradaMovimiento", actor: "barbaro", dados: [3, 5], total: 8 })).toMatch(
      /3 y 5/,
    );
  });

  it("distingue el golpe que hiere del que falla", () => {
    const e = estado();
    const base = { tipo: "ataque" as const, atacante: "barbaro", objetivo: "orco1", dadosAtaque: [], dadosDefensa: [], escudos: 0 };
    // «ataca al orco X», no «ataca a el orco X»: lo lee alguien en voz alta.
    expect(narrar(e, { ...base, calaveras: 0, dano: 0 })).toMatch(/Bárbaro ataca al orco /);
    expect(narrar(e, { ...base, calaveras: 2, dano: 2 })).toMatch(/2 puntos de cuerpo/);
    expect(narrar(e, { ...base, calaveras: 1, dano: 1 })).toMatch(/1 punto de cuerpo/);
  });

  it("distingue caer un héroe de caer un monstruo", () => {
    const e = estado();
    expect(narrar(e, { tipo: "figuraDerrotada", figura: "barbaro" })).toMatch(/ya no se levanta/);
    expect(narrar(e, { tipo: "figuraDerrotada", figura: "orco1" })).toMatch(/se desploma/);
  });

  it("cada trampa tiene su frase", () => {
    const e = estado();
    const base = { tipo: "trampaDisparada" as const, trampa: "t", figura: "barbaro", dano: 1 };
    expect(narrar(e, { ...base, tipoTrampa: "foso" })).toMatch(/suelo se hunde/);
    expect(narrar(e, { ...base, tipoTrampa: "lanza" })).toMatch(/lanza sale disparada/);
    expect(narrar(e, { ...base, tipoTrampa: "bloque" })).toMatch(/bloque de piedra/);
  });

  it("no cuenta los movimientos de cero casillas", () => {
    const e = estado();
    expect(
      narrar(e, { tipo: "movimiento", actor: "barbaro", desde: c(1, 1), hasta: c(1, 1), ruta: [] }),
    ).toBeNull();
  });

  it("narrarTodos descarta lo que no se cuenta", () => {
    const e = estado();
    const lineas = narrarTodos(e, [
      { tipo: "movimiento", actor: "barbaro", desde: c(1, 1), hasta: c(1, 1), ruta: [] },
      { tipo: "puertaAbierta", puerta: "p" },
    ]);
    expect(lineas).toHaveLength(1);
  });
});

describe("puente con los dados de la mesa", () => {
  it("compone la tirada a partir de cuántas calaveras se han sacado", () => {
    const d = calaveras(3, 2);
    expect(d).toHaveLength(3);
    expect(d.filter((x) => x === "calavera")).toHaveLength(2);
  });

  it("el relleno del atacante no cuenta como escudo blanco del defensor", () => {
    // Si rellenáramos con escudos blancos, un héroe que defiende se comería
    // paradas que nadie ha sacado en la mesa.
    expect(calaveras(3, 1).filter((x) => x === "escudoBlanco")).toHaveLength(0);
  });

  it("compone la defensa con escudos blancos", () => {
    const d = escudosBlancos(2, 1);
    expect(d.filter((x) => x === "escudoBlanco")).toHaveLength(1);
    expect(d).toHaveLength(2);
  });

  it("nunca devuelve más caras buenas que dados tirados", () => {
    expect(componerDados(2, 9, "calavera", "escudoNegro").filter((x) => x === "calavera")).toHaveLength(2);
  });

  it("con cero dados devuelve una tirada vacía", () => {
    expect(calaveras(0, 0)).toEqual([]);
  });
});
