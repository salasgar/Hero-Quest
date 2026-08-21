/**
 * Genera el tablero imprimible en cuatro folios A4 apaisados, para pegarlos
 * formando un rectángulo de 2 x 2.
 *
 *   npm run tablero
 *
 * Sale de `src/data/board-base.ts`, la misma geometría que usa el motor: las
 * casillas del papel y las que la aplicación cuenta son las mismas por
 * construcción, no porque yo las haya copiado bien.
 *
 * Cada folio dibuja el tablero ENTERO recortado a su cuadrante con un
 * `clipPath`. Así una pared que caiga justo en la juntura se parte por la mitad
 * entre los dos folios y al pegarlos vuelve a estar entera.
 */

import fs from "node:fs";
import {
  ALTO_TABLERO,
  ANCHO_TABLERO,
  celdasDeSala,
  claveEn,
  dentroDelTablero,
  esPasillo,
  idsDeSalas,
  NOMBRES_SALAS,
} from "../src/data/board-base";
import {
  CASILLAS_CUBIERTAS,
  FOLIOS,
  HOJA_ALTO_MM,
  HOJA_ANCHO_MM,
  LADO_CASILLA_MM as L,
  RECORTE_MM,
  TABLERO_ALTO_MM,
  TABLERO_ANCHO_MM,
  type Folio,
} from "../src/data/board-print";

const COLOR_SALA = "#faf7f0";
const COLOR_PASILLO = "#e8e5dd";
const COLOR_REJILLA = "#c6c0b3";
const COLOR_MURO = "#1b1a18";
const COLOR_TINTA_TENUE = "#9c9587";

const n = (x: number) => Number(x.toFixed(3));

// ------------------------------------------------------------------ tablero

/** Suelo y rejilla: una casilla por celda. */
function suelo(): string {
  const out: string[] = [];
  for (let y = 0; y < ALTO_TABLERO; y++) {
    for (let x = 0; x < ANCHO_TABLERO; x++) {
      const relleno = esPasillo(x, y) ? COLOR_PASILLO : COLOR_SALA;
      out.push(
        `<rect x="${n(x * L)}" y="${n(y * L)}" width="${L}" height="${L}" fill="${relleno}" stroke="${COLOR_REJILLA}" stroke-width="0.15"/>`,
      );
    }
  }
  return out.join("");
}

/**
 * Muros: una línea en cada arista donde cambia la región.
 *
 * Es exactamente la regla que aplica el motor (`hayMuroEntre`): si la clave de
 * región cambia, hay pared, y solo una puerta la abre. Dibujarlo desde la misma
 * fuente es lo que garantiza que lo que se ve en la mesa y lo que la aplicación
 * cree son la misma cosa.
 */
function muros(): string {
  const out: string[] = [];
  const linea = (x1: number, y1: number, x2: number, y2: number) =>
    out.push(
      `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${COLOR_MURO}" stroke-width="0.9" stroke-linecap="square"/>`,
    );

  for (let y = 0; y < ALTO_TABLERO; y++) {
    for (let x = 0; x < ANCHO_TABLERO; x++) {
      const aqui = claveEn(x, y);
      // Solo se miran dos vecinas por casilla: así cada arista se dibuja una vez.
      const derecha = dentroDelTablero(x + 1, y) ? claveEn(x + 1, y) : null;
      const abajo = dentroDelTablero(x, y + 1) ? claveEn(x, y + 1) : null;
      if (aqui !== derecha) linea((x + 1) * L, y * L, (x + 1) * L, (y + 1) * L);
      if (aqui !== abajo) linea(x * L, (y + 1) * L, (x + 1) * L, (y + 1) * L);
      // Y el borde del tablero por arriba y por la izquierda.
      if (x === 0) linea(0, y * L, 0, (y + 1) * L);
      if (y === 0) linea(x * L, 0, (x + 1) * L, 0);
    }
  }
  return out.join("");
}

/**
 * La letra de cada sala, pequeña, para montar las misiones sin contar casillas.
 *
 * Se calcula por folio y no una vez para todo el tablero: una sala partida por
 * una juntura tiene que llevar su letra en las dos mitades, o la mitad de abajo
 * queda sin identificar en la mesa.
 */
function letrasDeSala(f: Folio): string {
  return idsDeSalas()
    .map((id) => {
      // La primera casilla en orden de lectura DENTRO de este folio, no la
      // esquina del rectángulo que envuelve la sala: la sala ajedrezada tiene
      // forma de L y su esquina superior izquierda no le pertenece.
      const primera = celdasDeSala(id).find(
        (c) =>
          c.x >= f.columna0 && c.x < f.columna0 + f.columnas &&
          c.y >= f.fila0 && c.y < f.fila0 + f.filas,
      );
      if (!primera) return "";
      return `<text x="${n(primera.x * L + 1.6)}" y="${n(primera.y * L + 4.6)}" font-size="3.4" fill="${COLOR_TINTA_TENUE}" font-family="Helvetica, Arial, sans-serif">${id}</text>`;
    })
    .join("");
}

