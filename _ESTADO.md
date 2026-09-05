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
| T2 | [Los héroes pasan por encima de otros héroes](tareas/T2-pasar-sobre-heroes.md) · *+ la entrada de la misión* | — | `board.ts`, `quests/`, **`reducer.ts`** | **pendiente** · `board.ts` está en `main` desde `d3dced0` y el retroceso del `reducer.ts` desde `8b0b7dc`; le faltan sus tests y la entrada de la misión |
| T3 | [Buscar trampas exige no ver monstruos](tareas/T3-buscar-trampas.md) | — | `selectors.ts`, **`reducer.ts`** | pendiente |
| T4 | [Los monstruos no disparan las trampas ocultas](tareas/T4-monstruos-y-trampas.md) | — | **`reducer.ts`** | **hecha** · `9bcd7d1` · 2026-09-05 |
| T5 | [El foso: un dado menos, y no se desarma](tareas/T5-foso.md) | — | `combat.ts`, `selectors.ts`, **`reducer.ts`** | en curso · `2921da7f` · 2026-09-05 |
| T6 | [Cada héroe registra una sala una vez](tareas/T6-registrar-sala.md) | — | `types.ts`, `partida.ts`, `selectors.ts`, **`reducer.ts`** | pendiente |
| T7 | [El mago no lleva armadura ni armas grandes](tareas/T7-equipo-del-mago.md) | — | `data/` | **hecha** · `85948b1` · 2026-09-05 · la armadura sí; la lista de armas grandes no la da el reglamento y queda marcada |
| T12 | [Incidencia: un commit se llevó trabajo ajeno](tareas/T12-incidencia-commit-cruzado.md) | — | `_ESTADO.md`, `reducer.ts` | **hecha** · `8b0b7dc` · 2026-08-22 |
| T8 | [Zargon decide: objetivos y caminos](tareas/T8-zargon-decide.md) | T1–T7 (falta T2–T7) | `src/ai/` | bloqueada |
| T9 | [Personalidades y dificultades](tareas/T9-personalidades.md) | T8 | `src/ai/` | bloqueada |
| T10 | [El simulador que mide si la IA está bien](tareas/T10-simulador.md) | T8 | `scripts/` | bloqueada |
| T11 | [El turno de Zargon sin clics](tareas/T11-turno-automatico.md) | T8, T9 | `src/ui/` | bloqueada |
| T13 | [Solo se pintan las puertas que alguien ha visto](tareas/T13-puertas-solo-las-vistas.md) | — | `types.ts`, `partida.ts`, **`reducer.ts`**, `selectors.ts`, `BoardMirror.tsx` | pendiente · **no la cojas mientras T5 esté en curso**: comparten `reducer.ts` y `selectors.ts` |
| T14 | [El mago no puede lanzar sus hechizos: falta el botón](tareas/T14-lanzar-hechizos-en-la-interfaz.md) | — | `TurnPanel.tsx`, `Juego.tsx`, `HeroSheet.tsx` | **hecha** · `d9c4f00` · 2026-09-05 · desbloquea T15 y T17 |
| T16 | [Hasta ocho héroes, y repetir clase](tareas/T16-hasta-ocho-heroes.md) | — · pero espera su palabra sobre la entrada | `EleccionDeHeroes.tsx`, `partida.ts`, `calabozo.ts` | en curso · `946ca4aa` · 2026-09-05 |
| T15 | [Buscar libro de hechizos en una estantería](tareas/T15-buscar-libro-de-hechizos.md) | T13, T14 · y sus cuatro decisiones firmadas | `types.ts`, **`reducer.ts`**, `selectors.ts`, `calabozo.ts`, `TurnPanel.tsx`, `Juego.tsx` | bloqueada · **T14 ya está hecha**; le falta T13 y las firmas |
| T17 | [Zargon elige qué monstruo actúa](tareas/T17-zargon-elige-el-orden.md) | T14 · **cumplida** | `src/ai/orden.ts`, `TurnPanel.tsx`, `Juego.tsx` | en curso · `b63aa070` · 2026-09-05 |

Las cinco salen de dos ratos de juego de Juan Luis el 2026-09-05 y ninguna estaba en la
lista original de divergencias. Vienen con dos hallazgos que no eran lo que parecía:

- **El mago sí tiene sus nueve hechizos.** Medido con `crearPartida`: `mago@13,18 hechizos=9`.
  Lo que faltaba era el botón para lanzarlos. La pregunta «¿cómo los consigue?» ya tenía
  respuesta en la página 13 del reglamento; lo roto era la pantalla. Eso es T14, y el libro
  de la estantería (T15) es una vía **extra**, regla de la casa.
- **La puerta de su captura es `pq`, en (0,15)-(1,15).** Medido con `puedeVer` sobre el
  estado inicial: al empezar, `ps`, `pt` y `pr` las ve algún héroe desde la escalera y `pq`
  no la ve nadie. Eso es T13. **La captura no llegó al chat**: la puerta se identificó
  midiendo, no mirando, y está sin confirmar por él.

### Banda de modelo de las tareas nuevas

Con qué modelo conviene abrir la sesión que coja cada una. Es **una posición del menú, no un
nombre**: los nombres de la gama cambian cada pocos meses y este reparto lleva ya tres
semanas. ALTO = el más capaz que haya; MEDIO = el intermedio.

