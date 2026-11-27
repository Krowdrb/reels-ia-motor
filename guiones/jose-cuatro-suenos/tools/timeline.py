"""The one timeline: voice durations + pauses -> line starts, hits, shots, subtitle cues. Writes timeline.json and subtitulos.srt (Cuatro sueños, Mateo 1:18–25; 2:13–15, 19–23)."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); F = os.path.dirname(HERE)
dur = json.load(open(os.path.join(F, 'voices', 'dur.json'), encoding='utf-8'))
# (id, pause after, subtitle with *keywords*). Real silences: after l05b (the lamp goes out, before the first dream)
# and after l11b (the four veils hang over the workshop, before «Ni una palabra»).
# l01: «Cuatro sueños» is already on the paper title strip, so the subtitle starts at «…tuvo José».
SCRIPT = [
    ('l01', .15, '*Cuatro sueños* tuvo *José*, el esposo de María…'), ('l02', .4, 'y los evangelios no guardan *ni una palabra* suya.'),
    ('l03', .3, 'Estoy en su taller, en *Nazaret*.'),
    ('l04', .1, '*María* espera un hijo,'), ('l04b', .25, 'y aún *no viven juntos*.'),
    ('l05', .15, 'Él es *justo*…'), ('l05b', 1.5, 'y piensa dejarla *en secreto*.'),
    ('l06', .15, '*Primer* sueño.'), ('l06b', .2, 'Un ángel: *no temas* recibir a María.'),
    ('l07', .4, 'Despierta, y hace lo que el ángel *le mandó*.'),
    ('l08', .1, '*Segundo* sueño: huye a *Egipto*'), ('l08b', .15, 'con el niño y *su madre*.'),
    ('l09', .35, '*De noche*, se van.'), ('l10', .3, '*Tercero*: vuelve a *Israel*.'),
    ('l11', .15, '*Cuarto*: un aviso…'), ('l11b', 1.45, 'y se van a Galilea, a *Nazaret*.'),
    ('l12', .3, '*Ni una palabra*.'), ('l12b', .6, '*Cuatro veces*, *se levantó*.'),
    ('l13', 1.9, '*¿Cuál sueño* te costaría más?'),
]
t = .25; L = {}; H = {}
for i, p, s in SCRIPT:
    L[i] = {'at': round(t, 3), 'dur': dur[i]}; H[i] = round(t, 3); t += dur[i] + p
DUR = round(t, 2)
e = lambda i: H[i] + dur[i]
# key moments for shots.js / mix.py (the animator tunes these); Clawd's four taps start at tap1, every .3 s
H.update(tap1=round(H['l01'] + .05, 3), title_out=4.2,
         silencio1=round(e('l05b'), 3), primer=H['l06'], notemas=round(H['l06b'] + .35 * dur['l06b'], 3),
         despierta=H['l07'], segundo=H['l08'], huida=H['l09'], tercero=H['l10'], cuarto=H['l11'],
         nazaret=round(H['l11b'] + .6 * dur['l11b'], 3), silencio2=round(e('l11b'), 3),
         nipalabra=H['l12'], cuatroveces=H['l12b'], levanto=round(e('l12b') - .45, 3), pregunta=H['l13'])
# P1..P12 of TREATMENT.md §5, named S1..S12 for shots.js (main.js knows 'cut' and 'dissolve').
# S5 holds through silence 1 (the lamp goes out). P8 is split in two shots: S8 (the second veil, in Belén) and S8b (the flight by night, dissolved
# through light). S11 starts just before silence 2: the four veils over the workshop hang still in the silence, then line up (the climax).
SHOTS = [['S1', 0, 'cut'], ['S2', H['l02'] - .1, 'dissolve'], ['S3', H['l03'] - .2, 'dissolve'], ['S4', H['l04'] - .2, 'dissolve'],
         ['S5', H['l05'] - .15, 'dissolve'], ['S6', H['l06'] - .1, 'cut'], ['S7', H['l07'] - .1, 'dissolve'], ['S8', H['l08'] - .15, 'dissolve'],
         ['S8b', H['l08b'] - .1, 'dissolve'], ['S9', H['l10'] - .15, 'dissolve'], ['S10', H['l11'] - .15, 'dissolve'], ['S11', round(e('l11b') - .35, 3), 'dissolve'],
         ['S12', H['l13'] - .25, 'dissolve']]
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
if DUR > 45: print('AVISO: pasa de 45 s; bajar pausas cortas (.40 -> .30) y luego unir l04/l04b y l05/l05b (no acelerar la voz ni tocar los dos silencios)')
