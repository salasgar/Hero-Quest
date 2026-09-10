# AUTORIZACIONES — Hero-Quest

**Este fichero lo escribe Juan Luis a mano. Ninguna sesión escribe aquí, nunca.**

Está separado del tablón a propósito: el tablón (`_ESTADO.md`) se regenera entero cada vez
que cambia el estado, y una firma que desapareciera en una regeneración es justo lo que no
puede pasar, porque es lo que desbloquea lo irreversible.

Una sesión que necesite una de estas autorizaciones lee este fichero. **Una acción está
autorizada cuando su línea `Firma y fecha:` lleva nombre y fecha detrás; si está vacía,
no lo está.** No hay ninguna otra señal —ni casilla, ni frase en el tablón, ni nada dicho
en una conversación—: con dos señales, una acaba puesta y la otra no, y dos sesiones leen
el mismo fichero como firmado y como sin firmar. Si la línea está vacía, la sesión se para,
añade a su reclamo un latido `BLOQUEADA por <qué>` y lo dice. No hay ninguna otra manera de
desbloquearla.

Las firmas de abajo se dieron en conversación y las sesiones las transcribieron a la sección
«Autorizaciones de Juan Luis» del tablón viejo. Las trajo aquí, con su fecha y sin cambiar
el texto, la sesión `s-20260906T103034-b376065f` al migrar el reparto el 2026-09-06; el
texto completo de cada una sigue en `_ESTADO-antiguo-2026-09-06.md`.

## Firmadas

- **Las figuras de cartón caben en la casilla de 1,9 cm.** El tablero imprimible de cuatro
  folios A4 queda validado. No hace falta la versión de seis ni de nueve folios.
  Firma y fecha: Juan Luis, 2026-08-22

- **Los valores de cartas se cotejan contra el reglamento oficial de 2021** (Avalon Hill
  F3649), no contra la memoria ni contra una caja física, que no existe.
  Firma y fecha: Juan Luis, 2026-08-22

- **La entrada de «El calabozo del guardián» vuelve a un pasillo de una casilla de ancho.**
  Estaba en uno de dos (columnas 12-13) solo porque con la regla vieja los cuatro héroes se
  taponaban; era un parche, no diseño. Se hace dentro de T2 y en el mismo commit que la
  regla, nunca antes. (Cumplida en `1c8a533`.)
  Firma y fecha: Juan Luis, 2026-08-22

- **La fila 13 (base 1) de la sala central `k` pasa a pasillo.** Revisado el tablero contra
  la foto de referencia: era el único error de transcripción. La sala queda en 6 × 5. Los
  dos folios de abajo del tablero impreso quedan desfasados hasta reimprimirlos.
  Firma y fecha: Juan Luis, 2026-09-05

- **Las cuatro decisiones de la fase de red (T30–T34)**, copiadas enteras en la cabecera de
  `tareas/T30-relevo-de-acciones.md`: quien está lejos es **un héroe más** del grupo; **ve el
  tablero con niebla**, solo lo descubierto; la aplicación se publica en `salasgar.github.io`
  y las acciones pasan por un **relevo alojado y gratuito** (descartados el túnel al portátil
  y el navegador a navegador); y **los dados de quien juega desde casa admiten las dos
  opciones**, tirarlos él o que se los tire la aplicación.
  Firma y fecha: Juan Luis, 2026-09-05

- **Una puerta se abre también desde la diagonal (T19), solo desde el mismo lado del muro.**
  Regla de la casa, no reglamento. (Hecha en `c08bbc0`.)
  Firma y fecha: Juan Luis, 2026-09-05

- **Los héroes que no caben en `mision.entrada` salen por las casillas más cercanas a ella.**
  Respuesta literal a la pregunta de T16: «lo de los 8 héroes creo que se puede solucionar
  poniéndolos en las 8 casillas más cercanas a la entrada». La entrada del calabozo sigue
  siendo el pasillo de una casilla de ancho de T2, y `calabozo.ts` no se toca. Decide dónde
  **empieza** el grupo, no qué cuenta como salida: eso es la firma del 2026-09-06.
  Firma y fecha: Juan Luis, 2026-09-05

- **El suelo de un dado en el foso queda solo para los héroes (T5).** Decidido por la sesión
  `205592a2` por delegación de Juan Luis: se queda la lectura literal de la p. 17 («As a
  hero»), que es la ya implementada. No hay código que cambiar.
  Firma y fecha: Juan Luis (por delegación, sesión 205592a2), 2026-09-05

