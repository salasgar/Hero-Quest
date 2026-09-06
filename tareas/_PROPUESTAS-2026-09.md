# Qué más se puede mejorar — propuestas para que Juan Luis elija

Salida de la **T48**, escrita el 2026-09-06 por la sesión `s-20260906T174643-a6f05c61`.
Es una lista para elegir, no un reparto: convertir una propuesta en tarea es copiarla a
una ficha de `tareas/`, con el número siguiente que toque (hoy, T59 en adelante). Ninguna
propuesta está empezada y esta sesión no ha tocado código.

**Cómo se ha hecho.** Leídos `TRASPASO.md`, el registro de finalizaciones del tablón antiguo,
`autorizaciones.md`, las 19 fichas pendientes (T22, T36–T39, T44–T47, T49–T58) y el código
de motor, IA, narrador y pantalla. En este entorno no hay navegador, así que la partida
«jugada» es una partida entera sobre el motor real con un guion propio: héroes que abren,
pegan, buscan tesoro, buscan trampas y lanzan hechizos (curan, duermen, queman), Zargon con
`accionDeZargon`; el diario se volcó con `narrar` tal como lo pinta `MasterLog`. Semilla 7 en
`normal` y semillas 1–5 en `astuto`. Todo lo que se afirma del código se ha comprobado en el
código o con una sonda sobre `aplicarAccion`; los dos hallazgos gordos (1 y 3) salen de esas
sondas y no de la lectura. Línea base al empezar: 474 tests en 34 ficheros, en verde.

**Qué no está aquí porque ya tiene tarea.** De la lista que traía la ficha: el tesoro
especial de misión y los objetivos nuevos son **T53** (el pergamino; `matarA` con nombre ya
se puede escribir hoy, lo dijo T42); pociones que se guardan y equipo del tesoro, **T54**;
salas vacías, **T55**; la Tempestad sobre un héroe y `pierdeTurno` en `Heroe`, **T50** y la
firma pendiente; el selector de dificultad en pantalla **ya existe** desde T11 (Fácil /
Normal / Difícil); las dos líneas desfasadas de `_COMUN.md` **ya están corregidas** (lo hizo
la sesión coordinadora del 2026-09-06 al escribir T51–T58); el aviso de trampa en pantalla,
**T52**; la trampa que no salta, **T51**; los nombres de monstruo en el anuncio de la jugada,
**T36**.

Orden: por lo que se nota en la mesa con niños delante, de más a menos.

---

## 1. Un héroe caído sigue jugando

- **Qué se nota jugando hoy.** Cuando a un héroe le bajan el cuerpo a 0, el tablero deja
  de pintarlo y la hoja dice «caído», pero **le sigue llegando su turno**: el panel pone
  «Turno de Conan», el motor le acepta tirar movimiento y moverse (sonda: `tirarMovimiento`
  aceptada, 21 casillas verdes alrededor de una figura que no se ve, `mover` aceptada), y
  en la ronda siguiente vuelve a tocarle. En dos de las cinco partidas en `astuto` el mago
  murió y siguió «jugando» hasta la victoria. Con un niño al que acaban de matar el
  personaje, ver casillas verdes de un fantasma es exactamente lo que no puede pasar.
- **Qué cambiaría.** `avanzarActor` salta a los héroes con cuerpo 0; toda acción de un
  héroe caído se rechaza con motivo («Conan ha caído»); `comprobarDesenlace` ya cuenta
  solo a los vivos y no cambia. Con la cita del reglamento (el apartado de puntos de
  cuerpo: el héroe muerto sale del tablero) en el comentario, y un test por cada cosa:
  se salta su turno, no tira, no se mueve, y con todos caídos la partida acaba (eso ya
  está). Mirar de paso si el reglamento dice que otro héroe recoge su equipo al pasar por
  su casilla: si lo dice, se apunta como tarea aparte (depende de la mochila de T54).
- **Ficheros.** `src/engine/reducer.ts` (`avanzarActor`, la guarda común de las acciones
  de héroe), `tests/reducer.test.ts`, `tests/integracion.test.ts` (una invariante nueva:
  la figura activa nunca tiene cuerpo 0). Va en la **cola de `reducer.ts`**: después de
  51 → 53 → 54 y antes o después de 50, de una en una.
