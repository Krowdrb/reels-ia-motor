// The twelve shots of "La mujer samaritana" (Juan 4). Each: { S, update(t), post(), grade() }; t in film seconds.
// Jesus and the woman are quiet silhouettes; God is only ever light (the noon sun, then the light that rises from the well).
// CPU budget: at most 9 layers per shot, no particles, one burst() in the whole film (S10), maxCoc <= 8, bloom <= .45.
import * as THREE from 'three';
import { skyPanel, moon, setMoon, text, burst } from './paper.js';
import { stage, aim } from './stage.js';
import { mulberry, seg, ss, eio, eo, lerp, clamp, TAU } from './lib.js';
import { mk, cut, tint, clawd, human, cantaro, crowd } from './actors.js';

const blo = (s = .3, th = 1.1) => ({ strength: Math.min(s, .45), radius: .55, threshold: th });
const lay = (S, o) => S.add(mk(S.U, o));
const col3 = c => new THREE.Color(c);
const mixHex = (a, b, k) => '#' + col3(a).lerp(col3(b), clamp(k)).getHexString();
const setL = (S, x, y, r, lit, c) => { S.U.uLight.value.x = x; S.U.uLight.value.y = y; S.U.uLightR.value = r; S.U.uLit.value = lit; if (c) S.U.uLightCol.value.copy(c); };
const bob = (t, f, a, p = 0) => Math.sin(t * f + p) * a;
const blinkAt = (t, per = 3.3, ph = 0) => 1 - .9 * Math.max(0, 1 - Math.abs(((t + ph) % per) - .1) / .1);
const fsOf = (S, z) => S.cam.position.z - z;

// —— palettes: white noon → warm → gold. Never orange or terracotta behind Clawd; nothing blue next to the gold ——
export const PAL = {
  noon: { sky: [[0, '#e4dcc6'], [.5, '#f3eee0'], [1, '#fbf8ef']], far: '#d8cdb2', mid: '#a39a82', road: '#5a5040', front: '#16130e', fig: '#15110c', light: '#fffaf0' },
  warm: { sky: [[0, '#e8d6ae'], [.5, '#f3e4c0'], [1, '#f9efd6']], far: '#e0cfa4', mid: '#b2a078', road: '#5a4834', front: '#1d150d', fig: '#18110a', light: '#ffeec8' },
  gold: { sky: [[0, '#dcb876'], [.5, '#f0d69c'], [1, '#f8e7bd']], far: '#e6c27a', mid: '#b98f4e', road: '#5a3e1e', front: '#2a1a0e', fig: '#1c1108', light: '#ffd98a' },
};
const noonStage = (o = {}) => stage({ light: [0, .12, -.1], lightR: .32, lightCol: PAL.noon.light, key: 2.1, keyCol: '#fffaf2', keyPos: [0, .52, .08], keyTarget: [0, -.06, -.08], keyAngle: .62, amb: .6, ambCol: '#ddd6c6', floor: .55, shadowR: 3, ...o });
const goldStage = (o = {}) => stage({ light: [0, .08, -.1], lightR: .3, lightCol: PAL.gold.light, key: 1.8, keyCol: '#ffe6c0', keyPos: [-.06, .42, .2], keyTarget: [0, -.05, -.08], amb: .5, ambCol: '#cfae86', floor: .5, shadowR: 5, ...o });
const LIFT = [.012, .007, 0];   // warm shadows (the default lift is bluish, which turns the dark paper navy)
const NOON_G = { vig: .58, sat: .8, contrast: .2, gain: [1.02, 1, .96], lift: LIFT };
const GOLD_G = { vig: .42, sat: 1.04, contrast: .12, gain: [1.04, 1, .93], lift: LIFT };

// A sheet of land: o.top(u) gives the world-space top line; everything below is filled down to o.bottom. Drawn in world coordinates.
function land(S, o) {
  const y1 = o.ymax ?? .14, y0 = o.bottom ?? -.42, cy = (y1 + y0) / 2, w = o.w ?? .9, cx = o.x || 0;
  const tr = x => x.translate(-cx, -cy);
  return lay(S, { w, h: y1 - y0, x: cx, y: cy, z: o.z, col: o.col, trans: o.trans, ppm: o.ppm ?? 2000, shadow: o.shadow, recv: o.recv, finish: o.finish ?? { rim: .45 }, draw: x => {
    tr(x); x.beginPath(); x.moveTo(cx - w / 2, y0); for (let u = cx - w / 2; u <= cx + w / 2 + 1e-6; u += .0015) x.lineTo(u, o.top(u)); x.lineTo(cx + w / 2, y0); x.closePath(); x.fill(); o.more?.(x);
  }, glowDraw: o.glowDraw ? x => { tr(x); o.glowDraw(x); } : undefined, glow: o.glow, glowCol: o.glowCol, glowRes: o.glowRes });
}

