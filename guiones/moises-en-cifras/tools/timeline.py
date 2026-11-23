"""The one timeline: voice durations + pauses -> line starts, hits, shots, subtitle cues. Writes timeline.json and subtitulos.srt (Moisés en cifras: 40, 80 y 120)."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); F = os.path.dirname(HERE)
DUR_FILE = os.path.join(F, 'voices', 'dur.json')
if os.path.exists(DUR_FILE):
    dur = json.load(open(DUR_FILE, encoding='utf-8'))
else:  # before the voices exist: rough estimate from lines.json so the file still runs (calibrated on lazaro-cuatro-dias: 524 chars, 44.13 s)
    lines = json.load(open(os.path.join(F, 'voices', 'lines.json'), encoding='utf-8'))
    dur = {l['id']: round(.25 + 0.054 * len(l['text']), 3) for l in lines}
    print('AVISO: sin voices/dur.json; duraciones estimadas')
# (id, pause after, subtitle with *keywords*). Real silences: after l08 (before «¡Moisés, Moisés!») and after l14 (before the Nebo).
SCRIPT = [
    ('l01', .15, '*Moisés* tenía *ochenta años*…'), ('l02', .35, 'y yo estaba *con él*.'),
    ('l03', .35, 'A los *cuarenta*, vivía en el *palacio*.'), ('l04', .15, 'Defendió a un *hebreo*…'),
    ('l05', .5, 'mató a un egipcio y *huyó*.'), ('l06', .5, '*Cuarenta años* fue *pastor* en Madián.'),
    ('l07', .3, 'Entonces vi la *zarza*.'), ('l08', 1.5, 'Ardía… y *no se consumía*.'),
    ('l09', .5, '¡*Moisés*, *Moisés*!'), ('l10', .3, 'Dios lo *llamó* así.'),
    ('l11', .4, 'Quítate el calzado: es *tierra santa*.'), ('l12', .3, 'Te envío al *faraón*.'),
    ('l13', .45, 'Con *ochenta años*, *fue*.'), ('l14', 1.45, 'Y guio a su pueblo *cuarenta años*.'),
    ('l15', .3, 'A los *ciento veinte*, subió al *Nebo*.'), ('l16', .4, 'Su *vista* seguía *intacta*.'),
    ('l17', .5, 'Vio la *tierra prometida*… y *no entró*.'), ('l18', .7, '*Nadie conoce* su sepulcro.'),
    ('l19', .5, 'Para Dios, *no era tarde*.'), ('l20', 1.8, '¿Para ti es *tarde*?'),
]
t = .25; L = {}; H = {}
for i, p, s in SCRIPT:
    L[i] = {'at': round(t, 3), 'dur': dur[i]}; H[i] = round(t, 3); t += dur[i] + p
DUR = round(t, 2)
e = lambda i: H[i] + dur[i]
# key moments for shots.js / mix.py (the animator tunes these)
H.update(mato=round(H['l05'] + .2, 3), zarza=H['l07'], silencio1=round(e('l08'), 3), voz=H['l09'],
         estallido=round(e('l09') - .5, 3), faraon=H['l12'], silencio2=round(e('l14'), 3), nebo=H['l15'],
         tierra=H['l17'], vacia=H['l18'], leccion=H['l19'], pregunta=H['l20'])
# P1..P12 of TREATMENT.md §5, named S1..S12 for shots.js (main.js knows 'cut' and 'dissolve')
SHOTS = [['S1', 0, 'cut'], ['S2', H['l03'] - .2, 'dissolve'], ['S3', H['l04'] - .2, 'dissolve'], ['S4', H['l06'] - .2, 'dissolve'],
         ['S5', H['l07'] - .2, 'dissolve'], ['S6', H['l09'] - .1, 'cut'], ['S7', H['l11'] - .1, 'cut'], ['S8', H['l13'] - .2, 'dissolve'],
         ['S9', H['l14'] - .2, 'dissolve'], ['S10', H['l15'] - .2, 'dissolve'], ['S11', H['l17'] - .2, 'dissolve'], ['S12', H['l18'] - .5, 'dissolve']]
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
if DUR > 45: print('AVISO: pasa de 45 s; primero bajar pausas cortas, luego quitar l02 o l13 (no tocar los silencios ni acelerar la voz)')
