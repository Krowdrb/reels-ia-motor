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
  // tendido de lado (cabeza hacia +x, algo alzada); el brazo cuelga del hombro
  lie: { sh: [.3, .19], draw(x) {
    x.beginPath(); x.moveTo(-.54, 0); x.bezierCurveTo(-.56, .07, -.46, .1, -.3, .1); x.quadraticCurveTo(-.08, .1, .08, .14);
    x.quadraticCurveTo(.26, .22, .36, .2); x.quadraticCurveTo(.42, .12, .4, 0); x.closePath(); x.fill();
    x.beginPath(); x.arc(.47, .215, .088, 0, 7); x.fill();
    x.beginPath(); x.moveTo(.53, .2); x.lineTo(.6, .1); x.lineTo(.5, .14); x.closePath(); x.fill();
  } },
};
// tocados: alto (sacerdote) y bajo (levita); cx, cy = centro de la cabeza en cada pose
const HEAD = { stand: [.015, .905], sit: [.075, .63], kneel: [.04, .745], lie: [.47, .215] };
function hatDraw(x, kind, [cx, cy]) {
  if (kind === 'tall') { x.beginPath(); x.moveTo(cx - .085, cy + .03); x.lineTo(cx - .07, cy + .15); x.quadraticCurveTo(cx, cy + .185, cx + .07, cy + .15); x.lineTo(cx + .085, cy + .03); x.closePath(); x.fill(); x.fillRect(cx - .11, cy + .02, .22, .03); }
  if (kind === 'low') { x.beginPath(); x.ellipse(cx, cy + .06, .108, .05, 0, 0, 7); x.fill(); }
  if (kind === 'wrap') { x.beginPath(); x.ellipse(cx - .01, cy + .055, .1, .055, -.15, 0, 7); x.fill(); x.beginPath(); x.moveTo(cx - .1, cy + .05); x.quadraticCurveTo(cx - .17, cy - .06, cx - .13, cy - .2); x.lineTo(cx - .07, cy - .05); x.closePath(); x.fill(); }
}
export function human(U, { h = .085, z = -.085, col = '#07101a', pose = 'stand', trans = .05, rim = .6, two = false, hat = null } = {}) {
  const g = new THREE.Group(); g.position.z = z; const P = POSES[pose], W = h * (pose === 'lie' ? 1.32 : 1.1), H_ = h * 1.12;
  const finish = { rim, rimPx: 4, under: .2, rimCol: `rgba(255,226,170,${rim})` };
  const body = mk(U, { w: W, h: H_, y: H_ / 2 - h * .03, z: 0, col, trans, finish, draw: x => { x.translate(0, -H_ / 2 + h * .03); x.scale(h, h); P.draw(x); if (hat) hatDraw(x, hat, HEAD[pose]); } });
  const aw = h * .078, al = h * .37;
  const mkArm = dz => mk(U, { w: aw * 1.6, h: al * 1.25, x: P.sh[0] * h, y: P.sh[1] * h - al / 2, ay: al / 2, z: dz, col, trans, shadow: false, recv: false, finish,
    draw: x => { x.beginPath(); x.moveTo(-aw * .55, al / 2); x.lineTo(aw * .55, al / 2); x.lineTo(aw * .33, -al / 2); x.lineTo(-aw * .33, -al / 2); x.closePath(); x.fill(); x.beginPath(); x.arc(0, al / 2, aw * .55, 0, 7); x.fill(); x.beginPath(); x.ellipse(0, -al / 2, aw * .42, aw * .62, 0, 0, 7); x.fill(); } });
  const arm = mkArm(.0005), arm2 = two ? mkArm(-.0005) : null;
  g.add(body, arm); if (arm2) g.add(arm2);
  // face = 1 mira a +x, -1 a -x; a2 = segundo brazo (si two); hand() = punta del brazo en coordenadas del grupo padre
  const st = { x: 0, y: 0, rot: 0, a: 0, s: 1, face: 1 };
  return { g, body, arm, arm2, h, set({ x = 0, y = 0, rot = 0, a = 0, a2 = null, s = 1, face = 1 }) { Object.assign(st, { x, y, rot, a, s, face }); g.position.x = x; g.position.y = y; g.rotation.z = rot * face; g.scale.set(s * face, s, s); arm.rotation.z = a; if (arm2) arm2.rotation.z = a2 ?? a * .97; },
    hand(k = 1) { const px = P.sh[0] * h, py = P.sh[1] * h, l = al * .95 * k; const ax = px + Math.sin(st.a) * l, ay = py - Math.cos(st.a) * l; const c = Math.cos(st.rot), sn = Math.sin(st.rot); return [st.x + st.face * st.s * (ax * c - ay * sn), st.y + st.s * (ax * sn + ay * c)]; } };
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

// Asno de papel: origen en el suelo bajo el centro del cuerpo, mira a +x. L = largo del cuerpo. Cabeza y patas giran (papel en un palo).
// Proporciones de burro: lomo a ~.72 L, orejas largas pero hacia atrás, patas cortas y firmes.
export function donkey(U, { L = .05, z = -.07, col = '#0a0d16', rim = .6, trans = .05 } = {}) {
  const g = new THREE.Group(); g.position.z = z;
  const finish = { rim, rimPx: 4, under: .2, rimCol: `rgba(255,226,170,${rim})` };
  const at = (x, cx, cy) => x.translate(-cx, -cy);   // dibujar en coordenadas del grupo
  const body = mk(U, { w: L * 1.25, h: L * .55, y: L * .56, z: 0, col, trans, finish, draw: x => { at(x, 0, L * .56);
    x.beginPath(); x.moveTo(-L * .46, L * .5); x.bezierCurveTo(-L * .5, L * .62, -L * .42, L * .72, -L * .28, L * .71); x.quadraticCurveTo(0, L * .67, L * .26, L * .72);
    x.quadraticCurveTo(L * .42, L * .72, L * .44, L * .56); x.quadraticCurveTo(L * .42, L * .4, L * .3, L * .39); x.lineTo(-L * .34, L * .39); x.quadraticCurveTo(-L * .48, L * .41, -L * .46, L * .5); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(-L * .45, L * .64); x.quadraticCurveTo(-L * .56, L * .55, -L * .55, L * .36); x.lineTo(-L * .51, L * .36); x.quadraticCurveTo(-L * .51, L * .52, -L * .43, L * .6); x.closePath(); x.fill();
  } });
  const hx = L * .58, hy = L * .84;
  const head = mk(U, { w: L * .62, h: L * .62, x: hx, y: hy, ax: L * .36 - hx, ay: L * .64 - hy, z: .0004, col, trans, finish, draw: x => { at(x, hx, hy);
    x.beginPath(); x.moveTo(L * .3, L * .56); x.quadraticCurveTo(L * .44, L * .84, L * .56, L * .92); x.quadraticCurveTo(L * .66, L * .95, L * .72, L * .86);
    x.quadraticCurveTo(L * .8, L * .74, L * .8, L * .66); x.quadraticCurveTo(L * .76, L * .6, L * .7, L * .63); x.quadraticCurveTo(L * .6, L * .7, L * .5, L * .64); x.quadraticCurveTo(L * .44, L * .56, L * .4, L * .52); x.closePath(); x.fill();
    for (const d of [0, .05]) { x.beginPath(); x.moveTo(L * (.55 - d), L * .9); x.quadraticCurveTo(L * (.47 - d), L * 1.04, L * (.43 - d), L * 1.1); x.quadraticCurveTo(L * (.53 - d), L * 1.03, L * (.61 - d), L * .91); x.closePath(); x.fill(); }
    x.beginPath(); x.arc(L * .5, L * .62, L * .028, 0, 7); x.fill();   // campanilla
  } });
  const legs = [-.33, -.24, .22, .31].map((cx, i) => { const lx = cx * L, ly = L * .22; return mk(U, { w: L * .14, h: L * .5, x: lx, y: ly, ay: L * .2, z: i % 2 ? -.0006 : .0006, col, trans, shadow: false, finish, draw: x => { at(x, lx, ly);
    x.beginPath(); x.moveTo(lx - L * .045, L * .45); x.lineTo(lx + L * .045, L * .45); x.lineTo(lx + L * .028, L * .03); x.lineTo(lx - L * .028, L * .03); x.closePath(); x.fill(); x.fillRect(lx - L * .036, 0, L * .072, L * .035);
  } }); });
  g.add(body, head, ...legs);
  return { g, body, head, legs, L, set({ x = 0, y = 0, walk = 0, stride = 0, nod = 0, face = 1 }) {
    g.position.x = x; g.position.y = y + Math.abs(Math.sin(walk)) * L * .012 * (stride > 0 ? 1 : 0); g.scale.set(face, 1, 1);
    legs.forEach((l, i) => { l.rotation.z = Math.sin(walk + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI / 2 : 0)) * stride; });
    head.rotation.z = nod + Math.sin(walk * .5) * .05 * (stride > 0 ? 1 : 0);
  } };
}

// Lámina pequeña que destella: moneda o frasco. Devuelve la malla; userData.u.uGlowLit enciende el destello.
export function trinket(U, kind, { s = .004, z = -.06, col = '#c9a45a' } = {}) {
  const draw = kind === 'coin' ? (x => { x.beginPath(); x.arc(0, 0, s * .5, 0, 7); x.fill(); })
    : (x => { x.beginPath(); x.ellipse(0, -s * .2, s * .38, s * .42, 0, 0, 7); x.fill(); x.fillRect(-s * .12, 0, s * .24, s * .55); });
  return mk(U, { w: s * 1.4, h: s * 1.6, z, col, trans: .2, shadow: false, recv: false, ppm: 12000, finish: { rim: .6, under: .2 }, draw,
    glowDraw: x => { x.fillStyle = '#fff'; draw(x); }, glow: 2.2, glowCol: '#ffe6a8', glowRes: .4 });
}