const SUELO_Y_MUROS = suelo() + muros();

// -------------------------------------------------------------------- folio

/** Números de columna y de fila, en el margen exterior que no se recorta. */
function coordenadas(f: Folio): string {
  const out: string[] = [];
  const arriba = f.recorta.includes("abajo"); // si recorta abajo, es folio de arriba
  const izquierda = f.recorta.includes("derecha");
  const anchoMm = f.columnas * L;
  const altoMm = f.filas * L;

  for (let i = 0; i < f.columnas; i++) {
    const cx = f.x + (i + 0.5) * L;
    const cy = arriba ? f.y - 2.2 : f.y + altoMm + 5;
    out.push(
      `<text x="${n(cx)}" y="${n(cy)}" font-size="3.2" fill="${COLOR_TINTA_TENUE}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif">${f.columna0 + i}</text>`,
    );
  }
  for (let j = 0; j < f.filas; j++) {
    const cy = f.y + (j + 0.5) * L + 1.1;
    const cx = izquierda ? f.x - 2.2 : f.x + anchoMm + 2.2;
    out.push(
      `<text x="${n(cx)}" y="${n(cy)}" font-size="3.2" fill="${COLOR_TINTA_TENUE}" text-anchor="${izquierda ? "end" : "start"}" font-family="Helvetica, Arial, sans-serif">${f.fila0 + j}</text>`,
    );
  }
  return out.join("");
}

/**
 * Marcas de recorte: la línea de corte prolongada hacia el margen para poder
 * apoyar la regla. Los tirantes salen siempre hacia el margen de verdad, nunca
 * hacia la franja de 6 mm que se va a la basura, que ninguna impresora alcanza.
 */
function marcasDeRecorte(f: Folio): string {
  const out: string[] = [];
  const anchoMm = f.columnas * L;
  const altoMm = f.filas * L;
  const esDeArriba = f.recorta.includes("abajo");
  const esDeIzquierda = f.recorta.includes("derecha");

  const tick = (x1: number, y1: number, x2: number, y2: number) =>
    out.push(
      `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${COLOR_MURO}" stroke-width="0.25" stroke-dasharray="1.5 1.2"/>`,
    );
  const tijeras = (x: number, y: number) =>
    out.push(
      `<text x="${n(x)}" y="${n(y)}" font-size="4" fill="${COLOR_MURO}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif">&#9986;</text>`,
    );

  // Corte vertical: el tirante sale por arriba en los folios de arriba y por
  // abajo en los de abajo, que es donde queda margen.
  const xCorte = esDeIzquierda ? f.x + anchoMm : f.x;
  if (esDeArriba) tick(xCorte, f.y - 6, xCorte, f.y);
  else tick(xCorte, f.y + altoMm, xCorte, f.y + altoMm + 6);

  // Corte horizontal: hacia el margen ancho, donde además cabe el símbolo.
  const yCorte = esDeArriba ? f.y + altoMm : f.y;
  if (esDeIzquierda) {
    tick(f.x - 6, yCorte, f.x, yCorte);
    tijeras(f.x - 10, yCorte + 1.4);
  } else {
    tick(f.x + anchoMm, yCorte, f.x + anchoMm + 6, yCorte);
    tijeras(f.x + anchoMm + 10, yCorte + 1.4);
  }
  return out.join("");
}

/** Diagrama de 2 x 2 en el margen, con este folio en negro. */
function guiaDeMontaje(x: number, y: number, mio: number): string {
  const w = 6.5;
  const h = 4.6;
  return FOLIOS.map((o, i) => {
    const cx = x + (i % 2) * w;
    const cy = y + Math.floor(i / 2) * h;
    const suyo = o.numero === mio;
    return `<rect x="${n(cx)}" y="${n(cy)}" width="${w}" height="${h}" fill="${suyo ? COLOR_MURO : "none"}" stroke="${COLOR_MURO}" stroke-width="0.2"/>
      <text x="${n(cx + w / 2)}" y="${n(cy + h / 2 + 1.1)}" font-size="3" text-anchor="middle" fill="${suyo ? "#fff" : COLOR_TINTA_TENUE}" font-family="Helvetica, Arial, sans-serif">${o.numero}</text>`;
  }).join("");
}

const NOMBRE_BORDE: Record<string, string> = {
  arriba: "SUPERIOR", abajo: "INFERIOR", izquierda: "IZQUIERDO", derecha: "DERECHO",
};

