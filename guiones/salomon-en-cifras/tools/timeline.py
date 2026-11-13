"""The one timeline: voice durations + pauses -> line starts, hits, shots, subtitle cues. Writes timeline.json and subtitulos.srt."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); F = os.path.dirname(HERE)
dur = json.load(open(os.path.join(F, 'voices', 'dur.json'), encoding='utf-8'))
# (id, pause after, subtitle with *keywords*)
SCRIPT = [
    ('l01', .15, 'Vi a *Salomón* componer *3.000* proverbios…'), ('l01b', .5, '¿y aun así se *desvió*?'),
    ('l03', .25, 'En *Gabaón*, Dios le dijo en sueños:'), ('l03b', .5, '*Pide* lo que quieras.'),
    ('l04', .3, 'No pidió *riquezas*.'), ('l04b', .3, 'Pidió un *corazón entendido*.'),
    ('l05', .5, 'Y Dios se lo *dio*.'),
    ('l06', .3, '*3.000* proverbios.'), ('l06b', .35, '*1.005* cantares.'),
    ('l07', .3, '*7 años* construyendo el templo.'), ('l08', 1.3, '*13 años*, su propio palacio.'),
    ('l09', .2, 'Pero tuvo *700* esposas'), ('l09b', .5, 'y *300* concubinas.'),
    ('l10', .15, 'En su *vejez*,'), ('l10b', .4, 'ellas inclinaron su corazón tras *otros dioses*.'),
    ('l11', .4, 'Levantó *altares* en el monte frente a Jerusalén.'),
    ('l12', 1.4, 'Su corazón ya no era *completo* con Dios.'),
    ('l13', .3, 'En sus *Proverbios* se lee:'), ('l13b', .5, 'sobre todo, *guarda tu corazón*.'),
    ('l14', .6, 'Tu corazón se cuida *cada día*.'),
    ('l15', .3, 'Si Dios te dijera «*pide*»…'), ('l15b', 1.8, '¿Qué pedirías? Dilo en *una palabra*.'),
]
t = .45; L = {}; H = {}
for i, p, s in SCRIPT:
    L[i] = {'at': round(t, 3), 'dur': dur[i]}; H[i] = round(t, 3); t += dur[i] + p
DUR = round(t, 2)
e = lambda i: H[i] + dur[i]
H.update(pide=H['l03b'], corazon=H['l04b'], oro=H['l06'], giro=H['l09'], altares=H['l11'], apaga=H['l12'], guarda=H['l13b'], pregunta=H['l15b'], s1=H['l08'] + dur['l08'], s2=H['l12'] + dur['l12'])
SHOTS = [['S1', 0, 'cut'], ['S2', H['l03'] - .25, 'dissolve'], ['S3', H['l03b'] - .2, 'dissolve'], ['S4', H['l04b'] - .3, 'dissolve'], ['S5', H['l06'] - .2, 'dissolve'], ['S6', H['l07'] - .2, 'dissolve'], ['S7', H['l08'] - .2, 'dissolve'], ['S8', H['l09'] - .3, 'dissolve'], ['S9', H['l10b'] - .3, 'dissolve'], ['S10', H['l12'] - .2, 'dissolve'], ['S11', H['l13'] - .3, 'dissolve'], ['S12', H['l15'] - .4, 'dissolve']]
SHOTS = [[a, round(b, 3), c] for a, b, c in SHOTS]
cues = []
for n, (i, p, s) in enumerate(SCRIPT):
    t0 = L[i]['at']; nxt = L[SCRIPT[n + 1][0]]['at'] if n + 1 < len(SCRIPT) else DUR - .7
    t1 = nxt if n + 1 == len(SCRIPT) else min(nxt - .04, max(t0 + dur[i] + .55, t0 + 1.8))
    cues.append({'t0': round(t0 - .05, 3), 't1': round(t1, 3), 'text': s})
json.dump({'DUR': DUR, 'L': L, 'HIT': H, 'SHOTS': SHOTS, 'cues': cues}, open(os.path.join(F, 'timeline.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
def ts(x): h, m = int(x // 3600), int(x % 3600 // 60); return f'{h:02}:{m:02}:{x % 60:06.3f}'.replace('.', ',')
with open(os.path.join(F, 'subtitulos.srt'), 'w', encoding='utf-8') as f:
    for n, c in enumerate(cues, 1): f.write(f"{n}\n{ts(c['t0'])} --> {ts(c['t1'])}\n{c['text'].replace('*', '')}\n\n")
print('DUR', DUR, 'shots', [(a, b) for a, b, _ in SHOTS])
