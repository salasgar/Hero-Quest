/**
 * El reductor: `aplicarAccion(estado, accion) → { estado, eventos }`.
 *
 * Es una función pura. Nunca muta lo que recibe, no tira dados por su cuenta
 * fuera del generador con semilla que lleva el estado, y no sabe nada de React.
 * De ahí salen tres cosas que importan mucho jugando con niños:
 *
 *  - **Deshacer**: basta con rehacer la partida desde el principio con una
 *    acción menos. Con la semilla dentro del estado, sale idéntica.
 *  - **Guardar y reanudar**: el estado es JSON y nada más.
 *  - **Tests**: se comprueba una regla sin levantar ni un píxel de interfaz.
 *
 * Las acciones ilegales no lanzan excepciones: devuelven `{ ok: false, motivo }`
 * para que la interfaz pueda explicar por qué no se puede hacer eso.
 */

import { salaEn } from "../data/board-base";
import { HECHIZOS } from "../data/spells";
import { BARAJA_TESOROS, MAZO_COMPLETO } from "../data/treasure";
import { MONSTRUOS } from "../data/monsters";
import { HEROES } from "../data/heroes";
import { EQUIPO } from "../data/equipment";
import { celdaLibre, figuraPorId, pasoAbierto, rutaHasta, vuela } from "./board";
import { vecinas as vecinasDelTablero } from "../data/board-base";
import {
  armaADistanciaDe,
  modoDeAtaqueContra,
  resolverAtaque,
  resolverDanoDirecto,
} from "./combat";
import { tirarD6, tirarMovimiento as tirarDadosMovimiento } from "./dice";
import { elegir } from "./rng";
import { conMonstruosEnTablero, conPuertasVistas, puedeVer, salasDeLaPuerta } from "./vision";
import {
  esHeroe,
  mismaCelda,
  type Accion,
  type Actor,
  type Celda,
  type EstadoPartida,
  type Evento,
  type Figura,
  type Heroe,
  type IdFigura,
  type IdSala,
  type Monstruo,
  type Resultado,
  type Trampa,
} from "./types";

// ------------------------------------------------------------ consultas

export const actorActual = (e: EstadoPartida): Actor => e.turno.orden[e.turno.indice]!;

export const esTurnoDeZargon = (e: EstadoPartida): boolean => actorActual(e) === "zargon";

/** La figura que está actuando: el héroe de turno, o el monstruo activo. */
export function figuraActiva(e: EstadoPartida): Figura | null {
  if (esTurnoDeZargon(e)) {
    return e.turno.monstruoActivo ? (figuraPorId(e, e.turno.monstruoActivo) ?? null) : null;
  }
  return figuraPorId(e, actorActual(e)) ?? null;
}

const vivos = <T extends { cuerpo: number }>(xs: readonly T[]): T[] => xs.filter((f) => f.cuerpo > 0);

/**
 * Monstruos que Zargon puede activar, dados los que ya han terminado.
 *
 * Vive aquí y no en `selectors.ts` porque de ahí lo consumen tres sitios —el
 * selector de la pantalla, la guarda de `activarMonstruo` y el cierre del turno
 * de Zargon— y `selectors.ts` importa de este fichero, no al revés. Estaba
 * copiado en los tres, y el tercero es el que se olvidaba: si el cierre del
 * turno cuenta monstruos que la pantalla no ofrece, el turno de Zargon no
 * termina nunca y la partida se queda parada.
 *
 * `monstruosEnTablero` es la condición nueva (reglamento p. 11: solo se mueve lo
 * que está puesto sobre el tablero). Las otras tres ya estaban.
 */
export function monstruosActivables(
  e: EstadoPartida,
  hechos: readonly IdFigura[] = e.turno.monstruosHechos,
): Monstruo[] {
  return vivos(e.monstruos).filter(
    (m) =>
      e.monstruosEnTablero.includes(m.id) &&
      !hechos.includes(m.id) &&
      !m.dormido &&
      !m.pierdeTurno,
  );
}

const movimientoDe = (f: Figura): number =>
  f.tipo === "monstruo" ? MONSTRUOS[f.especie].movimiento : 0;

// ------------------------------------------------------------ utilidades

const fallo = (motivo: string): Resultado => ({ ok: false, motivo });

/** Copia superficial con los héroes y monstruos sustituidos por su versión nueva. */
function conFigura(e: EstadoPartida, f: Figura): EstadoPartida {
  return f.tipo === "heroe"
    ? { ...e, heroes: e.heroes.map((h) => (h.id === f.id ? (f as Heroe) : h)) }
    : { ...e, monstruos: e.monstruos.map((m) => (m.id === f.id ? (f as Monstruo) : m)) };
}

function aplicarDano(e: EstadoPartida, f: Figura, dano: number): [EstadoPartida, Evento[]] {
  if (dano <= 0) return [e, []];
  // La piel de piedra se resquebraja con el primer golpe que pasa: por eso su
  // duración cuelga del daño y no del reloj del turno.
  const herida = {
    ...f,
    cuerpo: Math.max(0, f.cuerpo - dano),
    efectos: f.efectos.filter((x) => x.duracion !== "hastaRecibirDano"),
  } as Figura;
  const eventos: Evento[] = [];
  let estado = conFigura(e, herida);
  if (herida.cuerpo === 0) eventos.push({ tipo: "figuraDerrotada", figura: herida.id });
  return [estado, eventos];
}

