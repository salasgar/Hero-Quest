import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { crearPartida, type HeroeElegido, type OpcionesPartida } from "../engine/partida";
import { aplicarAccion, repetir } from "../engine/reducer";
import type { Accion, EstadoPartida, Evento } from "../engine/types";
import { SesionDeRed } from "../red/cliente";
import {
  construir,
  guardarEnCurso,
  type AccionRechazada,
  type PartidaGuardada,
} from "./registroDePartida";

/**
 * Con qué partida guardada continuar (T69), si con alguna: la pone `App.tsx`
 * alrededor de `Juego` cuando se entra por «Continuar» en vez de por «Empezar
 * la partida», y la lee este mismo fichero. Es un contexto y no un parámetro
 * de `usePartida` porque quien decide `fuente` -los héroes, la misión y la
 * semilla nueva de `Date.now()` para una partida sin continuar- es
 * `Juego.tsx`, que no está en los ficheros que declara esta ficha (y hoy
 * además lo tiene reclamado T70): el contexto cruza esa frontera sin tocar
 * ese fichero. Con una `SesionDeRed` no se mira nunca: continuar una partida
 * en red no es esta tarea.
 */
export const ContinuarContext = createContext<PartidaGuardada | null>(null);

/**
 * El estado de la partida en la interfaz.
 *
 * Guarda dos cosas: el estado actual y la lista de acciones desde el principio.
 * Deshacer es rehacer la partida con una acción menos; como el generador
 * aleatorio vive dentro del estado, sale exactamente igual. Con niños en la
 * mesa esto no es un lujo: se equivocan de casilla cada dos turnos.
 *
 * Con una `SesionDeRed`, la lista vive en el relevo en vez de aquí, y es lo
 * único que cambia: el estado se sigue rehaciendo con `repetir`. El modo local
 * es el camino de siempre, intacto a propósito: la partida de sobremesa es el
 * caso normal de este proyecto, y una wifi caída no puede dejar sin jugar en el
 * salón. Qué modo es no cambia en la vida del componente: se elige al empezar
 * la partida.
 *
 * Al continuar una partida guardada (T69, `ContinuarContext` arriba), la
 * semilla que de verdad cuenta es la suya y no la que trae `fuente`: con otra,
 * el mazo de tesoro y el resto de sorteos saldrían distintos y su lista de
 * acciones ya no encajaría. El estado inicial se rehace con `repetir` sobre
 * esa semilla y esa lista, que además queda como punto de partida de
 * `acciones` y `rechazadas` para que sigan creciendo desde ahí.
 */
