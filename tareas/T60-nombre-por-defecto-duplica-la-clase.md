# T60 · Sin nombre propio, el diario dice «Enano el Enano»

**Precondición:** ninguna. **No a la vez que T37** (`types.ts`, `partida.ts`). Con **T45**
sí va en paralelo: la 45 no toca ninguno de los ficheros de esta ficha.
**Banda de modelo:** MEDIO — el diagnóstico ya está hecho (abajo); queda decidir cómo
distinguir «nombre propio» de «nombre por defecto» sin romper las 141 líneas de
`frases.ts` que dan por hecho que `h.nombre` es un nombre de pila.
**Duración esperada:** 2 h · **Encadenable con:** — (nadie más de su banda libre hoy sin
compartir fichero).
**Ficheros que toca:** `src/engine/partida.ts`, `src/engine/types.ts` (si se añade un
campo), `src/narrator/relato.ts`, `src/narrator/local.ts`, `tests/narrador.test.ts`,
`tests/narrator.test.ts`.
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Lo que contó Juan Luis

El 2026-09-07, pegando un trozo del diario de una partida sin nombres propios puestos:

> Elfa la Elfa cruza la penumbra sin detenerse.
>
> Enano el Enano registra la sala y encuentra: Poción de fuerza. Sabe a hierro. Suma 2
> dados a tu siguiente ataque.
>
> Sin perder tiempo, enano el Enano se echa «Poción de fuerza» a la mochila.

> Como no le he puesto nombre a los héroes dice cosas como "Enano, el enano" pero sin la
> coma (no sé por qué)

**No es una coma que falta.** Es la clase repetida dos veces porque, sin nombre propio, el
«nombre» del héroe **ya es** la clase.

## Diagnóstico medido en el código

1. **`src/engine/partida.ts:191`** — cuando no hay nombre propio, `h.nombre` se rellena con
   el nombre de la clase, no con una cadena vacía ni con un valor que se pueda distinguir
   después:
   ```ts
   nombre: elegido.nombre?.trim() || plantilla.nombre[genero],
   ```
   `plantilla.nombre[genero]` es la misma tabla que consulta `nombreDeClase`
   (`src/data/heroes.ts:103-157`, p. ej. línea 116: `nombre: { m: "Enano", f: "Enana" }`).
   Sin nombre propio, `h.nombre === "Enano"` a secas — indistinguible de un nombre de pila
   real que por casualidad coincidiera.

2. **`src/narrator/relato.ts:55-58`**, `epitetoHeroe`, compone «nombre + artículo + clase»
   sin comprobar si el nombre ya es la clase:
   ```ts
   function epitetoHeroe(h: Heroe): string {
     const articulo = h.clase === "hada" ? "el" : h.genero === "f" ? "la" : "el";
     return `${h.nombre} ${articulo} ${nombreDeClase(h.clase, h.genero)}`;
   }
   ```
   Con `h.nombre = "Enano"`, esto da literalmente `"Enano el Enano"`.

3. **La mayúscula/minúscula inicial que varía** entre los tres ejemplos de Juan Luis viene
   de `tokensDe` (`relato.ts:65-70`), que expone dos tokens del mismo epíteto: `Sujeto`
   (con mayúscula, para abrir frase) y `sujeto` (con `minusc()`, línea 22, para ir en medio
   de frase). Las tres plantillas exactas que produjeron sus ejemplos están en
   `src/narrator/frases.ts`:
   - línea 48: `"{Sujeto} cruza la penumbra sin detenerse."` → «Elfa la Elfa cruza…»
   - línea 211: `"{Sujeto} registra la sala y encuentra: {nombre}. {texto}"` → «Enano el
     Enano registra…»
   - línea 182: `"Sin perder tiempo, {sujeto} se echa «{nombre}» a la mochila."` → «…enano
     el Enano se echa…» (minúscula porque no abre frase)

4. **El modo «informe» tiene el mismo defecto, en otro orden.**
   `src/narrator/local.ts:63-68`, `sujetoInforme`:
   ```ts
   export function sujetoInforme(e: EstadoPartida, id: IdFigura): string {
     const h = e.heroes.find((x) => x.id === id);
     if (!h) return nombreDe(e, id);
     const articulo = h.clase === "hada" ? "el" : h.genero === "f" ? "la" : "el";
     return `${articulo} ${nombreDeClase(h.clase, h.genero).toLowerCase()} ${h.nombre}`;
   }
   ```
   Sin nombre propio da `"el enano Enano"` (clase primero, nombre después: mismo problema,
   forma distinta). No lo vio Juan Luis en su cita porque no pegó texto del modo informe,
   pero es la misma causa y toca corregirlo a la vez o el fallo reaparece en cuanto alguien
   cambie de modo.

