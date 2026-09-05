/** Construcción del estado inicial de una partida. */

import { HEROES, type ClaseHeroe, type Genero } from "../data/heroes";
import { MONSTRUOS, type EspecieMonstruo } from "../data/monsters";
import { hechizosDelElemento, type Elemento, type IdHechizo } from "../data/spells";
import { MAZO_COMPLETO } from "../data/treasure";
import { crearRng, entero, type Rng } from "./rng";
import { conMonstruosEnTablero, conPuertasVistas } from "./vision";
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

  const [mazoTesoros, rng] = barajar(
    MAZO_COMPLETO.map((c) => c.id),
    crearRng(op.semilla ?? 1),
  );

  const inicial: EstadoPartida = {
    rng,
    mision: op.mision,
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
