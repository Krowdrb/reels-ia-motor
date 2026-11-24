// The twelve shots of "Perdido tres días" (Jesús a los 12 años, Lucas 2:41–52). Each: { S, update(t), post(), grade() }; t in film seconds.
// God is only ever light. Jesus (a boy of twelve, smaller than the adults), María, José, the teachers and the caravan are quiet dark
// silhouettes without features. Clawd is the only clay-coloured thing; he only walks, looks and stands still. Dark → gold.
import * as THREE from 'three';
import { skyPanel, moon, setMoon, text } from './paper.js';
import { stage, aim } from './stage.js';
import { mulberry, seg, ss, eio, eo, lerp, clamp, env, TAU } from './lib.js';
import { mk, cut, tint, clawd, human, waveFill, pilgrim, tent, jerusalem, colonnade, leaf } from './actors.js';

const blo = (s = .34, th = 1.1) => ({ strength: s, radius: .6, threshold: th });
const lay = (S, o) => S.add(mk(S.U, o));
const col3 = c => new THREE.Color(c);
const mixc = (a, b, p) => '#' + col3(a).lerp(col3(b), clamp(p)).getHexString();
const setL = (S, x, y, r, lit, c) => { S.U.uLight.value.x = x; S.U.uLight.value.y = y; S.U.uLightR.value = r; S.U.uLit.value = lit; if (c) S.U.uLightCol.value.copy(c); };
const fsOf = (S, z) => S.cam.position.z - z;
const blinkAt = (t, per = 3.3, ph = 0) => 1 - .9 * Math.max(0, 1 - Math.abs(((t + ph) % per) - .1) / .1);
// camera height that puts world height gy at fraction f of the frame from the top, for a level camera at distance d
const camY = (gy, f, d) => gy - (.5 - f) * .4617 * d;
const flip = A => { A.g.scale.x = -Math.abs(A.g.scale.x); };
const backTo = (C, on) => { C.eyeL.visible = C.eyeR.visible = !on; };   // Clawd seen from behind: no eyes
const G = -.06;   // ground line where the figures stand
export { G, camY };

// a ground sheet whose top is a soft wave at world height `base`
const ground = (S, z, col, base, amp, len, ph, tr = .08, o = {}) => { const w = o.w || 1.2, ox = o.x || 0; return lay(S, { w, h: .5, x: ox, y: -.2, z, col, trans: tr, ppm: o.ppm || Math.min(2400, 4000 / w), finish: { rim: o.rim ?? .45 }, draw: x => { x.translate(-ox, .2); waveFill(x, { x0: ox - w / 2, x1: ox + w / 2, base, amp, len, ph, peak: o.peak ?? 1.3 }); } }); };
// sky: stops given as world heights [[y, col], ...] (top first); h tall, centred at y
const sky = (S, { z = -.22, w = 1.6, h = .8, y = 0, ys, stars = 0, starMinY = .0, gain = 1 }) => { const top = y + h / 2; return S.add(skyPanel({ w, h, y, z, gain, stars, starMinY: starMinY - y, stops: ys.map(([yy, c]) => [clamp((top - yy) / h), c]) })); };
// a walking step for silhouettes (left = walking toward -x)
const walkSet = (A, x, y, t, f = 7.5, ph = 0, amp = .28, left = true) => { const p = t * f + ph; A.set({ x, y: y + Math.abs(Math.sin(p)) * .0011, a: Math.sin(p) * amp }); if (left) flip(A); };
// a vertical column of light: horizontal gaussian × soft start; `fall` 0..1 brings it down from the top (analytic, no texture)
function column(w, h, col = '#ffd79a') {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.ShaderMaterial({
    uniforms: { col: { value: new THREE.Color(col) }, k: { value: 0 }, fall: { value: 1 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: `varying vec2 vUv; uniform vec3 col; uniform float k, fall; void main(){
      float u = (vUv.x - .5) / .5; float core = exp(-u*u/.05), wide = exp(-u*u/.35);
      float v = vUv.y; float shown = smoothstep(1. - fall - .12, 1. - fall, v);
      float a = (core * .9 + wide * .35) * smoothstep(0., .05, v) * (.75 + .25 * v) * shown;
      gl_FragColor = vec4(col * a * k, 1.); }`,
  }));
  m.renderOrder = 10; m.userData.set = (k, fall = 1) => { m.material.uniforms.k.value = k; m.material.uniforms.fall.value = fall; }; return m;
}
// soft radial glow (pool of light on the floor, halos)
function glow(w, h, col = '#ffd79a', pw = 2) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.ShaderMaterial({
    uniforms: { col: { value: new THREE.Color(col) }, k: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: `varying vec2 vUv; uniform vec3 col; uniform float k; void main(){ float a = pow(max(0., 1. - length((vUv - .5) * 2.)), ${pw.toFixed(1)}); gl_FragColor = vec4(col * a * k, 1.); }`,
  }));
  m.renderOrder = 10; m.userData.set = k => { m.material.uniforms.k.value = k; }; return m;
}

