// The shots of "La Transfiguración" (Mateo 17:1–9; Marcos 9:2–10; Lucas 9:28–36). Each: { S, update(t), post(), grade() }; t in film seconds.
// God is only light and cloud: the light behind Jesús's shape, the cloud of four sheets and the light that crosses them. Jesús, Moisés, Elías and the
// three disciples are serene, featureless silhouettes with the head always visible. Clawd is the only clay-coloured thing: to one side, smaller than the
// disciples; his gesture is to look and to shield his eyes. During the voice from the cloud he is completely still.
// The film climbs a mountain: indigo/violet below → gold and white at the top. Everything counts in threes (three disciples, three figures, three tents)
// until the cloud takes it all and only one is left.
import * as THREE from 'three';
import { skyPanel, text, paint, tex } from './paper.js';
import { stage, aim } from './stage.js';
import { mulberry, seg, ss, eio, eo, lerp, clamp, spring, TAU } from './lib.js';
import { mk, cut, tint, clawd, human, waveFill, lightFig, tent } from './actors.js';

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
const G = -.06;   // reference line
export { G, camY, mixc };

// soft radial glow (the bloom behind the light, pools of light)
export function glow(w, h, col = '#ffd79a', pw = 2) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.ShaderMaterial({
    uniforms: { col: { value: new THREE.Color(col) }, k: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: `varying vec2 vUv; uniform vec3 col; uniform float k; void main(){ float a = pow(max(0., 1. - length((vUv - .5) * 2.)), ${pw.toFixed(1)}); gl_FragColor = vec4(col * a * k, 1.); }`,
  }));
  m.renderOrder = 10; m.userData.set = k => { m.material.uniforms.k.value = k; }; return m;
}
// a ground sheet whose top is a soft wave at world height `base`
const ground = (S, z, col, base, amp, len, ph, tr = .08, o = {}) => { const w = o.w || 1.2, ox = o.x || 0; return lay(S, { w, h: .5, x: ox, y: base - .25, z, col, trans: tr, ppm: o.ppm || Math.min(2400, 4000 / w), finish: { rim: o.rim ?? .45, rimCol: o.rimCol }, draw: x => { x.translate(-ox, -(base - .25)); waveFill(x, { x0: ox - w / 2, x1: ox + w / 2, base, amp, len, ph, peak: o.peak ?? 1.3 }); } }); };

// a darker band at the bottom of the frame, held in front of the camera, so the subtitles read on bright pictures (gold sky, lit cloud)
export function band(S) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({
    uniforms: { k: { value: 0 }, col: { value: new THREE.Color('#0a0604') } }, transparent: true, depthWrite: false, depthTest: false,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: 'varying vec2 vUv; uniform float k; uniform vec3 col; void main(){ float a = k * (1. - smoothstep(.22, .34, vUv.y)); gl_FragColor = vec4(col, a); }',
  }));
  m.renderOrder = 40; S.scene.add(m);
  const dd = .05, fw = new THREE.Vector3();
  return k => {
    m.visible = k > .002; m.material.uniforms.k.value = k;
    S.cam.updateMatrixWorld(); S.cam.getWorldDirection(fw);
    m.position.copy(S.cam.position).addScaledVector(fw, dd); m.quaternion.copy(S.cam.quaternion);
    m.scale.set(.26 * dd * 1.1, .4617 * dd * 1.05, 1);
  };
}

// —— the summit: night sky (violet) and a gold sky that fades in over it, far peaks, a middle ridge, the summit rock where the three figures stand,
// the ledge in front where the disciples are, a dark front rock (always dark: the subtitle band), and two small rocks for Clawd ——
export const TOP = G + .01, TZ = -.165, LEDGE = G - .04, LZ = -.11, FZ = -.055;
export const ROCK_R = [.05, G - .026, -.07], ROCK_L = [-.07, G - .026, -.07];
const SKY = {
  night: [[0, '#07051a'], [.3, '#0e0b26'], [.45, '#120f2e'], [.58, '#231c4a'], [.7, '#16123a'], [1, '#07061a']],
  gold: [[0, '#d9b77e'], [.25, '#eed6a6'], [.45, '#f6e3b8'], [.55, '#fff1d6'], [.68, '#f2dcb0'], [1, '#d8bc8a']],
};
// groups: 0 front, 1 ledge, 2 summit, 3 mid ridge, 4 far peaks
export const PAL = {
  violet: ['#07061a', '#120f2a', '#1f1a40', '#363068', '#5d56a0'],
  warm: ['#140d0a', '#3a2a20', '#7a5e46', '#c9a47a', '#f3dcb0'],
  grey: ['#0a0812', '#1a1424', '#2a2238', '#4e4466', '#6a5e7e'],
  dawn: ['#1e1208', '#3a2814', '#6b5640', '#b89a72', '#e2c597'],
};
export function peak(S, o = {}) {
  const skyN = skyPanel({ w: 3.4, h: 2.6, y: .25, z: -.98, stops: SKY.night, stars: 340, starMinY: -.15, seed: 9 }); S.add(skyN);
  const skyG = skyPanel({ w: 3.4, h: 2.6, y: .25, z: -.97, stops: SKY.gold, stars: 0 }); skyG.material.transparent = true; skyG.material.opacity = 0; skyG.material.depthWrite = false; S.add(skyG);
  const P = PAL.violet;
  const far = ground(S, -.62, P[4], G + .05, .07, .33, 1.3, .45, { w: 2.8, peak: 2.6, rim: .45, rimCol: 'rgba(225,215,255,.45)' });
  const mid = ground(S, -.34, P[3], G - .002, .032, .19, 2.4, .25, { w: 1.7, peak: 1.8, rim: .45, rimCol: 'rgba(225,215,255,.4)' });
  const sy = x => { const a = Math.abs(x); return a < .088 ? TOP + .0012 * Math.sin(x * 140) : TOP - (a - .088) * .5 - 1.3 * (a - .088) ** 2 + .002 * Math.sin(x * 60); };
  const summit = lay(S, { w: 1, h: .4, y: TOP - .2, z: -.172, col: P[2], trans: .12, ppm: 3000, finish: { rim: .5, rimPx: 4, rimCol: 'rgba(235,225,255,.5)', under: .3 }, draw: c => {
    c.translate(0, -(TOP - .2)); c.beginPath(); c.moveTo(-.5, TOP - .45); for (let u = -.5; u <= .5001; u += .002) c.lineTo(u, sy(u)); c.lineTo(.5, TOP - .45); c.closePath(); c.fill();
    const Q = mulberry(5); for (let i = 0; i < 14; i++) { const u = (Q() - .5) * .5; if (Math.abs(u) < .1) continue; c.beginPath(); c.ellipse(u, sy(u) - .002, .006 + Q() * .01, .004 + Q() * .005, 0, 0, TAU); c.fill(); }
  } });
  const ledge = ground(S, LZ - .004, P[1], LEDGE, .0025, .11, .7, .05, { w: 1.1, rim: .35, rimCol: 'rgba(225,215,255,.4)' });
  const front = ground(S, FZ, P[0], G - .074, .007, .09, .4, .02, { w: 1, peak: 2, rim: .2 });
  const rock = ([x, y, z], s = 1) => lay(S, { w: .05 * s, h: .04, x, y: y - .02, z: z - .002, col: P[0], trans: .03, ppm: 4000, finish: { rim: .5, rimCol: 'rgba(225,215,255,.45)', under: .3 }, draw: c => {
    c.beginPath(); c.moveTo(-.024 * s, -.02); c.quadraticCurveTo(-.023 * s, .012, -.008 * s, .0195); c.quadraticCurveTo(.012 * s, .021, .023 * s, .006); c.lineTo(.024 * s, -.02); c.closePath(); c.fill(); } });
  const rockR = rock(ROCK_R), rockL = rock(ROCK_L);
  const L = [[front, 0], [rockR, 0], [rockL, 0], [ledge, 1], [summit, 2], [mid, 3], [far, 4]];
  return { skyN, skyG, far, mid, summit, ledge, front, rockR, rockL, L,
    // colour of each group between two palettes (p per group 0..1), brightness per group
    paint(pA, pB, p = [0, 0, 0, 0, 0], k = [1, 1, 1, 1, 1]) { for (const [m, gi] of L) tint(m, mixc(pA[gi], pB[gi], p[gi] ?? 0), lerp(.04, 1, k[gi] ?? 1)); },
    sky(kN = 1, gold = 0, kG = 1) { skyN.material.color.setScalar(kN); skyG.material.opacity = gold; skyG.visible = gold > .002; skyG.material.color.setScalar(kG); },
  };
}

