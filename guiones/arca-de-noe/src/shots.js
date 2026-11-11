// The twelve shots of «Trescientos codos» (Genesis 6–9). Each: { S, update(t), post(), grade() }; t in film seconds. God is only ever light.
import * as THREE from 'three';
import { skyPanel, moon, setMoon, text, burst } from './paper.js';
import { stage, aim } from './stage.js';
import { mulberry, seg, ss, eio, eo, ei, lerp, clamp, vnoise, TAU } from './lib.js';
import { mk, cut, tint, clawd, human, waveFill, ark, arkFront, arkSection, ladder, lantern, dove, rain, bowBands, ridgeFill } from './actors.js';

const blo = (s = .34, th = 1.1) => ({ strength: s, radius: .6, threshold: th });
const lay = (S, o) => S.add(mk(S.U, o));
const col3 = c => new THREE.Color(c);
const mixHex = (a, b, k) => '#' + col3(a).lerp(col3(b), clamp(k)).getHexString();
const setL = (S, x, y, r, lit, c) => { S.U.uLight.value.x = x; S.U.uLight.value.y = y; S.U.uLightR.value = r; S.U.uLit.value = lit; if (c) S.U.uLightCol.value.copy(c); };
const bob = (t, f, a, p = 0) => Math.sin(t * f + p) * a;
const fsOf = (S, z) => S.cam.position.z - z;
const blinkAt = (t, ph = 0, per = 3.1) => 1 - .9 * Math.max(0, 1 - Math.abs(((t + ph) % per) - .1) / .1);
const followKey = (S, x) => { S.key.position.x = x; S.key.target.position.x = x; };

// —— shared scenery ——
export function nightSky(S, { moonAt = null, stars = 140, w = 1.6, h = 1.4, x = 0, y = 0, z = -.17, starMinY = -.02 } = {}) {
  S.add(skyPanel({ w, h, x, y, z, stops: [[0, '#070c22'], [.42, '#121d45'], [.62, '#2a3c72'], [.75, '#3f5a92'], [1, '#26345e']], stars, starMinY, seed: 9 }));
  if (moonAt) { const m = moon({ r: .009, x: moonAt[0], y: moonAt[1], z: z + .005, gain: 1.6, halo: 7, haloGain: .4 }); S.scene.add(m); return m; }
}
// A ground / hill sheet whose top edge sits at world height `top` (a drawn edge, never a plain rectangle)
export function land(S, { z, col, top, amp = .004, len = .2, ph = 0, w = 1, x = 0, trans = .04, rim = .5, ppm = 2000, h = .4, peak = 1.3 }) {
  const yc = top - h / 2 + .02;
  return lay(S, { w, h, x, y: yc, z, col, trans, ppm, finish: { rim }, draw: c => { c.translate(-0, -yc); waveFill(c, { x0: -w / 2, x1: w / 2, base: top - amp * .5, amp, len, ph, peak }); } });
}
export function hills(S, { z, col, base, peaks, w = 1, x = 0, trans = .1, rim = .5, ppm = 2000, rough = .0015, ph = 0, h = .5 }) {
  const top = base + Math.max(0, ...peaks.map(q => q[1])) + .01, yc = top - h / 2;
  return lay(S, { w, h, x, y: yc, z, col, trans, ppm, finish: { rim }, draw: c => { c.translate(0, -yc); ridgeFill(c, { x0: -w / 2, x1: w / 2, base, peaks, rough, ph }); } });
}

// The building site at night: the half-built hull standing on the ground, scaffolding, lanterns, Noah high on a plank. Used by S1 and the cover.
export function workSite(S, { L = .5, hh = .3, gy = -.062, x0 = -.02, noeLevel = 1 } = {}) {
  const A = ark(S.U, { L, h: hh, built: .5, z: -.1, scaffold: .8, lanterns: 5, door: [0, 0, 0], ppm: 2800 });
  A.g.position.set(x0 + L / 2, gy, -.1); S.scene.add(A.g);
  const N = human(S.U, { h: .034, z: -.0915, col: '#05070d', rim: .7 }); S.scene.add(N.g);
  const ny = gy + A.levels[noeLevel] + .3 * .012 * .8;
  return { A, N, ny };
}

// —— S1 the hook: tilt up the hull from its foot; Clawd tiny; the paper title at the start ——
export function S1(E) {
  const { H } = E;
  const S = stage({ light: [-.03, .1, -.1], lightR: .24, lightCol: '#9fb4e0', key: 1.15, keyCol: '#d6def5', amb: .32, ambCol: '#5a6fa8', floor: .35 });
  nightSky(S, { moonAt: [-.05, .115] });
  land(S, { z: -.145, col: '#2a3966', top: -.03, amp: .014, len: .3, ph: 1, trans: .5, w: 1.2 });
  const { A, N, ny } = workSite(S);
  land(S, { z: -.075, col: '#121a30', top: -.063, amp: .003, len: .15, ph: 2, w: .8 });
  const lan = lantern(S.U, { h: .016, z: -.058 }); lan.position.set(-.016, -.064, -.058); S.add(lan);
  const C = clawd(S.U, { u: .0026, z: -.056 }); S.scene.add(C.g);
  land(S, { z: -.032, col: '#04060c', top: -.071, amp: .006, len: .12, ph: 4, w: .6, ppm: 1800 });
  S.scene.add(S.cam);
  const title = mk(S.U, { w: .118, h: .05, z: 0, col: '#e7d4a8', trans: .35, shadow: false, recv: false, finish: { rim: .3, under: .2 }, draw: x => {
    x.beginPath(); x.roundRect(-.058, -.024, .116, .048, .002); x.fill();
    cut(x, () => { text(x, 'EL ARCA DE NOÉ', 0, .0058, .0112, 'Cinzel', { weight: 800, fill: '#000' }); text(x, 'Génesis 6–9', 0, -.0118, .0096, 'Playfair', { weight: 'italic 500', fill: '#000' }); });
  }, glowDraw: x => { x.fillStyle = '#fff'; x.fillRect(-.06, -.026, .12, .052); }, glow: .55, glowCol: '#e7d4a8', glowRes: .2 });
  S.cam.add(title); S.layers.push(title);
  const wp = new THREE.Vector3();
  return { S, update(t) {
    const k = eio(seg(t, 0, 4.5)), z = lerp(.62, .585, k), ty = lerp(-.035, .004, k);
    aim(S.cam, [.035, -.05, z, .035, ty, -.08], t);
    const raise = ss(seg(t, H.codos, H.codos + .45));
    C.set({ x: .006, y: -.062 + Math.abs(bob(t, 1.3, .0005)), look: lerp(.2, .5, raise), lookY: lerp(.4, 1, k), blink: blinkAt(t, .4), aL: raise * (2.2 + bob(t, 3, .08)), aR: raise * (2.2 - bob(t, 3, .08)), k: 1.1 });
    N.set({ x: .045, y: ny, a: .5 + Math.max(0, Math.sin(t * 5.2)) * .9, rot: -.03 });
    lan.material.emissiveIntensity = 2.6 * (.92 + .08 * vnoise(t * 7));
    // title, held in front of the camera at the focus distance
    const D = fsOf(S, -.056), ts = D / .6, reveal = ss(seg(t, .05, .55)) * (1 - ss(seg(t, H.titulo_fin - .5, H.titulo_fin)));
    title.scale.setScalar(ts); title.position.set(0, .4617 * D / 2 * .58, -D); title.visible = reveal > .002;
    S.cam.updateMatrixWorld(); title.getWorldPosition(wp);
    title.material.userData.u.uClip.value.set(wp.x, wp.y, .085 * reveal * ts, 0);
    this._f = D;
  }, post() { return { focus: this._f, aper: 7, maxCoc: 6, bloom: blo(.38, 1.0) }; }, grade() { return { vig: .5, sat: 1.04 }; } };
}

