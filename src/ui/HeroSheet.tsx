import { dadosDeAtaque, dadosDeDefensa } from "../engine/combat";
import { HECHIZOS } from "../data/spells";
import { cartaDeTesoro, esPocion } from "../data/treasure";
import { destinatariosDe, objetivosDePocion } from "../engine/selectors";
import type { Accion, EstadoPartida, Heroe } from "../engine/types";

const barra = (actual: number, maximo: number) =>
  Array.from({ length: maximo }, (_, i) => (i < actual ? "●" : "○")).join("");

/** Hoja de personaje compacta. En la mesa se mira de reojo, no se estudia. */
export function HeroSheet({
  heroe,
  esElDeTurno,
  estado,
  ejecutar,
  compacta = false,
}: {
  heroe: Heroe;
  esElDeTurno: boolean;
  estado: EstadoPartida;
  /**
   * Por dónde salen «Beber» y «Dar a…» (T54): la misma `ejecutar` que el resto
   * de acciones, para que el deshacer y la red sigan exactos. Sin ella la hoja
   * enseña la mochila y no ofrece botones.
   */
  ejecutar?: (accion: Accion) => void;
  /**
   * Modo compacto (T74): con muchas hojas a la vez, solo la del turno se ve
   * entera; las demás se reducen a una línea para que el diario no quede
   * fuera de la pantalla.
   */
  compacta?: boolean;
}) {
  const caido = heroe.cuerpo === 0;

  if (compacta && !esElDeTurno) {
    return (
      <div className={`hoja hoja-linea ${caido ? "hoja-caido" : ""}`}>
        <strong className="hoja-linea-nombre">{heroe.nombre}</strong>
        <span className="hoja-cuerpo" title={`${heroe.cuerpo} de ${heroe.cuerpoMax} puntos de cuerpo`}>
          {barra(heroe.cuerpo, heroe.cuerpoMax)}
        </span>
        <span title="dados de ataque">⚔ {dadosDeAtaque(heroe, "cuerpo", estado)}</span>
        <span title="dados de defensa">🛡 {dadosDeDefensa(heroe, estado)}</span>
      </div>
    );
  }

  const mochila = heroe.mochila
    .map((id, i) => ({ id, i, carta: cartaDeTesoro(id) }))
    .filter((x): x is { id: string; i: number; carta: NonNullable<ReturnType<typeof cartaDeTesoro>> } => !!x.carta);
  // A quién dar: solo en el turno del portador (reglamento p. 16). Se calcula
  // una vez; es lo mismo para todas las cartas.
  const destinatarios = ejecutar && !caido ? destinatariosDe(estado, heroe) : [];
  return (
    <div className={`hoja ${esElDeTurno ? "hoja-turno" : ""} ${caido ? "hoja-caido" : ""}`}>
      <div className="hoja-cabecera">
        <strong>{heroe.nombre}</strong>
        {caido && <span className="etiqueta">caído</span>}
      </div>
      <div className="hoja-cuerpo" title={`${heroe.cuerpo} de ${heroe.cuerpoMax} puntos de cuerpo`}>
        {barra(heroe.cuerpo, heroe.cuerpoMax)}
      </div>
      <div className="hoja-datos">
        {/*
          El `estado` no es opcional aquí aunque la firma lo permita: es lo que
          descuenta el dado a quien está metido en un foso. Sin él la hoja
          promete un dado que el motor no va a tirar (divergencia de T5).
        */}
        <span title="dados de ataque">⚔ {dadosDeAtaque(heroe, "cuerpo", estado)}</span>
        <span title="dados de defensa">🛡 {dadosDeDefensa(heroe, estado)}</span>
        <span title="puntos de mente">✦ {heroe.mente}</span>
        {heroe.oro > 0 && <span title="oro">🪙 {heroe.oro}</span>}
        {heroe.hechizos.length > 0 && (
          <span title="hechizos que le quedan">✨ {heroe.hechizos.length}</span>
        )}
      </div>
      {/*
        Los nombres, no el contador. Un «✨ 9» en la mesa no es información:
        nadie recuerda cuáles son los nueve. Y los gastados se siguen viendo
        tachados porque un hechizo se gasta para siempre en la misión: lo que
        hay que evitar es que alguien cuente con la Curación que usó hace dos
        salas. El bárbaro y el enano no tienen ninguno y aquí no les sale nada.
      */}
      {(heroe.hechizos.length > 0 || heroe.hechizosGastados.length > 0) && (
        <div className="hoja-efectos">
          {heroe.hechizos.map((id) => (
            <span key={id} className="etiqueta" title={HECHIZOS[id].descripcion}>
              ✨ {HECHIZOS[id].nombre}
            </span>
          ))}
          {heroe.hechizosGastados.map((id) => (
            <span key={id} className="etiqueta apagado" title="Ya gastado en esta misión">
              <s>{HECHIZOS[id].nombre}</s>
            </span>
          ))}
        </div>
      )}
      {heroe.efectos.length > 0 && (
        <div className="hoja-efectos">
          {heroe.efectos.map((e, i) => (
            <span key={i} className="etiqueta">
              {e.clase} +{e.dados}
            </span>
          ))}
        </div>
      )}
      {/*
        La mochila (T54): las pociones y el equipo que no se ha puesto. «Beber»
        sale en cualquier momento, sea de quien sea el turno —reglamento p. 16,
        «you may drink a potion at any time»—, y solo sobre quien le sirve (al
        entero no se le cura, y el motor lo rechazaría). «Dar a…», solo en el
        turno del portador. Con las clases que ya hay: sin `estilos.css`.
      */}
      {mochila.length > 0 && (
        <div className="hoja-efectos">
          {mochila.map(({ id, i, carta }) => (
            <span key={`${id}-${i}`} className="etiqueta" title={carta.texto}>
              🎒 {carta.nombre}
              {ejecutar && !caido && esPocion(carta) &&
                objetivosDePocion(estado, carta).map((o) => (
                  <button
                    key={o.id}
                    onClick={() => ejecutar({ tipo: "usarPocion", quien: heroe.id, carta: id, objetivo: o.id })}
                  >
                    {o.id === heroe.id ? "Beber" : `Dar de beber a ${o.nombre}`}
                  </button>
                ))}
              {destinatarios.map((o) => (
                <button key={o.id} onClick={() => ejecutar!({ tipo: "darObjeto", carta: id, a: o.id })}>
                  Dar a {o.nombre}
                </button>
              ))}
            </span>
          ))}
        </div>
      )}
      {estado.desenlace && null}
    </div>
  );
}
