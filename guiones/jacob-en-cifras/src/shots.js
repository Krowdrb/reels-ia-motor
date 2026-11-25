// The twelve shots of "Jacob en cifras: siete, siete y veinte" (Génesis 29–32). Each: { S, update(t), post(), grade() }; t in film seconds.
// Two dawns rhyme: a cold one that brings Lea, a golden one that brings the name Israel. Jacob, Raquel, Lea, Labán and the caravan are
// quiet dark silhouettes; the man of the struggle is only a figure of light with no face, and he dissolves into the sun. No blows.
// Clawd is the only clay-coloured thing: he counts the years with pebbles and only watches (still, to one side, in the struggle and the blessing).
import * as THREE from 'three';
import { skyPanel, moon, setMoon, text, burst } from './paper.js';
import { stage, aim } from './stage.js';
import { mulberry, seg, ss, eio, eo, lerp, clamp, TAU } from './lib.js';
import { mk, cut, tint, clawd, human, waveFill, glowMesh, mountFill, flockDraw, well, pebble, bag, veil, tentDraw, camelDraw } from './actors.js';

const blo = (s = .34, th = 1.1) => ({ strength: s, radius: .6, threshold: th });
const lay = (S, o) => S.add(mk(S.U, o));
const col3 = c => new THREE.Color(c);
const mixc = (a, b, p) => '#' + col3(a).lerp(col3(b), clamp(p)).getHexString();
const setL = (S, x, y, r, lit, c) => { S.U.uLight.value.x = x; S.U.uLight.value.y = y; S.U.uLightR.value = r; S.U.uLit.value = lit; if (c) S.U.uLightCol.value.copy(c); };
const bob = (t, f, a, p = 0) => Math.sin(t * f + p) * a;
const fsOf = (S, z) => S.cam.position.z - z;
const blinkAt = (t, per = 3.3, ph = 0) => 1 - .9 * Math.max(0, 1 - Math.abs((((t + ph) % per) + per) % per - .1) / .1);
// camera height that puts world height gy at fraction f of the frame from the top, for a level camera at distance d
const camY = (gy, f, d) => gy - (.5 - f) * .4617 * d;
const flip = A => { A.g.scale.x = -Math.abs(A.g.scale.x); };
const backTo = (C, on) => { C.eyeL.visible = C.eyeR.visible = !on; };   // Clawd seen from behind: no eyes
const ei3 = t => { t = clamp(t); return t * t * (3 - 2 * t) * t; };
const G = -.06;   // ground line where the figures stand
export { G, camY };

// a ground sheet whose top is a soft wave at world height `base`
const ground = (S, z, col, base, amp, len, ph, tr = .08, o = {}) => { const w = o.w || 1.2, ox = o.x || 0; return lay(S, { w, h: .5, x: ox, y: -.2, z, col, trans: tr, ppm: o.ppm || Math.min(2400, 4000 / w), finish: { rim: o.rim ?? .45 }, draw: x => { x.translate(-ox, .2); waveFill(x, { x0: ox - w / 2, x1: ox + w / 2, base, amp, len, ph, peak: o.peak ?? 1.3 }); } }); };
const mount = (S, z, col, base, peaks, tr = .3, o = {}) => { const w = o.w || 1.3; return lay(S, { w, h: .6, y: -.2, z, col, trans: tr, ppm: o.ppm || 1600, finish: { rim: o.rim ?? .45 }, draw: x => { x.translate(0, .2); mountFill(x, { x0: -w / 2, x1: w / 2, base, peaks, ph: z * 50 }); } }); };
// sky: stops given as world heights [[y, col], ...] (top first); h tall, centred at y
const sky = (S, { z = -.24, w = 1.6, h = .9, y = .05, ys, stars = 0, starMinY = .0, gain = 1, seed = 5 }) => { const top = y + h / 2; return S.add(skyPanel({ w, h, y, z, gain, stars, seed, starMinY: starMinY - y, stops: ys.map(([yy, c]) => [clamp((top - yy) / h), c]) })); };

// the paper title strip (only at the start), held in front of the camera
const TITLE = { top: 'SIETE Y SIETE', sub: 'Génesis 29–32', in: .3, out: 4.0 };
function titleStrip(S) {
  const W = .124, Hh = .05;
  const m = lay(S, { w: W, h: Hh, y: .088, z: -.03, col: '#e7d4a8', trans: .35, shadow: false, recv: false, ppm: 9000, finish: { rim: .3, under: .2 }, draw: x => {
    x.beginPath(); x.roundRect(-W / 2 + .001, -Hh / 2 + .001, W - .002, Hh - .002, .002); x.fill();
    cut(x, () => {
      x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.font = '800 100px Cinzel'; const k = Math.min(.0128, .106 / (x.measureText(TITLE.top).width / 100)); x.restore();
      text(x, TITLE.top, 0, .0062, k, 'Cinzel', { weight: 800, fill: '#000' });
      text(x, TITLE.sub, 0, -.0118, .0094, 'Playfair', { weight: 'italic 500', fill: '#000' });
    });
  }, glowDraw: x => { x.fillStyle = '#fff'; x.fillRect(-W / 2, -Hh / 2, W, Hh); }, glow: .55, glowCol: '#e7d4a8', glowRes: .2 });
  m.material.userData.u.uClip.value.set(0, .088, 0, 0);
  return t => {
    const reveal = ss(seg(t, TITLE.in, TITLE.in + .5)) * (1 - ss(seg(t, TITLE.out - .4, TITLE.out)));
    const cz = S.cam.position.z + .03, ts = cz / .55; m.scale.setScalar(ts); m.position.x = S.cam.position.x; m.position.y = S.cam.position.y + .4617 * cz / 2 * .62;
    m.material.userData.u.uClip.value.set(m.position.x, m.position.y, .085 * reveal * ts, 0); m.visible = reveal > .002;
  };
}

// —— pebbles: Clawd's way of counting. A row on the lip; a pebble falls from the hand to its place with a short bounce ——
const LIP = G + .01;                 // top of the well's lip
const WZ = -.066;                    // the well's front face; pebbles and a sitting Clawd sit just behind it, so the lip hides their bottoms
const PZ = WZ - .0008;
const rowX = (i, x0 = .004, dx = .0068) => x0 + i * dx;
function pebbles(S, n, seed = 1) { const P = []; for (let i = 0; i < n; i++) { const p = pebble(S.U, { r: .0029, z: PZ, seed: seed + i * 7 }); S.add(p); P.push(p); } return P; }
// place pebble p: lands at (x, y) at time tl; leaves the hand (hx, hy) d s before; hidden before that
function drop(p, t, tl, x, y, hx, hy, d = .32) {
  const k = seg(t, tl - d, tl); p.visible = t >= tl - d;
  if (k >= 1) { const b = seg(t, tl, tl + .16); p.position.set(x, y + Math.sin(Math.PI * b) * .0018 * (1 - b), PZ); return; }
  p.position.set(lerp(hx, x, k), lerp(hy, y, k * k) + Math.sin(Math.PI * k) * .004, PZ);
}

