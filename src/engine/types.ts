/** El modelo de la partida. Todo el motor trabaja sobre estos tipos. */

import type { ClaseHeroe, Genero } from "../data/heroes";
import type { EspecieMonstruo } from "../data/monsters";
import type { IdEquipo } from "../data/equipment";
import type { IdHechizo } from "../data/spells";
import type { CaraCombate } from "./dice";
import type { Rng } from "./rng";

// ---------------------------------------------------------------- geometría

export interface Celda {
  x: number;
  y: number;
}

export type IdSala = string;

export type Region = { tipo: "pasillo" } | { tipo: "sala"; id: IdSala };

export const mismaCelda = (a: Celda, b: Celda): boolean => a.x === b.x && a.y === b.y;

export const claveCelda = (c: Celda): string => `${c.x},${c.y}`;

/** Adyacencia ortogonal: en HeroQuest no existe el movimiento en diagonal. */
export const sonAdyacentes = (a: Celda, b: Celda): boolean =>
  Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;

export const sonAdyacentesConDiagonal = (a: Celda, b: Celda): boolean =>
  Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)) === 1 && !mismaCelda(a, b);

// ---------------------------------------------------------------- figuras

export type IdFigura = string;

/** Efecto temporal sobre una figura (bonus de un hechizo, por ejemplo). */
export interface EfectoActivo {
  clase: string;
  dados?: number;
  /**
   * "turno" dura hasta el final del turno en curso; "mision" hasta acabar la
   * misión o hasta que algo la gaste; "siguienteAtaque" se gasta al atacar;
   * "hastaRecibirDano" se rompe con el primer golpe que pasa, que es como
   * funciona la piel de piedra.
   */
  duracion: "turno" | "mision" | "siguienteAtaque" | "hastaRecibirDano";
}

export interface Heroe {
  tipo: "heroe";
  id: IdFigura;
  clase: ClaseHeroe;
  /** Si se juega en masculino o en femenino. Solo cambia cómo se le llama. */
  genero: Genero;
  nombre: string;
  celda: Celda;
  cuerpo: number;
  cuerpoMax: number;
  mente: number;
  menteMax: number;
  equipo: IdEquipo[];
  /** Hechizos que todavía puede lanzar. Cada uno se usa una vez por misión. */
  hechizos: IdHechizo[];
  hechizosGastados: IdHechizo[];
  oro: number;
  efectos: EfectoActivo[];
}

export interface Monstruo {
  tipo: "monstruo";
  id: IdFigura;
  especie: EspecieMonstruo;
  celda: Celda;
  cuerpo: number;
  cuerpoMax: number;
  efectos: EfectoActivo[];
  dormido: boolean;
  pierdeTurno: boolean;
}

export type Figura = Heroe | Monstruo;

export const esHeroe = (f: Figura): f is Heroe => f.tipo === "heroe";
export const esMonstruo = (f: Figura): f is Monstruo => f.tipo === "monstruo";

// ---------------------------------------------------------------- mazmorra

export interface Puerta {
  id: string;
  /** Las dos casillas adyacentes que une, de regiones distintas. */
  a: Celda;
  b: Celda;
  abierta: boolean;
  secreta: boolean;
  /** Solo importa en las secretas: hasta descubrirla, se comporta como muro. */
  descubierta: boolean;
}

export type TipoMueble =
  | "mesa" | "estanteria" | "arcon" | "armario" | "trono"
  | "tumba" | "altar" | "banco" | "escritorio" | "bastidor";

export interface Mueble {
  id: string;
  tipo: TipoMueble;
  celdas: Celda[];
  /** Nadie puede plantarse encima: vale para casi todo el mobiliario. */
  bloqueaPaso: boolean;
  /**
   * Además tapa la vista. Solo lo alto: una estantería o un armario tapan,
   * una mesa o una tumba no. Separarlo importa porque decide qué hechizos y
   * qué disparos de ballesta tienen línea hasta el objetivo.
   */
  bloqueaVista: boolean;
}

