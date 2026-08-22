# T12 · Incidencia: un commit se llevó trabajo ajeno, y el tablón se quedó a medias

> **CERRADA (`8b0b7dc`). No la vuelvas a ejecutar.** Y su paso 2 estaba mal: daba por
> muertas tres sesiones que seguían vivas, y liberó T2, T4 y T7 mientras se trabajaba en
> ellas. Restaurado; el detalle está en las incidencias de `_ESTADO.md`.

**Precondición:** ninguna. **Ficheros que toca:** `_ESTADO.md`, `src/engine/reducer.ts`.
**Urgente:** hazla antes de coger cualquier otra, porque el tablón está desactualizado y
hay trabajo sin commitear que se pierde si alguien limpia el árbol.

Lee `tareas/_COMUN.md` primero.

## Qué pasó

El 22 de agosto de 2026, la sesión que escribió este reparto ejecutó **`git add -A`** en el
directorio de trabajo compartido mientras otras tres sesiones tenían cambios sin commitear.
Resultado: el commit **`d3dced0`** se llevó por delante trabajo que no era suyo.

Concretamente, `d3dced0` contiene:

- `src/engine/board.ts` — el trabajo **a medias de T2** de la sesión `47e1fced`.
- Una línea de `_ESTADO.md` corrigiendo los ficheros de T3, de otra sesión.

Y su **mensaje de commit describe otra cosa completamente distinta**: unos cambios del
tablón que, por un fallo del script que los aplicaba, nunca llegaron a escribirse en el
fichero. Quien lea `git log` verá un mensaje que no corresponde con el diff.

La causa raíz ya está documentada en `tareas/_COMUN.md`: **el directorio de trabajo es uno
y lo comparten todas las sesiones.** La regla que faltaba y que hay que respetar es:
**nunca `git add -A`; se añaden los ficheros por nombre, uno a uno.**

## Estado comprobado en el momento de escribir esto

- `main` = `d3dced0`, empujado. **204 tests en verde y typecheck limpio.** No hay nada
  roto: el código que se coló es correcto, solo está mal atribuido.
- Hay **trabajo sin commitear en `src/engine/reducer.ts`**: es de la sesión `64d69b4d`,
  que llevaba T4 y fue interrumpida.
- T1 está hecha (`a24b396`). T2, T4 y T7 figuran «en curso» por sesiones que ya no existen.

## Qué hay que hacer

### 1. Rescatar el trabajo huérfano de `reducer.ts`

Míralo con `git diff src/engine/reducer.ts`. Hace dos cosas, las dos correctas:

- **La regla de T4**: añade `esHeroe(f)` a la condición de `mover()` que decide si una
  trampa afecta a quien pisa, con la cita del reglamento («Monsters do not spring hidden
  traps», p. 17).
- **La trampa conocida de T2**: al retroceder por un bloque, desanda hasta la primera
  casilla realmente libre, porque con la regla nueva un héroe puede haber pasado por
  encima de un compañero y su casilla de origen estar ocupada.

**No tiene tests.** T4 pide cuatro concretos y no está ninguno.

Commitéalo **añadiendo solo ese fichero por nombre**, con un mensaje que diga de quién era
y que está a medias. No lo des por terminado.

### 2. Poner el tablón al día

- **T4** vuelve a `pendiente`, con una nota: «la regla está en `main` desde \<tu commit\>,
  faltan sus tests».
- **T2** vuelve a `pendiente`, con una nota: «`board.ts` está en `main` desde `d3dced0`,
  faltan sus tests y la entrada de la misión».
- **T7**: comprueba con `git log` si llegó a commitear algo. Si no, vuelve a `pendiente`.
- Añade una línea de incidencia explicando que **el mensaje de `d3dced0` no corresponde
  con su contenido**, para que quien lo lea en el futuro no se vuelva loco.

**No reescribas el histórico.** Está empujado, y la regla 4 del tablón lo prohíbe sin
autorización escrita de Juan Luis.

### 3. Aplicar los cambios del tablón que nunca se escribieron

Son la respuesta a dos preguntas que hizo Juan Luis y que hay que dejar contestadas **en el
tablón**, no en una conversación. Van tal cual, sin reescribirlos.

**a)** Justo después de la línea «Qué es el proyecto y por qué está montado así:
`TRASPASO.md`…» y antes del primer `---`, inserta:

