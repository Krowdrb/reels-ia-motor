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
  kneel: { sh: [.02, .58], draw(x) {
    x.beginPath(); x.moveTo(-.3, 0); x.bezierCurveTo(-.3, .13, -.24, .32, -.15, .5); x.quadraticCurveTo(-.11, .62, -.02, .65); x.lineTo(.06, .65); x.quadraticCurveTo(.13, .61, .13, .5); x.bezierCurveTo(.13, .35, .2, .2, .26, 0); x.closePath(); x.fill();
    x.beginPath(); x.arc(.04, .745, .092, 0, 7); x.fill();
    x.beginPath(); x.moveTo(.075, .73); x.lineTo(.16, .62); x.lineTo(.05, .65); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(-.07, .82); x.quadraticCurveTo(-.13, .74, -.12, .58); x.lineTo(0, .7); x.closePath(); x.fill();
  } },
  // kneeling, bowed, the forearm drawn across the face (Éx 3:6): the arm is part of the silhouette
  cover: { sh: [.02, .58], arm: false, draw(x) {
    x.beginPath(); x.moveTo(-.3, 0); x.bezierCurveTo(-.3, .13, -.24, .32, -.14, .5); x.quadraticCurveTo(-.08, .63, .02, .65); x.lineTo(.08, .64); x.quadraticCurveTo(.15, .59, .14, .48); x.bezierCurveTo(.13, .35, .2, .2, .26, 0); x.closePath(); x.fill();
    x.beginPath(); x.arc(.075, .725, .09, 0, 7); x.fill();
    x.beginPath(); x.moveTo(-.04, .8); x.quadraticCurveTo(-.11, .72, -.09, .56); x.lineTo(.03, .68); x.closePath(); x.fill();
    x.save(); x.lineWidth = .085; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); x.moveTo(.0, .58); x.lineTo(.2, .58); x.lineTo(.16, .79); x.stroke(); x.restore();
    x.beginPath(); x.ellipse(.155, .805, .045, .055, .2, 0, 7); x.fill();
  } },
};
export function human(U, { h = .085, z = -.085, col = '#07101a', pose = 'stand', trans = .05, rim = .6, two = false, staff = false } = {}) {
  const g = new THREE.Group(); g.position.z = z; const P = POSES[pose], W = h * 1.1, H_ = h * 1.12;
  const finish = { rim, rimPx: 4, under: .2, rimCol: `rgba(255,226,170,${rim})` };
  const body = mk(U, { w: W, h: H_, y: H_ / 2 - h * .03, z: 0, col, trans, finish, draw: x => { x.translate(0, -H_ / 2 + h * .03); x.scale(h, h); P.draw(x); } });
  const aw = h * .078, al = h * .37;
  const mkArm = dz => mk(U, { w: aw * 1.6, h: al * 1.25, x: P.sh[0] * h, y: P.sh[1] * h - al / 2, ay: al / 2, z: dz, col, trans, shadow: false, recv: false, finish,
    draw: x => { x.beginPath(); x.moveTo(-aw * .55, al / 2); x.lineTo(aw * .55, al / 2); x.lineTo(aw * .33, -al / 2); x.lineTo(-aw * .33, -al / 2); x.closePath(); x.fill(); x.beginPath(); x.arc(0, al / 2, aw * .55, 0, 7); x.fill(); x.beginPath(); x.ellipse(0, -al / 2, aw * .42, aw * .62, 0, 0, 7); x.fill(); } });
  const arm = mkArm(.0005), arm2 = two ? mkArm(-.0005) : null;
  g.add(body, arm); if (arm2) g.add(arm2);
  if (P.arm === false) { arm.visible = false; if (arm2) arm2.visible = false; }
  // the shepherd's staff (cayado): held in the hand, kept vertical whatever the arm does; crook at the top, toward the face
  let st = null;
  if (staff) {
    st = mk(U, { w: h * .2, h: h * 1.1, ay: -h * .14, z: 0, col, trans, shadow: false, recv: false, finish, draw: x => {
      const lw = h * .026; x.lineWidth = lw; x.lineCap = 'round';
      x.beginPath(); x.moveTo(0, -h * .53); x.lineTo(0, h * .45); x.arc(h * .042, h * .45, h * .042, Math.PI, 0, true); x.lineTo(h * .084, h * .41); x.stroke();
    } });
    st.position.set(0, -al, .0004); arm.add(st);
  }
  return { g, body, arm, staff: st, set({ x = 0, y = 0, rot = 0, a = 0, s = 1 }) { g.position.x = x; g.position.y = y; g.rotation.z = rot; g.scale.setScalar(s); arm.rotation.z = a; if (arm2) arm2.rotation.z = a * .97; if (st) st.rotation.z = -a - rot; } };
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

// Additive light (no paper): falloff from uv point c with radii r (uv units); a full disc by default, a streak or a beam with an off-centre c
export function glowMesh(w, h, col = '#ffe7a8', c = [.5, .5], r = [.5, .5], pw = 2.2) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.ShaderMaterial({
    uniforms: { col: { value: new THREE.Color(col) }, k: { value: 0 }, c: { value: new THREE.Vector2(...c) }, r: { value: new THREE.Vector2(...r) }, pw: { value: pw } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: 'varying vec2 vUv; uniform vec3 col; uniform float k, pw; uniform vec2 c, r; void main(){ vec2 d = (vUv - c) / r; float a = pow(max(0., 1. - length(d)), pw); gl_FragColor = vec4(col * a * k, 1.); }',
  }));
  m.renderOrder = 10; m.userData.set = k => { m.material.uniforms.k.value = k; }; return m;
}

