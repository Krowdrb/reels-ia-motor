// Paper puppets: Clawd (a paper redraw of the pixel mascot, jointed), human silhouettes, the ship, the ark (side, front, section), dove, rain, the bow of light. Rotation only, like paper on a stick.
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

// —————————————————— The ark (Genesis 6:14-16): a long wooden box with a low roof, three decks, a window above, a door in the side ——————————————————
const ppmFor = (w, ppm) => ppm || Math.min(3200, 3400 / w);
// Side view. Origin at the middle of the keel line. L length, h hull height to the eaves, rh roof rise.
// built 0..1: planking up to built*h, bare ribs above (no roof). door [x as fraction of L, width / h, height / h]; win [x as fraction of L, length as fraction of L].
// scaffold 0..1: poles and planks in front (lanterns hang on it). Returns { g, hull, inner, door, scaf, levels, doorAt }
export function ark(U, { L = .5, h = .05, rh = h * .2, z = -.09, col = '#5e4f44', inner = '#f2cf98', built = 1, ppm, door = [.22, .3, .42], win = [-.05, .3], scaffold = 0, lanterns = 0, glow = 1.2, seed = 3, scafCol = '#0e0a08' } = {}) {
  const g = new THREE.Group(); g.position.z = z; const R = mulberry(seed);
  const pad = h * .06, Hc = h + rh + pad * 2, Wc = L + h * .3, P = ppmFor(Wc, ppm), sw = Math.max(h * .0045, 1.6 / P), strake = h / 12;
  const top = built >= 1 ? h : built * h, sill = h * .1;
  const dx = door[0] * L, dw = door[1] * h, dh = door[2] * h, wx = win[0] * L, wl = win[1] * L, wy0 = h - h * .13, wy1 = h - h * .04;
  const hull = mk(U, { w: Wc, h: Hc, y: Hc / 2 - pad, z: 0, col, trans: .12, ppm: P, finish: { rim: .55, rimPx: 4 }, draw: x => {
    x.translate(0, -(Hc / 2 - pad)); const r = h * .04;
    x.beginPath(); x.moveTo(-L / 2 + r, 0); x.lineTo(L / 2 - r, 0); x.quadraticCurveTo(L / 2, 0, L / 2, r); x.lineTo(L / 2, top); x.lineTo(-L / 2, top); x.lineTo(-L / 2, r); x.quadraticCurveTo(-L / 2, 0, -L / 2 + r, 0); x.fill();
    if (built < 1) {   // the work in progress: a few strakes running ahead, bare ribs, a top beam over part of the length
      for (let k = 0; k < 3; k++) x.fillRect(-L / 2, top + k * strake, L * (.75 - .22 * k + R() * .1), strake * .96);
      const n = Math.round(L / (h * .16)), rw = h * .022;
      for (let i = 0; i <= n; i++) { const xi = -L / 2 + i * L / n; x.fillRect(xi - rw / 2, top, rw, h - top + h * .01); }
      x.fillRect(-L / 2, h - h * .02, L * .55, h * .025);
    } else {
      x.fillStyle = '#7d7d7d'; const o = h * .08;   // the low roof
      x.beginPath(); x.moveTo(-L / 2 - o, h); x.lineTo(-L / 2 + rh * 2.4, h + rh); x.lineTo(L / 2 - rh * 2.4, h + rh); x.lineTo(L / 2 + o, h); x.closePath(); x.fill();
      x.fillStyle = PAPER;
    }
    x.fillStyle = '#6e6e6e'; for (const f of [1 / 3, 2 / 3]) if (f * h < top) x.fillRect(-L / 2, f * h - h * .012, L, h * .024);   // deck wales
    cut(x, () => {
      for (let j = 1; j * strake < top - strake * .3; j++) { x.fillRect(-L / 2, j * strake - sw / 2, L, sw); const off = (j % 3) * h * .31; for (let xj = -L / 2 + off + h * .2; xj < L / 2 - h * .1; xj += h * .93) x.fillRect(xj - sw / 2, (j - 1) * strake, sw, strake); }
      if (built >= 1) x.fillRect(wx - wl / 2, wy0, wl, wy1 - wy0);
      if (dh > 0 && sill + dh < top) x.fillRect(dx - dw / 2, sill, dw, dh);
      if (built >= 1) for (let xs = -L / 2 - h * .05; xs < L / 2 + h * .05; xs += h * .12) x.fillRect(xs, h + rh * .25, sw, rh * .6);   // roof boards
    });
    if (built >= 1) { x.fillStyle = PAPER; for (let xr = wx - wl / 2 + wl / 14; xr < wx + wl / 2 - wl / 30; xr += wl / 14) x.fillRect(xr - h * .006, wy0, h * .012, wy1 - wy0); }   // window mullions
  } });
  const hi = top * .97;   // the inner light only fills the planked part (never shows between bare ribs)
  const inner_ = mk(U, { w: L * .99, h: hi, y: hi / 2 + top * .015, z: -.0025, col: inner, trans: .3, shadow: false, recv: false, ppm: P * .5, finish: { rim: 0, under: 0 }, draw: x => x.fillRect(-L / 2, -hi / 2, L, hi),
    glowDraw: x => { x.translate(0, -hi / 2 - top * .015); x.fillStyle = '#1c1c1c'; x.fillRect(-L / 2, 0, L, top); x.fillStyle = '#fff'; if (built >= 1) x.fillRect(wx - wl / 2 - h * .02, wy0 - h * .02, wl + h * .04, wy1 - wy0 + h * .04); if (dh > 0) x.fillRect(dx - dw / 2 - h * .02, sill, dw + h * .04, dh + h * .02); }, glow, glowCol: '#ffc77a', glowRes: .25 });
  const doorM = dh > 0 ? mk(U, { w: dw, h: dh, ax: -dw / 2, x: dx, y: sill + dh / 2, z: .0012, col, trans: .1, ppm: P, finish: { rim: .55 }, draw: x => {
    x.fillRect(-dw / 2, -dh / 2, dw, dh); x.fillStyle = '#6a6a6a'; for (let k = 1; k < 5; k++) x.fillRect(-dw / 2 + k * dw / 5 - sw / 2, -dh / 2, sw, dh); x.fillRect(-dw / 2, dh * .25, dw, dh * .06); x.fillRect(-dw / 2, -dh * .3, dw, dh * .06);
  } }) : null;
  g.add(hull, inner_); if (doorM) g.add(doorM);
  const levels = [.3, .56, .82].map(f => f * h * Math.max(scaffold, .01) * 1.15);
  let scaf = null;
  if (scaffold > 0) {
    const sh = scaffold * h * 1.2, pt = h * .012;
    scaf = mk(U, { w: L + h * .3, h: sh + h * .05, y: (sh + h * .05) / 2 - h * .02, z: .008, col: scafCol, trans: .04, ppm: P, finish: { rim: .5, rimPx: 3 }, draw: x => {
      x.translate(0, -((sh + h * .05) / 2 - h * .02));
      const n = Math.round(L / (h * .42));
      for (let i = 0; i <= n; i++) { const xi = -L / 2 + i * L / n; x.fillRect(xi - pt / 2, 0, pt, sh); if (i < n) { x.save(); x.lineWidth = pt * .6; x.strokeStyle = PAPER; x.beginPath(); x.moveTo(xi, levels[0]); x.lineTo(xi + L / n, levels[1]); x.stroke(); x.restore(); } }
      for (const lv of levels) x.fillRect(-L / 2 - h * .05, lv - pt * .8, L + h * .1, pt * 1.6);
      for (let k = 0; k < lanterns; k++) { const xi = -L / 2 + (k + .5) * L / lanterns, lv = levels[k % 3]; x.fillRect(xi - pt * .15, lv - h * .05, pt * .3, h * .05); x.fillRect(xi - h * .013, lv - h * .085, h * .026, h * .036); }
    }, glowDraw: lanterns ? x => { x.translate(0, -((sh + h * .05) / 2 - h * .02)); x.fillStyle = '#fff'; for (let k = 0; k < lanterns; k++) { const xi = -L / 2 + (k + .5) * L / lanterns, lv = levels[k % 3]; x.beginPath(); x.arc(xi, lv - h * .067, h * .02, 0, 7); x.fill(); } } : undefined, glow: 3, glowCol: '#ffb862', glowRes: .4 });
    g.add(scaf);
  }
  return { g, hull, inner: inner_, door: doorM, scaf, levels, doorAt: { x: dx, y: sill, w: dw, h: dh }, win: { x: wx, y: wy0, l: wl } };
}

