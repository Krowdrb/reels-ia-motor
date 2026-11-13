// Cover: the signature shot. Clawd holds the open scroll that shines in gold; behind him, on the left, altars in violet shadow with smoke;
// on the right, the temple in gold; Solomon between them, facing the altars. Same paper engine as the film; God is only light.
import * as THREE from 'three';
import { Pipe } from '../src/post.js';
import { stage, aim } from '../src/stage.js';
import { skyPanel, burst } from '../src/paper.js';
import { mk, clawd, human, waveFill, scrollOpen, fire, smoke, altar, temple } from '../src/actors.js';

const Q = new URLSearchParams(location.search), SSAA = +(Q.get('ssaa') || 2), W = 1080, H = 1920;
window.DUR = 1;
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
renderer.setPixelRatio(SSAA); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.NoToneMapping; renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const pipe = new Pipe(renderer, W, H, SSAA);
await Promise.all([document.fonts.load('900 40px Cinzel', '3.000'), document.fonts.load('800 40px Cinzel', 'ÓA')]);

const S = stage({ light: [.01, -.045, -.1], lightR: .11, lightCol: '#ffd88a', key: 1.1, keyCol: '#ffe8c8', amb: .3, ambCol: '#8a7a9a', floor: .3 });
const lay = o => S.add(mk(S.U, o));
// sky: violet on the left, gold on the right, dark at the top where the hook sits
S.add(skyPanel({ w: .6, h: .6, z: -.17, stops: [[0, '#0d0a1c'], [.35, '#2a2240'], [.62, '#5a4d6c'], [1, '#6a5a78']], extra: x => {
  const g = x.createLinearGradient(-.12, 0, .12, 0); g.addColorStop(0, 'rgba(60,50,90,0)'); g.addColorStop(.55, 'rgba(240,200,120,0)'); g.addColorStop(1, 'rgba(246,214,140,.85)');
  x.fillStyle = g; x.fillRect(-.3, -.3, .6, .27);
  const v = x.createLinearGradient(0, .3, 0, -.05); v.addColorStop(0, 'rgba(8,6,18,.95)'); v.addColorStop(.55, 'rgba(8,6,18,.6)'); v.addColorStop(1, 'rgba(8,6,18,0)');
  x.fillStyle = v; x.fillRect(-.3, -.05, .6, .35);
} }));
const ridge = (z, col, base, amp, len, ph, tr) => lay({ w: .6, h: .4, y: -.2, z, col, trans: tr, ppm: 2400, finish: { rim: .5 }, draw: x => { x.translate(0, .2); waveFill(x, { x0: -.3, x1: .3, base, amp, len, ph, peak: 1.3 }); } });
ridge(-.15, '#4a3f5e', -.03, .012, .2, 1, .5);
const T = temple(S.U, { w: .042, z: -.135, col: '#d8bc72', glow: 2.2, glowCol: '#ffcf70' }); T.position.x = .048; T.position.y += -.03; S.add(T);
const hillR = lay({ w: .2, h: .2, x: .09, y: -.13, z: -.13, col: '#c8a660', trans: .6, ppm: 3000, finish: { rim: .55 }, draw: x => { x.translate(-.09, .13); x.beginPath(); x.moveTo(-.01, -.3); x.lineTo(-.01, -.034); x.quadraticCurveTo(.06, -.028, .2, -.03); x.lineTo(.2, -.3); x.closePath(); x.fill(); } });
ridge(-.115, '#2c2440', -.042, .012, .2, 2.4, .3);
for (const [ax, s] of [[-.062, .03], [-.03, .025]]) {
  const a = altar(S.U, { w: s, z: -.11, col: '#5a4c70' }); a.position.x = ax; a.position.y += -.044; S.add(a);
  const top = -.044 + s * .3264;
  const sm = smoke(S.U, { h: .06, w: .011, z: -.112, seed: Math.round(ax * 100) + 9, col: '#6c6676' }); sm.position.set(ax, top, -.112); S.add(sm);
  const f = fire(S.U, { s: s * .38, z: -.109, col: '#b8905a', glow: 1.4 }); f.g.position.set(ax, top, -.109); f.set(1, .3); S.scene.add(f.g);
}
const Sol = human(S.U, { h: .07, z: -.095, col: '#0a0812', rim: .7, crown: true }); S.scene.add(Sol.g);
Sol.set({ x: .016, y: -.05, rot: .07, a: .1 }); Sol.g.scale.x = -1;   // facing the altars on the left
ridge(-.09, '#151020', -.056, .004, .3, .8, .1);
const halo = burst(.13, .13, '#ffd88a'); halo.position.set(.004, -.064 + 2.7 * .0038 + .065, -.066); halo.userData.set(.55); S.add(halo);   // the light of the scroll rising behind Clawd
const u = .0038;
const C = clawd(S.U, { u, z: -.06, glow: .45 }); S.scene.add(C.g);
const open = scrollOpen(S.U, { w: .058, h: .015 }); open.position.set(0, 2.7 * u, .0014); open.material.emissiveIntensity = 1.0; C.g.add(open);
C.set({ x: .004, y: -.064, aL: .6, aR: .6, look: 0, lookY: -.3, k: 1.2 });
lay({ w: .6, h: .4, y: -.2, z: -.045, col: '#07050c', trans: .02, ppm: 1800, finish: { rim: .5 }, draw: x => { x.translate(0, .2); waveFill(x, { x0: -.3, x1: .3, base: -.075, amp: .005, len: .2, ph: 2, peak: 1.3 }); } });
aim(S.cam, [0, 0, .42, 0, 0, -.08], 0, { hand: 0 });

window.render = () => {
  pipe.shot(S.scene, S.cam, { focus: S.cam.position.z + .06, aper: 7, maxCoc: 6, bloom: { strength: .42, radius: .6, threshold: 1.0 } }, pipe.rtA);
  pipe.final({ vig: .45, sat: 1.05 });
};
window.READY = true;
