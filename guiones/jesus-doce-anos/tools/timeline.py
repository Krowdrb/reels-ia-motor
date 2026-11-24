"""The one timeline: voice durations + pauses -> line starts, hits, shots, subtitle cues. Writes timeline.json and subtitulos.srt (Jesús a los 12 años, Lucas 2:41–52)."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); F = os.path.dirname(HERE)
dur = json.load(open(os.path.join(F, 'voices', 'dur.json'), encoding='utf-8'))
# Opening paper title (only on-screen text besides subtitles; not spoken). shots.js draws it from 0.3 to 3.8 s.
TITLE = {'top': 'PERDIDO TRES DÍAS', 'sub': 'Lucas 2:41–52', 'in': .3, 'out': 3.8}
# (id, pause after, subtitle with *keywords*). No line starts with a J sound (silence trim eats it: «Conás»), so l01 = «Doce años tenía Jesús…».
# Real silences: after l06 (María before the last empty tent) and after l11 (after «Hijo…», before the answer of 2:49).
SCRIPT = [
    ('l01', .15, '*Doce años* tenía *Jesús*…'), ('l02', .4, 'y sus padres lo buscaron *tres días*.'),
    ('l03', .25, 'Volvíamos de la *Pascua*.'), ('l04', .4, 'Creían que él iba en la *caravana*.'),
    ('l05', .2, '*Un día de camino* después…'), ('l06', 1.5, '*no estaba* entre los parientes.'),
    ('l07', .2, '*Tres días* después lo hallaron en *el templo*,'), ('l08', .45, 'sentado entre los maestros, oyendo y *preguntando*.'),
    ('l09', .5, 'Todos se *maravillaban*.'), ('l10', .3, 'Su madre: *Hijo*, ¿por qué nos hiciste esto?'),
    ('l11', 1.6, 'Te buscábamos con *angustia*.'), ('l12', .4, '¿Por qué *me buscaban*?'),
    ('l13', .9, '¿No sabían que debo estar en *las cosas de mi Padre*?'), ('l14', .45, 'No *entendieron*.'),
    ('l15', .7, 'Pero bajó con ellos, y *les obedecía*.'), ('l16', .45, 'Si lo buscas, empieza por *las cosas del Padre*.'),
    ('l17', 1.8, '¿*Dónde* lo buscas tú?'),
]
t = .25; L = {}; H = {}
for i, p, s in SCRIPT:
    L[i] = {'at': round(t, 3), 'dur': dur[i]}; H[i] = round(t, 3); t += dur[i] + p
DUR = round(t, 2)
e = lambda i: H[i] + dur[i]
# key moments for shots.js / mix.py (the animator tunes these)
H.update(tresdias=round(e('l02') - .75, 3),            # P1: rack focus to the single lit window of the city
         tiendas=H['l05'],                              # P3: tent doors light up one by one
         silencio1=round(e('l06'), 3),                  # P4: last tent door goes dark; nothing in the mix
         vuelta=H['l07'], templo=round(e('l07') - .55, 3),  # P5: light cycles three times, then the temple window stays lit
         hallado=H['l08'], maravilla=H['l09'],
         hijo=round(H['l10'] + .7, 3),                  # P8: María raises an arm
         silencio2=round(e('l11'), 3),                  # P8: nobody moves; light gathers on the boy
         respuesta=H['l12'],                            # P9: first sound after silence 2 is the voice (cut on sound)
         puertas=H['l13'],                              # P9 signature: paper doors swing open front to back
         padre=round(e('l13') - .45, 3),                # P9: column of light falls on the boy (timpani 'D3', D major)
         obedece=H['l15'], leccion=H['l16'], pregunta=H['l17'])  # P12: Clawd turns to camera on the question
# P1..P12 of TREATMENT.md §5, named S1..S12 for shots.js (main.js knows 'cut' and 'dissolve')
SHOTS = [['S1', 0, 'cut'], ['S2', H['l03'] - .2, 'dissolve'], ['S3', H['l05'] - .2, 'dissolve'], ['S4', H['l06'] - .15, 'cut'],
         ['S5', H['l07'] - .3, 'dissolve'], ['S6', H['l08'] - .2, 'dissolve'], ['S7', H['l09'] - .15, 'cut'], ['S8', H['l10'] - .2, 'dissolve'],
         ['S9', H['l12'] - .05, 'cut'], ['S10', H['l14'] - .2, 'dissolve'], ['S11', H['l15'] - .2, 'dissolve'], ['S12', H['l16'] - .25, 'dissolve']]
SHOTS = [[a, round(b, 3), c] for a, b, c in SHOTS]
cues = []
for n, (i, p, s) in enumerate(SCRIPT):
    t0 = L[i]['at']; nxt = L[SCRIPT[n + 1][0]]['at'] if n + 1 < len(SCRIPT) else DUR - .7
    t1 = nxt if n + 1 == len(SCRIPT) else min(nxt - .04, max(t0 + dur[i] + .55, t0 + 1.8))
    if p >= 1.4: t1 = min(t1, t0 + dur[i] + .3)  # no subtitle during the two silences
    cues.append({'t0': round(max(0, t0 - .05), 3), 't1': round(t1, 3), 'text': s})
cues[-1]['t1'] = DUR  # the CTA stays until the end
json.dump({'DUR': DUR, 'TITLE': TITLE, 'L': L, 'HIT': H, 'SHOTS': SHOTS, 'cues': cues}, open(os.path.join(F, 'timeline.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
def ts(x): h, m = int(x // 3600), int(x % 3600 // 60); return f'{h:02}:{m:02}:{x % 60:06.3f}'.replace('.', ',')
with open(os.path.join(F, 'subtitulos.srt'), 'w', encoding='utf-8') as f:
    for n, c in enumerate(cues, 1): f.write(f"{n}\n{ts(c['t0'])} --> {ts(c['t1'])}\n{c['text'].replace('*', '')}\n\n")
print('DUR', DUR, 'shots', [(a, b) for a, b, _ in SHOTS])
if DUR > 45: print('AVISO: pasa de 45 s; bajar pausas cortas a .15, quitar «Pero» de l15 o l09 «Todos se maravillaban.» (nunca los silencios; no acelerar la voz)')