// The brocal (stone well-head) seen from the front: courses of stone on the silhouette edge, a lip on top. Fills on the current canvas.
export const BTOP = -.028, GROUND = -.05;
function brocal(x, x0, x1, top = BTOP, base = GROUND - .02) {
  const R = mulberry(17); x.beginPath(); x.moveTo(x0 + .002, base);
  const rows = 4, hh = (top - .004 - base) / rows;
  for (let r = 0; r < rows; r++) { const y = base + r * hh; x.lineTo(x0 + .002 - (r % 2) * .0014, y + hh * .5); x.lineTo(x0 + .002 - (r % 2) * .0014, y + hh); }
  x.lineTo(x0 - .003, top - .004); x.quadraticCurveTo(x0 - .004, top, x0, top + .0006);
  for (let u = x0; u <= x1; u += .006) x.lineTo(u, top + .0006 + (R() - .5) * .0012);
  x.lineTo(x1, top + .0006); x.quadraticCurveTo(x1 + .004, top, x1 + .003, top - .004);
  for (let r = rows - 1; r >= 0; r--) { const y = base + r * hh; x.lineTo(x1 - .002 + (r % 2) * .0014, y + hh); x.lineTo(x1 - .002 + (r % 2) * .0014, y + hh * .5); }
  x.lineTo(x1 - .002, base); x.closePath(); x.fill();
}

// —— the well at noon (or warm, or gold): sky, far hills (optionally the mount), middle hills, the road ground, the dark front with the brocal ——
// o: pal, mount (x of Gerizim's peak), road, mid, bx: [x0, x1] of the brocal, sep (brocal on its own sheet at o.bz)
export function well(S, o = {}) {
  const P = o.pal || PAL.noon, bx = o.bx || [-.058, .012];
  const sky = skyPanel({ w: 1.4, h: 1.6, y: .2, z: -.16, stops: P.sky }); S.add(sky);
  const mx = o.mount;
  const far = land(S, { z: -.135, col: P.far, trans: .78, ppm: 1700, ymax: .16, finish: { rim: .35, under: .15 }, top: u => .02 + .007 * Math.sin(u * 17 + 1) + .003 * Math.sin(u * 51) + (mx !== undefined ? .062 * Math.exp(-(((u - mx) / .05) ** 2)) + .012 * Math.exp(-(((u - mx - .045) / .03) ** 2)) : 0) });
  const mid = o.mid === false ? null : land(S, { z: -.112, col: P.mid, trans: .42, ppm: 1800, top: u => -.008 + .006 * Math.sin(u * 23 + 2) + .0025 * Math.sin(u * 71 + 1) });
  const road = o.road === false ? null : land(S, { z: -.092, col: P.road, trans: .12, ppm: 2000, finish: { rim: .5 }, top: u => -.033 + .003 * Math.sin(u * 31 + .5) + .004 * Math.exp(-(((u + .14) / .08) ** 2)) });
  const front = land(S, { z: -.04, col: P.front, trans: .03, ppm: 2600, finish: { rim: .55, rimPx: 4, under: .3 }, top: u => GROUND + .0025 * Math.sin(u * 40 + 1.3) + .0015 * Math.sin(u * 97), more: o.sep ? undefined : x => brocal(x, ...bx) });
  const bro = o.sep ? lay(S, { w: .12, h: .08, x: (bx[0] + bx[1]) / 2, y: -.06, z: o.bz ?? -.06, col: P.front, trans: .04, ppm: 4200, finish: { rim: .6, rimPx: 4, under: .3 }, draw: x => { x.translate(-(bx[0] + bx[1]) / 2, .06); brocal(x, ...bx, BTOP, -.1); } }) : null;
  const layers = { far, mid, road, front, bro };
  // k: 0 = palette A, 1 = palette B (tints the land; the sky panel is multiplied by a warm colour)
  const paint = (A, B, k, skyTint = '#ffffff') => {
    for (const n of ['far', 'mid', 'road', 'front']) if (layers[n]) tint(layers[n], mixHex(A[n], B[n], k));
    if (bro) tint(bro, mixHex(A.front, B.front, k));
    sky.material.color.set(mixHex('#ffffff', skyTint, k));
  };
  return { sky, ...layers, paint, P };
}

