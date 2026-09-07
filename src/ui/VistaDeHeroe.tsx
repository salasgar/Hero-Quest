import { useEffect } from "react";
import { MONSTRUOS } from "../data/monsters";
import { actorActual } from "../engine/selectors";
import { esHeroe } from "../engine/types";
import type { SesionDeRed } from "../red/cliente";
import { comoLoVe } from "../red/niebla";
import { BoardMirror } from "./BoardMirror";
import { AvisoDeTirada } from "./DiceInput";
import { HeroSheet } from "./HeroSheet";
import { MasterLog } from "./MasterLog";
import { TurnPanel } from "./TurnPanel";
import { useAccionesDeTurno } from "./useAccionesDeTurno";
import { usePartida } from "./usePartida";
import { desbloquearAudio, useSilencio, useSonidos } from "./sonidos";

/**
 * La pantalla de quien juega desde su casa.
 *
 * No es la de la mesa con banderas por dentro: es otro producto. La de la mesa
 * lo enseña todo porque el adulto arbitra; esta enseña **lo que sabe el grupo**,
 * y por eso lo primero que hace es pasar el estado por la niebla.
 *
 * Lo que comparten las dos está donde tiene que estar: el pintor del tablero es
 * `BoardMirror` y las acciones de turno son `useAccionesDeTurno`. Aquí no hay ni
 * un `if (esRemoto)`, y es a propósito: la diferencia está en **qué estado se
 * pinta**, en una sola línea, y no repartida por seis sitios donde algún día se
 * colaría una sala sin abrir.
 */
export function VistaDeHeroe({ sesion }: { sesion: SesionDeRed }) {
  const { estado, ejecutar, deshacer, error, limpiarError, puedeActuar } = usePartida(sesion);
  const turno = useAccionesDeTurno({
    estado,
    ejecutar,
    deshacer,
    puedeActuar,
  });

  // La única línea que hace de esta pantalla lo que es. Lo que se pinta va por
  // aquí; lo que decide qué es legal —los selectores de `useAccionesDeTurno`— va
  // por el estado completo, porque tiene que contestar lo mismo que el motor.
  const visto = comoLoVe(estado, "desdeCasa");

  // El registro no lo filtra la niebla (comentario de `MasterLog` más abajo),
  // así que suena sobre `estado`, no sobre `visto`: son la misma lista, pero
  // esta es la que no depende de que `comoLoVe` la deje intacta.
  const [silenciado, alternarSilencio] = useSilencio();
  useSonidos(estado, silenciado);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(limpiarError, 2600);
    return () => clearTimeout(t);
  }, [error, limpiarError]);

  const actor = actorActual(estado);
  const mios = Object.entries(sesion.montaje.reparto)
    .filter(([, jugador]) => jugador === sesion.jugador)
    .map(([figura]) => figura);
  const deQuienEs =
    actor === "zargon"
      ? "Zargon"
      : (estado.heroes.find((h) => h.id === actor)?.nombre ?? actor);

  return (
    <div className="juego" onClickCapture={desbloquearAudio}>
      <div className="juego-tablero">
        <BoardMirror
          estado={visto}
          movimiento={puedeActuar ? turno.movimiento : []}
          objetivos={puedeActuar ? (turno.pendiente ? turno.pendiente.objetivos : turno.objetivos) : []}
          activa={turno.activa}
          alPulsarCelda={turno.mover}
          alPulsarFigura={turno.alPulsarFigura}
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
          </div>
          <p className="apagado">
            Juegas {mios.length === 1 ? "a" : "a"}{" "}
            {mios
              .map((id) => estado.heroes.find((h) => h.id === id)?.nombre ?? id)
              .join(" y ")}{" "}
            · partida <strong>{sesion.codigo}</strong>
          </p>
        </header>

        {estado.desenlace ? (
          <section className={`desenlace ${estado.desenlace.victoria ? "gana" : "pierde"}`}>
            <h2>{estado.desenlace.victoria ? "¡Victoria!" : "Derrota"}</h2>
            <p>{estado.desenlace.motivo}</p>
          </section>
        ) : puedeActuar ? (
          <TurnPanel
            estado={estado}
            activa={turno.activa}
            // Quien juega desde su casa no mueve monstruos: el turno de Zargon
            // es de la mesa, que es quien tiene las miniaturas en la mano. Nunca
            // llega aquí con `puedeActuar` en verdadero, y estos tres valores lo
            // dejan escrito en vez de fiarlo a que no pase.
            esZargon={false}
            porActivar={[]}
            orden={[]}
            motivo={null}
            puertas={turno.puertas}
            objetivos={turno.objetivos}
            hechizos={turno.hechizos}
            hechizosEnMano={turno.hechizosEnMano}
            pendiente={turno.pendiente}
            // Deshacer es de la mesa: es quien tiene el secreto del relevo y
            // quien ve el tablero de verdad para saber qué se deshace.
            puedeDeshacer={false}
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
              activarMonstruo: () => {},
              terminarTurno: () => ejecutar({ tipo: "terminarTurno" }),
              deshacer: () => {},
            }}
          />
        ) : (
          <section className="turno esperando">
            <h2>Le toca a {deQuienEs}</h2>
            <p className="apagado">
              {actor === "zargon"
                ? "Zargon mueve a los monstruos en la mesa. Aquí lo verás en cuanto pase."
                : "Cuando termine, te avisará esta pantalla."}
            </p>
            {turno.activa && !esHeroe(turno.activa) && (
              <p className="apagado">
                Ahora mismo actúa {MONSTRUOS[turno.activa.especie].nombre}.
              </p>
            )}
          </section>
        )}

        <section className="hojas">
          {visto.heroes.map((h) => (
            <HeroSheet
              key={h.id}
              heroe={h}
              estado={visto}
              esElDeTurno={turno.activa?.id === h.id}
              ejecutar={ejecutar}
            />
          ))}
        </section>

        {/* El diario cuenta lo que ha pasado, que es como se sigue la partida
            cuando no te toca.

            **`registro` no lo filtra la niebla**, y conviene saber por qué no
            hace falta: un evento es algo que ya ha ocurrido, y lo que ocurre lo
            sabe el grupo. Zargon solo mueve monstruos descubiertos (T18) y las
            salas se anuncian al abrirlas, así que no hay nada ahí que el tablero
            esté tapando. Si algún día un evento contara algo de una sala sin
            abrir, este es el sitio donde habría que filtrarlo.

            Se le pasa `visto` igualmente porque el narrador resuelve los nombres
            contra el estado que le den, y así no puede nombrar a una figura que
            el tablero no está pintando. Funciona porque `monstruosEnTablero`
            acumula y nunca quita: quien salió en un evento sigue estando. */}
        <MasterLog estado={visto} />
      </aside>

      {turno.tirada && <AvisoDeTirada tirada={turno.tirada} alCerrar={turno.cerrarTirada} />}
    </div>
  );
}
