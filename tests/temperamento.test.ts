/**
 * T38 · Monstruos agresivos, miedosos y prudentes: la huida.
 *
 * Cada escena está montada para que **el temperamento sea lo único que cambia**:
 * el mismo tablero, los mismos héroes y el mismo monstruo, y solo se mueve la
 * palabra `temperamento`. Si un test de aquí pasara con los tres, no estaría
 * probando nada.
 *
 * La receta de T1, aplicada a esta tarea: con `distanciaDeLosHeroes` a cero
 * tienen que caer los tests del miedoso y del prudente, y **solo** esos. Hay un
 * bloque al final que lo comprueba desde dentro, comparando al miedoso con el
 * agresivo cuando el peso se apaga.
 *
 * Geometría, heredada de T8: **la sala `a` mide 4 × 3** (columnas 1-4, filas
 * 1-3); `tareas/_COMUN.md` dice 4 × 4 y está equivocado. Un héroe en la fila 4
 * queda detrás de un muro y la escena deja de probar lo que dice probar.
 */

import { describe, expect, it } from "vitest";
import {
  MISION_CALABOZO,
  MONSTRUOS_CALABOZO,
  MUEBLES_CALABOZO,
  PUERTAS_CALABOZO,
  TRAMPAS_CALABOZO,
} from "../src/data/quests/calabozo";
import { accionDeZargon, DIFICULTADES, PESOS_POR_NIVEL } from "../src/ai/difficulty";
import {
  DISTANCIA_QUE_TRANQUILIZA,
  ganasDeHuir,
  HEROES_QUE_ASUSTAN,
  REPARTO_DE_TEMPERAMENTOS,
  repartirTemperamentos,
} from "../src/ai/personalities";
import { distanciaAOjo, separacionDeLosHeroes } from "../src/ai/targeting";
import { esHuida, motivoDeLaJugada, siguienteAccionDelMonstruo } from "../src/ai/zargon";
import { crearPartida } from "../src/engine/partida";
import { aplicarAccion } from "../src/engine/reducer";
import { esTurnoDeZargon, figuraActiva } from "../src/engine/selectors";
import { crearRng } from "../src/engine/rng";
import {
  temperamentoDe,
  type Celda,
  type EstadoPartida,
  type Mision,
  type Temperamento,
} from "../src/engine/types";
import { c, conMovimiento, enTablero, hacer, MISION_PRUEBA, partida, situar } from "./ayuda";

const MISION: Mision = { ...MISION_PRUEBA, entrada: [c(1, 1), c(1, 2), c(1, 3), c(1, 4)] };

/**
 * La escena: un goblin en la sala `a` con el temperamento que se le pase, y los
 * héroes que haga falta. El goblin anda 10, así que dentro de la sala llega a
 * cualquier rincón: cuando no se mueve, es porque no quiere.
 */
const escena = (temperamento: Temperamento, cuantosHeroes = 1): EstadoPartida => {
  const heroes = [
    { clase: "barbaro" as const },
    { clase: "enano" as const },
    { clase: "elfo" as const, elementos: ["agua" as const] },
  ].slice(0, cuantosHeroes);

  const e = partida({
    mision: MISION,
    heroes,
    monstruos: [{ id: "goblin", especie: "goblin", celda: c(3, 2), temperamento }],
  });

  return enTablero({
    ...e,
    turno: { ...e.turno, indice: e.turno.orden.indexOf("zargon") },
    salasReveladas: ["a"],
  });
};

/** Activa al goblin por la vía del motor, que es la única que vale. */
const conElGoblinActivo = (e: EstadoPartida): EstadoPartida =>
  hacer(e, { tipo: "activarMonstruo", monstruo: "goblin" });

const celdaDelGoblin = (e: EstadoPartida): Celda => e.monstruos.find((m) => m.id === "goblin")!.celda;

