# T57 · Descargar la partida: un registro con el que encontrar los fallos

**Precondición:** ninguna. No comparte ficheros con ninguna tarea libre: puede ir a la vez
que todas.
**Banda de modelo:** MEDIO — el formato está decidido aquí abajo y el motor ya guarda lo
que hace falta; lo que pide criterio es que el fichero se pueda repetir exactamente y que
el guion de repetición cuente lo que la mesa vio.
**Duración esperada:** 2 h · **Encadenable con:** 56 (BAJO, corta, sin ficheros en común).
**Ficheros que toca:** `src/ui/registroDePartida.ts` (nuevo), `src/ui/usePartida.ts`,
`src/App.tsx` (el botón), `scripts/repetir.ts` (nuevo), `package.json` (la línea
`"repetir"`), `tests/registro-de-partida.test.ts` (nuevo), `README.md` (un párrafo).
**No toca `Juego.tsx`, `TurnPanel.tsx` ni `useAccionesDeTurno.ts`** (son de la cadena 52,
36, 22) **ni el motor.**
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Lo que pidió Juan Luis

El 2026-09-06, después de probar la página publicada y encontrar cuatro fallos (T51–T54):

> ¿Puedes hacer que cuando juegue una partida en https://salasgar.github.io/Hero-Quest/
> se guarde un registro de todo lo que ocurre en esa partida, de manera que se puedan
> detectar fallos? En ese registro se anotarían cosas como: «Los héroes descubren las
> siguientes puertas: …», «Se marcan en verde las siguientes casillas a las que se puede
> mover el Enano: …», etc. Si ese registro se puede guardar automáticamente en algún
> sitio donde tú puedas acceder, genial. Si no se puede hacer, pon un botón que diga algo
> así como «Descargar partida» y que me pueda bajar un archivo para adjuntártelo y que
> sepas cómo ha ido la partida.

**Guardarlo automáticamente donde una sesión llegue no se puede hoy**: GitHub Pages sirve
ficheros y no corre ningún proceso, y el relevo (`server/`), que sí guardaría cada acción,
espera la firma de Juan Luis para desplegarse (`autorizaciones.md`). Así que es el botón.
Cuando el relevo exista, las partidas en red tendrán su lista de acciones en el servidor y
este mismo formato servirá para bajarlas.

## La idea que lo hace pequeño

**No hace falta anotar «las casillas verdes»: hace falta poder recalcularlas.** El motor
es determinista y el generador aleatorio va dentro del estado (`_COMUN.md`), así que con
la semilla, el grupo elegido y la lista de acciones se rehace la partida entera, paso a
paso, y en cada paso se pueden preguntar los mismos selectores que la pantalla —
`casillasDeMovimiento`, `objetivosDeAtaque`, `puertasAlAlcance`, `puertasVisibles`,
`monstruosEnTablero`—. Es exactamente lo que hace ya el deshacer (`repetir` en
`usePartida.ts`) y lo que hace el simulador (T10).

Por eso el fichero lleva **lo que no se puede deducir** y el guion de repetición imprime
**todo lo demás**. Lo que sí hay que guardar, y hoy se pierde, son **las acciones que el
motor rechazó**: «pulsé y no pasó nada» es el fallo más difícil de encontrar después, y su
motivo (`r.motivo`) hoy se enseña dos segundos y se tira.

## Qué hay que hacer

1. **`src/ui/registroDePartida.ts`**: el tipo `PartidaGuardada` y dos funciones puras.
   ```ts
   interface PartidaGuardada {
     formato: 1;                       // sube si cambia la forma
     commit: string;                   // import.meta.env.VITE_COMMIT ?? "dev": qué código corría
     guardada: string;                 // ISO, la hora de la descarga
     mision: string;                   // estado.mision.id
     semilla: number;                  // la de OpcionesPartida
     heroes: HeroeElegido[];           // el grupo, tal cual entró en crearPartida
     acciones: Accion[];               // la lista entera, en orden
     rechazadas: Array<{ tras: number; accion: Accion; motivo: string }>; // «tras» = cuántas acciones aceptadas había
     diario: string[];                 // el registro narrado con narrar() de narrator/local.ts, para leerlo sin repetir nada
     huella: { eventos: number; rondas: number; heroesVivos: number; monstruosVivos: number }; // para detectar que la repetición diverge
   }
   ```
   `construir(...)` monta esto a partir de lo que tiene `usePartida`; `nombreDeFichero(p)`
   da `heroquest-<mision>-<AAAA-MM-DD-HHMM>.json`. Nada de `Map`, funciones ni fechas
   sin serializar: el test lo pasa por `JSON.parse(JSON.stringify(...))`.
