# Historico de Prompts da Conversa

## Objetivo

Este arquivo registra, de forma resumida, os principais prompts utilizados nesta conversa para definicao do agente de seguro auto.

## Escopo e observacao

- Este historico e um resumo operacional.
- Nao inclui mensagens internas de sistema da plataforma.
- Foco: prompts do usuario e prompts funcionais criados durante a conversa.

## Linha do tempo dos prompts

### 1) Prompt inicial de construcao do agente

Resumo do pedido:
- Entender o front-end existente no repositorio.
- Criar backend necessario para um agente de seguros automotivos.
- Permitir uso de LangChain.
- Fazer 10 perguntas de definicao de stack/funcionalidade com resposta binaria (0/1).

Resultado associado:
- Criacao de backend base em `backend/`.
- Definicao de questionario binario.

### 2) Questionario binario (10 perguntas)

Prompt aplicado (coleta de requisitos):
1. Backend Node.js/Express?
2. Usar LangChain como orquestracao?
3. Usar OpenAI como provedor padrao?
4. Incluir banco vetorial (RAG)?
5. Incluir PostgreSQL?
6. Incluir Redis?
7. Incluir autenticacao JWT?
8. Incluir integracao WhatsApp?
9. Incluir audio STT/TTS?
10. Incluir painel web de conversas/funil?

Respostas coletadas do usuario:
- 1, 1, 0, 0, 1, 0, 0, 0, 0, 0

Resultado associado:
- Stack consolidada para o blueprint (Node + LangChain + Postgres, sem os demais modulos nesta fase).

### 3) Prompt para criar blueprint completo

Resumo do pedido:
- Criar Blueprint.md com tudo necessario para o agente.
- Incluir fluxos PF e PJ.
- Distribuir 5 atendentes (2 PF e 3 PJ).
- Usar perguntas do PDF de contratacao como pre-requisito de qualificacao.
- Definir redirecionamento de leads para atendentes por fluxo.
- Exigir envio de email para lead com resumo e dados coletados.
- Prever espaco no front-end para cadastro de atendentes.
- Considerar Gemini como LLM com armazenamento seguro de chave.
- Definir que o projeto deve rodar em Docker.
- Criar tambem um MD explicando o funcionamento.
- Nao implementar o agente ainda; apenas documentar.

Resultado associado:
- Criacao de `Blueprint.md`.
- Criacao de `docs/agente-seguro-auto-funcionamento.md`.

### 4) Prompt para adicionar espaco de historias de usuario

Resumo do pedido:
- Incluir no blueprint uma secao para historias de usuario para futuras mudancas de funcionalidade.

Resultado associado:
- Inclusao da secao de historias de usuario e controle de mudancas em `Blueprint.md`.

### 5) Prompt para criar historia de usuario de exemplo

Resumo do pedido:
- Criar uma historia de usuario de exemplo para uso futuro.

Resultado associado:
- Inclusao da historia US-004 no `Blueprint.md`.

### 6) Prompt para converter historias em tabela

Resumo do pedido:
- Tornar a visualizacao das historias mais legivel com formato tabular.

Resultado associado:
- Conversao da secao de historias (17.2) para tabela markdown em `Blueprint.md`.

### 7) Prompt atual (registro de prompts da conversa)

Resumo do pedido:
- Criar arquivo `historico_prompt.md` demonstrando os prompts utilizados nesta conversa.

Resultado associado:
- Criacao deste arquivo.

## Prompts tecnicos definidos no conteudo

### A) Prompt de roteamento de leads (definido no Blueprint)

Funcao:
- Classificar leads de seguro auto.
- Direcionar para PF-1, PF-2, PJ-1, PJ-2, PJ-3.
- Retornar JSON estruturado com status, agente designado, campos faltantes e motivo.

Regras principais:
- Nao classificar sem campos minimos.
- Retornar `MISSING_DATA` quando faltar informacao.
- Aplicar regras PF/PJ e fallback com revisao manual.

### B) Template de prompt para novas historias de usuario

Funcao:
- Padronizar futuras solicitacoes de mudanca funcional.

Campos principais:
- ID, Titulo, Como/Quero/Para, Contexto, Regras de negocio, Criterios de aceite, Impacto tecnico, Prioridade, Status, Responsavel, Data.

## Referencias de arquivos relacionados

- `Blueprint.md`
- `docs/agente-seguro-auto-funcionamento.md`
- `docs/Contratacao seguro auto.pdf`
