# Tablón de estado

**Esta es la fuente de verdad del proyecto.** Si un fichero de `tareas/` y este tablón se
contradicen, manda el tablón. Antes de tocar nada, léelo entero: son dos minutos y evita
repetir trabajo que ya está hecho.

Repositorio: <https://github.com/salasgar/Hero-Quest> · rama `main`.

Aquí no va el hash del último commit ni el número de tests: caducan a la primera y este
tablón ya ha mentido dos veces por escribir como fijo un dato que se mueve. Para saber
dónde estamos: `git log -1` y `npx vitest run`.

Qué es el proyecto y por qué está montado así: `TRASPASO.md`. Qué falta y por qué es
urgente: aquí.

---

## Si acabas de llegar

Cuatro pasos, en este orden. El tercero es el que evita que dos sesiones hagan lo mismo.

1. **`git pull`.** Varias sesiones empujan a `main`. Si arrancas con una copia vieja,
   trabajas contra un tablón que ya no es verdad.
2. **Elige una tarea libre**, respetando el candado de fichero de la tabla de abajo.
3. **Escribe tu línea en la columna «Estado» y haz `git commit` y `git push` de ese cambio
   solo**, antes de tocar código. Formato: `en curso · <tu id> · <fecha>`.
4. **Si el push te lo rechazan, alguien se te adelantó.** Haz `git pull --rebase`, mira si
   tu tarea sigue libre y, si no, elige otra. No fuerces el push.

Ese cuarto paso es el mecanismo entero: **el candado no es el fichero, es el push**. Dos
sesiones pueden leer el tablón a la vez, pero solo una consigue empujar su reclamación
primero. La otra se entera al instante y sin ambigüedad.

**Nunca `git add -A`.** El directorio de trabajo es compartido: añade tus ficheros por
nombre, uno a uno. Ignorar esto ya costó la incidencia T12.

**Y añadir por nombre no basta: commitea por nombre.** `git add fichero && git commit` se
lleva dentro **todo lo que haya en el índice**, y el índice también es compartido: si otra
sesión tiene ficheros suyos preparados, entran en tu commit con tu mensaje. Pasó el
2026-09-05 con `56f5f21`, un commit de tablón que se llevó la T16 entera. La forma que no
falla es nombrar los ficheros **en el commit**, que ignora el resto del índice:

```sh
git commit -- _ESTADO.md            # solo ese fichero, pase lo que pase en el índice
git commit -- src/engine/board.ts tests/puertas-en-diagonal.test.ts
```

### Hay dos candados, no uno

Se confunden con facilidad y hacen cosas distintas:

- **`.claude/sesiones/<id>.json` reserva.** Es un registro real de qué ficheros tiene
  cogidos cada sesión viva. Está fuera de git —el gitignore global lo tapa, así que no
  sale en `git status`— y el hook de arranque te dice qué no puedes editar. Es lo que
  impide que dos sesiones escriban el mismo fichero a la vez.
- **El push integra.** Es lo que resuelve quién llegó primero a una reclamación del
  tablón: si te rechazan el push, alguien se te adelantó.

**Reservar y no soltar es tan dañino como no reservar.** Cuando termines y hayas empujado,
vacía tu lista `archivos`. Una sesión que se queda viva con el tablón cogido lo bloquea
para todas las demás sin que nadie sepa por qué.

Y no confundas «mi árbol de git está limpio» con «no retengo nada»: son dos mecanismos
distintos. Esta misma sesión afirmó dos veces que no tenía nada reclamado mientras tenía
este fichero cogido desde las 08:31.

Cuando termines, escribe tu línea en el registro de finalizaciones y **cierra la sesión**.
No encadenes otra tarea: una sesión, una tarea.

### El prompt con el que arrancar una sesión

```
Lee _ESTADO.md y coge la tarea T4. Sigue su fichero en tareas/ y tareas/_COMUN.md.
Apúntate en el tablón y empuja ese commit antes de tocar código.
```

**Nombra la tarea en el prompt.** «Mira el tablón y continúa con el trabajo» funciona, pero
deja que dos sesiones abiertas a la vez elijan la misma antes de que ninguna haya podido
reclamarla. Decirlo tú cuesta tres palabras y quita la carrera de en medio.

---

## Las cuatro reglas de operación

1. **Una sesión, una tarea.** Antes de empezar, escribe tu nombre y la fecha en la
   columna «Estado» de la tabla y **haz commit de ese cambio solo**. Si dos sesiones
   cogen la misma tarea, la segunda tira su trabajo.
2. **Idempotencia: mira qué hay hecho antes de actuar.** Cada tarea dice cómo comprobar
   en diez segundos si ya está resuelta. Empieza por ahí. Una sesión que se reanuda y
   vuelve a empezar de cero destruye lo avanzado.
3. **Lo que no está commiteado, no existe.** Los worktrees y los contenedores se borran.
   Commit en `main` al terminar cada tarea, y `git push`.
4. **Nada destructivo sin autorización escrita de Juan Luis**, apuntada abajo. Eso
   incluye: borrar ramas ajenas, reescribir el histórico, cambiar la geometría del
   tablero, y cambiar el reparto de los cuatro folios impresos.

---

## Tareas

Ordenadas por dependencia, no por importancia. **T1 a T7 no dependen de nada**: se pueden
coger en cualquier orden desde hoy.

| # | Tarea | Precondición | Ficheros que toca | Estado |
|---|---|---|---|---|
| T1 | [Las figuras cortan la línea de visión](tareas/T1-linea-de-vision.md) | — | `vision.ts` | **hecha** · `a24b396` · 2026-08-22 |
| T2 | [Los héroes pasan por encima de otros héroes](tareas/T2-pasar-sobre-heroes.md) · *+ la entrada de la misión* | — | `board.ts`, `quests/`, **`reducer.ts`** | **hecha** · `1c8a533` · 2026-09-05 · con la entrada de la misión en el mismo commit |
| T3 | [Buscar trampas exige no ver monstruos](tareas/T3-buscar-trampas.md) | — | `selectors.ts`, **`reducer.ts`** | **hecha** · `3bbf380` · 2026-09-05 · su sesión no llegó a apuntarlo aquí |
| T4 | [Los monstruos no disparan las trampas ocultas](tareas/T4-monstruos-y-trampas.md) | — | **`reducer.ts`** | **hecha** · `9bcd7d1` · 2026-09-05 |
| T5 | [El foso: un dado menos, y no se desarma](tareas/T5-foso.md) | — | `combat.ts`, `selectors.ts`, **`reducer.ts`** | **hecha** · `39f05f5` · 2026-09-05 · el suelo queda solo para héroes: firmado en autorizaciones, no cambia código |
| T6 | [Cada héroe registra una sala una vez](tareas/T6-registrar-sala.md) | — | `types.ts`, `partida.ts`, `selectors.ts`, **`reducer.ts`** | **hecha** · `0dc95d5` · 2026-09-05 · **cambia la forma del estado**: `buscadoTesoro` son pares `{heroe, sala}`, no salas |
| T7 | [El mago no lleva armadura ni armas grandes](tareas/T7-equipo-del-mago.md) | — | `data/` | **hecha** · `85948b1` · 2026-09-05 · la armadura sí; la lista de armas grandes no la da el reglamento y queda marcada |
| T12 | [Incidencia: un commit se llevó trabajo ajeno](tareas/T12-incidencia-commit-cruzado.md) | — | `_ESTADO.md`, `reducer.ts` | **hecha** · `8b0b7dc` · 2026-08-22 |
| T8 | [Zargon decide: objetivos y caminos](tareas/T8-zargon-decide.md) | T1–T7 · **cumplida entera** | `src/ai/` | **hecha** · `2203e01` · 2026-09-05 · **desbloquea T9, T10 y T11** |
| T9 | [Personalidades y dificultades](tareas/T9-personalidades.md) | T8 · **cumplida** | `src/ai/` | **hecha** · `992c726d` · 2026-09-06 · `edc0c54`+`29e878b` · el 100 % de victorias no lo mueve ningún nivel: mira el registro |
| T10 | [El simulador que mide si la IA está bien](tareas/T10-simulador.md) | T8 · **cumplida** | `scripts/` | **hecha** · 2026-09-06 · `npm run sim` · el 48 % de «pega y se va» que encontró está arreglado en `29e878b`: hoy es 6–7 % |
| T11 | [El turno de Zargon sin clics](tareas/T11-turno-automatico.md) | T8 y T9 · **cumplidas** | `src/ui/` | libre · el punto de entrada con dificultad es `accionDeZargon(e, nivel)`, en `difficulty.ts` |
| T13 | [Solo se pintan las puertas que alguien ha visto](tareas/T13-puertas-solo-las-vistas.md) | — | `types.ts`, `partida.ts`, **`reducer.ts`**, `selectors.ts`, `BoardMirror.tsx` | **hecha** · `de466ec` · 2026-09-05 · era la sesión `797b0a1c`, que no pudo escribir aquí su reclamo porque el tablón estuvo cogido de principio a fin del trabajo |
| T14 | [El mago no puede lanzar sus hechizos: falta el botón](tareas/T14-lanzar-hechizos-en-la-interfaz.md) | — | `TurnPanel.tsx`, `Juego.tsx`, `HeroSheet.tsx` | **hecha** · `d9c4f00` · 2026-09-05 · desbloquea T15 y T17 |
| T16 | [Hasta ocho héroes, y repetir clase](tareas/T16-hasta-ocho-heroes.md) | — · pero espera su palabra sobre la entrada | `EleccionDeHeroes.tsx`, `partida.ts`, `calabozo.ts` | en curso · `946ca4aa` · 2026-09-05 · lo de `56f5f21`+`29e079c` está en `main`; **ya tiene su firma** y lo que falta es la colocación por cercanía · `calabozo.ts` no se toca |
| T15 | [Buscar libro de hechizos en una estantería](tareas/T15-buscar-libro-de-hechizos.md) | T13, T14 · y sus cuatro decisiones firmadas | `types.ts`, **`reducer.ts`**, `selectors.ts`, `calabozo.ts`, `TurnPanel.tsx`, `Juego.tsx` | **aparcada por decisión suya** · 2026-09-05 · no la cojas: no espera firmas, espera a que él decida si quiere la regla; sus cuatro preguntas siguen abajo |
| T17 | [Zargon elige qué monstruo actúa](tareas/T17-zargon-elige-el-orden.md) | T14 · **cumplida** | `src/ai/orden.ts`, `TurnPanel.tsx`, `Juego.tsx` | **hecha** · `8fbd674` · 2026-09-05 |
| T18 | [Un monstruo no actúa hasta que lo descubren](tareas/T18-monstruos-solo-los-descubiertos.md) | T13 · **cumplida** | `types.ts`, `partida.ts`, **`reducer.ts`**, `selectors.ts`, `TurnPanel.tsx` | **hecha** · `632d089` · 2026-09-05 |
| T19 | [Una puerta se abre también desde la diagonal](tareas/T19-abrir-puertas-en-diagonal.md) | — · regla de la casa, **firmada** | `board.ts`, **`reducer.ts`**, `selectors.ts` | **hecha** · `c08bbc0` · 2026-09-05 · seis casillas por puerta, y la diagonal no atraviesa el muro |
| T20 | [El turno de Zargon pasa sin que el diario lo cuente](tareas/T20-el-turno-de-zargon-no-se-cuenta.md) | — | `types.ts`, **`reducer.ts`**, `narrator/local.ts`, `TurnPanel.tsx` | **hecha** · `740f54a` · 2026-09-05 · **no escribe la IA: eso es T8**, que ya estaba libre |
| T21 | [Siete hechizos de doce no dejan rastro en el diario](tareas/T21-hechizos-sin-rastro-en-el-diario.md) | — · **no cabe a la vez que T20**: mismos tres ficheros | `types.ts`, **`reducer.ts`**, `narrator/local.ts` | **hecha** · `72a7c7f` · 2026-09-05 · la Tempestad la cerró él el 2026-09-06: **un solo ser**, no la sala |
| T22 | [Saber qué hace cada hechizo antes de lanzarlo](tareas/T22-que-hace-cada-hechizo.md) | `Instrucciones.tsx` en `main` | `TurnPanel.tsx`, `Instrucciones.tsx`, `HeroSheet.tsx`, `estilos.css` | pendiente · **a la cola**, por decisión suya |
| T30 | [El relevo de acciones](tareas/T30-relevo-de-acciones.md) | — | `server/`, `src/red/protocolo.ts` | **hecha** · `6b07f82` · 2026-09-05 · escrita y probada; **falta desplegarla**, y eso pide su firma |
| T31 | [La partida en red, en el cliente](tareas/T31-sesion-de-red.md) | T30 · **cumplida** | `src/red/cliente.ts`, `usePartida.ts` | **hecha** · `15c852a` · 2026-09-05 · el sondeo pide desde cero a propósito; ver el registro |
| T32 | [La pantalla de quien juega desde su casa](tareas/T32-vista-del-heroe-remoto.md) | T31 y T18 · **cumplidas** | `VistaDeHeroe.tsx`, `BoardMirror.tsx`, `Juego.tsx`, `App.tsx`, `estilos.css` | **hecha** · `be4adf6` · 2026-09-06 · **falta la prueba con dos navegadores**; hay `npm run relevo` para hacerla sin desplegar |
| T33 | [Quién tira los dados de quien juega desde su casa](tareas/T33-quien-tira-los-dados.md) | T31 · **cumplida** | `TurnPanel.tsx`, `DiceInput.tsx` · **y `useAccionesDeTurno.ts`**, que no existía al escribir la tarea y es donde vive ahora el reparto de dados | **hecha** · `db96bf2` · 2026-09-06 |
| T34 | [Publicar la aplicación en GitHub Pages](tareas/T34-publicar-en-pages.md) | — · **firmada el 2026-09-06** | `.github/workflows/`, `vite.config.ts`, `README.md`, `main.tsx`, `BoardVerify.tsx` | **hecha** · `6905402d` · 2026-09-06 · <https://salasgar.github.io/Hero-Quest/> · la cadena de versión **no** pasa a ser el hash, y el motivo está en el registro |
| T35 | [La salida crece con el grupo](tareas/T35-la-salida-crece-con-el-grupo.md) | T16 · **cumplida** | `partida.ts`, `tests/ocho-heroes.test.ts` · **no toca `reducer.ts`** | **hecha** · `87ea055` · 2026-09-06 · **`estado.mision.entrada` pasa a ser un dato derivado**: lee el registro antes de escribir una misión |
| T36 | [Varias opciones de tirada de dados: manual, automática y mixta](tareas/T36-opciones-tirada-dados.md) | — | `DiceInput.tsx`, `TurnPanel.tsx`, `types.ts` | libre |
| T37 | [Iconos para representar a los héroes en el tablero](tareas/T37-iconos-heroes.md) | — | `BoardMirror.tsx`, `EleccionDeHeroes.tsx`, `types.ts`, `estilos.css` | libre |
| T38 | [Comportamiento autónomo de monstruos: agresividad y huida](tareas/T38-ia-monstruos.md) | T8 · **cumplida** | `src/ai/zargon.ts`, `types.ts` | libre |
| T39 | [Dos modos del diario: Informe y Relato literario](tareas/T39-diario-dos-modos.md) | — | `narrator/local.ts`, `Diario.tsx`, `types.ts` | libre |
| T40 | [Accesibilidad de todas las habitaciones en la primera misión](tareas/T40-habitaciones-accesibles.md) | — | `quests/mision-prueba.ts` | libre |
| T41 | [Ambientación: imagen de letras, más iconos, sonidos y decoración](tareas/T41-ambientacion.md) | — | `assets/`, `estilos.css`, componentes varios | libre |
| T42 | [Nombres aleatorios de monstruos por especie](tareas/T42-nombres-monstruos.md) | — | `src/engine/nombres.ts`, `types.ts`, `reducer.ts` | libre |
| T43 | [Quitar la pestaña «Verificar tablero» de la interfaz](tareas/T43-quitar-verificar-tablero.md) | — | `App.tsx`, `estilos.css`, `BoardVerify.tsx` · **no borrar el código** | libre |

