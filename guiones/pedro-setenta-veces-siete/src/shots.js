// The twelve shots of «La deuda perdonada» (Mateo 18:21–35). Each: { S, update(t), post(), grade() }; t in film seconds.
// Jesús, Pedro, the king and the servants are quiet silhouettes; God is never a figure (the window light of the parable and the dawn are only light).
// Clawd is a witness inside every frame: he counts with his paws (S1–S2), measures the heap (S5), compares himself with the pouch (S9) and otherwise
// stands still. He never touches the coins, the pouch, the bars or anyone. Nothing is written in the picture: the count is in the paws, the coins are plain discs.
// Colour: small gold (the lamp) -> dark violet hall -> gold (the pardon) -> ink-grey street and prison -> cold hall -> gold dawn. Layers are tinted warm under gold.
// CPU budget (swiftshader): about 9 layers per shot, no particles, one burst() in the whole film (S7), maxCoc <= 8, bloom <= .45.
import * as THREE from 'three';
import { skyPanel, moon, setMoon, text, burst } from './paper.js';
import { stage, aim } from './stage.js';
import { seg, ss, eio, eo, lerp, clamp, TAU, mulberry } from './lib.js';
import { mk, cut, tint, clawd, human, figures, lamp, heap, pouch, bars } from './actors.js';

const blo = (s = .3, th = 1.1) => ({ strength: Math.min(s, .45), radius: .55, threshold: th });
const lay = (S, o) => S.add(mk(S.U, o));
const col3 = c => new THREE.Color(c);
const mixHex = (a, b, k) => '#' + col3(a).lerp(col3(b), clamp(k)).getHexString();
const setL = (S, x, y, r, lit, c) => { S.U.uLight.value.x = x; S.U.uLight.value.y = y; S.U.uLightR.value = r; S.U.uLit.value = lit; if (c) S.U.uLightCol.value.copy(typeof c === 'string' ? col3(c) : c); };
const bob = (t, f, a, p = 0) => Math.sin(t * f + p) * a;
const blinkAt = (t, per = 3.3, ph = 0) => 1 - .9 * Math.max(0, 1 - Math.abs(((t + ph) % per) - .1) / .1);
const fsOf = (S, z) => S.cam.position.z - z;
const HH = (cz, z) => .4617 * (cz - z) / 2;      // half the visible height at depth z
const walkY = (t, f = 5.2, a = .0006) => Math.abs(Math.sin(t * f)) * a;
export const GROUND = -.05, BACK = -.042;        // front floor line (Clawd) and the raised back floor of the house (the people)

// A sheet drawn in world coordinates over the box [x0,x1]×[y0,y1]
function wsheet(S, o) {
  const cx = (o.x0 + o.x1) / 2, cy = (o.y0 + o.y1) / 2;
  return lay(S, { w: o.x1 - o.x0, h: o.y1 - o.y0, x: cx, y: cy, z: o.z, col: o.col, trans: o.trans ?? .1, ppm: o.ppm ?? 1800, shadow: o.shadow, recv: o.recv, finish: o.finish ?? { rim: .45, under: .3 },
    draw: x => { x.translate(-cx, -cy); o.draw(x); }, glowDraw: o.glowDraw ? x => { x.translate(-cx, -cy); o.glowDraw(x); } : undefined, glow: o.glow, glowCol: o.glowCol, glowRes: o.glowRes });
}
const ragged = (x, x0, x1, y, amp = .0012, f = 60, y0 = -.4) => { x.beginPath(); x.moveTo(x0, y0); for (let u = x0; u <= x1 + 1e-6; u += .0015) x.lineTo(u, y + amp * Math.sin(u * f + 1.3) + amp * .6 * Math.sin(u * f * 2.7)); x.lineTo(x1, y0); x.closePath(); x.fill(); };
const arch = (x, cx, y0, w, h) => { x.fillRect(cx - w / 2, y0, w, h - w / 2); x.beginPath(); x.arc(cx, y0 + h - w / 2, w / 2, 0, TAU); x.fill(); };

// —— palettes ——
export const PAL = {
  night: { sky: [[0, '#120f24'], [1, '#1d1838']], far: '#4a4068', plat: '#2e2744', mid: '#28223c', front: '#0c0a16', fig: '#07060c',
    light: '#ffcf86', key: .8, keyCol: '#ffd9a8', amb: .36, ambCol: '#6a5e88', floor: .32 },
  dawn: { sky: [[0, '#fff0cc'], [1, '#ffe2a6']], skyGain: 1.5, far: '#e2c690', plat: '#5a4026', mid: '#a07a46', front: '#3e2a16', fig: '#1c1108',
    light: '#ffe2a6', key: 1.6, keyCol: '#ffe8c4', amb: .5, ambCol: '#d0ae80', floor: .45 },
  hall: { win: [[0, '#e9dcc0'], [1, '#d8c8a8']], far: '#524866', mid: '#3a3248', floorc: '#262032', front: '#0e0b14', fig: '#08060c', shut: '#120e18',
    light: '#e9dcc0', key: 1.0, keyCol: '#d8cce0', amb: .4, ambCol: '#7a7090', floor: .34 },
  gold: { win: [[0, '#fff2c8'], [1, '#ffd98a']], far: '#e6c27a', mid: '#b98f4e', floorc: '#5a3e1e', front: '#2a1a0e', fig: '#1c1108', shut: '#3a2410',
    light: '#ffd98a', key: 1.7, keyCol: '#ffe6c0', amb: .5, ambCol: '#cfae86', floor: .5 },
  cold: { win: [[0, '#f6f1e6'], [1, '#efe8da']], far: '#5a5462', mid: '#3a3640', floorc: '#28242c', front: '#0e0c12', fig: '#08070a', shut: '#141218',
    light: '#efe8da', key: 1.0, keyCol: '#e8e4dc', amb: .38, ambCol: '#86808e', floor: .34 },
  street: { sky: [[0, '#2a2832'], [.6, '#3a3742'], [1, '#4a4654']], far: '#5a5664', mid: '#34303c', front: '#08070a', fig: '#060508',
    light: '#e8e4dc', key: .7, keyCol: '#dcd8d0', amb: .34, ambCol: '#706c78', floor: .3 },
};
export const pstage = (P, o = {}) => stage({ light: [0, .1, -.1], lightR: .3, lightCol: P.light, key: P.key, keyCol: P.keyCol, keyPos: [-.02, .5, .1], keyTarget: [0, -.06, -.08], keyAngle: .62,
  amb: P.amb, ambCol: P.ambCol, floor: P.floor, shadowR: 4, ...o });
const LIFT = [.012, .007, 0];   // warm shadows (the default lift is bluish)
const G_NIGHT = { vig: .5, sat: .95, contrast: .12, lift: [.006, .003, .008] };
const G_HALL = { vig: .52, sat: .9, contrast: .14, lift: [.006, .003, .008] };
const G_STREET = { vig: .58, sat: .8, contrast: .16, lift: [.004, .003, .004] };
const G_GOLD = { vig: .42, sat: 1.04, contrast: .12, gain: [1.04, 1, .93], lift: LIFT };

