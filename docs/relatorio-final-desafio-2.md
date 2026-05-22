# Relatório Final - Desafio 2 InsurMinds

## 1. Identificação do projeto

Projeto: SeguroAuto AI.

Objetivo: chatbot com assistente virtual para pré-atendimento, orientação inicial, coleta de dados de cotação e roteamento de leads no nicho de seguro automóvel.

Escopo técnico: frontend React/Vite, backend Express/TypeScript, PostgreSQL, Docker Compose, camada Python para composição de respostas e integração opcional com Gemini via LangChain.

## 2. Diagnóstico inicial

A versão inicial do projeto era funcional, mas concentrada em triagem e roteamento. Os principais riscos identificados foram:

- documentação com conflito entre execução local e execução em Docker;
- build e Docker sem validação suficiente;
- fluxo de coleta incompleto para alguns critérios de roteamento;
- FAQ limitada e não conectada às bases documentais do grupo;
- ausência de política prática contra alucinação;
- endpoints administrativos sem proteção;
- CORS aberto e ausência de rate limit;
- histórico sem token de acesso recuperável;
- necessidade de maior clareza visual entre mensagens da assistente e do usuário;
- necessidade de explicitar LGPD, consentimento, minimização e mascaramento.

## 3. Melhorias implementadas

### 3.1 P0 - Estabilização técnica

- Docker Compose padronizado como forma oficial de execução.
- Backend com build multi-stage.
- Frontend com nginx protegido contra exposição de `server.js`.
- `.dockerignore` criado para evitar envio de `.env`, secrets, PDFs e artefatos desnecessários.
- Scripts de build separados para frontend e backend.
- SMTP tornou-se opcional e não bloqueia o fluxo quando não configurado.
- README reescrito com instruções profissionais de execução.

### 3.2 P1 - Fluxo funcional mínimo

- Coleta dinâmica por tipo de cliente PF/PJ.
- E-mail incluído como dado obrigatório antes do roteamento.
- Campos adicionais incluídos para decisão de fluxo: garagem, residência, uso para trabalho, garagem no trabalho, cobertura de terceiros, complexidade da frota e condição especial PJ.
- Roteamento validado para PF e PJ.
- Handoff imediato para sinistro, roubo, furto, acidente e urgência.
- Correção de falso positivo de uso por aplicativo em datas.

### 3.3 P2 - Experiência, avatar, histórico e LGPD

- Identificação visual separada para assistente e usuário.
- Avatar da Lia nas mensagens da assistente.
- Rótulos explícitos: `Lia - assistente virtual` e `Você`.
- Histórico local persistido no navegador.
- Botão de nova conversa.
- Quick replies para intenção inicial, PF/PJ e perguntas Sim/Não.
- Aviso LGPD no rodapé do chat.
- Consentimento informado durante a coleta.

### 3.4 P3 - Conhecimento, FAQ, RAG simples e anti-alucinação

- Carregamento de `knowledge/intencoes-faq-seguro-auto.jsonl`.
- Busca documental simples em `knowledge/base-rag-seguro-auto.md` e `knowledge/faq-seguro-auto.md`.
- Complemento da FAQ fixa com base controlada.
- Fallback seguro para perguntas sem fonte confiável suficiente.
- Bloqueio de respostas absolutas sobre preço, cobertura, indenização e aceitação.
- Registro interno de fonte em `knowledge_answer_logs`.
- Testes anti-alucinação automatizados.
- Handoff preservado para sinistro real.

### 3.5 P4 - Segurança e governança

- Endpoints `/api/agents` protegidos por `ADMIN_API_KEY`.
- Campo de chave administrativa no frontend.
- CORS restrito por `CORS_ORIGIN`.
- Rate limit básico em `/api/chat`.
- Validação de vínculo entre `leadId` e `conversationId`.
- Token aleatório por conversa para histórico recuperável.
- Endpoint de histórico exige token; não há acesso apenas por ID numérico.
- Mascaramento de CPF/CNPJ, placa e e-mail em resumos e histórico retornado por API.
- Política mínima de retenção registrada no README.

## 4. Bases de conhecimento utilizadas

- `knowledge/intencoes-faq-seguro-auto.jsonl`
- `knowledge/faq-seguro-auto.md`
- `knowledge/base-rag-seguro-auto.md`
- `knowledge/fontes-publicas.md`
- `knowledge/fontes-locais-grupo.md`
- `documentacao_base_seguros/`
- `docs/faqs-coletadas-integrante-grupo.pdf`

A integração em runtime foi feita inicialmente com os arquivos Markdown e JSONL. A expansão direta para PDFs permanece como melhoria complementar.

## 5. Evidências de teste

Arquivos de evidência:

- `docs/evidencias/2026-05-22-p0-p1.md`
- `docs/evidencias/2026-05-22-p2.md`
- `docs/evidencias/2026-05-22-p3.md`
- `docs/evidencias/2026-05-22-p4.md`
- `docs/evidencias/chat-ui-avatar-historico.png`

Testes executados:

- `npm ci`
- `npm run lint`
- `npm run build`
- `docker compose build`
- `docker compose up -d`
- `/api/health`
- fluxo PF roteado para `PF-1`
- fluxo PJ roteado para `PJ-1`
- handoff de sinistro
- teste anti-alucinação automatizado
- proteção administrativa sem chave e com chave
- histórico sem token e com token
- validação de vínculo lead/conversa
- CORS permitido para origem configurada e sem header para origem não autorizada

## 6. Resultado atual

O chatbot deixou de ser apenas um robô de triagem básica. A versão atual opera como assistente virtual de pré-atendimento em seguro auto, com:

- coleta progressiva;
- roteamento especializado;
- handoff humano;
- UX mais clara;
- histórico local;
- transparência LGPD;
- FAQ controlada;
- busca documental simples;
- fallback seguro;
- controles mínimos de segurança.

## 7. Pendências e recomendações

Pendências não bloqueantes:

- Expandir RAG para PDFs prioritários: SUSEP, apostila 2025, cartilha SUSEP e manual de bônus.
- Substituir busca lexical por embeddings caso o grupo deseje recuperação documental mais robusta.
- Definir política operacional real de retenção quando o projeto sair do contexto acadêmico.
- Trocar `ADMIN_API_KEY` padrão de desenvolvimento por chave forte antes de qualquer demonstração pública.

Recomendação final:

Manter a estrutura atual, evitar reescrita ampla e evoluir a camada de conhecimento de forma incremental. O projeto já atende melhor ao desafio ao combinar triagem, base documental, anti-alucinação, LGPD e governança mínima.
