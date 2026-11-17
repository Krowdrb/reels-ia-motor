// The eleven shots of «Dos fuegos» (Pedro y Judas). Each: { S, update(t), post(), grade() }; t in film seconds.
// God is only ever light. Judas: only the coins on the temple floor and a silhouette that leaves through a door. Clawd is the only orange.
import * as THREE from 'three';
import { skyPanel, moon, setMoon, text, burst } from './paper.js';
import { stage, aim } from './stage.js';
import { mulberry, seg, ss, eio, lerp, clamp, TAU } from './lib.js';
import { mk, cut, tint, clawd, human, waveFill, brasero, brasas, gallo, moneda, barca } from './actors.js';

const blo = (s = .32, th = 1.1) => ({ strength: s, radius: .6, threshold: th });
const lay = (S, o) => S.add(mk(S.U, o));
const col3 = c => new THREE.Color(c);
const setL = (S, x, y, r, lit, c) => { S.U.uLight.value.x = x; S.U.uLight.value.y = y; S.U.uLightR.value = r; S.U.uLit.value = lit; if (c) S.U.uLightCol.value.copy(c); };
const bob = (t, f, a, p = 0) => Math.sin(t * f + p) * a;
const mixc = (a, b, k) => '#' + col3(a).lerp(col3(b), clamp(k)).getHexString();
const fsOf = (S, z) => S.cam.position.z - z;
const env = (t, a, b, fi = .15, fo = .4) => Math.min(ss(seg(t, a, a + fi)), 1 - ss(seg(t, b - fo, b)));
const blink = (t, per = 3.3, ph = 0) => 1 - .9 * Math.max(0, 1 - Math.abs(((t + ph) % per) - .1) / .1);
export const GROUND = -.05;
// half of the visible height at depth z, and a camera height that puts the ground line (yg at depth zf) at fraction f from the bottom
export const HH = (cz, z) => .4617 * (cz - z) / 2;
export const camY = (cz, yg = GROUND, zf = -.075, f = .36) => yg + (1 - 2 * f) * HH(cz, zf);

// A strip of land drawn in world coordinates (top = base..base+amp)
function land(S, { z, col, base, amp = .004, len = .12, ph = 0, trans = .1, w = .9, rim = .5, peak = 1.3, x = 0, ppm = 1800, shadow = true, extra }) {
  return lay(S, { w, h: .6, x, y: -.2, z, col, trans, ppm, shadow, finish: { rim, rimPx: 3 }, draw: c => { c.translate(-x, .2); waveFill(c, { x0: x - w / 2, x1: x + w / 2, base, amp, len, ph, peak }); if (extra) extra(c); } });
}
// The dark front band: follows the camera so the bottom quarter stays dark for the subtitles
function front(S, col, o = {}) {
  const z = o.z ?? -.03, m = land(S, { z, col, base: -.006, amp: .004, len: .14, ph: o.ph ?? 2, trans: .02, rim: o.rim ?? .25, w: 1.2, shadow: false });
  return { m, follow(f = .25) { const c = S.cam.position; m.position.x = c.x; m.position.y = -.2 + c.y - HH(c.z, z) * (1 - 2 * f); } };
}
const stoneSeat = (S, x, z, col) => lay(S, { w: .042, h: .014, x, y: GROUND + .002, z, col, trans: .05, finish: { rim: .55, rimPx: 3 }, draw: c => { c.beginPath(); c.ellipse(0, 0, .018, .0065, 0, 0, TAU); c.fill(); } });

// Title strip: paper, lit, letters cut out; anchored to the camera (top fifth); grows from its left edge
function titleStrip(S) {
  const m = lay(S, { w: .136, h: .05, z: -.01, col: '#ecd9b0', trans: .35, shadow: false, recv: false, finish: { rim: .3, under: .2 }, draw: x => {
    x.beginPath(); x.roundRect(-.066, -.022, .132, .044, .002); x.fill();
    cut(x, () => { text(x, 'DOS DISCÍPULOS', 0, .0052, .0118, 'Cinzel', { weight: 800, fill: '#000' }); text(x, 'Mateo 26–27 · Lucas 22 · Juan 21', 0, -.0115, .0072, 'Playfair', { weight: 'italic 500', fill: '#000' }); });
  }, glowDraw: x => { x.fillStyle = '#fff'; x.fillRect(-.068, -.024, .136, .048); }, glow: .5, glowCol: '#ecd9b0', glowRes: .2 });
  return { m, update(t, t0, t1, t2) {
    const reveal = ss(seg(t, t0, t1)) * (1 - ss(seg(t, t2 - .45, t2)));
    const c = S.cam.position, cz = c.z + .01, ts = .78 * cz / .5;
    m.scale.setScalar(ts); m.position.x = c.x; m.position.y = c.y + HH(c.z, -.01) * .64;
    m.material.userData.u.uClip.value.set(m.position.x - .072 * ts, m.position.y, .16 * reveal * ts, 0); m.visible = reveal > .002;
  } };
}

