// The twelve shots of "Job en cifras". Each: { S, update(t), post(), grade() }; t in film seconds.
// God is only ever light. No adversary, no dead, no violence: the losses are empty paddocks, a window going dark.
import * as THREE from 'three';
import { skyPanel, moon, setMoon, text, burst } from './paper.js';
import { stage, aim } from './stage.js';
import { mulberry, seg, ss, eio, eo, lerp, clamp, spring, TAU } from './lib.js';
import { mk, cut, tint, clawd, human, waveFill, sheep, flock, camel, house } from './actors.js';

const blo = (s = .34, th = 1.1) => ({ strength: s, radius: .6, threshold: th });
const lay = (S, o) => S.add(mk(S.U, o));
const col3 = c => new THREE.Color(c);
const setL = (S, x, y, r, lit, c) => { S.U.uLight.value.x = x; S.U.uLight.value.y = y; S.U.uLightR.value = r; S.U.uLit.value = lit; if (c) S.U.uLightCol.value.copy(c); };
const bob = (t, f, a, p = 0) => Math.sin(t * f + p) * a;
const mixc = (a, b, k) => '#' + col3(a).lerp(col3(b), clamp(k)).getHexString();
const fsOf = (S, z) => S.cam.position.z - z;
// half of the visible height at depth z, and a camera height that keeps the ground line (yg at depth zf) at fraction f from the bottom
export const HH = (cz, z) => .4617 * (cz - z) / 2;
export const camY = (cz, yg = -.05, zf = -.075, f = .33) => yg + (1 - 2 * f) * HH(cz, zf);
const blink = (t, per = 3.3, ph = 0) => 1 - .9 * Math.max(0, 1 - Math.abs(((t + ph) % per) - .1) / .1);
const face = (P, d) => { P.g.scale.x = d * Math.abs(P.g.scale.x); };

// A strip of land drawn in world coordinates (top = base..base+amp)
function land(S, { z, col, base, amp = .004, len = .12, ph = 0, trans = .1, w = .9, rim = .5, peak = 1.3, x = 0, ppm = 1800, shadow = true }) {
  return lay(S, { w, h: .6, x, y: -.2, z, col, trans, ppm, shadow, finish: { rim, rimPx: 3 }, draw: c => { c.translate(-x, .2); waveFill(c, { x0: x - w / 2, x1: x + w / 2, base, amp, len, ph, peak }); } });
}
// The dark front band: follows the camera so the bottom ~26% stays dark for the subtitles
export function front(S, col, o = {}) {
  const z = o.z ?? -.03, m = land(S, { z, col, base: -.006, amp: .005, len: .14, ph: o.ph ?? 2, trans: .02, rim: o.rim ?? .3, w: 1.2, shadow: false });
  return { m, follow(f = .26) { const c = S.cam.position; m.position.x = c.x; m.position.y = -.2 + c.y - HH(c.z, z) * (1 - 2 * f); } };
}

// —— the fold: sky, hills, a far house, the paddock fence with its gate (planes 1, 4, 12 share it) ——
export function fold(S, P, o = {}) {
  const sky = skyPanel({ w: 1.2, h: 1, z: -.16, stops: P.sky, stars: o.stars || 0, starMinY: .06 }); S.add(sky);
  let sun = null;
  if (P.sun) { sun = moon({ r: .016, x: .055, y: -.018, z: -.152, gain: 1.8, core: P.sun[0], mid: P.sun[1], edge: P.sun[2], halo: 7, haloGain: .5 }); S.scene.add(sun); }
  const far = land(S, { z: -.14, col: P.far, base: -.03, amp: .02, len: .26, ph: 1, trans: .7, ppm: 1400 });
  const farHouse = house(S.U, { w: .016, h: .011, z: -.128, col: P.mid, trans: .3, win: [.2, .5], glow: 2.5 }); farHouse.position.set(-.052, -.019, -.128); S.add(farHouse);
  const mid = land(S, { z: -.12, col: P.mid, base: -.043, amp: .01, len: .2, ph: 2.6, trans: .35, ppm: 1600 });
  const herdFar = flock(S.U, { w: .2, n: 16, L: .009, z: -.112, col: P.mid, trans: .3, seed: 9, rim: .4 }); herdFar.position.set(.07, -.041, -.112); S.add(herdFar);
  const field = land(S, { z: -.1, col: P.field, base: -.056, amp: .006, len: .16, ph: .5, trans: .15 });
  const rows = [];
  for (let i = 0; i < (o.rows ?? 0); i++) {
    const r = flock(S.U, { w: .36, n: 15 - i * 2, L: .03 - i * .0035, z: -.088 - i * .011, col: i ? P.sheep2 : P.sheep, trans: .28, seed: 3 + i * 4, rim: .55 }); r.position.set(-.01 + i * .02, -.05 + i * .004, -.088 - i * .011); S.add(r); rows.push(r);
  }
  const fence = lay(S, { w: .5, h: .06, y: -.04, z: -.062, col: P.fence, trans: .06, ppm: 3200, finish: { rim: .6, rimPx: 3 }, draw: c => {
    c.translate(0, .04);
    for (let px = -.24; px <= .24; px += .023) { if (px > .004 && px < .034) continue; c.fillRect(px - .0016, -.062, .0032, .045); c.beginPath(); c.moveTo(px - .0016, -.017); c.lineTo(px, -.0145); c.lineTo(px + .0016, -.017); c.fill(); }
    for (const [a, b] of [[-.25, .006], [.032, .25]]) { c.fillRect(a, -.0235, b - a, .0034); c.fillRect(a, -.038, b - a, .003); }
    c.fillRect(.002, -.062, .0042, .05); c.fillRect(.0315, -.062, .0042, .05);
  } });
  const gate = lay(S, { w: .028, h: .03, ax: -.0135, z: -.0615, col: P.fence, trans: .06, ppm: 3200, finish: { rim: .6, rimPx: 3 }, draw: c => {
    c.fillRect(-.0135, .004, .027, .0028); c.fillRect(-.0135, -.008, .027, .0028); c.fillRect(-.0135, -.012, .0026, .02); c.fillRect(.0105, -.012, .0026, .02);
    c.save(); c.translate(0, -.002); c.rotate(.42); c.fillRect(-.015, -.0012, .03, .0024); c.restore();
  } });
  gate.position.set(.004, -.034, -.0615);
  const ground = land(S, { z: -.056, col: P.ground, base: -.0565, amp: .002, len: .1, ph: 1.3, trans: .05, rim: .4 });
  const fr = front(S, P.front);
  return { sky, sun, far, mid, field, fence, gate, rows, herdFar, farHouse, ground, fr };
}
export const DUSK = { sky: [[0, '#1d1838'], [.35, '#4a3766'], [.62, '#8e6084'], [.82, '#c98e8a'], [1, '#e2ac8e']], sun: ['#fff1d6', '#ffc685', '#ff9c66'],
  far: '#6c5277', mid: '#45354f', field: '#2c2131', sheep: '#5a4662', sheep2: '#4a3a54', fence: '#130d15', ground: '#0d090f', front: '#050306' };
