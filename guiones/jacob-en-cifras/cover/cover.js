// Cover: the cold dawn at the tent door (shot 4). In the centre-right the grey-white slit of light and Lea standing, quiet, the veil already
// lifted; Jacob in front on the right, his arm fallen. Clawd large at the bottom left (above the bottom 20 %), three-quarters toward the door,
// eyes open, a pebble in his hand and the row of seven at his feet. Dark indigo sky at the top behind the hook, no light behind the text.
import * as THREE from 'three';
import { Pipe } from '../src/post.js';
import { stage, aim } from '../src/stage.js';
import { clawd, pebble, glowMesh } from '../src/actors.js';
import { tentDawn, G, camY } from '../src/shots.js';

const Q = new URLSearchParams(location.search), SSAA = +(Q.get('ssaa') || 2), W = 1080, H = 1920;
window.DUR = 1;
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
renderer.setPixelRatio(SSAA); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.NoToneMapping; renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const pipe = new Pipe(renderer, W, H, SSAA);
await Promise.all([document.fonts.load('900 40px Cinzel', '7 AÑOS…'), document.fonts.load('900 40px Cinzel', 'NO ERA ELLA')]);

const S = stage({ light: [.006, G + .03, -.1], lightR: .11, lightCol: '#dfe3ee', key: 1.0, keyCol: '#c8d0e6', amb: .36, ambCol: '#7a84a8', floor: .3 });
const { TX, Le, J } = tentDawn(S, { sky: [[.3, '#0e1020'], [.12, '#1a1e34'], [.04, '#3b4258'], [.0, '#6d7590'], [-.03, '#b4bccc'], [-.045, '#dfe3ee']] });
Le.set({ x: TX + .017, y: G, a: .05, rot: -.035 }); Le.g.scale.x = -1;
const sl = glowMesh(.05, .09, '#dfe3ee'); sl.position.set(TX, G + .022, -.126); sl.userData.set(.28); S.scene.add(sl);
J.set({ x: .058, y: G - .024, a: .1 }); J.g.scale.x = -1;   // in front on the right, facing the door, the arm fallen
const C = clawd(S.U, { u: .0036, z: -.07, glow: .5 }); S.scene.add(C.g);
C.set({ x: -.032, y: G - .004, look: .7, aR: 1.0, aL: .2, k: 1.15 });
const p0 = pebble(S.U, { r: .0026, z: -.0695, seed: 3 }); p0.position.set(-.032 + 8.6 * .0036, G - .004 + 7.4 * .0036, -.0695); S.add(p0);
for (let i = 0; i < 7; i++) { const p = pebble(S.U, { r: .0024, z: -.068, seed: 11 + i * 7, col: '#efe4cc' }); p.position.set(-.06 + i * .0056 + (i > 3 ? .002 : 0), G - .0115, -.068); S.add(p); }
const d = .5, cx = .0, cy = camY(G, .66, d);
aim(S.cam, [cx, cy, -.08 + d, cx, cy, -.08], 0, { hand: 0 });

window.render = () => {
  pipe.shot(S.scene, S.cam, { focus: S.cam.position.z + .08, aper: 4, maxCoc: 3, bloom: { strength: .42, radius: .6, threshold: 1.0 } }, pipe.rtA);
  pipe.final({ vig: .5, sat: .85, lift: [0, .008, .022], gain: [.97, 1, 1.04] });
};
window.READY = true;
