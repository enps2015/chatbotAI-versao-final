# Sumário Executivo das Melhorias - Desafio 2 InsurMinds

Data: 2026-05-21

## 1. Finalidade

Este documento apresenta a visão executiva das melhorias planejadas para o chatbot SeguroAuto AI no contexto do Desafio 2 InsurMinds.

O objetivo é consolidar, em formato de acompanhamento de projeto:

- aderência aos critérios do desafio;
- principais lacunas do projeto atual;
- melhorias planejadas;
- documentos de referência;
- checklist priorizado de implementação;
- ordem recomendada de execução.

## 2. Síntese executiva

O projeto atual entrega um MVP funcional de triagem e roteamento para seguro auto. A solução possui frontend, backend, banco PostgreSQL, Docker, integração opcional com Gemini, persistência de conversas e roteamento PF/PJ.

Para atender melhor aos critérios do Desafio 2, o projeto deve evoluir para um assistente virtual com:

- fluxo de coleta mais completo;
- FAQ controlada;
- base de conhecimento rastreável;
- RAG simples ou recuperação documental;
- controle contra alucinações;
- handoff humano para sinistro e urgência;
- avatar e identificação clara das falas;
- histórico de conversas com segurança;
- consentimento e cuidados LGPD;
- evidências formais de execução.

A estratégia definida preserva a arquitetura atual e organiza as melhorias por prioridade.

## 3. Matriz de aderência ao desafio

| Critério | Situação atual | Ação prevista | Prioridade |
|---|---|---|---|
| Chatbot/assistente virtual com IA | Parcialmente atendido | Controlar melhor uso do LLM e respostas da assistente | P3 |
| Atendimento automatizado | Parcialmente atendido | Completar coleta e corrigir roteamento | P1 |
| Respostas a FAQs | Baixa cobertura | Integrar FAQ curada e intents estruturadas | P3 |
| Direcionamento de solicitações | Parcialmente atendido | Melhorar handoff de sinistro, assistência e urgência | P1/P3 |
| Fluxos por tipo de consulta | Parcial | Separar cotação, dúvida, sinistro e assistência | P2/P3 |
| Uso de documentação pública | Documentado, não integrado | Conectar `knowledge/` ao backend | P3 |
| RAG/contexto documental | Não implementado | Implementar RAG simples com Markdown e evoluir para PDFs | P3 |
| Redução de alucinações | Não implementado | Aplicar guardrails, fallback seguro e testes | P3 |
| LGPD e privacidade | Parcial | Consentimento, mascaramento, histórico seguro e retenção | P2/P4 |
| Evidências e relatório | Pendente | Criar evidências, roteiro de testes e relatório final | P5 |

## 4. Documentos de referência

| Documento | Uso no projeto |
|---|---|
| `docs/plano-melhoria-chatbot-desafio-2.md` | Plano principal de implementação e prioridades. |
| `docs/coleta-base-conhecimento-faq-seguro-auto.md` | Registro de fontes públicas e locais para FAQ/RAG. |
| `docs/analise-bases-grupo-seguro-auto.md` | Análise das bases coletadas pelo grupo. |
| `docs/estrategia-humanizacao-chatbot.md` | Plano de humanização do atendimento. |
| `docs/avatar-lgpd-historico-chatbot.md` | Avatar, histórico, consentimento e LGPD. |
| `docs/plano-controle-alucinacoes-chatbot.md` | Guardrails, fallback seguro e testes anti-alucinação. |
| `knowledge/faq-seguro-auto.md` | FAQ curada para respostas controladas. |
| `knowledge/base-rag-seguro-auto.md` | Base inicial para recuperação documental/RAG. |
| `knowledge/fontes-publicas.md` | Inventário de fontes públicas externas. |
| `knowledge/fontes-locais-grupo.md` | Inventário de documentos locais do grupo. |
| `knowledge/intencoes-faq-seguro-auto.jsonl` | Intenções para classificação de perguntas frequentes. |

## 5. Checklist priorizado

### P0 - Estabilização técnica e documentação base

- [x] Sincronizar `package-lock.json`.
- [x] Corrigir `npm ci`.
- [x] Corrigir `npm run lint`.
- [x] Corrigir tipagens Vite e importação de imagens.
- [x] Criar `.dockerignore`.
- [x] Remover `.env`, `secrets/`, logs e artefatos locais das imagens Docker.
- [x] Corrigir exposição de `/server.js` e `/server.js.map`.
- [x] Adicionar healthcheck do PostgreSQL.
- [x] Garantir que backend aguarde o banco.
- [x] Ajustar SMTP para não derrubar fluxo em desenvolvimento.
- [x] Atualizar README com Docker como execução oficial.

### P1 - Fluxo funcional mínimo

- [x] Coletar e-mail antes do roteamento.
- [x] Definir campos mínimos de roteamento.
- [x] Definir campos complementares para cotação.
- [x] Corrigir regex de uso por aplicativo.
- [x] Completar perguntas de triagem relevantes.
- [x] Melhorar roteamento PJ.
- [x] Ajustar comportamento após conclusão do roteamento.
- [x] Garantir handoff humano para sinistro, roubo, furto, acidente e urgência.

