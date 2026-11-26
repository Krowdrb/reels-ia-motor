// The twelve shots of "El único que se quedó" (Juan 19:25–27; Mateo 26:56). Each: { S, update(t), post(), grade() }; t in film seconds.
// God is only ever light (the clearness behind the cross, the beam). Jesus on the cross is one far, serene silhouette against the light:
// no wounds, no blood, no detail. María, the women and the disciple are quiet silhouettes. Clawd is the only clay-coloured thing: still, to one side,
// smaller than María, in every shot. Colour: darkness → gold.
import * as THREE from 'three';
import { skyPanel, moon, text } from './paper.js';
import { stage, aim } from './stage.js';
import { mulberry, seg, ss, eio, eo, lerp, clamp, TAU } from './lib.js';
import { mk, cut, tint, clawd, human, waveFill, cross, olive, torch } from './actors.js';

const blo = (s = .34, th = 1.1) => ({ strength: s, radius: .6, threshold: th });
const lay = (S, o) => S.add(mk(S.U, o));
const col3 = c => new THREE.Color(c);
const mixc = (a, b, p) => '#' + col3(a).lerp(col3(b), clamp(p)).getHexString();
const setL = (S, x, y, r, lit, c) => { S.U.uLight.value.x = x; S.U.uLight.value.y = y; S.U.uLightR.value = r; S.U.uLit.value = lit; if (c) S.U.uLightCol.value.copy(c); };
const fsOf = (S, z) => S.cam.position.z - z;
const blinkAt = (t, per = 3.3, ph = 0) => 1 - .9 * Math.max(0, 1 - Math.abs(((t + ph) % per) - .1) / .1);
const slowBlink = (t, per = 4.2, ph = 0) => 1 - .92 * Math.max(0, 1 - Math.abs(((t + ph) % per) - .18) / .18);
// camera height that puts world height gy at fraction f of the frame from the top, for a level camera at distance d
const camY = (gy, f, d) => gy - (.5 - f) * .4617 * d;
const flip = A => { A.g.scale.x = -Math.abs(A.g.scale.x); };
const backTo = (C, on) => { C.eyeL.visible = C.eyeR.visible = !on; };   // Clawd seen from behind: no eyes
const ei2 = t => t * t;
const G = -.06;                       // ground line where the figures stand
const CZ = -.24, CH = .062, CY0 = .018, CC = CY0 + CH * .74;   // the cross: depth, height, foot, centre of the light behind it
const FIG = '#06060e', COLD = '#dfe3ff', GOLDE = '#ffd27a';
export { G, camY, CZ, CC };

// a ground sheet whose top is a soft wave at world height `base`
const ground = (S, z, col, base, amp, len, ph, tr = .08, o = {}) => { const w = o.w || 1.2, ox = o.x || 0; return lay(S, { w, h: .5, x: ox, y: -.2, z, col, trans: tr, ppm: o.ppm || Math.min(2400, 4000 / w), finish: { rim: o.rim ?? .45 }, draw: x => { x.translate(-ox, .2); waveFill(x, { x0: ox - w / 2, x1: ox + w / 2, base, amp, len, ph, peak: o.peak ?? 1.3 }); } }); };
// soft radial glow (halo behind the cross, pools of light)
export function glow(w, h, col = '#ffd79a', pw = 2) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.ShaderMaterial({
    uniforms: { col: { value: new THREE.Color(col) }, k: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: `varying vec2 vUv; uniform vec3 col; uniform float k; void main(){ float a = pow(max(0., 1. - length((vUv - .5) * 2.)), ${pw.toFixed(1)}); gl_FragColor = vec4(col * a * k, 1.); }`,
  }));
  m.renderOrder = 10; m.userData.set = k => { m.material.uniforms.k.value = k; }; return m;
}
// a shaft of light falling from an apex at the top centre of the plane, widening downward (analytic, no texture). One per paper layer.
function shaft(w, h, col = '#ffd79a', spread = .32) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.ShaderMaterial({
    uniforms: { col: { value: new THREE.Color(col) }, k: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: `varying vec2 vUv; uniform vec3 col; uniform float k; void main(){
      float dy = 1. - vUv.y, dx = (vUv.x - .5) * ${(w / h).toFixed(4)};
      float wd = dy * ${spread.toFixed(3)} + .006; float a = exp(-dx*dx/(wd*wd)) * smoothstep(0., .04, dy) * (1. - smoothstep(.55, 1., dy));
      float core = exp(-dx*dx/(wd*wd*.12)) * .6;
      gl_FragColor = vec4(col * (a + core * a) * k, 1.); }`,
  }));
  m.renderOrder = 11; m.userData.set = k => { m.material.uniforms.k.value = k; }; return m;
}

