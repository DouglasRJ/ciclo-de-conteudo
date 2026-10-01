// Monta a página de revisão de um ciclo: imagens, vídeo, roteiro, legendas por rede, tabela da nota e portão de cada peça.
// Uso: node revisao.mjs revisoes/ciclo01.json  -> out/revisao-ciclo01.html (abre no navegador)
// As imagens vêm de out/<post>/ (rode o render.mjs antes). A nota é calculada aqui a partir dos critérios:
// soma(peso x nota) / soma(pesos). Story sem o critério de compartilhar fica certo sozinho.
import fs from 'node:fs';
import path from 'node:path';
import { dir, lerMarca } from './lib.mjs';

const arquivo = process.argv[2];
if (!arquivo) {
  console.error('Uso: node revisao.mjs revisoes/<ciclo>.json');
  process.exit(1);
}
const marca = lerMarca();
const r = JSON.parse(fs.readFileSync(path.resolve(arquivo), 'utf8'));
const slug = r.slug || path.basename(arquivo, '.json');
const out = path.join(dir, 'out');
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const virgula = (n, c = 1) => n.toFixed(c).replace('.', ',');
const minima = r.notaMinima ?? 8.5;
const avisos = [];

function nota(criterios) {
  const pesos = criterios.reduce((s, c) => s + c[1], 0);
  const partes = criterios.map((c) => (c[1] / pesos) * c[2]);
  return { valor: partes.reduce((a, b) => a + b, 0), partes, pesos };
}

const pecas = r.pecas.map((p) => {
  const pasta = p.post ? path.join(out, p.post) : null;
  const imgs = pasta && fs.existsSync(pasta) ? fs.readdirSync(pasta).filter((f) => /^\d+\.png$/.test(f)).sort() : [];
  if (p.post && !imgs.length) avisos.push(`${p.titulo}: sem imagens em out/${p.post}/ (rode node render.mjs posts/${p.post}.json)`);
  const video = p.video && fs.existsSync(path.join(out, p.video, 'video.mp4')) ? `${p.video}/video.mp4` : null;
  const n = p.criterios?.length ? nota(p.criterios) : null;
  const passou = n && n.valor >= minima - 1e-9;
  const portaoOk = /^aprovad/i.test(p.portao || '');
  const selos = [
    n ? `<span class="${passou ? 'ok' : 'baixo'}">nota ${virgula(n.valor)}</span>` : '<span class="baixo">sem nota</span>',
    `<span class="${portaoOk ? 'ok' : 'baixo'}">portão ${esc(p.portao || 'não rodado')}</span>`,
  ].join(' ');
  const tabela = n ? `<table class="sc"><tr><td>Critério</td><td>Peso</td><td>Nota</td><td>Por quê</td></tr>
    ${p.criterios.map((c) => `<tr><td>${esc(c[0])}</td><td>${virgula((c[1] / n.pesos) * 100, 0)}%</td><td>${esc(c[2])}</td><td>${esc(c[3] || '')}</td></tr>`).join('')}
    <tr><td colspan="4">${n.partes.map((x) => virgula(x, 2)).join(' + ')} = <b>${virgula(n.valor)}</b>${n.pesos !== 100 ? ` (pesos redistribuídos sobre ${n.pesos}%)` : ''}${p.auditoria ? `. ${esc(p.auditoria)}` : ''}</td></tr></table>` : '';
  const roteiro = p.roteiro ? `<table>${p.roteiro.map(([t, x]) => `<tr><td class="t">${esc(t)}</td><td>${esc(x)}</td></tr>`).join('')}</table>` : '';
  const legendas = Object.entries(p.legendas || {}).map(([rede, txt]) => `<p class="rede">Legenda · ${esc(rede)}</p><div class="leg">${esc(txt)}</div>`).join('');
  return `<section class="peca"><div class="topo"><h2>${esc(p.titulo)}</h2><span><span class="tag">${esc(p.onde || '')}</span> ${selos}</span></div>
    ${video ? `<video src="${video}" controls playsinline preload="metadata"></video>` : ''}
    ${imgs.length ? `<div class="imgs">${imgs.map((f) => `<img src="${p.post}/${f}" alt="">`).join('')}</div>` : ''}
    ${p.aviso ? `<p class="aviso">${esc(p.aviso)}</p>` : ''}${roteiro}${legendas}${tabela}</section>`;
});

const c = marca.cores || {};
const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Revisão · ${esc(r.titulo)}</title>
<style>
body{font-family:system-ui,-apple-system,sans-serif;background:#F5F5F5;color:#111;margin:0;padding:40px 16px}
.w{max-width:1100px;margin:0 auto;display:grid;gap:40px}
h1{font-size:28px;margin:0}.sub{color:#555;margin-top:6px;line-height:1.5}
.peca{background:#fff;border-radius:20px;padding:24px;display:grid;gap:16px;min-width:0}
.topo{display:flex;flex-wrap:wrap;gap:12px;align-items:baseline;justify-content:space-between}.topo h2{margin:0;font-size:20px}.tag{font-size:13px;color:#666}
.ok,.baixo{font-weight:700;font-size:13px;padding:4px 10px;border-radius:99px}.ok{background:#e3f4ea;color:#08874A}.baixo{background:#fdecea;color:#C40303}
.imgs{display:flex;gap:10px;overflow-x:auto;padding-bottom:6px}.imgs img{height:340px;border-radius:10px;flex:none;cursor:zoom-in}
video{height:520px;max-width:100%;border-radius:12px;background:#000;justify-self:start}
.leg{white-space:pre-wrap;background:#FAF8F6;border-radius:12px;padding:16px;font-size:14px;line-height:1.55}
.rede{font-size:12px;font-weight:700;color:${esc(c.escura || '#333')};margin:0 0 -8px}
table{border-collapse:collapse;font-size:14px}td{border-top:1px solid #eee;padding:8px 10px;vertical-align:top}td.t{white-space:nowrap;color:#666}
.sc td:nth-child(2),.sc td:nth-child(3){text-align:center;white-space:nowrap}.sc tr:first-child td{font-weight:700;border-top:0}
.aviso{font-size:13px;color:#9A4A00;margin:0}.avisos{background:#fff4e5;border-radius:12px;padding:12px 16px;font-size:14px}
#zoom{position:fixed;inset:0;background:#000d;display:none;place-items:center;cursor:zoom-out}#zoom img{max-width:94vw;max-height:94vh}
</style></head><body><div class="w">
<div><h1>${esc(r.titulo)}</h1><p class="sub">${esc(r.sub || '')} Nota mínima ${virgula(minima)}. Nada publicado: aprove peça por peça.</p></div>
${avisos.length ? `<div class="avisos">${avisos.map(esc).join('<br>')}</div>` : ''}
${pecas.join('\n')}
</div><div id="zoom"><img alt=""></div>
<script>const z=document.getElementById('zoom');document.querySelectorAll('.imgs img').forEach(i=>i.onclick=()=>{z.firstChild.src=i.src;z.style.display='grid'});z.onclick=()=>z.style.display='none'</script>
</body></html>`;
fs.mkdirSync(out, { recursive: true });
const destino = path.join(out, `revisao-${slug}.html`);
fs.writeFileSync(destino, html);
avisos.forEach((a) => console.warn('aviso:', a));
console.log(path.relative(process.cwd(), destino));
