"""The one timeline: voice durations + pauses -> line starts, hits, shots, subtitle cues. Writes timeline.json and subtitulos.srt (Job en cifras)."""
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__)); F = os.path.dirname(HERE)
DP = os.path.join(F, 'voices', 'dur.json')
dur = json.load(open(DP, encoding='utf-8')) if os.path.exists(DP) else {}
# (id, pause after, subtitle with *keywords*)
SCRIPT = [
    ('l01', .25, 'Estoy contando ovejas con Job. ¡*7.000*!'), ('l01b', .5, 'Mañana no quedará *ni una*.'),
    ('l02', .45, 'Y *3.000 camellos*.'),
    ('l03', .35, 'Pero en *un solo día* llegaron mensajeros.'), ('l04', .3, 'Ovejas, camellos… *todo*.'),
    ('l05', 1.4, 'Y un *viento* derribó la casa de *sus hijos*.'),
    ('l06', .25, 'Él se *postró* y adoró.'), ('l06b', .2, '«El Señor *dio*, el Señor *quitó*.'), ('l06c', .6, '*Bendito* sea su nombre».'),
    ('l07', .2, 'Llegaron sus *amigos*.'), ('l07b', .5, 'Y se sentaron con él *una semana entera*.'),
    ('l08', .35, '*Nadie* dijo nada.'), ('l08b', 1.5, 'Yo *tampoco*.'),
    ('l09', .3, 'Esta historia *no terminó ahí*.'),
    ('l10', .15, 'Después de *orar* por sus amigos,'), ('l10b', .3, 'el Señor le devolvió *el doble*.'),
    ('l10c', .45, 'Ahora: *14.000* ovejas, *6.000* camellos.'), ('l11', .55, 'Y vivió *140 años* más.'),
    ('l12', .2, 'Y si hoy lo *pierdes todo*,'), ('l12b', .5, 'no estás *solo*.'),
    ('l13', .3, '¿Qué te *sostiene* en tu peor día?'), ('l13b', 1.8, 'Dilo en *una palabra*.'),
]
if not all(i in dur for i, _, _ in SCRIPT):  # no voices yet: estimate from lines.json (~0.36 s/word) so the script still runs
    print('WARNING: voices/dur.json missing or incomplete; using estimated durations')
    txt = {x['id']: x['text'] for x in json.load(open(os.path.join(F, 'voices', 'lines.json'), encoding='utf-8'))}
    for i, _, _ in SCRIPT: dur.setdefault(i, round(.36 * len(re.findall(r'\w+', txt[i])) + .25, 3))
t = .45; L = {}; H = {}
for i, p, s in SCRIPT:
    L[i] = {'at': round(t, 3), 'dur': dur[i]}; H[i] = round(t, 3); t += dur[i] + p
DUR = round(t, 2)
e = lambda i: H[i] + dur[i]
# word onsets measured on the voice files (20 ms energy dips): "siete" in l01, "doble" in l10b, "catorce"/"seis" in l10c
H.update(siete=round(H['l01'] + 1.84, 3), mensajero=H['l03'], mensajero2=round(H['l03'] + 1.35, 3), viento=H['l05'], silencio1=round(e('l05'), 3), bendito=H['l06c'],
         silencio2=round(e('l08b'), 3), doble=round(H['l10b'] + 1.49, 3), catorce=round(H['l10c'] + .48, 3), seis=round(H['l10c'] + 1.40, 3), cta=H['l13'])
H['abre'] = round(H['doble'] - 1.45, 3)   # the night sheets start to part; the last one opens on the stressed syllable of "doble"
SHOTS = [['S1', 0, 'cut'], ['S2', H['l02'] - .2, 'dissolve'], ['S3', H['l03'] - .2, 'cut'], ['S4', H['l04'] - .15, 'cut'], ['S5', H['l05'] - .2, 'dissolve'],
         ['S6', H['l06'] - .3, 'dissolve'], ['S7', H['l07'] - .2, 'dissolve'], ['S8', H['l08'] - .15, 'cut'], ['S9', H['l09'] - .6, 'dissolve'],
         ['S10', H['l10c'] - .3, 'dissolve'], ['S11', H['l11'] - .2, 'dissolve'], ['S12', H['l12'] - .25, 'dissolve']]
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