// —— Haran: sky, far hills, the field with Laban's flock, the ground where people stand, the well, the dark front ——
const VIOLET = { sky: [[.26, '#191530'], [.1, '#2b2440'], [.02, '#5a4c74'], [-.03, '#a8869e'], [-.05, '#d9b3a8']], hills: '#5c5276', field: '#3a3152', flock: '#2a2340', mid: '#2a2342', well: '#0d0b16', stone: '#0d0b16', front: '#09070f', fig: '#0c0a14' };
const OCHRE = { sky: [[.26, '#8a8574'], [.1, '#a59c86'], [.02, '#c9bfa4'], [-.04, '#e2d6b8']], hills: '#7a705c', field: '#5e5644', flock: '#45402f', mid: '#4a4232', well: '#13110b', stone: '#13110b', front: '#0e0c08', fig: '#16130c' };
const DUSKO = { sky: [[.26, '#5a4a52'], [.1, '#8a7466'], [.02, '#c9a87e'], [-.04, '#e8c89a']], hills: '#7a6650', field: '#5a4a38', flock: '#3e3426', mid: '#40362a', well: '#120e09', stone: '#120e09', front: '#0c0906', fig: '#140f0a' };
function haran(S, P, o = {}) {
  const sk = sky(S, { ys: P.sky, h: 1 });
  const sun = moon({ r: o.sunR ?? .011, x: o.sunX ?? .0, y: o.sunY ?? G + .045, z: -.23, gain: 1.9, core: '#fffaf0', mid: '#fbe7b8', edge: '#f4d79a', halo: 7, haloGain: .45 }); S.scene.add(sun);
  const hills = mount(S, -.2, P.hills, G + .006, [[-.3, .03, .14], [-.12, .045, .12], [.08, .028, .1], [.26, .04, .14]], .45);
  const field = ground(S, -.155, P.field, G + .006, .003, .2, 1.4, .25, { w: 1.4, ppm: 1700 });
  const flock = lay(S, { w: 1.2, h: .04, y: G + .006, z: -.14, col: P.flock, trans: .15, ppm: 3000, finish: { rim: .5 }, draw: x => { x.translate(0, -(G + .006)); flockDraw(x, { x0: -.5, x1: -.09, y: G + .004, s: .01, seed: 3 }); flockDraw(x, { x0: .1, x1: .5, y: G + .003, s: .0095, seed: 9 }); } });
  const mid = ground(S, -.105, P.mid, G - .001, .0015, .2, 2.6, .1, { w: 1.4 });
  const W = well(S.U, { w: o.ww || .1, z: WZ, col: P.well }); W.position.x = o.wx ?? 0; W.position.y += LIP; S.add(W);
  const stone = lay(S, { w: .05, h: .03, x: (o.wx ?? 0) - .066, y: G - .004, z: WZ - .006, col: P.well, trans: .04, finish: { rim: .5 }, draw: x => { x.beginPath(); x.ellipse(0, .002, .02, .0085, -.08, 0, TAU); x.fill(); x.fillRect(-.02, -.015, .04, .017); } });
  const front = ground(S, -.045, P.front, G - .03, .004, .16, .9, .02, { w: 1.2, rim: .3 });
  const L = { hills, field, flock, mid, well: W, stone, front };
  return { sky: sk, sun, L, tintTo(Pa, Pb, p) { for (const k in L) tint(L[k], mixc(Pa[k], Pb[k], p)); } };
}

// S1 the well of Haran at dusk: push-in. Jacob with his staff, Raquel with her jar, Clawd on the lip holding the first pebble.
// On «no era ella» a gauze veil glides in front of Raquel and makes her a pale shadow. Title strip.
export function S1(E) {
  const { H } = E;
  const S = stage({ light: [0, G + .045, -.1], lightR: .16, lightCol: '#f4d79a', key: 1.3, keyCol: '#e6d6f0', amb: .4, ambCol: '#8c80b8', floor: .36 });
  haran(S, VIOLET);
  const J = human(S.U, { h: .066, z: -.095, col: VIOLET.fig, rim: .6, staff: true }); S.scene.add(J.g);
  const R = human(S.U, { h: .061, z: -.095, col: VIOLET.fig, rim: .6, pose: 'woman', jar: true }); S.scene.add(R.g);
  const C = clawd(S.U, { u: .0026, z: WZ - .0012 }); S.scene.add(C.g);
  const p0 = pebble(S.U, { r: .0026, z: WZ + .0006, seed: 3 }); S.add(p0);
  const V = veil(.036, .066, '#d8cfe8', .55); V.position.z = -.089; S.scene.add(V);
  const T = titleStrip(S);
  return { S, update(t) {
    const k = eio(seg(t, 0, E.T0 + E.dur + .5)), d = lerp(.64, .56, k), cx = 0, cy = camY(G, .62, d);
    aim(S.cam, [cx, cy, -.08 + d, cx, cy, -.08], t, { hand: .0003 });
    J.set({ x: -.047, y: G, a: .25 + bob(t, .8, .03) });
    R.set({ x: .047, y: G, a: .15 + bob(t, .7, .02) }); flip(R);
    const u = .0026, toJ = ss(seg(t, H.l01 + .5, H.l01 + .8)), toR = ss(seg(t, H.l01 + 1.6, H.l01 + 1.9));
    const look = lerp(lerp(.2, -1, toJ), 1, toR);
    const vel = ss(seg(t, H.velo - .3, H.velo + .6));
    C.set({ x: 0, y: LIP - 2 * u, look, blink: t > H.velo + .4 ? lerp(1, .5, ss(seg(t, H.velo + .4, H.velo + .9))) * blinkAt(t, 2.6, .2) : blinkAt(t, 3.2, .4), aR: .9, aL: .15, k: 1.1 });
    p0.position.set(8.6 * u, LIP + 7.2 * u, WZ + .0006);
    V.position.x = lerp(.13, .048, vel); V.position.y = G + .0635; V.visible = vel > .001;
    setL(S, 0, G + .045, .16, 1.0); T(t);
    this._f = fsOf(S, WZ);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(.4, 1.0) }; }, grade() { return { vig: .48, sat: 1.04 }; } };
}

// S2 seven years «like a few days»: locked frame on the lip; the sky runs day–dusk–day seven times without a night; one pebble per pass.
export function S2(E) {
  const { H } = E;
  const S = stage({ light: [0, G + .06, -.1], lightR: .2, lightCol: '#f4d79a', key: 1.35, keyCol: '#ece0f0', amb: .42, ambCol: '#9488bc', floor: .4 });
  const Hr = haran(S, VIOLET, { sunY: G + .05 });
  const J = human(S.U, { h: .05, z: -.13, col: VIOLET.fig, rim: .5, staff: true }); S.scene.add(J.g);
  const C = clawd(S.U, { u: .0032, z: WZ - .0012 }); S.scene.add(C.g);
  const P = pebbles(S, 7, 11);
  const A = col3('#5a5070'), B = col3('#e0d2e2'), t0 = H.l03 - .15, per = 2.35 / 7;
  return { S, update(t) {
    const d = .46, cx = .0, cy = camY(LIP, .64, d);
    aim(S.cam, [cx, cy, -.08 + d, cx, cy, -.08], t, { hand: .0002 });
    const cyc = Math.max(0, (t - t0) / per), f = cyc % 1, on = cyc < 7;
    const day = on ? .5 - .5 * Math.cos(TAU * f) : 0;
    Hr.sky.material.color.copy(A.clone().lerp(B, day));
    Hr.sun.position.set(lerp(-.09, .09, on ? f : 1), G + .02 + Math.sin(Math.PI * (on ? f : 1)) * .07, -.23);
    setL(S, Hr.sun.position.x, Hr.sun.position.y, .22, lerp(.75, 1.25, day)); S.key.intensity = lerp(1.0, 1.6, day);
    const u = .0032, cxC = -.027, hx = cxC + 8.5 * u, hy = LIP + 6.5 * u;
    P.forEach((p, i) => drop(p, t, t0 + (i + .62) * per, rowX(i, .006, .0069), LIP - .0012, hx, hy));
    const raise = on && t > t0 ? Math.max(0, Math.sin(Math.PI * clamp((f - .1) / .5))) : 0;
    const after = ss(seg(t, t0 + 7 * per, t0 + 7 * per + .3));
    C.set({ x: cxC, y: LIP - 2 * u, aR: lerp(.4, 1.5, raise) * (1 - after) + .3 * after, aL: .2, look: lerp(.6, 1, after), blink: blinkAt(t, 3, .5), k: 1.1 });
    J.set({ x: .03 + .01 * Math.sin(t * .6), y: G + .004, a: .3 });
    this._f = fsOf(S, WZ);
  }, post() { return { focus: this._f, aper: 8, maxCoc: 7, bloom: blo(.38, 1.0) }; }, grade() { return { vig: .48 }; } };
}