/** Revela una sala: se apunta como vista y se anuncian sus monstruos. */
function revelarSala(e: EstadoPartida, sala: string): [EstadoPartida, Evento[]] {
  if (e.salasReveladas.includes(sala)) return [e, []];
  const dentro = vivos(e.monstruos).filter((m) => salaEn(m.celda.x, m.celda.y) === sala);
  return [
    { ...e, salasReveladas: [...e.salasReveladas, sala] },
    [
      {
        tipo: "salaRevelada",
        sala,
        texto: e.mision.textosDeSala[sala] ?? null,
        monstruos: dentro.map((m) => m.id),
      },
    ],
  ];
}

/** ¿Se ha acabado la partida? Se comprueba tras cada acción. */
function comprobarDesenlace(e: EstadoPartida): [EstadoPartida, Evento[]] {
  if (e.desenlace) return [e, []];

  if (vivos(e.heroes).length === 0) {
    const d = { victoria: false, motivo: "Todos los héroes han caído." };
    return [{ ...e, desenlace: d }, [{ tipo: "finDePartida", ...d }]];
  }

  const obj = e.mision.objetivo;
  // `e.monstruos` conserva a los caídos con cuerpo 0, así que su longitud
  // distingue "los hemos matado a todos" de "esta misión no tenía monstruos".
  if (obj.clase === "matarATodos" && e.monstruos.length > 0 && vivos(e.monstruos).length === 0) {
    const d = { victoria: true, motivo: "No queda ni un monstruo en pie." };
    return [{ ...e, desenlace: d }, [{ tipo: "finDePartida", ...d }]];
  }
  if (obj.clase === "matarA") {
    const objetivo = figuraPorId(e, obj.figura);
    if (objetivo && objetivo.cuerpo === 0) {
      const d = { victoria: true, motivo: "El objetivo de la misión ha caído." };
      return [{ ...e, desenlace: d }, [{ tipo: "finDePartida", ...d }]];
    }
  }
  if (obj.clase === "llegarA") {
    const alguien = vivos(e.heroes).some((h) => obj.celdas.some((c) => mismaCelda(c, h.celda)));
    if (alguien) {
      const d = { victoria: true, motivo: "Un héroe ha alcanzado el objetivo." };
      return [{ ...e, desenlace: d }, [{ tipo: "finDePartida", ...d }]];
    }
  }
  if (obj.clase === "salir") {
    const todos =
      vivos(e.heroes).length > 0 &&
      vivos(e.heroes).every((h) => e.mision.entrada.some((c) => mismaCelda(c, h.celda)));
    if (todos) {
      const d = { victoria: true, motivo: "Los héroes han salido de la mazmorra." };
      return [{ ...e, desenlace: d }, [{ tipo: "finDePartida", ...d }]];
    }
  }
  return [e, []];
}

/**
 * Envoltorio final: apunta lo que el grupo acaba de descubrir —puertas y
 * monstruos—, comprueba el desenlace y añade los eventos al registro.
 *
 * Se actualizan aquí, y no en cada acción que pueda descubrirlos, porque este es
 * el único embudo por el que pasan todas las acciones legales sin excepción:
 * mover, abrir, atravesar la roca y lo que venga después. La lista de sitios
 * siempre se queda corta. Y va **después** de revelar la sala, que ocurre dentro
 * de la acción: al revés, la puerta recién abierta y los monstruos de dentro
 * tardarían un turno en aparecer.
 */
function terminar(e: EstadoPartida, eventos: Evento[]): Resultado {
  const [conDesenlace, masEventos] = comprobarDesenlace(conMonstruosEnTablero(conPuertasVistas(e)));
  const todos = [...eventos, ...masEventos];
  return { ok: true, estado: { ...conDesenlace, registro: [...conDesenlace.registro, ...todos] }, eventos: todos };
}

// ------------------------------------------------------------ trampas

const trampaEn = (e: EstadoPartida, c: Celda): Trampa | undefined =>
  e.trampas.find((t) => !t.gastada && mismaCelda(t.celda, c));

/**
 * Efecto de pisar una trampa.
 *
 * Devuelve si el movimiento se corta ahí y si la figura tiene que retroceder:
 * el bloque que cae ciega la casilla, así que quien lo dispara no puede
 * quedarse encima; vuelve a la casilla de la que venía.
 */
function dispararTrampa(
  e: EstadoPartida,
  t: Trampa,
  f: Figura,
): [EstadoPartida, Evento[], { corta: boolean; retrocede: boolean }] {
  const dano = 1;
  let estado = { ...e, trampas: e.trampas.map((x) => (x.id === t.id ? { ...x, gastada: true, descubierta: true } : x)) };
  const eventos: Evento[] = [
    { tipo: "trampaDisparada", trampa: t.id, tipoTrampa: t.tipo, figura: f.id, dano },
  ];
  const actual = figuraPorId(estado, f.id)!;
  const [trasDano, evDano] = aplicarDano(estado, actual, dano);
  estado = trasDano;
  eventos.push(...evDano);

  if (t.tipo === "bloque") {
    // El bloque cae y ciega la casilla para el resto de la misión.
    estado = { ...estado, celdasBloqueadas: [...estado.celdasBloqueadas, t.celda] };
  }
  // El foso y el bloque cortan el movimiento; la lanza no.
  return [estado, eventos, { corta: t.tipo !== "lanza", retrocede: t.tipo === "bloque" }];
}

