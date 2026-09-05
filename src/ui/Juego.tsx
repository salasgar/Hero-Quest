import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MISION_CALABOZO,
  MONSTRUOS_CALABOZO,
  MUEBLES_CALABOZO,
  PUERTAS_CALABOZO,
  TRAMPAS_CALABOZO,
} from "../data/quests/calabozo";
import { motivoDeActivacion, ordenDeActivacion } from "../ai/orden";
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
import type { HeroeElegido } from "../engine/partida";
import { esHeroe, type Celda, type Figura } from "../engine/types";
import { BoardMirror } from "./BoardMirror";
import { calaveras, DiceInput, escudosBlancos, type PeticionDados } from "./DiceInput";
import { HeroSheet } from "./HeroSheet";
import { MasterLog } from "./MasterLog";
import { TurnPanel } from "./TurnPanel";
import { usePartida } from "./usePartida";

const rango = (desde: number, hasta: number) =>
  Array.from({ length: hasta - desde + 1 }, (_, i) => desde + i);

const nombreDeFigura = (f: Figura) => (esHeroe(f) ? f.nombre : MONSTRUOS[f.especie].nombre);

/** El grupo con el que se juega si nadie elige: los cuatro de la caja. */
export const GRUPO_CLASICO: HeroeElegido[] = [
  { clase: "barbaro" },
  { clase: "enano" },
  { clase: "elfo", elementos: ["agua"] },
  { clase: "mago", elementos: ["fuego", "tierra", "aire"] },
];

export function Juego({ heroes = GRUPO_CLASICO }: { heroes?: HeroeElegido[] }) {
  const { estado, ejecutar, deshacer, reiniciar, error, limpiarError, puedeDeshacer } = usePartida({
    mision: MISION_CALABOZO,
    heroes,
    monstruos: MONSTRUOS_CALABOZO,
    puertas: PUERTAS_CALABOZO,
    muebles: MUEBLES_CALABOZO,
    trampas: TRAMPAS_CALABOZO,
    semilla: Date.now() % 100000,
  });

  const [peticion, setPeticion] = useState<PeticionDados | null>(null);
  /** El hechizo elegido que todavía no sabe a quién va. */
  const [hechizoElegido, setHechizoElegido] = useState<IdHechizo | null>(null);

  const activa = figuraActiva(estado);
  const esZargon = esTurnoDeZargon(estado);
  const movimiento = casillasDeMovimiento(estado);
  const objetivos = objetivosDeAtaque(estado);
  const puertas = puertasAlAlcance(estado);
  const porActivar = monstruosPorActivar(estado);

  // Se recalcula en cada render a partir del estado, que es lo que hace que un
  // monstruo muerto o dormido a mitad del turno cambie quién va después.
  const orden = useMemo(() => ordenDeActivacion(estado), [estado]);
  const motivo = orden[0] ? motivoDeActivacion(estado, orden[0]) : null;

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
        if (esZargon && !activa && orden[0]) {
          ejecutar({ tipo: "activarMonstruo", monstruo: orden[0].id });
        } else {
          ejecutar({ tipo: "terminarTurno" });
        }
      }
    };
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [
    peticion, activa, esZargon, estado.turno.movimientoTotal, objetivos, puertas, porActivar,
    hechizos, hechizoElegido, orden, mover, ejecutar, deshacer, pedirAtaque,
    pedirMovimiento, elegirHechizo, cancelarHechizo,
  ]);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(limpiarError, 2600);
    return () => clearTimeout(t);
  }, [error, limpiarError]);

  return (
    <div className="juego">
      <div className="juego-tablero">
        <BoardMirror
          estado={estado}
          movimiento={movimiento}
          // Mientras se elige a quién apuntar, el tablero marca los objetivos
          // del hechizo en vez de los del ataque: solo hay una elección viva.
          objetivos={pendiente ? pendiente.objetivos : objetivos}
          activa={activa}
          alPulsarCelda={mover}
          alPulsarFigura={alPulsarFigura}
        />
        {error && <div className="aviso-error">{error}</div>}
      </div>

      <aside className="juego-panel">
        <header className="juego-cabecera">
          <h1>{estado.mision.titulo}</h1>
          <p className="apagado">{estado.mision.introduccion}</p>
        </header>

        {estado.desenlace ? (
          <section className={`desenlace ${estado.desenlace.victoria ? "gana" : "pierde"}`}>
            <h2>{estado.desenlace.victoria ? "¡Victoria!" : "Derrota"}</h2>
            <p>{estado.desenlace.motivo}</p>
            <button onClick={reiniciar}>Jugar otra vez</button>
          </section>
        ) : (
          <TurnPanel
            estado={estado}
            activa={activa}
            esZargon={esZargon}
            porActivar={porActivar}
            puertas={puertas}
            objetivos={objetivos}
            hechizos={hechizos}
            hechizosEnMano={hechizosEnMano}
            pendiente={pendiente}
            orden={orden}
            motivo={motivo}
            puedeDeshacer={puedeDeshacer}
            acciones={{
              tirarMovimiento: pedirMovimiento,
              abrirPuerta: (id) => ejecutar({ tipo: "abrirPuerta", puerta: id }),
              atacar: pedirAtaque,
              buscarTesoro: () => ejecutar({ tipo: "buscarTesoro" }),
              buscarTrampas: () => ejecutar({ tipo: "buscarTrampas" }),
              elegirHechizo,
              lanzarSobre: (id) => {
                if (pendiente) lanzar(pendiente.hechizo, id);
              },
              cancelarHechizo,
              activarMonstruo: (id) => ejecutar({ tipo: "activarMonstruo", monstruo: id }),
              terminarTurno: () => ejecutar({ tipo: "terminarTurno" }),
              deshacer,
            }}
          />
        )}

        <section className="hojas">
          {estado.heroes.map((h) => (
            <HeroSheet
              key={h.id}
              heroe={h}
              estado={estado}
              esElDeTurno={activa?.id === h.id}
            />
          ))}
        </section>

        <MasterLog estado={estado} />
      </aside>

      {peticion && <DiceInput peticion={peticion} />}
    </div>
  );
}
