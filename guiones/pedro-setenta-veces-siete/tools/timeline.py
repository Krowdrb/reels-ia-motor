"""The one timeline: voice durations + pauses -> line starts, hits, shots, subtitle cues. Writes timeline.json and subtitulos.srt."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); F = os.path.dirname(HERE)
dur = json.load(open(os.path.join(F, 'voices', 'dur.json'), encoding='utf-8'))
# (id, pause after, subtitle with *keywords*)
# Line ids (Pedro, Mt 18:21-35): l01 l02 l02b l03 l03b l04 l04b l05 l06 l06b | SILENCIO 1 | l07 l07b l08 l08b l09 l10 l10b | SILENCIO 2 | l11 l12 l13 l13b l14
# Silencio 1 = pause after l06b («Ten paciencia conmigo»); silencio 2 = pause after l10b («lo echa a la cárcel»). Never shorten them;
# if DUR > 48 s, cut words (first l11 -> «El rey: «¿No debías tener compasión?»»), never speed up the voice.
SCRIPT = [
    ('l01', .2, '*Pedro* pregunta: «¿Perdono *siete veces*?»'),
    ('l02', .1, 'Y Jesús responde:'), ('l02b', .45, '«No siete, sino *setenta veces siete*».'),
    ('l03', .1, 'Pierdo *la cuenta*…'), ('l03b', .4, 'y él cuenta *una historia*.'),
    ('l04', .1, 'Un *siervo* debe al rey'), ('l04b', .1, '*10.000 talentos*:'),
    ('l05', .4, 'una deuda *imposible de pagar*.'),
    ('l06', .1, 'De *rodillas*, suplica:'), ('l06b', 1.4, '«*Ten paciencia* conmigo».'),             # SILENCIO 1
    ('l07', .1, 'El rey, *compadecido*,'), ('l07b', .5, 'le perdona *toda la deuda*.'),
    ('l08', .1, 'Al salir, el perdonado agarra *del cuello*'), ('l08b', .1, 'a un compañero que le debe *100 denarios*:'),
    ('l09', .35, 'unos *cien días de trabajo*.'),
    ('l10', .15, '«*Págame*».'), ('l10b', 1.5, 'Y lo echa a *la cárcel*.'),                       # SILENCIO 2
    ('l11', .35, 'El rey: «¿No debías tener *compasión*, como yo de ti?»'),
    ('l12', .55, 'Enojado, lo *entrega* a los carceleros.'),
    ('l13', .15, 'Perdonar no es *contar*:'), ('l13b', .45, 'es recordar *cuánto te perdonaron*.'),
    ('l14', 1.6, '¿A quién *perdonas* hoy?'),
]
t = .2; L = {}; H = {}
for i, p, s in SCRIPT:
    L[i] = {'at': round(t, 3), 'dur': dur[i]}; H[i] = round(t, 3); t += dur[i] + p
DUR = round(t, 2)
e = lambda i: H[i] + dur[i]
# Key moments, retuned against the real voice (energy gaps inside each line wav; offsets in seconds from the line start).
H.update(pedro=H['l01'], siete1=round(H['l01'] + 1.35, 3), setenta=round(H['l02b'] + 1.2, 3), siete2=round(H['l02b'] + 1.97, 3), rinde=round(e('l02b'), 3),
         cuenta=round(H['l03'] + .65, 3), historia=round(H['l03b'] + .9, 3), talentos=H['l04b'], imposible=round(H['l05'] + .9, 3),
         rodillas=round(H['l06'] + .3, 3), paciencia=round(H['l06b'] + .28, 3), sil1=round(e('l06b'), 3), compadecido=round(H['l07'] + .52, 3),
         perdona=round(H['l07b'] + .2, 3), deuda=round(H['l07b'] + 1.2, 3), salir=H['l08'], ahoga=round(H['l08'] + 1.3, 3),
         denarios=round(H['l08b'] + 1.6, 3), dias=H['l09'], pagame=H['l10'], carcel=round(H['l10b'] + .85, 3), sil2=round(e('l10b'), 3),
         llama=H['l11'], compasion=round(H['l11'] + 1.5, 3), entrega=round(H['l12'] + .85, 3), contar=round(H['l13'] + 1.11, 3),
         perdonaron=round(H['l13b'] + 1.33, 3), cta=H['l14'])
# Clawd's paws: seven taps from frame 0 to «siete» (S1), then the count that speeds up and breaks on «setenta veces siete» (S2). mix.py plays a harp note on each.
TAPS = [round(.05 + k * (H['siete1'] - .05) / 6, 3) for k in range(7)]
FAST = [H['setenta'] - .05]
for d in (.19, .16, .13, .11, .09, .08): FAST.append(round(FAST[-1] + d, 3))
for k, v in enumerate(TAPS): H[f'tap{k + 1}'] = v
for k, v in enumerate(FAST): H[f'fast{k + 1}'] = round(v, 3)
# Shots S1-S12 (TREATMENT §5), cut on the real voice.
SHOTS = [['S1', 0, 'cut'], ['S2', H['l02'] - .1, 'cut'], ['S3', H['l03b'] - .2, 'dissolve'],
         ['S4', H['l04'] - .25, 'dissolve'], ['S5', H['l04b'] - .2, 'cut'], ['S6', H['l06'] - .2, 'dissolve'],
         ['S7', H['l07'] - .1, 'cut'], ['S8', H['l08'] - .2, 'dissolve'], ['S9', H['l09'] - .3, 'cut'],
         ['S10', H['l10'] - .15, 'cut'], ['S11', H['l11'] - .1, 'cut'], ['S12', H['l13'] - .3, 'dissolve']]
SHOTS = [[a, round(b, 3), c] for a, b, c in SHOTS]
cues = []
for n, (i, p, s) in enumerate(SCRIPT):
    t0 = L[i]['at']; nxt = L[SCRIPT[n + 1][0]]['at'] if n + 1 < len(SCRIPT) else DUR
    t1 = nxt if n + 1 == len(SCRIPT) else min(nxt - .04, max(t0 + dur[i] + .55, t0 + 1.8))
    cues.append({'t0': round(max(0, t0 - .05), 3), 't1': round(t1, 3), 'text': s})
json.dump({'DUR': DUR, 'L': L, 'HIT': H, 'SHOTS': SHOTS, 'cues': cues}, open(os.path.join(F, 'timeline.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
def ts(x): h, m = int(x // 3600), int(x % 3600 // 60); return f'{h:02}:{m:02}:{x % 60:06.3f}'.replace('.', ',')
with open(os.path.join(F, 'subtitulos.srt'), 'w', encoding='utf-8') as f:
    for n, c in enumerate(cues, 1): f.write(f"{n}\n{ts(c['t0'])} --> {ts(c['t1'])}\n{c['text'].replace('*', '')}\n\n")
print('DUR', DUR, 'shots', [(a, b) for a, b, _ in SHOTS])
