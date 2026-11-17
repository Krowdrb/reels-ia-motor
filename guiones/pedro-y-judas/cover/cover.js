// Cover: two fires, one above the other. Above, the courtyard at midnight (Pedro hooded at the brazier, the full moon); below, the gold shore
// (the embers, Jesus seated with a rim of light, Pedro facing him with his head up), Clawd large at the left looking at the viewer,
// three dull silver coins on the ground at the right (Judas, without a figure). Same paper engine as the film; God is only light.
import * as THREE from 'three';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { Pipe } from '../src/post.js';
import { stage, aim } from '../src/stage.js';
import { clawd, human, brasas, moneda, tint } from '../src/actors.js';
import { patio, lago, PN, GD, GROUND, HZ, camY } from '../src/shots.js';

const Q = new URLSearchParams(location.search), SSAA = +(Q.get('ssaa') || 2), W = 1080, H = 1920;
window.DUR = 1;
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
renderer.setPixelRatio(SSAA); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.NoToneMapping; renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const pipe = new Pipe(renderer, W, H, SSAA);
await Promise.all([document.fonts.load('900 40px Cinzel', 'ÓA'), document.fonts.load('italic 500 40px Playfair', 'Mateo')]);

// —— A: the courtyard at midnight, its fire high in the frame ——
const A = stage({ light: [.01, -.03, -.1], lightR: .13, lightCol: '#ffd8a0', key: .6, keyCol: '#ffd9b0', amb: .2, ambCol: '#8a78a8', floor: .3 });
const P = patio(A);
const Pe = human(A.U, { h: .074, z: -.072, pose: 'sit', veil: true, col: PN.fig, rim: .85 }); A.scene.add(Pe.g); Pe.set({ x: .043, y: GROUND, a: 1.15, flip: true });
P.B.set(1.3, 1.1);
P.mo.position.set(.04, .074, -.17);
const czA = .62, cyA = camY(czA, GROUND, -.075, .54); aim(A.cam, [.006, cyA, czA, .006, cyA, -.08], 0, { hand: 0 });
P.fr.follow(.1);

// —— B: the gold shore ——
const B = stage({ light: [.01, -.02, -.1], lightR: .24, lightCol: '#ffd98a', key: 1.4, keyCol: '#ffe6c0', amb: .38, ambCol: '#c0a080', floor: .45 });
const Lg = lago(B); Lg.boat.visible = false; Lg.far.visible = false;
Lg.P3[2].part(.2); Lg.P3[1].part(.22); Lg.P3[0].part(.24); Lg.paint(1, () => 1); Lg.sun.position.y = HZ + .02;
Lg.layers.forEach(([m]) => { const u = m.material.userData.u; if (u) u.uTrans.value = .55; });
const Br = brasas(B.U, { w: .02, z: -.078 }); Br.g.position.set(.012, GROUND + .001, -.078); B.scene.add(Br.g); Br.set(1.1, 1);
const Pb = human(B.U, { h: .064, z: -.082, pose: 'sit', col: GD.fig, rim: .9 }); B.scene.add(Pb.g); Pb.set({ x: -.006, y: GROUND, a: .9, rot: .04 });
const Je = human(B.U, { h: .066, z: -.086, pose: 'sit', col: GD.fig, rim: 1 }); B.scene.add(Je.g); Je.set({ x: .046, y: GROUND, a: .8, flip: true });
[[.04, -.0485, .2], [.052, -.0488, 1.1], [.058, -.0483, 2]].forEach(([x, y, r]) => { const m = moneda(B.U, { r: .0022, z: -.07, glow: 0 }); tint(m, '#a8a49e'); m.position.set(x, y, -.07); m.rotation.z = r; B.add(m); });
const C = clawd(B.U, { u: .0036, z: -.062, glow: .4 }); B.scene.add(C.g); C.set({ x: -.036, y: GROUND + .002, look: 0, lookY: 0, aL: .5, aR: .5, k: 1 });
const czB = .5, cyB = camY(czB, GROUND, -.07, .3);
aim(B.cam, [.004, cyB, czB, .004, cyB, -.08], 0, { hand: 0 });
Lg.fr.follow(.22);

// blend: B (gold) rises from the bottom, A (night) above; soft seam around the middle of the frame
const blend = new FullScreenQuad(new THREE.ShaderMaterial({ uniforms: { tA: { value: null }, tB: { value: null } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }',
  fragmentShader: 'varying vec2 vUv; uniform sampler2D tA, tB; void main(){ float m = smoothstep(.44, .53, vUv.y + .012 * sin(vUv.x * 9.)); gl_FragColor = vec4(mix(texture2D(tB, vUv).rgb, texture2D(tA, vUv).rgb, m), 1.); }' }));

window.render = () => {
  pipe.shot(A.scene, A.cam, { focus: A.cam.position.z + .072, aper: 7, maxCoc: 5, bloom: { strength: .36, radius: .6, threshold: 1.0 } }, pipe.rtA);
  pipe.shot(B.scene, B.cam, { focus: B.cam.position.z + .07, aper: 7, maxCoc: 5, bloom: { strength: .38, radius: .6, threshold: 1.05 } }, pipe.rtB);
  blend.material.uniforms.tA.value = pipe.rtA.texture; blend.material.uniforms.tB.value = pipe.rtB.texture;
  renderer.setRenderTarget(pipe.rtC); blend.render(renderer);
  const keep = pipe.rtA; pipe.rtA = pipe.rtC; pipe.final({ vig: .5, sat: 1.04 }); pipe.rtA = keep;
};
window.READY = true;
