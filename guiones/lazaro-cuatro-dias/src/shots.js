// The twelve shots of "El amigo" (Lázaro, Juan 11). Each: { S, update(t), post(), grade() }; t in film seconds.
// The Father is only ever light. Jesus, Marta, María and Lázaro are dark, quiet silhouettes. Clawd is the only clay-coloured thing.
import * as THREE from 'three';
import { skyPanel, moon, setMoon, text, burst } from './paper.js';
import { stage, aim } from './stage.js';
import { mulberry, seg, ss, eio, eo, lerp, clamp, env, TAU } from './lib.js';
import { mk, cut, tint, clawd, human, lazarus, waveFill } from './actors.js';

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

// light from above, drawn as soft shafts fanning down from one point (the Father: light only). Additive; k scales it
function rays(w, h, col = '#ffd79a', n = 9, seed = 3) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 1024; const x = c.getContext('2d'), R = mulberry(seed);
  x.globalCompositeOperation = 'lighter'; x.filter = 'blur(9px)';
  for (let i = 0; i < n; i++) {
    const a = (i / (n - 1) - .5) * .8 + (R() - .5) * .06, wd = .03 + R() * .05, g = x.createLinearGradient(256, 0, 256 + Math.sin(a) * 1024, Math.cos(a) * 1024);
    g.addColorStop(0, `rgba(255,255,255,${.35 + R() * .25})`); g.addColorStop(.55, 'rgba(255,255,255,.12)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.beginPath(); x.moveTo(256, -20); x.lineTo(256 + Math.sin(a - wd) * 1300, Math.cos(a - wd) * 1300); x.lineTo(256 + Math.sin(a + wd) * 1300, Math.cos(a + wd) * 1300); x.closePath(); x.fill();
  }
  const fade = x.createLinearGradient(0, 0, 512, 0); fade.addColorStop(0, 'rgba(0,0,0,1)'); fade.addColorStop(.2, 'rgba(0,0,0,0)'); fade.addColorStop(.8, 'rgba(0,0,0,0)'); fade.addColorStop(1, 'rgba(0,0,0,1)');
  x.filter = 'none'; x.globalCompositeOperation = 'destination-out'; x.fillStyle = fade; x.fillRect(0, 0, 512, 1024);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: new THREE.Color(col).multiplyScalar(0) }));
  m.renderOrder = 9; m.userData.set = k => m.material.color.set(col).multiplyScalar(k); return m;
}
// a close profile of Jesus (facing right, head bowed): forehead, brow, nose, beard, hair to the shoulder. No features drawn inside.
const PROF = [[-3, -5], [-2.7, -2.7], [-1.7, -1.7], [-1.75, -.6], [-1.5, .4], [-.9, 1.3], [0, 1.6], [.8, 1.35], [1.15, .8], [1.22, .55], [1.1, .4], [1.47, -.02], [1.15, -.14], [1.2, -.32], [1.08, -.46], [1.12, -.82], [.82, -1.28], [.28, -1.38], [.22, -1.75], [1.35, -2.6], [1.9, -5]];
const BOW = -.32, NECK = [0, -1.55];
const bowPt = ([x, y]) => { if (y < -1.5) return [x, y]; const c = Math.cos(BOW), s = Math.sin(BOW), dx = x - NECK[0], dy = y - NECK[1]; return [NECK[0] + dx * c - dy * s, NECK[1] + dx * s + dy * c]; };

const G = -.06, MX = .02;   // ground line at the tomb, x of the tomb mouth

// a ground sheet whose top is a soft wave at world height `base`
const ground = (S, z, col, base, amp, len, ph, tr = .08, o = {}) => { const w = o.w || .9, ox = o.x || 0; return lay(S, { w, h: .5, x: ox, y: -.1, z, col, trans: tr, ppm: o.ppm || 2400, finish: { rim: o.rim ?? .45 }, draw: x => { x.translate(-ox, .1); waveFill(x, { x0: ox - w / 2, x1: ox + w / 2, base, amp, len, ph, peak: o.peak ?? 1.3 }); } }); };

// —— Bethany on the far ridge: house blocks, three windows that light one by one ——
function village(S, { z = -.152, x0 = -.03, y0 = .028, col = '#2a2b4c', k = .9 } = {}) {
  const R = mulberry(31), boxes = [];
  for (let i = 0; i < 9; i++) boxes.push([x0 + i * .0105 + (R() - .5) * .003, .007 + R() * .012, .008 + R() * .005]);
  lay(S, { w: .14, h: .06, x: x0 + .04, y: y0, z, col, trans: .2, ppm: 3600, finish: { rim: .4 }, draw: x => {
    x.translate(-(x0 + .04), -y0);
    for (const [bx, bh, bw] of boxes) x.fillRect(bx - bw / 2, y0 - .02, bw, .02 + bh);
    x.beginPath(); x.arc(x0 + .052, y0 + .012, .006, Math.PI, 0); x.fill();
  } });
  const wins = [2, 5, 7].map(i => {
    const [bx, bh] = boxes[i];
    const m = lay(S, { w: .004, h: .004, x: bx, y: y0 + bh - .004, z: z + .0004, col: '#1a1410', trans: 0, shadow: false, recv: false, ppm: 4000, finish: { rim: 0, under: 0 },
      draw: c => c.fillRect(-.0011, -.0014, .0022, .0028), glowDraw: c => { c.fillStyle = '#fff'; c.fillRect(-.0011, -.0014, .0022, .0028); }, glow: 3 * k, glowCol: '#ffc874' });
    m.material.userData.u.uGlowLit.value = 0; return m;
  });
  return { wins, light: ks => wins.forEach((w, i) => { w.material.userData.u.uGlowLit.value = ks[i] ?? 0; }) };
}

// —— the tomb: dusk sky, far ridge, the rock face with the arched mouth, five rock arches inside, the back, the round stone ——
const DUSK = { sky: [[0, '#1a1830'], [.5, '#302c55'], [.72, '#5e5280'], [.86, '#9a7f98'], [1, '#b8949a']], far: '#6e6e9a', ridge: '#4c4d78', face: '#5a5c88', stone: '#7c7ea8',
  floor: '#34365a', path: '#202238', front: '#07070f', arch: ['#1a1b2c', '#121320', '#0c0d16', '#08080e', '#050509'] };
