// The eleven shots of «Ester en cifras» (Esther 1:1; 3:13; 4:11-16; 5:1-2). Each: { S, update(t), post(), grade() }; t in film seconds.
// The count goes down (127 → 30 → 3 → one gesture) and the frame closes with it. God is never drawn: the only gold is the sceptre and the light it opens.
// Haman never appears; the decree is a scroll without letters. Clawd is a witness: still and to one side in the fast and in the silent court.
import * as THREE from 'three';
import { skyPanel, moon, setMoon, text, burst } from './paper.js';
import { stage, aim } from './stage.js';
import { mulberry, seg, ss, eio, lerp, clamp, TAU } from './lib.js';
import { mk, cut, tint, clawd, human, ridgeFill, cetro, trono, columnas, portico, puertas, lampara, rollo } from './actors.js';

const blo = (s = .34, th = 1.1) => ({ strength: Math.min(s, .45), radius: .6, threshold: th });
const lay = (S, o) => S.add(mk(S.U, o));
const col3 = c => new THREE.Color(c);
const mixc = (a, b, k) => '#' + col3(a).lerp(col3(b), clamp(k)).getHexString();
const setL = (S, x, y, r, lit, c) => { S.U.uLight.value.x = x; S.U.uLight.value.y = y; S.U.uLightR.value = r; S.U.uLit.value = lit; if (c) S.U.uLightCol.value.copy(typeof c === 'string' ? col3(c) : c); };
const bob = (t, f, a, p = 0) => Math.sin(t * f + p) * a;
const fsOf = (S, z) => S.cam.position.z - z;
const blink = (t, per = 3.3, ph = 0) => 1 - .9 * Math.max(0, 1 - Math.abs(((t + ph) % per) - .1) / .1);
const glowK = (m, k) => { m.material.userData.u.uGlowLit.value = k; };
// half of the visible height / width at depth z; a camera height that puts the line y (at depth z) at fraction f from the bottom of the frame
export const HH = (cz, z) => .4617 * (cz - z) / 2;
export const HW = (cz, z) => .13 * (cz - z);
export const camY = (cz, y, z, f = .34) => y + (1 - 2 * f) * HH(cz, z);
export const G = -.05;

// A flat-topped strip of floor (a slightly uneven edge, never a plain rectangle)
function floorStrip(S, { z, col, top = G, w = 1, x = 0, trans = .08, rim = .35, ppm = 1400, shadow = false }) {
  return lay(S, { w, h: .5, x, y: top - .25, z, col, trans, ppm, shadow, finish: { rim, rimPx: 3 }, draw: c => {
    c.beginPath(); c.moveTo(-w / 2, -.25); for (let u = -w / 2; u <= w / 2 + .001; u += .004) c.lineTo(u, .25 + .0008 * Math.sin(u * 90 + z * 50) + .0004 * Math.sin(u * 310)); c.lineTo(w / 2, -.25); c.closePath(); c.fill();
  } });
}
// The dark front band: follows the camera so the bottom ~25 % stays dark for the subtitles
export function front(S, col, o = {}) {
  const z = o.z ?? -.03, m = floorStrip(S, { z, col, top: 0, w: 1.2, trans: .02, rim: o.rim ?? .25 });
  return { m, follow(f = .26) { const c = S.cam.position; m.position.x = c.x; m.position.y = -.25 + c.y - HH(c.z, z) * (1 - 2 * f); } };
}
// Lit back wall: a paper sheet the backlight shines through
const wall = (S, { z, col, w = 1, h = .7, y = .05, trans = .9, draw }) => lay(S, { w, h, y, z, col, trans, ppm: 1200, shadow: false, finish: { rim: 0, under: 0 }, draw: c => { c.fillRect(-w / 2, -h / 2, w, h); if (draw) draw(c); } });
const skyOf = (S, stops, o = {}) => { const m = skyPanel({ w: o.w || 1.2, h: o.h || .6, x: o.x || 0, y: o.y ?? .1, z: o.z ?? -.16, stops, gain: o.gain ?? 1 }); S.add(m); return m; };

// —— palettes (TREATMENT §2) ——
export const PAL = {
  dusk: { sky: [[0, '#6f5e88'], [.42, '#a88aa6'], [.62, '#e9c9a0'], [1, '#e9c9a0']], ridges: ['#a892b2', '#8f7aa0', '#6e5a86', '#4a3a5e'], rail: '#1c1226', front: '#110b18', fig: '#120c18',
    light: '#ffd0a0', key: '#ffdcc0', amb: '#9a86b8', win: '#ffb862' },
  gold: { sky: [[0, '#cbb6c8'], [.4, '#f0d8ac'], [.62, '#f8e6b4'], [1, '#f8e6b4']], ridges: ['#ecc77e', '#d9ab68', '#c0904a', '#8a6234'], rail: '#3a2614', front: '#1f140a', fig: '#1f140a',
    light: '#ffd98a', key: '#ffe6c0', amb: '#c8a07a', win: '#ffd98a' },
  palace: { wall: '#b9a5b8', c1: '#7a6480', c2: '#46344e', c3: '#1c1224', floor: '#2a1d30', fig: '#0e0814' },
  room: { wall: '#a99cb6', mid: '#6c5a80', floor: '#3a2c4a', front: '#140c1c', fig: '#0e0814' },
  city: { sky: [[0, '#2a2236'], [.5, '#4a3f5a'], [.75, '#6a5e78'], [1, '#6a5e78']], tower: '#4a4058', back: '#3c3248', houses: '#251c30', plaza: '#1a1222', front: '#0d0912', fig: '#0a0710' },
  court: { wall: '#6a5872', c1: '#3e3248', c2: '#241a2c', c3: '#120c16', front: '#08050a', fig: '#06040a' },
  goldCourt: { wall: '#f8e6b4', c1: '#ecc77e', c2: '#c0904a', c3: '#604020', front: '#1f140a', fig: '#1f140a' },
};

// Title strip: paper, lit, letters cut out; anchored to the camera (top of frame); reveals from its left edge
function titleStrip(S) {
  // a dark paper plate; the letters are light (emissive cream), so the title reads at once over the dusk sky
  const words = x => { text(x, 'ESTER EN CIFRAS', 0, .0062, .0118, 'Cinzel', { weight: 800, fill: '#fff' }); text(x, 'Ester 1:1; 4–5', 0, -.0112, .0084, 'Playfair', { weight: 'italic 500', fill: '#fff' }); };
  const m = lay(S, { w: .12, h: .05, z: -.01, col: '#1e1428', trans: .05, shadow: false, recv: false, ppm: 9000, finish: { rim: .6, under: .2 }, draw: x => {
    x.beginPath(); x.roundRect(-.058, -.023, .116, .046, .002); x.fill();
  }, glowDraw: words, glow: 2.6, glowCol: '#ffe6b0', glowRes: 1 });
  return { m, update(t, t0, t1) {
    const reveal = ss(seg(t, t0, t0 + .35)) * (1 - ss(seg(t, t1 - .45, t1)));
    const c = S.cam.position, ts = (c.z + .01) / .5;
    m.scale.setScalar(ts); m.position.x = c.x; m.position.y = c.y + HH(c.z, -.01) * .64;
    m.material.userData.u.uClip.value.set(m.position.x - .066 * ts, m.position.y, .15 * reveal * ts, 0); m.visible = reveal > .002;
  } };
}

