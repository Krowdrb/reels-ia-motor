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
    x.beginPath(); x.moveTo(.05, .89); x.lineTo(.135, .775); x.lineTo(.02, .81); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(-.09, .98); x.quadraticCurveTo(-.15, .9, -.14, .74); x.lineTo(-.03, .86); x.closePath(); x.fill();
  } },
  sit: { sh: [.0, .52], draw(x) {
    x.beginPath(); x.moveTo(-.27, 0); x.bezierCurveTo(-.32, .2, -.27, .42, -.13, .56); x.quadraticCurveTo(-.03, .63, .05, .56); x.bezierCurveTo(.1, .42, .3, .37, .36, .27); x.lineTo(.38, 0); x.closePath(); x.fill();
    x.beginPath(); x.arc(.075, .63, .092, 0, 7); x.fill();
    x.beginPath(); x.moveTo(.11, .615); x.lineTo(.2, .505); x.lineTo(.08, .54); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(-.03, .71); x.quadraticCurveTo(-.1, .63, -.09, .47); x.lineTo(.04, .58); x.closePath(); x.fill();
  } },
  // Cuatro sueños: a man asleep sitting up, chin on the chest (the head dropped forward and down, no face)
  doze: { sh: [.0, .5], draw(x) {
    x.beginPath(); x.moveTo(-.27, 0); x.bezierCurveTo(-.32, .2, -.27, .42, -.13, .55); x.quadraticCurveTo(-.03, .61, .06, .53); x.bezierCurveTo(.1, .42, .3, .37, .36, .27); x.lineTo(.38, 0); x.closePath(); x.fill();
    x.beginPath(); x.arc(.105, .575, .09, 0, 7); x.fill();
    x.beginPath(); x.moveTo(-.04, .6); x.quadraticCurveTo(-.08, .55, -.08, .46); x.lineTo(.05, .55); x.closePath(); x.fill();
  } },
  // a veiled woman carrying a small child in her arms (a bundle with a small head at her shoulder)
  carry: { sh: [.01, .72], draw(x) {
    POSES.veiled.draw(x);
    x.beginPath(); x.ellipse(.15, .56, .1, .075, -.5, 0, 7); x.fill();
    x.beginPath(); x.arc(.15, .69, .05, 0, 7); x.fill();
  } },
  // a veiled woman seated; the mantle falls down her back
  vsit: { sh: [.0, .5], draw(x) {
    x.beginPath(); x.moveTo(-.27, 0); x.bezierCurveTo(-.32, .2, -.27, .42, -.13, .56); x.quadraticCurveTo(-.03, .63, .05, .56); x.bezierCurveTo(.1, .42, .3, .37, .36, .27); x.lineTo(.38, 0); x.closePath(); x.fill();
    x.beginPath(); x.arc(.07, .62, .085, 0, 7); x.fill();
    x.beginPath(); x.moveTo(.13, .66); x.quadraticCurveTo(-.02, .77, -.1, .64); x.quadraticCurveTo(-.2, .45, -.3, .12); x.lineTo(-.18, .3); x.lineTo(-.05, .58); x.closePath(); x.fill();
  } },
  // a small child standing: a short body, a large head
  child: { sh: [.02, .6], draw(x) {
    x.beginPath(); x.moveTo(-.17, 0); x.bezierCurveTo(-.2, .22, -.15, .45, -.11, .6); x.quadraticCurveTo(-.06, .68, .04, .68); x.quadraticCurveTo(.12, .65, .13, .55); x.bezierCurveTo(.16, .38, .2, .2, .2, 0); x.closePath(); x.fill();
    x.beginPath(); x.arc(.02, .82, .15, 0, 7); x.fill();
  } },
  // a woman with a mantle over the head that falls down the back; a long robe (Juan 19:25: only silhouettes, no features, no colour)
  veiled: { sh: [.01, .73], draw(x) {
    x.beginPath(); x.moveTo(-.22, 0); x.bezierCurveTo(-.22, .26, -.17, .52, -.13, .68); x.quadraticCurveTo(-.11, .79, -.03, .81); x.lineTo(.05, .81);
    x.quadraticCurveTo(.13, .77, .13, .66); x.bezierCurveTo(.15, .45, .2, .22, .22, 0); x.closePath(); x.fill();
    x.beginPath(); x.arc(.015, .9, .088, 0, 7); x.fill();
    x.beginPath(); x.moveTo(.1, .925); x.lineTo(.124, .884); x.lineTo(.096, .872); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(.06, 1.0); x.quadraticCurveTo(-.08, 1.02, -.12, .88); x.quadraticCurveTo(-.17, .7, -.22, .42); x.lineTo(-.12, .5); x.lineTo(-.04, .8); x.closePath(); x.fill();
  } },
  // —— La Transfiguración ——
  // a man seen from the front (or from behind: the silhouette is the same), arms inside the robe. No features. Used for Jesús and for Pedro from behind.
  front: { sh: [.135, .735], sh2: -.135, draw(x) {
    x.beginPath(); x.moveTo(-.19, 0); x.bezierCurveTo(-.2, .24, -.17, .5, -.15, .66); x.quadraticCurveTo(-.14, .755, -.06, .77); x.lineTo(-.035, .79);
    x.lineTo(.035, .79); x.lineTo(.06, .77); x.quadraticCurveTo(.14, .755, .15, .66); x.bezierCurveTo(.17, .5, .2, .24, .19, 0); x.closePath(); x.fill();
    x.fillRect(-.032, .76, .064, .06);
    x.beginPath(); x.ellipse(0, .875, .078, .09, 0, 0, 7); x.fill();
  } },
  // a man kneeling, seen from behind: a low mound of robe, the shoulders, the head
  backkneel: { sh: [0, .5], draw(x) {
    x.beginPath(); x.moveTo(-.25, 0); x.bezierCurveTo(-.26, .14, -.2, .32, -.15, .44); x.quadraticCurveTo(-.13, .51, -.05, .52); x.lineTo(.05, .52);
    x.quadraticCurveTo(.13, .51, .15, .44); x.bezierCurveTo(.2, .32, .26, .14, .25, 0); x.closePath(); x.fill();
    x.fillRect(-.03, .5, .06, .06);
    x.beginPath(); x.ellipse(0, .62, .077, .088, 0, 0, 7); x.fill();
  } },
  // a man in a long robe with a mantle over the shoulders (Moisés, Elías): no veil, no attributes; side view facing +x
  mantle: { sh: [.01, .74], draw(x) {
    x.beginPath(); x.moveTo(-.24, 0); x.bezierCurveTo(-.24, .26, -.19, .52, -.14, .68); x.quadraticCurveTo(-.11, .79, -.03, .81); x.lineTo(.05, .81);
    x.quadraticCurveTo(.13, .77, .13, .66); x.bezierCurveTo(.15, .45, .21, .22, .23, 0); x.closePath(); x.fill();
    x.beginPath(); x.arc(.015, .905, .092, 0, 7); x.fill();
    x.beginPath(); x.moveTo(.05, .89); x.lineTo(.135, .775); x.lineTo(.02, .81); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(-.07, .83); x.quadraticCurveTo(-.2, .78, -.22, .6); x.quadraticCurveTo(-.28, .3, -.29, .04); x.lineTo(-.2, .1); x.lineTo(-.12, .6); x.closePath(); x.fill();
  } },
  // fallen on the face (Mt 17:6): on the knees, the back bent down, the head low by the ground but clear of it; side view facing +x
  bow: { sh: [.12, .3], draw(x) {
    x.beginPath(); x.moveTo(-.32, 0); x.bezierCurveTo(-.35, .16, -.28, .31, -.16, .33); x.bezierCurveTo(-.04, .35, .08, .27, .14, .18); x.quadraticCurveTo(.17, .12, .15, .07);
    x.lineTo(.4, .035); x.lineTo(.4, 0); x.closePath(); x.fill();
    x.beginPath(); x.ellipse(.245, .155, .087, .082, -.2, 0, 7); x.fill();
  } },
  kneel: { sh: [.02, .58], draw(x) {
    x.beginPath(); x.moveTo(-.3, 0); x.bezierCurveTo(-.3, .13, -.24, .32, -.15, .5); x.quadraticCurveTo(-.11, .62, -.02, .65); x.lineTo(.06, .65); x.quadraticCurveTo(.13, .61, .13, .5); x.bezierCurveTo(.13, .35, .2, .2, .26, 0); x.closePath(); x.fill();
    x.beginPath(); x.arc(.04, .745, .092, 0, 7); x.fill();
    x.beginPath(); x.moveTo(.075, .73); x.lineTo(.16, .62); x.lineTo(.05, .65); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(-.07, .82); x.quadraticCurveTo(-.13, .74, -.12, .58); x.lineTo(0, .7); x.closePath(); x.fill();
  } },
};
export function human(U, { h = .085, z = -.085, col = '#07101a', pose = 'stand', trans = .05, rim = .6, two = false, edge = null, noArm = false, fadeable = false } = {}) {
  const g = new THREE.Group(); g.position.z = z; const P = POSES[pose], W = h * 1.1, H_ = h * 1.12;
  const finish = { rim, rimPx: 4, under: .2, rimCol: `rgba(255,226,170,${rim})` };
  const body = mk(U, { w: W, h: H_, y: H_ / 2 - h * .03, z: 0, col, trans, finish, draw: x => { x.translate(0, -H_ / 2 + h * .03); x.scale(h, h); P.draw(x); } });
  const aw = h * .078, al = h * .37;
  const mkArm = (dz, sx = P.sh[0]) => mk(U, { w: aw * 1.6, h: al * 1.25, x: sx * h, y: P.sh[1] * h - al / 2, ay: al / 2, z: dz, col, trans, shadow: false, recv: false, finish,
    draw: x => { x.beginPath(); x.moveTo(-aw * .55, al / 2); x.lineTo(aw * .55, al / 2); x.lineTo(aw * .33, -al / 2); x.lineTo(-aw * .33, -al / 2); x.closePath(); x.fill(); x.beginPath(); x.arc(0, al / 2, aw * .55, 0, 7); x.fill(); x.beginPath(); x.ellipse(0, -al / 2, aw * .42, aw * .62, 0, 0, 7); x.fill(); } });
  const arm = mkArm(.0005), arm2 = two ? mkArm(-.0005, P.sh2 ?? P.sh[0]) : null;
  g.add(body, arm); if (arm2) g.add(arm2); if (noArm) arm.visible = false;
  // edge: a backlit rim. The same silhouette, dilated, behind the body; only its outline shows. lit(v) turns it on (0..1+)
  let rimM = null;
  if (edge) {
    const d = h * .009, sil = x => { for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; x.save(); x.translate(Math.cos(a) * d, Math.sin(a) * d); x.scale(h, h); P.draw(x); x.restore(); } };
    rimM = mk(U, { w: W * 1.08, h: H_ * 1.06, y: H_ / 2 - h * .03, z: -.0007, col: '#000000', trans: 0, shadow: false, recv: false, finish: { rim: 0, under: 0, grain: false },
      draw: x => { x.translate(0, -H_ / 2 + h * .03); sil(x); }, glowDraw: x => { x.fillStyle = '#fff'; x.translate(0, -H_ / 2 + h * .03); sil(x); }, glow: 1.5, glowCol: edge, glowRes: .7 });
    rimM.material.userData.u.uGlowLit.value = 0; g.add(rimM);
  }
  // fadeable: the body and arms can fade in/out (opacity) instead of the hard alpha test; they cast no shadow
  const mats = [body, arm, arm2].filter(Boolean);
  if (fadeable) for (const m of mats) { m.material.alphaTest = .02; m.material.alphaToCoverage = false; m.material.transparent = true; m.castShadow = false; m.material.needsUpdate = true; }
  return { g, body, arm, arm2, rimM,
    fade(v) { for (const m of mats) { m.material.opacity = v; m.visible = v > .003 && !(m === arm && noArm); } },
    lit(v, col) { if (!rimM) return; rimM.material.userData.u.uGlowLit.value = v; rimM.visible = v > .002; if (col) rimM.material.emissive.set(col); },
    set({ x = 0, y = 0, rot = 0, a = 0, a2 = null, s = 1 }) { g.position.x = x; g.position.y = y; g.rotation.z = rot; g.scale.setScalar(s); arm.rotation.z = a; if (arm2) arm2.rotation.z = a2 ?? a * .97; } };
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

