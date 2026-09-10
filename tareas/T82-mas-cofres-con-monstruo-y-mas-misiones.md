# T82 · Más cofres con monstruo, menos salas vacías, más misiones por dificultad

**Precondición:** ninguna. **No a la vez que T45, T46, T47, T51, T53, T54, T55, T73**
si alguna volviera a estar viva (`quests/*.ts`, `scripts/simular.ts`) — hoy todas LISTA.
**Banda de modelo:** ALTO — igual que T45-T49: mide con el simulador, decide contenido de
misión y puede reordenar el catálogo por dificultad, que es justo lo que esa familia de
tareas ya trató como decisión que pide criterio y, si cambia el orden publicado, firma de
Juan Luis (precedente: «la dificultad de una misión es su posición en el catálogo, y la
decide el porcentaje de victorias medido, nunca un retoque de la IA», firma del
2026-09-06).
**Duración esperada:** 5 h, y es probable que salga **MAL CORTADA** en dos tareas
—auditar/ampliar lo que ya existe primero, misión(es) nuevas después—, igual que pasó con
«más misiones» (T45 partió en T46, T47, T49...). Quien la reclame, dilo en la terminada si
hace falta partirla, con el protocolo de `_COMUN.md`/`concurrencia.md` para tareas mal
cortadas. **Encadenable con:** — (ALTO, larga, no encaja con las MEDIO cortas de hoy).
**Ficheros que toca:** `src/data/quests/*.ts`, `src/data/quests/index.ts`,
`scripts/simular.ts` (solo si hace falta, no tocar sin motivo), y los ficheros que declare
la propia auditoría inicial.
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Lo que pidió Juan Luis

El 2026-09-10, jugando: «pienso que deberías hacer más “cofres con monstruos” y que menos
salas, además de más misiones de distintas dificultades dependiendo de los monstruos y de
las trampas.»

Son **tres peticiones relacionadas pero distintas**, y no está decidido cómo se reparten en
tareas más pequeñas: esta ficha es el punto de entrada, no la especificación cerrada de las
tres.

1. **Más «cofres con monstruo»**: encuentros donde el tesoro viene acompañado de un
   monstruo que lo guarda o que salta al abrirlo, no una sala vacía con una carta. Hoy el
   único mecanismo parecido en el motor es la carta `monstruoErrante` (`treasure.ts`: «un
   goblin te ha estado siguiendo… aparece a tu lado») y la emboscada del monstruo de arena
   (T50, un poder de una especie concreta, no un patrón general de sala). No hay hoy un
   patrón de «sala con cofre custodiado por un monstruo fijo, colocado a mano en el mapa de
   la misión», que es probablemente lo que Juan Luis tiene en mente jugando al tablero
   físico.
2. **Menos salas (vacías)**: las tres misiones de hoy (`calabozo`, `cavernas`, `torreon`,
   `src/data/quests/index.ts:137`) tienen salas sin nada dentro adrede — es lo que hace que
   registrar una sala dé respeto, y T40 («todas las salas con puerta») y T55 («las
   diecisiete salas nuevas, con algo dentro») ya trabajaron esta tensión antes. «Menos
   salas» puede leerse como menos salas *vacías* (más ocupadas con algo, monstruo o tesoro)
   o como mapas más cortos en número de salas total; **antes de tocar nada, pregúntaselo a
   Juan Luis por una frase si al reclamar la tarea no está claro cuál de las dos quiere**:
   son cambios de alcance muy distinto y esta ficha no decide por él.
3. **Más misiones de distintas dificultades, según monstruos y trampas**: el catálogo tiene
   tres misiones hoy. El patrón ya existe (T45 montó el catálogo y el medidor; T46 y T47
   añadieron una misión cada una) y la dificultad la fija `npm run sim`, no un cálculo a
   mano — pero la petición explícita de que la dificultad dependa **de qué monstruos y qué
   trampas** trae, y no solo del tamaño del mapa, es nueva: hoy el simulador mide el
   resultado, no hay una tabla que diga «esta combinación de monstruos equivale a este
   nivel».

## Qué hay que hacer

**Primer paso, dentro de esta ficha, antes de decidir si se reparte:**

1. Audita las tres misiones actuales con `npm run sim` (columna a columna, política tonta y
   razonable, como ya hace T73) y cuenta, por misión: número de salas, cuántas están vacías
   de verdad (sin monstruo, sin trampa, sin tesoro), y en cuántos encuentros un monstruo
   está junto a tesoro en la misma sala hoy.
2. Con esos números delante, decide si esta tarea te cabe entera (añadir cofres-con-monstruo
   a las misiones que ya existen, sin crear una misión nueva) o si hace falta partirla —
   sigue el criterio de «larga» frente a «mal cortada» de `_COMUN.md`: si además de ampliar
   lo que hay Juan Luis quiere una misión nueva con más dificultad, eso es más trabajo del
   que cabe en una sola tarea de 5 h y toca declarar `parada por: mal cortada` con el corte
   que hayas visto, no intentarlo todo de una vez.
3. Si decides seguir: añade el patrón de «monstruo custodiando tesoro» a las misiones
   existentes (colocar un monstruo fijo en una sala que ya tenga tesoro, o mover tesoro a
   una sala que ya tenga un monstruo fijo — no un evento aleatorio nuevo salvo que
   justifiques por qué hace falta motor nuevo), mide el efecto en `npm run sim` antes y
   después (igual que hizo T66 con el torreón) y decide si el catálogo tiene que reordenarse
   por dificultad —si cambia el orden publicado, pide la firma de Juan Luis igual que T45.

## Trampas conocidas

- **La dificultad de una misión es su posición en el catálogo, y la decide el porcentaje de
  victorias medido, nunca un retoque de la IA** (firma del 2026-09-06, `autorizaciones.md`).
  No reordenes `MISIONES` sin volver a medir y, si cambia el orden publicado, sin su firma.
- **«Menos salas» es ambiguo** (ver arriba): no lo decidas tú solo si al reclamar la tarea
  no lo tienes claro.
- **`reducer.ts`/`types.ts` no hace falta tocarlos** si te limitas a colocar monstruos y
  tesoro con lo que ya existe (`quests/*.ts`); si descubres que hace falta un mecanismo de
  motor nuevo para «cofre con monstruo» (por ejemplo, que el monstruo aparezca solo al abrir
  el cofre, no antes), es una decisión de diseño que pide preguntarle a Juan Luis primero,
  con el mismo criterio que T50 le preguntó antes de que un poder afectara a un héroe.
- **Con 3 monstruos por sala normal en el reglamento original**, no metas más de los que el
  mapa físico de Juan Luis pueda sostener con las figuras que tiene: es un tablero físico
  (`_COMUN.md`, «El proyecto en dos frases»), no una pantalla sin límite.

## Prohibido

- Reordenar el catálogo publicado sin volver a medir con `npm run sim` y sin la firma de
  Juan Luis si el orden cambia.
- Inventar una mecánica de motor nueva para «cofre con monstruo» sin preguntarle antes: el
  patrón más simple —monstruo fijo en la misma sala que el tesoro, colocado a mano en la
  definición de la misión— puede bastar y no pide tocar el motor.
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md`. Si la tarea sale MAL CORTADA, sigue el protocolo
de `hechos/fallos/`, `hechos/incidencias/` y `ABANDONADA` de `_COMUN.md`/`concurrencia.md`
en vez de forzar un cierre; dile a Juan Luis qué preguntas concretas le quedan abiertas
(sobre todo la de «menos salas»).
