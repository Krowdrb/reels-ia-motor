// The shots of "Cuatro sueños" (Mateo 1:18–25; 2:13–15, 19–23). Each: { S, update(t), post(), grade() }; t in film seconds.
// The angel and God are only ever light: the light behind each veil, the hole it burns, the beam. José, María and the child are serene,
// featureless silhouettes. Clawd is the only clay-coloured thing: to one side, smaller than José, and his only gesture is counting
// (one tap of the arm on the wood or the earth per dream). Grammar of the dream: a pale veil comes down in front of the sleeping José,
// a light burns one round hole in it, and it goes up again. Colour: indigo → gold. A round trip: Nazaret → Belén → Egipto → Nazaret.
import * as THREE from 'three';
import { skyPanel, moon, setMoon, text } from './paper.js';
import { stage, aim } from './stage.js';
import { mulberry, seg, ss, eio, eo, lerp, clamp, spring, TAU } from './lib.js';
import { mk, cut, tint, clawd, human, waveFill, palm, olive, BASE } from './actors.js';

const blo = (s = .34, th = 1.1) => ({ strength: s, radius: .6, threshold: th });
const lay = (S, o) => S.add(mk(S.U, o));
const col3 = c => new THREE.Color(c);
const mixc = (a, b, p) => '#' + col3(a).lerp(col3(b), clamp(p)).getHexString();
const setL = (S, x, y, r, lit, c) => { S.U.uLight.value.x = x; S.U.uLight.value.y = y; S.U.uLightR.value = r; S.U.uLit.value = lit; if (c) S.U.uLightCol.value.set(c); };
const fsOf = (S, z) => S.cam.position.z - z;
const blinkAt = (t, per = 3.3, ph = 0) => 1 - .9 * Math.max(0, 1 - Math.abs(((t + ph) % per) - .1) / .1);
const slowBlink = (t, per = 4.2, ph = 0) => 1 - .92 * Math.max(0, 1 - Math.abs(((t + ph) % per) - .18) / .18);
// camera height that puts world height gy at fraction f of the frame from the top, for a level camera at distance d
const camY = (gy, f, d) => gy - (.5 - f) * .4617 * d;
const flip = A => { A.g.scale.x = -Math.abs(A.g.scale.x); };
const backTo = (C, on) => { C.eyeL.visible = C.eyeR.visible = !on; };
const G = -.06;   // the floor / ground line
export { G, camY };

// Clawd's count: one tap of the right arm per time in ts (lift, come down on the wood at τ, a short rebound). Returns aR.
const taps = (t, ts, up = 1.25) => {
  let a = 0;
  for (const tau of ts) {
    const u = t - tau;
    if (u > -.17 && u <= -.085) a = Math.max(a, up * ss((u + .17) / .085));
    else if (u > -.085 && u <= 0) a = Math.max(a, up * (1 - ss((u + .085) / .085)));
    else if (u > 0 && u < .1) a = Math.max(a, .16 * Math.sin(Math.PI * u / .1));
  }
  return a;
};
const countAt = (t0, n, gap = .3) => [...Array(n).keys()].map(i => t0 + i * gap);

// soft radial glow (pools of light, the light behind a veil)
export function glow(w, h, col = '#ffd79a', pw = 2) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.ShaderMaterial({
    uniforms: { col: { value: new THREE.Color(col) }, k: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: `varying vec2 vUv; uniform vec3 col; uniform float k; void main(){ float a = pow(max(0., 1. - length((vUv - .5) * 2.)), ${pw.toFixed(1)}); gl_FragColor = vec4(col * a * k, 1.); }`,
  }));
  m.renderOrder = 10; m.userData.set = k => { m.material.uniforms.k.value = k; }; return m;
}
// a shaft of light falling from an apex at the top centre of the plane, widening downward
export function shaft(w, h, col = '#ffd79a', spread = .32) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.ShaderMaterial({
    uniforms: { col: { value: new THREE.Color(col) }, k: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: `varying vec2 vUv; uniform vec3 col; uniform float k; void main(){
      float dy = 1. - vUv.y, dx = (vUv.x - .5) * ${(w / h).toFixed(4)};
      float wd = dy * ${spread.toFixed(3)} + .012; float a = exp(-dx*dx/(wd*wd)) * smoothstep(0., .04, dy) * (1. - smoothstep(.7, 1., dy));
      float core = exp(-dx*dx/(wd*wd*.12)) * .6;
      gl_FragColor = vec4(col * (a + core * a) * k, 1.); }`,
  }));
  m.renderOrder = 11; m.userData.set = k => { m.material.uniforms.k.value = k; }; return m;
}
// a ground sheet whose top is a soft wave at world height `base`
const ground = (S, z, col, base, amp, len, ph, tr = .08, o = {}) => { const w = o.w || 1.2, ox = o.x || 0; return lay(S, { w, h: .5, x: ox, y: base - .25, z, col, trans: tr, ppm: o.ppm || Math.min(2400, 4000 / w), finish: { rim: o.rim ?? .45, rimCol: o.rimCol }, draw: x => { x.translate(-ox, -(base - .25)); waveFill(x, { x0: ox - w / 2, x1: ox + w / 2, base, amp, len, ph, peak: o.peak ?? 1.3 }); } }); };

// —— the dream veil: a pale, translucent sheet with visible fibre that comes down from above; a light behind it burns one round hole.
// set(drop 0 up..1 down, burn 0..1 = hole radius, k = brightness of the light behind it, warm 0..1)
function veil(S, { w = .075, h = .1, x = 0, yDown, z, rise = .16, R = .011, hx = 0, hy = .012, op = .6, col = '#d9dcef' }) {
  const Q = mulberry(Math.round(-z * 1e4));
  const m = lay(S, { w: w + .008, h: h + .006, x, y: yDown, z, col, trans: .8, shadow: false, recv: false, ppm: 3200, finish: { rim: .25, under: .12 }, draw: c => {
    c.beginPath(); c.moveTo(-w / 2, h / 2); c.lineTo(w / 2, h / 2);
    for (let u = w / 2; u >= -w / 2 - 1e-6; u -= w / 24) c.lineTo(u, -h / 2 + .002 * Math.sin(u * 300) + .0012 * (Q() - .5));
    c.closePath(); c.fill();
    c.fillRect(-w / 2 - .003, h / 2 - .0015, w + .006, .003);   // the rod it hangs from
  }, glowDraw: c => { c.fillStyle = '#fff'; c.fillRect(-w / 2, -h / 2, w, h); }, glow: 2.4, glowCol: '#ffd88f', glowRes: .3 });
  m.material.transparent = true; m.material.opacity = op; m.material.depthWrite = false; m.renderOrder = 5;
  const u = m.material.userData.u; u.uGlowLit.value = 0;
  const lightG = glow(R * 7, R * 7, '#ffe6a8', 1.8); lightG.position.z = z - .006; S.add(lightG);
  const core = glow(R * 2.6, R * 2.6, '#fff4d8', 1.2); core.position.z = z - .004; S.add(core);
  const base = col3(col), warmC = col3('#ffd27a');
  const V = { m, lightG, core, hole: [x + hx, yDown + hy], z,
    set(drop, burn = 0, k = 0, warm = 0) {
      m.position.y = yDown + (1 - drop) * rise; m.visible = drop > .001;
      const cx = m.position.x + hx, cy = m.position.y + hy, r = R * burn; V.hole = [cx, cy];
      u.uClip.value.set(cx, cy, r, 1);
      u.uGR.value.set(cx, cy, r + .0045 + .003 * k, 1); u.uGlowLit.value = burn > .001 ? (.5 + .9 * k) * Math.min(1, burn * 4) : 0;
      m.material.color.copy(base).lerp(warmC, warm).multiplyScalar(lerp(.42, .95, Math.max(k * .55, warm)) / BASE);
      lightG.position.set(cx, cy, z - .006); lightG.userData.set(k * .9 * drop); lightG.visible = drop > .001;
      core.position.set(cx, cy, z - .004); core.userData.set(k * 1.4 * Math.min(1, burn * 3) * drop); core.visible = drop > .001;
    } };
  V.set(0); return V;
}
// the veil's life in one shot: down at a, light grows until b, the hole burns from b, back up at c
const veilAt = (V, t, a, b, c, o = {}) => {
  const fall = o.fall ?? .6, down = eio(seg(t, a, a + fall)) * (1 - eio(seg(t, c, c + (o.up ?? .6))));
  const k = ss(seg(t, a + fall * .6, b)) * (1 - .6 * ss(seg(t, c, c + .4)));
  const burn = eo(seg(t, b, b + (o.burnT ?? .45)));
  V.set(down, burn, k, o.warm ?? 0); return { down, k, burn };
};
// standing up: the seated figure sinks a little, then the standing one rises out of it (scale y with a spring)
const rise = (sitA, stA, t, a) => {
  const p = seg(t, a, a + .5), up = p >= .35;
  sitA.g.visible = !up; stA.g.visible = up;
  if (!up) sitA.g.position.y -= .002 * ss(p / .35);
  else { const q = (p - .35) / .65; stA.g.scale.y = Math.abs(stA.g.scale.y) * (.78 + .22 * Math.min(1.02, spring(q * 1.2, 6, .6))); }
  return up;
};

// —— palettes (back → front) ——
const PAL = {
  night: { out: '#4b5f8f', wall: '#2b3a63', tools: '#1d2a4c', floor: '#18203c', bench: '#0c1226', front: '#070b18', lampb: '#141a2c' },
  dark: { out: '#121a30', wall: '#0b1020', tools: '#080c18', floor: '#070a14', bench: '#04060c', front: '#020307', lampb: '#05070c' },
  day: { out: '#f0d8a8', wall: '#f3d9a4', tools: '#b88a52', floor: '#a87c48', bench: '#6e4a28', front: '#1c1208', lampb: '#3a2410' },
  belen: { out: '#55507a', wall: '#2f2b4b', tools: '#221f3a', floor: '#1c1930', bench: '#0f0d1c', front: '#0a0912', lampb: '#141224' },
};

