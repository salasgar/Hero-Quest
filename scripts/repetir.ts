/**
 * Repite una partida descargada e imprime, paso a paso, lo que la mesa vio.
 *
 *   npm run repetir partidas/heroquest-calabozo-2026-09-06-1830.json
 *
 * El fichero que baja el botón «Descargar partida» lleva **lo que no se puede
 * deducir**: la semilla, el grupo, la lista de acciones y las que el motor
 * rechazó. Todo lo demás se recalcula aquí, porque el motor es determinista y
 * el generador aleatorio vive dentro del estado: se rehace la partida acción a
 * acción y en cada paso se preguntan los mismos selectores que pinta la
 * pantalla. Las «casillas verdes» que pedía Juan Luis salen así, y salen sin
 * haberlas guardado.
 *
 * Si la huella final no cuadra, el código de este Mac no es el que corría en la
 * página. El fichero dice desde qué commit se publicó; para repetirla con ese
 * código:
 *
 *   git worktree add /tmp/repro <commit>
 */

import { readFileSync } from "node:fs";
import {
  MISION_CALABOZO,
  MONSTRUOS_CALABOZO,
  MUEBLES_CALABOZO,
  PUERTAS_CALABOZO,
  TRAMPAS_CALABOZO,
} from "../src/data/quests/calabozo";
import { crearPartida, type OpcionesPartida } from "../src/engine/partida";
import { actorActual, aplicarAccion, figuraActiva } from "../src/engine/reducer";
import {
  casillasDeMovimiento,
  objetivosDeAtaque,
  puertasAlAlcance,
  puertasVisibles,
} from "../src/engine/selectors";
import { narrarTodos, nombreDe } from "../src/narrator/local";
import { claveCelda, type Accion, type EstadoPartida } from "../src/engine/types";
import { FORMATO, type AccionRechazada, type PartidaGuardada } from "../src/ui/registroDePartida";

/**
 * Las misiones que este guion sabe montar.
 *
 * Se cogen igual que hace `Juego.tsx`, que hoy también las tiene escritas a
 * mano. Cuando T45 traiga el catálogo, esto pasa a ser una consulta por
 * identificador y esta tabla desaparece; hasta entonces, un identificador
 * desconocido se dice con sus palabras en vez de reventar con un `undefined`.
 */
const MISIONES: Record<string, Omit<OpcionesPartida, "heroes" | "semilla">> = {
  [MISION_CALABOZO.id]: {
    mision: MISION_CALABOZO,
    monstruos: MONSTRUOS_CALABOZO,
    puertas: PUERTAS_CALABOZO,
    muebles: MUEBLES_CALABOZO,
    trampas: TRAMPAS_CALABOZO,
  },
};

const celdas = (cs: readonly { x: number; y: number }[]): string =>
  cs.length === 0 ? "—" : cs.map(claveCelda).join(" ");

/** Cómo se lee una acción de una línea, sin volcar su JSON entero. */
function comoSeLee(e: EstadoPartida, a: Accion): string {
  switch (a.tipo) {
    case "mover":
      return `mover a ${claveCelda(a.destino)}`;
    case "abrirPuerta":
      return `abrir la puerta ${a.puerta}`;
    case "atacar":
      return `atacar a ${nombreDe(e, a.objetivo)}`;
    case "activarMonstruo":
      return `activar a ${nombreDe(e, a.monstruo)}`;
    case "lanzarHechizo":
      return `lanzar ${a.hechizo}${a.objetivo ? ` sobre ${nombreDe(e, a.objetivo)}` : ""}`;
    case "desarmarTrampa":
      return `desarmar la trampa ${a.trampa}`;
    default:
      return a.tipo;
  }
}

/**
 * Lo que la pantalla habría enseñado en este punto.
 *
 * Son los mismos selectores que consumen `BoardMirror` y `TurnPanel`; no hay
 * ninguna cuenta propia aquí, y es a propósito: un cálculo paralelo acabaría
 * discrepando de la pantalla justo el día que haga falta creerle.
 */
function loQueSeVeia(e: EstadoPartida): string[] {
  const activa = figuraActiva(e);
  const quien = activa ? nombreDe(e, activa.id) : "nadie (Zargon sin monstruo activo)";
  const objetivos = objetivosDeAtaque(e).map((f) => nombreDe(e, f.id));
  const enTablero = e.monstruosEnTablero.map((id) => nombreDe(e, id));

  return [
    `      turno de: ${actorActual(e)} · actúa: ${quien}`,
    `      movimiento: ${e.turno.movimientoTotal === null ? "sin tirar" : `${e.turno.movimientoRestante} de ${e.turno.movimientoTotal}`}${e.turno.movimientoCerrado ? " (cerrado)" : ""}`,
    `      casillas verdes: ${celdas(casillasDeMovimiento(e))}`,
    `      a tiro: ${objetivos.length === 0 ? "—" : objetivos.join(", ")}`,
    `      puertas al alcance: ${puertasAlAlcance(e).map((p) => p.id).join(" ") || "—"}`,
    `      puertas pintadas: ${puertasVisibles(e).map((p) => p.id).join(" ") || "—"}`,
    `      monstruos en el tablero: ${enTablero.length === 0 ? "—" : enTablero.join(", ")}`,
  ];
}

