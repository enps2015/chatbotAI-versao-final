# Estratégia de Humanização do Chatbot

Data: 2026-05-21

## 1. Objetivo

Este documento analisa o arquivo `docs/estrategias_chatbot_humanizado.pdf` e traduz suas recomendações para o projeto atual do SeguroAuto AI.

A proposta não é reconstruir o chatbot. A ideia é melhorar o fluxo conversacional preservando a arquitetura já existente:

- Frontend React/Vite em `src/App.tsx`.
- Backend Express em `server.ts`.
- Camada Python de composicao de respostas em `python/agent_communicator.py`.
- Configuração de voz em `python/agent_prompt_config.json`.
- Prompt base em `python/system_prompt_lia.txt`.
- Banco PostgreSQL, Docker Compose e roteamento de leads já implementados.

Este documento deve ser lido em conjunto com `docs/avatar-lgpd-historico-chatbot.md`, que detalha a identidade visual da assistente, histórico de conversas e cuidados de LGPD.

## 2. Resumo do PDF analisado

O documento defende que a humanização de chatbots para seguros deve equilibrar acolhimento, clareza e eficiência. Em seguros, o usuário frequentemente chega com dúvidas sensíveis: proteção do patrimônio, medo de prejuízo, urgência após acidente, receio de pagar caro ou insegurança sobre cobertura.

As estratégias citadas se dividem em dois grupos.

### 2.1 Estratégias simples

1. Definir persona com limitações claras.
   - O bot deve se apresentar como assistente virtual.
   - Não deve fingir ser humano.
   - Deve explicar quando uma situação precisa de corretor, seguradora ou atendimento humano.

2. Usar microcopy e variação de saudações.
   - Evitar respostas identicas em sequência.
   - Variar pontes conversacionais como "Perfeito, entendi" ou "Obrigada por compartilhar".

3. Simular tempo de digitacao.
   - Respostas longas não devem aparecer instantaneamente.
   - O tempo deve ser curto, apenas suficiente para parecer natural.

4. Quebrar mensagens em blocos menores.
   - Evitar um balao gigante com várias informações.
   - Separar acolhimento, resposta objetiva e próxima pergunta.

5. Usar botões de resposta rápida.
   - Reduzir atrito em perguntas fechadas.
   - Exemplos: PF/PJ, Sim/Não, Cotação/Dúvida/Sinistro, uso por aplicativo.

### 2.2 Estratégias avancadas

1. Análise de sentimento ou tom.
   - Detectar urgência, frustracao, medo, acidente, roubo, guincho ou linguagem de estresse.
   - Ajustar o tom e, quando necessário, transferir para humano.

2. Memória contextual.
   - Evitar perguntar de novo algo que o usuário já informou.
   - Capturar vários dados numa mesma frase, quando possível.

3. Enriquecimento por CRM.
   - Usar dados externos para reduzir perguntas.
   - No nosso caso, isso deve ficar fora do escopo agora por LGPD, segurança e complexidade.

4. Geracao empatica por LLM com respostas fundamentadas.
   - Usar IA para responder de forma natural.
   - Mas com base em fontes controladas, para reduzir alucinações.

## 3. O que já existe no projeto

O projeto não parte do zero. Ele já possui uma primeira camada de humanização:

- `python/agent_prompt_config.json` define estilos `consultiva` e `executiva`.
- O estilo `consultiva` já traz saudação, pontes amigáveis, texto de escuta ativa, redirecionamento fora de tema e handoff para sinistro.
- `python/system_prompt_lia.txt` já descreve diretrizes de fluidez, anti-robotizacao, uma pergunta por vez e uso de friendly bridges.
- `python/agent_communicator.py` já monta respostas por estágio: `listening`, `collecting`, `routed` e `sinistro_handoff`.
- `src/App.tsx` já exibe indicador de digitacao com tres pontos enquanto aguarda a resposta da API.

Ponto importante: o `system_prompt_lia.txt` e carregado no Python, mas hoje não influencia diretamente a montagem da resposta. A resposta e montada por regras em `agent_communicator.py` usando principalmente `agent_prompt_config.json`.

Isso não é necessariamente ruim. Para o MVP, uma camada determinística de texto é mais previsível do que deixar todo o comportamento nas mãos do LLM.

## 4. Lacunas atuais

1. Persona ainda pode passar uma ideia forte demais de consultoria.
   - "Consultora virtual" é aceitável, mas deve ficar claro que a Lia é assistente virtual e não substitui corretor, seguradora ou leitura da apólice.

