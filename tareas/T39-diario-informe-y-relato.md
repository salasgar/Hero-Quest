# T39 · El diario en dos modos: informe y relato

**Precondición:** T42 LISTA — el informe dice «el orco Glupfch» y hoy los dos goblins se
llaman «Goblin». Y comparte `narrator/local.ts` con T42.
**Banda de modelo:** MEDIO — no hay reglas; hay que escribir muchas frases con gusto y
elegirlas de forma determinista sin romper el `switch` exhaustivo del narrador.
**Duración esperada:** 4 h · **Encadenable con:** —.
**Ficheros que toca:** `src/narrator/local.ts` (el informe), `src/narrator/relato.ts`
(nuevo), `src/narrator/frases.ts` (nuevo, el banco de frases), `src/ui/MasterLog.tsx` (el
selector), `tests/narrador.test.ts` (nuevo). **No toca el motor ni `TurnPanel.tsx`.**
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Lo que pidió Juan Luis

El 2026-09-06, dos modos de visualización del diario:

> **Informe:** Frases cortas y sencillas, informando del devenir de la partida. Ejemplo:
> El enano Háfir avanza 10 casillas. El enano Háfir ataca al orco Glupfch: 2 calaveras 1
> escudo negro. El orco Glupfch muere.
>
> **Relato:** Como si fuera un libro de aventuras tipo El Señor de los Anillos. Ejemplo:
> Como un alud de piedra y hierro desatado en las montañas, Háfir el Enano arremetió con
> la furia ancestral de su estirpe. Su hacha trazó un relámpago de acero en la penumbra
> antes de descargarse implacable sobre el orco Gluptch. La abominación intentó desviar el
> tajo interponiendo su cimitarra, pero la fuerza del golpe doblegó su defensa y el filo
> de acero le abrió el cráneo. El engendro de la sombra se desplomó inerte, sin lanzar
> siquiera un último alarido.

Y cómo se hace el relato, firmado en `autorizaciones.md` el mismo día: **por ensamblaje de
frases prefabricadas**, sin modelo de lenguaje. Su ejemplo: cuando un héroe saca muy poco
en el movimiento (un 1 y un 2), «resbala y apenas puede avanzar», «avanza con cautela»,
«sus piernas cansadas no pueden correr más rápido»… varias opciones para cada situación,
y «que se lo invente la sesión que coja la tarea».

## Lo que hay hoy, medido

- `narrar(e, ev, n)` en `local.ts` es un `switch` sobre los 30 tipos de `Evento` y devuelve
  una frase o `null`; `narrarTodos` recorre la lista. Es puro y determinista: la misma
  partida da el mismo diario en las dos casas y tras deshacer.
- `MasterLog.tsx` llama a `narrar` por evento y pinta la lista. No hay selector de nada.
- T20 y T21 dejaron los eventos con el dato dentro (`hechizoSinEfecto.motivo`,
  `efectoDeHechizo.alcanzados`): el relato tiene todo lo que necesita en el evento, no hay
  que tocar el motor.
- El informe de hoy es casi lo que pide el modo informe; le falta el nombre propio del
  monstruo (T42) y decir las caras de la tirada cuando el evento las trae.

## Antes de empezar: mira si ya está hecho

```sh
ls src/narrator/; grep -n 'modo\|relato' src/ui/MasterLog.tsx
```

## Qué hay que hacer

1. **Un banco de frases** (`frases.ts`): por situación, una lista de variantes con huecos
   (`{heroe}`, `{monstruo}`, `{arma}`, `{n}`). Las situaciones salen de los eventos y de
   sus datos: movimiento corto, normal o largo; ataque que mata, que hiere, que no pasa;
   defensa lograda; puerta que se abre; sala revelada; trampa; hechizo y sus cuatro motivos
   de fallo; monstruo que huye (T38) o que no hace nada; fin de partida. Al menos tres
   variantes por situación, o se nota la repetición a la tercera sala.
2. **`relato.ts` con la misma firma que `narrar`** y la variante elegida **de forma
   determinista**: por el índice del evento o por un hash de (índice, actor), nunca
   `Math.random()`. Dos pantallas de la misma partida tienen que contar el mismo cuento, y
   deshacer tiene que devolver el mismo párrafo.
3. **Los epítetos van con la clase y el género**: «Háfir el Enano», «Eloína la Elfa».
   `nombreDe` ya sabe el género (T de heroínas, `9202ec1`); el relato hereda eso y no lo
   reescribe. Los monstruos llevan su nombre propio de T42 y epítetos por especie
   («la abominación», «el engendro de la sombra» para el orco; otra cosa para la momia).
4. **El selector en `MasterLog.tsx`**, dos botones, informe por omisión, guardado en
   `localStorage` por navegador (es preferencia de pantalla, no estado de partida: cada
   casa elige el suyo).
5. El informe de hoy se ajusta al ejemplo: sujeto con clase y nombre, tirada con sus caras
   cuando el evento las trae, una línea por hecho.

## Trampas conocidas

- **El `switch` es exhaustivo a propósito** (T20): un evento nuevo que nazca sin frase salta
  en compilación. Mantén eso en el relato: que el tipo obligue a cubrir todos los eventos.
- **Seis monstruos por tres líneas es un diario que nadie lee** (T20). El relato es largo
  por naturaleza: que el turno de Zargon se agrupe (un párrafo por monstruo que haya hecho
  algo, nada por el que no se mueve).
- **La niebla no filtra el diario** (T32) y sigue sin hacer falta: un evento es algo que ya
  ocurrió.
- **Los componentes no se prueban**; el narrador sí, entero: es texto puro.

## Tests que hay que añadir

- Cada tipo de evento tiene relato no vacío (patrón del test de los doce hechizos de T21).
- Determinismo: el mismo evento con el mismo índice da el mismo párrafo; índices distintos
  recorren las variantes.
- Los huecos se rellenan todos: ningún párrafo sale con `{heroe}` dentro.

## Prohibido

- Un modelo de lenguaje, una llamada de red o `Math.random()` en el narrador.
- Tocar `src/engine/`: si al relato le falta un dato, se apunta en la terminada como tarea
  aparte; no se cambia un evento desde aquí.
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md`. Pega en la terminada el relato de un turno
entero de una partida real (`npm run sim` con una semilla y el narrador encima, o una
partida jugada): es lo que Juan Luis va a leer para decir si le gusta.