// The paper title: a dark plate with light (emissive) letters, anchored to the camera at the top of the frame; it opens from its centre
function titleStrip(S) {
  const words = x => { text(x, 'LA DEUDA PERDONADA', 0, .0062, .0088, 'Cinzel', { weight: 800, fill: '#fff' }); x.fillStyle = '#fff'; x.fillRect(-.02, -.0028, .04, .0005); text(x, 'Mateo 18:21–35', 0, -.0115, .0086, 'Playfair', { weight: 'italic 500', fill: '#fff' }); };
  const m = lay(S, { w: .136, h: .05, z: -.01, col: '#16122a', trans: .05, shadow: false, recv: false, ppm: 9000, finish: { rim: .6, under: .2 }, draw: x => {
    x.beginPath(); x.roundRect(-.064, -.022, .128, .044, .002); x.fill();
  }, glowDraw: words, glow: 2.4, glowCol: '#ffe6b0', glowRes: 1 });
  return { m, update(t, t0, t1, dx = 0) {
    const reveal = ss(seg(t, t0, t0 + .45)) * (1 - ss(seg(t, t1 - .45, t1)));
    const c = S.cam.position, ts = (c.z + .01) / .6;
    m.scale.setScalar(ts); m.position.x = c.x + dx; m.position.y = c.y + HH(c.z, -.01) * .62;
    m.material.userData.u.uClip.value.set(m.position.x, m.position.y, .075 * reveal * ts, 0); m.visible = reveal > .002;
  } };
}

// A soft additive glow (the lamp's halo, the window slit): a moon disc kept hidden, only its halo shows
function glowOrb(S, { x, y, z = -.15, r = .012, col = '#f4efe0', halo = 14, gain = 0 }) {
  const m = moon({ r, x, y, z, gain: 0, core: '#ffffff', mid: '#fffaf0', edge: '#fff4e0', halo, haloGain: 1, haloCol: col }); S.scene.add(m);
  m.userData.set = (k, c = col) => { m.userData.disc.material.color.setScalar(gain * k); m.userData.halo.material.color.set(c).multiplyScalar(k); };
  m.userData.disc.visible = gain > 0; m.userData.set(0); return m;
}

// —— the cast ——
export const CLAWD = (S, o = {}) => { const C = clawd(S.U, { u: .0024, z: -.05, glow: .42, ...o }); S.scene.add(C.g); return C; };
export const PERSON = (S, P, o = {}) => { const F = human(S.U, { h: .082, z: -.08, pose: 'stand', col: P.fig, rim: .7, ...o }); S.scene.add(F.g); return F; };

// Clawd's counting paws: each tap is a paw that goes up and comes down exactly on the tap time (the harp note in mix.py).
// Taps alternate left/right; in the broken count (S2) the other paw comes in half a beat late and the count tangles.
function paws(t, taps, { up = 1.6, w = .2, tangle = false } = {}) {
  let aL = 0, aR = 0, b = 0;
  taps.forEach((tk, i) => {
    const wi = tangle && i > 0 ? Math.min(w, (tk - taps[i - 1]) * 1.1) : w, p = Math.sin(Math.PI * seg(t, tk - wi, tk));
    if (i % 2) aL = Math.max(aL, p * up); else aR = Math.max(aR, p * up);
    if (tangle) { const q = Math.sin(Math.PI * seg(t, tk - wi * .5, tk + wi * .5)) * .7; if (i % 2) aR = Math.max(aR, q * up); else aL = Math.max(aL, q * up); }
    b = Math.max(b, p);
  });
  return { aL, aR, b };
}
const tapList = (H, k, n) => Array.from({ length: n }, (_, i) => H[`${k}${i + 1}`]);

// —— the house in Capernaum (S1–S3, S12): back wall with a small window (and at dawn, the open door), two disciples in shadow,
// the raised floor, a low table with the clay lamp, the dark front floor. Same framing at night and at dawn.
const TABLE_X = -.004, TABLE_TOP = BACK + .018;
export function house(S, P, o = {}) {
  const dawn = !!o.dawn;
  const sky = skyPanel({ w: .7, h: .5, y: .04, z: -.17, stops: P.sky, stars: dawn ? 0 : 90, seed: 4, gain: P.skyGain ?? 1 }); S.add(sky);
  const WX = .048, WY = .03, DX = -.072;
  const wall = wsheet(S, { x0: -.35, x1: .35, y0: -.2, y1: .3, z: -.14, col: P.far, trans: .45, ppm: 1500, finish: { rim: .3, under: .3 }, draw: x => {
    x.fillRect(-.35, -.2, .7, .5);
    cut(x, () => { arch(x, WX, WY, .02, .03); if (dawn) arch(x, DX, BACK - .01, .03, .085); });
    x.fillRect(WX - .0006, WY, .0012, .022); x.fillRect(WX - .011, WY + .012, .022, .0012);   // the window's cross bars
  } });
  const disc = figures(S.U, { list: [{ x: -.06, h: .056, pose: 'sit' }, { x: .064, h: .054, pose: 'sit', flip: true, veil: true }], z: -.118, col: dawn ? '#6a4c2c' : '#17131f', rim: .5 });
  disc.position.y = BACK; S.scene.add(disc);
  const plat = wsheet(S, { x0: -.35, x1: .35, y0: -.2, y1: BACK + .002, z: -.1, col: P.plat, trans: .08, ppm: 1800, finish: { rim: .55, rimPx: 4, under: .3 }, draw: x => ragged(x, -.35, .35, BACK, .0006, 80, -.2) });
  const tcol = dawn ? '#24160a' : '#0e0b14';
  const table = wsheet(S, { x0: TABLE_X - .024, x1: TABLE_X + .024, y0: BACK - .004, y1: TABLE_TOP + .002, z: -.087, col: tcol, trans: .05, ppm: 6000, finish: { rim: .6, rimPx: 4, under: .3 }, draw: x => {
    x.fillRect(TABLE_X - .022, TABLE_TOP - .003, .044, .003); x.fillRect(TABLE_X - .019, BACK - .004, .003, .019); x.fillRect(TABLE_X + .016, BACK - .004, .003, .019);
  } });
  const L = lamp(S.U, { s: .02, z: -.0855, col: tcol, smoke: dawn }); L.g.position.set(TABLE_X - .002, TABLE_TOP, -.0855); S.scene.add(L.g);
  const front = wsheet(S, { x0: -.35, x1: .35, y0: -.4, y1: GROUND + .004, z: -.04, col: P.front, trans: .03, ppm: 1800, finish: { rim: .55, rimPx: 4, under: .3 }, draw: x => ragged(x, -.35, .35, GROUND, .0012, 55) });
  const flame = { x: L.g.position.x + L.fx, y: TABLE_TOP + L.fy + .003 };
  return { sky, wall, disc, plat, table, lamp: L, front, flame, WX, WY, DX };
}
export const JESUS = (S, P, o = {}) => PERSON(S, P, { pose: 'sit', h: .086, z: -.082, rim: .8, ...o });
export const PEDRO = (S, P, o = {}) => PERSON(S, P, { h: .082, z: -.079, two: true, rim: .75, ...o });

