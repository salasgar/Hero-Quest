/**
 * Línea de visión y revelado de salas.
 *
 * En HeroQuest se solapan dos reglas y conviene no mezclarlas:
 *
 *  1. **La regla de las salas.** Una sala está a oscuras hasta que alguien la
 *     abre. Estando dentro se ve entera; desde fuera solo se ve si estás en el
 *     vano de una puerta abierta que da a ella. No vale asomarse desde lejos.
 *  2. **La línea geométrica.** Para los pasillos, y para los hechizos y las
 *     armas a distancia: se traza una recta de centro a centro y no puede
 *     cruzar muros, puertas cerradas, mobiliario que tape ni figuras.
 *
 * Las figuras que se cruzan por en medio SÍ tapan la línea de visión: el
 * reglamento de 2021 (pág. 14, «See (Line of Sight)») pone a héroes y monstruos
 * a la misma altura que los muros y las puertas cerradas. Ni quien mira ni el
 * objetivo se estorban a sí mismos, y una figura caída (cuerpo 0) ya no tapa.
 * El mobiliario solo tapa si es alto (estantería, armario, bastidor de armas);
 * por encima de una mesa o de una tumba se ve perfectamente.
 */

import { salaEn } from "../data/board-base";
import { pasoAbierto, figuraEn, muebleEn } from "./board";
import { claveCelda, mismaCelda, type Celda, type EstadoPartida, type IdSala } from "./types";

/** ¿Tapa la vista lo que hay en esta casilla? */
const tapaLaVista = (estado: EstadoPartida, c: Celda): boolean => {
  if (muebleEn(estado, c)?.bloqueaVista === true) return true;
  // Las caídas siguen en el estado con cuerpo 0 y ya no estorban a nadie;
  // `figuraEn` solo devuelve las vivas, así que basta con preguntarle.
  return figuraEn(estado, c) !== undefined;
};

/**
 * Las casillas que atraviesa el segmento entre los centros de `a` y `b`.
 * Se muestrea con paso fino y se quedan las casillas distintas consecutivas.
 */
export function casillasDelSegmento(a: Celda, b: Celda): Celda[] {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const pasos = Math.max(Math.abs(dx), Math.abs(dy)) * 8 || 1;
  const salida: Celda[] = [];
  let anterior = "";
  for (let i = 0; i <= pasos; i++) {
    const t = i / pasos;
    const c = { x: Math.round(a.x + dx * t), y: Math.round(a.y + dy * t) };
    const k = claveCelda(c);
    if (k !== anterior) {
      salida.push(c);
      anterior = k;
    }
  }
  return salida;
}

/**
 * Línea de visión geométrica.
 *
 * Cuando el segmento pasa justo por una esquina, el paso es diagonal. Ahí se
 * es permisivo: basta con que uno de los dos rodeos ortogonales esté abierto y
 * despejado. Es lo que pide el reglamento cuando la recta solo roza el canto de
 * una casilla, y además evita el "no lo ves por medio milímetro" en la mesa.
 */
export function lineaDeVision(estado: EstadoPartida, a: Celda, b: Celda): boolean {
  if (mismaCelda(a, b)) return true;
  const camino = casillasDelSegmento(a, b);

  for (let i = 1; i < camino.length; i++) {
    const previa = camino[i - 1]!;
    const actual = camino[i]!;

    // Solo tapa lo que está en medio: nadie se tapa a sí mismo ni tapa a su
    // propio objetivo.
    if (i < camino.length - 1 && tapaLaVista(estado, actual)) return false;

    const dx = Math.abs(actual.x - previa.x);
    const dy = Math.abs(actual.y - previa.y);

    if (dx + dy === 1) {
      if (!pasoAbierto(estado, previa, actual)) return false;
    } else {
      // Paso diagonal: vale si se puede rodear por arriba o por el lado.
      const rodeoA = { x: actual.x, y: previa.y };
      const rodeoB = { x: previa.x, y: actual.y };
      const viaA =
        pasoAbierto(estado, previa, rodeoA) && pasoAbierto(estado, rodeoA, actual) && !tapaLaVista(estado, rodeoA);
      const viaB =
        pasoAbierto(estado, previa, rodeoB) && pasoAbierto(estado, rodeoB, actual) && !tapaLaVista(estado, rodeoB);
      if (!viaA && !viaB) return false;
    }
  }
  return true;
}

