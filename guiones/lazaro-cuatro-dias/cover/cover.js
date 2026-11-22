// Cover: the tomb open and lit in gold, the stone rolled aside, Lázaro bound and quiet on the threshold (backlit, no face),
// Clawd large in front, three-quarters toward the tomb, arms half raised. Same paper engine as the film; the Father is only light.
import * as THREE from 'three';
import { Pipe } from '../src/post.js';
import { stage, aim } from '../src/stage.js';
import { burst } from '../src/paper.js';
import { clawd, lazarus } from '../src/actors.js';
import { tomb, GOLD, G, MX } from '../src/shots.js';

const Q = new URLSearchParams(location.search), SSAA = +(Q.get('ssaa') || 2), W = 1080, H = 1920;
window.DUR = 1;
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
renderer.setPixelRatio(SSAA); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.NoToneMapping; renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const pipe = new Pipe(renderer, W, H, SSAA);
await Promise.all([document.fonts.load('900 40px Cinzel', '4 DÍAS'), document.fonts.load('800 40px Cinzel', 'SALIÓ')]);

const S = stage({ light: [MX, G + .03, -.1], lightR: .14, lightCol: '#ffd79a', key: 1.6, keyCol: '#ffe6c0', amb: .36, ambCol: '#b8a0a0', floor: .35 });
const sky = [[0, '#0e0d22'], [.3, '#1f1c3c'], [.5, '#4a3c64'], [.62, '#b08890'], [.75, '#f0c890'], [1, '#ffe7b0']];
const T = tomb(S, { pal: { ...GOLD, sky }, faceRim: 'rgba(255,230,170,.6)', vcol: '#3a2c30' });
T.roll(.056); T.lightArches([1, 1, 1, 1, 1], GOLD, 1.9); T.back.material.color.setScalar(1.6); T.V.light([1, 1, 1]);
const glow = burst(.08, .09, '#ffd892'); glow.position.set(MX, G - .002, -.0875); glow.userData.set(.8); S.add(glow);
const Lz = lazarus(S.U, { h: .044, z: -.0925, col: '#1a1008', linen: '#4e3d2a', rim: .8 }); S.scene.add(Lz.g);
Lz.set({ x: MX, y: G + .001 });
const C = clawd(S.U, { u: .0033, z: -.056, glow: .45 }); S.scene.add(C.g);
C.set({ x: MX - .046, y: G - .003, look: .8, aL: 1.1, aR: 1.4, k: 1.1 });
const d = .44, cy = G - (.5 - .7) * .4617 * d;
aim(S.cam, [MX - .02, cy, -.08 + d, MX - .02, cy, -.08], 0, { hand: 0 });

window.render = () => {
  pipe.shot(S.scene, S.cam, { focus: S.cam.position.z + .07, aper: 5, maxCoc: 4, bloom: { strength: .42, radius: .6, threshold: 1.0 } }, pipe.rtA);
  pipe.final({ vig: .45, sat: 1.04 });
};
window.READY = true;