- **Banda y duración.** MEDIO, 1 h. Es una regla, pero no ambigua.
- **Qué decide Juan Luis.** Nada. Solo si quiere además que un héroe caído pueda
  «volver» de alguna forma (poción sobre un caído, por ejemplo): hoy `Curación` sobre un
  caído se rechaza por falta de línea de visión, no por estar muerto, y conviene que la
  regla quede dicha en un sitio.

## 2. Dos botones que destruyen la partida sin avisar, y «Jugar otra vez» repite la misma

- **Qué se nota jugando hoy.** «Cambiar héroes», en la barra de arriba, desmonta la
  partida en el acto: sin pregunta, sin vuelta atrás. En una tableta, con niños, es un
  toque. Y «Jugar otra vez» al terminar vuelve al **mismo estado inicial con la misma
  semilla**: mismo orden del mazo de tesoros, mismos nombres de monstruo y, en cuanto
  entre T36 (todos los dados los tira la aplicación), **las mismas tiradas**. La segunda
  partida es una repetición exacta de la primera si se hacen las mismas jugadas.
- **Qué cambiaría.** Confirmación antes de salir de una partida empezada (y de
  «Jugar otra vez»: es lo mismo). `reiniciar` con semilla nueva: basta con que `App` suba
  la clave de `Juego` como hace al cambiar de grupo, y `reiniciar` de `usePartida` deja de
  hacer falta en local. Cuando T57 guarde el registro en `localStorage`, «salir» deja de
  ser irreversible del todo, pero la pregunta sigue sobrando menos que el susto.
- **Ficheros.** `src/App.tsx` (T57 también lo toca: después), `src/ui/Juego.tsx` (cola
  52 → 36 → 44 → 45), `src/ui/usePartida.ts` (T57).
- **Banda y duración.** BAJO, 30 min.
- **Qué decide Juan Luis.** Nada.

## 3. Desarmar trampas no existe en la pantalla

- **Qué se nota jugando hoy.** El enano «desarma trampas sin riesgo gracias a sus
  herramientas», lo dice su carta y lo dice la pantalla de elección. En la partida no hay
  ningún botón para hacerlo: el motor tiene la acción `desarmarTrampa` desde la Fase 2,
  con tirada para quien no es enano, evento y frase en el diario («La trampa queda
  inutilizada»), y **ninguna pantalla la despacha**. Quien busca trampas ve el ⚠ y no
  puede hacer nada con él salvo rodearlo. Es la única acción del motor sin botón.
- **Qué cambiaría.** Un selector `trampasDesarmables(e)` en `selectors.ts` (descubierta,
  no gastada, al alcance según diga el reglamento) y un botón «Desarmar trampa» en el
  panel, con su tecla, por el mismo camino que «Abrir puerta». Y una guarda que hoy
  falta en el motor: `desarmarTrampa` **no comprueba dónde está el héroe**, acepta
  cualquier trampa del tablero desde cualquier casilla. Leer las páginas 16-17 del
  reglamento (PDF pág. 9, `_COMUN.md` dice cómo) para la condición de alcance y citarla.
- **Ficheros.** `src/engine/selectors.ts`, `src/engine/reducer.ts` (la guarda: cola del
  reductor), `src/ui/TurnPanel.tsx`, `src/ui/useAccionesDeTurno.ts` (cola 52 → 36 → 22),
  `tests/reducer.test.ts`.
- **Banda y duración.** MEDIO, 1,5 h.
- **Qué decide Juan Luis.** Nada, salvo que el reglamento no fije el alcance: entonces
  «adyacente» como regla de la casa, firmada.

## 4. Dos clics menos por turno de héroe: tirar solo al empezar y cerrar solo al acabar

- **Qué se nota jugando hoy.** En la partida jugada, cada turno de héroe son 3,8 acciones
  de media, y dos de ellas no deciden nada: «Tirar movimiento» (con T36 la tira la
  aplicación, así que es un clic para ver un número) y «Terminar turno» cuando ya no
  queda movimiento y ya se ha actuado. Son los dos clics que más se repiten en toda la
  partida: 65 turnos, 130 clics que solo dicen «sigue».