// —— the high priest's courtyard at midnight: plum sky, full moon, a gallery of arches (one lit), the tall side wall, the brazier, two servants ——
export const PN = { sky: [[0, '#0b0813'], [.55, '#1b1426'], [1, '#2e2238']], wall: '#4a3a52', gal: '#3e3046', inner: '#0e0a12', floor: '#140e18', front: '#07050a', fig: '#0a070d', stone: '#1a1420' };
export const MOON = [.05, .118];
export const ARCH = { xs: [-.088, -.051, -.014, .023], lit: .023, w: .024, y0: GROUND - .012, ys: .006, z: -.135 };
export function patio(S, o = {}) {
  const sky = skyPanel({ w: 1.4, h: 1.2, y: .15, z: -.18, stops: PN.sky, stars: 70, starMinY: .02, seed: 4 }); S.add(sky);
  const mo = moon({ r: .012, x: MOON[0], y: MOON[1], z: -.17, gain: 2.1, core: '#fffaf0', mid: '#f3e6c8', edge: '#e6d2a6', halo: 6, haloGain: .38 }); S.scene.add(mo);
  lay(S, { w: .5, h: .1, x: -.08, y: -.015, z: -.142, col: PN.inner, trans: .05, shadow: false, finish: { rim: 0, under: 0 }, draw: c => c.fillRect(-.25, -.05, .5, .1) });
  const litArch = lay(S, { w: .032, h: .08, x: ARCH.lit, y: -.02, z: -.139, col: '#7a5a48', trans: .3, shadow: false, recv: false, finish: { rim: 0, under: 0 }, draw: c => c.fillRect(-.016, -.04, .032, .08),
    glowDraw: c => { const g = c.createRadialGradient(0, -.01, 0, 0, -.01, .04); g.addColorStop(0, '#fff'); g.addColorStop(1, 'rgba(255,255,255,.25)'); c.fillStyle = g; c.fillRect(-.016, -.04, .032, .08); }, glow: 1.3, glowCol: '#ffd38a' });
  const gal = lay(S, { w: .5, h: .14, x: -.07, y: -.02, z: ARCH.z, col: PN.wall, trans: .4, ppm: 3000, finish: { rim: .5, rimPx: 3 }, draw: c => {
    c.translate(.07, .02);
    c.fillRect(-.32, -.09, .5, .123); for (let px = -.32; px < .18; px += .012) c.fillRect(px, .033, .007, .005);   // parapet
    cut(c, () => { for (const ax of ARCH.xs) { c.fillRect(ax - ARCH.w / 2, ARCH.y0, ARCH.w, ARCH.ys - ARCH.y0); c.beginPath(); c.arc(ax, ARCH.ys, ARCH.w / 2, 0, Math.PI); c.fill(); } });
  } });
  const wall = lay(S, { w: .4, h: .24, x: .25, y: -.03, z: -.115, col: PN.gal, trans: .3, ppm: 2600, finish: { rim: .6, rimPx: 3 }, draw: c => {
    c.translate(-.25, .03); c.fillRect(.052, -.15, .4, .238); c.fillRect(.048, .086, .4, .004);   // coping
    cut(c, () => { for (let py = -.09; py < .08; py += .011) c.fillRect(.052, py, .4, .0006); });
  } });
  const floor = land(S, { z: -.1, col: PN.floor, base: GROUND + .003, amp: .0015, len: .2, ph: 1, trans: .06 });
  const sv = [[-.022, false], [.03, true]].map(([x, flip]) => { const f = human(S.U, { h: .056, z: -.093, pose: 'sit', col: '#120c16', rim: .55 }); S.scene.add(f.g); f.set({ x, y: GROUND, a: 1.0, flip }); return f; });
  const B = brasero(S.U, { w: .026, z: -.08, col: '#241a20' }); B.g.position.set(.003, GROUND, -.08); S.scene.add(B.g);
  const fr = front(S, PN.front);
  return { sky, mo, gal, litArch, wall, floor, sv, B, fr };
}

// S1 the courtyard fire at midnight: Clawd on his stone at the left, Pedro hooded at the right, hands to the flame. Title strip.
export function S1(E) {
  const { H } = E;
  const S = stage({ light: [.003, -.03, -.1], lightR: .12, lightCol: '#ffd8a0', key: .55, keyCol: '#ffd9b0', amb: .2, ambCol: '#8a78a8', floor: .3 });
  const P = patio(S);
  const Pe = human(S.U, { h: .074, z: -.072, pose: 'sit', veil: true, col: PN.fig, rim: .8 }); S.scene.add(Pe.g);
  stoneSeat(S, -.034, -.0645, PN.stone);
  const C = clawd(S.U, { u: .003, z: -.062 }); S.scene.add(C.g);
  const T = titleStrip(S);
  return { S, update(t) {
    const k = eio(seg(t, 0, E.dur + .6)), cz = lerp(.52, .46, k), cy = camY(cz), cx = lerp(.006, .0, k);
    aim(S.cam, [cx, cy, cz, cx, cy, -.08], t);
    P.fr.follow();
    const sw = ss(seg(t, H.noche - .2, H.noche + .45)) * (1 - .45 * ss(seg(t, H.volvio, H.volvio + .7)));
    P.B.set(t, .85 + .3 * sw);
    setL(S, .01, GROUND + .03 + .03 * sw, .12 + .05 * sw, 1.1 + .55 * sw);
    S.key.intensity = .55 + .25 * sw;
    Pe.set({ x: .043, y: GROUND, a: 1.15 + bob(t, .9, .04), flip: true });
    const judas = ss(seg(t, H.l01 + .5, H.l01 + .8)) * (1 - ss(seg(t, H.l02 - .2, H.l02 + .3)));
    const toFire = ss(seg(t, H.fuego - .3, H.fuego + .2));
    C.set({ x: -.034, y: GROUND + .007, aL: .7 * (1 - .65 * judas), aR: .7 * (1 - .65 * judas), look: lerp(.85, .45, toFire), lookY: lerp(0, -.7, toFire), blink: blink(t), k: 1.1 });
    T.update(t, .15, 1.1, E.T0 + E.dur + .1);
    this._f = fsOf(S, -.068);
  }, post() { return { focus: this._f, aper: 8, maxCoc: 6, bloom: blo(.36, 1.0) }; }, grade() { return { vig: .5, sat: 1.02 }; } };
}

