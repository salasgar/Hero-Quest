import { describe, it, expect } from "vitest";
import { esPasillo, salaEn, dentroDelTablero, hayMuroEntre } from "../src/data/board-base";
import {
  MISION_CALABOZO,
  MONSTRUOS_CALABOZO,
  MUEBLES_CALABOZO,
  PUERTAS_CALABOZO,
  TRAMPAS_CALABOZO,
} from "../src/data/quests/calabozo";
import { crearPartida } from "../src/engine/partida";
import { MONSTRUOS } from "../src/data/monsters";
import { claveCelda, type Celda, type IdSala } from "../src/engine/types";

const todas = (): Celda[] => [
  ...MISION_CALABOZO.entrada,
  ...MONSTRUOS_CALABOZO.map((m) => m.celda),
  ...TRAMPAS_CALABOZO.map((t) => t.celda),
  ...MUEBLES_CALABOZO.flatMap((m) => m.celdas),
  ...PUERTAS_CALABOZO.flatMap((p) => [p.a, p.b]),
];

describe("«El calabozo del guardián» encaja en el tablero", () => {
  it("todas las coordenadas caen dentro del tablero", () => {
    for (const c of todas())
      expect(dentroDelTablero(c.x, c.y), `fuera del tablero: ${claveCelda(c)}`).toBe(true);
  });

  it("los héroes entran por casillas de pasillo", () => {
    for (const c of MISION_CALABOZO.entrada)
      expect(esPasillo(c.x, c.y), `la entrada ${claveCelda(c)} no es pasillo`).toBe(true);
  });

  it("cada puerta une dos regiones distintas y adyacentes", () => {
    for (const p of PUERTAS_CALABOZO) {
      const adyacente = Math.abs(p.a.x - p.b.x) + Math.abs(p.a.y - p.b.y) === 1;
      expect(adyacente, `la puerta ${p.id} une casillas no contiguas`).toBe(true);
      expect(hayMuroEntre(p.a, p.b), `la puerta ${p.id} no está sobre un muro`).toBe(true);
    }
  });

  it("no hay dos figuras en la misma casilla", () => {
    const ocupadas = [
      ...MISION_CALABOZO.entrada.slice(0, 4),
      ...MONSTRUOS_CALABOZO.map((m) => m.celda),
    ].map(claveCelda);
    expect(new Set(ocupadas).size).toBe(ocupadas.length);
  });

  it("ningún monstruo empieza encima del mobiliario", () => {
    const muebles = new Set(MUEBLES_CALABOZO.flatMap((m) => m.celdas).map(claveCelda));
    for (const m of MONSTRUOS_CALABOZO)
      expect(muebles.has(claveCelda(m.celda)), `${m.id} está sobre un mueble`).toBe(false);
  });

  it("ninguna trampa está debajo de un mueble ni en la entrada", () => {
    const prohibidas = new Set([
      ...MUEBLES_CALABOZO.flatMap((m) => m.celdas),
      ...MISION_CALABOZO.entrada,
    ].map(claveCelda));
    for (const t of TRAMPAS_CALABOZO)
      expect(prohibidas.has(claveCelda(t.celda)), `la trampa ${t.id} está mal puesta`).toBe(false);
  });

  it("toda sala con texto tiene al menos una puerta que lleve a ella", () => {
    const alcanzables = new Set(
      PUERTAS_CALABOZO.flatMap((p) => [salaEn(p.a.x, p.a.y), salaEn(p.b.x, p.b.y)]).filter(Boolean),
    );
    for (const sala of Object.keys(MISION_CALABOZO.textosDeSala))
      expect(alcanzables.has(sala), `a la sala '${sala}' no se llega por ninguna puerta`).toBe(true);
  });

  it("el objetivo es recuperar el pergamino en la sala del guardián, y el guardián empieza en ella", () => {
    // T53: la misión termina al registrar la sala del guardián con él muerto.
    const obj = MISION_CALABOZO.objetivo;
    expect(obj.clase).toBe("recuperar");
    if (obj.clase !== "recuperar") return;
    const custodio = MONSTRUOS_CALABOZO.find((m) => m.id === obj.custodio);
    expect(custodio, `el custodio '${obj.custodio}' no está entre los monstruos`).toBeTruthy();
    expect(salaEn(custodio!.celda.x, custodio!.celda.y)).toBe(obj.sala);
    // La sala del pergamino tiene texto: es de las que se pisan, no un cuarto pintado.
    expect(Object.keys(MISION_CALABOZO.textosDeSala)).toContain(obj.sala);
    // Y la introducción dice a los héroes qué tienen que hacer.
    expect(MISION_CALABOZO.introduccion).toMatch(/pergamino/);
  });

  it("cada monstruo está en la sala que le toca", () => {
    // Todos dentro de salas, ninguno suelto en un pasillo ni sobre un vano.
    const vanos = new Set(PUERTAS_CALABOZO.flatMap((p) => [p.a, p.b]).map(claveCelda));
    for (const m of MONSTRUOS_CALABOZO) {
      expect(salaEn(m.celda.x, m.celda.y), `${m.id} está en un pasillo`).not.toBeNull();
      expect(vanos.has(claveCelda(m.celda)), `${m.id} está sobre una puerta`).toBe(false);
    }
  });

  it("las salas pobladas de T55: doce con monstruo, ninguna más dura que la del guardián", () => {
    // Firma de Juan Luis del 2026-09-06: salas con monstruos y tesoros, y el
    // 100 % de victorias de la primera misión está bien. La barra de dureza es
    // la sala del guardián: un fimir solo, 3 dados de ataque y 2 de cuerpo.
    const porSala = new Map<string, typeof MONSTRUOS_CALABOZO>();
    for (const m of MONSTRUOS_CALABOZO) {
      const s = salaEn(m.celda.x, m.celda.y)!;
      porSala.set(s, [...(porSala.get(s) ?? []), m]);
    }
    expect(porSala.size).toBe(12);
    expect(MONSTRUOS_CALABOZO).toHaveLength(17);
    const guardian = MONSTRUOS.fimir;
    for (const [sala, ms] of porSala) {
      expect(ms.length, `la sala ${sala} tiene ${ms.length} monstruos`).toBeLessThanOrEqual(3);
      const cuerpo = ms.reduce((s, m) => s + MONSTRUOS[m.especie].cuerpo, 0);
      const ataque = Math.max(...ms.map((m) => MONSTRUOS[m.especie].ataque));
      expect(cuerpo, `la sala ${sala} suma ${cuerpo} de cuerpo`).toBeLessThanOrEqual(guardian.cuerpo);
      expect(ataque, `en la sala ${sala} alguien ataca con ${ataque}`).toBeLessThanOrEqual(guardian.ataque);
    }
    // Solo las especies de la caja que Juan Luis puede tener en cartón, y
    // nunca más de doce de una (la reserva de nombres de T42).
    const porEspecie: Record<string, number> = {};
    for (const m of MONSTRUOS_CALABOZO) porEspecie[m.especie] = (porEspecie[m.especie] ?? 0) + 1;
    expect(Object.keys(porEspecie).sort()).toEqual(["esqueleto", "fimir", "goblin", "orco", "zombi"]);
    for (const [especie, n] of Object.entries(porEspecie)) expect(n, especie).toBeLessThanOrEqual(12);
    // Y el resto del recuento, para que nadie lo cambie sin querer.
    expect(TRAMPAS_CALABOZO).toHaveLength(6);
    expect(MUEBLES_CALABOZO).toHaveLength(13);
    expect(Object.keys(MISION_CALABOZO.textosDeSala)).toHaveLength(22);
  });

  it("las trampas nuevas están en pasillo y ninguna bajo un vano", () => {
    const vanos = new Set(PUERTAS_CALABOZO.flatMap((p) => [p.a, p.b]).map(claveCelda));
    for (const t of TRAMPAS_CALABOZO) expect(vanos.has(claveCelda(t.celda)), `la trampa ${t.id} está bajo una puerta`).toBe(false);
    for (const id of ["foso2", "lanza2", "bloque2"]) {
      const t = TRAMPAS_CALABOZO.find((x) => x.id === id)!;
      expect(esPasillo(t.celda.x, t.celda.y), `${id} no está en un pasillo`).toBe(true);
    }
  });

  it("la partida se construye sin reventar y no empieza terminada", () => {
    const e = crearPartida({
      mision: MISION_CALABOZO,
      heroes: [{ clase: "barbaro" }, { clase: "enano" }, { clase: "elfo" }, { clase: "mago" }],
      monstruos: MONSTRUOS_CALABOZO,
      puertas: PUERTAS_CALABOZO,
      muebles: MUEBLES_CALABOZO,
      trampas: TRAMPAS_CALABOZO,
      semilla: 1,
    });
    expect(e.heroes).toHaveLength(4);
    expect(e.monstruos).toHaveLength(MONSTRUOS_CALABOZO.length);
    expect(e.desenlace).toBeNull();
    expect(e.salasReveladas).toEqual([]);
    // Los cuatro héroes en casillas distintas.
    expect(new Set(e.heroes.map((h) => claveCelda(h.celda))).size).toBe(4);
  });
});