// —— the room: the workshop in Nazaret (kind 'shop': tools on the wall, a window, a door, the bench and the stool)
// or a small house in Belén (kind 'belen': an arched door, a niche, a mat; no tools). Window/door open onto the night outside.
export const WIN = { x: .058, y: G + .092, w: .03, h: .034 }, DOOR = { x: -.058, w: .034, h: .072 }, BZ = -.2;
const BENCH = { x0: .012, x1: .104, top: G + .028, z: -.075 }, LAMP = [.03, BENCH.top + .002, -.074];
export function room(S, o = {}) {
  const kind = o.kind || 'shop', P = o.pal || PAL.night, L = [];
  const add = (m, key, gi) => { L.push([m, key, gi]); return m; };
  const sky = skyPanel({ w: 1.4, h: 1, y: .1, z: -.4, stops: o.day ? [[0, '#f8e8c0'], [.5, '#fff2d0'], [1, '#f0d8a0']] : [[0, '#060a1c'], [.45, '#0f1a3a'], [.6, '#1e2c55'], [1, '#0a1022']], stars: o.day ? 0 : 160, starMinY: -.1, seed: 4 }); S.add(sky);
  // outside: far hill with flat-roofed houses and small windows (self-lit)
  const R = mulberry(kind === 'shop' ? 21 : 33), wins = [];
  for (let i = 0; i < 22; i++) { const bx = -.3 + i * .028 + (R() - .5) * .01, bw = .016 + R() * .012, bh = .016 + R() * .02, by = G + .045 + .02 * Math.sin(bx * 9) + (R() - .5) * .01; wins.push([bx, bw, bh, by, R()]); }
  const outM = add(lay(S, { w: .7, h: .3, y: G + .02, z: -.32, col: P.out, trans: .4, ppm: 2400, finish: { rim: .4, rimCol: 'rgba(200,210,255,.4)' }, draw: c => {
    c.translate(0, -(G + .02)); c.beginPath(); c.moveTo(-.35, G - .13); for (let u = -.35; u <= .35; u += .004) c.lineTo(u, G + .04 + .02 * Math.sin(u * 9) + .006 * Math.sin(u * 31)); c.lineTo(.35, G - .13); c.closePath(); c.fill();
    for (const [bx, bw, bh, by] of wins) c.fillRect(bx - bw / 2, by - .02, bw, bh + .02);
  }, glowDraw: c => { c.translate(0, -(G + .02)); c.fillStyle = '#fff'; for (const [bx, bw, bh, by, r] of wins) if (r < .45) c.fillRect(bx - .002, by + bh * .4, .004, .005); }, glow: 2.2, glowCol: '#ffb862', glowRes: .5 }), 'out', 5);
  // the back wall with its openings
  const wallM = add(lay(S, { w: .6, h: .42, y: G + .14, z: BZ, col: P.wall, trans: .28, ppm: 2600, finish: { rim: .3, under: .3 }, draw: c => {
    c.translate(0, -(G + .14)); c.fillRect(-.3, G - .07, .6, .42);
    cut(c, () => {
      if (kind === 'shop') { c.fillRect(WIN.x - WIN.w / 2, WIN.y - WIN.h / 2, WIN.w, WIN.h); c.fillRect(DOOR.x - DOOR.w / 2, G - .01, DOOR.w, DOOR.h + .01); }
      else { const dx = .07, dw = .036, dh = .07; c.beginPath(); c.moveTo(dx - dw / 2, G - .01); c.lineTo(dx - dw / 2, G + dh - dw / 2); c.arc(dx, G + dh - dw / 2, dw / 2, Math.PI, 0, true); c.lineTo(dx + dw / 2, G - .01); c.closePath(); c.fill(); }
    });
  } }), 'wall', 4);
  // things on the wall
  const toolsM = add(lay(S, { w: .4, h: .2, y: G + .1, z: BZ + .004, col: P.tools, trans: .1, ppm: 3600, finish: { rim: .45, under: .3 }, draw: c => {
    c.translate(0, -(G + .1)); c.lineCap = 'round';
    c.fillRect(-.2, G + .165, .4, .007);   // the roof beam
    if (kind === 'shop') {
      // pegs and tools: a saw, a mallet, a square; a shelf with planks; lintels over door and window
      c.fillRect(-.03, G + .128, .075, .003);
      const sx = -.022, sy = G + .118; c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + .032, sy - .004); c.lineTo(sx + .032, sy - .012); for (let k = 0; k < 10; k++) { c.lineTo(sx + .032 - k * .0032 - .0016, sy - .015 + (k % 2) * .0025); } c.lineTo(sx, sy - .012); c.closePath(); c.fill();
      c.beginPath(); c.ellipse(sx - .004, sy - .006, .006, .0055, 0, 0, TAU); c.fill(); cut(c, () => { c.beginPath(); c.ellipse(sx - .004, sy - .006, .0028, .0024, 0, 0, TAU); c.fill(); });
      c.fillRect(.018, G + .098, .0026, .03); c.fillRect(.011, G + .094, .017, .009);   // mallet
      c.fillRect(.033, G + .1, .003, .028); c.fillRect(.033, G + .1, .016, .003);       // square
      c.fillRect(-.032, G + .14, .08, .003); for (const [px, ph] of [[-.028, .018], [-.02, .024], [-.013, .02], [.0, .026], [.012, .016]]) c.fillRect(px, G + .143, .005, ph);   // shelf + planks
      c.fillRect(DOOR.x - DOOR.w / 2 - .004, G + DOOR.h, DOOR.w + .008, .005);
      c.fillRect(WIN.x - WIN.w / 2 - .004, WIN.y + WIN.h / 2, WIN.w + .008, .004); c.fillRect(WIN.x - WIN.w / 2 - .003, WIN.y - WIN.h / 2 - .004, WIN.w + .006, .004);
      c.fillRect(WIN.x - .001, WIN.y - WIN.h / 2, .002, WIN.h);   // the window's middle bar
      for (const [px, a] of [[.09, .12], [.1, .08], [.108, .15]]) { c.save(); c.translate(px, G - .002); c.rotate(-a); c.fillRect(-.003, 0, .006, .09); c.restore(); }   // planks leaning on the wall
    } else {
      // a niche with jars, a hanging basket, a low lintel over the arched door
      c.fillRect(-.06, G + .1, .05, .004);
      c.beginPath(); c.ellipse(-.045, G + .11, .007, .009, 0, 0, TAU); c.fill(); c.fillRect(-.048, G + .118, .006, .004);
      c.beginPath(); c.ellipse(-.024, G + .109, .005, .006, 0, 0, TAU); c.fill();
      c.beginPath(); c.moveTo(.02, G + .15); c.lineTo(.012, G + .125); c.lineTo(.028, G + .125); c.closePath(); c.fill(); c.beginPath(); c.ellipse(.02, G + .122, .01, .006, 0, 0, TAU); c.fill();
      c.fillRect(.045, G + .072, .05, .005);
    }
  } }), 'tools', 3);
  const floorM = add(ground(S, -.13, P.floor, G + .001, .0008, .2, 1.7, .05, { rim: .3, w: .8 }), 'floor', 2);
  let benchM = null;
  if (kind === 'shop') {
    benchM = add(lay(S, { w: .12, h: .04, x: (BENCH.x0 + BENCH.x1) / 2, y: G + .014, z: BENCH.z, col: P.bench, trans: .04, ppm: 4400, finish: { rim: .55, rimPx: 4, under: .35 }, draw: c => {
      c.translate(-(BENCH.x0 + BENCH.x1) / 2, -(G + .014));
      c.fillRect(BENCH.x0 - .004, BENCH.top - .006, BENCH.x1 - BENCH.x0 + .008, .006);
      for (const lx of [BENCH.x0 + .004, BENCH.x1 - .009]) c.fillRect(lx, G - .004, .005, BENCH.top - G - .002);
      c.fillRect(BENCH.x0 + .004, G + .007, BENCH.x1 - BENCH.x0 - .008, .003);
      c.fillRect(BENCH.x1 - .03, BENCH.top, .024, .004);   // a plank lying on the bench
    } }), 'bench', 1);
    add(lay(S, { w: .04, h: .02, x: -.022, y: G + .007, z: -.108, col: P.bench, trans: .04, ppm: 4400, finish: { rim: .45, under: .3 }, draw: c => {
      c.translate(.022, -(G + .007)); c.fillRect(-.036, G + .011, .028, .004); c.fillRect(-.034, G - .003, .004, .015); c.fillRect(-.014, G - .003, .004, .015);
    } }), 'bench', 1);   // the stool
  } else {
    benchM = add(lay(S, { w: .08, h: .01, x: -.03, y: G + .001, z: -.108, col: P.bench, trans: .05, ppm: 4400, finish: { rim: .4 }, draw: c => { c.fillRect(-.035, -.002, .07, .004); } }), 'bench', 1);   // the mat
  }
  const frontM = add(ground(S, -.045, P.front, G - .015, .003, .14, .4, .02, { w: 1.2, peak: 2, rim: .2 }), 'front', 0);
  // the oil lamp: a small clay lamp, its flame, a warm pool and a real point light
  const lp = kind === 'shop' ? LAMP : [.005, G + .003, -.1];
  add(lay(S, { w: .014, h: .008, x: lp[0], y: lp[1] + .0025, z: lp[2], col: P.lampb, trans: .03, shadow: false, ppm: 6000, finish: { rim: .5 }, draw: c => {
    c.beginPath(); c.moveTo(-.006, .0005); c.quadraticCurveTo(-.005, -.003, 0, -.003); c.quadraticCurveTo(.005, -.003, .0065, .001); c.lineTo(.004, .0015); c.quadraticCurveTo(0, .002, -.006, .0005); c.fill();
  } }), 'lampb', 1);
  const fl = c => { c.beginPath(); c.moveTo(0, .0042); c.quadraticCurveTo(.0022, -.0008, .0011, -.0032); c.quadraticCurveTo(0, -.0042, -.0011, -.0032); c.quadraticCurveTo(-.0022, -.0008, 0, .0042); c.fill(); };
  const flame = lay(S, { w: .006, h: .009, x: lp[0] + .004, y: lp[1] + .0075, z: lp[2] + .0003, col: '#3a1a08', trans: 0, shadow: false, recv: false, finish: { rim: 0, under: 0, grain: false }, draw: fl, glowDraw: c => { c.fillStyle = '#fff'; fl(c); }, glow: 4, glowCol: '#ffb862', glowRes: .8 });
  const pool = glow(.09, .08, '#ffb862', 1.7); pool.position.set(lp[0] + .004, lp[1] + .012, lp[2] - .002); S.add(pool);
  const pl = new THREE.PointLight('#ffb070', 0, 0, 2); pl.position.set(lp[0] + .004, lp[1] + .02, lp[2] + .01); S.scene.add(pl);
  const winGlow = glow(.07, .06, '#ffb862', 1.6); winGlow.position.set(WIN.x, WIN.y, BZ - .01); S.add(winGlow);
  return {
    sky, outM, wallM, toolsM, floorM, benchM, frontM, flame, pool, pl, winGlow, L,
    // paint(pA, pB, p, k[6]): colour of each layer between two palettes, k = brightness per group (0 front … 5 outside)
    paint(pA, pB, p = 0, k = [1, 1, 1, 1, 1, 1]) { for (const [m, key, gi] of L) tint(m, mixc(pA[key], pB[key], p), lerp(.03, 1, k[gi] ?? 1)); sky.material.color.setScalar(lerp(.05, 1, k[5] ?? 1)); },
    // lamp(v, t): the flame (0 out … 1), flickering
    lamp(v, t) { const f = v * (.88 + .12 * Math.sin(t * 23) * Math.sin(t * 7.3)); flame.material.userData.u.uGlowLit.value = f; flame.visible = v > .01; flame.scale.setScalar(lerp(.35, 1, clamp(v))); pool.userData.set(.55 * f); pl.intensity = .011 * f; },
    // windows of the far houses (v, colour)
    wins(v, c) { outM.material.userData.u.uGlowLit.value = v; if (c) outM.material.emissive.set(c); },
  };
}

