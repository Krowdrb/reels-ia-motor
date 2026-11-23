// Cover: Horeb at night, the bush blazing white-gold behind black branches that stay intact, the light beginning to pass through the
// mountain; Moses small and quiet on his knees, his arm over his face, the sandals on the ground; Clawd large in front, three-quarters
// toward the bush, his edge lit by it. Same paper engine as the film; God is only light.
import * as THREE from 'three';
import { Pipe } from '../src/post.js';
import { stage, aim } from '../src/stage.js';
import { clawd, human, sandals, tint } from '../src/actors.js';
import { horeb, G, camY } from '../src/shots.js';

const Q = new URLSearchParams(location.search), SSAA = +(Q.get('ssaa') || 2), W = 1080, H = 1920;
window.DUR = 1;
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
renderer.setPixelRatio(SSAA); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.NoToneMapping; renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const pipe = new Pipe(renderer, W, H, SSAA);
await Promise.all([document.fonts.load('900 40px Cinzel', '80 AÑOS'), document.fonts.load('800 40px Cinzel', 'Y LO LLAMÓ')]);

const S = stage({ light: [.012, G + .02, -.1], lightR: .14, lightCol: '#ffe7b0', key: .9, keyCol: '#bfb6e6', amb: .3, ambCol: '#7a70b0', floor: .32 });
const Wh = horeb(S, { bx: .012, bs: .036, cuts: true });
Wh.B.set(1.4, 1); Wh.warm(.32); tint(Wh.L.rock, '#0a0812'); tint(Wh.L.near, '#1c1428');
for (const [m, r, k] of [[Wh.L.slope, .09, .8], [Wh.L.crests, .07, .45]]) { const u = m.material.userData.u; u.uGR.value.z = r; u.uGlowLit.value = k; }
Wh.L.crests.material.userData.u.uTrans.value = .5;
const M = human(S.U, { h: .044, z: -.092, col: '#08060f', rim: .85, pose: 'cover' }); S.scene.add(M.g);
M.set({ x: .042, y: G }); M.g.scale.x = -1;   // kneeling, facing the bush
const sd = sandals(S.U, { L: .011, z: -.09 }); sd.position.set(.062, G - .002, -.09); S.add(sd);
const C = clawd(S.U, { u: .0033, z: -.058, glow: .5 }); S.scene.add(C.g);
C.set({ x: -.03, y: G - .012, look: .75, aL: .3, aR: .6, k: 1.15 });
const d = .6, cx = .008, cy = camY(G, .62, d);
aim(S.cam, [cx, cy, -.08 + d, cx, cy, -.08], 0, { hand: 0 });

window.render = () => {
  pipe.shot(S.scene, S.cam, { focus: S.cam.position.z + .07, aper: 5, maxCoc: 4, bloom: { strength: .45, radius: .6, threshold: 1.0 } }, pipe.rtA);
  pipe.final({ vig: .5, sat: 1.04 });
};
window.READY = true;
