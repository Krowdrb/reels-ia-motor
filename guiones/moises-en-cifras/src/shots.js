// The twelve shots of "Moisés en cifras: 40, 80 y 120". Each: { S, update(t), post(), grade() }; t in film seconds.
// God is only ever light (the bush is white-gold light behind black branches that never change). Moses, Aaron, the pharaoh,
// the overseer and the people are quiet dark silhouettes. Clawd is the only clay-coloured thing and only watches.
import * as THREE from 'three';
import { skyPanel, moon, setMoon, text } from './paper.js';
import { stage, aim } from './stage.js';
import { mulberry, seg, ss, eio, eo, lerp, clamp, TAU } from './lib.js';
import { mk, cut, tint, clawd, human, waveFill, mountFill, bush, colonnade, flockDraw, palmDraw, sandals, glowMesh } from './actors.js';

const blo = (s = .34, th = 1.1) => ({ strength: s, radius: .6, threshold: th });
const lay = (S, o) => S.add(mk(S.U, o));
const col3 = c => new THREE.Color(c);
const mixc = (a, b, p) => '#' + col3(a).lerp(col3(b), clamp(p)).getHexString();
const setL = (S, x, y, r, lit, c) => { S.U.uLight.value.x = x; S.U.uLight.value.y = y; S.U.uLightR.value = r; S.U.uLit.value = lit; if (c) S.U.uLightCol.value.copy(c); };
const bob = (t, f, a, p = 0) => Math.sin(t * f + p) * a;
const fsOf = (S, z) => S.cam.position.z - z;
const blinkAt = (t, per = 3.3, ph = 0) => 1 - .9 * Math.max(0, 1 - Math.abs(((t + ph) % per) - .1) / .1);
// camera height that puts world height gy at fraction f of the frame from the top, for a level camera at distance d
const camY = (gy, f, d) => gy - (.5 - f) * .4617 * d;
const flip = A => { A.g.scale.x *= -1; };
const backTo = (C, on) => { C.eyeL.visible = C.eyeR.visible = !on; };   // Clawd seen from behind: no eyes
const flick = t => 1 + .06 * Math.sin(7.3 * t) * Math.sin(3.1 * t) + .03 * Math.sin(13.1 * t);
const walkY = (t, f, a) => Math.abs(Math.sin(t * f)) * a;
// a light streak anchored at its right end (x, y), pointing left (toward Egypt); stretch 0..1
function beamL(S, { x, y, z, len = .3, wid = .03, col = '#fff1c8', ang = 0 }) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.z = ang; S.scene.add(g);
  const m = glowMesh(len, wid, col, [1, .5], [1, .5], 1.6); m.position.x = -len / 2; g.add(m);
  return { set(k, st = 1) { m.userData.set(k); g.scale.x = Math.max(.001, st); } };
}

const G = -.06;   // ground line where the figures stand
export { G };

// a ground sheet whose top is a soft wave at world height `base`
const ground = (S, z, col, base, amp, len, ph, tr = .08, o = {}) => { const w = o.w || 1, ox = o.x || 0; return lay(S, { w, h: .5, x: ox, y: -.2, z, col, trans: tr, ppm: o.ppm || 2200, finish: { rim: o.rim ?? .45 }, glowDraw: o.glowDraw, glow: o.glow, glowCol: o.glowCol, draw: x => { x.translate(-ox, .2); waveFill(x, { x0: ox - w / 2, x1: ox + w / 2, base, amp, len, ph, peak: o.peak ?? 1.3 }); } }); };
const mount = (S, z, col, base, peaks, tr = .3, o = {}) => { const w = o.w || 1.3; return lay(S, { w, h: .6, y: -.2, z, col, trans: tr, ppm: o.ppm || 1600, finish: { rim: o.rim ?? .45 }, glowDraw: o.glowDraw, glow: o.glow, glowCol: o.glowCol, draw: x => { x.translate(0, .2); mountFill(x, { x0: -w / 2, x1: w / 2, base, peaks, ph: z * 50 }); } }); };

// hidden cuts: fine veins, branches and star points, drawn only into the emissive map (invisible until the light reveals them)
function veins(x, { x0, x1, y0, y1, n = 26, seed = 3, stars = 40 }) {
  const R = mulberry(seed); x.strokeStyle = '#fff'; x.fillStyle = '#fff'; x.lineCap = 'round';
  const br = (px, py, a, l, w, d) => {
    const ex = px + Math.cos(a) * l, ey = py + Math.sin(a) * l;
    x.lineWidth = w; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a + .5) * l * .5, py + Math.sin(a + .5) * l * .5, ex, ey); x.stroke();
    if (d > 0) { br(ex, ey, a + .5 + R() * .4, l * .7, w * .75, d - 1); if (R() < .7) br(ex, ey, a - .5 - R() * .4, l * .7, w * .75, d - 1); }
  };
  for (let i = 0; i < n; i++) br(x0 + R() * (x1 - x0), y0 + R() * (y1 - y0), (R() - .5) * 1.4 + (R() < .5 ? 0 : Math.PI), .006 + R() * .012, .0006 + R() * .0005, 2);
  for (let i = 0; i < stars; i++) { const px = x0 + R() * (x1 - x0), py = y0 + R() * (y1 - y0), r = .0006 + R() * .0012; x.beginPath(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, rr = k % 2 ? r * .35 : r; x.lineTo(px + Math.cos(a) * rr, py + Math.sin(a) * rr); } x.closePath(); x.fill(); }
}

// —— Horeb at night: violet sky with stars, the crests of the mountain of God, the slope with the bush, the dark rock in front ——
const HOREB = { crests: '#4c4470', ridge: '#3a3360', slope: '#2b2548', near: '#17132a', rock: '#0a0812' };
const HOREB_W = { crests: '#ffe7b0', ridge: '#d9b27a', slope: '#9a7448', near: '#5a3e24', rock: '#2a1a0c' };
function horeb(S, o = {}) {
  const bx = o.bx ?? .02;
  const sky = skyPanel({ w: 1.6, h: 1.2, y: .1, z: -.24, stops: [[0, '#08071a'], [.35, '#120f28'], [.6, '#1e1a3c'], [.8, '#2e2752'], [1, '#3c3262']], stars: 220, starMinY: -.05, seed: 9 }); S.add(sky);
  const crests = mount(S, -.2, HOREB.crests, -.04, [[-.22, .06, .14], [-.06, .1, .12], [.1, .075, .1], [.26, .11, .15]], .42, {
    glowDraw: o.cuts ? x => { x.translate(0, .2); veins(x, { x0: -.25, x1: .3, y0: -.04, y1: .07, n: 40, seed: 5, stars: 60 }); } : undefined, glow: 1.6, glowCol: '#ffe7b0' });
  const ridge = mount(S, -.16, HOREB.ridge, -.05, [[-.15, .035, .1], [.05, .025, .12], [.2, .04, .1]], .3);
  const slope = ground(S, -.105, HOREB.slope, G + .002, .004, .14, 2.1, .14, { w: 1.2,
    glowDraw: o.cuts ? x => { x.translate(0, .2); veins(x, { x0: -.2, x1: .22, y0: G - .05, y1: G, n: 34, seed: 8, stars: 30 }); } : undefined, glow: 2, glowCol: '#ffe7b0' });
  const B = bush(S.U, { s: o.bs ?? .026, z: -.094 }); B.g.position.set(bx, G - .001, -.094); S.scene.add(B.g);
  const near = ground(S, -.07, HOREB.near, G - .007, .003, .12, .7, .06, { w: 1.2 });
  const rock = lay(S, { w: 1.2, h: .5, y: -.2, z: -.04, col: HOREB.rock, trans: .03, ppm: 2200, finish: { rim: .3 }, draw: x => { x.translate(0, .2); mountFill(x, { x0: -.6, x1: .6, base: G - .034, peaks: [[-.09, .012, .05], [.07, .008, .06]], jit: .0012 }); },
    glowDraw: o.cuts ? x => { x.translate(0, .2); veins(x, { x0: -.16, x1: .18, y0: G - .04, y1: G - .036, n: 0, seed: 12, stars: 0 }); } : undefined, glow: 2.2, glowCol: '#ffe39a' });
  const L = { crests, ridge, slope, near, rock };
  if (o.cuts) for (const m of [crests, slope, rock]) { m.material.userData.u.uGlowLit.value = 0; m.material.userData.u.uGR.value.set(bx, G + .01, 0, 1); }
  const warm = p => { for (const k in L) tint(L[k], mixc(HOREB[k], HOREB_W[k], p)); };
  return { sky, B, L, warm, bx };
}