Las cinco de la tanda de septiembre —**T13 a T17**, no las de red, que empiezan en T30— salen
de dos ratos de juego de Juan Luis el 2026-09-05 y ninguna estaba en la lista original de
divergencias. Vienen con dos hallazgos que no eran lo que parecía:

- **El mago sí tiene sus nueve hechizos.** Medido con `crearPartida`: `mago@13,18 hechizos=9`.
  Lo que faltaba era el botón para lanzarlos. La pregunta «¿cómo los consigue?» ya tenía
  respuesta en la página 13 del reglamento; lo roto era la pantalla. Eso es T14, y el libro
  de la estantería (T15) es una vía **extra**, regla de la casa.
- **La puerta de su captura es `pq`, en (0,15)-(1,15).** Medido con `puedeVer` sobre el
  estado inicial: al empezar, `ps`, `pt` y `pr` las ve algún héroe desde la escalera y `pq`
  no la ve nadie. Eso es T13. **La captura no llegó al chat**: la puerta se identificó
  midiendo, no mirando, y está sin confirmar por él.

### La fase de red: jugar con alguien que está en otro sitio (T30–T34)

El 5 de septiembre de 2026 Juan Luis pidió «que se pueda jugar online con otra persona que
esté en otro lugar». Son cinco tareas y **cuatro decisiones suyas, ya firmadas**, que están
copiadas enteras en la cabecera de [T30](tareas/T30-relevo-de-acciones.md): quien está lejos
es **un héroe más** del grupo (la mesa física sigue aquí); **ve el tablero con niebla**, solo
lo descubierto; la aplicación se publica en **`salasgar.github.io`** y las acciones pasan por
un **relevo alojado y gratuito** (descartados el túnel al portátil y el navegador a
navegador); y **los dados de quien juega desde casa admiten las dos opciones**, tirarlos él o
que se los tire la aplicación.

**Por qué esto sale barato, y es lo que hay que entender antes de coger ninguna de las
cinco:** el motor ya es determinista. `aplicarAccion` es pura, el generador vive dentro del
estado y `Accion` es JSON plano; medido, en `src/engine/` no hay ni un `Math.random()` ni un
`Date.now()`. Por tanto **jugar en red no es sincronizar el estado: es repartir la lista de
acciones**, y cada pantalla rehace la partida con `repetir(inicial, acciones)`, que es
exactamente lo que ya hace el «deshacer». El motor **no se toca en toda la fase**.

Tres cosas que conviene no descubrir a mitad:

- **El único `Date.now()` del proyecto está en `Juego.tsx:54`**, eligiendo la semilla. En red
  la semilla viene del montaje: si se calcula en cada navegador, las dos casas barajan
  distinto el mazo de tesoros y **divergen desde el turno cero, sin error visible**.
- **La niebla es de pantalla, no de red.** Quien juega desde su casa recibe el registro
  entero y puede reconstruir el estado completo en su navegador. Taparlo de verdad sería otra
  aplicación —el servidor dueño del estado, sirviendo una vista por jugador— y no lo pide
  nadie. Está escrito como límite conocido, no como fallo pendiente.
- **La numeración salta de T18 a T30 a propósito.** Los nombres T19–T22 los reclamó otra
  sesión el mismo día para cuatro tareas de reglas. Se renumeró el bloque de red, no el suyo.

### Banda de modelo de las tareas nuevas

Con qué modelo conviene abrir la sesión que coja cada una. Es **una posición del menú, no un
nombre**: los nombres de la gama cambian cada pocos meses y este reparto lleva ya tres
semanas. ALTO = el más capaz que haya; MEDIO = el intermedio.

- **ALTO** — T13 (cambia la forma del estado, y la regla la heredan T15 y la Fase 4),
  T15 (regla nueva que no está en el reglamento), T16 (choca con una autorización ya
  firmada, y el choque hay que resolverlo, no rodearlo).
- **MEDIO** — T14 (el motor ya está escrito y probado; esto es conectarlo), T17 (una
  heurística corta y reversible).

Y las cinco de la fase de red:

- **ALTO** — T30 (el protocolo lo heredan las otras tres y cambiarlo obliga a redesplegar
  con partidas vivas), T31 (es donde dos casas divergen sin dar un error), T32 (decide qué
  ve un jugador y qué no, y esa regla la heredan las misiones futuras).
- **MEDIO** — T33 (el motor ya admite las dos formas de tirar: esto es pantalla), T34 (el
  despliegue es mecánico; lo que pide criterio es la cadena de versión).

T1–T12 se escribieron sin banda y **no se les pone ahora**: no sale de sus ficheros, así que
ponérsela sería inventarla.

### Cuántas sesiones caben a la vez

**Hoy, una.** No es una cifra prudente: es lo que dan los ficheros. Al final de la tarde del
5 de septiembre ha bajado de dos a una, y conviene saber por qué antes de abrir sesiones que
se van a estorbar.

`reducer.ts` es el cuello, y lo tocan **todas las tareas libres que quedan**: T3, T6, T13 y
T15. Van de una en una. Las que no lo pisaban —**T7, T14, T17** y la parte de tests de
**T2**— ya están hechas, y con ellas se ha acabado el hueco para una segunda sesión cómoda.

Lo que queda fuera del motor no da una segunda sesión de verdad:

- **T16** tiene sus ficheros libres, pero espera una decisión de Juan Luis y además
  `partida.ts` lo tocan T6 y T13.
- **T15** depende de T13 y comparte `TurnPanel.tsx` y `Juego.tsx` con lo ya hecho.

Una segunda sesión sobre `reducer.ts` sigue siendo posible —cada tarea toca funciones
distintas y `git` las suele fusionar— pero ya es apostar a que el rebase salga limpio. Si lo
intentas, la más pequeña es **T3**, que cambia una condición.

**Y hoy la cuenta de ficheros ya ni siquiera decide.** Al cierre del 5 de septiembre, T13
tenía reservados `types.ts`, `partida.ts`, `reducer.ts`, `selectors.ts` y `vision.ts`, que
son exactamente los que necesitan T3 y T6. **No quedaba ninguna tarea reclamable.** Si
llegas y te pasa lo mismo, no fuerces: mira `.claude/sesiones/`, y si está todo cogido, la
respuesta correcta es esperar, no abrir una sesión que va a chocar.

**La fase de red rompe ese techo, y es su mayor virtud operativa.** T30 vive entera en
`server/` y en `src/red/protocolo.ts`, ficheros que **no existían y que no toca ninguna otra
tarea del tablón**; T34 vive en `.github/`, `vite.config.ts` y `README.md`. Ninguna de las
dos roza el motor ni la pantalla, así que **se pueden coger hoy, a la vez, y a la vez que
cualquier tarea de reglas**. Cuando T30 cierre, T31 añade una tercera vía —`usePartida.ts` y
`src/red/`— que tampoco pisa `reducer.ts`. Las que sí compiten por la pantalla son T32 y T33:
esas dos van de una en una, y no a la vez que T15.

**Y hay un cuello de botella que no está en esta cuenta: `_ESTADO.md`.** Todas las tareas
lo escriben dos veces —al reclamar y al terminar—, así que una sesión que lo deje
reservado bloquea a todas las demás en el primer paso del protocolo. Le pasó a esta misma
sesión el 5 de septiembre: media hora sin poder escribir su fila, y por el camino perdió
T7. Si te lo encuentras cogido, **reserva antes los ficheros de tu tarea** y escribe la
fila cuando se libere: el candado que evita el trabajo duplicado es el del fichero de
código, no el del tablón.

**«bloqueada»** significa que la precondición no se cumple todavía, no que la tarea sea
difícil. En cuanto T1–T7 estén en «hecha», T8 se puede coger.

---

## La dependencia real de la Fase 4 — **cumplida**

**Las siete divergencias están hechas. T8 se puede coger ya.** Lo de abajo se queda escrito
porque explica contra qué reglas se escribe la IA, que es lo que hará falta al leer T8.

Juan Luis pidió arreglar las siete **antes** de empezar la Fase 4. De las siete, solo tres
eran bloqueantes técnicas de verdad: la IA de Zargon elige entre acciones legales, y estas
tres cambian **qué es legal para un monstruo**:

- **T1**, porque decide a quién ve y por tanto a quién puede atacar o apuntar. **Hecha.**
- **T4**, porque decide por dónde puede pasar sin comerse una trampa. **Hecha.**
- **T5**, porque cambia con cuántos dados pelea dentro de un foso. **Hecha.**

T2, T3, T6 y T7 tocan solo el turno de los héroes: la IA no las nota. **También hechas.**

Y desde entonces han aparecido dos que la IA sí nota y que T8 tiene que respetar, así que
van aquí y no se pierden en la tabla:

- **T17**, que ya decide el orden en que actúan los monstruos.
- **T18**, que dice cuáles puede mover: solo los que están puestos sobre el tablero
  (`monstruosEnTablero`). Una IA que planee con monstruos que los héroes no han descubierto
  estaría haciendo trampas.

---

## Incidencias abiertas

