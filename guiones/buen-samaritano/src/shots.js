// Los doce planos de «El buen samaritano» (Lucas 10:25–37). Cada uno: { S, update(t), post(), grade() }; t en segundos de película.
// Jesús es una silueta serena sentada en el marco; Dios no se dibuja: solo luz. Clawd es testigo: no toca al herido ni ayuda.
// Ligero para CPU: ≤ 9 láminas de fondo por plano, sombras a 1024, sin desenfoque de profundidad (maxCoc 0).
import * as THREE from 'three';
import { skyPanel, text, burst } from './paper.js';
import { stage, aim } from './stage.js';
import { seg, ss, eio, eo, lerp, clamp } from './lib.js';
import { mk, cut, clawd, human, donkey, trinket, BASE } from './actors.js';

const blo = (s = .3, th = 1.1) => ({ strength: s, radius: .55, threshold: th });
const POST = (b) => ({ focus: .5, aper: 0, maxCoc: 0, bloom: b });
const lay = (S, o) => S.add(mk(S.U, o));
const C3 = c => new THREE.Color(c);
const setL = (S, x, y, r, lit, c) => { S.U.uLight.value.x = x; S.U.uLight.value.y = y; S.U.uLightR.value = r; S.U.uLit.value = lit; if (c) S.U.uLightCol.value.copy(c); };
const bob = (t, f, a, p = 0) => Math.sin(t * f + p) * a;
const tintC = (m, c) => m.material.color.copy(c).multiplyScalar(1 / BASE);
const mixC = (a, b, k) => C3(a).lerp(C3(b), clamp(k));
const env = (t, a, b, f = .2) => Math.min(ss(seg(t, a, a + f)), 1 - ss(seg(t, b - f, b)));
const blinkAt = (t, per = 3.3, ph = 0) => 1 - .9 * Math.max(0, 1 - Math.abs(((t + ph) % per) - .1) / .1);
// escenario ligero: sombras más pequeñas y menos muestras que la plantilla (render en CPU)
function stg(o) { const S = stage(o); S.key.shadow.mapSize.set(1024, 1024); S.key.shadow.blurSamples = 8; S.key.shadow.radius = 6; return S; }
const walkH = (F, t, x, y, o = {}) => F.set({ x, y: y + Math.abs(Math.sin(t * (o.f || 6.4))) * (o.b ?? .0009), a: Math.sin(t * (o.f || 6.4)) * (o.sw ?? .3), rot: Math.sin(t * (o.f || 6.4)) * .016, face: o.face ?? 1 });

// —— crestas: los caminos son los bordes superiores de las láminas ——
export const ry = (r, x) => r.base + r.amp * (Math.sin(x * r.f + r.ph) * .6 + Math.sin(x * r.f * 2.3 + r.ph * 1.7) * .25) - (r.k || 0) * x;
export function ridge(S, z, col, r, trans, o = {}) {
  const w = o.w || .7, h = o.h || .5, y0 = o.y ?? -.12, x0 = o.x || 0;
  return lay(S, { w, h, x: x0, y: y0, z, col, trans, ppm: o.ppm || 1800, shadow: o.shadow ?? true, recv: o.recv ?? true, finish: { rim: o.rim ?? .45, rimPx: 3 }, draw: x => {
    x.beginPath(); x.moveTo(-w / 2, -h / 2); for (let u = -w / 2; u <= w / 2 + 1e-4; u += .0015) x.lineTo(u, ry(r, u + x0) - y0); x.lineTo(w / 2, -h / 2); x.closePath(); x.fill();
    if (o.extra) o.extra(x, x0, y0);
  } });
}
export const ROAD = { r1: { base: .036, amp: .012, f: 17, ph: 1 }, r2: { base: .012, amp: .009, f: 23, ph: 2.2 }, r3: { base: -.014, amp: .007, f: 29, ph: .4 }, r4: { base: -.045, amp: .0018, f: 38, ph: 3 }, rf: { base: -.083, amp: .012, f: 21, ph: 1.3 } };
export const PAL = {
  night: { sky: [[0, '#04071a'], [.55, '#1c2858'], [1, '#3a4886']], h: ['#4e5e98', '#3d4a86', '#34407a', '#0d1228', '#03050d'], light: '#9fb4e8', amb: '#6d7fb8', stars: 120 },
  dawn: { sky: [[0, '#2b3651'], [.55, '#66748f'], [1, '#a7aebb']], h: ['#808ca6', '#66728e', '#56627e', '#1b2134', '#07090f'], light: '#c9d2e2', amb: '#8d9abb', stars: 0 },
  amber: { sky: [[0, '#2f3a58'], [.5, '#8a8aa0'], [.82, '#e3c693'], [1, '#f3dca0']], h: ['#8b8296', '#5b5670', '#383349', '#17141e', '#060508'], light: '#f3dca0', amb: '#a49ab0', stars: 0 },
  gold: { sky: [[0, '#cdb88c'], [.5, '#eedcaa'], [1, '#f7ead0']], h: ['#e2cd9c', '#c3a876', '#8e7048', '#3d2c18', '#1a1008'], light: '#f3dca0', amb: '#c8b08a', stars: 0 },
};
// el camino: cielo, tres revueltas a tres profundidades, la orilla del herido y las rocas del frente
export function road(S, p) {
  const sky = S.add(skyPanel({ w: 1.2, h: 1, z: -.16, stops: p.sky, stars: p.stars, starMinY: .05, seed: 3 }));
  const L = [ridge(S, -.14, p.h[0], ROAD.r1, .7, { rim: .35 }), ridge(S, -.12, p.h[1], ROAD.r2, .4), ridge(S, -.105, p.h[2], ROAD.r3, .2),
    ridge(S, -.09, p.h[3], ROAD.r4, .08, { rim: .55 }), ridge(S, -.03, p.h[4], ROAD.rf, .02, { rim: .3 })];
  return { sky, L };
}

