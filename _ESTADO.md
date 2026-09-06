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

Regenerado: 2026-09-06 13:20Z · por la sesión `s-20260906T103034-b376065f` (la que migró el
reparto; no reclamó ninguna tarea). Las regeneraciones de las 12:50Z, 13:15Z y 13:45Z de
esta misma sesión pintaron libres la 11, la 40 y la 42 cuando ya tenían reclamo: los
reclamos estaban en las copias de `hechos/` de los worktreks y no en este árbol. Está en
`hechos/incidencias/` (la 8 de la migración y la de `s-20260906T124421-acb9871f`).

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
    añaden **al final de la numeración** (la siguiente es la T36) y la vieja se marca con
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
    verde (`npx vitest run` y `npm run typecheck`) → commit del código (sale el hash) →
    terminada con el hash, `CERRADA`, tablón y ficha → un commit con rutas explícitas (tus
    `hechos/` por sid, `_ESTADO.md`, la ficha) → `push`; si el `push` se rechaza, trae lo de
    los demás y regenera el tablón otra vez en vez de fusionarlo. Un reclamo vivo es una
    sesión viva, aunque no aparezca en `.claude/sesiones/` ni tenga ficheros reservados; lo
    que deje preparado (índice, rama de worktree sin fusionar) no se materializa por
    iniciativa ajena: si su reclamo está vivo, se avisa; si caducó, se releva y se verifica.

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
| 22 | T22 · Saber qué hace cada hechizo antes de lanzarlo | tareas/T22-que-hace-cada-hechizo.md | `src/ui/Instrucciones.tsx` en `main` · **cumplida** (`b47310f`) | 2 h | MEDIO | 11, 36 | `TurnPanel.tsx`, `Instrucciones.tsx`, `HeroSheet.tsx`, `estilos.css`, tests | manual | **PENDIENTE** | |
| 30 | T30 · El relevo de acciones | tareas/T30-relevo-de-acciones.md | ninguna | 4 h | ALTO | — | `server/`, `src/red/protocolo.ts`, `tests/red-protocolo.test.ts` | manual | LISTA (`6b07f82`) · el despliegue espera firma en `autorizaciones.md` | |
| 31 | T31 · La partida en red, en el cliente | tareas/T31-sesion-de-red.md | 30 LISTA | 4 h | ALTO | — | `src/red/cliente.ts`, `usePartida.ts`, `tests/red-cliente.test.ts` | manual | LISTA (`15c852a`) | |
| 32 | T32 · La pantalla de quien juega desde su casa | tareas/T32-vista-del-heroe-remoto.md | 31 y 18 LISTA | 4 h | ALTO | — | `VistaDeHeroe.tsx`, `BoardMirror.tsx`, `Juego.tsx`, `useAccionesDeTurno.ts`, `App.tsx`, `estilos.css`, tests | manual | LISTA (`be4adf6`) | |
| 33 | T33 · Quién tira los dados de quien juega desde su casa | tareas/T33-quien-tira-los-dados.md | 31 LISTA | 2 h | MEDIO | — | `TurnPanel.tsx`, `DiceInput.tsx`, `useAccionesDeTurno.ts`, tests | manual | LISTA (`db96bf2`) | |
| 34 | T34 · Publicar la aplicación en GitHub Pages | tareas/T34-publicar-en-pages.md | firma de Pages (firmada 2026-09-06) | 2 h | MEDIO | — | `.github/workflows/pages.yml`, `vite.config.ts`, `README.md`, `main.tsx`, `BoardVerify.tsx` | manual | LISTA (`2994ffc`) | |
| 35 | T35 · La salida crece con el grupo | tareas/T35-la-salida-crece-con-el-grupo.md | 16 LISTA | 1 h | MEDIO | — | `partida.ts`, `tests/ocho-heroes.test.ts` | manual | LISTA (`87ea055`) | |
| 36 | T36 · Todos los dados los tira la aplicación | tareas/T36-dados-siempre-automaticos.md | ninguna (firma del 2026-09-06 en `autorizaciones.md`) | 2 h | MEDIO | 22 | `useAccionesDeTurno.ts`, `DiceInput.tsx`, `VistaDeHeroe.tsx`, `Juego.tsx`, `TurnPanel.tsx`, tests | manual | **PENDIENTE** | |
| 37 | T37 · Un icono para cada héroe | tareas/T37-iconos-de-heroes.md | ninguna · no a la vez que 42, 38, 41 | 3 h | MEDIO | 41 | `iconos.tsx` (nuevo), `BoardMirror.tsx`, `EleccionDeHeroes.tsx`, `types.ts`, `partida.ts`, `estilos.css`, tests | manual | **PENDIENTE** | |
| 38 | T38 · Monstruos agresivos, miedosos y prudentes | tareas/T38-monstruos-agresivos-y-miedosos.md | 42 LISTA | 4 h | ALTO | — | `src/ai/`, `types.ts`, `partida.ts`, `scripts/simular.ts`, tests | manual | **PENDIENTE** (42 LISTA) | |
| 39 | T39 · El diario en dos modos: informe y relato | tareas/T39-diario-informe-y-relato.md | 42 LISTA (firma del relato, 2026-09-06) | 4 h | MEDIO | — | `narrator/local.ts`, `narrator/relato.ts` y `frases.ts` (nuevos), `MasterLog.tsx`, tests | manual | **PENDIENTE** (42 LISTA) | |
| 40 | T40 · Todas las salas con puerta en la primera misión | tareas/T40-todas-las-salas-con-puerta.md | ninguna | 2 h | MEDIO | 42 | `quests/calabozo.ts`, `tests/quest.test.ts` | manual | LISTA (`3eef6dc`) | |
| 41 | T41 · El logotipo y las imágenes de ambientación | tareas/T41-logotipo-y-ambientacion-visual.md | ninguna (firma del 2026-09-06) · no a la vez que 37, 43 | 3 h | MEDIO | 37 | `public/`, `App.tsx`, `EleccionDeHeroes.tsx`, `Transicion.tsx` (nuevo), `estilos.css` | manual | **EN CURSO** | `s-20260906T125522-43d82a6b` · caduca 18:55Z |
| 42 | T42 · Cada monstruo con su nombre propio | tareas/T42-nombres-propios-de-monstruos.md | ninguna · antes que 37, 38, 39 | 2 h | MEDIO | 40 | `data/nombres.ts` (nuevo), `partida.ts`, `types.ts`, `narrator/local.ts`, `TurnPanel.tsx`, tests | manual | LISTA (`372a0f0`, fusionada en `main` a las 13:15Z; 467 tests) | |
| 43 | T43 · Quitar la pestaña «Verificar tablero» | tareas/T43-quitar-verificar-tablero.md | ninguna · no a la vez que 41 | 1 h | BAJO | — | `App.tsx` (`estilos.css` solo si hace falta) | manual | LISTA (`cd93174`) | |
| 44 | T44 · Sonidos de ambientación | tareas/T44-sonidos-de-ambientacion.md | ninguna · no a la vez que 11, 36 | 3 h | MEDIO | — | `sonidos.ts` (nuevo), `public/sonidos/`, `Juego.tsx`, `VistaDeHeroe.tsx`, tests | manual | **PENDIENTE** | |
| 45 | T45 · El catálogo de misiones y su selector | tareas/T45-catalogo-y-selector-de-misiones.md | ninguna · no a la vez que 11, 36, 37, 38, 41, 44 | 4 h | ALTO | — | `quests/index.ts` (nuevo), `Juego.tsx`, `EleccionDeHeroes.tsx`, `red/cliente.ts`, `scripts/simular.ts`, tests | manual | **PENDIENTE** | |
| 46 | T46 · La segunda misión | tareas/T46-segunda-mision.md | 45 LISTA | 4 h | ALTO | — | `quests/<id>.ts` (nuevo), `quests/index.ts` | manual | **BLOQUEADA** (45) | |
| 47 | T47 · La tercera misión, con el troll | tareas/T47-tercera-mision-con-el-troll.md | 46 LISTA | 3 h | MEDIO | — | `quests/<id>.ts` (nuevo), `quests/index.ts`, `monsters.ts` (solo el troll) | manual | **BLOQUEADA** (46) | |
| 48 | T48 · Propuestas de mejora para que Juan Luis elija | tareas/T48-propuestas-de-mejora.md | ninguna (mejor tras 11 y 36) | 2 h | ALTO | — | `tareas/_PROPUESTAS-2026-09.md` (nuevo) | manual | **PENDIENTE** | |
| 49 | T49 · Más especies de monstruo | tareas/T49-mas-especies-de-monstruo.md | 42 LISTA · no a la vez que 38, 47 | 3 h | MEDIO | — | `monsters.ts`, `personalities.ts`, `nombres.ts`, `tests/monstruos.test.ts` | manual | **PENDIENTE** (42 LISTA; no a la vez que 38) | |
| 50 | T50 · Poderes de monstruo: hechizos enemigos, telarañas y emboscadas | tareas/T50-poderes-de-monstruo.md | 49 y 42 LISTA · nada más sobre `reducer.ts` a la vez | 5 h | ALTO | — | `types.ts`, `reducer.ts`, `selectors.ts`, `monsters.ts`, `zargon.ts`, `narrator/local.ts`, tests | manual | **BLOQUEADA** (49) | |