// ------------------------------------------------------------ el reductor

export function aplicarAccion(estado: EstadoPartida, accion: Accion): Resultado {
  if (estado.desenlace) return fallo("La partida ya ha terminado.");

  switch (accion.tipo) {
    case "tirarMovimiento":
      return tirarMovimientoAccion(estado, accion.dados);
    case "activarMonstruo":
      return activarMonstruo(estado, accion.monstruo);
    case "mover":
      return mover(estado, accion.destino);
    case "abrirPuerta":
      return abrirPuerta(estado, accion.puerta);
    case "atacar":
      return atacar(estado, accion.objetivo, accion.dadosAtaque, accion.dadosDefensa);
    case "buscarTesoro":
      return buscarTesoro(estado);
    case "buscarTrampas":
      return buscarTrampas(estado);
    case "desarmarTrampa":
      return desarmarTrampa(estado, accion.trampa);
    case "lanzarHechizo":
      return lanzarHechizo(estado, accion.hechizo, accion.objetivo, accion.dados);
    case "terminarTurno":
      return terminarTurno(estado);
  }
}

// ------------------------------------------------------------ movimiento

function tirarMovimientoAccion(e: EstadoPartida, dados?: [number, number]): Resultado {
  if (esTurnoDeZargon(e)) return fallo("Los monstruos se mueven un número fijo de casillas: no tiran.");
  if (e.turno.movimientoTotal !== null) return fallo("Ya has tirado el movimiento este turno.");

  let rng = e.rng;
  let tirada: [number, number];
  if (dados) {
    tirada = dados;
  } else {
    const [t, r] = tirarDadosMovimiento(rng);
    tirada = t;
    rng = r;
  }
  const base = tirada[0] + tirada[1];
  const activa = figuraActiva(e);
  let estado: EstadoPartida = { ...e, rng };
  const eventos: Evento[] = [];
  let total = base;

  // El viento veloz añade dos dados a la tirada: cuatro en total, que es lo que
  // dice la carta. Los dos de más los tira la aplicación, porque en la mesa ya
  // se han tirado los otros dos.
  const viento = activa?.efectos.find((x) => x.clase === "movimientoExtra");
  if (activa && viento) {
    let extra = 0;
    let r = estado.rng;
    for (let i = 0; i < (viento.dados ?? 2); i++) {
      const [cara, r2] = tirarD6(r);
      r = r2;
      extra += cara;
    }
    estado = conFigura({ ...estado, rng: r }, gastarMovimientoExtra(activa));
    total += extra;
    eventos.push({ tipo: "movimientoExtra", figura: activa.id, casillas: extra });
  }

  // Y la armadura de placas resta: pesa lo que pesa.
  const lastre = activa && esHeroe(activa) ? penalizacionDeMovimiento(activa) : 0;
  total = Math.max(0, total - lastre);

  const turno = { ...estado.turno, movimientoTotal: total, movimientoRestante: total };
  eventos.unshift({ tipo: "tiradaMovimiento", actor: actorActual(e), dados: tirada, total });
  return terminar({ ...estado, turno }, eventos);
}

/** Lo que la armadura le resta a la tirada de movimiento. */
const penalizacionDeMovimiento = (h: Heroe): number =>
  h.equipo.reduce((s, id) => s + (EQUIPO[id].penalizacionMovimiento ?? 0), 0);

function activarMonstruo(e: EstadoPartida, id: IdFigura): Resultado {
  if (!esTurnoDeZargon(e)) return fallo("No es el turno de Zargon.");
  if (e.turno.monstruoActivo) return fallo("Ya hay un monstruo activo: termina su turno primero.");
  if (e.turno.monstruosHechos.includes(id)) return fallo("Ese monstruo ya ha actuado este turno.");
  const m = figuraPorId(e, id);
  if (!m || m.tipo !== "monstruo") return fallo("No existe ese monstruo.");
  if (m.cuerpo <= 0) return fallo("Ese monstruo está derrotado.");
  // Reglamento p. 11: Zargon mueve los monstruos que están sobre el tablero, y
  // ahí solo se ponen los que los héroes han descubierto (p. 12). Antes de eso
  // la figura sigue dentro de la caja.
  if (!e.monstruosEnTablero.includes(id))
    return fallo("Los héroes todavía no lo han encontrado: ese monstruo no está en el tablero.");
  if (m.dormido) return fallo("Ese monstruo está dormido.");
  if (m.pierdeTurno) return fallo("Ese monstruo pierde este turno.");

  const mov = movimientoDe(m);
  return terminar(
    {
      ...e,
      turno: {
        ...e.turno,
        monstruoActivo: id,
        movimientoTotal: mov,
        movimientoRestante: mov,
        haMovido: false,
        haActuado: false,
        movimientoCerrado: false,
      },
    },
    [],
  );
}