// ------------------------------------------------------------ toda misión del catálogo

import { MISIONES, type MisionCompleta } from "../src/data/quests";

/**
 * Lo que tiene que cumplir CUALQUIER misión del catálogo (T45), presente o
 * futura. T46, T47 y las que vengan no escriben tests de estructura: con
 * añadirse a `MISIONES` pasan por aquí. Los tests de arriba son del calabozo
 * en concreto —sus recuentos, su pergamino— y se quedan como están.
 */
describe.each(MISIONES.map((m) => [m.mision.id, m] as const))("la misión «%s» está bien construida", (_id, m: MisionCompleta) => {
  const monstruos = m.monstruos;
  const vanos = new Set(m.puertas.flatMap((p) => [p.a, p.b]).map(claveCelda));
  const muebles = new Set(m.muebles.flatMap((x) => x.celdas).map(claveCelda));

  it("todo cae dentro del tablero", () => {
    const todas: Celda[] = [
      ...m.mision.entrada,
      ...monstruos.map((x) => x.celda),
      ...m.trampas.map((t) => t.celda),
      ...m.muebles.flatMap((x) => x.celdas),
      ...m.puertas.flatMap((p) => [p.a, p.b]),
    ];
    for (const c of todas) expect(dentroDelTablero(c.x, c.y), `fuera del tablero: ${claveCelda(c)}`).toBe(true);
  });

  it("no repite identificadores de puertas, monstruos, trampas ni muebles", () => {
    for (const [que, ids] of [
      ["puertas", m.puertas.map((p) => p.id)],
      ["monstruos", monstruos.map((x) => x.id)],
      ["trampas", m.trampas.map((t) => t.id)],
      ["muebles", m.muebles.map((x) => x.id)],
    ] as const) {
      expect(new Set(ids).size, `${que} con id repetido`).toBe(ids.length);
    }
  });

  it("la entrada está en pasillo, sin mueble ni trampa encima, y sin casillas repetidas", () => {
    expect(m.mision.entrada.length).toBeGreaterThan(0);
    const trampas = new Set(m.trampas.map((t) => claveCelda(t.celda)));
    for (const c of m.mision.entrada) {
      expect(esPasillo(c.x, c.y), `la entrada ${claveCelda(c)} no es pasillo`).toBe(true);
      expect(muebles.has(claveCelda(c)), `un mueble ocupa la entrada ${claveCelda(c)}`).toBe(false);
      expect(trampas.has(claveCelda(c)), `una trampa está en la entrada ${claveCelda(c)}`).toBe(false);
    }
    const claves = m.mision.entrada.map(claveCelda);
    expect(new Set(claves).size).toBe(claves.length);
  });

  it("cada puerta une dos casillas contiguas sobre un muro real, y no hay dos en el mismo vano", () => {
    for (const p of m.puertas) {
      const adyacente = Math.abs(p.a.x - p.b.x) + Math.abs(p.a.y - p.b.y) === 1;
      expect(adyacente, `la puerta ${p.id} une casillas no contiguas`).toBe(true);
      expect(hayMuroEntre(p.a, p.b), `la puerta ${p.id} no está sobre un muro`).toBe(true);
    }
    const claves = m.puertas.flatMap((p) => [p.a, p.b]).map(claveCelda);
    expect(new Set(claves).size).toBe(claves.length);
  });

  it("los monstruos empiezan dentro de una sala, en casillas distintas, sin mueble ni vano debajo", () => {
    for (const x of monstruos) {
      expect(salaEn(x.celda.x, x.celda.y), `${x.id} está en un pasillo`).not.toBeNull();
      expect(vanos.has(claveCelda(x.celda)), `${x.id} está sobre una puerta`).toBe(false);
      expect(muebles.has(claveCelda(x.celda)), `${x.id} está sobre un mueble`).toBe(false);
    }
    const ocupadas = [...m.mision.entrada, ...monstruos.map((x) => x.celda)].map(claveCelda);
    expect(new Set(ocupadas).size).toBe(ocupadas.length);
  });

  it("ningún mueble tapa un vano, y dos muebles no comparten casilla", () => {
    for (const p of m.puertas)
      for (const v of [p.a, p.b])
        expect(muebles.has(claveCelda(v)), `un mueble tapa el vano de '${p.id}'`).toBe(false);
    const celdas = m.muebles.flatMap((x) => x.celdas).map(claveCelda);
    expect(new Set(celdas).size).toBe(celdas.length);
  });

  it("ninguna trampa está bajo un mueble ni bajo un vano", () => {
    for (const t of m.trampas) {
      expect(muebles.has(claveCelda(t.celda)), `la trampa ${t.id} está bajo un mueble`).toBe(false);
      expect(vanos.has(claveCelda(t.celda)), `la trampa ${t.id} está bajo una puerta`).toBe(false);
    }
  });

  it("toda sala con texto tiene una puerta que lleve a ella", () => {
    const conPuerta = new Set(m.puertas.flatMap((p) => [salaEn(p.a.x, p.a.y), salaEn(p.b.x, p.b.y)]).filter(Boolean));
    for (const sala of Object.keys(m.mision.textosDeSala))
      expect(conPuerta.has(sala as IdSala), `a la sala '${sala}' no se llega por ninguna puerta`).toBe(true);
  });

  it("el objetivo apunta a algo que existe", () => {
    const obj = m.mision.objetivo;
    switch (obj.clase) {
      case "matarA":
        expect(monstruos.some((x) => x.id === obj.figura), `'${obj.figura}' no está entre los monstruos`).toBe(true);
        break;
      case "recuperar":
        expect(Object.keys(m.mision.textosDeSala), `la sala '${obj.sala}' no tiene texto`).toContain(obj.sala);
        if (obj.custodio) {
          const custodio = monstruos.find((x) => x.id === obj.custodio);
          expect(custodio, `el custodio '${obj.custodio}' no está entre los monstruos`).toBeTruthy();
          expect(salaEn(custodio!.celda.x, custodio!.celda.y)).toBe(obj.sala);
        }
        break;
      case "llegarA":
        expect(obj.celdas.length).toBeGreaterThan(0);
        for (const c of obj.celdas) expect(dentroDelTablero(c.x, c.y)).toBe(true);
        break;
      case "salir":
        // Firma del 2026-09-06 (T35): con ocho héroes, salir exige ocho casillas.
        expect(m.mision.entrada.length, "una misión de salir declara al menos ocho casillas").toBeGreaterThanOrEqual(8);
        break;
      case "matarATodos":
        expect(monstruos.length, "matar a todos sin nadie a quien matar").toBeGreaterThan(0);
        break;
    }
  });

  it("cabe en el cartón construido: puertas, marcadores secretos y mobiliario", () => {
    expect(m.puertas.filter((p) => !p.secreta).length).toBeLessThanOrEqual(PUERTAS_A_CONSTRUIR);
    expect(m.puertas.filter((p) => p.secreta).length).toBeLessThanOrEqual(MARCADORES_SECRETOS);
    const usadas: Record<string, number> = {};
    for (const x of m.muebles) usadas[x.tipo] = (usadas[x.tipo] ?? 0) + 1;
    for (const [tipo, n] of Object.entries(usadas)) {
      const plantilla = MOBILIARIO.find((p) => p.tipo === tipo);
      expect(plantilla, `no hay plantilla para '${tipo}'`).toBeTruthy();
      expect(n, `usa ${n} de '${tipo}' y solo hay ${plantilla!.cuantas}`).toBeLessThanOrEqual(plantilla!.cuantas);
    }
    for (const x of m.muebles) {
      const plantilla = MOBILIARIO.find((p) => p.tipo === x.tipo)!;
      expect(x.celdas.length, `${x.id} ocupa ${x.celdas.length} casillas`).toBe(plantilla.ancho * plantilla.alto);
    }
  });

  it("desde la entrada se llega a las 22 salas enteras, y sin abrir ninguna secreta", () => {
    // El test de alcanzabilidad de T40, para cada misión: todas las salas con
    // puerta y ninguna que dependa de una secreta para entrar.
    const enteras = salasQueSePisan(m.puertas, m);
    const sinAlcanzar = idsDeSalas().filter((s) => !enteras.has(s));
    expect(sinAlcanzar, `salas sin alcanzar: ${sinAlcanzar.join(" ")}`).toEqual([]);
    expect(salasQueSePisan(m.puertas.filter((p) => !p.secreta), m).size).toBe(22);
  });
});

