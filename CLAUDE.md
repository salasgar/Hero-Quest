# Cómo se trabaja en este repositorio

Aplicación web que hace de máster de HeroQuest sobre un tablero **físico**, para jugar en
casa. Aquí solo está cómo se trabaja; qué hay que hacer y por qué está en otro sitio:

- **`_ESTADO.md`** — el tablón: las tareas, quién tiene cada una, las autorizaciones de
  Juan Luis y las incidencias abiertas. Es la fuente de verdad del reparto.
- **`tareas/_COMUN.md`** — lo que toda tarea necesita saber: cómo se verifica, las trampas
  del entorno y del código, el estilo y lo prohibido. **Léelo antes de coger una tarea.**
- **`TRASPASO.md`** — el contexto largo: qué es el proyecto y por qué está montado así.

## Un worktree por sesión

**Si vas a editar archivos y hay otra sesión viva, entra primero en tu propio worktree.**
Es una instrucción del proyecto, no una preferencia: úsala con la herramienta
`EnterWorktree` nada más empezar, antes de tocar nada.

```
EnterWorktree(name: "t23-lo-que-sea")     # el nombre, el de tu tarea
ln -s /Users/salasgar/Documents/git/Hero-Quest/node_modules node_modules
```

**La segunda línea no es opcional.** Un worktree nuevo no tiene `node_modules` —está en el
`.gitignore`— y sin ese enlace no corre ni un test. Enlazarlo es correcto porque todos los
worktrees salen del mismo `package.json`; instalarlo otra vez sería medio giga por sesión.

Por defecto el worktree sale de `origin/main`, que es lo que se quiere: cada sesión parte
de lo último que hay publicado.

### Por qué

Varias sesiones trabajaban sobre el mismo directorio, y eso costó tres incidencias en dos
días. La cara fue **T12**: el árbol es uno, pero **el índice de git también**, así que
`git add mi-archivo && git commit` se lleva dentro lo que otra sesión tuviera preparado. El
2026-09-05 pasó dos veces; en la segunda, un commit de tablón se llevó una tarea entera con
un mensaje que hablaba de otra cosa. Con un worktree por sesión eso no puede ocurrir: cada
una tiene su copia de los archivos y su índice, y git junta el trabajo al fusionar, que es
para lo que sirve.

### Qué cambia y qué no

- **El candado de archivos sigue existiendo**, pero ahora es **del árbol**, no del
  repositorio: dos sesiones en worktrees distintos pueden editar el mismo archivo sin
  bloquearse. Solo se bloquean las que comparten árbol. Lo lleva el hook
  `~/.claude/hooks/sesiones.sh` y los candados viven en `<repo>/.claude/sesiones/`, que es
  común a todos los worktrees: desde tu worktree sigues viendo a las demás sesiones. Ese
  hook está fuera de git y es global a todos los proyectos; hay copia para el registro en
  `scripts/hooks/`, con instrucciones para restaurarlo si se pierde.
- **Reclamar la tarea en `_ESTADO.md` sigue siendo obligatorio**, y sigue siendo lo que
  evita que dos sesiones hagan lo mismo. El worktree evita que se pisen los archivos, no
  que dupliquen el trabajo.
- **Commitea por nombre**, siempre: `git commit -- ruta/al/archivo`. En tu propio worktree
  ya no hay índice ajeno que llevarse, pero la costumbre vale igual y no cuesta nada.
- **Al terminar**: commit, `git push` de tu rama y dilo en el tablón. Lo que no está
  empujado no existe: los worktrees se borran.

### Cuándo NO hace falta

Si eres la única sesión viva —el hook te lo dice al arrancar— puedes trabajar en el árbol
principal sin más. El worktree resuelve un problema de concurrencia; sin concurrencia solo
añade pasos.