// —— Golgotha: sky of darkness (and a gold one that fades in over it), the clearness behind the cross, the far hill with the cross,
//    two pairs of dark crests with the far crowd (left/right halves, so they can part like a paper curtain), the ground, the dark front ——
const DARK = { far: '#4a4d6e', cB: '#2a2c48', cF: '#1a1b30', ground: '#20223a', front: '#08080f', rock: '#121324' };
const GOLD = { far: '#ffe2a0', cB: '#e0b36a', cF: '#8a6236', ground: '#24170b', front: '#070402', rock: '#4a321a' };
export function golgotha(S, o = {}) {
  const skyD = skyPanel({ w: 2.6, h: 1.9, y: .05, z: -.42, stops: [[0, '#06061a'], [.32, '#0e0f26'], [.46, '#1a1b38'], [.53, '#2a2c4c'], [.6, '#1c1d36'], [1, '#09091a']] }); S.add(skyD);
  const skyG = skyPanel({ w: 2.6, h: 1.9, y: .05, z: -.415, stops: [[0, '#3a2636'], [.3, '#8a5a4a'], [.45, '#e0a060'], [.52, '#ffe0a0'], [.6, '#f2c27a'], [1, '#a8703c']] });
  skyG.material.transparent = true; skyG.material.opacity = 0; skyG.visible = false; S.add(skyG);
  const halo = glow(.36, .36, '#c9cbe0', 2.2); halo.position.set(0, CC, -.3); S.add(halo);
  const top = u => -.03 + (CY0 + .03) * Math.exp(-Math.pow(u / .1, 2)) + .0018 * Math.sin(u * 140) + .001 * Math.sin(u * 377);
  const far = lay(S, { w: 1.4, h: .4, y: -.17, z: -.245, col: DARK.far, trans: .55, ppm: 2000, finish: { rim: .5, rimCol: 'rgba(214,218,255,.5)' }, draw: x => {
    x.translate(0, .17); x.beginPath(); x.moveTo(-.7, -.2); for (let u = -.7; u <= .7; u += .002) x.lineTo(u, top(u)); x.lineTo(.7, -.2); x.closePath(); x.fill();
  } });
  const cr = cross(S.U, { ch: CH, z: CZ }); cr.position.y += CY0 - .0012; S.add(cr);
  // a crest half: side -1 = left, +1 = right; its inner end slopes down toward the cross; tiny far figures stand on it
  const crest = (side, z, col, base, figs, fh, seed) => {
    const Q = mulberry(seed), w = .7, cx0 = side * (w / 2 - .02);
    const tp = u => { const d = side * u; return base + .006 * Math.sin(u * 60 + seed) + .003 * Math.sin(u * 170) - .05 * Math.pow(clamp((.03 - d) / .06), 1.6); };
    return lay(S, { w, h: .3, x: cx0, y: base - .1, z, col, trans: .12, ppm: 2400, finish: { rim: .45, rimCol: 'rgba(214,218,255,.4)' }, draw: x => {
      x.translate(-cx0, -(base - .1));
      x.beginPath(); x.moveTo(cx0 - w / 2, base - .25); for (let u = cx0 - w / 2; u <= cx0 + w / 2; u += .0015) x.lineTo(u, tp(u)); x.lineTo(cx0 + w / 2, base - .25); x.closePath(); x.fill();
      for (let i = 0; i < figs; i++) {   // the far crowd: no faces, only shapes
        const fx = side * (.042 + i * (.012 + Q() * .01)), fy = tp(fx) - .001, h = fh * (.85 + Q() * .3);
        x.beginPath(); x.moveTo(fx - h * .17, fy); x.quadraticCurveTo(fx - h * .2, fy + h * .6, fx - h * .08, fy + h * .78); x.lineTo(fx + h * .08, fy + h * .78); x.quadraticCurveTo(fx + h * .2, fy + h * .6, fx + h * .17, fy); x.closePath(); x.fill();
        x.beginPath(); x.arc(fx, fy + h * .88, h * .1, 0, TAU); x.fill();
      }
    } });
  };
  const cB = [crest(-1, -.19, DARK.cB, -.008, 9, .014, 3), crest(1, -.1895, DARK.cB, -.01, 9, .014, 7)];
  const cF = [crest(-1, -.145, DARK.cF, -.03, 6, .019, 11), crest(1, -.1445, DARK.cF, -.032, 6, .019, 13)];
  const gr = ground(S, -.1, DARK.ground, G + .0015, .0012, .2, 2.2, .06, { rim: .3 });
  const rocks = [];
  const rock = (x0, w = .034, hh = .006, z = -.0595) => { const m = lay(S, { w: w * 1.1, h: .04, x: x0, y: G - .02 + hh / 2, z, col: DARK.rock, trans: .03, ppm: 3600, finish: { rim: .45, rimCol: 'rgba(214,218,255,.4)' }, draw: x => {
    x.translate(0, -(-.02 + hh / 2)); x.beginPath(); x.moveTo(-w / 2, -.02); x.quadraticCurveTo(-w * .48, hh * .9, -w * .2, hh); x.quadraticCurveTo(w * .1, hh * 1.15, w * .3, hh * .85); x.quadraticCurveTo(w * .5, hh * .4, w / 2, -.02); x.closePath(); x.fill();
  } }); rocks.push(m); return m; };
  const front = ground(S, -.04, DARK.front, G - .016, .004, .14, .4, .02, { w: 1.4, peak: 2, rim: .22 });
  const shafts = [-.235, -.19, -.15, -.11, -.096].map(z => { const m = shaft(.5, .6, '#ffd79a'); m.position.set(0, CC + .01 - .3, z); S.add(m); return m; });
  const L = [far, cB[0], cB[1], cF[0], cF[1], gr, front];
  const key = ['far', 'cB', 'cB', 'cF', 'cF', 'ground', 'front'], idx = [0, 1, 1, 2, 2, 3, 4];
  // light(p, k): p = warmth 0..1 and k = brightness for each of [far, crests back, crests front, ground, front] (back to front)
  const light = (p, k = [1, 1, 1, 1, 1]) => {
    L.forEach((m, i) => { const q = p[idx[i]] ?? 0; tint(m, mixc(DARK[key[i]], GOLD[key[i]], q), lerp(.06, 1, k[idx[i]] ?? 1) * (1 + q * (i === 0 ? .25 : .1))); });
    rocks.forEach(m => tint(m, mixc(DARK.rock, GOLD.rock, p[3] ?? 0), lerp(.06, 1, k[3] ?? 1)));
  };
  for (const m of [...cB, ...cF]) m.userData.x0 = m.position.x;
  const part = (b, f) => { cB[0].position.x = cB[0].userData.x0 - b; cB[1].position.x = cB[1].userData.x0 + b; cF[0].position.x = cF[0].userData.x0 - f; cF[1].position.x = cF[1].userData.x0 + f; };
  const sky = (gold, dark = 1) => { skyD.material.color.setScalar(dark); skyG.visible = gold > .002; skyG.material.opacity = gold; };
  return { skyD, skyG, halo, far, cross: cr, cB, cF, ground: gr, front, rock, rocks, shafts, light, part, sky };
}

// the paper title strip (only at the start), held in front of the camera
function titleStrip(S, T) {
  const W = .124, Hh = .068;
  const m = lay(S, { w: W, h: Hh, y: .088, z: -.03, col: '#e7d4a8', trans: .35, shadow: false, recv: false, ppm: 9000, finish: { rim: .3, under: .2 }, draw: x => {
    x.beginPath(); x.roundRect(-W / 2 + .001, -Hh / 2 + .001, W - .002, Hh - .002, .002); x.fill();
    cut(x, () => {
      text(x, 'EL ÚNICO', 0, .0175, .0142, 'Cinzel', { weight: 800, fill: '#000' });
      text(x, 'QUE SE QUEDÓ', 0, -.0007, .0128, 'Cinzel', { weight: 800, fill: '#000' });
      text(x, 'Juan 19:25–27', 0, -.0195, .0096, 'Playfair', { weight: 'italic 500', fill: '#000' });
    });
  }, glowDraw: x => { x.fillStyle = '#fff'; x.fillRect(-W / 2, -Hh / 2, W, Hh); }, glow: .55, glowCol: '#e7d4a8', glowRes: .2 });
  m.material.userData.u.uClip.value.set(0, .088, 0, 0);
  return (t, S) => {
    const reveal = ss(seg(t, T.in, T.in + .5)) * (1 - ss(seg(t, T.out - .4, T.out)));
    const cz = S.cam.position.z + .03, ts = cz / .55; m.scale.setScalar(ts); m.position.x = S.cam.position.x; m.position.y = S.cam.position.y + .4617 * cz / 2 * .64;
    m.material.userData.u.uClip.value.set(m.position.x, m.position.y, .09 * reveal * ts, 0); m.visible = reveal > .002;
  };
}

