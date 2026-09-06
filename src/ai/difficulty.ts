/**
 * Las tres dificultades: cómo de bien decide Zargon.
 *
 * La regla que no se rompe, y es la primera de la tarea: **la dificultad cambia
 * cómo decide, nunca los números del juego.** Nada de aquí toca dados, puntos de
 * cuerpo ni reglas: torcer la decisión es legal, regalar tiradas es hacer
 * trampas, y si un niño descubre que el juego le regala tiradas, se acabó el
 * juego.
 *
 * `torpe` no es la IA buena con ruido aleatorio —eso se nota raro: a veces
 * brillante, a veces absurdo—. Es **miope de verdad**, por dos vías:
 *
 * 1. Si ya puede pegar a alguien desde donde está, pega y no se recoloca:
 *    «solo mira a quien tiene delante». Los repliegues listos son de `astuto`.
 * 2. Sus pesos apagan el remate, la caza de lanzadores y el cebarse con los
 *    heridos, y la distancia pesa mucho: cuando no llega a nadie, avanza hacia
 *    el que tiene más cerca, no hacia el que más conviene.
 *
 * `normal` es la hipótesis de T8 tal cual. `astuto` afila lo que ya había:
 * remata más, caza al que guarda hechizos y la distancia le desanima menos.
 * El objetivo del plan —en `torpe` ganan los héroes ~80 %, en `astuto` ~40 %—
 * lo mide T10; ninguna cifra de aquí está medida todavía.
 */

import { aplicarAccion } from "../engine/reducer";
import { esTurnoDeZargon, figuraActiva, objetivosDeAtaque } from "../engine/selectors";
import { esHeroe, type Accion, type EstadoPartida } from "../engine/types";
import type { EspecieMonstruo } from "../data/monsters";
import { conPersonalidad } from "./personalities";
import { objetivosPuntuados, PESOS, type Pesos } from "./targeting";
import { siguienteAccionDeZargon } from "./zargon";

export type Dificultad = "torpe" | "normal" | "astuto";

export const DIFICULTADES: readonly Dificultad[] = ["torpe", "normal", "astuto"];

/**
 * Los pesos de cada nivel, antes de la personalidad.
 *
 * En `torpe`, remate, heridos y hechizos van a cero: no es que valgan poco, es
 * que un Zargon torpe **no se fija en eso**. La consecuencia querida es que en
 * torpe las personalidades tácticas también se apagan —multiplicar cero da
 * cero— y todos los monstruos juegan igual de simple: un torpe uniforme es más
 * creíble que un torpe con destellos.
 */
export const PESOS_POR_NIVEL: Readonly<Record<Dificultad, Pesos>> = {
  torpe: {
    danoEsperado: 3,
    remate: 0,
    heridoPrimero: 0,
    lanzaHechizos: 0,
    porCasillaDeDistancia: 6,
    // Igual que en base: bajarlo resucitaría el monstruo que se va andando y no
    // ataca a nadie, que en la mesa se lee como un despiste, no como torpeza.
    descuentoPorNoLlegar: 15,
  },
  normal: PESOS,
  astuto: {
    danoEsperado: 10,
    remate: 40,
    heridoPrimero: 4,
    lanzaHechizos: 3,
    porCasillaDeDistancia: 0.5,
    descuentoPorNoLlegar: 15,
  },
};

/** Los pesos con los que juega esta especie a este nivel. */
export function pesosPara(especie: EspecieMonstruo, nivel: Dificultad): Pesos {
  return conPersonalidad(PESOS_POR_NIVEL[nivel], especie);
}

/**
 * La mitad estructural de `torpe`: si desde aquí ya se pega a alguien, se pega.
 *
 * Es el mismo cálculo que hace `zargon.ts` para su criterio de «no regales el
 * ataque servido», pero aquí no es un empate a resolver sino un tope: el torpe
 * ni siquiera considera moverse. Se apoya en `objetivosDeAtaque` —el selector de
 * la pantalla— y se valida con el motor, como todo lo que propone la IA.
 */
function golpeSinMoverse(e: EstadoPartida, pesos: Pesos): Accion | null {
  const monstruo = figuraActiva(e);
  if (!monstruo || esHeroe(monstruo)) return null;
  const alcance = new Set(objetivosDeAtaque(e).map((f) => f.id));
  if (alcance.size === 0) return null;
  const mejor = objetivosPuntuados(e, monstruo, pesos).find((p) => alcance.has(p.objetivo.id));
  if (!mejor) return null;
  const accion: Accion = { tipo: "atacar", objetivo: mejor.objetivo.id };
  return aplicarAccion(e, accion).ok ? accion : null;
}

/**
 * La siguiente acción de Zargon jugando a un nivel. Es `siguienteAccionDeZargon`
 * de T8 con los pesos resueltos por especie y nivel; el punto de entrada que T11
 * debe usar cuando exista un selector de dificultad, llamándola en bucle igual
 * que a la de T8.
 */
export function accionDeZargon(e: EstadoPartida, nivel: Dificultad = "normal"): Accion | null {
  if (!esTurnoDeZargon(e)) return null;
  const activo = figuraActiva(e);
  if (activo && !esHeroe(activo)) {
    const pesos = pesosPara(activo.especie, nivel);
    if (nivel === "torpe") {
      const golpe = golpeSinMoverse(e, pesos);
      if (golpe) return golpe;
    }
    return siguienteAccionDeZargon(e, pesos);
  }
  // Sin monstruo activo la jugada es activar al que toca o cerrar el turno, y
  // eso no depende de pesos: el orden de activación es de T17 y es igual en los
  // tres niveles, a propósito. Cambiarlo por nivel sería una segunda IA de
  // orden que nadie ha pedido.
  return siguienteAccionDeZargon(e, PESOS_POR_NIVEL[nivel]);
}

/**
 * El turno de Zargon entero a un nivel. Es el `turnoDeZargon` de T8, pero
 * resolviendo los pesos **en cada acción**: dentro de un mismo turno actúan
 * especies distintas y cada una juega con su personalidad. La usarán los tests
 * y T10; en la mesa se va acción a acción, como manda T11.
 *
 * `tope` es la misma red de seguridad que en T8: si salta, hay un fallo.
 */
export function jugarTurnoDeZargon(
  inicial: EstadoPartida,
  nivel: Dificultad = "normal",
  tope = 200,
): { acciones: Accion[]; estado: EstadoPartida } {
  const acciones: Accion[] = [];
  let estado = inicial;

  for (let i = 0; i < tope; i++) {
    if (!esTurnoDeZargon(estado)) break;
    const accion = accionDeZargon(estado, nivel);
    if (!accion) break;
    const r = aplicarAccion(estado, accion);
    // Si el motor rechaza algo que se acaba de proponer, el fallo es de la IA:
    // se para en vez de insistir, que es lo que convertiría un fallo en un
    // cuelgue.
    if (!r.ok) break;
    acciones.push(accion);
    estado = r.estado;
  }

  return { acciones, estado };
}
