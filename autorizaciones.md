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

## Pendientes de su palabra

Eran la sección «Pendientes de su palabra» del tablón viejo. Ninguna sesión se las puede
autorizar a sí misma; una tarea que las necesite está BLOQUEADA hasta que la línea lleve
firma.

- **Crear la cuenta de Cloudflare y desplegar el relevo** (`wrangler deploy` de `server/`),
  que es donde quedan guardadas las partidas —el montaje y la lista de acciones— en un
  servicio de terceros. No hay datos personales dentro más allá de los nombres que los niños
  les pongan a sus héroes, pero es un dato que sale de casa y por eso se pregunta. El código
  está escrito y probado (T30); lo que requiere firma es el despliegue. Primer paso escrito en
  `server/README.md`: comprobar si los Durable Objects entran en el plan gratuito, y parar si no.
  Firma y fecha:

- **¿La Tempestad se puede lanzar también sobre un héroe?** Sale de su propia respuesta —«un
  único ser (monstruo o héroe)»— y no está implementado: `pierdeTurno` vive en `Monstruo`,
  no en `Heroe`. Cambia la forma del estado, el paso de turno y la pantalla, y en la mesa
  quitarle el turno a un niño no es lo mismo que a un goblin. Si lo quiere, es tarea aparte.
  Firma y fecha:

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

## Condiciones que Juan Luis quiere dejar dichas

- **Nada destructivo sin una firma de arriba.** Eso incluye borrar ramas ajenas, reescribir
  el histórico (`git push --force`), cambiar la geometría del tablero
  (`src/data/board-base.ts`) y cambiar el reparto de los cuatro folios impresos
  (`src/data/board-print.ts`).
- **No se inventa ninguna regla.** Todo sale del reglamento de 2021 o de una firma suya de
  este fichero, y la cita va en el comentario o en el mensaje de commit.
- Aquí no se borra nada: lo que sobre se mueve a `_papelera/` en la raíz del repositorio y se
  le dice; la vacía él.
