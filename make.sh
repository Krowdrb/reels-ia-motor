#!/usr/bin/env bash
# Uso:
#   bash make.sh preview guion.json   -> voz, tiempos, audio y una hoja de fotogramas (preview.jpg) para revisar
#   bash make.sh render  guion.json   -> video final MP4 + subtitulos.srt + portada.png + descripcion.txt
# Carpeta de trabajo: $REELS_OUT/<slug> (por defecto ~/reels/<slug>)
set -euo pipefail
R="$(cd "$(dirname "$0")" && pwd)"
MODE="$1"; G="$(realpath "$2")"
SLUG=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))['slug'])" "$G")
W="${REELS_OUT:-$HOME/reels}/$SLUG"; mkdir -p "$W"
cd "$W"

prepare() {
  python3 "$R/engine/build.py" "$G" "$W"
  cp "$R/page/index.html" "$R/page/render.js" "$R/page/thumb.html" "$R/page/characters.js" "$R/page/char3d.js" "$R/engine/audio.py" "$W/"
  ln -sfn "$R/page/vendor" "$W/vendor"
  ln -sfn "$R/assets" "$W/assets"
  STYLE=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1])).get('style','motion'))" "$G")
  if [ "$STYLE" = "cinematico" ]; then cp "$R/page/cine.html" "$W/index.html"; cp "$R/engine/audio_cine.py" "$W/audio.py"; fi
  [ -f "$W/icons.js" ] || python3 - "$R/assets/lucide/icons" "$W/icons.js" <<'EOF'
import json, os, re, sys
d = {}
for f in os.listdir(sys.argv[1]):
    if f.endswith('.svg'):
        s = open(os.path.join(sys.argv[1], f)).read()
        m = re.search(r'>\s*(.*)</svg>', s, re.S)
        if m: d[f[:-4]] = ' '.join(m.group(1).split())
open(sys.argv[2], 'w').write('const ICONS=' + json.dumps(d) + ';\n')
EOF
  python3 audio.py
  PRE="acompressor=threshold=-20dB:ratio=3:attack=3:release=90:makeup=4,alimiter=limit=0.5:attack=2:release=40:level=disabled"
  M=$(ffmpeg -hide_banner -i mix_raw.wav -af "$PRE,loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
  II=$(echo "$M" | python3 -c "import json,sys;d=json.load(sys.stdin);print(f\"measured_I={d['input_i']}:measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}:measured_thresh={d['input_thresh']}:offset={d['target_offset']}\")")
  ffmpeg -y -hide_banner -loglevel error -i mix_raw.wav -af "$PRE,loudnorm=I=-14:TP=-1.5:LRA=11:$II:linear=true,aresample=48000" -c:a pcm_s16le mix.wav
}

