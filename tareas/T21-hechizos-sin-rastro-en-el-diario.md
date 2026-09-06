# T21 · Siete hechizos de doce se lanzan y no dejan rastro

**Precondición:** ninguna. Toca `types.ts`, **`reducer.ts`** y `narrator/local.ts`: mira el
candado de ficheros en `_ESTADO.md` antes de empezar. **Se solapa con T20**, que añade
eventos en los mismos tres ficheros: las dos no pueden ir a la vez.
**Banda de modelo:** MEDIO — el arreglo es mecánico; lo que pide criterio es qué se cuenta
cuando un hechizo **no** hace efecto, que hoy no se distingue de cuando sí lo hace.
**Ficheros que bloquea:** `src/engine/types.ts`, **`src/engine/reducer.ts`**,
`src/narrator/local.ts`, `tests/`.
**Duración esperada:** 2 h · **Encadenable con:** — · **Ficheros que toca:** los de
«Ficheros que bloquea», arriba.
(Líneas añadidas en la migración del reparto del 2026-09-06; la tarea ya estaba LISTA,
`hechos/terminadas/21--*`, y la Tempestad quedó firmada el 2026-09-06 en `autorizaciones.md`.
El cierre es el de `proyecto.md`, con terminada en `hechos/`.)
Lee `_COMUN.md` primero.

## Lo que contó Juan Luis

El 5 de septiembre de 2026: «El mago ha lanzado un hechizo contra un orco. El orco no se ha
muerto y el diario no ha dicho qué es lo que ha pasado.»

## Medido, no supuesto

Con el mago dentro de la sala, un orco a la vista y los hechizos en la mano, lanzando uno a
uno y mirando qué eventos salen del motor y qué frases devuelve el narrador:

```
Tempestad sobre el orco -> «Mago lanza Tempestad contra Orco.»   eventos: hechizoLanzado
                           (y el orco queda con pierdeTurno=true, sin una palabra)
Sueño sobre el orco     -> «Mago lanza Sueño contra Orco.»       eventos: hechizoLanzado
                           (y el orco queda dormido=true, sin una palabra)
Bola de fuego           -> «Mago lanza Bola de fuego contra Orco. | Bola de fuego alcanza a
                            Orco: 2 puntos de cuerpo. | Orco se desploma.»
```

