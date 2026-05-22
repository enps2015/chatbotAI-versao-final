# Plano de Melhoria do Chatbot - Desafio 2 InsurMinds

Data: 2026-05-21

## 1. Objetivo

Este documento define o plano de melhorias do projeto SeguroAuto AI para aproximação aos critérios do Desafio 2 do curso InsurMinds.

O plano considera:

- requisitos identificados no documento do desafio;
- análise do código, Docker, frontend, backend, banco e documentação existente;
- bases públicas e locais de seguro auto disponíveis no workspace;
- riscos de alucinação em respostas de IA;
- requisitos de LGPD, histórico de conversas e clareza para o usuário;
- preservação da arquitetura já implementada.

Este plano não propõe substituição da solução existente. A estratégia é evoluir o MVP atual de triagem e roteamento para um assistente virtual de seguro auto com conhecimento controlado, respostas mais seguras e melhor experiência de atendimento.

## 2. Estado atual do projeto

O projeto possui uma base funcional que deve ser preservada:

- frontend React/Vite com interface de chat e tela de atendentes;
- backend Express em `server.ts`;
- banco PostgreSQL para leads, conversas, mensagens, atendentes, respostas e logs de e-mail;
- Docker Compose com frontend, backend e banco;
- integração opcional com Gemini via LangChain para extração de dados;
- roteamento PF/PJ para fluxos de atendimento;
- camada Python para composição de respostas conversacionais;
- persistência de conversas em `conversations` e `conversation_messages`.

O estado atual atende parcialmente ao desafio, pois automatiza triagem e roteamento. Entretanto, ainda não caracteriza um assistente especializado em seguro auto, pois faltam:

- respostas de FAQ baseadas em fonte controlada;
- camada RAG ou recuperação documental;
- política anti-alucinação;
- fluxo conversacional mais claro;
- documentação técnica alinhada ao uso real com Docker;
- tratamento explícito de LGPD e histórico de conversas;
- evidências formais de execução e relatório final.

## 3. Documentos complementares

| Documento | Finalidade |
|---|---|
| `docs/coleta-base-conhecimento-faq-seguro-auto.md` | Registro das fontes públicas e locais para FAQ/RAG. |
| `docs/analise-bases-grupo-seguro-auto.md` | Análise dos documentos coletados pelo grupo e da FAQ da integrante especialista em seguros. |
| `docs/estrategia-humanizacao-chatbot.md` | Plano de humanização do fluxo conversacional. |
| `docs/avatar-lgpd-historico-chatbot.md` | Plano para avatar, histórico de conversas, transparência e LGPD. |
| `docs/plano-controle-alucinacoes-chatbot.md` | Política de controle de alucinações, guardrails e fallback seguro. |
| `docs/sumario-executivo-melhorias-desafio-2.md` | Visão executiva, matriz de aderência e checklist priorizado. |
| `knowledge/README.md` | Finalidade da base de conhecimento. |
| `knowledge/faq-seguro-auto.md` | FAQ curada com linguagem segura para o chatbot. |
| `knowledge/base-rag-seguro-auto.md` | Base inicial em blocos para futura recuperação/RAG. |
| `knowledge/fontes-publicas.md` | Inventário de fontes públicas externas. |
| `knowledge/fontes-locais-grupo.md` | Inventário de bases locais coletadas pelo grupo. |
| `knowledge/intencoes-faq-seguro-auto.jsonl` | Intenções estruturadas para classificação de perguntas frequentes. |

## 4. Aderência ao Desafio 2

| Requisito esperado | Situação atual | Ação planejada | Status |
|---|---|---|---|
| Chatbot/assistente virtual baseado em IA | Existe chat com backend e LLM opcional | Preservar estrutura e controlar melhor respostas | Planejado |
| Atendimento automatizado | Triagem e roteamento funcionam parcialmente | Completar fluxo mínimo e corrigir roteamento | Planejado |
| Responder perguntas frequentes | FAQ atual é limitada e baseada em regex | Integrar FAQ curada e intents estruturadas | Planejado |
| Direcionar solicitações | Roteamento PF/PJ implementado | Melhorar handoff de sinistro, urgência e assistência | Planejado |
| Fluxos por tipo de consulta | Predominância de cotação/triagem | Separar cotação, dúvida, sinistro e assistência | Planejado |
| Uso de bases documentais | Bases foram coletadas, mas não integradas | Conectar `knowledge/` ao fluxo de resposta | Planejado |
| RAG para enriquecer contexto | Não implementado | Implementar RAG simples com Markdown e evoluir para PDFs prioritários | Planejado |
| Redução de alucinações | Não há guardrail efetivo no fluxo | Implementar FAQ controlada, fallback seguro e testes anti-alucinação | Planejado |
| Tratamento de dados pessoais | Parcial, sem política explícita no fluxo | Ajustar consentimento, minimização, mascaramento e histórico seguro | Planejado |
| Evidências e relatório final | Não formalizados | Criar evidências, roteiro de testes e relatório final | Planejado |

