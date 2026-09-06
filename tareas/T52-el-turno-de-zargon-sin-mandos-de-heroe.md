# T52 · En el turno de Zargon no salen los mandos de los héroes

**Precondición:** ninguna. **No a la vez que 36, 22** (`TurnPanel.tsx`,
`useAccionesDeTurno.ts`) **ni 44, 45** (`Juego.tsx`).
**Banda de modelo:** MEDIO — pantalla sin reglas; lo que pide criterio es que el máster
conserve la salida manual sin que los niños vean botones que no son suyos.
**Duración esperada:** 2 h · **Encadenable con:** 36 y después 22 (misma banda;
comparten `TurnPanel.tsx`: seguidas, nunca en paralelo).
**Ficheros que toca:** `src/ui/TurnPanel.tsx`, `src/ui/Juego.tsx`,
`src/ui/useAccionesDeTurno.ts`, `tests/turno-automatico.test.ts` (o uno nuevo). **No toca
el motor ni `BoardMirror.tsx`** (T51 y T37).
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Lo que pidió Juan Luis

El 2026-09-06, probando la página publicada:

> Cuando actúa un monstruo aparece el botón «Atacar al enano». No debería aparecer ni
> ese botón ni el de terminar turno, ni el de avanzar. Tampoco deberían aparecer en verde
> las casillas a las que puede llegar. Todo eso solo debe aparecer cuando actúen los
> héroes, porque son herramientas para manejar a los héroes. Los usuarios no manejan a
> los monstruos, que deben actuar autónomamente o dirigidos por el máster.

## Lo que hace el código hoy, medido

- `TurnPanel.tsx` pinta, **con cualquier figura activa**, la botonera de `objetivos`
  («Atacar a …»), las puertas, y siempre el pie con «Terminar turno» y la pista de las
  flechas. Con un monstruo activo durante el turno automático (T11) todo eso sale igual
  que con un héroe.
- `Juego.tsx` pasa a `BoardMirror` `movimiento={turno.movimiento}` y
  `objetivos={turno.objetivos}` sin mirar de quién es el turno: las casillas verdes y los
  objetivos marcados son los del monstruo activo.
- `useAccionesDeTurno.ts` escucha las flechas, `A` y `Intro` (terminar turno) también
  durante el turno de Zargon.
- Lo que sí es del máster y **se queda**: los mandos de T11 (Pausa, Siguiente, Paso a
  paso, Que vaya solo, el nivel) y Deshacer.
- La salida manual de T11 («Cambiar» / «O elige tú») existe porque «si la aplicación hace
  algo raro en mitad de una partida, con niños delante no se puede parar a depurar».
  Juan Luis dice «autónomamente **o dirigidos por el máster**»: la salida manual se
  queda, pero **solo cuando el máster ha tomado el mando**.

## Antes de empezar: mira si ya está hecho

`npm run dev`, abrir la primera puerta y esperar al turno de Zargon: si con el orco
activo no hay «Atacar a …» ni casillas verdes, está hecha.

## Qué hay que hacer

1. **Una sola regla, en un sitio**: durante el turno de Zargon, los mandos de héroe
   —botones de atacar, abrir puerta, buscar, hechizos, «Terminar turno», la pista de las
   flechas, las casillas verdes y los objetivos del tablero, y el teclado (flechas, `A`,
   `P`, `B`, `R`, `H`, `Intro` como terminar turno)— **no existen**, salvo que el máster
   haya tomado el mando: **Zargon en pausa** o **avería** (`zargon.averia`). Escríbela
   como una función pura (`mandosDeHeroe(estado, zargon): boolean` o parecido) en
   `useAccionesDeTurno.ts`, que es lo que comparten las dos pantallas, y que
   `TurnPanel.tsx` y `Juego.tsx` la usen; así se prueba sin React.
2. **«Cambiar» / «O elige tú»** (elegir a mano qué monstruo actúa) pasa detrás de la misma
   regla: solo en pausa o avería. En automático y en paso a paso, el panel anuncia a
   quién le toca y no ofrece nada más.
3. **El aviso de la trampa.** Cuando lo que devuelve `ejecutar` tras un `mover` trae
   `trampaDisparada`, la pantalla lo enseña como enseña una tirada (`AvisoDeTirada`, con
   `setTirada`): «¡Trampa! El foso se traga a Grimbol: 1 de daño». Hoy solo sale una línea
   en el diario, y Juan Luis vio pisar una trampa «sin que ocurriera nada» (T51 arregla
   el motor; esto es que se vea). Mientras el aviso está abierto Zargon espera, que es lo
   que ya hace `ocupado`.
4. **Intro** durante el turno de Zargon sigue siendo «que juegue ya lo siguiente» (T11),
   nunca «terminar turno».
5. **La pantalla de casa (`VistaDeHeroe.tsx`) no se toca**: ya no ofrece nada durante el
   turno de Zargon por `puedeActuar`.

## Tests que hay que añadir

- La función pura: con un monstruo activo y Zargon en automático, sin mandos; en pausa,
  con mandos; con avería, con mandos; con un héroe activo, siempre con mandos.
- Que `casillasDeMovimiento` del monstruo activo no llegue al tablero en automático
  (basta probar la función que decide qué se pasa a `BoardMirror`, si la sacas).

## Trampas conocidas

- **`tests/turno-automatico.test.ts` fija el orden de las pausas de T11**: no las
  cambies de paso.
- **`aviso-error` está posicionado en absoluto** sobre el tablero (T11 lo explica en el
  panel): el aviso de la trampa va por `AvisoDeTirada`, no por ahí.
- **`estilos.css` no es de esta tarea** (T37, T22): si un botón no cabe, se quita, no se
  estiliza.

## Prohibido

- Tocar el motor o los selectores: lo que decide qué es legal no cambia; cambia qué se
  enseña.
- Quitar los mandos de T11 (pausa, paso a paso, nivel) o el Deshacer: son del máster.
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md`. En la terminada, la regla en una frase y la
lista de lo que desaparece durante el turno de Zargon.
