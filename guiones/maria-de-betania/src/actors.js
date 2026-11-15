// Paper puppets: Clawd (a paper redraw of the pixel mascot, jointed), human silhouettes (mantle, purse, hair), the alabaster jar, the oil lamps,
// Marta's pitcher, a row of seated guests, María's forearms for the close-up. Rotation only, like paper on a stick.
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
    set({ x = 0, y = 0, rot = 0, a = 0, a2 = null, s = 1, flip = false }) {
      g.position.x = x; g.position.y = y; g.rotation.z = rot; g.scale.set(flip ? -s : s, s, s); arm.rotation.z = a; if (arm2) arm2.rotation.z = a2 ?? a * .97;
      Object.assign(F.st, { x, y, s, flip, rot, a });
    },
    // world position (xy) of a point in the figure's unit space, honouring flip, scale and rotation
    at(ux, uy) { const { x, y, s, flip, rot } = F.st; const px = (flip ? -1 : 1) * ux * h * s, py = uy * h * s, c = Math.cos(rot), sn = Math.sin(rot); return [x + px * c - py * sn, y + px * sn + py * c]; },
    // the hand at the end of the (first) arm; k < 1 = part-way down the forearm
    hand(k = 1) { const a = F.st.a; return F.at(P.sh[0] + Math.sin(a) * .37 * k, P.sh[1] - Math.cos(a) * .37 * k); },
  };
  return F;
}

// María's hair: one long straight sheet of paper (no waves, no volume) hanging from the nape; it only rotates. Origin = the top (the nape).
export function cabello(U, { h = .085, z = -.07, col = '#3a2418', rim = .85 } = {}) {
  const w = h * .085, l = h * .44;
  return mk(U, { w: w * 1.6, h: l * 1.08, y: -l / 2, ay: l / 2, z, col, trans: .06, shadow: false, recv: false, finish: { rim, rimPx: 3, under: .2, rimCol: `rgba(255,226,170,${rim})` }, draw: x => {
    x.beginPath(); x.moveTo(-w * .5, l / 2); x.lineTo(w * .5, l / 2); x.lineTo(w * .42, -l * .44); x.quadraticCurveTo(0, -l / 2, -w * .42, -l * .44); x.closePath(); x.fill();
  } });
}