// S1 the hook: night in the house. Pedro leans toward Jesús, one hand open; Jesús sits, still. A slow dolly in, already moving on frame 0.
// Clawd on the floor in front counts with his paws from frame 0: seven taps, the seventh on «siete». The paper title at the top.
export function S1(E) {
  const { H } = E;
  const P = PAL.night, S = pstage(P, { light: [0, 0, -.1], lightR: .06, lightCol: P.light });
  const Ho = house(S, P);
  const halo = glowOrb(S, { x: Ho.flame.x, y: Ho.flame.y, z: -.0852, r: .003, halo: 14, col: '#ffcf86' });
  const J = JESUS(S, P), Pe = PEDRO(S, P);
  const C = CLAWD(S, { u: .0027, z: -.05 });
  const title = titleStrip(S);
  const taps = tapList(H, 'tap', 7), s7 = H.siete1;
  return { S, update(t) {
    const k = seg(t, 0, E.dur), z = lerp(.53, .485, k), cx = lerp(.004, -.002, k);
    aim(S.cam, [cx, .002, z, cx, .0, -.08], t, { hand: .0004 });
    const fl = .06 * Math.sin(t * 13) * Math.sin(t * 5.3);
    setL(S, Ho.flame.x, Ho.flame.y + .01, .13 + .004 * fl, 1.6 + fl);
    Ho.lamp.set({ lit: 1 + fl, flick: fl }); halo.userData.set(.55 + fl);
    J.set({ x: .03, y: BACK, a: .3, rot: .02, flip: true });
    Pe.set({ x: -.044, y: BACK, a: lerp(.6, 1.15, ss(seg(t, .1, .9))), a2: .15, rot: -.07 });
    // the count: taps up to «siete», then both paws stay half up (seven!) with a little hop
    const c = paws(t, taps), hold = ss(seg(t, s7 + .05, s7 + .35)), hop = Math.sin(Math.PI * seg(t, s7 + .05, s7 + .3)) * .0012;
    C.set({ x: -.01, y: GROUND - .001 + c.b * .0009 + hop, aL: Math.max(c.aL, hold * .7), aR: Math.max(c.aR, hold * .7), look: lerp(-.7, .6, ss(seg(t, s7 + .4, s7 + .8))), blink: blinkAt(t, 2.7, .9), k: 1 });
    title.update(t, -.5, E.T0 + E.dur + .3);
    this._f = fsOf(S, -.07);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 6, bloom: blo(.34, 1.05) }; }, grade() { return G_NIGHT; } };
}

// S2 «setenta veces siete»: closer on Clawd, Jesús and Pedro soft behind. On «setenta» Clawd tries to go on: the taps speed up, the paws fall out of step;
// on the last «siete» both paws stay up, he stops, lowers them slowly and sits back. Rack focus Clawd -> Jesús -> Clawd.
export function S2(E) {
  const { H } = E;
  const P = PAL.night, S = pstage(P, { light: [0, 0, -.1], lightR: .06, lightCol: P.light });
  const Ho = house(S, P);
  const halo = glowOrb(S, { x: Ho.flame.x, y: Ho.flame.y, z: -.0852, r: .003, halo: 14, col: '#ffcf86' });
  const J = JESUS(S, P), Pe = PEDRO(S, P);
  const C = CLAWD(S, { u: .0031, z: -.05 });
  const fast = tapList(H, 'fast', 7), s2 = H.siete2;
  return { S, update(t) {
    const k = eio(seg(t, E.T0, E.T0 + E.dur)), z = lerp(.355, .33, k), cx = lerp(.008, .011, k);
    aim(S.cam, [cx, -.014, z, cx, -.016, -.08], t, { hand: .0004 });
    const fl = .06 * Math.sin(t * 13) * Math.sin(t * 5.3);
    setL(S, Ho.flame.x, Ho.flame.y + .01, .13, 1.6 + fl); Ho.lamp.set({ lit: 1 + fl, flick: fl }); halo.userData.set(.55 + fl);
    J.set({ x: .03, y: BACK, a: .3, rot: .02, flip: true });
    Pe.set({ x: -.044, y: BACK, a: lerp(1.15, .5, ss(seg(t, H.l02, H.l02 + .8))), a2: .15, rot: lerp(-.07, -.03, ss(seg(t, H.l02, H.l02 + .8))) });
    // holds «seven» -> drops the paws on «No siete» -> the count speeds up and tangles -> both paws up -> lowers them -> sits back
    const hold = .7 * (1 - ss(seg(t, H.l02b + .05, H.l02b + .35)));
    const c = paws(t, fast, { tangle: true, w: .18 });
    const up = ss(seg(t, s2 - .02, s2 + .15)) * (1 - ss(seg(t, H.rinde + .15, H.rinde + .75)));
    const sit = ss(seg(t, H.rinde + .55, H.rinde + .9));
    const shake = up * Math.sin(t * 40) * .05;
    C.set({ x: .026, y: GROUND - .001 + c.b * .0012, aL: Math.max(hold, c.aL, up * 2.2 + shake), aR: Math.max(hold, c.aR, up * 2.2 - shake), tuck: .42 * sit, rot: sit * .05,
      look: t < H.setenta - .1 ? .7 : lerp(.2, .8, sit), blink: t > H.rinde && t < H.rinde + .2 ? .2 : blinkAt(t, 2.6, .4), k: 1 });
    const rk = ss(seg(t, H.setenta - .3, H.setenta + .15)) * (1 - ss(seg(t, s2 + .1, s2 + .45)));
    this._f = lerp(fsOf(S, -.05), fsOf(S, -.082), rk);
  }, post() { return { focus: this._f, aper: 9, maxCoc: 7, bloom: blo(.34, 1.05) }; }, grade() { return G_NIGHT; } };
}

// S3 the flame: an insert of the lamp. The camera goes in toward the flame, which grows; the light rises to warm white and, as it falls,
// we are in the king's hall (the dissolve). Clawd stands and looks up at the flame; the light wraps him.
export function S3(E) {
  const { H } = E;
  const P = PAL.night, S = pstage(P, { light: [0, 0, -.1], lightR: .06, lightCol: P.light });
  const Ho = house(S, P);
  const halo = glowOrb(S, { x: Ho.flame.x, y: Ho.flame.y, z: -.0852, r: .003, halo: 14, col: '#ffd9a0' });
  const J = JESUS(S, P);
  const C = CLAWD(S, { u: .0022, z: -.05 });
  const T1 = E.T0 + E.dur;
  return { S, update(t) {
    const k = eio(seg(t, E.T0, T1 + .3)), z = lerp(.3, .17, k), cx = lerp(-.008, -.002, k), cy = lerp(-.018, -.022, k);
    aim(S.cam, [cx, cy, z, cx + .002 * k, cy + .002 * k, -.08], t, { hand: .0003 });
    const fl = .06 * Math.sin(t * 13) * Math.sin(t * 5.3), g = ss(seg(t, H.historia - .3, T1 + .3));
    setL(S, Ho.flame.x, Ho.flame.y + .01, lerp(.13, .22, g), lerp(1.6, 3.2, g) + fl, col3('#ffcf86').lerp(col3('#fff0d6'), g));
    Ho.lamp.set({ lit: 1 + fl + 2 * g, flick: fl + .5 * g }); halo.userData.set(.6 + fl + 2.2 * g); halo.scale.setScalar(1 + 3 * g);
    J.set({ x: .03, y: BACK, a: .3, rot: .02, flip: true });
    const st = ss(seg(t, E.T0 + .1, E.T0 + .5));
    C.set({ x: -.007, y: GROUND - .001, tuck: .42 * (1 - st), rot: -.08 * st, look: .7, aL: .3 * g, aR: .3 * g, blink: blinkAt(t, 3.1, .2), k: 1 + g * .4 });
    this._g = g; this._f = fsOf(S, -.07);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 6, bloom: blo(.32 + .13 * this._g, lerp(1.05, .9, this._g)) }; },
  grade() { const g = this._g || 0; return { ...G_NIGHT, expo: 1 + .5 * g, vig: lerp(.5, .3, g), lift: [lerp(.006, .03, g), lerp(.003, .022, g), lerp(.008, .01, g)] }; } };
}

