import { equivalenciaDeDados, type CaraCombate } from "../engine/dice";
import { CaraDeDado, NOMBRE_DE_CARA } from "./DiceInput";

/**
 * La hoja de instrucciones de la mesa.
 *
 * No repite el reglamento entero: resuelve el problema concreto de esta casa,
 * que es jugar sin los dados de combate de la caja. Los niños tiran dados
 * corrientes y tienen que saber, sin preguntar, qué número vale por calavera y
 * cuál por escudo. La tabla se genera desde el motor, así que no puede mentir.
 *
 * Se cierra con el botón o pinchando fuera, y **a propósito no escucha el
 * teclado**: la ventana de dados tiene puesto un escuchador global que se queda
 * con la tecla Escape y con los dígitos. Si esta pantalla atendiera también a
 * Escape, abrirla en mitad de una tirada la cancelaría sin querer.
 */

// El dibujo de cada cara y su nombre viven en `DiceInput.tsx`, que es el módulo
// de los dados: desde T33 la aplicación también tira dados de héroe y tiene que
// enseñar lo que ha salido, así que la misma cara se pinta en dos pantallas. Una
// copia aquí sería la forma de que esta hoja y la partida dibujaran escudos
// distintos, que es justo lo que esta hoja existe para evitar.

const PARA_QUIEN: Record<CaraCombate, string> = {
  calavera: "hace daño",
  escudoBlanco: "para el golpe, solo a los héroes",
  escudoNegro: "para el golpe, solo a los monstruos",
};

function TablaDeDado({ lados, titulo }: { lados: number; titulo: string }) {
  return (
    <div className="dado-tabla">
      <h3>{titulo}</h3>
      <table>
        <tbody>
          {equivalenciaDeDados(lados).map((tramo) => (
            <tr key={tramo.cara}>
              <td className="dado-numeros">{tramo.numeros.join(", ")}</td>
              <td className="dado-flecha" aria-hidden="true">
                →
              </td>
              <td className={`dado-cara cara-${tramo.cara}`}>
                <CaraDeDado cara={tramo.cara} /> {NOMBRE_DE_CARA[tramo.cara]}
              </td>
              <td className="dado-para">{PARA_QUIEN[tramo.cara]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Instrucciones({ alCerrar }: { alCerrar: () => void }) {
  return (
    <div className="instrucciones-fondo" onClick={alCerrar}>
      <div
        className="instrucciones"
        role="dialog"
        aria-label="Instrucciones"
        onClick={(ev) => ev.stopPropagation()}
      >
        <header className="instrucciones-cabecera">
          <div>
            <h1>Cómo se tiran los dados</h1>
            <p>
              En la caja de HeroQuest los dados de combate tienen dibujos: tres caras con una
              calavera, dos con un escudo blanco y una con un escudo negro. Nosotros jugamos con
              dados corrientes, y salen las mismas cuentas: el dado de seis caras reparte 3, 2 y 1
              igual que el de la caja.
            </p>
          </div>
          <button className="instrucciones-cerrar" onClick={alCerrar}>
            Cerrar
          </button>
        </header>

        <section className="instr-bloque">
          <h2>Qué vale por qué</h2>
          <div className="dados-tablas">
            <TablaDeDado lados={6} titulo="Dado normal (1 a 6)" />
            <TablaDeDado lados={12} titulo="Dado dodecaédrico (1 a 12)" />
          </div>
          <p className="instr-regla">
            Para acordarse: <strong>bajo pega, alto para</strong>. Y el número más alto de todos no
            salva a nadie salvo a los monstruos.
          </p>
          <p className="pista">
            Los dos dados son intercambiables: dan exactamente las mismas probabilidades (media
            calavera, un tercio escudo blanco, un sexto escudo negro). El dodecaédrico sirve para
            completar la tirada cuando faltan dados de seis caras.
          </p>
        </section>

        <section className="instr-bloque">
          <h2>Atacar</h2>
          <p>
            Tira tantos dados como te diga la pantalla y <strong>cuenta las calaveras</strong>: los
            dados que hayan salido bajos. Ese es el único número que te pide la aplicación.
          </p>
          <p>
            Las calaveras que el enemigo consiga parar con sus escudos no hacen nada. Cada una de
            las que pasan le quita un punto de cuerpo.
          </p>
        </section>

        <section className="instr-bloque">
          <h2>Defenderse</h2>
          <p>
            Cuando te atacan a ti, tiras tus dados de defensa y{" "}
            <strong>cuentas los escudos blancos</strong>. Los héroes solo se defienden con los
            blancos.
          </p>
          <p>
            Los monstruos se defienden con el escudo negro, que sale en una sola cara. Esos dados
            los tira la aplicación, así que en la mesa no hay que contarlos, pero conviene saber
            por qué la partida va como va: un monstruo con cuatro dados de defensa para menos de lo
            que parece, porque cada dado suyo solo salva una vez de cada seis. Son mucho más
            frágiles de lo que aparentan.
          </p>
        </section>

        <section className="instr-bloque">
          <h2>Moverse</h2>
          <p>
            El movimiento no usa calaveras ni escudos: se tiran <strong>dos dados normales</strong>{" "}
            y se avanzan tantas casillas como sumen.
          </p>
          <p className="instr-aviso">
            Aquí el dodecaédrico <strong>no</strong> vale como sustituto de los dos dados. Los dos
            juntos sacan un 7 mucho más a menudo que un 2 o un 12, y el dodecaédrico saca todos los
            números por igual: quien lo use se moverá de otra manera.
          </p>
        </section>

        <section className="instr-bloque">
          <h2>Quién tira qué</h2>
          <p>
            Los héroes tiran sus dados de verdad, sobre la mesa, y aquí solo se teclea el número
            que ha salido. Los dados de los monstruos, las trampas y los tesoros los tira la
            aplicación, que hace de Zargon.
          </p>
          <p>
            Quien juegue desde otra casa puede elegir, en su propia pantalla, si tira sus dados o
            se los tira la aplicación: puede que allí no haya dados. Lo cambia cuando quiera, en
            mitad de la partida, y no afecta a nadie más. En la mesa no se pregunta.
          </p>
        </section>
      </div>
    </div>
  );
}
