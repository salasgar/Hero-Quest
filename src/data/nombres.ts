/**
 * Nombres propios de los monstruos.
 *
 * Doce por especie. Dentro de una partida ningún monstruo repite nombre; entre
 * partidas sí, que es lo que pidió Juan Luis el 2026-09-06.
 *
 * Cada familia suena distinta a propósito, porque el nombre es lo único que
 * distingue a los dos goblins de la misma sala cuando el diario los cuenta:
 * goblins cortos y chillones, orcos guturales y pesados, fimir de pantano,
 * gárgolas minerales, no muertos sepulcrales —los de la momia, egipcios—,
 * Caos altisonante, y el troll largo y torpe de decir.
 *
 * Van acentuados como en castellano porque los va a leer en voz alta un niño
 * en la mesa, no un motor de texto: si hay que pararse a decidir dónde carga
 * el acento, el nombre no sirve.
 *
 * Ninguno sale de una obra con derechos. Los que suenan a algo suenan a
 * castellano corriente (osario, lápida, ciénaga, grava, obsidiana).
 */

import { ESPECIES, MONSTRUOS, type EspecieMonstruo } from "./monsters";
import { entero, type Rng } from "../engine/rng";

/**
 * Género gramatical de la especie, para decir «el orco Górbak» y «la gárgola
 * Vórtiga». Vive aquí y no en `monsters.ts` porque es un dato de cómo se
 * nombra, no de cómo pelea, y `monsters.ts` lo tocan otras tareas.
 */
export const GENERO_ESPECIE: Readonly<Record<EspecieMonstruo, "m" | "f">> = {
  goblin: "m",
  orco: "m",
  fimir: "m",
  esqueleto: "m",
  zombi: "m",
  momia: "f",
  guerreroDelCaos: "m",
  gargola: "f",
  hechiceroDelCaos: "m",
  trollDeLasCavernas: "m",
  brujo: "m",
  bruja: "f",
  arañaGigante: "f",
  monstruoDeArena: "m",
  rataGigante: "f",
  espectro: "m",
  ogro: "m",
  serpienteDeLasTumbas: "f",
};

/**
 * La especie en mitad de una frase: «orco», «gárgola», «guerrero del Caos».
 *
 * Solo baja la primera letra, no la palabra entera: `toLowerCase()` a secas
 * dejaba «guerrero del caos» y «troll de las cavernas», y ahí Caos y Cavernas
 * son nombres propios.
 */
export const especieEnMinuscula = (especie: EspecieMonstruo): string => {
  const n = MONSTRUOS[especie].nombre;
  return n.charAt(0).toLowerCase() + n.slice(1);
};

/** «el orco», «la gárgola»: la especie con el artículo de su género. */
export const conArticulo = (especie: EspecieMonstruo): string =>
  `${GENERO_ESPECIE[especie] === "f" ? "la" : "el"} ${especieEnMinuscula(especie)}`;