describe("el miedoso", () => {
  it("con sitio por donde irse, se aleja en vez de pegar", () => {
    // El bárbaro pegado al goblin: hay ataque servido, y aun así se va.
    let e = escena("miedoso");
    e = situar(e, "barbaro", c(2, 2));
    e = conElGoblinActivo(e);

    const antes = separacionDeLosHeroes(e, celdaDelGoblin(e));
    expect(antes).toBe(1);

    const jugada = siguienteAccionDelMonstruo(e);
    expect(jugada?.tipo).toBe("mover");
    expect(esHuida(e, jugada!)).toBe(true);

    const despues = hacer(e, jugada!);
    expect(separacionDeLosHeroes(despues, celdaDelGoblin(despues))).toBeGreaterThan(antes);
  });

  it("acorralado, pega: no hay casilla que lo aleje y atacar es lo único que suma", () => {
    // El goblin en la esquina (1,1) con los dos héroes tapando las dos únicas
    // salidas ortogonales. No es una excepción escrita en el código: la huida
    // vale lo mismo en todas las casillas a las que puede ir, así que gana el
    // ataque.
    let e = escena("miedoso", 2);
    e = situar(e, "goblin", c(1, 1));
    e = situar(e, "barbaro", c(2, 1));
    e = situar(e, "enano", c(1, 2));
    e = conElGoblinActivo(e);

    expect(siguienteAccionDelMonstruo(e)?.tipo).toBe("atacar");
  });

  it("una vez lejos, se para: el miedo no lo hace correr toda la partida", () => {
    // A `DISTANCIA_QUE_TRANQUILIZA` casillas o más, alejarse otra no puntúa, y
    // quedarse gana los empates. Sin este tope el miedoso se pasaría la misión
    // dando vueltas y ninguna partida terminaría.
    let e = escena("miedoso");
    e = situar(e, "goblin", c(4, 3));
    e = situar(e, "barbaro", c(20, 15));
    e = conElGoblinActivo(e);

    const separacion = separacionDeLosHeroes(e, celdaDelGoblin(e));
    expect(separacion).toBeGreaterThanOrEqual(DISTANCIA_QUE_TRANQUILIZA);
    // Sin nadie a quien atacar ni distancia que ganar, no hay jugada.
    expect(siguienteAccionDelMonstruo(e)).toBeNull();
  });

  it("huye también en el nivel torpe, que es con el que se juega en casa", () => {
    // La miopía del torpe («si puedes pegar, pega y no te recoloques») no se
    // aplica al que quiere irse: si se aplicara, el nivel torpe se quedaría sin
    // miedosos.
    let e = escena("miedoso");
    e = situar(e, "barbaro", c(2, 2));
    e = conElGoblinActivo(e);

    const jugada = accionDeZargon(e, "torpe");
    expect(jugada?.tipo).toBe("mover");
    expect(esHuida(e, jugada!)).toBe(true);
  });
});

describe("el prudente", () => {
  it("con un héroe delante, pelea", () => {
    let e = escena("prudente");
    e = situar(e, "barbaro", c(2, 2));
    e = conElGoblinActivo(e);

    expect(siguienteAccionDelMonstruo(e)).toEqual({ tipo: "atacar", objetivo: "barbaro" });
  });

  it("con tres héroes encima, se retira", () => {
    let e = escena("prudente", 3);
    e = situar(e, "goblin", c(2, 2));
    e = situar(e, "barbaro", c(1, 1));
    e = situar(e, "enano", c(1, 2));
    e = situar(e, "elfo", c(1, 3));
    e = conElGoblinActivo(e);

    const activo = figuraActiva(e)!;
    expect(ganasDeHuir(e, activo)).toBe(1);

    const jugada = siguienteAccionDelMonstruo(e);
    expect(jugada?.tipo).toBe("mover");
    expect(esHuida(e, jugada!)).toBe(true);
  });

  it("decide en la casilla en la que está, no en la de destino", () => {
    // Si las ganas de huir se preguntaran casilla a casilla, el prudente dejaría
    // de tener héroes cerca justo en las casillas a las que huye, la huida no
    // puntuaría y se quedaría a pelear tres contra uno: decidiría no huir por
    // haber huido. Aquí se ve que la casilla de destino ya no le da miedo.
    let e = escena("prudente", 3);
    e = situar(e, "goblin", c(2, 2));
    e = situar(e, "barbaro", c(1, 1));
    e = situar(e, "enano", c(1, 2));
    e = situar(e, "elfo", c(1, 3));
    e = conElGoblinActivo(e);

    const jugada = siguienteAccionDelMonstruo(e);
    const despues = hacer(e, jugada!);
    const activoDespues = figuraActiva(despues)!;
    expect(ganasDeHuir(despues, activoDespues)).toBe(0);
  });
});