// ------------------------------------------------------------------ el torreón (T46)

import { MISION_TORREON, MONSTRUOS_TORREON, PUERTAS_TORREON } from "../src/data/quests/torreon";

/**
 * Lo que hace al torreón el torreón, y no otra misión más: el jefe en el
 * salón del trono, el salón sin puerta al pasillo (se entra por dos salas
 * con guardia) y la escalada de dureza. La estructura general ya la
 * comprueba el `describe.each` de arriba.
 */
describe("«El torreón del Señor de la Guerra» (T46)", () => {
  // T47 midió 66 % de victorias en `normal` para las cavernas del troll
  // contra el 55 % del torreón (tras el arreglo de T66) y la regla del
  // catálogo obliga a reordenar por la medida, no por el orden de escritura
  // (`quests/index.ts`): el torreón pasa al índice 2, detrás de las cavernas.
  it("va detrás del calabozo y de las cavernas del troll en el catálogo", () => {
    expect(MISIONES[2]?.mision.id).toBe("torreon");
  });

  it("el objetivo es matar al Señor de la Guerra, un guerrero del Caos que empieza en el salón del trono", () => {
    const obj = MISION_TORREON.objetivo;
    expect(obj.clase).toBe("matarA");
    if (obj.clase !== "matarA") return;
    const jefe = MONSTRUOS_TORREON.find((m) => m.id === obj.figura);
    expect(jefe?.especie).toBe("guerreroDelCaos");
    expect(salaEn(jefe!.celda.x, jefe!.celda.y)).toBe("f");
    expect(MISION_TORREON.introduccion).toMatch(/Señor de la Guerra/);
  });

  it("al salón del trono no se entra desde el pasillo: sus puertas dan a la antesala y a la cripta, y las dos tienen guardia", () => {
    const deF = PUERTAS_TORREON.filter((p) => salaEn(p.a.x, p.a.y) === "f" || salaEn(p.b.x, p.b.y) === "f");
    expect(deF.length).toBe(2);
    for (const p of deF) {
      expect(esPasillo(p.a.x, p.a.y), `la puerta ${p.id} da al pasillo`).toBe(false);
      expect(esPasillo(p.b.x, p.b.y), `la puerta ${p.id} da al pasillo`).toBe(false);
      expect(p.secreta, `la puerta ${p.id} es secreta: un grupo que no busque no llegaría al jefe`).toBe(false);
    }
    const vecinas = deF.flatMap((p) => [salaEn(p.a.x, p.a.y), salaEn(p.b.x, p.b.y)]).filter((s) => s !== "f");
    expect(vecinas.sort()).toEqual(["e", "j"]);
    for (const sala of vecinas)
      expect(MONSTRUOS_TORREON.some((m) => salaEn(m.celda.x, m.celda.y) === sala), `la sala ${sala} está sin guardia`).toBe(true);
  });

  it("veinte monstruos en siete salas, del nivel del calabozo en la primera al jefe que pega más que el guardián", () => {
    const porSala = new Map<string, typeof MONSTRUOS_TORREON>();
    for (const m of MONSTRUOS_TORREON) {
      const s = salaEn(m.celda.x, m.celda.y)!;
      porSala.set(s, [...(porSala.get(s) ?? []), m]);
    }
    expect(MONSTRUOS_TORREON).toHaveLength(20);
    expect([...porSala.keys()].sort()).toEqual(["c", "d", "e", "f", "i", "j", "k"]);
    const ataqueMaximo = (sala: string) => Math.max(...porSala.get(sala)!.map((m) => MONSTRUOS[m.especie].ataque));
    // El cuerpo de guardia, junto a la escalera, no pasa de la barra del calabozo (el fimir).
    expect(ataqueMaximo("c")).toBeLessThanOrEqual(MONSTRUOS.fimir.ataque);
    // El salón del trono sí: es la primera sala del catálogo donde alguien pega más que el guardián.
    expect(ataqueMaximo("f")).toBeGreaterThan(MONSTRUOS.fimir.ataque);
    // Nunca más de doce de una especie: la reserva de nombres de T42.
    const porEspecie: Record<string, number> = {};
    for (const m of MONSTRUOS_TORREON) porEspecie[m.especie] = (porEspecie[m.especie] ?? 0) + 1;
    for (const [especie, n] of Object.entries(porEspecie)) expect(n, especie).toBeLessThanOrEqual(12);
  });
});

