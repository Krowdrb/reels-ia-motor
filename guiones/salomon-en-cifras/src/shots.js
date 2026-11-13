// The twelve shots of "Salomón en cifras" (1 Reyes 3–11). Each: { S, update(t), post(), grade() }; t in film seconds.
// God is only ever light. Solomon and everyone else are dark, calm silhouettes; Clawd is the only strong colour.
import * as THREE from 'three';
import { skyPanel, moon, text, burst } from './paper.js';
import { stage, aim } from './stage.js';
import { mulberry, seg, ss, eio, lerp, clamp, vnoise, TAU } from './lib.js';
import { mk, cut, tint, clawd, human, waveFill, scrollRoll, scrollOpen, oilLamp, lyre, fire, smoke, altar, column, temple, palace } from './actors.js';

const blo = (s = .34, th = 1.1) => ({ strength: s, radius: .6, threshold: th });
const lay = (S, o) => S.add(mk(S.U, o));
const col3 = c => new THREE.Color(c);
const mixHex = (a, b, k) => '#' + col3(a).lerp(col3(b), clamp(k)).getHexString();
const setL = (S, x, y, r, lit, c) => { S.U.uLight.value.x = x; S.U.uLight.value.y = y; S.U.uLightR.value = r; S.U.uLit.value = lit; if (c) S.U.uLightCol.value.copy(typeof c === 'string' ? col3(c) : c); };
const bob = (t, f, a, p = 0) => Math.sin(t * f + p) * a;
const fsOf = (S, z) => S.cam.position.z - z;
const blinkAt = (t, ph = 0, per = 3.4) => 1 - .9 * Math.max(0, 1 - Math.abs(((t + ph) % per) - .1) / .1);
// a sky panel that can fade in over another one
const fadeSky = (S, stops, z, o = {}) => { const m = skyPanel({ w: o.w || 1.4, h: o.h || 1.2, y: o.y || 0, z, stops }); m.material.transparent = true; m.material.opacity = 0; m.material.depthWrite = false; S.add(m); return m; };
// a beam of light from above: an additive glow whose origin is the top end (never a figure)
export function beam(S, { x = 0, y = .14, z = -.12, w = .1, h = .28, ang = 0, col = '#fff1c9' } = {}) {
  const g = new THREE.Group(), b = burst(w, h, col); b.position.y = h / 2; g.add(b); g.rotation.z = Math.PI + ang; g.position.set(x, y, z); S.scene.add(g);
  return { g, set: k => b.userData.set(k) };
}

// —— palettes (TREATMENT §5) ——
export const NIGHT = { bg: [[0, '#080d22'], [.5, '#0d1430'], [1, '#0a1026']], far: '#26355e', mid: '#3e4f80', front: '#070a18', scroll: '#d9c9a0' };
export const GOLD = { bg: [[0, '#fff3d0'], [.5, '#f6e6b4'], [1, '#ecd9a0']], far: '#cdb56f', mid: '#7c6b38', front: '#1d180b', scroll: '#f3e6c2' };

// —— the scroll room: back panel, two walls of arched niches with scroll ends behind them, the shelf in front, dark side pillars that can part ——
export function library(S, o = {}) {
  const P = o.pal || NIGHT, W = o.w || .9, cy = .05;
  const back = S.add(skyPanel({ w: 1.4, h: 1.2, z: -.17, stops: P.bg }));
  const ends = (z, r, dx, dy, seed, tr) => lay(S, { w: W, h: .6, y: cy, z, col: P.scroll, trans: tr, shadow: false, ppm: 2200, finish: { rim: .35, under: .35 }, draw: x => {
    const R = mulberry(seed), pts = [];
    for (let yy = -.3; yy < .3; yy += dy) for (let xx = -W / 2; xx < W / 2; xx += dx) pts.push([xx + (R() - .5) * dx * .25, yy + (R() - .5) * dy * .25, r * (.8 + R() * .35)]);
    for (const [a, b, rr] of pts) { x.beginPath(); x.arc(a, b, rr, 0, TAU); x.fill(); }
    cut(x, () => { for (const [a, b, rr] of pts) { x.beginPath(); x.arc(a, b, rr * .22, 0, TAU); x.fill(); } });
  } });
  const wall = (z, col, tr, nw, nh, sx, sy, ox, oy) => lay(S, { w: W, h: .6, y: cy, z, col, trans: tr, ppm: 2200, finish: { rim: .5, under: .45, rimPx: 4 }, draw: x => {
    x.fillRect(-W / 2, -.3, W, .6);
    cut(x, () => { for (let yy = -.3 + oy; yy < .3; yy += sy) for (let xx = -W / 2 + ox; xx < W / 2; xx += sx) { x.beginPath(); x.roundRect(xx - nw / 2, yy - nh / 2, nw, nh, [nw * .5, nw * .5, 0, 0]); x.fill(); } });
  } });
  const endsF = ends(-.146, .0034, .0074, .0071, 3, .85), wallF = wall(-.14, P.far, .55, .024, .024, .032, .034, .01, .012);
  const endsM = ends(-.113, .0052, .0112, .0108, 5, .8), wallM = wall(-.108, P.mid, .3, .04, .036, .058, .056, .02, .03);
  const shelfY = o.shelfY ?? -.045;
  const shelf = lay(S, { w: W, h: .4, y: shelfY - .2, z: -.062, col: P.front, trans: .04, ppm: 2000, finish: { rim: .7, rimPx: 5, under: .3 }, draw: x => { x.fillRect(-W / 2, -.2, W, .4); x.globalCompositeOperation = 'destination-out'; x.fillRect(-W / 2, .1925, W, .0012); } });
  // little piles of rolled scrolls lying on the shelf
  const piles = (o.piles || []).map(px => lay(S, { w: .05, h: .02, x: px, y: shelfY + .0095, z: -.0605, col: P.scroll, trans: .5, shadow: false, ppm: 6000, finish: { rim: .5, under: .45 }, draw: x => {
    const r = .0032; for (const [a, b] of [[-.008, -.0062], [0, -.0062], [.008, -.0062], [-.004, 0], [.004, 0], [0, .0062]]) { x.beginPath(); x.arc(a, b, r, 0, TAU); x.fill(); }
    cut(x, () => { for (const [a, b] of [[-.008, -.0062], [0, -.0062], [.008, -.0062], [-.004, 0], [.004, 0], [0, .0062]]) { x.beginPath(); x.arc(a, b, r * .3, 0, TAU); x.fill(); } });
  } }));
  const pillar = s => mk(S.U, { w: .2, h: .6, x: s * .1, y: cy, z: -.03, col: P.front, trans: .02, ppm: 1800, finish: { rim: .6, rimPx: 5 }, draw: x => {
    x.fillRect(-.1, -.3, .2, .6);
    const e = -s * .1;   // inner edge
    cut(x, () => { for (let i = 0; i < 9; i++) { const yy = -.2 + i * .062; x.beginPath(); x.roundRect(s < 0 ? e - .03 : e + .003, yy, .027, .04, [.0135, .0135, 0, 0]); x.fill(); } });
  } });
  const pL = pillar(-1), pR = pillar(1); S.add(pL, pR);
  const gap = o.gap ?? .07;
  const parts = k => { pL.position.x = -gap - .1 - k; pR.position.x = gap + .1 + k; };
  parts(0);
  const recolor = (A, B, kf, km, kn) => {
    tint(wallF, mixHex(A.far, B.far, kf)); tint(endsF, mixHex(A.scroll, B.scroll, kf)); tint(endsM, mixHex(A.scroll, B.scroll, km)); tint(wallM, mixHex(A.mid, B.mid, km));
    for (const p of piles) tint(p, mixHex(A.scroll, B.scroll, kn));
    const fr = mixHex(A.front, B.front, kn); tint(shelf, fr); tint(pL, fr); tint(pR, fr);
  };
  return { back, endsF, wallF, endsM, wallM, shelf, pL, pR, piles, shelfY, parts, recolor };
}

