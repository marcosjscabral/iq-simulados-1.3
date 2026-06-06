# LLM Wiki — Diretrizes de Andrej Karpathy

> Baseado fielmente no gist original: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f  
> Publicado em 4 de abril de 2026.

---

## A ideia central

A maioria das pessoas usa LLMs com documentos da forma tradicional do RAG: você sobe uma coleção de arquivos, o LLM recupera trechos relevantes na hora da consulta e gera uma resposta. Isso funciona, mas o LLM redescobre o conhecimento do zero a cada pergunta. Não há acumulação. Sistemas como NotebookLM e uploads de arquivos no ChatGPT funcionam assim.

**A ideia aqui é diferente.** Em vez de apenas recuperar dos documentos brutos no momento da consulta, o LLM **constrói e mantém incrementalmente uma wiki persistente** — uma coleção estruturada e interligada de arquivos markdown que fica entre você e as fontes brutas.

Quando você adiciona uma nova fonte, o LLM não a indexa para recuperação futura. Ele a lê, extrai as informações-chave e as integra à wiki existente — atualizando páginas de entidades, revisando resumos de tópicos, anotando onde novos dados contradizem afirmações antigas, e fortalecendo ou desafiando a síntese em evolução. **O conhecimento é compilado uma vez e mantido atualizado**, não re-derivado a cada consulta.

**A wiki é um artefato persistente e composto.** As referências cruzadas já estão lá. As contradições já foram sinalizadas. A síntese já reflete tudo que você leu. A wiki fica mais rica a cada fonte adicionada e a cada pergunta feita.

Você nunca (ou raramente) escreve a wiki — o LLM escreve e mantém tudo. Você é responsável pelo curadoria de fontes, exploração e pelas perguntas certas. O LLM faz todo o trabalho braçal — resumir, referenciar cruzadamente, arquivar e manter registros.

**Analogia prática:** Obsidian aberto de um lado, agente LLM do outro. O LLM faz edições com base na conversa; você navega pelos resultados em tempo real. O Obsidian é a IDE; o LLM é o programador; a wiki é o código-base.

---

## Casos de uso

- **Pessoal:** acompanhar seus próprios objetivos, saúde, psicologia, autodesenvolvimento — arquivando entradas de diário, artigos, notas de podcasts e construindo um quadro estruturado de si mesmo ao longo do tempo.
- **Pesquisa:** aprofundar-se em um tema por semanas ou meses — lendo papers, artigos, relatórios — e construindo incrementalmente uma wiki com uma tese em evolução.
- **Leitura de livros:** arquivando cada capítulo conforme avança, construindo páginas para personagens, temas, fios narrativos. Ao final você tem uma wiki companheira rica. Pense em wikis de fãs como o Tolkien Gateway — milhares de páginas interligadas. Você poderia construir algo assim pessoalmente, com o LLM fazendo todas as referências cruzadas.
- **Negócios/equipes:** uma wiki interna mantida por LLMs, alimentada por threads do Slack, transcrições de reuniões, documentos de projetos, chamadas de clientes. A wiki se mantém atualizada porque o LLM faz a manutenção que ninguém na equipe quer fazer.
- **Análise competitiva, due diligence, planejamento de viagens, notas de cursos, hobbies aprofundados** — qualquer coisa onde você está acumulando conhecimento ao longo do tempo e quer ele organizado, não disperso.

---

## Arquitetura

Três camadas:

**Fontes brutas** — sua coleção curada de documentos-fonte. Artigos, papers, imagens, arquivos de dados. Imutáveis — o LLM lê, nunca modifica. É a sua fonte de verdade.

**A wiki** — um diretório de arquivos markdown gerados pelo LLM. Resumos, páginas de entidades, páginas de conceitos, comparações, uma visão geral, uma síntese. O LLM é o dono desta camada inteiramente. Ele cria páginas, as atualiza quando novas fontes chegam, mantém referências cruzadas e preserva a consistência. Você lê; o LLM escreve.