// Front (end) view: 50 by 30 cubits, a low gable, the window high under it. Origin at the middle of the keel line. Returns { g, face, inner, winY }
export function arkFront(U, { w = .1, h = .06, rh = h * .22, z = -.09, col = '#5e4f44', inner = '#f2cf98', ppm, glow = 1.6, winW = .26 } = {}) {
  const g = new THREE.Group(); g.position.z = z;
  const pad = h * .06, Hc = h + rh + pad * 2, Wc = w * 1.25, P = ppmFor(Wc, ppm || 4200), sw = Math.max(h * .006, 1.6 / P), strake = h / 12, o = w * .07;
  const wy0 = h - h * .2, wy1 = h - h * .06, ww = w * winW;
  const face = mk(U, { w: Wc, h: Hc, y: Hc / 2 - pad, z: 0, col, trans: .12, ppm: P, finish: { rim: .6, rimPx: 4 }, draw: x => {
    x.translate(0, -(Hc / 2 - pad)); const r = h * .05;
    x.beginPath(); x.moveTo(-w / 2 + r, 0); x.lineTo(w / 2 - r, 0); x.quadraticCurveTo(w / 2, 0, w / 2, r); x.lineTo(w / 2, h); x.lineTo(-w / 2, h); x.lineTo(-w / 2, r); x.quadraticCurveTo(-w / 2, 0, -w / 2 + r, 0); x.fill();
    x.fillStyle = '#7d7d7d'; x.beginPath(); x.moveTo(-w / 2 - o, h - h * .01); x.lineTo(0, h + rh); x.lineTo(w / 2 + o, h - h * .01); x.closePath(); x.fill();
    x.fillStyle = '#6a6a6a'; for (const f of [1 / 3, 2 / 3]) x.fillRect(-w / 2, f * h - h * .014, w, h * .028); x.fillRect(-w / 2, 0, h * .04, h); x.fillRect(w / 2 - h * .04, 0, h * .04, h);
    cut(x, () => {
      for (let j = 1; j * strake < h - strake * .3; j++) { x.fillRect(-w / 2, j * strake - sw / 2, w, sw); const off = (j % 2) * w * .22; for (let xj = -w / 2 + off + w * .15; xj < w / 2 - w * .05; xj += w * .45) x.fillRect(xj - sw / 2, (j - 1) * strake, sw, strake); }
      x.fillRect(-ww / 2, wy0, ww, wy1 - wy0);
    });
    x.fillStyle = PAPER; for (const f of [-1 / 6, 1 / 6]) x.fillRect(f * ww - h * .007, wy0, h * .014, wy1 - wy0);
  } });
  const inn = mk(U, { w: w * .98, h: h * .96, y: h * .5, z: -.003, col: inner, trans: .3, shadow: false, recv: false, ppm: P * .4, finish: { rim: 0, under: 0 }, draw: x => x.fillRect(-w / 2, -h / 2, w, h),
    glowDraw: x => { x.fillStyle = '#1a1a1a'; x.fillRect(-w / 2, -h / 2, w, h); x.fillStyle = '#fff'; x.fillRect(-ww / 2 - h * .02, wy0 - h / 2 - h * .02, ww + h * .04, wy1 - wy0 + h * .04); }, glow, glowCol: '#ffc77a', glowRes: .3 });
  g.add(face, inn);
  return { g, face, inner: inn, winY: [wy0, wy1], winW: ww };
}

