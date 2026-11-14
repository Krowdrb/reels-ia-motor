// The twelve shots of "5 datos de la Biblia". Each: { S, update(t), post(), grade() }; t in film seconds.
// From the biggest figure to the smallest: forty authors, three languages, the cut into chapters and verses, Psalm 119 and 117,
// and the shortest verse at the tomb in Bethany. God is only ever light; every person is a calm silhouette; Clawd is the only strong colour.
// No text on screen except the opening title strip.
import * as THREE from 'three';
import { skyPanel, moon, text, burst } from './paper.js';
import { stage, aim } from './stage.js';
import { mulberry, seg, ss, eio, lerp, clamp, TAU } from './lib.js';
import { mk, cut, tint, clawd, human, ship, waveFill, scrollRoll, oilLamp, fire, column, sheep, stone, POSES } from './actors.js';

const blo = (s = .34, th = 1.1) => ({ strength: s, radius: .6, threshold: th });
const lay = (S, o) => S.add(mk(S.U, o));
const col3 = c => new THREE.Color(c);
const mixHex = (a, b, k) => '#' + col3(a).lerp(col3(b), clamp(k)).getHexString();
const setL = (S, x, y, r, lit, c) => { S.U.uLight.value.x = x; S.U.uLight.value.y = y; S.U.uLightR.value = r; S.U.uLit.value = lit; if (c) S.U.uLightCol.value.copy(typeof c === 'string' ? col3(c) : c); };
const bob = (t, f, a, p = 0) => Math.sin(t * f + p) * a;
const fsOf = (S, z) => S.cam.position.z - z;
const blinkAt = (t, ph = 0, per = 3.4) => 1 - .9 * Math.max(0, 1 - Math.abs((((t + ph) % per) + per) % per - .1) / .1);
const clip = (m, x, y, r, inv = 0) => m.material.userData.u.uClip.value.set(x, y, r, inv);
// a ground / hill sheet whose top edge is a soft wave; it fills everything below
const ground = (S, { z, col, base, amp = .004, len = .2, ph = 0, tr = .05, w = .9, x = 0, peak = 1.3, rim = .5, ppm = 1800, shadow = true }) => {
  const top = base + amp * 2 + .02, bot = -.45, h = top - bot;
  return lay(S, { w, h, x, y: (top + bot) / 2, z, col, trans: tr, ppm, shadow, finish: { rim }, draw: q => { q.translate(0, -(top + bot) / 2); waveFill(q, { x0: -w / 2, x1: w / 2, base, amp, len, ph, peak }); } });
};
// a sky panel that fades in over another one
const fadeSky = (S, stops, z, o = {}) => { const m = skyPanel({ w: o.w || 1.4, h: o.h || 1.2, y: o.y || 0, z, stops }); m.material.transparent = true; m.material.opacity = 0; m.material.depthWrite = false; S.add(m); return m; };
// a written leaf: rows of fine strokes (never letters)
const strokes = (x, x0, x1, y0, y1, row, seed, lw = .0007) => {
  const R = mulberry(seed);
  for (let y = y1 - row * .8; y > y0 + row * .3; y -= row) { let u = x0; while (u < x1) { const l = row * (.6 + R() * 1.8); if (u + l > x1) break; x.fillRect(u, y, l, lw); u += l + row * (.25 + R() * .35); } }
};

// —— the scribe's room at night: two rows of desks with lamps going back into the blue; the near desk with its lamp, scroll and scribe ——
export function scribeRoom(S) {
  S.add(skyPanel({ w: 1, h: 1, z: -.17, stops: [[0, '#04081a'], [.5, '#0a1330'], [1, '#121d44']], stars: 50, starMinY: .07 }));
  const rows = [];
  for (let i = 0; i < 5; i++) {
    const k = Math.pow(.66, i), z = -.105 - i * .012, y0 = -.028 + .068 * (1 - k), dx = .085 * k, s = .03 * k;
    const col = mixHex('#4a5c9a', '#26346a', i / 4);
    const desk = (q, cx) => {
      const sg = Math.sign(cx);
      q.fillRect(cx - s * .9, y0 - s * .05, s * 1.8, s * .14); q.fillRect(cx - s * .8, y0 - s * .9, s * .12, s * .9); q.fillRect(cx + s * .68, y0 - s * .9, s * .12, s * .9);
      const f = s * 2.1; q.save(); q.translate(cx + sg * s * .95, y0 - s * .55); q.scale(-sg * f, f); POSES.sit.draw(q); q.restore();
      q.beginPath(); q.ellipse(cx - sg * s * .4, y0 + s * .14, s * .2, s * .08, 0, 0, TAU); q.fill();
    };
    const m = lay(S, { w: .3, h: .2, y: y0, z, col, trans: .35, ppm: 2600, shadow: false, finish: { rim: .45 }, draw: q => { q.translate(0, -y0); desk(q, -dx); desk(q, dx); },
      glowDraw: q => { q.translate(0, -y0); q.fillStyle = '#fff'; for (const cx of [-dx, dx]) { q.beginPath(); q.ellipse(cx - Math.sign(cx) * s * .4, y0 + s * .36, s * .09, s * .16, 0, 0, TAU); q.fill(); } }, glow: 3.2 - i * .4, glowCol: mixHex('#ffbe72', '#e8c890', i / 4) });
    rows.push(m);
  }
  ground(S, { z: -.1, col: '#0d1636', base: -.032, amp: .0008, len: .3, tr: .1 });
  const desk = lay(S, { w: .5, h: .3, y: -.2, z: -.062, col: '#0b0c16', trans: .03, ppm: 2000, finish: { rim: .7, rimPx: 5 }, draw: q => { q.translate(0, .2); q.fillRect(-.25, -.3, .5, .2555); q.fillRect(-.26, -.0475, .52, .0035); } });
  const scribe = human(S.U, { h: .088, z: -.072, pose: 'sit', col: '#05081a', rim: .6 }); S.scene.add(scribe.g);
  const lamp = oilLamp(S.U, { s: .026, z: -.0605, col: '#2a2018' }); lamp.g.position.set(.026, -.0425, -.0605); S.scene.add(lamp.g);
  const sw = .05, sh = .02;
  const leaf = lay(S, { w: sw + .01, h: sh + .008, x: -.006, y: -.0455 + sh / 2 + .002, z: -.0612, col: '#dccca2', trans: .9, shadow: false, ppm: 9000, finish: { rim: .4, under: .3 }, draw: q => {
    q.fillRect(-sw / 2, -sh / 2, sw, sh); for (const s of [-1, 1]) { q.beginPath(); q.roundRect(s * sw / 2 - .0024, -sh * .62, .0048, sh * 1.24, .0018); q.fill(); }
    cut(q, () => strokes(q, -sw / 2 + .004, sw / 2 - .004, -sh / 2 + .002, sh / 2 - .002, .0024, 9, .00045));
  } });
  lay(S, { w: .012, h: .012, x: -.072, y: -.0455 + .0045, z: -.061, col: '#0a0a12', trans: .1, shadow: false, ppm: 9000, finish: { rim: .6 }, draw: q => { q.beginPath(); q.ellipse(0, -.001, .004, .0035, 0, 0, TAU); q.fill(); q.fillRect(-.002, .0015, .004, .002); } });
  const reed = lay(S, { w: .004, h: .03, ax: 0, ay: -.014, z: -.0608, col: '#0d0d16', trans: .1, shadow: false, recv: false, ppm: 9000, finish: { rim: .5 }, draw: q => { q.beginPath(); q.moveTo(-.0005, -.014); q.lineTo(.0006, -.0136); q.lineTo(.0006, .014); q.lineTo(-.0006, .014); q.closePath(); q.fill(); } });
  const pose = (t, rx = .02, amp = .0012) => {
    scribe.set({ x: .056, y: -.08, a: .95 + bob(t, 2.2, .06) }); scribe.g.scale.x = -1;
    reed.position.set(rx + bob(t, 2.2, amp), -.0315 + Math.abs(bob(t, 4.4, .0006)), -.0608); reed.rotation.z = .55;
  };
  return { rows, desk, scribe, lamp, leaf, reed, pose };
}

