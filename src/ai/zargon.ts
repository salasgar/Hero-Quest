/**
 * Zargon juega: qué hace cada monstruo en su activación.
 *
 * Esto es lo que convierte la aplicación en el máster de verdad. Hasta ahora, en
 * el turno de Zargon un humano activaba cada monstruo y lo movía a mano; aquí
 * está la decisión que le quita esa parte de encima.
 *
 * **La regla que no se rompe: la IA elige entre acciones legales, no inventa
 * acciones.** Cada candidata se pasa por `aplicarAccion` y solo sobrevive la que
 * devuelve `ok: true`. Nunca se construye un estado a mano. El motor sigue siendo
 * el árbitro, y por eso la IA no puede proponer nada que la pantalla rechace
 * después con cuatro niños mirando.
 *
 * **El orden de activación no está aquí: lo decide `orden.ts`**, de T17, y se
 * consume tal cual. No hay dos ordenaciones vivas, que era justo lo que su
 * cabecera pedía comprobar al escribir esta tarea.
 *
 * Lo que **no** es de aquí: las personalidades por especie y las dificultades son
 * T9; medir si esta táctica es buena es T10; conectarla a la pantalla es T11.
 */

import { alcanzables } from "../engine/board";
import { aplicarAccion } from "../engine/reducer";
import { esTurnoDeZargon, figuraActiva, objetivosDeAtaque } from "../engine/selectors";
import { esHeroe, type Accion, type Celda, type EstadoPartida } from "../engine/types";
import { proximoEnActuar } from "./orden";
import { objetivosPuntuados, type Pesos, PESOS } from "./targeting";

/**
 * Una jugada candidata, ya validada por el motor.
 *
 * `puntos` es lo que vale llegar a esa casilla, medido por lo que se puede hacer
 * **desde** ella; `pasos` es lo que cuesta, y solo desempata.
 */
interface Candidata {
  accion: Accion;
  puntos: number;
  pasos: number;
  /** Para dejar el desempate escrito y no a merced del `sort`. */
  clave: string;
}

/** Aplica una acción y devuelve el estado, o `null` si el motor la rechaza. */
const simular = (e: EstadoPartida, a: Accion): EstadoPartida | null => {
  const r = aplicarAccion(e, a);
  return r.ok ? r.estado : null;
};

/**
 * Lo mejor que puede hacer el monstruo activo **sin moverse**, y cuánto vale.
 *
 * Devuelve la puntuación del mejor objetivo al alcance, o `-Infinity` si no hay
 * ninguno. Se apoya en `objetivosDeAtaque`, que es el mismo selector que usa la
 * pantalla: si algún día cambia lo que es atacable, cambia en los dos sitios a la
 * vez y no hay forma de que se contradigan.
 */
function mejorAtaqueDesdeAqui(
  e: EstadoPartida,
  pesos: Pesos,
): { accion: Accion; puntos: number } | null {
  const monstruo = figuraActiva(e);
  if (!monstruo) return null;

  const alcance = new Set(objetivosDeAtaque(e).map((x) => x.id));
  if (alcance.size === 0) return null;

  const mejor = objetivosPuntuados(e, monstruo, pesos).find((p) => alcance.has(p.objetivo.id));
  if (!mejor) return null;

  const accion: Accion = { tipo: "atacar", objetivo: mejor.objetivo.id };
  // Aunque la puntuación diga que sí, manda el motor: si por lo que sea rechaza
  // este ataque, esta candidata no existe.
  return simular(e, accion) ? { accion, puntos: mejor.total } : null;
}

/**
 * Lo que vale una casilla a la que todavía no se ha ido.
 *
 * Se mide **por lo que se podrá hacer desde ella**, no por lo cerca que está: una
 * casilla desde la que se pega al mago vale lo que valga pegarle al mago. Si
 * desde ahí no se ataca a nadie, vale lo que valga el mejor objetivo visto desde
 * ahí, que ya lleva dentro su penalización por distancia. Así, un monstruo que no
 * llega a nadie **avanza hacia el que más le interesa** en vez de quedarse
 * quieto, y lo hace con la misma fórmula, sin una segunda heurística de
 * aproximación que luego habría que mantener aparte.
 */
