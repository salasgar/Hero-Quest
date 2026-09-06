# T32 · La pantalla de quien juega desde su casa

**Precondición:** **T31 hecha** (sin registro compartido no hay a quién pintarle nada) y
**T18 hecha** (es la que decide qué está descubierto y qué no).
**Banda de modelo:** ALTO — decide qué ve un jugador y qué no, y esa regla la heredan las
misiones futuras.
**Ficheros que bloquea:** `src/ui/VistaDeHeroe.tsx` (nuevo), `src/ui/BoardMirror.tsx`,
`src/ui/Juego.tsx`, `src/App.tsx`, `src/estilos.css`. **Es la tarea con más ficheros de
pantalla de todo el tablón: mira los candados antes de reclamarla.**
**Duración esperada:** 4 h · **Encadenable con:** — · **Ficheros que toca:** los de
«Ficheros que bloquea», arriba, más `src/ui/useAccionesDeTurno.ts` (nuevo, salió de
`Juego.tsx`), `server/` (el relevo en memoria de `npm run relevo`) y `tests/`.
(Líneas añadidas en la migración del reparto del 2026-09-06; la tarea ya estaba LISTA,
`hechos/terminadas/32--*`, con la prueba de dos navegadores todavía por hacer. El cierre es
el de `proyecto.md`, con terminada en `hechos/`.)
Lee `_COMUN.md` primero, y la cabecera de `tareas/T30-relevo-de-acciones.md`.

## Lo que pidió Juan Luis

Que quien está lejos **vea el tablero digital con niebla**: solo lo que el grupo ha
descubierto. Eligió esa opción por encima de «solo su hoja, y el tablero por videollamada»
y por encima de «el tablero entero». El motivo de la primera lo dijo la propia opción: así
se juega **sin depender de una videollamada apuntando a la mesa**.

## Antes de empezar: mira si ya está hecho

```sh
ls src/ui/VistaDeHeroe.tsx 2>/dev/null; grep -n "niebla\|reparto" src/ui/BoardMirror.tsx
```

## Las dos pantallas no son la misma con un `if`

En la mesa, la pantalla es la del máster: lo enseña todo, porque el adulto arbitra. La de
casa enseña lo que sabe el grupo. Son dos productos distintos y conviene que sean dos
componentes distintos que **comparten el pintor del tablero**, no un componente con
banderas por dentro. Un `if (esRemoto)` repartido por seis sitios es cómo se cuela una
sala revelada de más.

Lo que ve quien juega desde su casa:

- **El tablero con niebla**: salas reveladas, puertas vistas, monstruos descubiertos.
  Nada de eso lo inventas tú: sale de `salasReveladas`, `puertasVistas` y de lo que T18
  deje montado sobre los monstruos. **Si te encuentras escribiendo una regla nueva de
  visión, para**: esa regla es del motor y el motor está reclamado por otras tareas.
- **Su hoja de héroe** y sus hechizos, como en `HeroSheet.tsx`.
- **El panel de su turno**, y cuando no es su turno, qué está pasando: quién actúa y qué
  ha hecho. El registro de eventos ya existe.
- **Quién más está conectado.**

## Cómo hacerlo

- **Reutiliza `BoardMirror`**, no escribas un segundo pintor. Lo que cambia es qué se le
  pasa, no cómo pinta. Si acaba necesitando una opción, que sea una y con nombre honesto.
- **La niebla se aplica al construir lo que se pinta, no al pintarlo.** Una función pura
  que recibe el estado y devuelve lo que ese jugador puede ver es testeable; una condición
  dentro del JSX, no.
- **Entrar en una partida es un enlace.** La mesa crea la partida, sale un código de cuatro
  letras y un enlace que se manda por WhatsApp. Quien lo abre elige qué héroe lleva de los
  que el reparto le deje. Que haya que teclear una URL a mano y luego un código es una
  tarde perdida por teléfono.
- **La reconexión no puede perder nada.** Cierra la pestaña, la vuelve a abrir, sigue en la
  partida: el registro está en el relevo y el estado se rehace. Pruébalo de verdad, no de
  memoria.
- **Cuando no le toca, que se note sin gritar.** La pantalla tiene que dejar claro que se
  está esperando a otro, y quién.

## Trampas conocidas

- **`puedeVer` da por visto todo dentro de una sala revelada**, sin trazar rectas. Lo dejó
  medido T14. Si montas la niebla probándola dentro de una sala, te saldrá verde sin
  probar nada.
- **`e.heroes` y `e.monstruos` conservan a los caídos con cuerpo 0.** Filtra por
  `cuerpo > 0` antes de pintar.
- **La niebla es de pantalla, no de red**: el registro entero llega al navegador de quien
  juega desde casa. Está explicado en T30. No lo presentes como un secreto guardado.
- **`estilos.css` lo tocan varias tareas.** Mira el candado antes, y reutiliza las clases
  que ya hay.
- **Los componentes de React no se prueban aquí** (`environment: "node"`). Por eso la
  niebla tiene que salir a una función pura: es la parte que sí se puede probar.

## Tests que hay que añadir

Sobre la función pura de la niebla:

- Una sala sin revelar no aparece; revelada, sí.
- Un monstruo en una sala sin revelar no aparece en lo que ve el jugador de casa, y sí en
  lo que ve la mesa.
- Una puerta que nadie ha visto no aparece.
- Lo que ve la mesa es el estado entero, sin recortar.
- Revelar una sala cambia lo que ve, sin tocar el estado.

## Prohibido

- Escribir reglas de visión nuevas: eso es del motor, y es de T1, T13 y T18.
- Duplicar el pintor del tablero.
- Enseñarle a quien juega desde casa una sala que el grupo no ha abierto.
- Tocar `src/data/board-base.ts`.

## Al terminar

Commit y push. Y **pruébala con dos navegadores a la vez** antes de darla por buena: lo que
hay que comprobar no es que compile, es que una jugada hecha en una ventana aparece en la
otra y que la niebla no enseña de más.
