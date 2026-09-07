/**
 * Nombres por defecto de los héroes.
 *
 * Lo pidió Juan Luis el 2026-09-07: «cuando el usuario no le ponga nombre a
 * algún héroe, que la app le ponga un nombre chulo». Hasta ahora el héroe sin
 * nombre se quedaba con el de su clase, y el diario lo decía dos veces («Enano
 * el Enano»).
 *
 * Es el mismo problema que `nombres.ts` resolvió para los monstruos en T42, y
 * la forma es la misma a propósito: una lista escrita a mano y un reparto sin
 * repetir sobre un generador derivado. Cambia el índice, y no es un detalle:
 * los monstruos llevan el género fijado por la especie, mientras que un héroe
 * elige clase **y** género en la pantalla de inicio (T16), así que aquí la
 * lista va indexada por los dos.
 *
 * Criterios de la lista, heredados de `nombres.ts`:
 *  - acentuados como en castellano, porque los va a leer en voz alta un niño en
 *    la mesa: si hay que pararse a decidir dónde carga el acento, no sirven;
 *  - cada clase con su familia sonora, que es lo único que distingue a los dos
 *    enanos del grupo cuando el diario los cuenta;
 *  - ninguno sale de una obra con derechos.
 *
 * Y uno propio de esta tarea: **algunos son de varias palabras**, con
 * patronímico o gentilicio («Ácomer, hijo de Ádormir», «Groa de Cáliran»).
 * Los pidió Juan Luis el mismo día, con esos dos ejemplos. Los nombres largos
 * tienen que aguantar los dos moldes que ya usa el narrador sin tocarlo:
 * «el enano Ácomer, hijo de Ádormir» (informe, `local.ts`) y «Groa de Cáliran
 * la Elfa» (relato, `relato.ts`). Por eso los largos son **aposiciones**
 * —patronímico, casa o gentilicio— y nunca epítetos con artículo («el Tuerto»),
 * que en el molde del relato chocarían con el artículo de la clase.
 */

import { CLASES_HEROE, type ClaseHeroe, type Genero } from "./heroes";
import { entero, type Rng } from "../engine/rng";

const GENEROS: readonly Genero[] = ["m", "f"];

/**
 * El hada no tiene forma femenina propia —`HEROES.hada.nombre` da «Hada» en los
 * dos géneros— y tampoco necesita dos listas: comparte una sola, como ya hace su
 * carta. Se declara aparte para que las dos entradas de la tabla apunten a la
 * misma y no haya que mantener dos copias que se desincronizan.
 */
const NOMBRES_HADA: readonly string[] = [
  "Lumíne",
  "Címbel",
  "Piruéta",
  "Nébula",
  "Áuria",
  "Melísea",
  "Zarcíla",
  "Rocío del Alba",
  "Chíspel de los Juncos",
  "Vílana de las Luciérnagas",
  "Tílvia del Polen Dorado",
  "Ríndel, hija del Céfiro",
];

export const NOMBRES_HEROE: Readonly<
  Record<ClaseHeroe, Readonly<Record<Genero, readonly string[]>>>
> = {
  // Bárbaro: ásperos y del norte, con gentilicios de intemperie.
  barbaro: {
    m: [
      "Rónkar",
      "Vándalor",
      "Múrgo",
      "Tásvar",
      "Brúndil",
      "Kórmac, hijo de Vórmac",
      "Trúgar de las Nieves",
      "Zóndar del Hacha Roja",
      "Ólvaro de la Estepa",
      "Grímur, hijo del Trueno",
    ],
    f: [
      "Ránika",
      "Sórvela",
      "Múrgala",
      "Tásvara",
      "Éiruna",
      "Kórmila, hija de Vórmac",
      "Bránwe de las Nieves",
      "Zóndara del Hacha Roja",
      "Ólvara de la Estepa",
      "Grímura, hija del Trueno",
    ],
  },
  // Enano: piedra y forja, y el patronímico que ya trae la familia («hijo de»)
  // porque es donde mejor suena y de donde salió el ejemplo de Juan Luis.
  enano: {
    m: [
      "Dúrgan",
      "Bórin",
      "Nálgrim",
      "Tórvad",
      "Fórnak",
      "Kúldan Barbagrís",
      "Ácomer, hijo de Ádormir",
      "Grúmir de la Forja",
      "Ránmir, hijo de Ránvar",
      "Vólmir del Yunque",
    ],
    f: [
      "Dúrgana",
      "Bréna",
      "Nálgrima",
      "Tórvela",
      "Óndira",
      "Kúldana Trenzahierro",
      "Ácomira, hija de Ádormir",
      "Grúmira de la Forja",
      "Sígrid, hija de Ránvar",
      "Vólmira del Yunque",
    ],
  },
  // Elfo: líquidos y abiertos, con topónimos —de ahí sale «Groa de Cáliran»,
  // el otro ejemplo que dio Juan Luis.
  elfo: {
    m: [
      "Aelír",
      "Silván",
      "Náril",
      "Tálion",
      "Éledan",
      "Fírael",
      "Lindor de Cáliran",
      "Ilván, hijo de la Aurora",
      "Óran de los Sauces",
      "Véran del Alba",
    ],
    f: [
      "Aelíra",
      "Sílvana",
      "Nárila",
      "Táliel",
      "Éledra",
      "Fíriel",
      "Groa de Cáliran",
      "Ilvána, hija de la Aurora",
      "Órana de los Sauces",
      "Vérana del Alba",
    ],
  },
  // Mago y hechicera: cultos y algo antiguos, con casas y objetos de estudio.
  mago: {
    m: [
      "Ámbrosin",
      "Zéfiro",
      "Óriel",
      "Vólestro",
      "Cándalo",
      "Tálmiro",
      "Íngar de la Torre Gris",
      "Vélmar, hijo del Silencio",
      "Órmiel de las Siete Llaves",
      "Éndrico del Grimorio",
    ],
    f: [
      "Ámbrosia",
      "Zéfira",
      "Nérida",
      "Vólestra",
      "Cándala",
      "Sílbara",
      "Íngara de la Torre Gris",
      "Vélmara, hija del Silencio",
      "Órmiela de las Siete Llaves",
      "Éndrica del Grimorio",
    ],
  },
  hada: { m: NOMBRES_HADA, f: NOMBRES_HADA },
};