// —— el marco: patio con un arco recortado; dentro, el camino pequeño ——
export function arch(S, p, o = {}) {
  S.add(skyPanel({ w: 1.2, h: 1, z: -.16, stops: p.sky, stars: p.stars, starMinY: .06, seed: 8 }));
  const r2 = { base: .028, amp: .008, f: 26, ph: 2 }, r4 = { base: -.012, amp: .0015, f: 40, ph: 1 };
  const inner = [ridge(S, -.135, p.h[0], { base: .05, amp: .01, f: 20, ph: .5 }, .6, { rim: .3 }), ridge(S, -.12, p.h[1], r2, .35), ridge(S, -.1, p.h[3], r4, .08, { rim: .55 })];
  const wall = lay(S, { w: .34, h: .44, y: .02, z: -.05, col: o.wall, trans: .12, ppm: 1800, finish: { rim: .55, rimPx: 5, under: .4 }, draw: x => {
    x.translate(0, -.02); x.fillRect(-.17, -.22, .34, .44);
    cut(x, () => { x.beginPath(); x.moveTo(-.05, -.02); x.lineTo(-.05, .07); x.arc(0, .07, .05, Math.PI, 0, true); x.lineTo(.05, -.02); x.closePath(); x.fill(); });
  } });
  const ledge = lay(S, { w: .34, h: .16, y: -.145, z: -.015, col: o.ledge, trans: .03, ppm: 1600, finish: { rim: .5 }, draw: x => {
    x.translate(0, .145); x.beginPath(); x.moveTo(-.17, -.22); for (let u = -.17; u <= .17; u += .002) x.lineTo(u, -.071 + .0015 * Math.sin(u * 60)); x.lineTo(.17, -.22); x.closePath(); x.fill();
  } });
  const J = human(S.U, { h: .064, z: -.03, pose: 'sit', col: o.fig, rim: .9 }); S.scene.add(J.g);
  const M = human(S.U, { h: .07, z: -.032, pose: 'stand', col: o.fig, rim: .75 }); S.scene.add(M.g);
  return { inner, wall, ledge, J, M, r4 };
}

// ——————————————————— S1 el camino de noche: el herido, Clawd y tres que bajan; título de papel ———————————————————
export function S1(E) {
  const { H } = E, p = PAL.night;
  const S = stg({ light: [.0, .06, -.12], lightR: .18, lightCol: p.light, key: .55, keyCol: '#c8d4f0', amb: .2, ambCol: p.amb, floor: .25 });
  road(S, p);
  const W = human(S.U, { h: .062, z: -.087, pose: 'lie', col: '#03040a', rim: 1 }); S.scene.add(W.g);
  const far = [[.012, -.137, ROAD.r1, 'tall', -.05], [.014, -.117, ROAD.r2, 'low', .045], [.017, -.102, ROAD.r3, 'wrap', -.03]].map(([h, z, r, hat, x0]) => {
    const F = human(S.U, { h, z, col: '#0a0e20', rim: .5, hat }); S.scene.add(F.g); return { F, r, x0 };
  });
  const C = clawd(S.U, { u: .0028, z: -.062, glow: .6 }); S.scene.add(C.g);
  const title = lay(S, { w: .128, h: .066, y: .1, z: -.03, col: '#efe0bd', trans: .35, shadow: false, recv: false, ppm: 6000, finish: { rim: .3, under: .2 }, draw: x => {
    x.beginPath(); x.roundRect(-.062, -.031, .124, .062, .002); x.fill();
    cut(x, () => { text(x, 'EL BUEN', 0, .0175, .0088, 'Cinzel', { weight: 800, fill: '#000' }); text(x, 'SAMARITANO', 0, .0035, .0128, 'Cinzel', { weight: 800, fill: '#000' }); text(x, 'Lucas 10:25–37', 0, -.0175, .0086, 'Playfair', { weight: 'italic 500', fill: '#000' }); });
  }, glowDraw: x => { x.fillStyle = '#fff'; x.fillRect(-.064, -.033, .128, .066); }, glow: .5, glowCol: '#efe0bd', glowRes: .2 });
  return { S, update(t) {
    const z = lerp(.52, .46, eio(seg(t, 0, E.T0 + E.dur + .6)));
    aim(S.cam, [0, .002, z, 0, .002, -.08], t, { hand: .0004 });
    W.set({ x: .03, y: ry(ROAD.r4, .03) - .0004, face: -1, a: -1.45 + bob(t, .7, .03) });
    far.forEach(({ F, r, x0 }, i) => { const x = x0 + (i === 1 ? -1 : 1) * .006 * t; walkH(F, t + i, x, ry(r, x), { face: i === 1 ? -1 : 1, b: .0002, sw: .25 }); });
    const sweep = seg(t, H.cual, H.cual + 1.1), look = t < H.cual ? lerp(0, .5, ss(seg(t, H.tres + .2, H.tres + .7))) : lerp(-.8, .8, ss(sweep));
    C.set({ x: -.04, y: ry(ROAD.r4, -.04) - .0003 + Math.abs(bob(t, 1.3, .0004)), look, blink: blinkAt(t, 3.6, .9), k: 1.25, aR: .25 * ss(seg(t, H.tres + .1, H.tres + .5)) * (1 - ss(seg(t, H.cual, H.cual + .4))) });
    const tt = t - .35, reveal = ss(seg(tt, 0, .55)) * (1 - ss(seg(t, 3.5, 3.95)));
    const cz = S.cam.position.z + .03, ts = cz / .55 * .7; title.scale.setScalar(ts); title.position.x = S.cam.position.x; title.position.y = S.cam.position.y + .4617 * cz / 2 * .66;
    title.material.userData.u.uClip.value.set(title.position.x, title.position.y, .09 * reveal * ts, 0); title.visible = reveal > .002;
    setL(S, 0, .05, .18, .9);
  }, post() { return POST(blo(.32, 1.05)); }, grade() { return { vig: .5, sat: 1.0 }; } };
}

