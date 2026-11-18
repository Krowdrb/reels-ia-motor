// The eleven shots of «La cuenta de Matusalén» (Genesis 5:25-29, 7:6). Each: { S, update(t), post(), grade() }; t in film seconds.
// God is only ever light. Methuselah, Lamech and Noah are quiet silhouettes; nobody is shown dying or in the water.
import * as THREE from 'three';
import { skyPanel, moon, setMoon, text, burst } from './paper.js';
import { stage, aim } from './stage.js';
import { mulberry, seg, ss, eio, eo, lerp, clamp, vnoise, TAU } from './lib.js';
import { mk, cut, tint, clawd, human, waveFill, ridgeFill, tienda, cayado, bebe, piedra, arca, lantern, rain } from './actors.js';

const blo = (s = .34, th = 1.1) => ({ strength: s, radius: .6, threshold: th });
const lay = (S, o) => S.add(mk(S.U, o));
const col3 = c => new THREE.Color(c);
const mixc = (a, b, k) => '#' + col3(a).lerp(col3(b), clamp(k)).getHexString();
const setL = (S, x, y, r, lit, c) => { S.U.uLight.value.x = x; S.U.uLight.value.y = y; S.U.uLightR.value = r; S.U.uLit.value = lit; if (c) S.U.uLightCol.value.copy(c); };
const bob = (t, f, a, p = 0) => Math.sin(t * f + p) * a;
const fsOf = (S, z) => S.cam.position.z - z;
const blink = (t, per = 3.3, ph = 0) => 1 - .9 * Math.max(0, 1 - Math.abs(((t + ph) % per) - .1) / .1);
const face = (P, d) => { P.g.scale.x = d * Math.abs(P.g.scale.x); };
const glowK = (m, k) => { m.material.userData.u.uGlowLit.value = k; };
const clipAll = (g, x, y, r, out) => g.traverse(o => { const u = o.material?.userData?.u; if (u) u.uClip.value.set(x, y, r, out ? 1 : 0); });
// half of the visible height at depth z; a camera height that puts the ground line yg (at depth zf) at fraction f from the bottom
export const HH = (cz, z) => .4617 * (cz - z) / 2;
export const camY = (cz, yg = -.05, zf = -.07, f = .35) => yg + (1 - 2 * f) * HH(cz, zf);

// A strip of land drawn in world coordinates (top edge = base..base+amp, never a plain rectangle). notch = [x, top, bottom, width at top, width at bottom]: the road cut through it
export function land(S, { z, col, base, amp = .004, len = .12, ph = 0, trans = .1, w = .9, rim = .5, peak = 1.3, x = 0, ppm = 1600, shadow = true, notch = null }) {
  return lay(S, { w, h: .6, x, y: -.2, z, col, trans, ppm, shadow, finish: { rim, rimPx: 3 }, draw: c => {
    c.translate(-x, .2); waveFill(c, { x0: x - w / 2, x1: x + w / 2, base, amp, len, ph, peak });
    if (notch) cut(c, () => { const [nx, top, bot, wt, wb] = notch; c.beginPath(); c.moveTo(nx - wt / 2, top + .01); c.lineTo(nx + wt / 2, top + .01); c.lineTo(nx + wt / 2, top); c.quadraticCurveTo(nx + wb * .2, (top + bot) / 2, nx + wb / 2, bot); c.lineTo(nx - wb / 2, bot); c.quadraticCurveTo(nx - wb * .25, (top + bot) / 2, nx - wt / 2, top); c.closePath(); c.fill(); });
  } });
}
export function hills(S, { z, col, base, peaks, w = 1, x = 0, trans = .2, rim = .5, ppm = 1500, rough = .0012, ph = 0 }) {
  return lay(S, { w, h: .6, x, y: -.2, z, col, trans, ppm, finish: { rim }, draw: c => { c.translate(-x, .2); ridgeFill(c, { x0: x - w / 2, x1: x + w / 2, base, peaks, rough, ph }); } });
}
// The dark front band: follows the camera so the bottom ~26 % stays dark for the subtitles
export function front(S, col, o = {}) {
  const z = o.z ?? -.03, m = land(S, { z, col, base: -.006, amp: .005, len: .14, ph: o.ph ?? 2, trans: .02, rim: o.rim ?? .3, w: 1.2, shadow: false, ppm: 1200 });
  return { m, follow(f = .26) { const c = S.cam.position; m.position.x = c.x; m.position.y = -.2 + c.y - HH(c.z, z) * (1 - 2 * f); } };
}
// Sky: a gradient panel whose horizon sits at y ≈ -.03 (stops: top → upper → horizon)
const SKY = (top, up, hor) => [[0, top], [.42, up], [.66, hor], [1, hor]];
const skyOf = (S, stops, o = {}) => { const m = skyPanel({ w: o.w || 1.2, h: .6, x: o.x || 0, y: .1, z: o.z ?? -.16, stops, gain: o.gain ?? 1 }); S.add(m); return m; };
// Cloud bank: soft lumps along a band (paper); y = the band's bottom edge
function cloudBank(S, { z, col, y, w = .5, n = 16, r = .02, seed = 5, trans = .45, x = 0, thick = .05 }) {
  const R = mulberry(seed), H_ = thick + r * 3;
  return lay(S, { w, h: H_, x, y: y + H_ / 2 - r, z, col, trans, shadow: false, recv: false, ppm: 1400, finish: { rim: .45, rimPx: 4 }, draw: c => {
    c.translate(0, -H_ / 2 + r);
    c.fillRect(-w / 2, 0, w, thick);
    for (let i = 0; i < n; i++) { c.beginPath(); c.arc(-w / 2 + (i + R() * .6) * w / n, thick * (.15 + R() * .7), r * (.7 + R() * .8), 0, TAU); c.fill(); }
    for (let i = 0; i < n * .6; i++) { c.beginPath(); c.arc(-w / 2 + R() * w, (R() - .2) * r * .6, r * (.4 + R() * .5), 0, TAU); c.fill(); }
  } });
}

// —— palettes (TREATMENT §2): every layer of the box, per time of day ——
export const PAL = {
  dusk: { sky: SKY('#5e5282', '#8a7aa0', '#f3d9a4'), far: '#9d86a6', mid: '#5e4a6a', tent: '#3e2e44', ground: '#2a1f30', stone: '#1c1420', front: '#120c16', fig: '#120c16',
    light: '#ffcf9a', key: '#ffdcc0', amb: '#9a86b8', sun: ['#fffbe8', '#ffe2a8', '#ffd38a'] },
  morn: { sky: SKY('#dccaa0', '#e9dbb6', '#f1e6c8'), far: '#cdb98e', mid: '#86705a', tent: '#5c4636', ground: '#3a2a22', stone: '#261a14', front: '#140e0c', fig: '#140e0c',
    light: '#fff0d0', key: '#fff2dc', amb: '#c8b490', sun: ['#fffdf2', '#fff6dc', '#fff0c8'] },
  grey: { sky: SKY('#9a919c', '#b2a9ae', '#c2b8b8'), far: '#918690', mid: '#57505a', tent: '#47404a', ground: '#2a242c', stone: '#1c1820', front: '#100c12', fig: '#100c12',
    light: '#d8d0d0', key: '#e0dade', amb: '#8e8696', sun: ['#f4f0ea', '#e8e2dc', '#dcd4d0'] },
  storm: { sky: SKY('#2a2632', '#3e3846', '#56506a'), far: '#58526c', mid: '#443e4e', tent: '#2a2533', ground: '#3e3848', stone: '#0a080c', front: '#0c0a0e', fig: '#0c0a0e',
    light: '#8a8496', key: '#a8a2b4', amb: '#5a5468', sun: null },
  gold: { sky: SKY('#cbb6c8', '#f0d8ac', '#f8e6b4'), far: '#e2bf86', mid: '#b88a4c', tent: '#7a5530', ground: '#604020', stone: '#3a2614', front: '#1f140a', fig: '#1f140a',
    light: '#ffd98a', key: '#ffe6c0', amb: '#c8a07a', sun: ['#fffbea', '#fff0c0', '#ffd98a'] },
};

