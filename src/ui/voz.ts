/**
 * El diario en voz alta (T72).
 *
 * `speechSynthesis` del navegador: sin red, sin clave y sin ficheros que
 * cargar, como los sonidos de T44. La cola la lleva el propio navegador —dos
 * llamadas a `speak()` seguidas se leen una detrás de otra sin que este
 * módulo tenga que encadenarlas— y lo único que hace falta llevar aparte es
 * si hay alguna lectura en curso, para que el turno de Zargon no atropelle
 * una frase a medias (`useTurnoDeZargon.ts`).
 *
 * Nada de Claude aquí: el narrador local es el que decide qué se lee (T39,
 * `TRASPASO.md`), esto solo lo pone en voz.
 */

import { useEffect, useRef, useState } from "react";

/** El sintetizador del navegador, o `null` si no lo hay (tests, navegador raro). */
function sintesis(): SpeechSynthesis | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  return window.speechSynthesis;
}

/** Una voz en español si el navegador tiene alguna cargada; si no, la primera que haya. */
function vozEnEspanol(synth: SpeechSynthesis): SpeechSynthesisVoice | undefined {
  const voces = synth.getVoices();
  return voces.find((v) => v.lang.toLowerCase().startsWith("es")) ?? voces[0];
}

// -------------------------------------------------------------- «¿está leyendo?»

/**
 * Cuántas lecturas hay pendientes ahora mismo (contador, no booleano): con
 * varias frases seguidas —el turno de Zargon encadenando acciones, como en
 * T44— cada `leerTexto` suma una al empezar y resta una al terminar, y «no
 * está leyendo» es que el contador llegue a cero, no que la última que se
 * pidió haya terminado.
 */
let pendientes = 0;
const oyentes = new Set<(leyendo: boolean) => void>();

function avisar(): void {
  const leyendo = pendientes > 0;
  oyentes.forEach((f) => f(leyendo));
}

/** Si hay una lectura en curso ahora mismo, en cualquier componente que lo pregunte. */
export function useVozLeyendo(): boolean {
  const [leyendo, setLeyendo] = useState(() => pendientes > 0);
  useEffect(() => {
    oyentes.add(setLeyendo);
    setLeyendo(pendientes > 0); // por si cambió entre el render y este efecto
    return () => {
      oyentes.delete(setLeyendo);
    };
  }, []);
  return leyendo;
}

// -------------------------------------------------------------- lectura

/** Lee un texto en voz alta. Se resuelve cuando termina (o si no hay voz que leer con). */
export function leerTexto(texto: string, velocidad = 1): Promise<void> {
  return new Promise((resolve) => {
    const synth = sintesis();
    if (!synth) {
      resolve();
      return;
    }
    const u = new SpeechSynthesisUtterance(texto);
    const voz = vozEnEspanol(synth);
    if (voz) u.voice = voz;
    u.rate = velocidad;

    pendientes += 1;
    avisar();
    const terminar = () => {
      pendientes = Math.max(0, pendientes - 1);
      avisar();
      resolve();
    };
    u.onend = terminar;
    u.onerror = terminar; // una voz que falla no debe dejar la mesa esperando para siempre

    try {
      synth.speak(u);
    } catch {
      terminar(); // navegador raro: la partida sigue igual, sin voz
    }
  });
}

/**
 * Corta la lectura en curso y vacía la cola. `cancel()` no dispara `onend` ni
 * `onerror` de las frases que todavía no habían empezado a sonar, así que el
 * contador se repone a mano en vez de esperar a que cada una avise.
 */
export function detenerLectura(): void {
  const synth = sintesis();
  if (synth) synth.cancel();
  pendientes = 0;
  avisar();
}

// -------------------------------------------------------------- silencio

const CLAVE_SILENCIO = "heroquest.voz-silenciada";

function leerSilencio(): boolean {
  try {
    return localStorage.getItem(CLAVE_SILENCIO) === "1";
  } catch {
    return false;
  }
}

function guardarSilencio(silenciada: boolean): void {
  try {
    localStorage.setItem(CLAVE_SILENCIO, silenciada ? "1" : "0");
  } catch {
    // sin sitio o sin permiso: no se recuerda, y no rompe nada más
  }
}

/** El botón de silencio de la voz, independiente del de los sonidos (T44). */
export function useSilencioDeVoz(): [boolean, () => void] {
  const [silenciada, setSilenciada] = useState(leerSilencio);
  const alternar = () =>
    setSilenciada((s) => {
      const nueva = !s;
      guardarSilencio(nueva);
      if (nueva) detenerLectura(); // silenciar a mitad de frase la corta, no la deja terminar
      return nueva;
    });
  return [silenciada, alternar];
}

// -------------------------------------------------------------- enganche al diario

/**
 * Lee cada línea nueva del diario, por índice, igual que `useSonidos` (T44)
 * cuenta hasta dónde ya ha sonado. `lineas` es el mismo array que pinta
 * `MasterLog`, así que la voz dice exactamente lo que hay en pantalla —el
 * informe o el relato, según lo que se tenga elegido—.
 */
export function useLecturaDeDiario(lineas: readonly { texto: string }[], activa: boolean): void {
  const contadas = useRef<number | null>(null);
  const total = lineas.length;

  useEffect(() => {
    // Primer render de esta partida (o de una recién cargada): no se lee lo
    // que ya había pasado antes de que esta pantalla existiera.
    if (contadas.current === null) {
      contadas.current = total;
      return;
    }
    const desde = contadas.current;
    contadas.current = total;
    if (!activa || total <= desde) return; // total < desde: fue un deshacer
    for (let i = desde; i < total; i++) void leerTexto(lineas[i]!.texto);
  }, [lineas, total, activa]);
}
