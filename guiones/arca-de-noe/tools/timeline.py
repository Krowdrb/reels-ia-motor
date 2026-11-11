"""The one timeline for «Trescientos codos» (arca-de-noe): voice durations + pauses -> line starts, hits, shots, subtitle cues. Writes timeline.json and subtitulos.srt. Silences: after a11 (before «Y el Señor cerró la puerta») and after a15 (before the dove)."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); F = os.path.dirname(HERE)
dur = json.load(open(os.path.join(F, 'voices', 'dur.json'), encoding='utf-8'))
# (id, pause after, subtitle with *keywords*)
SCRIPT = [
    ('a01', .25, 'Estoy al pie del *arca de Noé*.'), ('a02', .4, '*300 codos*. ¿Qué tan *grande* es?'),
    ('a03', .25, 'Unos *135 metros* de largo.'), ('a04', .4, 'Más que una *cancha de fútbol*.'),
    ('a05', .2, '*22 metros* de ancho.'), ('a06', .4, '*13* de alto.'),
    ('a07', .4, '*Brea* por dentro y por fuera.'),
    ('a08', .2, '*Tres pisos*.'), ('a09', .45, 'Una *ventana* arriba, una *puerta* al costado.'),
    ('a10', .3, 'Y Noé tenía *600 años*.'), ('a11', 1.0, 'Entraron *8 personas*.'),
    ('a12', .45, 'Y el Señor *cerró la puerta*.'),
    ('a13', .4, 'Llovió *40 días* y *40 noches*.'),
    ('a14', .3, 'El agua cubrió la tierra *150 días*.'), ('a15', 1.1, 'Después, el arca reposó en los montes de *Ararat*.'),
    ('a16', .45, 'Una *paloma* trajo una hoja de *olivo*.'),
    ('a17', .5, 'Y Dios puso su *arco* en las nubes.'),
    ('a18', .25, 'El arca era *enorme*.'), ('a19', .4, 'Pero la puerta la cerró *Dios*.'),
    ('a20', 1.5, '¿Qué *cifra* te sorprendió más?'),
]
t = .2; L = {}; H = {}
for i, p, s in SCRIPT:
    L[i] = {'at': round(t, 3), 'dur': dur[i]}; H[i] = round(t, 3); t += dur[i] + p
DUR = round(t, 2)
e = lambda i: H[i] + dur[i]
H.update(codos=round(H['a02'] + .1, 3), largo=H['a03'], ancho=H['a05'], alto=H['a06'], brea=H['a07'], pisos=H['a08'], ventana=H['a09'], ocho=H['a11'], silencio1=round(e('a11'), 3), puerta=round(H['a12'] + .9, 3), lluvia=H['a13'], agua=H['a14'], ararat=round(H['a15'] + .9, 3), silencio2=round(e('a15'), 3), paloma=H['a16'], arco=round(H['a17'] + 1.0, 3), cerro2=H['a19'], escribe=H['a20'])
# key moments inside the shots (seconds)
H.update(titulo_fin=3.0, pisos2=round(H['a08'] + .4, 3), pisos3=round(H['a08'] + .8, 3), puertaS5=round(H['a09'] + 1.25, 3),
         noe_sube=round(H['a10'] + .15, 3), alba=round(H['a15'] + .4, 3), nubes=round(H['a17'] - .1, 3), mira_arca=round(H['a19'] + .15, 3))
# 12 shots, one visual change every 3-4 s; S2 and S9 carry two moves each (track/pull out; dolly out/tilt down)
SHOTS = [['S1', 0, 'cut'], ['S2', H['a03'] - .2, 'cut'], ['S3', H['a05'] - .15, 'cut'], ['S4', H['a07'] - .15, 'cut'], ['S5', H['a08'] - .15, 'dissolve'],
         ['S6', H['a10'] - .2, 'dissolve'], ['S7', round(e('a11') + .35, 3), 'cut'], ['S8', H['a13'] - .2, 'cut'], ['S9', H['a14'] - .2, 'dissolve'],
         ['S10', H['a16'] - .3, 'dissolve'], ['S11', H['a17'] - .2, 'dissolve'], ['S12', H['a19'] - .2, 'dissolve']]
SHOTS = [[a, round(b, 3), c] for a, b, c in SHOTS]
cues = []
for n, (i, p, s) in enumerate(SCRIPT):
    t0 = L[i]['at']; nxt = L[SCRIPT[n + 1][0]]['at'] if n + 1 < len(SCRIPT) else DUR   # the last cue (the question) stays to the end
    t1 = nxt if n + 1 == len(SCRIPT) else min(nxt - .04, max(t0 + dur[i] + .55, t0 + 1.8))
    cues.append({'t0': round(t0 - .05, 3), 't1': round(t1, 3), 'text': s})
json.dump({'DUR': DUR, 'L': L, 'HIT': H, 'SHOTS': SHOTS, 'cues': cues}, open(os.path.join(F, 'timeline.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
def ts(x): h, m = int(x // 3600), int(x % 3600 // 60); return f'{h:02}:{m:02}:{x % 60:06.3f}'.replace('.', ',')
with open(os.path.join(F, 'subtitulos.srt'), 'w', encoding='utf-8') as f:
    for n, c in enumerate(cues, 1): f.write(f"{n}\n{ts(c['t0'])} --> {ts(c['t1'])}\n{c['text'].replace('*', '')}\n\n")
print('DUR', DUR, 'shots', [(a, b) for a, b, _ in SHOTS])