function mover(e: EstadoPartida, destino: Celda): Resultado {
  const f = figuraActiva(e);
  if (!f) return fallo("No hay ninguna figura activa.");
  if (e.turno.movimientoTotal === null) return fallo("Antes hay que tirar el movimiento.");
  if (e.turno.movimientoCerrado) return fallo("Ya has movido y actuado: el movimiento está cerrado.");
  if (e.turno.movimientoRestante <= 0) return fallo("No te queda movimiento.");
  if (!celdaLibre(e, destino, f.id)) return fallo("Esa casilla está ocupada o bloqueada.");

  const ruta = rutaHasta(e, f, destino, e.turno.movimientoRestante);
  if (!ruta) return fallo("No se puede llegar ahí con el movimiento que te queda.");

  let estado = e;
  const eventos: Evento[] = [];
  let recorrido: Celda[] = [];
  const desde = f.celda;

  for (const paso of ruta) {
    const actual = figuraPorId(estado, f.id)!;
    estado = conFigura(estado, { ...actual, celda: paso } as Figura);
    recorrido.push(paso);

    // Tres excepciones, cada una por su motivo: la trampa descubierta ya se ve y
    // no sorprende a nadie; las trampas las coloca Zargon, que sabe dónde están,
    // así que sus monstruos no las disparan (reglamento p. 17: «Monsters do not
    // spring hidden traps»); y quien vuela no pisa el suelo, así que el foso no la
    // traga —la lanza sale de la pared y el bloque cae del techo, y esas dos
    // alcanzan igual a quien vuela—.
    const trampa = trampaEn(estado, paso);
    const laAfecta =
      trampa && !trampa.descubierta && esHeroe(f) && !(trampa.tipo === "foso" && vuela(f));
    if (trampa && laAfecta) {
      const [tras, ev, efecto] = dispararTrampa(estado, trampa, figuraPorId(estado, f.id)!);
      estado = tras;
      eventos.push(...ev);

      if (efecto.retrocede) {
        // La casilla acaba de quedar cegada: hay que salir de ella. Y el camino
        // de vuelta puede estar ocupado, porque un héroe pasa por encima de sus
        // compañeros y el hada por encima de cualquiera: se desanda hasta la
        // primera casilla donde de verdad quepa. La de salida siempre vale, que
        // es de la figura y nadie ha podido metersele dentro.
        recorrido.pop();
        while (recorrido.length > 0 && !celdaLibre(estado, recorrido[recorrido.length - 1]!, f.id))
          recorrido.pop();
        const atras = recorrido[recorrido.length - 1] ?? desde;
        estado = conFigura(estado, { ...figuraPorId(estado, f.id)!, celda: atras } as Figura);
      }
      if (efecto.corta || figuraPorId(estado, f.id)!.cuerpo === 0) break;
    }
  }

  // Las cargas que se gastan moviéndose —velo de niebla y atravesar la roca—
  // se consumen aquí: valen para UN movimiento, no para el turno entero.
  if (recorrido.length > 0) {
    const quien = figuraPorId(estado, f.id)!;
    estado = conFigura(estado, {
      ...quien,
      efectos: quien.efectos.filter(
        (x) => x.clase !== "atravesarMuros" && x.clase !== "atravesarFiguras",
      ),
    } as Figura);
  }

  const gastado = recorrido.length;
  eventos.unshift({
    tipo: "movimiento",
    actor: f.id,
    desde,
    hasta: recorrido[recorrido.length - 1] ?? desde,
    ruta: recorrido,
  });

  // Normalmente una sala se revela al abrir su puerta, pero atravesando la roca
  // se puede entrar sin puerta ninguna. Si un héroe acaba dentro de una sala a
  // oscuras, la sala se enciende: nadie se queda de pie en un sitio que la
  // partida sigue considerando desconocido.
  const donde = figuraPorId(estado, f.id)!.celda;
  const salaFinal = salaEn(donde.x, donde.y);
  if (esHeroe(f) && salaFinal !== null && !estado.salasReveladas.includes(salaFinal)) {
    const [tras, ev] = revelarSala(estado, salaFinal);
    estado = tras;
    eventos.push(...ev);
  }

  estado = {
    ...estado,
    turno: {
      ...estado.turno,
      movimientoRestante: estado.turno.movimientoRestante - gastado,
      haMovido: true,
    },
  };
  return terminar(estado, eventos);
}

// ------------------------------------------------------------ puertas

/**
 * Abrir una puerta es GRATIS en HeroQuest: no gasta movimiento ni consume la
 * acción del turno. Se abre al pasar por delante y se sigue andando.
 */
function abrirPuerta(e: EstadoPartida, idPuerta: string): Resultado {
  const f = figuraActiva(e);
  if (!f) return fallo("No hay ninguna figura activa.");
  const puerta = e.puertas.find((p) => p.id === idPuerta);
  if (!puerta) return fallo("No existe esa puerta.");
  if (puerta.abierta) return fallo("Esa puerta ya está abierta.");
  if (puerta.secreta && !puerta.descubierta) return fallo("Ahí no se ve ninguna puerta.");

  const pegado = mismaCelda(puerta.a, f.celda) || mismaCelda(puerta.b, f.celda);
  if (!pegado) return fallo("Tienes que estar junto a la puerta para abrirla.");

  let estado: EstadoPartida = {
    ...e,
    puertas: e.puertas.map((p) => (p.id === idPuerta ? { ...p, abierta: true } : p)),
  };
  const eventos: Evento[] = [{ tipo: "puertaAbierta", puerta: idPuerta }];

  for (const sala of salasDeLaPuerta(puerta)) {
    const [tras, ev] = revelarSala(estado, sala);
    estado = tras;
    eventos.push(...ev);
  }
  return terminar(estado, eventos);
}

// ------------------------------------------------------------ ataque