// —— the king's hall (S4–S7, S11): a high window with two shutters whose inner edges meet at a slit, the throne on its dais,
// a dark front floor with a column at each side. P: hall / gold / cold.
export const WX = .03, WY = .045, WW = .03, WHT = .075, THRONE_X = .045, DAIS = GROUND + .013;
export function hall(S, P, o = {}) {
  const win = skyPanel({ w: .08, h: .12, x: WX, y: WY + WHT / 2, z: -.165, stops: P.win, gain: o.winGain ?? 1.3 }); S.add(win);
  const wall = wsheet(S, { x0: -.35, x1: .35, y0: -.15, y1: .35, z: -.15, col: P.far, trans: .4, ppm: 1400, finish: { rim: .3, under: .3 }, draw: x => {
    x.fillRect(-.35, -.15, .7, .5); cut(x, () => { arch(x, WX, WY, WW, WHT); for (const px of [-.06, .12]) x.fillRect(px - .0005, -.15, .001, .5); });
  } });
  const sw = WW / 2 + .001;
  const shL = wsheet(S, { x0: WX - sw, x1: WX - .0005, y0: WY - .003, y1: WY + WHT + .003, z: -.148, col: P.shut, trans: .04, ppm: 5000, finish: { rim: .5, rimPx: 3, under: .3 }, draw: x => x.fillRect(WX - sw, WY - .003, sw - .0005, WHT + .006) });
  const shR = wsheet(S, { x0: WX + .0005, x1: WX + sw, y0: WY - .003, y1: WY + WHT + .003, z: -.148, col: P.shut, trans: .04, ppm: 5000, finish: { rim: .5, rimPx: 3, under: .3 }, draw: x => x.fillRect(WX + .0005, WY - .003, sw - .0005, WHT + .006) });
  const x0L = shL.position.x, x0R = shR.position.x;
  const floor = wsheet(S, { x0: -.35, x1: .35, y0: -.3, y1: GROUND + .005, z: -.13, col: P.floorc, trans: .1, ppm: 1400, finish: { rim: .5, under: .3 }, draw: x => x.fillRect(-.35, -.3, .7, .3 + GROUND + .003) });
  const throne = wsheet(S, { x0: THRONE_X - .045, x1: THRONE_X + .045, y0: GROUND - .01, y1: DAIS + .075, z: -.12, col: P.mid, trans: .3, ppm: 5000, finish: { rim: .55, rimPx: 4, under: .3 }, draw: x => {
    x.fillRect(THRONE_X - .042, GROUND - .01, .084, .016); x.fillRect(THRONE_X - .032, GROUND - .01, .064, DAIS - GROUND + .01);   // two steps
    x.beginPath(); x.moveTo(THRONE_X - .006, DAIS); x.lineTo(THRONE_X - .006, DAIS + .062); x.quadraticCurveTo(THRONE_X + .012, DAIS + .075, THRONE_X + .03, DAIS + .062); x.lineTo(THRONE_X + .03, DAIS); x.closePath(); x.fill();
    x.fillRect(THRONE_X - .02, DAIS + .016, .05, .004);
  } });
  const front = wsheet(S, { x0: -.35, x1: .35, y0: -.4, y1: .35, z: -.045, col: P.front, trans: .03, ppm: 1500, finish: { rim: .55, rimPx: 4, under: .3 }, draw: x => {
    ragged(x, -.35, .35, GROUND, .0007, 70);
    for (const c of [-.082, .1]) { x.fillRect(c - .011, GROUND, .022, .4); x.fillRect(c - .015, GROUND, .03, .006); x.fillRect(c - .015, .1, .03, .006); }
  } });
  return { win, wall, shL, shR, floor, throne, front, shut(k) { const d = k * (sw + .004); shL.position.x = x0L - d; shR.position.x = x0R + d; } };
}
export const KING_SIT = (S, P, o = {}) => PERSON(S, P, { pose: 'sit', h: .085, z: -.116, crown: true, rim: .75, ...o });
export const KING = (S, P, o = {}) => PERSON(S, P, { h: .088, z: -.116, crown: true, royal: true, two: true, rim: .75, ...o });
export const SERVANT = (S, P, o = {}) => PERSON(S, P, { h: .08, z: -.08, rim: .75, ...o });

// The debt: five heaps of plain paper coins and sacks, in a stair from front (low) to back (higher than the frame). x: base centre of the front heap.
export const HEAPS = [[.085, .035, -.062, 0, '#6e665a'], [.1, .07, -.074, -.006, '#7c7466'], [.12, .11, -.086, -.012, '#8a8070'], [.14, .17, -.098, -.018, '#a49a88'], [.16, .26, -.11, -.024, '#bdb3a0']];
export function mountain(S, { x = -.04, y = GROUND - .004, scale = 1 } = {}) {
  return HEAPS.map(([w, h, z, dx, c], i) => { const g = heap(S.U, { w: w * scale, h: h * scale, z, col: c, seed: 3 + i * 7, trans: .06 + i * .05, sacks: 1 + (i % 2) }); g.position.set(x + dx * scale, y, z); S.scene.add(g); g.userData.y0 = y; g.userData.c = c; g.userData.h = h * scale; return g; });
}

// S4 the hall: the king on his throne, the servant small in the middle; beside him his wife and two children in shadow, two guards (18:25, no voice).
// The window behind the throne is shut: a slit of light. Dolly back; the edge of something huge appears at the left. Clawd by the left column.
export function S4(E) {
  const { H } = E;
  const P = PAL.hall, S = pstage(P, { light: [WX, WY + .04, -.1], lightR: .1 });
  const Hl = hall(S, P);
  mountain(S, { x: -.14 });
  const K = KING_SIT(S, P); const Sv = SERVANT(S, P);
  const fam = figures(S.U, { list: [{ x: -.03, h: .07, veil: true }, { x: -.019, h: .044 }, { x: -.043, h: .04 }, { x: -.062, h: .088, arm: .25 }, { x: .088, h: .088, flip: true, arm: .25 }], z: -.09, col: '#0c0a12', rim: .5 });
  fam.position.y = GROUND - .002; S.scene.add(fam);
  const C = CLAWD(S, { u: .0024, z: -.05 });
  return { S, update(t) {
    const k = eio(seg(t, E.T0 - .3, E.T0 + E.dur + .4)), z = lerp(.46, .56, k), cx = lerp(.018, .006, k);
    aim(S.cam, [cx, .004, z, cx, .003, -.08], t, { hand: .0004 });
    Hl.shut(0); setL(S, .012, -.006, .12, 3.0);
    K.set({ x: THRONE_X + .006, y: DAIS, a: .3, flip: true }); Sv.set({ x: .004, y: GROUND - .002, a: .1 });
    const turn = ss(seg(t, H.l04 + .8, H.l04 + 1.1));
    C.set({ x: -.04, y: GROUND - .001, look: lerp(.8, -1, turn), blink: blinkAt(t, 3, .5), k: 1 });
    this._f = fsOf(S, -.08);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 6, bloom: blo(.3, 1.05) }; }, grade() { return G_HALL; } };
}