2. As mensagens ainda aparecem como um único bloco.
   - O backend até separa partes com quebras de linha, mas o frontend renderiza como uma única mensagem.
   - Para o usuário, isso ainda pode parecer texto despejado.

3. Não há botões de resposta rápida.
   - Perguntas fechadas ainda exigem digitacao.
   - Isso aumenta erro de preenchimento e atrito no fluxo.

4. O indicador de digitacao existe, mas só cobre a espera da API.
   - Quando a API responde, o texto aparece inteiro.
   - Não há delay proporcional nem envio sequencial de blocos.

5. A detecção de sentimento/urgência ainda é muito limitada.
   - Existe handoff para sinistro, mas ele precisa cobrir melhor termos reais como "bati", "roubaram", "furto", "guincho", "ferido", "acidente", "perdi o carro", "estou desesperado".

6. O bot ainda corre risco de soar repetitivo.
   - As pontes são sorteadas, mas não há memória simples para evitar repetir a mesma ponte em turnos consecutivos.

7. O fluxo ainda não diferencia bem pergunta informativa de intenção de cotação.
   - Um usuário pode querer apenas entender franquia, cobertura ou terceiros.
   - O bot tende a conduzir para coleta.

8. A identidade visual das falas ainda pode ficar mais clara.
   - O frontend já usa `role: 'user' | 'assistant'`.
   - Isso permite separar visualmente quem perguntou e quem respondeu sem mudar o backend.
   - Ainda assim, a interface pode reforçar melhor a diferença entre fala da Lia e fala do usuário.
   - A Lia deve ter avatar próprio, mas sem parecer uma pessoa humana real.

9. O histórico existe no banco, mas ainda não existe como recurso do usuário.
   - O backend cria registros em `conversations`.
   - As mensagens são gravadas em `conversation_messages`.
   - O frontend mantem o histórico apenas em estado React durante a sessao atual.
   - Ao recarregar a pagina, a conversa some da tela, mesmo existindo no banco.

10. A comunicação sobre LGPD ainda precisa ficar mais explícita.
   - O bot coleta dados pessoais como nome, CPF/CNPJ, e-mail, data de nascimento, CEP e placa.
   - O usuário precisa entender finalidade, uso dos dados e limites da assistente virtual.
   - Histórico de conversas não deve ser exposto sem token ou autenticacao.

## 5. Melhor forma de implantar sem quebrar a estrutura

O caminho mais seguro é evoluir em camadas pequenas, mantendo a API atual funcionando.

### 5.1 Camada 1: Ajuste de persona e microcopy

Escopo recomendado:

- Ajustar `python/agent_prompt_config.json`.
- Ajustar `python/system_prompt_lia.txt`.
- Não alterar banco.
- Não alterar rotas.
- Não alterar Docker.

Mudancas sugeridas:

- Trocar a abertura para algo mais transparente:
  - "Ola! Eu sou a Lia, assistente virtual da SeguroAuto AI. Posso te orientar sobre seguro auto e coletar os dados iniciais para cotação. Quando o assunto exigir análise humana, eu te direciono para a equipe certa."

- Reforcar limites:
  - "Minhas respostas são orientativas. A confirmação final depende da proposta, apólice e análise da seguradora."

- Ampliar pontes de conversa sem exagero:
  - "Entendi seu ponto."
  - "Certo, já registrei."
  - "Boa pergunta."
  - "Vamos por partes."
  - "Isso é importante para a cotação."

- Evitar promessa de especializacao absoluta:
  - Não usar "especialista definitiva", "garanto", "sempre cobre", "nunca cobre".
  - Preferir "em geral", "normalmente", "depende da cobertura contratada", "precisa ser confirmado na apólice".

Resultado esperado:

- Melhor tom de voz.
- Menos risco jurídico/comercial.
- Mudança pequena e reversível.

### 5.2 Camada 2: Quebra de mensagens no frontend

Escopo recomendado:

- Alterar apenas `src/App.tsx`.
- Manter o backend retornando `data.text` como hoje.
- Dividir a resposta do assistente por blocos quando houver `\n\n` ou quebras claras.

Como implantar:

- Criar uma função no frontend para transformar uma resposta longa em blocos:
  - Remover blocos vazios.
  - Limitar a 3 ou 4 blocos por turno.
  - Preservar Markdown simples.

- Exibir os blocos como mensagens sequenciais da assistente.
- Aplicar pequeno delay entre blocos.

