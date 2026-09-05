/**
 * El orden en que Zargon mueve a sus monstruos.
 *
 * La pantalla no se prueba —`vite.config.ts` monta el entorno `node`—, así que
 * lo que se prueba es la función pura, que es donde está la decisión.
 *
 * **Los identificadores de estos tests están elegidos, no puestos al azar.**
 * `ordenDeActivacion` desempata por identificador cuando los tres criterios
 * empatan, así que un test cuyo orden esperado coincida con el alfabético pasa
 * igual aunque la heurística no haga nada: la primera versión de este fichero
 * usaba `orco1`/`orco2` y los siete pasaban con los criterios desconectados. En
 * cada caso el que debe ir primero es el **último** por orden alfabético, y
 * además va el **segundo** en la lista de la misión, para que ni el desempate
 * ni el orden de entrada puedan dar un falso verde.
 */

import { describe, expect, it } from "vitest";
import { ordenDeActivacion, proximoEnActuar, tieneATiro } from "../src/ai/orden";
import type { EstadoPartida } from "../src/engine/types";
import { c, enTablero, hacer, partida, situar } from "./ayuda";

/**
 * Sin esto no es el turno de Zargon y no hay ningún monstruo por activar.
 *
 * `enTablero` es la parte que añadió T18: desde entonces Zargon solo ordena a
 * los monstruos que los héroes han descubierto. Estos tests montan el estado a
 * mano, sin pasar por el motor, así que hay que declararlo aquí; lo que prueban
 * es el orden, no el descubrimiento.
 */
const turnoDeZargon = (e: EstadoPartida): EstadoPartida =>
  enTablero({
    ...e,
    turno: { ...e.turno, indice: e.turno.orden.indexOf("zargon") },
    salasReveladas: ["a"],
  });

const ids = (e: EstadoPartida) => ordenDeActivacion(e).map((m) => m.id);

describe("en qué orden mueve Zargon a sus monstruos", () => {
  it("va primero el que ya puede atacar sin moverse", () => {
    // Los dos están a una casilla del bárbaro, así que la distancia empata y
    // decide el primer criterio: `sala` está dentro de la sala y le llega;
    // `pasillo` está fuera, con la pared de por medio, y no puede.
    let e = turnoDeZargon(
      partida({
        monstruos: [
          { id: "pasillo", especie: "orco", celda: c(0, 1) },
          { id: "sala", especie: "orco", celda: c(1, 2) },
        ],
      }),
    );
    e = situar(e, "barbaro", c(1, 1));

    const porId = (id: string) => e.monstruos.find((m) => m.id === id)!;
    expect(tieneATiro(e, porId("sala"))).toBe(true);
    expect(tieneATiro(e, porId("pasillo"))).toBe(false);
    expect(ids(e)).toEqual(["sala", "pasillo"]);
    expect(proximoEnActuar(e)?.id).toBe("sala");
  });

  it("a igualdad de tiro, va antes el que está más cerca", () => {
    let e = turnoDeZargon(
      partida({
        monstruos: [
          { id: "alejado", especie: "orco", celda: c(4, 4) },
          { id: "pegado", especie: "orco", celda: c(3, 1) },
        ],
      }),
    );
    e = situar(e, "barbaro", c(1, 1));
    expect(ids(e)).toEqual(["pegado", "alejado"]);
  });

  it("y a igualdad de distancia, delante el que más aguanta", () => {
    // Los dos a tres casillas del bárbaro y ninguno a tiro: decide el cuerpo.
    // Ojo con elegir la pareja: **orco, goblin, esqueleto y zombi tienen todos
    // cuerpo 1**, así que entre ellos este criterio no rompe nada y el orden lo
    // acaba dando el desempate. Hace falta un guerrero del Caos, que tiene 3.
    let e = turnoDeZargon(
      partida({
        monstruos: [
          { id: "blando", especie: "goblin", celda: c(4, 1) },
          { id: "duro", especie: "guerreroDelCaos", celda: c(1, 4) },
        ],
      }),
    );
    e = situar(e, "barbaro", c(1, 1));
    expect(ids(e)).toEqual(["duro", "blando"]);
  });

  it("es determinista: dos llamadas con el mismo estado dan el mismo orden", () => {
    // Si esto falla, deshacer deja de ser exacto: la interfaz rehace la partida
    // desde el principio y el orden tiene que salir igual las dos veces.
    let e = turnoDeZargon(
      partida({
        monstruos: [
          { id: "uno", especie: "orco", celda: c(3, 3) },
          { id: "dos", especie: "orco", celda: c(4, 3) },
          { id: "tres", especie: "goblin", celda: c(3, 4) },
        ],
      }),
    );
    e = situar(e, "barbaro", c(1, 1));
    expect(ids(e)).toEqual(ids(e));
  });

  it("sin monstruos devuelve la lista vacía, sin reventar", () => {
    const e = turnoDeZargon(partida({ monstruos: [] }));
    expect(ordenDeActivacion(e)).toEqual([]);
    expect(proximoEnActuar(e)).toBeNull();
  });

  it("no salen ni los dormidos, ni los que pierden turno, ni los caídos", () => {
    const base = turnoDeZargon(
      partida({
        monstruos: [
          { id: "despierto", especie: "orco", celda: c(3, 3) },
          { id: "dormido", especie: "orco", celda: c(3, 4) },
          { id: "castigado", especie: "orco", celda: c(4, 3) },
          { id: "muerto", especie: "orco", celda: c(4, 4) },
        ],
      }),
    );
    const e: EstadoPartida = {
      ...base,
      monstruos: base.monstruos.map((m) =>
        m.id === "dormido"
          ? { ...m, dormido: true }
          : m.id === "castigado"
            ? { ...m, pierdeTurno: true }
            : m.id === "muerto"
              ? { ...m, cuerpo: 0 }
              : m,
      ),
    };
    expect(ids(e)).toEqual(["despierto"]);
  });

  it("al terminar la activación del primero, el orden devuelve los que faltan", () => {
    let e = turnoDeZargon(
      partida({
        monstruos: [
          { id: "lejano", especie: "orco", celda: c(4, 4) },
          { id: "pegado", especie: "orco", celda: c(1, 2) },
        ],
      }),
    );
    e = situar(e, "barbaro", c(1, 1));
    expect(ids(e)).toEqual(["pegado", "lejano"]);

    const primero = proximoEnActuar(e)!.id;
    const despues = hacer(
      hacer(e, { tipo: "activarMonstruo", monstruo: primero }),
      { tipo: "terminarTurno" },
    );
    expect(ids(despues)).toEqual(["lejano"]);
  });
});
