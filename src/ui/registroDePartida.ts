/**
 * El registro de una partida, para poder encontrar los fallos después.
 *
 * Juan Luis juega en la tableta contra la página publicada, ve algo raro y no
 * hay forma de que una sesión mire lo que pasó: Pages sirve ficheros y no corre
 * ningún proceso, así que nadie recoge nada al otro lado. Esto es la alternativa
 * que sí funciona hoy: un fichero que él se baja y adjunta.
 *
 * **Lo que se guarda es lo que no se puede deducir.** El motor es determinista y
 * el generador aleatorio vive dentro del estado, así que con la semilla, el
 * grupo y la lista de acciones se rehace la partida entera y se le pueden
 * preguntar los mismos selectores que pinta la pantalla —las casillas verdes,
 * los objetivos de ataque, las puertas al alcance—. Eso lo imprime
 * `scripts/repetir.ts` y no hace falta escribirlo aquí; guardarlo, además de
 * engordar el fichero, daría dos versiones de la misma verdad.
 *
 * Lo que sí se pierde hoy, y por eso está en el fichero, son **las acciones que
 * el motor rechazó**: «pulsé y no pasó nada» es el fallo más difícil de
 * reconstruir después, y su motivo se enseña dos segundos y se tira.
 */

import type { HeroeElegido } from "../engine/partida";
import { narrarTodos } from "../narrator/local";
import type { Accion, EstadoPartida } from "../engine/types";

/**
 * Una acción que el motor no aceptó, con lo que hacía falta para situarla.
 *
 * `tras` es cuántas acciones **aceptadas** había cuando se intentó, que es lo
 * que permite reproducirla en su sitio exacto al repetir la partida: el número
 * de la acción rechazada no sirve, porque no llegó a entrar en la lista.
 */
export interface AccionRechazada {
  tras: number;
  accion: Accion;
  motivo: string;
}

/**
 * Cuatro números para detectar de un vistazo que la repetición no da la misma
 * partida. Si no cuadran, el código local no es el que corría en la página, y
 * seguir leyendo la salida es perder el rato.
 */
export interface HuellaDePartida {
  eventos: number;
  rondas: number;
  heroesVivos: number;
  monstruosVivos: number;
}

export interface PartidaGuardada {
  /** Sube si cambia la forma del fichero. Quien lo lea, que lo compruebe. */
  formato: 1;
  /** Qué código corría: el hash que Pages inyecta al construir, o «dev». */
  commit: string;
  /**
   * ISO, cuándo se escribió este registro: la última vez que la partida cambió.
   *
   * No la hora de la descarga, que es lo primero que se piensa. Si Juan Luis
   * cierra la pestaña el sábado y se baja el fichero el lunes, lo que hace falta
   * para situar el fallo es el sábado; el lunes no dice nada de la partida.
   */
  guardada: string;
  mision: string;
  semilla: number;
  heroes: HeroeElegido[];
  acciones: Accion[];
  /**
   * Todo lo que se intentó y no entró, en el orden en que se intentó. Es un
   * diario y no un estado: lo que se probó antes de un «deshacer» sigue aquí, y
   * conviene que siga —es donde se ve que alguien insistió tres veces—, aunque
   * su `tras` ya no case con la lista de acciones que quedó.
   */
  rechazadas: AccionRechazada[];
  /** El diario tal cual lo leyó la mesa, para enterarse sin repetir nada. */
  diario: string[];
  huella: HuellaDePartida;
}

/** La versión de la forma del fichero que escribe y entiende este código. */
export const FORMATO: 1 = 1;

/**
 * Dónde queda la partida en curso dentro del navegador.
 *
 * El botón de descarga vive en `App.tsx` y la partida en `Juego.tsx`, dos
 * ramas distintas del árbol: `localStorage` es lo que los une sin tener que
 * subir la partida entera a `App` ni bajar el botón a la pantalla de juego
 * —que además es de otra tarea—. De paso, una pestaña que se cierra sin querer
 * deja el registro escrito.
 */
export const CLAVE_EN_CURSO = "heroquest.partida-en-curso";

