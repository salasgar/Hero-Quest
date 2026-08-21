import { useMemo } from "react";
import {
  ALTO_TABLERO,
  ANCHO_TABLERO,
  claveEn,
  salaEn,
} from "../data/board-base";
import { MONSTRUOS } from "../data/monsters";
import { colorDeSala } from "./paleta";
import { claveCelda, mismaCelda, type Celda, type EstadoPartida, type Figura } from "../engine/types";

const LADO = 28;
const MARGEN = 14;

const INICIALES: Record<string, string> = {
  barbaro: "B", enano: "E", elfo: "L", mago: "M", hada: "H",
};

export interface PropsTablero {
  estado: EstadoPartida;
  /** Casillas a las que la figura activa puede ir. */
  movimiento: readonly Celda[];
  /** Enemigos atacables ahora mismo. */
  objetivos: readonly Figura[];
  activa: Figura | null;
  alPulsarCelda: (c: Celda) => void;
  alPulsarFigura: (id: string) => void;
}

export function BoardMirror({
  estado,
  movimiento,
  objetivos,
  activa,
  alPulsarCelda,
  alPulsarFigura,
}: PropsTablero) {
  const ancho = ANCHO_TABLERO * LADO + MARGEN * 2;
  const alto = ALTO_TABLERO * LADO + MARGEN * 2;

  const destinos = useMemo(() => new Set(movimiento.map(claveCelda)), [movimiento]);
  const atacables = useMemo(() => new Set(objetivos.map((o) => o.id)), [objetivos]);

  const visible = (c: Celda): boolean => {
    const sala = salaEn(c.x, c.y);
    return sala === null || estado.salasReveladas.includes(sala);
  };

  /** Muros: toda frontera donde cambia la región y no hay puerta abierta. */
  const muros = useMemo(() => {
    const salida: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
    for (let y = 0; y < ALTO_TABLERO; y++) {
      for (let x = 0; x < ANCHO_TABLERO; x++) {
        const aqui = claveEn(x, y);
        for (const [dx, dy] of [[1, 0], [0, 1]] as const) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= ANCHO_TABLERO || ny >= ALTO_TABLERO) continue;
          if (claveEn(nx, ny) === aqui) continue;
          const puerta = estado.puertas.find(
            (p) =>
              (mismaCelda(p.a, { x, y }) && mismaCelda(p.b, { x: nx, y: ny })) ||
              (mismaCelda(p.b, { x, y }) && mismaCelda(p.a, { x: nx, y: ny })),
          );
          if (puerta?.abierta) continue;
          salida.push(
            dx === 1
              ? { x1: (x + 1) * LADO, y1: y * LADO, x2: (x + 1) * LADO, y2: (y + 1) * LADO }
              : { x1: x * LADO, y1: (y + 1) * LADO, x2: (x + 1) * LADO, y2: (y + 1) * LADO },
          );
        }
      }
    }
    return salida;
  }, [estado.puertas]);

  const figuras: Figura[] = [
    ...estado.heroes.filter((h) => h.cuerpo > 0),
    ...estado.monstruos.filter((m) => m.cuerpo > 0 && visible(m.celda)),
  ];

  return (
    <svg className="tablero" width={ancho} height={alto} role="img" aria-label="Tablero de la partida">
      <g transform={`translate(${MARGEN},${MARGEN})`}>
        {/* Suelo */}
        {Array.from({ length: ALTO_TABLERO }, (_, y) =>
          Array.from({ length: ANCHO_TABLERO }, (_, x) => {
            const sala = salaEn(x, y);
            const seVe = visible({ x, y });
            const fondo = !seVe ? "#0d1015" : sala === null ? "#39414f" : colorDeSala(sala);
            return (
              <rect
                key={`s${x},${y}`}
                x={x * LADO}
                y={y * LADO}
                width={LADO}
                height={LADO}
                fill={fondo}
                opacity={seVe && sala !== null ? 0.42 : 1}
                stroke="#00000033"
                strokeWidth={0.5}
                onClick={() => alPulsarCelda({ x, y })}
                style={{ cursor: destinos.has(claveCelda({ x, y })) ? "pointer" : "default" }}
              />
            );
          }),
        )}

        {/* La entrada de la mazmorra */}
        {estado.mision.entrada.map((c) => (
          <text
            key={`e${claveCelda(c)}`}
            x={c.x * LADO + LADO / 2}
            y={c.y * LADO + LADO / 2 + 4}
            textAnchor="middle"
            fontSize={13}
            fill="#8e9bb3"
            pointerEvents="none"
          >
            ⌂
          </text>
        ))}

        {/* Mobiliario, solo donde ya se ve */}
        {estado.muebles.flatMap((m) =>
          m.celdas.filter(visible).map((c) => (
            <rect
              key={`m${m.id}${claveCelda(c)}`}
              x={c.x * LADO + 3}
              y={c.y * LADO + 3}
              width={LADO - 6}
              height={LADO - 6}
              rx={3}
              fill={m.bloqueaVista ? "#5a4526" : "#6b5636"}
              stroke="#372c1c"
              pointerEvents="none"
            />
          )),
        )}

        {/* Casillas cegadas por un bloque caído */}
        {estado.celdasBloqueadas.map((c) => (
          <rect
            key={`b${claveCelda(c)}`}
            x={c.x * LADO}
            y={c.y * LADO}
            width={LADO}
            height={LADO}
            fill="#22262e"
            stroke="#111"
            pointerEvents="none"
          />
        ))}

        {/* Trampas ya descubiertas */}
        {estado.trampas
          .filter((t) => t.descubierta && !t.gastada)
          .map((t) => (
            <text
              key={`t${t.id}`}
              x={t.celda.x * LADO + LADO / 2}
              y={t.celda.y * LADO + LADO / 2 + 5}
              textAnchor="middle"
              fontSize={15}
              pointerEvents="none"
            >
              ⚠
            </text>
          ))}

        {/* Adónde se puede ir */}
        {[...destinos].map((k) => {
          const [x, y] = k.split(",").map(Number) as [number, number];
          return (
            // Contorno además de relleno: un tinte solo se lee bien sobre el
            // gris del pasillo, pero se pierde sobre el color de una sala.
            <rect
              key={`d${k}`}
              x={x * LADO + 2.5}
              y={y * LADO + 2.5}
              width={LADO - 5}
              height={LADO - 5}
              rx={4}
              fill="#5ad1a0"
              fillOpacity={0.16}
              stroke="#5ad1a0"
              strokeWidth={2}
              strokeOpacity={0.85}
              pointerEvents="none"
            />
          );
        })}

        {/* Muros */}
        <g stroke="#e8e2d4" strokeWidth={3} strokeLinecap="square" pointerEvents="none">
          {muros.map((m, i) => (
            <line key={i} x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2} />
          ))}
        </g>

        {/* Puertas */}
        {estado.puertas
          .filter((p) => !p.secreta || p.descubierta)
          .map((p) => {
            const horizontal = p.a.y === p.b.y;
            const x = (Math.max(p.a.x, p.b.x)) * LADO;
            const y = (Math.max(p.a.y, p.b.y)) * LADO;
            return (
              <line
                key={p.id}
                x1={horizontal ? x : x}
                y1={horizontal ? y : y}
                x2={horizontal ? x : x + LADO}
                y2={horizontal ? y + LADO : y}
                stroke={p.abierta ? "#5ad1a0" : "#d8a24a"}
                strokeWidth={p.abierta ? 4 : 7}
                strokeLinecap="round"
                strokeDasharray={p.secreta ? "4 3" : undefined}
                pointerEvents="none"
              />
            );
          })}

        {/* Figuras */}
        {figuras.map((f) => {
          const esObjetivo = atacables.has(f.id);
          const esActiva = activa?.id === f.id;
          const cx = f.celda.x * LADO + LADO / 2;
          const cy = f.celda.y * LADO + LADO / 2;
          return (
            <g
              key={f.id}
              onClick={() => alPulsarFigura(f.id)}
              style={{ cursor: esObjetivo ? "crosshair" : "pointer" }}
            >
              <circle
                cx={cx}
                cy={cy}
                r={LADO / 2 - 3}
                fill={f.tipo === "heroe" ? "#4f86d6" : "#b8443c"}
                stroke={esActiva ? "#ffd76a" : esObjetivo ? "#ff8b7d" : "#0c0f14"}
                strokeWidth={esActiva || esObjetivo ? 3 : 1.5}
              />
              <text
                x={cx}
                y={cy + 4}
                textAnchor="middle"
                fontSize={12}
                fontWeight={700}
                fill="#0c0f14"
                pointerEvents="none"
              >
                {f.tipo === "heroe"
                  ? (INICIALES[f.clase] ?? "?")
                  : MONSTRUOS[f.especie].nombre[0]}
              </text>
              {/* Puntos de cuerpo, como chapita en la esquina de la casilla:
                  encima del círculo se pisaba con la figura de la fila de arriba. */}
              <circle
                cx={f.celda.x * LADO + LADO - 6}
                cy={f.celda.y * LADO + LADO - 6}
                r={6}
                fill="#0c0f14"
                opacity={0.85}
                pointerEvents="none"
              />
              <text
                x={f.celda.x * LADO + LADO - 6}
                y={f.celda.y * LADO + LADO - 3}
                textAnchor="middle"
                fontSize={9}
                fontWeight={700}
                fill={f.cuerpo === 1 ? "#ff8b7d" : "#e8e2d4"}
                pointerEvents="none"
              >
                {f.cuerpo}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
