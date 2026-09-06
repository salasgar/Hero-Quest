# Lo que toda tarea necesita saber

Treinta líneas que se aplican a todas. Léelas antes de coger cualquier tarea; te ahorran
la tarde entera.

## El proyecto en dos frases

Aplicación web que hace de máster de HeroQuest sobre un tablero **físico**, en el Mac de
Juan Luis, para jugar con sus hijos. El motor (`src/engine/`) es un reductor puro
`aplicarAccion(estado, accion) → { estado, eventos }`, sin React, con el generador
aleatorio **dentro** del estado. Las acciones ilegales devuelven `{ ok: false, motivo }`;
no lanzan excepciones.

Contexto completo en `TRASPASO.md`. Ficha fija del reparto —rutas, dónde está `hechos/`,
bandas de modelo, protocolo de cierre en git y frase de arranque—: `proyecto.md`. Estado del
reparto en `_ESTADO.md`, que es una vista derivada de `hechos/`.

## Cómo se verifica

```sh
npx vitest run
npm run typecheck
```

**Las dos cosas tienen que estar en verde antes de dar nada por hecho.**

Cuántos tests hay no lo dice ningún fichero: se mide. La cifra cambia con cada tarea, y
tenerla copiada en cuatro ficheros garantiza que tres estén mintiendo: ya pasó, con 174,
197 y 204 conviviendo a la vez. Antes de empezar, anota el número que te sale (con el
`--exclude` de la trampa de vitest de abajo, o contarás los worktrees ajenos); si al
terminar hay menos, has roto algo. El número va en tu terminada de `hechos/`, que es de un
solo escritor.

## Trampas del entorno

- **El Mac se satura** (carga por encima de 12) y `tsc` y `vitest` pasan de segundos a
  varios minutos. Encadena la verificación en segundo plano y espera con un bucle, en vez
  de sondear a mano:
  ```sh
  (npx vitest run > /tmp/v.log 2>&1; echo "T=$?" >> /tmp/v.log; \
   npm run typecheck >> /tmp/v.log 2>&1; echo "TC=$?" >> /tmp/v.log) &
  until grep -q "TC=" /tmp/v.log; do sleep 5; done
  ```
- **`tsc -b` se cuelga** en este repo, porque no hay `composite: true`. Usa
  `tsc -p tsconfig.json --noEmit`, que es lo que hace `npm run typecheck`.
- **`npx vitest run` en el árbol principal cuenta también los tests de los worktrees de las
  demás sesiones**: `.claude/worktrees/` cuelga del repositorio y el `exclude` por defecto
  de vitest no lo cubre. Salen 220 ficheros y 3072 tests cuando `main` tiene 32 y 450, y
  el número cambia cuando otra sesión crea su worktree. `npx vitest run tests/` no lo
  arregla (es un filtro de subcadena). Lo que mide `main`:
  ```sh
  npx vitest run --exclude "**/node_modules/**" --exclude "**/.claude/**"
  ```
  El arreglo de raíz es una línea en `vite.config.ts`, dentro de `test`:
  `exclude: ['**/node_modules/**', '**/dist/**', '**/.claude/**']` (hay que repetir los
  dos primeros: dar `exclude` sustituye el valor por defecto). Lo encontraron por separado
  las sesiones de la T40 y la T11 el 2026-09-06; está sin hacer porque no es de ninguna ficha.
- **Al cerrar vuelves al árbol principal, y allí sí lo compartes con las demás sesiones.**
  Con otra sesión viva, el código se edita en un worktree propio (`CLAUDE.md`), pero el
  reclamo se abre en el árbol principal antes de entrar y `hechos/` y el tablón se
  comitean allí al cerrar (`proyecto.md`): en ese momento lo que ves en `git status`
  incluye lo que otras sesiones están escribiendo ahora mismo, y tu `git add` se lo lleva.
  Una sesión se encontró el 2026-09-06 los ficheros de cuatro sesiones en su `git status`.

  El 22 de agosto de 2026 esto ocurrió **tres veces en una tarde, por tres causas
  distintas**. Importa separarlas, porque no se arreglan igual:

  1. **`d3dced0` — `git add -A`.** Metió ficheros enteros de otras dos sesiones en un
     commit cuyo mensaje describía otra cosa. Es la incidencia T12.
     **Nunca `git add -A` ni `git add .`.** Los ficheros se añaden por nombre, uno a uno.
  2. **`fe71dc6` — añadir por nombre un fichero compartido.** Dos sesiones editaban filas
     distintas de la tabla de `_ESTADO.md`; `git add _ESTADO.md` se llevó el fichero
     entero, con la fila ajena dentro. **Añadir por nombre no protege de nada cuando la
     otra sesión edita el mismo fichero**: el índice se llena desde el árbol, no desde tus
     ediciones. La regla 1 cubre «ficheros ajenos», no «líneas ajenas en tu fichero».
  3. **`f07db88` — mirar el diff con la vista recortada.** Esa sesión sí lo miró, pero con
     `git diff … | head -30`, y lo ajeno empezaba en la línea 126. Commiteó convencida de
     haber comprobado, y escribió en el mensaje que el diff estaba limpio.

  De ahí la regla, y va con su forma exacta porque la forma es el fallo:

  ```sh
  git diff --stat -- <fichero>   # ¿cuadra el número de líneas con lo que escribiste?
  git diff -- <fichero>          # entero, hasta el final
  ```

  **Sin `head`, sin `tail` y sin `grep` que filtre por lo que esperas encontrar**, que es
  la costumbre razonable de acortar salidas largas y aquí es justo lo que no vale: el paso
  que falla es el de encontrar lo que **no** esperabas. El `--stat` es la red rápida y
  barata: en `f07db88` marcaba 36 inserciones cuando su autora había escrito 18.

  Si aun así te llevas algo ajeno, **no lo deshagas** -el trabajo del otro es válido y
  perderlo es peor-: dilo en el mensaje de commit y avisa a esa sesión.

