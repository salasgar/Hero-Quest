# T55 · Las diecisiete salas nuevas del calabozo, con algo dentro

**Precondición:** T53 y T54 LISTA (comparten `calabozo.ts` con la 53, y sin la 54 no hay
pociones que guardar ni equipo que encontrar). **No a la vez que 46** (misma clase de
trabajo, y la 46 copia lo que aquí se decida).
**Banda de modelo:** ALTO — es diseño de misión con niños delante, medido con el simulador.
**Duración esperada:** 3 h · **Encadenable con:** —.
**Ficheros que toca:** `src/data/quests/calabozo.ts` (`MONSTRUOS_CALABOZO`,
`MUEBLES_CALABOZO`, `TRAMPAS_CALABOZO`, `textosDeSala`), `tests/quest.test.ts`. **No toca
el motor, la IA, la pantalla ni `treasure.ts`.**
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre. Lee
`calabozo.ts` entero: el comentario de `PUERTAS_CALABOZO` dice por qué las salas se abrieron
vacías (T40 no quiso inventar diseño).

## Lo que pidió Juan Luis

El 2026-09-06: «En la primera misión hay un montón de habitaciones vacías. Debería haber
monstruos, tesoros, etc. Si la idea es que la misión sea fácil de llevar a cabo, puedes
poner pociones curativas en las habitaciones […] También pueden hallar armas, escudos,
yelmos, etc.» (firma en `autorizaciones.md`). Y la firma anterior del mismo día: **el
100 % de victorias en la primera misión está bien**; la dificultad sube en las siguientes.

## Lo que hay hoy, medido

- 22 salas con puerta (T40); solo `s`, `t`, `r`, `q` tienen monstruos (seis) y `l` texto.
  Tres trampas, tres muebles. Las otras diecisiete se abren vacías y sin texto.
- El tesoro no está «en» las salas: se roba del mazo al buscar. Poblar de tesoro una sala
  es hacer que merezca la pena entrar y buscar: monstruos que la guardan, muebles que la
  cuenten, y un texto que se lea en voz alta.
- `furniture.ts` es el catálogo de lo que hay construido en cartón: no se pone un mueble
  que no exista. **De figuras de monstruo no hay inventario escrito**: Juan Luis las hace a
  mano; no pongas más de una especie que las que la misión original ya usa por especie
  sin decírselo en la terminada.
- `npm run sim` (100 partidas por nivel) daba 100 % en los tres niveles y 15-18 rondas de
  media tras T40.

## Antes de empezar: mira si ya está hecho

```sh
grep -c "especie:" src/data/quests/calabozo.ts   # 6 es lo que hay hoy
```

## Qué hay que hacer

1. **Monstruos en unas seis u ocho salas más**, no en todas: goblins, orcos y algún
   esqueleto o zombi; en grupos de uno a tres; nunca sobre puerta, trampa ni mueble
   (`quest.test.ts` lo comprueba). Que ninguna sala nueva sea más dura que la del
   guardián.
2. **Muebles** del catálogo en las salas con monstruo y en alguna vacía (una estantería, un
   arcón, una mesa): dan sitio a lo que el texto cuenta y bloquean paso o vista según el
   catálogo.
3. **Texto de sala** para las diecisiete: una o dos frases cada una, para leer en voz alta,
   en el tono de las cinco que hay.
4. **Dos o tres trampas más**, en pasillos o salas de paso, ninguna delante de la entrada
   ni bajo un vano (los tests ya lo afirman).
5. **Medir** con `npm run sim` los tres niveles, y con más de 100 partidas si la varianza
   lo pide. La barra: **en «normal», no bajar del 90 %**, y decir el número real; si baja
   más, quita monstruos, no toques la IA ni las cartas (firma: la dificultad es de la
   misión). Comprueba también que los héroes del simulador buscan tesoro (T53 lo cambia),
   porque si no, el simulador no ve las pociones y mide de más.
6. **Un test** que fije el recuento final (salas con monstruo, muebles, trampas) para que
   nadie lo cambie sin querer.

## Trampas conocidas

- **`monstruosEnTablero` (T18)**: un monstruo no actúa hasta que lo descubren; llenar salas
  no hace más lento el turno de Zargon mientras estén cerradas.
- **Los tests de escena de T8 y T9** juegan sobre el calabozo real: con más monstruos
  algunos cambian de resultado. Mira si la escena sigue probando lo que decía antes de
  tocar el test.
- **Los nombres propios** (T42) salen de una reserva de doce por especie: más de doce de
  una especie en la misión rompe un test a propósito.

## Prohibido

- Tocar `board-base.ts`, la entrada o las puertas (firmadas y medidas en T40).
- Cambiar los pesos de la IA o la baraja para cuadrar el porcentaje.
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md`. En la terminada, la tabla sala → qué hay, el
porcentaje por nivel antes y después, y las figuras de cartón que hacen falta.
