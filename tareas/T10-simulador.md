# T10 · El simulador que mide si la IA está bien

**Precondición:** T8 terminada. **Fichero que bloquea:** `scripts/`.
Lee `_COMUN.md` primero.

## Para qué

Para contestar la única pregunta que importa de la IA: **¿ganan los héroes lo bastante a
menudo?** Eso no se sabe leyendo el código. Se sabe jugando cien partidas.

`npm run sim` juega 100 partidas automáticas por nivel de dificultad y saca el porcentaje
de victorias de los héroes. El objetivo del plan: `torpe` ~80 %, `astuto` ~40 %.

## Cómo montarlo

- Un script en `scripts/`, al estilo de los que ya hay (`generar-cartas.ts`,
  `generar-tablero.ts`), y su entrada en `package.json`.
- **Semilla fija por partida**, tomada del índice. El generador aleatorio vive dentro del
  estado, así que una partida es reproducible entera a partir de su semilla: cuando salga
  algo raro, tienes que poder repetirlo exactamente.
- Los héroes también los juega alguien. Con una heurística sencilla basta —atacar si se
  puede, si no acercarse— pero **dilo en la salida**: los porcentajes solo significan algo
  si se sabe contra qué héroes se han medido.

## Qué tiene que sacar por pantalla

- Porcentaje de victorias por nivel.
- Duración media en turnos.
- **Partidas que no terminaron** dentro del límite de turnos. Este número es el que
  delata a los monstruos que se quedan bloqueados dando vueltas, y es más útil que el
  porcentaje de victorias para encontrar fallos.
- La semilla de la partida más rara, para poder repetirla.

## Prohibido

- Poner los porcentajes objetivo como un test que falle en el CI. Son una **guía de
  diseño**, no un contrato: un test que exija «entre 78 % y 82 %» fallará por azar y
  acabará desactivado, que es peor que no tenerlo.
- Que el simulador use rutas o atajos que el juego real no use. Si simula otra cosa que la
  que se juega en la mesa, miente.

## Al terminar

Commit en `main` y push. Línea en el registro de `_ESTADO.md` **con los porcentajes
medidos**: es el dato que decide si T9 está terminada o hay que seguir ajustando.
