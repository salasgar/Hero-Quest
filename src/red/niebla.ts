/**
 * La niebla: qué parte de la partida ve cada pantalla.
 *
 * En la mesa, la pantalla es la del máster y lo enseña todo, porque el adulto
 * arbitra. La de quien juega desde su casa enseña **lo que sabe el grupo**: las
 * salas abiertas, las puertas vistas, los monstruos descubiertos y las trampas
 * que alguien ha encontrado.
 *
 * Que esto sea una función pura que devuelve un estado recortado, y no un puñado
 * de condiciones dentro del JSX, es deliberado por tres motivos:
 *
 *  - **Se puede probar.** Los componentes de React no se prueban en este
 *    repositorio (`vite.config.ts` monta el entorno `node`), así que una regla
 *    metida en el pintado es una regla sin test.
 *  - **La niebla se aplica una vez, en el borde.** La pantalla de casa no lleva
 *    ni un `if (esRemoto)`: recibe otro estado y pinta lo que le den. Un `if`
 *    repartido por seis sitios es cómo se cuela una sala sin abrir.
 *  - **No se inventa ninguna regla de visión.** Todo sale de campos que ya
 *    mantiene el motor: `salasReveladas` (T13), `puertasVistas` (T13) y
 *    `monstruosEnTablero` (T18). Aquí solo se filtra.
 *
 * # Lo que esto NO es
 *
 * **La niebla es de pantalla, no de red.** Quien juega desde su casa recibe el
 * registro de acciones entero y reconstruye el estado completo en su navegador:
 * con las herramientas de desarrollo puede mirar lo que esta función le quita.
 * Taparlo de verdad exigiría que el servidor fuese el dueño del estado y sirviera
 * una vista recortada por jugador —otra aplicación, no esta— y no lo pide nadie:
 * se juega en familia. Está escrito como límite conocido, no como fallo
 * pendiente, y también en `server/README.md` y en la cabecera de T30.
 */

import { salaEn } from "../data/board-base";
import { puertasVisibles } from "../engine/selectors";
import type { Celda, EstadoPartida } from "../engine/types";

/**
 * Quién mira la pantalla: la casa donde está el tablero, o alguien desde la
 * suya. No es el nombre del jugador a propósito —eso lo decide el `reparto` del
 * montaje—: aquí solo hace falta saber si arbitra o si juega.
 */
export type QuienMira = "mesa" | "desdeCasa";

/** ¿Está esta casilla en una sala que el grupo todavía no ha abierto? */
const enSalaSinAbrir = (e: EstadoPartida, c: Celda): boolean => {
  const sala = salaEn(c.x, c.y);
  return sala !== null && !e.salasReveladas.includes(sala);
};

/**
 * El estado tal como lo conoce quien mira.
 *
 * **Es un estado para pintar, no para jugar.** No se lo pases nunca a
 * `aplicarAccion`: le faltan monstruos y puertas, así que el motor decidiría
 * sobre un tablero que no existe. Las acciones se calculan siempre sobre el
 * estado completo, que es el que devuelve `usePartida`; esto es lo último que
 * pasa antes de dibujar.
 *
 * Para la mesa devuelve el estado **tal cual, sin copiar**: el máster lo ve todo,
 * y devolver el mismo objeto deja claro que ahí no hay recorte que revisar.
 */
export function comoLoVe(e: EstadoPartida, quien: QuienMira): EstadoPartida {
  if (quien === "mesa") return e;

  return {
    ...e,
    // Los que los héroes han encontrado, y solo esos. Ojo con la diferencia que
    // parece un matiz: filtrar por «su sala está abierta» deja ver a cualquier
    // monstruo que esté en un pasillo, esté descubierto o no, porque un pasillo
    // no es ninguna sala. `monstruosEnTablero` es la respuesta del motor a esta
    // pregunta exacta, y es la que vale.
    monstruos: e.monstruos.filter((m) => e.monstruosEnTablero.includes(m.id)),

    // Una puerta que nadie ha visto no está en el tablero de casa. Se quita del
    // estado en vez de dejar de pintarla: así el hueco se dibuja como lo que
    // parece desde fuera, un muro, en lugar de como un vano.
    //
    // **Cuáles se ven lo decide el motor**, con el mismo selector que usa la
    // pantalla de la mesa. Filtrar aquí por `puertasVistas` a mano parecía
    // equivalente y no lo era: las secretas van por `descubierta`, así que una
    // secreta ya encontrada se habría borrado del tablero de quien juega desde
    // su casa justo después de encontrarla.
    puertas: puertasVisibles(e),

    // Las trampas se ponen sobre el tablero al descubrirlas; una oculta no es que
    // no se pinte, es que quien juega no sabe que existe.
    trampas: e.trampas.filter((t) => t.descubierta),

    // Un bloque caído sella el hueco a la vista de todos, pero si cayó en una
    // sala que este grupo aún no ha abierto, tampoco lo ha visto nadie.
    celdasBloqueadas: e.celdasBloqueadas.filter((c) => !enSalaSinAbrir(e, c)),

    // El orden del mazo es información de máster: con él se sabe qué carta toca
    // en la siguiente búsqueda. No se pinta en ningún sitio, y justamente por eso
    // conviene que no viaje hasta el componente: lo que no está no se enseña por
    // accidente el día que alguien añada un panel de depuración.
    mazoTesoros: [],
  };
}

/**
 * Los monstruos que ve quien mira. Se expone aparte porque es la comprobación
 * que más veces hay que hacer al probar la niebla, y hacerla sobre el estado
 * recortado entero es más ruidoso que hacerla sobre una lista.
 */
export const monstruosQueVe = (e: EstadoPartida, quien: QuienMira): string[] =>
  comoLoVe(e, quien).monstruos.map((m) => m.id);
