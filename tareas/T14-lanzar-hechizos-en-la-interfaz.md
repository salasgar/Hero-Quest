# T14 · El mago no puede lanzar sus hechizos: falta el botón

**Precondición:** ninguna. **Banda de modelo:** MEDIO — el motor ya está escrito y probado;
esto es conectar la interfaz, con criterio pero sin decidir reglas.
**Ficheros que bloquea:** `src/ui/TurnPanel.tsx`, `src/ui/Juego.tsx`, `src/ui/HeroSheet.tsx`
— ninguna otra tarea los toca hoy. **No toca `reducer.ts`**, así que puede ir en paralelo
con cualquiera.
Lee `_COMUN.md` primero.

## Qué vio Juan Luis y qué pasa de verdad

Dijo: «al empezar la partida el mago no dispone de ningún hechizo». Lo que ocurre no es que
no los tenga: **es que no hay forma de lanzarlos**.

Comprobado ejecutando `crearPartida` con el grupo por defecto:

```
barbaro@12,17 hechizos=0 | enano@13,17 hechizos=0 | elfo@12,18 hechizos=3 | mago@13,18 hechizos=9
```

El mago empieza con sus nueve, como manda el reglamento. Pero:

- `TurnPanel.tsx` pinta botones para atacar, abrir puerta, buscar tesoro y buscar trampas.
  **No pinta ninguno para lanzar un hechizo.**
- `Juego.tsx` no despacha nunca la acción `lanzarHechizo`, ni por ratón ni por teclado.
- `HeroSheet.tsx` enseña solo un contador —`✨ 9`— sin decir **cuáles** son. En la mesa, un
  número sin nombres no es información: es un enigma.
- `selectors.ts` ya exporta `hechizosLanzables(e)`, que devuelve cada hechizo con sus
  objetivos posibles, y `accionesDisponibles(e)` ya devuelve `puedeLanzarHechizo`. **Nadie
  llama a ninguna de las dos.** Están escritas y sin conectar.

O sea: el motor sabe lanzar hechizos (`reducer.ts:658`, con sus tests en
`tests/hechizos.test.ts`) y la pantalla no ofrece la puerta de entrada. Esta tarea es esa
puerta y nada más.

## Antes de empezar: mira si ya está hecho

```sh
grep -n "lanzarHechizo\|hechizosLanzables" src/ui/*.tsx
```

Si no sale nada, está pendiente.

## Lo que hay que construir

Tres piezas, y conviene hacerlas en este orden porque cada una se prueba con la anterior:

1. **La hoja de personaje dice qué hechizos quedan.** `HeroSheet.tsx` lista los nombres de
   `heroe.hechizos`, y los de `heroe.hechizosGastados` tachados o apagados. Un hechizo se
   gasta para siempre en la misión, así que ver los gastados no es adorno: es lo que evita
   que alguien cuente con la Curación que ya usó hace dos salas.
2. **El panel de turno ofrece los lanzables.** `TurnPanel.tsx` recibe lo que devuelve
   `hechizosLanzables(estado)` y pinta un botón por hechizo **que tenga al menos un
   objetivo**. Los que no tienen objetivo a la vista no se pintan, o se pintan
   deshabilitados con el motivo; decídelo tú, pero que no haya un botón que el motor vaya a
   rechazar —eso, en la mesa, es un clic perdido, que es justo lo que dice el comentario de
   `puedeBuscarTesoro` en `selectors.ts`—.
3. **Elegir objetivo y despachar.** `Juego.tsx` gana un `pedirHechizo(id)` al estilo de
   `pedirAtaque`: si el hechizo tiene un solo objetivo posible, va directo; si tiene varios,
   hay que elegir. Y despacha `{ tipo: "lanzarHechizo", hechizo, objetivo }`.

Una tecla, para seguir la costumbre de las otras acciones —`T`, `A`, `P`, `B`, `R`—: `H`
está libre. Mira la lista del `useEffect` de teclado en `Juego.tsx` antes de elegir, no de
memoria.

