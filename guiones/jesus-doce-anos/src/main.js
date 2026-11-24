// Perdido tres días (Lucas 2:41–52): timeline.json drives picture and subtitles. ?nosub=1 hides subtitles; ?ssaa=N sets supersampling.
import * as THREE from 'three';
import { Pipe } from './post.js';
import { dispose } from './stage.js';
import { ss, seg, clamp, back } from './lib.js';
import * as SH from './shots.js';

const Q = new URLSearchParams(location.search), SSAA = +(Q.get('ssaa') || 2);
const W = 1080, H = 1920;
const TL = await (await fetch('timeline.json')).json();
window.DUR = TL.DUR;
const TR = { cut: { type: 'cut', dur: 0 }, dissolve: { type: 'dissolve', dur: .6 } };
const plan = TL.SHOTS.map(([id, start, tr]) => ({ id, start, in: TR[tr] || TR.cut }));
plan.forEach((s, i) => { s.end = i + 1 < plan.length ? plan[i + 1].start : TL.DUR; });

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
renderer.setPixelRatio(SSAA); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.NoToneMapping; renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const pipe = new Pipe(renderer, W, H, SSAA);
await Promise.all([document.fonts.load('700 40px Cinzel', 'ÁÍÓ'), document.fonts.load('800 40px Cinzel', 'PERDIDO TRES DÍAS'), document.fonts.load('800 40px Cinzel', 'A'), document.fonts.load('italic 500 40px Playfair', 'Lucas 2:41–52')]);

const live = new Map();
function get(i) { if (!live.has(i)) live.set(i, SH[plan[i].id]({ H: TL.HIT, TITLE: TL.TITLE, T0: plan[i].start, dur: plan[i].end - plan[i].start })); return live.get(i); }
function gc(keep) { for (const [i, s] of live) if (!keep.includes(i)) { dispose(s.S.scene); live.delete(i); } }
function draw(i, t, target) { const s = get(i); s.update(t); pipe.shot(s.S.scene, s.S.cam, s.post(), target); return s.grade(); }

const sub = document.getElementById('sub');
const html = s => s.replace(/\*([^*]+)\*/g, '<b>$1</b>');
let shown = null;
window.render = t => {
  let i = plan.findIndex(p => t >= p.start && t < p.end); if (i < 0) i = plan.length - 1;
  const p = plan[i], tl = t - p.start;
  let g, mixB = 0;
  if (i > 0 && p.in.type !== 'cut' && tl < p.in.dur) { draw(i - 1, t, pipe.rtA); g = draw(i, t, pipe.rtB); mixB = ss(tl / p.in.dur); gc([i - 1, i]); }
  else { g = draw(i, t, pipe.rtA); gc([i]); }
  pipe.final({ ...g, mixB, fade: (g.fade ?? 1) * ss(clamp(t / .4)) * (1 - ss(seg(t, TL.DUR - .6, TL.DUR))) });
  let c = null, a = 0, k = 1;
  for (const q of TL.cues) if (t >= q.t0 && t < q.t1) { c = q; a = Math.min(ss(seg(t, q.t0, q.t0 + .14)), 1 - ss(seg(t, q.t1 - .16, q.t1))); k = .9 + .1 * back(seg(t, q.t0, q.t0 + .26)); }
  const txt = c ? c.text : '';
  if (txt !== shown) { sub.innerHTML = html(txt); shown = txt; }
  sub.style.opacity = Q.has('nosub') ? 0 : a; sub.style.transform = `scale(${k})`;
};
window.READY = true;
