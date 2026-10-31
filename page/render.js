// Uso (desde la carpeta de trabajo): node render.js stills DIR t1 t2 ... | node render.js video out.mp4 frameIni frameFin | node render.js thumb out.png
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
(async () => {
  const [mode, out, ...rest] = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const errs = [];
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text()) });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await page.goto('file://' + path.resolve(process.cwd(), 'index.html'));
  await page.evaluate(() => window.ready);
  const stage = await page.$('#stage');
  if (mode === 'thumb') {
    await page.goto('file://' + path.resolve(process.cwd(), 'thumb.html'));
    await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(300);
    await (await page.$('#t')).screenshot({ path: out });
  } else if (mode === 'stills') {
    for (const t of rest) {
      await page.evaluate(t => window.renderFrame(t), +t);
      await stage.screenshot({ path: `${out}/f_${(+t).toFixed(2)}.jpg`, type: 'jpeg', quality: 85 });
    }
  } else {
    const [a, b] = rest.map(Number);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = a; f < b; f++) {
      await page.evaluate(t => window.renderFrame(t), f / 30);
      const buf = await stage.screenshot({ type: 'jpeg', quality: 92 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    }
    ff.stdin.end();
    await new Promise((r, j) => ff.on('close', c => c === 0 ? r() : j(new Error('ffmpeg ' + c))));
  }
  if (errs.length) console.log('console:', [...new Set(errs)].slice(0, 10).join('\n'));
  await browser.close();
})();
