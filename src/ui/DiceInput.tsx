import { useCallback, useEffect, useState } from "react";
import type { CaraCombate } from "../engine/dice";

export const NOMBRE_DE_CARA: Record<CaraCombate, string> = {
  calavera: "Calavera",
  escudoBlanco: "Escudo blanco",
  escudoNegro: "Escudo negro",
};

/**
 * Los dibujos de las caras. El escudo va en SVG y no como emoji a propósito:
 * el emoji del escudo se pinta con su propio color y los dos escudos, el blanco
 * y el negro, saldrían idénticos. Aquí la diferencia entre uno y otro es
 * justamente lo que hay que ver.
 *
 * Vivía en `Instrucciones.tsx`, que es donde hizo falta primero. Se mudó aquí al
 * escribir T33 —cuando la aplicación empezó a tirar los dados de un héroe, hubo
 * que **enseñar lo que había salido**— porque el sitio de una cara de dado es el
 * módulo de los dados, y porque tenerla dos veces es cómo se llega a que la
 * pantalla de ayuda y la de la partida dibujen escudos distintos.
 */
export function CaraDeDado({ cara }: { cara: CaraCombate }) {
  if (cara === "calavera") return <span className="dado-simbolo">☠</span>;
  const negro = cara === "escudoNegro";
  return (
    <svg className="dado-simbolo" viewBox="0 0 12 14" width="12" height="14" aria-hidden="true">
      <path
        d="M6 .7 11.3 2.5v5.2c0 3.1-2.3 5.2-5.3 6.1-3-.9-5.3-3-5.3-6.1V2.5Z"
        fill={negro ? "#10131a" : "#f1ece1"}
        stroke="#8b94a7"
        strokeWidth="0.9"
      />
    </svg>
  );
}

export interface PeticionDados {
  titulo: string;
  detalle: string;
  instruccion: string;
  /** Respuestas posibles. Se teclean directamente si son de un solo dígito. */
  opciones: number[];
  alResponder: (n: number) => void;
  alCancelar: () => void;
}

/** Convierte "he sacado 2 calaveras de 3 dados" en la tirada que espera el motor. */
export function componerDados(
  cuantos: number,
  buenas: number,
  cara: CaraCombate,
  relleno: CaraCombate,
): CaraCombate[] {
  return [
    ...Array<CaraCombate>(Math.min(buenas, cuantos)).fill(cara),
    ...Array<CaraCombate>(Math.max(0, cuantos - buenas)).fill(relleno),
  ];
}

export const calaveras = (cuantos: number, n: number) =>
  componerDados(cuantos, n, "calavera", "escudoNegro");

export const escudosBlancos = (cuantos: number, n: number) =>
  componerDados(cuantos, n, "escudoBlanco", "calavera");

// ------------------------------------------------ quién tira los dados (T33)

/**
 * Quién tira los dados del héroe que se juega en **esta** pantalla.
 *
 * En la mesa la respuesta fue siempre «yo»: los niños tienen los dados en la
 * mano y aquí solo se teclea el número. Con alguien jugando desde su casa la
 * pregunta deja de tener una sola respuesta —puede que tenga dados y puede que
 * no—, y Juan Luis pidió expresamente que la aplicación **ofrezca las dos**.
 */
export type QuienTiraLosDados = "yo" | "laApp";

const CLAVE = "heroquest.quienTiraLosDados";

/**
 * La preferencia es **de esta pantalla y no de la partida**: dice quién tiene
 * dados en la mano, que es un dato del salón de cada uno. Por eso vive en el
 * navegador y no en el registro de acciones; si viajara, cambiarla sería una
 * acción más y ensuciaría el deshacer, y además le impondría a la otra casa una
 * decisión que no es suya.
 *
 * Se puede cambiar en mitad de la partida, sin reiniciar nada: los dados se
 * caen debajo del sofá a media misión.
 */
