import { useState } from "react";
import { nombreDeClase } from "./data/heroes";
import { LOGOTIPO, rutaDe } from "./data/imagenes";
import type { HeroeElegido } from "./engine/partida";
import { MESA, type SesionDeRed } from "./red/cliente";
import { BoardVerify } from "./ui/BoardVerify";
import { EleccionDeHeroes } from "./ui/EleccionDeHeroes";
import { codigoDelEnlace, CrearPartidaEnRed, UnirseAPartida } from "./ui/EntrarEnPartida";
import { Instrucciones } from "./ui/Instrucciones";
import { Juego } from "./ui/Juego";
import { leerEnCurso, nombreDeFichero } from "./ui/registroDePartida";
import { Transicion } from "./ui/Transicion";
import { VistaDeHeroe } from "./ui/VistaDeHeroe";

/**
 * Cómo se llama cada quien en la pantalla de paso: su nombre, o su clase.
 *
 * `nombreDeClase` ya sabe que el género puede faltar y que por omisión es
 * masculino; indexar `HEROES[clase].nombre[genero]` a mano se rompe con quien
 * no lo haya dicho.
 */
const comoSeLlaman = (grupo: HeroeElegido[]) =>
  grupo.map((h) => h.nombre?.trim() || nombreDeClase(h.clase, h.genero));

/**
 * Baja la partida en curso como fichero, para poder adjuntarla.
 *
 * El registro lo va dejando `usePartida` en `localStorage` a cada cambio, así
 * que el botón puede vivir aquí arriba, en la barra, sin que la partida —que es
 * de `Juego`— tenga que subir hasta `App`.
 *
 * Se descarga y no se manda a ningún sitio: en Pages no hay ningún proceso al
 * otro lado que pudiera recogerlo, y aunque lo hubiera, esto es la partida de
 * una familia y no tiene por qué salir de su tableta. En la tableta la descarga
 * cae en «Archivos», que es de donde él la adjunta.
 */
function descargarPartida(): void {
  const partida = leerEnCurso();
  if (!partida) {
    // Sin registro no hay nada que bajar: pasa con `localStorage` bloqueado
    // —Safari en modo privado— y no tiene arreglo desde aquí. Decirlo es mejor
    // que un botón que no hace nada.
    alert("No hay ninguna partida guardada en este navegador todavía.");
    return;
  }
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(partida, null, 2)], { type: "application/json" }),
  );
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreDeFichero(partida);
  // Puesto en el documento antes de pulsarlo: un enlace suelto no siempre
  // dispara la descarga, y el navegador de la mesa es el de una tableta.
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  // El blob hay que soltarlo o se queda en memoria mientras viva la pestaña,
  // pero **no en la misma vuelta**: revocarlo antes de que el navegador haya
  // empezado a leerlo cancela la descarga, y ahí no hay error, simplemente no
  // se baja nada. Safari es el que lo hace.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export default function App() {
  // Las instrucciones se abren **encima** de lo que haya, no en lugar de ello:
  // se consultan en mitad de una tirada, y la partida vive en el estado de
  // `Juego`. Desmontarlo para enseñar una tabla borraría la partida entera.
  const [verInstrucciones, setVerInstrucciones] = useState(false);
  const [grupo, setGrupo] = useState<HeroeElegido[] | null>(null);
  // Cambia con cada grupo nuevo: fuerza a montar la partida desde cero en vez
  // de reaprovechar el estado del grupo anterior.
  const [reparto, setReparto] = useState(0);
  const [sesion, setSesion] = useState<SesionDeRed | null>(null);
  const [creandoRed, setCreandoRed] = useState(false);
  /**
   * La pantalla de paso entre elegir el grupo y jugar.
   *
   * Se dibuja **encima** de `Juego`, no en su lugar, por lo mismo que las
   * instrucciones: si sustituyera a `Juego`, la partida se montaría al
   * terminar la transición y no al empezarla, y con el logotipo aún puesto ya
   * habría que estar repartiendo el calabozo. Encima, la partida arranca en
   * cuanto se pulsa «empezar» y el logotipo solo tapa mientras dura.
   */
  const [enTransicion, setEnTransicion] = useState(false);

  /**
   * El código del enlace se lee **una vez**, al montar. Si se leyera en cada
   * render, salir de una partida y volver a la pantalla de siempre metería otra
   * vez en la misma partida, porque el código sigue en la barra de direcciones.
   */
  const [codigoRecibido] = useState<string | null>(() => codigoDelEnlace());

  // Puerta trasera para cotejar el tablero físico con la foto de referencia:
  // sin botón, solo se llega con `?verificar` en la URL.
  const [verificarPorUrl] = useState<boolean>(
    () => new URLSearchParams(window.location.search).has("verificar"),
  );

  if (verificarPorUrl) {
    return <BoardVerify />;
  }

  // Quien abre un enlace no elige grupo ni misión: eso lo decidió la mesa. Va
  // directo a decir quién es, y de ahí a jugar.
  if (codigoRecibido && !sesion) {
    return <UnirseAPartida codigo={codigoRecibido} alEntrar={setSesion} />;
  }

  // En red hay dos pantallas distintas, y cuál toca no es una preferencia: la
  // decide el papel de quien mira. La mesa arbitra y lo ve todo; quien juega
  // desde su casa ve lo que sabe el grupo.
  if (sesion) {
    return sesion.jugador === MESA ? (
      <Juego sesion={sesion} heroes={grupo ?? undefined} />
    ) : (
      <VistaDeHeroe sesion={sesion} />
    );
  }

  return (
    <>
      <nav className="navegacion">
        {/*
          El logotipo pequeño va aquí porque es el único sitio de la partida
          donde no le quita nada al juego: la barra ya existe y tenía hueco de
          sobra a la izquierda. Encima del tablero no va nunca.
        */}
        <img className="navegacion-logo" src={rutaDe(LOGOTIPO)} alt="HeroQuest" />
        <button className="sel">Partida</button>
        <button
          className={verInstrucciones ? "sel" : ""}
          onClick={() => setVerInstrucciones((v) => !v)}
        >
          Instrucciones
        </button>
        {grupo && (
          <button
            onClick={() => {
              setGrupo(null);
              setEnTransicion(false);
            }}
          >
            Cambiar héroes
          </button>
        )}
        {grupo && (
          <button onClick={descargarPartida} title="Baja un fichero con todo lo que ha pasado">
            Descargar partida
          </button>
        )}
        {grupo && !creandoRed && (
          <button onClick={() => setCreandoRed(true)}>Jugar con alguien fuera</button>
        )}
      </nav>
      {verInstrucciones && <Instrucciones alCerrar={() => setVerInstrucciones(false)} />}
      {creandoRed && grupo ? (
        <CrearPartidaEnRed
          heroes={grupo}
          alEntrar={setSesion}
          alVolver={() => setCreandoRed(false)}
        />
      ) : grupo ? (
        <>
          <Juego key={reparto} heroes={grupo} />
          {enTransicion && (
            <Transicion
              nombres={comoSeLlaman(grupo)}
              alTerminar={() => setEnTransicion(false)}
            />
          )}
        </>
      ) : (
        <EleccionDeHeroes
          alEmpezar={(heroes) => {
            setGrupo(heroes);
            setReparto((n) => n + 1);
            setEnTransicion(true);
          }}
        />
      )}
    </>
  );
}