// Cut-away: the ark as a lamp, three decks seen in section, each lit by its own sheet. The right end is the stern wall. Origin at the middle of the keel line.
// Returns { g, frame, floors[3], winGlow, doorGlow, floorY[3], fh, win:{x,y,w,h} }
export function arkSection(U, { W = .36, h = .13, rh = .035, z = -.09, col = '#241b14', ppm } = {}) {
  const g = new THREE.Group(); g.position.z = z;
  const dt = h * .055, fh = (h - 4 * dt) / 3, wallT = h * .06, P = ppmFor(W, ppm || 3600), pad = h * .05, Hc = h + rh + pad * 2;
  const floorY = [0, 1, 2].map(i => dt + i * (fh + dt));
  const win = { x: W / 2 - rh * 2.6, y: h + rh * .18, w: rh * 1.15, h: rh * .62 };
  const frame = mk(U, { w: W + h * .2, h: Hc, y: Hc / 2 - pad, z: 0, col, trans: .1, ppm: P, finish: { rim: .6, rimPx: 4 }, draw: x => {
    x.translate(0, -(Hc / 2 - pad));
    x.fillRect(-W / 2 - h * .1, 0, W + h * .1, h);
    x.beginPath(); x.moveTo(-W / 2 - h * .1, h); x.lineTo(-W / 2 - h * .1, h + rh); x.lineTo(W / 2 - rh * 1.4, h + rh); x.lineTo(W / 2 + h * .06, h); x.closePath(); x.fill();
    cut(x, () => { for (const y0 of floorY) x.fillRect(-W / 2 - h * .2, y0, W + h * .2 - wallT, fh); x.fillRect(win.x - win.w / 2, win.y, win.w, win.h); });
    x.fillStyle = PAPER; const n = 6;
    for (const y0 of floorY) for (let i = 1; i < n; i++) { const xi = -W / 2 + i * W / n; x.fillRect(xi - h * .009, y0, h * .018, fh); x.fillRect(xi - h * .04, y0 + fh - h * .02, h * .08, h * .012); }   // posts and brackets between the rooms
  } });
  const floors = floorY.map((y0, i) => mk(U, { w: W, h: fh + dt, x: 0, y: y0 + fh / 2, z: -.004, col: '#e7cf9e', trans: .9, shadow: false, recv: true, ppm: P * .5, finish: { rim: 0, under: .3 },
    draw: x => { x.fillRect(-W / 2, -fh / 2 - dt / 2, W, fh + dt); x.fillStyle = '#7a7a7a'; for (let k = 0; k < 14; k++) x.fillRect(-W / 2 + k * W / 14, -fh / 2, h * .004, fh); x.fillRect(-W / 2, -fh * .1, W, h * .004); },
    glowDraw: x => { const gr = x.createLinearGradient(0, fh / 2, 0, -fh / 2); gr.addColorStop(0, '#fff'); gr.addColorStop(1, '#8a8a8a'); x.fillStyle = gr; x.fillRect(-W / 2, -fh / 2 - dt / 2, W, fh + dt); }, glow: 1.3, glowCol: '#ffd08a', glowRes: .3 }));
  const winGlow = mk(U, { w: win.w * 1.3, h: win.h * 1.3, x: win.x, y: win.y + win.h / 2, z: -.006, col: '#f4dcae', trans: .9, shadow: false, recv: false, finish: { rim: 0, under: 0 }, draw: x => x.fillRect(-win.w * .65, -win.h * .65, win.w * 1.3, win.h * 1.3),
    glowDraw: x => { x.fillStyle = '#fff'; x.fillRect(-win.w * .65, -win.h * .65, win.w * 1.3, win.h * 1.3); }, glow: 2.2, glowCol: '#ffe0a0', glowRes: .3 });
  const dW = fh * .5, dH = fh * .8, dX = W / 2 - wallT - dW * .9;
  const doorGlow = mk(U, { w: dW, h: dH, x: dX, y: floorY[0] + dH / 2, z: -.0035, col: '#fff0cc', trans: .9, shadow: false, recv: false, finish: { rim: .3, under: .2 }, draw: x => x.fillRect(-dW / 2, -dH / 2, dW, dH),
    glowDraw: x => { x.fillStyle = '#fff'; x.fillRect(-dW / 2, -dH / 2, dW, dH); }, glow: 2.6, glowCol: '#ffe2a8', glowRes: .3 });
  g.add(frame, ...floors, winGlow, doorGlow);
  return { g, frame, floors, winGlow, doorGlow, floorY, fh, win };
}

