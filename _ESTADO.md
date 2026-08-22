# Tablón de estado

**Esta es la fuente de verdad del proyecto.** Si un fichero de `tareas/` y este tablón se
contradicen, manda el tablón. Antes de tocar nada, léelo entero: son dos minutos y evita
repetir trabajo que ya está hecho.

Repositorio: <https://github.com/salasgar/Hero-Quest> · rama `main` · último commit
integrado: `a24b396` · 204 tests en verde.

Qué es el proyecto y por qué está montado así: `TRASPASO.md`. Qué falta y por qué es
urgente: aquí.

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

| # | Tarea | Precondición | Fichero que bloquea | Estado |
|---|---|---|---|---|
| T1 | [Las figuras cortan la línea de visión](tareas/T1-linea-de-vision.md) | — | `vision.ts` | **hecha** · `a24b396` · 2026-08-22 |
| T2 | [Los héroes pasan por encima de otros héroes](tareas/T2-pasar-sobre-heroes.md) · *+ la entrada de la misión* | — | `board.ts`, `quests/` | **en curso** · sesión `47e1fced` · 2026-08-22 |
| T3 | [Buscar trampas exige no ver monstruos](tareas/T3-buscar-trampas.md) | — | `selectors.ts` **+ `reducer.ts`** | pendiente |
| T4 | [Los monstruos no disparan las trampas ocultas](tareas/T4-monstruos-y-trampas.md) | — | `reducer.ts` | **en curso** · sesión `64d69b4d` · 2026-08-22 |
| T5 | [El foso: un dado menos, y no se desarma](tareas/T5-foso.md) | — | `reducer.ts` | pendiente |
| T6 | [Cada héroe registra una sala una vez](tareas/T6-registrar-sala.md) | — | `reducer.ts` | pendiente |
| T7 | [El mago no lleva armadura ni armas grandes](tareas/T7-equipo-del-mago.md) | — | `data/` | **en curso** · sesión `5ea252fd` · 2026-08-22 |
| T8 | [Zargon decide: objetivos y caminos](tareas/T8-zargon-decide.md) | T1–T7 (falta T2–T7) | `src/ai/` | bloqueada |
| T9 | [Personalidades y dificultades](tareas/T9-personalidades.md) | T8 | `src/ai/` | bloqueada |
| T10 | [El simulador que mide si la IA está bien](tareas/T10-simulador.md) | T8 | `scripts/` | bloqueada |
| T11 | [El turno de Zargon sin clics](tareas/T11-turno-automatico.md) | T8, T9 | `src/ui/` | bloqueada |

### Cómo se leen las dos últimas columnas

**«Fichero que bloquea»** no es una dependencia: es un candado. T4, T5 y T6 reescriben
las mismas funciones de `reducer.ts`. Se pueden hacer en cualquier orden, pero **no a la
vez**: antes de coger una, mira si otra con el mismo fichero está «en curso». Si lo está,
coge otra tarea. Dos sesiones editando `reducer.ts` en paralelo producen un conflicto que
cuesta más que el código.

**«bloqueada»** significa que la precondición no se cumple todavía, no que la tarea sea
difícil. En cuanto T1–T7 estén en «hecha», T8 se puede coger.

---

## La dependencia real de la Fase 4

Juan Luis pidió arreglar las siete divergencias **antes** de empezar la Fase 4, y así está
puesto en la tabla. Conviene saber por qué, por si alguna vez hay prisa:

De las siete, solo tres son bloqueantes técnicas de verdad. La IA de Zargon elige entre
acciones legales, y estas tres cambian **qué es legal para un monstruo**:

- **T1**, porque decide a quién ve y por tanto a quién puede atacar o apuntar. **Hecha.**
- **T4**, porque decide por dónde puede pasar sin comerse una trampa.
- **T5**, porque cambia con cuántos dados pelea dentro de un foso.

T2, T3, T6 y T7 tocan solo el turno de los héroes: la IA no las nota. Escribir T8 antes de
tener T1, T4 y T5 significa escribirla contra unas reglas que van a cambiar, y rehacerla.

---

## Registro de finalizaciones

Una línea por tarea terminada: quién, cuándo, el commit y qué se decidió por el camino que
no estaba escrito. Esto es lo que lee la sesión siguiente.

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
- **2026-08-22 — La entrada de «El calabozo del guardián» vuelve a un pasillo de una
  casilla de ancho.** Está en uno de dos (columnas 12-13) solo porque con la regla vieja
  los cuatro héroes se taponaban; era un parche, no diseño. **Se hace dentro de T2 y en el
  mismo commit que la regla**, nunca antes: con la regla vieja en pie, el atasco vuelve.

### Pendientes de su palabra

*(nada)*

---

## Qué hay automatizado

**Nada, y es a propósito.** El reparto automatiza lo reversible y lo aburrido; aquí no hay
nada de eso. Ninguna tarea espera a una cuota, a un permiso ni a un proceso ajeno: son
once tareas de escribir código, y todas necesitan criterio. Además, en este entorno no
están disponibles las herramientas de programación remota, así que una tarea programada no
podría arrancar de todos modos.

T1 ya está hecha. Quedan T2, T3 y T7, que no comparten fichero con ninguna otra y se
pueden hacer las tres a la vez; y T4, T5 y T6, que se reparten `reducer.ts` y por tanto van
de una en una.

---

## La rama que había dando vueltas

`worktree-agent-a087aa61fe4700ed8` **ya no existe**: contenía el intento de T1, se revisó
en la propia T1, resultó bueno y está dentro de `a24b396`. La rama se borró el 2026-08-22.
Si tu clon todavía la tiene, es tuya y sobra: `git branch -D worktree-agent-a087aa61fe4700ed8`.
Nunca llegó a empujarse a `origin`, así que en un clon nuevo no aparece.
