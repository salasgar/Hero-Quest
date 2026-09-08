# T67 · Dos botones que destruyen la partida sin avisar, y «Jugar otra vez» repite la misma

**Precondición:** ninguna. **No a la vez que T57** (`App.tsx`, `usePartida.ts`).
**Banda de modelo:** BAJO — confirmación, cambio de semilla, cambio pequeño de flujo.
**Duración esperada:** 30 min · **Encadenable con:** —.
**Ficheros que toca:** `src/App.tsx`, `src/ui/Juego.tsx`, `src/ui/usePartida.ts`.
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Lo que se nota jugando hoy

«Cambiar héroes», en la barra de arriba, desmonta la partida en el acto: sin pregunta, sin
vuelta atrás. En una tableta, con niños, es un toque. Y «Jugar otra vez» al terminar vuelve
al **mismo estado inicial con la misma semilla**: mismo orden del mazo de tesoros, mismos
nombres de monstruo y, en cuanto entre T36 (todos los dados los tira la aplicación), **las
mismas tiradas**. La segunda partida es una repetición exacta de la primera si se hacen las
mismas jugadas.

## Qué cambiaría

1. **Confirmación antes de salir.** «Cambiar héroes» abre un diálogo: «¿Salir de la partida
   actual? Se perderá el progreso.» con dos botones: «Sí, salir» y «Seguir jugando». Lo
   mismo aplica al botón «Jugar otra vez» cuando hay partida EN CURSO (no cuando está TERMINADA).

2. **`reiniciar` con semilla nueva.** Hoy `reiniciar` en `usePartida` hace un reset del
   estado sin tocar `Juego` ni pasar una clave nueva a su creación. `App` sube la clave de
   `Juego` cada vez que cambia de grupo (T35), generando una partida nueva. Con solo eso,
   `reiniciar` ya no hace falta en local: `App` sube la clave al «Jugar otra vez» y `Juego`
   crea una partida con semilla nueva.

   T57 toca `usePartida.ts` para guardar el registro: después, «salir» deja de ser
   irreversible del todo (si T57 mete un botón para recuperar), pero la pregunta sigue
   sobrando menos que el susto.

## Antes de empezar: mira si ya está hecho

```sh
grep -n 'Cambiar héroes' src/App.tsx && grep -n 'Jugar otra vez' src/ui/Juego.tsx
```

Si no aparecen, está hecha.

## Qué hay que hacer

1. En `src/App.tsx`: el botón «Cambiar héroes» gana un `onClick` que abre un diálogo de
   confirmación. Si el usuario confirma, subir la clave de `Juego` (como se hace en T35 al
   cambiar de grupo).

2. En `src/ui/Juego.tsx`: el botón «Jugar otra vez» también abre un diálogo. Si confirma,
   devuelve control a `App` para que suba la clave (probablemente via callback o evento).

3. En `src/ui/usePartida.ts`: eliminar o dejar de usar la función `reiniciar`. Si no la
   llama nadie más, se puede borrar. Verificar que no la usen otros componentes.

## Trampas conocidas

- **T57 toca `usePartida.ts` también.** Coordinad si estáis en paralelo: T57 guarda registro,
  esta tarea quitaría `reiniciar`. Leed la ficha de T57 antes de empezar.

- **El diálogo de confirmación.** Usar el componente de diálogo que ya exista en la app o
  crear uno sencillo con `confirm()` de navegador si es lo más rápido. No hacer un componente
  nuevo si `confirm()` basta.

## Prohibido

- Hacer algo irreversible sin la confirmación.
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md` (pruebas en verde → commit de código →
`hechos/terminadas/67--<sid>.md` con el hash → `CERRADA` → regenerar `_ESTADO.md` → commit
con rutas explícitas → `push`).