// —————————————— la terraza de Susa (S1 dusk, S11 gold) ——————————————
// Four ranges in depth (the 127 provinces), 12 small windows in all; the throne hall far to the right; the arched parapet (Clawd stands on it).
const RIDGES = [
  { z: -.15, base: .02, peaks: [[-.12, .02, .06], [.06, .024, .06]], ph: 1, win: [-.15, -.02, .1] },
  { z: -.136, base: .008, peaks: [[-.04, .014, .05], [.12, .016, .05]], ph: 2.4, win: [-.09, .0, .15] },
  { z: -.12, base: -.004, peaks: [[-.1, .012, .05], [.03, .01, .06]], ph: .7, win: [-.13, -.04, .07] },
  { z: -.104, base: -.016, peaks: [[-.06, .008, .05], [.07, .01, .05]], ph: 3.3, win: [-.1, .0, .11] },
];
const ridgeY = (r, u) => { let y = r.base; for (const [px, h, pw] of r.peaks) y += h * Math.exp(-(((u - px) / pw) ** 2)); return y + .0012 * (Math.sin(u * 160 + r.ph) + .5 * Math.sin(u * 410 + r.ph * 2)); };
export const RAIL = -.02;
export function terraza(S, P, o = {}) {
  const sky = skyOf(S, P.sky, { y: .12 });
  const lit = o.lit || [[0], [1], [], [2]];   // which windows of each range burn (dusk: few, far and cold)
  const HX = .052;                            // the throne hall
  const ridges = RIDGES.map((r, i) => {
    const wins = r.win.map(u => [u, ridgeY(r, u) - .006 - (i % 2) * .003]), ws = .0026 - i * .0001, wh = .0034;
    return lay(S, { w: 1.2, h: .5, y: -.2, z: r.z, col: P.ridges[i], trans: .55 - i * .12, ppm: 1500 - i * 100, shadow: i > 1, finish: { rim: .45, rimPx: 3 }, draw: c => {
      c.translate(0, .2); ridgeFill(c, { x0: -.6, x1: .6, base: r.base, peaks: r.peaks, rough: .0012, ph: r.ph });
      if (i === 1) { c.fillRect(HX - .017, -.05, .034, .1); c.beginPath(); c.arc(HX, .05, .017, Math.PI, 0, true); c.fill(); c.fillRect(HX - .0015, .066, .003, .01); for (const s of [-1, 1]) c.fillRect(HX + s * .021 - .0035, -.05, .007, .085); }
    }, glowDraw: c => { c.translate(0, .2); c.fillStyle = '#fff'; wins.forEach(([u, y], k) => { if (o.all || lit[i].includes(k)) c.fillRect(u - ws / 2, y - wh / 2, ws, wh); }); if (i === 1 && o.hallLit) c.fillRect(HX - .002, .028, .004, .012); }, glow: 2.2, glowCol: P.win, glowRes: .8 });
  });
  const rail = lay(S, { w: 1.2, h: .4, y: RAIL - .2, z: -.06, col: P.rail, trans: .06, ppm: 1600, finish: { rim: .55, rimPx: 4 }, draw: c => {
    c.translate(0, .2); c.fillRect(-.6, -.4, 1.2, .4); c.fillRect(-.6, .0, 1.2, .0035);
    cut(c, () => { for (let i = -14; i <= 14; i++) { const cx = i * .022; c.beginPath(); c.moveTo(cx - .007, -.026); c.lineTo(cx - .007, -.008); c.arc(cx, -.008, .007, Math.PI, 0, true); c.lineTo(cx + .007, -.026); c.closePath(); c.fill(); } });
  } });
  const fr = front(S, P.front);
  return { sky, ridges, rail, fr };
}

// S1 la terraza (127): Esther at the parapet, Clawd on it; scale dolly back; rack focus to the far throne hall on «no puede ver al rey»
export function S1(E) {
  const { H } = E, P = PAL.dusk;
  const S = stage({ light: [.02, .03, -.1], lightR: .22, lightCol: P.light, key: 1.35, keyCol: P.key, amb: .34, ambCol: P.amb, floor: .45 });
  const T = terraza(S, P);
  const Es = human(S.U, { h: .085, z: -.075, col: P.fig, pose: 'stand', crown: true, robe: true, rim: .8 }); S.scene.add(Es.g);
  const C = clawd(S.U, { u: .0026, z: -.058 }); S.scene.add(C.g);
  const ttl = titleStrip(S);
  return { S, update(t) {
    const k = eio(seg(t, 0, H.l01b + .3)), cz = lerp(.3, .56, k), cx = lerp(-.008, .004, k), cy = camY(cz, RAIL, -.06, .36);
    aim(S.cam, [cx, cy, cz, cx, cy, -.08], t, { hand: .0004 });
    T.fr.follow(.24);
    Es.set({ x: .016, y: G + bob(t, .9, .0003), a: .14 + bob(t, .8, .03) });
    const sweep = ss(seg(t, H.ciento27 - .1, H.ciento27 + .5)) * (1 - ss(seg(t, H.no_puede - .2, H.no_puede + .2)));
    const arc = ss(seg(t, H.ciento27, H.ciento27 + 1.4)), hall = ss(seg(t, H.no_puede, H.no_puede + .4));
    C.set({ x: -.03, y: RAIL + Math.abs(bob(t, 1.3, .0005)), aR: sweep * lerp(1.3, 2.2, arc), look: lerp(.3, 1, Math.max(arc * sweep, hall)), lookY: lerp(0, .8, Math.max(arc * sweep, hall)), blink: blink(t, 3.1, .4), k: 1 });
    this._f = lerp(fsOf(S, -.07), fsOf(S, -.136), ss(seg(t, H.no_puede - .1, H.no_puede + .6)));
    setL(S, .03, .03, lerp(.2, .26, k), 1);
    ttl.update(t, 0, H.titulo_fin);
  }, post() { return { focus: this._f, aper: 8, maxCoc: 7, bloom: blo(.32, 1.1) }; }, grade() { return { vig: .42, sat: 1.04 }; } };
}

