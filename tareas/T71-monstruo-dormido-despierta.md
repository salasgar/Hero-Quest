# T71 · Un monstruo dormido no se despierta nunca

**Precondición:** ninguna. **No a la vez que T50, T66** (`reducer.ts`, `types.ts`).
**Banda de modelo:** MEDIO — evento, tirada, lógica de despertar.
**Duración esperada:** 2 h · **Encadenable con:** —.
**Ficheros que toca:** `src/engine/reducer.ts`, `src/engine/types.ts`, `src/narrator/local.ts`,
`tests/hechizos.test.ts`.
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Lo que se nota jugando hoy

El Sueño duerme al monstruo (`dormido: true`) y **nada lo despierta**: ni el paso de las
rondas, ni recibir un golpe, ni nada. `avanzarActor` limpia `pierdeTurno` al entrar Zargon,
pero `dormido` no se toca en ningún sitio del reductor. En la práctica el Sueño es un
«muerto en vida» que además cuenta como vivo para `matarATodos` y para «monstruos a la
vista» al buscar tesoro: un goblin dormido en la sala impide registrarla para siempre. En la
partida jugada lo mataron dormido y no se notó; en una misión de `matarATodos` se notaría.

## Qué cambiaría

Implementar una regla de despertar: cada vez que le toque el turno al monstruo dormido, tira
un dado. Si sale un 6, el monstruo despierta (`dormido: false`). Si no, sigue durmiendo.

Si la carta de Sueño dice otra cosa, esa es la fuente. Si no la tenemos, esta es la regla de
la casa que Juan Luis firme.

## Antes de empezar: mira si ya está hecho

```sh
grep -n 'se despierta' src/engine/reducer.ts && grep -n 'dormidoDespierta' src/engine/types.ts
```

Si ambas cosas aparecen, está hecha.

## Cómo funciona hoy

1. `aplicarDano` aplica daño y genera evento.
2. `avanzarActor` entra en turno de Zargon, limpia `pierdeTurno` en los monstruos de
   `turno.orden`.
3. El evento `dormido` está en `types.ts` pero nada lo genera.

## Qué hay que hacer

1. **En `src/engine/types.ts`**: si no existe, añadir un evento `dormidoDespierta` (o
   parecido) con campo `actor` (el monstruo que se despierta). Si existe, verificar que
   tiene lo que necesita.

2. **En `src/engine/reducer.ts`** (cola del reductor, donde está el resto de lógica de
   turno):
   - En `avanzarActor`, cuando entra el turno de Zargon, recorrer `turno.orden`. Por cada
     actor que sea un monstruo y tenga `dormido: true`:
     - Tirar un dado (usar `this.rng`).
     - Si sale 6: generar evento `dormidoDespierta`, cambiar `dormido: false`.
     - Si no: nada, sigue durmiendo y su turno transcurre sin actuar (como ocurre hoy).

3. **En `src/narrator/local.ts`**: añadir una frase para el evento `dormidoDespierta`:
   algo como «[El actor] se despierta.» o «[El actor] abre los ojos.»

4. **En `tests/hechizos.test.ts`**: dos tests:
   - Monstruo dormido, turno de Zargon, tira 5: sigue durmiendo.
   - Monstruo dormido, turno de Zargon, tira 6: se despierta y genera evento.

## Trampas conocidas

- **T50, T66 tocan `reducer.ts` y `types.ts`.** Coordinad si estáis en paralelo: esta tarea
  no puede ir a la vez que esas.

- **La tirada es única por monstruo por turno.** No se tira cada vez que recibe daño, solo
  cuando entra su turno en `avanzarActor`. Eso es lo que diferencia «dormido» de
  «pierdeTurno»: un monstruo con `pierdeTurno` actúa cuando no lo tiene; uno dormido nunca
  actúa hasta despertarse.

- **Recibir daño no lo despierta.** Solo la tirada de 6 en su turno. Así el Sueño no es
  trivial de romper y el hechizo tiene algún valor.

## Prohibido

- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).
- Despertar al monstruo por cualquier otra razón que no sea la tirada de 6.

## Al terminar

El orden de cierre es el de `proyecto.md` (pruebas en verde → commit de código →
`hechos/terminadas/71--<sid>.md` con el hash → `CERRADA` → regenerar `_ESTADO.md` → commit
con rutas explícitas → `push`).