function valorDeLaCasilla(e: EstadoPartida, pesos: Pesos): number {
  const monstruo = figuraActiva(e);
  if (!monstruo) return -Infinity;
  const ataque = mejorAtaqueDesdeAqui(e, pesos);
  if (ataque) return ataque.puntos;
  const [mejor] = objetivosPuntuados(e, monstruo, pesos);
  if (!mejor || !Number.isFinite(mejor.total)) return -Infinity;
  // Desde aquí todavía no se pega: vale la intención, no la jugada. El descuento
  // es lo que impide que un monstruo con un héroe al lado se vaya andando hacia
  // otro mejor y acabe el turno sin atacar a nadie.
  return mejor.total - pesos.descuentoPorNoLlegar;
}

/**
 * Todas las casillas a las que el monstruo activo puede ir, ya validadas.
 *
 * Se consulta `alcanzables` —que sabe de muros, puertas, muebles, bloques caídos
 * y de la regla de T2— y después **se pasa cada destino por el motor**. Lo
 * segundo no sobra: `alcanzables` contesta a «¿hay camino?» y `aplicarAccion` a
 * «¿es legal ahora?», que no son la misma pregunta.
 */
function destinos(e: EstadoPartida, pesos: Pesos): Candidata[] {
  const monstruo = figuraActiva(e);
  if (!monstruo || e.turno.movimientoCerrado || e.turno.movimientoRestante <= 0) return [];

  const salida: Candidata[] = [];
  for (const [clave, { coste, ruta }] of alcanzables(e, monstruo, e.turno.movimientoRestante)) {
    const destino: Celda | undefined = ruta[ruta.length - 1];
    if (!destino) continue;
    const accion: Accion = { tipo: "mover", destino };
    const despues = simular(e, accion);
    if (!despues) continue;
    salida.push({ accion, puntos: valorDeLaCasilla(despues, pesos), pasos: coste, clave });
  }
  return salida;
}

/**
 * La siguiente acción del monstruo activo, o `null` si ya no le queda nada mejor
 * que terminar.
 *
 * El orden en que se decide:
 *
 * 1. **Si puede pegar desde donde está y ninguna casilla mejora eso, pega.** Un
 *    monstruo que ya tiene a un héroe al lado y se va a buscar otro mejor regala
 *    el ataque que tenía servido, y en la mesa se lee como que la aplicación se
 *    ha despistado.
 * 2. **Si moverse le pone en una situación mejor, se mueve.** La siguiente vuelta
 *    del bucle vuelve a mirar y normalmente ataca ya desde ahí.
 * 3. **Si no, termina.** Quedarse quieto gastando movimiento no es una jugada.
 */
export function siguienteAccionDelMonstruo(
  e: EstadoPartida,
  pesos: Pesos = PESOS,
): Accion | null {
  const monstruo = figuraActiva(e);
  if (!monstruo || esHeroe(monstruo)) return null;

  const quieto = mejorAtaqueDesdeAqui(e, pesos);
  const moviendose = destinos(e, pesos);

  const mejorMovimiento = moviendose.sort(
    (a, b) =>
      b.puntos - a.puntos ||
      // A igualdad, se anda menos: ni se pasea ni se aleja del grupo por gusto.
      a.pasos - b.pasos ||
      // Y el último desempate está escrito, para que la jugada sea reproducible
      // y el «deshacer» siga saliendo idéntico.
      a.clave.localeCompare(b.clave),
  )[0];

  // Quedarse a pegar gana los empates: es la jugada que no gasta nada y la que
  // se entiende sola al verla en el tablero.
  if (quieto && (!mejorMovimiento || mejorMovimiento.puntos <= quieto.puntos)) return quieto.accion;
  if (mejorMovimiento && Number.isFinite(mejorMovimiento.puntos)) return mejorMovimiento.accion;
  return quieto ? quieto.accion : null;
}

