# T62 · Un nombre chulo por defecto para el héroe sin nombre

**Sustituye a:** T60 (`hechos/sustituidas/60--s-20260907T090034-c7bc516d.md`). No repitas su
arreglo: esta tarea ataca la misma causa por otro lado y la deja resuelta sin tocar
`narrator/`.

**Precondición:** ninguna. **No a la vez que T37** (`types.ts`, `partida.ts`).
**Banda de modelo:** MEDIO — mismo patrón que T42 (nombres propios de monstruo): una lista
de nombres escritos con criterio y una función de reparto sin repetir, no una regla del
reglamento.
**Duración esperada:** 2 h · **Encadenable con:** — (nadie libre hoy de su banda sin
compartir fichero: T60 ya no cuenta, T61 no comparte nada con esta).
**Ficheros que toca:** `src/engine/partida.ts` (`crearPartida`, el docstring de
`HeroeElegido.nombre`), `src/data/nombresHeroe.ts` (nuevo, con la lista y el reparto),
`tests/` (los que afirmen el nombre por defecto de un héroe, si alguno lo hace; y uno nuevo
para el reparto sin repetir).
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Lo que pidió Juan Luis

El 2026-09-07, a continuación de reportar el fallo de T60 (que quedó sustituida por esta):

> Cuando el usuario no le ponga nombre a algún héroe, que la app le ponga un nombre chulo.

## Por qué esta tarea sustituye a T60, no la complementa

**T60** diagnosticó que sin nombre propio, `h.nombre` se rellena con el nombre de la clase
(`src/engine/partida.ts:191`, `plantilla.nombre[genero]`), y que el narrador lo vuelve a
pegar al lado sin comprobar la coincidencia (`Enano el Enano`). Sus dos arreglos propuestos
trabajaban **en el narrador**: o comparar y no repetir, o marcar el héroe como «sin nombre
propio».

**Esta tarea ataca la causa un paso antes**: si el héroe sin nombre recibe un nombre de
verdad —sorteado, no el de la clase—, `h.nombre` nunca vuelve a coincidir con
`nombreDeClase(...)`, y `epitetoHeroe` (`relato.ts:55-58`) y `sujetoInforme`
(`local.ts:63-68`) quedan **exactamente como están hoy**, sin tocarlos: ya calculan «nombre
+ artículo + clase» bien cuando el nombre es distinto de la clase, que es justo el caso que
esta tarea garantiza siempre. Por eso T60 queda sustituida en vez de hacerse las dos: hacer
la otra encima sería resolver el mismo síntoma dos veces por caminos distintos.

## El precedente que hay que copiar: T42, nombres de monstruo

`src/data/nombres.ts` ya resuelve el mismo problema para los monstruos, y es la plantilla a
seguir:

- **`NOMBRES`** (línea 66): una lista de nombres por especie, escritos para sonar distintos
  entre familias y para leerse en voz alta sin tropezar («van acentuados como en castellano
  porque los va a leer un niño en la mesa»). Para héroes, el criterio equivalente es una
  lista **por clase y género** (bárbaro/bárbara, enano/enana, elfo/elfa, mago/hechicera,
  hada) que suene a nombre de aventurero de fantasía, no a personaje con derechos de autor.
- **`repartirNombres`** (línea 203): recibe el generador **derivado** de la semilla —nunca
  el de la partida— y reparte un nombre por figura sin repetir dentro de la partida; si se
  agotan, da otra vuelta con un ordinal romano detrás («Glupfch II»). Con hasta ocho héroes
  y solo cinco clases (T16 permite repetir clase), **puede hacer falta esta reserva**: dos
  enanos en la misma partida no pueden llamarse igual.
- El desplazamiento de la semilla (`crearPartida`, línea 218: `+ 0x5bf03635` para
  monstruos; línea 225: `+ 0x1d3f7a09` para temperamentos) tiene que ser **otro número
  cualquiera, con tal de no repetir los que ya existen**: si el sorteo de nombres de héroe
  compartiera corriente con cualquiera de los otros dos, añadir un héroe cambiaría los
  nombres de los monstruos o los temperamentos, y con ellos el resultado de partidas ya
  jugadas con esa semilla.

## Antes de empezar: mira si ya está hecho

```sh
grep -n "nombresHeroe\|nombre chulo" src/engine/partida.ts src/data/*.ts
```

## Qué hay que hacer

