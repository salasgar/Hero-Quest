import { useMemo, useState } from "react";
import {
  ALTO_TABLERO,
  ANCHO_TABLERO,
  MAPA_TABLERO,
  NOMBRES_SALAS,
} from "../data/board-base";
import { comoLiteralTS, pintarCelda, revisarMapa } from "../data/board-check";
import { FOTO, encajeDeLaFoto } from "../data/foto-referencia";
import { colorDeSala } from "./paleta";

const LADO = 30; // px por casilla
const MARGEN = 18;

export function BoardVerify() {
  const [mapa, setMapa] = useState<string[]>(() => [...MAPA_TABLERO]);
  const [pincel, setPincel] = useState<string>(".");
  const [pintando, setPintando] = useState(false);
  const [verFoto, setVerFoto] = useState(true);
  const [opacidad, setOpacidad] = useState(0.55);

  const avisos = useMemo(() => revisarMapa(mapa), [mapa]);
  const encaje = useMemo(() => encajeDeLaFoto(LADO), []);
  const claves = useMemo(() => {
    const s = new Set<string>();
    for (const f of mapa) for (const c of f) if (c !== ".") s.add(c);
    return [...s].sort();
  }, [mapa]);

  const tocado = mapa.join("\n") !== MAPA_TABLERO.join("\n");

  const pintar = (x: number, y: number) => setMapa((m) => pintarCelda(m, x, y, pincel));

  const anchoSVG = ANCHO_TABLERO * LADO + MARGEN * 2;
  const altoSVG = ALTO_TABLERO * LADO + MARGEN * 2;

  // Un muro va en toda frontera donde cambia la región.
  const muros: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  for (let y = 0; y < ALTO_TABLERO; y++) {
    for (let x = 0; x < ANCHO_TABLERO; x++) {
      const k = mapa[y]![x]!;
      const der = x + 1 < ANCHO_TABLERO ? mapa[y]![x + 1]! : null;
      const aba = y + 1 < ALTO_TABLERO ? mapa[y + 1]![x]! : null;
      if (der !== null && der !== k)
        muros.push({ x1: (x + 1) * LADO, y1: y * LADO, x2: (x + 1) * LADO, y2: (y + 1) * LADO });
      if (aba !== null && aba !== k)
        muros.push({ x1: x * LADO, y1: (y + 1) * LADO, x2: (x + 1) * LADO, y2: (y + 1) * LADO });
    }
  }

  return (
    <div className="verificar">
      <header>
        <h1>Verificación del tablero</h1>
        <p>
          Compara este tablero con el que tienes en la mesa. Si alguna casilla no coincide, elige
          abajo a qué sala pertenece y píntala. Cuando cuadre todo, copia el mapa y pégalo en{" "}
          <code>src/data/board-base.ts</code>.
        </p>
      </header>

      <div className="lienzo">
        <svg width={anchoSVG} height={altoSVG} role="img" aria-label="Tablero de HeroQuest">
          <g transform={`translate(${MARGEN},${MARGEN})`}>
            {verFoto && (
              // `BASE_URL` es `/` en el Mac y `/Hero-Quest/` en la versión
              // publicada. Escrito a mano, en Pages la foto no aparecería.
              <image
                href={`${import.meta.env.BASE_URL}${FOTO.archivo}`}
                {...encaje}
                preserveAspectRatio="none"
              />
            )}
            <g opacity={verFoto ? opacidad : 1}>
              {mapa.map((fila, y) =>
                [...fila].map((k, x) => (
                  <rect
                    key={`${x},${y}`}
                    x={x * LADO}
                    y={y * LADO}
                    width={LADO}
                    height={LADO}
                    fill={colorDeSala(k)}
                    stroke="#00000055"
                    strokeWidth={0.5}
                    onPointerDown={(e) => {
                      (e.target as Element).releasePointerCapture?.(e.pointerId);
                      setPintando(true);
                      pintar(x, y);
                    }}
                    onPointerEnter={() => pintando && pintar(x, y)}
                    style={{ cursor: "pointer" }}
                  >
                    <title>{`${x},${y} · ${k === "." ? "pasillo" : NOMBRES_SALAS[k] ?? `sala ${k}`}`}</title>
                  </rect>
                )),
              )}
            </g>
            <g stroke="#f4f1e8" strokeWidth={3.5} strokeLinecap="square" pointerEvents="none">
              {muros.map((m, i) => (
                <line key={i} x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2} />
              ))}
            </g>
            <rect
              x={0}
              y={0}
              width={ANCHO_TABLERO * LADO}
              height={ALTO_TABLERO * LADO}
              fill="none"
              stroke="#f4f1e8"
              strokeWidth={4}
              pointerEvents="none"
            />
          </g>
        </svg>
      </div>

      <div className="controles">
        <label>
          <input type="checkbox" checked={verFoto} onChange={(e) => setVerFoto(e.target.checked)} />{" "}
          Ver la foto debajo
        </label>
        <label>
          Transparencia{" "}
          <input
            type="range"
            min={0.15}
            max={1}
            step={0.05}
            value={opacidad}
            disabled={!verFoto}
            onChange={(e) => setOpacidad(Number(e.target.value))}
          />
        </label>
        <button onClick={() => setMapa([...MAPA_TABLERO])} disabled={!tocado}>
          Descartar cambios
        </button>
        <button onClick={() => navigator.clipboard?.writeText(comoLiteralTS(mapa))}>
          Copiar mapa para board-base.ts
        </button>
      </div>

      <div className="pinceles" onPointerUp={() => setPintando(false)}>
        <strong>Pintar como:</strong>
        <button
          className={pincel === "." ? "sel" : ""}
          style={{ background: colorDeSala(".") }}
          onClick={() => setPincel(".")}
        >
          pasillo
        </button>
        {claves.map((k) => (
          <button
            key={k}
            className={pincel === k ? "sel" : ""}
            style={{ background: colorDeSala(k) }}
            onClick={() => setPincel(k)}
            title={NOMBRES_SALAS[k]}
          >
            {k} · {NOMBRES_SALAS[k] ?? "sin nombre"}
          </button>
        ))}
      </div>

      <div className="avisos">
        {avisos.length === 0 ? (
          <p className="ok">Sin incidencias: el mapa es coherente.</p>
        ) : (
          <ul>
            {avisos.map((a, i) => (
              <li key={i} className={a.gravedad}>
                {a.gravedad === "error" ? "✕" : "!"} {a.texto}
                {a.celda && ` (${a.celda.x + 1},${a.celda.y + 1})`}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