// S5 ten thousand talents: the debt mountain, five heaps in a stair, higher than the frame. A crane up from its foot (the summit stays out of frame).
// Clawd tiny at the foot: tips back to see the top, steps back and lifts a paw to measure it: it doesn't reach the first heap.
export function S5(E) {
  const { H } = E;
  const P = PAL.hall, S = pstage(P, { light: [-.03, .08, -.1], lightR: .16 });
  const Hl = hall(S, P);
  mountain(S, { x: -.045, scale: 1.15 });
  const C = CLAWD(S, { u: .002, z: -.05 });
  return { S, update(t) {
    const k = eio(seg(t, E.T0, E.T0 + E.dur + .2)), z = lerp(.32, .48, k), cy = lerp(-.03, .0, k), ly = lerp(-.034, .022, k), cx = lerp(-.022, -.03, k);
    aim(S.cam, [cx, cy, z, cx, ly, -.08], t, { hand: .0004 });
    Hl.shut(0); setL(S, -.03, lerp(.0, .1, k), .16, 1.0);
    const back = ss(seg(t, H.imposible - .3, H.imposible + .2)), meas = ss(seg(t, H.talentos + .3, H.talentos + .7)) * (1 - ss(seg(t, H.imposible + .5, H.imposible + .9)));
    const x = lerp(-.012, -.002, back);
    C.set({ x, y: GROUND - .001, rot: .16 * ss(seg(t, E.T0 + .2, E.T0 + .6)) - .06 * back, aL: meas * 2.1, look: -.8, walk: t * 8, stride: back > 0 && back < 1 ? .4 : 0, blink: blinkAt(t, 3.4, .1), k: 1 });
    this._f = fsOf(S, -.07);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 6, bloom: blo(.3, 1.05) }; }, grade() { return G_HALL; } };
}

// S6 «Ten paciencia»: the servant on his knees before the throne, bowed down; the mountain dark behind him. A locked frame: on «rodillas»
// the light goes down to almost nothing. Silence 1: nothing moves, only the slit in the shutters shines. Clawd by the column, still, arms down.
export function S6(E) {
  const { H } = E;
  const P = PAL.hall, S = pstage(P, { light: [WX, WY + .04, -.1], lightR: .12 });
  const Hl = hall(S, P);
  const M6 = mountain(S, { x: -.05 }); M6.forEach((m, i) => { m.userData.m.material.userData.u.uTrans.value = .2 + i * .06; });
  const K = KING_SIT(S, P); const Sv = SERVANT(S, P, { pose: 'kneel' });
  const slit = glowOrb(S, { x: WX, y: WY + WHT / 2, z: -.147, r: .004, halo: 12, col: '#e9dcc0' }); slit.scale.set(.25, 2.4, 1);
  const C = CLAWD(S, { u: .0024, z: -.05 });
  return { S, update(t) {
    aim(S.cam, [.004, .004, .5, .004, .003, -.08], t, { hand: t > H.sil1 ? 0 : .0003 });
    const d = ss(seg(t, H.rodillas, H.sil1 - .2));
    Hl.shut(0); setL(S, -.004, -.01, lerp(.12, .09, d), lerp(3.2, 2.0, d));
    S.key.intensity = lerp(P.key, .35, d); S.amb.intensity = lerp(P.amb, .18, d);
    Hl.win.material.color.setScalar(lerp(1.3, 1.6, d)); slit.userData.set(lerp(.15, .45, d));
    const bow = ss(seg(t, E.T0, H.rodillas + .4));
    K.set({ x: THRONE_X + .006, y: DAIS, a: .3, flip: true }); Sv.set({ x: -.014, y: GROUND - .002 - .004 * bow, a: lerp(.3, .9, bow), rot: -.5 * bow });
    C.set({ x: -.042, y: GROUND - .001, look: .6, blink: t > H.sil1 ? 1 : blinkAt(t, 3.6, 1.1), k: lerp(1, .8, d) });
    this._d = d; this._f = fsOf(S, -.08);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 6, bloom: blo(.28 + .08 * (this._d || 0), 1.05) }; }, grade() { const d = this._d || 0; return { ...G_HALL, vig: lerp(.52, .62, d) }; } };
}