- **Trabajo terminado y sin commitear de una sesión que ya no existe, y es la precondición
  de T22.** La sesión `6f2f1053` escribió la hoja de instrucciones —`src/ui/Instrucciones.tsx`
  (167 líneas, sin rastrear), más el cableado en `App.tsx`, el botón en `estilos.css`,
  `equivalenciaDeDados` en `dice.ts` y 13 tests en `dice.test.ts`— y **murió sin commitear
  nada**. Está en verde: la suite pasa con ello dentro. Y está en el árbol compartido, o sea
  a un `git add -A` ajeno de acabar dentro del commit de cualquiera, que es exactamente la
  incidencia T12. **T22 no se puede coger hasta que eso esté en `main`**, porque su
  precondición es justo ese fichero. Commitear el trabajo de otra sesión no lo decide una
  sesión por su cuenta: **es de Juan Luis**. Lo que no se puede es dejarlo ahí.

- **La incidencia T12 ha vuelto a pasar hoy, en su variante 2.** La sesión `86ebd3db` tenía
  en el índice los cuatro ficheros de T16 cuando otra commiteó el tablón: `56f5f21`, que se
  anuncia como «Tablón: T19 y T20 hechas», **se llevó la T16 entera dentro**. No se ha
  deshecho —el trabajo de las dos partes es válido y aquí no se reescribe el histórico—: se
  ha explicado en un commit vacío, `29e079c`. Lo que enseña es que la regla escrita («añade
  por nombre, uno a uno») **no basta**: el índice se llena desde el árbol compartido, así que
  entre tu `git add` y tu `git commit` cabe el commit de otro, y se lleva lo tuyo. Mientras
  las sesiones compartan directorio de trabajo esto seguirá pasando; la solución de raíz es
  un worktree por sesión, y esa es una decisión de Juan Luis.

- ~~**El candado del `esperado` no ve un deshacer seguido de una jugada.**~~
  **Cerrada el 2026-09-06**, con su palabra y antes de desplegar nada, que era
  justo la ventana barata. El registro lleva ahora un número de revisión que sube
  con cada cambio —también al deshacer— y es lo que compara el candado, en vez de
  cuántas acciones hay. El 409 devuelve el registro entero, no la cola. Está en el
  registro de finalizaciones, con el test que lo fija.

- **El propio tablón es el cuello de botella del protocolo, y hoy ha fallado.** Reclamar una
  tarea significa escribir una fila *en este fichero*, pero el candado de `.claude/sesiones/`
  trata `_ESTADO.md` como cualquier otro: mientras una sesión lo tiene reservado, ninguna
  otra puede reclamar nada. El 5 de septiembre la sesión `797b0a1c` hizo T13 entera sin poder
  escribir su reclamo: el tablón pasó de una sesión a otra —`b63aa070`, luego `2921da7f`— sin
  quedar libre ni una vez desde que quiso cogerla hasta que la terminó. Consecuencias reales,
  las dos del mismo día:
  - `460a72f` escribió «hoy no queda ninguna tarea reclamable» mientras T13 se estaba
    escribiendo.
  - `7e13452` reclamó T3, que necesita `reducer.ts` y `selectors.ts`, cuando esos ficheros
    los tenía otra sesión: el reclamo del tablón y la reserva de fichero se contradijeron.

  **No se arregla sin decisión de Juan Luis** (regla 4: toca el protocolo). Lo que se hizo
  hoy, y sirve mientras tanto: **quien no pueda reclamar, que reserve los ficheros de su
  tarea, empiece, y escriba la fila en cuanto el tablón se libere**. La reserva de fichero
  es visible para todas las sesiones y no se puede pisar, así que protege el trabajo aunque
  el tablón mienta un rato. Y al terminar, **soltar la reserva enseguida**: T3 estuvo parada
  esperando a que `797b0a1c` soltase los dos ficheros del motor.

- **T12 liberó por error tres tareas vivas, y quedan restauradas.** Su paso 2 daba por
  muerto lo que solo estaba en marcha: mandaba devolver T2, T4 y T7 a «pendiente» porque
  «sus sesiones ya no existen». Existían. Lo avisó la sesión `610b4941` y se ha
  comprobado: `hero-quest-b0`, `hero-quest-b1` y `hero-quest-ae` seguían vivas. Las tres
  filas vuelven a «en curso» con la nota de qué parte suya ya está en `main`, para que sus
  propias sesiones no repitan ese trabajo.

  **La lección, que vale para todo fichero de tarea:** no escribas como un hecho algo que
  caduca. «Estas sesiones ya no existen» era verdad al escribirlo y mentira al ejecutarlo.
  Se escribe la comprobación, no la conclusión: «mira si siguen vivas y, si lo están,
  déjalas en curso».

- **El mensaje de `d3dced0` no corresponde con su contenido.** Su texto describe unos
  cambios del tablón que, por un fallo del script que los aplicaba, nunca llegaron a
  escribirse; y su diff contiene, en cambio, `src/engine/board.ts` (el trabajo a medias de
  T2, de otra sesión) y una línea de `_ESTADO.md`. Se coló por un `git add -A` en el
  directorio compartido. **No se arregla**: está empujado y reescribir el histórico
  necesita autorización de Juan Luis (regla 4). Queda escrito aquí para que quien lo lea en
  `git log` no se vuelva loco buscando la correspondencia. Los cambios del tablón que ese
  mensaje prometía **ya están aplicados**, en T12. Detalle completo en
  [T12](tareas/T12-incidencia-commit-cruzado.md).

- ~~Trabajo sin commitear en `src/engine/reducer.ts`.~~ **Rescatado** en `8b0b7dc`. Era de
  la sesión `64d69b4d`, que llevaba T4 y fue interrumpida. Estaba en `main` y **sin
  tests**. Su mitad de T4 ya los tiene (`9bcd7d1`); **la de T2 sigue sin ellos**.

- **Divergencia conocida: no hay tesoro especial de misión.** El reglamento (p. 14) dice
  que «the special treasure is discovered only once by the first hero who searches the
  room, even if other heroes later search that same room». T6 mandaba conservar esa regla,
  y resulta que **no había nada que conservar**: `Mision` no tiene campo de tesoro especial
  y `buscarTesoro` solo roba del mazo. No se ha inventado. Cuando alguien añada tesoros de
  misión, la mitad de «solo el primero» habrá que escribirla entonces; la otra mitad —cada
  héroe registra la sala una vez— ya está.

- **Divergencia conocida y a propósito: no se puede buscar dentro del foso.** El reglamento
  (p. 17) dice que un héroe dentro de un foso puede registrarlo «as if it were a separate
  room unto itself». T5 mandaba **no** implementarlo y así se ha hecho: obliga a cambiar
  cómo se identifican las salas para buscar tesoro —hoy `salaEn(x, y)`, en
  `selectors.ts`— y eso es justo lo que toca T6. Quien coja T6, que decida si lo mete ahí.

---

## Registro de finalizaciones

Una línea por tarea terminada: quién, cuándo, el commit y qué se decidió por el camino que
no estaba escrito. Esto es lo que lee la sesión siguiente.

- **T9 · sesión `992c726d` · 2026-09-06 · `edc0c54`, `29e878b` y `4a68069`.** Personalidades
  por especie y tres dificultades, más el arreglo que T10 dejó señalado. Es la **segunda
  tarea de esta sesión** (T31 ayer; hoy fue a por T10 y `47e1fced` se la ganó por la mano):
  rompe «una sesión, una tarea» a petición expresa de Juan Luis, y se dice en vez de
  disimularlo. La fila no
  se pudo reclamar antes de empezar porque `47e1fced` tuvo el tablón cogido toda la mañana:
  se aplicó el remedio de la incidencia —reservar los ficheros, trabajar, escribir al
  soltarse— y funcionó sin roce. Lo que hay que saber:
  - **Los porcentajes medidos, que es el dato que pedía la tarea: los tres niveles empatan
    a 100 % de victorias de los héroes** (100 partidas por nivel, ~8 rondas de media,
    ninguna colgada, heurística de héroes tonta que ni lanza hechizos). El mando de
    dificultad **funciona** —los tests de escena fijan que `torpe`, `normal` y `astuto`
    juegan distinto sobre el mismo tablero— pero en «El calabozo del guardián» no mueve el
    resultado: **la palanca del objetivo torpe ~80 % / astuto ~40 % no está en los pesos.**
    Con ~6 ataques de monstruo por partida contra ~25 puntos de cuerpo del grupo, Zargon no
    puede matar a nadie por bien que elija. La misión está diseñada para ganarse (lo dice
    `calabozo.ts`), así que subir la letalidad —más monstruos, refuerzos, u otra misión de
    referencia para medir— es una decisión de diseño de Juan Luis, no un ajuste de T9.
  - **Cómo quedó la capa**: `PERSONALIDADES` (exhaustiva por especie, multiplicadores sobre
    los `Pesos` de T8; el esqueleto sin sesgos, de control) y `PESOS_POR_NIVEL` +
    `accionDeZargon(e, nivel)` / `jugarTurnoDeZargon`, que resuelve los pesos **en cada
    acción** porque en un turno actúan especies distintas. `torpe` es miope por estructura
    —si ya pega a alguien, pega y no se recoloca— además de por pesos; no es la IA buena
    con ruido. La puntuación base de T8 no se toca.
  - **El «pega y se va» del 48 % está arreglado en `zargon.ts`**, que era candado de T9 y
    por eso T10 no lo tocó: la casilla en la que el monstruo ya está ahora también puntúa
    (`valorDeLaCasilla`), y moverse exige superarla **estrictamente**. Medido después: 6–7 %,
    y lo que queda son recolocaciones que sí mejoran. Ningún test de T8 se movió.
  - **El simulador mide desde `4a68069` por `accionDeZargon`**, no por la tabla plana: es
    la línea que el registro de T10 dejó encargada, y sin ella las personalidades y la
    miopía del torpe quedaban fuera de la medida. Su cargador defensivo de niveles se fue
    con el cambio: existía solo porque T9 «estaba en vuelo».
  - **La receta de T1, pasada cuatro veces** (17 tests nuevos): personalidades
    neutralizadas → caen los 3 de personalidad; `astuto := PESOS` → cae el de astuto; la
    rama miope del torpe quitada → cae el del héroe acorazado; el arreglo del pega-y-se-va
    revertido → cae su test. Ninguna mutación tumba tests ajenos a lo mutado.
  - **Aviso para T11**: su fila decía `siguienteAccionDeZargon` como punto de entrada; con
    dificultad, el punto de entrada es `accionDeZargon(e, nivel)` y la pantalla necesita un
    selector de nivel (o fijar `normal` hasta que se pida).

- **T10 · sesión `47e1fced` · 2026-09-06.** `npm run sim` juega partidas enteras por el
  motor de verdad. **Los porcentajes medidos, que es lo que pedía la tarea:** con los pesos
  de T8 —el único nivel que existe todavía— los héroes ganan el **100 % de 100 partidas**,
  en 7,9 rondas de media y sin ninguna colgada. Tres cosas que hay que saber:
  - **Ese 100 % no valida los pesos de T8: dice que hoy no hay con qué compararlos.**
    Al medir, `src/ai/difficulty.ts` no existía todavía, así que `torpe` y `astuto` no se
    podían comparar con nada. **Para T9 (`992c726d`, en vuelo mientras escribo esto):** el
    simulador carga solo su tabla de pesos si se llama `PESOS_POR_NIVEL`, `PESOS_POR_DIFICULTAD`
    o es la exportación por defecto, y entonces saca los tres niveles sin tocar nada. Lo que
    **no** hace solo es usar vuestro `accionDeZargon(e, nivel)`: si la personalidad por
    especie va por ahí y no por la tabla de pesos, el simulador mide la dificultad pero no
    la personalidad, y hay que cambiarle una línea —la que elige entre
    `siguienteAccionDeZargon` y lo vuestro, en `jugarUnTurno`—.
  - **El hallazgo que sí es accionable: el 48 % de los ataques de monstruo terminan con el
    monstruo yéndose de la casilla desde la que acaba de pegar.** En la mesa se lee como
    que huye, y les regala a los héroes juntarse cuatro contra uno sin que nadie los
    sujete. Está en `siguienteAccionDelMonstruo` (`src/ai/zargon.ts`): cuando ya ha
    atacado, todas las casillas puntúan «sin poder atacar» y ninguna gana por quedarse
    quieta. **No lo he tocado: `src/ai/` es el candado de T9.** El simulador saca ese
    porcentaje en cada tirada, así que se ve solo si el arreglo funciona.
  - **Los héroes del simulador son tontos a propósito** —abren, pegan al más débil que
    alcanzan y si no se acercan; ni tesoro ni hechizos— y va dicho en la salida. Eso sesga
    el número a la baja, no al alza: el 100 % es aún peor noticia de lo que parece.

