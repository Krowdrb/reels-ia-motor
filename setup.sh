#!/usr/bin/env bash
# Prepara el entorno: espeak-ng (fonemas), modelo de voz Kokoro, iconos Lucide y fuente Inter Tight.
# Idempotente: si algo ya está, lo salta. Uso: bash setup.sh
set -euo pipefail
R="$(cd "$(dirname "$0")" && pwd)"
M="${REELS_MODELS:-$HOME/.cache/reels-ia}"
mkdir -p "$M" "$R/assets"

need() { command -v "$1" >/dev/null 2>&1; }
for c in ffmpeg node python3 git cmake gcc; do need "$c" || { echo "Falta $c"; exit 1; }; done
python3 -c "import onnxruntime, numpy, scipy, PIL" || { echo "Faltan paquetes Python (onnxruntime numpy scipy pillow)"; exit 1; }
node -e "require('playwright')" || { echo "Falta Playwright para Node"; exit 1; }

# 1) espeak-ng desde el código fuente (pip/apt suelen estar bloqueados; GitHub no)
if ! need espeak-ng; then
  echo "== Compilando espeak-ng"
  T=$(mktemp -d); git clone -q --depth 1 https://github.com/espeak-ng/espeak-ng.git "$T/es"
  (cd "$T/es" && cmake -B build -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/usr/local -DUSE_MBROLA=OFF \
     -DUSE_LIBSONIC=OFF -DUSE_LIBPCAUDIO=OFF -DUSE_SPEECHPLAYER=OFF -DUSE_KLATT=OFF -DUSE_ASYNC=OFF >/dev/null \
   && cmake --build build -j"$(nproc)" >/dev/null && cmake --install build >/dev/null)
  ldconfig || true; rm -rf "$T"
fi

# 2) Modelo Kokoro (releases de GitHub)
U=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
[ -s "$M/kokoro-v1.0.onnx" ] || { echo "== Descargando modelo de voz"; curl -sSL -o "$M/kokoro-v1.0.onnx" "$U/kokoro-v1.0.onnx"; }
[ -s "$M/voices-v1.0.bin" ] || curl -sSL -o "$M/voices-v1.0.bin" "$U/voices-v1.0.bin"

# 3) Iconos Lucide
if [ ! -d "$R/assets/lucide/icons" ]; then
  echo "== Iconos Lucide"
  git clone -q --depth 1 --filter=blob:none --sparse https://github.com/lucide-icons/lucide.git "$R/assets/lucide"
  (cd "$R/assets/lucide" && git sparse-checkout set icons >/dev/null 2>&1)
fi

# 4) Fuente Inter Tight
if [ ! -f "$R/assets/InterTight.ttf" ]; then
  echo "== Fuente Inter Tight"
  T=$(mktemp -d); git clone -q --depth 1 --filter=blob:none --sparse https://github.com/google/fonts.git "$T/gf"
  (cd "$T/gf" && git sparse-checkout set --no-cone 'ofl/intertight/InterTight[[]wght[]].ttf' >/dev/null 2>&1 || git sparse-checkout set ofl/intertight >/dev/null)
  cp "$T"/gf/ofl/intertight/InterTight\[wght\].ttf "$R/assets/InterTight.ttf"; rm -rf "$T"
fi

# 5) Grano de película
[ -f "$R/assets/grain/g7.png" ] || python3 - "$R/assets/grain" <<'EOF'
import os, sys, numpy as np
from PIL import Image
d = sys.argv[1]; os.makedirs(d, exist_ok=True); rng = np.random.default_rng(3)
for i in range(8):
    Image.fromarray(rng.normal(128, 50, (960, 540)).clip(0, 255).astype(np.uint8), 'L').save(f'{d}/g{i}.png')
EOF
espeak-ng -q --ipa -v es-419 "listo" >/dev/null && echo "OK: entorno listo"