// Title strip: paper, lit, letters cut out; anchored to the camera (top of frame); reveals from its left edge
function titleStrip(S) {
  const m = lay(S, { w: .12, h: .058, z: -.01, col: '#efdcb4', trans: .35, shadow: false, recv: false, ppm: 9000, finish: { rim: .3, under: .2 }, draw: x => {
    x.beginPath(); x.roundRect(-.058, -.027, .116, .054, .002); x.fill();
    cut(x, () => {
      text(x, 'LA CUENTA', 0, .0128, .0128, 'Cinzel', { weight: 800, fill: '#000' });
      text(x, 'QUE NADIE HACE', 0, -.0015, .0089, 'Cinzel', { weight: 800, fill: '#000' });
      text(x, 'Génesis 5 · 7', 0, -.0165, .0078, 'Playfair', { weight: 'italic 500', fill: '#000' });
    });
  }, glowDraw: x => { x.fillStyle = '#fff'; x.fillRect(-.06, -.029, .12, .058); }, glow: .5, glowCol: '#efdcb4', glowRes: .2 });
  return { m, update(t, t0, t1) {
    const reveal = ss(seg(t, t0, t0 + .6)) * (1 - ss(seg(t, t1 - .45, t1)));
    const c = S.cam.position, ts = (c.z + .01) / .5;
    m.scale.setScalar(ts); m.position.x = c.x - .002 * ts; m.position.y = c.y + HH(c.z, -.01) * .62;
    m.material.userData.u.uClip.value.set(m.position.x - .066 * ts, m.position.y, .15 * reveal * ts, 0); m.visible = reveal > .002;
  } };
}

// —— «la puerta»: Methuselah's tent, the two stones, the hills, the sun (S1, S2, S7, S11 and the cover) ——
export const G = -.05, MX = -.02, CX = .038;
export function puerta(S, P, o = {}) {
  const skyA = skyOf(S, P.sky), skyB = o.to ? skyOf(S, o.to.sky, { z: -.1595 }) : null;
  if (skyB) { skyB.material.transparent = true; skyB.material.opacity = 0; }
  let sun = null;
  if (P.sun || o.to?.sun) { const s = P.sun || o.to.sun; sun = moon({ r: .011, x: .078, y: -.016, z: -.152, gain: 1.9, core: s[0], mid: s[1], edge: s[2], halo: 8, haloGain: .55 }); S.scene.add(sun); }
  const L = {};
  L.far = hills(S, { z: -.14, col: P.far, base: -.035, peaks: [[-.13, .055, .05], [-.04, .035, .035], [.17, .05, .04]], trans: .55 });
  if (o.ark) { const A = arca(S.U, { L: .03, h: .006, z: -.137, col: P.mid, glow: 2 }); A.g.position.set(-.04, -.0015, -.137); S.scene.add(A.g); L.ark = A; }
  L.mid = hills(S, { z: -.118, col: P.mid, base: -.049, peaks: [[-.11, .03, .05], [.0, .014, .04], [.13, .028, .04]], trans: .3, ph: 2 });
  L.tent = tienda(S.U, { w: .075, h: .044, z: -.095, col: P.tent, win: [.27, .4] }); L.tent.position.set(-.072, -.053, -.095); S.add(L.tent);
  L.ground = land(S, { z: -.08, col: P.ground, base: -.0515, amp: .0025, len: .14, ph: 1.2, trans: .12 });
  L.stoneB = piedra(S.U, { w: .034, top: .012, z: -.074, col: P.stone, seed: 2 }); L.stoneB.position.set(MX, G - .002, -.074); S.add(L.stoneB);
  L.stoneS = piedra(S.U, { w: .03, top: .006, z: -.072, col: P.stone, seed: 7 }); L.stoneS.position.set(CX, G - .002, -.072); S.add(L.stoneS);
  const PUD = [[-.075, .012], [.004, .009], [.078, .014], [-.12, .01]];
  if (o.puddles) L.pud = lay(S, { w: .3, h: .03, y: G - .0045, z: -.0765, col: '#d8b47c', trans: .3, shadow: false, recv: false, ppm: 2400, finish: { rim: .3, under: 0 }, draw: c => {
    for (const [px, rx] of PUD) { c.beginPath(); c.ellipse(px, 0, rx, .0009, 0, 0, TAU); c.fill(); }
  } });
  const fr = front(S, P.front); L.front = fr.m;
  // repaint the box toward palette Q by k (0 = P, 1 = Q)
  const paint = (Q, k) => {
    for (const key of ['far', 'mid', 'tent', 'ground', 'front']) tint(L[key], mixc(P[key], Q[key], k));
    tint(L.stoneB, mixc(P.stone, Q.stone, k)); tint(L.stoneS, mixc(P.stone, Q.stone, k));
    if (skyB) skyB.material.opacity = k;
    S.key.color.copy(col3(P.key).lerp(col3(Q.key), k)); S.amb.color.copy(col3(P.amb).lerp(col3(Q.amb), k)); S.U.uLightCol.value.copy(col3(P.light).lerp(col3(Q.light), k));
  };
  return { skyA, skyB, sun, L, fr, paint };
}
// Methuselah old, sitting on his stone with his staff
export function oldMan(S, P, { h = .075, rim = .7 } = {}) {
  const M = human(S.U, { h, z: -.071, pose: 'sit', col: P.fig, rim }); S.scene.add(M.g);
  const st = cayado(S.U, { L: .072, z: -.0705, col: P.fig, rim }); S.add(st);
  M.set({ x: MX, y: G + .01, a: .95 });
  st.position.set(MX + h * .31, G - .002, -.0705);
  return { M, st };
}

