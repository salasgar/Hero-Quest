# T5 · El foso: un dado menos dentro, y no se desarma una vez disparado

**Precondición:** ninguna. **Fichero que bloquea:** `src/engine/reducer.ts` y
`src/engine/combat.ts` — mira en `_ESTADO.md` si T4 o T6 están «en curso».
Lee `_COMUN.md` primero.

## Antes de empezar: mira si ya está hecho

```sh
grep -n "foso" src/engine/combat.ts
```

Si no hay nada, la parte de los dados está pendiente.

## Lo que dice el reglamento

Página 17, «What Happens to a Hero in a Pit?»:

> - As a hero, once in a pit, you may search the pit for treasure or secret doors as if it
>   were a separate room unto itself.
> - When in a pit, you may also attack and defend, but you must roll **one fewer combat
>   dice** when doing so. (This applies to monsters as well.)
>
> *Recuadro:* As a hero, your minimum attack or defend strength is always **1 combat die**,
> even if the pit penalty would reduce your dice to 0.
>
> *Recuadro:* Once a pit trap is sprung and a pit tile placed on the board, the trap
> **cannot be disarmed and removed**. As a hero, you may, however, attempt to jump over it.

## Lo que ya tenemos bien

El foso hace 1 punto de daño, corta el movimiento y **el héroe se queda dentro**. Eso está
implementado y coincide con el reglamento. No lo toques.

## Lo que falta

1. **Un dado menos, atacando y defendiendo, mínimo uno**, para quien esté dentro de un
   foso. Vale para héroes **y monstruos** («This applies to monsters as well»).
2. **Un foso ya disparado no se puede desarmar.**

## Cómo saber quién está «dentro de un foso»

No hace falta estado nuevo. Una figura está en un foso si está encima de una trampa de
tipo `foso` que ya está `gastada`. Los tres datos están en `estado.trampas` y en
`figura.celda`. Escribe un ayudante (`enUnFoso(estado, figura)`) y úsalo desde
`dadosDeAtaque` y `dadosDeDefensa`, en `src/engine/combat.ts`.

**Cuidado con el mínimo**: `dadosDeAtaque` ya hace `Math.max(0, ...)`. Con la penalización
del foso el mínimo pasa a ser 1, no 0, y solo por el foso. Piensa dónde va ese `max` para
que no se coma otras reducciones futuras.

## Lo de «buscar en el foso como si fuera una sala aparte»

Está en la cita, pero **no lo implementes**: cambia cómo se identifican las salas para
buscar tesoro y arrastra a T6. Déjalo escrito en `_ESTADO.md` como divergencia conocida y
sigue.

## Tests que hay que añadir

- Un héroe con espada ancha (3 dados) dentro de un foso ataca con 2.
- Un héroe con daga (1 dado) dentro de un foso sigue atacando con 1, no con 0.
- Un monstruo dentro de un foso también pierde un dado.
- Fuera del foso, nadie pierde nada.
- Desarmar un foso ya disparado se rechaza con un motivo legible.

## Prohibido

- Añadir un campo `enFoso` a la figura. La información ya está en el estado, y duplicarla
  es garantizar que un día las dos copias digan cosas distintas.
- Cambiar el daño del foso ni el corte de movimiento.

## Al terminar

Commit en `main` y push. Línea en el registro de `_ESTADO.md`.
