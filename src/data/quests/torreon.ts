/**
 * «El torreón del Señor de la Guerra» — segunda misión (T46).
 *
 * Más difícil que el calabozo, no más larga: la misión vive en el ala
 * nordeste del tablero (c, d, e, f, i, j y la sala central k), los héroes
 * bajan por la escalera del norte y el jefe —un guerrero del Caos, el primero
 * que pega de verdad— espera en el salón del trono, la sala `f`, que **no
 * tiene puerta al pasillo**: se entra por la antesala `e` o por la cripta
 * `j`, y las dos están guardadas. Así los monstruos quedan entre los héroes
 * y el objetivo, que es lo que pedía la ficha, sin poner a nadie en un
 * pasillo (el catálogo exige que cada monstruo empiece en una sala).
 *
 * El objetivo es `matarA` el jefe. Es distinto del `recuperar` del calabozo
 * —enseña a la mesa que una misión puede acabar en el momento en que cae
 * alguien— y es el que el simulador mide sin trucos: sus héroes pegan a lo
 * que ven, así que la partida termina cuando llegan hasta él.
 *
 * Las 22 salas siguen abiertas y con texto, como en el calabozo: el tablero
 * es el que es y Juan Luis pidió que todas fuesen accesibles. Las que la
 * misión no usa se abren vacías, y sus textos cuentan un torreón
 * abandonado, no el calabozo de la primera misión.
 */

import type { Celda, Mision, Mueble, Puerta, Trampa } from "../../engine/types";
import type { EspecieMonstruo } from "../monsters";

const c = (x: number, y: number): Celda => ({ x, y });

export const MISION_TORREON: Mision = {
  id: "torreon",
  titulo: "El torreón del Señor de la Guerra",
  introduccion:
    "En lo alto del paso de la montaña hay un torreón que fue de los hombres del rey. " +
    "Ahora manda en él un guerrero del Caos al que llaman el Señor de la Guerra, " +
    "y desde allí baja con sus orcos a saquear las aldeas. " +
    "Vuestra misión: entrar por la escalera del norte, abriros paso hasta el salón del trono " +
    "y acabar con él. Cuando el Señor de la Guerra caiga, habréis terminado.",
  /**
   * La escalera del norte: el pasillo de la fila 0, justo encima de la
   * bajada de dos casillas de ancho que separa las salas `c` y `d`. En fila,
   * con el bárbaro en cabeza mirando hacia el este, que es donde está el
   * trono; la entrada natural son estas cuatro casillas y los héroes que no
   * quepan salen por las más cercanas (firma del 2026-09-05).
   *
   * Ninguna de las cuatro es vano: la puerta de `c` está en (10,0) y la de
   * `d` en (15,0), una casilla más allá por cada lado. Así el primer turno ya
   * tiene una puerta al alcance a cada mano, y la primera decisión de la mesa
   * es cuál abrir.
   */
  entrada: [c(13, 0), c(12, 0), c(14, 0), c(11, 0)],
  textosDeSala: {
    // El camino al trono: la galería del norte.
    c: "El cuerpo de guardia. Dos goblins se levantan de un salto y un orco agarra su hacha sin dejar de masticar.",
    d: "El patio de armas, techado a medias. Dos orcos afilan sus hachas junto a un bastidor lleno de lanzas, y un goblin corre a avisar.",
    e:
      "La antesala del trono. Una mesa larga con los restos de un banquete, y un fimir que se pone en pie despacio, " +
      "como quien sabe que no necesita darse prisa. Al fondo, una puerta con dos calaveras clavadas.",
    f:
      "El salón del trono. Estandartes rotos, un trono de hierro negro y, delante de él, un guerrero con armadura de " +
      "placas que os mira como si os hubiera estado esperando. Es el Señor de la Guerra.",
    i: "El dormitorio de la guardia. Tres goblins dormían sobre la paja; ya no. Al fondo, un arcón con el cierre roto.",
    j:
      "La cripta de los antiguos señores del torreón. Una tumba abierta, una momia que sale de ella con las vendas " +
      "colgando, y dos esqueletos que se ponen firmes como si aún fueran soldados.",
    k: "La capilla del torreón, profanada: un altar de piedra negra en el centro, un esqueleto arrodillado ante él y un zombi que arrastra los pies.",

    // El resto del torreón, abandonado. Se abre vacío.
    a: "La sala de la tarima. Un estrado de madera donde un día se juzgó a alguien. Las sillas siguen en su sitio; los jueces, no.",
    b: "La cocina. Ollas boca abajo, un fuego frío y un olor a grasa vieja que se pega a la ropa.",
    g: "El almacén de grano, vacío. Las ratas se fueron cuando se acabó el grano. Mejor no preguntar adónde.",
    h: "La sala de los mapas. En la pared, un mapa de las aldeas del valle con cruces en tinta roja sobre cada una.",
    l: "El cuarto dorado. Aquí guardaba el rey el oro del peaje; ahora solo queda el brillo en las paredes.",
    m: "Un pasadizo con literas de piedra. Alguien durmió aquí anoche: la paja aún está hundida.",
    n: "Un cuarto de aperos, con cadenas y ganchos colgando del techo. No conviene saber para qué eran.",
    o: "Las cuadras. Ni un caballo, pero sí las marcas de garras de algo mucho más grande que un caballo.",
    p: "La sala de las aspas: molinos de mano para el grano, quietos. Del techo cuelga una campana sin badajo.",
    q: "Una celda de piedra gris con un ventanuco. Alguien rascó en la pared «no confiéis en el fimir».",
    r: "Una sala salmón con una alfombra podrida. Debajo de la alfombra, un suelo que suena a hueco.",
    s: "La herrería. El yunque sigue caliente. Alguien estaba forjando aquí hace un momento.",
    t: "La sala roja: las paredes están pintadas con sangre de buey, o eso queréis creer.",
    u: "Un cuarto naranja con una escalera de mano que no lleva a ninguna parte.",
    v: "Una sala verde y agrietada. Por las grietas se cuela el viento de la montaña, y con él un aullido lejano.",
  },
  objetivo: { clase: "matarA", figura: "senorDeLaGuerra" },
};