// —— the cloud: four translucent sheets with a drawn, scalloped lower edge, at four depths. They come down (S6), are crossed by light (S7), go grey (S8)
// and go up again one by one (S10). set(down 0 up..1 down, colour, brightness, lit = the light coming through, opacity) ——
export const CZ = [-.21, -.152, -.13, -.117];
const CDOWN = [G - .02, TOP - .012, TOP - .03, G - .03];
export const CCOLD = ['#cfc8e6', '#b9b0d6', '#a49bc4', '#8e86b0'], CWARM = ['#fff4dc', '#ffe8bf', '#f6d79f', '#e8c48a'], CGREY = ['#6a5e7e', '#5e5474', '#4e4466', '#463c5c'];
const COP = [.92, .84, .78, .55];
export function clouds(S) {
  return CZ.map((z, i) => {
    const Q = mulberry(30 + i), w = .7, h = .5, yDown = CDOWN[i], ox = i % 2 ? .012 : -.01;
    const sc = []; let u = -w / 2 - .01; while (u < w / 2 + .02) { const r = .01 + Q() * .016; sc.push([u + r, r]); u += r * (1.4 + Q() * .4); }
    const edge = u => { for (const [c, r] of sc) if (Math.abs(u - c) <= r) return -h / 2 + .03 - r * Math.sqrt(Math.max(0, 1 - ((u - c) / r) ** 2)) * .75; return -h / 2 + .03; };
    const m = lay(S, { w: w + .01, h: h + .01, x: ox, y: yDown + h / 2, z, col: CCOLD[i], trans: .85, shadow: false, recv: false, ppm: 2200, finish: { rim: .5, rimPx: 3, rimCol: 'rgba(255,252,245,.7)', under: .16 }, draw: c => {
      c.beginPath(); c.moveTo(-w / 2, h / 2); c.lineTo(w / 2, h / 2); for (let x = w / 2; x >= -w / 2 - 1e-6; x -= .0015) c.lineTo(x, edge(x)); c.closePath(); c.fill();
    }, glowDraw: c => { c.fillStyle = '#fff'; c.fillRect(-w / 2, -h / 2, w, h); }, glow: 1.4, glowCol: '#fff1d0', glowRes: .2 });
    m.material.transparent = true; m.material.depthWrite = false; m.material.opacity = COP[i]; m.renderOrder = 4 + i;
    const uu = m.material.userData.u; uu.uGlowLit.value = 0;
    const up = .3;
    return { m, z, i,
      set(down, col = CCOLD[i], k = 1, lit = 0, op = 1) {
        m.position.y = yDown + h / 2 + (1 - down) * up; m.visible = down > .002;
        tint(m, col, k); uu.uGlowLit.value = lit; m.material.emissive.set(mixc('#e9dcff', '#fff0cc', clamp(lit))); m.material.opacity = COP[i] * op;
      } };
  });
}

// the paper title strip (only at the start), held in front of the camera, high in the dark sky, away from the light
function titleStrip(S, T) {
  const W = .13, Hh = .046;
  const m = lay(S, { w: W, h: Hh, y: .088, z: -.03, col: '#e7d4a8', trans: .35, shadow: false, recv: false, ppm: 9000, finish: { rim: .3, under: .2 }, draw: x => {
    x.beginPath(); x.roundRect(-W / 2 + .001, -Hh / 2 + .001, W - .002, Hh - .002, .002); x.fill();
    cut(x, () => {
      text(x, 'LA TRANSFIGURACIÓN', 0, .0062, .0087, 'Cinzel', { weight: 800, fill: '#000' });
      text(x, 'Mateo 17:1–9', 0, -.0112, .0082, 'Playfair', { weight: 'italic 500', fill: '#000' });
    });
  }, glowDraw: x => { x.fillStyle = '#fff'; x.fillRect(-W / 2, -Hh / 2, W, Hh); }, glow: .45, glowCol: '#e7d4a8', glowRes: .2 });
  m.material.transparent = true; m.material.alphaTest = .02; m.material.alphaToCoverage = false; m.material.needsUpdate = true;
  return (t, S) => {
    const reveal = ss(seg(t, T.in, T.in + .55)), op = 1 - ss(seg(t, T.out - .45, T.out));
    const cz = S.cam.position.z + .03, ts = cz / .55; m.scale.setScalar(ts * .92); m.position.x = S.cam.position.x; m.position.y = S.cam.position.y + .4617 * cz / 2 * .7;
    m.material.userData.u.uClip.value.set(m.position.x, m.position.y, .09 * reveal * ts, 0); m.material.opacity = op; m.visible = reveal > .002 && op > .003;
  };
}

// the mist curtain (S1 → S2): two pale sheets just in front of the camera that close from the sides and open again. close 0 open..1 shut
function curtain(S) {
  const w = .03, h = .05;
  const mkS = sg => {   // sg -1: the left sheet (solid on the left, wavy inner edge on the right); +1 the right one
    const c = paint(w, h, x => {
      x.fillStyle = '#3c3870'; x.beginPath(); x.moveTo(sg * w / 2, -h / 2); x.lineTo(sg * w / 2, h / 2);
      for (let y = h / 2; y >= -h / 2; y -= .0003) x.lineTo(-sg * (w * .3 + .0012 * Math.sin(y * 700) + .0007 * Math.sin(y * 1900 + 1)), y);
      x.closePath(); x.fill();
    }, 12000);
    const b = document.createElement('canvas'); b.width = c.width; b.height = c.height; const bx = b.getContext('2d'); bx.filter = 'blur(10px)'; bx.drawImage(c, 0, 0);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex(b), transparent: true, opacity: .7, depthWrite: false, depthTest: false }));
    m.renderOrder = 30; S.scene.add(m); return m;
  };
  const A = mkS(-1), B = mkS(1), fw = new THREE.Vector3(), rt = new THREE.Vector3();
  return close => {
    const dd = .06, hw = .26 * dd / 2;
    A.visible = B.visible = close > .002;
    S.cam.updateMatrixWorld(); S.cam.getWorldDirection(fw); rt.set(1, 0, 0).applyQuaternion(S.cam.quaternion);
    for (const [m, sg] of [[A, -1], [B, 1]]) { m.position.copy(S.cam.position).addScaledVector(fw, dd).addScaledVector(rt, sg * lerp(hw + w * .32, w * .3 - .004, eio(close))); m.quaternion.copy(S.cam.quaternion); }
  };
}

// standing up / changing pose: the first figure sinks a little, then the second rises out of it (scale y with a spring)
const rise = (aA, bA, t, a) => {
  const p = seg(t, a, a + .5), up = p >= .35;
  aA.g.visible = !up; bA.g.visible = up;
  if (!up) aA.g.position.y -= .002 * ss(p / .35);
  else { const q = (p - .35) / .65; bA.g.scale.y = Math.abs(bA.g.scale.y) * (.78 + .22 * Math.min(1.02, spring(q * 1.2, 6, .6))); }
  return up;
};
// falling on the face: a short gather (they shrink), then the bowed figure drops in with a small settle
const fall = (kA, bA, t, a) => {
  const p = seg(t, a, a + .55), down = p >= .3;
  kA.g.visible = !down; bA.g.visible = down;
  if (!down) kA.g.scale.y = Math.abs(kA.g.scale.y) * (1 - .07 * ss(p / .3));
  else { const q = (p - .3) / .7; bA.g.scale.y = Math.abs(bA.g.scale.y) * (1.18 - .18 * Math.min(1.03, spring(q * 1.3, 7, .5))); }
  return down;
};

