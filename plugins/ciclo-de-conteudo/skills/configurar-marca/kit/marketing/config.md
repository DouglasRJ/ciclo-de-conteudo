# Configuração do ciclo

> Lida pela skill `planejar-posts-semana`. O que estiver "não", a skill pula e avisa em 1 linha.

## Ritmo

- Redes: Instagram, Facebook <!-- e quais mais -->
- Peças por semana: carrossel, vídeo curto, story com enquete, post no Facebook, frase
- Horário padrão: 1 peça por dia, 19h (horário de Brasília)
- Nota mínima: 8,5
- Story conta o critério de compartilhar: não

## Resultados

- Blotato (views e comentários dos posts publicados): sim <!-- ou não -->
- Cadastros por página de entrada: não
  <!-- Se sim, um comando SÓ DE LEITURA e AGREGADO que devolve "página, quantidade" dos últimos 28 dias.
       Nunca selecione dado de pessoa. A skill pede autorização antes de rodar a primeira vez na conversa.
  ```bash
  psql "$DATABASE_URL" -At -c "select coalesce(landing_page,'(sem página)'), count(*) from signups where created_at >= now() - interval '28 days' group by 1 order by 2 desc limit 20"
  ```
  -->
- Search Console: não <!-- sem conexão, a skill usa números colados pelo usuário -->

## Guia no site (texto longo que cada ciclo publica)

- Faz guia: não <!-- ou sim -->
- Onde ficam os guias: <!-- ex.: ../site/content/guias/ ou src/content/guides.ts -->
- Ao criar um guia, também atualizar: <!-- ex.: sitemap, llms.txt -->
- Teste antes de seguir: <!-- ex.: cd ../site && npm run test:seo -->
- Publicar: commit do guia; deploy só com OK explícito do usuário.

## Estudo de SEO

- Pasta do estudo: <!-- ex.: docs/seo/ (demanda, concorrentes). Sem estudo, a skill pesquisa só o assunto da semana. -->