// —————————————— el pasillo (S2, S8): three strips of columns, the court doors with a slit of gold, two still guards ——————————————
function pasillo(S, P, o = {}) {
  wall(S, { z: -.152, col: P.wall, draw: c => cut(c, () => { for (const nx of [-.3, -.18, .18, .3]) { c.beginPath(); c.moveTo(nx - .02, -.05); c.lineTo(nx - .02, .07); c.arc(nx, .07, .02, Math.PI, 0, true); c.lineTo(nx + .02, -.05); c.closePath(); c.fill(); } }) });
  S.add(columnas(S.U, { n: 9, gap: .065, h: .15, w: .006, z: -.148, col: P.c1, trans: .45 })).position.y = G - .002;
  const D = puertas(S.U, { w: .062, h: .1, z: -.14, col: o.leaf || '#2a1d30', frame: P.c2 }); D.g.position.y = G; S.scene.add(D.g);
  const guards = [-1, 1].map(s => {
    const g = human(S.U, { h: .066, z: -.136, col: P.fig, rim: .7 }); g.g.scale.x = -s; g.set({ x: s * .056, y: G, a: .5 });
    g.g.add(mk(S.U, { w: .004, h: .1, x: .2 * .066, y: .048, z: .0007, col: P.fig, trans: .05, shadow: false, ppm: 6000, finish: { rim: .6 }, draw: c => { c.fillRect(-.0005, -.05, .001, .094); c.beginPath(); c.moveTo(-.0016, .044); c.lineTo(0, .05); c.lineTo(.0016, .044); c.fill(); } }));   // a spear held upright
    S.scene.add(g.g); return g;
  });
  S.add(columnas(S.U, { n: 7, gap: .092, h: .19, w: .009, z: -.105, col: P.c2, trans: .2 })).position.y = G - .004;
  floorStrip(S, { z: -.075, col: P.floor });
  const near = S.add(columnas(S.U, { n: 4, gap: .17, h: .4, w: .011, z: -.05, col: P.c3, trans: .04, lintel: false, rim: .3 })); near.position.set(o.nearX ?? -.04, .03, -.05);
  const fr = front(S, P.c3);
  return { D, guards, near, fr };
}

// S2 the corridor: a lateral track to the doors; Clawd walks with the camera, looks up at «Susa», stops dead on «muere»
export function S2(E) {
  const { H, T0 } = E, P = PAL.palace;
  const S = stage({ light: [-.04, .02, -.1], lightR: .2, lightCol: '#ffd6a8', key: 1.2, keyCol: '#f4dcc8', amb: .3, ambCol: '#9a86b0', floor: .4 });
  const B = pasillo(S, P);
  const C = clawd(S.U, { u: .0026, z: -.042 }); S.scene.add(C.g);
  return { S, update(t) {
    const k = eio(seg(t, T0, H.muere + .1)), cx = lerp(-.13, .0, k), cz = .5, cy = camY(cz, G, -.08, .33);
    aim(S.cam, [cx, cy, cz, cx, cy, -.08], t, { hand: .0004 });
    B.fr.follow(.24);
    const walking = 1 - ss(seg(t, H.muere - .1, H.muere + .05)), ph = (t - T0) * 9;
    const up = ss(seg(t, H.susa - .2, H.susa + .2)) * (1 - ss(seg(t, H.l03 + .2, H.l03 + .6)));
    C.set({ x: cx - .032, y: G + Math.abs(Math.sin(ph)) * .0012 * walking, walk: ph, stride: .35 * walking, look: lerp(.7, .2, up), lookY: up, tuck: .4 * ss(seg(t, H.muere, H.muere + .18)), blink: blink(t, 2.9), k: 1 });
    const dim = ss(seg(t, H.muere, H.muere + .4));
    setL(S, cx - .02, .02, .2, lerp(1, .72, dim)); S.key.intensity = lerp(1.2, .95, dim);
    B.D.set(0, lerp(.8, 1.1, k));
    this._f = fsOf(S, -.05);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 7, bloom: blo(.32, 1.1) }; }, grade() { return { vig: .45 }; } };
}

// —————————————— la corte (S3 through the slit, S9 the silent court, S10 the sceptre) ——————————————
// Back wall, three column/curtain pairs cut in halves (they part in the climax), each with its floor stripe.
export function corte(S, P, o = {}) {
  const back = wall(S, { z: -.172, col: P.wall, trans: .85, draw: o.arches === false ? null : c => cut(c, () => { for (const nx of [-.07, .07]) { c.beginPath(); c.moveTo(nx - .012, .02); c.lineTo(nx - .012, .09); c.arc(nx, .09, .012, Math.PI, 0, true); c.lineTo(nx + .012, .02); c.closePath(); c.fill(); } }) });
  const glow = skyPanel({ w: .8, h: .7, y: .05, z: -.176, gain: 1, stops: [[0, '#fff6d8'], [.5, '#ffd98a'], [1, '#ffb862']] }); S.add(glow); glow.visible = false;
  const pairs = (o.pairs || [[-.13, P.c1, .05, .5], [-.1, P.c2, .07, .3], [-.07, P.c3, .095, .12]]).map(([z, col, open, trans], i) => {
    const p = portico(S.U, { z, col, trans, open, w: .7, h: .5, cy: G - .25 + .24 + .006, seed: i + 3, floorY: G - (G - .25 + .24 + .006) });
    S.add(p.L, p.R); return p;
  });
  return { back, glow, pairs };
}
// the frontal king on his throne, with the sceptre resting across his knees (S3, S9)
export function kingFront(S, P, { x = 0, z = -.152, h = .045, dais = 0 } = {}) {
  const Y = G + dais;
  if (dais) lay(S, { w: h * 2.4, h: dais + .004, x, y: G + dais / 2 - .002, z: z + .004, col: P.dais || P.c1, trans: .15, ppm: 3000, finish: { rim: .55, rimPx: 3 }, draw: c => { const W = h * 1.2; for (let i = 0; i < 4; i++) c.fillRect(-W + i * W * .14, -dais / 2 - .002 + i * dais / 4, 2 * W - i * W * .28, dais / 4 + .001); } });   // the dais: four steps up to the throne
  const th = trono(S.U, { w: h * .62, z: z - .003, col: P.c2 }); th.position.set(x, Y, z - .003); S.add(th);
  const K = human(S.U, { h, z, col: P.fig, pose: 'throne', crown: true, arms: false, rim: .8 }); K.set({ x, y: Y + h * .05 }); S.scene.add(K.g);
  const sc = cetro(S.U, { L: h * .55 }); sc.position.set(x + h * .16, Y + h * .4, z + .001); sc.rotation.z = -1.95; S.add(sc);
  return { th, K, sc };
}