/**
 * La siguiente acción de Zargon, sea la que sea: activar al que le toca, jugar
 * con el que está activo o cerrar su activación.
 *
 * Es el único punto de entrada que necesita T11: llamarla en bucle y despachar
 * lo que devuelva por `usePartida` resuelve el turno entero. Devuelve `null`
 * cuando no es el turno de Zargon o no queda nada por hacer.
 */
export function siguienteAccionDeZargon(e: EstadoPartida, pesos: Pesos = PESOS): Accion | null {
  if (!esTurnoDeZargon(e)) return null;

  if (!e.turno.monstruoActivo) {
    const siguiente = proximoEnActuar(e);
    if (siguiente) return { tipo: "activarMonstruo", monstruo: siguiente.id };
    // Sin nadie a quien activar, el turno de Zargon **se cierra igual**. Pasa al
    // empezar la misión, con los seis monstruos todavía dentro de sus salas: si
    // aquí se devolviera `null`, la partida se quedaría parada en el turno de
    // Zargon esperando a alguien que no existe.
    return { tipo: "terminarTurno" };
  }

  const jugada = siguienteAccionDelMonstruo(e, pesos);
  if (jugada) return jugada;

  // Cerrar la activación es una acción como las demás y pasa por el motor: es él
  // quien sabe si detrás viene otro monstruo o si se acaba el turno de Zargon.
  return { tipo: "terminarTurno" };
}

/**
 * El turno de Zargon entero, como lista de acciones legales.
 *
 * Se calcula simulando: cada acción se aplica de verdad con el motor antes de
 * decidir la siguiente, porque la de después depende de lo que pase en la de
 * antes —un héroe que cae cambia a quién va el resto—.
 *
 * La usan los tests y la usará T10 para medir; **T11 no la necesita**: en la mesa
 * conviene ir despachando acción a acción, para que se vea moverse cada figura y
 * dé tiempo a mover la miniatura.
 *
 * `tope` es una red de seguridad, no una regla del juego: si algún día una
 * combinación de reglas dejara a la IA proponiendo acciones para siempre, es
 * mejor cortar que colgar la partida. Si salta, hay un fallo que mirar.
 */
export function turnoDeZargon(
  inicial: EstadoPartida,
  pesos: Pesos = PESOS,
  tope = 200,
): { acciones: Accion[]; estado: EstadoPartida } {
  const acciones: Accion[] = [];
  let estado = inicial;

  for (let i = 0; i < tope; i++) {
    if (!esTurnoDeZargon(estado)) break;
    const accion = siguienteAccionDeZargon(estado, pesos);
    if (!accion) break;
    const siguiente = simular(estado, accion);
    // Si el motor rechaza algo que esta función acaba de proponer, es un fallo
    // de la IA y no del motor: se para en vez de insistir, que es lo que
    // convertiría un fallo en un cuelgue.
    if (!siguiente) break;
    acciones.push(accion);
    estado = siguiente;
  }

  return { acciones, estado };
}

/** Por qué el monstruo activo ha hecho eso, en una frase para decir en la mesa. */
export function motivoDeLaJugada(e: EstadoPartida, accion: Accion, pesos: Pesos = PESOS): string | null {
  const monstruo = figuraActiva(e);
  if (!monstruo) return null;

  if (accion.tipo === "atacar") {
    const p = objetivosPuntuados(e, monstruo, pesos).find((x) => x.objetivo.id === accion.objetivo);
    if (!p) return null;
    // El orden es el de lo que más pesa, y cada frase tiene que ser **verdad**:
    // esto se lee en voz alta en la mesa. La versión anterior decía «el enano
    // lanza hechizos» porque miraba la mente, que el enano tiene y los hechizos
    // no.
    if (p.desglose.remate > 0) return `puede tumbar a ${p.objetivo.nombre}`;
    if (p.desglose.heridoPrimero > 0) return `${p.objetivo.nombre} está herido`;
    if (p.desglose.lanzaHechizos > 0) return `a ${p.objetivo.nombre} le quedan hechizos`;
    return `es a quien más daño le hace`;
  }

  if (accion.tipo === "mover") {
    const [mejor] = objetivosPuntuados(e, monstruo, pesos);
    return mejor ? `va a por ${mejor.objetivo.nombre}` : null;
  }

  return null;
}