// the paper title strip: grows from its centre, fixed to the camera
function titleStrip(S) {
  const title = lay(S, { w: .12, h: .066, y: .088, z: -.03, col: '#e7d4a8', trans: .35, shadow: false, recv: false, finish: { rim: .3, under: .2 }, draw: x => {
    x.beginPath(); x.roundRect(-.058, -.031, .116, .062, .002); x.fill();
    cut(x, () => { text(x, 'TRES VECES', 0, .0142, .0128, 'Cinzel', { weight: 800, fill: '#000' }); text(x, 'CUARENTA', 0, -.0012, .0128, 'Cinzel', { weight: 800, fill: '#000' }); text(x, 'Hechos 7 · Éxodo 3', 0, -.0186, .0082, 'Playfair', { weight: 'italic 500', fill: '#000' }); });
  }, glowDraw: x => { x.fillStyle = '#fff'; x.fillRect(-.06, -.033, .12, .066); }, glow: .55, glowCol: '#e7d4a8', glowRes: .2 });
  title.material.userData.u.uClip.value.set(0, .088, 0, 0);
  return (t, a, b) => {
    const cz = S.cam.position.z + .03, ts = cz / .55; title.scale.setScalar(ts); title.position.x = S.cam.position.x; title.position.y = S.cam.position.y + .4617 * cz / 2 * .56;
    const reveal = ss(seg(t, a, a + .5)) * (1 - ss(seg(t, b - .4, b)));
    title.material.userData.u.uClip.value.set(title.position.x, title.position.y, .09 * reveal * ts, 0); title.visible = reveal > .002;
  };
}

// S1 Horeb, the night of the call: push-in; Clawd on a rock beside the small light, Moses (eighty, with his staff) at mid distance
export function S1(E) {
  const { H } = E;
  const S = stage({ light: [.02, G + .02, -.1], lightR: .07, lightCol: '#ffe7b0', key: 1.1, keyCol: '#bfb6e6', amb: .36, ambCol: '#7a70b0', floor: .3 });
  const W = horeb(S, { bx: .022 });
  const M = human(S.U, { h: .066, z: -.1, col: '#08060f', rim: .55, staff: true }); S.scene.add(M.g);
  lay(S, { w: .04, h: .02, x: -.026, y: G - .002, z: -.074, col: '#120e20', trans: .05, finish: { rim: .45 }, draw: x => { x.beginPath(); x.moveTo(-.017, -.01); x.quadraticCurveTo(-.016, .006, -.004, .0075); x.quadraticCurveTo(.012, .008, .017, -.01); x.closePath(); x.fill(); } });
  const C = clawd(S.U, { u: .0026, z: -.072 }); S.scene.add(C.g);
  const T = titleStrip(S);
  return { S, update(t) {
    const k = eio(seg(t, 0, E.T0 + E.dur + .6)), d = lerp(.7, .6, k), cx = lerp(.008, .012, k), cy = camY(G, .64, d);
    aim(S.cam, [cx, cy, -.08 + d, cx, cy, -.08], t, { hand: .0003 });
    const glow = lerp(.3, .5, ss(seg(t, .2, E.T0 + E.dur)));
    W.B.set(glow, flick(t)); W.warm(glow * .25);
    setL(S, W.bx, G + .02, lerp(.06, .09, glow), lerp(.8, 1.2, glow));
    M.set({ x: .056, y: G + .001, a: .35, rot: 0 }); flip(M);
    const toM = ss(seg(t, H.l01 + .1, H.l01 + .4)) * (1 - ss(seg(t, H.l02 + .9, H.l02 + 1.2)));
    C.set({ x: -.026, y: G + .0055, aL: .9 + bob(t, 1.2, .05), aR: 1.0 + bob(t, 1.1, .05), look: lerp(.7, -.2, toM) + toM * 1.1, blink: blinkAt(t, 3.4, .6), tuck: .3, k: 1.1 });
    T(t, .3, 3.5);
    this._f = fsOf(S, -.08);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 5, bloom: blo(.4, 1.0) }; }, grade() { return { vig: .5 }; } };
}