- **Edita con las herramientas de edición, no con `sed -i` ni con heredocs.** El hook que
  reparte los candados entre sesiones (`.claude/sesiones/`) tiene matcher
  `Edit|Write|NotebookEdit`. Todo lo que escribas desde Bash pasa por debajo sin comprobar
  el candado ajeno **ni reclamar el tuyo**, y además no renueva tu reserva: el mtime solo
  se refresca al reclamar un fichero nuevo, y `purga` -que ejecuta *cualquier otra* sesión
  al arrancar o al reclamar- borra tu json cuando pasa del TTL. No es que tu reserva
  caduque: es que otra sesión te la borra y tú sigues creyendo que la tienes.

  Esto no es teórico. El mismo 22 de agosto, tres sesiones a la vez estaban editando por
  `sed` y heredocs de python, ninguna reclamó nada, y una de ellas escribió su propio json
  de candado a mano desde Bash. Con las tres pasando por debajo del hook, el cruce estaba
  garantizado por diseño.

  **Si tus instrucciones de arranque te dicen que edites con `sed`, heredocs o scripts
  cortos, aquí manda esta regla.** En este repositorio Bash no basta para editar: rompe la
  coordinación, que es la parte cara.

- **El reglamento oficial de 2021** (Avalon Hill F3649) se descarga de
  `https://instructions.hasbro.com/api/download/F3649_en-us_heroquest-game-instructions-rulebook.pdf`.
  Son **32 páginas escaneadas sin capa de texto**: `pdftotext` devuelve vacío. Hay que
  leerlo con la herramienta Read pasando `pages`; cada página del PDF es un pliego de dos
  del libro. La página 7 del PDF son las páginas 12-13 del libro (las seis acciones del
  héroe); la 8 son la 14-15 (hechizos, tesoro); la 9 son la 16-17 (puertas secretas y
  trampas).

## Trampas del código

- **`e.monstruos` y `e.heroes` conservan a los caídos con cuerpo 0.** Filtra por
  `cuerpo > 0` en cuanto preguntes «quién está vivo». Esa lista completa se usa a
  propósito: su longitud distingue «los hemos matado a todos» de «esta misión no tenía
  monstruos».
- **En los tests, una sala sin revelar no deja ver nada.** `puedeVer` aplica la regla de
  las salas: a oscuras no hay línea de visión, ni siquiera de una casilla a la de al lado.
  Si un hechizo se te rechaza con «no tienes línea de visión» en un test, te falta
  `salasReveladas: ["a"]` en el estado de partida.
- **La sala `a` mide 4 × 4** (columnas 1-4, filas 1-4). Para probar que algo bloquea el
  paso, ajusta el movimiento: con 4 o más casillas se rodea por debajo y el bloqueo no se
  nota. Con 2 sí.
- **El test de juego al azar de `tests/integracion.test.ts` es el que encuentra los fallos
  de verdad.** Juega partidas enteras con acciones legales al azar y comprueba las
  invariantes en cada paso. Ha encontrado tres fallos reales del motor. **Si lo rompes,
  la sospecha por defecto es que has metido un bug, no que el test esté mal.**
- **Un test que falla porque afirmaba la regla equivocada se corrige**, y se dice en el
  commit que el test era el equivocado. Uno que falla por cualquier otro motivo es un
  fallo tuyo. Distinguir las dos cosas honestamente es media tarea.

## Estilo

Código y comentarios **en español**. Los comentarios explican **por qué**, nunca qué hace
la línea siguiente, y van con la misma densidad que el código de alrededor. Si escribes
un comentario que se limita a repetir el nombre de la función, bórralo.

## Prohibido en todas las tareas

- **Tocar `src/data/board-base.ts`.** La geometría del tablero está medida píxel a píxel
  sobre una foto y verificada. Si crees que está mal, escríbelo en `_ESTADO.md` y para.
- **Tocar `src/data/board-print.ts`** ni el reparto de los cuatro folios. El tablero ya
  está impreso y pegado.
- **Inventarse una regla.** Todo lo que se implemente sale del reglamento, y la cita va en
  el comentario o en el mensaje de commit. Si no encuentras la fuente, implementa solo lo
  confirmado y deja escrito lo que falta. Esta regla existe porque ya se incumplió una vez:
  cuatro hechizos se implementaron «de memoria» y once de doce valores estaban mal.
- **Hacer `git push --force`** o reescribir el histórico.
