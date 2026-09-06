/**
 * Juega partidas enteras solo, para contestar la única pregunta que importa de
 * la IA: **¿ganan los héroes lo bastante a menudo?**
 *
 *   npm run sim              # 100 partidas por nivel
 *   npm run sim -- 300       # otras tantas
 *   npm run sim -- 100 4242  # y desde otra semilla base
 *
 * Todo pasa por `aplicarAccion` y por los mismos selectores que pinta la
 * interfaz. El simulador no tiene atajos propios: si una jugada aquí es legal,
 * lo es en la mesa, y si aquí se rechaza, en la mesa también.
 *
 * El objetivo del plan (T9): `torpe` ~80 % de victorias de los héroes,
 * `astuto` ~40 %. Son una guía de diseño y no un contrato, así que esto no
 * falla nunca por quedarse lejos: informa.
 */

import { MISION_CALABOZO, MONSTRUOS_CALABOZO, MUEBLES_CALABOZO, PUERTAS_CALABOZO, TRAMPAS_CALABOZO } from "../src/data/quests/calabozo";
import { crearPartida, type HeroeElegido } from "../src/engine/partida";
import { aplicarAccion, actorActual, esTurnoDeZargon, figuraActiva } from "../src/engine/reducer";
import { casillasDeMovimiento, objetivosDeAtaque, puertasAlAlcance } from "../src/engine/selectors";
import { distancia } from "../src/engine/board";
import { claveCelda, type Accion, type Celda, type EstadoPartida, type Figura } from "../src/engine/types";
import { accionDeZargon, DIFICULTADES, type Dificultad } from "../src/ai/difficulty";

/**
 * El grupo con el que se mide. Es el mismo cuarteto clásico de los tests, y va
 * escrito aquí arriba porque **un porcentaje de victorias no significa nada sin
 * decir contra qué héroes se ha medido**: cambiar el grupo mueve el número
 * tanto como cambiar los pesos de Zargon.
 */
const GRUPO: HeroeElegido[] = [
  { clase: "barbaro" },
  { clase: "enano" },
  { clase: "elfo", elementos: ["agua"] },
  { clase: "mago", elementos: ["fuego", "tierra", "aire"] },
];

/** Rondas completas —los cuatro héroes y Zargon— antes de dar la partida por colgada. */
const TOPE_DE_RONDAS = 200;

/** Acciones dentro de un mismo turno antes de cortar. Red de seguridad, no regla. */
const TOPE_POR_TURNO = 60;

// --------------------------------------------------------------- los héroes

/**
 * Cómo juegan los héroes.
 *
 * Deliberadamente tonta, y por eso va descrita en la salida: **abrir lo que
 * tenga delante, pegar si puede y si no acercarse**. No busca tesoros, no
 * registra salas, no lanza hechizos y no huye nunca.
 *
 * Eso sesga el resultado a la baja y conviene tenerlo presente al leer los
 * porcentajes: un grupo de verdad, con los nueve hechizos del mago y con la
 * cabeza de Juan Luis detrás, gana más que este. Lo que el número mide bien es
 * la **diferencia entre niveles**, que es para lo que existe T10.
 */
function accionDelHeroe(e: EstadoPartida): Accion | null {
  const heroe = figuraActiva(e);
  if (!heroe) return null;

  // Abrir es gratis y es lo que destapa la mazmorra: sin esto el grupo se queda
  // en el pasillo de la entrada hasta que se acaba el tope de rondas.
  const puerta = puertasAlAlcance(e)[0];
  if (puerta) return { tipo: "abrirPuerta", puerta: puerta.id };

  const aTiro = objetivosDeAtaque(e);
  if (aTiro.length > 0) return { tipo: "atacar", objetivo: masDebil(aTiro).id };

  if (e.turno.movimientoTotal === null) return { tipo: "tirarMovimiento" };

  const destino = haciaDondeIr(e, heroe);
  if (destino) return { tipo: "mover", destino };

  return { tipo: "terminarTurno" };
}

/** A quién pegar de los que están a tiro: al que menos cuerpo le queda. */
function masDebil(candidatos: Figura[]): Figura {
  return [...candidatos].sort((a, b) => a.cuerpo - b.cuerpo || a.id.localeCompare(b.id))[0]!;
}

/**
 * La casilla a la que ir.
 *
 * Con monstruos ya puestos sobre el tablero, la que menos pasos deje hasta el
 * más cercano; sin ellos, la que acerque a una puerta por abrir. Las dos
 * distancias las calcula el motor con sus propias reglas de movimiento
 * (`distancia`), así que una sala todavía cerrada sale a distancia infinita y
 * el grupo va antes a por la puerta, que es justo lo que haría un jugador.
 *
 * Devuelve `null` si ninguna casilla mejora la de ahora: quedarse quieto
 * gastando movimiento no es una jugada, y devolver una casilla igual de buena
 * cada vez es como se cuelga un bucle.
 */