export const NOMBRES: Readonly<Record<EspecieMonstruo, readonly string[]>> = {
  goblin: [
    "Glupfch", "Snik", "Gribzo", "Ñáquer", "Trísguel", "Púzgal",
    "Chíspir", "Mízgor", "Vróquil", "Skárnip", "Túrbich", "Zíquiz",
  ],
  orco: [
    "Jújrur", "Górbak", "Múrgash", "Drúgor", "Rákmul", "Ugrún",
    "Zórdaj", "Brúmgar", "Hágrol", "Túrjak", "Ómgrur", "Válgroj",
  ],
  fimir: [
    "Bórgorum", "Dremvokh", "Kálradum", "Nurgozt", "Thábrimo", "Grómenkh",
    "Vúldrogo", "Ízmarok", "Khárdomo", "Bélzogrom", "Múrdovan", "Tórvekum",
  ],
  esqueleto: [
    "Sarkhem", "Óstiger", "Calvárion", "Néchraim", "Túmbaros", "Vértrigo",
    "Osáriel", "Crémenos", "Márbrego", "Fósquero", "Lápidor", "Yélvaro",
  ],
  zombi: [
    "Múldrago", "Pútrimo", "Gángreno", "Lódragor", "Vérmulo", "Ciénago",
    "Rásquilo", "Húmbroso", "Tólbago", "Mórsago", "Bábulo", "Zégrimo",
  ],
  momia: [
    "Anhotep", "Nefrarés", "Sethamón", "Kaimosis", "Amenkará", "Tutmerés",
    "Osirankh", "Rahotepis", "Nebkaure", "Imhotar", "Meritanj", "Djoserán",
  ],
  guerreroDelCaos: [
    "Malgorath", "Vharanthos", "Drakonvar", "Skorvanth", "Belzaroth", "Kharadún",
    "Morvanthir", "Zaltrakón", "Grimvárado", "Ulzareth", "Tharnegal", "Vorkhalon",
  ],
  gargola: [
    "Kránnera", "Vórtiga", "Sármeda", "Óbsira", "Grávola", "Nérquila",
    "Tálcira", "Zúrmola", "Bréndora", "Ígnera", "Mórtiga", "Cárvena",
  ],
  hechiceroDelCaos: [
    "Malefyr", "Zarkhelius", "Ombrenor", "Nycterión", "Vaelmoros", "Thaumyr",
    "Cásperion", "Nigromel", "Xanthreo", "Umbrálicus", "Perfídion", "Grimoárez",
  ],
  trollDeLasCavernas: [
    "Bumbarrámbulo", "Gorgotóntolo", "Trompicórrumbo", "Zampatólomo",
    "Cachiporrondo", "Mazacotrombo", "Pesadúmbrolo", "Tarambónculo",
    "Chapoteóndulo", "Retumbagorro", "Morrocotúmbalo", "Bostezónculo",
  ],
  // Brujo y bruja: misma familia arcana que el hechicero del Caos, con raíces
  // de ingredientes de conjuro (tizón, acónito, azufre, beleño, salitre...).
  brujo: [
    "Tizonardo", "Acónitor", "Azufrán", "Beleñoso", "Salitrego", "Endrinar",
    "Espinardo", "Ceniprado", "Resinoc", "Breáquiz", "Ortigón", "Sulfurión",
  ],
  bruja: [
    "Tizona", "Acónita", "Azufrina", "Beleñosa", "Salitrera", "Endrinia",
    "Espinela", "Cenizara", "Resinia", "Breática", "Ortigana", "Sulfúrica",
  ],
  // Araña gigante: raíces de tela y veneno.
  arañaGigante: [
    "Sedosa", "Venenaria", "Hilandra", "Patiarga", "Ponzoñela", "Telandra",
    "Zancuda", "Pegajosa", "Vellosa", "Ocelaria", "Trampiña", "Arácnea",
  ],
  // Monstruo de arena: raíces de desierto y piedra.
  monstruoDeArena: [
    "Dunardo", "Sequión", "Pedernal", "Cuarzoso", "Silícero", "Tormentán",
    "Arenisco", "Pedrusco", "Torbellindo", "Calcinoc", "Vendábalo", "Salobre",
  ],
  // Rata gigante: raíces de alcantarilla y enjambre.
  rataGigante: [
    "Roñosa", "Mordisca", "Alcantarina", "Escurridiza", "Dientuza", "Sarnosa",
    "Roedora", "Grisácea", "Hocicona", "Rabolarga", "Chillona", "Purulenta",
  ],
  // Espectro: no muerto, raíces de bruma y penumbra en vez de las sepulcrales
  // del esqueleto.
  espectro: [
    "Vaporhán", "Etérgo", "Brumindo", "Neblasco", "Umbrolar", "Diafanor",
    "Traslucián", "Penumbrino", "Espectrán", "Vahidor", "Nebulundo", "Fantasmiro",
  ],
  // Ogro: guturales y pesados como el orco, pero más toscos.
  ogro: [
    "Gorrumbo", "Bramotor", "Zampalón", "Machácor", "Trancudo", "Golpazán",
    "Porrazor", "Aplastón", "Machacón", "Trituro", "Bocazán", "Gruñastro",
  ],
  // Serpiente de las tumbas: no muerta, raíces sepulcrales como el esqueleto
  // y la momia, cruzadas con lo reptil.
  serpienteDeLasTumbas: [
    "Escamosa", "Sibilina", "Reptelia", "Sarcófila", "Tumbina", "Cripteña",
    "Mausolina", "Sepulcria", "Ponzoñosa", "Colmillara", "Escamera", "Silbadora",
  ],
};