// the people at the foot of the cross. María: veiled, at x MX, facing the gap at her side. The disciple: behind her at first.
const MX = -.012, DX0 = .03, DZ0 = -.135, DX1 = .015, DZ1 = -.088, CLX = .053;
function people(S, o = {}) {
  const M = human(S.U, { h: .082, z: -.085, pose: 'veiled', col: FIG, rim: .45, edge: o.edge || COLD }); S.scene.add(M.g);
  const D = human(S.U, { h: .084, z: o.dz ?? DZ0, col: FIG, rim: .4, edge: o.edge || COLD }); S.scene.add(D.g);
  for (const A of [M, D]) A.g.traverse(m => { if (m.material?.userData?.u && m !== A.rimM) m.material.userData.u.uBeamK.value = .12; });   // the beam gilds their edges, not their bodies
  return { M, D };
}
const darkStage = (o = {}) => stage({ light: [0, CC, CZ], lightR: o.lightR ?? .08, lightCol: o.lightCol || '#c9cbe0', key: o.key ?? 1.0, keyCol: o.keyCol || '#c8ccf0', amb: o.amb ?? .34, ambCol: o.ambCol || '#6a70a8', floor: o.floor ?? .22 });

// S1 at the foot of the cross: the cross far and high against a pale clearness; María in front; a dark gap at her side; Clawd on a rock. Push-in. Title.
export function S1(E) {
  const S = darkStage();
  const Gg = golgotha(S); Gg.rock(CLX + .002); Gg.light([0, 0, 0, 0, 0]);
  const { M, D } = people(S);
  const C = clawd(S.U, { u: .0022, z: -.058, glow: .4 }); S.scene.add(C.g);
  const title = titleStrip(S, { in: .3, out: 3.3 });
  return { S, update(t) {
    const k = eio(seg(t, 0, E.T0 + E.dur + .6)), d = lerp(.76, .67, k), cx = .012, cy = camY(G, .69, d);
    aim(S.cam, [cx, cy, -.085 + d, cx, cy, -.085], t, { hand: .0003 });
    Gg.halo.userData.set(.55 + .05 * Math.sin(t * 1.3)); Gg.sky(0);
    M.set({ x: MX, y: G, a: .12 }); M.lit(.25);
    D.set({ x: DX0, y: G, a: .1 }); D.lit(0);
    C.set({ x: CLX, y: G + .0055, look: -.35, blink: slowBlink(t, 4.4, 1.2), k: .8 });
    title(t, S);
    this._f = fsOf(S, -.085);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 6, bloom: blo(.34, 1.0) }; }, grade() { return { vig: .5, sat: .95 }; } };
}

// S2 "uno": rack focus from María (front) to the one man standing in the layer behind her; his edge lights on "uno"
export function S2(E) {
  const { H } = E;
  const S = darkStage();
  const Gg = golgotha(S); Gg.rock(CLX + .002); Gg.light([0, 0, 0, 0, 0]);
  const { M, D } = people(S);
  const C = clawd(S.U, { u: .0022, z: -.058, glow: .4 }); S.scene.add(C.g);
  return { S, update(t) {
    const k = eio(seg(t, E.T0, E.T0 + E.dur + .6)), d = lerp(.6, .56, k), cx = .016, cy = camY(G, .66, d);
    aim(S.cam, [cx, cy, -.09 + d, cx, cy, -.09], t, { hand: .0003 });
    Gg.halo.userData.set(.55 + .05 * Math.sin(t * 1.3)); Gg.sky(0);
    const r = ss(seg(t, H.uno - .45, H.uno + .35)), on = ss(seg(t, H.uno - .1, H.uno + .45));
    M.set({ x: MX, y: G, a: .12 }); M.lit(.25);
    D.set({ x: DX0, y: G, a: .1 }); D.lit(on * 1.1);
    C.set({ x: CLX, y: G + .0055, look: lerp(-.3, -.9, on), blink: slowBlink(t, 4.4, 1.2), k: .8 });
    this._f = lerp(fsOf(S, -.085), fsOf(S, DZ0), r);
  }, post() { return { focus: this._f, aper: 12, maxCoc: 9, bloom: blo(.36, 1.0) }; }, grade() { return { vig: .52, sat: .95 }; } };
}

// S3 Clawd to one side: his closest shot. Seated on a rock at the left; María and the disciple out of focus behind; slow lateral move to the left
export function S3(E) {
  const S = darkStage({ key: 1.05 });
  const Gg = golgotha(S);
  const CXc = -.026, CZc = -.05;
  Gg.rock(CXc + .002, .044, .008, CZc - .0015); Gg.light([0, 0, 0, 0, 0]);
  const M = human(S.U, { h: .082, z: -.104, pose: 'veiled', col: FIG, rim: .45, edge: COLD }); S.scene.add(M.g);
  const D = human(S.U, { h: .084, z: -.112, col: FIG, rim: .4, edge: COLD }); S.scene.add(D.g);
  const C = clawd(S.U, { u: .0026, z: CZc, glow: .35 }); S.scene.add(C.g);
  return { S, update(t) {
    const k = eio(seg(t, E.T0 - .6, E.T0 + E.dur + .6)), d = lerp(.5, .48, k), cx = lerp(.006, -.004, k), cy = camY(G, .67, d);
    aim(S.cam, [cx, cy, CZc + d, cx, cy, CZc], t, { hand: .00025 });
    Gg.halo.userData.set(.55 + .05 * Math.sin(t * 1.3)); Gg.sky(0);
    M.set({ x: .016, y: G, a: .12 }); M.lit(.3); D.set({ x: .044, y: G, a: .1 }); D.lit(.7);
    C.set({ x: CXc, y: G + .0075, aL: .3, aR: .3, look: .55, blink: slowBlink(t, 3.8, .4), k: .85 });
    this._f = fsOf(S, CZc);
  }, post() { return { focus: this._f, aper: 11, maxCoc: 9, bloom: blo(.32, 1.05) }; }, grade() { return { vig: .5, sat: .95 }; } };
}

