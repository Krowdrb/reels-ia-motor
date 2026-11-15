"""The one timeline: voice durations + pauses -> line starts, hits, shots, subtitle cues. Writes timeline.json and subtitulos.srt."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); F = os.path.dirname(HERE)
dur = json.load(open(os.path.join(F, 'voices', 'dur.json'), encoding='utf-8'))
# (id, pause after, subtitle with *keywords*)
SCRIPT = [
    ('l01', .15, 'Este frasco valía casi *un año de trabajo*…'), ('l01b', .35, 'y ella *lo rompió*.'),
    ('l02', .3, 'Estoy en *Betania*, *seis días* antes de la Pascua.'),
    ('l03', .3, '*Marta* sirve. *Lázaro* cena con Jesús.'),
    ('l04', .15, 'María derrama *nardo puro* en sus pies'), ('l05', .3, 'y los seca con su *cabello*.'),
    ('l06', 1.5, 'La casa se llena del *perfume*.'),  # silencio 1 (1,5 s) antes de la protesta
    ('l07', .1, 'Pero Judas *protesta*:'), ('l08', .3, 'pudo venderse en *trescientos denarios*, para los pobres.'),
    ('l09', 1.6, 'Lo decía porque tenía *la bolsa*… y *robaba*.'),  # silencio 2 (1,6 s) antes de «Déjala»
    ('l10', .35, '*«Déjala»*, responde Jesús.'), ('l11', .4, 'Lo guardó para su *sepultura*.'),
    ('l12', .2, 'A los pobres *siempre* los tendrán.'), ('l12b', .5, 'A él, *no siempre*.'),
    ('l14', .15, 'Y dondequiera que se anuncie el *evangelio*,'), ('l14b', .6, '*se contará* lo que ella hizo.'),
    ('l15', .45, 'Lo que das *con amor* nunca se *desperdicia*.'),
    ('l18', .25, '¿Qué le *darías tú* a Jesús?'), ('l18b', 2.0, 'Dilo en *una palabra*.'),
]
t = .2; L = {}; H = {}
for i, p, s in SCRIPT:
    L[i] = {'at': round(t, 3), 'dur': dur[i]}; H[i] = round(t, 3); t += dur[i] + p
DUR = round(t, 2)
e = lambda i: H[i] + dur[i]
H.update(trabajo=round(H['l01'] + .9, 3), rompio=round(e('l01b') - .45, 3), seis=round(H['l02'] + 1.0, 3), marta=H['l03'], lazaro=round(H['l03'] + .9, 3),
         rompe=H['l04'], cabello=round(e('l05') - .6, 3), perfume=round(e('l06') - .6, 3), sil1=round(e('l06'), 3), protesta=H['l07'],
         denarios=round(H['l08'] + .9, 3), bolsa=round(H['l09'] + 1.2, 3), sil2=round(e('l09'), 3), dejala=H['l10'], sepultura=round(e('l11') - .7, 3),
         siempre=H['l12b'], dondequiera=round(H['l14'] + .1, 3), evangelio=round(e('l14') - .6, 3), contara=H['l14b'], amor=H['l15'], cta=H['l18'], palabra=H['l18b'])
SHOTS = [['S1', 0, 'cut'], ['S2', H['l02'] - .2, 'dissolve'], ['S3', H['l03'] - .2, 'dissolve'], ['S4', H['l04'] - .5, 'cut'],
         ['S5', H['l05'] - .2, 'dissolve'], ['S6', H['l06'] - .15, 'dissolve'], ['S7', e('l06') + .1, 'dissolve'], ['S8', H['l07'] - .25, 'cut'],
         ['S9', e('l09') + .1, 'dissolve'], ['S10', H['l10'] - .2, 'cut'], ['S11', H['l14'] - .2, 'dissolve'], ['S12', H['l15'] - .3, 'dissolve']]
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