/** El rótulo del margen ancho: qué folio es y qué dos bordes hay que recortar. */
function rotulo(f: Folio): string {
  const esDeIzquierda = f.recorta.includes("derecha");
  const anchoMm = f.columnas * L;
  // El centro de la franja exterior, que es la ancha: 44 mm de margen.
  const centro = esDeIzquierda ? f.x / 2 : f.x + anchoMm + (HOJA_ANCHO_MM - f.x - anchoMm) / 2;
  const medio = f.y + (f.filas * L) / 2;
  const bordes = f.recorta.map((b) => NOMBRE_BORDE[b]).join(" y el ");
  return `
    <g transform="translate(${n(centro)} ${n(medio)}) rotate(-90)">
      <text x="0" y="0" font-size="5" text-anchor="middle" fill="${COLOR_MURO}" font-family="Helvetica, Arial, sans-serif" letter-spacing="0.6">FOLIO ${f.numero} · ${f.rotulo.toUpperCase()}</text>
      <text x="0" y="6" font-size="3.2" text-anchor="middle" fill="${COLOR_TINTA_TENUE}" font-family="Helvetica, Arial, sans-serif">Recorta el borde ${bordes} por la línea de puntos, y pega los cuatro por detrás.</text>
    </g>
    ${guiaDeMontaje(centro - 6.5, f.y + 3, f.numero)}`;
}

function folio(f: Folio): string {
  const anchoMm = f.columnas * L;
  const altoMm = f.filas * L;
  // Dibujar el tablero entero desplazado y recortado a este cuadrante deja las
  // paredes de la juntura partidas exactamente por la mitad.
  const ox = f.x - f.columna0 * L;
  const oy = f.y - f.fila0 * L;

  // El recorte va exactamente por la juntura, para que la pared que cae ahí se
  // parta por la mitad y al pegar los folios vuelva a estar entera. Pero en los
  // bordes exteriores no hay juntura ninguna: si se recortara igual de justo, el
  // marco del tablero saldría a media línea. Se deja medio milímetro de holgura.
  const holgura = (borde: Folio["recorta"][number]) => (f.recorta.includes(borde) ? 0 : 0.6);
  const hIzq = holgura("izquierda");
  const hArr = holgura("arriba");

  return `
  <section class="hoja">
    <svg width="${HOJA_ANCHO_MM}mm" height="${HOJA_ALTO_MM}mm" viewBox="0 0 ${HOJA_ANCHO_MM} ${HOJA_ALTO_MM}" xmlns="http://www.w3.org/2000/svg">
      <clipPath id="corte${f.numero}">
        <rect x="${n(f.x - hIzq)}" y="${n(f.y - hArr)}"
              width="${n(anchoMm + hIzq + holgura("derecha"))}"
              height="${n(altoMm + hArr + holgura("abajo"))}"/>
      </clipPath>
      <g clip-path="url(#corte${f.numero})">
        <g transform="translate(${n(ox)} ${n(oy)})">${SUELO_Y_MUROS}${letrasDeSala(f)}</g>
      </g>
      ${coordenadas(f)}
      ${marcasDeRecorte(f)}
      ${rotulo(f)}
    </svg>
  </section>`;
}

// ---------------------------------------------------------------- documento

if (CASILLAS_CUBIERTAS !== ANCHO_TABLERO * ALTO_TABLERO) {
  throw new Error(
    `los cuatro folios cubren ${CASILLAS_CUBIERTAS} casillas y el tablero tiene ${ANCHO_TABLERO * ALTO_TABLERO}`,
  );
}

const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>HeroQuest · tablero para imprimir</title>
<style>
  @page { size: A4 landscape; margin: 0; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #fff; }
  .hoja {
    width: ${HOJA_ANCHO_MM}mm; height: ${HOJA_ALTO_MM}mm;
    page-break-after: always; break-after: page; overflow: hidden;
  }
  .hoja:last-child { page-break-after: auto; break-after: auto; }
  svg { display: block; }
</style></head>
<body>
${FOLIOS.map(folio).join("\n")}
</body></html>`;

const salida = process.argv[2] ?? "tablero.html";
fs.writeFileSync(salida, html);

const salas = idsDeSalas().length;
console.log(`escrito ${salida}`);
console.log(`  casilla:  ${L} mm  (${(L / 10).toFixed(1)} cm)`);
console.log(`  tablero:  ${TABLERO_ANCHO_MM} x ${TABLERO_ALTO_MM} mm  (${ANCHO_TABLERO} x ${ALTO_TABLERO} casillas, ${salas} salas)`);
console.log(`  folios:   ${FOLIOS.length} A4 apaisados en 2 x 2, recortando ${RECORTE_MM} mm de los bordes interiores`);
console.log(`  reparto:  ${FOLIOS.map((f) => `${f.numero}:${f.columnas}x${f.filas}`).join("  ")}`);
console.log(`  nombres de sala: ${Object.keys(NOMBRES_SALAS).length} definidos`);
