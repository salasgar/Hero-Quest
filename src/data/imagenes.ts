/**
 * Las imágenes que la aplicación sirve desde `public/`.
 *
 * Están aquí y no escritas a mano en cada componente por dos motivos. El
 * primero es la `base` de GitHub Pages: el sitio cuelga de `/Hero-Quest/`, no
 * de la raíz, así que toda ruta a `public/` lleva delante
 * `import.meta.env.BASE_URL`. Escribirla a mano funciona en `npm run dev` y
 * deja la imagen rota en la página publicada, que es el fallo número uno de
 * Pages y ya pasó una vez con `FOTO.archivo` (T34).
 *
 * El segundo es la licencia. Cada imagen que entra tiene que decir de dónde
 * sale; `public/IMAGENES.md` lo cuenta con detalle y esta tabla guarda lo justo
 * para que un test pueda comprobar que ninguna se ha colado sin origen.
 */

/** De dónde sale una imagen. Lo que no es ninguna de las tres, no entra. */
export type Origen =
  /** La dio Juan Luis. */
  | "aportada"
  /** Se generó en este repositorio (SVG, retoque de otra aportada). */
  | "generada"
  /** Se descargó, y entonces `licencia` dice con qué permiso. */
  | "descargada";

export interface Imagen {
  /** Nombre del fichero dentro de `public/`. Sin barra delante. */
  archivo: string;
  /** Para qué se usa, en una línea. */
  para: string;
  origen: Origen;
  /** Quién la hizo y de dónde viene. */
  procedencia: string;
  /** El permiso con el que se usa. Las descargadas no valen sin uno. */
  licencia: string;
}

export const IMAGENES: Imagen[] = [
  {
    archivo: "letras-hero-quest.png",
    para: "el original de las letras, tal como llegó; no se usa en pantalla",
    origen: "aportada",
    procedencia: "Juan Luis, 2026-09-06 («Letras Hero Quest.png», en la raíz del repositorio)",
    licencia: "de Juan Luis; se guarda para poder volver a retocarla",
  },
  {
    archivo: "logotipo.webp",
    para: "el logotipo: grande en la elección de héroes y en la transición, pequeño en la barra",
    origen: "generada",
    procedencia: "retoque de letras-hero-quest.png hecho aquí: fondo blanco recortado y márgenes quitados",
    licencia: "la misma que el original",
  },
  {
    archivo: "piedra.svg",
    para: "textura de piedra para el fondo de los paneles",
    origen: "generada",
    procedencia: "ruido procedural (feTurbulence) escrito a mano en este repositorio",
    licencia: "propia",
  },
  {
    archivo: "tablero-referencia.webp",
    para: "la foto del tablero físico con la que se cotejó la geometría",
    origen: "aportada",
    procedencia: "foto del tablero de Juan Luis; ya estaba en public/ antes de T41",
    licencia: "de Juan Luis; uso interno, no se publica como ilustración",
  },
];

/** Por nombre, para no repetir la cadena en cada componente. */
const porArchivo = new Map(IMAGENES.map((i) => [i.archivo, i]));

/**
 * La URL con la que se pide una imagen desde el navegador.
 *
 * `BASE_URL` acaba en barra tanto en desarrollo (`/`) como publicado
 * (`/Hero-Quest/`), así que se concatena y ya está.
 */
export function rutaDe(archivo: string): string {
  if (!porArchivo.has(archivo)) {
    throw new Error(`imagen no declarada en src/data/imagenes.ts: ${archivo}`);
  }
  return `${import.meta.env.BASE_URL}${archivo}`;
}

/** El logotipo, que es la que se pide desde tres sitios distintos. */
export const LOGOTIPO = "logotipo.webp";
