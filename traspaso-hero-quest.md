# Traspaso — HeroQuest

Actualizado: 2026-09-06 17:40Z · Sesión que lo escribe: `s-20260906T141818-ff83f12c` (la
que coordinó tras la migración: escribió T51–T57 con lo que Juan Luis vio probando la
página publicada)

## Objetivo

Una aplicación que hace de máster de HeroQuest sobre el tablero físico del salón, para
jugar con niños, con la posibilidad de que alguien juegue desde otra casa. El proyecto
grande está en `README.md` y `TRASPASO.md`. La tanda en curso es el encargo de Juan Luis
del 2026-09-06 (dados automáticos, iconos, monstruos que huyen, diario en dos modos,
ambientación, nombres, más misiones, más especies, lista de mejoras) **más lo que vio al
probar la página publicada esa tarde**: trampas que no saltan, mandos de héroe en el turno
de Zargon, una misión sin encargo, salas vacías, y un registro de partida para poder
encontrar fallos.

## Estado actual

**El estado de cada tarea está en `_ESTADO.md`, vista derivada de `hechos/`** (la verdad).
Aquí solo lo que el tablón no recoge.

- 50 fichas (T1–T22, T30–T57). Cerradas y en `main`: todas hasta T35, más 11, 40, 41
  (`4baf429`), 42 (`372a0f0`) y 43. **No hay ningún reclamo vivo** a las 17:40Z.
- T51–T57 están escritas y sin empezar. T57 (descargar la partida) es la que Juan Luis
  pidió expresamente la última; va la primera de la cola porque es lo que permite mirar
  los demás fallos con datos.
- Los tres ficheros de `hechos/` de la T41 que estaban sin rastrear en el árbol principal
  eran idénticos a los de `origin/main` y se apartaron; `Letras Hero Quest.png` sigue en la
  raíz sin rastrear (lo borra Juan Luis; ya está copiado en `public/`).

## Siguiente paso

1. Abrir sesiones con **una frase por sesión**, con su tarea o cadena dentro. Caben a la
   vez: **57** (MEDIO), **51 → 53 → 54 → 55** (ALTO, encadenadas), **52 → 36 → 22** (MEDIO,
   encadenadas), **49** (MEDIO), **48** (ALTO) y **56** (BAJO; o 56 → 57 en una MEDIO).
   Después: 37 cuando cierren 51 y 54; 39 cuando cierre 54; 38 cuando cierren 54 y 49; 44 y
   45 cuando cierre la cadena 52 → 36 → 22 (45 además espera a 53); 46 tras 45; 50 tras 49
   y 55.
2. Regenerar el tablón desde `hechos/` cada vez que una sesión cierre (lo hacen las
   sesiones; si lo encuentran reservado, avisan).
3. Cuando T57 cierre, decirle a Juan Luis que baje la partida en la que vio los fallos y la
   deje en `partidas/`: `npm run repetir partidas/<fichero>.json` la rehace acción a acción.

Banda de modelo para retomar: **ALTO** — lo que viene es coordinar (regenerar el tablón,
resolver choques, escribir fichas cuando Juan Luis añada encargos), que es criterio; las
tareas en sí las hacen las sesiones con la banda de su ficha.

## Decisiones tomadas