Los números saltan de 22 a 30 a propósito (`proyecto.md`); no hay tareas perdidas. No hay
`hechos/recursos/` con nada dentro: ningún tope de procesos fijado.

**Libres por estado:** 22, 36, 37, 39, 44 y 49 (MEDIO); 38, 45 y 48 (ALTO). Ninguna BAJO.
**Por ficheros, sin chocar con el único reclamo vivo (la 41, `EleccionDeHeroes.tsx`,
`App.tsx`, `estilos.css`) ni entre sí:** **22+36** (MEDIO, encadenadas: `TurnPanel.tsx`),
**39** (MEDIO), **44** (MEDIO; `Juego.tsx`; no a la vez que la 36), **49** (MEDIO), **38**
(ALTO; no a la vez que 49: `personalities.ts`) y **48** (ALTO). Es decir: 22+36, 39, 49 y
48 pueden ir a la vez; 44 espera a la 36, 38 a la 49. **Cuando cierre la 41:** 37 (MEDIO;
también comparte `types.ts` con 38) y 45 (ALTO). 46 se libera con 45, 50 con 49; 15
espera la palabra de Juan Luis.

**Encadenables:** 22+36 (comparten `TurnPanel.tsx`: seguidas, nunca en paralelo). La cuenta
anterior de «cuatro sesiones a la vez» estaba mal: daba por independientes 40+42 y 11+22+36, y
la 42 toca `TurnPanel.tsx` igual que la 11, la 22 y la 36 (lo dijo
`hechos/incidencias/s-20260906T124412-0cdb5d41.md`). **Sesiones que caben a la vez sin
estorbarse ahora mismo: cuatro nuevas** (22+36, 39, 49 y 48), además de la viva (41).

