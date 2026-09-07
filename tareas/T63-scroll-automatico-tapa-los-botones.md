# T63 · Al actuar, la página hace scroll y tapa los botones de acción

**Precondición:** ninguna. **No a la vez que T37, si acaba tocando `estilos.css`** (no
debería hacer falta: el arreglo es de comportamiento, en TypeScript).
**Banda de modelo:** MEDIO — el diagnóstico ya está hecho (abajo); queda decidir y probar
la forma exacta de acotar el scroll, con la mecánica de scroll del navegador.
**Duración esperada:** 1 h · **Encadenable con:** — (nadie de su banda libre hoy sin
compartir fichero, salvo que se resuelva sin tocar `estilos.css`, en cuyo caso no choca con
nadie).
**Ficheros que toca:** `src/ui/MasterLog.tsx`, `src/estilos.css` (solo si hace falta),
tests si el proyecto tiene forma de probar esto (ver «Tests que hay que añadir»).
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Lo que contó Juan Luis

El 2026-09-07:

> Cuando le doy a "terminar turno" o a cualquier otra cosa la página hace scroll hacia abajo
> y dejan de verse los botones principales de "Tirar movimiento", "Buscar trampas", etc. No
> debería hacer eso.

## Diagnóstico medido en el código

La causa es un único `scrollIntoView` mal dirigido, y **no es solo de «terminar turno»: se
dispara tras casi cualquier acción**, porque está atado al tamaño del diario, no al evento
concreto.

`src/ui/MasterLog.tsx`, dentro de `MasterLog`:

```tsx
const fondo = useRef<HTMLDivElement>(null);
...
useEffect(() => {
  fondo.current?.scrollIntoView({ behavior: "smooth", block: "end" });
}, [lineas.length]);
...
return (
  <section className="diario">
    ...
    <div className="diario-lista">
      ...
      {lineas.map((l) => <p key={l.clave} className={...}>{l.texto}</p>)}
      <div ref={fondo} />
    </div>
  </section>
);
```

`fondo` es un `<div>` vacío al final de la lista del diario. El efecto se dispara cada vez
que `lineas.length` cambia, y eso pasa tras **cualquier** acción del motor: el reducer añade
eventos al registro en cada acción (`src/engine/reducer.ts`) y `narrar` casi siempre produce
una línea nueva, incluida la de cambio de turno (`estilos.css` tiene una clase
`linea-cambioDeTurno` para ella).

`Element.scrollIntoView()` no se para en el contenedor con scroll más cercano: sube por
todos los ancestros desplazables hasta que el elemento queda visible en cada uno. Aquí eso
es un problema porque el diario está **al final** de la columna de la derecha, después de
`TurnPanel` (los botones) y de las hojas de héroe (`src/ui/Juego.tsx:135-207`), y esa
columna (`.juego-panel`, `src/estilos.css:85-89`) tiene su propio `overflow-y: auto`:

```css
.juego-panel {
  flex: 1 1 320px; min-width: 300px; max-width: 460px;
  display: flex; flex-direction: column; gap: .9rem;
  max-height: calc(100vh - 5rem); overflow-y: auto;
}
...
.diario-lista { max-height: 260px; overflow-y: auto; font-size: .84rem; line-height: 1.5; }
```

Con `fondo` no visible dentro de `.juego-panel` (aunque ya lo esté dentro de
`.diario-lista`), el navegador desplaza **también** `.juego-panel` entero hacia abajo,
sacando de la vista la sección `.turno` (los botones) que está más arriba en esa misma
columna. Y en pantallas estrechas, la regla `estilos.css:166-169`

```css
@media (max-width: 1100px) {
  .juego { flex-direction: column; }
  .juego-panel { max-width: none; max-height: none; }
}
```

le quita a `.juego-panel` su `max-height` y su `overflow-y`: ahí ya no hay scroll de panel,
así que el desplazamiento se propaga a **toda la ventana** — el síntoma exacto que describió
Juan Luis, con `behavior: "smooth"` haciéndolo más lento y perceptible.

## Antes de empezar: mira si ya está hecho

```sh
grep -n "scrollIntoView" src/ui/MasterLog.tsx
```

## Qué hay que hacer

Acotar el scroll para que solo mueva el diario, nunca la columna ni la página. Dos caminos
razonables (elige uno con criterio, prueba el resultado en el navegador en las dos anchuras
—por encima y por debajo de 1100px— antes de dar por bueno cualquiera):

1. **Desplazar solo `.diario-lista` a mano**, en vez de `scrollIntoView`:
   ```ts
   fondo.current?.parentElement?.scrollTo({ top: fondo.current.parentElement.scrollHeight, behavior: "smooth" });
   ```
   así el desplazamiento nunca sube más allá de su contenedor inmediato.
2. **`{ block: "nearest" }`** en vez de `{ block: "end" }`: hace que `scrollIntoView` no
   desplace un ancestro en el que el elemento ya es visible (o casi), aunque hay que
   comprobarlo de verdad en el navegador porque el comportamiento exacto de «nearest» con
   contenedores anidados no es tan predecible como el de mover el contenedor a mano.

Cualquiera de los dos tiene que seguir haciendo que el diario se desplace solo hasta su
última línea al añadirse una (eso es lo que se quiere conservar: no hay que ir a buscar la
línea nueva a mano dentro del diario), pero **sin tocar el scroll de `.juego-panel` ni el
de la página**.

## Trampas conocidas

- **No es solo el botón de «terminar turno».** El efecto depende de `lineas.length`, así
  que se dispara con cualquier acción que añada una línea al diario (mover, atacar, buscar,
  lanzar hechizo…). Prueba varias acciones seguidas, no solo terminar turno.
- **Prueba en las dos anchuras.** Por encima de 1100px el síntoma es que se desplaza
  `.juego-panel` (el navegador scrollea la columna de la derecha); por debajo, es la
  ventana entera la que se desplaza (`estilos.css:166-169` le quita el scroll propio al
  panel). Un arreglo que solo se pruebe en una de las dos puede parecer que funciona y
  seguir fallando en la otra.
- **No quites el auto-scroll del diario en sí** (el punto que sí es correcto: que la línea
  nueva se vea sin desplazarse a mano dentro del propio diario). El fallo no es que el
  diario se desplace, es que arrastra contenedores que no debería.
- **La vista remota** (`VistaDeHeroe.tsx`) puede tener su propio diario o un layout
  distinto: comprueba si comparte `MasterLog` y si el arreglo aplica igual allí.

## Tests que hay que añadir

Ninguno automático: el comportamiento de scroll del navegador no lo ejercita `vitest`
(entorno jsdom, sin layout real). La verificación es manual: juega unas cuantas acciones en
`npm run dev` (o en la página publicada) en una ventana ancha y en una estrecha, y comprueba
a ojo que los botones de `TurnPanel` siguen visibles después de cada una.

## Prohibido

- Quitar el auto-scroll del diario sin más (dejaría de verse la línea nueva sin scrollear a
  mano, que es peor para seguir la partida).
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md`. En el mensaje de cierre, describe qué probaste
(qué acciones, qué anchuras de ventana) porque no hay test automático que lo demuestre por
ti.