// —— the road from Jerusalem: sky, far hills, the city on its hill, the road, the dark front edge ——
const DUSK = { sky: [[.2, '#221e3c'], [.08, '#3a3458'], [.02, '#6a5c86'], [-.01, '#a88a9c'], [-.04, '#c49a98']], far: '#7a7096', city: '#5a5280', mid: '#4a4468', path: '#2e2a48', front: '#120f1e', fig: '#120f1e' };
const NIGHT = { far: '#3a4a78', city: '#2a3866', mid: '#2c3a66', path: '#1a2448', front: '#0b0f22' };
const DAY = { far: '#c4ad88', city: '#9a8462', mid: '#8a7458', path: '#5a4630', front: '#1e160c' };
const GOLD = { sky: [[.2, '#6a5a7a'], [.08, '#c89a86'], [.02, '#f2cf96'], [-.02, '#ffe7b0']], far: '#d8b27a', city: '#a07a4a', mid: '#7a5a34', path: '#5a3e1e', front: '#1c1208', fig: '#1c1208' };
function road(S, P, o = {}) {
  const sk = sky(S, { ys: P.sky, stars: o.stars || 0, starMinY: .03 });
  const far = ground(S, -.19, P.far, .004, .014, .3, 1.7, .5, { w: 2, ppm: 1600 });
  const J = jerusalem(S.U, { s: o.cs || 1, z: o.cz || -.175, col: P.city, k: o.wk || 1 }); J.g.position.x = o.cx ?? .06; J.g.position.y = o.cy ?? -.004; S.scene.add(J.g);
  const mid = ground(S, -.14, P.mid, -.028, .01, .22, 4.1, .25, { w: 2, ppm: 1800 });
  const path = ground(S, -.095, P.path, G - .001, .0025, .2, 2.6, .1, { w: 2 });
  const front = ground(S, -.04, P.front, G - .034, .006, .11, .4, .02, { w: 1.4, peak: 2, rim: .3 });
  const L = { far, mid, path, front };
  return { sky: sk, J, L, tintTo: (Pa, Pb, p) => { for (const k in L) tint(L[k], mixc(Pa[k], Pb[k], p)); tint(J.hill, mixc(Pa.city, Pb.city, p)); } };
}

// the paper title strip (only at the start), held in front of the camera
function titleStrip(S, T) {
  const W = .124, Hh = .05;
  const m = lay(S, { w: W, h: Hh, y: .088, z: -.03, col: '#e7d4a8', trans: .35, shadow: false, recv: false, ppm: 9000, finish: { rim: .3, under: .2 }, draw: x => {
    x.beginPath(); x.roundRect(-W / 2 + .001, -Hh / 2 + .001, W - .002, Hh - .002, .002); x.fill();
    cut(x, () => {
      x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.font = '800 100px Cinzel'; const k = Math.min(.0122, .108 / (x.measureText(T.top).width / 100)); x.restore();
      text(x, T.top, 0, .0062, k, 'Cinzel', { weight: 800, fill: '#000' });
      text(x, T.sub, 0, -.0118, .0094, 'Playfair', { weight: 'italic 500', fill: '#000' });
    });
  }, glowDraw: x => { x.fillStyle = '#fff'; x.fillRect(-W / 2, -Hh / 2, W, Hh); }, glow: .55, glowCol: '#e7d4a8', glowRes: .2 });
  m.material.userData.u.uClip.value.set(0, .088, 0, 0);
  return (t, S) => {
    const reveal = ss(seg(t, T.in, T.in + .5)) * (1 - ss(seg(t, T.out - .4, T.out)));
    const cz = S.cam.position.z + .03, ts = cz / .55; m.scale.setScalar(ts); m.position.x = S.cam.position.x; m.position.y = S.cam.position.y + .4617 * cz / 2 * .6;
    m.material.userData.u.uClip.value.set(m.position.x, m.position.y, .085 * reveal * ts, 0); m.visible = reveal > .002;
  };
}

// S1 the caravan leaves: lateral tracking with parallax to the left; one window still lit far up in the city; title; rack focus on "tres días"
export function S1(E) {
  const { H, TITLE } = E;
  const S = stage({ light: [.05, .0, -.1], lightR: .26, lightCol: '#e8c0b8', key: 1.45, keyCol: '#e4d6f0', amb: .42, ambCol: '#9088c0', floor: .42 });
  const R = road(S, DUSK, { cx: .085, cy: -.012, cz: -.175, cs: .95 });
  R.J.light(1);
  const v = .0052, crew = [[-.046, .068, { staff: true }], [-.028, .062, { bundle: true }], [-.008, .072, { child: true }], [.012, .06, {}], [.03, .066, { bundle: true }]]
    .map(([x, h, o], i) => { const p = pilgrim(S.U, { h, z: -.084 - (i % 2) * .004, col: DUSK.fig, rim: .5, ...o }); S.scene.add(p.g); return [p, x]; });
  const C = clawd(S.U, { u: .0029, z: -.064 }); S.scene.add(C.g);
  const title = titleStrip(S, TITLE);
  return { S, update(t) {
    const d = .56, cx = .004 - v * .85 * t, cy = camY(G, .64, d);
    aim(S.cam, [cx, cy, -.08 + d, cx, cy, -.08], t, { hand: .0003 });
    crew.forEach(([p, x], i) => walkSet(p, x - v * t, G, t, 7.2, i * 1.3));
    const stop = ss(seg(t, H.tresdias - .3, H.tresdias + .2));
    C.set({ x: .036 - v * Math.min(t, H.tresdias), y: G, walk: t * 12, stride: .35 * (1 - stop), look: lerp(-.8, .95, stop), blink: blinkAt(t, 3.3, .7), k: 1.15 });
    const rf = ss(seg(t, H.tresdias - .1, H.tresdias + .6)); this._f = lerp(fsOf(S, -.07), fsOf(S, -.175), rf);
    title(t, S);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(.34, 1.05) }; }, grade() { return { vig: .45 }; } };
}

