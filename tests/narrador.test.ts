import { describe, it, expect } from "vitest";
import { narrar, narrarTodos } from "../src/narrator/relato";
import type { Evento } from "../src/engine/types";
import { c, partida, situar } from "./ayuda";

/** Un enano llamado Háfir, con un orco Górbak enfrente. Como el ejemplo de Juan Luis. */
const estado = () => {
  const e = situar(
    partida({ heroes: [{ clase: "enano", nombre: "Háfir" }], monstruos: [{ id: "orco1", especie: "orco", celda: c(2, 1) }] }),
    "enano",
    c(1, 1),
  );
  const orco = e.monstruos.find((m) => m.id === "orco1")!;
  return { e, orcoNombre: orco.nombre };
};

/** Ningún hueco `{clave}` se queda sin rellenar en ningún texto. */
function sinHuecos(texto: string | null) {
  if (texto !== null) expect(texto).not.toMatch(/\{\w+\}/);
}

describe("relato: determinismo", () => {
  it("el mismo evento, el mismo índice, da siempre la misma frase", () => {
    const { e } = estado();
    const ev: Evento = { tipo: "movimiento", actor: "enano", desde: c(1, 1), hasta: c(1, 5), ruta: [c(1, 2), c(1, 3), c(1, 4), c(1, 5)] };
    expect(narrar(e, ev, 7)).toBe(narrar(e, ev, 7));
  });

  it("índices distintos recorren las variantes", () => {
    const { e } = estado();
    const ev: Evento = { tipo: "movimiento", actor: "enano", desde: c(1, 1), hasta: c(1, 5), ruta: [c(1, 2), c(1, 3), c(1, 4), c(1, 5)] };
    const variantes = new Set(Array.from({ length: 12 }, (_, i) => narrar(e, ev, i)));
    expect(variantes.size).toBeGreaterThan(1);
  });

  it("nunca usa Math.random: dos llamadas independientes no divergen", () => {
    const { e } = estado();
    const ev: Evento = { tipo: "curacion", figura: "enano", puntos: 2 };
    const a = narrar(e, ev, 3);
    const b = narrar(e, ev, 3);
    expect(a).toBe(b);
  });
});

describe("relato: el ejemplo de Juan Luis", () => {
  it("Háfir el Enano es el sujeto de su propio movimiento", () => {
    const { e } = estado();
    const texto = narrar(e, { tipo: "movimiento", actor: "enano", desde: c(1, 1), hasta: c(1, 8), ruta: Array.from({ length: 7 }, (_, i) => c(1, i + 2)) }, 0);
    expect(texto).toMatch(/Háfir el Enano/);
  });

  it("el ataque nombra al orco por su nombre de pila la primera vez", () => {
    const { e, orcoNombre } = estado();
    const ev: Evento = {
      tipo: "ataque",
      atacante: "enano",
      objetivo: "orco1",
      dadosAtaque: [],
      dadosDefensa: [],
      calaveras: 2,
      escudos: 0,
      dano: 2,
    };
    expect(narrar(e, ev, 0)).toMatch(new RegExp(orcoNombre));
  });

  it("el golpe que remata usa un epíteto y no repite el nombre (T39: variedad)", () => {
    const { e, orcoNombre } = estado();
    const ataque: Evento = {
      tipo: "ataque",
      atacante: "enano",
      objetivo: "orco1",
      dadosAtaque: [],
      dadosDefensa: [],
      calaveras: 2,
      escudos: 0,
      dano: 2,
    };
    const muerte: Evento = { tipo: "figuraDerrotada", figura: "orco1" };
    const conRegistro = { ...e, registro: [ataque, muerte] };

    const textoAtaque = narrar(conRegistro, ataque, 0);
    const textoMuerte = narrar(conRegistro, muerte, 1);

    expect(textoAtaque).toMatch(new RegExp(orcoNombre)); // se presenta con su nombre
    expect(textoMuerte).not.toMatch(new RegExp(orcoNombre)); // y muere con un epíteto, sin repetirlo
    sinHuecos(textoAtaque);
    sinHuecos(textoMuerte);
  });

  it("un héroe siempre lleva su nombre, también al morir (T16: clases repetidas)", () => {
    const { e } = estado();
    const texto = narrar(e, { tipo: "figuraDerrotada", figura: "enano" }, 0);
    expect(texto).toMatch(/Háfir/);
  });
});

