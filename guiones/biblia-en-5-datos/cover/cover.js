// Cover: shot 1, closer. Clawd big on the scribe's desk beside the lit lamp and the open scroll, looking back along the row of lamps
// that goes off into the blue (the number seen, never drawn). Same paper engine as the film; nothing but the hook is written.
import * as THREE from 'three';
import { Pipe } from '../src/post.js';
import { stage, aim } from '../src/stage.js';
import { clawd } from '../src/actors.js';
import { scribeRoom } from '../src/shots.js';

const Q = new URLSearchParams(location.search), SSAA = +(Q.get('ssaa') || 2), W = 1080, H = 1920;
window.DUR = 1;
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
renderer.setPixelRatio(SSAA); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.NoToneMapping; renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const pipe = new Pipe(renderer, W, H, SSAA);
await Promise.all([document.fonts.load('900 40px Cinzel', '40 AÑOS'), document.fonts.load('800 40px Cinzel', '¿CUÁNTOS')]);

const S = stage({ light: [.04, -.022, -.1], lightR: .09, lightCol: '#ffbe72', key: .5, keyCol: '#c8d4ff', amb: .18, ambCol: '#5a6ca8', floor: .12 });
const R = scribeRoom(S);
R.rows.forEach(m => { m.material.userData.u.uGlowLit.value = 1.1; });
R.lamp.set(1, .3); R.pose(.3);
S.U.uLight.value.set(.04, -.022, -.1); S.U.uLit.value = 1.5;
const C = clawd(S.U, { u: .0042, z: -.056, glow: .5 }); S.scene.add(C.g);
C.set({ x: -.029, y: -.044, look: .9, lookY: .7, aR: 0, k: 1.15 });
aim(S.cam, [-.008, -.004, .4, -.008, .0, -.08], 0, { hand: 0 });

window.render = () => {
  pipe.shot(S.scene, S.cam, { focus: S.cam.position.z + .056, aper: 7, maxCoc: 6, bloom: { strength: .45, radius: .6, threshold: 1.0 } }, pipe.rtA);
  pipe.final({ vig: .5, sat: 1.05 });
};
window.READY = true;