- **ALTO** — T13 (cambia la forma del estado, y la regla la heredan T15 y la Fase 4),
  T15 (regla nueva que no está en el reglamento), T16 (choca con una autorización ya
  firmada, y el choque hay que resolverlo, no rodearlo).
- **MEDIO** — T14 (el motor ya está escrito y probado; esto es conectarlo), T17 (una
  heurística corta y reversible).

T1–T12 se escribieron sin banda y **no se les pone ahora**: no sale de sus ficheros, así que
ponérsela sería inventarla.

### Cuántas sesiones caben a la vez

**Hoy, dos.** No es una cifra prudente: es lo que dan los ficheros.

`reducer.ts` sigue siendo el cuello: lo tocan **T2, T3, T5, T6, T13 y T15**. Van de una en
una. Lo que ha cambiado el 5 de septiembre es de dónde sale la segunda sesión: **T7 y T14
ya están hechas**, y quien hacía de tarea libre ahora es **T17**, que toca `src/ai/orden.ts`,
`TurnPanel.tsx` y `Juego.tsx` y no pisa el motor. De ahí la combinación que va sobre seguro:

> **T17 + una cualquiera del grupo de `reducer.ts`.**

Cuidado con dos cosas al contar: **T15 y T17 comparten `TurnPanel.tsx` y `Juego.tsx`**, así
que no pueden ir a la vez; y **T16 no cuenta como tercera** aunque sus ficheros estén
libres, porque está esperando una decisión de Juan Luis y `partida.ts` lo tocan también
T6 y T13. Una tercera sesión sobre `reducer.ts` es posible —cada tarea toca funciones
distintas y `git` las suele fusionar— pero ya es apostar a que el rebase salga limpio. Si
lo intentas, que sea T2, que es la que menos toca el fichero: su regla ya está commiteada
y solo le faltan los tests y la entrada de la misión.

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

## La dependencia real de la Fase 4

Juan Luis pidió arreglar las siete divergencias **antes** de empezar la Fase 4, y así está
puesto en la tabla. Conviene saber por qué, por si alguna vez hay prisa:

De las siete, solo tres son bloqueantes técnicas de verdad. La IA de Zargon elige entre
acciones legales, y estas tres cambian **qué es legal para un monstruo**:

- **T1**, porque decide a quién ve y por tanto a quién puede atacar o apuntar. **Hecha.**
- **T4**, porque decide por dónde puede pasar sin comerse una trampa. **Hecha.**
- **T5**, porque cambia con cuántos dados pelea dentro de un foso.

T2, T3, T6 y T7 tocan solo el turno de los héroes: la IA no las nota. Escribir T8 antes de
tener T1, T4 y T5 significa escribirla contra unas reglas que van a cambiar, y rehacerla.

---

## Incidencias abiertas

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

---

## Registro de finalizaciones

Una línea por tarea terminada: quién, cuándo, el commit y qué se decidió por el camino que
no estaba escrito. Esto es lo que lee la sesión siguiente.

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

### Pendientes de su palabra

**La entrada del calabozo, con ocho héroes (T16).** El 2026-09-05 pidió que se puedan elegir
hasta ocho héroes. La autorización del 2026-08-22, cuatro líneas más arriba, manda estrechar
esa misma entrada a **una casilla de ancho** dentro de T2. Las dos cosas están pedidas por él
y no caben a la vez: hoy hay cuatro casillas de entrada, y `crearPartida` colocaría a los
ocho **apilados de dos en dos** —medido: 4 casillas distintas de 8—, que es un estado ilegal
desde el turno cero. Y `mision.entrada` decide además el objetivo «salir» (`reducer.ts:145`):
con ocho héroes y cuatro casillas, esa victoria pasa a ser **imposible**, no difícil.
Tres salidas, y la elección es suya:

1. **Fila india por el pasillo de una casilla.** Se puede en cuanto T2 deje pasar por encima
   de un compañero, que es justo lo que T2 hace. Respeta la autorización de agosto.
2. **La entrada crece** a ocho casillas y la autorización de agosto se revisa.
3. **El tope de ocho es para misiones futuras** y «El calabozo del guardián» se queda con
   cuatro, con la pantalla avisando de que en esta misión no caben más.

Hasta que conteste, T16 hace todo lo demás y **no toca `calabozo.ts`**.

**Las cuatro del libro de hechizos (T15).** Lo propuso él el 2026-09-05 y es regla de la
casa, no del reglamento, así que nada se puede deducir de una fuente:

1. ¿Los hechizos del libro **se suman** a los nueve con los que ya empieza el mago, o
   **devuelven** los que ya gastó? Son dos juegos distintos.
2. ¿**Qué trae** el libro? ¿Un elemento que no eligió, uno suelto al azar de los doce, o los
   elige él a mano en el momento?
3. ¿Vale **solo para el mago**, o también para el elfo y el hada, que también lanzan?
4. ¿**Cómo se decide** si lo encuentra: él pulsando sí o no, o una tirada del motor como la
   de buscar tesoro? Y si falla, ¿puede reintentarlo, o esa estantería queda agotada?

De la 4 depende si la acción consume el `rng` del estado, y de eso dependen los tests y el
deshacer. T15 está bloqueada hasta que estas cuatro estén firmadas aquí.

**Y un aviso que no es una pregunta:** si el tope sube a ocho, hacen falta **ocho figuras de
héroe en cartón**. Hoy hay cuatro.

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
