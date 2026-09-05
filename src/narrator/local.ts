/**
 * Narrador local: convierte los eventos del motor en frases en español.
 *
 * Es el respaldo que hace que la partida no dependa nunca de la red. En la
 * Fase 5 se le añade la voz y, por encima, la narración improvisada de Claude;
 * pero esta capa se queda debajo para siempre: si se cae la wifi o se acaba el
 * crédito, la partida sigue exactamente igual.
 */

import { HECHIZOS } from "../data/spells";
import { MONSTRUOS } from "../data/monsters";
import type { EstadoPartida, Evento, IdFigura } from "../engine/types";

const elegir = (opciones: string[], semilla: number): string =>
  opciones[Math.abs(semilla) % opciones.length]!;

/** Nombre legible de una figura. */
export function nombreDe(e: EstadoPartida, id: IdFigura): string {
  const h = e.heroes.find((x) => x.id === id);
  if (h) return h.nombre;
  const m = e.monstruos.find((x) => x.id === id);
  if (m) return MONSTRUOS[m.especie].nombre;
  return id;
}

const golpes = [
  "le abre la guardia",
  "le acierta de lleno",
  "le cruza el costado",
  "le rompe la defensa",
];
const fallos = [
  "pero el golpe se pierde en el aire",
  "y no consigue pasar",
  "pero el otro lo para a tiempo",
  "y el acero resbala sin herir",
];

/** Una frase por evento. Devuelve null si el evento no se cuenta. */
export function narrar(e: EstadoPartida, ev: Evento, n = 0): string | null {
  switch (ev.tipo) {
    case "tiradaMovimiento":
      // Cuando la tirada se mete a mano desde la mesa solo se conoce el total,
      // y se guarda como [total, 0]. No inventamos dos dados que nadie ha visto.
      return ev.dados[1] === 0
        ? `${nombreDe(e, String(ev.actor))} saca ${ev.total} casillas de movimiento.`
        : `${nombreDe(e, String(ev.actor))} saca ${ev.dados[0]} y ${ev.dados[1]}: ${ev.total} casillas.`;

    case "movimiento":
      return ev.ruta.length === 0
        ? null
        : `${nombreDe(e, ev.actor)} avanza ${ev.ruta.length} ${ev.ruta.length === 1 ? "casilla" : "casillas"}.`;

    case "puertaAbierta":
      return "La puerta cede con un chirrido.";

    case "salaRevelada": {
      const base = ev.texto ?? "La sala se abre ante vosotros.";
      if (ev.monstruos.length === 0) return `${base} No hay nadie.`;
      const quienes = ev.monstruos.map((m) => nombreDe(e, m)).join(", ");
      return `${base} Os están esperando: ${quienes}.`;
    }

    case "ataque": {
      const a = nombreDe(e, ev.atacante);
      const o = nombreDe(e, ev.objetivo);
      if (ev.dano === 0) return `${a} ataca a ${o} ${elegir(fallos, n + ev.calaveras)}.`;
      return `${a} ${elegir(golpes, n + ev.calaveras)} a ${o}: ${ev.dano} ${ev.dano === 1 ? "punto" : "puntos"} de cuerpo.`;
    }

    case "figuraDerrotada": {
      const esHeroe = e.heroes.some((h) => h.id === ev.figura);
      return esHeroe
        ? `${nombreDe(e, ev.figura)} cae al suelo y ya no se levanta.`
        : `${nombreDe(e, ev.figura)} se desploma.`;
    }

    case "trampaDisparada": {
      const quien = nombreDe(e, ev.figura);
      if (ev.tipoTrampa === "foso") return `¡El suelo se hunde! ${quien} cae al foso y se hace daño.`;
      if (ev.tipoTrampa === "lanza") return `¡Una lanza sale disparada de la pared y alcanza a ${quien}!`;
      return `¡Un bloque de piedra se desprende del techo sobre ${quien} y bloquea el paso!`;
    }

    case "trampaDescubierta":
      // En base 1, que es como están rotulados los márgenes del tablero.
      return `Con cuidado, aparece una trampa en la casilla ${ev.celda.x + 1},${ev.celda.y + 1}.`;

    case "trampaDesarmada":
      return "La trampa queda inutilizada.";

    case "puertaSecretaDescubierta":
      return "Al empujar la pared, se abre un pasadizo que nadie esperaba.";

    case "busquedaSinHallazgo":
      return ev.que === "tesoro"
        ? "Registráis la sala de arriba abajo. No hay nada."
        : "Ni trampas ni pasadizos. La sala está limpia.";

    case "tesoroEncontrado":
      return `${nombreDe(e, ev.actor)} se guarda ${ev.oro} monedas de oro.`;

    case "cartaDeTesoro":
      return `${nombreDe(e, ev.actor)} registra la sala y encuentra: ${ev.nombre}. ${ev.texto}`;

    case "monstruoErrante":
      return `¡No estabais solos! ${nombreDe(e, ev.monstruo)} aparece a vuestro lado.`;

    case "hechizoLanzado": {
      const h = HECHIZOS[ev.hechizo];
      const contra = ev.objetivo ? ` contra ${nombreDe(e, ev.objetivo)}` : "";
      return `${nombreDe(e, ev.actor)} lanza ${h.nombre}${contra}.`;
    }

    case "danoDeHechizo": {
      const h = HECHIZOS[ev.hechizo];
      const o = nombreDe(e, ev.objetivo);
      return ev.dano === 0
        ? `${h.nombre} estalla contra ${o} y no le hace ni un rasguño.`
        : `${h.nombre} alcanza a ${o}: ${ev.dano} ${ev.dano === 1 ? "punto" : "puntos"} de cuerpo.`;
    }

    case "movimientoExtra":
      return `Un viento repentino empuja a ${nombreDe(e, ev.figura)}: ${ev.casillas} casillas más.`;

    case "curacion":
      return `${nombreDe(e, ev.figura)} recupera ${ev.puntos} ${ev.puntos === 1 ? "punto" : "puntos"} de cuerpo.`;

    case "monstruoActiva":
      // En la mesa, saber cuál de los seis se está moviendo es la mitad de la
      // información. El motivo por el que le toca a ése lo enseña la pantalla
      // (T17): aquí no se repite, que el diario se lee entero.
      return `Le toca a ${nombreDe(e, ev.monstruo)}.`;

    case "monstruoSinActuar":
      return elegir(
        [
          `${nombreDe(e, ev.monstruo)} no se mueve ni ataca.`,
          `${nombreDe(e, ev.monstruo)} se queda donde está, vigilando.`,
        ],
        n,
      );

    case "zargonSinMonstruos":
      return ev.motivo === "ningunoDescubierto"
        ? "Zargon espera: todavía no habéis encontrado a nadie."
        : "Zargon no tiene ya a quién mover.";

    case "cambioDeTurno":
      return ev.actor === "zargon" ? "— Turno de Zargon —" : `— Turno de ${nombreDe(e, String(ev.actor))} —`;

    case "finDePartida":
      return ev.victoria ? `¡Victoria! ${ev.motivo}` : `Derrota. ${ev.motivo}`;
  }
}

/** Narra una tanda de eventos, descartando los que no se cuentan. */
export const narrarTodos = (e: EstadoPartida, eventos: readonly Evento[], desde = 0): string[] =>
  eventos.map((ev, i) => narrar(e, ev, desde + i)).filter((x): x is string => x !== null);
