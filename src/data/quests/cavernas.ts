/**
 * «Las cavernas del troll» (T47).
 *
 * Un troll de las cavernas (movimiento 2, un solo dado de ataque, pero
 * defensa 6 y 10 de cuerpo: `monsters.ts`) no persigue a nadie. Como el
 * objetivo es matarlo a él, el enfrentamiento es inevitable pase lo que
 * pase; lo que decide la partida es dónde se le encuentra. Está en la gran
 * caverna (`k`, la sala central del tablero, la más grande: 30 casillas) con
 * una gárgola y dos orcos de escolta, abierta para que los cuatro héroes
 * puedan rodearlo a la vez —es la única manera de que caiga en un número
 * razonable de rondas, contra su defensa casi invulnerable— y no en un
 * pasillo estrecho donde solo uno pudiera pegarle por turno.
 *
 * **Cuatro medidas a 30 partidas, semillas 1000-1029** (`npm run sim -- 30
 * 1000 cavernas`). La primera, con guardia ligera (goblins en `l`, un orco
 * en `m` y en `n`) y solo dos orcos junto al troll: 100/93/97 % de
 * victorias, muy por encima del torreón (58/55/54 % tras el arreglo de T66)
 * pese a que las rondas ya subían a 20-22 de media. La segunda, subiendo
 * toda la guardia a orcos, doblando `m` y `n`, y añadiendo un guerrero del
 * Caos en `r`, un segundo fimir en `s` y una gárgola junto al troll: 27/27/
 * 31 %, por debajo del torreón y con una partida sin terminar en 200 rondas
 * en `astuto` —se pasó de frenada—. La tercera quita el guerrero del Caos y
 * el segundo fimir: 62/52/63 %, ya cerca del torreón, pero con hasta tres
 * partidas de treinta sin terminar en 200 rondas. Se leyó la semilla 1005
 * (`normal`) paso a paso: con dos héroes caídos antes de la ronda 8 —la
 * guardia de camino pegaba más de lo que parecía—, los dos supervivientes
 * acababan en una sala ya vaciada desde la que la única puerta cerrada que
 * les quedaba (la de la caverna, solo al norte) no era alcanzable por el
 * camino real; la heurística del simulador, sin monstruos a la vista, va a
 * la puerta cerrada más cercana **en línea recta** (T46 ya lo documentó para
 * el torreón, «una vez de cien»: aquí salía mucho más a menudo porque con
 * solo dos héroes vivos hay muchas menos formas de que alguno rompa el
 * enganche). La cuarta —la que se dejó— baja la guardia de camino a un orco
 * por sala en `m` y `n` y **abre una segunda puerta normal a la caverna**
 * (`pk2-cv`, al sur, como el torreón hizo con el salón del trono): 70/69/
 * 76 % a treinta partidas, con solo 1 de 30 sin terminar en `normal` y en
 * `astuto`, ninguna en `torpe`. Confirmada con la medida oficial de cien
 * partidas (`npm run sim`, semillas 1000-1099): **62/66/67 %**, 22-23 rondas
 * de media, y de vuelta a solo 1-2 de cien partidas sin terminar por nivel
 * —la tasa de fondo del torreón, no un enganche nuevo—. Es la tabla de la
 * terminada.
 *
 * **66 % en `normal` es más que el 55 % del torreón** (medido tras el
 * arreglo de T66), así que el catálogo (`quests/index.ts`) pone estas
 * cavernas **delante** del torreón, no detrás como se escribieron: la regla
 * del catálogo manda reordenar por la medida, no por el orden de escritura.
 *
 * El camino hasta la caverna reutiliza **las puertas del calabozo tal
 * cual**: son la misma pared física y ya están probadas (el test de
 * alcanzabilidad de T40 las cubre desde T9), más la segunda puerta de `k` de
 * la cuarta medida. Lo que cambia es la entrada —por primera vez, el
 * corredor oeste, no el norte de T46 ni el sur de la primera misión— y el
 * contenido de siete salas: dos pasos estrechos de guardia (`m`, `n`), la
 * boca de la cueva (`l`), una gruta más ancha (`r`), una cámara con el
 * tesoro del fimir que hace de último guardián (`s`) y la caverna del troll
 * (`k`). Las quince salas restantes se abren vacías, con textos de cueva
 * natural, distintos de los del calabozo y el torreón: aquí no hay
 * castillo, es una gruta bajo la montaña.
 */

