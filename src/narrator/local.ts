/**
 * Narrador local: convierte los eventos del motor en frases en español.
 *
 * Es el respaldo que hace que la partida no dependa nunca de la red. En la
 * Fase 5 se le añade la voz y, por encima, la narración improvisada de Claude;
 * pero esta capa se queda debajo para siempre: si se cae la wifi o se acaba el
 * crédito, la partida sigue exactamente igual.
 */

import { EQUIPO } from "../data/equipment";
import { HECHIZOS } from "../data/spells";
import { conArticulo } from "../data/nombres";
import { nombreDeClase } from "../data/heroes";
import { contarCalaveras, contarEscudosBlancos, contarEscudosNegros } from "../engine/dice";
import type { CaraCombate } from "../engine/dice";
import type { EstadoPartida, Evento, IdFigura } from "../engine/types";

const elegir = (opciones: string[], semilla: number): string =>
  opciones[Math.abs(semilla) % opciones.length]!;

/**
 * Nombre legible de una figura.
 *
 * Los héroes van solo con su nombre —se lo pone quien los juega— y los
 * monstruos con especie y nombre de pila: «el orco Górbak», «la gárgola
 * Vórtiga». Los dos goblins de la misma sala dejaron de ser «Goblin» y
 * «Goblin» el 2026-09-06, que es lo que pidió Juan Luis.
 *
 * El artículo va en minúscula y pegado al nombre porque casi todas las frases
 * lo llevan dentro; para las que empiezan por él está `mayus`, y para las que
 * lo llevan tras «a» o «de», `aA` y `deDe`.
 */
export function nombreDe(e: EstadoPartida, id: IdFigura): string {
  const h = e.heroes.find((x) => x.id === id);
  if (h) return h.nombre;
  const m = e.monstruos.find((x) => x.id === id);
  if (m) return `${conArticulo(m.especie)} ${m.nombre}`;
  return id;
}

/**
 * Las tres costuras del artículo.
 *
 * Con el nombre de la figura metido en mitad de las frases, el castellano pide
 * tres cosas que antes no hacían falta: mayúscula al empezar la frase, «al» en
 * vez de «a el» y «del» en vez de «de el». Sin esto el diario dice «Le toca a el
 * orco Górbak», y lo va a leer un niño en voz alta.
 *
 * Los héroes no llevan artículo, así que `aA("Aldric")` da «a Aldric» y todo
 * sigue funcionando igual que antes de T42.
 */
export const mayus = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);
export const aA = (s: string): string => (s.startsWith("el ") ? `al ${s.slice(3)}` : `a ${s}`);
export const deDe = (s: string): string => (s.startsWith("el ") ? `del ${s.slice(3)}` : `de ${s}`);

/**
 * El sujeto del informe: para un héroe, «el enano Háfir» (clase y nombre,
 * como pide el ejemplo de Juan Luis); para un monstruo, lo mismo que
 * `nombreDe` ya daba desde T42 («el orco Górbak»). No sustituye a `nombreDe`
 * —que sigue dando el nombre a secas del héroe— porque como objeto de la
 * frase («ataca a Háfir») repetir la clase no hace falta y queda pesado.
 */
export function sujetoInforme(e: EstadoPartida, id: IdFigura): string {
  const h = e.heroes.find((x) => x.id === id);
  if (!h) return nombreDe(e, id);
  const articulo = h.clase === "hada" ? "el" : h.genero === "f" ? "la" : "el";
  return `${articulo} ${nombreDeClase(h.clase, h.genero).toLowerCase()} ${h.nombre}`;
}

/** «el goblin Snik», «el goblin Snik y el orco Górbak». */
export function lista(e: EstadoPartida, ids: readonly IdFigura[]): string {
  const nombres = ids.map((id) => nombreDe(e, id));
  if (nombres.length <= 1) return nombres[0] ?? "nadie";
  return `${nombres.slice(0, -1).join(", ")} y ${nombres[nombres.length - 1]}`;
}

/**
 * «2 calaveras, 1 escudo negro. »: la tirada de un ataque, en caras, como
 * pide el ejemplo de Juan Luis para el informe. Cadena vacía si no hay caras
 * que contar (la mesa metió solo el resultado a mano).
 */