// —— S2 the length: Clawd walks the side of the hull, the camera tracks with him, then pulls out ——
export function S2(E) {
  const { H } = E, T0 = E.T0, T1 = E.T0 + E.dur;
  const S = stage({ light: [0, .12, -.1], lightR: .3, lightCol: '#9fb4e0', key: 1.2, keyCol: '#d6def5', amb: .34, ambCol: '#5a6fa8', floor: .38, keyAngle: .9 });
  nightSky(S, { moonAt: [.3, .17], w: 2.2, h: 1.6 });
  land(S, { z: -.15, col: '#26345e', top: -.05, amp: .02, len: .35, ph: 2, trans: .5, w: 2 });
  const A = ark(S.U, { L: 1.0, h: .26, built: .84, z: -.11, scaffold: .55, lanterns: 9, door: [0, 0, 0], ppm: 2800 }); A.g.position.set(-.05, -.1, -.11); S.scene.add(A.g);
  land(S, { z: -.075, col: '#121a30', top: -.1, amp: .003, len: .15, ph: 2, w: 2 });
  const N = human(S.U, { h: .036, z: -.08, col: '#05070d', rim: .7 }); S.scene.add(N.g);
  const C = clawd(S.U, { u: .0022, z: -.056 }); S.scene.add(C.g);
  // the poles that pass close to the lens (parallax), with hanging lanterns
  const poles = lay(S, { w: 1.6, h: .5, x: .1, y: .02, z: -.022, col: '#03050a', trans: .02, shadow: false, recv: false, ppm: 1500, finish: { rim: .4 }, draw: x => {
    for (let i = 0; i < 9; i++) { const px = -.75 + i * .19; x.fillRect(px - .004, -.25, .008, .5); x.fillRect(px + .004, .05, .03, .004); x.fillRect(px + .03, .032, .001, .018); x.fillRect(px + .025, .022, .011, .012); }
  }, glowDraw: x => { x.fillStyle = '#fff'; for (let i = 0; i < 9; i++) { const px = -.75 + i * .19; x.beginPath(); x.arc(px + .0305, .028, .005, 0, TAU); x.fill(); } }, glow: 3, glowCol: '#ffb862', glowRes: .4 });
  land(S, { z: -.03, col: '#04060c', top: -.112, amp: .006, len: .14, ph: 5, w: 2, ppm: 1400 });
  return { S, update(t) {
    const w = seg(t, T0 + .1, H.a04 + .8), xs = lerp(-.3, .38, eio(w) * .3 + w * .7), moving = w > 0 && w < 1 ? 1 : 0;
    const k2 = eio(seg(t, H.a04 - .15, T1)), z = lerp(.82, 1.15, k2), cx = lerp(xs + .012, .3, k2), cy = lerp(-.012, .012, k2);
    aim(S.cam, [cx, cy, z, cx, cy, -.08], t, { hand: .0008 });
    followKey(S, cx); setL(S, cx, .12, .3, 1);
    const stop = ss(seg(t, H.a04 + .7, H.a04 + 1.1));
    C.set({ x: xs, y: -.1 + Math.abs(Math.sin(xs * 260)) * .0012 * moving, walk: xs * 260, stride: .55 * moving, look: lerp(.6, -1, stop), lookY: .3, blink: blinkAt(t, .2), aL: .25 * moving, aR: .25 * moving, k: 1.1 });
    N.set({ x: .07, y: -.1, a: lerp(.3, 1.55, ss(seg(t, H.largo + 1.2, H.largo + 1.7))) });
    poles.material.emissiveIntensity = 3 * (.9 + .1 * vnoise(t * 6));
    this._f = fsOf(S, -.056);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 7, bloom: blo(.36, 1.0) }; }, grade() { return { vig: .5, sat: 1.04 }; } };
}

// —— S3 width and height: the end of the ark head-on; Clawd walks its width, then climbs to the top (crane up) ——
export function S3(E) {
  const { H } = E;
  const S = stage({ light: [0, .06, -.1], lightR: .24, lightCol: '#9fb4e0', key: 1.2, keyCol: '#d6def5', amb: .32, ambCol: '#5a6fa8', floor: .35 });
  nightSky(S, { moonAt: [-.06, .16] });
  land(S, { z: -.15, col: '#26345e', top: -.04, amp: .02, len: .3, ph: .5, trans: .5 });
  const F = arkFront(S.U, { w: .16, h: .094, rh: .024, z: -.1 }); F.g.position.set(0, -.06, -.1); S.scene.add(F.g);
  const sc = lay(S, { w: .26, h: .2, y: .02, z: -.093, col: '#0e0a08', trans: .04, ppm: 3200, finish: { rim: .5 }, draw: x => {   // scaffold poles at both corners
    for (const px of [-.092, -.106]) x.fillRect(px - .0012, -.1, .0024, .145); for (const py of [-.05, .0, .035]) x.fillRect(-.112, py, .028, .0022);
  } });
  const lad = ladder(S.U, { h: .112, w: .011, z: -.086 }); lad.position.set(.086, -.06 + .056, -.086); S.add(lad);
  land(S, { z: -.075, col: '#121a30', top: -.061, amp: .003, len: .15, ph: 2 });
  const lan = lantern(S.U, { h: .015, z: -.07 }); lan.position.set(-.06, -.062, -.07); S.add(lan);
  const C = clawd(S.U, { u: .0018, z: -.078 }); S.scene.add(C.g);
  land(S, { z: -.035, col: '#04060c', top: -.072, amp: .005, len: .12, ph: 3, w: .6 });
  return { S, update(t) {
    const c = ss(seg(t, H.a06 - .2, H.a06 + 1.0)), cy = lerp(-.016, .068, c), cx = lerp(.004, .02, c);
    aim(S.cam, [cx, cy, .67, cx, cy, -.08], t, { hand: .0006 });
    const w = seg(t, H.ancho + .05, H.a06 - .35), xs = lerp(-.06, .086, eio(w)), walking = w > 0 && w < 1 ? 1 : 0;
    const cl = seg(t, H.a06 - .25, H.a06 + .95), climbing = cl > 0 && cl < 1 ? 1 : 0, ys = -.06 + .094 * eio(cl);
    const top = ss(seg(t, H.a06 + .9, H.a06 + 1.2));
    C.set({ x: xs, y: ys + Math.abs(Math.sin(t * 18)) * .001 * (walking + climbing), walk: walking ? xs * 330 : t * 14 * climbing, stride: .5 * (walking + climbing),
      aL: climbing ? 1.4 + Math.sin(t * 14) * .6 : 0, aR: climbing ? 1.4 - Math.sin(t * 14) * .6 : top * 2.3, look: climbing ? 0 : lerp(.8, -.4, top), lookY: climbing ? 1 : .3, blink: blinkAt(t, 1.1), k: 1.1 });
    this._f = fsOf(S, -.078);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 6, bloom: blo(.36, 1.0) }; }, grade() { return { vig: .48, sat: 1.04 }; } };
}

