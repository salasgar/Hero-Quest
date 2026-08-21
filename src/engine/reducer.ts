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
import { adyacentes, celdaLibre, figuraPorId, pasoAbierto, rutaHasta, vuela } from "./board";
import { vecinas as vecinasDelTablero } from "../data/board-base";
import { resolverAtaque, resolverDanoDirecto } from "./combat";
import { tirarMovimiento as tirarDadosMovimiento } from "./dice";
import { elegir } from "./rng";
import { puedeVer, salasDeLaPuerta } from "./vision";
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
  const herida = { ...f, cuerpo: Math.max(0, f.cuerpo - dano) } as Figura;
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

/** Envoltorio final: comprueba el desenlace y añade los eventos al registro. */
function terminar(e: EstadoPartida, eventos: Evento[]): Resultado {
  const [conDesenlace, masEventos] = comprobarDesenlace(e);
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
  const total = tirada[0] + tirada[1];
  const turno = { ...e.turno, movimientoTotal: total, movimientoRestante: total };
  return terminar({ ...e, rng, turno }, [
    { tipo: "tiradaMovimiento", actor: actorActual(e), dados: tirada, total },
  ]);
}

function activarMonstruo(e: EstadoPartida, id: IdFigura): Resultado {
  if (!esTurnoDeZargon(e)) return fallo("No es el turno de Zargon.");
  if (e.turno.monstruoActivo) return fallo("Ya hay un monstruo activo: termina su turno primero.");
  if (e.turno.monstruosHechos.includes(id)) return fallo("Ese monstruo ya ha actuado este turno.");
  const m = figuraPorId(e, id);
  if (!m || m.tipo !== "monstruo") return fallo("No existe ese monstruo.");
  if (m.cuerpo <= 0) return fallo("Ese monstruo está derrotado.");
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

    // Quien vuela no pisa el suelo, así que los fosos no la tragan. Las lanzas
    // salen de la pared y el bloque cae del techo: esas la alcanzan igual.
    const trampa = trampaEn(estado, paso);
    const laAfecta = trampa && !trampa.descubierta && !(trampa.tipo === "foso" && vuela(f));
    if (trampa && laAfecta) {
      const [tras, ev, efecto] = dispararTrampa(estado, trampa, figuraPorId(estado, f.id)!);
      estado = tras;
      eventos.push(...ev);

      if (efecto.retrocede) {
        // La casilla acaba de quedar cegada: hay que salir de ella.
        recorrido.pop();
        const atras = recorrido[recorrido.length - 1] ?? desde;
        estado = conFigura(estado, { ...figuraPorId(estado, f.id)!, celda: atras } as Figura);
      }
      if (efecto.corta || figuraPorId(estado, f.id)!.cuerpo === 0) break;
    }
  }

  const gastado = recorrido.length;
  eventos.unshift({
    tipo: "movimiento",
    actor: f.id,
    desde,
    hasta: recorrido[recorrido.length - 1] ?? desde,
    ruta: recorrido,
  });

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

  const arma = esHeroe(atacante)
    ? atacante.equipo.map((id) => EQUIPO[id]).find((x) => x.ranura === "arma" && x.aDistancia)
    : undefined;

  if (arma?.aDistancia) {
    if (!puedeVer(e, atacante.celda, objetivo.celda)) return fallo("No tienes línea de visión.");
    if (adyacentes(e, atacante).some((a) => a.id === idObjetivo))
      return fallo("La ballesta no puede disparar a un enemigo adyacente.");
  } else if (!adyacentes(e, atacante).some((a) => a.id === idObjetivo)) {
    return fallo("Tienes que estar adyacente para atacar cuerpo a cuerpo.");
  }

  const [res, rng] = resolverAtaque(e.rng, atacante, objetivo, dadosAtaque, dadosDefensa);
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

function buscarTesoro(e: EstadoPartida): Resultado {
  const f = figuraActiva(e);
  if (!f || !esHeroe(f)) return fallo("Solo los héroes buscan tesoros.");
  if (e.turno.haActuado) return fallo("Ya has actuado este turno.");

  const sala = salaEn(f.celda.x, f.celda.y);
  if (sala === null) return fallo("Solo se busca tesoro dentro de una sala.");
  if (e.buscadoTesoro.includes(sala)) return fallo("Esta sala ya se ha registrado.");

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
    buscadoTesoro: [...e.buscadoTesoro, sala],
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
    case "danoDirecto": {
      const [res, rng] = resolverDanoDirecto(estado.rng, efecto.dados, dados);
      estado = { ...estado, rng };
      const [tras, ev] = aplicarDano(estado, figuraPorId(estado, objetivo.id)!, res.dano);
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
            duracion: efecto.clase === "bonusAtaque" ? "siguienteAtaque" : "mision",
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
    default:
      // Genio, atravesar la roca, velo de niebla y viento veloz llegan con la
      // interfaz de la Fase 3, que es donde tienen sentido sus efectos.
      break;
  }

  estado = { ...estado, turno: cerrarAccion(estado.turno) };
  return terminar(estado, eventos);
}

// ------------------------------------------------------------ fin de turno

function terminarTurno(e: EstadoPartida): Resultado {
  // Si hay un monstruo actuando, se cierra solo su activación.
  if (esTurnoDeZargon(e) && e.turno.monstruoActivo) {
    const hechos = [...e.turno.monstruosHechos, e.turno.monstruoActivo];
    const quedan = vivos(e.monstruos).filter(
      (m) => !hechos.includes(m.id) && !m.dormido && !m.pierdeTurno,
    );
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

  // Los efectos de duración "turno" caducan al pasar el turno.
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
