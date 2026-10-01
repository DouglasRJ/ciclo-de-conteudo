// Aplica a marca (marca.json) na página: cores em variáveis CSS, fonte e os SVGs do logo e do símbolo.
// Usado pelo modelo.html (imagens) e pelas coreografias em videos/ (base = '../').
window.aplicarMarca = async function (marca, base = '') {
  const css = document.documentElement.style;
  const nomes = { primaria: 'primaria', secundaria: 'secundaria', escura: 'escura', fundoEscuro: 'fundo-escuro', claro: 'claro', texto: 'texto', apagado: 'apagado', ok: 'ok', alerta: 'alerta', erro: 'erro' };
  for (const [chave, v] of Object.entries(marca.cores || {})) if (nomes[chave]) css.setProperty(`--${nomes[chave]}`, v);
  const f = marca.fonte || {};
  if (f.familia) {
    css.setProperty('--fonte', `"${f.familia}"`);
    await Promise.all(Object.entries(f.arquivos || {}).map(async ([peso, arquivo]) => {
      const face = new FontFace(f.familia, `url(${base}${arquivo})`, { weight: peso });
      document.fonts.add(await face.load());
    }));
  }
  const texto = async (arquivo) => (arquivo ? (await fetch(base + arquivo)).text() : '');
  const [simbolo, logo] = await Promise.all([texto(marca.simbolo), texto(marca.logo)]);
  return { simbolo, logo };
};