// —— the garden of olives under the same moon ——
function olives(S, { z, col, n, y0, s0, seed, trans, w = .7, gap = 0 }) {
  return lay(S, { w, h: .26, y: y0 + .06, z, col, trans, ppm: 2200, finish: { rim: .5, rimPx: 3 }, draw: c => {
    c.translate(0, -y0 - .06); const R = mulberry(seed);
    c.fillRect(-w / 2, y0 - .07, w, .07);
    for (let i = 0; i < n; i++) {
      const cx = -w / 2 + (i + .5) * w / n + (R() - .5) * .02, s = s0 * (.8 + R() * .4); if (Math.abs(cx) < gap) { R(); continue; }
      c.beginPath(); c.moveTo(cx - s * .12, y0); c.quadraticCurveTo(cx - s * .02, y0 + s * .5, cx - s * .14, y0 + s); c.lineTo(cx + s * .06, y0 + s); c.quadraticCurveTo(cx + s * .16, y0 + s * .45, cx + s * .1, y0); c.closePath(); c.fill();
      for (let j = 0; j < 9; j++) { c.beginPath(); c.ellipse(cx + (R() - .5) * s * 1.3, y0 + s * (1.05 + R() * .45), s * (.22 + R() * .16), s * (.14 + R() * .08), (R() - .5) * .6, 0, TAU); c.fill(); }
    }
  } });
}
// S2 the same moon: the camera tilts down from the moon and travels left into the garden; Judas comes to Jesus and kisses him. Clawd half hidden behind a trunk.
export function S2(E) {
  const { H } = E;
  const S = stage({ light: [.03, .07, -.1], lightR: .2, lightCol: '#e8dcc8', key: .75, keyCol: '#d8d0e0', amb: .22, ambCol: '#8a78a8', floor: .26 });
  S.add(skyPanel({ w: 1.4, h: 1.2, y: .15, z: -.18, stops: PN.sky, stars: 70, starMinY: .02, seed: 4 }));
  S.scene.add(moon({ r: .012, x: MOON[0], y: MOON[1], z: -.17, gain: 2.1, core: '#fffaf0', mid: '#f3e6c8', edge: '#e6d2a6', halo: 6, haloGain: .38 }));
  olives(S, { z: -.145, col: '#5e5266', n: 9, y0: -.032, s0: .026, seed: 3, trans: .85 });
  lay(S, { w: .08, h: .06, x: -.07, y: -.022, z: -.125, col: '#16121a', trans: .1, ppm: 5000, finish: { rim: .45, rimPx: 3 }, draw: c => {
    c.translate(.07, .022);
    for (const px of [-.1, -.088, -.077, -.064, -.052]) { c.save(); c.translate(px, -.045); c.scale(.03, .03); c.beginPath(); c.moveTo(-.18, 0); c.bezierCurveTo(-.2, .3, -.16, .55, -.12, .7); c.lineTo(.08, .75); c.bezierCurveTo(.15, .45, .2, .2, .2, 0); c.closePath(); c.fill(); c.beginPath(); c.arc(0, .87, .1, 0, TAU); c.fill(); c.restore(); c.fillRect(px + .003, -.045, .0006, .045); }
  }, glowDraw: c => { c.translate(.07, .022); c.fillStyle = '#fff'; for (const px of [-.094, -.07, -.048]) { c.beginPath(); c.ellipse(px, -.012, .0013, .0024, 0, 0, TAU); c.fill(); } }, glow: 2.4, glowCol: '#ffd38a' });
  olives(S, { z: -.11, col: '#2c2632', n: 6, y0: -.044, s0: .042, seed: 8, trans: .25, gap: .045 });
  land(S, { z: -.095, col: '#120e14', base: GROUND + .002, amp: .002, len: .2, ph: 2, trans: .06 });
  const Je = human(S.U, { h: .072, z: -.078, col: '#0d0a10', rim: .75 }); S.scene.add(Je.g);
  const Ju = human(S.U, { h: .071, z: -.077, col: '#0b080d', rim: .6, bolsa: true }); S.scene.add(Ju.g);
  const glint = moneda(S.U, { r: .0011, z: -.0765, glow: 0 }); S.add(glint);
  lay(S, { w: .06, h: .3, x: -.05, y: .05, z: -.052, col: '#0a080c', trans: .03, ppm: 2400, finish: { rim: .45, rimPx: 3 }, draw: c => {
    c.translate(.05, -.05); c.beginPath(); c.moveTo(-.068, GROUND - .03); c.quadraticCurveTo(-.05, .0, -.064, .06); c.quadraticCurveTo(-.06, .14, -.04, .2); c.lineTo(-.03, .2); c.quadraticCurveTo(-.046, .12, -.046, .06); c.quadraticCurveTo(-.034, .0, -.044, GROUND - .03); c.closePath(); c.fill();
    const R = mulberry(12); for (let j = 0; j < 14; j++) { c.beginPath(); c.ellipse(-.05 + (R() - .5) * .07, .155 + R() * .05, .012 + R() * .01, .006 + R() * .005, (R() - .5), 0, TAU); c.fill(); }
  } });
  const C = clawd(S.U, { u: .0029, z: -.056 }); S.scene.add(C.g);
  const fr = front(S, '#060408');
  return { S, update(t) {
    const m = eio(seg(t, E.T0, H.beso - .25)), cz = .5, cyE = camY(cz, GROUND, -.078, .34);
    const cx = lerp(.045, -.004, m), cy = lerp(.1, cyE, eio(seg(t, E.T0, E.T0 + 1.3)));
    aim(S.cam, [cx, cy, cz, cx, cy, -.08], t, { hand: .0004 });
    fr.follow();
    const wk = seg(t, E.T0 + .4, H.beso - .15), jx = lerp(-.06, -.007, eio(wk)), walking = wk > 0 && wk < 1;
    const lean = ss(seg(t, H.beso - .3, H.beso + .1));
    Ju.set({ x: jx, y: GROUND + (walking ? Math.abs(Math.sin(t * 6)) * .0008 : 0), a: walking ? Math.sin(t * 6) * .25 : .15, rot: -.17 * lean + (walking ? Math.sin(t * 6) * .015 : 0) });
    Je.set({ x: .018, y: GROUND, a: .08, flip: true });
    const [gx, gy] = Ju.at(.215, .41); glint.position.set(gx, gy, -.0765);
    const gl = env(t, H.monedas - .05, H.monedas + .9, .1, .5); glint.material.emissiveIntensity = 2.6 * gl; glint.visible = gl > .01;
    C.set({ x: -.044, y: GROUND, look: .6, blink: blink(t, 3.1, .4), k: .9 });
    setL(S, .005, -.005, .12, 1.6);
    this._f = fsOf(S, -.078);
  }, post() { return { focus: this._f, aper: 8, maxCoc: 6, bloom: blo(.32, 1.05) }; }, grade() { return { vig: .5, sat: .95 }; } };
}

// S3 the servant girl and the three denials + silence 1: back down from the moon to the fire; three blows of light, the flame bows each time.
export function S3(E) {
  const { H } = E;
  const S = stage({ light: [.003, -.03, -.1], lightR: .12, lightCol: '#ffd8a0', key: .6, keyCol: '#ffd9b0', amb: .2, ambCol: '#8a78a8', floor: .3 });
  const P = patio(S);
  const Pe = human(S.U, { h: .074, z: -.072, pose: 'sit', veil: true, col: PN.fig, rim: .8 }); S.scene.add(Pe.g);
  const Ps = human(S.U, { h: .074, z: -.072, pose: 'stand', veil: true, col: PN.fig, rim: .8 }); S.scene.add(Ps.g);
  const Cr = human(S.U, { h: .068, z: -.084, pose: 'stand', veil: true, col: '#100b12', rim: .7 }); S.scene.add(Cr.g);
  stoneSeat(S, -.034, -.0645, PN.stone);
  const C = clawd(S.U, { u: .003, z: -.062 }); S.scene.add(C.g);
  const nos = [H.no1, H.no2, H.no3];
  return { S, update(t) {
    const d = eio(seg(t, E.T0, E.T0 + 1.1));
    const dz = eio(seg(t, E.T0 + 1.1, H.sil1 + .1)), cz = .47 - .04 * dz, cxE = .01 * dz;
    const cx = lerp(.045, cxE, d), cy = lerp(.1, camY(cz), d);
    aim(S.cam, [cx, cy, cz, cx, cy, -.08], t, { hand: t > H.sil1 ? .0001 : .0005 });
    P.fr.follow();
    const blows = nos.map(n => env(t, n, n + .55, .06, .4)), squash = Math.max(...blows), back = nos.reduce((a, n) => a + ss(seg(t, n, n + .2)), 0);
    const quiet = ss(seg(t, H.sil1 - .1, H.sil1 + .5));
    P.B.set(t < H.sil1 + .5 ? t : H.sil1 + .5 + (t - H.sil1 - .5) * .15, lerp(.95 - .12 * back, .32, quiet), squash);
    setL(S, .01, GROUND + .03, .13 - .015 * back - .03 * quiet, (1.2 - .5 * squash - .12 * back) * lerp(1, .5, quiet));
    S.key.intensity = lerp(.6, .3, quiet);
    // the girl walks in from the right, points at Pedro, then withdraws
    const inK = eio(seg(t, E.T0 + .3, H.criada + .4)), outK = eio(seg(t, H.no2, H.no3 + .3));
    const cxr = lerp(.12, .072, inK) + .06 * outK, walk = (inK > 0 && inK < 1) || (outK > 0 && outK < 1);
    const point = ss(seg(t, H.tu - .1, H.tu + .3)) * (1 - ss(seg(t, H.no1 + .4, H.no2)));
    Cr.set({ x: cxr, y: GROUND + (walk ? Math.abs(Math.sin(t * 6)) * .0007 : 0), a: walk ? Math.sin(t * 6) * .25 : 1.35 * point, flip: outK < .15 });
    const up = t >= H.tres;
    Pe.g.visible = !up; Ps.g.visible = up;
    Pe.set({ x: .043 + .004 * back, y: GROUND, a: lerp(1.15, .3, ss(seg(t, H.tu, H.tu + .4))), rot: .06 * back, flip: true });
    Ps.set({ x: .054, y: GROUND, a: .1, rot: -.06, flip: false });
    const down = ss(seg(t, H.tu - .1, H.tu + .35));
    C.set({ x: -.034, y: GROUND + .007, aL: .7 * (1 - down), aR: .7 * (1 - down), look: .8, lookY: -.2, tuck: .12 * Math.min(back, 2.5), blink: t > H.sil1 ? 1 : blink(t, 3.4, .2), k: lerp(1.05, .8, quiet) });
    this._f = fsOf(S, -.07);
  }, post() { return { focus: this._f, aper: 8, maxCoc: 6, bloom: blo(.34, 1.0) }; }, grade() { return { vig: .55 }; } };
}

