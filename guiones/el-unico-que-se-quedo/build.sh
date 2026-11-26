#!/bin/sh
# Rebuild the film (Git Bash on Windows, or Linux). Voices must already be in voices/.
# Without a GPU (no /dev/dri, or NOGPU=1) it renders with SwiftShader (LEMO_ANGLE=swiftshader, SSAA=1, 2 workers) through
# core/render/chunks.mjs, which is resumable: rerun after an interruption and finished chunks are kept (out/chunks/).
# Overrides: SSAA=… WORKERS=… LEMO_ANGLE=…
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
NAME=$(basename "$HERE")
LIB=${LIB:-$(cd "$HERE/../.." && pwd)}
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the library folder"; exit 1; }
cd "$LIB"
PY="$LIB/.venv/Scripts/python.exe"; [ -x "$PY" ] || PY="$LIB/.venv/bin/python"
"$PY" -X utf8 "$HERE/tools/timeline.py"
if [ -n "$NOGPU" ] || { [ "$(uname -s)" = Linux ] && [ ! -e /dev/dri ]; }; then
  export LEMO_ANGLE=${LEMO_ANGLE:-swiftshader}
  echo "no GPU: LEMO_ANGLE=$LEMO_ANGLE, resumable chunks"
  node core/render/chunks.mjs "$HERE" --fps 30 --size 1080x1920 --q "ssaa=${SSAA:-1}" --workers "${WORKERS:-2}" --chunk 45 --dir "$HERE/out/chunks" --out "$HERE/out/video.mp4"
else
  node core/render/video.mjs "$HERE" --fps 30 --size 1080x1920 --q "ssaa=${SSAA:-1.5}" --workers "${WORKERS:-3}" --out "$HERE/out/video.mp4"
fi
"$PY" -X utf8 "$HERE/mix.py"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/$NAME.mp4" 30 1
