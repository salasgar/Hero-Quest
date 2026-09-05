import { useCallback, useEffect, useState } from "react";
import { crearPartida, type OpcionesPartida } from "../engine/partida";
import { aplicarAccion, repetir } from "../engine/reducer";
import type { Accion, EstadoPartida, Evento } from "../engine/types";
import { SesionDeRed } from "../red/cliente";

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
 */
export function usePartida(fuente: OpcionesPartida | SesionDeRed) {
  const sesion = fuente instanceof SesionDeRed ? fuente : null;
  const [inicial] = useState<EstadoPartida>(() =>
    sesion ? sesion.inicial : crearPartida(fuente as OpcionesPartida),
  );
  const [estado, setEstado] = useState<EstadoPartida>(() => (sesion ? sesion.estado : inicial));
  const [acciones, setAcciones] = useState<Accion[]>([]);
  const [error, setError] = useState<string | null>(null);

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
      const r = aplicarAccion(estado, a);
      if (!r.ok) {
        setError(r.motivo);
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
          }
        });
      } else {
        setAcciones((previas) => [...previas, a]);
      }
      setError(null);
      return r.eventos;
    },
    [estado, sesion],
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

  const reiniciar = useCallback(() => {
    // En red no hay «jugar otra vez»: el protocolo no tiene esa operación, y
    // empezar de cero es crear otra partida con otro código. Esa pantalla es
    // de T32; aquí no se hace nada en vez de hacer algo a medias.
    if (sesion) return;
    setAcciones([]);
    setEstado(inicial);
    setError(null);
  }, [sesion, inicial]);

  return {
    estado,
    ejecutar,
    deshacer,
    reiniciar,
    error,
    limpiarError: () => setError(null),
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