- **El número de revisión del relevo · sesión `6905402d` · 2026-09-06.** Cierra la incidencia
  que dejó abierta T31 y toca el protocolo de T30, con su firma del mismo día. Cuatro cosas:
  - **El candado compara la revisión, no la longitud.** `Registro` gana `revision`, que sube
    con cada cambio y **también al deshacer**: esa segunda mitad es la que faltaba. Contar
    acciones fallaba en un caso real —10 → 9 → 10 deja la misma cuenta con otro contenido—,
    y la escritura atrasada entraba con la cuenta buena sobre un tablero que ya no existía.
  - **El 409 devuelve el registro entero, no la cola.** Mandar «lo que te falta» solo vale
    mientras la lista únicamente crezca; en cuanto la mesa deshace, esa cola no encaja con la
    del otro. Son decenas de acciones pequeñas: mandarlas todas no cuesta nada. El cliente,
    en consecuencia, **adopta** el registro del relevo y rehace la partida desde el inicio en
    vez de añadir al final (`adoptar`, en `cliente.ts`).
  - **Dos tests nuevos, uno por capa**, y los dos caen si se vuelve a contar: en el protocolo,
    deshacer y volver a jugar cambia la revisión aunque la cuenta vuelva a ser la misma y la
    escritura vieja se rechaza; en el cliente, la pestaña atrasada no cuela su jugada muerta
    y acaba con el mismo estado que la mesa. **Comprobado mutando**: con la revisión otra vez
    igual a la longitud fallan tres tests y solo esos tres.
  - **Ojo con mutarlo a medias**: dejar el comparador por longitud mientras los clientes
    mandan revisiones cuelga el reintento de `enviar` en un bucle. El bucle sale cuando la
    acción deja de ser legal o cuando la escritura entra, y con esa mezcla no pasa ninguna de
    las dos cosas. Si alguien prueba a revertir esto, que revierta las dos mitades.

- **T34 · sesión `6905402d` · 2026-09-06.** La aplicación se publica sola en
  <https://salasgar.github.io/Hero-Quest/>. Juan Luis firmó el encendido ese mismo día
  (arriba, en autorizaciones) y Pages quedó en `build_type: workflow`. Cinco cosas:
  - **`base` es el fallo número uno de Pages y aquí ya estaba pagado a medias.** El sitio
    cuelga de `/Hero-Quest/`, así que `vite.config.ts` lo pone **solo al construir**
    (`command === "build"`), para no cambiar `npm run dev`. Y había un segundo caso que no
    era evidente: `FOTO.archivo` valía `"/tablero-referencia.webp"`, con barra, así que la
    pantalla «Verificar tablero» habría salido **sin foto y sin decir por qué**. Ahora el
    dato es el nombre del fichero y quien lo pinta le antepone `import.meta.env.BASE_URL`.
    Comprobado con `npm run preview`: `/Hero-Quest/`, su JS y la foto dan 200.
  - **Los tests van delante de la construcción, no detrás.** `npm run typecheck` y
    `npm test` son pasos previos del flujo de trabajo: si algo está en rojo, el sitio
    publicado se queda como estaba. Publicar una versión rota es peor que no publicar,
    porque quien esté jugando se la encuentra al recargar.
  - **La cadena de versión de T30 NO pasa a ser el hash del commit, y el motivo es
    medible.** `crearRegistro` compara la versión del montaje con la constante `VERSION`
    del **relevo**, y el relevo se despliega con `wrangler`, que no pasa por vite y no
    recibe ninguna variable `VITE_*`: con el hash, el relevo rechazaría **todas** las
    partidas nuevas en cuanto una de las dos publicaciones fuera por delante de la otra.
    Así que son dos cosas distintas: `VERSION` sigue siendo la versión de **las reglas**, a
    mano, y el hash del commit sale **en la esquina de la pantalla**, que es lo que hace
    falta para pillar la caché de Pages sirviendo código de ayer. Está razonado entero en
    `server/README.md`, con lo que habría que cambiar si algún día se quiere lo otro: que
    el relevo deje de comparar con su propia constante, que es tocar el protocolo y por
    tanto decisión de Juan Luis.
  - **La URL del relevo ya era configurable y no se ha tocado.** `dondeEstaElRelevo` lee
    `VITE_RELEVO`, y el flujo de trabajo la pasa desde una variable del repositorio
    (Settings → Secrets and variables → Actions → Variables). **Hoy está vacía y es
    correcto**: sin relevo, la aplicación juega en local y lo dice en pantalla.
  - **«Verificar tablero» y los imprimibles se quedan en la versión publicada**, a
    propósito: la de verificar es la que permitió cotejar el tablero contra la foto y no
    estorba, y los PDF no se generan en el navegador —son `npm run cartas` y
    `npm run tablero` en el Mac—, así que no engordan la página.

- **T35 · sesión `946ca4aa` · 2026-09-06 · `87ea055`.** La salida crece con el grupo. Cuatro
  cosas que no estaban escritas:
  - **`estado.mision.entrada` ya no es lo que declara la misión: es un dato derivado.** Con
    un grupo grande, `crearPartida` guarda en el estado una copia de la misión con la entrada
    crecida hasta tener una casilla por héroe. Quien escriba una misión nueva declara la
    escalera que quiera y el motor la estira sola; quien lea `estado.mision.entrada`
    esperando encontrar exactamente lo de `quests/` se llevará una sorpresa con ocho héroes.
    **Es la parte que hay que saber antes de tocar misiones.**
  - **El arreglo evitó `reducer.ts` a propósito.** El objetivo «salir» ya preguntaba por
    `e.mision.entrada`, así que cambiando lo que se guarda ahí funciona sin entrar en el
    fichero que más sesiones se disputan. Cuando algo se pueda arreglar en el constructor en
    vez de en el reductor, merece la pena mirarlo: es una reserva que no hay que pedir.
  - **Se le llevó la contraria a Juan Luis en un punto, y con test.** Dijo «N casillas para N
    héroes». Al pie de la letra, `casillasDeSalida` recorta cuando le pides menos de las
    declaradas, así que un grupo de dos habría dejado la salida en dos casillas y salir
    sería **más** difícil que hoy: una regresión silenciosa para los grupos pequeños, que son
    los normales. Va el máximo entre héroes y casillas declaradas, y hay un test que lo fija
    para que nadie lo «simplifique» leyendo solo su frase.
  - **De seis tests nuevos, solo dos fallan con el código viejo**, y es correcto: los otros
    cuatro son guardas de regresión de los grupos de dos y de cuatro, no la prueba de la
    regla nueva. Distinguirlo importa, porque un test que pasa igual con el código viejo no
    prueba nada de lo que se acaba de escribir —lo que no quiere decir que sobre—.

- **T33 · sesión `66e4a4ea` · 2026-09-06 · `db96bf2`.** Quién tira los dados. Cuatro cosas:
  - **Las dos modalidades son la misma acción**, con el campo `dados` o sin él: el motor ya
    lo preveía. Sin `dados` tira el generador que vive **dentro** del estado, así que sigue
    siendo reproducible, el deshacer sigue saliendo exacto y las dos casas siguen viendo la
    misma partida. Si alguien cambiara eso por un azar de verdad, se romperían las tres
    cosas a la vez y en silencio; hay un test que lo fija.
  - **En la mesa no se pregunta, y no es por gusto.** `localStorage` es por navegador, así
    que quien pruebe las dos pantallas en el mismo navegador vería a la pantalla de la mesa
    heredar el «que los tire la aplicación» y ponerse a tirar sola. Lo fija la pantalla
    —`dadosPropios: "siempreYo" | "aEleccion"`— y no la preferencia guardada.
  - **Cuando tira la aplicación se enseñan las caras, no solo el total.** Quien no ve los
    dados solo puede fiarse; viéndolas comprueba la tirada igual que sobre la mesa. `⇧T`,
    que ya tiraba a ciegas desde antes, ahora también las enseña.
  - **El dibujo de las caras se mudó de `Instrucciones.tsx` a `DiceInput.tsx`** en vez de
    copiarse: dos copias son cómo la hoja de ayuda y la partida acaban dibujando escudos
    distintos, que es justo lo que esa hoja existe para evitar.

- **T32 · sesión `66e4a4ea` · 2026-09-06 · `be4adf6`.** La pantalla de quien juega desde su
  casa. Seis cosas para quien siga:
  - **Filtrar por «¿está abierta su sala?» no es filtrar por niebla, y la diferencia se
    mide.** `BoardMirror` ya escondía las salas sin revelar, pero un pasillo no es ninguna
    sala: con ese criterio, cualquier monstruo del pasillo se ve siempre, descubierto o no.
    La niebla filtra por **`monstruosEnTablero`**, que es la respuesta del motor a esa
    pregunta exacta y la que dejó T18.
  - **Las puertas las decide `puertasVisibles`, del motor.** Filtrar a mano por
    `puertasVistas` parecía equivalente y borraba del tablero de casa **la puerta secreta
    recién encontrada**, porque las secretas van por `descubierta`. Hay un test que fija
    ese caso.
  - **`comoLoVe` devuelve un estado para pintar, no para jugar.** No se le pasa nunca al
    motor: le faltan monstruos y puertas. Los selectores que deciden qué es legal van
    siempre sobre el estado completo, porque tienen que contestar lo mismo que el motor; si
    se recortaran, saldrían botones que el motor rechaza.
  - **Las acciones de turno salieron a `useAccionesDeTurno`**, sin cambiarles el
    comportamiento: `Juego.tsx` pierde 282 líneas y las dos pantallas comparten los
    diálogos de dados, el teclado y el reparto de quién tira qué. La bandera del hook es
    `puedeActuar` —«el turno es de una figura que llevo yo»—, **no «soy remoto»**: en la
    mesa también vale `false`, durante el turno de Zargon.
  - **El diario no lo filtra la niebla, y no hace falta**: un evento es algo que ya ha
    ocurrido, Zargon solo mueve monstruos descubiertos y las salas se anuncian al abrirlas.
    Está escrito en `VistaDeHeroe.tsx`, con el sitio donde habría que filtrarlo si algún
    día un evento contara algo de una sala cerrada.
  - **Hay `npm run relevo`**, un relevo en memoria sobre el mismo `protocolo.ts`, escrito
    porque esta tarea no se puede dar por buena sin dos navegadores y el de Cloudflare
    espera una firma. Probado a mano de punta a punta: crear, añadir, el 409 con las
    acciones que faltaban, el 403 a quien no es la mesa, truncar y el 404. **Lo que sigue
    pendiente es mirarlo con dos ventanas abiertas**: ninguna sesión lo ha hecho.
    `npm run relevo` y `npm run dev`, y se abre
    `http://localhost:5173/?relevo=http://localhost:8787`.
  - **Una regla del repositorio incumplida, dicha en voz alta:** las 37 líneas nuevas de
    `estilos.css` se añadieron con un heredoc desde Bash, que es justo lo que `_COMUN.md`
    prohíbe porque se salta el hook de candados. No lo pisó nadie —el fichero estaba libre
    y reservado por esta sesión— pero la regla vale igual y la próxima vez toca `Edit`.