// —— S4 insert: pitch slides over the planks, inside and out ——
export function S4(E) {
  const { H } = E;
  const S = stage({ light: [-.04, .05, -.1], lightR: .2, lightCol: '#ffc98a', key: 2.0, keyCol: '#ffe3c0', amb: .3, ambCol: '#7d7a90', floor: .3 });
  const back_ = lay(S, { w: .3, h: .12, y: .05, z: -.11, col: '#4a3d33', trans: .3, ppm: 2600, draw: x => { x.fillRect(-.15, -.06, .3, .12); x.fillStyle = '#707070'; for (let y = -.06; y < .06; y += .016) x.fillRect(-.15, y, .3, .0008); } });
  const pitch2 = lay(S, { w: .3, h: .12, y: .05, z: -.1095, col: '#0c0b0d', trans: .02, rough: .35, ppm: 2200, finish: { rim: .8, rimCol: 'rgba(255,240,215,.7)' }, draw: x => x.fillRect(-.15, -.06, .3, .12) });
  const planks = lay(S, { w: .3, h: .3, z: -.09, col: '#7a6656', trans: .25, ppm: 3000, finish: { rim: .55, rimPx: 4 }, draw: x => {
    x.fillRect(-.15, -.15, .3, .3); const R = mulberry(6);
    x.fillStyle = '#6e6e6e'; for (let i = 0; i < 40; i++) { const y = -.15 + R() * .3, x0 = -.15 + R() * .3; x.fillRect(x0, y, .02 + R() * .05, .0004); }   // grain
    x.fillStyle = '#3a3a3a'; for (let y = -.15; y < .15; y += .019) for (let xx = -.15 + (Math.round(y * 100) % 3) * .03; xx < .15; xx += .09) { x.beginPath(); x.arc(xx + .004, y + .0095, .0011, 0, TAU); x.fill(); }   // pegs
    cut(x, () => { for (let y = -.15; y < .15; y += .019) x.fillRect(-.15, y - .0004, .3, .0008); x.fillRect(-.15, .044, .3, .008); });   // seams + the gap (the inside, seen through)
  } });
  const pitch = lay(S, { w: .3, h: .3, z: -.0885, col: '#0b0a0c', trans: .02, rough: .3, ppm: 2400, finish: { rim: .85, rimPx: 5, rimCol: 'rgba(255,240,215,.75)', under: .4 }, draw: x => {
    x.fillRect(-.15, -.15, .3, .3); cut(x, () => x.fillRect(-.15, .044, .3, .008));
  }, glowDraw: x => { x.strokeStyle = '#fff'; x.lineWidth = .0012; for (let i = 0; i < 9; i++) { x.beginPath(); x.moveTo(-.15 + i * .04, -.15); x.bezierCurveTo(-.13 + i * .04, -.05, -.16 + i * .04, .05, -.14 + i * .04, .15); x.stroke(); } }, glow: .22, glowCol: '#c8b8a0', glowRes: .3 });
  const beam = land(S, { z: -.05, col: '#0b0705', top: -.042, amp: .001, len: .3, w: .4, ppm: 2400 });
  const C = clawd(S.U, { u: .0034, z: -.058 }); S.scene.add(C.g);
  const edge = (t, a, b) => -.15 + .37 * eio(seg(t, a, b));
  return { S, update(t) {
    const x = lerp(-.012, .012, seg(t, E.T0, E.T0 + E.dur));
    aim(S.cam, [x, .003, .37, x, .003, -.08], t, { hand: .0005 });
    const e1 = edge(t, H.brea + .05, H.brea + 1.5), e2 = edge(t, H.brea + .45, H.brea + 1.85);
    pitch.material.userData.u.uClip.value.set(e1 - 1.2, 0, 1.2, 0); pitch.visible = e1 > -.149;
    pitch2.material.userData.u.uClip.value.set(e2 - 1.2, 0, 1.2, 0); pitch2.visible = e2 > -.149;
    const near = ss(seg(e1, -.055, -.03));   // the sheet reaches Clawd: he takes his hands back
    C.set({ x: -.02, y: -.042, aL: lerp(1.1, .0, near), aR: lerp(1.1, .1, near), tuck: near * .25, look: lerp(-.6, .7, ss(seg(e1, -.12, .05))), lookY: -.2, blink: blinkAt(t, .7), k: 1.2 });
    this._f = fsOf(S, -.058);
  }, post() { return { focus: this._f, aper: 9, maxCoc: 7, bloom: blo(.3, 1.1) }; }, grade() { return { vig: .5 }; } };
}

// —— S5 the ark as a lamp: three decks light from the bottom up; the window above; the door in the side ——
export function S5(E) {
  const { H } = E, T1 = E.T0 + E.dur;
  const S = stage({ light: [0, .02, -.1], lightR: .2, lightCol: '#9fb4e0', key: .9, keyCol: '#d6def5', amb: .22, ambCol: '#5a6fa8', floor: .25 });
  nightSky(S, { stars: 90 });
  const X = -.11, Y = -.065;
  const A = arkSection(S.U, { W: .36, h: .13, rh: .035, z: -.09 }); A.g.position.set(X, Y, -.09); S.scene.add(A.g);
  const C = clawd(S.U, { u: .0018, z: -.0915 }); S.scene.add(C.g);
  const win = { x: X + A.win.x, y: Y + A.win.y };
  land(S, { z: -.04, col: '#04060c', top: Y + .002, amp: .004, len: .2, ph: 1, w: .6 });
  return { S, update(t) {
    const up = ss(seg(t, H.a08 + .1, H.a09 + .55)), out = eio(seg(t, H.a09 + .9, T1 - .2));
    const cy = lerp(lerp(-.034, -.03, up), -.028, out), cx = lerp(lerp(.014, .0, up), .006, out), z = lerp(lerp(.36, .5, up), .55, out);   // the section always stands above a dark band (subtitles)
    aim(S.cam, [cx, cy, z, cx, cy, -.08], t, { hand: .0004 });
    A.floors.forEach((m, i) => { const k = ss(seg(t, H.pisos + .1 + .4 * i, H.pisos + .4 + .4 * i)); m.material.userData.u.uGlowLit.value = k; m.material.userData.u.uTrans.value = .1 + .8 * k; });
    const kw = ss(seg(t, H.ventana + .15, H.ventana + .5)), kd = ss(seg(t, H.puertaS5, H.puertaS5 + .35));
    A.winGlow.material.userData.u.uGlowLit.value = kw; A.winGlow.material.userData.u.uTrans.value = .1 + .8 * kw;
    A.doorGlow.material.userData.u.uGlowLit.value = kd; A.doorGlow.material.userData.u.uTrans.value = .1 + .8 * kd;
    const lit = (A.floors.reduce((a, m) => a + m.material.userData.u.uGlowLit.value, 0) + kw) / 4;
    setL(S, cx, cy + .04, .2, lerp(.5, 1.1, lit), col3('#9fb4e0').lerp(col3('#ffd9a0'), lit));
    const atWin = t > H.ventana + .15;
    if (!atWin) { const w = seg(t, E.T0, H.ventana), xs = lerp(-.004, .035, w); C.set({ x: xs, y: Y + A.floorY[0], walk: xs * 400, stride: .5, look: .7, blink: blinkAt(t), k: 1.1 }); }
    else C.set({ x: win.x, y: win.y + .0006, aR: ss(seg(t, H.ventana + .6, H.ventana + 1)) * 1.6, look: .3, lookY: .2, blink: blinkAt(t, .5), k: 1.3 });
    this._f = fsOf(S, -.09);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 6, bloom: blo(.4, 1.0) }; }, grade() { return { vig: .5, sat: 1.04 }; } };
}

