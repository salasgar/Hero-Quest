import { dadosDeAtaque, dadosDeDefensa } from "../engine/combat";
import { esHeroe, type EstadoPartida, type Figura, type Puerta } from "../engine/types";
import { MONSTRUOS } from "../data/monsters";
import { puedeBuscarTesoro, puedeBuscarTrampas } from "../engine/selectors";

export interface PropsTurno {
  estado: EstadoPartida;
  activa: Figura | null;
  esZargon: boolean;
  porActivar: readonly Figura[];
  puertas: readonly Puerta[];
  objetivos: readonly Figura[];
  acciones: {
    tirarMovimiento: () => void;
    abrirPuerta: (id: string) => void;
    atacar: (id: string) => void;
    buscarTesoro: () => void;
    buscarTrampas: () => void;
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
        </div>
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