function atacar(
  e: EstadoPartida,
  idObjetivo: IdFigura,
  dadosAtaque?: readonly import("./dice").CaraCombate[],
  dadosDefensa?: readonly import("./dice").CaraCombate[],
): Resultado {
  const atacante = figuraActiva(e);
  if (!atacante) return fallo("No hay ninguna figura activa.");
  if (e.turno.haActuado) return fallo("Ya has actuado este turno.");

  const objetivo = figuraPorId(e, idObjetivo);
  if (!objetivo) return fallo("No existe ese objetivo.");
  if (objetivo.cuerpo <= 0) return fallo("Ese objetivo ya está derrotado.");
  if (objetivo.tipo === atacante.tipo) return fallo("No se ataca a los de tu propio bando.");

  // Pegado se pelea cuerpo a cuerpo y de lejos se dispara. Llevar ballesta no
  // impide apuñalar a quien tienes encima: cambia el arma, no la posibilidad.
  const modo = modoDeAtaqueContra(e, atacante, objetivo);
  if (modo === null) {
    return armaADistanciaDe(atacante)
      ? fallo("Ni lo tienes al lado ni lo ves para dispararle.")
      : fallo("Tienes que estar adyacente para atacar cuerpo a cuerpo.");
  }

  const [res, rng] = resolverAtaque(e, atacante, objetivo, dadosAtaque, dadosDefensa, modo);
  let estado: EstadoPartida = { ...e, rng };
  const eventos: Evento[] = [
    {
      tipo: "ataque",
      atacante: atacante.id,
      objetivo: idObjetivo,
      dadosAtaque: res.dadosAtaque,
      calaveras: res.calaveras,
      dadosDefensa: res.dadosDefensa,
      escudos: res.escudos,
      dano: res.dano,
    },
  ];

  const [tras, ev] = aplicarDano(estado, figuraPorId(estado, idObjetivo)!, res.dano);
  estado = tras;
  eventos.push(...ev);

  // Los bonus de "siguiente ataque" se consumen al atacar.
  const yaAtacado = figuraPorId(estado, atacante.id)!;
  estado = conFigura(estado, {
    ...yaAtacado,
    efectos: yaAtacado.efectos.filter((x) => x.duracion !== "siguienteAtaque"),
  } as Figura);

  estado = { ...estado, turno: cerrarAccion(estado.turno) };
  return terminar(estado, eventos);
}

/** Marca la acción como gastada y cierra el movimiento si ya se había movido. */
const cerrarAccion = (t: EstadoPartida["turno"]) => ({
  ...t,
  haActuado: true,
  movimientoCerrado: t.haMovido,
});

// ------------------------------------------------------------ búsquedas

/**
 * ¿Ha registrado ya este héroe esta sala?
 *
 * Vive aquí y la importa `selectors.ts` en vez de escribirla dos veces: es la
 * misma pregunta que hacen la guarda de `buscarTesoro` y el botón de la
 * pantalla, y cuando una condición está copiada en dos sitios acaban
 * discrepando. Ya pasó con el filtro de monstruos activables.
 */
export const yaRegistro = (e: EstadoPartida, heroe: IdFigura, sala: IdSala): boolean =>
  e.buscadoTesoro.some((r) => r.heroe === heroe && r.sala === sala);