// —— the hill of Gibeon: sky, far hills, tents, the near slope, a dark foreground ——
export const GIB_NIGHT = { sky: [[0, '#050b1e'], [.55, '#0f1a3e'], [1, '#22305a']], stars: 170, far: '#26355e', mid: '#33457a', near: '#1e2a52', front: '#050912' };
export const GIB_GOLD = { far: '#e6cf9a', mid: '#9a8758', near: '#2a2414', front: '#0e0b06' };
export const GIB_DAWN = { sky: [[0, '#e9c98c'], [.4, '#fff1cf'], [.62, '#ffe2a0'], [1, '#f6c77c']], stars: 0, far: '#ecc87e', mid: '#b49a5e', near: '#8a7446', front: '#1a1408' };
export function gibeon(S, o = {}) {
  const P = o.pal || GIB_NIGHT;
  const sky = S.add(skyPanel({ w: 1.3, h: 1, y: .1, z: -.17, stops: P.sky, stars: P.stars, starMinY: -.05, seed: 9 }));
  const ridge = (z, col, base, amp, len, ph, tr, extra) => lay(S, { w: .9, h: .5, y: -.2, z, col, trans: tr, ppm: 2200, finish: { rim: .5, rimPx: 4 }, draw: x => { x.translate(0, .2); waveFill(x, { x0: -.45, x1: .45, base, amp, len, ph, peak: 1.3 }); if (extra) extra(x); } });
  const far = ridge(-.14, P.far, -.016, .022, .26, 1.2, .7);
  const tents = x => { for (const [cx, w] of [[-.1, .016], [-.075, .012], [.075, .014], [.1, .011], [.125, .015]]) { const b = -.035; x.beginPath(); x.moveTo(cx - w / 2, b - .004); x.lineTo(cx, b + w * .62); x.lineTo(cx + w / 2, b - .004); x.closePath(); x.fill(); } };
  const mid = ridge(-.115, P.mid, -.037, .01, .18, 2.6, .4, tents);
  const near = ridge(-.088, P.near, -.055, .004, .32, .4, .12);
  const front = ridge(-.045, P.front, -.07, .006, .2, 4.2, .03);
  const recolor = (A, B, k) => { tint(far, mixHex(A.far, B.far, k)); tint(mid, mixHex(A.mid, B.mid, k)); tint(near, mixHex(A.near, B.near, k)); tint(front, mixHex(A.front, B.front, k)); };
  return { sky, far, mid, near, front, recolor };
}

// —— S1 the scroll room at night: one oil lamp; Clawd takes a scroll down; the title is a paper strip tied to the camera ——
export function S1(E) {
  const { H } = E;
  const S = stage({ light: [.046, -.015, -.1], lightR: .07, lightCol: '#ffc27a', key: .55, amb: .16, floor: .06, ambCol: '#5a6aa0' });
  const L = library(S, { pal: NIGHT, shelfY: -.042, gap: .062, piles: [-.09, .085] });
  const lamp = oilLamp(S.U, { s: .03, z: -.058 }); lamp.g.position.set(.03, L.shelfY, -.058); S.scene.add(lamp.g);
  const C = clawd(S.U, { u: .0028, z: -.055 }); S.scene.add(C.g);
  const roll = scrollRoll(S.U, { len: .03, r: .0032 }); S.add(roll);
  const title = lay(S, { w: .104, h: .07, y: .088, z: -.025, col: '#e7d4a8', trans: .35, shadow: false, recv: false, finish: { rim: .3, under: .2 }, draw: x => {
    x.beginPath(); x.roundRect(-.051, -.034, .102, .068, .002); x.fill();
    cut(x, () => { text(x, 'SALOMÓN', 0, .0135, .0148, 'Cinzel', { weight: 800, fill: '#000' }); text(x, 'EN CIFRAS', 0, -.0035, .0104, 'Cinzel', { weight: 800, fill: '#000' }); text(x, '1 Reyes 3–11', 0, -.0205, .0092, 'Playfair', { weight: 'italic 500', fill: '#000' }); });
  }, glowDraw: x => { x.fillStyle = '#fff'; x.fillRect(-.053, -.036, .106, .072); }, glow: .55, glowCol: '#e7d4a8', glowRes: .2 });
  const u = .0028, cx = -.016;
  return { S, update(t) {
    const cy = lerp(-.014, .008, eio(seg(t, 0, E.dur + .6))), z = lerp(.5, .48, seg(t, 0, E.dur));
    aim(S.cam, [0, cy, z, 0, cy, -.08], t, { hand: .0004 });
    lamp.set(1, t);
    setL(S, .03 + lamp.tip[0], L.shelfY + lamp.tip[1] + .006, .075 + bob(t, 9, .004), .95 + bob(t, 13, .05));
    const pull = eio(seg(t, .6, 1.7)), lift = eio(seg(t, H.l01b - .1, H.l01b + .5));
    const hx = cx, hy = L.shelfY + 4.2 * u + lift * 1.6 * u;
    roll.position.set(lerp(-.024, hx, pull), lerp(.002, hy, pull), lerp(-.1, -.0532, pull)); roll.rotation.z = lerp(.0, .0, pull);
    C.set({ x: cx, y: L.shelfY, aL: lerp(0, .55, pull) + lift * .25, aR: lerp(0, .55, pull) + lift * .25, look: lerp(-.6, .3, pull), lookY: lift, blink: blinkAt(t, .4), k: 1.05 });
    const tt = t - .25, reveal = ss(seg(tt, 0, .55)) * (1 - ss(seg(t, 4.1, 4.6)));
    const cz = S.cam.position.z + .025, ts = cz / .55; title.scale.setScalar(ts); title.position.x = S.cam.position.x; title.position.y = S.cam.position.y + .4617 * cz / 2 * .6;
    title.material.userData.u.uClip.value.set(title.position.x, title.position.y, .09 * reveal * ts, 0); title.visible = reveal > .002;
    this._f = fsOf(S, -.055);
  }, post() { return { focus: this._f, aper: 9, maxCoc: 7, bloom: blo(.42, 1.0) }; }, grade() { return { vig: .55, sat: 1.05 }; } };
}