export function usePreferenciaDeDados(): [QuienTiraLosDados, (q: QuienTiraLosDados) => void] {
  const [quien, setQuien] = useState<QuienTiraLosDados>(() => {
    // En un navegador con el almacenamiento capado, `localStorage` lanza en vez
    // de devolver vacío. Que eso deje sin jugar sería absurdo: se cae al valor
    // de siempre, que es el que ya tenía la mesa.
    try {
      return window.localStorage.getItem(CLAVE) === "laApp" ? "laApp" : "yo";
    } catch {
      return "yo";
    }
  });

  const guardar = useCallback((q: QuienTiraLosDados) => {
    setQuien(q);
    try {
      window.localStorage.setItem(CLAVE, q);
    } catch {
      // Sin guardar, la elección vale para esta sesión. Es mejor que un error.
    }
  }, []);

  return [quien, guardar];
}

/** Lo que salió cuando tiró la aplicación, para enseñárselo a quien no lo vio. */
export interface TiradaHecha {
  titulo: string;
  /** Las caras, cuando la tirada fue de dados de combate. */
  caras?: readonly CaraCombate[];
  /** El texto de lo que ha significado: «2 calaveras, 1 escudo · 1 de daño». */
  resumen: string;
}

/**
 * El aviso de lo que ha salido cuando tira la aplicación.
 *
 * **Se enseñan las caras, no solo el total**, y no es un adorno: un niño que no
 * ve los dados y solo lee «te ha quitado 1 punto» tiene que fiarse. Viendo las
 * calaveras y los escudos, la tirada se comprueba igual que sobre la mesa.
 */
export function AvisoDeTirada({ tirada, alCerrar }: { tirada: TiradaHecha; alCerrar: () => void }) {
  useEffect(() => {
    const alPulsar = (ev: KeyboardEvent) => {
      if (ev.key === "Escape" || ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        alCerrar();
      }
    };
    window.addEventListener("keydown", alPulsar, true);
    return () => window.removeEventListener("keydown", alPulsar, true);
  }, [alCerrar]);

  return (
    <div className="dados-fondo" onClick={alCerrar}>
      <div className="dados" onClick={(e) => e.stopPropagation()}>
        <h2>{tirada.titulo}</h2>
        {tirada.caras && tirada.caras.length > 0 && (
          <p className="tirada-caras">
            {tirada.caras.map((cara, i) => (
              <span key={i} className={`tirada-dado cara-${cara}`} title={NOMBRE_DE_CARA[cara]}>
                <CaraDeDado cara={cara} />
              </span>
            ))}
          </p>
        )}
        <p className="dados-instruccion">{tirada.resumen}</p>
        <div className="dados-botones">
          <button onClick={alCerrar}>Vale</button>
        </div>
        <p className="dados-pista">Los ha tirado la aplicación · Intro para seguir</p>
      </div>
    </div>
  );
}

/**
 * El puente entre los dados físicos de la mesa y el motor.
 *
 * Los niños tiran sus dados de verdad y aquí solo se teclea el resultado. Los
 * dados de los monstruos los tira la aplicación, que para eso hace de máster.
 * Desde T33, quien juega desde su casa puede pedir que también le tire los
 * suyos: entonces no se abre esta ventana, sino `AvisoDeTirada`.
 */
export function DiceInput({ peticion }: { peticion: PeticionDados }) {
  const { opciones, alResponder, alCancelar } = peticion;

  useEffect(() => {
    const alPulsar = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        ev.preventDefault();
        alCancelar();
        return;
      }
      if (ev.key.length !== 1) return;
      const n = Number(ev.key);
      if (Number.isNaN(n)) return;
      if (opciones.includes(n)) {
        ev.preventDefault();
        alResponder(n);
      }
    };
    window.addEventListener("keydown", alPulsar, true);
    return () => window.removeEventListener("keydown", alPulsar, true);
  }, [opciones, alResponder, alCancelar]);

  const hayDosDigitos = opciones.some((o) => o > 9);

  return (
    <div className="dados-fondo" onClick={alCancelar}>
      <div className="dados" onClick={(e) => e.stopPropagation()}>
        <h2>{peticion.titulo}</h2>
        <p className="dados-detalle">{peticion.detalle}</p>
        <p className="dados-instruccion">{peticion.instruccion}</p>
        <div className="dados-botones">
          {opciones.map((n) => (
            <button key={n} onClick={() => alResponder(n)}>
              {n}
            </button>
          ))}
        </div>
        <p className="dados-pista">
          {hayDosDigitos ? "Pulsa el botón" : "Teclea el número"} · Esc para cancelar
        </p>
      </div>
    </div>
  );
}
