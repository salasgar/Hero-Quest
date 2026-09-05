/**
 * Consultas derivadas del estado. Es lo que alimenta las ayudas visuales de la
 * pantalla del máster: casillas a las que se puede ir, a quién se puede atacar,
 * qué puertas se pueden abrir desde aquí.
 *
 * Todo son funciones puras sobre el estado: ni guardan nada ni tocan la interfaz.
 */

import { salaEn } from "../data/board-base";
import { HECHIZOS, type IdHechizo } from "../data/spells";
import { alcanzables, figuraPorId } from "./board";
import { dadosDeAtaque, dadosDeDefensa, modoDeAtaqueContra } from "./combat";
import { actorActual, esTurnoDeZargon, figuraActiva, monstruosActivables, yaRegistro } from "./reducer";
import { puedeVer } from "./vision";
import {
  claveCelda,
  esHeroe,
  mismaCelda,
  type Celda,
  type EstadoPartida,
  type Figura,
  type IdFigura,
  type Puerta,
} from "./types";

export { actorActual, esTurnoDeZargon, figuraActiva };

const vivos = <T extends { cuerpo: number }>(xs: readonly T[]): T[] => xs.filter((f) => f.cuerpo > 0);

/** Casillas a las que la figura activa puede ir ahora mismo. */
export function casillasDeMovimiento(e: EstadoPartida): Celda[] {
  const f = figuraActiva(e);
  if (!f || e.turno.movimientoCerrado || e.turno.movimientoRestante <= 0) return [];
  return [...alcanzables(e, f, e.turno.movimientoRestante).values()].map(
    (v) => v.ruta[v.ruta.length - 1]!,
  );
}

/** Enemigos a los que la figura activa puede atacar ahora mismo. */
export function objetivosDeAtaque(e: EstadoPartida): Figura[] {
  const f = figuraActiva(e);
  if (!f || e.turno.haActuado) return [];

  // Los pegados y los que están a tiro, juntos: llevar ballesta no impide
  // apuñalar a quien tienes encima, ni llevar espada impide disparar si además
  // llevas ballesta. El modo lo decide después la casilla del objetivo.
  const enemigos = esHeroe(f) ? vivos(e.monstruos) : vivos(e.heroes);
  return enemigos.filter((x) => modoDeAtaqueContra(e, f, x) !== null);
}

/** Con cuántos dados atacaría la figura activa a este objetivo. */
export function dadosDeAtaqueContra(e: EstadoPartida, objetivo: Figura): number {
  const f = figuraActiva(e);
  if (!f) return 0;
  const modo = modoDeAtaqueContra(e, f, objetivo);
  return dadosDeAtaque(f, modo ?? "cuerpo", e);
}

/** Puertas que la figura activa puede abrir sin moverse. */
export function puertasAlAlcance(e: EstadoPartida): Puerta[] {
  const f = figuraActiva(e);
  if (!f) return [];
  return e.puertas.filter(
    (p) =>
      !p.abierta &&
      (!p.secreta || p.descubierta) &&
      (mismaCelda(p.a, f.celda) || mismaCelda(p.b, f.celda)),
  );
}

/**
 * Puertas que el espejo del tablero debe pintar.
 *
 * Son dos condiciones distintas y las dos tienen que cumplirse, así que van
 * juntas y no mezcladas:
 *
 *  - Una puerta **normal** se pinta cuando alguien del grupo ha llegado a verla
 *    alguna vez (`puertasVistas`).
 *  - Una **secreta** se pinta cuando está descubierta, y da igual quién la vea:
 *    hasta entonces se comporta como muro por mucho que el grupo pase por
 *    delante, y a partir de entonces **descubrirla es un hecho tan bueno como
 *    haberla visto**, así que sigue pintada cuando el grupo se aleja.
 */
export function puertasVisibles(e: EstadoPartida): Puerta[] {
  return e.puertas.filter((p) => (p.secreta ? p.descubierta : e.puertasVistas.includes(p.id)));
}

