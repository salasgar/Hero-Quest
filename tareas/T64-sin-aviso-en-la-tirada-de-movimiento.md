# T64 · Quitar el aviso emergente de la tirada de movimiento

**Precondición:** ninguna. **No a la vez que ninguna otra tarea viva declarada hoy** sobre
`useAccionesDeTurno.ts` (comprobar el tablón al reclamar).
**Banda de modelo:** MEDIO — el cambio en sí es pequeño, pero **revierte a propósito** una
decisión de diseño ya firmada (abajo); hay que entenderla antes de tocar nada y decidir el
alcance exacto (solo movimiento, o algo más).
**Duración esperada:** 1 h · **Encadenable con:** T65 (las dos MEDIO, cortas, sin fichero en
común: T64 toca `useAccionesDeTurno.ts`, T65 toca `TurnPanel.tsx`).
**Ficheros que toca:** `src/ui/useAccionesDeTurno.ts`. Posiblemente `src/ui/DiceInput.tsx` y
`src/estilos.css` si decides que el número de casillas necesita un sitio nuevo donde verse
un instante (lee «Consecuencias» abajo: probablemente no hace falta).
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Lo que contó Juan Luis

El 2026-09-07:

> Cuando le doy a "Tirar movimiento" aparece una ventana emergente que dice "Tirada de
> movimiento / 10 casillas / Vale / Los ha tirado la aplicación · Intro para seguir" Y me
> obliga a darle a "Vale" con el ratón. Debes omitir esa ventana. Que simplemente aparezcan
> las casillas destacadas en verde para elegir dónde moverse.

## Por qué existe ese aviso, y por qué esto lo revierte a propósito para el movimiento

**No es un descuido: está firmado.** `AvisoDeTirada` (`src/ui/DiceInput.tsx:71-111`) nació
en **T33** y se conservó explícitamente en **T36**, las dos firmadas por Juan Luis el
2026-09-06 (`autorizaciones.md`):

- T33: «Cuando lo tira la aplicación, se enseña qué ha salido, cara a cara y no solo el
  total. Un niño que no ve los dados tiene que ver al menos los dibujos, o la aplicación le
  está pidiendo que se fíe.»
- T36 (dados siempre automáticos, `autorizaciones.md:107-114`): «La tirada tiene que verse
  en la mesa: las caras (o los dos D6 del movimiento) un instante antes de aplicarse, con
  tiempo para leerlas.»

Es decir, el aviso es una prótesis para que un niño que no ve tirar dados físicos «oiga» la
tirada antes de que se aplique. **Esta tarea la quita solo para el movimiento**, porque es
lo que ha pedido Juan Luis explícitamente hoy, con un mensaje directo, después de haber
firmado lo contrario hace un día: la decisión la tenía reservada él mismo, y ya está tomada.
**No lo interpretes como una invitación a quitarlo también de ataque, hechizos o trampas.**
Esos siguen firmados tal cual, y de hecho tienen más sentido (ver caras de calaveras/escudos
antes de que se aplique el daño). Si algún día Juan Luis pide lo mismo para otro caso, será
otra tarea con su propia frase.

`tareas/_PROPUESTAS-2026-09.md`, punto 4, ya había detectado esta fricción («son los dos
clics que más se repiten en toda la partida») y la dejó pendiente de que él decidiera. Con
esto, ya la decidió, al menos para el movimiento.

## Diagnóstico medido en el código

El aviso y el cálculo de las casillas verdes son **independientes**: quitar el aviso no
toca la lógica de movimiento, ya vive aparte.

- `src/ui/useAccionesDeTurno.ts`, `pedirMovimiento` (líneas 261-263) llama a
  `tirarYEnsenar({ tipo: "tirarMovimiento" }, "Tirada de movimiento")`.
- `tirarYEnsenar` (líneas 120-155) **ya ejecuta la acción contra el motor de forma
  síncrona** y solo después usa el evento para abrir el aviso:
  ```ts
  const movimiento = eventos.find((ev) => ev.tipo === "tiradaMovimiento");
  if (movimiento && movimiento.tipo === "tiradaMovimiento") {
    setTirada({ titulo, resumen: `${movimiento.total} casillas` });
    return;
  }
  ```
- Las casillas verdes salen de `casillasDeMovimiento(estado)` (línea 164), **calculadas en
  cada render a partir del estado**, sin depender de si `tirada` está abierto o cerrado, y
  llegan a `Juego.tsx`/`BoardMirror` igual (`Juego.tsx:123`).
- El CSS confirma por qué hoy tapan el tablero: `.dados-fondo` es
  `position: fixed; inset: 0; z-index: 20` (`estilos.css:151-154`), un overlay a pantalla
  completa. Al cerrar el aviso (`cerrarTirada`, `Juego.tsx:442`, solo hace `setTirada(null)`)
  no se recalcula nada: el tablero con las casillas ya estaba pintado debajo.

**Conclusión: basta con no abrir el aviso para el caso `tiradaMovimiento`.** No hace falta
tocar `casillasDeMovimiento`, `BoardMirror` ni el reducer.

## Antes de empezar: mira si ya está hecho

