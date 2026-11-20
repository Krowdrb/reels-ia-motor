// The twelve shots of «Agar: el Dios que me ve» (Génesis 16; 21). Each: { S, update(t), post(), grade() }; t in film seconds.
// God and the angel of the Lord are only ever light (a glow behind the dune, a beam from the sky, the eye that opens). Agar, Ismael, Sarai and
// Abraham are quiet silhouettes. Clawd is a witness in every frame: he never touches the water, never helps, never speaks to anyone.
// Colour: indigo night -> dawn -> bone-white desert -> violet dusk -> gold. Nothing blue next to gold light (it turns green): the layers are tinted warm.
// CPU budget: about 9 layers per shot, no particles, one burst() in the whole film (S11), maxCoc <= 8, bloom <= .45.
import * as THREE from 'three';
import { skyPanel, moon, text, burst } from './paper.js';
import { stage, aim } from './stage.js';
import { seg, ss, eio, eo, lerp, clamp, TAU, mulberry } from './lib.js';
import { mk, cut, tint, clawd, human, odre, bush, tent, palm, cesta, fuente, pozo } from './actors.js';

const blo = (s = .3, th = 1.1) => ({ strength: Math.min(s, .45), radius: .55, threshold: th });
const lay = (S, o) => S.add(mk(S.U, o));
const col3 = c => new THREE.Color(c);
const mixHex = (a, b, k) => '#' + col3(a).lerp(col3(b), clamp(k)).getHexString();
const setL = (S, x, y, r, lit, c) => { S.U.uLight.value.x = x; S.U.uLight.value.y = y; S.U.uLightR.value = r; S.U.uLit.value = lit; if (c) S.U.uLightCol.value.copy(typeof c === 'string' ? col3(c) : c); };
const bob = (t, f, a, p = 0) => Math.sin(t * f + p) * a;
const blinkAt = (t, per = 3.3, ph = 0) => 1 - .9 * Math.max(0, 1 - Math.abs(((t + ph) % per) - .1) / .1);
const fsOf = (S, z) => S.cam.position.z - z;
const HH = (cz, z) => .4617 * (cz - z) / 2;      // half the visible height at depth z
const HW = (cz, z) => .13 * (cz - z);             // half the visible width at depth z
export const GROUND = -.05;

// —— palettes. Sky stops are given by world height y (top first) ——
const SKY_Y = .65, SKY_H = 1.0;
const sky = list => list.map(([y, c]) => [clamp((SKY_Y - y) / SKY_H), c]);
export const PAL = {
  night: { sky: sky([[.4, '#03050f'], [.15, '#0b1028'], [0, '#151b40'], [-.12, '#232b58']]), far: '#3c4470', mid: '#262c52', front: '#0a0c1c', fig: '#05060d',
    light: '#dfe6f4', key: .55, keyCol: '#b8c4ee', amb: .3, ambCol: '#5866a0', floor: .25 },
  dawn: { sky: sky([[.4, '#8e8aae'], [.15, '#c9bccb'], [0, '#e8d6d8'], [-.12, '#f2e2da']]), far: '#a7a3bf', mid: '#5a5678', front: '#1c1a2a', fig: '#141220',
    light: '#ffe7c2', key: 1.2, keyCol: '#ffeedd', amb: .45, ambCol: '#b0a4c0', floor: .45 },
  morn: { sky: sky([[.4, '#bdb6cc'], [.12, '#e6dcdc'], [-.12, '#f6eee6']]), far: '#bdb3c4', mid: '#8a8099', front: '#221e2c', fig: '#16131e',
    light: '#fff4e6', key: 1.5, keyCol: '#fff4e6', amb: .5, ambCol: '#c4bccc', floor: .5 },
  burn: { sky: sky([[.4, '#e6e1d4'], [.15, '#f4f1e8'], [-.12, '#fbfaf5']]), far: '#d9d3c3', mid: '#a8a090', front: '#17140f', fig: '#15120d',
    light: '#fffaf0', key: 2.1, keyCol: '#fffaf2', amb: .6, ambCol: '#ddd6c6', floor: .55 },
  dusk: { sky: sky([[.4, '#1a1226'], [.15, '#3a2c4a'], [0, '#5c4a6a'], [-.12, '#7a6080']]), far: '#6a5678', mid: '#463858', front: '#0e0a14', fig: '#0a0710',
    light: '#f0c8c8', key: .7, keyCol: '#e8c8d8', amb: .3, ambCol: '#7a6088', floor: .3 },
  gold: { sky: sky([[.4, '#d9b46c'], [.15, '#ecd096'], [0, '#f3dca0'], [-.12, '#fbeccc']]), far: '#e6c27a', mid: '#b98f4e', front: '#2a1a0e', fig: '#1c1108',
    light: '#ffd98a', key: 1.8, keyCol: '#ffe6c0', amb: .5, ambCol: '#cfae86', floor: .5 },
};
export const pstage = (P, o = {}) => stage({ light: [0, .1, -.1], lightR: .3, lightCol: P.light, key: P.key, keyCol: P.keyCol, keyPos: [-.02, .5, .1], keyTarget: [0, -.06, -.08], keyAngle: .62,
  amb: P.amb, ambCol: P.ambCol, floor: P.floor, shadowR: 4, ...o });
const LIFT = [.012, .007, 0];   // warm shadows (the default lift is bluish)
const G_NIGHT = { vig: .5, sat: .95, contrast: .12 };
const G_BURN = { vig: .58, sat: .8, contrast: .2, gain: [1.02, 1, .96], lift: LIFT };
const G_GOLD = { vig: .42, sat: 1.04, contrast: .12, gain: [1.04, 1, .93], lift: LIFT };

// A sheet of land: o.top(u) gives the world-space top line; everything below is filled down to o.bottom. Drawn in world coordinates.
function land(S, o) {
  const y1 = o.ymax ?? .16, y0 = o.bottom ?? -.42, cy = (y1 + y0) / 2, w = o.w ?? 1.0, cx = o.x || 0;
  const tr = x => x.translate(-cx, -cy);
  return lay(S, { w, h: y1 - y0, x: cx, y: cy, z: o.z, col: o.col, trans: o.trans, ppm: o.ppm ?? 1800, shadow: o.shadow, recv: o.recv, finish: o.finish ?? { rim: .45 }, draw: x => {
    tr(x); x.beginPath(); x.moveTo(cx - w / 2, y0); for (let u = cx - w / 2; u <= cx + w / 2 + 1e-6; u += .0015) x.lineTo(u, o.top(u)); x.lineTo(cx + w / 2, y0); x.closePath(); x.fill(); o.more?.(x);
  } });
}