// S7 signature shot: the debt comes apart and the light comes in. On «compadecido» the king rises (the only slow movement).
// On «perdona» the five heaps slide down one by one, front to back, while the shutters part and gold light passes through the heaps still standing
// (they turn translucent before they go). On «deuda», the film's only burst at the window. The servant stays on his knees on an empty, lit floor.
// Dolly in through the gap toward the window. Clawd where the foot of the mountain was, still, arms down: the light reaches him without him moving.
export function S7(E) {
  const { H } = E;
  const A = PAL.hall, G = PAL.gold, S = pstage(A, { light: [WX, WY + .04, -.1], lightR: .05 });
  const Hl = hall(S, A);
  const M = mountain(S, { x: -.05 });
  const Ks = KING_SIT(S, A), Kst = KING(S, A); const Sv = SERVANT(S, A, { pose: 'kneel' });
  const ray = burst(.16, .28, '#ffd79a'); ray.rotation.z = Math.PI; ray.position.set(WX, WY + WHT + .004, -.14); S.add(ray);
  const C = CLAWD(S, { u: .0024, z: -.05 });
  const Pd = H.perdona, Dd = H.deuda, kc = H.compadecido;
  const figs = [Ks.body, Ks.arm, Kst.body, Kst.arm, Kst.arm2, Sv.body, Sv.arm];
  return { S, update(t) {
    const din = eio(seg(t, Pd - .2, E.T0 + E.dur + .3)), z = lerp(.5, .41, din), cy = lerp(.004, -.006, din);
    aim(S.cam, [.004 + .008 * din, cy, z, .006 + .01 * din, cy + .012 * din, -.08], t, { hand: .0003 });
    const g = ss(seg(t, Pd - .1, Dd + .4));                     // hall -> gold
    const op = eio(seg(t, Pd, Pd + .6)); Hl.shut(op);
    tint(Hl.wall, mixHex(A.far, G.far, g)); tint(Hl.floor, mixHex(A.floorc, G.floorc, g)); tint(Hl.throne, mixHex(A.mid, G.mid, g)); tint(Hl.front, mixHex(A.front, G.front, g));
    for (const m of [Hl.shL, Hl.shR]) tint(m, mixHex(A.shut, G.shut, g));
    Hl.win.material.color.set(mixHex('#d8d0c0', '#ffd98a', g)).multiplyScalar(lerp(1.3, 2.0, g));
    for (const m of figs) tint(m, mixHex(A.fig, G.fig, g));
    S.key.intensity = lerp(A.key, G.key, g); S.key.color.copy(col3(A.keyCol).lerp(col3(G.keyCol), g)); S.amb.intensity = lerp(A.amb, G.amb, g); S.amb.color.copy(col3(A.ambCol).lerp(col3(G.ambCol), g));
    setL(S, WX, lerp(WY + .04, WY, g), lerp(.06, .28, g), lerp(.5, 1.25, g), col3(A.light).lerp(col3(G.light), g));
    S.U.uBeamO.value.set(WX, WY + WHT, lerp(0, 1.3, op)); S.U.uBeamD.value.set(-Math.PI / 2 - .25, .16, lerp(.02, .3, g)); S.U.uBeamCol.value.set('#ffd99a');
    // the heaps: front first, one every .22 s; they turn translucent with the light, then slide down behind the front floor
    M.forEach((m, i) => {
      const t0 = Pd + i * .22, sl = eio(seg(t, t0, t0 + .42)), tr = ss(seg(t, Pd - .1 + i * .12, t0 + .1));
      m.position.y = m.userData.y0 - sl * (m.userData.h + .02); m.visible = sl < .999;
      m.userData.m.material.userData.u.uTrans.value = lerp(.06 + i * .05, .75, tr); tint(m.userData.m, mixHex(m.userData.c, '#e6c27a', tr * .7));
    });
    // the king rises on «compadecido»: the seated figure sinks behind the dais while the standing one rises from it
    const up = eio(seg(t, kc - .1, kc + .7));
    Ks.set({ x: THRONE_X + .006, y: DAIS - .03 * up, a: .3, flip: true }); Ks.g.visible = up < .6;
    Kst.set({ x: THRONE_X + .004, y: DAIS - .03 * (1 - up), a: .2 + .5 * ss(seg(t, Pd, Pd + .6)), a2: .1, flip: true }); Kst.g.visible = up >= .6;
    const lift = ss(seg(t, Dd, Dd + .8));
    Sv.set({ x: -.014, y: GROUND - .006 + .002 * lift, a: .9, rot: lerp(-.5, -.25, lift) });
    C.set({ x: -.026, y: GROUND - .001, look: lerp(.6, .9, g), blink: blinkAt(t, 3.7, .3), k: lerp(1, 1.1, g) });
    ray.userData.set(ss(seg(t, Dd - .05, Dd + .3)) * (1.1 + .05 * Math.sin(t * 7.3)));
    this._g = g; this._f = fsOf(S, -.08);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 6, bloom: blo(lerp(.3, .45, this._g), lerp(1.05, .95, this._g)) }; },
  grade() { const g = this._g || 0; return { vig: lerp(.52, .42, g), sat: lerp(.9, 1.04, g), contrast: .12, gain: [lerp(1.03, 1.04, g), 1, lerp(.95, .93, g)], lift: [lerp(.006, .012, g), lerp(.003, .007, g), lerp(.008, 0, g)] }; } };
}

// —— the street at night (S8–S9): an ink-grey sky with a white moon, a row of roofs, the street wall with the gold door of the hall at the left,
// the dark front ground. Never blue next to gold.
export function street(S, P, o = {}) {
  const DOOR_X = o.doorX ?? -.105;
  const sky = skyPanel({ w: .8, h: .5, y: .1, z: -.17, stops: P.sky, stars: 40, starMinY: .0, seed: 8 }); S.add(sky);
  const mo = moon({ r: .007, x: o.moonX ?? .05, y: .085, z: -.165, gain: 1.6, core: '#f6f4ee', mid: '#ece8e0', edge: '#e0dcd2', halo: 7, haloGain: .25, haloCol: '#e8e4dc' }); S.scene.add(mo);
  const R = mulberry(12);
  const roofs = wsheet(S, { x0: -.4, x1: .4, y0: -.2, y1: .1, z: -.14, col: P.far, trans: .35, ppm: 1400, finish: { rim: .4, under: .3 }, draw: x => {
    x.beginPath(); x.moveTo(-.4, -.2); let u = -.4; while (u < .4) { const w = .03 + R() * .03, h = .012 + R() * .03; x.lineTo(u, h); x.lineTo(u + w, h); u += w; } x.lineTo(.4, -.2); x.closePath(); x.fill();
    cut(x, () => { const Q = mulberry(5); for (let i = 0; i < 9; i++) { x.fillRect(-.35 + Q() * .7, -.01 + Q() * .02, .003, .004); } });
  } });
  const wall = wsheet(S, { x0: -.4, x1: .4, y0: -.2, y1: .02, z: -.1, col: P.mid, trans: .3, ppm: 1500, finish: { rim: .5, under: .3 }, draw: x => {
    x.beginPath(); x.moveTo(-.4, -.2); x.lineTo(-.4, -.004); for (let u = -.4; u <= .4; u += .02) { x.lineTo(u, -.004 + .0015 * Math.sin(u * 90)); } x.lineTo(.4, -.2); x.closePath(); x.fill();
    x.fillRect(DOOR_X - .03, -.2, .06, .22);   // the hall's tall front around the door
    cut(x, () => arch(x, DOOR_X, GROUND - .004, .03, .065));
  } });
  const door = wsheet(S, { x0: DOOR_X - .02, x1: DOOR_X + .02, y0: GROUND - .006, y1: GROUND + .066, z: -.103, col: '#ffd99a', trans: .5, ppm: 2500, shadow: false, recv: false, finish: { rim: 0, under: 0 },
    draw: x => x.fillRect(DOOR_X - .02, GROUND - .006, .04, .072), glowDraw: x => { x.fillStyle = '#fff'; x.fillRect(DOOR_X - .02, GROUND - .006, .04, .072); }, glow: o.doorGlow ?? 1.6, glowCol: '#ffd99a', glowRes: .3 });
  const sx = o.stepX ?? .2;
  const front = wsheet(S, { x0: -.4, x1: .4, y0: -.4, y1: GROUND + .006, z: -.04, col: P.front, trans: .03, ppm: 1600, finish: { rim: .5, rimPx: 4, under: .3 }, draw: x => {
    x.beginPath(); x.moveTo(-.4, -.4); x.lineTo(-.4, GROUND); x.lineTo(sx, GROUND); x.lineTo(sx + .002, GROUND + .004); x.lineTo(.4, GROUND + .004); x.lineTo(.4, -.4); x.closePath(); x.fill();
  } });
  return { sky, moon: mo, roofs, wall, door, front };
}
const MATE = (S, P, o = {}) => PERSON(S, P, { h: .072, z: -.077, rim: .7, ...o });