- **Qué cambiaría.** Al entrar en el turno de un héroe, la aplicación tira el movimiento
  sola y enseña los dados (con `tirarYEnsenar`, que ya existe); cuando el héroe tiene
  movimiento 0 **y** ha actuado, el turno se cierra solo tras una pausa corta, con el
  mismo mecanismo de ritmo de T11 (`PAUSA_TRAS`). Nunca se cierra solo si queda algo que
  decidir: movimiento sin gastar o acción sin hacer. Deshacer sigue funcionando porque
  todo pasa por `ejecutar`.
- **Ficheros.** `src/ui/useAccionesDeTurno.ts`, `src/ui/useTurnoDeZargon.ts` (o un
  gemelo para el turno de héroe), `tests/turno-automatico.test.ts`. Cola 52 → 36 → 22;
  **encaja dentro de T36** («que se automatice el resto del proceso», punto 4 de su ficha)
  si esa sesión lo ve claro, y si no es tarea aparte después.
- **Banda y duración.** MEDIO, 1,5 h.
- **Qué decide Juan Luis.** Si quiere que el turno se cierre solo o prefiere pulsar
  siempre: hay mesas que usan ese clic para «¿seguro?». Y si la tirada automática al
  empezar le quita a los niños el momento de «tirar».

## 5. Guardar la partida y continuarla otro día

- **Qué se nota jugando hoy.** Una partida vive en la pestaña. Cerrarla, recargar o que la
  tableta se apague la borra. Con niños, una misión de 18 rondas (la jugada aquí) no
  siempre cabe en una tarde. Es la Fase 8 de `TRASPASO.md` y la pieza que más veces se
  ha citado como pendiente (T6, T13, T18, T37 avisan cada vez que cambian el estado).
- **Qué cambiaría.** No guardar el estado: guardar **lo que T57 ya guarda** (semilla, grupo,
  misión, lista de acciones, commit) y rehacer con `repetir`. Así el formato no depende de
  la forma del estado, que cambia con T37, T38, T53 y T54, y una acción que ya no sea
  legal tras un cambio de reglas se descarta sola en vez de romper la carga. En la
  primera pantalla, «Continuar la partida de ayer» si hay una en `localStorage`; y
  «Guardar en un fichero» / «Cargar un fichero» con el mismo JSON de T57 para la tableta
  que se cambia. La mochila de T54 y los iconos de T37 viajan solos, porque van en el
  grupo o en las acciones.
- **Ficheros.** `src/App.tsx`, `src/ui/EleccionDeHeroes.tsx` (después de T37 y T45),
  `src/ui/usePartida.ts` (después de T57), `src/ui/registroDePartida.ts` (T57),
  `tests/`. **Después de T57**, que deja hecho el 70 %.
- **Banda y duración.** MEDIO, 3 h.
- **Qué decide Juan Luis.** Si basta con «la última partida» o quiere varias con nombre;
  y si la partida en red (cuando exista el relevo) se guarda igual, que es fácil porque
  la lista vive en el servidor.

## 6. La ruta de cada movimiento, pintada en el tablero

- **Qué se nota jugando hoy.** Cuando un monstruo se mueve, la ficha salta de una casilla
  a otra y el panel dice «Se mueve» a secas (`TurnPanel.tsx`, `frase`, a propósito: «el
  tablero de cartón no tiene los números pintados»). El adulto tiene que empujar la
  miniatura y adivinar por dónde: alrededor de una mesa o entre dos héroes hay más de un
  camino. Con los héroes pasa lo mismo cuando se pulsa una casilla verde lejana: el motor
  elige la ruta (`rutaHasta`) y **puede pasar por una trampa**, y el niño no sabe por
  dónde fue.
- **Qué cambiaría.** El evento `movimiento` ya lleva `ruta`. Pintar la última ruta como
  un rastro (puntos o una línea) durante unos segundos, con la casilla de origen marcada,
  en `BoardMirror`; en la vista de casa sale igual porque es el mismo pintor. Sin
  animación de la figura: bastante trabajo tiene la mesa con la miniatura.
- **Ficheros.** `src/ui/BoardMirror.tsx` (cola 51 → 58 → 37), `src/ui/Juego.tsx`
  (pasarle los eventos nuevos, como haría T44 con los sonidos), `src/estilos.css`.