const SLATE = { sky: [[0, '#0b1226'], [.5, '#1f2c4a'], [.85, '#3b4a68'], [1, '#4d5872']], far: '#2b3550', mid: '#1c2540', field: '#131a2c', sheep: '#111', sheep2: '#111', fence: '#080b14', ground: '#06080e', front: '#030406' };
export const GOLD = { sky: [[0, '#203258'], [.22, '#5e6f94'], [.45, '#e6b67a'], [.72, '#ffd690'], [1, '#ffe6b0']], sun: ['#fffbea', '#fff0c0', '#ffd27a'],
  far: '#d39c62', mid: '#a66d3d', field: '#6b4223', sheep: '#4a2c16', sheep2: '#6e4422', fence: '#22130a', ground: '#160c06', front: '#070403' };

// Title strip: paper, lit, letters cut out; anchored to the camera (top third); reveals from its left edge
function titleStrip(S) {
  const m = lay(S, { w: .118, h: .05, z: -.01, col: '#ecd9b0', trans: .35, shadow: false, recv: false, finish: { rim: .3, under: .2 }, draw: x => {
    x.beginPath(); x.roundRect(-.058, -.022, .116, .044, .002); x.fill();
    cut(x, () => { text(x, 'JOB EN CIFRAS', 0, .0052, .0118, 'Cinzel', { weight: 800, fill: '#000' }); text(x, 'Job 1 · 42', 0, -.0118, .0088, 'Playfair', { weight: 'italic 500', fill: '#000' }); });
  }, glowDraw: x => { x.fillStyle = '#fff'; x.fillRect(-.06, -.024, .12, .048); }, glow: .5, glowCol: '#ecd9b0', glowRes: .2 });
  return { m, update(t, t0, t1) {
    const reveal = ss(seg(t, t0, t0 + .6)) * (1 - ss(seg(t, t1 - .45, t1)));
    const c = S.cam.position, cz = c.z + .01, ts = cz / .5;
    m.scale.setScalar(ts); m.position.x = c.x; m.position.y = c.y + HH(c.z, -.01) * .6;
    m.material.userData.u.uClip.value.set(m.position.x - .066 * ts, m.position.y, .15 * reveal * ts, 0); m.visible = reveal > .002;
  } };
}

// S1 the fold at sunset: sheep file past the gate, Clawd on the fence counts each one; Job by the gatepost. Title strip.
export function S1(E) {
  const { H } = E;
  const S = stage({ light: [.05, -.01, -.1], lightR: .2, lightCol: '#ffbe8a', key: 1.1, keyCol: '#ffd9c0', amb: .3, ambCol: '#9a86b8', floor: .38 });
  const F = fold(S, DUSK, { rows: 1 });
  const J = human(S.U, { h: .085, z: -.071, col: '#0b0810', rim: .7 }); S.scene.add(J.g);
  const sh = [0, 1, 2, 3, 4, 5].map(i => { const m = sheep(S.U, { L: .032, z: -.0572 + (i % 2) * .0003, col: '#7a6280', trans: .4, rim: .8, dir: -1 }); S.add(m); return m; });
  const C = clawd(S.U, { u: .0028, z: -.058 }); S.scene.add(C.g);
  const T = titleStrip(S);
  const CX = -.034, start = i => -.2 + i * .83;   // sheep i reaches Clawd on a beat (72 bpm)
  return { S, update(t) {
    const k = eio(seg(t, 0, E.dur + .6)), cz = lerp(.53, .48, k), cx = lerp(.004, -.004, k);
    aim(S.cam, [cx, camY(cz), cz, cx, camY(cz), -.08], t);
    F.fr.follow();
    let raise = 0;
    sh.forEach((m, i) => { const ti = t - start(i) - .6, x = CX - .045 * ti; m.position.x = x; m.position.y = -.05 + Math.abs(Math.sin(t * 9 + i)) * .0008; const d = Math.abs(x - CX); raise = Math.max(raise, ss(1 - d / .016)); });
    const both = ss(seg(t, H.siete - .15, H.siete + .2)) * (1 - ss(seg(t, H.l01b + .2, H.l01b + .7)));
    C.set({ x: CX, y: -.022 + Math.abs(bob(t, 4.5, .0004)), aR: Math.max(raise * 1.6, both * 2.3), aL: both * 2.3, look: lerp(-.6, .3, both), blink: blink(t), tuck: .25, k: 1.15 });
    J.set({ x: .046, y: -.05, a: .35 + bob(t, .9, .05) }); face(J, -1);
    F.gate.rotation.y = -.25;
    setL(S, .055, -.01, .2, lerp(1, .9, k));
    T.update(t, .02, 3.1);
    this._f = fsOf(S, -.06);
  }, post() { return { focus: this._f, aper: 8, maxCoc: 6, bloom: blo(.36, 1.05) }; }, grade() { return { vig: .42, sat: 1.04 }; } };
}