describe("el agresivo", () => {
  it("no huye ni con tres héroes encima: es el comportamiento de siempre", () => {
    // Rodeado como el prudente de arriba, pero con tres héroes delante elige
    // **a cuál pegar** —el elfo, que guarda hechizos— en vez de irse. Lo que se
    // comprueba no es que ataque en esta jugada, sino que ninguna de las suyas
    // es una retirada.
    const rodeado = (temperamento: Temperamento) => {
      let e = escena(temperamento, 3);
      e = situar(e, "goblin", c(2, 2));
      e = situar(e, "barbaro", c(1, 1));
      e = situar(e, "enano", c(1, 2));
      e = situar(e, "elfo", c(1, 3));
      return conElGoblinActivo(e);
    };

    const e = rodeado("agresivo");
    const jugada = siguienteAccionDelMonstruo(e)!;
    expect(ganasDeHuir(e, figuraActiva(e)!)).toBe(0);
    expect(esHuida(e, jugada)).toBe(false);

    // Y en la misma escena, con lo único distinto siendo el temperamento, el
    // prudente sí se retira: si esto empatara, el test no probaría nada.
    const otro = rodeado("prudente");
    expect(esHuida(otro, siguienteAccionDelMonstruo(otro)!)).toBe(true);
  });

  it("y el monstruo que nace sin temperamento juega como él", () => {
    // El errante que sale de una carta de tesoro nace en `reducer.ts`, que T38
    // no toca. Sin temperamento, `temperamentoDe` lo trata como agresivo, así
    // que la partida no cambia por lo que esta tarea no ha podido tocar.
    const sinTemperamento = { tipo: "monstruo" as const, temperamento: undefined };
    expect(temperamentoDe({ ...sinTemperamento } as never)).toBe("agresivo");
  });
});

describe("lo que se dice en la mesa", () => {
  it("el motivo de una huida dice que huye, no a por quién va", () => {
    let e = escena("miedoso");
    e = situar(e, "barbaro", c(2, 2));
    e = conElGoblinActivo(e);

    const jugada = siguienteAccionDelMonstruo(e)!;
    expect(motivoDeLaJugada(e, jugada)).toMatch(/^huye/);
  });

  it("y cuando huye por número, lo dice con el número", () => {
    let e = escena("prudente", 3);
    e = situar(e, "goblin", c(2, 2));
    e = situar(e, "barbaro", c(1, 1));
    e = situar(e, "enano", c(1, 2));
    e = situar(e, "elfo", c(1, 3));
    e = conElGoblinActivo(e);

    const jugada = siguienteAccionDelMonstruo(e)!;
    expect(motivoDeLaJugada(e, jugada)).toBe("huye: tiene 3 héroes encima");
  });

  it("un agresivo que rodea a alguien no sale como que huye", () => {
    let e = escena("agresivo");
    e = situar(e, "barbaro", c(1, 1));
    e = situar(e, "goblin", c(4, 3));
    e = conElGoblinActivo(e);

    const jugada = siguienteAccionDelMonstruo(e)!;
    expect(esHuida(e, jugada)).toBe(false);
    expect(motivoDeLaJugada(e, jugada)).toBe("va a por Bárbaro");
  });
});