// Ladder: origin at the foot, centred
export function ladder(U, { h = .1, w = .012, z = -.08, col = '#120d09' } = {}) {
  return mk(U, { w: w * 1.4, h: h * 1.02, y: h / 2, z, col, trans: .05, ppm: 3600, finish: { rim: .5, rimPx: 3 }, draw: x => {
    const t = w * .12; x.fillRect(-w / 2 - t / 2, -h / 2, t, h); x.fillRect(w / 2 - t / 2, -h / 2, t, h);
    for (let y = -h / 2 + w * .6; y < h / 2 - w * .2; y += w * .75) x.fillRect(-w / 2, y - t * .4, w, t * .8);
  } });
}

// Lantern on a stand: origin at the foot; glows warm
export function lantern(U, { h = .02, z = -.06, k = 2.6 } = {}) {
  return mk(U, { w: h * .7, h: h * 1.05, y: h / 2, z, col: '#120c08', trans: .05, shadow: false, ppm: 6000, finish: { rim: .4 }, draw: x => {
    x.fillRect(-h * .02, -h / 2, h * .04, h * .6); x.fillRect(-h * .14, h * .08, h * .28, h * .3); x.beginPath(); x.moveTo(-h * .16, h * .38); x.lineTo(0, h * .5); x.lineTo(h * .16, h * .38); x.fill();
  }, glowDraw: x => { x.fillStyle = '#fff'; x.beginPath(); x.ellipse(0, h * .23, h * .1, h * .13, 0, 0, 7); x.fill(); }, glow: k, glowCol: '#ffb862', glowRes: .5 });
}

