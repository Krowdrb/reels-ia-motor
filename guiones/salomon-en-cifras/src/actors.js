// Paper puppets: Clawd (a paper redraw of the pixel mascot, jointed), human silhouettes, the ship. Rotation only, like paper on a stick.
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
    set({ x = 0, y = 0, rot = 0, aL = 0, aR = 0, walk = 0, stride = 0, look = 0, lookY = 0, blink = 1, k = 1, s = 1, tuck = 0 }) {
      g.position.x = x; g.position.y = y - tuck * 2 * u * s; g.rotation.z = rot; g.scale.setScalar(s);
      armL.rotation.z = -aL * .55; armR.rotation.z = aR * .55;   // scaled so a raised arm stays beside the body instead of swinging behind it
      legs.forEach((l, i) => { l.rotation.z = Math.sin(walk + i * Math.PI) * stride; });
      for (const [e, cx] of [[eyeL, -3.5], [eyeR, 3.5]]) { e.position.x = (cx + look * .9) * u; e.position.y = (7 + lookY * .7) * u; e.scale.y = Math.max(.12, blink); }
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
};
// crown: a small cut-paper diadem of three points on the head (a king, without caricature)
const crownDraw = (x, [hx, hy]) => { x.beginPath(); x.moveTo(hx - .068, hy + .055); x.lineTo(hx - .072, hy + .125); x.lineTo(hx - .036, hy + .088); x.lineTo(hx, hy + .14); x.lineTo(hx + .036, hy + .088); x.lineTo(hx + .072, hy + .125); x.lineTo(hx + .068, hy + .055); x.closePath(); x.fill(); };
export function human(U, { h = .085, z = -.085, col = '#07101a', pose = 'stand', trans = .05, rim = .6, two = false, crown = false } = {}) {
  const g = new THREE.Group(); g.position.z = z; const P = POSES[pose], W = h * 1.1, H_ = h * 1.12;
  const finish = { rim, rimPx: 4, under: .2, rimCol: `rgba(255,226,170,${rim})` };
  const body = mk(U, { w: W, h: H_, y: H_ / 2 - h * .03, z: 0, col, trans, finish, draw: x => { x.translate(0, -H_ / 2 + h * .03); x.scale(h, h); P.draw(x); if (crown) crownDraw(x, P.hd); } });
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

// —— Salomón en cifras: new paper props ——
// Rolled scroll seen from the side: a cream rod with two knobbed ends. Origin at its centre.
export function scrollRoll(U, { len = .02, r = .0026, z = 0, col = '#d9c9a0', glow = 0 } = {}) {
  const draw = x => { x.beginPath(); x.roundRect(-len / 2, -r, len, 2 * r, r * .5); x.fill(); for (const s of [-1, 1]) { x.beginPath(); x.roundRect(s * len / 2 - r * .45, -r * 1.35, r * .9, r * 2.7, r * .3); x.fill(); } };
  return mk(U, { w: len + r * 2, h: r * 3, z, col, trans: .45, shadow: false, recv: false, ppm: 9000, finish: { rim: .5, under: .4, rimPx: 3 },
    draw: x => { draw(x); cut(x, () => { x.lineWidth = r * .18; for (const f of [-.25, .1, .32]) { x.beginPath(); x.moveTo(-len / 2 + len * (.5 + f), -r); x.lineTo(-len / 2 + len * (.5 + f) + r * .3, r); x.stroke(); } }); },
    glowDraw: glow ? x => { x.fillStyle = '#fff'; draw(x); } : undefined, glow, glowCol: '#ffd88a', glowRes: .3 });
}
// Open scroll held flat to the camera: a translucent leaf between two rolled rods; it is lit from behind through the fibre (no letters)
export function scrollOpen(U, { w = .05, h = .02, z = 0, col = '#efe2bd' } = {}) {
  const r = h * .16;
  const m = mk(U, { w: w + r * 4, h: h * 1.5, z, col, trans: .95, shadow: false, recv: false, ppm: 7000, finish: { rim: .45, under: .3 },
    draw: x => { x.fillRect(-w / 2, -h / 2, w, h); for (const s of [-1, 1]) { x.beginPath(); x.roundRect(s * w / 2 - r, -h * .62, 2 * r, h * 1.24, r * .7); x.fill(); } },
    glowDraw: x => { const g = x.createRadialGradient(0, 0, 0, 0, 0, w * .62); g.addColorStop(0, '#fff'); g.addColorStop(1, '#fff6'); x.fillStyle = g; x.fillRect(-w / 2, -h / 2, w, h); }, glow: 0, glowCol: '#ffd27a', glowRes: .3 });
  return m;
}
// Oil lamp: a clay oval with a spout and a handle; the flame is a separate emissive leaf that flickers and can go out. Origin under the base.
export function oilLamp(U, { s = .03, z = -.06, col = '#4a3a2a', flameCol = '#ffc27a' } = {}) {
  const g = new THREE.Group(); g.position.z = z;
  const body = mk(U, { w: s * 1.5, h: s * .6, y: s * .2, z: 0, col, trans: .1, ppm: 8000, finish: { rim: .55, under: .35 }, draw: x => {
    x.beginPath(); x.ellipse(-s * .08, -s * .03, s * .36, s * .17, 0, 0, TAU); x.fill();
    x.beginPath(); x.moveTo(s * .15, s * .08); x.quadraticCurveTo(s * .42, s * .1, s * .55, s * .07); x.quadraticCurveTo(s * .58, s * .02, s * .5, -s * .02); x.quadraticCurveTo(s * .3, -s * .07, s * .12, -s * .1); x.closePath(); x.fill();
    x.lineWidth = s * .06; x.beginPath(); x.arc(-s * .46, s * .0, s * .1, Math.PI * .45, Math.PI * 1.55); x.stroke();
    x.fillRect(-s * .2, -s * .3, s * .26, s * .14);
  } });
  const flame = mk(U, { w: s * .34, h: s * .62, ax: 0, ay: -s * .26, x: s * .52, y: s * .55, z: .0008, col: '#ffe2a6', trans: .9, shadow: false, recv: false, ppm: 9000, finish: { rim: 0, under: 0 },
    draw: x => { x.beginPath(); x.moveTo(0, -s * .26); x.bezierCurveTo(s * .16, -s * .2, s * .1, s * .05, 0, s * .3); x.bezierCurveTo(-s * .1, s * .05, -s * .16, -s * .2, 0, -s * .26); x.fill(); },
    glowDraw: x => { x.fillStyle = '#fff'; x.beginPath(); x.moveTo(0, -s * .26); x.bezierCurveTo(s * .16, -s * .2, s * .1, s * .05, 0, s * .3); x.bezierCurveTo(-s * .1, s * .05, -s * .16, -s * .2, 0, -s * .26); x.fill(); }, glow: 3, glowCol: flameCol, glowRes: .5 });
  g.add(body, flame);
  // tip = world-space offset of the flame (for the backlight centre)
  return { g, body, flame, tip: [s * .52, s * .65], set(k = 1, t = 0) {
    const f = 1 + Math.sin(t * 13) * .06 + Math.sin(t * 7.3 + 1) * .05;
    flame.visible = k > .01; flame.scale.set(.6 + .4 * k, (.35 + .65 * k) * f, 1); flame.rotation.z = Math.sin(t * 5.1) * .06 * k;
    flame.material.emissiveIntensity = 3 * k * f; flame.material.userData.u.uGlowLit.value = 1;
  } };
}
// Lyre: a U frame with a yoke and thin strings. Origin at the base.
export function lyre(U, { h = .03, z = -.06, col = '#3a2c18' } = {}) {
  return mk(U, { w: h * .9, h: h * 1.15, y: h * .5, z, col, trans: .1, ppm: 8000, finish: { rim: .55 }, draw: x => {
    x.translate(0, -h * .5); x.lineWidth = h * .07; x.lineCap = 'round';
    x.beginPath(); x.moveTo(-h * .3, h * .95); x.quadraticCurveTo(-h * .38, h * .4, -h * .18, h * .06); x.lineTo(h * .18, h * .06); x.quadraticCurveTo(h * .38, h * .4, h * .3, h * .95); x.stroke();
    x.beginPath(); x.moveTo(-h * .36, h * .86); x.lineTo(h * .36, h * .86); x.stroke();
    x.beginPath(); x.ellipse(0, h * .07, h * .22, h * .07, 0, 0, TAU); x.fill();
    x.lineWidth = h * .012; for (let i = -2; i <= 2; i++) { x.beginPath(); x.moveTo(i * h * .06, h * .1); x.lineTo(i * h * .07, h * .86); x.stroke(); }
  } });
}
// Fire: three tongues of emissive paper (campfire or altar fire). Origin at the base.
export function fire(U, { s = .02, z = -.06, col = '#ffb860', glow = 2.4 } = {}) {
  const g = new THREE.Group(); g.position.z = z;
  const tongue = (dx, hk, dz, ph) => { const m = mk(U, { w: s * .5, h: s * hk * 1.05, ay: -s * hk * .5, x: dx, y: s * hk * .5, z: dz, col: '#ffd59a', trans: .9, shadow: false, recv: false, ppm: 7000, finish: { rim: 0, under: 0 },
    draw: x => { const a = s * .2, b = s * hk * .5; x.beginPath(); x.moveTo(-a, -b); x.quadraticCurveTo(-a * 1.2, 0, 0, b); x.quadraticCurveTo(a * 1.2, 0, a, -b); x.closePath(); x.fill(); },
    glowDraw: x => { const a = s * .2, b = s * hk * .5; x.fillStyle = '#fff'; x.beginPath(); x.moveTo(-a, -b); x.quadraticCurveTo(-a * 1.2, 0, 0, b); x.quadraticCurveTo(a * 1.2, 0, a, -b); x.closePath(); x.fill(); }, glow, glowCol: col, glowRes: .5 }); m.userData.ph = ph; g.add(m); return m; };
  const T = [tongue(-s * .17, .7, 0, 0), tongue(s * .17, .8, .0002, 2), tongue(0, 1.1, .0004, 4)];
  return { g, T, set(k = 1, t = 0) { for (const m of T) { const f = 1 + Math.sin(t * 11 + m.userData.ph) * .12 + Math.sin(t * 6.7 + m.userData.ph * 2) * .08; m.visible = k > .01; m.scale.set(.7 + .3 * k, Math.max(.01, k * f), 1); m.material.emissiveIntensity = glow * k; } } };
}
// Smoke: a tall wavy translucent grey leaf that rises and widens. Origin at its base.
export function smoke(U, { h = .08, w = .018, z = -.065, col = '#6c6676', seed = 1 } = {}) {
  return mk(U, { w: w * 3, h, ay: -h / 2, y: h / 2, z, col, trans: .5, shadow: false, recv: false, ppm: 3600, finish: { rim: .2, under: 0 }, draw: x => {
    const R = mulberry(seed); x.beginPath(); x.moveTo(-w * .2, -h / 2);
    for (let v = 0; v <= 1.001; v += .05) x.lineTo(Math.sin(v * 9 + R() * .4) * w * .5 * v - w * (.15 + v * .45), -h / 2 + v * h);
    for (let v = 1; v >= -.001; v -= .05) x.lineTo(Math.sin(v * 9 + 1.3) * w * .5 * v + w * (.15 + v * .45), -h / 2 + v * h);
    x.closePath(); x.fill();
  } });
}
// Altar: two or three stepped blocks (no idol, no name). Origin at the base centre.
export function altar(U, { w = .03, z = -.08, col = '#2b2238', steps = 3 } = {}) {
  return mk(U, { w: w * 1.1, h: w * 1.1, y: w * .5, z, col, trans: .08, ppm: 6000, finish: { rim: .5, under: .35 }, draw: x => {
    x.translate(0, -w * .5); const sh = w * .32 / steps * 3;
    for (let i = 0; i < steps; i++) { const ww = w * (1 - i * .22), y0 = i * sh * .34; x.fillRect(-ww / 2, y0, ww, sh * .36); }
    const top = steps * sh * .34; for (const s of [-1, 1]) x.fillRect(s * w * .26 - w * .04, top, w * .08, w * .07);
  } });
}
// Column: shaft with a simple base and capital. Origin at the base.
export function column(U, { h = .07, w = .012, z = -.09, col = '#cdb56f', trans = .5 } = {}) {
  return mk(U, { w: w * 1.8, h: h * 1.04, y: h * .5, z, col, trans, ppm: 5000, finish: { rim: .5, under: .3 }, draw: x => {
    x.translate(0, -h * .5); x.fillRect(-w * .8, 0, w * 1.6, h * .05); x.fillRect(-w / 2, h * .05, w, h * .85); x.fillRect(-w * .85, h * .9, w * 1.7, h * .06); x.fillRect(-w * .65, h * .88, w * 1.3, h * .03);
    cut(x, () => { for (const f of [-.22, .22]) x.fillRect(f * w - w * .05, h * .1, w * .1, h * .75); });
  } });
}
// Temple facade: steps, two columns at the porch, a deep doorway that can glow. Origin at the base centre.
export function temple(U, { w = .06, z = -.12, col = '#cdb56f', glowCol = '#ffcf70', glow = 1 } = {}) {
  const h = w * 1.2;
  return mk(U, { w: w * 1.1, h: h * 1.1, y: h * .55, z, col, trans: .45, ppm: 4200, finish: { rim: .5 }, draw: x => {
    x.translate(0, -h * .55);
    for (let i = 0; i < 3; i++) x.fillRect(-w * (.5 - i * .03), i * h * .03, w * (1 - i * .06), h * .03);
    x.fillRect(-w * .42, h * .09, w * .84, h * .62); x.beginPath(); x.moveTo(-w * .47, h * .71); x.lineTo(w * .47, h * .71); x.lineTo(w * .47, h * .79); x.lineTo(-w * .47, h * .79); x.fill();
    x.fillRect(-w * .28, h * .79, w * .56, h * .2);
    cut(x, () => { x.fillRect(-w * .07, h * .09, w * .14, h * .3); for (const s of [-1, 1]) x.fillRect(s * w * .2 - w * .025, h * .45, w * .05, h * .1); for (let i = -3; i <= 3; i++) x.fillRect(i * w * .07 - w * .012, h * .82, w * .024, h * .1); });
  }, glowDraw: x => { x.translate(0, -h * .55); x.fillStyle = '#fff'; x.fillRect(-w * .09, h * .09, w * .18, h * .32); for (const s of [-1, 1]) x.fillRect(s * w * .2 - w * .03, h * .44, w * .06, h * .12); for (let i = -3; i <= 3; i++) x.fillRect(i * w * .07 - w * .015, h * .81, w * .03, h * .12); }, glow, glowCol });
}
// Palace: wide, two storeys, a stair in front; windows are separate leaves so they can light one by one. Origin at the base centre.
export function palace(U, { w = .12, z = -.1, col = '#7c6b38', glowCol = '#ffcf70' } = {}) {
  const g = new THREE.Group(); g.position.z = z; const h = w * .62;
  const wins = [];
  for (let r = 0; r < 2; r++) for (let c = 0; c < 6; c++) wins.push([(c - 2.5) * w * .14, h * (.3 + r * .32)]);
  const body = mk(U, { w: w * 1.05, h: h * 1.15, y: h * .55, z: 0, col, trans: .3, ppm: 4200, finish: { rim: .5 }, draw: x => {
    x.translate(0, -h * .55); x.fillRect(-w / 2, 0, w, h * .9); x.fillRect(-w * .52, h * .88, w * 1.04, h * .05);
    for (let i = 0; i < 9; i++) x.fillRect(-w / 2 + i * w / 8 - w * .02, h * .93, w * .04, h * .06);
    x.fillRect(-w * .14, h * .9, w * .28, h * .2);
    cut(x, () => { for (const [wx, wy] of wins) { x.beginPath(); x.roundRect(wx - w * .028, wy - h * .1, w * .056, h * .2, [w * .028, w * .028, 0, 0]); x.fill(); } x.beginPath(); x.roundRect(-w * .05, 0, w * .1, h * .22, [w * .05, w * .05, 0, 0]); x.fill(); });
  } });
  g.add(body);
  const W = wins.map(([wx, wy]) => { const m = mk(U, { w: w * .06, h: h * .21, x: wx, y: wy, z: -.004, col: '#3a3020', trans: .9, shadow: false, recv: false, ppm: 4000, finish: { rim: 0, under: 0 }, draw: x => x.fillRect(-w * .03, -h * .105, w * .06, h * .21), glowDraw: x => { x.fillStyle = '#fff'; x.fillRect(-w * .03, -h * .105, w * .06, h * .21); }, glow: 0, glowCol }); g.add(m); return m; });
  const door = mk(U, { w: w * .11, h: h * .23, y: h * .11, z: -.004, col: '#3a3020', trans: .9, shadow: false, recv: false, ppm: 4000, finish: { rim: 0, under: 0 }, draw: x => x.fillRect(-w * .055, -h * .115, w * .11, h * .23), glowDraw: x => { x.fillStyle = '#fff'; x.fillRect(-w * .055, -h * .115, w * .11, h * .23); }, glow: 0, glowCol }); g.add(door);
  return { g, body, wins: W, door, h };
}