describe("con el peso de huida apagado (la receta de T1)", () => {
  const sinHuida = { ...PESOS_POR_NIVEL.normal, distanciaDeLosHeroes: 0 };

  it("el miedoso vuelve a pegar como un agresivo", () => {
    let e = escena("miedoso");
    e = situar(e, "barbaro", c(2, 2));
    e = conElGoblinActivo(e);

    expect(siguienteAccionDelMonstruo(e, sinHuida)).toEqual({
      tipo: "atacar",
      objetivo: "barbaro",
    });
  });

  it("y el prudente rodeado juega exactamente como el agresivo", () => {
    const rodeado = (temperamento: Temperamento) => {
      let e = escena(temperamento, 3);
      e = situar(e, "goblin", c(2, 2));
      e = situar(e, "barbaro", c(1, 1));
      e = situar(e, "enano", c(1, 2));
      e = situar(e, "elfo", c(1, 3));
      return conElGoblinActivo(e);
    };

    const prudente = rodeado("prudente");
    const agresivo = rodeado("agresivo");
    // Con el peso apagado, el temperamento deja de existir: la misma jugada,
    // acción por acción. Con el peso puesto, el prudente se retira y el
    // agresivo no.
    expect(siguienteAccionDelMonstruo(prudente, sinHuida)).toEqual(
      siguienteAccionDelMonstruo(agresivo, sinHuida),
    );
    expect(esHuida(prudente, siguienteAccionDelMonstruo(prudente)!)).toBe(true);
  });
});

describe("el reparto de temperamentos", () => {
  it("cada especie reparte sus tres probabilidades y suman uno", () => {
    for (const [especie, reparto] of Object.entries(REPARTO_DE_TEMPERAMENTOS)) {
      const suma = reparto.agresivo + reparto.miedoso + reparto.prudente;
      expect(`${especie}: ${suma.toFixed(3)}`).toBe(`${especie}: 1.000`);
    }
  });

  it("los no muertos no tienen miedo", () => {
    for (const especie of ["esqueleto", "zombi", "momia"] as const) {
      expect(REPARTO_DE_TEMPERAMENTOS[especie].miedoso).toBe(0);
    }
  });

  it("la misma semilla da los mismos temperamentos", () => {
    const monstruos = MONSTRUOS_CALABOZO.map(({ id, especie, celda }) => ({ id, especie, celda }));
    const temperamentos = (semilla: number) =>
      crearPartida({
        mision: MISION_CALABOZO,
        heroes: [{ clase: "barbaro" }],
        monstruos,
        puertas: PUERTAS_CALABOZO,
        semilla,
      }).monstruos.map((m) => m.temperamento);

    expect(temperamentos(7)).toEqual(temperamentos(7));
    // Y no es que salga siempre lo mismo pase lo que pase: con otra semilla
    // cambia. Si esto empatara, el test de arriba no probaría nada.
    const semillas = [7, 8, 9, 10, 11].map((s) => JSON.stringify(temperamentos(s)));
    expect(new Set(semillas).size).toBeGreaterThan(1);
  });

  it("el que fija la misión se respeta y no gasta tirada", () => {
    const especies = [
      { especie: "goblin" as const },
      { especie: "goblin" as const },
      { especie: "orco" as const },
    ];
    const libres = repartirTemperamentos(especies, crearRng(3));
    const conJefe = repartirTemperamentos(
      [{ ...especies[0]!, temperamento: "agresivo" as const }, especies[1]!, especies[2]!],
      crearRng(3),
    );

    expect(conJefe[0]).toBe("agresivo");
    // Los otros dos salen igual que si el primero no estuviera fijado: fijar uno
    // a mano no puede cambiar el temperamento de los demás.
    expect(conJefe.slice(1)).toEqual(libres.slice(1));
  });

  it("el sorteo no toca ni los nombres ni los dados de la partida", () => {
    // Cada uno tira de su propia corriente. Si compartieran generador, este test
    // caería y con él los cuarenta y tantos que fijan semilla.
    const nueva = () =>
      crearPartida({
        mision: MISION_CALABOZO,
        heroes: [{ clase: "barbaro" }, { clase: "mago", elementos: ["fuego", "aire", "agua"] }],
        monstruos: MONSTRUOS_CALABOZO,
        puertas: PUERTAS_CALABOZO,
        muebles: MUEBLES_CALABOZO,
        trampas: TRAMPAS_CALABOZO,
        semilla: 1234,
      });

    const a = nueva();
    const b = nueva();
    expect(a.monstruos.map((m) => m.nombre)).toEqual(b.monstruos.map((m) => m.nombre));
    expect(a.mazoTesoros).toEqual(b.mazoTesoros);
  });
});