// S8 the street: the forgiven servant comes out of the gold door into the night street. He walks; he sees a fellow servant; on «agarra del cuello»
// he takes him by the neck with one hand (no lifting, no shaking); the fellow falls to his knees in the same posture as the servant in S6.
// A lateral track beside him, from the gold door into the dark, ending on a two-shot. Clawd against the wall in the shadow: stops dead, steps back, lowers his arms.
export function S8(E) {
  const { H } = E;
  const P = PAL.street, S = pstage(P, { light: [.05, .08, -.1], lightR: .2 });
  street(S, P);
  const Sv = SERVANT(S, P, { z: -.076, two: true }); const Ms = MATE(S, P), Mk = MATE(S, P, { pose: 'kneel' });
  const C = CLAWD(S, { u: .0022, z: -.05 });
  const A = H.ahoga, T1 = E.T0 + E.dur, w0 = E.T0 - .2;
  const sxAt = t => lerp(-.095, .016, eo(seg(t, w0, A - .1)));
  return { S, update(t) {
    const k = eio(seg(t, w0, A + .3)), cx = lerp(-.075, .022, k), z = lerp(.5, .43, eio(seg(t, A - .8, T1)));
    aim(S.cam, [cx, .002, z, cx, .0, -.08], t, { hand: .0004 });
    setL(S, .03, .03, .26, 1.4);
    const sx = sxAt(t), walking = t < A - .1;
    const grab = ss(seg(t, A - .1, A + .2)), kneel = t > A + .55, lower = ss(seg(t, A + .5, A + .9));
    Sv.set({ x: sx, y: GROUND - .001 + (walking ? walkY(t) : 0), a: walking ? Math.sin(t * 5.2) * .25 : lerp(1.75, 1.2, lower) * grab, a2: walking ? -Math.sin(t * 5.2) * .25 : .1, rot: walking ? Math.sin(t * 5.2) * .012 : -.03 * grab });
    Ms.g.visible = !kneel; Mk.g.visible = kneel;
    Ms.set({ x: .046, y: GROUND - .001, a: .15 + .4 * grab, rot: .05 * grab, flip: true });
    Mk.set({ x: .046, y: GROUND - .002 - .004 * (1 - ss(seg(t, A + .55, A + .8))), a: .9, rot: .5 * ss(seg(t, A + .55, A + 1.0)), flip: true });
    // Clawd follows a step behind against the wall; stops dead on the grab, steps back, lowers his arms
    const stop = t > A - .15, back = ss(seg(t, A + .05, A + .35)), raise = ss(seg(t, A - .15, A));
    C.set({ x: sxAt(Math.min(t, A - .15)) - .034 - .006 * back, y: GROUND - .001 + (stop ? 0 : walkY(t, 7, .0008)), walk: t * 7, stride: stop ? (back > 0 && back < 1 ? .35 : 0) : .4,
      aL: .8 * raise * (1 - back), aR: .8 * raise * (1 - back), look: stop ? .9 : .6, blink: blinkAt(t, 3, .6), k: .9 });
    this._f = fsOf(S, -.076);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 6, bloom: blo(.3, 1.05) }; }, grade() { return G_STREET; } };
}

// S9 a hundred denarii: a low insert on the ground: the fellow's small cloth pouch fallen on a step, a few plain coins showing (no numbers).
// Far behind, soft, the gold door of the hall. Clawd crouches beside it without touching it: the pouch is smaller than he is. He looks at it, at his own paw,
// and turns toward the far door. Rack focus pouch -> door.
export function S9(E) {
  const { H } = E;
  const P = PAL.street, S = pstage(P, { light: [.0, .02, -.1], lightR: .15 });
  street(S, P, { moonX: -.03, stepX: -.4, doorX: .03, doorGlow: 2.2 });
  const Po = pouch(S.U, { s: .013, z: -.053 }); Po.g.position.set(.016, GROUND + .004 - .0005, -.053); S.scene.add(Po.g);
  const C = CLAWD(S, { u: .0021, z: -.05 });
  const dd = H.dias;
  return { S, update(t) {
    const k = eio(seg(t, E.T0, E.T0 + E.dur)), z = lerp(.19, .175, k), cx = lerp(-.002, .002, k);
    aim(S.cam, [cx, -.024, z, cx - .004, -.026, -.08], t, { hand: .0003 });
    setL(S, .0, .02, .15, .8);
    const paw = ss(seg(t, dd + .25, dd + .5)) * (1 - ss(seg(t, dd + .9, dd + 1.2))), door = ss(seg(t, dd + 1.0, dd + 1.3));
    C.set({ x: -.008, y: GROUND + .004 - .001, tuck: .35, aR: paw * 1.0, look: door > 0 ? lerp(.9, -1, door) : lerp(.9, .4, paw), blink: blinkAt(t, 3.1, .7), k: .95 });
    const rk = ss(seg(t, dd + .9, dd + 1.4)); this._f = lerp(fsOf(S, -.052), fsOf(S, -.103), rk);
  }, post() { return { focus: this._f, aper: 10, maxCoc: 8, bloom: blo(.32, 1.05) }; }, grade() { return G_STREET; } };
}

// S10 the prison: a dark grille slides and closes in front of the fellow servant; the servant goes away. In a corner two fellow servants watch and leave
// toward the light of the hall (18:31). Silence 2: the moon goes down, everything goes out but one edge. Dolly back from the grille, then a locked frame.
// Clawd outside the bars at the right, still, head low.
export function S10(E) {
  const { H } = E;
  const P = PAL.street, S = pstage(P, { light: [-.01, .06, -.1], lightR: .14 });
  const sky = skyPanel({ w: .8, h: .5, y: .1, z: -.17, stops: P.sky, seed: 9 }); S.add(sky);
  const mo = moon({ r: .006, x: -.03, y: .05, z: -.165, gain: 1.5, core: '#f6f4ee', mid: '#ece8e0', edge: '#e0dcd2', halo: 7, haloGain: .25, haloCol: '#e8e4dc' }); S.scene.add(mo);
  wsheet(S, { x0: -.4, x1: .4, y0: -.2, y1: .3, z: -.12, col: '#45404e', trans: .3, ppm: 1400, finish: { rim: .35, under: .3 }, draw: x => {
    x.fillRect(-.4, -.2, .8, .5);
    cut(x, () => { arch(x, -.03, .035, .016, .028); const Q = mulberry(3); for (let r = 0; r < 9; r++) for (let c = 0; c < 14; c++) { if (Q() < .5) continue; x.fillRect(-.3 + c * .045 + (r % 2) * .022, -.08 + r * .022, .04, .0006); } });
  } });
  const win = bars(S.U, { w: .016, h: .02, z: -.118, col: '#0a090c', n: 3 }); win.position.set(-.03, .037, -.118); S.scene.add(win);
  wsheet(S, { x0: -.4, x1: .4, y0: -.4, y1: GROUND + .004, z: -.04, col: P.front, trans: .03, ppm: 1600, finish: { rim: .5, rimPx: 4, under: .3 }, draw: x => ragged(x, -.4, .4, GROUND, .0008, 60) });
  const Mk = MATE(S, P, { pose: 'kneel', z: -.08 }); const Sv = SERVANT(S, P, { z: -.07, two: true });
  const watchers = figures(S.U, { list: [{ x: -.006, h: .068, veil: true }, { x: .01, h: .074, arm: .3 }], z: -.1, col: '#141218', rim: .45 }); watchers.position.y = GROUND - .002; S.scene.add(watchers);
  const B = bars(S.U, { w: .062, h: .1, z: -.064, col: '#060508', n: 7 }); S.scene.add(B);
  const C = CLAWD(S, { u: .0024, z: -.05 });
  const Pg = H.pagame, Cc = H.carcel, s2 = H.sil2;
  return { S, update(t) {
    const k = eio(seg(t, E.T0, s2)), z = lerp(.38, .5, k);
    aim(S.cam, [.004, .004, z, .004, .002, -.08], t, { hand: t > s2 ? 0 : .0003 });
    const out = ss(seg(t, s2 - .1, s2 + .9));
    setL(S, -.012, lerp(.02, .0, out), lerp(.2, .1, out), lerp(1.6, 1.25, out), '#e8e4dc'); setMoon(mo, lerp(1, .55, out));
    S.key.intensity = lerp(P.key, .3, out); S.amb.intensity = lerp(P.amb, .16, out);
    const cl = eio(seg(t, Pg + .35, Cc));
    B.position.set(lerp(.11, -.01, cl), GROUND - .004, -.064);
    Mk.set({ x: -.012, y: GROUND - .006, a: .9, rot: .45, flip: true });
    const go = seg(t, Cc - .05, s2 + .3), walking = go > 0 && go < 1;
    Sv.set({ x: lerp(.022, .12, go), y: GROUND - .001 + (walking ? walkY(t) : 0), a: t < Cc ? lerp(.3, 1.2, ss(seg(t, Pg - .1, Pg + .2))) * (1 - ss(seg(t, Cc - .3, Cc))) : Math.sin(t * 5.2) * .25, a2: .1, flip: go <= 0, rot: walking ? Math.sin(t * 5.2) * .012 : 0 });
    const lv = ss(seg(t, Cc - .4, s2 - .1));
    watchers.position.x = lerp(-.058, -.12, lv); watchers.scale.x = t > Cc - .4 ? -1 : 1;
    C.set({ x: .05, y: GROUND - .001, rot: .06, look: -.5, blink: t > s2 ? .55 : lerp(blinkAt(t, 3.2, .2), .55, ss(seg(t, Cc, Cc + .3))), k: lerp(.95, .7, out) });
    this._o = out; this._f = fsOf(S, -.075);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 6, bloom: blo(.28, 1.05) }; }, grade() { const o = this._o || 0; return { ...G_STREET, vig: lerp(.58, .66, o) }; } };
}

