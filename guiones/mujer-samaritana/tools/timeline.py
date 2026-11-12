"""The one timeline: voice durations + pauses -> line starts, hits, shots, subtitle cues. Writes timeline.json and subtitulos.srt."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); F = os.path.dirname(HERE)
dur = json.load(open(os.path.join(F, 'voices', 'dur.json'), encoding='utf-8'))
# (id, pause after, subtitle with *keywords*)
SCRIPT = [
    ('l01', .15, 'Él *nunca* la había visto…'), ('l01b', .3, '¿cómo sabía *toda su vida*?'),
    ('l02', .2, 'Estoy en el *pozo de Jacob*.'), ('l03', .3, '*Mediodía*. Jesús, *cansado*, se sienta.'),
    ('l04', .15, 'Llega una *samaritana*.'), ('l05', .3, '*«Dame de beber»*, le pide.'),
    ('l06', .3, 'Se extraña: judíos y samaritanos *no se tratan*.'),
    ('l07', .1, '«Si *supieras* quién te pide…'), ('l07b', 1.2, 'le pedirías *agua viva*».'),  # silencio 1
    ('l08', .3, '«Ve, llama a tu *marido*».'), ('l09', .25, '«No tengo *marido*».'),
    ('l10', .1, '«*Cinco* has tenido,'), ('l10b', .35, 'y el de ahora *no lo es*».'),
    ('l11', .3, 'Él le habla de adorar en *espíritu y en verdad*.'),
    ('l12', 1.2, '«Sé que viene el *Mesías*», dice ella.'),  # silencio 2
    ('l13', .5, '«*Yo soy*, el que habla contigo».'),
    ('l14', .25, 'Deja el *cántaro*. Corre al *pueblo*.'),
    ('l15', .3, '«¡*Vengan a ver*! Me dijo *todo*».'),
    ('l16', .4, '*Muchos creyeron*.'),
    ('l17', .15, 'Él *conoce* tu vida…'), ('l17b', .4, 'y *no se aparta*.'),
    ('l18', .15, '¿Qué *cántaro* dejarías tú?'), ('l18b', 1.8, 'Dilo en *una palabra*.'),
]
t = .25; L = {}; H = {}
for i, p, s in SCRIPT:
    L[i] = {'at': round(t, 3), 'dur': dur[i]}; H[i] = round(t, 3); t += dur[i] + p
DUR = round(t, 2)
e = lambda i: H[i] + dur[i]
H.update(nunca=H['l01'], vida=H['l01b'], mediodia=H['l03'], aqui=round(H['l03'] + .6 * dur['l03'], 3), beber=H['l05'], tratan=H['l06'], agua=round(H['l07b'] + .45 * dur['l07b'], 3), sil1=round(e('l07b'), 3), marido=H['l08'], cinco=H['l10'], verdad=H['l11'], mesias=H['l12'], sil2=round(e('l12'), 3), soy=H['l13'], cantaro=H['l14'], vengan=H['l15'], creyeron=H['l16'], cta=H['l18'])
# 12 shots (TREATMENT §5). Cuts land on words; the two silences get their own locked shots (S6, S9). Few dissolves: each costs a second render on the CPU.
SHOTS = [['S1', 0, 'cut'], ['S2', H['l02'] - .15, 'cut'], ['S3', H['l04'] - .2, 'dissolve'], ['S4', H['l06'] - .15, 'cut'], ['S5', H['l07'] - .15, 'cut'],
         ['S6', H['sil1'] - .05, 'cut'], ['S7', H['l08'] - .1, 'cut'], ['S8', H['l11'] - .35, 'dissolve'], ['S9', H['sil2'] - .05, 'cut'],
         ['S10', H['l13'] - .15, 'cut'], ['S11', H['l14'] - .25, 'dissolve'], ['S12', H['l16'] - .4, 'dissolve']]
SHOTS = [[a, round(b, 3), c] for a, b, c in SHOTS]
cues = []
for n, (i, p, s) in enumerate(SCRIPT):
    t0 = L[i]['at']; nxt = L[SCRIPT[n + 1][0]]['at'] if n + 1 < len(SCRIPT) else DUR   # the CTA stays to the very end
    t1 = nxt if n + 1 == len(SCRIPT) else min(nxt - .04, max(t0 + dur[i] + .55, t0 + 1.8))
    cues.append({'t0': round(t0 - .05, 3), 't1': round(t1, 3), 'text': s})
json.dump({'DUR': DUR, 'L': L, 'HIT': H, 'SHOTS': SHOTS, 'cues': cues}, open(os.path.join(F, 'timeline.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
def ts(x): h, m = int(x // 3600), int(x % 3600 // 60); return f'{h:02}:{m:02}:{x % 60:06.3f}'.replace('.', ',')
with open(os.path.join(F, 'subtitulos.srt'), 'w', encoding='utf-8') as f:
    for n, c in enumerate(cues, 1): f.write(f"{n}\n{ts(c['t0'])} --> {ts(c['t1'])}\n{c['text'].replace('*', '')}\n\n")
print('DUR', DUR, 'shots', [(a, b) for a, b, _ in SHOTS])