/**
 * Rondas jugadas: las veces que el turno ha llegado a Zargon.
 *
 * Es como se cuenta en la mesa —los héroes y luego Zargon— y sale del registro
 * de eventos, que es lo que de verdad ocurrió, y no de un contador aparte que
 * habría que mantener al día en el reductor.
 */
const rondasDe = (e: EstadoPartida): number =>
  e.registro.filter((ev) => ev.tipo === "cambioDeTurno" && ev.actor === "zargon").length;

/** El commit publicado. En `npm run dev` no hay ninguno y la verdad es «dev». */
const commitActual = (): string => import.meta.env.VITE_COMMIT ?? "dev";

/**
 * Monta el fichero descargable.
 *
 * Todo lo que sale de aquí es JSON puro —nada de `Map`, funciones ni fechas sin
 * serializar—, y hay un test que lo pasa por `JSON.parse(JSON.stringify(...))`
 * para que siga siéndolo: el fichero viaja por el chat de Juan Luis y una
 * estructura que se pierda por el camino no da error, da una partida distinta.
 */
export function construir(p: {
  estado: EstadoPartida;
  mision: string;
  semilla: number;
  heroes: readonly HeroeElegido[];
  acciones: readonly Accion[];
  rechazadas: readonly AccionRechazada[];
  /** Cuándo se escribe. Se puede pasar para que el test no dependa del reloj. */
  ahora?: Date;
  /** El commit. Se puede pasar por lo mismo. */
  commit?: string;
}): PartidaGuardada {
  const { estado } = p;
  return {
    formato: FORMATO,
    commit: p.commit ?? commitActual(),
    guardada: (p.ahora ?? new Date()).toISOString(),
    mision: p.mision,
    semilla: p.semilla,
    // Copias, no las listas vivas: este objeto se serializa más tarde —al
    // pulsar el botón— y una lista compartida habría seguido creciendo.
    heroes: p.heroes.map((h) => ({ ...h })),
    acciones: [...p.acciones],
    rechazadas: p.rechazadas.map((r) => ({ ...r })),
    diario: narrarTodos(estado, estado.registro),
    huella: {
      eventos: estado.registro.length,
      rondas: rondasDe(estado),
      heroesVivos: estado.heroes.filter((h) => h.cuerpo > 0).length,
      monstruosVivos: estado.monstruos.filter((m) => m.cuerpo > 0).length,
    },
  };
}

/**
 * Cómo se llama el fichero que se baja.
 *
 * Solo letras, dígitos, guiones y el punto de la extensión: Safari cambia por
 * guiones bajos cualquier otra cosa —los dos puntos de la hora ISO, sobre
 * todo—, y entonces el nombre que Juan Luis adjunta no es el que se dijo aquí.
 * La hora va sin separadores por lo mismo.
 */
export function nombreDeFichero(p: PartidaGuardada): string {
  const mision = p.mision.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const [fecha = "", resto = ""] = p.guardada.split("T");
  const hora = resto.slice(0, 5).replace(":", "");
  return `heroquest-${mision || "partida"}-${fecha}-${hora}.json`;
}

/**
 * Deja la partida en curso en el navegador.
 *
 * Todo va dentro de un `try`: Safari en modo privado **lanza** al escribir en
 * `localStorage`, y una partida en la mesa no se puede caer porque el registro
 * para depurar no quepa. Si no se puede guardar, no se guarda y se sigue
 * jugando, que es lo que importa.
 */
export function guardarEnCurso(p: PartidaGuardada): void {
  try {
    localStorage.setItem(CLAVE_EN_CURSO, JSON.stringify(p));
  } catch {
    // Sin sitio, sin permiso o sin `localStorage`: no hay nada que hacer aquí.
  }
}

/** Lo que haya guardado, o `null` si no hay nada legible. */
export function leerEnCurso(): PartidaGuardada | null {
  try {
    const crudo = localStorage.getItem(CLAVE_EN_CURSO);
    if (!crudo) return null;
    const p = JSON.parse(crudo) as PartidaGuardada;
    // Un formato que no es el nuestro se descarta en vez de bajarse a medias:
    // el fichero existe para leerlo después, y uno con la forma de otra versión
    // costaría más de entender que no tener ninguno.
    return p.formato === FORMATO ? p : null;
  } catch {
    return null;
  }
}
