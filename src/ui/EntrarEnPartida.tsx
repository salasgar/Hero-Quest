import { useCallback, useEffect, useState } from "react";
import type { HeroeElegido } from "../engine/partida";
import { crear, MESA, partidaDelMontaje, transporteHttp, unirse, type SesionDeRed } from "../red/cliente";
import { VERSION, type Montaje } from "../red/protocolo";

/**
 * Entrar en una partida en red: crearla desde la mesa, o unirse desde casa.
 *
 * **Entrar es un enlace.** La mesa crea la partida, sale un código de cuatro
 * letras y un enlace con el código dentro; se manda por WhatsApp y quien lo abre
 * llega directamente a elegir a quién juega. Tener que teclear una dirección y
 * después un código es una tarde perdida por teléfono, y con niños delante eso es
 * la diferencia entre jugar y no jugar.
 */

/**
 * Dónde vive el relevo.
 *
 * **T34 es quien pone el valor de verdad**, al montar la publicación en Pages.
 * Hasta entonces se puede pasar a mano con `?relevo=https://...` en la
 * dirección, que es lo que permite probarlo con dos navegadores antes de que
 * exista ningún despliegue. Sin ninguno de los dos, la aplicación lo dice y se
 * juega en local, que es su caso normal.
 */
export function dondeEstaElRelevo(): string {
  const enLaDireccion = new URLSearchParams(window.location.search).get("relevo");
  if (enLaDireccion) return enLaDireccion.replace(/\/$/, "");
  const entorno = (import.meta as { env?: Record<string, string | undefined> }).env;
  return (entorno?.VITE_RELEVO ?? "").replace(/\/$/, "");
}

/** El código que venga en el enlace, si es que se ha abierto uno. */
export const codigoDelEnlace = (): string | null =>
  new URLSearchParams(window.location.search).get("partida");

const enlaceDeLaPartida = (codigo: string): string => {
  const url = new URL(window.location.href);
  url.searchParams.set("partida", codigo);
  // El relevo se arrastra al enlace mientras T34 no lo fije en la construcción:
  // si no, quien lo abra no sabría con qué relevo hablar.
  const relevo = new URLSearchParams(window.location.search).get("relevo");
  if (relevo) url.searchParams.set("relevo", relevo);
  return url.toString();
};

// ------------------------------------------------------------- crear (mesa)

/**
 * Los identificadores de las figuras salen de `partidaDelMontaje`, **no de una
 * copia de cómo se numeran**. `crearPartida` le pone sufijo a la segunda elfa, y
 * un reparto con las claves calculadas aparte apuntaría a figuras que no
 * existen: el héroe quedaría sin dueño y lo jugaría la mesa sin que nadie
 * entendiera por qué.
 */
function figurasDelGrupo(heroes: HeroeElegido[]): Array<{ id: string; nombre: string }> {
  const montaje: Montaje = {
    version: VERSION,
    semilla: 1,
    mision: "calabozo",
    heroes,
    reparto: {},
  };
  const partida = partidaDelMontaje(montaje);
  if (!partida.ok) return [];
  return partida.valor.heroes.map((h) => ({ id: h.id, nombre: h.nombre }));
}