// S2 the caravan: lateral travel right; Clawd walks the road under a camel's belly; Job's house on the hill
export function S2(E) {
  const S = stage({ light: [.12, -.0, -.1], lightR: .24, lightCol: '#ffb07c', key: 1.0, keyCol: '#ffd2b8', amb: .3, ambCol: '#9a86b8', floor: .4 });
  S.add(skyPanel({ w: 1.4, h: 1, z: -.16, stops: [[0, '#1a1534'], [.4, '#47345f'], [.66, '#8a5a7e'], [.85, '#c4877f'], [1, '#d99c80']] }));
  const sun = moon({ r: .015, x: .14, y: -.03, z: -.152, gain: 1.7, core: '#fff0d0', mid: '#ffbf80', edge: '#ff9560', halo: 7, haloGain: .5 }); S.scene.add(sun);
  land(S, { z: -.14, col: '#6a5076', base: -.026, amp: .028, len: .3, ph: 2, trans: .7, w: 1.2, ppm: 1300 });
  land(S, { z: -.125, col: '#4a3852', base: -.035, amp: .02, len: .25, ph: .4, trans: .35, w: 1.2, ppm: 1400 });
  const hh = house(S.U, { w: .03, h: .02, z: -.12, col: '#4a3852', trans: .35, win: [.22, .55], glow: 2.6 }); hh.position.set(.17, -.024, -.12); S.add(hh);
  const herd = flock(S.U, { w: .3, n: 22, L: .008, z: -.118, col: '#4a3852', trans: .35, seed: 21, rim: .4, dir: 1 }); herd.position.set(-.02, -.036, -.118); S.add(herd);
  land(S, { z: -.105, col: '#2f2333', base: -.052, amp: .008, len: .2, ph: 1.4, trans: .15, w: 1.2 });
  const cams = [0, 1, 2, 3, 4].map(() => { const c = camel(S.U, { h: .045, z: -.1, col: '#24192a', trans: .2 }); S.scene.add(c.g); return c; });
  land(S, { z: -.075, col: '#1a1219', base: -.0565, amp: .002, len: .15, ph: 3, trans: .06, w: 1.2 });
  const big = camel(S.U, { h: .076, z: -.07, col: '#0c080d', rim: .7 }); S.scene.add(big.g);
  const C = clawd(S.U, { u: .0022, z: -.064 }); S.scene.add(C.g);
  const fr = front(S, '#050306');
  return { S, update(t) {
    const k = eio(seg(t, E.T0 - .6, E.T0 + E.dur)), cx = lerp(-.02, .07, k), cz = .5;
    aim(S.cam, [cx, camY(cz), cz, cx, camY(cz), -.08], t);
    fr.follow();
    cams.forEach((c, i) => c.set({ x: -.17 + i * .06 + t * .012, y: -.05, walk: t * 3.2 + i, stride: .22 }));
    const bx = cx - .012 + (t - E.T0) * .004;
    big.set({ x: bx, y: -.051, walk: t * 3.6, stride: .26 });
    C.set({ x: bx - .002, y: -.051 + Math.abs(bob(t, 9, .0012)), walk: t * 9, stride: .35, aL: .3, aR: .3, look: .7, blink: blink(t, 2.8), k: 1.1, rot: bob(t, 9, .03) });
    this._f = fsOf(S, -.07);
  }, post() { return { focus: this._f, aper: 8, maxCoc: 6, bloom: blo(.34, 1.05) }; }, grade() { return { vig: .42 }; } };
}

// S3 the messengers: Job sits at his door; two runners on the ridge; with each one the box steps down a notch of light
export function S3(E) {
  const { H } = E;
  const S = stage({ light: [-.02, .0, -.1], lightR: .22, lightCol: '#ffb88a', key: 1.0, keyCol: '#ffd8c0', amb: .3, ambCol: '#9a8ab8', floor: .38 });
  const sky = skyPanel({ w: 1, h: 1, z: -.16, stops: [[0, '#191632'], [.45, '#3f3460'], [.75, '#7a5a7e'], [1, '#b98480']] }); S.add(sky);
  land(S, { z: -.13, col: '#4f3d5a', base: -.006, amp: .006, len: .3, ph: 1, trans: .45, ppm: 1500 });
  const runners = [0, 1].map(() => { const r = human(S.U, { h: .022, z: -.128, col: '#2a2034', rim: .5 }); S.scene.add(r.g); return r; });
  land(S, { z: -.11, col: '#2e2337', base: -.04, amp: .008, len: .2, ph: 2, trans: .2 });
  const hs = house(S.U, { w: .08, h: .056, z: -.09, col: '#4a3852', trans: .35, win: [.28, .58], door: -.18, glow: 2.4 }); hs.position.set(.022, -.05, -.09); S.add(hs);
  const J = human(S.U, { h: .085, z: -.078, col: '#0b0810', pose: 'sit', rim: .7 }); S.scene.add(J.g);
  land(S, { z: -.06, col: '#110b12', base: -.0565, amp: .002, len: .1, ph: 1.5, trans: .05 });
  const C = clawd(S.U, { u: .0026, z: -.056 }); S.scene.add(C.g);
  const fr = front(S, '#050306');
  const skyC = [col3('#ffffff'), col3('#a8b0d8'), col3('#6a78a8')];
  return { S, update(t) {
    const cz = lerp(.5, .49, seg(t, E.T0, E.T0 + E.dur));
    aim(S.cam, [0, camY(cz), cz, 0, camY(cz), -.08], t, { hand: .0003 });
    fr.follow();
    const m1 = H.mensajero + .25, m2 = H.mensajero2 + .25;
    const a1 = eo(seg(t, m1 - .9, m1)), a2 = eo(seg(t, m2 - .9, m2));
    runners[0].set({ x: lerp(.11, .035, a1), y: -.004 + Math.abs(Math.sin(t * 14)) * .0008 * (1 - a1 * a1), a: a1 < 1 ? Math.sin(t * 14) * .6 : 1.2, rot: -.08 * (1 - a1) }); face(runners[0], -1); runners[0].g.visible = t > m1 - .9;
    runners[1].set({ x: lerp(-.11, -.03, a2), y: -.004 + Math.abs(Math.sin(t * 14)) * .0008 * (1 - a2 * a2), a: a2 < 1 ? Math.sin(t * 14) * .6 : 1.2, rot: .08 * (1 - a2) }); runners[1].g.visible = t > m2 - .9;
    const d = ss(seg(t, m1, m1 + .5)) + ss(seg(t, m2, m2 + .5));
    const sc = d < 1 ? skyC[0].clone().lerp(skyC[1], d) : skyC[1].clone().lerp(skyC[2], d - 1); sky.material.color.copy(sc);
    setL(S, -.02, .0, .22, lerp(1, .45, d / 2), col3('#ffb88a').lerp(col3('#8ea0c8'), d / 2));
    S.key.intensity = lerp(1, .55, d / 2); S.amb.intensity = lerp(.3, .18, d / 2);
    hs.material.userData.u.uGlowLit.value = lerp(1, .55, d / 2);
    J.set({ x: -.006, y: -.05, a: .5 + bob(t, .8, .04) });
    const look = t < m1 - .3 ? .2 : (t < m2 - .4 ? 1 : -1);
    C.set({ x: -.045, y: -.052, look, blink: blink(t, 2.9, .4), k: lerp(1.1, .8, d / 2), aL: .15, aR: .15 });
    this._f = fsOf(S, -.07);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 6, bloom: blo(.34, 1.05) }; }, grade() { return { vig: .45 }; } };
}