// —— S1 the door at sunset: Methuselah on his stone, Clawd on the low stone beside him; the title strip ——
export function S1(E) {
  const { H } = E;
  const P = PAL.dusk;
  const S = stage({ light: [.078, -.01, -.1], lightR: .2, lightCol: P.light, key: 1.15, keyCol: P.key, amb: .34, ambCol: P.amb, floor: .4 });
  const B = puerta(S, P);
  const strip = lay(S, { w: .2, h: .03, x: .07, y: .034, z: -.15, col: '#55466c', trans: .35, shadow: false, recv: false, ppm: 2400, finish: { rim: .45, rimPx: 3 }, draw: c => {   // the dark cloud on the horizon
    for (const [px, py, rx, ry] of [[-.07, -.002, .03, .0035], [-.035, .001, .028, .005], [0, .0, .034, .0045], [.04, -.001, .03, .004], [.075, -.003, .022, .003], [-.015, -.004, .07, .0025]]) { c.beginPath(); c.ellipse(px, py, rx, ry, 0, 0, TAU); c.fill(); }
  } });
  const { M } = oldMan(S, P, { h: .082 });
  const C = clawd(S.U, { u: .0027, z: -.068 }); S.scene.add(C.g);
  const T = titleStrip(S);
  return { S, update(t) {
    const k = eio(seg(t, 0, E.dur + .8)), cz = lerp(.64, .6, k), cx = lerp(.002, .008, k), cy = camY(cz, G, -.07, .36);
    aim(S.cam, [cx, cy, cz, cx, cy, -.08], t);
    B.fr.follow();
    const up = ss(seg(t, H.novecientos - .25, H.novecientos + .7)) * (1 - .35 * ss(seg(t, H.l01b, H.l01b + .6)));
    const q = ss(seg(t, H.pregunta, H.pregunta + .5));
    C.set({ x: CX, y: G + .006, tuck: .6, look: lerp(-.9, .8, q), lookY: lerp(.2, .5, q), aL: up * 2.1 + bob(t, 2.2, .06) * up, aR: up * 2.0 - bob(t, 2.2, .06) * up, blink: blink(t, 3.1, .4), k: 1.1 });
    M.set({ x: MX - .004, y: G + .01, a: .95 + bob(t, .8, .03), rot: bob(t, .5, .01) });
    B.L.tent.material.emissiveIntensity = 2.6 * (.92 + .08 * vnoise(t * 5));
    strip.position.x = .07 - t * .002;
    setL(S, .078, -.01, .2, 1.05);
    T.update(t, .2, H.titulo_fin);
    this._f = fsOf(S, -.07);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 6, bloom: blo(.36, 1.05) }; }, grade() { return { vig: .42, sat: 1.04 }; } };
}

// —— S2 the light goes back: same frame; the sun climbs back up, dusk turns to morning; the sitting old man becomes the young father with a newborn ——
export function S2(E) {
  const { H } = E;
  const P = PAL.dusk, Q = PAL.morn;
  const S = stage({ light: [.078, -.01, -.1], lightR: .2, lightCol: P.light, key: 1.15, keyCol: P.key, amb: .34, ambCol: P.amb, floor: .4 });
  const B = puerta(S, P, { to: Q });
  const { M, st } = oldMan(S, P);
  const Y = human(S.U, { h: .08, z: -.0712, pose: 'stand', col: P.fig, rim: .7, two: true }); S.scene.add(Y.g);
  const baby = bebe(S.U, { s: .016, z: .0002, col: '#eadcbc' }); Y.g.add(baby);
  const C = clawd(S.U, { u: .0027, z: -.068 }); S.scene.add(C.g);
  const a0 = H.alos + .05, a1 = H.alos + 1.6;   // the light goes back
  return { S, update(t) {
    const cz = .6, cx = .008, cy = camY(cz, G, -.07, .36);
    aim(S.cam, [cx, cy, cz, cx, cy, -.08], t, { hand: .0004 });
    B.fr.follow();
    const k = eio(seg(t, a0, a1));
    B.paint(Q, k);
    tint(M.body, mixc(P.fig, Q.fig, k)); tint(Y.body, mixc(P.fig, Q.fig, k));
    if (B.sun) { const s = eio(seg(t, a0 - .2, a1 + .6)); B.sun.position.set(lerp(.078, -.03, s), lerp(-.016, .09, s) + Math.sin(s * Math.PI) * .014, -.152); setMoon(B.sun, lerp(1, 1.15, k)); }
    setL(S, lerp(.078, -.02, k), lerp(-.01, .06, k), lerp(.2, .28, k), lerp(1.05, 1.2, k));
    S.key.position.x = lerp(.08, -.02, k);
    // the old man dissolves into the young one (a growing paper iris centred on him)
    const r = eio(seg(t, H.alos + .25, H.alos + .9)) * .08, cxm = MX + .006, cym = G + .03;
    clipAll(M.g, cxm, cym, r, true); clipAll(st, cxm, cym, r, true); clipAll(Y.g, cxm, cym, r, false);
    M.g.visible = st.visible = r < .079; Y.g.visible = r > .0005;
    Y.set({ x: MX - .002, y: G - .001, a: 1.12 + bob(t, 1.1, .03) });
    baby.position.set(.03, .049, .0002); baby.rotation.z = -.12 + bob(t, 1.1, .02);
    const stand = ss(seg(t, H.alos + .4, H.alos + 1.0)), point = ss(seg(t, H.lamec - .2, H.lamec + .25)) * (1 - ss(seg(t, E.T0 + E.dur - .4, E.T0 + E.dur)));
    C.set({ x: CX, y: G + .006, tuck: .6 * (1 - stand), look: lerp(-.9, -1, stand), lookY: lerp(.2, .1, stand), aL: point * 1.5, aR: 0, blink: blink(t, 2.9), k: 1.1 });
    B.L.tent.material.emissiveIntensity = 2.6 * (1 - .55 * k);
    this._f = fsOf(S, lerp(-.068, -.071, ss(seg(t, H.alos + .3, H.alos + 1.1))));
  }, post() { return { focus: this._f, aper: 7, maxCoc: 6, bloom: blo(.34, 1.08) }; }, grade() { return { vig: .4, sat: 1.03 }; } };
}

