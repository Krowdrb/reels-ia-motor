"""The one timeline: voice durations + pauses -> line starts, hits, shots, subtitle cues. Writes timeline.json and subtitulos.srt."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); F = os.path.dirname(HERE)
dur = json.load(open(os.path.join(F, 'voices', 'dur.json'), encoding='utf-8'))
# (id, pause after, subtitle with *keywords*)
# Line ids (Agar, Gn 16 y 21): l01 l01b l02 l03 l04 | SILENCIO 1 | l05 l06 l06b l07 l08 l09 l09b l10 | SILENCIO 2 | l11 l12 l12b l13 l13b l14 l15
# Silencio 1 = pause after l04 (fuente -> «Agar»); silencio 2 = pause after l10 («No quiero ver morir al niño»). Never shorten them;
# if DUR > 48 s, cut words (first l08 -> «Años después, Abraham la despidió.»), never speed up the voice.
SCRIPT = [
    ('l01', .15, '*Agar* huyó *sola* al desierto…'), ('l01b', .35, 'y alguien la llamó por *su nombre*.'),
    ('l02', .3, 'Yo caminaba *con ella*.'), ('l03', .3, 'La *afligía* Sarai, su señora.'),
    ('l04', 1.4, 'En una fuente, la halló el *ángel del Señor*.'),                      # SILENCIO 1
    ('l05', .35, '«*Agar*, ¿de dónde vienes?»'),
    ('l06', .1, '«Tu hijo se llamará *Ismael*»:'), ('l06b', .4, '*Dios oye*.'),
    ('l07', .5, 'Ella lo llamó «*el Dios que me ve*».'),
    ('l08', .3, 'Años después, Abraham la despidió con *pan y agua*.'),
    ('l09', .1, 'Ya *sin agua*, dejó al niño bajo un arbusto'), ('l09b', .2, 'y se sentó a *un tiro de arco*:'),
    ('l10', 1.5, '«*No quiero ver* morir al niño».'),                                     # SILENCIO 2
    ('l11', .35, 'Pero Dios *oyó* la voz del niño.'),
    ('l12', .15, 'Le abrió *los ojos*…'), ('l12b', .45, 'y vio un *pozo*.'),
    ('l13', .2, '*Nadie* la veía.'), ('l13b', .35, '*Dios, sí*.'),
    ('l14', .3, 'A ti *también te ve*.'), ('l15', 1.6, '¿Tú cómo *llamarías* a Dios?'),
]
t = .2; L = {}; H = {}
for i, p, s in SCRIPT:
    L[i] = {'at': round(t, 3), 'dur': dur[i]}; H[i] = round(t, 3); t += dur[i] + p
DUR = round(t, 2)
e = lambda i: H[i] + dur[i]
# Key moments (word offsets are estimates: the animator retunes them against voz.wav).
H.update(agar=H['l01'], llamo=round(H['l01b'] + .6, 3), afligia=H['l03'], fuente=round(H['l04'] + .3, 3),
         sil1=round(e('l04'), 3), agar2=H['l05'], ismael=round(H['l06'] + 1.0, 3), oye=H['l06b'],
         ve=round(H['l07'] + 1.0, 3), despidio=round(H['l08'] + 1.2, 3), gota=round(H['l09'] + .3, 3),
         arco=round(H['l09b'] + .9, 3), nover=H['l10'], sil2=round(e('l10'), 3), oyo=round(H['l11'] + .5, 3),
         ojos=round(H['l12'] + .55, 3), pozo=round(H['l12b'] + .45, 3), nadie=H['l13'], diossi=H['l13b'],
         tambien=H['l14'], cta=H['l15'])
SHOTS = [['S1', 0, 'cut'], ['S2', H['l03'] - .2, 'dissolve'], ['S3', H['l04'] - .25, 'dissolve'],
         ['S4', H['l05'] - .1, 'cut'], ['S5', H['l06'] - .2, 'dissolve'], ['S6', H['l07'] - .25, 'dissolve'],
         ['S7', H['l08'] - .25, 'dissolve'], ['S8', H['l09'] - .2, 'cut'], ['S9', H['l09b'] - .25, 'dissolve'],
         ['S10', H['l11'] - .1, 'cut'], ['S11', H['l12'] - .2, 'cut'], ['S12', H['l13'] - .3, 'dissolve']]
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