function haciaDondeIr(e: EstadoPartida, heroe: Figura): Celda | null {
  const candidatas = casillasDeMovimiento(e);
  if (candidatas.length === 0) return null;

  const enTablero = e.monstruos.filter((m) => m.cuerpo > 0 && e.monstruosEnTablero.includes(m.id));

  const coste = enTablero.length > 0
    ? (c: Celda) => Math.min(...enTablero.map((m) => distancia(e, m, c)))
    : (c: Celda) => distanciaAPuertaPorAbrir(e, c);

  const actual = coste(heroe.celda);
  let mejor: { celda: Celda; coste: number } | null = null;
  for (const c of candidatas) {
    const suyo = coste(c);
    if (!Number.isFinite(suyo)) continue;
    // El desempate por clave es lo que hace la partida reproducible: sin él, el
    // orden de `casillasDeMovimiento` decide y la misma semilla da dos partidas.
    if (!mejor || suyo < mejor.coste || (suyo === mejor.coste && claveCelda(c) < claveCelda(mejor.celda))) {
      mejor = { celda: c, coste: suyo };
    }
  }
  return mejor && mejor.coste < actual ? mejor.celda : null;
}

/** Pasos en línea recta hasta la puerta por abrir más cercana. */
function distanciaAPuertaPorAbrir(e: EstadoPartida, c: Celda): number {
  const cerradas = e.puertas.filter((p) => !p.abierta && (!p.secreta || p.descubierta));
  if (cerradas.length === 0) return Infinity;
  // Aquí sí vale la distancia a ojo y no la del motor: la casilla del otro lado
  // de una puerta cerrada está a distancia infinita por definición, así que
  // preguntárselo al tablero devolvería siempre lo mismo y no orientaría nada.
  return Math.min(
    ...cerradas.flatMap((p) => [p.a, p.b]).map((k) => Math.abs(k.x - c.x) + Math.abs(k.y - c.y)),
  );
}

// --------------------------------------------------------------- la partida

interface Partida {
  semilla: number;
  victoria: boolean;
  /** Rondas completas jugadas. */
  rondas: number;
  /** Falso si se agotó el tope de rondas sin desenlace. */
  termino: boolean;
  ataquesDeMonstruo: number;
  /** De esos, los que el monstruo remató yéndose andando de donde pegaba. */
  ataquesYSeVa: number;
}

/**
 * Cuántas veces un monstruo pega y a continuación se va de la casilla desde la
 * que pegaba, dentro de la misma activación.
 *
 * Está aquí porque es el número que más falta hace ahora mismo: en la mesa se
 * ve como que el monstruo pega y huye, y encima le regala a los héroes que se
 * junten cuatro contra uno sin que nadie los sujete. Sale del registro de
 * eventos, que es lo que de verdad ocurrió, y no de lo que la IA pensaba hacer.
 */
function contarRomperContacto(e: EstadoPartida): { ataques: number; ySeVa: number } {
  const esMonstruo = new Set(e.monstruos.map((m) => m.id));
  let ataques = 0;
  let ySeVa = 0;
  let acabaDePegar: string | null = null;

  for (const ev of e.registro) {
    if (ev.tipo === "monstruoActiva") acabaDePegar = null;
    else if (ev.tipo === "ataque" && esMonstruo.has(ev.atacante)) {
      ataques++;
      acabaDePegar = ev.atacante;
    } else if (ev.tipo === "movimiento" && acabaDePegar === ev.actor && ev.ruta.length > 0) {
      ySeVa++;
      acabaDePegar = null;
    }
  }
  return { ataques, ySeVa };
}

function jugarPartida(semilla: number, nivel: Dificultad): Partida {
  let e = crearPartida({
    mision: MISION_CALABOZO,
    heroes: GRUPO,
    monstruos: MONSTRUOS_CALABOZO,
    puertas: PUERTAS_CALABOZO,
    muebles: MUEBLES_CALABOZO,
    trampas: TRAMPAS_CALABOZO,
    semilla,
  });

  let rondas = 0;
  while (!e.desenlace && rondas < TOPE_DE_RONDAS) {
    const actor = actorActual(e);
    e = jugarUnTurno(e, nivel);
    // La ronda se cuenta al pasar Zargon, que es como se cuenta en la mesa.
    if (actor === "zargon") rondas++;
  }

  const contacto = contarRomperContacto(e);
  return {
    semilla,
    victoria: e.desenlace?.victoria ?? false,
    rondas,
    termino: e.desenlace !== null,
    ataquesDeMonstruo: contacto.ataques,
    ataquesYSeVa: contacto.ySeVa,
  };
}