## 5. Falhas e riscos atuais

### 5.1 Funcionais

- Lead é roteado sem coleta obrigatória de e-mail.
- Checklist de contratação de seguro auto não está totalmente coberto.
- Campos relevantes como estado civil, garagem, tipo de residência, uso para trabalho, garagem no trabalho e cobertura para terceiros não estão consolidados no fluxo obrigatório.
- Roteamento PJ depende de campos que não são coletados de forma determinística.
- Regex de uso por aplicativo pode interpretar `99` dentro de datas como uso de app.
- Após roteamento, o chatbot pode continuar repetindo mensagem final sem orientar adequadamente o próximo passo.

### 5.2 Técnicos

- `npm ci` falha por divergência entre `package.json` e `package-lock.json`.
- `npm run lint` falha por ausência de tipagens Vite/importação de imagens.
- Falta `.dockerignore`.
- Build Docker pode incluir `.env`, `secrets/`, `node_modules`, `dist` e artefatos locais.
- Frontend pode expor `/server.js` e `/server.js.map`.
- Backend pode iniciar antes do PostgreSQL estar pronto.
- Imagem backend está maior que o necessário.

### 5.3 Segurança, LGPD e governança

- Endpoints administrativos não possuem autenticação.
- CORS está aberto.
- Não há rate limit no endpoint de chat.
- Não há validação forte de vínculo entre `leadId` e `conversationId`.
- Histórico de conversas contém dados pessoais e não deve ser exposto apenas por ID numérico.
- CPF/CNPJ, placa, e-mail, data de nascimento e CEP exigem tratamento cuidadoso.
- Ainda não há política de retenção, mascaramento e uso de dados em ambiente de demonstração.

### 5.4 IA e conhecimento

- FAQ atual é pequena e não utiliza a base `knowledge/`.
- Não há recuperação de fonte antes de respostas técnicas.
- Não há rastreabilidade de fonte usada.
- O chatbot ainda pode gerar respostas genéricas sobre cobertura, preço, sinistro ou regras contratuais.
- Não há fallback padronizado para ausência de base confiável.

### 5.5 Documentação

- README mistura execução Docker e execução local sem Docker.
- `docs/insurance-agent-backend.md` está obsoleto em relação ao projeto atual.
- `Blueprint.md` precisa refletir status real de implementação.
- Não há relatório final em PDF com evidências do experimento.

## 6. Estratégia de implantação

As melhorias serão implantadas por prioridade, reduzindo risco operacional e preservando a estrutura atual.

### Prioridades

| Prioridade | Descrição | Objetivo |
|---|---|---|
| P0 | Preparação e estabilização | Garantir que build, Docker, documentação base e fluxo atual estejam confiáveis. |
| P1 | Fluxo funcional mínimo | Corrigir coleta, roteamento e bugs que afetam a triagem. |
| P2 | Experiência e transparência | Melhorar interface, avatar, histórico local, consentimento e clareza para o usuário. |
| P3 | Conhecimento e anti-alucinação | Integrar FAQ controlada, fallback seguro, testes anti-alucinação e RAG simples. |
| P4 | Segurança e governança | Aplicar controles mínimos de acesso, CORS, rate limit, histórico seguro e retenção. |
| P5 | Evidências e entrega acadêmica | Gerar documentação final, evidências de execução e relatório do desafio. |

## 7. Checklist priorizado de implementação

### P0 - Preparação e estabilização

