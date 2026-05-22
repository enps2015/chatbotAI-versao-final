# Coleta Inicial de Fontes Públicas - FAQ Seguro Auto

Data: 2026-05-20

## Objetivo

Registrar a primeira coleta de fontes públicas para evoluir o chatbot de triagem para um assistente com base de conhecimento rastreável sobre seguro auto.

Esta coleta não altera o funcionamento do chatbot ainda. Ela cria insumos para uma futura camada de FAQ estruturada ou RAG simples.

## Resultado da coleta

Foram criados os arquivos:

- `knowledge/README.md`
- `knowledge/fontes-publicas.md`
- `knowledge/fontes-locais-grupo.md`
- `knowledge/faq-seguro-auto.md`
- `knowledge/base-rag-seguro-auto.md`
- `knowledge/intencoes-faq-seguro-auto.jsonl`

Atualizacao após análise das bases locais do grupo:

- Foram avaliados 31 PDFs em `documentacao_base_seguros/`.
- Foi avaliado o arquivo `docs/faqs-coletadas-integrante-grupo.pdf`.
- A base de intents foi expandida de 12 para 22 intents.
- A FAQ curada foi expandida com temas práticos levantados pela integrante do grupo.
- Foi criado inventário específico em `knowledge/fontes-locais-grupo.md`.

## Fontes priorizadas

### SUSEP - Seguro de Automóveis

URL: https://www.gov.br/susep/pt-br/copy_of_planos-e-produtos/seguros/seguro-de-automóveis

Motivo:

- fonte oficial;
- trata especificamente de seguro automóvel;
- cobre aceitação de proposta, modalidades, coberturas, questionário de risco, sinistro, indenização é oficinas.

Uso no projeto:

- fonte principal da FAQ;
- fonte principal dos blocos RAG.

### SUSEP - Perguntas Mais Frequentes Sobre Seguros

URL: https://www.gov.br/susep/pt-br/acesso-a-informação/perguntas-frequentes/pasta-das-perguntas-frequentes/perguntas-mais-frequentes-sobre-seguros

Motivo:

- fonte oficial;
- contem perguntas gerais e perguntas sobre seguro de automóvel;
- aborda franquia, bônus, indenização, perfil de risco e prazo de sinistro.

Uso no projeto:

- complemento da FAQ;
- base para respostas seguras sobre sinistro, franquia e bônus.

### SUSEP - Bases Anonimizadas de Seguro de Automóvel

URL: https://www.gov.br/susep/pt-br/central-de-conteudos/dados-estatisticos/bases-anonimizadas/bases_auto

Motivo:

- fonte oficial de dados abertos;
- disponibiliza bases R_AUTO e S_AUTO;
- util para relatório é análises futuras.

Uso no projeto:

- não entra como FAQ normativa;
- pode apoiar dashboard, relatório ou resposta sobre existência de dados públicos.

### SUSEP - AUTOSEG

URL: https://www2.susep.gov.br/menuestatistica/autoseg/

Motivo:

- sistema estatistico público de seguro auto;
- pode apoiar análises de prêmio medio, sinistros e indenizações.

Uso no projeto:

- fonte estatística complementar;
- não deve ser usada para prometer preço individual.

### Consumidor.gov.br - Reclamacoes do Consumidor

URL: https://dados.mj.gov.br/dataset/reclamacoes-do-consumidor-gov-br

Motivo:

- base pública de reclamacoes;
- pode ajudar a descobrir dores reais de consumidores.

Uso no projeto:

- extrair intents futuras;
- identificar temas de atendimento;
- não usar como fonte de verdade sobre cobertura.

### InsuranceQA Corpus

URL: https://github.com/shuzi/insuranceQA

Motivo:

- corpus público de perguntas e respostas no dominio de seguros;
- pode apoiar estrutura de intents e testes.

Uso no projeto:

- apenas auxiliar;
- não usar como fonte normativa brasileira;
- verificar licenca/citação antes de incorporar dados.

## Fontes locais do grupo incorporadas

### Pasta `documentacao_base_seguros/`

Foram identificados materiais de quatro tipos:

1. Materiais didáticos e cartilhas:
   - `Apostila_Seguros-Automoveis_2025.pdf`
   - `cartilha_susep2e.pdf`
   - `tipos_de_cobertura_auto.pdf`
   - `Manual_de_criterio_de_bonus_nov_2025_53bc41517d.pdf`
   - `Cartilha-Nova-Lei-do-Seguros.pdf`