// —— Nazaret at night from outside: the hillside of flat-roofed houses, the workshop's front (door + window, a warm room behind),
// María's house across a dark alley (her window, her silhouette inside), a low wall between, the ground. ——
export const SHOP = { x: .01, w: .12, h: .085, z: -.12, door: [.03, .03, .056], win: [-.03, G + .05, .022, .02] };
export const MARIA = { x: -.17, win: [-.17, G + .045, .026, .03] };
export function village(S, o = {}) {
  const sky = skyPanel({ w: 4, h: 2.8, y: .3, z: -.95, stops: [[0, '#04081a'], [.3, '#0a1330'], [.48, '#16234a'], [.56, '#22325c'], [1, '#070c1c']], stars: 300, starMinY: -.05, seed: 9 }); S.add(sky);
  const houses = (z, col, n, x0, x1, yb, amp, sc, seed, tr, lit) => {
    const Q = mulberry(seed), hs = [];
    for (let i = 0; i < n; i++) { const bx = lerp(x0, x1, (i + Q() * .6) / n), bw = sc * (.025 + Q() * .02), bh = sc * (.02 + Q() * .028), by = yb + amp * Math.sin(bx * 7 + seed); hs.push([bx, bw, bh, by, Q()]); }
    return lay(S, { w: x1 - x0 + .2, h: .5, x: (x0 + x1) / 2, y: yb - .1, z, col, trans: tr, ppm: Math.min(2400, 3000 / (x1 - x0 + .2)), finish: { rim: .4, rimCol: 'rgba(200,210,255,.4)' }, draw: c => {
      c.translate(-(x0 + x1) / 2, -(yb - .1));
      c.beginPath(); c.moveTo(x0 - .1, yb - .35); for (let u = x0 - .1; u <= x1 + .1; u += .004) c.lineTo(u, yb + amp * Math.sin(u * 7 + seed) - .004 + .004 * Math.sin(u * 37)); c.lineTo(x1 + .1, yb - .35); c.closePath(); c.fill();
      for (const [bx, bw, bh, by] of hs) { c.fillRect(bx - bw / 2, by - .01, bw, bh + .01); c.fillRect(bx - bw / 2 - .001, by + bh, bw + .002, .0015 * sc); }
    }, glowDraw: lit ? c => { c.translate(-(x0 + x1) / 2, -(yb - .1)); c.fillStyle = '#fff'; for (const [bx, bw, bh, by, r] of hs) if (r < lit) c.fillRect(bx - bw * .1, by + bh * .3, bw * .16, bh * .22); } : undefined, glow: 2, glowCol: '#ffb862', glowRes: .5 });
  };
  const far = houses(-.44, '#4b5f8f', 34, -.5, .5, G + .07, .03, 1.4, 3, .45, .12);
  const mid = houses(-.3, '#2b3a63', 22, -.42, .42, G + .025, .014, 1.2, 7, .2, .1);
  const gr = ground(S, -.16, '#1a2444', G + .002, .001, .2, 2.2, .06, { rim: .3, w: 1.2 });
  // the workshop front (a transparent material, so in the climax it can become translucent and show the room inside)
  const [dx, dw, dh] = SHOP.door, [wx, wy, ww, wh] = SHOP.win;
  const room = lay(S, { w: SHOP.w * .96, h: SHOP.h * .96, x: SHOP.x, y: G + SHOP.h * .48, z: SHOP.z - .03, col: '#2a1608', trans: .1, shadow: false, recv: false, ppm: 3000, finish: { rim: 0, under: 0 },
    draw: c => c.fillRect(-SHOP.w * .48, -SHOP.h * .48, SHOP.w * .96, SHOP.h * .96), glowDraw: c => { c.fillStyle = '#fff'; c.fillRect(-SHOP.w * .48, -SHOP.h * .48, SHOP.w * .96, SHOP.h * .96); }, glow: 1.6, glowCol: '#ffb862', glowRes: .3 });
  const front = lay(S, { w: SHOP.w + .012, h: SHOP.h + .016, x: SHOP.x, y: G + SHOP.h / 2, z: SHOP.z, col: '#1e2a4e', trans: .06, ppm: 4000, finish: { rim: .55, rimPx: 4, rimCol: 'rgba(200,214,255,.5)', under: .35 }, draw: c => {
    c.translate(-SHOP.x, -(G + SHOP.h / 2));
    c.fillRect(SHOP.x - SHOP.w / 2, G - .004, SHOP.w, SHOP.h + .004); c.fillRect(SHOP.x - SHOP.w / 2 - .003, G + SHOP.h, SHOP.w + .006, .004);
    for (let u = SHOP.x - SHOP.w / 2; u < SHOP.x + SHOP.w / 2; u += .011) c.fillRect(u, G + SHOP.h + .004, .005, .003);
    cut(c, () => { c.fillRect(dx - dw / 2, G - .004, dw, dh + .004); c.fillRect(wx - ww / 2, wy - wh / 2, ww, wh); });
  } });
  front.material.transparent = true; front.material.opacity = 1;
  // María's house across the alley: her window, warm, with her silhouette inside
  const [mx, my, mw, mh] = MARIA.win;
  const mroom = lay(S, { w: .05, h: .05, x: mx, y: my, z: -.135, col: '#2a1608', trans: .1, shadow: false, recv: false, ppm: 3000, finish: { rim: 0, under: 0 },
    draw: c => c.fillRect(-.025, -.025, .05, .05), glowDraw: c => { c.fillStyle = '#fff'; c.fillRect(-.025, -.025, .05, .05); }, glow: 1.6, glowCol: '#ffb862', glowRes: .3 });
  const M = human(S.U, { h: .07, z: -.13, pose: 'veiled', col: '#05070f', rim: .5 }); S.scene.add(M.g); M.set({ x: mx + .004, y: G + .004, a: .1 });
  const mfront = lay(S, { w: .14, h: .1, x: mx, y: G + .04, z: -.125, col: '#1a2546', trans: .06, ppm: 4000, finish: { rim: .55, rimPx: 4, rimCol: 'rgba(200,214,255,.5)', under: .35 }, draw: c => {
    c.translate(-mx, -(G + .04)); c.fillRect(mx - .065, G - .004, .13, .082); c.fillRect(mx - .068, G + .078, .136, .004);
    cut(c, () => c.fillRect(mx - mw / 2, my - mh / 2, mw, mh));
  } });
  // the low wall of the alley where Clawd sits, the step of the workshop door
  const lowWall = lay(S, { w: .06, h: .02, x: -.088, y: G + .005, z: -.1, col: '#121a32', trans: .04, ppm: 4400, finish: { rim: .5, rimCol: 'rgba(200,214,255,.45)', under: .3 }, draw: c => { c.beginPath(); c.moveTo(-.03, -.01); c.lineTo(-.03, .006); c.quadraticCurveTo(0, .008, .03, .0055); c.lineTo(.03, -.01); c.closePath(); c.fill(); } });
  const step = lay(S, { w: .045, h: .008, x: SHOP.door[0], y: G + .001, z: SHOP.z + .004, col: '#121a32', trans: .04, ppm: 4400, finish: { rim: .5 }, draw: c => c.fillRect(-.02, -.003, .04, .005) });
  const fr = ground(S, -.06, '#070b18', G - .014, .004, .14, .4, .02, { w: 1.4, peak: 2, rim: .22 });
  const doorGlow = glow(.07, .07, '#ffb862', 1.7); doorGlow.position.set(dx, G + .03, SHOP.z - .005); S.add(doorGlow);
  const L = [[far, '#4b5f8f', 4], [mid, '#2b3a63', 3], [gr, '#1a2444', 2], [front, '#1e2a4e', 1], [mfront, '#1a2546', 1], [lowWall, '#121a32', 1], [step, '#121a32', 1], [fr, '#070b18', 0]];
  const WARM = { '#4b5f8f': '#ffe3a6', '#2b3a63': '#e2b675', '#1a2444': '#8c6338', '#1e2a4e': '#a8743c', '#1a2546': '#8c6338', '#121a32': '#5a3a1c', '#070b18': '#1d1209' };
  return { sky, far, mid, gr, front, room, mroom, M, fr, doorGlow, L,
    // warmth per group (0 front … 4 far), brightness per group
    paint(p = [0, 0, 0, 0, 0], k = [1, 1, 1, 1, 1]) { for (const [m, c, gi] of L) tint(m, mixc(c, WARM[c], p[gi] ?? 0), lerp(.04, 1, k[gi] ?? 1) * (1 + (p[gi] ?? 0) * .15)); },
    light(v, mv = v) { room.material.userData.u.uGlowLit.value = v; mroom.material.userData.u.uGlowLit.value = mv; doorGlow.userData.set(.35 * v); },
    wins(v) { far.material.userData.u.uGlowLit.value = v; mid.material.userData.u.uGlowLit.value = v; },
  };
}