if [ "$MODE" = "preview" ]; then
  prepare
  # fotogramas: 0.6 s después de cada beat y en el último segundo de cada escena
  TS=$(python3 -c "
import json;tl=json.load(open('timeline.json'));ts=[]
for s in tl['scenes']:
    for b in s['beats']:
        ts.append(s['s']+b['t']+0.6)
        if isinstance(b.get('cross'),dict): ts.append(s['s']+b['cross']['t']+0.5)
        for it in b.get('items',[]):
            if isinstance(it,dict) and 't' in it and it is b['items'][-1]: ts.append(s['s']+it['t']+0.5)
    for sh in s.get('shots',[]): ts.append(s['s']+sh.get('t',0)+1.2)
    ts.append(s['e']-0.3)
print(' '.join(f'{min(t,tl[\"total\"]-0.05):.2f}' for t in sorted(set(round(x,2) for x in ts))))")
  rm -rf prev && mkdir prev
  node render.js stills prev $TS
  ls prev/*.jpg | sort -t_ -k2 -g | sed "s|^|file '$W/|;s|$|'|" > prev/l.txt
  NF=$(wc -l < prev/l.txt); COLS=6; ROWS=$(( (NF + COLS - 1) / COLS ))
  ffmpeg -y -loglevel error -f concat -safe 0 -i prev/l.txt -vf "scale=270:480,tile=${COLS}x${ROWS}:padding=6:color=white" -frames:v 1 preview.jpg
  echo "OK preview: $W/preview.jpg ($NF fotogramas: $TS)"
  exit 0
fi

if [ "$MODE" = "render" ]; then
  [ -f mix.wav ] || prepare
  mkdir -p parts
  python3 -c "
import json;tl=json.load(open('timeline.json'))
for s in tl['scenes']: print(s['i'], round(s['s']*30), round(s['e']*30))" > ranges.txt
  P=$(nproc); [ "$P" -gt 4 ] && P=4
  cat ranges.txt | xargs -P"$P" -L1 sh -c 'node render.js video parts/tmp_$0.mp4 $1 $2 && mv parts/tmp_$0.mp4 parts/s$0.mp4'
  : > list.txt; while read i a b; do echo "file 'parts/s$i.mp4'" >> list.txt; done < ranges.txt
  ffmpeg -y -loglevel error -f concat -safe 0 -i list.txt -c copy video_only.mp4
  # Portada: el fotograma más llamativo (cover.jpg) y además el PRIMER fotograma del video,
  # para que ninguna red tome un destello blanco como portada.
  cp "$R/engine/cover.py" "$W/" && python3 cover.py video_only.mp4
  F0=$(head -1 ranges.txt | awk '{print $1}')
  ffmpeg -y -loglevel error -i "parts/s$F0.mp4" -loop 1 -i cover.jpg -filter_complex "[1]scale=1080:1920,format=yuv420p[c];[0][c]overlay=enable='eq(n\,0)':shortest=1" \
    -c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p -r 30 parts/tmp_cover.mp4 && mv parts/tmp_cover.mp4 "parts/s${F0}c.mp4"
  sed "s|parts/s$F0.mp4|parts/s${F0}c.mp4|" list.txt > list_c.txt
  ffmpeg -y -loglevel error -f concat -safe 0 -i list_c.txt -c copy video_only.mp4
  ffmpeg -y -loglevel error -i video_only.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart tmp_final.mp4
  mv tmp_final.mp4 "$SLUG.mp4"
  # GitHub no acepta archivos de más de 100 MB: si pasa de 80 MB, se recomprime (calidad visual casi igual)
  if [ "$(stat -c %s "$SLUG.mp4")" -gt 80000000 ]; then
    ffmpeg -y -loglevel error -i "$SLUG.mp4" -c:v libx264 -preset medium -crf 21 -maxrate 14M -bufsize 28M -pix_fmt yuv420p -c:a copy -movflags +faststart tmp_small.mp4 && mv tmp_small.mp4 "$SLUG.mp4"
  fi
  python3 - "$G" <<'EOF'
import json, sys
g = json.load(open(sys.argv[1]))
open('thumb.js', 'w').write('const THUMB=' + json.dumps(g.get('thumbnail', {}), ensure_ascii=False) + ';\n')
d = g.get('caption', '')
if g.get('hashtags'): d += '\n\n' + ' '.join('#' + h.lstrip('#') for h in g['hashtags'])
open('descripcion.txt', 'w').write(d.strip() + '\n')
EOF
  node render.js thumb portada.png
  LUFS=$(ffmpeg -hide_banner -i "$SLUG.mp4" -af ebur128 -f null - 2>&1 | grep -A2 "Integrated loudness" | grep "I:" | awk '{print $2}')
  DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$SLUG.mp4")
  cp cover.jpg "$SLUG.jpg"
  echo "OK render: $W/$SLUG.mp4 (${DUR}s, ${LUFS} LUFS) + $SLUG.jpg (portada = fotograma más llamativo, $(cat cover.json)) + portada.png (diseño) + subtitulos.srt + descripcion.txt"
  exit 0
fi
echo "Modo desconocido: $MODE (usa preview o render)"; exit 1
