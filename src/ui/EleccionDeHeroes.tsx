import { useState } from "react";
import { EQUIPO, type IdEquipo } from "../data/equipment";
import { HEROES, VARIANTES_HEROE, type ClaseHeroe, type Genero } from "../data/heroes";
import { ELEMENTOS, hechizosDelElemento, type Elemento } from "../data/spells";
import type { HeroeElegido } from "../engine/partida";

const MAXIMO = 4;

const NOMBRE_ELEMENTO: Record<Elemento, string> = {
  aire: "Aire", agua: "Agua", tierra: "Tierra", fuego: "Fuego",
};

/** Clave de una variante: la clase y el género juntos, que es lo que se elige. */
const claveDe = (clase: ClaseHeroe, genero: Genero) => `${clase}-${genero}`;

interface Eleccion {
  clase: ClaseHeroe;
  genero: Genero;
  nombre: string;
  elementos: Elemento[];
}

/** Los primeros elementos, para que empezar no exija decidir nada. */
const elementosPorDefecto = (clase: ClaseHeroe): Elemento[] =>
  ELEMENTOS.slice(0, HEROES[clase].gruposDeHechizos);

/**
 * Quién va a jugar.
 *
 * Sale antes de la partida porque el reparto no es una preferencia de menú:
 * decide con qué dados juega cada uno durante toda la misión. Cada clase se
 * puede llevar en masculino o en femenino sin que cambie ninguna regla, así
 * que Elfo y Elfa aparecen como dos fichas distintas de la misma clase.
 */
export function EleccionDeHeroes({ alEmpezar }: { alEmpezar: (heroes: HeroeElegido[]) => void }) {
  const [grupo, setGrupo] = useState<Eleccion[]>([]);

  const elegida = (clase: ClaseHeroe, genero: Genero) =>
    grupo.some((h) => h.clase === clase && h.genero === genero);

  const alternar = (clase: ClaseHeroe, genero: Genero) => {
    setGrupo((antes) => {
      if (elegida(clase, genero)) {
        return antes.filter((h) => !(h.clase === clase && h.genero === genero));
      }
      if (antes.length >= MAXIMO) return antes;
      return [...antes, { clase, genero, nombre: "", elementos: elementosPorDefecto(clase) }];
    });
  };

  const cambiar = (i: number, cambio: Partial<Eleccion>) =>
    setGrupo((antes) => antes.map((h, j) => (j === i ? { ...h, ...cambio } : h)));

  const alternarElemento = (i: number, el: Elemento) => {
    const h = grupo[i]!;
    const tope = HEROES[h.clase].gruposDeHechizos;
    const tiene = h.elementos.includes(el);
    if (tiene) cambiar(i, { elementos: h.elementos.filter((x) => x !== el) });
    else if (h.elementos.length < tope) cambiar(i, { elementos: [...h.elementos, el] });
    else cambiar(i, { elementos: [...h.elementos.slice(1), el] }); // el más viejo cede el sitio
  };

  const listo = grupo.length > 0 && grupo.every((h) => h.elementos.length === HEROES[h.clase].gruposDeHechizos);

  return (
    <div className="eleccion">
      <header className="eleccion-cabecera">
        <h1>¿Quién baja a la mazmorra?</h1>
        <p className="pista">
          Hasta {MAXIMO} héroes. Cada clase se juega en masculino o en femenino: solo cambia
          el nombre, las reglas son las mismas. El hada es añadido nuestro, no viene en la caja.
        </p>
      </header>

      <div className="fichas">
        {VARIANTES_HEROE.map(({ clase, genero, nombre }) => {
          const h = HEROES[clase];
          const sel = elegida(clase, genero);
          const lleno = grupo.length >= MAXIMO && !sel;
          const armas = h.equipoInicial
            .map((id) => EQUIPO[id as IdEquipo]?.nombre ?? id)
            .join(", ");
          return (
            <button
              key={claveDe(clase, genero)}
              className={`ficha ${sel ? "ficha-sel" : ""}`}
              disabled={lleno}
              onClick={() => alternar(clase, genero)}
            >
              <div className="ficha-nombre">
                {nombre}
                {sel && <span className="etiqueta">en el grupo</span>}
              </div>
              <div className="ficha-datos">
                <span title="puntos de cuerpo">❤ {h.cuerpo}</span>
                <span title="puntos de mente">✦ {h.mente}</span>
                <span title="dados de defensa">🛡 {h.defensa}</span>
                {h.gruposDeHechizos > 0 && (
                  <span title="grupos de hechizos">✨ {h.gruposDeHechizos * 3}</span>
                )}
              </div>
              <p className="ficha-especial">{h.especial}</p>
              <p className="ficha-equipo">Empieza con: {armas}</p>
            </button>
          );
        })}
      </div>

      {grupo.length > 0 && (
        <div className="grupo">
          <h2>El grupo</h2>
          {grupo.map((h, i) => {
            const tope = HEROES[h.clase].gruposDeHechizos;
            return (
              <div className="grupo-fila" key={claveDe(h.clase, h.genero)}>
                <strong className="grupo-clase">{HEROES[h.clase].nombre[h.genero]}</strong>
                <input
                  className="grupo-nombre"
                  value={h.nombre}
                  placeholder="¿cómo se llama?"
                  maxLength={20}
                  onChange={(ev) => cambiar(i, { nombre: ev.target.value })}
                />
                {tope > 0 && (
                  <div className="grupo-elementos">
                    <span className="pista">
                      {tope === 1 ? "un elemento" : `${tope} elementos`}:
                    </span>
                    {ELEMENTOS.map((el) => (
                      <button
                        key={el}
                        className={`chip ${h.elementos.includes(el) ? "chip-sel" : ""}`}
                        title={hechizosDelElemento(el).map((x) => x.nombre).join(", ")}
                        onClick={() => alternarElemento(i, el)}
                      >
                        {NOMBRE_ELEMENTO[el]}
                      </button>
                    ))}
                  </div>
                )}
                <button className="grupo-quitar" onClick={() => alternar(h.clase, h.genero)}>
                  quitar
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="eleccion-pie">
        <button
          className="empezar"
          disabled={!listo}
          onClick={() =>
            alEmpezar(
              grupo.map((h) => ({
                clase: h.clase,
                genero: h.genero,
                nombre: h.nombre.trim() || undefined,
                elementos: h.elementos,
              })),
            )
          }
        >
          Empezar la partida
        </button>
        {grupo.length === 0 && <span className="pista">Elige al menos un héroe.</span>}
      </div>
    </div>
  );
}