// The alabaster jar (alabastron): tall, narrow neck, flared lip. A group with its origin at the base centre; h = height.
// body: translucent cream alabaster with an emissive crack (revealed with uGR, a growing circle from the left end); neck: its own sheet so it can come off.
export function frasco(U, { h = .02, z = -.07, col = '#efe4cc', trans = .35, glowCol = '#ffd98a' } = {}) {
  const g = new THREE.Group(); g.position.z = z; const r = h * .17, nk = .72;
  const finish = { rim: .55, rimPx: 3, under: .3, rimCol: 'rgba(255,244,220,.6)' };
  const outline = x => {
    x.beginPath(); x.moveTo(0, 0); x.bezierCurveTo(r * .95, 0, r * 1.05, h * .18, r, h * .32); x.bezierCurveTo(r * .92, h * .52, r * .42, h * .62, h * .045, h * (nk + .02));
    x.lineTo(-h * .045, h * (nk + .02)); x.bezierCurveTo(-r * .42, h * .62, -r * .92, h * .52, -r, h * .32); x.bezierCurveTo(-r * 1.05, h * .18, -r * .95, 0, 0, 0); x.closePath(); x.fill();
  };
  const crackY = h * .6;
  const body = mk(U, { w: r * 2.4, h: h * .8, y: h * .38, z: 0, col, trans, ppm: 14000, finish, draw: x => { x.translate(0, -h * .38); outline(x); },
    glowDraw: x => {
      x.translate(0, -h * .38); x.strokeStyle = '#fff'; x.lineCap = 'round'; x.lineJoin = 'round';
      x.lineWidth = h * .028; x.beginPath(); x.moveTo(-r * 1.1, crackY - h * .14); x.lineTo(-r * .55, crackY - h * .06); x.lineTo(-r * .2, crackY - h * .1); x.lineTo(r * .15, crackY - h * .02); x.lineTo(r * .5, crackY - h * .07); x.lineTo(r * 1.1, crackY - h * .0); x.stroke();
      x.lineWidth = h * .014; x.beginPath(); x.moveTo(-r * .2, crackY - h * .1); x.lineTo(-r * .32, crackY - h * .26); x.lineTo(-r * .18, crackY - h * .36); x.stroke();
      x.beginPath(); x.moveTo(r * .5, crackY - h * .07); x.lineTo(r * .62, crackY - h * .2); x.stroke();
    }, glow: 2.6, glowCol, glowRes: 1 });
  const neck = mk(U, { w: h * .2, h: h * .32, y: h * .86, ay: -h * .14, z: .0002, col, trans, ppm: 14000, finish, draw: x => {
    x.translate(0, -h * .86); x.fillRect(-h * .042, h * (nk - .005), h * .084, h * .2); x.beginPath(); x.ellipse(0, h * .935, h * .085, h * .028, 0, 0, 7); x.fill();
  }, glowDraw: x => { x.translate(0, -h * .86); x.fillStyle = '#fff'; x.fillRect(-h * .05, h * (nk - .01), h * .1, h * .03); }, glow: 2.6, glowCol, glowRes: 1 });
  g.add(body, neck);
  const ub = body.material.userData.u, un = neck.material.userData.u;
  ub.uGlowLit.value = 0; un.uGlowLit.value = 0;
  const v = new THREE.Vector3();
  return { g, body, neck, h, r,
    // crack 0..1 (drawn from left to right), shine = glow multiplier, off 0..1 = the neck lifts away and falls aside
    set({ x = 0, y = 0, rot = 0, s = 1, crack = 0, shine = 1, off = 0, neckGone = false }) {
      g.position.x = x; g.position.y = y; g.rotation.z = rot; g.scale.setScalar(s);
      g.updateMatrixWorld(true);
      v.set(-r * 1.15, crackY - h * .1, 0).applyMatrix4(g.matrixWorld);
      ub.uGR.value.set(v.x, v.y, crack * r * 2.6 * s, crack > 0 ? 1 : 0); ub.uGlowLit.value = crack > 0 ? shine : 0;
      un.uGlowLit.value = off > 0 ? shine * .8 : 0;
      neck.position.set(off * h * .55, h * .72 + Math.sin(Math.PI * Math.min(1, off * 1.4)) * h * .18 - Math.max(0, off - .5) * h * .9, .0002); neck.rotation.z = -off * 1.6;
      neck.visible = !neckGone;
    } };
}

// A thread of poured light: a thin emissive strip from the top (origin) downward, length l; reveal 0..1 from the top
export function chorro(U, { l = .02, z = -.07, w = .0012 } = {}) {
  const m = mk(U, { w: w * 3, h: l * 1.05, y: -l / 2, ay: l / 2, z, col: '#ffe9b8', trans: .6, shadow: false, recv: false, ppm: 12000, finish: { rim: 0, under: 0, grain: false },
    draw: x => { x.beginPath(); x.moveTo(-w * .5, l / 2); x.quadraticCurveTo(w * .9, 0, -w * .2, -l / 2); x.lineTo(w * .3, -l / 2); x.quadraticCurveTo(w * 1.4, 0, w * .5, l / 2); x.closePath(); x.fill(); },
    glowDraw: x => { x.fillStyle = '#fff'; x.fillRect(-w * 1.5, -l * .53, w * 3, l * 1.06); }, glow: 2.2, glowCol: '#ffd98a', glowRes: 1 });
  m.userData.l = l;
  m.userData.set = (rev, k = 1) => { m.scale.y = Math.max(.001, rev); m.material.userData.u.uGlowLit.value = k; m.visible = rev > .01; };
  return m;
}

