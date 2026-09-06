# T47 · La tercera misión: el troll de las cavernas

**Precondición:** T46 LISTA (el patrón de diseño y la medida de la segunda, para que esta
quede por encima en el catálogo).
**Banda de modelo:** MEDIO — el patrón ya está fijado por T46 y las comprobaciones son de
T45; lo que pide criterio es dosificar un monstruo que aguanta diez heridas sin que la
partida se haga un asedio.
**Duración esperada:** 3 h · **Encadenable con:** —.
**Ficheros que toca:** `src/data/quests/<id>.ts` (nuevo), `src/data/quests/index.ts` (una
línea), y si hace falta `src/data/monsters.ts` **solo** para ajustar defensa y cuerpo del
troll, que la firma deja explícitamente ajustables «en una línea».
Lee `_COMUN.md` primero, `proyecto.md` para el protocolo, y la ficha y la terminada de T46.

## De dónde sale

De la firma del 2026-09-06 (`autorizaciones.md`): el troll de las cavernas entra en el
bestiario «para alguna de esas misiones difíciles», muy fuerte y resistente pero muy torpe:
un dado de ataque, dos casillas por turno, muchos dados de defensa y muchísimos puntos de
vida; la defensa 6 y el cuerpo 10 son concreción de la sesión `992c726d`, «escritos para
ajustarse en una línea de `monsters.ts` cuando se pruebe jugando». Y dos avisos de mesa:
**no hay figura de cartón de troll**, y `generar-cartas.ts` le imprime carta en la próxima
regeneración con sitio para diez heridas.

## Qué hay que hacer

1. Diseñar la misión como dice T46, con el troll como pieza central: un monstruo que se
   mueve dos casillas no persigue a nadie, así que hay que **obligar a los héroes a pasar
   por él** (guarda la única puerta hacia el objetivo, o el objeto que hay que recoger
   está en su sala) o no pinta nada.
2. Medir con `npm run sim` y ajustar **primero el diseño** (dónde está, quién lo
   acompaña) y solo después, si hace falta, la línea del troll en `monsters.ts`, diciendo
   en la terminada qué valor se probó y qué salió.
3. Comprobar que **el turno del troll se entiende en la mesa**: con movimiento 2 y un
   ataque, muchos turnos no hará nada; el diario (T20) ya dice «no se mueve ni ataca», y
   la personalidad «lerdo» lo manda al más cercano.
4. Avisar a Juan Luis en el cierre de que hace falta la figura de cartón y regenerar las
   cartas (`npm run cartas`).

## Trampas conocidas

Las de T46, y una propia: **defensa 6 contra héroes con dos o tres dados de ataque es casi
invulnerable**; lo que lo hace matable es que hay cuatro héroes y muchas rondas. Mide
cuántas rondas dura la partida además del porcentaje: una misión ganable que dura cuarenta
rondas no se juega con niños.

## Prohibido

- Tocar la IA o el motor: si el troll necesita una regla nueva, se apunta y se para.
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md`. En la terminada, la tabla del simulador con las
tres misiones y las rondas de media. Las misiones cuarta y siguientes se añaden como tareas
nuevas (T49 en adelante) copiando esta ficha o la de T46.
