"""The one timeline: voice durations + pauses -> line starts, hits, shots, subtitle cues. Writes timeline.json and subtitulos.srt."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); F = os.path.dirname(HERE)
dur = json.load(open(os.path.join(F, 'voices', 'dur.json'), encoding='utf-8'))
# (id, pause after, subtitle with *keywords*)
# Momentos (TREATMENT §5): l01-l02 fuego (S1) · l03-l04 beso/monedas (S2) · l05-l06b criada y tres negaciones (S3)
# · SILENCIO 1 tras l06b · l07 gallo, l08 se_volvio/miro (S4) · l09 lloro (S5) · l10 devolvio (S6) · l11 salio/no_volvio (S7)
# · SILENCIO 2 tras l11 · l12-l13 orilla/brasas (S8) · l14 preguntas (S9) · l15 apacienta/ovejas (S10) · l16-l17b vuelve/cta (S11)
SCRIPT = [
    ('l01', .1, '*Pedro y Judas* le fallaron a Jesús *la misma noche*…'), ('l01b', .35, 'y *solo uno volvió*.'),
    ('l02', .3, 'Estoy junto a este *fuego*.'),
    ('l03', .15, 'Antes, Judas lo entregó con un *beso*…'), ('l04', .4, 'por *treinta monedas*.'),
    ('l05', .1, 'Ahora una *criada* mira a Pedro:'), ('l05b', .3, '*«Tú también estabas con él»*.'),
    ('l06', .25, '*«No lo conozco»*.'), ('l06b', 1.4, '*Tres veces*.'),  # silencio 1 (1,4 s) antes del gallo y la mirada
    ('l07', .3, 'Cantó el *gallo*.'), ('l08', .4, 'El Señor se volvió… y *miró a Pedro*.'),
    ('l09', .5, 'Pedro salió y *lloró amargamente*.'),
    ('l10', .2, 'También Judas, *arrepentido*, devolvió las *monedas*…'),
    ('l11', 1.4, 'salió del templo… y *no volvió*.'),  # silencio 2 (1,4 s) antes de la orilla
    ('l12', .1, '*Días después*, Jesús esperaba en la *orilla*'), ('l13', .35, 'con *brasas* encendidas.'),
    ('l14', .3, '*Tres veces* le preguntó a Pedro: *«¿Me amas?»*'), ('l15', .5, 'Y tres veces: *«Apacienta mis ovejas»*.'),
    ('l16', .15, 'Si fallaste, *vuelve*:'), ('l16b', .4, 'el *fuego* sigue *encendido*.'),
    ('l17', .25, '¿Qué le *responderías tú* a Jesús?'), ('l17b', 2.0, 'Dilo en *una palabra*.'),
]
t = .2; L = {}; H = {}
for i, p, s in SCRIPT:
    L[i] = {'at': round(t, 3), 'dur': dur[i]}; H[i] = round(t, 3); t += dur[i] + p
DUR = round(t, 2)
e = lambda i: H[i] + dur[i]
w = lambda i, k: round(H[i] + k, 3)   # a word inside a line, by its offset (s) from the line start
H.update(noche=w('l01', 2.05), volvio=w('l01b', .45), fuego=w('l02', 1.05), beso=w('l03', 1.65), monedas=w('l04', .45),
         criada=w('l05', .75), tu=w('l05b', .05), no1=w('l06', .05), no2=w('l06', .6), no3=w('l06b', .05), tres=w('l06b', .05),
         sil1=round(e('l06b'), 3), gallo=w('l07', -.2), se_volvio=w('l08', .45), miro=w('l08', 1.25), lloro=w('l09', 1.05),
         devolvio=w('l10', 1.75), salio=w('l11', .05), no_volvio=w('l11', 1.1), sil2=round(e('l11'), 3), orilla=w('l12', 1.75),
         brasas=w('l13', .45), preguntas=w('l14', .1), amas=w('l14', 1.75), apacienta=w('l15', .75), ovejas=w('l15', 1.5),
         vuelve=w('l16', .85), fuego2=w('l16b', .25), cta=H['l17'], palabra=w('l17b', .55))
# 11 planos (TREATMENT §5): fuego · huerto/beso · criada + silencio 1 · gallo y mirada · llanto · monedas · puerta + silencio 2 · orilla · brasas · las capas se abren · el fuego sigue
SHOTS = [['S1', 0, 'cut'], ['S2', H['l03'] - .35, 'dissolve'], ['S3', H['l05'] - .25, 'dissolve'], ['S4', H['gallo'] - .1, 'cut'],
         ['S5', H['l09'] - .2, 'dissolve'], ['S6', H['l10'] - .3, 'dissolve'], ['S7', H['l11'] - .2, 'cut'], ['S8', H['l12'] - .45, 'cut'],
         ['S9', H['l14'] - .4, 'dissolve'], ['S10', H['l15'] - .25, 'dissolve'], ['S11', H['l16'] - .15, 'dissolve']]
SHOTS = [[a, round(b, 3), c] for a, b, c in SHOTS]
cues = []
for n, (i, p, s) in enumerate(SCRIPT):
    t0 = L[i]['at']; nxt = L[SCRIPT[n + 1][0]]['at'] if n + 1 < len(SCRIPT) else DUR
    t1 = DUR + .5 if n + 1 == len(SCRIPT) else min(nxt - .04, max(t0 + dur[i] + .55, t0 + 1.8))
    cues.append({'t0': round(t0 - .05, 3), 't1': round(t1, 3), 'text': s})
json.dump({'DUR': DUR, 'L': L, 'HIT': H, 'SHOTS': SHOTS, 'cues': cues}, open(os.path.join(F, 'timeline.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
def ts(x): h, m = int(x // 3600), int(x % 3600 // 60); return f'{h:02}:{m:02}:{x % 60:06.3f}'.replace('.', ',')
with open(os.path.join(F, 'subtitulos.srt'), 'w', encoding='utf-8') as f:
    for n, c in enumerate(cues, 1): f.write(f"{n}\n{ts(c['t0'])} --> {ts(min(c['t1'], DUR))}\n{c['text'].replace('*', '')}\n\n")
print('DUR', DUR, 'shots', [(a, b) for a, b, _ in SHOTS])