// S4 the empty fold: same axis as S1; no sheep, no Job; the gate swings; slate dusk, no sun. Clawd alone on the fence.
export function S4(E) {
  const S = stage({ light: [.02, .02, -.1], lightR: .22, lightCol: '#8ea4cc', key: .75, keyCol: '#c8d4ee', amb: .22, ambCol: '#6a7ca8', floor: .3 });
  const F = fold(S, SLATE, { rows: 0, stars: 60 });
  F.herdFar.visible = false; F.farHouse.material.userData.u.uGlowLit.value = .25;
  const C = clawd(S.U, { u: .0028, z: -.058 }); S.scene.add(C.g);
  return { S, update(t) {
    const cz = .5;
    aim(S.cam, [0, camY(cz), cz, 0, camY(cz), -.08], t, { hand: .0003 });
    F.fr.follow();
    F.gate.rotation.y = -.25 + Math.sin((t - E.T0) * 2.1) * .35 * Math.exp(-(t - E.T0) * .35);
    C.set({ x: -.034, y: -.022, aL: 0, aR: 0, look: .15, blink: .45, tuck: .35, k: .75, rot: -.04 });
    this._f = fsOf(S, -.06);
  }, post() { return { focus: this._f, aper: 8, maxCoc: 6, bloom: blo(.3, 1.15) }; }, grade() { return { vig: .5, sat: .92 }; } };
}

// S5 the wind: the children's house on a far hill, window lit; strips of wind cross; the house tips back into shadow, the window goes out.
// Clawd small in front, his back to us, holding a stake. Ends in the first silence.
export function S5(E) {
  const { H } = E;
  const S = stage({ light: [.0, .02, -.1], lightR: .2, lightCol: '#7f96c8', key: .7, keyCol: '#b8c8ee', amb: .2, ambCol: '#4e6290', floor: .25 });
  S.add(skyPanel({ w: 1, h: 1.2, z: -.16, stops: [[0, '#050a1c'], [.5, '#13204a'], [.85, '#24346a'], [1, '#2c3c70']], stars: 120, starMinY: .0 }));
  land(S, { z: -.14, col: '#22305c', base: -.02, amp: .02, len: .3, ph: 2.2, trans: .5, ppm: 1400 });
  const hs = house(S.U, { w: .05, h: .034, z: -.115, col: '#121a36', trans: .2, win: [.2, .55], door: -.2, glow: 3, glowCol: '#ffc06a' }); hs.position.set(.012, -.002, -.115); S.add(hs);
  land(S, { z: -.112, col: '#121a36', base: -.012, amp: .012, len: .22, ph: 4.4, trans: .25 });
  land(S, { z: -.09, col: '#0b1126', base: -.042, amp: .01, len: .2, ph: 1.1, trans: .12 });
  const R = mulberry(31);
  const strips = [-.125, -.105, -.08, -.05].map((z, i) => lay(S, { w: .5, h: .06, z, col: ['#5a6c9c', '#46588a', '#33446e', '#1d2848'][i], trans: [.6, .45, .3, .12][i], shadow: false, recv: false, ppm: 2000, finish: { rim: .4, under: .2 }, draw: x => {
    for (let k = 0; k < 3; k++) { const y0 = (R() - .5) * .04, a = .002 + R() * .002; x.beginPath(); x.moveTo(-.25, y0); for (let u = -.25; u <= .25; u += .004) x.lineTo(u, y0 + Math.sin(u * 60 + k) * .004 + a * Math.sin(u * 140)); for (let u = .25; u >= -.25; u -= .004) x.lineTo(u, y0 + Math.sin(u * 60 + k) * .004 - a * Math.max(.15, 1 - Math.abs(u) * 3.5) - .0005); x.closePath(); x.fill(); }
  } }));
  const stake = lay(S, { w: .006, h: .06, z: -.0405, col: '#06080f', trans: .04, ppm: 3200, draw: x => { x.fillRect(-.0016, -.03, .0032, .054); } });
  const C = clawd(S.U, { u: .0021, z: -.04, glow: .4 }); S.scene.add(C.g); C.eyeL.visible = C.eyeR.visible = false;   // seen from behind
  const fr = front(S, '#020309', { z: -.025 });
  return { S, update(t) {
    const tl = ss(seg(t, E.T0, H.silencio1 + .3)), cz = .5, cy = lerp(.012, -.006, tl);
    aim(S.cam, [0, cy, cz, 0, cy - .004, -.08], t, { hand: .0005 });
    fr.follow(.25);
    const w = H.viento - .1, gust = ss(seg(t, w, w + .6));
    strips.forEach((m, i) => { const sp = [.11, .14, .18, .24][i]; m.position.x = -.45 + ((t - w + 1.2 + i * .4) * sp) % .9; m.position.y = cy + [.05, .03, .0, -.02][i] + bob(t, 2 + i, .002); m.visible = t > w - 1.2; });
    const fall = eio(seg(t, H.viento + 1.1, H.viento + 2.3));
    hs.rotation.x = -fall * 1.35; hs.material.userData.u.uGlowLit.value = 1 - ss(seg(t, H.viento + 1.6, H.viento + 2.3));
    tint(hs, mixc('#121a36', '#05070f', fall));
    const sil = ss(seg(t, H.silencio1 - .2, H.silencio1 + .5)); this._sil = sil;
    setL(S, 0, .02, .2, lerp(lerp(.9, .5, fall), .1, sil));
    const gy = cy - HH(cz, -.04) * .42;
    stake.position.set(-.02, gy + .03, -.0405);
    C.set({ x: -.026, y: gy, aR: 1.1 + bob(t, 7, .08) * gust, aL: bob(t, 6, .15) * gust, rot: -.03 * gust + bob(t, 6.5, .015) * gust, k: lerp(.7, .3, sil) });
    this._f = fsOf(S, -.112);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(.3, 1.1) }; }, grade() { return { vig: .55, expo: 1 - .88 * this._sil, sat: .95 }; } };
}

