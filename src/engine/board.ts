/**
 * Movimiento sobre el tablero: qué bloquea, qué deja pasar y hasta dónde se
 * llega con los puntos de movimiento que se han sacado.
 *
 * Reglas de HeroQuest que se aplican aquí:
 *  - Solo se mueve en ortogonal; no hay diagonales.
 *  - No se atraviesan figuras, ni amigas ni enemigas.
 *  - Un cambio de región (sala↔pasillo, o sala↔otra sala) es muro, salvo que
 *    haya una puerta y esté abierta.
 *  - Una puerta secreta sin descubrir se comporta exactamente como un muro.
 */

import {
  dentroDelTablero,
  hayMuroEntre,
  vecinas as vecinasDelTablero,
} from "../data/board-base";
import { HEROES } from "../data/heroes";
import {
  claveCelda,
  mismaCelda,
  type Celda,
  type EstadoPartida,
  type Figura,
  type IdFigura,
  type Mueble,
  type Puerta,
} from "./types";

/** La puerta que une dos casillas adyacentes, si la hay. */
export function puertaEntre(estado: EstadoPartida, a: Celda, b: Celda): Puerta | undefined {
  return estado.puertas.find(
    (p) =>
      (mismaCelda(p.a, a) && mismaCelda(p.b, b)) || (mismaCelda(p.a, b) && mismaCelda(p.b, a)),
  );
}

/** ¿Se puede cruzar de `a` a `b` sin contar figuras? Solo mira muros y puertas. */
export function pasoAbierto(estado: EstadoPartida, a: Celda, b: Celda): boolean {
  if (!dentroDelTablero(b.x, b.y)) return false;
  if (!hayMuroEntre(a, b)) return true;
  const puerta = puertaEntre(estado, a, b);
  if (!puerta) return false;
  if (puerta.secreta && !puerta.descubierta) return false;
  return puerta.abierta;
}

export function figuraEn(estado: EstadoPartida, c: Celda): Figura | undefined {
  const h = estado.heroes.find((f) => f.cuerpo > 0 && mismaCelda(f.celda, c));
  if (h) return h;
  return estado.monstruos.find((f) => f.cuerpo > 0 && mismaCelda(f.celda, c));
}

export function figuraPorId(estado: EstadoPartida, id: IdFigura): Figura | undefined {
  return estado.heroes.find((f) => f.id === id) ?? estado.monstruos.find((f) => f.id === id);
}

export function muebleEn(estado: EstadoPartida, c: Celda): Mueble | undefined {
  return estado.muebles.find((m) => m.celdas.some((k) => mismaCelda(k, c)));
}

/** ¿Está la casilla cegada por un bloque caído? */
export const celdaCegada = (estado: EstadoPartida, c: Celda): boolean =>
  estado.celdasBloqueadas.some((k) => mismaCelda(k, c));

/** ¿Esta figura vuela? Hoy solo el hada. */
export const vuela = (f: Figura): boolean => f.tipo === "heroe" && HEROES[f.clase].vuela;

/** ¿Lleva encima «atravesar la roca»? Entonces los muros no la paran. */
export const atraviesaMuros = (f: Figura): boolean =>
  f.efectos.some((x) => x.clase === "atravesarMuros");

/** ¿Pasa por encima de otras figuras? Vuela, o lleva el velo de niebla. */
export const atraviesaFiguras = (f: Figura): boolean =>
  vuela(f) || f.efectos.some((x) => x.clase === "atravesarFiguras");

/**
 * ¿Puede esta figura atravesar la casilla sin pararse en ella?
 *
 * Para casi todo el mundo es lo mismo que poder pararse. Un bloque desprendido
 * no lo cruza nadie: sella el hueco de suelo a techo.
 */
export function celdaAtravesable(estado: EstadoPartida, c: Celda, figura: Figura): boolean {
  if (!dentroDelTablero(c.x, c.y) || celdaCegada(estado, c)) return false;
  // Volar levanta muebles y figuras; el velo de niebla, solo las figuras: el
  // héroe se cuela entre los monstruos, no por encima de una mesa.
  if (vuela(figura)) return true;
  const mueble = muebleEn(estado, c);
  if (mueble?.bloqueaPaso) return false;
  if (atraviesaFiguras(figura)) return true;
  const ocupante = figuraEn(estado, c);
  return !ocupante || ocupante.id === figura.id;
}

