# T3 · Buscar trampas exige no ver monstruos

**Precondición:** ninguna. **Fichero que bloquea:** `src/engine/selectors.ts`.
**Banda de modelo:** MEDIO · **Duración esperada:** 1 h · **Encadenable con:** — ·
**Ficheros que toca:** `src/engine/selectors.ts`, `src/engine/reducer.ts`, `tests/`.
(Cabecera añadida a posteriori en la migración del reparto del 2026-09-06; la tarea ya estaba
LISTA —`hechos/terminadas/03--*`— y la banda no sale de su texto original. El cierre de una
tarea es hoy el de `proyecto.md`, con terminada en `hechos/`.)
Lee `_COMUN.md` primero.

## Antes de empezar: mira si ya está hecho

```sh
grep -n -A4 "export function puedeBuscarTrampas" src/engine/selectors.ts
```

Si la función ya mira los monstruos a la vista, está hecha. Hoy dice solo esto:

```ts
export function puedeBuscarTrampas(e: EstadoPartida): boolean {
  const f = figuraActiva(e);
  return !!f && esHeroe(f) && !e.turno.haActuado;
}
```

## Lo que dice el reglamento

Página 16, «How a Hero Searches for Traps» y «How a Hero Searches for Secret Doors»,
las dos con la misma condición:

> As a hero, you can only search for traps if there are no monsters visible to you.
>
> As a hero, you can only search for secret doors if there are no monsters visible to you.

`puedeBuscarTesoro`, justo encima en el mismo fichero, **ya lo comprueba bien**. Copia el
criterio de ahí en vez de inventar otro: es literalmente la misma condición.

## Es una tarea pequeña, pero tiene dos lados

1. El **selector** (`puedeBuscarTrampas`), que es lo que decide si la interfaz pinta el
   botón.
2. El **reductor** (`buscarTrampas` en `src/engine/reducer.ts`), que es lo que decide si
   la acción se acepta.

Los dos tienen que decir lo mismo. Si el selector ofrece algo que el reductor rechaza, en
la mesa eso es un clic perdido y una discusión con un niño. Comprueba cuál de los dos
—o los dos— hay que tocar.

## Ojo con el orden

Esta condición depende de `puedeVer`, y **T1 cambia `puedeVer`**. Las dos tareas son
compatibles y se pueden hacer en cualquier orden, pero si T1 ya está hecha, tus tests
tienen que montar la escena con la regla nueva: una figura en medio tapa.

## Tests que hay que añadir

- Con un monstruo a la vista, no se puede buscar trampas ni pasadizos.
- Con el mismo monstruo detrás de una puerta cerrada, sí se puede.
- El selector y el reductor coinciden en los dos casos.

## Prohibido

- Tocar `puedeBuscarTesoro`, que ya está bien.

## Al terminar

Commit en `main` y push. Línea en el registro de `_ESTADO.md`.
