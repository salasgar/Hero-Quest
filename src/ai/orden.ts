/**
 * En qué orden mueve Zargon a sus monstruos.
 *
 * **T8 puede sustituir esta heurística por la suya.** Si al leer esto ya existe
 * `src/ai/zargon.ts`, comprueba cuál manda antes de tocar nada: aquí no debe
 * haber dos ordenaciones vivas a la vez.
 *
 * Lo que hay aquí es **solo el orden de activación**: en qué turno le toca a
 * cada monstruo. A quién ataca y por dónde va son T8, y no dependen de esto.
 *
 * El orden es una **hipótesis**, no una verdad del reglamento: el reglamento no
 * dice nada de en qué orden se mueven los monstruos, porque presupone un máster
 * humano decidiéndolo. Por eso los criterios van separados y con nombre, para
 * que T9 los tuerza por personalidad y T10 mida si aciertan. Un `sort` con tres
 * condiciones encadenadas y sin explicación es lo que después nadie se atreve a
 * cambiar.
 */

import { modoDeAtaqueContra } from "../engine/combat";
import { monstruosPorActivar } from "../engine/selectors";
import { type EstadoPartida, type Figura } from "../engine/types";

const vivos = <T extends { cuerpo: number }>(xs: readonly T[]): T[] => xs.filter((f) => f.cuerpo > 0);

/**
 * Un criterio de ordenación. **Menor va antes**, siempre, para que encadenarlos
 * sea comparar números y no leer tres sentidos distintos de «mejor».
 */
export interface CriterioOrden {
  nombre: string;
  /** Por qué este monstruo actúa ahora, para decirlo en la mesa. */
  motivo: string;
  valor: (e: EstadoPartida, m: Figura) => number;
}

/** ¿Puede este monstruo atacar a algún héroe sin moverse? */
export const tieneATiro = (e: EstadoPartida, m: Figura): boolean =>
  vivos(e.heroes).some((h) => modoDeAtaqueContra(e, m, h) !== null);

/**
 * Casillas en línea recta hasta el héroe más cercano, sin contar muros.
 *
 * Es una distancia a ojo, no un camino: buscar el camino de verdad es T8. Los
 * monstruos no se mueven en diagonal, así que la suma de las dos diferencias es
 * la cuenta que se parece a lo que va a tardar. Devuelve `Infinity` si no queda
 * ningún héroe en pie, que es lo que deja a ese monstruo al final sin casos
 * especiales.
 *
 * Va por geometría y no por lo que el monstruo ve: Zargon sabe dónde está todo
 * el mundo —es el máster— y además, si esto midiera visión, los monstruos de
 * las salas sin revelar empatarían todos a ciegas y el orden lo acabaría
 * decidiendo el desempate.
 */
export const distanciaAlHeroeMasCercano = (e: EstadoPartida, m: Figura): number => {
  const heroes = vivos(e.heroes);
  if (heroes.length === 0) return Infinity;
  return Math.min(
    ...heroes.map((h) => Math.abs(h.celda.x - m.celda.x) + Math.abs(h.celda.y - m.celda.y)),
  );
};

/**
 * Los tres criterios, en el orden en que se aplican. El primero que rompa el
 * empate decide; si empatan los tres, decide el identificador.
 */
export const CRITERIOS: readonly CriterioOrden[] = [
  {
    nombre: "yaPuedeAtacar",
    motivo: "ya te tiene a tiro",
    // Primero quien puede pegar sin moverse. Si se le deja para el final, un
    // héroe puede haberse ido y el ataque que tenía servido se pierde: mover
    // antes al que ya está en posición es lo que haría cualquier máster.
    valor: (e, m) => (tieneATiro(e, m) ? 0 : 1),
  },
  {
    nombre: "masCerca",
    motivo: "es el que está más cerca",
    // Luego, quien antes puede llegar. Aprieta al grupo por el flanco que ya
    // está cerca en vez de repartir monstruos sueltos por el pasillo.
    valor: distanciaAlHeroeMasCercano,
  },
  {
    nombre: "masDuroPrimero",
    motivo: "es el que más aguanta",
    // Y a igualdad, el más duro delante, para que absorba los golpes de los
    // héroes antes de que les toque a los frágiles. Signo cambiado porque en
    // este archivo menor va antes.
    valor: (_e, m) => -m.cuerpo,
  },
];

/**
 * Los monstruos que quedan por activar, en el orden en que Zargon los va a
 * mover. Puro: mismo estado, mismo orden.
 *
 * **Se pide de nuevo después de cada activación, no una vez al empezar el
 * turno.** Un monstruo que muere, que se duerme o que se queda a tiro a mitad
 * del turno cambia quién va después, y una lista guardada al principio no se
 * entera.
 */
export function ordenDeActivacion(e: EstadoPartida): Figura[] {
  return [...monstruosPorActivar(e)].sort((a, b) => {
    for (const c of CRITERIOS) {
      const d = c.valor(e, a) - c.valor(e, b);
      if (d !== 0) return d;
    }
    // El desempate está escrito, no dejado al `sort`: con las salas sin revelar
    // hay muchos empates, y `Array.prototype.sort` solo promete ser estable
    // respecto al orden de entrada, que aquí es el del fichero de la misión.
    return a.id.localeCompare(b.id);
  });
}

/** El que actúa ahora, o `null` si no queda ninguno. */
export const proximoEnActuar = (e: EstadoPartida): Figura | null => ordenDeActivacion(e)[0] ?? null;

/**
 * Por qué le toca a este monstruo, en una frase corta para la mesa. Es el
 * primer criterio que lo pone por delante de quien viene detrás; si es el
 * último que queda, no hay comparación que hacer.
 */
export function motivoDeActivacion(e: EstadoPartida, m: Figura): string | null {
  const orden = ordenDeActivacion(e);
  const siguiente = orden.find((x) => x.id !== m.id);
  if (!siguiente) return null;
  const decisivo = CRITERIOS.find((c) => c.valor(e, m) !== c.valor(e, siguiente));
  return decisivo ? decisivo.motivo : null;
}
