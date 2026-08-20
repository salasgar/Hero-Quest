import { useEffect, useRef } from "react";
import { narrar } from "../narrator/local";
import type { EstadoPartida } from "../engine/types";

/** El diario de la partida: lo que Zargon va contando. */
export function MasterLog({ estado }: { estado: EstadoPartida }) {
  const fondo = useRef<HTMLDivElement>(null);

  const lineas = estado.registro
    .map((ev, i) => ({ texto: narrar(estado, ev, i), clave: i, tipo: ev.tipo }))
    .filter((l) => l.texto !== null);

  useEffect(() => {
    fondo.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [lineas.length]);

  return (
    <section className="diario">
      <h2>Diario</h2>
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
