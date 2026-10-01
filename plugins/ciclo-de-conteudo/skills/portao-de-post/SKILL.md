---
name: portao-de-post
description: Portão de qualidade e de verdade de QUALQUER post, carrossel, roteiro de vídeo, story, legenda ou guia de marketing em português. Dá a nota de alcance com a tabela dos 7 critérios e a conta feita, barra promessa de recurso que o produto não tem, recurso pago vendido como grátis, nome de concorrente ou de tecnologia, depoimento ou número inventado, mais de uma chamada, e faz a auditoria de escrita em português. Use SEMPRE antes de mostrar um post ao usuário ou de agendar, mesmo que o pedido seja só "escreve um post sobre X", "dá uma nota nesse post", "esse post tá bom?". Se você está prestes a entregar um post com nota "de olho", sem tabela, ou a escrever "grátis" perto de um recurso que você não conferiu no `produto.md`: PARE e leia isto.
---

# Portão de post

Um post que reprova aqui não vai para o usuário, mesmo com nota 9. A nota mede se o post para o dedo; o portão mede se ele é verdade e se soa bem em português.

Lê da pasta de marketing do projeto (a que tem `brand-brief.md`; ache com `find . -name brand-brief.md -not -path '*/node_modules/*'`):
- `brand-brief.md`: voz, personas, chamada, emojis preferidos.
- `produto.md`: **a fonte da verdade** do que o produto faz, do que é pago e dos bloqueios próprios da marca.
- `config.md`: nota mínima (padrão 8,5) e se story conta o critério de compartilhar.

Sem `brand-brief.md` ou `produto.md`: rode a skill `configurar-marca` antes. Sem os fatos do produto, o portão não tem como checar o B1 e o B2.

## Ordem

1. Escreva (ou receba) o post seguindo o `brand-brief.md`.
2. **Nota** (seção 1). Abaixo da mínima, reescreva antes de seguir.
3. **Bloqueios** (seção 2) e **auditoria em português** (seção 3).
4. Reprovou: corrija e volte ao passo 2.
5. Só então mostre ao usuário, com a tabela da nota e o resultado do portão.
6. Agendar só depois de aprovação explícita, peça por peça.

## 1. Nota de alcance

Se o plugin do Blotato estiver instalado, leia o método do `post-grader` (`find ~/.claude* -path '*post-grader/SKILL.md'`) e use os exemplos de lá como régua. O método abaixo é o mesmo em resumo, para funcionar sem ele.

| Critério | Peso | O que vale 9 |
|---|---|---|
| Gancho | 50% | A 1ª linha (ou o 1º segundo) para o dedo sozinha: toma posição, mostra um momento constrangedor específico, ou desafia quem lê |
| Curiosidade e detalhe | 10% | Detalhe concreto (número, cena, nome de coisa do dia a dia) que faz querer o resto |
| Emoção | 10% | Provoca uma emoção clara: alívio, vergonha reconhecida, raiva justa, orgulho |
| Compartilhar ou salvar | 10% | Tem algo útil sem o produto (lista, mensagem pronta, teste) ou faz marcar alguém |
| Voz | 10% | Soa como a marca do brief, não como anúncio genérico |
| Polêmica | 5% | Alguém vai discordar, sem ofender ninguém |
| Encaixe na rede | 5% | Formato, tamanho e chamada certos para a rede |

**Seja duro.** A maioria dos ganchos fica entre 4 e 6; 8 é forte; 9 quase não tem o que corrigir. Pergunta de sim ou não que só descreve a cena raramente passa de 7. Vídeo de pura demonstração e story de enquete têm teto baixo: o vídeo vira desafio + dica + produto.

**Nota sem tabela não vale.** Toda peça leva a tabela com a nota de cada critério justificada em 1 linha e a conta: `4,50 + 0,80 + ... = 8,6`. Nunca uma nota "de olho".

**Story:** se o `config.md` diz que story não conta o critério de compartilhar, tire a linha e divida pelo que sobrou (90%), mostrando a conta. O `revisao.mjs` dos modelos faz essa conta sozinho.