// —— the desert: sky (optionally starred, optionally a second sky to cross-fade to), far dunes rising to the right, middle dunes falling, the dark front ——
// o: stars, sky2 (stops), slope, frontTop(u), farY/midY. paint(A, B, k) tints the land; skyMix(k) fades sky -> sky2.
export function dunes(S, P, o = {}) {
  const sl = o.slope ?? .16;
  const sk = skyPanel({ w: 1.6, h: SKY_H, y: SKY_Y - SKY_H / 2, z: -.16, stops: o.skyStops || P.sky, stars: o.stars || 0, starMinY: -.25, seed: 5 }); S.add(sk);
  let sk2 = null;
  if (o.sky2) { sk2 = skyPanel({ w: 1.6, h: SKY_H, y: SKY_Y - SKY_H / 2, z: -.162, stops: o.sky2 }); S.add(sk2); sk.material.transparent = true; }
  const fy = o.farY ?? .016, my = o.midY ?? -.014;
  const farTop = u => fy + sl * u + .009 * Math.sin(u * 11 + 1) + .003 * Math.sin(u * 37);
  const midTop = u => my - sl * .7 * u + .007 * Math.sin(u * 16 + 2) + .002 * Math.sin(u * 53 + 1);
  const gy = o.frontTop || (u => GROUND + .0025 * Math.sin(u * 40 + 1.3) + .0015 * Math.sin(u * 97));
  const far = land(S, { z: -.135, col: P.far, trans: .7, ppm: 1500, ymax: .3, finish: { rim: .35, under: .15 }, top: farTop });
  const mid = land(S, { z: -.105, col: P.mid, trans: .35, ppm: 1700, top: midTop });
  const front = land(S, { z: -.04, col: P.front, trans: .03, ppm: 2200, finish: { rim: .55, rimPx: 4, under: .3 }, top: gy });
  const paint = (A, B, k, skyTint = '#ffffff') => {
    tint(far, mixHex(A.far, B.far, k)); tint(mid, mixHex(A.mid, B.mid, k)); tint(front, mixHex(A.front, B.front, k));
    sk.material.color.set(mixHex('#ffffff', skyTint, k));
  };
  const skyMix = k => { sk.material.opacity = 1 - k; sk.visible = k < .999; };
  return { sky: sk, sky2: sk2, far, mid, front, paint, skyMix, gy, farTop, midTop };
}

// The paper title: a dark plate with light (emissive) letters, anchored to the camera at the top of the frame; it opens from its centre
function titleStrip(S) {
  const words = x => { text(x, 'LA ESCLAVA QUE DIOS VIO', 0, .0062, .0086, 'Cinzel', { weight: 800, fill: '#fff' }); x.fillStyle = '#fff'; x.fillRect(-.02, -.0028, .04, .0005); text(x, 'Génesis 16 y 21', 0, -.0115, .0086, 'Playfair', { weight: 'italic 500', fill: '#fff' }); };
  const m = lay(S, { w: .136, h: .05, z: -.01, col: '#161a36', trans: .05, shadow: false, recv: false, ppm: 9000, finish: { rim: .6, under: .2 }, draw: x => {
    x.beginPath(); x.roundRect(-.064, -.022, .128, .044, .002); x.fill();
  }, glowDraw: words, glow: 2.4, glowCol: '#ffe6b0', glowRes: 1 });
  return { m, update(t, t0, t1, dx = 0) {
    const reveal = ss(seg(t, t0, t0 + .45)) * (1 - ss(seg(t, t1 - .45, t1)));
    const c = S.cam.position, ts = (c.z + .01) / .6;
    m.scale.setScalar(ts); m.position.x = c.x + dx; m.position.y = c.y + HH(c.z, -.01) * .62;
    m.material.userData.u.uClip.value.set(m.position.x, m.position.y, .075 * reveal * ts, 0); m.visible = reveal > .002;
  } };
}

// A soft glow sitting behind a sheet (the light of 16:7 is born behind the dune): the disc is hidden by the land, only the halo shows
function glowOrb(S, { x, y, z = -.15, r = .012, col = '#f4efe0', halo = 14, gain = 0 }) {
  const m = moon({ r, x, y, z, gain: 0, core: '#ffffff', mid: '#fffaf0', edge: '#fff4e0', halo, haloGain: 1, haloCol: col }); S.scene.add(m);
  m.userData.set = (k, c = col) => { m.userData.disc.material.color.setScalar(gain * k); m.userData.halo.material.color.set(c).multiplyScalar(k); };
  m.userData.disc.visible = gain > 0; m.userData.set(0); return m;
}

// —— the cast ——
export const AGAR = (S, P, o = {}) => { const A = human(S.U, { h: .08, z: -.07, pose: 'stand', col: P.fig, rim: .7, veil: true, ...o }); S.scene.add(A.g); return A; };
export const BOY = (S, P, o = {}) => { const B = human(S.U, { h: .058, z: -.066, pose: 'stand', col: P.fig, rim: .7, ...o }); S.scene.add(B.g); return B; };
const CLAWD = (S, o = {}) => { const C = clawd(S.U, { u: .0024, z: -.05, glow: .42, ...o }); S.scene.add(C.g); return C; };
const walkY = (t, f = 5.2, a = .0006) => Math.abs(Math.sin(t * f)) * a;