import type { Celda, Mision, Mueble, Puerta, Trampa } from "../../engine/types";
import type { EspecieMonstruo } from "../monsters";

const c = (x: number, y: number): Celda => ({ x, y });

export const MISION_CAVERNAS: Mision = {
  id: "cavernas",
  titulo: "Las cavernas del troll",
  introduccion:
    "Un troll de las cavernas se ha instalado en las grutas bajo la montaña y ataca a quien " +
    "sube al puerto. Es lento y no os perseguirá si le rehuís, pero eso no basta: el pueblo " +
    "necesita el paso libre. Vuestra misión: entrar en las cuevas, abriros paso entre su " +
    "guardia y acabar con él. Cuando el troll caiga, habréis terminado.",
  /**
   * El corredor oeste, columnas 0, filas 7-10: por primera vez la entrada no
   * es la del norte (T46) ni la del sur (la primera misión). El bárbaro en
   * cabeza queda a dos casillas de la puerta de la boca de la cueva (`pl`,
   * en (0,11)); ninguna de las cuatro es vano.
   */
  entrada: [c(0, 9), c(0, 8), c(0, 10), c(0, 7)],
  textosDeSala: {
    // El camino hasta el troll.
    l: "La boca de la cueva. El aire huele a tierra húmeda y el suelo de piedra da paso a roca natural. Dos orcos vigilan junto a una hoguera casi apagada.",
    m: "Un paso estrecho entre dos paredes de roca viva. Un orco monta guardia con el hacha apoyada en la piedra.",
    n: "Otro paso angosto, gemelo del anterior. El goteo del agua no deja oír los pasos. Un orco vigila, incómodo con el silencio.",
    r: "Una gruta más ancha, con estalactitas bajas. Dos orcos custodian el camino hacia el fondo de las cuevas.",
    s: "Una cámara con un cofre medio hundido en el barro. Un fimir vigila el tesoro y no parece dispuesto a compartirlo.",
    k: "La gran caverna. El techo se pierde en la oscuridad y una figura enorme se levanta despacio de entre las rocas: el troll de las cavernas os ha visto. A su lado, una gárgola despliega las alas con un chirrido de piedra.",

    // El resto de las cuevas, vacías: una gruta natural, no un castillo.
    a: "Una gruta seca, llena de huesos pequeños de animales que se refugiaron aquí y no volvieron a salir.",
    b: "Una bolsa de aire cargado de polvo de roca. Toser aquí dentro se oye en toda la cueva.",
    c: "Un estrecho pulido por agua que ya no corre. En el suelo, marcas de garras muy grandes.",
    d: "Una gruta con el techo cubierto de murciélagos dormidos. Mejor no despertarlos.",
    e: "Una charca de agua quieta y oscura. No se le ve el fondo.",
    f: "Una gruta vacía, con las paredes cubiertas de una costra blanca, como sal.",
    g: "Un derrumbe antiguo bloquea media sala. Por la otra mitad se puede pasar igual.",
    h: "El eco aquí dentro repite cada palabra tres veces, cada vez más bajo.",
    i: "Una gruta con estalagmitas como dientes. Entre ellas, huesos más grandes que los de fuera.",
    j: "Un pasadizo natural que se estrecha hasta obligar a agacharse. Nadie lo ha hecho hoy.",
    o: "Una gruta con un hilo de agua que baja por la roca y forma un charco diminuto.",
    p: "Una gruta alta, con un agujero en el techo por el que entra un rayo de luz gris.",
    q: "Un rincón de roca negra, frío como si allí dentro fuera siempre invierno.",
    t: "Una gruta con el suelo cubierto de guano. El olor llega antes que la vista.",
    u: "Una gruta pequeña, casi redonda, con las paredes lisas de tanto rozarlas.",
    v: "El final de un pasadizo que no lleva a ninguna parte. Alguien cavó aquí y se rindió.",
  },
  objetivo: { clase: "matarA", figura: "troll" },
};