export function CrearPartidaEnRed({
  heroes,
  alEntrar,
  alVolver,
}: {
  heroes: HeroeElegido[];
  alEntrar: (sesion: SesionDeRed) => void;
  alVolver: () => void;
}) {
  const figuras = figurasDelGrupo(heroes);
  /** Quién juega cada héroe. Vacío significa la mesa. */
  const [dueños, setDueños] = useState<Record<string, string>>({});
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hecha, setHecha] = useState<SesionDeRed | null>(null);
  const [copiado, setCopiado] = useState(false);

  const relevo = dondeEstaElRelevo();

  const crearla = useCallback(async () => {
    setCreando(true);
    setError(null);
    const reparto: Record<string, string> = {};
    for (const f of figuras) {
      const quien = (dueños[f.id] ?? "").trim();
      reparto[f.id] = quien === "" ? MESA : quien;
    }
    const montaje: Montaje = {
      version: VERSION,
      // La semilla se decide **aquí y una sola vez**, y viaja en el montaje: es
      // lo que hace que las dos casas barajen el mismo mazo de tesoros. Si cada
      // navegador la calculara, divergirían desde el turno cero sin dar error.
      semilla: Math.floor(Math.random() * 100000),
      mision: "calabozo",
      heroes,
      reparto,
    };
    const res = await crear(transporteHttp(relevo), montaje);
    setCreando(false);
    if (!res.ok) {
      setError(res.motivo);
      return;
    }
    setHecha(res.valor);
  }, [figuras, dueños, heroes, relevo]);

  if (!relevo) {
    return (
      <section className="entrar">
        <h1>Jugar con alguien que está en otro sitio</h1>
        <p>
          Todavía no hay ningún relevo configurado, así que no se puede crear una partida en
          red. Es lo que falta de la tarea T34 —publicar la aplicación— y del despliegue del
          relevo, que necesitan la firma de Juan Luis.
        </p>
        <p className="apagado">
          Para probarlo antes de eso, abre la aplicación con <code>?relevo=</code> y la
          dirección del relevo.
        </p>
        <button onClick={alVolver}>Volver</button>
      </section>
    );
  }

  if (hecha) {
    const enlace = enlaceDeLaPartida(hecha.codigo);
    const fuera = Object.entries(hecha.montaje.reparto).filter(([, q]) => q !== MESA);
    return (
      <section className="entrar">
        <h1>Partida creada</h1>
        <p className="codigo-partida">{hecha.codigo}</p>
        <p>
          Mándale este enlace a{" "}
          {fuera.length > 0 ? [...new Set(fuera.map(([, q]) => q))].join(" y ") : "quien juegue desde fuera"}
          . Con abrirlo entra: no hay que teclear el código.
        </p>
        <p className="enlace-partida">
          <code>{enlace}</code>
        </p>
        <div className="botonera">
          <button
            onClick={() => {
              void navigator.clipboard?.writeText(enlace).then(() => setCopiado(true));
            }}
          >
            {copiado ? "Copiado" : "Copiar el enlace"}
          </button>
          <button onClick={() => alEntrar(hecha)}>Empezar a jugar</button>
        </div>
      </section>
    );
  }

  return (
    <section className="entrar">
      <h1>¿Quién juega desde fuera?</h1>
      <p className="apagado">
        Escribe el nombre de quien lleve cada héroe desde su casa. Los que dejes en blanco se
        juegan aquí, en la mesa. Los monstruos los mueve siempre la mesa.
      </p>
      <ul className="reparto">
        {figuras.map((f) => (
          <li key={f.id}>
            <label>
              <span>{f.nombre}</span>
              <input
                type="text"
                placeholder="la mesa"
                value={dueños[f.id] ?? ""}
                onChange={(ev) => setDueños((d) => ({ ...d, [f.id]: ev.target.value }))}
              />
            </label>
          </li>
        ))}
      </ul>
      {error && <p className="aviso-error">{error}</p>}
      <div className="botonera">
        <button onClick={alVolver}>Volver</button>
        <button onClick={() => void crearla()} disabled={creando}>
          {creando ? "Creando…" : "Crear la partida"}
        </button>
      </div>
    </section>
  );
}

// ------------------------------------------------------------ unirse (casa)

export function UnirseAPartida({
  codigo,
  alEntrar,
}: {
  codigo: string;
  alEntrar: (sesion: SesionDeRed) => void;
}) {
  const [montaje, setMontaje] = useState<Montaje | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);
  const relevo = dondeEstaElRelevo();

  // Se lee el montaje antes de entrar para poder enseñar a quién se puede
  // jugar. Entrar a ciegas y elegir después obligaría a rehacer la sesión.
  useEffect(() => {
    let vivo = true;
    void transporteHttp(relevo)
      .leer(codigo, 0)
      .then((res) => {
        if (!vivo) return;
        if (res.ok) setMontaje(res.valor.montaje);
        else setError(res.motivo);
      });
    return () => {
      vivo = false;
    };
  }, [codigo, relevo]);

  const entrar = useCallback(
    async (jugador: string) => {
      setEntrando(true);
      setError(null);
      const res = await unirse(transporteHttp(relevo), codigo, jugador);
      setEntrando(false);
      if (!res.ok) {
        setError(res.motivo);
        return;
      }
      alEntrar(res.valor);
    },
    [codigo, relevo, alEntrar],
  );

  if (error) {
    return (
      <section className="entrar">
        <h1>No se ha podido entrar</h1>
        <p className="aviso-error">{error}</p>
        <p className="apagado">Partida {codigo}.</p>
      </section>
    );
  }

  if (!montaje) {
    return (
      <section className="entrar">
        <h1>Entrando en la partida {codigo}…</h1>
      </section>
    );
  }

  // Los jugadores de fuera, sin repetir: puede que alguien lleve dos héroes.
  const dueños = [...new Set(Object.values(montaje.reparto).filter((q) => q !== MESA))];
  const heroesDe = (quien: string) =>
    Object.entries(montaje.reparto)
      .filter(([, q]) => q === quien)
      .map(([id]) => id);

  if (dueños.length === 0) {
    return (
      <section className="entrar">
        <h1>Esta partida se juega entera en la mesa</h1>
        <p>
          Quien la creó no dejó ningún héroe para jugar desde fuera. Que abra otra y escriba
          tu nombre junto a un héroe.
        </p>
      </section>
    );
  }

  return (
    <section className="entrar">
      <h1>¿Quién eres?</h1>
      <p className="apagado">Partida {codigo}.</p>
      <div className="botonera columna">
        {dueños.map((quien) => (
          <button key={quien} onClick={() => void entrar(quien)} disabled={entrando}>
            {quien} <span className="apagado">· {heroesDe(quien).join(", ")}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