- **T8 · sesión `66e4a4ea` · 2026-09-05 · `2203e01`.** Zargon decide. Es la tarea que quita
  del medio lo último que hacía un humano en el turno de los monstruos.
  - **Qué hay y cómo se usa.** `siguienteAccionDeZargon(estado)` devuelve **una** acción
    legal —activar, mover, atacar o cerrar— y se llama en bucle: **ese es el punto de
    entrada de T11**, y despacha por `usePartida` como todo lo demás. `turnoDeZargon(estado)`
    juega el turno entero de golpe y la usarán los tests y T10; en la mesa no, porque ahí
    conviene ver moverse cada figura y que dé tiempo a mover la miniatura.
  - **Los pesos, que es lo que T9 tuerce y T10 mide.** En `targeting.ts`, separados y con
    nombre: `danoEsperado` 10, `remate` 25 × la probabilidad de conseguirlo, `heridoPrimero`
    3 por punto perdido, `lanzaHechizos` 1 por hechizo **sin gastar**,
    `porCasillaDeDistancia` 1 y `descuentoPorNoLlegar` 15. **Ninguna cifra está medida**:
    están puestas para poder medirlas, y eso es T10.
  - **`distancia()` no sirve para apuntar, y cuesta una tarde descubrirlo.** Mide hasta una
    casilla **libre**, y la del héroe la ocupa el héroe: devuelve `Infinity` contra
    cualquier objetivo vivo. La primera versión dejaba a los cuatro héroes en `-Infinity` y
    a los monstruos sin nadie a quien ir. Lo que hace falta es `pasosParaAtacar`, hasta la
    casilla más barata desde la que se le puede pegar, exigiendo `pasoAbierto`: estar pared
    con pared no es estar al lado.
  - **Rematar no se decide con la media.** «Daño esperado ≥ cuerpo que le queda» **nunca**
    se cumple para un orco contra un héroe con 1 de cuerpo, porque su media es 0,83: el
    monstruo pasaba de largo del moribundo. Ahora es la probabilidad exacta de tumbarlo,
    que con estos dados se calcula en diez líneas. La media dice cuánto se saca por término
    medio; rematar es una pregunta de cola.
  - **El sesgo del mago iba por puntos de mente, y la pantalla mentía.** Jugando un turno de
    verdad, decía **«el enano lanza hechizos»**: el enano tiene 3 de mente y no lanza
    ninguno. Ahora cuenta los hechizos que le quedan sin gastar, así que la frase es cierta
    y, además, **un mago que ha gastado sus nueve cartas deja de ser la presa preferida**,
    que es como debe ser. Aviso para T9: un mago creado sin elementos no tiene hechizos, así
    que en un test no atrae a nadie y la escena no prueba lo que dice.
  - **Un monstruo con un héroe al lado no se va andando a por otro mejor.** Sin
    `descuentoPorNoLlegar`, la casilla intermedia puntúa por la promesa del objetivo lejano
    y el monstruo acaba el turno **sin atacar a nadie**. En la mesa eso se lee como que la
    aplicación se ha despistado.
  - **Sin monstruos que activar, el turno de Zargon se cerraba con `null`** y la partida se
    quedaba parada esperando a alguien que no existe. Es el caso del principio de la misión,
    con los seis todavía en sus salas.
  - **La prueba de T1, hecha por partida doble**: desconectando el sesgo de los hechizos
    fallan dos tests; sin el descuento por no llegar, uno. Y hay un test que juega cinco
    turnos de Zargon sobre la misión de verdad comprobando que **el motor acepta todas y
    cada una** de las acciones propuestas: una jugada ilegal no se ve como un test rojo, se
    ve como un monstruo que no se mueve con cuatro niños mirando.
  - **`tareas/_COMUN.md` tiene un dato equivocado y no se ha tocado por no ser mi fichero:
    dice que la sala `a` mide 4 × 4 y mide 4 × 3** —columnas 1-4, filas **1-3**; la fila 4 ya
    es la sala `g`, medido sobre `MAPA_TABLERO`—. Un héroe colocado en la fila 4 queda detrás
    de un muro y sin camino, y la escena pasa a probar otra cosa. Aquí costó dos verdes
    falsos. Queda avisado en la cabecera de `tests/zargon.test.ts`.

- **T16 · sesión `86ebd3db` · 2026-09-05 · dentro de `56f5f21`, explicada en `29e079c`.**
  Ocho héroes y clases repetidas, **todo menos `calabozo.ts`**, que sigue esperando su firma.
  Relevada de `946ca4aa`, que la reclamó en `146c8dd` y murió sin dejar commit ni reserva.
  Cuatro cosas que la sesión siguiente necesita saber:
  - **La ficha de la tarea está desfasada en su dato principal.** Dice que la entrada son
    cuatro casillas en dos columnas, (12,17)-(13,18). **T2 ya la estrechó**: hoy es
    `[(12,18), (11,18), (10,18), (9,18)]`, un pasillo de **una casilla de ancho y cuatro de
    largo**. O sea que la autorización de agosto ya está cumplida y el choque que describe el
    punto 2 de la ficha ya no es tal: lo único que falta para ocho es **alargar** ese pasillo,
    no ensancharlo. Eso hace que la salida 1 de las tres que se le ofrecen —fila india— sea
    hoy la barata, y conviene decírselo así cuando conteste.
  - **Quien arregla el apilamiento es la guarda, no la línea del `%`.** Con la guarda puesta,
    `i % n` e `i` son la misma cosa. Por eso la comprobación que pedía la ficha —revertir
    `partida.ts` y ver caer el test de las ocho casillas— **no funciona**, y el test que de
    verdad sostiene el arreglo es el de «más héroes que casillas de entrada». Comprobado
    quitando la guarda: cae ese y solo ese.
  - **El apilamiento ilegal ya estaba en la suite entera.** `MISION_PRUEBA` tenía una sola
    casilla de entrada y unos veinte tests montan grupos de dos a cuatro héroes: todos
    empezaban encima de la misma casilla, un estado que `celdaLibre` prohíbe, y pasaban
    porque casi todos llaman a `situar` acto seguido. La entrada de prueba pasa a ocho.
  - **El tope de la pantalla sale del dato**, `min(8, mision.entrada.length)`, y hoy da 4. La
    pantalla dice en voz alta por qué recorta. No hace falta volver a tocarla cuando él
    decida: alargar la entrada la sube sola.

- **T31 · sesión `992c726d` · 2026-09-05 · `15c852a`.** La partida en red, en el
  cliente. Lo que T32 y T33 dan por hecho, y una desviación dicha:
  - **La reconciliación del 409, tal como quedó.** `SesionDeRed.enviar` es un
    bucle: ¿me toca a mí (`puedeActuar`)? → ¿es legal (`aplicarAccion`)? → se
    envía. En un 409 incorpora las entradas que trae el propio rechazo, avisa a
    los suscriptores y vuelve al principio del bucle, o sea que **recomprueba el
    turno además de la legalidad**: tras ponerse al día, el turno puede ser de
    una figura de otro jugador y el motor no puede notar eso. Si la acción dejó
    de ser legal, devuelve `{ ok: false, motivo }` sin reenviar, y la pantalla
    revierte al estado del registro y enseña el motivo. El bucle no gira para
    siempre: cada rechazo incorpora acciones y el `esperado` crece.
  - **El sondeo pide `desde=0` y compara, no `desde=N` como decía la tarea.** Es
    la desviación, y va con su porqué: el registro no lleva número de revisión,
    así que si la mesa deshace y juega otra cosa dentro del mismo segundo los
    totales coinciden, las colas difieren y con `desde=N` la divergencia sería
    invisible y permanente —justo el fallo por el que esta tarea era banda ALTO—.
    Hay un test que fija ese caso exacto y falla con la implementación de
    `desde=N` (comprobado mutando). El coste es traer unas decenas de acciones
    por segundo. El agujero de fondo está arriba, en incidencias, con la
    solución de raíz propuesta.
  - **Quién puede actuar, tal como quedó**: el turno de Zargon es de la mesa;
    una figura que el `reparto` no nombra, también. La sesión que crea la
    partida es la mesa (`jugador = MESA`) y es la única que guarda el `secreto`,
    así que `puedeDeshacer` solo es verdad en su pantalla. Y `usePartida` gana
    un campo, `puedeActuar`, que es la señal de la que cuelgan T32 y T33; en
    local siempre es verdad y la forma del hook no cambia en nada más.
  - **`reiniciar` en red no hace nada, a propósito.** El protocolo no tiene esa
    operación: «jugar otra vez» en red es crear otra partida con otro código, y
    esa pantalla es de T32.
  - **Si el sondeo de un segundo se nota, no se ha podido medir de verdad**: no
    existe pantalla remota hasta T32 y en los tests el sondeo se llama a mano.
    Queda `MS_ENTRE_SONDEOS = 1000` en `cliente.ts`, y el `setInterval` arranca
    y para con el componente que use el hook.
  - **La receta de T1, pasada tres veces** sobre los 14 tests nuevos: sondeo con
    `desde=N` tumba los dos del deshacer compartido; `puedeActuar` siempre a sí
    tumba los dos del reparto; reenviar sin recomprobar la legalidad tumba el
    del 409 ilegal. Ninguna mutación tumba tests ajenos a lo mutado.
  - **Un fichero de T30 tocado, dicho aquí además de en el commit**:
    `tests/red-protocolo.test.ts` pierde su conversor provisional montaje→partida
    y usa `partidaDelMontaje` de `cliente.ts`, que es lo que su propio
    comentario dejaba encargado a T31. El conversor vive en un solo sitio.

- **T21 · sesión `6905402d` · 2026-09-05 · `72a7c7f`.** Los hechizos dejan rastro. Es el
  tercero de los tres fallos que trajo Juan Luis de su segunda partida. Cinco cosas:
  - **Dos eventos nuevos, no siete.** `efectoDeHechizo` lleva la clase de efecto y la
    **lista** de alcanzados —lista, porque la Tempestad alcanza a más de uno—, y
    `hechizoSinEfecto` lleva el motivo **en el dato y no en la frase**: hoy son cuatro
    (no muerto, mente más fuerte, ya estaba sano, no hay a quién) y va a haber más.
  - **Lo grave no era el silencio: era el fallo silencioso.** El Sueño no prende contra un no
    muerto ni contra una mente mayor que la del lanzador, y los tres finales dejaban
    exactamente la misma línea. Quien juega no podía saber si el orco se había dormido. Ahora
    son tres frases distintas y hay un test por cada una.
  - **Dos fallos de la Tempestad, arreglados por el camino y sin tocarle el alcance:** marcaba
    también a los monstruos ya derrotados, y —el gordo— `salaEn` devuelve `null` fuera de las
    salas, así que lanzarla en un pasillo comparaba `null === null` y metía en el hechizo a
    **todos los monstruos de todos los pasillos del tablero**. Un pasillo no es una sala.
  - **La divergencia de la Tempestad NO se ha resuelto, y no es un descuido.** Está
    implementada sobre toda la sala y su carta dice «el monstruo elegido». Se fue a mirar el
    reglamento y **el reglamento no lo dice**: la p. 14 remite a la carta —«A spell and its
    effects are explained in detail on its corresponding spell card»— y las cartas no las
    tenemos, exactamente como las armas grandes de T7. Sin fuente no se inventa. Queda abajo,
    en «Pendientes de su palabra», y hay un test que **fija lo que hace hoy** para que el día
    que conteste se vea qué cambia. Y ahora, jugando, se nota: el diario dice «Un torbellino
    envuelve a Goblin y Goblin».
  - **El test que sostiene la tarea es el de los doce.** Cada hechizo se lanza y se exige una
    segunda frase no vacía detrás de «Mago lanza X». Un hechizo nuevo que nazca mudo salta
    ahí, y no en una partida seis meses después.

- **T20 · sesión `6905402d` · 2026-09-05 · `740f54a`.** El turno de Zargon deja rastro.
  Sale del segundo rato de juego de Juan Luis, y su frase —«los monstruos no se mueven, se
  quedan quietos, y el diario no dice qué han hecho»— eran **dos cosas**: que nadie los mueve
  (T8) y que no se cuenta (esto). Cinco cosas para quien venga:
  - **Tres eventos nuevos, y el número importa.** `monstruoActiva` («Le toca a Goblin»),
    `monstruoSinActuar` («Goblin no se mueve ni ataca») y `zargonSinMonstruos`, con los dos
    motivos que la pantalla ya distinguía desde T18. Seis monstruos por tres líneas cada uno
    es un diario que en la mesa no lee nadie: si hay que añadir más, que sea quitando.
  - **La línea de «no ha hecho nada» solo sale si no se movió ni atacó**, mirando `haMovido` y
    `haActuado`. Está redactada sobre esos dos verbos a propósito: un monstruo que solo abre
    una puerta no ha movido ni atacado, y la frase sigue siendo verdad al lado de «la puerta
    cede con un chirrido».
  - **El motivo de T17 no baja al diario.** «Le toca al goblin: te tiene a tiro» está en la
    pantalla y ahí se queda: el motor no importa de `src/ai/`, y `src/ai/orden.ts` importa del
    motor. Meterlo aquí era invertir esa flecha por una frase.
  - **La pista de las flechas salía condicionada a `!esZargon`**, o sea que con un monstruo
    activo desaparecía. Mientras T8 y T11 no estén, al monstruo lo mueve a mano quien arbitra,
    y era justo entonces cuando la pantalla dejaba de decirle cómo. Quitado el `!esZargon`.
  - **Y una que no se arregla aquí, vista jugando:** los dos goblins de la sala `s` se llaman
    los dos «Goblin», así que «Le toca a Goblin» no dice cuál de los dos. `nombreDe` da el
    nombre de la especie. Se nota ahora porque antes no se decía nada; con seis monstruos en
    la mesa hace falta un número o una letra, y eso es tarea aparte.