El motor **hace** lo que tiene que hacer. Lo que no hace es contarlo: solo cuatro de las
once ramas de `lanzarHechizo` ([`reducer.ts:717`](../src/engine/reducer.ts#L717)) emiten un
segundo evento. El resultado, hechizo por hechizo:

| Deja rastro | No deja rastro |
|---|---|
| Bola de fuego, Fuego de la ira (`danoConSalvacion`) | Viento veloz (`movimientoExtra`) |
| Genio (`invocar`) | Tempestad (`perderTurno`) |
| Agua curativa, Curación (`curar`) **solo si el objetivo había perdido cuerpo** | Sueño (`dormir`) |
| | Velo de niebla (`atravesarFiguras`) |
| | Piel de piedra (`bonusDefensa`) |
| | Atravesar la roca (`atravesarMuros`) |
| | Coraje (`bonusAtaque`) |

Son **siete de doce** mudos, más un octavo caso: curar a quien está a tope de cuerpo gasta
la carta, no emite `curacion` —porque `puntos` sale 0— y en el diario queda igual que una
curación que funcionó.

**Y hay algo peor que el silencio: el fallo silencioso.** El Sueño no hace nada si el
objetivo es un no muerto o si su mente supera la del lanzador
([`reducer.ts:796`](../src/engine/reducer.ts#L796)), y esos dos casos dejan **exactamente la
misma línea** que el caso en que funciona. Quien juega no tiene forma de saber si el orco se
ha dormido o no. Es, palabra por palabra, lo que contó Juan Luis.

## Cómo hacerlo

- **Un evento por desenlace, no por hechizo.** Las clases de efecto son las de
  [`spells.ts`](../src/data/spells.ts): `dormir`, `perderTurno`, `bonusAtaque`,
  `bonusDefensa`, `atravesarMuros`, `atravesarFiguras`, `movimientoExtra`. Un
  `efectoDeHechizo` con la clase, el hechizo y el objetivo cubre las siete sin siete eventos
  nuevos.
- **Y un evento para cuando no pasa nada**, del estilo
  `{ tipo: "hechizoSinEfecto", hechizo, objetivo, motivo }`, con el motivo en el dato, no en
  la frase: hoy hay tres —el no muerto, la mente más alta y la curación a quien está sano—
  y va a haber más.
- **Las frases son para la mesa, no para el registro técnico.** «El orco cabecea y se queda
  dormido», «Los no muertos no duermen: el hechizo se pierde». Que se entienda sin saber qué
  es `bonusDefensa`.
- **La carta se gasta igual aunque no haga efecto**, y eso no se toca: es la regla. Lo que
  cambia es que ahora se dice.

## Una divergencia que hay que resolver por el camino

La Tempestad está implementada como **toda la sala**: el caso `perderTurno` recorre los
monstruos y marca a los que están en la misma sala que el objetivo
([`reducer.ts:804`](../src/engine/reducer.ts#L804)). Su descripción en `spells.ts` dice «el
monstruo elegido», en singular. Una de las dos miente, y con el diario mudo no se nota
jugando.

**Compruébalo en el reglamento antes de tocar nada** —`_COMUN.md` dice cómo: la página 8 del
PDF son las páginas 14-15 del libro, las de los hechizos— y arregla el lado que esté mal:
el código o el texto de la carta. Si el reglamento no lo aclara, **no inventes**: déjalo
como está, ponlo en el registro y que lo decida Juan Luis. Lo que no vale es dejarlo sin
mirar ahora que ya se sabe.

## Trampas conocidas

- **`narrar` es un `switch` exhaustivo sobre `Evento`.** Un evento nuevo sin su caso rompe
  el `typecheck`, y así tiene que ser: es lo que impide que nazca mudo. Nada de `default`.
- **Los efectos ya se ven a medias en la hoja del héroe**, pintados con el nombre interno de
  la clase (`bonusDefensa +1`, en [`HeroSheet.tsx`](../src/ui/HeroSheet.tsx)). Un monstruo no
  tiene hoja: dormido o con el turno perdido, no se ve por ninguna parte. Contarlo en el
  diario es el mínimo; si además lo marcas en el tablero, que sea en `BoardMirror.tsx` y
  **mira el candado antes**.
- **Un hechizo, una tanda de eventos.** El primero sigue siendo `hechizoLanzado`; lo nuevo va
  detrás. No cambies el orden: el narrador numera con el índice para elegir variantes de
  frase.
- **`repetir` rehace la partida entera** para el deshacer: los eventos nuevos tienen que
  salir iguales al repetir.

## Tests que hay que añadir

Ampliando `tests/hechizos.test.ts`, o en uno propio:

- Cada una de las siete clases mudas emite hoy un evento y **una frase no vacía**.
- Sueño sobre un no muerto: evento de «sin efecto», y el monstruo sigue despierto.
- Sueño sobre un monstruo con la mente más alta que el lanzador: lo mismo.
- Curación sobre un héroe intacto: evento de «sin efecto», y la carta gastada.
- Tempestad: el test fija **a quién alcanza**, sea a uno o a la sala entera, con la cita del
  reglamento al lado.
- La receta de T1: revirtiendo los eventos nuevos, los tests fallan. Y ojo con el aviso de
  `_COMUN.md`: dentro de una sala `puedeVer` da por visto todo, así que monta los casos con
  `salasReveladas` puesto o te los rechazará por línea de visión.

## Prohibido

- Cambiar qué hace un hechizo para que sea más fácil de contar.
- Copiar el texto de las cartas dentro del narrador: la descripción está en `spells.ts` y
  ahí se queda.
- Inventar una regla que el reglamento no diga (regla de `_COMUN.md`).

## Al terminar

Commit en `main`, push y línea en el registro de `_ESTADO.md`: qué eventos hay ahora, qué
frase deja cada uno y **cómo acabó la divergencia de la Tempestad**. Y lanza los doce
hechizos en una partida de verdad antes de darlo por bueno: los doce tienen que dejar algo
escrito, y los que fallan tienen que decir por qué.
