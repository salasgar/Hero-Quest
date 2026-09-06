/**
 * T30 · El protocolo del relevo de acciones.
 *
 * Dos familias de pruebas. Las primeras son del candado de escritura —la
 * **revisión** del registro—, que es lo que impide que dos jugadores que pulsan a
 * la vez dejen el registro en un orden que ninguna de las dos pantallas ha visto.
 * Hasta el 2026-09-06 ese candado comparaba *cuántas* acciones había, y ahí tenía
 * un agujero: deshacer y volver a jugar deja la misma cuenta con otro contenido.
 * El test que lo fija es «deshacer y jugar cambia la revisión aunque la cuenta
 * vuelva a ser la misma».
 *
 * La última es la que sostiene la fase entera: **partiendo del mismo montaje, la
 * lista de acciones basta para llegar al mismo estado**. Si esa se rompe, jugar
 * en red repartiendo acciones deja de ser una idea válida y hay que rehacer el
 * diseño, no el test.
 */

import { describe, expect, it } from "vitest";
import { aplicarAccion, repetir } from "../src/engine/reducer";
import { partidaDelMontaje as conversor } from "../src/red/cliente";
import type { Accion, EstadoPartida } from "../src/engine/types";
import {
  ALFABETO,
  anadir,
  codigoDePartida,
  crearRegistro,
  truncar,
  vista,
  VERSION,
  type Montaje,
  type Registro,
} from "../src/red/protocolo";

const montaje = (cambios: Partial<Montaje> = {}): Montaje => ({
  version: VERSION,
  semilla: 7,
  mision: "calabozo",
  heroes: [{ clase: "barbaro" }, { clase: "elfo" }],
  reparto: { barbaro: "mesa", elfo: "marta" },
  ...cambios,
});

const registro = (m: Montaje = montaje()): Registro => {
  const r = crearRegistro(m, "secreto-de-la-mesa");
  if (!r.ok) throw new Error(r.motivo);
  return r.valor;
};

const mover: Accion = { tipo: "mover", destino: { x: 12, y: 17 } };

/**
 * De montaje a partida. Este fichero llevaba su propio conversor provisional
 * con la nota de que el de verdad lo escribiría T31 en un solo sitio; ya
 * existe —`partidaDelMontaje`, en `src/red/cliente.ts`— y se usa ese, porque
 * dos sitios que construyan las opciones acabarán construyendo dos partidas
 * distintas.
 */
const partidaDelMontaje = (m: Montaje): EstadoPartida => {
  const r = conversor(m);
  if (!r.ok) throw new Error(r.motivo);
  return r.valor;
};

describe("crear la partida en el relevo", () => {
  it("rechaza un montaje de otra versión, y lo explica", () => {
    const r = crearRegistro(montaje({ version: "otra-cosa" }), "s");
    expect(r.ok).toBe(false);
    if (r.ok) return;
    // El motivo es para leerlo en pantalla, no para depurar: tiene que decir qué
    // hacer. Rechazar es lo correcto; adivinar y jugar reglas distintas, no.
    expect(r.motivo).toContain("recarga la página");
  });

  it("rechaza una partida sin héroes", () => {
    const r = crearRegistro(montaje({ heroes: [] }), "s");
    expect(r.ok).toBe(false);
  });

  it("empieza sin ninguna acción", () => {
    expect(registro().entradas).toHaveLength(0);
  });
});

