# FICHA DEL PROYECTO — Hero-Quest

Este fichero **no se regenera nunca**. Guarda lo que el tablón no puede guardar, porque el
tablón se reescribe entero cada vez que se reclama o termina una tarea. Se escribió al migrar
el reparto al diseño actual de la skill `reparto` (2026-09-06, sesión
`s-20260906T103034-b376065f`) y solo cambia cuando cambia el reparto.

Qué es el proyecto y por qué está montado así: `TRASPASO.md`. Cómo se trabaja en el
repositorio (un worktree por sesión, commit por nombre): `CLAUDE.md`. Lo que toda tarea
necesita saber (verificación, trampas, estilo, prohibido): `tareas/_COMUN.md`.

## Dónde está cada cosa

| Qué | Ruta exacta | Quién llega |
|---|---|---|
| Tablón (vista derivada) | `/Users/salasgar/Documents/git/Hero-Quest/_ESTADO.md` | todas |
| Hechos (la fuente de verdad) | `/Users/salasgar/Documents/git/Hero-Quest/hechos/` | **todas, obligatoriamente** |
| Fichas de tarea | `/Users/salasgar/Documents/git/Hero-Quest/tareas/T<N>-<nombre>.md` | todas |
| Salidas | no hay carpeta: la salida de cada tarea es **código del propio repositorio**, en los ficheros que su ficha declara en «Ficheros que toca» | |
| Papelera | `/Users/salasgar/Documents/git/Hero-Quest/_papelera/` (no existe todavía; se crea el día que haga falta «borrar» algo) | la vacía Juan Luis a mano |
| Autorizaciones | `/Users/salasgar/Documents/git/Hero-Quest/autorizaciones.md` | las firma Juan Luis a mano |
| Tablón antiguo (histórico, ya no es verdad) | `/Users/salasgar/Documents/git/Hero-Quest/_ESTADO-antiguo-2026-09-06.md` | solo lectura |

`hechos/` está en el disco, dentro del repositorio, porque todas las sesiones son atendidas
y el repositorio es lo único que todas comparten. **No puede haber dos.** Cada subcarpeta
lleva un `.gitkeep` para que exista tras un clon: no es un rastro, se ignora al listar.

**Los números de tarea en `hechos/` son los de las fichas, a dos cifras y sin la T**: la T7
es `07--<sid>.md`, la T13 es `13--<sid>.md`, la T35 es `35--<sid>.md`. La numeración salta
de T22 a T30 a propósito (abajo, en decisiones).

Renombrar ficheros en este sitio: **sí**, comprobado con un fichero de prueba el 2026-09-06.
Un fichero terminado lleva **siempre** su marcador `<nombre>.ok-<sid>` cuando la tarea
produce ficheros de datos; en este proyecto la salida es código y el marcador equivalente es
**el commit con su hash**, que va en la terminada.

Sesiones en **un solo dispositivo** (el Mac de Juan Luis). Carpeta **sincronizada con iCloud**
(`~/Documents` con «Escritorio y Documentos» activo), pero como todas las sesiones leen el
mismo disco la espera del reclamo es **`sleep 30`**; `sleep 120` solo si algún día hay
sesiones en más de un dispositivo. Ficheros del corpus solo en la nube (`cloudOnly`): ninguno
conocido; el repositorio se usa a diario y `git status` estaba limpio el 2026-09-06.

Dónde corren las operaciones largas: **en el propio Mac, desde el Bash de Claude Code**, que
sobrevive a la llamada y admite segundo plano. `tareas/_COMUN.md` dice cómo encadenar
`vitest` y `typecheck` en segundo plano y esperar con un bucle; late en tu reclamo cada 10-15
minutos mientras dure. El Mac se satura con carga por encima de 12 y entonces los tests pasan
de segundos a minutos: no lances dos baterías a la vez.

Candados de fichero del entorno: **sí, un hook** (`~/.claude/hooks/sesiones.sh`, copia en
`scripts/hooks/`) que reserva cada fichero al editarlo con `Edit`, `Write` o `NotebookEdit`
durante **30 min** sin actividad (`CLAUDE_SESIONES_TTL_MIN`), **solo entre sesiones del mismo
árbol de trabajo**: dos sesiones en worktrees distintos no se bloquean. Solo vigila las
herramientas de edición, no el shell. Con el protocolo bien seguido no contiende: los
ficheros de `hechos/` tienen un solo escritor y se escriben desde el shell a propósito, para
que sid y hora salgan del mismo comando. Si el tablón está reservado cuando te toque
regenerarlo, no se espera: latido «tablón reservado por <quien sea>, no regenerado» en tu
reclamo, y se regenera cuando se pueda (`concurrencia.md`, «Candados externos»). **El código
se edita con las herramientas de edición, nunca con `sed -i` ni heredocs**: es la disciplina
del repositorio (`tareas/_COMUN.md`) y cada ficha la repite en «Prohibido».