// S4 the rooster and the look: the rooster lifts its head on the wall against the moon; then down to the gallery: Jesus, in the lit arch, turns toward the courtyard.
export function S4(E) {
  const { H } = E;
  const S = stage({ light: [.04, .1, -.1], lightR: .1, lightCol: '#efe2c8', key: .5, keyCol: '#d8d0e0', amb: .16, ambCol: '#8a78a8', floor: .16 });
  const P = patio(S);
  const G = gallo(S.U, { h: .022, z: -.1145 }); S.scene.add(G.g);
  const Je = human(S.U, { h: .05, z: -.137, col: '#120c12', rim: .9 }); S.scene.add(Je.g);
  P.sv.forEach(f => { f.g.visible = false; });
  [ARCH.lit - .028, ARCH.lit + .028].forEach((x, i) => { const f = human(S.U, { h: .045, z: -.1375, col: '#0e0a10', rim: .5 }); S.scene.add(f.g); f.set({ x, y: GROUND + .002, a: .05, flip: i === 1 }); });
  const Pe = human(S.U, { h: .074, z: -.07, pose: 'stand', veil: true, col: PN.fig, rim: .8 }); S.scene.add(Pe.g);
  const C = clawd(S.U, { u: .0028, z: -.062 }); S.scene.add(C.g);
  const swing = H.l08 - .45;
  return { S, update(t) {
    const m = eio(seg(t, swing, swing + .8));
    const cz = lerp(.24, .5, m), cx = lerp(.064, -.004, m), cy = lerp(.098, camY(.5), m);
    aim(S.cam, [cx, cy, cz, cx, cy, -.08], t, { hand: .0003 });
    P.fr.follow();
    const lift = ss(seg(t, H.gallo - .15, H.gallo + .25)) * (1 - ss(seg(t, H.gallo + 1.1, H.gallo + 1.5)));
    G.set({ x: .07, y: .09, lift });
    P.B.set(t, .32); setL(S, lerp(.05, ARCH.lit, m), lerp(.11, -.02, m), lerp(.12, .07, m), lerp(.9, 1.05, m), col3('#efe2c8').lerp(col3('#ffd38a'), m));
    const tr = ss(seg(t, H.se_volvio, H.se_volvio + 1.0));
    Je.set({ x: ARCH.lit, y: GROUND + .002, turn: lerp(-1, 1, tr), a: .05 });
    P.litArch.material.emissiveIntensity = 1.3 + .5 * ss(seg(t, H.miro - .2, H.miro + .5));
    Pe.set({ x: .066, y: GROUND, rot: -.08, a: .15 });
    C.set({ x: -.044, y: GROUND, aL: 0, aR: 0, look: .7, lookY: -.6, blink: 1, k: .85 });
    const rf = ss(seg(t, H.se_volvio - .35, H.se_volvio + .45));
    this._f = lerp(fsOf(S, -.115), lerp(fsOf(S, -.07), fsOf(S, -.137), rf), m);
  }, post() { return { focus: this._f, aper: 9, maxCoc: 8, bloom: blo(.34, 1.0) }; }, grade() { return { vig: .55 }; } };
}