// —— El único que se quedó: the cross on the hill, olive trees, torches ——
// The cross as one far silhouette cut from one sheet: upright, crossbeam, and a serene figure with the arms along the beam and the head bowed.
// No wounds, no nails, no crown, no features. Origin at the foot of the upright; ch = height.
export function cross(U, { ch = .07, z = -.166, col = '#05050b', rim = .5, rimCol = 'rgba(214,218,255,.55)' } = {}) {
  const k = ch;
  return mk(U, { w: k * .7, h: k * 1.04, y: k * .5, z, col, trans: .02, ppm: 5200, finish: { rim, rimPx: 3, rimCol, under: .2 }, draw: x => {
    x.translate(0, -k * .5);
    x.fillRect(-k * .026, 0, k * .052, k); x.fillRect(-k * .31, k * .78, k * .62, k * .046);   // upright, crossbeam
    x.lineCap = 'round'; x.lineJoin = 'round';
    x.lineWidth = k * .03; for (const s of [-1, 1]) { x.beginPath(); x.moveTo(s * k * .045, k * .715); x.quadraticCurveTo(s * k * .16, k * .78, s * k * .27, k * .81); x.stroke(); }   // arms
    x.beginPath(); x.moveTo(-k * .055, k * .725); x.quadraticCurveTo(-k * .06, k * .6, -k * .04, k * .47); x.lineTo(-k * .045, k * .4); x.lineTo(k * .045, k * .4); x.lineTo(k * .04, k * .47);
    x.quadraticCurveTo(k * .06, k * .6, k * .055, k * .725); x.closePath(); x.fill();   // body and cloth
    x.beginPath(); x.moveTo(-k * .03, k * .41); x.lineTo(-k * .014, k * .2); x.lineTo(k * .018, k * .2); x.lineTo(k * .03, k * .41); x.closePath(); x.fill();   // legs together
    x.beginPath(); x.ellipse(k * .022, k * .735, k * .038, k * .043, -.5, 0, 7); x.fill();   // head, bowed to one side
  } });
}