/** ¿Puede una figura terminar o pasar por esta casilla? */
export function celdaLibre(estado: EstadoPartida, c: Celda, salvo?: IdFigura): boolean {
  if (!dentroDelTablero(c.x, c.y)) return false;
  if (celdaCegada(estado, c)) return false;
  const mueble = muebleEn(estado, c);
  if (mueble?.bloqueaPaso) return false;
  const ocupante = figuraEn(estado, c);
  if (ocupante && ocupante.id !== salvo) return false;
  return true;
}

/**
 * Casillas alcanzables con `puntos` de movimiento, con la ruta hasta cada una.
 *
 * Recorrido en anchura: en HeroQuest toda casilla cuesta 1, así que la primera
 * vez que se llega a una casilla ya es por el camino más corto.
 */
export function alcanzables(
  estado: EstadoPartida,
  figura: Figura,
  puntos: number,
): Map<string, { coste: number; ruta: Celda[] }> {
  const salida = new Map<string, { coste: number; ruta: Celda[] }>();
  if (puntos <= 0) return salida;

  const origen = figura.celda;
  // Atravesar la roca solo levanta los muros; todo lo demás (figuras, muebles,
  // bloques caídos, el borde del tablero) sigue en pie.
  const cruza = atraviesaMuros(figura)
    ? (_e: EstadoPartida, _a: Celda, b: Celda) => dentroDelTablero(b.x, b.y)
    : pasoAbierto;
  const vistas = new Set<string>([claveCelda(origen)]);
  let frontera: Array<{ celda: Celda; ruta: Celda[] }> = [{ celda: origen, ruta: [] }];

  for (let paso = 1; paso <= puntos && frontera.length > 0; paso++) {
    const siguiente: Array<{ celda: Celda; ruta: Celda[] }> = [];
    for (const { celda, ruta } of frontera) {
      for (const vecina of vecinasDelTablero(celda)) {
        const k = claveCelda(vecina);
        if (vistas.has(k)) continue;
        if (!cruza(estado, celda, vecina)) continue;
        if (!celdaAtravesable(estado, vecina, figura)) continue;
        vistas.add(k);
        const nuevaRuta = [...ruta, vecina];
        // Volar deja cruzar por encima de un mueble o de un compañero, pero no
        // aterrizar ahí: la casilla sigue estando ocupada.
        if (celdaLibre(estado, vecina, figura.id)) salida.set(k, { coste: paso, ruta: nuevaRuta });
        siguiente.push({ celda: vecina, ruta: nuevaRuta });
      }
    }
    frontera = siguiente;
  }
  return salida;
}

/** Camino más corto hasta `destino`, o null si no se llega con esos puntos. */
export function rutaHasta(
  estado: EstadoPartida,
  figura: Figura,
  destino: Celda,
  puntos: number,
): Celda[] | null {
  const mapa = alcanzables(estado, figura, puntos);
  return mapa.get(claveCelda(destino))?.ruta ?? null;
}

/**
 * Distancia en casillas hasta el objetivo ignorando cuántos puntos de
 * movimiento quedan. La usará la IA de la Fase 4 para decidir a por quién ir.
 * Devuelve Infinity si no hay camino.
 */
export function distancia(estado: EstadoPartida, figura: Figura, destino: Celda): number {
  if (mismaCelda(figura.celda, destino)) return 0;
  const mapa = alcanzables(estado, figura, 60);
  return mapa.get(claveCelda(destino))?.coste ?? Infinity;
}

/** Figuras adyacentes en ortogonal: a quién se puede atacar cuerpo a cuerpo. */
export function adyacentes(estado: EstadoPartida, figura: Figura): Figura[] {
  const out: Figura[] = [];
  for (const vecina of vecinasDelTablero(figura.celda)) {
    // Para atacar hace falta que no haya muro ni puerta cerrada de por medio.
    if (!pasoAbierto(estado, figura.celda, vecina)) continue;
    const otra = figuraEn(estado, vecina);
    if (otra) out.push(otra);
  }
  return out;
}