## Los dados: mira quién los tira antes de escribir un diálogo

Aquí es fácil hacer trabajo de más. El reparto de esta aplicación es: **los héroes tiran
sus dados de verdad en la mesa y se teclea el resultado; los del máster los tira la
aplicación.** Con los hechizos no es tan sencillo, así que léelo en `reducer.ts` antes de
montar ningún `DiceInput`:

- `danoConSalvacion` (bola de fuego, fuego de la ira): **los tira quien lo recibe**. Si el
  objetivo es un monstruo, los tira la aplicación —ya lo hace, con `tirarD6` sobre el `rng`
  del estado— y no hay nada que pedir.
- `invocar` (el genio): `resolverDanoDirecto` acepta unos `dados` opcionales. Comprueba si
  en la mesa los tira alguien; si es la aplicación, tampoco hay diálogo.
- `movimientoExtra` (viento veloz): mira dónde se tiran esos dos dados y si el héroe
  beneficiado los tira él.

**No inventes un diálogo para un hechizo que la aplicación ya resuelve sola.** Si al leerlo
resulta que hace falta pedir dados para alguno, móntalo con `DiceInput` igual que
`pedirAtaque`, y no para los demás.

## Trampas conocidas

- **En los tests, una sala sin revelar no deja ver nada.** `hechizosLanzables` filtra por
  `puedeVer`, así que si montas un estado de prueba sin `salasReveladas: ["a"]`, todos los
  hechizos saldrán sin objetivos y parecerá que tu código está mal cuando lo que falta es
  el escenario.
- **Lanzar un hechizo consume la acción del turno** (`e.turno.haActuado`). `hechizosLanzables`
  ya devuelve la lista vacía si el héroe ya actuó, pero compruébalo en pantalla: el botón
  tiene que desaparecer después de atacar.
- **`estilos.css` lo tiene reclamado otra sesión** (`6f2f1053`, según el tablón). Reutiliza
  las clases que ya hay —`botonera`, `grupo`, `etiqueta`, `apagado`, `pista`— en vez de
  añadir CSS. Si de verdad hace falta una clase nueva, espera a que suelte el fichero o
  déjalo escrito en `_ESTADO.md`; no lo edites por debajo.
- El bárbaro y el enano tienen cero hechizos. Su hoja y su panel no deben ganar ni un hueco
  vacío ni un botón deshabilitado por ello.

## Tests que hay que añadir

Los componentes de React aquí no se prueban —no hay entorno de DOM montado: `vite.config.ts`
dice `environment: "node"`—. Así que **no montes uno solo para esto**. Prueba lo que sí es
puro y es donde estaría el fallo:

- `hechizosLanzables` con el grupo por defecto y la sala revelada: el mago tiene nueve
  entradas, el elfo tres, el bárbaro y el enano ninguna.
- Un hechizo cuyo único objetivo está tapado por una figura sale con `objetivos: []`.
- Después de `haActuado`, la lista es vacía.
- Recorrer la partida por acciones —lanzar un hechizo y deshacer— deja al héroe con el
  hechizo otra vez en la mano. Es lo que garantiza que la interfaz no guarda nada por su
  cuenta.

Si alguno de estos ya existe en `tests/hechizos.test.ts`, no lo dupliques: dilo en el
commit y añade los que falten.

## Prohibido

- **Cambiar `reducer.ts`.** Si al conectar la interfaz te parece que el motor está mal,
  escríbelo en `_ESTADO.md` y para: ese fichero lo tienen cinco tareas y una de ellas puede
  estar en curso ahora mismo.
- Quitarle hechizos al mago, o cambiar cuántos elementos elige cada clase, para que la
  pantalla quede más corta.
- Inventar un hechizo o cambiar un valor de `spells.ts`. Ya se implementaron cuatro «de
  memoria» y once de doce valores estaban mal.

## Al terminar

Commit en `main` y push. Línea en el registro de `_ESTADO.md` diciendo qué hechizos siguen
sin poderse lanzar desde la pantalla, si queda alguno, y por qué.