// —— S2 Gibeon at night: young Solomon asleep by a low fire; Clawd on a rock beside him ——
export function S2(E) {
  const S = stage({ light: [.03, -.035, -.1], lightR: .1, lightCol: '#ffb070', key: .85, amb: .34, ambCol: '#6a7ab0', floor: .24 });
  gibeon(S, { pal: GIB_NIGHT });
  const F = fire(S.U, { s: .014, z: -.074 }); F.g.position.set(.032, -.054, -.074); S.scene.add(F.g);
  const Sol = human(S.U, { h: .066, z: -.08, pose: 'sit', crown: true, col: '#04070f', rim: .7 }); S.scene.add(Sol.g);
  lay(S, { w: .032, h: .016, x: -.036, y: -.053, z: -.068, col: '#0a1022', trans: .05, draw: x => { x.beginPath(); x.ellipse(0, 0, .014, .008, 0, 0, TAU); x.fill(); } });
  const C = clawd(S.U, { u: .0022, z: -.064 }); S.scene.add(C.g);
  return { S, update(t) {
    const k = eio(seg(t, E.T0, E.T0 + E.dur + .6)), z = lerp(.54, .47, k);
    aim(S.cam, [0, -.004, z, 0, -.004, -.08], t, { hand: .0004 });
    F.set(1, t); setL(S, .032, -.04, .1 + bob(t, 9, .004), 1.05 + bob(t, 13, .06));
    Sol.set({ x: .004, y: -.054, a: .45 + bob(t, .8, .02) });
    C.set({ x: -.036, y: -.045, look: .8, blink: blinkAt(t, .5), k: .9 });
    this._f = fsOf(S, -.072);
  }, post() { return { focus: this._f, aper: 8, maxCoc: 6, bloom: blo(.4, 1.0) }; }, grade() { return { vig: .5 }; } };
}

// —— S3 the dream: light born behind the farthest cloud comes down through the others. Nobody appears. ——
export function S3(E) {
  const { H } = E;
  const S = stage({ light: [0, .1, -.1], lightR: .06, lightCol: '#fff1c9', key: .8, amb: .32, ambCol: '#6a7ab0', floor: .18 });
  const G = gibeon(S, { pal: GIB_NIGHT });
  const cloud = (z, col, yb, seed, tr) => lay(S, { w: .8, h: .2, y: yb + .1, z, col, trans: tr, ppm: 1800, finish: { rim: .6, rimPx: 4 }, draw: x => {
    x.translate(0, -.1); x.fillRect(-.4, .05, .8, .2); const R = mulberry(seed);
    for (let i = 0; i < 46; i++) { x.beginPath(); x.arc((R() - .5) * .8, .05 - R() * .01, .01 + R() * .016, 0, TAU); x.fill(); }
  } });
  const c1 = cloud(-.15, '#2a3a6a', .045, 3, .95), c2 = cloud(-.135, '#1f2c58', .062, 5, .8), c3 = cloud(-.12, '#141d40', .08, 8, .6);
  const wide = beam(S, { x: 0, y: .15, z: -.13, w: .2, h: .3 });
  const rays = [[-.035, .12], [-.014, .05], [.008, -.03], [.03, -.1], [.0, .0]].map(([x, a], i) => beam(S, { x, y: .14, z: -.125 - i * .001, w: .022, h: .27, ang: a }));
  const Sol = human(S.U, { h: .066, z: -.08, pose: 'sit', crown: true, col: '#04070f', rim: .8 }); S.scene.add(Sol.g);
  const F = fire(S.U, { s: .012, z: -.074 }); F.g.position.set(.032, -.054, -.074); S.scene.add(F.g);
  const C = clawd(S.U, { u: .0019, z: -.06 }); S.scene.add(C.g);
  const dream = col3('#fff1c9'), firec = col3('#ffb070');
  return { S, update(t) {
    aim(S.cam, [0, 0, .5, 0, 0, -.08], t, { hand: .0003 });
    const p = ss(seg(t, H.pide - .35, H.pide + .7)), q = ss(seg(t, H.pide + .7, H.l04 + .4));
    wide.set(.25 * p + .3 * q); rays.forEach((r, i) => r.set((.55 * p + .45 * q) * (.75 + .25 * Math.sin(t * 1.3 + i * 1.7))));
    setL(S, 0, .1, lerp(.06, .2, p) + .06 * q, lerp(.6, 1.35, p), firec.clone().lerp(dream, ss(seg(t, E.T0, H.pide))));
    S.U.uFloor.value = lerp(.1, .28, p); S.key.intensity = lerp(.6, 1.1, p); S.key.color.set('#ffffff').lerp(dream, p);
    for (const [c, a] of [[c1, '#2a3a6a'], [c2, '#1f2c58'], [c3, '#141d40']]) tint(c, mixHex(a, '#4a5288', p * .5));
    F.set(lerp(1, .55, p), t);
    Sol.set({ x: .004, y: -.054, a: .45 });
    C.set({ x: -.034, y: -.051, look: .25, lookY: lerp(.3, 1, p), blink: 1, k: lerp(.9, .6, p), tuck: .1 });
    this._p = p; this._f = fsOf(S, -.07);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 6, bloom: blo(.45 + .2 * this._p, .95) }; }, grade() { return { vig: .5, sat: 1.0 }; } };
}