// —— the palace at night: indigo-plum, colonnades at three depths, oil lamps, the brick fields far away ——
function palace(S, o = {}) {
  const sky = skyPanel({ w: 1.6, h: 1.2, y: .1, z: -.24, stops: [[0, '#0b0a1c'], [.5, '#1b1636'], [.8, '#2c2350'], [1, '#3a2e5c']], stars: 120, starMinY: .0, seed: 4 }); S.add(sky);
  const R = mulberry(19);
  // far: the brick fields and a pyramid, very pale and small
  lay(S, { w: 1.4, h: .2, y: G - .02, z: -.2, col: '#4a4068', trans: .45, ppm: 1600, finish: { rim: .4 }, draw: x => {
    x.translate(0, -(G - .02)); x.fillRect(-.7, G - .1, 1.4, .1 + .01);
    x.beginPath(); x.moveTo(.06, G + .01); x.lineTo(.11, G + .055); x.lineTo(.16, G + .01); x.closePath(); x.fill();
    for (let i = 0; i < 40; i++) x.fillRect(-.6 + R() * 1.2, G + .01, .004 + R() * .006, .002 + R() * .003);
  } });
  const far = colonnade(S.U, { xs: [-.24, -.16, -.08, .0, .08, .16, .24].map(v => v + (o.off || 0)), y0: G - .004, y1: G + .19, cw: .011, z: -.15, col: '#5a4f86', trans: .3, w: 1.2, ppm: 1800 }); S.add(far);
  const floor = ground(S, -.1, '#2a2350', G - .001, .0004, .2, 1, .1, { w: 1.4, rim: .35 });
  const balus = lay(S, { w: 1.4, h: .03, y: G + .01, z: -.104, col: '#3a3266', trans: .12, ppm: 2400, finish: { rim: .5 }, draw: x => { x.fillRect(-.7, .006, 1.4, .004); for (let u = -.7; u < .7; u += .008) x.fillRect(u, -.012, .003, .018); } });
  const near = colonnade(S.U, { xs: o.xs2 || [-.21, -.1, .01, .12, .23], y0: G - .03, y1: G + .2, cw: .016, z: -.055, col: '#251e44', trans: .08, w: 1.2, ppm: 2400 }); S.add(near);
  const front = ground(S, -.045, '#0c0a18', G - .034, .001, .2, 1, .02, { w: 1.4, rim: .25 });
  return { sky, far, near, floor, balus, front };
}
// an oil lamp on a stand: flame + glow
function lamp(S, { x, y, z, h = .03, k = 1 }) {
  lay(S, { w: .014, h: h + .006, x, y: y + h / 2, z, col: '#0d0a18', trans: .05, finish: { rim: .5 }, draw: c => { c.fillRect(-.0012, -h / 2, .0024, h); c.beginPath(); c.ellipse(0, h / 2 - .001, .0055, .0018, 0, 0, 7); c.fill(); c.fillRect(-.004, -h / 2, .008, .0015); } });
  const f = lay(S, { w: .006, h: .01, x, y: y + h + .003, z: z + .0005, col: '#fff0cc', trans: 0, shadow: false, recv: false, ppm: 8000, finish: { rim: 0, under: 0 }, draw: c => { c.beginPath(); c.moveTo(0, .004); c.quadraticCurveTo(.0022, -.001, 0, -.0025); c.quadraticCurveTo(-.0022, -.001, 0, .004); c.fill(); }, glowDraw: c => { c.fillStyle = '#fff'; c.beginPath(); c.moveTo(0, .004); c.quadraticCurveTo(.0022, -.001, 0, -.0025); c.quadraticCurveTo(-.0022, -.001, 0, .004); c.fill(); }, glow: 3 * k, glowCol: '#ffe2a0' });
  const b = glowMesh(.05, .05, '#ffdca0'); b.position.set(x, y + h + .003, z + .001); S.add(b); b.userData.set(.3 * k);
  return { f, b };
}

// S2 the palace, at forty: lateral tracking through the colonnade; young Moses on the terrace looks out to the brick fields
export function S2(E) {
  const { H } = E;
  const S = stage({ light: [-.01, G + .05, -.1], lightR: .16, lightCol: '#ffd8a0', key: 1.2, keyCol: '#c8c0ee', amb: .34, ambCol: '#7a70b8', floor: .35 });
  palace(S);
  const L1 = lamp(S, { x: -.045, y: G, z: -.098 }), L2 = lamp(S, { x: .075, y: G, z: -.098, k: .8 });
  const M = human(S.U, { h: .07, z: -.09, col: '#0a0816', rim: .55 }); S.scene.add(M.g);
  const C = clawd(S.U, { u: .0021, z: -.078 }); S.scene.add(C.g);
  return { S, update(t) {
    const k = eio(seg(t, E.T0 - .6, E.T0 + E.dur + .6)), d = .66, cx = lerp(-.03, .014, k), cy = camY(G, .65, d);
    aim(S.cam, [cx, cy, -.08 + d, cx, cy, -.08], t, { hand: .0003 });
    M.set({ x: .024, y: G, a: .12 });
    const w = seg(t, E.T0, H.l03 + 1.5), walking = w > 0 && w < 1;
    C.set({ x: lerp(-.065, -.004, eo(w)), y: G + (walking ? walkY(t, 9, .0008) : 0), walk: t * 14, stride: walking ? .35 : 0, look: .9, blink: blinkAt(t, 3.1, .4), k: 1.1 });
    L1.f.material.userData.u.uGlowLit.value = flick(t * 1.3); L2.f.material.userData.u.uGlowLit.value = flick(t * 1.1 + 2);
    this._f = fsOf(S, -.085);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 5, bloom: blo(.36, 1.05) }; }, grade() { return { vig: .48 }; } };
}

// S3 the brick field and the flight: the overseer's raised arm, Moses steps in; a black paper curtain crosses on «mató»
// and leaves only Moses, running away to the right. No blow, no body: the curtain is the cut.
export function S3(E) {
  const { H } = E;
  const S = stage({ light: [.06, .02, -.1], lightR: .2, lightCol: '#e8c8a0', key: 1.3, keyCol: '#e0d6cc', amb: .36, ambCol: '#9088a8', floor: .4 });
  S.add(skyPanel({ w: 1.6, h: 1.2, y: .1, z: -.24, stops: [[0, '#1e1b30'], [.45, '#3a3550'], [.75, '#6a6070'], [.9, '#8a7e78'], [1, '#9a8e80']] }));
  const sun = moon({ r: .012, x: .1, y: -.005, z: -.22, gain: 1.2, core: '#fff2d8', mid: '#f4dcb0', edge: '#e6c48e', halo: 6, haloGain: .3 }); S.scene.add(sun);
  lay(S, { w: .2, h: .1, x: -.06, y: -.02, z: -.2, col: '#9a8f78', trans: .5, ppm: 1600, finish: { rim: .35 }, draw: x => { x.beginPath(); x.moveTo(-.07, -.04); x.lineTo(0, .03); x.lineTo(.07, -.04); x.closePath(); x.fill(); } });
  ground(S, -.18, '#7e7466', -.045, .004, .3, 1.2, .4, { w: 1.6, ppm: 1400 });
  const R = mulberry(7);
  lay(S, { w: 1.4, h: .08, y: G + .005, z: -.12, col: '#5f5646', trans: .2, ppm: 2200, finish: { rim: .5 }, draw: x => {
    x.translate(0, -(G + .005)); x.fillRect(-.7, G - .04, 1.4, .036);
    for (let row = 0; row < 3; row++) for (let u = -.7; u < .7; u += .011 + R() * .004) { if (R() < .15) continue; x.fillRect(u, G - .004 + row * .0062, .008, .0048); }
  } });
  ground(S, -.1, '#3a342a', G - .001, .002, .2, 2.2, .1, { w: 1.6 });
  const Ov = human(S.U, { h: .074, z: -.088, col: '#0e0c0a', rim: .5 }); S.scene.add(Ov.g);
  const Hb = human(S.U, { h: .07, z: -.087, col: '#0e0c0a', rim: .5, pose: 'kneel' }); S.scene.add(Hb.g);
  const M = human(S.U, { h: .072, z: -.084, col: '#0b0908', rim: .55 }); S.scene.add(M.g);
  ground(S, -.07, '#211d16', G - .008, .002, .16, 3.1, .05, { w: 1.6 });
  ground(S, -.045, '#16130e', G - .032, .006, .12, .4, .02, { w: 1.6, peak: 2 });
  const C = clawd(S.U, { u: .0021, z: -.066 }); S.scene.add(C.g);
  const curtain = lay(S, { w: .34, h: .5, z: -.035, col: '#07060a', trans: .02, shadow: false, recv: false, ppm: 1200, finish: { rim: .6, rimPx: 6, under: .5 }, draw: x => {
    x.beginPath(); x.moveTo(-.17, -.25); x.lineTo(.15, -.25); for (let i = 0; i <= 25; i++) x.lineTo(.15 + .008 * Math.sin(i * 2.3) + .004 * Math.sin(i * 5.1), -.25 + i * .02); x.lineTo(-.17, .25); x.closePath(); x.fill(); } });
  const M0 = H.mato - .2, M1 = M0 + .9, Mid = (M0 + M1) / 2;
  return { S, update(t) {
    const pan = eio(seg(t, Mid + .1, E.T0 + E.dur + .3)), d = .68, cx = lerp(-.004, .022, pan), cy = camY(G, .65, d);
    aim(S.cam, [cx, cy, -.08 + d, cx, cy, -.08], t, { hand: .0004 });
    const cv = seg(t, M0, M1); curtain.position.set(S.cam.position.x + lerp(-.29, .3, eio(cv)), cy, -.035); curtain.visible = cv > 0 && cv < 1;
    const after = t > Mid;
    Ov.g.visible = Hb.g.visible = !after;
    Ov.set({ x: .054, y: G, a: lerp(.3, 2.3, ss(seg(t, H.l04 - .2, H.l04 + .3))) }); flip(Ov);
    Hb.set({ x: .026, y: G, a: .6, rot: .12 });
    if (!after) {
      const w = seg(t, H.l04 - .1, H.l04 + 1.1), walking = w > 0 && w < 1;
      M.set({ x: lerp(-.1, -.022, eo(w)), y: G + (walking ? walkY(t, 7, .0012) : 0), a: walking ? Math.sin(t * 7) * .3 : lerp(.3, 1.1, ss(seg(t, H.l04 + 1.1, H.l04 + 1.5))), rot: walking ? .02 : 0 });
    } else {
      const r = seg(t, Mid, E.T0 + E.dur + .2);
      M.set({ x: -.022 + r * .085, y: G + walkY(t, 11, .0018), a: .7 + Math.sin(t * 11) * .6, rot: .07 });
    }
    const cw = seg(t, E.T0 - .4, H.l04 + .4), cwk = cw > 0 && cw < 1, fear = ss(seg(t, H.l04 + .1, H.l04 + .5));
    C.set({ x: lerp(-.1, -.058, eo(cw)), y: G - .004 + (cwk ? walkY(t, 9, .0008) : 0), walk: t * 14, stride: cwk ? .35 : 0, look: after ? .9 : .7, tuck: fear * .4 * (after ? .4 : 1), blink: after ? blinkAt(t, 2.8) : lerp(1, .55, fear), k: 1.05 });
    this._f = fsOf(S, -.085);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 5, bloom: blo(.3, 1.1) }; }, grade() { return { vig: .45, sat: .9 }; } };
}