// S1 the hook: indigo night, the dunes in a diagonal, Agar walks alone to the right and Clawd one step behind her, sinking in the sand.
// The camera travels beside them. Far behind, the small warm door of a tent. On «la llamó» a star ahead brightens; Clawd stops and looks up.
export function S1(E) {
  const { H } = E;
  const P = PAL.night, S = pstage(P, { light: [.05, .06, -.1], lightR: .25 });
  const D = dunes(S, P, { stars: 260 });
  const T = tent(S.U, { w: .05, h: .022, z: -.12, col: '#1a1d38', glow: 2 }); T.g.position.set(-.115, -.004, -.12); S.scene.add(T.g);
  const star = glowOrb(S, { x: .052, y: .062, z: -.155, r: .0022, halo: 10, gain: 2.5 });
  const A = AGAR(S, P);
  const C = CLAWD(S, { u: .0026, z: -.052 });
  const title = titleStrip(S);
  const ll = H.llamo;
  return { S, update(t) {
    const k = seg(t, 0, E.dur), cx = lerp(-.05, .045, k);
    const push = eio(seg(t, H.l02 - .3, H.l02 + 1.2)), z = lerp(.5, .45, push), cy = lerp(-.008, -.016, push);
    aim(S.cam, [cx, cy, z, cx + .004, cy, -.08], t, { hand: .0004 });
    const ax = cx + .016;
    A.set({ x: ax, y: D.gy(ax) - .001 + walkY(t), a: Math.sin(t * 5.2) * .25, rot: Math.sin(t * 5.2) * .012 });
    // Clawd: one step behind; stops on «la llamó» (slides back a little in frame), then hops to catch up
    const stop = ss(seg(t, ll, ll + .25)) * (1 - ss(seg(t, ll + 1.0, ll + 1.3))), lag = .012 * ss(seg(t, ll, ll + 1.1)) * (1 - ss(seg(t, ll + 1.1, ll + 1.6)));
    const x = cx - .03 - lag, moving = 1 - stop;
    const backLook = ss(seg(t, .7, 1.0)) * (1 - ss(seg(t, 1.6, 1.9)));
    C.set({ x, y: D.gy(x) - .0012 * Math.abs(Math.sin(t * 7)) * moving, walk: t * 7, stride: .45 * moving, look: lerp(lerp(.6, -1, backLook), .9, stop), aL: stop * .25, aR: stop * .25, blink: blinkAt(t, 3.1, .5), k: 1 });
    star.userData.set(lerp(.35, 1.1, ss(seg(t, ll - .1, ll + .5))) * (1 + .04 * Math.sin(t * 3)));
    T.set({ wave: bob(t, 2.3, .15), lit: 1 + .08 * Math.sin(t * 9) * Math.sin(t * 4) });
    title.update(t, .3, 3.3, .0035);
    this._f = fsOf(S, -.07);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 6, bloom: blo(.32, 1.05) }; }, grade() { return G_NIGHT; } };
}

// S2 Sarai's tent: the lit door, Sarai standing still in it (no gesture), Agar walking out of the light into the dark. Dolly back. Clawd by a stake in the shadow.
export function S2(E) {
  const { H } = E;
  const P = PAL.night, S = pstage(P, { light: [-.01, .0, -.1], lightR: .1, lightCol: '#efe6dc' });
  const D = dunes(S, P, { stars: 200, farY: .03 });
  const T = tent(S.U, { w: .15, h: .075, z: -.095, col: '#2a3166', glow: 2.2, rim: .7, door: .26 }); T.g.position.set(.004, GROUND + .004, -.095); S.scene.add(T.g);
  const Sa = human(S.U, { h: .04, z: -.0952, pose: 'stand', col: '#05060d', rim: .9, veil: true }); S.scene.add(Sa.g);
  const A = AGAR(S, P, { z: -.072 });
  const C = CLAWD(S, { u: .0021, z: -.05 });
  return { S, update(t) {
    const k = eio(seg(t, E.T0, E.T0 + E.dur)), z = lerp(.44, .56, k), cx = lerp(-.004, .008, k);
    aim(S.cam, [cx, -.01, z, cx, -.01, -.08], t, { hand: .0004 });
    Sa.set({ x: T.g.position.x + T.doorX - .002, y: GROUND + .004, a: .12 });
    const w = seg(t, E.T0, E.T0 + E.dur), ax = lerp(.012, .07, w);
    A.set({ x: ax, y: GROUND - .001 + walkY(t), a: Math.sin(t * 5.2) * .25, rot: Math.sin(t * 5.2) * .012 });
    const go = ss(seg(t, E.T0 + E.dur - .75, E.T0 + E.dur)), cxw = lerp(-.048, -.038, go);
    C.set({ x: cxw, y: GROUND - .001, walk: t * 7, stride: .45 * (go > 0 && go < 1 ? 1 : 0), look: lerp(.2, 1, ss(seg(t, H.afligia + .7, H.afligia + 1.1))), blink: blinkAt(t, 2.9, 1.2), k: 1 });
    T.set({ wave: bob(t, 2.6, .22) + bob(t, 6.1, .05), lit: 1 + .06 * Math.sin(t * 11) * Math.sin(t * 3.7) });
    this._f = fsOf(S, -.08);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 6, bloom: blo(.32, 1.05) }; }, grade() { return G_NIGHT; } };
}

// the spring on the road (S3–S6): night dunes, a stone on the left for Clawd, the spring, Agar beside it
const STONE_X = -.044, SPRING_X = -.004, AGAR_SX = .036;
function springSet(S, P, o = {}) {
  const top = u => GROUND + .0025 * Math.sin(u * 40 + 1.3) + .0015 * Math.sin(u * 97) + .0075 * Math.exp(-(((u - STONE_X) / .011) ** 2));
  const D = dunes(S, P, { stars: o.stars ?? 260, sky2: o.sky2, frontTop: top, farY: .006 });
  const F = fuente(S.U, { w: .066, z: -.058, col: '#1a2044', edge: '#f2f4fa' }); F.g.position.set(SPRING_X, GROUND + .0015, -.058); S.scene.add(F.g);
  return { D, F };
}