5. **No hay ningún test que cubra el caso sin nombre propio.** El único test que afirma el
   formato de `epitetoHeroe` es `tests/narrador.test.ts:46-49` («Háfir el Enano es el
   sujeto de su propio movimiento»), pero su fixture (línea 9) siempre pone
   `nombre: "Háfir"` explícito. El formato «NombrePropio el Clase» está bien fijado y
   **no se toca**; lo que falta es el caso «sin nombre propio», que hoy no prueba nadie.

## Antes de empezar: mira si ya está hecho

```sh
grep -n "plantilla.nombre\[genero\]" src/engine/partida.ts
grep -n "sin nombre\|nombrePropio\|nombrePorDefecto" src/engine/types.ts src/narrator/relato.ts src/narrator/local.ts
```

## Qué hay que hacer

1. **Decide cómo distinguir «nombre propio» de «nombre por defecto»** sin romper
   `epitetoHeroe`/`sujetoInforme` para el caso normal (con nombre puesto, que no cambia).
   Dos caminos razonables, a elegir con criterio, no a ciegas:
   - Comparar en `epitetoHeroe`/`sujetoInforme` si `h.nombre === nombreDeClase(h.clase, h.genero)` y, si coincide, devolver solo el epíteto sin repetir el nombre
     (`"el Enano"`, `"la Elfa"`) — no toca `partida.ts` ni el tipo `Heroe`, pero es frágil
     si algún día alguien pone «Enano» como nombre propio a propósito (poco probable, y se
     puede aceptar).
   - Añadir un campo (p. ej. `tieneNombrePropio: boolean`) a `Heroe` en `partida.ts` y
     `types.ts`, y que el narrador lo use para decidir si repite la clase. Más explícito,
     toca más ficheros.
   Cualquiera de los dos es aceptable; la ficha no lo decide por ti, es la parte de
   criterio de esta tarea.
2. **Aplícalo en los dos módulos**: `relato.ts` (`epitetoHeroe`) y `local.ts`
   (`sujetoInforme`). Los dos tienen el mismo defecto y las dos formas del texto («Enano el
   Enano» y «el enano Enano») tienen que quedar bien: para un héroe sin nombre, «el Enano»
   / «la Elfa»; para uno con nombre, sigue igual que hoy («Háfir el Enano»).
3. **No toques el caso con nombre propio.** El test de `tests/narrador.test.ts:46-49` fija
   ese formato a propósito; sigue en verde tal cual.

## Trampas conocidas

- **`plantilla.nombre[genero]` no es solo el valor por defecto de `h.nombre`: es la misma
  tabla que usa `nombreDeClase`.** Si cambias `partida.ts` para no rellenar `h.nombre` con
  la clase, comprueba que nada más dependa de que `h.nombre` nunca esté vacío (búscalo con
  `grep -rn "\.nombre" src/ | grep -v test`) — puede haber pantallas o el registro de
  partida que muestren `h.nombre` tal cual esperando que nunca esté en blanco.
- **El hada lleva «el» siempre**, por regla fonética («el hada», no por género gramatical):
  no toques esa parte de `epitetoHeroe` ni de `sujetoInforme`, no es el bug.
- **`frases.ts` tiene 141 líneas de plantillas** que usan `{Sujeto}`, `{sujeto}`, `{objeto}`,
  etc.: el arreglo va en `tokensDe`/`epitetoHeroe`/`sujetoInforme`, no en cada plantilla.

## Tests que hay que añadir

- Un héroe **sin nombre propio** (fixture con `nombre: ""` o sin la clave) tiene que
  narrarse como «el Enano»/«la Elfa» (sin duplicar la clase), en los dos modos (informe y
  relato).
- Un héroe **con nombre propio** sigue narrándose «Háfir el Enano» (el test que ya existe,
  sin tocar, más uno equivalente en el modo informe si no lo hay).

## Prohibido

- Tocar las plantillas de `frases.ts`: el defecto no está ahí.
- Cambiar el formato «NombrePropio el Clase» que ya está en verde.
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md`. En el mensaje de cierre, pega un fragmento del
diario con un héroe sin nombre propio, para que Juan Luis vea el «antes» y el «después».