Repositorio git: **sí** (`https://github.com/salasgar/Hero-Quest`, rama `main`). Cada ficha
declara los ficheros que toca y dos tareas que compartan uno no van en paralelo. **Un
worktree por sesión** si hay otra sesión viva (`CLAUDE.md`: `EnterWorktree` y enlazar
`node_modules`); `hechos/` es común porque vive en git y se fusiona sin conflicto (un
escritor por fichero). `add` nunca separado de `commit`: `git commit -m "…" -- ruta1 ruta2`.
Orden de cierre: pruebas en verde (`npx vitest run` y `npm run typecheck`) → commit del
código, solo los ficheros de la ficha (sale el hash) → terminada con el hash, `CERRADA`,
incidencias, tablón y trampas en la ficha → un commit con rutas explícitas (tus `hechos/` por
sid, `_ESTADO.md`, la ficha) → `push`; si el `push` se rechaza, se trae lo de los demás, se
**regenera** `_ESTADO.md` otra vez desde `hechos/` y se vuelve a comitear. Tope de procesos:
ninguno fijado; si alguna ficha lo fija, se anota en `hechos/recursos/<sid>.md`.

## Bandas de modelo

Cada tarea lleva una banda —ALTO, MEDIO o BAJO— que dice con qué modelo conviene abrirla.
Aquí queda a qué corresponde cada banda **en el menú del día en que se migró el reparto**.
Se escribe una vez, aquí y en ningún otro sitio; cuando cambie la gama, se corrige esta
tabla y no los ficheros de tarea.

| Banda | Modelo en el menú | Para qué |
|---|---|---|
| ALTO | Fable 5.1 (o Opus 5, si Fable no está en el menú) | Criterio, ambigüedad, cambiar la forma del estado, lo que firma Juan Luis |
| MEDIO | Sonnet 5 | Conectar lo ya escrito, pantalla, revisar, corregir, programar |
| BAJO | Haiku 4.5 | Inventariar, extraer, convertir, recuentos (hoy no hay ninguna tarea de esta banda) |

Comprobado el 2026-09-06. Si el menú ya no tiene estos nombres, quédate con la posición:
ALTO es el más capaz que haya, BAJO el más rápido, MEDIO el de en medio.

## Automatismos activos

**Ninguno, y es a propósito.** Todas las tareas son de escribir código y piden criterio; no
hay nada reversible y aburrido que programar, y en este entorno no están las herramientas de
programación remota. Si algún día se crea uno: frecuencia < duración esperada < caducidad del
reclamo, modelo fijado al crearlo según la banda de la tarea, y fila aquí.

| Tarea programada | Cuándo | Qué hace | Duración esperada | Caducidad | Modelo | Id |
|---|---|---|---|---|---|---|

## Frase de arranque para una sesión nueva

Esto es lo que Juan Luis pega al abrir una sesión. Sin ello, la sesión nueva no sabe que
hay un protocolo y se salta el reclamo entero:

> Trabaja en el reparto de `/Users/salasgar/Documents/git/Hero-Quest`. He abierto esta sesión
> con un modelo de banda ALTO / MEDIO / BAJO —deja solo la que sea—. Lee `proyecto.md` y
> `_ESTADO.md`, lista la carpeta `hechos/` que indica la ficha, reclama una tarea libre de esa
> banda siguiendo el protocolo del tablón, dime en tu primer mensaje cuál has cogido y con qué
> identificador de sesión, y sigue con ella hasta cerrarla o soltarla sin esperar
> confirmación.

La banda va en la frase porque **una sesión no puede saber en qué modelo corre**. Sin ese
dato, una sesión abierta con el modelo rápido puede reclamar la tarea que exigía criterio,
y eso no falla de golpe: sale mediocre y no se nota hasta mucho después.

El «sigue con ella» va en la frase porque una sesión que la lee como «dime cuál has
cogido» termina el turno ahí, con el reclamo vivo, y en el tablón no se distingue de una
que trabaja. El «o soltarla» es para que una que descubre una tarea mal cortada, o se
agota, no lo lea como orden de terminar a toda costa.

