# Blueprint - Agente IA de Seguro Auto

## 1. Objetivo

Definir tudo que e necessario para implementar um agente de IA para seguro auto, integrado ao front-end atual deste repositorio, com foco em:

- Atendimento inicial de leads interessados em seguro auto.
- Coleta de dados obrigatorios antes do encaminhamento.
- Direcionamento automatico para atendentes por segmento e fluxo.
- Envio de email para cada lead com resumo da conversa e dados coletados.
- Uso de Google Gemini como LLM.
- Execucao em Docker.

Importante: este documento e apenas de planejamento e especificacao. A implementacao do agente fica para a proxima etapa.

## 2. Requisitos consolidados (com base nas respostas)

- Backend em Node.js/Express.
- Orquestracao de prompts e fluxo com LangChain.
- Provedor de LLM: Google Gemini.
- Sem vector DB nesta fase.
- Com persistencia relacional (PostgreSQL).
- Sem Redis nesta fase.
- Sem JWT nesta fase.
- Sem WhatsApp nesta fase.
- Sem audio (STT/TTS) nesta fase.
- Sem painel analitico completo nesta fase.

## 3. Escopo funcional da fase 1

### 3.1 Funcoes principais

- Chat de triagem e orientacao para seguro auto.
- Qualificacao de lead via checklist obrigatorio.
- Classificacao do lead em PF (Pessoa Fisica) ou PJ (Pessoa Juridica).
- Roteamento para um dos 5 atendentes de acordo com fluxo.
- Registro completo de conversa e dados estruturados.
- Envio de email automatico para o lead com resumo e protocolo.
- Envio de email para o atendente designado com resumo + dados.

### 3.2 Fora de escopo (nesta fase)

- Emissao de apolice.
- Assinatura digital.
- Integracao com seguradoras (API externa).
- Pagamento online.
- Omnichannel (WhatsApp/telefone).

## 4. Fonte de perguntas obrigatorias (PDF)

Arquivo base: docs/Contratacao seguro auto.pdf

Perguntas e dados que devem ser usados como pre-requisito antes de encaminhar o lead:

1. E renovacao de apolice? (Sim/Nao)
2. Se Sim, solicitar copia da apolice atual.
3. Dados do segurado:
- Nome completo
- Data de nascimento
- CPF
- Estado civil
- CEP
4. Dados do veiculo:
- Modelo
- Ano fabricacao/modelo
- Placa
5. Informacoes adicionais:
- Valor desejado para cobertura de danos a terceiros (recomendado R$ 100.000 a R$ 150.000)
- Veiculo tem garagem na residencia? (Sim/Nao)
- Tipo de residencia (Casa/Apartamento)
- Usa para ir/voltar do trabalho? (Sim/Nao)
- Se sim, ha garagem no trabalho? (Sim/Nao)
- Ha condutores entre 18 e 25 anos? (Sim/Nao)
- Se sim, informar idade e sexo
- Veiculo e usado para app (Uber, 99 etc.)? (Sim/Nao)

Perguntas frequentes para base de resposta do agente (FAQ inicial):

- Qual o valor do meu seguro?
- Se viajar meu seguro cobre?
- Qual vigencia do seguro (inicio e termino)?
- Filho/neto/sobrinho pode dirigir o carro segurado?
- Kit gas e coberto?
- Existe seguro mensal?
- Existe seguro para Uber?
- Limite de idade do veiculo para aceitar seguro?
- Seguro somente com assistencia 24h?
- Veiculo blindado e coberto?
- Posso usar outro endereco para reduzir valor?
- Se o carro ficar na calcada, cobre?

## 5. Segmentacao e distribuicao de atendentes

Total de atendentes: 5

- 2 atendentes para Pessoa Fisica (popular)
- 3 atendentes para Pessoa Juridica

### 5.1 Segmentos

- Segmento PF: cliente individual, uso pessoal, nao corporativo.
- Segmento PJ: CNPJ, uso empresarial, frota ou veiculo de operacao.

### 5.2 Fluxos por atendente

#### PF (2 atendentes)

- Atendente PF-1 (Fluxo PF Novo):
  - PF sem renovacao.
  - Primeira cotacao ou novo risco.

- Atendente PF-2 (Fluxo PF Renovacao e Perfil Sensivel):
  - PF com renovacao de apolice.
  - PF com condutor jovem (18-25), uso de app, historico que exige analise mais detalhada.

#### PJ (3 atendentes)

- Atendente PJ-1 (Fluxo PJ Frota Leve):
  - Pequenas frotas e veiculos leves de operacao.

- Atendente PJ-2 (Fluxo PJ Frota Media/Alta Complexidade):
  - Frota maior, risco operacional mais alto, perfil com condicoes especiais.