// Dove, side view facing -x (dir 1) or +x (dir -1): body + two wings that rotate at the shoulder + an olive leaf in the beak. Origin at the body centre.
export function dove(U, { s = .02, z = -.07, col = '#f1eadc', leaf = '#9a9f68', dir = 1 } = {}) {
  const g = new THREE.Group(); g.position.z = z; const d = -dir;
  const P = 9000;
  const body = mk(U, { w: s * 1.8, h: s * .8, z: 0, col, trans: .75, shadow: false, recv: false, ppm: P, finish: { rim: .5, rimPx: 3 }, draw: x => {
    x.scale(d, 1); x.beginPath(); x.ellipse(0, 0, s * .42, s * .17, -.08, 0, 7); x.fill();
    x.beginPath(); x.arc(s * .42, s * .1, s * .12, 0, 7); x.fill();
    x.beginPath(); x.moveTo(s * .52, s * .13); x.lineTo(s * .64, s * .08); x.lineTo(s * .52, s * .06); x.fill();
    x.beginPath(); x.moveTo(-s * .3, s * .02); x.lineTo(-s * .78, s * .14); x.lineTo(-s * .8, -s * .06); x.lineTo(-s * .3, -s * .1); x.closePath(); x.fill();
  } });
  const leafM = mk(U, { w: s * .4, h: s * .3, x: d * s * .7, y: s * .05, z: .0004, col: leaf, trans: .6, shadow: false, recv: false, ppm: P, finish: { rim: .3 }, draw: x => {
    x.scale(d, 1); x.beginPath(); x.ellipse(s * .05, -s * .02, s * .13, s * .045, -.5, 0, 7); x.fill(); x.fillRect(-s * .1, s * .03, s * .08, s * .012);
  } });
  const wing = (dz, c) => mk(U, { w: s * 1.4, h: s * 1.4, ax: 0, ay: 0, x: d * s * .02, y: s * .06, z: dz, col: c, trans: .8, shadow: false, recv: false, ppm: P, finish: { rim: .5, rimPx: 3 }, draw: x => {
    x.scale(d, 1); x.beginPath(); x.moveTo(s * .12, 0); x.quadraticCurveTo(s * .05, s * .4, -s * .25, s * .62); x.lineTo(-s * .38, s * .55); x.lineTo(-s * .42, s * .42); x.lineTo(-s * .45, s * .3); x.quadraticCurveTo(-s * .3, s * .1, -s * .2, -s * .02); x.closePath(); x.fill();
  } });
  const wNear = wing(.0006, col), wFar = wing(-.0006, '#bdb3a2');
  g.add(wFar, body, leafM, wNear);
  return { g, set({ x = 0, y = 0, flap = 0, rot = 0 }) { g.position.x = x; g.position.y = y; g.rotation.z = rot; wNear.rotation.z = d * flap; wFar.rotation.z = d * flap * .8 - d * .2; } };
}