// S1 the scribe's desk at night; the far lamps come on one by one, deeper and deeper. The title strip. Clawd on the desk.
export function S1(E) {
  const { H } = E;
  const S = stage({ light: [.035, -.02, -.1], lightR: .07, lightCol: '#ffbe72', key: .45, keyCol: '#c8d4ff', amb: .16, ambCol: '#5a6ca8', floor: .12 });
  const R = scribeRoom(S);
  const C = clawd(S.U, { u: .0025, z: -.058, glow: .5 }); S.scene.add(C.g);
  const title = lay(S, { w: .126, h: .066, y: .088, z: -.03, col: '#e7d4a8', trans: .35, shadow: false, recv: false, finish: { rim: .3, under: .2 }, draw: x => {
    x.beginPath(); x.roundRect(-.061, -.031, .122, .062, .002); x.fill();
    cut(x, () => { text(x, '5 DATOS', 0, .0128, .0162, 'Cinzel', { weight: 800, fill: '#000' }); text(x, 'DE LA BIBLIA', 0, -.0036, .0108, 'Cinzel', { weight: 800, fill: '#000' });
      text(x, 'Daniel 2 · Salmo 119 · Juan 11', 0, -.0196, .0074, 'Playfair', { weight: 'italic 500', fill: '#000' }); });
  }, glowDraw: x => { x.fillStyle = '#fff'; x.fillRect(-.063, -.033, .126, .066); }, glow: .55, glowCol: '#e7d4a8', glowRes: .2 });
  const on = [.5, .95, 1.4, 1.85, 2.35];
  return { S, update(t) {
    const k = eio(seg(t, 0, E.T0 + E.dur + .6));
    const z = lerp(.44, .62, k), cy = lerp(-.02, -.006, k), cx = lerp(-.016, 0, k);
    aim(S.cam, [cx, cy, z, cx, cy + .004, -.08], t, { hand: .0004 });
    R.rows.forEach((m, i) => { m.material.userData.u.uGlowLit.value = ss(seg(t, on[i], on[i] + .25)) * (1 + bob(t, 9 + i, .06)); });
    R.lamp.set(1, t); R.pose(t);
    setL(S, .04, -.022, .085 + bob(t, 11, .003), 1.35 + bob(t, 13, .08));
    const q = ss(seg(t, H.pregunta - .2, H.pregunta + .3));
    C.set({ x: -.047, y: -.044, look: lerp(.2, 1, q), lookY: lerp(0, .7, q), blink: blinkAt(t, .4), aR: .5 * ss(seg(t, 1.0, 1.4)) * (1 - ss(seg(t, 2.4, 2.8))), k: 1.1 });
    const reveal = ss(seg(t, .15, .6)) * (1 - ss(seg(t, 3.2, 3.6)));
    const cz = S.cam.position.z + .03, ts = cz / .55; title.scale.setScalar(ts); title.position.x = S.cam.position.x; title.position.y = S.cam.position.y + .4617 * cz / 2 * .64;
    clip(title, title.position.x, title.position.y + .033 * ts, .105 * reveal * ts); title.visible = reveal > .002;
    this._f = fsOf(S, -.06);
  }, post() { return { focus: this._f, aper: 8, maxCoc: 6, bloom: blo(.45, 1.0) }; }, grade() { return { vig: .5, sat: 1.04 }; } };
}

