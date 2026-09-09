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

Lo que enseñó esta tarea, para T49 y las siguientes:

- **Una sala con una sola entrada puede engancharse si el grupo llega diezmado.** T46 ya
  documentó que la heurística del simulador, sin monstruos a la vista, va a la puerta
  cerrada más cercana **en línea recta** y que eso cuelga una partida de cien contra una
  sala con una sola puerta accesible en línea recta pero no por el camino real. Con esta
  misión salió mucho más a menudo (hasta 3 de 30) porque la guardia de camino era lo
  bastante dura para matar a dos de los cuatro héroes antes de llegar al final, y con solo
  dos supervivientes hay muchas menos formas de que alguno rompa el enganche por su cuenta.
  Si tu misión mete un monstruo duro al final de un pasillo largo, **dale a su sala una
  segunda puerta normal en otra pared**, como ya hacía el torreón con el salón del trono:
  no es solo redundancia narrativa, evita este enganche. Mídelo leyendo paso a paso
  (`crearPartida` + las mismas funciones de `simular.ts`, con `console.log` de posiciones)
  la semilla que salga «sin terminar», no lo des por el 1 % de fondo sin comprobarlo.
- **Subir la guardia de camino no es lo mismo que subir la dificultad del monstruo final.**
  Añadir dientes a las salas previas a un monstruo muy resistente puede matar héroes antes
  de que el monstruo final entre en juego, lo que baja el porcentaje de victorias sin que
  el monstruo final se vuelva más interesante de pelear. Mide por separado cuántas rondas
  dura la partida completa y en qué sala caen los héroes: si caen antes de llegar al
  monstruo central, el problema es el camino, no el monstruo.

## Prohibido

- Tocar la IA o el motor: si el troll necesita una regla nueva, se apunta y se para.
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md`. En la terminada, la tabla del simulador con las
tres misiones y las rondas de media. Las misiones cuarta y siguientes se añaden como tareas
nuevas (T49 en adelante) copiando esta ficha o la de T46.