// S2 among the people: tracking alongside the caravan; a child on his father's shoulders; José and María walk together, calm; Clawd behind them
export function S2(E) {
  const S = stage({ light: [-.02, .02, -.1], lightR: .26, lightCol: '#e8c0b8', key: 1.45, keyCol: '#e4d6f0', amb: .42, ambCol: '#9088c0', floor: .42 });
  const R = road(S, DUSK, { cx: .2, cy: -.02 });
  R.J.light(1);
  const R2 = mulberry(9);
  lay(S, { w: 1.4, h: .1, y: G - .03, z: -.032, col: '#0d0b16', trans: .02, ppm: 2800, finish: { rim: .35 }, draw: x => {   // tufts and stones close to the lens
    x.translate(0, -(G - .03)); for (let i = 0; i < 40; i++) { const px = -.7 + i * .035 + R2() * .02, r = .003 + R2() * .005; x.beginPath(); x.ellipse(px, G - .036, r * 1.4, r, 0, 0, TAU); x.fill(); for (let j = 0; j < 4; j++) { x.beginPath(); x.moveTo(px + j * .002, G - .036); x.lineTo(px + j * .002 + (R2() - .5) * .004, G - .03 + R2() * .01); x.lineTo(px + j * .002 + .001, G - .036); x.fill(); } }
    x.fillRect(-.7, G - .08, 1.4, .045);
  } });
  const v = .0052;
  const crew = [[-.044, .068, -.088, { child: true }], [-.018, .066, -.082, {}], [-.002, .061, -.083, {}], [.042, .064, -.092, { staff: true }]]
    .map(([x, h, z, o], i) => { const p = pilgrim(S.U, { h, z, col: DUSK.fig, rim: .55, ...o }); S.scene.add(p.g); return [p, x]; });
  const C = clawd(S.U, { u: .0024, z: -.07 }); S.scene.add(C.g);
  return { S, update(t) {
    const d = .48, cx = -.004 - v * t, cy = camY(G, .64, d);
    aim(S.cam, [cx, cy, -.08 + d, cx, cy, -.08], t, { hand: .0003 });
    crew.forEach(([p, x], i) => walkSet(p, x - v * t, G, t, 7, i * 1.7));
    C.set({ x: .021 - v * t, y: G - .001, walk: t * 12, stride: .3, look: Math.sin(t * 1.6) * .9, blink: blinkAt(t, 3.1, .3), k: 1.1 });
    this._f = fsOf(S, -.08);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(.32, 1.1) }; }, grade() { return { vig: .45 }; } };
}

// —— the camp at night: tents in three layers; their doors light one by one ——
function camp(S, o = {}) {
  sky(S, { ys: [[.25, '#050a1e'], [.08, '#0a1330'], [.0, '#1c2a58'], [-.03, '#2a3a6a']], stars: 260, starMinY: -.01, h: 1 });
  const mn = moon({ r: .008, x: -.05, y: .09, z: -.21, gain: 1.6, halo: 6, haloGain: .25 }); S.scene.add(mn);
  ground(S, -.17, '#4a5f92', -.006, .016, .26, 2.2, .5, { w: 1.6, ppm: 1600 });
  const rows = [];
  const row = (z, gz, base, col, specs) => { ground(S, gz, col, base, .002, .2, z * 90, .2); return specs.map(([x, w, h]) => { const T = tent(S.U, { w, h, z, col: mixc(col, '#000', .25), rim: .45 }); T.g.position.set(x, base - .001, z); S.scene.add(T.g); return T; }); };
  rows.push(row(-.145, -.148, -.032, '#33437a', [[-.07, .022, .016], [-.04, .02, .015], [-.01, .024, .017], [.025, .021, .015], [.055, .023, .016], [.085, .02, .014]]));
  rows.push(row(-.117, -.12, -.045, '#2c3a66', [[-.06, .036, .026], [-.018, .034, .025], [.03, .038, .027], [.07, .034, .025]]));
  rows.push(row(-.092, -.095, G, '#1a2448', o.near || [[-.04, .056, .042], [.022, .06, .045]]));
  ground(S, -.04, '#0b0f22', G - .034, .006, .11, 1.4, .02, { w: 1.4, peak: 2, rim: .3 });
  return { rows, moon: mn };
}

// S3 a day's journey: crane down from the stars to the camp; tent doors light one by one; José and María go from one to the next
export function S3(E) {
  const { H } = E;
  const S = stage({ light: [0, .0, -.1], lightR: .24, lightCol: '#8fa4d8', key: 1.2, keyCol: '#a8b8e8', amb: .34, ambCol: '#5a6aa8', floor: .32 });
  const K = camp(S);
  const Jo = human(S.U, { h: .052, z: -.1, col: '#080b1a', rim: .45 }); S.scene.add(Jo.g);
  const Ma = human(S.U, { h: .048, z: -.101, col: '#080b1a', rim: .45 }); S.scene.add(Ma.g);
  const C = clawd(S.U, { u: .002, z: -.08 }); S.scene.add(C.g);
  const doors = [...K.rows[0], ...K.rows[1], ...K.rows[2]];
  return { S, update(t) {
    const k = eio(seg(t, E.T0 - .6, E.T0 + 1.6)), d = .6, cx = .0, cy = lerp(camY(G, .64, d) + .07, camY(G, .64, d), k);
    aim(S.cam, [cx, cy, -.08 + d, cx, cy + .02 * (1 - k), -.08], t, { hand: .0003 });
    const a = H.tiendas - .3;
    doors.forEach((T, i) => T.light(ss(seg(t, a + i * .1, a + i * .1 + .25)) * (i < 6 ? .55 : i < 10 ? .8 : 1)));
    const w = seg(t, E.T0, E.T0 + E.dur + .6), jx = lerp(-.035, .012, w);
    walkSet(Jo, jx, G + .001, t, 6.5, 0, .25, false); walkSet(Ma, jx - .014, G + .001, t, 6.5, 1.5, .25, false);
    C.set({ x: -.058, y: G - .002, rot: -.08, look: .9, blink: blinkAt(t, 3.2, .4), k: 1.2 });
    this._f = fsOf(S, -.095);
  }, post() { return { focus: this._f, aper: 5, maxCoc: 4, bloom: blo(.4, 1.0) }; }, grade() { return { vig: .5 }; } };
}