// S2 a thousand five hundred years in one sweep (no line of its own): a shepherd with his flock, a king under a canopy, fishers in a boat; night turns to dawn
export function S2(E) {
  const S = stage({ light: [0, .06, -.1], lightR: .3, lightCol: '#ffd59a', key: .9, keyCol: '#dfe2ff', amb: .3, ambCol: '#7a7aa8', floor: .35 });
  S.add(skyPanel({ w: 1.6, h: 1, z: -.17, stops: [[0, '#060c26'], [.6, '#0c1634'], [1, '#1c2450']], stars: 140, starMinY: -.02 }));
  const dawn = fadeSky(S, [[0, '#1d2350'], [.45, '#3a3f6e'], [.7, '#7a6a8a'], [1, '#d6a88a']], -.168, { w: 1.6, h: 1 });
  const sun = moon({ r: .008, x: -.2, y: -.02, z: -.165, gain: 1.6, core: '#fff1c9', mid: '#ffd59a', edge: '#ffb070', halo: 8, haloGain: .5 }); S.scene.add(sun);
  ground(S, { z: -.14, col: '#2a3870', base: -.026, amp: .008, len: .25, ph: 1, tr: .5, w: 1.6 });
  ground(S, { z: -.12, col: '#1e2850', base: -.036, amp: .008, len: .18, ph: 3, tr: .3, w: 1.6 });
  const fig = '#080a16';
  lay(S, { w: 1.4, h: .3, y: -.18, z: -.095, col: '#121630', trans: .06, ppm: 1600, finish: { rim: .55 }, draw: q => { q.translate(0, .18); q.beginPath(); q.moveTo(-.7, -.3);
    for (let u = -.7; u <= .065; u += .004) q.lineTo(u, -.034 + .008 * Math.exp(-((u + .11) ** 2) / .002) + .0015 * Math.sin(u * 60)); q.lineTo(.065, -.3); q.closePath(); q.fill(); } });
  lay(S, { w: .6, h: .3, x: .36, y: -.18, z: -.098, col: '#2c3a6a', trans: .45, ppm: 1600, finish: { rim: .6 }, draw: q => { q.translate(0, .18); waveFill(q, { x0: -.3, x1: .3, base: -.042, amp: .003, len: .03, ph: 0 }); } });
  const shep = human(S.U, { h: .052, z: -.092, col: fig, rim: .7 }); S.scene.add(shep.g); shep.set({ x: -.115, y: -.027, a: .5 });
  lay(S, { w: .008, h: .07, x: -.101, y: -.027 + .033, z: -.0915, col: fig, trans: .05, shadow: false, ppm: 6000, draw: q => { q.fillRect(-.0007, -.035, .0014, .066); q.lineWidth = .0014; q.beginPath(); q.arc(-.003, .031, .003, 0, Math.PI); q.stroke(); } });
  [[-.142, .009], [-.13, .008], [-.088, .0085], [-.077, .007]].forEach(([x, s]) => { const m = sheep(S.U, { s, z: -.0925, col: fig }); m.position.x = x; m.position.y += -.033 + .008 * Math.exp(-((x + .11) ** 2) / .002); S.add(m); });
  lay(S, { w: .06, h: .08, x: 0, y: -.002, z: -.0935, col: fig, trans: .05, ppm: 5000, finish: { rim: .65 }, draw: q => {
    q.fillRect(-.024, -.032, .048, .006); q.fillRect(-.021, -.032, .004, .065); q.fillRect(.017, -.032, .004, .065);
    q.beginPath(); q.moveTo(-.028, .033); q.quadraticCurveTo(0, .045, .028, .033); q.lineTo(.024, .028); q.quadraticCurveTo(0, .036, -.024, .028); q.closePath(); q.fill();
    q.fillRect(.004, -.044, .012, .004); q.fillRect(-.008, -.044, .004, .012); } });
  const king = human(S.U, { h: .05, z: -.093, col: fig, pose: 'sit', crown: true, rim: .7 }); S.scene.add(king.g); king.set({ x: -.004, y: -.03, a: .4 });
  const boat = ship(S.U, { L: .06, z: -.0985, col: fig, furled: true }); boat.g.position.set(.115, -.046, -.0985); S.scene.add(boat.g); boat.mast.visible = false; boat.sail.visible = false;
  const f1 = human(S.U, { h: .032, col: fig }); boat.g.add(f1.g); f1.g.position.z = -.0015;
  const f2 = human(S.U, { h: .03, col: fig, pose: 'kneel' }); boat.g.add(f2.g); f2.g.position.z = -.0016;
  ground(S, { z: -.048, col: '#05070f', base: -.06, amp: .003, len: .2, ph: 2, tr: .02, w: 1.6 });
  const u = .002, C = clawd(S.U, { u, z: -.05, glow: .5 }); S.scene.add(C.g);
  const roll = scrollRoll(S.U, { len: 14 * u, r: u * 1.3, col: '#d9c9a0' }); roll.position.set(-.001, 11.2 * u, -.002); roll.rotation.z = .35; C.g.add(roll);
  return { S, update(t) {
    const k = seg(t, E.T0 - .1, E.T0 + E.dur + .6), x = lerp(-.125, .125, eio(k) * .4 + k * .6);
    aim(S.cam, [x, -.006, .6, x, -.002, -.08], t, { hand: .0004 });
    const d = ss(seg(k, .1, .9)); dawn.material.opacity = d;
    sun.position.set(x + lerp(-.07, .06, k), lerp(-.03, .06, d), -.165);
    setL(S, x + lerp(-.06, .06, k), lerp(-.02, .06, d), .3, lerp(.6, 1.25, d), mixHex('#a8b4e0', '#ffd59a', d));
    S.amb.intensity = lerp(.18, .38, d);
    const w = t * 9;
    C.set({ x: x - .022, y: -.0578 + Math.abs(Math.sin(w)) * .0012, walk: w, stride: .35, look: .7, aR: 2.0, aL: .25 + bob(t, 9, .1), k: 1.05 });
    f1.set({ x: .006, y: 0, a: 1.7 + bob(t, 2.4, .25) }); f2.set({ x: -.014, y: 0, a: 1.2 + bob(t, 2.4, .2, 1) });
    boat.g.rotation.z = bob(t, 1.6, .04); boat.g.position.y = -.036 + bob(t, 1.3, .0008); boat.g.position.x = .115;
    this._f = fsOf(S, -.05);
  }, post() { return { focus: this._f, aper: 4, maxCoc: 4, bloom: blo(.32, 1.1) }; }, grade() { return { vig: .42 }; } };
}

// S3 Hebrew: back at the desk, closer; the written leaf glows with the lamp behind it; Clawd peeks over its edge; focus racks to the leaf
export function S3(E) {
  const { H } = E;
  const S = stage({ light: [.02, -.025, -.1], lightR: .06, lightCol: '#ffbe72', key: .5, keyCol: '#c8d4ff', amb: .16, ambCol: '#5a6ca8', floor: .12 });
  const R = scribeRoom(S);
  R.rows.forEach(m => { m.material.userData.u.uGlowLit.value = 1; });
  const C = clawd(S.U, { u: .0027, z: -.05, glow: .5 }); S.scene.add(C.g);
  return { S, update(t) {
    const k = eio(seg(t, E.T0, E.T0 + E.dur + .6)), cx = lerp(-.012, -.014, k);
    aim(S.cam, [cx, -.03, lerp(.27, .245, k), cx, -.026, -.08], t, { hand: .0003 });
    R.lamp.set(1, t); R.pose(t, .006, .006);
    setL(S, .03, -.028, .06 + bob(t, 11, .003), 1.5 + bob(t, 13, .08));
    C.set({ x: -.032, y: -.044, look: .9, lookY: -.2, blink: blinkAt(t, 1.1), aL: 0, aR: 0, k: 1.05 });
    this._f = lerp(fsOf(S, -.05), fsOf(S, -.0612), ss(seg(t, H.hebreo - .4, H.hebreo + .2)));
  }, post() { return { focus: this._f, aper: 16, maxCoc: 8, bloom: blo(.45, 1.0) }; }, grade() { return { vig: .5, sat: 1.04 }; } };
}

