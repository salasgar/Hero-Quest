import { useEffect, useRef } from "react";
import { LOGOTIPO, rutaDe } from "../data/imagenes";

/** Lo que dura sola, si nadie la salta. */
const DURACION = 2200;

/**
 * La pantalla que se cruza entre elegir el grupo y empezar la partida.
 *
 * Existe para que el logotipo se vea una vez en grande sin robarle sitio al
 * tablero: durante la partida la pantalla es del juego, y el sitio donde una
 * imagen grande no molesta es el que ya no se está usando.
 *
 * **Se puede saltar con cualquier tecla o con un clic.** Con niños delante dos
 * segundos son largos, y una animación que no se puede cortar se convierte en
 * un peaje a la tercera partida.
 */
export function Transicion({ nombres, alTerminar }: { nombres: string[]; alTerminar: () => void }) {
  /**
   * `alTerminar` en una referencia y no en las dependencias del efecto.
   *
   * Si va en las dependencias, cada render del padre que cambie la función
   * vuelve a montar el temporizador y la pantalla no se acaba nunca. Y si se
   * deja fuera de las dependencias sin más, se queda con la primera versión.
   */
  const terminar = useRef(alTerminar);
  terminar.current = alTerminar;

  /** Que no se llame dos veces: el temporizador y el clic compiten. */
  const gastado = useRef(false);

  useEffect(() => {
    const cerrar = () => {
      if (gastado.current) return;
      gastado.current = true;
      terminar.current();
    };
    const reloj = setTimeout(cerrar, DURACION);
    // En `keydown` y no en `keyup`: quien viene aporreando el teclado desde la
    // pantalla anterior espera que la primera tecla ya valga.
    window.addEventListener("keydown", cerrar);
    return () => {
      clearTimeout(reloj);
      window.removeEventListener("keydown", cerrar);
    };
  }, []);

  const cerrar = () => {
    if (gastado.current) return;
    gastado.current = true;
    terminar.current();
  };

  return (
    <div className="transicion" onClick={cerrar} role="presentation">
      <img className="transicion-logo" src={rutaDe(LOGOTIPO)} alt="HeroQuest" />
      {nombres.length > 0 && (
        <p className="transicion-grupo">
          {nombres.length === 1 ? "Baja a la mazmorra" : "Bajan a la mazmorra"}: {nombres.join(", ")}
        </p>
      )}
      <p className="transicion-pista">pulsa cualquier tecla para seguir</p>
    </div>
  );
}
