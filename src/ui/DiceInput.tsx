import { useEffect } from "react";
import type { CaraCombate } from "../engine/dice";

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

/**
 * El puente entre los dados físicos de la mesa y el motor.
 *
 * Los niños tiran sus dados de verdad y aquí solo se teclea el resultado. Los
 * dados de los monstruos los tira la aplicación, que para eso hace de máster.
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