const GOLD = { sky: [[0, '#4a4670'], [.4, '#a8889a'], [.72, '#f2cf96'], [1, '#ffe7b0']], far: '#c9a878', ridge: '#9a7a52', face: '#8a6a40', stone: '#a08258',
  floor: '#5a4226', path: '#33240f', front: '#140d05', arch: ['#ffe2a0', '#f0c47a', '#d9a85a', '#a87a3c', '#6a4a22'] };
export { DUSK, GOLD, G, MX };
export function tomb(S, o = {}) {
  const P = o.pal || DUSK, R = mulberry(41);
  const sky = skyPanel({ w: 1.4, h: 1.1, y: .05, z: -.2, stops: P.sky, stars: o.stars ?? 0, starMinY: .06, gain: o.skyGain ?? 1 }); S.add(sky);
  const far = ground(S, -.175, P.far, .012, .014, .3, 1.7, .55, { w: 1.3, ppm: 1600 });
  const ridge = ground(S, -.155, P.ridge, .0, .02, .22, 4.1, .3, { w: 1.2, ppm: 1800 });
  const V = o.village === false ? null : village(S, { z: -.152, x0: -.085, y0: .028, col: o.vcol || '#25264a' });
  const top = u => G + .088 * Math.exp(-Math.pow((u - MX) / .085, 2)) + .006 * Math.sin(u * 160) + .003 * Math.sin(u * 410 + 1) - .012;
  const face = lay(S, { w: .7, h: .5, y: -.1, z: -.09, col: P.face, trans: .12, ppm: 2600, finish: { rim: .55, rimPx: 5, rimCol: o.faceRim || 'rgba(255,200,150,.5)' }, draw: x => {
    x.translate(0, .1);
    x.beginPath(); x.moveTo(-.35, -.35); for (let u = -.35; u <= .35; u += .002) x.lineTo(u, Math.max(top(u), G + .004 + .004 * Math.sin(u * 90))); x.lineTo(.35, -.35); x.closePath(); x.fill();
    x.fillStyle = '#7e7e7e'; for (let i = 0; i < 16; i++) { const cx = MX + (R() - .5) * .16, cy = G + .006 + R() * .06; if (Math.abs(cx - MX) < .026 && cy < G + .062) continue; x.beginPath(); x.ellipse(cx, cy, .006 + R() * .014, .0012 + R() * .002, (R() - .5) * .4, 0, TAU); x.fill(); }
    cut(x, () => { x.beginPath(); x.moveTo(MX - .018, G - .001); x.lineTo(MX - .018, G + .034); x.arc(MX, G + .034, .018, Math.PI, 0, true); x.lineTo(MX + .018, G - .001); x.closePath(); x.fill(); });
  } });
  const back = skyPanel({ w: .07, h: .066, x: MX, y: G + .027, z: -.131, stops: [[0, '#fff3cf'], [.6, '#ffd48a'], [1, '#e0a050']], gain: 0 }); S.add(back);
  const arches = [];
  for (let i = 0; i < 5; i++) {
    const s = 1 - .13 * (i + 1), w = .036 * s, hh = .052 * s, b = G + .0018 * (i + 1);
    const m = lay(S, { w: .062, h: .068, x: MX, y: G + .023, z: -.0935 - i * .0072, col: P.arch[i], trans: .5, ppm: 4200, shadow: false, finish: { rim: .6, rimPx: 4, under: .35 }, draw: x => {
      x.translate(-MX, -(G + .023)); x.fillRect(MX - .031, G - .011, .062, .068);
      cut(x, () => { x.beginPath(); x.moveTo(MX - w / 2, b); x.lineTo(MX - w / 2, b + hh - w / 2); x.arc(MX, b + hh - w / 2, w / 2, Math.PI, 0, true); x.lineTo(MX + w / 2, b); x.closePath(); x.fill(); });
    } });
    arches.push(m);
  }
  const floor = ground(S, -.0895, P.floor, G + .0005, .0015, .09, 2, .1, { rim: .3 });
  const stone = lay(S, { w: .064, h: .064, x: MX, y: G + .029, z: -.0885, col: P.stone, trans: .1, ppm: 4200, finish: { rim: .6, rimPx: 5, rimCol: o.stoneRim || 'rgba(255,196,140,.6)', under: .4 }, draw: x => {
    x.beginPath(); x.arc(0, 0, .03, 0, TAU); x.fill();
    x.strokeStyle = '#6e6e6e'; x.lineWidth = .0016; x.beginPath(); x.arc(0, 0, .021, .3, 2.6); x.stroke(); x.beginPath(); x.arc(0, 0, .012, 3.4, 5.6); x.stroke();
    x.beginPath(); x.moveTo(-.004, .026); x.lineTo(.006, .012); x.stroke();
  } });
  const path = ground(S, -.066, P.path, G - .0075, .002, .12, 3.3, .06, { rim: .35 });
  const front = ground(S, -.035, P.front, G - .03, .006, .1, .4, .02, { rim: .25, peak: 2 });
  const roll = dx => { stone.position.x = MX + dx; stone.rotation.z = -dx / .03; };   // rolls along the face: turns by distance / radius
  const L = { far, ridge, face, floor, path, front, stone };
  // warm: 0 = this palette, 1 = gold. The paper turns warm with the light, so gold light never lands on blue paper (no green)
  const warm = (p, from = P, to = GOLD) => { for (const k in L) tint(L[k], mixc(from[k], to[k], p)); };
  // light the arches: ks[i] 0..1 per arch, front to back; gain lifts lit paper above its plain colour
  const lightArches = (ks, base = P, gain = 2.2) => arches.forEach((m, i) => tint(m, mixc(base.arch[i], GOLD.arch[i], ks[i]), 1 + (gain - 1) * ks[i] * (1 - i * .12)));
  return { sky, back, arches, stone, face, V, roll, warm, lightArches, front, path };
}

