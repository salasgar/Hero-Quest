/**
 * Resolución del combate.
 *
 * El atacante tira sus dados y cuenta calaveras. El defensor tira los suyos y
 * cuenta escudos: **blancos si es héroe, negros si es monstruo**. El daño es la
 * diferencia, y cada punto quita un punto de cuerpo.
 *
 * Esa asimetría es la clave del equilibrio del juego: el escudo blanco sale en
 * 2 de cada 6 caras y el negro en 1 de cada 6, así que un monstruo con 4 dados
 * de defensa para, de media, 0,67 calaveras, mientras que un héroe con 2 dados
 * para 0,67 también. Los monstruos son mucho más frágiles de lo que aparentan.
 */

import { EQUIPO, type Equipo } from "../data/equipment";
import { HEROES } from "../data/heroes";
import { MONSTRUOS } from "../data/monsters";
import { adyacentes } from "./board";
import { puedeVer } from "./vision";
import {
  contarCalaveras,
  contarEscudosBlancos,
  contarEscudosNegros,
  tirarDadosCombate,
  type CaraCombate,
} from "./dice";
import type { Rng } from "./rng";
import { esHeroe, mismaCelda, type EstadoPartida, type Figura } from "./types";

/**
 * ¿Está esta figura metida en un foso?
 *
 * No hace falta guardarlo en la figura: un foso disparado deja su trampa
 * `gastada` en una casilla del tablero, y estar dentro es estar en esa casilla.
 * Un campo `enFoso` sería el mismo dato dos veces, y dos copias del mismo dato
 * acaban un día diciendo cosas distintas.
 */
export const enUnFoso = (e: EstadoPartida, f: Figura): boolean =>
  e.trampas.some((t) => t.tipo === "foso" && t.gastada && mismaCelda(t.celda, f.celda));

/**
 * Lo que el foso resta a una tirada de combate, con su suelo.
 *
 * Reglamento p. 17: «When in a pit, you may also attack and defend, but you
 * must roll **one fewer combat dice** when doing so. (This applies to monsters
 * as well.)»
 *
 * El recuadro que fija el suelo está escrito **solo para el héroe** —«As a
 * hero, your minimum attack or defend strength is always 1 combat die, even if
 * the pit penalty would reduce your dice to 0»— y no lleva la coletilla de los
 * monstruos que sí lleva la regla de arriba. Así que aquí el suelo es solo del
 * héroe: un goblin, que defiende con 1, dentro del foso defiende con 0. Es la
 * lectura literal y está apuntada en `_ESTADO.md` como pendiente de la palabra
 * de Juan Luis, no como certeza.
 *
 * Y el suelo protege **de la penalización del foso, no de todo**: a quien ya
 * llegue a 0 dados por otro motivo, el foso no se los sube a 1.
 */
function conPenalizacionDeFoso(e: EstadoPartida | undefined, f: Figura, dados: number): number {
  if (!e || !enUnFoso(e, f)) return dados;
  const bajado = Math.max(0, dados - 1);
  return esHeroe(f) && dados > 0 ? Math.max(1, bajado) : bajado;
}

/**
 * Un ataque es de una de estas dos clases, y la diferencia no es cosmética:
 * decide con qué arma se tira. Quien lleva ballesta y daga dispara con la
 * ballesta a lo lejos y apuñala de cerca; usar la mejor arma de las dos en los
 * dos casos sería regalarle tres dados a un cuchillo.
 */
export type ModoAtaque = "cuerpo" | "distancia";

/** Las armas del héroe que sirven para este modo de ataque. */
function armasPara(figura: Figura, modo: ModoAtaque): Equipo[] {
  if (!esHeroe(figura)) return [];
  return figura.equipo
    .map((id) => EQUIPO[id])
    .filter((e) => e.ranura === "arma" && e.ataque !== undefined)
    .filter((e) => (modo === "distancia" ? !!e.aDistancia : !e.aDistancia));
}

/** El arma a distancia que lleva, si lleva alguna. */
export const armaADistanciaDe = (figura: Figura): Equipo | undefined =>
  armasPara(figura, "distancia")[0];

/** ¿Su mejor arma de cuerpo a cuerpo alcanza en diagonal? El bastón y la lanza. */
export const atacaEnDiagonal = (figura: Figura): boolean =>
  armasPara(figura, "cuerpo").some((a) => a.atacaEnDiagonal);

/**
 * Un arma larga alcanza también en diagonal. La regla vale la pena porque es
 * la que permite que dos héroes ataquen a la vez al monstruo que tapona un
 * vano de puerta, en vez de hacer cola.
 */
function alcanzaEnDiagonal(estado: EstadoPartida, atacante: Figura, objetivo: Figura): boolean {
  if (!atacaEnDiagonal(atacante)) return false;
  const dx = Math.abs(atacante.celda.x - objetivo.celda.x);
  const dy = Math.abs(atacante.celda.y - objetivo.celda.y);
  if (dx !== 1 || dy !== 1) return false;
  return puedeVer(estado, atacante.celda, objetivo.celda);
}

/**
 * De qué clase sería el ataque de `atacante` contra `objetivo`, o null si no
 * puede atacarlo desde donde está.
 *
 * Vive aquí, en una sola función, porque el motor y la interfaz tienen que
 * responder lo mismo: si la pantalla ofrece un ataque que el motor rechaza, en
 * la mesa eso es un clic perdido y una discusión.
 */