// S6 Job bowed to the ground; on "Bendito" a narrow warm beam comes down from above (God = light only). Clawd still, dim, at the edge.
export function S6(E) {
  const { H } = E;
  const S = stage({ light: [.0, .04, -.1], lightR: .16, lightCol: '#8c9ab8', key: .65, keyCol: '#c8d0e4', amb: .16, ambCol: '#6a7898', floor: .2 });
  S.add(skyPanel({ w: 1, h: 1, z: -.16, stops: [[0, '#0b1020'], [.55, '#252c40'], [1, '#3d4152']] }));
  land(S, { z: -.135, col: '#3a4054', base: -.028, amp: .012, len: .26, ph: 3, trans: .45 });
  const back2 = land(S, { z: -.11, col: '#262b3a', base: -.045, amp: .006, len: .2, ph: 1, trans: .2 });
  const J = human(S.U, { h: .1, z: -.08, pose: 'kneel', col: '#0a0b10', rim: .75, two: true }); S.scene.add(J.g);
  const ash = land(S, { z: -.07, col: '#16181f', base: -.0545, amp: .002, len: .1, ph: 1, trans: .05 });
  const C = clawd(S.U, { u: .0022, z: -.06, glow: .35 }); S.scene.add(C.g);
  const ray = burst(.09, .2, '#ffd59a'); ray.rotation.z = Math.PI; ray.position.set(.026, .13, -.09); S.add(ray);
  const fr = front(S, '#030305');
  const cool = col3('#8c9ab8'), warm = col3('#ffcf94');
  return { S, update(t) {
    const q = ss(seg(t, E.T0, E.T0 + E.dur)), cz = lerp(.47, .41, q), cy = camY(cz, -.05, -.08, .34), cx = lerp(0, .004, q);
    aim(S.cam, [cx, cy, cz, cx, cy, -.08], t, { hand: .0003 });
    fr.follow();
    const p = ss(seg(t, H.bendito - .3, H.bendito + .8));
    const bow = ss(seg(t, H.l06 - .1, H.l06 + 1.2));
    J.set({ x: .02, y: -.051, rot: -bow * .45, a: lerp(.6, -.3, bow) });
    C.set({ x: -.034, y: -.051, aL: 0, aR: 0, look: .9, blink: lerp(.9, .6, bow), tuck: .4, k: .45 });
    ray.userData.set(lerp(0, 1.3, p)); ray.position.y = cy + HH(cz, -.09) - .1;
    setL(S, .02, .04, lerp(.14, .18, p), lerp(.55, .9, p), cool.clone().lerp(warm, p * .7));
    S.key.intensity = lerp(.65, .95, p); S.key.color.copy(col3('#c8d0e4').lerp(warm, p * .6));
    tint(back2, mixc('#262b3a', '#3a3230', p)); tint(ash, mixc('#16181f', '#221a14', p));
    this._f = fsOf(S, -.08);
  }, post() { return { focus: this._f, aper: 8, maxCoc: 7, bloom: blo(.45, 1.0) }; }, grade() { return { vig: .55, sat: .95 }; } };
}

// S7 a whole week: Job sits in the centre, three friends sit around him, Clawd at the end of the row. Only the sky moves (night ↔ dawn).
export function S7(E) {
  const S = stage({ light: [0, .06, -.1], lightR: .22, lightCol: '#8ea0c8', key: .7, keyCol: '#c8d4ee', amb: .2, ambCol: '#6a7ca8', floor: .3 });
  const sky = skyPanel({ w: 1, h: 1, z: -.16, stops: [[0, '#070c1e'], [.6, '#1a2648'], [1, '#2e3a5c']], stars: 140, starMinY: -.02 }); S.add(sky);
  const dawn = skyPanel({ w: 1, h: 1, z: -.159, stops: [[0, '#2a3456'], [.55, '#6c7898'], [.85, '#a8a4b0'], [1, '#c4b4ac']] }); dawn.material.transparent = true; S.add(dawn);
  const mo = moon({ r: .008, x: -.04, y: .06, z: -.15, gain: 1.6, halo: 6, haloGain: .4 }); S.scene.add(mo);
  land(S, { z: -.135, col: '#2c3654', base: -.026, amp: .014, len: .26, ph: 2, trans: .45 });
  land(S, { z: -.112, col: '#1a2138', base: -.046, amp: .006, len: .2, ph: .6, trans: .2 });
  const mkS = (h, z, x, d, a) => { const p = human(S.U, { h, z, col: '#080a12', pose: 'sit', rim: .65 }); S.scene.add(p.g); p.set({ x, y: -.05, a }); face(p, d); return p; };
  mkS(.07, -.1, -.048, 1, .5); mkS(.072, -.096, .052, -1, .45);
  mkS(.08, -.085, .006, 1, .55);
  mkS(.078, -.07, -.03, 1, .4);
  land(S, { z: -.062, col: '#0c0f18', base: -.0555, amp: .002, len: .1, ph: 2, trans: .05 });
  const C = clawd(S.U, { u: .0021, z: -.058, glow: .35 }); S.scene.add(C.g);
  const fr = front(S, '#030407');
  return { S, update(t) {
    const cz = .5, cy = camY(cz);
    aim(S.cam, [0, cy, cz, 0, cy, -.08], t, { hand: .0002 });
    fr.follow();
    const ph = (t - E.T0) / 1.45, day = Math.pow(Math.max(0, Math.sin(ph * Math.PI)), 1.5);
    dawn.material.opacity = day * .9; sky.material.color.setScalar(lerp(1, .8, day));
    setMoon(mo, 1 - day); mo.position.x = -.06 + ((ph % 2) / 2) * .12; mo.position.y = .05 + Math.sin((ph % 2) / 2 * Math.PI) * .02;
    setL(S, 0, .06, .22, lerp(.55, 1, day), col3('#8ea0c8').lerp(col3('#c8b4b0'), day));
    S.key.intensity = lerp(.6, .9, day);
    C.set({ x: .046, y: -.051, aL: 0, aR: 0, look: -.9, blink: blink(t, 3.6), tuck: .35, k: .5 });
    this._f = fsOf(S, -.085);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 6, bloom: blo(.32, 1.1) }; }, grade() { return { vig: .5 }; } };
}