function buscarTesoro(e: EstadoPartida): Resultado {
  const f = figuraActiva(e);
  if (!f || !esHeroe(f)) return fallo("Solo los héroes buscan tesoros.");
  if (e.turno.haActuado) return fallo("Ya has actuado este turno.");

  const sala = salaEn(f.celda.x, f.celda.y);
  if (sala === null) return fallo("Solo se busca tesoro dentro de una sala.");
  // Reglamento p. 14: la sala la registran los cuatro héroes, pero cada uno una
  // sola vez. Antes bastaba con que la hubiera registrado cualquiera.
  if (yaRegistro(e, f.id, sala)) return fallo("Ya has registrado esta sala.");

  const monstruosALaVista = vivos(e.monstruos).some((m) => puedeVer(e, f.celda, m.celda));
  if (monstruosALaVista) return fallo("No se puede registrar la sala con monstruos a la vista.");

  // Se roba la primera carta del mazo. Si se acaba, se rehace con la baraja
  // entera: en una partida larga es preferible a quedarse sin tesoros.
  const mazo = e.mazoTesoros.length > 0 ? e.mazoTesoros : MAZO_COMPLETO.map((c) => c.id);
  const idCarta = mazo[0]!;
  const carta = BARAJA_TESOROS.find((c) => c.id === idCarta);

  let estado: EstadoPartida = {
    ...e,
    mazoTesoros: mazo.slice(1),
    buscadoTesoro: [...e.buscadoTesoro, { heroe: f.id, sala }],
    turno: cerrarAccion(e.turno),
  };
  if (!carta) return terminar(estado, [{ tipo: "busquedaSinHallazgo", actor: f.id, que: "tesoro" }]);

  const eventos: Evento[] = [
    { tipo: "cartaDeTesoro", actor: f.id, carta: carta.id, nombre: carta.nombre, texto: carta.texto },
  ];

  switch (carta.efecto.clase) {
    case "oro": {
      const heroe = figuraPorId(estado, f.id) as Heroe;
      estado = conFigura(estado, { ...heroe, oro: heroe.oro + carta.efecto.cantidad });
      eventos.push({ tipo: "tesoroEncontrado", actor: f.id, oro: carta.efecto.cantidad });
      break;
    }
    case "curacion": {
      const h = figuraPorId(estado, f.id)!;
      const puntos = Math.min(carta.efecto.cuerpo, h.cuerpoMax - h.cuerpo);
      if (puntos > 0) {
        estado = conFigura(estado, { ...h, cuerpo: h.cuerpo + puntos } as Figura);
        eventos.push({ tipo: "curacion", figura: h.id, puntos });
      }
      break;
    }
    case "bonusAtaque": {
      const h = figuraPorId(estado, f.id)!;
      estado = conFigura(estado, {
        ...h,
        efectos: [...h.efectos, { clase: "bonusAtaque", dados: carta.efecto.dados, duracion: "siguienteAtaque" }],
      } as Figura);
      break;
    }
    case "peligro": {
      const [tras, ev] = aplicarDano(estado, figuraPorId(estado, f.id)!, carta.efecto.dano);
      estado = tras;
      eventos.push(...ev);
      break;
    }
    case "monstruoErrante": {
      const hueco = vecinasDelTablero(f.celda).find(
        (c) => pasoAbierto(estado, f.celda, c) && celdaLibre(estado, c),
      );
      if (hueco) {
        const plantilla = MONSTRUOS[carta.efecto.especie];
        const id = `errante${estado.monstruos.length + 1}`;
        estado = {
          ...estado,
          monstruos: [
            ...estado.monstruos,
            {
              tipo: "monstruo", id, especie: carta.efecto.especie, celda: hueco,
              cuerpo: plantilla.cuerpo, cuerpoMax: plantilla.cuerpo,
              efectos: [], dormido: false, pierdeTurno: false,
            },
          ],
          // Nace puesto sobre el tablero: lo acaban de sacar de la carta y lo
          // ponen al lado del héroe que la ha robado, a la vista de todos. Sin
          // esta línea dependería de que el acumulador lo pillara, y un errante
          // que aparece en un rincón ciego no actuaría jamás.
          monstruosEnTablero: [...estado.monstruosEnTablero, id],
        };
        eventos.push({ tipo: "monstruoErrante", monstruo: id, celda: hueco });
      }
      break;
    }
  }
  return terminar(estado, eventos);
}

function buscarTrampas(e: EstadoPartida): Resultado {
  const f = figuraActiva(e);
  if (!f || !esHeroe(f)) return fallo("Solo los héroes buscan trampas.");
  if (e.turno.haActuado) return fallo("Ya has actuado este turno.");
  // Reglamento p. 16: «As a hero, you can only search for traps if there are no
  // monsters visible to you», y la misma frase para los pasadizos. La condición
  // es idéntica a la de `puedeBuscarTesoro`, y el selector `puedeBuscarTrampas`
  // tiene que responder lo mismo que esto: si la pantalla pinta el botón y el
  // motor lo rechaza, en la mesa es un clic perdido y una discusión.
  if (vivos(e.monstruos).some((m) => puedeVer(e, f.celda, m.celda)))
    return fallo("No se busca con un monstruo a la vista.");

  const sala = salaEn(f.celda.x, f.celda.y);
  const eventos: Evento[] = [];

  // En una sala se registra la sala entera; en pasillo, lo que se alcance a ver.
  const enZona = (c: Celda) =>
    sala !== null ? salaEn(c.x, c.y) === sala : salaEn(c.x, c.y) === null && puedeVer(e, f.celda, c);

  const trampas = e.trampas.map((t) =>
    !t.descubierta && !t.gastada && enZona(t.celda) ? { ...t, descubierta: true } : t,
  );
  for (const t of trampas)
    if (t.descubierta && !e.trampas.find((x) => x.id === t.id)!.descubierta)
      eventos.push({ tipo: "trampaDescubierta", trampa: t.id, tipoTrampa: t.tipo, celda: t.celda });

  const puertas = e.puertas.map((p) => {
    if (!p.secreta || p.descubierta) return p;
    const cerca = enZona(p.a) || enZona(p.b);
    if (!cerca) return p;
    eventos.push({ tipo: "puertaSecretaDescubierta", puerta: p.id });
    return { ...p, descubierta: true };
  });

  if (eventos.length === 0) eventos.push({ tipo: "busquedaSinHallazgo", actor: f.id, que: "trampas" });

  const estado: EstadoPartida = {
    ...e,
    trampas,
    puertas,
    buscadoTrampas: sala !== null ? [...new Set([...e.buscadoTrampas, sala])] : e.buscadoTrampas,
    turno: cerrarAccion(e.turno),
  };
  return terminar(estado, eventos);
}

