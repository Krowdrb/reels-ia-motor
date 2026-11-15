// The twelve shots of «El frasco roto» (María de Betania, Juan 12:1–8; Marcos 14:3–9). Each: { S, update(t), post(), grade() }; t in film seconds.
// One house, one night, one light. Clawd sits in the niche of the back wall from the first frame: a witness who never interacts.
// Jesus, María, Marta, Lázaro and Judas are dark, quiet silhouettes. God is never drawn. No cross is drawn: only the faint shadow of the window's crossbar.
// CPU budget: ≤ 9 layers per shot, no particles, one burst() in the whole film (S11, in the window), maxCoc ≤ 6, bloom ≤ .45, light shadow maps.
import * as THREE from 'three';
import { skyPanel, moon, setMoon, text, burst } from './paper.js';
import { stage, aim } from './stage.js';
import { mulberry, seg, ss, eio, eo, lerp, clamp, TAU } from './lib.js';
import { mk, cut, tint, clawd, human, cabello, frasco, chorro, lamparas, jarra, diners, manos } from './actors.js';

const blo = (s = .3, th = 1.1) => ({ strength: Math.min(s, .45), radius: .55, threshold: th });
const lay = (S, o) => S.add(mk(S.U, o));
const col3 = c => new THREE.Color(c);
const mixHex = (a, b, k) => '#' + col3(a).lerp(col3(b), clamp(k)).getHexString();
const setL = (S, x, y, r, lit, c) => { S.U.uLight.value.x = x; S.U.uLight.value.y = y; S.U.uLightR.value = r; S.U.uLit.value = lit; if (c) S.U.uLightCol.value.copy(c); };
const blinkAt = (t, per = 3.3, ph = 0) => 1 - .9 * Math.max(0, 1 - Math.abs(((t + ph) % per) - .1) / .1);
const fsOf = (S, z) => S.cam.position.z - z;
const U_ = m => m.material.userData.u;
// a light stage for CPU rendering: smaller shadow map, fewer blur samples
function stg(o) { const S = stage(o); S.key.shadow.mapSize.set(1024, 1024); S.key.shadow.blurSamples = 8; S.key.shadow.radius = o.shadowR ?? 6; return S; }

// —— palettes: plum night → gold. Nothing blue next to the gold; nothing orange or terracotta behind Clawd ——
export const NIGHT = { wall: '#2a1a2a', recess: '#150d13', beam: '#150d11', disc: '#1c141a', table: '#120c10', front: '#07050a', fig: '#0b070a',
  sky: [[0, '#0c0912'], [.55, '#1a1424'], [1, '#2a1e34']], far: '#3a2c3e', mid: '#241a28', hill: '#0c080e', light: '#ffc888' };
export const COOL = { wall: '#241c22', recess: '#140e12', beam: '#130d10', disc: '#1a1418', table: '#110c0f', front: '#07050a', fig: '#0b070a', light: '#e8c0a0' };
export const GOLD = { wall: '#e8c47c', recess: '#f6e2ac', beam: '#5a3c1c', disc: '#4a3018', table: '#3a2614', front: '#1c1208', fig: '#1c1108',
  far: '#e8c47c', mid: '#b88a48', hill: '#22150a', light: '#ffd98a' };
const LIFT = [.012, .006, .004];   // warm-plum shadows (the default lift is bluish)
const NIGHT_G = { vig: .55, sat: .95, contrast: .14, gain: [1.03, .99, .97], lift: LIFT };
const GOLD_G = { vig: .45, sat: .98, contrast: .12, gain: [1.04, 1, .93], lift: LIFT };
const nightStage = (o = {}) => stg({ light: [-.077, .008, -.12], lightR: .07, lightCol: NIGHT.light, key: .42, keyCol: '#eadace', keyPos: [-.07, .3, .3], keyTarget: [0, -.03, -.1], keyAngle: .7,
  amb: .34, ambCol: '#8a6aa8', floor: .1, ...o });

// —— the room: geometry shared by every interior shot ——
export const GROUND = -.06, WALLZ = -.12, RECZ = -.134, LAMPZ = -.129, CLZ = -.126, SKYZ = -.175;
export const NICHE = { x0: -.092, x1: -.012, y0: -.004, ys: .036, ry: .03 };     // a round-headed niche (arch: half-ellipse on top)
export const WIN = { x0: .004, x1: .05, y0: .002, ys: .04, ry: .022, bar: .0016 };
export const SHADOW = { x: .062, y: .03 };                                       // centre of the crossbar's shadow on the wall
export const LAMPS = { x: -.086, gap: .009, s: .0042 };                          // first lamp; the three sit on the left of the niche ledge
export const CL = { x: -.031, y: NICHE.y0 + .0012 };                              // Clawd in the niche, right of the lamps
export const XM = -.092, XL = -.06, XJ = -.024, XMa = .026;                       // Marta, Lázaro, Jesus, María (floor x)
const archPath = (x, A, grow = 0) => { const cx = (A.x0 + A.x1) / 2, rx = (A.x1 - A.x0) / 2 + grow; x.beginPath(); x.moveTo(cx - rx, A.y0 - grow); x.lineTo(cx - rx, A.ys); x.ellipse(cx, A.ys, rx, A.ry + grow, 0, Math.PI, 0, true); x.lineTo(cx + rx, A.y0 - grow); x.closePath(); };
// the shadow the window's crossbar throws on the wall: two soft bands (a skewed projection), drawn as a hole in the lamplight
function crossShadow(x, sharp, k = 1) {
  x.save(); x.filter = `blur(${sharp ? 3 : 8}px)`; x.globalAlpha = (sharp ? .55 : .32) * k;
  x.translate(SHADOW.x, SHADOW.y); x.transform(1, .05, .16, 1, 0, 0);
  x.fillRect(-.003, -.038, .006, .07); x.fillRect(-.008, .0, .042, .0055);
  x.restore();
}

// the night outside, painted on the sky panel (hills, the road down to the pale far walls of Jerusalem) — interior shots only
function paintedNight(x) {
  x.save(); x.translate(0, -.05);   // the panel is centred at y = .05: draw in world coordinates
  x.fillStyle = NIGHT.far; x.beginPath(); x.moveTo(-.35, -.3); for (let u = -.35; u <= .35; u += .002) x.lineTo(u, .018 + .006 * Math.sin(u * 40 + 1) + .003 * Math.sin(u * 97)); x.lineTo(.35, -.3); x.closePath(); x.fill();
  x.fillStyle = '#4e3e4c'; for (let i = 0; i < 9; i++) { const cx = .034 + i * .0028; x.fillRect(cx, .016, .0022, .005 + (i % 3 === 1 ? .002 : 0)); }   // the far walls, pale
  x.fillStyle = NIGHT.mid; x.beginPath(); x.moveTo(-.35, -.3); for (let u = -.35; u <= .35; u += .002) x.lineTo(u, .006 + .007 * Math.sin(u * 23 + 2) + .002 * Math.sin(u * 71)); x.lineTo(.35, -.3); x.closePath(); x.fill();
  x.strokeStyle = '#3c2e3a'; x.lineWidth = .0012; x.beginPath(); x.moveTo(.012, -.01); x.quadraticCurveTo(.03, .004, .04, .0105); x.stroke();   // the road
  x.restore();
}