// —— Moisés en cifras: the bush, columns, the flock, palms, sandals ——
// Top line of a mountain: base plus soft peaks [px, height, half-width]; fills everything below it
export function mountFill(x, { x0, x1, base, peaks, jit = .002, ph = 0 }) {
  x.beginPath(); x.moveTo(x0, -2);
  for (let u = x0; u <= x1 + .001; u += .001) {
    let y = base; for (const [px, hh, hw] of peaks) { const d = Math.abs(u - px) / hw; y = Math.max(y, base + hh * Math.max(0, 1 - d * d * (.6 + .4 * d))); }
    x.lineTo(u, y + jit * Math.sin(u * 97 + ph) + jit * .5 * Math.sin(u * 311 + ph * 2));
  }
  x.lineTo(x1, -2); x.closePath(); x.fill();
}

// The burning bush: black branches that never change, white-gold light behind them that grows and flickers. Origin at the base. God is only light.
export function bush(U, { s = .03, z = -.092, col = '#06050b' } = {}) {
  const g = new THREE.Group(); g.position.z = z;
  const flameShape = (x, k = 1) => { for (const [cx, cy, rx, ry] of [[0, .5, .42, .45], [-.22, .38, .26, .3], [.24, .4, .25, .32], [-.05, .78, .2, .3], [.12, .7, .16, .28], [-.2, .62, .14, .22]]) { x.beginPath(); x.ellipse(cx * s, cy * s, rx * s * k, ry * s * k, 0, 0, 7); x.fill(); } };
  const flame = mk(U, { w: s * 1.3, h: s * 1.3, y: s * .55, z: -.0015, col: '#fff3dc', trans: .2, shadow: false, recv: false, ppm: 4000, finish: { rim: 0, under: 0, grain: false },
    draw: x => { x.translate(0, -s * .55); flameShape(x); },
    glowDraw: x => { x.translate(0, -s * .55); const gr = x.createRadialGradient(0, s * .5, 0, 0, s * .5, s * .6); gr.addColorStop(0, '#ffffff'); gr.addColorStop(.6, '#fff2d0'); gr.addColorStop(1, '#ffe7b0'); x.fillStyle = gr; flameShape(x); }, glow: 3, glowCol: '#fff6e0', glowRes: .6 });
  const R = mulberry(23);
  const branch = (x, px, py, a, l, w, d) => {
    const ex = px + Math.cos(a) * l, ey = py + Math.sin(a) * l;
    x.lineWidth = w; x.lineCap = 'round'; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a + .3) * l * .5, py + Math.sin(a + .3) * l * .5, ex, ey); x.stroke();
    if (d > 0) { branch(x, ex, ey, a + .35 + R() * .3, l * (.62 + R() * .15), w * .68, d - 1); branch(x, ex, ey, a - .35 - R() * .3, l * (.62 + R() * .15), w * .68, d - 1); if (d > 2 && R() < .6) branch(x, ex, ey, a + (R() - .5) * .3, l * .55, w * .6, d - 2); }
    else { x.beginPath(); x.ellipse(ex, ey, w * 1.6, w * .9, a, 0, 7); x.fill(); }
  };
  const branches = mk(U, { w: s * 1.5, h: s * 1.4, y: s * .6, z: 0, col, trans: .03, ppm: 6000, finish: { rim: .55, rimPx: 3, rimCol: 'rgba(255,240,200,.6)' }, draw: x => {
    x.translate(0, -s * .6);
    for (const [px, a, l] of [[-.03, 1.95, .34], [.0, 1.62, .4], [.03, 1.2, .34], [-.06, 2.35, .24], [.06, .8, .24]]) branch(x, px * s, 0, a, l * s, s * .055, 4);
    x.beginPath(); x.ellipse(0, 0, s * .16, s * .035, 0, 0, 7); x.fill();
  } });
  const halo = glowMesh(s * 8, s * 8, '#ffe7a8'); halo.position.set(0, s * .5, -.003);
  g.add(flame, branches, halo);
  let k0 = -1;
  return { g, flame, branches, halo,
    // k: 0 dark .. 1 full .. >1 blazing; f: flicker multiplier
    set(k, f = 1) {
      const kk = k * f; flame.visible = k > .01; flame.material.userData.u.uGlowLit.value = kk;
      if (Math.abs(k - k0) > .002) { tint(flame, '#fff3dc', Math.min(1, .15 + k)); k0 = k; }
      flame.scale.setScalar(.75 + .25 * Math.min(1.3, k) * f); halo.userData.set(.55 * kk);
    } };
}

