---
name: video-post
description: Transforma a ideia aprovada de um vídeo curto (roteiro + quadros num JSON de `modelos/posts/`) num MP4 de verdade, 1080x1920, com motion design fluido e minimalista, nas cores, fonte e logo da marca, e trilha sonora e efeitos sintetizados no código e sincronizados com a animação. Use quando o usuário aprovar o vídeo de um ciclo (etapa 5 do `planejar-posts-semana`) ou pedir "gera o vídeo", "anima esse post", "transforma os quadros em vídeo", "faz o reels", "faz um vídeo curto", "coloca som no vídeo", "ajusta a animação do vídeo". Se você está prestes a gerar o vídeo por uma ferramenta de IA de vídeo, a usar música de terceiros, a animar com transição CSS/keyframes em vez de quadro(t), ou a dizer que o vídeo está pronto sem ter olhado a folha de quadros: PARE e leia isto.
---

# Vídeo de post: dos quadros ao MP4

O vídeo nasce da peça **já aprovada**: o JSON de quadros (`modelos/posts/<slug>.json`, formato `story`, cada slide uma cena) e o roteiro com tempos no arquivo do ciclo (tabela "Tempo | Narração"). Esta skill não muda texto: o que aparece na tela sai do JSON que passou pelo `portao-de-post`. Frase nova na tela = volta para o portão.

Referência pronta, copie e adapte (na pasta `modelos/` do projeto): `videos/exemplo-video.html` (coreografia) e `videos/exemplo-video.trilha.mjs` (som). O renderizador é genérico: `video.mjs` (manual no `modelos/README.md`). Cores, fonte e logo vêm do `marca.json`: a coreografia nunca escreve uma cor fixa, usa `var(--primaria)` e as outras variáveis.

## Como funciona

- **Um relógio, nada de CSS animation.** `window.quadro(t)` desenha o instante `t` (ms) e é pura: o mesmo `t` dá a mesma imagem. O `video.mjs` chama quadro a quadro, captura com o Chrome e monta o MP4 no ffmpeg. Por isso não tem quadro pulado nem animação dessincronizada. O relógio é linear; nenhum movimento na tela é.
- **Linha do tempo única `T`** no topo do HTML, com nome de gesto (`papel`, `cortina`, `logo`...). `window.T = T` é exportado e a trilha lê o mesmo `T`: mudou um tempo, o som acompanha. `T.capa` é o instante da `capa.png`.
- **Textos vêm do JSON** via `window.preparar(post, marca)`; o HTML só tem a coreografia.

## Passo a passo

1. **Leia** o JSON de quadros, o roteiro com tempos e a `previa.png` estática (`node render.mjs posts/<slug>.json`).
2. **Copie a referência** para `videos/<slug>.html` e `videos/<slug>.trilha.mjs` (o nome tem que ser o `slug` do JSON). Reaproveite os gestos e as transições; troque as cenas. A referência espera 5 slides (capa, contagem, dica no papel, tela, chamada); outra estrutura = ajuste o `preparar` e o `quadro`.
3. **Monte o `T`** casando com o roteiro:
   - Gancho legível em até **0,6 s** (o primeiro segundo decide se a pessoa fica).
   - Texto parado no mínimo **~250 ms por palavra + 1 s** antes de sair.
   - Momentos-chave (entrada da batida, troca de cena, logo) na grade de **120 bpm (500 ms)**; contagem a 750 ms. Assim a trilha encaixa sem esforço.
   - Chamada final parada **pelo menos 2 s**. Total entre 15 e 20 s.
4. **Folha de quadros:** `node video.mjs posts/<slug>.json --folha` e **olhe** `out/<slug>/folha.png` (um quadro a cada 0,5 s). Instante isolado: `--em=2500,9300`. Corrija e repita até não ter defeito.
5. **Trilha:** adapte `<slug>.trilha.mjs` (acordes, efeito de cada gesto). `node video.mjs posts/<slug>.json --trilha` gera só o WAV. Você não ouve áudio, então confira por medida e por imagem:
   - `ffmpeg -i out/<slug>/trilha.wav -af ebur128 -f null - 2>&1 | grep -A1 Integrated` → entre **-16 e -14 LUFS**.
   - `showwavespic` e `showspectrumpic` (ffmpeg) e olhe a imagem: cada efeito no instante do gesto, bumbo sem engolir o resto, nada estourado.
6. **Render:** `node video.mjs posts/<slug>.json` → `out/<slug>/video.mp4` (com som) e `capa.png`. Confira as transições no MP4 final:
   ```bash
   ffmpeg -v error -y -i out/<slug>/video.mp4 -vf "select='between(t,2.5,3.1)+between(t,8.9,9.5)',scale=180:-1,tile=17x2" -frames:v 1 -vsync 0 trans.png
   ```
   E confirme o som no arquivo: `ffprobe` com stream `aac` e `volumedetect` com `max_volume` perto de -1 dB.