1. **Escribe `src/data/nombresHeroe.ts`**, con una lista de nombres por clase y género
   (`Record<ClaseHeroe, Record<Genero, readonly string[]>>` o equivalente; el hada puede
   compartir lista entre géneros, como ya hace `HEROES.hada.nombre`). Unos ocho a doce por
   combinación, en la línea de lo que pide el comentario de `nombres.ts`: acentuados,
   pronunciables por un niño, sin nada con derechos de autor. Puedes tomar el tono de
   fantasía castellana corriente, igual que hicieron los de monstruo.
2. **Una función de reparto** en el mismo fichero, con la misma forma que
   `repartirNombres`: recibe los héroes elegidos (clase, género, nombre opcional) y un
   `Rng`, y devuelve un nombre por héroe sin repetir dentro de la partida, con el mismo
   truco del ordinal romano si se agotan. Un héroe **con** nombre propio se queda con el
   suyo y sale del sorteo para los demás de su clase y género (igual que en
   `repartirNombres`, un monstruo con nombre fijado por la misión no se lo quita a otro).
3. **En `crearPartida`** (`partida.ts:176-204`): calcula el reparto con un generador
   derivado de la semilla, con un desplazamiento nuevo que no choque con los otros dos, y
   úsalo en vez de `plantilla.nombre[genero]` en la línea 191. Hazlo **antes** de construir
   `heroes`, igual que el reparto de monstruos se calcula antes de construir `monstruos`
   (línea 218 antes de la 227).
4. **Actualiza el docstring de `HeroeElegido.nombre`** (línea 36: «Si falta, se usa el de
   la clase» ya no es verdad) y el comentario de la línea 191.

## Trampas conocidas

- **El generador que recibe la función de reparto se agota ahí y no vuelve**, exactamente
  como avisa el comentario de `repartirNombres` en `nombres.ts` sobre el de los monstruos:
  si el sorteo de nombres de héroe tirase del generador de la partida, cambiaría el
  resultado de todas las tiradas posteriores y con él el de los tests con semilla fija
  (`tests/integracion.test.ts` el primero). Derívalo con `crearRng((op.semilla ?? 1) +
  <tu desplazamiento>)`.
- **118 llamadas en `tests/` construyen un héroe sin `nombre`** (`grep -rn "clase: \"[a-z]*\"" tests/*.ts | grep -v "nombre:"`). La mayoría solo usa el resultado por `id`/`clase`, no
  por el texto del nombre, así que no deberían romperse; pero corre la batería entera antes
  y después y mira con lupa cualquier test que compare `h.nombre` o el texto del diario
  contra una cadena literal que hoy dé por hecho el nombre de la clase. Los tests de
  `tests/narrador.test.ts` y `tests/narrator.test.ts` no deberían tocarse: sus fixtures ya
  ponen `nombre: "Háfir"` explícito.
- **Hasta ocho héroes y solo cinco clases** (T16): con grupos grandes y clases repetidas,
  la reserva del reparto tiene que aguantar más de doce del mismo par clase+género en teoría
  (aunque en la práctica con ocho héroes lo peor que puede pasar son ocho de la misma
  clase). Prueba ese caso límite.
- **No es lo mismo que T42.** No copies el fichero entero: los monstruos llevan especie y
  género fijo por especie (`GENERO_ESPECIE`); los héroes eligen género en la pantalla de
  inicio (T16), así que la lista se indexa por los dos.

## Tests que hay que añadir

- Dos héroes de la misma clase y género sin nombre propio (grupo con clase repetida, T16)
  reciben nombres **distintos**.
- Un héroe con nombre propio se queda con el suyo y ese nombre no se lo lleva ningún otro
  de su clase y género en la misma partida.
- Misma semilla → mismos nombres por defecto (determinismo), y cambiar el número de héroes
  no cambia los nombres de los monstruos ni los temperamentos (la prueba de que el
  desplazamiento no choca).

## Prohibido

- Usar el generador de la partida (`rng` del estado) para este sorteo: tiene que ser
  derivado, como los otros dos.
- Repetir el arreglo de T60 en `narrator/local.ts` o `narrator/relato.ts`: con esta tarea
  hecha, esos ficheros no necesitan tocarse. Si al jugar encuentras un caso donde el
  narrador SÍ sigue repitiendo la clase, es que el reparto de esta tarea tiene un agujero
  (compruébalo aquí primero), no que haga falta la otra solución.
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md`. En el mensaje de cierre, pega un fragmento del
diario (informe o relato, el que prefieras) con un héroe sin nombre propio y su nombre
chulo puesto, para que Juan Luis lo vea sin tener que jugar él mismo.