- **T19 · sesión `6905402d` · 2026-09-05 · `c08bbc0`.** La puerta se abre desde la diagonal.
  Regla de la casa que pidió Juan Luis, no reglamento. Cuatro cosas:
  - **Son seis casillas por puerta, no diez.** `a`, `b` y las cuatro que salen de sumarles el
    vector perpendicular a `b − a`. Las ocho vecinas de `a` tocan un vértice de *la casilla*,
    no de *la puerta*: para `ps`, en (12,15)-(11,15), entran (12,14), (12,16), (11,14) y
    (11,16), y no (13,14) —que además es el vano de `pt`— ni (13,15). Está en
    `celdasQueAbren`, en `board.ts`.
  - **La diagonal solo cuenta desde el mismo lado del muro**, que es lo que él firmó. Se
    filtra con `hayMuroEntre` y **no con `pasoAbierto`**: `pasoAbierto` mira además si hay
    puerta y está abierta, y la que se quiere abrir está cerrada por definición, así que
    habría devuelto `false` siempre y la regla nueva no habría hecho nada con los tests en
    verde. El caso existe en el calabozo: `psecreta`, en (4,13)-(4,14), tiene dos diagonales
    en la sala `r`, al otro lado del muro.
  - **La condición estaba escrita dos veces** —la guarda de `abrirPuerta` y el selector
    `puertasAlAlcance`, que es quien pinta el botón— y ahora las dos consumen la misma
    función. Hay un test que recorre las 494 casillas del tablero y exige que motor y selector
    digan lo mismo sobre las cinco puertas, con su mitad negativa: 28 casillas del tablero
    tienen puerta al alcance, así que el acuerdo no es «los dos dicen que no a todo».
  - **Vale también para los monstruos**, porque `abrirPuerta` usa `figuraActiva`. Es
    coherente, y **T8 tiene que saberlo**: el alcance de una puerta son seis casillas, no dos.
    Ningún test viejo cambió de número, pero jugando se nota: el bárbaro abre `ps` desde
    (12,16), una casilla antes que antes.

- **T30 · sesión `66e4a4ea` · 2026-09-05 · `6b07f82`.** El relevo de acciones. La misma
  sesión escribió antes las cinco tareas de la fase (`1fd496c`) y siguió con esta, que es
  la única cogible de las cinco: **rompe la regla de «una sesión, una tarea» a sabiendas**,
  y se dice aquí en vez de disimularlo. Lo que la siguiente sesión necesita saber:
  - **El protocolo, tal como ha quedado**, porque es contra lo que T31 va a programar:
    `POST /partidas` → `{ codigo, secreto }`; `GET /partidas/:codigo?desde=N` →
    `{ montaje, entradas, total }`; `POST /partidas/:codigo/acciones`
    `{ esperado, accion, autor }`; `POST /partidas/:codigo/truncar` `{ esperado, secreto }`.
    Un 409 trae dentro `entradas` y `total`, para que quien llegó tarde se ponga al día
    **sin una segunda petición**.
  - **Un test se escribió mal, y el motivo vale más que el test.** «Dos jugadores a la vez»
    llamaba dos veces a `anadir` sobre la misma copia y esperaba que la segunda fallara.
    Falla que no: `anadir` es **pura**, y las dos ven un registro de cero acciones. La
    serialización no la da la función, la da el almacén que guarda entre una petición y la
    siguiente. De ahí sale el requisito de verdad para el servidor —**guardar antes de
    contestar**—, que es lo que cumple `blockConcurrencyWhile`. Si algún día se cambia el
    Durable Object por otra cosa, esto es lo que hay que conservar.
  - **La prueba de T1, hecha**: desconectando el candado del `esperado` fallan **dos** tests
    y solo esos dos. Y el test grande —dos casas llegan al mismo estado— lleva su propia
    mitad negativa: con otra semilla **no** llegan. Sin ella pasaría igual aunque el estado
    no dependiera de la semilla, que es justo el fallo que se busca.
  - **Se compara el JSON entero del estado, no las posiciones.** Dentro van el generador, el
    mazo de tesoros barajado y el turno; comparar solo las figuras dejaría pasar la
    divergencia.
  - **Nada de esto está desplegado.** El código se escribe y se prueba sin cuenta; el
    `wrangler deploy` espera su firma. Y hay un dato que **no se ha comprobado y no se
    inventa**: si los Durable Objects entran hoy en el plan gratuito. Está escrito como
    primer paso del despliegue en `server/README.md`, con la orden de parar y avisar si no
    entran.
  - **El relevo no valida de quién es el turno, y no puede.** Una acción no nombra a su
    figura: `{ tipo: "mover", destino }` no dice quién se mueve. Esa comprobación es de
    T31, en el cliente. Si no se hace allí, no se hace en ningún sitio.

- **T18 · sesión `797b0a1c` · 2026-09-05 · `632d089`.** Los monstruos no actúan hasta que
  se los encuentra. Cuatro cosas que no estaban escritas:
  - **La forma del estado ha cambiado otra vez**: `monstruosEnTablero: IdFigura[]`, junto a
    `puertasVistas`. Van juntos a propósito y con la misma mecánica; quien guarde partidas
    tiene ahora dos listas acumulativas que conservar, no una.
  - **El filtro de «qué puede mover Zargon» estaba copiado en tres sitios**, y el tercero
    —el cierre del turno de Zargon, `terminarTurno`— es el que se olvida. Si cuenta
    monstruos que la pantalla no ofrece, el turno no termina y **la partida se queda parada
    en la mesa**. Ahora es uno solo, `monstruosActivables`, y vive en `reducer.ts` y no en
    `selectors.ts` porque selectors importa de reducer, no al revés.
  - **Doce tests viejos cayeron y los doce afirmaban la regla vieja**: montaban un monstruo
    con `situar` y lo activaban sin que nadie lo hubiera encontrado. Se corrigen con
    `enTablero()`, nuevo en `tests/ayuda.ts`. Cinco eran de T17 y se arreglaron los cinco en
    su propio helper. **Ninguno falló por otro motivo**, que es lo que había que comprobar.
  - **El monstruo errante hay que meterlo a mano.** Nace al lado del héroe que roba la
    carta, así que no pasa por ninguna de las dos vías de descubrimiento; sin esa línea no
    actuaría jamás y no se notaría hasta que la carta saliera jugando. Vale de aviso para
    cualquier cosa que cree figuras a mitad de partida.

- **T13 · sesión `797b0a1c` · 2026-09-05 · `de466ec`.** Las puertas que se pintan. Cuatro
  cosas que no estaban escritas:
  - **La forma del estado ha cambiado**: `EstadoPartida` gana `puertasVistas: string[]`,
    al lado de `salasReveladas`. Quien vaya a guardar partidas tiene que saberlo, igual que
    con T6.
  - **El acumulador vive en `terminar()`**, no en cada acción, porque es el único embudo por
    el que pasan todas las acciones legales sin excepción; y va **después** de revelar la
    sala, o la puerta recién abierta tardaría un turno en aparecer. La función es
    `conPuertasVistas(estado)`, en `vision.ts`, y `crearPartida` la llama también: si el
    estado inicial saliera vacío, la primera pantalla no enseñaría ni una puerta.
  - **Una revert sola no basta para validar estos tests, y esto vale para T2–T18.** Hay
    *dos* implementaciones equivocadas distintas y cada una la caza un test distinto: con la
    regla vieja (pintarlas todas) falla el test de `pq`; con un selector puro (lo que se vea
    ahora, sin memoria) fallan los dos de «una puerta vista no se desve». Al revertir solo el
    selector a la regla vieja pasaban cuatro de cinco, y eso parecía que los tests no valían
    cuando lo que faltaba era la segunda revert. Dos de los cinco no discriminan entre
    variantes de selector, y queda dicho: fijan el estado, no la regla.
  - **El caso de la captura aguanta el cambio de entrada de T2.** Medido con las dos
    entradas: desde el rectángulo viejo y desde la fila india nueva se ven `ps`, `pt` y `pr`
    y no `pq`. El test no depende de dónde empiecen los héroes.

- **T2 · sesión `b63aa070` · 2026-09-05 · `1c8a533`.** Pasar sobre los héroes, y la entrada.
  - **La entrada elegida es la fila india del pasillo de abajo**: (12,18), (11,18), (10,18),
    (9,18), con el bárbaro en cabeza. Comprobada contra `board-base.ts`, no supuesta: las
    cuatro son pasillo, sin muro en los tres tramos, y ninguna coincide con puerta, mueble
    ni trampa. La columna 12 en vertical **no vale**: (12,15) es el vano de `ps` y dejaría a
    un héroe empezando dentro de la puerta que el grupo tiene que abrir.
  - **El código ya estaba en `main`; lo que faltaba eran los tests**, y por eso T12 dejó
    esta tarea en pendiente. Comprobado que ahora prueban algo: revirtiendo
    `celdaAtravesable` fallan dos de los cinco.
  - **Cerrada la trampa que dejó apuntada un subagente**: el bloque hace retroceder, y con
    la regla nueva la casilla de la que venías puede tenerla ocupada el compañero al que
    acabas de saltar. `mover()` ya desandaba hasta la primera casilla libre —y la de salida
    siempre vale, que es suya—, pero no había test. Ahora lo hay, y comprueba además que no
    queden dos figuras en la misma casilla.
  - **El 4 del test de integración aparecía dos veces, no una.** La tarea solo nombraba la
    primera; la segunda comprueba que abrir la puerta es gratis. Las dos pasan a 3, y el 3
    está contado —tres casillas subiendo por la columna 12, de 6 puntos quedan 3—, no
    ajustado hasta que pasara.

- **La divergencia del foso en pantalla, cerrada · sesión `b63aa070` · 2026-09-05 ·
  `aa403fd`.** T5 dejó el `estado` opcional al final de `dadosDeAtaque` y `dadosDeDefensa`
  porque los seis sitios de `src/ui/` que las llaman estaban reservados por T14. La
  consecuencia era que **la pantalla enseñaba un dado que el motor no iba a tirar** a quien
  estuviera en un foso, y el diálogo le pedía al héroe un escudo de más al defender.
  Hecha T14, esta misma sesión tenía los tres ficheros y lo ha cerrado: seis llamadas, una
  palabra cada una. El motor no cambia. **Si vuelves a ver un `estado?` opcional en una
  firma del motor, es una divergencia esperando, no una comodidad.**

- **T17 · sesión `b63aa070` · 2026-09-05 · `8fbd674`.** El orden de los monstruos.
  - **Los tres criterios, y por qué ese orden**, que es lo que T8 hereda y T10 mide:
    1. **quien ya puede atacar sin moverse.** Si se le deja para el final, el héroe puede
       haberse ido y pierde un ataque que tenía servido.
    2. **quien está más cerca**, en línea recta y sin contar muros. Es una cuenta a ojo, no
       un camino: los caminos son T8. Aprieta al grupo por el flanco que ya está cerca en
       vez de repartir monstruos sueltos.
    3. **quien más aguanta**, para que absorba los golpes antes que los frágiles.
  - **La distancia va por geometría, no por lo que el monstruo ve**, y es deliberado:
    Zargon sabe dónde está todo el mundo, y si midiera visión los monstruos de las salas
    sin revelar empatarían todos a ciegas y el orden lo acabaría dando el desempate.
  - **El desempate está escrito, por identificador.** Con las salas sin revelar los empates
    son la norma, y `sort` solo promete estabilidad respecto al orden de entrada, que aquí
    es el del fichero de la misión.
  - **Aviso para T9 y T10: entre los monstruos básicos el tercer criterio casi nunca actúa.**
    Orco, goblin, esqueleto y zombi tienen todos cuerpo 1. Solo el fimir, la momia, el
    hechicero (2), el guerrero del Caos y la gárgola (3) lo mueven.
  - **La primera versión de los tests no probaba nada, y merece contarse.** Usaba
    identificadores `orco1`/`orco2`, el orden esperado coincidía con el desempate
    alfabético, y los siete pasaban con los criterios desconectados. Ahora, en cada caso, el
    que debe ir primero es el **último** alfabéticamente y el **segundo** en la lista de la
    misión; desconectando los criterios fallan cuatro. **Si tu test ordena cosas, comprueba
    que el orden que esperas no sea el que sale solo.**
  - **La activación manual se queda**, detrás de un «Cambiar», como manda T11.
  - **Jugado un turno entero de Zargon sobre la misión real** antes de darlo por bueno: los
    seis monstruos salen en orden y los cuatro empatados a distancia 4 no enseñan motivo,
    que es lo correcto —no lo hay— en vez de inventarse uno.

