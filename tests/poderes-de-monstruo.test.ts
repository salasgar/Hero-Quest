/**
 * T50 · Poderes de monstruo: el maleficio, la telaraña y la emboscada.
 *
 * Tres reglas nuevas del motor, y ninguna sale del reglamento —que no trae
 * estas criaturas— sino del encargo de Juan Luis del 2026-09-06. Cada bloque
 * prueba un poder aparte: que prende, que no prende y por qué, que el diario lo
 * cuenta en los dos modos, y que la IA lo propone y el motor lo acepta en una
 * escena real. El último bloque juega al azar sobre el calabozo con las tres
 * especies dentro, que es donde aparecen los fallos que nadie ha imaginado.
 */

import { describe, expect, it } from "vitest";
import { accionDeZargon, jugarTurnoDeZargon } from "../src/ai/difficulty";
import { motivoDeLaJugada, siguienteAccionDelMonstruo, turnoDeZargon } from "../src/ai/zargon";
import { MONSTRUOS, poderDe } from "../src/data/monsters";
import {
  MISION_CALABOZO,
  MONSTRUOS_CALABOZO,
  MUEBLES_CALABOZO,
  PUERTAS_CALABOZO,
  TRAMPAS_CALABOZO,
} from "../src/data/quests/calabozo";
import { salaEn } from "../src/data/board-base";
import { tirarD6, tirarDadoCombate } from "../src/engine/dice";
import { crearPartida, type HeroeElegido } from "../src/engine/partida";
import { aplicarAccion, DANO_DEL_MALEFICIO } from "../src/engine/reducer";
import { crearRng, entero } from "../src/engine/rng";
import {
  accionesDisponibles,
  casillasDeMovimiento,
  esTurnoDeZargon,
  figuraActiva,
  figurasPorCelda,
  hechizosLanzables,
  monstruosPorActivar,
  objetivosDeAtaque,
  objetivosDePoder,
  puedeBuscarTesoro,
  puedeBuscarTrampas,
  puertasAlAlcance,
} from "../src/engine/selectors";
import { claveCelda, esHeroe, sonAdyacentes, type Accion, type Celda, type EstadoPartida, type Evento, type Mision } from "../src/engine/types";
import { narrar } from "../src/narrator/local";
import { narrar as narrarRelato } from "../src/narrator/relato";
import { c, conMovimiento, enTablero, hacer, MISION_PRUEBA, partida, rechaza, situar } from "./ayuda";

const CAL = "calavera" as const;
const BLA = "escudoBlanco" as const;
const NEG = "escudoNegro" as const;

const conRng = (e: EstadoPartida, semilla: number): EstadoPartida => ({ ...e, rng: crearRng(semilla) });

/** Una semilla cuyo primer dado rojo cumple la condición. */
function semillaD6(cumple: (dado: number) => boolean): number {
  for (let s = 1; s < 1000; s++) if (cumple(tirarD6(crearRng(s))[0])) return s;
  throw new Error("ninguna de las primeras mil semillas sirve");
}

/** Una semilla cuyo primer dado de combate saca calavera, o no la saca. */
function semillaCombate(calavera: boolean): number {
  for (let s = 1; s < 1000; s++)
    if ((tirarDadoCombate(crearRng(s))[0] === "calavera") === calavera) return s;
  throw new Error("ninguna de las primeras mil semillas sirve");
}

const puerta = (id: string, a: Celda, b: Celda, abierta = false) => ({
  id, a, b, abierta, secreta: false, descubierta: true,
});

/** La sala `a` mide 4 × 3: columnas 1-4, filas 1-3 (ver `zargon.test.ts`). */
const MISION_EN_LA_SALA: Mision = { ...MISION_PRUEBA, entrada: [c(1, 1), c(1, 2)] };

const turnoDeZargonEn = (e: EstadoPartida): EstadoPartida =>
  enTablero({
    ...e,
    turno: { ...e.turno, indice: e.turno.orden.indexOf("zargon") },
    salasReveladas: ["a"],
  });

const evento = <T extends Evento["tipo"]>(eventos: readonly Evento[], tipo: T) =>
  eventos.find((x): x is Extract<Evento, { tipo: T }> => x.tipo === tipo);

