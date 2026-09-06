import { describe, it, expect } from "vitest";
import { aplicarAccion, repetir } from "../src/engine/reducer";
import { narrarTodos } from "../src/narrator/local";
import type { Accion, EstadoPartida } from "../src/engine/types";
import {
  construir,
  nombreDeFichero,
  type AccionRechazada,
  type PartidaGuardada,
} from "../src/ui/registroDePartida";
import { c, MISION_PRUEBA, partida } from "./ayuda";

const GRUPO = [{ clase: "barbaro" as const }];
const SEMILLA = 7;

/**
 * Una partida corta con semilla fija, jugada como la juega la pantalla: por
 * `aplicarAccion`, quedándose las que entran y anotando las que no. Es lo mismo
 * que hace `usePartida`, y se repite aquí en vez de montar React porque lo que
 * se prueba es el fichero, no el gancho.
 */
function jugar(intentos: readonly Accion[]): {
  estado: EstadoPartida;
  acciones: Accion[];
  rechazadas: AccionRechazada[];
} {
  let estado = partida({ heroes: GRUPO, semilla: SEMILLA });
  const acciones: Accion[] = [];
  const rechazadas: AccionRechazada[] = [];

  for (const a of intentos) {
    const r = aplicarAccion(estado, a);
    if (r.ok) {
      estado = r.estado;
      acciones.push(a);
    } else {
      rechazadas.push({ tras: acciones.length, accion: a, motivo: r.motivo });
    }
  }
  return { estado, acciones, rechazadas };
}

/** Cinco acciones legales: un turno entero del héroe, el de Zargon, y otra tirada. */
const CINCO: Accion[] = [
  { tipo: "tirarMovimiento" },
  { tipo: "mover", destino: c(0, 2) },
  { tipo: "terminarTurno" },
  { tipo: "terminarTurno" },
  { tipo: "tirarMovimiento" },
];

const huellaDe = (e: EstadoPartida) => ({
  eventos: e.registro.length,
  rondas: e.registro.filter((ev) => ev.tipo === "cambioDeTurno" && ev.actor === "zargon").length,
  heroesVivos: e.heroes.filter((h) => h.cuerpo > 0).length,
  monstruosVivos: e.monstruos.filter((m) => m.cuerpo > 0).length,
});

const fichero = (extra: readonly Accion[] = []): PartidaGuardada => {
  const jugada = jugar([...CINCO, ...extra]);
  return construir({
    estado: jugada.estado,
    mision: MISION_PRUEBA.id,
    semilla: SEMILLA,
    heroes: GRUPO,
    acciones: jugada.acciones,
    rechazadas: jugada.rechazadas,
    ahora: new Date("2026-09-06T18:30:12.345Z"),
    commit: "dev",
  });
};

describe("el registro descargable de una partida", () => {
  it("las cinco acciones de la partida de prueba son legales", () => {
    // Si esto falla, los demás casos están midiendo otra cosa: una partida con
    // rechazos que nadie quería.
    expect(jugar(CINCO).acciones).toHaveLength(5);
  });

  it("repetir la lista de acciones da el mismo diario y la misma huella", () => {
    const p = fichero();

    // Lo mismo que hace `scripts/repetir.ts`: la partida se rehace desde la
    // semilla y el grupo, sin más datos que los del propio fichero.
    const rehecha = repetir(partida({ heroes: p.heroes, semilla: p.semilla }), p.acciones);

    expect(narrarTodos(rehecha, rehecha.registro)).toEqual(p.diario);
    expect(p.diario.length).toBeGreaterThan(0);
    expect(huellaDe(rehecha)).toEqual(p.huella);
  });

  it("una acción rechazada queda con su motivo, y no entre las acciones", () => {
    // Atacar a quien no existe: el motor la rechaza y no cambia nada, así que
    // sin este registro no quedaría ni rastro de que se intentó.
    const imposible: Accion = { tipo: "atacar", objetivo: "nadie" };
    const p = fichero([imposible]);

    expect(p.rechazadas).toHaveLength(1);
    expect(p.rechazadas[0]!.accion).toEqual(imposible);
    expect(p.rechazadas[0]!.motivo).toBeTruthy();
    // Se intentó con las cinco ya aceptadas: es lo que la sitúa en su sitio al
    // repetir la partida, porque ella no entra en la lista.
    expect(p.rechazadas[0]!.tras).toBe(5);
    expect(p.acciones).toHaveLength(5);
    expect(p.acciones).not.toContainEqual(imposible);
  });

  it("el fichero sobrevive a JSON.parse(JSON.stringify(...)) sin perder nada", () => {
    const p = fichero([{ tipo: "atacar", objetivo: "nadie" }]);
    expect(JSON.parse(JSON.stringify(p))).toEqual(p);
  });

  it("el nombre del fichero no lleva nada que Safari cambie por guiones bajos", () => {
    const nombre = nombreDeFichero(fichero());

    expect(nombre).toBe("heroquest-prueba-2026-09-06-1830.json");
    // Letras, dígitos, guiones y el punto de la extensión: nada más. Los dos
    // puntos de la hora ISO son la trampa que esto vigila.
    expect(nombre).toMatch(/^[a-z0-9-]+\.json$/);
  });

  it("guarda la semilla que de verdad se usó", () => {
    // `crearPartida` toma 1 cuando no le dan ninguna. Si el fichero anotara «sin
    // semilla», repetirlo daría otra partida y nadie sabría por qué.
    const p = fichero();
    expect(p.semilla).toBe(SEMILLA);
    expect(p.formato).toBe(1);
    expect(p.commit).toBe("dev");
  });
});