// —— the memory: beyond the Jordan, olive sand, a low sun ——
function jordan(S) {
  const sky = skyPanel({ w: 1.2, h: 1, z: -.18, stops: [[0, '#77706a'], [.5, '#b0a68e'], [.82, '#dccfab'], [1, '#ecdfbd']] }); S.add(sky);
  const sun = moon({ r: .014, x: .04, y: .03, z: -.17, gain: 1.8, core: '#fffbe8', mid: '#fff0c8', edge: '#ffe0a0', halo: 7, haloGain: .5 }); S.scene.add(sun);
  ground(S, -.16, '#a39d7e', -.004, .012, .26, 1.1, .5, { w: 1.2, ppm: 1600 });
  lay(S, { w: 1.1, h: .02, y: -.028, z: -.13, col: '#b9bba6', trans: .55, ppm: 1600, finish: { rim: .5 }, draw: x => { x.beginPath(); x.moveTo(-.55, -.006); x.bezierCurveTo(-.2, .004, .1, -.008, .55, .002); x.lineTo(.55, -.01); x.lineTo(-.55, -.01); x.closePath(); x.fill(); } });
  ground(S, -.12, '#8f8a6c', -.036, .006, .2, 2.2, .25);
  ground(S, -.09, '#4e4a3a', G + .001, .003, .16, 3.6, .08);
  return { sky, sun };
}

// S1 the stone, fourth day: push-in on Clawd with both hands on the stone; the paper title on top
export function S1(E) {
  const { H } = E;
  const S = stage({ light: [MX, .02, -.1], lightR: .2, lightCol: '#c9b8d8', key: 1.6, keyCol: '#d6d8f0', amb: .42, ambCol: '#8890c0', floor: .35 });
  tomb(S, { stars: 90 });
  const C = clawd(S.U, { u: .003, z: -.08 }); S.scene.add(C.g);
  const title = lay(S, { w: .118, h: .05, y: .088, z: -.03, col: '#e7d4a8', trans: .35, shadow: false, recv: false, finish: { rim: .3, under: .2 }, draw: x => {
    x.beginPath(); x.roundRect(-.058, -.024, .116, .048, .002); x.fill();
    cut(x, () => { text(x, 'EL AMIGO', 0, .0058, .0158, 'Cinzel', { weight: 800, fill: '#000' }); text(x, 'Juan 11', 0, -.0122, .0102, 'Playfair', { weight: 'italic 500', fill: '#000' }); });
  }, glowDraw: x => { x.fillStyle = '#fff'; x.fillRect(-.06, -.026, .12, .052); }, glow: .55, glowCol: '#e7d4a8', glowRes: .2 });
  title.material.userData.u.uClip.value.set(0, .088, 0, 0);
  return { S, update(t) {
    const k = eio(seg(t, 0, E.T0 + E.dur + .6)), d = lerp(.66, .44, k), cx = lerp(MX - .012, MX - .02, k), cy = camY(G, .67, d);
    aim(S.cam, [cx, cy, -.08 + d, cx, cy, -.08], t, { hand: .0004 });
    const over = ss(seg(t, H.l02 + .4, H.l02 + .8)) * (1 - ss(seg(t, H.l02 + 1.9, H.l02 + 2.3)));
    C.set({ x: MX - .041, y: G, aR: 1.3 + bob(t, 1.1, .05), aL: .5, look: lerp(.6, -1, over), blink: blinkAt(t, 3.4, .6), k: 1.15 });
    const cz = S.cam.position.z + .03, ts = cz / .55; title.scale.setScalar(ts); title.position.x = S.cam.position.x; title.position.y = S.cam.position.y + .4617 * cz / 2 * .6;
    const reveal = ss(seg(t, .3, .8)) * (1 - ss(seg(t, 3.8, 4.2)));
    title.material.userData.u.uClip.value.set(title.position.x, title.position.y, .085 * reveal * ts, 0); title.visible = reveal > .002;
    this._f = fsOf(S, -.08);
  }, post() { return { focus: this._f, aper: 8, maxCoc: 6, bloom: blo(.32, 1.05) }; }, grade() { return { vig: .45 }; } };
}

// S2 Bethany: crane up and back from the tomb to the village; three windows light one by one
export function S2(E) {
  const { H } = E;
  const S = stage({ light: [-.03, .05, -.1], lightR: .22, lightCol: '#c9b8d8', key: 1.6, keyCol: '#d6d8f0', amb: .42, ambCol: '#8890c0', floor: .35 });
  const T = tomb(S, { stars: 110 });
  const M = [[-.072, .074], [-.056, .079], [-.04, .071]].map(([x, h]) => { const m = human(S.U, { h, z: -.072, col: '#0a0a16', rim: .45 }); S.scene.add(m.g); return [m, x]; });
  const C = clawd(S.U, { u: .0019, z: -.07 }); S.scene.add(C.g);
  return { S, update(t) {
    const k = eio(seg(t, E.T0 - .6, E.T0 + E.dur + .6)), d = lerp(.62, .82, k), cy = lerp(camY(G, .66, .62), camY(G, .72, .82) + .02, k), cx = lerp(-.01, -.03, k);
    aim(S.cam, [cx, cy, -.08 + d, cx, cy + .006 * k, -.08], t, { hand: .0003 });
    M.forEach(([m, x], i) => { m.set({ x, y: G - .002, a: .15 }); if (i === 2) flip(m); });
    T.V.light([ss(seg(t, H.l03 + .05, H.l03 + .2)), ss(seg(t, H.l03 + .45, H.l03 + .6)), ss(seg(t, H.l03 + .85, H.l03 + 1))]);
    C.set({ x: MX + .03, y: G, look: -.6, blink: blinkAt(t, 3, .2), k: 1.2 });
    this._f = fsOf(S, -.09);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(.34, 1.05) }; }, grade() { return { vig: .45 }; } };
}

