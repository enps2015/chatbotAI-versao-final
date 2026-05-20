# SeguroAuto AI - Agente de Triagem e Roteamento

Implementacao da fase 1 do agente de seguro auto baseada no Blueprint.

## O que foi implementado

- Frontend existente mantido e integrado ao backend.
- Chat de triagem com coleta de dados obrigatorios do fluxo de contratacao.
- FAQ inicial para perguntas frequentes.
- Classificacao e roteamento automatico para os 5 atendentes (PF/PJ).
- Persistencia em PostgreSQL (leads, conversas, respostas, logs de email e atendentes).
- API administrativa para cadastro/edicao/ativacao de atendentes.
- Envio de email para lead e atendente ao finalizar roteamento (quando SMTP configurado).
- Estrutura Docker Compose com frontend, backend e postgres.

## Configuracao de ambiente

1. Copie as variaveis base:

   cp .env.example .env

2. Configure o arquivo de secret da Gemini:

   - Caminho esperado: secrets/gemini_api_key.txt
   - Insira sua chave real no arquivo.

3. Ajuste SMTP no .env para habilitar envio de emails.

## Rodar localmente (sem Docker)

1. Instalar dependencias:

   npm install

2. Garantir um PostgreSQL ativo e atualizar DATABASE_URL no .env.

3. Subir aplicacao:

   npm run dev

4. Acesse:

   - App: http://localhost:3000
   - Healthcheck: http://localhost:3000/api/health

## Rodar com Docker

1. Garanta que o arquivo de secret exista em secrets/gemini_api_key.txt.

2. Suba os servicos:

   docker compose up -d --build

3. Acesse:

   - Frontend: http://localhost:8080
   - Backend: http://localhost:3000
   - PostgreSQL: localhost:5432

## Endpoints principais

- GET /api/health
- POST /api/chat
- GET /api/agents
- POST /api/agents
- PUT /api/agents/:id
- PATCH /api/agents/:id/active

---

## Guia para novos atendentes

### Visao geral do atendimento

A Lia (agente virtual) conduz todo o primeiro contato com o cliente. O atendente humano so entra em cena **apos o roteamento automatico** — quando a Lia ja coletou todos os dados obrigatorios e enviou o e-mail com o checklist completo para o atendente designado.

---

### Estagio 1 — Escuta (listening)

A Lia comeca ouvindo o contexto do cliente sem pedir dados ainda. Ela entende a duvida principal antes de iniciar o cadastro.

O cliente e movido para a coleta quando:
- Menciona intencao de cotar, simular, fazer orcamento ou contratar.
- Ou ja possui algum dado preenchido de uma conversa anterior.

Se o cliente mencionar **sinistro, acidente, roubo, colisao, guincho urgente ou perda total**, o atendimento e desviado imediatamente para o time humano de sinistros — nenhum dado e coletado.

---

### Estagio 2 — Coleta de dados (collecting)

A Lia faz as perguntas uma a uma, na ordem abaixo. O atendente nao precisa se preocupar com esta etapa — ela e totalmente automatica.

| # | Campo | O que e coletado |
|---|---|---|
| 1 | Tipo de pessoa | PF (Pessoa Fisica) ou PJ (Pessoa Juridica) |
| 2 | Nome completo | Nome civil do segurado |
| 3 | Renovacao | Se ja tem apolice vigente (sim/nao) |
| 4 | Data de nascimento | Formato dd/mm/aaaa |
| 5 | CPF | Somente digitos, aceita formatado (000.000.000-00) |
| 6 | CEP de pernoite | CEP onde o veiculo dorme habitualmente |
| 7 | Modelo do veiculo | Ex.: Honda CRV, VW Polo |
| 8 | Ano do veiculo | Ano de fabricacao/modelo |
| 9 | Placa | Formato antigo (ABC-1234) ou Mercosul (ABC1D23) |
| 10 | Uso para app | Se usa o veiculo para Uber, 99 etc. (sim/nao) |
| 11 | Condutor jovem | Se ha motorista entre 18 e 25 anos (sim/nao) |
| 12 | E-mail | Apenas apos todos os campos acima preenchidos |

---

### Estagio 3 — Roteamento (routed)

Ao concluir a coleta, o sistema roteia automaticamente para o atendente correto e envia dois e-mails:

- **Para o cliente:** confirmacao com protocolo e resumo dos dados.
- **Para o atendente:** checklist completo, resumo da IA e historico da conversa.

---

### Fluxos de Pessoa Fisica (PF)

Existem dois fluxos PF. A divisao e feita automaticamente com base nas respostas do cliente:

#### PF-1 — PF Novo

**Quando aciona:** cliente sem renovacao, sem condutor jovem e sem uso para app.

Perfil tipico: primeira contratacao, motorista adulto, uso pessoal comum.

#### PF-2 — PF Renovacao e Perfil Sensivel

**Quando aciona:** pelo menos uma das condicoes abaixo for verdadeira:
- Renovacao de apolice = **sim**
- Condutor entre 18 e 25 anos = **sim**
- Uso para Uber/99 = **sim**

Perfil tipico: renovacoes, segurados com condutor jovem na familia ou motoristas de aplicativo.

---

### Fluxos de Pessoa Juridica (PJ)

| Fluxo | Codigo | Quando aciona |
|---|---|---|
| PJ Frota Leve | PJ-1 | Sem renovacao, sem condicao especial e frota leve |
| PJ Frota Media/Alta Complexidade | PJ-2 | Frota de complexidade media ou alta |
| PJ Renovacao e Condicoes Especiais | PJ-3 | Renovacao = sim OU condicao especial = sim |

---

### Resumo do roteamento

```
Cliente inicia conversa
        |
        v
  [Estagio: listening]
  Lia ouve o contexto
        |
        +-- Menciona sinistro/acidente? --> [sinistro_handoff] --> Time de sinistros
        |
        +-- Quer cotar/simular? --> [Estagio: collecting]
                |
                v
        Coleta os 11 campos obrigatorios + e-mail
                |
                v
        [Estagio: routed]
        Roteamento automatico
                |
                +-- PF sem perfil sensivel --------> PF-1
                +-- PF com renovacao/jovem/app ----> PF-2
                +-- PJ frota leve -----------------> PJ-1
                +-- PJ frota media/alta -----------> PJ-2
                +-- PJ renovacao/especial ---------> PJ-3
```

---

### O que o atendente recebe por e-mail

Ao ser acionado, o atendente recebe um e-mail com:

- Segmento e protocolo do lead
- Checklist com todos os dados coletados
- Resumo gerado pela IA
- Historico completo da conversa
- Alertas de: renovacao, uso de app e condutor jovem
