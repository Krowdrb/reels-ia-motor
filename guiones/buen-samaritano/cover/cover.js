// Portada: el camino de noche; Clawd grande junto al herido; dos siluetas que se alejan; el samaritano con su asno a contraluz del primer oro.
import * as THREE from 'three';
import { Pipe } from '../src/post.js';
import { stage, aim } from '../src/stage.js';
import { skyPanel } from '../src/paper.js';
import { clawd, human, donkey } from '../src/actors.js';
import { ridge, ry, ROAD, PAL } from '../src/shots.js';

const Q = new URLSearchParams(location.search), SSAA = +(Q.get('ssaa') || 2), W = 1080, H = 1920;
window.DUR = 1;
if (innerWidth !== 1080) document.body.style.zoom = innerWidth / 1080;
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
renderer.setPixelRatio(SSAA); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.NoToneMapping; renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const pipe = new Pipe(renderer, W, H, SSAA);
await Promise.all([document.fonts.load('900 40px Cinzel', 'PASARON'), document.fonts.load('800 40px Cinzel', '¿CUÁL')]);

const p = PAL.night;
const S = stage({ light: [.045, .02, -.12], lightR: .07, lightCol: '#f3dca0', key: .6, keyCol: '#c8d4f0', amb: .22, ambCol: p.amb, floor: .28 });
S.add(skyPanel({ w: 1.2, h: 1, z: -.16, stops: [[0, '#03061a'], [.5, '#18234e'], [.62, '#2c3870'], [1, '#3c4a86']], stars: 160, starMinY: .06, seed: 3,
  extra: x => { const g = x.createRadialGradient(.046, .03, 0, .046, .03, .07); g.addColorStop(0, 'rgba(246,226,170,1)'); g.addColorStop(.35, 'rgba(230,194,122,.75)'); g.addColorStop(1, 'rgba(60,74,134,0)'); x.fillStyle = g; x.fillRect(-.03, -.05, .16, .16); } }));
const r1 = { base: .026, amp: .008, f: 17, ph: 1, k: .55 }, r2 = { base: .006, amp: .006, f: 23, ph: 2.2, k: .12 };
ridge(S, -.14, '#4e5e98', r1, .7, { rim: .4 }); ridge(S, -.12, '#34407a', r2, .35, { rim: .9 }); ridge(S, -.105, '#3e4a80', ROAD.r3, .25, { rim: .6 });
ridge(S, -.09, '#0d1228', ROAD.r4, .08, { rim: .55 }); ridge(S, -.03, '#03050d', ROAD.rf, .02, { rim: .3 });
// dos que se alejan, por las revueltas del fondo
[[-.022, -.137, r1, 'tall', .012], [-.05, -.117, r2, 'low', .014]].forEach(([x, z, r, hat, h]) => { const F = human(S.U, { h, z, col: '#0a0e20', rim: .4, hat }); S.scene.add(F.g); F.set({ x, y: ry(r, x), face: -1, a: -.2 }); });
// el samaritano y su asno, a contraluz
const Sm = human(S.U, { h: .03, z: -.117, col: '#05060c', rim: 1, hat: 'wrap' }); S.scene.add(Sm.g); Sm.set({ x: .034, y: ry(r2, .034), face: -1, a: .3 });
const D = donkey(S.U, { L: .024, z: -.118, col: '#05060c', rim: 1 }); S.scene.add(D.g); D.set({ x: .053, y: ry(r2, .053), face: -1 });
const Wd = human(S.U, { h: .05, z: -.087, pose: 'lie', col: '#03040a', rim: 1 }); S.scene.add(Wd.g); Wd.set({ x: .034, y: ry(ROAD.r4, .034) - .0004, face: -1, a: -1.45 });
const C = clawd(S.U, { u: .0036, z: -.062, glow: .6 }); S.scene.add(C.g);
C.set({ x: -.03, y: ry(ROAD.r4, -.03) - .0003, look: .9, aL: 0, aR: .3, k: 1.2 });
aim(S.cam, [0, .005, .42, 0, .005, -.08], 0, { hand: 0 });

window.render = () => {
  pipe.shot(S.scene, S.cam, { focus: .5, aper: 0, maxCoc: 0, bloom: { strength: .4, radius: .6, threshold: 1.0 } }, pipe.rtA);
  pipe.final({ vig: .45, sat: 1.04 });
};
window.READY = true;