- **Banda y duración.** MEDIO, 2 h.
- **Qué decide Juan Luis.** Nada.

## 7. El diario no debería decir diez veces «avanza 1 casilla»

- **Qué se nota jugando hoy.** Con las flechas, cada casilla es una acción y una línea:
  «Gimli avanza 1 casilla» diez veces seguidas (está en el diario de la partida jugada).
  El diario cabe en 260 px y esas diez líneas se llevan por delante el ataque que acaba
  de pasar. Y como cada casilla es una acción, «Deshacer» deshace una casilla, no el
  movimiento: bien para corregir, pero sorprende.
- **Qué cambiaría.** Plegar en la narración los movimientos consecutivos del mismo actor
  en una línea («Gimli avanza 10 casillas»), sin tocar el motor ni los eventos: en
  `narrarTodos` o en `MasterLog`, por índice, para que siga siendo determinista y el
  registro de T57 siga entero. Es un requisito natural del **modo informe de T39**; si la
  39 se hace antes, va dentro; si no, es media hora aparte.
- **Ficheros.** `src/narrator/local.ts` o `src/ui/MasterLog.tsx` (los dos son de T39).
- **Banda y duración.** BAJO, 30 min (dentro de T39: nada).
- **Qué decide Juan Luis.** Nada.

## 8. Que el tablero quepa en la tableta

- **Qué se nota jugando hoy.** El tablero es un SVG de 760 × 564 px fijos (`LADO = 28`,
  sin `viewBox`), y el panel mide 460. Por debajo de 1100 px el panel se pone debajo, pero
  el tablero no encoge: en una tableta en vertical (768 px) o en un portátil pequeño se
  sale por la derecha y hay que desplazar la página para ver la mitad del calabozo. El
  README dice que se juega «desde la tableta», y la publicación en Pages (T34) existe
  para eso.
- **Qué cambiaría.** `viewBox` en el SVG y ancho al 100 % con un máximo: el tablero se
  escala a lo que haya, las coordenadas de los clics siguen valiendo (son del SVG), y
  T58 tiene que saberlo para colocar su cuadro flotante (usa `getBoundingClientRect`, que
  ya lo tiene en cuenta). Mirar también que la botonera del panel sea pulsable con el
  dedo (hoy los botones son de ratón).
- **Ficheros.** `src/ui/BoardMirror.tsx` (cola 51 → 58 → 37), `src/estilos.css`.
- **Banda y duración.** MEDIO, 1,5 h. Hay que probarlo en el trasto de verdad.
- **Qué decide Juan Luis.** En qué aparato se juega de verdad (tableta, portátil, tele
  con el Mac): la respuesta cambia si hay que optimizar para 768 o para 1366 de ancho.

## 9. Un monstruo dormido no se despierta nunca

- **Qué se nota jugando hoy.** El Sueño duerme al monstruo (`dormido: true`) y **nada lo
  despierta**: ni el paso de las rondas, ni recibir un golpe, ni nada. `avanzarActor`
  limpia `pierdeTurno` al entrar Zargon, pero `dormido` no se toca en ningún sitio del
  reductor. En la práctica el Sueño es un «muerto en vida» que además cuenta como vivo
  para `matarATodos` y para «monstruos a la vista» al buscar tesoro: un goblin dormido en
  la sala impide registrarla para siempre. En la partida jugada lo mataron dormido y no
  se notó; en una misión de `matarATodos` se notaría.
- **Qué cambiaría.** La regla de despertar, con su fuente. El reglamento remite a la
  carta del hechizo (p. 14, lo dijo T21) y las cartas no las tenemos: la sesión que lo
  coja busca la carta de Sueño de la edición 2021 y, si no hay fuente fiable, es regla de
  la casa firmada. Candidatas que se entienden en la mesa: se despierta al recibir daño;
  o al empezar cada turno de Zargon tira un dado y con 6 se despierta. Implementarlo en
  `aplicarDano` y en `avanzarActor`, con evento y frase, y un test por cada mitad.
- **Ficheros.** `src/engine/reducer.ts` (cola del reductor), `src/engine/types.ts` (un
  evento), `src/narrator/local.ts`, `tests/hechizos.test.ts`.