// S3 memory: a paper curtain slides away; the messenger runs and stops; Jesus stays; the sun goes down and comes up again
export function S3(E) {
  const { H } = E;
  const S = stage({ light: [.04, .04, -.1], lightR: .24, lightCol: '#ffe8c0', key: 1.35, keyCol: '#fff0d8', amb: .36, ambCol: '#b8b090', floor: .45 });
  const J = jordan(S);
  const Jz = human(S.U, { h: .072, z: -.078, col: '#14120c', rim: .6 }); S.scene.add(Jz.g);
  const Ms = human(S.U, { h: .066, z: -.074, col: '#1a160e', rim: .5 }); S.scene.add(Ms.g);
  lay(S, { w: .06, h: .03, x: -.05, y: G + .002, z: -.056, col: '#2e2b20', trans: .05, finish: { rim: .5 }, draw: x => { x.beginPath(); x.moveTo(-.026, -.015); x.quadraticCurveTo(-.024, .006, -.006, .008); x.quadraticCurveTo(.016, .009, .024, -.015); x.closePath(); x.fill(); } });
  ground(S, -.04, '#12110c', G - .028, .006, .12, 1.3, .02, { peak: 2 });
  const C = clawd(S.U, { u: .0022, z: -.054 }); S.scene.add(C.g);
  const curtain = lay(S, { w: .3, h: .4, z: -.02, col: '#d8cfae', trans: .4, shadow: false, recv: false, ppm: 1200, finish: { rim: .5, rimPx: 6, under: .5 }, draw: x => { x.beginPath(); x.moveTo(-.15, -.2); x.lineTo(.13, -.2); for (let i = 0; i <= 20; i++) x.lineTo(.13 + .008 * Math.sin(i * 2.1), -.2 + i * .02); x.lineTo(-.15, .2); x.closePath(); x.fill(); } });
  const cool = col3('#ffe8c0'), dusk = col3('#d9a070');
  return { S, update(t) {
    const d = .6, cy = camY(G, .66, d);
    aim(S.cam, [-.004, cy, -.08 + d, -.004, cy, -.08], t, { hand: .0003 });
    const cv = eio(seg(t, E.T0, E.T0 + .75)); curtain.position.set(S.cam.position.x - .02 - cv * .32, cy, -.02); curtain.visible = cv < .999;
    // the messenger runs in from the right and stops in front of Jesus
    const a = H.l04 - .1, run = seg(t, a, a + 1.6), mx = lerp(.1, .024, eo(run)), running = run > 0 && run < 1, ph = t * 11;
    Ms.set({ x: mx, y: G + (running ? Math.abs(Math.sin(ph)) * .0016 : 0), a: running ? .6 + Math.sin(ph) * .5 : lerp(.25, 1.0, ss(seg(t, a + 1.6, a + 2.1))), rot: running ? .06 : 0 }); flip(Ms);
    Jz.set({ x: -.022, y: G, a: .12 });
    // the wait: the sun sets and rises again, the light with it
    const w = H.l05, down = ss(seg(t, w - .4, w + .5)), up = ss(seg(t, w + .6, w + 1.4)), sk = down * (1 - up);
    J.sun.position.y = lerp(.03, -.03, sk); setMoon(J.sun, lerp(1, .35, sk));
    J.sky.material.color.setScalar(lerp(1, .5, sk)); setL(S, .04, lerp(.04, -.02, sk), .24, lerp(1, .5, sk), cool.clone().lerp(dusk, sk));
    S.key.intensity = lerp(1.35, .7, sk); S.amb.intensity = lerp(.36, .22, sk);
    const lk = t < a + 1.5 ? .9 : t < w ? -.9 : 0;
    C.set({ x: -.05, y: G + .009, look: lk, blink: t > w && t < w + 1.6 ? .45 : blinkAt(t, 3.1), tuck: .35, k: 1.1 });
    this._f = fsOf(S, -.075);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(.3, 1.15) }; }, grade() { return { vig: .38, sat: .95 }; } };
}

// S4 the road to Bethany: lateral tracking with parallax that stops when Marta meets him
export function S4(E) {
  const { H } = E;
  const S = stage({ light: [0, .05, -.1], lightR: .22, lightCol: '#ffd8a8', key: 1.25, keyCol: '#ffe8d0', amb: .32, ambCol: '#a89c86', floor: .4 });
  S.add(skyPanel({ w: 1.6, h: 1, z: -.18, stops: [[0, '#3e3d4c'], [.5, '#7d7768'], [.8, '#c7b48e'], [1, '#e0c898']] }));
  ground(S, -.165, '#8e876a', .0, .014, .24, 2.1, .45, { w: 1.6, ppm: 1400 });
  const R = mulberry(17);
  lay(S, { w: 1.4, h: .1, y: -.01, z: -.13, col: '#5d5844', trans: .25, ppm: 1600, finish: { rim: .5 }, draw: x => { for (let i = 0; i < 26; i++) { const cx = -.7 + i * .055 + R() * .02, r = .006 + R() * .006; x.beginPath(); x.arc(cx, -.03 + r * .6, r, 0, TAU); x.fill(); x.fillRect(cx - .0007, -.05, .0014, .02 + r); } } });
  ground(S, -.11, '#6d6750', -.04, .008, .18, .7, .15, { w: 1.4 });
  ground(S, -.085, '#3e3a2c', G - .002, .0015, .2, 1.2, .06, { w: 1.4 });
  ground(S, -.035, '#100f0a', G - .03, .008, .11, 2.5, .02, { w: 1.4, peak: 2 });
  const Jz = human(S.U, { h: .074, z: -.075, col: '#12100b', rim: .65 }); S.scene.add(Jz.g);
  const Ma = human(S.U, { h: .068, z: -.074, col: '#16120d', rim: .65 }); S.scene.add(Ma.g);
  const C = clawd(S.U, { u: .0021, z: -.068 }); S.scene.add(C.g);
  const halo = burst(.09, .12, '#ffd9a0'); halo.position.set(0, G + .005, -.09); S.add(halo);
  return { S, update(t) {
    const go = seg(t, E.T0 - .6, H.l07 - .05), k = eo(go), jx = lerp(-.12, -.02, k), mg = seg(t, H.l06, H.l07 - .05), mxx = lerp(.07, .02, eo(mg));
    const walking = go < 1, ph = t * 7.5;
    const d = .58, cx = lerp(-.09, -.002, k), cy = camY(G, .66, d);
    aim(S.cam, [cx, cy, -.08 + d, cx, cy, -.08], t, { hand: .0003 });
    Jz.set({ x: jx, y: G + (walking ? Math.abs(Math.sin(ph)) * .0012 : 0), a: walking ? Math.sin(ph) * .28 : lerp(.2, .55, ss(seg(t, H.l07, H.l07 + .5))), rot: walking ? .02 : 0 });
    const mw = mg < 1; Ma.set({ x: mxx, y: G + (mw ? Math.abs(Math.sin(ph + 1)) * .0011 : 0), a: mw ? Math.sin(ph + 1) * .25 : .3 }); flip(Ma);
    const cw = seg(t, E.T0 - .6, H.l07 - .4), cxx = lerp(-.17, -.05, eo(cw));
    C.set({ x: cxx, y: G, walk: t * 13, stride: cw < 1 ? .35 : 0, look: .8, blink: blinkAt(t, 3.2, 1), k: 1.1 });
    const glow = ss(seg(t, H.l07 + .2, H.l07 + 1.0)) * (1 - .4 * ss(seg(t, H.l08 - .3, H.l08 + .3)));
    halo.userData.set(.5 * glow); setL(S, 0, G + .03, lerp(.22, .12, glow), lerp(1, 1.5, glow));
    this._f = fsOf(S, -.075);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(.32, 1.1) }; }, grade() { return { vig: .4, sat: .95 }; } };
}