// —— the shaft of the well in cross-section: sky with painted hills, the cut ground with the mouth, three stone courses (bottom to top), the deep back with the water ——
export const MOUTH = .022, WATER = -.082;
export function shaft(S, o = {}) {
  const P = o.pal || PAL.noon;
  const sky = skyPanel({ w: 1.2, h: 1.2, y: .25, z: -.16, stops: P.sky, extra: x => {
    x.fillStyle = P.far; x.beginPath(); x.moveTo(-.6, -.6); for (let u = -.6; u <= .6; u += .003) x.lineTo(u, -.228 + .008 * Math.sin(u * 14 + 1) + .004 * Math.sin(u * 41)); x.lineTo(.6, -.6); x.lineTo(-.6, -.6); x.closePath(); x.fill();
  } }); S.add(sky);
  const back = lay(S, { w: .08, h: .14, y: -.05, z: -.1, col: o.water || '#0d0d0c', trans: .5, ppm: 4000, shadow: false, finish: { rim: 0, under: 0 }, draw: x => { x.fillRect(-.04, -.07, .08, .14); },
    glowDraw: x => { x.translate(0, .05); x.strokeStyle = '#fff'; x.lineWidth = .0012; for (const [r, a] of [[.006, 1], [.012, .7], [.018, .4]]) { x.globalAlpha = a; x.beginPath(); x.ellipse(0, WATER - .006, r, r * .18, 0, 0, TAU); x.stroke(); } x.globalAlpha = 1; x.fillStyle = '#fff'; x.fillRect(-MOUTH, WATER - .0025, MOUTH * 2, .0012); },
    glow: 2.2, glowCol: '#ffe0a0', glowRes: .6 });
  back.material.userData.u.uGlowLit.value = 0;
  // three courses of stone, from the water (deepest, darkest) up to the mouth
  const COLS = o.rings || ['#18150f', '#211d17', '#2b261f'];
  const rings = [0, 1, 2].map(i => {
    const y0 = WATER + .004 + i * (-WATER / 3), y1 = y0 + (-WATER / 3) + .003, cy = (y0 + y1) / 2;
    return lay(S, { w: .07, h: y1 - y0 + .01, y: cy, z: -.085 + i * .014, col: COLS[i], trans: .05, ppm: 5200, finish: { rim: .5, rimPx: 3, under: .4, underPx: 4 }, draw: x => {
      x.translate(0, -cy); const R = mulberry(31 + i), ch = (y1 - y0) / 3;
      for (let r = 0; r < 3; r++) { let u = -.035 + (r % 2) * .006; while (u < .035) { const w = .009 + R() * .006; x.beginPath(); x.roundRect(u + .0006, y0 + r * ch + .0005, w - .0012, ch - .001, .0012); x.fill(); u += w; } }
    } });
  });
  // the cut ground: surface at y = 0, the mouth with a low stone parapet, the shaft cut down to the water
  const ground = lay(S, { w: .8, h: .5, y: -.24, z: -.03, col: o.ground || '#3a342b', trans: .04, ppm: 2200, finish: { rim: .55, rimPx: 4, under: .3 }, draw: x => {
    x.translate(0, .24);
    x.beginPath(); x.moveTo(-.4, -.49); for (let u = -.4; u <= .4; u += .002) x.lineTo(u, .0015 * Math.sin(u * 37 + 1) + .001 * Math.sin(u * 91)); x.lineTo(.4, -.49); x.closePath(); x.fill();
    for (const s of [-1, 1]) { x.beginPath(); x.roundRect(s > 0 ? MOUTH - .001 : -MOUTH - .013, -.002, .014, .016, [.003, .003, 0, 0]); x.fill(); }
    cut(x, () => { x.beginPath(); x.moveTo(-MOUTH, .02); x.lineTo(-MOUTH, WATER - .01); x.quadraticCurveTo(-MOUTH, WATER - .016, -MOUTH + .006, WATER - .016); x.lineTo(MOUTH - .006, WATER - .016); x.quadraticCurveTo(MOUTH, WATER - .016, MOUTH, WATER - .01); x.lineTo(MOUTH, .02); x.closePath(); x.fill(); });
  } });
  const paint = (k, skyTint = '#ffffff') => { sky.material.color.set(mixHex('#ffffff', skyTint, k)); };
  return { sky, back, rings, ground, paint };
}

// the paper title strip: dark card with the letters cut out, so the white noon sky shows through them
function titleStrip(S) {
  return lay(S, { w: .124, h: .074, z: -.03, col: '#2a1d12', trans: .05, shadow: false, recv: false, ppm: 9000, finish: { rim: .35, under: .25 }, draw: x => {
    x.beginPath(); x.roundRect(-.06, -.035, .12, .07, .002); x.fill();
    cut(x, () => {
      text(x, 'LA MUJER', 0, .0195, .0112, 'Cinzel', { weight: 800, fill: '#000' });
      text(x, 'SAMARITANA', 0, .0035, .0142, 'Cinzel', { weight: 800, fill: '#000' });
      x.fillRect(-.022, -.0085, .044, .0007);
      text(x, 'Juan 4:1–42', 0, -.0205, .0105, 'Playfair', { weight: 'italic 600', fill: '#000' });
    });
  } });
}
function placeTitle(S, title, t, t0, t1) {
  const reveal = ss(seg(t, t0, t0 + .55)) * (1 - ss(seg(t, t1 - .4, t1)));
  const cz = S.cam.position.z + .03, ts = cz / .55;
  title.scale.setScalar(ts); title.position.x = S.cam.position.x; title.position.y = S.cam.position.y + .2309 * cz * .6;
  title.material.userData.u.uClip.value.set(title.position.x, title.position.y, .09 * reveal * ts, 0); title.visible = reveal > .002;
}

// —— the cast ——
const JESUS = (S, P, o = {}) => { const J = human(S.U, { h: .086, z: -.066, pose: 'sit', col: P.fig, rim: .7, ...o }); S.scene.add(J.g); return J; };
const WOMAN = (S, P, o = {}) => { const W = human(S.U, { h: .088, z: -.07, pose: 'stand', col: P.fig, rim: .7, veil: true, ...o }); S.scene.add(W.g); return W; };
const CLAWD = (S, o = {}) => { const C = clawd(S.U, { u: .0024, z: -.033, glow: .42, ...o }); S.scene.add(C.g); return C; };
const onBrocal = u => BTOP - 2 * u + .0004;   // Clawd sitting on the lip, legs over the front face

