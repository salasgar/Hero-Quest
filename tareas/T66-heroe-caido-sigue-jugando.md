# T66 · Un héroe caído (cuerpo 0) sigue recibiendo turno y puede actuar

**Precondición:** ninguna. **No a la vez que T50** (`reducer.ts`, `types.ts`) — comparten el
motor; de una en una.
**Banda de modelo:** MEDIO — el diagnóstico ya está hecho (abajo, con fichero y línea); el
arreglo es acotado y el criterio ya está fijado (un caído no actúa), pero toca el motor y
exige remedir el simulador.
**Duración esperada:** 2 h · **Encadenable con:** — (comparte `reducer.ts` con T50, la única
otra tarea viva de motor).
**Ficheros que toca:** `src/engine/reducer.ts` (`avanzarActor`, y posiblemente las funciones
de acción si decides una defensa doble), `tests/reducer.test.ts` o
`tests/integracion.test.ts`, y una remedida con `npm run sim` (sin tocar el fichero, solo
para dejar la cifra nueva en la terminada).
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Cómo se encontró

El 2026-09-07, la sesión de la T46 (`s-20260907T211731-6bdd85b1`) lo vio al leer una partida
narrada del torreón: un héroe con cuerpo 0 («cae al suelo y ya no se levanta») seguía
recibiendo turno y podía mover y atacar. No tocó el motor —su ficha (T46) no lo declara, y
`reducer.ts` lo declara T50—, lo dejó razonado en
`hechos/incidencias/s-20260907T211731-6bdd85b1.md` y pidió una ficha propia.

## Diagnóstico medido en el código

**La causa es que `avanzarActor` nunca salta a un héroe caído.**
`src/engine/reducer.ts:1228-1256`:

```ts
const siguienteActor = (e: EstadoPartida): Actor =>
  e.turno.orden[(e.turno.indice + 1) % e.turno.orden.length]!;

function avanzarActor(e: EstadoPartida): EstadoPartida {
  const indice = (e.turno.indice + 1) % e.turno.orden.length;
  const entraZargon = e.turno.orden[indice] === "zargon";
  ...
  return { ...e, heroes, monstruos, turno: { ...e.turno, indice, ... } };
}
```

`e.turno.orden` es `[...heroes.map((h) => h.id), "zargon"]` (`src/engine/partida.ts:293`),
fijado al crear la partida y **nunca filtrado**: un héroe que cae con cuerpo 0 se queda en
la lista para siempre, y `avanzarActor` le da su turno igual que a los demás.

**Y ninguna de las acciones que puede hacer en su turno comprueba que el actor mismo esté
vivo** —todas comprueban al *objetivo*, no al *actor*—. Repasado `reducer.ts` entero (las
nueve llamadas a `figuraActiva(e)`):

| Función | Línea | Comprueba al actor vivo? |
|---|---|---|
| `tirarMovimientoAccion` | 312-326 | **No** |
| `mover` | 394-395 | **No** (solo `if (!f) return fallo(...)`) |
| `abrirPuerta` | 538 | **No** |
| `atacar` | 564-570 | **No** (comprueba `objetivo.cuerpo`, no `atacante.cuerpo`) |
| `buscarTesoro` | 661 | **No** |
| `buscarTrampas` | 780 | **No** |
| `usarPocion` | 859-862 | **Sí** — `if (h.cuerpo === 0) return fallo("Un héroe caído no puede beber nada.")` |
| `darObjeto` | 899-904 | Comprueba al *receptor* (`a.cuerpo === 0`), no a quien da (`f`) |
| `desarmarTrampa` | 918 | **No** |
| `lanzarHechizo` | 971 | **No** |

`usarPocion` es la única que se blindó a propósito; el resto asume que quien tiene el
turno está vivo porque, hasta ahora, nadie había probado lo contrario.

**No hay riesgo de bucle infinito al arreglarlo en `avanzarActor`.** La partida ya termina
en derrota en cuanto no queda ningún héroe vivo —`comprobarDesenlace`,
`src/engine/reducer.ts:138-145`: `if (vivos(e.heroes).length === 0) { ... finDePartida ... }`—
y `aplicarAccion` rechaza cualquier acción una vez que `estado.desenlace` está puesto
(línea 280: `if (estado.desenlace) return fallo("La partida ya ha terminado.")`). Así que
cuando `avanzarActor` tenga que saltar un hueco, siempre habrá como mínimo un héroe vivo (o
Zargon) más adelante en `orden` antes de completar una vuelta entera.

