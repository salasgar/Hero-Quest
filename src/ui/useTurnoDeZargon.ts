/**
 * El turno de Zargon, sin un solo clic.
 *
 * La decisión ya estaba escrita y probada —`accionDeZargon`, de T8 y T9—; lo que
 * faltaba era despacharla al ritmo de la mesa. Esto es solo el ritmo: aquí no se
 * decide ninguna jugada, se decide **cuándo** se juega la que la IA ya ha
 * elegido.
 *
 * Tres cosas gobiernan el diseño, y las tres salen de jugar y no de programar:
 *
 * 1. **Una acción cada vez, nunca el turno entero de golpe.** `turnoDeZargon`
 *    resuelve las seis activaciones en un suspiro y devuelve el estado final;
 *    eso sirve para medir (T10) y es inservible en la mesa, porque nadie sabe
 *    qué acaba de pasar y hay que reconstruirlo leyendo el diario hacia atrás.
 *    Se va acción a acción, y entre una y otra se espera.
 * 2. **La espera la marca lo que se acaba de hacer**, no un número fijo. Mover
 *    pide más que activar: hay una miniatura de cartón que alguien tiene que
 *    empujar con el dedo, y ese gesto dura lo que dura.
 * 3. **Todo pasa por `ejecutar`**, que es `usePartida`. Es lo que hace que el
 *    deshacer siga siendo exacto durante el turno de Zargon: la partida se
 *    rehace repitiendo la lista de acciones, y una acción que entrara por otro
 *    camino no estaría en la lista. Por eso este fichero no llama nunca a
 *    `aplicarAccion`.
 *
 * Lo que **no** es de aquí: a quién ataca cada monstruo y por dónde va es
 * `src/ai/`, y no se toca. Quién tira los dados tampoco cambia: los de los
 * monstruos los tira la aplicación y los de los héroes se tiran de verdad en la
 * mesa, así que un ataque de monstruo sale por `pedirAtaque` —el mismo camino
 * que si lo hubiera pulsado el adulto— y el automatismo se para solo mientras
 * hay un dado en la mano de alguien.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { accionDeZargon, type Dificultad } from "../ai/difficulty";
import type { Accion, EstadoPartida, Evento } from "../engine/types";

/** Automático: se va solo. Paso: avanza cuando se le dice. */
export type ModoDeZargon = "automatico" | "paso";

/**
 * Lo que se espera **después** de cada acción, en milisegundos.
 *
 * La regla es una sola, y conviene tenerla delante antes de tocar un número:
 * **lo que se espera después de una acción es lo que la mesa tiene que hacer o
 * leer con lo que esa acción ha dejado en pantalla.** No es «lo importante que
 * fue la acción»; es cuánto trabajo le ha dado a las personas.
 *
 * - `mover` es el más largo: es el único que deja algo físico pendiente, empujar
 *   la miniatura de cartón hasta la casilla que se acaba de pintar. Con menos de
 *   esto, la aplicación adelanta a la mano.
 * - `terminarTurno` es el segundo, y esto es lo que se hace mal a la primera:
 *   parece el trámite de cerrar una activación, pero lo que aparece justo
 *   después es **el anuncio del monstruo siguiente** —«le toca al orco: ya te
 *   tiene a tiro»—, que es la frase que hace que un niño entienda el turno. Si
 *   esta espera es corta, esa frase pasa sin que dé tiempo a leerla y el turno
 *   vuelve a ser incomprensible, que es justo lo que T11 venía a arreglar.
 * - `activarMonstruo` puede ser corto: lo que deja en pantalla es la figura
 *   marcada como activa, y el anuncio ya se leyó antes de activarla.
 * - `atacar` es corto **a propósito**, aunque sea lo más importante que pasa:
 *   cuando un monstruo pega a un héroe, la mesa teclea sus dados de defensa y
 *   luego cierra el aviso de la tirada. Ese trámite lo marca una persona y ya es
 *   más lento que cualquier espera de aquí; sumarle otra sería esperar dos veces
 *   por lo mismo.
 *
 * No son valores medidos: son los de jugar mirando el reloj de reojo, y están
 * para cambiarse. Lo que no debería cambiarse sin pensarlo es el orden entre
 * ellos, que es lo que prueba `turno-automatico.test.ts`.
 */
export const PAUSA_TRAS: Readonly<Record<string, number>> = {
  mover: 1800,
  terminarTurno: 1500,
  atacar: 1200,
  activarMonstruo: 900,
};

/** Lo que espera una acción que no esté en la tabla. */
export const PAUSA_POR_DEFECTO = 1000;

/**
 * Lo que se espera antes de la primera acción del turno de Zargon.
 *
 * Es larga por el mismo motivo que `terminarTurno`: lo que hay en pantalla al
 * empezar el turno de Zargon es el anuncio de a quién le toca, y hay que dejarlo
 * leer antes de mover nada.
 */
export const PAUSA_AL_EMPEZAR = 1500;

/** Cuánto se espera tras `accion`; `null` es «todavía no ha hecho nada». */
export const pausaTras = (accion: Accion | null): number =>
  accion === null ? PAUSA_AL_EMPEZAR : (PAUSA_TRAS[accion.tipo] ?? PAUSA_POR_DEFECTO);