Exemplo de comportamento:

1. Balao 1: acolhimento curto.
2. Balao 2: resposta objetiva.
3. Balao 3: próxima pergunta.

Resultado esperado:

- Conversa mais natural.
- Menos sensacao de texto robotico.
- Sem mudar contrato da API.

### 5.3 Camada 3: Delay proporcional simples

Escopo recomendado:

- Alterar apenas `src/App.tsx`.
- Usar o `isTyping` já existente.

Regra sugerida:

- Delay mínimo: 400 ms.
- Delay máximo: 1400 ms por bloco.
- Calculo simples: `Math.min(1400, Math.max(400, texto.length * 12))`.

Cuidados:

- Não exagerar no delay.
- Atendimento de cotação deve continuar rápido.
- Delay não pode travar input por tempo excessivo.

Resultado esperado:

- Melhor percepcao conversacional.
- Implementação local no frontend.
- Nenhuma mudança em banco ou backend.

### 5.4 Camada 4: Botões de resposta rápida

Escopo recomendado:

- Começar com inferência no frontend ou campo opcional na resposta da API.
- O contrato atual não precisa quebrar.

Opção mais conservadora:

- Frontend identifica a pergunta atual por texto e exibe botões.
- Exemplo:
  - Pergunta contem "Pessoa Física (PF) ou Pessoa Jurídica (PJ)": botões `PF`, `PJ`.
  - Pergunta contém "sim ou não": botões `Sim`, `Não`.
  - Pergunta contém "Uber, 99": botões `Sim`, `Não`.

Opção melhor, ainda compativel:

- Backend passa um campo opcional:
  - `quickReplies?: string[]`
- O frontend usa esse campo quando existir.
- Clientes antigos continuam funcionando porque `text` permanece igual.

Recomendação:

- Implementar primeiro o campo opcional `quickReplies` no backend e no frontend.
- Se faltar tempo, usar inferência no frontend para PF/PJ e Sim/Não.

Resultado esperado:

- Menos digitacao.
- Menos erros de interpretacao.
- Fluxo mais rápido e mais próximo de um chatbot moderno.

### 5.5 Camada 5: Detecção básica de urgência e handoff

Escopo recomendado:

- Alterar `server.ts` de forma pequena.
- Criar uma função simples de detecção antes da coleta normal.
- Reaproveitar o estágio `sinistro_handoff` já existente.

Gatilhos sugeridos:

- Sinistro/acidente: `bati`, `colidi`, `acidente`, `sinistro`, `capotei`, `perda total`.
- Roubo/furto: `roubaram`, `furtaram`, `furto`, `roubo`, `levaram meu carro`.
- Assistência: `guincho`, `pane`, `pneu furou`, `chaveiro`, `sem bateria`.
- Urgência emocional: `desesperado`, `urgente`, `socorro`, `não sei o que fazer`.
- Risco a pessoa: `ferido`, `machucado`, `vitima`, `hospital`.

Resposta recomendada:

- Para acidente/roubo/ferido:
  - Acolher.
  - Não continuar cotação.
  - Direcionar para atendimento humano/sinistro.

- Para assistência simples:
  - Acolher.
  - Explicar que depende da apólice.
  - Direcionar para humano se o usuário precisar de acionamento imediato.

Resultado esperado:

- Melhor cuidado em momentos sensíveis.
- Menor risco de resposta inadequada.
- Aproveita o handoff já implementado.

### 5.6 Camada 6: Memória curta e não repetição

Escopo recomendado:

- Começar no backend, sem nova tabela.
- Usar histórico recente já salvo na conversa ou campos do lead.

Mudancas sugeridas:

- Não repetir a mesma friendly bridge em turnos consecutivos.
- Se o usuário informar mais de um dado na mesma mensagem, não perguntar de novo.
- Melhorar extracao de multiplos slots.
- Corrigir regex que detecta `99` dentro de datas como `1990`.

Resultado esperado:

- Menos frustracao.
- Conversa mais fluida.
- Melhoria direta na qualidade da triagem.

### 5.7 Camada 7: Identidade visual das falas

Escopo recomendado:

- Alterar apenas `src/App.tsx` e estilos associados.
- Reaproveitar o campo `role` já existente em cada mensagem.
- Não alterar banco.
- Não alterar API.

Mudancas sugeridas:

