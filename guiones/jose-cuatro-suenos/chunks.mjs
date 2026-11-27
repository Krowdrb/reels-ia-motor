// Resumable render: node core/render/chunks.mjs <demo> --fps 30 --size 1080x1920 --q ssaa=1 --workers 2 --chunk 45 --dir <chunkdir> --out <video.mp4>
// Each chunk of frames is encoded to its own file (written as .tmp, renamed when complete); finished chunks are skipped on rerun.
import fs from 'fs'; import path from 'path'; import { spawn, execFileSync } from 'child_process';
import { openDemo, closeServer, requireDemo, takeSize } from './page.mjs';
const args = process.argv.slice(2), { w: W, h: H } = takeSize(args), opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const dir = args[0]; requireDemo(dir);
const FPS = +opt('--fps', 30), WK = +opt('--workers', 2), Q = opt('--q', ''), CH = +opt('--chunk', 45);
const cdir = path.resolve(opt('--dir', path.join(dir, 'out', 'chunks'))), out = path.resolve(opt('--out', path.join(dir, 'out', 'video.mp4')));
fs.mkdirSync(cdir, { recursive: true });
for (const n of fs.readdirSync(cdir)) if (n.endsWith('.tmp.mp4')) fs.rmSync(path.join(cdir, n));
const probe = await openDemo(dir, { w: W, h: H, q: Q }); const DUR = await probe.page.evaluate(() => window.DUR); await probe.browser.close();
const TOTAL = Math.round(DUR * FPS), N = Math.ceil(TOTAL / CH), name = i => path.join(cdir, `c_${String(i).padStart(4, '0')}.mp4`);
const todo = [...Array(N).keys()].filter(i => !fs.existsSync(name(i)));
console.log(`frames ${TOTAL}, chunks ${N}, todo ${todo.length}`); const t0 = Date.now();
await Promise.all([...Array(WK)].map(async (_, w) => {
  const mine = todo.filter((_, k) => k % WK === w); if (!mine.length) return;
  const { browser, page } = await openDemo(dir, { w: W, h: H, q: Q });
  for (const i of mine) {
    const a = i * CH, b = Math.min(TOTAL, a + CH), tmp = name(i).replace('.mp4', '.tmp.mp4');
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', tmp], { stdio: ['pipe', 'inherit', 'inherit'] });
    const closed = new Promise(r => ff.on('close', r));
    for (let f = a; f < b; f++) {
      await page.evaluate(t => window.render(t), f / FPS);
      const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    }
    ff.stdin.end(); const code = await closed;
    if (code !== 0) { console.error(`chunk ${i} ffmpeg exit ${code}`); process.exit(1); }
    fs.renameSync(tmp, name(i));
    console.log(`w${w} chunk ${i + 1}/${N} done  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  await browser.close();
}));
fs.writeFileSync(path.join(cdir, 'list.txt'), [...Array(N).keys()].map(i => `file '${path.basename(name(i))}'`).join('\n'));
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'copy', 'merged.mp4'], { cwd: cdir, stdio: 'inherit' });
fs.renameSync(path.join(cdir, 'merged.mp4'), out);
console.log('done', out, TOTAL, 'frames', ((Date.now() - t0) / 1000).toFixed(0) + 's');
closeServer();
