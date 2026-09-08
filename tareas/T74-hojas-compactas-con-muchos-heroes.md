# T74 · Ocho hojas de héroe: la barra lateral no cabe

**Precondición:** ninguna. **No a la vez que T54, T22** (`HeroSheet.tsx`, `estilos.css`), T58, T37.
**Banda de modelo:** MEDIO — CSS responsivo, compacidad, flujo visual.
**Duración esperada:** 1,5 h · **Encadenable con:** —.
**Ficheros que toca:** `src/ui/HeroSheet.tsx`, `src/ui/Juego.tsx`, `src/estilos.css`.
Lee `_COMUN.md` primero, y `proyecto.md` para el protocolo de reclamo y cierre.

## Lo que se nota jugando hoy

Con cuatro héroes las hojas van en dos columnas y el diario queda a la vista. Con ocho
(T16) son cuatro filas de hojas entre el panel de turno y el diario, y el diario se va por
debajo del borde: hay que desplazar el panel en cada turno para ver qué acaba de pasar. T16
lo dejó dicho («mirar en pantalla») y nadie lo ha mirado.

## Qué cambiaría

Flexible: con pocos héroes (hasta 4), las hojas tal como están ahora. Con muchos (5 o más),
hojas compactas —una línea por héroe: nombre, cuerpo, ataque, defensa— y la del héroe de
turno desplegada entera. O poner el diario **encima** de las hojas: lo segundo es una línea
de CSS y ya mejora con cuatro. T58 (ficha flotante) quita presión: con la ficha al pasar el
ratón, la hoja lateral puede ser más corta.

Cuando sean pocos héroes, que se quede así como está. Cuando sean demasiados y no quepa bien,
que salga de la otra manera para que todo quepa bien.

## Antes de empezar: mira si ya está hecho

```sh
grep -n 'compacta' src/ui/HeroSheet.tsx && \
grep -n 'muchos-heroes' src/estilos.css
```

Si ambas cosas aparecen, está hecha.

## Cómo funciona hoy

1. `Juego.tsx` renderiza `HeroSheet` por cada héroe del grupo.
2. `HeroSheet.tsx` pinta la hoja completa (nombre, cuerpo, ataque, defensa, hechizos,
   equipo...).
3. `estilos.css` pone las hojas en dos columnas con `display: grid` y un `max-height` fijo.

## Qué hay que hacer

1. **Condición de umbral.** Si `heroes.length >= 5`, activar modo compacto. Si no, modo
   normal.

2. **Modo compacto en `HeroSheet.tsx`**:
   - Renderizar una línea resumida: nombre, cuerpo actual, ataque, defensa.
   - Si es el héroe del turno (`esDelTurnoActual`), desplegar la hoja completa debajo
     (hechizos, equipo, etc.).
   - Si no, línea de resumen nada más.

3. **CSS para modo compacto** (en `estilos.css`):
   - `.hero-sheet.compacta` — una fila con tres columnas (nombre, cuerpo, ataque/defensa).
   - Font más pequeño, padding reducido.
   - La fila del turno se expande completa sin afectar a las demás.

4. **Opción: diario encima.** Si prefieres, simplemente mover el diario a un container
   flexbox con `order` antes de las hojas. Una línea de CSS. Prueba ambas con cuatro héroes
   en la pantalla.

## Trampas conocidas

- **T54, T22 tocan `HeroSheet.tsx` y `estilos.css`.** Coordinad si estáis en paralelo:
  esta tarea no puede ir a la vez.

- **T58, T37 tocan `estilos.css`.** Mismo: coordinación.

- **Prueba con ocho héroes.** Es lo único que no se puede hacer sin navegador en el
  entorno. Verifica por lectura que el CSS es responsivo y que la línea de resumen ocupa
  poco espacio.

- **El héroe del turno desplegado.** Cuando Zargon actúa, también es un «héroe de turno»
  en el tablero (T52 lo maneja). Que la hoja del monstruo de turno no se despliegue:
  `esDelTurnoActual` debería filtrar solo héroes, no monstruos.

## Prohibido

- Editar código con `sed -i` o heredocs (`tareas/_COMUN.md`).
- Borrar información de la hoja; solo contraerla.

## Al terminar

El orden de cierre es el de `proyecto.md` (pruebas en verde → commit de código →
`hechos/terminadas/74--<sid>.md` con el hash → `CERRADA` → regenerar `_ESTADO.md` → commit
con rutas explícitas → `push`).