// S3 the spring: tilt down from the starred sky to a small spring between stones. Agar arrives and sits; Clawd sits on a stone apart, far from the water.
// Silence 1: the wind drops, nothing moves.
export function S3(E) {
  const { H } = E;
  const P = PAL.night, S = pstage(P, { light: [0, .05, -.1], lightR: .22 });
  const { D, F } = springSet(S, P);
  const As = AGAR(S, P), Ad = AGAR(S, P, { pose: 'sit' });
  const C = CLAWD(S, { u: .0024, z: -.05 });
  const arrive = H.fuente + 1.0;
  return { S, update(t) {
    const k = eio(seg(t, E.T0, H.fuente + .9)), ly = lerp(.12, -.012, k), cy = lerp(.03, -.01, k);
    aim(S.cam, [0, cy, .5, 0, ly, -.08], t, { hand: t > H.sil1 ? 0 : .0003 });
    const w = seg(t, E.T0, arrive), ax = lerp(-.1, AGAR_SX, eo(w)), sat = t > arrive + .15;
    As.g.visible = !sat; Ad.g.visible = sat;
    As.set({ x: ax, y: GROUND - .001 + (w < 1 ? walkY(t) : 0), a: w < 1 ? Math.sin(t * 5) * .25 : .1, rot: w < 1 ? Math.sin(t * 5) * .012 : 0 });
    Ad.set({ x: AGAR_SX + .004, y: GROUND - .0015 - .003 * (1 - ss(seg(t, arrive + .15, arrive + .45))), a: .35, flip: true });
    const cw = seg(t, E.T0 + .25, arrive + .2), cxw = lerp(-.11, STONE_X, eo(cw)), on = ss(seg(t, arrive + .1, arrive + .5));
    C.set({ x: cxw, y: D.gy(cxw) - .0004, walk: t * 6, stride: .4 * (cw > 0 && cw < 1 ? 1 : 0), tuck: .35 * on, look: lerp(.8, .5, on), blink: t > H.sil1 ? 1 : lerp(blinkAt(t, 3.3), .6, on), k: 1 });
    F.pool.material.userData.u.uGlowLit.value = .55;
    this._f = fsOf(S, -.07);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 6, bloom: blo(.3, 1.05) }; }, grade() { return G_NIGHT; } };
}

// S4 «Agar…»: locked frame, only the light changes. A white light is born behind the far dune; the layers turn translucent from back to front.
// Agar lifts her head. Clawd stays still on his stone at the left.
export function S4(E) {
  const { H } = E;
  const P = PAL.night, S = pstage(P, { light: [0, .0, -.1], lightR: .08 });
  const { D, F } = springSet(S, P);
  const orb = glowOrb(S, { x: -.002, y: -.0, z: -.15, r: .02, halo: 9, col: '#f4efe0', gain: 0 }); orb.scale.set(.8, 1.6, 1);
  const A = AGAR(S, P, { pose: 'sit', rim: .9 });
  const C = CLAWD(S, { u: .0024, z: -.05 });
  const L0 = H.agar2 - .15, wh = col3('#f4efe0');
  return { S, update(t) {
    aim(S.cam, [0, -.01, .5, 0, -.012, -.08], t, { hand: .0002 });
    const L = ss(seg(t, L0, L0 + 1.0));
    setL(S, -.002, lerp(-.01, .05, L), lerp(.06, .26, L), lerp(.2, 1.7, L), wh);
    orb.userData.set(lerp(0, .9, L)); orb.position.y = lerp(-.02, .012, L);
    [[D.far, .7, .97], [D.mid, .35, .75], [F.stones, .06, .3]].forEach(([m, a, b], i) => { m.material.userData.u.uTrans.value = lerp(a, b, ss(seg(t, L0 + i * .4, L0 + .45 + i * .4))); });
    S.key.intensity = lerp(.55, .9, L); S.U.uFloor.value = lerp(.25, .4, L);
    A.set({ x: AGAR_SX + .004, y: GROUND - .0015, a: .35, rot: -.08 * ss(seg(t, H.agar2 + .1, H.agar2 + .6)), flip: true });
    C.set({ x: STONE_X, y: D.gy(STONE_X) - .0004, tuck: .35, look: .2, blink: 1, k: 1 });
    F.pool.material.userData.u.uGlowLit.value = lerp(.55, 1.2, L);
    this._f = fsOf(S, -.07);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 6, bloom: blo(.38, 1.0) }; }, grade() { return G_NIGHT; } };
}

// S5 Ismael: Agar kneels by the spring, a hand on her belly, the white edge of the light on her profile; slow dolly in. Clawd small at the left edge, still, looking at the light.
export function S5(E) {
  const { H } = E;
  const P = PAL.night, S = pstage(P, { light: [-.002, .05, -.1], lightR: .26, lightCol: '#f4efe0' });
  const { D, F } = springSet(S, P);
  D.far.material.userData.u.uTrans.value = .97; D.mid.material.userData.u.uTrans.value = .75; F.stones.material.userData.u.uTrans.value = .3;
  const orb = glowOrb(S, { x: -.002, y: .012, z: -.15, r: .02, halo: 9, col: '#f4efe0', gain: 0 }); orb.scale.set(.8, 1.6, 1);
  const A = AGAR(S, P, { pose: 'kneel', rim: 1, h: .084 });
  const C = CLAWD(S, { u: .0019, z: -.05 });
  const wh = col3('#f4efe0'), warm = col3('#fbe6c8');
  return { S, update(t) {
    const k = eio(seg(t, E.T0, E.T0 + E.dur)), z = lerp(.44, .33, k), cx = lerp(.004, .02, k), cy = lerp(-.012, -.006, k);
    aim(S.cam, [cx, cy, z, cx, cy, -.08], t, { hand: .0003 });
    const o = ss(seg(t, H.oye - .1, H.oye + .6));
    setL(S, -.002, .05, lerp(.26, .3, o), lerp(1.7, 1.9, o), wh.clone().lerp(warm, o * .5));
    orb.userData.set(.9 + .15 * o);
    A.set({ x: AGAR_SX, y: GROUND - .0015, a: lerp(.25, .55, ss(seg(t, H.ismael - .5, H.ismael))), rot: -.05, flip: true });
    const cxC = cx - HW(z, -.05) + .03;
    C.set({ x: cxC, y: D.gy(cxC) - .0005, look: .4, blink: 1, k: 1 });
    F.pool.material.userData.u.uGlowLit.value = 1.2 + .5 * o;
    this._f = fsOf(S, -.07);
  }, post() { return { focus: this._f, aper: 9, maxCoc: 7, bloom: blo(.38, 1.0) }; }, grade() { return G_NIGHT; } };
}

