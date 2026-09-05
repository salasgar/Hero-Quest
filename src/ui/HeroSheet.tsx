import { dadosDeAtaque, dadosDeDefensa } from "../engine/combat";
import { HECHIZOS } from "../data/spells";
import type { EstadoPartida, Heroe } from "../engine/types";

const barra = (actual: number, maximo: number) =>
  Array.from({ length: maximo }, (_, i) => (i < actual ? "●" : "○")).join("");

/** Hoja de personaje compacta. En la mesa se mira de reojo, no se estudia. */
export function HeroSheet({
  heroe,
  esElDeTurno,
  estado,
}: {
  heroe: Heroe;
  esElDeTurno: boolean;
  estado: EstadoPartida;
}) {
  const caido = heroe.cuerpo === 0;
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
        <span title="dados de ataque">⚔ {dadosDeAtaque(heroe)}</span>
        <span title="dados de defensa">🛡 {dadosDeDefensa(heroe)}</span>
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
      {estado.desenlace && null}
    </div>
  );
}