| Decisión | Por qué |
|---|---|
| `hechos/` es la verdad; `_ESTADO.md` se regenera entero y no afirma nada que no salga de `hechos/`, las fichas, `autorizaciones.md` o `proyecto.md` | Con el tablón como verdad y diez sesiones, el candado del entorno lo tuvo reservado todo el día (2026-09-05) y el protocolo dejó de ejecutarse |
| Números de tarea en `hechos/`: dos cifras sin la T (`07--<sid>.md`) | Es lo que espera la skill (`NN--<sid>`); la equivalencia está en `proyecto.md` |
| Con un worktree por sesión, **el reclamo se abre y se empuja en el árbol principal antes de `EnterWorktree`**; latidos, terminada y `CERRADA` van a la copia del worktree y los publica la fusión en `main` | Cada worktree tiene su copia de `hechos/` y desde dentro no se puede escribir fuera: cuatro sesiones trabajaron sin un solo reclamo visible en `origin/main` |
| **El hash de la terminada se escribe después del último `push`**, como línea añadida | T42 y T41 lo escribieron antes del rebase final y las dos tuvieron que corregirlo (`0cc2cf5`, `2d1408a`) |
| **Una frase de arranque por sesión, con la tarea o la cadena dentro** | Cuatro sesiones MEDIO con la misma frase genérica eligieron cada una lo que quiso |
| **T51–T57 salen de la prueba de la página del 2026-09-06; las misiones nuevas empiezan en T58** | Las tareas se añaden al final y no se renumera; el traspaso anterior decía «misiones desde T51» sin ficha escrita |
| **El registro de partida (T57) guarda semilla, grupo, acciones y rechazadas, no «lo que se pintó»**; un guion lo rehace y calcula las casillas verdes y demás | El motor es determinista con el `rng` dentro del estado: lo derivable no se guarda, y las acciones rechazadas son justo lo que hoy se pierde |
| **Guardar la partida donde una sesión llegue no se puede hoy**; es un botón «Descargar partida» y el fichero va a `partidas/` (ya en `.gitignore`) | Pages es estático; el relevo espera firma. Cuando exista, las partidas en red tendrán sus acciones en el servidor |
| **La trampa descubierta que no salta (T51) se resuelve leyendo la p. 17**, no decidiendo | Hay un test que fija la exención sin cita; la regla es del reglamento o no es |
| **En el turno de Zargon los mandos de héroe desaparecen, salvo en pausa o avería (T52)** | «Autónomamente o dirigidos por el máster»: pausar es tomar el mando; la salida manual de T11 se queda detrás |
| **El pergamino (T53) es un objetivo `recuperar`**: buscar tesoro en la sala del custodio muerto termina la misión | Es lo que dijo Juan Luis y es el «tesoro de misión» de la p. 14; el simulador tiene que aprender a buscar o medirá 0 % |
| **Pociones a una mochila y equipo del tesoro (T54) antes de poblar salas (T55)** | Sin mochila una poción robada entero se pierde; poblar salas con la baraja de hoy no da lo que él pidió |
| Dados siempre automáticos, sin modo manual; dados de N caras permitidos al diseñar capacidades (T36) | Firma de Juan Luis del 2026-09-06 |
| El relato literario del diario va por frases prefabricadas elegidas de forma determinista (T39) | Firma del 2026-09-06; dos casas y el deshacer tienen que dar el mismo texto |
| Los nombres de monstruo se asignan en `crearPartida` con un generador derivado de la semilla (T42) | Si salieran de `Math.random()` las dos casas verían nombres distintos; el derivado no mueve el barajado ni las tiradas |
| «Más misiones» son T45 (catálogo, selector, medida) y una tarea por misión; la dificultad es la posición en el catálogo, medida, nunca un retoque de la IA | Firma del 2026-09-06: la dificultad se diseña por misión y el 100 % del calabozo está bien |
| «Más monstruos» son T49 (especies con números) y T50 (poderes que exigen motor) | Ningún efecto hostil llega hoy a un héroe; quitarle el turno a un niño no es lo mismo que a un goblin |
| La fase de red (T30–T34) no toca el motor: jugar en red es repartir la lista de acciones | El motor es determinista y `repetir` ya existía por el deshacer |

## Descartado — no volver a proponer