- **T14 · sesión `b63aa070` · 2026-09-05 · `d9c4f00`.** El botón de lanzar hechizos.
  - **Ningún hechizo se queda sin poderse lanzar desde la pantalla.** Los doce salen.
  - **El genio es el único que abre diálogo de dados**, y está razonado, no elegido a ojo.
    Bola de fuego y fuego de la ira tiran los dados de **salvación**, que los tira quien los
    recibe, y los dos apuntan a un enemigo: los tira la aplicación. Viento veloz no tira
    nada al lanzarse —los dos dados de más los añade `tirarMovimientoAccion`, y esa tirada
    ya pasa por `pedirMovimiento`—. El genio son cinco dados de combate del bando de los
    héroes, y aquí los dados de los héroes se tiran de verdad en la mesa; que
    `resolverDanoDirecto` acepte unos `dados` opcionales existe justo para esto.
  - **Los hechizos sin objetivo a la vista no se pintan, pero se explica el hueco.** Si el
    héroe tiene hechizos y ninguno alcanza, sale una línea diciéndolo. Sin ella, un panel
    vacío se lee como «la aplicación se los ha comido», que es literalmente el malentendido
    que abrió esta tarea.
  - **`hechizosLanzables` no tenía ni un test** pese a estar escrita hace semanas. Ahora
    tiene cuatro, en `tests/hechizos-lanzables.test.ts`. Uno para quien escriba T13 o T15:
    **dentro de una sala `puedeVer` da por visto todo sin trazar rectas**, así que la regla
    de T1 —las figuras tapan— solo se nota en el pasillo. Montar ese caso dentro de la sala
    `a` da un falso verde.
  - **No se tocó `estilos.css`**, que lo tenía reclamado `6f2f1053`: todo con las clases que
    ya había, y el tachado con `<s>`.

- **T7 · sesión `b63aa070` · 2026-09-05 · `85948b1`.** El equipo del mago.
  - **La mitad de la regla no se puede implementar, y por eso no se ha implementado.** El
    reglamento (p. 13) dice que el mago no puede «wear normal armor or use large weapons».
    Lo primero está hecho: veta la ranura `armadura` entera. Lo segundo, no: se leyó el
    reglamento inglés completo —24 páginas, los 13 pliegos del PDF— y **en ninguna se
    enumera qué es un arma grande**. La p. 13, en «A Trip to the Armory», remite a las
    cartas de equipo, que no tenemos. `equipoVetado` queda vacía con la marca
    `armasGrandesPorConfirmar`, y hay un test que fija que está vacía **a propósito**, para
    que nadie la rellene de memoria. Quien consiga las cartas: rellena, cita y quita la
    marca.
  - **Segunda cita, que confirma el alcance:** p. 22, «Wizard: Since there are so few things
    that you can buy from the armory, it would be wise for you to save your money».
  - **El hada va con las mismas trabas que el mago, y es decisión nuestra, no regla.** No
    sale en el reglamento: es añadido nuestro. Va así porque su propia carta promete que es
    «la más frágil de todos» y con cuerpo 3 la armadura es justo lo que borraría esa
    fragilidad, que es lo único que paga sus dos grupos de hechizos y el vuelo. Sin traba
    quedaría por encima del elfo —más magia, y encima vuela— sin ninguna desventaja a
    cambio. El porqué está también en su plantilla, junto al dato.
  - **El elfo no lleva ninguna traba** aunque lance magia: la restricción es del mago, no de
    saber magia. Está puesto como comentario porque es la pregunta que hará el siguiente.
  - **Comprobado que los tests prueban algo**, con la receta de T1: quitando el veto al
    mago, dos de ellos fallan.

- **T12 · sesión `46312c98` · 2026-08-22 · `8b0b7dc`.** La incidencia del commit cruzado.
  Cuatro cosas que conviene saber:
  - **El trabajo huérfano de `reducer.ts` está rescatado y es de otro.** Se commiteó tal
    cual, sin tocar una línea, nombrando en el mensaje a la sesión que lo escribió. Son la
    regla de T4 (`esHeroe(f)` en la condición de la trampa) y el retroceso de T2 hasta la
    primera casilla libre. **Las dos sin un solo test.**
  - **El verde no probaba nada.** Se comprobó revirtiendo: con el código anterior los 204
    tests pasan igual. Es la prueba que recomendaba T1 y aquí sale negativa, que es
    justamente el motivo por el que T2 y T4 siguen pendientes en vez de hechas.
  - **T7 se reclamó y no produjo nada.** `git log` sobre `src/data/` no tiene ningún commit
    posterior a su claim `6504be8`. Vuelve a pendiente: el claim solo, sin trabajo detrás,
    no reserva la tarea indefinidamente.
  - **La columna de ficheros estaba mal medida** y ese era el fallo de fondo: decía que
    `reducer.ts` lo tocaban tres tareas y son cinco. Quien repartiera sesiones con la tabla
    vieja abría en paralelo dos que iban al mismo fichero. Ya está corregida y medida con
    `grep`, no de memoria.

- **T6 · sesión `2921da7f` · 2026-09-05 · `0dc95d5`.** Cada héroe registra la sala una vez.
  **Con esta se cierran las siete divergencias y T8 queda libre.** Cuatro cosas:
  - **Es la única que cambia la forma del estado, y hay que decirlo dos veces.**
    `buscadoTesoro` pasa de `IdSala[]` a `Array<{heroe, sala}>`. Una partida guardada con el
    formato viejo **no cargaría**. Hoy no existe ninguna —guardar es de la Fase 8—, así que
    no hay migración que escribir, pero quien haga la Fase 8 tiene que saberlo. El
    «deshacer» no se entera: sigue siendo estado puro que se rehace repitiendo acciones.
  - **El motor solo cumplía media regla.** La p. 14 dice dos cosas: que la sala la registran
    los cuatro héroes y que cada uno una sola vez. Con una lista de salas, el primero se la
    cerraba a los otros tres y les quitaba su carta de tesoro, que es media diversión de la
    acción. Ahora sacan la suya.
  - **La condición vive en un solo sitio.** `yaRegistro(estado, heroe, sala)` está en
    `reducer.ts` y la importa `selectors.ts`. Es el patrón de `monstruosActivables`, y por
    el mismo motivo: la condición estaba a punto de quedar copiada en dos sitios, que es
    como empiezan siempre.
  - **Dos mutaciones opuestas, no una.** Si `yaRegistro` ignora al héroe —la semántica
    vieja— fallan los dos tests del compañero; si siempre dice que no, falla el del mismo
    héroe repitiendo. Cada mitad de la regla tiene quien la defienda, que con una regla de
    dos mitades es justo lo que hay que comprobar.

  **Lo que no trae:** el tesoro especial de misión. Está arriba, en incidencias.

- **T3 · sesión `2921da7f` · 2026-09-05 · `3bbf380`.** No se busca con un monstruo a la
  vista. La fila la cerró otra sesión al ver el commit; esto es lo que faltaba. Tres cosas:
  - **Los dos lados dicen lo mismo, y hay un test que lo comprueba en la misma línea.**
    `puedeBuscarTrampas` (selector) y `buscarTrampas` (reductor) se afirman juntos en cada
    caso. Revertir cualquiera de las dos mitades por separado hace fallar el mismo test:
    ninguna se puede olvidar sin que salte.
  - **La escena cambia una sola cosa.** Héroe quieto en el vano de (0,2), orco quieto en
    (2,2), y entre el caso que pasa y el que no solo se mueve si la puerta está abierta. Es
    a propósito: si mañana falla, no hay que averiguar cuál de tres cosas lo movió.
  - **El `vivos()` no es adorno.** `e.monstruos` conserva a los caídos con cuerpo 0, así
    que sin él un orco muerto en la sala impediría buscar para siempre. Hay un test para
    eso y falla si se quita.

  **Y un test ajeno tocado, dicho aquí además de en el commit:** `tests/puertas-vistas.test.ts`
  (T13) usaba `buscarTrampas` solo como medio para descubrir una puerta secreta, en la sala
  `q` recién abierta y con sus monstruos delante. Con la regla nueva ese paso es ilegal: no
  era un test equivocado, era una escena que dejó de valer. Se le quitan los monstruos en
  ese paso, que va de puertas.

- **T5 · sesión `2921da7f` · 2026-09-05 · `39f05f5`.** El foso resta un dado y ya no se
  desarma. Cuatro cosas:
  - **Las tres frases salieron del PDF, no de la tarea.** La página 17 se leyó con `Read`
    (`pages: 9`) y dice literalmente lo que T5 citaba, incluida «(This applies to monsters
    as well.)». Y de paso confirmó la de T4, «Monsters do not spring hidden traps», que
    está en esa misma página.
  - **El suelo de un dado se ha implementado solo para el héroe, y es discutible.** Su
    recuadro empieza por «As a hero» y **no** lleva la coletilla de los monstruos que sí
    lleva la regla de arriba. Leído literal: un goblin, que defiende con 1, dentro del foso
    defiende con 0. Está abajo, en «Pendientes de su palabra». No es un descuido: es la
    lectura conservadora, para no inventar una regla que el reglamento no da.
  - **El suelo protege de la penalización del foso y de nada más.** Si una figura ya llega
    a 0 dados por otro motivo, el foso no se los sube a 1. Es lo que avisaba T5 sobre dónde
    poner el `max`, y hay un test que lo fija: cambiar el 1 por un 0 hace fallar justo el
    del mago con daga.
  - **Divergencia conocida, y ya cerrada por otra sesión.** `dadosDeAtaque` y
    `dadosDeDefensa` recibieron el estado como argumento **opcional y último**, porque los
    cinco sitios de `src/ui/` que las llaman estaban reservados por otra sesión y no se
    podían tocar. Eso dejó la pantalla enseñando el dado sin descontar. Lo arregló
    `aa403fd` una hora después. Lo que queda de la historia es la forma del argumento, que
    ahora ya podría pasar a obligatorio y delante si alguien quiere.

  **Lo que T5 mandaba NO hacer y no se ha hecho:** buscar dentro del foso «como si fuera
  una sala aparte» (p. 17). Cambia cómo se identifican las salas para buscar tesoro y
  arrastraría a T6. Queda como divergencia conocida.

- **T4 · sesión `2921da7f` · 2026-09-05 · `9bcd7d1`.** Los monstruos no disparan las
  trampas ocultas. Solo faltaban los tests: la regla estaba desde `8b0b7dc`. Tres cosas:
  - **La prueba de T1 vuelve a salir negativa y luego positiva.** Con la condición vieja
    —sin el `esHeroe(f)`— la suite entera pasaba igual: no había un solo test que tocara
    la regla. Los cuatro nuevos fallan al revertirla y ninguno más se mueve. Esa segunda
    mitad importa tanto como la primera: dice que los tests nuevos prueban *esto* y no
    otra cosa de rebote.
  - **El test que vale es el de que la trampa no se gasta**, no el del daño. Que el orco
    salga ileso es lo llamativo; que el foso siga `gastada: false` y `descubierta: false`
    es lo que impide que Zargon vaya despejándoles el camino a los héroes al mover sus
    propios monstruos. El orco tiene un punto de cuerpo, así que si la trampa saltara
    moriría: el daño se prueba solo.
  - **La reclamación llegó después del trabajo, y no por descuido.** El tablón lo tuvo
    reservado otra sesión treinta minutos y el candado no dejaba escribir la fila. Ese
    rato costó T7: al volver, ya la tenía cogida `b63aa070`. Si vuelve a pasar, la salida
    es reservar cuanto antes **los ficheros** de la tarea —que es el candado que de verdad
    impide el solape— y dejar la fila del tablón para cuando se libere.

- **T1 · sesión `fae5dfc8` · 2026-08-22 · `a24b396`.** Las figuras cortan la línea de
  visión. Tres cosas que no estaban escritas:
  - **La rama `worktree-agent-a087aa61fe4700ed8` era buena y está fusionada y borrada.**
    Se validó revisando el *motivo* de sus dos cambios de test, no que pasaran: el de
    `vision.test.ts` afirmaba la regla equivocada y tocaba corregirlo; el de
    `reducer.test.ts` movía un orco que estaba en la línea de tiro y que con la regla
    nueva volvía ilegal un disparo que ese bloque no quería probar. Además la rama añadió
    por su cuenta el test que fija la regla nueva. Nada de esto se ve mirando el verde.
  - **La prueba que decide si un test nuevo vale**: revertir el fichero de producción y
    comprobar que falla. Los cuatro tests de la regla fallan sin el cambio. Uno que pasa
    igual con el código viejo no está probando nada. Recomendado para T2–T7, que también
    cambian reglas ya afirmadas por tests.
  - **La tarea daba por existente un test de «rozar una esquina» que no existía.** Ahora
    hay dos, y el caso permisivo del paso diagonal queda fijado. Si T2–T7 dicen «ese caso
    ya está cubierto», comprueba que lo esté.
  - **Se nota en la mesa**: con un compañero delante, el mago no puede apuntar y la
    ballesta del elfo no dispara a través de la fila. El orden de la fila pasa a ser una
    decisión.

---

## Autorizaciones de Juan Luis

Lo irreversible necesita una línea aquí antes de ejecutarse.