// Three clay oil lamps on one sheet, each with its own flame sheet (emissive, flickers and leans). Origin: the ledge line under the first lamp.
export function lamparas(U, { s = .0045, gap = .0095, n = 3, z = -.128, col = '#2a1a16', flameCol = '#ffc477' } = {}) {
  const g = new THREE.Group(); g.position.z = z;
  const W = (n - 1) * gap + s * 3;
  const bodies = mk(U, { w: W, h: s * 1.4, x: (n - 1) * gap / 2, y: s * .6, z: 0, col, trans: .06, shadow: false, ppm: 9000, finish: { rim: .55, rimPx: 3, under: .3 }, draw: x => {
    x.translate(-(n - 1) * gap / 2, -s * .6);
    for (let i = 0; i < n; i++) {
      x.save(); x.translate(i * gap, 0);
      x.beginPath(); x.moveTo(-s * .9, s * .38); x.quadraticCurveTo(-s * .95, 0, -s * .3, 0); x.lineTo(s * .35, 0); x.quadraticCurveTo(s * .8, s * .05, s * 1.15, s * .42); x.lineTo(s * 1.05, s * .5);
      x.quadraticCurveTo(s * .6, s * .5, s * .3, s * .62); x.quadraticCurveTo(-s * .3, s * .78, -s * .9, s * .38); x.closePath(); x.fill();
      x.beginPath(); x.ellipse(-s * .95, s * .45, s * .16, s * .2, 0, 0, 7); x.fill();
      x.restore();
    }
  } });
  g.add(bodies);
  const flames = [];
  for (let i = 0; i < n; i++) {
    const f = mk(U, { w: s * .9, h: s * 1.6, x: i * gap + s * 1.08, y: s * .5 + s * .75, ay: -s * .75, z: .0003, col: '#ffe2b0', trans: .6, shadow: false, recv: false, ppm: 14000, finish: { rim: 0, under: 0, grain: false },
      draw: x => { x.beginPath(); x.moveTo(0, -s * .72); x.bezierCurveTo(s * .36, -s * .62, s * .3, -s * .1, 0, s * .76); x.bezierCurveTo(-s * .3, -s * .1, -s * .36, -s * .62, 0, -s * .72); x.closePath(); x.fill(); },
      glowDraw: x => { x.fillStyle = '#fff'; x.beginPath(); x.moveTo(0, -s * .72); x.bezierCurveTo(s * .4, -s * .62, s * .34, -s * .1, 0, s * .8); x.bezierCurveTo(-s * .34, -s * .1, -s * .4, -s * .62, 0, -s * .72); x.closePath(); x.fill(); },
      glow: 2.4, glowCol: flameCol, glowRes: 1 });
    g.add(f); flames.push(f);
  }
  return { g, bodies, flames,
    // k = brightness/height, lean = radians (positive leans to -x)
    set(t, { k = 1, lean = 0 } = {}) {
      flames.forEach((f, i) => { const fl = 1 + .06 * Math.sin(t * 7.3 + i * 2.1) * Math.sin(t * 3.1 + i); f.scale.set(.9 + .1 * k, (.55 + .45 * k) * fl, 1); f.rotation.z = lean * (1 + .15 * i) + .03 * Math.sin(t * 5.3 + i * 1.7); f.material.emissiveIntensity = 2.4 * k * fl; });
    } };
}