/** Un turno entero del actor que toque, hasta que cambie el turno o se acabe. */
function jugarUnTurno(inicial: EstadoPartida, nivel: Dificultad): EstadoPartida {
  let e = inicial;
  const mio = e.turno.indice;

  for (let i = 0; i < TOPE_POR_TURNO; i++) {
    if (e.desenlace || e.turno.indice !== mio) break;

    // El punto de entrada de T9, no el de T8 a pelo: es la línea que su registro
    // de T10 dejó encargada. Por aquí entran las personalidades por especie y la
    // miopía estructural del torpe, que no viven en la tabla de pesos.
    const accion = esTurnoDeZargon(e) ? accionDeZargon(e, nivel) : accionDelHeroe(e);
    if (!accion) break;

    const r = aplicarAccion(e, accion);
    // Que el motor rechace algo que la política acaba de proponer es un fallo de
    // la política, no del motor. Se cierra el turno en vez de insistir, que es
    // lo que convertiría un fallo en un cuelgue de cien partidas.
    if (!r.ok) {
      const cierre = aplicarAccion(e, { tipo: "terminarTurno" });
      return cierre.ok ? cierre.estado : e;
    }
    e = r.estado;
  }

  if (!e.desenlace && e.turno.indice === mio) {
    const cierre = aplicarAccion(e, { tipo: "terminarTurno" });
    if (cierre.ok) e = cierre.estado;
  }
  return e;
}

// ---------------------------------------------------------------- los niveles

// ----------------------------------------------------------------- el informe

const pct = (n: number, de: number) => (de === 0 ? "—" : `${((100 * n) / de).toFixed(0)} %`);
const media = (xs: number[]) => (xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length);

async function main() {
  const cuantas = Number(process.argv[2] ?? 100);
  const base = Number(process.argv[3] ?? 1000);

  console.log(`\nHeroQuest · ${cuantas} partidas por nivel, semillas ${base}…${base + cuantas - 1}`);
  console.log(`Misión: «${MISION_CALABOZO.titulo}» · grupo: ${GRUPO.map((h) => h.clase).join(", ")}`);
  console.log(
    "Héroes jugados por una heurística tonta: abren lo que tienen delante, pegan al más\n" +
      "débil que alcanzan y si no se acercan. No buscan tesoro ni lanzan hechizos.",
  );

  for (const nombre of DIFICULTADES) {
    const partidas: Partida[] = [];
    for (let i = 0; i < cuantas; i++) partidas.push(jugarPartida(base + i, nombre));

    const terminadas = partidas.filter((p) => p.termino);
    const ganadas = terminadas.filter((p) => p.victoria);
    const colgadas = partidas.filter((p) => !p.termino);
    // La más rara es la que no terminó; si terminaron todas, la más larga. Es la
    // que hay que repetir cuando el número no cuadra, y por eso sale su semilla.
    const rara = [...partidas].sort((a, b) => Number(a.termino) - Number(b.termino) || b.rondas - a.rondas)[0]!;

    console.log(`\n── ${nombre} ────────────────────────────────`);
    console.log(`  victorias de los héroes  ${pct(ganadas.length, terminadas.length)}  (${ganadas.length}/${terminadas.length})`);
    console.log(`  rondas de media          ${media(terminadas.map((p) => p.rondas)).toFixed(1)}`);
    console.log(`  sin terminar en ${TOPE_DE_RONDAS} rondas  ${colgadas.length}${colgadas.length > 0 ? "  ← míralas: suelen ser monstruos dando vueltas" : ""}`);
    console.log(`  partida más rara         semilla ${rara.semilla} (${rara.rondas} rondas, ${rara.termino ? (rara.victoria ? "victoria" : "derrota") : "sin terminar"})`);

    const ataques = partidas.reduce((a, p) => a + p.ataquesDeMonstruo, 0);
    const seVan = partidas.reduce((a, p) => a + p.ataquesYSeVa, 0);
    console.log(`  pega y se va             ${pct(seVan, ataques)} de ${ataques} ataques de monstruo${seVan / Math.max(1, ataques) > 0.2 ? "  ← eso es mucho, mira abajo" : ""}`);
  }

  console.log(
    "\n«Pega y se va» es un monstruo que ataca y a continuación abandona la casilla desde\n" +
      "la que pegaba. Se mide porque en la mesa se lee como que huye, y porque deja a los\n" +
      "héroes juntarse cuatro contra uno sin que nadie los sujete. Si sale alto, el sitio\n" +
      "donde mirar es `siguienteAccionDelMonstruo` en `src/ai/zargon.ts`: cuando ya ha\n" +
      "atacado, todas las casillas puntúan sin poder atacar y ninguna gana por quedarse.",
  );
  console.log(
    "\nLos porcentajes son una guía de diseño, no un contrato: no hay ningún test que\n" +
      "falle por quedarse lejos. Para repetir una partida rara, pásale su semilla como\n" +
      "segundo argumento y pide una sola: `npm run sim -- 1 <semilla>`.\n",
  );
}

main();