- Manter bolhas do usuário alinhadas a direita.
- Manter bolhas da Lia alinhadas a esquerda.
- Usar avatar fixo para a Lia, preferencialmente uma ilustracao não humana com elementos de escudo, carro e proteção.
- Usar avatar/icone simples para o usuário, por exemplo `User`.
- Trocar o rótulo genérico `ChatAuto AI` por `Lia - assistente virtual`.
- Manter `Você` para as mensagens do usuário.
- Usar cores distintas e acessíveis:
  - Usuário: cor principal da marca.
  - Lia: fundo neutro claro, borda discreta e texto escuro.
- Preservar horario/protocolo quando existir.

Cuidados:

- Não criar visual que sugira que a Lia é uma pessoa humana real.
- Não esconder o aviso de que a IA pode cometer erros.
- Evitar excesso visual dentro do chat; seguro auto pede confiança e clareza.
- Não usar foto de pessoa ou avatar hiper-realista.

Resultado esperado:

- O usuário entende imediatamente quem esta falando.
- A conversa fica mais organizada.
- A mudança é de baixo risco porque usa dados já existentes no frontend.

### 5.8 Camada 8: Histórico de conversas para o usuário

Escopo recomendado:

- Implementar em duas etapas, para não quebrar o fluxo atual.

#### Etapa 1: Histórico local no navegador

Alterar apenas `src/App.tsx`.

Como funcionaria:

- Salvar em `localStorage`:
  - `leadId`
  - `conversationId`
  - `protocol`
  - `messages`
  - data/hora da última atividade

- Ao abrir a pagina:
  - Recarregar a última conversa do navegador.
  - Mostrar opção discreta para iniciar nova conversa.
  - Manter a conversa atual se o usuário recarregar a pagina.

Vantagens:

- Não muda banco.
- Não muda API.
- Não exige login.
- Resolve o problema mais visível para o usuário: perder conversa ao atualizar a pagina.

Limitacoes:

- Histórico fica preso ao navegador/dispositivo.
- Se o usuário limpar dados do navegador, perde o histórico local.
- Não serve para consulta em outro computador/celular.

#### Etapa 2: Histórico vindo do backend

O banco já possui as tabelas necessárias:

- `conversations`
- `conversation_messages`

O que falta:

- Criar endpoint para buscar mensagens de uma conversa.
- Criar endpoint para listar conversas do usuário.
- Definir regra segura de acesso.

Ponto crítico:

- Não é recomendável criar `GET /api/conversations/:id/messages` público sem proteção.
- `conversationId` e numérico e previsível.
- As mensagens podem conter CPF, CNPJ, placa, e-mail, CEP e detalhes do seguro.

Opção segura e simples:

- Adicionar um `public_token` aleatório na tabela `conversations`.
- Retornar esse token ao frontend junto com `conversationId`.
- Salvar o token no `localStorage`.
- Buscar histórico usando `conversationId + public_token`.

Exemplo de contrato futuro:

```json
{
  "leadId": 12,
  "conversationId": 34,
  "conversationToken": "valor-aleatorio-longo",
  "protocol": "SA-20260521-ABC123"
}
```

Endpoints sugeridos:

- `GET /api/conversations/:conversationId/messages?token=...`
- `GET /api/conversations/recent?token=...` somente se houver uma estratégia clara para múltiplas conversas.

Recomendação prática:

- Começar pela Etapa 1 com `localStorage`.
- Depois, se o grupo quiser histórico recuperavel do banco, implementar token público.
- Não implementar listagem pública por CPF/e-mail neste momento.

Resultado esperado:

- Usuário não perde a conversa ao recarregar.
- O sistema aproveita a persistencia que já existe.
- Evita expor dados pessoais por endpoints inseguros.

### 5.9 Camada 9: Avisos LGPD no fluxo do usuário

Escopo recomendado:

- Ajustar microcopy em `python/agent_prompt_config.json`.
- Ajustar texto fixo no rodapé do chat em `src/App.tsx`.
- Não iniciar com juridiquês longo.
- Ser claro, curto e visível.

Texto de consentimento recomendado:

> Ao continuar, você autoriza o uso dos dados informados para registrar sua solicitação, realizar a triagem inicial e encaminhar seu atendimento de seguro auto. Suas informações devem ser usadas apenas para essa finalidade.

Texto curto para o rodapé:

> Assistente virtual. Não informe dados desnecessários. Usamos suas informações para triagem e contato sobre seguro auto.

Cuidados:

