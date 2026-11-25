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
  // a woman in a long robe, a headscarf falling down the back; no features
  woman: { sh: [.0, .72], draw(x) {
    x.beginPath(); x.moveTo(-.22, 0); x.bezierCurveTo(-.2, .24, -.15, .5, -.12, .66); x.quadraticCurveTo(-.1, .78, -.02, .8); x.lineTo(.05, .8);
    x.quadraticCurveTo(.12, .76, .12, .65); x.bezierCurveTo(.13, .45, .2, .2, .24, 0); x.closePath(); x.fill();
    x.beginPath(); x.arc(.02, .895, .088, 0, 7); x.fill();
    x.beginPath(); x.moveTo(-.06, .985); x.quadraticCurveTo(.05, 1.01, .1, .93); x.quadraticCurveTo(.02, .97, -.07, .9); x.quadraticCurveTo(-.17, .7, -.19, .46); x.quadraticCurveTo(-.13, .7, -.06, .985); x.closePath(); x.fill();
  } },
  // the man of light: a plain standing outline, no face, no hair, no features
  light: { sh: [.01, .74], draw(x) {
    x.beginPath(); x.moveTo(-.18, 0); x.bezierCurveTo(-.21, .26, -.17, .52, -.13, .68); x.quadraticCurveTo(-.11, .79, -.03, .81); x.lineTo(.05, .81);
    x.quadraticCurveTo(.13, .77, .13, .66); x.bezierCurveTo(.15, .45, .21, .22, .21, 0); x.closePath(); x.fill();
    x.beginPath(); x.arc(.015, .905, .094, 0, 7); x.fill();
  } },
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
// glow: a figure made of light (emissive silhouette, casts no shadow); staff: a shepherd's crook in the hand; jar: a water jar in the hand
export function human(U, { h = .085, z = -.085, col = '#07101a', pose = 'stand', trans = .05, rim = .6, two = false, staff = false, jar = false, glow = 0, glowCol = '#fff4dc' } = {}) {
  const g = new THREE.Group(); g.position.z = z; const P = POSES[pose], W = h * 1.1, H_ = h * 1.12;
  const finish = { rim, rimPx: 4, under: .2, rimCol: `rgba(255,226,170,${rim})` };
  const lit = glow ? { glow, glowCol, glowRes: .5, shadow: false, recv: false } : {};
  const body = mk(U, { w: W, h: H_, y: H_ / 2 - h * .03, z: 0, col, trans, finish, ...lit, draw: x => { x.translate(0, -H_ / 2 + h * .03); x.scale(h, h); P.draw(x); },
    glowDraw: glow ? x => { x.fillStyle = '#fff'; x.translate(0, -H_ / 2 + h * .03); x.scale(h, h); P.draw(x); } : undefined });
  const aw = h * .078, al = h * .37;
  const armShape = x => { x.beginPath(); x.moveTo(-aw * .55, al / 2); x.lineTo(aw * .55, al / 2); x.lineTo(aw * .33, -al / 2); x.lineTo(-aw * .33, -al / 2); x.closePath(); x.fill(); x.beginPath(); x.arc(0, al / 2, aw * .55, 0, 7); x.fill(); x.beginPath(); x.ellipse(0, -al / 2, aw * .42, aw * .62, 0, 0, 7); x.fill(); };
  const mkArm = dz => mk(U, { w: aw * 1.6, h: al * 1.25, x: P.sh[0] * h, y: P.sh[1] * h - al / 2, ay: al / 2, z: dz, col, trans, shadow: false, recv: false, finish, ...lit,
    draw: armShape, glowDraw: glow ? x => { x.fillStyle = '#fff'; armShape(x); } : undefined });
  const arm = mkArm(.0005), arm2 = two ? mkArm(-.0005) : null;
  g.add(body, arm); if (arm2) g.add(arm2);
  let st = null, jr = null;
  if (staff) {   // kept vertical whatever the arm does; crook at the top, toward the face
    st = mk(U, { w: h * .2, h: h * 1.1, ay: -h * .14, z: 0, col, trans, shadow: false, recv: false, finish, draw: x => {
      const lw = h * .026; x.lineWidth = lw; x.lineCap = 'round';
      x.beginPath(); x.moveTo(0, -h * .53); x.lineTo(0, h * .45); x.arc(h * .042, h * .45, h * .042, Math.PI, 0, true); x.lineTo(h * .084, h * .41); x.stroke();
    } });
    st.position.set(0, -al, .0004); arm.add(st);
  }
  if (jar) {     // a water jar hanging from the hand, kept upright
    jr = mk(U, { w: h * .2, h: h * .26, ay: h * .1, z: 0, col, trans, shadow: false, recv: false, finish, draw: x => {
      x.beginPath(); x.ellipse(0, -h * .02, h * .075, h * .085, 0, 0, 7); x.fill(); x.fillRect(-h * .025, h * .04, h * .05, h * .06); x.fillRect(-h * .04, h * .095, h * .08, h * .015);
      x.lineWidth = h * .012; x.beginPath(); x.arc(h * .06, h * .04, h * .03, -1.4, 1.4); x.stroke();
    } });
    jr.position.set(0, -al, .0004); arm.add(jr);
  }
  return { g, body, arm, arm2, staff: st, jar: jr, set({ x = 0, y = 0, rot = 0, a = 0, a2, s = 1 }) { g.position.x = x; g.position.y = y; g.rotation.z = rot; g.scale.setScalar(s); arm.rotation.z = a; if (arm2) arm2.rotation.z = a2 ?? a * .97; if (st) st.rotation.z = -a - rot; if (jr) jr.rotation.z = -a - rot; } };
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

// Additive light (no paper): falloff from uv point c with radii r (uv units); a full disc by default, a streak with an off-centre c
export function glowMesh(w, h, col = '#ffe7a8', c = [.5, .5], r = [.5, .5], pw = 2.2) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.ShaderMaterial({
    uniforms: { col: { value: new THREE.Color(col) }, k: { value: 0 }, c: { value: new THREE.Vector2(...c) }, r: { value: new THREE.Vector2(...r) }, pw: { value: pw } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: 'varying vec2 vUv; uniform vec3 col; uniform float k, pw; uniform vec2 c, r; void main(){ vec2 d = (vUv - c) / r; float a = pow(max(0., 1. - length(d)), pw); gl_FragColor = vec4(col * a * k, 1.); }',
  }));
  m.renderOrder = 10; m.userData.set = k => { m.material.uniforms.k.value = k; }; return m;
}