// S4 not there: María before the last tent, the door lit and empty; José behind; silence 1: the door goes dark. Slow push-in.
export function S4(E) {
  const { H } = E;
  const S = stage({ light: [.03, -.03, -.1], lightR: .2, lightCol: '#8fa4d8', key: 1.2, keyCol: '#a8b8e8', amb: .34, ambCol: '#5a6aa8', floor: .32 });
  const K = camp(S, { near: [[.046, .074, .056]] });
  const Tn = K.rows[2][0];
  const Ma = human(S.U, { h: .064, z: -.086, col: '#070a18', rim: .6 }); S.scene.add(Ma.g);
  const Jo = human(S.U, { h: .07, z: -.088, col: '#070a18', rim: .55 }); S.scene.add(Jo.g);
  const C = clawd(S.U, { u: .0019, z: -.072 }); S.scene.add(C.g);
  const pool = glow(.05, .02, '#ffb862'); pool.position.set(.046, G + .001, -.0915); S.add(pool);
  K.rows[0].forEach(T => T.light(.5)); K.rows[1].forEach((T, i) => T.light(i % 2 ? .7 : 0));
  return { S, update(t) {
    const k = eio(seg(t, E.T0, E.T0 + E.dur + .5)), d = lerp(.5, .45, k), cx = lerp(.002, .008, k), cy = camY(G, .64, d);
    aim(S.cam, [cx, cy, -.08 + d, cx, cy, -.08], t, { hand: t > H.silencio1 ? .0001 : .0003 });
    const off = ss(seg(t, H.silencio1 + .1, H.silencio1 + 1.0));
    Tn.light(1 - off); pool.userData.set(.5 * (1 - off));
    Ma.set({ x: .012, y: G, a: lerp(.15, .5, ss(seg(t, H.l06, H.l06 + .7))) * (1 - .3 * off) });
    Jo.set({ x: -.01, y: G, a: .1 });
    C.set({ x: -.03, y: G - .003, look: .8, blink: t > H.silencio1 ? 1 : blinkAt(t, 3.6, .4), tuck: .3, k: lerp(1.15, .75, off) });
    setL(S, .03, -.03, .2, lerp(1, .7, off));
    this._f = fsOf(S, -.086);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 4, bloom: blo(.4, 1.0) }; }, grade() { return { vig: .5 }; } };
}

// S5 back, three days: the road again, now to the right; the light passes three times over the walls; the temple window stays lit
export function S5(E) {
  const { H } = E;
  const S = stage({ light: [.04, .03, -.1], lightR: .28, lightCol: '#ffe4c0', key: 1.3, keyCol: '#f0e4d8', amb: .4, ambCol: '#a09cb8', floor: .45 });
  const R = road(S, { ...DUSK, sky: [[.2, '#ffffff'], [-.04, '#ffffff']] }, { cx: .07, cy: -.03, cz: -.16, cs: 1.6 });
  const sun = moon({ r: .009, x: 0, y: .05, z: -.21, gain: 2.2, core: '#fffbe8', mid: '#fff0c8', edge: '#ffe0a0', halo: 7, haloGain: .5 }); S.scene.add(sun);
  const Jo = human(S.U, { h: .068, z: -.084, col: '#120f1e', rim: .55 }); S.scene.add(Jo.g);
  const Ma = human(S.U, { h: .063, z: -.086, col: '#120f1e', rim: .55 }); S.scene.add(Ma.g);
  const C = clawd(S.U, { u: .0026, z: -.066 }); S.scene.add(C.g);
  const skN = col3('#1a2650'), skD = col3('#e8d6b0'), skE = col3('#f2c99a');
  const A = E.T0 + .15, B = H.templo - .1;
  return { S, update(t) {
    const go = eo(seg(t, E.T0 - .6, E.T0 + E.dur + .3)), d = .58, cx = lerp(-.03, .022, go), cy = camY(G, .64, d);
    aim(S.cam, [cx, cy, -.08 + d, cx, cy, -.08], t, { hand: .0003 });
    const p = seg(t, A, B), day = t >= B ? 1 : .5 - .5 * Math.cos(TAU * 2.5 * p);
    const q = (p * 2.5 + .5) % 1;   // position of the sun on its arc during each day
    sun.position.set(cx + lerp(-.07, .07, q), t >= B ? .035 : lerp(-.03, .07, Math.sin(Math.PI * q)), -.21); setMoon(sun, ss(clamp((day - .35) / .5)));
    const dusk = ss(seg(t, B, B + .6));
    R.sky.material.color.copy(skN.clone().lerp(skD, day).lerp(skE, dusk * .6));
    R.tintTo(NIGHT, DAY, day);
    R.J.light(Math.max(1 - day, ss(seg(t, B - .2, B + .3))), [0, 0, 0]);
    setL(S, .04, .03, .28, lerp(.55, 1.05, day)); S.key.intensity = lerp(.8, 1.35, day); S.amb.intensity = lerp(.25, .42, day);
    const wx = lerp(-.07, .0, go);
    walkSet(Jo, wx, G, t, 8, 0, .3, false); walkSet(Ma, wx - .016, G, t, 8, 1.4, .3, false);
    const cg = eo(seg(t, E.T0 - .6, E.T0 + E.dur + .1)), see = ss(seg(t, B - .3, B + .4));
    C.set({ x: lerp(-.03, .04, cg), y: G - .001, walk: t * 15, stride: .38 * (1 - see * .7), aL: .8 * see, aR: .8 * see, look: .9, blink: blinkAt(t, 3, .2), k: 1.1 });
    this._f = fsOf(S, -.084);
  }, post() { return { focus: this._f, aper: 5, maxCoc: 4, bloom: blo(.36, 1.05) }; }, grade() { return { vig: .42 }; } };
}

