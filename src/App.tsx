import { useState } from "react";
import type { HeroeElegido } from "./engine/partida";
import { BoardVerify } from "./ui/BoardVerify";
import { EleccionDeHeroes } from "./ui/EleccionDeHeroes";
import { Juego } from "./ui/Juego";

type Pantalla = "juego" | "verificar";

export default function App() {
  const [pantalla, setPantalla] = useState<Pantalla>("juego");
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
        {pantalla === "juego" && grupo && (
          <button onClick={() => setGrupo(null)}>Cambiar héroes</button>
        )}
      </nav>
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