// —— Jacob en cifras: the well, pebbles, the bag, the veil, tents, camels, the flock ——
// Top line of a mountain: base plus soft peaks [px, height, half-width]; fills everything below it
export function mountFill(x, { x0, x1, base, peaks, jit = .002, ph = 0 }) {
  x.beginPath(); x.moveTo(x0, -2);
  for (let u = x0; u <= x1 + .001; u += .001) {
    let y = base; for (const [px, hh, hw] of peaks) { const d = Math.abs(u - px) / hw; y = Math.max(y, base + hh * Math.max(0, 1 - d * d * (.6 + .4 * d))); }
    x.lineTo(u, y + jit * Math.sin(u * 97 + ph) + jit * .5 * Math.sin(u * 311 + ph * 2));
  }
  x.lineTo(x1, -2); x.closePath(); x.fill();
}

// The flock as one mass: woolly backs in a row, heads with ears above the line (no tiny loose sheep). Draw into a layer.
export function flockDraw(x, { x0, x1, y, s = .016, seed = 5 }) {
  const R = mulberry(seed), n = Math.round((x1 - x0) / (s * 1.05));
  for (let i = 0; i < n; i++) {
    const cx = x0 + (i + .5) * (x1 - x0) / n + (R() - .5) * s * .3, cy = y + (R() - .5) * s * .25, k = .85 + R() * .3;
    for (let j = 0; j < 5; j++) { x.beginPath(); x.ellipse(cx + (j - 2) * s * .2 * k, cy + s * .42 * k + Math.sin(j * 1.7) * s * .06, s * .26 * k, s * .3 * k, 0, 0, 7); x.fill(); }
    x.fillRect(cx - s * .55 * k, y - s * .2, s * 1.1 * k, s * .6 * k);
    if (R() < .7) {
      const dir = R() < .5 ? -1 : 1, hx = cx + dir * s * .62 * k, hy = cy + s * (.62 + R() * .2) * k;
      x.beginPath(); x.ellipse(hx, hy, s * .2 * k, s * .14 * k, dir * -.5, 0, 7); x.fill();
      x.beginPath(); x.ellipse(hx - dir * s * .1 * k, hy + s * .12 * k, s * .1 * k, s * .04 * k, dir * .6, 0, 7); x.fill();
      x.beginPath(); x.moveTo(hx - dir * s * .2 * k, hy - s * .1 * k); x.lineTo(hx - dir * s * .4 * k, hy - s * .3 * k); x.lineTo(hx - dir * s * .2 * k, hy - s * .3 * k); x.fill();
    }
  }
}