// S1 the hook: noon, the well, Jesus seated; far off a woman comes alone with her jar. The paper title, then only picture and subtitles.
export function S1(E) {
  const { H } = E;
  const S = noonStage();
  well(S, {});
  const W = WOMAN(S, PAL.noon, { h: .05, z: -.1, rim: .5 });
  const jar = cantaro(S.U, { h: .015, z: .0012 }); W.g.add(jar); jar.position.set(-.004, .05 * .86, .0012); jar.rotation.z = .25;
  const J = JESUS(S, PAL.noon);
  const C = CLAWD(S, { u: .0026 });
  const title = titleStrip(S);
  return { S, update(t) {
    const z = lerp(.54, .5, eio(seg(t, 0, E.dur)));
    aim(S.cam, [-.004, -.01, z, -.004, -.01, -.08], t, { hand: .0004 });
    const wk = seg(t, 0, E.dur), wx = lerp(-.058, -.036, wk);
    W.set({ x: wx, y: -.031 + Math.abs(Math.sin(t * 5.2)) * .0006, a: 2.75, rot: Math.sin(t * 5.2) * .012 });
    J.set({ x: .042, y: GROUND - .002, a: .35, flip: true });
    const look = t < H.vida - .15 ? -1 : lerp(-1, 1, ss(seg(t, H.vida - .15, H.vida + .25)));
    C.set({ x: -.03, y: onBrocal(.0026), look, blink: blinkAt(t, 3.1, .5), k: 1 });
    placeTitle(S, title, t, .3, 3.3);
    this._f = fsOf(S, -.066);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 6, bloom: blo(.28, 1.15) }; }, grade() { return NOON_G; } };
}

// S2 the noon sun: the white disc high in the sky, the camera tilts down to the well; Jesus, tired, sits down on "aquí"
export function S2(E) {
  const { H } = E;
  const S = noonStage({ light: [.0, .11, -.1], lightR: .22 });
  well(S, {});
  const sun = moon({ r: .016, x: .012, y: .112, z: -.155, gain: 3, core: '#ffffff', mid: '#fffcf2', edge: '#fff4dc', halo: 9, haloGain: .6, haloCol: '#fff6e0' }); S.scene.add(sun);
  const Js = JESUS(S, PAL.noon, { pose: 'stand', h: .084 }), Jt = JESUS(S, PAL.noon);
  const C = CLAWD(S, { u: .0026 });
  return { S, update(t) {
    const k = eio(seg(t, E.T0, H.aqui - .3)), cy = lerp(.02, -.01, k), z = lerp(.56, .5, k);
    aim(S.cam, [0, cy, z, 0, cy, -.08], t, { hand: .0004 });
    const walk = seg(t, E.T0 + .2, H.aqui - .15), sat = t >= H.aqui;
    Js.g.visible = !sat; Jt.g.visible = sat;
    const moving = walk > 0 && walk < 1 ? 1 : 0;
    Js.set({ x: lerp(.07, .045, ss(walk)), y: GROUND - .004 - moving * Math.abs(Math.sin(t * 4.5)) * .0007, a: Math.sin(t * 4.5) * .2 * moving, flip: true, rot: -.04 });
    const dip = 1 - ss(seg(t, H.aqui, H.aqui + .35));
    Jt.set({ x: .043, y: GROUND - .002 - dip * .004, a: .3, flip: true });
    const shade = ss(seg(t, H.mediodia - .1, H.mediodia + .3)) * (1 - ss(seg(t, H.aqui - .1, H.aqui + .3)));
    C.set({ x: -.03, y: onBrocal(.0026), aR: shade * 2.0, look: lerp(.2, .9, ss(seg(t, H.aqui - .6, H.aqui))), blink: lerp(blinkAt(t, 2.7), .55, shade), k: 1 });
    setMoon(sun, 1 + .03 * Math.sin(t * 2.1));
    this._f = fsOf(S, -.066);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 6, bloom: blo(.4, 1.0) }; }, grade() { return { ...NOON_G, vig: .62 }; } };
}

// the two-shot at the well, used by S3 (arrival), S6 (silence 1) and S9 (silence 2)
function twoShot(o = {}) {
  const P = o.pal || PAL.noon;
  const S = (o.gold ? goldStage : noonStage)(o.stage || {});
  const Wl = well(S, { pal: P, bx: [-.034, .022] });
  const W = WOMAN(S, P, { h: .084, z: -.068 }), J = JESUS(S, P, { h: .084 });
  const jar = cantaro(S.U, { h: .022, z: -.034 }); S.scene.add(jar);
  const C = CLAWD(S, { u: .0022 });
  return { S, Wl, W, J, jar, C, P };
}