- **En una misión de «salir», la salida lleva tantas casillas como héroes pueda llevar el
  grupo.** Respuesta literal: «Los 8 héroes podrán salir si ponemos suficientes casillas de
  salida. Basta hacer coincidir el número de casillas de entrada con el número de casillas de
  salida». Regla de diseño de misiones, no cambio de motor. Quien escriba la primera misión
  de salir la acompaña de un test que exija `entrada.length >= 8`. (T35, `87ea055`.)
  Firma y fecha: Juan Luis, 2026-09-06

- **El 100 % de victorias en la primera misión está bien así.** «Me parece bien que en la
  primera misión los héroes ganen el 100 % de las veces. Las siguientes misiones serán más
  difíciles porque habrá más monstruos o los monstruos serán más letales o más resistentes.»
  La dificultad se diseña por misión, no retocando los pesos de la IA; nadie «arregla» el
  calabozo para que Zargon gane más.
  Firma y fecha: Juan Luis, 2026-09-06

- **El troll de las cavernas entra en el bestiario** (hecho en `0e871d3`): muy fuerte y
  resistente pero muy torpe; un dado de ataque y dos casillas por turno como mucho, muchos
  dados de defensa y muchísimos puntos de vida. La defensa 6 y el cuerpo 10 son concreción
  de la sesión `992c726d`, ajustables en una línea de `monsters.ts`. No hay figura de cartón.
  Firma y fecha: Juan Luis, 2026-09-06

- **Encender GitHub Pages y publicar la aplicación.** Con las tres advertencias delante
  —encenderlo solo no publica nada, la página publicada no junta dos casas, en el cliente no
  hay ni debe haber claves— dijo «adelante». Ejecutado por la sesión `6905402d`
  (`build_type: workflow`; publica `.github/workflows/pages.yml`). **No autoriza el relevo.**
  Firma y fecha: Juan Luis, 2026-09-06

- **La Tempestad envuelve a un solo ser, no a la sala entera (T21).** «Un pequeño remolino
  que envuelve a un único ser (monstruo o héroe) a quien se le lanza y lo deja un turno sin
  jugar». Implementado en el `case "perderTurno"` de `reducer.ts`. Lo del héroe no está hecho
  y está preguntado abajo.
  Firma y fecha: Juan Luis, 2026-09-06

- **El registro del relevo lleva número de revisión (T30).** Preguntado con las dos opciones
  delante —hacerlo ahora, sin nada desplegado, o después, redesplegando y cortando partidas
  vivas— contestó «sí». Es un cambio del protocolo, que es lo que la regla 4 reserva para él.
  Hecho el mismo día, antes del `wrangler deploy`, por la sesión `6905402d` en `1ba2a4c`:
  `Registro` gana `revision`, que sube con cada cambio y también al deshacer, y el 409
  devuelve el registro entero. Cierra la incidencia del `esperado` que dejó abierta T31.
  Firma y fecha: Juan Luis, 2026-09-06

- **Todos los dados los tira la aplicación; sin modo manual (T36).** «Lo más probable es
  que juegue siempre en la modalidad automática. La modalidad manual, de momento, que la
  aplicación no la ofrezca. Que se ejecute siempre en modo automático para que no haya que
  lanzar dados reales y los jugadores nos centremos únicamente en la estrategia a seguir.»
  Y una libertad de diseño para las tareas que vengan: «puedes usar dados de más (o menos)
  de 6 caras cuando lo consideres oportuno a la hora de diseñar las capacidades de los
  héroes, de los monstruos, los hechizos, etc.»
  Firma y fecha: Juan Luis, 2026-09-06

- **El relato literario del diario se genera ensamblando frases prefabricadas (T39)**, no
  con un modelo de lenguaje: «Dejas escritas distintas expresiones para cada posible
  situación […] Que se lo invente la sesión que coja la tarea.»
  Firma y fecha: Juan Luis, 2026-09-06

- **El logotipo y las imágenes de ambientación los coloca la sesión a su criterio (T41)**,
  incluido retocar el PNG, generar imágenes o descargarlas de Internet: «Piensa dónde queda
  mejor, y si hay que cambiarle el fondo, el tamaño, el color, descargar otra imagen
  diferente de Internet, generar tú otra… de manera que no quiten espacio al juego.» Lo
  descargado, con licencia que permita usarlo y con su origen apuntado.
  Firma y fecha: Juan Luis, 2026-09-06