// —— S4 the petition: Solomon kneels, one arm barely raised; light comes down on him; the hill turns from blue to amber ——
export function S4(E) {
  const { H } = E;
  const S = stage({ light: [.018, .06, -.1], lightR: .12, lightCol: '#ffe6b0', key: .9, keyCol: '#ffe8c0', amb: .26, ambCol: '#7a7aa0', floor: .2 });
  const G = gibeon(S, { pal: GIB_NIGHT });
  const warmSky = fadeSky(S, [[0, '#8a7a72'], [.45, '#e8cf98'], [1, '#f2dca8']], -.168, { w: 1.3, h: 1, y: .1 });
  const Sol = human(S.U, { h: .08, z: -.082, pose: 'kneel', crown: true, col: '#05080f', rim: .85, two: true }); S.scene.add(Sol.g);
  const ray = beam(S, { x: .02, y: .15, z: -.1, w: .1, h: .28, col: '#ffe6b0' });
  const C = clawd(S.U, { u: .0026, z: -.056 }); S.scene.add(C.g);
  const cool = col3('#b8c4e8'), gold = col3('#ffe2a8');
  return { S, update(t) {
    const z = lerp(.45, .42, seg(t, E.T0, E.T0 + E.dur));
    aim(S.cam, [-.002, -.006, z, -.002, -.006, -.08], t, { hand: .0004 });
    const w = ss(seg(t, E.T0 + .1, H.l05 + .5));
    G.recolor(GIB_NIGHT, GIB_GOLD, w); warmSky.material.opacity = w;
    ray.set(lerp(.45, 1.0, ss(seg(t, E.T0, H.l05)))); setL(S, .018, .05, lerp(.12, .26, w), lerp(.9, 1.25, w), cool.clone().lerp(gold, w));
    S.U.uFloor.value = lerp(.18, .45, w); S.key.intensity = lerp(.9, 1.4, w); S.amb.intensity = lerp(.26, .4, w); S.amb.color.set('#7a7aa0').lerp(col3('#c0a880'), w);
    Sol.set({ x: .016, y: -.054, a: lerp(.5, .95, ss(seg(t, E.T0 + .1, E.T0 + .9))) });
    C.set({ x: -.03, y: -.052, look: 1, aL: lerp(1.0, 0, ss(seg(t, H.corazon + .3, H.corazon + 1.4))), aR: lerp(1.0, 0, ss(seg(t, H.corazon + .3, H.corazon + 1.4))), blink: blinkAt(t, 1.2), k: .9 });
    const rf = ss(seg(t, H.corazon + .2, H.corazon + 1.2)); this._f = lerp(fsOf(S, -.056), fsOf(S, -.082), rf); this._w = w;
  }, post() { return { focus: this._f, aper: 11, maxCoc: 7, bloom: blo(.42, 1.0) }; }, grade() { return { vig: .48, sat: lerp(1, 1.05, this._w) }; } };
}

// —— S5 proverbs and songs: the scroll room in gold by day; lateral travel; Clawd carries a scroll on his head and stops by a lyre ——
export function S5(E) {
  const { H } = E;
  const S = stage({ light: [0, .05, -.1], lightR: .3, lightCol: '#ffe2a0', key: 1.5, keyCol: '#fff0d0', amb: .45, ambCol: '#c8b080', floor: .55 });
  const L = library(S, { pal: GOLD, shelfY: -.045, gap: .095, piles: [-.13, -.04, .11] });
  const ly = lyre(S.U, { h: .032, z: -.06, col: '#2a2010' }); ly.position.set(.072, L.shelfY + .016, -.0598); ly.rotation.z = .12; S.add(ly);
  const C = clawd(S.U, { u: .0026, z: -.055, glow: .35 }); S.scene.add(C.g);
  const roll = scrollRoll(S.U, { len: .034, r: .0034 }); roll.position.set(0, 12.6 * .0026, .0008); C.g.add(roll);
  const stop = H.l06b + .05;
  const camAt = t => lerp(-.07, .03, eio(seg(t, E.T0 - .2, stop))) + .016 * ss(seg(t, stop, E.T0 + E.dur + .6));
  return { S, update(t) {
    const cx = camAt(t);
    aim(S.cam, [cx, -.009, .5, cx, -.009, -.08], t, { hand: .0004 });
    setL(S, cx, .05, .3, 1.2);
    const walking = t < stop, x = walking ? camAt(t) - .022 : camAt(stop) - .022;
    const ph = t * 10, st = walking ? .35 : .35 * (1 - ss(seg(t, stop, stop + .25)));
    C.set({ x, y: L.shelfY + Math.abs(Math.sin(ph)) * .0008 * st / .35, aL: 2.2, aR: 2.2, walk: ph, stride: st, look: walking ? .6 : 1, blink: blinkAt(t, .9), k: 1 });
    this._f = fsOf(S, -.055);
  }, post() { return { focus: this._f, aper: 8, maxCoc: 6, bloom: blo(.3, 1.15) }; }, grade() { return { vig: .38, gain: [1.03, 1, .93] }; } };
}