// S4 Madian, forty years a shepherd: a locked frame; only the light turns (sun, moon, sun...), faster each time.
// Moses does not move; Clawd changes posture with each cycle (the time passes over him, not over the figure).
export function S4(E) {
  const { H } = E;
  const S = stage({ light: [0, .06, -.1], lightR: .24, lightCol: '#fff0d0', key: 1.4, keyCol: '#fff4e4', amb: .4, ambCol: '#a8a0a0', floor: .45 });
  const sky = skyPanel({ w: 1.6, h: 1.2, y: .1, z: -.24, stops: [[0, '#6c6c88'], [.5, '#a09aa0'], [.8, '#c4b8a8'], [1, '#d6c8b0']], stars: 0 }); S.add(sky);
  const nsky = skyPanel({ w: 1.6, h: 1.2, y: .1, z: -.239, stops: [[0, '#0e1230'], [.6, '#22294e'], [1, '#3c3e64']], stars: 200, starMinY: -.04, seed: 13 }); S.add(nsky);
  nsky.material.transparent = true; nsky.material.opacity = 0; nsky.material.depthWrite = false; nsky.material.needsUpdate = true;
  const sun = moon({ r: .012, x: 0, y: .06, z: -.22, gain: 2.4, core: '#fffbe8', mid: '#fff0c0', edge: '#ffe2a0', halo: 7, haloGain: .45 }); S.scene.add(sun);
  const mo = moon({ r: .01, x: 0, y: .06, z: -.221, gain: 1.6, core: '#f4f2ff', mid: '#e6e4f4', edge: '#cfcce6', halo: 5, haloGain: .25 }); S.scene.add(mo);
  const hills = mount(S, -.19, '#7d7468', -.03, [[-.2, .04, .14], [.0, .055, .12], [.18, .035, .12]], .42);
  const loma = ground(S, -.12, '#5a5046', G + .008, .008, .24, 1.5, .18, { w: 1.4 });
  const fl = lay(S, { w: .3, h: .05, y: G + .012, z: -.105, col: '#b4aa96', trans: .3, ppm: 4200, finish: { rim: .6, rimPx: 4 }, draw: x => { x.translate(0, -(G + .012)); flockDraw(x, { x0: -.12, x1: -.035, y: G - .002, s: .017, seed: 5 }); flockDraw(x, { x0: .03, x1: .12, y: G - .002, s: .017, seed: 9 }); } });
  const mid = ground(S, -.095, '#423b33', G - .001, .002, .2, 2.6, .08, { w: 1.4 });
  const M = human(S.U, { h: .072, z: -.086, col: '#0d0b09', rim: .55, staff: true }); S.scene.add(M.g);
  const front = ground(S, -.045, '#110f0c', G - .032, .006, .14, 1.1, .02, { w: 1.4, peak: 2 });
  const C = clawd(S.U, { u: .0021, z: -.07 }); S.scene.add(C.g);
  const layers = [hills, loma, fl, mid, front], base = ['#7d7468', '#5a5046', '#8a8070', '#423b33', '#110f0c'], night = ['#5a5e7a', '#44445c', '#7a7a8e', '#2e2e3e', '#0a0a10'];
  const A = H.l06 - .1, B = H.l06 + 2.35;
  return { S, update(t) {
    const d = .64, cx = .0, cy = camY(G, .64, d);
    aim(S.cam, [cx, cy, -.08 + d, cx, cy, -.08], t, { hand: .0002 });
    const s = seg(t, A, B), ph = 4 * Math.pow(s, 1.35) + .12, f = ph % 1, i = Math.floor(ph);
    const day = ss(clamp(Math.sin(f * TAU) * 3 + .3)), nt = 1 - day;   // first half of each cycle: day; second half: night
    const arc = (q, r) => [cx + lerp(-.11, .11, q), cy + .02 + .1 * Math.sin(Math.PI * q) * r];
    const qs = clamp(f / .5), qm = clamp((f - .5) / .5), ps = arc(qs, 1), pm = arc(qm, .9);
    sun.position.set(ps[0], ps[1], -.22); mo.position.set(pm[0], pm[1], -.221);
    setMoon(sun, f < .5 ? day : 0); setMoon(mo, f >= .5 ? nt * .9 : 0);
    nsky.material.opacity = nt; sky.material.color.setScalar(lerp(1, .5, nt));
    layers.forEach((m, j) => tint(m, mixc(base[j], night[j], nt * .7)));
    setL(S, ps[0], ps[1], .24, lerp(.45, 1, day), col3('#fff0d0').lerp(col3('#9aa0d0'), nt));
    S.key.intensity = lerp(1.0, 1.4, day); S.amb.intensity = lerp(.32, .4, day); S.key.color.copy(col3('#fff4e4').lerp(col3('#9aa4d8'), nt));
    M.set({ x: .002, y: G, a: .32 }); flip(M);
    const pose = [[-.05, .45, .9], [-.043, 0, .4], [-.052, .5, -.3], [-.046, 0, .6], [-.05, .45, .2]][Math.min(4, i)];
    const pre = t < A;   // before the cycles start: Clawd walks in among the sheep
    const w = seg(t, E.T0 - .3, A + .1);
    C.set({ x: pre ? lerp(-.075, -.05, eo(w)) : pose[0], y: G - .002, walk: t * 14, stride: pre && w < 1 ? .35 : 0, tuck: pre ? 0 : pose[1], look: pre ? .8 : pose[2], blink: blinkAt(t, 2.6), k: lerp(1.25, 1, day) });
    this._f = fsOf(S, -.086);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 5, bloom: blo(.34, 1.1) }; }, grade() { return { vig: .42 }; } };
}

