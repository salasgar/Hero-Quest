# T69 · Guardar la partida y continuarla otro día

**Precondición:** T57 LISTA. **No a la vez que T37, T45, T57** (comparten `App.tsx`, `EleccionDeHeroes.tsx`, `usePartida.ts`).
**Banda de modelo:** MEDIO — persistencia, flujo de pantalla, recuperación.
**Duración esperada:** 3 h · **Encadenable con:** —.
**Ficheros que toca:** `src/App.tsx`, `src/ui/EleccionDeHeroes.tsx`, `src/ui/usePartida.ts`,
`src/ui/registroDePartida.ts` (T57), `tests/`.
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Lo que se nota jugando hoy

Una partida vive en la pestaña. Cerrarla, recargar o que la tableta se apague la borra. Con
niños, una misión de 18 rondas (la jugada aquí) no siempre cabe en una tarde. Es la Fase 8
de `TRASPASO.md` y la pieza que más veces se ha citado como pendiente (T6, T13, T18, T37
avisan cada vez que cambian el estado).

## Qué cambiaría

No guardar el estado entero: guardar **lo que T57 ya guarda** (semilla, grupo, misión, lista
de acciones, commit) y rehacer con `repetir`. Así el formato no depende de la forma del
estado, que cambia con T37, T38, T53 y T54, y una acción que ya no sea legal tras un cambio
de reglas se descarta sola en vez de romper la carga.

1. **En la primera pantalla**, «Continuar la partida de ayer» si hay una en `localStorage`
   (o mejor, un listado de partidas guardadas con nombre).

2. **Guardar en fichero / Cargar un fichero**, con el mismo JSON de T57, para la tableta que
   se cambia o que se pasa de una sesión a otra.

3. **Un nombre para cada partida guardada**, que el usuario pueda poner al guardar y que
   aparezca en el listado de continuables. Permite recuperar y continuar cualquiera de las
   guardadas, no solo la última.

4. **Mochila y iconos viajan solos**, porque van en el grupo (T54) o en las acciones (T37),
   así que la recuperación no los pierde aunque cambien entre guardadas.

## Antes de empezar: mira si ya está hecho

```sh
grep -n 'Continuar la partida' src/ui/EleccionDeHeroes.tsx && \
grep -n 'guardar' src/ui/registroDePartida.ts
```

Si ambas cosas aparecen, está hecha. Comprueba también que `localStorage` guarda partidas
con nombre.

## Cómo usar el registro de T57

T57 ya guarda semilla, grupo, misión y lista de acciones en un JSON. Esta tarea reutiliza
ese formato:

- Al guardar: tomar el registro de T57 (`generarRegistroDePartida(partida)`), ponerle un
  nombre dado por el usuario, guardar en `localStorage` con clave `partida-<nombre>` (o un
  id único).

- Al cargar: listar lo que hay en `localStorage` con prefijo `partida-`, mostrar nombres, y
  si elige uno, leer el JSON y llamar a `repetir` (de T57) para reconstruir la partida.

## Trampas conocidas

- **T57, T37, T45 tocan los mismos ficheros.** Coordinad el orden: esta tarea viene después
  de T57, que deja el 70 % hecho.

- **El estado cambia con T37, T38, T53, T54.** Por eso es mejor guardar el registro (acciones
  + semilla + metadatos) que el estado. Si una acción queda ilegal, `repetir` la descarta
  silenciosamente sin romper nada.

- **`localStorage` tiene límite** (típicamente 5-10 MB por origen). Con ocho héroes en una
  misión de 18 rondas, un registro ocupa algunos kilobytes. Advertir si la lista de
  guardadas se acerca al límite, o permitir exportar a fichero (que T57 ya resuelve).

- **Los nombres de partida.** Permitir renombrar una guardada, o borrarla sin recuperar.
  Simples: UI mínima, nada de drag-and-drop.

## Prohibido

- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).
- Guardar el estado completo; siempre el registro de T57.

## Al terminar

El orden de cierre es el de `proyecto.md` (pruebas en verde → commit de código →
`hechos/terminadas/69--<sid>.md` con el hash → `CERRADA` → regenerar `_ESTADO.md` → commit
con rutas explícitas → `push`).
