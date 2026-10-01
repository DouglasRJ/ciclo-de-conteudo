---
name: planejar-posts-semana
description: Ciclo semanal de conteúdo de ponta a ponta, em português. Lê os últimos ciclos, puxa os resultados (Blotato e, se configurado, cadastros por página), diz o que deu certo, sugere pautas, pergunta o foco da semana e faz o ciclo de fato: estudo de SEO do assunto, guia no site (opcional), posts com nota e portão, imagens nos modelos da marca, roteiro e quadros do vídeo, página de revisão. Depois da aprovação, gera o MP4, publica o guia (commit; deploy só com OK) e agenda os posts no Blotato. Use quando o usuário digitar /planejar-posts-semana ou pedir "planeja os posts da semana", "o que a gente posta essa semana", "como foram os posts", "faz o ciclo da semana".
---

# Planejar os posts da semana

Um ciclo = **1 assunto → 1 guia no site (opcional) → até 5 peças nas redes**, aprovado pelo usuário antes de qualquer publicação.

## Antes de tudo

Ache a pasta de marketing: `find . -name brand-brief.md -not -path '*/node_modules/*'`. Não achou: carregue a skill `configurar-marca` e faça a configuração primeiro.

Arquivos que este fluxo usa (caminhos relativos à pasta de marketing):
- `brand-brief.md`: voz, personas, chamada, regras visuais.
- `produto.md`: fatos do produto (o que é grátis, pago, o que não existe, onde conferir).
- `config.md`: redes, horário, nota mínima, fontes de resultado, guia no site, estudo de SEO.
- `fila.md`: assuntos com status.
- `ciclos/AAAA-MM-DD-<slug>.md`: um arquivo por ciclo, no formato de `ciclos/_modelo.md`.
- `modelos/`: imagens (`posts/*.json` → `node render.mjs`), vídeo (`node video.mjs`), revisão (`revisoes/*.json` → `node revisao.mjs`). Manual em `modelos/README.md`.
- Skill `portao-de-post`: nota e portão obrigatórios de toda peça. Carregue antes de escrever.
- Skill `video-post`: transforma o vídeo aprovado (roteiro + quadros) no MP4 animado com trilha.

## Etapa 1. O que aconteceu

1. Leia os 3 ciclos mais recentes em `ciclos/` (o que foi planejado, publicado e quando). Primeiro ciclo: diga isso e pule para a etapa 3.
2. **Redes (Blotato MCP), se `config.md` diz sim:**
   - `blotato_list_posts` com `status: ["published"]` e `since` = data do ciclo mais antigo lido.
   - `blotato_list_top_posts` por `views_count` e de novo por `comments_count` nos últimos 30 dias.
   - O Blotato só mede algumas redes (X, Instagram, Facebook, Threads, Bluesky); o resto fica "sem dado".
   - Erro de assinatura ou de conexão: diga em 1 linha e siga. Com o Blotato fora, o que vale é "sem dado do Blotato", nunca "nada publicado": só diga que não tem post se a consulta respondeu.
   - Sem Blotato: peça ao usuário para colar os números (views, salvamentos, comentários) ou siga sem.
3. **Cadastros por página de entrada, se `config.md` tem o comando:** peça autorização na primeira vez da conversa e rode exatamente o comando do `config.md`. Só leitura e agregado: nunca selecione dado de pessoa, nunca escreva no banco. Recusado ou sem acesso: siga sem.
4. **Search Console:** se o usuário colar números, use; senão, "sem dado".

## Etapa 2. O que deu certo

Resumo curto:
- Tabela das peças publicadas: peça, rede, views, comentários, salvamentos quando houver, e a nota que ela tirou no ciclo.
- **3 aprendizados no máximo**, cada um com o número que o sustenta: tipo de gancho, formato, persona, rede, horário. Compare com a nota prevista: nota alta e resultado baixo também é aprendizado.
- Cadastros por página de entrada, destacando os guias.
- Com menos de 2 semanas publicadas, diga que ainda é cedo para concluir e não invente padrão.

## Etapa 3. Sugerir e perguntar

1. Leia `fila.md`. Sugira **3 pautas**: as livres de maior prioridade, ajustadas pelos aprendizados. Para cada uma: assunto, persona, por que agora, e se já existe guia (aí o ciclo amplia o guia em vez de criar outro disputando a mesma busca).
2. Pergunte com `AskUserQuestion`, numa chamada só:
   - **Assunto da semana** (as 3 sugestões; "Other" livre).
   - **Persona** (as do brief, ou todas).
   - **Peças** (multiSelect, as de `config.md`; padrão: carrossel, vídeo curto, story com enquete, post no Facebook, frase).
   - **Algo para evitar ou destacar** (um recurso novo, uma data).

## Etapa 4. Fazer o ciclo

Marque o assunto como `planejado AAAA-MM-DD` na fila e crie `ciclos/AAAA-MM-DD-<slug>.md` a partir de `ciclos/_modelo.md`. Numere o ciclo (NN) pela quantidade de ciclos já feitos.