// S3 the woman arrives; the jar comes down on the stone; "Dame de beber" with the smallest gesture
export function S3(E) {
  const { H } = E;
  const { S, W, J, jar, C } = twoShot();
  return { S, update(t) {
    const tr = eio(seg(t, E.T0, E.T0 + E.dur));
    aim(S.cam, [lerp(-.008, -.002, tr), -.014, .46, lerp(-.008, -.002, tr), -.014, -.08], t, { hand: .0004 });
    const arrive = H.beber - .7, wk = seg(t, E.T0, arrive), set = ss(seg(t, arrive - .1, arrive + .35));
    const wx = lerp(-.1, -.047, eo(wk));
    W.set({ x: wx, y: GROUND - .002 + (wk < 1 ? Math.abs(Math.sin(t * 5.4)) * .0006 : 0), a: lerp(2.75, 1.2, set), rot: wk < 1 ? Math.sin(t * 5.4) * .01 : 0 });
    // the jar travels from her shoulder to the brocal
    const sh = [wx - .004, GROUND - .002 + .084 * .86], lip = [-.026, BTOP + .0005];
    jar.position.set(lerp(sh[0], lip[0], set), lerp(sh[1], lip[1], set) + Math.sin(Math.PI * set) * .006, -.034); jar.rotation.z = lerp(.25, 0, set);
    J.set({ x: .046, y: GROUND - .002, a: lerp(.3, 1.25, ss(seg(t, H.beber - .1, H.beber + .35))) * (1 - .5 * ss(seg(t, H.beber + 1.4, H.beber + 1.9))), flip: true });
    const back = ss(seg(t, arrive - .3, arrive + .2));
    C.set({ x: lerp(-.012, .002, back), y: onBrocal(.0022), look: lerp(-.8, .7, ss(seg(t, H.beber - .1, H.beber + .3))), blink: blinkAt(t, 3.4, 1), k: 1 });
    this._f = fsOf(S, -.068);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 6, bloom: blo(.28, 1.15) }; }, grade() { return NOON_G; } };
}

// S4 the well between them: she near, he far beyond the brocal; focus racks from him to her on "no se tratan"
export function S4(E) {
  const { H } = E;
  const S = noonStage();
  well(S, { road: false, sep: true, bz: -.07, bx: [-.03, .03] });
  const J = JESUS(S, PAL.noon, { h: .07, z: -.098 });
  const W = WOMAN(S, PAL.noon, { h: .088, z: -.046 });
  const C = CLAWD(S, { u: .0019, z: -.065 });
  return { S, update(t) {
    const tr = seg(t, E.T0, E.T0 + E.dur);
    aim(S.cam, [lerp(.0, -.004, tr), -.014, .46, lerp(.0, -.004, tr), -.014, -.08], t, { hand: .0004 });
    W.set({ x: -.038, y: GROUND - .004, a: .25, rot: -.02 });
    J.set({ x: .035, y: -.04, a: .3, flip: true });
    C.set({ x: .0, y: onBrocal(.0019), look: 0, blink: .55, k: .95 });
    const rk = ss(seg(t, H.tratan + 1.3, H.tratan + 2.0));
    this._f = lerp(fsOf(S, -.098), fsOf(S, -.046), rk);
  }, post() { return { focus: this._f, aper: 9, maxCoc: 7, bloom: blo(.26, 1.15) }; }, grade() { return NOON_G; } };
}

// S5 the shaft in cross-section: the camera tilts down from the mouth to the black water; on "agua viva" a single warm glint trembles and goes out
export function S5(E) {
  const { H } = E;
  const S = noonStage({ light: [0, .06, -.1], lightR: .2, floor: .45 });
  const Sh = shaft(S, {});
  const W = WOMAN(S, PAL.noon, { h: .07, z: -.06 }), J = JESUS(S, PAL.noon, { h: .07, z: -.06 });
  const C = CLAWD(S, { u: .0022, z: -.025 });
  const gl = col3('#ffd890'), wh = col3(PAL.noon.light);
  return { S, update(t) {
    const k = eio(seg(t, E.T0, H.agua - .2)), cy = lerp(-.005, -.046, k), z = lerp(.5, .6, k);
    aim(S.cam, [-.004, cy, z, -.004, cy, -.08], t, { hand: .0004 });
    W.set({ x: -.054, y: -.001, a: 1.0 });
    J.set({ x: .05, y: -.001, a: .3, flip: true });
    C.set({ x: -.032, y: .0004, rot: -.16, look: 1, blink: blinkAt(t, 3.6, .7), k: 1 });
    const f = ss(seg(t, H.agua - .05, H.agua + .25)) * (1 - ss(seg(t, H.agua + .5, H.sil1 + .2)));
    Sh.back.material.userData.u.uGlowLit.value = f * (1 + .25 * Math.sin(t * 31) * Math.sin(t * 13));
    setL(S, 0, lerp(.06, WATER, f), lerp(.2, .05, f), lerp(1, 1.1, f), wh.clone().lerp(gl, f));
    this._f = fsOf(S, lerp(-.05, -.09, k));
  }, post() { return { focus: this._f, aper: 7, maxCoc: 6, bloom: blo(.35, 1.05) }; }, grade() { return NOON_G; } };
}

// S6 silence 1: the two-shot, locked; the light goes whiter and flatter; nobody moves
export function S6(E) {
  const { S, W, J, jar, C } = twoShot();
  W.set({ x: -.047, y: GROUND - .002, a: 1.2 }); J.set({ x: .046, y: GROUND - .002, a: .62, flip: true });
  jar.position.set(-.026, BTOP + .0005, -.034);
  return { S, update(t) {
    aim(S.cam, [-.002, -.014, .46, -.002, -.014, -.08], t, { hand: .0002 });
    const k = ss(seg(t, E.T0, E.T0 + E.dur * .8));
    S.key.intensity = lerp(2.1, 2.6, k); S.amb.intensity = lerp(.6, .85, k); S.U.uFloor.value = lerp(.55, .75, k);
    C.set({ x: .002, y: onBrocal(.0022), look: .3, blink: 1, k: 1 }); this._k = k;
    this._f = fsOf(S, -.068);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 6, bloom: blo(.28, 1.15) }; }, grade() { return { ...NOON_G, contrast: lerp(.2, .08, this._k), expo: lerp(1, 1.06, this._k), lift: LIFT }; } };
}

