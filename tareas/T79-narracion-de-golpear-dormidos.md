# T79 · Un monstruo dormido no grita de dolor

**Precondición:** ninguna. **No a la vez que T50, T66, T71, T75, T76, T78** si alguna
volviera a estar viva (`reducer.ts`, `types.ts`) — hoy todas LISTA.
**Banda de modelo:** MEDIO — acotado, con tests; la parte de qué más cambia mecánicamente
al atacar a un dormido es una pregunta para Juan Luis, no una decisión de esta ficha.
**Duración esperada:** 2 h · **Encadenable con:** T80, T81 (las tres MEDIO, cortas, sin
ficheros en común entre sí).
**Ficheros que toca:** `src/engine/types.ts` (campo nuevo en los eventos `ataque` y
`danoDeHechizo`), `src/engine/reducer.ts`, `src/narrator/relato.ts`, `src/narrator/frases.ts`,
`tests/hechizos.test.ts` o `tests/narrator.test.ts`.
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Lo que pidió Juan Luis

El 2026-09-10, jugando: «a veces los monstruos dormidos gritan de dolor según el narrador,
aunque no debería ser posible si están dormidos. Piensa qué otras cosas no pueden hacer
cuando están dormidos.»

## Dónde está, comprobado leyendo el código

El modo relato (`src/narrator/relato.ts:133-142`, caso `"ataque"`) elige el banco de frases
solo mirando `ev.dano`: `F.ATAQUE_FALLA` si es 0, si no `F.ATAQUE_MATA` o `F.ATAQUE_HIERE`
según si el golpe es mortal. `F.ATAQUE_HIERE` (`frases.ts:64` y alrededor) incluye «{Sujeto}
golpea {objeto} y le arranca un grito de dolor», que no distingue si el objetivo estaba
`dormido` en el momento del golpe. Lo mismo le pasa a `F.DANO_HECHIZO_HIERE`
(`frases.ts:229-230`, «le arranca un grito de dolor» / «el dolor es evidente») para el daño
de hechizo.

**El estado final no sirve para saberlo si el golpe fue mortal**: desde T78, `aplicarDano`
pone `dormido: false` en cuanto una figura llega a `cuerpo: 0`, así que mirar
`e.monstruos.find(...).dormido` en el narrador (que recibe el estado **después** de
aplicarse el evento) ya no distingue «murió despierto» de «murió dormido». Hace falta que
el propio evento lleve el dato de si el objetivo estaba dormido **antes** del golpe.

## Qué hay que hacer

1. **En `types.ts`**: añadir un campo opcional `objetivoDormido?: boolean` a los eventos
   `ataque` y `danoDeHechizo` (opcional porque los héroes no tienen `dormido`, T50).
2. **En `reducer.ts`**: en el punto donde se construyen esos eventos (los llamadores de
   `aplicarDano` listados en la ficha de T78), leer `dormido` del objetivo **antes** de
   llamar a `aplicarDano` y ponerlo en el evento.
3. **En `relato.ts`**: si `ev.objetivoDormido` es verdad, usar un banco de frases distinto
   —no el de dolor— tanto si sobrevive («sigue dormido, sin enterarse del golpe», algo que
   no implique que note nada) como si muere («muere sin llegar a despertar», nunca «grita»).
   Necesita dos bancos nuevos en `frases.ts` (o una rama dentro de los existentes) con el
   mismo criterio narrativo que ya usan `ATAQUE_MATA`/`ATAQUE_HIERE`.
4. **El informe (`local.ts`) no hace falta tocarlo**: ya es aséptico («X puntos de cuerpo»,
   sin gritos ni reacciones), el problema es solo del relato.
5. **No decidas mecánica nueva.** La ficha solo pide arreglar la narración. Si al leer el
   código te preguntas si atacar a un dormido debería tener alguna ventaja (más daño, sin
   tirada de defensa — así lo trata el reglamento original en varias versiones de la caja,
   pero **no está confirmado que esta aplicación lo implemente ni que Juan Luis lo quiera**),
   escríbelo como pregunta abierta en la terminada y en `autorizaciones.md`, y no lo toques
   sin su firma. Esta ficha es solo narración.

## Trampas conocidas

- **Los héroes no tienen `dormido`** (T50): el campo es opcional y solo se rellena para
  monstruos.
- **El estado que recibe el narrador es el de después del evento** (T78 ya lo dejó anotado
  para este mismo caso): no hay atajo, el dato tiene que viajar en el propio evento.
- **`local.ts` (el informe) ya es aséptico**: no repitas ahí ningún cambio de tono, es el
  modo que no lo necesita.

## Tests que hay que añadir

En `tests/hechizos.test.ts` o `tests/narrator.test.ts`: un monstruo dormido, golpeado sin
matarlo (`ev.objetivoDormido` a `true`, banco sin dolor) y otro golpeado a muerte estando
dormido (banco de «muere sin despertar», nunca el de gritar). Y el caso contrario, despierto,
para comprobar que no cambia nada de lo que ya había.

## Prohibido

- Cambiar cualquier regla de combate (daño, tirada de defensa) contra un dormido sin firma
  de Juan Luis en `autorizaciones.md`.
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md`.