/**
 * Cuántos nombres se guardan sin usar por especie, para los monstruos que no
 * nacen al crear la partida.
 *
 * Hoy el único que nace después es el errante de la carta de tesoro, y el mazo
 * trae **cuatro** cartas de errante en total (dos de goblin y dos de orco), así
 * que con cuatro por especie no se agota ni en la partida más larga. Se guardan
 * para las diez especies aunque solo dos puedan salir de una carta: mantener la
 * misma forma para todas ahorra un caso especial en el reductor, y son cuarenta
 * cadenas cortas.
 */
export const RESERVA_POR_ESPECIE = 4;

const ROMANOS = ["", "", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

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

export interface RepartoDeNombres {
  /** Un nombre por monstruo, en el mismo orden en que llegaron. */
  nombres: string[];
  /** Lo que queda sin repartir de cada especie, en el orden del sorteo. */
  libres: Record<EspecieMonstruo, string[]>;
}

/**
 * Reparte un nombre a cada monstruo y deja una reserva para los que vengan
 * después.
 *
 * El generador que recibe **se agota aquí y no vuelve**: quien llame tiene que
 * pasarle uno derivado, no el de la partida. Si consumiera el de la partida,
 * cambiaría el resultado de todas las tiradas posteriores y con él el de todos
 * los tests con semilla fija, que es la trampa que avisa la ficha de T42.
 *
 * Un monstruo que llega con `nombre` ya puesto —lo fija la misión— se lo queda
 * y además lo saca del sorteo, para que no se lo den a otro de su especie.
 *
 * Si una misión trae más monstruos de una especie que nombres hay, se da otra
 * vuelta a la lista con un ordinal detrás («Glupfch II»). Antes que repetir un
 * nombre a secas: en la mesa, dos monstruos llamados igual es exactamente el
 * problema que esta tarea viene a arreglar.
 */
export function repartirNombres(
  monstruos: ReadonlyArray<{ especie: EspecieMonstruo; nombre?: string }>,
  rng: Rng,
): RepartoDeNombres {
  const libres = {} as Record<EspecieMonstruo, string[]>;
  let r = rng;

  for (const especie of ESPECIES) {
    const fijados = monstruos
      .filter((m) => m.especie === especie && m.nombre)
      .map((m) => m.nombre!);
    const cuantos = monstruos.filter((m) => m.especie === especie && !m.nombre).length;

    const [barajado, r2] = barajar(NOMBRES[especie], r);
    r = r2;

    // Los que fija la misión salen del sorteo: si la misión llama Bórgorum a su
    // jefe, ningún otro fimir puede llamarse Bórgorum. Salvo que los fije los
    // doce, y entonces se sortea sobre la lista entera: quedarse sin bolsa haría
    // una división por cero en el ordinal, y un nombre repetido se ve; un NaN en
    // el nombre de un monstruo, no.
    const sinFijados = barajado.filter((n) => !fijados.includes(n));
    const bolsa = sinFijados.length > 0 ? sinFijados : barajado;

    const suficientes: string[] = [];
    for (let i = 0; i < cuantos + RESERVA_POR_ESPECIE; i++) {
      const vuelta = Math.floor(i / bolsa.length) + 1;
      const base = bolsa[i % bolsa.length]!;
      suficientes.push(vuelta === 1 ? base : `${base} ${ROMANOS[vuelta] ?? vuelta}`);
    }
    libres[especie] = suficientes;
  }

  const nombres = monstruos.map((m) => m.nombre ?? libres[m.especie].shift()!);
  return { nombres, libres };
}
