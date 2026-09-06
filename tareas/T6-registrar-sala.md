# T6 · Cada héroe registra una sala una vez

**Precondición:** ninguna. **Fichero que bloquea:** `src/engine/reducer.ts` — mira en
`_ESTADO.md` si T4 o T5 están «en curso».
**Banda de modelo:** ALTO (cambia la forma del estado) · **Duración esperada:** 2 h ·
**Encadenable con:** — · **Ficheros que toca:** `src/engine/types.ts`, `src/engine/partida.ts`,
`src/engine/selectors.ts`, `src/engine/reducer.ts`, `tests/`.
(Cabecera añadida a posteriori en la migración del reparto del 2026-09-06; la tarea ya estaba
LISTA —`hechos/terminadas/06--*`— y la banda no sale de su texto original. El cierre de una
tarea es hoy el de `proyecto.md`, con terminada en `hechos/`.)
Lee `_COMUN.md` primero.

## Antes de empezar: mira si ya está hecho

```sh
grep -n "buscadoTesoro" src/engine/types.ts
```

Si el campo sigue siendo `buscadoTesoro: string[]`, la tarea está pendiente. Cuando esté
hecha guardará pares de héroe y sala, no solo salas.

## Lo que dice el reglamento

Página 14, «Action 3: Search for Treasure»:

> A room may be searched by **all four heroes**, but each individual hero may only search
> the room once and may do so only on their own turn.

Y en la misma página, sobre el tesoro especial:

> The special treasure is discovered only once by the first hero who searches the room for
> treasure, even if other heroes later search that same room.

Las dos frases juntas dicen algo preciso: **cada héroe puede registrar cada sala una vez**,
pero **el tesoro especial de la misión lo encuentra solo el primero**. Los demás sacan
carta del mazo.

## Lo que tenemos

`estado.buscadoTesoro` es una lista de salas. En cuanto un héroe registra la sala `s`,
ningún otro puede. Eso es más restrictivo que la regla, y además le quita a los otros tres
héroes su tirada de carta de tesoro, que es media diversión.

## Qué hay que cambiar

- El **estado**: `buscadoTesoro` pasa de «salas registradas» a «quién ha registrado qué».
  Sigue teniendo que ser JSON puro y comparable: el estado se serializa para guardar la
  partida, y hay un test que lo comprueba (`JSON.parse(JSON.stringify(e))` igual a `e`).
- El **reductor**: `buscarTesoro` mira si **este héroe** ya registró **esta sala**.
- El **selector** `puedeBuscarTesoro`: lo mismo.
- El **tesoro especial de la misión** lo sigue encontrando solo el primero. Comprueba cómo
  está resuelto hoy antes de tocarlo.

## Cuidado con esto

Es la única de las siete tareas que **cambia la forma del estado**. Dos consecuencias:

- Una partida guardada con el formato viejo deja de cargar. Hoy no hay partidas guardadas
  —guardar y cargar es de la Fase 8— así que no hace falta migración, pero **dilo en el
  commit** para que quien escriba la Fase 8 lo sepa.
- El «deshacer» rehace la partida desde el principio repitiendo acciones. Si tu cambio es
  puro, sigue funcionando solo. Si guardas algo fuera del estado, lo rompes.

## Tests que hay que añadir

- Dos héroes registran la misma sala: los dos pueden.
- El mismo héroe no puede registrarla dos veces.
- El tesoro especial lo encuentra solo el primero; el segundo saca carta del mazo.
- El estado sigue sobreviviendo a `JSON.parse(JSON.stringify(e))`.

## Prohibido

- Guardar el registro fuera del estado (en un módulo, en un `Map` suelto): rompe deshacer,
  guardar y los tests, los tres a la vez.

## Al terminar

Commit en `main` y push. Línea en el registro de `_ESTADO.md`, diciendo explícitamente que
la forma del estado ha cambiado.