// —— lamps: a small flame (emissive paper) and its halo ——
function lamp(S, x, y, z, s = .004) {
  const shape = c => { c.beginPath(); c.moveTo(0, s * 1.2); c.quadraticCurveTo(s * .55, 0, 0, -s * .5); c.quadraticCurveTo(-s * .55, 0, 0, s * 1.2); c.fill(); };
  const f = lay(S, { w: s * 2, h: s * 3, x, y: y + s * .9, z, col: '#ffc874', trans: .2, shadow: false, recv: false, ppm: 9000, finish: { rim: 0, under: 0, grain: false },
    draw: shape, glowDraw: c => { c.fillStyle = '#fff'; shape(c); }, glow: 3, glowCol: '#ffc874', glowRes: 1 });
  const h = glowMesh(s * 9, s * 9, '#ffb860'); h.position.set(x, y + s, z - .001); S.scene.add(h);
  return { set(k) { f.visible = k > .02; f.material.userData.u.uGlowLit.value = k; f.scale.setScalar(.6 + .4 * k); h.userData.set(.5 * k); } };
}

// S3 the wedding night, indigo: pan from the feast to the tent door; Labán leads a veiled, quiet figure to the door.
// Silence 1: the lamps go out one by one, far to near; the dark door remains. Clawd beside a taut rope, still.
export function S3(E) {
  const { H } = E;
  const S = stage({ light: [-.03, G + .03, -.1], lightR: .16, lightCol: '#ffc874', key: 1.05, keyCol: '#b8b0e6', amb: .38, ambCol: '#5c56a0', floor: .32 });
  sky(S, { ys: [[.26, '#0a0818'], [.08, '#17132c'], [.0, '#2c2550'], [-.04, '#40366a']], stars: 240, starMinY: -.02, seed: 7 });
  const R = mulberry(5);
  lay(S, { w: 1.2, h: .06, y: G + .015, z: -.19, col: '#4a4070', trans: .35, ppm: 2000, finish: { rim: .45 }, draw: x => {
    x.translate(0, -(G + .015)); x.fillRect(-.6, G - .02, 1.2, .022);
    for (let i = 0; i < 9; i++) tentDraw(x, { cx: -.3 + i * .075 + R() * .02, base: G - .001, w: .04 + R() * .02, hh: .014 + R() * .006 });
  } });
  ground(S, -.14, '#2e2650', G + .004, .002, .2, 1.8, .2, { w: 1.4 });
  const guests = [-.13, -.112, -.093, -.077, -.058, -.04].map((x, i) => { const g = human(S.U, { h: .044 + (i % 3) * .003, z: -.134 - (i % 2) * .002, col: '#100c1c', rim: .45, pose: i % 3 === 1 ? 'woman' : 'stand' }); S.scene.add(g.g); if (i % 2) flip(g); return [g, x]; });
  const L = [];
  for (const x of [-.28, -.2, -.12, -.04, .06, .16]) L.push(lamp(S, x, G + .008, -.188, .0026));
  for (const x of [-.122, -.085, -.05]) { lay(S, { w: .004, h: .05, x, y: G + .018, z: -.128, col: '#1a1530', trans: .05, draw: c => c.fillRect(-.0006, -.025, .0012, .042) }); L.push(lamp(S, x, G + .036, -.1275, .0034)); }
  ground(S, -.105, '#1c1834', G - .001, .0012, .2, 2.2, .08, { w: 1.4 });
  const TX = .025;
  lay(S, { w: .16, h: .09, x: TX, y: G + .03, z: -.1, col: '#08070f', trans: .04, ppm: 3000, finish: { rim: .5 }, draw: x => { x.translate(-TX, -(G + .03)); tentDraw(x, { cx: TX, base: G - .004, w: .11, hh: .05 }); } });
  lay(S, { w: .03, h: .04, x: TX, y: G + .014, z: -.0995, col: '#120e22', trans: .06, ppm: 5000, finish: { rim: .5 }, draw: x => { x.beginPath(); x.moveTo(-.011, -.018); x.lineTo(-.0075, .017); x.lineTo(.0075, .017); x.lineTo(.011, -.018); x.closePath(); x.fill(); cut(x, () => x.fillRect(-.0004, -.018, .0008, .035)); } });
  L.push(lamp(S, TX - .03, G + .028, -.098, .0036));
  lay(S, { w: .05, h: .05, x: TX + .068, y: G + .015, z: -.093, col: '#100c1c', trans: .05, shadow: false, finish: { rim: .5 }, draw: x => { x.lineWidth = .0007; x.beginPath(); x.moveTo(-.022, .019); x.lineTo(.016, -.019); x.stroke(); x.fillRect(.013, -.023, .003, .008); } });
  const Lb = human(S.U, { h: .066, z: -.09, col: '#05040b', rim: .55, staff: true }); S.scene.add(Lb.g);
  const Bv = human(S.U, { h: .06, z: -.0905, col: '#05040b', rim: .5, pose: 'woman' }); S.scene.add(Bv.g);
  const V = veil(.026, .05, '#c4bce6', .42); V.position.z = -.0896; S.scene.add(V);
  const C = clawd(S.U, { u: .002, z: -.094 }); S.scene.add(C.g);
  ground(S, -.05, '#06050c', G - .032, .003, .16, 1.2, .02, { w: 1.2, rim: .3 });
  const out = (i, n) => H.silencio1 + .05 + (i / (n - 1)) * 1.0;
  return { S, update(t) {
    const k = eio(seg(t, E.T0 + .1, H.silencio1 - .1)), d = .56, cx = lerp(-.05, .02, k), cy = camY(G, .62, d);
    aim(S.cam, [cx, cy, -.08 + d, cx, cy, -.08], t, { hand: .0003 });
    guests.forEach(([g, x], i) => { g.set({ x, y: G + .003, a: .3 + bob(t, .9, .12, i) }); if (i % 2) flip(g); });
    const wk = seg(t, E.T0, H.l04 + 1.9), wx = lerp(-.07, TX - .012, eo(wk)), moving = wk < 1, ph = t * 6;
    Lb.set({ x: wx + .016, y: G + (moving ? Math.abs(Math.sin(ph)) * .0008 : 0), a: moving ? .2 + Math.sin(ph) * .2 : .9 });
    Bv.set({ x: wx - .003, y: G + (moving ? Math.abs(Math.sin(ph + 1)) * .0007 : 0), a: .1, rot: -.03 });
    V.position.set(wx - .002, G + .0615 + (moving ? Math.abs(Math.sin(ph + 1)) * .0007 : 0), -.0896);
    L.forEach((l, i) => { const o = ss(seg(t, out(i, L.length), out(i, L.length) + .12)); l.set((1 - o) * (1 + .07 * Math.sin(9 * t + i * 2))); });
    const dark = ss(seg(t, H.silencio1, H.silencio1 + 1.15));
    setL(S, cx - .02, G + .03, .16, lerp(1, .12, dark)); S.key.intensity = lerp(1.05, .12, dark); S.amb.intensity = lerp(.38, .05, dark);
    V.material.opacity = V.userData.op * lerp(1, .35, dark);
    C.set({ x: TX + .052, y: G, look: dark > .1 ? -.6 : lerp(-1, -.4, k), blink: dark > .1 ? 1 : blinkAt(t, 3.1, .2), k: lerp(1, .22, dark), tuck: .15 });
    this._f = fsOf(S, -.09); this._d = dark;
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(.45, .95) }; }, grade() { return { vig: lerp(.5, .65, this._d), sat: .96 }; } };
}