// Rain: thin paper strips on one sheet two tiles tall; move it with set(t) and it recycles seamlessly. w×h is the area to cover.
export function rain(U, { w = .3, h = .3, z = -.05, n = 160, len = .02, lw = .0004, col = '#aebfdc', slant = .25, seed = 4, speed = .6, x = 0, y = 0 } = {}) {
  const m = mk(U, { w: w * 1.2, h: h * 2, z, col, trans: 0, shadow: false, recv: false, ppm: Math.min(1600, 3000 / h), finish: { rim: 0, under: 0, grain: false }, draw: c => {
    const G = mulberry(seed); c.lineWidth = lw; c.lineCap = 'round';
    for (let i = 0; i < n; i++) { const a = (G() - .5) * w * 1.2, b = G() * h, l = len * (.6 + G() * .8); for (const bb of [b, b - h]) { c.beginPath(); c.moveTo(a, bb); c.lineTo(a - l * slant, bb - l); c.stroke(); } }
  } });
  m.position.set(x, y + h / 2, z);
  m.userData.set = t => { m.position.y = y + h / 2 - ((t * speed) % h); m.position.x = x + ((t * speed * slant) % (w * .1)) * 0; };
  return m;
}

// The bow in the clouds (9:13): seven translucent bands, upper half-annuli centred at (cx, cy). set(i, k) grows band i from its left foot (k 0..1).
export function bowBands(U, { R = .09, cx = 0, cy = 0, z = -.13, bw = .0042, gap = .0006, glow = 1.1, cols = ['#f6c48e', '#f8d68f', '#f9e6a6', '#f7eccb', '#f3d0c4', '#e4c6d8', '#d4c8e2'] } = {}) {
  const bands = cols.map((c, i) => {
    const ro = R - i * (bw + gap), ri = ro - bw, P = Math.min(4000, 3000 / ro);
    const m = mk(U, { w: ro * 2.04, h: ro * 1.02, x: cx, y: cy + ro * .5, z: z + i * .0003, col: c, trans: .95, shadow: false, recv: false, ppm: P, finish: { rim: .25, under: .1 }, draw: x => {
      x.translate(0, -ro * .5); x.beginPath(); x.arc(0, 0, ro, 0, Math.PI); x.arc(0, 0, ri, Math.PI, 0, true); x.closePath(); x.fill();
    }, glowDraw: x => { x.translate(0, -ro * .5); x.fillStyle = '#fff'; x.beginPath(); x.arc(0, 0, ro, 0, Math.PI); x.arc(0, 0, ri, Math.PI, 0, true); x.closePath(); x.fill(); }, glow, glowCol: c, glowRes: .3 });
    m.userData.r = (ro + ri) / 2; m.visible = false; return m;
  });
  return { bands, set(i, k) { const m = bands[i], r = m.userData.r; m.visible = k > .001; m.material.userData.u.uClip.value.set(cx - r, cy, k * 2.15 * r, 0); } };
}

// Mountain line: base + gaussian peaks + a little roughness; fills below
export function ridgeFill(x, { x0, x1, base, peaks, rough = .002, ph = 0 }) {
  x.beginPath(); x.moveTo(x0, -2);
  for (let u = x0; u <= x1 + .001; u += .001) { let y = base; for (const [px, ph_, pw] of peaks) y += ph_ * Math.exp(-(((u - px) / pw) ** 2)); y += rough * (Math.sin(u * 160 + ph) + .5 * Math.sin(u * 410 + ph * 2)); x.lineTo(u, y); }
  x.lineTo(x1, -2); x.closePath(); x.fill();
}
