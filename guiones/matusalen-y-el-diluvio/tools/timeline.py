"""The one timeline: voice durations + pauses -> line starts, hits, shots, subtitle cues. Writes timeline.json and subtitulos.srt."""
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__)); F = os.path.dirname(HERE)
dp = os.path.join(F, 'voices', 'dur.json'); dur = json.load(open(dp, encoding='utf-8')) if os.path.exists(dp) else {}
# (id, pause after, subtitle with *keywords*)
SCRIPT = [
    ('l01', .15, '*Matusalén* vivió *969 años*.'), ('l01b', .25, 'Estoy sentada *a su lado*.'),
    ('l02', .45, '¿Sabes qué pasó el *año en que murió*?'),
    ('l03', .1, 'A los *187*,'), ('l03b', .3, 'tuvo a su hijo *Lamec*.'),
    ('l04', .1, 'Lamec, a los *182*,'), ('l04b', .1, 'tuvo a *Noé*, y dijo:'), ('l04c', .4, '*«este nos consolará»*.'),
    ('l05', .1, 'Noé tenía *600 años*'), ('l05b', .35, 'cuando llegó el *diluvio*.'),
    ('l06', .2, 'Suma conmigo, con *las cifras del texto*:'), ('l06b', .1, '*187* + *182*,'),
    ('l06c', 1.6, '+ *600*…'),                                   # silencio 1
    ('l07', .3, '*969*.'), ('l07b', .4, 'Murió *el mismo año* del diluvio.'),
    ('l08', 1.5, 'La Biblia *no dice cómo*.'),                  # silencio 2
    ('l09', .35, '*Dios esperó* una *vida entera*.'),
    ('l09b', .05, 'Su *paciencia* esperaba'), ('l09c', .45, 'mientras se preparaba *el arca*.'),
    ('l10', .4, 'Y hoy también *te espera a ti*.'),
    ('l11', .2, '¿Qué le *dirías*?'), ('l11b', 1.8, 'Dilo en *una palabra*.'),
]
if not all(i in dur for i, _, _ in SCRIPT):  # no voices yet: estimate from lines.json (~0.36 s/word) so the script still runs
    print('WARNING: voices/dur.json missing or incomplete; using estimated durations')
    txt = {x['id']: x['text'] for x in json.load(open(os.path.join(F, 'voices', 'lines.json'), encoding='utf-8'))}
    for i, _, _ in SCRIPT: dur.setdefault(i, round(.36 * len(re.findall(r'\w+', txt[i])) + .25, 3))
t = .3; L = {}; H = {}
for i, p, s in SCRIPT:
    L[i] = {'at': round(t, 3), 'dur': dur[i]}; H[i] = round(t, 3); t += dur[i] + p
DUR = round(t, 2)
e = lambda i: H[i] + dur[i]
# key moments from TREATMENT §8, refined on the real voice files (energy onsets of the stressed syllables)
H.update(nombre=H['l01'], novecientos=round(H['l01'] + 1.15, 3), pregunta=H['l02'], alos=H['l03'], siete=round(H['l03'] + 1.29, 3), lamec=round(H['l03b'] + .8, 3),
         dos=round(H['l04'] + 1.67, 3), noe=round(H['l04b'] + .35, 3), consolara=round(H['l04c'] + .55, 3),
         seiscientos=round(H['l05'] + .77, 3), diluvio=round(H['l05b'] + .9, 3), suma187=round(H['l06b'] + .86, 3), suma182=round(H['l06b'] + 2.45, 3), suma600=round(H['l06c'] + .31, 3),
         sil1=round(e('l06c'), 3), campana=H['l07'], mismo_ano=round(H['l07b'] + .73, 3), no_dice=H['l08'], sil2=round(e('l08'), 3), dios=H['l09'], entera=round(H['l09'] + 1.45, 3),
         paciencia=H['l09b'], arca=round(H['l09c'] + 1.2, 3), espera=round(H['l10'] + .86, 3), cta=H['l11'], palabra=round(H['l11b'] + .65, 3), titulo_fin=3.4)
SHOTS = [['S1', 0, 'cut'], ['S2', H['l03'] - .25, 'dissolve'], ['S3', H['l04'] - .2, 'dissolve'], ['S4', H['l04c'] - .3, 'cut'],
         ['S5', H['l05'] - .2, 'dissolve'], ['S6', H['l06'] - .25, 'dissolve'], ['S7', H['l07'] - .12, 'cut'], ['S8', H['l08'] - .2, 'dissolve'],
         ['S9', H['l09'] - .3, 'cut'], ['S10', H['l09b'] - .2, 'dissolve'], ['S11', H['l10'] - .3, 'dissolve']]
SHOTS = [[a, round(b, 3), c] for a, b, c in SHOTS]
cues = []
for n, (i, p, s) in enumerate(SCRIPT):
    t0 = L[i]['at']; nxt = L[SCRIPT[n + 1][0]]['at'] if n + 1 < len(SCRIPT) else DUR
    t1 = nxt if n + 1 == len(SCRIPT) else min(nxt - .04, max(t0 + dur[i] + .55, t0 + 1.8))
    cues.append({'t0': round(t0 - .05, 3), 't1': round(t1, 3), 'text': s})
json.dump({'DUR': DUR, 'L': L, 'HIT': H, 'SHOTS': SHOTS, 'cues': cues}, open(os.path.join(F, 'timeline.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
def ts(x): h, m = int(x // 3600), int(x % 3600 // 60); return f'{h:02}:{m:02}:{x % 60:06.3f}'.replace('.', ',')
with open(os.path.join(F, 'subtitulos.srt'), 'w', encoding='utf-8') as f:
    for n, c in enumerate(cues, 1): f.write(f"{n}\n{ts(c['t0'])} --> {ts(c['t1'])}\n{c['text'].replace('*', '')}\n\n")
print('DUR', DUR, 'shots', [(a, b) for a, b, _ in SHOTS])
