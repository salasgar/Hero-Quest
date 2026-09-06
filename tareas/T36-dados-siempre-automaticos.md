# T36 · Todos los dados los tira la aplicación

**Precondición:** ninguna. La decisión está firmada en `autorizaciones.md` (2026-09-06).
**Banda de modelo:** MEDIO — el motor ya tira todos los dados si no se le pasan; esto es
quitar diálogos y enseñar caras, con criterio de pantalla y sin decidir reglas.
**Duración esperada:** 2 h · **Encadenable con:** 22 (misma banda, corta; comparte
`TurnPanel.tsx`: seguidas, no en paralelo).
**Ficheros que toca:** `src/ui/useAccionesDeTurno.ts`, `src/ui/DiceInput.tsx`,
`src/ui/VistaDeHeroe.tsx`, `src/ui/Juego.tsx`, `src/ui/TurnPanel.tsx`, `tests/`. **No toca
`src/engine/`.** Comparte `TurnPanel.tsx` y `Juego.tsx` con T11 y T22: no a la vez.
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Lo que pidió Juan Luis

El 2026-09-06, después de que se le ofrecieran tres modos (manual, automático y mixto):

> He pensado que lo más probable es que juegue siempre en la modalidad automática. La
> modalidad manual, de momento, que la aplicación no la ofrezca. Que se ejecute siempre en
> modo automático para que no haya que lanzar dados reales y los jugadores nos centremos
> únicamente en la estrategia a seguir. Que se automatice el resto del proceso.

Y una libertad de diseño que no es de esta tarea pero conviene dejar escrita: **se pueden
usar dados de más o menos de seis caras** cuando se diseñen capacidades de héroes,
monstruos o hechizos. Hoy `dice.ts` solo sabe de dados de combate y de D6; quien necesite
otro dado lo añade ahí cuando lo necesite, con su test.

## Lo que hay hoy, medido

- **El motor ya lo hace.** Toda acción con dados admite el campo `dados` o no; sin él, tira
  el generador que vive dentro del estado (T33, `db96bf2`). Reproducible, el deshacer sale
  exacto y las dos casas en red ven lo mismo.
- **La mesa tira a mano.** `useAccionesDeTurno.ts` recibe `dadosPropios: "siempreYo" |
  "aEleccion"`; `Juego.tsx` pasa `siempreYo`, así que `quienTira` es `"yo"` y se abren los
  diálogos de `DiceInput` para movimiento, ataque y defensa.
- **Quien juega desde casa elige.** `VistaDeHeroe.tsx` pasa `aEleccion` y la preferencia
  se guarda en `localStorage` (`usePreferenciaDeDados`, en `DiceInput.tsx`).
- **Cuando tira la aplicación ya se enseñan las caras**, no solo el total (`tirarYEnsenar`,
  `CaraDeDado`). Eso se queda: es lo que permite a quien no ve los dados comprobar la tirada.

## Antes de empezar: mira si ya está hecho

```sh
grep -n 'siempreYo\|usePreferenciaDeDados' src/ui/*.ts*
```

Si `siempreYo` ya no existe y nadie usa la preferencia, está hecha.

## Qué hay que hacer

1. `quienTira` pasa a ser siempre `"laApp"`: desaparecen `dadosPropios`, la preferencia
   guardada y el selector de la pantalla remota. Borra el código muerto que quede; no lo
   dejes «por si acaso» detrás de una constante.
2. Los diálogos de teclear dados (`PeticionDados`, `componerDados`) dejan de abrirse en la
   partida. `DiceInput.tsx` conserva lo que sigue en uso: `CaraDeDado`, `NOMBRE_DE_CARA` y
   la ventana que **enseña** la tirada. Si al final no queda nada de la petición, el
   fichero se queda con el nombre y con lo que enseña; renombrarlo no aporta.
3. La tirada tiene que **verse** en la mesa: las caras (o los dos D6 del movimiento) un
   instante antes de aplicarse, con tiempo para leerlas. Ya existe `tirarYEnsenar`; mira
   si su ritmo vale con niños delante y ajústalo. `⇧T` seguía tirando a ciegas desde
   antes de T33 y ya enseña las caras; que siga.
4. «Que se automatice el resto del proceso»: revisa qué otras cosas pide hoy la mesa a
   mano en `Juego.tsx` que no sean una decisión de juego (confirmaciones que solo
   repiten lo que el motor ya sabe). Lo que sea una decisión —a quién atacar, dónde
   moverse— se queda. Lo que quites, dilo en la terminada.

## Trampas conocidas

- **Encargo heredado de la 42 y la 11 (2026-09-06):** `nombreDeFigura` en
  `useAccionesDeTurno.ts` sigue diciendo «Orco» a secas, así que el diario dice «Górbak» y
  el anuncio de la jugada «Orco» en la misma pantalla. Es una línea, y el parche está
  copiado en las terminadas de las dos (`hechos/terminadas/42--*` y `11--*`); se arregla
  aquí porque este fichero es de esta tarea.
- **Los componentes de React no se prueban** (`vite.config.ts`: `environment: "node"`).
  Prueba el dato: que la acción que sale del hook no lleva `dados`, y que el motor tira.
- **La preferencia en `localStorage` es por navegador**: T33 avisó de que probar las dos
  pantallas en el mismo navegador contaminaba a la mesa. Al quitar la preferencia, ese
  problema desaparece; comprueba que no queda ninguna lectura de `localStorage` de dados.
- **`T32` dejó `npm run relevo` y `npm run dev`** para probar con dos ventanas
  (`?relevo=http://localhost:8787`). Úsalo: la pantalla remota es donde más se nota.

## Tests que hay que añadir

- La acción de atacar, defender y mover que despacha el hook no lleva `dados` en ningún
  caso, y el estado resultante es el que da el motor con su generador (compáralo con
  `aplicarAccion` directo sobre el mismo estado y la misma acción).
- Que un test viejo que dependiera de `siempreYo` se corrija diciendo por qué, no se borre.

## Prohibido

- Tocar `src/engine/`: no hay regla nueva, y `dice.ts` no cambia en esta tarea.
- Sustituir el generador del estado por `Math.random()`: rompe el deshacer, la
  reproducibilidad y la partida en red a la vez y en silencio (hay un test de T33 que lo fija).
- Editar código con `sed -i` o heredocs: la disciplina del repositorio es `Edit`, por el
  hook de candados (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md` (pruebas en verde → commit del código, solo estos
ficheros → `hechos/terminadas/36--<sid>.md` con el hash → `CERRADA` en tu reclamo →
regenerar `_ESTADO.md` → un commit con rutas explícitas → `push`). Vuelca aquí abajo lo que
hayas aprendido, y dile a Juan Luis qué tareas quedan libres con la frase de arranque de
`proyecto.md`, con la banda puesta.