export type TipoTrampa = "foso" | "bloque" | "lanza";

export interface Trampa {
  id: string;
  tipo: TipoTrampa;
  celda: Celda;
  descubierta: boolean;
  gastada: boolean;
}

// ---------------------------------------------------------------- misión

export interface Mision {
  id: string;
  titulo: string;
  introduccion: string;
  /** Casillas donde empiezan los héroes (la escalera). */
  entrada: Celda[];
  /** Texto que lee el máster al revelar cada sala. */
  textosDeSala: Record<IdSala, string>;
  objetivo: ObjetivoMision;
}

export type ObjetivoMision =
  | { clase: "matarATodos" }
  | { clase: "matarA"; figura: IdFigura }
  | { clase: "llegarA"; celdas: Celda[] }
  | { clase: "salir" };

// ---------------------------------------------------------------- turno

export type Actor = IdFigura | "zargon";

export interface Turno {
  /** Los héroes en orden y, al final, Zargon con todos sus monstruos. */
  orden: Actor[];
  indice: number;
  /** null mientras no se haya tirado el movimiento. */
  movimientoTotal: number | null;
  movimientoRestante: number;
  haMovido: boolean;
  haActuado: boolean;
  /**
   * El movimiento de HeroQuest es un bloque continuo: se mueve y luego se
   * actúa, o se actúa y luego se mueve, pero no se parte el movimiento en dos
   * mitades con la acción en medio. Esto se cierra al actuar habiendo movido.
   */
  movimientoCerrado: boolean;
  /** En el turno de Zargon, el monstruo que está actuando ahora. */
  monstruoActivo: IdFigura | null;
  /** Monstruos que ya han terminado en este turno de Zargon. */
  monstruosHechos: IdFigura[];
}

// ---------------------------------------------------------------- estado

export interface EstadoPartida {
  rng: Rng;
  mision: Mision;
  heroes: Heroe[];
  monstruos: Monstruo[];
  puertas: Puerta[];
  muebles: Mueble[];
  trampas: Trampa[];
  salasReveladas: IdSala[];
  /**
   * Puertas que algún héroe ha llegado a ver, por id. Es acumulativo y nunca
   * quita: en la mesa, la puerta de cartón se pone encima del tablero cuando el
   * grupo la ve y ahí se queda aunque después doblen la esquina. Calcularlo al
   * vuelo con `puedeVer` haría parpadear la pantalla y el espejo dejaría de
   * corresponderse con lo que hay en la mesa.
   */
  puertasVistas: string[];
  /**
   * Monstruos que están puestos sobre el tablero, por id. Reglamento p. 11:
   * «Zargon may move all monsters currently **on the gameboard**», y la p. 12
   * dice cuándo se ponen: al abrir la puerta de su sala, o al quedar en la línea
   * de visión de un héroe por un pasillo. Hasta entonces la figura sigue en la
   * caja y Zargon no puede moverla.
   *
   * Acumula y nunca quita, igual que `puertasVistas` y por lo mismo: los héroes
   * pueden retroceder y perderlo de vista, pero la figura ya está en la mesa.
   */
  monstruosEnTablero: IdFigura[];
  /**
   * Quién ha registrado qué sala en busca de tesoro. Un par por búsqueda, no una
   * lista de salas.
   *
   * Reglamento p. 14: «A room may be searched by **all four heroes**, but each
   * individual hero may only search the room once». Con una lista de salas, el
   * primero que registraba una se la cerraba a los otros tres, que es más
   * restrictivo que la regla y además les quitaba su carta de tesoro.
   *
   * Par y no una clave `"heroe|sala"` para que el estado se lea al depurarlo y
   * no haya que acordarse del separador. Sigue siendo JSON puro: hay un test que
   * comprueba que el estado sobrevive a `JSON.parse(JSON.stringify(e))`.
   */
  buscadoTesoro: Array<{ heroe: IdFigura; sala: IdSala }>;
  buscadoTrampas: IdSala[];
  /** Casillas cegadas por un bloque que ha caído. */
  celdasBloqueadas: Celda[];
  /**
   * La baraja de tesoros, barajada al empezar y consumida por arriba. Va dentro
   * del estado, no en una variable suelta, para que el «deshacer» siga siendo
   * exacto y para que no puedan salir cinco pociones seguidas.
   */
  mazoTesoros: string[];
  turno: Turno;
  registro: Evento[];
  desenlace: null | { victoria: boolean; motivo: string };
}