// The stone well of Haran seen from the front: a low round wall of stones (joints cut), a lip; origin at the centre of the lip top
export function well(U, { w = .1, z = -.064, col = '#0d0b16', depth = .4, trans = .03, rim = .55 } = {}) {
  const R = mulberry(31), hh = depth;
  return mk(U, { w: w * 1.08, h: hh + .01, y: -hh / 2 + .004, z, col, trans, ppm: 2600, finish: { rim, rimPx: 4, under: .3 }, draw: x => {
    x.translate(0, hh / 2 - .004);
    x.beginPath(); x.moveTo(-w / 2, -hh); x.lineTo(-w / 2, -.004); x.quadraticCurveTo(-w / 2, 0, -w / 2 + .004, 0); x.lineTo(w / 2 - .004, 0); x.quadraticCurveTo(w / 2, 0, w / 2, -.004); x.lineTo(w / 2, -hh); x.closePath(); x.fill();
    cut(x, () => {
      x.fillRect(-w / 2, -.0095, w, .0009);
      for (let r = 0; r < 4; r++) { const y0 = -.0095 - r * .011, off = (r % 2) * .009; for (let u = -w / 2 + off; u < w / 2; u += .016 + R() * .006) x.fillRect(u, y0 - .011, .0007, .011); x.fillRect(-w / 2, y0 - .011, w, .0007); }
    });
  } });
}

// One pebble (a little cut disc of pale stone); origin at its bottom
export function pebble(U, { r = .0032, z = -.06, col = '#cfc6b2', seed = 1 } = {}) {
  const R = mulberry(seed), rx = r * (1 + R() * .3), ry = r * (.75 + R() * .2), a = (R() - .5) * .5;
  return mk(U, { w: r * 3, h: r * 3, y: ry, z, col, trans: .1, shadow: false, recv: false, ppm: 12000, finish: { rim: .7, rimPx: 3, under: .4, underPx: 3 }, draw: x => { x.translate(0, -ry); x.beginPath(); x.ellipse(0, ry, rx, ry, a, 0, 7); x.fill(); } });
}

// A small cloth bag tied at the neck; origin at the bottom
export function bag(U, { s = .02, z = -.058, col = '#7a6a52' } = {}) {
  return mk(U, { w: s * 1.4, h: s * 1.4, y: s * .6, z, col, trans: .12, shadow: false, recv: false, ppm: 9000, finish: { rim: .6, rimPx: 3, under: .3 }, draw: x => {
    x.translate(0, -s * .6);
    x.beginPath(); x.moveTo(-s * .12, s * .82); x.quadraticCurveTo(-s * .5, s * .6, -s * .5, s * .28); x.quadraticCurveTo(-s * .5, 0, 0, 0); x.quadraticCurveTo(s * .5, 0, s * .5, s * .28); x.quadraticCurveTo(s * .5, s * .6, s * .12, s * .82); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(-s * .16, s * .82); x.lineTo(-s * .26, s * 1.02); x.lineTo(0, s * .9); x.lineTo(s * .26, s * 1.02); x.lineTo(s * .16, s * .82); x.closePath(); x.fill();
    cut(x, () => { x.fillRect(-s * .14, s * .79, s * .28, s * .025); });
  } });
}

