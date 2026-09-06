/**
 * Las acciones de un turno: lo que comparten la pantalla de la mesa y la de
 * quien juega desde su casa.
 *
 * Aquí vive todo lo que hay entre pulsar algo y despachar una acción: los
 * diálogos de dados, el hechizo a medio lanzar, el teclado y el reparto de quién
 * tira qué. Las dos pantallas son productos distintos y se pintan distinto, pero
 * **un ataque es un ataque en las dos**, y tenerlo escrito dos veces es cómo se
 * llega a que en una casa el foso descuente un dado y en la otra no.
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
import { MONSTRUOS } from "../data/monsters";
import { HECHIZOS, type IdHechizo } from "../data/spells";
import { figuraPorId } from "../engine/board";
import { dadosDeDefensa } from "../engine/combat";
import {
  casillasDeMovimiento,
  dadosDeAtaqueContra,
  esTurnoDeZargon,
  figuraActiva,
  hechizosLanzables,
  monstruosPorActivar,
  objetivosDeAtaque,
  puertasAlAlcance,
} from "../engine/selectors";
import { esHeroe, type Accion, type Celda, type EstadoPartida, type Evento, type Figura } from "../engine/types";
import { calaveras, escudosBlancos, type PeticionDados } from "./DiceInput";

const rango = (desde: number, hasta: number) =>
  Array.from({ length: hasta - desde + 1 }, (_, i) => desde + i);

export const nombreDeFigura = (f: Figura) => (esHeroe(f) ? f.nombre : MONSTRUOS[f.especie].nombre);

export interface OpcionesDeTurno {
  estado: EstadoPartida;
  ejecutar: (a: Accion) => Evento[] | null;
  deshacer: () => void;
  /** Si el turno es de una figura que lleva quien mira esta pantalla. */
  puedeActuar: boolean;
}

