# T73 · Héroes del simulador que juegan como personas

**Precondición:** T45 LISTA. **No a la vez que T53, T38, T45** (`simular.ts`).
**Banda de modelo:** MEDIO — política de IA, simulación comparada, catálogo.
**Duración esperada:** 2 h · **Encadenable con:** —.
**Ficheros que toca:** `scripts/simular.ts`, quizá `tests/` si la política se saca a un módulo.
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Lo que se nota jugando hoy

No se nota en la mesa: se nota en los números que deciden el diseño. `npm run sim` juega con
héroes que «abren, pegan y se acercan»: ni buscan, ni curan, ni lanzan. T45 va a **ordenar
el catálogo de misiones por el porcentaje que salga de ahí**, T46 y T47 se diseñan contra
ese número, y T53 solo añade «buscar en la sala del objetivo». Con héroes tontos el
porcentaje sale bajo en las misiones donde curarse o dormir al jefe importa, y el catálogo
puede quedar en el orden equivocado. El guion con el que se jugó esta partida (busca tesoro
una vez por sala, lanza los hechizos de daño y de sueño a lo que ve, cura a quien ha perdido
3 o más) tardó una hora en escribirse y ya da 12–49 rondas en `astuto` frente a las 8 del
guion tonto.

## Qué cambiaría

Una política de héroes «razonable» en `simular.ts`, elegible con un argumento
(`--heroes tontos|razonables`), y la tabla del catálogo con las dos columnas. Cuando T54
exista, que beba pociones. Los porcentajes de la terminada de cada misión llevan las dos
columnas.

## Antes de empezar: mira si ya está hecho

```sh
grep -n '\-\-heroes' scripts/simular.ts && \
grep -n 'razonables' scripts/simular.ts
```

Si ambas cosas aparecen, está hecha.

## Cómo funciona hoy

1. `simular.ts` recorre el catálogo de misiones (T45).
2. Por cada misión, juega tres partidas con héroes tontos (política hardcodeada).
3. Saca el porcentaje de victorias y lo imprime.

## Qué hay que hacer

1. **Política «razonable» de héroes.** Extraerla del guion de la partida jugada, o
   parametrizar lo que hoy es código tonto:
   - Buscar tesoro en cada sala nueva (no todas las salas, solo las descubiertas).
   - Lanzar hechizos de daño a lo que vea.
   - Lanzar Sueño al jefe de la misión si sale.
   - Curarse si ha perdido 3+ puntos de vida.
   - Cuando T54 exista, beber una poción si cae a la mitad de vida.

2. **Argumento `--heroes tontos|razonables`.** Por defecto tontos (para no cambiar el
   comportamiento de `npm run sim` a secas). Ejemplo:
   ```
   npm run sim -- --heroes razonables
   npm run sim calabozo -- --heroes razonables
   ```

3. **Tabla con dos columnas.** Cambiar la salida de `simular.ts` para mostrar:
   ```
   Misión            Tontos    Razonables
   Calabozo          100%      100%
   Torreón           87%       92%
   ```

4. **Terminadas con ambas columnas.** Cuando se cierre una misión (T46, T47, etc.), la
   terminada dice los porcentajes con ambas políticas:
   ```
   simulador: 87 / 89 / 92 % (tontos) y 92 / 94 / 96 % (razonables)
   ```

## Trampas conocidas

- **T53, T38, T45 tocan `simular.ts`.** Coordinad si estáis en paralelo: esta tarea
  viene después de T45 y no puede ir a la vez.

- **La política razonable no tiene que ser perfecta.** Es un benchmark: si da números más
  altos, la misión sale mejor posicionada en el catálogo. No se trata de ganar siempre.

- **Cuando T54 añada pociones**, actualizar la política para beberlas. Hasta entonces,
  ignorar que existan.

- **Los tests.** Si extraes la política a un módulo, tests en `tests/`. Si la dejas inline
  en `simular.ts`, no hace falta.

## Prohibido

- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).
- Cambiar el comportamiento de tontos; siempre igual.

## Al terminar

El orden de cierre es el de `proyecto.md` (pruebas en verde → commit de código →
`hechos/terminadas/73--<sid>.md` con el hash → `CERRADA` → regenerar `_ESTADO.md` → commit
con rutas explícitas → `push`).