// ——————————————————— S2 el marco: la cámara sale por el arco; Jesús sentado y el maestro de la ley ———————————————————
export function S2(E) {
  const { H } = E, p = PAL.night;
  const S = stg({ light: [.0, .03, -.12], lightR: .2, lightCol: '#a9bbe8', key: 1.3, keyCol: '#e8dcc8', keyPos: [-.12, .3, .3], amb: .3, ambCol: '#8a86a8', floor: .3 });
  const A = arch(S, p, { wall: '#7a7084', ledge: '#0b0910', fig: '#07060c' });
  const W = human(S.U, { h: .03, z: -.098, pose: 'lie', col: '#05070f', rim: .7 }); S.scene.add(W.g);
  const C = clawd(S.U, { u: .0018, z: -.094, glow: .6 }); S.scene.add(C.g);
  return { S, update(t) {
    const k = eio(seg(t, E.T0, H.l03b - .2));
    aim(S.cam, [0, lerp(.03, -.02, k), lerp(.26, .66, k), 0, lerp(.03, -.02, k), -.08], t, { hand: .0004 });
    W.set({ x: .012, y: ry(A.r4, .012), face: -1, a: -1.45 });
    const up = ss(seg(t, H.dentro, H.dentro + .35)) * (1 - ss(seg(t, H.dentro + 1.3, H.dentro + 1.7)));
    C.set({ x: -.014, y: ry(A.r4, -.014), look: lerp(.3, -.2, k), aL: up * 1.6, blink: blinkAt(t, 3.4), k: 1.2 });
    A.J.set({ x: -.046, y: -.069, a: .35 + bob(t, .6, .02) });
    const ask = ss(seg(t, H.projimo - .45, H.projimo)) * (1 - ss(seg(t, H.projimo + .9, H.projimo + 1.3)));
    A.M.set({ x: .048, y: -.069, face: -1, a: lerp(.15, 1.6, ask) });
    setL(S, 0, .03, .2, .95);
  }, post() { return POST(blo(.3, 1.08)); }, grade() { return { vig: .48 }; } };
}

// ——————————————————— S3 la bajada: Jerusalén arriba a la izquierda; el hombre baja y Clawd lo sigue ———————————————————
export function S3(E) {
  const S = stg({ light: [-.08, .08, -.12], lightR: .25, lightCol: '#b8c6ea', key: .8, keyCol: '#d6deef', amb: .3, ambCol: '#7d8cbc', floor: .32 });
  S.add(skyPanel({ w: 1.4, h: 1.2, z: -.16, stops: [[0, '#0b1230'], [.5, '#2c3a6c'], [1, '#56648f']], stars: 80, starMinY: .1, seed: 5 }));
  const K = .32, rA = { base: .07, amp: .01, f: 14, ph: .3, k: .28 }, rB = { base: .02, amp: .008, f: 20, ph: 2, k: .3 }, rC = { base: -.03, amp: .0012, f: 40, ph: 1, k: K }, rD = { base: -.075, amp: .01, f: 22, ph: 3, k: K };
  ridge(S, -.135, '#4a5684', rA, .6, { w: .9, h: .8, y: -.2, rim: .35, extra: (x, x0, y0) => {
    const cx = -.115, by = ry(rA, cx) - y0 - .004; x.fillRect(cx - .07 - x0, by, .14, .03);
    for (let i = 0; i < 6; i++) { const tx = cx - .065 + i * .026 - x0; x.fillRect(tx, by + .028, .012, .016 + (i % 3) * .006); }
    x.fillRect(cx - .014 - x0, by + .03, .028, .03); x.beginPath(); x.arc(cx - x0, by + .06, .014, 0, Math.PI); x.fill();
  } });
  ridge(S, -.115, '#2b3562', rB, .35, { w: .9, h: .8, y: -.2 });
  ridge(S, -.08, '#121835', rC, .08, { w: .9, h: .8, y: -.22, rim: .55 });
  ridge(S, -.03, '#04060e', rD, .02, { w: .9, h: .8, y: -.25, rim: .3 });
  const M = human(S.U, { h: .058, z: -.077, col: '#070a16', rim: .7 }); S.scene.add(M.g);
  const C = clawd(S.U, { u: .0022, z: -.068, glow: .6 }); S.scene.add(C.g);
  return { S, update(t) {
    const k = seg(t, E.T0, E.T0 + E.dur + .6), mx = lerp(-.07, .1, k), cx = mx - .05;
    const camx = mx - .018 - .012 * (1 - eio(k)), camy = ry(rC, camx) + .044;
    aim(S.cam, [camx, camy + .004, .46, camx + .004, camy, -.08], t, { hand: .0004 });
    walkH(M, t, mx, ry(rC, mx) - .0005, { f: 6.6 });
    M.g.rotation.z = -.05 + Math.sin(t * 6.6) * .016;
    C.set({ x: cx, y: ry(rC, cx) + .0004 + Math.abs(Math.sin(t * 6.6)) * .0006, rot: -.08, walk: t * 6.6, stride: .35, look: .9, blink: blinkAt(t), k: 1.2 });
    setL(S, camx - .06, camy + .08, .25, .95);
  }, post() { return POST(blo(.28, 1.1)); }, grade() { return { vig: .45 }; } };
}

