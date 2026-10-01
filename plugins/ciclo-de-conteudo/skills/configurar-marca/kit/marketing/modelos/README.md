# Modelos de post

Gera carrossel, post único, story, vídeo curto (MP4 com trilha) e a página de revisão do ciclo, com as cores, a fonte e o logo do `marca.json`.

```bash
npm install                                    # uma vez (playwright-core, ~13 MB; usa o seu Chrome)
node render.mjs posts/exemplo-carrossel.json   # out/exemplo-carrossel/01.png... e previa.png
node video.mjs posts/exemplo-video.json        # out/exemplo-video/video.mp4 e capa.png
node revisao.mjs revisoes/exemplo.json         # out/revisao-exemplo.html
```

Precisa de Node 18+, Google Chrome (ou Chromium/Edge) e, para o vídeo, ffmpeg. O Chrome é achado sozinho no macOS, Linux e Windows; para outro caminho: `CHROME=/caminho node render.mjs ...`. Sem Chrome nenhum: `npx playwright install chromium`.

## A marca: `marca.json`

| Campo | Para quê |
|---|---|
| `nome`, `rodape` | O rodapé de cada slide mostra `rodape` (ex.: `@suamarca` ou `seusite.com`) |
| `cores.primaria` | Fundo da capa, da tela e da chamada; destaques e botões |
| `cores.secundaria`, `cores.escura` | Brilho dos cantos, sombras, degradê da foto |
| `cores.fundoEscuro` | Slide de frase e cor dos títulos nos slides claros |
| `cores.claro`, `texto`, `apagado` | Fundo dos slides claros, texto corrido, rodapé |
| `cores.ok`, `alerta`, `erro` | Etiquetas de status na tela desenhada |
| `fonte.familia`, `fonte.arquivos` | Fonte e um arquivo por peso (200, 400, 600, 700, 800). TTF, OTF, WOFF ou WOFF2 em `assets/fonts/` |
| `logo`, `simbolo` | SVGs em `assets/`. Use `fill="currentColor"` para o modelo pintar de branco ou na cor da marca |
| `textos.botao`, `textos.tagline` | Botão e slogan padrão do slide `cta` |
| `textos.arrasta`, `textos.rotuloMensagem` | "Arrasta pro lado" da capa, rótulo do balão de mensagem |
| `textos.status` | Rótulos de `ok`, `pendente`, `alerta` na tela desenhada |

**Símbolo no vídeo:** cada filho do SVG do símbolo (`<path>`, `<circle>`, `<g>`...) anima como um pedaço. Se o seu símbolo tem 3 partes, deixe 3 `<path>` separados.

## Como escrever um post

Um JSON em `posts/` com `slug`, `formato` (`feed` = 1080x1350, `story` = 1080x1920), `fundo` (opcional) e a lista de `slides`.

| Tipo | Fundo | Campos | Para quê |
|---|---|---|---|
| `capa` | cor | `tema`, `titulo`, `texto` | Primeiro slide. Mostra "Arrasta pro lado" quando há mais de 1 |
| `texto` | claro | `tema`, `titulo`, `texto` | Uma ideia por slide |
| `lista` | claro | `titulo`, `itens` | Passo a passo, até 4 itens |
| `mensagem` | claro | `titulo`, `mensagem`, `nota`, `rotulo` | Modelo de mensagem para copiar |
| `frase` | escuro | `frase`, `assinatura` | Opinião forte ou frase para salvar. Sozinho vira post único |
| `tela` | cor | `tema`, `selo`, `titulo`, `texto`, `barra`, `tela` ou `conversa` | Celular desenhado com uma tela do produto |
| `cta` | cor | `titulo`, `texto`, `botao`, `tagline` | Último slide, com logo e chamada. `"tagline": ""` esconde o slogan |
| `foto` | foto | `foto`, `topo`, `texto`, `posicao` | Foto com moldura na cor da marca; embaixo, vidro desfocado que vira degradê |
| `foto-vidro` | foto | `foto`, `topo`, `texto`, `botao`, `posicao` | Foto inteira com cartão de vidro fosco e botão |

No texto: `*palavra*` vira destaque (na capa, fica marcada em branco), `**palavra**` vira negrito e `\n` quebra a linha. O destaque não quebra de linha: marque 1 a 3 palavras.

### Tela desenhada (`tela`)

