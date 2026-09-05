import { describe, it, expect } from "vitest";
import { dadosDeAtaque } from "../src/engine/combat";
import { aplicarAccion, repetir } from "../src/engine/reducer";
import type { IdEquipo } from "../src/data/equipment";
import type { Accion, Celda } from "../src/engine/types";
import { c, conMovimiento, hacer, MISION_PRUEBA, partida, rechaza, situar } from "./ayuda";

const CAL = "calavera" as const;
const BLA = "escudoBlanco" as const;

const puerta = (id: string, a: Celda, b: Celda, abierta = false) => ({
  id, a, b, abierta, secreta: false, descubierta: true,
});

describe("tirada de movimiento", () => {
  it("acepta la tirada física de la mesa", () => {
    const e = hacer(partida(), { tipo: "tirarMovimiento", dados: [4, 3] });
    expect(e.turno.movimientoTotal).toBe(7);
    expect(e.turno.movimientoRestante).toBe(7);
  });

  it("no se tira dos veces en el mismo turno", () => {
    const e = hacer(partida(), { tipo: "tirarMovimiento", dados: [1, 1] });
    expect(rechaza(e, { tipo: "tirarMovimiento" })).toMatch(/ya has tirado/i);
  });

  it("hay que tirar antes de moverse", () => {
    expect(rechaza(partida(), { tipo: "mover", destino: c(0, 2) })).toMatch(/tirar el movimiento/i);
  });
});

describe("el movimiento es un bloque continuo", () => {
  // El bárbaro empieza en (1,1) y el orco está en (3,1): hay que acercarse
  // para poder pegarle. Ojo con dejarlo en diagonal, que no cuenta.
  const escena = () => {
    const base = partida({ monstruos: [{ id: "orco1", especie: "orco", celda: c(3, 1) }] });
    return conMovimiento(situar(base, "barbaro", c(1, 1)), 6);
  };

  it("mover y luego atacar está permitido", () => {
    let e = escena();
    e = hacer(e, { tipo: "mover", destino: c(2, 1) });
    e = hacer(e, { tipo: "atacar", objetivo: "orco1", dadosAtaque: [CAL], dadosDefensa: [] });
    expect(e.turno.haActuado).toBe(true);
  });

  it("pero después de atacar habiendo movido ya no se mueve más", () => {
    let e = escena();
    e = hacer(e, { tipo: "mover", destino: c(2, 1) });
    e = hacer(e, { tipo: "atacar", objetivo: "orco1", dadosAtaque: [CAL], dadosDefensa: [] });
    expect(e.turno.movimientoCerrado).toBe(true);
    expect(rechaza(e, { tipo: "mover", destino: c(2, 2) })).toMatch(/movimiento está cerrado/i);
  });

  it("atacar primero y moverse después sí vale", () => {
    let e = situar(escena(), "barbaro", c(2, 1)); // ya pegado al orco
    e = hacer(e, { tipo: "atacar", objetivo: "orco1", dadosAtaque: [], dadosDefensa: [] });
    expect(e.turno.movimientoCerrado).toBe(false);
    e = hacer(e, { tipo: "mover", destino: c(2, 3) });
    expect(e.heroes[0]!.celda).toEqual(c(2, 3));
  });

  it("no se actúa dos veces en un turno", () => {
    let e = situar(escena(), "barbaro", c(2, 1));
    e = hacer(e, { tipo: "atacar", objetivo: "orco1", dadosAtaque: [], dadosDefensa: [] });
    expect(rechaza(e, { tipo: "atacar", objetivo: "orco1" })).toMatch(/ya has actuado/i);
  });

  it("el movimiento gastado se descuenta", () => {
    let e = escena();
    e = hacer(e, { tipo: "mover", destino: c(1, 3) }); // dos casillas
    expect(e.turno.movimientoRestante).toBe(4);
  });
});

