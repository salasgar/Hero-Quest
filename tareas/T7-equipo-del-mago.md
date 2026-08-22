# T7 · El mago no lleva armadura ni armas grandes

**Precondición:** ninguna. **Fichero que bloquea:** `src/data/` (ninguna otra tarea lo
toca). Lee `_COMUN.md` primero.

## Antes de empezar: mira si ya está hecho

```sh
grep -n "puedeLlevar\|restricc" ../src/data/heroes.ts ../src/data/equipment.ts
```

Si no hay nada, está pendiente.

## Lo que dice el reglamento

Página 13:

> **The wizard** starts with a small dagger. They have great knowledge of magic and are a
> master spellcaster. They begin each quest with nine magic spells (three spell groups).
> However, they are hindered by their **inability to wear normal armor or use large
> weapons**.

El reglamento **no enumera** qué cuenta como «arma grande»: esa lista está en la carta de
personaje del mago, que no tenemos.

## Comprueba la fuente antes de escribir

Descárgate el reglamento (la URL y cómo leerlo están en `_COMUN.md`) y busca si en alguna
página se concreta la lista de armas. Si la encuentras, úsala y cita la página.

**Si no la encuentras: implementa solo lo confirmado —nada de armadura— y deja la
restricción de armas escrita en los datos con un comentario que diga claramente que la
lista concreta está sin confirmar.** No inventes una lista y la presentes como si fuera
del reglamento. Esta advertencia no es retórica: en este proyecto ya se implementaron
cuatro hechizos «de memoria» y once de doce valores estaban mal.

## Cómo modelarlo

Hoy no hay tienda —es la Fase 8—, así que esto no puede romper ninguna partida: es una
regla que se aplicará al comprar. Lo que hace falta es que **exista y esté probada**, no
que se conecte a una interfaz que aún no existe.

Sugerencia, pero decide tú si encaja mejor de otra forma:

- `PlantillaHeroe` en `src/data/heroes.ts` gana un campo con las restricciones de la clase.
- Una función pura `puedeLlevar(clase, idEquipo): boolean`.
- `src/data/equipment.ts` ya distingue `ranura: "arma" | "armadura" | "objeto"`, y las
  armas tienen `ataque`, `aDosManos`, `atacaEnDiagonal`. Puede que «arma grande» se exprese
  bien con lo que ya hay, sin campos nuevos.

## Una decisión de diseño que es tuya

**El hada también es una lanzadora de hechizos** (cuerpo 3, mente 7, dos grupos de
hechizos, y vuela). No viene en la caja: es añadido nuestro. ¿Le corresponden las mismas
restricciones que al mago?

Decide y **justifícalo por escrito** en el registro de `_ESTADO.md`. No es una regla del
reglamento, es equilibrio de juego, y quien venga después necesita saber por qué se hizo
así.

## El test que se cuela solo

**El equipo inicial de cada clase tiene que seguir siendo válido según tu propia regla.**
Añade un test que lo recorra para las cinco clases (`barbaro`, `enano`, `elfo`, `mago`,
`hada`). Es exactamente el tipo de incoherencia que aparece sola tres semanas después.

## Tests que hay que añadir

- El mago no puede llevar yelmo, cota, placas ni escudo.
- El mago sí puede llevar su daga.
- El bárbaro puede llevarlo todo.
- El equipo inicial de las cinco clases pasa su propia validación.

## Prohibido

- Quitarle al mago la daga con la que empieza.
- Inventar la lista de armas vetadas sin fuente.

## Al terminar

Commit en `main` y push. Línea en el registro de `_ESTADO.md` con lo que encontraste en el
PDF, lo que no, y qué decidiste sobre el hada.