// —— S3 the road of generations: lateral travel right, from Methuselah (now with his staff) to Lamech's tent; Clawd walks the foreground ——
export function S3(E) {
  const { H } = E;
  const P = PAL.morn;
  const S = stage({ light: [.1, .06, -.1], lightR: .3, lightCol: P.light, key: 1.3, keyCol: P.key, amb: .38, ambCol: P.amb, floor: .5, keyAngle: .95 });
  skyOf(S, P.sky, { w: 1.6, x: .1 });
  const sun = moon({ r: .011, x: .12, y: .085, z: -.152, gain: 1.9, core: P.sun[0], mid: P.sun[1], edge: P.sun[2], halo: 8, haloGain: .45 }); S.scene.add(sun);
  hills(S, { z: -.14, col: P.far, base: -.034, peaks: [[-.08, .045, .05], [.05, .03, .04], [.17, .05, .05], [.3, .035, .04]], w: 1.2, x: .1, trans: .55 });
  hills(S, { z: -.12, col: P.mid, base: -.049, peaks: [[-.04, .026, .05], [.12, .018, .04], [.26, .028, .05]], w: 1.2, x: .1, trans: .3, ph: 2 });
  const tA = tienda(S.U, { w: .07, h: .042, z: -.1, col: P.tent, win: [.27, .4], seed: 3 }); tA.position.set(-.05, -.053, -.1); S.add(tA);
  const tB = tienda(S.U, { w: .07, h: .042, z: -.1, col: P.tent, win: [-.27, .4], seed: 8 }); tB.position.set(.245, -.053, -.1); S.add(tB);
  land(S, { z: -.085, col: P.ground, base: -.0515, amp: .0025, len: .14, ph: 1.2, trans: .12, w: 1.2, x: .1 });
  const M = human(S.U, { h: .08, z: -.075, col: P.fig, rim: .7 }); S.scene.add(M.g);
  const st = cayado(S.U, { L: .086, z: -.0748, col: P.fig }); S.add(st);
  const Lm = human(S.U, { h: .078, z: -.075, col: P.fig, rim: .7, two: true }); S.scene.add(Lm.g);
  const baby = bebe(S.U, { s: .015, z: .0002, col: '#eadcbc' }); Lm.g.add(baby);
  land(S, { z: -.062, col: '#241812', base: -.0565, amp: .0015, len: .1, ph: 3, trans: .08, w: 1.2, x: .1 });
  const C = clawd(S.U, { u: .0023, z: -.058 }); S.scene.add(C.g);
  lay(S, { w: 1.2, h: .06, x: .1, y: -.075, z: -.04, col: '#0e0907', trans: .03, shadow: false, recv: false, ppm: 1600, finish: { rim: .35 }, draw: c => {   // grass tufts close to the lens (parallax)
    const R = mulberry(12); c.translate(0, .03);
    for (let i = 0; i < 9; i++) { const px = -.6 + i * .14 + R() * .05; for (let j = 0; j < 7; j++) { const a = (j - 3) * .2 + (R() - .5) * .2, l = .014 + R() * .014; c.beginPath(); c.moveTo(px - .0012, -.03); c.quadraticCurveTo(px + Math.sin(a) * l * .5, -.03 + l * .6, px + Math.sin(a) * l, -.03 + l * Math.cos(a)); c.lineTo(px + .0012, -.03); c.fill(); } }
  } });
  const fr = front(S, P.front);
  return { S, update(t) {
    const w = seg(t, E.T0, H.noe + .2), cx = lerp(.0, .2, eio(w)), cz = .62, cy = camY(cz, -.0565, -.058, .34);
    aim(S.cam, [cx, cy, cz, cx, cy, -.08], t, { hand: .0004 });
    fr.follow();
    S.key.position.x = cx; S.key.target.position.x = cx; setL(S, cx + .1, .06, .3, 1.15);
    const moving = w > .02 && w < .98 ? 1 : 0, xs = cx - .035 + .006 * eio(w);
    const stop = ss(seg(t, H.noe - .1, H.noe + .3));
    C.set({ x: xs, y: -.0565 + Math.abs(Math.sin(xs * 300)) * .0009 * moving, walk: xs * 300, stride: .5 * moving, look: lerp(.6, .1, stop), lookY: lerp(.2, .5, stop), aR: stop * 1.3, blink: blink(t, 2.8), k: 1.1 });
    M.set({ x: .005, y: G - .001, a: .5 }); st.position.set(.005 + .08 * .2, G - .002, -.0748);
    Lm.set({ x: .222, y: G - .001, a: 1.12 + bob(t, 1.2, .03) }); face(Lm, -1);
    baby.position.set(.028, .048, .0002); baby.rotation.z = -.1;
    glowK(tA, .4); glowK(tB, .4);
    this._f = fsOf(S, -.07);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 7, bloom: blo(.32, 1.1) }; }, grade() { return { vig: .38, sat: 1.02 }; } };
}

// —— S4 Lamech's lamp: inside the tent, a small lamp lights beside the child on «consolará» ——
export function S4(E) {
  const { H } = E;
  const S = stage({ light: [.02, -.03, -.1], lightR: .1, lightCol: '#ffc078', key: .55, keyCol: '#ffd8b0', amb: .16, ambCol: '#6a5050', floor: .12 });
  lay(S, { w: .4, h: .3, z: -.11, col: '#3a3040', trans: .45, ppm: 1600, finish: { rim: .4 }, draw: c => {
    c.fillRect(-.2, -.15, .4, .3); const R = mulberry(4);
    cut(c, () => { c.lineWidth = .0012; for (let i = -6; i <= 6; i++) { c.beginPath(); c.moveTo(i * .035 + (R() - .5) * .01, -.15); c.lineTo(i * .03, .15); c.stroke(); } });
  } });
  lay(S, { w: .02, h: .3, x: -.045, y: 0, z: -.1, col: '#1c120c', trans: .05, ppm: 2400, finish: { rim: .5 }, draw: c => c.fillRect(-.002, -.15, .004, .3) });
  const Lm = human(S.U, { h: .088, z: -.08, pose: 'sit', col: '#140c08', rim: .8, two: true }); S.scene.add(Lm.g);
  const baby = bebe(S.U, { s: .017, z: .0002, col: '#e6d2ae' }); Lm.g.add(baby);
  const lamp = lantern(S.U, { h: .018, z: -.077, k: 2.6 }); lamp.position.set(.034, -.052, -.077); S.add(lamp);
  land(S, { z: -.075, col: '#1e140e', base: -.053, amp: .0015, len: .2, ph: 2, trans: .1, w: .5 });
  const C = clawd(S.U, { u: .0026, z: -.058 }); S.scene.add(C.g);
  const fr = front(S, '#0a0605');
  return { S, update(t) {
    const k = eio(seg(t, E.T0, E.T0 + E.dur + .3)), cz = lerp(.54, .5, k), cx = .01, cy = camY(cz, -.0555, -.06, .35);
    aim(S.cam, [cx, cy, cz, cx, cy, -.08], t, { hand: .0004 });
    fr.follow();
    const on = ss(seg(t, H.consolara - .05, H.consolara + .3)), fl = .93 + .07 * vnoise(t * 7);
    glowK(lamp, .08 + .92 * on); lamp.material.emissiveIntensity = 2.6 * fl;
    setL(S, .034, -.038, lerp(.05, .12, on), lerp(.25, 1.35, on) * fl, col3('#ffc078'));
    S.key.intensity = lerp(.4, .75, on); S.amb.intensity = lerp(.1, .2, on);
    Lm.set({ x: -.022, y: -.052, a: 1.05 + bob(t, 1.3, .02) });
    baby.position.set(.031, .036, .0002); baby.rotation.z = .05;
    C.set({ x: .062, y: -.0555, look: -.9, lookY: lerp(-.1, .1, on), blink: blink(t, 2.6), k: lerp(.7, 1.1, on) });
    this._f = fsOf(S, -.07);
  }, post() { return { focus: this._f, aper: 8, maxCoc: 7, bloom: blo(.4, 1.0) }; }, grade() { return { vig: .55, sat: 1.04 }; } };
}