// the mourning field outside Bethany (S5, S6 background)
function mourning(S, { mourners = true, sky = DUSK.sky, mid = '#262744', hill = '#34355c' } = {}) {
  S.add(skyPanel({ w: 1.2, h: 1, z: -.19, stops: sky, stars: 70, starMinY: .2 }));
  ground(S, -.175, '#4e4e7a', .006, .014, .28, 2.4, .5, { w: 1.2, ppm: 1600 });
  ground(S, -.155, hill, -.006, .016, .2, .9, .3, { w: 1.2 });
  const V = village(S, { z: -.153, x0: .02, y0: .012, col: '#22234a' }); V.light([1, 1, 1]);
  ground(S, -.12, mid, -.04, .006, .16, 3.1, .12);
  const ms = [];
  if (mourners) for (const [x, h, f] of [[-.066, .05, 0], [.058, .052, 1], [.072, .048, 0]]) { const m = human(S.U, { h, z: -.105, col: '#2c2e52', rim: .3 }); S.scene.add(m.g); ms.push([m, x, f]); }
  ground(S, -.088, '#1b1c33', G - .001, .0015, .2, 1.7, .06);
  return { V, ms, set: () => ms.forEach(([m, x, f]) => { m.set({ x, y: -.044, a: .12 }); if (f) flip(m); }) };
}

// S5 María at his feet: slow push-in that goes on through the first silence; the light steps down
export function S5(E) {
  const { H } = E;
  const S = stage({ light: [0, .02, -.1], lightR: .2, lightCol: '#c9b8d8', key: 1.55, keyCol: '#d6d8f0', amb: .4, ambCol: '#8890c0', floor: .35 });
  const Mo = mourning(S, { sky: [[0, '#1a1830'], [.3, '#302c55'], [.42, '#6a5c88'], [.5, '#b098b0'], [.58, '#8a78a0'], [.72, '#3a3462'], [1, '#1c1a34']], mid: '#6a6496', hill: '#56548a' });
  const Jz = human(S.U, { h: .078, z: -.08, col: '#0a0a16', rim: .6 }); S.scene.add(Jz.g);
  const Mr = human(S.U, { h: .06, z: -.078, col: '#0b0b18', rim: .6, pose: 'kneel', two: true }); S.scene.add(Mr.g);
  ground(S, -.04, '#07070f', G - .03, .006, .1, 2.2, .02, { peak: 2 });
  const C = clawd(S.U, { u: .0021, z: -.06 }); S.scene.add(C.g);
  return { S, update(t) {
    const k = eio(seg(t, E.T0, E.T0 + E.dur + .6)), d = lerp(.56, .46, k), cx = lerp(-.002, .004, k), cy = camY(G, .66, d);
    aim(S.cam, [cx, cy, -.08 + d, cx, cy, -.08], t, { hand: .0002 });
    Mo.set();
    Jz.set({ x: -.02, y: G, a: .35, rot: -.03 });
    Mr.set({ x: .022, y: G, a: lerp(1.6, 1.25, ss(seg(t, H.l08, H.l08 + 1))) + bob(t, 1.3, .03), rot: .05 }); flip(Mr);
    const dim = ss(seg(t, H.silencio1 - .2, H.silencio1 + .6));
    setL(S, 0, .02, .2, lerp(1, .6, dim)); S.key.intensity = lerp(1.55, 1.0, dim); S.amb.intensity = lerp(.4, .26, dim);
    C.set({ x: -.036, y: G, look: .7, blink: t > H.silencio1 ? 1 : blinkAt(t, 3.8, .4), tuck: .5, k: lerp(1.05, .85, dim) });
    this._f = fsOf(S, -.08);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 5, bloom: blo(.3, 1.1) }; }, grade() { return { vig: .48 }; } };
}

