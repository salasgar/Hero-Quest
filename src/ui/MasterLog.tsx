import { useEffect, useRef, useState } from "react";
import { narrar as narrarInforme } from "../narrator/local";
import { narrar as narrarRelato } from "../narrator/relato";
import type { EstadoPartida } from "../engine/types";

type ModoDiario = "informe" | "relato";

const CLAVE_MODO = "heroquest-modo-diario";

/**
 * El modo es preferencia de pantalla, no estado de partida: cada casa elige
 * el suyo, y no viaja con el registro de la partida ni con el relevo.
 */
function leerModoGuardado(): ModoDiario {
  try {
    const v = localStorage.getItem(CLAVE_MODO);
    return v === "relato" ? "relato" : "informe";
  } catch {
    return "informe";
  }
}

function guardarModo(modo: ModoDiario): void {
  try {
    localStorage.setItem(CLAVE_MODO, modo);
  } catch {
    // Sin sitio, sin permiso o sin `localStorage`: se queda en memoria y ya.
  }
}

/** El diario de la partida: lo que Zargon va contando, en informe o en relato. */
export function MasterLog({ estado }: { estado: EstadoPartida }) {
  const fondo = useRef<HTMLDivElement>(null);
  const [modo, setModo] = useState<ModoDiario>(leerModoGuardado);

  const narrar = modo === "relato" ? narrarRelato : narrarInforme;
  const lineas = estado.registro
    .map((ev, i) => ({ texto: narrar(estado, ev, i), clave: i, tipo: ev.tipo }))
    .filter((l) => l.texto !== null);

  useEffect(() => {
    const lista = fondo.current?.parentElement;
    lista?.scrollTo({ top: lista.scrollHeight, behavior: "smooth" });
  }, [lineas.length]);

  function elegir(m: ModoDiario) {
    setModo(m);
    guardarModo(m);
  }

  return (
    <section className="diario">
      <h2>Diario</h2>
      <div className="botonera">
        <button
          type="button"
          style={modo === "informe" ? { fontWeight: 700, textDecoration: "underline" } : undefined}
          onClick={() => elegir("informe")}
        >
          Informe
        </button>
        <button
          type="button"
          style={modo === "relato" ? { fontWeight: 700, textDecoration: "underline" } : undefined}
          onClick={() => elegir("relato")}
        >
          Relato
        </button>
      </div>
      <div className="diario-lista">
        {lineas.length === 0 && <p className="apagado">La mazmorra está en silencio.</p>}
        {lineas.map((l) => (
          <p key={l.clave} className={`linea linea-${l.tipo}`}>
            {l.texto}
          </p>
        ))}
        <div ref={fondo} />
      </div>
    </section>
  );
}
