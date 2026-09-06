#!/usr/bin/env bash
# Coordinación entre sesiones concurrentes de Claude Code sobre un mismo repositorio.
#
# Cada sesión tiene su propio archivo en <repo>/.claude/sesiones/<id>.json, así que
# ninguna sesión escribe sobre lo que escribe otra. Antes de editar un archivo, la
# sesión lo reclama; si otra sesión viva **del mismo árbol de trabajo** ya lo tiene
# reclamado, la edición se bloquea.
#
# «Del mismo árbol» es la parte que importa desde que se trabaja con un worktree por
# sesión. Dos sesiones en worktrees distintos que editan el mismo archivo **no se
# pisan**: cada una tiene su copia y git las junta al fusionar, que es justo para lo
# que sirve git. Bloquearlas sería impedir el paralelismo que el worktree existe para
# dar. Lo que sí se pisa —y por eso se sigue bloqueando— son dos sesiones dentro del
# mismo árbol.
#
# El directorio de candados es común a todos los worktrees del repositorio. Se localiza
# con `--git-common-dir` y no con `--show-toplevel`, porque dentro de un worktree el
# segundo devuelve el worktree: cada sesión tendría su propia carpeta de candados,
# ninguna vería a las demás y la coordinación se rompería sin dar un solo error.
#
# Uso (invocado por hooks, lee el JSON del hook por stdin):
#   sesiones.sh registra   -> SessionStart
#   sesiones.sh comprueba  -> PreToolUse (Edit|Write)
#   sesiones.sh libera     -> SessionEnd
#
# Variables de entorno:
#   CLAUDE_SESIONES_TTL_MIN  minutos sin actividad tras los que una sesión se da por
#                            muerta y deja de bloquear (por defecto 30)
#   CLAUDE_SESIONES_MODO     "deny" (por defecto) o "ask" al detectar conflicto
#
# Ante cualquier error el script permite la operación: un candado roto nunca debe
# impedir trabajar.

set -uo pipefail

TTL_MIN=${CLAUDE_SESIONES_TTL_MIN:-30}
MODO=${CLAUDE_SESIONES_MODO:-deny}

ACCION=${1:-}
ENTRADA=$(cat 2>/dev/null || true)

campo() { printf '%s' "$ENTRADA" | jq -r "$1" 2>/dev/null || true; }

BASE=$(campo '.cwd // empty')
[ -n "$BASE" ] || BASE=${CLAUDE_PROJECT_DIR:-$PWD}

# ARBOL: el árbol de trabajo de ESTA sesión. En el repositorio principal es su raíz;
# dentro de un worktree, la raíz del worktree. Es lo que decide si dos sesiones
# comparten archivos de verdad.
ARBOL=$(git -C "$BASE" rev-parse --show-toplevel 2>/dev/null) || ARBOL="$BASE"

# RAIZ: el repositorio principal, el mismo visto desde cualquier worktree. Ahí viven
# los candados, para que todas las sesiones se vean entre sí.
COMUN=$(git -C "$BASE" rev-parse --path-format=absolute --git-common-dir 2>/dev/null)
if [ -n "$COMUN" ] && [ -d "$COMUN" ]; then
    RAIZ=$(dirname "$COMUN")
else
    RAIZ="$ARBOL"
fi