// S5 Pedro weeps outside the gate, by the wall in the moonlight; the fire still glows through the gate. Clawd small at the jamb.
export function S5(E) {
  const { H } = E;
  const S = stage({ light: [.04, .06, -.1], lightR: .14, lightCol: '#e6dcc8', key: .55, keyCol: '#d8d0e0', amb: .16, ambCol: '#8a78a8', floor: .2 });
  S.add(skyPanel({ w: 1.4, h: 1.2, y: .15, z: -.18, stops: PN.sky, stars: 80, starMinY: .0, seed: 9 }));
  S.scene.add(moon({ r: .011, x: .045, y: .085, z: -.17, gain: 2.0, core: '#fffaf0', mid: '#f3e6c8', edge: '#e6d2a6', halo: 6, haloGain: .36 }));
  const GX = -.016, GW = .03, GT = .012;
  const glow = lay(S, { w: .05, h: .08, x: GX, y: -.02, z: -.112, col: '#6a4a3c', trans: .3, shadow: false, recv: false, finish: { rim: 0, under: 0 }, draw: c => c.fillRect(-.025, -.04, .05, .08),
    glowDraw: c => { const g = c.createRadialGradient(0, -.035, 0, 0, -.035, .06); g.addColorStop(0, '#fff'); g.addColorStop(1, 'rgba(255,255,255,.1)'); c.fillStyle = g; c.fillRect(-.025, -.04, .05, .08); }, glow: 1.5, glowCol: '#ffd38a' });
  lay(S, { w: .7, h: .2, y: -.04, z: -.1, col: '#54445c', trans: .45, ppm: 2200, finish: { rim: .6, rimPx: 3 }, draw: c => {
    c.translate(0, .04); c.fillRect(-.35, -.1, .7, .14); c.fillRect(-.35, .04, .7, .004);
    cut(c, () => { c.fillRect(GX - GW / 2, GROUND - .02, GW, GT - GROUND + .02); c.beginPath(); c.arc(GX, GT, GW / 2, 0, Math.PI); c.fill(); });
    c.fillRect(GX + GW / 2 - GW * .42, GROUND - .02, GW * .42, GT - GROUND + .02 + GW * .3);   // one leaf half shut
  } });
  land(S, { z: -.09, col: '#120e14', base: GROUND + .002, amp: .002, len: .2, ph: 2, trans: .06 });
  const Ps = human(S.U, { h: .072, z: -.074, pose: 'stand', veil: true, col: PN.fig, rim: .8 }); S.scene.add(Ps.g);
  const Pk = human(S.U, { h: .072, z: -.074, pose: 'kneel', veil: true, col: PN.fig, rim: .8 }); S.scene.add(Pk.g);
  const C = clawd(S.U, { u: .0022, z: -.08 }); S.scene.add(C.g);
  const fr = front(S, '#060408');
  const kn = H.lloro - .25;
  return { S, update(t) {
    const k = eio(seg(t, E.T0, E.T0 + E.dur + .4)), cz = lerp(.41, .5, k), cx = lerp(.012, .006, k), cy = camY(cz, GROUND, -.074, .37);
    aim(S.cam, [cx, cy, cz, cx, cy, -.08], t, { hand: .0003 });
    fr.follow();
    const sink = ss(seg(t, kn - .35, kn)), down = t >= kn;
    Ps.g.visible = !down; Pk.g.visible = down;
    Ps.set({ x: .032, y: GROUND - .004 * sink, rot: -.12 - .2 * sink, a: lerp(.6, 2.55, ss(seg(t, E.T0, E.T0 + .6))) });
    Pk.set({ x: .034, y: GROUND, rot: -.18 + .03 * Math.sin(t * 2.1) * ss(seg(t, kn, kn + .4)), a: 2.6 });
    glow.material.emissiveIntensity = 1.5 + .12 * Math.sin(t * 7.3) * Math.sin(t * 3.1);
    C.set({ x: -.042, y: GROUND, look: .7, lookY: -.3, blink: 1, k: .8 });
    setL(S, .036, -.02, .1, 1.3);
    this._f = fsOf(S, -.074);
  }, post() { return { focus: this._f, aper: 8, maxCoc: 6, bloom: blo(.3, 1.05) }; }, grade() { return { vig: .55, sat: .95 }; } };
}

// —— the temple in the grey morning ——
const TG = { bg: [[0, '#4a5466'], [1, '#384050']], far: '#5a6272', mid: '#262c36', floor: '#14171c', front: '#08090c' };
const columns = (S, { z, col, w, gap, x0, x1, top, trans }) => lay(S, { w: x1 - x0 + w * 2, h: .4, x: (x0 + x1) / 2, y: top - .2, z, col, trans, ppm: 2000, finish: { rim: .45, rimPx: 3 }, draw: c => {
  c.translate(-(x0 + x1) / 2, .2 - top);
  for (let px = x0; px <= x1 + 1e-6; px += gap) { c.fillRect(px - w / 2, top - .4, w, .4); c.fillRect(px - w * .75, top - .006, w * 1.5, .006); c.fillRect(px - w * .75, GROUND - .002, w * 1.5, .006); }
  c.fillRect(x0 - w, top - .002, x1 - x0 + w * 2, .012);
  cut(c, () => { for (let px = x0; px <= x1 + 1e-6; px += gap) for (const f of [-.25, 0, .25]) c.fillRect(px + f * w - w * .04, GROUND + .006, w * .08, top - GROUND - .016); });
} });
// S6 the coins on the temple floor: grey morning, floor level; silver coins fall from above, roll and lie still. Clawd by a column at the right, looking at the door.
export function S6(E) {
  const { H } = E;
  const S = stage({ light: [-.02, .05, -.1], lightR: .16, lightCol: '#c8d2e4', key: .8, keyCol: '#d0d8e8', amb: .3, ambCol: '#8a96ac', floor: .35 });
  S.add(skyPanel({ w: 1.2, h: 1, z: -.17, stops: TG.bg, gain: .85 }));
  columns(S, { z: -.145, col: TG.far, w: .012, gap: .036, x0: -.2, x1: .2, top: .07, trans: .4 });
  columns(S, { z: -.11, col: TG.mid, w: .02, gap: .07, x0: -.1, x1: .18, top: .12, trans: .15 });
  land(S, { z: -.08, col: '#2a303a', base: GROUND + .001, amp: .0006, len: .2, trans: .1, rim: .6 });
  const R = mulberry(31);
  const coins = [...Array(9)].map((_, i) => ({ m: moneda(S.U, { r: .0028, z: -.07 + i * .0002 }), at: H.devolvio - .45 + i * .07 + R() * .04, x0: -.034 + R() * .05, v: (R() - .4) * .05, h: .1 + R() * .02 }));
  coins.forEach(c => S.add(c.m));
  const C = clawd(S.U, { u: .0022, z: -.09 }); S.scene.add(C.g);
  const fr = front(S, TG.front);
  const g = 3.2, r = .0028;
  return { S, update(t) {
    const k = eio(seg(t, E.T0, E.T0 + E.dur + .3)), cz = .4, cx = lerp(-.004, -.014, k), cy = camY(cz, GROUND, -.07, .4);
    aim(S.cam, [cx, cy, cz, cx, cy, -.08], t, { hand: .0002 });
    fr.follow(.24);
    for (const c of coins) {
      const tf = t - c.at, tFall = Math.sqrt(2 * c.h / g);
      let x = c.x0, y = GROUND + r + c.h, rot = 0;
      if (tf > 0 && tf < tFall) y = GROUND + r + c.h - .5 * g * tf * tf;
      else if (tf >= tFall) {
        const tb = tf - tFall, bounce = tb < .16 ? Math.sin(tb / .16 * Math.PI) * .004 : 0;
        const kk = 3.2, dx = c.v / kk * (1 - Math.exp(-kk * tb)); x = c.x0 + dx; y = GROUND + r + bounce; rot = -dx / r;
      }
      c.m.position.set(x, y, c.m.position.z); c.m.rotation.z = rot; c.m.visible = tf > -.02;
      c.m.material.emissiveIntensity = tf > 0 ? .9 : 0;
    }
    C.set({ x: .03, y: GROUND, look: -.85, lookY: 0, blink: blink(t, 3.6), k: .7 });
    setL(S, -.03, .07, .22, 1);
    this._f = fsOf(S, -.075);
  }, post() { return { focus: this._f, aper: 9, maxCoc: 7, bloom: blo(.25, 1.15) }; }, grade() { return { vig: .45, sat: .85, lift: [0, .004, .012], gain: [.97, 1, 1.04], contrast: .12 }; } };
}