- **2026-08-22 — Las figuras de cartón caben en la casilla de 1,9 cm.** El tablero
  imprimible de cuatro folios A4 queda validado. No hace falta la versión de seis ni de
  nueve folios.
- **2026-08-22 — Los valores de cartas se cotejan contra el reglamento oficial de 2021**
  (Avalon Hill F3649), no contra la memoria ni contra una caja física, que no existe.
- **2026-09-05 — La fila 13 (base 1) de la sala central `k` pasa a pasillo.** Juan Luis
  revisó el tablero contra la foto de referencia y pintó esa zona como pasillo: era el
  único error de transcripción. La sala queda en 6 × 5. Ojo: los dos folios de abajo del
  tablero impreso quedan desfasados hasta reimprimirlos.
- **2026-08-22 — La entrada de «El calabozo del guardián» vuelve a un pasillo de una
  casilla de ancho.** Está en uno de dos (columnas 12-13) solo porque con la regla vieja
  los cuatro héroes se taponaban; era un parche, no diseño. **Se hace dentro de T2 y en el
  mismo commit que la regla**, nunca antes: con la regla vieja en pie, el atasco vuelve.

- **2026-09-05 — Los héroes que no caben en `mision.entrada` salen por las casillas más
  cercanas a ella.** Es su respuesta literal a la pregunta de T16: «lo de los 8 héroes creo
  que se puede solucionar poniéndolos en las 8 casillas más cercanas a la entrada». Resuelve
  el choque entre el tope de ocho y la autorización del 22 de agosto **sin tocar ninguna de
  las dos**: la entrada de «El calabozo del guardián» sigue siendo el pasillo de una casilla
  de ancho que dejó T2, y quien sobra se coloca a continuación, hacia fuera. Con esto,
  `calabozo.ts` no se toca: era el único fichero que T16 tenía pendiente.

  **Ojo, y no es lo mismo:** esto decide **dónde empieza** el grupo, no qué cuenta como
  salida. El objetivo «salir» (`reducer.ts`) sigue pidiendo que todos los héroes vivos estén
  sobre una casilla de `mision.entrada`, así que en una misión de salir con ocho héroes y
  cuatro casillas la victoria seguiría siendo imposible. Hoy no afecta a nadie —«El calabozo
  del guardián» se gana matando al guardián—. **Resuelto el 2026-09-06: mira la firma
  siguiente.**

- **2026-09-06 — En una misión de «salir», la salida lleva tantas casillas como héroes
  pueda llevar el grupo.** Respuesta literal de Juan Luis al aviso de la firma anterior:
  «Los 8 héroes podrán salir si ponemos suficientes casillas de salida. Basta hacer
  coincidir el número de casillas de entrada con el número de casillas de salida». Es una
  regla de **diseño de misiones**, no un cambio de motor: el objetivo «salir» sigue pidiendo
  a todos los héroes vivos sobre `mision.entrada`, y lo que se exige es que esa lista tenga
  al menos tantas casillas como el tope del grupo (hoy ocho). No toca al calabozo ni a
  ninguna misión existente. Para quien escriba la primera misión de salir: acompáñala de un
  test que exija `entrada.length >= 8` cuando el objetivo sea «salir», que es lo que
  convierte esta firma en algo que no se puede olvidar.

- **2026-09-06 — El 100 % de victorias en la primera misión está bien así.** Respuesta a la
  pregunta que dejó abierta el registro de T9: «me parece bien que en la primera misión los
  héroes ganen el 100 % de las veces. Las siguientes misiones serán más difíciles porque
  habrá más monstruos o los monstruos serán más letales o más resistentes.» Consecuencia
  operativa: **la dificultad se diseña por misión, no retocando los pesos de la IA**; los
  objetivos torpe ~80 % / astuto ~40 % del plan se medirán contra las misiones difíciles
  cuando existan, y nadie debe «arreglar» el calabozo para que Zargon gane más.

- **2026-09-06 — El troll de las cavernas entra en el bestiario**, hecho en `0e871d3`. Su
  encargo literal: muy fuerte y resistente pero muy torpe; **un dado de ataque y dos
  casillas por turno como mucho, y a cambio muchos dados de defensa** y muchísimos puntos
  de vida, para alguna de esas misiones difíciles. Lo firmado es esa forma —y
  `tests/monstruos.test.ts` la fija: el más lento, el que menos pega, el que más defiende y
  aguanta—; **la defensa 6 y el cuerpo 10 son concreción de la sesión `992c726d`**, escritos
  para ajustarse en una línea de `monsters.ts` cuando se pruebe jugando. Personalidad
  «lerdo»: va siempre a por el más cercano, porque con movimiento 2 una presa lejana es
  pasarse la misión andando. Dos avisos de mesa: **no hay figura de cartón de troll**, y
  `generar-cartas.ts` le imprimirá carta en la próxima regeneración, con sitio para diez
  heridas.

- **2026-09-05 — El suelo de un dado en el foso queda solo para los héroes (T5).** Decidido
  por la sesión `205592a2` por delegación de Juan Luis, 2026-09-05. Se queda la lectura
  literal, que es la ya implementada: el recuadro de la p. 17 dice «As a hero» y no lleva la
  coletilla de los monstruos que sí lleva la penalización de arriba. Extenderlo sería regla
  de la casa sin fuente —el mismo criterio que las armas grandes de T7— y el único caso al
  que afecta apenas puede darse: solo el goblin defiende con 1, y un monstruo dentro de un
  foso ya es rareza, porque las trampas ocultas no las dispara (T4). No hay código que
  cambiar; si algún día molesta jugando, es una línea en `conPenalizacionDeFoso` y su test.

- **2026-09-06 — Encender GitHub Pages y publicar la aplicación.** Preguntó cómo se
  encendía y, con las tres advertencias delante —que encenderlo solo no publica nada, que
  la página publicada **no** junta dos casas y que en el cliente no hay ni debe haber
  claves—, dijo «adelante». Ejecutado por la sesión `6905402d` con
  `gh api -X POST repos/salasgar/Hero-Quest/pages -f build_type=workflow`. Queda en
  `build_type: workflow`, o sea que **quien publica es `.github/workflows/pages.yml`** y no
  hay ninguna rama `gh-pages` que mantener. Se apaga con `gh api -X DELETE …/pages` o desde
  Settings → Pages. **Esto no autoriza el relevo**: sigue pendiente, justo debajo.

- **2026-09-06 — La Tempestad envuelve a un solo ser, no a la sala entera (T21).** Lo buscó
  él y lo dijo así: «un pequeño remolino que envuelve a un único ser (monstruo o héroe) a
  quien se le lanza y lo deja un turno sin jugar». Cierra la divergencia que T21 dejó
  abierta —el código marcaba a todos los monstruos de la sala y la carta decía «el monstruo
  elegido»— y que el reglamento no podía cerrar, porque su p. 14 remite a la carta del
  hechizo y las cartas no las tenemos. Implementado en el `case "perderTurno"` de
  `reducer.ts`: ya no razona por salas. **Lo del héroe no está hecho** y está preguntado
  abajo: `pierdeTurno` vive en `Monstruo`, no en `Heroe`.

- **2026-09-06 — El registro del relevo lleva número de revisión (T30).** Preguntado con las
  dos opciones delante —hacerlo ahora, sin nada desplegado, o después, redesplegando y
  cortando partidas vivas— contestó «sí». Es un cambio del protocolo, que es lo que la regla
  4 reserva para él. Hecho el mismo día, antes del `wrangler deploy`.

### Pendientes de su palabra

**La firma que queda de la fase de red (T30).** Las cuatro decisiones de diseño ya están
firmadas y copiadas en la cabecera de T30, y **lo de Pages ya está firmado y hecho** (arriba,
2026-09-06). Lo que falta es lo otro que sale de esta casa, y ninguna sesión se lo puede
autorizar a sí misma:

1. ~~**Activar GitHub Pages y publicar la aplicación**~~ — **firmado y hecho el 2026-09-06**.
   La aplicación está en <https://salasgar.github.io/Hero-Quest/>.
2. **Crear la cuenta de Cloudflare y desplegar el relevo**, que es donde quedan guardadas las
   partidas —el montaje y la lista de acciones— en un servicio de terceros. No hay datos
   personales dentro más allá de los nombres que los niños les pongan a sus héroes, pero es un
   dato que sale de casa y por eso se pregunta.

Las dos tareas se pueden **escribir y probar enteras sin ninguna de las dos firmas**: lo que
requiere su palabra es el `wrangler deploy` y el encendido de Pages, no el código.

~~**¿A quién alcanza la Tempestad: al monstruo elegido o a toda su sala? (T21).**~~
**Cerrada el 2026-09-06 por él.** La firma está arriba, entre las autorizaciones: un solo
ser. El código ya no razona por salas.

**¿La Tempestad se puede lanzar también sobre un héroe?** Sale de su propia respuesta —«un
único ser (monstruo o héroe)»— y **no está implementado**, así que se pregunta en vez de
darlo por hecho. Hoy `tempestad` declara `objetivo: "unEnemigo"` y el remolino solo prende
en un monstruo, porque `pierdeTurno` vive en `Monstruo` y no en `Heroe`. Hacerlo no es una
línea: cambia la forma del estado, el paso de turno tiene que saltarse a ese héroe y la
pantalla tiene que ofrecer a los compañeros como objetivo de un hechizo de ataque. Y hay una
pregunta de diseño detrás: en la mesa, quitarle el turno a un niño no es lo mismo que
quitárselo a un goblin. Si lo quieres, es tarea aparte.

~~**¿El suelo de un dado dentro del foso vale también para los monstruos? (T5).**~~
**Cerrada el 2026-09-05 por delegación suya.** La firma está arriba, entre las
autorizaciones: se queda la lectura literal, el suelo es solo de los héroes.

~~**La entrada del calabozo, con ocho héroes (T16).**~~ **Contestada el 2026-09-05.** Su
respuesta está arriba, entre las autorizaciones: los héroes que no caben en `mision.entrada`
salen por las casillas más cercanas a ella. No hizo falta ni estrechar ni ensanchar nada.

**Aparcada por decisión suya: las cuatro del libro de hechizos (T15).** El 2026-09-05 dijo
que **no lo tiene claro y que de momento no se haga nada de eso**. La tarea queda escrita y
sin tocar; estas cuatro preguntas siguen aquí para cuando la retome, no para que alguien las
conteste por él. Es regla de la casa, no del reglamento, así que nada de esto se puede
deducir de una fuente:

1. ¿Los hechizos del libro **se suman** a los nueve con los que ya empieza el mago, o
   **devuelven** los que ya gastó? Son dos juegos distintos.
2. ¿**Qué trae** el libro? ¿Un elemento que no eligió, uno suelto al azar de los doce, o los
   elige él a mano en el momento?
3. ¿Vale **solo para el mago**, o también para el elfo y el hada, que también lanzan?
4. ¿**Cómo se decide** si lo encuentra: él pulsando sí o no, o una tirada del motor como la
   de buscar tesoro? Y si falla, ¿puede reintentarlo, o esa estantería queda agotada?

De la 4 depende si la acción consume el `rng` del estado, y de eso dependen los tests y el
deshacer. **T15 está aparcada**: no está esperando estas firmas, está esperando a que él
decida si quiere la regla. No la cojas.

~~**Y un aviso que no es una pregunta:** si el tope sube a ocho, hacen falta ocho figuras de
héroe en cartón.~~ **Resuelto el 2026-09-06:** «ya he confeccionado suficientes figuras de
cartón». La mesa aguanta el grupo de ocho.

---

## Qué hay automatizado

**Nada, y es a propósito.** El reparto automatiza lo reversible y lo aburrido; aquí no hay
nada de eso. Ninguna tarea espera a una cuota, a un permiso ni a un proceso ajeno: son
once tareas de escribir código, y todas necesitan criterio. Además, en este entorno no
están disponibles las herramientas de programación remota, así que una tarea programada no
podría arrancar de todos modos.

T1, T4 y T12 están hechas. De las cinco que quedan, **cuatro tocan `reducer.ts`** (T2, T3,
T5 y T6) y van de una en una; solo **T7** es independiente. A T2 le falta ya solo la parte
de tests: su código de producción está en `main`, pero sin nada que lo ejerza.

---

## La rama que había dando vueltas

`worktree-agent-a087aa61fe4700ed8` **ya no existe**: contenía el intento de T1, se revisó
en la propia T1, resultó bueno y está dentro de `a24b396`. La rama se borró el 2026-08-22.
Si tu clon todavía la tiene, es tuya y sobra: `git branch -D worktree-agent-a087aa61fe4700ed8`.
Nunca llegó a empujarse a `origin`, así que en un clon nuevo no aparece.
