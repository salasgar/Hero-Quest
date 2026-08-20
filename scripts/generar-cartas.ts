/**
 * Genera la hoja imprimible de cartas a partir de los datos del repositorio.
 *
 *   npx vite-node scripts/generar-cartas.ts cartas.html
 *
 * Las cartas salen de `src/data/`, la misma fuente que usa la aplicación: si
 * mañana cambia el precio de un arma o el efecto de un hechizo, cambia en el
 * papel y en la pantalla a la vez. No hay dos verdades.
 *
 * Tamaño de carta: 63 x 88 mm (el de las barajas de naipes normales), nueve por
 * hoja A4. Así caben en fundas de cartas corrientes si algún día queréis.
 */

import fs from "node:fs";
import { HEROES, CLASES_HEROE } from "../src/data/heroes";
import { EQUIPO, type IdEquipo } from "../src/data/equipment";
import { ELEMENTOS, hechizosDelElemento, type Elemento } from "../src/data/spells";
import { BARAJA_TESOROS } from "../src/data/treasure";
import { MONSTRUOS, ESPECIES } from "../src/data/monsters";
import { MOBILIARIO, TOTAL_PIEZAS, LADO_CASILLA_CM } from "../src/data/furniture";

const COLOR_ELEMENTO: Record<Elemento, string> = {
  aire: "#5b8db8", agua: "#3f7f8c", tierra: "#6b7f4a", fuego: "#a8543a",
};
const NOMBRE_ELEMENTO: Record<Elemento, string> = {
  aire: "Aire", agua: "Agua", tierra: "Tierra", fuego: "Fuego",
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const pips = (n: number, lleno = "●") => lleno.repeat(n);

/** Una carta genérica. */
const carta = (o: {
  color: string; sobretitulo: string; titulo: string; cuerpo: string; pie?: string;
}) => `
  <div class="carta">
    <div class="cinta" style="background:${o.color}">${esc(o.sobretitulo)}</div>
    <h3>${esc(o.titulo)}</h3>
    <div class="cuerpo">${o.cuerpo}</div>
    ${o.pie ? `<div class="pie">${esc(o.pie)}</div>` : ""}
  </div>`;

// ---------------------------------------------------------------- personajes
const cartasPersonaje = CLASES_HEROE.map((clase) => {
  const h = HEROES[clase];
  const armas = h.equipoInicial.map((id) => EQUIPO[id as IdEquipo]?.nombre ?? id).join(", ");
  const dadosAtaque = Math.max(
    1,
    ...h.equipoInicial.map((id) => EQUIPO[id as IdEquipo]?.ataque ?? 0),
  );
  const especial = h.desarmaTrampasSinRiesgo
    ? "Desarma trampas sin riesgo gracias a sus herramientas."
    : h.gruposDeHechizos > 0
      ? `Elige ${h.gruposDeHechizos} ${h.gruposDeHechizos === 1 ? "elemento" : "elementos"} de hechizos al empezar la campaña.`
      : "El más fuerte en combate cuerpo a cuerpo.";
  return carta({
    color: "#3f4a5e",
    sobretitulo: "Héroe",
    titulo: h.nombre,
    cuerpo: `
      <table class="atributos">
        <tr><th>Cuerpo</th><td class="pips cuerpo">${pips(h.cuerpo)}</td><td class="num">${h.cuerpo}</td></tr>
        <tr><th>Mente</th><td class="pips mente">${pips(h.mente)}</td><td class="num">${h.mente}</td></tr>
        <tr><th>Ataque</th><td colspan="2">${dadosAtaque} ${dadosAtaque === 1 ? "dado" : "dados"}</td></tr>
        <tr><th>Defensa</th><td colspan="2">${h.defensa} dados</td></tr>
      </table>
      <p class="equipo"><strong>Empieza con:</strong> ${esc(armas)}</p>
      <p class="especial">${esc(especial)}</p>`,
  });
});

// ---------------------------------------------------------------- hechizos
const cartasHechizo = ELEMENTOS.flatMap((el) =>
  hechizosDelElemento(el).map((h) =>
    carta({
      color: COLOR_ELEMENTO[el],
      sobretitulo: `Hechizo · ${NOMBRE_ELEMENTO[el]}`,
      titulo: h.nombre,
      cuerpo: `<p class="descripcion">${esc(h.descripcion)}</p>`,
      pie: h.requiereVision
        ? "Un uso por misión · Necesita línea de visión"
        : "Un uso por misión",
    }),
  ),
);

// ---------------------------------------------------------------- equipo
const cartasEquipo = Object.values(EQUIPO).map((e) => {
  const lineas: string[] = [];
  if (e.ataque !== undefined) lineas.push(`<tr><th>Ataque</th><td>${e.ataque} ${e.ataque === 1 ? "dado" : "dados"}</td></tr>`);
  if (e.defensa !== undefined) lineas.push(`<tr><th>Defensa</th><td>+${e.defensa}</td></tr>`);
  lineas.push(`<tr><th>Precio</th><td>${e.precio === 0 ? "—" : `${e.precio} monedas`}</td></tr>`);
  const notas: string[] = [];
  if (e.atacaEnDiagonal) notas.push("Ataca también en diagonal.");
  if (e.arrojadiza) notas.push("Se puede arrojar.");
  if (e.aDistancia) notas.push("Dispara con línea de visión.");
  if (e.aDosManos) notas.push("A dos manos: sin escudo.");
  if (e.notas) notas.push(e.notas);
  return carta({
    color: e.ranura === "arma" ? "#7a4a2f" : e.ranura === "armadura" ? "#4a5a6b" : "#5a5a4a",
    sobretitulo: e.ranura === "arma" ? "Arma" : e.ranura === "armadura" ? "Armadura" : "Objeto",
    titulo: e.nombre,
    cuerpo: `<table class="atributos">${lineas.join("")}</table>
             ${notas.length ? `<p class="descripcion">${esc(notas.join(" "))}</p>` : ""}`,
    pie: e.porVerificar ? "⚠ Comprobar con tu carta original" : undefined,
  });
});

// ---------------------------------------------------------------- tesoros
const cartasTesoro = BARAJA_TESOROS.flatMap((c) => {
  const efecto =
    c.efecto.clase === "oro" ? `<p class="efecto">+${c.efecto.cantidad} monedas de oro</p>`
    : c.efecto.clase === "curacion" ? `<p class="efecto">Recuperas ${c.efecto.cuerpo} de cuerpo</p>`
    : c.efecto.clase === "bonusAtaque" ? `<p class="efecto">+${c.efecto.dados} dados en tu siguiente ataque</p>`
    : c.efecto.clase === "peligro" ? `<p class="efecto malo">Pierdes ${c.efecto.dano} de cuerpo</p>`
    : `<p class="efecto malo">Aparece un ${MONSTRUOS[c.efecto.especie].nombre.toLowerCase()}</p>`;
  const malo = c.efecto.clase === "peligro" || c.efecto.clase === "monstruoErrante";
  return Array.from({ length: c.copias }, () =>
    carta({
      color: malo ? "#8c3a30" : "#8a6d23",
      sobretitulo: "Tesoro",
      titulo: c.nombre,
      cuerpo: `<p class="descripcion sabor">${esc(c.texto)}</p>${efecto}`,
    }),
  );
});

// ---------------------------------------------------------------- reversos
const reverso = `
  <div class="carta reverso">
    <div class="reverso-marco">
      <div class="reverso-rombo"></div>
      <div class="reverso-texto">TESORO</div>
    </div>
  </div>`;

// ---------------------------------------------------------------- páginas
function paginas(cartas: string[], titulo: string): string {
  const out: string[] = [];
  for (let i = 0; i < cartas.length; i += 9) {
    out.push(`<section class="hoja"><div class="marca">${esc(titulo)} · hoja ${i / 9 + 1}</div>
      <div class="rejilla">${cartas.slice(i, i + 9).join("")}</div></section>`);
  }
  return out.join("\n");
}

// ---------------------------------------------------------------- referencia
const tablaMonstruos = `
<section class="hoja hoja-texto">
  <h1>Los monstruos</h1>
  <p class="intro">No hacen falta cartas: de los monstruos se encarga la aplicación.
     Esta tabla es para que los héroes sepan a qué se enfrentan.</p>
  <table class="referencia">
    <tr><th>Monstruo</th><th>Movimiento</th><th>Ataque</th><th>Defensa</th><th>Cuerpo</th><th>Mente</th></tr>
    ${ESPECIES.map((id) => {
      const m = MONSTRUOS[id];
      return `<tr><td>${esc(m.nombre)}</td><td>${m.movimiento}</td><td>${m.ataque}</td><td>${m.defensa}</td><td>${m.cuerpo}</td><td>${m.mente}</td></tr>`;
    }).join("")}
  </table>
  <p class="nota"><strong>Ojo con la defensa de los monstruos.</strong> Ellos paran con el
     escudo negro, que sale en 1 de cada 6 caras; los héroes paran con el blanco, que sale
     en 2 de cada 6. Una momia con 4 dados de defensa para lo mismo que un héroe con 2.</p>

  <h2>Mobiliario que hay que construir</h2>
  <p class="intro">Medidas en casillas del tablero. En el tablero de 2021 cada casilla
     mide unos ${LADO_CASILLA_CM} cm, pero mide la tuya antes de cortar.
     En total, <strong>${TOTAL_PIEZAS} piezas</strong>.</p>
  <table class="referencia">
    <tr><th>Pieza</th><th>Cuántas</th><th>Tamaño</th><th>¿Tapa la vista?</th></tr>
    ${MOBILIARIO.map((m) => `<tr><td>${esc(m.nombre)}</td><td>${m.cuantas}</td>
      <td>${m.ancho} × ${m.alto} ${m.ancho * m.alto === 1 ? "casilla" : "casillas"}</td>
      <td>${m.bloqueaVista ? "Sí, es alta" : "No"}</td></tr>`).join("")}
  </table>
  <p class="nota">Sobre ninguna se puede pisar. Solo las altas (estantería, armario,
     bastidor) cortan la línea de visión, y eso decide qué hechizos y qué disparos de
     ballesta llegan al objetivo.</p>
</section>`;

const portada = `
<section class="hoja hoja-texto">
  <h1>HeroQuest · cartas para imprimir</h1>
  <p class="intro">Generado desde los datos de la aplicación. Si algo cambia ahí, vuelve
     a generar esta hoja y las dos versiones seguirán diciendo lo mismo.</p>
  <h2>Qué hay aquí</h2>
  <table class="referencia">
    <tr><th>Cartas</th><th>Cuántas</th></tr>
    <tr><td>Héroes</td><td>${cartasPersonaje.length}</td></tr>
    <tr><td>Hechizos</td><td>${cartasHechizo.length}</td></tr>
    <tr><td>Equipo</td><td>${cartasEquipo.length}</td></tr>
    <tr><td>Tesoros</td><td>${cartasTesoro.length}</td></tr>
    <tr><td><strong>Total</strong></td><td><strong>${cartasPersonaje.length + cartasHechizo.length + cartasEquipo.length + cartasTesoro.length}</strong></td></tr>
  </table>
  <h2>Cómo imprimirlo</h2>
  <ul>
    <li>A4, <strong>al 100 %</strong>: no dejes que el diálogo lo ajuste a la página o las
        cartas saldrán pequeñas.</li>
    <li>En cartulina si tienes; en folio normal también vale, pegado a cartón.</li>
    <li>Las cartas miden 63 × 88 mm, el tamaño de una baraja de naipes normal: si las
        quieres enfundar, valen las fundas corrientes.</li>
    <li>La hoja de reversos es solo para los tesoros, que se roban a ciegas. Las demás se
        miran siempre por la cara.</li>
  </ul>
  <h2>Lo que NO hay que imprimir</h2>
  <p>Nada de monstruos: de eso se encarga la aplicación, que hace de máster. Y nada de
     tablas de reglas: las aplica el motor y las explica el diario de la partida.</p>
</section>`;

// ---------------------------------------------------------------- documento
const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>HeroQuest · cartas para imprimir</title>
<style>
  @page { size: A4 portrait; margin: 9mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; color: #1a1a1a; }

  .hoja { page-break-after: always; break-after: page; }
  .hoja:last-child { page-break-after: auto; break-after: auto; }
  .marca { font-size: 7pt; color: #999; margin-bottom: 2mm; }
  .rejilla { display: grid; grid-template-columns: repeat(3, 63mm); grid-auto-rows: 88mm; gap: 0; }

  .carta {
    width: 63mm; height: 88mm; border: 0.3mm dashed #bbb;
    padding: 3.5mm; display: flex; flex-direction: column; overflow: hidden;
  }
  .cinta {
    color: #fff; font-size: 7.5pt; letter-spacing: .08em; text-transform: uppercase;
    padding: 1.2mm 2mm; margin: -3.5mm -3.5mm 2.5mm; text-align: center;
  }
  .carta h3 { margin: 0 0 2mm; font-size: 12.5pt; line-height: 1.15; text-align: center; }
  .cuerpo { flex: 1; font-size: 8.5pt; line-height: 1.4; }
  .pie { font-size: 6.8pt; color: #666; border-top: .2mm solid #ddd; padding-top: 1.2mm; text-align: center; }

  table.atributos { width: 100%; border-collapse: collapse; font-size: 8.5pt; }
  table.atributos th { text-align: left; font-weight: 600; padding: .6mm 0; width: 18mm; }
  table.atributos td { padding: .6mm 0; }
  .pips { letter-spacing: .4mm; font-size: 7pt; }
  .pips.cuerpo { color: #b5352a; }
  .pips.mente { color: #3a5a8c; }
  .num { text-align: right; font-weight: 700; width: 6mm; }
  .equipo, .especial, .descripcion { margin: 2mm 0 0; font-size: 8pt; line-height: 1.35; }
  .especial { color: #444; font-style: italic; }
  .sabor { color: #555; font-style: italic; }
  .efecto { margin: 2.5mm 0 0; font-weight: 700; font-size: 9pt; }
  .efecto.malo { color: #a02c1e; }

  .reverso { padding: 0; border: 0.3mm dashed #bbb; }
  .reverso-marco {
    width: 100%; height: 100%; background: #6b4a12;
    display: flex; align-items: center; justify-content: center; position: relative;
  }
  .reverso-rombo {
    width: 26mm; height: 26mm; background: #8a6d23; transform: rotate(45deg);
    border: 1mm solid #4a3208;
  }
  .reverso-texto {
    position: absolute; color: #f0dfae; font-size: 10pt; letter-spacing: .3em; font-weight: 700;
  }

  .hoja-texto { font-size: 10pt; line-height: 1.5; }
  .hoja-texto h1 { font-size: 17pt; margin: 0 0 3mm; }
  .hoja-texto h2 { font-size: 12pt; margin: 7mm 0 2mm; border-bottom: .3mm solid #ccc; padding-bottom: 1mm; }
  .intro { color: #555; margin: 0 0 3mm; }
  .nota { background: #f4f1e8; border-left: 1mm solid #8a6d23; padding: 2.5mm 3mm; margin: 3mm 0 0; font-size: 9pt; }
  table.referencia { width: 100%; border-collapse: collapse; font-size: 9.5pt; margin: 2mm 0; }
  table.referencia th, table.referencia td { border: .2mm solid #ccc; padding: 1.4mm 2mm; text-align: left; }
  table.referencia th { background: #eee; font-weight: 600; }
  .hoja-texto ul { margin: 2mm 0; padding-left: 5mm; }
  .hoja-texto li { margin-bottom: 1.5mm; }
</style></head>
<body>
${portada}
${paginas(cartasPersonaje, "Héroes")}
${paginas(cartasHechizo, "Hechizos")}
${paginas(cartasEquipo, "Equipo")}
${paginas(cartasTesoro, "Tesoros")}
<section class="hoja"><div class="marca">Reversos para las cartas de tesoro</div>
  <div class="rejilla">${reverso.repeat(9)}</div></section>
${tablaMonstruos}
</body></html>`;

const salida = process.argv[2] ?? "cartas.html";
fs.writeFileSync(salida, html);
const total = cartasPersonaje.length + cartasHechizo.length + cartasEquipo.length + cartasTesoro.length;
console.log(`escrito ${salida}`);
console.log(`  héroes:   ${cartasPersonaje.length}`);
console.log(`  hechizos: ${cartasHechizo.length}`);
console.log(`  equipo:   ${cartasEquipo.length}`);
console.log(`  tesoros:  ${cartasTesoro.length}`);
console.log(`  TOTAL:    ${total} cartas en ${Math.ceil(total / 9)} hojas de cartas`);
console.log(`  mobiliario: ${TOTAL_PIEZAS} piezas`);