// S4 Babylon at night: arches and stepped battlements in violet, braziers, the king seated, the wise men before him; tilt down a huge column
export function S4(E) {
  const { H } = E;
  const S = stage({ light: [.04, -.01, -.1], lightR: .16, lightCol: '#ffb35e', key: .8, keyCol: '#c9b8ff', amb: .34, ambCol: '#6a5aa8', floor: .2 });
  S.add(skyPanel({ w: 1, h: 1.2, y: .1, z: -.17, stops: [[0, '#0a0820'], [.6, '#15102e'], [1, '#2a1f50']], stars: 90, starMinY: .04 }));
  lay(S, { w: .6, h: .5, y: .07, z: -.145, col: '#3a2c62', trans: .45, ppm: 1800, finish: { rim: .5 }, draw: q => {
    q.fillRect(-.3, -.25, .6, .4); for (let i = -10; i <= 10; i++) { const cx = i * .028; q.fillRect(cx - .008, .15, .016, .008); q.fillRect(cx - .005, .158, .01, .007); q.fillRect(cx - .0025, .165, .005, .006); }
    cut(q, () => { for (let i = -5; i <= 5; i++) { const cx = i * .05; q.beginPath(); q.moveTo(cx - .014, -.06); q.lineTo(cx - .014, .06); q.arc(cx, .06, .014, Math.PI, 0, true); q.lineTo(cx + .014, -.06); q.closePath(); q.fill(); } });
  } });
  for (const cx of [-.05, .075]) { const c = column(S.U, { h: .2, w: .013, z: -.118, col: '#55427e', trans: .35 }); c.position.x = cx; c.position.y += -.04; S.add(c); }
  ground(S, { z: -.112, col: '#241a40', base: -.04, amp: .0005, len: .3, tr: .15, w: .6 });
  const fig = '#0b0816';
  lay(S, { w: .04, h: .06, x: .045, y: -.022, z: -.1015, col: fig, trans: .05, ppm: 6000, finish: { rim: .6 }, draw: q => { q.fillRect(-.012, -.018, .028, .006); q.fillRect(.011, -.018, .005, .045); q.fillRect(-.016, -.024, .034, .006); } });
  const king = human(S.U, { h: .052, z: -.1, col: fig, pose: 'sit', crown: true, rim: .7 }); S.scene.add(king.g);
  const wise = [human(S.U, { h: .056, z: -.101, col: fig, rim: .7 }), human(S.U, { h: .058, z: -.1012, col: fig, rim: .7 }), human(S.U, { h: .054, z: -.1014, col: fig, rim: .7 })];
  wise.forEach(w => S.scene.add(w.g));
  const fires = [];
  for (const cx of [-.02, .085]) { const st = column(S.U, { h: .022, w: .005, z: -.104, col: fig, trans: .1 }); st.position.x = cx; st.position.y += -.04; S.add(st); const f = fire(S.U, { s: .012, z: -.1035, col: '#ffb35e', glow: 2.6 }); f.g.position.set(cx, -.018, -.1035); S.scene.add(f.g); fires.push(f); }
  lay(S, { w: .05, h: .6, x: -.064, y: .22, z: -.062, col: '#0b0816', trans: .03, ppm: 2400, finish: { rim: .7, rimPx: 5 }, draw: q => {
    q.translate(0, -.22); q.fillRect(-.016, -.08, .032, .012); q.fillRect(-.012, -.07, .024, .56); q.fillRect(-.02, .16, .04, .012); q.fillRect(-.017, .172, .034, .008);
    cut(q, () => { for (const f of [-.005, .005]) q.fillRect(f - .0012, -.05, .0024, .2); }); } });
  ground(S, { z: -.055, col: '#07050f', base: -.058, amp: .0015, len: .3, tr: .02, w: .6 });
  const C = clawd(S.U, { u: .0024, z: -.057, glow: .55 }); S.scene.add(C.g);
  return { S, update(t) {
    const tl = ss(seg(t, E.T0 + .1, E.T0 + 1.4));
    aim(S.cam, [.008, lerp(-.024, .0, tl), lerp(.56, .64, tl), .008, lerp(.016, .004, tl), -.08], t, { hand: .0005 });
    king.set({ x: .052, y: -.04, a: .35 }); king.g.scale.x = -1;
    wise[0].set({ x: .005, y: -.04, rot: -.32, a: .9 + bob(t, 3, .08) }); wise[1].set({ x: -.012, y: -.04, a: .2 }); wise[2].set({ x: -.03, y: -.04, a: .15 });
    fires.forEach((f, i) => f.set(1, t + i * 1.7));
    setL(S, .03 + bob(t, 7, .002), -.015, .14, 1.05 + bob(t, 9, .06));
    const up = 1 - ss(seg(t, H.arameo + .9, H.arameo + 1.5));
    C.set({ x: -.036, y: -.0565, look: lerp(.9, -.2, up), lookY: up, blink: blinkAt(t, .7), k: 1.05 });
    this._f = fsOf(S, -.08);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(.42, 1.0) }; }, grade() { return { vig: .5, sat: 1.02 }; } };
}

// S5 the shore of Galilee at first light: a boat with two fishers drawing the net; a paper wave reaches Clawd's feet and he steps back
export function S5(E) {
  const S = stage({ light: [.0, .015, -.1], lightR: .2, lightCol: '#ffd9a0', key: .95, keyCol: '#ffe8d0', amb: .32, ambCol: '#8a9ab8', floor: .4 });
  S.add(skyPanel({ w: 1, h: 1, y: .1, z: -.17, stops: [[0, '#26394e'], [.45, '#3e5672'], [.7, '#5f7a96'], [.86, '#c7b8a0'], [1, '#e9d6aa']] }));
  const glow = burst(.3, .14, '#ffd59a'); glow.position.set(.02, .008, -.16); glow.userData.set(.5); S.add(glow);
  ground(S, { z: -.145, col: '#4a5e7c', base: .014, amp: .01, len: .22, ph: 1, tr: .5, w: .8 });
  ground(S, { z: -.13, col: '#5a7090', base: .004, amp: .0008, len: .05, ph: 2, tr: .6, w: .8 });
  const fig = '#070d16';
  const boat = ship(S.U, { L: .07, z: -.112, col: fig, furled: true }); boat.g.position.set(.035, -.006, -.112); S.scene.add(boat.g); boat.sail.visible = false;
  const f1 = human(S.U, { h: .034, col: fig }); boat.g.add(f1.g); f1.g.position.z = -.0015;
  const f2 = human(S.U, { h: .032, col: fig }); boat.g.add(f2.g); f2.g.position.z = -.0016;
  const net = mk(S.U, { w: .03, h: .03, x: .036, y: -.008, z: .001, col: '#1c2a3c', trans: .2, shadow: false, ppm: 9000, finish: { rim: .4 }, draw: q => {
    q.lineWidth = .0005; for (let i = 0; i <= 6; i++) { q.beginPath(); q.moveTo(-.012 + i * .004, .012); q.lineTo(-.006 + i * .002, -.012); q.stroke(); }
    for (let j = 0; j <= 6; j++) { const y = .012 - j * .004, hh = j / 6; q.beginPath(); q.moveTo(-.012 + .006 * hh, y); q.lineTo(.012 - .006 * hh, y); q.stroke(); } } });
  boat.g.add(net);
  const w1 = ground(S, { z: -.105, col: '#3a5070', base: -.014, amp: .0025, len: .05, ph: 1, tr: .4, w: .8 });
  const w2 = ground(S, { z: -.085, col: '#26394e', base: -.032, amp: .003, len: .07, ph: 2.5, tr: .25, w: .8 });
  const foam = ground(S, { z: -.0625, col: '#9fb4cc', base: -.052, amp: .0018, len: .04, ph: 0, tr: .7, w: .4, shadow: false }), fy = foam.position.y;
  lay(S, { w: .8, h: .3, y: -.2, z: -.058, col: '#070d16', trans: .02, ppm: 1800, finish: { rim: .6 }, draw: q => { q.translate(0, .2); q.beginPath(); q.moveTo(-.4, -.3);
    const Rr = mulberry(4); let u = -.4; while (u < .4) { const w = .006 + Rr() * .014, hh = .002 + Rr() * .004; q.lineTo(u, -.058); q.quadraticCurveTo(u + w / 2, -.058 + hh * 2, u + w, -.058); u += w; } q.lineTo(.4, -.3); q.closePath(); q.fill(); } });
  const C = clawd(S.U, { u: .0024, z: -.056, glow: .55 }); S.scene.add(C.g);
  return { S, update(t) {
    const k = eio(seg(t, E.T0, E.T0 + E.dur + .6)), x = lerp(-.008, .01, k);
    aim(S.cam, [x, .0, .6, x, .002, -.08], t, { hand: .0004 });
    w1.position.x = bob(t, .9, .006); w2.position.x = bob(t, 1.1, .008, 1);
    const wv = Math.sin(clamp((t - E.T0 - .5) / 1.6) * Math.PI);
    foam.position.x = lerp(.06, -.03, wv); foam.position.y = fy + lerp(-.004, .0022, wv);
    boat.g.rotation.z = bob(t, 1.2, .03); boat.g.position.y = -.006 + bob(t, 1.0, .0008);
    const pull = Math.max(0, Math.sin(t * 2.6));
    f1.set({ x: .012, y: 0, rot: -.15 * pull, a: lerp(1.2, 2.0, pull) }); f2.set({ x: -.01, y: 0, a: .4 }); f2.g.scale.x = -1;
    net.position.y = -.008 + pull * .003;
    setL(S, .02, .012, .2, 1.15);
    const back = ss(seg(t, E.T0 + 1.0, E.T0 + 1.3));
    C.set({ x: -.03 - back * .005, y: -.0575 + Math.sin(back * Math.PI) * .0015, look: .9, lookY: .1, blink: blinkAt(t, .2), walk: back * 3, stride: .3 * Math.sin(back * Math.PI), k: 1 });
    this._f = fsOf(S, -.09);
  }, post() { return { focus: this._f, aper: 5, maxCoc: 5, bloom: blo(.32, 1.1) }; }, grade() { return { vig: .38, gain: [1.04, 1, .95] }; } };
}