- **Banda y duración.** ALTO, 1,5 h: es una regla y hay que decidirla.
- **Qué decide Juan Luis.** La regla, si la carta no aparece. Es la misma clase de
  pregunta que la Tempestad, y conviene contestarlas juntas.

## 10. El diario leído en voz alta

- **Qué se nota jugando hoy.** El README promete que la aplicación «narra la partida en
  voz alta» y `TRASPASO.md` lo pone en la Fase 5 con la voz delante de Claude. Hoy el
  diario es texto en un panel de 260 px que el adulto lee mientras mueve miniaturas. Con
  niños, que la aplicación **diga** «Le toca al orco Górbak: ya te tiene a tiro» es lo que
  convierte el turno de Zargon en un momento de la partida en vez de en una espera.
- **Qué cambiaría.** `speechSynthesis` del navegador, que va sin red, sin clave y con voces
  en español en el Mac y en la tableta: una cola que lee cada línea nueva del diario (por
  índice, como el diario y como haría T44 con los sonidos), un botón de silencio al lado
  del de sonidos, y que el turno de Zargon espere a que termine la frase antes de la
  siguiente acción (`ocupado` de `useTurnoDeZargon` ya sabe esperar). Nada de Claude
  todavía: el narrador local es el que manda (decisión de `TRASPASO.md`).
- **Ficheros.** `src/ui/voz.ts` (nuevo), `src/ui/MasterLog.tsx` (T39), `src/ui/Juego.tsx`
  (cola 52 → 36 → 44 → 45), `src/ui/useTurnoDeZargon.ts`. **Después de T44**, que monta el
  botón de silencio y el enganche por evento que esto reutiliza.
- **Banda y duración.** MEDIO, 2 h.
- **Qué decide Juan Luis.** Si quiere voz; y si prefiere que lea el informe (corto) o el
  relato de T39 (largo, y entonces el turno de Zargon se alarga mucho).

## 11. Héroes del simulador que juegan como personas

- **Qué se nota jugando hoy.** No se nota en la mesa: se nota en los números que deciden
  el diseño. `npm run sim` juega con héroes que «abren, pegan y se acercan»: ni buscan, ni
  curan, ni lanzan. T45 va a **ordenar el catálogo de misiones por el porcentaje que salga
  de ahí**, T46 y T47 se diseñan contra ese número, y T53 solo añade «buscar en la sala
  del objetivo». Con héroes tontos el porcentaje sale bajo en las misiones donde curarse
  o dormir al jefe importa, y el catálogo puede quedar en el orden equivocado. El guion
  con el que se jugó esta partida (busca tesoro una vez por sala, lanza los hechizos de
  daño y de sueño a lo que ve, cura a quien ha perdido 3 o más) tardó una hora en
  escribirse y ya da 12–49 rondas en `astuto` frente a las 8 del guion tonto.
- **Qué cambiaría.** Una política de héroes «razonable» en `simular.ts`, elegible con un
  argumento (`--heroes tontos|razonables`), y la tabla del catálogo con las dos columnas.
  Cuando T54 exista, que beba pociones. Los porcentajes de la terminada de cada misión
  llevan las dos columnas.
- **Ficheros.** `scripts/simular.ts` (cola 53 → 38 → 45: **después de T45**), quizá
  `tests/` si la política se saca a un módulo.
- **Banda y duración.** MEDIO, 2 h.
- **Qué decide Juan Luis.** Nada; solo saber que la «dificultad» del catálogo se mide
  contra héroes de mentira, y con cuáles.

## 12. Ocho hojas de héroe: la barra lateral no cabe

- **Qué se nota jugando hoy.** Con cuatro héroes las hojas van en dos columnas y el diario
  queda a la vista. Con ocho (T16) son cuatro filas de hojas entre el panel de turno y el
  diario, y el diario se va por debajo del borde: hay que desplazar el panel en cada
  turno para ver qué acaba de pasar. T16 lo dejó dicho («mirar en pantalla») y nadie lo
  ha mirado.