const ORDINALES = ["", "", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

const conOrdinal = (base: string, vuelta: number): string =>
  vuelta === 1 ? base : `${base} ${ORDINALES[vuelta] ?? vuelta}`;

/** Baraja de Fisher-Yates con el generador que se le pase. */
function barajar(xs: readonly string[], rng: Rng): [string[], Rng] {
  const a = [...xs];
  let r = rng;
  for (let i = a.length - 1; i > 0; i--) {
    const [j, r2] = entero(r, i + 1);
    r = r2;
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return [a, r];
}

/**
 * El primer nombre de la bolsa que no esté cogido, dando vueltas con un ordinal
 * detrás si hace falta («Dúrgan II»).
 *
 * El tope de vueltas no es una precaución vaga: con una bolsa de al menos un
 * nombre, `usados.size + 1` vueltas producen más cadenas distintas que nombres
 * hay cogidos, así que alguna sobra por fuerza. Está puesto para que una lista
 * vacía —un error al editar la tabla de arriba— dé un error legible en vez de
 * colgar la pestaña con un bucle infinito.
 */
function primeroLibre(bolsa: readonly string[], usados: ReadonlySet<string>): string {
  for (let vuelta = 1; vuelta <= usados.size + 1; vuelta++) {
    for (const base of bolsa) {
      const n = conOrdinal(base, vuelta);
      if (!usados.has(n)) return n;
    }
  }
  throw new Error("NOMBRES_HEROE tiene una lista vacía: no hay nombre que repartir.");
}

/**
 * Un nombre por héroe, sin repetir dentro de la partida.
 *
 * El generador que recibe **se agota aquí y no vuelve**, igual que el de
 * `repartirNombres` para los monstruos: quien llame tiene que pasarle uno
 * derivado de la semilla, nunca el de la partida. Si consumiera el de la
 * partida, cambiaría el resultado de todas las tiradas posteriores y con él el
 * de los tests con semilla fija, `integracion.test.ts` el primero.
 *
 * Un héroe que llega con nombre propio se lo queda **y además lo saca del
 * sorteo**, para que no se lo den a otro: si alguien llama Bórin a su enano,
 * el segundo enano del grupo no puede salir Bórin también.
 *
 * Se barajan las diez bolsas —las cinco clases por los dos géneros— aunque el
 * grupo no use ninguna: así el generador se consume siempre igual y meter un
 * bárbaro más no cambia el nombre de la elfa. Sale gratis (diez barajados de
 * diez cadenas, una vez por partida) y evita que el sorteo dependa de en qué
 * orden se eligieron los héroes.
 */
export function repartirNombresDeHeroe(
  heroes: ReadonlyArray<{ clase: ClaseHeroe; genero?: Genero; nombre?: string }>,
  rng: Rng,
): string[] {
  const bolsas = new Map<string, string[]>();
  let r = rng;
  for (const clase of CLASES_HEROE) {
    for (const genero of GENEROS) {
      const [barajado, r2] = barajar(NOMBRES_HEROE[clase][genero], r);
      r = r2;
      bolsas.set(`${clase}|${genero}`, barajado);
    }
  }

  // El hada tiene una sola lista para los dos géneros, así que sus dos bolsas
  // llevan los mismos nombres en distinto orden. El conjunto de usados es
  // global —no por bolsa— justo por eso: es lo que impide que el hada de un
  // jugador y la de otro salgan con el mismo nombre.
  const usados = new Set<string>(
    heroes.map((h) => h.nombre?.trim()).filter((n): n is string => !!n),
  );

  return heroes.map((h) => {
    const propio = h.nombre?.trim();
    if (propio) return propio;
    const bolsa = bolsas.get(`${h.clase}|${h.genero ?? "m"}`)!;
    const nombre = primeroLibre(bolsa, usados);
    usados.add(nombre);
    return nombre;
  });
}