/** Hechizos que el héroe de turno puede lanzar, con sus objetivos posibles. */
export function hechizosLanzables(e: EstadoPartida): Array<{ hechizo: IdHechizo; objetivos: Figura[] }> {
  const f = figuraActiva(e);
  if (!f || !esHeroe(f) || e.turno.haActuado) return [];

  return f.hechizos.map((id) => {
    const h = HECHIZOS[id];
    let candidatos: Figura[];
    switch (h.objetivo) {
      case "unEnemigo":
        candidatos = vivos(e.monstruos);
        break;
      case "unHeroe":
        candidatos = vivos(e.heroes);
        break;
      case "unoMismo":
        candidatos = [f];
        break;
      case "enemigosDeLaSala":
        candidatos = vivos(e.monstruos);
        break;
    }
    const objetivos = h.requiereVision
      ? candidatos.filter((c) => puedeVer(e, f.celda, c.celda))
      : candidatos;
    return { hechizo: id, objetivos };
  });
}

/** Resumen de una figura para la hoja de personaje. */
export function fichaDe(e: EstadoPartida, id: IdFigura) {
  const f = figuraPorId(e, id);
  if (!f) return null;
  return {
    id: f.id,
    nombre: esHeroe(f) ? f.nombre : f.especie,
    cuerpo: f.cuerpo,
    cuerpoMax: f.cuerpoMax,
    ataque: dadosDeAtaque(f, "cuerpo", e),
    defensa: dadosDeDefensa(f, e),
    celda: f.celda,
    sala: salaEn(f.celda.x, f.celda.y),
    efectos: f.efectos,
  };
}

/**
 * Monstruos que Zargon todavía puede activar en este turno.
 *
 * El filtro no se escribe aquí: es `monstruosActivables`, en `reducer.ts`, el
 * mismo que usan la guarda de `activarMonstruo` y el cierre del turno. Estuvo
 * copiado en los tres sitios y los tres tenían que cambiar a la vez.
 */
export function monstruosPorActivar(e: EstadoPartida): Figura[] {
  if (!esTurnoDeZargon(e)) return [];
  return monstruosActivables(e);
}

/**
 * ¿Se puede registrar esta sala en busca de tesoro?
 *
 * Tres condiciones: estar dentro de una sala, que **este héroe** no la haya
 * registrado ya —los otros tres sí pueden, reglamento p. 14— y que no haya
 * monstruos a la vista. Si la interfaz no comprueba esto, pinta un botón que el
 * motor va a rechazar, y eso en la mesa es un clic perdido.
 */
export function puedeBuscarTesoro(e: EstadoPartida): boolean {
  const f = figuraActiva(e);
  if (!f || !esHeroe(f) || e.turno.haActuado) return false;
  const sala = salaEn(f.celda.x, f.celda.y);
  if (sala === null || yaRegistro(e, f.id, sala)) return false;
  return !vivos(e.monstruos).some((m) => puedeVer(e, f.celda, m.celda));
}

/**
 * Buscar trampas y pasadizos vale en cualquier sitio, incluido el pasillo, pero
 * **no con un monstruo a la vista**.
 *
 * Reglamento p. 16, y lo dice dos veces con las mismas palabras, una para las
 * trampas y otra para los pasadizos: «As a hero, you can only search for traps
 * if there are no monsters visible to you». Es la misma condición que
 * `puedeBuscarTesoro` de aquí arriba, y por eso se lee igual: quien la cambie
 * en un sitio tiene que cambiarla en el otro.
 */
export function puedeBuscarTrampas(e: EstadoPartida): boolean {
  const f = figuraActiva(e);
  if (!f || !esHeroe(f) || e.turno.haActuado) return false;
  return !vivos(e.monstruos).some((m) => puedeVer(e, f.celda, m.celda));
}

/** Todo lo que la figura activa puede hacer, para pintar los botones. */
export function accionesDisponibles(e: EstadoPartida) {
  const f = figuraActiva(e);
  return {
    puedeTirarMovimiento: !esTurnoDeZargon(e) && e.turno.movimientoTotal === null && !!f,
    puedeMover: casillasDeMovimiento(e).length > 0,
    puedeAtacar: objetivosDeAtaque(e).length > 0,
    puedeAbrirPuerta: puertasAlAlcance(e).length > 0,
    puedeBuscarTesoro: puedeBuscarTesoro(e),
    puedeBuscarTrampas: puedeBuscarTrampas(e),
    puedeLanzarHechizo: hechizosLanzables(e).some((h) => h.objetivos.length > 0),
  };
}

/** Índice rápido casilla → figura, para pintar el tablero. */
export function figurasPorCelda(e: EstadoPartida): Map<string, Figura> {
  const m = new Map<string, Figura>();
  for (const f of [...vivos(e.heroes), ...vivos(e.monstruos)]) m.set(claveCelda(f.celda), f);
  return m;
}
