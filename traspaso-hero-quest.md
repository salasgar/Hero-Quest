# Traspaso — HeroQuest

Actualizado: 2026-09-06 · Sesión que lo escribe: `s-20260906T103034-b376065f` (la que migró
el reparto al diseño actual de la skill `reparto` y escribió las tareas T36–T50)

## Objetivo

Una aplicación que hace de máster de HeroQuest sobre el tablero físico del salón, para
jugar con niños, con la posibilidad de que alguien juegue desde otra casa. El proyecto
grande está en `README.md` y `TRASPASO.md`. Lo que persigue la tanda de trabajo en curso
es el encargo de Juan Luis del 2026-09-06: dados siempre automáticos, iconos, monstruos
que deciden solos y huyen, diario en dos modos, todas las salas con puerta, ambientación,
nombres de monstruos, más misiones ordenadas por dificultad, más especies, y una lista de
mejoras para que él elija.

## Estado actual

**El estado de cada tarea está en `_ESTADO.md`, que es una vista derivada de `hechos/`**
(la verdad). Aquí solo lo que el tablón no recoge.

- El reparto se migró el 2026-09-06 al diseño actual de la skill: `hechos/`,
  `autorizaciones.md`, `proyecto.md`, tablón regenerable; el tablón viejo está en
  `_ESTADO-antiguo-2026-09-06.md`, intacto.
- 43 fichas (T1–T22, T30–T50). Cerradas y en `main` todas hasta T35 más la 11, la 40, la
  42 (`372a0f0`) y la 43. La 41 está en curso (caduca 18:55Z). Las demás, libres o
  bloqueadas según el tablón.
- Un arreglo de una línea sin dueño: `exclude: ['**/node_modules/**', '**/dist/**',
  '**/.claude/**']` en `vite.config.ts` (`test`), para que vitest no cuente los tests de los
  worktrees ajenos. Está en `tareas/_COMUN.md`, «Trampas del entorno».

## Siguiente paso

1. Abrir sesiones con **una frase por sesión**, cada una con su tarea o cadena dentro. La
   42 ya está en `main` (`372a0f0`, 13:15Z). Caben a la vez: **22+36** (MEDIO, encadenadas),
   **39** (MEDIO), **49** (MEDIO) y **48** (ALTO); después, **44** cuando cierre la 36 y
   **38** cuando cierre la 49; cuando cierre la 41, **37** (MEDIO) y **45** (ALTO).
2. Regenerar el tablón desde `hechos/` cada vez que una sesión cierre (las sesiones lo
   hacen; si lo encuentran reservado, avisan y lo hace quien coordina).
3. Asignar a alguien la línea de `vite.config.ts`.

Banda de modelo para retomar: **ALTO** — lo que viene es coordinar el reparto (regenerar
el tablón, resolver choques, escribir fichas nuevas cuando Juan Luis añada encargos), que
es criterio; las tareas en sí las hacen las sesiones con la banda de su ficha.

## Decisiones tomadas

| Decisión | Por qué |
|---|---|
| `hechos/` es la verdad; `_ESTADO.md` se regenera entero y no afirma nada que no salga de `hechos/`, las fichas, `autorizaciones.md` o `proyecto.md` | Con el tablón como verdad y diez sesiones, el candado del entorno lo tuvo reservado todo el día (2026-09-05) y el protocolo dejó de ejecutarse |
| Números de tarea en `hechos/`: dos cifras sin la T (`07--<sid>.md`) | Es lo que espera la skill (`NN--<sid>`); la equivalencia está en `proyecto.md` |
| Con un worktree por sesión, **el reclamo se abre y se empuja en el árbol principal antes de `EnterWorktree`**; latidos, terminada y `CERRADA` van a la copia del worktree y los publica la fusión en `main` | Cada worktree tiene su copia de `hechos/` y desde dentro no se puede escribir fuera: cuatro sesiones trabajaron sin un solo reclamo visible en `origin/main`, y tres reclamos de la 42 convivieron en tres copias. Lo propuso la sesión `s-20260906T124412-0cdb5d41` |
| **Una frase de arranque por sesión, con la tarea o la cadena dentro**; una sesión cuya frase nombra una cadena encadena por defecto | Cuatro sesiones MEDIO abiertas con la misma frase genérica eligieron cada una lo que quiso. Juan Luis no quiere editar frases. Está en la skill `reparto` (SKILL.md, plantillas, concurrencia.md) |
| Las bandas de T1–T12 se pusieron a posteriori, marcadas como tales | Juan Luis pidió que toda ficha lleve banda; estaban todas LISTA |
| Las 14 firmas del tablón viejo se transcribieron a `autorizaciones.md` con su fecha; las nuevas de Juan Luis en conversación se transcriben igual | Es lo que pidió al migrar, y el tablón no puede afirmar firmas |
| Dados siempre automáticos, sin modo manual; dados de N caras permitidos al diseñar capacidades (T36) | Firma de Juan Luis del 2026-09-06 |
| El relato literario del diario va por frases prefabricadas elegidas de forma determinista, sin modelo de lenguaje (T39) | Firma del 2026-09-06; dos casas y el deshacer tienen que dar el mismo texto |
| Los nombres de monstruo se asignan en `crearPartida` con el generador del estado (T42) | Si salieran de `Math.random()`, las dos casas en red verían nombres distintos sin error |
| «Más misiones» son T45 (catálogo, selector, medida con el simulador) y una tarea por misión (T46, T47, y T51 en adelante); la dificultad es la posición en el catálogo, medida, nunca un retoque de la IA | La misión estaba fijada a mano en cuatro sitios; Juan Luis firmó que la dificultad se diseña por misión y que el 100 % del calabozo está bien |
| «Más monstruos» son T49 (especies con números) y T50 (poderes que exigen motor); un poder sobre un héroe se le pregunta antes | Ningún efecto hostil llega hoy a un héroe; quitarle el turno a un niño no es lo mismo que a un goblin |
| La fase de red (T30–T34) no toca el motor: jugar en red es repartir la lista de acciones | El motor es determinista y `repetir` ya existía por el deshacer |