// —— S6 the eight go in: rain begins, the door open on warm light, a ramp. Then the first silence: the light grows ——
export function S6(E) {
  const { H } = E, T1 = E.T0 + E.dur;
  const S = stage({ light: [0, .04, -.1], lightR: .22, lightCol: '#a7b5d6', key: 1.0, keyCol: '#d6def5', amb: .3, ambCol: '#5d6b96', floor: .3 });
  S.add(skyPanel({ w: 1.2, h: 1.2, z: -.17, stops: [[0, '#0b1020'], [.5, '#1a2743'], [.8, '#2f3d5c'], [1, '#3a4766']] }));
  const R0 = mulberry(21);
  lay(S, { w: .8, h: .25, y: .14, z: -.15, col: '#2a3550', trans: .6, ppm: 1600, draw: x => { for (let i = 0; i < 30; i++) { x.beginPath(); x.arc((R0() - .5) * .8, -.04 + R0() * .13, .03 + R0() * .05, 0, TAU); x.fill(); } } });
  const rainB = rain(S.U, { w: .4, h: .4, z: -.14, n: 220, len: .016, lw: .0003, col: '#8d9dc0', speed: .55, x: .02, y: -.15, seed: 2 }); S.add(rainB);
  const GY = -.07;
  const A = ark(S.U, { L: .8, h: .2, rh: .035, z: -.1, door: [.25, .17, .27], win: [-.2, .25], ppm: 2600, glow: 1.6 }); A.g.position.set(-.2, GY, -.1); S.scene.add(A.g);
  A.door.rotation.y = -1.22;
  const sill = GY + A.doorAt.y, dR = A.doorAt.w / 2;
  const P = [[.2, GY], [.085, GY], [dR, sill], [-.006, sill]];
  const ramp = lay(S, { w: .11, h: .03, x: .05, y: GY + .01, z: -.0975, col: '#7a6450', trans: .15, ppm: 4000, finish: { rim: .55 }, draw: x => {
    x.translate(-.05, -(GY + .01)); x.beginPath(); x.moveTo(dR, sill); x.lineTo(.088, GY); x.lineTo(.084, GY - .004); x.lineTo(dR, sill - .004); x.closePath(); x.fill();
    for (let k = 0; k < 8; k++) { const a = (k + .5) / 8, px = lerp(dR, .088, a), py = lerp(sill, GY, a); x.fillRect(px - .0012, py, .0024, .0016); }
  } });
  land(S, { z: -.08, col: '#121828', top: GY - .001, amp: .002, len: .15, ph: 2 });
  // Noah and the seven: one path, from the right, up the ramp, through the door
  const segs = []; let Ltot = 0; for (let i = 0; i < 3; i++) { const l = Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]); segs.push(l); Ltot += l; }
  const at = s => { s = clamp(s, 0, Ltot); for (let i = 0; i < 3; i++) { if (s <= segs[i] || i === 2) { const k = clamp(s / segs[i]); return [lerp(P[i][0], P[i + 1][0], k), lerp(P[i][1], P[i + 1][1], k), i]; } s -= segs[i]; } };
  const tone = ['#05070d', '#0a0c14', '#070910', '#0b0d16', '#06080f', '#0a0b12', '#080a12', '#0c0e17'];
  const folk = [.046, .042, .044, .04, .043, .039, .042, .038].map((h, i) => { const p = human(S.U, { h, z: -.0985, col: tone[i], rim: .75 }); S.scene.add(p.g); return p; });
  const noeS = s0 => t => s0 + .07 * Math.max(0, t - (E.T0 + .2));
  const pathOf = i => i === 0 ? noeS(.08) : (t => -(.02 + .024 * (i - 1)) + .125 * Math.max(0, t - (H.a10 + 1.1)));
  const paths = folk.map((_, i) => pathOf(i));
  const C = clawd(S.U, { u: .0021, z: -.062 }); S.scene.add(C.g);
  const beam = burst(.16, .26, '#ffd79a'); beam.rotation.z = Math.PI; beam.position.set(0, .075, -.096); S.add(beam);
  const rainF = rain(S.U, { w: .2, h: .3, z: -.035, n: 70, len: .02, lw: .00035, col: '#b6c3df', speed: .8, x: .015, y: -.12, seed: 7 }); S.add(rainF);
  land(S, { z: -.036, col: '#04060c', top: GY - .006, amp: .004, len: .12, ph: 4, w: .5 });
  return { S, update(t) {
    const k = eio(seg(t, E.T0, T1)), cx = lerp(.016, .012, k);
    aim(S.cam, [cx, -.02, lerp(.52, .47, k), cx, -.02, -.08], t, { hand: .0005 });
    rainB.userData.set(t); rainF.userData.set(t);
    let nearest = 1;
    folk.forEach((p, i) => {
      const s = paths[i](t), [x, y, sg] = at(s), inside = x < dR - .004, gone = s >= Ltot - .0005 || s < -.12;
      p.g.visible = !gone && s > -.11; p.g.position.z = inside ? -.1013 : -.0985;
      const step = Math.sin(s * 520);
      p.set({ x, y: (s < 0 ? GY : y) + Math.abs(step) * .0006, a: i === 0 ? .25 : .15 + step * .15, rot: (i === 0 ? .1 : .02) + (sg === 1 ? .05 : 0), s: 1 });
      p.g.scale.x = -1; if (s < 0) p.g.position.x = P[0][0] - s;   // queued off to the right
      if (!gone && s > 0 && s < Ltot) nearest = Math.min(nearest, (x - (-.034)) / .06);
    });
    const sil = ss(seg(t, H.silencio1, H.silencio1 + .4));
    C.set({ x: -.034, y: GY, look: clamp(nearest, -.2, 1), lookY: .2 + .5 * sil, blink: blinkAt(t, .3, 2.4), k: 1.1 + .3 * sil, aR: sil * .6 });
    A.inner.material.userData.u.uGlowLit.value = 1 + .8 * sil;
    beam.userData.set(.25 + .9 * sil);
    setL(S, 0, .04, lerp(.22, .3, sil), lerp(1, 1.5, sil), col3('#a7b5d6').lerp(col3('#ffdca0'), sil));
    this._f = fsOf(S, -.062);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 6, bloom: blo(.4, 1.0) }; }, grade() { return { vig: .5, sat: 1.0 }; } };
}

