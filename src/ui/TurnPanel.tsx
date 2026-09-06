import { useState } from "react";
import { figuraPorId } from "../engine/board";
import { dadosDeAtaque, dadosDeDefensa } from "../engine/combat";
import { esHeroe, type Accion, type EstadoPartida, type Figura, type Puerta } from "../engine/types";
import { DIFICULTADES, type Dificultad } from "../ai/difficulty";
import { MONSTRUOS } from "../data/monsters";
import { HECHIZOS, type IdHechizo } from "../data/spells";
import { puedeBuscarTesoro, puedeBuscarTrampas } from "../engine/selectors";
import type { QuienTiraLosDados } from "./DiceInput";
import { nombreDeFigura } from "./useAccionesDeTurno";
import type { TurnoDeZargon } from "./useTurnoDeZargon";

/** Un hechizo con los objetivos que hoy tiene a la vista, tal cual lo da `hechizosLanzables`. */
export interface HechizoConObjetivos {
  hechizo: IdHechizo;
  objetivos: Figura[];
}

export interface PropsTurno {
  estado: EstadoPartida;
  activa: Figura | null;
  esZargon: boolean;
  porActivar: readonly Figura[];
  puertas: readonly Puerta[];
  objetivos: readonly Figura[];
  /** Solo los que tienen algún objetivo: los demás no llegan hasta aquí. */
  hechizos: readonly HechizoConObjetivos[];
  /** Cuántos hechizos le quedan al héroe de turno, tengan objetivo o no. */
  hechizosEnMano: number;
  /** El hechizo elegido que está esperando a que se señale a quién. */
  pendiente: HechizoConObjetivos | null;
  /** Los que quedan por activar, ya en el orden que ha decidido Zargon. */
  orden: readonly Figura[];
  /** Por qué le toca al primero, si hay una razón que contar. */
  motivo: string | null;
  acciones: {
    tirarMovimiento: () => void;
    abrirPuerta: (id: string) => void;
    atacar: (id: string) => void;
    buscarTesoro: () => void;
    buscarTrampas: () => void;
    elegirHechizo: (h: IdHechizo) => void;
    lanzarSobre: (id: string) => void;
    cancelarHechizo: () => void;
    activarMonstruo: (id: string) => void;
    terminarTurno: () => void;
    deshacer: () => void;
  };
  puedeDeshacer: boolean;
  /**
   * Quién tira los dados de esta pantalla, y cómo cambiarlo. Opcionales las
   * dos: sin ellas el interruptor no sale, que es lo que quiere una pantalla
   * donde no haya que preguntarlo.
   */
  quienTira?: QuienTiraLosDados;
  cambiarQuienTira?: (q: QuienTiraLosDados) => void;
  /**
   * Los mandos del turno automático de Zargon. Opcional: la pantalla de quien
   * juega desde su casa no lo trae, y entonces el panel es el de siempre.
   */
  zargon?: TurnoDeZargon;
  nivelDeZargon?: Dificultad;
  cambiarNivelDeZargon?: (n: Dificultad) => void;
}

/** Cómo se llama cada nivel en la mesa. «Torpe» a secas suena a insulto. */
const NOMBRE_DE_NIVEL: Readonly<Record<Dificultad, string>> = {
  torpe: "Fácil",
  normal: "Normal",
  astuto: "Difícil",
};

/**
 * La jugada que Zargon va a hacer, dicha en voz alta.
 *
 * Se anuncia **antes** de hacerla, que es lo que pedía la tarea: si la pantalla
 * resuelve seis activaciones seguidas sin decir nada, en la mesa no queda más
 * remedio que reconstruir el turno leyendo el diario hacia atrás.
 */
function frase(e: EstadoPartida, accion: Accion | null): string | null {
  if (!accion) return null;
  if (accion.tipo === "activarMonstruo") {
    const m = figuraPorId(e, accion.monstruo);
    return m ? `Le toca a ${nombreDeFigura(m)}` : "Activa a un monstruo";
  }
  if (accion.tipo === "atacar") {
    const o = figuraPorId(e, accion.objetivo);
    return o ? `Ataca a ${nombreDeFigura(o)}` : "Ataca";
  }
  // Sin coordenadas: el tablero de la mesa es de cartón y no tiene los números
  // pintados, así que «se mueve a 4,7» no le sirve a nadie. Dónde va se ve en el
  // tablero de la pantalla, que es para lo que está.
  if (accion.tipo === "mover") return "Se mueve";
  if (accion.tipo === "terminarTurno") return "Termina";
  // Cualquier otra cosa que la IA llegue a proponer algún día. Decir algo vago
  // es correcto; caer al «no tiene nada que hacer» de abajo sería mentir justo
  // cuando sí lo tiene.
  return "Zargon juega";
}