describe("el candado de escritura: la revisión", () => {
  it("con la revisión al día, la acción entra", () => {
    const r = anadir(registro(), { revision: 0, accion: mover, autor: "marta" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.valor.entradas).toHaveLength(1);
    expect(r.valor.entradas[0]?.autor).toBe("marta");
  });

  it("con la revisión vieja se rechaza, y devuelve el registro entero", () => {
    const primero = anadir(registro(), { revision: 0, accion: mover, autor: "mesa" });
    if (!primero.ok) throw new Error(primero.motivo);

    const segundo = anadir(primero.valor, { revision: 0, accion: mover, autor: "marta" });
    expect(segundo.ok).toBe(false);
    if (segundo.ok) return;
    // El registro viaja en el propio rechazo: quien se quedó atrás se pone al día
    // sin una segunda petición, que es medio segundo menos con un niño esperando.
    // Va **entero** y no solo la cola: en cuanto la mesa deshace, «lo que te
    // falta» ya no encaja con lo que el otro tiene.
    expect(segundo.entradas).toHaveLength(1);
    expect(segundo.entradas?.[0]?.autor).toBe("mesa");
    expect(segundo.total).toBe(1);
    expect(segundo.revision).toBe(1);
  });

  it("deshacer y jugar cambia la revisión aunque la cuenta vuelva a ser la misma", () => {
    // **El agujero que cierra esto**, y por el que existe la revisión: Marta
    // mira el tablero con una acción hecha; la mesa deshace esa acción y juega
    // otra. La cuenta vuelve a uno, así que con el candado viejo —comparar
    // cuántas hay— la jugada de Marta entraba con la cuenta buena y el contenido
    // cambiado: la había decidido sobre un tablero que ya no existe. No hacía
    // divergir a las dos casas, porque `repetir` descarta lo que ya no es legal,
    // pero la jugada se perdía sin decir una palabra.
    const uno = anadir(registro(), { revision: 0, accion: mover, autor: "mesa" });
    if (!uno.ok) throw new Error(uno.motivo);

    const deshecho = truncar(uno.valor, { revision: 1, secreto: "secreto-de-la-mesa" });
    if (!deshecho.ok) throw new Error(deshecho.motivo);

    const otra: Accion = { tipo: "terminarTurno" };
    const rehecho = anadir(deshecho.valor, { revision: 2, accion: otra, autor: "mesa" });
    if (!rehecho.ok) throw new Error(rehecho.motivo);

    // Misma cuenta que veía Marta, distinto contenido, distinta revisión.
    expect(rehecho.valor.entradas).toHaveLength(1);
    expect(uno.valor.entradas).toHaveLength(1);
    expect(rehecho.valor.revision).toBe(3);

    const deMarta = anadir(rehecho.valor, { revision: 1, accion: mover, autor: "marta" });
    expect(deMarta.ok).toBe(false);
    if (deMarta.ok) return;
    // Y el rechazo le da con qué ponerse al día: el registro de verdad.
    expect(deMarta.entradas?.[0]?.accion).toEqual(otra);
    expect(deMarta.revision).toBe(3);
  });

  it("dos jugadores a la vez: solo entra el primero en llegar", () => {
    // Ojo con lo que este test dice y con lo que no.
    //
    // `anadir` es pura: si se llama dos veces sobre la **misma** copia, las dos
    // aciertan, porque las dos ven un registro de cero acciones. La serialización
    // no la da esta función, la da el almacén que guarda el resultado entre una
    // petición y la siguiente. Por eso aquí se modela el almacén —dos peticiones
    // en el orden en que llegan— en vez de llamar dos veces y esperar magia.
    //
    // De ahí sale un requisito para `server/relevo.ts`, y es el importante de la
    // tarea: **guardar antes de contestar**. Un Durable Object lo da hecho, porque
    // dentro de un objeto no hay dos peticiones a la vez; si alguna vez se cambia
    // por otra cosa, esto es lo que hay que conservar.
    let guardado = registro();

    const primera = anadir(guardado, { revision: 0, accion: mover, autor: "mesa" });
    expect(primera.ok).toBe(true);
    if (!primera.ok) return;
    guardado = primera.valor;

    const segunda = anadir(guardado, { revision: 0, accion: mover, autor: "marta" });
    expect(segunda.ok).toBe(false);
  });

  it("el que se quedó atrás entra a la segunda, ya con la revisión buena", () => {
    const primero = anadir(registro(), { revision: 0, accion: mover, autor: "mesa" });
    if (!primero.ok) throw new Error(primero.motivo);
    const reintento = anadir(primero.valor, { revision: 1, accion: mover, autor: "marta" });
    expect(reintento.ok).toBe(true);
    if (!reintento.ok) return;
    // Una sola vez: el rechazo no dejó nada a medias.
    expect(reintento.valor.entradas).toHaveLength(2);
  });
});

describe("deshacer, que es truncar", () => {
  const conUna = (): Registro => {
    const r = anadir(registro(), { revision: 0, accion: mover, autor: "mesa" });
    if (!r.ok) throw new Error(r.motivo);
    return r.valor;
  };

  it("la mesa deshace la última, y eso también sube la revisión", () => {
    const r = truncar(conUna(), { revision: 1, secreto: "secreto-de-la-mesa" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.valor.entradas).toHaveLength(0);
    // Si deshacer no subiera la revisión, el registro volvería a la marca que
    // tenía antes de la acción y el candado no vería el cambio: es justo la
    // mitad que faltaba.
    expect(r.valor.revision).toBe(2);
  });

  it("quien no es la mesa no deshace, aunque vaya al día", () => {
    const r = truncar(conUna(), { revision: 1, secreto: "el-de-marta" });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.motivo).toContain("mesa");
  });

  it("con la revisión vieja se rechaza: no se deshace a ciegas", () => {
    const r = truncar(conUna(), { revision: 0, secreto: "secreto-de-la-mesa" });
    expect(r.ok).toBe(false);
  });

  it("sin acciones no hay nada que deshacer", () => {
    const r = truncar(registro(), { revision: 0, secreto: "secreto-de-la-mesa" });
    expect(r.ok).toBe(false);
  });
});

describe("lo que se le manda a un cliente", () => {
  it("no lleva el secreto de la mesa", () => {
    const r = anadir(registro(), { revision: 0, accion: mover, autor: "mesa" });
    if (!r.ok) throw new Error(r.motivo);
    const v = vista(r.valor);
    // Se comprueba sobre el JSON, no sobre las claves que se nos ocurran: lo que
    // viaja por la red es esto, no el objeto.
    expect(JSON.stringify(v)).not.toContain("secreto-de-la-mesa");
  });

  it("desde N devuelve solo lo que falta, con el total y la revisión", () => {
    let r = registro();
    for (let i = 0; i < 3; i++) {
      const paso = anadir(r, { revision: i, accion: mover, autor: "mesa" });
      if (!paso.ok) throw new Error(paso.motivo);
      r = paso.valor;
    }
    const v = vista(r, 2);
    expect(v.entradas).toHaveLength(1);
    expect(v.total).toBe(3);
    // La revisión va en la vista porque es lo que hay que devolver al escribir:
    // sin ella, quien lee no sabría con qué marca mandar su jugada.
    expect(v.revision).toBe(3);
  });

  it("un desde disparatado no revienta", () => {
    expect(vista(registro(), 99).entradas).toHaveLength(0);
    expect(vista(registro(), -5).total).toBe(0);
  });
});

describe("el código que se dicta por teléfono", () => {
  it("no lleva letras que se confundan al teclearlas", () => {
    for (const confusa of ["I", "O", "0", "1"]) {
      expect(ALFABETO).not.toContain(confusa);
    }
  });

  it("sale un código del largo de los bytes que se le den", () => {
    expect(codigoDePartida(new Uint8Array([0, 5, 31, 200]))).toHaveLength(4);
  });

  it("los mismos bytes dan el mismo código", () => {
    const bytes = new Uint8Array([3, 9, 27, 14]);
    expect(codigoDePartida(bytes)).toBe(codigoDePartida(bytes));
  });
});

describe("la idea que sostiene la fase: repartir acciones basta", () => {
  // Sin `dados`, la tirada sale del generador que vive dentro del estado. Es
  // justo el caso que importa: si las dos casas no coincidieran aquí, tampoco
  // coincidirían en un combate.
  const jugada: Accion[] = [
    { tipo: "tirarMovimiento" },
    { tipo: "terminarTurno" },
    { tipo: "tirarMovimiento" },
    { tipo: "terminarTurno" },
  ];

  it("dos casas con el mismo montaje llegan al mismo estado", () => {
    const m = montaje();

    // La casa de la mesa juega y va escribiendo en el relevo.
    let enLaMesa = partidaDelMontaje(m);
    let r = registro(m);
    for (const [i, accion] of jugada.entries()) {
      const paso = aplicarAccion(enLaMesa, accion);
      expect(paso.ok).toBe(true);
      if (!paso.ok) return;
      enLaMesa = paso.estado;
      const escrito = anadir(r, { revision: i, accion, autor: "mesa" });
      if (!escrito.ok) throw new Error(escrito.motivo);
      r = escrito.valor;
    }

    // La otra casa solo ha recibido el montaje y la lista de acciones.
    const enSuCasa = repetir(
      partidaDelMontaje(r.montaje),
      vista(r).entradas.map((e) => e.accion),
    );

    // El JSON entero, no un campo: dentro va el generador, el mazo de tesoros
    // barajado y el turno. Comparar solo las posiciones dejaría pasar justo la
    // divergencia que se busca.
    expect(JSON.stringify(enSuCasa)).toBe(JSON.stringify(enLaMesa));
  });

  it("y con otra semilla NO llegan al mismo estado", () => {
    // Sin esta segunda mitad, la primera pasaría igual aunque el estado no
    // dependiera de la semilla, y no estaría probando nada. La semilla viaja en
    // el montaje justo porque `Juego.tsx` la saca hoy de `Date.now()`: dos
    // navegadores calculándola por su cuenta juegan a dos partidas distintas.
    const unaCasa = repetir(partidaDelMontaje(montaje({ semilla: 7 })), jugada);
    const otraCasa = repetir(partidaDelMontaje(montaje({ semilla: 8 })), jugada);
    expect(JSON.stringify(otraCasa)).not.toBe(JSON.stringify(unaCasa));
  });
});