// S6 Jesus wept: close profile, head bowed; one drop of light; focus pulls from Clawd (front, from behind) to him
export function S6(E) {
  const { H } = E;
  const S = stage({ light: [.0, .14, -.1], lightR: .2, lightCol: '#c9b8d8', key: 1.1, keyCol: '#d6d8f0', amb: .3, ambCol: '#8088c0', floor: .35 });
  mourning(S, { mourners: false, sky: [[0, '#1a1830'], [.25, '#302c55'], [.36, '#6a5c88'], [.42, '#a08aa4'], [.5, '#6a5c88'], [.7, '#302c55'], [1, '#1c1a34']] });
  const U_ = .0118, jx = -.012, hy = G + .18, LT = G + .156;
  const Jz = { g: new THREE.Group() }; Jz.g.position.set(jx, hy, -.09); S.scene.add(Jz.g);
  Jz.g.add(mk(S.U, { w: U_ * 8, h: U_ * 13, y: -U_ * 1.6, col: '#0a0a16', trans: .05, ppm: 6000, finish: { rim: .8, rimPx: 6, rimCol: 'rgba(255,226,190,.75)', under: .2 }, draw: x => {
    x.translate(0, U_ * 1.6); x.beginPath(); PROF.map(bowPt).forEach(([a, b], i) => i ? x.lineTo(a * U_, b * U_) : x.moveTo(a * U_, b * U_)); x.closePath(); x.fill(); } }));
  const tear = mk(S.U, { w: .003, h: .008, z: .0015, col: '#ffe8b0', trans: 0, shadow: false, recv: false, ppm: 9000, finish: { rim: 0, under: 0 },
    draw: c => { c.beginPath(); c.moveTo(0, .0034); c.quadraticCurveTo(.0008, -.0006, 0, -.0014); c.quadraticCurveTo(-.0008, -.0006, 0, .0034); c.fill(); }, glowDraw: c => { c.fillStyle = '#fff'; c.beginPath(); c.moveTo(0, .003); c.quadraticCurveTo(.0007, -.0006, 0, -.0013); c.quadraticCurveTo(-.0007, -.0006, 0, .003); c.fill(); }, glow: 1.6, glowCol: '#ffd892' });
  Jz.g.add(tear);
  lay(S, { w: .2, h: .1, y: LT - .05, z: -.012, col: '#06060c', trans: .02, ppm: 2400, finish: { rim: .3 }, draw: x => { x.translate(0, .05); waveFill(x, { x0: -.1, x1: .1, base: -.002, amp: .004, len: .05, ph: 1, peak: 2 }); } });
  const C = clawd(S.U, { u: .0008, z: -.012 }); S.scene.add(C.g); backTo(C, true);
  return { S, update(t) {
    const k = eio(seg(t, E.T0 - .6, E.T0 + E.dur)), d = lerp(.3, .26, k), cx = jx + .006, cy = hy - .012;
    aim(S.cam, [cx, cy, -.09 + d, cx, cy, -.09], t, { hand: .0002 });
    Jz.g.rotation.z = bob(t, .8, .004);
    const L0 = H.llora, p = ss(seg(t, L0, L0 + 1.4)), tp = bowPt([lerp(.74, .8, p), lerp(-.5, -1.0, p)]);
    tear.visible = t > L0 - .05; tear.position.set(tp[0] * U_, tp[1] * U_, .0015);
    tear.material.userData.u.uGlowLit.value = ss(seg(t, L0 - .05, L0 + .2)) * (1 - .5 * ss(seg(t, L0 + 1.6, L0 + 2.4)));
    const dC = S.cam.position.z + .012;
    C.set({ x: cx - .13 * dC * .6, y: LT - .002, blink: 1, k: .95 });
    const rf = ss(seg(t, H.l09 - .4, H.l09 + .3)); this._f = lerp(fsOf(S, -.012), fsOf(S, -.09), rf);
  }, post() { return { focus: this._f, aper: 14, maxCoc: 9, bloom: blo(.45, 1.0) }; }, grade() { return { vig: .5 }; } };
}

// S7 "Quiten la piedra": low angle at the tomb; two men push; Marta lifts a hand; the stone rolls aside and leaves the mouth black
export function S7(E) {
  const { H } = E;
  const S = stage({ light: [MX, .03, -.1], lightR: .2, lightCol: '#c9b8d8', key: 1.6, keyCol: '#d6d8f0', amb: .4, ambCol: '#8890c0', floor: .35, keyPos: [-.05, .3, .3] });
  const T = tomb(S, { stars: 60 });
  const m1 = human(S.U, { h: .074, z: -.083, col: '#0a0a16', rim: .55, two: true }); S.scene.add(m1.g);
  const m2 = human(S.U, { h: .078, z: -.084, col: '#0a0a16', rim: .55, two: true }); S.scene.add(m2.g);
  const Ma = human(S.U, { h: .068, z: -.072, col: '#0b0b18', rim: .6 }); S.scene.add(Ma.g);
  const C = clawd(S.U, { u: .0022, z: -.062 }); S.scene.add(C.g);
  return { S, update(t) {
    const r0 = H.rueda - 1.2, roll = eio(seg(t, r0, H.rueda + .4)), dx = .052 * roll;
    T.roll(dx);
    const d = .6, cx = lerp(MX - .002, MX + .014, ss(seg(t, r0 - .5, H.rueda + .6))), cy = camY(G, .64, d) - .01;
    aim(S.cam, [cx, cy, -.08 + d, cx, cy + .01, -.08], t, { hand: .0003 });
    const lean = ss(seg(t, H.l11 + .6, r0)), push = .06 * lean;
    m1.set({ x: MX - .05 + dx * .12, y: G, a: lerp(.3, 1.45, lean), rot: -push });
    m2.set({ x: MX - .064 + dx * .12, y: G, a: lerp(.2, 1.55, lean), rot: -push * .8 });
    Ma.set({ x: MX + .07, y: G, a: .25 + 1.35 * env(t, H.duda + .2, H.duda + 2.3, .35, .5) }); flip(Ma);
    const bk = ss(seg(t, r0 - .3, r0 + .5)), st = seg(t, r0 - .3, r0 + .5), half = .9 * ss(seg(t, H.rueda - .5, H.rueda));
    C.set({ x: MX + .03 + .012 * bk, y: G - .003, walk: st * 9, stride: st > 0 && st < 1 ? .35 : 0, aL: half, aR: half, look: -.8, blink: blinkAt(t, 3.5), k: 1.1 });
    this._f = fsOf(S, -.085);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(.3, 1.1) }; }, grade() { return { vig: .48 }; } };
}