### P2 - Experiência, avatar, histórico local e LGPD

- [x] Ajustar persona da Lia como assistente virtual.
- [x] Criar avatar próprio da Lia.
- [x] Diferenciar visualmente falas da Lia e do usuário.
- [x] Usar rótulos `Lia - assistente virtual` e `Você`.
- [x] Quebrar respostas longas em blocos.
- [x] Implementar delay proporcional curto.
- [x] Implementar quick replies para PF/PJ, Sim/Não e intenção inicial.
- [x] Salvar conversa atual em `localStorage`.
- [x] Restaurar histórico local após recarregamento da página.
- [x] Atualizar consentimento e aviso LGPD no chat.

### P3 - FAQ controlada, RAG e anti-alucinação

- [x] Carregar `knowledge/intencoes-faq-seguro-auto.jsonl`.
- [x] Integrar `knowledge/faq-seguro-auto.md` ao fluxo de respostas.
- [x] Usar `knowledge/base-rag-seguro-auto.md` como base inicial.
- [x] Implementar fallback seguro sem fonte confiável.
- [x] Bloquear promessas de cobertura, preço, indenização ou aceitação.
- [x] Registrar fonte usada quando houver resposta controlada.
- [x] Criar testes anti-alucinação.
- [x] Implementar RAG simples com Markdown.
- [ ] Expandir RAG para PDFs prioritários.

### P4 - Segurança e governança

- [x] Proteger endpoints administrativos com chave.
- [x] Restringir CORS.
- [x] Adicionar rate limit em `/api/chat`.
- [x] Validar vínculo entre `leadId` e `conversationId`.
- [x] Criar token para histórico recuperável do banco.
- [x] Impedir acesso a histórico apenas por ID numérico.
- [x] Mascarar CPF/CNPJ, placa e e-mail em listagens e resumos.
- [x] Definir política mínima de retenção de dados.

### P5 - Evidências e entrega final

- [x] Criar `docs/evidencias/`.
- [x] Registrar execução Docker.
- [x] Registrar `/api/health`.
- [x] Registrar conversa PF.
- [x] Registrar conversa PJ.
- [x] Registrar caso de sinistro/handoff.
- [x] Registrar FAQ controlada.
- [x] Registrar fallback seguro.
- [x] Registrar avatar e diferenciação visual das falas.
- [x] Criar `docs/relatorio-final-desafio-2.md`.
- [x] Exportar relatório final para PDF.

## 6. Ordem recomendada de execução

1. Executar P0 para estabilizar ambiente, build, Docker e documentação base.
2. Executar P1 para garantir que a triagem funcione corretamente.
3. Executar P2 para melhorar a experiência do usuário e transparência LGPD.
4. Executar P3 iniciando por FAQ controlada antes de RAG.
5. Executar P4 com foco inicial em controles simples de segurança.
6. Executar P5 em paralelo, registrando evidências desde a primeira fase.

## 7. Critérios de aceite consolidados

| Área | Critério |
|---|---|
| Build | `npm ci`, `npm run lint` e `npm run build` executam sem erro. |
| Docker | `docker compose up -d --build` sobe todos os serviços e `/api/health` retorna banco disponível. |
| Segurança Docker | Imagens não incluem `.env` nem `secrets/`. |
| Frontend | `/server.js` não é exposto pelo nginx. |
| Triagem | PF/PJ são roteados corretamente conforme regras de negócio. |
| Coleta | Lead não é finalizado sem dados mínimos definidos. |
| Handoff | Sinistro, roubo, furto, acidente e urgência são encaminhados para humano. |
| UX | Lia e usuário possuem identidade visual distinta. |
| Histórico | Conversa local é preservada após recarregamento. |
| LGPD | Finalidade de coleta e consentimento são informados no chat. |
| Anti-alucinação | Respostas técnicas usam fonte controlada ou fallback seguro. |
| RAG | Base `knowledge/` é utilizada para respostas documentais. |
| Evidências | Execução, fluxos e respostas principais estão documentados. |

## 8. Pendências atuais

- Expandir RAG para PDFs prioritários somente se houver tempo e necessidade de demonstração documental mais robusta.
- Trocar `ADMIN_API_KEY` padrão de desenvolvimento por chave forte antes de demonstração pública.
- Validar com o grupo se a busca lexical em Markdown atende ao escopo do desafio ou se será necessário evoluir para embeddings em etapa posterior.

## 9. Conclusão

As melhorias estão documentadas e organizadas em ordem de prioridade. As frentes P0, P1, P2, P3, P4 e P5 foram implementadas, testadas e evidenciadas. O chatbot deixou de ser apenas uma triagem básica e passou a contar com FAQ controlada, busca documental simples, fallback seguro, testes anti-alucinação, governança mínima e relatório final.

O próximo passo recomendado é validar a entrega com o grupo e manter a expansão do RAG para PDFs como melhoria complementar.