/**
 * Las puertas: veintitrés normales y tres secretas, dentro del cartón
 * construido (25 y 4). Mismo criterio que el calabozo —cada sala con su
 * puerta normal y ninguna que dependa de una secreta—, con una excepción
 * deliberada que es el diseño de la misión:
 *
 *  - **El salón del trono `f` no abre al pasillo.** Sus dos puertas normales
 *    dan a la antesala `e` y a la cripta `j`: para llegar al jefe hay que
 *    cruzar una de las dos, y las dos tienen guardia. Sigue habiendo dos
 *    caminos, así que un grupo que se atasque en la antesala puede rodear por
 *    la cripta, y a la inversa.
 *  - Las salas de la galería del norte (`c`, `d`, `e`) abren a la fila 0, la
 *    de la escalera, y no a la bajada de dos casillas de ancho: así la
 *    primera puerta está al alcance nada más empezar.
 *  - Las tres secretas son atajos con premio: de la antesala al dormitorio de
 *    la guardia (`i`, donde está el arcón), del dormitorio a la cripta (para
 *    entrar al trono por detrás) y la salida trasera de la capilla `k`.
 *
 * Fuera del ala de la misión, las puertas están donde las puso el calabozo:
 * son las mismas paredes del mismo tablero, y ya se comprobó que ninguna
 * comparte vano.
 */