describe("puertas", () => {
  it("abrirlas es gratis: ni gasta movimiento ni consume la acción", () => {
    const base = partida({ puertas: [puerta("p", c(0, 2), c(1, 2))] });
    let e = conMovimiento(situar(base, "barbaro", c(0, 2)), 5);
    e = hacer(e, { tipo: "abrirPuerta", puerta: "p" });
    expect(e.turno.movimientoRestante).toBe(5);
    expect(e.turno.haActuado).toBe(false);
  });

  it("abrir una puerta revela la sala y anuncia sus monstruos", () => {
    const base = partida({
      puertas: [puerta("p", c(0, 2), c(1, 2))],
      monstruos: [{ id: "orco1", especie: "orco", celda: c(3, 2) }],
    });
    const e0 = conMovimiento(situar(base, "barbaro", c(0, 2)), 5);
    const r = aplicarAccion(e0, { tipo: "abrirPuerta", puerta: "p" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.estado.salasReveladas).toContain("a");
    const revelada = r.eventos.find((x) => x.tipo === "salaRevelada");
    if (revelada?.tipo !== "salaRevelada") throw new Error("no se anunció la sala");
    expect(revelada.monstruos).toEqual(["orco1"]);
    expect(revelada.texto).toMatch(/moho/);
  });

  it("hay que estar al lado para abrirla", () => {
    const base = partida({ puertas: [puerta("p", c(0, 2), c(1, 2))] });
    const e = conMovimiento(situar(base, "barbaro", c(0, 6)), 5);
    expect(rechaza(e, { tipo: "abrirPuerta", puerta: "p" })).toMatch(/junto a la puerta/i);
  });
});

describe("ataque", () => {
  it("hace falta estar adyacente", () => {
    const base = partida({ monstruos: [{ id: "orco1", especie: "orco", celda: c(4, 3) }] });
    const e = conMovimiento(situar(base, "barbaro", c(1, 1)), 6);
    expect(rechaza(e, { tipo: "atacar", objetivo: "orco1" })).toMatch(/adyacente/i);
  });

  it("quita puntos de cuerpo y derrota al monstruo", () => {
    const base = partida({ monstruos: [{ id: "orco1", especie: "orco", celda: c(2, 1) }] });
    let e = conMovimiento(situar(base, "barbaro", c(1, 1)), 6);
    const r = aplicarAccion(e, { tipo: "atacar", objetivo: "orco1", dadosAtaque: [CAL], dadosDefensa: [BLA, BLA] });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    // El orco tiene 1 de cuerpo y solo para con escudos negros.
    expect(r.estado.monstruos[0]!.cuerpo).toBe(0);
    expect(r.eventos.some((x) => x.tipo === "figuraDerrotada")).toBe(true);
  });

  it("no se ataca a los del propio bando", () => {
    const base = partida({ heroes: [{ clase: "barbaro" }, { clase: "enano" }] });
    const e = conMovimiento(situar(situar(base, "barbaro", c(1, 1)), "enano", c(2, 1)), 6);
    expect(rechaza(e, { tipo: "atacar", objetivo: "enano" })).toMatch(/propio bando/i);
  });

  const conBallesta = (equipo: IdEquipo[]) => {
    const base = partida({
      heroes: [{ clase: "elfo" }],
      monstruos: [
        // El de al lado va en el pasillo de abajo, no en la línea de tiro: una
        // figura en medio tapa, y aquí lo que se quiere probar es el disparo.
        { id: "pegado", especie: "orco", celda: c(0, 1) },
        { id: "lejos", especie: "orco", celda: c(6, 0) },
      ],
    });
    let e = situar(base, "elfo", c(0, 0));
    e = { ...e, heroes: e.heroes.map((h) => ({ ...h, equipo })) };
    return conMovimiento(e, 6);
  };

  it("la ballesta dispara a distancia con línea de visión", () => {
    const e = conBallesta(["ballesta"]);
    const r = aplicarAccion(e, { tipo: "atacar", objetivo: "lejos", dadosAtaque: [CAL, CAL, CAL], dadosDefensa: [] });
    expect(r.ok).toBe(true);
    expect(dadosDeAtaque(e.heroes[0]!, "distancia")).toBe(3);
  });

  it("una figura en medio tapa el disparo de la ballesta", () => {
    const base = conBallesta(["ballesta"]);
    const e = situar(base, "pegado", c(3, 0));
    expect(rechaza(e, { tipo: "atacar", objetivo: "lejos" })).toMatch(/ni lo ves/i);
  });

  it("y quien la lleva sigue pudiendo apuñalar a quien tiene encima", () => {
    // El fallo era este: llevar ballesta anulaba el cuerpo a cuerpo. Con daga
    // en la otra mano se apuñala con la daga, no con la ballesta.
    const e = conBallesta(["ballesta", "daga"]);
    expect(dadosDeAtaque(e.heroes[0]!, "cuerpo")).toBe(1);
    expect(dadosDeAtaque(e.heroes[0]!, "distancia")).toBe(3);
    const r = aplicarAccion(e, { tipo: "atacar", objetivo: "pegado", dadosAtaque: [CAL], dadosDefensa: [] });
    expect(r.ok).toBe(true);
  });

  it("sin arma cuerpo a cuerpo se pelea igual, con un dado", () => {
    const e = conBallesta(["ballesta"]);
    expect(dadosDeAtaque(e.heroes[0]!, "cuerpo")).toBe(1);
    const r = aplicarAccion(e, { tipo: "atacar", objetivo: "pegado", dadosAtaque: [CAL], dadosDefensa: [] });
    expect(r.ok).toBe(true);
  });

  it("la espada no alcanza a quien está lejos", () => {
    const e = conBallesta(["espadaAncha"]);
    expect(rechaza(e, { tipo: "atacar", objetivo: "lejos" })).toMatch(/adyacente/i);
  });
});

describe("trampas", () => {
  const conFoso = (tipo: "foso" | "lanza" | "bloque") =>
    conMovimiento(
      situar(
        partida({ trampas: [{ id: "t1", tipo, celda: c(1, 2), descubierta: false, gastada: false }] }),
        "barbaro",
        c(1, 1),
      ),
      6,
    );

  it("el foso salta al pisarlo, hace daño y corta el movimiento", () => {
    const r = aplicarAccion(conFoso("foso"), { tipo: "mover", destino: c(1, 3) });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.estado.heroes[0]!.celda).toEqual(c(1, 2)); // se queda en el foso
    expect(r.estado.heroes[0]!.cuerpo).toBe(7); // 8 - 1
    expect(r.eventos.some((x) => x.tipo === "trampaDisparada")).toBe(true);
  });

  it("la lanza hiere pero deja seguir andando", () => {
    const r = aplicarAccion(conFoso("lanza"), { tipo: "mover", destino: c(1, 3) });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.estado.heroes[0]!.celda).toEqual(c(1, 3)); // ha seguido
    expect(r.estado.heroes[0]!.cuerpo).toBe(7);
  });

  it("el bloque ciega la casilla para el resto de la misión", () => {
    const r = aplicarAccion(conFoso("bloque"), { tipo: "mover", destino: c(1, 3) });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.estado.celdasBloqueadas).toContainEqual(c(1, 2));
  });

  it("quien dispara el bloque retrocede: no puede quedarse bajo la piedra", () => {
    const r = aplicarAccion(conFoso("bloque"), { tipo: "mover", destino: c(1, 3) });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    // Entró desde (1,1) y la piedra cae en (1,2): tiene que volver a (1,1).
    expect(r.estado.heroes[0]!.celda).toEqual(c(1, 1));
    expect(r.estado.celdasBloqueadas).toContainEqual(c(1, 2));
    expect(r.estado.heroes[0]!.cuerpo).toBe(7);
  });

  it("una trampa ya descubierta no vuelve a saltar", () => {
    const base = partida({
      trampas: [{ id: "t1", tipo: "lanza", celda: c(1, 2), descubierta: true, gastada: false }],
    });
    const e = conMovimiento(situar(base, "barbaro", c(1, 1)), 6);
    const r = aplicarAccion(e, { tipo: "mover", destino: c(1, 3) });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.estado.heroes[0]!.cuerpo).toBe(8);
  });
});