// —— S7 «Y el Señor cerró la puerta»: from inside, the leaf swings on its hinge, the light narrows to a slit and is gone ——
export function S7(E) {
  const { H } = E;
  const S = stage({ light: [0, -.015, -.1], lightR: .12, lightCol: '#ffdca0', key: .7, keyCol: '#ffe6c4', amb: .14, ambCol: '#6a5a50', floor: .1 });
  const out = skyPanel({ w: .1, h: .14, y: -.02, z: -.14, gain: 1.6, stops: [[0, '#fff6e0'], [.6, '#ffe2a8'], [1, '#ffd38c']] }); S.add(out);
  const DW = .05, DH = .08, DY = -.056;
  const wall = lay(S, { w: .4, h: .3, z: -.1, col: '#2a2018', trans: .12, ppm: 2600, finish: { rim: .5 }, draw: x => {
    x.fillRect(-.2, -.15, .4, .3); x.fillStyle = '#6a6a6a'; for (let px = -.2; px < .2; px += .06) x.fillRect(px, -.15, .005, .3); x.fillRect(-.2, .05, .4, .006);
    cut(x, () => { for (let y = -.15; y < .15; y += .012) x.fillRect(-.2, y, .4, .0005); x.fillRect(-DW / 2, DY, DW, DH); });
  } });
  const leaf = lay(S, { w: DW, h: DH, ax: DW / 2, x: 0, y: DY + DH / 2, z: -.0985, col: '#3a2c20', trans: .1, ppm: 4000, finish: { rim: .55 }, draw: x => {
    x.fillRect(-DW / 2, -DH / 2, DW, DH); x.fillStyle = '#6a6a6a'; for (let k = 1; k < 5; k++) x.fillRect(-DW / 2 + k * DW / 5 - .0003, -DH / 2, .0006, DH); x.fillRect(-DW / 2, DH * .22, DW, DH * .07); x.fillRect(-DW / 2, -DH * .3, DW, DH * .07);
  } });
  const beam = burst(.13, .2, '#ffd79a'); beam.rotation.z = Math.PI; beam.position.set(0, DY + DH + .06, -.097); S.add(beam);
  const lans = [-.075, .07].map(x => { const l = lantern(S.U, { h: .016, z: -.096, k: 2.4 }); l.position.set(x, -.005, -.096); S.add(l); return l; });
  land(S, { z: -.07, col: '#140e0a', top: -.058, amp: .001, len: .3, ph: 1, w: .5 });
  const C = clawd(S.U, { u: .003, z: -.056 }); S.scene.add(C.g);
  land(S, { z: -.04, col: '#070504', top: -.064, amp: .002, len: .2, ph: 3, w: .4 });
  return { S, update(t) {
    aim(S.cam, [-.006, -.014, .42, -.006, -.014, -.08], t, { hand: .0004 });
    const grow = ss(seg(t, E.T0, H.a12)), shut = ei(seg(t, H.puerta - .6, H.puerta - .02)), open = 1 - shut;
    leaf.rotation.y = 1.3 * open;
    const thud = t > H.puerta - .02 ? Math.exp(-(t - H.puerta) * 9) : 0;
    out.material.color.setScalar(lerp(1.3, 1.9, grow) * (shut < 1 ? 1 : 0));
    beam.userData.set(lerp(.5, 1.25, grow) * Math.pow(open, .6));
    setL(S, 0, -.015, lerp(.12, .16, grow), lerp(1.2, 1.7, grow) * (.25 + .75 * Math.pow(open, .5)));
    S.key.intensity = lerp(.9, .45, shut); S.amb.intensity = lerp(.18, .1, shut);
    const after = ss(seg(t, H.puerta, H.puerta + .35)), turn = t > H.puerta + .7;
    const sq = 1 - .8 * Math.max(0, 1 - Math.abs(t - (H.puerta + .7)) / .12);
    C.set({ x: -.036 - .004 * after, y: -.06 + thud * .002, back: !turn, look: -.4, lookY: .2, tuck: .35 * after, aL: (1 - after) * .4, aR: (1 - after) * .4, blink: blinkAt(t, .2), k: lerp(1.2, .9, shut) });
    C.g.scale.x = sq; C.g.scale.y = 1;
    lans.forEach((l, i) => { l.material.emissiveIntensity = 2.4 * (.9 + .1 * vnoise(t * 6 + i * 9)); });
    this._f = fsOf(S, -.056);
  }, post() { return { focus: this._f, aper: 8, maxCoc: 7, bloom: blo(.45, .95) }; }, grade() { return { vig: .55, sat: 1.02 }; } };
}