// S8 the prayer: Jesus before the open tomb lifts his arm; gold comes down from above (the Father: light only); then the second silence
export function S8(E) {
  const { H } = E;
  const S = stage({ light: [MX, .04, -.1], lightR: .2, lightCol: '#c9b8d8', key: 1.55, keyCol: '#d6d8f0', amb: .4, ambCol: '#8890c0', floor: .35 });
  const T = tomb(S, { stars: 60 }); T.roll(.052);
  const Jz = human(S.U, { h: .078, z: -.075, col: '#0a0a16', rim: .7, two: true }); S.scene.add(Jz.g);
  const C = clawd(S.U, { u: .0022, z: -.062 }); S.scene.add(C.g);
  const ray = rays(.26, .3, '#ffd79a'); ray.position.set(MX - .045, .07, -.1); S.add(ray);
  const cool = col3('#c9b8d8'), gold = col3('#ffd79a');
  return { S, update(t) {
    const p = ss(seg(t, H.ora + .3, H.silencio2 - .1));
    const tilt = env(t, H.ora - .1, H.ora + 2.0, .7, .8);
    const d = lerp(.6, .54, ss(seg(t, E.T0 - .6, H.silencio2))), cx = MX - .03, cy = camY(G, .62, d);
    aim(S.cam, [cx, cy + .004 * tilt, -.08 + d, cx, cy + .018 * tilt, -.08], t, { hand: t > H.silencio2 ? 0 : .0003 });
    Jz.set({ x: MX - .045, y: G, a: lerp(.35, 2.25, ss(seg(t, H.ora + .2, H.ora + 1.4))), rot: lerp(0, .05, ss(seg(t, H.ora, H.ora + 1.4))) });
    C.set({ x: MX - .074, y: G - .002, look: .9, blink: t > H.silencio2 - .3 ? 1 : blinkAt(t, 3.6, .3), tuck: .25, k: lerp(.9, 1.25, p) });
    ray.userData.set(lerp(0, .75, p));
    T.warm(p * .55); T.sky.material.color.set(mixc('#ffffff', '#e8c8b8', p));
    setL(S, MX - .03, lerp(.04, .08, p), lerp(.2, .26, p), lerp(1, 1.35, p), cool.clone().lerp(gold, p));
    S.key.intensity = lerp(1.55, 1.7, p); S.key.color.copy(col3('#d6d8f0').lerp(gold, p)); S.amb.color.copy(col3('#8088c0').lerp(col3('#c0a888'), p));
    this._f = fsOf(S, -.075);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(.42, 1.0) }; }, grade() { return { vig: .48 }; } };
}

// S9 signature (1): "¡Lázaro, ven fuera!" — dolly into the mouth; the light enters and lights the arches one after another, front to back
export function S9(E) {
  const { H } = E;
  const S = stage({ light: [MX, G + .03, -.1], lightR: .12, lightCol: '#ffd79a', key: 1.4, keyCol: '#ffe0b0', amb: .3, ambCol: '#c0a888', floor: .3 });
  const T = tomb(S, { stars: 40 }); T.roll(.052);
  const C = clawd(S.U, { u: .0017, z: -.08 }); S.scene.add(C.g); backTo(C, true);
  const glow = burst(.07, .08, '#ffd892'); glow.position.set(MX, G - .002, -.0875); S.add(glow);
  return { S, update(t) {
    const F = H.fuera - .15, ks = [0, 1, 2, 3, 4].map(i => ss(seg(t, F + i * .18, F + i * .18 + .3))), all = ks[4];
    T.warm(lerp(.55, .85, ss(seg(t, F, F + 1.0)))); T.lightArches(ks);
    T.back.material.color.setScalar(lerp(0, 1.5, ss(seg(t, F + .7, F + 1.2))));
    glow.userData.set(lerp(0, .9, ss(seg(t, F, F + 1.1))));
    const k = eio(seg(t, E.T0 - .6, E.T0 + E.dur)), d = lerp(.5, .3, k), cx = MX - .01, cy = camY(G, .66, d);
    aim(S.cam, [cx, cy, -.08 + d, cx, cy, -.08], t, { hand: .0003 });
    const up = ss(seg(t, H.l14, F + .9));
    C.set({ x: MX - .033, y: G - .001, aL: 2.2 * up, aR: 2.2 * up, k: lerp(1.0, 1.35, all) });
    setL(S, MX, G + .03, lerp(.08, .18, all), lerp(1, 2.2, all));
    this._f = fsOf(S, -.09);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(.5, .95) }; }, grade() { return { vig: .5 }; } };
}

// S10 signature (2): from inside the tomb the mouth is a gold window; Lázaro, bound, walks toward it through the arches, seen from behind
export function S10(E) {
  const S = stage({ light: [0, -.025, -.13], lightR: .11, lightCol: '#ffd79a', key: .55, keyCol: '#ffd8a0', amb: .22, ambCol: '#a08060', floor: .12, keyPos: [0, .05, -.3], keyTarget: [0, -.05, .2] });
  const Gi = -.06;
  S.add(skyPanel({ w: .5, h: .4, y: .0, z: -.16, gain: 1.7, stops: [[0, '#ffe9bb'], [.55, '#ffe0a0'], [1, '#fff4d8']] }));
  ground(S, -.145, '#d8b27a', Gi + .006, .004, .1, 1, .6, { rim: .5 });
  const Cc = clawd(S.U, { u: .0016, z: -.138, glow: .7 }); S.scene.add(Cc.g);
  const arch = (z, w, hh, col, tr = .3) => lay(S, { w: .3, h: .3, y: Gi + .05, z, col, trans: tr, ppm: 2800, shadow: false, finish: { rim: .9, rimPx: 6, rimCol: 'rgba(255,214,140,.9)', under: .3 }, draw: x => {
    x.translate(0, -(Gi + .05)); x.fillRect(-.15, Gi - .1, .3, .3);
    cut(x, () => { x.beginPath(); x.moveTo(-w / 2, Gi - .002); x.lineTo(-w / 2, Gi + hh - w / 2); x.arc(0, Gi + hh - w / 2, w / 2, Math.PI, 0, true); x.lineTo(w / 2, Gi - .002); x.closePath(); x.fill(); });
  } });
  arch(-.13, .056, .07, '#2a1a0c', .5);
  arch(-.105, .062, .088, '#3a2412'); arch(-.075, .07, .098, '#2a190b'); arch(-.045, .078, .108, '#1c1007'); arch(-.012, .088, .12, '#110a04', .2);
  const fl = mk(S.U, { w: .3, h: .2, col: '#2a1b0c', trans: .1, ppm: 1600, finish: { rim: 0, under: 0 }, draw: x => x.fillRect(-.15, -.1, .3, .2) });
  fl.rotation.x = -Math.PI / 2; fl.position.set(0, Gi - .0005, -.07); S.add(fl);
  const Lz = lazarus(S.U, { h: .056, z: -.03, col: '#140d06', linen: '#8c7650', rim: .9 }); S.scene.add(Lz.g);
  return { S, update(t) {
    const a = E.T0 + .25, wk = seg(t, a, E.T0 + E.dur + .6), z = lerp(-.028, -.098, wk);
    Lz.g.position.z = z; Lz.set({ x: .007, y: Gi, step: wk > 0 && wk < 1 ? (t - a) * 9 : 0 });
    const cz = lerp(.2, .14, eio(seg(t, E.T0 - .2, E.T0 + E.dur + .6))), cy = Gi + .018;
    aim(S.cam, [0, cy, cz, 0, cy - .002, -.13], t, { hand: .0004 });
    Cc.set({ x: -.016, y: Gi + .001, look: .2, blink: 1, k: 1.3 });
    this._f = S.cam.position.z - z;
  }, post() { return { focus: this._f, aper: 5, maxCoc: 5, bloom: blo(.55, .95) }; }, grade() { return { vig: .5, sat: 1.04 }; } };
}