// S6 the text is divided: the camera travels along a long scroll on the table; light cuts it first into wide chapters, then fine verses; Clawd walks and stops to look
export function S6(E) {
  const { H } = E;
  const S = stage({ light: [0, .02, -.1], lightR: .1, lightCol: '#ffd88a', key: .9, keyCol: '#ffe8c8', amb: .3, ambCol: '#a08a6a', floor: .35 });
  S.add(skyPanel({ w: 1.6, h: 1, z: -.17, stops: [[0, '#2a1d0e'], [.5, '#3a2a18'], [1, '#2a1d0e']] }));
  lay(S, { w: 1.4, h: .2, y: .02, z: -.14, col: '#4a3520', trans: .3, ppm: 1400, finish: { rim: .3 }, draw: q => { q.fillRect(-.7, -.1, 1.4, .2); cut(q, () => { for (let i = -20; i < 20; i++) q.fillRect(i * .035, -.1, .0008, .2); }); } });
  const SW = 1.2, SH = .1, sy = .012;
  lay(S, { w: SW, h: SH + .02, x: .2, y: sy, z: -.1, col: '#efe0b8', trans: .95, ppm: 2400, finish: { rim: .45, under: .35 }, draw: q => {
    q.fillRect(-SW / 2, -SH / 2, SW, SH); cut(q, () => strokes(q, -SW / 2, SW / 2, -SH / 2 + .006, SH / 2 - .006, .0052, 21, .0011)); } });
  const bands = (w, gap, x0) => mk(S.U, { w: SW, h: SH, x: .2, y: sy, z: -.0985, col: '#fff2cc', trans: .9, shadow: false, recv: false, ppm: 2400, finish: { rim: 0, under: 0 },
    draw: q => { for (let u = -SW / 2 + x0; u < SW / 2; u += gap) q.fillRect(u - w / 2, -SH / 2, w, SH); },
    glowDraw: q => { q.fillStyle = '#fff'; for (let u = -SW / 2 + x0; u < SW / 2; u += gap) q.fillRect(u - w / 2, -SH / 2, w, SH); }, glow: 2.2, glowCol: '#ffd88a' });
  const chap = bands(.0042, .046, .01), vers = bands(.0011, .0092, .004); S.add(chap, vers);
  lay(S, { w: 1.6, h: .3, y: -.2, z: -.06, col: '#120c06', trans: .03, ppm: 1600, finish: { rim: .7, rimPx: 5 }, draw: q => { q.translate(0, .2); q.fillRect(-.8, -.3, 1.6, .248); q.fillRect(-.8, -.052, 1.6, .003); } });
  const C = clawd(S.U, { u: .0026, z: -.058, glow: .55 }); S.scene.add(C.g);
  const x0 = -.06, x1 = .16, CXF = -.7;
  return { S, update(t) {
    const k = eio(seg(t, E.T0, E.T0 + E.dur + .6)), x = lerp(x0, x1, k);
    aim(S.cam, [x, -.012, .46, x, -.006, -.08], t, { hand: .0004, roll: lerp(-.035, .02, k) });
    const fc = x + lerp(-.09, .12, ss(seg(t, H.capitulos - .1, H.capitulos + 1.4))), fv = x + lerp(-.09, .12, ss(seg(t, H.versiculos - .1, H.versiculos + 1.4)));
    clip(chap, CXF, sy, t > H.capitulos - .1 ? fc - CXF : 0); clip(vers, CXF, sy, t > H.versiculos - .1 ? fv - CXF : 0);
    chap.material.userData.u.uGlowLit.value = 1 - .35 * ss(seg(t, H.versiculos, H.versiculos + 1)); vers.material.userData.u.uGlowLit.value = 1;
    const stop = (h, a, b) => ss(seg(t, h + a, h + a + .3)) * (1 - ss(seg(t, h + b, h + b + .3)));
    const walking = 1 - stop(H.capitulos, .5, 1.6) - stop(H.versiculos, .5, 1.5), w = t * 8;
    C.set({ x: x - .03, y: -.0485 + Math.abs(Math.sin(w)) * .0011 * walking, walk: w, stride: .35 * walking, look: walking > .5 ? .8 : -.5, lookY: walking > .5 ? .3 : .9, blink: blinkAt(t, .9), k: 1 });
    setL(S, x, sy, .12, 1.15);
    this._f = fsOf(S, -.08);
  }, post() { return { focus: this._f, aper: 5, maxCoc: 5, bloom: blo(.4, 1.0) }; }, grade() { return { vig: .45, sat: 1.02 }; } };
}

// —— the standing scroll (Psalm 119): a translucent leaf that unrolls upward past the top of the frame ——
function tallScroll(S) {
  S.add(skyPanel({ w: 1.2, h: 1.6, y: .3, z: -.17, stops: [[0, '#3a2a14'], [.4, '#6a5028'], [.75, '#9c7c44'], [1, '#c9ad72']] }));
  ground(S, { z: -.14, col: '#7a6436', base: -.03, amp: .008, len: .22, ph: 1, tr: .5, w: 1 });
  ground(S, { z: -.12, col: '#4a3a1e', base: -.045, amp: .004, len: .2, ph: 3, tr: .3, w: 1 });
  const W = .07, HH = .8, y0 = -.05;
  const leaf = lay(S, { w: W + .004, h: HH, x: 0, y: y0 + HH / 2, z: -.1, col: '#f3e6c2', trans: .95, shadow: false, ppm: 2600, finish: { rim: .45, under: .3 }, draw: q => {
    q.fillRect(-W / 2, -HH / 2, W, HH); cut(q, () => strokes(q, -W / 2 + .006, W / 2 - .006, -HH / 2 + .004, HH / 2, .0042, 31, .0009)); } });
  const top = scrollRoll(S.U, { len: W + .008, r: .004, col: '#c9ad72', z: -.0985 }); S.add(top);
  const bot = scrollRoll(S.U, { len: W + .008, r: .0045, col: '#b39558', z: -.0985 }); bot.position.set(0, y0 + .002, -.0985); S.add(bot);
  ground(S, { z: -.055, col: '#1a1409', base: -.06, amp: .0015, len: .3, ph: 2, tr: .02, w: 1 });
  const setTop = y => { clip(leaf, 0, -3, 3 + y); top.position.set(0, y, -.0985); };
  return { leaf, top, bot, setTop };
}
// S7 Psalm 119: the scroll rises taller than a tower; tilt up with it, then back down to a tiny Clawd with his arms up
export function S7(E) {
  const { H } = E;
  const S = stage({ light: [0, .05, -.1], lightR: .22, lightCol: '#ffd88a', key: .9, keyCol: '#ffe8c8', amb: .3, ambCol: '#a08a6a', floor: .35 });
  const T = tallScroll(S);
  const C = clawd(S.U, { u: .002, z: -.057, glow: .6 }); S.scene.add(C.g);
  return { S, update(t) {
    const y = lerp(-.02, .62, eio(seg(t, E.T0 + .2, H.s176 + .3)));
    T.setTop(y);
    const up = ss(seg(t, E.T0 + .6, H.s176 - .8)), down = ss(seg(t, H.s176 + .1, H.s176 + 1.3)), tilt = up * (1 - down);
    const ly = lerp(-.004, .02, tilt);
    aim(S.cam, [-.004, lerp(-.006, .0, tilt), lerp(.52, .8, tilt) - down * .02, -.004, ly, -.08], t, { hand: .0004 });
    setL(S, 0, Math.min(y, ly + .05), .25, 1.3);
    const arms = ss(seg(t, H.s176, H.s176 + .5));
    C.set({ x: -.044, y: -.0598, look: .6, lookY: lerp(.3, 1, up), aL: 2.3 * arms, aR: 2.3 * arms, blink: blinkAt(t, .3), k: 1.1 });
    this._f = fsOf(S, -.08);
  }, post() { return { focus: this._f, aper: 5, maxCoc: 5, bloom: blo(.4, 1.0) }; }, grade() { return { vig: .45, sat: 1.02 }; } };
}

