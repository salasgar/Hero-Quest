/**
 * La partida en red, del lado de quien juega: la sesión que habla con el relevo.
 *
 * La idea entera de la fase (T30): jugar en red no es sincronizar el estado, es
 * repartir la lista de acciones. Esta sesión guarda esa lista, rehace el estado
 * con `repetir(inicial, acciones)` —lo mismo que ya hace el «deshacer»— y no
 * envía nunca un `EstadoPartida` por la red: lo que viaja son acciones.
 *
 * No sabe React a propósito: así se prueba entera con vitest, que corre en
 * `node`. La pantalla la usa a través de `usePartida`, que se suscribe y pinta.
 * Y no habla HTTP directamente sino a través de un `Transporte`, por el mismo
 * motivo: en los tests el transporte es el `protocolo.ts` de T30 en memoria, y
 * lo que se prueba es la reconciliación, no `fetch`.
 */

import {
  MISION_CALABOZO,
  MONSTRUOS_CALABOZO,
  MUEBLES_CALABOZO,
  PUERTAS_CALABOZO,
  TRAMPAS_CALABOZO,
} from "../data/quests/calabozo";
import { crearPartida, type OpcionesPartida } from "../engine/partida";
import { actorActual, aplicarAccion, repetir } from "../engine/reducer";
import type { Accion, EstadoPartida } from "../engine/types";
import { VERSION, type Entrada, type Montaje, type Resultado, type Vista } from "./protocolo";

/**
 * El nombre del jugador que es la casa donde está el tablero. Es el valor que
 * usa el `reparto` del montaje para las figuras que se juegan en la mesa, y el
 * `jugador` de la sesión que crea la partida: quien crea es quien tiene las
 * miniaturas en la mano.
 */
export const MESA = "mesa";

// ------------------------------------------------- del montaje a la partida

/**
 * Las misiones que esta aplicación sabe montar, por identificador. El montaje
 * lleva el identificador y no la misión entera porque cada casa ya la tiene en
 * su propio código; la contrapartida es que un identificador desconocido tiene
 * que rechazarse con un motivo legible, no reventar.
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

/**
 * El único sitio que convierte un montaje en una partida. Único a propósito:
 * dos sitios que construyan las opciones acabarán construyendo dos partidas
 * distintas, y esa divergencia no da error, se descubre media hora después. La
 * semilla viene del montaje y de ningún otro lado: se decidió una vez, al crear
 * la partida, y las dos casas barajan el mismo mazo con ella.
 */
export function partidaDelMontaje(m: Montaje): Resultado<EstadoPartida> {
  const base = MISIONES[m.mision];
  if (!base) {
    return {
      ok: false,
      motivo: `Esta aplicación no conoce la misión «${m.mision}». Puede que la partida se creara con una versión más nueva; recarga la página.`,
    };
  }
  return { ok: true, valor: crearPartida({ ...base, heroes: m.heroes, semilla: m.semilla }) };
}

// ------------------------------------------------------------- el transporte

/** Lo que responde el relevo a una escritura. En un rechazo por ir atrasado
 * (`esperado` viejo) vienen además `entradas` y `total`, dentro del `Resultado`. */
export interface Transporte {
  crear(montaje: Montaje): Promise<Resultado<{ codigo: string; secreto: string }>>;
  leer(codigo: string, desde: number): Promise<Resultado<Vista>>;
  enviar(
    codigo: string,
    peticion: { esperado: number; accion: Accion; autor: string },
  ): Promise<Resultado<{ total: number }>>;
  truncar(
    codigo: string,
    peticion: { esperado: number; secreto: string },
  ): Promise<Resultado<{ total: number }>>;
}

/** El transporte de verdad, contra `server/relevo.ts`. Sus respuestas ya traen
 * `ok` y `motivo` en el cuerpo, así que aquí solo se les da forma de `Resultado`
 * y se convierte «no hay red» en un motivo que se pueda leer en pantalla. */
export function transporteHttp(base: string): Transporte {
  const pedir = async <T>(camino: string, init?: RequestInit): Promise<Resultado<T>> => {
    try {
      const respuesta = await fetch(`${base}${camino}`, init);
      const cuerpo = (await respuesta.json()) as {
        ok: boolean;
        motivo?: string;
        entradas?: Entrada[];
        total?: number;
      };
      if (!cuerpo.ok) {
        return {
          ok: false,
          motivo: cuerpo.motivo ?? "El relevo ha contestado algo que no se entiende.",
          entradas: cuerpo.entradas,
          total: cuerpo.total,
        };
      }
      return { ok: true, valor: cuerpo as T };
    } catch {
      // Una wifi caída no puede dejar la pantalla colgada sin explicación: el
      // caso normal de este proyecto es una familia en un salón, y «el relevo no
      // responde» con sus palabras vale más que una excepción en la consola.
      return { ok: false, motivo: "No se pudo hablar con el relevo. ¿Hay conexión?" };
    }
  };
  const post = (cuerpo: unknown): RequestInit => ({
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(cuerpo),
  });
  return {
    crear: (montaje) => pedir("/partidas", post({ montaje })),
    leer: (codigo, desde) => pedir(`/partidas/${codigo}?desde=${desde}`),
    enviar: (codigo, p) => pedir(`/partidas/${codigo}/acciones`, post(p)),
    truncar: (codigo, p) => pedir(`/partidas/${codigo}/truncar`, post(p)),
  };
}

