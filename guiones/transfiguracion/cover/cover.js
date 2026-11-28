// Cover: the moment of P5. On the summit, under a dark violet sky, Jesús as a shape of white-gold light, Moisés and Elías in silhouette with a lit edge,
// and at their feet the three pale outlines of tents. Pedro stands with his back to us, arms open; Santiago and Juan kneel beside him. Clawd big in front,
// lower left (above the bottom 20 %), three-quarter toward the light, an arm before his eyes. The hook sits on the dark upper sky; the glow stays below it.
import * as THREE from 'three';
import { Pipe } from '../src/post.js';
import { stage, aim } from '../src/stage.js';
import { clawd, human } from '../src/actors.js';
import { peak, summitCast, backTrio, glow, PAL, TOP, TZ, LEDGE, LZ, DX, TX, camY } from '../src/shots.js';
import { tent } from '../src/actors.js';

const Q = new URLSearchParams(location.search), SSAA = +(Q.get('ssaa') || 2), W = 1080, H = 1920;
window.DUR = 1;
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
renderer.setPixelRatio(SSAA); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.NoToneMapping; renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const pipe = new Pipe(renderer, W, H, SSAA);
await Promise.all([document.fonts.load('900 40px Cinzel', 'ÍA'), document.fonts.load('800 40px Cinzel', 'A')]);

const S = stage({ light: [0, TOP + .045, TZ - .01], lightR: .08, lightCol: '#ffe6b8', key: 1.0, keyCol: '#ffe2b8', amb: .3, ambCol: '#8a7aa0', floor: .2 });
const P = peak(S);
P.paint(PAL.violet, PAL.warm, [0, .35, .55, .3, .1], [1, 1, 1, .9, .85]); P.sky(1, 0);
const C3 = summitCast(S);
C3.J.cal(1, 1.25); C3.J.lit(.7); C3.Mo.fade(1); C3.El.fade(1); C3.Mo.lit(1.5); C3.El.lit(1.5);
const halo = glow(.15, .17, '#ffe9b8', 1.8); halo.position.set(0, TOP + .045, TZ - .012); halo.userData.set(.6); S.add(halo);
TX.forEach(x => { const q = tent(S.U, { s: .034, z: TZ + .012 }); S.add(q.m); q.set(x, TOP - .001, 1, 1.15); });
const XS = [-.026, .012, .048], D = backTrio(S, '#06050f', 'backkneel', undefined, XS); D[1].g.visible = false; D[0].lit(.6); D[2].lit(.6);
const Pe = human(S.U, { h: .07, z: LZ + .004, pose: 'front', col: '#06050f', rim: .5, edge: '#ffe2a8', two: true }); S.scene.add(Pe.g);
Pe.set({ x: XS[1], y: LEDGE + .001, a: .95, a2: -1.3 }); Pe.lit(.8);
const C = clawd(S.U, { u: .0036, z: -.045, glow: .5 }); S.scene.add(C.g);
// the camera: the ledge low in the frame, so the dark sky above the heads holds the hook
const z = .72, d = z - LZ, cy = camY(LEDGE, .72, d), cx = .002;
aim(S.cam, [cx, cy, z, cx, cy + .006, LZ], 0, { hand: 0 });
C.set({ x: -.058, y: LEDGE - .009, aL: .3, aR: 2.1, look: .8, blink: 1, k: 1.05 });
S.U.uLit.value = 1.3;

window.render = () => {
  pipe.shot(S.scene, S.cam, { focus: d, aper: 3, maxCoc: 2, bloom: { strength: .4, radius: .6, threshold: .95 } }, pipe.rtA);
  pipe.final({ vig: .45, sat: 1.04, lift: [.008, .003, .012], gain: [1.04, 1, .96] });
};
window.READY = true;