```sh
grep -n "tirarYEnsenar\|pedirMovimiento" src/ui/useAccionesDeTurno.ts
```

## Qué hay que hacer

1. **En `useAccionesDeTurno.ts`, para el caso de movimiento**: no llames a `setTirada(...)`
   con el resultado de `tiradaMovimiento`. La forma exacta depende de cómo esté escrito
   `tirarYEnsenar` cuando lo mires (puede que convenga un parámetro que diga «mostrar aviso:
   sí/no» en vez de bifurcar el caso a mano, para no duplicar la llamada al motor); usa tu
   criterio, pero no toques `tirarYEnsenar` para los demás tipos de tirada (ataque, hechizo,
   trampa), que siguen abriendo el aviso.
2. **Comprueba «Consecuencias» abajo**: el número de casillas sigue viéndose en el contador
   del panel de turno (`TurnPanel.tsx:159-164`, `👣 {movimientoRestante} de
   {movimientoTotal}`) sin que hiciera falta el aviso, así que no debería hacer falta añadir
   nada nuevo. Verifícalo jugando: tira movimiento y comprueba que el contador se actualiza
   igual, sin el modal de por medio.
3. **Prueba de verdad en el navegador** que, tras pulsar «Tirar movimiento», las casillas
   verdes aparecen directamente sobre el tablero sin ningún paso intermedio.

## Consecuencias que hay que anotar en el cierre

Al quitar el aviso, se pierde el único momento en que se veían **las caras de los dos D6 de
movimiento** (el resumen «10 casillas» sigue en el contador, pero las caras de dado en sí,
no). Es la pérdida real de la que avisa la firma de T33/T36, y es la que Juan Luis ha
aceptado al pedir esto hoy; solo hace falta decirlo en el mensaje de cierre para que quede
constancia de qué se sacrificó y por qué.

## Trampas conocidas

- **`AvisoDeTirada` se usa en cuatro casos, no solo movimiento**: ataque, movimiento, daño
  de hechizo (bola de fuego, fuego de la ira, genio) y trampas (esta última fuera de
  `tirarYEnsenar`, con un `setTirada` directo dentro de `mover`, en
  `useAccionesDeTurno.ts:279-284`). Toca **solo** la rama de movimiento.
- **Se monta en dos sitios**: `Juego.tsx:209` y `VistaDeHeroe.tsx:188`, los dos leyendo el
  mismo estado `turno.tirada` del hook. No hace falta tocar ninguno de los dos componentes
  si el cambio va en el hook, pero compruébalo en los dos (partida local y vista remota) al
  probar.
- **El atajo de teclado Intro/Escape/Espacio para cerrar el aviso** (`DiceInput.tsx:74-82`)
  deja de aplicarse al movimiento porque ya no hay aviso que cerrar; no hace falta tocarlo,
  pero no te sorprenda que ese código siga existiendo (lo siguen usando ataque, hechizo y
  trampa).

## Tests que hay que añadir

Ninguno de pantalla (los componentes no se prueban). Comprueba que `npx vitest run` sigue
en verde: si algún test de `useAccionesDeTurno` o de integración esperaba que
`tirarMovimiento` abriera el aviso, corrígelo para que ya no lo espere.

## Prohibido

- Quitar el aviso de ataque, hechizo o trampa: no lo pidió Juan Luis, y esos casos siguen
  firmados tal cual.
- Tocar `casillasDeMovimiento`, `BoardMirror` o el reducer: el cálculo de las casillas ya
  funciona bien, el problema era solo la capa que lo tapaba.
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md`. Menciona en el cierre la pérdida de «ver las
caras de los D6 de movimiento» (arriba, «Consecuencias»), para que quede escrito que Juan
Luis la aceptó a cambio de quitar el clic extra.

## Lo que encontró la sesión que la hizo (`s-20260907T205502-6241d5c8`, 2026-09-07)

Hecha y cerrada. Tres cosas que no estaban escritas aquí:

- **El diagnóstico era exacto.** Bastó el parámetro `mostrarAviso` en `tirarYEnsenar` y
  pasarlo a `false` desde `pedirMovimiento`; ni `DiceInput.tsx`, ni `estilos.css`, ni
  ningún test esperaban el aviso (669 tests antes y después).
- **La pérdida es menor de lo que decía «Consecuencias».** Las caras de los dos D6 dejan
  de verse en el aviso, pero el diario ya escribía la tirada desglosada («Brúndil saca 3 y
  2: 5 casillas»), así que el niño que quiera comprobarla sigue teniendo dónde mirar.
- **Sí se puede probar en un navegador de verdad sin añadir dependencias.** La caché de
  `npx` de este Mac tiene Playwright con Chromium descargado
  (`~/.npm/_npx/e41f203b7505f1fb/node_modules/playwright`); un guion de veinte líneas
  contra `npx vite --port 5199 --strictPort` (puerto propio, para no chocar con otras
  sesiones) elige un héroe, empieza la partida, pulsa «Tirar movimiento» y cuenta
  `.dados-fondo` y los `rect[fill="#5ad1a0"]`. Vale para cualquier tarea de pantalla cuya
  ficha diga «verificación manual».
