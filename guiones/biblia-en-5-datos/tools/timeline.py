"""The one timeline: voice durations + pauses -> line starts, hits, shots, subtitle cues. Writes timeline.json and subtitulos.srt."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); F = os.path.dirname(HERE)
dur = json.load(open(os.path.join(F, 'voices', 'dur.json'), encoding='utf-8'))
# (id, pause after, subtitle with *keywords*)
# S2 (1.500 años) has no line of its own since l04 was cut: shepherd, king and fishers pass fast in one lateral sweep.
# S8 holds through l13 and silence 1 (the giant scroll goes dark); S9 (Betania) opens inside silence 1.
SCRIPT = [
    ('l01', .2, 'Unos *40 autores* de la Biblia… y yo junto a uno.'), ('l02', .4, '¿En *cuánto tiempo*?'),
    ('l03', .25, 'Unos *1.500 años*.'),
    ('l05', .2, 'En *3 idiomas*: hebreo,'), ('l06', .2, '*arameo*, aquí en *Babilonia*, en Daniel,'),
    ('l07', .35, 'y *griego*, el Nuevo Testamento.'),
    ('l08', .25, 'Los *capítulos* llegaron en el *siglo XIII*.'), ('l09', .35, 'Los *versículos*, en el *XVI*.'),
    ('l10', .15, 'El capítulo más largo, el *Salmo 119*:'), ('l11', .4, '*176* versículos.'),
    ('l12', .5, 'El más corto, el *117*: solo *2*.'),
    ('l13', 1.2, 'Y el versículo *más corto*, en muchas Biblias…'),  # silencio 1 (1,2 s) antes de «Jesús lloró»
    ('l14', .5, 'Aquí, en Betania: *Jesús lloró*.'),
    ('l16', 1.4, 'Quitaron la *piedra* de la tumba.'),  # silencio 2 (1,4 s)
    ('l17', .3, 'Luego clamó: *¡Lázaro, ven fuera!*'), ('l18', .5, 'Y *salió*, con las *vendas* puestas.'),
    ('l19', .4, 'Sus lágrimas *no fueron el final*.'), ('l20', .5, 'Si hoy lloras, *no lloras solo*.'),
    ('l21', 1.5, 'Si esto te dio esperanza, escribe *AMÉN*.'),
]
t = .2; L = {}; H = {}
for i, p, s in SCRIPT:
    L[i] = {'at': round(t, 3), 'dur': dur[i]}; H[i] = round(t, 3); t += dur[i] + p
DUR = round(t, 2)
e = lambda i: H[i] + dur[i]
H.update(autores=H['l01'], pregunta=H['l02'], anos=H['l03'], arameo=H['l06'], griego=H['l07'], capitulos=H['l08'], versiculos=H['l09'],
         s119=H['l10'], s176=H['l11'], s117=H['l12'], silencio1=round(e('l13'), 3), lloro=round(e('l14') - .7, 3), piedra=H['l16'],
         silencio2=round(e('l16'), 3), clama=H['l17'], sale=H['l18'], amanece=H['l19'], amen=H['l21'],
         hebreo=round(H['l05'] + 1.0, 3), dos=round(e('l12') - .45, 3), lazaro=round(H['l17'] + .8, 3), salio=round(H['l18'] + .15, 3))
SHOTS = [['S1', 0, 'cut'], ['S2', H['l03'] - .25, 'dissolve'], ['S3', H['l05'] + .3, 'dissolve'], ['S4', H['l06'] - .15, 'dissolve'],
         ['S5', H['l07'] - .25, 'dissolve'], ['S6', H['l08'] - .3, 'dissolve'], ['S7', H['l10'] - .2, 'dissolve'], ['S8', H['l12'] - .15, 'dissolve'],
         ['S9', e('l13') + .25, 'dissolve'], ['S10', H['l16'] - .2, 'dissolve'], ['S11', H['l17'] - .1, 'dissolve'], ['S12', H['l19'] - .4, 'dissolve']]
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