describe("los monstruos no disparan las trampas ocultas", () => {
  // Reglamento p. 17: «Monsters do not spring hidden traps». Las pone Zargon,
  // que sabe dónde están. Lo que se juega aquí no es el daño al monstruo sino
  // que la trampa siga entera: si sus orcos la gastasen, Zargon estaría
  // despejándoles el camino a los héroes sin querer.
  type TipoTrampa = "foso" | "lanza" | "bloque";

  /** El orco cruza de (1,1) a (1,3) pisando la trampa de (1,2) por el camino. */
  const cruza = (tipo: TipoTrampa) => {
    const base = partida({
      trampas: [{ id: "t1", tipo, celda: c(1, 2), descubierta: false, gastada: false }],
      monstruos: [{ id: "orco1", especie: "orco", celda: c(1, 1) }],
    });
    // El bárbaro entra en (0,1) y no estorba la columna 1.
    let e = hacer(base, { tipo: "terminarTurno" }); // le toca a Zargon
    e = hacer(e, { tipo: "activarMonstruo", monstruo: "orco1" });
    const r = aplicarAccion(e, { tipo: "mover", destino: c(1, 3) });
    if (!r.ok) throw new Error(`el orco no pudo cruzar: ${r.motivo}`);
    return r;
  };

  it("el orco cruza el foso oculto sin caerse, y el foso sigue sin gastar", () => {
    const r = cruza("foso");
    // El orco tiene un solo punto de cuerpo: si la trampa saltara, estaría muerto.
    expect(r.estado.monstruos[0]!.cuerpo).toBe(1);
    expect(r.estado.monstruos[0]!.celda).toEqual(c(1, 3)); // ni se ha parado en el foso
    expect(r.eventos.some((x) => x.tipo === "trampaDisparada")).toBe(false);
    expect(r.estado.trampas[0]!.gastada).toBe(false);
    expect(r.estado.trampas[0]!.descubierta).toBe(false); // y los héroes siguen sin verlo
  });

  it("y el héroe que pisa ese mismo foso después sí se cae", () => {
    let e = hacer(cruza("foso").estado, { tipo: "terminarTurno" }); // cierra el turno de Zargon
    e = conMovimiento(situar(e, "barbaro", c(1, 1)), 6);
    const r = aplicarAccion(e, { tipo: "mover", destino: c(1, 2) });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.estado.heroes[0]!.cuerpo).toBe(7);
    expect(r.eventos.some((x) => x.tipo === "trampaDisparada")).toBe(true);
  });

  it("la lanza tampoco hiere al orco", () => {
    const r = cruza("lanza");
    expect(r.estado.monstruos[0]!.cuerpo).toBe(1);
    expect(r.estado.trampas[0]!.gastada).toBe(false);
  });

  it("el bloque no le cae encima: la casilla no queda cegada", () => {
    const r = cruza("bloque");
    expect(r.estado.celdasBloqueadas).not.toContainEqual(c(1, 2));
    expect(r.estado.monstruos[0]!.celda).toEqual(c(1, 3)); // ni retrocede
    expect(r.estado.trampas[0]!.gastada).toBe(false);
  });
});