// S7 the door + silence 2: from inside the temple, against the light; a silhouette walks out through the great door and grows small in the grey light.
// On «no volvió» the two leaves close. Then the box goes dark.
export function S7(E) {
  const { H } = E;
  const S = stage({ light: [0, -.01, -.1], lightR: .12, lightCol: '#c8d2e4', key: .6, keyCol: '#d0d8e8', amb: .28, ambCol: '#8a96ac', floor: .35 });
  S.add(skyPanel({ w: 1.2, h: 1, z: -.19, stops: [[0, '#b4bccb'], [.6, '#9ea8b8'], [1, '#8a94a6']], gain: .95 }));
  land(S, { z: -.17, col: '#5a6272', base: GROUND + .012, amp: .001, len: .3, trans: .5 });
  const DW = .046, DT = .03, top = DT + DW / 2 + .006, bot = GROUND - .03;
  lay(S, { w: .7, h: .4, z: -.12, col: '#323a48', trans: .3, ppm: 2200, finish: { rim: .5, rimPx: 3 }, draw: c => {
    c.fillRect(-.35, -.2, .7, .4); cut(c, () => { c.fillRect(-DW / 2, bot, DW, DT - bot); c.beginPath(); c.arc(0, DT, DW / 2, 0, Math.PI); c.fill(); });
  } });
  // two leaves hinged at the jambs, just behind the wall (the wall masks them to the arch); they close by unfolding toward the centre
  const leaf = s => lay(S, { w: DW / 2 + .001, h: top - bot, x: s * DW / 4, ax: s * DW / 4, y: (top + bot) / 2, z: -.1215, col: '#2a303c', trans: .25, ppm: 4000, finish: { rim: .4, rimPx: 3 },
    draw: c => c.fillRect(-DW / 4 - .0005, -(top - bot) / 2, DW / 2 + .001, top - bot) });
  const LL = leaf(-1), LR = leaf(1);
  columns(S, { z: -.09, col: '#1c2028', w: .022, gap: .12, x0: -.06, x1: .06, top: .14, trans: .1 });
  land(S, { z: -.075, col: TG.floor, base: GROUND, amp: .0005, len: .2, trans: .05 });
  const Ju = human(S.U, { h: .066, z: -.08, col: '#0b090b', rim: .55 }); S.scene.add(Ju.g);
  const C = clawd(S.U, { u: .002, z: -.085 }); S.scene.add(C.g);
  const fr = front(S, '#060506');
  return { S, update(t) {
    const cz = .44, cy = camY(cz, GROUND, -.075, .37);
    aim(S.cam, [0, cy, cz, 0, cy, -.08], t, { hand: .0001 });
    fr.follow();
    const w = seg(t, E.T0 + .1, H.no_volvio - .05), z = lerp(-.082, -.165, eio(w)), x = lerp(-.024, .001, ss(seg(w, 0, .32)));
    Ju.g.position.z = z; Ju.set({ x, y: GROUND + .012 * ss(seg(w, .45, 1)), s: lerp(1, .5, ss(seg(w, .4, 1))), a: Math.sin(t * 5.4) * .22, rot: Math.sin(t * 5.4) * .012, flip: false });
    const cl = eio(seg(t, H.no_volvio - .15, H.no_volvio + .5));
    LL.scale.x = Math.max(.02, cl); LR.scale.x = Math.max(.02, cl);
    C.set({ x: -.046, y: GROUND, look: .7, lookY: 0, blink: 1, k: lerp(.75, .5, cl) });
    this._dark = ss(seg(t, H.no_volvio + .35, H.sil2 + .25));
    setL(S, 0, -.01, .12, lerp(1, .55, cl));
    this._f = fsOf(S, -.12);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 6, bloom: blo(.3, 1.1) }; }, grade() { return { vig: .5, sat: .85, lift: [0, .004, .012], gain: [.97, 1, 1.04], expo: 1 - .55 * this._dark }; } };
}

// —— the lake shore: the box lights again; ranges of hills and mist in pairs of sheets that can part like a stage curtain ——
export const LK = { sky: [[0, '#1c1628'], [.45, '#2a2236'], [.75, '#4a3a4e'], [1, '#6e5666']], hf: '#4a3a4e', hn: '#3c2e42', mist: '#5a4a5c', water: '#2e2638', shore: '#0c080e', fig: '#0a070c', boat: '#100b10', front: '#060406' };
export const GD = { sky: [[0, '#d8b06a'], [.4, '#f0d494'], [.75, '#f6e2ac'], [1, '#fff0c8']], hf: '#e8c47c', hn: '#b88a48', mist: '#f6e2ac', water: '#8a6234', shore: '#22150a', fig: '#1c1108', boat: '#22150a', front: '#0a0604' };
export const HZ = -.034;
export function lago(S, o = {}) {
  const sky = skyPanel({ w: 1.6, h: 1.4, y: .2, z: -.2, stops: LK.sky, gain: 1 }); S.add(sky);
  const gsky = skyPanel({ w: 1.6, h: 1.4, y: .2, z: -.199, stops: GD.sky, gain: 1.1 }); gsky.material.transparent = true; gsky.material.opacity = 0; S.add(gsky);
  const sun = moon({ r: .02, x: 0, y: HZ + .01, z: -.19, gain: 2.6, core: '#fffbe8', mid: '#fff0c0', edge: '#ffd98a', halo: 9, haloGain: .6 }); S.scene.add(sun);
  const pair = (z, col, base, amp, len, ph, trans, rim = .5) => {
    const half = s => lay(S, { w: .6, h: .5, x: s * .3, y: -.2, z, col, trans, ppm: 1800, finish: { rim, rimPx: 4 }, draw: c => { c.translate(-s * .3, .2); waveFill(c, { x0: s < 0 ? -.6 : 0, x1: s < 0 ? 0 : .6, base, amp, len, ph, peak: 1.4 }); } });
    return { L: half(-1), R: half(1), part(k) { this.L.position.x = -.3 - k; this.R.position.x = .3 + k; } };
  };
  const P3 = [pair(-.175, LK.hf, HZ + .012, .026, .22, 1.2, .7), pair(-.16, LK.hn, HZ + .002, .02, .16, 3.1, .45), pair(-.145, LK.mist, HZ - .004, .006, .09, 0, .85, .2)];
  const water = land(S, { z: -.13, col: LK.water, base: HZ - .001, amp: .0008, len: .1, trans: .35, extra: c => cut(c, () => { const R = mulberry(4); for (let i = 0; i < 40; i++) c.fillRect((R() - .5) * .8, HZ - .004 - R() * .03, .01 + R() * .02, .0005); }) });
  const far = barca(S.U, { L: .022, z: -.128, col: '#1a1420', rim: .3 }); far.position.set(-.035, HZ - .002, -.128); S.add(far);
  const shore = land(S, { z: -.1, col: LK.shore, base: GROUND + .002, amp: .003, len: .18, ph: 1.4, trans: .08 });
  const boat = barca(S.U, { L: .075, z: -.066, col: LK.boat }); boat.position.set(-.066, GROUND + .008, -.066); boat.rotation.z = .05; S.add(boat);
  const fr = front(S, LK.front);
  const layers = [[sky, null], [P3[0].L, 'hf'], [P3[0].R, 'hf'], [P3[1].L, 'hn'], [P3[1].R, 'hn'], [P3[2].L, 'mist'], [P3[2].R, 'mist'], [water, 'water'], [shore, 'shore'], [boat, 'boat'], [far, 'boat']];
  return { sky, gsky, sun, P3, water, far, shore, boat, fr, layers,
    // gold 0..1: the palette moves from before-dawn to gold; lit(i): per-layer brightness (back to front)
    paint(gold, lit = () => 1) {
      layers.forEach(([m, key], i) => { const k = lit(i); if (!key) { m.material.color.setScalar(m.userData.base * k); return; } tint(m, mixc(LK[key], GD[key], gold), lerp(.12, 1, k)); });
      gsky.material.opacity = gold * lit(0); setMoon(sun, gold);
    } };
}
const BOATCL = [-.04, GROUND + .0125];   // where Clawd sits on the prow of the beached boat

