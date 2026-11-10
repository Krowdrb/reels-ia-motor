"""The one timeline: voice durations + pauses -> line starts, hits, shots, subtitle cues. Writes timeline.json and subtitulos.srt."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); F = os.path.dirname(HERE)
dur = json.load(open(os.path.join(F, 'voices', 'dur.json'), encoding='utf-8'))
# (id, pause after, subtitle with *keywords*)
SCRIPT = [
    ('l01', .15, 'Tres hombres pasarán junto a este *herido*.'), ('l01b', .35, '¿*Cuál* se detendrá?'),
    ('l02', .3, 'Estoy en una *parábola* de *Jesús*.'),
    ('l03', .1, 'Un *maestro de la ley* preguntó:'), ('l03b', .35, '¿quién es mi *prójimo*?'),
    ('l04', .1, 'Un hombre bajaba a *Jericó*,'), ('l04b', .3, 'casi *mil metros* cuesta abajo.'),
    ('l05', .1, '*Ladrones* lo despojaron, lo hirieron'), ('l05b', .4, 'y lo dejaron *medio muerto*.'),
    ('l06', .25, 'Un *sacerdote* lo vio… y pasó *por el otro lado*.'),
    ('l07', 1.5, 'Un *levita*, igual.'),  # SILENCIO 1 (~1,5 s) antes del samaritano
    ('l08', .25, 'Llegó un *samaritano*.'), ('l09', .45, 'Lo vio… y tuvo *compasión*.'),
    ('l10', .15, 'Lo vendó con *aceite y vino*,'), ('l10b', .1, 'lo subió a su *cabalgadura*'),
    ('l10c', .3, 'y lo cuidó en un *mesón*.'),
    ('l11', .35, 'Pagó *dos denarios*; prometió pagar *lo demás*.'),
    ('l12', .25, 'Y Jesús preguntó: ¿cuál fue el *prójimo*?'),
    ('l12b', 1.6, 'El que tuvo *misericordia*.'),  # SILENCIO 2 (~1,6 s) antes de «Ve, y haz tú lo mismo»
    ('l13', .4, 'Ve, y *haz tú lo mismo*.'), ('l13b', .35, 'Mirar *no basta*.'),
    ('l14', .15, '¿Quién es *tu prójimo* hoy?'), ('l14b', 1.8, 'Dilo en *una palabra*.'),
]
t = .45; L = {}; H = {}
for i, p, s in SCRIPT:
    L[i] = {'at': round(t, 3), 'dur': dur[i]}; H[i] = round(t, 3); t += dur[i] + p
DUR = round(t, 2)
e = lambda i: H[i] + dur[i]
# Momentos clave (animador): posiciones dentro de cada línea medidas sobre la onda de la voz (tramos con voz y pausas internas de cada WAV).
H.update(tres=round(H['l01'] + .04, 3), herido=round(H['l01'] + 1.8, 3), cual=round(H['l01b'] + .06, 3), dentro=round(H['l02'] + .05, 3), jesus=round(H['l02'] + 1.35, 3),
         projimo=round(H['l03b'] + .7, 3), golpe1=round(H['l05'] + .85, 3), golpe2=round(H['l05'] + 1.6, 3), golpe3=round(H['l05b'] + 1.02, 3),
         sacerdote=H['l06'], vio=round(H['l06'] + 1.0, 3), pasa=round(H['l06'] + 1.4, 3), levita=H['l07'], sil1=round(H['l07'] + 1.25, 3), campana=round(H['l08'] - .12, 3),
         compasion=round(H['l09'] + 1.0, 3), aceite=round(H['l10'] + .75, 3), monturas=H['l10b'], meson=H['l10c'],
         denarios=round(H['l11'] + .35, 3), denario2=round(H['l11'] + .7, 3), pregunta=round(H['l12'] + 1.21, 3), responde=H['l12b'],
         sil2=round(H['l12b'] + 1.52, 3), ve=H['l13'], basta=H['l13b'], cta=H['l14'], palabra=H['l14b'])
# Planos (TREATMENT §5, ajustados a la voz). S6 cubre el silencio 1; S11 cubre el silencio 2 y «Ve, y haz tú lo mismo».
SHOTS = [['S1', 0, 'cut'], ['S2', H['l02'] - .3, 'dissolve'], ['S3', H['l04'] - .25, 'dissolve'], ['S4', H['l05'] - .15, 'cut'],
         ['S5', H['l06'] - .25, 'cut'], ['S6', H['l07'] - .2, 'cut'], ['S7', H['campana'] - .03, 'cut'], ['S8', H['l09'] - .12, 'cut'],
         ['S9', H['l10b'] - .2, 'dissolve'], ['S10', H['l11'] - .25, 'dissolve'], ['S11', H['l12'] - .3, 'dissolve'], ['S12', H['l13b'] - .3, 'dissolve']]
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
