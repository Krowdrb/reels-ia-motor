// Cover: the climax (S11). The workshop of Nazaret below, its front translucent in gold; inside, José standing, María with the child at his side.
// Above, the four veils at four depths, their holes in line, and the gold beam that goes through them and comes down to him. Clawd big in front,
// lower left, three-quarter toward the light, one arm up, counting. The indigo sky at the top keeps the hook legible. God is only light.
import * as THREE from 'three';
import { Pipe } from '../src/post.js';
import { stage, aim } from '../src/stage.js';
import { clawd, human } from '../src/actors.js';
import { village, veils4, shaft, glow, G, camY, SHOP } from '../src/shots.js';

const Q = new URLSearchParams(location.search), SSAA = +(Q.get('ssaa') || 2), W = 1080, H = 1920;
window.DUR = 1;
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
renderer.setPixelRatio(SSAA); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.NoToneMapping; renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const pipe = new Pipe(renderer, W, H, SSAA);
await Promise.all([document.fonts.load('900 40px Cinzel', 'ÑA'), document.fonts.load('800 40px Cinzel', 'A')]);

// the camera sits on the axis of the four holes: the light lines up only from here
const CAM = { d: .8, cx: 0, f: .74, rel: .27, size: .8, hole: 1.7 };
const S = stage({ light: [SHOP.x, G + .04, -.15], lightR: .14, lightCol: '#ffd88f', key: 1.3, keyCol: '#ffe0b0', amb: .3, ambCol: '#9a8a90', floor: .25 });
const V = village(S);
V.paint([.55, .75, .85, .7, .45], [.75, .7, .85, .95, 1]); V.wins(.5); V.light(1.1, .4);
V.sky.material.color.setScalar(1.1);
V.front.material.opacity = .45; V.front.material.userData.u.uTrans.value = .7;
const F = veils4(S, CAM);
F.src.userData.set(.5);
F.Vs.forEach(v => { v.set(1, 1, .3, .75); v.lightG.userData.set(.08); v.core.userData.set(.12); });
const beam = shaft(.09, .13, '#ffd88f', .2); S.add(beam);
const [hx, hy] = F.Vs[0].hole; beam.position.set((hx + SHOP.x) / 2, hy - .062, SHOP.z + .012); beam.userData.set(.55);
const pool = glow(.12, .08, '#ffd88f', 1.6); pool.position.set(SHOP.x, G + .02, SHOP.z + .004); pool.userData.set(.45); S.add(pool);
const J = human(S.U, { h: .07, z: SHOP.z - .016, col: '#05070f', rim: .55, edge: '#ffd27a' }); S.scene.add(J.g);
J.set({ x: SHOP.door[0] - .008, y: G + .001, a: .15 }); J.lit(1.3);
const M = human(S.U, { h: .064, z: SHOP.z - .02, pose: 'carry', col: '#05070f', rim: .5, edge: '#ffd27a' }); S.scene.add(M.g);
M.set({ x: SHOP.door[0] + .014, y: G + .001, a: -.9 }); M.g.scale.x = -1; M.lit(1.1);
const C = clawd(S.U, { u: .0034, z: -.03, glow: .45 }); S.scene.add(C.g);
C.set({ x: -.052, y: G - .001, look: .7, aL: .3, aR: 2.1, blink: 1, k: 1.05 });
const yC = camY(G, CAM.f, CAM.d);
aim(S.cam, [CAM.cx, yC, SHOP.z + CAM.d, CAM.cx, yC, SHOP.z], 0, { hand: 0 });
S.U.uLit.value = 1.3;

window.render = () => {
  pipe.shot(S.scene, S.cam, { focus: CAM.d, aper: 3, maxCoc: 2, bloom: { strength: .34, radius: .6, threshold: 1.0 } }, pipe.rtA);
  pipe.final({ vig: .42, sat: 1.06, lift: [.012, .004, 0], gain: [1.05, 1, .93] });
};
window.READY = true;