// ——————————————————— S4 los ladrones: suben por detrás de la roca; el manto se va; él cae tras la roca. Sin violencia en cuadro ———————————————————
export function S4(E) {
  const { H } = E;
  const S = stg({ light: [.03, .03, -.12], lightR: .16, lightCol: '#a6b8e6', key: .55, keyCol: '#aebde0', amb: .18, ambCol: '#5d6fa8', floor: .2 });
  S.add(skyPanel({ w: 1.2, h: 1, z: -.16, stops: [[0, '#03051a'], [.5, '#24306a'], [.8, '#56669e'], [1, '#6a78aa']], stars: 90, starMinY: .03, seed: 9 }));
  ridge(S, -.135, '#33407a', { base: -.03, amp: .01, f: 15, ph: 2 }, .5, { rim: .3 });
  const thieves = [-.04, -.019, .002].map((x, i) => { const T = human(S.U, { h: .05 + (i % 2) * .004, z: -.112, col: '#020309', rim: .3 }); S.scene.add(T.g); return { T, x }; });
  ridge(S, -.1, '#080a18', { base: -.036, amp: .007, f: 34, ph: .7 }, .04, { rim: .45, extra: (x, x0, y0) => { x.beginPath(); x.ellipse(-.022, -.03 - y0, .036, .02, 0, 0, 7); x.fill(); } });
  const M = human(S.U, { h: .06, z: -.075, col: '#070a16', rim: .85 }); S.scene.add(M.g);
  const cloak = lay(S, { w: .03, h: .046, z: -.073, col: '#b9b2c9', trans: .3, shadow: false, ppm: 5000, finish: { rim: .5 }, draw: x => {
    x.beginPath(); x.moveTo(-.008, .02); x.quadraticCurveTo(.004, .023, .009, .016); x.lineTo(.013, -.021); x.quadraticCurveTo(0, -.017, -.012, -.022); x.closePath(); x.fill(); } });
  ridge(S, -.05, '#010205', { base: -.064, amp: .004, f: 18, ph: 2.5 }, .02, { rim: .35, extra: (x, x0, y0) => { x.beginPath(); x.ellipse(.04, -.06 - y0, .04, .024, 0, 0, 7); x.fill(); } });
  const C = clawd(S.U, { u: .0021, z: -.045, glow: .55 }); S.scene.add(C.g);
  return { S, update(t) {
    const g1 = H.golpe1, g2 = H.golpe2, g3 = H.golpe3;
    aim(S.cam, [0, -.03, .42, 0, -.018, -.08], t, { hand: .0015, handF: 1.6 });
    thieves.forEach(({ T, x }, i) => { const g = [g1 - .2, g2 - .2, g3 - .3][i], u = eo(seg(t, g, g + .22)), down = ss(seg(t, g3 + .6, g3 + 1.1)); T.set({ x, y: lerp(-.1, -.05, u * (1 - down)), face: 1, a: .15 }); });
    const fall = ss(seg(t, g3 - .05, g3 + .45)), sway = ss(seg(t, g2 - .05, g2 + .25));
    const mx = .036;
    M.set({ x: mx, y: -.049 - fall * .06, face: -1, rot: -(sway * .12 + fall * 1.3), a: lerp(.2, .6, sway) * (1 - fall) });
    const off = eio(seg(t, g1 - .05, g1 + .8));
    cloak.position.set(mx + .001 + off * .1, -.024 + off * .012, -.073); cloak.rotation.z = -off * 1.1; cloak.visible = off < .99;
    const flinch = Math.max(...[g1, g2, g3].map(g => Math.exp(-Math.max(0, t - g) * 5) * (t > g ? 1 : 0)));
    C.set({ x: -.045, y: -.0605, tuck: .45 + .15 * flinch, look: .8, blink: lerp(1, .6, flinch), k: 1.1, aL: 0, aR: 0 });
    setL(S, .03, .03, .16, .9);
  }, post() { return POST(blo(.26, 1.12)); }, grade() { return { vig: .55, sat: .9, contrast: .14 }; } };
}