2. **`usePartida.ts`**: guarda las rechazadas (hoy `ejecutar` hace `setError(r.motivo)` y
   nada más) y expone `partidaGuardada(): PartidaGuardada | null`. Además, **en cada
   cambio escribe el registro en `localStorage`** (`heroquest.partida-en-curso`), dentro
   de un `try/catch`: Safari en modo privado lanza al escribir, y una partida no se puede
   caer por eso. Sirve para que el botón viva fuera de `Juego.tsx` (abajo) y para que una
   pestaña que se cierra sin querer no se lleve la partida. **No** se implementa cargarla:
   eso es guardar y cargar partidas (Fase 8 de `TRASPASO.md`), tarea aparte.
   En red (`SesionDeRed`) la lista está en `sesion.acciones` y la semilla en su montaje: si
   sale igual de fácil, que funcione también; si no, se dice en la terminada y se deja
   para cuando el relevo se despliegue.
3. **El botón «Descargar partida» en la barra de `App.tsx`**, al lado de «Cambiar héroes»,
   solo cuando hay partida (`grupo`). Lee el registro de `localStorage`, monta un `Blob`
   y dispara la descarga con un `<a download>`. Nada de abrir pestañas ni de copiar al
   portapapeles: en la tableta la descarga va a «Archivos», que es lo que él puede
   adjuntar después.
4. **`scripts/repetir.ts`** y `"repetir": "vite-node scripts/repetir.ts"` en
   `package.json`. Recibe la ruta del fichero, rehace la partida con `crearPartida` +
   `aplicarAccion` acción a acción y **por cada acción imprime**: el número, quién
   actuaba, la acción, los eventos narrados y, después, lo que la pantalla habría
   enseñado: héroe o monstruo activo, movimiento que le queda, **casillas de
   movimiento** (las verdes), objetivos de ataque, puertas al alcance, puertas visibles y
   monstruos en el tablero. Al llegar a una rechazada la imprime en su sitio con su
   motivo. Al final compara con `huella` y, si no cuadra, lo dice en mayúsculas: quiere
   decir que el código local no es el que corría en la página (`commit`), y entonces el
   guion se ejecuta sobre ese commit (`git worktree add /tmp/repro <commit>`).
   Las constantes de la misión (`MONSTRUOS_CALABOZO`, `PUERTAS_CALABOZO`, …) se cogen
   igual que hace `Juego.tsx`; cuando T45 tenga el catálogo, por `mision`.
5. **`README.md`**: un párrafo en «Publicada en GitHub Pages»: cómo bajar la partida, que
   se guarda en `partidas/` de este repositorio (ya está en `.gitignore`) y se repite con
   `npm run repetir partidas/<fichero>.json`.

## Tests que hay que añadir

- Con una partida jugada por `aplicarAccion` (vale una semilla fija y cinco acciones),
  `construir` da un fichero que, repetido, produce **el mismo `registro`** y la misma
  `huella`.
- Una acción rechazada queda en `rechazadas` con su `tras` y su motivo, y no en
  `acciones`.
- El fichero sobrevive a `JSON.parse(JSON.stringify(...))` sin perder nada.
- `nombreDeFichero` no lleva caracteres que Safari cambie por guiones bajos.

## Trampas conocidas

- **La semilla de `Juego.tsx` es `Date.now() % 100000`** y solo vive en las opciones que
  recibe `usePartida`: hay que guardarla ahí, en el primer render, porque el estado no la
  lleva (el estado lleva el `rng` ya avanzado).
- **`VITE_COMMIT` solo existe en la construcción de Pages** (`Version.tsx`); en
  `npm run dev` es `undefined`. Que salga `"dev"` y no `"undefined"`.
- **`narrar` de `narrator/local.ts` es un `switch` exhaustivo** sobre `Evento`; T39 lo
  va a partir en dos modos, pero la firma se mantiene. No lo toques desde aquí.
- **`.gitignore` ya tiene `partidas/`**: los ficheros que baje Juan Luis no van a git.

## Prohibido

- Tocar el motor (`src/engine/`): el registro se construye por fuera.
- Mandar nada a ningún servicio: el fichero se descarga y punto.
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md`. En el mensaje a Juan Luis, tres líneas: dónde
está el botón, dónde guarda el fichero para que una sesión lo lea (`partidas/`), y la
frase que tiene que decirle a la sesión («repite `partidas/<fichero>.json` y dime qué
ves»).