// S4 the cold dawn at the tent door: grey-blue, the only morning without gold. The veil lifts: Lea, standing, quiet, her head barely bowed.
// Jacob in front, out of focus, his arm falling slowly; rack focus to Lea on «Lea». Clawd to the right of the door, outside, looks away.
export function tentDawn(S, o = {}) {
  sky(S, { ys: o.sky || [[.26, '#262b3c'], [.08, '#3b4258'], [.0, '#6d7590'], [-.03, '#b4bccc'], [-.045, '#dfe3ee']] });
  mount(S, -.2, '#545c78', G + .006, [[-.2, .02, .12], [.0, .028, .12], [.22, .022, .14]], .4);
  const TX = .006;
  lay(S, { w: .3, h: .1, x: TX, y: G + .03, z: -.125, col: '#262a3a', trans: .3, ppm: 2600, finish: { rim: .45 }, draw: x => { x.translate(-TX, -(G + .03)); tentDraw(x, { cx: TX, base: G - .004, w: .2, hh: .062, door: 1, dw: .085 }); } });
  lay(S, { w: .03, h: .048, x: TX, y: G + .026, z: -.13, col: '#dfe3ee', trans: .9, shadow: false, recv: false, finish: { rim: 0, under: 0 }, draw: x => x.fillRect(-.015, -.024, .03, .048), glowDraw: x => { x.fillStyle = '#fff'; x.fillRect(-.015, -.024, .03, .048); }, glow: 2.2, glowCol: '#e8ecf4' });
  ground(S, -.11, '#1c2030', G - .001, .0012, .2, 1.4, .06, { w: 1.2 });
  const Le = human(S.U, { h: .062, z: -.115, col: '#0c0e16', rim: .7, pose: 'woman' }); S.scene.add(Le.g);
  const J = human(S.U, { h: .1, z: -.052, col: '#07080d', rim: .5 }); S.scene.add(J.g);
  ground(S, -.046, '#07080d', G - .034, .003, .14, 2.2, .02, { w: 1.2, rim: .3 });
  return { TX, Le, J };
}
export function S4(E) {
  const { H } = E;
  const S = stage({ light: [.006, G + .03, -.1], lightR: .1, lightCol: '#dfe3ee', key: .95, keyCol: '#c8d0e6', amb: .36, ambCol: '#7a84a8', floor: .3 });
  const { TX, Le, J } = tentDawn(S);
  const V = veil(.03, .056, '#e4e8f2', .62); V.position.z = -.1135; S.scene.add(V);
  const C = clawd(S.U, { u: .0022, z: -.108 }); S.scene.add(C.g);
  const lea = H.l05 + 1.05;
  return { S, update(t) {
    const d = .5, cx = .0, cy = camY(G, .6, d);
    aim(S.cam, [cx, cy, -.08 + d, cx, cy, -.08], t, { hand: .00025 });
    const up = ss(seg(t, lea - .35, lea + .55));
    Le.set({ x: TX, y: G, a: .05, rot: -.035 * ss(seg(t, lea, lea + .8)) }); flip(Le);
    V.position.set(TX - .001, G + .0635 + up * .05, -.1135); V.material.opacity = V.userData.op * (1 - up); V.visible = up < .99;
    J.set({ x: -.04, y: G - .006, a: lerp(1.0, .08, ss(seg(t, E.T0 + .2, lea + .6))) });
    const lk = ss(seg(t, lea, lea + .3));
    C.set({ x: .05, y: G, look: lerp(-.7, .9, lk), tuck: .45 * lk, blink: blinkAt(t, 2.8, .3), k: .9 });
    const lit = ss(seg(t, E.T0, E.T0 + .9));
    setL(S, TX, G + .03, lerp(.05, .11, lit), lerp(.4, 1.05, lit)); S.amb.intensity = lerp(.12, .36, lit);
    const rf = ss(seg(t, lea - .15, lea + .35)); this._f = lerp(fsOf(S, -.052), fsOf(S, -.115), rf); this._lit = lit;
  }, post() { return { focus: this._f, aper: 9, maxCoc: 9, bloom: blo(.4, 1.0) }; }, grade() { return { vig: .5, sat: .8, lift: [0, .008, .022], gain: [.97, 1, 1.04], expo: lerp(.4, 1, this._lit) }; } };
}

// S5 another seven, by day (ochre-khaki): wide on Jacob working with his staff and Raquel beside him at the well; crane down to the lip,
// where Clawd lines up a second row of seven on top of the first; on «catorce» he sets his hands either side of both rows.
export function S5(E) {
  const { H } = E;
  const S = stage({ light: [.02, G + .08, -.1], lightR: .24, lightCol: '#fff0d0', key: 1.6, keyCol: '#fff0dc', amb: .5, ambCol: '#b8ac90', floor: .5 });
  haran(S, OCHRE, { sunY: G + .12, sunX: .05, sunR: .009 });
  const J = human(S.U, { h: .066, z: -.096, col: OCHRE.fig, rim: .6, staff: true }); S.scene.add(J.g);
  const R = human(S.U, { h: .06, z: -.098, col: OCHRE.fig, rim: .6, pose: 'woman' }); S.scene.add(R.g);
  const C = clawd(S.U, { u: .003, z: WZ - .0012 }); S.scene.add(C.g);
  const P1 = pebbles(S, 7, 11), P2 = pebbles(S, 7, 40);
  return { S, update(t) {
    const k = eio(seg(t, H.l06 + .6, H.l07 + .6)), d = lerp(.62, .44, k), cx = lerp(.0, .006, k), cy = lerp(camY(G, .6, .62), camY(LIP, .64, .44), k);
    aim(S.cam, [cx, cy, -.08 + d, cx, cy, -.08], t, { hand: .0003 });
    J.set({ x: .056, y: G, a: .5 + bob(t, 1.4, .12) }); flip(J);
    R.set({ x: .022, y: G, a: .1 });
    const u = .003, cxC = -.028, hx = cxC + 8.5 * u, hy = LIP + 6.5 * u, dy = .0042;
    P1.forEach((p, i) => { p.visible = true; p.position.set(rowX(i, .004, .0067), LIP - .0012, PZ); });
    const st = i => H.l07 + .05 + i * .22;
    P2.forEach((p, i) => drop(p, t, st(i), rowX(i, .0072, .0067), LIP - .0012 + dy, hx, hy, .26));
    const placing = t > H.l07 - .2 && t < st(6) + .1, ph = (t - H.l07 + .2) / .22;
    const meas = ss(seg(t, H.catorce - .15, H.catorce + .25));
    C.set({ x: cxC, y: LIP - 2 * u, aR: placing ? lerp(.5, 1.4, Math.max(0, Math.sin(Math.PI * (ph % 1)))) : lerp(.3, 2.0, meas), aL: lerp(.2, 2.0, meas), look: placing ? .8 : lerp(-.3, .7, meas), blink: blinkAt(t, 3.2, .1), k: 1.05 });
    setL(S, .02, G + .08, .24, 1.15);
    this._f = lerp(fsOf(S, -.096), fsOf(S, WZ), k);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 6, bloom: blo(.32, 1.1) }; }, grade() { return { vig: .38, sat: .92 }; } };
}

