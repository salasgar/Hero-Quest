import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { Version } from "./ui/Version";
import "./estilos.css";

// La etiqueta de versión va aquí y no dentro de `App` a propósito: `App` tiene
// tres salidas distintas —la mesa, quien juega desde su casa y la pantalla de
// verificación— y la versión hay que poder mirarla en las tres.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <Version />
  </StrictMode>,
);
