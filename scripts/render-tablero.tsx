/**
 * Renderiza el tablero a un SVG suelto para poder mirarlo sin abrir el navegador.
 * No forma parte de la aplicación: es una herramienta de revisión.
 *   npx vite-node scripts/render-tablero.tsx
 */
import fs from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import {
  MISION_CALABOZO, MONSTRUOS_CALABOZO, MUEBLES_CALABOZO,
  PUERTAS_CALABOZO, TRAMPAS_CALABOZO,
} from "../src/data/quests/calabozo";
import { crearPartida } from "../src/engine/partida";
import { aplicarAccion } from "../src/engine/reducer";
import { casillasDeMovimiento, figuraActiva, objetivosDeAtaque } from "../src/engine/selectors";
import type { Accion, EstadoPartida } from "../src/engine/types";
import { BoardMirror } from "../src/ui/BoardMirror";

let e: EstadoPartida = crearPartida({
  mision: MISION_CALABOZO,
  heroes: [{ clase: "barbaro" }, { clase: "enano" }, { clase: "elfo" }, { clase: "mago" }],
  monstruos: MONSTRUOS_CALABOZO,
  puertas: PUERTAS_CALABOZO,
  muebles: MUEBLES_CALABOZO,
  trampas: TRAMPAS_CALABOZO,
  semilla: 5,
});

const hacer = (a: Accion) => {
  const r = aplicarAccion(e, a);
  if (!r.ok) throw new Error(r.motivo);
  e = r.estado;
};

// Unos turnos para que haya algo que mirar: puerta abierta, sala revelada y
// el bárbaro pegado a los goblins con sus casillas de movimiento resaltadas.
hacer({ tipo: "tirarMovimiento", dados: [3, 3] });
hacer({ tipo: "mover", destino: { x: 12, y: 15 } });
hacer({ tipo: "abrirPuerta", puerta: "ps" });
hacer({ tipo: "mover", destino: { x: 11, y: 15 } });

const svg = renderToStaticMarkup(
  <BoardMirror
    estado={e}
    movimiento={casillasDeMovimiento(e)}
    objetivos={objetivosDeAtaque(e)}
    activa={figuraActiva(e)}
    alPulsarCelda={() => {}}
    alPulsarFigura={() => {}}
  />,
);

const salida = process.argv[2] ?? "tablero.svg";
fs.writeFileSync(
  salida,
  `<?xml version="1.0" encoding="UTF-8"?>\n${svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"')}`,
);
console.log("escrito", salida);
console.log("salas reveladas:", e.salasReveladas);
console.log("movimiento restante:", e.turno.movimientoRestante);
console.log("objetivos de ataque:", objetivosDeAtaque(e).map((o) => o.id));
