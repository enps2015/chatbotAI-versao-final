# Fontes Públicas Para FAQ/RAG de Seguro Auto

Data da coleta inicial: 2026-05-20

Atualizacao: após análise das bases locais do grupo, este arquivo continua sendo o inventário das fontes públicas externas. Para fontes já presentes no workspace, consultar `fontes-locais-grupo.md`.

## Fontes oficiais prioritárias

### 1. SUSEP - Seguro de Automóveis

URL: https://www.gov.br/susep/pt-br/copy_of_planos-e-produtos/seguros/seguro-de-automóveis

Uso recomendado:

- fonte principal para FAQ de seguro auto;
- base para respostas sobre modalidades, coberturas, questionário de risco, sinistro, indenização, seguro vinculado ao veículo/condutor, APP, oficinas e valor de novo.

Observacoes:

- pagina oficial da SUSEP;
- modificada em 13/12/2024, conforme pagina consultada;
- adequada para RAG com citação de fonte.

Topicos extraidos para a base:

- tabela FIPE;
- possibilidade de recusa pela seguradora;
- legislacao do seguro automóvel;
- modalidades de indenização;
- coberturas adicionais;
- questionário de avaliação do risco;
- comunicação de alteracao de perfil;
- procedimentos em caso de sinistro;
- indenização integral e parcial;
- seguro vinculado ao condutor ou veículo;
- cobertura APP;
- peças usadas ou não originais;
- oficina livre ou referenciada;
- valor de zero quilometro.

### 2. SUSEP - Perguntas Mais Frequentes Sobre Seguros

URL: https://www.gov.br/susep/pt-br/acesso-a-informação/perguntas-frequentes/pasta-das-perguntas-frequentes/perguntas-mais-frequentes-sobre-seguros

Uso recomendado:

- complemento para FAQ geral;
- fonte para respostas sobre proposta, prêmio, prazo de indenização, franquia, bônus, perfil de risco e DPVAT.

Topicos extraidos para a base:

- recusa de proposta;
- prazo de emissao de apólice;
- prazo de liquidacao de sinistro;
- indenização integral;
- indenização parcial;
- franquia;
- bônus;
- uso de peças usadas ou não originais;
- alteracao do perfil de risco.

### 3. SUSEP - Bases Anonimizadas de Seguro de Automóvel

URL: https://www.gov.br/susep/pt-br/central-de-conteudos/dados-estatisticos/bases-anonimizadas/bases_auto

Uso recomendado:

- fonte para análises estatísticas futuras;
- não deve ser usada como FAQ textual direta;
- pode apoiar respostas como: "existem bases públicas anonimizadas da SUSEP para estudos de seguro auto".

Topicos:

- arquivos R_AUTO;
- arquivos S_AUTO;
- bases anonimizadas enviadas pelo mercado supervisionado.

### 4. SUSEP - AUTOSEG

URL: https://www2.susep.gov.br/menuestatistica/autoseg/

Uso recomendado:

- fonte estatística complementar;
- pode apoiar relatório do experimento e futuras análises de prêmio medio, sinistros e indenizações.

Observação:

- usar com cautela no chatbot. Estatisticas não devem ser convertidas automaticamente em promessa de preço individual.

### 5. Consumidor.gov.br - Reclamacoes do Consumidor

URL: https://dados.mj.gov.br/dataset/reclamacoes-do-consumidor-gov-br

Uso recomendado:

- fonte para descobrir dores reais de consumidores;
- pode apoiar criacao de intents de atendimento;
- não deve ser usada como fonte normativa sobre cobertura.

Topicos potenciais:

- demora em atendimento;
- negativa de cobertura;
- divergencia de apólice;
- problemas de cancelamento;
- dificuldade em sinistro;
- satisfacao/resolucao da reclamacao.

### 6. InsuranceQA Corpus

URL: https://github.com/shuzi/insuranceQA

Uso recomendado:

- dataset auxiliar para inspirar estrutura de perguntas e intents;
- não usar como fonte final para respostas sobre o mercado brasileiro;
- verificar licenca e citação antes de incorporar dados.

Observação:

- corpus em ingles, com dominio amplo de seguros;
- util para benchmark ou exemplos de perguntas, mas não substitui SUSEP/Gov.br.

## Fontes a evitar como fonte principal

- blogs comerciais de corretoras ou seguradoras;
- paginas privadas sem clareza de autoria;
- discussoes em redes sociais;
- conteúdo de seguradoras específicas usado como se fosse regra geral de mercado.

Essas fontes podem inspirar temas de FAQ, mas não devem ser tratadas como verdade operacional do chatbot.

## Relação com as fontes locais

As fontes públicas externas devem continuar tendo prioridade para respostas gerais. As condições gerais de seguradoras presentes em `documentacao_base_seguros/` podem complementar respostas, desde que o chatbot deixe claro quando uma informação pertence a um produto/seguradora específica.
