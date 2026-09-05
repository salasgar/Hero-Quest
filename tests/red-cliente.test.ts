/**
 * T31 · La partida en red, del lado del cliente.
 *
 * El transporte de estos tests es el `protocolo.ts` de T30 en memoria, sin
 * HTTP: lo que se prueba es la reconciliación —el 409, el sondeo, quién puede
 * actuar—, no `fetch`. El requisito del almacén que fijó T30 («guardar antes
 * de contestar») se respeta igual: cada petición lee el registro guardado,
 * decide y guarda antes de responder.
 */

import { describe, expect, it } from "vitest";
import {
  crear,
  MESA,
  partidaDelMontaje,
  SesionDeRed,
  unirse,
  type Transporte,
} from "../src/red/cliente";
import {
  anadir,
  crearRegistro,
  truncar,
  vista,
  VERSION,
  type Montaje,
  type Registro,
} from "../src/red/protocolo";
import type { Accion } from "../src/engine/types";

const montaje = (cambios: Partial<Montaje> = {}): Montaje => ({
  version: VERSION,
  semilla: 7,
  mision: "calabozo",
  heroes: [{ clase: "barbaro" }, { clase: "elfo", elementos: ["agua"] }],
  reparto: { barbaro: "mesa", elfo: "marta" },
  ...cambios,
});

/**
 * El relevo de mentira. El mapa se expone a propósito: los tests comprueban lo
 * que quedó guardado —cuántas veces entró una acción—, no solo lo que las
 * sesiones creen tener, que es justo la diferencia que importa.
 */
const relevoEnMemoria = () => {
  const partidas = new Map<string, Registro>();
  let contador = 0;
  const transporte: Transporte = {
    async crear(m) {
      const codigo = `PT${String(contador++).padStart(2, "0")}`;
      const secreto = `secreto-${codigo}`;
      const r = crearRegistro(m, secreto);
      if (!r.ok) return r;
      partidas.set(codigo, r.valor);
      return { ok: true, valor: { codigo, secreto } };
    },
    async leer(codigo, desde) {
      const registro = partidas.get(codigo);
      if (!registro) return { ok: false, motivo: "No hay ninguna partida con ese código." };
      return { ok: true, valor: vista(registro, desde) };
    },
    async enviar(codigo, p) {
      const registro = partidas.get(codigo)!;
      const r = anadir(registro, p);
      if (!r.ok) return r;
      partidas.set(codigo, r.valor);
      return { ok: true, valor: { total: r.valor.entradas.length } };
    },
    async truncar(codigo, p) {
      const registro = partidas.get(codigo)!;
      const r = truncar(registro, p);
      if (!r.ok) return r;
      partidas.set(codigo, r.valor);
      return { ok: true, valor: { total: r.valor.entradas.length } };
    },
  };
  return { transporte, partidas };
};

/** La mesa creada y marta unida, que es el arranque de casi todos los casos. */
const dosCasas = async () => {
  const { transporte, partidas } = relevoEnMemoria();
  const mesa = await crear(transporte, montaje());
  if (!mesa.ok) throw new Error(mesa.motivo);
  const marta = await unirse(transporte, mesa.valor.codigo, "marta");
  if (!marta.ok) throw new Error(marta.motivo);
  return { transporte, partidas, mesa: mesa.valor, marta: marta.valor };
};

const enviado = async (sesion: SesionDeRed, accion: Accion) => {
  const r = await sesion.enviar(accion);
  if (!r.ok) throw new Error(r.motivo);
};

const tirar = (total: number): Accion => ({ tipo: "tirarMovimiento", dados: [total, 0] });
const terminar: Accion = { tipo: "terminarTurno" };

