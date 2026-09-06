# T46 · La segunda misión: más monstruos, y el primer jefe que pega

**Precondición:** T45 LISTA (el catálogo y sus tests de estructura). Conviene, sin ser
obligatorio, que T42 esté LISTA para poder fijar el nombre de un monstruo en la misión.
**Banda de modelo:** ALTO — diseñar una misión es decidir qué pasa en la mesa con niños
delante y equilibrarla con números; esta además fija el patrón que copian las siguientes.
**Duración esperada:** 4 h · **Encadenable con:** —.
**Ficheros que toca:** `src/data/quests/<id>.ts` (nuevo), `src/data/quests/index.ts` (una
línea), `tests/quest.test.ts` (solo si el diseño necesita una comprobación nueva).
**No toca el motor, la IA ni la pantalla.**
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre. Lee también
`calabozo.ts` entero, que es el único ejemplo, y las firmas de `autorizaciones.md` sobre la
entrada, la salida, el 100 % y el troll.

## Lo que pidió Juan Luis

El 2026-09-06: «Diseñar más misiones, ordenadas por dificultad.» Con su firma del mismo
día: la primera se gana el 100 % de las veces y «las siguientes misiones serán más
difíciles porque habrá más monstruos o los monstruos serán más letales o más resistentes».

## Lo que hay hoy, medido

- «El calabozo del guardián»: cuatro salas, seis monstruos (goblins, orcos y un fimir de
  guardián), cinco puertas (una secreta), objetivo `matarA` el guardián. Los héroes ganan
  el 100 % de 100 partidas en los tres niveles, en unas ocho rondas (T9, T10). Con ~6
  ataques de monstruo por partida contra ~25 puntos de cuerpo del grupo, Zargon no puede
  matar a nadie por bien que elija: esa es la palanca.
- Especies disponibles (`monsters.ts`): goblin, orco, fimir, esqueleto, zombi, momia,
  guerrero del Caos, gárgola, hechicero del Caos y troll de las cavernas (defensa 6, cuerpo
  10, movimiento 2, personalidad «lerdo»).
- El tablero tiene 22 salas y `board-base.ts` no se toca: una misión elige qué salas usa,
  dónde pone puertas, monstruos, trampas y muebles, y por dónde se entra.

## Antes de empezar: mira si ya está hecho

```sh
ls src/data/quests/; npm run sim
```

Si el catálogo ya tiene dos misiones, esta está hecha.

## Qué hay que hacer

1. **Diseña sobre el papel primero**: título, dos frases de introducción para leer en voz
   alta, qué salas se usan (seis u ocho, en otra zona del tablero que el calabozo), dónde
   están las puertas (todas las salas que se usen, accesibles; alguna secreta con premio
   detrás), qué monstruos y dónde, qué trampas, qué muebles, y el objetivo. Un objetivo
   distinto al del calabozo enseña algo nuevo: `llegarA` (encontrar una sala) o `salir`
   (con al menos ocho casillas de entrada, firmado) valen sin tocar el motor.
2. **Más difícil, no más larga**: un jefe que pegue de verdad (guerrero del Caos o gárgola)
   con escolta, y monstruos que estén **entre** los héroes y el objetivo, no repartidos por
   salas que nadie visita. Los muebles importan: una mesa en medio de la sala cambia por
   dónde se rodea.
3. **Mide con `npm run sim`** (T45 ya sabe recorrer el catálogo). El objetivo del plan es
   `torpe` alrededor del 80 % y `astuto` alrededor del 40 %; esta, la segunda, no tiene
   que llegar ahí: basta con que gane menos que el calabozo en los tres niveles y que en
   `torpe` se siga ganando casi siempre. Los números van a la terminada y decide el orden
   en el catálogo.
4. **Los textos de sala** (`textosDeSala`) para todas las salas que se usan, cortos, para
   leer en voz alta al revelar.
5. **Juégala una vez de verdad** (`npm run dev`, con la IA de T11 si ya está): el
   simulador no ve si una sala aburre.

## Trampas conocidas

- **La entrada crece sola con el grupo** (T35): declara la entrada natural de la misión y
  no la ensanches para ocho.
- **Un monstruo no actúa hasta que lo descubren** (T18) y **Zargon no ve dentro de las
  salas sin revelar** al elegir orden (T17): un jefe en la última sala no hace nada hasta
  el final. Es lo normal; si quieres presión antes, monstruos en el pasillo.
- **Los textos van en el fichero de la misión, no en el narrador**: el narrador es común.
- **`salaEn` devuelve `null` en pasillo** (T21): los monstruos de pasillo no tienen sala.
- **El monstruo errante sale de las cartas de tesoro** y nace junto al héroe que busca: en
  una misión con muchas búsquedas aparece a menudo. Cuenta con ello al medir.

## Prohibido

- Retocar pesos de la IA o `calabozo.ts` para que cuadre: la dificultad se diseña aquí.
- Inventar una regla o un objeto que el motor no tenga: si el diseño lo pide, la misión
  espera y se escribe la tarea de motor aparte.
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md`. En la terminada: la tabla del simulador con las
dos misiones, el plano de la misión (salas, puertas, monstruos) y lo que se cambió después
de jugarla. Esta ficha es el modelo de las siguientes: si el diseño enseña algo que aquí no
está, escríbelo en trampas.