describe("sobre la misión de verdad", () => {
  const partidaReal = (temperamento: Temperamento) =>
    crearPartida({
      mision: MISION_CALABOZO,
      heroes: [
        { clase: "barbaro" },
        { clase: "enano" },
        { clase: "elfo", elementos: ["agua"] },
        { clase: "mago", elementos: ["fuego", "tierra", "aire"] },
      ],
      monstruos: MONSTRUOS_CALABOZO.map((m) => ({ ...m, temperamento })),
      puertas: PUERTAS_CALABOZO,
      muebles: MUEBLES_CALABOZO,
      trampas: TRAMPAS_CALABOZO,
      semilla: 2026,
    });

  for (const temperamento of ["agresivo", "miedoso", "prudente"] as const) {
    for (const nivel of DIFICULTADES) {
      it(`el motor acepta todo lo que propone Zargon con monstruos ${temperamento}s (${nivel})`, () => {
        // La invariante que más importa de la IA, heredada de T8: una jugada
        // ilegal no se ve como un test rojo, se ve en la mesa como un monstruo
        // que no se mueve con cuatro niños mirando.
        let e: EstadoPartida = enTablero(partidaReal(temperamento));
        e = { ...e, turno: { ...e.turno, indice: e.turno.orden.indexOf("zargon") } };
        e = { ...e, salasReveladas: MONSTRUOS_CALABOZO.map((m) => m.id).length > 0 ? e.salasReveladas : [] };

        let turnos = 0;
        for (let i = 0; i < 400 && turnos < 5; i++) {
          if (!esTurnoDeZargon(e)) {
            // Le toca a un héroe: se pasa de turno sin jugarlo, que aquí lo que
            // se prueba es Zargon.
            const r = aplicarAccion(e, { tipo: "terminarTurno" });
            expect(r.ok).toBe(true);
            e = r.ok ? r.estado : e;
            continue;
          }
          const accion = accionDeZargon(e, nivel);
          if (!accion) break;
          const r = aplicarAccion(e, accion);
          expect(r.ok ? "" : `${r.motivo} · ${JSON.stringify(accion)}`).toBe("");
          if (!r.ok) break;
          if (accion.tipo === "terminarTurno" && !esTurnoDeZargon(r.estado)) turnos++;
          e = r.estado;
        }
        expect(turnos).toBeGreaterThan(0);
      });
    }
  }
});

describe("la distancia a ojo", () => {
  it("cuenta casillas ortogonales y no pregunta por el camino", () => {
    // `distancia()` mide caminos y devuelve infinito contra una sala cerrada:
    // con ella, ninguna casilla sería mejor que otra para huir.
    expect(distanciaAOjo(c(1, 1), c(4, 3))).toBe(5);
    expect(distanciaAOjo(c(2, 2), c(2, 2))).toBe(0);
  });

  it("el umbral del prudente es el número de héroes, no una casualidad de la escena", () => {
    expect(HEROES_QUE_ASUSTAN).toBe(3);
  });

  it("sin héroes vivos, la separación es infinita y nadie huye de nadie", () => {
    let e = escena("miedoso");
    e = { ...e, heroes: e.heroes.map((h) => ({ ...h, cuerpo: 0 })) };
    e = conMovimiento(conElGoblinActivo(e), 6);

    expect(separacionDeLosHeroes(e, celdaDelGoblin(e))).toBe(Infinity);
    expect(siguienteAccionDelMonstruo(e)).toBeNull();
  });
});