// S11 the judgment: the same hall as S4, but the window gives a cold white light, no gold. The king stands; the servant before him on the floor.
// On «lo entrega» the shutters close halfway and the two guards lead him off slowly into the shadow at the right. A locked frame, then a slow dolly back.
// Clawd by the same column, still, arms down, head a little low.
export function S11(E) {
  const { H } = E;
  const P = PAL.cold, S = pstage(P, { light: [WX, WY + .03, -.1], lightR: .2 });
  const Hl = hall(S, P, { winGain: 1.5 });
  const K = KING(S, P); const Sk = SERVANT(S, P, { pose: 'kneel' }), Ss = SERVANT(S, P);
  const guards = figures(S.U, { list: [{ x: -.02, h: .088, arm: .5 }, { x: .02, h: .088, flip: true, arm: .5 }], z: -.083, col: P.fig, rim: .6 }); guards.position.y = GROUND - .002; S.scene.add(guards);
  const C = CLAWD(S, { u: .0024, z: -.05 });
  const En = H.entrega, Cm = H.compasion;
  return { S, update(t) {
    const k = eio(seg(t, H.l12 - .2, E.T0 + E.dur + .5)), z = lerp(.47, .54, k);
    aim(S.cam, [.006, .004, z, .006, .003, -.08], t, { hand: .0003 });
    const sh = eio(seg(t, En - .1, En + .7)); Hl.shut(lerp(1, .45, sh));
    S.key.intensity = lerp(P.key, .55, sh);
    K.set({ x: THRONE_X + .002, y: DAIS, a: lerp(.2, .8, ss(seg(t, Cm - .4, Cm + .1))) * (1 - .6 * ss(seg(t, En, En + .6))), a2: .1, flip: true });
    const lead = seg(t, En + .2, E.T0 + E.dur + .3), led = t > En + .2;
    Sk.g.visible = !led; Ss.g.visible = led; guards.visible = led;
    Sk.set({ x: .0, y: GROUND - .004, a: .5, rot: -.15 });
    const gx = lerp(.0, .085, lead);
    Ss.set({ x: gx, y: GROUND - .001 + walkY(t, 4), a: Math.sin(t * 4) * .15, rot: .04 });
    guards.position.x = gx; guards.position.y = GROUND - .002 + walkY(t, 4, .0005);
    setL(S, lerp(.012, gx + .004, ss(seg(t, En, En + .6))), -.008, .12, lerp(3.0, 2.6, sh));
    C.set({ x: -.042, y: GROUND - .001, rot: .05, look: .5, blink: blinkAt(t, 3.8, .9), k: .9 });
    this._f = fsOf(S, -.08);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 6, bloom: blo(.3, 1.05) }; }, grade() { return { ...G_HALL, sat: .82 }; } };
}

// S12 the house at dawn, in gold: the framing of S1. The lamp is out (a thread of smoke), the door is open with dawn light; Jesús seated with a rim of light,
// Pedro seated beside him, still. A slow dolly toward Clawd, in the same place as in S1: on «no es contar» he sets both paws on the floor and leaves them still;
// on «te perdonaron» he looks at the door of light; on the question he turns to the camera.
export function S12(E) {
  const { H } = E;
  const P = PAL.dawn, S = pstage(P, { light: [-.06, .02, -.1], lightR: .22 });
  const Ho = house(S, P, { dawn: true });
  const J = JESUS(S, P, { rim: 1 }), Pe = PEDRO(S, P, { pose: 'sit', two: false, rim: .95 });
  const C = CLAWD(S, { u: .0027, z: -.05, glow: .36 });
  return { S, update(t) {
    const k = eio(seg(t, E.T0, H.cta + .5)), z = lerp(.52, .34, k), cx = lerp(.0, .022, k), cy = lerp(.002, -.012, k);
    aim(S.cam, [cx, cy, z, cx, cy - .002 * k, -.08], t, { hand: .0004 });
    setL(S, Ho.DX, .01, .22, 1.3);
    Ho.lamp.set({ lit: 0, sway: bob(t, .8, .08) });
    J.set({ x: .03, y: BACK, a: .3, rot: .02, flip: true }); Pe.set({ x: -.042, y: BACK, a: .35 });
    const ready = ss(seg(t, E.T0 + .3, E.T0 + .8)) * (1 - ss(seg(t, H.contar - .25, H.contar + .25)));
    const toDoor = ss(seg(t, H.perdonaron - .1, H.perdonaron + .3)) * (1 - ss(seg(t, H.cta - .2, H.cta + .1))), toCam = ss(seg(t, H.cta - .1, H.cta + .3));
    const hop = Math.sin(Math.PI * seg(t, H.cta + .05, H.cta + .35)) * .0012;
    C.set({ x: .03, y: GROUND - .001 + hop, aL: ready * .7, aR: ready * .7, look: lerp(lerp(.5, -1, toDoor), 0, toCam), blink: blinkAt(t, 3, .4), k: 1 });
    this._f = lerp(fsOf(S, -.07), fsOf(S, -.05), ss(seg(t, H.l13b, H.cta)));
  }, post() { return { focus: this._f, aper: 7, maxCoc: 7, bloom: blo(.32, 1.1) }; }, grade() { return G_GOLD; } };
}