function describeTirada(ataque: readonly CaraCombate[], defensa: readonly CaraCombate[]): string {
  const partes: string[] = [];
  const calaveras = contarCalaveras(ataque);
  if (calaveras > 0) partes.push(`${calaveras} ${calaveras === 1 ? "calavera" : "calaveras"}`);
  const blancos = contarEscudosBlancos(defensa);
  if (blancos > 0) partes.push(`${blancos} ${blancos === 1 ? "escudo blanco" : "escudos blancos"}`);
  const negros = contarEscudosNegros(defensa);
  if (negros > 0) partes.push(`${negros} ${negros === 1 ? "escudo negro" : "escudos negros"}`);
  return partes.length === 0 ? "" : `${partes.join(", ")}. `;
}

/** Una frase por evento. Devuelve null si el evento no se cuenta. */
export function narrar(e: EstadoPartida, ev: Evento, n = 0): string | null {
  switch (ev.tipo) {
    case "tiradaMovimiento":
      // Cuando la tirada se mete a mano desde la mesa solo se conoce el total,
      // y se guarda como [total, 0]. No inventamos dos dados que nadie ha visto.
      return ev.dados[1] === 0
        ? `${mayus(nombreDe(e, String(ev.actor)))} saca ${ev.total} casillas de movimiento.`
        : `${mayus(nombreDe(e, String(ev.actor)))} saca ${ev.dados[0]} y ${ev.dados[1]}: ${ev.total} casillas.`;

    case "movimiento":
      return ev.ruta.length === 0
        ? null
        : `${mayus(sujetoInforme(e, ev.actor))} avanza ${ev.ruta.length} ${ev.ruta.length === 1 ? "casilla" : "casillas"}.`;

    case "puertaAbierta":
      return "Se abre la puerta.";

    // `ev.texto` es ambientación para el relato (`relato.ts`); el informe no
    // lo copia: solo importa si hay alguien dentro o no, no cómo huele la sala.
    case "salaRevelada": {
      if (ev.monstruos.length === 0) return "Sala vacía.";
      const quienes = ev.monstruos.map((m) => nombreDe(e, m)).join(", ");
      return `En la sala: ${quienes}.`;
    }

    case "ataque": {
      const a = mayus(sujetoInforme(e, ev.atacante));
      const o = nombreDe(e, ev.objetivo);
      const tirada = describeTirada(ev.dadosAtaque, ev.dadosDefensa);
      if (ev.dano === 0) return `${a} ataca ${aA(o)}: ${tirada}Sin daño.`;
      return `${a} ataca ${aA(o)}: ${tirada}${ev.dano} ${ev.dano === 1 ? "punto" : "puntos"} de cuerpo.`;
    }

    case "figuraDerrotada": {
      const esHeroe = e.heroes.some((h) => h.id === ev.figura);
      return esHeroe
        ? `${mayus(nombreDe(e, ev.figura))} cae al suelo y ya no se levanta.`
        : `${mayus(nombreDe(e, ev.figura))} se desploma.`;
    }

    case "trampaDisparada": {
      const quien = nombreDe(e, ev.figura);
      const puntos = `${ev.dano} ${ev.dano === 1 ? "punto" : "puntos"} de cuerpo`;
      if (ev.tipoTrampa === "foso")
        return `${mayus(quien)} cae en el foso: ${puntos}.`;
      if (ev.tipoTrampa === "lanza")
        return ev.dano === 0
          ? `Trampa de lanza: ${quien} la esquiva.`
          : `Trampa de lanza: alcanza ${aA(quien)}, ${puntos}.`;
      return ev.dano === 0
        ? `Trampa de bloque: ${quien} la esquiva. El paso queda bloqueado.`
        : `Trampa de bloque: alcanza ${aA(quien)}, ${puntos}. El paso queda bloqueado.`;
    }

    case "saltoDeTrampa": {
      const quien = mayus(nombreDe(e, ev.figura));
      const que =
        ev.tipoTrampa === "foso" ? "el foso" : ev.tipoTrampa === "lanza" ? "la casilla de la lanza" : "la casilla del bloque";
      return ev.logrado
        ? `${quien} salta ${que} de un brinco.`
        : `${quien} intenta saltar ${que}, pero le sale una calavera y tropieza.`;
    }

    case "trampaDescubierta":
      // En base 1, que es como están rotulados los márgenes del tablero.
      return `Trampa descubierta en la casilla ${ev.celda.x + 1},${ev.celda.y + 1}.`;

    case "trampaDesarmada":
      return "La trampa queda inutilizada.";

    case "puertaSecretaDescubierta":
      return "Se descubre un pasadizo secreto.";

    case "busquedaSinHallazgo":
      return ev.que === "tesoro"
        ? "Registráis la sala de arriba abajo. No hay nada."
        : "Ni trampas ni pasadizos. La sala está limpia.";

    case "tesoroEncontrado":
      return `${mayus(nombreDe(e, ev.actor))} se guarda ${ev.oro} monedas de oro.`;

    case "cartaDeTesoro":
      return `${mayus(nombreDe(e, ev.actor))} registra la sala y encuentra: ${ev.nombre}. ${ev.texto}`;

    case "objetoDeMision":
      return `${mayus(nombreDe(e, ev.actor))} registra la sala y encuentra ${ev.objeto}: el objetivo de la misión.`;

    case "objetoGuardado":
      return `${mayus(nombreDe(e, ev.actor))} se guarda «${ev.nombre}» en la mochila.`;

    case "equipoEncontrado": {
      const quien = mayus(nombreDe(e, ev.actor));
      const pieza = EQUIPO[ev.equipo].nombre.toLowerCase();
      return ev.puesto
        ? `${quien} encuentra ${pieza} y lo equipa.`
        : `${quien} encuentra ${pieza} y lo guarda en la mochila: no es para su clase, o ya lleva uno.`;
    }

    case "pocionUsada":
      return ev.objetivo === ev.actor
        ? `${mayus(nombreDe(e, ev.actor))} se bebe «${ev.nombre}».`
        : `${mayus(nombreDe(e, ev.actor))} le da de beber «${ev.nombre}» ${aA(nombreDe(e, ev.objetivo))}.`;

    case "objetoDado":
      return `${mayus(nombreDe(e, ev.de))} le da «${ev.nombre}» ${aA(nombreDe(e, ev.a))}${ev.puesto ? ", que lo equipa" : ""}.`;

    case "monstruoErrante":
      return `Aparece un monstruo errante: ${nombreDe(e, ev.monstruo)}.`;

    case "hechizoLanzado": {
      const h = HECHIZOS[ev.hechizo];
      const contra = ev.objetivo ? ` contra ${nombreDe(e, ev.objetivo)}` : "";
      return `${mayus(nombreDe(e, ev.actor))} lanza ${h.nombre}${contra}.`;
    }

    case "danoDeHechizo": {
      const h = HECHIZOS[ev.hechizo];
      const o = nombreDe(e, ev.objetivo);
      return ev.dano === 0
        ? `${h.nombre} estalla contra ${o} y no le hace ni un rasguño.`
        : `${h.nombre} alcanza ${aA(o)}: ${ev.dano} ${ev.dano === 1 ? "punto" : "puntos"} de cuerpo.`;
    }

    case "movimientoExtra":
      return `${mayus(nombreDe(e, ev.figura))} recibe ${ev.casillas} casillas de movimiento extra.`;

    case "curacion":
      return `${mayus(nombreDe(e, ev.figura))} recupera ${ev.puntos} ${ev.puntos === 1 ? "punto" : "puntos"} de cuerpo.`;

    case "efectoDeHechizo": {
      // Las frases son para la mesa: se entienden sin saber qué es un
      // `bonusDefensa`. El nombre de la clase no sale nunca al diario.
      const quienes = lista(e, ev.objetivos);
      const varios = ev.objetivos.length > 1;
      switch (ev.clase) {
        case "dormir":
          return `${mayus(quienes)} ${varios ? "caen dormidos" : "cabecea y se queda dormido"}.`;
        case "perderTurno":
          return `Un torbellino envuelve ${aA(quienes)}: ${varios ? "pierden" : "pierde"} su siguiente turno.`;
        case "bonusAtaque":
          return `${mayus(quienes)} ${varios ? "golpearán" : "golpeará"} más fuerte en su próximo ataque.`;
        case "bonusDefensa":
          return `La piel ${deDe(quienes)} se vuelve de piedra: ${varios ? "aguantan" : "aguanta"} mejor el próximo golpe.`;
        case "atravesarMuros":
          return `${mayus(quienes)} ${varios ? "podrán" : "podrá"} cruzar la roca en su próximo movimiento.`;
        case "atravesarFiguras":
          return `${mayus(quienes)} se ${varios ? "difuminan" : "difumina"}: en su próximo movimiento ${varios ? "pasan" : "pasa"} entre los monstruos sin que lo vean.`;
        case "movimientoExtra":
          return `El viento se pone detrás ${deDe(quienes)}: ${varios ? "tirarán" : "tirará"} cuatro dados de movimiento.`;
      }
    }

    case "hechizoSinEfecto": {
      const h = HECHIZOS[ev.hechizo];
      const quien = nombreDe(e, ev.objetivo);
      switch (ev.motivo) {
        case "noMuerto":
          return `Los no muertos no duermen: ${h.nombre} se pierde sobre ${quien}.`;
        case "menteSuperior":
          return `${mayus(quien)} resiste: su mente es más fuerte que la de quien lanza el hechizo.`;
        case "yaEstabaSano":
          return `${mayus(quien)} no tiene ni un rasguño: ${h.nombre} se gasta sin curar nada.`;
        case "sinObjetivo":
          return `${h.nombre} no encuentra a nadie a quien afectar.`;
      }
    }

    // Los poderes de monstruo (T50): el informe da la tirada y el resultado,
    // que es lo que hace falta para seguir la partida y para que en la mesa
    // se vea que el dado es el que manda.
    case "maleficio": {
      const quien = mayus(sujetoInforme(e, ev.actor));
      const o = nombreDe(e, ev.objetivo);
      return ev.dano === 0
        ? `${quien} lanza un maleficio sobre ${o}: saca ${ev.dado} contra mente ${ev.mente}, lo resiste.`
        : `${quien} lanza un maleficio sobre ${o}: saca ${ev.dado} contra mente ${ev.mente}, ${ev.dano} ${ev.dano === 1 ? "punto" : "puntos"} de cuerpo.`;
    }

    case "enredado":
      return `La telaraña ${deDe(nombreDe(e, ev.por))} envuelve ${aA(nombreDe(e, ev.figura))}: no se mueve hasta soltarse.`;

    case "tiraParaSoltarse":
      return ev.logrado
        ? `${mayus(nombreDe(e, ev.figura))} rompe la telaraña.`
        : `${mayus(nombreDe(e, ev.figura))} forcejea con la telaraña y sigue enredado: este turno no se mueve.`;

    case "emboscada":
      return `¡La arena se mueve! ${mayus(nombreDe(e, ev.monstruo))} emerge junto ${aA(nombreDe(e, ev.sobre))}.`;

    case "monstruoActiva":
      // En la mesa, saber cuál de los seis se está moviendo es la mitad de la
      // información. El motivo por el que le toca a ése lo enseña la pantalla
      // (T17): aquí no se repite, que el diario se lee entero.
      return `Le toca ${aA(nombreDe(e, ev.monstruo))}.`;

    case "dormidoDespierta":
      return elegir(
        [
          `${mayus(nombreDe(e, ev.actor))} abre los ojos: el Sueño se ha roto.`,
          `${mayus(nombreDe(e, ev.actor))} se despierta de golpe.`,
        ],
        n,
      );

    case "monstruoSinActuar":
      return elegir(
        [
          `${mayus(nombreDe(e, ev.monstruo))} no se mueve ni ataca.`,
          `${mayus(nombreDe(e, ev.monstruo))} se queda donde está, vigilando.`,
        ],
        n,
      );

    case "zargonSinMonstruos":
      return ev.motivo === "ningunoDescubierto"
        ? "Zargon espera: todavía no habéis encontrado a nadie."
        : "Zargon no tiene ya a quién mover.";

    case "cambioDeTurno":
      return ev.actor === "zargon" ? "— Turno de Zargon —" : `— Turno ${deDe(nombreDe(e, String(ev.actor)))} —`;

    case "finDePartida":
      return ev.victoria ? `¡Victoria! ${ev.motivo}` : `Derrota. ${ev.motivo}`;
  }
}

/** Narra una tanda de eventos, descartando los que no se cuentan. */
export const narrarTodos = (e: EstadoPartida, eventos: readonly Evento[], desde = 0): string[] =>
  eventos.map((ev, i) => narrar(e, ev, desde + i)).filter((x): x is string => x !== null);