- **La primera misión tiene encargo: el pergamino del guardián (T53).** Tras probar la
  página el 2026-09-06: «No le asigna ninguna misión a los héroes. No les dice qué tienen
  que hacer. Sugerencia: “…Debéis encontrar un pergamino custodiado por una bestia del
  inframundo…”. Cuando los héroes maten al Famir y busquen tesoros encontrarán el
  pergamino y habrán terminado la misión.» Regla de diseño de misión: la misión termina
  al encontrar el pergamino buscando tesoro en la sala del guardián, con el guardián
  muerto. Transcrita de la conversación por la sesión `s-20260906T141818-ff83f12c`.
  Firma y fecha: Juan Luis, 2026-09-06

- **El tesoro trae pociones que se guardan y curan a otro héroe, y equipo (T54, T55).**
  El mismo día: «Si la idea es que la misión sea fácil de llevar a cabo, puedes poner
  pociones curativas en las habitaciones, de manera que cuando un héroe busque un tesoro,
  encuentre, además de monedas, gemas, etc, alguna poción curativa que le restituya a él o
  a otro héroe los puntos de vida perdidos. También pueden hallar armas, escudos, yelmos,
  etc que les otorguen más puntos de ataque o de defensa a los héroes.» Y las salas de la
  primera misión se pueblan: «Debería haber monstruos, tesoros, etc.» Transcrita de la
  conversación por la sesión `s-20260906T141818-ff83f12c`.
  Firma y fecha: Juan Luis, 2026-09-06

## Pendientes de su palabra

Eran la sección «Pendientes de su palabra» del tablón viejo. Ninguna sesión se las puede
autorizar a sí misma; una tarea que las necesite está BLOQUEADA hasta que la línea lleve
firma.

Un personaje solo se mueve una vez por turno; abrir una puerta remata el movimiento. Las casillas que le quedaban se pierden. Regla de la casa: contradice a propósito la lectura del reglamento (p. 12) que fijó la T75.
Firma y fecha: Juan Luis, 2026-09-10

- **Crear la cuenta de Cloudflare y desplegar el relevo** (`wrangler deploy` de `server/`),
  que es donde quedan guardadas las partidas —el montaje y la lista de acciones— en un
  servicio de terceros. No hay datos personales dentro más allá de los nombres que los niños
  les pongan a sus héroes, pero es un dato que sale de casa y por eso se pregunta. El código
  está escrito y probado (T30); lo que requiere firma es el despliegue. Primer paso escrito en
  `server/README.md`: comprobar si los Durable Objects entran en el plan gratuito, y parar si no.
  Firma y fecha: Juan Luis, 2026-09-10 — **sí, se despliega.** Esta firma se puso el mismo
  día junto con otras tres por un reemplazo global del fichero; preguntado una a una,
  Juan Luis la ratificó. El primer paso sigue siendo el de `server/README.md`: si los
  Durable Objects no entran en el plan gratuito, se para y se le pregunta.

- **¿La Tempestad se puede lanzar también sobre un héroe?** Sale de su propia respuesta —«un
  único ser (monstruo o héroe)»— y no está implementado: `pierdeTurno` vive en `Monstruo`,
  no en `Heroe`. Cambia la forma del estado, el paso de turno y la pantalla, y en la mesa
  quitarle el turno a un niño no es lo mismo que a un goblin. Si lo quiere, es tarea aparte.
  Firma y fecha: Juan Luis, 2026-09-10 — **sí.** Sus palabras: «la tempestad se puede
  lanzar sobre un héroe, aunque lo sensato sería lanzarla sobre un monstruo. Pero quiero
  que la aplicación deje lanzarla sobre cualquier personaje». Es decir: **el objetivo
  legal es cualquier figura, héroe o monstruo**, y la aplicación no lo impide ni avisa; a
  quién conviene lanzarla es cosa de quien juega. Sale tarea aparte: `pierdeTurno` tiene
  que existir también en `Heroe`, y eso toca la forma del estado, el paso de turno y la
  pantalla.

- **Las cuatro decisiones del libro de hechizos (T15).** El 2026-09-05 dijo que no lo tiene
  claro y que de momento no se haga nada de eso; la tarea queda escrita y sin tocar. Es regla
  de la casa, así que nada se puede deducir de una fuente:
  1. ¿Los hechizos del libro se **suman** a los nueve del mago, o **devuelven** los gastados?
  2. ¿**Qué trae** el libro: un elemento que no eligió, uno al azar de los doce, o los elige él?
  3. ¿Vale **solo para el mago**, o también para el elfo y el hada?
  4. ¿**Cómo se decide** si lo encuentra: él pulsando sí o no, o una tirada del motor? Y si
     falla, ¿puede reintentar, o esa estantería queda agotada? (De esta depende si la acción
     consume el `rng` del estado, y de eso los tests y el deshacer.)
  Firma y fecha:
  (El 2026-09-10 esta línea apareció con fecha por un reemplazo global del fichero, junto
  con las dos de arriba. No es una firma: son cuatro preguntas y no había respuesta, así
  que se vacía otra vez. T15 sigue BLOQUEADA y no se reclama.)

