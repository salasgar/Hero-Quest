/**
 * Sonidos de ambientación (T44).
 *
 * La opción barata del punto 1 de la ficha: nada de ficheros. Cada sonido se
 * sintetiza con `AudioContext` en el momento, así que no hay licencias que
 * apuntar ni peso que cargar. Si algún día se prefieren ficheros de verdad,
 * este módulo es el único que hay que tocar.
 */

import { useEffect, useRef, useState } from "react";
import type { EstadoPartida, Evento } from "../engine/types";

/** Las familias de sonido que hay en la partida. */
export type Sonido =
  | "puerta"
  | "dado"
  | "golpe"
  | "fallo"
  | "caida"
  | "sala"
  | "hechizo"
  | "tesoro"
  | "pocion"
  | "sorpresa"
  | "victoria"
  | "derrota";

/**
 * Qué sonido corresponde a cada evento. Exhaustivo, como `narrar`: un evento
 * nuevo que no se decida aquí no compila. `null` es «este no suena» —el
 * motivo va en cada rama, no todo lo que pasa en la mazmorra tiene que hacer
 * ruido—.
 */
export function sonidoDe(ev: Evento): Sonido | null {
  switch (ev.tipo) {
    case "tiradaMovimiento":
      return "dado";
    case "movimiento":
      return null; // ya sonaron los dados; el paso de la miniatura lo pone la mesa
    case "puertaAbierta":
    case "puertaSecretaDescubierta":
      return "puerta";
    case "salaRevelada":
      return "sala";
    case "ataque":
      return ev.dano > 0 ? "golpe" : "fallo";
    case "figuraDerrotada":
      return "caida";
    case "trampaDisparada":
      return ev.dano > 0 ? "golpe" : "fallo";
    case "saltoDeTrampa":
    case "trampaDescubierta":
    case "trampaDesarmada":
      return null; // se leen en el diario; sonar cada una satura la mesa
    case "busquedaSinHallazgo":
      return null;
    case "tesoroEncontrado":
    case "objetoDeMision":
    case "equipoEncontrado":
    case "cartaDeTesoro":
      return "tesoro";
    case "objetoGuardado":
    case "objetoDado":
      return null; // mover cosas en la mochila no es un hallazgo
    case "pocionUsada":
    case "curacion":
      return "pocion";
    case "monstruoErrante":
      return "sorpresa";
    case "hechizoLanzado":
    case "danoDeHechizo":
    case "efectoDeHechizo":
      return "hechizo";
    case "hechizoSinEfecto":
      return "fallo";
    // Los poderes de monstruo (T50): el maleficio suena como lo que es, y la
    // arena que se abre como la sorpresa que es. La telaraña se lee en el
    // diario y su tirada ya la cuenta el propio turno.
    case "maleficio":
      return ev.dano > 0 ? "hechizo" : "fallo";
    case "emboscada":
      return "sorpresa";
    case "enredado":
    case "tiraParaSoltarse":
      return null;
    case "movimientoExtra":
    case "monstruoActiva":
    case "monstruoSinActuar":
    case "zargonSinMonstruos":
    case "cambioDeTurno":
    case "dormidoDespierta":
      return null; // se anuncian en pantalla y en el diario; no hace falta más
    case "finDePartida":
      return ev.victoria ? "victoria" : "derrota";
  }
}

// -------------------------------------------------------------- síntesis

let contextoAudio: AudioContext | null = null;

/** El contexto de audio, creado la primera vez que hace falta. `null` si el navegador no lo tiene o estamos en un test (sin `window`). */
function contexto(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!contextoAudio) contextoAudio = new Ctor();
  return contextoAudio;
}

/**
 * Desbloquea el audio en los navegadores que lo piden (Safari e iOS lo crean
 * suspendido hasta el primer gesto). Se llama en cada clic de la partida;
 * `resume()` en un contexto ya activo no hace nada, así que llamarla de más
 * no tiene coste.
 */
export function desbloquearAudio(): void {
  const c = contexto();
  if (c && c.state === "suspended") void c.resume();
}

/** Un tono simple que se apaga solo. */
function tono(c: AudioContext, frecuencia: number, duracion: number, tipo: OscillatorType, ganancia: number, cuando: number): void {
  const osc = c.createOscillator();
  const vol = c.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(frecuencia, c.currentTime + cuando);
  vol.gain.setValueAtTime(ganancia, c.currentTime + cuando);
  vol.gain.exponentialRampToValueAtTime(0.001, c.currentTime + cuando + duracion);
  osc.connect(vol).connect(c.destination);
  osc.start(c.currentTime + cuando);
  osc.stop(c.currentTime + cuando + duracion);
}

/** Un tono que sube o baja de frecuencia: la puerta, el hechizo, la caída. */
function barrido(c: AudioContext, desde: number, hasta: number, duracion: number, tipo: OscillatorType, ganancia: number): void {
  const osc = c.createOscillator();
  const vol = c.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(desde, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(hasta, c.currentTime + duracion);
  vol.gain.setValueAtTime(ganancia, c.currentTime);
  vol.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duracion);
  osc.connect(vol).connect(c.destination);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + duracion);
}

