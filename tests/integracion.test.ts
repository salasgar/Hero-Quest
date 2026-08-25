import { describe, it, expect } from "vitest";
import {
  MISION_CALABOZO,
  MONSTRUOS_CALABOZO,
  MUEBLES_CALABOZO,
  PUERTAS_CALABOZO,
  TRAMPAS_CALABOZO,
} from "../src/data/quests/calabozo";
import { crearPartida, type HeroeElegido } from "../src/engine/partida";
import { aplicarAccion } from "../src/engine/reducer";
import {
  casillasDeMovimiento,
  esTurnoDeZargon,
  figuraActiva,
  hechizosLanzables,
  monstruosPorActivar,
  objetivosDeAtaque,
  puedeBuscarTesoro,
  puedeBuscarTrampas,
  puertasAlAlcance,
} from "../src/engine/selectors";
import { crearRng, entero } from "../src/engine/rng";
import { claveCelda, type Accion, type EstadoPartida } from "../src/engine/types";
import { narrar } from "../src/narrator/local";

const CLASICOS: HeroeElegido[] = [
  { clase: "barbaro" },
  { clase: "enano" },
  { clase: "elfo", elementos: ["agua"] },
  { clase: "mago", elementos: ["fuego", "tierra", "aire"] },
];

/** Un grupo mixto con el hada dentro, que es la única que vuela. */
const CON_HADA: HeroeElegido[] = [
  { clase: "barbaro", genero: "f" },
  { clase: "enano" },
  { clase: "elfo", genero: "f", elementos: ["agua"] },
  { clase: "hada", elementos: ["aire", "fuego"] },
];

const nueva = (semilla = 7, heroes: HeroeElegido[] = CLASICOS) =>
  crearPartida({
    mision: MISION_CALABOZO,
    heroes,
    monstruos: MONSTRUOS_CALABOZO,
    puertas: PUERTAS_CALABOZO,
    muebles: MUEBLES_CALABOZO,
    trampas: TRAMPAS_CALABOZO,
    semilla,
  });

const hacer = (e: EstadoPartida, a: Accion): EstadoPartida => {
  const r = aplicarAccion(e, a);
  if (!r.ok) throw new Error(`${r.motivo} — ${JSON.stringify(a)}`);
  return r.estado;
};

