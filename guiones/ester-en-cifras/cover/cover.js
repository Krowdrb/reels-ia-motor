// Cover: the threshold of the court (S8–S9 at cover scale). Clawd big at the bottom left, looking at us with an arm pointing into the court;
// Esther from behind, crown and long robe, about to go in; far away on his dais the king holds out the golden sceptre toward her: the brightest point,
// the one gold. The dark plum arches above leave room for the hook. Same paper engine as the film; God is never drawn.
import * as THREE from 'three';
import { Pipe } from '../src/post.js';
import { stage, aim } from '../src/stage.js';
import { clawd, human } from '../src/actors.js';
import { corte, kingFront, front, PAL, G, camY } from '../src/shots.js';

const Q = new URLSearchParams(location.search), SSAA = +(Q.get('ssaa') || 2), W = 1080, H = 1920;
window.DUR = 1;
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
renderer.setPixelRatio(SSAA); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.NoToneMapping; renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const pipe = new Pipe(renderer, W, H, SSAA);
await Promise.all([document.fonts.load('900 40px Cinzel', 'ESTER: 30 DÍAS'), document.fonts.load('800 40px Cinzel', 'SIN LLAMARLA')]);

const P = { ...PAL.court, wall: '#5a4664', c1: '#3e3248', c2: '#241a2c', c3: '#120c16', dais: '#5a4a64' };
const S = stage({ light: [.02, -.02, -.1], lightR: .09, lightCol: '#ffd98a', key: 1.0, keyCol: '#ffe0b8', amb: .22, ambCol: '#7a6a8e', floor: .3 });
corte(S, P, { pairs: [[-.13, P.c1, .05, .5], [-.1, P.c2, .062, .3], [-.07, P.c3, .08, .12]] });
const Kg = kingFront(S, P, { x: .032, h: .04, z: -.155, dais: .03 });
Kg.sc.rotation.z = -.75; Kg.sc.scale.setScalar(1.7); Kg.sc.userData.set(4.5);   // the sceptre held out toward her
const Es = human(S.U, { h: .07, z: -.09, col: '#06040a', pose: 'back', crown: true, rim: 1, two: true }); S.scene.add(Es.g);
Es.set({ x: -.01, y: G, a: .08, a2: .08 });
const C = clawd(S.U, { u: .0036, z: -.05 }); S.scene.add(C.g);
C.set({ x: -.04, y: G, look: 0, lookY: 0, aR: 2.2, aL: 0, k: 1.15 });
const fr = front(S, '#08050a');
const cz = .5, cy = camY(cz, G, -.05, .235);
aim(S.cam, [0, cy, cz, 0, cy, -.08], 0, { hand: 0 });
fr.follow(.19);

window.render = () => {
  pipe.shot(S.scene, S.cam, { focus: S.cam.position.z + .07, aper: 5, maxCoc: 6, bloom: { strength: .42, radius: .6, threshold: 1.0 } }, pipe.rtA);
  pipe.final({ vig: .45, sat: 1.05 });
};
window.READY = true;
