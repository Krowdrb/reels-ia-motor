"""The one timeline: voice durations + pauses -> line starts, hits, shots, subtitle cues. Writes timeline.json and subtitulos.srt."""
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__)); F = os.path.dirname(HERE)
dp = os.path.join(F, 'voices', 'dur.json'); dur = json.load(open(dp, encoding='utf-8')) if os.path.exists(dp) else {}
# (id, pause after, subtitle with *keywords*)
SCRIPT = [
    ('l01', .1, '*Ester* es reina de un imperio de *127 provincias*…'), ('l01b', .4, 'y *no puede ver al rey*.'),
    ('l02', .25, 'Estoy con ella en *Susa*.'),
    ('l03', .15, 'Quien entra *sin ser llamado*, *muere*…'), ('l03b', .45, 'salvo que el rey extienda el *cetro de oro*.'),
    ('l04', .4, 'Y a ella no la llaman hace *30 días*.'),
    ('l05', .35, 'Y hay un *decreto* contra *todo su pueblo*.'),
    ('l06', .1, '*Mardoqueo* le manda decir:'), ('l06b', .45, '¿quién sabe si *para esta hora* llegaste al reino?'),
    ('l07', .25, 'Ella pide *3 días de ayuno*.'), ('l07b', .3, 'Yo los *cuento* a su lado.'),
    ('l07c', 1.6, '*«Y si perezco, que perezca.»*'),                  # silencio 1
    ('l08', .1, 'Al *tercer día* se viste de reina…'),
    ('l08b', 1.8, 'y *entra*.'),                                       # silencio 2
    ('l09', .2, 'El rey extiende el *cetro de oro*…'), ('l09b', .5, 'y *Ester toca la punta*.'),
    ('l10', .15, '*127*, *30*, *3*…'), ('l10b', .45, 'y al final, *un solo gesto*.'),
    ('l11', .4, 'Quizás tú también llegaste *para esta hora*.'),
    ('l12', .2, '¿Cuál es *tu hora*?'), ('l12b', 1.8, 'Dilo en *una palabra*.'),
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
# key moments (TREATMENT §8), refined on the real voice files (energy onsets of the stressed syllables)
H.update(nombre=H['l01'], ciento27=round(H['l01'] + 2.05, 3), no_puede=round(H['l01b'] + .3, 3), susa=round(H['l02'] + 1.05, 3), muere=round(H['l03'] + 1.5, 3),
         cetro1=round(H['l03b'] + 1.75, 3), treinta=round(H['l04'] + 1.63, 3), decreto=round(H['l05'] + .5, 3), pueblo=round(H['l05'] + 1.4, 3),
         mardoqueo=H['l06'], hora=round(H['l06b'] + 1.19, 3), ayuno=round(H['l07'] + 1.1, 3), tres=round(H['l07'] + .67, 3),
         dia1=round(H['l07b'] + .5, 3), dia2=round(H['l07c'] + .25, 3), perezca=round(H['l07c'] + .89, 3), perezca_fin=round(H['l07c'] + 1.42, 3), sil1=round(e('l07c'), 3),
         tercer=round(H['l08'] + .3, 3), entra=round(H['l08b'] + .1, 3), sil2=round(e('l08b'), 3),
         extiende=round(H['l09'] + .3, 3), cetro=round(H['l09'] + .95, 3), toca=round(H['l09b'] + .59, 3),
         n127=H['l10'], n30=round(H['l10'] + .97, 3), n3=round(H['l10'] + 1.56, 3), gesto=round(H['l10b'] + 1.2, 3),
         tu=round(H['l11'] + .46, 3), cta=H['l12'], palabra=round(H['l12b'] + .65, 3), titulo_fin=3.4)
# shots: the two silences are inside S7 (after «que perezca», the last flame out) and S9 (the silent court, after «y entra»)
SHOTS = [['S1', 0, 'cut'], ['S2', H['l02'] - .25, 'dissolve'], ['S3', H['l03b'] - .2, 'cut'], ['S4', H['l04'] - .25, 'dissolve'],
         ['S5', H['l05'] - .2, 'dissolve'], ['S6', H['l06'] - .25, 'dissolve'], ['S7', H['l07'] - .25, 'dissolve'], ['S8', H['l08'] - .15, 'cut'],
         ['S9', e('l08b') + .25, 'cut'], ['S10', H['l09'] - .15, 'cut'], ['S11', H['l10'] - .3, 'dissolve']]
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
