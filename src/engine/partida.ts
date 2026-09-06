/** Construcción del estado inicial de una partida. */

import { hayMuroEntre, vecinas } from "../data/board-base";
import { HEROES, type ClaseHeroe, type Genero } from "../data/heroes";
import { MONSTRUOS, type EspecieMonstruo } from "../data/monsters";
import { hechizosDelElemento, type Elemento, type IdHechizo } from "../data/spells";
import { MAZO_COMPLETO } from "../data/treasure";
import { crearRng, entero, type Rng } from "./rng";
import { conMonstruosEnTablero, conPuertasVistas } from "./vision";
import { claveCelda } from "./types";
import type {
  Celda,
  EstadoPartida,
  Heroe,
  Mision,
  Monstruo,
  Mueble,
  Puerta,
  Trampa,
} from "./types";

export interface HeroeElegido {
  clase: ClaseHeroe;
  /** Masculino o femenino. Por omisión, masculino. No cambia ninguna regla. */
  genero?: Genero;
  /** Nombre que le pone quien lo juega. Si falta, se usa el de la clase. */
  nombre?: string;
  /** Elementos de hechizos. El mago elige 3, el hada 2 y el elfo 1. */
  elementos?: Elemento[];
}

export interface OpcionesPartida {
  mision: Mision;
  heroes: HeroeElegido[];
  monstruos: Array<{ id: string; especie: EspecieMonstruo; celda: Celda }>;
  puertas?: Puerta[];
  muebles?: Mueble[];
  trampas?: Trampa[];
  semilla?: number;
}

/**
 * Dónde empieza cada héroe.
 *
 * Primero las casillas que la misión declara como entrada, en su orden. Si hay
 * más héroes que casillas, los que sobran salen **por las casillas más cercanas
 * a la entrada**, hacia fuera. Lo decidió Juan Luis el 2026-09-05 y está firmado
 * en `_ESTADO.md`; antes de eso, `crearPartida` se negaba a arrancar.
 *
 * Es un recorrido en anchura desde todas las casillas de entrada a la vez, así
 * que «más cercana» es en pasos por el tablero y no en línea recta: una casilla
 * pegada al otro lado de un muro está lejísimos, que es lo que se quiere.
 *
 * **El recorrido no sale de la región de la entrada**, y sale gratis:
 * `hayMuroEntre` considera muro todo cambio de región, y las puertas son datos
 * de misión que se ponen encima. Entrando por el pasillo, el grupo se estira por
 * el pasillo y nunca aparece dentro de una sala —que además empieza a oscuras, y
 * un héroe de pie en un sitio que la partida da por desconocido es justo la
 * incoherencia que no se ve hasta tres turnos después—.
 *
 * Se saltan las casillas ocupadas: mobiliario que corta el paso, monstruos y
 * trampas. Las trampas no se disparan al colocar —solo al moverse—, pero
 * empezar encima de una es una faena gratis, y `quest.test.ts` ya exige que
 * ninguna caiga sobre la entrada declarada.
 */
function casillasDeSalida(op: OpcionesPartida, cuantos: number): Celda[] {
  const entrada = op.mision.entrada;
  if (cuantos <= entrada.length) return entrada.slice(0, cuantos);

  const ocupada = new Set<string>([
    ...(op.muebles ?? []).filter((m) => m.bloqueaPaso).flatMap((m) => m.celdas.map(claveCelda)),
    ...op.monstruos.map((m) => claveCelda(m.celda)),
    ...(op.trampas ?? []).map((t) => claveCelda(t.celda)),
  ]);

  const salida: Celda[] = [];
  const vistas = new Set<string>();
  // La cola arranca con TODAS las casillas de entrada, no con la primera: así
  // el grupo crece por los dos extremos del pasillo a la vez, en vez de hacer
  // una cola de ocho por un lado.
  let frente: Celda[] = [...entrada];
  for (const c of frente) vistas.add(claveCelda(c));

  while (frente.length > 0 && salida.length < cuantos) {
    for (const c of frente) {
      if (salida.length >= cuantos) break;
      if (!ocupada.has(claveCelda(c))) salida.push(c);
    }
    const siguiente: Celda[] = [];
    for (const c of frente) {
      for (const v of vecinas(c)) {
        const k = claveCelda(v);
        if (vistas.has(k) || hayMuroEntre(c, v)) continue;
        vistas.add(k);
        siguiente.push(v);
      }
    }
    frente = siguiente;
  }

  if (salida.length < cuantos) {
    throw new Error(
      `«${op.mision.titulo}» no tiene sitio para ${cuantos} héroes: desde su entrada solo se ` +
        `alcanzan ${salida.length} casillas libres sin cruzar una puerta. Lleva menos héroes.`,
    );
  }
  return salida;
}