2. Condições gerais de seguradoras:
   - Santander, Pier, Porto, Tokio Marine, Allianz, AXA Frotas, Alfa, Suhai, SulAmérica, Itaú, Caixa, Bradesco, Mitsui, Azul é outros documentos de seguro auto.

3. Relatório de mercado:
   - `Relatorio FGV - Mercado de automoveis.pdf`

4. Documento com extração limitada:
   - `NOVA LEI DO SEGURO O QUE O CONSUMIDOR PRECISA SABER.pdf`
   - Observação: a extração textual retornou praticamente vazia; pode exigir OCR.

### FAQ da integrante do grupo

Arquivo:

- `docs/faqs-coletadas-integrante-grupo.pdf`

Principais contribuições:

- lista de dúvidas frequentes reais;
- diferença entre cliente novo e cliente antigo;
- foco do seguro auto em franquia, guincho, carro reserva, vidros e terceiros;
- linguagem real do cliente;
- separação entre assistência 24h e sinistro;
- cuidado com negativa de indenização;
- recomendação prática de automatizar triagem e qualificação de leads.

Uso recomendado:

- enriquecer intents;
- melhorar exemplos de linguagem;
- priorizar FAQs;
- criar regras de handoff humano.

## Temas já cobertos na base inicial

- aceitação ou recusa da proposta;
- questionário de avaliação do risco;
- mudança de perfil durante vigência;
- franquia;
- bônus;
- assistência 24 horas;
- acessórios, kit gás e blindagem;
- seguro vinculado ao veículo ou ao condutor;
- contratação separada de coberturas;
- sinistro;
- prazo de liquidacao de sinistro;
- indenização integral;
- dados públicos SUSEP.

Temas adicionados após análise das bases locais:

- cobertura para terceiros / RCF-V;
- linguagem informal do cliente para terceiros;
- atraso de parcela;
- cancelamento;
- cálculo do valor do seguro;
- exclusões e perda de direito;
- diferença entre assistência e sinistro;
- guincho, troca de pneu, chaveiro e pane;
- cobertura de vidros;
- carro reserva;
- segunda via/envio de apólice;
- negativas de indenização como tema de atendimento humano.

## Limites da coleta inicial

- Ainda não houve ingestao automática em banco vetorial.
- Ainda não há embeddings.
- Ainda não há recuperador integrado ao backend.
- As respostas foram curadas manualmente e devem ser revisadas pelo grupo.
- A base esta em formato inicial, adequada para evoluir para RAG simples.

## Recomendação de implementação mínima

Sem mudar a estrutura atual, o próximo passo recomendado e:

1. Carregar `knowledge/intencoes-faq-seguro-auto.jsonl` no backend.
2. Antes das regex atuais de FAQ, tentar classificar a mensagem do usuário contra as intents.
3. Responder com `resposta_curta`, fonte é aviso de limitação.
4. Quando a pergunta for sobre sinistro, manter handoff humano.
5. Registrar no histórico da conversa qual fonte foi usada.

## Política de uso das bases locais

Para evitar respostas incorretas, o chatbot deve aplicar a seguinte hierarquia:

1. Fontes oficiais e materiais didáticos gerais para respostas gerais.
2. Condições gerais apenas quando a resposta deixar claro que é exemplo de produto/seguradora específica.
3. FAQ da integrante como fonte de linguagem, intents e priorização, não como regra contratual.

Exemplo de frase segura:

```text
Em geral, essa cobertura pode existir dependendo da apólice. Em documentos de mercado ela aparece como cobertura adicional, mas a confirmação depende do produto contratado e da seguradora.
```

## Exemplo de resposta com fonte

```text
Franquia é a parte do prejuízo que fica sob responsabilidade do segurado, conforme previsto na apólice.

Fonte: SUSEP - Perguntas Frequentes Sobre Seguros.
A confirmação final depende da apólice e das condições contratuais.
```

## Como isso aproxima o projeto do Desafio 2

O Desafio 2 pede chatbot/assistente virtual baseado em IA para atendimento, respostas a perguntas frequentes e direcionamento de solicitações. A aula também apresenta RAG como forma de enriquecer contexto e reduzir alucinações.

Esta base inicial permite sair do modelo atual, que é basicamente triagem e roteamento, para um chatbot com respostas fundamentadas em fontes públicas.
