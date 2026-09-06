/**
 * T11 · El turno de Zargon, sin un solo clic.
 *
 * Los componentes de React no se prueban aquí (`vite.config.ts` monta el entorno
 * `node`), así que se prueba lo que sostiene la pantalla: **el bucle que la
 * pantalla ejecuta**, que es una acción cada vez, y las dos cosas que ese bucle
 * podría romper sin que se note hasta mitad de una partida con niños delante.
 *
 * La primera es el deshacer. La partida se rehace repitiendo la lista de
 * acciones desde el principio (`usePartida`), así que **el turno de Zargon solo
 * se puede deshacer si sus acciones entraron por la misma puerta que las de los
 * héroes**. Si la IA despachara por su cuenta —llamando a `aplicarAccion`, o
 * construyendo un estado a mano—, no habría ningún error: simplemente el
 * deshacer dejaría de salir igual, y eso se descubre tarde y sin pista.
 *
 * La segunda es el reparto de los dados, que T11 no cambia: los de los monstruos
 * los tira la aplicación y los de los héroes se tiran de verdad en la mesa. Se
 * comprueba en la forma de la acción, que es donde vive esa decisión.
 *
 * Lo que **no** se prueba aquí: a quién ataca cada monstruo y por dónde va, que
 * es `zargon.test.ts` y `personalidades.test.ts`, y que nada de lo que propone
 * sea ilegal, que ya es una invariante de los dos.
 */

import { describe, expect, it } from "vitest";
import { accionDeZargon, type Dificultad } from "../src/ai/difficulty";
import { MISION_CALABOZO, MONSTRUOS_CALABOZO, PUERTAS_CALABOZO } from "../src/data/quests/calabozo";
import { aplicarAccion, repetir } from "../src/engine/reducer";
import { esTurnoDeZargon } from "../src/engine/selectors";
import type { Accion, EstadoPartida } from "../src/engine/types";
import {
  PAUSA_AL_EMPEZAR,
  PAUSA_POR_DEFECTO,
  PAUSA_TRAS,
  TOPE_DE_ACCIONES,
  pausaTras,
} from "../src/ui/useTurnoDeZargon";
import { c, enTablero, hacer, partida, situar } from "./ayuda";

/**
 * El bucle de la pantalla, tal cual: preguntar la jugada, despacharla, volver a
 * preguntar sobre el estado nuevo. Lo único que se deja fuera son los
 * temporizadores, que es lo que no cabe en un test de `node`.
 *
 * Deliberadamente **no** usa `jugarTurnoDeZargon`: esa resuelve el turno entero
 * de una vez y es la que T11 no puede usar. Si algún día las dos dejaran de dar
 * lo mismo, lo que manda en la mesa es esta.
 */
function comoEnLaPantalla(
  inicial: EstadoPartida,
  nivel: Dificultad = "normal",
): { acciones: Accion[]; estado: EstadoPartida } {
  const acciones: Accion[] = [];
  let estado = inicial;

  for (let i = 0; i < TOPE_DE_ACCIONES; i++) {
    if (!esTurnoDeZargon(estado)) break;
    const accion = accionDeZargon(estado, nivel);
    if (!accion) break;
    const r = aplicarAccion(estado, accion);
    if (!r.ok) throw new Error(`el motor rechazó una jugada de Zargon: ${r.motivo}`);
    acciones.push(accion);
    estado = r.estado;
  }

  return { acciones, estado };
}

/**
 * El bárbaro con un goblin pegado y un orco al fondo de la sala `a`, y el turno
 * ya en manos de Zargon. Los dos monstruos descubiertos: desde T18 no se puede
 * activar lo que los héroes no han encontrado.
 */
const escena = (): EstadoPartida => {
  let e = partida({
    monstruos: [
      { id: "goblin1", especie: "goblin", celda: c(2, 2) },
      { id: "orco1", especie: "orco", celda: c(4, 3) },
    ],
  });
  e = { ...e, salasReveladas: ["a"] };
  e = enTablero(situar(e, "barbaro", c(2, 1)));
  return hacer(e, { tipo: "terminarTurno" });
};

describe("el turno se juega solo, y una acción cada vez", () => {
  it("desde que le toca a Zargon hasta que vuelve a los héroes, sin decidir nada", () => {
    const inicial = escena();
    expect(esTurnoDeZargon(inicial)).toBe(true);

    const { acciones, estado } = comoEnLaPantalla(inicial);

    expect(acciones.length).toBeGreaterThan(0);
    expect(esTurnoDeZargon(estado)).toBe(false);
  });

  it("empieza activando a alguien y acaba cerrando el turno", () => {
    const { acciones } = comoEnLaPantalla(escena());
    expect(acciones[0]!.tipo).toBe("activarMonstruo");
    expect(acciones[acciones.length - 1]!.tipo).toBe("terminarTurno");
  });

  it("la jugada se puede anunciar antes de hacerla: preguntarla no cambia nada", () => {
    // Es lo que permite que la pantalla diga «le toca al orco» **antes** de que
    // el orco se mueva. Si preguntar tuviera efectos, el anuncio y la jugada
    // podrían no coincidir.
    const e = escena();
    const antes = JSON.stringify(e);
    expect(accionDeZargon(e, "normal")).toEqual(accionDeZargon(e, "normal"));
    expect(JSON.stringify(e)).toBe(antes);
  });

  it("sin ningún monstruo descubierto, el turno pasa igual y no se queda parado", () => {
    // Es el turno 1 de casi todas las misiones: los héroes siguen en el pasillo
    // y Zargon no tiene a nadie sobre el tablero.
    const e = hacer(partida({ monstruos: [] }), { tipo: "terminarTurno" });
    const { acciones, estado } = comoEnLaPantalla(e);
    expect(acciones).toEqual([{ tipo: "terminarTurno" }]);
    expect(esTurnoDeZargon(estado)).toBe(false);
  });

  it("sobre la misión de verdad tampoco se atasca", () => {
    let e = partida({
      mision: MISION_CALABOZO,
      heroes: [{ clase: "barbaro" }, { clase: "mago", elementos: ["fuego"] }],
      monstruos: MONSTRUOS_CALABOZO,
      puertas: PUERTAS_CALABOZO,
    });
    e = enTablero(hacer(hacer(e, { tipo: "terminarTurno" }), { tipo: "terminarTurno" }));
    const { acciones } = comoEnLaPantalla(e);
    expect(acciones.length).toBeLessThan(TOPE_DE_ACCIONES);
  });
});