// An olive tree: twisted trunk and a crown of leaf clusters. Origin at the foot.
export function olive(U, { h = .09, z = -.12, col = '#22355a', trans = .35, rim = .45, seed = 3, lean = 0 } = {}) {
  const R = mulberry(seed), blobs = [];
  for (let i = 0; i < 26; i++) { const a = R() * 6.283, r = Math.sqrt(R()); blobs.push([lean * h * .5 + Math.cos(a) * r * h * .48, h * .78 + Math.sin(a) * r * h * .22, h * (.05 + R() * .07), h * (.025 + R() * .03), (R() - .5) * 1.2]); }
  return mk(U, { w: h * 1.3, h: h * 1.1, y: h * .55, z, col, trans, ppm: 2600, finish: { rim, rimPx: 4, under: .3 }, draw: x => {
    x.translate(0, -h * .55);
    x.beginPath(); x.moveTo(-h * .07, 0); x.bezierCurveTo(-h * .02, h * .2, -h * .12, h * .4, lean * h * .3 - h * .03, h * .7); x.lineTo(lean * h * .3 + h * .04, h * .7);
    x.bezierCurveTo(h * .0, h * .45, h * .09, h * .25, h * .08, 0); x.closePath(); x.fill();
    x.lineWidth = h * .022; x.lineCap = 'round';
    for (const s of [-1, 1]) { x.beginPath(); x.moveTo(lean * h * .3, h * .62); x.quadraticCurveTo(s * h * .2, h * .7, s * h * .34 + lean * h * .3, h * .8); x.stroke(); }
    for (const [bx, by, rx, ry, a] of blobs) { x.beginPath(); x.ellipse(bx, by, rx, ry, a, 0, 6.283); x.fill(); }
  } });
}