function desarmarTrampa(e: EstadoPartida, idTrampa: string): Resultado {
  const f = figuraActiva(e);
  if (!f || !esHeroe(f)) return fallo("Solo los héroes desarman trampas.");
  if (e.turno.haActuado) return fallo("Ya has actuado este turno.");

  const t = e.trampas.find((x) => x.id === idTrampa);
  if (!t) return fallo("No existe esa trampa.");
  // Un foso disparado no es una trampa gastada: es un agujero en el suelo que
  // se queda ahí toda la misión. Reglamento p. 17: «Once a pit trap is sprung
  // and a pit tile placed on the board, the trap cannot be disarmed and
  // removed». Va antes que la comprobación de `gastada` para que el motivo diga
  // la verdad: no es que llegues tarde, es que no hay nada que desarmar.
  if (t.tipo === "foso" && t.gastada) return fallo("Un foso abierto no se desarma: el agujero se queda.");
  if (t.gastada) return fallo("Esa trampa ya está gastada.");
  if (!t.descubierta) return fallo("Primero hay que encontrarla.");

  const tieneHerramientas = f.equipo.includes("herramientas");
  if (!tieneHerramientas) return fallo("Hacen falta herramientas para desarmar.");

  let estado: EstadoPartida = { ...e, turno: cerrarAccion(e.turno) };
  const eventos: Evento[] = [];

  if (HEROES[f.clase].desarmaTrampasSinRiesgo) {
    estado = { ...estado, trampas: estado.trampas.map((x) => (x.id === t.id ? { ...x, gastada: true } : x)) };
    eventos.push({ tipo: "trampaDesarmada", trampa: t.id });
    return terminar(estado, eventos);
  }

  // Los demás la desarman con una calavera; si no, les salta encima.
  const [cara, rng] = elegir(estado.rng, ["calavera", "escudoBlanco", "escudoNegro", "calavera", "calavera", "escudoBlanco"] as const);
  estado = { ...estado, rng };
  if (cara === "calavera") {
    estado = { ...estado, trampas: estado.trampas.map((x) => (x.id === t.id ? { ...x, gastada: true } : x)) };
    eventos.push({ tipo: "trampaDesarmada", trampa: t.id });
  } else {
    const [tras, ev] = dispararTrampa(estado, t, figuraPorId(estado, f.id)!);
    estado = tras;
    eventos.push(...ev);
  }
  return terminar(estado, eventos);
}

// ------------------------------------------------------------ hechizos

function lanzarHechizo(
  e: EstadoPartida,
  idHechizo: import("../data/spells").IdHechizo,
  idObjetivo?: IdFigura,
  dados?: readonly import("./dice").CaraCombate[],
): Resultado {
  const f = figuraActiva(e);
  if (!f || !esHeroe(f)) return fallo("Solo los héroes lanzan hechizos.");
  if (e.turno.haActuado) return fallo("Ya has actuado este turno.");
  if (!f.hechizos.includes(idHechizo)) return fallo("No tienes ese hechizo disponible.");

  const hechizo = HECHIZOS[idHechizo];
  const objetivo = idObjetivo ? figuraPorId(e, idObjetivo) : f;
  if (!objetivo) return fallo("No existe ese objetivo.");
  if (hechizo.requiereVision && !puedeVer(e, f.celda, objetivo.celda))
    return fallo("No tienes línea de visión hasta el objetivo.");

  // Los hechizos se gastan al lanzarlos: una vez por misión, no por mente.
  let estado = conFigura(e, {
    ...f,
    hechizos: f.hechizos.filter((h) => h !== idHechizo),
    hechizosGastados: [...f.hechizosGastados, idHechizo],
  });
  const eventos: Evento[] = [
    { tipo: "hechizoLanzado", actor: f.id, hechizo: idHechizo, objetivo: objetivo.id === f.id ? null : objetivo.id },
  ];

  const efecto = hechizo.efecto;
  switch (efecto.clase) {
    case "danoConSalvacion": {
      // El daño es fijo y quien lo recibe tira dados rojos para librarse: cada
      // 5 o 6 le quita un punto. No es la mecánica del combate, y por eso no
      // pasa por `resolverAtaque` ni cuenta calaveras.
      let rng = estado.rng;
      let salvados = 0;
      for (let i = 0; i < efecto.salvacion; i++) {
        const [cara, r] = tirarD6(rng);
        rng = r;
        if (cara >= 5) salvados++;
      }
      const dano = Math.max(0, efecto.dano - salvados);
      estado = { ...estado, rng };
      eventos.push({
        tipo: "danoDeHechizo",
        hechizo: idHechizo,
        objetivo: objetivo.id,
        dados: [],
        dano,
      });
      const [tras, ev] = aplicarDano(estado, figuraPorId(estado, objetivo.id)!, dano);
      estado = tras;
      eventos.push(...ev);
      break;
    }
    case "curar": {
      const o = figuraPorId(estado, objetivo.id)!;
      const puntos = Math.min(efecto.maximo, o.cuerpoMax - o.cuerpo);
      if (puntos > 0) {
        estado = conFigura(estado, { ...o, cuerpo: o.cuerpo + puntos } as Figura);
        eventos.push({ tipo: "curacion", figura: o.id, puntos });
      }
      break;
    }
    case "bonusAtaque":
    case "bonusDefensa": {
      const o = figuraPorId(estado, objetivo.id)!;
      estado = conFigura(estado, {
        ...o,
        efectos: [
          ...o.efectos,
          {
            clase: efecto.clase,
            dados: efecto.dados,
            duracion: efecto.clase === "bonusAtaque" ? "siguienteAtaque" : "hastaRecibirDano",
          },
        ],
      } as Figura);
      break;
    }
    case "dormir": {
      const o = figuraPorId(estado, objetivo.id)!;
      if (o.tipo === "monstruo" && !MONSTRUOS[o.especie].noMuerto) {
        const menteMonstruo = MONSTRUOS[o.especie].mente;
        if (menteMonstruo <= f.mente) estado = conFigura(estado, { ...o, dormido: true });
      }
      break;
    }
    case "perderTurno": {
      const sala = salaEn(objetivo.celda.x, objetivo.celda.y);
      estado = {
        ...estado,
        monstruos: estado.monstruos.map((m) =>
          salaEn(m.celda.x, m.celda.y) === sala ? { ...m, pierdeTurno: true } : m,
        ),
      };
      break;
    }
    case "invocar": {
      // El genio no se queda de acompañante: cae sobre el enemigo señalado y
      // se deshace. Una figura aliada permanente cambiaría el turno, el bando y
      // la IA entera, y eso es otra cosa, no un hechizo.
      const [res, rng] = resolverDanoDirecto(estado.rng, efecto.dados, dados);
      estado = { ...estado, rng };
      eventos.push({
        tipo: "danoDeHechizo",
        hechizo: idHechizo,
        objetivo: objetivo.id,
        dados: res.dados,
        dano: res.dano,
      });
      const [tras, ev] = aplicarDano(estado, figuraPorId(estado, objetivo.id)!, res.dano);
      estado = tras;
      eventos.push(...ev);
      break;
    }
    case "atravesarFiguras":
    case "atravesarMuros":
    case "movimientoExtra": {
      // Los tres son cargas que se gastan en el siguiente movimiento del
      // objetivo, que puede no ser quien las lanza. Por eso duran "mision":
      // el que las gasta es el movimiento, no el reloj del turno.
      const o = figuraPorId(estado, objetivo.id)!;
      estado = conFigura(estado, {
        ...o,
        efectos: [
          ...o.efectos,
          efecto.clase === "movimientoExtra"
            ? { clase: efecto.clase, dados: efecto.dados, duracion: "mision" as const }
            : { clase: efecto.clase, duracion: "mision" as const },
        ],
      } as Figura);
      break;
    }
  }

  // El viento veloz no reabre un movimiento ya gastado: la carta dice que si lo
  // lanzas sobre ti ANTES de moverte tiras cuatro dados este turno, y si ya te
  // habías movido —o se lo echas a otro— los cuatro dados son de su próximo
  // turno. Las dos cosas salen solas de guardar la carga y gastarla al tirar.
  estado = { ...estado, turno: cerrarAccion(estado.turno) };
  return terminar(estado, eventos);
}