**O schema** — um documento (por ex. `CLAUDE.md` para Claude Code ou `AGENTS.md` para Codex) que diz ao LLM como a wiki está estruturada, quais são as convenções e quais fluxos seguir ao ingerir fontes, responder perguntas ou manter a wiki. É o arquivo de configuração central — é o que transforma o LLM de um chatbot genérico em um mantenedor de wiki disciplinado. Você e o LLM co-evoluem isso ao longo do tempo.

---

## Operações

### Ingestão

Você joga uma nova fonte na coleção e diz ao LLM para processá-la. Fluxo exemplo:

1. LLM lê a fonte
2. Discute os pontos principais com você
3. Escreve uma página de resumo na wiki
4. Atualiza o índice
5. Atualiza páginas relevantes de entidades e conceitos
6. Adiciona uma entrada ao log

Uma única fonte pode tocar 10 a 15 páginas da wiki. Prefira ingerir fontes uma a uma e permanecer envolvido — leia os resumos, verifique as atualizações, oriente o LLM sobre o que enfatizar. Mas você pode também fazer ingestão em lote com menos supervisão. Desenvolva o fluxo que se encaixa no seu estilo e documente-o no schema para sessões futuras.

### Consulta

Você faz perguntas contra a wiki. O LLM busca páginas relevantes, as lê e sintetiza uma resposta com citações. As respostas podem ter diferentes formas: página markdown, tabela comparativa, slide deck (Marp), gráfico (matplotlib), canvas.

**Insight importante:** boas respostas podem ser arquivadas de volta na wiki como novas páginas. Uma comparação que você pediu, uma análise, uma conexão que você descobriu — são valiosas e não deveriam desaparecer no histórico do chat. Suas explorações se acumulam na base de conhecimento assim como as fontes ingeridas.

### Lint (manutenção)

Periodicamente, peça ao LLM para verificar a saúde da wiki. Procure por:

- Contradições entre páginas
- Afirmações desatualizadas que fontes mais novas superaram
- Páginas órfãs sem links de entrada
- Conceitos importantes mencionados mas sem página própria
- Referências cruzadas ausentes
- Lacunas de dados que poderiam ser preenchidas com uma busca na web

O LLM é bom em sugerir novas perguntas para investigar e novas fontes para buscar.

---

## Indexação e log

Dois arquivos especiais ajudam o LLM (e você) a navegar na wiki à medida que ela cresce:

**`index.md`** é orientado a conteúdo. É um catálogo de tudo na wiki — cada página listada com um link, um resumo de uma linha e opcionalmente metadados como data ou contagem de fontes. Organizado por categoria (entidades, conceitos, fontes, etc.). O LLM o atualiza a cada ingestão. Ao responder uma consulta, o LLM lê o índice primeiro para encontrar páginas relevantes, depois as aprofunda. Isso funciona surpreendentemente bem em escala moderada (~100 fontes, ~centenas de páginas) e evita a necessidade de infraestrutura RAG baseada em embeddings.

**`log.md`** é cronológico. É um registro append-only do que aconteceu e quando — ingestões, consultas, passes de lint. Dica útil: se cada entrada começa com um prefixo consistente (ex. `## [2026-04-02] ingest | Article Title`), o log se torna parseável com ferramentas Unix simples — `grep "^## \[" log.md | tail -5` traz as últimas 5 entradas. O log fornece uma linha do tempo da evolução da wiki e ajuda o LLM a entender o que foi feito recentemente.

---

## Ferramentas opcionais (CLI)

Em algum momento você pode querer construir pequenas ferramentas que ajudam o LLM a operar na wiki com mais eficiência. Um mecanismo de busca sobre as páginas da wiki é o mais óbvio — em pequena escala o arquivo de índice é suficiente, mas conforme a wiki cresce você quer uma busca adequada.