describe("búsquedas", () => {
  it("no se busca tesoro en un pasillo", () => {
    const e = conMovimiento(situar(partida(), "barbaro", c(0, 5)), 6);
    expect(rechaza(e, { tipo: "buscarTesoro" })).toMatch(/dentro de una sala/i);
  });

  it("no se busca tesoro con monstruos a la vista", () => {
    const base = partida({ monstruos: [{ id: "orco1", especie: "orco", celda: c(3, 2) }] });
    const e = { ...conMovimiento(situar(base, "barbaro", c(1, 1)), 6), salasReveladas: ["a"] };
    expect(rechaza(e, { tipo: "buscarTesoro" })).toMatch(/monstruos a la vista/i);
  });

  it("una sala solo se registra una vez", () => {
    let e = conMovimiento(situar(partida(), "barbaro", c(1, 1)), 6);
    e = hacer(e, { tipo: "buscarTesoro" });
    e = { ...e, turno: { ...e.turno, haActuado: false } };
    expect(rechaza(e, { tipo: "buscarTesoro" })).toMatch(/ya se ha registrado/i);
  });

  it("buscar trampas descubre las de la sala y las puertas secretas", () => {
    const base = partida({
      trampas: [{ id: "t1", tipo: "foso", celda: c(3, 2), descubierta: false, gastada: false }],
      puertas: [{ id: "s1", a: c(4, 2), b: c(5, 2), abierta: false, secreta: true, descubierta: false }],
    });
    const e = conMovimiento(situar(base, "barbaro", c(1, 1)), 6);
    const r = aplicarAccion(e, { tipo: "buscarTrampas" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.estado.trampas[0]!.descubierta).toBe(true);
    expect(r.estado.puertas[0]!.descubierta).toBe(true);
    expect(r.eventos.some((x) => x.tipo === "puertaSecretaDescubierta")).toBe(true);
  });
});

describe("hechizos", () => {
  const conMago = () => {
    const base = partida({
      heroes: [{ clase: "mago", elementos: ["fuego", "tierra", "agua"] }],
      monstruos: [{ id: "orco1", especie: "orco", celda: c(3, 1) }],
    });
    return { ...conMovimiento(situar(base, "mago", c(1, 1)), 6), salasReveladas: ["a"] };
  };

  it("el mago empieza con nueve hechizos y el elfo con tres", () => {
    expect(conMago().heroes[0]!.hechizos).toHaveLength(9);
    const elfo = partida({ heroes: [{ clase: "elfo", elementos: ["agua"] }] });
    expect(elfo.heroes[0]!.hechizos).toHaveLength(3);
  });

  it("se gastan al lanzarlos y no vuelven en toda la misión", () => {
    let e = conMago();
    e = hacer(e, { tipo: "lanzarHechizo", hechizo: "bolaDeFuego", objetivo: "orco1", dados: [CAL, CAL] });
    expect(e.heroes[0]!.hechizos).not.toContain("bolaDeFuego");
    expect(e.heroes[0]!.hechizosGastados).toContain("bolaDeFuego");
    e = { ...e, turno: { ...e.turno, haActuado: false } };
    expect(rechaza(e, { tipo: "lanzarHechizo", hechizo: "bolaDeFuego", objetivo: "orco1" })).toMatch(
      /no tienes ese hechizo/i,
    );
  });

  it("NO gastan puntos de mente", () => {
    let e = conMago();
    const menteAntes = e.heroes[0]!.mente;
    e = hacer(e, { tipo: "lanzarHechizo", hechizo: "bolaDeFuego", objetivo: "orco1", dados: [CAL] });
    expect(e.heroes[0]!.mente).toBe(menteAntes);
  });

  it("la bola de fuego hiere sin tirada de defensa", () => {
    let e = conMago();
    e = hacer(e, { tipo: "lanzarHechizo", hechizo: "bolaDeFuego", objetivo: "orco1", dados: [CAL, CAL] });
    expect(e.monstruos[0]!.cuerpo).toBe(0);
  });

  it("la curación no pasa del cuerpo máximo", () => {
    let e = conMago();
    e = { ...e, heroes: e.heroes.map((h) => ({ ...h, cuerpo: 3 })) }; // mago: máximo 4
    e = hacer(e, { tipo: "lanzarHechizo", hechizo: "curacion", objetivo: "mago" });
    expect(e.heroes[0]!.cuerpo).toBe(4);
  });

  it("hace falta línea de visión", () => {
    let e = conMago();
    e = situar(e, "orco1", c(6, 1)); // en la sala 'b', al otro lado del muro
    expect(
      rechaza(e, { tipo: "lanzarHechizo", hechizo: "bolaDeFuego", objetivo: "orco1" }),
    ).toMatch(/línea de visión/i);
  });
});

describe("turnos", () => {
  it("pasa de héroe a héroe y luego a Zargon", () => {
    let e = partida({ heroes: [{ clase: "barbaro" }, { clase: "enano" }] });
    expect(e.turno.orden).toEqual(["barbaro", "enano", "zargon"]);
    e = hacer(e, { tipo: "terminarTurno" });
    expect(e.turno.orden[e.turno.indice]).toBe("enano");
    e = hacer(e, { tipo: "terminarTurno" });
    expect(e.turno.orden[e.turno.indice]).toBe("zargon");
  });

  it("el turno nuevo empieza sin movimiento tirado", () => {
    let e = hacer(partida(), { tipo: "tirarMovimiento", dados: [6, 6] });
    e = hacer(e, { tipo: "terminarTurno" });
    expect(e.turno.movimientoTotal).toBeNull();
  });

  it("los monstruos no tiran movimiento: lo tienen fijo", () => {
    let e = partida({ monstruos: [{ id: "orco1", especie: "orco", celda: c(3, 1) }] });
    e = hacer(e, { tipo: "terminarTurno" }); // a Zargon
    expect(rechaza(e, { tipo: "tirarMovimiento" })).toMatch(/número fijo/i);
    e = hacer(e, { tipo: "activarMonstruo", monstruo: "orco1" });
    expect(e.turno.movimientoRestante).toBe(8); // el orco mueve 8
  });

  it("un monstruo no actúa dos veces en el mismo turno de Zargon", () => {
    let e = partida({
      monstruos: [
        { id: "orco1", especie: "orco", celda: c(3, 1) },
        { id: "orco2", especie: "orco", celda: c(4, 1) },
      ],
    });
    e = hacer(e, { tipo: "terminarTurno" });
    e = hacer(e, { tipo: "activarMonstruo", monstruo: "orco1" });
    e = hacer(e, { tipo: "terminarTurno" }); // cierra el orco1
    expect(rechaza(e, { tipo: "activarMonstruo", monstruo: "orco1" })).toMatch(/ya ha actuado/i);
    e = hacer(e, { tipo: "activarMonstruo", monstruo: "orco2" });
    e = hacer(e, { tipo: "terminarTurno" }); // no quedan: vuelve a los héroes
    expect(e.turno.orden[e.turno.indice]).toBe("barbaro");
  });
});

describe("desenlace", () => {
  it("gana la partida al caer el último monstruo", () => {
    const base = partida({
      mision: { ...MISION_PRUEBA, objetivo: { clase: "matarATodos" } },
      monstruos: [{ id: "orco1", especie: "orco", celda: c(2, 1) }],
    });
    let e = conMovimiento(situar(base, "barbaro", c(1, 1)), 6);
    e = hacer(e, { tipo: "atacar", objetivo: "orco1", dadosAtaque: [CAL], dadosDefensa: [] });
    expect(e.desenlace).toEqual({ victoria: true, motivo: expect.any(String) });
  });

  it("se pierde si caen todos los héroes", () => {
    let e = partida({ monstruos: [{ id: "orco1", especie: "orco", celda: c(2, 1) }] });
    e = situar(e, "barbaro", c(1, 1));
    e = { ...e, heroes: e.heroes.map((h) => ({ ...h, cuerpo: 1 })) };
    e = hacer(e, { tipo: "terminarTurno" });
    e = hacer(e, { tipo: "activarMonstruo", monstruo: "orco1" });
    e = hacer(e, { tipo: "atacar", objetivo: "barbaro", dadosAtaque: [CAL], dadosDefensa: [] });
    expect(e.desenlace?.victoria).toBe(false);
  });

  it("no se puede seguir jugando después del final", () => {
    const base = partida({
      mision: { ...MISION_PRUEBA, objetivo: { clase: "matarATodos" } },
      monstruos: [{ id: "orco1", especie: "orco", celda: c(2, 1) }],
    });
    let e = conMovimiento(situar(base, "barbaro", c(1, 1)), 6);
    e = hacer(e, { tipo: "atacar", objetivo: "orco1", dadosAtaque: [CAL], dadosDefensa: [] });
    expect(rechaza(e, { tipo: "terminarTurno" })).toMatch(/ya ha terminado/i);
  });
});

describe("repetición y deshacer", () => {
  const guion: Accion[] = [
    { tipo: "tirarMovimiento" },
    { tipo: "buscarTrampas" },
    { tipo: "terminarTurno" },
  ];

  it("repetir el guion da exactamente el mismo estado", () => {
    const inicial = situar(partida(), "barbaro", c(1, 1));
    let paso = inicial;
    for (const a of guion) paso = hacer(paso, a);
    expect(repetir(inicial, guion)).toEqual(paso);
  });

  it("deshacer es repetir con una acción menos", () => {
    const inicial = situar(partida(), "barbaro", c(1, 1));
    const completo = repetir(inicial, guion);
    const deshecho = repetir(inicial, guion.slice(0, -1));
    expect(deshecho.turno.indice).toBe(0);
    expect(completo.turno.indice).toBe(1);
  });

  it("el azar va dentro del estado: dos repeticiones coinciden", () => {
    const inicial = situar(partida(), "barbaro", c(1, 1));
    expect(repetir(inicial, guion)).toEqual(repetir(inicial, guion));
  });

  it("el reductor no muta el estado que recibe", () => {
    const antes = situar(partida(), "barbaro", c(1, 1));
    const copia = JSON.parse(JSON.stringify(antes));
    aplicarAccion(antes, { tipo: "tirarMovimiento" });
    expect(JSON.parse(JSON.stringify(antes))).toEqual(copia);
  });

  it("el estado es JSON puro, así que se puede guardar y reanudar", () => {
    const e = repetir(situar(partida(), "barbaro", c(1, 1)), guion);
    expect(JSON.parse(JSON.stringify(e))).toEqual(e);
  });
});
