# T44 · Sonidos de ambientación

**Precondición:** ninguna. **No a la vez que T11 ni T36** (`Juego.tsx`).
**Banda de modelo:** MEDIO — no hay reglas; hay que elegir qué suena, cuándo y cómo se
apaga, sin que estorbe en una mesa con niños.
**Duración esperada:** 3 h · **Encadenable con:** —.
**Ficheros que toca:** `src/ui/sonidos.ts` (nuevo), `public/sonidos/` (nuevo, si hay
ficheros), `public/SONIDOS.md` (nuevo: origen y licencia de cada uno), `src/ui/Juego.tsx`
(el enganche a los eventos), `src/ui/VistaDeHeroe.tsx` (lo mismo en la vista remota),
`tests/` si se saca la tabla evento → sonido a un módulo.
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

Sale del punto 6 del encargo del 2026-09-06 («más imágenes, iconos, sonidos, etc que le den
ambientación»), partido en tres: las imágenes son T41, los iconos T37, y esto los sonidos.

## Qué hay que conseguir

Que la partida suene: una puerta que chirría al abrirse, dados que ruedan cuando la
aplicación tira (T36: los tira siempre ella), un golpe al atacar, un quejido al caer una
figura, un acorde al revelar una sala, algo distinto al lanzar un hechizo. Corto, bajo y
**con un botón de silencio a la vista**, que además recuerde la elección en `localStorage`
por navegador.

## Lo que hay hoy, medido

- Ningún sonido, ningún fichero de audio, ninguna dependencia de audio en `package.json`.
- Los eventos del motor (`Evento`, 30 tipos) ya llevan lo que hace falta para decidir qué
  suena; `MasterLog.tsx` y el narrador los recorren por índice, así que enganchar un sonido
  por evento nuevo es el mismo patrón.

## Antes de empezar: mira si ya está hecho

```sh
ls src/ui/sonidos.ts public/sonidos 2>/dev/null
```

## Qué hay que hacer

1. **Decide de dónde salen los sonidos, y la opción barata es no descargar ninguno**: con
   `AudioContext` se sintetizan un chirrido, un golpe y un rodar de dados en veinte líneas
   cada uno, sin ficheros, sin licencias y sin peso. Si prefieres ficheros, tienen que ser
   CC0 o equivalente, cortos (< 100 KB), en `public/sonidos/` y apuntados en
   `public/SONIDOS.md` con origen y licencia. Sin esa línea no entran.
2. **Una tabla evento → sonido** en `sonidos.ts`, y una función que recibe los eventos
   nuevos desde el último render y suena una vez por evento. Los eventos ya sonados no se
   repiten al rehacer el estado (deshacer, o el sondeo en red que rehace la partida entera
   desde el registro): lleva la cuenta por índice, como hace el diario.
3. **El navegador no suena hasta que el usuario toca algo**: la primera interacción
   desbloquea el `AudioContext`. Engánchalo al primer clic de la partida y no des por
   hecho que suena.
4. **En la vista remota** lo mismo, con su propio botón de silencio.

## Trampas conocidas

- **Un sonido por acción, no por render**: React vuelve a pintar muchas veces por acción;
  si suena en cada render, un ataque suena tres veces.
- **El turno de Zargon con T11** encadena varias acciones seguidas: que los sonidos no se
  pisen (una cola corta o cortar el anterior).
- **La `base` de Pages** (T34) para cualquier ruta a `public/`.
- **Los componentes no se prueban.** La tabla evento → sonido sí: que cada tipo de evento
  tenga decidido si suena o no (exhaustiva, como el narrador).

## Prohibido

- Sonidos con licencia dudosa o sin origen apuntado.
- Sonido sin botón de silencio.
- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).

## Al terminar

El orden de cierre es el de `proyecto.md`. Pruébalo en la tableta o el navegador de la
mesa, no solo en el del desarrollo: el desbloqueo del audio se comporta distinto.
