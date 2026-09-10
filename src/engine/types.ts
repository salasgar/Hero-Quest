/** El modelo de la partida. Todo el motor trabaja sobre estos tipos. */

import type { ClaseHeroe, Genero } from "../data/heroes";
import type { EspecieMonstruo } from "../data/monsters";
import type { IdEquipo } from "../data/equipment";
import type { IdCartaTesoro } from "../data/treasure";
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

/**
 * Efecto temporal sobre una figura (bonus de un hechizo, por ejemplo).
 *
 * `clase` es texto libre y hoy vale una de estas: las siete de los hechizos
 * (`efectoDeHechizo` en `Evento`) y `enredado`, la telaraña de la araña
 * gigante (T50): dura "mision" y la gasta la tirada de soltarse, en
 * `tirarMovimientoAccion`, no el reloj del turno.
 */
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
  /**
   * Cartas de tesoro que lleva encima sin usar: pociones y equipo que no se ha
   * puesto. Por su id de `treasure.ts`, para que la carta impresa y la de la
   * pantalla sean la misma (T54).
   */
  mochila: IdCartaTesoro[];
  /** Hechizos que todavía puede lanzar. Cada uno se usa una vez por misión. */
  hechizos: IdHechizo[];
  hechizosGastados: IdHechizo[];
  oro: number;
  efectos: EfectoActivo[];
  /**
   * La clave de un icono de `src/ui/iconos.tsx`, o ausente para pintar la
   * inicial de la clase (lo de siempre). Es un dato de pantalla que viaja en
   * el estado a propósito: la vista remota (T32) recibe el montaje y tiene
   * que pintar lo mismo que la mesa. Va como `string` y no como el tipo
   * `IdIcono` de `iconos.tsx` para no hacer que el motor dependa de la
   * interfaz (T37).
   */
  icono?: string;
}

/**
 * Cómo se toma este monstruo la pelea, más allá de lo que haga su especie.
 *
 * Es lo que pidió Juan Luis el 2026-09-06: «puede haber orcos más agresivos y
 * orcos más miedosos». Va por figura y no por especie —eso ya existe, son las
 * personalidades de T9— porque el sentido de la idea es que dos orcos de la
 * misma sala no se comporten igual.
 *
 * - `agresivo`: va a por el héroe que más le convenga, sin mirar atrás. Es lo
 *   que hacían todos los monstruos hasta T38.
 * - `miedoso`: se aleja siempre que tenga por dónde, y pega solo si está
 *   acorralado.
 * - `prudente`: cuenta cuántos héroes tiene encima y decide; con pocos, pelea.
 */
export type Temperamento = "agresivo" | "miedoso" | "prudente";