// S3 the slit: the two leaves fill the frame; through the gap, far: the king on his throne and the sceptre, which flashes on «oro»
export function S3(E) {
  const { H, T0, dur } = E, P = { ...PAL.court, wall: '#b49a8a', c1: '#6a5262', c2: '#3a2a3a' };
  const S = stage({ light: [0, .0, -.1], lightR: .1, lightCol: '#ffd9a0', key: .7, keyCol: '#f4dcc8', amb: .2, ambCol: '#8a76a0', floor: .25 });
  corte(S, P, { pairs: [[-.13, P.c1, .03, .4], [-.11, P.c2, .045, .25]] });
  const Kg = kingFront(S, P, { h: .046, z: -.15 });
  const gap = .011;
  [-1, 1].forEach(s => lay(S, { w: .3, h: .5, x: s * (gap / 2 + .15), y: .0, z: -.03, col: '#0c0710', trans: .03, ppm: 1600, finish: { rim: .55, rimPx: 4 }, draw: c => {
    c.fillRect(-.15, -.25, .3, .5);
  } }));
  const C = clawd(S.U, { u: .0011, z: -.026 }); S.scene.add(C.g);
  const fr = front(S, '#060408', { z: -.022 });
  return { S, update(t) {
    const k = eio(seg(t, T0, T0 + dur)), cz = lerp(.34, .16, k), cy = lerp(-.004, .0, k);
    aim(S.cam, [0, cy, cz, 0, cy, -.08], t, { hand: .0003 });
    fr.follow(.22);
    const fl = ss(seg(t, H.cetro1 - .12, H.cetro1 + .1)) * (1 - .55 * ss(seg(t, H.cetro1 + .25, H.cetro1 + 1.1)));
    Kg.sc.userData.set(lerp(.55, 2.6, fl));
    // Clawd: small, at the gap, seen from behind, one hand resting on the leaf (not pushing)
    const hz = HH(cz, -.026), s = lerp(1, .8, k);
    C.set({ x: -gap / 2 - .0085 * s, y: cy - hz + 2 * .3 * hz, back: true, aR: .8, aL: 0, s, k: .9 });
    setL(S, 0, .0, .1, lerp(.9, 1.15, fl));
    this._f = lerp(fsOf(S, -.03), fsOf(S, -.15), ss(seg(t, T0 + .2, H.cetro1 - .2)));
  }, post() { return { focus: this._f, aper: 6, maxCoc: 8, bloom: blo(.4, 1.0) }; }, grade() { return { vig: .5 }; } };
}

// —————————————— el aposento (S4, S7): high window with bars, the door, the floor; the window light is a beam that sweeps ——————————————
const WX = -.034, WY = .05, WW = .03, WH = .046;
function aposento(S, P, o = {}) {
  const sky = skyPanel({ w: .1, h: .1, x: WX, y: WY, z: -.158, stops: [[0, '#ffffff'], [1, '#e8e0f0']], gain: 1 }); S.add(sky);
  const mn = o.moon ? moon({ r: .0045, x: WX + .006, y: WY + .008, z: -.155, gain: 1.9, core: '#fbf6ff', mid: '#ece4f4', edge: '#d8cce0', halo: 5, haloGain: .3 }) : null; if (mn) S.scene.add(mn);
  const back = lay(S, { w: 1, h: .6, y: .1, z: -.145, col: P.wall, trans: .85, ppm: 1600, finish: { rim: .5, rimPx: 4 }, draw: c => {
    c.translate(0, -.1); c.fillRect(-.5, -.3, 1, .6);
    cut(c, () => { c.beginPath(); c.moveTo(WX - WW / 2, WY - WH / 2); c.lineTo(WX - WW / 2, WY + WH / 2 - WW / 2); c.arc(WX, WY + WH / 2 - WW / 2, WW / 2, Math.PI, 0, true); c.lineTo(WX + WW / 2, WY - WH / 2); c.closePath(); c.fill(); });
    for (const f of [-.25, 0, .25]) c.fillRect(WX + f * WW - .0009, WY - WH / 2, .0018, WH);   // the bars
    c.fillRect(WX - WW * .7, WY - WH / 2 - .004, WW * 1.4, .004);                               // the sill
  } });
  const door = lay(S, { w: .06, h: .1, x: .058, y: G + .045, z: -.14, col: P.mid, trans: .12, ppm: 3000, finish: { rim: .55, rimPx: 3 }, draw: c => {
    c.translate(0, -.045); c.fillRect(-.024, 0, .048, .082); c.beginPath(); c.arc(0, .082, .024, Math.PI, 0, true); c.fill();
    cut(c, () => { c.lineWidth = .0012; c.beginPath(); c.moveTo(-.017, .004); c.lineTo(-.017, .078); c.arc(0, .078, .017, Math.PI, 0, true); c.lineTo(.017, .004); c.stroke(); c.beginPath(); c.moveTo(0, .004); c.lineTo(0, .094); c.stroke(); });
  } });
  const fl = floorStrip(S, { z: -.08, col: P.floor, trans: .12 });
  const fr = front(S, P.front);
  return { sky, mn, back, door, fl, fr };
}
// the window light: a beam from the window down across the room; k = day 0..1
function windowBeam(S, k, ang, col) { S.U.uBeamO.value.set(WX, WY, k); S.U.uBeamD.value.set(ang, .2, .12); S.U.uBeamCol.value.copy(col3(col)); }

// S4 the room (30): locked frame; only the light changes: day/night six times, faster and faster, up to «treinta». Nobody comes in.
export function S4(E) {
  const { H, T0 } = E, P = PAL.room;
  const S = stage({ light: [WX, WY, -.1], lightR: .14, lightCol: '#f3dfb0', key: .9, keyCol: '#efe0d0', amb: .3, ambCol: '#9a8cb4', floor: .3 });
  const A = aposento(S, P);
  const Es = human(S.U, { h: .08, z: -.095, col: P.fig, pose: 'sit', crown: true, rim: .75 }); S.scene.add(Es.g);
  const C = clawd(S.U, { u: .0026, z: -.065 }); S.scene.add(C.g);
  const day = col3('#f3dfb0'), night = col3('#5a5078');
  return { S, update(t) {
    const cz = .5, cy = camY(cz, G, -.08, .33), dx = bob(t, .3, .0015);
    aim(S.cam, [dx, cy, cz, dx, cy, -.08], t, { hand: .0003 });
    A.fr.follow(.24);
    const u = clamp((t - T0) / (H.treinta - T0)), p = t < H.treinta ? 6 * Math.pow(u, 1.5) : 6 + (t - H.treinta) * .5;
    const d = .5 - .5 * Math.cos(TAU * p), lightC = night.clone().lerp(day, d);
    A.sky.material.color.copy(lightC).multiplyScalar(lerp(.5, 1.35, d));
    windowBeam(S, lerp(.05, 1.1, d), -1.1 - .5 * (p % 1), mixc('#9088b0', '#ffe2a8', d));
    setL(S, WX, WY, .14, lerp(.35, 1.05, d), lightC);
    S.amb.intensity = lerp(.16, .32, d); S.key.intensity = lerp(.45, .95, d);
    Es.set({ x: WX + .006, y: G, a: .3 });
    // Clawd by the door, chin on his arms: each new day he turns his head to the door; on «treinta» both hands open and fall
    const turn = .5 + .5 * Math.cos(TAU * p);
    const open = ss(seg(t, H.treinta - .15, H.treinta + .15)) * (1 - ss(seg(t, H.treinta + .4, H.treinta + .9)));
    C.set({ x: .03, y: G, tuck: lerp(.55, .15, open), aL: lerp(.25, 1.9, open), aR: lerp(.25, 1.9, open), look: lerp(.2, 1, turn), lookY: -.2, blink: blink(t, 2.7, .3), k: lerp(.75, 1, d) });
    this._d = d; this._f = fsOf(S, -.08);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 6, bloom: blo(.3, 1.1) }; }, grade() { return { vig: .48, expo: lerp(.9, 1.02, this._d) }; } };
}