// A soft semi-transparent veil (gauze) — not paper: the figure under it shows as a pale shadow. A drape over the head that widens and fades
// toward the bottom. Origin at the top of the head; w wide, h long.
export function veil(w, h, col = '#d6cde6', op = .5) {
  const c = document.createElement('canvas'); c.width = 192; c.height = Math.round(192 * h / w); const x = c.getContext('2d'), W = c.width, H = c.height;
  x.beginPath(); x.moveTo(W * .5, 0); x.bezierCurveTo(W * .86, 0, W * .9, H * .2, W * .92, H * .45); x.quadraticCurveTo(W * .98, H * .8, W, H); x.lineTo(0, H); x.quadraticCurveTo(W * .02, H * .8, W * .08, H * .45); x.bezierCurveTo(W * .1, H * .2, W * .14, 0, W * .5, 0); x.closePath();
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.55, 'rgba(255,255,255,.85)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fill();
  x.globalCompositeOperation = 'destination-out'; const R = mulberry(4);
  for (let i = 0; i < 40; i++) { x.strokeStyle = `rgba(0,0,0,${.06 + R() * .1})`; x.lineWidth = 1 + R() * 2; const px = W * (.1 + R() * .8); x.beginPath(); x.moveTo(W * .5 + (px - W * .5) * .3, H * .08); x.quadraticCurveTo(px, H * .5, px + (px - W * .5) * .2, H); x.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const geo = new THREE.PlaneGeometry(w, h); geo.translate(0, -h / 2, 0);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: op, depthWrite: false, color: new THREE.Color(col) }));
  m.renderOrder = 5; m.userData.op = op; return m;
}

// A tent of goat hair: a low wide ridge with a door; drawn into a layer at (cx, base); w wide, hh tall; door cut when `door`
export function tentDraw(x, { cx, base, w, hh, door = 0, dw = .3 }) {
  x.beginPath(); x.moveTo(cx - w / 2, base); x.lineTo(cx - w * .46, base + hh * .62); x.quadraticCurveTo(cx - w * .3, base + hh * .86, cx - w * .14, base + hh);
  x.quadraticCurveTo(cx, base + hh * .9, cx + w * .14, base + hh); x.quadraticCurveTo(cx + w * .3, base + hh * .86, cx + w * .46, base + hh * .62); x.lineTo(cx + w / 2, base); x.closePath(); x.fill();
  for (const s of [-1, 1]) { x.lineWidth = hh * .012; x.beginPath(); x.moveTo(cx + s * w * .14, base + hh); x.lineTo(cx + s * w * .14, base + hh * 1.12); x.stroke(); }
  if (door) cut(x, () => { const d = w * dw * door; x.beginPath(); x.moveTo(cx - d / 2, base); x.lineTo(cx - d * .38, base + hh * .7); x.lineTo(cx + d * .38, base + hh * .7); x.lineTo(cx + d / 2, base); x.closePath(); x.fill(); });
}

// A camel, side view facing +x, drawn into a layer; origin at the feet; hh = height at the hump
export function camelDraw(x, px, py, hh, ph = 0, load = true) {
  const s = hh;
  x.save(); x.translate(px, py); x.scale(s, s);
  x.beginPath(); x.moveTo(-.42, .58); x.quadraticCurveTo(-.4, .78, -.18, .86); x.quadraticCurveTo(-.02, 1.02, .14, .86); x.quadraticCurveTo(.3, .8, .36, .66);
  x.quadraticCurveTo(.46, .7, .5, .9); x.quadraticCurveTo(.52, 1.02, .62, 1.0); x.lineTo(.7, .97); x.lineTo(.68, .92); x.lineTo(.6, .92); x.quadraticCurveTo(.56, .74, .44, .52); x.quadraticCurveTo(.3, .44, .3, .5); x.lineTo(-.36, .48); x.closePath(); x.fill();
  const legs = [[-.32, 0], [-.22, Math.PI], [.18, Math.PI], [.28, 0]];
  x.lineWidth = .055; x.lineCap = 'round';
  for (const [lx, p] of legs) { const sw = Math.sin(ph + p) * .07; x.beginPath(); x.moveTo(lx, .52); x.lineTo(lx + sw * .5, .26); x.lineTo(lx + sw, .01); x.stroke(); }
  x.lineWidth = .03; x.beginPath(); x.moveTo(-.42, .62); x.quadraticCurveTo(-.5, .5, -.48, .4); x.stroke();
  if (load) { x.beginPath(); x.roundRect(-.2, .82, .3, .2, .04); x.fill(); x.beginPath(); x.ellipse(-.24, .7, .07, .12, 0, 0, 7); x.fill(); x.beginPath(); x.ellipse(.12, .7, .07, .12, 0, 0, 7); x.fill(); }
  x.restore();
}
