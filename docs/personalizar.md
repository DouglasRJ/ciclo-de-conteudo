# Pôr a sua marca

A skill `configurar-marca` faz isto com você. Este guia é para ajustar à mão.

## Cores

Em `marketing/modelos/marca.json`:

```json
"cores": {
  "primaria": "#4F46E5",
  "secundaria": "#22D3EE",
  "escura": "#312E81",
  "fundoEscuro": "#0B0B12",
  "claro": "#F5F5F7",
  "texto": "#2B2B2B",
  "apagado": "#6B6B6B",
  "ok": "#08874A",
  "alerta": "#B26A00",
  "erro": "#E20404"
}
```

- `primaria` é o fundo da capa, da tela e da chamada, com texto branco por cima. Cor clara demais (amarelo, verde-limão) fica ilegível: use a versão escura da marca como primária e a clara como `secundaria`.
- `secundaria` e `escura` fazem o brilho dos cantos (e o degradê da foto). Os tons translúcidos são calculados a partir delas; não há outra cor fixa nos modelos.
- `ok`, `alerta` e `erro` só aparecem nas etiquetas de status da tela desenhada.

Para testar sem estragar nada: mude, rode `node render.mjs posts/exemplo-carrossel.json` e olhe a `out/exemplo-carrossel/previa.png`.

## Fonte

```json
"fonte": {
  "familia": "Inter",
  "arquivos": {
    "400": "assets/fonts/Inter-Regular.ttf",
    "600": "assets/fonts/Inter-SemiBold.ttf",
    "700": "assets/fonts/Inter-Bold.ttf"
  }
}
```

Os modelos usam os pesos 200 (detalhes), 400 (texto), 600 (rótulos) e 700 (títulos). Peso que faltar, o navegador aproxima. Aceita TTF, OTF, WOFF e WOFF2. Confira a licença da fonte antes de pôr no repositório.

## Logo e símbolo

- `assets/logo.svg`: aparece no slide `cta`, nos slides de foto e no fim do vídeo.
- `assets/simbolo.svg`: rodapé, marca d'água grande nos slides de cor, ícone da barra do app desenhado e a contagem do vídeo.

Os dois precisam pintar com `currentColor`: troque `fill="#1A73E8"` por `fill="currentColor"` (o modelo decide se fica branco ou na cor da marca). Texto dentro do SVG depende da fonte carregada; para garantir, converta o texto em curvas no seu editor.

No vídeo, cada filho direto do SVG do símbolo (`<path>`, `<circle>`, `<g>`) anima como um pedaço. Um símbolo de 3 partes fica melhor com 3 elementos separados.

## Textos padrão

```json
"rodape": "@suamarca",
"textos": {
  "botao": "Comece grátis",
  "tagline": "Seu slogan curto aqui.",
  "arrasta": "Arrasta pro lado",
  "rotuloMensagem": "Mensagem pronta para copiar",
  "status": { "ok": "Pago", "pendente": "Pendente", "alerta": "Atrasado" }
}
```

Cada post pode trocar o botão (`"botao"` no slide `cta`), esconder o slogan (`"tagline": ""`) e mudar o rodapé (`"rodape"` no post).

## Layout e formas

`modelo.html` é HTML e CSS comuns, um tipo de slide por função em `TIPOS`. Para um tipo novo: acrescente uma função em `TIPOS` que devolve `{ classe, html }` e o CSS dela. Para outro formato (ex.: quadrado 1080x1080), acrescente uma classe como `.story` com outra `--h`.

Formas que já vêm, e que valem manter coerentes entre imagem e vídeo:
- Destaque de palavra e etiqueta da capa em paralelogramo de cantos retos.
- Etiqueta das páginas de dentro em pílula.
- Botão em retângulo de canto levemente arredondado, sem seta.

## Vídeo

A coreografia é por vídeo (`videos/<slug>.html`). Para criar um estilo próprio, copie `exemplo-video.html`, mantenha o contrato (`window.preparar(post, marca)` devolve a duração em ms, `window.quadro(t)` desenha o instante, `window.T` é a linha do tempo) e mude o resto. A trilha (`<slug>.trilha.mjs`) exporta `gerar({ T, fim })` e `wav(...)`.