const SIL = '#06050f', SILW = '#1c1208';
const nightGrade = (o = {}) => ({ vig: .5, sat: .95, lift: [.004, .002, .02], gain: [1.0, 1, 1.0], ...o });
const warmGrade = (w = 1, o = {}) => ({ vig: lerp(.5, .4, w), sat: lerp(.95, 1.04, w), lift: [lerp(.004, .012, w), lerp(.002, .004, w), lerp(.02, 0, w)], gain: [lerp(1, 1.05, w), 1, lerp(1, .93, w)], ...o });

// the people on the summit: Jesús (the light figure), Moisés, Elías
export function summitCast(S, o = {}) {
  const J = lightFig(S.U, { h: .082, z: TZ, col: o.silCol || SIL, edge: '#ffe2a8' }); S.scene.add(J.g);
  const Mo = human(S.U, { h: .077, z: TZ - .003, pose: 'mantle', col: o.silCol || SIL, rim: .5, edge: '#ffe2a8', fadeable: true }); S.scene.add(Mo.g);
  const El = human(S.U, { h: .073, z: TZ - .003, pose: 'mantle', col: o.silCol || SIL, rim: .5, edge: '#ffe2a8', fadeable: true }); S.scene.add(El.g);
  J.set({ x: 0, y: TOP }); Mo.set({ x: -.05, y: TOP - .0005, a: .35 }); El.set({ x: .05, y: TOP - .0005, a: .35 }); flip(El);
  return { J, Mo, El };
}
// three disciples seen from behind (Santiago, Pedro, Juan, left to right), on the ledge: kneeling, or standing ('front')
export const DX = [-.058, -.02, .016], DXL = [-.034, .002, .036];   // DXL: when Clawd is on the left rock
export function backTrio(S, col = SIL, pose = 'backkneel', hs = [.062, .068, .06], xs = DX) {
  return xs.map((x, i) => { const A = human(S.U, { h: hs[i], z: LZ + (i === 1 ? .004 : 0), pose, col, rim: .45, edge: '#ffe2a8', noArm: pose === 'backkneel', two: pose === 'front' }); S.scene.add(A.g); A.set({ x, y: LEDGE + .001 }); return A; });
}
// the camera of the summit (P1, P4, P11): distance, height, a slight look up (low angle)
export const sumCam = (S, t, { z = .5, cx = 0, f = .68, up = .012, dy = 0, hand = .0003 } = {}) => {
  const d = z - LZ, cy = camY(LEDGE, f, d) + dy;
  aim(S.cam, [cx, cy, z, cx, cy + up, LZ], t, { hand });
};

// S1 the flash on the summit (the hook). Violet night. Jesús is a shape of light; Moisés and Elías dark at his sides, their edges light up as they are
// named. The three disciples kneel with their backs to us; Clawd on a low rock at the right shields his eyes. Title strip in the dark sky.
// Push-in with a little crane up. At the end the mist curtain closes.
export function S1(E) {
  const { H } = E;
  const S = stage({ light: [0, TOP + .045, TZ - .01], lightR: .06, lightCol: '#ffe6b8', key: 1.0, keyCol: '#b8b0f0', amb: .32, ambCol: '#5a50a0', floor: .22 });
  const P = peak(S); P.paint(PAL.violet, PAL.warm, [0, .06, .2, .12, .04], [1, 1, 1, .9, .9]); P.sky(1, 0);
  const C3 = summitCast(S), D = backTrio(S);
  const halo = glow(.17, .2, '#ffe9b8', 1.7); halo.position.set(0, TOP + .045, TZ - .012); S.add(halo);
  const C = clawd(S.U, { u: .0026, z: ROCK_R[2], glow: .5 }); S.scene.add(C.g);
  const title = titleStrip(S, { in: .25, out: H.title_out }), cur = curtain(S);
  const tM = H.moises + .72, tE = H.moises + 1.35, end = E.T0 + E.dur;
  return { S, update(t) {
    const k = eio(seg(t, 0, end + .4));
    sumCam(S, t, { z: lerp(.7, .64, k), dy: lerp(-.008, .006, k), up: lerp(.016, .01, k) });
    const fl = 1 + .05 * Math.sin(t * 2.1);
    C3.J.cal(1, 1.1 * fl); C3.J.lit(.6); halo.userData.set(.55 * fl);
    C3.Mo.fade(1); C3.El.fade(1);
    C3.Mo.lit(lerp(.1, .6, ss(seg(t, tM - .1, tM + .35)))); C3.El.lit(lerp(.1, .6, ss(seg(t, tE - .1, tE + .35))));
    D.forEach(A => A.lit(.35));
    C.set({ x: ROCK_R[0], y: ROCK_R[1], aL: 1.7, look: -.6, blink: slowBlink(t, 4.3, 1.2), k: .85 });
    title(t, S); cur(.85 * ss(seg(t, end - .3, end)));
    this._f = fsOf(S, -.14);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(.42, .95) }; }, grade() { return nightGrade({ lift: [.008, .002, .016] }); } };
}

// —— the slope: indigo night (the climb, S2) or gold (the way down, S12). The ground rises to the right. ——
const SL = .3, yS = x => G + SL * x + .003 * Math.sin(x * 37);
const SLOPE = {
  night: { stops: [[0, '#050818'], [.35, '#0c1430'], [.5, '#16224a'], [.6, '#1e2c55'], [1, '#0a1022']], far: '#4b5f8f', mid: '#2b3a63', hill: '#1d2a4c', path: '#2e3d6a', front: '#070b18', rim: 'rgba(200,214,255,.45)', stars: 300 },
  gold: { stops: [[0, '#d9b77e'], [.3, '#eed6a6'], [.48, '#f6e3b8'], [.58, '#fff1d6'], [1, '#e2c597']], far: '#e2c597', mid: '#b89a72', hill: '#6b5640', path: '#8a7050', front: '#1e1208', rim: 'rgba(255,236,200,.5)', stars: 0 },
};
function slope(S, kind) {
  const P = SLOPE[kind];
  const sky = skyPanel({ w: 3.4, h: 2.6, y: .3, z: -.98, stops: P.stops, stars: P.stars, starMinY: 0, seed: 12 }); S.add(sky);
  // the high mountain at the back (the summit they climb to), on the right
  const far = lay(S, { w: 2.4, h: 1, x: 0, y: G - .1, z: -.72, col: P.far, trans: .45, ppm: 1600, finish: { rim: .45, rimCol: P.rim }, draw: c => {
    c.translate(0, -(G - .1)); c.beginPath(); c.moveTo(-1.2, G - .6);
    for (let u = -1.2; u <= 1.2; u += .004) { const pk = .26 * Math.exp(-(((u - .1) / .16) ** 2)) + .08 * Math.exp(-(((u + .35) / .3) ** 2)); c.lineTo(u, G + .02 + pk + .006 * Math.sin(u * 40) + .003 * Math.sin(u * 110)); }
    c.lineTo(1.2, G - .6); c.closePath(); c.fill();
  } });
  const mid = ground(S, -.4, P.mid, G + .03, .03, .22, 2.1, .25, { w: 2, peak: 1.6, rim: .45, rimCol: P.rim });
  const hill = lay(S, { w: 1.4, h: 1, y: G - .3, z: -.16, col: P.hill, trans: .1, ppm: 1800, finish: { rim: .45, rimPx: 4, rimCol: P.rim, under: .3 }, draw: c => {
    c.translate(0, -(G - .3)); c.beginPath(); c.moveTo(-.7, G - .8); for (let u = -.7; u <= .7; u += .002) c.lineTo(u, yS(u)); c.lineTo(.7, G - .8); c.closePath(); c.fill();
    const Q = mulberry(3); for (let i = 0; i < 40; i++) { const u = (Q() - .5) * 1.3; c.beginPath(); c.ellipse(u, yS(u) - .001, .003 + Q() * .006, .002 + Q() * .004, 0, 0, TAU); c.fill(); }
  } });
  // front: dark rocks and dry bushes, parallel to the slope, lower
  const Q = mulberry(kind === 'night' ? 7 : 8), bush = []; for (let i = 0; i < 40; i++) bush.push([-.7 + i * .035 + (Q() - .5) * .02, .004 + Q() * .01, Q()]);
  const yF = x => yS(x) - .058 + .004 * Math.sin(x * 23);
  const front = lay(S, { w: 1.4, h: 1, y: G - .35, z: -.07, col: P.front, trans: .02, ppm: 1800, finish: { rim: .25, rimCol: P.rim }, draw: c => {
    c.translate(0, -(G - .35)); c.beginPath(); c.moveTo(-.7, G - .9); for (let u = -.7; u <= .7; u += .002) c.lineTo(u, yF(u)); c.lineTo(.7, G - .9); c.closePath(); c.fill();
    for (const [bx, bh, r] of bush) { if (r < .55) { c.beginPath(); c.ellipse(bx, yF(bx), bh * 1.5, bh, 0, 0, TAU); c.fill(); } else { c.lineWidth = .0009; for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(bx, yF(bx)); c.lineTo(bx + k * bh * .3, yF(bx) + bh * 1.5 * (1 - Math.abs(k) * .12)); c.stroke(); } } }
  } });
  return { sky, far, mid, hill, front, yF };
}
// a walker: small bob and arm swing; dir 1 = to the right
const wk = (A, x, y, t, ph, dir = 1, sp = 8.5) => { A.set({ x, y: y + Math.abs(Math.sin(t * sp + ph)) * .0007, a: Math.sin(t * sp + ph) * .28 + .1, rot: -.03 }); if (dir < 0) flip(A); };

