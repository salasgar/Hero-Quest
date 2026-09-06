import { useState } from "react";
import type { HeroeElegido } from "./engine/partida";
import { MESA, type SesionDeRed } from "./red/cliente";
import { BoardVerify } from "./ui/BoardVerify";
import { EleccionDeHeroes } from "./ui/EleccionDeHeroes";
import { codigoDelEnlace, CrearPartidaEnRed, UnirseAPartida } from "./ui/EntrarEnPartida";
import { Instrucciones } from "./ui/Instrucciones";
import { Juego } from "./ui/Juego";
import { VistaDeHeroe } from "./ui/VistaDeHeroe";

type Pantalla = "juego" | "verificar";

export default function App() {
  const [pantalla, setPantalla] = useState<Pantalla>("juego");
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
   * El código del enlace se lee **una vez**, al montar. Si se leyera en cada
   * render, salir de una partida y volver a la pantalla de siempre metería otra
   * vez en la misma partida, porque el código sigue en la barra de direcciones.
   */
  const [codigoRecibido] = useState<string | null>(() => codigoDelEnlace());

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
        <button
          className={pantalla === "juego" ? "sel" : ""}
          onClick={() => setPantalla("juego")}
        >
          Partida
        </button>
        <button
          className={pantalla === "verificar" ? "sel" : ""}
          onClick={() => setPantalla("verificar")}
        >
          Verificar tablero
        </button>
        <button
          className={verInstrucciones ? "sel" : ""}
          onClick={() => setVerInstrucciones((v) => !v)}
        >
          Instrucciones
        </button>
        {pantalla === "juego" && grupo && (
          <button onClick={() => setGrupo(null)}>Cambiar héroes</button>
        )}
        {pantalla === "juego" && grupo && !creandoRed && (
          <button onClick={() => setCreandoRed(true)}>Jugar con alguien fuera</button>
        )}
      </nav>
      {verInstrucciones && <Instrucciones alCerrar={() => setVerInstrucciones(false)} />}
      {pantalla === "verificar" ? (
        <BoardVerify />
      ) : creandoRed && grupo ? (
        <CrearPartidaEnRed
          heroes={grupo}
          alEntrar={setSesion}
          alVolver={() => setCreandoRed(false)}
        />
      ) : grupo ? (
        <Juego key={reparto} heroes={grupo} />
      ) : (
        <EleccionDeHeroes
          alEmpezar={(heroes) => {
            setGrupo(heroes);
            setReparto((n) => n + 1);
          }}
        />
      )}
    </>
  );
}