// S8 before dawn, the shore: the box lights again from the back to the front; the camera cranes down from the sky. Jesus waits by the embers; Pedro comes out of the water.
export function S8(E) {
  const { H } = E;
  const S = stage({ light: [.0, .0, -.1], lightR: .24, lightCol: '#e8c8b0', key: .7, keyCol: '#e6d0d8', amb: .22, ambCol: '#8a7898', floor: .3 });
  const L = lago(S);
  const B = brasas(S.U, { w: .016, z: -.092 }); B.g.position.set(.028, GROUND + .001, -.092); S.scene.add(B.g);
  const Je = human(S.U, { h: .068, z: -.094, col: LK.fig, rim: .75 }); S.scene.add(Je.g);
  const Pe = human(S.U, { h: .066, z: -.105, col: LK.fig, rim: .7 }); S.scene.add(Pe.g);
  const C = clawd(S.U, { u: .0026, z: -.064 }); S.scene.add(C.g);
  return { S, update(t) {
    const t0 = E.T0, m = eio(seg(t, t0, t0 + 2.4)), cz = .5, cyE = camY(cz, GROUND, -.09, .36);
    const cx = .004, cy = lerp(.09, cyE, m);
    aim(S.cam, [cx, cy, cz, cx, cy, -.08], t, { hand: .0003 });
    L.fr.follow();
    L.paint(.08, i => ss(seg(t, t0 + .1 + i * .16, t0 + .9 + i * .16)));
    for (const p of L.P3) p.part(0);
    B.set(t, ss(seg(t, t0 + 1.2, t0 + 2.2)));
    Je.set({ x: .048, y: GROUND, a: .1, flip: true });
    const w = seg(t, t0 + .8, H.l14 - .5), py = lerp(GROUND - .03, GROUND + .002, ss(seg(w, 0, .6)));
    Pe.set({ x: lerp(-.012, .012, w), y: py, a: Math.sin(t * 5.6) * .25 * (w < 1 ? 1 : 0), rot: Math.sin(t * 5.6) * .015 * (w < 1 ? 1 : 0) });
    const turn = ss(seg(t, H.orilla - .3, H.orilla + .3));
    C.set({ x: BOATCL[0] + .006, y: BOATCL[1], aL: 0, aR: 0, look: lerp(-.2, .9, turn), blink: blink(t, 3.2), k: lerp(.4, 1, ss(seg(t, t0 + 1.4, t0 + 2.2))) });
    setL(S, .02, lerp(.06, .0, m), .24, lerp(.3, 1.0, ss(seg(t, t0, t0 + 2))));
    this._fade = ss(seg(t, t0 - .05, t0 + .9));
    this._f = fsOf(S, -.09);
  }, post() { return { focus: this._f, aper: 8, maxCoc: 6, bloom: blo(.3, 1.05) }; }, grade() { return { vig: .48, expo: this._fade }; } };
}

// S9 the embers and the three questions: rhyme of S1 (fire centre bottom); three pulses of light, each lifting one layer higher; Pedro lifts his head a little more each time.
export function S9(E) {
  const { H } = E;
  const S = stage({ light: [.01, -.03, -.1], lightR: .08, lightCol: '#ffd8a0', key: .8, keyCol: '#ffe0c8', amb: .24, ambCol: '#8a7898', floor: .26 });
  const L = lago(S);
  const B = brasas(S.U, { w: .02, z: -.08 }); B.g.position.set(.01, GROUND + .001, -.08); S.scene.add(B.g);
  const Pe = human(S.U, { h: .064, z: -.082, pose: 'sit', col: LK.fig, rim: .75 }); S.scene.add(Pe.g);
  const Je = human(S.U, { h: .066, z: -.086, pose: 'sit', col: LK.fig, rim: .85 }); S.scene.add(Je.g);
  const C = clawd(S.U, { u: .0026, z: -.064 }); S.scene.add(C.g);
  const P = [0, 1, 2].map(i => H.preguntas + i * .62);
  // layer groups lifted by each pulse: 1st shore + boat, 2nd water, 3rd mist
  const group = i => (i === 8 || i === 9) ? 1 : i === 7 ? 2 : (i === 5 || i === 6) ? 3 : 9;
  return { S, update(t) {
    const k = eio(seg(t, E.T0, E.T0 + E.dur + .5)), cz = lerp(.55, .52, k), cy = camY(cz, GROUND, -.08, .37);
    aim(S.cam, [0, cy, cz, 0, cy, -.08], t, { hand: .0003 });
    L.fr.follow();
    const pulse = P.map(p => env(t, p, p + .7, .12, .5)), steps = P.reduce((a, p) => a + ss(seg(t, p, p + .3)), 0);
    L.paint(.12 + .05 * steps, i => .78 + .22 * clamp(steps - group(i) + 1));
    for (const p of L.P3) p.part(0);
    const pp = Math.max(...pulse);
    B.set(t, .9 + .4 * pp);
    setL(S, .01, GROUND + .03 + .04 * steps / 3, .08 + .04 * steps, 1 + .6 * pp);
    Pe.set({ x: -.016, y: GROUND, a: .9, rot: lerp(-.16, 0, steps / 3) });
    Je.set({ x: .044, y: GROUND, a: .8, flip: true });
    C.set({ x: BOATCL[0], y: BOATCL[1], aL: 0, aR: 0, look: .8, blink: blink(t, 3.5, .7), k: 1 });
    this._f = fsOf(S, -.082);
  }, post() { return { focus: this._f, aper: 8, maxCoc: 6, bloom: blo(.34, 1.0) }; }, grade() { return { vig: .48 }; } };
}