export function modoDeAtaqueContra(
  estado: EstadoPartida,
  atacante: Figura,
  objetivo: Figura,
): ModoAtaque | null {
  if (adyacentes(estado, atacante).some((a) => a.id === objetivo.id)) return "cuerpo";
  if (alcanzaEnDiagonal(estado, atacante, objetivo)) return "cuerpo";
  if (!armaADistanciaDe(atacante)) return null;
  return puedeVer(estado, atacante.celda, objetivo.celda) ? "distancia" : null;
}

/**
 * Dados de ataque de una figura en este modo, más los bonus activos.
 *
 * `estado` es opcional y solo sirve para una cosa: descontar el dado del foso.
 * Va al final y no delante porque los tres sitios de la interfaz que llaman a
 * esta función están cogidos por T14 y no se pueden tocar desde aquí; quien
 * termine T14 solo tiene que pasarles el estado. Mientras tanto, **la pantalla
 * enseña el dado sin descontar a quien está en un foso**, y está apuntado como
 * divergencia en `_ESTADO.md`. El motor sí lo descuenta: pasa por
 * `resolverAtaque`, que siempre lo recibe.
 */
export function dadosDeAtaque(
  figura: Figura,
  modo: ModoAtaque = "cuerpo",
  estado?: EstadoPartida,
): number {
  let base: number;
  if (esHeroe(figura)) {
    const armas = armasPara(figura, modo);
    // Si lleva varias armas del mismo tipo se usa la mejor; sin ninguna que
    // valga para este modo, se pega con lo que haya: un dado.
    base = armas.length > 0 ? Math.max(...armas.map((a) => a.ataque!)) : 1;
  } else {
    base = MONSTRUOS[figura.especie].ataque;
  }
  const bonus = figura.efectos
    .filter((e) => e.clase === "bonusAtaque")
    .reduce((s, e) => s + (e.dados ?? 0), 0);
  return conPenalizacionDeFoso(estado, figura, Math.max(0, base + bonus));
}

/** Dados de defensa: base de la figura, más armadura, más bonus activos. Ver `dadosDeAtaque` sobre `estado`. */
export function dadosDeDefensa(figura: Figura, estado?: EstadoPartida): number {
  let base: number;
  if (esHeroe(figura)) {
    base = HEROES[figura.clase].defensa;
    base += figura.equipo
      .map((id) => EQUIPO[id])
      .filter((e) => e.ranura === "armadura")
      .reduce((s, e) => s + (e.defensa ?? 0), 0);
  } else {
    base = MONSTRUOS[figura.especie].defensa;
  }
  const bonus = figura.efectos
    .filter((e) => e.clase === "bonusDefensa")
    .reduce((s, e) => s + (e.dados ?? 0), 0);
  return conPenalizacionDeFoso(estado, figura, Math.max(0, base + bonus));
}

export interface ResultadoAtaque {
  dadosAtaque: CaraCombate[];
  calaveras: number;
  dadosDefensa: CaraCombate[];
  escudos: number;
  dano: number;
}

/**
 * Resuelve un ataque.
 *
 * `dadosAtaqueDados` y `dadosDefensaDados` permiten meter los resultados de los
 * dados que se han tirado en la mesa. Si no se pasan, los tira el motor. Así el
 * mismo código sirve para los héroes (que tiran de verdad) y para los monstruos
 * (que los tira la aplicación).
 *
 * Recibe el estado entero y no solo el generador porque cuántos dados se tiran
 * depende del tablero: quien está en un foso tira uno menos.
 */
export function resolverAtaque(
  e: EstadoPartida,
  atacante: Figura,
  defensor: Figura,
  dadosAtaqueDados?: readonly CaraCombate[],
  dadosDefensaDados?: readonly CaraCombate[],
  modo: ModoAtaque = "cuerpo",
): [ResultadoAtaque, Rng] {
  let r = e.rng;

  let dadosAtaque: CaraCombate[];
  if (dadosAtaqueDados) {
    dadosAtaque = [...dadosAtaqueDados];
  } else {
    const [tirada, r2] = tirarDadosCombate(r, dadosDeAtaque(atacante, modo, e));
    dadosAtaque = tirada;
    r = r2;
  }

  let dadosDefensa: CaraCombate[];
  if (dadosDefensaDados) {
    dadosDefensa = [...dadosDefensaDados];
  } else {
    const [tirada, r3] = tirarDadosCombate(r, dadosDeDefensa(defensor, e));
    dadosDefensa = tirada;
    r = r3;
  }

  const calaveras = contarCalaveras(dadosAtaque);
  const escudos = esHeroe(defensor)
    ? contarEscudosBlancos(dadosDefensa)
    : contarEscudosNegros(dadosDefensa);
  const dano = Math.max(0, calaveras - escudos);

  return [{ dadosAtaque, calaveras, dadosDefensa, escudos, dano }, r];
}

/** Daño directo sin tirada de defensa: lo usan los hechizos ofensivos. */
export function resolverDanoDirecto(
  rng: Rng,
  dados: number,
  dadosDados?: readonly CaraCombate[],
): [{ dados: CaraCombate[]; dano: number }, Rng] {
  if (dadosDados) {
    return [{ dados: [...dadosDados], dano: contarCalaveras(dadosDados) }, rng];
  }
  const [tirada, r] = tirarDadosCombate(rng, dados);
  return [{ dados: tirada, dano: contarCalaveras(tirada) }, r];
}