// S6 «el Dios que me ve»: Agar lifts her face; the camera tilts up with her gaze; the sky goes from indigo to lilac-rose: dawn. The stars go out.
// Clawd looks up with her; with the dawn he lowers his eyes and sits.
export function S6(E) {
  const { H } = E;
  const N = PAL.night, Dw = PAL.dawn, S = pstage(N, { light: [-.002, .06, -.1], lightR: .3, lightCol: '#f4efe0' });
  const { D, F } = springSet(S, N, { sky2: Dw.sky });
  D.far.material.userData.u.uTrans.value = .9; D.mid.material.userData.u.uTrans.value = .6;
  const A = AGAR(S, N, { pose: 'kneel', rim: 1, h: .084 });
  const C = CLAWD(S, { u: .002, z: -.05 });
  const wh = col3('#f4efe0'), dl = col3(Dw.light);
  return { S, update(t) {
    const up = eio(seg(t, E.T0 + .2, H.ve + .7)), ly = lerp(-.01, .012, up), cy = lerp(-.012, -.006, up);
    aim(S.cam, [.004, cy, .47, .004, ly, -.08], t, { hand: .0003 });
    const d = ss(seg(t, H.ve - .7, H.ve + 1.0));
    D.skyMix(d); D.paint(N, Dw, d);
    tint(A.body, mixHex(N.fig, Dw.fig, d)); tint(A.arm, mixHex(N.fig, Dw.fig, d));
    S.key.intensity = lerp(N.key, Dw.key, d); S.key.color.copy(col3(N.keyCol).lerp(col3(Dw.keyCol), d)); S.amb.intensity = lerp(N.amb, Dw.amb, d); S.amb.color.copy(col3(N.ambCol).lerp(col3(Dw.ambCol), d));
    setL(S, -.002, .06, .3, lerp(1.6, 1.1, d), wh.clone().lerp(dl, d));
    const lift = ss(seg(t, E.T0, E.T0 + .6));
    A.set({ x: AGAR_SX, y: GROUND - .0015, a: .3, rot: lerp(-.05, .14, lift), flip: true });
    const sit = ss(seg(t, H.ve + .5, H.ve + .9));
    C.set({ x: STONE_X, y: D.gy(STONE_X) - .0004, look: lerp(.7, -.2, sit), aL: (1 - sit) * .3, aR: (1 - sit) * .3, tuck: .35 * sit, blink: blinkAt(t, 3.5, .3), k: 1 });
    F.pool.material.userData.u.uGlowLit.value = lerp(1.2, .3, d);
    this._d = d; this._f = fsOf(S, -.07);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 6, bloom: blo(.32, 1.05) }; }, grade() { const d = this._d || 0; return { vig: lerp(.5, .45, d), sat: .95, contrast: .12, lift: [lerp(0, .006, d), lerp(.005, .004, d), lerp(.018, .006, d)] }; } };
}

// S7 years later: a pale morning in the camp. The empty baby basket passes by; the boy is already walking. Abraham, old, with his staff,
// puts the water-skin on Agar's shoulder; then mother and son go off to the right. A lateral track.
export function S7(E) {
  const { H } = E;
  const P = PAL.morn, S = pstage(P, { light: [.02, .08, -.1], lightR: .3 });
  dunes(S, P, { farY: .02, slope: .1 });
  const p1 = palm(S.U, { h: .1, z: -.122, col: '#9a90a8', lean: .1 }); p1.position.set(-.075, -.006, -.122); S.scene.add(p1);
  const p2 = palm(S.U, { h: .08, z: -.12, col: '#9a90a8', lean: -.14, seed: 5 }); p2.position.set(.09, -.008, -.12); S.scene.add(p2);
  const T = tent(S.U, { w: .13, h: .062, z: -.1, col: '#4a4256', glow: 0, doorCol: '#2a2432' }); T.g.position.set(-.035, GROUND + .006, -.1); S.scene.add(T.g);
  const bk = cesta(S.U, { s: .017, z: -.048, col: '#4c4052' }); bk.position.set(-.088, GROUND - .001, -.048); S.scene.add(bk);
  const Ab = human(S.U, { h: .083, z: -.074, col: P.fig, rim: .7, staff: true, beard: true, two: true }); S.scene.add(Ab.g);
  const A = AGAR(S, P, { z: -.07 }), B = BOY(S, P, { z: -.068 });
  const sk = odre(S.U, { s: .026 }); S.scene.add(sk); tint(sk, '#2a2228'); sk.material.userData.u.uTrans.value = .02;
  const C = CLAWD(S, { u: .0024, z: -.05 });
  const hand = new THREE.Vector3(), sh = new THREE.Vector3();
  return { S, update(t) {
    const k = eio(seg(t, E.T0, E.T0 + E.dur)), cx = lerp(-.05, .03, k);
    aim(S.cam, [cx, -.01, .5, cx, -.01, -.08], t, { hand: .0004 });
    const hk = ss(seg(t, H.despidio - .6, H.despidio + .3)), go = seg(t, H.despidio + .7, E.T0 + E.dur + .4);
    Ab.set({ x: .006, y: GROUND - .001, a: lerp(.5, 1.25, ss(seg(t, E.T0 + .3, H.despidio - .6))) * (1 - .6 * ss(seg(t, H.despidio + .3, H.despidio + .9))), a2: .25 });
    const ax = .042 + .05 * eo(go), bx = .068 + .05 * eo(go), turned = go > 0;
    A.set({ x: ax, y: GROUND - .001 + (turned ? walkY(t) : 0), a: turned ? Math.sin(t * 5) * .2 : .2, flip: !turned });
    B.set({ x: bx, y: GROUND - .001 + (turned ? walkY(t, 6, .0007) : 0), a: turned ? Math.sin(t * 6) * .3 : .1, flip: !turned });
    // the skin travels from Abraham's hand to Agar's shoulder
    S.scene.updateMatrixWorld(true);
    Ab.arm.localToWorld(hand.set(0, -Ab.al, .002)); A.g.localToWorld(sh.set(-.012, .068, .004));
    sk.position.set(lerp(hand.x, sh.x, hk), lerp(hand.y, sh.y, hk) + Math.sin(Math.PI * hk) * .006, -.064);
    sk.rotation.z = lerp(.2, turned ? -.35 : .35, hk);
    const up = ss(seg(t, E.T0 + .9, E.T0 + 1.3)), cw = seg(t, E.T0 + 1.2, E.T0 + 1.9), fol = seg(t, H.despidio + 1.0, E.T0 + E.dur);
    const cxC = lerp(-.077, -.03, eo(cw)) + .03 * eo(fol);
    C.set({ x: cxC, y: GROUND - .001, tuck: .35 * (1 - up), walk: t * 7, stride: .4 * ((cw > 0 && cw < 1) || (fol > 0 && fol < 1) ? 1 : 0), look: lerp(-.6, .8, up), blink: blinkAt(t, 3.2, .4), k: 1 });
    T.set({ wave: bob(t, 2, .1), lit: 0 }); T.door.material.userData.u.uTrans.value = .02;
    this._f = fsOf(S, -.072);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 6, bloom: blo(.26, 1.15) }; }, grade() { return { vig: .45, sat: .9, contrast: .14, lift: [.006, .004, .004] }; } };
}