- Atendente PJ-3 (Fluxo PJ Renovacao e Condicoes Especiais):
  - Renovacoes PJ e casos com clausulas especificas.

## 6. Regras de roteamento de lead

O roteamento so deve ocorrer quando os campos minimos obrigatorios forem coletados.

Campos minimos para encaminhar:

- Tipo de cliente (PF/PJ)
- Renovacao (Sim/Nao)
- Nome completo
- Data de nascimento (ou representante para PJ)
- CPF (ou CNPJ para PJ)
- CEP
- Modelo do veiculo
- Ano do veiculo
- Placa
- Uso para app (Sim/Nao)
- Condutor 18-25 (Sim/Nao e detalhe se sim)

Regra de decisao:

1. Identificar PF ou PJ.
2. Se PF:
- Renovacao = Sim ou perfil sensivel -> PF-2
- Demais casos -> PF-1
3. Se PJ:
- Renovacao PJ ou caso especial -> PJ-3
- Frota media/alta complexidade -> PJ-2
- Demais PJ -> PJ-1

Fallback:

- Se classificacao estiver ambigua, direcionar para PJ-2 (triagem especializada) e marcar status "Revisao Manual".

## 7. Prompt de roteamento para os 5 atendentes

Este prompt e para o modulo classificador (nao para conversa livre).

```text
Voce e um classificador de leads de seguro auto.

Objetivo:
Classificar e direcionar o lead para um atendente especifico com base no segmento e no fluxo.

Atendentes disponiveis:
- PF-1: Pessoa Fisica - novo seguro
- PF-2: Pessoa Fisica - renovacao e perfis sensiveis
- PJ-1: Pessoa Juridica - frota leve
- PJ-2: Pessoa Juridica - frota media/alta complexidade
- PJ-3: Pessoa Juridica - renovacao e condicoes especiais

Regras obrigatorias:
1) So classifique quando os campos minimos obrigatorios estiverem presentes.
2) Se faltar dado minimo, retorne status "MISSING_DATA" e a lista de campos faltantes.
3) Se segmento = PF:
   - se renovacao = sim OU condutor_18_25 = sim OU uso_app = sim => PF-2
   - senao => PF-1
4) Se segmento = PJ:
   - se renovacao = sim OU condicao_especial = sim => PJ-3
   - senao se complexidade_frota = media_ou_alta => PJ-2
   - senao => PJ-1
5) Se houver ambiguidade, retorne PJ-2 com flag "manual_review=true".

Formato de saida (JSON puro):
{
  "status": "OK|MISSING_DATA",
  "assigned_agent": "PF-1|PF-2|PJ-1|PJ-2|PJ-3|null",
  "segment": "PF|PJ|null",
  "flow": "string|null",
  "missing_fields": ["..."],
  "manual_review": true|false,
  "reason": "explicacao curta"
}
```

## 8. Fluxo ponta a ponta (etapas)

### Etapa 1 - Entrada do lead

- Lead inicia conversa no front-end (widget/chat).
- Sistema cria `conversation_id` e `lead_id`.

### Etapa 2 - Triagem obrigatoria

- Agente pergunta e valida campos do PDF (pre-requisito).
- Dados sao salvos incrementalmente no banco.
- Se faltar dado minimo, agente continua perguntando antes de rotear.

### Etapa 3 - FAQ e orientacao

- Agente responde duvidas comuns de seguro auto.
- Sempre com tom consultivo e sem prometer cobertura final.

### Etapa 4 - Classificacao PF/PJ

- Identificar segmento automaticamente a partir dos dados.
- Aplicar regras de fluxo.

### Etapa 5 - Encaminhamento ao atendente

- Executar prompt de roteamento.
- Definir atendente final (PF-1, PF-2, PJ-1, PJ-2, PJ-3).
- Atualizar status do lead: `routed_to_agent`.

### Etapa 6 - Notificacoes por email

- Enviar email para o lead com:
  - Resumo da conversa
  - Dados coletados
  - Protocolo
  - Nome/fluxo do atendente responsavel
- Enviar email para o atendente com:
  - Resumo estruturado
  - Checklist coletado
  - Pontos de risco e observacoes

### Etapa 7 - Atendimento humano

- Atendente assume o caso no fluxo dele.
- Atualiza status manual: `in_human_service`, `proposal_sent`, `closed_won`, `closed_lost`.

## 9. Modelo de dados (PostgreSQL - fase 1)

Tabelas recomendadas:

- `agents`
  - id, code (PF-1...), name, email, segment (PF/PJ), flow_type, active

- `leads`
  - id, segment, person_type, full_name, cpf_cnpj, birth_date, marital_status, cep
  - vehicle_model, vehicle_year, plate, app_usage, has_young_driver, renewal
  - assigned_agent_id, status, created_at, updated_at

- `lead_answers`
  - id, lead_id, question_key, answer_value, collected_at