// —————————————— la ciudad (S5): palace towers above, two rows of houses with windows, the plaza ——————————————
function ciudad(S, P) {
  skyOf(S, P.sky, { y: .12 });
  lay(S, { w: .6, h: .4, y: .0, z: -.15, col: P.tower, trans: .3, ppm: 1600, finish: { rim: .45, rimPx: 3 }, draw: c => {
    c.fillRect(-.3, -.2, .6, .2 + .02);
    for (const [cx, w, h] of [[-.11, .04, .1], [-.05, .03, .15], [.03, .05, .12], [.1, .03, .17], [.17, .04, .09]]) { c.fillRect(cx - w / 2, 0, w, h); c.beginPath(); c.arc(cx, h, w * .42, Math.PI, 0, true); c.fill(); for (let i = -2; i <= 2; i++) c.fillRect(cx + i * w * .22 - w * .06, h - .002, w * .12, .006); }
  }, glowDraw: c => { c.fillStyle = '#fff'; for (const [x, y] of [[-.11, .06], [-.05, .1], [.1, .12], [.17, .05], [-.05, .05]]) c.fillRect(x - .002, y - .003, .004, .006); }, glow: 1.6, glowCol: '#ffb862', glowRes: .6 });
  lay(S, { w: .6, h: .3, y: G - .15, z: -.122, col: P.back, trans: .2, ppm: 1600, finish: { rim: .45, rimPx: 3 }, draw: c => {
    c.translate(0, .15); const R = mulberry(4); c.fillRect(-.3, -.3, .6, .3 + .028);
    for (let i = 0; i < 12; i++) { const cx = -.28 + i * .05 + R() * .01, h = .03 + R() * .025, w = .03 + R() * .012; c.fillRect(cx - w / 2, .028, w, h); c.fillRect(cx - w / 2 - .002, .028 + h, w + .004, .003); }
  }, glowDraw: c => { c.translate(0, .15); c.fillStyle = '#fff'; const R = mulberry(9); for (let i = 0; i < 9; i++) c.fillRect(-.27 + i * .06 + R() * .02, .04 + R() * .02, .0035, .005); }, glow: 1.2, glowCol: '#ffb862', glowRes: .6 });
  // front row: five lit windows, each its own leaf so they can go out one by one
  lay(S, { w: .6, h: .3, y: G - .15, z: -.105, col: P.houses, trans: .1, ppm: 1600, finish: { rim: .5, rimPx: 3 }, draw: c => {
    c.translate(0, .15); c.fillRect(-.3, -.3, .6, .3 + .012);
    for (const [cx, w, h] of [[-.2, .05, .036], [-.12, .04, .046], [-.055, .05, .03], [.08, .045, .04], [.15, .05, .05], [.22, .04, .034]]) { c.fillRect(cx - w / 2, 0, w, h); c.fillRect(cx - w / 2 - .002, h, w + .004, .003); }
  } });
  const WINS = [[-.2, .02], [-.12, .03], [-.055, .018], [.08, .026], [.15, .03]].map(([x, y]) => lay(S, { w: .006, h: .008, x, y: G + y, z: -.1045, col: '#ffcf8a', trans: .5, shadow: false, recv: false, ppm: 5000, finish: { rim: 0, under: 0 },
    draw: c => c.fillRect(-.0022, -.0032, .0044, .0064), glowDraw: c => { c.fillStyle = '#fff'; c.fillRect(-.0024, -.0034, .0048, .0068); }, glow: 2.2, glowCol: '#ffb862', glowRes: .5 }));
  floorStrip(S, { z: -.08, col: P.plaza, trans: .06 });
  const fr = front(S, P.front);
  return { WINS, fr };
}

// S5 the decree: tilt down from the towers to the plaza; a crier holds up an open scroll with no letters; on «todo su pueblo» five windows go out
export function S5(E) {
  const { H, T0 } = E, P = PAL.city;
  const S = stage({ light: [.0, .06, -.1], lightR: .22, lightCol: '#b8a8c8', key: .8, keyCol: '#d0c4dc', amb: .26, ambCol: '#6a5e88', floor: .3 });
  const Ci = ciudad(S, P);
  const cr = human(S.U, { h: .068, z: -.088, col: P.fig, rim: .7 }); cr.g.scale.x = -1; S.scene.add(cr.g);
  const sc = rollo(S.U, { w: .024, h: .014 }); S.add(sc);
  const C = clawd(S.U, { u: .0026, z: -.062 }); S.scene.add(C.g);
  return { S, update(t) {
    const cz = .5, y1 = camY(cz, G, -.08, .33), k = eio(seg(t, T0, H.decreto + .2)), cy = lerp(.11, y1, k);
    aim(S.cam, [-.005, cy, cz, -.005, cy, -.08], t, { hand: .0004 });
    Ci.fr.follow(.24);
    cr.set({ x: .03, y: G, a: 1.35 + bob(t, 1.1, .02) });
    sc.position.set(.03 - .036, G + .044 + bob(t, 1.1, .0004), -.0868);
    Ci.WINS.forEach((w, i) => { const off = H.pueblo + i * .2, kk = 1 - ss(seg(t, off, off + .12)); glowK(w, kk); tint(w, mixc('#2a2030', '#ffcf8a', kk)); });
    const lookUp = ss(seg(t, H.pueblo - .1, H.pueblo + .3));
    C.set({ x: -.04, y: G, look: lerp(.85, .3, lookUp), lookY: lerp(.25, .6, lookUp), blink: blink(t, 3.2, 1), tuck: .15 * lookUp, k: 1 });
    setL(S, .0, .05, .22, lerp(1, .82, lookUp));
    this._f = fsOf(S, -.08);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 6, bloom: blo(.3, 1.1) }; }, grade() { return { vig: .5 }; } };
}