// Marta's pitcher (dark clay, not terracotta). Origin: the handle top (where the hand holds it); h = height.
export function jarra(U, { h = .014, z = -.08, col = '#3a2a26' } = {}) {
  const w = h * .7;
  return mk(U, { w: w * 2.2, h: h * 1.3, x: w * .45, y: -h * .5, ax: -w * .45, ay: h * .5, z, col, trans: .08, shadow: false, ppm: 9000, finish: { rim: .55, rimPx: 3, under: .3 }, draw: x => {
    x.translate(-w * .45, h * .5);
    x.beginPath(); x.moveTo(w * .1, -h); x.quadraticCurveTo(w * .9, -h * .95, w * .95, -h * .45); x.quadraticCurveTo(w * .9, -h * .15, w * .6, -h * .08); x.lineTo(w * 1.1, h * .02); x.lineTo(w * .3, -h * .02);
    x.quadraticCurveTo(-w * .2, -h * .2, -w * .1, -h * .55); x.quadraticCurveTo(-w * .05, -h * .9, w * .1, -h); x.closePath(); x.fill();
    x.lineWidth = h * .09; x.beginPath(); x.moveTo(w * .05, -h * .2); x.quadraticCurveTo(-w * .35, -h * .15, -w * .2, -h * .55); x.stroke();
  } });
}

// A row of seated guests on one sheet (the disciples at the table). Origin: the floor line.
export function diners(U, { n = 3, h = .066, z = -.1, col = '#150e13', gap = .03, seed = 3, trans = .06, rim = .5 } = {}) {
  const R = mulberry(seed), people = [];
  for (let i = 0; i < n; i++) people.push({ x: (i - (n - 1) / 2) * gap + (R() - .5) * gap * .25, s: h * (.92 + R() * .14), flip: R() < .5, lean: (R() - .5) * .08 });
  const W = n * gap + h * .9, H_ = h * .9, g = new THREE.Group(); g.position.z = z;
  g.add(mk(U, { w: W, h: H_, y: H_ / 2 - h * .02, z: 0, col, trans, ppm: 7000, finish: { rim, rimPx: 3, under: .2, rimCol: `rgba(255,226,170,${rim})` }, draw: x => {
    x.translate(0, -H_ / 2 + h * .02);
    for (const p of people) { x.save(); x.translate(p.x, 0); x.rotate(p.lean); x.scale(p.flip ? -p.s : p.s, p.s); POSES.sit.draw(x); x.fillRect(-.03, .3, .09, .25); x.restore(); }
  } }));
  return g;
}

// María's forearms and hands for the close-up of S1 / the cover: both come in from the lower left (she is out of frame);
// one palm under the base of the jar, the other hand steadying its side. Origin: the jar's base.
export function manos(U, { s = .006, z = -.1, col = '#0d080c', rim = .6 } = {}) {
  return mk(U, { w: s * 14, h: s * 14, x: -s * 4, y: -s * 2, z, col, trans: .05, shadow: true, ppm: 9000, finish: { rim, rimPx: 4, under: .25, rimCol: `rgba(255,226,170,${rim})` }, draw: x => {
    x.translate(s * 4, s * 2);
    x.beginPath(); x.moveTo(-9 * s, -6.5 * s); x.lineTo(-7.6 * s, -8 * s); x.quadraticCurveTo(-3 * s, -3.2 * s, .3 * s, -.55 * s); x.quadraticCurveTo(1.25 * s, -.2 * s, 1.1 * s, .05 * s);
    x.quadraticCurveTo(.3 * s, .12 * s, -.9 * s, -.05 * s); x.quadraticCurveTo(-4.5 * s, -2.4 * s, -9 * s, -6.5 * s); x.closePath(); x.fill();   // lower forearm, palm under the base
    x.beginPath(); x.moveTo(-9 * s, -2.6 * s); x.lineTo(-9 * s, -1.2 * s); x.quadraticCurveTo(-4 * s, .4 * s, -1.25 * s, 1.95 * s); x.quadraticCurveTo(-.55 * s, 2.5 * s, -.45 * s, 1.7 * s);
    x.quadraticCurveTo(-.5 * s, 1.1 * s, -1.1 * s, .9 * s); x.quadraticCurveTo(-4.4 * s, -.9 * s, -9 * s, -2.6 * s); x.closePath(); x.fill();   // upper forearm, fingers on the side
  } });
}
