# Copia de seguridad del hook de sesiones

`sesiones.sh` es la copia **para el registro** del hook que coordina las sesiones
concurrentes. El que se ejecuta de verdad no es este: es

    ~/.claude/hooks/sesiones.sh

y está enganchado desde `~/.claude/settings.json` a tres eventos —`SessionStart`,
`PreToolUse` sobre `Edit|Write|NotebookEdit` y `SessionEnd`—.

## Por qué hay una copia aquí

El hook vive fuera del repositorio y **es global a todos los proyectos**, así que no lo
cubre ningún control de versiones. De él dependen dos cosas de este reparto: que las
sesiones se vean entre sí, y que el worktree por sesión funcione. Si se perdiera, la
coordinación no daría un error: se rompería en silencio, cada sesión se creería sola y
volveríamos a los commits cruzados de la incidencia T12.

## Cómo se usa

La copia es **byte a byte idéntica** al original a propósito, para que comprobar si se
han separado sea un `diff` limpio:

```sh
diff ~/.claude/hooks/sesiones.sh scripts/hooks/sesiones.sh && echo "al día"
```

Si difieren, decide cuál manda —normalmente el de `~`, que es el que corre— y actualiza
el otro. Si el de `~` no existe, restaura con:

```sh
cp scripts/hooks/sesiones.sh ~/.claude/hooks/sesiones.sh
chmod +x ~/.claude/hooks/sesiones.sh
```

**Cuidado al editarlo: es global.** Un cambio aquí afecta a todos los repositorios de
Juan Luis, no solo a este.