// ——————————————————— S5 / S6 el mismo encuadre del gancho, de madrugada: sacerdote, levita y el silencio ———————————————————
function passer(E, o) {
  const p = PAL.dawn;
  const S = stg({ light: [.0, .07, -.12], lightR: .2, lightCol: p.light, key: .8, keyCol: '#dde3ef', amb: .3, ambCol: p.amb, floor: .32 });
  road(S, p);
  const W = human(S.U, { h: .062, z: -.087, pose: 'lie', col: '#0a0d18', rim: .9 }); S.scene.add(W.g);
  const F = human(S.U, { h: o.h, z: o.z, col: '#141a2c', rim: .55, hat: o.hat }); S.scene.add(F.g);
  const C = clawd(S.U, { u: o.u, z: -.062, glow: .55 }); S.scene.add(C.g);
  return { S, W, F, C };
}
export function S5(E) {
  const { H } = E, { S, W, F, C } = passer(E, { h: .022, z: -.117, hat: 'tall', u: .0028 });
  return { S, update(t) {
    aim(S.cam, [0, .002, .47, 0, .002, -.08], t, { hand: .0003 });
    W.set({ x: .03, y: ry(ROAD.r4, .03) - .0004, face: -1, a: -1.45 });
    const v = H.vio, stop = env(t, v - .1, v + .75), x = lerp(-.07, .075, seg(t, E.T0, E.T0 + E.dur + .3));
    walkH(F, t, x, ry(ROAD.r2, x), { face: stop > .5 ? -1 : 1, b: .0003, sw: .25 * (1 - stop) });
    const half = ss(seg(t, v - .1, v + .3)) * (1 - ss(seg(t, v + .9, v + 1.4)));
    C.set({ x: -.04, y: ry(ROAD.r4, -.04) - .0003, look: lerp(-.2, .6, ss(seg(t, E.T0, v))), aR: half * 1.0, blink: blinkAt(t, 3.1), k: 1.1 });
    setL(S, 0, .07, .2, .9);
  }, post() { return POST(blo(.26, 1.12)); }, grade() { return { vig: .42, sat: .85 }; } };
}
export function S6(E) {
  const { H } = E, { S, W, F, C } = passer(E, { h: .025, z: -.102, hat: 'low', u: .0028 });
  return { S, update(t) {
    aim(S.cam, [-.004, -.006, .43, -.004, -.004, -.08], t, { hand: .0002 });
    W.set({ x: .03, y: ry(ROAD.r4, .03) - .0004, face: -1, a: -1.45 });
    const x = lerp(.08, -.09, seg(t, H.levita - .3, H.sil1 + .1));
    F.g.visible = x > -.088;
    walkH(F, t * 1.3, x, ry(ROAD.r3, x), { face: -1, b: .0003 });
    const dim = ss(seg(t, H.sil1, H.sil1 + 1.2));
    C.set({ x: -.04, y: ry(ROAD.r4, -.04) - .0003, look: lerp(.4, -.6, ss(seg(t, H.levita, H.sil1))), blink: lerp(1, .45, dim), tuck: .35 * dim, k: lerp(1.1, .8, dim) });
    setL(S, 0, .07, .2, lerp(.9, .5, dim)); S.key.intensity = lerp(.8, .5, dim); this._d = dim;
  }, post() { return POST(blo(.24, 1.15)); }, grade() { return { vig: lerp(.42, .55, this._d || 0), sat: .82, expo: lerp(1, .82, this._d || 0) }; } };
}

// ——————————————————— S7 llega el samaritano con su asno, a contraluz del primer ámbar ———————————————————
export function S7(E) {
  const p = PAL.amber;
  const S = stg({ light: [.03, .02, -.12], lightR: .2, lightCol: '#f3dca0', key: .8, keyCol: '#efe2c8', amb: .28, ambCol: p.amb, floor: .3 });
  S.add(skyPanel({ w: 1.2, h: 1, z: -.16, stops: p.sky }));
  ridge(S, -.13, p.h[1], { base: -.004, amp: .008, f: 18, ph: .9 }, .45, { rim: .5 });
  const rN = { base: -.04, amp: .0016, f: 38, ph: 2 };
  ridge(S, -.09, p.h[3], rN, .06, { rim: .7 });
  ridge(S, -.03, p.h[4], { base: -.082, amp: .01, f: 21, ph: .2 }, .02, { rim: .3 });
  const W = human(S.U, { h: .046, z: -.087, pose: 'lie', col: '#0a0810', rim: .7 }); S.scene.add(W.g);
  const D = donkey(S.U, { L: .048, z: -.088, col: '#0a0810', rim: .85 }); S.scene.add(D.g);
  const Sm = human(S.U, { h: .064, z: -.085, col: '#0a0810', rim: .9, hat: 'wrap' }); S.scene.add(Sm.g);
  const C = clawd(S.U, { u: .0021, z: -.064, glow: .55 }); S.scene.add(C.g);
  return { S, update(t) {
    const k = eio(seg(t, E.T0, E.T0 + E.dur + .4)), cx = lerp(.014, .006, k);
    aim(S.cam, [cx, -.024, .48, cx, -.01, -.08], t, { hand: .0004 });
    W.set({ x: .012, y: ry(rN, .012) - .0004, face: -1, a: -1.45 });
    const sx = lerp(.1, .04, eo(seg(t, E.T0 - .1, E.T0 + E.dur + .2)));
    walkH(Sm, t, sx, ry(rN, sx), { face: -1, f: 5.6 });
    D.set({ x: sx + .044, y: ry(rN, sx + .044), walk: t * 5.6, stride: .28, face: -1 });
    const turn = ss(seg(t, E.T0 + .05, E.T0 + .5));
    C.set({ x: -.04, y: ry(rN, -.04) - .0003, look: lerp(-.3, 1, turn), blink: 1, k: 1.15 });
    setL(S, .03, .0, .2, .95);
  }, post() { return POST(blo(.34, 1.02)); }, grade() { return { vig: .45, sat: .95 }; } };
}

