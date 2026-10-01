// Peças comuns do render.mjs, video.mjs e revisao.mjs: achar o Chrome, ler a marca e servir a pasta.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const dir = path.dirname(fileURLToPath(import.meta.url));

/** Caminho do Chrome/Chromium: CHROME=... vence; senão, os lugares comuns de cada sistema. */
export function acharChrome() {
  if (process.env.CHROME) return process.env.CHROME;
  const candidatos = {
    darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'],
    linux: ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/snap/bin/chromium'],
    win32: [
      `${process.env['PROGRAMFILES']}\\Google\\Chrome\\Application\\chrome.exe`,
      `${process.env['PROGRAMFILES(X86)']}\\Google\\Chrome\\Application\\chrome.exe`,
      `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
      `${process.env['PROGRAMFILES(X86)']}\\Microsoft\\Edge\\Application\\msedge.exe`,
    ],
  }[process.platform] || [];
  // Sem nenhum deles, o playwright-core tenta o Chromium baixado por "npx playwright install chromium".
  return candidatos.find((c) => c && fs.existsSync(c));
}

export function lerMarca() {
  const arquivo = path.join(dir, 'marca.json');
  if (!fs.existsSync(arquivo)) {
    console.error('Falta o marca.json ao lado do render.mjs (cores, fonte e logo). Rode a skill configurar-marca.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(arquivo, 'utf8'));
}

const TIPOS = {
  '.html': 'text/html', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.json': 'application/json', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.mp4': 'video/mp4',
};

/** Serve a pasta dos modelos (fetch de SVG e fonte não funciona por file://). extras: rota → arquivo fora da pasta. */
export async function servir(extras = () => null) {
  const server = http.createServer((req, res) => {
    const rota = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const fora = extras(rota);
    const alvo = fora || path.join(dir, rota);
    if (!alvo || (!fora && !alvo.startsWith(dir)) || !fs.existsSync(alvo) || fs.statSync(alvo).isDirectory()) return res.writeHead(404).end();
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(alvo).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(alvo).pipe(res);
  });
  await new Promise((r) => server.listen(0, r));
  return { url: `http://localhost:${server.address().port}`, fechar: () => server.close() };
}

export async function abrirChrome(chromium) {
  const executablePath = acharChrome();
  try {
    return await chromium.launch({ executablePath, args: ['--force-color-profile=srgb', '--font-render-hinting=none'] });
  } catch (e) {
    console.error('Não consegui abrir o Chrome. Instale o Google Chrome, ou rode "npx playwright install chromium",');
    console.error('ou aponte o caminho: CHROME=/caminho/do/chrome node render.mjs ...');
    throw e;
  }
}