// —— the temple court: back wall with the lit sanctuary door, columns, floor, the teachers seated in a half circle, the boy in the middle ——
const STONE = { wall: '#b8b2a0', cols: '#7d7868', floor: '#45423a', near: '#2a2720', front: '#14120e', fig: '#14110c' };
const GOLDT = { wall: '#ffe9b8', cols: '#e2b468', floor: '#8a6230', near: '#5a3e1c', front: '#1e1408', fig: '#1e1408' };
export { STONE, GOLDT };
export function court(S, P = STONE, o = {}) {
  const back = skyPanel({ w: .04, h: .1, x: 0, y: G + .045, z: -.162, stops: [[0, '#fff3cf'], [.6, '#ffd48a'], [1, '#e0a050']], gain: o.backGain ?? .9 }); S.add(back);
  const wall = lay(S, { w: 1.0, h: .44, y: G + .16, z: -.155, col: P.wall, trans: .5, ppm: 1800, finish: { rim: .3 }, draw: x => {
    x.translate(0, -(G + .16)); x.fillRect(-.5, G - .06, 1, .44);
    x.fillStyle = '#868686'; for (let yy = G; yy < G + .38; yy += .012) { x.fillRect(-.5, yy, 1, .0008); const off = (Math.round(yy * 1000) % 2) * .012; for (let xx = -.5 + off; xx < .5; xx += .024) x.fillRect(xx, yy, .0008, .012); }
    cut(x, () => { x.fillRect(-.013, G - .002, .026, .07); x.beginPath(); x.arc(0, G + .068, .013, 0, Math.PI); x.fill(); });
  } });
  const cols = colonnade(S.U, { xs: [-.2, -.13, -.065, .065, .13, .2], y0: G - .006, y1: G + .16, cw: .012, z: -.13, col: P.cols, trans: .3, w: 1, ppm: 2200 }); S.add(cols);
  const floor = ground(S, -.115, P.floor, G + .0005, .0006, .2, 1, .15, { w: 1, rim: .35 });
  const Tz = [[-.044, -.096, 0, .052], [-.03, -.11, 0, .05], [.031, -.11, 1, .05], [.046, -.096, 1, .053]];
  const teachers = Tz.map(([x, z, f, h]) => { const m = human(S.U, { h, z, col: P.fig, rim: .6, pose: 'sit', two: true }); S.scene.add(m.g); return { m, x, f }; });
  const boy = human(S.U, { h: .04, z: -.1, col: P.fig, rim: .9, trans: .02, pose: 'sit' }); S.scene.add(boy.g);
  const near = colonnade(S.U, { xs: [-.092, .092], y0: G - .04, y1: G + .2, cw: .02, z: -.062, col: P.near, trans: .08, w: .4, ppm: 2600, lintel: 0 }); S.add(near);
  const L = { wall, cols, floor, near };
  const seat = (lean = 0, arms = [.5, .5, .5, .5]) => {
    teachers.forEach(({ m, x, f }, i) => { m.set({ x, y: G, a: arms[i], rot: -lean * .07 * (f ? -1 : 1) }); if (f) flip(m); });
    boy.set({ x: -.003, y: G, a: .45 });
  };
  return { back, wall, cols, floor, near, teachers, boy, seat, L, warm: (p, from = P, to = GOLDT) => { for (const k in L) tint(L[k], mixc(from[k], to[k], p)); [...teachers.map(t => t.m), boy].forEach(m => { tint(m.body, mixc(from.fig, to.fig, p)); tint(m.arm, mixc(from.fig, to.fig, p)); }); } };
}
// the temple steps in front of the court: n sheets from (z0, top0) up to (z1, G)
function steps(S, { n = 9, z0 = -.03, z1 = -.08, top0 = G - .07, c0 = '#24211c', c1 = '#5a5446', w = 1 } = {}) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const p = i / (n - 1), z = lerp(z0, z1, p), top = lerp(top0, G, p);
    out.push({ z, top, m: lay(S, { w, h: .3, y: top - .15, z, col: mixc(c0, c1, p), trans: .1, ppm: 1400, finish: { rim: .6, rimPx: 3, under: .3 }, draw: x => x.fillRect(-w / 2, -.15, w, .3) }) });
  }
  return out;
}

// S6 the steps: Clawd climbs step by step; the camera tilts up and finds the teachers seated in a half circle and, in the middle, the boy
export function S6(E) {
  const { H } = E;
  const S = stage({ light: [0, G + .05, -.1], lightR: .22, lightCol: '#ffe2b0', key: 1.5, keyCol: '#fff0d8', amb: .42, ambCol: '#a89c88', floor: .45 });
  const T = court(S); T.seat();
  const St = steps(S);
  const C = clawd(S.U, { u: .0024, z: St[0].z - .003 }); S.scene.add(C.g);
  return { S, update(t) {
    const k = eio(seg(t, E.T0 - .3, H.l08 + 2.2)), d = .52, cx = -.004, cy = lerp(camY(G - .055, .6, d), camY(G, .6, d), k);
    aim(S.cam, [cx, cy - .012 * (1 - k), -.08 + d, cx, cy, -.08], t, { hand: .0003 });
    const per = .3, a = E.T0 + .1, n = St.length - 1, f = clamp((t - a) / per, 0, n), i = Math.floor(f), fr = f - i, j = Math.min(n, i + 1);
    const hopK = i < n ? ss(clamp(fr / .6)) : 0, z = lerp(St[i].z, St[j].z, hopK) + .003, y = lerp(St[i].top, St[j].top, hopK) + Math.sin(Math.PI * clamp(fr / .6)) * .004 * (i < n ? 1 : 0);
    C.g.position.z = z;
    const see = ss(seg(t, a + n * per + .1, a + n * per + .6));
    C.set({ x: -.034, y, aL: .9 * see, aR: .9 * see, look: lerp(.3, .7, see), blink: blinkAt(t, 3.2, .5), k: 1.1 });
    this._f = fsOf(S, -.09);
  }, post() { return { focus: this._f, aper: 5, maxCoc: 4, bloom: blo(.32, 1.1) }; }, grade() { return { vig: .42 }; } };
}