// S2 «Seis días después»: the foot of the mountain in indigo shadow. The mist opens on it. Four walk to the right and up (Jesús first, then Pedro,
// Santiago, Juan); Clawd last, small. A lateral move with parallax (front fast, the mountain far behind almost still).
export function S2(E) {
  const S = stage({ light: [.3, G + .2, -.7], lightR: .35, lightCol: '#aebcf0', key: 1.0, keyCol: '#aebcf0', amb: .34, ambCol: '#5a6aa8', floor: .3 });
  slope(S, 'night');
  const hs = [.064, .06, .062, .058];
  const W = hs.map(h => { const A = human(S.U, { h, z: -.13, col: '#04060f', rim: .55, edge: '#b8c4f0' }); S.scene.add(A.g); return A; });
  const C = clawd(S.U, { u: .0018, z: -.118, glow: .5 }); S.scene.add(C.g);
  const cur = curtain(S), T0 = E.T0, vx = .022, OFF = [.036, .012, -.011, -.033];
  return { S, update(t) {
    const p = t - T0, gx = -.09 + vx * p;
    const d = .75, cx = gx - .004, cy = camY(yS(gx), .64, d);
    aim(S.cam, [cx, cy, -.13 + d, cx, cy + .004, -.13], t, { hand: .0004 });
    W.forEach((A, i) => { const x = gx + OFF[i]; wk(A, x, yS(x), t, i * 1.3); A.lit(.12); });
    const xc = gx - .052; C.set({ x: xc, y: yS(xc) - .0005, rot: Math.atan(SL) * .5, walk: t * 11, stride: .5, look: .8, blink: slowBlink(t, 3.8, .5), k: .8 });
    cur(.85 * (1 - ss(seg(t, T0, T0 + .35))));
    this._f = fsOf(S, -.13);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(.36, 1.0) }; }, grade() { return nightGrade(); } };
}

// S3 «Solo tres discípulos»: the zigzag path between rocks; the three follow Jesús one by one; as each is named his edge lights up.
// Clawd last; he stops for a moment and looks up toward the summit. Tilt up along the climb.
const ZZ = [[-.045, G - .085], [.04, G - .058], [-.035, G - .03], [.04, G - .002], [-.025, G + .026], [.03, G + .05], [.0, G + .07]];
const zlen = (() => { const l = [0]; for (let i = 1; i < ZZ.length; i++) l.push(l[i - 1] + Math.hypot(ZZ[i][0] - ZZ[i - 1][0], ZZ[i][1] - ZZ[i - 1][1])); return l; })();
const zat = s => { s = clamp(s, 0, zlen[zlen.length - 1] - 1e-6); let i = 1; while (zlen[i] < s) i++; const f = (s - zlen[i - 1]) / (zlen[i] - zlen[i - 1]), a = ZZ[i - 1], b = ZZ[i]; return [lerp(a[0], b[0], f), lerp(a[1], b[1], f), Math.sign(b[0] - a[0])]; };
export function S3(E) {
  const { H } = E;
  const S = stage({ light: [0, G + .2, -.6], lightR: .3, lightCol: '#aebcf0', key: 1.0, keyCol: '#aebcf0', amb: .34, ambCol: '#5a6aa8', floor: .3 });
  const P = SLOPE.night;
  const sky = skyPanel({ w: 3.4, h: 2.6, y: .3, z: -.98, stops: P.stops, stars: 300, starMinY: 0, seed: 14 }); S.add(sky);
  ground(S, -.6, P.far, G + .1, .05, .3, 1.1, .45, { w: 2.6, peak: 2.4, rim: .45, rimCol: P.rim });
  // the mountain side: a steep face with the path drawn on it as a lighter strip
  const face = x => G + .1 - .62 * Math.abs(x - .01) - 1.4 * x * x + .03 * x + .008 * Math.sin(x * 31 + 1) + .004 * Math.sin(x * 77);
  lay(S, { w: 1, h: .6, y: G - .2, z: -.15, col: P.hill, trans: .1, ppm: 2600, finish: { rim: .5, rimPx: 4, rimCol: P.rim, under: .3 }, draw: c => {
    c.translate(0, -(G - .2)); c.beginPath(); c.moveTo(-.5, G - .5); for (let u = -.5; u <= .5; u += .002) c.lineTo(u, face(u)); c.lineTo(.5, G - .5); c.closePath(); c.fill();
  } });
  lay(S, { w: .2, h: .2, y: G - .005, z: -.146, col: P.path, trans: .12, ppm: 4000, finish: { rim: .45, rimCol: P.rim, under: .3 }, draw: c => {
    c.translate(0, -(G - .005)); c.lineWidth = .007; c.lineJoin = 'round'; c.lineCap = 'round'; c.beginPath(); ZZ.forEach(([x, y], i) => i ? c.lineTo(x, y - .002) : c.moveTo(x, y - .002)); c.stroke();
  } });
  // rocks along the path, and the dark front
  const Q = mulberry(17);
  lay(S, { w: .3, h: .3, y: G - .03, z: -.138, col: '#121a32', trans: .04, ppm: 3000, finish: { rim: .5, rimCol: P.rim, under: .3 }, draw: c => {
    c.translate(0, -(G - .03));
    for (let i = 0; i < 12; i++) { const k = i % (ZZ.length - 1), a = ZZ[k], b = ZZ[k + 1], f = Q(); const x = lerp(a[0], b[0], f) + (Q() < .5 ? -1 : 1) * (.012 + Q() * .01), y = lerp(a[1], b[1], f) - .012; if (Math.abs(x) > .07) continue; c.beginPath(); c.ellipse(x, y, .006 + Q() * .007, .004 + Q() * .004, 0, 0, TAU); c.fill(); }
  } });
  ground(S, -.07, P.front, G - .118, .008, .09, .4, .02, { w: 1, peak: 2, rim: .2, rimCol: P.rim });
  const hs = [.05, .047, .048, .046], names = [H.nombres + .05, H.nombres + .6, H.nombres + 1.15];
  const W = hs.map(h => { const A = human(S.U, { h, z: -.13, col: '#04060f', rim: .55, edge: '#c8d2ff' }); S.scene.add(A.g); return A; });
  const C = clawd(S.U, { u: .002, z: -.122, glow: .5 }); S.scene.add(C.g);
  const T0 = E.T0, v = .036, GAP = .034, stop = [H.nombres + 1.0, H.nombres + 1.7];
  return { S, update(t) {
    const tl = eio(seg(t, T0, T0 + E.dur + .2)), d = .72, cy = lerp(G - .03, G + .012, tl);
    aim(S.cam, [0, cy, -.13 + d, 0, cy + .008, -.13], t, { hand: .0004 });
    const s0 = .17 + v * (t - T0);
    W.forEach((A, i) => {
      const [x, y, dir] = zat(s0 - i * GAP); wk(A, x, y, t, i * 1.3, dir);
      A.lit(i ? .06 + lerp(.06, .9, ss(seg(t, names[i - 1], names[i - 1] + .25))) * lerp(1, .55, ss(seg(t, names[i - 1] + .7, names[i - 1] + 1.4))) : .12);
    });
    const te = Math.min(t, stop[0]) + Math.max(0, t - stop[1]), [x, y, dir] = zat(.17 + v * (te - T0) - 4 * GAP), still = t > stop[0] && t < stop[1];
    C.set({ x, y: y - .0003, walk: still ? 0 : t * 11, stride: still ? 0 : .5, look: still ? .2 * dir : .8 * dir, rot: still ? .12 * -dir : 0, blink: slowBlink(t, 3.6, .9), k: .8 });
    this._f = fsOf(S, -.13);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(.36, 1.0) }; }, grade() { return nightGrade(); } };
}

