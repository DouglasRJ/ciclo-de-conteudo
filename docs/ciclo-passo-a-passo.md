# Um ciclo, do começo ao fim

Exemplo com a marca fictícia do kit ("Sua Marca"). Os arquivos de exemplo citados estão em `marketing/modelos/` depois do `/configurar-marca`.

## Segunda de manhã: `/planejar-posts-semana`

**1. O que aconteceu.** O Claude lê os 3 últimos arquivos em `ciclos/` e, se o Blotato estiver conectado, os posts publicados e os mais vistos e comentados dos últimos 30 dias. Responde algo como:

| Peça | Rede | Views | Comentários | Nota prevista |
|---|---|---|---|---|
| Carrossel "4 passos" | Instagram | 2.140 | 18 | 8,6 |
| Vídeo "Teste de 3 segundos" | Instagram | 5.900 | 31 | 8,5 |
| Frase | Facebook | 310 | 2 | 8,7 |

> 1. Vídeo com desafio no 1º segundo teve 2,7x as views do carrossel.
> 2. A frase teve a maior nota e o menor alcance: no Facebook, frase solta não circula.
> 3. Ainda é cedo para falar de horário (2 semanas).

Sem Blotato: "sem dado do Blotato", e ele pede para você colar os números, se quiser.

**2. Pautas.** Três sugestões da `fila.md`, cada uma com persona, por que agora e se já tem guia. Uma tela de perguntas: assunto, persona, peças, algo para evitar.

**3. O ciclo.**

- *SEO:* a busca principal e 2 variações, quem aparece, o que essas páginas não respondem. Fica registrado como "resultados da busca na web", nunca como "topo do Google".
- *Produto:* tudo que o post vai citar é conferido no `produto.md` (e no código, se ele aponta). Recurso pago aparece com a chamada certa.
- *Guia:* se o `config.md` diz que o seu site tem guias, um texto novo com resposta curta, passos, exemplo pronto e FAQ.
- *Peças:* cada uma com a tabela de nota. Exemplo:

| Critério | Peso | Nota | Por quê |
|---|---|---|---|
| Gancho | 50% | 9 | Toma posição contra a desculpa mais comum |
| Curiosidade e detalhe | 10% | 8 | "3 vezes", e os 3 lugares |
| Emoção | 10% | 8 | Alívio: o problema não é você |
| Compartilhar ou salvar | 10% | 9 | Os 4 passos servem sem o produto |
| Voz | 10% | 8 | Direto, frases curtas |
| Polêmica | 5% | 7 | Contraria "não tenho tempo" |
| Encaixe na rede | 5% | 8 | 6 slides, motivo para salvar |

`4,50 + 0,80 + 0,80 + 0,90 + 0,80 + 0,35 + 0,40 = 8,6`

E o portão: bloqueios B1 a B9, os da marca, e a auditoria em português (travessão, números em algarismo, emojis, hashtags por rede).

- *Imagens:* `posts/ciclo03-carrossel.json` → `node render.mjs posts/ciclo03-carrossel.json`. O Claude olha a `previa.png` antes de mostrar.
- *Vídeo:* nesta etapa é só roteiro com tempos + quadros (o JSON do vídeo renderizado como imagens). Você aprova a ideia antes de gastar tempo com animação.
- *Revisão:* `revisoes/ciclo03.json` → `node revisao.mjs revisoes/ciclo03.json` → abre `out/revisao-ciclo03.html`.

**4. Você aprova** peça por peça. O que voltar, ele reescreve e passa no portão de novo.

## Depois da aprovação

1. **Vídeo:** a skill `video-post` copia a coreografia de exemplo, monta a linha do tempo pelo roteiro, confere a folha de quadros, gera a trilha (-16 a -14 LUFS) e o MP4. Você assiste e aprova o vídeo pronto.
2. **Guia:** commit no seu repositório. Publicar o site é outra pergunta.
3. **Agendar:** com o Blotato, ele confirma as contas, sobe as imagens e o vídeo e agenda (padrão: 1 peça por dia às 19h). Story com figurinha de enquete fica para você postar à mão.
4. **Registro:** o arquivo do ciclo ganha o que foi agendado e quando; a fila marca o assunto como publicado.

Na outra segunda, `/planejar-posts-semana` começa lendo o resultado deste.