// S8 Psalm 117: in the same place Clawd lifts a scroll the size of a leaf; then (l13 and silence 1) the giant scroll's light goes out from the top down
export function S8(E) {
  const { H } = E;
  const S = stage({ light: [0, .05, -.1], lightR: .25, lightCol: '#ffd88a', key: 1.0, keyCol: '#ffe8c8', amb: .3, ambCol: '#a08a6a', floor: .35 });
  const T = tallScroll(S); T.setTop(.62);
  const u = .003;
  const C = clawd(S.U, { u, z: -.05, glow: .55 }); S.scene.add(C.g);
  const small = scrollRoll(S.U, { len: 15 * u, r: u * .75, col: '#efe0b8' }); small.position.z = .002; C.g.add(small);
  return { S, update(t) {
    const k = eio(seg(t, E.T0, E.T0 + 3.5));
    aim(S.cam, [lerp(-.004, 0, k), -.03, lerp(.4, .36, k), lerp(-.004, 0, k), -.027, -.08], t, { hand: .0003 });
    const lift = ss(seg(t, E.T0 + .25, E.T0 + 1.0)), lower = ss(seg(t, H.silencio1 - .1, H.silencio1 + .9));
    small.position.y = lerp(.6 * u, 4.3 * u, lift) - lower * 2.0 * u;
    const off = ss(seg(t, H.l13 + .2, H.silencio1 + .7));
    setL(S, 0, lerp(.12, -.07, off), lerp(.25, .08, off), lerp(1.3, .1, off));
    S.key.intensity = lerp(1.0, .18, off); S.amb.intensity = lerp(.3, .06, off); this._off = off;
    const blinkDos = 1 - .9 * Math.max(0, 1 - Math.abs(t - H.dos - .1) / .12);
    C.set({ x: 0, y: -.0598, aL: lerp(-.5, .15, lift) - lower * .3, aR: lerp(-.5, .15, lift) - lower * .3, look: lerp(0, -.1, lift), lookY: lerp(-.6, -.3, lift),
      blink: Math.min(blinkAt(t, .5), blinkDos), tuck: (1 - lift) * .25, k: lerp(1, .9, off) });
    this._f = lerp(fsOf(S, -.1), fsOf(S, -.05), ss(seg(t, E.T0 + .3, E.T0 + 1.3)));
  }, post() { return { focus: this._f, aper: 14, maxCoc: 9, bloom: blo(.38, 1.0) }; }, grade() { return { vig: lerp(.45, .65, this._off), expo: lerp(1, .55, this._off) }; } };
}

// —— Bethany: a slope of rock with the tomb (three layers split at the mouth, so they can part), the stone, the near ground ——
function bethany(S, o = {}) {
  const pal = o.gold ? { sky: [[0, '#f0d090'], [.5, '#fbe6b8'], [1, '#fff3d0']], far: '#efcd84', mid: '#8c7446', rock: '#a08454', front: '#1a1408' }
    : { sky: [[0, '#56607a'], [.55, '#7d8a9e'], [1, '#9aa4b6']], far: '#5e6b82', mid: '#333d50', rock: '#7a7e8c', front: '#0b0e16' };
  S.add(skyPanel({ w: 1.2, h: 1, y: .1, z: -.17, stops: pal.sky }));
  ground(S, { z: -.15, col: pal.far, base: -.002, amp: .01, len: .25, ph: 2, tr: .5, w: 1 });
  const CX = .045, CY = -.047;   // cave mouth: bottom centre
  const mouth = q => { q.beginPath(); q.moveTo(CX - .018, CY - .004); q.lineTo(CX - .018, CY + .024); q.quadraticCurveTo(CX - .017, CY + .044, CX, CY + .046); q.quadraticCurveTo(CX + .017, CY + .044, CX + .018, CY + .024); q.lineTo(CX + .018, CY - .004); q.closePath(); q.fill(); };
  const dark = lay(S, { w: .06, h: .07, x: CX, y: CY + .025, z: -.128, col: '#010102', trans: 0, shadow: false, ppm: 4000, finish: { rim: 0, under: 0 }, draw: q => { q.translate(-CX, -CY - .025); mouth(q); } });
  const slope = (z, col, tr, lift, grow, ph) => ['L', 'R'].map(side => mk(S.U, { w: .5, h: .5, z, col, trans: tr, ppm: 1700, finish: { rim: .55, rimPx: 4, under: .4 }, draw: q => {
    q.save(); q.beginPath(); if (side === 'L') q.rect(-.25, -.25, CX + .25, .5); else q.rect(CX, -.25, .25 - CX, .5); q.clip();
    q.beginPath(); q.moveTo(-.25, -.25); for (let u = -.25; u <= .25; u += .003) q.lineTo(u, lift + grow * Math.max(0, u - .0) * (1 + .5 * Math.max(0, u - .1)) + .003 * Math.sin(u * 70 + ph)); q.lineTo(.25, -.25); q.closePath(); q.fill();
    cut(q, () => { const s = 1 + (z + .13) * 8; q.translate(CX, CY); q.scale(s, s); q.translate(-CX, -CY); mouth(q); }); q.restore(); } }));
  const layers = [slope(-.126, mixHex(pal.rock, pal.far, .3), .3, -.022, .5, 1), slope(-.118, pal.rock, .15, -.03, .44, 2.3), slope(-.11, mixHex(pal.rock, pal.mid, .5), .06, -.036, .38, 4)];
  layers.forEach(([L, R]) => S.add(L, R));
  const parts = ks => layers.forEach(([L, R], i) => { const k = ks[i] ?? 0; L.position.x = -k; R.position.x = k; });
  const st = stone(S.U, { r: .025, z: -.106, col: mixHex(pal.rock, '#16171d', .7) }); st.position.set(CX, CY + .023, -.106); S.add(st);
  ground(S, { z: -.1, col: pal.mid, base: -.05, amp: .002, len: .25, ph: 1, tr: .15, w: 1 });
  ground(S, { z: -.052, col: pal.front, base: -.064, amp: .002, len: .3, ph: 3.2, tr: .02, w: 1 });
  return { dark, layers, parts, st, CX, CY, pal };
}
const FIG = '#080a12';

