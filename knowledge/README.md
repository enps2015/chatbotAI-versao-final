# Base de Conhecimento - Seguro Auto

Data da coleta inicial: 2026-05-20

## Objetivo

Esta pasta inicia uma base de conhecimento para aproximar o chatbot do Desafio 2 do InsurMinds, sem alterar a arquitetura atual do projeto.

A base foi criada para apoiar:

- respostas de FAQ sobre seguro auto;
- futura camada de RAG simples;
- redução de respostas inventadas pelo LLM;
- rastreabilidade das fontes usadas pelo chatbot;
- documentação do experimento.

## Escopo inicial

A base inicial prioriza fontes públicas e oficiais:

- SUSEP/Gov.br sobre seguro de automóveis;
- SUSEP/Gov.br sobre perguntas frequentes de seguros;
- SUSEP/Gov.br sobre bases anonimizadas de seguro auto;
- Consumidor.gov.br para análise futura de reclamações;
- InsuranceQA como dataset auxiliar, não como fonte normativa brasileira.

## Arquivos

- `fontes-publicas.md`: inventário de fontes encontradas e recomendação de uso.
- `fontes-locais-grupo.md`: inventário das bases coletadas pelo grupo e política de uso.
- `faq-seguro-auto.md`: FAQ curada, em linguagem segura para o chatbot.
- `base-rag-seguro-auto.md`: blocos temáticos para uso futuro em RAG.
- `intencoes-faq-seguro-auto.jsonl`: intents iniciais em formato estruturado.

## Regra de uso pelo chatbot

O chatbot deve tratar esta base como orientação informativa. Ele não deve:

- prometer aceitação de seguro;
- afirmar que uma cobertura existe em qualquer apólice;
- confirmar indenização sem análise da seguradora;
- substituir corretor, seguradora, apólice ou condições contratuais;
- dar aconselhamento jurídico definitivo.

Mensagem padrão recomendada:

> A confirmação final depende da seguradora, da proposta aceita, da apólice e das condições contratuais.

## Próximo passo técnico

Sem refazer a estrutura atual, há dois caminhos incrementais:

1. FAQ estruturada: carregar `intencoes-faq-seguro-auto.jsonl` e responder por categoria.
2. RAG simples: dividir `base-rag-seguro-auto.md` em chunks e recuperar trechos por similaridade lexical ou embeddings.

## Fontes locais do grupo

Além das fontes públicas pesquisadas, o workspace contém bases coletadas pelo grupo:

- `documentacao_base_seguros/`: condições gerais, manuais, cartilhas e relatórios de seguro auto.
- `docs/faqs-coletadas-integrante-grupo.pdf`: FAQ e percepção prática de integrante que atua com seguros.

Essas bases são úteis, mas devem ser usadas com cautela:

- cartilhas, apostilas e materiais oficiais/didáticos podem apoiar respostas gerais;
- condições gerais de seguradoras devem ser tratadas como fontes específicas de produto;
- a FAQ da integrante deve orientar linguagem, intents e prioridades, não servir como regra normativa.
