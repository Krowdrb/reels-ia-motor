"""guion.json -> carpeta de trabajo: voz (wav), timeline.json con tiempos resueltos, subtitulos.srt, vo_track.wav.
Uso: python3 build.py guion.json WORKDIR
"""
import json, math, os, re, subprocess, sys
import numpy as np
from scipy.io import wavfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tts import synth

SR = 24000
LOOP_TAIL = 1.7


def norm(w):
    return re.sub(r'[^a-z0-9áéíóúñü]', '', w.lower())


def spoken_text(text, pron):
    s = text
    for k, v in sorted(pron.items(), key=lambda kv: -len(kv[0])):
        s = re.sub(r'(?<![\wáéíóúñÁÉÍÓÚÑ])' + re.escape(k) + r'(?![\wáéíóúñÁÉÍÓÚÑ])', v, s)
    return s


def ph_len(word, pron):
    w = re.sub(r'[^\wáéíóúñü]', '', word, flags=re.I)
    w = pron.get(w, w)
    out = subprocess.run(['espeak-ng', '-q', '--ipa', '-v', 'es-419', w], capture_output=True, text=True).stdout
    return max(1, len(re.sub(r'[\sˈˌ]', '', out)))


def split_sentences(vo):
    parts = re.split(r'(?<=[.!?…])\s+', vo.strip())
    return [p for p in parts if p.strip()]


def trim(a, thr=0.01):
    idx = np.where(np.abs(a) > thr)[0]
    if len(idx) == 0:
        return a
    return a[max(0, idx[0] - 240):min(len(a), idx[-1] + 1200)]