// —— S5 the ark far away: Noah at work; on the horizon the hull rises plank by plank; the first clouds come in. Tilt up ——
export function S5(E) {
  const { H } = E;
  const P = PAL.morn, Q = PAL.grey;
  const S = stage({ light: [.02, .04, -.1], lightR: .26, lightCol: P.light, key: 1.2, keyCol: P.key, amb: .36, ambCol: P.amb, floor: .45 });
  skyOf(S, P.sky); const skyB = skyOf(S, Q.sky, { z: -.1595 }); skyB.material.transparent = true; skyB.material.opacity = 0;
  const clouds = [[-.152, '#a49aa6', .1, 8], [-.147, '#7e7480', .12, 9]].map(([z, c, y, sd]) => ({ m: cloudBank(S, { z, col: c, y, w: .5, n: 14, r: .016, thick: .3, seed: sd, trans: .5 }), y }));
  const far = hills(S, { z: -.14, col: P.far, base: -.032, peaks: [[-.1, .035, .045], [.11, .03, .05]], trans: .55 });
  const A = arca(S.U, { L: .052, h: .011, z: -.132, col: '#4a3a32', planks: 8 }); A.g.position.set(.006, -.031, -.132); S.scene.add(A.g);
  const y0 = [...A.strips, A.roof, A.win].map(m => m.position.y);
  const mid = land(S, { z: -.125, col: P.mid, base: -.031, amp: .002, len: .2, ph: .5, trans: .3 });
  const ground = land(S, { z: -.095, col: P.ground, base: -.0505, amp: .003, len: .16, ph: 2.2, trans: .12 });
  const N = human(S.U, { h: .078, z: -.085, col: P.fig, rim: .7 }); S.scene.add(N.g);
  lay(S, { w: .06, h: .01, x: -.03, y: -.0488, z: -.0855, col: '#1a120c', trans: .05, ppm: 4000, finish: { rim: .5 }, draw: c => { c.fillRect(-.028, -.002, .056, .004); c.fillRect(-.024, -.0045, .003, .003); c.fillRect(.022, -.0045, .003, .003); } });   // a beam on two trestles
  land(S, { z: -.062, col: '#1e1612', base: -.054, amp: .005, len: .12, ph: 4.4, trans: .08, w: .5 });
  const C = clawd(S.U, { u: .0022, z: -.058 }); S.scene.add(C.g);
  const fr = front(S, P.front);
  const plank = i => H.seiscientos - .55 + i * .25;
  return { S, update(t) {
    const k = ss(seg(t, H.l05b - .2, E.T0 + E.dur)); this._k = k;
    skyB.material.opacity = k;
    tint(far, mixc(P.far, Q.far, k)); tint(mid, mixc(P.mid, Q.mid, k)); tint(ground, mixc(P.ground, Q.ground, k)); tint(fr.m, mixc(P.front, Q.front, k));
    S.key.color.copy(col3(P.key).lerp(col3(Q.key), k)); S.amb.color.copy(col3(P.amb).lerp(col3(Q.amb), k));
    const tilt = eio(seg(t, H.l05b - .4, E.T0 + E.dur + .3)), cz = .62, cy0 = camY(cz, -.054, -.06, .4), cx = .004;
    aim(S.cam, [cx, cy0 + .004 * tilt, cz, cx, cy0 + .03 * tilt, -.08], t, { hand: .0004 });
    fr.follow();
    clouds.forEach((c, i) => { c.m.position.y = c.m.userData.y0 ?? (c.m.userData.y0 = c.m.position.y); c.m.position.y = c.m.userData.y0 + lerp(.12, .0 - i * .01, ss(seg(t, E.T0 + .2 + i * .3, E.T0 + E.dur + .2))); c.m.position.x = bob(t, .2, .01, i); });
    A.strips.forEach((m, i) => { const r = eio(seg(t, plank(i), plank(i) + .45)); m.position.y = y0[i] - (1 - r) * .02; });
    const roof = ss(seg(t, plank(8) + .1, plank(8) + .55)); A.roof.position.y = y0[8] - (1 - roof) * .02; A.win.position.y = y0[9] - (1 - roof) * .02; glowK(A.win, 0);
    const hit = Math.max(0, Math.sin(t * 5.4));
    N.set({ x: -.062, y: -.0505, a: .7 + hit * 1.5 });
    const look = ss(seg(t, H.diluvio - .3, H.diluvio + .3));
    C.set({ x: .062, y: -.0505, look: lerp(-.6, -.3, look), lookY: lerp(.5, 1, look), blink: blink(t, 3), k: 1.1, tuck: .1 });
    setL(S, 0, .02, .26, lerp(1.1, .8, k), col3(P.light).lerp(col3(Q.light), k));
    this._f = fsOf(S, -.07);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 7, bloom: blo(.3, 1.1) }; }, grade() { return { vig: .4, sat: lerp(1.02, .92, this._k ?? 0) }; } };
}