/** Quita la carga de viento veloz de una figura, que se gasta una sola vez. */
const gastarMovimientoExtra = (f: Figura): Figura => ({
  ...f,
  efectos: f.efectos.filter((x) => x.clase !== "movimientoExtra"),
}) as Figura;

// ------------------------------------------------------------ fin de turno

function terminarTurno(e: EstadoPartida): Resultado {
  // Si hay un monstruo actuando, se cierra solo su activación.
  if (esTurnoDeZargon(e) && e.turno.monstruoActivo) {
    const hechos = [...e.turno.monstruosHechos, e.turno.monstruoActivo];
    const quedan = monstruosActivables(e, hechos);
    if (quedan.length > 0) {
      return terminar(
        {
          ...e,
          turno: { ...e.turno, monstruoActivo: null, monstruosHechos: hechos, movimientoTotal: null, movimientoRestante: 0 },
        },
        [],
      );
    }
    return terminar(avanzarActor({ ...e, turno: { ...e.turno, monstruoActivo: null, monstruosHechos: hechos } }), [
      { tipo: "cambioDeTurno", actor: siguienteActor(e) },
    ]);
  }

  return terminar(avanzarActor(e), [{ tipo: "cambioDeTurno", actor: siguienteActor(e) }]);
}

const siguienteActor = (e: EstadoPartida): Actor =>
  e.turno.orden[(e.turno.indice + 1) % e.turno.orden.length]!;

function avanzarActor(e: EstadoPartida): EstadoPartida {
  const indice = (e.turno.indice + 1) % e.turno.orden.length;
  const entraZargon = e.turno.orden[indice] === "zargon";

  // Al empezar la ronda de Zargon se limpian los estados de un turno.
  const monstruos = entraZargon
    ? e.monstruos.map((m) => ({ ...m, pierdeTurno: false }))
    : e.monstruos;

  // Los efectos de duración "turno" caducan al pasar el turno. Los que cuelgan
  // de un movimiento o de un golpe se gastan donde pasa la cosa, no aquí.
  const heroes = e.heroes.map((h) => ({
    ...h,
    efectos: h.efectos.filter((x) => x.duracion !== "turno"),
  }));

  return {
    ...e,
    heroes,
    monstruos,
    turno: {
      ...e.turno,
      indice,
      movimientoTotal: null,
      movimientoRestante: 0,
      haMovido: false,
      haActuado: false,
      movimientoCerrado: false,
      monstruoActivo: null,
      monstruosHechos: entraZargon ? [] : e.turno.monstruosHechos,
    },
  };
}

// ------------------------------------------------------------ repetición

/**
 * Rehace la partida desde el estado inicial aplicando las acciones en orden.
 * Es lo que sostiene el «deshacer»: se descarta la última acción y se repite.
 * Las acciones ilegales se ignoran, para que un guardado antiguo no reviente.
 */
export function repetir(inicial: EstadoPartida, acciones: readonly Accion[]): EstadoPartida {
  let estado = inicial;
  for (const a of acciones) {
    const r = aplicarAccion(estado, a);
    if (r.ok) estado = r.estado;
  }
  return estado;
}
