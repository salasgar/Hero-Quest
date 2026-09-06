# T18 · Un monstruo no actúa hasta que los héroes lo descubren

**Precondición:** **T13 hecha.** Por dos motivos, y el segundo es el que importa: T13 tiene
reclamados `types.ts`, `partida.ts`, `reducer.ts`, `selectors.ts`, que son cuatro de los
cinco ficheros de esta tarea; y T13 decide **cómo se guarda en el estado lo que los héroes
ya han visto**. Esta tarea es la gemela de T13 para los monstruos y tiene que **reutilizar
ese patrón**, no inventar un segundo mecanismo paralelo. Si acabas con `puertasVistas`
funcionando de una manera y los monstruos de otra, el fallo se ha arreglado y el motor ha
empeorado.
**Banda de modelo:** ALTO — cambia la forma del estado, decide una regla de legalidad que
heredan T8, T11 y T17, y su parte cara no es escribirla sino **juzgar los tests que va a
tumbar**: la mayoría de los que montan un monstruo a mano dejarán de poder activarlo.
**Ficheros que bloquea:** `src/engine/types.ts`, `src/engine/partida.ts`,
`src/engine/reducer.ts`, `src/engine/selectors.ts`, `src/ui/TurnPanel.tsx`.
Mira en `_ESTADO.md` quién tiene `reducer.ts`, que lo tocan T2, T3, T4, T5, T6, T13 y T15.
**No puede ir a la vez que T17**, que reordena `monstruosPorActivar` y toca `TurnPanel.tsx`.
**Duración esperada:** 3 h · **Encadenable con:** — · **Ficheros que toca:** los de
«Ficheros que bloquea», arriba, más `tests/` (incluido `tests/ayuda.ts`).
(Líneas añadidas en la migración del reparto del 2026-09-06; la tarea ya estaba LISTA,
`hechos/terminadas/18--*`. El cierre es el de `proyecto.md`, con terminada en `hechos/`.)
Lee `_COMUN.md` primero.

## Lo que vio Juan Luis

Probando la aplicación el 5 de septiembre de 2026: **un monstruo actuó antes de que los
héroes lo encontraran.** Su diagnóstico es el correcto: los monstruos solo pueden actuar
cuando se descubren.

## El fallo, medido

No hay que creerse nada: se midió sobre «El calabozo del guardián», dejando que los cuatro
héroes pasen turno sin moverse hasta que le toca a Zargon.

```
SALAS REVELADAS: []
POR ACTIVAR: goblin1 (sala s), goblin2 (sala s), orco1 (sala t),
             goblin3 (sala t), orco2 (sala r), guardian (sala q)
ACTIVAR AL GUARDIAN: ACEPTADO
```

**Los seis monstruos de la misión, con cero salas reveladas.** Y el que peor sienta es el
último: `guardian` es el fimir de la sala `q`, al otro extremo del pasillo, detrás de la
puerta `pq` —la misma que en T13 no ve nadie desde la escalera—. En el primer turno de la
partida, antes de que ningún héroe se haya movido, Zargon puede sacarlo de su sala y
mandarlo a por el grupo.

En la mesa esto es peor que un bug de reglas: la figura del fimir **todavía está en la
caja**, porque Juan Luis solo la pone cuando se abre esa puerta. La aplicación está
moviendo un monstruo que físicamente no está en el tablero.

## Antes de empezar: mira si ya está hecho

```sh
grep -n "enTablero\|monstruosEnTablero\|descubiertos" src/engine/types.ts src/engine/selectors.ts
```

Si no hay nada, está pendiente.

## La regla, con su cita

Reglamento oficial de 2021 (Avalon Hill F3649), y son dos frases de dos sitios distintos
que solo juntas dicen la regla entera:

- **Página 11, «Order of Play»:** «After all heroes have completed their turns, it is the
  evil sorcerer's turn. Zargon may move **all monsters currently on the gameboard**.»
- **Página 12, «How Zargon Reacts to Hero Movement»:** «When a hero looks down a corridor,
  place on the gameboard any doors, blocked-square tiles, and monsters that are directly
  within the hero's line of sight. (If the line passes through a wall or a closed door then
  the miniature or tile is not visible.) **When a hero opens a door, place on the gameboard
  the monsters, treasure chests, and any other items that belong in that room.**»

En el PDF son las páginas 6 y 7; cada página del PDF es un pliego de dos del libro.

