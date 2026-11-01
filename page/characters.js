// Personajes 2D vectoriales (marionetas SVG): pose, expresión, parpadeo, respiración y labios sincronizados con la voz.
// Ficha de personaje (JSON): {name, skin, hair, hairColor, beard, outfit, outfitColor, accent, accessory, eyes, age}
//   hair: short | long | bun | curly | cap | bald | veil (manto o velo de época) | crown
//   beard: none | short | long          outfit: hoodie | shirt | blazer | robe | tunic | dress
//   accessory: none | glasses | headset | staff (bastón) | halo        age: young | adult | old
// Poses: idle | wave | point | think | celebrate | explain | shrug | pray | open (brazos abiertos) | hold
// Expresiones: neutral | happy | surprised | worried | sad | wink | determined
(function () {
  const POSES = { // [fuera, codo] para brazo derecho y brazo izquierdo; fuera>0 = se aleja del cuerpo, codo>0 = dobla hacia adentro
    idle: [[8, 10], [8, 10]], wave: [[150, 35], [8, 10]], point: [[92, 4], [8, 10]], think: [[18, 150], [8, 12]],
    celebrate: [[158, 15], [158, 15]], explain: [[42, 72], [42, 72]], shrug: [[62, 110], [62, 110]],
    pray: [[-14, 128], [-14, 128]], open: [[112, 10], [112, 10]], hold: [[22, 95], [8, 10]],
  };
  const EXPR = { // cejaY, cejaRot(grados), boca: smile|grin|o|flat|frown, ojoCerrado: '' | 'L'
    neutral: [0, 0, 'flat'], happy: [-4, -4, 'smile'], surprised: [-16, -6, 'o'], worried: [-4, 14, 'frown'],
    sad: [2, 12, 'frown'], wink: [-4, -4, 'grin', 'L'], determined: [6, -12, 'flat'],
  };
  const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const f = v => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k)));
    return '#' + [f(r), f(g), f(b)].map(v => v.toString(16).padStart(2, '0')).join(''); };

  function hairSvg(c) {
    const h = c.hairColor || '#2B1B14';
    switch (c.hair) {
      case 'long': return { back: `<path d="M168 380 C160 250 220 230 300 230 C380 230 440 250 432 380 L452 610 C420 640 380 630 360 600 L360 470 L240 470 L240 600 C220 630 180 640 148 610 Z" fill="${h}"/>`,
        front: `<path d="M172 395 C170 290 230 248 300 248 C370 248 430 290 428 395 C410 330 360 300 300 300 C240 300 190 330 172 395 Z" fill="${h}"/>` };
      case 'bun': return { back: `<circle cx="300" cy="228" r="62" fill="${h}"/>`, front: `<path d="M172 392 C168 290 230 250 300 250 C370 250 432 290 428 392 C405 320 360 296 300 296 C240 296 195 320 172 392 Z" fill="${h}"/>` };
      case 'curly': return { back: '', front: [...Array(11)].map((_, i) => { const a = Math.PI * (1.05 + i * 0.09); return `<circle cx="${300 + Math.cos(a) * 128}" cy="${385 + Math.sin(a) * 150}" r="46" fill="${h}"/>`; }).join('') };
      case 'cap': return { back: '', front: `<path d="M172 362 C172 268 232 238 300 238 C368 238 428 268 428 362 Z" fill="${c.accent || '#D97757'}"/><path d="M300 340 L470 352 C470 372 440 378 300 372 Z" fill="${shade(c.accent || '#D97757', -0.25)}"/>` };
      case 'bald': return { back: '', front: '' };
      case 'veil': { const v = c.veilColor || c.outfitColor || '#E8DCC4'; return {
        back: `<path d="M150 360 C140 230 220 205 300 205 C380 205 460 230 450 360 L480 700 L120 700 Z" fill="${shade(v, -0.12)}"/>`,
        front: `<path d="M168 410 C160 280 225 232 300 232 C375 232 440 280 432 410 C420 320 370 286 300 286 C230 286 180 320 168 410 Z" fill="${v}"/><path d="M180 300 C230 268 370 268 420 300" stroke="${shade(v, -0.25)}" stroke-width="10" fill="none"/>` }; }
      case 'crown': return { back: '', front: `<path d="M178 372 C176 300 230 262 300 262 C370 262 424 300 422 372 C400 320 360 306 300 306 C240 306 200 320 178 372 Z" fill="${h}"/><path d="M218 268 L236 196 L268 244 L300 182 L332 244 L364 196 L382 268 Z" fill="#F5C26B" stroke="#C9973F" stroke-width="5"/>` };
      default: return { back: '', front: `<path d="M174 380 C168 280 232 238 300 238 C368 238 432 280 426 380 C414 318 372 292 300 296 C252 298 205 318 186 352 Z" fill="${h}"/>` };
    }
  }
  function beardSvg(c) {
    const h = c.beardColor || c.hairColor || '#2B1B14';
    if (c.beard === 'short') return `<path d="M200 430 C205 520 250 560 300 560 C350 560 395 520 400 430 C390 470 360 500 300 500 C240 500 210 470 200 430 Z" fill="${h}"/>`;
    if (c.beard === 'long') return `<path d="M196 420 C196 560 250 640 300 660 C350 640 404 560 404 420 C392 476 360 506 300 506 C240 506 208 476 196 420 Z" fill="${h}"/>`;
    return '';
  }
  function outfitSvg(c) {
    const o = c.outfitColor || '#D97757', d = shade(o, -0.22), l = shade(o, 0.18);
    const torso = `<path d="M110 905 C110 720 170 625 300 622 C430 625 490 720 490 905 Z" fill="${o}"/>`;
    switch (c.outfit) {
      case 'hoodie': return torso + `<path d="M210 640 C230 700 370 700 390 640 C370 610 230 610 210 640 Z" fill="${d}"/><path d="M270 690 L262 790 M330 690 L338 790" stroke="${l}" stroke-width="7" stroke-linecap="round"/>`;
      case 'blazer': return torso + `<path d="M255 628 L300 760 L345 628 Z" fill="#F4F1EC"/><path d="M240 630 L300 800 L230 905 L170 905 L190 700 Z M360 630 L300 800 L370 905 L430 905 L410 700 Z" fill="${d}"/>`;
      case 'robe': case 'tunic': return `<path d="M100 905 C104 720 165 628 300 622 C435 628 496 720 500 905 Z" fill="${o}"/><path d="M262 626 L300 700 L338 626" stroke="${d}" stroke-width="10" fill="none"/>` +
        (c.outfit === 'robe' ? `<path d="M150 905 C160 760 200 660 245 630 L210 905 Z M450 905 C440 760 400 660 355 630 L390 905 Z" fill="${c.accent ? c.accent : d}" opacity=".9"/>` : `<path d="M140 820 L460 820" stroke="${c.accent || d}" stroke-width="22"/>`);
      case 'dress': return torso + `<path d="M230 628 C250 690 350 690 370 628" stroke="${l}" stroke-width="12" fill="none"/>`;
      default: return torso + `<path d="M260 628 L300 690 L340 628" fill="#F4F1EC"/>`;
    }
  }
  function armSvg(c, side) {
    const o = c.outfitColor || '#D97757', d = shade(o, -0.12), s = c.skin || '#C98B5E';
    const wide = (c.outfit === 'robe' || c.outfit === 'tunic') ? 60 : 50;
    return `<g class="up-${side}"><rect x="${-wide / 2}" y="-10" width="${wide}" height="175" rx="${wide / 2}" fill="${d}"/>
      <g class="fo-${side}" transform="translate(0,150)"><rect x="${-wide / 2 + 3}" y="-10" width="${wide - 6}" height="150" rx="${wide / 2 - 3}" fill="${d}"/>
      <g transform="translate(0,150)"><circle r="30" fill="${s}"/><g class="prop-${side}"></g></g></g></g>`;
  }
  function accessorySvg(c) {
    if (c.accessory === 'glasses') return `<g fill="none" stroke="#1A1A1A" stroke-width="7"><rect x="215" y="372" width="78" height="58" rx="20"/><rect x="307" y="372" width="78" height="58" rx="20"/><path d="M293 398 L307 398"/></g>`;
    if (c.accessory === 'headset') return `<path d="M168 400 C168 250 432 250 432 400" stroke="#1A1A1A" stroke-width="16" fill="none"/><rect x="150" y="370" width="36" height="80" rx="14" fill="#1A1A1A"/><rect x="414" y="370" width="36" height="80" rx="14" fill="#1A1A1A"/><path d="M168 440 C180 500 230 510 262 500" stroke="#1A1A1A" stroke-width="8" fill="none"/>`;
    if (c.accessory === 'halo') return `<ellipse cx="300" cy="210" rx="110" ry="24" fill="none" stroke="#F5C26B" stroke-width="12" opacity=".95"/>`;
    return '';
  }

  window.buildCharacter = function (c, parent) {
    const s = c.skin || '#C98B5E', sd = shade(s, -0.15), eye = c.eyes || '#2A1A10';
    const hair = hairSvg(c), old = c.age === 'old';
    const wrap = document.createElement('div'); wrap.className = 'abs'; wrap.style.cssText = 'width:600px;height:905px';
    wrap.innerHTML = `<svg viewBox="0 0 600 905" width="600" height="905" overflow="visible">
      <g class="flip"><g class="body">
        ${c.accessory === 'staff' ? `<path d="M520 300 L500 905" stroke="#8B5E3C" stroke-width="18" stroke-linecap="round"/><path d="M520 300 C540 260 500 240 490 270" stroke="#8B5E3C" stroke-width="16" fill="none" stroke-linecap="round"/>` : ''}
        ${hair.back}
        ${outfitSvg(c)}
        <g class="armR" transform="translate(440,672)">${armSvg(c, 'R')}</g>
        <g class="armL" transform="translate(160,672)">${armSvg(c, 'L')}</g>
        <rect x="268" y="520" width="64" height="120" rx="26" fill="${sd}"/>
        <g class="head">
          <circle cx="178" cy="410" r="26" fill="${s}"/><circle cx="422" cy="410" r="26" fill="${s}"/>
          <ellipse cx="300" cy="398" rx="128" ry="148" fill="${s}"/>
          ${old ? `<path d="M232 340 C250 334 270 334 286 340 M314 340 C330 334 350 334 368 340" stroke="${sd}" stroke-width="4" fill="none"/>` : ''}
          <ellipse cx="236" cy="452" rx="22" ry="12" fill="#E8735F" opacity=".25"/><ellipse cx="364" cy="452" rx="22" ry="12" fill="#E8735F" opacity=".25"/>
          ${beardSvg(c)}
          <g class="eyes"><g class="eyeL"><ellipse cx="254" cy="400" rx="21" ry="25" fill="#fff"/><circle class="pup" cx="256" cy="402" r="12" fill="${eye}"/><circle cx="260" cy="396" r="4" fill="#fff"/></g>
            <g class="eyeR"><ellipse cx="346" cy="400" rx="21" ry="25" fill="#fff"/><circle class="pup" cx="348" cy="402" r="12" fill="${eye}"/><circle cx="352" cy="396" r="4" fill="#fff"/></g></g>
          <path class="browL" d="M228 360 Q254 348 280 360" stroke="${c.browColor || c.hairColor || '#2B1B14'}" stroke-width="9" stroke-linecap="round" fill="none"/>
          <path class="browR" d="M320 360 Q346 348 372 360" stroke="${c.browColor || c.hairColor || '#2B1B14'}" stroke-width="9" stroke-linecap="round" fill="none"/>
          <path d="M300 410 Q290 440 302 446" stroke="${sd}" stroke-width="6" fill="none" stroke-linecap="round"/>
          <g class="mouth" transform="translate(300,480)"></g>
          ${hair.front}${accessorySvg(c)}
        </g></g></g></svg>`;
    parent.appendChild(wrap);
    const q = k => wrap.querySelector(k);
    const P = { armR: q('.armR'), armL: q('.armL'), upR: q('.up-R'), upL: q('.up-L'), foR: q('.fo-R'), foL: q('.fo-L'), head: q('.head'), body: q('.body'),
      eyeL: q('.eyeL'), eyeR: q('.eyeR'), browL: q('.browL'), browR: q('.browR'), mouth: q('.mouth'), flip: q('.flip'), propR: q('.prop-R'), pups: wrap.querySelectorAll('.pup') };
    let cur = { pose: 'idle', expr: 'happy', t: -9, prev: 'idle', prop: null };
    const lerp = (a, b, k) => a + (b - a) * k, ease = x => x < 0 ? 0 : x > 1 ? 1 : 1 - Math.pow(1 - x, 3);
    function mouthSvg(kind, open) {
      if (open > 0.08) { const ry = 6 + open * 30, rx = 26 + open * 6; return `<ellipse rx="${rx}" ry="${ry}" fill="#5A1E1E"/><ellipse cy="${ry * 0.45}" rx="${rx * 0.6}" ry="${ry * 0.4}" fill="#D9636B"/><rect x="${-rx * 0.7}" y="${-ry}" width="${rx * 1.4}" height="${Math.min(10, ry * 0.4)}" rx="3" fill="#fff"/>`; }
      if (kind === 'smile') return `<path d="M-34 -6 Q0 30 34 -6" stroke="#5A1E1E" stroke-width="9" fill="none" stroke-linecap="round"/>`;
      if (kind === 'grin') return `<path d="M-38 -10 Q0 40 38 -10 Z" fill="#5A1E1E"/><path d="M-30 -6 L30 -6" stroke="#fff" stroke-width="8"/>`;
      if (kind === 'o') return `<ellipse rx="18" ry="22" fill="#5A1E1E"/>`;
      if (kind === 'frown') return `<path d="M-28 12 Q0 -12 28 12" stroke="#5A1E1E" stroke-width="9" fill="none" stroke-linecap="round"/>`;
      return `<path d="M-26 2 L26 2" stroke="#5A1E1E" stroke-width="9" stroke-linecap="round"/>`;
    }
    return {
      el: wrap,
      setProp(icon) { if (icon && window.ICONS && ICONS[icon]) P.propR.innerHTML = `<g transform="translate(-55,-120)"><rect width="110" height="110" rx="26" fill="#0F0F12"/><svg x="15" y="15" viewBox="0 0 24 24" width="80" height="80" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${ICONS[icon]}</svg></g>`; else P.propR.innerHTML = ''; },
      // L = tiempo local; st = {pose, expr, since, talk(0..1), flip, look}
      update(L, st) {
        if (st.pose !== cur.pose) { cur.prev = cur.pose; cur.pose = st.pose; cur.t = st.since; }
        const k = ease((L - cur.t) / 0.32), A = POSES[cur.prev] || POSES.idle, B = POSES[cur.pose] || POSES.idle;
        let rO = lerp(A[0][0], B[0][0], k), rB = lerp(A[0][1], B[0][1], k), lO = lerp(A[1][0], B[1][0], k), lB = lerp(A[1][1], B[1][1], k);
        if (cur.pose === 'wave') rB += 22 * Math.sin(L * 9);
        if (cur.pose === 'explain') { rO += 6 * Math.sin(L * 4); lO += 6 * Math.sin(L * 4 + 1.5); }
        if (cur.pose === 'celebrate') { rB += 10 * Math.sin(L * 10); lB += 10 * Math.sin(L * 10 + 3); }
        P.upR.setAttribute('transform', `rotate(${-rO})`); P.foR.setAttribute('transform', `translate(0,150) rotate(${rB})`);
        P.upL.setAttribute('transform', `rotate(${lO})`); P.foL.setAttribute('transform', `translate(0,150) rotate(${-lB})`);
        const breathe = 1 + 0.012 * Math.sin(L * 2.4), bounce = cur.pose === 'celebrate' ? Math.abs(Math.sin(L * 7)) * -18 : 0;
        const talk = st.talk || 0, tilt = (cur.pose === 'think' ? 7 : cur.pose === 'shrug' ? -6 : 0) * k + 2.2 * Math.sin(L * 1.3) + talk * 2 * Math.sin(L * 11);
        P.body.setAttribute('transform', `translate(0,${bounce}) translate(300,905) scale(1,${breathe}) translate(-300,-905)`);
        P.head.setAttribute('transform', `rotate(${tilt} 300 560) translate(0,${-talk * 4})`);
        const ex = EXPR[st.expr] || EXPR.neutral;
        P.browL.setAttribute('transform', `translate(0,${ex[0]}) rotate(${ex[1]} 254 356)`); P.browR.setAttribute('transform', `translate(0,${ex[0]}) rotate(${-ex[1]} 346 356)`);
        const ph = (L + (c.blinkSeed || 0)) % 3.7, bl = ph < 0.12 ? 0.1 : 1;
        P.eyeL.setAttribute('transform', `translate(0,400) scale(1,${ex[3] === 'L' ? 0.1 : bl}) translate(0,-400)`);
        P.eyeR.setAttribute('transform', `translate(0,400) scale(1,${bl}) translate(0,-400)`);
        const lk = st.look || 0; P.pups.forEach(p => p.setAttribute('transform', `translate(${lk * 6},0)`));
        P.mouth.innerHTML = mouthSvg(ex[2], talk);
        P.flip.setAttribute('transform', st.flip ? 'translate(600,0) scale(-1,1)' : '');
      },
    };
  };

  // Fondos ilustrados planos para escenas con personajes
  window.backdropSvg = function (kind) {
    const W = 1080, H = 1920;
    const sky = (a, b) => `<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#sk)"/>`;
    const k = {
      desert: sky('#F4B26B', '#F7D9A8') + `<circle cx="780" cy="520" r="120" fill="#FFF1C9" opacity=".9"/><path d="M0 1250 C250 1150 450 1200 620 1170 C800 1140 950 1180 1080 1150 L1080 1920 L0 1920 Z" fill="#D99A5B"/><path d="M0 1400 C300 1320 600 1380 1080 1300 L1080 1920 L0 1920 Z" fill="#C4834A"/>`,
      night: sky('#0E1430', '#2A2350') + [...Array(40)].map((_, i) => `<circle cx="${(i * 263) % W}" cy="${(i * 397) % 1100}" r="${2 + (i % 3)}" fill="#fff" opacity="${0.4 + (i % 5) / 10}"/>`).join('') + `<circle cx="820" cy="420" r="80" fill="#F4F1EC"/><path d="M0 1350 C300 1280 700 1320 1080 1260 L1080 1920 L0 1920 Z" fill="#141A33"/>`,
      field: sky('#8EC5E8', '#DFF1F7') + `<circle cx="830" cy="430" r="100" fill="#FFF3B0"/><path d="M0 1250 C300 1170 700 1230 1080 1160 L1080 1920 L0 1920 Z" fill="#7DB36B"/><path d="M0 1420 C400 1350 700 1400 1080 1340 L1080 1920 L0 1920 Z" fill="#5E9B52"/>`,
      village: sky('#F2C48D', '#F8E3C4') + `<g fill="#C79A6B">${[80, 330, 610, 860].map((x, i) => `<rect x="${x}" y="${1000 + (i % 2) * 60}" width="180" height="260"/><rect x="${x + 60}" y="${1140 + (i % 2) * 60}" width="56" height="120" fill="#8B5E3C"/>`).join('')}</g><path d="M0 1250 L1080 1250 L1080 1920 L0 1920 Z" fill="#D9AE7E"/>`,
      room: sky('#2A2A33', '#17171C') + `<rect x="0" y="1300" width="${W}" height="620" fill="#1F1F26"/><rect x="640" y="520" width="300" height="380" rx="20" fill="#D97757" opacity=".18"/><rect x="120" y="600" width="260" height="200" rx="16" fill="#F5C26B" opacity=".12"/>`,
      city: sky('#1B1B2E', '#3A2A40') + `<g fill="#101018">${[0, 140, 260, 420, 560, 700, 860, 980].map((x, i) => `<rect x="${x}" y="${900 + ((i * 137) % 300)}" width="${120 + (i % 3) * 30}" height="1100"/>`).join('')}</g>`,
    };
    return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="position:absolute;inset:0">${k[kind] || k.room}</svg>`;
  };
})();