- `conversations`
  - id, lead_id, channel, started_at, ended_at

- `conversation_messages`
  - id, conversation_id, role (user/assistant/system), content, created_at

- `email_logs`
  - id, lead_id, recipient_email, template_name, status, provider_id, created_at

## 10. Espaço no front-end para cadastro de atendentes

Como o front atual e estatico, definir uma tela inicial simples de operacao:

- Pagina: `docs` ou nova pagina administrativa leve.
- Funcao: cadastrar/editar atendentes dos 5 fluxos.
- Campos minimos:
  - Nome
  - Email
  - Codigo interno (PF-1, PF-2, PJ-1, PJ-2, PJ-3)
  - Segmento (PF/PJ)
  - Fluxo
  - Ativo (Sim/Nao)

API necessaria para essa tela (futura implementacao):

- `GET /api/agents`
- `POST /api/agents`
- `PUT /api/agents/:id`
- `PATCH /api/agents/:id/active`

## 11. Gemini + seguranca da chave

### 11.1 LLM

- Provedor: Google Gemini (via LangChain).
- Modelo sugerido inicial: `gemini-1.5-pro` ou equivalente configuravel.

### 11.2 Armazenamento seguro da chave

Recomendacao obrigatoria:

- Nao versionar chave em `.env` no git.
- Em Docker, usar secrets.
- Em ambiente cloud, usar Secret Manager (GCP Secret Manager, AWS Secrets Manager ou Vault).

Padrao para app:

- Variavel de ambiente: `GEMINI_API_KEY_FILE` apontando para arquivo montado como secret.
- Backend le o conteudo do arquivo em runtime.

## 12. Requisitos Docker

Arquitetura prevista:

- `frontend` (nginx ou static server)
- `backend` (node/express/langchain)
- `postgres` (persistencia)

Requisitos minimos:

- `docker compose up -d` sobe os 3 servicos.
- Backend aguarda banco pronto antes de migracoes.
- Volume para dados do Postgres.
- Rede interna para comunicacao entre servicos.
- Secret da Gemini montado em `/run/secrets/gemini_api_key`.

Variaveis de ambiente esperadas no backend:

- `PORT`
- `DATABASE_URL`
- `GEMINI_MODEL`
- `GEMINI_API_KEY_FILE`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

## 13. Templates de email (resumo)

### 13.1 Email para lead

Assunto: `Recebemos sua solicitacao de seguro auto - Protocolo {{protocolo}}`

Conteudo:

- Saudacao com nome
- Resumo da conversa
- Dados coletados
- Fluxo e atendente responsavel
- Proximos passos

### 13.2 Email para atendente

Assunto: `Novo lead roteado - {{flow_code}} - {{nome_lead}}`

Conteudo:

- Segmento PF/PJ
- Checklist completo
- Resumo curto IA
- Alertas (uso app, condutor jovem, renovacao)
- Contato do lead

## 14. Regras de resposta do agente (compliance)

- Nao prometer preco final.
- Nao afirmar cobertura sem condicao de apolice.
- Sempre informar que cotacao final depende de analise da seguradora.
- Registrar consentimento para contato e uso de dados.

## 15. Criterios de aceite da fase 1

- Agente coleta todos os pre-requisitos do PDF antes de rotear.
- Lead e roteado para um dos 5 atendentes conforme regra.
- Email para lead e atendente e enviado com resumo e dados.
- Cadastro de atendente disponivel em tela front-end.
- Persistencia no Postgres funcionando.
- Aplicacao sobe via Docker Compose.

## 16. Plano de implementacao sugerido (proxima etapa)

1. Definir schema SQL e migracoes.
2. Implementar modulo Gemini em LangChain.
3. Implementar fluxo de coleta + classificador de roteamento.
4. Implementar notificacao por email.
5. Criar tela front-end de cadastro de atendentes.
6. Criar docker-compose e Dockerfiles.
7. Testes de fluxo PF/PJ + testes de regressao de roteamento.

## 17. Espaco para Historias de Usuario e Mudancas

Esta secao deve ser usada sempre que houver necessidade de ajustar comportamento, regras ou funcionalidades do agente.

### 17.1 Template de historia de usuario

Copiar e preencher o template abaixo para cada nova necessidade:

```text
ID: US-XXX
Titulo: <nome curto da necessidade>

Como <perfil: cliente PF, cliente PJ, atendente, gestor>
Quero <objetivo>
Para <beneficio de negocio>

Contexto:
- <detalhe 1>
- <detalhe 2>

Regras de negocio:
- <regra 1>
- <regra 2>

Criterios de aceite:
1) <criterio testavel>
2) <criterio testavel>
3) <criterio testavel>

Impacto tecnico esperado:
- Backend: <modulos/endpoints>
- Front-end: <telas/componentes>
- Banco: <tabelas/campos>
- Prompt/LLM: <ajustes de prompt/classificador>

Prioridade: <Alta|Media|Baixa>
Status: <Backlog|Em analise|Aprovada|Em desenvolvimento|Concluida>
Responsavel: <nome>
Data solicitacao: <YYYY-MM-DD>
```