- **Qué cambiaría.** Hojas compactas —una línea por héroe: nombre, cuerpo, ataque, defensa—
  y la del héroe de turno desplegada entera; o el diario **encima** de las hojas. Lo
  segundo es una línea de CSS y ya mejora con cuatro. T58 (ficha flotante) quita presión:
  con la ficha al pasar el ratón, la hoja lateral puede ser más corta.
- **Ficheros.** `src/ui/HeroSheet.tsx` (T54, T22: después), `src/ui/Juego.tsx` (cola),
  `src/estilos.css` (T58, T37, T22).
- **Banda y duración.** MEDIO, 1,5 h. Hay que mirarlo con ocho héroes en pantalla.
- **Qué decide Juan Luis.** Si juegan de verdad con más de cuatro; si no, solo el orden
  diario/hojas.

## 13. Campaña: el oro que sirve para algo, la armería y héroes que duran

- **Qué se nota jugando hoy.** Los héroes acaban con 50–200 monedas de oro cada uno y el
  oro no compra nada; la misión siguiente empieza de cero. Es la mitad de HeroQuest que
  falta: comprar en la armería entre misiones (`equipment.ts` tiene los precios cotejados
  y `puedeLlevar` la regla del mago desde T7, «a la espera de quien la use») y llegar a
  la siguiente misión con lo comprado y lo encontrado. Depende de tres cosas que están en
  marcha: el catálogo (T45), el equipo en el tesoro y la mochila (T54) y guardar (5).
- **Qué cambiaría.** Un «grupo de campaña» guardado aparte de la partida: héroes con su
  oro, equipo y mochila. Al terminar una misión con victoria, pantalla de armería (lista
  de `EQUIPO` filtrada por `puedeLlevar`, precio, comprar) y «siguiente misión» del
  catálogo con el mismo grupo. Los caídos no vuelven (o vuelven, si él lo firma). Nada de
  esto toca el motor: `crearPartida` ya acepta el equipo inicial por héroe.
- **Ficheros.** `src/ui/Armeria.tsx` (nuevo), `src/ui/campana.ts` (nuevo), `src/App.tsx`,
  `src/ui/EleccionDeHeroes.tsx`, `src/engine/partida.ts` (`HeroeElegido` con equipo y
  oro), `tests/`. Después de T45, T54 y de la propuesta 5.
- **Banda y duración.** ALTO, 5 h (es la Fase 8 entera menos guardar).
- **Qué decide Juan Luis.** Si quiere campaña o cada misión suelta; qué pasa con un héroe
  caído entre misiones; y **la lista de armas grandes vetadas al mago**, que T7 dejó vacía
  porque el reglamento remite a unas cartas que no hay: sin esa lista la armería vende el
  hacha al mago. Como no existe la caja, es regla de la casa firmada (candidatas: hacha
  de batalla, espada ancha, ballesta).

## 14. Documentos y cartas desfasados

- **Qué se nota jugando hoy.** No en la mesa; en quien llega al proyecto. `README.md`
  dice que `src/ai/` «no existe», que la Fase 4 es «la siguiente», que hay una pantalla
  «Verificar tablero» (T43 la quitó), que `npm run server` no funciona y que el número de
  tests está en `_ESTADO.md`. `TRASPASO.md` es del 22 de agosto y dice lo mismo, y
  `proyecto.md` manda leerlo como «el contexto largo». Y `imprimibles/cartas.pdf` es del
  22 de agosto: desde entonces entraron las heroínas, las trabas del hada, la Tempestad
  de uno y el troll, y ninguno tiene carta impresa (T47 y T54 avisan de regenerarlas,
  pero cada una para lo suyo).
- **Qué cambiaría.** README al día (fases, pantallas, atajos, dónde está cada cosa),
  TRASPASO con una cabecera que diga «esto era el 22 de agosto; lo vigente está en
  `proyecto.md` y el tablón» o reescrito, y `npm run cartas` + `npm run tablero`
  regenerados y comiteados, mirando el PDF (la trampa de T41: lo que los tests no ven).
- **Ficheros.** `README.md` (T56 y T57 lo tocan: después), `TRASPASO.md`, `imprimibles/`
  (T54 lo regenera: hacerlo después o dentro).
- **Banda y duración.** BAJO, 1 h.
- **Qué decide Juan Luis.** Nada.

## 15. La partida en red, probada con dos ventanas y con el relevo desplegado