describe("los primeros turnos del calabozo", () => {
  it("los cuatro héroes entran en un pasillo de dos de ancho y no se hacen tapón", () => {
    const e = nueva();
    // Si la entrada fuera un pasillo de una casilla, el primero no podría salir.
    expect(new Set(e.heroes.map((h) => `${h.celda.x},${h.celda.y}`)).size).toBe(4);
    const anchos = new Set(e.mision.entrada.map((c) => c.x));
    expect(anchos.size).toBe(2);
  });

  it("el bárbaro llega a la puerta, la abre y aparece la sala con sus goblins", () => {
    let e = nueva();
    expect(e.heroes[0]!.celda).toEqual({ x: 12, y: 17 });

    e = hacer(e, { tipo: "tirarMovimiento", dados: [3, 3] });
    e = hacer(e, { tipo: "mover", destino: { x: 12, y: 15 } });
    expect(e.turno.movimientoRestante).toBe(4);

    const r = aplicarAccion(e, { tipo: "abrirPuerta", puerta: "ps" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;

    // Abrir es gratis: sigue teniendo su movimiento y su acción.
    expect(r.estado.turno.movimientoRestante).toBe(4);
    expect(r.estado.turno.haActuado).toBe(false);
    expect(r.estado.salasReveladas).toContain("s");

    const anuncio = r.eventos.find((x) => x.tipo === "salaRevelada");
    if (anuncio?.tipo !== "salaRevelada") throw new Error("no se anunció la sala");
    expect(anuncio.monstruos.sort()).toEqual(["goblin1", "goblin2"]);
    expect(narrar(r.estado, anuncio)).toMatch(/huesos/);
  });

  it("hasta que no se abre, la sala no se ve", () => {
    const e = nueva();
    expect(e.salasReveladas).toEqual([]);
    // El goblin existe pero está a oscuras para la interfaz.
    expect(e.monstruos.find((m) => m.id === "goblin1")).toBeTruthy();
  });

  it("el foso del pasillo salta al pisarlo y corta el movimiento", () => {
    let e = nueva();
    // El foso está en (12,14); el bárbaro entra por (12,17).
    e = hacer(e, { tipo: "tirarMovimiento", dados: [6, 6] });
    const r = aplicarAccion(e, { tipo: "mover", destino: { x: 12, y: 13 } });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.estado.heroes[0]!.celda).toEqual({ x: 12, y: 14 }); // se queda en el foso
    expect(r.estado.heroes[0]!.cuerpo).toBe(7);
  });
});

/** Todas las acciones legales ahora mismo, para el juego al azar. */
function accionesPosibles(e: EstadoPartida): Accion[] {
  const salida: Accion[] = [{ tipo: "terminarTurno" }];
  const activa = figuraActiva(e);

  if (esTurnoDeZargon(e) && !activa) {
    for (const m of monstruosPorActivar(e)) salida.push({ tipo: "activarMonstruo", monstruo: m.id });
    return salida;
  }
  if (!activa) return salida;

  if (!esTurnoDeZargon(e) && e.turno.movimientoTotal === null) salida.push({ tipo: "tirarMovimiento" });
  for (const c of casillasDeMovimiento(e)) salida.push({ tipo: "mover", destino: c });
  for (const o of objetivosDeAtaque(e)) salida.push({ tipo: "atacar", objetivo: o.id });
  for (const p of puertasAlAlcance(e)) salida.push({ tipo: "abrirPuerta", puerta: p.id });
  if (puedeBuscarTesoro(e)) salida.push({ tipo: "buscarTesoro" });
  if (puedeBuscarTrampas(e)) salida.push({ tipo: "buscarTrampas" });
  // Los hechizos se enumeran con el mismo selector que pinta los botones: si el
  // selector ofrece algo que el motor rechaza, es un clic perdido en la mesa.
  for (const { hechizo, objetivos } of hechizosLanzables(e))
    for (const o of objetivos) salida.push({ tipo: "lanzarHechizo", hechizo, objetivo: o.id });
  return salida;
}

/** Invariantes que deben cumplirse siempre, pase lo que pase. */
function comprobarInvariantes(e: EstadoPartida, contexto: string) {
  const vivas = [...e.heroes, ...e.monstruos].filter((f) => f.cuerpo > 0);
  const celdas = vivas.map((f) => claveCelda(f.celda));
  expect(new Set(celdas).size, `${contexto}: dos figuras en la misma casilla`).toBe(celdas.length);

  for (const f of [...e.heroes, ...e.monstruos]) {
    expect(f.cuerpo, `${contexto}: cuerpo negativo en ${f.id}`).toBeGreaterThanOrEqual(0);
    expect(f.cuerpo, `${contexto}: cuerpo por encima del máximo en ${f.id}`).toBeLessThanOrEqual(f.cuerpoMax);
  }
  expect(e.turno.movimientoRestante, `${contexto}: movimiento negativo`).toBeGreaterThanOrEqual(0);

  // Nadie puede quedarse encima de un mueble que bloquea ni de un bloque caído.
  const prohibidas = new Set([
    ...e.muebles.filter((m) => m.bloqueaPaso).flatMap((m) => m.celdas),
    ...e.celdasBloqueadas,
  ].map(claveCelda));
  for (const f of vivas)
    expect(prohibidas.has(claveCelda(f.celda)), `${contexto}: ${f.id} en casilla prohibida`).toBe(false);
}

describe("juego al azar", () => {
  // Con el Mac saturado estos dos tests pasan de largo los 5 s por defecto.
  it("aguanta miles de acciones legales sin romper ninguna invariante", { timeout: 60_000 }, () => {
    for (let semilla = 1; semilla <= 12; semilla++) {
      let e = nueva(semilla);
      let rng = crearRng(semilla * 977);
      let pasos = 0;

      while (!e.desenlace && pasos < 700) {
        const posibles = accionesPosibles(e);
        const [i, r2] = entero(rng, posibles.length);
        rng = r2;
        const elegida = posibles[i]!;
        const res = aplicarAccion(e, elegida);
        // Todo lo que enumera `accionesPosibles` tiene que ser legal de verdad.
        expect(res.ok, `semilla ${semilla}: rechazó una acción que ofrecía — ${JSON.stringify(elegida)} → ${res.ok ? "" : res.motivo}`).toBe(true);
        if (!res.ok) break;
        e = res.estado;
        comprobarInvariantes(e, `semilla ${semilla}, paso ${pasos}`);
        pasos++;
      }

      // Y el estado sigue siendo JSON puro, que es lo que permite guardarlo.
      expect(JSON.parse(JSON.stringify(e))).toEqual(e);
    }
  });

  it("con el hada en el grupo tampoco se rompe nada", { timeout: 60_000 }, () => {
    // Volar cambia por dónde se puede pasar, así que merece su propia tanda:
    // el bicho raro del motor es el que encuentra los agujeros.
    for (let semilla = 1; semilla <= 6; semilla++) {
      let e = nueva(semilla * 31, CON_HADA);
      let rng = crearRng(semilla * 613);
      let pasos = 0;

      while (!e.desenlace && pasos < 500) {
        const posibles = accionesPosibles(e);
        const [i, r2] = entero(rng, posibles.length);
        rng = r2;
        const elegida = posibles[i]!;
        const res = aplicarAccion(e, elegida);
        expect(res.ok, `semilla ${semilla}: rechazó una acción que ofrecía — ${JSON.stringify(elegida)} → ${res.ok ? "" : res.motivo}`).toBe(true);
        if (!res.ok) break;
        e = res.estado;
        comprobarInvariantes(e, `hada, semilla ${semilla}, paso ${pasos}`);
        pasos++;
      }
    }
  });

  it("el narrador sabe contar cualquier evento que produzca el motor", () => {
    let e = nueva(3);
    let rng = crearRng(4242);
    let pasos = 0;
    while (!e.desenlace && pasos < 500) {
      const posibles = accionesPosibles(e);
      const [i, r2] = entero(rng, posibles.length);
      rng = r2;
      const res = aplicarAccion(e, posibles[i]!);
      if (!res.ok) break;
      e = res.estado;
      pasos++;
    }
    expect(e.registro.length).toBeGreaterThan(20);
    for (const ev of e.registro) {
      const texto = narrar(e, ev);
      if (texto !== null) {
        expect(texto.length, `frase vacía para ${ev.tipo}`).toBeGreaterThan(3);
        expect(texto, `quedó un hueco sin rellenar en ${ev.tipo}`).not.toMatch(/undefined|NaN|\[object/);
      }
    }
  });
});
