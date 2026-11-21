// Cover: the hook and the climax in one picture. On top, the night of the house (dark violet) carries the hook; on its ledge, small and still,
// Pedro leaning toward Jesús beside the lamp. Below, the mountain of plain paper coins comes apart in gold light (S7), and in front Clawd, large,
// lifts his paws, counting (S1). God is only light. Nothing written in the picture: the hook is the HTML title over the violet.
import * as THREE from 'three';
import { Pipe } from '../src/post.js';
import { aim } from '../src/stage.js';
import { skyPanel, burst } from '../src/paper.js';
import { clawd, mk, tint, lamp } from '../src/actors.js';
import { PAL, pstage, mountain, PERSON, GROUND } from '../src/shots.js';

const Q = new URLSearchParams(location.search), SSAA = +(Q.get('ssaa') || 2) * (innerWidth / 1080), W = 1080, H = 1920;
window.DUR = 1;
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
renderer.setPixelRatio(SSAA); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.NoToneMapping; renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const pipe = new Pipe(renderer, W, H, SSAA);
await Promise.all([document.fonts.load('900 40px Cinzel', '¿PERDONAR'), document.fonts.load('italic 500 40px Playfair', 'Mateo')]);

const G = PAL.gold, S = pstage(G, { light: [.02, -.03, -.1], lightR: .12, lightCol: '#ffd98a' });
// the gold hall behind: a bright back sheet and the dark front floor
S.add(skyPanel({ w: .5, h: .4, y: 0, z: -.17, stops: [[0, '#f6dfa4'], [.5, '#f0c878'], [1, '#c98f48']], gain: 1.2 }));
const lay = o => S.add(mk(S.U, o));
lay({ w: .5, h: .3, y: GROUND - .15 + .004, z: -.045, col: G.front, trans: .03, ppm: 1600, finish: { rim: .6, rimPx: 4, under: .3 }, draw: x => {
  x.beginPath(); x.moveTo(-.25, -.15); for (let u = -.25; u <= .25; u += .002) x.lineTo(u, .146 + .0008 * Math.sin(u * 70)); x.lineTo(.25, -.15); x.closePath(); x.fill();
} });
// the debt coming apart: the front heaps already gone below the floor, the rest translucent and gilded, sliding
const M = mountain(S, { x: .03, scale: .5 });
const slid = [1, .55, .25, .08, 0];
M.forEach((m, i) => { m.position.y = m.userData.y0 - slid[i] * (m.userData.h + .02); m.visible = slid[i] < .99; m.userData.m.material.userData.u.uTrans.value = .55 + i * .06; tint(m.userData.m, ['#e6c27a', '#e0b870', '#d9b46c', '#d0a862', '#c89e5a'][i]); });
S.U.uBeamO.value.set(.03, .07, 1.3); S.U.uBeamD.value.set(-Math.PI / 2 - .2, .2, .3); S.U.uBeamCol.value.set('#ffd99a');
const ray = burst(.16, .24, '#ffd79a'); ray.position.set(.035, GROUND - .01, -.115); ray.userData.set(1.2); S.add(ray);
// the night of the house on top: a violet panel with the lamp's warm glow, a ragged dark ledge, Pedro, Jesús and the lamp, small
const LX = -.026, LY = .004, ZT = -.028;
S.add(skyPanel({ w: .3, h: .16, y: LY + .078, z: ZT - .003, stops: [[0, '#0c0a1a'], [.55, '#1a1530'], [1, '#2a2040']], gain: 1, extra: x => {
  const g = x.createRadialGradient(LX + .003, -.066, 0, LX + .003, -.066, .03);
  g.addColorStop(0, 'rgba(255,200,120,.75)'); g.addColorStop(.4, 'rgba(200,120,80,.28)'); g.addColorStop(1, 'rgba(60,40,70,0)');
  x.fillStyle = g; x.fillRect(-.15, -.08, .3, .16);
} }));
lay({ w: .3, h: .03, y: LY - .006, z: ZT + .001, col: '#0a0812', trans: .03, ppm: 3000, finish: { rim: .7, rimPx: 4, under: .4, rimCol: 'rgba(255,214,150,.7)' }, draw: x => {
  x.beginPath(); x.moveTo(-.15, -.004); for (let u = -.15; u <= .15; u += .002) x.lineTo(u, .006 + .0004 * Math.sin(u * 300)); for (let u = .15; u >= -.15; u -= .002) x.lineTo(u, .0005 + .0009 * Math.sin(u * 90 + 1) + .0005 * Math.sin(u * 230)); x.closePath(); x.fill();
} });
const fig = { fig: '#08060e' };
const Pe = PERSON(S, fig, { h: .03, z: ZT + .0015, two: true, rim: .9 }); Pe.set({ x: LX - .02, y: LY, a: 1.1, a2: .15, rot: -.08 });
const Je = PERSON(S, fig, { h: .031, z: ZT + .0015, pose: 'sit', rim: .9 }); Je.set({ x: LX + .02, y: LY, a: .3, flip: true });
const La = lamp(S.U, { s: .0075, z: ZT + .0016, col: '#08060e', glow: 3 }); La.g.position.set(LX - .001, LY, ZT + .0016); S.scene.add(La.g); La.set({ lit: 1.4 });
// Clawd, large, in front at the lower left, both paws up, counting
const C = clawd(S.U, { u: .0036, z: -.01, glow: .45 }); S.scene.add(C.g);
C.set({ x: -.026, y: -.056, aL: 2.4, aR: 1.8, rot: .05, look: .7, k: 1 });
C.armL.position.y += .0036 * 3; C.armR.position.y += .0036 * 1.5;   // paws up high, counting
aim(S.cam, [0, 0, .42, 0, 0, -.08], 0, { hand: 0 });

window.render = () => {
  pipe.shot(S.scene, S.cam, { focus: S.cam.position.z + .02, aper: 5, maxCoc: 5, bloom: { strength: .4, radius: .6, threshold: 1.0 } }, pipe.rtA);
  pipe.final({ vig: .45, sat: 1.05, contrast: .12, lift: [.008, .004, .004], gain: [1.04, 1, .95] });
};
window.READY = true;