## Registro de finalizaciones

Derivado de `hechos/terminadas/`. Una línea por fichero, más reciente arriba. Los 25
primeros ficheros los escribió la sesión de la migración a partir del registro del tablón
viejo; la sesión que de verdad hizo cada tarea va entre paréntesis, con el identificador de
conversación que usaba el tablón viejo. Fecha: la del commit, en UTC. Desde la 43, cada
terminada la escribe la sesión que cerró la tarea.

Formato: `LISTA · tarea NN · AAAA-MM-DD HH:MM · sid · recuento · ruta de la salida`

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

Derivado de `hechos/incidencias/`. Cuatro ficheros. Tres de las sesiones de la tarde:

- **`s-20260906T124421-acb9871f.md` (la de la 11):** las regeneraciones del tablón de las
  13:15Z y 13:45Z pintaron libres la 11 y la 42 con reclamo vivo, porque los reclamos
  estaban en copias de `hechos/` de los worktrees. Y una trampa: `npx vitest run` en el
  árbol principal cuenta los tests de los worktrees de las demás sesiones (3072 en vez de
  450); arreglo en `vite.config.ts` con `exclude: ['**/node_modules/**', '**/dist/**',
  '**/.claude/**']`, que no está en la ficha de nadie: **tarea de una línea para quien
  Juan Luis diga**. Mientras tanto: `npx vitest run --exclude "**/node_modules/**"
  --exclude "**/.claude/**"`.
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
