// Paper puppets: Clawd (a paper redraw of the pixel mascot, jointed), human silhouettes, the ship. Rotation only, like paper on a stick.
import * as THREE from 'three';
import { sheet } from './paper.js';

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

// —— Job en cifras: sheep (single or as a frieze), camel (one jointed front leg), stone house (window = emissive) ——
// Sheep silhouette, origin at the feet, facing +x (dir = -1 faces -x). L = body length
export function drawSheep(x, L, dir = 1, ph = 0) {
  x.save(); x.scale(dir, 1); const h = L * .8;
  for (const [lx, k] of [[-.3, 0], [-.19, 1], [.2, 2], [.31, 3]]) { const sw = Math.sin(ph + k * 1.7) * L * .02; x.beginPath(); x.moveTo(lx * L - L * .035, h * .45); x.lineTo(lx * L + L * .035, h * .45); x.lineTo(lx * L + L * .022 + sw, 0); x.lineTo(lx * L - L * .022 + sw, 0); x.closePath(); x.fill(); }
  x.beginPath(); x.ellipse(0, h * .6, L * .43, h * .23, 0, 0, 7); x.fill();
  for (const [cx, cy, r] of [[-.33, .62, .14], [-.17, .73, .15], [.02, .75, .16], [.19, .7, .15], [-.27, .47, .13], [-.05, .45, .15], [.17, .48, .14], [.33, .6, .12]]) { x.beginPath(); x.arc(cx * L, cy * h, r * L, 0, 7); x.fill(); }
  x.beginPath(); x.ellipse(.5 * L, .68 * h, .12 * L, .07 * L, -.55, 0, 7); x.fill();
  x.beginPath(); x.ellipse(.43 * L, .78 * h, .07 * L, .025 * L, .5, 0, 7); x.fill();
  x.beginPath(); x.ellipse(-.45 * L, .6 * h, .06 * L, .04 * L, .8, 0, 7); x.fill();
  x.restore();
}
export function sheep(U, { L = .036, z = -.072, col = '#1a1220', trans = .12, rim = .55, dir = -1 } = {}) {
  const h = L * .95;
  const m = mk(U, { w: L * 1.4, h, ay: -h / 2, z, col, trans, finish: { rim, rimPx: 3, under: .25 }, draw: x => { x.translate(0, -h / 2); drawSheep(x, L, dir); } });
  return m;
}
// A row of sheep on one sheet (base = feet line, sheet origin at the left/right centre of the row)
export function flock(U, { w = .4, n = 12, L = .03, z = -.09, col = '#2b2233', trans = .25, seed = 3, dir = -1, rim = .5, jitter = .35 } = {}) {
  const R = (s => () => { s = (s * 16807) % 2147483647; return s / 2147483647; })(seed * 977 + 13), h = L * 1.05;
  const m = mk(U, { w: w + L * 1.4, h, ay: -h / 2, z, col, trans, finish: { rim, rimPx: 3, under: .25 }, draw: x => {
    x.translate(0, -h / 2);
    for (let i = 0; i < n; i++) { const s = .85 + R() * .25; x.save(); x.translate(-w / 2 + (i + .5) / n * w + (R() - .5) * jitter * w / n, (R() - .5) * L * .06); drawSheep(x, L * s, R() < .82 ? dir : -dir, R() * 6); x.restore(); }
  } });
  return m;
}
// Camel, side view facing +x; origin at the feet; h = hump height
export function camel(U, { h = .09, z = -.08, col = '#120c10', trans = .08, rim = .55 } = {}) {
  const g = new THREE.Group(); g.position.z = z; const finish = { rim, rimPx: 3, under: .25 };
  const body = mk(U, { w: h * 1.5, h: h * 1.1, y: h * .52, z: 0, col, trans, finish, draw: x => {
    x.translate(0, -h * .52); x.scale(h, h);
    const leg = (lx, k) => { x.beginPath(); x.moveTo(lx - .045, .56); x.lineTo(lx + .045, .56); x.lineTo(lx + .02, .3); x.lineTo(lx + .028, .27); x.lineTo(lx + .018, 0); x.lineTo(lx - .03 - k, 0); x.lineTo(lx - .02, .27); x.lineTo(lx - .03, .3); x.closePath(); x.fill(); };
    leg(-.3, 0); leg(-.2, .01); leg(.2, 0);
    x.beginPath(); x.ellipse(0, .62, .37, .13, 0, 0, 7); x.fill();
    x.beginPath(); x.moveTo(-.3, .66); x.bezierCurveTo(-.28, .95, .12, 1.02, .2, .7); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(.22, .72); x.quadraticCurveTo(.38, .7, .44, .6); x.quadraticCurveTo(.5, .52, .54, .66); x.quadraticCurveTo(.56, .78, .56, .86);
    x.lineTo(.66, .88); x.quadraticCurveTo(.72, .86, .7, .82); x.lineTo(.6, .79); x.quadraticCurveTo(.55, .62, .5, .46); x.quadraticCurveTo(.42, .4, .3, .55); x.closePath(); x.fill();
    x.beginPath(); x.ellipse(.6, .87, .07, .04, .15, 0, 7); x.fill(); x.beginPath(); x.ellipse(.56, .93, .015, .03, -.3, 0, 7); x.fill();
    x.beginPath(); x.moveTo(-.36, .64); x.quadraticCurveTo(-.42, .55, -.4, .45); x.lineTo(-.38, .45); x.quadraticCurveTo(-.39, .56, -.34, .6); x.closePath(); x.fill();
  } });
  const ll = h * .56, leg = mk(U, { w: h * .14, h: ll * 1.08, x: h * .29, y: ll / 2, ay: ll / 2, z: -.0006, col, trans, finish, shadow: false, draw: x => {
    x.translate(0, -ll / 2); x.scale(h, h); x.beginPath(); x.moveTo(-.045, .56); x.lineTo(.045, .56); x.lineTo(.02, .3); x.lineTo(.028, .27); x.lineTo(.03, 0); x.lineTo(-.03, 0); x.lineTo(-.02, .27); x.lineTo(-.03, .3); x.closePath(); x.fill();
  } });
  g.add(leg, body);
  return { g, body, leg, set({ x = 0, y = 0, walk = 0, stride = .28, dir = 1, s = 1 }) {
    g.position.x = x; g.position.y = y + Math.abs(Math.sin(walk)) * h * .012 * (stride > 0 ? 1 : 0); g.scale.set(dir * s, s, s);
    leg.rotation.z = Math.sin(walk) * stride; body.rotation.z = Math.sin(walk * 2) * .006;
  } };
}
// Stone house with a flat roof: origin at the bottom centre; window glow via house.material.userData.u.uGlowLit
export function house(U, { w = .07, h = .05, z = -.09, col = '#1a1418', trans = .15, win = [.18, .55], door = -.2, glowCol = '#ffc46a', glow = 2.2, seed = 4 } = {}) {
  const H_ = h * 1.25, W_ = w * 1.15, ww = w * .13, wh = h * .2;
  return mk(U, { w: W_, h: H_, ay: -H_ / 2, z, col, trans, finish: { rim: .55, rimPx: 3, under: .3 }, draw: x => {
    x.translate(0, -H_ / 2);
    x.fillRect(-w / 2, 0, w, h); x.fillRect(-w * .53, h, w * 1.06, h * .07); x.fillRect(-w * .5, h * 1.07, w, h * .05);
    x.fillRect(w * .5 - w * .07, h * 1.12, w * .05, h * .1);
    cut(x, () => {
      let s = seed; const R = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
      x.lineWidth = h * .018;
      for (let r = 1; r < 6; r++) { const yy = r / 6 * h; x.beginPath(); x.moveTo(-w / 2, yy); x.lineTo(w / 2, yy); x.stroke(); for (let c = 0; c < 6; c++) { const xx = -w / 2 + (c + (r % 2) * .5 + R() * .2) / 6 * w; x.beginPath(); x.moveTo(xx, yy); x.lineTo(xx, yy - h / 6); x.stroke(); } }
      if (door !== null) { x.lineWidth = h * .03; x.beginPath(); x.moveTo(w * door - w * .08, 0); x.lineTo(w * door - w * .08, h * .45); x.quadraticCurveTo(w * door, h * .58, w * door + w * .08, h * .45); x.lineTo(w * door + w * .08, 0); x.stroke(); }
    });
    x.fillRect(w * win[0] - ww / 2 - w * .015, h * win[1] - wh / 2 - w * .015, ww + w * .03, wh + w * .03);
  }, glowDraw: x => { x.translate(0, -H_ / 2); x.fillStyle = '#fff'; x.fillRect(w * win[0] - ww / 2, h * win[1] - wh / 2, ww, wh); }, glow, glowCol });
}
