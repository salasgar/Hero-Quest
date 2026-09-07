/**
 * Narrador en modo relato: la misma partida contada como un libro de
 * aventuras, por ensamblaje de frases prefabricadas (firmado por Juan Luis
 * el 2026-09-06, `autorizaciones.md`). Nunca un modelo de lenguaje, nunca
 * `Math.random()`: la variante se elige por el índice del evento y el actor,
 * así que la misma partida cuenta siempre el mismo cuento, deshacer incluido.
 *
 * Misma firma que `narrar` de `local.ts`, y el mismo `switch` exhaustivo: un
 * tipo de evento nuevo que nazca sin frase aquí salta en compilación, igual
 * que en el informe.
 */

import { EQUIPO } from "../data/equipment";
import { HECHIZOS } from "../data/spells";
import { nombreDeClase } from "../data/heroes";
import type { EspecieMonstruo } from "../data/monsters";
import type { EstadoPartida, Evento, Heroe, IdFigura } from "../engine/types";
import { aA, deDe, lista, mayus, nombreDe } from "./local";
import * as F from "./frases";
import { rellenar, variante } from "./frases";

/**
 * Dos epítetos por especie, sin el nombre de pila: son para el momento en que
 * el monstruo ya se ha presentado (con su nombre, en el ataque) y no hace
 * falta repetirlo. Todos llevan ya su artículo, en el género de la especie.
 */
const EPITETOS_ESPECIE: Readonly<Record<EspecieMonstruo, readonly string[]>> = {
  goblin: ["la pequeña alimaña", "la sabandija verde"],
  orco: ["la abominación", "el engendro de la sombra"],
  fimir: ["el jorobado de un solo ojo", "la bestia del pantano"],
  esqueleto: ["el fantoche de hueso", "la reliquia andante"],
  zombi: ["el cadáver ambulante", "la carroña en pie"],
  momia: ["la horrenda momia", "el fardo de vendas podridas"],
  guerreroDelCaos: ["el campeón de la corrupción", "el guerrero maldito"],
  gargola: ["la estatua viviente", "la bestia de piedra"],
  hechiceroDelCaos: ["el nigromante", "el brujo de las sombras"],
  trollDeLasCavernas: ["el gigante torpe", "la mole de las cavernas"],
  brujo: ["el conjurador", "el hechicero menor"],
  bruja: ["la hechicera", "la vieja de los conjuros"],
  arañaGigante: ["la tejedora de horrores", "la bestia de ocho patas"],
  monstruoDeArena: ["la bestia del desierto", "el amasijo de arena viva"],
  rataGigante: ["la plaga viviente", "la roedora gigante"],
  espectro: ["la sombra errante", "el aliento helado"],
  ogro: ["el bruto", "la mole hambrienta"],
  serpienteDeLasTumbas: ["la serpiente sagrada", "la guardiana de las tumbas"],
};

/**
 * «Háfir el Enano», «Eloína la Elfa»: nombre y clase, con el artículo del
 * género con el que se juega. El hada lleva «el» siempre —«el hada», por la
 * misma regla fonética que «el agua»—, no por su género gramatical.
 */
function epitetoHeroe(h: Heroe): string {
  const articulo = h.clase === "hada" ? "el" : h.genero === "f" ? "la" : "el";
  return `${h.nombre} ${articulo} ${nombreDeClase(h.clase, h.genero)}`;
}

interface Tokens {
  [clave: string]: string | number;
}

/**
 * Los tokens de una figura en su papel habitual: con su nombre siempre.
 *
 * Para un héroe, `sujeto` (la forma de mitad de frase) **no** se pone en
 * minúscula: el epíteto empieza por su nombre propio («Háfir el Enano»), y
 * `minusc` le quitaría la mayúscula al nombre, no a un artículo. Los
 * monstruos sí lo llevan, porque su forma empieza por «el»/«la».
 */
