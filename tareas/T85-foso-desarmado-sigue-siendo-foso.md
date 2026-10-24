# T85 · Un foso desarmado sigue siendo foso

**Precondición:** ninguna. **No a la vez que T50, T66, T71, T75, T76, T78, T79, T84**
si alguna volviera a estar viva (`reducer.ts`, `types.ts`).
**Banda de modelo:** MEDIO — corrección acotada con test; la regla está en el reglamento.
**Duración esperada:** 1 h · **Encadenable con:** T84.
**Ficheros que toca:** `src/engine/types.ts` (campo `desarmada`), `src/engine/combat.ts`
(`fosoAbierto`), `src/engine/reducer.ts`, `src/ui/BoardMirror.tsx`,
`tests/foso-desarmado.test.ts` (nuevo).
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## El fallo

Lo encontró otra sesión leyendo el código en `main` `07e6d4a`. Un enano desarma un foso sin
dispararlo; `desarmarTrampa` marcaba la trampa `gastada`, y para un foso `gastada` significa
«disparado, agujero abierto». Así `trampaEn`, `enUnFoso` (dado menos al combatir) y el
dibujo del tablero lo trataban como agujero: al cruzarlo había que tirar el dado de salto y
se podía caer.

## La regla en que se basa

Reglamento de 2021, p. 19, «Action 6: Disarm a Trap»: «If you roll either a black or white
shield, the trap is disarmed. **A disarmed trap is considered gone and is not put out on
the gameboard.**» (el enano desarma sin tirar, p. 19). La p. 17 solo prohíbe desarmar un
foso **ya disparado**: «Once a pit trap is sprung and a pit tile placed on the board, the
trap cannot be disarmed and removed». Léido en el PDF (páginas 9 y 10), no de memoria.

`autorizaciones.md` («Foso», segunda tanda del 2026-09-10) dice «no se puede desactivar»,
pero lo **ratifica** citando exactamente la p. 17 (foso ya disparado) y la primera tanda del
mismo día firma que el Enano y quien tenga herramientas desarman trampas. Se entiende como
«un foso abierto no se desarma», que es lo que el código y el test de T5 ya hacían. Si Juan
Luis quiso decir que un foso **sin disparar** tampoco se puede desarmar nunca, es otra
decisión y habría que firmarla; no se ha tocado esa línea.

## Qué se hizo

Campo opcional `desarmada` en `Trampa` (opcional: los guardados antiguos siguen valiendo).
`desarmarTrampa` lo pone junto a `gastada`. Ayudante `fosoAbierto(t)` = foso, gastado y no
desarmado, usado por `trampaEn`, `enUnFoso`, la guarda de `desarmarTrampa` y el pintado
del tablero. Un foso desarmado es suelo normal: se cruza sin dado y sin daño.

## Al terminar

El orden de cierre es el de `proyecto.md`.