// A colonnade with papyrus capitals and a lintel. xs: column centres; from y0 (floor) to y1 (underside of the lintel)
export function colonnade(U, { xs, y0, y1, cw = .012, z, col, trans = .12, lintel = .014, w = 1, ppm = 2600, finish = { rim: .5 } }) {
  const cy = (y0 + y1) / 2 + lintel / 2, hh = y1 - y0 + lintel + .004;
  return mk(U, { w, h: hh, y: cy, z, col, trans, ppm, finish, draw: x => {
    x.translate(0, -cy);
    for (const cx of xs) {
      const capH = cw * 1.9, top = y1, sh0 = y0 + cw * .5;
      x.fillRect(cx - cw * .75, y0, cw * 1.5, cw * .5);                                    // base
      x.beginPath(); x.moveTo(cx - cw * .5, sh0); x.lineTo(cx - cw * .42, top - capH); x.lineTo(cx + cw * .42, top - capH); x.lineTo(cx + cw * .5, sh0); x.closePath(); x.fill();   // shaft
      x.fillRect(cx - cw * .5, top - capH - cw * .25, cw, cw * .14); x.fillRect(cx - cw * .5, top - capH - cw * .5, cw, cw * .14);   // bands
      x.beginPath(); x.moveTo(cx - cw * .44, top - capH); x.bezierCurveTo(cx - cw * .5, top - capH * .5, cx - cw * 1.15, top - capH * .25, cx - cw * 1.05, top);   // papyrus bell
      x.lineTo(cx + cw * 1.05, top); x.bezierCurveTo(cx + cw * 1.15, top - capH * .25, cx + cw * .5, top - capH * .5, cx + cw * .44, top - capH); x.closePath(); x.fill();
    }
    if (lintel) x.fillRect(-w / 2, y1, w, lintel);
  } });
}

