import { describe, expect, it } from "vitest";
import { fichaDe } from "../src/ui/FichaFlotante";
import { c, partida, situar } from "./ayuda";
import type { EfectoActivo, Heroe, Monstruo } from "../src/engine/types";

describe("fichaDe", () => {
  it("un héroe: nombre, clase, cuerpo, mente, dados, equipo", () => {
    const e = partida({ heroes: [{ clase: "barbaro" }] });
    const heroe = e.heroes[0]!;
    const lineas = fichaDe(heroe, e);
    // Antes las dos líneas decían «Bárbaro»: sin nombre propio, el héroe se
    // quedaba con el de su clase. Desde T62 la primera es su nombre sorteado,
    // que nunca coincide con la clase; la segunda sigue siendo la clase.
    expect(lineas[0]).toBe(heroe.nombre);
    expect(lineas[0]).not.toBe("Bárbaro");
    expect(lineas[1]).toBe("Bárbaro"); // clase con su género (masculino por defecto)
    expect(lineas).toContain("8 de 8 cuerpo");
    expect(lineas).toContain("2 de 2 mente");
    expect(lineas).toContain("⚔ 3   🛡 2"); // espada ancha (3) y defensa base (2), sin armadura
    expect(lineas).toContain("Espada ancha"); // equipoInicial del bárbaro
    // El bárbaro no lanza magia: sin línea de hechizos.
    expect(lineas.some((l) => l.includes("✨"))).toBe(false);
  });

  it("una heroína: la clase sale en femenino", () => {
    const e = partida({ heroes: [{ clase: "enano", genero: "f" }] });
    const lineas = fichaDe(e.heroes[0]!, e);
    expect(lineas[1]).toBe("Enana");
  });

  it("un héroe con hechizos: solo el recuento, los nombres van en la hoja lateral", () => {
    const e = partida({ heroes: [{ clase: "mago", elementos: ["fuego"] }] });
    const heroe = e.heroes[0]!;
    expect(heroe.hechizos.length).toBeGreaterThan(0);
    const lineas = fichaDe(heroe, e);
    const linea = lineas.find((l) => l.includes("✨"));
    expect(linea).toBe(`✨ ${heroe.hechizos.length} hechizos`);
  });

  it("un monstruo: nombre y especie en el título, tipo, dados y movimiento", () => {
    const e = partida({ monstruos: [{ id: "orco1", especie: "orco", celda: c(2, 1) }] });
    const orco = e.monstruos[0]!;
    const lineas = fichaDe(orco, e);
    expect(lineas[0]).toBe(`${orco.nombre}, orco`);
    expect(lineas[1]).toBe("Orco");
    expect(lineas).toContain("1 de 1 cuerpo");
    expect(lineas).toContain("2 mente"); // el orco no lleva mente propia por instancia: es de la plantilla
    expect(lineas).toContain("⚔ 3   🛡 2");
    expect(lineas).toContain("movimiento 8");
  });

  it("un monstruo dormido y con el turno perdido: una línea por cada estado", () => {
    const e = partida({ monstruos: [{ id: "orco1", especie: "orco", celda: c(2, 1) }] });
    const dormido: Monstruo = { ...e.monstruos[0]!, dormido: true, pierdeTurno: true };
    const lineas = fichaDe(dormido, e);
    expect(lineas).toContain("dormido");
    expect(lineas).toContain("pierde el turno");
  });

  it("una figura con efectos activos: una línea legible por cada uno", () => {
    const e = partida({ heroes: [{ clase: "barbaro" }] });
    const efectos: EfectoActivo[] = [
      { clase: "bonusAtaque", dados: 2, duracion: "siguienteAtaque" },
      { clase: "bonusDefensa", dados: 1, duracion: "hastaRecibirDano" },
      { clase: "movimientoExtra", dados: 2, duracion: "mision" },
      { clase: "atravesarMuros", duracion: "mision" },
      { clase: "atravesarFiguras", duracion: "mision" },
    ];
    const heroe: Heroe = { ...e.heroes[0]!, efectos };
    const lineas = fichaDe(heroe, e);
    expect(lineas).toContain("+2 dados en el próximo ataque");
    expect(lineas).toContain("+1 dados de defensa hasta el próximo golpe");
    expect(lineas).toContain("+2 dados de movimiento en su próxima tirada");
    expect(lineas).toContain("atraviesa muros en su próximo movimiento");
    expect(lineas).toContain("atraviesa figuras en su próximo movimiento");
  });

  it("respeta el foso: un dado menos de ataque y de defensa, con el estado", () => {
    const sinFoso = situar(partida({ heroes: [{ clase: "barbaro" }] }), "barbaro", c(3, 3));
    const conFoso = {
      ...sinFoso,
      trampas: [{ id: "f1", tipo: "foso" as const, celda: c(3, 3), descubierta: true, gastada: true }],
    };
    expect(fichaDe(sinFoso.heroes[0]!, sinFoso)).toContain("⚔ 3   🛡 2");
    expect(fichaDe(conFoso.heroes[0]!, conFoso)).toContain("⚔ 2   🛡 1");
  });
});
