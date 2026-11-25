"""The one timeline: voice durations + pauses -> line starts, hits, shots, subtitle cues. Writes timeline.json and subtitulos.srt (Jacob en cifras: 7, 7 y 20 · Dos amaneceres)."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); F = os.path.dirname(HERE)
DUR_FILE = os.path.join(F, 'voices', 'dur.json')
if os.path.exists(DUR_FILE):
    dur = json.load(open(DUR_FILE, encoding='utf-8'))
else:  # before the voices exist: rough estimate from lines.json so the file still runs (calibrated on lazaro-cuatro-dias: 524 chars, 44.13 s)
    lines = json.load(open(os.path.join(F, 'voices', 'lines.json'), encoding='utf-8'))
    dur = {l['id']: round(.25 + 0.054 * len(l['text']), 3) for l in lines}
    print('AVISO: sin voices/dur.json; duraciones estimadas')
# (id, pause after, subtitle with *keywords*). Real silences (1.5 s): after l04 (before «era Lea») and after l12 (before the new name).
SCRIPT = [
    ('l01', .15, '*Siete años* vi a *Jacob* trabajar por Raquel…'), ('l02', .45, 'y la mañana de la boda, *no era ella*.'),
    ('l03', .35, 'Le parecieron *pocos días*: *la amaba*.'), ('l04', 1.5, 'Pero Labán le dio a su *otra hija*.'),
    ('l05', .6, 'Al amanecer… era *Lea*.'), ('l06', .15, 'Tras la semana, recibió a *Raquel*…'),
    ('l07', .4, 'y sirvió *otros siete* años.'), ('l08', .2, '*Catorce años*…'),
    ('l09', .5, '*veinte*, lejos de *casa*.'), ('l10', .4, 'Al volver, junto al *Jaboc*, quedó *solo*.'),
    ('l11', .45, 'Un *varón* luchó con él *hasta el alba*.'), ('l12', 1.5, 'No te dejaré, si no me *bendices*.'),
    ('l13', .6, 'Tu nombre ya no será Jacob, sino *Israel*.'), ('l14', .2, 'Salió el *sol*. Cojeaba…'),
    ('l15', .5, 'pero *bendecido*.'), ('l16', .5, 'Hasta la noche más larga tiene *alba*.'),
    ('l17', 1.8, '¿Tú sigues *esperando* la tuya?'),
]
t = .25; L = {}; H = {}
for i, p, s in SCRIPT:
    L[i] = {'at': round(t, 3), 'dur': dur[i]}; H[i] = round(t, 3); t += dur[i] + p
DUR = round(t, 2)
e = lambda i: H[i] + dur[i]
# key moments for shots.js / mix.py (the animator tunes these)
H.update(velo=round(H['l02'] + .9, 3), piedras7=H['l03'], boda=H['l04'], silencio1=round(e('l04'), 3), lea=H['l05'],
         otros7=H['l07'], catorce=H['l08'], veinte=H['l09'], jaboc=H['l10'], lucha=H['l11'], bendices=H['l12'],
         silencio2=round(e('l12'), 3), nombre=round(H['l13'] + .2, 3), israel=round(e('l13') - .5, 3), sol=H['l14'],
         cojea=round(H['l14'] + .7, 3), leccion=H['l16'], pregunta=H['l17'])
# P1..P12 of TREATMENT.md §5, named S1..S12 for shots.js (main.js knows 'cut' and 'dissolve')
SHOTS = [['S1', 0, 'cut'], ['S2', H['l03'] - .2, 'dissolve'], ['S3', H['l04'] - .2, 'dissolve'], ['S4', H['l05'] - .3, 'cut'],
         ['S5', H['l06'] - .2, 'dissolve'], ['S6', H['l09'] - .2, 'cut'], ['S7', H['l10'] - .2, 'dissolve'], ['S8', H['l11'] - .1, 'cut'],
         ['S9', H['l12'] - .1, 'cut'], ['S10', H['l13'] - .3, 'cut'], ['S11', H['l14'] - .2, 'dissolve'], ['S12', H['l16'] - .5, 'dissolve']]
SHOTS = [[a, round(b, 3), c] for a, b, c in SHOTS]
cues = []
for n, (i, p, s) in enumerate(SCRIPT):
    t0 = L[i]['at']; nxt = L[SCRIPT[n + 1][0]]['at'] if n + 1 < len(SCRIPT) else DUR - .7
    t1 = nxt if n + 1 == len(SCRIPT) else min(nxt - .04, max(t0 + dur[i] + .55, t0 + 1.8))
    if p >= 1.4: t1 = min(t1, t0 + dur[i] + .3)  # no subtitle during the two silences
    cues.append({'t0': round(max(0, t0 - .05), 3), 't1': round(t1, 3), 'text': s})
cues[-1]['t1'] = DUR  # the CTA stays until the end
json.dump({'DUR': DUR, 'L': L, 'HIT': H, 'SHOTS': SHOTS, 'cues': cues}, open(os.path.join(F, 'timeline.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
def ts(x): h, m = int(x // 3600), int(x % 3600 // 60); return f'{h:02}:{m:02}:{x % 60:06.3f}'.replace('.', ',')
with open(os.path.join(F, 'subtitulos.srt'), 'w', encoding='utf-8') as f:
    for n, c in enumerate(cues, 1): f.write(f"{n}\n{ts(c['t0'])} --> {ts(c['t1'])}\n{c['text'].replace('*', '')}\n\n")
print('DUR', DUR, 'shots', [(a, b) for a, b, _ in SHOTS])
if DUR > 45: print('AVISO: pasa de 45 s; primero bajar pausas cortas, luego cambiar l03 o quitar l08 (no tocar los silencios ni acelerar la voz)')