// ——————————————————— S8 plano firma: «tuvo compasión»; la luz atraviesa el papel, capa a capa ———————————————————
export function S8(E) {
  const { H } = E;
  const S = stg({ light: [.0, -.02, -.12], lightR: .08, lightCol: '#f3dca0', key: .65, keyCol: '#efe2c8', amb: .2, ambCol: '#8d86a0', floor: .12 });
  const sky = S.add(skyPanel({ w: 1.2, h: 1, z: -.16, stops: [[0, '#2a2f48'], [.6, '#6d6a80'], [1, '#c9b48c']] }));
  const dark = ['#2d2a3a', '#221f2c', '#18151f'], gold = ['#f3e2b6', '#ead2a0', '#e2c48c'];
  const rocks = [ridge(S, -.135, dark[0], { base: .045, amp: .02, f: 13, ph: 1.4 }, .05, { rim: .4 }), ridge(S, -.12, dark[1], { base: .02, amp: .022, f: 16, ph: 3.1 }, .05),
    ridge(S, -.105, dark[2], { base: -.006, amp: .016, f: 21, ph: .3 }, .05)];
  const rN = { base: -.04, amp: .0016, f: 38, ph: 2 };
  const ground = ridge(S, -.09, '#100d15', rN, .05, { rim: .7 });
  ridge(S, -.03, '#050407', { base: -.082, amp: .01, f: 21, ph: .2 }, .02, { rim: .3 });
  const W = human(S.U, { h: .046, z: -.087, pose: 'lie', col: '#0a0810', rim: .7 }); S.scene.add(W.g);
  const Sm = human(S.U, { h: .06, z: -.084, pose: 'kneel', col: '#0a0810', rim: .9, two: true, hat: 'wrap' }); S.scene.add(Sm.g);
  const flask = trinket(S.U, 'flask', { s: .006, z: -.081 }); S.add(flask);
  const C = clawd(S.U, { u: .0021, z: -.064, glow: .55 }); S.scene.add(C.g);
  return { S, update(t) {
    const c = H.compasion, lit = i => ss(seg(t, c + i * .4 - .1, c + i * .4 + .6));
    const z = lerp(.43, .36, eio(seg(t, E.T0, E.T0 + E.dur + .6)));
    aim(S.cam, [-.004, -.02, z, -.004, -.012, -.08], t, { hand: .0003 });
    W.set({ x: .01, y: ry(rN, .01) - .0004, face: -1, a: -1.45 });
    const ac = H.aceite, wrap = t > ac + .3 ? Math.sin((t - ac) * 7) * .25 : 0, reach = ss(seg(t, E.T0, E.T0 + .6));
    Sm.set({ x: .042, y: ry(rN, .042), face: -1, a: lerp(.4, 1.25, reach) + wrap, a2: lerp(.3, 1.05, reach) - wrap });
    const [hx, hy] = Sm.hand(1); flask.position.set(hx + .002, hy + .003, -.081);
    const fl = ss(seg(t, ac - .15, ac + .1)) * (1 - ss(seg(t, ac + 1.1, ac + 1.5))); flask.visible = fl > .01; flask.material.userData.u.uGlowLit.value = fl;
    rocks.forEach((m, i) => { const k = lit(3 - i); m.material.userData.u.uTrans.value = lerp(.05, .75, k); tintC(m, mixC(dark[i], gold[i], k)); });
    const g0 = lit(0); ground.material.userData.u.uTrans.value = lerp(.05, .4, g0); tintC(ground, mixC('#100d15', '#5a4630', g0));
    sky.material.color.setScalar(lerp(1, 1.5, lit(3)));
    const L = lit(0); setL(S, lerp(.0, hx, L), lerp(-.02, hy, L), lerp(.08, .3, ss(seg(t, c, c + 2))), lerp(.7, 1.5, L));
    S.U.uFloor.value = lerp(.1, .3, lit(3)); S.key.intensity = lerp(.65, 1.2, lit(2));
    C.set({ x: -.04, y: ry(rN, -.04) - .0003, look: .9, blink: blinkAt(t, 3.8), k: 1.1 });
    this._g = lit(3);
  }, post() { return POST(blo(lerp(.3, .42, this._g || 0), 1.0)); }, grade() { return { vig: lerp(.5, .32, this._g || 0), sat: 1.0 }; } };
}

