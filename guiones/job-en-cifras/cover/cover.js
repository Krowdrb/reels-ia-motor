// Cover: the golden fold (S12 at cover scale): Clawd big on the fence counting, two rows of sheep, Job by the gate. God is only light.
import * as THREE from 'three';
import { Pipe } from '../src/post.js';
import { stage, aim } from '../src/stage.js';
import { clawd, human } from '../src/actors.js';
import { fold, GOLD, camY } from '../src/shots.js';

const Q = new URLSearchParams(location.search), SSAA = +(Q.get('ssaa') || 2), W = 1080, H = 1920;
window.DUR = 1;
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
renderer.setPixelRatio(SSAA); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.NoToneMapping; renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const pipe = new Pipe(renderer, W, H, SSAA);
await Promise.all([document.fonts.load('900 40px Cinzel', '7.000'), document.fonts.load('800 40px Cinzel', 'A')]);

const S = stage({ light: [.05, -.01, -.1], lightR: .3, lightCol: '#ffd89a', key: 1.6, keyCol: '#ffe6c4', amb: .38, ambCol: '#c8a07a', floor: .5 });
// darker blue band high in the sky so the hook reads on it; gold dawn below
const P = { ...GOLD, sky: [[0, '#0b1428'], [.38, '#16223f'], [.46, '#2c3a64'], [.5, '#a4826c'], [.55, '#f2c27e'], [.62, '#ffd690'], [1, '#ffe6b0']] };
const F = fold(S, P, { rows: 2 });
const J = human(S.U, { h: .085, z: -.071, col: '#1a0e06', rim: .85 }); S.scene.add(J.g);
J.set({ x: .04, y: -.05, a: .45 }); J.g.scale.x = -1;
const C = clawd(S.U, { u: .0036, z: -.058, glow: .45 }); S.scene.add(C.g);
C.set({ x: -.026, y: -.0225, look: -.2, aR: 2.1, aL: .2, tuck: .25, k: 1.05 });
F.gate.rotation.y = -.25; F.farHouse.visible = false;
const cz = .47, cy = camY(cz, -.05, -.075, .31);
aim(S.cam, [-.004, cy, cz, -.004, cy, -.08], 0, { hand: 0 });
F.fr.follow(.22);

window.render = () => {
  pipe.shot(S.scene, S.cam, { focus: S.cam.position.z + .058, aper: 7, maxCoc: 5, bloom: { strength: .36, radius: .6, threshold: 1.12 } }, pipe.rtA);
  pipe.final({ vig: .36 });
};
window.READY = true;