// S5 the bush, closer: the light grows between branches that never change; Moses comes two steps nearer and stops.
// Silence 1: the flicker freezes, nobody moves; only Clawd's glow breathes.
export function S5(E) {
  const { H } = E;
  const S = stage({ light: [.0, G + .02, -.1], lightR: .07, lightCol: '#ffe7b0', key: 1.0, keyCol: '#bfb6e6', amb: .32, ambCol: '#7a70b0', floor: .28 });
  const W = horeb(S, { bx: .0, bs: .032 });
  const M = human(S.U, { h: .074, z: -.09, col: '#08060f', rim: .6, staff: true }); S.scene.add(M.g);
  const C = clawd(S.U, { u: .0026, z: -.074 }); S.scene.add(C.g);
  const S1 = H.silencio1;
  return { S, update(t) {
    const tf = Math.min(t, S1);   // time stops at the silence
    const k = eio(seg(t, E.T0 - .6, S1)), d = lerp(.64, .55, k), cx = lerp(.006, .004, k), cy = camY(G, .63, d);
    aim(S.cam, [cx, cy, -.08 + d, cx, cy, -.08], t, { hand: t > S1 ? 0 : .0003 });
    const g = lerp(.5, 1.05, ss(seg(t, E.T0, H.l08 + .8)));
    W.B.set(g, flick(tf)); W.warm(g * .35);
    setL(S, W.bx, G + .02, lerp(.07, .11, g), lerp(1, 1.45, g));
    const st = seg(tf, H.l07 + .4, H.l07 + 1.6), stepping = st > 0 && st < 1;
    M.set({ x: lerp(.058, .042, ss(st)), y: G + (stepping ? walkY(tf, 6, .001) : 0), a: stepping ? .35 + Math.sin(tf * 6) * .12 : .35 }); flip(M);
    const back = ss(seg(tf, H.l08, H.l08 + .5));
    C.set({ x: lerp(-.032, -.038, back), y: G, look: lerp(.9, .6, back), blink: t > S1 ? 1 : blinkAt(t, 3.6, .2), tuck: .15 * back, walk: tf * 12, stride: back > 0 && back < 1 ? .3 : 0, k: 1.1 + (t > S1 ? .12 * Math.sin((t - S1) * 3.2) : 0) });
    this._f = fsOf(S, -.09);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 5, bloom: blo(.45, 1.0) }; }, grade() { return { vig: .5 }; } };
}

// S6 signature shot: «¡Moisés, Moisés!». The voice is light: the bush blazes, then the light goes out from the middle layer
// forward and backward at once: the crests turn translucent and the black rock in front shows the fine cuts hidden in it.
export function S6(E) {
  const { H } = E;
  const S = stage({ light: [.0, G + .02, -.1], lightR: .08, lightCol: '#ffe7b0', key: .9, keyCol: '#bfb6e6', amb: .3, ambCol: '#7a70b0', floor: .26 });
  const W = horeb(S, { bx: .0, bs: .032, cuts: true });
  const M = human(S.U, { h: .074, z: -.09, col: '#08060f', rim: .8, staff: true }); S.scene.add(M.g);
  const C = clawd(S.U, { u: .0024, z: -.052 }); S.scene.add(C.g); backTo(C, true);
  const cuts = [W.L.slope, W.L.crests];
  return { S, update(t) {
    const k = eio(seg(t, E.T0, E.T0 + E.dur + .4)), d = lerp(.56, .68, k), cx = .004, cy = camY(G, .62, d) - .01;
    aim(S.cam, [cx, cy, -.08 + d, cx, cy + .016, -.08], t, { hand: .0003 });
    const b1 = ss(seg(t, H.l09 - .05, H.l09 + .25)), X = H.estallido, sp = eo(seg(t, X - .05, X + 1.4));
    const g = 1.05 + .5 * b1 + .7 * ss(seg(t, X - .05, X + .3)) - .25 * ss(seg(t, X + .6, X + 1.6));
    W.B.set(g, flick(t));
    W.warm(lerp(.35, .75, sp)); tint(W.L.rock, HOREB.rock);
    // radiate from the bush: the hidden cuts appear inside a growing radius (forward: the rock; backward: the crests)
    cuts.forEach((m, i) => { const u = m.material.userData.u; u.uGR.value.z = sp * [.18, .3][i]; u.uGlowLit.value = sp * [.9, .7][i]; });
    W.L.crests.material.userData.u.uTrans.value = lerp(.42, .8, sp); W.L.ridge.material.userData.u.uTrans.value = lerp(.3, .6, sp); W.L.near.material.userData.u.uTrans.value = lerp(.06, .3, sp);
    W.sky.material.color.set(mixc('#ffffff', '#ffe2c0', sp * .5)).multiplyScalar(lerp(1, 1.25, sp));
    setL(S, W.bx, G + .02, lerp(.08, .2, sp), lerp(1.45, 2.0, sp));
    S.U.uFloor.value = lerp(.26, .4, sp); S.key.color.copy(col3('#bfb6e6').lerp(col3('#ffe7b0'), sp)); S.amb.color.copy(col3('#7a70b0').lerp(col3('#b89a78'), sp));
    M.set({ x: .044, y: G, a: .35 + .15 * b1 }); flip(M);
    C.set({ x: -.03, y: G - .016, k: lerp(1.0, 1.3, sp) });
    this._sp = sp; this._f = fsOf(S, -.09);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(.42, 1.0) }; }, grade() { return { vig: lerp(.5, .4, this._sp) }; } };
}