describe("relato: cada tipo de evento tiene frase (o null a propósito)", () => {
  const { e } = estado();

  const nulosAPropósito: Evento[] = [
    { tipo: "tiradaMovimiento", actor: "enano", dados: [3, 4], total: 7 },
    { tipo: "monstruoActiva", monstruo: "orco1" },
    { tipo: "monstruoSinActuar", monstruo: "orco1" },
    { tipo: "cambioDeTurno", actor: "enano" },
  ];
  it.each(nulosAPropósito.map((ev) => [ev.tipo, ev] as const))("%s no cuenta nada en el relato", (_, ev) => {
    expect(narrar(e, ev, 0)).toBeNull();
  });

  const conFrase: Array<[string, Evento]> = [
    ["movimiento corto", { tipo: "movimiento", actor: "enano", desde: c(1, 1), hasta: c(1, 2), ruta: [c(1, 2)] }],
    ["puertaAbierta", { tipo: "puertaAbierta", puerta: "p1" }],
    ["salaRevelada vacía", { tipo: "salaRevelada", sala: "a", texto: "Huele a moho.", monstruos: [] }],
    ["salaRevelada con monstruos", { tipo: "salaRevelada", sala: "a", texto: null, monstruos: ["orco1"] }],
    [
      "ataque que falla",
      { tipo: "ataque", atacante: "enano", objetivo: "orco1", dadosAtaque: [], dadosDefensa: [], calaveras: 0, escudos: 1, dano: 0 },
    ],
    ["figuraDerrotada (héroe)", { tipo: "figuraDerrotada", figura: "enano" }],
    ["figuraDerrotada (monstruo)", { tipo: "figuraDerrotada", figura: "orco1" }],
    ["trampaDisparada foso", { tipo: "trampaDisparada", trampa: "t", tipoTrampa: "foso", figura: "enano", dano: 1 }],
    ["trampaDisparada foso abierto", { tipo: "trampaDisparada", trampa: "t", tipoTrampa: "foso", figura: "enano", dano: 1, yaAbierta: true }],
    ["trampaDisparada lanza esquivada", { tipo: "trampaDisparada", trampa: "t", tipoTrampa: "lanza", figura: "enano", dano: 0 }],
    ["trampaDisparada lanza alcanza", { tipo: "trampaDisparada", trampa: "t", tipoTrampa: "lanza", figura: "enano", dano: 1 }],
    ["trampaDisparada bloque esquivado", { tipo: "trampaDisparada", trampa: "t", tipoTrampa: "bloque", figura: "enano", dano: 0 }],
    ["trampaDisparada bloque alcanza", { tipo: "trampaDisparada", trampa: "t", tipoTrampa: "bloque", figura: "enano", dano: 2 }],
    ["saltoDeTrampa logrado", { tipo: "saltoDeTrampa", trampa: "t", tipoTrampa: "foso", figura: "enano", dado: "escudoBlanco", logrado: true }],
    ["saltoDeTrampa fallido", { tipo: "saltoDeTrampa", trampa: "t", tipoTrampa: "lanza", figura: "enano", dado: "calavera", logrado: false }],
    ["trampaDescubierta", { tipo: "trampaDescubierta", trampa: "t", tipoTrampa: "foso", celda: c(3, 3) }],
    ["trampaDesarmada", { tipo: "trampaDesarmada", trampa: "t" }],
    ["puertaSecretaDescubierta", { tipo: "puertaSecretaDescubierta", puerta: "p2" }],
    ["busquedaSinHallazgo tesoro", { tipo: "busquedaSinHallazgo", actor: "enano", que: "tesoro" }],
    ["busquedaSinHallazgo trampas", { tipo: "busquedaSinHallazgo", actor: "enano", que: "trampas" }],
    ["tesoroEncontrado", { tipo: "tesoroEncontrado", actor: "enano", oro: 120 }],
    ["objetoDeMision", { tipo: "objetoDeMision", actor: "enano", objeto: "el pergamino del guardián" }],
    ["objetoGuardado", { tipo: "objetoGuardado", actor: "enano", carta: "pocionCura", nombre: "Poción curativa" }],
    ["equipoEncontrado puesto", { tipo: "equipoEncontrado", actor: "enano", equipo: "yelmo", puesto: true }],
    ["equipoEncontrado guardado", { tipo: "equipoEncontrado", actor: "enano", equipo: "yelmo", puesto: false }],
    ["pocionUsada propia", { tipo: "pocionUsada", actor: "enano", objetivo: "enano", carta: "pocionCura", nombre: "Poción curativa" }],
    ["pocionUsada ajena", { tipo: "pocionUsada", actor: "enano", objetivo: "orco1", carta: "pocionCura", nombre: "Poción curativa" }],
    ["objetoDado", { tipo: "objetoDado", de: "enano", a: "orco1", carta: "pocionCura", nombre: "Poción curativa", puesto: false }],
    ["cartaDeTesoro", { tipo: "cartaDeTesoro", actor: "enano", carta: "c1", nombre: "Cofre pequeño", texto: "Diez monedas de oro." }],
    ["monstruoErrante", { tipo: "monstruoErrante", monstruo: "orco1", celda: c(4, 4) }],
    ["hechizoLanzado con objetivo", { tipo: "hechizoLanzado", actor: "enano", hechizo: "aguaCurativa", objetivo: "orco1" }],
    ["hechizoLanzado sin objetivo", { tipo: "hechizoLanzado", actor: "enano", hechizo: "aguaCurativa", objetivo: null }],
    ["curacion", { tipo: "curacion", figura: "enano", puntos: 1 }],
    ["danoDeHechizo con daño", { tipo: "danoDeHechizo", hechizo: "bolaDeFuego", objetivo: "orco1", dados: [], dano: 3 }],
    ["danoDeHechizo sin daño", { tipo: "danoDeHechizo", hechizo: "bolaDeFuego", objetivo: "orco1", dados: [], dano: 0 }],
    ["movimientoExtra", { tipo: "movimientoExtra", figura: "enano", casillas: 4 }],
    ["efectoDeHechizo dormir", { tipo: "efectoDeHechizo", hechizo: "sueno", clase: "dormir", objetivos: ["orco1"] }],
    ["efectoDeHechizo perderTurno", { tipo: "efectoDeHechizo", hechizo: "tempestad", clase: "perderTurno", objetivos: ["orco1"] }],
    ["efectoDeHechizo bonusAtaque", { tipo: "efectoDeHechizo", hechizo: "coraje", clase: "bonusAtaque", objetivos: ["enano"] }],
    ["efectoDeHechizo bonusDefensa", { tipo: "efectoDeHechizo", hechizo: "pielDePiedra", clase: "bonusDefensa", objetivos: ["enano"] }],
    ["efectoDeHechizo atravesarMuros", { tipo: "efectoDeHechizo", hechizo: "atravesarLaRoca", clase: "atravesarMuros", objetivos: ["enano"] }],
    ["efectoDeHechizo atravesarFiguras", { tipo: "efectoDeHechizo", hechizo: "veloDeNiebla", clase: "atravesarFiguras", objetivos: ["enano"] }],
    ["efectoDeHechizo movimientoExtra", { tipo: "efectoDeHechizo", hechizo: "vientoVeloz", clase: "movimientoExtra", objetivos: ["enano"] }],
    ["hechizoSinEfecto noMuerto", { tipo: "hechizoSinEfecto", hechizo: "sueno", objetivo: "orco1", motivo: "noMuerto" }],
    ["hechizoSinEfecto menteSuperior", { tipo: "hechizoSinEfecto", hechizo: "sueno", objetivo: "orco1", motivo: "menteSuperior" }],
    ["hechizoSinEfecto yaEstabaSano", { tipo: "hechizoSinEfecto", hechizo: "aguaCurativa", objetivo: "enano", motivo: "yaEstabaSano" }],
    ["hechizoSinEfecto sinObjetivo", { tipo: "hechizoSinEfecto", hechizo: "bolaDeFuego", objetivo: "orco1", motivo: "sinObjetivo" }],
    ["zargonSinMonstruos ningunoDescubierto", { tipo: "zargonSinMonstruos", motivo: "ningunoDescubierto" }],
    ["zargonSinMonstruos todosHanActuado", { tipo: "zargonSinMonstruos", motivo: "todosHanActuado" }],
    ["cambioDeTurno de Zargon", { tipo: "cambioDeTurno", actor: "zargon" }],
    ["finDePartida victoria", { tipo: "finDePartida", victoria: true, motivo: "Habéis salido de la mazmorra." }],
    ["finDePartida derrota", { tipo: "finDePartida", victoria: false, motivo: "El grupo entero ha caído." }],
  ];

  it.each(conFrase)("%s tiene una frase, sin huecos sin rellenar", (_, ev) => {
    const texto = narrar(e, ev, 0);
    expect(texto).not.toBeNull();
    expect(texto).not.toHaveLength(0);
    sinHuecos(texto);
  });

  // «Movimiento corto, normal o largo» (ficha): tres rutas de longitud
  // distinta dan frases distintas para el mismo actor.
  it("distingue movimiento corto, normal y largo", () => {
    const corto = narrar(e, { tipo: "movimiento", actor: "enano", desde: c(1, 1), hasta: c(1, 2), ruta: [c(1, 2)] }, 0)!;
    const normal = narrar(e, { tipo: "movimiento", actor: "enano", desde: c(1, 1), hasta: c(1, 6), ruta: [c(1, 2), c(1, 3), c(1, 4), c(1, 5), c(1, 6)] }, 0)!;
    const largo = narrar(e, { tipo: "movimiento", actor: "enano", desde: c(1, 1), hasta: c(1, 10), ruta: Array.from({ length: 9 }, (_, i) => c(1, i + 2)) }, 0)!;
    // Los tres bancos son distintos: no hay ninguna frase que valga para los tres.
    expect(new Set([corto, normal, largo]).size).toBeGreaterThan(1);
  });

  it("no cuenta un movimiento de cero casillas", () => {
    expect(narrar(e, { tipo: "movimiento", actor: "enano", desde: c(1, 1), hasta: c(1, 1), ruta: [] }, 0)).toBeNull();
  });
});

describe("relato: narrarTodos descarta lo que no se cuenta", () => {
  it("una tanda con una tirada y un movimiento deja solo el movimiento", () => {
    const { e } = estado();
    const lineas = narrarTodos(e, [
      { tipo: "tiradaMovimiento", actor: "enano", dados: [4, 4], total: 8 },
      { tipo: "movimiento", actor: "enano", desde: c(1, 1), hasta: c(1, 3), ruta: [c(1, 2), c(1, 3)] },
    ]);
    expect(lineas).toHaveLength(1);
  });
});