/** Ruido blanco corto, apagándose: el rodar de un dado, el golpe seco. */
function ruido(c: AudioContext, duracion: number, ganancia: number, cuando: number): void {
  const muestras = Math.max(1, Math.floor(c.sampleRate * duracion));
  const buffer = c.createBuffer(1, muestras, c.sampleRate);
  const datos = buffer.getChannelData(0);
  for (let i = 0; i < muestras; i++) datos[i] = (Math.random() * 2 - 1) * (1 - i / muestras);
  const fuente = c.createBufferSource();
  fuente.buffer = buffer;
  const vol = c.createGain();
  vol.gain.setValueAtTime(ganancia, c.currentTime + cuando);
  fuente.connect(vol).connect(c.destination);
  fuente.start(c.currentTime + cuando);
}

/** Una nota de un acorde: varios tonos en fila, cada uno un poco más tarde. */
function acorde(c: AudioContext, frecuencias: number[], duracion: number, tipo: OscillatorType, ganancia: number, hueco: number): void {
  frecuencias.forEach((f, i) => tono(c, f, duracion, tipo, ganancia, i * hueco));
}

const RECETAS: Record<Sonido, (c: AudioContext) => void> = {
  puerta: (c) => barrido(c, 180, 90, 0.5, "sawtooth", 0.1),
  dado: (c) => {
    ruido(c, 0.1, 0.09, 0);
    ruido(c, 0.08, 0.07, 0.12);
  },
  golpe: (c) => {
    tono(c, 90, 0.15, "square", 0.22, 0);
    ruido(c, 0.06, 0.14, 0);
  },
  fallo: (c) => barrido(c, 500, 220, 0.16, "sine", 0.07),
  caida: (c) => barrido(c, 220, 55, 0.5, "sawtooth", 0.18),
  sala: (c) => acorde(c, [261.6, 329.6, 392], 0.8, "sine", 0.07, 0.05),
  hechizo: (c) => barrido(c, 300, 950, 0.35, "sine", 0.11),
  tesoro: (c) => acorde(c, [880, 1174.7], 0.2, "sine", 0.1, 0.09),
  pocion: (c) => barrido(c, 500, 700, 0.15, "sine", 0.09),
  sorpresa: (c) => tono(c, 110, 0.4, "sawtooth", 0.18, 0),
  victoria: (c) => acorde(c, [523.3, 659.3, 784, 1046.5], 0.35, "triangle", 0.11, 0.12),
  derrota: (c) => acorde(c, [392, 349.2, 293.7], 0.5, "sine", 0.11, 0.18),
};

/** Suena, si hay con qué. Un navegador raro no debe romper la partida. */
export function reproducir(sonido: Sonido): void {
  const c = contexto();
  if (!c) return;
  try {
    RECETAS[sonido](c);
  } catch {
    // sin audio, la partida sigue igual
  }
}

// -------------------------------------------------------------- silencio

const CLAVE_SILENCIO = "heroquest.sonido-silenciado";

function leerSilencio(): boolean {
  try {
    return localStorage.getItem(CLAVE_SILENCIO) === "1";
  } catch {
    return false;
  }
}

function guardarSilencio(silenciado: boolean): void {
  try {
    localStorage.setItem(CLAVE_SILENCIO, silenciado ? "1" : "0");
  } catch {
    // sin sitio o sin permiso: no se recuerda, y no rompe nada más
  }
}

/** El botón de silencio, con su preferencia recordada en este navegador. */
export function useSilencio(): [boolean, () => void] {
  const [silenciado, setSilenciado] = useState(leerSilencio);
  const alternar = () =>
    setSilenciado((s) => {
      const nuevo = !s;
      guardarSilencio(nuevo);
      return nuevo;
    });
  return [silenciado, alternar];
}

// -------------------------------------------------------------- enganche

/**
 * Suena cada evento nuevo del registro, una vez, nunca por render.
 *
 * El registro de la partida (`estado.registro`) es la misma lista que lee el
 * diario: crece con cada acción aceptada y solo encoge al deshacer o al
 * rehacerse entera desde un sondeo de red. Llevando la cuenta de hasta dónde
 * ya se ha sonado —por índice, como el diario— un render sin acción nueva no
 * repite nada, y un deshacer no suena hacia atrás.
 *
 * Varios eventos de la misma acción (un ataque que además derrota a la
 * figura) suenan en fila, con un hueco corto entre uno y otro para que no se
 * tapen: es la trampa de la ficha sobre el turno de Zargon encadenando
 * acciones.
 */
export function useSonidos(estado: EstadoPartida, silenciado: boolean): void {
  const contados = useRef<number | null>(null);

  useEffect(() => {
    // Primer render de esta partida (o de una recién cargada): no se suena lo
    // que ya había pasado antes de que esta pantalla existiera.
    if (contados.current === null) {
      contados.current = estado.registro.length;
      return;
    }
    const desde = contados.current;
    const hasta = estado.registro.length;
    contados.current = hasta;
    if (silenciado || hasta <= desde) return; // hasta < desde: fue un deshacer
    for (let i = desde; i < hasta; i++) {
      const sonido = sonidoDe(estado.registro[i]!);
      if (sonido) setTimeout(() => reproducir(sonido), (i - desde) * 130);
    }
  }, [estado.registro, silenciado]);
}