// —— S8 forty days and forty nights: a fixed frame on the high window; only the light changes ——
export function S8(E) {
  const { H } = E;
  const S = stage({ light: [0, .03, -.1], lightR: .14, lightCol: '#a8b6d6', key: .7, keyCol: '#c4d0ee', amb: .16, ambCol: '#55607e', floor: .12 });
  const sky = skyPanel({ w: .4, h: .4, z: -.16, stops: [[0, '#d8dde6'], [1, '#a9b2c4']] }); S.add(sky);
  const R0 = mulberry(31);
  const cloud = lay(S, { w: .3, h: .12, y: .12, z: -.155, col: '#5a6478', trans: .6, ppm: 1800, draw: x => { for (let i = 0; i < 18; i++) { x.beginPath(); x.arc((R0() - .5) * .3, -.03 + R0() * .07, .015 + R0() * .03, 0, TAU); x.fill(); } } });
  const bolt = lay(S, { w: .08, h: .12, x: .01, y: .05, z: -.152, col: '#eef3ff', trans: 0, shadow: false, recv: false, ppm: 3000, draw: x => { x.lineWidth = .0012; x.beginPath(); x.moveTo(.02, .06); x.lineTo(0, .02); x.lineTo(.01, .012); x.lineTo(-.012, -.03); x.lineTo(-.004, -.034); x.lineTo(-.022, -.06); x.stroke(); }, glowDraw: x => { x.strokeStyle = '#fff'; x.lineWidth = .0018; x.beginPath(); x.moveTo(.02, .06); x.lineTo(0, .02); x.lineTo(.01, .012); x.lineTo(-.012, -.03); x.lineTo(-.004, -.034); x.lineTo(-.022, -.06); x.stroke(); }, glow: 6, glowCol: '#e6eeff' });
  const rains = [[-.145, .35, '#c4cee2', 1], [-.13, .55, '#d4dcec', 2], [-.115, .8, '#e2e8f4', 3]].map(([z, sp, c, sd]) => { const r = rain(S.U, { w: .14, h: .16, z, n: 110, len: .016, lw: .0006, col: c, speed: sp, x: 0, y: -.05, seed: sd, slant: .2 }); S.add(r); return r; });
  const WX = .04, WY0 = -.004, WY1 = .05;
  lay(S, { w: .4, h: .3, z: -.09, col: '#251c15', trans: .1, ppm: 2400, finish: { rim: .55 }, draw: x => {
    x.fillRect(-.2, -.15, .4, .3); x.fillStyle = '#5e5e5e'; x.fillRect(-WX - .006, WY0 - .006, 2 * WX + .012, .006); for (let px = -.18; px < .2; px += .055) x.fillRect(px, -.15, .004, .3);
    cut(x, () => { for (let y = -.15; y < .15; y += .011) x.fillRect(-.2, y, .4, .0004); x.fillRect(-WX, WY0, 2 * WX, WY1 - WY0); });
    x.fillStyle = PAPERG; x.fillRect(-.0015, WY0, .003, WY1 - WY0);
  } });
  const lan = lantern(S.U, { h: .014, z: -.086, k: 2.2 }); lan.position.set(.062, -.03, -.086); S.add(lan);
  const C = clawd(S.U, { u: .0024, z: -.072 }); S.scene.add(C.g);
  land(S, { z: -.05, col: '#060504', top: -.07, amp: .002, len: .2, w: .4 });
  const bolts = [H.lluvia + .35, H.lluvia + 1.35, H.lluvia + 2.3];
  const day = col3('#c9cfdb'), night = col3('#0e1426');
  return { S, update(t) {
    aim(S.cam, [0, .02, .46, 0, .02, -.08], t, { hand: .00025 });
    const flash = bolts.reduce((a, b) => Math.max(a, seg(t, b, b + .04) * (1 - seg(t, b + .05, b + .4))), 0);
    const dn = .5 + .5 * Math.cos((t - E.T0) * TAU / .7);
    const c = night.clone().lerp(day, dn * .85); sky.material.color.copy(c).multiplyScalar(1 + 1.6 * flash);
    tint(cloud, mixHex('#141a2c', '#5a6478', dn));
    rains.forEach(r => r.userData.set(t));
    bolt.visible = flash > .01; bolt.material.userData.u.uGlowLit.value = flash;
    setL(S, 0, .03, .14 + .08 * flash, lerp(.35, .95, dn) + 1.2 * flash);
    S.key.intensity = .6 + .3 * dn + 1.8 * flash;
    lan.material.emissiveIntensity = 2.2 * (.9 + .1 * vnoise(t * 6));
    C.set({ x: -.024, y: WY0, look: .55, lookY: .5, blink: blinkAt(t, .9, 2.2), k: 1 + 1.4 * flash });
    this._f = fsOf(S, -.072);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 6, bloom: blo(.42, 1.0) }; }, grade() { return { vig: .55 }; } };
}
const PAPERG = '#9a9a9a';

// —— S9 a hundred and fifty days of water; then the water goes down layer by layer and the ark comes to rest on Ararat; dawn ——
export function S9(E) {
  const { H } = E, T0 = E.T0;
  const S = stage({ light: [0, .05, -.1], lightR: .28, lightCol: '#8fa4d0', key: 1.0, keyCol: '#c4d0ee', amb: .3, ambCol: '#55607e', floor: .3 });
  const night = skyPanel({ w: .9, h: .9, z: -.17, stops: [[0, '#070b18'], [.55, '#1a2743'], [1, '#33456a']], stars: 40, starMinY: .05 }); S.add(night);
  const dawn = skyPanel({ w: .9, h: .9, z: -.168, stops: [[0, '#5d7cb8'], [.4, '#a993b8'], [.55, '#d9a99a'], [.66, '#f0c79a'], [1, '#f6dca8']] }); S.add(dawn);
  dawn.material.transparent = true; dawn.material.opacity = 0;
  const sun = moon({ r: .016, x: .085, y: -.045, z: -.165, gain: 2.0, core: '#fffbe8', mid: '#fff0c0', edge: '#ffd9a0', halo: 8, haloGain: .5 }); S.scene.add(sun);
  const M = [
    hills(S, { z: -.145, col: '#4a4a6e', base: -.11, peaks: [[-.12, .07, .03], [-.05, .05, .025], [.1, .08, .03], [.17, .05, .03]], w: .6, trans: .35 }),
    null, hills(S, { z: -.125, col: '#2e2f4c', base: -.12, peaks: [[-.08, .07, .035], [.08, .075, .03]], w: .6, trans: .2, ph: 2 }),
    null, hills(S, { z: -.105, col: '#1d1c30', base: -.13, peaks: [[0, .093, .06]], w: .5, trans: .1, ph: 4, rough: .0005 }),
  ];
  const Wv = (z, col, tr, ph, base) => lay(S, { w: .7, h: .4, y: -.2, z, col, trans: tr, ppm: 2000, finish: { rim: .55 }, draw: x => { x.translate(0, .2); waveFill(x, { x0: -.35, x1: .35, base, amp: .008, len: .09, ph, peak: 1.8 }); } });
  const W1 = Wv(-.135, '#3a4e7c', .45, 1, .004), W2 = Wv(-.115, '#26365e', .25, 2.2, .0);
  const F = arkFront(S.U, { w: .1, h: .06, rh: .016, z: -.095, glow: 1.8 }); S.scene.add(F.g);
  const C = clawd(S.U, { u: .0018, z: .024 }); F.g.add(C.g);
  const W3 = Wv(-.085, '#16234a', .12, 3.4, -.004);
  const M4 = hills(S, { z: -.065, col: '#0b0a14', base: -.16, peaks: [[-.09, .09, .03], [.1, .1, .035]], w: .5, trans: .04, ph: 1 });
  const W4 = Wv(-.05, '#070b1c', .04, 5, -.012);
  const Ws = [[W1, '#3a4e7c', '#8b7f9e', 0], [W2, '#26365e', '#6d6386', .15], [W3, '#16234a', '#4a4466', .3], [W4, '#070b1c', '#1e1828', .45]];
  const Ms = [[M[0], '#4a4a6e', '#a08e9e'], [M[2], '#2e2f4c', '#6e5f74'], [M[4], '#1d1c30', '#3f3446'], [M4, '#0b0a14', '#1a1218']];
  const PEAK = -.04;
  return { S, update(t) {
    const p = ss(seg(t, H.alba, H.silencio2 + .3));
    dawn.material.opacity = p; night.material.color.setScalar(1 - .5 * p); setMoon(sun, p); sun.position.y = lerp(-.07, -.035, p);
    const drop = i => lerp(0, .17, eio(seg(t, H.a15 + .1 + Ws[i][3] * .5, H.a15 + 2.4 + Ws[i][3] * .5)));
    Ws.forEach(([m, a, b], i) => { m.position.y = -.2 - drop(i) + bob(t, 1.3 + i * .3, .0025 * (1 - p), i); m.position.x = bob(t, .7 + i * .2, .006, i * 2); tint(m, mixHex(a, b, p)); });
    Ms.forEach(([m, a, b]) => tint(m, mixHex(a, b, p)));
    const water = -.004 - drop(2), afloat = water - .008 > PEAK;
    const landed = ss(seg(t, H.ararat - .1, H.ararat + .25));
    F.g.position.set(0, Math.max(water - .008, PEAK) + bob(t, 1.1, .002) * (1 - landed), -.095);
    F.g.rotation.z = bob(t, .9, .03) * (afloat ? 1 : Math.exp(-(t - H.ararat) * 3) * .5);
    const wob = t > H.ararat ? Math.sin((t - H.ararat) * 14) * Math.exp(-(t - H.ararat) * 3.5) : 0;
    C.set({ x: -.031, y: .06, rot: wob * .25 - F.g.rotation.z * .5, aL: Math.abs(wob) * 1.6, aR: Math.abs(wob) * 1.6, look: lerp(.5, .2, p), lookY: lerp(.2, -.3, ss(seg(t, H.a15, H.ararat))), blink: blinkAt(t, .3, 2.8), k: 1.3 });
    const z = lerp(.45, .63, eio(seg(t, T0, H.a15))), ty = lerp(.022, -.012, eio(seg(t, H.a15 + .1, H.ararat + .9)));
    aim(S.cam, [0, ty + .006, z, 0, ty, -.08], t, { hand: .0004 });
    setL(S, lerp(0, .04, p), lerp(.05, -.03, p), lerp(.28, .34, p), lerp(.8, 1.3, p), col3('#8fa4d0').lerp(col3('#ffd2a0'), p));
    S.key.color.copy(col3('#c4d0ee').lerp(col3('#ffe2c0'), p)); S.amb.color.copy(col3('#55607e').lerp(col3('#a08a90'), p));
    this._p = p; this._f = fsOf(S, -.08);
  }, post() { return { focus: this._f, aper: 5, maxCoc: 6, bloom: blo(.36, 1.05) }; }, grade() { return { vig: .48, gain: [1.03 + .02 * this._p, 1, .95] }; } };
}

