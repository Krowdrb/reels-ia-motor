// Cover: Clawd big at the foot of the giant half-built hull, arms up, looking up; Noah tiny on the high scaffold; night-blue sky. Same paper engine as the film.
import * as THREE from 'three';
import { Pipe } from '../src/post.js';
import { stage, aim } from '../src/stage.js';
import { clawd, lantern } from '../src/actors.js';
import { nightSky, land, workSite } from '../src/shots.js';

const Q = new URLSearchParams(location.search), SSAA = +(Q.get('ssaa') || 2), W = 1080, H = 1920;
window.DUR = 1;
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
renderer.setPixelRatio(SSAA); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.NoToneMapping; renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const pipe = new Pipe(renderer, W, H, SSAA);
await Promise.all([document.fonts.load('900 40px Cinzel', '300'), document.fonts.load('800 40px Cinzel', 'A'), document.fonts.load('italic 500 40px Playfair', 'Génesis')]);

const S = stage({ light: [-.03, .1, -.1], lightR: .24, lightCol: '#9fb4e0', key: 1.2, keyCol: '#d6def5', amb: .32, ambCol: '#5a6fa8', floor: .35 });
nightSky(S, { moonAt: [-.07, .2] });
land(S, { z: -.145, col: '#2a3966', top: -.03, amp: .014, len: .3, ph: 1, trans: .5, w: 1.2 });
const { N, ny } = workSite(S, { noeLevel: 0 });
N.set({ x: .062, y: ny, a: 1.9, rot: -.03 });
land(S, { z: -.075, col: '#121a30', top: -.063, amp: .003, len: .15, ph: 2, w: .8 });
const lan = lantern(S.U, { h: .016, z: -.058 }); lan.position.set(-.022, -.064, -.058); S.add(lan);
const C = clawd(S.U, { u: .0034, z: -.056 }); S.scene.add(C.g);
C.set({ x: .0, y: -.062, look: .3, lookY: 1, aL: 2.3, aR: 2.2, k: 1.15 });
land(S, { z: -.032, col: '#04060c', top: -.071, amp: .006, len: .12, ph: 4, w: .6, ppm: 1800 });
aim(S.cam, [.016, -.06, .64, .016, .008, -.08], 0, { hand: 0 });

window.render = () => {
  pipe.shot(S.scene, S.cam, { focus: S.cam.position.z + .056, aper: 6, maxCoc: 6, bloom: { strength: .38, radius: .6, threshold: 1.0 } }, pipe.rtA);
  pipe.final({ vig: .5, sat: 1.04 });
};
window.READY = true;
