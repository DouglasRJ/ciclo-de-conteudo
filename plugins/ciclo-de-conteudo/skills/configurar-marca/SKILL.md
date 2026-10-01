---
name: configurar-marca
description: Prepara um projeto para o ciclo semanal de conteúdo. Cria a pasta `marketing/` com o brand brief, os fatos do produto (o que é grátis, o que é pago, o que não existe), a fila de assuntos, a configuração do ciclo e o motor de imagens e vídeo com as cores, a fonte e o logo da marca, e confere tudo gerando um post de exemplo. Use na primeira vez, quando o usuário digitar /configurar-marca ou pedir "configura a marca", "prepara o marketing deste projeto", "quero começar a usar o ciclo de conteúdo", "troca as cores/logo/fonte dos posts", ou quando outra skill do ciclo não achar `marketing/brand-brief.md`.
---

# Configurar a marca

Deixa o projeto pronto para `planejar-posts-semana`, `portao-de-post` e `video-post`. No fim, existe uma pasta de marketing com:

```
marketing/
  brand-brief.md   voz, personas, chamada, regras (o mesmo arquivo que as skills do Blotato leem)
  produto.md       fatos do produto: o que faz, o que é grátis e pago, o que NÃO faz, onde conferir
  fila.md          assuntos por prioridade
  config.md        redes, horário, nota mínima, fontes de resultado, guia no site
  ciclos/          um arquivo por semana
  modelos/         motor de imagens, vídeo e revisão (marca.json, render.mjs, video.mjs, revisao.mjs)
```

O kit de partida está na pasta `kit/` ao lado deste SKILL.md (o caminho base desta skill aparece quando ela é carregada).

## 1. Onde

1. Procure uma pasta de marketing que já exista: `find . -name brand-brief.md -not -path '*/node_modules/*'`. Achou: é uma **atualização** (pule para o passo que o usuário pediu, sem sobrescrever nada que ele já escreveu).
2. Não achou: proponha `marketing/` na raiz (ou `docs/marketing/` se o projeto já tem `docs/`). Copie o kit sem apagar nada:
   ```bash
   cp -Rn "<base desta skill>/kit/marketing/." marketing/
   ```
3. `cd marketing/modelos && npm install`. Confira as dependências e diga o que falta, com o comando de instalação do sistema do usuário:
   - Node 18+ (`node -v`).
   - Chrome, Chromium ou Edge (o `lib.mjs` acha sozinho; senão `npx playwright install chromium`).
   - ffmpeg, só para vídeo (`ffmpeg -version`; macOS `brew install ffmpeg`, Ubuntu `sudo apt install ffmpeg`, Windows `winget install ffmpeg`).
4. Se o projeto tem git, sugira pôr `marketing/modelos/node_modules/` e `marketing/modelos/out/` no `.gitignore` (o kit já traz um `.gitignore` em `modelos/`).

## 2. Entender a marca antes de perguntar

Leia o que já existe antes de fazer qualquer pergunta: README, landing page, `package.json`, páginas de preço, manual de marca (PDF ou imagem que o usuário tenha na pasta), código de planos/assinatura, textos do app. Com isso, rascunhe o `brand-brief.md` e o `produto.md` e **só pergunte o que não deu para descobrir**.

Pergunte com `AskUserQuestion`, numa chamada só, no máximo 4 perguntas, por exemplo:
- Quem é o cliente principal (ofereça 2 ou 3 personas tiradas do que você leu).
- Qual a ação principal que o post pede (criar conta, chamar no WhatsApp, comprar...).
- Qual a opinião forte da marca (ofereça 2 rascunhos).
- Em quais redes posta.

Nunca invente história de origem, depoimento ou número de clientes: deixe o campo marcado "(confirmar antes de usar)".

## 3. Fatos do produto (`produto.md`)

É o arquivo mais importante para não publicar mentira. Preencha com o que **conferiu**:
- A tabela "O que o produto faz" com grátis/pago tirada do código ou da página de preços, não da memória. Diga em "Onde conferir" o arquivo exato.
- O que as pessoas acham que o produto faz e ele não faz (linha "não existe").
- A chamada certa para quando o post mostra recurso pago.
- Concorrentes, para o portão barrar o nome.
- As telas que provavelmente vão aparecer nos posts, com os rótulos reais do componente.

Se o produto não tem código acessível, pergunte ao usuário e escreva "conferido com o usuário em AAAA-MM-DD".

## 4. Visual (`modelos/marca.json`)

1. **Cores:** do manual, do CSS/tema do app (`tailwind.config`, `theme.ts`, variáveis CSS) ou do logo. `primaria` é a cor de fundo da capa e da chamada; precisa ter contraste com texto branco (confira: se for clara demais, como amarelo, avise e sugira usar a versão escura como primária). `secundaria` e `escura` fazem o brilho dos cantos.
2. **Fonte:** a da marca, em arquivos locais em `modelos/assets/fonts/` (um por peso: 200, 400, 600, 700, 800; o que faltar, o navegador aproxima). Fonte do Google Fonts: baixe os TTF do repositório oficial (`github.com/google/fonts`) e guarde a licença junto. Sem fonte de marca: mantenha a Poppins que vem no kit (licença OFL em `assets/fonts/OFL.txt`).
3. **Logo e símbolo:** SVG em `modelos/assets/logo.svg` e `simbolo.svg`, com `fill="currentColor"` (troque cores fixas por `currentColor` para o modelo pintar). Logo com texto em `<text>` depende da fonte carregada; prefira texto convertido em curvas. No vídeo, cada filho do SVG do símbolo anima como um pedaço.
4. **Textos:** `rodape` (site ou @), `textos.botao` (a chamada principal, curta), `textos.tagline` (slogan), rótulos de status.

## 5. Conferir

1. `node render.mjs posts/exemplo-carrossel.json` e **olhe** a `out/exemplo-carrossel/previa.png`: logo legível, texto branco legível na cor primária, destaque visível, nada cortado.
2. Se o usuário vai fazer vídeo: `node video.mjs posts/exemplo-video.json --folha` e olhe a `folha.png`.
3. Mostre a prévia com `open` (macOS), `xdg-open` (Linux) ou `start` (Windows).

## 6. Fila e configuração

- `fila.md`: 8 a 15 assuntos por prioridade. Fontes: estudo de SEO se houver, perguntas do suporte, dores do brief, páginas do site que merecem guia. Para cada um, o porquê e se já existe guia.
- `config.md`: preencha o que o usuário respondeu. Fonte de resultado que exige acesso a banco: só **consulta de leitura agregada**, nunca dado de pessoa; deixe "não" se não houver.

## 7. Fechar

Diga em poucas linhas: onde ficou a pasta, o que foi descoberto sozinho e o que ficou "(confirmar)", o que falta instalar, e o próximo passo: `/planejar-posts-semana`.

## Não fazer

- Sobrescrever `brand-brief.md`, `produto.md`, `fila.md` ou `marca.json` que já existam sem mostrar a diferença e ter um OK.
- Preencher fato do produto sem conferir. Na dúvida, "(confirmar)".
- Baixar fonte, foto ou logo de site de terceiros sem licença clara.