export function useAccionesDeTurno({ estado, ejecutar, deshacer, puedeActuar }: OpcionesDeTurno) {
  const [peticion, setPeticion] = useState<PeticionDados | null>(null);
  /** El hechizo elegido que todavía no sabe a quién va. */
  const [hechizoElegido, setHechizoElegido] = useState<IdHechizo | null>(null);

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

  const cerrar = useCallback(() => setPeticion(null), []);
  const cancelarHechizo = useCallback(() => setHechizoElegido(null), []);

  /**
   * El reparto de los dados: los héroes tiran los suyos de verdad en la mesa y
   * aquí solo se teclea el resultado; los de los monstruos los tira la
   * aplicación, que para eso hace de máster.
   */
  const pedirAtaque = useCallback(
    (idObjetivo: string) => {
      const atacante = figuraActiva(estado);
      const objetivo = figuraPorId(estado, idObjetivo);
      if (!atacante || !objetivo) return;

      if (esHeroe(atacante)) {
        const n = dadosDeAtaqueContra(estado, objetivo);
        setPeticion({
          titulo: `${atacante.nombre} ataca`,
          detalle: `Contra ${nombreDeFigura(objetivo)} · defensa ${dadosDeDefensa(objetivo, estado)}`,
          instruccion: `Tira ${n} dados de combate. ¿Cuántas calaveras?`,
          opciones: rango(0, n),
          alResponder: (k) => {
            ejecutar({ tipo: "atacar", objetivo: idObjetivo, dadosAtaque: calaveras(n, k) });
            cerrar();
          },
          alCancelar: cerrar,
        });
      } else {
        // Con el estado: el foso le quita un dado de defensa y el diálogo
        // tiene que pedir los que se van a tirar de verdad, ni uno más.
        const d = dadosDeDefensa(objetivo, estado);
        setPeticion({
          titulo: `${nombreDeFigura(atacante)} ataca a ${nombreDeFigura(objetivo)}`,
          detalle: `Ataca con ${dadosDeAtaqueContra(estado, objetivo)} dados. Los tira la aplicación.`,
          instruccion: `Tira tus ${d} dados de defensa. ¿Cuántos escudos blancos?`,
          opciones: rango(0, d),
          alResponder: (k) => {
            ejecutar({ tipo: "atacar", objetivo: idObjetivo, dadosDefensa: escudosBlancos(d, k) });
            cerrar();
          },
          alCancelar: cerrar,
        });
      }
    },
    [estado, ejecutar, cerrar],
  );

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
   * - **Genio** (`invocar`): son cinco dados de combate del bando de los héroes,
   *   y en esta mesa los dados de los héroes se tiran de verdad. Es el único
   *   hechizo que abre diálogo; `resolverDanoDirecto` acepta esos dados justo
   *   para esto. Si se cancela, el hechizo no se gasta: no se despacha nada.
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
      const n = h.efecto.dados;
      const objetivo = figuraPorId(estado, idObjetivo);
      setPeticion({
        titulo: h.nombre,
        detalle: objetivo ? `Contra ${nombreDeFigura(objetivo)}` : "",
        instruccion: `Tira ${n} dados de combate por el genio. ¿Cuántas calaveras?`,
        opciones: rango(0, n),
        alResponder: (k) => {
          ejecutar({ tipo: "lanzarHechizo", hechizo, objetivo: idObjetivo, dados: calaveras(n, k) });
          cerrar();
        },
        alCancelar: cerrar,
      });
    },
    [estado, ejecutar, cerrar],
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
    setPeticion({
      titulo: "Tirada de movimiento",
      detalle: "",
      instruccion: "Tira los dos dados rojos. ¿Cuánto suman?",
      opciones: rango(2, 12),
      alResponder: (total) => {
        // Se guarda como [total, 0]: solo conocemos la suma, no cada dado.
        ejecutar({ tipo: "tirarMovimiento", dados: [total, 0] });
        cerrar();
      },
      alCancelar: cerrar,
    });
  }, [ejecutar, cerrar]);

  const mover = useCallback(
    (destino: Celda) => {
      ejecutar({ tipo: "mover", destino });
    },
    [ejecutar],
  );

  const alPulsarFigura = useCallback(
    (id: string) => {
      // Con un hechizo a medio lanzar, el tablero señala objetivos suyos, no de
      // ataque: pulsar una figura completa el hechizo.
      if (pendiente) {
        if (pendiente.objetivos.some((o) => o.id === id)) lanzar(pendiente.hechizo, id);
        return;
      }
      if (esZargon && porActivar.some((m) => m.id === id)) {
        ejecutar({ tipo: "activarMonstruo", monstruo: id });
        return;
      }
      if (objetivos.some((o) => o.id === id)) pedirAtaque(id);
    },
    [pendiente, lanzar, esZargon, porActivar, objetivos, ejecutar, pedirAtaque],
  );

  // ---- teclado: es la entrada rápida, más que el ratón ----
  useEffect(() => {
    if (peticion) return; // mientras se piden dados, manda el diálogo
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
      const paso: Record<string, [number, number]> = {
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
      };
      const dir = paso[ev.key];
      if (dir && activa) {
        ev.preventDefault();
        mover({ x: activa.celda.x + dir[0], y: activa.celda.y + dir[1] });
        return;
      }
      const tecla = ev.key.toLowerCase();
      if (tecla === "t" && !esZargon && estado.turno.movimientoTotal === null) {
        ev.preventDefault();
        if (ev.shiftKey) ejecutar({ tipo: "tirarMovimiento" });
        else pedirMovimiento();
      } else if (tecla === "a" && objetivos.length > 0) {
        ev.preventDefault();
        pedirAtaque(objetivos[0]!.id);
      } else if (tecla === "p" && puertas.length > 0) {
        ev.preventDefault();
        ejecutar({ tipo: "abrirPuerta", puerta: puertas[0]!.id });
      } else if (tecla === "b") {
        ev.preventDefault();
        ejecutar({ tipo: "buscarTesoro" });
      } else if (tecla === "r") {
        ev.preventDefault();
        ejecutar({ tipo: "buscarTrampas" });
      } else if (tecla === "h" && hechizos.length > 0) {
        // T, A, P, B, R y Z estaban cogidas; H no.
        ev.preventDefault();
        elegirHechizo(hechizos[0]!.hechizo);
      } else if (tecla === "z") {
        ev.preventDefault();
        deshacer();
      } else if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        // Enter activa al que ha elegido Zargon, no al primero de la lista del
        // fichero de la misión, que era lo que hacía antes.
        if (esZargon && !activa && porActivar[0]) {
          ejecutar({ tipo: "activarMonstruo", monstruo: porActivar[0].id });
        } else {
          ejecutar({ tipo: "terminarTurno" });
        }
      }
    };
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [
    peticion, puedeActuar, activa, esZargon, estado.turno.movimientoTotal, objetivos, puertas,
    porActivar, hechizos, hechizoElegido, mover, ejecutar, deshacer, pedirAtaque,
    pedirMovimiento, elegirHechizo, cancelarHechizo,
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
    peticion,
    mover,
    alPulsarFigura,
    pedirAtaque,
    pedirMovimiento,
    elegirHechizo,
    lanzar,
    cancelarHechizo,
  };
}