// S7 they marvelled: the teachers lean toward the middle, two arms rise; rack focus from the column in front to the boy; Clawd peeks round it
export function S7(E) {
  const { H } = E;
  const S = stage({ light: [0, G + .04, -.1], lightR: .2, lightCol: '#ffe2b0', key: 1.5, keyCol: '#fff0d8', amb: .42, ambCol: '#a89c88', floor: .45 });
  const T = court(S);
  const pil = colonnade(S.U, { xs: [-.05], y0: G - .04, y1: G + .2, cw: .016, z: -.066, col: '#2a2720', trans: .08, w: .1, ppm: 2600, lintel: 0 }); S.add(pil);
  const C = clawd(S.U, { u: .0018, z: -.069 }); S.scene.add(C.g);
  return { S, update(t) {
    const k = eio(seg(t, E.T0, E.T0 + E.dur + .5)), d = lerp(.42, .4, k), cx = .0, cy = camY(G, .6, d);
    aim(S.cam, [cx, cy, -.08 + d, cx, cy, -.08], t, { hand: .0003 });
    const m = ss(seg(t, H.maravilla, H.maravilla + 1.2));
    T.seat(m, [.5, .5 + 1.0 * m, .5 + .9 * ss(seg(t, H.maravilla + .3, H.maravilla + 1.4)), .5]);
    setL(S, 0, G + .04, .2, lerp(1, 1.35, m)); S.key.intensity = lerp(1.5, 1.75, m);
    C.set({ x: -.036, y: G - .002, rot: -.1, look: 1, blink: 1 - .8 * env(t, H.maravilla + .5, H.maravilla + 1.1, .25, .25), k: 1.1 });
    const rf = ss(seg(t, E.T0 + .2, E.T0 + 1.0)); this._f = lerp(fsOf(S, -.072), fsOf(S, -.1), rf);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 6, bloom: blo(.34, 1.05) }; }, grade() { return { vig: .45 }; } };
}

// S8 his mother: María and José come in from the left and stop at the threshold; María reaches out on "Hijo"; silence 2: nobody moves,
// the light of the court gathers on the boy; slow push-in
export function S8(E) {
  const { H } = E;
  const S = stage({ light: [0, G + .05, -.1], lightR: .24, lightCol: '#ffe2b0', key: 1.5, keyCol: '#fff0d8', amb: .42, ambCol: '#a89c88', floor: .45 });
  const T = court(S); T.seat();
  const Ma = human(S.U, { h: .066, z: -.085, col: '#0f0d09', rim: .6 }); S.scene.add(Ma.g);
  const Jo = human(S.U, { h: .072, z: -.087, col: '#0f0d09', rim: .55 }); S.scene.add(Jo.g);
  const C = clawd(S.U, { u: .0018, z: -.072 }); S.scene.add(C.g);
  const spot = glow(.05, .03, '#ffd79a'); spot.position.set(-.003, G + .004, -.101); S.add(spot);
  return { S, update(t) {
    const pk = eio(seg(t, H.silencio2 - .3, E.T0 + E.dur + .3)), d = lerp(.67, .62, pk), cx = lerp(-.016, -.014, pk), cy = camY(G, .6, d);
    aim(S.cam, [cx, cy, -.08 + d, cx, cy, -.08], t, { hand: t > H.silencio2 ? 0 : .0003 });
    const w = seg(t, E.T0 - .3, H.hijo - .3), x0 = lerp(-.1, -.04, eo(w)), walking = w > 0 && w < 1;
    const ph = t * 7;
    Ma.set({ x: x0, y: G + (walking ? Math.abs(Math.sin(ph)) * .001 : 0), a: walking ? Math.sin(ph) * .25 : lerp(.1, 1.25, ss(seg(t, H.hijo - .2, H.hijo + .5))) });
    Jo.set({ x: x0 - .019, y: G + (walking ? Math.abs(Math.sin(ph + 1.4)) * .001 : 0), a: walking ? Math.sin(ph + 1.4) * .25 : .12 });
    C.set({ x: x0 - .034, y: G - .003, look: .9, blink: t > H.hijo ? 1 : blinkAt(t, 3.3), tuck: .2, k: 1.05 });
    const g = ss(seg(t, H.silencio2 - .2, H.silencio2 + 1.2));
    setL(S, lerp(0, -.004, g), G + lerp(.05, .02, g), lerp(.24, .07, g), lerp(1, 1.4, g)); S.key.intensity = lerp(1.5, .9, g); S.amb.intensity = lerp(.42, .24, g);
    spot.userData.set(.45 * g);
    this._f = fsOf(S, -.095);
  }, post() { return { focus: this._f, aper: 5, maxCoc: 4, bloom: blo(.34, 1.05) }; }, grade() { return { vig: .48 }; } };
}