// the caravan: camels with loads, people on foot, as one moving layer of silhouettes (heads visible); two walking phases swap
function caravan(S, { z = -.13, col = '#2a2218', y = G + .004, s = 1, seed = 3 } = {}) {
  const R = mulberry(seed), items = [];
  for (let i = 0; i < 9; i++) items.push(i % 3 === 1 ? { k: 'c', x: i * .03 * s, h: .028 * s } : { k: 'p', x: i * .03 * s + R() * .006, h: (.03 + R() * .008) * s, w: R() < .5 });
  const g = new THREE.Group(); g.position.z = z; S.scene.add(g);
  const layer = ph => mk(S.U, { w: .36 * s, h: .05 * s, x: .13 * s, y: .02 * s, z: 0, col, trans: .12, ppm: 3200, finish: { rim: .5 }, draw: x => {
    x.translate(-.13 * s, -.02 * s);
    for (const it of items) {
      if (it.k === 'c') { camelDraw(x, it.x, 0, it.h, ph); continue; }
      x.save(); x.translate(it.x, 0); x.scale(it.h, it.h);
      x.beginPath(); x.moveTo(-.16, 0); x.bezierCurveTo(-.19, .3, -.14, .6, -.1, .74); x.lineTo(.08, .74); x.bezierCurveTo(.13, .5, .19, .25, .19, 0); x.closePath(); x.fill();
      x.beginPath(); x.arc(0, .84, .09, 0, 7); x.fill();
      if (it.w) { x.beginPath(); x.moveTo(-.05, .93); x.quadraticCurveTo(-.17, .78, -.18, .5); x.lineTo(-.1, .7); x.closePath(); x.fill(); }
      x.restore();
    }
  } });
  const a = layer(0), b = layer(Math.PI); g.add(a, b);
  return { g, set(x, t, walk = true) { g.position.x = x; g.position.y = y + (walk ? Math.abs(Math.sin(t * 5)) * .0005 : 0); const on = walk ? Math.sin(t * 5) > 0 : true; a.visible = on; b.visible = !on; } };
}

// S6 twenty years from home (sunset): close on Clawd's hands adding the last six; the twenty go into a cloth bag; pull-out to the caravan
// setting off to the right behind; Clawd shoulders the bag and starts after it.
export function S6(E) {
  const { H } = E;
  const S = stage({ light: [.04, G + .05, -.1], lightR: .24, lightCol: '#ffd9a0', key: 1.5, keyCol: '#ffe6c8', amb: .46, ambCol: '#b09478', floor: .46 });
  haran(S, DUSKO, { sunY: G + .035, sunX: .06, sunR: .012 });
  const K = caravan(S, { z: -.135, col: DUSKO.fig, y: G + .005 });
  const C = clawd(S.U, { u: .003, z: WZ - .0012 }); S.scene.add(C.g);
  const P = pebbles(S, 20, 11); const B = bag(S.U, { s: .017, z: PZ + .0002 }); S.add(B);
  const v = .009, t0 = H.l09;
  return { S, update(t) {
    const k = eio(seg(t, E.T0 + .1, E.T0 + E.dur + .5)), d = lerp(.44, .62, k), cx = lerp(-.006, .0, k), cy = lerp(camY(LIP, .62, .44), camY(G, .62, .62), k);
    aim(S.cam, [cx, cy, -.08 + d, cx, cy, -.08], t, { hand: .0003 });
    K.set(-.06 + (t - E.T0) * v, t);
    const u = .003, walk = ss(seg(t, H.l09 + 1.3, H.l09 + 1.6)), cxC = -.026 + Math.max(0, t - (H.l09 + 1.3)) * .022;
    const hx = cxC + 8.5 * u, hy = LIP + 6.5 * u, bx = -.026 + 11.5 * u;
    const into = i => t0 + .78 + (19 - i) * .022, bagOn = ss(seg(t, t0 + .62, t0 + .8));
    P.forEach((p, i) => {
      const r = Math.floor(i / 7), j = i % 7, x = rowX(j, r === 1 ? .0072 : .004, .0067), y = LIP - .0012 + r * .0042;
      if (i < 14) { p.visible = true; p.position.set(x, y, PZ); } else drop(p, t, t0 + .06 + (i - 14) * .1, x, y, hx, hy, .2);
      const q = seg(t, into(i), into(i) + .2); if (q > 0) { p.position.set(lerp(x, bx, q), lerp(y, LIP + .016, q) + Math.sin(Math.PI * q) * .008, PZ); p.visible = q < 1; }
    });
    B.visible = bagOn > .01; B.scale.setScalar(.4 + .6 * bagOn);
    const carry = ss(seg(t, H.l09 + 1.15, H.l09 + 1.35));
    B.position.set(lerp(bx, cxC + 9 * u, carry), lerp(LIP - .0012, LIP + 3 * u, carry), PZ + .0002);
    const adding = t < t0 + .7, ph = (t - t0) / .1;
    C.set({ x: cxC, y: LIP - 2 * u + (walk > .5 ? Math.abs(Math.sin(t * 9)) * .0012 : 0), aR: adding ? lerp(.5, 1.4, Math.max(0, Math.sin(Math.PI * (ph % 1)))) : lerp(1.2, 1.6, carry), aL: .3, walk: t * 12, stride: .35 * walk, look: lerp(.8, 1, walk), blink: blinkAt(t, 3, .2), k: 1.05 });
    setL(S, .06, G + .035, .22, 1.1);
    this._f = lerp(fsOf(S, WZ), fsOf(S, -.1), k * .6);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 6, bloom: blo(.36, 1.05) }; }, grade() { return { vig: .42 }; } };
}

// —— the ford of the Jabbok: sky, far crests, the two walls of the gorge, the far bank, the river (an emissive ribbon), the near bank, the rocks in front ——
const NIGHTJ = { sky: [[.3, '#05040c'], [.12, '#0e0b20'], [.03, '#231c44'], [-.03, '#382e60']], crests: '#16122c', walls: '#0f0c20', far: '#141028', river: '#6a74a8', near: '#0c0a1a', rock: '#08070e', front: '#050409', fig: '#030207' };
const DAWNJ = { crests: '#ffe9c0', walls: '#d9b27a', far: '#9a7448', river: '#ffe7b0', near: '#7a5a34', rock: '#2a1a0c', front: '#1e1408', fig: '#120b05' };
const GOLDJ = { sky: [[.3, '#c8a888'], [.12, '#f0cf9e'], [.03, '#ffe2b0'], [-.03, '#ffe9bd']], crests: '#e2bf7e', walls: '#c49660', far: '#a07a48', river: '#ffd98e', near: '#8c6a3a', rock: '#3a2812', front: '#21170a', fig: '#1c1208' };
const RIVER = G + .011;
function jaboc(S, P, o = {}) {
  const sk = sky(S, { ys: P.sky || NIGHTJ.sky, h: 1.3, y: .15, stars: o.stars ?? 0, starMinY: .0, seed: 9 });
  const crests = mount(S, -.205, P.crests, G + .02, [[-.25, .06, .1], [-.1, .035, .07], [.12, .04, .08], [.28, .07, .12]], .4);
  const gap = o.gap ?? .045;
  const wall = s => lay(S, { w: .6, h: .7, x: s * .3, y: .1, z: -.16, col: P.walls, trans: .25, ppm: 1500, finish: { rim: .5 }, draw: x => {
    x.translate(-s * .3, -.1); const R = mulberry(s > 0 ? 3 : 8); x.beginPath(); x.moveTo(s * .6, G - .1); x.lineTo(s * gap, G - .1);
    for (let yy = G - .1; yy < .45; yy += .012) x.lineTo(s * (gap + Math.max(0, yy - G) * .32 + (R() - .5) * .008), yy);
    x.lineTo(s * .6, .45); x.closePath(); x.fill();
  } });
  const wL = wall(-1), wR = wall(1);
  const far = ground(S, -.14, P.far, RIVER + .006, .004, .14, 3.1, .15, { w: 1.4, peak: 2 });
  const rs = x => { x.beginPath(); x.moveTo(-.7, -.015); for (let u = -.7; u <= .7; u += .004) x.lineTo(u, .0095 + .0008 * Math.sin(u * 90) + .0005 * Math.sin(u * 230)); x.lineTo(.7, -.015); x.closePath(); x.fill(); };
  const river = lay(S, { w: 1.4, h: .03, y: RIVER - .01, z: -.125, col: P.river, trans: .45, shadow: false, ppm: 1800, finish: { rim: .4 }, draw: rs,
    glowDraw: x => { x.fillStyle = 'rgba(255,255,255,.55)'; rs(x); const Q = mulberry(2); x.fillStyle = '#fff'; for (let i = 0; i < 70; i++) { const px = -.7 + Q() * 1.4, py = -.004 + Q() * .012; x.beginPath(); x.ellipse(px, py, .004 + Q() * .012, .0005, 0, 0, TAU); x.fill(); } }, glow: o.rglow ?? .35, glowCol: P.river, glowRes: .5 });
  const near = ground(S, -.105, P.near, G - .002, .003, .16, 1.1, .08, { w: 1.4, peak: 2 });
  const rx = o.rx ?? -.045;
  const rock = lay(S, { w: .06, h: .04, x: rx, y: G - .01, z: -.064, col: P.rock, trans: .04, finish: { rim: .5 }, draw: x => { x.beginPath(); x.moveTo(-.026, -.02); x.quadraticCurveTo(-.026, .007, -.012, .0095); x.quadraticCurveTo(.004, .013, .02, .006); x.quadraticCurveTo(.028, .0, .028, -.02); x.closePath(); x.fill(); } });
  const front = ground(S, -.048, P.front, G - .032, .006, .13, .5, .02, { w: 1.2, rim: .3, peak: 2 });
  const L = { crests, walls: [wL, wR], far, river, near, rock, front };
  const tintTo = (Pa, Pb, p) => { for (const k of ['crests', 'far', 'river', 'near', 'rock', 'front']) tint(L[k], mixc(Pa[k], Pb[k], p)); for (const w of L.walls) tint(w, mixc(Pa.walls, Pb.walls, p)); };
  return { sky: sk, L, tintTo, rockTop: G - .0005 };
}