// —— Ararat at dawn, gold: the peaks, the ark come to rest, the family on the slope. Used by S11 and S12 ——
function ararat(S, { arkX = .032, peakY = -.05 } = {}) {
  S.add(skyPanel({ w: 1, h: 1, z: -.17, stops: [[0, '#9fb2d6'], [.3, '#e3c9c0'], [.5, '#f6dcb0'], [.75, '#ffe7b8'], [1, '#fff0cc']] }));
  hills(S, { z: -.125, col: '#b39aa8', base: -.1, peaks: [[-.13, .06, .04], [-.06, .045, .03], [.14, .065, .04]], w: .6, trans: .5, rim: .4 });
  hills(S, { z: -.105, col: '#7a6274', base: -.12, peaks: [[-.1, .06, .04], [.13, .055, .035]], w: .6, trans: .25, ph: 3 });
  const pk = hills(S, { z: -.09, col: '#3c2e38', base: -.14, peaks: [[arkX, .09, .07], [-.08, .02, .05]], w: .6, trans: .1, ph: 5 });
  const A = ark(S.U, { L: .085, h: .0105, rh: .003, z: -.088, door: [.22, .3, .42], win: [-.05, .3], ppm: 9000, glow: .8 }); A.g.position.set(arkX, peakY - .0005, -.088); S.scene.add(A.g);
  const fam = [0, 1, 2, 3, 4, 5, 6, 7].map(i => { const p = human(S.U, { h: .0115 - (i % 3) * .0006, z: -.0875, col: '#24161a', rim: .6 }); S.scene.add(p.g); return p; });
  const slopeY = x => -.14 + .09 * Math.exp(-(((x - arkX) / .07) ** 2)) + .02 * Math.exp(-(((x + .08) / .05) ** 2));
  fam.forEach((p, i) => { const x = arkX - .068 - i * .0062; p.set({ x, y: slopeY(x) - .0004, a: i === 0 ? 1.2 : .2, rot: .04 }); });
  return { A, fam, pk };
}

// —— S10 the dove: out of the light with an olive leaf, to the window; Noah's arm reaches out ——
export function S10(E) {
  const { H } = E, T1 = E.T0 + E.dur;
  const S = stage({ light: [.04, .02, -.1], lightR: .3, lightCol: '#ffd9a8', key: 1.4, keyCol: '#ffe8cc', amb: .36, ambCol: '#a08a90', floor: .45 });
  S.add(skyPanel({ w: .8, h: .8, z: -.17, stops: [[0, '#6f8cc0'], [.35, '#b8a0bc'], [.55, '#e6b8a2'], [.7, '#f4cf9e'], [1, '#f8e2b2']] }));
  const sun = moon({ r: .014, x: .05, y: .04, z: -.165, gain: 2.2, core: '#fffbe8', mid: '#fff0c0', edge: '#ffd9a0', halo: 9, haloGain: .6 }); S.scene.add(sun);
  hills(S, { z: -.14, col: '#a08e9e', base: -.08, peaks: [[-.09, .05, .03], [.12, .06, .03]], w: .5, trans: .45 });
  hills(S, { z: -.12, col: '#6e5f74', base: -.11, peaks: [[-.06, .05, .03], [.09, .055, .03]], w: .5, trans: .2, ph: 2 });
  const F = arkFront(S.U, { w: .2, h: .12, rh: .03, z: -.09, glow: 2.2, winW: .3 }); F.g.position.set(-.01, -.1, -.09); S.scene.add(F.g);
  const N = human(S.U, { h: .05, z: -.0915, col: '#1a0f0a', rim: .8 }); S.scene.add(N.g);
  const wy = -.1 + F.winY[0];
  const D = dove(S.U, { s: .016, z: -.078, dir: 1 }); S.scene.add(D.g);
  const C = clawd(S.U, { u: .0024, z: -.058 }); S.scene.add(C.g);
  hills(S, { z: -.05, col: '#1c1014', base: -.14, peaks: [[-.07, .125, .07], [.08, .12, .07]], w: .4, trans: .04 });
  return { S, update(t) {
    const k = eio(seg(t, E.T0, T1));
    aim(S.cam, [lerp(.004, -.002, k), -.01, lerp(.5, .48, k), lerp(.004, -.002, k), -.01, -.08], t, { hand: .0004 });
    const f = seg(t, H.paloma - .2, H.paloma + 1.9), fe = eio(f);
    const dx = lerp(.11, .04, fe), dy = lerp(.075, wy + .016, fe) + Math.sin(f * Math.PI) * .01;
    const flapA = lerp(.9, .25, ss(seg(f, .5, 1))), flap = Math.sin(t * 22) * flapA + .25;
    D.set({ x: dx, y: dy, flap, rot: lerp(-.25, .12, fe) });
    D.g.visible = t > H.paloma - .25;
    const reach = ss(seg(t, H.paloma + .7, H.paloma + 1.7));
    N.set({ x: .008, y: wy - .045 + .015, a: lerp(.4, 2.15, reach), rot: 0 });
    C.set({ x: -.045, y: -.1 + .12, look: clamp((dx + .045) / .05, -1, 1), lookY: clamp((dy - .03) / .03, -1, 1), aR: ss(seg(t, H.paloma + .6, H.paloma + 2.0)) * 1.3, blink: blinkAt(t, .5, 2.6), k: 1 });
    const rf = ss(seg(t, H.paloma + .3, H.paloma + 1.3));
    this._f = lerp(fsOf(S, -.058), fsOf(S, -.078), rf);
  }, post() { return { focus: this._f, aper: 11, maxCoc: 7, bloom: blo(.36, 1.1) }; }, grade() { return { vig: .38 }; } };
}