def main(gpath, W):
    G = json.load(open(gpath))
    os.makedirs(f'{W}/vo', exist_ok=True)
    pron = G.get('pronunciation', {})
    voice, speed = G.get('voice', 'ef_dora'), float(G.get('speed', 1.2))
    scenes_out, track, t0 = [], [], 0.0
    n_sc = len(G['scenes'])
    for si, sc in enumerate(G['scenes']):
        sents = split_sentences(sc['vo'])
        items = []
        for li, raw in enumerate(sents):
            disp = raw.replace('*', '')
            a, _ = synth(spoken_text(disp, pron), voice, speed)
            a = trim(a)
            fn = f'{W}/vo/s{si}_{li}.wav'
            wavfile.write(fn, SR, a.astype(np.float32))
            items.append(dict(raw=raw, text=disp, file=fn, dur=len(a) / SR))
        lead = 0.25 if si == 0 else 0.2
        gaps = [0.22] * (len(items) - 1)
        tail = 0.3 + (LOOP_TAIL if si == n_sc - 1 else 0)
        nat = lead + sum(i['dur'] for i in items) + sum(gaps) + tail
        dur = math.ceil(nat / 0.5) * 0.5 + float(sc.get('hold', 0))
        slack = dur - nat
        if gaps:
            gaps = [g + slack * 0.6 / len(gaps) for g in gaps]
            lead += slack * 0.15
        t = t0 + lead
        sl = []
        for k, it in enumerate(items):
            # keyword markers: *palabra* or *varias palabras*
            keyset, inkey, toks = [], False, []
            for tok in it['raw'].split():
                start = tok.startswith('*') or tok.startswith('¿*') or tok.startswith('¡*')
                if start:
                    inkey = True
                key = inkey
                if tok.rstrip('.,:;!?…»"').endswith('*'):
                    inkey = False
                toks.append((tok.replace('*', ''), key))
            wts = [ph_len(w, pron) + (3 if re.search(r'[,.:;?!]$', w) else 0) for w, _ in toks]
            if re.search(r'[,.:;?!]$', toks[-1][0]):
                wts[-1] -= 3
            tot, cur, span = sum(wts), t + 0.03, it['dur'] - 0.08
            wl = []
            for (w, key), wt in zip(toks, wts):
                d = span * wt / tot
                wl.append(dict(w=w, s=round(cur, 3), e=round(cur + d, 3), key=key))
                cur += d
            sl.append(dict(text=it['text'], s=round(t, 3), e=round(t + it['dur'], 3), words=wl))
            track.append((t, it['file']))
            t += it['dur'] + (gaps[k] if k < len(gaps) else 0)
        scenes_out.append(dict(i=si, s=round(t0, 3), e=round(t0 + dur, 3), sents=sl))
        t0 += dur

    # ---- resolve cue words into scene-local seconds ----
    def words_of(si):
        sc = scenes_out[si]
        return [(w['w'], w['s'] - sc['s']) for se in sc['sents'] for w in se['words']]

    def resolve(si, cue, after=0.0):
        if cue is None or cue == 'start':
            return 0.0
        if isinstance(cue, (int, float)):
            return float(cue)
        m = re.match(r'^(.*?)(?:#(\d+))?([+-]\d*\.?\d+)?$', cue.strip())
        word, nth, off = m.group(1), int(m.group(2) or 1), float(m.group(3) or 0)
        c = 0
        for w, ts in words_of(si):
            if ts >= after - 0.05 and norm(w).startswith(norm(word)):
                c += 1
                if c == nth:
                    return round(ts + off, 3)
        raise SystemExit(f'ERROR escena {si + 1}: no encuentro la palabra "{cue}" (después de {after:.2f}s). '
                         f'Palabras: {" ".join(w for w, _ in words_of(si))}')

    beats_all = []
    for si, sc in enumerate(G['scenes']):
        out = scenes_out[si]
        prev = 0.0
        beats = []
        for b in sc.get('beats', []):
            b = json.loads(json.dumps(b))
            b['t'] = resolve(si, b.get('at', 'start'), prev)
            prev = b['t']
            for k in list(b.keys()):
                if k.endswith('At') and isinstance(b[k], (str, int, float)):
                    b[k] = resolve(si, b[k], b['t'])
            if isinstance(b.get('cross'), dict):
                b['cross']['t'] = resolve(si, b['cross'].get('at'), b['t'])
            for key in ('items', 'bases', 'poses'):
                last = b['t']
                for it in b.get(key, []):
                    if isinstance(it, dict) and 'at' in it:
                        it['t'] = resolve(si, it['at'], last)
                        last = it['t']
            beats.append(b)
        out['beats'] = beats
        # estilo cinematográfico: campos de escena y planos (shots) con su palabra de entrada
        for k, v in sc.items():
            if k not in ('vo', 'beats', 'punch', 'label', 'badge', 'bg', 'backdrop', 'hold', 'shots'):
                out.setdefault(k, v)
        if sc.get('shots') or sc.get('set'):
            shots = json.loads(json.dumps(sc.get('shots') or [{k: sc[k] for k in ('set', 'cam', 'chars', 'fx', 'mood', 'light') if k in sc}]))
            prev_t = 0.0
            for sh in shots:
                sh['t'] = resolve(si, sh.get('at', 'start'), prev_t)
                prev_t = sh['t']
                for ch in sh.get('chars', []):
                    if isinstance(ch.get('at'), str):
                        ch['at'] = round(resolve(si, ch['at'], sh['t']) - sh['t'], 3)
                for ev in sh.get('events', []):
                    ev['t'] = resolve(si, ev.get('at', 'start'), sh['t'])
            out['shots'] = shots
        out['bg'] = sc.get('bg', 'dark')
        if sc.get('backdrop'):
            out['backdrop'] = sc['backdrop']
        out['label'] = sc.get('label')
        if sc.get('badge'):
            out['badge'] = dict(text=sc['badge']['text'], t=resolve(si, sc['badge'].get('at', 'start')))
        pt, ps = 0.0, []
        for p in sc.get('punch', []):
            pt = resolve(si, p, pt)
            ps.append(pt)
        out['punch'] = ps

    # ---- captions: 1-3 words; key word closes its chunk ----
    chunks = []
    for sc in scenes_out:
        for se in sc['sents']:
            cur = []
            for w in se['words']:
                cur.append(w)
                if re.search(r'[,.:;?!]$', w['w']) or len(cur) == 3 or w['key']:
                    chunks.append(cur)
                    cur = []
            if cur:
                chunks.append(cur)
    caps = []
    for i, c in enumerate(chunks):
        s, e = c[0]['s'], c[-1]['e']
        nxt = chunks[i + 1][0]['s'] if i + 1 < len(chunks) else e + 0.5
        e = min(max(e, s + 0.35), nxt) if nxt - e < 0.6 else e + 0.15
        caps.append(dict(s=round(s, 3), e=round(e, 3), words=[dict(w=w['w'], key=w['key'], s=w['s']) for w in c]))

    # personajes: definidos en el guion ("characters") o en personajes/<id>.json del repo
    chars = {}
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    for sc in G['scenes']:
        for bt in sc.get('beats', []):
            cid = bt.get('character')
            if cid and cid not in chars:
                if cid in G.get('characters', {}):
                    chars[cid] = G['characters'][cid]
                elif os.path.exists(f'{root}/personajes/{cid}.json'):
                    chars[cid] = json.load(open(f'{root}/personajes/{cid}.json'))
                else:
                    raise SystemExit(f'ERROR: personaje "{cid}" no está en "characters" del guion ni en personajes/{cid}.json')
    tl = dict(total=t0, scenes=scenes_out, caps=caps, characters=chars, style=G.get('style', 'motion'), title_card=G.get('title_card'), format=G.get('format', '9:16'))
    json.dump(tl, open(f'{W}/timeline.json', 'w'), ensure_ascii=False, indent=1)
    open(f'{W}/tl.js', 'w').write('const TL=' + json.dumps(tl, ensure_ascii=False) + ';\n')

    N = int(t0 * SR)
    buf = np.zeros(N, np.float32)
    for t, f in track:
        _, a = wavfile.read(f)
        i = int(t * SR)
        buf[i:i + len(a)] += a[:N - i]
    wavfile.write(f'{W}/vo_track.wav', SR, buf)
    # envolvente de la voz por fotograma (para mover la boca de los personajes)
    hop = SR // 30
    env = np.array([np.sqrt(np.mean(buf[i:i + hop] ** 2)) if i < len(buf) else 0 for i in range(0, int(t0 * SR) + hop, hop)])
    ref = np.percentile(env[env > 1e-4], 90) if (env > 1e-4).any() else 1
    env = np.clip(env / ref, 0, 1)
    env = np.convolve(env, [0.25, 0.5, 0.25], 'same')
    tl['mouth'] = [round(float(v), 2) for v in env]
    open(f'{W}/tl.js', 'w').write('const TL=' + json.dumps(tl, ensure_ascii=False) + ';\n')
    json.dump(tl, open(f'{W}/timeline.json', 'w'), ensure_ascii=False, indent=1)

    def ts(x):
        ms = int(round(x * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
        return f'{h:02}:{m:02}:{s:02},{ms:03}'
    with open(f'{W}/subtitulos.srt', 'w') as f:
        for i, c in enumerate(caps, 1):
            f.write(f"{i}\n{ts(c['s'])} --> {ts(c['e'])}\n{' '.join(w['w'] for w in c['words'])}\n\n")
    print(f'OK duración {t0:.1f}s · escenas ' + ' '.join(f"{s['s']:.1f}-{s['e']:.1f}" for s in scenes_out))


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