// the climax set: court + front steps + three lattice screens (paper doors) whose leaves swing on their outer hinges, front to back
export function climax(S) {
  const T = court(S, STONE, { backGain: .9 }); T.seat();
  const St = steps(S, { n: 4, z0: -.026, z1: -.07, top0: G - .03, c0: '#1a1610', c1: '#3a342a' });
  const Z = [-.034, -.046, -.058], W = .068, DC = ['#3a3428', '#4a4232', '#5a503c'];
  const doors = Z.map((z, i) => [-1, 1].map(side => { const m = leaf(S.U, { W, y0: G - .002, y1: G + .26, z, side, col: DC[i], trans: .35 }); m.position.x = side * W; S.add(m); return m; }));
  const col = column(.06, .3, '#ffd79a'); col.position.set(-.002, G + .15, -.104); S.add(col);
  const pool = glow(.07, .03, '#ffd79a'); pool.position.set(-.002, G + .003, -.104); S.add(pool);
  const open = ks => doors.forEach((pair, i) => pair.forEach((m, j) => { m.rotation.y = (j ? 1 : -1) * 1.52 * ks[i]; }));
  const tintDoors = p => doors.forEach((pair, i) => pair.forEach(m => tint(m, mixc(DC[i], ['#e2b468', '#d0a058', '#b88a48'][i], p), 1 + .8 * p)));
  return { T, St, doors, col, pool, open, tintDoors };
}

// S9 signature: "¿No sabían que debo estar en las cosas de mi Padre?" — the screens open like paper doors, front to back; on "Padre" a column
// of light comes straight down on the boy, still seated. Dolly in through the layers. Clawd small, bottom left, from behind, out of the light.
export function S9(E) {
  const { H } = E;
  const S = stage({ light: [0, G + .06, -.1], lightR: .16, lightCol: '#ffd79a', key: 1.2, keyCol: '#ffe8c8', amb: .3, ambCol: '#a89878', floor: .3 });
  const X = climax(S);
  const C = clawd(S.U, { u: .0019, z: X.St[0].z - .003, glow: .45 }); S.scene.add(C.g); backTo(C, true);
  const gold = col3('#ffd79a'), cool = col3('#ffe2b0');
  return { S, update(t) {
    const P0 = H.puertas + .15, ks = [0, 1, 2].map(i => eio(seg(t, P0 + i * .2, P0 + i * .2 + .85)));
    X.open(ks);
    const Pd = H.padre, fall = ss(seg(t, Pd - .35, Pd + .35)), glowK = ss(seg(t, Pd - .3, Pd + 1.2));
    X.col.userData.set(1.1 * glowK, fall); X.pool.userData.set(.6 * glowK);
    const warm = ss(seg(t, P0, Pd + 1.0)); X.T.warm(warm * .9); X.tintDoors(warm);
    X.T.back.material.color.setScalar(lerp(.9, 1.8, warm));
    setL(S, -.002, G + lerp(.06, .05, glowK), lerp(.16, .12, glowK), lerp(1.0, 1.7, warm), cool.clone().lerp(gold, warm));
    S.key.intensity = lerp(1.2, 1.6, warm); S.amb.intensity = lerp(.3, .42, warm); S.amb.color.copy(col3('#a89878').lerp(col3('#c8a070'), warm));
    const k = eio(seg(t, P0 + .2, E.T0 + E.dur + .3)), d = lerp(.56, .47, k), cx = 0, cy = camY(G, lerp(.5, .52, k), d);
    aim(S.cam, [cx, cy, -.08 + d, cx, cy, -.08], t, { hand: .0002 });
    C.set({ x: -.026, y: X.St[0].top, k: lerp(.9, 1.1, warm) });
    this._w = warm; this._f = fsOf(S, -.1);
  }, post() { return { focus: this._f, aper: 5, maxCoc: 4, bloom: blo(lerp(.34, .46, this._w), lerp(1.05, .98, this._w)) }; }, grade() { return { vig: .48 }; } };
}

// S10 they did not understand: reverse angle, José and María in the gold light, still; María's hand goes to her chest. Clawd aside, head low.
export function S10(E) {
  const S = stage({ light: [.06, G + .05, -.1], lightR: .22, lightCol: '#ffd79a', key: 1.5, keyCol: '#ffe6c0', amb: .4, ambCol: '#c8a070', floor: .45 });
  const T = court(S, GOLDT, { backGain: 1.6 });
  T.teachers.forEach(({ m }) => { m.g.visible = false; }); T.boy.g.visible = false;
  const beam = glow(.12, .2, '#ffd79a', 1.6); beam.position.set(.07, G + .05, -.12); S.add(beam); beam.userData.set(.5);
  const Ma = human(S.U, { h: .066, z: -.085, col: '#1e1408', rim: .8, two: true }); S.scene.add(Ma.g);
  const Jo = human(S.U, { h: .072, z: -.088, col: '#1e1408', rim: .75 }); S.scene.add(Jo.g);
  const C = clawd(S.U, { u: .0021, z: -.07, glow: .4 }); S.scene.add(C.g);
  return { S, update(t) {
    const d = .46, cx = lerp(-.006, -.004, seg(t, E.T0, E.T0 + E.dur)), cy = camY(G, .6, d);
    aim(S.cam, [cx, cy, -.08 + d, cx, cy, -.08], t, { hand: .00015 });
    const hc = ss(seg(t, E.T0 + .3, E.T0 + 1.1));
    Ma.set({ x: .022, y: G, a: lerp(.2, 1.15, hc), rot: -.02 * hc });
    Jo.set({ x: -.012, y: G, a: .15 });
    C.set({ x: -.042, y: G - .003, look: .7, tuck: .6, blink: 1, k: .95 });
    this._f = fsOf(S, -.085);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 4, bloom: blo(.4, 1.0) }; }, grade() { return { vig: .42 }; } };
}