Léelo entero antes de modelar nada, porque la regla **no es «descubierto»**, que es una
palabra nuestra: es **estar puesto en el tablero**. Los dos matices que se pierden al
traducirlo mal:

- Un monstruo se pone en el tablero por dos vías, no una: **abrir la puerta de su sala**
  (todos los de esa sala) o **quedar en la línea de visión de un héroe** por un pasillo.
- **Una vez puesto, no se retira.** Los héroes pueden retroceder y perderlo de vista; la
  figura se queda en la mesa y Zargon lo sigue moviendo. Es exactamente la misma asimetría
  que T13 descubrió con las puertas, y por el mismo motivo: el espejo tiene que
  corresponderse con lo que hay encima de la mesa.

## Cómo modelarlo

Sugerencia. Si encuentras algo mejor, decídelo tú y escribe por qué en `_ESTADO.md`.

- **Copia el patrón de T13**, no lo reinventes: si T13 dejó `puertasVistas: string[]` en
  `EstadoPartida`, aquí va `monstruosEnTablero: IdFigura[]` al lado, con las mismas reglas
  —acumulativo, nunca quita, nada de `Set` porque el estado tiene que sobrevivir a
  `JSON.parse(JSON.stringify(e))`—.
- **Se actualiza en `terminar()`**, el embudo por el que pasan todas las acciones legales,
  y **después de revelar la sala**, por el mismo motivo de orden que explica T13: si lo
  haces antes, los monstruos de la sala que acabas de abrir tardan un turno en entrar.
- **Un monstruo entra en la lista** cuando su sala está en `salasReveladas`, o cuando algún
  **héroe vivo** lo ve (`puedeVer(e, heroe.celda, m.celda)`). Lo que vea Zargon no cuenta.
- **`crearPartida` lo deja vacío**, al revés que las puertas de T13. Al empezar «El
  calabozo del guardián» los seis monstruos están dentro de salas cerradas y ninguno está
  en el tablero. Si alguna misión futura pone un monstruo en un pasillo a la vista, la
  regla de la línea de visión lo mete sola en el primer `terminar()`.
- **La comprobación va en un solo sitio y los tres consumidores la llaman.** Ahora mismo el
  filtro «vivo, no hecho, no dormido, no pierde turno» está escrito **tres veces**: en
  `selectors.ts:118` (`monstruosPorActivar`), en las guardas de `activarMonstruo`
  (`reducer.ts:277-284`) y otra vez, copiado, dentro de `terminarTurno`
  (`reducer.ts:813-815`). **Ese tercero es el que se te va a olvidar**, y olvidarlo no da
  error: hace que Zargon crea que le quedan monstruos por mover cuando no le queda ninguno,
  y su turno no termina. Unifícalo antes de añadir nada.

## Lo que esta tarea NO es

| Esto sí | Esto no |
|---|---|
| **Si** un monstruo puede actuar | **Cuál** actúa primero — eso es T17 |
| Que la lista de activables respete lo descubierto | A quién ataca y por dónde va — eso es T8 |
| Que `TurnPanel` no ofrezca lo que no está en el tablero | Resolver el turno de Zargon solo — eso es T11 |

Si te encuentras escribiendo heurísticas de orden o de objetivos, para.

## La interfaz, de paso

`TurnPanel.tsx` pinta hoy un botón por cada monstruo de `porActivar`. Con el motor
arreglado deja de ofrecer los que no están en el tablero **y eso ya es media solución**,
pero repasa que el caso «ninguno» se lea bien: en el primer turno de la partida lo normal
va a ser que Zargon no tenga nada que hacer, y «No queda ninguno.» dicho en ese momento
suena a error de la aplicación. Con niños delante, la frase tiene que decir que aún no han
encontrado a nadie, no que algo ha fallado.

**No quites la activación manual** —misma prohibición que T11 y T17—: tiene que seguir
habiendo una salida para cuando la aplicación haga algo raro en mitad de una partida.

## Trampas conocidas

- **El monstruo errante.** `reducer.ts:558` (`monstruoErrante`, la carta de tesoro) crea un
  monstruo nuevo pegado al héroe que ha robado la carta. Ese **nace en el tablero**: los
  héroes acaban de ponerlo. Si tu campo nuevo no lo incluye al crearlo, el errante no podrá
  actuar nunca y nadie lo notará hasta que salga esa carta en una partida de verdad.