// S9 Bethany at dusk: Jesus stands, head bowed, a hand to his face; Martha and Mary kneel; Clawd stays still to one side, his glow lowered
export function S9(E) {
  const { H } = E;
  const S = stage({ light: [.02, .03, -.1], lightR: .22, lightCol: '#c8d0e0', key: 1.0, keyCol: '#d8e0f0', amb: .42, ambCol: '#7d8a9e', floor: .4 });
  bethany(S);
  const J = human(S.U, { h: .07, z: -.09, col: FIG, rim: .5 }); S.scene.add(J.g);
  const sisters = [human(S.U, { h: .058, z: -.094, col: FIG, pose: 'kneel', rim: .5 }), human(S.U, { h: .056, z: -.0942, col: FIG, pose: 'kneel', rim: .5 })];
  const jews = [human(S.U, { h: .05, z: -.104, col: '#20283a', rim: .4 }), human(S.U, { h: .052, z: -.1042, col: '#20283a', rim: .4 })];
  [...sisters, ...jews].forEach(p => S.scene.add(p.g));
  const C = clawd(S.U, { u: .0022, z: -.056, glow: .5 }); S.scene.add(C.g);
  return { S, update(t) {
    aim(S.cam, [-.004, -.02, .7, -.004, -.018, -.08], t, { hand: .00025 });
    J.set({ x: .006, y: -.05, rot: -.08, a: 2.5 }); J.arm.scale.y = .55;
    sisters[0].set({ x: -.02, y: -.05, rot: -.05, a: .5 }); sisters[1].set({ x: -.037, y: -.05, a: 2.4 }); sisters[1].arm.scale.y = .55;
    jews[0].set({ x: -.056, y: -.047, a: .1 }); jews[1].set({ x: -.066, y: -.047, a: .1 });
    const down = ss(seg(t, H.lloro - .5, H.lloro + .6)); this._d = down;
    setL(S, .02, .03, .22, lerp(1.0, .7, down)); S.key.intensity = lerp(1.0, .75, down); S.amb.intensity = lerp(.42, .34, down);
    C.set({ x: -.074, y: -.0625, look: .9, lookY: -.1, aL: 0, aR: 0, k: .5 });
    this._f = fsOf(S, -.09);
  }, post() { return { focus: this._f, aper: 5, maxCoc: 5, bloom: blo(.3, 1.15) }; }, grade() { return { vig: .5, sat: .82, expo: lerp(1, .88, this._d) }; } };
}

// S10 the stone is taken away: two men roll it aside and the mouth is black; Jesus stands, head raised. Silence 2: a near-still push in.
export function S10(E) {
  const { H } = E;
  const S = stage({ light: [.03, .03, -.1], lightR: .22, lightCol: '#c0c8dc', key: .85, keyCol: '#d8e0f0', amb: .36, ambCol: '#6d7a90', floor: .35 });
  const B = bethany(S);
  const J = human(S.U, { h: .07, z: -.09, col: FIG, rim: .5 }); S.scene.add(J.g);
  const men = [human(S.U, { h: .06, z: -.104, col: FIG, rim: .5 }), human(S.U, { h: .058, z: -.1045, col: FIG, rim: .5 })]; men.forEach(m => S.scene.add(m.g));
  const sisters = [human(S.U, { h: .058, z: -.094, col: FIG, pose: 'kneel', rim: .5 }), human(S.U, { h: .056, z: -.0942, col: FIG, pose: 'kneel', rim: .5 })]; sisters.forEach(m => S.scene.add(m.g));
  const C = clawd(S.U, { u: .0022, z: -.056, glow: .5 }); S.scene.add(C.g);
  return { S, update(t) {
    const out = eio(seg(t, E.T0, H.silencio2)), inn = ss(seg(t, H.silencio2, E.T0 + E.dur + .6));
    aim(S.cam, [-.002, lerp(-.02, -.016, out), lerp(.7, .8, out) - .03 * inn, -.002, lerp(-.018, -.012, out), -.08], t, { hand: .0002 });
    const r = eio(seg(t, H.piedra + .1, H.piedra + 1.6)), dx = r * .038, pull = r > 0 && r < 1 ? 1 : .3;
    B.st.position.x = B.CX + dx; B.st.rotation.z = -dx / .025;
    men[0].set({ x: B.CX + .034 + dx, y: -.048, rot: -.18 * pull, a: 1.5 }); men[0].g.scale.x = -1; men[1].set({ x: B.CX + .047 + dx, y: -.048, rot: -.14 * pull, a: 1.3 }); men[1].g.scale.x = -1;
    J.set({ x: .006, y: -.05, a: .15 });
    sisters[0].set({ x: -.02, y: -.05, a: .5 }); sisters[1].set({ x: -.037, y: -.05, a: .4 });
    setL(S, .03, .03, .22, .7);
    const step = ss(seg(t, H.piedra + .3, H.piedra + .8));
    C.set({ x: -.074 - step * .004, y: -.0625 + Math.sin(step * Math.PI) * .001, walk: step * 3, stride: .25 * Math.sin(step * Math.PI), look: .9, aL: 0, aR: 0, k: .5 });
    this._f = fsOf(S, -.095);
  }, post() { return { focus: this._f, aper: 5, maxCoc: 5, bloom: blo(.3, 1.15) }; }, grade() { return { vig: .55, sat: .8, expo: .88 }; } };
}

// Lazarus: a calm standing silhouette with pale strips of cloth at the hands and feet
function lazarus(S, { h = .062, z = -.12, col = '#0d0a06' } = {}) {
  const L = human(S.U, { h, z, col, rim: .8 }); S.scene.add(L.g);
  const P = POSES.stand, W = h * 1.1, H_ = h * 1.12;
  const wrap = mk(S.U, { w: W, h: H_, y: H_ / 2 - h * .03, z: .0004, col: '#e8dcc0', trans: .7, shadow: false, recv: false, finish: { rim: .3, under: .2 }, draw: q => {
    q.translate(0, -H_ / 2 + h * .03); q.scale(h, h); P.draw(q); q.globalCompositeOperation = 'destination-in';
    for (let y = .02; y < .3; y += .05) q.fillRect(-.3, y, .6, .028); for (let y = .36; y < .7; y += .09) q.fillRect(-.3, y, .6, .018); } });
  const hand = mk(S.U, { w: h * .1, h: h * .12, x: P.sh[0] * h, y: P.sh[1] * h - h * .34, z: .0008, col: '#e8dcc0', trans: .7, shadow: false, recv: false, finish: { rim: .3 }, draw: q => { q.fillRect(-h * .035, -h * .05, h * .07, h * .1); } });
  L.g.add(wrap, hand);
  return { ...L, meshes: [L.body, L.arm, wrap, hand] };
}

