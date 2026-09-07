# T61 · Jugar una partida y revisar el tono del informe y del relato

**Precondición:** ninguna. **No a la vez que T60** (comparten `narrator/local.ts`,
`narrator/relato.ts` y los tests de narrador). **No choca con T37 ni T45.**
**Banda de modelo:** MEDIO — no hay reglas del juego que implementar; es criterio de
redacción y de oído (que el informe suene a informe, que el relato suene a relato), sobre
un sistema ya diseñado y firmado (frases prefabricadas, sin modelo de lenguaje).
**Duración esperada:** 3 h · **Encadenable con:** — (comparte fichero con T60; de una en
una).
**Ficheros que toca:** `src/narrator/local.ts` (el informe), `src/narrator/relato.ts` y
`src/narrator/frases.ts` (el relato), `src/data/quests/calabozo.ts` (el campo `r` de texto
de sala, si resulta que el problema está ahí y no en cómo lo usa el informe),
`tests/narrador.test.ts`, `tests/narrator.test.ts`.
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Lo que pidió Juan Luis

El 2026-09-07:

> Jugar una partida de prueba y revisar el informe y el relato para que no haya errores
> gramaticales, para que el informe suene como un informe y el relato suene como un relato.

Con un ejemplo del informe:

> "El techo gotea. Cada gota suena como un paso a tu espalda. Os están esperando: el orco
> Brúmgar."
>
> Eso no suena a informe, porque da información innecesaria. El informe debe ahorrarse
> epítetos, metáforas e información innecesaria. Podría simplemente informar de que han
> encontrado a Brúmgar, el orco, en tal habitación, sin dar más detalles. Simplemente se
> trata de dar la información necesaria para que alguien pudiera seguir el desarrollo de la
> partida leyendo solo el informe.

## Diagnóstico del ejemplo, ya medido

El ejemplo exacto sale de `src/narrator/local.ts:118-123`, el caso `salaRevelada` del modo
**informe**:

```ts
case "salaRevelada": {
  const base = ev.texto ?? "La sala se abre ante vosotros.";
  if (ev.monstruos.length === 0) return `${base} No hay nadie.`;
  const quienes = ev.monstruos.map((m) => nombreDe(e, m)).join(", ");
  return `${base} Os están esperando: ${quienes}.`;
}
```

`ev.texto` es el texto de ambientación de la sala, que sale del campo `r` de
`src/data/quests/calabozo.ts` (p. ej. la línea 50: `r: "El techo gotea. Cada gota suena
como un paso a tu espalda."`). Ese texto está pensado para el **relato**
(`src/narrator/relato.ts:121-126`, caso `salaRevelada`, donde `base` entra en las
plantillas `F.SALA_VACIA` / `F.SALA_CON_MONSTRUOS` de `frases.ts`, que es justo su sitio) y
el informe lo copia tal cual, sin adaptarlo. Es el patrón que hay que buscar en **todo**
`local.ts`, no solo aquí: cualquier evento cuyo texto lleve ambientación en vez de solo el
hecho.

## Qué es «informe» y qué es «relato», para no perder el rumbo

- **Informe** (`local.ts`, firmado el 2026-09-06 con el ejemplo de Juan Luis «2 calaveras,
  1 escudo negro»): frases cortas, sin epítetos ni metáforas, con el dato necesario para
  seguir la partida leyendo solo el diario (quién, qué acción, qué resultado numérico). Es
  el modo por defecto (`MasterLog.tsx:17-19`).
- **Relato** (`relato.ts` + `frases.ts`, firmado el 2026-09-06): la misma partida contada
  como libro de aventuras, con variantes elegidas de forma determinista (nunca
  `Math.random()`, nunca un modelo de lenguaje: **eso no se toca**, está firmado en
  `autorizaciones.md`). Aquí sí caben epítetos y ambientación.

Los dos comparten alguna fuente de texto (el campo `r` de las salas, algunos nombres de
cartas de tesoro con su `texto` de sabor) porque el motor solo genera un evento con un
dato; el reparto de «esto es informe, esto es relato» lo decide cada narrador al consumir
ese dato, no el motor. **El arreglo va en `local.ts` y en `relato.ts`, no en el evento ni
en `calabozo.ts`**, salvo que compruebes que un texto de sala está escrito ya en tono de
informe por error (entonces sí tocaría `calabozo.ts`).

## Antes de empezar: mira si ya está hecho

```sh
grep -n "ev.texto\|ev\.r\b" src/narrator/local.ts
```

## Qué hay que hacer