// S6 two heights, one hour: Mordecai near and low by the king's gate; Esther far and high in a lit window; the messenger climbs the stair; rack focus
export function S6(E) {
  const { H, T0, dur } = E, P = PAL.city;
  const S = stage({ light: [.03, .06, -.1], lightR: .22, lightCol: '#b8a8c8', key: .85, keyCol: '#d0c4dc', amb: .26, ambCol: '#6a5e88', floor: .3 });
  skyOf(S, P.sky, { y: .12 });
  lay(S, { w: .5, h: .4, y: .02, z: -.15, col: P.tower, trans: .3, ppm: 1800, finish: { rim: .45, rimPx: 3 }, draw: c => {
    c.fillRect(-.25, -.2, .5, .2 + .02);
    for (const [cx, w, h] of [[-.06, .04, .1], [.035, .06, .12], [.12, .04, .09]]) { c.fillRect(cx - w / 2, 0, w, h); c.beginPath(); c.arc(cx, h, w * .42, Math.PI, 0, true); c.fill(); }
  }, glowDraw: c => { c.fillStyle = '#fff'; for (const [x, y] of [[-.06, .06], [.12, .05]]) c.fillRect(x - .002, y - .003, .004, .006); }, glow: 1.4, glowCol: '#ffb862', glowRes: .6 });
  // Esther's window: lit, with her small figure (crown) standing in it, dark against the light
  const EW = [.035, .095];
  const herShape = c => { c.beginPath(); c.moveTo(-.0048, -.01); c.quadraticCurveTo(-.0046, -.0035, -.0016, -.0022); c.lineTo(.0016, -.0022); c.quadraticCurveTo(.0046, -.0035, .0048, -.01); c.closePath(); c.fill(); c.beginPath(); c.arc(0, .0003, .0021, 0, TAU); c.fill(); c.beginPath(); c.moveTo(-.0019, .0016); c.lineTo(-.002, .0042); c.lineTo(-.001, .0029); c.lineTo(0, .0046); c.lineTo(.001, .0029); c.lineTo(.002, .0042); c.lineTo(.0019, .0016); c.closePath(); c.fill(); };
  const winShape = c => { c.fillRect(-.007, -.01, .014, .016); c.beginPath(); c.arc(0, .006, .007, Math.PI, 0, true); c.fill(); };
  const ew = lay(S, { w: .018, h: .024, x: EW[0], y: EW[1], z: -.1485, col: '#ffcf8a', trans: .6, shadow: false, recv: false, ppm: 6000, finish: { rim: 0, under: 0 },
    draw: winShape, glowDraw: c => { c.fillStyle = '#fff'; winShape(c); c.globalCompositeOperation = 'destination-out'; herShape(c); }, glow: 2, glowCol: '#ffb862', glowRes: 1 });
  lay(S, { w: .018, h: .024, x: EW[0], y: EW[1], z: -.1484, col: '#120c18', trans: .1, shadow: false, recv: false, ppm: 6000, finish: { rim: 0, under: 0 }, draw: herShape });
  // the stair: from the gate (low, left) up to the palace (high, right)
  const ST = { x0: -.01, y0: -.018, x1: .085, y1: .045, n: 11 };
  const stepXY = i => [lerp(ST.x0, ST.x1, i / ST.n), lerp(ST.y0, ST.y1, i / ST.n)];
  lay(S, { w: .5, h: .3, y: -.05, z: -.098, col: P.back, trans: .15, ppm: 2400, finish: { rim: .55, rimPx: 3 }, draw: c => {
    c.translate(0, .05); c.beginPath(); c.moveTo(-.25, -.15); c.lineTo(-.25, ST.y0 - .006); c.lineTo(ST.x0, ST.y0 - .006);
    for (let i = 0; i <= ST.n; i++) { const [x, y] = stepXY(i), [x2] = stepXY(i + 1); c.lineTo(x, y); c.lineTo(Math.min(x2, ST.x1 + .03), y); }
    c.lineTo(.25, ST.y1); c.lineTo(.25, -.15); c.closePath(); c.fill();
  } });
  const ms = human(S.U, { h: .042, z: -.095, col: P.fig, rim: .7 }); S.scene.add(ms.g);
  const C = clawd(S.U, { u: .0021, z: -.092 }); S.scene.add(C.g);
  // Mordecai: near, low, sitting by the king's gate, in sackcloth (a plain dark cloak)
  lay(S, { w: .12, h: .16, x: -.06, y: .04, z: -.058, col: '#3a3048', trans: .08, ppm: 2400, finish: { rim: .5, rimPx: 3 }, draw: c => {
    c.translate(0, -.06); c.fillRect(-.055, 0, .11, .09); cut(c, () => { c.beginPath(); c.moveTo(-.02, 0); c.lineTo(-.02, .05); c.arc(0, .05, .02, Math.PI, 0, true); c.lineTo(.02, 0); c.closePath(); c.fill(); }); c.fillRect(-.06, .09, .12, .006);
  } });
  const Mo = human(S.U, { h: .07, z: -.05, col: '#0a0710', pose: 'sit', rim: 1 }); S.scene.add(Mo.g);
  floorStrip(S, { z: -.04, col: P.front, top: -.021, w: 1.2, trans: .03 });
  return { S, update(t) {
    const k = ss(seg(t, H.mardoqueo + .4, H.hora - .1)), cz = .5, cy = lerp(camY(cz, -.02, -.05, .34), .02, k);
    aim(S.cam, [.012, cy, cz, .012, cy, -.08], t, { hand: .0004 });
    Mo.set({ x: -.045, y: -.02, a: .55 + bob(t, .7, .03) });
    const s = lerp(1.5, 8.2, ss(seg(t, T0 + .2, T0 + dur))), [mx] = stepXY(s);
    ms.set({ x: mx, y: stepXY(Math.floor(s))[1] + .0002, a: .3 + bob(t, 6, .25), rot: .05 });
    const [cx_, cy_] = stepXY(5), up = ss(seg(t, H.hora - .9, H.hora - .2));
    C.set({ x: cx_ + .002, y: cy_, look: lerp(-1, .6, up), lookY: lerp(-.8, .9, up), blink: blink(t, 3, .6), k: .95 });
    glowK(ew, lerp(.75, 1.6, ss(seg(t, H.hora - .1, H.hora + .3)))); setL(S, lerp(-.03, .035, k), lerp(.0, .07, k), .22, 1);
    this._f = lerp(fsOf(S, -.05), fsOf(S, -.148), k);
  }, post() { return { focus: this._f, aper: 9, maxCoc: 8, bloom: blo(.34, 1.05) }; }, grade() { return { vig: .5 }; } };
}

