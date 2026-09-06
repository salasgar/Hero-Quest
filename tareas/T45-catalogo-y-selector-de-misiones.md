# T45 · El catálogo de misiones, ordenado por dificultad, y su selector

**Precondición:** ninguna. **No a la vez que 11, 36, 44** (`Juego.tsx`), **37, 41**
(`EleccionDeHeroes.tsx`) **ni 38** (`scripts/simular.ts`): mejor después de esas cadenas.
**Banda de modelo:** ALTO — decide una estructura que heredan todas las misiones que
vengan (T46, T47 y las siguientes) y cómo se mide la dificultad de cada una.
**Duración esperada:** 4 h · **Encadenable con:** —.
**Ficheros que toca:** `src/data/quests/index.ts` (nuevo, el catálogo), `src/ui/Juego.tsx`,
`src/ui/EleccionDeHeroes.tsx`, `src/red/cliente.ts`, `scripts/simular.ts`,
`tests/quest.test.ts`, `tests/` (uno nuevo para el catálogo). **No toca `reducer.ts` ni
`calabozo.ts`.**
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Lo que pidió Juan Luis

El 2026-09-06: «Diseñar más misiones, ordenadas por dificultad.» Y dos firmas anteriores
que mandan aquí (`autorizaciones.md`): **la dificultad se diseña por misión, no retocando
los pesos de la IA** (2026-09-06: «las siguientes misiones serán más difíciles porque habrá
más monstruos o los monstruos serán más letales o más resistentes»), y **el troll de las
cavernas** existe para «alguna de esas misiones difíciles».

Diseñar las misiones es T46, T47 y las que se añadan después, una por tarea. Esta es la
que hace posible que haya más de una.

## Lo que hay hoy, medido

- **Una sola misión, `MISION_CALABOZO`, fijada en tres sitios**: `Juego.tsx:49`
  (`crearPartida`), `EleccionDeHeroes.tsx:21` (`PLAZAS` de la entrada) y `cliente.ts:45`,
  que ya tiene un **catálogo por id** (`[MISION_CALABOZO.id]: { mision, … }`) porque el
  montaje de red viaja con `mision: string`.
- `scripts/simular.ts:177` también la lleva fija; sus argumentos son número de partidas y
  semilla base.
- `Mision` (`types.ts`) lleva `id`, `titulo`, `introduccion`, `entrada`, `textosDeSala` y
  `objetivo`; las puertas, monstruos, trampas y muebles van en constantes aparte del mismo
  fichero (`PUERTAS_CALABOZO`, …) y las junta quien crea la partida. Cuatro clases de
  objetivo: `matarATodos`, `matarA`, `llegarA`, `salir`.
- `estado.mision.entrada` es un dato derivado (T35): con más héroes que casillas, la
  entrada crece. Una misión de `salir` tiene que declarar al menos ocho casillas (firma del
  2026-09-06), y hoy nada lo comprueba.

## Antes de empezar: mira si ya está hecho

```sh
ls src/data/quests/; grep -n 'MISION_CALABOZO' src/ui/Juego.tsx src/ui/EleccionDeHeroes.tsx
```

Si existe `quests/index.ts` y esos dos ficheros ya no importan `MISION_CALABOZO`, está hecha.

## Qué hay que hacer

1. **Un tipo que junte lo que hoy va en cinco constantes**: `MisionCompleta = { mision,
   puertas, monstruos, trampas, muebles, dificultad }`, y el catálogo `MISIONES` en
   `quests/index.ts` como **lista ordenada por dificultad**, el calabozo el primero. La
   dificultad es un número de orden, no una etiqueta: la lista es el orden. Cada misión
   lleva además una **frase de dificultad para la mesa** («para empezar», «con un jefe que
   pega de verdad»).
2. **El selector en `EleccionDeHeroes.tsx`**: elegir misión antes que héroes (el número de
   plazas depende de la misión). Por omisión, la primera. En red, quien crea la partida
   elige y el montaje ya lleva el id.
3. **`Juego.tsx`, `cliente.ts` y `simular.ts` leen del catálogo**, nunca de la constante.
   El simulador acepta el id de la misión como argumento (`npm run sim -- 100 1000
   calabozo`) y, sin argumento, **recorre el catálogo entero** y saca una tabla: misión,
   nivel, porcentaje de victorias, rondas. Esa tabla es la definición operativa de «ordenada
   por dificultad» y va en la terminada de cada misión nueva.
4. **Tests del catálogo** que valgan para toda misión presente y futura, en
   `tests/quest.test.ts` generalizado: ids únicos; entrada en pasillo, sin mueble ni trampa
   encima; puertas sobre un muro real (`hayMuroEntre`); monstruos y muebles en casillas
   distintas y dentro de sala; el objetivo `matarA` nombra a un monstruo que existe;
   `salir` declara al menos ocho casillas de entrada; y el test de alcanzabilidad de T40,
   si ya existe, se recorre para cada misión. Hecho así, T46 y T47 no tienen que escribir
   tests de estructura: solo diseñar.
5. **Cómo se mide la dificultad**, escrito en la cabecera de `index.ts`: 100 partidas por
   nivel con `npm run sim`, héroes tontos, y el orden del catálogo tiene que coincidir con
   el orden de porcentajes de victoria en `normal`. Si una misión nueva desordena la lista,
   se reordena la lista, no se retocan los pesos.

## Trampas conocidas

- **`op.mision` es un dato de módulo compartido y `crearPartida` lo copia** en vez de
  mutarlo (T35). El catálogo tiene que ser de solo lectura (`as const`, `readonly`).
- **La entrada crece sola** con el grupo (T35): una misión no necesita ocho casillas salvo
  que sea de `salir`.
- **El montaje de red lleva el id**: si el catálogo no tiene ese id, el cliente tiene que
  decirlo en pantalla y no reventar (partidas creadas con una versión que tenía una misión
  que la otra casa no tiene).
- **`EleccionDeHeroes.tsx` y `Juego.tsx` son los ficheros más disputados del tablón**:
  reclama cuando las cadenas 37+41 y 11+22+36 hayan cerrado, o el reclamo se te cruza.
- **Los héroes del simulador son tontos a propósito** (T10): los porcentajes valen para
  ordenar, no como verdad absoluta de la mesa.

## Prohibido

- Tocar `reducer.ts`: las cuatro clases de objetivo bastan para T46 y T47. Una clase nueva
  (recuperar un objeto, por ejemplo) es tarea aparte de banda ALTA.
- Cambiar el calabozo: es la misión de referencia y su 100 % está firmado.
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md`. En la terminada, la tabla del simulador con el
catálogo entero (hoy, una fila), y en el mensaje a Juan Luis la pantalla del selector.
Quien cierre esta tarea desbloquea T46: que lo diga.