## Descartado — no volver a proponer

| Se descartó | Motivo |
|---|---|
| Fusionar la rama `worktree-nuevas-tareas-sep-06` (Haiku) | Solo tenía ocho filas en el tablón viejo sin ficha; sus números se respetaron al escribir T36–T43 |
| Empujar el reclamo desde el worktree con `git push origin HEAD:main` | Arrastraría a `main` los commits de código a medias de esa rama |
| Firmar por Juan Luis una decisión que solo consta en una rama sin fusionar | Una firma cuenta cuando está en `autorizaciones.md`; se esperó a que la rama llegara a `main` |
| Tres modos de dados (manual, automático, mixto) | Juan Luis decidió que siempre automático |
| Relato literario con un modelo de lenguaje | Lo decidió él: frases prefabricadas |
| Una sesión «coordinadora» vigilando el tablón | Lo regenera quien reclama y quien cierra; una sesión no ve dentro de otra |
| Túnel al portátil o navegador a navegador para la red; estado en el servidor; tapar la niebla por red; WebSocket | Descartes de la fase de red del 2026-09-05, con motivo en `_ESTADO-antiguo-2026-09-06.md` y en la cabecera de `tareas/T30-relevo-de-acciones.md` |

## Archivos

- `_ESTADO.md` — el tablón, vista derivada. `proyecto.md` — rutas, bandas, protocolo con
  worktrees, frase de arranque, decisiones. `autorizaciones.md` — firmas (17) y pendientes (3).
- `hechos/` — la verdad: `terminadas/`, `reclamos/`, `incidencias/` (cuatro ficheros, con lo
  que pasó el 2026-09-06), `notas/s-20260906T103034-b376065f.md` (lo decidido al migrar).
- `tareas/T36-…` a `tareas/T50-…` — las fichas nuevas; `tareas/_COMUN.md` — trampas, con
  la de vitest y el árbol compartido al cerrar.
- `_ESTADO-antiguo-2026-09-06.md` — el tablón viejo, con los registros largos de T1–T35.
- `~/.claude/skills/reparto/` — la skill, con los cambios del 2026-09-06 (frase por
  sesión, reclamo en el árbol principal).

## Preferencias para este proyecto

- Frases de arranque: una por sesión, en bloque de cita, con banda y tarea o cadena
  puestas, para pegar sin editar.
- Al cerrar una tarea o entregar, decir cuántas sesiones caben a la vez **por ficheros**,
  no solo por estado.
- Código con las herramientas de edición, nunca `sed -i` ni heredocs; `hechos/` desde el
  shell, con sid y hora del mismo comando; commits con rutas explícitas.

## Contexto que no está en los archivos

- Juan Luis abre varias sesiones a la vez y las titula con la tarea; el sid lo da cada una
  en su primer mensaje. Cuando una sesión le cuenta algo, él lo pega a la sesión que
  coordina.
- Las sesiones se mandan mensajes entre sí (`SendMessage`) y así resolvieron el triple
  reclamo de la 42; el tablón no lo sabe.
- Las figuras de cartón las hace Juan Luis a mano: cada especie nueva (troll, T49) es una
  figura que no existe todavía.
- `Letras Hero Quest.png` en la raíz, sin rastrear, es el logotipo para T41, que está en
  curso.