// S11 signature shot: "¡Lázaro, ven fuera!" The rock parts layer by layer, gold pours through the paper; on "salió" Lazarus stands in the mouth
export function S11(E) {
  const { H } = E;
  const S = stage({ light: [.05, -.02, -.1], lightR: .1, lightCol: '#ffe2a0', key: .85, keyCol: '#ffe8c8', amb: .36, ambCol: '#7d8a9e', floor: .3 });
  const B = bethany(S);
  const gold = skyPanel({ w: .6, h: .6, x: .05, y: .02, z: -.13, gain: 1, stops: [[0, '#fff3d0'], [.6, '#ffe2a0'], [1, '#efcd84']] }); gold.material.transparent = true; gold.material.opacity = 0; S.add(gold);
  const ray = burst(.22, .3, '#ffe2a0'); ray.position.set(B.CX, B.CY - .02, -.1); S.add(ray);
  B.st.position.x = B.CX + .038; B.st.rotation.z = -.038 / .025;
  const Lz = lazarus(S, { h: .04, z: -.12 });
  const J = human(S.U, { h: .07, z: -.09, col: FIG, rim: .6 }); S.scene.add(J.g);
  const C = clawd(S.U, { u: .0022, z: -.056, glow: .5 }); S.scene.add(C.g);
  return { S, update(t) {
    const a = H.lazaro, o = i => eio(seg(t, a + .1 + i * .25, a + 1.1 + i * .25)) * (.05 + i * .035);
    B.parts([o(0), o(1), o(2)]);
    const wash = ss(seg(t, a, a + 1.4)); gold.material.opacity = wash; B.dark.visible = wash < .6;
    ray.userData.set(lerp(0, 1.1, wash) * (1 + .15 * ss(seg(t, H.salio, H.salio + .5))));
    B.layers.forEach(([L, R], i) => { const c = mixHex(['#4e5260', '#3c3e48', '#23262f'][i], ['#c9a868', '#8c7446', '#4a3a20'][i], wash * .85); tint(L, c); tint(R, c); });
    const kz = eio(seg(t, E.T0, E.T0 + E.dur + .6));
    aim(S.cam, [-.002, lerp(-.02, -.026, kz), lerp(.74, .62, kz), .0, lerp(-.018, -.024, kz), -.08], t, { hand: .0003 });
    J.set({ x: .008, y: -.05, a: lerp(.2, 1.75, ss(seg(t, H.clama + .2, a + .1))) });
    const em = ss(seg(t, H.salio - .35, H.salio + .5));
    Lz.set({ x: B.CX - .004, y: B.CY - .002 }); Lz.g.visible = em > 0;
    for (const m of Lz.meshes) clip(m, B.CX, B.CY + .02, em * .05);
    setL(S, B.CX, B.CY + .02, lerp(.06, .26, wash), lerp(.6, 1.6, wash), mixHex('#c0c8dc', '#ffe2a0', wash));
    S.key.intensity = lerp(.85, 1.4, wash); S.key.color.set(mixHex('#d8e0f0', '#ffe2b0', wash)); S.amb.intensity = lerp(.36, .4, wash);
    const lit = ss(seg(t, H.salio, H.salio + .8));
    C.set({ x: -.064, y: -.0625, look: .9, lookY: lerp(-.1, .55, lit), blink: lerp(.6, 1, lit), aL: 0, aR: 0, k: lerp(.5, 1.3, Math.max(wash * .6, lit)) });
    this._w = wash; this._f = fsOf(S, -.1);
  }, post() { return { focus: this._f, aper: 5, maxCoc: 5, bloom: blo(lerp(.3, .5, this._w), 1.0) }; }, grade() { return { vig: lerp(.55, .3, this._w), sat: lerp(.8, 1.05, this._w), expo: lerp(.9, 1.05, this._w) }; } };
}

// S12 dawn over Bethany, all gold: the open tomb, the stone aside, the road to the village with four small figures; Clawd on a rock with the little scroll
export function S12(E) {
  const { H } = E;
  const S = stage({ light: [.04, .04, -.1], lightR: .3, lightCol: '#ffe2a0', key: 1.5, keyCol: '#ffe8c8', amb: .4, ambCol: '#c8a48c', floor: .55 });
  const B = bethany(S, { gold: true }); B.st.position.x = B.CX + .038; B.st.rotation.z = -1.5;
  const sun = moon({ r: .016, x: -.03, y: .03, z: -.165, gain: 2.2, core: '#fffbe8', mid: '#fff0c0', edge: '#ffd27a', halo: 9, haloGain: .6 }); S.scene.add(sun);
  lay(S, { w: .12, h: .04, x: -.01, y: -.02, z: -.135, col: '#b8975a', trans: .5, ppm: 4000, finish: { rim: .5 }, draw: q => {
    const R = mulberry(3); for (let i = 0; i < 9; i++) { const cx = -.05 + i * .012, w = .007 + R() * .005, hh = .005 + R() * .007; q.fillRect(cx, -.02, w, hh + .01); } } });
  lay(S, { w: .3, h: .1, y: -.06, z: -.099, col: '#e2c58c', trans: .6, shadow: false, ppm: 3000, finish: { rim: .3 }, draw: q => { q.translate(0, .06);
    q.beginPath(); q.moveTo(.02, -.08); q.quadraticCurveTo(.03, -.055, -.012, -.0465); q.lineTo(-.006, -.0458); q.quadraticCurveTo(.05, -.055, .045, -.08); q.closePath(); q.fill(); } });
  const fig = '#1a1408', X0 = [.012, .022, .028];
  const three = X0.map((x, i) => { const p = human(S.U, { h: [.022, .02, .0195][i], z: -.098, col: fig, rim: .7 }); S.scene.add(p.g); return p; });
  const Lz = lazarus(S, { h: .021, z: -.0978, col: fig });
  lay(S, { w: .08, h: .05, x: -.05, y: -.075, z: -.05, col: '#1a1408', trans: .03, ppm: 5000, finish: { rim: .7 }, draw: q => { q.beginPath(); q.moveTo(-.04, -.025); q.lineTo(-.03, .006); q.quadraticCurveTo(-.012, .016, .01, .013); q.quadraticCurveTo(.026, .01, .034, -.004); q.lineTo(.04, -.025); q.closePath(); q.fill(); } });
  const u = .0026;
  const C = clawd(S.U, { u, z: -.0485, glow: .3 }); S.scene.add(C.g);
  const small = scrollRoll(S.U, { len: 11 * u, r: u * .7, col: '#efe0b8' }); small.position.set(5 * u, 4.2 * u, .0015); small.rotation.z = .2; C.g.add(small);
  return { S, update(t) {
    const k = eio(seg(t, E.T0, H.l20));
    aim(S.cam, [lerp(-.008, 0, k), lerp(-.012, .0, k), lerp(.52, .66, k), lerp(-.008, 0, k), lerp(-.01, .004, k), -.08], t, { hand: .0003 });
    const walk = -(t - E.T0) * .0011;
    three.forEach((p, i) => { p.set({ x: X0[i] + walk, y: -.046, a: .15 + bob(t, 3, .05, i) }); p.g.scale.x = -1; });
    Lz.set({ x: .017 + walk, y: -.046, a: .1 }); Lz.g.scale.x = -1;
    setL(S, .04, .04, .3, 1.35);
    const turn = ss(seg(t, H.amen - .3, H.amen + .2)), lowr = ss(seg(t, H.amen + .4, H.amen + 1.0));
    small.position.y = lerp(4.2, 1.2, lowr) * u; small.rotation.z = lerp(.2, 0, lowr);
    C.set({ x: -.052, y: -.0602, look: lerp(.8, 0, turn), lookY: lerp(.2, 0, turn), blink: t > H.amen ? blinkAt(t, -H.amen + .25, 2.6) : blinkAt(t, .3), aR: lerp(.3, -.2, lowr), aL: 0, k: 1 });
    this._f = fsOf(S, -.0485);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 6, bloom: blo(.38, 1.1) }; }, grade() { return { vig: .32, sat: 1.04 }; } };
}