// S8 the burnt desert: from the white sun the camera tilts down to the skin: Agar tips it and a single drop falls. The boy in the shade of a dry bush.
// Clawd shades his eyes with an arm and stops by the skin when it drips; he never touches it. Rack focus from the skin to the bush.
export function S8(E) {
  const { H } = E;
  const P = PAL.burn, S = pstage(P, { light: [.02, .12, -.1], lightR: .32 });
  dunes(S, P, { farY: .0, slope: .12 });
  const sun = moon({ r: .015, x: .018, y: .11, z: -.155, gain: 3, core: '#ffffff', mid: '#fffcf2', edge: '#fff4dc', halo: 9, haloGain: .6, haloCol: '#fff6e0' }); S.scene.add(sun);
  const Bu = bush(S.U, { h: .052, z: -.045, col: '#17140f', seed: 7 }); Bu.position.set(-.048, GROUND - .002, -.045); S.scene.add(Bu);
  const B = BOY(S, P, { pose: 'sit', z: -.058, h: .056 });
  const A = AGAR(S, P, { z: -.078, two: true });
  const sk = odre(S.U, { s: .022, limp: true }); A.arm.add(sk); sk.position.set(0, -A.al, .001); sk.rotation.z = Math.PI;
  const drop = lay(S, { w: .004, h: .006, z: -.074, col: '#d8e0e4', trans: .4, shadow: false, recv: false, ppm: 20000, finish: { rim: .6, under: 0 }, draw: x => { x.beginPath(); x.arc(0, -.0008, .0011, 0, TAU); x.moveTo(-.0011, -.0008); x.lineTo(0, .0018); x.lineTo(.0011, -.0008); x.fill(); } });
  const C = CLAWD(S, { u: .0023, z: -.05 });
  const hand = new THREE.Vector3(), td = H.gota + .55;
  return { S, update(t) {
    const k = eio(seg(t, E.T0, H.gota + .4)), ly = lerp(.1, -.008, k), cy = lerp(.04, -.01, k);
    aim(S.cam, [.0, cy, .48, .0, ly, -.08], t, { hand: .0004 });
    const tip = ss(seg(t, H.gota - .1, td - .15));
    A.set({ x: .03, y: GROUND - .001, a: lerp(1.4, 2.75, tip), a2: .2, flip: true });
    B.set({ x: -.05, y: GROUND - .0015, a: .3, rot: .05 });
    S.scene.updateMatrixWorld(true); A.arm.localToWorld(hand.set(0, -A.al * 1.05, 0));
    const f = seg(t, td, td + .38);
    drop.visible = t > td - .05 && f < 1; drop.position.set(hand.x - .004, hand.y - .004 - .06 * f * f, -.074);
    const walk = seg(t, E.T0, H.gota + .3), cxC = lerp(-.03, -.008, eo(walk));
    C.set({ x: cxC, y: GROUND - .001, walk: t * 5, stride: .35 * (walk < 1 ? 1 : 0), aL: 1.8, look: t > td - .3 ? .8 : -.4, blink: .5, k: 1 });
    const rk = ss(seg(t, td + .4, td + 1.0)); this._f = lerp(fsOf(S, -.078), fsOf(S, -.045), rk);
  }, post() { return { focus: this._f, aper: 10, maxCoc: 7, bloom: blo(.36, 1.0) }; }, grade() { return G_BURN; } };
}

// S9 a bowshot away: wide. The bush with the boy on the left; Agar sitting far on the right, her back to him. Dolly back to open the distance.
// The white light falls to violet dusk. On «No quiero ver» she covers her face with her arm. Clawd in the middle measures the distance, then sits. Silence 2.
export function S9(E) {
  const { H } = E;
  const B0 = PAL.burn, Du = PAL.dusk, S = pstage(B0, { light: [.0, .06, -.1], lightR: .3 });
  const D = dunes(S, B0, { farY: -.004, slope: .08, sky2: Du.sky });
  const Bu = bush(S.U, { h: .05, z: -.045, col: B0.front, seed: 7 }); Bu.position.set(-.058, GROUND - .002, -.045); S.scene.add(Bu);
  const B = BOY(S, B0, { pose: 'sit', z: -.058, h: .054 });
  const A = AGAR(S, B0, { pose: 'sit', z: -.07 });
  const C = CLAWD(S, { u: .0019, z: -.05 });
  const lc = [col3(B0.light), col3(Du.light)];
  return { S, update(t) {
    const k = eio(seg(t, E.T0, H.nover)), z = lerp(.42, .6, k), cy = lerp(-.012, -.006, k);
    aim(S.cam, [.0, cy, z, .0, cy, -.08], t, { hand: t > H.sil2 ? 0 : .0003 });
    const d = ss(seg(t, E.T0 + .3, H.nover + .4));
    D.skyMix(d); D.paint(B0, Du, d); tint(Bu.userData.m, mixHex(B0.front, Du.front, d));
    for (const F of [A, B]) for (const m of [F.body, F.arm]) tint(m, mixHex(B0.fig, Du.fig, d));
    S.key.intensity = lerp(B0.key, Du.key, d); S.key.color.copy(col3(B0.keyCol).lerp(col3(Du.keyCol), d)); S.amb.intensity = lerp(B0.amb, Du.amb, d); S.amb.color.copy(col3(B0.ambCol).lerp(col3(Du.ambCol), d));
    setL(S, .0, lerp(.06, .0, d), .32, lerp(1, 1.1, d), lc[0].clone().lerp(lc[1], d));
    const cov = ss(seg(t, H.nover - .1, H.nover + .4));
    A.set({ x: .046, y: GROUND - .0015, a: lerp(.35, 2.05, cov), rot: -.32 * cov });
    B.set({ x: -.06, y: GROUND - .0015, a: .3, rot: .08 });
    const look = t < H.arco - .2 ? -1 : t < H.nover - .2 ? 1 : .2;
    const sit = ss(seg(t, H.nover + .1, H.nover + .5));
    C.set({ x: -.004, y: GROUND - .001, look: lerp(0, look, ss(seg(t, E.T0 + .2, E.T0 + .5))), tuck: .4 * sit, blink: t > H.sil2 ? 1 : blinkAt(t, 3.3, .2), k: lerp(1, .8, d) });
    this._d = d; this._f = fsOf(S, -.06);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 6, bloom: blo(.28, 1.12) }; },
  grade() { const d = this._d || 0; return { vig: .58, sat: lerp(.8, .95, d), contrast: lerp(.2, .14, d), gain: [1.02, 1, lerp(.96, 1, d)], lift: [lerp(.012, .006, d), lerp(.007, 0, d), lerp(0, .01, d)] }; } };
}