// S11 "Desátenlo": outside, all gold; two of them unbind him; the strips fall one by one, the face cloth last; his arms swing free
export function S11(E) {
  const { H } = E;
  const S = stage({ light: [MX, .04, -.1], lightR: .26, lightCol: '#ffd79a', key: 1.6, keyCol: '#ffe6c0', amb: .38, ambCol: '#c8a888', floor: .45 });
  const T = tomb(S, { pal: GOLD, faceRim: 'rgba(255,230,170,.6)', vcol: '#6a5236' }); T.roll(.052); T.lightArches([1, 1, 1, 1, 1], GOLD, 1.6); T.back.material.color.setScalar(1.3);
  T.V.light([1, 1, 1]);
  const Lz = lazarus(S.U, { h: .066, z: -.074, col: '#1c1208', linen: '#cdb68a', rim: .7 }); S.scene.add(Lz.g);
  const h1 = human(S.U, { h: .074, z: -.077, col: '#1a1008', rim: .7, two: true }); S.scene.add(h1.g);
  const h2 = human(S.U, { h: .07, z: -.077, col: '#1a1008', rim: .7, two: true }); S.scene.add(h2.g);
  const C = clawd(S.U, { u: .002, z: -.062, glow: .4 }); S.scene.add(C.g);
  const N = 9, A = H.desata + .15, step = .17;
  return { S, update(t) {
    const k = eio(seg(t, E.T0 - .6, E.T0 + E.dur + .6)), d = lerp(.44, .54, k), cx = MX + .006, cy = camY(G, .67, d);
    aim(S.cam, [cx, cy, -.08 + d, cx, cy, -.08], t, { hand: .0003 });
    const fall = Array.from({ length: N }, (_, i) => seg(t, A + i * step, A + i * step + .7));
    Lz.set({ x: MX + .004, y: G, fall, free: ss(seg(t, A + N * step - .1, A + N * step + .4)) });
    const w = Math.sin(t * 8) * .12;
    h1.set({ x: MX - .036, y: G, a: 1.15 + w, rot: -.04 });
    h2.set({ x: MX + .046, y: G, a: 1.2 - w, rot: -.04 }); flip(h2);
    const arm = 2.4 * (1 - .55 * env(t, A + 1.0, A + 1.9, .3, .4));
    C.set({ x: MX - .047, y: G - .002, aL: arm, aR: arm, look: .9, blink: blinkAt(t, 3.4, .5), k: 1.0 });
    this._f = fsOf(S, -.075);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(.35, 1.1) }; }, grade() { return { vig: .38 }; } };
}

// S12 echo of S1: the same frame, stone aside, the tomb empty and gold; four figures walk up to Bethany; Clawd turns to us; pull-out
export function S12(E) {
  const { H } = E;
  const S = stage({ light: [MX, .04, -.1], lightR: .28, lightCol: '#ffd79a', key: 1.6, keyCol: '#ffe6c0', amb: .38, ambCol: '#c8a888', floor: .45 });
  const T = tomb(S, { pal: GOLD, faceRim: 'rgba(255,230,170,.6)', vcol: '#6a5236' }); T.roll(.056); T.lightArches([1, 1, 1, 1, 1], GOLD, 1.5); T.back.material.color.setScalar(1.2);
  const W = [0, 1, 2, 3].map(i => { const m = human(S.U, { h: .019 + (i === 2 ? .002 : 0), z: -.1505, col: '#1c1208', rim: .4 }); S.scene.add(m.g); return m; });
  const C = clawd(S.U, { u: .0032, z: -.07, glow: .4 }); S.scene.add(C.g);
  return { S, update(t) {
    const k = eio(seg(t, E.T0 - .6, E.T0 + E.dur)), d = lerp(.44, .64, k), cx = lerp(MX - .02, MX - .01, k), cy = camY(G, .67, d);
    aim(S.cam, [cx, cy, -.08 + d, cx, cy, -.08], t, { hand: .0003 });
    T.V.light([1, ss(seg(t, H.l17, H.l17 + .3)), ss(seg(t, H.l17 + 1.2, H.l17 + 1.5))]);
    const wk = (t - E.T0) * .0035;
    W.forEach((m, i) => { const x = -.022 - wk - i * .007, ph = t * 6 + i; m.set({ x, y: -.004 + (-.022 - x) * .2 + Math.abs(Math.sin(ph)) * .0004, a: Math.sin(ph) * .2 }); flip(m); });
    const turn = ss(seg(t, H.pregunta - .3, H.pregunta + .2)), hop = Math.sin(Math.PI * seg(t, H.pregunta - .3, H.pregunta + .1)) * .004;
    C.set({ x: MX - .048, y: G - .001 + hop, look: lerp(.9, 0, turn), blink: t > H.pregunta + .3 ? blinkAt(t, 2.6, .2) : blinkAt(t, 3.6), aL: .3 * turn, aR: .3 * turn, k: 1.05 });
    this._f = fsOf(S, -.07);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(.32, 1.1) }; }, grade() { return { vig: .36 }; } };
}