## Trampas: lo que dijo Juan Luis el 2026-09-10

Lo pegó él, con sus fuentes (un resumen del reglamento en Scribd, un vídeo de YouTube y un
hilo de Reddit). **No son el reglamento de 2021**, así que esto vale como palabra suya, que
es la otra fuente que `_COMUN.md` admite. Casi todo coincide con lo que el motor ya hace
citando las páginas 17 y 19 del reglamento; se anota entero para que quien lea el código
dentro de seis meses sepa que está ratificado y no solo deducido.

- **Si el héroe no sabe que hay una trampa**: al pisar la casilla el movimiento se detiene
  de golpe, la trampa se activa en esa misma casilla y se aplica su daño. *(Ya implementado:
  `mover()` en `reducer.ts`, «you automatically spring the trap», p. 17.)*
- **Si el héroe sabe dónde está**, puede intentar **saltarla** si le queda movimiento y hay
  casilla libre al otro lado donde caer: 1 dado de combate, cualquier cara que no sea
  calavera y cruza sin daño y sigue moviéndose; con calavera cae en la casilla de la trampa,
  se activa, sufre el daño **y ahí acaba su turno**. *(Ya implementado: evento
  `saltoDeTrampa`, p. 19.)*
- **Desactivarla**: el héroe usa su turno para llegar a la casilla e intentar desarmarla con
  un kit de herramientas, o siendo el Enano. *(Implementado con dos diferencias, abajo.)*

  Firma y fecha: Juan Luis, 2026-09-10 (dictado por él; las tres fuentes, en su mensaje)

**Dos cosas de ese texto que el motor NO hace hoy, y que siguen pendientes de su palabra:**

1. **¿Desde encima de la trampa, o desde la casilla de al lado?** Su texto dice «moverse a
   la casilla», que es la letra del reglamento (p. 19). El motor acepta la **adyacente
   ortogonal**, y está marcado en el código como *regla de la casa pendiente de firma*
   (`selectors.ts`, `trampasDesarmables`; `reducer.ts`, `desarmarTrampa`). El motivo es
   práctico y conviene saberlo antes de decidir: `mover()` hace saltar cualquier trampa
   descubierta que sea el **destino** del movimiento, así que exigir estar encima dejaría la
   acción **inservible** —el héroe no puede llegar a esa casilla sin que la trampa salte—.
   Si se quiere la letra del reglamento, hay que cambiar además `mover()` para que pisar
   a propósito una trampa descubierta no la dispare, y eso es otra tarea.
   Firma y fecha:

2. **¿Hace falta que no haya monstruos cerca para desarmar?** Su texto lo dice («si no hay
   monstruos cerca»); sale del hilo de Reddit, no del reglamento. El motor **no** lo
   comprueba: hoy se desarma con monstruos al lado.
   Firma y fecha:

## Los cuatro tipos de trampa, dictados por Juan Luis el 2026-09-10

Segunda tanda, a continuación de la de arriba. La dictó él sin citar fuente, así que vale
como palabra suya. **Ojo: parte de esto contradice al reglamento de 2021 tal como lo cita
hoy el código**, y esas partes están abajo con su línea de firma aparte, sin tocar el motor
hasta que las firme. Lo que coincide se anota como ratificado.

### 1. Foso (`tipo: "foso"`)

Dictado: se abre bajo los pies; 1 punto de daño; el turno acaba en el acto; **mientras el
héroe está en el pozo ataca y defiende con 1 dado menos**; en su turno siguiente sale con
normalidad, sin coste extra de movimiento; **no se puede desactivar**, y una vez abierta la
casilla queda como foso permanente que hay que saltar.

Ratificado, ya implementado: el daño de 1, el fin de turno, que no se desarma
(`reducer.ts`: «Once a pit trap is sprung … the trap cannot be disarmed», p. 17) y que la
casilla queda abierta y hay que saltarla (`trampaEn`, que conserva el foso aunque esté
gastado).

### 2. Lanza (`tipo: "lanza"`)

