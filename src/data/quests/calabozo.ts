/**
 * «El calabozo del guardián» — primera misión, escrita a mano.
 *
 * Corta y ganable: cuatro salas, seis monstruos y un jefe blando (un fimir, no
 * un guerrero del caos) para que la primera partida con niños se gane.
 *
 * Los héroes entran por las columnas 12-13, que es el único tramo de pasillo de
 * DOS casillas de ancho del tablero. Importa, y de dos maneras: en un pasillo de
 * una sola casilla los cuatro se hacen tapón y el primero no puede ni salir,
 * porque en HeroQuest no se atraviesan las figuras; y colocados en dos filas de
 * dos, la de delante tiene que quedar mirando hacia dentro de la mazmorra, o se
 * queda encajonada por la de atrás.
 */

import type { Celda, Mision, Mueble, Puerta, Trampa } from "../../engine/types";
import type { EspecieMonstruo } from "../monsters";

const c = (x: number, y: number): Celda => ({ x, y });

export const MISION_CALABOZO: Mision = {
  id: "calabozo",
  titulo: "El calabozo del guardián",
  introduccion:
    "Bajo el castillo hay un calabozo que nadie ha vuelto a abrir en cien años. " +
    "Dicen que algo se quedó dentro montando guardia, y que todavía espera. " +
    "Vosotros vais a averiguar qué.",
  entrada: [c(12, 17), c(13, 17), c(12, 18), c(13, 18)],
  textosDeSala: {
    s: "Una sala de piedra ámbar. Hay huesos pequeños amontonados en un rincón.",
    t: "Paredes rojizas y una mesa larga volcada. Todavía huele a humo.",
    r: "El techo gotea. Cada gota suena como un paso a tu espalda.",
    q: "La piedra gris está cubierta de arañazos. Alguien intentó salir de aquí a manotazos.",
    l: "Un cuarto dorado y silencioso. Demasiado silencioso.",
  },
  objetivo: { clase: "matarA", figura: "guardian" },
};

export const PUERTAS_CALABOZO: Puerta[] = [
  { id: "ps", a: c(12, 15), b: c(11, 15), abierta: false, secreta: false, descubierta: true },
  { id: "pt", a: c(13, 14), b: c(14, 14), abierta: false, secreta: false, descubierta: true },
  { id: "pr", a: c(6, 18), b: c(6, 17), abierta: false, secreta: false, descubierta: true },
  { id: "pq", a: c(0, 15), b: c(1, 15), abierta: false, secreta: false, descubierta: true },
  // Un atajo escondido entre la sala de piedra gris y el cuarto dorado.
  { id: "psecreta", a: c(4, 13), b: c(4, 14), abierta: false, secreta: true, descubierta: false },
];

export const MONSTRUOS_CALABOZO: Array<{ id: string; especie: EspecieMonstruo; celda: Celda }> = [
  { id: "goblin1", especie: "goblin", celda: c(10, 15) },
  { id: "goblin2", especie: "goblin", celda: c(9, 16) },
  { id: "orco1", especie: "orco", celda: c(15, 15) },
  { id: "goblin3", especie: "goblin", celda: c(16, 16) },
  { id: "orco2", especie: "orco", celda: c(6, 15) },
  { id: "guardian", especie: "fimir", celda: c(2, 16) },
];

export const TRAMPAS_CALABOZO: Trampa[] = [
  { id: "foso1", tipo: "foso", celda: c(12, 14), descubierta: false, gastada: false },
  { id: "lanza1", tipo: "lanza", celda: c(15, 16), descubierta: false, gastada: false },
  { id: "bloque1", tipo: "bloque", celda: c(7, 15), descubierta: false, gastada: false },
];

export const MUEBLES_CALABOZO: Mueble[] = [
  { id: "mesa1", tipo: "mesa", celdas: [c(16, 14), c(17, 14)], bloquea: true },
  { id: "arcon1", tipo: "arcon", celdas: [c(11, 13)], bloquea: true },
  { id: "tumba1", tipo: "tumba", celdas: [c(3, 14)], bloquea: true },
];