// A torch: a short pole with a flame that glows (warm); origin at the hand. light(v) sets the flame.
export function torch(U, { s = .02, z = 0, col = '#120a06' } = {}) {
  const g = new THREE.Group(); g.position.z = z;
  const pole = mk(U, { w: s * .2, h: s * 1.1, y: -s * .3, col, trans: 0, shadow: false, recv: false, finish: { rim: .3 }, draw: x => x.fillRect(-s * .035, -s * .55, s * .07, s * 1.1) });
  const fl = s => { const d = x => { x.beginPath(); x.moveTo(0, s * .55); x.quadraticCurveTo(s * .2, s * .1, s * .09, -s * .12); x.quadraticCurveTo(0, -s * .2, -s * .09, -s * .12); x.quadraticCurveTo(-s * .2, s * .1, 0, s * .55); x.fill(); }; return d; };
  const flame = mk(U, { w: s * .6, h: s * .9, y: s * .4, z: .0003, col: '#3a1a08', trans: 0, shadow: false, recv: false, finish: { rim: 0, under: 0, grain: false }, draw: fl(s), glowDraw: x => { x.fillStyle = '#fff'; fl(s)(x); }, glow: 4, glowCol: '#ffb862', glowRes: .8 });
  g.add(pole, flame);
  return { g, flame, light(v) { flame.material.userData.u.uGlowLit.value = v; flame.visible = v > .01; } };
}