Para coger una tarea MAL CORTADA que Juan Luis haya decidido tratar como larga, la frase la
nombra: «… reclama la tarea NN, que está MAL CORTADA y se continúa como larga …».

Conviene poner a cada sesión un título con la tarea que coge: la app no muestra el sid, y
encontrar después qué conversación hizo qué cuesta minutos.

En cada sesión nueva hay que volver a dar permiso sobre la carpeta: los permisos duran lo
que dura la sesión.

## Decisiones de reparto que conviene no rediscutir

- **La numeración salta de T22 a T30 y no se rellena.** Las cinco tareas de la fase de red
  (T30–T34) se escribieron el 2026-09-05 a la vez que otra sesión reclamaba T19–T22 para
  cuatro tareas de reglas; se renumeró el bloque de red y se dejó hueco. Las tareas nuevas se
  añaden al final (la siguiente es la T36); nunca se renumera.
- **T15 (el libro de hechizos) está aparcada por decisión de Juan Luis del 2026-09-05**: «no
  lo tiene claro y de momento no se haga nada de eso». No espera firmas, espera a que él
  decida si quiere la regla; sus cuatro preguntas están en `autorizaciones.md` con la firma
  vacía, y por eso el tablón la pinta BLOQUEADA. No la coja nadie por banda.
- **T22 va la última de las cuatro del 5 de septiembre por decisión suya**, pero su
  precondición (`src/ui/Instrucciones.tsx` en `main`) ya se cumple desde `b47310f`: hoy es
  cogible.
- **T1–T12 se escribieron sin banda** y el tablón viejo no se la puso «por no inventarla».
  En la migración del 2026-09-06 Juan Luis pidió que toda ficha lleve banda, duración
  esperada, «Encadenable con» y «Ficheros que toca»; se pusieron a posteriori y así lo dice
  cada ficha. Están todas LISTA, así que no cambian lo que nadie vaya a hacer.
- **T16 se da por hecha en dos commits** (`56f5f21` y `d3d01e1`): la tabla vieja la dejó «en
  curso» cuando git ya tenía el segundo. Está razonado en `hechos/incidencias/`.
- **Encadenables: T11 y T22**, las dos MEDIO y las dos cortas. Comparten `TurnPanel.tsx`, así
  que **no van en paralelo**: una sesión MEDIO las hace seguidas, o dos sesiones de una en una.
- **El reparto de la fase de red no toca el motor** (`src/engine/`): jugar en red es repartir
  la lista de acciones, no sincronizar el estado. Quien escriba una tarea de red que toque el
  motor tiene que explicar por qué.
- **`reducer.ts` es el cuello de botella** del reparto de reglas: cualquier tarea nueva que lo
  toque va de una en una con las demás que lo toquen, y la ficha lo declara.
- **El número de tests no se escribe en ningún fichero fijo** (ya mintió tres veces); se mide
  con `npx vitest run` al empezar y al terminar cada tarea.
- **T36 a T44 salen del encargo de Juan Luis del 2026-09-06** (ocho puntos), escritas por
  la sesión `s-20260906T103034-b376065f` el mismo día. Su punto 6 (ambientación) se partió
  en T41 (imágenes) y T44 (sonidos); los iconos son T37. Su punto 1 cambió al preguntarle:
  ya no hay tres modos de dados, la aplicación los tira siempre (T36, firmado). Su punto 3
  se reparte entre T11 (verlo despacio) y T38 (huir). Una sesión de banda BAJO había dejado
  ocho filas T36–T43 en el tablón viejo, en la rama `worktree-nuevas-tareas-sep-06`, sin
  fichas: esos números se respetan, esa rama no se fusiona y se puede borrar.
- **Orden por ficheros compartidos entre las nuevas**: `types.ts` y `partida.ts` los tocan
  T42, T37 y T38, en ese orden; `TurnPanel.tsx`, T11, T22 y T36; `EleccionDeHeroes.tsx` y
  `estilos.css`, T37 y T41; `App.tsx`, T41 y T43; `Juego.tsx`, T11, T36 y T44. Está en cada
  ficha y en el tablón.
- **El tablón viejo se conserva renombrado** (`_ESTADO-antiguo-2026-09-06.md`) para que los
  rastros que lo citan —commits, fichas, TRASPASO.md— sigan teniendo a dónde apuntar. Todo lo
  que decía de estado se ha derivado a `hechos/`; lo que decía de firmas, a
  `autorizaciones.md`. No se edita ni se regenera.
