import { useEffect, useMemo, useState } from "react";
import {
  MISION_CALABOZO,
  MONSTRUOS_CALABOZO,
  MUEBLES_CALABOZO,
  PUERTAS_CALABOZO,
  TRAMPAS_CALABOZO,
} from "../data/quests/calabozo";
import { type Dificultad } from "../ai/difficulty";
import { motivoDeActivacion, ordenDeActivacion } from "../ai/orden";
import type { HeroeElegido } from "../engine/partida";
import type { SesionDeRed } from "../red/cliente";
import { BoardMirror } from "./BoardMirror";
import { AvisoDeTirada, DiceInput } from "./DiceInput";
import { HeroSheet } from "./HeroSheet";
import { MasterLog } from "./MasterLog";
import { TurnPanel } from "./TurnPanel";
import { mandosDeHeroe, useAccionesDeTurno } from "./useAccionesDeTurno";
import { usePartida } from "./usePartida";

/** El grupo con el que se juega si nadie elige: los cuatro de la caja. */
export const GRUPO_CLASICO: HeroeElegido[] = [
  { clase: "barbaro" },
  { clase: "enano" },
  { clase: "elfo", elementos: ["agua"] },
  { clase: "mago", elementos: ["fuego", "tierra", "aire"] },
];

/**
 * La pantalla de la mesa: la del máster.
 *
 * Lo enseña todo, porque el adulto que la mira arbitra. La de quien juega desde
 * su casa es otro componente —`VistaDeHeroe`— y no una versión de esta con
 * banderas por dentro: lo que comparten es el pintor del tablero y las acciones
 * de turno, y eso está en `BoardMirror` y en `useAccionesDeTurno`.
 *
 * Con una `SesionDeRed` juega la misma pantalla, pero la lista de acciones vive
 * en el relevo: la mesa es un jugador más del reparto, solo que además arbitra y
 * mueve a los monstruos.
 */
export function Juego({
  heroes = GRUPO_CLASICO,
  sesion,
}: {
  heroes?: HeroeElegido[];
  sesion?: SesionDeRed;
}) {
  const partida = usePartida(
    sesion ?? {
      mision: MISION_CALABOZO,
      heroes,
      monstruos: MONSTRUOS_CALABOZO,
      puertas: PUERTAS_CALABOZO,
      muebles: MUEBLES_CALABOZO,
      trampas: TRAMPAS_CALABOZO,
      // En red la semilla viene del montaje y no de aquí: si cada navegador la
      // calculara, las dos casas barajarían el mazo distinto y jugarían a dos
      // partidas que ya no son la misma.
      semilla: Date.now() % 100000,
    },
  );
  const { estado, ejecutar, deshacer, reiniciar, error, limpiarError, puedeDeshacer, puedeActuar } =
    partida;

  /**
   * A qué nivel juega Zargon. Vive en la pantalla y no en `localStorage`: es una
   * decisión de esta partida —se sube cuando los niños ganan siempre— y no una
   * preferencia del navegador. Cambiarlo a mitad de misión no rompe el deshacer:
   * lo que se rehace es la lista de acciones, no las decisiones que las eligieron.
   */
  const [nivelDeZargon, setNivelDeZargon] = useState<Dificultad>("normal");

  const turno = useAccionesDeTurno({
    estado,
    ejecutar,
    deshacer,
    puedeActuar,
    // Esta es la pantalla de la mesa: la que tiene las miniaturas delante y la
    // única que juega el turno de Zargon (T11). La de casa lo deja apagado.
    zargonAutomatico: true,
    nivelDeZargon,
  });

  // Se recalcula en cada render a partir del estado, que es lo que hace que un
  // monstruo muerto o dormido a mitad del turno cambie quién va después.
  const orden = useMemo(() => ordenDeActivacion(estado), [estado]);
  const motivo = orden[0] ? motivoDeActivacion(estado, orden[0]) : null;

  // Fuera del turno de Zargon, siempre. En su turno, solo si el máster ha
  // tomado el mando (T52 punto 1): controla las casillas verdes y los
  // objetivos que se pintan en el tablero, igual que en `TurnPanel`.
  const mandos = mandosDeHeroe(estado, turno.zargon);

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
          movimiento={mandos ? turno.movimiento : []}
          // Mientras se elige a quién apuntar, el tablero marca los objetivos
          // del hechizo en vez de los del ataque: solo hay una elección viva.
          // Sin mandos (turno de Zargon en automático), ninguno de los dos.
          objetivos={mandos ? (turno.pendiente ? turno.pendiente.objetivos : turno.objetivos) : []}
          activa={turno.activa}
          alPulsarCelda={turno.mover}
          alPulsarFigura={turno.alPulsarFigura}
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
            {/* En red no hay «jugar otra vez»: empezar de cero es crear otra
                partida, con otro código, y eso se hace desde la pantalla de
                entrar. Enseñar un botón que no hace nada es peor que no tenerlo. */}
            {!sesion && <button onClick={reiniciar}>Jugar otra vez</button>}
          </section>
        ) : (
          <TurnPanel
            estado={estado}
            activa={turno.activa}
            esZargon={turno.esZargon}
            porActivar={turno.porActivar}
            puertas={turno.puertas}
            objetivos={turno.objetivos}
            hechizos={turno.hechizos}
            hechizosEnMano={turno.hechizosEnMano}
            pendiente={turno.pendiente}
            orden={orden}
            motivo={motivo}
            puedeDeshacer={puedeDeshacer}
            zargon={turno.zargon}
            nivelDeZargon={nivelDeZargon}
            cambiarNivelDeZargon={setNivelDeZargon}
            acciones={{
              tirarMovimiento: turno.pedirMovimiento,
              abrirPuerta: (id) => ejecutar({ tipo: "abrirPuerta", puerta: id }),
              atacar: turno.pedirAtaque,
              buscarTesoro: () => ejecutar({ tipo: "buscarTesoro" }),
              buscarTrampas: () => ejecutar({ tipo: "buscarTrampas" }),
              elegirHechizo: turno.elegirHechizo,
              lanzarSobre: (id) => {
                if (turno.pendiente) turno.lanzar(turno.pendiente.hechizo, id);
              },
              cancelarHechizo: turno.cancelarHechizo,
              activarMonstruo: (id) => ejecutar({ tipo: "activarMonstruo", monstruo: id }),
              terminarTurno: () => ejecutar({ tipo: "terminarTurno" }),
              // El de `turno`, no el de `usePartida`: para a Zargon antes de
              // deshacer, que es lo único que hace visible el deshacer durante
              // su turno.
              deshacer: turno.deshacer,
            }}
          />
        )}

        <section className="hojas">
          {estado.heroes.map((h) => (
            <HeroSheet key={h.id} heroe={h} estado={estado} esElDeTurno={turno.activa?.id === h.id} />
          ))}
        </section>

        <MasterLog estado={estado} />
      </aside>

      {turno.peticion && <DiceInput peticion={turno.peticion} />}
      {turno.tirada && <AvisoDeTirada tirada={turno.tirada} alCerrar={turno.cerrarTirada} />}
    </div>
  );
}