// ---------------------------------------------------------------- la sesión

/** Cada segundo. Un turno de HeroQuest dura un minuto largo: un segundo de
 * retraso no se nota, y a cambio no hay máquina de estados de reconexión. */
const MS_ENTRE_SONDEOS = 1000;

export class SesionDeRed {
  private acciones_: Accion[];
  private estado_: EstadoPartida;
  private readonly avisados = new Set<() => void>();
  private temporizador: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly transporte: Transporte,
    readonly codigo: string,
    readonly montaje: Montaje,
    readonly inicial: EstadoPartida,
    readonly jugador: string,
    acciones: Accion[],
    /** Solo lo tiene la mesa. Es lo único que autoriza a deshacer. */
    private readonly secreto?: string,
  ) {
    this.acciones_ = acciones;
    this.estado_ = repetir(inicial, acciones);
  }

  get estado(): EstadoPartida {
    return this.estado_;
  }

  get acciones(): readonly Accion[] {
    return this.acciones_;
  }

  get esLaMesa(): boolean {
    return this.secreto !== undefined;
  }

  /**
   * Quién puede actuar lo decide el cliente, con el `reparto` del montaje. El
   * relevo no puede: una acción no nombra a su figura —`{ tipo: "mover",
   * destino }` no dice quién se mueve—, así que si esto no se hace aquí, no se
   * hace en ningún sitio. El turno de Zargon es de la mesa —los monstruos los
   * mueve quien tiene las miniaturas en la mano—, y una figura que el reparto
   * no nombra también: la juega alguien sentado al tablero.
   */
  puedeActuar(): boolean {
    if (this.estado_.desenlace) return false;
    const actor = actorActual(this.estado_);
    const controlador = actor === "zargon" ? MESA : (this.montaje.reparto[actor] ?? MESA);
    return controlador === this.jugador;
  }

  /** Avisa cada vez que el registro cambie por lo que sea: una acción propia,
   * una ajena que llegó por el sondeo, o un deshacer de la mesa. */
  suscribir(avisar: () => void): () => void {
    this.avisados.add(avisar);
    return () => this.avisados.delete(avisar);
  }

  private avisar(): void {
    for (const a of this.avisados) a();
  }

  /**
   * Un paso de sondeo. Devuelve si el registro cambió.
   *
   * Se pide **desde cero, no desde el total que ya tenemos**, y es deliberado:
   * el registro no lleva número de revisión, así que «tengo N y el relevo tiene
   * N» no demuestra que tengamos lo mismo. Si la mesa deshace y juega otra cosa
   * dentro del mismo segundo, los totales coinciden y las colas difieren; con
   * `desde=N` esa divergencia sería invisible y permanente, que es exactamente
   * el fallo que esta tarea existe para impedir. Traer el registro entero cuesta
   * unas decenas de acciones por segundo —nada— y lo que llega del relevo manda
   * siempre sobre lo local.
   */
  async sondear(): Promise<boolean> {
    const res = await this.transporte.leer(this.codigo, 0);
    // Una wifi caída no es un estado: se reintenta al siguiente tic.
    if (!res.ok) return false;
    const recibidas = res.valor.entradas.map((e) => e.accion);
    if (JSON.stringify(recibidas) === JSON.stringify(this.acciones_)) return false;
    this.acciones_ = recibidas;
    this.estado_ = repetir(this.inicial, recibidas);
    this.avisar();
    return true;
  }

  arrancar(): void {
    if (this.temporizador) return;
    this.temporizador = setInterval(() => void this.sondear(), MS_ENTRE_SONDEOS);
  }

  parar(): void {
    if (!this.temporizador) return;
    clearInterval(this.temporizador);
    this.temporizador = null;
  }

  /**
   * Envía una acción, reconciliando si hace falta.
   *
   * El 409 no es un error, es el caso normal de dos jugadores a la vez: se
   * incorpora lo que faltaba, se vuelve a comprobar que la acción sigue siendo
   * legal —y que sigue tocándole a quien envía, que el turno puede haber
   * cambiado— y solo entonces se reenvía. Si ya no es legal, se devuelve el
   * motivo para la pantalla en vez de reintentar en bucle. El bucle no puede
   * girar para siempre: cada vuelta que no entra incorpora acciones, y con cada
   * una el `esperado` crece.
   */
  async enviar(accion: Accion): Promise<Resultado<null>> {
    for (;;) {
      if (!this.puedeActuar()) {
        return { ok: false, motivo: "No es el turno de ninguna de tus figuras." };
      }
      const legal = aplicarAccion(this.estado_, accion);
      if (!legal.ok) return { ok: false, motivo: legal.motivo };

      const esperado = this.acciones_.length;
      const res = await this.transporte.enviar(this.codigo, {
        esperado,
        accion,
        autor: this.jugador,
      });

      if (res.ok) {
        // Mientras se esperaba la respuesta pudo terminar un sondeo y traer ya
        // esta misma acción: solo se apunta si la lista sigue como se envió,
        // para no apuntarla dos veces. Si no, el registro del relevo manda y el
        // sondeo lo trae.
        if (this.acciones_.length === esperado) {
          this.acciones_ = [...this.acciones_, accion];
          this.estado_ = repetir(this.estado_, [accion]);
          this.avisar();
        } else {
          await this.sondear();
        }
        return { ok: true, valor: null };
      }

      // Sin `entradas` no es un «te quedaste atrás»: es la red caída, un código
      // que no existe o una versión distinta, y reintentar no lo arregla.
      if (res.entradas === undefined) return { ok: false, motivo: res.motivo };
      this.acciones_ = [...this.acciones_, ...res.entradas.map((e) => e.accion)];
      this.estado_ = repetir(this.estado_, res.entradas.map((e) => e.accion));
      this.avisar();
    }
  }

  /**
   * El deshacer, que en red es truncar el registro. Solo la mesa: en las demás
   * pantallas el botón no está, y aunque estuviera, sin el secreto el relevo
   * también lo rechaza. Un 409 aquí no se reintenta solo: si alguien jugó
   * mientras tanto, «la última acción» ya es otra y deshacerla a ciegas
   * desharía una jugada que la mesa no ha visto.
   */
  async truncar(): Promise<Resultado<null>> {
    if (!this.secreto) return { ok: false, motivo: "Solo la mesa puede deshacer." };
    if (this.acciones_.length === 0) return { ok: false, motivo: "No hay nada que deshacer." };

    const esperado = this.acciones_.length;
    const res = await this.transporte.truncar(this.codigo, { esperado, secreto: this.secreto });
    if (res.ok) {
      if (this.acciones_.length === esperado) {
        this.acciones_ = this.acciones_.slice(0, -1);
        this.estado_ = repetir(this.inicial, this.acciones_);
        this.avisar();
      } else {
        await this.sondear();
      }
      return { ok: true, valor: null };
    }
    if (res.entradas !== undefined) {
      this.acciones_ = [...this.acciones_, ...res.entradas.map((e) => e.accion)];
      this.estado_ = repetir(this.estado_, res.entradas.map((e) => e.accion));
      this.avisar();
    }
    return { ok: false, motivo: res.motivo };
  }
}