1. **Estudo de SEO do assunto:**
   - Se `config.md` aponta uma pasta de estudo de SEO, veja o que ela diz do tema.
   - Pesquise a busca principal e 2 variações (WebSearch): quem aparece, as perguntas que as páginas respondem, o que falta nelas.
   - **O WebSearch não mostra o Google do Brasil nem o "As pessoas também perguntam".** Registre como "resultados da busca na web", nunca como "topo do Google". Escreva de onde veio cada pergunta do FAQ. Se o usuário colar o PAA, use.
   - Confira os guias que já existem para não criar 2 disputando a mesma busca.
   - Registre no ciclo: busca alvo, variações, perguntas do FAQ e a lacuna que o guia vai cobrir.
2. **Conferir o produto:** antes de prometer qualquer recurso, confira no `produto.md` e, se ele aponta código, no código. Recurso novo desde a última conferência: atualize o `produto.md`.
   - **Tela desenhada copia a tela de verdade:** título, rótulos e botões do componente. Nunca invente um formulário mais simples que o real.
   - **Quantidade de toques e passos só depois de conferir.**
3. **Guia no site (se `config.md` diz sim):** onde e no formato que o `config.md` diz. Formato que responde bem a busca e a assistentes de IA: resposta curta no topo, passos, exemplo pronto (mensagem, modelo, lista), FAQ com as perguntas do estudo, e "onde o produto ajuda" deixando claro o que é pago. Atualize o que o `config.md` lista (sitemap, llms.txt) e rode o teste dele; só siga com tudo passando.
4. **Peças:** escreva cada uma seguindo o `brand-brief.md` e passe pela skill `portao-de-post` até a **nota mínima do `config.md`** (padrão 8,5) com a tabela dos 7 critérios. Abaixo disso, reescreva; só mostre abaixo da mínima com a nota real e o motivo. O que mais sobe a nota: gancho que toma posição ou mostra um momento constrangedor específico; um slide que ensine algo usável sem o produto; formato de lista ou teste no carrossel. O vídeo vira desafio + dica + produto.
5. **Imagens:** um JSON por peça visual em `modelos/posts/cicloNN-<peca>.json` e `node render.mjs posts/cicloNN-<peca>.json`. O vídeo curto entra aqui como **roteiro com tempos** (no arquivo do ciclo) **+ quadros** (`cicloNN-video.json`, formato `story`, cada slide uma cena); o MP4 só é feito na etapa 5. **Olhe a `previa.png` de cada uma** antes de mostrar: texto sobrando, destaque quebrando linha, slide vazio, celular cobrindo título.
6. **Página de revisão:** escreva `modelos/revisoes/cicloNN.json` (peças, legendas por rede, roteiro, critérios da nota, portão; modelo em `revisoes/exemplo.json`), rode `node revisao.mjs revisoes/cicloNN.json` e abra a página (`open`, `xdg-open` ou `start`). A página calcula a nota; se ela der diferente da sua conta, a sua está errada.
7. Apresente em poucas linhas: a busca alvo, o guia, a tabela das peças (gancho, nota, portão) e o que precisa de mão humana (figurinha de story, narração). Pergunte o que aprovar, peça por peça.

## Etapa 5. Depois da aprovação

Só o que o usuário aprovou, e só depois do OK explícito.

1. **Guia:** commit do guia e do que ele atualiza. **Commit não é deploy:** pergunte se pode publicar o site. Posts que linkam o guia só são agendados para depois do guia estar no ar.
2. **Vídeo:** aprovado o roteiro e os quadros, carregue a skill `video-post` e gere o MP4. Mostre o vídeo e só agende depois de um OK no vídeo pronto (aprovar a ideia não é aprovar o MP4). Registre no ciclo o caminho do MP4 e a duração.
3. **Agendar no Blotato (se conectado):**
   - `blotato_list_accounts` e confirme com o usuário as contas de destino.
   - Para cada imagem: `blotato_create_presigned_upload_url`, envie o PNG (`curl -X PUT --upload-file`), use a URL pública.
   - Vídeo: envie o `video.mp4` do mesmo jeito e agende como Reels/vídeo curto; a `capa.png` vai como capa quando a rede aceitar. **Não** use `blotato_create_visual`: ele não usa a marca nem os quadros aprovados. Sem música da rede por cima: o vídeo já tem trilha.
   - `blotato_create_post` no horário do `config.md` (padrão: 1 peça por dia, 19h de Brasília; a do Facebook num dia diferente da do carrossel), com os campos obrigatórios de cada rede que o `list_accounts` devolve.
   - Story com figurinha de enquete ou link: **não agende**. Gere as imagens e avise que entram à mão.
   - Sem Blotato: entregue a lista de arquivos e legendas por dia para o usuário postar.
4. Atualize o arquivo do ciclo (o que foi agendado, quando, ids) e a fila (`publicado AAAA-MM-DD`).
5. Feche com a lista do que foi agendado e a data em que vale rodar `/planejar-posts-semana` de novo para ver os resultados (7 dias depois da última peça).

## Não fazer

- Publicar, agendar ou fazer deploy sem aprovação explícita daquela peça ou daquele deploy.
- Inventar resultado. Sem dado é "sem dado".
- Repetir assunto publicado nas últimas 4 semanas, a menos que o usuário peça.
- Pular o portão porque a nota é alta.
- Afirmar o que não conferiu: nota sem tabela, "nada publicado" sem a consulta ter respondido, "topo do Google" a partir do WebSearch, tela ou número de toques sem ver o componente. Sem conferir, diga "estimativa" ou "sem dado".
- Escrever no banco de dados ou ler dado de pessoa para medir resultado.
