"""The one timeline: voice durations + pauses -> line starts, hits, shots, subtitle cues. Writes timeline.json and subtitulos.srt (El único que se quedó, Juan 19:25–27; Mateo 26:56)."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); F = os.path.dirname(HERE)
dur = json.load(open(os.path.join(F, 'voices', 'dur.json'), encoding='utf-8'))
# (id, pause after, subtitle with *keywords*). Real silences: after l05 (Getsemaní, the lamp goes out) and after l10 (before «Mujer, he ahí tu hijo»).
SCRIPT = [
    ('l01', .15, '*María* estaba al pie de la cruz…'), ('l02', .45, 'y de los discípulos, solo *uno* aparece con ella.'),
    ('l03', .4, 'Yo estaba ahí, *a un lado*.'), ('l04', .1, 'La noche anterior, en *Getsemaní*,'),
    ('l05', 1.5, 'todos lo dejaron y *huyeron*.'), ('l06', .1, 'Ahora, junto a la cruz, estaban *su madre*,'),
    ('l07', .1, 'la *hermana de su madre*,'), ('l08', .4, 'María de Cleofás y *María Magdalena*.'),
    ('l09', .4, 'Y *uno más*: el discípulo *a quien él amaba*.'), ('l10', 1.5, 'Y Jesús *los vio* a los dos.'),
    ('l11', .6, 'Mujer, *he ahí tu hijo*.'), ('l12', .6, 'Y al discípulo: *he ahí tu madre*.'),
    ('l13', .6, 'Desde aquella hora, la recibió *en su casa*.'), ('l14', .5, 'En su hora más oscura, *pensó en ella*.'),
    ('l15', 1.8, '¿Quién se quedó *contigo*?'),
]
t = .25; L = {}; H = {}
for i, p, s in SCRIPT:
    L[i] = {'at': round(t, 3), 'dur': dur[i]}; H[i] = round(t, 3); t += dur[i] + p
DUR = round(t, 2)
e = lambda i: H[i] + dur[i]
# key moments for shots.js / mix.py (the animator tunes these)
H.update(uno=round(H['l02'] + .6 * dur['l02'], 3), huyeron=H['l05'], silencio1=round(e('l05'), 3), luz=H['l06'],
         paso=H['l09'], vio=H['l10'], silencio2=round(e('l10'), 3), mujer=H['l11'], hijo=round(e('l11') - .35, 3),
         madre=H['l12'], casa=H['l13'], ventana=round(e('l13') - .4, 3), pregunta=H['l15'],
         sumadre=round(H['l06'] + .74 * dur['l06'], 3), cleofas=round(H['l08'] + .05, 3), magdalena=round(H['l08'] + .52 * dur['l08'], 3))
# P1..P12 of TREATMENT.md §5, named S1..S12 for shots.js (main.js knows 'cut' and 'dissolve')
SHOTS = [['S1', 0, 'cut'], ['S2', H['uno'] - .5, 'dissolve'], ['S3', H['l03'] - .2, 'dissolve'], ['S4', H['l04'] - .25, 'cut'],
         ['S5', H['l06'] - .1, 'dissolve'], ['S6', H['l07'] - .2, 'dissolve'], ['S7', H['l09'] - .2, 'dissolve'], ['S8', H['l10'] - .2, 'dissolve'],
         ['S9', H['l11'] - .1, 'cut'], ['S10', H['l12'] - .15, 'cut'], ['S11', H['l13'] - .2, 'dissolve'], ['S12', H['l14'] - .25, 'dissolve']]
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
if DUR > 45: print('AVISO: pasa de 45 s; bajar pausas cortas (.40 -> .30) y luego quitar l03 «Yo estaba ahí, a un lado.» (no acelerar la voz ni tocar los silencios)')