### 17.2 Historias de usuario iniciais (backlog base)

| ID | Titulo | Como | Quero | Para | Contexto | Regras de negocio | Criterios de aceite | Impacto tecnico esperado | Prioridade | Status | Responsavel | Data solicitacao |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| US-001 | Ajuste de perguntas de triagem | Gestor comercial | Alterar a ordem e o texto das perguntas obrigatorias | Melhorar taxa de conclusao da triagem | Necessidade de otimizar experiencia de coleta sem perder dados criticos | Perguntas devem continuar cobrindo os campos minimos do roteamento PF/PJ | 1) Perguntas podem ser atualizadas sem quebrar o roteamento PF/PJ.<br>2) Campos minimos continuam obrigatorios antes de encaminhar ao atendente.<br>3) Mudanca fica registrada no historico de versoes do blueprint. | Backend: motor de triagem e validacoes.<br>Front-end: formulario/conversa de coleta.<br>Banco: sem mudanca estrutural obrigatoria.<br>Prompt/LLM: atualizacao do roteiro de perguntas. | Media | Backlog | A definir | 2026-05-17 |
| US-002 | Novo criterio de roteamento PF | Supervisor de atendimento | Criar regra adicional para direcionar PF com perfil de alto risco | Reduzir tempo de resposta dos atendentes especialistas | Necessidade de separar mais cedo casos PF sensiveis | Regra nova deve atuar apenas em PF e manter fallback de revisao manual | 1) Regra nova nao afeta roteamento PJ.<br>2) Prompt classificador retorna atendente correto para os cenarios de teste.<br>3) Casos ambiguos continuam com revisao manual. | Backend: logica de roteamento PF.<br>Front-end: sem impacto direto obrigatorio.<br>Banco: opcional campo de classificacao de risco.<br>Prompt/LLM: ajuste no prompt classificador. | Alta | Backlog | A definir | 2026-05-17 |
| US-003 | Personalizacao de email para lead | Atendente | Ajustar o email enviado ao lead para resumo mais objetivo | Aumentar taxa de retorno e conversao | Emails atuais podem estar longos ou pouco acionaveis | Manter dados essenciais e padronizacao de comunicacao | 1) Template de email do lead pode ser alterado sem impactar envio ao atendente.<br>2) Email sempre inclui protocolo e dados essenciais coletados.<br>3) Log de envio fica registrado em email_logs. | Backend: servico e template de email.<br>Front-end: sem impacto direto obrigatorio.<br>Banco: uso da tabela email_logs.<br>Prompt/LLM: opcional sumarizacao mais curta. | Media | Backlog | A definir | 2026-05-17 |
| US-004 | Priorizacao de lead por urgencia (EXEMPLO) | Atendente PF | Marcar automaticamente leads com urgencia alta no roteamento | Atender primeiro casos criticos e aumentar conversao | Alguns leads precisam retorno no mesmo dia por vencimento de apolice; hoje todos chegam sem prioridade explicita | Se vencimento em ate 7 dias, prioridade alta.<br>Se sem cobertura ativa, prioridade alta.<br>Sem urgencia declarada, prioridade normal. | 1) Campo priority_level salvo no lead com valores alta ou normal.<br>2) Resumo enviado ao atendente exibe prioridade no topo.<br>3) Roteamento PF/PJ continua igual, mudando apenas prioridade de atendimento. | Backend: classificador de triagem e payload de roteamento.<br>Front-end: destaque visual de prioridade na lista de leads.<br>Banco: nova coluna priority_level em leads.<br>Prompt/LLM: instrucao para identificar urgencia de vencimento e ausencia de cobertura. | Media | Backlog | A definir | 2026-05-17 |

### 17.3 Controle de mudancas (Change Log funcional)

Registrar cada alteracao aprovada em formato curto:

```text
Data: YYYY-MM-DD
ID da historia: US-XXX
Mudanca aplicada: <resumo>
Arquivos/areas impactadas: <backend/front/prompt/banco>
Risco: <baixo|medio|alto>
Observacao: <rollback ou dependencia>
```

### 17.4 Politica para mudancas no agente

Antes de implementar qualquer mudanca funcional:

1. Criar ou atualizar uma historia de usuario nesta secao.
2. Validar criterios de aceite com area de negocio.
3. Identificar impacto em roteamento PF/PJ e emails.
4. Confirmar impacto em Docker, banco e variaveis de ambiente.
5. So depois disso iniciar implementacao tecnica.