// S10 God heard: the bush close in front, the boy curled among its branches. From above, a light comes down through the sky to the bush
// and gilds each branch. A slow crane down following the light. Agar and Clawd out of focus far behind, still.
export function S10(E) {
  const { H } = E;
  const Du = PAL.dusk, S = pstage(Du, { light: [-.01, .14, -.1], lightR: .1, lightCol: '#ffe2b0' });
  const D = dunes(S, Du, { farY: -.004, slope: .08 });
  const A = AGAR(S, Du, { pose: 'sit', z: -.09, h: .06 });
  const C = CLAWD(S, { u: .0017, z: -.085 });
  const B = BOY(S, Du, { pose: 'sit', z: -.05, h: .062, rim: 1, col: '#06040a' });
  const Bu = bush(S.U, { h: .085, z: -.056, col: '#120e18', seed: 11 }); Bu.position.set(-.008, GROUND - .003, -.056); S.scene.add(Bu);
  const warm = { far: '#8a6a70', mid: '#5a4048', front: '#140e14' };
  const T = H.oyo;
  return { S, update(t) {
    const c = eio(seg(t, E.T0, H.oyo + .9)), cy = lerp(.045, -.01, c), ly = lerp(.065, -.01, c);
    aim(S.cam, [-.004, cy, .46, -.004, ly, -.08], t, { hand: .0003 });
    const L = ss(seg(t, T - .45, T + 1.1));
    setL(S, -.008, lerp(.16, -.01, L), lerp(.06, .16, L), lerp(.4, 1.5, L));
    S.U.uBeamO.value.set(-.008, .2, lerp(0, 1.2, ss(seg(t, T - .6, T)))); S.U.uBeamD.value.set(-Math.PI / 2, .1, lerp(.03, .35, L)); S.U.uBeamCol.value.set('#ffd99a');
    D.paint(Du, warm, L * .8, '#f6d4c0');
    Bu.userData.m.material.userData.u.uGlowLit.value = ss(seg(t, T + .1, T + 1.2)) * 1.1;
    A.set({ x: .05, y: GROUND - .001, a: 2.05, rot: -.32 }); B.set({ x: -.016, y: GROUND - .0015, a: .5, rot: .12 });
    C.set({ x: .028, y: GROUND - .001, tuck: .4, look: .4, blink: 1, k: .9 });
    this._L = L; this._f = fsOf(S, -.058);
  }, post() { return { focus: this._f, aper: 11, maxCoc: 8, bloom: blo(.38, 1.0) }; }, grade() { const L = this._L || 0; return { vig: .58, sat: .95, contrast: .14, lift: [.006 + .006 * L, .003 * L, .01 * (1 - L)] }; } };
}

// The eye: two lids of black paper close to the camera; their cut edges are the two arcs of an almond and meet exactly at a slit.
// set(k): 0 = a thin slit, 1 = wide open (the upper lid leaves the top of the frame, the lower lid stays as the dark band for the subtitles)
const EA = .09, EB = .05;
export function eyelids(S, { z = -.012, col = '#0e0a14', lowRest = -.004, stars = 0 } = {}) {
  const curve = (x, s) => { x.beginPath(); x.moveTo(-.25, s * .4); for (let u = -.25; u <= .25001; u += .002) x.lineTo(u, s * EB * (1 - (u / EA) ** 2)); x.lineTo(.25, s * .4); x.closePath(); x.fill(); };
  const up = lay(S, { w: .5, h: .8, z, col, trans: .02, shadow: false, recv: false, ppm: 3000, finish: { rim: .3, rimPx: 4, under: .5, underPx: 5 }, draw: x => { curve(x, 1); if (stars) cut(x, () => { const R = mulberry(9); for (let i = 0; i < stars; i++) { x.beginPath(); x.arc((R() - .5) * .2, .02 + R() * .2, .0002 + R() * R() * .0006, 0, TAU); x.fill(); } }); } });
  const lo = lay(S, { w: .5, h: .8, z, col, trans: .02, shadow: false, recv: false, ppm: 3000, finish: { rim: .7, rimPx: 4, under: .3, rimCol: 'rgba(255,214,150,.7)' }, draw: x => curve(x, -1) });
  return { up, lo, set(k, cx, cy, slit = .0012) {
    const yU = lerp(-(EB - slit), .17, k), yL = lerp(EB - slit, lowRest, k);
    up.position.set(cx, cy + yU, z); lo.position.set(cx, cy + yL, z);
  } };
}