/** Baraja de Fisher-Yates con el generador del estado, para que sea repetible. */
function barajar<T>(xs: readonly T[], rng: Rng): [T[], Rng] {
  const a = [...xs];
  let r = rng;
  for (let i = a.length - 1; i > 0; i--) {
    const [j, r2] = entero(r, i + 1);
    r = r2;
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return [a, r];
}

export function crearPartida(op: OpcionesPartida): EstadoPartida {
  // Una casilla por héroe, sin excepción.
  //
  // Antes se repartían con `i % entrada.length`, que con más héroes que
  // casillas los **apilaba** en silencio: con ocho héroes y cuatro casillas
  // salían de dos en dos. En este motor dos figuras no caben en una casilla
  // —`figuraEn` devuelve la primera y `celdaLibre` lo prohíbe—, así que a
  // partir de ahí el movimiento, la visión y los ataques razonan sobre un
  // tablero que no existe, y el síntoma aparece tres acciones después, lejos
  // de la causa.
  // La entrada crece con el grupo, y por eso se pide el máximo entre los dos.
  //
  // Lo pidió Juan Luis el 2026-09-06: «si hay N héroes, habrá que marcar las N
  // casillas más cercanas a la salida como casillas de `mision.entrada`». No es
  // solo dónde se empieza: el objetivo «salir» (`reducer.ts`) exige a todos los
  // héroes vivos sobre una casilla de `mision.entrada`, así que con ocho héroes
  // y cuatro casillas esa victoria no sería difícil, sería imposible.
  //
  // El máximo, y no el número de héroes a secas, porque `casillasDeSalida`
  // recorta cuando le pides menos de las declaradas: con dos héroes dejaría la
  // salida en dos casillas y salir sería MÁS difícil que hoy. Él estaba
  // arreglando el caso de ocho, no estrechando el de dos.
  const salida = casillasDeSalida(op, Math.max(op.heroes.length, op.mision.entrada.length));

  // El identificador es la clase, que basta mientras no se repita. Si dos
  // jugadores quieren la misma —dos elfas, por ejemplo— el segundo lleva un
  // sufijo: dos figuras con el mismo id se pisarían la una a la otra.
  const vecesVista = new Map<ClaseHeroe, number>();

  const heroes: Heroe[] = op.heroes.map((elegido, i) => {
    const plantilla = HEROES[elegido.clase];
    const vez = (vecesVista.get(elegido.clase) ?? 0) + 1;
    vecesVista.set(elegido.clase, vez);
    const id = vez === 1 ? elegido.clase : `${elegido.clase}${vez}`;
    const genero: Genero = elegido.genero ?? "m";
    const elementos = (elegido.elementos ?? []).slice(0, plantilla.gruposDeHechizos);
    const hechizos: IdHechizo[] = elementos.flatMap((el) =>
      hechizosDelElemento(el).map((h) => h.id),
    );
    return {
      tipo: "heroe",
      id,
      clase: elegido.clase,
      genero,
      nombre: elegido.nombre?.trim() || plantilla.nombre[genero],
      celda: salida[i]!,
      cuerpo: plantilla.cuerpo,
      cuerpoMax: plantilla.cuerpo,
      mente: plantilla.mente,
      menteMax: plantilla.mente,
      equipo: [...plantilla.equipoInicial] as Heroe["equipo"],
      hechizos,
      hechizosGastados: [],
      oro: 0,
      efectos: [],
    };
  });

  const monstruos: Monstruo[] = op.monstruos.map((m) => {
    const plantilla = MONSTRUOS[m.especie];
    return {
      tipo: "monstruo",
      id: m.id,
      especie: m.especie,
      celda: m.celda,
      cuerpo: plantilla.cuerpo,
      cuerpoMax: plantilla.cuerpo,
      efectos: [],
      dormido: false,
      pierdeTurno: false,
    };
  });

  const [mazoTesoros, rng] = barajar(
    MAZO_COMPLETO.map((c) => c.id),
    crearRng(op.semilla ?? 1),
  );

  const inicial: EstadoPartida = {
    rng,
    // La misión se copia con la entrada ya crecida: a partir de aquí,
    // `estado.mision.entrada` es un dato DERIVADO del tamaño del grupo y no lo
    // que declara `quests/`. Quien escriba misiones nuevas tiene que saberlo.
    // Se copia y no se muta porque `op.mision` es un dato de módulo compartido
    // entre partidas: escribir dentro dejaría la entrada crecida para la
    // siguiente, y eso solo se ve dos partidas después.
    mision: { ...op.mision, entrada: salida },
    heroes,
    monstruos,
    puertas: op.puertas ?? [],
    muebles: op.muebles ?? [],
    trampas: op.trampas ?? [],
    salasReveladas: [],
    puertasVistas: [],
    monstruosEnTablero: [],
    buscadoTesoro: [],
    buscadoTrampas: [],
    celdasBloqueadas: [],
    mazoTesoros,
    turno: {
      orden: [...heroes.map((h) => h.id), "zargon"],
      indice: 0,
      movimientoTotal: null,
      movimientoRestante: 0,
      haMovido: false,
      haActuado: false,
      movimientoCerrado: false,
      monstruoActivo: null,
      monstruosHechos: [],
    },
    registro: [],
    desenlace: null,
  };

  // El grupo ya está mirando el pasillo antes de que nadie mueva ficha: si esto
  // saliera vacío, la primera pantalla de la partida no enseñaría ni una puerta.
  //
  // Los monstruos pasan por lo mismo aunque en «El calabozo del guardián» dé
  // lista vacía —los seis empiezan en salas cerradas—: una misión que plante uno
  // en un pasillo a la vista tiene que arrancar con él puesto, no esperando a la
  // primera acción.
  return conMonstruosEnTablero(conPuertasVistas(inicial));
}
