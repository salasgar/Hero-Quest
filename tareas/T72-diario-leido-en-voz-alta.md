# T72 · El diario leído en voz alta

**Precondición:** T44 LISTA. **No a la vez que T52, T36, T44, T45** (`Juego.tsx`, `useTurnoDeZargon.ts`).
**Banda de modelo:** MEDIO — síntesis de voz, cola de eventos, control de flujo.
**Duración esperada:** 2 h · **Encadenable con:** —.
**Ficheros que toca:** `src/ui/voz.ts` (nuevo), `src/ui/MasterLog.tsx`, `src/ui/Juego.tsx`,
`src/ui/useTurnoDeZargon.ts`.
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Lo que se nota jugando hoy

El README promete que la aplicación «narra la partida en voz alta» y `TRASPASO.md` lo pone
en la Fase 5 con la voz delante de Claude. Hoy el diario es texto en un panel de 260 px que
el adulto lee mientras mueve miniaturas. Con niños, que la aplicación **diga** «Le toca al
orco Górbak: ya te tiene a tiro» es lo que convierte el turno de Zargon en un momento de la
partida en vez de en una espera.

## Qué cambiaría

`speechSynthesis` del navegador, que va sin red, sin clave y con voces en español en el Mac
y en la tableta: una cola que lee cada línea nueva del diario (por índice, como el diario y
como haría T44 con los sonidos), un botón de silencio al lado del de sonidos, y que el turno
de Zargon espere a que termine la frase antes de la siguiente acción (`ocupado` de
`useTurnoDeZargon` ya sabe esperar). Nada de Claude todavía: el narrador local es el que
manda (decisión de `TRASPASO.md`).

La voz se puede apagar y encender clicando en un icono.

## Antes de empezar: mira si ya está hecho

```sh
grep -n 'speechSynthesis' src/ui/voz.ts && \
grep -n 'leerDiario' src/ui/MasterLog.tsx
```

Si ambas cosas aparecen, está hecha.

## Cómo funciona hoy

1. `MasterLog.tsx` acumula líneas del diario.
2. T44 añadió un botón de silencio y enganchó eventos de sonido.
3. `useTurnoDeZargon` espera a que termine una acción antes de pasar a la siguiente
   (campo `ocupado`).

## Qué hay que hacer

1. **En `src/ui/voz.ts` (nuevo)**: helpers para síntesis de voz:
   - `leerTexto(texto: string, velocidad?: number): Promise<void>` — lee un texto con
     `speechSynthesis`, devuelve una promesa que se resuelve cuando termina.
   - `detenerLectura(): void` — detiene la lectura en curso.
   - `silencio(activado: boolean): void` — enciende/apaga la voz (guarda en estado o
     `localStorage`).
   - Elegir una voz en español si la hay; fallback a la primera disponible.

2. **En `src/ui/MasterLog.tsx`** (después de T39): cuando se añade una línea nueva al
   diario, si la voz está activa, llamar a `leerTexto(linea)`. Usar índice como en T44 para
   sincronizar.

3. **En `src/ui/Juego.tsx`** (de la cadena T52 → T36 → T44 → T45): añadir un botón de
   silencio junto al de sonidos (o unificar en un único botón de «silenciar todo»). Pasar
   el estado de voz a `MasterLog`.

4. **En `src/ui/useTurnoDeZargon.ts`**: antes de pasar a la siguiente acción, si la voz
   está leyendo, esperar a que termine. Usar `ocupado` que ya existe: si hay una lectura en
   curso, poner `ocupado: true` hasta que termine.

## Trampas conocidas

- **T52, T36, T44, T45 tocan `Juego.tsx` y `useTurnoDeZargon.ts`.** Coordinad si estáis en
  paralelo: esta tarea viene después de T44 y no puede ir a la vez.

- **La síntesis de voz es nativa del navegador.** No hay que instalar nada, pero la calidad
  y las voces disponibles varían por dispositivo. En Mac / iPad hay voces españolas decentes;
  en Android es variable. Aceptar lo que haya.

- **No bloquear la UI.** `leerTexto` devuelve una promesa, pero el navegador sigue
  respondiendo: el usuario puede interrumpir o clickear. Está bien.

- **Líneas muy largas.** Si una frase del diario ocupa 500 caracteres, la lectura durará
  varios segundos. `ocupado: true` en `useTurnoDeZargon` es lo que lo resuelve: el turno
  espera.

- **El botón de silencio.** Puede ser un icono de volumen (🔊 / 🔇) o una etiqueta «Narración
  on/off». Mantenerlo junto al de sonidos, porque son conceptos parecidos.

## Prohibido

- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).
- Añadir Claude a la narración (eso es Fase 5 en otra tarea).

## Al terminar

El orden de cierre es el de `proyecto.md` (pruebas en verde → commit de código →
`hechos/terminadas/72--<sid>.md` con el hash → `CERRADA` → regenerar `_ESTADO.md` → commit
con rutas explícitas → `push`).
