# T51 · Un héroe pisa una trampa y tiene que pasarle algo

**Precondición:** ninguna. **No a la vez que 53, 54 ni 50** (`reducer.ts`: van en cadena,
esta la primera) **ni que 37** (`BoardMirror.tsx`).
**Banda de modelo:** ALTO — es un diagnóstico con un test que afirma lo contrario de lo
que Juan Luis espera, y la salida es leer el reglamento y decidir; un error aquí es una
regla inventada, que es lo que `_COMUN.md` prohíbe.
**Duración esperada:** 1,5 h · **Encadenable con:** 53 y 54 (misma banda; comparten
`reducer.ts`: seguidas, nunca en paralelo).
**Ficheros que toca:** `src/engine/reducer.ts` (`mover`, `dispararTrampa`),
`src/ui/BoardMirror.tsx` (el pintado de trampas), `tests/reducer.test.ts`,
`tests/integracion.test.ts` solo si cambia una invariante. **No toca `TurnPanel.tsx`,
`Juego.tsx` ni `useAccionesDeTurno.ts`** (cadena 52, 36, 22): el aviso en pantalla de
«ha saltado una trampa» es de T52.
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Lo que pidió Juan Luis

El 2026-09-06, probando la página publicada: «Un héroe ha pisado una trampa y no ha
ocurrido nada.»

## Lo que dice el código hoy, medido

- `mover` (`reducer.ts`, hacia la línea 367) recorre la ruta casilla a casilla y en cada
  una mira `trampaEn`. La trampa salta solo si **`!trampa.descubierta`** y quien pisa es
  un héroe (y no vuela, si es un foso). Es decir: **una trampa que el grupo ya ha
  encontrado con «Buscar trampas» no hace nada al pisarla**, y hay un test que lo fija:
  `tests/reducer.test.ts`, «una trampa ya descubierta no vuelve a saltar» (línea 229).
  Ese test no cita ninguna página del reglamento.
- `BoardMirror.tsx` (línea 172) pinta **solo** las trampas `descubierta && !gastada`. O
  sea: la única manera de que Juan Luis viera que había una trampa antes de pisarla es que
  el grupo la hubiera descubierto, y en ese caso el motor la exime a propósito. **Esa es
  la hipótesis principal.**
- Y un efecto secundario del mismo filtro: **un foso que ya ha saltado desaparece del
  tablero**, cuando T5 dejó dicho que el agujero se queda toda la misión (reglamento
  p. 17, «Once a pit trap is sprung and a pit tile placed on the board…») y quien está
  dentro defiende con un dado menos. La mesa no ve el agujero que el motor sí tiene en
  cuenta.
- La segunda hipótesis: la lanza (`lanza1`, en (15,16)) salta, quita un punto de cuerpo y
  **no corta el movimiento**; lo único que se ve es una línea en el diario y un punto
  menos en la hoja. Desde el tablero parece que no ha pasado nada. El aviso en pantalla
  es de T52; aquí, que el diario y el tablero lo cuenten bien.
- Las trampas de la misión: foso en (12,14), lanza en (15,16), bloque en (7,15)
  (`calabozo.ts`). Los monstruos no las disparan (T4) y el hada no cae al foso (T5).

## Antes de empezar: mira si ya está hecho

```sh
grep -n "descubierta" src/engine/reducer.ts | head
```

Si `mover` ya distingue entre trampa descubierta y sin descubrir según el reglamento (y
el test de la línea 229 cita la página), está hecha.

## Qué hay que hacer

1. **Leer las páginas 16-17 del reglamento de 2021** (página 9 del PDF; cómo se lee está
   en `_COMUN.md`, «Trampas del entorno»). Lo que hay que sacar de ahí, literal:
   qué le pasa a un héroe que **entra en una casilla con una trampa ya encontrada** y no
   desarmada, para cada tipo (foso, lanza, bloque). El recuerdo que tiene esta ficha, y
   que hay que **confirmar antes de escribir una línea**, es que el foso encontrado se
   puede intentar saltar con una tirada y que las otras dos siguen armadas hasta que
   alguien las desarma. Si el reglamento dice otra cosa, manda el reglamento.
2. **Implementarlo en `mover`**, con la cita en el comentario. Si el foso encontrado se
   salta con un dado, la tirada la hace el motor **dentro de `mover`** con el `rng` del
   estado, sin botón nuevo ni acción nueva: la ruta ya pasa por ahí y el evento dice lo
   que salió. Si el héroe cae, el movimiento se corta como hoy.
3. **Corregir el test de la línea 229** para que afirme la regla del reglamento, diciendo
   en el commit que el test era el equivocado (`_COMUN.md`, «Trampas del código»). Y
   añadir los que falten: cada tipo de trampa, encontrada y pisada.
4. **Que el tablero pinte lo que el motor sabe**: el foso abierto (`gastada`, tipo foso)
   se queda pintado toda la misión, distinto de la trampa encontrada y sin saltar. La
   lanza y el bloque gastados no se pintan (el bloque ya ciega la casilla, que se pinta
   por `celdasBloqueadas`).
5. **Repetir en la página, no solo en los tests**: `npm run dev`, buscar trampas en la
   sala de la mesa volcada (`t`), ver el ⚠ y pisarlo. Y decir en la terminada qué de las
   dos hipótesis era.

## Trampas conocidas

- **`trampaEn` filtra `!gastada`**: un foso abierto no es «una trampa», es un agujero; si
  el reglamento dice algo de volver a caer en un foso abierto, se mira aparte.
- **El test de juego al azar** (`integracion.test.ts`) tiene «el foso del pasillo salta al
  pisarlo y corta el movimiento» y un recorrido con invariantes. Si se rompe, lo primero
  es sospechar del cambio, no del test.
- **La IA (T8) no evita trampas descubiertas** a propósito, porque los monstruos no las
  disparan. No la toques.
- **T52 pondrá el aviso en pantalla** leyendo el evento `trampaDisparada` de lo que
  devuelve `ejecutar`: no cambies la forma de ese evento sin decirlo en la terminada.

## Prohibido

- Inventarse la regla del salto o del daño: cita o no se implementa.
- Tocar `TurnPanel.tsx`, `Juego.tsx`, `useAccionesDeTurno.ts` (cadena 52, 36, 22).
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md`. En la terminada: qué hipótesis era, la cita
del reglamento y la lista de tests corregidos y nuevos.