export const PUERTAS_TORREON: Puerta[] = [
  // La galería del norte, en el orden en que se encuentran desde la escalera.
  { id: "pc", a: c(10, 0), b: c(10, 1), abierta: false, secreta: false, descubierta: true },
  { id: "pd", a: c(15, 0), b: c(15, 1), abierta: false, secreta: false, descubierta: true },
  { id: "pe", a: c(18, 0), b: c(18, 1), abierta: false, secreta: false, descubierta: true },
  // El salón del trono: por la antesala o por la cripta, nunca por el pasillo.
  { id: "pf-antesala", a: c(20, 2), b: c(21, 2), abierta: false, secreta: false, descubierta: true },
  { id: "pf-cripta", a: c(22, 5), b: c(22, 4), abierta: false, secreta: false, descubierta: true },
  // El resto del ala: el dormitorio, la cripta y la capilla.
  { id: "pi", a: c(16, 7), b: c(17, 7), abierta: false, secreta: false, descubierta: true },
  { id: "pj", a: c(22, 9), b: c(22, 8), abierta: false, secreta: false, descubierta: true },
  { id: "pk", a: c(12, 6), b: c(12, 7), abierta: false, secreta: false, descubierta: true },

  // El torreón abandonado, con las puertas del calabozo.
  { id: "pa", a: c(2, 0), b: c(2, 1), abierta: false, secreta: false, descubierta: true },
  { id: "pb", a: c(6, 0), b: c(6, 1), abierta: false, secreta: false, descubierta: true },
  { id: "pg", a: c(0, 6), b: c(1, 6), abierta: false, secreta: false, descubierta: true },
  { id: "ph", a: c(9, 7), b: c(8, 7), abierta: false, secreta: false, descubierta: true },
  { id: "pl", a: c(0, 11), b: c(1, 11), abierta: false, secreta: false, descubierta: true },
  { id: "pm", a: c(5, 9), b: c(5, 10), abierta: false, secreta: false, descubierta: true },
  { id: "pn", a: c(8, 9), b: c(8, 10), abierta: false, secreta: false, descubierta: true },
  { id: "po", a: c(16, 11), b: c(17, 11), abierta: false, secreta: false, descubierta: true },
  { id: "pp", a: c(25, 12), b: c(24, 12), abierta: false, secreta: false, descubierta: true },
  { id: "pq", a: c(0, 15), b: c(1, 15), abierta: false, secreta: false, descubierta: true },
  { id: "pr", a: c(6, 18), b: c(6, 17), abierta: false, secreta: false, descubierta: true },
  { id: "ps", a: c(12, 15), b: c(11, 15), abierta: false, secreta: false, descubierta: true },
  { id: "pt", a: c(13, 14), b: c(14, 14), abierta: false, secreta: false, descubierta: true },
  { id: "pu", a: c(19, 18), b: c(19, 17), abierta: false, secreta: false, descubierta: true },
  { id: "pv", a: c(22, 18), b: c(22, 17), abierta: false, secreta: false, descubierta: true },

  // Las secretas. Todas prescindibles: las salas que unen tienen ya su puerta.
  // De la antesala al dormitorio de la guardia: quien la encuentre llega al
  // arcón sin dar la vuelta por el pasillo de la fila 6.
  { id: "psecreta-ei", a: c(19, 4), b: c(19, 5), abierta: false, secreta: true, descubierta: false },
  // Del dormitorio a la cripta: la manera de entrar al trono por detrás.
  { id: "psecreta-ij", a: c(20, 7), b: c(21, 7), abierta: false, secreta: true, descubierta: false },
  // La salida trasera de la capilla al pasillo del sur, como en el calabozo.
  { id: "psecreta-k", a: c(12, 11), b: c(12, 12), abierta: false, secreta: true, descubierta: false },
];

/**
 * Los monstruos, sala por sala y en el orden del camino al trono.
 *
 * Veinte en siete salas, frente a los diecisiete en doce del calabozo: aquí
 * están juntos y en el camino, no repartidos. La escalada es deliberada: la
 * primera sala (`c`) es del nivel del calabozo, la antesala (`e`) ya tiene un
 * fimir con dos orcos, y el salón del trono junta al guerrero del Caos —4
 * dados de ataque, 4 de defensa, 3 de cuerpo: el primer monstruo que puede
 * tumbar a un héroe de un golpe— con dos orcos de escolta.
 *
 * Los identificadores llevan la especie porque así se leen en el diario y en
 * el simulador; el nombre de pila se lo sortea `crearPartida` (T42). El jefe
 * es `senorDeLaGuerra`, que es lo que apunta el objetivo.
 */
