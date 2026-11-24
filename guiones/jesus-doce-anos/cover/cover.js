// Cover: the signature shot. The paper doors open, the column of gold light coming straight down on the boy seated among the teachers
// (quiet silhouettes, no features); Clawd large in front, bottom left on the steps, three-quarters toward the light, still. God is only light.
import * as THREE from 'three';
import { Pipe } from '../src/post.js';
import { stage, aim } from '../src/stage.js';
import { clawd } from '../src/actors.js';
import { climax, G, camY } from '../src/shots.js';

const Q = new URLSearchParams(location.search), SSAA = +(Q.get('ssaa') || 2), W = 1080, H = 1920;
window.DUR = 1;
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
renderer.setPixelRatio(SSAA); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.NoToneMapping; renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const pipe = new Pipe(renderer, W, H, SSAA);
await Promise.all([document.fonts.load('900 40px Cinzel', '12 AÑOS'), document.fonts.load('800 40px Cinzel', '3 DÍAS PERDIDO')]);

const S = stage({ light: [-.002, G + .04, -.1], lightR: .12, lightCol: '#ffd79a', key: 1.5, keyCol: '#ffe8c8', amb: .34, ambCol: '#b89070', floor: .22 });
const X = climax(S);
X.open([1, 1, 1]); X.T.warm(.75); X.tintDoors(1); X.T.back.material.color.setScalar(1.6);
X.col.userData.set(1.05, 1); X.pool.userData.set(.6);
X.T.wall.material.color.multiplyScalar(.75);
const C = clawd(S.U, { u: .0031, z: -.02, glow: .45 }); S.scene.add(C.g);
C.set({ x: -.031, y: G - .034, look: .75, aL: .25, aR: .35, k: 1.15 });
const d = .52, cx = -.002, cy = camY(G, .55, d);
aim(S.cam, [cx, cy, -.08 + d, cx, cy, -.08], 0, { hand: 0 });

window.render = () => {
  pipe.shot(S.scene, S.cam, { focus: S.cam.position.z + .1, aper: 4, maxCoc: 3, bloom: { strength: .42, radius: .6, threshold: 1.0 } }, pipe.rtA);
  pipe.final({ vig: .5, sat: 1.04 });
};
window.READY = true;