/**
 * Las puertas: **las mismas veintidós normales y tres secretas del
 * calabozo**, misma pared física, ya probadas por el test de alcanzabilidad
 * (T40) desde la primera misión. Copiarlas en vez de repetir el diseño es lo
 * mismo que hizo el torreón con las quince salas que no usaba: la geometría
 * del tablero no cambia entre misiones, solo lo que hay dentro. Los ids
 * llevan aquí el sufijo `-cv` para que no se confundan con los de las otras
 * dos misiones al leer un log o un test que las junte.
 */
export const PUERTAS_CAVERNAS: Puerta[] = [
  { id: "ps-cv", a: c(12, 15), b: c(11, 15), abierta: false, secreta: false, descubierta: true },
  { id: "pt-cv", a: c(13, 14), b: c(14, 14), abierta: false, secreta: false, descubierta: true },
  { id: "pr-cv", a: c(6, 18), b: c(6, 17), abierta: false, secreta: false, descubierta: true },
  { id: "pq-cv", a: c(0, 15), b: c(1, 15), abierta: false, secreta: false, descubierta: true },

  { id: "pa-cv", a: c(2, 0), b: c(2, 1), abierta: false, secreta: false, descubierta: true },
  { id: "pb-cv", a: c(6, 0), b: c(6, 1), abierta: false, secreta: false, descubierta: true },
  { id: "pc-cv", a: c(12, 3), b: c(11, 3), abierta: false, secreta: false, descubierta: true },
  { id: "pd-cv", a: c(13, 3), b: c(14, 3), abierta: false, secreta: false, descubierta: true },
  { id: "pe-cv", a: c(18, 0), b: c(18, 1), abierta: false, secreta: false, descubierta: true },
  { id: "pf-cv", a: c(22, 0), b: c(22, 1), abierta: false, secreta: false, descubierta: true },

  { id: "pg-cv", a: c(0, 6), b: c(1, 6), abierta: false, secreta: false, descubierta: true },
  { id: "ph-cv", a: c(9, 7), b: c(8, 7), abierta: false, secreta: false, descubierta: true },
  { id: "pi-cv", a: c(16, 7), b: c(17, 7), abierta: false, secreta: false, descubierta: true },
  { id: "pj-cv", a: c(22, 9), b: c(22, 8), abierta: false, secreta: false, descubierta: true },
  // La caverna del troll, con dos entradas normales: al norte, la del
  // calabozo y el torreón, y al sur una segunda (`pk2-cv`). No es solo
  // narrativa: con una sola puerta, la heurística del simulador —que sin
  // monstruos a la vista va a la puerta cerrada más cercana en línea
  // recta— se queda enganchada contra una pared en cuanto los dos héroes
  // que sobreviven acaban lejos del norte, porque la única puerta cerrada
  // que les queda no es alcanzable por el camino real desde donde están.
  // Con dos puertas en paredes distintas, siempre hay una alcanzable de
  // verdad desde casi cualquier sitio del tablero. El torreón (T46) ya
  // usaba dos entradas al salón del jefe; esto confirma que no era solo
  // diseño, también evita este enganche.
  { id: "pk-cv", a: c(12, 6), b: c(12, 7), abierta: false, secreta: false, descubierta: true },
  { id: "pk2-cv", a: c(14, 12), b: c(14, 11), abierta: false, secreta: false, descubierta: true },

  { id: "pl-cv", a: c(0, 11), b: c(1, 11), abierta: false, secreta: false, descubierta: true },
  { id: "pm-cv", a: c(5, 9), b: c(5, 10), abierta: false, secreta: false, descubierta: true },
  { id: "pn-cv", a: c(8, 9), b: c(8, 10), abierta: false, secreta: false, descubierta: true },
  { id: "po-cv", a: c(16, 11), b: c(17, 11), abierta: false, secreta: false, descubierta: true },
  { id: "pp-cv", a: c(25, 12), b: c(24, 12), abierta: false, secreta: false, descubierta: true },
  { id: "pu-cv", a: c(19, 18), b: c(19, 17), abierta: false, secreta: false, descubierta: true },
  { id: "pv-cv", a: c(22, 18), b: c(22, 17), abierta: false, secreta: false, descubierta: true },

  { id: "psecreta-cv", a: c(4, 13), b: c(4, 14), abierta: false, secreta: true, descubierta: false },
  { id: "psecreta-k-cv", a: c(12, 12), b: c(12, 11), abierta: false, secreta: true, descubierta: false },
  { id: "psecreta-ab-cv", a: c(4, 3), b: c(5, 3), abierta: false, secreta: true, descubierta: false },
];