// S4 «Arriba, su ropa se volvió blanca como la luz»: the summit. On «blanca como la luz» Jesús's shape opens and the light from behind comes through;
// the layers around warm up one by one (summit, ridge, far peaks, then the ledge). Moisés and Elías come out of the light: their edges first, then the body.
// A still frame with only light, then a short push-in. Clawd on his rock lifts an arm before his eyes; his outline turns gold.
const WDEL = [.9, .7, 0, .25, .5];   // warming delay per group (0 front … 4 far)
const warmStep = (t, a) => WDEL.map(dl => ss(seg(t, a + .1 + dl, a + .6 + dl)));
export function S4(E) {
  const { H } = E;
  const S = stage({ light: [0, TOP + .045, TZ - .01], lightR: .02, lightCol: '#ffe6b8', key: .9, keyCol: '#b8b0f0', amb: .3, ambCol: '#5a50a0', floor: .22 });
  const P = peak(S), C3 = summitCast(S), D = backTrio(S);
  const halo = glow(.17, .2, '#ffe9b8', 1.7); halo.position.set(0, TOP + .045, TZ - .012); S.add(halo);
  const C = clawd(S.U, { u: .0024, z: ROCK_R[2], glow: .5 }); S.scene.add(C.g);
  const A = H.luz;
  return { S, update(t) {
    const pin = eio(seg(t, A + .6, E.T0 + E.dur + .3));
    sumCam(S, t, { z: lerp(.66, .6, pin), dy: lerp(.0, .006, pin), up: .012, hand: .00025 });
    const cal = eo(seg(t, A - .15, A + .55)), w = warmStep(t, A);
    P.paint(PAL.violet, PAL.warm, w, [1, 1, lerp(.85, 1, w[2]), lerp(.85, 1, w[3]), lerp(.8, 1, w[4])]);
    P.sky(lerp(1, .8, w[4]), .25 * w[4], .55);
    C3.J.cal(cal, 1.3); C3.J.lit(lerp(.25, .7, cal)); halo.userData.set(.7 * cal);
    setL(S, 0, TOP + .045, lerp(.02, .09, cal), lerp(.2, 1.4, cal), '#ffe6b8');
    S.key.color.copy(col3('#b8b0f0').lerp(col3('#ffe2b8'), w[1])); S.amb.color.copy(col3('#5a50a0').lerp(col3('#a08a78'), w[1]));
    const re = ss(seg(t, A + .45, A + .9)), body = ss(seg(t, A + .45, A + .85));
    for (const F of [C3.Mo, C3.El]) { F.lit(.55 * re * body); F.fade(body); }
    D.forEach(Dd => Dd.lit(.25 + .4 * cal));
    const shield = ss(seg(t, A + .1, A + .45));
    C.set({ x: ROCK_R[0], y: ROCK_R[1], aL: lerp(.2, 1.7, shield), look: -.6, blink: slowBlink(t, 4.1, .4), k: .8 + .3 * cal });
    this._f = fsOf(S, -.14); this._w = w[2];
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(lerp(.36, .44, this._w), lerp(1.0, .92, this._w)) }; }, grade() { return warmGrade(this._w * .8); } };
}

// S5 «Pedro, sin saber qué decir, propuso tres tiendas»: Pedro gets up (a sink, the rise) and opens his arms to the three; on «tres tiendas» three pale
// outlines of booths appear at their feet: an idea, nothing built. Rack focus from Pedro (in front) to the three. Silence 1: everything stops,
// a cloud's shadow crosses the high layers and the light goes down a step.
export const TX = [-.05, 0, .05];
export function S5(E) {
  const { H } = E;
  const S = stage({ light: [0, TOP + .045, TZ - .01], lightR: .09, lightCol: '#ffe6b8', key: .95, keyCol: '#ffe2b8', amb: .3, ambCol: '#a08a78', floor: .22 });
  const P = peak(S), C3 = summitCast(S);
  const halo = glow(.17, .2, '#ffe9b8', 1.7); halo.position.set(0, TOP + .045, TZ - .012); S.add(halo);
  const D = backTrio(S), Pst = human(S.U, { h: .07, z: LZ + .004, pose: 'front', col: SIL, rim: .5, edge: '#ffe2a8', two: true }); S.scene.add(Pst.g); Pst.g.visible = false;
  const T = TX.map(() => { const q = tent(S.U, { s: .034, z: TZ + .012 }); S.add(q.m); return q; });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(.7, .4), new THREE.ShaderMaterial({ uniforms: { k: { value: 0 } }, transparent: true, depthWrite: false,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: 'varying vec2 vUv; uniform float k; void main(){ vec2 d = (vUv - .5) * vec2(2., 2.); float a = k * pow(max(0., 1. - length(d)), 1.5); gl_FragColor = vec4(0., 0., .02, a); }' }));
  shadow.position.set(0, TOP + .06, -.2); shadow.renderOrder = 3; S.scene.add(shadow); shadow.material.opacity = 0;
  const C = clawd(S.U, { u: .0022, z: ROCK_R[2], glow: .5 }); S.scene.add(C.g);
  const up = H.l06 + .15, S1 = H.silencio1, TT = [H.tiendas + .5, H.tiendas + .72, H.tiendas + .94];
  return { S, update(t) {
    const k = eio(seg(t, E.T0 - .2, S1)), still = ss(seg(t, S1 - .1, S1 + .3));
    sumCam(S, t, { z: lerp(.54, .57, k), cx: -.006, f: .7, dy: .004, up: .01, hand: lerp(.0003, .00004, still) });
    // the cloud's shadow in the silence: crosses the high layers, the light goes down one step
    const sh = seg(t, S1 + .05, S1 + 1.7); shadow.position.x = lerp(-.4, .4, sh); shadow.material.uniforms.k.value = .55 * Math.sin(Math.PI * sh); shadow.visible = sh > 0 && sh < 1;
    const dim = lerp(1, .78, ss(seg(t, S1 + .3, S1 + 1.0)));
    P.paint(PAL.violet, PAL.warm, [1, 1, 1, 1, 1], [1, dim, dim, dim * .95, dim * .9]); P.sky(.8 * dim, .25, .55 * dim);
    C3.J.cal(1, 1.3 * lerp(1, .85, 1 - dim)); C3.J.lit(.7); halo.userData.set(.7 * dim);
    setL(S, 0, TOP + .045, .09, 1.4 * dim, '#ffe6b8');
    C3.Mo.lit(.55 * dim); C3.El.lit(.55 * dim); C3.Mo.fade(1); C3.El.fade(1);
    D.forEach(Dd => Dd.lit(.6));
    D[1].set({ x: DX[1], y: LEDGE + .001 });
    const open = eio(seg(t, up + .6, up + 1.3));
    Pst.set({ x: DX[1], y: LEDGE + .001, a: lerp(.05, 1.25, open), a2: -lerp(.05, 1.3, open) }); Pst.lit(.7);
    rise(D[1], Pst, t, up);
    T.forEach((q, i) => q.set(TX[i], TOP - .001, eo(seg(t, TT[i], TT[i] + .35)), 1.1 * dim));
    const lk = ss(seg(t, H.l06b, H.l06b + .6));
    C.set({ x: ROCK_R[0] - .006, y: ROCK_R[1], aL: lerp(1.2, .4, lk), look: lerp(-1, -.4, lk), rot: .08 * ss(seg(t, S1 + .2, S1 + .7)), blink: t > S1 ? 1 : slowBlink(t, 4.2, 1.6), k: .95 });
    this._f = lerp(fsOf(S, LZ), fsOf(S, TZ), ss(seg(t, H.l06 + .3, TT[0])));
  }, post() { return { focus: this._f, aper: 9, maxCoc: 8, bloom: blo(.42, .93) }; }, grade() { return warmGrade(.8); } };
}