- [x] Sincronizar `package-lock.json` com `package.json`.
- [x] Garantir execução de `npm ci`.
- [x] Corrigir `npm run lint`.
- [x] Corrigir tipagem de `import.meta.env`.
- [x] Adicionar declaração para importação de `.png`.
- [x] Criar `.dockerignore`.
- [x] Impedir cópia de `.env`, `secrets/`, `node_modules`, logs e artefatos locais nas imagens.
- [x] Separar corretamente artefatos de frontend e backend no build.
- [x] Impedir exposição de `/server.js` e `/server.js.map` pelo nginx.
- [x] Adicionar healthcheck no PostgreSQL.
- [x] Fazer backend aguardar banco pronto.
- [x] Ajustar `.env.example` para SMTP desabilitado por padrão.
- [x] Corrigir README, definindo Docker como caminho oficial de execução.
- [x] Registrar execução esperada de `docker compose up -d --build`.

### P1 - Fluxo funcional mínimo

- [x] Incluir e-mail no fluxo antes do roteamento final.
- [x] Definir campos obrigatórios mínimos para roteamento.
- [x] Definir campos adicionais para cotação completa.
- [x] Coletar ou justificar estado civil.
- [x] Coletar ou justificar garagem em casa.
- [x] Coletar ou justificar tipo de residência.
- [x] Coletar ou justificar uso para trabalho.
- [x] Coletar ou justificar garagem no trabalho.
- [x] Coletar ou justificar valor de cobertura para terceiros.
- [x] Corrigir regex de `app_usage` para não interpretar datas como uso de app.
- [x] Coletar `fleet_complexity` para PJ quando aplicável.
- [x] Coletar `special_condition` para PJ quando aplicável.
- [x] Ajustar comportamento após lead roteado.
- [x] Garantir handoff imediato para sinistro, roubo, furto, acidente ou urgência.

### P2 - Experiência, avatar, histórico e LGPD

- [x] Ajustar persona da Lia como assistente virtual, sem simular atendimento humano.
- [x] Criar avatar próprio da Lia sem rosto humano realista.
- [x] Exibir avatar da Lia nas mensagens da assistente.
- [x] Exibir mensagens do usuário com identidade visual distinta.
- [x] Usar rótulos `Lia - assistente virtual` e `Você`.
- [x] Quebrar respostas longas em blocos menores no frontend.
- [x] Implementar delay proporcional curto entre blocos.
- [x] Adicionar quick replies para PF/PJ.
- [x] Adicionar quick replies para Sim/Não.
- [x] Adicionar quick replies para intenção inicial: cotação, dúvida, sinistro/assistência.
- [x] Salvar conversa atual no `localStorage`.
- [x] Restaurar conversa local após recarregamento da página.
- [x] Adicionar opção para iniciar nova conversa.
- [x] Atualizar texto de consentimento LGPD.
- [x] Atualizar aviso curto no rodapé do chat.
- [x] Informar finalidade de uso dos dados antes da coleta.

### P3 - Conhecimento, FAQ, RAG e anti-alucinação

- [x] Carregar `knowledge/intencoes-faq-seguro-auto.jsonl` no backend.
- [x] Substituir ou complementar o array fixo `FAQS` com FAQ controlada.
- [x] Conectar respostas comuns a `knowledge/faq-seguro-auto.md`.
- [x] Usar `knowledge/base-rag-seguro-auto.md` como primeira base de recuperação.
- [x] Implementar busca documental simples por categoria/termos.
- [x] Implementar fallback seguro para ausência de fonte.
- [x] Proibir respostas absolutas sobre cobertura, preço, indenização ou aceitação.
- [x] Adicionar política de resposta: depender da apólice, seguradora e condições contratadas.
- [x] Registrar internamente fonte usada na resposta, quando aplicável.
- [x] Criar testes anti-alucinação.
- [x] Implementar RAG simples com Markdown.
- [ ] Expandir RAG para PDFs prioritários: SUSEP, apostila 2025, cartilha SUSEP e manual de bônus.

### P4 - Segurança e governança

- [x] Proteger endpoints administrativos com `ADMIN_API_KEY`.
- [x] Exigir header administrativo em `/api/agents`.
- [x] Restringir CORS à origem configurada do frontend.
- [x] Adicionar rate limit básico em `/api/chat`.
- [x] Validar vínculo entre `leadId` e `conversationId`.
- [x] Criar token aleatório para histórico recuperável do banco.
- [x] Impedir consulta de histórico apenas por ID numérico.
- [x] Mascarar CPF/CNPJ, placa e e-mail em listagens e resumos.
- [x] Definir política mínima de retenção de dados.
- [x] Garantir que dados reais não sejam usados em base `knowledge/` ou demonstrações.

### P5 - Evidências e entrega acadêmica