// —— S6 the signature shot: the whole road in depth. Methuselah's tent, Lamech's tent, the ark on the horizon; three windows light on the sum.
// Silence 1: everything goes down until only Methuselah's window is left ——
export function S6(E) {
  const { H } = E;
  const P = PAL.grey;
  const S = stage({ light: [0, .02, -.1], lightR: .3, lightCol: P.light, key: 1.1, keyCol: P.key, amb: .34, ambCol: P.amb, floor: .4 });
  const sky = skyOf(S, P.sky);
  const cl = cloudBank(S, { z: -.155, col: '#a89ea8', y: .075, w: .6, n: 14, r: .026, thick: .3, seed: 21, trans: .6 });
  const cl2 = cloudBank(S, { z: -.153, col: '#8a808c', y: .11, w: .6, n: 12, r: .03, thick: .3, seed: 22, trans: .5 });
  const far = land(S, { z: -.15, col: P.far, base: -.024, amp: .004, len: .25, ph: .2, trans: .5, notch: [.004, -.0215, -.06, .003, .016] });
  const A = arca(S.U, { L: .06, h: .012, z: -.146, col: '#3a3440', glow: 3 }); A.g.position.set(.004, -.0225, -.146); S.scene.add(A.g);
  const l2 = land(S, { z: -.132, col: '#7c7280', base: -.033, amp: .003, len: .2, ph: 1.4, trans: .35, notch: [.002, -.031, -.08, .008, .03] });
  const tB = tienda(S.U, { w: .05, h: .03, z: -.12, col: '#4a424c', win: [-.25, .42], glow: 3, seed: 8 }); tB.position.set(.05, -.038, -.12); S.add(tB);
  const l3 = land(S, { z: -.11, col: '#5a525c', base: -.0415, amp: .003, len: .18, ph: 2.6, trans: .25, notch: [0, -.04, -.09, .014, .04] });
  const tA = tienda(S.U, { w: .056, h: .034, z: -.1, col: '#3a343e', win: [.27, .42], glow: 3, seed: 3 }); tA.position.set(-.05, -.047, -.1); S.add(tA);
  const l4 = land(S, { z: -.088, col: P.ground, base: -.05, amp: .0025, len: .16, ph: .9, trans: .12, notch: [0, -.049, -.1, .026, .07] });
  const C = clawd(S.U, { u: .0024, z: -.075 }); S.scene.add(C.g);
  const fr = front(S, P.front);
  const lays = [[cl, '#a89ea8'], [cl2, '#8a808c'], [far, P.far], [l2, '#7c7280'], [tB, '#4a424c'], [l3, '#5a525c'], [tA, '#3a343e'], [l4, P.ground]];
  const on = (t, h) => ss(seg(t, h - .08, h + .22));
  return { S, update(t) {
    const cr = eio(seg(t, E.T0, H.l06b - .1));
    const cz = lerp(.42, .56, cr), ty = lerp(camY(.42, -.052, -.075, .37), -.006, cr), py = ty + .022 * cr;
    aim(S.cam, [.0, py, cz, 0, ty, -.08], t, { hand: .0004 * (1 - ss(seg(t, H.sil1 - .3, H.sil1))) });
    fr.follow();
    const kA = on(t, H.suma187), kB = on(t, H.suma182), kC = on(t, H.suma600);
    const dim = ss(seg(t, H.sil1 + .05, H.sil1 + .8));
    glowK(tA, kA); glowK(tB, kB * (1 - dim)); glowK(A.win, kC * (1 - ss(seg(t, H.sil1 + .3, H.sil1 + .9))));
    tA.material.emissiveIntensity = 3 * (.93 + .07 * vnoise(t * 5));
    sky.material.color.setScalar(lerp(1, .22, dim));
    lays.forEach(([m, c], i) => tint(m, mixc(c, '#141018', dim * (.7 + .03 * i))));
    setL(S, lerp(0, -.05, dim), lerp(.02, -.035, dim), lerp(.3, .1, dim), lerp(1, .55, dim));
    S.key.intensity = lerp(1.1, .35, dim); S.amb.intensity = lerp(.34, .1, dim);
    // Clawd points at each light as it comes on: anticipation, action, rest
    const p1 = ss(seg(t, H.suma187 - .15, H.suma187 + .2)) * (1 - ss(seg(t, H.suma182 - .4, H.suma182 - .1)));
    const p2 = ss(seg(t, H.suma182 - .15, H.suma182 + .2)) * (1 - ss(seg(t, H.suma600 - .25, H.suma600 - .05)));
    const p3 = ss(seg(t, H.suma600 - .12, H.suma600 + .25)) * (1 - ss(seg(t, H.sil1 + .1, H.sil1 + .7)));
    const dip = Math.max(...[H.suma187, H.suma182, H.suma600].map(h => Math.sin(Math.PI * clamp(seg(t, h - .35, h - .1))))) * .25;
    C.set({ x: 0, y: -.052, tuck: dip, aL: p1 * 1.7 + p3 * 2.1, aR: p2 * 1.7 + p3 * 2.1, look: clamp(-.9 * p1 + .9 * p2 - .9 * dim, -1, 1), lookY: .35 + .5 * p3 - .2 * dim, blink: blink(t, 3.2), k: lerp(1.1, .8, dim) });
    this._f = fsOf(S, -.075);
  }, post() { return { focus: this._f, aper: 4, maxCoc: 5, bloom: blo(.38, 1.0) }; }, grade() { return { vig: .5, sat: .95 }; } };
}

// —— S7 the empty stone: the frame of S1 under a covered sky; the staff leans on the stone, the window is dark. Tilt up to the clouds ——
export function S7(E) {
  const { H } = E;
  const P = PAL.storm;
  const S = stage({ light: [0, .04, -.1], lightR: .26, lightCol: P.light, key: 1.1, keyCol: P.key, amb: .4, ambCol: P.amb, floor: .38 });
  const B = puerta(S, P);
  const banks = [[-.155, '#5a5270', .022, 31, .3], [-.15, '#433c55', .05, 32, .3], [-.145, '#2e2a3c', .085, 33, .3]].map(([z, c, y, sd, th], i) => cloudBank(S, { z, col: c, y, w: .5, n: 12, r: .022 + i * .004, thick: th, seed: sd, trans: .4 }));
  const by = banks.map(b => b.position.y);
  const st = cayado(S.U, { L: .072, z: -.0745, col: P.fig, rim: .5 }); st.position.set(MX + .02, G - .002, -.0745); st.rotation.z = .32; S.add(st);
  const C = clawd(S.U, { u: .0027, z: -.068 }); S.scene.add(C.g);
  glowK(B.L.tent, 0);
  return { S, update(t) {
    const tilt = eio(seg(t, H.mismo_ano - .2, H.mismo_ano + 1.6)), cz = .6, cx = .008, cy = camY(cz, G, -.07, .42);
    aim(S.cam, [cx, cy + .006 * tilt, cz, cx, cy + .036 * tilt, -.08], t, { hand: .0003 });
    B.fr.follow(.26);
    banks.forEach((b, i) => { b.position.y = by[i] + bob(t, .3, .002, i) - .006 * (i + 1) * ss(seg(t, E.T0, E.T0 + E.dur)); b.position.x = bob(t, .15, .006, i * 2); });
    setL(S, MX + .01, G + .03, .11, lerp(1.5, 1.1, tilt));
    C.set({ x: CX, y: G + .006, tuck: .8, look: -1, lookY: lerp(-.3, .5, tilt), aL: 0, aR: 0, blink: blink(t, 3.6, .2), k: .5 });
    this._f = fsOf(S, -.07);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 6, bloom: blo(.28, 1.15) }; }, grade() { return { vig: .55, sat: .9 }; } };
}