// S7 the ford of the Jabbok at night, the darkest of the film: tilt down from the stars to the river; the caravan crosses and is lost to the left;
// Jacob stays alone on the bank. Clawd arrives with his bag at a rock on the left and sits.
export function S7(E) {
  const { H } = E;
  const S = stage({ light: [0, RIVER, -.1], lightR: .18, lightCol: '#8f9ac8', key: .85, keyCol: '#a8a0d8', amb: .26, ambCol: '#4e4890', floor: .2 });
  const Jb = jaboc(S, NIGHTJ, { stars: 300, rx: -.034 });
  const K = caravan(S, { z: -.128, col: '#0c0a18', y: RIVER - .004, s: .8, seed: 6 }); K.g.scale.x = -1;
  const J = human(S.U, { h: .064, z: -.095, col: NIGHTJ.fig, rim: .5 }); S.scene.add(J.g);
  const C = clawd(S.U, { u: .0022, z: -.0645 }); S.scene.add(C.g);
  const B = bag(S.U, { s: .013, z: -.0635 }); S.add(B);
  return { S, update(t) {
    const d = .58, k = eio(seg(t, E.T0, E.T0 + .8)), cy = camY(G, .62, d), ly = lerp(cy + .03, cy, k);
    aim(S.cam, [0, cy, -.08 + d, 0, ly, -.08], t, { hand: .0002 });
    K.set(lerp(.11, -.06, seg(t, E.T0, E.T0 + E.dur)), t);
    J.set({ x: .018, y: G, a: .1 }); flip(J);
    const u = .0022, sit = ss(seg(t, H.l10 + .9, H.l10 + 1.3)), arrive = eo(seg(t, E.T0 + .2, H.l10 + .9));
    const x = lerp(-.05, -.034, arrive);
    C.set({ x, y: Jb.rockTop + lerp(0, -1.4 * u, sit) + (arrive < 1 ? Math.abs(Math.sin(t * 9)) * .001 : 0), walk: t * 11, stride: .35 * (1 - sit), look: lerp(1, .6, sit), tuck: .2 * sit, blink: blinkAt(t, 3.4, .4), k: .9, aL: .2, aR: .5 });
    B.position.set(x + 9.8 * u, Jb.rockTop - .001, -.0635);
    setL(S, 0, RIVER, .18, .9);
    this._f = fsOf(S, -.095);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(.4, 1.0) }; }, grade() { return { vig: .55, sat: .95 }; } };
}

// the two who struggle: Jacob (black) and a man of light (white-gold, no face, no wings, casts no shadow); `touch` brings his arm down to the hip
function wrestlers(S, P, o = {}) {
  const J = human(S.U, { h: .07, z: -.095, col: P.fig, rim: .55, two: true }); S.scene.add(J.g);
  const Jk = human(S.U, { h: .07, z: -.095, col: P.fig, rim: .6, two: true, pose: 'kneel' }); S.scene.add(Jk.g);
  const M = human(S.U, { h: .074, z: -.0955, col: '#fff4dc', trans: .3, rim: 0, two: true, pose: 'light', glow: o.glow ?? 1, glowCol: '#fff4dc' }); S.scene.add(M.g);
  const halo = glowMesh(.08, .12, '#ffdf98'); halo.position.z = -.097; S.scene.add(halo);
  const mats = [M.body, M.arm, M.arm2].map(m => m.material.userData.u);
  return { J, Jk, M, halo, clip(x, y, r) { for (const u of mats) u.uClip.value.set(x, y, r, 1); }, glow(k) { for (const u of mats) u.uGlowLit.value = k; },
    set(t, { x = 0, sway = 1, kneel = 0, touch = 0, gap = .026 }) {
      const s = Math.sin(t * 1.35) * .0035 * sway, r = Math.sin(t * 1.35 + .6) * .045 * sway;
      J.g.visible = kneel < .5; Jk.g.visible = kneel >= .5;
      J.set({ x: x - gap / 2 + s, y: G, rot: -.06 - r, a: 1.3 + Math.sin(t * 1.35) * .1 * sway, a2: 1.15 });
      Jk.set({ x: x - gap / 2 + .004, y: G, rot: -.08, a: 1.95, a2: 1.85 });
      M.set({ x: x + gap / 2 + s, y: G, rot: .04 - r * .8, a: lerp(1.25 - Math.sin(t * 1.35) * .1 * sway, .45, touch), a2: lerp(1.2, 1.6, touch) }); flip(M);
      halo.position.x = x + gap / 2 + s; halo.position.y = G + .04;
    } };
}

// S8 the struggle until dawn: medium, slow push-in that stops; they hold each other by the arms and push and yield in a slow sway, no blows.
// The river brightens a little with each push. Clawd crouches behind his rock: only his eyes show.
export function S8(E) {
  const { H } = E;
  const S = stage({ light: [.01, G + .03, -.1], lightR: .1, lightCol: '#fff4dc', key: .8, keyCol: '#a8a0d8', amb: .24, ambCol: '#4e4890', floor: .18 });
  const Jb = jaboc(S, NIGHTJ, { stars: 300, rx: -.027 });
  const Wr = wrestlers(S, NIGHTJ);
  const C = clawd(S.U, { u: .0019, z: -.0655 }); S.scene.add(C.g);
  return { S, update(t) {
    const k = eio(seg(t, E.T0, H.l12 - .2)), d = lerp(.52, .46, k), cx = .006, cy = camY(G, .6, d);
    aim(S.cam, [cx, cy, -.08 + d, cx, cy, -.08], t, { hand: .0003 });
    Wr.set(t, { x: .018 }); Wr.glow(.95 + .12 * Math.sin(t * 1.35)); Wr.halo.userData.set(.22);
    Jb.L.river.material.userData.u.uGlowLit.value = .8 + .5 * Math.max(0, Math.sin(t * 1.35));
    const u = .0019;
    C.set({ x: -.027, y: Jb.rockTop - 1.4 * u, look: .9, tuck: .2, blink: blinkAt(t, 3.6, .9), k: .75 });
    setL(S, .015, G + .03, .1, .9);
    this._f = fsOf(S, -.095);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(.5, .95) }; }, grade() { return { vig: .58, sat: .95 }; } };
}