export interface Monstruo {
  tipo: "monstruo";
  id: IdFigura;
  especie: EspecieMonstruo;
  /**
   * Nombre de pila, único dentro de la partida. Obligatorio a propósito: si
   * fuera opcional, el sitio que se olvidara de ponerlo saldría en la mesa como
   * «el orco undefined» en vez de fallar al compilar.
   */
  nombre: string;
  /**
   * Opcional, al contrario que `nombre`, y por un motivo que no es de estilo:
   * el monstruo errante que sale de una carta de tesoro nace en `reducer.ts`,
   * y **T38 tiene prohibido tocar ese fichero** (su ficha: huir es mover, y
   * mover ya es legal). Un campo obligatorio dejaría ahí un error de
   * compilación que esta tarea no puede arreglar.
   *
   * Quien no lo trae juega como `agresivo`, que es exactamente lo que hacían
   * todos los monstruos antes de T38: la ausencia no cambia ninguna partida.
   * Se lee siempre por `temperamentoDe`, nunca a pelo, para que ese valor por
   * defecto esté escrito en un solo sitio. La tarea que vuelva a tocar
   * `reducer.ts` —T50— puede ponérselo al errante y hacerlo obligatorio.
   */
  temperamento?: Temperamento;
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

/**
 * El temperamento con el que juega esta figura. Los héroes no tienen, y los
 * monstruos que nacen sin él pelean como se peleaba antes de T38.
 */
export const temperamentoDe = (f: Figura): Temperamento =>
  esMonstruo(f) ? (f.temperamento ?? "agresivo") : "agresivo";

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
  | { clase: "salir" }
  /**
   * El tesoro de misión del reglamento (p. 14): se encuentra al registrar
   * `sala` buscando tesoro, en vez de robar carta, y la misión termina ahí.
   * Con `custodio`, solo cuando ese monstruo ha caído; hasta entonces la sala
   * se registra como cualquier otra. `objeto` es lo que se encuentra, con su
   * artículo («el pergamino del guardián»): sale tal cual en el diario.
   */
  | { clase: "recuperar"; objeto: string; sala: IdSala; custodio?: IdFigura };

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
  /**
   * Nombres sorteados y todavía sin usar, por especie.
   *
   * Está en el estado por el monstruo errante: nace en el reductor, mucho
   * después de `crearPartida`, y necesita un nombre que no repita ninguno de los
   * ya dados. Sorteárselo allí obligaría al reductor a consumir el generador de
   * la partida al robar una carta, y eso movería todas las tiradas siguientes.
   * Así el reductor solo lee de esta lista y quita lo que gasta.
   *
   * En red importa además que los dos lados vean lo mismo: las dos casas rehacen
   * la partida desde el montaje, y con la reserva dentro del estado les sale el
   * mismo nombre. Sorteado al vuelo, cada casa vería uno distinto y sin error.
   */
  nombresLibres: Record<EspecieMonstruo, string[]>;
  turno: Turno;
  registro: Evento[];
  desenlace: null | { victoria: boolean; motivo: string };
  /**
   * Quién encontró el tesoro de misión (objetivo `recuperar`). Opcional para
   * que ninguna partida montada antes de T53 cambie de forma: ausente es «aún
   * no».
   */
  objetoRecuperado?: IdFigura;
  /**
   * Los monstruos enterrados (poder `emboscada`, T50): salen de `monstruos`
   * en el momento en que se revela su sala —para que la sala se anuncie
   * vacía, nadie los vea, nadie les pegue y no ocupen casilla— y vuelven a
   * `monstruos` al emerger, cuando un héroe pisa dentro. Mientras están aquí
   * no cuentan para «no queda ni un monstruo en pie»: la misión no se gana sin
   * entrar en su sala. Opcional para que ninguna partida guardada antes de
   * T50 cambie de forma: ausente es «ninguno».
   */
  emboscadas?: Monstruo[];
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
  /**
   * Beber o usar una poción de la mochila de `quien`, sobre sí (sin
   * `objetivo`) o sobre otro héroe. Vale en cualquier momento, sea de quien
   * sea el turno, y no gasta la acción (reglamento p. 16: «you may drink a
   * potion at any time»); por eso lleva `quien` y no usa la figura activa.
   */
  | { tipo: "usarPocion"; quien: IdFigura; carta: IdCartaTesoro; objetivo?: IdFigura }
  /** Dar una carta de la mochila a otro héroe. Solo en el turno de quien da (p. 16). */
  | { tipo: "darObjeto"; carta: IdCartaTesoro; a: IdFigura }
  /**
   * El poder del monstruo activo, en el turno de Zargon (T50). Hoy solo lo
   * tiene una acción propia el maleficio (brujo, bruja, hechicero del Caos), y
   * `objetivo` es el héroe al que maldice; la telaraña va dentro de `atacar` y
   * la emboscada la dispara el movimiento del héroe, sin acción.
   */
  | { tipo: "poderDeMonstruo"; objetivo: IdFigura }
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
  | {
      tipo: "trampaDisparada";
      trampa: string;
      tipoTrampa: TipoTrampa;
      figura: IdFigura;
      dano: number;
      /** Los dados de la propia trampa: uno la lanza, tres el bloque, ninguno el foso. */
      dados?: CaraCombate[];
      /** El foso ya estaba abierto: no se hunde el suelo, el héroe se mete o falla el salto. */
      yaAbierta?: boolean;
    }
  | {
      tipo: "saltoDeTrampa";
      trampa: string;
      tipoTrampa: TipoTrampa;
      figura: IdFigura;
      dado: CaraCombate;
      logrado: boolean;
    }
  | { tipo: "trampaDescubierta"; trampa: string; tipoTrampa: TipoTrampa; celda: Celda }
  | { tipo: "trampaDesarmada"; trampa: string }
  | { tipo: "puertaSecretaDescubierta"; puerta: string }
  | { tipo: "busquedaSinHallazgo"; actor: IdFigura; que: "tesoro" | "trampas" }
  | { tipo: "tesoroEncontrado"; actor: IdFigura; oro: number }
  | { tipo: "objetoDeMision"; actor: IdFigura; objeto: string }
  /** Una carta del tesoro que no se aplica al robarla: va a la mochila. */
  | { tipo: "objetoGuardado"; actor: IdFigura; carta: IdCartaTesoro; nombre: string }
  /** Equipo salido del tesoro: `puesto` si el héroe se lo ha puesto; si no, a la mochila. */
  | { tipo: "equipoEncontrado"; actor: IdFigura; equipo: IdEquipo; puesto: boolean }
  | { tipo: "pocionUsada"; actor: IdFigura; objetivo: IdFigura; carta: IdCartaTesoro; nombre: string }
  | { tipo: "objetoDado"; de: IdFigura; a: IdFigura; carta: IdCartaTesoro; nombre: string; puesto: boolean }
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
  /**
   * Lo que un hechizo le hace al objetivo cuando no es daño ni curación. Siete
   * clases de efecto que hasta T21 se aplicaban sin decir una palabra: la carta
   * se gastaba, el monstruo se dormía y en el diario solo quedaba «X lanza Y».
   * Va con lista de objetivos porque la Tempestad alcanza a más de uno.
   */
  | {
      tipo: "efectoDeHechizo";
      hechizo: IdHechizo;
      clase:
        | "dormir"
        | "perderTurno"
        | "bonusAtaque"
        | "bonusDefensa"
        | "atravesarMuros"
        | "atravesarFiguras"
        | "movimientoExtra";
      objetivos: IdFigura[];
    }
  /**
   * El hechizo se gasta y no pasa nada. El motivo va en el dato y no en la
   * frase: hoy son cuatro y va a haber más. El fallo silencioso era peor que el
   * silencio: un Sueño que no prende dejaba la misma línea que uno que sí.
   */
  | {
      tipo: "hechizoSinEfecto";
      hechizo: IdHechizo;
      objetivo: IdFigura;
      motivo: "noMuerto" | "menteSuperior" | "yaEstabaSano" | "sinObjetivo";
    }
  | { tipo: "monstruoActiva"; monstruo: IdFigura }
  /** Cerró su activación sin moverse ni atacar. Es el caso que se lee como «esto está roto». */
  | { tipo: "monstruoSinActuar"; monstruo: IdFigura }
  /** El Sueño se rompe con un 6 al llegar el turno de Zargon, no antes. */
  | { tipo: "dormidoDespierta"; actor: IdFigura }
  /**
   * El maleficio de un brujo sobre un héroe (T50). `dado` es el dado rojo que
   * tira el héroe y `mente` la suya: con `dado <= mente` lo resiste y `dano`
   * es 0; si no, `dano` es lo que pierde. Un solo evento para los dos
   * finales, con el motivo en el dato y no en la frase, como `hechizoSinEfecto`.
   */
  | { tipo: "maleficio"; actor: IdFigura; objetivo: IdFigura; dado: number; mente: number; dano: number }
  /** La telaraña prende: la araña `por` ha herido a `figura` y la deja sin moverse. */
  | { tipo: "enredado"; figura: IdFigura; por: IdFigura }
  /** La tirada de soltarse de la telaraña, al empezar el turno: calavera es seguir enredado. */
  | { tipo: "tiraParaSoltarse"; figura: IdFigura; dado: CaraCombate; logrado: boolean }
  /** Un monstruo enterrado emerge en `celda`, junto al héroe `sobre` que ha pisado su sala. */
  | { tipo: "emboscada"; monstruo: IdFigura; celda: Celda; sobre: IdFigura }
  /** Zargon llega a su turno y no tiene a nadie. Los dos motivos se cuentan distinto. */
  | { tipo: "zargonSinMonstruos"; motivo: "ningunoDescubierto" | "todosHanActuado" }
  | { tipo: "cambioDeTurno"; actor: Actor }
  | { tipo: "finDePartida"; victoria: boolean; motivo: string };

// ---------------------------------------------------------------- resultado

export type Resultado =
  | { ok: true; estado: EstadoPartida; eventos: Evento[] }
  | { ok: false; motivo: string };
