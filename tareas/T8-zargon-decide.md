# T8 · Zargon decide: a quién ataca y por dónde va

**Precondición:** T1 a T7 terminadas. **Fichero que bloquea:** `src/ai/` (nuevo).
Lee `_COMUN.md` primero.

Esta es la tarea que convierte el proyecto en lo que prometía: **que la aplicación sea el
máster de verdad**. Hoy, en el turno de Zargon, un humano activa cada monstruo y lo mueve
a mano. Eso es lo único que queda por quitar.

## Antes de empezar

```sh
ls src/ai 2>/dev/null || echo "no existe todavía"
```

Y comprueba en `_ESTADO.md` que T1 a T7 están en «hecha». **Si T1, T4 o T5 no lo están,
para**: esas tres cambian qué es legal para un monstruo, y escribir la IA antes significa
escribirla contra unas reglas que van a cambiar. Las otras cuatro solo tocan el turno de
los héroes y no te afectan.

## Lo que hay que escribir

`src/ai/targeting.ts` y `src/ai/zargon.ts`:

- **Puntuación de objetivos.** A quién ataca un monstruo cuando puede elegir. El plan
  original propone priorizar al herido, al mago y al que defiende poco. Eso es una
  hipótesis, no una verdad: escríbela como una función con pesos con nombre, para que T9
  pueda torcerla y T10 medir si acierta.
- **Caminos.** Ya existe `alcanzables()` en `src/engine/board.ts` y devuelve la ruta hasta
  cada casilla. **Úsala.** No escribas un pathfinding nuevo: el que hay ya sabe de muros,
  puertas, muebles, bloques caídos, el hada que vuela y lo que T2 haya cambiado.
- **El turno completo de un monstruo**: moverse y actuar, o solo una de las dos cosas.

## La regla que no se puede romper

**La IA elige entre acciones legales; no inventa acciones.** El motor sigue siendo el
árbitro. En la práctica: genera candidatas, pásalas por el motor, quédate con las que
devuelven `ok: true`. Nunca construyas un estado a mano.

Si la IA propone algo ilegal, el fallo se ve en la mesa como un monstruo que no se mueve o
un error en pantalla, con cuatro niños mirando. `tests/integracion.test.ts` tiene un
enumerador de acciones legales que te sirve de modelo.

## Lo que NO es esta tarea

- Las personalidades por especie y los tres niveles de dificultad: eso es **T9**.
- El simulador que mide si la IA está bien: eso es **T10**.
- Conectarlo a la pantalla: eso es **T11**.

Esta tarea deja una función que, dado un estado, devuelve la mejor jugada legal para un
monstruo. Nada más. Se puede probar entera sin levantar un solo píxel.

## Cómo verificar que está bien

Tests unitarios de la puntuación con escenas montadas a mano: con un héroe herido y otro
sano al lado, ¿a cuál va? Con el mago a tres casillas y el bárbaro pegado, ¿qué hace?

La medida de verdad —¿gana Zargon demasiado?— es **T10**, y no se puede contestar aquí.

## Prohibido

- Meter una llamada a la API de Claude. **Claude no mueve monstruos**: es la decisión de
  arquitectura más importante del proyecto y está explicada en `TRASPASO.md`. La táctica es
  determinista, instantánea y siempre legal.
- Escribir un pathfinding nuevo.
- Modificar el motor para que le sea más cómodo a la IA. Si el motor te falta algo,
  escríbelo en `_ESTADO.md` y decídelo aparte.

## Al terminar

Commit en `main` y push. Línea en el registro de `_ESTADO.md` explicando qué pesos elegiste
y por qué, que es justo lo que T9 y T10 van a tocar.
