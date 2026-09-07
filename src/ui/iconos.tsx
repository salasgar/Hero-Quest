/**
 * El juego de iconos para los héroes (T37).
 *
 * Todo en SVG, dentro del repositorio: la página publicada no puede cargar
 * nada de fuera (T34, sandbox de Pages), así que nada de URLs ni de fuentes de
 * iconos externas. Cada icono es un trazo grueso sin relleno ni detalle, para
 * que se lea en el círculo de una figura en el tablero (unos 14 px de radio).
 */

import type { ReactElement } from "react";
import type { ClaseHeroe } from "../data/heroes";

export type IdIcono =
  | "hacha"
  | "yelmo"
  | "martillo"
  | "barba"
  | "sombrero"
  | "baculo"
  | "estrella"
  | "libro"
  | "arco"
  | "hoja"
  | "flecha"
  | "luna"
  | "espada"
  | "escudo"
  | "alas"
  | "varita"
  | "rombo"
  | "torre"
  | "llama"
  | "ojo";

/** El trazo de cada icono, en una rejilla de 24×24. Sin relleno: solo líneas. */
const TRAZOS: Record<IdIcono, () => ReactElement> = {
  hacha: () => (
    <>
      <line x1="12" y1="4" x2="12" y2="20" />
      <path d="M12 6 L19 9 L12 13 Z" />
    </>
  ),
  yelmo: () => (
    <>
      <path d="M6 15 V11 A6 6 0 0 1 18 11 V15" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="12" y1="11" x2="12" y2="17" />
    </>
  ),
  martillo: () => (
    <>
      <line x1="12" y1="9" x2="12" y2="20" />
      <path d="M6 5 H18 V9 H6 Z" />
    </>
  ),
  barba: () => (
    <>
      <path d="M7 6 V13 L9.5 17 L12 13 L14.5 17 L17 13 V6" />
    </>
  ),
  sombrero: () => (
    <>
      <path d="M12 4 L18 16 H6 Z" />
      <line x1="4" y1="16" x2="20" y2="16" />
    </>
  ),
  baculo: () => (
    <>
      <line x1="10" y1="20" x2="15" y2="5" />
      <circle cx="16" cy="4" r="2.2" />
    </>
  ),
  estrella: () => (
    <polygon points="12,4 14.2,9.8 20,10.3 15.5,14 17,20 12,16.7 7,20 8.5,14 4,10.3 9.8,9.8" />
  ),
  libro: () => (
    <>
      <path d="M12 6 C10 5 7 5 5 5.7 V17.7 C7 17 10 17 12 18" />
      <path d="M12 6 C14 5 17 5 19 5.7 V17.7 C17 17 14 17 12 18" />
      <line x1="12" y1="6" x2="12" y2="18" />
    </>
  ),
  arco: () => (
    <>
      <path d="M8 4 A11 11 0 0 0 8 20" />
      <line x1="8" y1="4" x2="8" y2="20" />
      <line x1="8" y1="12" x2="19" y2="12" />
    </>
  ),
  hoja: () => (
    <>
      <path d="M6 18 C6 10 10 5 18 5 C18 13 13 18 6 18 Z" />
      <line x1="7.5" y1="16.5" x2="17" y2="6" />
    </>
  ),
  flecha: () => (
    <>
      <line x1="5" y1="19" x2="19" y2="5" />
      <path d="M12 5 H19 V12" />
    </>
  ),
  luna: () => (
    <path d="M15 4 A9 9 0 1 0 15 20 A7 9 0 0 1 15 4 Z" />
  ),
  espada: () => (
    <>
      <line x1="12" y1="3" x2="12" y2="16" />
      <line x1="7" y1="8" x2="17" y2="8" />
      <path d="M9 16 H15 L13.5 20 H10.5 Z" />
    </>
  ),
  escudo: () => (
    <path d="M12 4 L19 6.5 V12 C19 16.5 16 19.3 12 20.5 C8 19.3 5 16.5 5 12 V6.5 Z" />
  ),
  alas: () => (
    <>
      <path d="M12 12 C10 6 6 5 3 6.5 C5 10 4 13 6 15 C8.5 14.5 10.5 13.5 12 12 Z" />
      <path d="M12 12 C14 6 18 5 21 6.5 C19 10 20 13 18 15 C15.5 14.5 13.5 13.5 12 12 Z" />
    </>
  ),
  varita: () => (
    <>
      <line x1="6" y1="20" x2="16" y2="7" />
      <path d="M16 4 L17 6.5 L19.5 7.5 L17 8.5 L16 11 L15 8.5 L12.5 7.5 L15 6.5 Z" />
    </>
  ),
  rombo: () => <polygon points="12,4 20,12 12,20 4,12" />,
  torre: () => (
    <>
      <path d="M6 20 V10 H9 V8 H6 V5 H9 V7 H11 V5 H13 V7 H15 V5 H18 V8 H15 V10 H18 V20 Z" />
    </>
  ),
  llama: () => (
    <path d="M12 4 C15 8 16 11 14.5 14 C16 13.5 17 12.5 17 11 C19 14 18 19 12 20 C6 19 5 15 7 12 C7.5 13 8.5 13.5 9 13 C7.5 9 9 6 12 4 Z" />
  ),
  ojo: () => (
    <>
      <path d="M3 12 C6 6 18 6 21 12 C18 18 6 18 3 12 Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
};

/** Nombre en español de cada icono, para el `aria-label` y la pantalla de elección. */
export const NOMBRE_ICONO: Record<IdIcono, string> = {
  hacha: "Hacha",
  yelmo: "Yelmo",
  martillo: "Martillo",
  barba: "Barba",
  sombrero: "Sombrero puntiagudo",
  baculo: "Báculo",
  estrella: "Estrella",
  libro: "Libro",
  arco: "Arco",
  hoja: "Hoja",
  flecha: "Flecha",
  luna: "Luna",
  espada: "Espada",
  escudo: "Escudo",
  alas: "Alas",
  varita: "Varita",
  rombo: "Rombo",
  torre: "Torre",
  llama: "Llama",
  ojo: "Ojo",
};

/**
 * Los iconos agrupados como los quiso Juan Luis: por clase, y unos cuantos
 * que no son de nadie. El orden de este array es el orden de la rejilla en
 * `EleccionDeHeroes.tsx`.
 */
export const GRUPOS_DE_ICONOS: readonly { nombre: string; clase: ClaseHeroe | null; iconos: readonly IdIcono[] }[] = [
  { nombre: "Enano", clase: "enano", iconos: ["hacha", "yelmo", "martillo", "barba"] },
  { nombre: "Magia", clase: "mago", iconos: ["sombrero", "baculo", "estrella", "libro"] },
  { nombre: "Elfo", clase: "elfo", iconos: ["arco", "hoja", "flecha", "luna"] },
  { nombre: "Bárbaro", clase: "barbaro", iconos: ["espada", "escudo"] },
  { nombre: "Hada", clase: "hada", iconos: ["alas", "varita"] },
  { nombre: "Cualquiera", clase: null, iconos: ["rombo", "torre", "llama", "ojo"] },
];

/**
 * Un icono, listo para insertar donde haga falta: el tablero o la rejilla de
 * elección. `x`/`y` son las del propio `<svg>`, para poder anidarlo dentro de
 * otro sin envolverlo en un segundo `<svg>` (así lo usa `BoardMirror.tsx`).
 */
export function Icono({
  id,
  tamano = 24,
  color = "currentColor",
  x,
  y,
}: {
  id: IdIcono;
  tamano?: number;
  color?: string;
  x?: number;
  y?: number;
}) {
  return (
    <svg x={x} y={y} width={tamano} height={tamano} viewBox="0 0 24 24" role="img" aria-label={NOMBRE_ICONO[id]}>
      <g fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        {TRAZOS[id]()}
      </g>
    </svg>
  );
}