// S7 the fast (3): night in the room; Esther sitting, head low; two maids behind; three lamps; one goes out each day.
// Silence 1 after «que perezca»: the last flame goes out and only the moon is left in the window. Clawd: still, to one side, low glow.
export function S7(E) {
  const { H, T0 } = E, P = { ...PAL.room, wall: '#8a7c9c' };
  const S = stage({ light: [WX, WY, -.1], lightR: .12, lightCol: '#d8cce0', key: .55, keyCol: '#d8cce0', amb: .18, ambCol: '#6a5e88', floor: .2 });
  const A = aposento(S, P, { moon: true });
  [[-.075, .058], [-.06, .06]].forEach(([x, h]) => { const m = human(S.U, { h, z: -.118, col: '#1a1222', pose: 'sit', rim: .5 }); m.set({ x, y: G, a: .25 }); S.scene.add(m.g); });
  const Es = human(S.U, { h: .08, z: -.095, col: P.fig, pose: 'sit', crown: true, rim: .75 }); S.scene.add(Es.g);
  lay(S, { w: .07, h: .02, x: .03, y: G + .005, z: -.074, col: '#241a2e', trans: .08, ppm: 4000, finish: { rim: .55, rimPx: 3 }, draw: c => { c.fillRect(-.032, -.01, .064, .02); c.fillRect(-.034, .008, .068, .0025); } });
  const LX = [.012, .025, .038], LY = G + .0155;
  const lamps = LX.map(x => { const l = lampara(S.U, { s: .011, z: -.071 }); l.g.position.set(x, LY, -.071); S.scene.add(l.g); return l; });
  const C = clawd(S.U, { u: .0024, z: -.062 }); S.scene.add(C.g);
  const outs = [H.dia1, H.dia2, H.perezca_fin];
  const day = col3('#f3dfb0'), night = col3('#3c3458');
  return { S, update(t) {
    const q = eio(seg(t, T0, H.sil1)), cz = lerp(.4, .5, q), cx = lerp(.012, .0, q), cy = camY(cz, G, -.08, .34);
    aim(S.cam, [cx, cy, cz, cx, cy, -.08], t, { hand: t > H.sil1 ? 0 : .0003 });
    A.fr.follow(.24);
    // three days pass: three soft day-glows in the window, one before each flame goes out
    const d = [outs[0] - .55, outs[1] - .5, outs[2] - .5].reduce((a, c) => Math.max(a, Math.exp(-(((t - c) / .3) ** 2))), 0);
    const lc = night.clone().lerp(day, d);
    A.sky.material.color.copy(lc).multiplyScalar(lerp(.55, 1.2, d));
    setMoon(A.mn, 1 - d);
    windowBeam(S, lerp(.12, .7, d), -1.2, mixc('#8a80b0', '#ffe2a8', d));
    let lit = 0;
    lamps.forEach((l, i) => { const k = 1 - ss(seg(t, outs[i], outs[i] + .18)); l.set(k, t + i); lit += k; });
    const lx = LX[Math.max(0, Math.min(2, Math.round(lit) - 1))] ?? LX[0];
    setL(S, lit > .05 ? lx : WX, lit > .05 ? LY + .01 : WY, lerp(.1, .13, lit / 3), lerp(.45, .95, Math.max(lit / 3, d)), lit > .05 ? '#ffb862' : '#d8cce0');
    S.amb.intensity = lerp(.12, .2, lit / 3); S.key.intensity = lerp(.35, .6, lit / 3);
    Es.set({ x: WX + .01, y: G, a: .05, rot: -.06 });
    C.set({ x: .056, y: G, tuck: .8, aL: .15, aR: .15, look: -.9, lookY: -.3, blink: lerp(1, .5, ss(seg(t, H.sil1 - .3, H.sil1 + .4))), k: .5 });
    this._l = lit; this._f = fsOf(S, -.075);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 6, bloom: blo(.38, 1.0) }; }, grade() { return { vig: .58, expo: lerp(.86, 1, this._l / 3) }; } };
}

// S8 on the third day, she goes in: from inside the corridor, behind Esther (royal robe, crown); the leaves slide apart on «entra»; Clawd stops at the threshold
export function S8(E) {
  const { H, T0, dur } = E, P = { ...PAL.palace, wall: '#a8949f' };
  const S = stage({ light: [0, .0, -.1], lightR: .16, lightCol: '#ffd6a8', key: 1.0, keyCol: '#f4dcc8', amb: .26, ambCol: '#9a86b0', floor: .35 });
  const B = pasillo(S, P, { nearX: 0, leaf: '#6a5470' });
  const Es = human(S.U, { h: .08, z: -.09, col: P.fig, pose: 'back', crown: true, rim: .9, two: true }); S.scene.add(Es.g);
  const C = clawd(S.U, { u: .0019, z: -.072 }); S.scene.add(C.g);
  return { S, update(t) {
    const k = eio(seg(t, T0, T0 + dur)), cz = lerp(.44, .3, k), cy = camY(cz, G, -.08, .3);
    aim(S.cam, [0, cy, cz, 0, cy, -.08], t, { hand: .0004 });
    B.fr.follow(.24);
    const w = seg(t, T0, H.entra + .5), ez = lerp(-.088, -.118, eio(w)), ph = (t - T0) * 6;
    Es.g.position.z = ez; Es.set({ x: .002 + bob(ph, 1, .0006), y: G + Math.abs(Math.sin(ph)) * .0006, a: .06, a2: .06 });
    const op = eio(seg(t, H.entra - .05, H.entra + .7));
    B.D.set(op, lerp(1.1, 1.7, op));
    C.set({ x: lerp(-.036, -.025, eio(seg(t, T0, H.entra - .2))), y: G, walk: ph * 1.4, stride: .3 * (1 - ss(seg(t, H.entra - .4, H.entra - .1))), back: true, k: .9 });
    setL(S, 0, lerp(-.02, .0, op), lerp(.12, .2, op), lerp(.8, 1.3, op), mixc('#ffd6a8', '#ffe2b0', op));
    this._f = fsOf(S, ez);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 7, bloom: blo(.4, 1.0) }; }, grade() { return { vig: .5 }; } };
}

// S9 silence 2, the signature shot: the court end to end, symmetric, nothing moves; the only shine is the tip of the sceptre
export function S9(E) {
  const P = PAL.court;
  const S = stage({ light: [0, .0, -.1], lightR: .16, lightCol: '#c8b8d4', key: .75, keyCol: '#c8bcd8', amb: .2, ambCol: '#6a5e7e', floor: .3 });
  corte(S, P);
  const Kg = kingFront(S, { ...P, dais: '#9a88a8' }, { h: .042, z: -.155, dais: .034 });
  const Es = human(S.U, { h: .046, z: -.06, col: P.fig, pose: 'back', crown: true, rim: 1, two: true }); S.scene.add(Es.g);
  const C = clawd(S.U, { u: .0024, z: -.045 }); S.scene.add(C.g);
  const fr = front(S, P.front);
  return { S, update(t) {
    const cz = .5, cy = camY(cz, G, -.07, .33);
    aim(S.cam, [0, cy, cz, 0, cy, -.08], t, { hand: 0 });
    fr.follow(.24);
    Es.set({ x: -.017, y: G, a: .05, a2: .05 });
    C.set({ x: -.05, y: G - .006, tuck: .8, look: .6, lookY: .2, blink: 1, k: .5 });
    Kg.sc.userData.set(1.3);
    setL(S, -.012, G + .03, .11, 1.25, '#ffe2c0');
    this._f = fsOf(S, -.06);
  }, post() { return { focus: this._f, aper: 5, maxCoc: 6, bloom: blo(.36, 1.0) }; }, grade() { return { vig: .55 }; } };
}