// —— S6 the temple going up: columns rise, scaffolding, small workers; seven passes of light (no marks); Clawd pushes a stone up a ramp ——
export function S6(E) {
  const S = stage({ light: [0, .08, -.1], lightR: .3, lightCol: '#ffe2a0', key: 1.6, keyCol: '#fff0d0', amb: .45, ambCol: '#c8b080', floor: .55 });
  S.add(skyPanel({ w: 1.3, h: 1, y: .1, z: -.17, stops: [[0, '#f3d898'], [.5, '#fff1cc'], [1, '#f0d69a']] }));
  const ridge = (z, col, base, amp, len, ph, tr) => lay(S, { w: .9, h: .5, y: -.2, z, col, trans: tr, ppm: 2200, finish: { rim: .5 }, draw: x => { x.translate(0, .2); waveFill(x, { x0: -.45, x1: .45, base, amp, len, ph, peak: 1.3 }); } });
  ridge(-.15, '#e2cd92', -.02, .018, .3, 1, .7);
  const cols = [-.05, -.025, 0, .025, .05].map((cx, i) => { const c = column(S.U, { h: .075, w: .009, z: -.118, col: '#cdb56f', trans: .5 }); c.userData.cx = cx; c.userData.i = i; S.add(c); return c; });
  const scaff = lay(S, { w: .16, h: .1, y: .0, z: -.112, col: '#7c6b38', trans: .1, shadow: true, ppm: 4000, finish: { rim: .4 }, draw: x => {
    for (const px of [-.064, -.0375, -.0125, .0125, .0375, .064]) x.fillRect(px - .0007, -.05, .0014, .09);
    for (const py of [-.02, .012]) x.fillRect(-.068, py, .136, .0018);
    x.lineWidth = .0009; for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(-.064 + i * .0257, -.02); x.lineTo(-.0383 + i * .0257, .012); x.stroke(); }
  } });
  const workers = [[-.045, .012], [.02, .012], [.055, -.02]].map(([wx, wy], i) => { const h = human(S.U, { h: .02, z: -.11, col: '#3a3018', rim: .4 }); h.base = [wx, wy]; S.scene.add(h.g); return h; });
  ridge(-.1, '#a89058', -.04, .003, .4, 2, .25);
  const r0 = [-.1, -.056], r1 = [.08, -.034], slope = (r1[1] - r0[1]) / (r1[0] - r0[0]), rampY = x => r0[1] + (x - r0[0]) * slope;
  lay(S, { w: .5, h: .2, y: -.1, z: -.066, col: '#5a4a24', trans: .08, ppm: 2400, finish: { rim: .6, rimPx: 4 }, draw: x => { x.translate(0, .1); x.beginPath(); x.moveTo(-.25, -.2); x.lineTo(-.25, r0[1] - .006); x.lineTo(r0[0], r0[1]); x.lineTo(r1[0], r1[1]); x.lineTo(r1[0] + .004, r1[1] - .004); x.lineTo(.25, r1[1] - .02); x.lineTo(.25, -.2); x.closePath(); x.fill(); } });
  const block = lay(S, { w: .024, h: .022, z: -.0602, col: '#b8a070', trans: .2, ppm: 7000, finish: { rim: .6, under: .4 }, draw: x => { x.fillRect(-.011, -.01, .022, .02); cut(x, () => x.fillRect(-.011, .001, .022, .0005)); } });
  lay(S, { w: .9, h: .5, y: -.2, z: -.04, col: '#1d180b', trans: .03, ppm: 1800, finish: { rim: .55 }, draw: x => { x.translate(0, .2); waveFill(x, { x0: -.45, x1: .45, base: -.075, amp: .007, len: .22, ph: 3, peak: 1.3 }); } });
  const C = clawd(S.U, { u: .0022, z: -.06, glow: .35 }); S.scene.add(C.g);
  const u = .0022;
  return { S, update(t) {
    const k = seg(t, E.T0, E.T0 + E.dur + .6), cy = lerp(-.008, .0, eio(k)), ly = lerp(-.008, .008, eio(k));
    aim(S.cam, [0, cy, .5, 0, ly, -.08], t, { hand: .0004 });
    // seven passes of the sun as a sweeping light and swinging shadows
    const ph = Math.sin(TAU * 3.5 * k), lx = .12 * ph;
    setL(S, lx, .08, .3, 1.05 + .15 * Math.cos(TAU * 7 * k)); S.key.position.x = lx * 2.2; S.key.intensity = 1.5 + .2 * Math.cos(TAU * 7 * k);
    for (const c of cols) { const r = eio(seg(t, E.T0 - .2 + c.userData.i * .25, E.T0 + 1.2 + c.userData.i * .25)); c.position.set(c.userData.cx, -.04 + .0375 - .075 * (1 - r) - .0005, -.118); }
    workers.forEach((w, i) => w.set({ x: w.base[0], y: w.base[1], a: 1 + Math.sin(t * 5 + i * 2) * .7 }));
    const x = lerp(-.042, -.024, seg(t, E.T0, E.T0 + E.dur + .6));
    const ang = Math.atan(slope);
    C.set({ x, y: rampY(x) + .0012, rot: ang * .4 - .05, aR: 1.25 + bob(t, 3, .08), aL: .9, walk: t * 4, stride: .22, look: 1, k: 1 });
    block.position.set(x + 15.5 * u, rampY(x + 15.5 * u) + .011, -.0602); block.rotation.z = ang;
    this._f = fsOf(S, -.06);
  }, post() { return { focus: this._f, aper: 8, maxCoc: 6, bloom: blo(.3, 1.15) }; }, grade() { return { vig: .38, gain: [1.03, 1, .93] }; } };
}

// —— S7 the palace: dolly out; the temple to one side, the palace wider, its windows lighting one by one. Silence 1 lives here. ——
export function S7(E) {
  const { H } = E;
  const S = stage({ light: [.02, .06, -.1], lightR: .3, lightCol: '#ffd88a', key: 1.4, keyCol: '#ffe8c0', amb: .42, ambCol: '#c8a878', floor: .5 });
  S.add(skyPanel({ w: 1.3, h: 1, y: .1, z: -.17, stops: [[0, '#eecb84'], [.5, '#fbe6b4'], [1, '#f3cf86']] }));
  const sun = moon({ r: .016, x: -.025, y: .07, z: -.16, gain: 1.9, core: '#fffbe8', mid: '#fff0c0', edge: '#ffd27a', halo: 7, haloGain: .45 }); S.scene.add(sun);
  const ridge = (z, col, base, amp, len, ph, tr) => lay(S, { w: .9, h: .5, y: -.2, z, col, trans: tr, ppm: 2200, finish: { rim: .5 }, draw: x => { x.translate(0, .2); waveFill(x, { x0: -.45, x1: .45, base, amp, len, ph, peak: 1.3 }); } });
  ridge(-.15, '#e0c68a', -.022, .016, .3, 2, .7);
  const T = temple(S.U, { w: .045, z: -.12, col: '#cdb56f', glow: 1.1 }); T.position.x = -.06; T.position.y += -.037; S.add(T);
  ridge(-.11, '#a68e58', -.037, .002, .4, 1, .3);
  const P = palace(S.U, { w: .1, z: -.1, col: '#7c6b38' }); P.g.position.set(.03, -.035, -.1); S.scene.add(P.g);
  lay(S, { w: .07, h: .05, x: .03, y: -.06, z: -.07, col: '#4a3c1c', trans: .1, ppm: 5000, finish: { rim: .6, under: .3 }, draw: x => { for (let i = 0; i < 6; i++) { const w = .05 - i * .004; x.fillRect(-w / 2, -.025 + i * .0042, w, .0044); } } });
  lay(S, { w: .9, h: .5, y: -.2, z: -.045, col: '#1d180b', trans: .03, ppm: 1800, finish: { rim: .55 }, draw: x => { x.translate(0, .2); waveFill(x, { x0: -.45, x1: .45, base: -.077, amp: .006, len: .2, ph: 1, peak: 1.3 }); } });
  const C = clawd(S.U, { u: .0016, z: -.066, glow: .4 }); S.scene.add(C.g);
  const order = [7, 2, 10, 5, 0, 8, 3, 11, 6, 1, 9, 4];
  return { S, update(t) {
    const k = eio(seg(t, E.T0, H.s1 + .2)), z = lerp(.42, .6, k), cx = lerp(.022, -.008, k), cy = lerp(-.004, 0, k);
    aim(S.cam, [cx, cy, z, cx, cy, -.08], t, { hand: .0003 });
    const flick = 1 - .85 * Math.max(0, 1 - Math.abs(t - (H.s1 + .55)) / .07) - .6 * Math.max(0, 1 - Math.abs(t - (H.s1 + .72)) / .05);
    order.forEach((wi, j) => { const on = H.l08 + .05 + j * .13; P.wins[wi].material.emissiveIntensity = 2.2 * ss(seg(t, on, on + .12)) * flick; });
    P.door.material.emissiveIntensity = 1.6 * ss(seg(t, H.l08 + 1.6, H.l08 + 1.9)) * flick;
    setL(S, .02, .06, .3, 1.15);
    const turn = ss(seg(t, H.l08 + .9, H.l08 + 1.5));
    C.set({ x: .03, y: -.035, look: lerp(.4, -1, turn), blink: t > H.s1 ? blinkAt(t, .2, 1.6) : blinkAt(t, .7), k: 1.1 });
    this._f = fsOf(S, -.07);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 6, bloom: blo(.34, 1.1) }; }, grade() { return { vig: .38, gain: [1.03, 1, .93] }; } };
}

