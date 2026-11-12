// Paper puppets: Clawd (a paper redraw of the pixel mascot, jointed), human silhouettes (with an optional mantle), the water jar, a crowd sheet. Rotation only, like paper on a stick.
import * as THREE from 'three';
import { sheet } from './paper.js';
import { mulberry } from './lib.js';

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
    // armL/armR radians (raised = positive away from the body), walk = phase, look -1..1, blink 0 shut..1 open, k = self glow
    set({ x = 0, y = 0, rot = 0, aL = 0, aR = 0, walk = 0, stride = 0, look = 0, blink = 1, k = 1, s = 1, tuck = 0 }) {
      g.position.x = x; g.position.y = y - tuck * 2 * u * s; g.rotation.z = rot; g.scale.setScalar(s);
      armL.rotation.z = -aL * .55; armR.rotation.z = aR * .55;   // scaled so a raised arm stays beside the body instead of swinging behind it
      legs.forEach((l, i) => { l.rotation.z = Math.sin(walk + i * Math.PI) * stride; });
      for (const [e, cx] of [[eyeL, -3.5], [eyeR, 3.5]]) { e.position.x = (cx + look * .9) * u; e.scale.y = Math.max(.12, blink); }
      for (const m of glowMeshes) m.material.emissiveIntensity = glow * k;
    },
  };
}