// S4 memory: an olive branch sweeps the frame and leaves Gethsemane at night. On "huyeron" the silhouettes slide out of the sheet to the left,
// one after another; one figure stays, still, facing the torches. Silence 1: the lamp goes out, layer by layer, front to back; an ember stays.
export function S4(E) {
  const { H } = E;
  const S = stage({ light: [-.035, .06, -.15], lightR: .2, lightCol: '#a8bce8', key: 1.25, keyCol: '#b8c8f0', amb: .5, ambCol: '#6a80c0', floor: .4 });
  const sky = skyPanel({ w: 1.6, h: 1.2, y: .05, z: -.22, stops: [[0, '#060c1e'], [.36, '#14234a'], [.5, '#2a4170'], [.56, '#34507e'], [1, '#08101e']], stars: 120, starMinY: .02 }); S.add(sky);
  const mo = moon({ r: .011, x: -.035, y: .085, z: -.2, gain: 1.6, core: '#f4f6ff', mid: '#e0e6f8', edge: '#c8d2ee', halo: 7, haloGain: .3, haloCol: '#a8bce8' }); S.scene.add(mo);
  const L = [];   // [mesh, colour, group] group: 0 front … 4 back (the lamp goes out in that order)
  const trees = (z, col, tr, xs, h, seed, gi) => xs.forEach((x, i) => { const m = olive(S.U, { h: h * (.9 + (i % 3) * .08), z: z - i * .0003, col, trans: tr, seed: seed + i, lean: (i % 2 ? .3 : -.25) }); m.position.x = x; m.position.y += G + .004; S.add(m); L.push([m, col, gi]); });
  trees(-.16, '#3d5582', .5, [-.15, -.09, -.03, .03, .1, .16], .1, 3, 4);
  L.push([ground(S, -.14, '#4a6596', G + .022, .005, .2, 1.3, .45), '#4a6596', 3]);
  trees(-.125, '#22355a', .25, [-.13, .085, .14], .12, 11, 3);
  L.push([ground(S, -.1, '#16243f', G + .001, .0015, .2, 2.4, .08, { rim: .3 }), '#16243f', 2]);
  const trunk = olive(S.U, { h: .13, z: -.072, col: '#0d1628', trans: .06, seed: 21, lean: .2 }); trunk.position.x = -.064; trunk.position.y += G - .004; S.add(trunk); L.push([trunk, '#0d1628', 1]);
  L.push([ground(S, -.04, '#060a14', G - .024, .004, .14, .4, .02, { w: 1.4, peak: 2, rim: .2 }), '#060a14', 0]);
  // the branch that sweeps across at the cut (curtain)
  const branch = lay(S, { w: .2, h: .32, z: -.02, col: '#050912', trans: .05, ppm: 2200, finish: { rim: .4 }, draw: x => {
    const Q = mulberry(4); x.lineWidth = .006; x.lineCap = 'round'; x.beginPath(); x.moveTo(-.09, -.16); x.quadraticCurveTo(.0, .0, .06, .16); x.stroke();
    for (let i = 0; i < 70; i++) { const p = Q(), bx = lerp(-.09, .06, p) + (Q() - .5) * .14, by = lerp(-.16, .16, p) + (Q() - .5) * .06; x.beginPath(); x.ellipse(bx, by, .026, .009, Q() * 3, 0, TAU); x.fill(); }
  } });
  // the disciples: eleven silhouettes; the figure that stays
  const R = mulberry(8), dis = [];
  for (let i = 0; i < 11; i++) { const h = .062 + R() * .012, z = -.09 - (i % 3) * .004, A = human(S.U, { h, z, col: '#070d1e', rim: .75, edge: '#9fb4ea' }); S.scene.add(A.g); A.lit(.55); dis.push({ A, x0: -.055 + i * .0075 + (R() - .5) * .004, ph: R() * 6, d: i * .09 + R() * .05 }); }
  const Je = human(S.U, { h: .082, z: -.094, col: '#04070f', rim: .55, edge: '#cfd8ff' }); S.scene.add(Je.g);
  const holders = [0, 1, 2].map(i => { const A = human(S.U, { h: .072, z: -.104 - i * .004, col: '#03050c', rim: .5 }); S.scene.add(A.g); const T = torch(S.U, { s: .016, z: .0008 }); A.arm.add(T.g); T.g.position.set(0, -.072 * .37, 0); return { A, T }; });
  const C = clawd(S.U, { u: .0018, z: -.068, glow: .35 }); S.scene.add(C.g);
  const ember = lay(S, { w: .004, h: .004, x: .07, y: G + .045, z: -.1, col: '#1a0c04', trans: 0, shadow: false, recv: false, finish: { rim: 0, under: 0 }, draw: c => { c.beginPath(); c.arc(0, 0, .0012, 0, TAU); c.fill(); }, glowDraw: c => { c.fillStyle = '#fff'; c.beginPath(); c.arc(0, 0, .0013, 0, TAU); c.fill(); }, glow: 4, glowCol: '#ff8a3a' });
  const tglow = glow(.12, .1, '#ffb862', 1.6); tglow.position.set(.09, G + .03, -.098); S.add(tglow);
  return { S, update(t) {
    const d = .6, cx = .0, cy = camY(G, .68, d);
    aim(S.cam, [cx, cy, -.09 + d, cx, cy, -.09], t, { hand: .0002 });
    const sw = seg(t, E.T0, E.T0 + .8); branch.position.set(lerp(.02, -.26, eio(sw)), G + .2, -.02); branch.visible = sw < 1;
    // the lamp goes out: front layers first, then back (silence 1)
    const S1t = H.silencio1, out = i => ss(seg(t, S1t - .1 + i * .2, S1t + .5 + i * .2));
    const fo = [out(0), out(1), out(2), out(3), out(4)];
    for (const [m, c, gi] of L) tint(m, c, 1 - .96 * fo[gi]);
    sky.material.color.setScalar(1 - .94 * fo[4]);
    S.key.intensity = 1.25 * (1 - .95 * fo[2]); S.amb.intensity = .5 * (1 - .9 * fo[3]); setL(S, -.035, .06, .2, 1 - .95 * fo[4]); mo.userData.disc.material.color.setScalar(1.6 * (1 - .9 * fo[4])); mo.userData.halo.material.color.set('#a8bce8').multiplyScalar(.3 * (1 - fo[4]));
    // the flight on "huyeron": each slides out to the left, leaning forward, staggered
    const F = H.huyeron;
    dis.forEach(({ A, x0, ph, d: dl }) => {
      const p = seg(t, F + dl, F + dl + 1.0), x = x0 - .32 * ei2(p);
      A.set({ x, y: G + (p > 0 ? Math.abs(Math.sin(t * 13 + ph)) * .0012 : 0), rot: p > 0 ? .16 : 0, a: p > 0 ? Math.sin(t * 13 + ph) * .7 : .15 + .05 * Math.sin(t + ph) });
      if (p > 0 || ph > 3) flip(A); A.g.visible = x > -.2;
    });
    Je.set({ x: .03, y: G, a: .1 }); Je.lit(lerp(.35, .55, ss(seg(t, F, F + 1))) * (1 - fo[3]));
    // the torches come in from the right, slowly; they get near the figure that stays
    holders.forEach(({ A, T }, i) => {
      const x = lerp(.16 + i * .02, .068 + i * .016, eo(seg(t, E.T0 + .3 + i * .25, S1t + .6)));
      const a = 2.1 + Math.sin(t * 2 + i) * .04; A.set({ x, y: G, a }); flip(A); T.g.rotation.z = -a;
      T.light((.85 + .15 * Math.sin(t * 23 + i * 5) * Math.sin(t * 7 + i)) * (1 - fo[1]));
    });
    tglow.position.x = holders[0].A.g.position.x + .01; tglow.userData.set(.35 * (1 - fo[1]));
    ember.material.userData.u.uGlowLit.value = fo[1] * (1 - fo[4] * .4) * (.8 + .2 * Math.sin(t * 5)); ember.visible = fo[1] > .01; ember.position.x = holders[0].A.g.position.x - .02;
    // Clawd: by the trunk, he turns his head as they pass; he stays in the dark with a faint glow
    const look = lerp(.2, -1, ss(seg(t, F + .1, F + .9)));
    C.set({ x: -.04, y: G - .0005, look, blink: slowBlink(t, 4, .3), k: lerp(.8, .22, fo[2]) });
    this._f = fsOf(S, -.09); this._o = fo[4];
  }, post() { return { focus: this._f, aper: 7, maxCoc: 6, bloom: blo(.4, .95) }; }, grade() { return { vig: lerp(.5, .65, this._o), sat: .95 }; } };
}