// ——————————————————— S9 hacia el mesón: el herido sobre el asno; Clawd camina detrás ———————————————————
export function S9(E) {
  const { H } = E;
  const S = stg({ light: [.05, .05, -.12], lightR: .25, lightCol: '#f3dca0', key: 1.1, keyCol: '#f2e6cc', amb: .34, ambCol: '#b4a48c', floor: .4 });
  S.add(skyPanel({ w: 1.6, h: 1, z: -.16, stops: [[0, '#6f7290'], [.5, '#cdb98f'], [1, '#f1e0b4']] }));
  const rN = { base: -.04, amp: .0015, f: 40, ph: 1 };
  ridge(S, -.14, '#a99a84', { base: .0, amp: .01, f: 13, ph: .2 }, .55, { w: 1.1, rim: .4 });
  const inn = lay(S, { w: .1, h: .08, x: .118, y: -.012, z: -.11, col: '#3e3226', trans: .1, ppm: 3200, finish: { rim: .55 }, draw: x => {
    x.fillRect(-.04, -.04, .08, .045); x.beginPath(); x.moveTo(-.046, .005); x.lineTo(0, .03); x.lineTo(.046, .005); x.closePath(); x.fill(); x.fillRect(.022, .012, .008, .02);
    cut(x, () => { x.fillRect(-.012, -.018, .012, .012); x.fillRect(.014, -.04, .012, .022); });
  }, glowDraw: x => { x.fillStyle = '#fff'; x.fillRect(-.012, -.018, .012, .012); x.fillRect(.014, -.04, .012, .022); }, glow: 2.2, glowCol: '#ffe2a0', glowRes: .6 });
  ridge(S, -.09, '#4a3a28', rN, .08, { w: 1.1, rim: .6 });
  const front = ridge(S, -.03, '#140c06', { base: -.085, amp: .014, f: 26, ph: 2 }, .02, { w: 1.1, rim: .3 });
  const D = donkey(S.U, { L: .05, z: -.087, col: '#120c08', rim: .8 }); S.scene.add(D.g);
  const W = human(S.U, { h: .042, z: .0012, pose: 'sit', col: '#2a1c12', rim: .9 }); D.g.add(W.g);
  const Sm = human(S.U, { h: .062, z: -.084, col: '#120c08', rim: .85, hat: 'wrap' }); S.scene.add(Sm.g);
  const C = clawd(S.U, { u: .0017, z: -.07, glow: .5 }); S.scene.add(C.g);
  return { S, update(t) {
    const k = seg(t, E.T0, E.T0 + E.dur + .6), x = lerp(-.04, .07, k);
    const push = eio(seg(t, H.meson, E.T0 + E.dur + .6));
    const camx = lerp(x - .002, x + .012, push), z = lerp(.47, .45, push);
    aim(S.cam, [camx, .0, z, camx, .004, -.08], t, { hand: .0004 });
    front.position.x = -k * .03;
    walkH(Sm, t, x + .042, ry(rN, x + .042), { f: 5.4 });
    D.set({ x, y: ry(rN, x), walk: t * 5.4, stride: .26 });
    W.set({ x: -.006, y: .05 * .69, rot: -.28, a: .5 + bob(t, 2.7, .06) });
    C.set({ x: x - .04, y: ry(rN, x - .04) + Math.abs(Math.sin(t * 5.4)) * .0005, walk: t * 5.4, stride: .3, look: .7, blink: blinkAt(t, 3.2), k: 1.05 });
    inn.material.userData.u.uGlowLit.value = lerp(.8, 1.4, push);
    setL(S, camx + .05, .05, .25, 1);
  }, post() { return POST(blo(.34, 1.05)); }, grade() { return { vig: .4 }; } };
}

// ——————————————————— S10 al otro día, el mesón: dos denarios en la mano del mesonero ———————————————————
export function S10(E) {
  const { H } = E;
  const S = stg({ light: [-.04, .0, -.12], lightR: .14, lightCol: '#f6e6bd', key: 1.1, keyCol: '#f4e8d0', keyPos: [-.15, .28, .3], amb: .32, ambCol: '#a89880', floor: .3 });
  S.add(skyPanel({ w: 1, h: 1, z: -.16, stops: [[0, '#f0e2bd'], [1, '#fbf2dc']], gain: 1.3 }));
  lay(S, { w: .36, h: .4, z: -.12, col: '#4a3a2c', trans: .06, ppm: 1600, finish: { rim: .5, rimPx: 5 }, draw: x => {
    x.fillRect(-.18, -.2, .36, .4);
    cut(x, () => { x.beginPath(); x.moveTo(-.065, -.062); x.lineTo(-.065, .016); x.arc(-.042, .016, .023, Math.PI, 0, true); x.lineTo(-.019, -.062); x.closePath(); x.fill(); x.fillRect(.04, .006, .02, .026); });
  } });
  lay(S, { w: .36, h: .2, y: -.16, z: -.104, col: '#2a2016', trans: .05, ppm: 1600, finish: { rim: .6 }, draw: x => { x.translate(0, .16); x.fillRect(-.18, -.3, .36, .242); } });
  lay(S, { w: .072, h: .012, x: -.006, y: -.06, z: -.1, col: '#8a7458', trans: .2, shadow: false, ppm: 4000, finish: { rim: .5 }, draw: x => { x.beginPath(); x.roundRect(-.034, -.005, .068, .01, .003); x.fill(); } });
  const W = human(S.U, { h: .046, z: -.098, pose: 'lie', col: '#120c08', rim: .8 }); S.scene.add(W.g);
  const Sm = human(S.U, { h: .066, z: -.08, col: '#120c08', rim: .8, hat: 'wrap' }); S.scene.add(Sm.g);
  const K = human(S.U, { h: .064, z: -.082, col: '#1a120a', rim: .7 }); S.scene.add(K.g);
  const coins = [0, 1].map(() => { const m = trinket(S.U, 'coin', { s: .0042, z: -.076 }); S.add(m); return m; });
  lay(S, { w: .36, h: .4, z: -.03, col: '#0d0905', trans: .02, ppm: 1400, finish: { rim: .45 }, draw: x => {
    x.fillRect(-.18, -.2, .36, .4); cut(x, () => { x.beginPath(); x.moveTo(-.08, -.074); x.lineTo(-.08, .06); x.quadraticCurveTo(.012, .105, .1, .06); x.lineTo(.1, -.074); x.closePath(); x.fill(); });
  } });
  const C = clawd(S.U, { u: .0018, z: -.108, glow: .5 }); S.scene.add(C.g);
  return { S, update(t) {
    const k = eio(seg(t, E.T0, E.T0 + E.dur + .6)), cx = lerp(.004, .01, k);
    aim(S.cam, [cx, -.03, lerp(.47, .44, k), cx, -.022, -.09], t, { hand: .0003 });
    W.set({ x: -.006, y: -.0575, face: 1, a: -1.4 });
    const give = ss(seg(t, H.denarios - .5, H.denarios - .05));
    Sm.set({ x: .024, y: -.064, a: lerp(.25, 1.25, give) });
    K.set({ x: .056, y: -.064, face: -1, a: lerp(.2, 1.2, ss(seg(t, H.denarios - .3, H.denarios + .1))) });
    const [hx, hy] = Sm.hand(1.02), [kx, ky] = K.hand(1.02);
    coins.forEach((m, i) => { const at = i ? H.denario2 : H.denarios, mv = ss(seg(t, at, at + .35));
      m.position.set(lerp(hx, kx, mv) + i * .0015, lerp(hy, ky, mv) + .002 + i * .0025 + Math.sin(mv * Math.PI) * .006, -.076);
      m.visible = t > at - .25; m.material.userData.u.uGlowLit.value = Math.exp(-Math.max(0, t - at) * 3.5) * (t > at ? 1 : 0) * 1.4 + .25; });
    C.set({ x: -.048, y: -.062, look: .6, blink: blinkAt(t, 3.5), k: 1 });
    setL(S, -.042, -.01, .12, 1.2);
  }, post() { return POST(blo(.34, 1.05)); }, grade() { return { vig: .48 }; } };
}