/** ¿Está esta casilla en el vano de una puerta abierta que da a la sala? */
export function enElVanoDe(estado: EstadoPartida, celda: Celda, sala: IdSala): boolean {
  return estado.puertas.some((p) => {
    if (!p.abierta) return false;
    if (p.secreta && !p.descubierta) return false;
    const desdeA = mismaCelda(p.a, celda) && salaEn(p.b.x, p.b.y) === sala;
    const desdeB = mismaCelda(p.b, celda) && salaEn(p.a.x, p.a.y) === sala;
    return desdeA || desdeB;
  });
}

/**
 * ¿Ve el observador la casilla objetivo?
 * Combina la regla de las salas con la línea geométrica.
 */
export function puedeVer(estado: EstadoPartida, desde: Celda, hasta: Celda): boolean {
  const salaObjetivo = salaEn(hasta.x, hasta.y);
  const salaObservador = salaEn(desde.x, desde.y);

  if (salaObjetivo !== null) {
    // Una sala sin revelar está a oscuras para todo el mundo.
    if (!estado.salasReveladas.includes(salaObjetivo)) return false;
    // Dentro de la sala se ve todo, sin trazar rectas.
    if (salaObservador === salaObjetivo) return true;
    // Desde fuera, solo desde el vano de una puerta abierta.
    return enElVanoDe(estado, desde, salaObjetivo);
  }

  // Objetivo en pasillo: si el observador está encerrado en una sala, no ve
  // fuera salvo que esté pegado a una puerta abierta.
  if (salaObservador !== null && !enElVanoDe(estado, hasta, salaObservador)) {
    const hayPuertaAbiertaAlLado = estado.puertas.some(
      (p) => p.abierta && (mismaCelda(p.a, desde) || mismaCelda(p.b, desde)),
    );
    if (!hayPuertaAbiertaAlLado) return false;
  }

  return lineaDeVision(estado, desde, hasta);
}

/** Salas a las que da una puerta. */
export function salasDeLaPuerta(p: { a: Celda; b: Celda }): IdSala[] {
  const salas = [salaEn(p.a.x, p.a.y), salaEn(p.b.x, p.b.y)].filter(
    (s): s is IdSala => s !== null,
  );
  return [...new Set(salas)];
}

/**
 * Añade a `puertasVistas` las que algún héroe vivo alcance a ver ahora mismo.
 *
 * Acumula y nunca quita: ver una puerta es un hecho, y una vez puesta la ficha
 * de cartón sobre la mesa ya no se retira. Basta con ver **una** de sus dos
 * casillas; la de este lado se ve desde el pasillo aunque la de detrás dé a una
 * sala todavía a oscuras.
 *
 * Los monstruos no cuentan: lo que vea Zargon no lo pinta el espejo del grupo.
 */
export function conPuertasVistas(estado: EstadoPartida): EstadoPartida {
  const heroes = estado.heroes.filter((h) => h.cuerpo > 0);
  const nuevas = estado.puertas
    .filter(
      (p) =>
        !estado.puertasVistas.includes(p.id) &&
        heroes.some((h) => puedeVer(estado, h.celda, p.a) || puedeVer(estado, h.celda, p.b)),
    )
    .map((p) => p.id);
  if (nuevas.length === 0) return estado;
  return { ...estado, puertasVistas: [...estado.puertasVistas, ...nuevas] };
}

/** Comprueba si el objetivo es visible desde donde está una figura. */
export function figurasVisiblesPara(
  estado: EstadoPartida,
  desde: Celda,
  candidatas: readonly { id: string; celda: Celda; cuerpo: number }[],
): string[] {
  return candidatas.filter((f) => f.cuerpo > 0 && puedeVer(estado, desde, f.celda)).map((f) => f.id);
}