// S7 "Ve, llama a tu marido": she in a medium shot, the jar in front; the camera moves away instead of closer; he does not turn away; she lifts her head
export function S7(E) {
  const { H } = E;
  const S = noonStage();
  well(S, { bx: [-.05, .028] });
  const W = WOMAN(S, PAL.noon, { h: .088, z: -.062 });
  const J = JESUS(S, PAL.noon, { h: .084, z: -.076 });
  const jar = cantaro(S.U, { h: .022, z: -.034 }); S.scene.add(jar); jar.position.set(-.006, BTOP + .0005, -.034);
  const C = CLAWD(S, { u: .0019 });
  return { S, update(t) {
    const k = eio(seg(t, E.T0, E.T0 + E.dur)), z = lerp(.36, .5, k), cx = lerp(-.012, -.002, k), cy = lerp(-.02, -.011, k);
    aim(S.cam, [cx, cy, z, cx, cy, -.08], t, { hand: .0004 });
    const bow = ss(seg(t, H.l09 + .2, H.l09 + .8)) * (1 - ss(seg(t, H.l10b + .7, H.l10b + 1.3)));
    W.set({ x: -.02, y: GROUND - .002, a: lerp(.35, .15, bow), rot: -.075 * bow });
    J.set({ x: .05, y: GROUND - .003, a: .55 + bob(t, .8, .02), flip: true });
    C.set({ x: -.037, y: onBrocal(.0019), look: -.2, blink: .55, k: .95 });
    this._f = fsOf(S, -.062);
  }, post() { return { focus: this._f, aper: 8, maxCoc: 7, bloom: blo(.26, 1.15) }; }, grade() { return NOON_G; } };
}

// S8 the mount: she lifts her arm toward it; he opens his hand upward on "en espíritu y en verdad"; the sky turns its first warm cream; on "Mesías" she looks at him
export function S8(E) {
  const { H } = E;
  const S = noonStage();
  const Wl = well(S, { mount: -.03, bx: [-.03, .026] });
  const W = WOMAN(S, PAL.noon, { h: .082, z: -.068 }), J = JESUS(S, PAL.noon, { h: .082, z: -.066, two: true });
  const C = CLAWD(S, { u: .0021 });
  const lc = [col3(PAL.noon.light), col3(PAL.warm.light)];
  return { S, update(t) {
    const k = eio(seg(t, E.T0, E.T0 + E.dur)), cy = lerp(-.014, -.006, k);
    aim(S.cam, [0, cy, lerp(.52, .5, k), 0, cy, -.08], t, { hand: .0004 });
    const point = ss(seg(t, H.verdad - .4, H.verdad + .2)) * (1 - ss(seg(t, H.mesias - .3, H.mesias + .1)));
    const toHim = t > H.mesias - .1;
    W.set({ x: -.05, y: GROUND - .002, a: point * 2.35 + (toHim ? .35 : .2), flip: !toHim && point > .05 });
    const open = ss(seg(t, H.verdad + 1.3, H.verdad + 1.9)) * (1 - ss(seg(t, H.mesias + .4, H.mesias + 1.0)));
    J.set({ x: .046, y: GROUND - .002, a: .35, a2: .35 + open * .95, flip: true });   // the hand opens forward and up, never pointing at her
    C.set({ x: -.004, y: onBrocal(.0021), look: toHim ? .9 : lerp(.4, -1, point), blink: blinkAt(t, 3.2, .2), k: 1 });
    const w = ss(seg(t, H.verdad, H.mesias + 1.2)); this._w = w;
    Wl.paint(PAL.noon, PAL.warm, w, '#fbe9c4');
    const fc = mixHex(PAL.noon.fig, PAL.warm.fig, w); for (const F of [W, J]) for (const m of [F.body, F.arm, F.arm2]) if (m) tint(m, fc);
    setL(S, 0, .12, .32, 1, lc[0].clone().lerp(lc[1], w));
    this._f = fsOf(S, -.068);
  }, post() { return { focus: this._f, aper: 6, maxCoc: 6, bloom: blo(.28, 1.12) }; }, grade() { return { vig: .58 - .1 * this._w, sat: lerp(.8, .95, this._w), contrast: lerp(.2, .14, this._w), gain: [1.02, 1, lerp(.96, .93, this._w)], lift: LIFT }; } };
}

