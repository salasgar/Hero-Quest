# T78 · Un monstruo muerto no arrastra los hechizos que le lanzaron

**Precondición:** ninguna. **No a la vez que T50, T66, T71, T75, T76** si alguna volviera
a estar viva —hoy todas LISTA, sin reclamo vivo sobre `reducer.ts`— (`reducer.ts`, `types.ts`).
**Banda de modelo:** MEDIO — corrección puntual y acotada, con tests; no hay regla nueva
que inventar, es dejar de arrastrar estado sobre una figura que ya no existe como tal.
**Duración esperada:** 1,5 h · **Encadenable con:** T77 (las dos MEDIO, cortas, sin ningún
fichero en común).
**Ficheros que toca:** `src/engine/reducer.ts`, `tests/hechizos.test.ts`.
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Lo que se nota jugando

Partida jugada el 2026-09-10: le echan Sueño a una gárgola (`dormido: true`), la matan
en combate y, varios turnos después, la gárgola **se despierta** —el evento
`dormidoDespierta` de T71 salta sobre un monstruo con `cuerpo: 0`—. El motivo: la muerte
solo reduce `cuerpo` a 0 y filtra los efectos de duración `"hastaRecibirDano"`
(`aplicarDano`, `src/engine/reducer.ts:108-121`); **`dormido`, `pierdeTurno` y cualquier
otro `EfectoActivo` de duración `"turno"` o `"mision"` se quedan tal cual sobre el
cadáver**. `avanzarActor` (línea ~1574) recorre `e.monstruos` entero al entrar el turno de
Zargon, sin filtrar por `cuerpo > 0` (la trampa que ya avisa `_COMUN.md`: «`e.monstruos` y
`e.heroes` conservan a los caídos»), así que un monstruo muerto y dormido sigue tirando el
dado de despertar cada ronda, para siempre.

## Antes de empezar: mira si ya está hecho

```sh
grep -n 'cuerpo === 0' src/engine/reducer.ts | grep -i 'dormido\|efectos: \[\]'
```

Si `aplicarDano` ya vacía `efectos` y limpia `dormido`/`pierdeTurno` al llegar a 0, está
hecho.

## Cómo funciona hoy

1. **`aplicarDano`** (única función que reduce `cuerpo`; los ocho sitios que hacen daño —
   combate, hechizos con salvación, trampas, la carta de tesoro «peligro»— pasan todos por
   aquí, comprobado con `grep -n 'aplicarDano(' src/engine/reducer.ts`) calcula
   `cuerpo: Math.max(0, f.cuerpo - dano)`, filtra de `efectos` solo los de duración
   `"hastaRecibirDano"` (la piel de piedra, que se rompe con el primer golpe que pasa) y
   genera `figuraDerrotada` si el resultado es 0. No toca `dormido` ni `pierdeTurno`.
2. **`avanzarActor`** (T71), al entrar el turno de Zargon, recorre `e.monstruos.map(...)`
   sin filtrar por `cuerpo > 0`: por cada monstruo con `dormido: true` tira un d6 y, si
   sale 6, genera `dormidoDespierta` y pone `dormido: false` — da igual que esté vivo o no.

## Qué hay que hacer

1. **En `aplicarDano`** (`src/engine/reducer.ts:108-121`): cuando el resultado de
   `cuerpo` sea 0, vaciar `efectos` entero (no solo los de `"hastaRecibirDano"`: una
   figura derrotada no puede beneficiarse ni sufrir ningún efecto temporal, sea cual sea
   su duración) y, si la figura es un monstruo (`f.tipo === "monstruo"`), poner también
   `dormido: false` y `pierdeTurno: false`. Vivo (`cuerpo > 0`) se queda exactamente como
   hoy: solo se filtran los efectos `"hastaRecibirDano"`.
2. **No hace falta tocar `avanzarActor`**: con `dormido` ya en `false` al morir, el
   monstruo cae en la rama `!m.dormido` (que solo limpia `pierdeTurno`, sin tirar dado ni
   generar evento) y el bucle deja de generar `dormidoDespierta` sobre él. Si al escribir
   el test se ve que hace falta un cinturón y tirantes —filtrar explícitamente por
   `cuerpo > 0` ahí también—, añádelo y dilo en la terminada, pero el punto 1 ya cierra el
   caso descrito.
3. **Revisa si algún otro camino del reductor lee `dormido`, `pierdeTurno` o `efectos` de
   un monstruo sin comprobar `cuerpo > 0` antes** (`grep -n '\.dormido\|\.pierdeTurno' src/engine/reducer.ts src/engine/selectors.ts src/ai/*.ts`) y, si encuentras alguno que
   trate a un muerto como si sus efectos siguieran activos, dilo en la terminada aunque no
   lo arregles si se sale del alcance de esta ficha.

## Trampas conocidas

- **`e.monstruos` y `e.heroes` conservan a los caídos con `cuerpo: 0`** (`_COMUN.md`):
  cualquier función que pregunte «¿qué hechizos tiene encima?» sin mirar antes si sigue
  vivo hereda este mismo fallo. Esta ficha lo cierra en el origen (`aplicarDano`), que es
  el único sitio que pone `cuerpo` a 0, así que no hace falta perseguir cada lector.
- **Los héroes no tienen `dormido` ni `pierdeTurno`** (T50: «ningún poder duerme ni quita
  el turno a un héroe», pendiente de firma en `autorizaciones.md`): el `if (f.tipo ===
  "monstruo")` del punto 1 es necesario porque `Heroe` no declara esos campos y
  `{ ...f, dormido: false }` no compila sobre un `Heroe` sin el `as Figura` ya presente en
  `herida`. No lo quites ni lo generalices sin comprobar el tipo.
- **No confundir con `pierdeTurno` de un héroe caído**: T66 ya resolvió que un héroe con
  `cuerpo 0` no juega, filtrando en `avanzarActor`/`turno.orden`. Esta ficha no toca esa
  parte; es la misma familia de fallo («un caído sigue contando como vivo») aplicada al
  otro lado, los efectos sobre un monstruo.

## Tests que hay que añadir

En `tests/hechizos.test.ts`, junto al `describe` de T71 («el monstruo dormido despierta al
entrar el turno de Zargon»): un monstruo dormido con `cuerpo: 1`, muerto con un hechizo de
daño fijo sin salvación (`genio`, como en el `describe` de arriba, con cuatro calaveras) y,
tras varios `terminarTurno` seguidos con la semilla que saca un 6 en el dado de despertar
(`SEMILLA_SEIS`, ya definida en el fichero), comprobar que `dormido` sigue en `false`, que
no se genera ningún evento `dormidoDespierta` y que `efectos` queda vacío.

## Prohibido

- Tocar `avanzarActor` de forma que un monstruo vivo y dormido deje de poder despertar
  (T71 sigue vigente para los vivos).
- Vaciar `efectos` o `dormido`/`pierdeTurno` de una figura **viva**: solo cambia el
  comportamiento cuando `cuerpo` llega a 0.
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md` (pruebas en verde → commit de código →
`hechos/terminadas/78--<sid>.md` con el hash → `CERRADA` → regenerar `_ESTADO.md` → commit
con rutas explícitas → `push`).