- CPF, CNPJ, e-mail, data de nascimento, CEP e placa são dados pessoais ou identificadores relevantes.
- Nem todo dado coletado aqui e "dado pessoal sensível" no sentido técnico da LGPD, mas todos devem ser tratados com segurança.
- Dados de demonstração devem ser fictícios ou anonimizados.
- A base `knowledge/` não deve receber dados reais de usuários.

Resultado esperado:

- Mais transparência para o usuário.
- Menor risco de uso indevido de dados.
- Melhor coerencia com uma entrega acadêmica responsável.

## 6. O que não recomendo implementar agora

1. Enriquecimento por CPF/CNPJ.
   - Alto risco LGPD.
   - Exige governança, consentimento, fonte confiável, segurança e auditoria.

2. Análise de sentimento por LLM em toda mensagem.
   - Aumenta custo e latência.
   - Para o MVP, regex e regras simples resolvem os casos de maior risco.

3. Persona muito teatral.
   - Seguro auto exige confiabilidade.
   - O tom deve ser humano, mas objetivo e profissional.

4. Memória de longo prazo.
   - Pode gerar riscos de privacidade.
   - O projeto ainda precisa corrigir segurança básica antes disso.

5. Reescrever o fluxo todo em framework de agentes.
   - Seria desnecessario neste momento.
   - O desafio pode ser melhorado com camadas incrementais.

## 7. Ordem recomendada de execução

### Fase 1: Baixo risco e alto retorno

1. Ajustar persona e limites em `agent_prompt_config.json`.
2. Ajustar o prompt base em `system_prompt_lia.txt`.
3. Implementar quebra de mensagens no frontend.
4. Implementar delay proporcional no frontend.
5. Reforcar identidade visual das falas da Lia e do usuário.
6. Salvar conversa atual no `localStorage`.
7. Atualizar consentimento e rodapé LGPD do chat.

Essa fase melhora a experiência sem mexer em banco, Docker ou roteamento.

### Fase 2: Redução de atrito

1. Adicionar quick replies para PF/PJ.
2. Adicionar quick replies para Sim/Não.
3. Adicionar quick replies para intenção inicial:
   - `Fazer cotacao`
   - `Tirar duvida`
   - `Sinistro ou assistencia`

Essa fase reduz erros de preenchimento e melhora o fluxo.

### Fase 3: Cuidado em casos sensíveis

1. Criar detecção simples de urgência/sentimento em `server.ts`.
2. Expandir handoff de sinistro.
3. Tratar assistência 24h de forma separada de cotação.

Essa fase evita que a Lia trate casos graves como se fossem lead comum.

### Fase 4: Conhecimento fundamentado

1. Conectar a base `knowledge/` ao fluxo de FAQ.
2. Responder perguntas comuns com conteúdo controlado.
3. Separar resposta orientativa de coleta de cotação.
4. Preparar a etapa RAG simples.

Essa fase aproxima o projeto do que o desafio pediu em IA aplicada a seguros.

## 8. Criterios de aceite

Uma melhoria de humanização deve ser aceita somente se:

- Não quebrar o fluxo atual de cotação.
- Não impedir roteamento PF/PJ.
- Não adicionar dependencia pesada sem necessidade.
- Não aumentar muito a latência.
- Não fingir que o bot é humano.
- Não prometer cobertura ou preço final.
- Reduzir repetição de respostas.
- Facilitar respostas fechadas com botões.
- Direcionar sinistro, roubo, furto, acidente ou urgência para humano.
- Diferenciar claramente fala da Lia e fala do usuário.
- Usar avatar próprio da Lia sem fingir atendimento humano.
- Preservar a conversa atual após recarregar a pagina.
- Não expor histórico sensível por endpoint público sem token ou autenticacao.
- Informar finalidade de coleta e uso dos dados pessoais.

## 9. Recomendação final

A melhor implantação é incremental:

1. Usar `python/agent_prompt_config.json` como fonte principal de persona e microcopy.
2. Usar `src/App.tsx` para humanização visual: blocos, delay e botões.
3. Usar `server.ts` apenas para regras de risco: urgência, sinistro, assistência e respostas opcionais com quick replies.
4. Salvar o histórico atual no navegador antes de criar endpoints novos.
5. Criar avatar próprio da Lia e deixar a interface transparente sobre IA e coleta de dados.
6. Integrar a base `knowledge/` depois, para que respostas sobre seguro auto sejam fundamentadas e não apenas "simpáticas".

Isso melhora bastante a experiência conversacional sem desmontar a estrutura criada pelo colega e sem transformar o projeto em outro sistema.