const Tecla = ({ children }: { children: React.ReactNode }) => <kbd>{children}</kbd>;

const nombreDeMonstruo = (m: Figura) =>
  MONSTRUOS[(m as { especie: keyof typeof MONSTRUOS }).especie].nombre;

export function TurnPanel({
  estado,
  activa,
  esZargon,
  porActivar,
  puertas,
  objetivos,
  hechizos,
  hechizosEnMano,
  pendiente,
  orden,
  motivo,
  acciones,
  puedeDeshacer,
  quienTira,
  cambiarQuienTira,
  zargon,
  nivelDeZargon,
  cambiarNivelDeZargon,
}: PropsTurno) {
  const [eligiendoAMano, setEligiendoAMano] = useState(false);
  const t = estado.turno;
  const nombre = activa
    ? esHeroe(activa)
      ? activa.nombre
      : MONSTRUOS[activa.especie].nombre
    : esZargon
      ? "Zargon"
      : "—";

  return (
    <section className="turno">
      <h2>
        {esZargon ? "Turno de Zargon" : "Turno de"} <span className="turno-nombre">{nombre}</span>
      </h2>

      {activa && (
        <div className="turno-datos">
          {/* Con el estado, para descontar el dado del foso: ver `HeroSheet`. */}
          <span title="dados de ataque">⚔ {dadosDeAtaque(activa, "cuerpo", estado)}</span>
          <span title="dados de defensa">🛡 {dadosDeDefensa(activa, estado)}</span>
          <span title="movimiento">
            👣{" "}
            {t.movimientoTotal === null
              ? "sin tirar"
              : `${t.movimientoRestante} de ${t.movimientoTotal}`}
          </span>
        </div>
      )}

      {/*
        Antes esto era una botonera y el adulto elegía. Elegir el orden de los
        monstruos es una decisión del enemigo, y quitársela de encima al árbitro
        es para lo que existe esta aplicación (T17). Ahora Zargon lo decide y la
        pantalla lo anuncia; el motivo va delante porque en la mesa «el orco ya
        te tiene a tiro» es lo que hace que un niño entienda por qué le toca a
        ese y no a otro.
      */}
      {esZargon && !activa && (
        <div className="grupo">
          {orden.length === 0 ? (
            /*
              Dos motivos distintos para no tener a nadie que mover, y decirlos
              igual sería un fallo en la mesa: en el turno 1, con los héroes aún
              en el pasillo, lo normal es que no se haya descubierto a nadie, y
              «no queda ninguno» ahí suena a que la aplicación se ha averiado.
            */
            <p className="apagado">
              {estado.monstruosEnTablero.length === 0
                ? "Los héroes todavía no han encontrado a nadie. Zargon espera."
                : "No queda ningún monstruo por mover."}
            </p>
          ) : (
            <>
              <p>
                Le toca a <span className="turno-nombre">{nombreDeMonstruo(orden[0]!)}</span>
                {motivo && <span className="apagado">: {motivo}</span>}
              </p>
              <div className="botonera">
                {/*
                  Con el turno automático (T11) este botón sobra: Zargon activa
                  solo, y dejarlo sería el primero de los «clics que sobran» que
                  la tarea venía a quitar. Los mandos están abajo, y la salida a
                  mano sigue entera detrás de «Cambiar».
                */}
                {!zargon && (
                  <button
                    onClick={() => acciones.activarMonstruo(orden[0]!.id)}
                    className="principal"
                  >
                    Que actúe <Tecla>↵</Tecla>
                  </button>
                )}
                <button onClick={() => setEligiendoAMano((x) => !x)}>
                  {eligiendoAMano ? "Dejarlo a Zargon" : "Cambiar"}
                </button>
              </div>
              {/*
                La salida manual se queda, como manda T11: si la aplicación hace
                algo raro en mitad de una partida, con niños delante no se puede
                parar a depurar. Solo se aparta de la vista.
              */}
              {eligiendoAMano && (
                <>
                  <p className="apagado">O elige tú:</p>
                  <div className="botonera">
                    {porActivar.map((m) => (
                      <button key={m.id} onClick={() => acciones.activarMonstruo(m.id)}>
                        {nombreDeMonstruo(m)} ({m.cuerpo})
                      </button>
                    ))}
                  </div>
                </>
              )}
              <p className="pista">
                El orden se recalcula tras cada activación: quien muere o se duerme cambia
                quién va después.
              </p>
            </>
          )}
        </div>
      )}

      {/*
        Los mandos del turno automático (T11).

        Se pintan también con un monstruo activo, y no solo entre activaciones:
        el momento en que hace falta parar a Zargon es justo ese —la figura se ha
        movido y hay que empujar la miniatura— y un botón de pausa que solo
        aparece cuando ya no hay nada que pausar no sirve de nada.

        Los tres mandos son tres cosas distintas a propósito. «Pausa» es para
        ahora; «Paso a paso» es cómo se quiere jugar el resto de la partida —hay
        mesas que prefieren decidir cuándo avanza cada monstruo, y con niños
        pequeños esa es la buena—; el nivel es a qué juega Zargon.
      */}
      {esZargon && zargon && (
        <div className="grupo">
          {/*
            La avería va en `pista` y no en `aviso-error`: esa clase está
            posicionada en absoluto y con `pointer-events: none` para flotar
            sobre el tablero, y metida aquí se saldría del panel. El «⚠» hace el
            trabajo que haría el color. (`estilos.css` no es de esta tarea: lo
            tocan T37 y T41.)
          */}
          <p className={zargon.averia ? "pista" : "apagado"}>
            {zargon.averia
              ? `⚠ ${zargon.averia}`
              : zargon.pausado
                ? "Zargon está en pausa."
                : (frase(estado, zargon.proxima) ??
                  (estado.monstruosEnTablero.length === 0
                    ? "Zargon espera."
                    : "Zargon no tiene nada que hacer."))}
          </p>
          <div className="botonera">
            {zargon.averia ? (
              <button onClick={zargon.reanudar}>Reintentar</button>
            ) : zargon.pausado || zargon.modo === "paso" ? (
              <button onClick={zargon.siguiente} className="principal">
                Siguiente <Tecla>↵</Tecla>
              </button>
            ) : (
              <button onClick={zargon.pausar}>Pausa</button>
            )}
            {zargon.pausado && !zargon.averia && (
              <button onClick={zargon.reanudar}>Que siga solo</button>
            )}
            <button
              onClick={() =>
                zargon.cambiarModo(zargon.modo === "automatico" ? "paso" : "automatico")
              }
            >
              {zargon.modo === "automatico" ? "Paso a paso" : "Que vaya solo"}
            </button>
          </div>
          {nivelDeZargon && cambiarNivelDeZargon && (
            <div className="quien-tira">
              <span className="apagado">Zargon juega:</span>
              {DIFICULTADES.map((n) => (
                <button
                  key={n}
                  className={n === nivelDeZargon ? "sel" : ""}
                  onClick={() => cambiarNivelDeZargon(n)}
                >
                  {NOMBRE_DE_NIVEL[n]}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {activa && (
        <div className="botonera">
          {!esZargon && t.movimientoTotal === null && (
            <button onClick={acciones.tirarMovimiento} className="principal">
              Tirar movimiento <Tecla>T</Tecla>
            </button>
          )}
          {objetivos.map((o) => (
            <button key={o.id} onClick={() => acciones.atacar(o.id)} className="atacar">
              Atacar a {esHeroe(o) ? o.nombre : MONSTRUOS[o.especie].nombre}
            </button>
          ))}
          {puertas.map((p) => (
            <button key={p.id} onClick={() => acciones.abrirPuerta(p.id)}>
              Abrir puerta <Tecla>P</Tecla>
            </button>
          ))}
          {puedeBuscarTesoro(estado) && (
            <button onClick={acciones.buscarTesoro}>
              Buscar tesoro <Tecla>B</Tecla>
            </button>
          )}
          {puedeBuscarTrampas(estado) && (
            <button onClick={acciones.buscarTrampas}>
              Buscar trampas <Tecla>R</Tecla>
            </button>
          )}
          {/*
            Solo los que el motor va a aceptar. Un botón que se rechaza es un
            clic perdido en la mesa, que es lo que ya avisa `puedeBuscarTesoro`.
            La tecla va en el primero, como en las demás acciones.
          */}
          {!pendiente &&
            hechizos.map((h, i) => (
              <button
                key={h.hechizo}
                onClick={() => acciones.elegirHechizo(h.hechizo)}
                title={HECHIZOS[h.hechizo].descripcion}
              >
                ✨ {HECHIZOS[h.hechizo].nombre} {i === 0 && <Tecla>H</Tecla>}
              </button>
            ))}
        </div>
      )}

      {/*
        Segundo paso: a quién. Solo aparece cuando hay más de un objetivo; con
        uno solo el hechizo sale directo y esto no llega a verse.
      */}
      {pendiente && (
        <div className="grupo">
          <p className="apagado">
            {HECHIZOS[pendiente.hechizo].nombre}: ¿sobre quién?
          </p>
          <div className="botonera">
            {pendiente.objetivos.map((o) => (
              <button key={o.id} onClick={() => acciones.lanzarSobre(o.id)} className="principal">
                {esHeroe(o) ? o.nombre : MONSTRUOS[o.especie].nombre} ({o.cuerpo})
              </button>
            ))}
            <button onClick={acciones.cancelarHechizo}>
              Cancelar <Tecla>Esc</Tecla>
            </button>
          </div>
          <p className="pista">También vale pulsar la figura en el tablero.</p>
        </div>
      )}

      {/*
        Que no haya botones puede querer decir dos cosas muy distintas: que no
        tienes hechizos o que ninguno alcanza a nadie. Sin esta línea, quien
        lleva al mago cree que la aplicación se los ha comido —que es justo lo
        que pasó—. Al bárbaro y al enano, con cero en la mano, no les sale.
      */}
      {activa && !esZargon && !pendiente && hechizos.length === 0 && hechizosEnMano > 0 && (
        <p className="pista">
          {estado.turno.haActuado
            ? "Ya has actuado: los hechizos quedan para el turno que viene."
            : "Ninguno de tus hechizos tiene ahora mismo un objetivo a la vista."}
        </p>
      )}

      <div className="botonera pie">
        <button onClick={acciones.terminarTurno} className="principal">
          Terminar turno <Tecla>↵</Tecla>
        </button>
        <button onClick={acciones.deshacer} disabled={!puedeDeshacer}>
          Deshacer <Tecla>Z</Tecla>
        </button>
      </div>

      {/*
        Quién tira los dados de esta pantalla. Juan Luis pidió las dos opciones
        cuando se decidió lo de jugar con alguien que está en otra casa: quien
        tenga dados en la mano querrá tirarlos, que es medio juego, y quien no
        los tenga no puede jugar si la aplicación no se los tira.

        Se puede cambiar en mitad de la partida, sin reiniciar nada, porque los
        dados se caen debajo del sofá a media misión. Y se dice cuál es cuál con
        palabras: un icono a secas no distingue estas dos.
      */}
      {quienTira && cambiarQuienTira && (
        <div className="quien-tira">
          <span className="apagado">Mis dados:</span>
          <button
            className={quienTira === "yo" ? "sel" : ""}
            onClick={() => cambiarQuienTira("yo")}
          >
            Los tiro yo
          </button>
          <button
            className={quienTira === "laApp" ? "sel" : ""}
            onClick={() => cambiarQuienTira("laApp")}
          >
            Que los tire la aplicación
          </button>
        </div>
      )}

      {/*
        La pista vale también con un monstruo activo, y hasta T20 no salía: se
        pedía `!esZargon`. Mientras T8 y T11 no estén, al monstruo lo mueve a
        mano quien arbitra, y era justo entonces cuando la pantalla dejaba de
        decirle cómo.
      */}
      {activa && (
        <p className="pista">
          Mueve con las flechas <Tecla>←</Tecla>
          <Tecla>↑</Tecla>
          <Tecla>↓</Tecla>
          <Tecla>→</Tecla> o pulsa una casilla verde.
        </p>
      )}
    </section>
  );
}
