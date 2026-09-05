import { useRef, useState } from "react";
import { EQUIPO, type IdEquipo } from "../data/equipment";
import { HEROES, VARIANTES_HEROE, type ClaseHeroe, type Genero } from "../data/heroes";
import { MISION_CALABOZO } from "../data/quests/calabozo";
import { ELEMENTOS, hechizosDelElemento, type Elemento } from "../data/spells";
import type { HeroeElegido } from "../engine/partida";

/** El tope que pidió Juan Luis el 5 de septiembre de 2026: hasta ocho. */
const MAXIMO = 8;

/**
 * Cuántas casillas declara la misión como entrada. Ya no es un tope, solo un
 * dato para explicarse en pantalla.
 *
 * Lo fue durante unas horas: mientras `crearPartida` se negaba a arrancar con
 * más héroes que casillas, la pantalla tenía que recortar a esa cifra o el
 * juego reventaba al empezar. Juan Luis lo resolvió el 2026-09-05 al firmar que
 * **los que sobran salen por las casillas de pasillo más cercanas**, así que el
 * tope vuelve a ser el que él pidió: ocho.
 */
const PLAZAS = MISION_CALABOZO.entrada.length;
const TOPE = MAXIMO;

const NOMBRE_ELEMENTO: Record<Elemento, string> = {
  aire: "Aire", agua: "Agua", tierra: "Tierra", fuego: "Fuego",
};

/** Clave de una variante: la clase y el género juntos, que es lo que se elige. */
const claveDe = (clase: ClaseHeroe, genero: Genero) => `${clase}-${genero}`;

interface Eleccion {
  /**
   * Identificador propio de **esta** elección, no de la clase.
   *
   * Con clases repetidas, `clase-genero` deja de ser único y React empareja mal
   * las filas al quitar una del medio: se queda el nombre escrito en la fila de
   * otro. Es un contador y no la posición porque la posición cambia al quitar.
   */
  uid: number;
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
 *
 * Y se puede repetir clase: dos magos, dos elfas. `crearPartida` ya sabía darles
 * identificadores distintos —`mago` y `mago2`—, con sus hechizos y su equipo por
 * separado; lo que faltaba era poder pedirlo desde aquí.
 */
export function EleccionDeHeroes({ alEmpezar }: { alEmpezar: (heroes: HeroeElegido[]) => void }) {
  const [grupo, setGrupo] = useState<Eleccion[]>([]);
  const proximoUid = useRef(1);

  /** Cuántos llevas de esta variante. Antes era un sí/no, y con repetidos no basta. */
  const cuantos = (clase: ClaseHeroe, genero: Genero) =>
    grupo.filter((h) => h.clase === clase && h.genero === genero).length;

  /**
   * Añadir y quitar van separados a propósito.
   *
   * Antes había un único `alternar` que quitaba la variante si ya estaba: con
   * clases repetidas, pulsar «Mago» por segunda vez habría **borrado** el primer
   * mago en lugar de añadir el segundo. Quitar es ahora cosa del botón «quitar»
   * de cada fila, que es el único sitio donde se sabe **cuál** de los dos.
   */
  const anadir = (clase: ClaseHeroe, genero: Genero) => {
    setGrupo((antes) => {
      if (antes.length >= TOPE) return antes;
      const uid = proximoUid.current++;
      return [...antes, { uid, clase, genero, nombre: "", elementos: elementosPorDefecto(clase) }];
    });
  };

  const quitar = (uid: number) => setGrupo((antes) => antes.filter((h) => h.uid !== uid));

  const cambiar = (uid: number, cambio: Partial<Eleccion>) =>
    setGrupo((antes) => antes.map((h) => (h.uid === uid ? { ...h, ...cambio } : h)));

  const alternarElemento = (h: Eleccion, el: Elemento) => {
    const tope = HEROES[h.clase].gruposDeHechizos;
    const tiene = h.elementos.includes(el);
    if (tiene) cambiar(h.uid, { elementos: h.elementos.filter((x) => x !== el) });
    else if (h.elementos.length < tope) cambiar(h.uid, { elementos: [...h.elementos, el] });
    else cambiar(h.uid, { elementos: [...h.elementos.slice(1), el] }); // el más viejo cede el sitio
  };

  const listo = grupo.length > 0 && grupo.every((h) => h.elementos.length === HEROES[h.clase].gruposDeHechizos);

  return (
    <div className="eleccion">
      <header className="eleccion-cabecera">
        <h1>¿Quién baja a la mazmorra?</h1>
        <p className="pista">
          Hasta {TOPE} héroes. Se puede repetir clase —dos magos, dos elfas—, y cada clase se
          juega en masculino o en femenino: solo cambia el nombre, las reglas son las mismas.
          El hada es añadido nuestro, no viene en la caja.
        </p>
        {/*
          Con más héroes que casillas de entrada, el grupo se estira por el
          pasillo. Conviene decirlo aquí: en la mesa hay que colocar las figuras
          a mano, y quien vea la fila larga tiene que saber que es lo previsto y
          no un despiste de la aplicación.
        */}
        {grupo.length > PLAZAS && (
          <p className="pista">
            «{MISION_CALABOZO.titulo}» declara {PLAZAS} casillas de entrada. Los {grupo.length - PLAZAS}{" "}
            que sobran empiezan en las casillas de pasillo más cercanas, en fila hacia fuera:
            nadie empieza encima de otro.
          </p>
        )}
      </header>

      <div className="fichas">
        {VARIANTES_HEROE.map(({ clase, genero, nombre }) => {
          const h = HEROES[clase];
          const n = cuantos(clase, genero);
          const lleno = grupo.length >= TOPE;
          const armas = h.equipoInicial
            .map((id) => EQUIPO[id as IdEquipo]?.nombre ?? id)
            .join(", ");
          return (
            <button
              key={claveDe(clase, genero)}
              className={`ficha ${n > 0 ? "ficha-sel" : ""}`}
              disabled={lleno}
              onClick={() => anadir(clase, genero)}
            >
              <div className="ficha-nombre">
                {nombre}
                {/* Cuántos llevas dice más que una marca de sí o no. */}
                {n > 0 && <span className="etiqueta">{n === 1 ? "en el grupo" : `×${n}`}</span>}
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
          {grupo.map((h) => {
            const tope = HEROES[h.clase].gruposDeHechizos;
            // Con dos de la misma clase, «Mago» a secas no distingue las filas.
            // El número es el orden en que se eligieron, que es el mismo con el
            // que `crearPartida` reparte los identificadores.
            const repetida = cuantos(h.clase, h.genero) > 1;
            const cual = grupo.filter((x) => x.clase === h.clase && x.genero === h.genero).indexOf(h) + 1;
            return (
              <div className="grupo-fila" key={h.uid}>
                <strong className="grupo-clase">
                  {HEROES[h.clase].nombre[h.genero]}
                  {repetida && ` ${cual}`}
                </strong>
                <input
                  className="grupo-nombre"
                  value={h.nombre}
                  placeholder="¿cómo se llama?"
                  maxLength={20}
                  onChange={(ev) => cambiar(h.uid, { nombre: ev.target.value })}
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
                        onClick={() => alternarElemento(h, el)}
                      >
                        {NOMBRE_ELEMENTO[el]}
                      </button>
                    ))}
                  </div>
                )}
                <button className="grupo-quitar" onClick={() => quitar(h.uid)}>
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