// —— the roads: night (the flight to Egypt, toward the left) and cold dawn (the way back, toward the right) ——
const ROADP = {
  night: { stops: [[0, '#06061a'], [.4, '#141230'], [.55, '#262250'], [1, '#08071a']], far: '#55507a', mid: '#2f2b4b', path: '#1c1930', front: '#0a0912', rim: 'rgba(214,210,255,.5)' },
  dawn: { stops: [[0, '#2a2444'], [.35, '#3a3354'], [.47, '#8a6a7a'], [.53, '#f0c890'], [.58, '#c89a86'], [1, '#2a2030']], far: '#a08aa8', mid: '#5e4d6e', path: '#3a2c44', front: '#1a1220', rim: 'rgba(255,225,190,.55)' },
};
function road(S, kind, o = {}) {
  const P = ROADP[kind];
  const sky = skyPanel({ w: 3, h: 1.6, y: .15, z: -.6, stops: P.stops, stars: kind === 'night' ? 260 : 40, starMinY: .05, seed: 12 }); S.add(sky);
  const far = ground(S, -.42, P.far, G + .07, .03, .5, 1.1, .45, { w: 2.4, rim: .45, rimCol: P.rim, peak: 1.2 });
  const mid = ground(S, -.26, P.mid, G + .03, .016, .26, 2.7, .2, { w: 2, rim: .45, rimCol: P.rim });
  const path = ground(S, -.13, P.path, G + .002, .001, .2, .7, .06, { w: 1.8, rim: .35, rimCol: P.rim });
  if (o.trees) [-.34, -.21, -.12, .02, .13, .27].forEach((x, i) => { const m = olive(S.U, { h: .07 + (i % 3) * .015, z: -.255 - i * .0004, col: P.mid, trans: .2, seed: 40 + i, lean: i % 2 ? .25 : -.2 }); m.position.x = x; m.position.y += G + .03 + .016 * Math.sin(x / .26 * 6.283 + 2.7) - .004; S.add(m); });
  // stones and dry bushes in the front layer
  const Q = mulberry(kind === 'night' ? 3 : 8), bush = [];
  for (let i = 0; i < 26; i++) bush.push([-.8 + i * .065 + (Q() - .5) * .03, .006 + Q() * .012, Q()]);
  const front = lay(S, { w: 1.8, h: .4, y: G - .2, z: -.05, col: P.front, trans: .02, ppm: 1400, finish: { rim: .25, rimCol: P.rim }, draw: c => {
    c.translate(0, -(G - .2)); waveFill(c, { x0: -.9, x1: .9, base: G - .016, amp: .004, len: .14, ph: .4, peak: 2 });
    for (const [bx, bh, r] of bush) { if (r < .5) { c.beginPath(); c.ellipse(bx, G - .012, bh * 1.4, bh, 0, 0, TAU); c.fill(); } else { c.lineWidth = .0012; for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(bx, G - .014); c.lineTo(bx + k * bh * .35, G - .014 + bh * 1.6 * (1 - Math.abs(k) * .12)); c.stroke(); } } }
  } });
  return { sky, far, mid, path, front };
}

// the paper title strip (only at the start), held in front of the camera
function titleStrip(S, T) {
  const W = .13, Hh = .05;
  const m = lay(S, { w: W, h: Hh, y: .088, z: -.03, col: '#e7d4a8', trans: .35, shadow: false, recv: false, ppm: 9000, finish: { rim: .3, under: .2 }, draw: x => {
    x.beginPath(); x.roundRect(-W / 2 + .001, -Hh / 2 + .001, W - .002, Hh - .002, .002); x.fill();
    cut(x, () => {
      text(x, 'CUATRO SUEÑOS', 0, .0062, .0118, 'Cinzel', { weight: 800, fill: '#000' });
      text(x, 'Mateo 1–2', 0, -.0122, .0092, 'Playfair', { weight: 'italic 500', fill: '#000' });
    });
  }, glowDraw: x => { x.fillStyle = '#fff'; x.fillRect(-W / 2, -Hh / 2, W, Hh); }, glow: .5, glowCol: '#e7d4a8', glowRes: .2 });
  m.material.userData.u.uClip.value.set(0, .088, 0, 0);
  return (t, S) => {
    const reveal = ss(seg(t, T.in, T.in + .55)) * (1 - ss(seg(t, T.out - .4, T.out)));
    const cz = S.cam.position.z + .03, ts = cz / .55; m.scale.setScalar(ts); m.position.x = S.cam.position.x; m.position.y = S.cam.position.y + .4617 * cz / 2 * .66;
    m.material.userData.u.uClip.value.set(m.position.x, m.position.y, .09 * reveal * ts, 0); m.visible = reveal > .002;
  };
}

const NIGHT_IN = { light: [WIN.x, WIN.y, BZ], lightR: .06, lightCol: '#8fa4e0', key: 1.25, keyCol: '#aebcf0', amb: .42, ambCol: '#5a6aa8', floor: .25 };
const JX = -.014, JY = G + .014, JZ = -.11;   // José on the stool
const CB = [.064, BENCH.top + .0005, -.071];  // Clawd on the bench
const coldGrade = (o = {}) => ({ vig: .5, sat: .95, lift: [0, .004, .02], gain: [1.0, 1, 1.0], ...o });

// S1 the workshop at night. José seated on the stool, head low; the lamp on the bench; Clawd on the bench taps four times on «Cuatro sueños». Title. Push-in.
export function S1(E) {
  const { H } = E;
  const S = stage(NIGHT_IN);
  const W = room(S); W.paint(PAL.night, PAL.night, 0); W.wins(.5);
  const J = human(S.U, { h: .086, z: JZ, pose: 'sit', col: '#05070f', rim: .5 }); S.scene.add(J.g);
  const C = clawd(S.U, { u: .0023, z: CB[2], glow: .45 }); S.scene.add(C.g);
  const title = titleStrip(S, { in: .25, out: H.title_out });
  const T4 = countAt(H.tap1, 4);
  return { S, update(t) {
    const k = eio(seg(t, 0, E.T0 + E.dur + .6)), d = lerp(.64, .58, k), cx = .02, cy = camY(G, .68, d);
    aim(S.cam, [cx, cy, -.09 + d, cx, cy, -.09], t, { hand: .0003 });
    W.lamp(1, t);
    J.set({ x: JX, y: JY, rot: -.14, a: .5 });
    const hold = ss(seg(t, H.tap1 - .3, H.tap1)) * (1 - ss(seg(t, 2.2, 2.7)));
    C.set({ x: CB[0], y: CB[1], aR: taps(t, T4), aL: .6 * hold, look: -.7, blink: slowBlink(t, 4.4, 2.1), k: .85 });
    title(t, S);
    this._f = fsOf(S, -.1);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(.36, 1.0) }; }, grade() { return coldGrade(); } };
}

// S2 «ni una palabra»: medium shot. Rack focus from Clawd (in front, soft, at the right edge) to José, who lifts his head toward the window. The lamp trembles.
export function S2(E) {
  const { H } = E;
  const S = stage(NIGHT_IN);
  const W = room(S); W.paint(PAL.night, PAL.night, 0); W.wins(.5);
  const J = human(S.U, { h: .086, z: JZ, pose: 'sit', col: '#05070f', rim: .5 }); S.scene.add(J.g);
  const C = clawd(S.U, { u: .0023, z: CB[2], glow: .45 }); S.scene.add(C.g);
  const title = titleStrip(S, { in: .25, out: H.title_out });
  return { S, update(t) {
    const k = eio(seg(t, E.T0 - .6, E.T0 + E.dur + .3)), d = lerp(.48, .45, k), cx = lerp(.016, .012, k), cy = camY(G, .7, d) + .006;
    aim(S.cam, [cx, cy, -.09 + d, cx, cy, -.09], t, { hand: .0003 });
    W.lamp(1 + .25 * Math.sin(t * 5.1) * ss(seg(t, H.l02, H.l02 + .5)), t);
    const up = eio(seg(t, H.l02 + .4, H.l02 + 1.5));
    J.set({ x: JX, y: JY, rot: lerp(-.14, .06, up), a: .5 });
    C.set({ x: CB[0], y: CB[1], look: lerp(-.7, -1, up), blink: slowBlink(t, 4.4, 2.1), k: .85 });
    title(t, S);
    this._f = lerp(fsOf(S, CB[2]), fsOf(S, JZ), ss(seg(t, E.T0 + .2, H.l02 + 1.2)));
  }, post() { return { focus: this._f, aper: 11, maxCoc: 9, bloom: blo(.36, 1.0) }; }, grade() { return coldGrade(); } };
}

