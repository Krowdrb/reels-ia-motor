// Cover: the climax. The cross far and high, serene against the light, the gold beam born behind it; at its foot María and the disciple
// together in one light; the dark crests opened like a curtain. Clawd big and still in the front, three-quarter toward them. God is only light.
import * as THREE from 'three';
import { Pipe } from '../src/post.js';
import { stage, aim } from '../src/stage.js';
import { clawd, human } from '../src/actors.js';
import { golgotha, glow, G, camY, CC } from '../src/shots.js';

const Q = new URLSearchParams(location.search), SSAA = +(Q.get('ssaa') || 2), W = 1080, H = 1920;
window.DUR = 1;
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
renderer.setPixelRatio(SSAA); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.NoToneMapping; renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const pipe = new Pipe(renderer, W, H, SSAA);
await Promise.all([document.fonts.load('900 40px Cinzel', 'ÉÓ'), document.fonts.load('800 40px Cinzel', 'A')]);

const S = stage({ light: [0, CC, -.24], lightR: .14, lightCol: '#ffd79a', key: 1.4, keyCol: '#ffe0b0', amb: .3, ambCol: '#a08878', floor: .2 });
const Gg = golgotha(S);
Gg.part(.085, .12); Gg.light([1, .9, .75, .55, .25]); Gg.sky(.28, .7);
Gg.halo.material.uniforms.col.value.set('#ffd79a'); Gg.halo.userData.set(.8);
Gg.shafts.forEach((m, i) => m.userData.set(.38 - i * .05));
S.U.uBeamO.value.set(0, CC, 1.5); S.U.uBeamD.value.set(-Math.PI / 2, .2, .4); S.U.uBeamCol.value.set('#ffd79a');
const M = human(S.U, { h: .082, z: -.085, pose: 'veiled', col: '#06060e', rim: .5, edge: '#ffd27a' }); S.scene.add(M.g);
const D = human(S.U, { h: .084, z: -.088, col: '#06060e', rim: .45, edge: '#ffd27a' }); S.scene.add(D.g);
for (const A of [M, D]) A.g.traverse(m => { if (m.material?.userData?.u && m !== A.rimM) m.material.userData.u.uBeamK.value = .12; });
M.set({ x: -.012, y: G, a: .2 }); M.lit(1.3);
D.set({ x: .015, y: G, a: .5, rot: -.03 }); D.g.scale.x = -1; D.lit(1.3);
const pool = glow(.06, .05, '#ffd79a', 1.6); pool.position.set(.0015, G + .03, -.084); pool.userData.set(.35); S.add(pool);
const C = clawd(S.U, { u: .0034, z: -.05, glow: .4 }); S.scene.add(C.g);
C.set({ x: -.058, y: G - .001, look: .85, blink: 1, k: 1.05 });
const d = .66, cx = -.022, cy = camY(G, .72, d);
aim(S.cam, [cx, cy, -.085 + d, cx, cy, -.085], 0, { hand: 0 });

window.render = () => {
  pipe.shot(S.scene, S.cam, { focus: S.cam.position.z + .07, aper: 5, maxCoc: 4, bloom: { strength: .3, radius: .6, threshold: 1.1 } }, pipe.rtA);
  pipe.final({ vig: .45, sat: 1.04, lift: [.008, .004, .004], gain: [1.04, 1, .94] });
};
window.READY = true;