[`qmd`](https://github.com/tobi/qmd) é uma boa opção: mecanismo de busca local para arquivos markdown com busca híbrida BM25/vetorial e reranking por LLM, tudo no dispositivo. Tem tanto uma CLI (para o LLM executar como shell) quanto um servidor MCP (para o LLM usar como ferramenta nativa). Você também pode construir algo mais simples — o LLM pode ajudar a codificar um script de busca naive conforme a necessidade surgir.

---

## Dicas e truques

- **Obsidian Web Clipper** é uma extensão de navegador que converte artigos web em markdown. Muito útil para rapidamente colocar fontes na sua coleção bruta.
- **Baixe imagens localmente.** Em Obsidian Settings → Files and links, defina "Attachment folder path" para um diretório fixo (ex. `raw/assets/`). Após clonar um artigo, um atalho de teclado baixa todas as imagens para o disco local. Isso permite que o LLM visualize e referencie imagens diretamente em vez de depender de URLs que podem quebrar. Nota: LLMs não conseguem ler markdown com imagens inline em uma passagem — o contorno é ter o LLM lendo o texto primeiro, depois visualizando as imagens referenciadas separadamente.
- **O graph view do Obsidian** é a melhor forma de ver a forma da sua wiki — o que está conectado ao quê, quais páginas são hubs, quais são órfãs.
- **Marp** é um formato de slide deck baseado em markdown. O Obsidian tem um plugin para isso. Útil para gerar apresentações diretamente do conteúdo da wiki.
- **Dataview** é um plugin do Obsidian que executa consultas sobre o frontmatter das páginas. Se o seu LLM adiciona YAML frontmatter às páginas da wiki (tags, datas, contagens de fontes), o Dataview pode gerar tabelas e listas dinâmicas.
- A wiki é apenas um repositório git de arquivos markdown. Você tem histórico de versões, branching e colaboração de graça.

---

## Por que isso funciona

A parte tediosa de manter uma base de conhecimento não é a leitura ou o raciocínio — é a contabilidade. Atualizar referências cruzadas, manter resumos atualizados, notar quando novos dados contradizem afirmações antigas, manter consistência em dezenas de páginas. **Humanos abandonam wikis porque o custo de manutenção cresce mais rápido que o valor.** LLMs não ficam entediados, não se esquecem de atualizar uma referência cruzada e podem tocar 15 arquivos em uma única passagem. A wiki se mantém porque o custo de manutenção é praticamente zero.

O trabalho do humano é curar fontes, direcionar a análise, fazer boas perguntas e pensar sobre o que tudo significa. O trabalho do LLM é todo o resto.

A ideia está relacionada em espírito ao Memex de Vannevar Bush (1945) — um repositório de conhecimento pessoal e curado com trilhas associativas entre documentos. A visão de Bush era mais próxima disso do que o que a web se tornou: privada, ativamente curada, com as conexões entre documentos tão valiosas quanto os próprios documentos. A parte que ele não conseguia resolver era: quem faz a manutenção? O LLM cuida disso.

---

## Nota sobre implementação

Este documento é intencionalmente abstrato. Ele descreve a ideia, não uma implementação específica. A estrutura exata de diretórios, as convenções do schema, os formatos de página, as ferramentas — tudo isso depende do seu domínio, das suas preferências e do seu LLM de escolha.

**Tudo mencionado acima é opcional e modular** — pegue o que é útil, ignore o que não é. Por exemplo:
- Suas fontes podem ser somente texto, então você não precisa de manipulação de imagens.
- Sua wiki pode ser pequena o suficiente para que o arquivo de índice seja tudo que você precisa, sem motor de busca.
- Você pode não se importar com slide decks e querer apenas páginas markdown.

A forma correta de usar isso é compartilhar com seu agente LLM e trabalharem juntos para instanciar uma versão que atenda às suas necessidades. O único trabalho deste documento é comunicar o padrão. Seu LLM pode descobrir o resto.

---

*Fonte: [karpathy/llm-wiki.md](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) — criado em 4 de abril de 2026.*