// —— S8 the rain: three striped sheets slide; the ark in the middle ground on rising water, its window lit. Silence 2: the box goes out layer by layer ——
export function S8(E) {
  const { H } = E;
  const P = PAL.storm;
  const S = stage({ light: [.01, -.01, -.1], lightR: .22, lightCol: P.light, key: .8, keyCol: P.key, amb: .24, ambCol: P.amb, floor: .3 });
  const sky = skyOf(S, P.sky);
  const bank = cloudBank(S, { z: -.15, col: '#2a2632', y: .03, w: .5, n: 16, r: .018, thick: .3, seed: 41, trans: .4 });
  const r1 = rain(S.U, { w: .3, h: .3, z: -.14, n: 200, len: .024, lw: .0008, col: '#8a8494', speed: .45, x: 0, y: -.12, seed: 2 }); S.add(r1);
  const far = hills(S, { z: -.132, col: P.far, base: -.048, peaks: [[-.09, .03, .045], [.1, .022, .04]], trans: .4 });
  const A = arca(S.U, { L: .11, h: .024, z: -.112, col: '#1c1820', glow: 3 }); S.scene.add(A.g);
  const wave = (z, col, ph, base) => lay(S, { w: .6, h: .3, y: -.15, z, col, trans: .25, ppm: 1600, finish: { rim: .55 }, draw: c => { c.translate(0, .15); waveFill(c, { x0: -.3, x1: .3, base, amp: .003, len: .07, ph, peak: 1.6 }); } });
  const w1 = wave(-.106, '#3a3446', 1, 0), w2 = wave(-.096, '#2a2634', 2.6, -.004);
  const r2 = rain(S.U, { w: .25, h: .25, z: -.09, n: 120, len: .026, lw: .001, col: '#8a8494', speed: .65, x: 0, y: -.1, seed: 5 }); S.add(r2);
  const rock = hills(S, { z: -.068, col: '#0e0c12', base: -.075, peaks: [[-.05, .042, .028], [-.015, .012, .02]], trans: .05, w: .4, ph: 3 });
  const C = clawd(S.U, { u: .0024, z: -.064 }); S.scene.add(C.g);
  const r3 = rain(S.U, { w: .2, h: .2, z: -.045, n: 45, len: .03, lw: .0012, col: '#6a6474', speed: .85, x: 0, y: -.07, seed: 8 }); S.add(r3);
  const fr = front(S, P.front);
  const order = [[sky, null], [bank, '#2a2632'], [r1, '#8a8494'], [far, P.far], [w1, '#3a3446'], [w2, '#2a2634'], [r2, '#8a8494'], [rock, '#0e0c12'], [r3, '#6a6474']];
  return { S, update(t) {
    const k = eio(seg(t, E.T0, H.sil2)), cz = lerp(.56, .6, k), cx = .0, cy = camY(cz, -.06, -.1, .32);
    aim(S.cam, [cx, cy, cz, cx, cy, -.08], t, { hand: .0004 * (1 - ss(seg(t, H.sil2 - .3, H.sil2))) });
    fr.follow();
    [r1, r2, r3].forEach(r => r.userData.set(t));
    const rise = eio(seg(t, E.T0, H.sil2 + .5)), wl = lerp(-.062, -.05, rise);
    w1.position.y = -.15 + wl + bob(t, 1.2, .0012); w2.position.y = -.15 + wl - .002 + bob(t, 1.5, .0014, 1);
    w1.position.x = bob(t, .6, .006); w2.position.x = bob(t, .7, .008, 2);
    A.g.position.set(.012, wl - .008 + bob(t, 1.1, .0012), -.112); A.g.rotation.z = bob(t, .9, .025);
    glowK(A.win, 1); A.win.material.emissiveIntensity = 3 * (.93 + .07 * vnoise(t * 5));
    // silence 2: each layer goes dark in turn, back to front
    order.forEach(([m, c], i) => { const d = ss(seg(t, H.sil2 - .15 + i * .14, H.sil2 + .25 + i * .14)); if (c) tint(m, mixc(c, '#050407', d)); else m.material.color.setScalar(1 - .92 * d); });
    const D = ss(seg(t, H.sil2 - .1, H.sil2 + 1.2));
    setL(S, .012, wl, lerp(.22, .05, D), lerp(.9, .25, D)); S.key.intensity = lerp(.8, .08, D); S.amb.intensity = lerp(.24, .03, D);
    C.set({ x: -.05, y: -.0335, back: true, tuck: .35, aL: 0, aR: 0, k: lerp(.6, .45, D) });
    this._f = fsOf(S, -.07);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 6, bloom: blo(.36, 1.0) }; }, grade() { return { vig: .6, sat: .92 }; } };
}

// —— S9 climax: from the point of the window the light is born; the cloud layers, each cut in halves, part from back to front; gold passes through ——
export function S9(E) {
  const { H } = E;
  const S = stage({ light: [.03, -.045, -.1], lightR: .06, lightCol: '#ffd98a', key: .1, keyCol: '#ffe6c0', amb: .03, ambCol: '#5a5468', floor: .03 });
  const gold = skyPanel({ w: .9, h: .8, z: -.16, gain: 1, stops: [[0, '#f0d8ac'], [.45, '#f8e6b4'], [.7, '#ffe9b8'], [1, '#f8e0a8']] }); S.add(gold);
  const sun = moon({ r: .006, x: .03, y: -.04, z: -.155, gain: 2.6, core: '#fffbe8', mid: '#ffeab0', edge: '#ffd98a', halo: 10, haloGain: .7 }); S.scene.add(sun);
  const rays = burst(.5, .55, '#ffd98a'); rays.position.set(.03, -.06, -.15); S.add(rays);   // the one burst() of the film
  const R = mulberry(77);
  const STORM = ['#2c2836', '#221e2a', '#18151e'], WARM = ['#e6c088', '#c89858', '#8a6232'];
  const pairs = [[-.14, .45], [-.125, .3], [-.11, .15]].map(([z, trans], i) => {
    const half = s => mk(S.U, { w: .33, h: .5, x: s * .16, y: .2, z, col: STORM[i], trans, ppm: 1500, shadow: i > 0, finish: { rim: .55, rimPx: 4, under: .35 }, draw: x => {
      const ex = -s * .16, ox = s * .165;
      x.beginPath(); x.moveTo(ox, -.25); x.lineTo(ox, .25); x.lineTo(ex, .25);
      for (let y = .25; y >= -.25; y -= .01) x.lineTo(ex - s * (.003 + Math.sin(y * 70 + i * 2) * .005 + (R() - .5) * .006), y);
      x.lineTo(ex, -.25); x.closePath(); x.fill();
      for (let k = 0; k < 9; k++) { x.beginPath(); x.arc(ex + s * (.005 + R() * .02), -.25 + R() * .5, .008 + R() * .01, 0, TAU); x.fill(); }
    } });
    const L = half(-1), Rr = half(1); S.add(L, Rr); return { L, R: Rr, i };
  });
  const water = land(S, { z: -.1, col: '#100e14', base: -.05, amp: .003, len: .07, ph: 1, trans: .1, w: .6 });
  const A = arca(S.U, { L: .05, h: .011, z: -.104, col: '#0c0a0e', glow: 3.4 }); A.g.position.set(.03, -.054, -.104); S.scene.add(A.g);
  const rock = hills(S, { z: -.072, col: '#0a080c', base: -.07, peaks: [[0, .014, .05]], trans: .05, w: .5 });
  const C = clawd(S.U, { u: .0026, z: -.066 }); S.scene.add(C.g);
  const fr = front(S, '#050407');
  const RB = [[water, '#100e14', '#7a5a34'], [rock, '#0a080c', '#2a1a0c'], [fr.m, '#050407', '#1f140a']];
  return { S, update(t) {
    const d = H.dios, en = H.entera;
    const k = eio(seg(t, E.T0, E.T0 + E.dur + .3)), cz = lerp(.5, .41, k), cy = camY(cz, -.056, -.066, .34);
    aim(S.cam, [0, cy, cz, 0, cy, -.08], t, { hand: .0004 });
    fr.follow();
    const grow = ss(seg(t, d - .1, d + .8)), full = ss(seg(t, d + .6, en + .1)), climax = ss(seg(t, en - .3, en + .3));
    const o = i => eio(seg(t, d + .25 + i * .25, d + 1.15 + i * .25));
    pairs.forEach(p => { const w = .002 + o(p.i) * (.06 + p.i * .022); p.L.position.x = -.16 - w; p.R.position.x = .16 + w; const hot = ss(seg(t, d + .3 + p.i * .25, d + 1.1 + p.i * .25)); const c = mixc(STORM[p.i], WARM[p.i], hot); tint(p.L, c); tint(p.R, c); });
    gold.material.color.setScalar(.04 + .35 * grow + .75 * full);
    setMoon(sun, .5 + .9 * grow); sun.scale.setScalar(1 + 3 * grow + 3 * full);
    rays.userData.set(.1 * grow + .55 * full + .55 * climax * (1 - .4 * ss(seg(t, en + .3, en + 1.2))));
    glowK(A.win, 1); A.win.material.emissiveIntensity = 3.4;
    setL(S, .03, -.045, lerp(.06, .14, grow) + .22 * full, lerp(.6, 1, grow) + .6 * full, col3('#ffd98a'));
    S.U.uFloor.value = lerp(.03, .35, full); S.key.intensity = lerp(.1, 1.4, full); S.amb.intensity = lerp(.03, .32, full); S.amb.color.copy(col3('#5a5468').lerp(col3('#c8a07a'), full));
    RB.forEach(([m, a, b]) => tint(m, mixc(a, b, full)));
    const up = ss(seg(t, d + .5, en + .2)), pre = Math.sin(Math.PI * seg(t, d + .1, d + .55)) * .3;
    C.set({ x: -.016, y: -.0575, look: lerp(.7, 0, up), lookY: lerp(-.3, 1, up), tuck: .3 * (1 - up) + pre * .4, aL: up * 2.25 + bob(t, 2, .05) * up, aR: up * 2.25 - bob(t, 2, .05) * up, blink: lerp(.6, 1, up), k: lerp(.5, 1.3, full) });
    this._full = full; this._f = fsOf(S, -.066);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 7, bloom: blo(lerp(.32, .45, this._full), 1.0) }; }, grade() { return { vig: lerp(.62, .34, this._full), sat: 1.04, expo: lerp(.85, 1, this._full) }; } };
}

