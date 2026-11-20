// Cover: the climax and the hook in one picture. The night lid on top (indigo, stars cut through it) carries the hook;
// below, the paper eye is open: the gold well, Agar kneeling with her son at its side, and Clawd large in front, looking at the light. God is only light.
import * as THREE from 'three';
import { Pipe } from '../src/post.js';
import { aim } from '../src/stage.js';
import { burst } from '../src/paper.js';
import { clawd, pozo } from '../src/actors.js';
import { dunes, PAL, GROUND, eyelids, pstage, AGAR, BOY } from '../src/shots.js';

const Q = new URLSearchParams(location.search), SSAA = +(Q.get('ssaa') || 2) * (innerWidth / 1080), W = 1080, H = 1920;
window.DUR = 1;
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
renderer.setPixelRatio(SSAA); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.NoToneMapping; renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const pipe = new Pipe(renderer, W, H, SSAA);
await Promise.all([document.fonts.load('900 40px Cinzel', 'AGRÍ'), document.fonts.load('800 40px Cinzel', 'A'), document.fonts.load('italic 500 40px Playfair', 'Génesis')]);

const P = PAL.gold, S = pstage(P, { light: [.0, .0, -.1], lightR: .3 });
dunes(S, P, { farY: -.01, slope: .1 });
const Wl = pozo(S.U, { r: .02, z: -.072, col: P.front }); Wl.g.position.set(.013, GROUND - .006, -.072); S.scene.add(Wl.g);
Wl.wat.material.userData.u.uGlowLit.value = 1.3; Wl.ring.material.userData.u.uTrans.value = .25;
const A = AGAR(S, P, { pose: 'kneel', z: -.068, rim: .95, h: .058 }); A.set({ x: .033, y: GROUND - .006, a: 1.7, rot: -.04 });

const B = BOY(S, P, { z: -.066, rim: .95, h: .044 }); B.set({ x: .052, y: GROUND - .006, a: .5, rot: .06, flip: true });
const ray = burst(.09, .17, '#ffd79a'); ray.position.set(.013, GROUND - .006 + Wl.top + .085, -.073); ray.userData.set(1.3); S.add(ray);
const L = eyelids(S, { col: '#0b1028', stars: 160 });
const cy = -.01;
L.up.position.set(0, cy - .028, -.012); L.lo.position.set(0, cy - .002, -.012);
const C = clawd(S.U, { u: .0031, z: -.006, glow: .45 }); S.scene.add(C.g);
C.set({ x: -.025, y: cy - .051, look: .9, tuck: .25, k: 1 });
aim(S.cam, [0, cy, .42, 0, cy, -.08], 0, { hand: 0 });

window.render = () => {
  pipe.shot(S.scene, S.cam, { focus: S.cam.position.z + .06, aper: 6, maxCoc: 5, bloom: { strength: .4, radius: .6, threshold: 1.0 } }, pipe.rtA);
  pipe.final({ vig: .45, sat: 1.05, contrast: .12, lift: [.006, .004, .01], gain: [1.04, 1, .95] });
};
window.READY = true;