- **Vas a tumbar tests que estaban bien escritos.** `tests/ayuda.ts` tiene `situar()`, que
  coloca figuras saltándose las reglas, y buena parte de `reducer.test.ts` monta así un
  monstruo y lo activa. Con la regla nueva, esas activaciones se rechazan. **Son tests que
  afirmaban la regla vieja**: se corrigen añadiendo la sala revelada o el monstruo al
  tablero, y se dice en el commit que el test era el equivocado. Pero cuenta cuántos son y
  míralos uno a uno: uno que falle por otro motivo es un fallo tuyo, no del test, y
  distinguir las dos cosas honestamente es media tarea.
- **`puedeVer` devuelve `false` para toda casilla de una sala sin revelar**, incluso desde
  la de al lado. Consecuencia práctica: la cláusula de la línea de visión **solo cambia algo
  en los pasillos**. No te sorprenda que en «El calabozo del guardián» no dispare nunca; no
  está muerta, está esperando a una misión que ponga un monstruo en el pasillo.
- **El test de juego al azar va a jugar otra partida distinta.** `tests/integracion.test.ts`
  saca las acciones legales de `monstruosPorActivar`, así que no se rompe —pero con la regla
  nueva Zargon pasa turno hasta que alguien abre una puerta, y el combate de monstruos, que
  es donde ese test ha encontrado tres fallos reales, se ejercita mucho menos. Compruébalo y
  déjalo escrito: si hace falta, que el arnés abra una puerta pronto.
- **Zargon con cero monstruos en el tablero tiene que poder terminar su turno.** Es el
  estado normal del turno 1 y hoy no ocurre nunca, así que no hay ningún test que lo cubra.
  Es el candidato número uno a bloqueo de la partida.
- **`e.monstruos` conserva a los caídos con cuerpo 0.** Filtra por `cuerpo > 0` en cuanto
  preguntes quién está vivo.

## Tests que hay que añadir

- Al empezar «El calabozo del guardián» y llegar al turno de Zargon sin que nadie se mueva,
  **`monstruosPorActivar` está vacía** y `activarMonstruo("guardian")` se rechaza. Es el
  caso medido arriba, y el que fija la regla.
- Abrir la puerta de una sala pone en el tablero **a todos** sus monstruos, y Zargon puede
  activarlos ese mismo turno.
- Un monstruo puesto en el tablero **sigue activable** después de que todos los héroes se
  alejen y dejen de verlo. Es la mitad que un selector puro no cumple.
- Abrir una sala **no** pone en el tablero a los monstruos de la sala de al lado.
- El monstruo errante recién creado se puede activar en el turno siguiente.
- Zargon termina su turno sin bloquearse cuando no tiene ningún monstruo en el tablero.
- La prueba de T1, que es la que decide si un test vale: **revierte `reducer.ts` y
  `selectors.ts` y comprueba que estos tests fallan.** Uno que pasa igual con el código
  viejo no está probando nada.

## Prohibido

- **Inventar la regla.** Está citada arriba; si al implementarla te hace falta un matiz que
  no está en esas dos frases, léete la página 12 entera antes de decidirlo, y si sigue sin
  aparecer, implementa solo lo confirmado y deja escrito lo que falta.
- **Un segundo mecanismo distinto del de T13** para guardar lo que los héroes ya han visto.
- **Borrar o mover monstruos de `src/data/quests/calabozo.ts`** para que el síntoma
  desaparezca. Los seis están donde tienen que estar.
- **Quitar un monstruo del tablero** cuando los héroes dejan de verlo.
- Guardar la lista fuera del estado: rompe el deshacer, que rehace la partida repitiendo
  acciones sobre el estado inicial.
- Escribir orden de activación u objetivos: es T17 y T8.

## Al terminar

Commit en `main` y push. Línea en el registro de `_ESTADO.md` **diciendo explícitamente que
la forma del estado ha cambiado** —lo mismo que piden T6 y T13, y por el mismo motivo— y
**cuántos tests viejos hubo que corregir y por qué**, que es lo que la siguiente sesión
necesita para no sospechar del verde.

Y juega el primer turno de verdad antes de darlo por bueno: lo que hay que comprobar no es
que compile, es que al abrir la puerta de la sala `s` aparezcan los dos goblins y ni uno
más.