// The flock as one mass: woolly backs in a row, heads with ears above the line (no tiny loose sheep). Draw into a layer.
export function flockDraw(x, { x0, x1, y, s = .016, seed = 5 }) {
  const R = mulberry(seed), n = Math.round((x1 - x0) / (s * 1.05));
  for (let i = 0; i < n; i++) {
    const cx = x0 + (i + .5) * (x1 - x0) / n + (R() - .5) * s * .3, cy = y + (R() - .5) * s * .25, k = .85 + R() * .3;
    for (let j = 0; j < 5; j++) { x.beginPath(); x.ellipse(cx + (j - 2) * s * .2 * k, cy + s * .42 * k + Math.sin(j * 1.7) * s * .06, s * .26 * k, s * .3 * k, 0, 0, 7); x.fill(); }
    x.fillRect(cx - s * .55 * k, y - s * .2, s * 1.1 * k, s * .6 * k);
    if (R() < .7) {   // head + ear, facing left or right
      const dir = R() < .5 ? -1 : 1, hx = cx + dir * s * .62 * k, hy = cy + s * (.62 + R() * .2) * k;
      x.beginPath(); x.ellipse(hx, hy, s * .2 * k, s * .14 * k, dir * -.5, 0, 7); x.fill();
      x.beginPath(); x.ellipse(hx - dir * s * .1 * k, hy + s * .12 * k, s * .1 * k, s * .04 * k, dir * .6, 0, 7); x.fill();
      x.beginPath(); x.moveTo(hx - dir * s * .2 * k, hy - s * .1 * k); x.lineTo(hx - dir * s * .4 * k, hy - s * .3 * k); x.lineTo(hx - dir * s * .2 * k, hy - s * .3 * k); x.fill();
    }
  }
}

// A date palm (Jericho), drawn into a layer: trunk from (px, py), height hh
export function palmDraw(x, px, py, hh, lean = .1) {
  const tx = px + lean * hh, ty = py + hh;
  x.lineWidth = hh * .05; x.lineCap = 'round'; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + lean * hh * .2, py + hh * .6, tx, ty); x.stroke();
  for (let i = 0; i < 9; i++) {
    const a = Math.PI * (.08 + i * .105), l = hh * (.42 + .08 * Math.sin(i * 2.3));
    const ex = tx + Math.cos(a) * l, ey = ty + Math.sin(a) * l * .55 - l * .28 * Math.abs(Math.cos(a));
    x.beginPath(); x.moveTo(tx, ty); x.quadraticCurveTo(tx + Math.cos(a) * l * .5, ty + Math.sin(a) * l * .55 + l * .12, ex, ey);
    x.quadraticCurveTo(tx + Math.cos(a) * l * .45, ty + Math.sin(a) * l * .4 + l * .05, tx, ty); x.fill();
  }
}

// Two sandals, side by side, soles seen from above at a slant. Origin between them on the ground; L = sole length
export function sandals(U, { L = .016, z = -.06, col = '#5a4030' } = {}) {
  return mk(U, { w: L * 2.6, h: L * 1.1, y: L * .2, z, col, trans: .15, ppm: 7000, finish: { rim: .7, rimPx: 4, rimCol: 'rgba(255,236,200,.7)' }, draw: x => {
    for (const [cx, r] of [[-L * .6, -.08], [L * .62, .12]]) {
      x.save(); x.translate(cx, -L * .15); x.rotate(r);
      x.beginPath(); x.ellipse(0, 0, L * .5, L * .16, 0, 0, 7); x.fill();
      x.lineWidth = L * .05; x.beginPath(); x.ellipse(L * .1, L * .12, L * .13, L * .12, 0, Math.PI, 0, true); x.stroke();
      x.beginPath(); x.moveTo(-L * .25, L * .02); x.quadraticCurveTo(-L * .1, L * .22, L * .05, L * .02); x.stroke();
      x.restore();
    }
  } });
}