| Se descartó | Motivo |
|---|---|
| Guardar el registro de partida en un servicio (Pages, un pegado externo, el relevo) | Pages no ejecuta nada; el relevo espera firma; mandar datos fuera de casa es justo lo que la firma pendiente pregunta |
| Anotar en el registro «las casillas verdes» y cada cosa que pintó la pantalla | Es derivable: se recalcula al repetir. Guardarlo duplicaría la verdad y engordaría el fichero |
| Hacer T57 (o cualquier tarea) desde la sesión que coordina | Una sesión, una tarea; la coordinadora ya tiene el árbol principal y los ficheros de reparto |
| Quitar del todo la salida manual del turno de Zargon (T52) | T11 la puso para no depurar con niños delante; se esconde detrás de pausa/avería |
| Un botón nuevo para saltar el foso descubierto (T51) | Si el reglamento lo trae, la tirada la hace el motor dentro de `mover`; `TurnPanel.tsx` es de otra cadena |
| Fusionar la rama `worktree-nuevas-tareas-sep-06` (Haiku) | Solo tenía ocho filas sin ficha; sus números se respetaron |
| Empujar el reclamo desde el worktree con `git push origin HEAD:main` | Arrastraría a `main` los commits de código a medias |
| Firmar por Juan Luis una decisión que solo consta en una rama sin fusionar | Una firma cuenta cuando está en `autorizaciones.md` |
| Tres modos de dados (manual, automático, mixto) | Juan Luis decidió que siempre automático |
| Relato literario con un modelo de lenguaje | Lo decidió él: frases prefabricadas |
| Una sesión «coordinadora» vigilando el tablón | Lo regenera quien reclama y quien cierra |
| Túnel al portátil o navegador a navegador para la red; estado en el servidor; tapar la niebla por red; WebSocket | Descartes de la fase de red del 2026-09-05, con motivo en `_ESTADO-antiguo-2026-09-06.md` y en `tareas/T30-relevo-de-acciones.md` |

## Archivos

- `_ESTADO.md` — el tablón, vista derivada. `proyecto.md` — rutas, bandas, protocolo con
  worktrees, orden de cierre (con el hash al final), frase de arranque, decisiones.
  `autorizaciones.md` — firmas (19: las dos últimas transcritas el 2026-09-06 por esta
  sesión) y pendientes (3).
- `hechos/` — la verdad: `terminadas/`, `reclamos/`, `incidencias/` (cinco),
  `notas/s-20260906T103034-b376065f.md` (la migración) y
  `notas/s-20260906T141818-ff83f12c.md` (T51–T57 y por qué).
- `tareas/T36-…` a `tareas/T57-…` — las fichas nuevas; `tareas/_COMUN.md` — trampas, con
  la de vitest (T56), el hash tras el push y `npm run preview`.
- `_ESTADO-antiguo-2026-09-06.md` — el tablón viejo, histórico.
- `~/.claude/skills/reparto/` — la skill, con los cambios del 2026-09-06.

## Preferencias para este proyecto

- Frases de arranque: una por sesión, en bloque de cita, con banda y tarea o cadena
  puestas, para pegar sin editar.
- Al cerrar una tarea o entregar, decir cuántas sesiones caben a la vez **por ficheros**.
- Código con las herramientas de edición, nunca `sed -i` ni heredocs; `hechos/` desde el
  shell, con sid y hora del mismo comando; commits con rutas explícitas.
- Cuando Juan Luis cuenta un fallo visto en la página, la respuesta es una ficha con el
  diagnóstico medido en el código (qué línea, qué test lo fija) y su cita del reglamento
  si es regla, no un arreglo a ojo.

## Contexto que no está en los archivos

- Juan Luis abre varias sesiones a la vez y las titula con la tarea; el sid lo da cada una
  en su primer mensaje. Cuando una sesión le cuenta algo, él lo pega a la que coordina.
- Prueba la aplicación en <https://salasgar.github.io/Hero-Quest/> (se publica sola con
  cada `push` a `main`), no en local; los fallos que cuenta son de la versión publicada.
- Las sesiones se mandan mensajes entre sí (`SendMessage`) para resolver choques; el
  tablón no lo sabe.
- Las figuras de cartón las hace Juan Luis a mano: cada especie nueva es una figura que no
  existe, y no hay inventario escrito de cuántas hay por especie (T55 pregunta).
