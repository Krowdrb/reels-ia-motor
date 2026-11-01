// Personajes 3D estilo "juguete" (low-poly toon) con Three.js, a partir de la misma ficha que los 2D (style: "3d").
// Se dibujan en un canvas WebGL (por software en el servidor) que se coloca como un elemento más.
(function () {
  const POSES = { idle: [[8, 10], [8, 10]], wave: [[150, 35], [8, 10]], point: [[92, 4], [8, 10]], think: [[18, 150], [8, 12]],
    celebrate: [[158, 15], [158, 15]], explain: [[42, 72], [42, 72]], shrug: [[62, 110], [62, 110]], pray: [[-14, 128], [-14, 128]],
    open: [[112, 10], [112, 10]], hold: [[22, 95], [8, 10]] };
  window.buildCharacter3D = function (c, parent) {
    const T = window.THREE, W = 700, H = 1050, D = Math.PI / 180;
    const wrap = document.createElement('div'); wrap.className = 'abs'; wrap.style.cssText = `width:${W}px;height:${H}px`;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; wrap.appendChild(cv); parent.appendChild(wrap);
    const r = new T.WebGLRenderer({ canvas: cv, alpha: true, antialias: true, preserveDrawingBuffer: true });
    r.setPixelRatio(1); r.setSize(W, H, false); r.setClearColor(0x000000, 0);
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(28, W / H, 0.1, 50);
    cam.position.set(0, 1.5, 8.6); cam.lookAt(0, 1.15, 0);
    const grad = new T.DataTexture(new Uint8Array([90, 90, 90, 255, 170, 170, 170, 255, 255, 255, 255, 255]), 3, 1, T.RGBAFormat);
    grad.minFilter = grad.magFilter = T.NearestFilter; grad.needsUpdate = true;
    const M = col => new T.MeshToonMaterial({ color: new T.Color(col), gradientMap: grad });
    const OUT = new T.MeshBasicMaterial({ color: 0x0f0f12, side: T.BackSide });
    const add = (geo, mat, par, pos = [0, 0, 0], sc = [1, 1, 1], outline = true) => {
      const m = new T.Mesh(geo, mat); m.position.set(...pos); m.scale.set(...sc); par.add(m);
      if (outline) { const o = new T.Mesh(geo, OUT); o.scale.setScalar(1.045); m.add(o); } return m; };
    const skin = M(c.skin || '#C98B5E'), cloth = M(c.outfitColor || '#D97757'), hairM = M(c.hairColor || '#2B1B14'),
      dark = new T.MeshBasicMaterial({ color: 0x2a1010 }), white = new T.MeshBasicMaterial({ color: 0xffffff }), blk = new T.MeshBasicMaterial({ color: new T.Color(c.eyes || '#1a1a1a') });
    scene.add(new T.HemisphereLight(0xfff4e6, 0x3a2a30, 1.6));
    const key = new T.DirectionalLight(0xffffff, 2.2); key.position.set(2.5, 4, 5); scene.add(key);
    const rim = new T.DirectionalLight(0xd97757, 2.0); rim.position.set(-4, 2, -3); scene.add(rim);
    const root = new T.Group(); scene.add(root);
    const robe = c.outfit === 'robe' || c.outfit === 'tunic';
    const body = add(robe ? new T.CylinderGeometry(0.5, 0.85, 1.6, 24) : new T.CapsuleGeometry(0.62, 0.7, 8, 24), cloth, root, [0, robe ? 0.55 : 0.75, 0]);
    add(new T.CylinderGeometry(0.17, 0.2, 0.3, 16), skin, root, [0, 1.45, 0], [1, 1, 1], false);
    const head = new T.Group(); head.position.set(0, 1.95, 0); root.add(head);
    add(new T.SphereGeometry(0.58, 32, 24), skin, head, [0, 0, 0], [1, 1.05, 1]);
    add(new T.SphereGeometry(0.13, 16, 12), skin, head, [-0.58, 0, 0]); add(new T.SphereGeometry(0.13, 16, 12), skin, head, [0.58, 0, 0]);
    // pelo / velo / barba
    const cap = (rad, col, y = 0.04, th = 0.42) => add(new T.SphereGeometry(rad, 32, 16, 0, Math.PI * 2, 0, Math.PI * th), M(col), head, [0, y, -0.02]);
    if (c.hair === 'veil') { const vm = M(c.veilColor || '#E8DCC4'); vm.side = T.DoubleSide; cap(0.64, c.veilColor || '#E8DCC4', 0.02, 0.36); add(new T.SphereGeometry(0.68, 32, 16, Math.PI * 0.5, Math.PI, 0, Math.PI * 0.75), vm, head, [0, 0, -0.08]); add(new T.CylinderGeometry(0.62, 0.85, 1.1, 24, 1, true, Math.PI * 0.5, Math.PI), vm, head, [0, -0.6, -0.1]); }
    else if (c.hair === 'curly') for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; add(new T.SphereGeometry(0.2, 12, 10), hairM, head, [Math.cos(a) * 0.48, 0.38 + Math.sin(i * 1.7) * 0.06, Math.sin(a) * 0.45]); }
    else if (c.hair === 'long') { cap(0.62, c.hairColor || '#2B1B14'); add(new T.CylinderGeometry(0.55, 0.62, 1.0, 24, 1, true, Math.PI * 0.6, Math.PI * 1.8), hairM, head, [0, -0.45, -0.05]); }
    else if (c.hair !== 'bald') cap(0.61, c.hair === 'cap' ? (c.accent || '#D97757') : (c.hairColor || '#2B1B14'));
    if (c.beard && c.beard !== 'none') add(new T.SphereGeometry(0.4, 24, 16, Math.PI * 0.05, Math.PI * 0.9, Math.PI * 0.45, Math.PI * 0.55), M(c.beardColor || c.hairColor || '#2B1B14'), head, [0, c.beard === 'long' ? -0.18 : -0.1, 0.24], [1.15, c.beard === 'long' ? 1.7 : 1.1, 1]);
    const eyes = [];
    for (const x of [-0.2, 0.2]) { const e = new T.Group(); e.position.set(x, 0.06, 0.52); head.add(e);
      add(new T.SphereGeometry(0.11, 16, 12), white, e, [0, 0, 0], [1, 1.2, 0.6], false); add(new T.SphereGeometry(0.065, 12, 10), blk, e, [0, -0.01, 0.06], [1, 1, 0.6], false); eyes.push(e); }
    const mouth = add(new T.SphereGeometry(0.11, 16, 12), dark, head, [0, -0.24, c.beard && c.beard !== 'none' ? 0.62 : 0.53], [1, 0.3, 0.4], false);
    if (c.accessory === 'glasses') for (const x of [-0.2, 0.2]) add(new T.TorusGeometry(0.15, 0.025, 8, 24), new T.MeshBasicMaterial({ color: 0x111111 }), head, [x, 0.06, 0.6], [1, 1, 1], false);
    if (c.accessory === 'halo') add(new T.TorusGeometry(0.42, 0.05, 10, 40), new T.MeshBasicMaterial({ color: 0xf5c26b }), head, [0, 0.82, 0], [1, 1, 1], false).rotation.x = Math.PI / 2;
    const arms = {};
    for (const side of ['R', 'L']) { const s = side === 'R' ? 1 : -1;
      const sh = new T.Group(); sh.position.set(0.68 * s, 1.18, 0); root.add(sh);
      add(new T.CapsuleGeometry(0.15, 0.45, 6, 12), cloth, sh, [0, -0.3, 0]);
      const el = new T.Group(); el.position.set(0, -0.62, 0); sh.add(el);
      add(new T.CapsuleGeometry(0.13, 0.4, 6, 12), cloth, el, [0, -0.25, 0]); add(new T.SphereGeometry(0.15, 16, 12), skin, el, [0, -0.6, 0]);
      arms[side] = { sh, el, s }; }
    let cur = { pose: 'idle', prev: 'idle', t: -9 };
    const ease = x => x < 0 ? 0 : x > 1 ? 1 : 1 - Math.pow(1 - x, 3), lerp = (a, b, k) => a + (b - a) * k;
    return { el: wrap, setProp() {},
      update(L, st) {
        if (st.pose !== cur.pose) { cur.prev = cur.pose; cur.pose = st.pose; cur.t = st.since; }
        const k = ease((L - cur.t) / 0.32), A = POSES[cur.prev] || POSES.idle, B = POSES[cur.pose] || POSES.idle;
        [['R', 0], ['L', 1]].forEach(([sd, i]) => { const a = arms[sd]; let o = lerp(A[i][0], B[i][0], k), b = lerp(A[i][1], B[i][1], k);
          if (cur.pose === 'wave' && sd === 'R') b += 22 * Math.sin(L * 9);
          if (cur.pose === 'celebrate') b += 10 * Math.sin(L * 10 + i * 3);
          a.sh.rotation.z = a.s * o * D; a.el.rotation.z = -a.s * b * D; a.el.rotation.x = -b * 0.3 * D; });
        const talk = st.talk || 0;
        root.position.y = cur.pose === 'celebrate' ? Math.abs(Math.sin(L * 7)) * 0.15 : 0;
        body.scale.y = 1 + 0.015 * Math.sin(L * 2.4);
        head.rotation.z = (2.2 * Math.sin(L * 1.3) + talk * 2 * Math.sin(L * 11)) * D; head.rotation.y = (st.look || 0) * 12 * D + 6 * Math.sin(L * 0.7) * D;
        const ph = (L + (c.blinkSeed || 0)) % 3.7; eyes.forEach(e => e.scale.y = ph < 0.12 ? 0.1 : 1);
        mouth.scale.set(1 + talk * 0.3, 0.3 + talk * 1.4, 0.4);
        root.rotation.y = (st.flip ? -14 : 14) * D * (st.look ? 1 : 0.3) + 8 * Math.sin(L * 0.5) * D;
        r.render(scene, cam);
      } };
  };
})();