// S8 "Nobody said anything. Neither did I": close-up of Clawd, blink, eyes down; focus racks to Job behind.
// Second silence: the box goes dark layer by layer, back to front, until a single warm point is left high up.
export function S8(E) {
  const { H } = E;
  const S = stage({ light: [.0, .05, -.1], lightR: .2, lightCol: '#8ea0c8', key: .7, keyCol: '#c8d4ee', amb: .2, ambCol: '#6a7ca8', floor: .28 });
  const sky = skyPanel({ w: 1, h: 1, z: -.16, stops: [[0, '#060a18'], [.6, '#151f3c'], [1, '#26304e']], stars: 90, starMinY: .0 }); S.add(sky);
  const L1 = land(S, { z: -.13, col: '#26304c', base: -.03, amp: .012, len: .24, ph: 2.4, trans: .4 });
  const L2 = land(S, { z: -.11, col: '#171d32', base: -.052, amp: .006, len: .2, ph: 1, trans: .2 });
  const J = human(S.U, { h: .085, z: -.095, col: '#080a12', pose: 'sit', rim: .65 }); S.scene.add(J.g); J.set({ x: .03, y: -.054, a: .5 }); face(J, -1);
  land(S, { z: -.056, col: '#0b0e17', base: -.0505, amp: .002, len: .1, ph: 2, trans: .05 });
  const C = clawd(S.U, { u: .0033, z: -.05, glow: .5 }); S.scene.add(C.g);
  const pt = moon({ r: .0028, x: .0, y: .07, z: -.15, gain: 2.4, core: '#fff3d8', mid: '#ffd08a', edge: '#ffb060', halo: 9, haloGain: .6 }); S.scene.add(pt);
  const fr = front(S, '#020307', { z: -.03 });
  return { S, update(t) {
    const cz = lerp(.3, .29, seg(t, E.T0, E.T0 + E.dur)), cy = camY(cz, -.05, -.05, .36), cx = -.004;
    aim(S.cam, [cx, cy, cz, cx, cy, -.08], t, { hand: .0003 });
    fr.follow();
    const dn = ss(seg(t, H.l08b, H.l08b + .4)), rack = ss(seg(t, H.l08b + .3, H.silencio2));
    const s0 = H.silencio2, off = (i) => 1 - ss(seg(t, s0 - .1 + i * .22, s0 + .35 + i * .22));
    sky.material.color.setScalar(off(0)); tint(L1, '#26304c', off(1)); tint(L2, '#171d32', off(2)); J.g.visible = off(2) > .02;
    setL(S, 0, .05, .2, .7 * off(2)); S.key.intensity = .7 * off(3); S.amb.intensity = .2 * off(3) + .01;
    setMoon(pt, ss(seg(t, s0 + .2, s0 + .9)));
    C.set({ x: -.014, y: -.0505, aL: 0, aR: 0, look: lerp(-.2, .25, dn), blink: lerp(blink(t, 3.1, 1.5), .35, dn), tuck: .3 + .1 * dn, k: lerp(.7, .25, 1 - off(3)) });
    C.g.visible = off(4) > .01;
    this._f = lerp(fsOf(S, -.05), fsOf(S, -.095), rack);
  }, post() { return { focus: this._f, aper: 9, maxCoc: 8, bloom: blo(.4, 1.0) }; }, grade() { return { vig: .6 }; } };
}