// the sheets of night that lift like stage borders (stars / dark cloud / a second cloud / the last dark band), far to near, each a little paler
function nightSheets(S, n = 4) {
  const R = mulberry(12), cols = ['#06050d', '#0c0a1a', '#151230', '#201a40'], out = [];
  for (let i = 0; i < n; i++) {
    const z = -.225 + i * .01, m = lay(S, { w: .9, h: .5, y: .2, z, col: cols[i], trans: .12 + i * .06, ppm: 1400, shadow: false, recv: false, finish: { rim: .55 }, draw: x => {
      x.translate(0, -.2); x.beginPath(); x.moveTo(-.45, .45); x.lineTo(.45, .45); x.lineTo(.45, G + .02 + i * .012);
      for (let u = .45; u >= -.45; u -= .006) x.lineTo(u, G + .015 + i * .014 + Math.sin(u * (40 + i * 13) + i) * .004 + Math.sin(u * 140 + i * 3) * .0015 + (R() - .5) * .001);
      x.closePath(); x.fill();
      if (i === 0) { const Q = mulberry(3); x.globalCompositeOperation = 'destination-out'; for (let s = 0; s < 120; s++) { x.beginPath(); x.arc(-.45 + Q() * .9, G + .04 + Q() * .4, .0004 + Q() * .0008, 0, TAU); x.fill(); } x.globalCompositeOperation = 'source-over'; }
    } });
    out.push(m);
  }
  return out;
}

// S9 «No te dejaré, si no me bendices»: closer; the man of light touches Jacob's hip; Jacob goes down on one knee but holds the arm of light
// with both hands. Silence 2: everything freezes; a very thin line of light opens on the horizon between the walls of the gorge.
export function S9(E) {
  const { H } = E;
  const S = stage({ light: [.01, G + .03, -.1], lightR: .1, lightCol: '#fff4dc', key: .8, keyCol: '#a8a0d8', amb: .24, ambCol: '#4e4890', floor: .18 });
  const Jb = jaboc(S, { ...NIGHTJ, sky: [[.3, '#3a2c4a'], [.1, '#6a5070'], [.0, '#b89aa8'], [-.03, '#e9c9a0']] }, { stars: 0, rx: -.027 });
  const N = nightSheets(S, 2);
  const line = glowMesh(.16, .006, '#ffe7b8', [.5, .5], [.5, .5], 1.6); line.position.set(.0, G + .024, -.215); S.scene.add(line);
  const Wr = wrestlers(S, NIGHTJ);
  const C = clawd(S.U, { u: .0019, z: -.0655 }); S.scene.add(C.g);
  const B = bag(S.U, { s: .011, z: -.0652 }); S.add(B);
  const tk = H.l12 + .15, kn = H.l12 + .45, s2 = H.silencio2;
  return { S, update(t) {
    const tt = Math.min(t, s2), d = .46, cx = .01, cy = camY(G, .6, d) + lerp(-.004, .006, ss(seg(t, kn, s2)));
    aim(S.cam, [cx, cy, -.08 + d, cx, cy, -.08], t, { hand: t > s2 ? 0 : .0003 });
    const touch = ss(seg(tt, tk - .25, tk + .1)), kneel = tt > kn ? 1 : 0;
    Wr.set(tt, { x: .02, sway: 1 - ss(seg(tt, tk - .3, kn)), touch, kneel }); Wr.glow(.95); Wr.halo.userData.set(.22);
    const open = ss(seg(t, s2 + .15, s2 + 1.4));
    line.userData.set(1.2 * open); N[0].position.y = .2 + .05 * ss(seg(t, s2 + .6, s2 + 1.5)); N[1].position.y = .2 + .02 * ss(seg(t, s2 + .9, s2 + 1.6));
    const u = .0019, x = -.027, rise = ss(seg(t, kn + .2, kn + .8));
    C.set({ x, y: Jb.rockTop - lerp(1.6, 1.2, rise) * u, look: .9, blink: t > s2 ? 1 : blinkAt(t, 3.6, .3), k: .75, aL: .5 * rise, aR: .5 * rise });
    B.position.set(x - .002, Jb.rockTop - .0105, -.064);
    setL(S, .02, G + .03, .1, .9 + .2 * open);
    this._f = fsOf(S, -.095);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 5, bloom: blo(.5, .95) }; }, grade() { return { vig: .58, sat: .95 }; } };
}

// S10 the signature shot, «…sino Israel»: low angle, locked; the sheets of night lift one after another (0.4 s apart) and leave the frame at the
// top, each showing a paler, warmer one behind; on «Israel» the gorge walls turn translucent, the rim of the sun appears between them and the
// light passes through the whole stack; the man of light dissolves into the sun. Jacob, kneeling, lifts his head. Clawd, small, back to us, still.
export function climax(S) {
  const Jb = jaboc(S, { ...NIGHTJ, sky: [[.3, '#ffe9c0'], [.1, '#ffe2ae'], [.0, '#ffd28a'], [-.03, '#ffc874']] }, { stars: 0, gap: .05 });
  const N = nightSheets(S, 4);
  const sun = moon({ r: .016, x: .014, y: G + .02, z: -.232, gain: 2.6, core: '#fffdf4', mid: '#fff4dc', edge: '#ffdf98', halo: 9, haloGain: .7 }); S.scene.add(sun);
  const B = burst(.36, .44, '#ffe7b0'); B.position.set(.014, G + .015 + .22, -.2); S.add(B);
  const Wr = wrestlers(S, NIGHTJ);
  return { Jb, N, sun, B, Wr };
}
export function S10(E) {
  const { H } = E;
  const S = stage({ light: [.014, G + .02, -.1], lightR: .12, lightCol: '#ffe7b0', key: .9, keyCol: '#d8c8e8', amb: .26, ambCol: '#5e5498', floor: .2 });
  const X = climax(S);
  const C = clawd(S.U, { u: .0021, z: -.07 }); S.scene.add(C.g); backTo(C, true);
  const lf = i => H.nombre + i * .4, isr = H.israel;
  return { S, update(t) {
    const d = .46, cx = .008, cy = camY(G, .63, d) + .003 * ss(seg(t, isr, E.T0 + E.dur));
    aim(S.cam, [cx, cy, -.08 + d, cx, cy + .006, -.08], t, { hand: .0002 });
    X.N.forEach((m, i) => { const k = ei3(seg(t, lf(i), lf(i) + 1.0)); m.position.y = .2 + k * .55; m.visible = k < .999; });
    const w = ss(seg(t, isr - .5, isr + .6)), rise = eo(seg(t, isr - .4, isr + 1.6));
    X.Jb.tintTo(NIGHTJ, DAWNJ, w * .85 + .15 * ss(seg(t, H.nombre, isr)));
    tint(X.Jb.L.near, mixc(NIGHTJ.near, '#3a2814', w)); tint(X.Jb.L.front, mixc(NIGHTJ.front, '#120c06', w)); tint(X.Jb.L.rock, mixc(NIGHTJ.rock, '#1a1008', w));
    for (const m of X.Jb.L.walls) m.material.userData.u.uTrans.value = lerp(.03, 1.2, w);
    X.Jb.L.crests.material.userData.u.uTrans.value = lerp(.4, 1.1, w);
    X.Jb.L.river.material.userData.u.uGlowLit.value = lerp(.6, 2.0, w);
    X.sun.position.y = lerp(G - .006, G + .022, rise); setMoon(X.sun, lerp(.2, 1, rise));
    X.B.userData.set(lerp(0, 1.0, ss(seg(t, isr - .1, isr + .35))) * lerp(1, .55, ss(seg(t, isr + .5, isr + 1.6))));
    X.Wr.set(t, { x: .02, sway: 0, kneel: 1, touch: 0 }); X.Wr.Jk.g.rotation.z = lerp(-.12, .04, ss(seg(t, isr - .2, isr + .6)));
    X.Wr.glow(lerp(.95, 2.2, w)); X.Wr.halo.userData.set(lerp(.22, .6, w));
    X.Wr.clip(.033, G + .02, lerp(0, .12, ss(seg(t, isr + .1, isr + 1.3)))); X.Wr.M.g.visible = t < isr + 1.3;
    C.set({ x: -.023, y: G - .003, look: 0, k: lerp(1, 1.35, w), aL: 0, aR: 0 });
    setL(S, .014, G + .02, lerp(.08, .26, w), lerp(.8, 1.7, w)); S.key.intensity = lerp(.9, 1.4, w); S.key.color.copy(col3('#d8c8e8').lerp(col3('#ffe0b0'), w)); S.amb.intensity = lerp(.26, .4, w);
    this._w = w; this._f = fsOf(S, -.095);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(lerp(.45, .55, this._w), lerp(1.0, .95, this._w)) }; }, grade() { return { vig: lerp(.55, .4, this._w), sat: lerp(.95, 1.06, this._w) }; } };
}