**El simulador mide con este fallo dentro.** Los porcentajes de `npm run sim` de todas las
misiones (calabozo 100/99/100, torreón 87/89/92, citados en la incidencia de la sesión que
lo encontró) están inflados en la parte en que un héroe caído siguió jugando en vez de
quedarse fuera. El orden relativo entre dificultades probablemente no cambia —el fallo
afecta a todas las partidas por igual—, pero las cifras concretas sí, y varias decisiones
citan esas cifras (`proyecto.md`, T45 firmada: «la dificultad de una misión es su posición
en el catálogo, y la decide el porcentaje de victorias medido»).

## Antes de empezar: mira si ya está hecho

```sh
grep -n "cuerpo > 0\|cuerpo <= 0\|cuerpo === 0" src/engine/reducer.ts | grep -i "avanzarActor\|figuraActiva"
```

(si no da nada, comprueba a mano si `avanzarActor` ya filtra `orden` antes de dar por hecho
que sigue el fallo).

## Qué hay que hacer

1. **En `avanzarActor`**: al calcular el siguiente índice, saltar los actores que sean un
   héroe con `cuerpo <= 0` (Zargon nunca está «caído»: no hace falta comprobarlo). Un bucle
   acotado a `orden.length` vueltas basta —justificado arriba, no hace falta más defensa—.
   `siguienteActor` (línea 1225-1226) se usa en otro sitio (revísalo con
   `grep -n "siguienteActor" src/engine/reducer.ts`): si el salto se hace solo dentro de
   `avanzarActor`, comprueba que ese otro uso no necesita el mismo criterio.
2. **Decide si además blindas las funciones de acción** (`mover`, `atacar`, etc.) con un
   `if (esHeroe(f) && f.cuerpo <= 0) return fallo(...)`, como ya hace `usarPocion`, para que
   una acción sobre un héroe caído falle con un mensaje claro en vez de depender solo de que
   `avanzarActor` nunca le dé el turno. Es una defensa en profundidad razonable dado que ya
   hay un precedente (`usarPocion`) y el coste es una línea por función; no es obligatorio si
   consideras que arreglar `avanzarActor` ya cierra el caso por completo — usa tu criterio,
   pero dilo en el cierre.
3. **Remide con `npm run sim`** antes y después del cambio (con la misma semilla/parámetros
   que use el script) y pon las dos cifras, por misión y nivel, en la terminada. **No
   reordenes el catálogo de misiones** aunque el porcentaje cambie de forma notable: eso es
   una decisión de banda ALTA sobre una firma existente (T45), y aquí solo toca decir la
   cifra nueva para que quien la revise decida si hace falta.

## Trampas conocidas

- **`e.monstruos` conserva a los caídos con cuerpo 0** (ya documentado en
  `tareas/_COMUN.md`, «Trampas del código»); el patrón para héroes es el mismo — no se
  quitan de `e.heroes` ni de `orden`, se quedan con `cuerpo: 0` y hay que filtrarlos donde
  corresponda, no borrarlos.
- **Zargon no es un héroe** y no tiene «cuerpo»: no intentes aplicarle el mismo filtro, ni
  falta que hace (su entrada en `orden` no puede estar «caída»).
- **`avanzarActor` también hace otras cosas** (limpia `pierdeTurno` de los monstruos al
  entrar el turno de Zargon, caduca los efectos de duración «turno» de los héroes): no las
  toques, solo añade el salto del índice.
- **El simulador (`scripts/simular.ts`) juega con IA, no con las acciones que un jugador
  humano metería a mano**: comprueba que la IA de Zargon (`src/ai/`) no dependía sin
  querer de que un héroe caído siguiera «disponible» para algo (poco probable, pero
  compruébalo si algún test de IA falla al arreglar esto).

## Tests que hay que añadir

- Un héroe cae a cuerpo 0 en mitad de una partida de tres o más héroes; se comprueba que
  `avanzarActor` (o el flujo de `terminarTurno` que lo llama) nunca vuelve a ponerlo como
  `actorActual`, y que el resto de héroes y Zargon siguen turnándose con normalidad.
  `tests/integracion.test.ts` (el juego al azar) es donde más probable es que esto ya se
  note si el arreglo está mal: vigílalo en la tanda de verificación.
- Si añades la defensa en las funciones de acción (punto 2), un test por función que
  compruebe que rechaza la acción con el actor a cuerpo 0.

## Prohibido

- Reordenar `quests/index.ts` (el catálogo de misiones) por el cambio de porcentaje: eso lo
  decide una tarea de banda ALTA aparte, con Juan Luis delante si toca una firma.
- Quitar a un héroe caído de `e.heroes` o de `orden`: se queda, con `cuerpo: 0`, igual que
  los monstruos.
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md`. En el mensaje de cierre, incluye las cifras del
simulador antes y después (por misión y nivel) y di explícitamente si crees que el cambio es
lo bastante grande como para que alguien revise el orden del catálogo.
