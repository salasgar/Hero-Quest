import { useCallback, useEffect, useMemo, useState } from "react";
import { MISION_POR_DEFECTO, opcionesDe, type MisionCompleta } from "../data/quests";
import { type Dificultad } from "../ai/difficulty";
import { motivoDeActivacion, ordenDeActivacion } from "../ai/orden";
import type { Accion, Celda, Evento } from "../engine/types";
import type { HeroeElegido } from "../engine/partida";
import type { SesionDeRed } from "../red/cliente";
import { BoardMirror } from "./BoardMirror";
import { AvisoDeTirada } from "./DiceInput";
import { HeroSheet } from "./HeroSheet";
import { Instrucciones } from "./Instrucciones";
import { MasterLog } from "./MasterLog";
import { TurnPanel } from "./TurnPanel";
import { mandosDeHeroe, useAccionesDeTurno } from "./useAccionesDeTurno";
import { usePartida } from "./usePartida";
import { desbloquearAudio, useSilencio, useSonidos } from "./sonidos";
import { useSilencioDeVoz } from "./voz";

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
  mision = MISION_POR_DEFECTO,
  sesion,
  instruccionesAbiertas = false,
  cerrarInstrucciones = () => {},
  alReiniciar = () => {},
}: {
  heroes?: HeroeElegido[];
  /**
   * Del catálogo (T45). Por omisión la primera, que es la de empezar. En red
   * no se mira: el montaje ya lleva el identificador y `partidaDelMontaje`
   * la busca en el mismo catálogo.
   */
  mision?: MisionCompleta;
  sesion?: SesionDeRed;
  /**
   * Si `App.tsx` tiene abiertas las instrucciones. Vive ahí porque el botón
   * está en la barra de navegación, que es de `App`; se lee aquí porque «los
   * hechizos del grupo» (T22) sale del `estado` de esta partida, y las
   * instrucciones no se desmontan la partida para enseñarlo (razonado en
   * `App.tsx`).
   */
  instruccionesAbiertas?: boolean;
  cerrarInstrucciones?: () => void;
  alReiniciar?: () => void;
}) {
  const partida = usePartida(
    sesion ?? {
      ...opcionesDe(mision),
      heroes,
      // En red la semilla viene del montaje y no de aquí: si cada navegador la
      // calculara, las dos casas barajarían el mazo distinto y jugarían a dos
      // partidas que ya no son la misma.
      semilla: Date.now() % 100000,
    },
  );
  const { estado, ejecutar, deshacer, error, limpiarError, puedeDeshacer, puedeActuar } =
    partida;

  /**
   * La última ruta recorrida, para pintarla como rastro en el tablero (T70): el
   * cartón no tiene los números pintados, y con más de un camino posible el
   * adulto tiene que adivinar por dónde fue la figura.
   *
   * Se detecta en el evento `movimiento` que devuelve `ejecutar`, porque «todo
   * pasa por `ejecutar`» (`useTurnoDeZargon.ts`): captura igual un movimiento de
   * héroe que uno automático de Zargon, sin tocar ni `useAccionesDeTurno` ni
   * `useTurnoDeZargon`.
   */
  const [rastro, setRastro] = useState<{ ruta: Celda[]; iniciada: number } | null>(null);
  const ejecutarConRastro = useCallback(
    (a: Accion): Evento[] | null => {
      const eventos = ejecutar(a);
      const movimiento = eventos?.find((ev) => ev.tipo === "movimiento");
      if (movimiento && movimiento.tipo === "movimiento") {
        setRastro({ ruta: [movimiento.desde, ...movimiento.ruta], iniciada: Date.now() });
      }
      return eventos;
    },
    [ejecutar],
  );

  // Deja de dibujarse sola cuando nadie más mueve nada: sin este temporizador,
  // un rastro tras la última jugada de la partida se quedaría fijo en el
  // tablero para siempre, porque nada volvería a redibujar `BoardMirror`. No es
  // el bucle de animación que se ha evitado a propósito (`T70-...md`, «Sin
  // `requestAnimationFrame`»): es un único aviso, no uno por fotograma.
  useEffect(() => {
    if (!rastro) return;
    const duracion = Math.max(rastro.ruta.length - 1, 1) * 300 + 1000;
    const t = setTimeout(() => setRastro(null), duracion);
    return () => clearTimeout(t);
  }, [rastro]);

  /**
   * A qué nivel juega Zargon. Vive en la pantalla y no en `localStorage`: es una
   * decisión de esta partida —se sube cuando los niños ganan siempre— y no una
   * preferencia del navegador. Cambiarlo a mitad de misión no rompe el deshacer:
   * lo que se rehace es la lista de acciones, no las decisiones que las eligieron.
   */
  const [nivelDeZargon, setNivelDeZargon] = useState<Dificultad>("normal");

  const turno = useAccionesDeTurno({
    estado,
    ejecutar: ejecutarConRastro,
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

  const [silenciado, alternarSilencio] = useSilencio();
  useSonidos(estado, silenciado);
  const [vozSilenciada, alternarVoz] = useSilencioDeVoz();

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(limpiarError, 2600);
    return () => clearTimeout(t);
  }, [error, limpiarError]);

  return (
    // El audio no suena hasta que el navegador ve un gesto del usuario; el
    // primer clic en cualquier parte de la partida vale para desbloquearlo.
    <div className="juego" onClickCapture={desbloquearAudio}>
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
          rastro={rastro}
        />
        {error && <div className="aviso-error">{error}</div>}
      </div>

      <aside className="juego-panel">
        <header className="juego-cabecera">
          {/* Estilo en línea a propósito: `estilos.css` lo tiene reclamado la
              T58 mientras dura, y una fila con un botón detrás no merece
              esperar a que se suelte. */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: ".5rem" }}>
            <h1>{estado.mision.titulo}</h1>
            <button
              onClick={alternarSilencio}
              aria-label={silenciado ? "Activar el sonido" : "Silenciar el sonido"}
              title={silenciado ? "Sonido apagado" : "Sonido encendido"}
            >
              {silenciado ? "🔇" : "🔊"}
            </button>
            <button
              onClick={alternarVoz}
              aria-label={vozSilenciada ? "Activar la narración en voz alta" : "Silenciar la narración en voz alta"}
              title={vozSilenciada ? "Narración apagada" : "Narración encendida"}
            >
              {vozSilenciada ? "🔈" : "🗣️"}
            </button>
          </div>
          <p className="apagado">{estado.mision.introduccion}</p>
        </header>

        {estado.desenlace ? (
          <section className={`desenlace ${estado.desenlace.victoria ? "gana" : "pierde"}`}>
            <h2>{estado.desenlace.victoria ? "¡Victoria!" : "Derrota"}</h2>
            <p>{estado.desenlace.motivo}</p>
            {/* En red no hay «jugar otra vez»: empezar de cero es crear otra
                partida, con otro código, y eso se hace desde la pantalla de
                entrar. Enseñar un botón que no hace nada es peor que no tenerlo. */}
            {!sesion && (
              <button
                onClick={() => {
                  if (confirm("¿Jugar otra vez? Se creará una partida nueva con distinto mazo de tesoros y tiradas.")) {
                    alReiniciar();
                  }
                }}
              >
                Jugar otra vez
              </button>
            )}
          </section>
        ) : (
          <TurnPanel
            estado={estado}
            activa={turno.activa}
            esZargon={turno.esZargon}
            porActivar={turno.porActivar}
            puertas={turno.puertas}
            trampas={turno.trampas}
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
              desarmarTrampa: (id) => ejecutar({ tipo: "desarmarTrampa", trampa: id }),
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

        <section className={`hojas ${estado.heroes.length >= 5 ? "muchos-heroes" : ""}`}>
          {estado.heroes.map((h) => (
            <HeroSheet
              key={h.id}
              heroe={h}
              estado={estado}
              esElDeTurno={turno.activa?.id === h.id}
              ejecutar={ejecutar}
              compacta={estado.heroes.length >= 5}
            />
          ))}
        </section>

        <MasterLog estado={estado} vozActiva={!vozSilenciada} />
      </aside>

      {turno.tirada && <AvisoDeTirada tirada={turno.tirada} alCerrar={turno.cerrarTirada} />}
      {instruccionesAbiertas && <Instrucciones estado={estado} alCerrar={cerrarInstrucciones} />}
    </div>
  );
}
