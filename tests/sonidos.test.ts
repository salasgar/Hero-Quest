import { describe, expect, it } from "vitest";
import { sonidoDe, type Sonido } from "../src/ui/sonidos";
import type { Evento } from "../src/engine/types";
import { c } from "./ayuda";

const SONIDOS: readonly Sonido[] = [
  "puerta",
  "dado",
  "golpe",
  "fallo",
  "caida",
  "sala",
  "hechizo",
  "tesoro",
  "pocion",
  "sorpresa",
  "victoria",
  "derrota",
];

/** Un evento de cada tipo, con datos mínimos que no rompan `sonidoDe`. */
const UNO_DE_CADA: readonly Evento[] = [
  { tipo: "tiradaMovimiento", actor: "barbaro", dados: [3, 5], total: 8 },
  { tipo: "movimiento", actor: "barbaro", desde: c(1, 1), hasta: c(1, 2), ruta: [c(1, 2)] },
  { tipo: "puertaAbierta", puerta: "p" },
  { tipo: "salaRevelada", sala: "a", texto: null, monstruos: [] },
  { tipo: "ataque", atacante: "barbaro", objetivo: "orco1", dadosAtaque: [], calaveras: 2, dadosDefensa: [], escudos: 0, dano: 2 },
  { tipo: "ataque", atacante: "barbaro", objetivo: "orco1", dadosAtaque: [], calaveras: 0, dadosDefensa: [], escudos: 3, dano: 0 },
  { tipo: "figuraDerrotada", figura: "orco1" },
  { tipo: "trampaDisparada", trampa: "t", tipoTrampa: "lanza", figura: "barbaro", dano: 2 },
  { tipo: "trampaDisparada", trampa: "t", tipoTrampa: "lanza", figura: "barbaro", dano: 0 },
  { tipo: "saltoDeTrampa", trampa: "t", tipoTrampa: "foso", figura: "barbaro", dado: "escudoBlanco", logrado: true },
  { tipo: "trampaDescubierta", trampa: "t", tipoTrampa: "foso", celda: c(2, 2) },
  { tipo: "trampaDesarmada", trampa: "t" },
  { tipo: "puertaSecretaDescubierta", puerta: "p" },
  { tipo: "busquedaSinHallazgo", actor: "barbaro", que: "tesoro" },
  { tipo: "tesoroEncontrado", actor: "barbaro", oro: 100 },
  { tipo: "objetoDeMision", actor: "barbaro", objeto: "el pergamino" },
  { tipo: "objetoGuardado", actor: "barbaro", carta: "pocionCura", nombre: "Poción curativa" },
  { tipo: "equipoEncontrado", actor: "barbaro", equipo: "yelmo", puesto: true },
  { tipo: "pocionUsada", actor: "barbaro", objetivo: "barbaro", carta: "pocionCura", nombre: "Poción curativa" },
  { tipo: "objetoDado", de: "barbaro", a: "barbaro", carta: "pocionCura", nombre: "Poción curativa", puesto: false },
  { tipo: "cartaDeTesoro", actor: "barbaro", carta: "c1", nombre: "Anillo", texto: "…" },
  { tipo: "monstruoErrante", monstruo: "orco1", celda: c(3, 3) },
  { tipo: "hechizoLanzado", actor: "mago", hechizo: "bolaDeFuego", objetivo: "orco1" },
  { tipo: "curacion", figura: "barbaro", puntos: 2 },
  { tipo: "danoDeHechizo", hechizo: "bolaDeFuego", objetivo: "orco1", dados: [], dano: 3 },
  { tipo: "movimientoExtra", figura: "barbaro", casillas: 4 },
  { tipo: "efectoDeHechizo", hechizo: "sueno", clase: "dormir", objetivos: ["orco1"] },
  { tipo: "hechizoSinEfecto", hechizo: "sueno", objetivo: "orco1", motivo: "noMuerto" },
  { tipo: "monstruoActiva", monstruo: "orco1" },
  { tipo: "monstruoSinActuar", monstruo: "orco1" },
  { tipo: "zargonSinMonstruos", motivo: "ningunoDescubierto" },
  { tipo: "cambioDeTurno", actor: "barbaro" },
  { tipo: "finDePartida", victoria: true, motivo: "Objetivo cumplido" },
  { tipo: "finDePartida", victoria: false, motivo: "Todos han caído" },
];

describe("sonidoDe", () => {
  it("decide algo —sonido o silencio a propósito— para cada tipo de evento", () => {
    for (const ev of UNO_DE_CADA) {
      const sonido = sonidoDe(ev);
      expect(sonido === null || SONIDOS.includes(sonido)).toBe(true);
    }
  });

  it("un golpe que hiere no suena igual que uno que falla", () => {
    expect(sonidoDe({ tipo: "ataque", atacante: "barbaro", objetivo: "orco1", dadosAtaque: [], calaveras: 2, dadosDefensa: [], escudos: 0, dano: 2 })).toBe("golpe");
    expect(sonidoDe({ tipo: "ataque", atacante: "barbaro", objetivo: "orco1", dadosAtaque: [], calaveras: 0, dadosDefensa: [], escudos: 3, dano: 0 })).toBe("fallo");
  });

  it("la victoria y la derrota tienen cada una su sonido", () => {
    expect(sonidoDe({ tipo: "finDePartida", victoria: true, motivo: "" })).toBe("victoria");
    expect(sonidoDe({ tipo: "finDePartida", victoria: false, motivo: "" })).toBe("derrota");
  });

  it("los dados suenan al tirar, no al andar la miniatura", () => {
    expect(sonidoDe({ tipo: "tiradaMovimiento", actor: "barbaro", dados: [3, 5], total: 8 })).toBe("dado");
    expect(sonidoDe({ tipo: "movimiento", actor: "barbaro", desde: c(1, 1), hasta: c(1, 2), ruta: [c(1, 2)] })).toBeNull();
  });

  it("una puerta secreta suena como cualquier otra puerta", () => {
    expect(sonidoDe({ tipo: "puertaAbierta", puerta: "p" })).toBe("puerta");
    expect(sonidoDe({ tipo: "puertaSecretaDescubierta", puerta: "p" })).toBe("puerta");
  });
});