// S9 silence 2: frontal, the two on either side of the brocal, locked; Clawd steps down to the side and leaves the middle free
export function S9(E) {
  const { S, W, J, jar, C } = twoShot({ pal: PAL.warm, stage: { lightCol: PAL.warm.light } });
  W.set({ x: -.047, y: GROUND - .002, a: .3 }); J.set({ x: .046, y: GROUND - .002, a: .35, flip: true });
  jar.position.set(-.026, BTOP + .0005, -.034);
  return { S, update(t) {
    aim(S.cam, [-.002, -.016, .47, -.002, -.016, -.08], t, { hand: .0002 });
    const d = seg(t, E.T0 + .05, E.T0 + .55), k = ss(seg(t, E.T0, E.T0 + E.dur));
    const x = lerp(.002, -.046, ss(d)), y = lerp(onBrocal(.0022), GROUND - .0005, ss(d)) + Math.sin(Math.PI * d) * .007;
    C.set({ x, y, look: .2, blink: 1, k: 1 });
    S.key.intensity = lerp(2.1, 1.5, k); S.U.uLit.value = lerp(1, .8, k); this._k = k;
    this._f = fsOf(S, -.068);
  }, post() { return { focus: this._f, aper: 7, maxCoc: 6, bloom: blo(.26, 1.15) }; }, grade() { return { vig: .62, sat: .9, contrast: .16, expo: lerp(1, .9, this._k), lift: LIFT }; } };
}

// S10 signature shot: in the cross-section the light rises from the water, each course of stone turns translucent from the bottom up,
// and on "soy" it leaves by the mouth (the film's only burst). White noon becomes gold. God is only light.
export function S10(E) {
  const { H } = E;
  const S = goldStage({ light: [0, WATER, -.1], lightR: .03, floor: .25, key: 1.2, amb: .32 });
  const Sh = shaft(S, { pal: PAL.noon });
  const W = WOMAN(S, PAL.gold, { h: .07, z: -.06, rim: .9 }), J = JESUS(S, PAL.gold, { h: .07, z: -.06, rim: .95 });
  const jar = cantaro(S.U, { h: .016, z: -.061 }); S.scene.add(jar); jar.position.set(-.05, -.001, -.061);
  const C = CLAWD(S, { u: .0022, z: -.024 });
  const ray = burst(.17, .3, '#ffd79a'); ray.position.set(0, .152, -.045); S.add(ray);   // the burst glows from its bottom edge: that edge sits on the mouth
  const white = col3(PAL.noon.light), gold = col3(PAL.gold.light);
  const T = H.soy;
  return { S, update(t) {
    const rise = eio(seg(t, E.T0, T + 1.5)), cy = lerp(-.05, -.018, rise), z = lerp(.6, .53, eio(seg(t, E.T0, E.T0 + E.dur)));
    aim(S.cam, [-.004, cy, z, -.004, cy, -.08], t, { hand: .0004 });
    const L = ss(seg(t, T - .25, T + .9));
    setL(S, 0, lerp(WATER, .03, L), lerp(.03, .2, L), lerp(.5, 1.6, ss(seg(t, T - .3, T + .3))), white.clone().lerp(gold, ss(seg(t, T - .3, T + .2))));
    S.U.uFloor.value = lerp(.12, .5, L);
    Sh.rings.forEach((r, i) => { const q = ss(seg(t, T - .15 + i * .35, T + .2 + i * .35)); r.material.userData.u.uTrans.value = lerp(.05, .7, q); tint(r, mixHex(['#18150f', '#211d17', '#2b261f'][i], ['#b98f4e', '#a8814a', '#8a6a3a'][i], q)); });
    Sh.back.material.userData.u.uGlowLit.value = ss(seg(t, T - .3, T)) * (1 - .8 * ss(seg(t, T + .6, T + 1.2))) * .8;   // the water glint gives way as the light climbs (it sits near the subtitles)
    const b = ss(seg(t, T + .5, T + .9)); ray.userData.set(b * (1 + .05 * Math.sin(t * 7.3) * Math.sin(t * 3.1)));
    Sh.paint(ss(seg(t, T + .3, T + 1.4)), '#ffdc98');
    S.key.intensity = lerp(1.2, 1.9, b); S.amb.intensity = lerp(.32, .52, b);
    W.set({ x: -.064, y: -.001, a: lerp(.3, 1.05, ss(seg(t, T + .8, T + 1.4))) });
    J.set({ x: .05, y: -.001, a: .4, flip: true });
    C.set({ x: -.034, y: .0004, look: .7, blink: 1, k: 1 });
    this._b = b; this._f = fsOf(S, lerp(-.09, -.06, rise));
  }, post() { return { focus: this._f, aper: 8, maxCoc: 8, bloom: blo(.45, 1.0) }; }, grade() { return { vig: lerp(.6, .4, this._b), sat: lerp(.85, 1.06, this._b), contrast: .12, gain: [1.04, 1, .93], lift: LIFT }; } };
}

// the hill town of Sicar: houses on a far hill, two lit windows
function town(S, P) {
  const R = mulberry(41), hill = u => .006 + .045 * Math.exp(-(((u - .038) / .06) ** 2));
  return land(S, { z: -.128, col: P.far, trans: .7, ppm: 2200, ymax: .12, finish: { rim: .4, under: .2 }, top: u => hill(u) + .004 * Math.sin(u * 29), more: x => {
    for (let i = 0; i < 7; i++) { const cx = .008 + i * .0095, top = hill(cx); const w = .0075 + R() * .003, hh = .007 + R() * .006; x.fillRect(cx - w / 2, top - .004, w, hh + .004); if (i === 3) { x.beginPath(); x.arc(cx, top + hh, w * .45, 0, Math.PI); x.fill(); } }
  }, glowDraw: x => { x.fillStyle = '#fff'; for (const [cx, cy] of [[.027, .057], [.047, .055]]) x.fillRect(cx, cy, .0018, .0024); }, glow: 2.4, glowCol: '#ffcf7a', glowRes: .7 });
}

