/**
 * El catálogo de misiones, ordenado por dificultad.
 *
 * Una misión completa es lo que hasta T45 iban siendo cinco constantes sueltas
 * en `calabozo.ts` que cada sitio juntaba a mano —`Juego.tsx`, `cliente.ts`,
 * `simular.ts`, `repetir.ts`—: la misión (texto, entrada, objetivo), sus
 * puertas, sus monstruos, sus trampas y su mobiliario. Aquí van juntas y en
 * una lista, y **la posición en la lista es la dificultad**: la primera es la
 * de empezar, la última la más dura. No hay etiqueta ni número aparte que
 * pueda desordenarse respecto de la lista.
 *
 * ## Cómo se mide la dificultad
 *
 * Con el simulador, que juega partidas enteras con héroes tontos a propósito
 * (T10) y por eso vale para **ordenar**, no como verdad de la mesa:
 *
 *   npm run sim                    # recorre el catálogo entero: una tabla con
 *                                  # misión, nivel, victorias y rondas
 *   npm run sim -- 100 1000 <id>   # el informe largo de una sola misión
 *
 * La medida es el **porcentaje de victorias de los héroes en `normal`, a cien
 * partidas por misión**, y el orden del catálogo tiene que coincidir con ese
 * orden de porcentajes, de más victorias a menos. Si una misión nueva
 * desordena la lista, **se reordena la lista**: no se retocan los pesos de
 * Zargon ni se «arregla» la primera misión, que tiene su 100 % firmado por
 * Juan Luis el 2026-09-06 («las siguientes misiones serán más difíciles porque
 * habrá más monstruos o los monstruos serán más letales o más resistentes»).
 * La tabla que saca `npm run sim` va en la terminada de cada misión nueva.
 *
 * ## Cómo se añade una misión (T46, T47 y las que vengan)
 *
 * Un fichero `quests/<id>.ts` con sus cinco constantes, una entrada más en
 * `MISIONES` en el sitio que le toque por victorias, y nada más: los tests de
 * `tests/quest.test.ts` recorren el catálogo entero y comprueban la estructura
 * de cada misión (entrada en pasillo, puertas sobre muro, monstruos dentro de
 * sala, objetivo que apunta a algo que existe, alcanzabilidad), así que una
 * misión nueva solo tiene que diseñarse.
 *
 * El catálogo es de **solo lectura** de verdad, no solo por el tipo: `crearPartida`
 * copia `op.mision` en vez de mutarla (T35) y aquí se congela cada misión para
 * que un despiste con `push` o una asignación se vea en el primer test y no
 * dos partidas después. Quien necesite variar una misión —el simulador para
 * forzar un temperamento, un test para quitarle los monstruos— pasa por
 * `opcionesDe`, que devuelve copias.
 */

import type { Mision, Mueble, Puerta, Trampa } from "../../engine/types";
import type { OpcionesPartida } from "../../engine/partida";
import {
  MISION_CALABOZO,
  MONSTRUOS_CALABOZO,
  MUEBLES_CALABOZO,
  PUERTAS_CALABOZO,
  TRAMPAS_CALABOZO,
} from "./calabozo";
import {
  MISION_TORREON,
  MONSTRUOS_TORREON,
  MUEBLES_TORREON,
  PUERTAS_TORREON,
  TRAMPAS_TORREON,
} from "./torreon";

/** Un monstruo tal y como lo declara una misión: dónde empieza y qué es. */
export type MonstruoDeMision = OpcionesPartida["monstruos"][number];

export interface MisionCompleta {
  readonly mision: Mision;
  readonly puertas: readonly Puerta[];
  readonly monstruos: readonly MonstruoDeMision[];
  readonly trampas: readonly Trampa[];
  readonly muebles: readonly Mueble[];
  /**
   * Una frase para la mesa, no un número: «para empezar», «con un jefe que
   * pega de verdad». El número ya es la posición en el catálogo.
   */
  readonly dificultad: string;
}

/**
 * Congela la misión y todo lo que cuelga de ella, en profundidad. `Object.freeze`
 * solo congela un nivel, y lo que importa proteger son las casillas y las
 * listas de dentro: `puertas[0].abierta = true` es justo el despiste que se
 * quiere ver en el primer test.
 */
function congelar<T>(valor: T): T {
  if (valor === null || typeof valor !== "object" || Object.isFrozen(valor)) return valor;
  for (const hijo of Object.values(valor as Record<string, unknown>)) congelar(hijo);
  return Object.freeze(valor);
}

const CALABOZO: MisionCompleta = congelar({
  mision: MISION_CALABOZO,
  puertas: PUERTAS_CALABOZO,
  monstruos: MONSTRUOS_CALABOZO,
  trampas: TRAMPAS_CALABOZO,
  muebles: MUEBLES_CALABOZO,
  dificultad: "para empezar: se gana casi siempre, y así tiene que ser",
});

const TORREON: MisionCompleta = congelar({
  mision: MISION_TORREON,
  puertas: PUERTAS_TORREON,
  monstruos: MONSTRUOS_TORREON,
  trampas: TRAMPAS_TORREON,
  muebles: MUEBLES_TORREON,
  dificultad: "con un jefe que pega de verdad: el Señor de la Guerra y su guardia, entre vosotros y el trono",
});

/**
 * Todas las misiones, de la más fácil a la más difícil. El calabozo va el
 * primero y ahí se queda: es la misión de referencia. El torreón (T46) va
 * detrás: su tabla está en la terminada de esa tarea.
 */
export const MISIONES: readonly MisionCompleta[] = Object.freeze([CALABOZO, TORREON]);

/** La que se juega si nadie elige: la primera, que es la de empezar. */
export const MISION_POR_DEFECTO: MisionCompleta = MISIONES[0]!;

/**
 * La misión con ese identificador, o `undefined` si esta versión no la conoce.
 * Devuelve `undefined` y no revienta porque el identificador puede venir de
 * fuera: del montaje de una partida en red creada con una versión más nueva,
 * o de un fichero de partida descargado hace meses.
 */
export const misionPorId = (id: string): MisionCompleta | undefined =>
  MISIONES.find((m) => m.mision.id === id);

/**
 * Nivel de una misión, empezando en 1: su posición en el catálogo. Es lo que
 * se enseña en el selector y en la tabla del simulador.
 */
export const nivelDe = (m: MisionCompleta): number => MISIONES.indexOf(m) + 1;

/**
 * Lo que `crearPartida` necesita de una misión, en copias que se pueden tocar.
 *
 * Copias superficiales de las listas: bastan para que quien quiera forzar un
 * temperamento a todos los monstruos o quitar las puertas haga `map` o
 * `filter` sobre el resultado sin tocar el catálogo, y las casillas y los
 * objetos de dentro siguen congelados, que es lo que se quiere.
 */
export function opcionesDe(m: MisionCompleta): Omit<OpcionesPartida, "heroes" | "semilla"> {
  return {
    mision: m.mision,
    puertas: [...m.puertas],
    monstruos: [...m.monstruos],
    trampas: [...m.trampas],
    muebles: [...m.muebles],
  };
}
