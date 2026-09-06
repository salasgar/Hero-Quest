/**
 * Las acciones de un turno: lo que comparten la pantalla de la mesa y la de
 * quien juega desde su casa.
 *
 * Aquí vive todo lo que hay entre pulsar algo y despachar una acción: el aviso
 * de lo que ha salido al tirar (T36: siempre tira la aplicación, no hay
 * diálogo que pida un número), el hechizo a medio lanzar y el teclado. Las dos
 * pantallas son productos distintos y se pintan distinto, pero **un ataque es
 * un ataque en las dos**, y tenerlo escrito dos veces es cómo se llega a que en
 * una casa el foso descuente un dado y en la otra no.
 *
 * Salió de `Juego.tsx` al escribir T32, sin cambiarle el comportamiento: es el
 * mismo código, en un sitio donde lo alcanzan los dos.
 *
 * **`puedeActuar` no es «soy la pantalla de casa».** Es «el turno es de una
 * figura que llevo yo», y en la mesa también vale que sea `false`: durante el
 * turno de Zargon, la pantalla de quien juega desde su casa no ofrece nada. Esa
 * distinción importa: una bandera que dijera «soy remoto» acabaría repartida por
 * seis sitios, y por uno de ellos se colaría una sala sin abrir.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Dificultad } from "../ai/difficulty";
import { MONSTRUOS } from "../data/monsters";
import { HECHIZOS, type IdHechizo } from "../data/spells";
import { figuraPorId } from "../engine/board";
import {
  casillasDeMovimiento,
  esTurnoDeZargon,
  figuraActiva,
  hechizosLanzables,
  monstruosPorActivar,
  objetivosDeAtaque,
  puertasAlAlcance,
} from "../engine/selectors";
import {
  esHeroe,
  type Accion,
  type Celda,
  type EstadoPartida,
  type Evento,
  type Figura,
  type TipoTrampa,
} from "../engine/types";
import { type TiradaHecha } from "./DiceInput";
import { useTurnoDeZargon, type TurnoDeZargon } from "./useTurnoDeZargon";

export const nombreDeFigura = (f: Figura) => (esHeroe(f) ? f.nombre : MONSTRUOS[f.especie].nombre);

/**
 * Si los mandos de héroe —atacar, abrir puerta, buscar, hechizos, terminar
 * turno, las casillas verdes del tablero y el teclado que los dispara— tienen
 * que estar en pantalla. Una sola regla, en un sitio, porque la comparten
 * `TurnPanel.tsx` (qué botones pinta) y `Juego.tsx` (qué le pasa a
 * `BoardMirror`), y aquí mismo, para el teclado.
 *
 * Fuera del turno de Zargon, siempre. Durante su turno, solo si el máster ha
 * tomado el mando —pausa o avería—: entonces puede mover a mano al monstruo
 * activo con los mismos mandos que un héroe. En automático, no: son
 * herramientas para manejar a los héroes, y los monstruos actúan solos o los
 * mueve el máster, nunca los niños con un clic.
 */
export function mandosDeHeroe(
  estado: EstadoPartida,
  zargon: Pick<TurnoDeZargon, "pausado" | "averia"> | null | undefined,
): boolean {
  if (!esTurnoDeZargon(estado)) return true;
  return !!zargon && (zargon.pausado || zargon.averia !== null);
}

/** Qué decir cuando una trampa se dispara al mover, por tipo. */
const FRASE_TRAMPA: Readonly<Record<TipoTrampa, (quien: string) => string>> = {
  foso: (quien) => `El foso se traga a ${quien}`,
  lanza: (quien) => `Una lanza alcanza a ${quien}`,
  bloque: (quien) => `Un bloque cae sobre ${quien}`,
};