SID=$(campo '.session_id // empty')
[ -n "$SID" ] || SID="sin-id"
SID=${SID//[^a-zA-Z0-9_-]/_}

DIR="$RAIZ/.claude/sesiones"
YO="$DIR/$SID.json"
MUTEX="$DIR/.mutex"

# --- utilidades ---------------------------------------------------------------

# Borra los archivos de sesiones cuya marca de tiempo ha caducado.
purga() {
    find "$DIR" -maxdepth 1 -name '*.json' -mmin "+$TTL_MIN" -delete 2>/dev/null || true
}

# Lista los archivos de sesiones todavía vivas, excluyendo la propia.
vivas() {
    find "$DIR" -maxdepth 1 -name '*.json' -mmin "-$TTL_MIN" 2>/dev/null |
        grep -v -x -F "$YO" || true
}

# mkdir es atómico en POSIX: falla si el directorio ya existe. Eso lo convierte en
# un mutex correcto, a diferencia de leer-un-archivo-y-luego-escribirlo.
toma_mutex() {
    local i=0
    while ! mkdir "$MUTEX" 2>/dev/null; do
        # Un mutex retenido más de un minuto es de una sesión que murió sujetándolo.
        if [ -n "$(find "$MUTEX" -maxdepth 0 -mmin +1 2>/dev/null)" ]; then
            rmdir "$MUTEX" 2>/dev/null || true
        fi
        i=$((i + 1))
        [ "$i" -gt 40 ] && return 1
        sleep 0.1
    done
    trap 'rmdir "$MUTEX" 2>/dev/null || true' EXIT
    return 0
}

crea_propia() {
    jq -n --arg id "$SID" --arg desde "$(date -u +%Y-%m-%dT%H:%M:%SZ)" --arg arbol "$ARBOL" \
        '{id: $id, desde: $desde, arbol: $arbol, archivos: []}' >"$YO" 2>/dev/null || true
}

# El árbol queda anotado en cada reclamo. Las sesiones anteriores a este cambio no lo
# tienen: sin dato, se supone que comparten árbol, que es la suposición prudente
# —bloquear de más molesta, dejar pasar de más destruye trabajo—.
anota_arbol() {
    jq --arg t "$ARBOL" '.arbol = $t' "$YO" >"$YO.tmp" 2>/dev/null && mv "$YO.tmp" "$YO" 2>/dev/null
    rm -f "$YO.tmp" 2>/dev/null
}

# --- acciones -----------------------------------------------------------------

case "$ACCION" in

registra)
    mkdir -p "$DIR" 2>/dev/null || exit 0
    purga
    crea_propia

    otras=$(vivas | wc -l | tr -d ' ')
    if [ "${otras:-0}" -gt 0 ]; then
        detalle=$(vivas | while read -r f; do
            jq -r --arg mio "$ARBOL" '
                "  - " + .id + " (desde " + .desde + ")" +
                (if (.arbol // $mio) == $mio then " · EN TU MISMO ÁRBOL" else " · en otro árbol" end) +
                (if (.archivos // []) | length > 0
                 then ", editando: " + ((.archivos | map(split("/") | last)) | join(", "))
                 else ", sin archivos reclamados" end)' "$f" 2>/dev/null
        done)

        # Cuántas comparten árbol conmigo: son las únicas que pueden pisarme los
        # archivos y el índice de git.
        mismas=$(vivas | while read -r f; do
            jq -r --arg mio "$ARBOL" 'select((.arbol // $mio) == $mio) | .id' "$f" 2>/dev/null
        done | wc -l | tr -d ' ')

        if [ "${mismas:-0}" -gt 0 ]; then
            aviso="ATENCIÓN: $mismas de ellas están en TU MISMO árbol de trabajo ($ARBOL).
Compartís los archivos y también el índice de git, así que un \`git add\` suyo puede
llevarse tu trabajo dentro de su commit. Los archivos que tengan reclamados no los
puedes editar. Si este repositorio pide un worktree por sesión, entra en el tuyo antes
de tocar nada."
        else
            aviso="Ninguna está en tu árbol de trabajo, así que no se pisan contigo:
cada worktree tiene su copia y git las junta al fusionar."
        fi

        jq -n --arg c "Hay $otras sesión(es) de Claude Code activas en este repositorio:
$detalle

$aviso

Si el usuario pide esperar, no hagas sondeos frecuentes: usa /loop con un intervalo largo (20-30 min)." \
            '{hookSpecificOutput: {hookEventName: "SessionStart", additionalContext: $c}}'
    fi
    exit 0
    ;;

comprueba)
    ARCHIVO=$(campo '.tool_input.file_path // empty')
    [ -n "$ARCHIVO" ] || exit 0
    # Nunca bloqueamos ediciones del propio directorio de coordinación.
    case "$ARCHIVO" in "$DIR"/*) exit 0 ;; esac

    mkdir -p "$DIR" 2>/dev/null || exit 0
    toma_mutex || exit 0 # sin mutex no bloqueamos: preferimos permitir a paralizar
    purga
    if [ -f "$YO" ]; then anota_arbol; else crea_propia; fi

    # Solo estorba quien comparte árbol conmigo. Una sesión en otro worktree edita su
    # propia copia del archivo, y eso no es un choque: es trabajo en paralelo.
    duenno=$(vivas | while read -r f; do
        jq -r --arg a "$ARCHIVO" --arg mio "$ARBOL" \
            'select((.arbol // $mio) == $mio) | select((.archivos // []) | index($a)) | .id' \
            "$f" 2>/dev/null
    done | head -1)

    if [ -n "$duenno" ]; then
        jq -n --arg m "$MODO" --arg r "La sesión $duenno ya está trabajando en $ARCHIVO, sigue activa y está en tu mismo árbol de trabajo.
Edita otro archivo, o espera a que esa sesión termine (su reserva caduca sola tras $TTL_MIN minutos sin actividad).
Si necesitas ese archivo ahora, lo limpio es entrar en tu propio worktree: ahí tendrás tu copia y no os pisaréis.
Para forzar el desbloqueo: borra $DIR/$duenno.json" \
            '{hookSpecificOutput: {hookEventName: "PreToolUse",
                                   permissionDecision: $m,
                                   permissionDecisionReason: $r}}'
        exit 0
    fi

    # Libre: lo reclamamos. mv es atómico, y actualiza la marca de tiempo (heartbeat).
    jq --arg a "$ARCHIVO" '.archivos = (((.archivos // []) + [$a]) | unique)' \
        "$YO" >"$YO.tmp" 2>/dev/null && mv "$YO.tmp" "$YO" 2>/dev/null
    rm -f "$YO.tmp" 2>/dev/null
    exit 0
    ;;

libera)
    rm -f "$YO" 2>/dev/null
    rmdir "$DIR" 2>/dev/null # solo se borra si ya está vacío
    exit 0
    ;;

*)
    exit 0
    ;;
esac
