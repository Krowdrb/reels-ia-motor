// Paper puppets: Clawd (a paper redraw of the pixel mascot, jointed), human silhouettes, tents, staff, bundle, stones, the far ark, rain sheets. Rotation only, like paper on a stick.
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
    // lookY: eyes up (+) / down (-); back: seen from behind (no eyes)
    set({ x = 0, y = 0, rot = 0, aL = 0, aR = 0, walk = 0, stride = 0, look = 0, lookY = 0, blink = 1, k = 1, s = 1, tuck = 0, back = false }) {
      g.position.x = x; g.position.y = y - tuck * 2 * u * s; g.rotation.z = rot; g.scale.setScalar(s);
      // a 2x2 nub looks the same turned 90°, so raising an arm lifts the nub up the side of the body (above the head when fully raised) with a small outward tilt
      const lift = a => Math.min(Math.max(a, 0) / 2.2, 1.15) * 4.6 * u;
      armL.position.y = 5 * u + lift(aL); armR.position.y = 5 * u + lift(aR);
      armL.rotation.z = -Math.min(aL, 2.4) * .3; armR.rotation.z = Math.min(aR, 2.4) * .3;
      legs.forEach((l, i) => { l.rotation.z = Math.sin(walk + i * Math.PI) * stride; });
      for (const [e, cx] of [[eyeL, -3.5], [eyeR, 3.5]]) { e.position.x = (cx + look * .9) * u; e.position.y = (7 + lookY * .8) * u; e.scale.y = Math.max(.12, blink); e.visible = !back; }
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
    x.beginPath(); x.moveTo(.05, .89); x.lineTo(.135, .775); x.lineTo(.02, .81); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(-.09, .98); x.quadraticCurveTo(-.15, .9, -.14, .74); x.lineTo(-.03, .86); x.closePath(); x.fill();
  } },
  sit: { sh: [.0, .52], draw(x) {
    x.beginPath(); x.moveTo(-.27, 0); x.bezierCurveTo(-.32, .2, -.27, .42, -.13, .56); x.quadraticCurveTo(-.03, .63, .05, .56); x.bezierCurveTo(.1, .42, .3, .37, .36, .27); x.lineTo(.38, 0); x.closePath(); x.fill();
    x.beginPath(); x.arc(.075, .63, .092, 0, 7); x.fill();
    x.beginPath(); x.moveTo(.11, .615); x.lineTo(.2, .505); x.lineTo(.08, .54); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(-.03, .71); x.quadraticCurveTo(-.1, .63, -.09, .47); x.lineTo(.04, .58); x.closePath(); x.fill();
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

// Mountain line: base + gaussian peaks + a little roughness; fills below
export function ridgeFill(x, { x0, x1, base, peaks, rough = .002, ph = 0 }) {
  x.beginPath(); x.moveTo(x0, -2);
  for (let u = x0; u <= x1 + .001; u += .001) { let y = base; for (const [px, ph_, pw] of peaks) y += ph_ * Math.exp(-(((u - px) / pw) ** 2)); y += rough * (Math.sin(u * 160 + ph) + .5 * Math.sin(u * 410 + ph * 2)); x.lineTo(u, y); }
  x.lineTo(x1, -2); x.closePath(); x.fill();
}

// —————————————————— «La cuenta de Matusalén» ——————————————————
// Tent of skins: origin at the bottom centre. A sagging ridge between two poles, guy ropes, seams cut through.
// The window (an opening that burns amber) glows via tent.material.userData.u.uGlowLit (0 dark .. 1 lit). win = [x as fraction of w, y as fraction of h]
export function tienda(U, { w = .07, h = .042, z = -.09, col = '#2a1f30', trans = .18, win = [.2, .42], glow = 2.6, glowCol = '#ffb862', seed = 3, ppm } = {}) {
  const W_ = w * 1.3, H_ = h * 1.3, ww = w * .1, wh = h * .2;
  return mk(U, { w: W_, h: H_, ay: -H_ / 2, z, col, trans, ppm: ppm || Math.min(4000, 1400 / w), finish: { rim: .6, rimPx: 3, under: .3 }, draw: x => {
    x.translate(0, -H_ / 2);
    x.beginPath(); x.moveTo(-w / 2, 0); x.lineTo(-w * .47, h * .55); x.quadraticCurveTo(-w * .36, h * .82, -w * .2, h); x.quadraticCurveTo(0, h * .8, w * .2, h);
    x.quadraticCurveTo(w * .36, h * .82, w * .47, h * .55); x.lineTo(w / 2, 0); x.closePath(); x.fill();
    for (const s of [-1, 1]) { x.fillRect(s * w * .2 - w * .007, h * .9, w * .014, h * .2); x.lineWidth = h * .014; x.beginPath(); x.moveTo(s * w * .2, h * 1.06); x.lineTo(s * w * .62, 0); x.stroke(); }
    cut(x, () => {
      x.lineWidth = h * .007; const R = mulberry(seed);
      if (w > .06) for (let i = -2; i <= 2; i++) { if (i === 0) continue; x.beginPath(); x.moveTo(i * w * .14, 0); x.lineTo(i * w * .085 + (R() - .5) * w * .02, h * .86); x.stroke(); }
      x.beginPath(); x.moveTo(-w * .07, 0); x.lineTo(-w * .05, h * .5); x.lineTo(-w * .02, h * .52); x.lineTo(-w * .005, 0); x.closePath(); x.fill();   // the door flap, folded back
    });
    x.fillRect(w * win[0] - ww / 2 - w * .012, h * win[1] - wh / 2 - w * .012, ww + w * .024, wh + w * .024);
  }, glowDraw: x => { x.translate(0, -H_ / 2); x.fillStyle = '#fff'; x.fillRect(w * win[0] - ww / 2, h * win[1] - wh / 2, ww, wh); }, glow, glowCol, glowRes: .5 });
}

// Shepherd's staff: origin at its foot; L = length; crook at the top bending toward +x
export function cayado(U, { L = .08, z = -.07, col = '#120c16', rim = .6 } = {}) {
  const t = L * .022;
  return mk(U, { w: L * .3, h: L * 1.1, ay: -L * .55, z, col, trans: .05, shadow: false, ppm: Math.min(6000, 600 / L), finish: { rim, rimPx: 3 }, draw: x => {
    x.translate(0, -L * .55); x.fillRect(-t / 2, 0, t, L * .9);
    x.lineWidth = t; x.beginPath(); x.moveTo(0, L * .9); x.quadraticCurveTo(0, L * 1.02, L * .06, L * 1.01); x.quadraticCurveTo(L * .1, L, L * .1, L * .93); x.stroke();
  } });
}

// A newborn: a small bundle of cloth, no features. Origin at its centre.
export function bebe(U, { s = .012, z = 0, col = '#d9c8a8' } = {}) {
  return mk(U, { w: s * 1.6, h: s, z, col, trans: .55, shadow: false, recv: false, ppm: Math.min(9000, 200 / s), finish: { rim: .5, rimPx: 3, under: .3 }, draw: x => {
    x.beginPath(); x.ellipse(-s * .1, 0, s * .52, s * .26, -.08, 0, 7); x.fill(); x.beginPath(); x.arc(s * .44, s * .06, s * .2, 0, 7); x.fill();
  } });
}

// Two stones: a big one (seat) and a low one. Origin at the bottom centre of each; returns the mesh. top = height.
export function piedra(U, { w = .03, top = .012, z = -.072, col = '#1a1220', seed = 2, trans = .08 } = {}) {
  const H_ = top * 1.4 + .004;
  return mk(U, { w: w * 1.15, h: H_, ay: -H_ / 2, z, col, trans, ppm: Math.min(5000, 900 / w), finish: { rim: .6, rimPx: 3, under: .3 }, draw: x => {
    x.translate(0, -H_ / 2); const R = mulberry(seed);
    x.beginPath(); x.moveTo(-w / 2, -.002); x.quadraticCurveTo(-w * .52, top * .7, -w * .3, top * .95); x.quadraticCurveTo(-w * .05, top * (1.08 + R() * .06), w * .25, top);
    x.quadraticCurveTo(w * .5, top * .8, w / 2, -.002); x.closePath(); x.fill();
  } });
}

// The ark, far and small (side view): a long low box with a roof and one window under the eaves. Origin at the middle of the keel line.
// planks > 0: the hull is cut into that many horizontal strips that can rise one by one (strips[i].position.y offset, 0 = in place); the roof is a separate sheet.
// The window glows via A.win.material.userData.u.uGlowLit (and emissiveIntensity).
export function arca(U, { L = .1, h = .022, z = -.13, col = '#2a2430', planks = 0, glow = 2.6, glowCol = '#ffb862', winCol = '#ffd08a' } = {}) {
  const g = new THREE.Group(); g.position.z = z; const rh = h * .3, P = Math.min(5000, 900 / L);
  const hullPath = (x, y0, y1) => {   // the hull profile between heights y0 and y1 (rounded ends, slight sheer)
    const xs = y => L / 2 - h * .25 * Math.pow(1 - y / h, 2);
    x.beginPath(); x.moveTo(-xs(y0), y0); x.lineTo(xs(y0), y0); x.lineTo(xs(y1), y1); x.lineTo(-xs(y1), y1); x.closePath(); x.fill();
  };
  const strips = [];
  const n = planks || 1;
  for (let i = 0; i < n; i++) {
    const y0 = i * h / n, y1 = (i + 1) * h / n + (i < n - 1 ? h * .004 : 0);
    const m = mk(U, { w: L * 1.04, h: h * 1.1, y: h * .5, z: -.0004 * (i % 2), col, trans: .1, ppm: P, finish: { rim: .55, rimPx: 2 }, shadow: false, draw: x => {
      x.translate(0, -h * .5); hullPath(x, y0, y1);
      if (n === 1) { x.strokeStyle = '#787878'; x.lineWidth = Math.max(h * .025, 1.2 / P); for (let j = 1; j < 4; j++) { const yy = y0 + j * (y1 - y0) / 4; x.beginPath(); x.moveTo(-L / 2, yy); x.lineTo(L / 2, yy); x.stroke(); } }
    } });
    g.add(m); strips.push(m);
  }
  const wl = L * .32, wy0 = h + rh * .05, wy1 = h + rh * .55;
  const roof = mk(U, { w: L * 1.1, h: rh * 2.4, y: h + rh * .6, z: .0003, col, trans: .1, ppm: P, finish: { rim: .6, rimPx: 2 }, shadow: false, draw: x => {
    x.translate(0, -(h + rh * .6));
    x.fillRect(-L * .44, h - rh * .1, L * .88, rh * .75);
    x.beginPath(); x.moveTo(-L * .5, h + rh * .6); x.lineTo(-L * .38, h + rh * 1.15); x.lineTo(L * .38, h + rh * 1.15); x.lineTo(L * .5, h + rh * .6); x.closePath(); x.fill();
    cut(x, () => x.fillRect(-wl / 2, wy0, wl, wy1 - wy0));
  } });
  const win = mk(U, { w: wl * 1.06, h: (wy1 - wy0) * 1.2, x: 0, y: (wy0 + wy1) / 2, z: -.0012, col: winCol, trans: .6, shadow: false, recv: false, ppm: P, finish: { rim: 0, under: 0 },
    draw: x => x.fillRect(-wl * .53, -(wy1 - wy0) * .6, wl * 1.06, (wy1 - wy0) * 1.2), glowDraw: x => { x.fillStyle = '#fff'; x.fillRect(-wl * .53, -(wy1 - wy0) * .6, wl * 1.06, (wy1 - wy0) * 1.2); }, glow, glowCol, glowRes: .5 });
  g.add(roof, win);
  return { g, strips, roof, win, winY: (wy0 + wy1) / 2 };
}

// Lantern on a stand: origin at the foot; glows warm (emissiveIntensity / uGlowLit)
export function lantern(U, { h = .02, z = -.06, k = 2.6 } = {}) {
  return mk(U, { w: h * .7, h: h * 1.05, y: h / 2, z, col: '#120c08', trans: .05, shadow: false, ppm: 6000, finish: { rim: .4 }, draw: x => {
    x.fillRect(-h * .02, -h / 2, h * .04, h * .6); x.fillRect(-h * .14, h * .08, h * .28, h * .3); x.beginPath(); x.moveTo(-h * .16, h * .38); x.lineTo(0, h * .5); x.lineTo(h * .16, h * .38); x.fill();
  }, glowDraw: x => { x.fillStyle = '#fff'; x.beginPath(); x.ellipse(0, h * .23, h * .1, h * .13, 0, 0, 7); x.fill(); }, glow: k, glowCol: '#ffb862', glowRes: .5 });
}

// Rain: one big sheet of slanted strokes, two tiles tall; set(t) slides it down and it recycles seamlessly (no loose drops). w×h = area to cover.
export function rain(U, { w = .3, h = .3, z = -.05, n = 160, len = .02, lw = .0004, col = '#7a7484', slant = .3, seed = 4, speed = .6, x = 0, y = 0 } = {}) {
  const m = mk(U, { w: w * 1.2, h: h * 2, z, col, trans: 0, shadow: false, recv: false, ppm: Math.min(1400, 2600 / h), finish: { rim: 0, under: 0, grain: false }, draw: c => {
    const G = mulberry(seed); c.lineWidth = lw; c.lineCap = 'round';
    for (let i = 0; i < n; i++) { const a = (G() - .5) * w * 1.2, b = G() * h, l = len * (.6 + G() * .8); for (const bb of [b, b - h]) { c.beginPath(); c.moveTo(a, bb); c.lineTo(a - l * slant, bb - l); c.stroke(); } }
  } });
  m.position.set(x, y + h / 2, z);
  m.userData.set = t => { m.position.y = y + h / 2 - ((t * speed) % h); };
  return m;
}
