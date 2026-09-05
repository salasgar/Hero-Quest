/**
 * T13 · En el tablero solo se pintan las puertas que alguien ha visto.
 *
 * La regla tiene dos mitades y la segunda es la que se olvida: una puerta vista
 * **no se desve**. En la mesa, la ficha de cartón se pone encima del tablero
 * cuando el grupo la ve y ahí se queda aunque después doblen la esquina. Por eso
 * `puertasVistas` vive en el estado y no se calcula al vuelo.
 */

import { describe, expect, it } from "vitest";
import {
  MISION_CALABOZO,
  MONSTRUOS_CALABOZO,
  MUEBLES_CALABOZO,
  PUERTAS_CALABOZO,
  TRAMPAS_CALABOZO,
} from "../src/data/quests/calabozo";
import { puertasVisibles } from "../src/engine/selectors";
import { c, hacer, partida, situar } from "./ayuda";

const calabozo = () =>
  partida({
    mision: MISION_CALABOZO,
    heroes: [{ clase: "barbaro" }, { clase: "enano" }, { clase: "elfo" }, { clase: "mago" }],
    monstruos: MONSTRUOS_CALABOZO,
    puertas: PUERTAS_CALABOZO,
    muebles: MUEBLES_CALABOZO,
    trampas: TRAMPAS_CALABOZO,
  });

const ids = (ps: readonly { id: string }[]) => ps.map((p) => p.id).sort();

/** Manda a los cuatro héroes a la otra punta, sin pasar por las reglas. */
const todosLejos = (e: ReturnType<typeof calabozo>) =>
  e.heroes.reduce((acc, h, i) => situar(acc, h.id, c(20 + i, 18)), e);

describe("qué puertas se pintan", () => {
  it("al empezar el calabozo se ven tres puertas, y la del fondo del pasillo no", () => {
    const e = calabozo();

    // `pq` está en (0,15), a doce casillas de la entrada y detrás de una esquina.
    // Es la puerta que Juan Luis vio pintada sin que nadie la hubiera visto.
    expect(ids(puertasVisibles(e))).toEqual(["pr", "ps", "pt"]);

    // Ojo al escribir esto: no basta con apagar `pq`. Si el cambio apaga también
    // `ps`, `pt` y `pr`, la partida se ha roto, no se ha arreglado.
    expect(ids(puertasVisibles(e))).not.toContain("pq");
  });

  it("una puerta vista sigue pintada cuando el grupo se aleja", () => {
    let e = calabozo();
    expect(ids(puertasVisibles(e))).toContain("ps");

    // Los cuatro a la otra punta del tablero, y una acción legal para que el
    // motor pase por `terminar()`, que es donde se recalcula.
    e = hacer(todosLejos(e), { tipo: "terminarTurno" });

    expect(ids(puertasVisibles(e))).toContain("ps");
  });

  it("abrir una puerta revela la sala y, en el mismo paso, apunta las puertas de dentro", () => {
    let e = calabozo();
    // `psecreta` une la sala `l` con la `q`; desde el pasillo, con la `q` a
    // oscuras, no la ve nadie.
    expect(e.puertasVistas).not.toContain("psecreta");

    e = hacer(situar(e, "barbaro", c(0, 15)), { tipo: "abrirPuerta", puerta: "pq" });

    expect(e.salasReveladas).toContain("q");
    // Esto es lo que fija el orden dentro de `terminar()`: si las puertas se
    // apuntaran antes de revelar la sala, esta tardaría un turno en aparecer.
    expect(e.puertasVistas).toContain("psecreta");
  });

  it("una secreta vista pero sin descubrir no se pinta; descubierta, sí, y ya no se despinta", () => {
    let e = hacer(situar(calabozo(), "barbaro", c(0, 15)), { tipo: "abrirPuerta", puerta: "pq" });

    // Las dos condiciones son distintas y las dos tienen que cumplirse: está
    // vista, pero mientras sea secreta y no esté descubierta se comporta como
    // muro y no se pinta.
    expect(e.puertasVistas).toContain("psecreta");
    expect(ids(puertasVisibles(e))).not.toContain("psecreta");

    // Sin monstruos delante: desde T3, buscar exige no ver ninguno (reglamento
    // p. 16), y la sala `q` que se acaba de abrir tiene los suyos. Este test va
    // de puertas, no de monstruos, así que se quitan de en medio en vez de
    // buscarle al bárbaro un rincón ciego que mañana deje de serlo.
    e = hacer(situar({ ...e, monstruos: [] }, "barbaro", c(2, 16)), { tipo: "buscarTrampas" });
    expect(e.puertas.find((p) => p.id === "psecreta")!.descubierta).toBe(true);
    expect(ids(puertasVisibles(e))).toContain("psecreta");

    // Descubrirla es un hecho, como haberla visto: se queda pintada aunque el
    // grupo se marche.
    e = hacer(todosLejos(e), { tipo: "terminarTurno" });
    expect(ids(puertasVisibles(e))).toContain("psecreta");
  });

  it("el estado sobrevive a guardarse y volverse a leer", () => {
    // Nada de `Set`: se serializa como {} y la lista se perdería al guardar.
    const e = calabozo();
    const guardada = JSON.parse(JSON.stringify(e));
    expect(guardada.puertasVistas).toEqual(e.puertasVistas);
  });
});