describe("dos casas sobre el mismo montaje", () => {
  it("llegan al mismo estado, cada una jugando sus turnos", async () => {
    const { mesa, marta } = await dosCasas();

    // El bárbaro es de la mesa. Sin `dados`: la tirada sale del generador que
    // vive dentro del estado, que es justo donde se notaría una divergencia.
    await enviado(mesa, { tipo: "tirarMovimiento" });
    await enviado(mesa, terminar);

    // A marta le llega por el sondeo, y con el turno del elfo le toca a ella.
    await marta.sondear();
    await enviado(marta, { tipo: "tirarMovimiento" });
    await enviado(marta, terminar);

    // El turno de Zargon es de la mesa, siempre.
    await mesa.sondear();
    await enviado(mesa, terminar);
    await marta.sondear();

    // El JSON entero, no un campo: dentro van el generador, el mazo barajado y
    // el turno. Comparar solo las figuras dejaría pasar la divergencia.
    expect(JSON.stringify(marta.estado)).toBe(JSON.stringify(mesa.estado));
    expect(marta.acciones).toHaveLength(5);
  });

  it("un sondeo sin novedades no avisa a nadie", async () => {
    const { marta } = await dosCasas();
    let avisos = 0;
    marta.suscribir(() => avisos++);
    expect(await marta.sondear()).toBe(false);
    expect(avisos).toBe(0);
  });
});

describe("la reconciliación del 409", () => {
  it("quien se quedó atrás se pone al día y su acción entra una sola vez", async () => {
    const { transporte, partidas, mesa } = await dosCasas();
    // Dos pestañas del mismo jugador: dos clientes con el mismo autor. No hay
    // que impedirlo, pero que no se rompa.
    const pestana = await unirse(transporte, mesa.codigo, MESA);
    if (!pestana.ok) throw new Error(pestana.motivo);

    await enviado(mesa, tirar(4));
    // La pestaña no ha sondeado: envía con el esperado viejo. Terminar el turno
    // es legal antes y después de ponerse al día, así que tiene que acabar
    // dentro, y una sola vez.
    await enviado(pestana.valor, terminar);

    const entradas = partidas.get(mesa.codigo)!.entradas;
    expect(entradas).toHaveLength(2);
    expect(entradas.filter((e) => e.accion.tipo === "terminarTurno")).toHaveLength(1);
    await mesa.sondear();
    expect(JSON.stringify(pestana.valor.estado)).toBe(JSON.stringify(mesa.estado));
  });

  it("una acción que deja de ser legal tras ponerse al día no se reenvía", async () => {
    const { transporte, partidas, mesa } = await dosCasas();
    const pestana = await unirse(transporte, mesa.codigo, MESA);
    if (!pestana.ok) throw new Error(pestana.motivo);

    await enviado(mesa, tirar(4));
    // Para la pestaña atrasada tirar movimiento aún es legal; al incorporar la
    // tirada de la mesa deja de serlo, y ahí se explica en vez de insistir.
    const r = await pestana.valor.enviar(tirar(6));
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.motivo).toBeTruthy();

    const entradas = partidas.get(mesa.codigo)!.entradas;
    expect(entradas.filter((e) => e.accion.tipo === "tirarMovimiento")).toHaveLength(1);
  });
});

describe("quién puede actuar lo decide el cliente", () => {
  it("con el turno de una figura que no llevas, ni se ofrece ni se envía", async () => {
    const { partidas, mesa, marta } = await dosCasas();
    // Empieza el bárbaro, que es de la mesa: la pantalla de marta no ofrece
    // acciones, y si algo se cuela por debajo, el envío también se niega. El
    // relevo no puede comprobarlo —una acción no nombra a su figura—, así que
    // o se hace aquí o no se hace en ningún sitio.
    expect(marta.puedeActuar()).toBe(false);
    expect(mesa.puedeActuar()).toBe(true);
    const r = await marta.enviar(tirar(5));
    expect(r.ok).toBe(false);
    expect(partidas.get(mesa.codigo)!.entradas).toHaveLength(0);
  });

  it("y cambia de mano cuando el turno pasa", async () => {
    const { mesa, marta } = await dosCasas();
    await enviado(mesa, terminar);
    await marta.sondear();
    expect(marta.puedeActuar()).toBe(true);
    expect(mesa.puedeActuar()).toBe(false);
  });
});