// S7 holy ground and the sending: Moses on his knees, his arm over his face, the sandals off in the foreground;
// on «faraón» the light stretches into a beam that points left, toward Egypt. Clawd stands aside, head low.
export function S7(E) {
  const { H } = E;
  const S = stage({ light: [.075, G + .03, -.1], lightR: .12, lightCol: '#fff1c8', key: 1.0, keyCol: '#e8d8c8', amb: .3, ambCol: '#8a7480', floor: .3 });
  S.add(skyPanel({ w: 1.6, h: 1.2, y: .1, z: -.24, stops: [[0, '#0e0a14'], [.5, '#1e1622'], [.8, '#2a1f2e'], [1, '#3a2a36']], stars: 120, starMinY: .0, seed: 21 }));
  mount(S, -.18, '#6a5a5a', -.035, [[-.2, .03, .14], [.02, .02, .1], [.2, .03, .14]], .4);
  ground(S, -.1, '#3a2c30', G + .001, .002, .2, 1.4, .12, { w: 1.4 });
  const glowR = glowMesh(.2, .2, '#fff1c8', [1, .5], [1, .5], 1.8); glowR.position.set(.11 - .1, G + .035, -.098); S.add(glowR);
  const beam = beamL(S, { x: .11, y: G + .028, z: -.12, len: .32, wid: .03, ang: -.05 });
  const M = human(S.U, { h: .088, z: -.082, col: '#0c0809', rim: .85, pose: 'cover' }); S.scene.add(M.g);
  const sd = sandals(S.U, { L: .02, z: -.06 }); sd.position.set(-.022, G - .006, -.06); S.add(sd);
  ground(S, -.066, '#1a1214', G - .008, .002, .16, 2.7, .05, { w: 1.4 });
  ground(S, -.04, '#0e0a0b', G - .036, .006, .12, .8, .02, { w: 1.4, peak: 2 });
  const C = clawd(S.U, { u: .0022, z: -.07 }); S.scene.add(C.g);
  return { S, update(t) {
    const tilt = 1 - ss(seg(t, E.T0 + .2, H.l11 + 1.6)), d = lerp(.56, .6, seg(t, E.T0, E.T0 + E.dur)), cx = .004, cy = camY(G, .62, d) - .004 * tilt;
    aim(S.cam, [cx, cy, -.08 + d, cx, cy - .03 * tilt, -.08], t, { hand: .0003 });
    const cover = ss(seg(t, E.T0, E.T0 + .9));
    M.set({ x: .02, y: G, rot: -.03 * cover + Math.sin(t * 1.1) * .004 });
    const F = H.faraon, bm = ss(seg(t, F - .1, F + .9));
    glowR.userData.set(lerp(1.1, .9, bm) * (1 + .04 * Math.sin(t * 7))); beam.set(1.3 * bm, lerp(.15, 1, bm));
    setL(S, lerp(.075, .02, bm), G + lerp(.03, .045, bm), lerp(.12, .22, bm), lerp(1.2, 1.5, bm));
    C.set({ x: -.046, y: G - .002, look: .6, blink: lerp(.5, 1, bm), tuck: .3, k: 1.0 });
    this._f = fsOf(S, -.082);
  }, post() { return { focus: this._f, aper: 8, maxCoc: 5, bloom: blo(.45, 1.0) }; }, grade() { return { vig: .5 }; } };
}

// S8 before the pharaoh, at eighty: the same colonnade, now from the middle of the hall; a warm band of light from the door;
// the pharaoh seated and still on a dais; Moses (with the staff) and Aaron standing. Clawd peeks from behind a column.
export function S8(E) {
  const S = stage({ light: [-.06, G + .05, -.1], lightR: .2, lightCol: '#ffd9a0', key: 1.3, keyCol: '#e8d6c0', amb: .34, ambCol: '#8a78a8', floor: .4 });
  const P = palace(S, { off: .04, xs2: [-.2, -.09, .07, .2] });
  const L1 = lamp(S, { x: -.012, y: G, z: -.097, k: .8 }), L2 = lamp(S, { x: .076, y: G, z: -.097, k: .8 });
  tint(P.far, '#8a6a7a'); tint(P.near, '#3a2838'); tint(P.floor, '#4a3448'); tint(P.balus, '#5a4058');
  lay(S, { w: .09, h: .03, x: .028, y: G + .004, z: -.095, col: '#2a2034', trans: .1, finish: { rim: .55 }, draw: x => { x.fillRect(-.04, -.015, .08, .008); x.fillRect(-.032, -.007, .064, .007); x.fillRect(-.024, 0, .048, .004); } });
  lay(S, { w: .04, h: .06, x: .036, y: G + .03, z: -.093, col: '#1a1424', trans: .06, finish: { rim: .5 }, draw: x => { x.fillRect(.004, -.026, .006, .052); x.fillRect(-.016, -.026, .022, .004); x.fillRect(-.016, -.026, .003, .018); x.beginPath(); x.ellipse(.007, .026, .005, .003, 0, 0, 7); x.fill(); } });
  const Ph = human(S.U, { h: .068, z: -.091, col: '#0c0910', rim: .55, pose: 'sit' }); S.scene.add(Ph.g);
  const Mo = human(S.U, { h: .072, z: -.086, col: '#0a0810', rim: .6, staff: true }); S.scene.add(Mo.g);
  const Aa = human(S.U, { h: .071, z: -.088, col: '#0a0810', rim: .5 }); S.scene.add(Aa.g);
  const C = clawd(S.U, { u: .002, z: -.062 }); S.scene.add(C.g);
  return { S, update(t) {
    const k = eio(seg(t, E.T0 - .4, E.T0 + E.dur + .4)), d = .7, cx = .0, cy = camY(G, lerp(.7, .64, k), d);
    L1.f.material.userData.u.uGlowLit.value = flick(t * 1.2); L2.f.material.userData.u.uGlowLit.value = flick(t * 1.4 + 1);
    aim(S.cam, [cx, cy, -.08 + d, cx, cy + .02, -.08], t, { hand: .0003 });
    Ph.set({ x: .034, y: G + .0085, a: .9 }); flip(Ph);
    Mo.set({ x: -.03, y: G, a: .35 });
    Aa.set({ x: -.054, y: G, a: .15 });
    const peek = ss(seg(t, E.T0 + .3, E.T0 + .9));
    C.set({ x: lerp(.068, .058, peek), y: G - .002, look: lerp(-.9, -.6, Math.sin(t * 1.5) * .5 + .5), blink: blinkAt(t, 2.9, .3), k: 1.05 });
    this._f = fsOf(S, -.088);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 5, bloom: blo(.36, 1.05) }; }, grade() { return { vig: .48 }; } };
}

