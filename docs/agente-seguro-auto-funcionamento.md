# Funcionamento do Agente de Seguro Auto

## Visao geral

O agente faz triagem de interessados em seguro auto, responde perguntas comuns e encaminha o lead para o atendente correto por fluxo (PF ou PJ).

Não é emissor de apólice. Ele atua como pré-atendimento inteligente + roteador de leads.

## Entradas do agente

1. Mensagens do cliente no chat.
2. Perguntas obrigatorias de triagem baseadas no PDF de contratacao.
3. Regras de negocio para PF/PJ e renovacao.

## Saidas do agente

1. Resposta conversacional ao cliente.
2. Checklist preenchido com dados obrigatorios.
3. Definicao de atendente destino (PF-1, PF-2, PJ-1, PJ-2, PJ-3).
4. Resumo por email para cliente e atendente.

## Etapas do atendimento

### 1) Abertura

- Cliente inicia conversa.
- Sistema gera protocolo e inicia coleta.

### 2) Coleta obrigatoria

- Agente valida os campos minimos de segurado e veiculo.
- Sem campos mínimos completos, não encaminha para humano.

### 3) Duvidas frequentes

- Agente responde perguntas comuns (vigencia, assistencia, Uber, cobertura de terceiros, etc.).
- Mantem linguagem clara e sem promessas de cobertura final.

### 4) Classificacao e roteamento

- Define PF ou PJ.
- Aplica regras:
  - PF renovacao/perfil sensivel -> PF-2
  - PF comum -> PF-1
  - PJ renovacao/especial -> PJ-3
  - PJ media/alta complexidade -> PJ-2
  - PJ padrao -> PJ-1

### 5) Entrega para atendente

- Gera resumo estruturado.
- Envia email para lead e para atendente designado.
- Atualiza status do lead para atendimento humano.

## Distribuicao operacional dos 5 atendentes

- 2 atendentes PF:
  - PF-1: novos casos PF
  - PF-2: renovacao PF e perfis sensiveis

- 3 atendentes PJ:
  - PJ-1: frota leve
  - PJ-2: frota media/alta complexidade
  - PJ-3: renovacoes e casos especiais

## Prompt operacional de roteamento

O classificador deve retornar JSON estruturado com:

- status
- assigned_agent
- segment
- flow
- missing_fields
- manual_review
- reason

Se faltarem campos obrigatorios, retorno obrigatorio: `status = MISSING_DATA`.

## Seguranca e infraestrutura

- LLM: Google Gemini via LangChain.
- Chave da API em secret (Docker Secret), não no git.
- Persistencia em PostgreSQL.
- Execução via Docker Compose (frontend + backend + postgres).

## Resultado esperado

Ao final da conversa, todo lead qualificado deve:

1. Ter dados minimos preenchidos.
2. Estar em um fluxo PF/PJ definido.
3. Estar roteado para um dos 5 atendentes.
4. Receber email com resumo e protocolo.