// —— Cuatro sueños: a palm (Egypt). Origin at the foot; a slightly curved trunk and a crown of drooping fronds ——
export function palm(U, { h = .1, z = -.12, col = '#46385f', trans = .3, rim = .45, lean = .15, seed = 2 } = {}) {
  const R = mulberry(seed);
  return mk(U, { w: h * 1.2, h: h * 1.25, y: h * .6, z, col, trans, ppm: 2600, finish: { rim, rimPx: 4, under: .3 }, draw: x => {
    x.translate(0, -h * .6);
    const tx = lean * h, ty = h * .92;
    x.beginPath(); x.moveTo(-h * .03, 0); x.quadraticCurveTo(lean * h * .2 - h * .02, h * .5, tx - h * .012, ty); x.lineTo(tx + h * .012, ty); x.quadraticCurveTo(lean * h * .2 + h * .02, h * .5, h * .03, 0); x.closePath(); x.fill();
    for (let i = 0; i < 9; i++) {
      const a = (i / 8) * Math.PI * 1.1 - .05 + (R() - .5) * .2, L = h * (.32 + R() * .12), ex = tx + Math.cos(a) * L, ey = ty + Math.sin(a) * L * .45 - L * .35 * Math.abs(Math.cos(a));
      x.beginPath(); x.moveTo(tx, ty + h * .01); x.quadraticCurveTo(tx + Math.cos(a) * L * .5, ty + h * .1 + Math.sin(a) * L * .25, ex, ey);
      x.quadraticCurveTo(tx + Math.cos(a) * L * .5, ty + h * .05 + Math.sin(a) * L * .15, tx, ty - h * .01); x.closePath(); x.fill();
    }
  } });
}

