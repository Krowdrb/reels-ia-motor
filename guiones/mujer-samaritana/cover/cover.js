// Cover: the well at the instant of the climax. Clawd large on the brocal, Jesus seated at the other side, the woman with her jar,
// and between them a column of gold rising from the well. Noon sky darkened to brown at the top for the hook. God is only light.
import * as THREE from 'three';
import { Pipe } from '../src/post.js';
import { stage, aim } from '../src/stage.js';
import { burst } from '../src/paper.js';
import { clawd, human, cantaro } from '../src/actors.js';
import { well, PAL, BTOP, GROUND } from '../src/shots.js';

const Q = new URLSearchParams(location.search), SSAA = +(Q.get('ssaa') || 2) * (innerWidth / 1080), W = 1080, H = 1920;
window.DUR = 1;
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
renderer.setPixelRatio(SSAA); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.NoToneMapping; renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const pipe = new Pipe(renderer, W, H, SSAA);
await Promise.all([document.fonts.load('900 40px Cinzel', 'ÍÁ¿'), document.fonts.load('italic 600 40px Playfair', 'Juan 4')]);

const S = stage({ light: [.011, -.01, -.1], lightR: .12, lightCol: '#ffd98a', key: 1.6, keyCol: '#ffe6c0', keyPos: [-.06, .42, .2], keyTarget: [0, -.05, -.08], amb: .4, ambCol: '#c8a47c', floor: .3, shadowR: 5 });
const P = { ...PAL.gold, sky: [[0, '#1c120a'], [.5, '#33220f'], [.545, '#5e4428'], [.585, '#cfa463'], [.612, '#f6dca0'], [1, '#fff0c8']] };
well(S, { pal: P, bx: [-.046, .034] });
const Wm = human(S.U, { h: .074, z: -.07, pose: 'stand', col: P.fig, rim: .95, veil: true }); S.scene.add(Wm.g); Wm.set({ x: -.046, y: GROUND - .002, a: 1.25 });
const jar = cantaro(S.U, { h: .02, z: -.034 }); S.scene.add(jar); jar.position.set(.03, BTOP + .0005, -.034);
const J = human(S.U, { h: .074, z: -.066, pose: 'sit', col: P.fig, rim: .95 }); S.scene.add(J.g); J.set({ x: .05, y: GROUND - .002, a: .5, flip: true });
const ray = burst(.08, .26, '#ffd79a'); ray.position.set(.011, BTOP + .13, -.042); ray.userData.set(1.7); S.add(ray);
const C = clawd(S.U, { u: .0031, z: -.032, glow: .45 }); S.scene.add(C.g);
C.set({ x: -.024, y: BTOP - 2 * .0031 + .0004, look: .8, aL: .2, aR: 1.5, k: 1 });
aim(S.cam, [-.002, -.01, .47, -.002, -.01, -.08], 0, { hand: 0 });

window.render = () => {
  pipe.shot(S.scene, S.cam, { focus: S.cam.position.z + .034, aper: 6, maxCoc: 6, bloom: { strength: .42, radius: .6, threshold: 1.0 } }, pipe.rtA);
  pipe.final({ vig: .5, sat: 1.05, contrast: .12, lift: [.012, .007, 0], gain: [1.04, 1, .93] });
};
window.READY = true;