// S11 he went down with them: the three come down the temple stairs together, the boy between his parents; the road to Nazareth in gold;
// tilt down and pull out; Clawd follows at a distance
const stairY = (x, x0 = -.08, n = 5, sw = .017, sh = .011) => G + n * sh - clamp(Math.floor((x - x0) / sw) + 1, 0, n) * sh;
export function S11(E) {
  const S = stage({ light: [.03, .03, -.1], lightR: .28, lightCol: '#ffd79a', key: 1.6, keyCol: '#ffe6c0', amb: .4, ambCol: '#c8a070', floor: .5 });
  const R = road(S, GOLD, { cx: .09, cy: -.02, cz: -.17, cs: .9 }); R.J.light(1, [1, 1, 1]);
  lay(S, { w: .4, h: .3, x: -.2, y: G + .1, z: -.1, col: '#8a6a40', trans: .3, ppm: 2400, finish: { rim: .5 }, draw: x => {   // the temple wall and a column, to the left
    x.fillRect(-.2, -.15, .12, .3); x.fillRect(-.066, -.15, .012, .26);
  } });
  lay(S, { w: .3, h: .2, x: -.05, y: G - .05, z: -.09, col: '#7a5a30', trans: .2, ppm: 2400, finish: { rim: .8, rimPx: 5, rimCol: 'rgba(255,230,170,.8)' }, draw: x => {
    x.translate(.05, -(G - .05)); x.beginPath(); x.moveTo(-.2, G - .15);
    for (let xx = -.2; xx <= .1; xx += .0005) x.lineTo(xx, stairY(xx)); x.lineTo(.1, G - .15); x.closePath(); x.fill();
  } });
  const Jo = human(S.U, { h: .068, z: -.084, col: '#1c1208', rim: .7 }); S.scene.add(Jo.g);
  const By = human(S.U, { h: .052, z: -.083, col: '#1c1208', rim: .8 }); S.scene.add(By.g);
  const Ma = human(S.U, { h: .063, z: -.085, col: '#1c1208', rim: .7 }); S.scene.add(Ma.g);
  const C = clawd(S.U, { u: .0018, z: -.0815 }); S.scene.add(C.g);
  const sy = x => Math.max(stairY(x - .004), stairY(x + .004));
  return { S, update(t) {
    const k = eio(seg(t, E.T0 - .6, E.T0 + E.dur + .5)), d = lerp(.44, .56, k), cx = lerp(-.034, -.014, k), cy = lerp(camY(G + .04, .62, .44), camY(G, .64, d), k);
    aim(S.cam, [cx, cy, -.08 + d, cx, cy - .006 * k, -.08], t, { hand: .0003 });
    const w = (t - E.T0) * .018, ph = t * 7.5;
    [[Jo, .012], [By, -.002], [Ma, -.016]].forEach(([m, dx], i) => { const x = -.047 + w + dx; m.set({ x, y: sy(x) + Math.abs(Math.sin(ph + i)) * .001, a: Math.sin(ph + i) * .25 }); });
    const xc = -.074 + w * .5;
    C.set({ x: xc, y: sy(xc) + Math.abs(Math.sin(t * 10)) * .001, walk: t * 12, stride: .3, look: .8, blink: blinkAt(t, 3.4), k: 1.0 });
    this._f = fsOf(S, -.085);
  }, post() { return { focus: this._f, aper: 5, maxCoc: 4, bloom: blo(.32, 1.1) }; }, grade() { return { vig: .38 }; } };
}

// S12 echo of S1: the same road, now gold; the whole city lit behind; José, María and the boy walk together; Clawd in front stops,
// looks at them, and on the question turns to us. Slow pull-out.
export function S12(E) {
  const { H } = E;
  const S = stage({ light: [.05, .02, -.1], lightR: .3, lightCol: '#ffd79a', key: 1.6, keyCol: '#ffe6c0', amb: .42, ambCol: '#c8a070', floor: .5 });
  const R = road(S, GOLD, { cx: .07, cy: -.012, cz: -.175, cs: .95, wk: 1.2 });
  const fam = [[.068, -.096], [.052, -.095], [.063, -.097]].map(([h, z]) => { const m = human(S.U, { h, z, col: '#1c1208', rim: .7 }); S.scene.add(m.g); return m; });
  const C = clawd(S.U, { u: .003, z: -.06, glow: .42 }); S.scene.add(C.g);
  return { S, update(t) {
    const k = eio(seg(t, E.T0 - .6, E.T0 + E.dur)), d = lerp(.5, .58, k), cx = lerp(.004, -.002, k), cy = camY(G, .64, d);
    aim(S.cam, [cx, cy, -.08 + d, cx, cy, -.08], t, { hand: .0003 });
    R.J.light(1, [1, ss(seg(t, H.leccion, H.leccion + .4)), ss(seg(t, H.leccion + 1.2, H.leccion + 1.6))]);
    const wk = (t - E.T0) * .0045;
    [.02, .036, .052].forEach((dx, i) => walkSet(fam[i], dx - wk, G, t, 6.5, i * 1.1, .25));
    const st = seg(t, E.T0, E.T0 + 1.2), turn = ss(seg(t, H.pregunta - .3, H.pregunta + .25)), hop = Math.sin(Math.PI * seg(t, H.pregunta - .3, H.pregunta + .1)) * .003;
    C.set({ x: lerp(-.01, -.03, eo(st)), y: G - .001 + hop, walk: t * 12, stride: st < 1 ? .32 : 0, look: lerp(lerp(-.8, .95, ss(seg(t, E.T0 + 1.0, E.T0 + 1.6))), 0, turn), blink: t > H.pregunta + .3 ? blinkAt(t, 2.6, .2) : blinkAt(t, 3.6), aL: .3 * turn, aR: .3 * turn, k: 1.05 });
    this._f = fsOf(S, -.07);
  }, post() { return { focus: this._f, aper: 5, maxCoc: 4, bloom: blo(.32, 1.1) }; }, grade() { return { vig: .36 }; } };
}
