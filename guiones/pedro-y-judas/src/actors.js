// Paper puppets for «Dos fuegos»: Clawd (jointed), human silhouettes (hood/mantle, purse, flip), the brazier and its flame, the rooster,
// silver coins, the beached boat, fish and bread. Rotation only, like paper on a stick. Base: the clawd-papel template and maria-de-betania.
import * as THREE from 'three';
import { sheet } from './paper.js';
import { mulberry, TAU } from './lib.js';
export const PAPER = '#9a9a9a', BASE = new THREE.Color(PAPER).r;
export const tint = (m, hex, k = 1) => m.material.color.set(hex).multiplyScalar(k / BASE);
export const cut = (x, fn) => { x.save(); x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000'; x.strokeStyle = '#000'; fn(); x.restore(); };
export const CLAY = '#D97757';

export function mk(U, o) {
  const m = sheet({ U, ...o, draw: (x, k) => { x.fillStyle = PAPER; x.strokeStyle = PAPER; o.draw(x, k); } });
  if (o.col) tint(m, o.col, o.tk ?? 1);
  return m;
}

// Clawd: origin under the feet, u = side of one pixel cell
export function clawd(U, { u = .0024, z = -.056, glow = .55 } = {}) {
  const g = new THREE.Group(); g.position.z = z;
  const block = (cw, ch, cx, cy, col, dz, o = {}) => {
    const w = cw * u, h = ch * u, m = u * .06;
    const mesh = sheet({
      U, w: w + u * .3, h: h + u * .3, x: cx * u, y: cy * u, z: dz, ax: (o.ax || 0) * u, ay: (o.ay || 0) * u, trans: .5, shadow: o.shadow ?? false, recv: false, ppm: 9000,
      finish: { rim: .5, under: .35, rimPx: 4, underPx: 4, grainA: .5 },
      draw: x => { x.fillStyle = PAPER; x.fillRect(-w / 2 + m, -h / 2 + m, w - 2 * m, h - 2 * m); },
      glowDraw: o.noGlow ? undefined : x => { x.fillStyle = '#fff'; x.fillRect(-w / 2, -h / 2, w, h); }, glow: o.noGlow ? 0 : glow, glowCol: CLAY, glowRes: .2,
    });
    tint(mesh, col); g.add(mesh); return mesh;
  };
  const body = block(12, 8, 0, 6, CLAY, 0, { shadow: true });
  const armL = block(2, 2, -7, 5, CLAY, -.0004, { ax: 1 }), armR = block(2, 2, 7, 5, CLAY, -.0004, { ax: -1 });
  const legs = [-4.5, -2.5, 2.5, 4.5].map(cx => block(1, 2, cx, 1, CLAY, -.0004, { ay: 1 }));
  const eyeL = block(1, 2, -3.5, 7, '#1a120d', .0004, { noGlow: true }), eyeR = block(1, 2, 3.5, 7, '#1a120d', .0004, { noGlow: true });
  const glowMeshes = [body, armL, armR, ...legs];
  return {
    g, body, armL, armR, legs, eyeL, eyeR,
    // armL/armR radians (raised = positive away from the body), walk = phase, look -1..1, lookY -1..1 (eyes down/up), blink 0 shut..1 open, k = self glow
    set({ x = 0, y = 0, rot = 0, aL = 0, aR = 0, walk = 0, stride = 0, look = 0, lookY = 0, blink = 1, k = 1, s = 1, tuck = 0 }) {
      g.position.x = x; g.position.y = y - tuck * 2 * u * s; g.rotation.z = rot; g.scale.setScalar(s);
      armL.rotation.z = -aL * .55; armR.rotation.z = aR * .55;   // scaled so a raised arm stays beside the body instead of swinging behind it
      legs.forEach((l, i) => { l.rotation.z = Math.sin(walk + i * Math.PI) * stride; });
      for (const [e, cx] of [[eyeL, -3.5], [eyeR, 3.5]]) { e.position.x = (cx + look * .9) * u; e.position.y = (7 + lookY * .6) * u; e.scale.y = Math.max(.12, blink); }
      for (const m of glowMeshes) m.material.emissiveIntensity = glow * k;
    },
  };
}

// Human silhouette, side view, facing +x. h = standing height. Pose: stand | sit | kneel. Rotating arm at the shoulder.
// hd = head centre, nape = where María's hair sheet hangs from (unit space)
export const POSES = {
  stand: { sh: [.01, .74], hd: [.015, .905], nape: [-.05, .86], draw(x, w) {
    x.beginPath(); x.moveTo(-.18, 0); x.bezierCurveTo(-.21, .26, -.17, .52, -.13, .68); x.quadraticCurveTo(-.11, .79, -.03, .81); x.lineTo(.05, .81);
    x.quadraticCurveTo(.13, .77, .13, .66); x.bezierCurveTo(.15, .45, .21, .22, .21, 0); x.closePath(); x.fill();
    x.beginPath(); x.arc(.015, .905, .092, 0, 7); x.fill();
    if (!w) { x.beginPath(); x.moveTo(.07, .875); x.quadraticCurveTo(.1, .82, .065, .795); x.lineTo(.01, .82); x.closePath(); x.fill(); }
    x.beginPath(); x.moveTo(-.09, .98); x.quadraticCurveTo(-.15, .9, -.14, .74); x.lineTo(-.03, .86); x.closePath(); x.fill();
  } },
  sit: { sh: [.0, .52], hd: [.075, .63], nape: [.01, .6], draw(x) {
    x.beginPath(); x.moveTo(-.27, 0); x.bezierCurveTo(-.32, .2, -.27, .42, -.13, .56); x.quadraticCurveTo(-.03, .63, .05, .56); x.bezierCurveTo(.1, .42, .3, .37, .36, .27); x.lineTo(.38, 0); x.closePath(); x.fill();
    x.beginPath(); x.arc(.075, .63, .092, 0, 7); x.fill();
    x.beginPath(); x.moveTo(.13, .605); x.quadraticCurveTo(.16, .55, .125, .525); x.lineTo(.07, .55); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(-.03, .71); x.quadraticCurveTo(-.1, .63, -.09, .47); x.lineTo(.04, .58); x.closePath(); x.fill();
  } },
  kneel: { sh: [.03, .5], hd: [.075, .655], nape: [-.005, .61], draw(x) {   // kneeling, sitting back on the heels, torso a little forward
    x.beginPath(); x.moveTo(-.29, 0); x.lineTo(.2, 0); x.quadraticCurveTo(.28, 0, .27, .055); x.quadraticCurveTo(.25, .11, .14, .13);
    x.quadraticCurveTo(.07, .16, .08, .25); x.bezierCurveTo(.12, .36, .13, .45, .09, .54); x.quadraticCurveTo(.05, .59, -.02, .58);
    x.bezierCurveTo(-.1, .55, -.13, .42, -.15, .3); x.quadraticCurveTo(-.2, .14, -.29, 0); x.closePath(); x.fill();
    x.beginPath(); x.arc(.075, .655, .085, 0, 7); x.fill();
  } },
};
// Mantle over the head and down the back (the women); drawn in the figure's unit space around the head centre
function mantle(x, [hx, hy], pose) {
  const d = pose === 'stand' ? .86 : hy - .02;
  x.beginPath(); x.moveTo(hx + .075, hy + .035); x.quadraticCurveTo(hx + .05, hy + .125, hx - .035, hy + .118); x.quadraticCurveTo(hx - .125, hy + .1, hx - .16, hy - .04);
  x.bezierCurveTo(hx - .2, hy - .25, hx - .23, hy - d * .6, hx - .26, hy - d); x.lineTo(hx - .15, hy - d); x.bezierCurveTo(hx - .15, hy - .5 * d, hx - .12, hy - .25, hx - .06, hy - .1); x.closePath(); x.fill();
  if (pose === 'stand') { x.beginPath(); x.moveTo(-.2, 0); x.quadraticCurveTo(-.24, .12, -.2, .3); x.lineTo(.2, .3); x.quadraticCurveTo(.26, .12, .25, 0); x.closePath(); x.fill(); }   // a skirt that reaches the ground
}
// A small purse at the belt (Judas)
function purse(x) {
  x.beginPath(); x.moveTo(.15, .5); x.lineTo(.19, .47); x.lineTo(.2, .44); x.quadraticCurveTo(.26, .43, .258, .37); x.quadraticCurveTo(.246, .32, .2, .33); x.quadraticCurveTo(.165, .35, .175, .42); x.closePath(); x.fill();
}
export function human(U, { h = .085, z = -.085, col = '#07101a', pose = 'stand', trans = .05, rim = .6, two = false, veil = false, bolsa = false, ppm } = {}) {
  const g = new THREE.Group(); g.position.z = z; const P = POSES[pose], W = h * 1.1, H_ = h * 1.12;
  const finish = { rim, rimPx: 4, under: .2, rimCol: `rgba(255,226,170,${rim})` };
  const body = mk(U, { w: W, h: H_, y: H_ / 2 - h * .03, z: 0, col, trans, finish, ppm, draw: x => { x.translate(0, -H_ / 2 + h * .03); x.scale(h, h); P.draw(x, veil); if (veil) mantle(x, P.hd, pose); if (bolsa) purse(x); } });
  const aw = h * .078, al = h * .37;
  const mkArm = dz => mk(U, { w: aw * 1.6, h: al * 1.25, x: P.sh[0] * h, y: P.sh[1] * h - al / 2, ay: al / 2, z: dz, col, trans, shadow: false, recv: false, finish, ppm,
    draw: x => { x.beginPath(); x.moveTo(-aw * .55, al / 2); x.lineTo(aw * .55, al / 2); x.lineTo(aw * .33, -al / 2); x.lineTo(-aw * .33, -al / 2); x.closePath(); x.fill(); x.beginPath(); x.arc(0, al / 2, aw * .55, 0, 7); x.fill(); x.beginPath(); x.ellipse(0, -al / 2, aw * .42, aw * .62, 0, 0, 7); x.fill(); } });
  const arm = mkArm(.0005), arm2 = two ? mkArm(-.0005) : null;
  g.add(body, arm); if (arm2) g.add(arm2);
  const F = { g, body, arm, arm2, h, P, st: { x: 0, y: 0, s: 1, flip: false, rot: 0, a: 0 },
    // flip: face -x (a mirrored sheet); a2: the second arm's own angle when two = true
    set({ x = 0, y = 0, rot = 0, a = 0, a2 = null, s = 1, flip = false, turn = null }) {   // turn: -1..1, a paper turn on its stick (overrides flip)
      if (turn !== null) flip = turn < 0;
      g.position.x = x; g.position.y = y; g.rotation.z = rot; g.scale.set((turn !== null ? Math.sign(turn || 1) * Math.max(.02, Math.abs(turn)) : (flip ? -1 : 1)) * s, s, s); arm.rotation.z = a; if (arm2) arm2.rotation.z = a2 ?? a * .97;
      Object.assign(F.st, { x, y, s, flip, rot, a });
    },
    // world position (xy) of a point in the figure's unit space, honouring flip, scale and rotation
    at(ux, uy) { const { x, y, s, flip, rot } = F.st; const px = (flip ? -1 : 1) * ux * h * s, py = uy * h * s, c = Math.cos(rot), sn = Math.sin(rot); return [x + px * c - py * sn, y + px * sn + py * c]; },
    // the hand at the end of the (first) arm; k < 1 = part-way down the forearm
    hand(k = 1) { const a = F.st.a; return F.at(P.sh[0] + Math.sin(a) * .37 * k, P.sh[1] - Math.cos(a) * .37 * k); },
  };
  return F;
}

// Ship: origin on the deck line at midships; L = hull length
export function ship(U, { L = .13, z = -.075, col = '#0a1422', sail = '#2a3a52', furled = false } = {}) {
  const g = new THREE.Group(); g.position.z = z; const H_ = L * .3;
  const hull = mk(U, { w: L * 1.2, h: H_ * 1.4, y: -H_ * .5, z: 0, col, trans: .05, finish: { rim: .55 }, draw: x => {
    x.save(); x.translate(0, H_ * .5);
    x.beginPath(); x.moveTo(-L * .55, H_ * .28); x.quadraticCurveTo(-L * .46, -H_ * .02, -L * .4, 0); x.lineTo(L * .4, 0); x.quadraticCurveTo(L * .48, 0, L * .57, H_ * .36);
    x.quadraticCurveTo(L * .44, -H_ * .72, L * .3, -H_ * .78); x.lineTo(-L * .32, -H_ * .78); x.quadraticCurveTo(-L * .47, -H_ * .55, -L * .55, H_ * .28); x.closePath(); x.fill(); x.restore();
    cut(x, () => { for (let i = -5; i <= 5; i++) { x.fillRect(i * L * .068 - L * .008, H_ * .08, L * .016, H_ * .03); } });
  } });
  const mast = mk(U, { w: L * .9, h: L * 1.05, y: L * .5, z: -.0035, col: '#101c2e', trans: .08, shadow: true, finish: { rim: .4 }, draw: x => {
    x.fillRect(-L * .009, -L * .5, L * .018, L); x.fillRect(-L * .33, L * .3, L * .66, L * .012);
  } });
  const sh = mk(U, { w: L * .78, h: L * .7, y: L * .5, z: -.003, col: sail, trans: .35, finish: { rim: .3 }, draw: x => {
    if (furled) { x.beginPath(); x.ellipse(0, L * .285, L * .31, L * .022, 0, 0, 7); x.fill(); return; }
    x.beginPath(); x.moveTo(-L * .32, L * .29); x.lineTo(L * .32, L * .29); x.quadraticCurveTo(L * .42, -L * .05, L * .3, -L * .28); x.quadraticCurveTo(0, -L * .2, -L * .3, -L * .28); x.quadraticCurveTo(-L * .2, 0, -L * .32, L * .29); x.closePath(); x.fill();
  } });
  g.add(hull, sh, mast);
  return { g, hull, mast, sail: sh };
}

// Top line of a wave sheet: sum of peaked sines; fills everything below it
export function waveFill(x, { x0, x1, base, amp, len, ph = 0, peak = 1.6 }) {
  x.beginPath(); x.moveTo(x0, -2);
  for (let u = x0; u <= x1 + .001; u += .001) { const a = (Math.sin(u / len * 6.283 + ph) + 1) / 2, b = Math.sin(u / (len * .47) * 6.283 + ph * 1.7); x.lineTo(u, base + amp * (Math.pow(a, peak) + b * .12)); }
  x.lineTo(x1, -2); x.closePath(); x.fill();
}

// —— «Dos fuegos» ——
// Flame: three tongues of emissive cream paper (crema y oro, never orange) + 3 fixed sparks that blink. Origin at the base.
export function flame(U, { s = .02, z = -.06, col = '#ffd38a', glow = 2.4, sparks = 3 } = {}) {
  const g = new THREE.Group(); g.position.z = z;
  const tongue = (dx, hk, dz, ph) => { const shape = x => { const a = s * .2, b = s * hk * .5; x.beginPath(); x.moveTo(-a, -b); x.quadraticCurveTo(-a * 1.25, 0, 0, b); x.quadraticCurveTo(a * 1.25, 0, a, -b); x.closePath(); x.fill(); };
    const m = mk(U, { w: s * .5, h: s * hk * 1.05, ay: -s * hk * .5, x: dx, y: s * hk * .5, z: dz, col: '#fff0cc', trans: .9, shadow: false, recv: false, ppm: 9000, finish: { rim: 0, under: 0 },
      draw: shape, glowDraw: x => { x.fillStyle = '#fff'; shape(x); }, glow, glowCol: col, glowRes: .5 }); m.userData.ph = ph; g.add(m); return m; };
  const T = [tongue(-s * .17, .7, 0, 0), tongue(s * .17, .8, .0002, 2), tongue(0, 1.1, .0004, 4)];
  const R = mulberry(17), S = [];
  for (let i = 0; i < sparks; i++) {
    const r = s * .03, m = mk(U, { w: r * 3, h: r * 3, x: (R() - .5) * s * .7, y: s * (1.25 + R() * .55), z: .0006, col: '#ffe2a6', trans: .9, shadow: false, recv: false, ppm: 12000, finish: { rim: 0, under: 0, grain: false },
      draw: x => { x.beginPath(); x.arc(0, 0, r, 0, TAU); x.fill(); }, glowDraw: x => { x.fillStyle = '#fff'; x.beginPath(); x.arc(0, 0, r * 1.2, 0, TAU); x.fill(); }, glow: 3, glowCol: '#ffb35c', glowRes: 1 });
    m.userData.ph = R() * 9; g.add(m); S.push(m);
  }
  return { g, T, S, s,
    // k: size/brightness (1 full, .5 crouched, .3 embers); squash: extra vertical squash 0..1
    set(t, k = 1, squash = 0) {
      for (const m of T) { const f = 1 + .06 * Math.sin(7.3 * t + m.userData.ph) * Math.sin(3.1 * t + m.userData.ph) + .05 * Math.sin(11 * t + m.userData.ph); m.visible = k > .01; m.scale.set(.7 + .3 * k, Math.max(.01, k * f * (1 - .55 * squash)), 1); m.rotation.z = .05 * Math.sin(5.3 * t + m.userData.ph); m.material.emissiveIntensity = glow * Math.min(1.2, k + .15); }
      for (const m of S) { const b = Math.max(0, Math.sin(t * 4.1 + m.userData.ph)); m.visible = k > .35; m.material.emissiveIntensity = 3 * b * b * k; }
    } };
}
// Brazier: a low stone bowl on a foot; the flame sits on its rim. Origin at the base centre. w = bowl width.
export function brasero(U, { w = .028, z = -.08, col = '#241a20', fcol = '#ffd38a' } = {}) {
  const g = new THREE.Group(); g.position.z = z; const h = w * .5;
  const bowl = mk(U, { w: w * 1.2, h: h * 1.2, y: h * .5, z: 0, col, trans: .06, ppm: 8000, finish: { rim: .7, rimPx: 4, under: .3, rimCol: 'rgba(255,214,150,.75)' }, draw: x => {
    x.translate(0, -h * .5);
    x.fillRect(-w * .22, 0, w * .44, h * .12); x.fillRect(-w * .1, h * .1, w * .2, h * .32);
    x.beginPath(); x.moveTo(-w * .5, h * .95); x.lineTo(w * .5, h * .95); x.quadraticCurveTo(w * .46, h * .42, w * .14, h * .4); x.lineTo(-w * .14, h * .4); x.quadraticCurveTo(-w * .46, h * .42, -w * .5, h * .95); x.closePath(); x.fill();
  } });
  const coals = mk(U, { w: w * .9, h: h * .3, y: h * .98, z: .0002, col: '#3a2418', trans: .2, shadow: false, recv: false, ppm: 8000, finish: { rim: 0, under: 0 }, draw: x => { const R = mulberry(5); for (let i = 0; i < 9; i++) { x.beginPath(); x.arc((R() - .5) * w * .8, (R() - .6) * h * .1, w * (.04 + R() * .03), 0, TAU); x.fill(); } },
    glowDraw: x => { const R = mulberry(5); x.fillStyle = '#fff'; for (let i = 0; i < 9; i++) { x.beginPath(); x.arc((R() - .5) * w * .8, (R() - .6) * h * .1, w * (.03 + R() * .02), 0, TAU); x.fill(); } }, glow: 2, glowCol: '#ffb35c', glowRes: 1 });
  const F = flame(U, { s: w * .9, z: -.0004, col: fcol }); F.g.position.y = h * .9;
  g.add(F.g, bowl, coals);
  return { g, bowl, coals, F, top: h * .95, set(t, k = 1, squash = 0) { F.set(t, k, squash); coals.material.emissiveIntensity = 2 * (.5 + .5 * k) * (.9 + .1 * Math.sin(t * 2.3)); } };
}
// Embers on the shore (no brazier): a ring of small stones, glowing coals, a fish and a loaf on top. Origin at the base centre.
export function brasas(U, { w = .022, z = -.075, col = '#1c120e', fishCol = '#2a1c16' } = {}) {
  const g = new THREE.Group(); g.position.z = z;
  const stones = mk(U, { w: w * 1.3, h: w * .4, y: w * .12, z: .0004, col, trans: .05, ppm: 9000, finish: { rim: .6, rimPx: 3, under: .3 }, draw: x => { const R = mulberry(8); for (let i = 0; i < 7; i++) { x.beginPath(); x.ellipse(-w * .54 + i * w * .18, -w * .06, w * .1, w * .07 + R() * w * .02, 0, 0, TAU); x.fill(); } } });
  const coals = mk(U, { w: w * 1.1, h: w * .3, y: w * .14, z: 0, col: '#3a2418', trans: .2, shadow: false, recv: false, ppm: 9000, finish: { rim: 0, under: 0 }, draw: x => { const R = mulberry(3); for (let i = 0; i < 10; i++) { x.beginPath(); x.arc((R() - .5) * w * .9, (R() - .5) * w * .1, w * (.05 + R() * .04), 0, TAU); x.fill(); } },
    glowDraw: x => { const R = mulberry(3); x.fillStyle = '#fff'; for (let i = 0; i < 10; i++) { x.beginPath(); x.arc((R() - .5) * w * .9, (R() - .5) * w * .1, w * (.04 + R() * .03), 0, TAU); x.fill(); } }, glow: 2.4, glowCol: '#ffb35c', glowRes: 1 });
  const food = mk(U, { w: w * 1.2, h: w * .4, y: w * .3, z: .0007, col: fishCol, trans: .1, ppm: 9000, finish: { rim: .7, rimPx: 3, under: .3, rimCol: 'rgba(255,214,150,.8)' }, draw: x => {
    x.beginPath(); x.ellipse(-w * .12, 0, w * .26, w * .06, 0, 0, TAU); x.fill();                                   // the fish
    x.beginPath(); x.moveTo(w * .12, 0); x.lineTo(w * .24, w * .07); x.lineTo(w * .24, -w * .07); x.closePath(); x.fill();
    x.beginPath(); x.ellipse(w * .36, w * .01, w * .12, w * .08, 0, 0, TAU); x.fill();                                 // the loaf
  } });
  const F = flame(U, { s: w * .55, z: -.0003, sparks: 2 }); F.g.position.y = w * .16;
  g.add(F.g, coals, food, stones);
  return { g, F, coals, set(t, k = 1) { F.set(t, k * .75); coals.material.emissiveIntensity = 2.4 * (.6 + .4 * k) * (.9 + .1 * Math.sin(t * 2.1)); } };
}
// Rooster in profile (facing +x); the head and neck are their own sheet, pivoting at the base of the neck. Origin at the feet. h = height.
export function gallo(U, { h = .02, z = -.11, col = '#0a070c', rim = .8 } = {}) {
  const g = new THREE.Group(); g.position.z = z;
  const finish = { rim, rimPx: 3, under: .2, rimCol: `rgba(255,236,200,${rim})` };
  const body = mk(U, { w: h * 1.3, h: h * 1.0, y: h * .4, z: 0, col, trans: .05, ppm: 12000, finish, draw: x => {
    x.translate(0, -h * .4);
    x.fillRect(-h * .02, 0, h * .03, h * .3); x.fillRect(h * .08, 0, h * .03, h * .3);                                 // legs
    x.beginPath(); x.moveTo(h * .3, h * .6); x.bezierCurveTo(h * .3, h * .3, h * .05, h * .22, -h * .2, h * .32); x.quadraticCurveTo(-h * .4, h * .4, -h * .48, h * .78);   // breast, belly, tail root
    x.quadraticCurveTo(-h * .58, h * .5, -h * .62, h * .62); x.quadraticCurveTo(-h * .5, h * .9, -h * .36, h * .94); x.quadraticCurveTo(-h * .3, h * .72, -h * .2, h * .6); x.quadraticCurveTo(h * .05, h * .62, h * .2, h * .66); x.closePath(); x.fill();   // tail feathers
  } });
  const head = mk(U, { w: h * .6, h: h * .7, x: h * .24, y: h * .64, ax: -h * .05, ay: -h * .06, z: .0003, col, trans: .05, ppm: 12000, finish, draw: x => {
    x.translate(-h * .19, -h * .58);
    x.beginPath(); x.moveTo(h * .14, h * .58); x.quadraticCurveTo(h * .16, h * .84, h * .28, h * .92); x.quadraticCurveTo(h * .38, h * .94, h * .38, h * .84); x.lineTo(h * .46, h * .82); x.lineTo(h * .38, h * .79);   // neck, head, beak
    x.quadraticCurveTo(h * .36, h * .7, h * .32, h * .62); x.lineTo(h * .34, h * .54); x.quadraticCurveTo(h * .3, h * .58, h * .3, h * .62); x.closePath(); x.fill();
    x.beginPath(); x.arc(h * .26, h * .96, h * .035, 0, TAU); x.arc(h * .31, h * .985, h * .035, 0, TAU); x.arc(h * .36, h * .96, h * .03, 0, TAU); x.fill();   // comb
  } });
  g.add(body, head);
  return { g, body, head, set({ x = 0, y = 0, lift = 0 }) { g.position.x = x; g.position.y = y; head.rotation.z = lift * .45; } };
}
// One silver coin (a small disc with a cold rim). Origin at its centre. r = radius.
export function moneda(U, { r = .002, z = -.07, col = '#d8d4cc', glow = .9 } = {}) {
  return mk(U, { w: r * 2.6, h: r * 2.6, z, col, trans: .2, shadow: true, recv: false, ppm: 16000, finish: { rim: .8, rimPx: 3, under: .35, rimCol: 'rgba(235,242,255,.85)' }, draw: x => {
    x.beginPath(); x.arc(0, 0, r, 0, TAU); x.fill();
    cut(x, () => { x.lineWidth = r * .1; x.beginPath(); x.arc(0, 0, r * .72, 0, TAU); x.stroke(); x.beginPath(); x.arc(0, 0, r * .12, 0, TAU); x.fill(); });
  }, glowDraw: x => { x.fillStyle = '#fff'; x.beginPath(); x.arc(-r * .3, r * .3, r * .3, 0, TAU); x.fill(); }, glow, glowCol: '#eef2ff', glowRes: .5 });
}
// A fishing boat without a sail, beached or afloat. Origin on the deck line at midships; L = hull length. The prow is at +x.
export function barca(U, { L = .08, z = -.07, col = '#120c10', rim = .55 } = {}) {
  const H_ = L * .3;
  return mk(U, { w: L * 1.2, h: H_ * 1.4, y: -H_ * .5, z, col, trans: .05, ppm: 6000, finish: { rim, rimPx: 4, under: .3, rimCol: `rgba(255,226,170,${rim})` }, draw: x => {
    x.save(); x.translate(0, H_ * .5);
    x.beginPath(); x.moveTo(-L * .5, H_ * .12); x.lineTo(L * .42, 0); x.quadraticCurveTo(L * .5, 0, L * .57, H_ * .4);
    x.quadraticCurveTo(L * .44, -H_ * .72, L * .3, -H_ * .78); x.lineTo(-L * .34, -H_ * .78); x.quadraticCurveTo(-L * .5, -H_ * .5, -L * .5, H_ * .12); x.closePath(); x.fill();
    cut(x, () => { x.fillRect(-L * .4, -H_ * .2, L * .76, H_ * .03); });
    x.restore();
  } });
}
