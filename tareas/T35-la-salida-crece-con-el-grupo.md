# T35 · La salida crece con el grupo

**Precondición:** T16 hecha (`d3d01e1`), que es de donde sale la función que esto reutiliza.
**Banda de modelo:** MEDIO — el cambio son tres líneas; lo que pide criterio es no romper
las misiones de cuatro héroes al arreglar las de ocho.
**Ficheros que bloquea:** `src/engine/partida.ts`, `tests/ocho-heroes.test.ts`.
**No toca `reducer.ts`**: esa es justo la gracia del arreglo.
Lee `_COMUN.md` primero.

## Lo que pidió Juan Luis

El 2026-09-06, contestando al aviso que T16 dejó escrito en el tablón:

> Respecto al objetivo «salir», la solución es marcar tantas casillas como casilla de
> `mision.entrada` como héroes haya en la partida. Si hay N héroes, habrá que marcar las N
> casillas más cercanas a la salida como casillas de `mision.entrada` (o de `mision.salida`).

## El fallo que arregla

T16 resolvió **dónde empieza** el grupo: los que no caben en la entrada declarada se estiran
por las casillas más cercanas. Pero dejó a medias la otra mitad, y quedó escrita en el
tablón como aviso:

```
reducer.ts, comprobarDesenlace, objetivo { clase: "salir" }:
  vivos(e.heroes).every((h) => e.mision.entrada.some((c) => mismaCelda(c, h.celda)))
```

Con ocho héroes y una entrada declarada de cuatro casillas, esa victoria **no es difícil:
es imposible**. Cuatro héroes se plantan en las cuatro casillas y los otros cuatro no tienen
dónde ponerse.

Hoy no lo nota nadie porque «El calabozo del guardián» se gana matando al guardián
(`objetivo: { clase: "matarA", figura: "guardian" }`) y es la única misión que hay. Lo notará
la primera misión de salir que se escriba, y para entonces la causa estará lejos.

## Antes de empezar: mira si ya está hecho

```sh
grep -n "mision:" src/engine/partida.ts
```

Si la misión se guarda en el estado con `entrada: salida` en vez de tal cual, está hecho.

## Cómo hacerlo

**Reutiliza `casillasDeSalida`, no escribas otro recorrido.** Esa función, de T16, ya
devuelve las N casillas más cercanas a la entrada por pasos de tablero, sin salir de su
región y saltando muebles, monstruos y trampas. Es literalmente lo que él pide.

El cambio es que la misión que se **guarda en el estado** lleve esa lista en `entrada`:

```ts
mision: { ...op.mision, entrada: salida },
```

Y con eso el objetivo «salir» de `reducer.ts` funciona sin tocarlo, porque ya pregunta por
`e.mision.entrada`. Es la razón de hacerlo aquí y no allí: `reducer.ts` es el cuello del
reparto y este arreglo no necesita entrar en él.

`op.mision` **no se muta**: se copia. Es un dato de módulo compartido entre partidas y
escribir dentro dejaría la entrada crecida para la siguiente.

## La decisión que hay que tomar, y por qué no es literal

Su frase dice «N casillas para N héroes». Tomada al pie de la letra, un grupo de **dos**
héroes en una misión con cuatro casillas de entrada declaradas dejaría la salida en **dos**
casillas, y salir sería más difícil que hoy. Eso no es lo que estaba arreglando —él hablaba
del caso de ocho— y sería una regresión silenciosa para los grupos pequeños, que son los
normales.

**Implementa el máximo: la salida nunca encoge por debajo de lo que declara la misión.**

- Con 8 héroes y 4 casillas declaradas → 8 casillas. Es lo que pidió.
- Con 2 héroes y 4 casillas declaradas → **las 4 declaradas**, no 2.

Ojo: `casillasDeSalida(op, n)` hace `entrada.slice(0, n)` cuando `n` es menor, así que
llamarla con el número de héroes **encoge**. Pásale el máximo entre el número de héroes y
`op.mision.entrada.length`, o el recorte se cuela sin que ningún test de hoy lo note.

Los héroes siguen empezando en las **primeras** casillas de esa lista, una cada uno: eso ya
lo hace T16 y no cambia.

## Trampas conocidas

- **`BoardMirror.tsx` pinta `estado.mision.entrada`.** Con ocho héroes pasará a pintar ocho
  casillas de entrada, y está bien: es donde está el grupo. Míralo en pantalla, pero no lo
  «arregles» recortándolo.
- **`tests/integracion.test.ts` afirma que la entrada tiene una sola fila y varias columnas.**
  Con el grupo por defecto de cuatro no cambia nada, pero si tocas ese test para que pase,
  párate: probablemente el roto sea tu cambio.
- **El estado tiene que seguir sobreviviendo a `JSON.parse(JSON.stringify(e))`.** La misión
  ya viajaba dentro del estado; copiarla no lo cambia, pero compruébalo.
- **El test de juego al azar de `tests/integracion.test.ts` es el que encuentra los fallos de
  verdad.** Si lo rompes, la sospecha por defecto es que has metido un bug.

## Tests que hay que añadir

En `tests/ocho-heroes.test.ts`, que ya tiene el andamiaje de grupos de ocho:

- Con ocho héroes, `estado.mision.entrada` tiene **ocho** casillas, todas distintas, y las
  cuatro declaradas por la misión están entre ellas y van primero.
- **Ocho héroes de pie en esas ocho casillas ganan una misión de objetivo `salir`.** Es el
  test que fija la regla; sin él esto no está probado, solo escrito.
- Con **dos** héroes y cuatro casillas declaradas, la entrada sigue teniendo **cuatro**. Es
  el que protege de la lectura literal.
- Con cuatro héroes, la entrada es exactamente la declarada: nada cambia para lo de hoy.
- La prueba de T1: revierte `partida.ts` y comprueba que el test de ganar con ocho falla.
  Uno que pasa igual con el código viejo no está probando nada.

## Prohibido

- **Tocar `reducer.ts`.** Si te parece que el arreglo va ahí, escríbelo en `_ESTADO.md` y
  para: es el fichero que más sesiones se disputan y este cambio no lo necesita.
- Mutar `op.mision`.
- Escribir un segundo recorrido de cercanía en vez de usar `casillasDeSalida`. Dos versiones
  de «más cercano» que se separan con el tiempo es un fallo que no da la cara.
- Añadir un campo `salida` nuevo al tipo `Mision`. Él lo ofrecía como alternativa —«o de
  `mision.salida`»— pero en HeroQuest se entra y se sale por la misma escalera, y dos campos
  que siempre valen lo mismo se desincronizan en cuanto alguien toque uno.

## Al terminar

Commit en `main` y push. Línea en el registro de `_ESTADO.md` diciendo que la entrada que
viaja en el estado **ya no es la que declara la misión** cuando el grupo es grande: es un
dato derivado, y quien escriba misiones nuevas necesita saberlo.
