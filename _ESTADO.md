# TABLÓN DE ESTADO — Hero-Quest

**VISTA DERIVADA. No se edita a mano y no es la fuente de verdad.** La verdad está en la
carpeta `hechos/`: un fichero por hecho, cada uno con el identificador de la sesión que
lo escribió en el nombre. Si la tabla de abajo contradice a `hechos/`, gana `hechos/` y
este tablón hay que regenerarlo entero. Reclamar una tarea **no** es escribir aquí: es
escribir un fichero propio en `hechos/reclamos/`; si este fichero está reservado por
otra sesión cuando te toque regenerarlo, no esperes —tu reclamo ya vale— y regenera
cuando puedas. Este párrafo se copia tal cual en cada regeneración.

Ficha del proyecto —rutas, automatismos, frase de arranque—: `proyecto.md`
Autorizaciones firmadas: `autorizaciones.md`
Ninguno de los dos se regenera nunca; este fichero sí, entero.

El tablón anterior a la migración del 2026-09-06, que era «la fuente de verdad» con otro
protocolo, está en `_ESTADO-antiguo-2026-09-06.md`: es histórico, no se edita y ya no dice
el estado de nada. Los números de tarea en `hechos/` son los de las fichas, a dos cifras y
sin la T (la T7 es `07--<sid>.md`).

Regenerado: 2026-09-08T22:32:29Z · por la sesión `s-20260908T221052-03a6e80b` (`HQ T69
(MEDIO)`), al cerrar la 69. Sobre la regeneración de las 22:30Z (`s-20260908T221002-5f16cc16`,
al cerrar la 70) cambia **una fila**: la **69 pasa a LISTA**, pendiente del hash de
`origin/main` (se añade en un commit aparte cuando entre el `push`, como hizo la 70). 725
tests / 45 ficheros, `npm run typecheck` y `npm run build` en verde; un intento intermedio
dio `tests/temperamento.test.ts` en rojo por `Test timed out in 5000ms` con la carga del Mac
en 26-30 (varias sesiones a la vez), repetido con `--testTimeout=30000` en verde: la trampa
de carga de `_COMUN.md`, no una regresión. Nadie tiene reclamo vivo sobre `App.tsx`,
`EleccionDeHeroes.tsx` ni `usePartida.ts` aparte de esta tarea, que ya cierra: 37, 45 y 57
(LISTA desde antes) no chocan. **Nota para quien siga**: el primer intento de esta tarea
tocó `Juego.tsx` para pasarle la partida a continuar, sin que la ficha lo declare y con T70
reclamándolo en vivo en ese momento; se deshizo entero (`git checkout HEAD~1 -- src/ui/Juego.tsx`)
y se resolvió con un contexto de React (`ContinuarContext`, en `usePartida.ts`) que `App.tsx`
provee alrededor de `<Juego>` sin que ese fichero cambie ni una línea — razonado en la
terminada. 47 y 73 siguen EN CURSO, como dejó la regeneración anterior.

Regenerado: 2026-09-08 22:30Z · por la sesión `s-20260908T221002-5f16cc16` (`HQ T70
(MEDIO)`), al cerrar la 70. Sobre la regeneración de las 22:18Z (`s-20260908T221009-8416a271`,
al cerrar la 75) cambia **una fila**: la **70 pasa a LISTA**, `91a99ed` en `origin/main`
(715 tests / 45 ficheros, typecheck 0; el rebase sobre la 75 subió a 719/45, comprobado de
nuevo con `--testTimeout=30000` tras un par de `timeout` de carga de máquina —load average
15,7— que no eran fallos reales). Nadie tiene reclamo vivo sobre `BoardMirror.tsx` aparte
de esta tarea, que ya cierra: 51, 58 y 37 (LISTA desde antes) no chocan. 47 y 73 siguen EN
CURSO, como dejó la regeneración anterior.

