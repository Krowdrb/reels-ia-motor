// Paper puppets: Clawd (a paper redraw of the pixel mascot, jointed), human silhouettes (mantle, staff, beard), the water jar, a crowd sheet,
// the props of «Agar» (kept for reuse), and those of «La deuda perdonada»: a crown, a figure group sheet, the oil lamp, the plain paper coins, the pouch and the prison bars.
// Rotation only, like paper on a stick. Coins are plain discs: nothing is ever written or drawn on them.
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
export const POSES = {
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
// staff: a long walking staff held in front (Abraham); beard: a short beard under the chin (both standing pose only)
function staffBeard(x, staff, beard) {
  if (staff) { x.beginPath(); x.moveTo(.215, 0); x.lineTo(.245, 0); x.lineTo(.225, 1.02); x.lineTo(.197, 1.02); x.closePath(); x.fill(); }
  if (beard) { x.beginPath(); x.moveTo(.0, .86); x.quadraticCurveTo(.09, .85, .085, .8); x.quadraticCurveTo(.06, .7, .02, .72); x.lineTo(-.02, .8); x.closePath(); x.fill(); }
}
// crown: a plain cut-paper band with three points on the head (the king of the parable, never a halo)
function crownAt(x, [hx, hy]) { x.beginPath(); x.moveTo(hx - .085, hy + .055); x.lineTo(hx - .09, hy + .16); x.lineTo(hx - .045, hy + .11); x.lineTo(hx, hy + .18); x.lineTo(hx + .045, hy + .11); x.lineTo(hx + .09, hy + .16); x.lineTo(hx + .085, hy + .055); x.closePath(); x.fill(); }
// robe: a long royal mantle falling behind the standing figure to the ground
function robe(x) { x.beginPath(); x.moveTo(-.1, .8); x.bezierCurveTo(-.22, .6, -.3, .25, -.34, 0); x.lineTo(.1, 0); x.lineTo(.0, .7); x.closePath(); x.fill(); }
export function human(U, { h = .085, z = -.085, col = '#07101a', pose = 'stand', trans = .05, rim = .6, two = false, veil = false, staff = false, beard = false, crown = false, royal = false } = {}) {
  const g = new THREE.Group(); g.position.z = z; const P = POSES[pose], W = h * 1.1, H_ = h * 1.12;
  const finish = { rim, rimPx: 4, under: .2, rimCol: `rgba(255,226,170,${rim})` };
  const body = mk(U, { w: W, h: H_, y: H_ / 2 - h * .03, z: 0, col, trans, finish, draw: x => { x.translate(0, -H_ / 2 + h * .03); x.scale(h, h); P.draw(x, veil); if (veil) mantle(x, P.hd); staffBeard(x, staff, beard); if (crown) crownAt(x, P.hd); if (royal && pose === 'stand') robe(x); } });
  const aw = h * .078, al = h * .37;
  const mkArm = dz => mk(U, { w: aw * 1.6, h: al * 1.25, x: P.sh[0] * h, y: P.sh[1] * h - al / 2, ay: al / 2, z: dz, col, trans, shadow: false, recv: false, finish,
    draw: x => { x.beginPath(); x.moveTo(-aw * .55, al / 2); x.lineTo(aw * .55, al / 2); x.lineTo(aw * .33, -al / 2); x.lineTo(-aw * .33, -al / 2); x.closePath(); x.fill(); x.beginPath(); x.arc(0, al / 2, aw * .55, 0, 7); x.fill(); x.beginPath(); x.ellipse(0, -al / 2, aw * .42, aw * .62, 0, 0, 7); x.fill(); } });
  const arm = mkArm(.0005), arm2 = two ? mkArm(-.0005) : null;
  g.add(body, arm); if (arm2) g.add(arm2);
  // flip: face -x (a mirrored sheet); a2: the second arm's own angle when two = true
  return { g, body, arm, arm2, al, set({ x = 0, y = 0, rot = 0, a = 0, a2 = null, s = 1, flip = false }) { g.position.x = x; g.position.y = y; g.rotation.z = rot; g.scale.set(flip ? -s : s, s, s); arm.rotation.z = a; if (arm2) arm2.rotation.z = a2 ?? a * .97; } };
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

// —————————————————— «Agar» ——————————————————
// A group whose origin is at the base centre, holding one sheet drawn in the group's own metric space (draw(x) with y up from the ground)
function based(U, { w, h, z = 0, col, trans = .08, rim = .5, shadow = true, recv = true, ppm = 6000, draw, glowDraw, glow, glowCol, glowRes }) {
  const g = new THREE.Group(); g.position.z = z;
  const m = mk(U, { w, h, y: h / 2 - h * .02, z: 0, col, trans, shadow, recv, ppm, finish: { rim, rimPx: 4, under: .3, rimCol: `rgba(255,232,190,${rim})` },
    draw: x => { x.translate(0, -h / 2 + h * .02); draw(x); }, glowDraw: glowDraw ? x => { x.translate(0, -h / 2 + h * .02); glowDraw(x); } : undefined, glow, glowCol, glowRes });
  g.add(m); g.userData.m = m; return g;
}

// The water-skin: grey-brown leather (never terracotta), a neck and a strap. s = length. limp: the empty, sagging skin. Origin at the neck (so it can hang from a hand).
export function odre(U, { s = .022, z = .001, col = '#6b5a48', limp = false } = {}) {
  return mk(U, { w: s * 1.5, h: s * 1.5, ax: s * .2, ay: s * .45, z, col, trans: .2, shadow: false, recv: false, ppm: 12000, finish: { rim: .55, rimPx: 3, under: .35, rimCol: 'rgba(255,236,200,.55)' }, draw: x => {
    x.save(); x.scale(s, s);
    if (!limp) { x.beginPath(); x.moveTo(.16, .44); x.lineTo(.26, .44); x.lineTo(.25, .3); x.bezierCurveTo(.5, .2, .58, -.18, .3, -.4); x.bezierCurveTo(.05, -.55, -.5, -.45, -.56, -.1); x.bezierCurveTo(-.6, .14, -.3, .3, .14, .3); x.closePath(); x.fill(); }
    else { x.beginPath(); x.moveTo(.16, .44); x.lineTo(.26, .44); x.lineTo(.24, .28); x.bezierCurveTo(.36, .1, .3, -.2, .12, -.44); x.quadraticCurveTo(-.02, -.52, -.12, -.4); x.bezierCurveTo(-.06, -.1, .02, .14, .15, .28); x.closePath(); x.fill(); }
    x.lineWidth = .045; x.beginPath(); x.moveTo(.2, .4); x.quadraticCurveTo(-.25, .62, -.5, -.05); x.stroke();
    x.restore();
  } });
}

// A dry desert bush: branches cut from one sheet. The emissive copy of the branches gives the gold edge when the light reaches it (uGlowLit).
export function bush(U, { h = .05, z = -.06, col = '#1a140e', seed = 5, glowCol = '#ffd98a', trans = .06 } = {}) {
  const R = mulberry(seed), segs = [];
  const grow = (x0, y0, a, l, w, d) => {
    const x1 = x0 + Math.cos(a) * l, y1 = y0 + Math.sin(a) * l; segs.push([x0, y0, x1, y1, w]); if (d <= 0) return;
    const n = 2 + (R() < .35 ? 1 : 0); for (let i = 0; i < n; i++) grow(x1, y1, a + (i - (n - 1) / 2) * .62 + (R() - .5) * .35, l * (.6 + R() * .18), w * .64, d - 1);
  };
  for (let i = 0; i < 6; i++) grow((R() - .5) * h * .25, 0, Math.PI / 2 + (i - 2.5) * .36 + (R() - .5) * .15, h * .34, h * .055, 4);
  const draw = (x, k = 1) => { x.lineCap = 'round'; for (const [a, b, c, d, w] of segs) { x.lineWidth = w * k; x.beginPath(); x.moveTo(a, b); x.lineTo(c, d); x.stroke(); } x.beginPath(); x.ellipse(0, 0, h * .2, h * .05, 0, 0, TAU); x.fill(); };
  const g = based(U, { w: h * 2.4, h: h * 1.25, col, trans, rim: .5, ppm: 9000, draw, glowDraw: x => { x.strokeStyle = '#fff'; x.fillStyle = '#fff'; draw(x, .5); }, glow: 1.6, glowCol, glowRes: .5 });
  g.userData.m.material.userData.u.uGlowLit.value = 0;
  return g;
}

// The goat-hair tent: a long low roof on poles, guy ropes, the door cut out with a warm lit panel behind it, and a flap that moves. Origin at the base centre.
export function tent(U, { w = .1, h = .05, z = -.1, col = '#241c2a', doorCol = '#ffd9a0', glow = 1.4, rim = .45, door: dfrac = .14 } = {}) {
  const g = new THREE.Group(); g.position.z = z;
  const dw = w * dfrac, dh = h * .62, dx = w * .06;
  const shape = x => {
    x.beginPath(); x.moveTo(-w * .46, 0); x.lineTo(-w * .44, h * .55); x.quadraticCurveTo(-w * .36, h * .72, -w * .26, h * .86); x.quadraticCurveTo(-w * .14, h * .8, 0, h * .98); x.quadraticCurveTo(w * .14, h * .8, w * .26, h * .88);
    x.quadraticCurveTo(w * .36, h * .72, w * .44, h * .55); x.lineTo(w * .46, 0); x.closePath(); x.fill();
    x.lineWidth = h * .018; for (const s of [-1, 1]) { x.beginPath(); x.moveTo(s * w * .3, h * .82); x.lineTo(s * w * .5, 0); x.stroke(); x.beginPath(); x.moveTo(s * w * .44, h * .55); x.lineTo(s * w * .58, 0); x.stroke(); }
  };
  const body = mk(U, { w: w * 1.25, h: h * 1.1, y: h * .53, z: 0, col, trans: .12, ppm: 5000, finish: { rim, rimPx: 4, under: .3 }, draw: x => {
    x.translate(0, -h * .53); shape(x); cut(x, () => { x.fillRect(dx - dw / 2, 0, dw, dh); });
  } });
  const door = mk(U, { w: dw * 1.3, h: dh * 1.1, x: dx, y: dh * .5, z: -.0015, col: doorCol, trans: .5, shadow: false, recv: false, ppm: 5000, finish: { rim: 0, under: 0 },
    draw: x => x.fillRect(-dw * .65, -dh * .55, dw * 1.3, dh * 1.1), glowDraw: x => { x.fillStyle = '#fff'; x.fillRect(-dw * .65, -dh * .55, dw * 1.3, dh * 1.1); }, glow, glowCol: doorCol, glowRes: .3 });
  const flap = mk(U, { w: dw * .9, h: dh * 1.1, ax: -dw * .36, ay: dh * .5, x: dx + dw * .5, y: dh * .5, z: .0008, col, trans: .12, shadow: false, ppm: 6000, finish: { rim, rimPx: 3, under: .3 }, draw: x => {
    x.beginPath(); x.moveTo(-dw * .4, dh * .5); x.lineTo(dw * .3, dh * .5); x.quadraticCurveTo(dw * .15, 0, dw * .35, -dh * .52); x.lineTo(-dw * .4, -dh * .45); x.closePath(); x.fill();
  } });
  g.add(body, door, flap);
  return { g, body, door, flap, doorX: dx, doorH: dh, set({ wave = 0, lit = 1 } = {}) { flap.rotation.z = wave; door.material.userData.u.uGlowLit.value = lit; } };
}

// A date palm: a curved trunk and a crown of drooping fronds. Origin at the base.
export function palm(U, { h = .09, z = -.12, col = '#2a2433', lean = .12, seed = 2, trans = .1 } = {}) {
  const R = mulberry(seed), top = [lean * h, h];
  return based(U, { w: h * 1.1, h: h * 1.15, z, col, trans, rim: .4, ppm: 4000, draw: x => {
    x.beginPath(); x.moveTo(-h * .025, 0); x.quadraticCurveTo(lean * h * .2, h * .5, top[0] - h * .012, top[1]); x.lineTo(top[0] + h * .012, top[1]); x.quadraticCurveTo(lean * h * .2 + h * .03, h * .5, h * .025, 0); x.closePath(); x.fill();
    for (let i = 0; i < 9; i++) {
      const a = Math.PI * (.08 + .84 * i / 8) + (R() - .5) * .15, l = h * (.3 + R() * .12), ex = top[0] + Math.cos(a) * l, ey = top[1] + Math.sin(a) * l * .55 - l * .25 * Math.abs(Math.cos(a));
      x.beginPath(); x.moveTo(top[0], top[1]); x.quadraticCurveTo(top[0] + Math.cos(a) * l * .5, top[1] + l * .35, ex, ey); x.quadraticCurveTo(top[0] + Math.cos(a) * l * .45, top[1] + l * .22, top[0], top[1] - h * .01); x.fill();
    }
  } });
}

// The baby's basket: a woven oval with a raised hood. Origin at the base.
export function cesta(U, { s = .016, z = -.06, col = '#5a4a3a' } = {}) {
  return based(U, { w: s * 1.4, h: s * .9, z, col, trans: .15, rim: .55, ppm: 12000, draw: x => {
    x.beginPath(); x.moveTo(-s * .55, s * .32); x.quadraticCurveTo(-s * .5, 0, -s * .3, 0); x.lineTo(s * .35, 0); x.quadraticCurveTo(s * .55, 0, s * .55, s * .3); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(-s * .55, s * .3); x.quadraticCurveTo(-s * .55, s * .72, -s * .2, s * .74); x.quadraticCurveTo(-s * .1, s * .5, -s * .12, s * .3); x.closePath(); x.fill();
    cut(x, () => { for (let i = 0; i < 4; i++) x.fillRect(-s * .38 + i * s * .22, s * .1, s * .1, s * .03); });
  } });
}

// The spring on the road: a small dark pool among stones. The pool is its own sheet behind the stones, with a moon-lit edge (emissive, uGlowLit).
export function fuente(U, { w = .05, z = -.06, col = '#0a0c1c', water = '#05060c', edge = '#e6ecf4' } = {}) {
  const g = new THREE.Group(); g.position.z = z; const R = mulberry(23);
  const pool = mk(U, { w: w * .9, h: w * .14, y: w * .03, z: -.0015, col: water, trans: .2, shadow: false, recv: false, ppm: 9000, finish: { rim: 0, under: 0 },
    draw: x => { x.beginPath(); x.ellipse(0, 0, w * .4, w * .045, 0, 0, TAU); x.fill(); },
    glowDraw: x => { x.strokeStyle = '#fff'; x.lineWidth = w * .006; x.beginPath(); x.ellipse(0, w * .006, w * .36, w * .036, 0, Math.PI * 1.05, Math.PI * 1.95); x.stroke(); x.beginPath(); x.ellipse(w * .05, 0, w * .12, w * .01, 0, 0, TAU); x.stroke(); }, glow: 1.4, glowCol: edge, glowRes: .7 });
  const stones = mk(U, { w: w * 1.3, h: w * .4, y: w * .12, z: 0, col, trans: .06, ppm: 9000, finish: { rim: .6, rimPx: 4, under: .3 }, draw: x => {
    x.translate(0, -w * .12);
    for (const [cx, rx, ry] of [[-.5, .13, .11], [-.36, .1, .07], [-.22, .07, .045], [.25, .08, .05], [.4, .12, .09], [.55, .09, .06]]) { x.beginPath(); x.ellipse(cx * w, ry * w * .55, rx * w, ry * w, (R() - .5) * .3, 0, TAU); x.fill(); }
    x.fillRect(-w * .6, -w * .02, w * 1.2, w * .03);
  } });
  pool.material.userData.u.uGlowLit.value = .5;
  g.add(pool, stones); return { g, pool, stones };
}

// The well: a low round stone well-head seen a little from above. Stone ring (with the mouth cut out) in front; the dark water sheet behind
// with a gold edge (emissive, uGlowLit). Never blue water next to the gold. Origin at the base centre; r = outer half-width.
export function pozo(U, { r = .026, z = -.06, col = '#2a1a0e', water = '#0e0a08', gold = '#ffd98a', trans = .06 } = {}) {
  const g = new THREE.Group(); g.position.z = z; const hgt = r * .75, ry = r * .28, R = mulberry(19);
  const ring = mk(U, { w: r * 2.4, h: hgt + ry * 2.4, y: (hgt + ry) / 2, z: 0, col, trans, ppm: 9000, finish: { rim: .65, rimPx: 4, under: .35, rimCol: 'rgba(255,232,180,.65)' }, draw: x => {
    x.translate(0, -(hgt + ry) / 2);
    x.beginPath(); x.moveTo(-r, hgt); x.lineTo(-r * .97, ry * .3); x.quadraticCurveTo(0, -ry * 1.05, r * .97, ry * .3); x.lineTo(r, hgt); x.ellipse(0, hgt, r, ry, 0, 0, Math.PI); x.closePath(); x.fill();
    cut(x, () => {
      x.beginPath(); x.ellipse(0, hgt + ry * .1, r * .74, ry * .62, 0, 0, TAU); x.fill();
      x.lineWidth = r * .03; for (let row = 0; row < 3; row++) { const y = hgt * (.25 + row * .25); x.beginPath(); x.moveTo(-r * .98, y); x.quadraticCurveTo(0, y - ry * .9, r * .98, y); x.stroke();
        for (let i = 0; i < 6; i++) { const u = -r * .85 + (i + (row % 2) * .5) * r * .32; if (u > r * .9) continue; x.beginPath(); x.moveTo(u, y - ry * .8 * (1 - (u / r) ** 2)); x.lineTo(u, y + hgt * .25 - ry * .8 * (1 - (u / r) ** 2)); x.stroke(); } }
    });
  } });
  const wat = mk(U, { w: r * 1.7, h: ry * 1.8, y: hgt + ry * .1, z: -.002, col: water, trans: .1, shadow: false, recv: false, ppm: 9000, finish: { rim: 0, under: 0 },
    draw: x => { x.beginPath(); x.ellipse(0, 0, r * .8, ry * .8, 0, 0, TAU); x.fill(); },
    glowDraw: x => { x.strokeStyle = '#fff'; x.lineWidth = r * .05; x.beginPath(); x.ellipse(0, 0, r * .66, ry * .5, 0, 0, TAU); x.stroke(); x.lineWidth = r * .02; x.beginPath(); x.ellipse(r * .1, -ry * .05, r * .3, ry * .18, 0, 0, TAU); x.stroke(); }, glow: 2.2, glowCol: gold, glowRes: .7 });
  wat.material.userData.u.uGlowLit.value = 0;
  g.add(ring, wat);
  return { g, ring, wat, top: hgt };
}


// —————————————————— «La deuda perdonada» ——————————————————
// A group of still figures cut from ONE sheet (disciples, the family, guards, the fellow servants): cheap on the CPU.
// list: [{ x, h, pose, flip, veil, crown, arm }] ; arm: angle of a straight arm drawn into the sheet. Origin: the feet line.
export function figures(U, { list, z = -.1, col = '#0a0810', trans = .06, rim = .55 } = {}) {
  const xs = list.map(p => p.x), hm = Math.max(...list.map(p => p.h));
  const x0 = Math.min(...xs) - hm * .6, x1 = Math.max(...xs) + hm * .6, W = x1 - x0, H_ = hm * 1.3, cx = (x0 + x1) / 2;
  const g = new THREE.Group(); g.position.z = z;
  const m = mk(U, { w: W, h: H_, x: cx, y: H_ / 2 - hm * .03, z: 0, col, trans, ppm: 7000, finish: { rim, rimPx: 4, under: .2, rimCol: `rgba(255,226,170,${rim})` }, draw: x => {
    x.translate(-cx, -H_ / 2 + hm * .03);
    for (const p of list) {
      const P = POSES[p.pose || 'stand']; x.save(); x.translate(p.x, 0); x.scale(p.flip ? -p.h : p.h, p.h); P.draw(x, p.veil); if (p.veil) mantle(x, P.hd); if (p.crown) crownAt(x, P.hd);
      if (p.arm !== undefined) { x.save(); x.translate(P.sh[0], P.sh[1]); x.rotate(p.arm); x.beginPath(); x.moveTo(-.04, 0); x.lineTo(.04, 0); x.lineTo(.026, -.37); x.lineTo(-.026, -.37); x.closePath(); x.fill(); x.restore(); }
      x.restore();
    }
  } });
  g.add(m); g.userData.m = m; return g;
}

// The clay oil lamp (a low almond bowl with a spout), set on a table. Its flame is an emissive sheet (uGlowLit = brightness);
// at dawn the flame is out and a thin paper thread of smoke rises (smoke = true). Origin: the base of the lamp. s = bowl width.
export function lamp(U, { s = .02, z = -.084, col = '#120e14', flame = '#ffcf86', glow = 2.4, smoke = false } = {}) {
  const g = new THREE.Group(); g.position.z = z; const fx = s * .46, fy = s * .36;
  const bowl = mk(U, { w: s * 1.3, h: s * .5, y: s * .2, z: 0, col, trans: .05, ppm: 14000, finish: { rim: .65, rimPx: 4, under: .3, rimCol: 'rgba(255,220,160,.65)' }, draw: x => {
    x.translate(0, -s * .2);
    x.beginPath(); x.moveTo(-s * .14, 0); x.lineTo(s * .14, 0); x.lineTo(s * .1, s * .06); x.quadraticCurveTo(s * .3, s * .1, s * .4, s * .24); x.lineTo(s * .5, s * .3); x.lineTo(s * .44, s * .34);
    x.quadraticCurveTo(s * .2, s * .36, 0, s * .34); x.quadraticCurveTo(-s * .42, s * .32, -s * .48, s * .2); x.quadraticCurveTo(-s * .4, s * .08, -s * .1, s * .06); x.closePath(); x.fill();
  } });
  const fl = mk(U, { w: s * .5, h: s * .7, x: fx, y: fy + s * .24, z: .0006, col: flame, trans: .6, shadow: false, recv: false, ppm: 14000, finish: { rim: 0, under: 0 },
    draw: x => { const k = s * .5; x.translate(0, -s * .24); x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(k * .4, k * .25, k * .22, k * .62); x.quadraticCurveTo(k * .08, k * .85, 0, k * 1.15); x.quadraticCurveTo(-k * .1, k * .8, -k * .25, k * .55); x.quadraticCurveTo(-k * .35, k * .2, 0, 0); x.fill(); },
    glowDraw: x => { x.fillStyle = '#fff'; x.beginPath(); x.ellipse(0, -s * .02, s * .12, s * .22, 0, 0, TAU); x.fill(); }, glow, glowCol: flame, glowRes: .6 });
  const sm = mk(U, { w: s * .6, h: s * 2.2, x: fx, y: fy + s * 1.1, z: .0004, col: '#e8d8b8', trans: .5, shadow: false, recv: false, ppm: 9000, finish: { rim: .3, under: 0 },
    draw: x => { x.lineWidth = s * .03; x.lineCap = 'round'; x.beginPath(); x.moveTo(0, -s * 1.05); for (let i = 0; i <= 40; i++) { const k = i / 40; x.lineTo(Math.sin(k * 8) * s * .12 * k, -s * 1.05 + k * s * 2.0); } x.stroke(); } });
  sm.visible = smoke; fl.visible = !smoke;
  g.add(bowl, fl, sm);
  return { g, bowl, flame: fl, smoke: sm, fx, fy, set({ lit = 1, flick = 0, sway = 0 } = {}) { fl.material.userData.u.uGlowLit.value = lit; fl.scale.set(1 - flick * .25, 1 + flick, 1); sm.rotation.z = sway; } };
}

// One layer of the debt mountain: a heap of plain paper coins (discs, nothing on them) and tied sacks, cut as one sheet.
// Thin cut-outs on the coin edges let the light through when it comes from behind. Origin: base centre. w = width, h = height of the heap.
export function heap(U, { w = .12, h = .06, z = -.08, col = '#bdb3a0', seed = 1, trans = .1, rim = .55, sacks = 2 } = {}) {
  const R = mulberry(seed), coins = [], sk = [];
  const top = u => h * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(u) / (w / 2), 1.6)), .8);   // a rounded heap profile
  for (let i = 0; i < 70; i++) { const u = (R() - .5) * w * .95, r = w * (.03 + R() * .025), y = Math.max(r * .5, top(u) - r * (.3 + R() * .6)); coins.push([u, y, r, R() * .5 - .25]); }
  for (let i = 0; i < sacks; i++) { const u = (R() - .5) * w * .6; sk.push([u, top(u) * (.3 + R() * .5), w * (.08 + R() * .04)]); }
  const g = new THREE.Group(); g.position.z = z;
  const m = mk(U, { w: w * 1.12, h: h * 1.25, y: h * .6, z: 0, col, trans, ppm: 4200, finish: { rim, rimPx: 4, under: .35, rimCol: `rgba(255,236,200,${rim})` }, draw: x => {
    x.translate(0, -h * .6);
    x.beginPath(); x.moveTo(-w / 2, 0); for (let u = -w / 2; u <= w / 2 + 1e-6; u += w / 120) x.lineTo(u, top(u) * .82); x.lineTo(w / 2, 0); x.closePath(); x.fill();
    for (const [u, y, r, a] of coins) { x.beginPath(); x.ellipse(u, y, r, r * .92, a, 0, TAU); x.fill(); }
    for (const [u, y, r] of sk) { x.beginPath(); x.moveTo(u - r * .55, y); x.quadraticCurveTo(u - r * .7, y + r * .9, u - r * .12, y + r * 1.05); x.lineTo(u - r * .2, y + r * 1.3); x.lineTo(u + r * .2, y + r * 1.3); x.lineTo(u + r * .12, y + r * 1.05); x.quadraticCurveTo(u + r * .7, y + r * .9, u + r * .55, y); x.closePath(); x.fill(); }
    cut(x, () => { x.lineWidth = w * .0035; for (const [u, y, r, a] of coins) { x.beginPath(); x.ellipse(u, y, r * .97, r * .89, a, Math.PI * .1, Math.PI * .9); x.stroke(); }
      for (const [u, y, r] of sk) { x.fillRect(u - r * .2, y + r * 1.0, r * .4, w * .004); } });
  } });
  g.add(m); g.userData.m = m; g.userData.top = top; return g;
}

