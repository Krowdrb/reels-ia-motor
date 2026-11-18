// Cover: the door at dusk under the coming storm. Clawd big on the low stone, looking at us with an arm up; Methuselah sitting with his staff,
// rim-lit in gold, the tent window burning; dark storm clouds above (room for the hook) and the ark tiny on the horizon. Same paper engine as the film.
import * as THREE from 'three';
import { Pipe } from '../src/post.js';
import { stage, aim } from '../src/stage.js';
import { mulberry, TAU } from '../src/lib.js';
import { mk, clawd } from '../src/actors.js';
import { puerta, oldMan, PAL, G, MX, CX, camY } from '../src/shots.js';

const Q = new URLSearchParams(location.search), SSAA = +(Q.get('ssaa') || 2), W = 1080, H = 1920;
window.DUR = 1;
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
renderer.setPixelRatio(SSAA); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.NoToneMapping; renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const pipe = new Pipe(renderer, W, H, SSAA);
await Promise.all([document.fonts.load('900 40px Cinzel', 'MATUSALÉN969'), document.fonts.load('800 40px Cinzel', '¿Y EL DILUVIO?')]);

const P = { ...PAL.dusk, sky: [[0, '#1c1826'], [.4, '#3a3048'], [.58, '#b07a6a'], [.66, '#f3c98a'], [1, '#f3d9a4']] };
const S = stage({ light: [.078, -.02, -.1], lightR: .16, lightCol: '#ffc98a', key: 1.25, keyCol: '#ffd9b0', amb: .3, ambCol: '#8a78a8', floor: .35 });
const B = puerta(S, P, { ark: true });
B.L.ark.win.material.userData.u.uGlowLit.value = 1; B.L.ark.g.position.set(.031, -.0022, -.1385); B.L.ark.g.scale.setScalar(.75);
// a far hill under the clouds, so the tiny ark sits on the horizon in the clear sky between the staff and Clawd
S.add(mk(S.U, { w: .2, h: .2, x: .03, y: -.09, z: -.139, col: '#8a7298', trans: .5, ppm: 2000, finish: { rim: .5 }, draw: c => { c.translate(0, .09); c.beginPath(); c.moveTo(-.1, -.1); for (let u = -.1; u <= .1001; u += .002) c.lineTo(u, -.06 + .06 * Math.exp(-((u / .03) ** 2)) + .0008 * Math.sin(u * 300)); c.lineTo(.1, -.1); c.closePath(); c.fill(); } }));
// the storm coming: three dark cloud layers with lumpy bottom edges, the lowest just above the horizon
const R = mulberry(5);
[[-.156, '#3a3048', .028], [-.154, '#2a2434', .045], [-.152, '#1c1826', .065]].forEach(([z, col, y], i) => {
  const w = .5, th = .3, r = .014 + i * .004;
  S.add(mk(S.U, { w, h: th + r * 3, x: 0, y: y + (th + r * 3) / 2 - r, z, col, trans: .35, shadow: false, recv: false, ppm: 1400, finish: { rim: .5, rimPx: 4 }, draw: c => {
    c.translate(0, -(th + r * 3) / 2 + r); c.fillRect(-w / 2, 0, w, th);
    for (let k = 0; k < 18; k++) { c.beginPath(); c.arc(-w / 2 + (k + R() * .6) * w / 18, r * (.2 + R() * .5), r * (.7 + R() * .7), 0, TAU); c.fill(); }
  } }));
});
const { M } = oldMan(S, P, { h: .08, rim: 1 });
M.set({ x: MX - .006, y: G + .01, a: .95 });
const C = clawd(S.U, { u: .0036, z: -.066 }); S.scene.add(C.g);
C.set({ x: CX + .006, y: G + .006, tuck: .45, look: 0, lookY: 0, aR: 2.1, aL: .2, k: 1.15 });
B.L.tent.material.emissiveIntensity = 3;
const cz = .5, cx = .012, cy = camY(cz, G, -.068, .24);
aim(S.cam, [cx, cy, cz, cx, cy, -.08], 0, { hand: 0 });
B.fr.follow(.17);

window.render = () => {
  pipe.shot(S.scene, S.cam, { focus: S.cam.position.z + .068, aper: 6, maxCoc: 6, bloom: { strength: .4, radius: .6, threshold: 1.0 } }, pipe.rtA);
  pipe.final({ vig: .45, sat: 1.05 });
};
window.READY = true;