// -------------------------------------------------------- entrar en partida

/** Crea la partida en el relevo. Quien crea es la mesa: se queda el secreto
 * que autoriza a deshacer y juega como `MESA` en el reparto. */
export async function crear(transporte: Transporte, montaje: Montaje): Promise<Resultado<SesionDeRed>> {
  const partida = partidaDelMontaje(montaje);
  if (!partida.ok) return { ok: false, motivo: partida.motivo };
  const res = await transporte.crear(montaje);
  if (!res.ok) return { ok: false, motivo: res.motivo };
  return {
    ok: true,
    valor: new SesionDeRed(
      transporte,
      res.valor.codigo,
      montaje,
      partida.valor,
      MESA,
      [],
      res.valor.secreto,
    ),
  };
}

/** Se une a una partida que ya existe, con el código que la mesa dictó. */
export async function unirse(
  transporte: Transporte,
  codigo: string,
  jugador: string,
): Promise<Resultado<SesionDeRed>> {
  const res = await transporte.leer(codigo, 0);
  if (!res.ok) return { ok: false, motivo: res.motivo };
  const { montaje, entradas } = res.valor;
  // La trampa de la versión, del lado de quien se une: el relevo la comprueba
  // al crear, pero quien entra después puede llevar una pestaña vieja, y dos
  // casas con código distinto aplican reglas distintas a las mismas acciones.
  if (montaje.version !== VERSION) {
    return {
      ok: false,
      motivo: "Esta partida se creó con otra versión de la aplicación; recarga la página.",
    };
  }
  const partida = partidaDelMontaje(montaje);
  if (!partida.ok) return { ok: false, motivo: partida.motivo };
  return {
    ok: true,
    valor: new SesionDeRed(
      transporte,
      codigo,
      montaje,
      partida.valor,
      jugador,
      entradas.map((e) => e.accion),
    ),
  };
}