describe("deshacer, que es cosa de la mesa", () => {
  it("sin el secreto no se trunca, ni siquiera yendo al día", async () => {
    const { partidas, mesa, marta } = await dosCasas();
    await enviado(mesa, tirar(4));
    await marta.sondear();
    const r = await marta.truncar();
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.motivo).toContain("mesa");
    expect(partidas.get(mesa.codigo)!.entradas).toHaveLength(1);
  });

  it("la mesa deshace y a la otra casa le llega por el sondeo", async () => {
    const { mesa, marta } = await dosCasas();
    await enviado(mesa, tirar(4));
    await marta.sondear();
    const r = await mesa.truncar();
    expect(r.ok).toBe(true);
    await marta.sondear();
    expect(marta.acciones).toHaveLength(0);
    expect(JSON.stringify(marta.estado)).toBe(JSON.stringify(mesa.estado));
  });

  it("deshacer y jugar otra cosa en el mismo segundo no divide las casas", async () => {
    // El registro no lleva número de revisión: si la mesa deshace y juega otra
    // acción antes del siguiente sondeo, los totales coinciden y las colas
    // difieren. Es el motivo por el que el sondeo pide desde cero y no desde el
    // total que ya tiene; con `desde=N` esta divergencia sería invisible y
    // permanente, sin error en ninguna de las dos casas.
    const { mesa, marta } = await dosCasas();
    await enviado(mesa, tirar(4));
    await marta.sondear();
    const r = await mesa.truncar();
    expect(r.ok).toBe(true);
    await enviado(mesa, tirar(6));

    expect(await marta.sondear()).toBe(true);
    expect(JSON.stringify(marta.estado)).toBe(JSON.stringify(mesa.estado));
  });
});

describe("entrar en una partida", () => {
  it("una pestaña con otra versión del código no entra: recarga la página", async () => {
    const { transporte, partidas } = relevoEnMemoria();
    // `crearRegistro` no dejaría crearla, así que se planta guardada, que es
    // como se la encontraría una pestaña vieja al volver.
    partidas.set("PTVJ", {
      montaje: montaje({ version: "una-anterior" }),
      entradas: [],
      secretoMesa: "s",
    });
    const r = await unirse(transporte, "PTVJ", "marta");
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.motivo).toContain("recarga la página");
  });

  it("una misión que esta aplicación no conoce se rechaza con motivo, no revienta", async () => {
    const { transporte, partidas } = relevoEnMemoria();
    partidas.set("PTMX", {
      montaje: montaje({ mision: "la-torre-de-kellar" }),
      entradas: [],
      secretoMesa: "s",
    });
    const r = await unirse(transporte, "PTMX", "marta");
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.motivo).toContain("la-torre-de-kellar");
  });

  it("quien se une a media partida arranca con el registro ya aplicado", async () => {
    const { transporte, mesa } = await dosCasas();
    await enviado(mesa, tirar(4));
    await enviado(mesa, terminar);
    const tarde = await unirse(transporte, mesa.codigo, "marta");
    if (!tarde.ok) throw new Error(tarde.motivo);
    expect(JSON.stringify(tarde.valor.estado)).toBe(JSON.stringify(mesa.estado));
  });
});

describe("el conversor del montaje", () => {
  it("con la misma semilla las dos casas montan la misma partida", () => {
    const una = partidaDelMontaje(montaje());
    const otra = partidaDelMontaje(montaje());
    if (!una.ok || !otra.ok) throw new Error("no montó");
    expect(JSON.stringify(una.valor)).toBe(JSON.stringify(otra.valor));
  });

  it("y con otra semilla, no: el mazo se baraja distinto", () => {
    const una = partidaDelMontaje(montaje({ semilla: 7 }));
    const otra = partidaDelMontaje(montaje({ semilla: 8 }));
    if (!una.ok || !otra.ok) throw new Error("no montó");
    expect(JSON.stringify(una.valor)).not.toBe(JSON.stringify(otra.valor));
  });
});