- **Qué se nota jugando hoy.** Nada, porque no se puede: T30–T33 escribieron y probaron
  la partida en red con tests y con `npm run relevo`, pero **ninguna sesión la ha abierto
  con dos navegadores** (lo dejó escrito T32) y el relevo de Cloudflare espera firma.
  «Jugar con alguien fuera» está en la barra y hoy lleva a una pantalla que no puede
  hacer nada sin relevo.
- **Qué cambiaría.** Una tarea de prueba, no de código: dos ventanas con `npm run relevo`,
  jugar una misión entera con un héroe en cada una, apuntar lo que falle (incidencias,
  no arreglos) y, si él firma, el despliegue con el primer paso de `server/README.md`
  (comprobar que los Durable Objects entran en el plan gratuito y parar si no). Y
  mientras no haya relevo, que el botón «Jugar con alguien fuera» diga que no está
  disponible en vez de llevar a un formulario.
- **Ficheros.** Ninguno de código para la prueba; `src/ui/EntrarEnPartida.tsx` para el
  aviso; `server/` solo si firma.
- **Banda y duración.** MEDIO, 2 h la prueba; el despliegue, 1 h más.
- **Qué decide Juan Luis.** La firma de Cloudflare (pendiente en `autorizaciones.md`), o
  dejar la red aparcada y esconder el botón.

---

## Descartado, con el motivo

- **Buscar dentro del foso «como si fuera una sala»** (p. 17, divergencia desde T5).
  Obliga a cambiar cómo se identifican las salas para buscar (`salaEn`) y arrastra a T6 y
  T53 por una situación que en tres partidas jugadas no se dio ni una vez (nadie busca
  tesoro dentro de un agujero con un dado menos). Que siga siendo divergencia conocida.
- **Que los monstruos abran puertas.** La IA no sabe abrir (`zargon.ts` no propone
  `abrirPuerta`). No importa: un monstruo detrás de una puerta cerrada no está en el
  tablero (T18) y no actúa, y los descubiertos ya están en salas abiertas. Solo cambiaría
  algo si un monstruo persiguiera a los héroes a otra sala cerrada, que es raro y da un
  turno de Zargon más largo.
- **Editor de misiones y generador de mazmorras** (Fases 6 y 7). Con T45 el catálogo se
  escribe a mano y cada misión es una tarea de 3–4 h con su medida; un editor compensa a
  partir de cinco o seis misiones, y hoy hay una. Cuando haya cuatro, se vuelve a mirar.
- **El narrador con Claude y el servidor** (Fase 5). T39 cubre el relato con frases
  prefabricadas por decisión firmada, y no hay servidor desplegado donde guardar la
  clave (15). Sin lo segundo no puede haber lo primero.
- **El libro de hechizos (T15)**: aparcado por él el 2026-09-05.
- **Selector de dificultad, nombres en el anuncio de la jugada, `_COMUN.md` desfasado**:
  hechos o encargados (ver la cabecera).
- **Cambiar el orden de turno de los héroes cada ronda**: el reglamento lo fija (en el
  sentido de las agujas del reloj) y el motor lo cumple.

## Pequeñas cosas vistas por el camino (no llegan a propuesta)

- `HeroSheet.tsx` pinta los efectos con el nombre interno: «bonusAtaque +2» en la mesa.
  Una tabla de nombres legibles, dentro de T22 o T58, que ya tocan ese fichero.
- Buscar trampas en un pasillo sin hallazgo dice «La sala está limpia» (`local.ts`,
  `busquedaSinHallazgo`): el evento no sabe si era sala o pasillo. Dentro de T39.
- Una carta de tesoro salen dos líneas seguidas que repiten la idea («…encuentra: Monstruo
  errante. Un orco entra por donde has venido» y «¡No estabais solos! El orco Brúmgar
  aparece…»). Dentro de T39.
- `fichaDe` en `selectors.ts` no la usa nadie; T58 va a escribir otra con el mismo nombre
  en la pantalla. Que T58 la reutilice o la borre, no las dos.
- El `.gitignore` con `node_modules/` (barra final) deja el enlace de cada worktree como
  `?? node_modules` en todo `git status` (incidencia de la sesión de T11). Una línea.