Regenerado: 2026-09-08 22:18Z · por la sesión `s-20260908T221009-8416a271` (`HQ T75
(ALTO)`), al cerrar la 75. Sobre la regeneración de las 22:11Z (`s-20260908T221052-03a6e80b`,
al reclamar la 69) cambian **cuatro filas**: la **75 pasa a LISTA** y la **47, la 70 y la
73 pasan a EN CURSO** (sus reclamos se abrieron entre las 22:10Z y las 22:11Z con el tablón
reservado por la coordinadora, y ninguna lo regeneró: 47 caduca 2026-09-09T04:11:16Z, 70
caduca 02:10:02Z, 73 caduca 02:11:05Z). La 75 se cierra **sin cambiar ninguna regla**: el
reglamento (p. 11 «On a Hero's Turn», p. 12 «Looking and Opening Doors») dice que abrir una
puerta no es una de las seis acciones y se hace «while you are moving», y que lo único que
parte el movimiento es una acción; mover, abrir y seguir andando —hacia dentro o hacia otro
lado— es un solo movimiento acotado por la tirada, que es lo que el motor ya hacía. Se
documenta en `abrirPuerta` y se fijan cuatro tests (719 / 45). Lo que Juan Luis vio es el
libro funcionando; si quiere otra cosa es **regla de la casa con firma**, y las opciones
están en la terminada (`hechos/terminadas/75--s-20260908T221009-8416a271.md`). Con la 75
cerrada **ya no hay nadie vivo sobre `reducer.ts`**: la **71** y la **50** quedan libres
para cogerse (no a la vez entre ellas). Libres también: 67 (BAJO), 68, 72 (44 LISTA) y 74.

Regenerado: 2026-09-08 22:11Z · por la sesión `s-20260908T221052-03a6e80b` (`HQ T69`), al
reclamar la 69. Sobre la regeneración de las 21:41Z (`s-20260908T213701-6e4fc379`) cambia
**una fila**: la **69 pasa a EN CURSO** (este reclamo, caduca 2026-09-09T04:10:52Z; su
precondición, 57 LISTA, se cumplía ya). Nada más cambia: 37 y 45 siguen LISTA, así que no
hay nadie vivo sobre `App.tsx`, `EleccionDeHeroes.tsx` ni `usePartida.ts` aparte de esta
tarea.

Regenerado: 2026-09-08 21:41Z · por la sesión coordinadora `s-20260908T213701-6e4fc379`
(`HQ Coordinadora T67-T75`), al comitear las fichas T67-T74. Sobre la regeneración de las
21:34Z (`s-20260908T200901-6afd10ed`, al escribir T75) cambian **ocho filas nuevas**: la
**67 a la 74 pasan a PENDIENTE**, ya en la tabla con sus condiciones tal como las escribió
`hero-quest-38` (`hechos/notas/s-20260908T213701-6e4fc379.md`). Ninguna código tocado por
esta sesión; `src/ui/TurnPanel.tsx` sigue modificado sin comitear, es de `hero-quest-38` y
no es parte de este cierre. Quedan libres, sin espera de fichero entre sí: **67** (BAJO),
**68**, **70**, **71**, **72** (44 LISTA), **73** (45 LISTA) y **74**; **69** espera a
ninguna precondición viva (57 ya está LISTA) así que también está libre. **71 y 75**
comparten `reducer.ts` y no van a la vez (razonado arriba, en la tabla). Nada de esto toca
la fila 47 ni la 50, que siguen PENDIENTE como antes.

Regenerado: 2026-09-07 23:21Z · por la sesión `s-20260907T223315-1bad2508`, al cerrar la 66.
Sobre la regeneración de las 21:54Z (`s-20260907T211731-6bdd85b1`, al cerrar la 46) cambia
**una fila**: la **66 pasa a LISTA**. Se arregló `avanzarActor` (salta a los héroes con
cuerpo 0) y, más allá de lo que decía la ficha, se encontró que dos cosas más podían matar
al propio actor sin cerrarle el turno (una carta de tesoro «peligro» y un bloque en
`mover`): cerrado en `terminar()`, razonado en la terminada y en la ficha. Con esto queda
resuelto el aviso que dejó la 46: **el simulador ya está remedido sin el fallo dentro**, y
el número cambia mucho en una misión. Tabla completa (100 partidas por nivel,
semillas 1000…1099):

    nivel  misión                        torpe  normal  astuto
    1  calabozo   antes (con el fallo)     100 %    99 %   100 %
    1  calabozo   después                   98 %   100 %   100 %
    2  torreón    antes (con el fallo)      87 %    89 %    92 %
    2  torreón    después                   58 %    55 %    54 %

El calabozo no se mueve más allá del ruido de la muestra; el torreón cae unos 34 puntos en
`normal`, porque ahí es donde un héroe caído seguía golpeando al guerrero del Caos en vez
de quedarse fuera. El orden del catálogo no cambia (calabozo sigue muy por delante), así
que no hace falta tocar `quests/index.ts` — pero la caída es grande y **alguien debería
revisar si el torreón sigue siendo el segundo escalón que se quería** para la progresión;
no lo decide esta tarea (firma de T45). Terminada en
`hechos/terminadas/66--s-20260907T223315-1bad2508.md`; detalle en la ficha, «Trampas
conocidas». La 50 (ALTO, compartía `reducer.ts`/`types.ts` y no iba a la vez) sigue
**PENDIENTE**, libre para cogerse: ya no hay nada vivo sobre el motor.

Regenerado: 2026-09-07 21:54Z · por la sesión `s-20260907T211731-6bdd85b1` (hero-quest-1b),
al cerrar la 46. Sobre la regeneración de las 21:27Z (`s-20260907T211150-b4152f09`, al
cerrar la 37) y la ficha T66 que la coordinadora añadió después (`e7b6d81`, fila 66 ya en la
tabla) cambian **dos filas**: la **46 pasa a LISTA** (`quests/torreon.ts`, `da728ea`,
comprobado en `origin/main` tras el push) y la **47 pasa a PENDIENTE** (su precondición, 46 LISTA, se cumple). Quedan
libres la **50** (ALTO), la **66** (MEDIO) y la **47** (MEDIO); 50 y 66 comparten
`reducer.ts` y no van a la vez. **Aviso que viene de la 46:** todos los porcentajes de
`npm run sim` (calabozo y torreón) están medidos con el fallo de la 66 dentro —un héroe a 0
sigue jugando—; la comparación entre misiones vale, los números absolutos no, y al cerrar
la 66 hay que remedir (lo dice su ficha). Incidencia:
`hechos/incidencias/s-20260907T211731-6bdd85b1.md`.

Regenerado: 2026-09-07 21:27Z (hash `9931043` añadido a las 21:30Z tras entrar el `push`) ·
por la sesión
`s-20260907T211150-b4152f09` (hero-quest-55), al cerrar la 37. Sobre la regeneración de las
21:22Z (`s-20260907T205835-39ec5559`, al cerrar la 61) cambia **una fila**: la **37 pasa a
LISTA**. Efecto en la 50: ya no espera a nadie por fichero (61 y 37, las dos que
declaraban `narrator/local.ts` y `types.ts`, están cerradas) — queda libre, junto con la
46 (EN CURSO). Con esto, de las cinco sesiones que cayeron a las 20:50Z, las cinco tareas
(37, 45, 61, 63, 64+65) están LISTA: la incidencia queda resuelta del todo.

Regenerado: 2026-09-07 21:22Z · por la sesión `s-20260907T205835-39ec5559`, al cerrar la 61
(`d4a5a01`). Sobre la regeneración de las 21:19Z (`s-20260907T211731-6bdd85b1`, al reclamar
la 46) cambia **una fila**: la **61 pasa a LISTA**. Efecto en la 50: ya no espera a la 61 en
`narrator/local.ts`, pero sigue **PENDIENTE** porque la 37 (EN CURSO) sigue declarando
`types.ts`. Revisando el informe y el relato salió más gramática rota de la que parecía a
primera vista —una veintena de plantillas del relato con preposiciones dobles o
equivocadas—, razonado entero en la terminada.

Regenerado: 2026-09-07 21:19Z · por la sesión `s-20260907T211731-6bdd85b1`, al reclamar la 46.
Sobre la regeneración de las 21:14Z (`s-20260907T205502-6241d5c8`, al cerrar la 65) cambia
**una fila**: la **46 pasa a EN CURSO** (este reclamo, caduca 2026-09-08T05:17:31Z; la
sesión que cerró la 63 encadena en verde, única tarea libre de su banda sin espera de
fichero). Queda libre solo la **50** (ALTO), con las esperas de fichero de abajo.

Regenerado: 2026-09-07 21:14Z · por la sesión `s-20260907T205502-6241d5c8`, al cerrar la 65.
Sobre la regeneración de las 21:10Z (`s-20260907T205335-e738c893`, al cerrar la 45) cambian
**tres filas**: la **65 pasa a LISTA** (este cierre, `TurnPanel.tsx`, `b3c7995`), la **37
cambia de reclamo** (`s-20260907T211150-b4152f09` la relevó a las 21:11:50Z
con `releva a: s-20260907T204516-bef22ac6`, caduca 2026-09-08T03:11:50Z; ya no queda
ninguna huérfana de la caída) y la **50 pasa a PENDIENTE**: su ficha pide 49 y 42 LISTA y
nada vivo sobre `reducer.ts`, y las tres cosas se cumplen desde ayer (`fb40fb1`, `372a0f0`;
51, 53 y 54 cerradas; 37 y 61 no tocan `reducer.ts`), así que el «BLOQUEADA (49)» que
venía arrastrándose desde la migración estaba caducado. Libres: **46** (ALTO) y **50**
(ALTO); **no van a la vez con cualquiera**: la 50 toca `types.ts`, que la 37 declara, y
`narrator/local.ts`, que la 61 declara, así que quien la coja espera a esas dos o lo pacta
con ellas. La 47 sigue BLOQUEADA por la 46. El registro de finalizaciones recupera la línea
de la 45, que la regeneración de las 21:10Z no llegó a añadir.

Con más de una misión, **`npm run sim` sin argumentos recorre el catálogo entero** y saca la
tabla que define «ordenada por dificultad»; esa tabla va en la terminada de cada misión
nueva. La 45 tocó además `App.tsx`, `EntrarEnPartida.tsx` y `repetir.ts` (fuera de su
ficha, sin reclamo vivo de nadie; razonado en `hechos/incidencias/s-20260907T205335-e738c893.md`).

**Resumen de la caída de las 20:50Z**, para quien no la haya visto: las cinco sesiones
abiertas entre las 20:44 y las 20:46Z (37, 45, 61, 63 y 64) se cortaron a la vez hacia esa
hora, con sus reclamos vivos en `origin/main`. La 63 ya tenía el código y la terminada
commiteados en su worktree; se cerró del todo por `s-20260907T205459-25b4f867`. La 45 la
retomó `s-20260907T205335-e738c893`, la 64 `s-20260907T205502-6241d5c8` (ya cerrada) y la
61 `s-20260907T205835-39ec5559`; las tres con un latido «reabierta como…» o `releva a:` en
su reclamo. Solo la 37 sigue huérfana a esta hora. Escribir en un reclamo ajeno se sale
del «un fichero, un escritor»; está razonado en
`hechos/incidencias/s-20260907T205502-6241d5c8.md`.

El reclamo de la 62 **estuvo caducado mientras se cerraba la tarea** (caducaba a las
18:50Z y se cerró a las 20:45Z, sin latido en medio). Nadie la relevó —ningún reclamo
nombra ese sid en un `releva a:`—, así que no hay trabajo duplicado; queda anotado en el
propio reclamo, que es donde se mira.

La 59 sustituyó el logotipo grande de T41 por la portada nueva en
`EleccionDeHeroes.tsx`, en vez de poner las dos imágenes juntas como preveía su ficha:
razonado en `hechos/incidencias/s-20260907T140727-559d19ac.md`, porque la imagen resultó
traer ya pintado el rótulo «Hero Quest», no ser una escena aparte.

## Antes de hacer nada

0. Lee `proyecto.md`: ahí están las rutas —dónde está `hechos/`, dónde van las salidas—
   y si aquí se pueden renombrar ficheros. Sin eso, lo demás no se puede ejecutar. Y lee
   `CLAUDE.md`: si hay otra sesión viva, **un worktree por sesión** antes de tocar nada.
1. Lee este fichero entero.
2. **Lista `hechos/reclamos/`, `hechos/terminadas/`, `hechos/reabiertas/`,
   `hechos/sustituidas/` y `hechos/fallos/`**, y compáralo con `git log`. Resuelve lo que no
   cuadre antes de coger tarea. Cuando haya varios rastros de una misma tarea, gana el
   más reciente por su fecha interna. Si existe `hechos/consolidado/`, su fichero más
   reciente te ahorra releer lo que enumera —tras comprobar que el disco no tiene nada
   fuera de su lista y que las carpetas que da por vacías lo están—, pero
   `hechos/reclamos/` se lee entero siempre: los reclamos cambian por dentro. Los
   recuentos y los hashes de una tarea que vayas a usar se leen de `hechos/terminadas/`
   o de `git log`, nunca de este tablón.
3. Mira la hora de verdad: `date -u`. Suponerla es lo que hace que se releven tareas
   vivas. Y toda hora que escribas —latido, `caduca:`, cierre— la genera el propio
   comando con `$(date -u …)`; nunca la tecleas.
4. Genera tu identificador de sesión **en el mismo comando que escribe tu reclamo** y no
   lo cambies:
   `sid="s-$(date -u +%Y%m%dT%H%M%S)-$(head -c4 /dev/urandom | od -An -tx1 | tr -d ' \n')"`
   Nada de `$RANDOM`: solo existe en bash, y en un `sh` POSIX se expande a vacío sin
   error — dos sesiones del mismo minuto acabarían con el mismo sid y escribiendo los
   mismos ficheros. A partir de ahí tu sid es el del nombre de tu reclamo: léelo de ahí,
   nunca de un fichero de nombre fijo como `/tmp/sid.txt` — otra sesión de esta máquina
   elige el mismo nombre y os intercambiáis el sid.
5. Reclama tu tarea —**la que te nombre la frase de arranque**, si nombra una— **desde el
   árbol principal y antes de entrar en tu worktree**: desde dentro no se puede escribir
   fuera, y un reclamo en la copia de un worktree no lo ve nadie. En
   `/Users/salasgar/Documents/git/Hero-Quest`: crea el reclamo, `git commit -m "Reclamo
   NN" -- hechos/reclamos/NN--<sid>.md && git push origin main`, después `sleep 30 && git
   fetch origin && git ls-tree --name-only origin/main hechos/reclamos/` —el comando, no
   la intención; nunca un `ls` de una copia— y cede si otra sesión llegó antes (si el
   `push` se rechaza, `git pull --rebase` y otra vez). Solo entonces `EnterWorktree`. Los
   latidos, `CERRADA` y la terminada van a la copia de tu worktree y los publica **la
   fusión de tu rama en `main`, que es parte del cierre**. Todas las sesiones están en el
   mismo Mac, así que `sleep 30` basta aunque la carpeta esté en iCloud (`proyecto.md`).
6. Si ganas, **regenera este tablón entero** —todas las filas contra `hechos/` y la hora
   real, no solo la tuya— antes de empezar: es lo que Juan Luis mira para abrir
   sesiones, y si dijera «libre» de una tarea cogida abriría una sesión para nada. Y
   **sigue con la tarea hasta cerrarla o soltarla; no termines el turno para pedir
   confirmación**: una sesión que para tras reclamar es indistinguible en este tablón de
   una que trabaja. Si no hay tarea libre de tu banda, dilo —qué está vivo y cuándo
   caduca— y para; no te quedes sondeando.

El protocolo completo está en la skill `reparto`, fichero `referencias/concurrencia.md`.
Si no lo tienes a mano, lo esencial es esto: cada sesión escribe únicamente ficheros que
llevan su identificador en el nombre, nadie edita el fichero de nadie, y este tablón se
regenera a partir de los demás.

## Reglas de operación

0. **Coge una tarea que encaje con el modelo con el que te han abierto.** Una sesión no
   puede saber en qué modelo corre: lo dice Juan Luis en la frase de arranque. Si dice
   banda MEDIO, coge una tarea de banda MEDIO y no la de decidir la estructura; si no dice
   nada, pregúntaselo en una línea antes de reclamar nada, salvo que todas las tareas
   libres sean de la misma banda. Una tarea de banda ALTA hecha con el modelo rápido sale
   cara: no falla de golpe, sale mediocre y nadie lo nota hasta mucho después.
1. **Una sesión, una tarea, reclamada.** El reclamo se abre en
   `hechos/reclamos/NN--<sid>.md` con un campo `caduca:` ya calculado (`2 ×` la duración
   esperada, mínimo 45 minutos). Después, `sleep 30` y volver a listar: si hay otro
   reclamo vivo de la misma tarea, sigue el de apertura más antigua y, si empatan, el de
   identificador menor alfabéticamente. El que pierde escribe `CEDIDA` y elige otra
   tarea.
2. **Un reclamo está vivo** si su último `caduca:` está en el futuro, no tiene línea de
   cierre (`CEDIDA`, `CERRADA`, `ABANDONADA`) y ningún reclamo —esté como esté— lo nombra en un
   `releva a:`. Un reclamo caducado es **relevable** (así lo pinta la tabla): se toma
   abriendo el tuyo con la línea `releva a: <sid anterior>`, y eso anula al anterior
   aunque reviva. Sin esa línea, si el anterior revive y estira su caducidad, el suyo es
   el más antiguo y gana. El relevo se escribe **solo en tu reclamo**; el del caído no
   cambia ni una línea, y que no diga que fue relevado es normal. Un reclamo con tu sid
   que no recuerdas haber escrito no es tuyo: ciérralo con `ABANDONADA (no es mío)` y
   no lo uses. Y un fichero con tu contenido y sid ajeno no lo edites: incidencia, sid
   nuevo, reclamo nuevo.
3. **Estira la caducidad antes de una operación larga**, y late mientras dura: la
   operación corre en segundo plano y tú, desde un bucle, esperas de diez a quince
   minutos, lates y vuelves a esperar. Esperar también es una operación larga: si te
   quedas a la espera de una batería de pruebas o de una firma, estira antes de esperar y
   late en cada comprobación diciendo qué esperas y cuánto. Y **cualquier pausa cuenta
   como operación larga** —un turno terminado, un «Continúa» tras un rato parada—: antes
   de escribir nada después, `date -u`, tu reclamo, y tu sid en las líneas `releva a:` de
   `hechos/reclamos/`; si te han relevado, `ABANDONADA (relevado)` y no toques el código.
4. **Cada sesión escribe solo lo suyo.** Ningún fichero tiene dos escritores. Nada de
   editar el reclamo, el fichero de cierre ni el código que otra sesión tiene reclamado.
   **Y a un fichero de `hechos/` solo se añade (`>>`), nunca se reescribe**: un reclamo
   reescrito pierde los latidos y caducidades que ordenan quién gana. Los ficheros de
   `hechos/` se escriben desde el shell a propósito (sid y hora del mismo comando); **el
   código, con las herramientas de edición**, nunca con `sed -i` ni heredocs
   (`tareas/_COMUN.md`).
5. **Una tarea, unos ficheros declarados, un dueño.** La ficha dice qué ficheros toca; las
   demás tareas los leen y no los escriben. Dos tareas que compartan un fichero no van en
   paralelo. El marcador de «terminado» de este proyecto es el commit con su hash, que va
   en la terminada.
6. **Idempotencia obligatoria.** Toda tarea debe poder repetirse sin duplicar ni romper
   nada. Antes de actuar, comprueba qué hay hecho ya (cada ficha dice cómo, en «mira si ya
   está hecho») y continúa desde ahí. Nunca des por supuesto que empiezas de cero.
7. **Los datos van al repositorio y se empujan.** Lo que no está en `origin/main` no
   existe: los worktrees y los contenedores se borran.
8. **Nada destructivo ni irreversible sin firma de Juan Luis en `autorizaciones.md`.**
   Ninguna sesión puede autorizarse a sí misma, y ninguna escribe en ese fichero. Una
   firma se comprueba **en ese fichero** —la línea `Firma y fecha:` con nombre y fecha—,
   nunca en este tablón, que no puede saberlo. Si te para una firma, latido `BLOQUEADA por
   <qué>` en tu reclamo y díselo; no esperes mudo.
9. **Si una tarea falla o se queda a medias**, escribe `hechos/fallos/NN--<sid>.md` con
   el motivo y añade `ABANDONADA` a tu reclamo. Eso suelta la tarea al instante, sin
   esperar a la caducidad; callarse cuesta a la siguiente sesión la caducidad entera.
   El fichero lleva una línea `parada por: sesión agotada`, `parada por: avería` o
   `parada por: mal cortada`: de ella deriva el tablón A MEDIAS, FALLIDA o MAL CORTADA,
   y sin ella cuenta como avería.
   Los choques que encuentres van a `hechos/incidencias/<sid>.md` (un segundo fichero de
   la misma sesión lleva sufijo: `<sid>-tarea05.md`; el primero no se edita).
   Los subagentes que lances trabajan bajo tu sid y no reclaman nada; mientras corren,
   tú no escribes en `hechos/` ni en el código.
10. **Un cierre en falso se anula, no se borra.** Si una tarea figura terminada pero su
    commit no está en `main`, no cuadra lo que dice o contiene un valor que has comprobado
    erróneo, escribe `hechos/reabiertas/NN--<sid>.md` nombrando la terminada que anula,
    lo exacto que hay que corregir y lo que no hay que rehacer.
11. **Una tarea mal cortada no se renumera ni se borra.** Si al ejecutarla resulta que
    dentro hay varias, la sesión que lo descubre no recorta: escribe la incidencia con el
    corte natural que ha visto, `hechos/fallos/NN--<sid>.md` con `parada por: mal
    cortada` y la ruta de la incidencia, suelta con `ABANDONADA` y avisa. La tabla la
    pinta MAL CORTADA y nadie la elige por banda. El recorte lo decide Juan Luis, en una
    sesión sin reclamo que firma `sustituidas/` con sid propio; las tareas nuevas se
    añaden **al final de la numeración** (la siguiente es la T59) y la vieja se marca con
    `hechos/sustituidas/NN--<sid>.md`. Renumerar dejaría apuntando a otra cosa, en
    silencio, a los ficheros de tarea y a todo `hechos/`.
12. **No modificar nunca** `src/data/board-base.ts` ni `src/data/board-print.ts`, ni
    inventarse una regla que no esté en el reglamento o firmada en `autorizaciones.md`, ni
    `git push --force` (`tareas/_COMUN.md`, «Prohibido en todas las tareas»).
13. **Cerrada tu tarea, encadena otra solo en verde**: sin señales de sesión larga
    (releer lo ya leído, lentitud, una tarea entera ya hecha y la siguiente más larga, una
    espera por delante, aviso de límite), y con una tarea libre de **tu misma banda**,
    corta y que no dependa de nada EN CURSO ni de una firma. La columna «Encadenable con»
    lo sugiere; **si tu frase de arranque nombra la cadena, encadenas por defecto** y solo
    dejas de hacerlo en ámbar o rojo, diciéndolo. La anterior tiene que estar `CERRADA`
    antes de reclamar la siguiente, y para la siguiente se repite «Antes de hacer nada»
    entero, con reclamo nuevo. Si no estás en verde, cierra, da las frases de arranque
    —**una por sesión que quepa a la vez, con su tarea o cadena dentro**, nunca una
    genérica por banda— y para.
14. **Repositorio git.** Cada ficha declara los ficheros que toca; dos tareas que compartan
    uno no van en paralelo. Con otra sesión viva, **worktree propio** (`CLAUDE.md`). `add`
    nunca separado de `commit` (`git commit -m "…" -- rutas`); orden de cierre: pruebas en
    verde (`npx vitest run` y `npm run typecheck`) → commit del código → terminada **sin
    hash todavía**, `CERRADA`, tablón y ficha → un commit con rutas explícitas (tus
    `hechos/` por sid, `_ESTADO.md`, la ficha) → `push`; si el `push` se rechaza, trae lo de
    los demás y regenera el tablón otra vez en vez de fusionarlo → **con el `push` dentro,
    añade a la terminada el hash que el commit del código tiene en `origin/main`** y empuja
    esa línea: cada rebase cambia el hash, y la T42 y la T41 tuvieron que corregir el suyo
    (`proyecto.md`, «Orden de cierre»). Un reclamo vivo es una sesión viva, aunque no
    aparezca en `.claude/sesiones/` ni tenga ficheros reservados; lo que deje preparado
    (índice, rama de worktree sin fusionar) no se materializa por iniciativa ajena: si su
    reclamo está vivo, se avisa; si caducó, se releva y se verifica.

## Tabla de tareas

Vista derivada. LISTA si el rastro más reciente es una terminada; EN CURSO si hay
reclamo vivo; RELEVABLE si su reclamo más reciente está caducado sin cierre ni relevo
(la fila dice el sid y a qué hora caducó: quien la coja abre el suyo con `releva a:`);
REABIERTA si el rastro más reciente es una reabierta; si el rastro más reciente es un
fallo, su línea `parada por:` decide: A MEDIAS con `sesión agotada`, MAL CORTADA con `mal
cortada` y FALLIDA con `avería` o sin línea; SUSTITUIDA si lo es una sustituida;
BLOQUEADA si le falta una precondición (incluida una firma vacía en `autorizaciones.md`);
PENDIENTE en lo demás. Se regenera al reclamar y al cerrar, **y regenerar es recalcular
todas las filas** contra `hechos/` y `date -u`, y el registro entero —una línea por
fichero de `terminadas/`—, no editar la fila propia. **Nada de lo que hay aquí sale de una
conversación**: solo de `hechos/`, de los ficheros de tarea, de `autorizaciones.md` y de
`proyecto.md`. Ni firmas, ni «sigue viva», ni ninguna otra prosa de estado.

**Las columnas «Banda», «Duración esperada» y «Encadenable con» no salen de `hechos/`: se
copian del fichero de tarea**, que no se regenera nunca. Al regenerar hay que volver a
copiarlas o se pierden. La banda dice con qué modelo conviene abrir la sesión que coja la
tarea —ALTO el más capaz del menú, MEDIO el intermedio, BAJO el más rápido—; la
equivalencia con los nombres de hoy está en `proyecto.md`. «Encadenable con» nombra tareas
de la misma banda, cortas e independientes, que una sola sesión puede hacer seguidas.

Los números de la columna «#» son los de `hechos/`; la columna «Tarea» lleva el nombre de
la ficha. La columna «Salida» son los ficheros que la ficha declara en «Ficheros que toca».

| # | Tarea | Fichero | Precondición | Duración esperada | Banda | Encadenable con | Salida (dueño único) | Disparo | Estado | Reclamo vivo (sid · caduca) |
|---|---|---|---|---|---|---|---|---|---|---|
| 01 | T1 · Las figuras cortan la línea de visión | tareas/T1-linea-de-vision.md | ninguna | 2 h | MEDIO | — | `src/engine/vision.ts`, tests | manual | LISTA (`a24b396`) | |
| 02 | T2 · Los héroes pasan por encima de otros héroes | tareas/T2-pasar-sobre-heroes.md | ninguna | 2 h | MEDIO | — | `board.ts`, `calabozo.ts`, `reducer.ts`, tests | manual | LISTA (`1c8a533`) | |
| 03 | T3 · Buscar trampas exige no ver monstruos | tareas/T3-buscar-trampas.md | ninguna | 1 h | MEDIO | — | `selectors.ts`, `reducer.ts`, tests | manual | LISTA (`3bbf380`) | |
| 04 | T4 · Los monstruos no disparan las trampas ocultas | tareas/T4-monstruos-y-trampas.md | ninguna | 1 h | MEDIO | — | `reducer.ts`, tests | manual | LISTA (`9bcd7d1`) | |
| 05 | T5 · El foso: un dado menos, y no se desarma | tareas/T5-foso.md | ninguna | 2 h | MEDIO | — | `combat.ts`, `selectors.ts`, `reducer.ts`, tests | manual | LISTA (`39f05f5`) | |
| 06 | T6 · Cada héroe registra una sala una vez | tareas/T6-registrar-sala.md | ninguna | 2 h | ALTO | — | `types.ts`, `partida.ts`, `selectors.ts`, `reducer.ts`, tests | manual | LISTA (`0dc95d5`) | |
| 07 | T7 · El mago no lleva armadura ni armas grandes | tareas/T7-equipo-del-mago.md | ninguna | 1 h | MEDIO | — | `src/data/`, tests | manual | LISTA (`85948b1`) | |
| 08 | T8 · Zargon decide: objetivos y caminos | tareas/T8-zargon-decide.md | 01–07 LISTA | 4 h | ALTO | — | `src/ai/` (nuevo), tests | manual | LISTA (`2203e01`) | |
| 09 | T9 · Personalidades y dificultades | tareas/T9-personalidades.md | 08 LISTA | 3 h | ALTO | — | `src/ai/`, `scripts/`, tests | manual | LISTA (`4a68069`) | |
| 10 | T10 · El simulador que mide si la IA está bien | tareas/T10-simulador.md | 08 LISTA | 2 h | MEDIO | — | `scripts/`, `package.json` | manual | LISTA (`694e4b2`) | |
| 11 | T11 · El turno de Zargon sin clics | tareas/T11-turno-automatico.md | 08 y 09 LISTA · **cumplida** | 3 h | MEDIO | 22, 36 | `src/ui/Juego.tsx`, `TurnPanel.tsx`, `useAccionesDeTurno.ts`, `useTurnoDeZargon.ts` (nuevo), tests | manual | LISTA (`02499a8`, fusionado en `649b35b`) | |
| 12 | T12 · Incidencia: un commit se llevó trabajo ajeno | tareas/T12-incidencia-commit-cruzado.md | ninguna | 2 h | ALTO | — | tablón viejo, `reducer.ts` | manual | LISTA (`8b0b7dc`) | |
| 13 | T13 · Solo se pintan las puertas que alguien ha visto | tareas/T13-puertas-solo-las-vistas.md | ninguna | 3 h | ALTO | — | `types.ts`, `partida.ts`, `reducer.ts`, `selectors.ts`, `BoardMirror.tsx`, tests | manual | LISTA (`de466ec`) | |
| 14 | T14 · El botón de lanzar hechizos | tareas/T14-lanzar-hechizos-en-la-interfaz.md | ninguna | 2 h | MEDIO | — | `TurnPanel.tsx`, `Juego.tsx`, `HeroSheet.tsx`, tests | manual | LISTA (`d9c4f00`) | |
| 15 | T15 · Buscar libro de hechizos en una estantería | tareas/T15-buscar-libro-de-hechizos.md | 13 y 14 LISTA · **y las cuatro decisiones firmadas en `autorizaciones.md`** | 4 h | ALTO | — | `types.ts`, `reducer.ts`, `selectors.ts`, `calabozo.ts`, `TurnPanel.tsx`, `Juego.tsx`, tests | manual | **BLOQUEADA** — la línea `Firma y fecha:` de las cuatro decisiones está vacía (aparcada por Juan Luis el 2026-09-05, `proyecto.md`); **no se reclama** | |
| 16 | T16 · Hasta ocho héroes, y repetir clase | tareas/T16-hasta-ocho-heroes.md | firma de la entrada (firmada 2026-09-05) | 3 h | ALTO | — | `EleccionDeHeroes.tsx`, `partida.ts`, `tests/ocho-heroes.test.ts` | manual | LISTA (`56f5f21` + `d3d01e1`) | |
| 17 | T17 · Zargon elige qué monstruo actúa | tareas/T17-zargon-elige-el-orden.md | 14 LISTA | 2 h | MEDIO | — | `src/ai/orden.ts`, `TurnPanel.tsx`, `Juego.tsx`, tests | manual | LISTA (`8fbd674`) | |
| 18 | T18 · Un monstruo no actúa hasta que lo descubren | tareas/T18-monstruos-solo-los-descubiertos.md | 13 LISTA | 3 h | ALTO | — | `types.ts`, `partida.ts`, `reducer.ts`, `selectors.ts`, `TurnPanel.tsx`, tests | manual | LISTA (`632d089`) | |
| 19 | T19 · Una puerta se abre también desde la diagonal | tareas/T19-abrir-puertas-en-diagonal.md | regla de la casa firmada (2026-09-05) | 2 h | MEDIO | — | `board.ts`, `reducer.ts`, `selectors.ts`, tests | manual | LISTA (`c08bbc0`) | |
| 20 | T20 · El turno de Zargon pasa sin que el diario lo cuente | tareas/T20-el-turno-de-zargon-no-se-cuenta.md | ninguna | 2 h | MEDIO | — | `types.ts`, `reducer.ts`, `narrator/local.ts`, `TurnPanel.tsx`, tests | manual | LISTA (`740f54a`) | |
| 21 | T21 · Siete hechizos de doce no dejan rastro | tareas/T21-hechizos-sin-rastro-en-el-diario.md | ninguna (no a la vez que 20) | 2 h | MEDIO | — | `types.ts`, `reducer.ts`, `narrator/local.ts`, tests | manual | LISTA (`72a7c7f`) | |
| 22 | T22 · Saber qué hace cada hechizo antes de lanzarlo | tareas/T22-que-hace-cada-hechizo.md | `src/ui/Instrucciones.tsx` en `main` · **cumplida** (`b47310f`) · no a la vez que 52, 36 (`TurnPanel.tsx`) ni 54 (`HeroSheet.tsx`) | 2 h | MEDIO | 52, 36 | `TurnPanel.tsx`, `Instrucciones.tsx`, `HeroSheet.tsx`, `estilos.css`, tests | manual | LISTA (`3afd724`) | |
| 30 | T30 · El relevo de acciones | tareas/T30-relevo-de-acciones.md | ninguna | 4 h | ALTO | — | `server/`, `src/red/protocolo.ts`, `tests/red-protocolo.test.ts` | manual | LISTA (`6b07f82`) · el despliegue espera firma en `autorizaciones.md` | |
| 31 | T31 · La partida en red, en el cliente | tareas/T31-sesion-de-red.md | 30 LISTA | 4 h | ALTO | — | `src/red/cliente.ts`, `usePartida.ts`, `tests/red-cliente.test.ts` | manual | LISTA (`15c852a`) | |
| 32 | T32 · La pantalla de quien juega desde su casa | tareas/T32-vista-del-heroe-remoto.md | 31 y 18 LISTA | 4 h | ALTO | — | `VistaDeHeroe.tsx`, `BoardMirror.tsx`, `Juego.tsx`, `useAccionesDeTurno.ts`, `App.tsx`, `estilos.css`, tests | manual | LISTA (`be4adf6`) | |
| 33 | T33 · Quién tira los dados de quien juega desde su casa | tareas/T33-quien-tira-los-dados.md | 31 LISTA | 2 h | MEDIO | — | `TurnPanel.tsx`, `DiceInput.tsx`, `useAccionesDeTurno.ts`, tests | manual | LISTA (`db96bf2`) | |
| 34 | T34 · Publicar la aplicación en GitHub Pages | tareas/T34-publicar-en-pages.md | firma de Pages (firmada 2026-09-06) | 2 h | MEDIO | — | `.github/workflows/pages.yml`, `vite.config.ts`, `README.md`, `main.tsx`, `BoardVerify.tsx` | manual | LISTA (`2994ffc`) | |
| 35 | T35 · La salida crece con el grupo | tareas/T35-la-salida-crece-con-el-grupo.md | 16 LISTA | 1 h | MEDIO | — | `partida.ts`, `tests/ocho-heroes.test.ts` | manual | LISTA (`87ea055`) | |
| 36 | T36 · Todos los dados los tira la aplicación | tareas/T36-dados-siempre-automaticos.md | ninguna (firma del 2026-09-06 en `autorizaciones.md`) · no a la vez que 52, 22 (`TurnPanel.tsx`), 44, 45 (`Juego.tsx`) | 2 h | MEDIO | 52, 22 | `useAccionesDeTurno.ts`, `DiceInput.tsx`, `VistaDeHeroe.tsx`, `Juego.tsx`, `TurnPanel.tsx`, tests | manual | LISTA (`e29b34d`) | |
| 37 | T37 · Un icono para cada héroe | tareas/T37-iconos-de-heroes.md | ninguna · no a la vez que 51, 58 (`BoardMirror.tsx`), 53, 54, 38 (`types.ts`), 22 (`estilos.css`) | 3 h | MEDIO | 58 | `iconos.tsx` (nuevo), `BoardMirror.tsx`, `EleccionDeHeroes.tsx`, `types.ts`, `partida.ts`, `estilos.css`, tests | manual | LISTA (`9931043`) | |
| 38 | T38 · Monstruos agresivos, miedosos y prudentes | tareas/T38-monstruos-agresivos-y-miedosos.md | 42 LISTA · no a la vez que 49 (`personalities.ts`), 53, 54, 37 (`types.ts`), 45 (`simular.ts`) | 4 h | ALTO | — | `src/ai/`, `types.ts`, `partida.ts`, `scripts/simular.ts`, tests | manual | LISTA (`d91f8d0`) | |
| 39 | T39 · El diario en dos modos: informe y relato | tareas/T39-diario-informe-y-relato.md | 42 LISTA (firma del relato, 2026-09-06) · no a la vez que 53, 54 (`narrator/local.ts`) | 4 h | MEDIO | — | `narrator/local.ts`, `narrator/relato.ts` y `frases.ts` (nuevos), `MasterLog.tsx`, tests | manual | LISTA (`f3d77ca`) | |
| 40 | T40 · Todas las salas con puerta en la primera misión | tareas/T40-todas-las-salas-con-puerta.md | ninguna | 2 h | MEDIO | 42 | `quests/calabozo.ts`, `tests/quest.test.ts` | manual | LISTA (`3eef6dc`) | |
| 41 | T41 · El logotipo y las imágenes de ambientación | tareas/T41-logotipo-y-ambientacion-visual.md | ninguna (firma del 2026-09-06) · no a la vez que 37, 43 | 3 h | MEDIO | 37 | `public/`, `App.tsx`, `EleccionDeHeroes.tsx`, `Transicion.tsx` (nuevo), `estilos.css` | manual | LISTA (`4baf429`, fusionada en `main` a las 13:20Z; 474 tests) | |
| 42 | T42 · Cada monstruo con su nombre propio | tareas/T42-nombres-propios-de-monstruos.md | ninguna · antes que 37, 38, 39 | 2 h | MEDIO | 40 | `data/nombres.ts` (nuevo), `partida.ts`, `types.ts`, `narrator/local.ts`, `TurnPanel.tsx`, tests | manual | LISTA (`372a0f0`, fusionada en `main` a las 13:15Z; 467 tests) | |
| 43 | T43 · Quitar la pestaña «Verificar tablero» | tareas/T43-quitar-verificar-tablero.md | ninguna · no a la vez que 41 | 1 h | BAJO | — | `App.tsx` (`estilos.css` solo si hace falta) | manual | LISTA (`cd93174`) | |
| 44 | T44 · Sonidos de ambientación | tareas/T44-sonidos-de-ambientacion.md | ninguna · no a la vez que 52, 36, 45 (`Juego.tsx`) | 3 h | MEDIO | — | `sonidos.ts` (nuevo), `public/sonidos/`, `Juego.tsx`, `VistaDeHeroe.tsx`, tests | manual | LISTA (`6c8bd22`) | |
| 45 | T45 · El catálogo de misiones y su selector | tareas/T45-catalogo-y-selector-de-misiones.md | ninguna · no a la vez que 52, 36, 44 (`Juego.tsx`), 37 (`EleccionDeHeroes.tsx`), 53, 38 (`simular.ts`) | 4 h | ALTO | — | `quests/index.ts` (nuevo), `Juego.tsx`, `EleccionDeHeroes.tsx`, `red/cliente.ts`, `scripts/simular.ts`, tests (y, fuera de la ficha, `App.tsx`, `EntrarEnPartida.tsx`, `scripts/repetir.ts`) | manual | LISTA (`0f68632`; hecha por `s-20260907T205335-e738c893` sobre el reclamo de `s-20260907T204636-b565f64a`) | |
| 46 | T46 · La segunda misión | tareas/T46-segunda-mision.md | 45 LISTA · **cumplida** · no a la vez que 55 | 4 h | ALTO | — | `quests/<id>.ts` (nuevo), `quests/index.ts` | manual | LISTA (`da728ea`) | |
| 47 | T47 · La tercera misión, con el troll | tareas/T47-tercera-mision-con-el-troll.md | 46 LISTA · **cumplida** | 3 h | MEDIO | — | `quests/<id>.ts` (nuevo), `quests/index.ts`, `monsters.ts` (solo el troll) | manual | EN CURSO | `s-20260908T221109-e1db0720` · 2026-09-09T04:11:16Z |
| 48 | T48 · Propuestas de mejora para que Juan Luis elija | tareas/T48-propuestas-de-mejora.md | ninguna (mejor tras 11 y 36) | 2 h | ALTO | — | `tareas/_PROPUESTAS-2026-09.md` (nuevo) | manual | LISTA (`a6582f9`) | |
| 49 | T49 · Más especies de monstruo | tareas/T49-mas-especies-de-monstruo.md | 42 LISTA · no a la vez que 38, 47 | 3 h | MEDIO | — | `monsters.ts`, `personalities.ts`, `nombres.ts`, `tests/monstruos.test.ts` | manual | LISTA (`fb40fb1`) | |
| 50 | T50 · Poderes de monstruo: hechizos enemigos, telarañas y emboscadas | tareas/T50-poderes-de-monstruo.md | 49 y 42 LISTA · nada más sobre `reducer.ts` a la vez (después de 51, 53, 54) | 5 h | ALTO | — | `types.ts`, `reducer.ts`, `selectors.ts`, `monsters.ts`, `zargon.ts`, `narrator/local.ts`, tests | manual | **PENDIENTE** (49 y 42 LISTA; ya no espera a nadie por fichero: 37 y 61, cerradas) | |
| 51 | T51 · Un héroe pisa una trampa y tiene que pasarle algo | tareas/T51-las-trampas-saltan-al-pisarlas.md | ninguna · no a la vez que 53, 54, 50 (`reducer.ts`) ni 37 (`BoardMirror.tsx`) | 1,5 h | ALTO | 53, 54 | `reducer.ts`, `BoardMirror.tsx`, `tests/reducer.test.ts` | manual | LISTA (`095d031`) | |
| 52 | T52 · En el turno de Zargon no salen los mandos de los héroes | tareas/T52-el-turno-de-zargon-sin-mandos-de-heroe.md | ninguna · no a la vez que 36, 22 (`TurnPanel.tsx`) ni 44, 45 (`Juego.tsx`) | 2 h | MEDIO | 36, 22 | `TurnPanel.tsx`, `Juego.tsx`, `useAccionesDeTurno.ts`, `tests/turno-automatico.test.ts` | manual | LISTA (`9124757`) | |
| 53 | T53 · El pergamino del guardián: la misión tiene encargo | tareas/T53-el-pergamino-del-guardian.md | 51 LISTA · no a la vez que 54, 50 (`reducer.ts`), 37, 38 (`types.ts`), 39 (`narrator`), 45 (`simular.ts`) | 3 h | ALTO | 54 | `types.ts`, `reducer.ts`, `quests/calabozo.ts`, `narrator/local.ts`, `scripts/simular.ts`, `tests/quest.test.ts`, `tests/reducer.test.ts` | manual | LISTA (`a60b7e5`) | |
| 54 | T54 · Pociones que se guardan y equipo que se encuentra | tareas/T54-pociones-y-equipo-entre-el-tesoro.md | 53 LISTA · no a la vez que 50, 37, 38, 39, 22 (`HeroSheet.tsx`) | 4 h | ALTO | 55 | `types.ts`, `partida.ts`, `reducer.ts`, `selectors.ts`, `combat.ts`, `treasure.ts`, `narrator/local.ts`, `HeroSheet.tsx`, tests, `imprimibles/` | manual | LISTA (`1afe8c4`) | |
| 55 | T55 · Las diecisiete salas nuevas del calabozo, con algo dentro | tareas/T55-las-salas-nuevas-pobladas.md | 53 y 54 LISTA · no a la vez que 46 | 3 h | ALTO | — | `quests/calabozo.ts`, `tests/quest.test.ts` | manual | LISTA (`2daade2`) | |
| 56 | T56 · Dos arreglos del entorno: vitest y `preview` | tareas/T56-dos-arreglos-del-entorno.md | ninguna | 30 min | BAJO | 57 | `vite.config.ts`, `README.md`, `tareas/_COMUN.md` | manual | LISTA (`7ae9fb9`; hecha por `s-20260906T174758-05906208`, relevada y cerrada por `s-20260906T141818-ff83f12c`) | |
| 57 | T57 · Descargar la partida: un registro con el que encontrar los fallos | tareas/T57-descargar-la-partida.md | ninguna | 2 h | MEDIO | 56 | `registroDePartida.ts` (nuevo), `usePartida.ts`, `App.tsx`, `scripts/repetir.ts` (nuevo), `package.json`, `README.md`, tests | manual | LISTA (`f40e415`) | |
| 58 | T58 · Al pasar el ratón por una figura, su ficha en un cuadro flotante | tareas/T58-ficha-flotante-de-cada-figura.md | ninguna · no a la vez que 51, 37 (`BoardMirror.tsx`) ni 22 (`estilos.css`) | 2 h | MEDIO | 37 | `FichaFlotante.tsx` (nuevo), `BoardMirror.tsx`, `estilos.css`, tests | manual | LISTA (`6c3c750`) | |
| 59 | T59 · La portada del juego | tareas/T59-portada-del-juego.md | ninguna · no a la vez que 37 (`EleccionDeHeroes.tsx`, `estilos.css`) ni 45 (`EleccionDeHeroes.tsx`) | 1,5 h | MEDIO | — | `public/` (la portada), `public/IMAGENES.md`, `src/data/imagenes.ts`, `EleccionDeHeroes.tsx`, `estilos.css` | manual | LISTA (`aa75844`) | |
| 60 | T60 · Sin nombre propio, el diario dice «Enano el Enano» | tareas/T60-nombre-por-defecto-duplica-la-clase.md | — | 2 h | MEDIO | — | — | manual | **SUSTITUIDA** (por 62) | |
| 61 | T61 · Jugar una partida y revisar el tono del informe y del relato | tareas/T61-revisar-tono-de-informe-y-relato.md | ninguna | 3 h | MEDIO | — | `narrator/local.ts`, `narrator/relato.ts`, `narrator/frases.ts`, `quests/calabozo.ts` (si hace falta), tests | manual | LISTA (`d4a5a01`) | |
| 62 | T62 · Un nombre chulo por defecto para el héroe sin nombre | tareas/T62-nombre-chulo-por-defecto.md | ninguna · no a la vez que 37 (`types.ts`, `partida.ts`) | 2 h | MEDIO | — | `partida.ts`, `nombresHeroe.ts` (nuevo), tests | manual | LISTA (`aaebe93`) | |
| 63 | T63 · Al actuar, la página hace scroll y tapa los botones de acción | tareas/T63-scroll-automatico-tapa-los-botones.md | ninguna | 1 h | MEDIO | — | `MasterLog.tsx`, `estilos.css` (si hace falta) | manual | LISTA (`f7f05ac`) | |
| 64 | T64 · Quitar el aviso emergente de la tirada de movimiento | tareas/T64-sin-aviso-en-la-tirada-de-movimiento.md | ninguna | 1 h | MEDIO | 65 | `useAccionesDeTurno.ts` | manual | LISTA (`d7724f3`) | |
| 65 | T65 · Dos botones de «Atacar a Goblin» sin decir cuál es cuál | tareas/T65-nombre-propio-al-elegir-objetivo.md | ninguna | 30 min | BAJO | 64 | `TurnPanel.tsx` | manual | LISTA (`b3c7995`) | |
| 66 | T66 · Un héroe caído (cuerpo 0) sigue recibiendo turno y puede actuar | tareas/T66-heroe-caido-sigue-jugando.md | ninguna · no a la vez que 50 (`reducer.ts`, `types.ts`) | 2 h | MEDIO | — | `reducer.ts`, tests | manual | LISTA (`42e10f5`) | |
| 67 | T67 · Dos botones que destruyen la partida sin avisar, y «Jugar otra vez» repite la misma | tareas/T67-botones-destruyen-partida.md | ninguna · no a la vez que 57 (`App.tsx`, `usePartida.ts`) | 30 min | BAJO | — | `App.tsx`, `Juego.tsx`, `usePartida.ts` | manual | **PENDIENTE** | |
| 68 | T68 · Desarmar trampas no existe en la pantalla | tareas/T68-desarmar-trampas-en-pantalla.md | ninguna · no a la vez que 52, 36, 22 (`TurnPanel.tsx`, `useAccionesDeTurno.ts`) | 1,5 h | MEDIO | — | `selectors.ts`, `reducer.ts`, `TurnPanel.tsx`, `useAccionesDeTurno.ts`, tests | manual | **PENDIENTE** | |
| 69 | T69 · Guardar la partida y continuarla otro día | tareas/T69-guardar-y-continuar-partida.md | 57 LISTA · no a la vez que 37, 45, 57 (`App.tsx`, `EleccionDeHeroes.tsx`, `usePartida.ts`) | 3 h | MEDIO | — | `App.tsx`, `EleccionDeHeroes.tsx`, `usePartida.ts`, `registroDePartida.ts`, tests | manual | LISTA (`b395e81`) | |
| 70 | T70 · Mostrar la ruta de movimiento en el tablero | tareas/T70-mostrar-ruta-de-movimiento.md | ninguna · no a la vez que 51, 58, 37 (`BoardMirror.tsx`) | 2 h | MEDIO | — | `BoardMirror.tsx`, `Juego.tsx`, `estilos.css` | manual | LISTA (`91a99ed`) | |
| 71 | T71 · Un monstruo dormido no se despierta nunca | tareas/T71-monstruo-dormido-despierta.md | ninguna · no a la vez que 50, 66 (`reducer.ts`, `types.ts`) | 2 h | MEDIO | — | `reducer.ts`, `types.ts`, `narrator/local.ts`, tests | manual | **PENDIENTE** | |
| 72 | T72 · El diario leído en voz alta | tareas/T72-diario-leido-en-voz-alta.md | 44 LISTA · no a la vez que 52, 36, 44, 45 (`Juego.tsx`, `useTurnoDeZargon.ts`) | 2 h | MEDIO | — | `voz.ts` (nuevo), `MasterLog.tsx`, `Juego.tsx`, `useTurnoDeZargon.ts` | manual | **PENDIENTE** (44 LISTA) | |
| 73 | T73 · Héroes del simulador que juegan como personas | tareas/T73-heroes-simulador-razonables.md | 45 LISTA · no a la vez que 53, 38, 45 (`simular.ts`) | 2 h | MEDIO | — | `scripts/simular.ts`, tests (si hace falta) | manual | EN CURSO | `s-20260908T221105-3faa514f` · 2026-09-09T02:11:05Z |
| 74 | T74 · Ocho hojas de héroe: la barra lateral no cabe | tareas/T74-hojas-compactas-con-muchos-heroes.md | ninguna · no a la vez que 54, 22 (`HeroSheet.tsx`, `estilos.css`), 58, 37 | 1,5 h | MEDIO | — | `HeroSheet.tsx`, `Juego.tsx`, `estilos.css` | manual | **PENDIENTE** | |
| 75 | T75 · Un héroe puede volver a moverse después de abrir una puerta | tareas/T75-mover-dos-veces-tras-abrir-puerta.md | ninguna · no a la vez que 50 (`reducer.ts`) | 2 h | ALTO | — | `reducer.ts`, tests | manual | LISTA (`1b19270`; sin cambio de regla: el reglamento pp. 11-12 permite mover, abrir y seguir) | |

Las filas 67-74 ya no faltan: la sesión coordinadora `hero-quest-38` cerró esas ocho fichas
y esta sesión (`HQ Coordinadora T67-T75`) las comiteó (`332ea02`) y regeneró el tablón. El
salto de numeración 66→75 queda resuelto: no hay tareas perdidas entre medias, solo el orden
de llegada de dos sesiones coordinadoras distintas el mismo día (T75 se numeró antes porque
T67-T74 tardaron más en comitearse). **71 y 75 tocan `reducer.ts` a la vez**: la 71 declara
«no a la vez que 50, 66» sin conocer todavía la 75, y la 75 declara «ninguna otra tarea viva
sobre `reducer.ts`, comprobar el tablón al reclamar» — esa cláusula ya cubre a la 71, así
que no van en paralelo aunque la ficha de la 71 no la nombre.

Los números saltan de 22 a 30 a propósito (`proyecto.md`); no hay tareas perdidas. La 59
fue nueva del encargo de Juan Luis del 2026-09-07 («Portada Hero Quest.png» como portada
del juego), añadida por la sesión coordinadora `s-20260907T090034-c7bc516d`
(`hechos/notas/s-20260907T090034-c7bc516d.md`) y cerrada el mismo día por
`s-20260907T140727-559d19ac`. La 61 a la 65 son otros encargos/fallos que Juan Luis fue
contando el mismo día jugando (el tono del diario, un nombre chulo por defecto, un scroll
que tapa los botones, el aviso emergente de la tirada de movimiento, y dos botones de
ataque con el mismo texto), diagnosticados y añadidos por la misma sesión coordinadora.
**La 60 quedó SUSTITUIDA por la 62** el mismo día, sin llegar a reclamarse: dar al héroe sin
nombre un nombre de verdad (62) resuelve el síntoma de la 60 («Enano el Enano») sin tocar
`narrator/`, así que hacer las dos sería arreglar lo mismo dos veces
(`hechos/sustituidas/60--s-20260907T090034-c7bc516d.md`). No hay `hechos/recursos/` con
nada dentro: ningún tope de procesos fijado. **La 66 la encontró la sesión de la 46 al leer
una partida narrada** (un héroe caído seguía jugando); no la tocó porque su ficha no
declara el motor, y la sesión coordinadora escribió la ficha con el diagnóstico exacto
(`avanzarActor`, `src/engine/reducer.ts:1228-1256`, no filtra a los héroes caídos de
`turno.orden`).

**Libres por estado:** **50** (ALTO), **66** (MEDIO, nueva) y **47** (MEDIO, desbloqueada
por la 46). **Ninguna EN CURSO.** **La 37, la 45, la 46, la 59, la 61, la 62, la 63, la 64
y la 65 están cerradas** (`9931043`, `0f68632`, `da728ea`,
`aa75844`, `d4a5a01`, `aaebe93`, `f7f05ac`, `d7724f3` y `b3c7995`, todas en `main`); **la
60 quedó SUSTITUIDA**. Con esto, las cinco tareas de la caída de las 20:50Z están LISTA.

**Por ficheros:** **50 y 66 comparten `reducer.ts` y `types.ts`: no van a la vez.** La
**47** (libre) toca `quests/<id>.ts` nuevo, `quests/index.ts` y `monsters.ts` (solo el
troll): no choca con la 50 ni con la 66, y parte del torreón de la 46 como segundo ejemplo.
La 46, ya cerrada, tocó `quests/torreon.ts`, `quests/index.ts`, `tests/quest.test.ts` y las
trampas de su ficha; no tocó motor, IA ni pantalla. 15 espera la palabra de Juan Luis.

**Cabe hoy:** **dos sesiones a la vez**: una ALTO con la **50** (5 h) o una MEDIO con la
**66** (2 h) —no las dos, por `reducer.ts`—, y otra MEDIO con la **47** (3 h). Si se abre la
66 antes que la 50, mejor: es corta y su arreglo cambia lo que mide el simulador, que es lo
que la 47 usa para colocar la tercera misión.

**Encadenables:** 58 → 37 ya no aplica: las dos están LISTA. La cadena **64 → 65** está
cerrada entera (`s-20260907T205502-6241d5c8`). 46 → 47 no es cadena: cambian de banda
(ALTO → MEDIO). Ni la 37 ni la 61, ya cerradas, tenían «encadenable con» declarado. La
sesión de la 46 (hero-quest-1b, ALTO) no encadena la 50: es de 5 h tras dos tareas seguidas
y comparte `reducer.ts` con la 66, que conviene hacer antes. Las cadenas 51 → 53 → 54 → 55 (`s-20260906T174714-651b3481`) y 52 → 36 → 22
(`s-20260906T174532-9cbd624b`) están cerradas enteras.

## Registro de finalizaciones

Derivado de `hechos/terminadas/`. Una línea por fichero, más reciente arriba. Los 25
primeros ficheros los escribió la sesión de la migración a partir del registro del tablón
viejo; la sesión que de verdad hizo cada tarea va entre paréntesis, con el identificador de
conversación que usaba el tablón viejo. Fecha: la del commit, en UTC. Desde la 43, cada
terminada la escribe la sesión que cerró la tarea.

Formato: `LISTA · tarea NN · AAAA-MM-DD HH:MM · sid · recuento · ruta de la salida`

- LISTA · tarea 70 · 2026-09-08 22:20 · `s-20260908T221002-5f16cc16` · rastro de la última ruta recorrida en `BoardMirror`: la casilla de origen marcada y un punto por cada casilla siguiente con una línea de puntos que las une, capturado en un único sitio (se envuelve `ejecutar` en `Juego.tsx` antes de pasarlo a `useAccionesDeTurno`, así que coge igual un movimiento de héroe que uno automático de Zargon); se desvanece con una transición CSS pasados `ruta.length*300ms` y un segundo más, y entonces se borra con un temporizador (sin `requestAnimationFrame`); no toca `VistaDeHeroe.tsx` (fuera de «Ficheros que toca» de la ficha, razonado en la terminada) así que la vista de casa no calcula rastro propio todavía; sin navegador en el entorno, verificado por lectura del render y arrancando el `dev server`; 715 tests / 45 ficheros (igual que antes), typecheck 0 · `src/ui/BoardMirror.tsx`, `src/ui/Juego.tsx`, `src/estilos.css` · `91a99ed`

- LISTA · tarea 75 · 2026-09-08 22:17 · `s-20260908T221009-8416a271` · sin cambio de regla: reproducido en tests que mover hasta una puerta cerrada, abrirla y seguir —hacia la sala o hacia otro lado— es un solo movimiento acotado por `movimientoRestante`, y que solo una acción lo parte (`movimientoCerrado`, ya existente); el reglamento lo sostiene (p. 11: «you may not move part way, perform an action, and then finish your movement»; p. 12: «Opening a door is also not one of the six actions», se hace «while you are moving»), así que la regla intermedia de la ficha no tiene base y no se implementa; comentario con la cita en `abrirPuerta`; lo que pide Juan Luis sería regla de la casa, cuatro opciones (A-D) en la terminada para su firma; 719 tests / 45 ficheros (+4); typecheck en verde · `src/engine/reducer.ts` (solo comentario), `tests/reducer.test.ts` · `1b19270`
- LISTA · tarea 46 · 2026-09-07 21:53 · `s-20260907T211731-6bdd85b1` · «El torreón del Señor de la Guerra», nivel 2 del catálogo: ala nordeste, escalera en el pasillo del norte, veinte monstruos en siete salas (goblins, orcos, fimir, momia, esqueletos, zombi) y un guerrero del Caos como jefe en el salón del trono, que no abre al pasillo (se entra por la antesala o por la cripta, las dos con guardia); objetivo `matarA`; 23 puertas + 3 secretas, 5 trampas, 8 muebles (estrena el trono), texto en las 22 salas; simulador: 87 / 89 / 92 % frente a 100 / 99 / 100 % del calabozo, 12,6 rondas frente a 17,4, una partida sin terminar por nivel (héroes del simulador parados ante las puertas interiores); figuras nuevas: guerrero del Caos y momia; sin navegador, «jugarla» se sustituyó por leer dos partidas narradas enteras; encontró el fallo del héroe caído que sigue jugando (T66); 704 tests / 44 ficheros (+15, `tests/quest.test.ts`); typecheck en verde · `src/data/quests/torreon.ts`, `src/data/quests/index.ts`, `tests/quest.test.ts` · `da728ea`

- LISTA · tarea 37 · 2026-09-07 21:27 · `s-20260907T211150-b4152f09` (releva a `s-20260907T204516-bef22ac6`, huérfana desde la caída de las 20:50Z; el worktree no tenía código) · veinte iconos en SVG sin ficheros ni fuentes externas (`src/ui/iconos.tsx`): cuatro de enano, cuatro de magia, cuatro de elfo, dos de bárbaro, dos de hada, cuatro de nadie; `Heroe.icono?: string` viaja desde `HeroeElegido` hasta `crearPartida`, como `string` suelto para no acoplar el motor a la UI; en `EleccionDeHeroes.tsx` cada héroe elige letra o icono en una rejilla agrupada por clase, a la vista, sin desplegable, reutilizando `chip`/`chip-sel`/`pista`/`grupo-elementos` (no tocó `estilos.css`); dos héroes pueden repetir icono, avisado en la propia fila; `BoardMirror.tsx` pinta el icono si lo hay y la letra si no; 697 tests / 46 ficheros tras el rebase sobre la 61 (693 de base, +4 míos en `tests/iconos.test.ts`); typecheck y build en verde; sin navegador en el entorno, no se pudo enseñar la pantalla con ocho héroes, verificado por lectura y por el build · `src/ui/iconos.tsx`, `src/engine/types.ts`, `src/engine/partida.ts`, `src/ui/BoardMirror.tsx`, `src/ui/EleccionDeHeroes.tsx` · `9931043`
- LISTA · tarea 61 · 2026-09-07 21:21 · `s-20260907T205835-39ec5559` (releva a `s-20260907T204408-8af444b9`, huérfana desde la caída de las 20:50Z) · informe: quita la ambientación de sala que se copiaba tal cual (el diagnóstico exacto de la ficha) y las exclamaciones de trampas, puerta, pasadizo secreto, monstruo errante y objeto de misión; el ataque fallido pierde el banco de frases y dice «Sin daño.»; relato: arregla un fallo sistemático — `{objeto}` ya lleva su «a»/«al» y una veintena de plantillas escribían además una preposición literal, dando «a a Háfir» o «en a Háfir»; de paso, el caso `ataque` solo pisaba `objeto` y no `objeto2`/`deQuien` (una plantilla nueva con `{objeto2}` seguía nombrando al atacante), la forma de mitad de frase de un héroe se ponía en minúscula y le quitaba la mayúscula al nombre, los dos epítetos del goblin llevaban artículo masculino con sustantivos femeninos, y cinco bancos de `efectoDeHechizo` usaban un `{Sujeto}` en singular que se rompería con más de un objetivo; no toca el motor ni el mecanismo del relato (sigue firmado); 693 tests (669 + 4 nuevos de T61, sin ninguno roto de los que había); typecheck en verde · `narrator/local.ts`, `narrator/relato.ts`, `narrator/frases.ts`, `tests/narrador.test.ts`, `tests/narrator.test.ts`, `tests/integracion.test.ts` · `d4a5a01`
- LISTA · tarea 45 · 2026-09-07 21:08 · `s-20260907T204636-b565f64a` (reclamó y cayó; la hizo entera `s-20260907T205335-e738c893`) · un solo sitio del que salen las misiones, `src/data/quests/index.ts`, con la lista `MISIONES` ordenada por dificultad (la posición es el nivel) y un selector de misión en `EleccionDeHeroes.tsx`; `Juego.tsx`, `red/cliente.ts`, `simular.ts` y `repetir.ts` leen del catálogo en vez de juntar constantes a mano; `npm run sim` sin argumentos recorre el catálogo entero; tocó además `App.tsx` y `EntrarEnPartida.tsx` (fuera de ficha, razonado en `hechos/incidencias/s-20260907T205335-e738c893.md`); 689 tests / 44 ficheros (antes 669 / 43); typecheck en verde · `src/data/quests/index.ts`, `Juego.tsx`, `EleccionDeHeroes.tsx`, `red/cliente.ts`, `scripts/simular.ts`, tests · `0f68632`
- LISTA · tarea 65 · 2026-09-07 21:11 · `s-20260907T205502-6241d5c8` (encadenada tras la 64) · los dos sitios de `TurnPanel.tsx` que enseñaban la especie (`MONSTRUOS[o.especie].nombre`, en el botón de atacar y en el selector de objetivo de hechizo) pasan a `o.nombre`, el nombre propio que T42 reparte único dentro de la partida; la importación de `MONSTRUOS` se queda porque la usa el titular del turno de Zargon; evidencia con `renderToStaticMarkup` de `TurnPanel` (mago entre dos goblins): «Atacar a Glupfch» / «Atacar a Gribzo» y, en el selector de bola de fuego, «Glupfch (1)» / «Gribzo (1)», donde antes decía «Atacar a Goblin» dos veces; 669 tests / 43 ficheros antes y después (689 / 44 sobre el árbol rebasado con la 45 dentro); typecheck en verde · `src/ui/TurnPanel.tsx` · `b3c7995`
- LISTA · tarea 64 · 2026-09-07 21:02 · `s-20260907T205502-6241d5c8` (reclamo abierto por `s-20260907T204555-0c3c3d69`, sesión caída a las ~20:50Z con el diff sin commitear) · `tirarYEnsenar` gana un parámetro `mostrarAviso` (por defecto `true`) y `pedirMovimiento` lo pasa a `false`: la acción se despacha igual contra el motor y solo se deja de abrir `AvisoDeTirada`; ataque, hechizo y trampa siguen abriéndolo como quedó firmado en T33/T36; sin tocar `DiceInput.tsx` ni `estilos.css`, porque el contador `👣 N de N` de `TurnPanel` ya enseña las casillas y el diario sigue diciendo «saca 3 y 2: 5 casillas»; verificado en Chromium (Playwright de la caché de npx, sin dependencia nueva): tras «Tirar movimiento» no aparece `.dados-fondo`, se pintan las casillas verdes y el contador pasa de «sin tirar» a «5 de 5»; 669 tests / 43 ficheros antes y después; typecheck en verde · `src/ui/useAccionesDeTurno.ts` · `d7724f3`
- LISTA · tarea 63 · 2026-09-07 20:46 · `s-20260907T204415-32d21ad3` (cierre rematado por `s-20260907T205459-25b4f867`) · el `useEffect` de `MasterLog` desplazaba el diario con `scrollIntoView`, que sube por todos los ancestros desplazables y arrastraba `.juego-panel` (o la página entera por debajo de 1100px), tapando los botones de `TurnPanel`; ahora llama `scrollTo({top: scrollHeight, behavior:"smooth"})` sobre `.diario-lista`, que nunca sube más allá de su propio contenedor; `.diario-lista` conserva `overflow-y:auto` y `max-height:260px` a las dos anchuras, así que no toca CSS; `MasterLog` es compartido por `Juego.tsx` y `VistaDeHeroe.tsx`, así que cubre las dos pantallas; sin navegador en el entorno, verificado por lectura del CSS y del DOM, no visualmente; 669 tests / 43 ficheros antes y después; typecheck en verde · `src/ui/MasterLog.tsx` · `f7f05ac`

- LISTA · tarea 62 · 2026-09-07 20:45 · `s-20260907T145032-f832894d` · el héroe sin nombre deja de quedarse con el de su clase: `crearPartida` le sortea uno de `src/data/nombresHeroe.ts`, con la forma de T42 (lista a mano y reparto sin repetir) pero indexada por clase **y** género, porque un héroe elige las dos cosas (T16); diez nombres por combinación, doce del hada, que comparte una sola lista entre géneros. Algunos son de varias palabras («Ácomer, hijo de Ádormir», «Groa de Cáliran»), pedidos por Juan Luis a mitad de la tarea con esos dos ejemplos, y son **aposiciones** y nunca epítetos con artículo, para que aguanten los dos moldes del narrador sin tocarlo: «el bárbaro Grímur, hijo del Trueno» (informe) y «Grímur, hijo del Trueno el Bárbaro» (relato). Corriente propia derivada de la semilla (`+0x27d4eb2f`), distinta de la de los nombres de monstruo y la de los temperamentos, con dos tests que lo fijan. Siete tests de cinco ficheros afirmaban el nombre de la clase como nombre por defecto —la regla vieja, no un fallo nuevo— y se corrigieron para leerlo del estado. No toca `narrator/`, que es por lo que la 62 sustituyó a la 60. Cabo suelto en `hechos/incidencias/`: la cortina de paso (`Transicion.tsx`, con los nombres de `App.tsx`) sigue diciendo «Bárbaro», y arreglarlo pide la semilla, que vive en `Juego.tsx` (T45). 654 → 669 tests / 42 → 43 ficheros (+15, `tests/nombres-de-heroe.test.ts`); typecheck en verde · `src/data/nombresHeroe.ts`, `src/engine/partida.ts`, `tests/nombres-de-heroe.test.ts`, `tests/ficha-flotante.test.ts`, `tests/heroes.test.ts`, `tests/narrator.test.ts`, `tests/temperamento.test.ts`, `tests/turno-de-zargon.test.ts` · `aaebe93`
- LISTA · tarea 59 · 2026-09-07 14:15 · `s-20260907T140727-559d19ac` · `Portada Hero Quest.png` (de Juan Luis) entra como `portada-original.png` (sin retocar) y `portada.webp` (495→133 KB, `cwebp -q 90`, sin recorte: alfa opaco de verdad y esquinas ya casi del color de `--fondo`); sustituye al logotipo grande de T41 en la cabecera de `EleccionDeHeroes.tsx` porque la imagen resultó traer ya pintado «Hero Quest, versión Salas Oliver, para todas las edades» y no ser una escena aparte como preveía la ficha —razonado en `hechos/incidencias/s-20260907T140727-559d19ac.md`—; el logotipo sigue igual en `Transicion.tsx` y en la barra de la partida. Declarada en `public/IMAGENES.md` y `src/data/imagenes.ts` (`PORTADA`); sin navegador en el entorno, no se pudo hacer una captura real, verificado por lectura y por `npm run build`. 654 tests / 42 ficheros, sin cambios; typecheck y build en verde · `public/portada-original.png`, `public/portada.webp`, `public/IMAGENES.md`, `src/data/imagenes.ts`, `src/estilos.css`, `src/ui/EleccionDeHeroes.tsx` · `aa75844`
- LISTA · tarea 38 · 2026-09-07 09:36 · `s-20260907T080909-f84dcfe8` · cada monstruo lleva su propio temperamento además de la personalidad de su especie (`Monstruo.temperamento`: agresivo, miedoso o prudente), sorteado en `crearPartida` sobre una corriente derivada propia con el reparto por especie de `personalities.ts` —los no muertos nunca miedosos, la mitad de los goblins sí—, y la misión puede fijarlo sin cambiar el de los demás; el campo es **opcional** porque el monstruo errante nace en `reducer.ts`, que esta ficha prohíbe tocar, y sin él se juega como agresivo (lo de antes de T38); la huida no es un caso aparte sino un peso más de la puntuación (`distanciaDeLosHeroes`, 40, igual en los tres niveles) multiplicado por las ganas de huir, de modo que el agresivo puntúa exactamente como antes y el miedoso acorralado ataca sin que eso esté escrito en ningún sitio; la miopía del nivel torpe deja de aplicarse a quien huye; `motivoDeLaJugada` lo dice en la mesa («huye: tiene 3 héroes encima»); el simulador acepta un temperamento forzado (`npm run sim -- 300 2000 miedoso`) y cuenta las activaciones seguidas huyendo. Medido con 300 partidas por nivel (semillas 2000-2299), victorias torpe/normal/astuto: línea base anterior a T38 (agresivo forzado) 99/100/99 %, reparto real 100/100/100 %, miedoso 100/100/100 %, prudente 100/100/99 % — **el 100 % firmado se mantiene, y a esta escala la línea base tampoco daba 100 % exacto**; «pega y se va» 4-9 % (antes 4-6 %); huidas seguidas 1,5 de media. Receta de T1 comprobada: con el peso a cero caen 8 tests, los 8 míos, y ninguno ajeno. 545 → 576 tests en la rama sola (+31, `tests/temperamento.test.ts`); 654 tests / 42 ficheros tras el rebase; typecheck en verde. Cabo suelto en `hechos/incidencias/`: `motivoDeLaJugada` no la llama la pantalla todavía · `types.ts`, `partida.ts`, `personalities.ts`, `targeting.ts`, `zargon.ts`, `difficulty.ts`, `scripts/simular.ts`, `tests/ayuda.ts`, `tests/temperamento.test.ts` · `d91f8d0`
- LISTA · tarea 39 · 2026-09-07 08:40 · `s-20260907T081006-d905c646` · informe: sujeto con clase y nombre («el enano Háfir»), y la tirada de ataque con sus caras cuando el evento las trae; relato: banco de frases por situación (`frases.ts`) y ensamblaje determinista por índice y actor (`relato.ts`, misma firma que `narrar` y el mismo `switch` exhaustivo de los 30 tipos de evento), firmado en `autorizaciones.md` el 2026-09-06; los monstruos se presentan con su nombre de pila y, al morir, con un epíteto por especie sin repetirlo (dos por especie, 18 especies); los héroes siempre «Nombre el Clase» (T16); selector de dos botones en `MasterLog.tsx`, informe por omisión, preferencia en `localStorage`; no toca el motor ni `TurnPanel.tsx`; 623 tests (+66, `tests/narrador.test.ts`); typecheck en verde · `narrator/local.ts`, `narrator/relato.ts`, `narrator/frases.ts`, `ui/MasterLog.tsx` · `f3d77ca`
- LISTA · tarea 44 · 2026-09-07 08:24 · `s-20260907T080902-4a99e05e` · doce sonidos sintetizados con `AudioContext` (sin ficheros ni licencias): puerta, dados, golpe/fallo, caída, sala, hechizo, tesoro, poción, sorpresa, victoria/derrota; tabla `sonidoDe` exhaustiva sobre los 32 tipos de `Evento`, quince de ellos mudos a propósito; enganchada a `estado.registro` por índice, igual que `MasterLog`, así que un deshacer o un sondeo de red que rehace la partida no repite sonido; botón de silencio (🔊/🔇) en la cabecera de `Juego.tsx` y `VistaDeHeroe.tsx`, preferencia en `localStorage` por navegador; el primer clic de la partida desbloquea el audio; no toca `estilos.css` (reclamado a la vez por la 58): la fila del botón usa estilo en línea; 557 tests / 40 ficheros tras el rebase sobre la 58 (+5 suyos, `tests/sonidos.test.ts`); typecheck y build en verde; sin navegador en el entorno, no se pudo escuchar ningún sonido ni probar el desbloqueo en Safari/iOS, verificado por lectura y por el build · `sonidos.ts`, `Juego.tsx`, `VistaDeHeroe.tsx` · `6c8bd22`
- LISTA · tarea 58 · 2026-09-07 08:21 · `s-20260907T080907-ae329b57` · cuadro flotante sobre el tablero al pasar el ratón (`pointerenter`/`pointerleave`) o al tocar (`pointerup`, `pointerType==="touch"`) una figura que no es objetivo de la acción en curso, con `pointer-events:none` para no robar el clic de atacar; función pura `fichaDe` en `FichaFlotante.tsx` con una línea por héroe (cuerpo, mente, ⚔/🛡 con `combat.ts`, equipo, hechizos) o por monstruo (especie, cuerpo, mente de plantilla, ⚔/🛡, movimiento, dormido/pierde turno) y una línea por efecto activo; 552 tests (545 + 7); typecheck en verde; sin navegador en el entorno, no se pudo probar en tableta de verdad · `FichaFlotante.tsx`, `BoardMirror.tsx`, `estilos.css` · `6c3c750`
- LISTA · tarea 55 · 2026-09-07 08:06 · `s-20260906T174714-651b3481` · once monstruos más en ocho salas (17 en 12 salas: goblins, orcos, tres esqueletos y un zombi; ninguna sala más dura que la del guardián, con test que lo fija), tres trampas más en pasillos, diez muebles más (13 de 14 del catálogo) y texto en las 22 salas; simulador antes → después: 100 % en los tres niveles, 15,7 / 15,5 / 16,1 → 17,8 / 17,5 / 17,4 rondas, 13 / 8 / 6 → 1 / 2 / 4 sin terminar; figuras de cartón: 7 goblins, 5 orcos, 1 fimir, 3 esqueletos, 1 zombi; 545 tests / 38 ficheros (+2 suyos); typecheck en verde · `quests/calabozo.ts`, `tests/quest.test.ts` · `2daade2`
- LISTA · tarea 54 · 2026-09-07 08:05 · `s-20260906T174714-651b3481` · mochila en cada héroe; las pociones se guardan y se beben en cualquier momento (`usarPocion`, reglamento p. 16) sobre uno mismo o sobre otro héroe, y se dan solo en el propio turno (`darObjeto`); efecto de tesoro `equipo` con cuatro cartas (yelmo, escudo, espada corta, herramientas) que el héroe equipa si su clase puede y no lleva otra igual; la armadura cuenta una pieza por tipo y el escudo no cuenta con dos manos; la hoja enseña la mochila con «Beber» / «Dar de beber a…» / «Dar a…»; `VERSION` del relevo a 2026-09-07; cartas imprimibles regeneradas (28 tesoros); toca además `Juego.tsx`, `VistaDeHeroe.tsx` (una línea: la prop `ejecutar`), `protocolo.ts`, `generar-cartas.ts`, `integracion.test.ts` y `heroes.test.ts` (un test afirmaba el daño de la lanza y no la regla); 543 tests / 38 ficheros tras el rebase (+12 suyos); typecheck en verde · `types.ts`, `reducer.ts`, `selectors.ts`, `combat.ts`, `partida.ts`, `treasure.ts`, `narrator/local.ts`, `HeroSheet.tsx`, `imprimibles/` · `1afe8c4`
- LISTA · tarea 22 · 2026-09-07 07:52 · `s-20260906T174532-9cbd624b` · la descripción del hechizo va en el propio botón del panel (no solo en el `title`, porque con un solo objetivo se lanza sin pasar por el segundo paso) y también en el paso «¿sobre quién?»; sección nueva «Los hechizos del grupo» en Instrucciones, por héroe y por elemento, con los gastados tachados; toca `App.tsx` y `Juego.tsx` además de lo declarado en la ficha —hacía falta el `EstadoPartida` real y bajarlo era menos código que reconstruirlo desde `localStorage`—, ninguna otra tarea viva los declaraba; no tocó `HeroSheet.tsx` (no hacía falta) ni `estilos.css` (las clases ya existían), así que la colisión que la sesión de la 54 había anotado con cautela no llega a darse; de paso, corregido «Quién tira qué» en Instrucciones, que aún describía el modo manual que quitó la T36; 508 → 531 tests (+17, `tests/que-hace-cada-hechizo.test.ts`); typecheck y build en verde; sin navegador en el entorno, no se pudo probar en tableta ni sin ratón, verificado por lectura · `TurnPanel.tsx`, `Instrucciones.tsx`, `App.tsx`, `Juego.tsx` · `3afd724`
- LISTA · tarea 56 · 2026-09-07 07:50 · `s-20260906T141818-ff83f12c` (relevo; el trabajo lo hizo `s-20260906T174758-05906208` el día 6 a las 20:15) · `exclude` en `vite.config.ts` (37 ficheros / 514 tests con `npx vitest run` a secas en el árbol principal), receta de `http.server` en el README, trampas de `_COMUN.md` al día; el código estaba fusionado en el `main` local sin empujar y se rebasó sobre `origin/main` · `vite.config.ts`, `README.md`, `tareas/_COMUN.md` · `7ae9fb9`

- LISTA · tarea 53 · 2026-09-06 18:22 · `s-20260906T174714-651b3481` · objetivo `recuperar` (tesoro de misión, reglamento p. 14): el pergamino se encuentra registrando la sala `q` con el guardián muerto, en vez de robar carta, y la misión termina; la introducción del calabozo dice el encargo; el héroe que registró la sala con el guardián vivo puede volver a hacerlo (única excepción a T6, compartida con el selector); el simulador va a la sala y busca: 100 % de victorias en los tres niveles antes y después, +0,5 rondas de media; 514 tests / 37 ficheros tras el rebase (+6 suyos); typecheck en verde · `types.ts`, `reducer.ts`, `selectors.ts`, `narrator/local.ts`, `quests/calabozo.ts`, `scripts/simular.ts`, `tests/quest.test.ts`, `tests/reducer.test.ts`, `tests/narrator.test.ts` · `a60b7e5`
- LISTA · tarea 36 · 2026-09-06 18:16 · `s-20260906T174532-9cbd624b` · `quienTira` pasa a ser siempre `"laApp"`: desaparecen `dadosPropios`, la preferencia guardada y el selector «Mis dados»; los diálogos de teclear dados (`PeticionDados`, `DiceInput`) ya no se abren; `pedirAtaque`, `lanzar` (Genio) y `pedirMovimiento` se simplifican a llamar siempre a `tirarYEnsenar`; `DiceInput.tsx` conserva `CaraDeDado`, `componerDados`/`calaveras`/`escudosBlancos` (los usa `narrator.test.ts`) y `AvisoDeTirada`; no se encontró ninguna otra confirmación manual que quitar; 492 → 495 tests (508 tras rebasar sobre `origin/main`, con la T51 dentro); typecheck y build en verde · `useAccionesDeTurno.ts`, `DiceInput.tsx`, `VistaDeHeroe.tsx`, `Juego.tsx`, `TurnPanel.tsx` · `e29b34d`
- LISTA · tarea 51 · 2026-09-06 18:07 · `s-20260906T174714-651b3481` · las trampas encontradas saltan al pisarlas (el test que decía lo contrario era el equivocado) y se saltan con 1 dado si el camino sigue; el foso abierto se queda pintado y se salta; la lanza tira su dado (calavera hiere y acaba el turno, escudo esquiva), el bloque tira 3 sin defensa, y el desarme estaba al revés; evento nuevo `saltoDeTrampa`; 505 tests / 36 ficheros tras el rebase (+13 suyos); typecheck en verde · `reducer.ts`, `types.ts`, `narrator/local.ts`, `BoardMirror.tsx`, `tests/reducer.test.ts`, `tests/narrator.test.ts` · `095d031`
- LISTA · tarea 57 · 2026-09-06 17:59 · `s-20260906T174336-09ec25b3` · botón «Descargar partida» junto a «Cambiar héroes», y `scripts/repetir.ts` para reproducir el fichero descargado; guardado automático en servidor no es posible hoy (Pages no ejecuta nada; el relevo de T30 espera firma); 474 → 480 tests en su worktree (+6, `tests/registro-de-partida.test.ts`); typecheck y build en verde · `src/ui/registroDePartida.ts`, `usePartida.ts`, `App.tsx`, `scripts/repetir.ts`, `package.json`, `README.md` · `f40e415`
- LISTA · tarea 48 · 2026-09-06 17:59 · `s-20260906T174643-a6f05c61` · quince propuestas de mejora ordenadas por lo que aportan, jugadas sobre el motor real (sin navegador en el entorno); 474 tests sin cambios (no toca código) · `tareas/_PROPUESTAS-2026-09.md` · `a6582f9`
- LISTA · tarea 49 · 2026-09-06 (hora exacta no consta en la terminada) · `s-20260906T174538-5671d1b5` · ocho especies nuevas (brujo, bruja, araña gigante, monstruo de arena, rata gigante, espectro, ogro, serpiente de las tumbas), personalidad y doce nombres cada una; 474 → 481 tests; typecheck en verde; faltan las figuras de cartón (las confecciona Juan Luis) y quedan tres poderes anotados para T50 · `src/data/monsters.ts`, `src/ai/personalities.ts`, `src/data/nombres.ts` · `fb40fb1`
- LISTA · tarea 52 · 2026-09-06 19:59 · `s-20260906T174532-9cbd624b` · `mandosDeHeroe(estado, zargon)` en `useAccionesDeTurno.ts`, usada por `TurnPanel.tsx` y `Juego.tsx`; desaparecen atacar/puerta/buscar/hechizos, «Terminar turno», «Cambiar»/«O elige tú», casillas verdes y objetivos del tablero, y su teclado, durante el turno de Zargon en automático (vuelven en pausa o avería); de paso, `trampaDisparada` ahora se enseña en pantalla; 474 → 479 tests (+5, fichero nuevo `tests/turno-de-zargon-sin-mandos.test.ts`); typecheck en verde · `TurnPanel.tsx`, `Juego.tsx`, `useAccionesDeTurno.ts` · `9124757`
- LISTA · tarea 41 · 2026-09-06 13:20 · `s-20260906T125522-43d82a6b` · logotipo grande en la elección y en una pantalla de paso (`Transicion.tsx`, nueva), pequeño en la barra; textura de piedra en SVG; el PNG de Juan Luis tenía fondo blanco opaco y se recortó; 474 tests / 34 ficheros tras el rebase (+7 suyos, `tests/imagenes.test.ts`); typecheck y build en verde · `public/`, `App.tsx`, `EleccionDeHeroes.tsx`, `Transicion.tsx`, `estilos.css`, `data/imagenes.ts` · `4baf429` (la terminada decía `ed12384` y se corrigió en `2d1408a`)
- LISTA · tarea 42 · 2026-09-06 13:15 · `s-20260906T124412-0cdb5d41` · doce nombres por especie; asignación en `crearPartida` con un generador **derivado** de la semilla (`crearRng(semilla + 0x5bf03635)`), para no mover el del estado ni el barajado ni las tiradas (hay un test que lo fija); 467 tests con T11 y T40 dentro · `data/nombres.ts`, `partida.ts`, `types.ts`, `reducer.ts`, `narrator/local.ts`, `TurnPanel.tsx` · `372a0f0` (hechos en `7a4f0ee`)
- LISTA · tarea 40 · 2026-09-06 13:01 · `s-20260906T124430-0169046b` · sin puerta: 0 (25 puertas); 437 tests; medido con `npm run sim`: la misión pasa de 8 a 15-18 rondas de media · `quests/calabozo.ts`, `tests/quest.test.ts` · `3eef6dc`
- LISTA · tarea 11 · 2026-09-06 13:01 · `s-20260906T124421-acb9871f` · el turno de Zargon se juega solo a ritmo de mesa; 431 → 444 tests, 12 nuevos; typecheck y build en verde · `useTurnoDeZargon.ts` (nuevo), `useAccionesDeTurno.ts`, `Juego.tsx`, `TurnPanel.tsx` · `02499a8`, fusionado en `649b35b`
- LISTA · tarea 43 · 2026-09-06 12:49 · `s-20260906T124346-dd4060bd` · 431 tests (sin cambios); botón y rama de render quitados, `BoardVerify.tsx` intacto, puerta trasera con `?verificar` · `src/App.tsx` · `cd93174`
- LISTA · tarea 34 · 2026-09-06 08:26 · `s-20260906T103034-b376065f` (hecha por `6905402d`) · publicada en <https://salasgar.github.io/Hero-Quest/>; `VERSION` no pasa a ser el hash · `2994ffc`
- LISTA · tarea 09 · 2026-09-06 07:21 · `s-20260906T103034-b376065f` (hecha por `992c726d`) · 17 tests nuevos; 100 partidas por nivel, los tres niveles al 100 % de victorias; pega-y-se-va del 48 % al 6-7 % · `edc0c54`, `29e878b`, `4a68069`
- LISTA · tarea 10 · 2026-09-06 07:14 · `s-20260906T103034-b376065f` (hecha por `47e1fced`) · `npm run sim`: 100 partidas, 100 % de victorias, 7,9 rondas de media · `694e4b2`
- LISTA · tarea 33 · 2026-09-06 07:08 · `s-20260906T103034-b376065f` (hecha por `66e4a4ea`) · las dos modalidades son la misma acción con o sin `dados` · `db96bf2`
- LISTA · tarea 35 · 2026-09-06 07:08 · `s-20260906T103034-b376065f` (hecha por `946ca4aa`) · 6 tests nuevos, 2 fallan con el código viejo; `estado.mision.entrada` es un dato derivado · `87ea055`
- LISTA · tarea 32 · 2026-09-06 07:00 · `s-20260906T103034-b376065f` (hecha por `66e4a4ea`) · niebla por `monstruosEnTablero` y `puertasVisibles`; `npm run relevo`; falta la prueba con dos navegadores · `be4adf6`
- LISTA · tarea 16 · 2026-09-05 22:18 · `s-20260906T103034-b376065f` (hecha por `86ebd3db` y `946ca4aa`) · ocho héroes, clases repetidas y colocación por cercanía; `calabozo.ts` no se toca · `56f5f21` + `d3d01e1`
- LISTA · tarea 21 · 2026-09-05 20:09 · `s-20260906T103034-b376065f` (hecha por `6905402d`) · 2 eventos nuevos; test de los 12 hechizos con segunda frase · `72a7c7f`
- LISTA · tarea 08 · 2026-09-05 20:06 · `s-20260906T103034-b376065f` (hecha por `66e4a4ea`) · `siguienteAccionDeZargon` y `turnoDeZargon`; pesos sin medir · `2203e01`
- LISTA · tarea 20 · 2026-09-05 19:57 · `s-20260906T103034-b376065f` (hecha por `6905402d`) · 3 eventos nuevos · `740f54a`
- LISTA · tarea 19 · 2026-09-05 19:50 · `s-20260906T103034-b376065f` (hecha por `6905402d`) · 6 casillas por puerta; test de las 494 casillas (28 con puerta al alcance) · `c08bbc0`
- LISTA · tarea 31 · 2026-09-05 19:46 · `s-20260906T103034-b376065f` (hecha por `992c726d`) · 14 tests nuevos; sondeo `desde=0` a propósito · `15c852a`
- LISTA · tarea 30 · 2026-09-05 19:17 · `s-20260906T103034-b376065f` (hecha por `66e4a4ea`) · protocolo del relevo; nada desplegado · `6b07f82`
- LISTA · tarea 06 · 2026-09-05 19:12 · `s-20260906T103034-b376065f` (hecha por `2921da7f`) · `buscadoTesoro` pasa a pares `{heroe, sala}` · `0dc95d5`
- LISTA · tarea 18 · 2026-09-05 19:05 · `s-20260906T103034-b376065f` (hecha por `797b0a1c`) · `monstruosEnTablero`; 12 tests viejos corregidos · `632d089`
- LISTA · tarea 03 · 2026-09-05 18:58 · `s-20260906T103034-b376065f` (hecha por `2921da7f`) · selector y reductor afirmados en el mismo test · `3bbf380`
- LISTA · tarea 13 · 2026-09-05 18:53 · `s-20260906T103034-b376065f` (hecha por `797b0a1c`) · `puertasVistas`; 5 tests · `de466ec`
- LISTA · tarea 02 · 2026-09-05 18:50 · `s-20260906T103034-b376065f` (hecha por `b63aa070`) · 5 tests, 2 fallan al revertir; entrada en fila india de 4 casillas · `1c8a533`
- LISTA · tarea 17 · 2026-09-05 18:43 · `s-20260906T103034-b376065f` (hecha por `b63aa070`) · 7 tests, 4 fallan sin los criterios · `8fbd674`
- LISTA · tarea 05 · 2026-09-05 18:37 · `s-20260906T103034-b376065f` (hecha por `2921da7f`) · un dado menos en el foso; suelo solo para héroes · `39f05f5`
- LISTA · tarea 14 · 2026-09-05 18:34 · `s-20260906T103034-b376065f` (hecha por `b63aa070`) · los 12 hechizos lanzables; 4 tests · `d9c4f00`
- LISTA · tarea 04 · 2026-09-05 18:27 · `s-20260906T103034-b376065f` (hecha por `2921da7f`) · 4 tests nuevos · `9bcd7d1`
- LISTA · tarea 07 · 2026-09-05 18:20 · `s-20260906T103034-b376065f` (hecha por `b63aa070`) · armadura vetada; armas grandes sin lista · `85948b1`
- LISTA · tarea 12 · 2026-08-22 08:52 · `s-20260906T103034-b376065f` (hecha por `46312c98`) · trabajo huérfano de `reducer.ts` rescatado · `8b0b7dc`
- LISTA · tarea 01 · 2026-08-22 08:44 · `s-20260906T103034-b376065f` (hecha por `fae5dfc8`) · 4 tests de la regla · `a24b396`

Lo que cada sesión aprendió por el camino —los «cuatro cosas que no estaban escritas» de
cada tarea— sigue en el registro de `_ESTADO-antiguo-2026-09-06.md`, que es donde hay que
leerlo antes de tocar el motor, la IA o la red.

## Incidencias de coordinación

Derivado de `hechos/incidencias/`. Diez ficheros: dos de la noche y la tarde del día 7 (la
62 y la 59), uno de la mañana del mismo día (la 38), cinco de las sesiones de la tarde del 6
y el de la migración:

- **`s-20260907T145032-f832894d.md` (la de la 62):** dos cabos sueltos, ninguno reparable
  desde su ficha. (1) La cortina de paso (`Transicion.tsx`) recibe los nombres de
  `comoSeLlaman` en `App.tsx:22`, que los calcula sobre los `HeroeElegido` **antes** de que
  exista partida: anuncia «Bárbaro» y tres segundos después el diario dice «Grímur, hijo
  del Trueno». Arreglarlo de verdad pide la semilla, que elige `Juego.tsx` (T45). (2) Con
  los nombres largos, el molde del relato da «Grímur, hijo del Trueno el Bárbaro»: se
  entiende pero pesa; queda apuntado para **T61**, que es de quien son `narrator/local.ts`
  y `narrator/relato.ts`.

- **`s-20260907T080909-f84dcfe8.md` (la de la 38):** `motivoDeLaJugada` —lo que un monstruo
  dice que va a hacer— quedó escrito y probado, pero ninguna pantalla lo llama todavía.

- **`s-20260907T140727-559d19ac.md` (la de la 59):** la ficha suponía que la portada era
  una escena distinta del logotipo, escrito antes de ver el fichero; la imagen resultó
  traer ya pintado «Hero Quest» con el mismo trazo que `logotipo.webp`, más un hada y la
  coletilla «Versión Salas Oliver, para todas las edades». Decisión de pantalla: sustituye
  al logotipo grande solo en `EleccionDeHeroes.tsx`; T41 no se toca en los otros dos
  sitios. Sin navegador en el entorno para comprobarlo con una captura real.

- **`s-20260906T141818-ff83f12c.md` (la que coordina):** `main` divergió: la sesión de la
  56 fusionó su código en el `main` local sin empujar (y dejó su terminada sin rastrear),
  y la de la 53 empujó `HEAD:main` desde su worktree. Resuelto con `pull --rebase` (la 56
  queda como `7ae9fb9`), verificado y empujado; la 56 se cerró por relevo y la terminada
  ajena se commiteó tal cual. Lección: fusionar en `main` sin empujar no cierra nada
  (regla 7), y `push HEAD:main` desde un worktree solo vale con la rama rebasada y
  terminada.

- **`s-20260906T174336-09ec25b3.md` (la de la 57):** el enlace `node_modules` de cada
  worktree sale como `??` porque `.gitignore` dice `node_modules/` con barra, que no
  cubre un enlace simbólico: un `git add -A` se lo llevaría (T12 otra vez); arreglo de
  una línea que encaja en **T56**. `npm run preview` sigue sin servir (confirmada la de
  la 41). `Version.tsx` dice `"local"` y el registro de partida `"dev"` para el mismo
  «sin commit». Y a las 17:58Z había seis sesiones con el tablón sin regenerar desde las
  17:35Z, reservado por la sesión que escribía las fichas: quien reserve el tablón, que lo
  suelte entre tanda y tanda.

- **`s-20260906T125522-43d82a6b.md` (la de la 41):** `npm run preview` (vite 7.3.6)
  responde 404 a toda petición con `Sec-Fetch-Dest: script`, incluido `index.html`: la
  página sale en blanco y no se puede comprobar la construcción en local con lo que el
  repositorio recomienda; Pages no está afectado. Receta que funciona: servir `dist/`
  con `python3 -m http.server` bajo un enlace `Hero-Quest`. Y el PNG del logotipo era
  RGBA con fondo **blanco opaco**. Las dos cosas están en **T56** (la receta al README) y
  en la ficha de T41. Además, su terminada dejó dicho que el hash se escribió antes del
  último rebase y hubo que corregirlo: recogido en el orden de cierre (regla 14,
  `proyecto.md`, `_COMUN.md`).
- **`s-20260906T124421-acb9871f.md` (la de la 11):** las regeneraciones del tablón de las
  13:15Z y 13:45Z pintaron libres la 11 y la 42 con reclamo vivo, porque los reclamos
  estaban en copias de `hechos/` de los worktrees. Y una trampa: `npx vitest run` en el
  árbol principal cuenta los tests de los worktrees de las demás sesiones (3072 en vez de
  450); arreglo en `vite.config.ts` con `exclude: ['**/node_modules/**', '**/dist/**',
  '**/.claude/**']`: **es la T56**. Mientras tanto: `npx vitest run --exclude
  "**/node_modules/**" --exclude "**/.claude/**"`.
- **`s-20260906T124412-0cdb5d41.md` (la de la 42):** la 42 y la 11 comparten
  `TurnPanel.tsx` y fueron en paralelo; se coordinaron por mensajes. La cuenta de sesiones
  del tablón las daba por independientes.
- **`s-20260906T124430-0169046b.md` (la de la 40):** tres reclamos de la 42 en tres
  copias de `hechos/`; ganó el más antiguo y las otras dos cedieron (a la 40 y a la 11).

Y el de la migración, `s-20260906T103034-b376065f.md`:

1. **T16**: la tabla vieja decía «en curso» y el registro la daba hecha; git tiene `d3d01e1`.
   Resuelto en su terminada.
2. **T10 y T34** no tenían hash en el tablón viejo; tomados de `git log` (`694e4b2`, `2994ffc`).
3. **Incidencias abiertas del tablón viejo**: la de `Instrucciones.tsx` está resuelta
   (`b47310f`); la del número de revisión del relevo pasa a `autorizaciones.md` como firma
   pendiente; la del tablón como cuello de botella es lo que esta migración quita; las de
   `d3dced0` y T12 son históricas.
4. **Un segundo fichero en `.claude/sesiones/`** (`3de1b0d8…`, 10:26Z, mismo árbol, sin
   ficheros) durante la migración, sin reclamo en `hechos/`. Nada que reconciliar.
5. **Un worktree de T34 sigue en disco** (`.claude/worktrees/t34-publicar-en-pages`). No se toca.
6. **Bandas puestas a posteriori a T1–T12**, a petición de Juan Luis.
7. **El número de revisión del relevo (`1ba2a4c`, sesión `6905402d`) llegó a `origin/main`
   mientras se migraba**, y el primer `push` de la migración se rechazó. Resuelto con rebase:
   el tablón viejo conservado es la versión de `origin`, este se regeneró desde `hechos/` y
   la firma de Juan Luis del 2026-09-06 que ese commit transcribía está en
   `autorizaciones.md`. Ese trabajo no tiene número de tarea y no lleva terminada; su
   registro está en el tablón antiguo.
8. **Ocho filas T36–T43 en el tablón viejo, en la rama `worktree-nuevas-tareas-sep-06`**
   (sesión de banda BAJO, `4df18dd`), sin fichas detrás y sin banda. Las fichas se
   escribieron después en `main` (T36–T44) respetando esos números; la rama no se fusiona.

Los automatismos activos y las rutas del proyecto están en `proyecto.md`, no aquí: este
fichero se regenera entero y se los llevaría por delante.