7. **Mostre** o vídeo (`open`, `xdg-open` ou `start`). Diga a estrutura cena a cena em poucas linhas, que a trilha é sintetizada (sem direito autoral) e que **não se escolhe música da rede por cima**. Peça para o usuário ouvir: você conferiu o áudio por gráfico, não de ouvido. Diga isso com clareza, sem dar a entender que o MP4 está mudo.
8. Apague os arquivos de conferência (`trans.png`, `quadro-*.png`, `folha.png`, imagens de onda). Ficam `video.mp4`, `capa.png` e `trilha.wav`.

## Linguagem do movimento

Minimalista e calmo: um gesto por elemento, sem repique, sem piscar, sem loop. A abertura (bolinha que cresce, tela que se parte em duas metades curvas) aparece no máximo 2 vezes; as outras transições variam.

**Curvas:** `EASE_OUT (0.22,1,0.36,1)` para entrar, `EASE_IN (0.55,0,0.9,0.3)` para sair, `EASE_FILL (0.8,0,0.2,1)` para cobrir a tela, `EASE_SPLIT (0.7,0,0.3,1)` para abrir, `EASE_POP (0.34,1.56,0.64,1)` para etiqueta e botão, e `mola()` analítica para objeto que assenta (celular).

**Gestos prontos na referência:**
| Gesto | Uso |
|---|---|
| `revela(ws, ...)` | Palavras sobem de dentro de uma máscara, uma a uma (títulos). `solto: true` para parágrafo: sobe 28 px e aparece. Com `saida`, sobem para fora |
| `etiqueta(el, ...)` | Tema em paralelogramo abre da esquerda e fecha pela esquerda |
| `destaque(marcas, ...)` | Fundo branco do `*destaque*` corre e o texto passa de branco à cor da marca; na saída recolhe para a direita |
| `pecasEntram(pecas, ...)` | Os pedaços do símbolo (cada filho do SVG) correm da esquerda, um depois do outro |
| marca-texto | `**trecho**` no papel ganha um traço na cor da marca que atravessa a quebra de linha |
| contador | Valor da métrica conta de 0 até o número do JSON, mantendo prefixo, sufixo e casas (`R$ 1.860,00`, `3,5 h`) |
| logo | Revela da esquerda para a direita por máscara |

**Transições já usadas** (varie, não repita a mesma seguida): bolinha que abre em círculo · capa que se parte em duas metades curvas · papel que sobe com borda curva · cortina em paralelogramo da direita para a esquerda · mesma cor de fundo, só o conteúdo troca.

**Ideia que amarra:** procure um elemento da marca que conte a história (as partes do símbolo, uma forma do logo) e use no começo e no fim.

## Som

Trilha e efeitos são **sintetizados no `<slug>.trilha.mjs`** (Node puro, sem dependência): acorde de fundo, corda dedilhada, marimba, bumbo, estalo, chimbal, baixo; sopro (ruído filtrado), bolha, tic de madeira, toque, clique, rabisco. Nada de música baixada ou de banco de sons: direito autoral.

- Estrutura: abertura leve → tensão quase em silêncio no momento de suspense → a batida entra com a virada da história → resolve no logo e some até o fim.
- **Cada gesto tem um som** no quadro dele, curto e baixo: abrir/cobrir = sopro; assentar = toque grave; cartão = toque; status = bolha; contador = cliques desacelerando; logo = 3 notas subindo. Sopro de cortina com pan acompanhando a direção.
- Celular reproduz mal abaixo de 80 Hz: grave serve de peso, não de melodia; baixo com 2º harmônico.
- A música "bombeia" a cada bumbo (sidechain) para a batida respirar.

## Erros que já aconteceram

- **Lasca do paralelogramo:** `clip-path` de etiqueta fechada vira uma fatia fina na borda. Esconda (`visibility`) quando fechada nas duas pontas.
- **Texto aparecendo no corte:** o conteúdo da cena tem que sair **antes** da transição começar; o fundo branco do destaque sai junto.
- **Chamada repetida:** texto acima do botão que diz o mesmo que o botão. No vídeo, fica só o botão.
- **Slogan apagado:** peso 200 com transparência some na cor da marca em tela de celular. Use 600, branco, 36 px.
- **Rodar as imagens de novo apagava o vídeo:** corrigido no `render.mjs` (só apaga os PNGs dos slides). Se mexer nele, mantenha assim.
- **Dizer "não consigo ouvir"** sem explicar fez o usuário achar que o MP4 estava mudo. Separe: "o vídeo tem som; eu conferi por gráfico, ouça para julgar".

## Não fazer

- Gerar o vídeo por ferramenta de vídeo por IA (ex.: `blotato_create_visual`): ela não usa a marca nem os quadros aprovados. O agendador só recebe o MP4 pronto.
- Escrever texto novo na tela sem passar pelo `portao-de-post`.
- Dizer que está pronto sem ter olhado a folha de quadros e o quadro das transições.
- Usar `transition`, `@keyframes` ou animação por conta própria na coreografia: tudo sai de `quadro(t)` (o `requestAnimationFrame` da prévia `?play` só avança o relógio).
- Cor fixa na coreografia: use as variáveis da marca.