/**
 * Los monstruos: once. Menos que los diecisiete del calabozo o los veinte
 * del torreón, y a propósito: la segunda medida (ver la cabecera del
 * fichero) subió tanto la guardia de camino que dos héroes caían antes de
 * llegar a la caverna, y con solo dos supervivientes el simulador se
 * enganchaba explorando lo que ya quedaba vacío (la heurística sin
 * monstruos a la vista va a la puerta cerrada más cercana en línea recta, y
 * con el grupo diezmado esa puerta deja de ser alcanzable de verdad). El
 * pico de dificultad tiene que estar en la caverna, no en el camino: un
 * orco por sala hasta la gruta ancha, y ahí, junto al troll, una gárgola y
 * dos orcos.
 */
export const MONSTRUOS_CAVERNAS: Array<{ id: string; especie: EspecieMonstruo; celda: Celda }> = [
  // La boca de la cueva (l).
  { id: "orco1", especie: "orco", celda: c(3, 10) },
  { id: "orco2", especie: "orco", celda: c(3, 12) },

  // Los dos pasos estrechos (m, n): uno cada uno, para no gastar la partida
  // antes de llegar a la caverna.
  { id: "orco3", especie: "orco", celda: c(6, 11) },
  { id: "orco4", especie: "orco", celda: c(7, 11) },

  // La gruta ancha (r).
  { id: "orco5", especie: "orco", celda: c(7, 14) },
  { id: "orco6", especie: "orco", celda: c(6, 15) },

  // La cámara del tesoro (s): el último guardián antes de la caverna.
  { id: "fimir1", especie: "fimir", celda: c(10, 16) },

  // La gran caverna (k): el troll y su escolta.
  { id: "troll", especie: "trollDeLasCavernas", celda: c(13, 9) },
  { id: "gargola1", especie: "gargola", celda: c(14, 8) },
  { id: "orco9", especie: "orco", celda: c(11, 9) },
  { id: "orco10", especie: "orco", celda: c(12, 9) },
];

/**
 * Las trampas, en el pasillo del camino: una junto a la boca de la cueva, y
 * otra en el corredor que lleva de la cámara del tesoro a la caverna.
 */
export const TRAMPAS_CAVERNAS: Trampa[] = [
  { id: "bloque1", tipo: "bloque", celda: c(0, 5), descubierta: false, gastada: false },
  { id: "foso1", tipo: "foso", celda: c(3, 9), descubierta: false, gastada: false },
  { id: "lanza1", tipo: "lanza", celda: c(13, 13), descubierta: false, gastada: false },
];

/**
 * El mobiliario: solo el cofre del fimir. Una cueva natural no tiene mesas
 * ni bastidores, y la caverna del troll se deja abierta a propósito, sin
 * nada que le dé cobertura ni le corte el paso a los héroes que la rodeen.
 */
export const MUEBLES_CAVERNAS: Mueble[] = [
  { id: "arcon1", tipo: "arcon", celdas: [c(9, 14)], bloqueaPaso: true, bloqueaVista: false },
];
