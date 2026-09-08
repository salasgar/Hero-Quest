# T68 · Desarmar trampas no existe en la pantalla

**Precondición:** ninguna. **No a la vez que 52, 36, 22** (`TurnPanel.tsx`, `useAccionesDeTurno.ts`).
**Banda de modelo:** MEDIO — selector nuevo, botón, validación de alcance.
**Duración esperada:** 1,5 h · **Encadenable con:** —.
**Ficheros que toca:** `src/engine/selectors.ts`, `src/engine/reducer.ts`, `src/ui/TurnPanel.tsx`,
`src/ui/useAccionesDeTurno.ts`, `tests/reducer.test.ts`.
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Lo que se nota jugando hoy

El enano «desarma trampas sin riesgo gracias a sus herramientas», lo dice su carta y lo dice
la pantalla de elección. En la partida no hay ningún botón para hacerlo: el motor tiene la
acción `desarmarTrampa` desde la Fase 2, con tirada para quien no es enano, evento y frase
en el diario («La trampa queda inutilizada»), y **ninguna pantalla la despacha**. Quien busca
trampas ve el ⚠ y no puede hacer nada con él salvo rodearlo. Es la única acción del motor sin
botón.

## Qué cambiaría

1. **Selector `trampasDesarmables(e)` en `selectors.ts`.** Devuelve las trampas que el héroe
   `e` puede desarmar en su turno:
   - Descubiertas (en `descubiertas` del héroe).
   - No gastadas (`trampa.usada !== true`).
   - Al alcance según el reglamento (páginas 16-17 del PDF, pág. 9 de `_COMUN.md`).

2. **Un botón «Desarmar trampa» en el panel**, con su tecla (elegida junto a T22, T36, T52:
   es la cadena de teclas). Por el mismo camino que «Abrir puerta»: `useAccionesDeTurno` lo
   despacha, llama a `desarmarTrampa`, sigue el flujo de la acción.

3. **Guarda de alcance en el motor.** `desarmarTrampa` en `reducer.ts` (cola del reductor,
   donde también está `abrirPuerta`) hoy **no comprueba dónde está el héroe**, acepta
   cualquier trampa del tablero desde cualquier casilla. Añadir la condición de alcance
   citando el reglamento: si el héroe no puede alcanzar la trampa, rechazar la acción
   (devolver el estado sin cambios, como hace con la puerta cerrada).

## Qué decide Juan Luis

Nada, salvo que el reglamento no fije el alcance: entonces «adyacente» como regla de la
casa, firmada.

## Antes de empezar: mira si ya está hecho

```sh
grep -n 'trampasDesarmables' src/engine/selectors.ts && \
grep -n 'Desarmar trampa' src/ui/TurnPanel.tsx
```

Si ambas cosas aparecen, está hecha.

## Cómo leer el reglamento

Abre el PDF del reglamento (en `_COMUN.md`, apartado «Documentos»: dónde están y cómo
extraerlos). Las páginas 16-17 (PDF pág. 9) explican cuándo un héroe puede actuar sobre una
trampa. Cítalo exactamente en un comentario si la condición no es obvia en el código.

## Trampas conocidas

- **La cadena T22 → T36 → T52 toca `TurnPanel.tsx` y `useAccionesDeTurno.ts`.** Coordinad
  si estáis en paralelo: esta tarea no puede ir a la vez que esas. La tecla «Desarmar
  trampa» se añade con las otras en una tirada. Hecho: es `D`.

- **El alcance no puede ser «encima de la trampa», aunque eso diga literalmente el
  reglamento (p. 19).** `desarmarTrampa` no mueve a la figura (como `abrirPuerta`), y
  `mover()` hace saltar siempre una trampa descubierta que sea el destino elegido
  (`esElDestino`, `reducer.ts`), así que un héroe nunca llega a estar de pie sobre una
  trampa conocida sin haberla disparado ya. Se implementó con la adyacente ortogonal en su
  lugar —regla de la casa, pendiente de firma, razonada en
  `hechos/terminadas/68--s-20260908T222927-9a0511bf.md`—. Si Juan Luis prefiere la lectura
  literal, hay que hacer que `desarmarTrampa` mueva también a la figura hasta la trampa
  (tocando `mover()` y el consumo de movimiento), que es una tarea más grande que esta.

- **La ficha no declaraba `src/ui/Juego.tsx`, pero hace falta tocarlo** para que
  `acciones.desarmarTrampa` y `trampas` lleguen a `TurnPanel` desde la pantalla de la mesa;
  sin eso el botón no aparece nunca. Razonado en `hechos/incidencias/s-20260908T222927-9a0511bf.md`.
  `VistaDeHeroe.tsx` se dejó sin tocar (igual que T70 con `BoardMirror.tsx`).

- **El selector debe filtrar por alcance.** Igual que `objetivosDeHechizo` o similares:
  no devuelvas todas las trampas descubiertas, solo las alcanzables. De lo contrario el
  botón será clickable aunque el motor rechace la acción.

- **Los tests.** `tests/reducer.test.ts` ya tiene casos de `desarmarTrampa` despachados
  desde cualquier casilla (un fallo del motor). La guarda de alcance debe rechazarlos
  correctamente: tests del motor van ahí, tests de la pantalla (si acaso) en otro fichero.

## Prohibido

- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).
- Permitir un `desarmarTrampa` desde fuera de alcance.

## Al terminar

El orden de cierre es el de `proyecto.md` (pruebas en verde → commit de código →
`hechos/terminadas/68--<sid>.md` con el hash → `CERRADA` → regenerar `_ESTADO.md` → commit
con rutas explícitas → `push`).