// —— S8 the terrace at dusk: older Solomon stands, leaning forward; far colonnade with small soft figures; the sky goes from gold to violet grey ——
export function S8(E) {
  const S = stage({ light: [.04, .03, -.1], lightR: .25, lightCol: '#ffc890', key: 1.0, keyCol: '#ffd8b0', amb: .3, ambCol: '#8a7a9a', floor: .35 });
  S.add(skyPanel({ w: 1.3, h: 1, y: .1, z: -.17, stops: [[0, '#2e2844'], [.5, '#5e5274'], [1, '#8a7a92']] }));
  const gold = fadeSky(S, [[0, '#d8a86a'], [.5, '#f0cc8c'], [1, '#f3c27e']], -.168, { w: 1.3, h: 1, y: .1 }); gold.material.opacity = 1;
  const colon = lay(S, { w: .5, h: .07, y: -.03, z: -.13, col: '#a08860', trans: .3, ppm: 3600, finish: { rim: .4, rimPx: 2 }, draw: x => {
    x.fillRect(-.25, -.035, .5, .043); x.fillRect(-.25, .026, .5, .003); x.fillRect(-.25, .029, .5, .0015);
    for (let i = 0; i < 70; i++) x.fillRect(-.25 + i * .0072 - .0006, .008, .0012, .019);
  } });
  const far = [[.022, .0095], [.03, .009], [.045, .0098], [.066, .0092]].map(([fx, fh]) => { const h = human(S.U, { h: fh, z: -.128, col: '#4a3c4a', rim: .15 }); S.scene.add(h.g); h.set({ x: fx, y: -.0222, a: .2 }); return h; });
  const roofs = lay(S, { w: .6, h: .06, y: -.045, z: -.11, col: '#6a5440', trans: .2, ppm: 2600, finish: { rim: .45 }, draw: x => { const R = mulberry(4); for (let r = 0; r < 3; r++) for (let i = 0; i < 46; i++) { const w = .008 + R() * .012; x.fillRect(-.3 + i * .013 + r * .004, -.03 + r * .008, w, .006 + R() * .008); } } });
  const floor = lay(S, { w: .6, h: .2, y: -.17, z: -.09, col: '#2a2018', trans: .05, ppm: 2000, finish: { rim: .5 }, draw: x => x.fillRect(-.3, -.1, .6, .2) });
  const Sol = human(S.U, { h: .085, z: -.08, col: '#0a0812', rim: .75, crown: true }); S.scene.add(Sol.g);
  lay(S, { w: .6, h: .2, y: -.158, z: -.052, col: '#0e0b16', trans: .03, ppm: 2200, finish: { rim: .6, rimPx: 5 }, draw: x => { x.fillRect(-.3, -.1, .6, .2); } });
  const C = clawd(S.U, { u: .0022, z: -.048 }); S.scene.add(C.g);
  const warm = col3('#ffc890'), cold = col3('#a898c0');
  return { S, update(t) {
    const k = eio(seg(t, E.T0, E.T0 + E.dur)), z = lerp(.43, .5, k);
    aim(S.cam, [0, -.016, z, 0, -.016, -.08], t, { hand: .0003 });
    const d = ss(seg(t, E.T0 + .2, E.T0 + E.dur + .3));
    gold.material.opacity = 1 - d;
    tint(colon, mixHex('#c8a878', '#6e6082', d)); tint(roofs, mixHex('#6a5440', '#33294a', d)); tint(floor, mixHex('#2a2018', '#1a1426', d));
    for (const f of far) tint(f.body, mixHex('#4a3c4a', '#3a3048', d)), tint(f.arm, mixHex('#4a3c4a', '#3a3048', d));
    setL(S, .04, .03, .25, lerp(1.1, .75, d), warm.clone().lerp(cold, d)); S.key.intensity = lerp(1.0, .7, d); S.U.uFloor.value = lerp(.35, .22, d);
    Sol.set({ x: .016, y: -.068, rot: -.06, a: .12 + bob(t, .6, .02) });
    C.set({ x: -.03, y: -.0575, look: .7, blink: blinkAt(t, 1.1), k: lerp(.95, .8, d) });
    this._d = d; this._f = fsOf(S, -.08);
  }, post() { return { focus: this._f, aper: 12, maxCoc: 8, bloom: blo(.3, 1.15) }; }, grade() { return { vig: .48, sat: lerp(1, .85, this._d) }; } };
}