// S3 Nazaret: the camera pulls back out of the workshop door and shows the village on the hillside at night; one lit window (the workshop).
// Clawd, small, seated on the threshold, back to the village, looking in.
export function S3(E) {
  const S = stage({ light: [0, G + .12, -.5], lightR: .3, lightCol: '#8fa4e0', key: 1.0, keyCol: '#aebcf0', amb: .34, ambCol: '#5a6aa8', floor: .3 });
  const V = village(S); V.paint(); V.light(1, 0); V.wins(.25);
  const J = human(S.U, { h: .06, z: SHOP.z - .02, pose: 'sit', col: '#05070f', rim: .3 }); S.scene.add(J.g); J.set({ x: SHOP.door[0] - .004, y: G + .004, rot: .04, a: .5 });
  const C = clawd(S.U, { u: .0019, z: SHOP.z + .006, glow: .35 }); S.scene.add(C.g); backTo(C, true);
  return { S, update(t) {
    const k = eio(seg(t, E.T0 - .3, E.T0 + E.dur + .5)), d = lerp(.3, .66, k), cx = lerp(.03, .0, k), cy = camY(G, lerp(.66, .7, k), d);
    aim(S.cam, [cx, cy, SHOP.z + d, cx, cy, SHOP.z], t, { hand: .0003 });
    C.set({ x: SHOP.door[0] + .002, y: G + .003, k: .6 });
    this._f = fsOf(S, SHOP.z);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(.36, 1.0) }; }, grade() { return coldGrade(); } };
}

// S4 two windows: lateral move from the workshop window to María's lit window across the dark alley; between them, darkness. Clawd on the low wall looks from one to the other.
export function S4(E) {
  const { H } = E;
  const S = stage({ light: [0, G + .12, -.5], lightR: .3, lightCol: '#8fa4e0', key: 1.0, keyCol: '#aebcf0', amb: .34, ambCol: '#5a6aa8', floor: .3 });
  const V = village(S); V.paint(); V.wins(.25);
  const J = human(S.U, { h: .06, z: SHOP.z - .02, pose: 'sit', col: '#05070f', rim: .3 }); S.scene.add(J.g); J.set({ x: SHOP.win[0] + .002, y: G + .012, rot: -.1, a: .5 });
  const C = clawd(S.U, { u: .0018, z: -.098, glow: .4 }); S.scene.add(C.g);
  return { S, update(t) {
    const k = eio(seg(t, E.T0 - .3, E.T0 + E.dur + .5)), d = .5, cx = lerp(-.01, -.15, k), cy = camY(G, .66, d);
    aim(S.cam, [cx, cy, -.12 + d, cx, cy, -.12], t, { hand: .0003 });
    V.light(.8, ss(seg(t, H.l04 + .2, H.l04 + .8)) * .9 + .1);
    C.set({ x: -.09, y: G + .0115, look: lerp(1, -1, ss(seg(t, H.l04 + .3, H.l04b + .8))), blink: slowBlink(t, 4.2, .7), k: .8 });
    this._f = fsOf(S, -.12);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(.36, 1.0) }; }, grade() { return coldGrade(); } };
}

// S5 the decision: inside, a tilt from the window (the far lit windows behind it) down to José, head low again; the flame shrinks.
// Silence 1: the lamp goes out, layer by layer, front to back, until only the room tone is left; José asleep, sitting, only an edge.
export function S5(E) {
  const { H } = E;
  const S = stage(NIGHT_IN);
  const W = room(S); W.wins(.6);
  const J = human(S.U, { h: .086, z: JZ, pose: 'sit', col: '#05070f', rim: .5 }); S.scene.add(J.g);
  const Jd = human(S.U, { h: .086, z: JZ, pose: 'doze', col: '#05070f', rim: .5 }); S.scene.add(Jd.g);
  const C = clawd(S.U, { u: .0023, z: CB[2], glow: .45 }); S.scene.add(C.g);
  const ember = lay(S, { w: .003, h: .003, x: LAMP[0] + .004, y: LAMP[1] + .0045, z: LAMP[2] + .0004, col: '#1a0c04', trans: 0, shadow: false, recv: false, finish: { rim: 0, under: 0 }, draw: c => { c.beginPath(); c.arc(0, 0, .0008, 0, TAU); c.fill(); }, glowDraw: c => { c.fillStyle = '#fff'; c.beginPath(); c.arc(0, 0, .0009, 0, TAU); c.fill(); }, glow: 4, glowCol: '#ff7a2a' });
  return { S, update(t) {
    const tilt = eio(seg(t, E.T0, H.l05b + .6)), d = .5, cx = lerp(.04, .022, tilt), cy = camY(G, .68, d);
    aim(S.cam, [cx, cy + lerp(.03, 0, tilt), -.09 + d, cx, cy + lerp(.085, 0, tilt), -.09], t, { hand: lerp(.0003, .00005, ss(seg(t, H.silencio1, H.silencio1 + .5))) });
    const S1t = H.silencio1, out = i => ss(seg(t, S1t - .05 + i * .16, S1t + .45 + i * .16));
    const fo = [0, 1, 2, 3, 4, 5].map(out);
    W.paint(PAL.night, PAL.night, 0, fo.map(v => 1 - .93 * v));
    W.wins(.6 * (1 - fo[5]));
    S.key.intensity = .9 * (1 - .95 * fo[3]); S.amb.intensity = .3 * (1 - .9 * fo[4]); setL(S, WIN.x, WIN.y, .05, 1 - .97 * fo[5]);
    const small = lerp(1, .55, ss(seg(t, H.l05, S1t)));
    W.lamp(small * (1 - ss(seg(t, S1t - .15, S1t + .05))), t);
    ember.material.userData.u.uGlowLit.value = ss(seg(t, S1t - .1, S1t + .1)) * (.5 + .1 * Math.sin(t * 4)); ember.visible = t > S1t - .1;
    const asleep = t > S1t + .5;
    J.g.visible = !asleep; Jd.g.visible = asleep;
    J.set({ x: JX, y: JY, rot: lerp(.06, -.14, ss(seg(t, H.l05b, H.l05b + .8))), a: .5 }); Jd.set({ x: JX, y: JY, rot: .1, a: .3 });
    C.set({ x: CB[0], y: CB[1], look: -.8, blink: t > S1t ? 1 : slowBlink(t, 4.4, 2.1), k: lerp(.8, .08, fo[1]) });
    this._f = lerp(fsOf(S, BZ), fsOf(S, JZ), tilt); this._o = fo[5];
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(.38, .95) }; }, grade() { return coldGrade({ vig: lerp(.5, .7, this._o) }); } };
}

// S6 first dream: the dark workshop. A veil comes down from above in front of the sleeping José; a light is born behind it and burns one round hole
// on «no temas»; the fibre around it glows. On «María», a short push-in toward the hole. Clawd at the foot of the bench taps once on «Primer» and holds his arm up.
export function S6(E) {
  const { H } = E;
  const S = stage({ ...NIGHT_IN, lightR: .03, lightCol: '#ffe6a8', key: .35, amb: .1 });
  const W = room(S); W.paint(PAL.night, PAL.dark, .85, [.25, .25, .25, .25, .25, .2]); W.wins(.05); W.lamp(0, 0);
  const Jd = human(S.U, { h: .086, z: JZ, pose: 'doze', col: '#05070f', rim: .5, edge: '#ffd27a' }); S.scene.add(Jd.g);
  const V = veil(S, { x: JX + .01, yDown: G + .052, z: JZ - .014, w: .062, h: .086, hx: .002, hy: .026, R: .0095, op: .82 });
  const C = clawd(S.U, { u: .0021, z: -.066, glow: .45 }); S.scene.add(C.g);
  const A = H.primer + .1, B = H.notemas;
  return { S, update(t) {
    const pin = eio(seg(t, H.l06b + 1.2, H.l06b + 2.2)), d = lerp(.5, .45, pin), cx = lerp(.006, .0, pin), cy = camY(G, .69, d) + lerp(0, .01, pin);
    aim(S.cam, [cx, cy, -.09 + d, cx, cy + .002, -.09], t, { hand: .0002 });
    const v = veilAt(V, t, A, B, 99, { fall: .9, burnT: .55 });
    setL(S, V.hole[0], V.hole[1], lerp(.012, .045, v.burn), v.k * 1.6, '#ffe6a8');
    Jd.set({ x: JX, y: JY, rot: .1, a: .3 }); Jd.lit(.9 * v.burn);
    S.key.intensity = .35 + .4 * v.burn; S.amb.intensity = .1 + .08 * v.burn;
    const hold = ss(seg(t, A - .3, A));
    C.set({ x: .04, y: G - .001, aR: taps(t, [H.primer + .05]), aL: .6 * hold, look: -.6, blink: slowBlink(t, 4.4, .6), k: .6 + .25 * v.k });
    this._f = fsOf(S, -.1); this._b = v.burn;
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(lerp(.38, .5, this._b), lerp(1.0, .9, this._b)) }; }, grade() { return coldGrade({ vig: .62, lift: [lerp(0, .01, this._b), .004, lerp(.02, .01, this._b)] }); } };
}