```markdown
---

## Si acabas de llegar

Cuatro pasos, en este orden. El tercero es el que evita que dos sesiones hagan lo mismo.

1. **`git pull`.** Varias sesiones empujan a `main`. Si arrancas con una copia vieja,
   trabajas contra un tablón que ya no es verdad.
2. **Elige una tarea libre**, respetando el candado de fichero de la tabla de abajo.
3. **Escribe tu línea en la columna «Estado» y haz `git commit` y `git push` de ese cambio
   solo**, antes de tocar código. Formato: `en curso · <tu id> · <fecha>`.
4. **Si el push te lo rechazan, alguien se te adelantó.** Haz `git pull --rebase`, mira si
   tu tarea sigue libre y, si no, elige otra. No fuerces el push.

Ese cuarto paso es el mecanismo entero: **el candado no es el fichero, es el push**. Dos
sesiones pueden leer el tablón a la vez, pero solo una consigue empujar su reclamación
primero. La otra se entera al instante y sin ambigüedad.

**Nunca `git add -A`.** El directorio de trabajo es compartido: añade tus ficheros por
nombre, uno a uno. Ignorar esto ya costó la incidencia T12.

Cuando termines, escribe tu línea en el registro de finalizaciones y **cierra la sesión**.
No encadenes otra tarea: una sesión, una tarea.

### El prompt con el que arrancar una sesión

```
Lee _ESTADO.md y coge la tarea T4. Sigue su fichero en tareas/ y tareas/_COMUN.md.
Apúntate en el tablón y empuja ese commit antes de tocar código.
```

**Nombra la tarea en el prompt.** «Mira el tablón y continúa con el trabajo» funciona, pero
deja que dos sesiones abiertas a la vez elijan la misma antes de que ninguna haya podido
reclamarla. Decirlo tú cuesta tres palabras y quita la carrera de en medio.
```

**b)** La columna «Fichero que bloquea» de la tabla **está mal medida**: dice que solo T4,
T5 y T6 tocan `reducer.ts`. Son **cinco de siete**. Compruébalo tú mismo:

```sh
grep -n "buscarTrampas" src/engine/reducer.ts      # T3 lo toca
grep -n "efecto.retrocede" src/engine/reducer.ts   # T2 lo toca
grep -ln "buscadoTesoro" src/engine/*.ts           # T6 toca cuatro ficheros
```

Renombra la columna a «Ficheros que toca» y pon los de verdad:

| # | Ficheros que toca |
|---|---|
| T1 | `vision.ts` |
| T2 | `board.ts`, `quests/`, **`reducer.ts`** |
| T3 | `selectors.ts`, **`reducer.ts`** |
| T4 | **`reducer.ts`** |
| T5 | `combat.ts`, `selectors.ts`, **`reducer.ts`** |
| T6 | `types.ts`, `partida.ts`, `selectors.ts`, **`reducer.ts`** |
| T7 | `data/` |

**c)** Sustituye la sección «Cómo se leen las dos últimas columnas» por esta, que contesta
cuántas sesiones abrir:

```markdown
### Cuántas sesiones caben a la vez

**Tres.** No es una cifra prudente: es lo que dan los ficheros.

`reducer.ts` lo tocan **cinco de las siete** tareas. Las únicas dos que no lo tocan son
**T1** y **T7**. De ahí la combinación que va sobre seguro:

> **T1 + T7 + una cualquiera del grupo de `reducer.ts`.**

Una cuarta sesión es posible —las cinco tocan funciones distintas del fichero, y `git` las
suele fusionar sin quejarse— pero ya es apostar a que el rebase salga limpio. Si lo
intentas, que sea T4, que es la más pequeña y la que antes suelta el fichero.

**«bloqueada»** significa que la precondición no se cumple todavía, no que la tarea sea
difícil. En cuanto T1–T7 estén en «hecha», T8 se puede coger.
```

Ojo: T1 ya está hecha, así que a partir de ahora las dos libres de `reducer.ts` son T7 y
lo que quede de T2 sin su parte de `reducer.ts`. Ajusta el texto a la realidad del momento
en que lo escribas en vez de copiarlo a ciegas.

## Verificación

```sh
npx vitest run     # tienen que seguir siendo 204 en verde
npm run typecheck
```

## Prohibido

- **`git add -A`**, `git add .` o cualquier forma de añadir sin nombrar. Es literalmente la
  causa de esta incidencia.
- Reescribir el histórico o forzar el push.
- Descartar los cambios sin commitear de `reducer.ts` antes de rescatarlos.
- Dar T2 o T4 por terminadas: les faltan los tests a las dos.

## Al terminar

Commit y push, añadiendo los ficheros por nombre. Línea en el registro de `_ESTADO.md`.
