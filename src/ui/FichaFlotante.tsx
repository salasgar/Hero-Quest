import { dadosDeAtaque, dadosDeDefensa } from "../engine/combat";
import { EQUIPO } from "../data/equipment";
import { nombreDeClase } from "../data/heroes";
import { MONSTRUOS } from "../data/monsters";
import { esHeroe, type EfectoActivo, type EstadoPartida, type Figura } from "../engine/types";

/** Una carga temporal, en la frase que se lee en la mesa. Ver `EfectoActivo` (`types.ts`). */
function textoDeEfecto(e: EfectoActivo): string {
  switch (e.clase) {
    case "bonusAtaque":
      return `+${e.dados} dados en el próximo ataque`;
    case "bonusDefensa":
      return `+${e.dados} dados de defensa hasta el próximo golpe`;
    case "movimientoExtra":
      return `+${e.dados} dados de movimiento en su próxima tirada`;
    case "atravesarMuros":
      return "atraviesa muros en su próximo movimiento";
    case "atravesarFiguras":
      return "atraviesa figuras en su próximo movimiento";
    default:
      return e.clase;
  }
}

/**
 * Las líneas del cuadro flotante, sin React: así se prueban solas. Los
 * números de ataque y defensa salen de `combat.ts` con el estado, para no
 * prometer un dado que el motor no vaya a tirar (el foso, los bonus).
 */
export function fichaDe(figura: Figura, estado: EstadoPartida): string[] {
  const lineas: string[] = [];

  if (esHeroe(figura)) {
    lineas.push(figura.nombre);
    lineas.push(nombreDeClase(figura.clase, figura.genero));
    lineas.push(`${figura.cuerpo} de ${figura.cuerpoMax} cuerpo`);
    lineas.push(`${figura.mente} de ${figura.menteMax} mente`);
    lineas.push(`⚔ ${dadosDeAtaque(figura, "cuerpo", estado)}   🛡 ${dadosDeDefensa(figura, estado)}`);
    if (figura.equipo.length > 0) {
      lineas.push([...new Set(figura.equipo)].map((id) => EQUIPO[id].nombre).join(", "));
    }
    if (figura.hechizos.length > 0) {
      lineas.push(`✨ ${figura.hechizos.length} hechizo${figura.hechizos.length === 1 ? "" : "s"}`);
    }
  } else {
    const plantilla = MONSTRUOS[figura.especie];
    lineas.push(`${figura.nombre}, ${plantilla.nombre.toLowerCase()}`);
    lineas.push(plantilla.nombre);
    lineas.push(`${figura.cuerpo} de ${figura.cuerpoMax} cuerpo`);
    lineas.push(`${plantilla.mente} mente`);
    lineas.push(`⚔ ${dadosDeAtaque(figura, "cuerpo", estado)}   🛡 ${dadosDeDefensa(figura, estado)}`);
    lineas.push(`movimiento ${plantilla.movimiento}`);
    if (figura.dormido) lineas.push("dormido");
    if (figura.pierdeTurno) lineas.push("pierde el turno");
  }

  for (const efecto of figura.efectos) lineas.push(textoDeEfecto(efecto));

  return lineas;
}

export interface PropsFichaFlotante {
  figura: Figura;
  estado: EstadoPartida;
  /** Centro de la figura, en las mismas coordenadas de píxel que el `<svg>` del tablero. */
  x: number;
  y: number;
  /** La figura está en la mitad derecha del tablero: el cuadro se abre hacia la izquierda. */
  haciaLaIzquierda: boolean;
}

/**
 * El cuadro en sí, fuera del `<svg>` para poder escribir texto con saltos de
 * línea y un fondo legible. Vive en `.juego-tablero` (`position: relative`
 * puesto en `Juego.tsx` y `VistaDeHeroe.tsx`), así que estas coordenadas son
 * relativas a esa esquina, no a la ventana.
 */
export function FichaFlotante({ figura, estado, x, y, haciaLaIzquierda }: PropsFichaFlotante) {
  const lineas = fichaDe(figura, estado);
  return (
    <div
      className="ficha-flotante"
      style={{
        left: x,
        top: y,
        transform: haciaLaIzquierda ? "translate(-100%, -50%)" : "translate(0, -50%)",
      }}
    >
      <strong>{lineas[0]}</strong>
      {lineas.slice(1).map((linea, i) => (
        <div key={i}>{linea}</div>
      ))}
    </div>
  );
}
