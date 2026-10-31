"""Kokoro TTS (onnx) with espeak-ng Spanish phonemes. Usage: tts.py voice speed out.wav "text" """
import json, re, subprocess, sys
import numpy as np, onnxruntime as ort
from scipy.io import wavfile

import os
HERE = os.path.dirname(os.path.abspath(__file__))
MODELS = os.environ.get('REELS_MODELS', os.path.expanduser('~/.cache/reels-ia'))
VOCAB = json.load(open(os.path.join(HERE, 'kokoro_vocab.json')))
_sess = None


def sess():
    global _sess
    if _sess is None:
        _sess = ort.InferenceSession(os.path.join(MODELS, 'kokoro-v1.0.onnx'))
    return _sess


_V = None


def _voices():
    global _V
    if _V is None:
        _V = np.load(os.path.join(MODELS, 'voices-v1.0.bin'))
    return _V


def espeak(text):
    out = subprocess.run(['espeak-ng', '-q', '--ipa', '-v', 'es-419', text],
                         capture_output=True, text=True).stdout
    return ' '.join(out.split())


def phonemize(text):
    parts = re.split(r'([,.:;?!¿¡…])', text)
    ph = ''
    for p in parts:
        if not p.strip():
            continue
        if p in ',.:;?!…':
            ph = ph.rstrip() + p + ' '
        elif p in '¿¡':
            continue
        else:
            ph += espeak(p) + ' '
    return ''.join(c for c in ph.strip() if c in VOCAB)


def synth(text, voice='em_alex', speed=1.1):
    ph = phonemize(text)
    toks = [VOCAB[c] for c in ph]
    v = _voices()[voice]
    style = v[min(len(toks), len(v)) - 1]
    audio = sess().run(None, {'tokens': np.array([[0, *toks, 0]], dtype=np.int64),
                              'style': style.astype(np.float32),
                              'speed': np.array([speed], dtype=np.float32)})[0].ravel()
    return audio, ph


if __name__ == '__main__':
    voice, speed, out, text = sys.argv[1], float(sys.argv[2]), sys.argv[3], sys.argv[4]
    a, ph = synth(text, voice, speed)
    wavfile.write(out, 24000, a.astype(np.float32))
    print(ph, len(a) / 24000)