// S9 forty years with his people: a lateral tracking shot beside the march, the sun crossing twice, faster;
// it brakes into a locked frame: silence 2, the line stops, the sun stays low.
export function S9(E) {
  const { H } = E;
  const S = stage({ light: [0, .06, -.1], lightR: .26, lightCol: '#ffe4b0', key: 1.5, keyCol: '#fff0d8', amb: .42, ambCol: '#c0a888', floor: .5 });
  const sky = skyPanel({ w: 1.8, h: 1.2, y: .1, z: -.24, stops: [[0, '#a89a8a'], [.45, '#d6c4a0'], [.8, '#e6d6ac'], [1, '#f0e2bc']] }); S.add(sky);
  const sun = moon({ r: .012, x: 0, y: .06, z: -.22, gain: 2.4, core: '#fffbe8', mid: '#fff2c8', edge: '#ffe2a0', halo: 7, haloGain: .45 }); S.scene.add(sun);
  const L1 = ground(S, -.19, '#c8ad7a', -.03, .02, .3, 1.1, .45, { w: 1.8, ppm: 1400 });
  const L2 = ground(S, -.14, '#b89c6a', -.045, .014, .22, 2.4, .3, { w: 1.8, ppm: 1600 });
  const L3 = ground(S, -.1, '#6a5434', G - .001, .003, .2, .5, .1, { w: 1.8 });
  const P = []; const hs = [.07, .064, .067, .061, .068, .063];
  hs.forEach((h, i) => { const m = human(S.U, { h, z: -.086 - i * .0012, col: '#1a120a', rim: .5, staff: i === 0 }); S.scene.add(m.g); P.push(m); });
  const L4 = ground(S, -.07, '#3a2c18', G - .008, .003, .16, 2.9, .05, { w: 1.8 });
  const L5 = ground(S, -.045, '#1a130a', G - .034, .007, .14, 1.7, .02, { w: 1.8, peak: 2 });
  const C = clawd(S.U, { u: .0021, z: -.072 }); S.scene.add(C.g);
  const S2 = H.silencio2, A = E.T0 - .6;
  const layers = [L1, L2, L3, L4, L5], base = ['#c8ad7a', '#b89c6a', '#6a5434', '#3a2c18', '#1a130a'], dusk = ['#a08c78', '#8a7660', '#4a3e30', '#2a2016', '#120c06'];
  return { S, update(t) {
    const tw = Math.min(t, S2);
    const u = seg(tw, A, S2), D = .1 * (u - .25 * u * u) / .75;   // distance walked, braking to a stop at the silence
    const d = .8, cx = -.046 + D, cy = camY(G, .65, d);
    aim(S.cam, [cx, cy, -.08 + d, cx, cy, -.08], t, { hand: t > S2 ? 0 : .0003 });
    const v = 1 - .7 * u, moving = t < S2;
    P.forEach((m, i) => { const ph = tw * 8 + i * 1.3; m.set({ x: .03 + D - i * .026, y: G + (moving ? walkY(ph, 1, .0012) * v : 0), a: moving ? .2 + Math.sin(ph) * .28 * v : .2, rot: moving ? .02 * v : 0 }); });
    C.set({ x: .03 + D - hs.length * .026 + .002, y: G - .002 + (moving ? walkY(tw * 9, 1, .0008) : 0), walk: tw * 16, stride: moving ? .35 * v : 0, look: .8, blink: t > S2 ? 1 : blinkAt(t, 3), k: 1.05 });
    // the sun crosses twice, the second faster; at the silence it is low and stays
    const s = seg(t, E.T0 - .2, S2), ph = clamp(1.85 * Math.pow(s, 1.25)), f = ph < 1 ? ph : (ph - 1) / .85;
    const sx = cx + lerp(-.12, .12, f), sy = cy + .025 + .09 * Math.sin(Math.PI * clamp(f));
    sun.position.set(sx, sy, -.22);
    const low = 1 - Math.sin(Math.PI * clamp(f)), dim = ss(seg(t, S2 - .2, S2 + .5));
    setMoon(sun, lerp(1, .7, low));
    layers.forEach((m, i) => tint(m, mixc(base[i], dusk[i], Math.max(low * .6, dim))));
    sky.material.color.set(mixc('#ffffff', '#d8c8b8', Math.max(low * .5, dim)));
    setL(S, sx, sy, .26, lerp(1, .7, dim), col3('#ffe4b0').lerp(col3('#ffc890'), low));
    S.key.intensity = lerp(1.5, 1.0, dim);
    this._f = fsOf(S, -.086);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 5, bloom: blo(.32, 1.1) }; }, grade() { return { vig: .42 }; } };
}

// —— Mount Nebo at dawn: gold sky, the valley below the horizon (the Jordan, the palms of Jericho), the summit rock in front ——
function nebo(S, o = {}) {
  const hz = o.hz ?? G + .03, sky = skyPanel({ w: 1.8, h: 1.2, y: .1, z: -.26, stops: [[0, '#b89a88'], [.35, '#f0d6aa'], [.6, '#ffeec4'], [.8, '#fff4d8'], [1, '#ffeac0']] }); S.add(sky);
  const sun = moon({ r: .016, x: o.sx ?? .07, y: o.sy ?? hz + .02, z: -.24, gain: 2.6, core: '#fffdf0', mid: '#fff4d0', edge: '#ffe6a8', halo: 8, haloGain: .55 }); S.scene.add(sun);
  const R = mulberry(51);
  const far = mount(S, -.22, '#e8c898', hz - .006, [[-.25, .016, .15], [.02, .01, .2], [.27, .02, .15]], .6, { w: 1.8 });
  // the Jordan: a white ribbon that lights from within
  const river = x => { x.lineWidth = .0035; x.beginPath(); for (let u = -.9; u <= .9; u += .005) x.lineTo(u, .002 * Math.sin(u * 30) + .003 * Math.sin(u * 9 + 1)); x.stroke(); };
  const jordan = lay(S, { w: 1.8, h: .03, y: hz - .016, z: -.21, col: '#fff6e0', trans: .3, shadow: false, ppm: 1600, finish: { rim: 0, under: 0 }, draw: river, glowDraw: x => { x.strokeStyle = '#fff'; river(x); }, glow: 2.2, glowCol: '#fff6e0' });
  const fields = lay(S, { w: 1.8, h: .2, y: hz - .12, z: -.2, col: '#d8b47a', trans: .45, ppm: 1600, finish: { rim: .4 }, draw: x => {
    x.translate(0, -(hz - .12)); waveFill(x, { x0: -.9, x1: .9, base: hz - .022, amp: .003, len: .2, ph: 2, peak: 1 });
    for (let i = 0; i < 22; i++) palmDraw(x, -.24 + i * .02 + R() * .01 + (i > 10 ? .14 : 0), hz - .022, .009 + R() * .005, (R() - .5) * .3);
  } });
  const hills = ground(S, -.17, '#c09860', hz - .036, .007, .16, 3.3, .3, { w: 1.8 });
  const slope = ground(S, -.13, '#8a6838', hz - .056, .01, .18, 1.9, .14, { w: 1.8 });
  // the summit: a rock that rises on the left and ends in an edge over the valley
  const top = o.edge ?? .05;
  const rock = lay(S, { w: 1.2, h: .5, y: -.2, z: -.08, col: '#3a2a16', trans: .06, ppm: 2400, finish: { rim: .55, rimPx: 5, rimCol: 'rgba(255,232,180,.6)' }, draw: x => {
    x.translate(0, .2); x.beginPath(); x.moveTo(-.6, -.3);
    for (let u = -.6; u <= top + .06; u += .002) { const fall = u > top ? (u - top) * 1.6 : 0; x.lineTo(u, G - .001 + .0012 * Math.sin(u * 90) + .0008 * Math.sin(u * 330) - fall + (u < -.08 ? (-.08 - u) * .1 : 0)); }
    x.lineTo(top + .06, -.3); x.closePath(); x.fill();
  } });
  const front = ground(S, -.045, '#1e1408', G - .036, .008, .14, .9, .02, { w: 1.4, peak: 2 });
  const L = { far, fields, hills, slope };
  return { sky, sun, jordan, L, rock, front };
}