export const MONSTRUOS_TORREON: Array<{ id: string; especie: EspecieMonstruo; celda: Celda }> = [
  // El cuerpo de guardia (c): el primer combate, del nivel del calabozo.
  { id: "goblin1", especie: "goblin", celda: c(9, 2) },
  { id: "goblin2", especie: "goblin", celda: c(11, 2) },
  { id: "orco1", especie: "orco", celda: c(11, 5) },

  // El patio de armas (d).
  { id: "orco2", especie: "orco", celda: c(14, 3) },
  { id: "orco3", especie: "orco", celda: c(16, 3) },
  { id: "goblin3", especie: "goblin", celda: c(15, 5) },

  // La antesala del trono (e): el fimir y su guardia.
  { id: "fimir1", especie: "fimir", celda: c(19, 3) },
  { id: "orco4", especie: "orco", celda: c(17, 3) },
  { id: "orco5", especie: "orco", celda: c(20, 1) },

  // El salón del trono (f): el jefe delante de su trono, con escolta.
  { id: "senorDeLaGuerra", especie: "guerreroDelCaos", celda: c(23, 3) },
  { id: "orco6", especie: "orco", celda: c(22, 1) },
  { id: "orco7", especie: "orco", celda: c(24, 4) },

  // El dormitorio de la guardia (i): tres goblins y el arcón.
  { id: "goblin4", especie: "goblin", celda: c(17, 6) },
  { id: "goblin5", especie: "goblin", celda: c(18, 8) },
  { id: "goblin6", especie: "goblin", celda: c(20, 5) },

  // La cripta (j): la otra entrada al trono, guardada por los muertos.
  { id: "momia1", especie: "momia", celda: c(22, 7) },
  { id: "esqueleto1", especie: "esqueleto", celda: c(21, 6) },
  { id: "esqueleto2", especie: "esqueleto", celda: c(24, 5) },

  // La capilla profanada (k), en el centro: no está en el camino, pero la
  // sala grande atrae a cualquier grupo que baje por la escalera.
  { id: "esqueleto3", especie: "esqueleto", celda: c(11, 8) },
  { id: "zombi1", especie: "zombi", celda: c(14, 10) },
];

/**
 * Las trampas, todas en pasillo y en el camino: la galería del norte entre
 * el patio de armas y la antesala, el pie de la bajada de dos casillas, el
 * pasillo de la columna 16 junto al dormitorio y la esquina de la cripta.
 * Ninguna bajo un vano ni en la escalera (los tests lo afirman).
 */
export const TRAMPAS_TORREON: Trampa[] = [
  { id: "lanza1", tipo: "lanza", celda: c(17, 0), descubierta: false, gastada: false },
  { id: "bloque1", tipo: "bloque", celda: c(20, 0), descubierta: false, gastada: false },
  { id: "foso1", tipo: "foso", celda: c(12, 5), descubierta: false, gastada: false },
  { id: "foso2", tipo: "foso", celda: c(16, 8), descubierta: false, gastada: false },
  { id: "lanza2", tipo: "lanza", celda: c(24, 9), descubierta: false, gastada: false },
];

/**
 * El mobiliario, del catálogo de cartón y sin pasarse de lo construido.
 * El trono estrena pieza: el calabozo lo dejó libre. Lo alto (armario,
 * bastidor) tapa la vista, y está puesto donde parte la sala en dos: el
 * armario del cuerpo de guardia obliga a rodear para llegar al orco del
 * fondo, y la mesa de la antesala deja al fimir un pasillo por el que solo
 * cabe uno.
 */
export const MUEBLES_TORREON: Mueble[] = [
  { id: "armario1", tipo: "armario", celdas: [c(9, 4), c(10, 4)], bloqueaPaso: true, bloqueaVista: true },
  { id: "bastidor1", tipo: "bastidor", celdas: [c(16, 1)], bloqueaPaso: true, bloqueaVista: true },
  { id: "mesa1", tipo: "mesa", celdas: [c(14, 4), c(15, 4)], bloqueaPaso: true, bloqueaVista: false },
  { id: "mesa2", tipo: "mesa", celdas: [c(18, 2), c(19, 2)], bloqueaPaso: true, bloqueaVista: false },
  { id: "trono1", tipo: "trono", celdas: [c(23, 2)], bloqueaPaso: true, bloqueaVista: false },
  { id: "arcon1", tipo: "arcon", celdas: [c(20, 8)], bloqueaPaso: true, bloqueaVista: false },
  { id: "tumba1", tipo: "tumba", celdas: [c(23, 7), c(24, 7)], bloqueaPaso: true, bloqueaVista: false },
  { id: "altar1", tipo: "altar", celdas: [c(12, 9), c(13, 9)], bloqueaPaso: true, bloqueaVista: false },
];