// S5 the light comes back to the cross, back to front: the clearness, the hill, the crests, the ground, María on "su madre". Slow crane down.
export function S5(E) {
  const { H } = E;
  const S = darkStage();
  const Gg = golgotha(S); Gg.rock(CLX + .002);
  const { M, D } = people(S);
  const C = clawd(S.U, { u: .0022, z: -.058, glow: .4 }); S.scene.add(C.g);
  return { S, update(t) {
    const a = E.T0 + .15, on = i => ss(seg(t, a + i * .32, a + .7 + i * .32));
    const ks = [on(0), on(1), on(2), on(3), on(3)];
    Gg.light([0, 0, 0, 0, 0], ks); Gg.halo.userData.set(.58 * on(0)); Gg.sky(0, lerp(.1, 1, on(0)));
    setL(S, 0, CC, .08, on(0)); S.key.intensity = lerp(.06, 1.0, on(3)); S.amb.intensity = lerp(.03, .34, on(2));
    const k = eio(seg(t, E.T0 - .6, E.T0 + E.dur + .6)), d = lerp(.76, .68, k), cx = .01, cy = camY(G, lerp(.72, .68, k), d);
    aim(S.cam, [cx, cy, -.085 + d, cx, cy + lerp(.012, 0, k), -.085], t, { hand: .0003 });
    M.set({ x: MX, y: G, a: .12 }); M.lit(ss(seg(t, H.sumadre - .2, H.sumadre + .4)) * 1.1);
    D.set({ x: DX0, y: G, a: .1 }); D.lit(.5 * on(3));
    C.set({ x: CLX, y: G + .0055, look: -.35, blink: slowBlink(t, 4.4, 1.2), k: lerp(.25, .8, on(3)) });
    this._f = fsOf(S, -.085);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 6, bloom: blo(.34, 1.0) }; }, grade() { return { vig: .5, sat: .95 }; } };
}

// S6 the ones who were there: the veiled women at different depths; each name lights an edge. Lateral tracking with parallax; Clawd in the front layer, out of focus
const WOM = [[-.054, -.094, .079], [-.09, -.1, .081], [-.128, -.106, .078]];
export function S6(E) {
  const { H } = E;
  const S = darkStage({ lightR: .1 });
  const Gg = golgotha(S);
  const { M, D } = people(S);
  const W = WOM.map(([x, z, h]) => { const A = human(S.U, { h, z, pose: 'veiled', col: FIG, rim: .45, edge: COLD }); S.scene.add(A.g); return A; });
  const CXc = -.07, CZc = -.054;
  const C = clawd(S.U, { u: .002, z: CZc, glow: .35 }); S.scene.add(C.g);
  Gg.rock(CXc + .002, .034, .006, CZc - .0015); Gg.light([0, 0, 0, 0, 0]);
  const names = [H.l07 + .15, H.cleofas, H.magdalena];
  return { S, update(t) {
    const k = eio(seg(t, E.T0 - .6, E.T0 + E.dur + .6)), d = .64, cx = lerp(-.04, -.088, k), cy = camY(G, .68, d);
    aim(S.cam, [cx, cy, -.1 + d, cx, cy, -.1], t, { hand: .0003 });
    Gg.halo.userData.set(.58 + .05 * Math.sin(t * 1.3)); Gg.sky(0);
    M.set({ x: MX, y: G, a: .12 }); M.lit(1.1);
    D.set({ x: DX0, y: G, a: .1 }); D.lit(.5);
    W.forEach((A, i) => { A.set({ x: WOM[i][0], y: G, a: .14 + .02 * i }); A.lit(ss(seg(t, names[i] - .15, names[i] + .35)) * 1.1); });
    C.set({ x: CXc, y: G + .0055, look: .6, blink: 1, k: .75 });
    this._f = lerp(fsOf(S, WOM[0][1]), fsOf(S, WOM[2][1]), ss(seg(t, names[0], names[2] + .2)));
  }, post() { return { focus: this._f, aper: 10, maxCoc: 9, bloom: blo(.36, 1.0) }; }, grade() { return { vig: .5, sat: .95 }; } };
}