// S7 he wakes: the veil goes up and stays hanging high. José stands up (a sink, the rise, he settles) and goes to the door; outside, the far windows
// take the same warm light. The first warm light of the film. Crane down and out, medium to full. Clawd on the bench watches him go.
export function S7(E) {
  const { H } = E;
  const S = stage({ ...NIGHT_IN, lightR: .04, lightCol: '#ffe6a8', key: .6, amb: .18 });
  const W = room(S); W.lamp(0, 0);
  const Jd = human(S.U, { h: .086, z: JZ, pose: 'doze', col: '#05070f', rim: .5 }); S.scene.add(Jd.g);
  const J = human(S.U, { h: .086, z: JZ, pose: 'stand', col: '#05070f', rim: .55, edge: '#ffd27a' }); S.scene.add(J.g);
  const V = veil(S, { x: JX + .01, yDown: G + .052, z: JZ - .014, w: .062, h: .086, hx: .002, hy: .026, R: .0095, op: .82, rise: .085 });
  const C = clawd(S.U, { u: .0023, z: CB[2], glow: .45 }); S.scene.add(C.g);
  const up = H.despierta + .35;
  return { S, update(t) {
    const k = eio(seg(t, E.T0 - .2, E.T0 + E.dur + .5)), d = lerp(.46, .6, k), cx = lerp(.004, .008, k), cy = camY(G, lerp(.72, .68, k), d) + lerp(.012, 0, k);
    aim(S.cam, [cx, cy, -.09 + d, cx, cy, -.09], t, { hand: .0003 });
    // the veil rises to its place high up and hangs there, its hole still faintly warm
    const r = eio(seg(t, E.T0, E.T0 + .9)); V.set(1 - r * .82, 1, lerp(.9, .25, r), .3 * r);
    setL(S, lerp(V.hole[0], WIN.x, r), lerp(V.hole[1], WIN.y, r), .05, lerp(1.4, .8, r), mixc('#ffe6a8', '#ffc77a', r));
    const warm = ss(seg(t, up + .6, up + 1.8));
    W.paint(PAL.night, PAL.night, 0, [lerp(.35, 1, warm), lerp(.35, 1, warm), lerp(.4, 1, warm), lerp(.4, 1, warm), lerp(.5, 1, warm), .6 + .4 * warm]);
    W.wins(lerp(.1, 1.1, warm), mixc('#ffb862', '#ffc77a', warm)); W.winGlow.userData.set(.3 * warm);
    S.key.intensity = lerp(.6, .9, warm); S.amb.intensity = lerp(.18, .3, warm);
    Jd.set({ x: JX, y: JY, rot: .1, a: .3 });
    const w = seg(t, up + .7, up + 2.1), x = lerp(JX + .012, DOOR.x + .002, eio(w)), walking = w > 0 && w < 1;
    J.set({ x, y: G + (walking ? Math.abs(Math.sin(t * 9)) * .0008 : 0), a: walking ? Math.sin(t * 9) * .3 : .12 });
    if (t > up + .6) flip(J);
    rise(Jd, J, t, up);
    J.g.position.z = lerp(JZ, BZ - .006, ss(seg(t, up + 1.9, up + 2.3))); J.lit(.6 * (1 - r) + .5 * warm, mixc('#ffd27a', '#ffc77a', warm));
    C.set({ x: CB[0], y: CB[1], look: lerp(-.6, -1, w), blink: slowBlink(t, 4, 1.4), k: .85 });
    this._f = fsOf(S, -.1); this._w = warm;
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(.38, 1.0) }; }, grade() { return coldGrade({ lift: [lerp(0, .008, this._w), .004, lerp(.02, .012, this._w)] }); } };
}

// S8 second dream, in a small house in Belén at night (not the workshop): the second veil comes down and burns, faster. María sleeps seated by the wall.
// Clawd at the door taps twice. At the end the frame fills with light (the dissolve into the road).
export function S8(E) {
  const { H } = E;
  const S = stage({ light: [.07, G + .03, BZ], lightR: .03, lightCol: '#ffe6a8', key: .7, keyCol: '#b8b0f0', amb: .24, ambCol: '#6a60a8', floor: .2 });
  const W = room(S, { kind: 'belen', pal: PAL.belen }); W.paint(PAL.belen, PAL.belen, 0, [.8, .8, .8, .8, .8, .7]); W.wins(.3); W.lamp(0, 0);
  const Jd = human(S.U, { h: .084, z: -.112, pose: 'doze', col: '#06050e', rim: .5, edge: '#ffd27a' }); S.scene.add(Jd.g);
  const M = human(S.U, { h: .078, z: -.118, pose: 'vsit', col: '#06050e', rim: .45 }); S.scene.add(M.g);
  const V = veil(S, { x: -.016, yDown: G + .05, z: -.124, w: .06, h: .084, hx: .002, hy: .025, R: .009, op: .82 });
  const C = clawd(S.U, { u: .0019, z: -.072, glow: .45 }); S.scene.add(C.g);
  const A = H.segundo - .05, B = H.segundo + .55;
  return { S, update(t) {
    const k = eio(seg(t, E.T0 - .3, E.T0 + E.dur + .4)), d = lerp(.52, .5, k), cx = .0, cy = camY(G, .69, d);
    aim(S.cam, [cx, cy, -.09 + d, cx, cy, -.09], t, { hand: .0003 });
    const v = veilAt(V, t, A, B, H.l08 + 1.5, { fall: .45, burnT: .35, up: .5 });
    setL(S, V.hole[0], V.hole[1], lerp(.012, .05, v.burn), .2 + v.k * 1.5, '#ffe6a8');
    Jd.set({ x: -.028, y: G + .001, rot: .12, a: .3 }); Jd.lit(.9 * v.burn * v.down);
    M.set({ x: -.07, y: G + .001, rot: -.06, a: .6 }); flip(M);
    const T2 = countAt(H.segundo, 2, .28), hold = ss(seg(t, H.segundo - .3, H.segundo));
    C.set({ x: .046, y: G - .0005, aR: taps(t, T2), aL: .6 * hold, look: -.7, blink: slowBlink(t, 4, .4), k: .7 + .2 * v.k });
    this._x = ss(seg(t, E.T0 + E.dur - .5, E.T0 + E.dur + .1));
    this._f = fsOf(S, -.105); this._b = v.burn * v.down;
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(.4 + .2 * this._b, 1.0 - .1 * this._b) }; }, grade() { return { vig: .55, sat: .95, expo: 1 + 1.2 * this._x, lift: [.004, .002, .02] }; } };
}

// S8b the flight: at night on the road, José walks ahead, María with the child in her arms behind him, toward the LEFT of the screen (the way out).
// Hills and moon. No donkey. Clawd follows far behind, walking. A tracking shot that goes with them; front layers fast, far ones slow.
export function S8b(E) {
  const S = stage({ light: [-.2, .1, -.6], lightR: .3, lightCol: '#cfd3ea', key: 1.0, keyCol: '#b8b4f0', amb: .32, ambCol: '#6a64b0', floor: .3 });
  road(S, 'night', { trees: true });
  const mo = moon({ r: .014, x: -.05, y: .115, z: -.55, gain: 1.5, core: '#f4f6ff', mid: '#e0e4f8', edge: '#c8ccee', halo: 7, haloGain: .3, haloCol: '#b0b4e8' }); S.scene.add(mo);
  const J = human(S.U, { h: .08, z: -.1, col: '#020206', rim: .55, edge: '#b8bce0' }); S.scene.add(J.g);
  const M = human(S.U, { h: .074, z: -.104, pose: 'carry', col: '#020206', rim: .55, edge: '#b8bce0' }); S.scene.add(M.g);
  const C = clawd(S.U, { u: .0018, z: -.09, glow: .4 }); S.scene.add(C.g);
  const T0 = E.T0, vx = -.03;
  return { S, update(t) {
    const p = t - T0, gx = .03 + vx * p;
    const d = .68, cx = gx + .016 + .004 * Math.sin(p * .8), cy = camY(G, .68, d);
    aim(S.cam, [cx, cy, -.1 + d, cx, cy, -.1], t, { hand: .0004 });
    const wk = (A, x, ph, sp = 8.5) => { A.set({ x, y: G + Math.abs(Math.sin(t * sp + ph)) * .0009, a: Math.sin(t * sp + ph) * .28 + .1 }); flip(A); };
    wk(J, gx - .022, 0); wk(M, gx + .014, 1.7); M.arm.rotation.z = -.9;
    J.lit(.28); M.lit(.28);
    C.set({ x: gx + .05, y: G - .0005, walk: t * 11, stride: .5, look: -.8, blink: slowBlink(t, 3.8, .5), k: .75 });
    setMoon(mo, 1);
    this._x = 1 - ss(seg(t, T0, T0 + .9)); this._f = fsOf(S, -.1);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(.36, 1.0) }; }, grade() { return { vig: .5, sat: .95, expo: 1 + 1.2 * this._x, lift: [.006, .002, .022] }; } };
}