1. **Juega una partida de prueba** en la página publicada
   (<https://salasgar.github.io/Hero-Quest/>) o en local (`npm run dev`), en modo
   **informe** primero: mueve, ataca, abre puertas, busca tesoro y trampas, hasta generar
   una tanda de eventos variada. Lee el diario entero. Cambia a modo **relato** con las
   mismas acciones (recarga y repite, o cambia el interruptor a mitad) y léelo también.
   Si prefieres no jugar a mano, `npm run repetir partidas/<fichero>.json` (T57) reproduce
   una partida guardada e imprime el informe paso a paso —hoy solo llama al narrador de
   `local.ts` (línea 34); si lo usas para el relato, cambia esa importación a
   `../src/narrator/relato` en tu copia de trabajo, sin comitear ese cambio salvo que
   decidas que el script debería admitir los dos modos (en ese caso, dilo en el cierre).
2. **En el informe**: repasa `local.ts` evento por evento (no solo `salaRevelada`) buscando
   epítetos, metáforas o ambientación que no aporte al seguimiento de la partida.
   Candidatos a mirar con lupa, además del ya diagnosticado: los mensajes con exclamación
   («¡El suelo se hunde!», «¡No estabais solos!») y las trampas (líneas 140-153), que hoy
   mezclan el hecho con la puesta en escena. Decide, evento por evento, qué es dato
   necesario y qué es decoración, y dónde el límite dificulta más de la cuenta seguir la
   partida si se recorta (algunos eventos SÍ necesitan una frase completa para no sonar a
   telegrama ilegible: usa tu criterio, no una regla mecánica de «una frase, sin adjetivos,
   siempre»).
3. **En el relato**: revisa la concordancia y la gramática de las plantillas de
   `frases.ts` y de las funciones que las alimentan (`relato.ts`). Presta atención a
   singular/plural cuando `varios` decide la forma verbal (`efectoDeHechizo` en los dos
   ficheros tiene esa lógica repetida) y a que el artículo y el género cuadren con
   `EPITETOS_ESPECIE` (`relato.ts:29-48`) en cada especie. Si encuentras una frase que
   suene mal leída en voz alta (el objetivo declarado de este proyecto: código y estilo
   pensados para leerse a niños en la mesa), corrígela.
4. **Anota en la terminada, con ejemplos concretos**, qué frases cambiaste y por qué —el
   antes y el después—, para que Juan Luis pueda revisar el criterio sin tener que jugar
   otra partida él mismo.

## Trampas conocidas

- **El diseño de `relato.ts` está firmado: frases prefabricadas, variante por índice
  determinista, nunca `Math.random()` ni un modelo de lenguaje** (`autorizaciones.md`,
  firma del 2026-09-06). Se pueden reescribir o añadir frases; no se puede cambiar el
  mecanismo.
- **`variante()` y `rellenar()` (de `frases.ts`) son del relato; el informe tiene su propio
  `elegir()`** (`local.ts:18-19`), más simple, para sus dos únicos bancos de variantes
  (`fallos` en el ataque, `monstruoSinActuar`). No confundas los dos sistemas ni les cambies
  la firma.
- **`ev.texto` no es exclusivo de `salaRevelada`**: `cartaDeTesoro` también lleva un
  `ev.texto` de sabor (línea 183 de `local.ts`, línea 199 de `relato.ts`) que en el
  ejemplo de Juan Luis del informe da «Poción de fuerza. Sabe a hierro. Suma 2 dados a tu
  siguiente ataque.» — aquí el texto de la carta SÍ es información jugable (el efecto de
  la poción), así que no es el mismo caso que el de la sala: revísalo con el mismo
  criterio (¿es dato o es sabor?) antes de tocarlo.
- **No cuentes lo mismo dos veces entre informe y relato**: son dos lecturas de los mismos
  eventos, cada una con su tono; no hace falta que digan lo mismo con las mismas palabras.

## Tests que hay que añadir

Si cambias el texto de algún evento, revisa qué tests de `tests/narrador.test.ts` (relato)
y `tests/narrator.test.ts` (informe) afirman ese texto literal con `toBe` o `toMatch`, y
actualízalos. No hace falta un test nuevo por cada frase retocada; sí uno si añades un caso
que hoy no distingue nada (p. ej., si separas «dato» de «sabor» en algún evento con una
condición nueva).

## Prohibido

- Cambiar el mecanismo del relato (frases prefabricadas, variante determinista): está
  firmado.
- Meter un modelo de lenguaje o `Math.random()` en cualquiera de los dos narradores.
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md`. En el mensaje de cierre, pega un fragmento del
informe y otro del relato de la misma tanda de eventos (antes y después de tus cambios),
para que Juan Luis oiga la diferencia sin tener que jugar él mismo.