// S7 "y uno más": the disciple takes one step from his layer and stands beside María; a hand's breadth of darkness still between them. Slow push-in
export function S7(E) {
  const { H } = E;
  const S = darkStage();
  const Gg = golgotha(S); Gg.rock(CLX + .002); Gg.light([0, 0, 0, 0, 0]);
  const { M, D } = people(S);
  const C = clawd(S.U, { u: .002, z: -.058, glow: .4 }); S.scene.add(C.g);
  return { S, update(t) {
    const k = eio(seg(t, E.T0 - .6, E.T0 + E.dur + .6)), d = lerp(.6, .54, k), cx = .014, cy = camY(G, .66, d);
    aim(S.cam, [cx, cy, -.088 + d, cx, cy, -.088], t, { hand: .0003 });
    Gg.halo.userData.set(.58 + .05 * Math.sin(t * 1.3)); Gg.sky(0);
    const st = seg(t, H.paso + .2, H.paso + 1.4), p = eio(st), moving = st > 0 && st < 1;
    M.set({ x: MX, y: G, a: .12 }); M.lit(.9);
    D.g.position.z = lerp(DZ0, DZ1, p);
    D.set({ x: lerp(DX0, DX1, p), y: G + (moving ? Math.abs(Math.sin(st * Math.PI * 3)) * .0012 : 0), a: moving ? .1 + Math.sin(st * Math.PI * 3) * .2 : .1 });
    if (t > H.paso + .1) flip(D);
    D.lit(lerp(.6, 1.1, ss(seg(t, H.paso, H.paso + .4))));
    C.set({ x: CLX - .004, y: G + .0055, look: -.6, blink: slowBlink(t, 4.2, .9), k: .8 });
    this._f = fsOf(S, lerp(-.085, -.087, p));
  }, post() { return { focus: this._f, aper: 8, maxCoc: 7, bloom: blo(.36, 1.0) }; }, grade() { return { vig: .5, sat: .95 }; } };
}

// S8 "los vio a los dos": tilt up and pull back from the two to the cross against the clearness, far, its head bowed toward them. Then silence 2, all still
export function S8(E) {
  const { H } = E;
  const S = darkStage();
  const Gg = golgotha(S); Gg.rock(CLX + .002); Gg.light([0, 0, 0, 0, 0]);
  const { M, D } = people(S, { dz: DZ1 });
  const C = clawd(S.U, { u: .0021, z: -.058, glow: .4 }); S.scene.add(C.g);
  return { S, update(t) {
    const k = eio(seg(t, E.T0 - .3, H.silencio2 + .3)), d = lerp(.54, .74, k), cx = lerp(.012, .008, k), cy = camY(G, lerp(.65, .7, k), d);
    aim(S.cam, [cx, cy, -.086 + d, cx, cy + lerp(-.004, .012, k), -.086], t, { hand: lerp(.0003, .00008, ss(seg(t, H.silencio2 - .3, H.silencio2))) });
    const br = ss(seg(t, H.silencio2, H.silencio2 + .5)) * Math.sin((t - H.silencio2) * 2.6) * .06;
    Gg.halo.userData.set(.6 + br); Gg.sky(0); setL(S, 0, CC, .08 + br * .2, 1);
    M.set({ x: MX, y: G, a: .12 }); M.lit(.9);
    D.set({ x: DX1, y: G, a: .1 }); flip(D); D.lit(.95);
    const quiet = ss(seg(t, H.silencio2 - .2, H.silencio2 + .4));
    C.set({ x: CLX, y: G + .0055, look: -.4, blink: quiet > .5 ? 1 : slowBlink(t, 4.2, .9), k: lerp(.8, .35, quiet) });
    this._f = lerp(fsOf(S, -.086), fsOf(S, -.1), k);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(.36, 1.0) }; }, grade() { return { vig: .52, sat: .95 }; } };
}

// S9 signature: "Mujer, he ahí tu hijo". The dark crests part to the sides like a paper curtain; a beam born behind the cross goes through the layers,
// back to front (0.18 s apart), turning each one to gold, until it falls on María and the disciple; the dark between them fills with light. Dolly in.
export function S9(E) {
  const { H } = E;
  const S = darkStage({ lightCol: '#ffd79a', lightR: .1 });
  const Gg = golgotha(S); Gg.rock(CLX + .002);
  const { M, D } = people(S, { dz: DZ1 });
  const C = clawd(S.U, { u: .0021, z: -.058, glow: .4 }); S.scene.add(C.g); backTo(C, true);
  const pool = glow(.06, .05, '#ffd79a', 1.6); pool.position.set((MX + DX1) / 2, G + .03, -.084); S.add(pool);
  const gold = col3('#ffd79a'), pale = col3('#c9cbe0');
  return { S, update(t) {
    const A = H.mujer, step = .18, lay_ = i => ss(seg(t, A + .2 + i * step, A + .55 + i * step));
    const p = [lay_(0), lay_(1), lay_(2), lay_(3), lay_(4)];
    const op = eio(seg(t, A - .05, A + 1.4)); Gg.part(.085 * op, .12 * op);
    Gg.light(p, [1, 1, 1, 1, 1]); Gg.sky(.85 * p[0], 1 - .5 * p[0]);
    Gg.halo.material.uniforms.col.value.copy(pale.clone().lerp(gold, p[0])); Gg.halo.userData.set(lerp(.6, .6, p[0]));
    Gg.shafts.forEach((m, i) => m.userData.set(lerp(0, .28 - i * .05, p[i])));
    S.U.uBeamO.value.set(0, CC, 1.6 * p[1]); S.U.uBeamD.value.set(-Math.PI / 2, .2, .4); S.U.uBeamCol.value.copy(gold);
    setL(S, 0, CC, lerp(.08, .16, p[0]), lerp(1, 1.8, p[0]), pale.clone().lerp(gold, p[0]));
    S.key.color.copy(col3('#c8ccf0').lerp(col3('#ffe0b0'), p[3])); S.key.intensity = lerp(1, 1.5, p[3]); S.amb.color.copy(col3('#6a70a8').lerp(col3('#c0a080'), p[3]));
    const k = eio(seg(t, E.T0, E.T0 + E.dur + .4)), d = lerp(.74, .56, k), cx = lerp(.008, .01, k), cy = camY(G, lerp(.7, .67, k), d);
    aim(S.cam, [cx, cy, -.086 + d, cx, cy + lerp(.012, .004, k), -.086], t, { hand: .0002 });
    M.set({ x: MX, y: G, a: .12 }); M.lit(lerp(.9, 1.5, p[4]), mixc(COLD, GOLDE, p[4]));
    D.set({ x: DX1, y: G, a: .1 }); flip(D); D.lit(lerp(.95, 1.5, p[4]), mixc(COLD, GOLDE, p[4]));
    pool.userData.set(.25 * p[4]);
    C.set({ x: CLX, y: G + .0055, look: 0, k: lerp(.6, 1.0, p[4]) });
    this._w = p[4]; this._f = fsOf(S, -.086);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(lerp(.36, .28, this._w), lerp(1.0, 1.12, this._w)) }; },
  grade() { return { vig: lerp(.52, .38, this._w), sat: lerp(.95, 1.06, this._w), lift: [lerp(0, .012, this._w), .005, lerp(.018, 0, this._w)] }; } };
}

