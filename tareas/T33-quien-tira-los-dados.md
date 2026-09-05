# T33 · Quién tira los dados de quien juega desde su casa

**Precondición:** **T31 hecha.** Sin partida en red, esta elección no tiene a quién
ofrecérsela.
**Banda de modelo:** MEDIO — el motor ya lo soporta entero; esto es pantalla y ajuste.
**Ficheros que bloquea:** `src/ui/TurnPanel.tsx`, `src/ui/DiceInput.tsx`. Comparte
`TurnPanel.tsx` con T14, T17 y T32: **no la cojas a la vez que ninguna de ellas.**
Lee `_COMUN.md` primero.

## Lo que pidió Juan Luis

Preguntado si los dados de quien juega desde su casa los tira él con sus dados de verdad y
teclea el resultado, o se los tira la aplicación, contestó: **«Quiero que la app ofrezca
las dos opciones.»** Las dos, a elegir por quien juega.

Tiene sentido de mesa: quien tenga los dados en casa querrá tirarlos —es medio juego—, y
quien no los tenga no puede jugar si la aplicación no se los tira.

## Antes de empezar: mira si ya está hecho

```sh
grep -n "misDados\|tiroYo\|quienTira" src/ui/TurnPanel.tsx src/ui/DiceInput.tsx
```

## Por qué esto es corto

Porque el motor ya lo previó. Los campos de dados de `Accion` son **opcionales**:

```ts
| { tipo: "tirarMovimiento"; dados?: [number, number] }
| { tipo: "atacar"; objetivo; dadosAtaque?: CaraCombate[]; dadosDefensa?: CaraCombate[] }
| { tipo: "lanzarHechizo"; hechizo; objetivo?; dados?: CaraCombate[] }
```

Con `dados`, manda la tirada física de la mesa. Sin `dados`, tira el generador con semilla
que vive dentro del estado. **Las dos opciones son la misma acción con el campo o sin él**,
y las dos son igual de reproducibles: en el segundo caso la tirada sale del `rng`, que va
en el estado y por tanto es idéntica en las dos casas.

Así que esto es un interruptor por jugador y una bifurcación en el diálogo de dados.

## Cómo hacerlo

- **El ajuste es local de cada jugador y no viaja en el registro.** Es una preferencia de
  quién tiene dados en la mano, no una regla de la partida. Guárdalo en el navegador de
  cada uno. Si viajara, cambiarlo sería una acción y ensuciaría el deshacer.
- **Se puede cambiar en mitad de la partida**, sin reiniciar nada: se le acaban de caer los
  dados debajo del sofá.
- **Cuando lo tira la aplicación, se enseña qué ha salido**, cara a cara y no solo el
  total. Un niño que no ve los dados tiene que ver al menos los dibujos, o la aplicación le
  está pidiendo que se fíe.
- **En la mesa no cambia nada**: los héroes que están en el salón siguen tirando de verdad,
  que es la decisión de siempre del proyecto. El ajuste sale solo donde hace falta.
- **El texto tiene que decir cuál es cuál sin ambigüedad.** «Los tiro yo» y «Que los tire
  la aplicación», y no un icono a secas.

## Trampas conocidas

- **`dadosDeAtaque` y `dadosDeDefensa` llevan un `estado` opcional al final** que ya causó
  una divergencia: la pantalla enseñaba un dado que el motor no iba a tirar a quien estaba
  en un foso. Está cerrada en `aa403fd`. Si vuelves a ver una firma del motor con un
  parámetro opcional, es una divergencia esperando; no la aproveches.
- **El número de dados que se piden depende del estado** —el foso resta uno—, así que
  pregunta por los que toquen, no por los del arma.
- **No dupliques la lógica de cuántos dados**: sale de `combat.ts`, y ese fichero es del
  motor.

## Tests que hay que añadir

Los componentes no se prueban aquí (`environment: "node"`), así que prueba lo que sí es
puro:

- La misma acción con `dados` y sin `dados` produce estados **distintos pero los dos
  legales**, y la de sin `dados` es reproducible: repetirla desde el mismo estado da lo
  mismo.
- Con el héroe en un foso, el número de dados que se piden baja en uno en las dos
  modalidades.

## Prohibido

- Meter la preferencia en el registro de acciones o en el estado de la partida.
- Cambiar cómo tiran los héroes que están en la mesa.
- Duplicar el cálculo de dados que ya hace `combat.ts`.

## Al terminar

Commit y push, y una línea en el registro de finalizaciones diciendo dónde se guarda la
preferencia y por qué ahí.