// casa(S, o): sky (+ moon), recess (inside the niche), the back wall with niche / window / door and the lamplight on it, beams, lamps, diners, table, front floor
// o: pal, sharp (the crossbar shadow), beams, diners, table, sky:false (S11 builds its own outside)
export function casa(S, o = {}) {
  const P = o.pal || NIGHT, L = {};
  if (o.sky !== false) {
    L.sky = S.add(skyPanel({ w: .6, h: .5, y: .05, z: SKYZ, stops: NIGHT.sky, stars: 90, starMinY: .03, seed: 4, ppm: 2400, extra: paintedNight }));
    L.moon = moon({ r: .0048, x: .0425, y: .052, z: SKYZ + .002, gain: 1.6, core: '#fbf2dc', mid: '#f3e6c8', edge: '#e6d3ae', halo: 4, haloGain: .22, haloCol: '#e8d8b8',
      art: x => { x.save(); x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(-.0055 * 1.45, .0055 * .15, .0055 * 1.02, 0, TAU); x.fill(); x.restore(); } });
    S.scene.add(L.moon);
  }
  // inside the niche and the door: the recess, warm where the lamps are
  L.recess = lay(S, { w: .3, h: .16, y: .0, z: RECZ, col: P.recess, trans: .2, ppm: 2200, shadow: false, finish: { rim: 0, under: .3 }, draw: x => {
    archPath(x, NICHE, .003); x.fill(); x.fillRect(-.152, GROUND - .01, .036, .1);
  }, glowDraw: x => { x.fillStyle = '#000'; x.fillRect(-.15, -.08, .3, .16); const g = x.createRadialGradient(-.074, .006, 0, -.074, .006, .07); g.addColorStop(0, '#fff'); g.addColorStop(.5, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,.15)'); x.fillStyle = g; x.fillRect(-.15, -.08, .3, .16); },
    glow: 1.1, glowCol: '#a88a6a', glowRes: .5 });
  // the back wall
  L.wall = lay(S, { w: .5, h: .42, y: .03, z: WALLZ, col: P.wall, trans: .12, ppm: 1900, finish: { rim: .5, rimPx: 4, under: .4 }, draw: x => {
    x.translate(0, -.03); x.fillRect(-.25, -.21, .5, .42);
    cut(x, () => { archPath(x, NICHE); x.fill(); archPath(x, WIN); x.fill(); x.fillRect(-.15, GROUND - .02, .032, .105); });
    for (const f of [1 / 3, 2 / 3]) { const bx = lerp(WIN.x0, WIN.x1, f); x.fillRect(bx - WIN.bar / 2, WIN.y0 - .002, WIN.bar, WIN.ys + WIN.ry - WIN.y0 + .004); }
    x.fillRect(WIN.x0 - .002, WIN.ys - WIN.bar / 2, WIN.x1 - WIN.x0 + .004, WIN.bar);   // two mullions and the crossbar (a lattice)
    x.save(); x.globalCompositeOperation = 'source-atop'; x.fillStyle = '#262626'; crossShadow(x, o.sharp, .5); x.restore();
    x.fillRect(NICHE.x0 - .004, NICHE.y0 - .0045, NICHE.x1 - NICHE.x0 + .008, .0035); x.fillRect(WIN.x0 - .004, WIN.y0 - .0045, WIN.x1 - WIN.x0 + .008, .0035);   // sills
  }, glowDraw: x => {
    x.translate(0, -.03); x.fillStyle = '#000'; x.fillRect(-.25, -.21, .5, .42);   // emissive maps are read as rgb only: start from black, never from transparent
    const g = x.createRadialGradient(-.066, .012, 0, -.066, .012, .17); g.addColorStop(0, '#fff'); g.addColorStop(.3, 'rgba(255,255,255,.6)'); g.addColorStop(.65, 'rgba(255,255,255,.3)'); g.addColorStop(1, 'rgba(255,255,255,.08)');
    x.fillStyle = g; x.fillRect(-.25, -.21, .5, .42);
    const g2 = x.createRadialGradient(SHADOW.x + .01, SHADOW.y, 0, SHADOW.x + .01, SHADOW.y, .075); g2.addColorStop(0, 'rgba(255,255,255,.7)'); g2.addColorStop(1, 'rgba(255,255,255,0)');   // the lamplight reaching the wall right of the window
    x.fillStyle = g2; x.fillRect(-.25, -.21, .5, .42);
    x.fillStyle = '#000'; crossShadow(x, o.sharp);
  }, glow: 1.0, glowCol: '#8a5e50', glowRes: .5 });
  if (o.beams !== false) L.beams = lay(S, { w: .5, h: .12, y: .14, z: WALLZ + .006, col: P.beam, trans: .06, ppm: 1600, finish: { rim: .5, rimPx: 4, under: .4 }, draw: x => {
    x.translate(0, -.14); x.beginPath(); x.moveTo(-.25, .2); x.lineTo(-.25, .116); for (let u = -.25; u <= .25; u += .005) x.lineTo(u, .112 + .0012 * Math.sin(u * 40)); x.lineTo(.25, .2); x.closePath(); x.fill();
    for (let i = -6; i <= 6; i++) { x.beginPath(); x.ellipse(i * .036, .108, .0045, .0035, 0, 0, TAU); x.fill(); }   // round rafter ends under the beam
  } });
  L.lamps = lamparas(S.U, { s: LAMPS.s, gap: LAMPS.gap, z: LAMPZ }); L.lamps.g.position.set(LAMPS.x, NICHE.y0 + .0004, LAMPZ); S.scene.add(L.lamps.g);
  if (o.diners !== false) { L.disc = diners(S.U, { n: 3, h: .062, z: -.104, col: P.disc, gap: .028, seed: 7 }); L.disc.position.set(-.07, GROUND + .004, -.104); S.scene.add(L.disc); }
  if (o.table !== false) L.table = lay(S, { w: .16, h: .03, x: -.07, y: GROUND + .004, z: -.096, col: P.table, trans: .05, ppm: 3200, finish: { rim: .55, rimPx: 3, under: .3 }, draw: x => {
    x.translate(.07, -GROUND - .004);
    x.fillRect(-.145, GROUND + .016, .15, .004); x.fillRect(-.14, GROUND, .006, .017); x.fillRect(-.002, GROUND, .006, .017);
    for (const [cx, w, hh] of [[-.13, .006, .004], [-.112, .004, .006], [-.09, .008, .003], [-.06, .005, .005], [-.035, .007, .0035], [-.016, .004, .006]]) { x.beginPath(); x.roundRect(cx - w / 2, GROUND + .019, w, hh, .001); x.fill(); }
  } });
  L.front = lay(S, { w: .7, h: .3, y: -.21, z: -.045, col: P.front, trans: .03, ppm: 1500, finish: { rim: .45, rimPx: 4, under: .3 }, draw: x => {
    x.translate(0, .21); x.beginPath(); x.moveTo(-.35, -.36); for (let u = -.35; u <= .35; u += .002) x.lineTo(u, GROUND - .007 + .0012 * Math.sin(u * 60 + 1) + .0008 * Math.sin(u * 151)); x.lineTo(.35, -.36); x.closePath(); x.fill();
  } });
  L.P = P;
  // paint the room between two palettes; ks: per-layer amounts (wall, recess, beams, disc, table, front)
  L.paint = (A, B, ks) => {
    for (const n of ['wall', 'recess', 'beams', 'disc', 'table', 'front']) {
      const m = n === 'disc' ? L.disc?.children[0] : L[n]; if (!m) continue;
      const key = n === 'beams' ? 'beam' : n; tint(m, mixHex(A[key], B[key], ks[n] ?? 0));
    }
  };
  L.trans = (ks) => { for (const n in ks) { const m = n === 'disc' ? L.disc?.children[0] : L[n]; if (m) U_(m).uTrans.value = ks[n]; } };
  L.lamplight = k => { U_(L.wall).uGlowLit.value = k; U_(L.recess).uGlowLit.value = k; };
  return L;
}

// —— the cast ——
const JESUS = (S, P, o = {}) => { const J = human(S.U, { h: .074, z: -.086, pose: 'sit', col: P.fig, rim: .78, ...o }); S.scene.add(J.g); return J; };
const MARIA = (S, P, o = {}) => { const M = human(S.U, { h: .074, z: -.078, pose: 'kneel', col: P.fig, rim: .7, veil: true, ...o }); S.scene.add(M.g); return M; };
const CLAWD = (S, o = {}) => { const C = clawd(S.U, { u: .0022, z: CLZ, glow: .42, ...o }); S.scene.add(C.g); return C; };
const LAZARO = (S, P, o = {}) => { const F = human(S.U, { h: .07, z: -.09, pose: 'sit', col: P.fig, rim: .6, ...o }); S.scene.add(F.g); return F; };
const MARTA = (S, P, o = {}) => { const F = human(S.U, { h: .074, z: -.092, pose: 'stand', col: P.fig, rim: .6, veil: true, ...o }); S.scene.add(F.g); return F; };
// María kneeling at the feet, facing -x toward Jesus; bow 0..1
const setMaria = (M, bow = 0, a = .9) => M.set({ x: XMa, y: GROUND, flip: true, rot: .16 * bow, a });
const setJesus = (J, a = .35) => J.set({ x: XJ, y: GROUND, a });

// the paper title strip: a cream card glowing softly, with the letters cut out (the dark room shows through them)
function titleStrip(S) {
  const t = lay(S, { w: .124, h: .06, z: -.03, col: '#e9d8b0', trans: .35, shadow: false, recv: false, ppm: 9000, finish: { rim: .3, under: .2 }, draw: x => {
    x.beginPath(); x.roundRect(-.06, -.027, .12, .054, .002); x.fill();
    cut(x, () => {
      text(x, 'MARÍA', 0, .0125, .0128, 'Cinzel', { weight: 800, fill: '#000' });
      text(x, 'DE BETANIA', 0, -.0025, .0112, 'Cinzel', { weight: 800, fill: '#000' });
      x.fillRect(-.02, -.0118, .04, .0006);
      text(x, 'Juan 12:1–8', 0, -.0185, .0088, 'Playfair', { weight: 'italic 600', fill: '#000' });
    });
  }, glowDraw: x => { x.fillStyle = '#fff'; x.fillRect(-.062, -.029, .124, .058); }, glow: .5, glowCol: '#e9d8b0', glowRes: .2 });
  return t;
}
function placeTitle(S, title, t, t0, t1) {
  const reveal = ss(seg(t, t0, t0 + .6)) * (1 - ss(seg(t, t1 - .4, t1)));
  const cz = S.cam.position.z + .03, ts = cz / .55;
  title.scale.setScalar(ts); title.position.x = S.cam.position.x; title.position.y = S.cam.position.y + .2309 * cz * .6;
  U_(title).uClip.value.set(title.position.x - .062 * ts, title.position.y, .13 * reveal * ts, 0); title.visible = reveal > .002;   // grows from the left edge
}

// S1 the hook: two hands hold a tall alabaster jar at the niche, in front of three small flames; Clawd sits beside them. On «rompió» a crack of gold crosses the stone.
export function S1(E) {
  const { H } = E;
  const S = nightStage({ light: [-.072, .01, -.12], lightR: .03, floor: .06, key: .7, amb: .22 });
  const R = casa(S, { diners: false, table: false });
  const F = frasco(S.U, { h: .032, z: -.108 }); S.scene.add(F.g);
  const hands = manos(S.U, { s: .0062, z: -.106 }); S.add(hands);
  const C = CLAWD(S, { u: .0027 });
  const title = titleStrip(S);
  const gold = col3('#ffd98a'), warm = col3(NIGHT.light);
  return { S, update(t) {
    const z = lerp(.2, .165, eio(seg(t, 0, E.dur))), cx = lerp(-.054, -.052, seg(t, 0, E.dur)), cy = lerp(.016, .012, seg(t, 0, E.dur));
    aim(S.cam, [cx, cy, z, cx, cy, -.12], t, { hand: .0003 });
    const cr = ss(seg(t, H.rompio - .05, H.rompio + .22)), flash = Math.exp(-Math.max(0, t - H.rompio) * 3) * (t > H.rompio ? 1 : 0);
    const fx = -.068, fy = -.006;
    F.set({ x: fx, y: fy, crack: cr, shine: 1 + .8 * flash });
    hands.position.set(fx - .0062 * 4, fy - .0062 * 2, -.106);
    const lean = .45 * ss(seg(t, H.rompio, H.rompio + .12)) * (1 - ss(seg(t, H.rompio + .35, H.rompio + 1.2)));
    R.lamps.set(t, { k: 1 - .25 * lean, lean });
    R.lamplight(.55);
    const brow = ss(seg(t, H.trabajo - .1, H.trabajo + .2)) * (1 - ss(seg(t, H.trabajo + .9, H.trabajo + 1.3)));
    const back = ss(seg(t, H.rompio, H.rompio + .25));
    C.set({ x: CL.x + back * .0025, y: CL.y, look: -1, lookY: lerp(-.5, .8, brow), blink: blinkAt(t, 3.1, .6), k: 1 });
    setL(S, -.072, .01, lerp(.03, .045, cr), 1.2 + .5 * flash, warm.clone().lerp(gold, cr));
    placeTitle(S, title, t, .3, 3.0);
    this._f = fsOf(S, -.108);
  }, post() { return { focus: this._f, aper: 4, maxCoc: 5, bloom: blo(.34, 1.05) }; }, grade() { return NIGHT_G; } };
}

// S2 the window and the shadow: the camera draws back from the niche and pans to the window: hills, a gibbous moon, the road down to Jerusalem's pale walls.
// The lamps throw the shadow of the window's crossbar on the wall, large and soft. Clawd turns his eyes to the window on «seis días».
export function S2(E) {
  const { H } = E;
  const S = nightStage();
  const R = casa(S, { diners: false, table: false });
  const C = CLAWD(S, { u: .0024 });
  return { S, update(t) {
    const k = eio(seg(t, E.T0, E.T0 + E.dur + .3)), cx = lerp(-.034, .012, k), cy = lerp(.014, .018, k), z = lerp(.24, .38, k);
    aim(S.cam, [cx, cy, z, cx, cy, -.12], t, { hand: .0004 });
    R.lamps.set(t); R.lamplight(.6);
    C.set({ x: CL.x, y: CL.y, look: lerp(-.6, 1, ss(seg(t, H.seis - .2, H.seis + .3))), blink: blinkAt(t, 3.4, 1.2), k: 1 });
    setMoon(R.moon, 1);
    this._f = fsOf(S, WALLZ);
  }, post() { return { focus: this._f, aper: 4, maxCoc: 4, bloom: blo(.3, 1.05) }; }, grade() { return NIGHT_G; } };
}

// S3 the supper: a low table across the frame; Marta stands and pours from a pitcher; Lázaro sits at the table; Jesus beside him, serene, a warmer rim;
// three disciples behind. A short lateral move right to left with parallax. Clawd small in the niche, watching the table.
export function S3(E) {
  const { H } = E;
  const S = nightStage({ light: [-.06, .0, -.12], lightR: .1 });
  const R = casa(S, {});
  const Ma = MARTA(S, NIGHT), Lz = LAZARO(S, NIGHT), J = JESUS(S, NIGHT, { rim: .9 }), M = MARIA(S, NIGHT);
  const jug = jarra(S.U, { h: .011, z: -.0915 }); S.add(jug);
  const C = CLAWD(S, { u: .0021 });
  return { S, update(t) {
    const k = eio(seg(t, E.T0, E.T0 + E.dur)), cx = lerp(-.012, -.034, k);
    aim(S.cam, [cx, -.03, .5, cx, -.03, -.12], t, { hand: .0004 });
    const pour = ss(seg(t, H.marta + .2, H.marta + .8)) * (1 - ss(seg(t, H.lazaro + .6, H.lazaro + 1.2)));
    Ma.set({ x: XM, y: GROUND, a: lerp(.6, 1.15, pour) });
    const [hx, hy] = Ma.hand(1); jug.position.set(hx, hy, -.0915); jug.rotation.z = -lerp(.1, .9, pour);
    Lz.set({ x: XL, y: GROUND, a: .4 });
    setJesus(J, .38);
    M.g.visible = false;
    R.lamps.set(t); R.lamplight(.6);
    C.set({ x: CL.x, y: CL.y, look: lerp(-.4, .2, ss(seg(t, H.lazaro - .2, H.lazaro + .4))), lookY: -.6, blink: blinkAt(t, 3.2, .4), k: 1 });
    this._f = fsOf(S, -.09);
  }, post() { return { focus: this._f, aper: 4, maxCoc: 5, bloom: blo(.3, 1.05) }; }, grade() { return NIGHT_G; } };
}

// S4 María: kneeling at the feet of Jesus with the jar; on «derrama» she breaks off the neck (the crack of S1 completes), a thread of gold comes out and she pours.
// Rack focus from him to her. Clawd leans forward, hands on the ledge.
export function S4(E) {
  const { H } = E;
  const S = nightStage({ light: [-.03, -.02, -.1], lightR: .08 });
  const R = casa(S, { table: false });
  const J = JESUS(S, NIGHT, { rim: .9 }), M = MARIA(S, NIGHT, { two: true });
  const F = frasco(S.U, { h: .013, z: -.0765 }); S.scene.add(F.g);
  const th = chorro(S.U, { l: .012, z: -.0768, w: .0008 }); S.add(th);
  const C = CLAWD(S, { u: .0021 });
  const gold = col3('#ffd98a'), warm = col3(NIGHT.light);
  const tb = H.rompe + .45;   // the neck comes off
  return { S, update(t) {
    const k = eio(seg(t, E.T0, E.T0 + E.dur)), z = lerp(.34, .31, k), cx = lerp(-.004, .0, k);
    aim(S.cam, [cx, -.03, z, cx, -.026, -.12], t, { hand: .0004 });
    setJesus(J, .36);
    const tilt = ss(seg(t, tb + .4, tb + .9));
    setMaria(M, lerp(.3, .75, tilt), lerp(1.05, .8, tilt));
    M.arm2.rotation.z = lerp(1.25, 1.0, tilt);
    const [hx, hy] = M.hand(.95);
    const off = seg(t, tb, tb + .7), cr = ss(seg(t, tb - .25, tb));
    F.set({ x: hx, y: hy - .004, rot: lerp(.15, 1.25, tilt), crack: Math.max(.6, cr), shine: 1, off: off > 0 ? off : 0, neckGone: off >= 1 });
    F.g.visible = true;
    // the poured thread falls from the broken mouth to the feet
    F.g.updateMatrixWorld(true); const mouth = new THREE.Vector3(0, F.h * .74, 0).applyMatrix4(F.g.matrixWorld);
    th.position.set(mouth.x, mouth.y, -.0768); th.userData.set(ss(seg(t, tb + .35, tb + .8)) * (mouth.y - GROUND - .002) / th.userData.l, 1.2 + .2 * Math.sin(t * 9));
    R.lamps.set(t); R.lamplight(.6);
    const lean = ss(seg(t, E.T0 + .2, E.T0 + .8));
    C.set({ x: CL.x, y: CL.y, look: .7, lookY: -.7 * lean, aL: .6 * lean, aR: .6 * lean, tuck: .25 * lean, blink: blinkAt(t, 3.5, .9), k: 1 });
    const L = ss(seg(t, tb, tb + .5));
    setL(S, lerp(-.03, hx, L), lerp(-.02, hy, L), lerp(.08, .04, L), 1 + .4 * L, warm.clone().lerp(gold, L));
    this._f = lerp(fsOf(S, -.086), fsOf(S, -.078), ss(seg(t, H.rompe - .2, H.rompe + .5)));
  }, post() { return { focus: this._f, aper: 5, maxCoc: 5, bloom: blo(.34, 1.05) }; }, grade() { return NIGHT_G; } };
}

// S5 the feet and the hair: low, close. María bows; her hair falls from the mantle as one long straight sheet and turns slowly down to his feet.
// Jesus sits above, still. A thin thread of warm light from the jar. Clawd far behind in the niche, soft, still, arms down.
export function S5(E) {
  const { H } = E;
  const S = nightStage({ light: [.01, GROUND + .006, -.08], lightR: .05, lightCol: '#ffd59a', floor: .14 });
  const R = casa(S, { table: false, diners: false }); R.moon.visible = false;
  const J = JESUS(S, NIGHT, { rim: .9 }), M = MARIA(S, NIGHT);
  const hair = cabello(S.U, { h: .074, z: -.0775, col: '#120a0d' }); S.add(hair);
  const F = frasco(S.U, { h: .013, z: -.0765 }); S.scene.add(F.g);
  const C = CLAWD(S, { u: .0022 });
  return { S, update(t) {
    const k = eio(seg(t, E.T0, E.T0 + E.dur)), z = lerp(.26, .235, k);
    aim(S.cam, [-.005, -.034, z, -.003, -.03, -.12], t, { hand: .0003 });
    setJesus(J, .36);
    const bow = lerp(.75, 1, ss(seg(t, E.T0, H.cabello)));
    setMaria(M, bow, .55);
    const [nx, ny] = M.at(M.P.nape[0], M.P.nape[1]);
    hair.position.set(nx, ny, -.0775);
    hair.rotation.z = lerp(-.15, -.62, eio(seg(t, E.T0 + .1, H.cabello + .4)));   // from hanging behind her to lying beside his feet (she faces -x)
    F.set({ x: XMa - .006, y: GROUND, rot: .5, crack: 1, shine: .9, off: 1, neckGone: true });
    R.lamps.set(t); R.lamplight(.6);
    C.set({ x: CL.x, y: CL.y, look: .5, lookY: -.6, blink: blinkAt(t, 4, .3), k: 1 });
    this._f = fsOf(S, -.078);
  }, post() { return { focus: this._f, aper: 5, maxCoc: 6, bloom: blo(.32, 1.05) }; }, grade() { return NIGHT_G; } };
}

// the wide room used by S6 (the house fills), S7 (silence 1), S8 (the protest) and S11 (the climax)
function wide(o = {}) {
  const S = nightStage(o.stage || {});
  const R = casa(S, o.casa || {});
  const Ma = MARTA(S, NIGHT), Lz = LAZARO(S, NIGHT), J = JESUS(S, NIGHT, { rim: .9 }), M = MARIA(S, NIGHT);
  const F = frasco(S.U, { h: .012, z: -.0765 }); S.scene.add(F.g);
  const C = CLAWD(S, { u: .0022 });
  Ma.set({ x: XM, y: GROUND, a: .3 }); Lz.set({ x: XL, y: GROUND, a: .4 }); setJesus(J, .38); setMaria(M, .7, .55);
  F.set({ x: XMa - .007, y: GROUND, rot: .5, crack: 1, shine: .9, off: 1, neckGone: true });
  return { S, R, Ma, Lz, J, M, F, C, figs: [Ma, Lz, J, M] };
}
const FX = XMa - .007, FY = GROUND + .003;   // the broken jar on the floor: the source of the light
// gold state of the room: g = { wall, recess, beams, disc, table, front } amounts 0..1
const BASE_T = { wall: .12, recess: .2, beams: .06, disc: .06, table: .05, front: .03 };
function goldRoom(R, A, g, top = .55) {
  R.paint(A, GOLD, g);
  const tr = {}; for (const n in BASE_T) tr[n] = lerp(BASE_T[n], n === 'front' ? .12 : top, g[n] ?? 0); R.trans(tr);
}
const mixPal = (A, B, k) => { const o = {}; for (const n in A) if (typeof A[n] === 'string' && B[n]) o[n] = mixHex(A[n], B[n], k); return o; };
const tintFigs = (figs, c) => { for (const F of figs) for (const m of [F.body, F.arm, F.arm2]) if (m) tint(m, c); };

// S6 the house fills: the perfume as light. It is born in the jar on the floor and climbs layer by layer: table, guests, wall, beams turn golden and translucent.
// The front stays dark. The flames brighten. A slow crane up. Clawd lifts his face and breathes in.
export function S6(E) {
  const { H } = E;
  const W = wide({ stage: { light: [FX, FY, -.08], lightR: .03 } }); const { S, R, C } = W;
  const gold = col3(GOLD.light), warm = col3(NIGHT.light);
  const T = E.T0 + .25;
  return { S, update(t) {
    const k = eio(seg(t, E.T0, E.T0 + E.dur + .4)), cy = lerp(-.036, -.006, k), z = lerp(.46, .5, k);
    aim(S.cam, [-.018, cy, z, -.018, cy, -.12], t, { hand: .0004 });
    const q = i => ss(seg(t, T + i * .35, T + i * .35 + .55));
    const g = { table: q(0), disc: q(1), wall: q(2) * .62, recess: q(3) * .7, beams: q(4) * .6 };
    goldRoom(R, NIGHT, g, .5);
    const L = ss(seg(t, T, T + 1.8));
    setL(S, FX, lerp(FY, .02, L), lerp(.03, .2, L), lerp(1, 1.5, L), warm.clone().lerp(gold, L));
    S.U.uFloor.value = lerp(.12, .3, L); S.key.intensity = lerp(.9, 1.15, L); S.amb.intensity = lerp(.26, .36, L);
    tintFigs(W.figs, mixHex(NIGHT.fig, '#140b08', L));
    R.lamps.set(t, { k: 1 + .35 * L }); R.lamplight(.6 + .4 * L);
    const br = ss(seg(t, H.perfume - .6, H.perfume));
    C.set({ x: CL.x, y: CL.y + br * .0012, s: 1 + .03 * br, aL: .4 * br, aR: .4 * br, look: .2, lookY: lerp(-.3, .9, br), blink: lerp(1, .35, br), k: 1 + .2 * L });
    this._L = L; this._f = fsOf(S, -.086);
  }, post() { return { focus: this._f, aper: 3, maxCoc: 4, bloom: blo(.3 + .08 * this._L, 1.02) }; }, grade() { return { ...NIGHT_G, sat: lerp(.95, 1.02, this._L), vig: lerp(.55, .48, this._L) }; } };
}
const S6END = { table: 1, disc: 1, wall: .62, recess: .7, beams: .6 };

// S7 silence 1: the whole room, locked. Nothing moves but the flames. The gold stays.
export function S7(E) {
  const W = wide({ stage: { light: [FX, .02, -.08], lightR: .2, lightCol: GOLD.light, floor: .3, key: 1.15, amb: .36 } }); const { S, R, C } = W;
  goldRoom(R, NIGHT, S6END, .5); tintFigs(W.figs, '#140b08');
  return { S, update(t) {
    aim(S.cam, [-.018, -.006, .5, -.018, -.006, -.12], t, { hand: .00015 });
    R.lamps.set(t, { k: 1.35 }); R.lamplight(1);
    C.set({ x: CL.x, y: CL.y, look: .2, lookY: -.2, blink: 1, k: 1.2 });
    this._f = fsOf(S, -.086);
  }, post() { return { focus: this._f, aper: 3, maxCoc: 4, bloom: blo(.38, 1.02) }; }, grade() { return { ...NIGHT_G, sat: 1.02, vig: .48 }; } };
}

// S8 the protest: in the nearest, darkest layer a disciple stands up — Judas, a large silhouette in profile, a small purse at his belt.
// He stretches his arm toward the jar on «trescientos denarios»; the gold retreats from the back layers to the front until only María keeps it; the grade cools to plum.
// On «la bolsa» his hand closes on it. Rack focus her → him → her. Clawd straightens and only looks: at him, then at her.
export function S8(E) {
  const { H } = E;
  const W = wide({ stage: { light: [FX, .02, -.08], lightR: .2, lightCol: GOLD.light, floor: .3, key: 1.15, amb: .36 } }); const { S, R, C } = W;
  const Jd = human(S.U, { h: .098, z: -.052, pose: 'stand', col: '#060406', rim: .5, bolsa: true }); S.scene.add(Jd.g);
  const gold = col3(GOLD.light), cool = col3(COOL.light);
  const r0 = H.denarios - .3, r1 = H.bolsa + .4;   // the gold retreats between these
  return { S, update(t) {
    const rise = ss(seg(t, E.T0 + .05, H.protesta + .5));
    const k = eio(seg(t, E.T0, E.T0 + E.dur)), z = lerp(.5, .46, k), cx = lerp(-.018, -.02, k);
    aim(S.cam, [cx, -.012, z, cx, -.012, -.12], t, { hand: .0004 });
    const reach = ss(seg(t, H.denarios - .5, H.denarios + .1)) * (1 - ss(seg(t, H.bolsa - .7, H.bolsa - .1)));
    const grip = ss(seg(t, H.bolsa - .5, H.bolsa));
    Jd.set({ x: -.084, y: lerp(-.09, -.07, rise), rot: lerp(.08, 0, rise), a: lerp(lerp(.12, 1.12, reach), .42, grip) });
    const q = i => 1 - ss(seg(t, r0 + i * .7, r0 + i * .7 + 1.0));   // back first: beams, recess, wall, guests, table
    const c = ss(seg(t, r0, r1));
    goldRoom(R, mixPal(NIGHT, COOL, c), { beams: S6END.beams * q(0), recess: S6END.recess * q(1), wall: S6END.wall * q(2), disc: q(3), table: q(4) }, .5);
    setL(S, FX, lerp(.02, FY + .004, c), lerp(.2, .028, c), lerp(1.5, 1.05, c), gold.clone().lerp(cool, c * .4));
    S.U.uFloor.value = lerp(.3, .1, c); S.key.intensity = lerp(1.15, .85, c); S.amb.intensity = lerp(.36, .24, c);
    tintFigs(W.figs, mixHex('#140b08', NIGHT.fig, c));
    R.lamps.set(t, { k: lerp(1.35, .85, c) }); R.lamplight(lerp(1, .5, c));
    const straight = ss(seg(t, H.protesta - .1, H.protesta + .3));
    C.set({ x: CL.x, y: CL.y, look: lerp(lerp(.2, -1, straight), .8, ss(seg(t, H.bolsa + .4, H.bolsa + .9))), lookY: -.3, blink: blinkAt(t, 3.6, .2), k: lerp(1.2, 1, c) });
    this._c = c;
    const fj = fsOf(S, -.052), fm = fsOf(S, -.078);
    this._f = lerp(lerp(fm, fj, ss(seg(t, H.protesta + .2, H.protesta + .9))), fm, ss(seg(t, H.bolsa + .5, E.T0 + E.dur - .1)));
  }, post() { return { focus: this._f, aper: 4, maxCoc: 5, bloom: blo(lerp(.38, .26, this._c), 1.05) }; },
  grade() { return { vig: lerp(.48, .6, this._c), sat: lerp(1.02, .72, this._c), contrast: .14, gain: [lerp(1.03, 1.0, this._c), .99, lerp(.97, 1.0, this._c)], lift: LIFT }; } };
}

// the two-shot of Jesus and María at his feet, frontal: S9 (silence 2) and S10 (his answer). The crossbar's shadow is sharp now: the flames are still.
function pair(o = {}) {
  const S = nightStage({ light: [FX, FY + .004, -.08], lightR: .03, lightCol: '#ffd59a', floor: .1, key: .85, amb: .24, shadowR: 3, ...(o.stage || {}) });
  const R = casa(S, { sharp: true, table: false, diners: false });
  R.paint(NIGHT, COOL, { wall: 1, recess: 1 });
  const J = JESUS(S, NIGHT, { rim: .92, two: true }), M = MARIA(S, NIGHT);
  const F = frasco(S.U, { h: .012, z: -.0765 }); S.scene.add(F.g);
  F.set({ x: FX, y: GROUND, rot: .5, crack: 1, shine: .8, off: 1, neckGone: true });
  const C = CLAWD(S, { u: .002 });
  return { S, R, J, M, F, C };
}

// S9 silence 2: frontal, locked. María kneels, head down, the broken jar on the floor. Behind, the crossbar's shadow, clear for the first time since S2. Clawd still, at the side.
export function S9(E) {
  const { S, R, J, M, C } = pair();
  setJesus(J, .36); setMaria(M, 1, .5);
  return { S, update(t) {
    aim(S.cam, [.018, -.01, .4, .018, -.01, -.12], t, { hand: .00015 });
    R.lamps.set(t, { k: .8 }); R.lamplight(.62);
    C.set({ x: CL.x, y: CL.y, look: .3, lookY: -.5, blink: 1, k: 1 });
    this._f = fsOf(S, -.08);
  }, post() { return { focus: this._f, aper: 3, maxCoc: 4, bloom: blo(.26, 1.08) }; }, grade() { return { ...NIGHT_G, sat: .8, vig: .6 }; } };
}

// S10 «Déjala»: Jesus seated, María at his feet. On «Déjala» he slowly lifts one hand, palm open, forward; on «sepultura» the flames sink a little and the shadow stays behind him;
// on «no siempre» the hand comes down. A very slow dolly in. Clawd is still at the side for the whole shot: arms down, head low, no turn, no gesture.
export function S10(E) {
  const { H } = E;
  const { S, R, J, M, C } = pair();
  setMaria(M, 1, .5);
  C.set({ x: CL.x, y: CL.y, look: .1, lookY: -.8, blink: 1, k: .95 });
  return { S, update(t) {
    const k = eio(seg(t, E.T0, E.T0 + E.dur)), z = lerp(.38, .345, k), cx = lerp(.018, .016, k), cy = lerp(-.012, -.014, k);
    aim(S.cam, [cx, cy, z, cx, cy, -.12], t, { hand: .00025 });
    const up = ss(seg(t, H.dejala + .1, H.dejala + 1.2)) * (1 - ss(seg(t, H.siempre, H.siempre + 1.0)));
    J.set({ x: XJ, y: GROUND, a: .36, a2: lerp(.36, 2.35, up) });
    const dim = ss(seg(t, H.sepultura - .3, H.sepultura + .4)) * (1 - .6 * ss(seg(t, H.siempre, H.siempre + 1.2)));
    R.lamps.set(t, { k: lerp(.82, .6, dim) }); R.lamplight(lerp(.66, .54, dim));
    this._f = fsOf(S, -.084);
  }, post() { return { focus: this._f, aper: 3, maxCoc: 4, bloom: blo(.26, 1.08) }; }, grade() { return { ...NIGHT_G, sat: .84, vig: .6 }; } };
}

// —— outside: the hills seen through the window (S11) and the house on its hill (S12) ——
// sky drawn light (gold cream) and multiplied down to plum for the night; villages with emissive windows revealed by a growing circle (uGR)
const VILL = [[.05, .02], [.075, .016], [.1, .021], [-.03, .019], [.13, .014], [.16, .017], [-.07, .016], [.2, .013]];
function afuera(S, o = {}) {
  const sky = S.add(skyPanel({ w: o.sw || .8, h: o.sh || .6, y: o.sy ?? .1, z: o.skyZ ?? -.2, stops: o.stops || [[0, '#d8b070'], [.45, '#f0d498'], [1, '#f8ecc8']] }));
  const far = lay(S, { w: .8, h: .2, y: -.07, z: o.farZ ?? -.19, col: NIGHT.far, trans: .1, ppm: 2400, finish: { rim: .35, under: .15 }, draw: x => {
    x.translate(0, .07); x.beginPath(); x.moveTo(-.4, -.1); for (let u = -.4; u <= .4; u += .002) x.lineTo(u, .012 + .006 * Math.sin(u * 37 + 1) + .003 * Math.sin(u * 91)); x.lineTo(.4, -.1); x.closePath(); x.fill();
    for (let i = 0; i < 11; i++) x.fillRect(.105 + i * .0035, .012, .0028, .006 + (i % 4 === 1 ? .003 : 0));   // Jerusalem's walls, far
    for (const [vx, vy] of VILL) { x.fillRect(vx - .004, vy - .004, .008, .006); }
  }, glowDraw: x => { x.translate(0, .07); x.fillStyle = '#fff'; for (const [vx, vy] of VILL) x.fillRect(vx - .0012, vy - .0018, .0024, .0024); for (let i = 0; i < 5; i++) x.fillRect(.108 + i * .007, .015, .0016, .0018); },
    glow: 2.4, glowCol: '#ffd07a', glowRes: 1.2 });
  const mid = lay(S, { w: .8, h: .2, y: -.08, z: o.midZ ?? -.175, col: NIGHT.mid, trans: .08, ppm: 2200, finish: { rim: .4, under: .2 }, draw: x => {
    x.translate(0, .08); x.beginPath(); x.moveTo(-.4, -.1); for (let u = -.4; u <= .4; u += .002) x.lineTo(u, .0 + .008 * Math.sin(u * 21 + 2) + .0025 * Math.sin(u * 67 + 1)); x.lineTo(.4, -.1); x.closePath(); x.fill();
    cut(x, () => { x.lineWidth = .0016; x.beginPath(); x.moveTo(.0, -.03); x.quadraticCurveTo(.04, -.006, .1, .006); x.stroke(); });   // the road, down to the far walls
  } });
  U_(far).uGR.value.set(0, 0, 0, 1);
  const NSKY = col3('#1e1628').multiply(col3('#ffffff').multiplyScalar(1));   // the night multiplier
  return { sky, far, mid,
    // k: night 0 → gold 1 (sky + hills), v: village windows radius from (vx0, vy0)
    paint(k, v = 0, cx = 0, cy = 0) {
      sky.material.color.set('#1a1220').lerp(col3('#ffffff'), ss(k));
      tint(far, mixHex(NIGHT.far, GOLD.far, k)); tint(mid, mixHex(NIGHT.mid, GOLD.mid, k));
      U_(far).uTrans.value = lerp(.1, .65, k); U_(mid).uTrans.value = lerp(.08, .45, k);
      U_(far).uGR.value.set(cx, cy, v, 1); U_(far).uGlowLit.value = v > 0 ? 1 : 0;
      void NSKY;
    } };
}

// S11 signature shot: on «dondequiera» the light is born again in the broken jar and climbs every layer, front to back: floor, table, figures (gold edges), wall, beams.
// On «evangelio» it reaches the window and opens (the film's only burst, in the window). The camera follows the light to the window; outside it pours over the hills
// toward the horizon and, on «se contará», the windows of far villages light one by one, as far as Jerusalem's walls. The sky turns from plum to cream gold.
// Clawd stays inside, in the niche by the window: still, arms down, face toward the light.
export function S11(E) {
  const { H } = E;
  const W = wide({ stage: { light: [FX, FY, -.08], lightR: .03, floor: .1, key: .85, amb: .24 }, casa: { sky: false } }); const { S, R, C } = W;
  const out = afuera(S, { skyZ: -.2, farZ: -.19, midZ: -.17 });
  // the burst glows from the middle of its bottom edge: the plane sits half its height above the sill, just behind the wall, so it opens only in the window's hole
  const ray = burst(.12, .14, '#ffd79a'); ray.position.set((WIN.x0 + WIN.x1) / 2, WIN.y0 + .07, WALLZ - .012); S.add(ray);
  R.paint(NIGHT, COOL, { wall: 1, recess: 1 });
  const T = H.dondequiera, X = H.evangelio, V = H.contara;
  const warm = col3('#ffd59a'), gold = col3(GOLD.light);
  return { S, update(t) {
    const k = eio(seg(t, E.T0, X + .5)), k2 = eio(seg(t, X, E.T0 + E.dur));
    const cx = lerp(-.012, .006, k), cy = lerp(-.028, -.033, k), z = lerp(.46, .35, k) - .03 * k2;
    aim(S.cam, [cx, cy, z, cx, cy, -.12], t, { hand: .0004 });
    const q = i => ss(seg(t, T + i * .3, T + i * .3 + .45));
    const g = { front: q(0) * .5, table: q(1), disc: q(2), wall: q(3) * .66, recess: q(4) * .7, beams: q(5) * .8 };
    R.paint(COOL, GOLD, g); const tr = {}; for (const n in BASE_T) tr[n] = lerp(BASE_T[n], n === 'front' ? .06 : .55, g[n]); R.trans(tr);
    tintFigs(W.figs, mixHex(NIGHT.fig, '#1c1108', q(1)));
    for (const F of W.figs) for (const m of [F.body, F.arm]) U_(m).uTrans.value = lerp(.05, .3, q(2));
    const L = ss(seg(t, T, X));
    setL(S, lerp(FX, (WIN.x0 + WIN.x1) / 2, L), lerp(FY, WIN.y0 + .02, L), lerp(.03, .26, L), lerp(1.05, 1.45, L), warm.clone().lerp(gold, L));
    S.U.uFloor.value = lerp(.1, .38, L); S.key.intensity = lerp(.85, 1.25, L); S.amb.intensity = lerp(.24, .4, L);
    const b = ss(seg(t, X - .1, X + .25)) * (1 - .45 * ss(seg(t, X + .8, X + 2.2)));
    ray.userData.set(b * 1.3 * (1 + .05 * Math.sin(t * 7.3) * Math.sin(t * 3.1)));
    out.paint(ss(seg(t, X, V + 1.6)), lerp(0, .32, eo(seg(t, V - .1, V + 1.8))), (WIN.x0 + WIN.x1) / 2, -.02);
    R.lamps.set(t, { k: lerp(.85, 1.4, L) }); R.lamplight(lerp(.55, 1.1, L));
    C.set({ x: CL.x, y: CL.y, look: .9, lookY: .3, blink: 1, k: 1 + .2 * L });
    this._b = b; this._L = L; this._f = fsOf(S, lerp(-.078, WALLZ, L));
  }, post() { return { focus: this._f, aper: 3, maxCoc: 4, bloom: blo(lerp(.3, .45, this._L), lerp(1.05, .98, this._L)) }; },
  grade() { return { vig: lerp(.58, .42, this._L), sat: lerp(.82, 1.05, this._L), contrast: .12, gain: [1.04, 1, lerp(.97, .93, this._L)], lift: LIFT }; } };
}

// S12 the lit house: from outside, the night turned gold. The house of Bethany on its hill, every window gold, a path of light down toward the far walls.
// The camera comes in to the window where Clawd sits by the lamps in the niche — no jar now. On «¿Qué le darías tú?» he turns to the camera and then stays still.
export function S12(E) {
  const { H } = E;
  const S = stg({ light: [.02, .0, -.2], lightR: .3, lightCol: GOLD.light, key: 1.0, keyCol: '#ffe2b8', keyPos: [-.05, .3, .3], keyTarget: [0, -.03, -.1], amb: .34, ambCol: '#b8907a', floor: .4 });
  const out = afuera(S, { skyZ: -.24, farZ: -.22, midZ: -.19, sw: 1.2, sh: .6, sy: .02, stops: [[0, '#1e1628'], [.3, '#3e2a3a'], [.5, '#a8784c'], [.6, '#e0b878'], [1, '#f6e2ac']] });
  out.paint(1, .6, .02, -.02);
  // the hill of Bethany (dark front) and the house on it
  const hill = lay(S, { w: .8, h: .4, y: -.15, z: -.04, col: GOLD.hill, trans: .05, ppm: 1600, finish: { rim: .6, rimPx: 4, under: .3 }, draw: x => {
    x.translate(0, .15); x.beginPath(); x.moveTo(-.4, -.35); for (let u = -.4; u <= .4; u += .002) x.lineTo(u, -.052 + .02 * Math.exp(-((u / .12) ** 2)) - .012 * (u > 0 ? u / .4 : 0) + .0015 * Math.sin(u * 51)); x.lineTo(.4, -.35); x.closePath(); x.fill();
  } });
  const HW = { x0: -.022, x1: .022, y0: -.026, ys: -.004, ry: .014 };   // the window seen from outside (large)
  const house = lay(S, { w: .16, h: .14, y: -.03, z: -.055, col: '#1a0f0c', trans: .06, ppm: 3200, finish: { rim: .65, rimPx: 4, under: .35 }, draw: x => {
    x.translate(0, .03); x.fillRect(-.064, -.1, .128, .12); x.fillRect(-.068, .018, .136, .005); x.fillRect(-.03, .022, .06, .003);   // walls, flat roof, low parapet
    for (let i = -6; i <= 6; i++) x.fillRect(i * .01 - .0015, .014, .003, .006);   // roof-beam ends
    cut(x, () => { archPath(x, HW); x.fill(); for (const wx of [-.05, .04]) { x.beginPath(); x.moveTo(wx, -.02); x.lineTo(wx, -.008); x.arc(wx + .005, -.008, .005, Math.PI, 0, true); x.lineTo(wx + .01, -.02); x.closePath(); x.fill(); } });
  } });
  // behind the windows: the lit inside (cream gold), the niche with the lamps and Clawd
  const inside = lay(S, { w: .12, h: .06, y: -.012, z: -.068, col: '#f3d9a0', trans: .7, ppm: 2400, shadow: false, finish: { rim: 0, under: 0 }, draw: x => { x.fillRect(-.06, -.03, .12, .06); },
    glowDraw: x => { x.fillStyle = '#fff'; x.fillRect(-.06, -.03, .12, .06); }, glow: .55, glowCol: '#ffd38a', glowRes: .2 });
  const lamps = lamparas(S.U, { s: .0026, gap: .0056, z: -.066 }); lamps.g.position.set(-.019, HW.y0 + .0005, -.066); S.scene.add(lamps.g);
  const C = clawd(S.U, { u: .0017, z: -.064, glow: .42 }); S.scene.add(C.g);
  return { S, update(t) {
    const k = eio(seg(t, E.T0, H.cta + .2)), z = lerp(.62, .155, k), cx = lerp(.02, .002, k), cy = lerp(-.006, -.017, k);
    aim(S.cam, [cx, cy, z, cx, cy, -.1], t, { hand: .0004 * (1 - k) + .0002 });
    lamps.set(t, { k: 1.2 });
    const toCam = ss(seg(t, H.cta - .1, H.cta + .35));
    C.set({ x: .007, y: HW.y0 + .0006, look: lerp(-.8, 0, toCam), lookY: lerp(-.3, 0, toCam), blink: t < H.palabra ? blinkAt(t, 3.3, .7) : 1, k: 1 });
    this._f = fsOf(S, -.064);
    void house; void inside;
  }, post() { return { focus: this._f, aper: 3, maxCoc: 4, bloom: blo(.34, 1.02) }; }, grade() { return GOLD_G; } };
}
