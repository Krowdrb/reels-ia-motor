// Paper puppets: Clawd (a paper redraw of the pixel mascot, jointed), human silhouettes, the ship. Rotation only, like paper on a stick.
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
  stand: { sh: [.01, .74], draw(x) {
    x.beginPath(); x.moveTo(-.18, 0); x.bezierCurveTo(-.21, .26, -.17, .52, -.13, .68); x.quadraticCurveTo(-.11, .79, -.03, .81); x.lineTo(.05, .81);
    x.quadraticCurveTo(.13, .77, .13, .66); x.bezierCurveTo(.15, .45, .21, .22, .21, 0); x.closePath(); x.fill();
    x.beginPath(); x.arc(.015, .905, .092, 0, 7); x.fill();
    x.beginPath(); x.moveTo(.1, .93); x.lineTo(.128, .885); x.lineTo(.098, .872); x.closePath(); x.fill();   // a small nose, no features
    x.beginPath(); x.moveTo(.03, 1.0); x.quadraticCurveTo(-.09, 1.0, -.11, .88); x.quadraticCurveTo(-.14, .78, -.16, .64); x.lineTo(-.04, .8); x.closePath(); x.fill();   // mantle over the head
  } },
  sit: { sh: [.0, .52], draw(x) {
    x.beginPath(); x.moveTo(-.27, 0); x.bezierCurveTo(-.32, .2, -.27, .42, -.13, .56); x.quadraticCurveTo(-.03, .63, .05, .56); x.bezierCurveTo(.1, .42, .3, .37, .36, .27); x.lineTo(.38, 0); x.closePath(); x.fill();
    x.beginPath(); x.arc(.075, .63, .092, 0, 7); x.fill();
    x.beginPath(); x.moveTo(.16, .655); x.lineTo(.188, .61); x.lineTo(.158, .597); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(.09, .725); x.quadraticCurveTo(-.03, .725, -.05, .6); x.quadraticCurveTo(-.08, .5, -.11, .4); x.lineTo(.02, .52); x.closePath(); x.fill();
  } },
  kneel: { sh: [.02, .58], draw(x) {
    x.beginPath(); x.moveTo(-.3, 0); x.bezierCurveTo(-.3, .13, -.24, .32, -.15, .5); x.quadraticCurveTo(-.11, .62, -.02, .65); x.lineTo(.06, .65); x.quadraticCurveTo(.13, .61, .13, .5); x.bezierCurveTo(.13, .35, .2, .2, .26, 0); x.closePath(); x.fill();
    x.beginPath(); x.arc(.04, .745, .092, 0, 7); x.fill();
    x.beginPath(); x.moveTo(.075, .73); x.lineTo(.16, .62); x.lineTo(.05, .65); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(-.07, .82); x.quadraticCurveTo(-.13, .74, -.12, .58); x.lineTo(0, .7); x.closePath(); x.fill();
  } },
};
export function human(U, { h = .085, z = -.085, col = '#07101a', pose = 'stand', trans = .05, rim = .6, two = false } = {}) {
  const g = new THREE.Group(); g.position.z = z; const P = POSES[pose], W = h * 1.1, H_ = h * 1.12;
  const finish = { rim, rimPx: 4, under: .2, rimCol: `rgba(255,226,170,${rim})` };
  const body = mk(U, { w: W, h: H_, y: H_ / 2 - h * .03, z: 0, col, trans, finish, draw: x => { x.translate(0, -H_ / 2 + h * .03); x.scale(h, h); P.draw(x); } });
  const aw = h * .078, al = h * .37;
  const mkArm = dz => mk(U, { w: aw * 1.6, h: al * 1.25, x: P.sh[0] * h, y: P.sh[1] * h - al / 2, ay: al / 2, z: dz, col, trans, shadow: false, recv: false, finish,
    draw: x => { x.beginPath(); x.moveTo(-aw * .55, al / 2); x.lineTo(aw * .55, al / 2); x.lineTo(aw * .33, -al / 2); x.lineTo(-aw * .33, -al / 2); x.closePath(); x.fill(); x.beginPath(); x.arc(0, al / 2, aw * .55, 0, 7); x.fill(); x.beginPath(); x.ellipse(0, -al / 2, aw * .42, aw * .62, 0, 0, 7); x.fill(); } });
  const arm = mkArm(.0005), arm2 = two ? mkArm(-.0005) : null;
  g.add(body, arm); if (arm2) g.add(arm2);
  return { g, body, arm, set({ x = 0, y = 0, rot = 0, a = 0, s = 1 }) { g.position.x = x; g.position.y = y; g.rotation.z = rot; g.scale.setScalar(s); arm.rotation.z = a; if (arm2) arm2.rotation.z = a * .97; } };
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

// —— Jesús a los 12 años: pilgrims (bundle, staff, child on the shoulders), tents, Jerusalem, colonnades, paper screens ——
// A pilgrim: a standing silhouette plus optional bundle on the back, staff in the front hand, a child sitting on the shoulders
export function pilgrim(U, { h = .07, z = -.085, col = '#120f1e', rim = .5, bundle = false, staff = false, child = false, two = false } = {}) {
  const P = human(U, { h, z, col, rim, two });
  const finish = { rim, rimPx: 4, under: .2, rimCol: `rgba(255,226,170,${rim})` };
  if (bundle) P.g.add(mk(U, { w: h * .32, h: h * .34, x: -h * .17, y: h * .6, z: -.0006, col, trans: .05, finish, draw: x => { x.beginPath(); x.ellipse(0, 0, h * .13, h * .15, .3, 0, 7); x.fill(); x.fillRect(-h * .02, h * .1, h * .04, h * .05); } }));
  if (staff) P.g.add(mk(U, { w: h * .05, h: h * 1.12, x: h * .19, y: h * .53, z: .0009, col, trans: .05, shadow: false, finish, draw: x => { x.fillRect(-h * .011, -h * .56, h * .022, h * 1.12); } }));
  let kid = null;
  if (child) { kid = human(U, { h: h * .46, z: .0003, col, rim, pose: 'sit' }); kid.g.position.set(-h * .05, h * .8, .0003); P.g.add(kid.g); }
  const set0 = P.set;
  P.set = o => { set0(o); if (kid) { kid.g.position.set(-h * .05, h * .8, .0003); kid.arm.rotation.z = .6; } if (staff) P.arm.rotation.z = .5; };
  return P;
}

// A tent of dark cloth, origin at the middle of its base; the doorway is its own sheet (dark when unlit, warm light when lit)
export function tent(U, { w = .05, h = .04, z = -.09, col = '#1a2448', door = '#ffb862', k = 1, rim = .45 } = {}) {
  const g = new THREE.Group(); g.position.z = z;
  const body = mk(U, { w: w * 1.1, h: h * 1.15, y: h * .55, col, trans: .12, finish: { rim, rimPx: 4 }, draw: x => {
    x.translate(0, -h * .55);
    x.beginPath(); x.moveTo(-w * .5, 0); x.quadraticCurveTo(-w * .36, h * .5, -w * .06, h * .93); x.lineTo(0, h * 1.06); x.lineTo(w * .06, h * .93); x.quadraticCurveTo(w * .36, h * .5, w * .5, 0); x.closePath(); x.fill();
    x.fillRect(-w * .52, -h * .01, w * .08, h * .03); x.fillRect(w * .44, -h * .01, w * .08, h * .03);
  } });
  const dshape = c => { c.beginPath(); c.moveTo(-w * .14, 0); c.quadraticCurveTo(-w * .07, h * .36, 0, h * .6); c.quadraticCurveTo(w * .07, h * .36, w * .14, 0); c.closePath(); c.fill(); };
  const dr = mk(U, { w: w * .32, h: h * .64, y: h * .31, z: .0004, col: '#1a120c', trans: 0, shadow: false, recv: false, finish: { rim: 0, under: 0 },
    draw: c => { c.translate(0, -h * .31); dshape(c); }, glowDraw: c => { c.fillStyle = '#fff'; c.translate(0, -h * .31); dshape(c); }, glow: 2.6 * k, glowCol: door, glowRes: .6 });
  dr.material.userData.u.uGlowLit.value = 0;
  g.add(body, dr);
  return { g, body, door: dr, light(v) { dr.material.userData.u.uGlowLit.value = v; } };
}

// Jerusalem on its hill, origin at the foot of the hill; s = scale. The temple (top) has its own window; the houses' windows come in 3 groups
export function jerusalem(U, { s = 1, z = -.17, col = '#4a4468', win = '#ffc46a', k = 1 } = {}) {
  const g = new THREE.Group(); g.position.z = z; const R = mulberry(23), q = v => v * s;
  const houses = [];
  for (let i = 0; i < 16; i++) { const hx = -.052 + i * .0068 + (R() - .5) * .002; if (Math.abs(hx) < .013) continue; houses.push([hx, .031 + .012 * Math.exp(-hx * hx / .0012) + R() * .006, .005 + R() * .003]); }
  const top = u => .03 * Math.exp(-u * u / .0026);
  const hill = mk(U, { w: q(.24), h: q(.1), y: q(.04), col, trans: .25, ppm: 3000 / Math.max(.6, s * .7), finish: { rim: .45 }, draw: x => {
    x.scale(s, s); x.translate(0, -.04);
    x.beginPath(); x.moveTo(-.12, -.01); for (let u = -.12; u <= .12; u += .002) x.lineTo(u, top(u) - .004 + .002 * Math.sin(u * 300)); x.lineTo(.12, -.01); x.closePath(); x.fill();
    x.fillRect(-.062, .016, .124, .014); for (let u = -.062; u < .062; u += .0045) x.fillRect(u, .03, .0026, .003);   // wall and crenels
    x.fillRect(-.068, .014, .01, .024); x.fillRect(.058, .014, .01, .024);   // corner towers
    for (const [hx, hy, hw] of houses) x.fillRect(hx - hw / 2, .028, hw, hy - .028);
    x.fillRect(-.018, .044, .036, .006); x.fillRect(-.011, .05, .022, .016); x.fillRect(-.006, .066, .012, .004);   // the temple: platform, house, roof
  } });
  g.add(hill);
  const winSheet = (pts, sz, glow) => {
    const draw = c => { c.scale(s, s); c.translate(0, -.04); for (const [wx, wy, ww, wh] of pts) c.fillRect(wx - ww / 2, wy - wh / 2, ww, wh); };
    const m = mk(U, { w: q(.24), h: q(.1), y: q(.04), z: .0004, col: '#140f0a', trans: 0, shadow: false, recv: false, ppm: 3000 / Math.max(.6, s * .7), finish: { rim: 0, under: 0 },
      draw, glowDraw: c => { c.fillStyle = '#fff'; draw(c); }, glow: glow * k, glowCol: win, glowRes: .6 });
    m.material.userData.u.uGlowLit.value = 0; g.add(m); return m;
  };
  const temple = winSheet([[0, .058, .006, .009]], 1, 3.4);
  const groups = [0, 1, 2].map(j => winSheet(houses.filter((_, i) => i % 3 === j).map(([hx, hy]) => [hx, hy - .005, .0022, .003]), 1, 2.6));
  return { g, hill, temple, groups, light(kt, ks = [0, 0, 0]) { temple.material.userData.u.uGlowLit.value = kt; groups.forEach((m, i) => { m.material.userData.u.uGlowLit.value = ks[i] ?? 0; }); } };
}

// A row of columns with a lintel (one layer); xs = column centres
export function colonnade(U, { xs, y0, y1, cw = .012, z, col, trans = .12, lintel = .014, w = 1, ppm = 2600, finish = { rim: .5 } }) {
  const cy = (y0 + y1) / 2 + lintel / 2, hh = y1 - y0 + lintel + .004;
  return mk(U, { w, h: hh, y: cy, z, col, trans, ppm, finish, draw: x => {
    x.translate(0, -cy);
    for (const cx of xs) {
      x.fillRect(cx - cw * .8, y0, cw * 1.6, cw * .6); x.fillRect(cx - cw * .5, y0, cw, y1 - y0);
      x.fillRect(cx - cw * .8, y1 - cw * .7, cw * 1.6, cw * .7);
      x.fillStyle = '#7e7e7e'; for (let k = 1; k < 4; k++) x.fillRect(cx - cw * .5 + k * cw * .25 - cw * .03, y0 + cw * .8, cw * .06, y1 - y0 - cw * 1.6); x.fillStyle = '#9a9a9a';   // flutes
    }
    if (lintel) x.fillRect(-w / 2, y1, w, lintel);
  } });
}

// One leaf of a lattice screen (a paper door). Pivot (origin) on its outer edge; side = -1 left leaf, +1 right leaf. Rotate with rotation.y.
export function leaf(U, { W = .07, y0 = -.06, y1 = .2, z = -.05, side = -1, col = '#2a2720', rim = .55, trans = .3, seed = 1 }) {
  const hh = y1 - y0, cy = (y0 + y1) / 2;
  const m = mk(U, { w: W, h: hh, x: -side * W / 2, y: cy, ax: side * W / 2, z, col, trans, ppm: 2400, finish: { rim, rimPx: 5, under: .35 }, draw: x => {
    x.fillRect(-W / 2, -hh / 2, W, hh);
    cut(x, () => {
      const nx = 3, ny = Math.round(hh / (W / nx * 1.25)), cw = W / nx, ch = hh / ny;
      for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
        const cx = -W / 2 + (i + .5) * cw, cy2 = -hh / 2 + (j + .5) * ch;
        x.beginPath(); x.moveTo(cx, cy2 + ch * .36); x.lineTo(cx + cw * .32, cy2); x.lineTo(cx, cy2 - ch * .36); x.lineTo(cx - cw * .32, cy2); x.closePath(); x.fill();
      }
    });
  } });
  return m;
}