// S11 signature shot: the frame is a black sheet with an eye-shaped slit. On «ojos» the lids part (top and bottom); behind, the layers light up one by one,
// back to front: sky of gold, dunes, and in the middle a stone well, its water black with a gold edge. On «pozo», the film's only burst over the mouth.
// The camera goes in through the eye. Clawd at the left of the well, still, arms down: the stair of light reaches him without him moving.
export function S11(E) {
  const { H } = E;
  const Du = PAL.dusk, Go = PAL.gold, S = pstage(Go, { light: [.0, .02, -.1], lightR: .3, amb: .2, key: .6 });
  const D = dunes(S, Go, { farY: .004, slope: .1 });
  const W = pozo(S.U, { r: .022, z: -.072, col: Go.front }); W.g.position.set(.0, GROUND - .003, -.072); S.scene.add(W.g);
  const A = AGAR(S, Go, { pose: 'sit', z: -.075, rim: .95 });
  const C = CLAWD(S, { u: .0022, z: -.05 });
  const ray = burst(.1, .2, '#ffd79a'); ray.position.set(0, GROUND + W.top + .1, -.073); S.add(ray);
  const L = eyelids(S, {});
  const O = H.ojos, P0 = H.pozo, dk = '#1a1222';
  const stair = [['sky'], ['far', Du.far, Go.far, .7, .9], ['mid', Du.mid, Go.mid, .35, .7], ['ring'], ['front', Du.front, Go.front, .03, .1], ['figs']];
  return { S, update(t) {
    const z = lerp(.42, .34, eio(seg(t, E.T0, E.T0 + E.dur))), cy = lerp(-.012, -.006, eio(seg(t, O, E.T0 + E.dur)));
    aim(S.cam, [0, cy, z, 0, cy, -.08], t, { hand: .0003 });
    const op = eio(seg(t, O - .1, O + .7)); L.set(op, 0, cy - .002, .0035);
    const q = i => ss(seg(t, O + .1 + i * .3, O + .45 + i * .3));
    D.sky.material.color.setScalar(lerp(.45, 1, q(0)));
    for (const [i, [n, a, b, t0, t1]] of stair.entries()) { if (!a) continue; const m = D[n]; tint(m, mixHex(a, b, q(i))); m.material.userData.u.uTrans.value = lerp(t0, t1, q(i)); }
    tint(W.ring, mixHex(dk, Go.front, q(3))); W.ring.material.userData.u.uTrans.value = lerp(.04, .25, q(3));
    W.wat.material.userData.u.uGlowLit.value = q(3) * .8 + ss(seg(t, P0 - .1, P0 + .3)) * .6;
    const f = q(5); for (const m of [A.body, A.arm]) m.material.userData.u.uTrans.value = lerp(.02, .2, f);
    setL(S, 0, lerp(-.02, .04, q(1)), lerp(.08, .32, q(2)), lerp(.15, 1.4, q(1)));
    S.key.intensity = lerp(.25, 1.6, q(4)); S.amb.intensity = lerp(.12, .5, q(4));
    A.set({ x: .034, y: GROUND - .0015, a: .3, rot: lerp(-.25, .02, ss(seg(t, P0 - .3, P0 + .3))), flip: true });
    C.set({ x: -.031, y: GROUND - .001, look: .5, blink: 1, k: lerp(.7, 1.05, q(5)) });
    const b = ss(seg(t, P0, P0 + .35)); ray.userData.set(b * (1.1 + .05 * Math.sin(t * 7.3)));
    this._b = q(2); this._f = fsOf(S, -.07);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 6, bloom: blo(lerp(.3, .45, this._b), 1.0) }; },
  grade() { return { vig: lerp(.6, .42, this._b), sat: lerp(.95, 1.05, this._b), contrast: .12, gain: [1.04, 1, .93], lift: LIFT }; } };
}

// S12 gold: the diagonal of the hook, now golden. Agar kneels at the well and gives her son to drink; above, a great still light.
// The camera moves slowly toward Clawd, sitting in the sand a step from the well (never touching the water). On «Dios, sí» he looks at the light;
// on the question he turns to the camera.
export function S12(E) {
  const { H } = E;
  const P = PAL.gold, S = pstage(P, { light: [.01, .07, -.1], lightR: .3 });
  dunes(S, P, {});
  const sun = moon({ r: .014, x: .012, y: .098, z: -.155, gain: 2.2, core: '#fffbe8', mid: '#fff0c0', edge: '#ffe2a0', halo: 10, haloGain: .5, haloCol: '#ffe6b0' }); S.scene.add(sun);
  const W = pozo(S.U, { r: .024, z: -.072, col: P.front }); W.g.position.set(-.006, GROUND - .003, -.072); S.scene.add(W.g);
  W.wat.material.userData.u.uGlowLit.value = .9; W.ring.material.userData.u.uTrans.value = .2;
  const A = AGAR(S, P, { pose: 'kneel', z: -.068, rim: .9, h: .082 });
  const sk = odre(S.U, { s: .017 }); A.arm.add(sk); sk.position.set(0, -A.al, .001); sk.rotation.z = Math.PI * .75; sk.material.userData.u.uTrans.value = .02; tint(sk, '#3a2c20');
  const B = BOY(S, P, { z: -.066, rim: .9 });
  const C = CLAWD(S, { u: .0026, z: -.05, glow: .36 });
  return { S, update(t) {
    const k = eio(seg(t, H.nadie - .2, H.cta + .4)), z = lerp(.56, .48, k), cx = lerp(.006, .004, k), cy = lerp(-.01, -.013, k);
    aim(S.cam, [cx, cy, z, cx, cy, -.08], t, { hand: .0004 });
    A.set({ x: .02, y: GROUND - .0015, a: 1.75 + bob(t, .9, .04), rot: -.04 });
    B.set({ x: .05, y: GROUND - .001, a: .5, rot: .06 + bob(t, .9, .02), flip: true });
    const toLight = ss(seg(t, H.diossi - .1, H.diossi + .3)) * (1 - ss(seg(t, H.cta - .3, H.cta + .1))), toCam = ss(seg(t, H.cta - .2, H.cta + .25));
    const hop = Math.abs(Math.sin(Math.max(0, t - H.cta) * 6)) * .0016 * (t > H.cta && t < H.cta + .55 ? 1 : 0);
    C.set({ x: -.038, y: GROUND - .001 + hop, tuck: .3 * (1 - toCam), look: lerp(lerp(.5, 1, toLight), 0, toCam), aL: toLight * .3, aR: toLight * .3, blink: blinkAt(t, 2.9, .1), k: 1 });
    this._f = lerp(fsOf(S, -.068), fsOf(S, -.05), ss(seg(t, H.nadie, H.diossi)));
  }, post() { return { focus: this._f, aper: 7, maxCoc: 7, bloom: blo(.32, 1.1) }; }, grade() { return G_GOLD; } };
}
