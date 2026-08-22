# T2 · Los héroes pasan por encima de otros héroes

**Precondición:** ninguna. **Fichero que bloquea:** `src/engine/board.ts`.
Lee `_COMUN.md` primero.

## Antes de empezar: mira si ya está hecho

Pon dos héroes en fila en un test y comprueba si el de detrás puede cruzar al de delante.
O más rápido: si `celdaAtravesable` en `src/engine/board.ts` ya distingue héroe de
monstruo, está hecha.

## Lo que dice el reglamento

Página 12:

> - You cannot pass over monsters, move through walls, or move diagonally.
> - You *may* pass over other heroes.
> - You may only enter rooms through doors.
> - You may not share a square with another hero or with a monster except when you are on
>   the stairs or in a pit trap.

Tres cosas exactas:

1. Un héroe **atraviesa** la casilla de otro héroe mientras se mueve.
2. **No** atraviesa la de un monstruo. Los monstruos siguen taponando.
3. **No puede terminar** encima de nadie. Pasar sí, aterrizar no.

## Dónde encaja

En `src/engine/board.ts` ya existe la maquinaria, porque el hada vuela y el velo de niebla
deja atravesar monstruos:

- `celdaAtravesable(estado, celda, figura)` — si se puede cruzar sin pararse.
- `celdaLibre(estado, celda, salvo?)` — si se puede terminar ahí.
- `vuela(figura)`, `atraviesaFiguras(figura)`.
- `alcanzables()` ya distingue cruzar de aterrizar. **Mira cómo lo hace antes de escribir
  nada**: la pieza que necesitas seguramente ya está.

Deja el comportamiento de los monstruos como está: la regla citada está escrita para los
héroes.

## Trampa conocida, encontrada y no resuelta

Un subagente que empezó esta tarea dejó apuntado esto antes de detenerse, y merece la pena:

> La trampa de bloque hace **retroceder** a la figura a la casilla anterior de su
> recorrido. Con la regla nueva, esa casilla anterior puede estar ocupada por un
> compañero, porque acaba de pasar por encima de él.

Búscalo en `mover()` dentro de `src/engine/reducer.ts`, en la rama `efecto.retrocede`.
Hoy retrocede sin comprobar nada. **Compruébalo y decide qué pasa**, porque dos figuras en
la misma casilla rompen una invariante del test de juego al azar. Escribe en el commit qué
decidiste y por qué.

## El efecto secundario que hay que MIRAR pero NO arreglar

La misión «El calabozo del guardián» (`src/data/quests/calabozo.ts`) entra por un pasillo
de **dos** casillas de ancho (columnas 12-13) precisamente porque los cuatro héroes se
taponaban unos a otros. Con esta regla, ese problema desaparece.

**No cambies la misión.** Mira si los tests que justifican esa entrada siguen teniendo
sentido y dilo en el registro de `_ESTADO.md`. La decisión es de Juan Luis, y está
apuntada como pendiente de su palabra.

## Tests que hay que añadir

- Un héroe cruza a otro héroe y llega más allá.
- No puede pararse encima de él.
- Un monstruo en medio sigue taponando a un héroe.
- Un monstruo no cruza a un héroe.

## Prohibido

- Cambiar la entrada de la misión.
- Dejar que alguien termine el movimiento encima de otra figura, ni siquiera «por un
  momento».

## Al terminar

Commit en `main` y push. Línea en el registro de `_ESTADO.md`.