// Human silhouette, side view, facing +x. h = standing height. Pose: stand | sit | kneel. Rotating arm at the shoulder.
const POSES = {
  stand: { sh: [.01, .74], hd: [.015, .905], draw(x, w) {
    x.beginPath(); x.moveTo(-.18, 0); x.bezierCurveTo(-.21, .26, -.17, .52, -.13, .68); x.quadraticCurveTo(-.11, .79, -.03, .81); x.lineTo(.05, .81);
    x.quadraticCurveTo(.13, .77, .13, .66); x.bezierCurveTo(.15, .45, .21, .22, .21, 0); x.closePath(); x.fill();
    x.beginPath(); x.arc(.015, .905, .092, 0, 7); x.fill();
    if (!w) { x.beginPath(); x.moveTo(.07, .875); x.quadraticCurveTo(.1, .82, .065, .795); x.lineTo(.01, .82); x.closePath(); x.fill(); }
    x.beginPath(); x.moveTo(-.09, .98); x.quadraticCurveTo(-.15, .9, -.14, .74); x.lineTo(-.03, .86); x.closePath(); x.fill();
  } },
  sit: { sh: [.0, .52], hd: [.075, .63], draw(x) {
    x.beginPath(); x.moveTo(-.27, 0); x.bezierCurveTo(-.32, .2, -.27, .42, -.13, .56); x.quadraticCurveTo(-.03, .63, .05, .56); x.bezierCurveTo(.1, .42, .3, .37, .36, .27); x.lineTo(.38, 0); x.closePath(); x.fill();
    x.beginPath(); x.arc(.075, .63, .092, 0, 7); x.fill();
    x.beginPath(); x.moveTo(.13, .605); x.quadraticCurveTo(.16, .55, .125, .525); x.lineTo(.07, .55); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(-.03, .71); x.quadraticCurveTo(-.1, .63, -.09, .47); x.lineTo(.04, .58); x.closePath(); x.fill();
  } },
  kneel: { sh: [.02, .58], hd: [.04, .745], draw(x) {
    x.beginPath(); x.moveTo(-.3, 0); x.bezierCurveTo(-.3, .13, -.24, .32, -.15, .5); x.quadraticCurveTo(-.11, .62, -.02, .65); x.lineTo(.06, .65); x.quadraticCurveTo(.13, .61, .13, .5); x.bezierCurveTo(.13, .35, .2, .2, .26, 0); x.closePath(); x.fill();
    x.beginPath(); x.arc(.04, .745, .092, 0, 7); x.fill();
    x.beginPath(); x.moveTo(.075, .73); x.lineTo(.16, .62); x.lineTo(.05, .65); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(-.07, .82); x.quadraticCurveTo(-.13, .74, -.12, .58); x.lineTo(0, .7); x.closePath(); x.fill();
  } },
};
// Mantle over the head and down the back (the woman); drawn in the figure's unit space around the head centre
function mantle(x, [hx, hy]) {
  x.beginPath(); x.moveTo(hx + .075, hy + .035); x.quadraticCurveTo(hx + .05, hy + .125, hx - .035, hy + .118); x.quadraticCurveTo(hx - .125, hy + .1, hx - .16, hy - .04);
  x.bezierCurveTo(hx - .2, hy - .25, hx - .23, hy - .55, hx - .25, hy - .86); x.lineTo(hx - .15, hy - .86); x.bezierCurveTo(hx - .15, hy - .5, hx - .12, hy - .25, hx - .06, hy - .1); x.closePath(); x.fill();
  x.beginPath(); x.moveTo(-.2, 0); x.quadraticCurveTo(-.24, .12, -.2, .3); x.lineTo(.2, .3); x.quadraticCurveTo(.26, .12, .25, 0); x.closePath(); x.fill();   // a skirt that reaches the ground
}
export function human(U, { h = .085, z = -.085, col = '#07101a', pose = 'stand', trans = .05, rim = .6, two = false, veil = false } = {}) {
  const g = new THREE.Group(); g.position.z = z; const P = POSES[pose], W = h * 1.1, H_ = h * 1.12;
  const finish = { rim, rimPx: 4, under: .2, rimCol: `rgba(255,226,170,${rim})` };
  const body = mk(U, { w: W, h: H_, y: H_ / 2 - h * .03, z: 0, col, trans, finish, draw: x => { x.translate(0, -H_ / 2 + h * .03); x.scale(h, h); P.draw(x, veil); if (veil) mantle(x, P.hd); } });
  const aw = h * .078, al = h * .37;
  const mkArm = dz => mk(U, { w: aw * 1.6, h: al * 1.25, x: P.sh[0] * h, y: P.sh[1] * h - al / 2, ay: al / 2, z: dz, col, trans, shadow: false, recv: false, finish,
    draw: x => { x.beginPath(); x.moveTo(-aw * .55, al / 2); x.lineTo(aw * .55, al / 2); x.lineTo(aw * .33, -al / 2); x.lineTo(-aw * .33, -al / 2); x.closePath(); x.fill(); x.beginPath(); x.arc(0, al / 2, aw * .55, 0, 7); x.fill(); x.beginPath(); x.ellipse(0, -al / 2, aw * .42, aw * .62, 0, 0, 7); x.fill(); } });
  const arm = mkArm(.0005), arm2 = two ? mkArm(-.0005) : null;
  g.add(body, arm); if (arm2) g.add(arm2);
  // flip: face -x (a mirrored sheet); a2: the second arm's own angle when two = true
  return { g, body, arm, arm2, set({ x = 0, y = 0, rot = 0, a = 0, a2 = null, s = 1, flip = false }) { g.position.x = x; g.position.y = y; g.rotation.z = rot; g.scale.set(flip ? -s : s, s, s); arm.rotation.z = a; if (arm2) arm2.rotation.z = a2 ?? a * .97; } };
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

// Water jar of pale clay (not terracotta, so it never competes with Clawd). A group with its origin at the base centre; h = height.
export function cantaro(U, { h = .03, z = -.04, col = '#c9b48e', trans = .25, shadow = true } = {}) {
  const w = h * .9, g = new THREE.Group(); g.position.z = z;
  g.add(mk(U, { w: w * 1.3, h: h * 1.1, y: h * .53, z: 0, col, trans, shadow, ppm: 9000, finish: { rim: .6, rimPx: 4, under: .35, rimCol: 'rgba(255,240,205,.6)' }, draw: x => {
    x.save(); x.translate(0, -h * .53);
    x.beginPath(); x.moveTo(-w * .16, 0); x.quadraticCurveTo(-w * .5, h * .12, -w * .46, h * .45); x.quadraticCurveTo(-w * .4, h * .72, -w * .14, h * .8);
    x.lineTo(-w * .12, h * .93); x.lineTo(-w * .2, h * .98); x.lineTo(w * .2, h * .98); x.lineTo(w * .12, h * .93); x.lineTo(w * .14, h * .8);
    x.quadraticCurveTo(w * .4, h * .72, w * .46, h * .45); x.quadraticCurveTo(w * .5, h * .12, w * .16, 0); x.closePath(); x.fill();
    x.lineWidth = h * .05; for (const sg of [-1, 1]) { x.beginPath(); x.moveTo(sg * w * .13, h * .86); x.quadraticCurveTo(sg * w * .42, h * .9, sg * w * .38, h * .62); x.stroke(); }
    x.restore();
  } }));
  return g;
}

// A crowd on one sheet: n standing silhouettes walking the same way (+x), some with mantles.
export function crowd(U, { n = 5, h = .05, z = -.1, col = '#2a1a0e', gap = .028, seed = 3, trans = .08, rim = .55 } = {}) {
  const R = mulberry(seed), people = [];
  for (let i = 0; i < n; i++) people.push({ x: (i - (n - 1) / 2) * gap + (R() - .5) * gap * .35, s: h * (.86 + R() * .24), veil: R() < .45, lean: (R() - .3) * .06 });
  const W = n * gap + h * 1.2, H_ = h * 1.25, g = new THREE.Group(); g.position.z = z;
  g.add(mk(U, { w: W, h: H_, y: H_ / 2 - h * .03, z: 0, col, trans, ppm: 7000, finish: { rim, rimPx: 4, under: .2, rimCol: `rgba(255,226,170,${rim})` }, draw: x => {
    x.translate(0, -H_ / 2 + h * .03);
    for (const p of people) {
      x.save(); x.translate(p.x, 0); x.rotate(-p.lean); x.scale(p.s, p.s); POSES.stand.draw(x, p.veil); if (p.veil) mantle(x, POSES.stand.hd);
      x.beginPath(); x.moveTo(-.02, .74); x.lineTo(.05, .74); x.lineTo(.17, .4); x.lineTo(.12, .38); x.closePath(); x.fill(); x.restore();   // an arm swinging forward
    }
  } }));
  return g;   // a group: position it freely, its origin is the feet line
}
