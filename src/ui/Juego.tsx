import { useCallback, useEffect, useState } from "react";
import {
  MISION_CALABOZO,
  MONSTRUOS_CALABOZO,
  MUEBLES_CALABOZO,
  PUERTAS_CALABOZO,
  TRAMPAS_CALABOZO,
} from "../data/quests/calabozo";
import { MONSTRUOS } from "../data/monsters";
import { figuraPorId } from "../engine/board";
import { dadosDeAtaque, dadosDeDefensa } from "../engine/combat";
import {
  casillasDeMovimiento,
  esTurnoDeZargon,
  figuraActiva,
  monstruosPorActivar,
  objetivosDeAtaque,
  puertasAlAlcance,
} from "../engine/selectors";
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

export function Juego() {
  const { estado, ejecutar, deshacer, reiniciar, error, limpiarError, puedeDeshacer } = usePartida({
    mision: MISION_CALABOZO,
    heroes: [
      { clase: "barbaro" },
      { clase: "enano" },
      { clase: "elfo", elementos: ["agua"] },
      { clase: "mago", elementos: ["fuego", "tierra", "aire"] },
    ],
    monstruos: MONSTRUOS_CALABOZO,
    puertas: PUERTAS_CALABOZO,
    muebles: MUEBLES_CALABOZO,
    trampas: TRAMPAS_CALABOZO,
    semilla: Date.now() % 100000,
  });

  const [peticion, setPeticion] = useState<PeticionDados | null>(null);

  const activa = figuraActiva(estado);
  const esZargon = esTurnoDeZargon(estado);
  const movimiento = casillasDeMovimiento(estado);
  const objetivos = objetivosDeAtaque(estado);
  const puertas = puertasAlAlcance(estado);
  const porActivar = monstruosPorActivar(estado);

  const cerrar = useCallback(() => setPeticion(null), []);

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
        const n = dadosDeAtaque(atacante);
        setPeticion({
          titulo: `${atacante.nombre} ataca`,
          detalle: `Contra ${nombreDeFigura(objetivo)} · defensa ${dadosDeDefensa(objetivo)}`,
          instruccion: `Tira ${n} dados de combate. ¿Cuántas calaveras?`,
          opciones: rango(0, n),
          alResponder: (k) => {
            ejecutar({ tipo: "atacar", objetivo: idObjetivo, dadosAtaque: calaveras(n, k) });
            cerrar();
          },
          alCancelar: cerrar,
        });
      } else {
        const d = dadosDeDefensa(objetivo);
        setPeticion({
          titulo: `${nombreDeFigura(atacante)} ataca a ${nombreDeFigura(objetivo)}`,
          detalle: `Ataca con ${dadosDeAtaque(atacante)} dados. Los tira la aplicación.`,
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
      if (esZargon && porActivar.some((m) => m.id === id)) {
        ejecutar({ tipo: "activarMonstruo", monstruo: id });
        return;
      }
      if (objetivos.some((o) => o.id === id)) pedirAtaque(id);
    },
    [esZargon, porActivar, objetivos, ejecutar, pedirAtaque],
  );

  // ---- teclado: es la entrada rápida, más que el ratón ----
  useEffect(() => {
    if (peticion) return; // mientras se piden dados, manda el diálogo
    const alPulsar = (ev: KeyboardEvent) => {
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
      } else if (tecla === "z") {
        ev.preventDefault();
        deshacer();
      } else if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
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
    peticion, activa, esZargon, estado.turno.movimientoTotal, objetivos, puertas, porActivar,
    mover, ejecutar, deshacer, pedirAtaque, pedirMovimiento,
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
          objetivos={objetivos}
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
            puedeDeshacer={puedeDeshacer}
            acciones={{
              tirarMovimiento: pedirMovimiento,
              abrirPuerta: (id) => ejecutar({ tipo: "abrirPuerta", puerta: id }),
              atacar: pedirAtaque,
              buscarTesoro: () => ejecutar({ tipo: "buscarTesoro" }),
              buscarTrampas: () => ejecutar({ tipo: "buscarTrampas" }),
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