// —— S9 the altars facing Jerusalem: stepped altars light one by one, low dull fires and grey smoke; far off, the temple's gold fades. No idols. ——
export function S9(E) {
  const { H } = E;
  const S = stage({ light: [0, -.02, -.1], lightR: .2, lightCol: '#c8a070', key: .85, keyCol: '#c8b8d8', amb: .3, ambCol: '#6a5a80', floor: .25 });
  S.add(skyPanel({ w: 1.3, h: 1, y: .1, z: -.17, stops: [[0, '#241e34'], [.5, '#4e4262'], [1, '#7e6e88']] }));
  const ridge = (z, col, base, amp, len, ph, tr, extra) => lay(S, { w: .9, h: .5, y: -.2, z, col, trans: tr, ppm: 2200, finish: { rim: .5 }, draw: x => { x.translate(0, .2); waveFill(x, { x0: -.45, x1: .45, base, amp, len, ph, peak: 1.3 }); if (extra) extra(x); } });
  ridge(-.15, '#6a5c78', -.012, .006, .3, 1, .6, x => { const R = mulberry(12); for (let i = 0; i < 30; i++) { const bx = -.1 + i * .0075, w = .005 + R() * .004; x.fillRect(bx, -.012, w, .006 + R() * .01); } });
  const T = temple(S.U, { w: .028, z: -.148, col: '#7a6a50', glow: 1.2, glowCol: '#ffcf70' }); T.position.x = .0; T.position.y += -.007; S.add(T);
  ridge(-.115, '#3a3050', -.042, .016, .26, 2.2, .3);
  ridge(-.095, '#1e1830', -.059, .003, .35, .8, .1);
  const AX = [-.105, -.068, -.03, .085], u = .0019;
  const alt = AX.map(ax => { const a = altar(S.U, { w: .026, z: -.09, col: '#241c30' }); a.position.x = ax; a.position.y += -.058; S.add(a); return a; });
  const top = -.058 + .026 * .3264;
  const fires = AX.map(ax => { const f = fire(S.U, { s: .0085, z: -.0895, col: '#b8905a', glow: 1.3 }); f.g.position.set(ax, top, -.0895); S.scene.add(f.g); return f; });
  const smokes = AX.map((ax, i) => { const m = smoke(S.U, { h: .07, w: .013, z: -.0915, seed: i + 2 }); m.position.set(ax, top, -.0915); S.add(m); return m; });
  const Sol = human(S.U, { h: .078, z: -.085, col: '#0a0812', rim: .6, crown: true }); S.scene.add(Sol.g);
  lay(S, { w: .9, h: .5, y: -.2, z: -.045, col: '#0e0b16', trans: .03, ppm: 1800, finish: { rim: .55 }, draw: x => { x.translate(0, .2); waveFill(x, { x0: -.45, x1: .45, base: -.077, amp: .006, len: .2, ph: 2, peak: 1.3 }); } });
  const C = clawd(S.U, { u, z: -.06, glow: .5 }); S.scene.add(C.g);
  const onAt = [E.T0 + .3, H.l10b + 1.2, H.l10b + 2.3, H.altares + .4];
  const walkEnd = H.l12 - 1.3;
  return { S, update(t) {
    const k = eio(seg(t, E.T0, H.l12 - .3)), cx = lerp(-.05, .045, k);
    aim(S.cam, [cx, -.012, .5, cx, -.012, -.08], t, { hand: .0004 });
    fires.forEach((f, i) => { const on = ss(seg(t, onAt[i], onAt[i] + .5)); f.set(on, t); const sm = seg(t, onAt[i] + .2, onAt[i] + 3.5); smokes[i].visible = sm > 0; smokes[i].scale.set(.6 + .6 * sm, Math.max(.01, sm), 1); smokes[i].position.x = AX[i] + bob(t, .7, .002, i); });
    T.material.emissiveIntensity = lerp(1.2, .18, ss(seg(t, E.T0, E.T0 + E.dur)));
    setL(S, cx, -.03, .22, .85);
    const w = seg(t, E.T0, walkEnd), walking = w < 1, x = lerp(-.082, .004, eio(w));
    const turn = ss(seg(t, walkEnd + .2, walkEnd + .9));
    C.set({ x, y: -.06, walk: t * 8, stride: walking ? .3 * Math.min(1, w * 6) : 0, aL: lerp(.35, 0, ss(seg(t, E.T0, E.T0 + 1.5))), aR: lerp(.35, 0, ss(seg(t, E.T0, E.T0 + 1.5))), look: lerp(.6, -1, turn), blink: blinkAt(t, .3), k: lerp(.9, .7, turn) });
    Sol.set({ x: .058, y: -.059, rot: -.08, a: .08 });
    this._f = fsOf(S, -.07);
  }, post() { return { focus: this._f, aper: 8, maxCoc: 6, bloom: blo(.32, 1.05) }; }, grade() { return { vig: .52, sat: .82, gain: [1, .98, 1.02] }; } };
}

// —— S10 the lamp goes out: the scroll room of S1 at night, close; the flame flickers and dies; Clawd's own glow drops with it. Silence 2. ——
export function S10(E) {
  const { H } = E;
  const S = stage({ light: [.04, -.02, -.1], lightR: .06, lightCol: '#ffc27a', key: .5, amb: .14, floor: .05, ambCol: '#5a6aa0' });
  const L = library(S, { pal: NIGHT, shelfY: -.04, gap: .052 });
  const lamp = oilLamp(S.U, { s: .032, z: -.058 }); lamp.g.position.set(.026, L.shelfY, -.058); S.scene.add(lamp.g);
  const C = clawd(S.U, { u: .003, z: -.055 }); S.scene.add(C.g);
  const puff = smoke(S.U, { h: .03, w: .005, z: -.0585, col: '#8a8aa0', seed: 4 }); S.add(puff);
  const tip = [.026 + lamp.tip[0], L.shelfY + lamp.tip[1]];
  const out = H.s2 - .25;
  return { S, update(t) {
    const z = lerp(.37, .34, ss(seg(t, E.T0, E.T0 + E.dur)));
    aim(S.cam, [-.002, -.008, z, -.002, -.008, -.08], t, { hand: .0003 });
    const f0 = H.apaga + .9, fl = t < f0 ? 1 : t < out ? .5 + .5 * vnoise(t * 14) * (1 - .5 * seg(t, f0, out)) : lerp(.35, 0, seg(t, out, out + .2));
    lamp.set(fl, t);
    const dim = ss(seg(t, f0, out + .3));
    setL(S, tip[0], tip[1] + .008, .07 * (.4 + .6 * fl) + .005, .95 * fl + .03);
    S.key.intensity = .5 * (.12 + .88 * (1 - dim)); S.amb.intensity = .14 * (.25 + .75 * (1 - dim)); S.U.uFloor.value = .05 * (1 - dim) + .01;
    C.set({ x: -.02, y: L.shelfY, look: lerp(.9, .5, dim), blink: lerp(1, .6, dim) * blinkAt(t, .8), k: lerp(1, .35, dim), tuck: .25 * dim });
    const sm = seg(t, out + .1, out + 1.4); puff.visible = sm > 0 && sm < 1; puff.position.set(tip[0] + bob(t, 2, .001), tip[1] - .004 + sm * .006, -.0585); puff.scale.set(.6 + sm, Math.max(.01, sm), 1); tint(puff, mixHex('#8a8aa0', '#20243a', sm));
    this._dim = dim; this._f = fsOf(S, -.056);
  }, post() { return { focus: this._f, aper: 9, maxCoc: 7, bloom: blo(.45, .95) }; }, grade() { return { vig: lerp(.55, .7, this._dim), expo: lerp(1, .7, this._dim) }; } };
}