// S6 «Aún hablaba… cuando una nube de luz los cubrió»: four cloud sheets (cold, translucent, a drawn scalloped edge) come down from above at four depths,
// one after the other, and cover the summit; as they pass the three outlines are wiped out. Slow dolly back. Clawd low on the left, out of the cloud's way.
export function S6(E) {
  const { H } = E;
  const S = stage({ light: [0, TOP + .045, TZ - .01], lightR: .09, lightCol: '#ffe6b8', key: .85, keyCol: '#e8d8c8', amb: .3, ambCol: '#8a7c90', floor: .22 });
  const P = peak(S), C3 = summitCast(S);
  const halo = glow(.17, .2, '#ffe9b8', 1.7); halo.position.set(0, TOP + .045, TZ - .012); S.add(halo);
  const D = backTrio(S, SIL, 'backkneel', undefined, DXL); const Pst = human(S.U, { h: .07, z: LZ + .004, pose: 'front', col: SIL, rim: .5, edge: '#ffe2a8', two: true }); S.scene.add(Pst.g); D[1].g.visible = false;
  const T = TX.map(() => { const q = tent(S.U, { s: .034, z: TZ + .012 }); S.add(q.m); return q; });
  const Cl = clouds(S);
  const C = clawd(S.U, { u: .002, z: ROCK_L[2], glow: .5 }); S.scene.add(C.g);
  const T0 = E.T0, drop = i => T0 + .15 + i * .5;
  return { S, update(t) {
    const k = eio(seg(t, T0, T0 + E.dur + .3));
    sumCam(S, t, { z: lerp(.62, .7, k), cx: -.004, dy: lerp(.004, .01, k), up: lerp(.01, .02, k) });
    const dn = Cl.map((c, i) => eio(seg(t, drop(i), drop(i) + 1.0)));
    Cl.forEach((c, i) => c.set(dn[i], CCOLD[i], lerp(.75, .95, dn[i]), .08 * dn[i]));
    const cover = dn[1];
    P.paint(PAL.violet, PAL.warm, [1, 1, 1, 1, 1], [1, .8, .8 - .3 * cover, .72, .7]); P.sky(.6, .2, .45);
    C3.J.cal(1, lerp(1.1, .6, cover)); halo.userData.set(.6 * (1 - .6 * cover)); setL(S, 0, TOP + .045, .09, lerp(1.2, .5, cover), '#ffe6b8');
    C3.Mo.fade(1); C3.El.fade(1); C3.Mo.lit(.5 * (1 - cover)); C3.El.lit(.5 * (1 - cover)); C3.J.lit(.6 * (1 - cover));
    // the outlines are wiped as the second sheet passes over them
    T.forEach((q, i) => q.set(TX[i], TOP - .001, 1, .9, 1 - ss(seg(t, drop(1) + .45 + i * .08, drop(1) + .85 + i * .08))));
    const low = eio(seg(t, H.l07 + .2, H.l07 + 1.2));
    Pst.set({ x: DXL[1], y: LEDGE + .001, a: lerp(1.25, .2, low), a2: -lerp(1.3, .2, low) }); Pst.lit(.5); D[0].lit(.45); D[2].lit(.45);
    const lookUp = ss(seg(t, drop(0), drop(0) + .8));
    C.set({ x: ROCK_L[0], y: ROCK_L[1], aR: lerp(1.1, 0, ss(seg(t, drop(3), drop(3) + .7))), look: .5, rot: -.08 * lookUp, blink: slowBlink(t, 4, .3), k: .75 });
    this._f = fsOf(S, -.13);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(.38, .97) }; }, grade() { return warmGrade(.6, { vig: .5 }); } };
}

// S7 the signature shot, the climax: on «una voz» a light is born behind the farthest sheet of cloud and goes through all four, back to front (0.4 s each;
// each turns from pale violet to gold and white, warmed frame by frame so it never goes green). On «A él oíd» the whole stack is white-gold; inside,
// only the three disciples read, and on the left Clawd, small and completely still. God is not seen: only the cloud and the light. Very slow push-in.
export function S7(E) {
  const { H } = E;
  const S = stage({ light: [0, TOP + .06, -.25], lightR: .05, lightCol: '#fff0d0', key: .7, keyCol: '#d8c8d8', amb: .28, ambCol: '#7a6c88', floor: .2 });
  const P = peak(S), C3 = summitCast(S);
  const D = backTrio(S, SIL, 'backkneel', undefined, DXL);
  const Cl = clouds(S);
  const src = glow(.5, .4, '#fff2d6', 1.4); src.position.set(0, TOP + .06, CZ[0] - .02); S.add(src);
  const C = clawd(S.U, { u: .0019, z: ROCK_L[2], glow: .2 }); S.scene.add(C.g);
  const bnd = band(S);
  const V = H.voz + .1;
  return { S, update(t) {
    const pin = eio(seg(t, H.aeloid - .1, E.T0 + E.dur + .5));
    sumCam(S, t, { z: lerp(.7, .65, pin), cx: -.004, dy: lerp(.01, .008, pin), up: .02, hand: .00006 });
    const q = [0, 1, 2, 3].map(i => ss(seg(t, V + i * .4, V + i * .4 + .45))), all = q[3], full = ss(seg(t, H.aeloid - .2, H.aeloid + .5));
    const LIT = [.34, .2, .12, .07], KF = [1.05, .92, .8, .7];   // back sheets brighter: the four depths stay readable
    Cl.forEach((c, i) => c.set(1, mixc(CCOLD[i], CWARM[i], q[i]), lerp(.95, KF[i], q[i]), lerp(.06, LIT[i], q[i]) + .15 * LIT[i] * full, i < 3 ? 1 : lerp(1, .8, q[i])));
    src.userData.set(lerp(.05, .8, ss(seg(t, V - .3, V + .2))) + .15 * full);
    // the warmth goes back to front with the light: far, mid, summit, ledge; the front rock stays dark (umber, never orange)
    const wp = [0, q[3] * .6, q[2], q[1], q[0]];
    P.paint(PAL.violet, PAL.warm, wp, [.9, lerp(.7, .8, q[3]), lerp(.6, .55, q[2]), lerp(.7, .8, q[1]), lerp(.7, .9, q[0])]);
    P.sky(.6, .6 * q[0], .8);
    setL(S, 0, TOP + .07, lerp(.05, .1, all), lerp(.3, 1.8, all), '#fff0d0'); S.U.uFloor.value = lerp(.2, .06, all);
    S.key.color.copy(col3('#d8c8d8').lerp(col3('#ffe8c8'), all)); S.amb.color.copy(col3('#7a6c88').lerp(col3('#b8a080'), all));
    C3.J.cal(1, .5 * (1 - q[1])); C3.J.lit(0); C3.Mo.fade(1 - q[1]); C3.El.fade(1 - q[1]); C3.Mo.lit(0); C3.El.lit(0);
    C3.J.g.visible = C3.Mo.g.visible = C3.El.g.visible = q[1] < .99;
    D.forEach(Dd => Dd.lit(.3 + .6 * all));
    // Clawd: completely still, eyes open, no arms, his glow at the minimum
    C.set({ x: ROCK_L[0], y: ROCK_L[1], look: .4, blink: 1, k: 1 });
    bnd(.85 * all);
    this._f = fsOf(S, LZ); this._w = all;
  }, post() { return { focus: this._f, aper: 5, maxCoc: 4, bloom: blo(lerp(.38, .18, this._w), lerp(1.0, 1.3, this._w)) }; }, grade() { return warmGrade(this._w, { vig: lerp(.5, .45, this._w), expo: lerp(1, .86, this._w) }); } };
}

