#!/bin/sh
# Rebuild the film (Git Bash on Windows, or Linux). Voices must already be in voices/.
# Optional: SSAA=1 WORKERS=2 LEMO_ANGLE=swiftshader on a machine without a GPU.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
NAME=$(basename "$HERE")
LIB=${LIB:-$(cd "$HERE/../.." && pwd)}
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the library folder"; exit 1; }
cd "$LIB"
PY="$LIB/.venv/Scripts/python.exe"; [ -x "$PY" ] || PY="$LIB/.venv/bin/python"
"$PY" -X utf8 "$HERE/tools/timeline.py"
node core/render/video.mjs "$HERE" --fps 30 --size 1080x1920 --q "ssaa=${SSAA:-1.5}" --workers "${WORKERS:-3}" --out "$HERE/out/video.mp4"
"$PY" -X utf8 "$HERE/mix.py"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/$NAME.mp4" 30 1
