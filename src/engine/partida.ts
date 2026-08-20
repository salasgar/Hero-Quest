/** Construcción del estado inicial de una partida. */

import { HEROES, type ClaseHeroe } from "../data/heroes";
import { MONSTRUOS, type EspecieMonstruo } from "../data/monsters";
import { hechizosDelElemento, type Elemento, type IdHechizo } from "../data/spells";
import { crearRng } from "./rng";
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
  /** Nombre que le pone quien lo juega. Si falta, se usa el de la clase. */
  nombre?: string;
  /** Elementos de hechizos. El mago elige 3 y el elfo 1. */
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

export function crearPartida(op: OpcionesPartida): EstadoPartida {
  const heroes: Heroe[] = op.heroes.map((elegido, i) => {
    const plantilla = HEROES[elegido.clase];
    const elementos = (elegido.elementos ?? []).slice(0, plantilla.gruposDeHechizos);
    const hechizos: IdHechizo[] = elementos.flatMap((el) =>
      hechizosDelElemento(el).map((h) => h.id),
    );
    return {
      tipo: "heroe",
      id: elegido.clase,
      clase: elegido.clase,
      nombre: elegido.nombre ?? plantilla.nombre,
      celda: op.mision.entrada[i % op.mision.entrada.length]!,
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

  return {
    rng: crearRng(op.semilla ?? 1),
    mision: op.mision,
    heroes,
    monstruos,
    puertas: op.puertas ?? [],
    muebles: op.muebles ?? [],
    trampas: op.trampas ?? [],
    salasReveladas: [],
    buscadoTesoro: [],
    buscadoTrampas: [],
    celdasBloqueadas: [],
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
}