Dictado: 1 dado de combate; con calavera, 1 punto de daño; con daño o sin él la losa se
gasta; **el héroe puede seguir moviéndose si le quedaban casillas**. Desarme desde una
casilla adyacente y antes de pisarla: héroe común con kit de herramientas tira 1 dado
—calavera, le salta encima; escudo, desarmada—; **el Enano la desarma automáticamente,
tenga o no kit de herramientas**.

Ratificado, ya implementado: el dado, el daño de 1 solo con calavera, que se gasta igual,
el desarme desde la adyacente y la tirada de desarme (`reducer.ts`, p. 19).

### 3. Bloque de roca (`tipo: "bloque"`)

Dictado: **1 punto de daño automático**; se coloca la loseta de roca; **el héroe es
empujado a una casilla libre adyacente y, si no hay ninguna, sufre daño extra**; la casilla
queda bloqueada el resto de la partida.

Ratificado, ya implementado: que la casilla queda cegada para siempre.

### 4. Cofre o tesoro

Dictado: se activan **solo al hacer la acción de Buscar Tesoro**, si no se ha buscado y
desarmado antes; el daño lo dicta el Libro de Retos de cada misión (gas, dardos, flechas…).
Desarme: el héroe tiene que estar adyacente al cofre y haber hecho antes una acción de
Buscar Trampas; héroe común con herramientas tira 1 dado —calavera, le salta en la cara;
escudo, desarmada—; el Enano, automático y seguro.

**No existe nada de esto en el motor.** `TipoTrampa` es `"foso" | "bloque" | "lanza"`, y lo
más parecido son las cartas de clase `"peligro"` del mazo de tesoro (`data/treasure.ts`:
gas venenoso y telaraña), que saltan al buscar tesoro y no se pueden desarmar. La T81, viva
el 2026-09-10, está **añadiendo más cartas de esas**, que es otra cosa: su ficha dice
expresamente «sin regla nueva, solo más cartas». Un cofre como trampa de verdad —con
marcador, con búsqueda previa y con desarme— es tarea nueva y de banda ALTA.

  Firma y fecha: Juan Luis, 2026-09-10 (dictado por él; vale como palabra suya para todo lo
  que arriba consta como «ratificado, ya implementado»)

### Lo dictado que el motor NO hace, cada uno con su firma

Ninguna de estas seis se toca sin la línea de abajo rellena. Las dos primeras son añadidos;
las cuatro siguientes **contradicen al reglamento de 2021 tal como lo cita el código hoy**, así
que son regla de la casa, como la T76.

1. **El héroe dentro del foso ataca y defiende con 1 dado menos.** Hoy no hay penalización:
   caer en el foso cuesta 1 de cuerpo y el turno, y nada más. Es un campo nuevo de estado y
   toca el combate entero.
   Firma y fecha:

2. **Trampas de cofre.** Tipo de trampa nuevo, con búsqueda previa y desarme, y daño dictado
   por cada misión. Es lo más gordo de las cuatro y no lo cubre la T81.
   Firma y fecha:

3. **La lanza no acaba el turno.** El código termina el turno cuando la lanza hiere; lo
   dictado dice que el héroe sigue andando si le quedaban casillas.
   Firma y fecha:

4. **El bloque hace 1 de daño automático, y no 3 dados.** El código tira 3 dados de combate
   sin defensa y hiere 1 por calavera (0 a 3 puntos), citando la p. 18. Lo dictado es un
   punto fijo: bastante más suave.
   Firma y fecha:

5. **El bloque empuja a una casilla libre adyacente, con daño extra si no hay ninguna.** El
   código devuelve al héroe a la casilla de la que venía, sin daño extra, y el comentario
   dice que el reglamento (p. 18) deja elegir entre seguir o volver.
   Firma y fecha:

6. **El Enano desarma sin kit de herramientas.** El código exige `herramientas` a todos
   antes de mirar quién es (`desarmarTrampa`), así que hoy un Enano sin kit no puede
   desarmar nada.
   Firma y fecha:

## Condiciones que Juan Luis quiere dejar dichas

- **Nada destructivo sin una firma de arriba.** Eso incluye borrar ramas ajenas, reescribir
  el histórico (`git push --force`), cambiar la geometría del tablero
  (`src/data/board-base.ts`) y cambiar el reparto de los cuatro folios impresos
  (`src/data/board-print.ts`).
- **No se inventa ninguna regla.** Todo sale del reglamento de 2021 o de una firma suya de
  este fichero, y la cita va en el comentario o en el mensaje de commit.
- Aquí no se borra nada: lo que sobre se mueve a `_papelera/` en la raíz del repositorio y se
  le dice; la vacía él.