`tela` é uma lista de blocos, de cima para baixo:

| Bloco | Exemplo |
|---|---|
| título | `{ "titulo": "Criar cobrança", "sub": "Gere uma cobrança avulsa." }` |
| campo | `{ "campo": "Valor", "valor": "R$ 60,00", "foco": true }` |
| rótulo | `{ "rotulo": "Hoje" }` |
| cartão | `{ "cartao": "Ana Souza", "detalhe": "Seg · 15h", "icone": "pessoa", "status": "ok", "valor": "R$ 60", "acao": "Lembrar" }` |
| métricas | `{ "metricas": [["Recebido", "R$ 1.860,00"], ["A receber", "R$ 240,00"]] }` |
| perfil | `{ "perfil": "Ana Souza", "detalhe": "Manicure" }` |
| conversa com assistente | `{ "assistente": "Com o que você trabalha?" }`, `{ "voce": "Manicure" }`, `{ "chips": ["Mão", "+Pé e mão"] }`, `{ "entrada": "Escreva aqui" }` |
| botão | `{ "botao": "Salvar", "contorno": false }` |

Ícones: `pessoa`, `calendario`, `documento`, `dinheiro`, `servico`. Status: `ok`, `pendente`, `alerta` (os rótulos vêm de `textos.status`; `etiqueta` troca só naquele cartão).

Em vez de `tela`, `conversa` desenha um mensageiro: `{ "contato": "Sua Marca", "mensagem": "Oi! Seu horário é amanhã às 15h.", "hora": "09:00" }`.

**A tela tem que ser a do produto de verdade.** Copie título, rótulos e botões do componente real. Nunca invente um formulário mais simples que o real.

## Fundo

`"fundo"` no JSON do post. Sem ele, vale `brilho`.

- `brilho` (padrão): luz suave nos cantos, em todas as cores de slide.
- `caderno`: papel pautado com margem colorida nos slides claros. Bom para posts sobre sair do papel ou da planilha.
- `liso`, `pontos`, `grade`, `simbolo`: alternativas, só nos slides claros.

Para comparar sem editar o JSON: `node render.mjs posts/x.json --fundo=caderno`.

## Fotos

Fotos ficam em `fotos/`, e o caminho em `foto` é relativo ao JSON (ex.: `"../fotos/barbeiro.jpg"`). Use foto vertical de pelo menos 1080 px de largura e que você tenha direito de usar. `posicao` ajusta o enquadramento (`"center top"`, `"30% center"`).

## Vídeo (Reels, TikTok, Shorts)

A coreografia de cada vídeo fica em `videos/<slug>.html` e lê os textos do JSON de mesmo slug. `quadro(t)` desenha o instante `t` (ms); o script captura quadro a quadro e monta o MP4 com o ffmpeg. Comece copiando `videos/exemplo-video.html` e `videos/exemplo-video.trilha.mjs`.

```bash
node video.mjs posts/exemplo-video.json           # out/<slug>/video.mp4 (1080x1920, 30 fps, com som) e capa.png
node video.mjs posts/exemplo-video.json --folha   # out/<slug>/folha.png, um quadro a cada 0,5 s, para conferir
node video.mjs posts/exemplo-video.json --em=2500,9300  # só esses instantes
node video.mjs posts/exemplo-video.json --trilha  # só a trilha em out/<slug>/trilha.wav
node video.mjs posts/exemplo-video.json --sem-som
node video.mjs posts/exemplo-video.json --fps=60
```

Trilha e efeitos são sintetizados em `videos/<slug>.trilha.mjs` (sem arquivo de terceiros, sem direito autoral), lendo a mesma linha do tempo `T` da coreografia: mudou o tempo de um gesto, o som acompanha. Ao publicar com som próprio, não escolha música na rede por cima.

Prévia em tempo real (sem som), com barra de tempo: `npx serve .` nesta pasta e abra `videos/<slug>.html?play`.

## Página de revisão

`revisoes/<ciclo>.json` lista as peças do ciclo (post, vídeo, roteiro, legendas por rede, critérios da nota, portão). `node revisao.mjs revisoes/<ciclo>.json` monta `out/revisao-<ciclo>.html` com tudo lado a lado e **calcula a nota** a partir dos critérios (soma de peso x nota dividida pela soma dos pesos). Veja `revisoes/exemplo.json`.
