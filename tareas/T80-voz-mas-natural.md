# T80 · Una voz menos robótica para el diario leído

**Precondición:** ninguna. **No a la vez que T72, T44** si alguna volviera a estar viva
(`voz.ts`, `Juego.tsx`) — hoy ambas LISTA.
**Banda de modelo:** MEDIO — ajuste de parámetros y heurística de selección de voz, sin
regla de juego; el veredicto de «suena natural» es de Juan Luis, no verificable en este
entorno (no hay navegador).
**Duración esperada:** 1,5 h · **Encadenable con:** T79, T81 (las tres MEDIO, cortas, sin
ficheros en común entre sí).
**Ficheros que toca:** `src/ui/voz.ts`.
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Lo que pidió Juan Luis

El 2026-09-10, jugando: «cambia la voz de la narradora y hazla mucho menos monótona y
mucho menos robótica. En resumen, mucho más natural.»

## Cómo elige la voz hoy, comprobado leyendo el código

`vozEnEspanol()` (`src/ui/voz.ts:24-27`) coge **la primera** voz de
`speechSynthesis.getVoices()` cuyo `lang` empiece por `es`, sin mirar más criterio, y si no
hay ninguna, la primera voz que haya (que podría ni ser española). `leerTexto()`
(`voz.ts:62-90`) no fija `pitch` (queda en 1, el valor por defecto, plano) y `rate` viene
del llamador (`useLecturaDeDiario` lo llama sin segundo argumento, así que también es 1).
Los navegadores —sobre todo macOS/Safari y Chrome— suelen traer varias voces en español de
calidad distinta: una «compacta» (ligera, con la prosodia más robótica) y, si el sistema
las tiene instaladas, variantes «mejoradas»/«premium»/«neuronales» con nombres como
«(Enhanced)», «(Premium)», «Natural» o similares. Elegir «la primera que empiece por es»
no distingue entre ellas.

## Qué hay que hacer

1. **Preferir voces de mejor calidad cuando haya más de una en español**: una heurística
   sobre `SpeechSynthesisVoice.name` (contiene «enhanced», «premium», «natural», sin
   distinguir mayúsculas/acentos) antes que una que no lo diga, y entre varias iguales,
   preferir una marcada como femenina si el nombre lo distingue (Juan Luis habla de «la
   narradora»); si no hay forma de saberlo, no inventes: la primera que cumpla el criterio
   de calidad basta.
2. **Ajustar `rate` y `pitch` por defecto** en `leerTexto()`: un `rate` ligeramente por
   debajo de 1 (empieza por 0.92-0.95) suele sonar menos atropellado sin quedarse lento, y
   un `pitch` explícito en vez de dejarlo en el valor por defecto puede ayudar según la voz
   —pruébalo, no hay una cifra correcta universal sin oírlo—. Dejar los dos como
   parámetros con valor por defecto, no como constantes ocultas, para que se puedan afinar
   sin tocar la firma de la función si Juan Luis pide otro ajuste después.
3. **No trocear el texto por frases** para intentar «prosodia»: `speechSynthesis` ya hace
   sus propias pausas con la puntuación del texto que le llega (el que ya pinta el diario),
   y trocearlo a mano puede introducir cortes peores que los que hay hoy. Si se te ocurre
   probarlo, dilo como propuesta en la terminada, no lo metas sin poder oírlo.

## Trampas conocidas

- **Sin navegador en este entorno** (ya lo dejaron anotadas T72 y T44): no se puede oír el
  resultado. Verifica por lectura del código y con `npx vitest run`/`npm run typecheck`, y
  dile a Juan Luis que lo pruebe él y cuente qué tal suena; esta ficha no se puede cerrar
  «a oído» aquí.
- **`getVoices()` puede devolver una lista vacía en la primera llamada** (se carga de forma
  asíncrona en algunos navegadores): eso ya lo maneja el código actual con el `?? voces[0]`
  y no hace falta arreglarlo aparte; solo asegúrate de que la heurística nueva no rompe si
  la lista está vacía.
- **No hay ninguna voz «correcta» universal**: los nombres de voz cambian entre Windows,
  macOS, Chrome y Safari. La heurística es de mejor esfuerzo, no una lista cerrada de
  nombres exactos.

## Tests que hay que añadir

Uno que compruebe la heurística de selección de voz con una lista de `SpeechSynthesisVoice`
simulada (varias es-*, alguna con «Enhanced»/«Premium» en el nombre, alguna sin), y que
`leerTexto` pasa `rate`/`pitch` al `SpeechSynthesisUtterance`. `speechSynthesis` no existe
en el entorno de test (jsdom/node): sigue el patrón que ya usa `voz.ts` (`sintesis()`
devuelve `null` sin navegador) o monta un mock mínimo, como ya hacen los tests existentes de
T72 si los hay.

## Prohibido

- Prometer una voz «natural de verdad»: sin navegador aquí, lo único verificable es que el
  código pide una voz mejor y una velocidad/tono distintos; el resultado real lo juzga
  Juan Luis.
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md`. Dile a Juan Luis en el mensaje de cierre que
pruebe la voz jugando y que diga si hace falta afinar `rate`/`pitch` más.