// S11 the jar left behind: in focus on the brocal; behind, she runs up to the town; focus racks to her; Clawd stays beside the jar
export function S11(E) {
  const { H } = E;
  const S = goldStage();
  S.add(skyPanel({ w: 1.4, h: 1.6, y: .2, z: -.16, stops: PAL.gold.sky }));
  const tw = town(S, PAL.gold);
  land(S, { z: -.105, col: PAL.gold.mid, trans: .35, ppm: 1900, top: u => -.022 + .02 * Math.exp(-(((u - .03) / .07) ** 2)) + .003 * Math.sin(u * 27) });
  const W = WOMAN(S, PAL.gold, { h: .06, z: -.112, rim: .8 });   // behind the middle hill: its ridge hides her feet as she climbs
  land(S, { z: -.04, col: PAL.gold.front, trans: .03, ppm: 2600, finish: { rim: .6, rimPx: 4, under: .3 }, top: u => GROUND + .0025 * Math.sin(u * 40 + 1.3), more: x => brocal(x, -.05, .03) });
  const jar = cantaro(S.U, { h: .03, z: -.034 }); S.scene.add(jar); jar.position.set(.006, BTOP + .0005, -.034);
  const C = CLAWD(S, { u: .0024 });
  return { S, update(t) {
    const tr = eio(seg(t, E.T0, E.T0 + E.dur)), cx = lerp(-.006, .004, tr);
    aim(S.cam, [cx, -.013, .46, cx, -.013, -.08], t, { hand: .0004 });
    const run = seg(t, E.T0 + .1, H.vengan + .1), r = eo(run), moving = run < 1 ? 1 : 0;
    const x = lerp(-.056, .028, r), y = lerp(-.03, -.009, r) + Math.abs(Math.sin(t * 9)) * .0012 * moving;
    W.set({ x, y, s: lerp(1, .5, r), a: moving ? .9 + Math.sin(t * 9) * .6 : .35, rot: moving ? -.12 : 0 });
    W.g.visible = t < H.vengan + .6;
    tw.material.userData.u.uGlowLit.value = .6 + .4 * ss(seg(t, H.vengan - .2, H.vengan + .3));
    C.set({ x: -.026, y: onBrocal(.0024), look: lerp(.2, 1, ss(seg(t, H.cantaro + .3, H.cantaro + .8))), blink: blinkAt(t, 3, .9), k: 1 });
    const rk = ss(seg(t, H.cantaro + .5, H.cantaro + 1.2));
    this._f = lerp(fsOf(S, -.034), fsOf(S, -.112), rk);
  }, post() { return { focus: this._f, aper: 8, maxCoc: 7, bloom: blo(.32, 1.1) }; }, grade() { return GOLD_G; } };
}

// S12 the town comes down: the frame of the hook, now in gold; along the road where she came alone, many come; dolly toward Clawd for the question
export function S12(E) {
  const { H } = E;
  const S = goldStage();
  well(S, { pal: PAL.gold });
  const c1 = crowd(S.U, { n: 5, h: .04, z: -.104, col: '#3a2814', seed: 5, gap: .022 }); S.scene.add(c1);
  const c2 = crowd(S.U, { n: 4, h: .052, z: -.096, col: PAL.gold.fig, seed: 9, gap: .026 }); S.scene.add(c2);
  const J = JESUS(S, PAL.gold, { rim: .85 });
  const jar = cantaro(S.U, { h: .022, z: -.034 }); S.scene.add(jar); jar.position.set(.01, BTOP + .0005, -.034);
  const C = CLAWD(S, { u: .0028 });
  return { S, update(t) {
    const k = eio(seg(t, H.l17 - .5, H.cta + .6)), z = lerp(.52, .38, k), cx = lerp(-.004, -.016, k), cy = lerp(-.01, -.019, k);
    aim(S.cam, [cx, cy, z, cx, cy, -.08], t, { hand: .0004 });
    const w = seg(t, E.T0, E.T0 + E.dur);
    c1.position.set(lerp(-.13, -.06, eo(w)), -.0325, -.104);
    c2.position.set(lerp(-.16, -.072, eo(seg(t, E.T0 + .4, E.T0 + E.dur))), -.034, -.096);
    J.set({ x: .042, y: GROUND - .002, a: .45, flip: true });
    const toCam = ss(seg(t, H.cta - .2, H.cta + .3));
    const hop = Math.abs(Math.sin(Math.max(0, t - H.cta) * 6)) * .0018 * (t > H.cta && t < H.cta + 1.05 ? 1 : 0);
    C.set({ x: -.026, y: onBrocal(.0028) + hop, look: lerp(-.9, 0, toCam), aR: toCam * 1.0, blink: blinkAt(t, 2.9, .1), k: 1 });
    this._f = lerp(fsOf(S, -.1), fsOf(S, -.033), ss(seg(t, H.l17 - .3, H.l17 + .6)));
  }, post() { return { focus: this._f, aper: 7, maxCoc: 7, bloom: blo(.3, 1.12) }; }, grade() { return GOLD_G; } };
}
