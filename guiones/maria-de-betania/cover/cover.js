// Cover: the instant of the gesture. Clawd large in the niche by the lamps, María kneeling with the alabaster jar just broken (gold rises from the crack),
// Jesus seated at the right, serene, with a rim of light. The window's crossbar throws its faint shadow on the wall. Plum night above for the hook; the gold is born below.
import * as THREE from 'three';
import { Pipe } from '../src/post.js';
import { stage, aim } from '../src/stage.js';
import { clawd, human, frasco } from '../src/actors.js';
import { casa, NIGHT, GOLD, GROUND, CL } from '../src/shots.js';

const Q = new URLSearchParams(location.search), SSAA = +(Q.get('ssaa') || 2) * (innerWidth / 1080), W = 1080, H = 1920;
window.DUR = 1;
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
renderer.setPixelRatio(SSAA); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.NoToneMapping; renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const pipe = new Pipe(renderer, W, H, SSAA);
await Promise.all([document.fonts.load('900 40px Cinzel', 'ÑÁ…'), document.fonts.load('italic 600 40px Playfair', 'Juan 12')]);

const JX = .043, MX = -.004;   // Jesus, María, the jar
const S = stage({ light: [.02, GROUND + .03, -.08], lightR: .07, lightCol: '#ffd98a', key: .5, keyCol: '#eadace', keyPos: [-.07, .3, .3], keyTarget: [0, -.03, -.1], amb: .32, ambCol: '#8a6aa8', floor: .14, shadowR: 6 });
const R = casa(S, { table: false, diners: false });
R.paint(NIGHT, GOLD, { wall: .18, recess: .22 });   // the room warms a little from the floor up: gold low, plum high
R.moon.visible = false; R.lamplight(1.0); R.lamps.g.position.x = -.071; R.lamps.set(.4, { k: 1.15 });
const J = human(S.U, { h: .064, z: -.086, pose: 'sit', col: '#120a08', rim: .95, two: true }); S.scene.add(J.g);
J.set({ x: JX, y: GROUND, flip: true, a: .35, a2: .5 });
const M = human(S.U, { h: .066, z: -.078, pose: 'kneel', col: '#0e0806', rim: .85, veil: true, two: true }); S.scene.add(M.g);
M.set({ x: MX, y: GROUND, rot: -.1, a: 1.25, a2: 1.0 });
const [hx, hy] = M.hand(.98), FX = hx + .002;
const F = frasco(S.U, { h: .016, z: -.0765 }); S.scene.add(F.g);
F.set({ x: FX, y: hy - .006, rot: -.25, crack: 1, shine: 1.5, off: 1, neckGone: true });
// gold rising from the crack: the light behind the paper, centred just above the jar, shows through the wall
S.U.uLight.value.set(FX, hy + .012, -.08); S.U.uLightR.value = .045; S.U.uLit.value = 2.2; R.trans({ wall: .45, recess: .3 });
const C = clawd(S.U, { u: .0033, z: -.126, glow: .42 }); S.scene.add(C.g);
C.set({ x: CL.x - .003, y: CL.y, look: .7, lookY: -.7, k: 1.1 });
aim(S.cam, [-.001, -.004, .37, -.001, -.004, -.12], 0, { hand: 0 });

window.render = () => {
  pipe.shot(S.scene, S.cam, { focus: S.cam.position.z + .1, aper: 2, maxCoc: 4, bloom: { strength: .4, radius: .6, threshold: 1.0 } }, pipe.rtA);
  pipe.final({ vig: .55, sat: 1.02, contrast: .14, lift: [.012, .006, .004], gain: [1.04, 1, .95] });
};
window.READY = true;