// —— S10 the ark in gold: at rest on calm, shining water; the window still lit. Rack focus from Clawd to the ark, then a slow dolly back ——
export function S10(E) {
  const { H } = E;
  const P = PAL.gold;
  const S = stage({ light: [.02, -.01, -.1], lightR: .3, lightCol: P.light, key: 1.45, keyCol: P.key, amb: .4, ambCol: P.amb, floor: .55 });
  skyOf(S, P.sky);
  const sun = moon({ r: .012, x: .05, y: .03, z: -.152, gain: 2.2, core: P.sun[0], mid: P.sun[1], edge: P.sun[2], halo: 9, haloGain: .55 }); S.scene.add(sun);
  hills(S, { z: -.14, col: P.far, base: -.036, peaks: [[-.1, .04, .05], [.13, .035, .05]], trans: .5 });
  hills(S, { z: -.126, col: P.mid, base: -.046, peaks: [[-.06, .02, .04], [.1, .016, .04]], trans: .3, ph: 2 });
  const A = arca(S.U, { L: .11, h: .024, z: -.113, col: '#3a2412', glow: 3 }); A.g.position.set(.018, -.056, -.113); S.scene.add(A.g);
  const water = lay(S, { w: .6, h: .3, y: -.2, z: -.106, col: '#a07040', trans: .35, ppm: 1600, finish: { rim: .6 }, draw: c => { c.translate(0, .2); waveFill(c, { x0: -.3, x1: .3, base: -.053, amp: .0012, len: .08, ph: 1, peak: 1.4 }); },
    });
  hills(S, { z: -.064, col: '#20140a', base: -.08, peaks: [[-.055, .036, .03], [-.022, .01, .02]], trans: .05, w: .4, ph: 1 });
  const C = clawd(S.U, { u: .0026, z: -.06 }); S.scene.add(C.g);
  const fr = front(S, P.front);
  return { S, update(t) {
    const k = eio(seg(t, E.T0 + .6, E.T0 + E.dur + .3)), cz = lerp(.52, .6, k), cx = lerp(-.008, .002, k), cy = camY(cz, -.055, -.1, .34);
    aim(S.cam, [cx, cy, cz, cx, cy, -.08], t, { hand: .0004 });
    fr.follow();
    A.g.position.y = -.056 + bob(t, .9, .0006); A.g.rotation.z = bob(t, .7, .006);
    glowK(A.win, 1); A.win.material.emissiveIntensity = 3 * (.94 + .06 * vnoise(t * 4));
    setL(S, .03, .0, .3, 1.35);
    C.set({ x: -.045, y: -.046, tuck: .5, look: .8, lookY: .1, blink: blink(t, 3.4), k: 1 });
    const rf = ss(seg(t, H.paciencia + .1, H.paciencia + 1.1));
    this._f = lerp(fsOf(S, -.06), fsOf(S, -.113), rf);
  }, post() { return { focus: this._f, aper: 9, maxCoc: 7, bloom: blo(.36, 1.1) }; }, grade() { return { vig: .34, sat: 1.02 }; } };
}

// —— S11 the echo: the frame of S1 at a golden dawn; both stones, puddles shining, the sun rising where it set, the ark tiny on the horizon.
// Dolly in to Clawd; he turns to us on «te espera» and lifts an arm on «una palabra» ——
export function S11(E) {
  const { H } = E;
  const P = PAL.gold;
  const S = stage({ light: [.078, -.01, -.1], lightR: .26, lightCol: P.light, key: 1.45, keyCol: P.key, amb: .42, ambCol: P.amb, floor: .55 });
  const B = puerta(S, P, { ark: true, puddles: true });
  glowK(B.L.tent, 0); glowK(B.L.ark.win, 1); B.L.ark.win.material.emissiveIntensity = 2.4;
  const C = clawd(S.U, { u: .0028, z: -.068, glow: .45 }); S.scene.add(C.g);
  return { S, update(t) {
    const k = eio(seg(t, E.T0, H.cta + 1.2)), cz = lerp(.62, .44, k), cx = lerp(.008, .028, k), cy = camY(cz, G, -.068, lerp(.36, .38, k));
    aim(S.cam, [cx, cy, cz, cx, cy, -.08], t, { hand: .0004 });
    B.fr.follow();
    if (B.sun) { const s = eo(seg(t, E.T0, E.T0 + E.dur)); B.sun.position.set(.078, lerp(-.032, -.008, s), -.152); setMoon(B.sun, lerp(.9, 1.15, s)); }
    setL(S, .078, -.01, .26, 1.3);
    const tb = H.espera - .15, sq = 1 - .8 * Math.max(0, 1 - Math.abs(t - tb) / .12), turned = ss(seg(t, tb - .05, tb + .1));
    const w = H.palabra - .15, up = ss(seg(t, w - .1, w + .35)), wave = t > w ? Math.sin((t - w) * 7) * .35 * ss(seg(t, w, w + .3)) : 0;
    C.set({ x: CX, y: G + .006, tuck: .55, look: lerp(.85, 0, turned), lookY: lerp(.3, 0, turned), aR: up * 2.1 + wave, aL: 0, blink: blink(t, 2.8, .3), k: 1 });
    C.g.scale.x = sq;
    this._f = fsOf(S, -.068);
  }, post() { return { focus: this._f, aper: 8, maxCoc: 7, bloom: blo(.36, 1.08) }; }, grade() { return { vig: .36, sat: 1.03 }; } };
}