// S10 signature shot: on «Apacienta» the mist and the hills part like a paper curtain, front to back; the sun behind them (the one burst, on «ovejas»);
// the light runs through every layer to the embers. Dolly back and crane up. Clawd still at the side, face to the light.
export function S10(E) {
  const { H } = E;
  const S = stage({ light: [0, HZ, -.1], lightR: .1, lightCol: '#ffd98a', key: .9, keyCol: '#ffe6c0', amb: .26, ambCol: '#a08878', floor: .3 });
  const L = lago(S);
  const B = brasas(S.U, { w: .02, z: -.08 }); B.g.position.set(.01, GROUND + .001, -.08); S.scene.add(B.g);
  const Pe = human(S.U, { h: .064, z: -.082, pose: 'sit', col: LK.fig, rim: .85 }); S.scene.add(Pe.g);
  const Je = human(S.U, { h: .066, z: -.086, pose: 'sit', col: LK.fig, rim: .95 }); S.scene.add(Je.g);
  const C = clawd(S.U, { u: .0026, z: -.064 }); S.scene.add(C.g);
  const sunB = burst(.34, .3, '#ffd79a'); sunB.position.set(0, HZ - .01, -.188); S.add(sunB);
  const a = H.apacienta;
  return { S, update(t) {
    const k = eio(seg(t, a - .3, E.T0 + E.dur + .3)), cz = lerp(.52, .6, k), cy = lerp(camY(.52, GROUND, -.08, .37), camY(.6, GROUND, -.08, .33) + .006, k);
    aim(S.cam, [0, cy, cz, 0, cy, -.08], t, { hand: .0004 });
    L.fr.follow();
    const op = i => eio(seg(t, a + i * .3, a + 1.3 + i * .3));   // i = 0 mist (front) … 2 far hills (back)
    L.P3[2].part(.2 * op(0)); L.P3[1].part(.22 * op(1)); L.P3[0].part(.24 * op(2));
    const gold = ss(seg(t, a, H.ovejas + 1.2));
    L.paint(lerp(.27, 1, gold), () => 1);
    L.layers.forEach(([m], i) => { const u = m.material.userData.u; if (u) u.uTrans.value = lerp(.05, .7, ss(seg(t, H.ovejas + i * .09, H.ovejas + .3 + i * .09))); });
    const bk = ss(seg(t, H.ovejas - .1, H.ovejas + .45)) * (1 - .25 * ss(seg(t, H.ovejas + 1.2, H.ovejas + 2.4)));
    sunB.userData.set(1.15 * bk);
    L.sun.position.y = HZ + .01 + .01 * gold;
    const ly = lerp(HZ + .01, GROUND + .03, ss(seg(t, H.ovejas, H.ovejas + 1.2)));
    setL(S, .004, ly, lerp(.1, .3, gold), lerp(1, 1.6, gold), col3('#ffd98a'));
    S.key.intensity = lerp(.9, 1.5, gold); S.amb.intensity = lerp(.26, .4, gold);
    B.set(t, 1);
    Pe.set({ x: -.016, y: GROUND, a: .9, rot: .02 });
    Je.set({ x: .044, y: GROUND, a: .8, flip: true });
    C.set({ x: BOATCL[0], y: BOATCL[1], aL: 0, aR: 0, look: .25, lookY: .7 * gold, blink: 1, k: 1 });
    this._g = gold; this._f = fsOf(S, -.082);
  }, post() { return { focus: this._f, aper: 8, maxCoc: 7, bloom: blo(.45, .95) }; }, grade() { return { vig: lerp(.45, .3, this._g), sat: 1.05 }; } };
}

// S11 the fire is still burning: the gold shore in the frame of S1 — embers in the centre, Clawd on a stone at the left, Pedro (hood down) beside Jesus at the right.
// The camera comes in to Clawd on «vuelve»; he reaches to the embers, then turns to the viewer for the question.
export function S11(E) {
  const { H } = E;
  const S = stage({ light: [.004, -.02, -.1], lightR: .22, lightCol: '#ffd98a', key: 1.4, keyCol: '#ffe6c0', amb: .38, ambCol: '#c0a080', floor: .45 });
  const L = lago(S);
  L.boat.visible = false; L.far.visible = false;
  L.P3[2].part(.2); L.P3[1].part(.22); L.P3[0].part(.24);
  const B = brasas(S.U, { w: .02, z: -.078 }); B.g.position.set(.004, GROUND + .001, -.078); S.scene.add(B.g);
  const Je = human(S.U, { h: .066, z: -.09, pose: 'sit', col: GD.fig, rim: .95 }); S.scene.add(Je.g);
  const Pe = human(S.U, { h: .066, z: -.075, pose: 'sit', col: GD.fig, rim: .9 }); S.scene.add(Pe.g);
  stoneSeat(S, -.034, -.0645, '#2a1a0c');
  const C = clawd(S.U, { u: .0033, z: -.062, glow: .4 }); S.scene.add(C.g);
  return { S, update(t) {
    const pin = eio(seg(t, H.vuelve - .2, H.cta + .2));
    const cz = lerp(.52, .41, pin), cx = lerp(.006, -.018, pin), cy = camY(cz, GROUND, -.068, lerp(.36, .4, pin));
    aim(S.cam, [cx, cy, cz, cx, cy, -.08], t, { hand: .0003 });
    L.fr.follow(.24);
    L.paint(1, () => 1); L.sun.position.y = HZ + .03;
    L.layers.forEach(([m]) => { const u = m.material.userData.u; if (u) u.uTrans.value = .55; });
    B.set(t, 1);
    setL(S, .004, GROUND + .04, .22, 1.45);
    Je.set({ x: .06, y: GROUND, a: .8, flip: true });
    Pe.set({ x: .033, y: GROUND, a: .9, flip: true });
    const reach = ss(seg(t, H.fuego2 - .2, H.fuego2 + .3)) * (1 - ss(seg(t, H.cta - .2, H.cta + .2)));
    const face = ss(seg(t, H.cta - .1, H.cta + .35));
    const hop = Math.sin(Math.PI * seg(t, H.cta - .1, H.cta + .3)) * .0018;
    C.set({ x: -.034, y: GROUND + .007 + hop, aL: .7 * reach, aR: .7 * reach, look: lerp(.6, 0, face), lookY: lerp(-.4, 0, face), blink: blink(t, 3.0, .5), k: 1 });
    this._f = fsOf(S, -.062);
  }, post() { return { focus: this._f, aper: 9, maxCoc: 7, bloom: blo(.36, 1.05) }; }, grade() { return { vig: .32, sat: 1.04 }; } };
}
