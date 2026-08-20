/**
 * Validación de un mapa de tablero. Se usa en dos sitios:
 *  - los tests, contra el mapa fijo de `board-base.ts`
 *  - la pantalla de verificación, en vivo mientras corriges casillas
 *
 * Funciones puras sobre un mapa cualquiera: no leen el mapa base.
 */

export interface Aviso {
  gravedad: "error" | "aviso";
  texto: string;
  celda?: { x: number; y: number };
}

type Mapa = readonly string[];

const enMapa = (m: Mapa, x: number, y: number): boolean =>
  y >= 0 && y < m.length && x >= 0 && x < (m[0]?.length ?? 0);

const claveEn = (m: Mapa, x: number, y: number): string | null =>
  enMapa(m, x, y) ? m[y]![x]! : null;

const vecinas = (m: Mapa, x: number, y: number) =>
  [
    { x: x + 1, y },
    { x: x - 1, y },
    { x, y: y + 1 },
    { x, y: y - 1 },
  ].filter((n) => enMapa(m, n.x, n.y));

/** Componentes conexas de las casillas que llevan una clave dada. */
function componentes(m: Mapa, clave: string): Array<Array<{ x: number; y: number }>> {
  const vistas = new Set<string>();
  const out: Array<Array<{ x: number; y: number }>> = [];
  for (let y = 0; y < m.length; y++) {
    for (let x = 0; x < m[y]!.length; x++) {
      if (m[y]![x] !== clave || vistas.has(`${x},${y}`)) continue;
      const grupo: Array<{ x: number; y: number }> = [];
      const pila = [{ x, y }];
      vistas.add(`${x},${y}`);
      while (pila.length) {
        const c = pila.pop()!;
        grupo.push(c);
        for (const n of vecinas(m, c.x, c.y)) {
          const k = `${n.x},${n.y}`;
          if (m[n.y]![n.x] === clave && !vistas.has(k)) {
            vistas.add(k);
            pila.push(n);
          }
        }
      }
      out.push(grupo);
    }
  }
  return out;
}

export function revisarMapa(m: Mapa): Aviso[] {
  const avisos: Aviso[] = [];
  const alto = m.length;
  const ancho = m[0]?.length ?? 0;

  // 1. Rectangularidad de filas
  for (let y = 0; y < alto; y++)
    if (m[y]!.length !== ancho)
      avisos.push({ gravedad: "error", texto: `La fila ${y} tiene ${m[y]!.length} columnas, no ${ancho}.` });

  // 2. El anillo exterior debe ser pasillo: es por donde entran los héroes.
  for (let x = 0; x < ancho; x++) {
    if (claveEn(m, x, 0) !== ".")
      avisos.push({ gravedad: "error", texto: `El borde superior no es pasillo.`, celda: { x, y: 0 } });
    if (claveEn(m, x, alto - 1) !== ".")
      avisos.push({ gravedad: "error", texto: `El borde inferior no es pasillo.`, celda: { x, y: alto - 1 } });
  }
  for (let y = 0; y < alto; y++) {
    if (claveEn(m, 0, y) !== ".")
      avisos.push({ gravedad: "error", texto: `El borde izquierdo no es pasillo.`, celda: { x: 0, y } });
    if (claveEn(m, ancho - 1, y) !== ".")
      avisos.push({ gravedad: "error", texto: `El borde derecho no es pasillo.`, celda: { x: ancho - 1, y } });
  }

  // 3. Cada sala debe ser una sola pieza. Una sala en dos trozos casi siempre
  //    significa que dos salas distintas comparten letra por descuido.
  const claves = new Set<string>();
  for (const fila of m) for (const c of fila) if (c !== ".") claves.add(c);
  for (const k of [...claves].sort()) {
    const partes = componentes(m, k);
    if (partes.length > 1)
      avisos.push({
        gravedad: "error",
        texto: `La sala '${k}' está partida en ${partes.length} trozos separados.`,
        celda: partes[1]![0],
      });
  }

  // 4. El pasillo tiene que ser una única red: si no, hay zonas inalcanzables.
  const trozosPasillo = componentes(m, ".");
  if (trozosPasillo.length > 1)
    avisos.push({
      gravedad: "error",
      texto: `El pasillo está partido en ${trozosPasillo.length} redes inconexas.`,
      celda: trozosPasillo[1]![0],
    });

  // 5. Salas no rectangulares: legales, pero conviene mirarlas dos veces.
  for (const k of [...claves].sort()) {
    const celdas = componentes(m, k)[0] ?? [];
    const x0 = Math.min(...celdas.map((c) => c.x));
    const x1 = Math.max(...celdas.map((c) => c.x));
    const y0 = Math.min(...celdas.map((c) => c.y));
    const y1 = Math.max(...celdas.map((c) => c.y));
    const lleno = (x1 - x0 + 1) * (y1 - y0 + 1);
    if (lleno !== celdas.length)
      avisos.push({
        gravedad: "aviso",
        texto: `La sala '${k}' no es un rectángulo (${celdas.length} de ${lleno} casillas). Compruébala contra el tablero físico.`,
        celda: { x: x0, y: y0 },
      });
  }

  // 6. Una sala de una sola casilla suele ser un clic accidental.
  for (const k of [...claves].sort()) {
    const n = m.join("").split("").filter((c) => c === k).length;
    if (n === 1) avisos.push({ gravedad: "aviso", texto: `La sala '${k}' tiene una sola casilla.` });
  }

  return avisos;
}

/** Cambia la clave de una casilla y devuelve un mapa nuevo. */
export function pintarCelda(m: Mapa, x: number, y: number, clave: string): string[] {
  return m.map((fila, j) => (j === y ? fila.slice(0, x) + clave + fila.slice(x + 1) : fila));
}

/** El mapa listo para pegar de vuelta en `board-base.ts`. */
export function comoLiteralTS(m: Mapa): string {
  const cab = "  //" + Array.from({ length: m[0]?.length ?? 0 }, (_, i) => i % 10).join("");
  const filas = m.map((f, j) => `  ${JSON.stringify(f)}, // ${String(j).padStart(2)}`);
  return ["// prettier-ignore", "export const MAPA_TABLERO: readonly string[] = [", cab, ...filas, "];"].join("\n");
}
