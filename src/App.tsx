import { useState } from "react";
import { BoardVerify } from "./ui/BoardVerify";
import { Juego } from "./ui/Juego";

type Pantalla = "juego" | "verificar";

export default function App() {
  const [pantalla, setPantalla] = useState<Pantalla>("juego");
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
      </nav>
      {pantalla === "juego" ? <Juego /> : <BoardVerify />}
    </>
  );
}
