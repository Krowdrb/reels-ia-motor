"""The one timeline: voice durations + pauses -> line starts, hits, shots, subtitle cues. Writes timeline.json and subtitulos.srt (Lázaro, Juan 11)."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); F = os.path.dirname(HERE)
dur = json.load(open(os.path.join(F, 'voices', 'dur.json'), encoding='utf-8'))
# (id, pause after, subtitle with *keywords*). Real silences: after l08 (before «Y Jesús lloró») and after l13 (before «¡Lázaro, ven fuera!»).
SCRIPT = [
    ('l01', .15, '*Lázaro* llevaba *cuatro días* en esta tumba…'), ('l02', .4, 'y Jesús *lloró* antes de llamarlo.'),
    ('l03', .35, 'Yo estaba en *Betania*.'), ('l04', .15, 'Le avisaron que su *amigo* estaba enfermo…'),
    ('l05', .5, 'y aun así, *esperó*.'), ('l06', .1, 'A *Marta* le dijo:'),
    ('l07', .4, 'Yo soy *la resurrección y la vida*.'), ('l08', 1.45, '*María* lloraba a sus pies.'),
    ('l09', .45, 'Y Jesús *lloró*.'), ('l10', .5, 'Aun *sabiendo* lo que haría.'),
    ('l11', .3, 'Quiten *la piedra*, dijo.'), ('l12', .45, 'Marta dudó: ya huele mal, son *cuatro días*.'),
    ('l13', 1.5, 'Él alzó los ojos y dio *gracias al Padre*.'), ('l14', .9, '¡Lázaro, *ven fuera*!'),
    ('l15', .5, 'Y *salió*, atado de manos y pies.'), ('l16', .7, 'Desátenlo y *déjenlo ir*.'),
    ('l17', .5, '*Lloró* antes de llamarlo… y también *llora contigo*.'), ('l18', 1.8, '¿Qué *piedra* le pides que quite?'),
]
t = .25; L = {}; H = {}
for i, p, s in SCRIPT:
    L[i] = {'at': round(t, 3), 'dur': dur[i]}; H[i] = round(t, 3); t += dur[i] + p
DUR = round(t, 2)
e = lambda i: H[i] + dur[i]
# key moments for shots.js / mix.py (the animator tunes these)
H.update(llora=round(H['l09'] + .35, 3), duda=H['l12'], rueda=round(e('l12') - .6, 3), ora=H['l13'],
         silencio1=round(e('l08'), 3), silencio2=round(e('l13'), 3), fuera=round(e('l14') - .35, 3),
         sale=H['l15'], desata=H['l16'], pregunta=H['l18'])
# P1..P12 of TREATMENT.md §5, named S1..S12 for shots.js (main.js knows 'cut' and 'dissolve')
SHOTS = [['S1', 0, 'cut'], ['S2', H['l03'] - .2, 'dissolve'], ['S3', H['l04'] - .2, 'dissolve'], ['S4', H['l06'] - .2, 'dissolve'],
         ['S5', H['l08'] - .2, 'dissolve'], ['S6', H['l09'] - .3, 'dissolve'], ['S7', H['l11'] - .1, 'cut'], ['S8', H['l13'] - .2, 'dissolve'],
         ['S9', H['l14'] - .15, 'dissolve'], ['S10', H['fuera'] + 1.0, 'cut'], ['S11', H['l16'] - .2, 'dissolve'], ['S12', H['l17'] - .25, 'dissolve']]
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
if DUR > 45: print('AVISO: pasa de 45 s; recortar l03 «Yo estaba en Betania.» o bajar pausas cortas (no acelerar la voz)')
