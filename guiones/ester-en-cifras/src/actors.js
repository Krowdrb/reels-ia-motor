// Paper puppets: Clawd (a paper redraw of the pixel mascot, jointed), human silhouettes (with crown, robe, back view, frontal king), the ship,
// and the props of «Ester en cifras»: the golden sceptre, the throne, column strips, the court doors with their slit of light, oil lamps, a blank scroll.
// Rotation only, like paper on a stick.
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
  stand: { sh: [.01, .74], hd: [.015, .905], draw(x) {
    x.beginPath(); x.moveTo(-.18, 0); x.bezierCurveTo(-.21, .26, -.17, .52, -.13, .68); x.quadraticCurveTo(-.11, .79, -.03, .81); x.lineTo(.05, .81);
    x.quadraticCurveTo(.13, .77, .13, .66); x.bezierCurveTo(.15, .45, .21, .22, .21, 0); x.closePath(); x.fill();
    x.beginPath(); x.arc(.015, .905, .092, 0, 7); x.fill();
    x.beginPath(); x.moveTo(.05, .89); x.lineTo(.135, .775); x.lineTo(.02, .81); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(-.09, .98); x.quadraticCurveTo(-.15, .9, -.14, .74); x.lineTo(-.03, .86); x.closePath(); x.fill();
  } },
  sit: { sh: [.0, .52], hd: [.075, .63], draw(x) {
    x.beginPath(); x.moveTo(-.27, 0); x.bezierCurveTo(-.32, .2, -.27, .42, -.13, .56); x.quadraticCurveTo(-.03, .63, .05, .56); x.bezierCurveTo(.1, .42, .3, .37, .36, .27); x.lineTo(.38, 0); x.closePath(); x.fill();
    x.beginPath(); x.arc(.075, .63, .092, 0, 7); x.fill();
    x.beginPath(); x.moveTo(.11, .615); x.lineTo(.2, .505); x.lineTo(.08, .54); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(-.03, .71); x.quadraticCurveTo(-.1, .63, -.09, .47); x.lineTo(.04, .58); x.closePath(); x.fill();
  } },
  kneel: { sh: [.02, .58], hd: [.04, .745], draw(x) {
    x.beginPath(); x.moveTo(-.3, 0); x.bezierCurveTo(-.3, .13, -.24, .32, -.15, .5); x.quadraticCurveTo(-.11, .62, -.02, .65); x.lineTo(.06, .65); x.quadraticCurveTo(.13, .61, .13, .5); x.bezierCurveTo(.13, .35, .2, .2, .26, 0); x.closePath(); x.fill();
    x.beginPath(); x.arc(.04, .745, .092, 0, 7); x.fill();
    x.beginPath(); x.moveTo(.075, .73); x.lineTo(.16, .62); x.lineTo(.05, .65); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(-.07, .82); x.quadraticCurveTo(-.13, .74, -.12, .58); x.lineTo(0, .7); x.closePath(); x.fill();
  } },
  // seen from behind, standing: shoulders, a long royal robe widening to the floor, the head veiled (no face). Symmetric.
  back: { sh: [.13, .74], hd: [0, .9], draw(x) {
    x.beginPath(); x.moveTo(-.3, 0); x.quadraticCurveTo(-.24, .3, -.15, .6); x.quadraticCurveTo(-.15, .76, -.06, .8); x.lineTo(.06, .8); x.quadraticCurveTo(.15, .76, .15, .6);
    x.quadraticCurveTo(.24, .3, .3, 0); x.closePath(); x.fill();
    x.beginPath(); x.arc(0, .895, .088, 0, 7); x.fill();
    x.beginPath(); x.moveTo(-.07, .93); x.quadraticCurveTo(-.12, .8, -.16, .62); x.lineTo(.16, .62); x.quadraticCurveTo(.12, .8, .07, .93); x.closePath(); x.fill();   // the veil over the shoulders
  } },
  // frontal king on his seat: head, shoulders, knees, robe to the floor. Symmetric; the sceptre is a separate leaf.
  throne: { sh: [.15, .56], hd: [0, .66], draw(x) {
    x.beginPath(); x.moveTo(-.26, 0); x.lineTo(-.25, .3); x.quadraticCurveTo(-.25, .36, -.18, .38); x.quadraticCurveTo(-.17, .5, -.14, .55); x.quadraticCurveTo(-.12, .6, -.05, .6);
    x.lineTo(.05, .6); x.quadraticCurveTo(.12, .6, .14, .55); x.quadraticCurveTo(.17, .5, .18, .38); x.quadraticCurveTo(.25, .36, .25, .3); x.lineTo(.26, 0); x.closePath(); x.fill();
    x.beginPath(); x.arc(0, .665, .085, 0, 7); x.fill();
    x.fillRect(-.03, .57, .06, .05);
  } },
};
// crown: a small cut-paper diadem of three points on the head (dark paper with a lit rim, never gold: the sceptre is the only gold)
const crownDraw = (x, [hx, hy]) => { x.beginPath(); x.moveTo(hx - .068, hy + .055); x.lineTo(hx - .072, hy + .125); x.lineTo(hx - .036, hy + .088); x.lineTo(hx, hy + .14); x.lineTo(hx + .036, hy + .088); x.lineTo(hx + .072, hy + .125); x.lineTo(hx + .068, hy + .055); x.closePath(); x.fill(); };
// robe: a long train on the floor behind a standing figure (side view, trailing toward -x)
const robeDraw = x => { x.beginPath(); x.moveTo(-.16, .5); x.quadraticCurveTo(-.3, .2, -.5, 0); x.lineTo(-.1, 0); x.closePath(); x.fill(); };
export function human(U, { h = .085, z = -.085, col = '#07101a', pose = 'stand', trans = .05, rim = .6, two = false, crown = false, robe = false, arms = true } = {}) {
  const g = new THREE.Group(); g.position.z = z; const P = POSES[pose], W = h * (robe ? 1.5 : 1.1), H_ = h * 1.12;
  const finish = { rim, rimPx: 4, under: .2, rimCol: `rgba(255,226,170,${rim})` };
  const body = mk(U, { w: W, h: H_, y: H_ / 2 - h * .03, z: 0, col, trans, finish, draw: x => { x.translate(0, -H_ / 2 + h * .03); x.scale(h, h); P.draw(x); if (crown) crownDraw(x, P.hd); if (robe) robeDraw(x); } });
  const aw = h * .078, al = h * .37;
  const mkArm = (dz, sx = 1) => mk(U, { w: aw * 1.6, h: al * 1.25, x: sx * P.sh[0] * h, y: P.sh[1] * h - al / 2, ay: al / 2, z: dz, col, trans, shadow: false, recv: false, finish,
    draw: x => { x.beginPath(); x.moveTo(-aw * .55, al / 2); x.lineTo(aw * .55, al / 2); x.lineTo(aw * .33, -al / 2); x.lineTo(-aw * .33, -al / 2); x.closePath(); x.fill(); x.beginPath(); x.arc(0, al / 2, aw * .55, 0, 7); x.fill(); x.beginPath(); x.ellipse(0, -al / 2, aw * .42, aw * .62, 0, 0, 7); x.fill(); } });
  const arm = arms ? mkArm(.0005) : null, arm2 = arms && two ? mkArm(-.0005, pose === 'back' ? -1 : 1) : null;
  g.add(body); if (arm) g.add(arm); if (arm2) g.add(arm2);
  return { g, body, arm, arm2, al, h, set({ x = 0, y = 0, rot = 0, a = 0, a2 = null, s = 1 }) { g.position.x = x; g.position.y = y; g.rotation.z = rot; g.scale.set(Math.sign(g.scale.x || 1) * s, s, s); if (arm) arm.rotation.z = a; if (arm2) arm2.rotation.z = a2 ?? a * .97; } };
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

// —————————————————— «Ester en cifras» ——————————————————
export const GOLD = '#ffd98a';
// The golden sceptre: a thin rod with a round finial. Origin (pivot) at the grip; it extends along -y (so, fixed to a hanging arm, it follows the arm).
// The only gold leaf of the film: it carries its own emissive glow (k via set()).
export function cetro(U, { L = .045, z = .0008, glow = 2.2 } = {}) {
  const t = L * .05, r = L * .085;
  const m = mk(U, { w: r * 3, h: L * 1.25, y: -L * .52, ay: L * .52, z, col: '#e9b860', trans: .5, shadow: false, recv: false, ppm: Math.min(9000, 700 / L), finish: { rim: .7, under: .3, rimPx: 3 },
    draw: x => { x.translate(0, L * .52); x.fillRect(-t / 2, -L, t, L * 1.1); x.beginPath(); x.arc(0, -L - r * .6, r, 0, TAU); x.fill(); x.fillRect(-t * 1.3, -L * .08, t * 2.6, t * 1.2); },
    glowDraw: x => { x.translate(0, L * .52); x.fillStyle = '#777'; x.fillRect(-t / 2, -L, t, L * 1.1); x.fillStyle = '#fff'; x.beginPath(); x.arc(0, -L - r * .6, r * 1.05, 0, TAU); x.fill(); }, glow, glowCol: GOLD, glowRes: .6 });
  m.userData.tip = [0, -L - r * .6];
  m.userData.set = k => { m.material.emissiveIntensity = glow * k; };
  return m;
}
// Throne: a tall back with two finials and one step; frontal. Origin at the bottom centre. w = seat width.
export function trono(U, { w = .03, z = -.14, col = '#1a1220', trans = .1 } = {}) {
  const h = w * 2.3;
  return mk(U, { w: w * 1.5, h: h * 1.08, y: h * .54, z, col, trans, ppm: Math.min(5000, 900 / w), finish: { rim: .55, rimPx: 3, under: .3 }, draw: x => {
    x.translate(0, -h * .54);
    x.fillRect(-w * .7, 0, w * 1.4, h * .05);                                   // the step
    x.fillRect(-w * .5, h * .05, w, h * .32);                                   // the seat block
    x.beginPath(); x.moveTo(-w * .44, h * .3); x.lineTo(-w * .44, h * .86); x.quadraticCurveTo(0, h * 1.02, w * .44, h * .86); x.lineTo(w * .44, h * .3); x.closePath(); x.fill();
    for (const s of [-1, 1]) { x.fillRect(s * w * .5 - w * .05, h * .3, w * .1, h * .62); x.beginPath(); x.arc(s * w * .5, h * .95, w * .07, 0, TAU); x.fill(); }
  } });
}
// A strip of n slender columns (Achaemenid: thin shaft, double-headed capital, no detail). Origin at the strip's bottom centre. Returns one sheet.
// lintel: a beam across the top. gap: distance between columns.
export function columnas(U, { n = 6, gap = .06, h = .16, w = .008, z = -.1, col = '#46344e', trans = .2, lintel = true, rim = .5, ppm } = {}) {
  const W = n * gap + w * 3, H = h * 1.08;
  return mk(U, { w: W, h: H, y: H / 2, z, col, trans, ppm: ppm || Math.min(3200, 1100 / W), finish: { rim, rimPx: 3, under: .3 }, draw: x => {
    x.translate(0, -H / 2);
    for (let i = 0; i < n; i++) {
      const cx = (i - (n - 1) / 2) * gap;
      x.fillRect(cx - w * .9, 0, w * 1.8, h * .03); x.fillRect(cx - w / 2, h * .03, w, h * .82);
      x.beginPath(); x.moveTo(cx - w * .5, h * .85); x.quadraticCurveTo(cx - w * 1.6, h * .86, cx - w * 1.9, h * .92); x.lineTo(cx + w * 1.9, h * .92); x.quadraticCurveTo(cx + w * 1.6, h * .86, cx + w * .5, h * .85); x.closePath(); x.fill();
      x.fillRect(cx - w * 1.3, h * .92, w * 2.6, h * .025);
    }
    if (lintel) x.fillRect(-W / 2, h * .945, W, h * .055);
  } });
}
// One column pair cut as left/right halves of a frame (the court: columns and a curtain in front, an opening in the middle). Like the template's rib rings, the halves part.
// Returns { L, R, x0, part(k) } ; open: half-width of the opening at rest.
export function portico(U, { z, col, trans = .1, open = .03, w = .5, h = .5, cy = 0, seed = 1, curtain = true, rim = .5, floorY = null } = {}) {
  const half = s => mk(U, { w: w / 2, h, x: s * w / 4, y: cy, z, col, trans, ppm: Math.min(3000, 1000 / w), finish: { rim, rimPx: 4, under: .35 }, draw: x => {
    const ix = -s * w / 4;   // x of the opening centre in this canvas
    const in_ = ix + s * open;   // the inner edge of this half
    x.beginPath(); x.moveTo(in_, -h / 2); x.lineTo(s * w / 4, -h / 2); x.lineTo(s * w / 4, h / 2); x.lineTo(ix, h / 2); x.lineTo(ix, h * .38);
    if (curtain) { x.quadraticCurveTo(in_ + s * open * .1, h * .3, in_ + s * open * .5, h * .12); x.quadraticCurveTo(in_, h * .0, in_, -h * .1); }   // a draped curtain edge
    x.lineTo(in_, -h / 2); x.closePath(); x.fill();
    if (floorY !== null) x.fillRect(Math.min(ix, s * w / 4), -h / 2, w / 2, floorY + h / 2);   // this depth's floor stripe, to the middle
    cut(x, () => { const R = mulberry(seed); for (let i = 0; i < 3; i++) { const cxx = in_ + s * (open * .9 + i * w * .06 + R() * .004); x.fillRect(cxx - .0007, -h * .45, .0014, h * .55); } });   // thin slits: fluting/pleats seen against the light
  } });
  const L = half(-1), R = half(1);
  return { L, R, x0: w / 4, part(k) { L.position.x = -w / 4 - k; R.position.x = w / 4 + k; } };
}
// The court doors: two tall leaves meeting in the middle, with a slit of gold between and under them (emissive, separate leaf behind).
// Origin at the bottom centre. set(open 0..1, slitK): the leaves slide apart sideways (a curtain), slitK = brightness of the slit.
export function puertas(U, { w = .07, h = .12, z = -.12, col = '#1c1224', frame = '#2a1d36', slitCol = GOLD, trans = .08 } = {}) {
  const g = new THREE.Group(); g.position.z = z;
  const leaf = s => mk(U, { w: w / 2, h, x: s * w / 4, y: h / 2 + h * .006, z: 0, col, trans, ppm: Math.min(5000, 900 / w), finish: { rim: .45, rimPx: 3, under: .3 }, draw: x => {
    x.fillRect(-w / 4 + w * .004, -h / 2, w / 2 - w * .008, h);
    cut(x, () => { for (const fy of [.28, -.12]) { x.lineWidth = w * .006; x.strokeRect(-w * .17, fy * h - h * .14, w * .34, h * .28); } });   // two recessed panels
    x.beginPath(); x.arc(-s * w * .17, -h * .02, w * .012, 0, TAU); x.fill();
  } });
  const L = leaf(-1), R = leaf(1);
  const fr = mk(U, { w: w * 1.5, h: h * 1.3, y: h * .62, z: .0006, col: frame, trans: .1, ppm: Math.min(4000, 800 / w), finish: { rim: .5, rimPx: 3, under: .3 }, draw: x => {
    x.translate(0, -h * .62); x.fillRect(-w * .72, 0, w * .2, h * 1.05); x.fillRect(w * .52, 0, w * .2, h * 1.05);
    x.beginPath(); x.moveTo(-w * .74, h * 1.02); x.lineTo(w * .74, h * 1.02); x.lineTo(w * .74, h * 1.12); x.quadraticCurveTo(0, h * 1.28, -w * .74, h * 1.12); x.closePath(); x.fill();
  } });
  const slit = mk(U, { w: w * 1.1, h: h * 1.05, y: h * .52, z: -.0012, col: '#ffe7b0', trans: .9, shadow: false, recv: false, ppm: Math.min(3000, 600 / w), finish: { rim: 0, under: 0 },
    draw: x => { x.fillRect(-w * .5, -h * .52, w, h * 1.03); },
    glowDraw: x => { const gr = x.createLinearGradient(0, -h * .52, 0, h * .5); gr.addColorStop(0, '#fff'); gr.addColorStop(.12, '#fff'); gr.addColorStop(1, '#ffe2b0'); x.fillStyle = gr; x.fillRect(-w * .5, -h * .52, w, h * 1.03); }, glow: 2.4, glowCol: slitCol, glowRes: .3 });
  g.add(slit, L, R, fr);
  return { g, L, R, fr, slit, w, h, set(open = 0, k = 1) {
    const d = open * w * .52; L.position.x = -w / 4 - d; R.position.x = w / 4 + d;
    const gap = .0016 + open * w;   // the leaves are cut .002 short of the middle: a hairline of gold shows between them when shut
    slit.material.emissiveIntensity = 2.4 * k; slit.scale.x = 1; slit.visible = k > .001;
  } };
}
// Oil lamp: a clay oval with a spout; the flame is a separate emissive leaf that flickers and can go out. Origin under the base.
export function lampara(U, { s = .03, z = -.06, col = '#2a1d22', flameCol = '#ffb862' } = {}) {
  const g = new THREE.Group(); g.position.z = z;
  const body = mk(U, { w: s * 1.5, h: s * .6, y: s * .2, z: 0, col, trans: .1, shadow: false, ppm: Math.min(9000, 240 / s), finish: { rim: .55, under: .35 }, draw: x => {
    x.beginPath(); x.ellipse(-s * .08, -s * .03, s * .36, s * .17, 0, 0, TAU); x.fill();
    x.beginPath(); x.moveTo(s * .15, s * .08); x.quadraticCurveTo(s * .42, s * .1, s * .55, s * .07); x.quadraticCurveTo(s * .58, s * .02, s * .5, -s * .02); x.quadraticCurveTo(s * .3, -s * .07, s * .12, -s * .1); x.closePath(); x.fill();
    x.lineWidth = s * .06; x.beginPath(); x.arc(-s * .46, s * .0, s * .1, Math.PI * .45, Math.PI * 1.55); x.stroke();
    x.fillRect(-s * .2, -s * .3, s * .26, s * .14);
  } });
  const fpath = x => { x.beginPath(); x.moveTo(0, -s * .26); x.bezierCurveTo(s * .16, -s * .2, s * .1, s * .05, 0, s * .3); x.bezierCurveTo(-s * .1, s * .05, -s * .16, -s * .2, 0, -s * .26); x.fill(); };
  const flame = mk(U, { w: s * .34, h: s * .62, ax: 0, ay: -s * .26, x: s * .52, y: s * .55, z: .0008, col: '#ffe2a6', trans: .9, shadow: false, recv: false, ppm: Math.min(9000, 240 / s), finish: { rim: 0, under: 0 },
    draw: fpath, glowDraw: x => { x.fillStyle = '#fff'; fpath(x); }, glow: 3, glowCol: flameCol, glowRes: .5 });
  g.add(body, flame);
  return { g, body, flame, tip: [s * .52, s * .65], set(k = 1, t = 0) {
    const f = 1 + Math.sin(t * 13) * .06 + Math.sin(t * 7.3 + 1) * .05;
    flame.visible = k > .01; flame.scale.set(.6 + .4 * k, (.35 + .65 * k) * f, 1); flame.rotation.z = Math.sin(t * 5.1) * .06 * k;
    flame.material.emissiveIntensity = 3 * k * f;
  } };
}
// The decree: an open scroll, a plain leaf between two rods, lit from behind through the fibre. No letters, ever.
export function rollo(U, { w = .03, h = .016, z = 0, col = '#e8dcc0' } = {}) {
  const r = h * .16;
  return mk(U, { w: w + r * 4, h: h * 1.5, z, col, trans: .9, shadow: false, recv: false, ppm: Math.min(9000, 300 / w), finish: { rim: .45, under: .3 },
    draw: x => { x.fillRect(-w / 2, -h / 2, w, h); for (const s of [-1, 1]) { x.beginPath(); x.roundRect(s * w / 2 - r, -h * .62, 2 * r, h * 1.24, r * .7); x.fill(); } } });
}