// S10 "He ahí tu madre": the two, already in the same layer and the same light; the disciple turns his hand toward her; one gold edge. Short pull-back
export function S10(E) {
  const { H } = E;
  const S = darkStage({ lightCol: '#ffd79a', lightR: .16, key: 1.5, keyCol: '#ffe0b0', amb: .34, ambCol: '#c0a080' });
  const Gg = golgotha(S); Gg.rock(CLX - .006); Gg.part(.085, .12); Gg.light([1, 1, 1, 1, 1]); Gg.sky(.85, .5);
  Gg.halo.material.uniforms.col.value.set('#ffd79a'); Gg.halo.userData.set(.6); Gg.shafts.forEach((m, i) => m.userData.set(.26 - i * .05));
  const { M, D } = people(S, { dz: DZ1, edge: GOLDE });
  const C = clawd(S.U, { u: .002, z: -.058, glow: .4 }); S.scene.add(C.g);
  const pool = glow(.07, .06, '#ffd79a', 1.6); pool.position.set((MX + DX1) / 2, G + .03, -.084); S.add(pool); pool.userData.set(.6);
  S.U.uBeamO.value.set(0, CC, 1.6); S.U.uBeamD.value.set(-Math.PI / 2, .2, .4); S.U.uBeamCol.value.set('#ffd79a');
  return { S, update(t) {
    const k = eio(seg(t, E.T0 - .3, E.T0 + E.dur + .6)), d = lerp(.5, .56, k), cx = .008, cy = camY(G, .66, d);
    aim(S.cam, [cx, cy, -.086 + d, cx, cy, -.086], t, { hand: .0003 });
    const g = ss(seg(t, H.madre + .3, H.madre + 1.2));
    M.set({ x: MX, y: G, a: .12 + .12 * g }); M.lit(1.2);
    D.set({ x: DX1 - .002 * g, y: G, a: .1 + .55 * g, rot: -.04 * g }); flip(D); D.lit(1.2);
    pool.userData.set(.25 + .08 * g);
    C.set({ x: CLX - .008, y: G + .0055, look: -.7, blink: slowBlink(t, 4.2, .2), k: 1 });
    this._f = fsOf(S, -.086);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 5, bloom: blo(.28, 1.12) }; }, grade() { return { vig: .42, sat: 1.06, expo: .95, lift: [.012, .005, 0], gain: [1.05, 1, .93] }; } };
}

// —— the house in Jerusalem at a gold dawn: a wall with a door and one window, a lit room behind; neighbours and the city wall far away ——
const HX = .03, HW = .1, HH = .082, WIN = [.048, G + .052, .034, .024], DOOR = [.008, .016, .03];
export { HX, HW, HH, WIN, DOOR };
export function dawnHouse(S) {
  const sk = skyPanel({ w: 1.6, h: 1.2, y: .05, z: -.24, stops: [[0, '#6a5a7a'], [.3, '#c89a86'], [.45, '#f2cf96'], [.55, '#ffe7b0'], [1, '#f0c890']] }); S.add(sk);
  const sun = moon({ r: .016, x: -.07, y: .0, z: -.22, gain: 1.9, core: '#fffbe8', mid: '#fff0c8', edge: '#ffe0a0', halo: 8, haloGain: .5 }); S.scene.add(sun);
  const R = mulberry(17);
  lay(S, { w: 1.4, h: .3, y: -.15, z: -.19, col: '#d8b27a', trans: .55, ppm: 1600, finish: { rim: .45 }, draw: x => {
    x.translate(0, .15); x.beginPath(); x.moveTo(-.7, -.15); for (let u = -.7; u <= .7; u += .003) x.lineTo(u, -.022 + .008 * Math.sin(u * 30 + 1) + .004 * Math.sin(u * 90)); x.lineTo(.7, -.15); x.closePath(); x.fill();
    for (let u = -.5; u < .5; u += .011 + R() * .008) x.fillRect(u, -.02, .008 + R() * .006, .008 + R() * .014);   // the far city
  } });
  ground(S, -.15, '#b48c5a', G + .02, .006, .26, 2.7, .35, { w: 1.4 });
  // neighbours
  lay(S, { w: .5, h: .14, y: G + .03, z: -.125, col: '#8a6a42', trans: .2, ppm: 2600, finish: { rim: .5 }, draw: x => {
    x.translate(0, -(G + .03)); for (const [bx, bw, bh] of [[-.17, .05, .05], [-.115, .045, .068], [-.06, .04, .045], [.12, .05, .06], [.17, .05, .075]]) x.fillRect(bx - bw / 2, G - .02, bw, bh + .02);
  } });
  // the lit room behind the wall (window and door both open onto it)
  const room = lay(S, { w: HW * .9, h: HH * .9, x: HX, y: G + HH * .45, z: -.114, col: '#3a2410', trans: 0, shadow: false, recv: false, ppm: 3000, finish: { rim: 0, under: 0 },
    draw: x => x.fillRect(-HW * .45, -HH * .45, HW * .9, HH * .9), glowDraw: x => { x.fillStyle = '#fff'; x.fillRect(-HW * .45, -HH * .45, HW * .9, HH * .9); }, glow: 2.2, glowCol: '#ffcf7a', glowRes: .3 });
  room.material.userData.u.uGlowLit.value = 0;
  const wall = lay(S, { w: HW + .01, h: HH + .012, x: HX, y: G + HH / 2, z: -.108, col: '#7a5a34', trans: .12, ppm: 4200, finish: { rim: .6, rimPx: 5, rimCol: 'rgba(255,230,170,.6)', under: .35 }, draw: x => {
    x.translate(-HX, -(G + HH / 2));
    x.fillRect(HX - HW / 2, G - .004, HW, HH + .004); x.fillRect(HX - HW / 2 - .003, G + HH, HW + .006, .004);   // wall and roof edge
    for (let u = HX - HW / 2; u < HX + HW / 2; u += .012) x.fillRect(u, G + HH + .004, .006, .003);
    cut(x, () => {
      const [wx, wy, ww, wh] = WIN; x.fillRect(wx - ww / 2, wy - wh / 2, ww, wh);
      const [dx, dw, dh] = DOOR; x.beginPath(); x.moveTo(dx - dw / 2, G - .004); x.lineTo(dx - dw / 2, G + dh - dw / 2); x.arc(dx, G + dh - dw / 2, dw / 2, Math.PI, 0, true); x.lineTo(dx + dw / 2, G - .004); x.closePath(); x.fill();
    });
  } });
  lay(S, { w: WIN[2] + .008, h: .004, x: WIN[0], y: WIN[1] - WIN[3] / 2 - .0012, z: -.1075, col: '#5a3e1e', trans: .1, ppm: 4200, finish: { rim: .6 }, draw: x => x.fillRect(-WIN[2] / 2 - .004, -.0016, WIN[2] + .008, .0032) });
  ground(S, -.095, '#2a1a0c', G + .0005, .0012, .2, 3.3, .06, { rim: .35 });
  ground(S, -.04, '#070402', G - .012, .005, .12, .4, .02, { w: 1.4, peak: 2, rim: .25 });
  return { room, wall, light: v => { room.material.userData.u.uGlowLit.value = v; } };
}