// -------------------------------------------------------------- baraja y mobiliario

import { BARAJA_TESOROS, MAZO_COMPLETO, repartoDeLaBaraja, TOTAL_CARTAS } from "../src/data/treasure";
import { MARCADORES_SECRETOS, MOBILIARIO, PUERTAS_A_CONSTRUIR, TOTAL_PIEZAS } from "../src/data/furniture";
import { aplicarAccion } from "../src/engine/reducer";

describe("la baraja de tesoros", () => {
  it("tiene el número de cartas que se van a imprimir", () => {
    expect(TOTAL_CARTAS).toBe(MAZO_COMPLETO.length);
    expect(TOTAL_CARTAS).toBe(BARAJA_TESOROS.reduce((s, c) => s + c.copias, 0));
  });

  it("no hay identificadores repetidos", () => {
    expect(new Set(BARAJA_TESOROS.map((c) => c.id)).size).toBe(BARAJA_TESOROS.length);
  });

  it("una cuarta parte de la baraja sale mal, pero nada es demoledor", () => {
    const r = repartoDeLaBaraja();
    const malas = (r.monstruoErrante ?? 0) + (r.peligro ?? 0);
    expect(malas / TOTAL_CARTAS).toBeGreaterThan(0.2);
    expect(malas / TOTAL_CARTAS).toBeLessThan(0.32);
    for (const c of BARAJA_TESOROS)
      if (c.efecto.clase === "peligro") expect(c.efecto.dano).toBeLessThanOrEqual(1);
  });

  it("se baraja distinto con semillas distintas y siempre entera", () => {
    const a = crearPartida({ mision: MISION_CALABOZO, heroes: [{ clase: "barbaro" }], monstruos: [], semilla: 1 });
    const b = crearPartida({ mision: MISION_CALABOZO, heroes: [{ clase: "barbaro" }], monstruos: [], semilla: 2 });
    expect(a.mazoTesoros).toHaveLength(TOTAL_CARTAS);
    expect(a.mazoTesoros.sort()).toEqual(b.mazoTesoros.sort());
    const a2 = crearPartida({ mision: MISION_CALABOZO, heroes: [{ clase: "barbaro" }], monstruos: [], semilla: 1 });
    expect(a2.mazoTesoros).toEqual(
      crearPartida({ mision: MISION_CALABOZO, heroes: [{ clase: "barbaro" }], monstruos: [], semilla: 1 }).mazoTesoros,
    );
  });

  it("registrar una sala consume una carta del mazo", () => {
    let e = crearPartida({
      mision: MISION_CALABOZO,
      heroes: [{ clase: "barbaro" }],
      monstruos: [],
      semilla: 9,
    });
    // En la sala de la mesa volcada, no en la del guardián: desde T53 registrar
    // la `q` sin el guardián encuentra el pergamino en vez de robar carta.
    e = { ...e, heroes: e.heroes.map((h) => ({ ...h, celda: celdasDeSala("t")[0]! })) };
    const antes = e.mazoTesoros.length;
    const r = aplicarAccion(e, { tipo: "buscarTesoro" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.estado.mazoTesoros).toHaveLength(antes - 1);
    expect(r.eventos.some((x) => x.tipo === "cartaDeTesoro")).toBe(true);
  });
});

describe("el mobiliario que hay que construir", () => {
  it("todas las piezas caben en el tablero", () => {
    for (const m of MOBILIARIO) {
      expect(m.ancho).toBeGreaterThanOrEqual(1);
      expect(m.ancho).toBeLessThanOrEqual(3);
      expect(m.alto).toBeGreaterThanOrEqual(1);
      expect(m.alto).toBeLessThanOrEqual(3);
    }
  });

  it("todo el mobiliario impide plantarse encima", () => {
    for (const m of MOBILIARIO) expect(m.bloqueaPaso, `${m.nombre}`).toBe(true);
  });

  it("solo lo alto tapa la vista", () => {
    const tapan = MOBILIARIO.filter((m) => m.bloqueaVista).map((m) => m.tipo);
    expect(tapan.sort()).toEqual(["armario", "bastidor", "estanteria"]);
  });

  it("el recuento total cuadra", () => {
    expect(TOTAL_PIEZAS).toBe(MOBILIARIO.reduce((s, m) => s + m.cuantas, 0));
    expect(TOTAL_PIEZAS).toBeGreaterThan(10);
  });
});

describe("la misión cabe en el cartón que hay construido", () => {
  it("no usa más puertas de las que hay", () => {
    const normales = PUERTAS_CALABOZO.filter((p) => !p.secreta).length;
    const secretas = PUERTAS_CALABOZO.filter((p) => p.secreta).length;
    expect(normales).toBeLessThanOrEqual(PUERTAS_A_CONSTRUIR);
    expect(secretas).toBeLessThanOrEqual(MARCADORES_SECRETOS);
  });

  it("no usa más mobiliario del que hay construido", () => {
    const usadas: Record<string, number> = {};
    for (const m of MUEBLES_CALABOZO) usadas[m.tipo] = (usadas[m.tipo] ?? 0) + 1;
    for (const [tipo, n] of Object.entries(usadas)) {
      const disponibles = MOBILIARIO.find((x) => x.tipo === tipo)?.cuantas ?? 0;
      expect(n, `la misión usa ${n} de '${tipo}' y solo hay ${disponibles}`).toBeLessThanOrEqual(disponibles);
    }
  });

  it("cada mueble ocupa el número de casillas que dice su plantilla", () => {
    for (const m of MUEBLES_CALABOZO) {
      const plantilla = MOBILIARIO.find((x) => x.tipo === m.tipo);
      expect(plantilla, `no hay plantilla para '${m.tipo}'`).toBeTruthy();
      expect(m.celdas.length, `${m.id} ocupa ${m.celdas.length} casillas`).toBe(
        plantilla!.ancho * plantilla!.alto,
      );
    }
  });

  it("ningún mueble tapa la casilla de una puerta", () => {
    // Un mueble que bloquea el paso encima del vano deja la puerta inservible:
    // se puede abrir pero no se puede cruzar.
    const ocupadas = new Set(
      MUEBLES_CALABOZO.filter((m) => m.bloqueaPaso).flatMap((m) => m.celdas).map(claveCelda),
    );
    for (const p of PUERTAS_CALABOZO) {
      expect(ocupadas.has(claveCelda(p.a)), `un mueble tapa el vano de '${p.id}'`).toBe(false);
      expect(ocupadas.has(claveCelda(p.b)), `un mueble tapa el vano de '${p.id}'`).toBe(false);
    }
  });

  it("ningún mueble cae sobre la entrada de los héroes", () => {
    const ocupadas = new Set(MUEBLES_CALABOZO.flatMap((m) => m.celdas).map(claveCelda));
    for (const c of MISION_CALABOZO.entrada)
      expect(ocupadas.has(claveCelda(c)), `un mueble ocupa la entrada ${claveCelda(c)}`).toBe(false);
  });

  it("hay piezas de sobra para el total declarado", () => {
    expect(TOTAL_PIEZAS).toBeGreaterThanOrEqual(MUEBLES_CALABOZO.length);
  });
});

// -------------------------------------------------------------- todas las salas se pisan

import { celdasDeSala, idsDeSalas } from "../src/data/board-base";
import { alcanzables } from "../src/engine/board";
import type { Puerta } from "../src/engine/types";

/**
 * La lista de puertas que tenía la misión antes de la T40.
 *
 * Está copiada aquí a propósito y no importada: es lo que hace que el test de
 * alcanzabilidad tenga una mitad negativa de verdad. Sin ella, un test que
 * afirma «se llega a las 22 salas» pasa igual de verde estando bien la misión
 * que estando mal la medida, y no habría manera de notarlo.
 */
const PUERTAS_ANTES_DE_T40: Puerta[] = [
  { id: "ps", a: { x: 12, y: 15 }, b: { x: 11, y: 15 }, abierta: false, secreta: false, descubierta: true },
  { id: "pt", a: { x: 13, y: 14 }, b: { x: 14, y: 14 }, abierta: false, secreta: false, descubierta: true },
  { id: "pr", a: { x: 6, y: 18 }, b: { x: 6, y: 17 }, abierta: false, secreta: false, descubierta: true },
  { id: "pq", a: { x: 0, y: 15 }, b: { x: 1, y: 15 }, abierta: false, secreta: false, descubierta: true },
  { id: "psecreta", a: { x: 4, y: 13 }, b: { x: 4, y: 14 }, abierta: false, secreta: true, descubierta: false },
];

/**
 * Salas a cuyas casillas pisables llega un héroe desde la escalera con todas
 * las puertas abiertas, las secretas incluidas.
 *
 * Va por el motor de verdad (`alcanzables`) y no por un recorrido propio, para
 * que cuente como camino exactamente lo que contará en la mesa. Sin monstruos,
 * porque un monstruo no es un muro: se mata y se sigue. El mobiliario sí, que
 * no se quita de en medio, así que sus casillas no entran en la cuenta.
 */
function salasQueSePisan(puertas: readonly Puerta[], m: MisionCompleta = MISIONES[0]!): Set<string> {
  const e = crearPartida({
    mision: m.mision,
    heroes: [{ clase: "barbaro" }],
    monstruos: [],
    puertas: puertas.map((p) => ({ ...p, abierta: true, descubierta: true })),
    muebles: [...m.muebles],
    trampas: [...m.trampas],
    semilla: 1,
  });
  const heroe = e.heroes[0]!;
  // 500 puntos: el tablero entero son 494 casillas, así que nada se queda
  // fuera por falta de movimiento y solo cuentan los muros.
  const mapa = alcanzables(e, heroe, 500);
  const ocupadas = new Set(
    m.muebles.filter((x) => x.bloqueaPaso).flatMap((x) => x.celdas).map(claveCelda),
  );
  const enteras = new Set<string>();
  for (const sala of idsDeSalas()) {
    const pisables = celdasDeSala(sala).filter((c) => !ocupadas.has(claveCelda(c)));
    if (pisables.every((c) => mapa.has(claveCelda(c)))) enteras.add(sala);
  }
  return enteras;
}

describe("todas las salas del tablero son accesibles", () => {
  it("desde la escalera se llega a las 22 salas enteras", () => {
    const enteras = salasQueSePisan(PUERTAS_CALABOZO);
    const sinAlcanzar = idsDeSalas().filter((s) => !enteras.has(s));
    expect(sinAlcanzar, `salas sin alcanzar: ${sinAlcanzar.join(" ")}`).toEqual([]);
    expect(enteras.size).toBe(22);
  });

  it("con la lista de puertas vieja solo se llegaba a cinco", () => {
    const enteras = salasQueSePisan(PUERTAS_ANTES_DE_T40);
    expect([...enteras].sort()).toEqual(["l", "q", "r", "s", "t"]);
    expect(idsDeSalas().length - enteras.size).toBe(17);
  });

  it("ninguna sala depende de una puerta secreta para entrar", () => {
    // Si la única entrada de una sala fuese secreta, un grupo que no registre
    // en busca de puertas secretas se quedaría sin poder terminar la misión.
    const conNormal = new Set(
      PUERTAS_CALABOZO.filter((p) => !p.secreta).flatMap((p) => [
        salaEn(p.a.x, p.a.y),
        salaEn(p.b.x, p.b.y),
      ]),
    );
    for (const sala of idsDeSalas())
      expect(conNormal.has(sala), `a la sala '${sala}' solo se entra por una secreta`).toBe(true);
  });

  it("sin abrir las secretas se sigue llegando a las 22 salas", () => {
    const soloNormales = PUERTAS_CALABOZO.filter((p) => !p.secreta);
    expect(salasQueSePisan(soloNormales).size).toBe(22);
  });

  it("no hay dos puertas sobre la misma casilla", () => {
    // Dos puertas que comparten vano son dos marcadores de cartón peleándose
    // por una casilla del tablero físico.
    const vanos = PUERTAS_CALABOZO.flatMap((p) => [p.a, p.b]).map(claveCelda);
    expect(new Set(vanos).size).toBe(vanos.length);
  });

  it("ninguna trampa cae debajo del vano de una puerta", () => {
    const trampas = new Set(TRAMPAS_CALABOZO.map((t) => claveCelda(t.celda)));
    for (const p of PUERTAS_CALABOZO)
      for (const v of [p.a, p.b])
        expect(trampas.has(claveCelda(v)), `una trampa está en el vano de '${p.id}'`).toBe(false);
  });
});