export interface OpcionesDeTurno {
  estado: EstadoPartida;
  ejecutar: (a: Accion) => Evento[] | null;
  deshacer: () => void;
  /** Si el turno es de una figura que lleva quien mira esta pantalla. */
  puedeActuar: boolean;
  /**
   * Si esta pantalla juega sola el turno de Zargon.
   *
   * Solo la de la mesa (T11). Va apagado por defecto porque encenderlo en dos
   * pantallas a la vez es el fallo caro: las dos despacharían la misma jugada y
   * el relevo vería el turno de Zargon jugado dos veces. Quien lo enciende es
   * `Juego.tsx`, y `puedeActuar` remata el cierre —durante el turno de Zargon
   * solo la mesa lo tiene en verdadero—.
   */
  zargonAutomatico?: boolean;
  /** A qué nivel juega Zargon. `normal` es la hipótesis de T8 tal cual. */
  nivelDeZargon?: Dificultad;
}

export function useAccionesDeTurno({
  estado,
  ejecutar,
  deshacer,
  puedeActuar,
  zargonAutomatico = false,
  nivelDeZargon = "normal",
}: OpcionesDeTurno) {
  /** El hechizo elegido que todavía no sabe a quién va. */
  const [hechizoElegido, setHechizoElegido] = useState<IdHechizo | null>(null);
  /** Lo que salió la última vez que tiró la aplicación, mientras se enseña. */
  const [tirada, setTirada] = useState<TiradaHecha | null>(null);

  /**
   * Despacha una acción **sin dados** —los tira el motor, con el generador que
   * lleva el estado dentro— y enseña lo que ha salido.
   *
   * Que la tirada salga del `rng` del estado y no de `Math.random()` es lo que
   * mantiene todo lo demás en pie: el deshacer sigue siendo exacto y las dos
   * casas siguen viendo la misma partida. Por eso «que los tire la aplicación»
   * es exactamente la misma acción, sin el campo `dados`.
   */
  const tirarYEnsenar = useCallback(
    (accion: Accion, titulo: string) => {
      const eventos = ejecutar(accion);
      if (!eventos) return;

      const ataque = eventos.find((ev) => ev.tipo === "ataque");
      if (ataque && ataque.tipo === "ataque") {
        const caras = [...ataque.dadosAtaque, ...ataque.dadosDefensa];
        setTirada({
          titulo,
          caras,
          resumen:
            `${ataque.calaveras} ${ataque.calaveras === 1 ? "calavera" : "calaveras"}` +
            ` · ${ataque.escudos} ${ataque.escudos === 1 ? "escudo" : "escudos"}` +
            ` · ${ataque.dano === 0 ? "sin daño" : `${ataque.dano} de daño`}`,
        });
        return;
      }

      const movimiento = eventos.find((ev) => ev.tipo === "tiradaMovimiento");
      if (movimiento && movimiento.tipo === "tiradaMovimiento") {
        setTirada({ titulo, resumen: `${movimiento.total} casillas` });
        return;
      }

      const hechizo = eventos.find((ev) => ev.tipo === "danoDeHechizo");
      if (hechizo && hechizo.tipo === "danoDeHechizo") {
        setTirada({
          titulo,
          caras: hechizo.dados,
          resumen: hechizo.dano === 0 ? "sin daño" : `${hechizo.dano} de daño`,
        });
      }
    },
    [ejecutar],
  );

  const activa = figuraActiva(estado);
  const esZargon = esTurnoDeZargon(estado);

  // Los selectores van sobre el estado **completo**, nunca sobre el que devuelve
  // la niebla: son los que deciden qué es legal, y tienen que contestar lo mismo
  // que el motor. Recortarlos aquí produciría botones que el motor rechaza, que
  // en la mesa es un clic perdido y una discusión.
  const movimiento = casillasDeMovimiento(estado);
  const objetivos = objetivosDeAtaque(estado);
  const puertas = puertasAlAlcance(estado);
  const porActivar = monstruosPorActivar(estado);

  // Solo los que tienen a alguien a la vista: los demás no se pintan, para que
  // no haya un botón que el motor vaya a rechazar.
  const hechizos = useMemo(
    () => hechizosLanzables(estado).filter((h) => h.objetivos.length > 0),
    [estado],
  );
  const pendiente = hechizos.find((h) => h.hechizo === hechizoElegido) ?? null;
  const hechizosEnMano = activa && esHeroe(activa) ? activa.hechizos.length : 0;

  const cancelarHechizo = useCallback(() => setHechizoElegido(null), []);

  /**
   * Desde T36 los dados los tira siempre la aplicación: no hay nada que pedir,
   * solo despachar y enseñar lo que ha salido.
   */
  const pedirAtaque = useCallback(
    (idObjetivo: string) => {
      const atacante = figuraActiva(estado);
      const objetivo = figuraPorId(estado, idObjetivo);
      if (!atacante || !objetivo) return;

      tirarYEnsenar(
        { tipo: "atacar", objetivo: idObjetivo },
        esHeroe(atacante)
          ? `${atacante.nombre} ataca a ${nombreDeFigura(objetivo)}`
          : `${nombreDeFigura(atacante)} ataca a ${nombreDeFigura(objetivo)}`,
      );
    },
    [estado, tirarYEnsenar],
  );

  // ---- el turno de Zargon, que se juega solo (T11) ----
  // Va aquí y no más abajo, junto al resto de `useState`, porque `mandos` —y
  // con él `alPulsarFigura` y el teclado— lo necesitan antes de definirse.
  const zargon = useTurnoDeZargon({
    estado,
    // `puedeActuar` es lo que distingue la mesa de la pantalla de casa durante
    // el turno de Zargon; sin él, los dos navegadores jugarían la misma jugada.
    activo: zargonAutomatico && esZargon && puedeActuar && !estado.desenlace,
    // Mientras se enseña una tirada, la aplicación no juega por encima: es el
    // mismo cierre que usa el teclado unas líneas más abajo.
    ocupado: tirada !== null,
    nivel: nivelDeZargon,
    ejecutar,
    pedirAtaque,
  });

  // Fuera del turno de Zargon, siempre; en su turno, solo con el máster al
  // mando. Gobierna el teclado, `alPulsarFigura` y lo que devuelve el hook
  // para que `TurnPanel.tsx` y `Juego.tsx` pinten lo mismo que aceptan aquí.
  const mandos = mandosDeHeroe(estado, zargon);

  /**
   * Lanzar, ya con el objetivo decidido.
   *
   * Quién tira qué, leído en `lanzarHechizo` del reductor antes de montar nada:
   *
   * - **Bola de fuego y fuego de la ira** (`danoConSalvacion`): los dados de
   *   salvación los tira **quien recibe**, y los dos hechizos apuntan a un
   *   enemigo, así que siempre los tira la aplicación. No hay nada que pedir.
   * - **Viento veloz** (`movimientoExtra`): no tira nada al lanzarse. Los dos
   *   dados de más los añade `tirarMovimientoAccion` cuando el héroe tira su
   *   movimiento, y esa tirada ya pasa por `pedirMovimiento`.
   * - **Genio** (`invocar`): son cinco dados de combate del bando de los héroes.
   *   Desde T36 los tira la aplicación como cualquier otro, y se enseñan con
   *   `tirarYEnsenar`.
   * - Los demás no tiran dados en absoluto.
   */
  const lanzar = useCallback(
    (hechizo: IdHechizo, idObjetivo: string) => {
      setHechizoElegido(null);
      const h = HECHIZOS[hechizo];
      if (h.efecto.clase !== "invocar") {
        ejecutar({ tipo: "lanzarHechizo", hechizo, objetivo: idObjetivo });
        return;
      }
      tirarYEnsenar({ tipo: "lanzarHechizo", hechizo, objetivo: idObjetivo }, h.nombre);
    },
    [ejecutar, tirarYEnsenar],
  );

  /** Un objetivo: va directo. Varios: hay que señalar a quién. */
  const elegirHechizo = useCallback(
    (hechizo: IdHechizo) => {
      const entrada = hechizos.find((h) => h.hechizo === hechizo);
      if (!entrada || entrada.objetivos.length === 0) return;
      if (entrada.objetivos.length === 1) lanzar(hechizo, entrada.objetivos[0]!.id);
      else setHechizoElegido(hechizo);
    },
    [hechizos, lanzar],
  );

  const pedirMovimiento = useCallback(() => {
    tirarYEnsenar({ tipo: "tirarMovimiento" }, "Tirada de movimiento");
  }, [tirarYEnsenar]);

  const mover = useCallback(
    (destino: Celda) => {
      const eventos = ejecutar({ tipo: "mover", destino });
      if (!eventos) return;

      // Las trampas solo alcanzan a héroes (ver `reducer.ts`, «mover»), así que
      // este evento nunca llega desde el turno de Zargon: sus monstruos no
      // pasan por aquí, pasan por `paso()` de `useTurnoDeZargon`. Se enseña
      // como se enseña una tirada, y mientras el aviso está abierto Zargon
      // espera (`ocupado` ya lo cubre).
      const trampa = eventos.find((ev) => ev.tipo === "trampaDisparada");
      if (trampa && trampa.tipo === "trampaDisparada") {
        const figura = figuraPorId(estado, trampa.figura);
        const quien = figura ? nombreDeFigura(figura) : "alguien";
        setTirada({
          titulo: "¡Trampa!",
          resumen: `${FRASE_TRAMPA[trampa.tipoTrampa](quien)}: ${
            trampa.dano === 0 ? "sin daño" : `${trampa.dano} de daño`
          }`,
        });
      }
    },
    [ejecutar, estado],
  );

  const alPulsarFigura = useCallback(
    (id: string) => {
      // Con un hechizo a medio lanzar, el tablero señala objetivos suyos, no de
      // ataque: pulsar una figura completa el hechizo. Solo llega con
      // `pendiente` puesto si `mandos` ya era verdad cuando se eligió el
      // hechizo (el botón que lo elige está detrás de `mandos` en el panel).
      if (pendiente) {
        if (pendiente.objetivos.some((o) => o.id === id)) lanzar(pendiente.hechizo, id);
        return;
      }
      // Elegir a mano qué monstruo actúa es «Cambiar» con otro gesto: solo con
      // el máster al mando (T52 punto 2).
      if (esZargon && mandos && porActivar.some((m) => m.id === id)) {
        ejecutar({ tipo: "activarMonstruo", monstruo: id });
        return;
      }
      // Sin mandos, el tablero no señala objetivos y no hay nada que este
      // clic pueda disparar: sin este freno, pulsar la figura a pelo saltaba
      // el botón oculto y atacaba igual.
      if (mandos && objetivos.some((o) => o.id === id)) pedirAtaque(id);
    },
    [pendiente, lanzar, esZargon, mandos, porActivar, objetivos, ejecutar, pedirAtaque],
  );

  /**
   * Deshacer, parando antes a Zargon.
   *
   * Sin esto, el deshacer «no funciona» durante el turno de Zargon y encima no
   * se ve por qué: la acción se quita de la lista, el estado vuelve atrás y el
   * temporizador, que sigue vivo, vuelve a proponer exactamente la misma jugada
   * —la IA es determinista— y la despacha otra vez antes de que a nadie le dé
   * tiempo a mirar. Pararlo es lo que convierte el deshacer en lo que la mesa
   * espera de él.
   */
  const pausarZargon = zargon.pausar;
  const deshacerYPausar = useCallback(() => {
    pausarZargon();
    deshacer();
  }, [pausarZargon, deshacer]);

  // ---- teclado: es la entrada rápida, más que el ratón ----
  useEffect(() => {
    // Mientras se enseña lo que ha salido, el teclado calla: si no, el Intro
    // que cierra el aviso terminaría además el turno, porque los dos escuchan
    // la ventana.
    if (tirada) return;
    // Una pantalla a la que no le toca no escucha el teclado. Sin esto, quien
    // juega desde su casa movería la figura de otro con las flechas y el relevo
    // le devolvería un rechazo que no entendería.
    if (!puedeActuar) return;

    const alPulsar = (ev: KeyboardEvent) => {
      // Con un hechizo esperando objetivo, Escape lo suelta. Va antes que las
      // flechas: mientras se elige a quién, moverse sería perder la elección.
      if (ev.key === "Escape" && hechizoElegido) {
        ev.preventDefault();
        cancelarHechizo();
        return;
      }
      // Durante el turno de Zargon en automático, el teclado de los mandos de
      // héroe no existe: son herramientas para manejar a los héroes, y aquí no
      // hay ninguno de turno. Solo vuelve si el máster ha tomado el mando
      // (pausa o avería). No afecta a Z (deshacer, del máster) ni a Intro
      // (T11, «que juegue ya lo siguiente»), que se comprueban aparte.
      const paso: Record<string, [number, number]> = {
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
      };
      const dir = paso[ev.key];
      if (dir && activa && mandos) {
        ev.preventDefault();
        mover({ x: activa.celda.x + dir[0], y: activa.celda.y + dir[1] });
        return;
      }
      const tecla = ev.key.toLowerCase();
      if (tecla === "t" && mandos && !esZargon && estado.turno.movimientoTotal === null) {
        // Desde T36 no hay preferencia que mirar: T tira siempre por la
        // aplicación y enseña lo que ha salido. ⇧T quedó como el mismo gesto.
        ev.preventDefault();
        pedirMovimiento();
      } else if (tecla === "a" && mandos && objetivos.length > 0) {
        ev.preventDefault();
        pedirAtaque(objetivos[0]!.id);
      } else if (tecla === "p" && mandos && puertas.length > 0) {
        ev.preventDefault();
        ejecutar({ tipo: "abrirPuerta", puerta: puertas[0]!.id });
      } else if (tecla === "b" && mandos) {
        ev.preventDefault();
        ejecutar({ tipo: "buscarTesoro" });
      } else if (tecla === "r" && mandos) {
        ev.preventDefault();
        ejecutar({ tipo: "buscarTrampas" });
      } else if (tecla === "h" && mandos && hechizos.length > 0) {
        // T, A, P, B, R y Z estaban cogidas; H no.
        ev.preventDefault();
        elegirHechizo(hechizos[0]!.hechizo);
      } else if (tecla === "z") {
        ev.preventDefault();
        deshacerYPausar();
      } else if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        // Con el turno de Zargon automático, Intro es «que juegue ya lo
        // siguiente»: la jugada entera que ha elegido la IA, no solo activar al
        // monstruo. Es lo que hace usable el modo paso a paso, y en automático
        // sirve para adelantar una espera que se está haciendo larga. No pasa
        // por `mandos`: es un mando de Zargon, no de héroe, y sigue vivo en
        // pausa a propósito (T52 punto 4).
        if (zargonAutomatico && esZargon && !zargon.averia) {
          zargon.siguiente();
          return;
        }
        // Enter activa al que ha elegido Zargon, no al primero de la lista del
        // fichero de la misión, que era lo que hacía antes. Solo llega aquí en
        // avería (arriba exige `!zargon.averia`), que es cuando el máster tiene
        // el mando.
        if (esZargon && !activa && porActivar[0]) {
          ejecutar({ tipo: "activarMonstruo", monstruo: porActivar[0].id });
        } else if (mandos) {
          ejecutar({ tipo: "terminarTurno" });
        }
      }
    };
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [
    tirada, puedeActuar, activa, esZargon, estado, objetivos, puertas,
    porActivar, hechizos, hechizoElegido, mover, ejecutar, deshacerYPausar, pedirAtaque,
    pedirMovimiento, elegirHechizo, cancelarHechizo,
    zargonAutomatico, zargon, mandos,
  ]);

  return {
    activa,
    esZargon,
    movimiento,
    objetivos,
    puertas,
    porActivar,
    hechizos,
    hechizosEnMano,
    pendiente,
    mover,
    alPulsarFigura,
    pedirAtaque,
    pedirMovimiento,
    elegirHechizo,
    lanzar,
    cancelarHechizo,
    /** Lo que salió cuando tiró la aplicación, mientras se está enseñando. */
    tirada,
    cerrarTirada: useCallback(() => setTirada(null), []),
    /**
     * El turno de Zargon jugándose solo. En la pantalla de casa está ahí pero
     * apagado (`activo` en falso), y no hace nada.
     */
    zargon,
    /**
     * Deshacer. **Es el que hay que usar en los botones y en el teclado**: para
     * a Zargon antes, y sin eso el deshacer no se ve durante su turno.
     */
    deshacer: deshacerYPausar,
  };
}