/** Las rechazadas que se intentaron tras `n` acciones aceptadas. */
const rechazadasTras = (p: PartidaGuardada, n: number): AccionRechazada[] =>
  p.rechazadas.filter((r) => r.tras === n);

function imprimirRechazadas(e: EstadoPartida, rs: readonly AccionRechazada[]): void {
  for (const r of rs) {
    console.log(`      ✗ intentó ${comoSeLee(e, r.accion)} — ${r.motivo}`);
  }
}

function main(): void {
  const ruta = process.argv[2];
  if (!ruta) {
    console.error("Uso: npm run repetir <ruta del fichero de partida>");
    process.exit(1);
  }

  const partida = JSON.parse(readFileSync(ruta, "utf8")) as PartidaGuardada;
  if (partida.formato !== FORMATO) {
    console.error(
      `Este fichero es del formato ${partida.formato} y este guion entiende el ${FORMATO}.`,
    );
    process.exit(1);
  }

  const base = MISIONES[partida.mision];
  if (!base) {
    console.error(
      `No sé montar la misión «${partida.mision}». Las que conozco: ${Object.keys(MISIONES).join(", ")}.`,
    );
    process.exit(1);
  }

  console.log(`\nPartida «${partida.mision}» · semilla ${partida.semilla} · commit ${partida.commit}`);
  console.log(`Guardada: ${partida.guardada}`);
  console.log(`Grupo: ${partida.heroes.map((h) => h.nombre ?? h.clase).join(", ")}`);
  console.log(`${partida.acciones.length} acciones, ${partida.rechazadas.length} rechazadas\n`);

  let e = crearPartida({ ...base, heroes: partida.heroes, semilla: partida.semilla });

  // Antes de la primera acción también hubo una pantalla, y a veces el fallo
  // está justo ahí: el grupo colocado donde no toca, una puerta pintada de más.
  console.log("  [inicio]");
  for (const linea of loQueSeVeia(e)) console.log(linea);
  imprimirRechazadas(e, rechazadasTras(partida, 0));

  for (let i = 0; i < partida.acciones.length; i++) {
    const accion = partida.acciones[i]!;
    const desde = e.registro.length;
    const r = aplicarAccion(e, accion);
    console.log(`\n  ${i + 1}. ${comoSeLee(e, accion)}`);
    if (!r.ok) {
      // Una acción que la mesa aceptó y aquí se rechaza es la señal más clara de
      // que el código no es el mismo. Se corta: todo lo que viniera detrás sería
      // una partida distinta contada como si fuera la suya.
      console.log(`      ⚠️  AQUÍ SE ROMPE LA REPETICIÓN: el motor la rechaza («${r.motivo}»),`);
      console.log("      pero en la partida de verdad se aceptó. Repítela sobre el commit del fichero.");
      break;
    }

    for (const linea of narrarTodos(r.estado, r.eventos, desde)) console.log(`      · ${linea}`);
    e = r.estado;
    for (const linea of loQueSeVeia(e)) console.log(linea);
    imprimirRechazadas(e, rechazadasTras(partida, i + 1));
  }

  // Las que se intentaron después de deshacer una jugada quedan con un `tras`
  // que ya no le corresponde a ninguna acción de la lista. No se tiran: son
  // justo las que cuentan que alguien insistió y la aplicación no le dejaba.
  const sueltas = partida.rechazadas.filter((r) => r.tras > partida.acciones.length);
  if (sueltas.length > 0) {
    console.log("\n  Rechazadas de jugadas que después se deshicieron:");
    imprimirRechazadas(e, sueltas);
  }

  const huella = {
    eventos: e.registro.length,
    rondas: e.registro.filter((ev) => ev.tipo === "cambioDeTurno" && ev.actor === "zargon").length,
    heroesVivos: e.heroes.filter((h) => h.cuerpo > 0).length,
    monstruosVivos: e.monstruos.filter((m) => m.cuerpo > 0).length,
  };
  const cuadra = (Object.keys(huella) as Array<keyof typeof huella>).every(
    (k) => huella[k] === partida.huella[k],
  );

  console.log("\n──────────────────────────────────────────");
  console.log(`  huella del fichero: ${JSON.stringify(partida.huella)}`);
  console.log(`  huella al repetir:  ${JSON.stringify(huella)}`);
  if (cuadra) {
    console.log("  Cuadra: esta es la misma partida que se jugó.\n");
  } else {
    console.log("\n  LA REPETICIÓN NO DA LA MISMA PARTIDA.");
    console.log(`  El código de este Mac no es el que corría en la página (commit ${partida.commit}).`);
    console.log(`  Para repetirla con aquel: git worktree add /tmp/repro ${partida.commit}\n`);
  }

  if (partida.diario.length > 0) {
    console.log("  Diario tal cual lo leyó la mesa:");
    for (const linea of partida.diario) console.log(`    ${linea}`);
    console.log();
  }
}

main();