// S9 Egypt, the third dream: another ladder of colour (palms, low roofs, a still river); José asleep under an eave with a lamp; the third veil comes down
// and burns almost at once. Rack focus from a palm in front to the veil. Clawd sits under the palm and taps three times, fast.
export function S9(E) {
  const { H } = E;
  const S = stage({ light: [.0, G + .05, -.12], lightR: .03, lightCol: '#ffe6a8', key: 1.0, keyCol: '#d8c0f0', amb: .32, ambCol: '#8a70b0', floor: .3 });
  const sky = skyPanel({ w: 2.4, h: 1.6, y: .15, z: -.6, stops: [[0, '#140c22'], [.4, '#2a1f3d'], [.52, '#4a3658'], [.58, '#3a2a4c'], [1, '#120c1a']], stars: 200, starMinY: .03, seed: 21 }); S.add(sky);
  for (let i = 0; i < 9; i++) { const m = palm(S.U, { h: .11 + (i % 3) * .02, z: -.34 - i * .0004, col: '#7a6a9a', trans: .5, lean: (i % 2 ? .18 : -.14), seed: 30 + i }); m.position.x = -.3 + i * .075; m.position.y += G + .03; S.add(m); }
  lay(S, { w: 1.2, h: .1, y: G + .01, z: -.3, col: '#7a6a9a', trans: .45, ppm: 2000, finish: { rim: .4 }, draw: c => { const Q = mulberry(4); c.translate(0, -(G + .01)); c.fillRect(-.6, G - .04, 1.2, .07); for (let u = -.5; u < .5; u += .03 + Q() * .02) c.fillRect(u, G + .02, .02 + Q() * .015, .008 + Q() * .014); } });
  // the still river: a pale flat strip with a drawn edge
  lay(S, { w: 1.2, h: .05, y: G + .008, z: -.22, col: '#8a7cb0', trans: .55, ppm: 2000, finish: { rim: .6, rimCol: 'rgba(240,230,255,.6)' }, draw: c => { c.translate(0, -(G + .008)); c.beginPath(); c.moveTo(-.6, G - .01); for (let u = -.6; u <= .6; u += .005) c.lineTo(u, G + .018 + .001 * Math.sin(u * 80)); c.lineTo(.6, G - .01); c.closePath(); c.fill(); } });
  ground(S, -.18, '#46385f', G + .005, .002, .2, 1.4, .2, { w: 1.4 });
  // the low house with the eave
  const hx = .015;
  lay(S, { w: .16, h: .1, x: hx, y: G + .04, z: -.135, col: '#46385f', trans: .2, ppm: 3400, finish: { rim: .5, under: .3 }, draw: c => { c.translate(-hx, -(G + .04)); c.fillRect(hx - .07, G - .004, .14, .068); cut(c, () => { c.beginPath(); c.moveTo(hx + .03, G - .004); c.lineTo(hx + .03, G + .03); c.arc(hx + .042, G + .03, .012, Math.PI, 0, true); c.lineTo(hx + .054, G - .004); c.fill(); }); } });
  lay(S, { w: .16, h: .07, x: hx - .01, y: G + .034, z: -.106, col: '#2a2040', trans: .06, ppm: 3600, finish: { rim: .55 }, draw: c => { c.translate(0, -.034); c.beginPath(); c.moveTo(-.075, .064); c.lineTo(.065, .064); c.lineTo(.07, .058); c.lineTo(-.08, .058); c.closePath(); c.fill(); c.fillRect(-.07, -.002, .003, .06); c.fillRect(.06, -.002, .003, .06); } });   // eave + posts
  ground(S, -.1, '#24193a', G + .001, .001, .2, 3.1, .05, { w: 1.4, rim: .3 });
  const lampP = glow(.06, .05, '#ffbe70', 1.7); lampP.position.set(hx + .045, G + .02, -.12); lampP.userData.set(.45); S.add(lampP);
  const pl = new THREE.PointLight('#ffb070', .0035, 0, 2); pl.position.set(hx + .045, G + .02, -.1); S.scene.add(pl);
  const Jd = human(S.U, { h: .08, z: -.112, pose: 'doze', col: '#0a0612', rim: .5, edge: '#ffd27a' }); S.scene.add(Jd.g);
  const V = veil(S, { x: hx - .002, yDown: G + .045, z: -.118, w: .056, h: .076, hx: .0, hy: .022, R: .0085, op: .82 });
  const fp = palm(S.U, { h: .13, z: -.052, col: '#120c1a', trans: .05, lean: .25, seed: 7, rim: .35 }); fp.position.x = -.07; fp.position.y += G - .014; S.add(fp);
  ground(S, -.045, '#120c1a', G - .015, .003, .12, .9, .02, { w: 1.4, peak: 2, rim: .2 });
  const C = clawd(S.U, { u: .002, z: -.056, glow: .45 }); S.scene.add(C.g);
  const A = H.tercero - .15, B = H.tercero + .32;
  return { S, update(t) {
    const k = eio(seg(t, E.T0 - .3, E.T0 + E.dur + .3)), d = lerp(.52, .49, k), cx = lerp(-.012, -.006, k), cy = camY(G, .69, d);
    aim(S.cam, [cx, cy, -.09 + d, cx, cy, -.09], t, { hand: .0003 });
    const v = veilAt(V, t, A, B, H.l10 + 1.25, { fall: .3, burnT: .25, up: .45, warm: .15 });
    setL(S, V.hole[0], V.hole[1], lerp(.012, .05, v.burn), .2 + v.k * 1.5, '#ffe6a8');
    Jd.set({ x: hx - .012, y: G + .001, rot: .1, a: .3 }); Jd.lit(.9 * v.burn * v.down);
    const T3 = countAt(H.tercero, 3, .2);
    C.set({ x: -.044, y: G - .0045, aR: taps(t, T3), aL: .6, look: .8, blink: slowBlink(t, 4, 1.1), k: .8 });
    this._f = lerp(fsOf(S, -.056), fsOf(S, -.1), ss(seg(t, E.T0 + .1, B))); this._b = v.burn * v.down;
  }, post() { return { focus: this._f, aper: 10, maxCoc: 8, bloom: blo(.38 + .15 * this._b, 1.0) }; }, grade() { return { vig: .5, sat: .97, lift: [.01, .003, .016] }; } };
}

// S10 the fourth dream and the way back: at a cold dawn by the road, the fourth veil comes down and burns; then the three walk toward the RIGHT
// of the screen (the way back, opposite to S8b); far off, the hillside of Nazaret appears. Clawd taps four times and lifts both arms: the count is full.
export function S10(E) {
  const { H } = E;
  const S = stage({ light: [.1, G + .04, -.6], lightR: .4, lightCol: '#ffd8a8', key: 1.2, keyCol: '#f0d0c8', amb: .4, ambCol: '#a088a8', floor: .35 });
  road(S, 'dawn');
  // Nazaret far off on the right: the flat-roofed houses on the hillside
  lay(S, { w: .5, h: .2, x: .32, y: G + .06, z: -.4, col: '#8a7498', trans: .4, ppm: 2000, finish: { rim: .45, rimCol: 'rgba(255,225,190,.5)' }, draw: c => {
    const Q = mulberry(14); c.translate(-.42, -(G + .06)); c.translate(.1, 0); c.beginPath(); c.moveTo(.17, G - .02); c.quadraticCurveTo(.35, G + .14, .67, G + .1); c.lineTo(.67, G - .02); c.closePath(); c.fill();
    for (let i = 0; i < 16; i++) { const bx = .26 + i * .024 + (Q() - .5) * .008, by = G + .04 + .07 * Math.sin((bx - .17) / .5 * 2.2), bw = .014 + Q() * .01; c.fillRect(bx, by - .01, bw, .012 + Q() * .012); }
  } });
  lay(S, { w: .05, h: .03, x: -.05, y: G + .004, z: -.104, col: '#2a2034', trans: .04, ppm: 4000, finish: { rim: .5, rimCol: 'rgba(255,225,190,.5)' }, draw: c => { c.beginPath(); c.moveTo(-.024, -.012); c.quadraticCurveTo(-.022, .01, -.006, .012); c.quadraticCurveTo(.014, .014, .022, -.012); c.closePath(); c.fill(); } });   // the rock he sleeps against
  const Jd = human(S.U, { h: .08, z: -.1, pose: 'doze', col: '#120a14', rim: .6, edge: '#ffd27a' }); S.scene.add(Jd.g);
  const J = human(S.U, { h: .08, z: -.1, col: '#120a14', rim: .6, edge: '#ffd27a' }); S.scene.add(J.g);
  const M = human(S.U, { h: .074, z: -.106, pose: 'carry', col: '#120a14', rim: .6 }); S.scene.add(M.g);
  const V = veil(S, { x: -.04, yDown: G + .045, z: -.112, w: .056, h: .076, hx: .002, hy: .022, R: .0085, op: .82 });
  const C = clawd(S.U, { u: .0018, z: -.088, glow: .4 }); S.scene.add(C.g);
  const A = H.cuarto - .1, B = H.cuarto + .3, go = H.l11b + .05, vx = .036;
  return { S, update(t) {
    const p = Math.max(0, t - go - .4), gx = vx * p * ss(clamp(p / .6 + .3));
    const d = .56, cx = -.022 + gx * 1.05, cy = camY(G, .68, d);
    aim(S.cam, [cx, cy, -.1 + d, cx, cy, -.1], t, { hand: .0004 });
    const v = veilAt(V, t, A, B, H.cuarto + .9, { fall: .3, burnT: .25, up: .45, warm: .3 });
    const q = ss(seg(t, H.cuarto + .9, H.cuarto + 1.5));
    setL(S, lerp(V.hole[0], .1, q), lerp(V.hole[1], G + .04, q), lerp(.05, .4, q), .3 + v.k * 1.4, mixc('#ffe6a8', '#ffd8a8', q));
    Jd.set({ x: -.052, y: G + .006, rot: .12, a: .3 }); Jd.lit(.9 * v.burn * v.down);
    const walk = t > go + .4, wk = (A_, x, ph, sp = 8.5) => A_.set({ x, y: G + (walk ? Math.abs(Math.sin(t * sp + ph)) * .0009 : 0), a: walk ? Math.sin(t * sp + ph) * .28 + .1 : .1 });
    wk(J, -.046 + .008 * ss(seg(t, go + .3, go + .7)) + gx, 0); rise(Jd, J, t, go - .1); J.lit(.45);
    wk(M, -.018 + gx * .98, 1.7); M.arm.rotation.z = -.9;
    const T4 = countAt(H.cuarto, 4, .17), both = ss(seg(t, H.cuarto + .75, H.cuarto + 1.1));
    C.set({ x: -.07 + gx * 1.05, y: G - .0005, aR: lerp(taps(t, T4), .8, both), aL: lerp(.6, .8, both), walk: walk ? t * 11 : 0, stride: walk ? .5 : 0, look: .8, blink: slowBlink(t, 3.6, .2), k: .8 });
    this._f = fsOf(S, -.1); this._b = v.burn * v.down;
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(.36 + .15 * this._b, 1.0) }; }, grade() { return { vig: .42, sat: 1.0, lift: [.012, .004, .012], gain: [1.03, 1, .96] }; } };
}