## 2. Bloqueios (qualquer um reprova)

| # | Bloqueio | Exemplo que reprova |
|---|---|---|
| B1 | Promete o que o produto não faz (confira no `produto.md`) | Recurso marcado "não existe", ou que não está na tabela |
| B2 | Vende recurso pago como grátis | "Grátis: lembrete automático" quando o lembrete é do plano pago |
| B3 | Cita concorrente pelo nome | Qualquer marca da lista de concorrentes do `produto.md`. Compare com "planilha", "caderno", "sistema complicado" |
| B4 | Cita tecnologia ou fornecedor para público não técnico | "API", "integração", "servidor", nome do fornecedor de pagamento ou de mensagem |
| B5 | Depoimento, número de clientes ou resultado inventado | "Mais de 5 mil usam", "a Ana dobrou o faturamento" sem fonte real e autorizada |
| B6 | Usa nome ou história real sem autorização | História marcada "(confirmar antes de usar)" no brief |
| B7 | Mais de uma chamada para ação | "Baixe o app, siga e comente" |
| B8 | Tom que constrange ou expõe o cliente final | Ironizar quem atrasa, expor devedor |
| B9 | Promessa absoluta que pode deixar de ser verdade | "Sem taxa para sempre", "100% grátis", "nunca mais" |
| M* | Bloqueios próprios da marca | A tabela "Bloqueios próprios da marca" do `produto.md` |

**Tela desenhada (slide `tela`):** título, rótulos e botões têm que ser os do produto (tabela "Telas desenhadas" do `produto.md` ou o componente aberto agora). "1 toque" só depois de ver que não tem confirmação no meio. Tela que não está na tabela: abra o componente, desenhe igual e acrescente a linha.

**Recurso pago no post:** a chamada é a do `produto.md` (ex.: "comece grátis e conheça"), nunca "grátis para sempre" nem "tudo isso de graça".

## 3. Auditoria em português

Substitui a auditoria de escrita em inglês do `post-grader` (ignore "Contractions" e "Filler words" de lá).

| Regra | Passa quando |
|---|---|
| Travessão | Nenhum "—" no texto |
| Números | Em algarismos: "3 dicas", "R$ 29,90" |
| Voz ativa | Nada de "foi criado por", "é feito pelo" |
| Enchimento | Nenhuma de: realmente, simplesmente, basicamente, literalmente, na verdade, "muito" sem função, "super" |
| Aberturas vazias | Nenhuma de: "nos dias de hoje", "você sabia que", "deixa eu te contar", "a verdade é que", "vamos falar sobre" |
| Tratamento | "Você" do começo ao fim, sem misturar com "tu" ou "vocês" |
| Nome da marca | Escrito como no brief |
| Legenda sem número de slide | Nada de "no slide 6", "no carrossel", "arrasta pro lado" na legenda; ela diz o que a pessoa ganha |
| Emojis | Legenda com 2 a 3, minimalistas (os preferidos do brief), no começo ou no fim da linha. Falha: sem emoji, mais de 3, fileira, 🔥 💰 🚀 |
| Hashtags | 0 em Facebook, LinkedIn, X e Threads. 3 a 5 no Instagram, até 5 no TikTok. Em português e do assunto, nunca só a da marca |

Cada falha tira 0,5 da nota.

## 4. Como reportar

```
### Nota: 8,6 (mínima 8,5)
| Critério | Peso | Nota | Por quê |
|---|---|---|---|
| Gancho | 50% | 9 | ... |
| ... |
4,50 + 0,80 + 0,80 + 0,90 + 0,80 + 0,35 + 0,40 = 8,6

### Portão: APROVADO | REPROVADO
| Bloqueio | Resultado | Trecho |
|---|---|---|
| B1 Promessa | ok / FALHA | "..." |
| ... |

Recursos citados: [lista] → grátis ou pago conforme o produto.md; a chamada está coerente: sim/não
Auditoria em português: X falhas (lista)
Nota final: 8,6 − deduções = ...
```

Se reprovar, mostre a correção junto e rode de novo antes de entregar.
