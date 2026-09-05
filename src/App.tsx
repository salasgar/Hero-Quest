import { useState } from "react";
import type { HeroeElegido } from "./engine/partida";
import { BoardVerify } from "./ui/BoardVerify";
import { EleccionDeHeroes } from "./ui/EleccionDeHeroes";
import { Instrucciones } from "./ui/Instrucciones";
import { Juego } from "./ui/Juego";

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
      </nav>
      {verInstrucciones && <Instrucciones alCerrar={() => setVerInstrucciones(false)} />}
      {pantalla === "verificar" ? (
        <BoardVerify />
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