// S8 «Cayeron sobre sus rostros, con gran temor»: side view, a little from above. The three fall on their faces (a gather, then the fall), one after
// the other; the light of the cloud goes out to a grey violet. A short tilt down. Silence 2: they lie still, the dark cloud still; only room tone.
export function S8(E) {
  const { H } = E;
  const S = stage({ light: [0, TOP + .06, -.25], lightR: .2, lightCol: '#fff0d0', key: .8, keyCol: '#ffe8c8', amb: .3, ambCol: '#b8a080', floor: .22 });
  const P = peak(S);
  const Cl = clouds(S);
  const KX = [.03, -.003, -.034], hs = [.066, .062, .06];
  const K = KX.map((x, i) => { const A = human(S.U, { h: hs[i], z: LZ + i * .003, pose: 'kneel', col: SIL, rim: .5, edge: '#ffe2a8' }); S.scene.add(A.g); return A; });
  const B = KX.map((x, i) => { const A = human(S.U, { h: hs[i], z: LZ + i * .003, pose: 'bow', col: SIL, rim: .5, edge: '#ffe2a8', noArm: true }); S.scene.add(A.g); A.g.visible = false; return A; });
  const C = clawd(S.U, { u: .0018, z: ROCK_L[2], glow: .2 }); S.scene.add(C.g);
  const bnd = band(S);
  const F = H.temor + .25, S2 = H.silencio2;
  return { S, update(t) {
    const tl = eio(seg(t, E.T0, F + 1.4)), still = ss(seg(t, S2 - .1, S2 + .3));
    const z = .5, d = z - LZ, cx = -.012, cy = camY(LEDGE, .66, d) + lerp(.03, .018, tl);
    aim(S.cam, [cx, cy, z, cx, cy - lerp(.012, .03, tl), LZ], t, { hand: lerp(.0003, .00003, still) });
    const out = lerp(.4, 1, ss(seg(t, E.T0, F + 1.4)));
    Cl.forEach((c, i) => c.set(1, mixc(CWARM[i], CGREY[i], out), lerp(1.3, .75, out), lerp(1.4, .05, out)));
    P.paint(PAL.warm, PAL.grey, [out, out, out, out, out], [.9, lerp(1, .7, out), lerp(1, .6, out), lerp(1, .6, out), lerp(1, .6, out)]); P.sky(.5, lerp(1, 0, out), lerp(1.1, .4, out));
    setL(S, 0, TOP + .06, .2, lerp(1.4, .08, out), mixc('#fff0d0', '#9a90c0', out));
    S.key.intensity = lerp(.8, .5, out); S.key.color.copy(col3('#ffe8c8').lerp(col3('#9c94c8'), out)); S.amb.color.copy(col3('#b8a080').lerp(col3('#4e4878'), out)); S.amb.intensity = lerp(.3, .22, out);
    K.forEach((A, i) => { A.set({ x: KX[i], y: LEDGE + .001, a: .4 }); B[i].set({ x: KX[i] - .004, y: LEDGE + .001 }); fall(A, B[i], t, F + i * .18); A.lit(lerp(.7, .15, out)); B[i].lit(lerp(.7, .15, out)); });
    C.set({ x: -.062, y: ROCK_L[1], look: .5, blink: 1, k: .9 });
    bnd(.5 * (1 - out));
    this._f = fsOf(S, LZ); this._o = out;
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(.36, 1.0) }; }, grade() { return warmGrade(lerp(.9, 0, this._o), { vig: lerp(.45, .62, this._o) }); } };
}

// S9 «Pero Jesús se acercó, los tocó: Levantaos, no temáis»: closer. Jesús comes in from the right (a simple silhouette, no glow, a warm edge), bends and
// lays his hand on Pedro's shoulder on «los tocó»; Pedro lifts his head. Rack focus from the hand to Pedro. Clawd small at the left edge, out of focus.
export function S9(E) {
  const { H } = E;
  const S = stage({ light: [.12, TOP + .02, -.3], lightR: .2, lightCol: '#ffd9a0', key: .6, keyCol: '#9c94c8', amb: .24, ambCol: '#4e4878', floor: .2 });
  const P = peak(S);
  const Cl = clouds(S);
  const PX = .012, hs = [.066, .062, .06], BX = [PX, -.02, -.046];
  const B = BX.map((x, i) => { const A = human(S.U, { h: hs[i], z: LZ + i * .004, pose: 'bow', col: SIL, rim: .5, edge: '#ffd9a0', noArm: true }); S.scene.add(A.g); return A; });
  const Pk = human(S.U, { h: hs[0], z: LZ, pose: 'kneel', col: SIL, rim: .5, edge: '#ffd9a0' }); S.scene.add(Pk.g); Pk.g.visible = false;
  const J = human(S.U, { h: .08, z: LZ + .008, pose: 'stand', col: SIL, rim: .6, edge: '#ffd9a0' }); S.scene.add(J.g);
  const C = clawd(S.U, { u: .0017, z: ROCK_L[2], glow: .4 }); S.scene.add(C.g);
  const T0 = E.T0, TO = H.toca, LV = H.levantaos;
  return { S, update(t) {
    const k = eio(seg(t, T0, T0 + E.dur)), z = lerp(.56, .54, k), d = z - LZ, cx = -.008, cy = camY(LEDGE, .64, d);
    aim(S.cam, [cx, cy, z, cx, cy + .002, LZ], t, { hand: lerp(.00004, .0003, ss(seg(t, T0 + .3, T0 + .8))) });
    const warm = ss(seg(t, T0 + .4, TO + 1));
    Cl.forEach((c, i) => c.set(i < 2 ? 1 : 0, mixc(CGREY[i], CCOLD[i], warm * .6), lerp(.7, .85, warm), .05 + .2 * warm));
    P.paint(PAL.grey, PAL.warm, [warm * .3, warm * .3, warm * .35, warm * .3, warm * .3], [.9, .75, .7, .65, .6]); P.sky(.5, .1 * warm, .5);
    setL(S, .12, TOP + .02, .2, lerp(.2, .9, warm), '#ffd9a0');
    // Jesús comes in from the right, slows, bends, hand to the shoulder on «los tocó»
    const w = eo(seg(t, T0 + .25, TO - .35)), x = lerp(.1, .046, w), walking = w > 0 && w < .97, bend = eio(seg(t, TO - .55, TO - .05)), straighten = ss(seg(t, LV + .3, LV + 1.1));
    J.set({ x, y: LEDGE + .001 + (walking ? Math.abs(Math.sin(t * 8)) * .0006 : 0), rot: .2 * bend * (1 - .5 * straighten), a: walking ? Math.sin(t * 8) * .25 + .1 : lerp(.1, 1.15, bend) * (1 - .55 * straighten) });
    flip(J); J.lit(lerp(.6, 1.2, warm));
    B.forEach((A, i) => { A.set({ x: BX[i], y: LEDGE + .001 }); A.lit(.35 + .4 * warm); });
    Pk.set({ x: PX + .002, y: LEDGE + .001, a: .3, rot: -.05 }); Pk.lit(.4 + .5 * warm);
    rise(B[0], Pk, t, TO + .15);
    C.set({ x: ROCK_L[0] + .004, y: ROCK_L[1], look: .9, blink: slowBlink(t, 4.2, 1.1), k: .7 });
    this._f = lerp(fsOf(S, LZ + .008), fsOf(S, LZ), ss(seg(t, TO, TO + .7)));
    this._w = warm;
  }, post() { return { focus: this._f, aper: 10, maxCoc: 9, bloom: blo(.36, 1.0) }; }, grade() { return warmGrade(.3 + .4 * this._w, { vig: .55 }); } };
}

