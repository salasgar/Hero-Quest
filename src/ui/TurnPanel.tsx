import { dadosDeAtaque, dadosDeDefensa } from "../engine/combat";
import { esHeroe, type EstadoPartida, type Figura, type Puerta } from "../engine/types";
import { MONSTRUOS } from "../data/monsters";
import { HECHIZOS, type IdHechizo } from "../data/spells";
import { puedeBuscarTesoro, puedeBuscarTrampas } from "../engine/selectors";

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
}

const Tecla = ({ children }: { children: React.ReactNode }) => <kbd>{children}</kbd>;

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
  acciones,
  puedeDeshacer,
}: PropsTurno) {
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
          <span title="dados de ataque">⚔ {dadosDeAtaque(activa)}</span>
          <span title="dados de defensa">🛡 {dadosDeDefensa(activa)}</span>
          <span title="movimiento">
            👣{" "}
            {t.movimientoTotal === null
              ? "sin tirar"
              : `${t.movimientoRestante} de ${t.movimientoTotal}`}
          </span>
        </div>
      )}

      {esZargon && !activa && (
        <div className="grupo">
          <p className="apagado">Elige el monstruo que actúa:</p>
          <div className="botonera">
            {porActivar.map((m) => (
              <button key={m.id} onClick={() => acciones.activarMonstruo(m.id)}>
                {MONSTRUOS[(m as { especie: keyof typeof MONSTRUOS }).especie].nombre} ({m.cuerpo})
              </button>
            ))}
            {porActivar.length === 0 && <span className="apagado">No queda ninguno.</span>}
          </div>
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

      {activa && !esZargon && (
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