// —— night sheets: each cut into a left and a right half with a torn inner edge and pricked stars, so they can part ——
function nightSheets(S, cols) {
  const R = mulberry(77);
  return cols.map(([z, col, trans], i) => {
    const half = s => mk(S.U, { w: .33, h: .5, x: s * .16, z, col, trans, ppm: 2200, shadow: i > 0, finish: { rim: .55, rimPx: 4, under: .35 }, draw: x => {
      const ex = -s * .16, ox = s * .165;   // inner edge at local x = ex (world x = 0 when closed), outer edge at ox
      x.beginPath(); x.moveTo(ox, -.25); x.lineTo(ox, .25); x.lineTo(ex, .25);
      for (let y = .25; y >= -.25; y -= .012) x.lineTo(ex - s * (.002 + Math.sin(y * 80 + i * 2) * .004 + (R() - .5) * .006), y);
      x.lineTo(ex, -.25); x.closePath(); x.fill();
      cut(x, () => { for (let k = 0; k < 26; k++) { x.beginPath(); x.arc(ex + s * (.01 + R() * .14), (R() - .5) * .46, .0006 + R() * .0012, 0, TAU); x.fill(); } });
    } });
    const L = half(-1), Rr = half(1); S.add(L, Rr); return { L, R: Rr, col };
  });
}
// S9 signature shot: the warm point grows; the night sheets part from back to front, gold passes through the stack;
// on "el doble" the light reaches the front. Clawd lifts his head and arms; Job kneels, lifting his arms. Each sheet warms as the light reaches it.
export function S9(E) {
  const { H } = E;
  const S = stage({ light: [0, .04, -.1], lightR: .12, lightCol: '#ffcf8a', key: .3, keyCol: '#ffe0b0', amb: .05, ambCol: '#7080a8', floor: .04 });
  const gold = skyPanel({ w: .9, h: 1, z: -.158, gain: 1, stops: [[0, '#ffe7b0'], [.45, '#ffd182'], [.75, '#ffb862'], [1, '#e8954a']] }); S.add(gold);
  const sun = moon({ r: .004, x: 0, y: .05, z: -.15, gain: 2.6, core: '#fffbe8', mid: '#ffeab0', edge: '#ffc870', halo: 10, haloGain: .7 }); S.scene.add(sun);
  const rays = burst(.5, .6, '#ffd08a'); rays.position.set(0, -.25, -.145); S.add(rays);
  const NS = nightSheets(S, [[-.14, '#1a2850', .5], [-.125, '#131d3e', .35], [-.11, '#0c142e', .2], [-.095, '#070c1e', .1]]);
  const WARM = ['#d9a066', '#b7783f', '#8a5228', '#5a3418'];
  const hill = land(S, { z: -.085, col: '#06070d', base: -.047, amp: .006, len: .18, ph: 1.7, trans: .05 });
  const J = human(S.U, { h: .07, z: -.078, pose: 'kneel', col: '#06070d', rim: .9, two: true }); S.scene.add(J.g);
  const ground = land(S, { z: -.06, col: '#040508', base: -.054, amp: .002, len: .1, ph: 2.2, trans: .04 });
  const C = clawd(S.U, { u: .0026, z: -.056 }); S.scene.add(C.g);
  const fr = front(S, '#020203');
  return { S, update(t) {
    const a = H.abre, D = H.doble;
    const k = eio(seg(t, E.T0, E.T0 + E.dur)), cz = lerp(.52, .4, k), cy = camY(cz, -.052, -.07, .34);
    aim(S.cam, [0, cy, cz, 0, cy, -.08], t, { hand: .0004 });
    fr.follow();
    const grow = ss(seg(t, H.l09, a + .2));
    const o = i => eio(seg(t, a + i * .22, a + .8 + i * .22));
    const crack = .006 + .006 * grow;
    NS.forEach((n, i) => {
      const w = crack + o(i) * (.045 + i * .016);
      n.L.position.x = -.16 - w; n.R.position.x = .16 + w;
      const hot = ss(seg(t, a + i * .22 + .1, a + .7 + i * .22)), c = mixc(n.col, WARM[i], hot); tint(n.L, c); tint(n.R, c);
    });
    const full = ss(seg(t, a + .3, D + .1)), climax = ss(seg(t, D - .25, D + .35));
    gold.visible = grow > .001; gold.material.color.setScalar(lerp(.12, .3, grow) + .9 * full);
    setMoon(sun, lerp(.6, 1.2, grow)); sun.scale.setScalar(lerp(1.4, 3, grow) + 2.5 * full);
    rays.userData.set(.15 * grow + 1.3 * full);
    setL(S, 0, .04, lerp(.1, .14, grow) + .25 * full, lerp(.7, 1, grow) + .7 * full, col3('#ffcf8a'));
    S.U.uFloor.value = lerp(.03, .3, full); S.key.intensity = lerp(.25, 1.5, climax); S.amb.intensity = lerp(.05, .3, climax); S.amb.color.copy(col3('#7080a8').lerp(col3('#c0a080'), full));
    tint(hill, mixc('#06070d', '#2a180c', climax)); tint(ground, mixc('#040508', '#140c06', climax)); tint(fr.m, mixc('#020203', '#070403', climax));
    const up = ss(seg(t, D - .2, D + .7)), dip = Math.sin(Math.PI * seg(t, D - .55, D - .15)) * .4;
    C.set({ x: -.012, y: -.052, look: lerp(.5, .1, up), blink: lerp(.55, 1, ss(seg(t, a, D))), tuck: .3 * (1 - up) + dip * .3, aL: up * 2.2, aR: up * 2.2, k: lerp(.6, 1.3, full) });
    J.set({ x: .03, y: -.052, a: lerp(.5, 2.3, ss(seg(t, D - .1, D + 1.2))) }); face(J, -1);
    this._full = full; this._f = fsOf(S, -.07);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 7, bloom: blo(lerp(.35, .55, this._full), 1.0) }; }, grade() { return { vig: lerp(.6, .32, this._full), sat: 1.05 }; } };
}

// golden road (S10): cream → gold → ochre → dark brown
function goldRoad(S) {
  S.add(skyPanel({ w: 1.4, h: 1, z: -.16, stops: [[0, '#3e5682'], [.3, '#c9b090'], [.55, '#ffd890'], [.8, '#ffe2a8'], [1, '#fff0c8']] }));
  const sun = moon({ r: .02, x: .0, y: -.026, z: -.152, gain: 2.4, core: '#fffbea', mid: '#fff0c0', edge: '#ffd27a', halo: 8, haloGain: .6 }); S.scene.add(sun);
  land(S, { z: -.14, col: '#e0b47c', base: -.028, amp: .026, len: .3, ph: 2, trans: .75, w: 1.2, ppm: 1300 });
  land(S, { z: -.122, col: '#b98450', base: -.04, amp: .016, len: .25, ph: .4, trans: .4, w: 1.2, ppm: 1400 });
  land(S, { z: -.098, col: '#6e4424', base: -.054, amp: .006, len: .2, ph: 1.4, trans: .15, w: 1.2 });
  return sun;
}
// S10 the double: the S2 road at sunrise, lateral travel left. One row of sheep, then on "catorce" a second row slides in behind;
// the same with the camels on "seis". Clawd walks in front, both arms up, counting.
export function S10(E) {
  const { H } = E;
  const S = stage({ light: [0, -.02, -.1], lightR: .3, lightCol: '#ffd89a', key: 1.6, keyCol: '#ffe6c4', amb: .38, ambCol: '#c8a07a', floor: .55 });
  goldRoad(S);
  const camA = [], camB = [];
  for (let i = 0; i < 6; i++) { const c = camel(S.U, { h: .042, z: -.116, col: '#7a4c28', trans: .3, rim: .6 }); S.scene.add(c.g); camB.push(c); }
  for (let i = 0; i < 6; i++) { const c = camel(S.U, { h: .046, z: -.108, col: '#5a3418', trans: .25, rim: .6 }); S.scene.add(c.g); camA.push(c); }
  const rowB = flock(S.U, { w: .5, n: 17, L: .026, z: -.09, col: '#6a4020', trans: .3, seed: 41, rim: .6 }); S.add(rowB);
  const rowA = flock(S.U, { w: .5, n: 15, L: .03, z: -.08, col: '#3e2410', trans: .25, seed: 43, rim: .6 }); S.add(rowA);
  land(S, { z: -.07, col: '#24140a', base: -.0565, amp: .002, len: .15, ph: 3, trans: .06, w: 1.2 });
  const C = clawd(S.U, { u: .0025, z: -.064 }); S.scene.add(C.g);
  const fr = front(S, '#060302');
  return { S, update(t) {
    const k = eio(seg(t, E.T0 - .6, E.T0 + E.dur)), cx = lerp(.05, -.04, k), cz = .5, cy = camY(cz);
    aim(S.cam, [cx, cy, cz, cx, cy, -.08], t, { hand: .0004 });
    fr.follow();
    const sb = spring(seg(t, H.catorce - .35, H.catorce + 1.2) * 1.55, 5, .5), sc = spring(seg(t, H.seis - .35, H.seis + 1.2) * 1.55, 5, .5);
    rowA.position.set(bob(t, 1.3, .001), -.05, -.08);
    rowB.position.set(lerp(.45, .012, t < H.catorce - .35 ? 0 : sb), -.047, -.09);
    camA.forEach((c, i) => c.set({ x: -.16 + i * .065 - (t - E.T0) * .006, y: -.044, walk: t * 3 + i, stride: .2, dir: -1 }));
    camB.forEach((c, i) => c.set({ x: lerp(.45, 0, t < H.seis - .35 ? 0 : sc) - .1 + i * .065 - (t - E.T0) * .006, y: -.041, walk: t * 3 + i + .5, stride: .2, dir: -1 }));
    const cxl = cx + .004 - (t - E.T0) * .002;
    C.set({ x: cxl, y: -.053 + Math.abs(bob(t, 8, .0012)), walk: t * 8, stride: .3, aL: 2.1 + bob(t, 8, .2), aR: 2.1 - bob(t, 8, .2), look: -.6, blink: blink(t, 2.7), k: 1 });
    this._f = fsOf(S, -.07);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 6, bloom: blo(.36, 1.12) }; }, grade() { return { vig: .32, sat: 1.04 }; } };
}