// —— S11 signature shot: Clawd unrolls the scroll; light comes from above; the dark front layers part like curtains; light shines through the scroll ——
export function S11(E) {
  const { H } = E;
  const S = stage({ light: [0, .01, -.1], lightR: .05, lightCol: '#ffd88a', key: .4, keyCol: '#fff0d0', amb: .1, floor: .03, ambCol: '#5a6aa0' });
  const L = library(S, { pal: NIGHT, shelfY: -.045, gap: .046, piles: [-.075, .08] });
  const gold = fadeSky(S, GOLD.bg, -.169);
  const ray = beam(S, { x: 0, y: .16, z: -.09, w: .13, h: .3, col: '#fff1c9' });
  const u = .0034;
  const C = clawd(S.U, { u, z: -.052 }); S.scene.add(C.g);
  const roll = scrollRoll(S.U, { len: .036, r: .0036 }); roll.position.set(0, 3.4 * u, .0012); C.g.add(roll);
  const open = scrollOpen(S.U, { w: .054, h: .0135 }); open.position.set(0, 3.3 * u, .0014); C.g.add(open);
  const nightC = col3('#8fa0d0'), goldC = col3('#ffd88a');
  return { S, update(t) {
    const g = H.guarda;
    const z = lerp(.5, .41, eio(seg(t, E.T0, H.l14)));
    aim(S.cam, [0, -.009, z, 0, -.009, -.08], t, { hand: .0003 });
    const un = eio(seg(t, H.l13 + .15, H.l13 + 1.0));
    roll.visible = un < .3; open.visible = un > .02; open.scale.x = lerp(.1, 1, un);
    const light = ss(seg(t, g - .55, g + .6));
    ray.set(1.15 * light);
    L.parts(eio(seg(t, g, g + 1.3)) * .11);
    const kf = ss(seg(t, g + .05, g + 1.0)), km = ss(seg(t, g + .4, g + 1.4)), kn = ss(seg(t, g + .8, g + 1.9));
    L.recolor(NIGHT, GOLD, kf, km, kn); gold.material.opacity = kf;
    open.material.emissiveIntensity = lerp(.2, 1.05, light) * (1 + .04 * Math.sin(t * 3));
    setL(S, 0, .01, lerp(.05, .34, km), lerp(.7, 1.25, km), nightC.clone().lerp(goldC, light));
    S.key.intensity = lerp(.4, 1.55, km); S.amb.intensity = lerp(.1, .42, km); S.amb.color.set('#5a6aa0').lerp(col3('#c8b080'), km); S.U.uFloor.value = lerp(.03, .5, km);
    const a = lerp(.35, .78, un);
    const settle = ss(seg(t, H.l14 - .2, H.l14 + .6));
    C.set({ x: 0, y: L.shelfY, aL: a, aR: a, look: 0, lookY: lerp(0, -.7, un) * (1 - settle), blink: blinkAt(t, .2, 2.9), k: lerp(.9, 1.35, light) });
    this._l = light; this._f = fsOf(S, -.052);
  }, post() { return { focus: this._f, aper: 8, maxCoc: 7, bloom: blo(.38 + .12 * this._l, 1.0) }; }, grade() { return { vig: lerp(.55, .32, this._l), sat: 1.04 }; } };
}

// —— S12 Gibeon at dawn: the hill of the dream, golden, no fire and no Solomon. Clawd alone, scroll under his arm, turns to the viewer. ——
export function S12(E) {
  const { H } = E;
  const S = stage({ light: [.03, .0, -.1], lightR: .3, lightCol: '#ffdca0', key: 1.6, keyCol: '#ffe8c8', amb: .45, ambCol: '#c8a48c', floor: .55 });
  const sun = moon({ r: .02, x: .045, y: -.012, z: -.155, gain: 2.3, core: '#fffbe8', mid: '#fff0c0', edge: '#ffd27a', halo: 8, haloGain: .5 }); S.scene.add(sun);
  gibeon(S, { pal: GIB_DAWN });
  const u = .0028;
  const C = clawd(S.U, { u, z: -.062, glow: .35 }); S.scene.add(C.g);
  const roll = scrollRoll(S.U, { len: .026, r: .0032 }); roll.position.set(-8.2 * u, 4 * u, .0009); roll.rotation.z = -.35; C.g.add(roll);
  return { S, update(t) {
    const z = lerp(.43, .5, eio(seg(t, E.T0, E.T0 + 2.4)));
    aim(S.cam, [0, -.006, z, 0, -.006, -.08], t, { hand: .0003 });
    sun.position.y = lerp(-.016, -.004, seg(t, E.T0, E.T0 + E.dur));
    const q = H.pregunta, turn = ss(seg(t, q - .45, q + .05)), open = ss(seg(t, q + .1, q + .7));
    const b = t > q - .2 && t < q + .05 ? .15 : blinkAt(t, .6, 2.7);
    C.set({ x: -.004, y: -.0515, look: lerp(.8, 0, turn), blink: b, aL: .15, aR: open * 1.7 + open * bob(t, 2.2, .06), k: 1 });
    this._f = fsOf(S, -.062);
  }, post() { return { focus: this._f, aper: 9, maxCoc: 7, bloom: blo(.36, 1.15) }; }, grade() { return { vig: .3, gain: [1.03, 1, .94] }; } };
}