// S11 the house: "desde aquella hora la recibió en su casa". Two silhouettes reach the door and go in; the window lights. Clawd stops far off, on the road. Dolly to the window
export function S11(E) {
  const { H } = E;
  const S = stage({ light: [-.07, .0, -.2], lightR: .3, lightCol: '#ffdca0', key: 1.6, keyCol: '#ffe8c8', amb: .42, ambCol: '#c8a48c', floor: .55 });
  const Hs = dawnHouse(S);
  const M = human(S.U, { h: .05, z: -.1, pose: 'veiled', col: '#1c1208', rim: .7 }); S.scene.add(M.g);
  const D = human(S.U, { h: .052, z: -.1005, col: '#1c1208', rim: .7 }); S.scene.add(D.g);
  const C = clawd(S.U, { u: .0017, z: -.072, glow: .3 }); S.scene.add(C.g);
  const wg = glow(.08, .07, '#ffcf7a', 1.8); wg.position.set(WIN[0], WIN[1], -.106); S.add(wg);
  return { S, update(t) {
    const k = eio(seg(t, E.T0 - .6, E.T0 + E.dur + .6)), d = lerp(.62, .5, k), cx = lerp(.0, .018, k), cy = camY(G, .69, d);
    aim(S.cam, [cx, cy, -.1 + d, cx, cy, -.1], t, { hand: .0003 });
    const arr = H.casa + 1.3, w = seg(t, E.T0 - .6, arr), xm = lerp(-.05, DOOR[0] - .002, w), inn = seg(t, arr, arr + .45);
    const walkS = (A, x, ph) => A.set({ x, y: G + (w < 1 ? Math.abs(Math.sin(t * 7 + ph)) * .0007 : 0), a: w < 1 ? Math.sin(t * 7 + ph) * .25 : .1 });
    walkS(M, xm, 0); walkS(D, xm - .012 + .008 * inn, 1.6);
    M.g.position.z = lerp(-.1, -.111, inn); D.g.position.z = lerp(-.1005, -.1112, seg(t, arr + .2, arr + .6));
    M.g.visible = inn < .999; D.g.visible = seg(t, arr + .2, arr + .6) < .999;
    const lit = ss(seg(t, H.ventana - .1, H.ventana + .35)); Hs.light(lit); wg.userData.set(.5 * lit);
    C.set({ x: -.03, y: G - .0005, look: .9, blink: slowBlink(t, 4, .6), k: .9 });
    this._f = fsOf(S, -.1);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 6, bloom: blo(.38, 1.05) }; }, grade() { return { vig: .32, sat: 1.04, lift: [.012, .005, 0], gain: [1.05, 1, .93] }; } };
}

// S12 the window: inside, the two in the same places as in shot 1, now without a gap; outside, Clawd seated on the threshold, in profile.
// On the question he turns his head to the camera, slowly. Pull-out that leaves the whole house under a gold sky.
export function S12(E) {
  const { H } = E;
  const S = stage({ light: [-.07, .0, -.2], lightR: .3, lightCol: '#ffdca0', key: 1.6, keyCol: '#ffe8c8', amb: .42, ambCol: '#c8a48c', floor: .55 });
  const Hs = dawnHouse(S); Hs.light(1);
  const M = human(S.U, { h: .046, z: -.111, pose: 'veiled', col: '#1c1208', rim: .6 }); S.scene.add(M.g);
  const D = human(S.U, { h: .048, z: -.1112, col: '#1c1208', rim: .6 }); S.scene.add(D.g);
  const wg = glow(.09, .08, '#ffcf7a', 1.8); wg.position.set(WIN[0], WIN[1], -.106); S.add(wg); wg.userData.set(.55);
  lay(S, { w: .03, h: .006, x: -.006, y: G + .002, z: -.1, col: '#3a2812', trans: .05, ppm: 4200, finish: { rim: .5 }, draw: x => x.fillRect(-.017, -.003, .034, .006) });
  const C = clawd(S.U, { u: .0019, z: -.098, glow: .35 }); S.scene.add(C.g);
  return { S, update(t) {
    const k = eio(seg(t, E.T0 - .2, E.T0 + E.dur - .4)), d = lerp(.4, .58, k), cx = lerp(.022, .02, k), cy = camY(G, .66, d);
    aim(S.cam, [cx, cy, -.1 + d, cx, cy, -.1], t, { hand: .00025 });
    M.set({ x: WIN[0] - .008, y: WIN[1] - .043, a: .1 }); D.set({ x: WIN[0] + .008, y: WIN[1] - .044, a: .1 }); flip(D);
    const P = H.pregunta, turn = ss(seg(t, P - .2, P + .7));
    C.set({ x: -.006, y: G + .005, look: lerp(.95, 0, turn), blink: t > P + .9 ? blinkAt(t, 3.0, .3) : slowBlink(t, 4.5, .8), k: 1 });
    this._f = lerp(fsOf(S, -.1), fsOf(S, -.105), k);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 6, bloom: blo(.36, 1.05) }; }, grade() { return { vig: .32, sat: 1.04, lift: [.012, .005, 0], gain: [1.05, 1, .93] }; } };
}