// S11 «Salió el sol. Cojeaba… pero bendecido»: golden morning; tracking beside Jacob, left to right; an uneven step (a short dip every
// other step), calm, his head up. The caravan waits far away on the other bank. Clawd walks behind at a distance, without imitating the limp.
export function S11(E) {
  const { H } = E;
  const S = stage({ light: [.03, G + .04, -.1], lightR: .3, lightCol: '#ffe0a8', key: 1.7, keyCol: '#ffe8c8', amb: .46, ambCol: '#c8a07c', floor: .55 });
  const Jb = jaboc(S, GOLDJ, { gap: .12, rglow: 1.6 });
  for (const m of Jb.L.walls) m.material.userData.u.uTrans.value = .8;
  const sun = moon({ r: .014, x: .06, y: G + .07, z: -.232, gain: 2.4, core: '#fffdf4', mid: '#fff0cc', edge: '#ffd98e', halo: 9, haloGain: .55 }); S.scene.add(sun);
  const K = caravan(S, { z: -.142, col: '#5a4226', y: RIVER + .0065, s: .7, seed: 4 });
  const J = human(S.U, { h: .066, z: -.095, col: GOLDJ.fig, rim: .8 }); S.scene.add(J.g);
  const C = clawd(S.U, { u: .0021, z: -.088 }); S.scene.add(C.g);
  const v = .011;
  return { S, update(t) {
    const tl = t - E.T0, d = .52, cx = -.01 + v * tl, cy = camY(G, .62, d);
    aim(S.cam, [cx, cy, -.08 + d, cx, cy, -.08], t, { hand: .0003 });
    K.set(.07, t, false);
    const p = t * 6.4, lame = Math.sin(p * .5) > 0 ? Math.abs(Math.sin(p)) : 0;
    J.set({ x: -.006 + v * tl, y: G + Math.abs(Math.sin(p)) * .0008 - lame * .0016, a: Math.sin(p) * .22, rot: -lame * .05 });
    const cw = 1 - ss(seg(t, H.l15, H.l15 + .4)), cxC = -.05 + v * Math.min(tl, H.l15 - E.T0 + .2);
    C.set({ x: cxC, y: G - .0004, walk: t * 11, stride: .33 * cw, look: .9, blink: blinkAt(t, 3, .7), k: 1 });
    setL(S, .06, G + .07, .3, 1.2);
    this._f = fsOf(S, -.095);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 6, bloom: blo(.38, 1.1) }; }, grade() { return { vig: .34, sat: 1.02 }; } };
}

// S12 the twenty pebbles beside the ford, echo of shot 1: Clawd sitting on the left on a rock, the water to the right, the sun low on the horizon
// (now morning). He empties the bag and leaves the twenty in a heap by the water; far away the caravan crosses the hill in gold.
// On the lesson the gold goes up a step; on the question Clawd turns to the camera. Slow pull-out (the inverse of shot 1).
export function S12(E) {
  const { H } = E;
  const S = stage({ light: [.02, G + .045, -.1], lightR: .3, lightCol: '#ffe0a8', key: 1.6, keyCol: '#ffe8c8', amb: .46, ambCol: '#c8a07c', floor: .55 });
  const Jb = jaboc(S, GOLDJ, { gap: .14, rglow: 1.6, rx: -.034 });
  for (const m of Jb.L.walls) m.material.userData.u.uTrans.value = .8;
  const sun = moon({ r: .012, x: .03, y: G + .045, z: -.232, gain: 2.4, core: '#fffdf4', mid: '#fff0cc', edge: '#ffd98e', halo: 9, haloGain: .55 }); S.scene.add(sun);
  const K = caravan(S, { z: -.2, col: '#a07a48', y: G + .034, s: .38, seed: 8 });
  const C = clawd(S.U, { u: .0032, z: -.0646 }); S.scene.add(C.g);
  const Bg = bag(S.U, { s: .016, z: -.0636 }); S.add(Bg);
  const P = []; for (let i = 0; i < 20; i++) { const p = pebble(S.U, { r: .0027, z: -.0632, seed: 60 + i * 5 }); S.add(p); P.push(p); }
  const heap = []; [6, 5, 4, 3, 2].forEach((n, r) => { for (let j = 0; j < n; j++) heap.push([.02 + (j - (n - 1) / 2) * .0058, G - .0025 + r * .0044]); });
  const pour = H.l16 - .35;
  return { S, update(t) {
    const k = eio(seg(t, E.T0, E.T0 + E.dur)), d = lerp(.5, .6, k), cy = camY(G, .62, d);
    aim(S.cam, [0, cy, -.08 + d, 0, cy, -.08], t, { hand: .0003 });
    K.set(-.12 + (t - E.T0) * .006, t);
    const u = .0032, cxC = -.034, tilt = ss(seg(t, pour - .3, pour)) * (1 - ss(seg(t, pour + 1.2, pour + 1.6)));
    Bg.position.set(cxC + 11 * u, Jb.rockTop + 4 * u, -.0636); Bg.rotation.z = -1.9 * tilt;
    const mx = cxC + 12.5 * u, my = Jb.rockTop + 3.2 * u;
    P.forEach((p, i) => { const tl = pour + .05 + i * .05, q = seg(t, tl, tl + .24); p.visible = q > 0; const [hx, hy] = heap[i]; p.position.set(lerp(mx, hx, q), lerp(my, hy, q * q) + Math.sin(Math.PI * q) * .004, -.0632); });
    const turn = ss(seg(t, H.pregunta - .35, H.pregunta + .1));
    C.set({ x: cxC, y: Jb.rockTop - 1.6 * u, look: lerp(lerp(.4, .9, ss(seg(t, pour + 1.3, pour + 1.8))), 0, turn), aR: lerp(.4, 1.3, tilt), aL: .2, tuck: .15, blink: turn > .5 ? blinkAt(t - H.pregunta + .9, 2.4, 0) : blinkAt(t, 3.2, .5), k: 1 });
    const step = ss(seg(t, H.leccion, H.leccion + .8));
    setL(S, .03, G + .045, lerp(.26, .34, step), lerp(1.0, 1.5, step)); setMoon(sun, lerp(.85, 1.1, step)); S.key.intensity = lerp(1.5, 1.9, step);
    this._s = step; this._f = fsOf(S, -.0646);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 6, bloom: blo(.38, 1.1) }; }, grade() { return { vig: .32, expo: lerp(.95, 1.06, this._s) }; } };
}