// S10 «Y a nadie vieron, sino a Jesús solo»: the four sheets of cloud go up one by one, front to back, and show the summit: nobody else. No Moisés,
// no Elías, no tents. The sky is gold, a dawn. Tilt up after the last sheet, and back down to the one figure. Clawd low on the left follows the cloud up.
export function S10(E) {
  const S = stage({ light: [0, TOP + .06, -.6], lightR: .35, lightCol: '#ffd88f', key: 1.25, keyCol: '#ffe8c8', amb: .42, ambCol: '#c8a07a', floor: .4 });
  const P = peak(S);
  const J = human(S.U, { h: .082, z: TZ, pose: 'front', col: SILW, rim: .7, edge: '#ffd9a0', noArm: true }); S.scene.add(J.g); J.set({ x: 0, y: TOP });
  const D = backTrio(S, SILW, 'backkneel', undefined, DXL);
  const Cl = clouds(S);
  const C = clawd(S.U, { u: .002, z: ROCK_L[2], glow: .45 }); S.scene.add(C.g);
  const bnd = band(S);
  const T0 = E.T0, upAt = i => T0 + .1 + (3 - i) * .42;
  return { S, update(t) {
    const tu = eio(seg(t, upAt(0) - .1, upAt(0) + .9)), back = eio(seg(t, upAt(0) + .9, T0 + E.dur + .1));
    sumCam(S, t, { z: lerp(.66, .7, tu), cx: 0, dy: .002, up: .012 });
    const u = Cl.map((c, i) => eio(seg(t, upAt(i), upAt(i) + 1.0)));
    Cl.forEach((c, i) => c.set(1 - u[i], mixc(CCOLD[i], CWARM[i], .55 + .45 * u[i]), lerp(.9, 1.2, u[i]), .3 + .6 * u[i], 1 - .4 * u[i]));
    const open = u[1];
    P.paint(PAL.dawn, PAL.dawn, [0, 0, 0, 0, 0], [1, lerp(.7, 1, open), lerp(.6, 1, open), lerp(.6, 1, u[0]), lerp(.6, 1, u[0])]);
    P.sky(.4, lerp(.5, 1, u[0]), lerp(.9, 1.15, u[0]));
    setL(S, 0, TOP + .06, .35, lerp(.5, 1.1, open), '#ffd88f');
    J.lit(lerp(.5, 1.2, open)); D.forEach(A => A.lit(.6));
    const lk = ss(seg(t, upAt(0), upAt(0) + .8)), down = ss(seg(t, upAt(0) + 1.0, upAt(0) + 1.6));
    C.set({ x: ROCK_L[0], y: ROCK_L[1], look: lerp(.3, .5, down), rot: lerp(0, -.12, lk) * (1 - down), blink: slowBlink(t, 3.9, .7), k: .85 });
    bnd(.6);
    this._f = fsOf(S, -.14);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(.34, 1.05) }; }, grade() { return warmGrade(1); } };
}

// S11 «Bastaba oírlo a él»: the echo of the flash. The framing of S1, in gold: Pedro stands with his back to us, Santiago and Juan at his sides; in front
// of them one figure, Jesús, with no light of his own and the whole sky of light behind him. Clawd on the same rock, his arm down now. The same slow push-in.
export function S11(E) {
  const S = stage({ light: [0, TOP + .06, -.6], lightR: .4, lightCol: '#ffd88f', key: 1.3, keyCol: '#ffe8c8', amb: .45, ambCol: '#c8a07a', floor: .45 });
  const P = peak(S); P.paint(PAL.dawn, PAL.dawn); P.sky(.4, 1, 1.15);
  const J = human(S.U, { h: .082, z: TZ, pose: 'front', col: SILW, rim: .7, edge: '#ffd9a0', noArm: true }); S.scene.add(J.g); J.set({ x: 0, y: TOP });
  const D = backTrio(S, SILW, 'front', [.064, .07, .062]);
  const C = clawd(S.U, { u: .0026, z: ROCK_R[2], glow: .45 }); S.scene.add(C.g);
  const bnd = band(S);
  return { S, update(t) {
    const k = eio(seg(t, E.T0 - .3, E.T0 + E.dur + .3));
    sumCam(S, t, { z: lerp(.7, .64, k), dy: lerp(-.004, .006, k), up: .012 });
    J.lit(1.1); D.forEach((A, i) => { A.set({ x: DX[i], y: LEDGE + .001, a: .05, a2: -.05 }); A.lit(.8); });
    setL(S, 0, TOP + .06, .4, 1.1, '#ffd88f');
    C.set({ x: ROCK_R[0], y: ROCK_R[1], look: -.6, blink: slowBlink(t, 4.2, .2), k: .9 });
    bnd(.6);
    this._f = fsOf(S, -.14);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(.34, 1.05) }; }, grade() { return warmGrade(1); } };
}

// S12 «¿A quién oyes?»: the way down, in gold; the four walk down to the left (the opposite way to the climb). Clawd in front, sitting on a rock,
// watches them go; on the question he turns his head to the camera, slowly, and blinks. A slow pull-out.
export function S12(E) {
  const { H } = E;
  const S = stage({ light: [.3, G + .2, -.7], lightR: .5, lightCol: '#ffd88f', key: 1.3, keyCol: '#ffe8c8', amb: .45, ambCol: '#c8a07a', floor: .45 });
  const Sl = slope(S, 'gold'); Sl.sky.material.color.setScalar(1.12);
  const hs = [.064, .06, .062, .058];
  const W = hs.map(h => { const A = human(S.U, { h, z: -.13, col: SILW, rim: .7, edge: '#ffd9a0' }); S.scene.add(A.g); return A; });
  const rx = .05, ry = yS(rx) - .028;
  lay(S, { w: .06, h: .05, x: rx, y: ry - .025, z: -.064, col: '#1e1208', trans: .03, ppm: 4000, finish: { rim: .5, rimCol: 'rgba(255,236,200,.5)', under: .3 }, draw: c => {
    c.beginPath(); c.moveTo(-.028, -.025); c.quadraticCurveTo(-.027, .015, -.01, .024); c.quadraticCurveTo(.014, .026, .028, .008); c.lineTo(.028, -.025); c.closePath(); c.fill(); } });
  const C = clawd(S.U, { u: .0028, z: -.06, glow: .45 }); S.scene.add(C.g);
  const bnd = band(S);
  const T0 = E.T0, vx = -.012, OFF = [-.036, -.012, .011, .033], Q = H.pregunta;
  return { S, update(t) {
    const p = t - T0, gx = vx * p;
    const k = eio(seg(t, T0, T0 + E.dur)), d = lerp(.6, .68, k), cx = lerp(.004, 0, k), gy = yS(-.01), cy = camY(gy, .55, d);
    aim(S.cam, [cx, cy, -.13 + d, cx, cy + .004, -.13], t, { hand: .0003 });
    W.forEach((A, i) => { const x = gx + OFF[i]; wk(A, x, yS(x), t, i * 1.3, -1); A.lit(.7); });
    const turn = ss(seg(t, Q + .25, Q + 1.0));
    C.set({ x: rx + .002, y: ry - .0012, look: lerp(-.9, 0, turn), blink: t > Q + 1.1 ? blinkAt(t, 2.6, .2) : slowBlink(t, 4.5, .8), k: 1 });
    bnd(.55);
    this._f = lerp(fsOf(S, -.13), fsOf(S, -.06), ss(seg(t, Q, Q + .8)));
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(.34, 1.05) }; }, grade() { return warmGrade(1); } };
}