/**
 * Tope de acciones en un mismo turno de Zargon.
 *
 * Es la misma red de seguridad que `turnoDeZargon` lleva dentro, y por el mismo
 * motivo: si una combinación de reglas dejara a la IA proponiendo acciones para
 * siempre, en un bucle de simulación se cuelga un test y aquí se cuelga la
 * partida, con cuatro niños delante. Si salta, hay un fallo que mirar; no es una
 * regla del juego.
 */
export const TOPE_DE_ACCIONES = 200;

export interface OpcionesTurnoDeZargon {
  estado: EstadoPartida;
  /**
   * Si a esta pantalla le toca mover a los monstruos. En la mesa, durante el
   * turno de Zargon; en la de quien juega desde su casa, nunca. Es lo que evita
   * que dos navegadores despachen la misma jugada dos veces.
   */
  activo: boolean;
  /**
   * Si hay algo en pantalla esperando a una persona: el diálogo de dados o el
   * aviso de lo que ha salido. Mientras lo haya, el automatismo no avanza —sería
   * jugar por encima de quien tiene los dados en la mano—.
   */
  ocupado: boolean;
  nivel: Dificultad;
  ejecutar: (a: Accion) => Evento[] | null;
  /**
   * El camino de siempre de un ataque, con su diálogo de dados si toca. Un
   * ataque de monstruo no se despacha desde aquí: se pide por aquí, igual que si
   * lo hubiera pulsado el adulto, y así el reparto de los dados es uno solo.
   */
  pedirAtaque: (idObjetivo: string) => void;
}

export interface TurnoDeZargon {
  modo: ModoDeZargon;
  cambiarModo: (m: ModoDeZargon) => void;
  /** Si ahora mismo hay una cuenta atrás corriendo hacia la próxima jugada. */
  enMarcha: boolean;
  pausado: boolean;
  pausar: () => void;
  reanudar: () => void;
  /** Juega la siguiente acción ya, sin esperar. Es el botón de «paso a paso». */
  siguiente: () => void;
  /** La jugada que Zargon va a hacer, para poder anunciarla antes de hacerla. */
  proxima: Accion | null;
  /** Qué se ha roto, si se ha roto algo. Con esto puesto, el automatismo no anda. */
  averia: string | null;
}

export function useTurnoDeZargon({
  estado,
  activo,
  ocupado,
  nivel,
  ejecutar,
  pedirAtaque,
}: OpcionesTurnoDeZargon): TurnoDeZargon {
  const [modo, setModo] = useState<ModoDeZargon>("automatico");
  const [pausado, setPausado] = useState(false);
  const [averia, setAveria] = useState<string | null>(null);
  /** La última acción despachada, que es la que decide cuánto se espera ahora. */
  const [ultima, setUltima] = useState<Accion | null>(null);
  const pasos = useRef(0);

  // La jugada se calcula del estado, como todo lo demás de esta pantalla: un
  // monstruo que cae a mitad del turno cambia lo que va a hacer el siguiente, y
  // guardarla en un estado propio sería tener dos verdades.
  const proxima = useMemo(
    () => (activo ? accionDeZargon(estado, nivel) : null),
    [activo, estado, nivel],
  );

  // Cada turno de Zargon empieza de cero. La pausa se levanta a propósito: es
  // «espera un momento», no una preferencia —esa es `modo`—, y arrastrarla al
  // turno siguiente deja la partida parada sin que se vea por qué.
  useEffect(() => {
    if (activo) return;
    pasos.current = 0;
    setUltima(null);
    setPausado(false);
    setAveria(null);
  }, [activo]);

  const paso = useCallback(() => {
    if (!proxima) return;
    if (pasos.current >= TOPE_DE_ACCIONES) {
      setAveria(
        `Zargon lleva ${TOPE_DE_ACCIONES} acciones en el mismo turno: algo va mal. ` +
          "Mueve tú a los monstruos y anótalo.",
      );
      return;
    }
    pasos.current += 1;
    setUltima(proxima);

    // Un ataque tiene que pasar por donde pasan todos, porque por ahí es por
    // donde se le piden a la mesa los dados de defensa del héroe.
    if (proxima.tipo === "atacar") {
      pedirAtaque(proxima.objetivo);
      return;
    }

    // Si el motor rechaza lo que la IA acaba de proponer, el fallo es de la IA.
    // Se para en vez de insistir: insistir con un temporizador de por medio no
    // es un error, es un bucle, y en la mesa se ve como una aplicación colgada.
    if (!ejecutar(proxima)) {
      setAveria("Zargon ha propuesto una jugada que el motor no acepta. Muévelo tú y anótalo.");
    }
  }, [proxima, ejecutar, pedirAtaque]);

  const enMarcha = activo && modo === "automatico" && !pausado && !ocupado && !averia && !!proxima;

  useEffect(() => {
    if (!enMarcha) return;
    const t = setTimeout(paso, pausaTras(ultima));
    return () => clearTimeout(t);
  }, [enMarcha, paso, ultima]);

  return {
    modo,
    cambiarModo: setModo,
    enMarcha,
    pausado,
    pausar: useCallback(() => setPausado(true), []),
    reanudar: useCallback(() => {
      setPausado(false);
      setAveria(null);
    }, []),
    siguiente: paso,
    proxima,
    averia,
  };
}