export function usePartida(fuente: OpcionesPartida | SesionDeRed) {
  const sesion = fuente instanceof SesionDeRed ? fuente : null;
  const continuar = useContext(ContinuarContext);
  const [inicial] = useState<EstadoPartida>(() => {
    if (sesion) return sesion.inicial;
    const opciones = fuente as OpcionesPartida;
    return crearPartida(continuar ? { ...opciones, semilla: continuar.semilla } : opciones);
  });
  const [estado, setEstado] = useState<EstadoPartida>(() =>
    sesion ? sesion.estado : continuar ? repetir(inicial, continuar.acciones) : inicial,
  );
  const [acciones, setAcciones] = useState<Accion[]>(() => (continuar ? [...continuar.acciones] : []));
  const [error, setError] = useState<string | null>(null);
  /**
   * Lo que el motor rechazó, para el registro descargable (T57).
   *
   * Es la mitad del fichero que no se puede deducir repitiendo la partida: una
   * acción rechazada no cambia el estado y no deja ningún rastro, así que
   * «pulsé y no pasó nada» —el fallo que Juan Luis más se encuentra en la
   * tableta— se pierde entero en cuanto el aviso desaparece de la pantalla.
   */
  const [rechazadas, setRechazadas] = useState<AccionRechazada[]>(() =>
    continuar ? [...continuar.rechazadas] : [],
  );

  /**
   * Con qué se montó esta partida, leído **una sola vez**.
   *
   * `Juego.tsx` construye las opciones en cada render y la semilla sale de
   * `Date.now() % 100000`: la de este render no es la de la partida que se está
   * jugando. La que vale es la del primero, que es la que recibió
   * `crearPartida`, y sin ella el fichero descargado no se puede repetir.
   *
   * `crearPartida` toma 1 cuando no le dan semilla, así que aquí se anota lo
   * mismo y no «ninguna»: se guarda lo que de verdad se usó. Al continuar
   * (T69), lo que de verdad se usó es la semilla guardada, no la que traía
   * `fuente` -por eso `inicial`, arriba, hace la misma sustitución-.
   */
  const [montaje] = useState<{ mision: string; semilla: number; heroes: HeroeElegido[] }>(() =>
    sesion
      ? { mision: sesion.montaje.mision, semilla: sesion.montaje.semilla, heroes: sesion.montaje.heroes }
      : {
          mision: (fuente as OpcionesPartida).mision.id,
          semilla: continuar ? continuar.semilla : (fuente as OpcionesPartida).semilla ?? 1,
          heroes: (fuente as OpcionesPartida).heroes,
        },
  );

  // En red, la sesión es la fuente de verdad: cada vez que su registro cambie
  // —una acción ajena que llegó por el sondeo, un deshacer de la mesa— la
  // pantalla se pone a lo que diga. El sondeo arranca y para con el componente.
  useEffect(() => {
    if (!sesion) return;
    const soltar = sesion.suscribir(() => setEstado(sesion.estado));
    sesion.arrancar();
    return () => {
      soltar();
      sesion.parar();
    };
  }, [sesion]);

  const ejecutar = useCallback(
    (a: Accion): Evento[] | null => {
      // Cuántas acciones aceptadas van: es lo que sitúa una rechazada en su
      // sitio al repetir la partida, porque ella no entra en la lista.
      const aceptadas = sesion ? sesion.acciones.length : acciones.length;
      const r = aplicarAccion(estado, a);
      if (!r.ok) {
        setError(r.motivo);
        setRechazadas((previas) => [...previas, { tras: aceptadas, accion: a, motivo: r.motivo }]);
        return null;
      }
      setEstado(r.estado);
      if (sesion) {
        // Optimista: se pinta en cuanto se pulsa —con niños, una pantalla que
        // tarda un segundo se pulsa tres veces— y si el relevo la rechaza se
        // vuelve al estado del registro, que es el que vale.
        void sesion.enviar(a).then((res) => {
          if (!res.ok) {
            setEstado(sesion.estado);
            setError(res.motivo);
            // También cuenta como rechazada, y es la que más falta hace: el
            // motor la aceptó y aun así la jugada se deshizo sola en pantalla.
            setRechazadas((previas) => [
              ...previas,
              { tras: sesion.acciones.length, accion: a, motivo: res.motivo },
            ]);
          }
        });
      } else {
        setAcciones((previas) => [...previas, a]);
      }
      setError(null);
      return r.eventos;
    },
    [estado, sesion, acciones],
  );

  const deshacer = useCallback(() => {
    if (sesion) {
      // Solo la mesa tiene el secreto; a las demás pantallas `puedeDeshacer`
      // ya les quita el botón, y esto es la segunda red por si acaso.
      void sesion.truncar().then((res) => {
        if (!res.ok) setError(res.motivo);
      });
      return;
    }
    if (acciones.length === 0) return;
    const menos = acciones.slice(0, -1);
    setAcciones(menos);
    setEstado(repetir(inicial, menos));
    setError(null);
  }, [sesion, acciones, inicial]);


  /**
   * El registro descargable de esta partida, a día de hoy.
   *
   * Se monta al vuelo y no se guarda en un estado: es un derivado del estado y
   * de las dos listas, y tenerlo duplicado sería un tercer sitio que puede
   * quedarse atrás.
   */
  const partidaGuardada = useCallback(
    (): PartidaGuardada =>
      construir({
        estado,
        mision: montaje.mision,
        semilla: montaje.semilla,
        heroes: montaje.heroes,
        acciones: sesion ? sesion.acciones : acciones,
        rechazadas,
      }),
    [estado, montaje, sesion, acciones, rechazadas],
  );

  /**
   * Deja el registro en el navegador en cada cambio.
   *
   * Es lo que permite que el botón «Descargar partida» viva en `App.tsx`, que
   * es donde está la barra, sin que la partida tenga que subir hasta allí; y de
   * paso una pestaña cerrada sin querer no se lleva el registro. **Solo
   * escribe**: cargar una partida guardada es otra cosa —la Fase 8 de
   * `TRASPASO.md`— y hacerlo a medias aquí dejaría un «continuar» que unas
   * veces funciona y otras no.
   */
  useEffect(() => {
    guardarEnCurso(partidaGuardada());
  }, [partidaGuardada]);

  return {
    estado,
    ejecutar,
    deshacer,
    error,
    limpiarError: () => setError(null),
    partidaGuardada,
    puedeDeshacer: sesion ? sesion.esLaMesa && sesion.acciones.length > 0 : acciones.length > 0,
    numeroDeAcciones: sesion ? sesion.acciones.length : acciones.length,
    /**
     * Si el turno es de una figura que lleva quien mira esta pantalla. En local
     * siempre: todo el mundo está sentado al tablero. En red lo decide el
     * `reparto` del montaje, y la pantalla que reciba `false` no ofrece
     * acciones (T32 y T33 cuelgan de esta señal).
     */
    puedeActuar: sesion ? sesion.puedeActuar() : true,
  };
}
