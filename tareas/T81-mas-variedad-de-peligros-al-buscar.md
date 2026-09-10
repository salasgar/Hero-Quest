# T81 · Más variedad de peligros al buscar tesoro

**Precondición:** ninguna. **No a la vez que T54, T53, T50, T38** si alguna volviera a
estar viva (`treasure.ts`, `reducer.ts`, `simular.ts`) — hoy todas LISTA.
**Banda de modelo:** MEDIO — contenido acotado, sin regla nueva: mismas clases de efecto
que ya existen, solo más cartas.
**Duración esperada:** 1 h · **Encadenable con:** T79, T80 (las tres MEDIO, cortas, sin
ficheros en común entre sí).
**Ficheros que toca:** `src/data/treasure.ts`, `public/` (las cartas imprimibles, si las
genera algo automático — comprueba `imprimibles/` de T54), `tests/quest.test.ts` (los
números que comprueba `repartoDeLaBaraja`).
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Lo que pidió Juan Luis

El 2026-09-10, jugando: «que no salga siempre que buscas tesoro y te haces daño lo de
“Telaraña”, crea otras posibilidades de daño.»

## Lo que hay hoy, comprobado leyendo el código

`src/data/treasure.ts` tiene exactamente **dos** cartas de clase `"peligro"` en toda la
baraja: `gas` (Gas venenoso, 1 punto) y `telarana` (Telaraña, 1 punto), una copia cada una,
dentro del bloque «lo que sale mal» (6 cartas en total con `errGoblin`/`errOrco`). Con solo
dos cartas de daño en un mazo de 28, no es raro que un puñado de partidas reales repita la
misma: no hay bug en el barajo (`barajar()` en `partida.ts` mezcla con la semilla de la
partida y `buscarTesoro` en `reducer.ts:964` roba sin reposición del mazo ya mezclado), es
sencillamente poca variedad.

## Qué hay que hacer

1. **Añade dos o tres cartas nuevas de clase `"peligro"`** en `src/data/treasure.ts`, junto
   a `gas` y `telarana`, con `dano: 1` cada una (la misma cifra que las dos que ya hay: «una
   cuarta parte de las cartas son malas… ninguna es demoledora», comentario de cabecera del
   fichero — no subas el daño sin que te lo pida). Dales un nombre y un texto de una frase
   distintos entre sí y de los dos que ya existen (ideas de andar por casa, ajusta a tu
   gusto: una viga que cae, una esquirla de piedra, un pinchazo de una aguja oculta, un
   mordisco de algo que no llegas a ver) — cítalo como invención propia en el commit, no
   hace falta fuente del reglamento porque **ya es una regla de la casa existente** (T54
   fijó las cartas de tesoro fuera del original) y esta ficha solo añade variedad dentro de
   la misma clase de efecto que ya aprobó Juan Luis.
2. **Comprueba `tests/quest.test.ts`** (línea ~378-381): `repartoDeLaBaraja()` exige que la
   proporción de cartas «malas» quede entre el 20 % y el 32 % del total. Con la baraja de
   hoy (28 cartas, 6 malas, 21,4 %) añadir 2-3 cartas de `peligro` (1 copia cada una) la
   deja en 8-9 sobre 30-31 (26-29 %): dentro del rango, pero **hazlo correr** y no lo des
   por hecho a ojo.
3. **`TOTAL_CARTAS` y `MAZO_COMPLETO` se derivan solas** de `BARAJA_TESOROS`: no hay que
   tocar nada más que la lista.
4. **Si `public/` tiene las cartas imprimibles generadas desde este fichero** (mira lo que
   dejó T54 en `imprimibles/`), regenera las que falten; si es un documento a mano y no
   generado, dilo en la terminada y no lo toques sin más indicación.

## Trampas conocidas

- **No subas el número de copias de `gas`/`telarana` ni el daño de ninguna**: el pedido es
  variedad, no más peligro. Mantén `dano: 1` y `copias: 1` en las nuevas, igual que las dos
  que ya había.
- **`repartoDeLaBaraja()` es el único sitio que fija el rango 20-32 %**: si tus cartas
  nuevas lo sacan de rango, quita una en vez de tocar el rango del test —el rango es una
  decisión de diseño de T54 pensada para niños, no un número que ajustar a lo que salga—.

## Tests que hay que añadir

Ninguno nuevo si `tests/quest.test.ts` ya cubre proporciones y totales derivados; solo
comprobar que sigue en verde con la baraja ampliada.

## Prohibido

- Subir el daño de cualquier carta de `"peligro"` por encima de 1 sin pedirlo Juan Luis.
- Sacar la proporción de cartas malas fuera del 20-32 % que ya fijó T54.
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md`.