// —— La Transfiguración: Jesús transfigured, seen from the front. The same frontal silhouette twice: a dark paper figure, and in front of it
// a sheet of light with his shape (emissive white-gold), revealed from the chest outward by a growing circle: the paper "opens" with his form
// and the light from behind comes through. No face, no halo ring, no rays: only the shape of light and a soft bloom behind.
export function lightFig(U, { h = .082, z = -.16, col = '#07061a', light = '#fff3d6', rim = .5, edge = '#ffe2a8' } = {}) {
  const A = human(U, { h, z, pose: 'front', col, rim, edge, noArm: true });
  const P = POSES.front, W = h * 1.1, H_ = h * 1.12;
  const lm = mk(U, { w: W, h: H_, y: H_ / 2 - h * .03, z: .0006, col: '#ffffff', trans: 0, shadow: false, recv: false, finish: { rim: 0, under: 0, grain: false },
    draw: x => { x.translate(0, -H_ / 2 + h * .03); x.scale(h, h); P.draw(x); },
    glowDraw: x => { x.fillStyle = '#fff'; x.translate(0, -H_ / 2 + h * .03); x.scale(h, h); P.draw(x); }, glow: 3.2, glowCol: light, glowRes: .8 });
  const u = lm.material.userData.u; A.g.add(lm);
  A.lm = lm;
  // cal(v, k): v = 0..1 how much of the shape is open (circle from the chest), k = brightness
  A.cal = (v, k = 1) => {
    const p = A.g.position, sx = Math.abs(A.g.scale.x);
    lm.visible = v > .002; u.uGlowLit.value = k * Math.min(1, v * 3);
    lm.material.color.set('#fff6e8').multiplyScalar(lerp01(.25, 1, Math.min(1, v * 2)) / BASE);
    u.uClip.value.set(p.x, p.y + h * .62 * sx, h * .75 * sx * v, 0);
  };
  A.cal(0);
  return A;
}
const lerp01 = (a, b, t) => a + (b - a) * t;

// —— Pedro's three tents: a pale outline of a booth of branches (two posts, a gable roof, a few leaves), stroke only, no fill.
// Origin at the foot; reveal(v) grows it from the ground (a circle from the base), k = brightness, fade(o) = opacity.
export function tent(U, { s = .03, z = -.15, col = '#efe2c4' } = {}) {
  const W = s * 1.1, H_ = s * 1.15, lw = s * .045;
  const m = mk(U, { w: W + lw * 4, h: H_ + lw * 4, y: H_ / 2, z, col, trans: 0, shadow: false, recv: false, finish: { rim: 0, under: 0, grain: false }, ppm: 7000,
    draw: x => { drawTent(x, W, H_, lw); }, glowDraw: x => { x.strokeStyle = '#fff'; drawTent(x, W, H_, lw); }, glow: 1.1, glowCol: '#ffe9c0', glowRes: .7 });
  m.material.alphaTest = .02; m.material.alphaToCoverage = false; m.material.transparent = true; m.material.needsUpdate = true;
  const u = m.material.userData.u;
  return { m, set(x, y, reveal, k = 1, op = 1) { m.position.x = x; m.position.y = y + H_ / 2; m.visible = reveal > .002 && op > .003; u.uClip.value.set(x, y, H_ * 1.3 * reveal, 0); u.uGlowLit.value = k; m.material.opacity = op; } };
}
function drawTent(x, W, H_, lw) {
  x.translate(0, -H_ / 2); x.lineWidth = lw; x.lineCap = 'round'; x.lineJoin = 'round';
  const w = W * .42, eave = H_ * .62;
  x.beginPath(); x.moveTo(-w, 0); x.lineTo(-w, eave); x.moveTo(w, 0); x.lineTo(w, eave); x.stroke();
  x.beginPath(); x.moveTo(-w * 1.18, eave * .96); x.lineTo(0, H_ * .97); x.lineTo(w * 1.18, eave * .96); x.stroke();
  x.lineWidth = lw * .7;
  for (let i = 1; i < 4; i++) { const f = i / 4; for (const sg of [-1, 1]) { const px = sg * w * 1.18 * (1 - f), py = eave * .96 + (H_ * .97 - eave * .96) * f; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + sg * W * .08, py - H_ * .02, px + sg * W * .14, py - H_ * .1); x.stroke(); } }
  x.beginPath(); x.moveTo(-w, eave * .45); x.lineTo(w, eave * .45); x.stroke();
}