function tokensDe(e: EstadoPartida, id: IdFigura): Tokens {
  const h = e.heroes.find((x) => x.id === id);
  if (h) {
    const ep = epitetoHeroe(h);
    return { Sujeto: ep, sujeto: ep, Objeto: ep, objeto: aA(h.nombre), objeto2: deDe(h.nombre), deQuien: deDe(h.nombre) };
  }
  const nombreForm = nombreDe(e, id); // "el orco Górbak", o el id a secas si no existe
  return {
    Sujeto: mayus(nombreForm),
    sujeto: nombreForm,
    Objeto: mayus(nombreForm),
    objeto: aA(nombreForm),
    objeto2: deDe(nombreForm),
    deQuien: deDe(nombreForm),
  };
}

/**
 * Los tokens de una figura que acaba de morir: para un monstruo, un epíteto
 * sin nombre —la variedad que pide la ficha, y no repetir lo que ya se dijo
 * en el ataque—; para un héroe, su nombre de siempre, porque con clases
 * repetidas (T16) omitirlo dejaría de saberse quién ha caído.
 */
function tokensMuerte(e: EstadoPartida, id: IdFigura, n: number): Tokens {
  const h = e.heroes.find((x) => x.id === id);
  if (h) return tokensDe(e, id);
  const m = e.monstruos.find((x) => x.id === id);
  if (!m) return tokensDe(e, id);
  const ep = variante(EPITETOS_ESPECIE[m.especie], n, id);
  return { Sujeto: mayus(ep), sujeto: ep, Objeto: mayus(ep), objeto: aA(ep), objeto2: deDe(ep), deQuien: deDe(ep) };
}

/** Si el ataque de este evento es el que remata a la víctima. */
function esGolpeMortal(e: EstadoPartida, n: number, objetivo: IdFigura): boolean {
  const siguiente = e.registro[n + 1];
  return siguiente?.tipo === "figuraDerrotada" && siguiente.figura === objetivo;
}

