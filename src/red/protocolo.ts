/**
 * El protocolo del relevo: qué se guarda de una partida en red y qué decide
 * quién puede escribir en ella.
 *
 * Todo lo que hay aquí es puro. El servidor (`server/relevo.ts`) es una cáscara
 * que traduce HTTP a estas funciones, y el cliente (T31) las usa para hablar con
 * él. Que la decisión viva aquí y no dentro del Durable Object es lo que permite
 * probarla con vitest sin desplegar nada: si estuviera allí, no se probaría.
 *
 * **El relevo no sabe jugar a HeroQuest y no debe aprender.** Guarda una lista de
 * acciones y la reparte en orden; las reglas las aplica cada pantalla con el
 * motor, que es puro y determinista. De aquí no se importa nada de `engine/` que
 * no sea un tipo.
 */

import type { Accion } from "../engine/types";
import type { HeroeElegido } from "../engine/partida";

/**
 * La versión del código que juega la partida.
 *
 * Si las dos casas corren código distinto pueden aplicar reglas distintas a la
 * misma lista de acciones y divergir **en silencio**: sin excepción y sin
 * pantalla roja, simplemente el orco está vivo en una casa y muerto en la otra.
 * Por eso el relevo rechaza a quien no traiga la misma, y rechazar es correcto:
 * adivinar, no.
 *
 * **T34 la sustituye por el hash corto del commit publicado**, que es lo que
 * distingue de verdad una construcción de otra. Mientras tanto, esta constante se
 * sube a mano al cambiar algo que afecte a las reglas.
 */
export const VERSION = "2026-09-05";

/** Lo que se escribe una vez, al crear la partida, y viaja a las dos casas. */
export interface Montaje {
  version: string;
  /**
   * La semilla del generador de dados. Se decide **aquí**, una vez, y no en cada
   * navegador: hoy `Juego.tsx` la saca de `Date.now()`, y dos navegadores que
   * hagan eso obtienen números distintos, barajan el mazo de tesoros distinto y
   * juegan a dos partidas que ya no son la misma.
   */
  semilla: number;
  /** El identificador de la misión. La misión entera la tiene cada casa en su código. */
  mision: string;
  /** Tal cual lo recibe `crearPartida`. */
  heroes: HeroeElegido[];
  /** Qué jugador lleva qué figura: `{ "elfa": "marta", "barbaro": "mesa" }`. */
  reparto: Record<string, string>;
}

/** Una acción con su firma. El autor se guarda; ver `anadir` para qué no hace. */
export interface Entrada {
  accion: Accion;
  autor: string;
}

/** Una partida viva en el relevo. */
export interface Registro {
  montaje: Montaje;
  entradas: Entrada[];
  /** Quién es la mesa. No sale nunca en una respuesta: ver `vista`. */
  secretoMesa: string;
}

/**
 * Mismo convenio que el motor: lo que no se puede hacer no lanza, devuelve el
 * motivo. Un rechazo por ir atrasado trae además lo que le faltaba a quien
 * escribe, para que se ponga al día sin una segunda petición.
 */
export type Resultado<T> =
  | { ok: true; valor: T }
  | { ok: false; motivo: string; entradas?: Entrada[]; total?: number };

export function crearRegistro(montaje: Montaje, secretoMesa: string): Resultado<Registro> {
  if (montaje.version !== VERSION) {
    return {
      ok: false,
      motivo: `Esta partida se creó con otra versión de la aplicación (${montaje.version}); recarga la página.`,
    };
  }
  if (montaje.heroes.length === 0) {
    return { ok: false, motivo: "Una partida necesita al menos un héroe." };
  }
  return { ok: true, valor: { montaje, entradas: [], secretoMesa } };
}

/**
 * Añade una acción si quien escribe estaba al día.
 *
 * `esperado` es cuántas acciones creía tener: si no coincide con las que hay, la
 * escritura se rechaza y se le devuelven las que le faltaban. Sin esto, dos
 * jugadores que pulsan a la vez meten dos acciones en un orden que ninguna de las
 * dos pantallas ha visto, y ahí se rompe la reproducibilidad de la que vive todo
 * el proyecto. Es el mismo candado que el `git push` del protocolo del tablón.
 *
 * **`autor` se guarda y no se comprueba.** Una acción no nombra a su figura
 * —`{ tipo: "mover", destino }` no dice quién se mueve—, así que el relevo **no
 * puede** validar que te toque a ti: eso lo hace el cliente en T31. Queda escrito
 * para que nadie lo lea como un descuido.
 */
export function anadir(
  registro: Registro,
  peticion: { esperado: number; accion: Accion; autor: string },
): Resultado<Registro> {
  const total = registro.entradas.length;
  if (peticion.esperado !== total) {
    return {
      ok: false,
      motivo: "Te habías quedado atrás: alguien jugó antes que tú.",
      entradas: registro.entradas.slice(peticion.esperado),
      total,
    };
  }
  return {
    ok: true,
    valor: {
      ...registro,
      entradas: [...registro.entradas, { accion: peticion.accion, autor: peticion.autor }],
    },
  };
}

/**
 * El deshacer, que en red es acortar el registro.
 *
 * Deshacer aquí es lo mismo que en la mesa: rehacer la partida con una acción
 * menos. Lo hace **solo la mesa**, y por eso pide el secreto; un niño que deshace
 * desde su casa la jugada de otro es un problema de mesa, no de software, pero
 * cuesta una línea evitarlo.
 */
export function truncar(
  registro: Registro,
  peticion: { esperado: number; secreto: string },
): Resultado<Registro> {
  if (peticion.secreto !== registro.secretoMesa) {
    return { ok: false, motivo: "Solo la mesa puede deshacer." };
  }
  const total = registro.entradas.length;
  if (peticion.esperado !== total) {
    return {
      ok: false,
      motivo: "Te habías quedado atrás: alguien jugó antes que tú.",
      entradas: registro.entradas.slice(peticion.esperado),
      total,
    };
  }
  if (total === 0) return { ok: false, motivo: "No hay nada que deshacer." };
  return { ok: true, valor: { ...registro, entradas: registro.entradas.slice(0, -1) } };
}

/** Lo que se le manda a un cliente. Aquí es donde el secreto de la mesa NO sale. */
export interface Vista {
  montaje: Montaje;
  /** Solo las que le faltaban, desde `desde`. */
  entradas: Entrada[];
  /** Cuántas hay en total, que es el `esperado` de su siguiente escritura. */
  total: number;
}

export function vista(registro: Registro, desde = 0): Vista {
  const inicio = Math.max(0, Math.min(desde, registro.entradas.length));
  return {
    montaje: registro.montaje,
    entradas: registro.entradas.slice(inicio),
    total: registro.entradas.length,
  };
}

/**
 * El código que se dicta por teléfono, a partir de bytes al azar que pone quien
 * llama. Puro a propósito: los bytes los saca el servidor de
 * `crypto.getRandomValues`, **nunca** el generador del estado, que es el de los
 * dados y tiene que quedar intacto.
 *
 * El alfabeto no lleva `I`, `O`, `0` ni `1`: lo teclea alguien de diez años
 * leyéndolo de un mensaje, y esas cuatro se confunden entre sí.
 */
export const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function codigoDePartida(bytes: Uint8Array): string {
  let salida = "";
  for (const b of bytes) salida += ALFABETO[b % ALFABETO.length];
  return salida;
}

/** Cuántas letras tiene un código. Cuatro dan un millón largo de partidas. */
export const LARGO_DEL_CODIGO = 4;
