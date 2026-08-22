# T4 · Los monstruos no disparan las trampas ocultas

**Precondición:** ninguna. **Fichero que bloquea:** `src/engine/reducer.ts` — mira en
`_ESTADO.md` si T5 o T6 están «en curso» antes de coger esta.
Lee `_COMUN.md` primero.

## Antes de empezar: mira si ya está hecho

En `mover()` dentro de `src/engine/reducer.ts`, busca la línea que decide si la trampa
afecta a quien pisa:

```ts
const laAfecta = trampa && !trampa.descubierta && !(trampa.tipo === "foso" && vuela(f));
```

Si ahí ya se comprueba que la figura sea un héroe, está hecha.

## Lo que dice el reglamento

Página 17, en un recuadro:

> Monsters do not spring hidden traps.

Y es literal: las trampas están puestas por Zargon, que sabe dónde están. Solo las pisan
los héroes.

## Qué hay que hacer

Que `dispararTrampa` no se ejecute cuando quien pisa la casilla es un monstruo. El sitio
es la condición de arriba, en `mover()`.

Fíjate en que ahí ya conviven dos excepciones —la trampa descubierta y el hada, que vuela
y no cae en los fosos— así que la tuya es una tercera del mismo tipo. Escríbela de forma
que las tres se lean juntas y se entienda cada una.

## Qué NO cambia

- Las trampas **descubiertas** siguen sin dispararse a nadie: ya se ven.
- El bloque desprendido sigue cegando la casilla para toda la misión, y eso afecta a
  monstruos y héroes por igual: la casilla queda sellada para todos.
- El hada sigue sin caer en los fosos.

## Tests que hay que añadir

- Un monstruo pisa un foso oculto y no le pasa nada, y el foso sigue **sin descubrir**
  para los héroes.
- Un héroe pisa el mismo foso y sí le pasa.
- El monstruo tampoco dispara la lanza ni el bloque.

Ese primer test tiene miga: comprueba que el monstruo no **gasta** la trampa, o Zargon
estaría limpiando el camino a los héroes sin querer.

## Prohibido

- Tocar la lógica del hada ni la del bloque.
- Cambiar `dispararTrampa` para que reciba un flag: la decisión de si dispara o no es de
  quien llama, y ahí está más claro.

## Al terminar

Commit en `main` y push. Línea en el registro de `_ESTADO.md`.