// S10 the Nebo, at a hundred and twenty: Moses upright on the summit, staff vertical, head high on «vista»; tilt up from foot to head.
// Clawd climbs the last steps and sits on a rock to one side.
export function S10(E) {
  const { H } = E;
  const S = stage({ light: [.07, -.02, -.1], lightR: .26, lightCol: '#ffe6b0', key: 1.6, keyCol: '#ffecd0', amb: .42, ambCol: '#c8a888', floor: .5 });
  nebo(S, { sx: .062 });
  const M = human(S.U, { h: .078, z: -.084, col: '#1a1008', rim: .75, staff: true }); S.scene.add(M.g);
  lay(S, { w: .04, h: .02, x: -.03, y: G - .003, z: -.074, col: '#2a1c0e', trans: .05, finish: { rim: .5 }, draw: x => { x.beginPath(); x.moveTo(-.017, -.01); x.quadraticCurveTo(-.015, .007, -.003, .008); x.quadraticCurveTo(.012, .008, .017, -.01); x.closePath(); x.fill(); } });
  const C = clawd(S.U, { u: .0023, z: -.07, glow: .45 }); S.scene.add(C.g);
  return { S, update(t) {
    const k = eio(seg(t, E.T0 - .3, H.l16 + .6)), d = .6, cx = .008, cy = camY(G, lerp(.58, .66, k), d);
    aim(S.cam, [cx, cy, -.08 + d, cx, cy + lerp(-.012, .01, k), -.08], t, { hand: .0003 });
    const up = ss(seg(t, H.l16 + .1, H.l16 + .7));
    M.set({ x: .022, y: G, a: .3, rot: lerp(0, .035, up) });
    const cl = seg(t, E.T0, H.l15 + 1.6), climbing = cl > 0 && cl < 1;
    C.set({ x: lerp(-.06, -.032, eo(cl)), y: lerp(G - .02, G + .0055, ss(cl)) + (climbing ? walkY(t, 9, .001) : 0), walk: t * 13, stride: climbing ? .4 : 0, rot: climbing ? .12 * (1 - cl) : 0, tuck: ss(seg(t, H.l15 + 1.6, H.l15 + 2)) * .35, look: lerp(.6, .9, up), blink: blinkAt(t, 3.2), k: 1 });
    this._f = fsOf(S, -.084);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 5, bloom: blo(.34, 1.05) }; }, grade() { return { vig: .38 }; } };
}

// S11 the promised land, seen and not entered: Moses at the edge of the summit; the valley lights in gold from far to near,
// the Jordan a white ribbon, the palms of Jericho. The camera cranes up and moves toward the valley but stays on the rock, like him.
export function S11(E) {
  const { H } = E;
  const S = stage({ light: [.05, G + .02, -.1], lightR: .3, lightCol: '#ffe6b0', key: 1.6, keyCol: '#ffecd0', amb: .42, ambCol: '#c8a888', floor: .5 });
  const N = nebo(S, { sx: .075, edge: .006 });
  const M = human(S.U, { h: .074, z: -.076, col: '#1a1008', rim: .8, staff: true }); S.scene.add(M.g);
  const C = clawd(S.U, { u: .0021, z: -.07, glow: .45 }); S.scene.add(C.g);
  const lit = { far: '#fff0c8', fields: '#ffe0a0', hills: '#f0c47a', slope: '#c8945a' }, dimc = { far: '#b8a080', fields: '#9a8058', hills: '#86663e', slope: '#5a4224' };
  const order = ['far', 'fields', 'hills', 'slope'];
  return { S, update(t) {
    const k = eio(seg(t, E.T0 - .6, E.T0 + E.dur + .5)), d = lerp(.66, .58, k), cx = lerp(.0, .016, k), cy = camY(G, lerp(.6, .66, k), d);
    aim(S.cam, [cx, cy, -.08 + d, cx + .004 * k, cy - .006 * k, -.08], t, { hand: .0003 });
    const A = H.l17 + .05;
    order.forEach((nm, i) => { const p = ss(seg(t, A + i * .3, A + i * .3 + .5)); tint(N.L[nm], mixc(dimc[nm], lit[nm], p), 1 + .2 * p); });
    N.jordan.material.userData.u.uGlowLit.value = ss(seg(t, A + .1, A + .6));
    setL(S, .05, G + .02, .3, lerp(.9, 1.5, ss(seg(t, A, A + 1.4))));
    M.set({ x: -.014, y: G, a: .3, rot: .03 });
    C.set({ x: -.046, y: G - .002, tuck: .35, look: .9, blink: 1, k: 1 });
    this._f = fsOf(S, -.076);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 5, bloom: blo(.36, 1.05) }; }, grade() { return { vig: .36 }; } };
}

// S12 the empty summit, echo of S1: Clawd on the left, the light (the sun over the valley) on the right; no figure, no mark.
// On «no era tarde» the gold rises a step; on the question Clawd turns to us. Slow pull-out (the reverse of S1).
export function S12(E) {
  const { H } = E;
  const S = stage({ light: [.06, -.03, -.1], lightR: .26, lightCol: '#ffe6b0', key: 1.6, keyCol: '#ffecd0', amb: .42, ambCol: '#c8a888', floor: .5 });
  const N = nebo(S, { sx: .05 });
  const C = clawd(S.U, { u: .0032, z: -.07, glow: .45 }); S.scene.add(C.g);
  return { S, update(t) {
    const k = eio(seg(t, E.T0 - .6, E.T0 + E.dur)), d = lerp(.54, .64, k), cx = lerp(.006, .01, k), cy = camY(G, .64, d);
    aim(S.cam, [cx, cy, -.08 + d, cx, cy, -.08], t, { hand: .0003 });
    const gold = ss(seg(t, H.leccion, H.leccion + 1.2)); this._g = gold;
    N.sky.material.color.setScalar(lerp(1, 1.15, gold)); setMoon(N.sun, lerp(1, 1.25, gold));
    setL(S, .06, -.03, .26, lerp(1, 1.4, gold));
    const turn = ss(seg(t, H.pregunta - .3, H.pregunta + .2)), hop = Math.sin(Math.PI * seg(t, H.pregunta - .3, H.pregunta + .1)) * .004;
    C.set({ x: -.028, y: G - .001 + hop, look: lerp(.9, 0, turn), blink: t > H.pregunta + .3 ? blinkAt(t, 2.6, .2) : blinkAt(t, 3.6), aL: .25 * turn, aR: .25 * turn, k: 1.05 });
    this._f = fsOf(S, -.07);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 5, bloom: blo(.34, 1.1) }; }, grade() { return { vig: .34, expo: 1 + .08 * this._g }; } };
}

export { horeb, nebo, HOREB, HOREB_W, camY };