describe("el deshacer sigue siendo exacto durante el turno de Zargon", () => {
  it("repetir las acciones de Zargon da el mismo estado, hasta el generador", () => {
    // Esto es lo que de verdad se está comprobando: que las acciones de la IA
    // son acciones normales y corrientes, en la misma lista, y que rehacerlas
    // sale igual. Con el generador dentro del estado, «igual» es literal.
    const inicial = escena();
    const { acciones, estado } = comoEnLaPantalla(inicial);
    expect(repetir(inicial, acciones)).toEqual(estado);
  });

  it("deshacer la última jugada de Zargon devuelve el estado de justo antes", () => {
    const inicial = escena();
    const { acciones } = comoEnLaPantalla(inicial);
    expect(acciones.length).toBeGreaterThan(1);

    const menos = acciones.slice(0, -1);
    // El camino de `usePartida.deshacer`: la lista con una acción menos, rehecha
    // desde el principio.
    const alDeshacer = repetir(inicial, menos);
    // Y el camino largo: aplicarlas una a una y parar antes de la última.
    let aMano = inicial;
    for (const a of menos) aMano = hacer(aMano, a);

    expect(alDeshacer).toEqual(aMano);
  });

  it("el turno es reproducible: dos veces la misma escena, las mismas acciones", () => {
    // Sin esto, deshacer un ataque de Zargon y dejarle jugar otra vez daría otra
    // partida. Sale gratis porque el azar vive en el estado, y se comprueba
    // porque es fácil de perder: bastaría un `Math.random()` en la pantalla.
    expect(comoEnLaPantalla(escena()).acciones).toEqual(comoEnLaPantalla(escena()).acciones);
  });
});

describe("el reparto de los dados no cambia", () => {
  it("Zargon ataca sin decir los dados: los tira el motor y la mesa mete su defensa", () => {
    // La acción sale pelada, sin `dadosAtaque` ni `dadosDefensa`. Es lo que hace
    // que la pantalla la mande por `pedirAtaque` —el mismo camino que si la
    // hubiera pulsado el adulto— y allí se le pidan al héroe sus dados de
    // defensa, que son los que se tiran de verdad encima de la mesa.
    const { acciones } = comoEnLaPantalla(escena());
    const ataques = acciones.filter((a) => a.tipo === "atacar");
    expect(ataques.length).toBeGreaterThan(0);
    for (const a of ataques) {
      expect(Object.keys(a).sort()).toEqual(["objetivo", "tipo"]);
    }
  });
});

describe("el ritmo de la mesa", () => {
  it("ninguna espera es cero: el turno no se resuelve de golpe", () => {
    // La espera de cero es exactamente el fallo que la tarea venía a evitar: las
    // seis activaciones en un suspiro y nadie sabiendo qué ha pasado.
    const esperas = [
      pausaTras(null),
      ...Object.keys(PAUSA_TRAS).map((tipo) => pausaTras({ tipo } as Accion)),
    ];
    for (const ms of esperas) expect(ms).toBeGreaterThan(0);
  });

  it("moverse espera más que cualquier otra cosa: hay una miniatura que empujar", () => {
    const mover = pausaTras({ tipo: "mover", destino: c(2, 2) });
    expect(mover).toBeGreaterThan(pausaTras({ tipo: "activarMonstruo", monstruo: "goblin1" }));
    expect(mover).toBeGreaterThan(pausaTras({ tipo: "terminarTurno" }));
    expect(mover).toBeGreaterThan(pausaTras({ tipo: "atacar", objetivo: "barbaro" }));
  });

  it("cerrar una activación espera más que abrirla: detrás viene el anuncio del siguiente", () => {
    // Es el número que es fácil poner al revés, porque `terminarTurno` parece un
    // trámite. Lo que aparece justo después es «le toca al orco: ya te tiene a
    // tiro», y si esa frase no da tiempo a leerse, el turno de Zargon vuelve a
    // ser una ráfaga que hay que reconstruir leyendo el diario hacia atrás.
    expect(pausaTras({ tipo: "terminarTurno" })).toBeGreaterThan(
      pausaTras({ tipo: "activarMonstruo", monstruo: "goblin1" }),
    );
    // Y empezar el turno es el mismo caso: lo que hay en pantalla es un anuncio.
    expect(pausaTras(null)).toBeGreaterThanOrEqual(pausaTras({ tipo: "terminarTurno" }));
  });

  it("una acción sin espera propia usa la de por defecto, y empezar tiene la suya", () => {
    expect(pausaTras({ tipo: "buscarTesoro" })).toBe(PAUSA_POR_DEFECTO);
    expect(pausaTras(null)).toBe(PAUSA_AL_EMPEZAR);
  });
});
