# T53 · El pergamino del guardián: la misión tiene encargo y termina al encontrarlo

**Precondición:** T51 LISTA (comparten `reducer.ts`). **No a la vez que 54 ni 50**
(`reducer.ts`, `types.ts`), **37, 38** (`types.ts`), **39** (`narrator/local.ts`) **ni 45**
(`scripts/simular.ts`).
**Banda de modelo:** ALTO — añade una clase de objetivo al motor, cambia el final de la
primera misión y hay que medir que el simulador la sigue ganando.
**Duración esperada:** 3 h · **Encadenable con:** 54 (misma banda; comparten `reducer.ts`
y `types.ts`: seguidas, nunca en paralelo).
**Ficheros que toca:** `src/engine/types.ts` (`ObjetivoMision`, un evento),
`src/engine/reducer.ts` (`buscarTesoro`, `comprobarDesenlace`),
`src/data/quests/calabozo.ts` (`introduccion`, `objetivo`), `src/narrator/local.ts` (el
evento nuevo), `scripts/simular.ts` (que los héroes del simulador busquen donde toca),
`tests/quest.test.ts`, `tests/reducer.test.ts`.
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Lo que pidió Juan Luis

El 2026-09-06, probando la página publicada:

> En la primera misión, el texto que aparece es: «El calabozo del guardián. Bajo el
> castillo hay un calabozo que nadie ha vuelto a abrir en cien años. Dicen que algo se
> quedó dentro montando guardia, y que todavía espera. Vosotros vais a averiguar qué.»
> No le asigna ninguna misión a los héroes. No les dice qué tienen que hacer. Sugerencia:
> «…Debéis encontrar un pergamino custodiado por una bestia del inframundo…». Cuando los
> héroes maten al Famir y busquen tesoros encontrarán el pergamino y habrán terminado la
> misión.

Es una firma suya de diseño de misión (`autorizaciones.md`, 2026-09-06): el encargo es
el pergamino, y **la misión termina al encontrarlo buscando tesoro en la sala del
guardián, con el guardián muerto**. Es el «tesoro de misión» del reglamento (p. 14: el
primer héroe que registra la sala lo encuentra en vez de robar carta), que hoy no existe
en `Mision`.

## Lo que hay hoy, medido

- `ObjetivoMision` tiene cuatro clases: `matarATodos`, `matarA`, `llegarA`, `salir`
  (`types.ts`, línea 146). El calabozo usa `matarA` el `guardian` (fimir en (2,16), que es
  la sala `q`: compruébalo con `salaEn`).
- `buscarTesoro` roba siempre la primera carta de `mazoTesoros`; no sabe nada de la
  misión.
- `comprobarDesenlace` se ejecuta tras cada acción y pone `desenlace` con un `motivo`
  que la pantalla enseña tal cual.
- El simulador (`scripts/simular.ts`, `accionDelHeroe`) mueve a los héroes hacia los
  monstruos y ataca; **si no busca tesoro nunca, con el objetivo nuevo el porcentaje de
  victorias pasa del 100 % a 0 %** y T45 medirá mal todas las misiones.

## Antes de empezar: mira si ya está hecho

```sh
grep -n "recuperar\|pergamino" src/engine/types.ts src/data/quests/calabozo.ts
```

## Qué hay que hacer

1. **La clase de objetivo**, en `types.ts`:
   `{ clase: "recuperar"; objeto: string; sala: IdSala; custodio?: IdFigura }`. El
   objeto se encuentra al **buscar tesoro** en `sala` cuando `custodio` (si lo hay) tiene
   cuerpo 0; ocupa la búsqueda del héroe (no roba carta además) y la misión termina con
   victoria en ese mismo momento. Evento nuevo (`objetoDeMision`, con actor y objeto) y
   su frase en el narrador; `desenlace.motivo`: algo como «Los héroes tienen el
   pergamino. Misión cumplida.»
   Si alguien busca en esa sala **antes** de que caiga el custodio, roba carta normal y el
   pergamino sigue ahí: cada héroe registra una sala una vez (T6), así que decide y deja
   escrito si esa búsqueda «gasta» la sala para ese héroe o si el pergamino se puede
   encontrar aunque ya la haya registrado. Lo razonable en la mesa es que **no la
   gaste**: el niño que buscó antes no puede quedarse sin poder terminar la misión.
2. **El texto y el objetivo del calabozo.** Propuesta, para que la sesión la afine:
   > Bajo el castillo hay un calabozo que nadie ha vuelto a abrir en cien años. Dicen que
   > algo se quedó dentro montando guardia, y que todavía espera. Vuestra misión: encontrar
   > el pergamino que esa bestia del inframundo custodia. Cuando lo tengáis en las manos,
   > habréis terminado.
   `objetivo: { clase: "recuperar", objeto: "el pergamino del guardián", sala: "q",
   custodio: "guardian" }`. El texto de la sala `q` puede insinuar el pergamino.
3. **El simulador**: que `accionDelHeroe` busque tesoro en la sala del objetivo cuando el
   custodio ha caído y no hay monstruos a la vista (con `puedeBuscarTesoro`). Medir con
   `npm run sim` los tres niveles **antes y después**: la firma del 2026-09-06 dice que el
   100 % de la primera misión está bien; si baja, es porque los héroes tardan en volver a
   la sala, no porque Zargon gane, y se dice en la terminada con el número de rondas.
4. **Tests**: `recuperar` termina la misión al buscar en la sala con el custodio muerto;
   no la termina con el custodio vivo; no roba carta al encontrarlo; el narrador tiene
   frase; `quest.test.ts` afirma que el custodio del calabozo está en la sala del objetivo.

## Trampas conocidas

- **`buscarTesoro` rechaza con monstruos a la vista** (T3): si el guardián muerto sigue en
  `e.monstruos` con cuerpo 0, `vivos()` ya lo filtra; no lo saques de la lista, que su
  longitud distingue casos (`_COMUN.md`).
- **`mision.objetivo` se usa fuera del motor**: busca `objetivo.clase` en `src/` y en
  `server/` antes de tocar el tipo; el `switch` de `comprobarDesenlace` no es exhaustivo
  y no avisará.
- **`VERSION` del protocolo de red** (`src/red/protocolo.ts`): si el montaje de una
  partida en red lleva la misión dentro, cambiar `Mision` es cambiar el protocolo, y eso
  se sube a mano. Míralo y dilo en la terminada.
- **`tests/integracion.test.ts` juega al azar** sobre el calabozo: con el objetivo nuevo
  algunas partidas terminarán buscando tesoro. Si una invariante se rompe, primero
  sospecha del cambio.

## Prohibido

- Tocar `TurnPanel.tsx` o `Juego.tsx`: la pantalla ya enseña `introduccion` y
  `desenlace.motivo`.
- Cambiar la entrada, las puertas o los monstruos del calabozo: eso es T55.
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md`. En la terminada, el texto final de la
introducción, la medida del simulador antes y después, y la decisión del punto 1.