// ---------------------------------------------------------------- acciones

export type Accion =
  /** Tira 2d6 de movimiento. `dados` permite meter la tirada física de la mesa. */
  | { tipo: "tirarMovimiento"; dados?: [number, number] }
  | { tipo: "mover"; destino: Celda }
  /** Solo en el turno de Zargon: pone en juego a un monstruo concreto. */
  | { tipo: "activarMonstruo"; monstruo: IdFigura }
  | { tipo: "abrirPuerta"; puerta: string }
  | {
      tipo: "atacar";
      objetivo: IdFigura;
      /** Resultados de los dados físicos, si los tira alguien en la mesa. */
      dadosAtaque?: CaraCombate[];
      dadosDefensa?: CaraCombate[];
    }
  | { tipo: "buscarTesoro" }
  | { tipo: "buscarTrampas" }
  | { tipo: "desarmarTrampa"; trampa: string }
  | { tipo: "lanzarHechizo"; hechizo: IdHechizo; objetivo?: IdFigura; dados?: CaraCombate[] }
  | { tipo: "terminarTurno" };

// ---------------------------------------------------------------- eventos

/** Lo que ha pasado. Es lo que consume el narrador de la Fase 5. */
export type Evento =
  | { tipo: "tiradaMovimiento"; actor: Actor; dados: [number, number]; total: number }
  | { tipo: "movimiento"; actor: IdFigura; desde: Celda; hasta: Celda; ruta: Celda[] }
  | { tipo: "puertaAbierta"; puerta: string }
  | { tipo: "salaRevelada"; sala: IdSala; texto: string | null; monstruos: IdFigura[] }
  | {
      tipo: "ataque";
      atacante: IdFigura;
      objetivo: IdFigura;
      dadosAtaque: CaraCombate[];
      calaveras: number;
      dadosDefensa: CaraCombate[];
      escudos: number;
      dano: number;
    }
  | { tipo: "figuraDerrotada"; figura: IdFigura }
  | { tipo: "trampaDisparada"; trampa: string; tipoTrampa: TipoTrampa; figura: IdFigura; dano: number }
  | { tipo: "trampaDescubierta"; trampa: string; tipoTrampa: TipoTrampa; celda: Celda }
  | { tipo: "trampaDesarmada"; trampa: string }
  | { tipo: "puertaSecretaDescubierta"; puerta: string }
  | { tipo: "busquedaSinHallazgo"; actor: IdFigura; que: "tesoro" | "trampas" }
  | { tipo: "tesoroEncontrado"; actor: IdFigura; oro: number }
  | { tipo: "cartaDeTesoro"; actor: IdFigura; carta: string; nombre: string; texto: string }
  | { tipo: "monstruoErrante"; monstruo: IdFigura; celda: Celda }
  | { tipo: "hechizoLanzado"; actor: IdFigura; hechizo: IdHechizo; objetivo: IdFigura | null }
  | { tipo: "curacion"; figura: IdFigura; puntos: number }
  | {
      tipo: "danoDeHechizo";
      hechizo: IdHechizo;
      objetivo: IdFigura;
      dados: CaraCombate[];
      dano: number;
    }
  | { tipo: "movimientoExtra"; figura: IdFigura; casillas: number }
  | { tipo: "cambioDeTurno"; actor: Actor }
  | { tipo: "finDePartida"; victoria: boolean; motivo: string };

// ---------------------------------------------------------------- resultado

export type Resultado =
  | { ok: true; estado: EstadoPartida; eventos: Evento[] }
  | { ok: false; motivo: string };