/** Una frase por evento, en modo relato. Devuelve null si el evento no se cuenta. */
export function narrar(e: EstadoPartida, ev: Evento, n = 0): string | null {
  switch (ev.tipo) {
    // El dato en bruto de la tirada no aporta nada al relato: lo cuenta ya
    // el propio movimiento.
    case "tiradaMovimiento":
      return null;

    case "movimiento": {
      if (ev.ruta.length === 0) return null;
      const t = { ...tokensDe(e, ev.actor), n: ev.ruta.length };
      const banco = ev.ruta.length <= 3 ? F.MOVIMIENTO_CORTO : ev.ruta.length <= 7 ? F.MOVIMIENTO_NORMAL : F.MOVIMIENTO_LARGO;
      return rellenar(variante(banco, n, ev.actor), t);
    }

    case "puertaAbierta":
      return variante(F.PUERTA_ABIERTA, n, ev.puerta);

    case "salaRevelada": {
      const base = ev.texto ?? "La sala se abre ante vosotros.";
      if (ev.monstruos.length === 0) return rellenar(variante(F.SALA_VACIA, n, ev.sala), { base });
      const quienes = lista(e, ev.monstruos);
      return rellenar(variante(F.SALA_CON_MONSTRUOS, n, ev.sala), { base, quienes });
    }

    case "ataque": {
      // `tokensDe(atacante)` deja `objeto`/`objeto2`/`deQuien` apuntando al
      // propio atacante; los tres se pisan aquí con el objetivo, que es de
      // quien hablan esas plantillas («la guardia {objeto2}», «al {objeto}»).
      const objetivo = nombreDe(e, ev.objetivo);
      const t = { ...tokensDe(e, ev.atacante), objeto: aA(objetivo), objeto2: deDe(objetivo), deQuien: deDe(objetivo) };
      if (ev.dano === 0) return rellenar(variante(F.ATAQUE_FALLA, n, ev.atacante), t);
      const banco = esGolpeMortal(e, n, ev.objetivo) ? F.ATAQUE_MATA : F.ATAQUE_HIERE;
      return rellenar(variante(banco, n, ev.atacante), t);
    }

    case "figuraDerrotada": {
      const esHeroe = e.heroes.some((h) => h.id === ev.figura);
      const t = tokensMuerte(e, ev.figura, n);
      return rellenar(variante(esHeroe ? F.MUERE_HEROE : F.MUERE_MONSTRUO, n, ev.figura), t);
    }

    case "trampaDisparada": {
      const t = tokensDe(e, ev.figura);
      if (ev.tipoTrampa === "foso")
        return rellenar(variante(ev.yaAbierta ? F.TRAMPA_FOSO_ABIERTO : F.TRAMPA_FOSO, n, ev.figura), t);
      if (ev.tipoTrampa === "lanza")
        return rellenar(variante(ev.dano === 0 ? F.TRAMPA_LANZA_ESQUIVA : F.TRAMPA_LANZA_ALCANZA, n, ev.figura), t);
      return rellenar(variante(ev.dano === 0 ? F.TRAMPA_BLOQUE_ESQUIVA : F.TRAMPA_BLOQUE_ALCANZA, n, ev.figura), t);
    }

    case "saltoDeTrampa": {
      const t = { ...tokensDe(e, ev.figura), que: ev.tipoTrampa === "foso" ? "el foso" : ev.tipoTrampa === "lanza" ? "la casilla de la lanza" : "la casilla del bloque" };
      return rellenar(variante(ev.logrado ? F.SALTO_LOGRADO : F.SALTO_FALLIDO, n, ev.figura), t);
    }

    case "trampaDescubierta":
      return variante(F.TRAMPA_DESCUBIERTA, n, ev.trampa);

    case "trampaDesarmada":
      return variante(F.TRAMPA_DESARMADA, n, ev.trampa);

    case "puertaSecretaDescubierta":
      return variante(F.PUERTA_SECRETA, n, ev.puerta);

    case "busquedaSinHallazgo":
      return variante(ev.que === "tesoro" ? F.BUSQUEDA_SIN_TESORO : F.BUSQUEDA_SIN_TRAMPAS, n, ev.actor);

    case "tesoroEncontrado":
      return rellenar(variante(F.TESORO_ORO, n, ev.actor), { ...tokensDe(e, ev.actor), n: ev.oro });

    case "objetoDeMision":
      return rellenar(variante(F.OBJETO_MISION, n, ev.actor), { ...tokensDe(e, ev.actor), objeto2: ev.objeto });

    case "objetoGuardado":
      return rellenar(variante(F.OBJETO_GUARDADO, n, ev.actor), { ...tokensDe(e, ev.actor), nombre: ev.nombre });

    case "equipoEncontrado": {
      const pieza = EQUIPO[ev.equipo].nombre.toLowerCase();
      const t = { ...tokensDe(e, ev.actor), pieza };
      return rellenar(variante(ev.puesto ? F.EQUIPO_PUESTO : F.EQUIPO_GUARDADO, n, ev.actor), t);
    }

    case "pocionUsada": {
      const propia = ev.objetivo === ev.actor;
      const t = { ...tokensDe(e, ev.actor), objeto: aA(nombreDe(e, ev.objetivo)), nombre: ev.nombre };
      return rellenar(variante(propia ? F.POCION_PROPIA : F.POCION_AJENA, n, ev.actor), t);
    }

    case "objetoDado": {
      const t = {
        ...tokensDe(e, ev.de),
        objeto: aA(nombreDe(e, ev.a)),
        nombre: ev.nombre,
        equipado: ev.puesto ? ", que se lo pone al momento" : "",
      };
      return rellenar(variante(F.OBJETO_DADO, n, ev.de), t);
    }

    case "cartaDeTesoro":
      return rellenar(variante(F.CARTA_DE_TESORO, n, ev.actor), { ...tokensDe(e, ev.actor), nombre: ev.nombre, texto: ev.texto });

    case "monstruoErrante":
      return rellenar(variante(F.MONSTRUO_ERRANTE, n, ev.monstruo), tokensDe(e, ev.monstruo));

    case "hechizoLanzado": {
      const h = HECHIZOS[ev.hechizo];
      const contra = ev.objetivo ? ` sobre ${nombreDe(e, ev.objetivo)}` : "";
      return rellenar(variante(F.HECHIZO_LANZADO, n, ev.actor), { ...tokensDe(e, ev.actor), hechizo: h.nombre, contra });
    }

    case "danoDeHechizo": {
      const h = HECHIZOS[ev.hechizo];
      const t = { ...tokensDe(e, ev.objetivo), Hechizo: h.nombre };
      return rellenar(variante(ev.dano === 0 ? F.HECHIZO_SIN_DANO : F.HECHIZO_DANO, n, ev.objetivo), t);
    }

    case "movimientoExtra":
      return rellenar(variante(F.MOVIMIENTO_EXTRA, n, ev.figura), { ...tokensDe(e, ev.figura), n: ev.casillas });

    case "curacion": {
      const t = { ...tokensDe(e, ev.figura), n: ev.puntos, puntos: ev.puntos === 1 ? "punto" : "puntos" };
      return rellenar(variante(F.CURACION, n, ev.figura), t);
    }

    case "efectoDeHechizo": {
      const quienes = lista(e, ev.objetivos);
      const t = { ...tokensDe(e, ev.objetivos[0] ?? ""), objeto: aA(quienes), objeto2: deDe(quienes), deQuien: deDe(quienes) };
      const actor = ev.objetivos[0] ?? "";
      switch (ev.clase) {
        case "dormir":
          return rellenar(variante(F.EFECTO_DORMIR, n, actor), t);
        case "perderTurno":
          return rellenar(variante(F.EFECTO_PERDER_TURNO, n, actor), t);
        case "bonusAtaque":
          return rellenar(variante(F.EFECTO_BONUS_ATAQUE, n, actor), t);
        case "bonusDefensa":
          return rellenar(variante(F.EFECTO_BONUS_DEFENSA, n, actor), t);
        case "atravesarMuros":
          return rellenar(variante(F.EFECTO_ATRAVESAR_MUROS, n, actor), t);
        case "atravesarFiguras":
          return rellenar(variante(F.EFECTO_ATRAVESAR_FIGURAS, n, actor), t);
        case "movimientoExtra":
          return rellenar(variante(F.EFECTO_MOVIMIENTO_EXTRA, n, actor), t);
      }
    }

    case "hechizoSinEfecto": {
      const h = HECHIZOS[ev.hechizo];
      const t = { ...tokensDe(e, ev.objetivo), hechizo: h.nombre, Hechizo: h.nombre };
      switch (ev.motivo) {
        case "noMuerto":
          return rellenar(variante(F.HECHIZO_NO_MUERTO, n, ev.objetivo), t);
        case "menteSuperior":
          return rellenar(variante(F.HECHIZO_MENTE_SUPERIOR, n, ev.objetivo), t);
        case "yaEstabaSano":
          return rellenar(variante(F.HECHIZO_YA_SANO, n, ev.objetivo), t);
        case "sinObjetivo":
          return rellenar(variante(F.HECHIZO_SIN_OBJETIVO, n, ev.objetivo), t);
      }
    }

    // Puramente estructurales: no aportan nada al relato, y repetirlas cada
    // vez que a un monstruo «le toca» es justo el diario de seis líneas por
    // monstruo que la ficha pide evitar.
    case "monstruoActiva":
      return null;

    // «Nada por el que no se mueve» (ficha, trampas conocidas): en el
    // informe se cuenta, en el relato no aporta nada leer que alguien no
    // hizo nada.
    case "monstruoSinActuar":
      return null;

    case "zargonSinMonstruos":
      return variante(ev.motivo === "ningunoDescubierto" ? F.ZARGON_SIN_MONSTRUOS_ESPERA : F.ZARGON_SIN_MONSTRUOS_TODOS, n);

    case "cambioDeTurno":
      return ev.actor === "zargon" ? variante(F.CAMBIO_DE_TURNO_ZARGON, n) : null;

    case "finDePartida":
      return rellenar(variante(ev.victoria ? F.FIN_VICTORIA : F.FIN_DERROTA, n), { motivo: ev.motivo });
  }
}

/** Narra una tanda de eventos, descartando los que no se cuentan. */
export const narrarTodos = (e: EstadoPartida, eventos: readonly Evento[], desde = 0): string[] =>
  eventos.map((ev, i) => narrar(e, ev, desde + i)).filter((x): x is string => x !== null);