// —— the four veils over the workshop, for silence 2 and the climax. Their holes lie on the line from the light (far behind) to the camera's final place,
// so they line up only from there: xi = xL + (xC − xL)·(zi − zL)/(zC − zL), the same for y. ——
const VZ = [-.16, -.26, -.4, -.58], ZL = -.72;
export const CAM_END = { d: .62, cx: 0, f: .7 };
export function veils4(S, cam = CAM_END) {
  const zC = SHOP.z + cam.d, yC = camY(G, cam.f, cam.d);
  // the light: high enough that the holes stand above the workshop roof (at `rel` of the frame's half-height above the centre)
  const f0 = (VZ[0] - ZL) / (zC - ZL), hv = (cam.rel ?? .45) * .4617 * (zC - VZ[0]) / 2, yL = yC + hv / (1 - f0);
  const L = [cam.cx, yL, ZL];
  const Vs = VZ.map((z, i) => {
    const f = (z - ZL) / (zC - ZL), hx = L[0] + (cam.cx - L[0]) * f, hy = L[1] + (yC - L[1]) * f, s = (zC - z) / (zC - VZ[0]);
    const ox = [.016, -.02, .024, -.018][i] * s, oy = [.004, -.003, .006, -.002][i] * s;   // each veil hangs off its hole a little, so the four read as four sheets
    const V = veil(S, { x: hx + ox, yDown: hy + oy, z, w: .05 * s * (cam.size ?? 1), h: .05 * s * (cam.size ?? 1), hx: -ox, hy: -oy, R: .0078 * s * (1 - .12 * i) * (cam.hole ?? 1), op: .62, col: '#bfc2d8' });
    V.set(1, 1, 0); return V;
  });
  const src = glow(.09, .09, '#ffd88f', 1.5); src.position.set(L[0], L[1], L[2] - .01); S.add(src);
  return { Vs, L, src, yC, zC };
}

// S11 silence 2, then the signature shot: the workshop from outside at night, still; above it, hanging at four depths, the four veils, dark,
// their holes out of line. On «Ni una palabra» the camera slides and comes down to the axis: by parallax the four holes line up. On «Cuatro veces» a light
// is born behind the farthest veil and goes through the four holes back to front (0.2 s each; each veil turns gold as it passes) and falls on the workshop,
// whose front turns translucent: inside, José seated as in S1, María with the child. On «se levantó» José stands up inside the light.
export function S11(E) {
  const { H } = E;
  const S = stage({ light: [0, G + .04, -.15], lightR: .08, lightCol: '#ffd88f', key: .9, keyCol: '#aebcf0', amb: .3, ambCol: '#5a6aa8', floor: .25 });
  const Vl = village(S); Vl.wins(.15);
  const F = veils4(S);
  const Js = human(S.U, { h: .07, z: SHOP.z - .016, pose: 'sit', col: '#05070f', rim: .5, edge: '#ffd27a' }); S.scene.add(Js.g);
  const J = human(S.U, { h: .07, z: SHOP.z - .016, pose: 'stand', col: '#05070f', rim: .55, edge: '#ffd27a' }); S.scene.add(J.g);
  const M = human(S.U, { h: .064, z: SHOP.z - .02, pose: 'carry', col: '#05070f', rim: .5, edge: '#ffd27a' }); S.scene.add(M.g);
  const beam = shaft(.09, .13, '#ffd88f', .2); S.add(beam);
  const pool = glow(.12, .08, '#ffd88f', 1.6); pool.position.set(SHOP.x, G + .02, SHOP.z + .004); S.add(pool);
  const C = clawd(S.U, { u: .0019, z: -.078, glow: .4 }); S.scene.add(C.g);
  const NP = H.nipalabra, CV = H.cuatroveces + .05, LV = H.levanto;
  return { S, F, update(t) {
    // camera: almost still in the silence (a very slow pull back), then the slide down to the axis on «Ni una palabra», then a short dolly in along the beam
    const pb = eio(seg(t, E.T0, NP)), sl = eio(seg(t, NP - .05, NP + 1.15)), din = eio(seg(t, CV + .9, E.T0 + E.dur + .4));
    const d = lerp(lerp(.62, .66, pb), CAM_END.d, sl) - .04 * din, cx = lerp(.06, CAM_END.cx, sl), cyE = camY(G, CAM_END.f, CAM_END.d);
    const cy = lerp(cyE + .03, cyE, sl) - .004 * din;
    aim(S.cam, [cx, cy, SHOP.z + d, lerp(.012, CAM_END.cx, sl), lerp(cyE + .012, cyE, sl) - .004 * din, SHOP.z], t, { hand: lerp(.00008, .0002, sl) });
    // the beam: each veil, back to front, turns gold as the light passes its hole
    const pass = i => ss(seg(t, CV + (3 - i) * .2, CV + (3 - i) * .2 + .3));
    F.src.userData.set(lerp(.05, 1.3, ss(seg(t, CV - .2, CV + .1))));
    F.Vs.forEach((V, i) => { const q = pass(i); V.set(1, 1, lerp(.06, 1, q), q * .9); V.lightG.userData.set(q * .5); });
    const all = pass(0), inside = ss(seg(t, CV + .8, CV + 1.4));
    const [hx, hy] = F.Vs[0].hole, tgt = [SHOP.x, G + .04];
    beam.position.set((hx + tgt[0]) / 2, hy - .062, SHOP.z + .012); beam.userData.set(.55 * all);
    // the warmth goes back to front with the beam: far, mid, ground, front, foreground
    const wp = [pass(3), pass(3) * .9, pass(2), pass(1), pass(0) * .9];
    Vl.paint(wp, [lerp(.6, 1, wp[0]), lerp(.6, 1, wp[1]), lerp(.6, 1, wp[2]), lerp(.6, 1, wp[3]), lerp(.6, 1, wp[4])]);
    Vl.sky.material.color.set(mixc('#ffffff', '#ffd8a0', all * .7)).multiplyScalar(lerp(.7, 1.4, all));
    Vl.front.material.opacity = lerp(1, .38, inside); Vl.front.material.userData.u.uTrans.value = lerp(.06, .7, inside);
    Vl.light(lerp(.15, 1.3, inside), .15 + .5 * all); Vl.wins(lerp(.15, .8, all));
    pool.userData.set(.45 * inside);
    setL(S, SHOP.x, G + .04, lerp(.06, .14, inside), lerp(.2, 1.6, inside), '#ffd88f');
    S.key.color.copy(col3('#aebcf0').lerp(col3('#ffe0b0'), all)); S.key.intensity = lerp(.9, 1.3, all); S.amb.color.copy(col3('#5a6aa8').lerp(col3('#c0a080'), all));
    Js.set({ x: SHOP.door[0] - .012, y: G + .002, rot: 0, a: .5 }); J.set({ x: SHOP.door[0] - .008, y: G + .001, a: .15 });
    rise(Js, J, t, LV - .2);
    Js.lit(inside * 1.1); J.lit(inside * 1.3);
    M.set({ x: SHOP.door[0] + .014, y: G + .001, a: -.9 }); flip(M); M.lit(inside * 1.1); M.g.visible = inside > .02;
    const down = ss(seg(t, LV, LV + .5));
    C.set({ x: .05, y: G - .0005, aL: lerp(.8, 0, down), aR: lerp(.8, 0, down), look: -.5, blink: t < NP ? 1 : slowBlink(t, 4, .3), k: lerp(.5, 1, all) });
    this._w = all; this._f = fsOf(S, SHOP.z);
  }, post() { return { focus: this._f, aper: 5, maxCoc: 4, bloom: blo(lerp(.36, .42, this._w), lerp(1.0, .95, this._w)) }; },
  grade() { return { vig: lerp(.55, .4, this._w), sat: lerp(.95, 1.06, this._w), lift: [lerp(0, .012, this._w), .004, lerp(.02, 0, this._w)], gain: [lerp(1, 1.05, this._w), 1, lerp(1, .93, this._w)] }; } };
}

// S12 the workshop in gold: day, the same framing as S1. José standing at the bench, planing a board; María seated with the child by the door.
// Clawd on his plank by the lamp (out now: there is sun) taps once and on the question turns his head to the camera, slowly. Slow pull-out.
export function S12(E) {
  const { H } = E;
  const S = stage({ light: [DOOR.x, G + .04, BZ], lightR: .12, lightCol: '#ffe0a0', key: 1.5, keyCol: '#ffe8c8', amb: .45, ambCol: '#c8a07a', floor: .5 });
  const W = room(S, { pal: PAL.day, day: true }); W.paint(PAL.day, PAL.day, 0); W.lamp(0, 0); W.wins(0);
  W.sky.material.color.setScalar(1.6);
  const J = human(S.U, { h: .086, z: -.098, col: '#1c1208', rim: .7, two: true }); S.scene.add(J.g);
  const M = human(S.U, { h: .08, z: -.118, pose: 'vsit', col: '#1c1208', rim: .65 }); S.scene.add(M.g);
  const ch = human(S.U, { h: .036, z: -.116, pose: 'child', col: '#1c1208', rim: .65 }); S.scene.add(ch.g);
  const sun = glow(.12, .14, '#ffe0a0', 1.6); sun.position.set(DOOR.x, G + .04, BZ + .01); sun.userData.set(.35); S.add(sun);
  const C = clawd(S.U, { u: .0023, z: CB[2], glow: .4 }); S.scene.add(C.g);
  const P = H.pregunta;
  return { S, update(t) {
    const k = eio(seg(t, E.T0 - .2, E.T0 + E.dur - .3)), d = lerp(.56, .64, k), cx = .02, cy = camY(G, .68, d);
    aim(S.cam, [cx, cy, -.09 + d, cx, cy, -.09], t, { hand: .00025 });
    const pl = Math.sin((t - E.T0) * 3.2);
    J.set({ x: .042 + .002 * pl, y: G, a: 1.25 + .18 * pl, rot: .03 + .02 * pl }); flip(J);
    M.set({ x: -.034, y: G + .001, a: .5 }); ch.set({ x: -.006, y: G, a: .3 }); flip(ch);
    const turn = ss(seg(t, P + .5, P + 1.3));
    C.set({ x: CB[0] + .012, y: CB[1], aR: taps(t, [P - .05]), look: lerp(-.9, 0, turn), blink: t > P + 1.4 ? blinkAt(t, 3.0, .3) : slowBlink(t, 4.5, .8), k: 1 });
    this._f = fsOf(S, -.1);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(.36, 1.05) }; }, grade() { return { vig: .32, sat: 1.04, lift: [.012, .005, 0], gain: [1.05, 1, .93] }; } };
}