// S10 the climax: the king (profile, facing Esther) turns the sceptre from his knee toward her; the court pairs part back to front with the gold,
// the camera dollies in through them to the hand and the tip; the film's one burst on «toca»
export function S10(E) {
  const { H, T0 } = E, P = PAL.court, Q = PAL.goldCourt;
  const S = stage({ light: [.0, .0, -.1], lightR: .14, lightCol: '#ffd98a', key: .8, keyCol: '#ffe0b0', amb: .16, ambCol: '#7a6a80', floor: .2 });
  const Ct = corte(S, P, { arches: false, pairs: [[-.135, P.c1, .012, .5], [-.1, P.c2, .016, .3], [-.07, P.c3, .02, .12]] });
  const KZ = -.122, KX = .046, kh = .072;
  const th = trono(S.U, { w: .026, z: KZ - .004, col: P.c2 }); th.position.set(KX + .006, G, KZ - .004); S.add(th);
  const K = human(S.U, { h: kh, z: KZ, col: P.fig, pose: 'sit', crown: true, rim: .85 }); K.g.scale.x = -1; S.scene.add(K.g);
  const sc = cetro(S.U, { L: .04 }); sc.position.set(0, -K.al, .0008); K.arm.add(sc);
  const Es = human(S.U, { h: .082, z: KZ + .002, col: P.fig, pose: 'stand', crown: true, robe: true, rim: .9 }); S.scene.add(Es.g);
  const C = clawd(S.U, { u: .0016, z: -.05 }); S.scene.add(C.g);
  const fl = burst(.09, .12, '#ffd98a'); S.add(fl);
  const fr = front(S, P.front);
  // the final pose: sceptre held out, a little up; Esther's hand meets its tip
  const A1 = 1.95; K.set({ x: KX, y: G, a: A1 }); K.g.updateMatrixWorld(true);
  const tipW = sc.localToWorld(new THREE.Vector3(...sc.userData.tip, 0));
  const eal = Es.al, shX0 = .01 * .082, shY = G + .74 * .082, dy = tipW.y - shY, ex = tipW.x - Math.sqrt(Math.max(0, eal * eal * .96 - dy * dy)) - shX0;
  const aE = Math.atan2(tipW.x - (ex + shX0), -(tipW.y - shY));
  const layersOf = [[Ct.back, P.wall, Q.wall], ...Ct.pairs.map((p, i) => [p, [P.c1, P.c2, P.c3][i], [Q.c1, Q.c2, Q.c3][i]])];
  return { S, update(t) {
    const ext = eio(seg(t, H.extiende, H.cetro + .5)), touch = eio(seg(t, H.cetro + .2, H.toca));
    K.set({ x: KX, y: G, a: lerp(.25, A1, ext) });
    sc.userData.set(lerp(1.3, 2.4, ext));
    Es.set({ x: lerp(ex - .022, ex, eio(seg(t, T0 + .2, H.toca - .25))), y: G, a: lerp(.12, aE, touch) });
    // the pairs part from back to front, .25 s apart, with the gold
    const a = H.cetro, op = i => eio(seg(t, a + i * .25, a + .9 + i * .25));
    Ct.pairs.forEach((p, i) => p.part(op(i) * (.06 + i * .03)));
    const wash = ss(seg(t, a - .1, H.toca + .2));
    Ct.back.visible = wash < .995; Ct.glow.visible = wash > .002; Ct.glow.material.color.setScalar(.15 + .95 * wash);
    layersOf.forEach(([m, c0, c1], i) => { const k = i === 0 ? wash : op(i - 1); if (m.L) { tint(m.L, mixc(c0, c1, k)); tint(m.R, mixc(c0, c1, k)); } else tint(m, mixc(c0, c1, k)); });
    // the camera: in through the opening, to the hand and the tip (kept near 58 % of the frame height)
    const z = eio(seg(t, T0, H.toca + .3)), cz = lerp(.46, .225, z);
    const tx = lerp(0, tipW.x - .004, z), ty = lerp(camY(cz, G, -.07, .33), tipW.y - .16 * HH(cz, KZ), z);
    aim(S.cam, [tx, ty, cz, tx, ty, -.08], t, { hand: .0003 });
    fr.follow(.24);
    const b = ss(seg(t, H.toca - .05, H.toca + .12)) * (1 - .5 * ss(seg(t, H.toca + .5, H.toca + 1.6)));
    fl.position.set(tipW.x, tipW.y - .05, KZ + .01); fl.userData.set(b * .9);
    // Clawd: bottom left, in front; raises his head and then his arms as the light reaches him
    const lift = ss(seg(t, a + .6, H.toca + .3)), hz = HH(cz, -.05), wz = HW(cz, -.05), arms = 1.9 * ss(seg(t, H.toca - .3, H.toca + .5));
    C.set({ x: tx + wz * .5, y: ty - hz + 2 * .3 * hz, tuck: lerp(.6, 0, lift), lookY: lerp(-.2, .9, lift), look: .8, aL: arms, aR: arms, k: lerp(.55, 1, lift), blink: blink(t, 3.3) });
    setL(S, lerp(.02, tipW.x, wash), tipW.y, lerp(.16, .35, wash), lerp(1.05, 1.7, wash), mixc('#b8a8c8', '#ffd98a', wash));
    S.key.intensity = lerp(.6, 1.5, wash); S.amb.intensity = lerp(.14, .3, wash); S.amb.color.set(mixc('#5a4e6e', '#c0a080', wash));
    this._w = wash; this._f = fsOf(S, KZ);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 8, bloom: blo(lerp(.34, .44, this._w), 1.0) }; }, grade() { return { vig: lerp(.55, .32, this._w), sat: 1.05 }; } };
}

// S11 the echo: the terrace of S1 at a golden dawn; every window of the provinces lights up; Esther faces front; dolly in to Clawd, who turns to us on «tú»
export function S11(E) {
  const { H } = E, P = PAL.gold;
  const S = stage({ light: [.0, .04, -.1], lightR: .3, lightCol: P.light, key: 1.6, keyCol: P.key, amb: .42, ambCol: P.amb, floor: .55 });
  const T = terraza(S, P, { all: true, hallLit: true });
  const Es = human(S.U, { h: .085, z: -.075, col: P.fig, pose: 'back', crown: true, rim: .9, two: true }); S.scene.add(Es.g);
  const C = clawd(S.U, { u: .0026, z: -.058, glow: .45 }); S.scene.add(C.g);
  return { S, update(t) {
    const k = eio(seg(t, H.l11 - .6, H.cta + .3)), cz = lerp(.56, .3, k), cx = lerp(.004, -.006, k), cy = camY(cz, RAIL, -.06, .36);
    aim(S.cam, [cx, cy, cz, cx, cy, -.08], t, { hand: .0004 });
    T.fr.follow(.24);
    T.ridges.forEach((r, i) => glowK(r, ss(seg(t, H.n127 - .3 + i * .18, H.n127 + i * .18))));
    Es.set({ x: .01, y: G, a: .08, a2: .08 });
    const turn = ss(seg(t, H.tu - .15, H.tu + .25)), arm = ss(seg(t, H.palabra - .2, H.palabra + .2));
    C.set({ x: -.03, y: RAIL + Math.abs(bob(t, 1.3, .0005)), look: lerp(.8, 0, turn), lookY: lerp(.5, 0, turn), aR: arm * (2 + bob(t, 6, .15)), blink: blink(t, 2.8, .2), k: 1 });
    setL(S, .0, .04, .3, lerp(1, 1.15, ss(seg(t, H.gesto, H.gesto + .6))));
    this._f = lerp(fsOf(S, -.075), fsOf(S, -.058), k);
  }, post() { return { focus: this._f, aper: 8, maxCoc: 7, bloom: blo(.36, 1.15) }; }, grade() { return { vig: .32, sat: 1.04 }; } };
}
