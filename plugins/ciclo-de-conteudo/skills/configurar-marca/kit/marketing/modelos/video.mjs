// Gera o vídeo de um post a partir da coreografia em videos/<slug>.html, com a marca do marca.json.
// Uso: node video.mjs posts/exemplo-video.json            -> out/<slug>/video.mp4 e capa.png
//      node video.mjs posts/exemplo-video.json --fps=60   -> outra taxa de quadros (padrão 30)
//      node video.mjs posts/exemplo-video.json --folha    -> só out/<slug>/folha.png, um quadro a cada 0,5 s, para conferir
//      node video.mjs posts/exemplo-video.json --em=1600,9800 -> só esses instantes (ms) em out/<slug>/quadro-<ms>.png
//      node video.mjs posts/exemplo-video.json --trilha   -> só out/<slug>/trilha.wav, para ouvir
//      node video.mjs posts/exemplo-video.json --sem-som  -> vídeo mudo
//      node video.mjs posts/exemplo-video.json --capa=2000 -> instante (ms) usado na capa.png
// Som: videos/<slug>.trilha.mjs sintetiza trilha e efeitos a partir da mesma linha do tempo (window.T) da coreografia.
// Prévia em tempo real (sem som): npx serve . e abra videos/<slug>.html?play
import { chromium } from 'playwright-core';
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { abrirChrome, dir, lerMarca, servir } from './lib.mjs';

const arquivo = process.argv[2];
if (!arquivo) {
  console.error('Uso: node video.mjs posts/<post>.json');
  process.exit(1);
}
const arg = (nome) => process.argv.find((a) => a.startsWith(`--${nome}=`))?.split('=')[1] ?? (process.argv.includes(`--${nome}`) ? true : undefined);
const marca = lerMarca();
const post = JSON.parse(fs.readFileSync(path.resolve(arquivo), 'utf8'));
const slug = post.slug || path.basename(arquivo, '.json');
const coreografia = path.join(dir, 'videos', `${slug}.html`);
if (!fs.existsSync(coreografia)) {
  console.error(`Sem coreografia: ${path.relative(process.cwd(), coreografia)}. Copie videos/exemplo-video.html com o nome do slug.`);
  process.exit(1);
}
const soImagem = arg('folha') || arg('em') || arg('trilha');
if (!soImagem && spawnSync('ffmpeg', ['-version']).error) {
  console.error('Falta o ffmpeg para montar o MP4 (macOS: brew install ffmpeg · Ubuntu: sudo apt install ffmpeg · Windows: winget install ffmpeg).');
  process.exit(1);
}
const fps = Number(arg('fps') || 30);
const outDir = path.join(dir, 'out', slug);
fs.mkdirSync(outDir, { recursive: true });

const servidor = await servir();
const browser = await abrirChrome(chromium);
try {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('erro na página:', e.message));
  await page.goto(`${servidor.url}/videos/${slug}.html`);
  const fim = await page.evaluate(([p, m]) => window.preparar(p, m), [post, marca]);
  const palco = page.locator('#palco');

  // Trilha sintetizada pela mesma linha do tempo da coreografia.
  const moduloTrilha = path.join(dir, 'videos', `${slug}.trilha.mjs`);
  let trilha = null;
  if (!arg('sem-som') && fs.existsSync(moduloTrilha) && !arg('folha') && !arg('em')) {
    const { gerar, wav } = await import(new URL(`file://${moduloTrilha}`).href);
    const T = await page.evaluate(() => window.T);
    trilha = path.join(outDir, 'trilha.wav');
    fs.writeFileSync(trilha, wav(gerar({ T, fim })));
    if (arg('trilha')) {
      console.log(`trilha em ${path.relative(process.cwd(), trilha)}`);
      process.exit(0);
    }
  }
  const foto = async (t, destino) => {
    await page.evaluate((x) => window.quadro(x), t);
    return palco.screenshot(destino ? { path: destino } : {});
  };

  if (arg('em')) {
    for (const t of String(arg('em')).split(',').map(Number)) await foto(t, path.join(outDir, `quadro-${t}.png`));
    console.log(`quadros em ${path.relative(process.cwd(), outDir)}/`);
  } else if (arg('folha')) {
    // Folha de contato: um quadro a cada 0,5 s, reduzido, com o instante embaixo.
    const tempos = [];
    for (let t = 0; t <= fim; t += 500) tempos.push(t);
    const imgs = [];
    for (const t of tempos) imgs.push((await foto(t)).toString('base64'));
    const folha = await browser.newPage({ viewport: { width: 2000, height: 1000 } });
    await folha.setContent(`<body style="margin:0;background:#222;font:20px system-ui;color:#ccc">
      <div id="f" style="display:grid;grid-template-columns:repeat(8,216px);gap:16px;padding:16px;width:max-content">
      ${imgs.map((b, i) => `<figure style="margin:0"><img src="data:image/png;base64,${b}" style="width:216px;display:block"><figcaption>${(tempos[i] / 1000).toFixed(1)} s</figcaption></figure>`).join('')}
      </div></body>`);
    await folha.locator('#f').screenshot({ path: path.join(outDir, 'folha.png') });
    console.log(`folha em ${path.relative(process.cwd(), outDir)}/folha.png`);
  } else {
    const saida = path.join(outDir, 'video.mp4');
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
      ...(trilha ? ['-i', trilha, '-c:a', 'aac', '-b:a', '192k', '-shortest'] : []),
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p',
      '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-movflags', '+faststart', saida],
    { stdio: ['pipe', 'inherit', 'inherit'] });
    const terminou = new Promise((ok, falha) => ff.on('close', (c) => (c === 0 ? ok() : falha(new Error(`ffmpeg saiu com ${c}`)))));
    const total = Math.round((fim / 1000) * fps);
    for (let n = 0; n <= total; n++) {
      const png = await foto((n * 1000) / fps);
      if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once('drain', r));
      if (n % fps === 0) process.stdout.write(`\r${n}/${total} quadros`);
    }
    ff.stdin.end();
    await terminou;
    // Capa do Reels: o gancho já montado (T.capa na coreografia, ou --capa=ms).
    const instanteCapa = Number(arg('capa') || (await page.evaluate(() => window.T.capa)) || 1900);
    await foto(instanteCapa, path.join(outDir, 'capa.png'));
    console.log(`\n${path.relative(process.cwd(), saida)} (${(fim / 1000).toFixed(1)} s, ${fps} fps) e capa.png`);
  }
} finally {
  await browser.close();
  servidor.fechar();
}