describe("el campo de poder", () => {
  it("lo tienen las cinco especies de la ficha y ninguna más", () => {
    const conPoder = Object.values(MONSTRUOS).filter((m) => m.poder).map((m) => m.especie).sort();
    expect(conPoder).toEqual(["arañaGigante", "bruja", "brujo", "hechiceroDelCaos", "monstruoDeArena"]);
    expect(poderDe("brujo")).toBe("maleficio");
    expect(poderDe("arañaGigante")).toBe("telarana");
    expect(poderDe("monstruoDeArena")).toBe("emboscada");
    expect(poderDe("orco")).toBeUndefined();
  });
});

// ------------------------------------------------------------ maleficio

describe("el maleficio", () => {
  /** Un brujo al fondo de la sala, el bárbaro y el mago a la vista pero lejos de sus manos. */
  const escena = (): EstadoPartida =>
    hacer(
      turnoDeZargonEn(
        partida({
          mision: MISION_EN_LA_SALA,
          heroes: [{ clase: "barbaro" }, { clase: "mago", elementos: ["fuego", "aire", "agua"] }],
          monstruos: [{ id: "brujo", especie: "brujo", celda: c(4, 3) }],
        }),
      ),
      { tipo: "activarMonstruo", monstruo: "brujo" },
    );

  it("prende cuando el dado rojo supera la mente: dos puntos de cuerpo", () => {
    const e = conRng(escena(), semillaD6((d) => d > 2));
    const r = aplicarAccion(e, { tipo: "poderDeMonstruo", objetivo: "barbaro" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const ev = evento(r.eventos, "maleficio");
    expect(ev).toMatchObject({ actor: "brujo", objetivo: "barbaro", mente: 2, dano: DANO_DEL_MALEFICIO });
    expect(r.estado.heroes[0]!.cuerpo).toBe(8 - DANO_DEL_MALEFICIO);
    // Es la acción del turno: gastada, como un ataque.
    expect(r.estado.turno.haActuado).toBe(true);
    expect(narrar(r.estado, ev!)).toMatch(/maleficio.*puntos de cuerpo/);
    expect(narrarRelato(r.estado, ev!, 0)).toMatch(/cuerpo/);
  });

  it("no prende cuando el dado saca la mente o menos, y el diario dice que resiste", () => {
    const e = conRng(escena(), semillaD6((d) => d <= 2));
    const r = aplicarAccion(e, { tipo: "poderDeMonstruo", objetivo: "barbaro" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const ev = evento(r.eventos, "maleficio");
    expect(ev?.dano).toBe(0);
    expect(r.estado.heroes[0]!.cuerpo).toBe(8);
    expect(r.estado.turno.haActuado).toBe(true);
    expect(narrar(r.estado, ev!)).toMatch(/resiste/);
    expect(narrarRelato(r.estado, ev!, 0)).not.toBeNull();
  });

  it("el mago, con mente 6, lo resiste siempre", () => {
    const e = conRng(escena(), semillaD6((d) => d === 6));
    const r = aplicarAccion(e, { tipo: "poderDeMonstruo", objetivo: "mago" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(evento(r.eventos, "maleficio")?.dano).toBe(0);
  });

  it("puede tumbar a un héroe, y entonces cae como con cualquier golpe", () => {
    let e = conRng(escena(), semillaD6((d) => d > 2));
    e = { ...e, heroes: e.heroes.map((h) => (h.id === "barbaro" ? { ...h, cuerpo: 1 } : h)) };
    const r = aplicarAccion(e, { tipo: "poderDeMonstruo", objetivo: "barbaro" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.estado.heroes[0]!.cuerpo).toBe(0);
    expect(evento(r.eventos, "figuraDerrotada")?.figura).toBe("barbaro");
  });

  it("el selector ofrece a los héroes que el brujo ve, y solo a esos", () => {
    const e = escena();
    expect(objetivosDePoder(e).map((h) => h.id).sort()).toEqual(["barbaro", "mago"]);
    expect(accionesDisponibles(e).puedeUsarPoder).toBe(true);
    // El mago en el pasillo, tras la pared de la sala: no se ve y no se maldice.
    const fuera = situar(e, "mago", c(0, 5));
    expect(objetivosDePoder(fuera).map((h) => h.id)).toEqual(["barbaro"]);
    expect(rechaza(fuera, { tipo: "poderDeMonstruo", objetivo: "mago" })).toMatch(/línea de visión/i);
  });

  it("se rechaza cuando no toca: sin poder, con la acción gastada, fuera del turno de Zargon", () => {
    const orco = hacer(
      turnoDeZargonEn(
        partida({
          mision: MISION_EN_LA_SALA,
          monstruos: [{ id: "orco", especie: "orco", celda: c(4, 3) }],
        }),
      ),
      { tipo: "activarMonstruo", monstruo: "orco" },
    );
    expect(rechaza(orco, { tipo: "poderDeMonstruo", objetivo: "barbaro" })).toMatch(/no tiene ningún poder/i);

    const arana = hacer(
      turnoDeZargonEn(
        partida({
          mision: MISION_EN_LA_SALA,
          monstruos: [{ id: "arana", especie: "arañaGigante", celda: c(4, 3) }],
        }),
      ),
      { tipo: "activarMonstruo", monstruo: "arana" },
    );
    expect(rechaza(arana, { tipo: "poderDeMonstruo", objetivo: "barbaro" })).toMatch(/se dispara solo/i);

    const gastada = hacer(conRng(escena(), 1), { tipo: "poderDeMonstruo", objetivo: "barbaro" });
    expect(rechaza(gastada, { tipo: "poderDeMonstruo", objetivo: "mago" })).toMatch(/ya ha actuado/i);
    expect(accionesDisponibles(gastada).puedeUsarPoder).toBe(false);

    const heroeDeTurno = partida({ mision: MISION_EN_LA_SALA, monstruos: [{ id: "brujo", especie: "brujo", celda: c(4, 3) }] });
    expect(rechaza(heroeDeTurno, { tipo: "poderDeMonstruo", objetivo: "barbaro" })).toMatch(/turno de Zargon/i);

    const caido = { ...escena(), heroes: escena().heroes.map((h) => (h.id === "barbaro" ? { ...h, cuerpo: 0 } : h)) };
    expect(rechaza(caido, { tipo: "poderDeMonstruo", objetivo: "barbaro" })).toMatch(/ya ha caído/i);
  });

  it("la IA lo prefiere al ataque cuando no llega a nadie, y apunta al de poca mente", () => {
    const e = escena();
    const jugada = siguienteAccionDelMonstruo(e);
    expect(jugada).toEqual({ tipo: "poderDeMonstruo", objetivo: "barbaro" });
    expect(motivoDeLaJugada(e, jugada!)).toMatch(/mente/);
    // Y lo que propone, el motor lo acepta: es la invariante de T8.
    expect(aplicarAccion(e, jugada!).ok).toBe(true);
  });

  it("con el bárbaro al lado sigue maldiciendo: vale más que su daga", () => {
    const e = situar(escena(), "barbaro", c(4, 2));
    expect(objetivosDeAtaque(e).map((h) => h.id)).toEqual(["barbaro"]);
    expect(siguienteAccionDelMonstruo(e)).toEqual({ tipo: "poderDeMonstruo", objetivo: "barbaro" });
  });

  it("con el mago a mano lo prefiere a maldecir: la caza del lanzador de T8 sigue mandando", () => {
    // Un brujo es «rencoroso» (T49): va a por quien guarda hechizos. El mago
    // resiste el maleficio siempre, así que maldecirlo vale cero y pegarle con
    // la daga vale la caza entera; el brujo se acerca y pincha. No es un fallo
    // del poder: es el mismo sesgo con el que juega un goblin.
    const e = escena();
    const { acciones } = jugarTurnoDeZargon(e, "normal");
    expect(acciones.some((a) => a.tipo === "atacar" && a.objetivo === "mago")).toBe(true);
    expect(acciones.some((a) => a.tipo === "poderDeMonstruo")).toBe(false);
  });

  it("el turno de Zargon entero, en los tres niveles, maldice y no propone nada que el motor rechace", () => {
    // Sin mago que cazar: bárbaro y enano, los dos de poca mente, a la vista.
    const base = turnoDeZargonEn(
      partida({
        mision: MISION_EN_LA_SALA,
        heroes: [{ clase: "barbaro" }, { clase: "enano" }],
        monstruos: [
          { id: "brujo", especie: "brujo", celda: c(4, 3) },
          { id: "bruja", especie: "bruja", celda: c(3, 3) },
        ],
      }),
    );
    for (const nivel of ["torpe", "normal", "astuto"] as const) {
      const { acciones, estado } = jugarTurnoDeZargon(base, nivel);
      expect(acciones.filter((a) => a.tipo === "poderDeMonstruo"), nivel).toHaveLength(2);
      expect(esTurnoDeZargon(estado)).toBe(false);
    }
    const { acciones } = turnoDeZargon(base);
    expect(acciones.filter((a) => a.tipo === "poderDeMonstruo")).toHaveLength(2);
  });
});

// ------------------------------------------------------------ telaraña

describe("la telaraña", () => {
  /** La araña pegada al bárbaro, en el turno de Zargon. */
  const escena = (): EstadoPartida =>
    hacer(
      turnoDeZargonEn(
        situar(
          partida({
            mision: MISION_EN_LA_SALA,
            monstruos: [{ id: "arana", especie: "arañaGigante", celda: c(2, 2) }],
          }),
          "barbaro",
          c(2, 1),
        ),
      ),
      { tipo: "activarMonstruo", monstruo: "arana" },
    );

  const enredado = (e: EstadoPartida) => e.heroes[0]!.efectos.filter((x) => x.clase === "enredado");

  it("prende con la herida: el mordisco que hace daño deja al héroe enredado", () => {
    const r = aplicarAccion(escena(), { tipo: "atacar", objetivo: "barbaro", dadosAtaque: [CAL, CAL], dadosDefensa: [NEG, NEG] });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.estado.heroes[0]!.cuerpo).toBe(6);
    expect(enredado(r.estado)).toEqual([{ clase: "enredado", duracion: "mision" }]);
    const ev = evento(r.eventos, "enredado");
    expect(ev).toMatchObject({ figura: "barbaro", por: "arana" });
    expect(narrar(r.estado, ev!)).toMatch(/telaraña/);
    expect(narrarRelato(r.estado, ev!, 0)).not.toBeNull();
  });

  it("no prende si el mordisco no pasa la defensa", () => {
    const e = hacer(escena(), { tipo: "atacar", objetivo: "barbaro", dadosAtaque: [CAL, CAL], dadosDefensa: [BLA, BLA] });
    expect(e.heroes[0]!.cuerpo).toBe(8);
    expect(enredado(e)).toEqual([]);
  });

  it("al que ya está enredado no se le apunta dos veces", () => {
    let e = hacer(escena(), { tipo: "atacar", objetivo: "barbaro", dadosAtaque: [CAL], dadosDefensa: [] });
    expect(enredado(e)).toHaveLength(1);
    // Otra activación de la misma araña, sin pasar por el turno del héroe.
    e = { ...e, turno: { ...e.turno, haActuado: false } };
    const r = aplicarAccion(e, { tipo: "atacar", objetivo: "barbaro", dadosAtaque: [CAL], dadosDefensa: [] });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(enredado(r.estado)).toHaveLength(1);
    expect(evento(r.eventos, "enredado")).toBeUndefined();
  });

  /** El bárbaro ya enredado, en su propio turno, con la araña al lado. */
  const heroeEnredado = (): EstadoPartida => {
    const base = situar(
      partida({
        mision: MISION_EN_LA_SALA,
        monstruos: [{ id: "arana", especie: "arañaGigante", celda: c(2, 2) }],
      }),
      "barbaro",
      c(2, 1),
    );
    return enTablero({
      ...base,
      salasReveladas: ["a"],
      heroes: base.heroes.map((h) => ({ ...h, efectos: [{ clase: "enredado", duracion: "mision" as const }] })),
    });
  };

  it("con calavera sigue enredado: cero casillas, pero conserva la acción", () => {
    const r = aplicarAccion(conRng(heroeEnredado(), semillaCombate(true)), { tipo: "tirarMovimiento" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(evento(r.eventos, "tiraParaSoltarse")).toMatchObject({ figura: "barbaro", logrado: false });
    expect(evento(r.eventos, "tiradaMovimiento")).toBeUndefined();
    expect(r.estado.turno.movimientoTotal).toBe(0);
    expect(casillasDeMovimiento(r.estado)).toEqual([]);
    expect(enredado(r.estado)).toHaveLength(1);
    expect(narrar(r.estado, evento(r.eventos, "tiraParaSoltarse")!)).toMatch(/no se mueve/);
    // La acción es suya: le devuelve el mordisco.
    expect(objetivosDeAtaque(r.estado).map((m) => m.id)).toEqual(["arana"]);
    expect(aplicarAccion(r.estado, { tipo: "atacar", objetivo: "arana" }).ok).toBe(true);
    // Y no se tira el movimiento otra vez.
    expect(rechaza(r.estado, { tipo: "tirarMovimiento" })).toMatch(/ya has tirado/i);
  });

  it("sin calavera rompe la tela y tira el movimiento como siempre", () => {
    const r = aplicarAccion(conRng(heroeEnredado(), semillaCombate(false)), { tipo: "tirarMovimiento", dados: [3, 4] });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(evento(r.eventos, "tiraParaSoltarse")).toMatchObject({ figura: "barbaro", logrado: true });
    expect(evento(r.eventos, "tiradaMovimiento")?.total).toBe(7);
    expect(r.estado.turno.movimientoTotal).toBe(7);
    expect(enredado(r.estado)).toEqual([]);
    expect(narrar(r.estado, evento(r.eventos, "tiraParaSoltarse")!)).toMatch(/rompe/);
    expect(narrarRelato(r.estado, evento(r.eventos, "tiraParaSoltarse")!, 0)).not.toBeNull();
  });

  it("un héroe sin telaraña no tira nada de más", () => {
    const e = conRng(partida(), semillaCombate(true));
    const r = aplicarAccion(e, { tipo: "tirarMovimiento", dados: [2, 2] });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(evento(r.eventos, "tiraParaSoltarse")).toBeUndefined();
    expect(r.estado.turno.movimientoTotal).toBe(4);
  });
});

// ------------------------------------------------------------ emboscada

describe("la emboscada", () => {
  /** El bárbaro en el pasillo, ante la puerta de la sala `a`; el monstruo de arena dentro. */
  const escena = (extra: Partial<Parameters<typeof partida>[0]> = {}): EstadoPartida => {
    const base = partida({
      puertas: [puerta("p", c(0, 2), c(1, 2))],
      monstruos: [{ id: "arena", especie: "monstruoDeArena", celda: c(3, 2) }],
      ...extra,
    });
    return conMovimiento(situar(base, "barbaro", c(0, 2)), 6);
  };

  it("al abrir la puerta la sala se anuncia vacía y el monstruo se entierra", () => {
    const r = aplicarAccion(escena(), { tipo: "abrirPuerta", puerta: "p" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const e = r.estado;
    expect(evento(r.eventos, "salaRevelada")?.monstruos).toEqual([]);
    expect(narrar(e, evento(r.eventos, "salaRevelada")!)).toMatch(/vacía/i);
    expect(e.monstruos.map((m) => m.id)).toEqual([]);
    expect(e.emboscadas?.map((m) => m.id)).toEqual(["arena"]);
    expect(e.monstruosEnTablero).toEqual([]);
    // Nadie lo ve, nadie le pega, no ocupa casilla y no impide registrar la sala.
    expect(figurasPorCelda(e).has(claveCelda(c(3, 2)))).toBe(false);
    expect(objetivosDeAtaque(situar(e, "barbaro", c(3, 1))).map((m) => m.id)).toEqual([]);
    // Y el estado sigue siendo JSON puro, que es lo que permite guardarlo.
    expect(JSON.parse(JSON.stringify(e))).toEqual(e);
  });

  it("emerge pegado al primer héroe que pisa dentro, le muerde y corta el movimiento", () => {
    const abierta = hacer(escena(), { tipo: "abrirPuerta", puerta: "p" });
    const r = aplicarAccion(abierta, { tipo: "mover", destino: c(4, 3) });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const e = r.estado;
    const heroe = e.heroes[0]!;
    // Se para en la primera casilla de la sala, con lo que le queda de movimiento.
    expect(heroe.celda).toEqual(c(1, 2));
    expect(e.turno.movimientoRestante).toBe(5);
    expect(e.turno.haActuado).toBe(false);

    const arena = e.monstruos.find((m) => m.id === "arena")!;
    expect(arena).toBeTruthy();
    expect(e.emboscadas).toEqual([]);
    expect(e.monstruosEnTablero).toContain("arena");
    expect(sonAdyacentes(arena.celda, heroe.celda)).toBe(true);
    expect(salaEn(arena.celda.x, arena.celda.y)).toBe("a");

    const ev = evento(r.eventos, "emboscada");
    expect(ev).toMatchObject({ monstruo: "arena", sobre: "barbaro", celda: arena.celda });
    expect(narrar(e, ev!)).toMatch(/arena/i);
    expect(narrarRelato(e, ev!, 0)).not.toBeNull();
    // El mordisco es un ataque normal, con sus dados, y va después de emerger.
    const mordisco = evento(r.eventos, "ataque");
    expect(mordisco).toMatchObject({ atacante: "arena", objetivo: "barbaro" });
    expect(r.eventos.indexOf(ev!)).toBeLessThan(r.eventos.indexOf(mordisco!));
    expect(mordisco!.dadosAtaque).toHaveLength(3);
    // Y el héroe puede devolverle el golpe en el acto.
    expect(objetivosDeAtaque(e).map((m) => m.id)).toEqual(["arena"]);
  });

  it("emerge donde puede: si el héroe no tiene hueco al lado, no muerde", () => {
    // Tres compañeros tapan las tres casillas pegadas a (1,2) dentro de la sala.
    const abierta = hacer(
      escena({ heroes: [{ clase: "barbaro" }, { clase: "enano" }, { clase: "elfo" }, { clase: "mago" }] }),
      { tipo: "abrirPuerta", puerta: "p" },
    );
    let e = situar(situar(situar(abierta, "enano", c(1, 1)), "elfo", c(1, 3)), "mago", c(2, 2));
    e = { ...e, salasReveladas: ["a"] };
    const r = aplicarAccion(e, { tipo: "mover", destino: c(1, 2) });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const arena = r.estado.monstruos.find((m) => m.id === "arena")!;
    expect(salaEn(arena.celda.x, arena.celda.y)).toBe("a");
    expect(sonAdyacentes(arena.celda, c(1, 2))).toBe(false);
    expect(evento(r.eventos, "emboscada")).toBeTruthy();
    expect(evento(r.eventos, "ataque")).toBeUndefined();
  });

  it("un héroe que aparece dentro por otro camino también lo despierta", () => {
    // La sala ya revelada con el enterrado dentro, y un héroe que llega sin
    // pasar por `mover`: lo despierta el embudo de `terminar`, en la primera
    // acción que haga (aquí, tirar el movimiento).
    const abierta = hacer(escena(), { tipo: "abrirPuerta", puerta: "p" });
    const dentro = { ...situar(abierta, "barbaro", c(3, 3)), turno: { ...abierta.turno, movimientoTotal: null } };
    const r = aplicarAccion(dentro, { tipo: "tirarMovimiento", dados: [1, 1] });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(evento(r.eventos, "emboscada")?.sobre).toBe("barbaro");
    expect(r.estado.emboscadas).toEqual([]);
    expect(r.estado.monstruos.map((m) => m.id)).toEqual(["arena"]);
  });

  it("uno ya visto desde el pasillo no se entierra: los héroes lo han descubierto", () => {
    // Un monstruo de arena plantado en el pasillo, a la vista del grupo desde
    // el principio, está sobre el tablero (T18) y juega como cualquiera.
    const e = partida({ monstruos: [{ id: "arena", especie: "monstruoDeArena", celda: c(0, 6) }] });
    expect(e.monstruosEnTablero).toContain("arena");
    expect(e.emboscadas).toBeUndefined();
  });

  it("no se gana «matar a todos» con uno enterrado: hay que entrar a por él", () => {
    let e = hacer(
      escena({ mision: { ...MISION_PRUEBA, objetivo: { clase: "matarATodos" } } }),
      { tipo: "abrirPuerta", puerta: "p" },
    );
    expect(e.monstruos.filter((m) => m.cuerpo > 0)).toHaveLength(0);
    expect(e.desenlace).toBeNull();

    e = hacer(e, { tipo: "mover", destino: c(1, 2) });
    expect(e.desenlace).toBeNull();
    const arena = e.monstruos.find((m) => m.id === "arena")!;
    if (e.heroes[0]!.cuerpo === 0) return; // el mordisco no tumba a un bárbaro entero, pero por si acaso
    const r = aplicarAccion(e, {
      tipo: "atacar",
      objetivo: arena.id,
      dadosAtaque: [CAL, CAL, CAL, CAL],
      dadosDefensa: [BLA, BLA, BLA, BLA],
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.estado.desenlace?.victoria).toBe(true);
  });

  it("Zargon no puede activar a un enterrado, y el turno se cierra sin él", () => {
    const abierta = hacer(escena(), { tipo: "abrirPuerta", puerta: "p" });
    const zargon = hacer(abierta, { tipo: "terminarTurno" });
    expect(esTurnoDeZargon(zargon)).toBe(true);
    expect(monstruosPorActivar(zargon)).toEqual([]);
    expect(rechaza(zargon, { tipo: "activarMonstruo", monstruo: "arena" })).toMatch(/no existe/i);
    expect(accionDeZargon(zargon)).toEqual({ tipo: "terminarTurno" });
  });
});

// ------------------------------------------------------------ juego al azar

/**
 * El calabozo con las tres especies dentro: la araña y el brujo en la primera
 * sala, el monstruo de arena y la bruja en la segunda. Es la misión de verdad
 * con otros bichos, para que el juego al azar pise puertas, trampas y salas
 * como en la mesa.
 */
const MONSTRUOS_CON_PODERES = MONSTRUOS_CALABOZO.map((m) => {
  switch (m.id) {
    case "goblin1": return { ...m, especie: "arañaGigante" as const };
    case "goblin2": return { ...m, especie: "brujo" as const };
    case "orco1": return { ...m, especie: "monstruoDeArena" as const };
    case "goblin3": return { ...m, especie: "bruja" as const };
    default: return m;
  }
});

const CLASICOS: HeroeElegido[] = [
  { clase: "barbaro" },
  { clase: "enano" },
  { clase: "elfo", elementos: ["agua"] },
  { clase: "mago", elementos: ["fuego", "tierra", "aire"] },
];

const nueva = (semilla: number) =>
  crearPartida({
    mision: MISION_CALABOZO,
    heroes: CLASICOS,
    monstruos: MONSTRUOS_CON_PODERES,
    puertas: PUERTAS_CALABOZO,
    muebles: MUEBLES_CALABOZO,
    trampas: TRAMPAS_CALABOZO,
    semilla,
  });

/** Las acciones legales ahora mismo, como en `integracion.test.ts`, más el poder. */
function accionesPosibles(e: EstadoPartida): Accion[] {
  const salida: Accion[] = [{ tipo: "terminarTurno" }];
  const activa = figuraActiva(e);
  if (esTurnoDeZargon(e) && !activa) {
    for (const m of monstruosPorActivar(e)) salida.push({ tipo: "activarMonstruo", monstruo: m.id });
    return salida;
  }
  if (!activa) return salida;
  if (esHeroe(activa) && activa.cuerpo <= 0) return salida;
  if (!esTurnoDeZargon(e) && e.turno.movimientoTotal === null) salida.push({ tipo: "tirarMovimiento" });
  for (const k of casillasDeMovimiento(e)) salida.push({ tipo: "mover", destino: k });
  for (const o of objetivosDeAtaque(e)) salida.push({ tipo: "atacar", objetivo: o.id });
  for (const h of objetivosDePoder(e)) salida.push({ tipo: "poderDeMonstruo", objetivo: h.id });
  for (const p of puertasAlAlcance(e)) salida.push({ tipo: "abrirPuerta", puerta: p.id });
  if (puedeBuscarTesoro(e)) salida.push({ tipo: "buscarTesoro" });
  if (puedeBuscarTrampas(e)) salida.push({ tipo: "buscarTrampas" });
  for (const { hechizo, objetivos } of hechizosLanzables(e))
    for (const o of objetivos) salida.push({ tipo: "lanzarHechizo", hechizo, objetivo: o.id });
  return salida;
}

function comprobarInvariantes(e: EstadoPartida, contexto: string) {
  const vivas = [...e.heroes, ...e.monstruos].filter((f) => f.cuerpo > 0);
  const celdas = vivas.map((f) => claveCelda(f.celda));
  expect(new Set(celdas).size, `${contexto}: dos figuras en la misma casilla`).toBe(celdas.length);
  for (const f of [...e.heroes, ...e.monstruos]) {
    expect(f.cuerpo, `${contexto}: cuerpo negativo en ${f.id}`).toBeGreaterThanOrEqual(0);
  }
  expect(e.turno.movimientoRestante, `${contexto}: movimiento negativo`).toBeGreaterThanOrEqual(0);
  // Un enterrado no está en dos sitios ni fuera de una sala revelada.
  for (const m of e.emboscadas ?? []) {
    expect(e.monstruos.some((x) => x.id === m.id), `${contexto}: ${m.id} enterrado y en el tablero`).toBe(false);
    expect(e.monstruosEnTablero, `${contexto}: ${m.id} enterrado y sobre el tablero`).not.toContain(m.id);
    const sala = salaEn(m.celda.x, m.celda.y);
    expect(sala, `${contexto}: ${m.id} enterrado fuera de una sala`).not.toBeNull();
    expect(e.salasReveladas, `${contexto}: ${m.id} enterrado en una sala a oscuras`).toContain(sala);
  }
  // Un enredado es siempre un héroe en pie o caído, nunca un monstruo.
  for (const m of e.monstruos)
    expect(m.efectos.some((x) => x.clase === "enredado"), `${contexto}: ${m.id} enredado`).toBe(false);
}

describe("juego al azar con las tres especies", () => {
  it("aguanta cientos de acciones legales y ve los tres poderes en acción", { timeout: 60_000 }, () => {
    const vistos = new Set<string>();
    for (let semilla = 1; semilla <= 10; semilla++) {
      let e = nueva(semilla);
      let rng = crearRng(semilla * 977);
      let pasos = 0;
      while (!e.desenlace && pasos < 700) {
        const posibles = accionesPosibles(e);
        const [i, r2] = entero(rng, posibles.length);
        rng = r2;
        const elegida = posibles[i]!;
        const res = aplicarAccion(e, elegida);
        expect(res.ok, `semilla ${semilla}: rechazó una acción que ofrecía — ${JSON.stringify(elegida)} → ${res.ok ? "" : res.motivo}`).toBe(true);
        if (!res.ok) break;
        for (const ev of res.eventos) vistos.add(ev.tipo);
        e = res.estado;
        comprobarInvariantes(e, `semilla ${semilla}, paso ${pasos}`);
        pasos++;
      }
      expect(JSON.parse(JSON.stringify(e))).toEqual(e);
      // Los dos narradores saben contar todo lo que ha pasado.
      for (const [n, ev] of e.registro.entries()) {
        expect(() => narrar(e, ev, n)).not.toThrow();
        expect(() => narrarRelato(e, ev, n)).not.toThrow();
      }
    }
    for (const tipo of ["maleficio", "enredado", "tiraParaSoltarse", "emboscada"])
      expect(vistos.has(tipo), `en diez partidas al azar nunca pasó «${tipo}»`).toBe(true);
  });

  it("la IA juega el calabozo con poderes de principio a fin sin que el motor rechace nada", { timeout: 60_000 }, () => {
    // Los héroes se limitan a abrir puertas y acercarse; la IA lleva a Zargon
    // en los tres niveles. Lo que importa es que todo lo que propone pasa; que
    // lance el maleficio lo prueban la escena de arriba y el juego al azar.
    for (const nivel of ["torpe", "normal", "astuto"] as const) {
      let e = nueva(nivel.length);
      for (let ronda = 0; ronda < 60 && !e.desenlace; ronda++) {
        if (esTurnoDeZargon(e)) {
          for (let i = 0; i < 200 && esTurnoDeZargon(e) && !e.desenlace; i++) {
            const a = accionDeZargon(e, nivel);
            if (!a) break;
            const r = aplicarAccion(e, a);
            expect(r.ok, `${nivel}: ${JSON.stringify(a)} → ${r.ok ? "" : r.motivo}`).toBe(true);
            if (!r.ok) return;
            e = r.estado;
          }
          continue;
        }
        const p = puertasAlAlcance(e)[0];
        if (p) { e = hacer(e, { tipo: "abrirPuerta", puerta: p.id }); continue; }
        const o = objetivosDeAtaque(e)[0];
        if (o) { e = hacer(e, { tipo: "atacar", objetivo: o.id }); e = hacer(e, { tipo: "terminarTurno" }); continue; }
        if (e.turno.movimientoTotal === null) { e = hacer(e, { tipo: "tirarMovimiento" }); continue; }
        const destino = casillasDeMovimiento(e).sort((a, b) => a.y - b.y || a.x - b.x)[0];
        if (destino) e = hacer(e, { tipo: "mover", destino });
        e = hacer(e, { tipo: "terminarTurno" });
      }
    }
  });
});