// S11 140 years: old Job sits at the door of the rebuilt house, window lit; the sun crosses the sky and rises again, several times. Clawd beside him.
export function S11(E) {
  const S = stage({ light: [0, .02, -.1], lightR: .3, lightCol: '#ffd89a', key: 1.5, keyCol: '#ffe6c4', amb: .38, ambCol: '#c8a07a', floor: .5 });
  const sky = skyPanel({ w: 1, h: 1, z: -.16, stops: [[0, '#4a6290'], [.35, '#e0c08e'], [.7, '#ffd88e'], [1, '#ffe8b8']] }); S.add(sky);
  const sun = moon({ r: .012, x: 0, y: .02, z: -.152, gain: 2.2, core: '#fffbea', mid: '#fff0c0', edge: '#ffd27a', halo: 8, haloGain: .55 }); S.scene.add(sun);
  land(S, { z: -.14, col: '#dcae74', base: -.024, amp: .02, len: .28, ph: 1.2, trans: .7, ppm: 1400 });
  land(S, { z: -.12, col: '#a8743e', base: -.04, amp: .01, len: .22, ph: 2.6, trans: .35 });
  const hs = house(S.U, { w: .085, h: .058, z: -.095, col: '#9a6a3c', trans: .35, win: [.3, .58], door: -.16, glow: 2.6 }); hs.position.set(.018, -.05, -.095); S.add(hs);
  const J = human(S.U, { h: .082, z: -.082, col: '#1a0e06', pose: 'sit', rim: .8 }); S.scene.add(J.g);
  land(S, { z: -.065, col: '#2a180c', base: -.0555, amp: .002, len: .1, ph: 1.5, trans: .05 });
  const C = clawd(S.U, { u: .0023, z: -.06, glow: .4 }); S.scene.add(C.g);
  const fr = front(S, '#070403');
  return { S, update(t) {
    const tl = t - E.T0, q = ss(seg(t, E.T0 + 1.2, E.T0 + E.dur)), cz = lerp(.46, .53, q), cy = camY(cz);
    aim(S.cam, [0, cy, cz, 0, cy, -.08], t, { hand: .0003 });
    fr.follow();
    const ph = (tl / .9) % 1, arc = Math.sin(ph * Math.PI);
    sun.position.set(lerp(-.07, .07, ph), -.03 + arc * .09, -.152); setMoon(sun, .3 + .9 * arc);
    sky.material.color.setScalar(.7 + .35 * arc);
    setL(S, sun.position.x, sun.position.y, .3, .7 + .4 * arc);
    J.set({ x: -.004, y: -.05, a: .5, rot: .05 }); C.set({ x: -.046, y: -.05, look: .9, blink: blink(t, 3.2), tuck: .35, k: .9 });
    this._f = fsOf(S, -.08);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 6, bloom: blo(.36, 1.12) }; }, grade() { return { vig: .32 }; } };
}

// S12 the golden fold: same framing as S1 and S4, full: two rows of sheep, sunrise. Dolly in to Clawd; on the question he turns to us and lifts an arm.
export function S12(E) {
  const { H } = E;
  const S = stage({ light: [.05, -.01, -.1], lightR: .3, lightCol: '#ffd89a', key: 1.6, keyCol: '#ffe6c4', amb: .38, ambCol: '#c8a07a', floor: .5 });
  const F = fold(S, GOLD, { rows: 2 });
  F.farHouse.visible = false;
  const J = human(S.U, { h: .085, z: -.071, col: '#1a0e06', rim: .85 }); S.scene.add(J.g);
  const C = clawd(S.U, { u: .0028, z: -.058 }); S.scene.add(C.g);
  return { S, update(t) {
    const k = eio(seg(t, E.T0 + .5, E.T0 + E.dur - .8)), cz = lerp(.52, .42, k), cx = lerp(0, -.012, k), cy = lerp(camY(.52), camY(.42, -.022, -.058, .36), k);
    aim(S.cam, [cx, cy, cz, cx, cy, -.08], t, { hand: .0004 });
    F.fr.follow(lerp(.26, .3, k));
    F.gate.rotation.y = -.25;
    F.rows.forEach((r, i) => { r.position.x = -.01 + i * .02 + bob(t, .9 + i * .3, .0012, i); });
    const q = H.cta, turn = ss(seg(t, q - .2, q + .35)), raise = ss(seg(t, q + .1, q + .6));
    const wave = t > q + .2 ? Math.sin((t - q - .2) * 7) * .4 * (1 - ss(seg(t, q + 2.2, q + 2.8))) : 0;
    C.set({ x: -.034, y: -.022 + Math.abs(bob(t, 4.5, .0004)), look: lerp(-.5, 0, turn), blink: blink(t, 3.0), aR: raise * 2.1 + wave * raise, aL: 0, tuck: .25, k: 1.05 });
    J.set({ x: .036, y: -.05, a: .4 + bob(t, .9, .05) }); face(J, -1);
    setL(S, .05, -.01, .3, 1.1);
    this._f = fsOf(S, -.058);
  }, post() { return { focus: this._f, aper: 8, maxCoc: 6, bloom: blo(.36, 1.12) }; }, grade() { return { vig: .32 }; } };
}
