"""The one timeline: voice durations + pauses -> line starts, hits, shots, subtitle cues. Writes timeline.json and subtitulos.srt (La Transfiguración, Mateo 17:1–9; Marcos 9:2–10; Lucas 9:28–36)."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); F = os.path.dirname(HERE)
dur = json.load(open(os.path.join(F, 'voices', 'dur.json'), encoding='utf-8'))
# (id, pause after, subtitle with *keywords*). 100 words in 22 lines; no line starts with J.
# Real silences (TREATMENT.md §2 and §7): after l06b (silence 1, before the cloud) and after l09b (silence 2, after «con gran temor»).
SCRIPT = [
    ('l01', .1, '*Pedro* vio a Jesús brillar *como el sol*…'), ('l02', .4, 'y junto a él, *Moisés* y *Elías*.'),
    ('l03', .1, '*Seis días* después, cuenta *Mateo*,'), ('l03b', .25, 'subimos a un *monte alto*.'),
    ('l04', .1, 'Solo *tres discípulos*:'), ('l04b', .3, '*Pedro*, *Santiago* y *Juan*.'),
    ('l05', .3, 'Arriba, su ropa se volvió *blanca como la luz*.'),
    ('l06', .1, '*Pedro*, sin saber qué decir,'), ('l06b', 1.5, 'propuso *tres tiendas*.'),
    ('l07', .1, '*Aún hablaba*…'), ('l07b', .3, 'cuando una *nube de luz* los cubrió.'),
    ('l08', .15, 'Y *una voz*:'), ('l08b', .25, 'Este es mi *Hijo amado*.'), ('l08c', .45, '*A él oíd*.'),
    ('l09', .1, 'Cayeron sobre *sus rostros*,'), ('l09b', 1.5, 'con *gran temor*.'),
    ('l10', .15, 'Pero Jesús se acercó, *los tocó*:'), ('l10b', .3, 'Levantaos, *no temáis*.'),
    ('l11', .1, 'Y *a nadie* vieron,'), ('l11b', .45, 'sino a *Jesús solo*.'),
    ('l12', .4, 'Bastaba *oírlo a él*.'),
    ('l13', 1.9, '*¿A quién oyes?*'),
]
t = .25; L = {}; H = {}
for i, p, s in SCRIPT:
    L[i] = {'at': round(t, 3), 'dur': dur[i]}; H[i] = round(t, 3); t += dur[i] + p
DUR = round(t, 2)
e = lambda i: H[i] + dur[i]
# key moments for shots.js / mix.py (the animator tunes these)
H.update(title_out=3.6, sol=round(H['l01'] + .6 * dur['l01'], 3), moises=H['l02'], seis=H['l03'], tres=H['l04'], nombres=H['l04b'],
         luz=round(H['l05'] + .55 * dur['l05'], 3), tiendas=H['l06b'], silencio1=round(e('l06b'), 3), nube=H['l07b'],
         voz=H['l08'], hijo=H['l08b'], aeloid=H['l08c'], temor=H['l09'], silencio2=round(e('l09b'), 3),
         toca=round(H['l10'] + .7 * dur['l10'], 3), levantaos=H['l10b'], solo=H['l11b'], leccion=H['l12'], pregunta=H['l13'])
# P1..P12 of TREATMENT.md §5 as S1..S12 (main.js knows 'cut' and 'dissolve'). S1 -> S2 is a cut hidden by the mist curtain (it closes at the end of S1
# and opens at the start of S2); S5 holds silence 1 and S8 holds silence 2; the last shot starts on the question.
SHOTS = [['S1', 0, 'cut'], ['S2', H['l03'] - .2, 'cut'], ['S3', H['l04'] - .15, 'dissolve'], ['S4', H['l05'] - .15, 'dissolve'],
         ['S5', H['l06'] - .1, 'dissolve'], ['S6', H['l07'] - .2, 'cut'], ['S7', H['l08'] - .1, 'dissolve'], ['S8', H['l09'] - .1, 'cut'],
         ['S9', H['l10'] - .2, 'dissolve'], ['S10', H['l11'] - .15, 'dissolve'], ['S11', H['l12'] - .25, 'dissolve'], ['S12', H['l13'], 'dissolve']]
SHOTS = [[a, round(b, 3), c] for a, b, c in SHOTS]
cues = []
for n, (i, p, s) in enumerate(SCRIPT):
    t0 = L[i]['at']; nxt = L[SCRIPT[n + 1][0]]['at'] if n + 1 < len(SCRIPT) else DUR
    t1 = nxt if n + 1 == len(SCRIPT) else min(nxt - .04, max(t0 + dur[i] + .55, t0 + 1.8))
    if p >= 1.4: t1 = min(t1, t0 + dur[i] + .3)  # no subtitle during the two silences
    cues.append({'t0': round(max(0, t0 - .05), 3), 't1': round(t1, 3), 'text': s})
cues[-1]['t1'] = DUR  # the CTA stays until the end
json.dump({'DUR': DUR, 'L': L, 'HIT': H, 'SHOTS': SHOTS, 'cues': cues}, open(os.path.join(F, 'timeline.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
def ts(x): h, m = int(x // 3600), int(x % 3600 // 60); return f'{h:02}:{m:02}:{x % 60:06.3f}'.replace('.', ',')
with open(os.path.join(F, 'subtitulos.srt'), 'w', encoding='utf-8') as f:
    for n, c in enumerate(cues, 1): f.write(f"{n}\n{ts(c['t0'])} --> {ts(c['t1'])}\n{c['text'].replace('*', '')}\n\n")
print('DUR', DUR, 'shots', [(a, b) for a, b, _ in SHOTS])
if DUR > 45: print('AVISO: pasa de 45 s; bajar pausas cortas (.45/.40 -> .30) y luego acortar l05 a «Arriba, su ropa, blanca como la luz.» (no acelerar la voz ni tocar los dos silencios, mínimo 1,3 s)')