// —— S11 the signature shot: the storm clouds part layer by layer, light pours in, and the bow grows band by band ——
export function S11(E) {
  const { H } = E, T1 = E.T0 + E.dur;
  const S = stage({ light: [0, .02, -.1], lightR: .3, lightCol: '#ffe0a8', key: 1.5, keyCol: '#ffe8c8', amb: .4, ambCol: '#b8a090', floor: .5 });
  const G = ararat(S);
  const B = bowBands(S.U, { R: .085, cx: .006, cy: -.05, z: -.135 });
  B.bands.forEach(b => S.add(b));
  const glow = burst(.4, .34, '#ffd9a0'); glow.position.set(.006, -.06, -.13); S.add(glow);
  const C = clawd(S.U, { u: .0024, z: -.05 }); S.scene.add(C.g);
  land(S, { z: -.045, col: '#1c0f07', top: -.067, amp: .006, len: .16, ph: 2, w: .5, ppm: 2400 });
  // three layers of storm cloud, each cut into a left and a right half
  const clouds = [[.2, '#3e3440', 11], [.1, '#544754', 12], [.0, '#6e5e6a', 13]].map(([z, c, sd]) => {
    const half = s => { const R = mulberry(sd + (s > 0 ? 50 : 0)); return mk(S.U, { w: .16, h: .4, x: s * .08, y: -.02, z, col: c, trans: .45, shadow: false, recv: false, ppm: 1400, finish: { rim: .5, rimPx: 5 }, draw: x => {
      x.fillRect(s > 0 ? -.06 : -.08, -.2, .14, .4); for (let i = 0; i < 16; i++) { x.beginPath(); x.arc(-s * .065 + (R() - .5) * .025, -.19 + i * .025, .012 + R() * .012, 0, TAU); x.fill(); }
    } }); };
    const L = half(-1), Rr = half(1); S.add(L, Rr); return { L, R: Rr };
  });
  return { S, update(t) {
    const z = lerp(.55, .37, eio(seg(t, E.T0, H.a18 + .4))) - .01 * seg(t, H.a18, T1), cy = -.024;
    aim(S.cam, [.002, cy, z, .002, cy, -.08], t, { hand: .0004 });
    clouds.forEach((c, i) => { const o = eio(seg(t, H.nubes + i * .25, H.nubes + .75 + i * .25)) * .19; c.L.position.x = -.08 - o; c.R.position.x = .08 + o; c.L.position.y = c.R.position.y = cy + .0; c.L.visible = c.R.visible = o < .185; });
    const open = ss(seg(t, H.nubes + .2, H.nubes + 1.4));
    glow.userData.set(lerp(.05, .9, open));
    B.bands.forEach((_, i) => B.set(i, eo(seg(t, H.arco - .35 + i * .09, H.arco + .45 + i * .09))));
    setL(S, .006, .0, lerp(.18, .32, open), lerp(.45, 1.5, open));
    S.key.intensity = lerp(.7, 1.5, open); S.amb.intensity = lerp(.22, .4, open);
    const lift = ss(seg(t, H.nubes + .7, H.nubes + 1.5));
    C.set({ x: -.014, y: -.066, back: true, aL: lift * 2.2 + bob(t, 2, .05) * lift, aR: lift * 2.2 - bob(t, 2, .05) * lift, k: lerp(.9, 1.2, open) });
    this._o = open; this._f = fsOf(S, -.05);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 8, bloom: blo(lerp(.3, .42, this._o), 1.0) }; }, grade() { return { vig: lerp(.6, .32, this._o), expo: lerp(.75, 1, this._o) }; } };
}

// —— S12 the lesson and the question: Clawd turns to us; the ark and the bow behind ——
export function S12(E) {
  const { H } = E, T0 = E.T0;
  const S = stage({ light: [.0, .02, -.1], lightR: .32, lightCol: '#ffe0a8', key: 1.5, keyCol: '#ffe8c8', amb: .42, ambCol: '#b8a090', floor: .55 });
  const G = ararat(S);
  const B = bowBands(S.U, { R: .085, cx: .006, cy: -.05, z: -.135 }); B.bands.forEach((b, i) => { S.add(b); B.set(i, 1); });
  const glow = burst(.4, .34, '#ffd9a0'); glow.position.set(.006, -.06, -.13); glow.userData.set(.8); S.add(glow);
  const C = clawd(S.U, { u: .0032, z: -.05, glow: .4 }); S.scene.add(C.g);
  land(S, { z: -.045, col: '#1c0f07', top: -.067, amp: .006, len: .16, ph: 2, w: .5, ppm: 2400 });
  setL(S, .006, .0, .32, 1.5);
  return { S, update(t) {
    const k = eio(seg(t, T0, T0 + 1.4));
    aim(S.cam, [-.004, -.03, lerp(.37, .43, k), -.004, -.03, -.08], t, { hand: .0004 });
    const tb = H.mira_arca, tf = H.a19 + 1.45, w = H.escribe;
    const backNow = t > tb && t < tf;
    const sq = 1 - .8 * Math.max(Math.max(0, 1 - Math.abs(t - tb) / .12), Math.max(0, 1 - Math.abs(t - tf) / .12));
    const wave = t > w ? Math.sin((t - w) * 8) * .45 * ss(seg(t, w, w + .3)) : 0, up = ss(seg(t, w - .1, w + .3));
    C.set({ x: -.02, y: -.066, back: backNow, look: t < tb ? .3 : 0, lookY: 0, aR: up * 2.1 + wave, aL: 0, blink: blinkAt(t, .3, 2.6), k: 1 });
    C.g.scale.x = sq;
    this._f = fsOf(S, -.05);
  }, post() { return { focus: this._f, aper: 10, maxCoc: 9, bloom: blo(.38, 1.05) }; }, grade() { return { vig: .32 }; } };
}