- [x] Criar pasta `docs/evidencias/`.
- [x] Registrar `docker compose ps`.
- [x] Registrar resposta de `/api/health`.
- [x] Registrar conversa PF roteada.
- [x] Registrar conversa PJ roteada.
- [x] Registrar caso de sinistro com handoff humano.
- [x] Registrar exemplo de FAQ controlada.
- [x] Registrar exemplo de fallback seguro.
- [x] Registrar evidência de histórico local.
- [x] Registrar evidência visual do avatar e diferenciação de falas.
- [x] Criar `docs/relatorio-final-desafio-2.md`.
- [x] Exportar relatório final para PDF.

## 8. Critérios de aceite

### 8.1 Build e execução

- `npm ci` executa sem erro.
- `npm run lint` executa sem erro.
- `npm run build` executa sem erro.
- `docker compose up -d --build` sobe frontend, backend e banco.
- `/api/health` retorna banco disponível.
- `/server.js` não é exposto pelo frontend.

### 8.2 Fluxo de triagem

- Lead PF novo é roteado para `PF-1`.
- Lead PF com renovação, uso por app ou condutor jovem é roteado para `PF-2`.
- Lead PJ leve é roteado para `PJ-1`.
- Lead PJ complexo é roteado para `PJ-2`.
- Lead PJ com renovação ou condição especial é roteado para `PJ-3`.
- Lead não é roteado sem e-mail, se e-mail permanecer requisito de comunicação.
- Datas como `12/05/1990` não acionam `app_usage`.

### 8.3 Experiência do usuário

- A interface diferencia visualmente Lia e usuário.
- A Lia possui avatar próprio.
- A interface informa que a Lia é assistente virtual.
- Respostas longas são exibidas em blocos menores.
- Quick replies reduzem digitação em perguntas fechadas.
- Conversa atual é preservada após recarregamento da página.

### 8.4 LGPD e segurança

- Consentimento e finalidade de coleta são apresentados ao usuário.
- Histórico recuperável do banco exige token ou autenticação.
- Dados pessoais são mascarados em listagens e resumos.
- Endpoints administrativos exigem chave.
- CORS e rate limit estão configurados.

### 8.5 Anti-alucinação e conhecimento

- Perguntas frequentes usam FAQ controlada.
- Perguntas técnicas usam fonte documental ou fallback seguro.
- O chatbot não garante cobertura, preço, indenização ou aceitação.
- Sinistro, roubo, furto, acidente e urgência geram handoff humano.
- Testes anti-alucinação passam.

## 9. Escopo fora desta etapa

As seguintes iniciativas não são recomendadas para a próxima etapa:

- substituição de React/Vite;
- substituição de Express;
- substituição de PostgreSQL;
- reescrita integral em framework de agentes;
- criação de CRM completo;
- integração com WhatsApp;
- integração com seguradoras reais;
- fine-tuning de modelo;
- autenticação corporativa complexa;
- uso de CPF/CNPJ para enriquecimento externo de dados;
- memória de longo prazo com dados pessoais.

## 10. Ordem recomendada de execução até 22/05/2026 pela manhã

Estado atual de execução:

1. P0 concluído: estabilização técnica, Docker, build e README.
2. P1 concluído: fluxo funcional mínimo, coleta dinâmica, roteamento e handoff.
3. P2 concluído: experiência do chat, avatar, histórico local, LGPD e respostas rápidas.
4. P3 concluído no escopo principal: FAQ controlada, Markdown/RAG simples, fallback seguro, registro de fonte e testes anti-alucinação.
5. P4 concluído: segurança administrativa, CORS, rate limit, token de histórico, vínculo lead/conversa, mascaramento e retenção.
6. P5 concluído: evidências, screenshot, relatório final em Markdown e PDF.

Próxima ordem operacional:

1. Validar a entrega com o grupo.
2. Trocar `ADMIN_API_KEY` padrão por chave forte antes de demonstração pública.
3. Avaliar a expansão do RAG para PDFs prioritários como melhoria complementar, sem bloquear a entrega principal.

## 11. Conclusão

O projeto possui uma base funcional adequada para evolução incremental. As implementações realizadas já transformam o MVP de triagem em um assistente virtual de seguro auto com respostas fundamentadas, melhor experiência de uso, controles de privacidade e menor risco de alucinação.

A implantação deve seguir agora para segurança, governança e evidências finais, preservando a estrutura original do projeto.
