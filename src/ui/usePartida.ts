import { useCallback, useState } from "react";
import { crearPartida, type OpcionesPartida } from "../engine/partida";
import { aplicarAccion, repetir } from "../engine/reducer";
import type { Accion, EstadoPartida, Evento } from "../engine/types";

/**
 * El estado de la partida en la interfaz.
 *
 * Guarda dos cosas: el estado actual y la lista de acciones desde el principio.
 * Deshacer es rehacer la partida con una acción menos; como el generador
 * aleatorio vive dentro del estado, sale exactamente igual. Con niños en la
 * mesa esto no es un lujo: se equivocan de casilla cada dos turnos.
 */
export function usePartida(opciones: OpcionesPartida) {
  const [inicial] = useState<EstadoPartida>(() => crearPartida(opciones));
  const [estado, setEstado] = useState<EstadoPartida>(inicial);
  const [acciones, setAcciones] = useState<Accion[]>([]);
  const [error, setError] = useState<string | null>(null);

  const ejecutar = useCallback(
    (a: Accion): Evento[] | null => {
      const r = aplicarAccion(estado, a);
      if (!r.ok) {
        setError(r.motivo);
        return null;
      }
      setEstado(r.estado);
      setAcciones((previas) => [...previas, a]);
      setError(null);
      return r.eventos;
    },
    [estado],
  );

  const deshacer = useCallback(() => {
    if (acciones.length === 0) return;
    const menos = acciones.slice(0, -1);
    setAcciones(menos);
    setEstado(repetir(inicial, menos));
    setError(null);
  }, [acciones, inicial]);

  const reiniciar = useCallback(() => {
    setAcciones([]);
    setEstado(inicial);
    setError(null);
  }, [inicial]);

  return {
    estado,
    ejecutar,
    deshacer,
    reiniciar,
    error,
    limpiarError: () => setError(null),
    puedeDeshacer: acciones.length > 0,
    numeroDeAcciones: acciones.length,
  };
}