// The small cloth pouch of the fellow servant (grey-brown, never terracotta), fallen on its side, three plain coins at its mouth. Origin: base centre.
export function pouch(U, { s = .012, z = -.05, col = '#6b6258', coin = '#a89c84' } = {}) {
  const g = new THREE.Group(); g.position.z = z;
  const bag = mk(U, { w: s * 1.6, h: s * 1.3, y: s * .55, z: 0, col, trans: .15, ppm: 16000, finish: { rim: .6, rimPx: 3, under: .35, rimCol: 'rgba(255,236,210,.6)' }, draw: x => {
    x.translate(0, -s * .55);
    x.beginPath(); x.moveTo(-s * .5, 0); x.quadraticCurveTo(-s * .62, s * .55, -s * .22, s * .72); x.lineTo(s * .1, s * .62); x.lineTo(s * .34, s * .78); x.lineTo(s * .4, s * .6); x.lineTo(s * .22, s * .5); x.quadraticCurveTo(s * .45, s * .2, s * .3, 0); x.closePath(); x.fill();
    x.lineWidth = s * .05; x.beginPath(); x.moveTo(s * .08, s * .66); x.quadraticCurveTo(s * .2, s * .5, s * .22, s * .52); x.stroke();
  } });
  const cs = mk(U, { w: s * 1.2, h: s * .5, x: s * .55, y: s * .14, z: .0006, col: coin, trans: .2, shadow: false, ppm: 16000, finish: { rim: .7, rimPx: 3, under: .3 }, draw: x => {
    for (const [u, v, r] of [[-.12, -.05, .11], [.08, -.08, .1], [.25, -.1, .09]]) { x.beginPath(); x.ellipse(u * s, v * s, r * s, r * s * .55, 0, 0, TAU); x.fill(); }
  } });
  g.add(bag, cs); return { g, bag, coins: cs };
}

// Prison bars: a dark frame with vertical bars cut from one sheet. Origin: bottom centre.
export function bars(U, { w = .05, h = .08, z = -.06, col = '#060508', n = 6 } = {}) {
  return based(U, { w, h, z, col, trans: .03, rim: .6, ppm: 6000, draw: x => {
    const bw = w * .045; for (let i = 0; i < n; i++) x.fillRect(-w / 2 + (i + .5) * w / n - bw / 2, 0, bw, h);
    x.fillRect(-w / 2, h * .9, w, h * .06); x.fillRect(-w / 2, h * .35, w, h * .04); x.fillRect(-w / 2, 0, w, h * .04);
  } });
}
