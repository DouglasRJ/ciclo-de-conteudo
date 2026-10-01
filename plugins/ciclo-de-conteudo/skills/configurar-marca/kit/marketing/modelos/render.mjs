// Gera as imagens de um post a partir de um JSON em posts/, com a marca do marca.json.
// Uso: node render.mjs posts/exemplo-carrossel.json  -> out/<slug>/01.png, 02.png... e out/<slug>/previa.png
//      node render.mjs posts/x.json --fundo=caderno   -> testa outro fundo sem editar o JSON
//      CHROME=/caminho/do/chrome node render.mjs ...  -> usa outro Chrome/Chromium
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { abrirChrome, dir, lerMarca, servir } from './lib.mjs';

const arquivo = process.argv[2];
if (!arquivo) {
  console.error('Uso: node render.mjs posts/<post>.json');
  process.exit(1);
}
const marca = lerMarca();
const post = JSON.parse(fs.readFileSync(path.resolve(arquivo), 'utf8'));
const fundoArg = process.argv.find((a) => a.startsWith('--fundo='))?.slice(8);
if (fundoArg) post.fundo = fundoArg;
const slug = (post.slug || path.basename(arquivo, '.json')) + (fundoArg ? `-${fundoArg}` : '');
const outDir = path.join(dir, 'out', slug);
// Apaga só as imagens antigas dos slides: o video.mp4, a capa.png e a trilha.wav do mesmo slug ficam.
fs.mkdirSync(outDir, { recursive: true });
for (const f of fs.readdirSync(outDir)) if (/^(\d+|previa)\.png$/.test(f)) fs.rmSync(path.join(outDir, f));

// Fotos de fundo: caminho relativo ao JSON (ou absoluto), servidas por /__foto/<n>.
const fotos = [];
for (const s of post.slides) {
  if (!s.foto) continue;
  const origem = path.resolve(path.dirname(path.resolve(arquivo)), s.foto);
  if (!fs.existsSync(origem)) {
    console.error(`Foto não encontrada: ${origem}`);
    process.exit(1);
  }
  fotos.push(origem);
  s.foto = `/__foto/${fotos.length - 1}${path.extname(origem)}`;
}

const servidor = await servir((rota) => {
  const m = rota.match(/^\/__foto\/(\d+)/);
  return m ? fotos[Number(m[1])] : null;
});
const browser = await abrirChrome(chromium);
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 1200 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('erro na página:', e.message));
  await page.goto(`${servidor.url}/modelo.html`);
  const total = await page.evaluate(([p, m]) => window.montar(p, m), [post, marca]);

  const slides = await page.$$('.slide');
  for (let i = 0; i < slides.length; i++) {
    await slides[i].screenshot({ path: path.join(outDir, `${String(i + 1).padStart(2, '0')}.png`) });
  }

  // Prévia: todos os slides lado a lado, em tamanho reduzido.
  await page.setViewportSize({ width: 4000, height: 1200 });
  await page.addStyleTag({ content: '#slides{zoom:.25;flex-wrap:nowrap;width:max-content}' });
  await page.locator('#slides').screenshot({ path: path.join(outDir, 'previa.png') });
  console.log(`${total} imagens em ${path.relative(process.cwd(), outDir)}/`);
} finally {
  await browser.close();
  servidor.fechar();
}