// ——————————————————— S11 vuelta al marco, ahora de oro; silencio 2; «Ve, y haz tú lo mismo» ———————————————————
export function S11(E) {
  const { H } = E, p = PAL.gold;
  const S = stg({ light: [-.03, .06, -.12], lightR: .22, lightCol: '#f6e3b4', key: 1.25, keyCol: '#f6ead2', keyPos: [-.12, .3, .3], amb: .34, ambCol: '#c0ac8c', floor: .4 });
  const A = arch(S, p, { wall: '#b39a74', ledge: '#1d140b', fig: '#120b06' });
  const ray = burst(.2, .3, '#ffe6b0'); ray.rotation.z = Math.PI; ray.position.set(-.04, .15, -.045); S.add(ray);
  const C = clawd(S.U, { u: .0018, z: -.094, glow: .4 }); S.scene.add(C.g);
  return { S, update(t) {
    const in2 = eio(seg(t, H.ve + .9, E.T0 + E.dur + .6)), appr = eio(seg(t, E.T0, H.sil2));
    const z = lerp(lerp(.66, .6, appr), .3, in2), y = lerp(-.02, .022, in2), x = lerp(lerp(0, -.006, appr), 0, in2);
    aim(S.cam, [x, y, z, x, y, -.08], t, { hand: .0003 });
    const q = ss(seg(t, H.pregunta - .5, H.pregunta)) * (1 - ss(seg(t, H.responde - .2, H.responde + .3)));
    const go = ss(seg(t, H.ve - .1, H.ve + .5));
    A.J.set({ x: -.046, y: -.069, a: lerp(.35, 1.0, q) * (1 - go) + go * 1.3 });
    const bow = ss(seg(t, H.responde - .1, H.responde + .5));
    A.M.set({ x: .048, y: -.069, face: -1, rot: bow * .13, a: .15 });
    C.set({ x: -.016, y: ry(A.r4, -.016), look: lerp(-.6, .2, go), blink: blinkAt(t, 3.6), k: .9 });
    const light = ss(seg(t, H.sil2 - .3, H.ve)), l0 = ss(seg(t, E.T0, E.T0 + .8));
    ray.userData.set(lerp(.4, 1.6, light) * l0);
    setL(S, -.03, .06, lerp(.2, .3, light), lerp(1.0, 1.35, light)); S.key.intensity = lerp(1.2, 1.5, light);
  }, post() { return POST(blo(.34, 1.05)); }, grade() { return { vig: .4 }; } };
}

// ——————————————————— S12 el camino de oro, vacío: Clawd grande pregunta al espectador ———————————————————
export function S12(E) {
  const { H } = E, p = PAL.gold;
  const S = stg({ light: [.02, .05, -.12], lightR: .26, lightCol: '#f6e3b4', key: 1.3, keyCol: '#f6ead2', amb: .36, ambCol: p.amb, floor: .45 });
  road(S, p);
  const C = clawd(S.U, { u: .0034, z: -.06, glow: .3 }); S.scene.add(C.g);
  return { S, update(t) {
    const z = lerp(.56, .47, eio(seg(t, E.T0, H.cta + .6)));
    aim(S.cam, [0, .004, z, 0, .004, -.08], t, { hand: .0003 });
    const ask = ss(seg(t, H.cta - .1, H.cta + .3)), w = H.palabra, wave = t > w ? Math.sin((t - w) * 8) * .35 * (1 - ss(seg(t, w + 1.4, w + 2))) : 0;
    const look = t < H.cta ? lerp(.8, .2, ss(seg(t, H.basta, H.basta + .8))) : lerp(.2, 0, ask);
    C.set({ x: -.004, y: ry(ROAD.r4, -.004) - .0003 + Math.abs(bob(t, 1.2, .0004)), look, aR: ask * 1.5 + wave, blink: blinkAt(t, 2.9, .4), k: 1 });
    setL(S, .02, .05, .26, 1.05);
  }, post() { return POST(blo(.3, 1.12)); }, grade() { return { vig: .32 }; } };
}
