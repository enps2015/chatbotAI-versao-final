# Avatar, Histórico e LGPD no Chatbot

Data: 2026-05-21

## 1. Objetivo

Este documento complementa a estratégia de humanização do chatbot SeguroAuto AI com tres requisitos importantes:

- Criar uma identidade visual para a assistente virtual Lia.
- Deixar claro para o usuário quem esta falando no chat.
- Tratar histórico e dados pessoais conforme princípios da LGPD.

A recomendação aqui continua sendo incremental. Não devemos desmontar o projeto atual, mas precisamos evitar que uma melhoria de experiência crie risco de privacidade.

## 2. Avatar da assistente virtual

### 2.1 Recomendação de design

A Lia deve ter um avatar próprio, mas sem parecer uma pessoa real. O ideal é uma identidade visual de assistente virtual confiável:

- Icone ou ilustracao semi-abstrata.
- Elementos de seguro auto: escudo, carro, check, linha de proteção.
- Aparência profissional, simples e limpa.
- Sem rosto humano realista.
- Sem foto de pessoa.
- Sem inducao de que há uma atendente humana digitando.

Motivo:

- O usuário precisa entender que esta conversando com IA.
- A interface deve transmitir segurança, mas sem enganar.
- Seguro auto envolve dados pessoais e decisões financeiras; clareza é mais importante que teatralidade.

### 2.2 Onde usar o avatar

Uso recomendado:

- Cabecalho do chat.
- Todas as mensagens da assistente.
- Indicador de digitacao.
- Tela inicial da conversa.

Não usar:

- Como se fosse foto de funcionaria.
- Em e-mails como se representasse uma pessoa responsável pelo atendimento.
- Em mensagens de sinistro grave substituindo contato humano.

### 2.3 Implementação no frontend

Escopo seguro:

- Adicionar arquivo de imagem em `src/assets/images/`.
- Importar em `src/App.tsx`.
- Exibir avatar apenas para mensagens com `role === 'assistant'`.
- Manter icone `User` ou inicial simples para mensagens do usuário.

Risco baixo:

- Não altera backend.
- Não altera banco.
- Não altera Docker.
- Não afeta roteamento.

Critérios:

- O rótulo deve dizer `Lia - assistente virtual`.
- O usuário deve continuar aparecendo como `Você`.
- A primeira tela deve deixar claro que a Lia é assistente virtual.

## 3. Clareza sobre quem fala

O frontend já possui a estrutura mínima necessária:

```ts
interface Message {
  role: 'user' | 'assistant';
  content: string;
}
```

Melhoria recomendada:

- Mensagens da Lia:
  - Alinhadas a esquerda.
  - Avatar da Lia.
  - Fundo neutro.
  - Rótulo `Lia - assistente virtual`.

- Mensagens do usuário:
  - Alinhadas a direita.
  - Icone de usuário.
  - Fundo da cor principal da marca.
  - Rótulo `Você`.

- Mensagens de handoff:
  - Visual ligeiramente diferenciado.
  - Texto claro: `Vou direcionar para atendimento humano`.

Isso melhora a experiência e reduz ambiguidade sem mudar a lógica do chat.

## 4. Dados pessoais tratados pelo chatbot

O projeto atual coleta ou pode coletar:

- Nome completo.
- E-mail.
- CPF ou CNPJ.
- Data de nascimento.
- Estado civil.
- CEP.
- Modelo e ano do veículo.
- Placa.
- Uso do veículo.
- Informação de condutor jovem.
- Dados de renovacao.
- Preferencias de cobertura.
- Histórico completo da conversa.

Pela LGPD, muitos desses dados são dados pessoais quando identificam ou podem identificar uma pessoa natural. CPF, e-mail, placa, data de nascimento e CEP merecem tratamento cuidadoso.

Observação importante:

- Nem todo dado pessoal de seguro auto e "dado pessoal sensível" no sentido técnico da LGPD.
- Dados sensíveis, na definição legal, incluem informações como origem racial ou étnica, conviccao religiosa, opiniao política, saúde, vida sexual, dado genético ou biométrico vinculado a pessoa natural.
- Mesmo assim, os dados do projeto devem ser tratados como informação de alto cuidado operacional, porque incluem identificadores diretos e informações patrimoniais.

## 5. Principios LGPD aplicados ao chatbot

### 5.1 Finalidade

Informar ao usuário por que os dados estão sendo coletados.

Texto sugerido:

> Usaremos seus dados para registrar sua solicitação, realizar a triagem inicial e encaminhar seu atendimento para cotação de seguro auto.

### 5.2 Necessidade e minimização

Coletar apenas dados necessários para a etapa atual.

Aplicacao no projeto:

- Uma pergunta por vez.
- Não pedir documentos antes de haver real necessidade.
- Evitar coletar informações que não serão usadas no roteamento ou cotação inicial.

### 5.3 Transparência

Informar que:

- A Lia é uma assistente virtual.
- As respostas são orientativas.
- A cotação final depende da seguradora.
- Dados serão usados para contato e triagem.
- Pode haver encaminhamento para humano.

### 5.4 Segurança

Medidas técnicas recomendadas:

- Não expor histórico por `conversationId` público.
- Usar token aleatório para recuperar conversa.
- Mascarar CPF, CNPJ e placa quando exibidos fora do contexto da conversa ativa.
- Proteger endpoints administrativos.
- Evitar salvar segredos em imagem Docker.
- Configurar CORS restrito.
- Adicionar rate limit.

### 5.5 Retenção

Definir por quanto tempo conversas e leads serão mantidos.

Para o desafio acadêmico, sugestao simples:

- Ambiente de demonstração: manter dados por curto período ou limpar manualmente ao final dos testes.
- Relatórios e apresentações: usar dados anonimizados ou fictícios.
- Base de conhecimento/RAG: nunca usar dados reais de usuários.

### 5.6 Direitos do titular

O usuário deve saber que pode solicitar:

- Confirmação de tratamento.
- Acesso aos dados.
- Correção de dados incompletos ou desatualizados.
- Anonimização, bloqueio ou eliminação de dados desnecessários.
- Eliminação dos dados tratados com consentimento, quando aplicável.

Para o MVP, basta deixar isso claro em texto informativo e evitar prometer automações que ainda não existem.

## 6. Consentimento e aviso no chat

O sistema já possui um texto de consentimento em `python/agent_prompt_config.json`:

```json
"consent_text": "Combinado? Ao seguir, você autoriza o uso dos dados para contato e cotação."
```

Esse texto é um bom começo, mas deve ficar mais claro.

Texto recomendado:

> Ao continuar, você autoriza o uso dos dados informados para registrar sua solicitação, realizar a triagem inicial e encaminhar seu atendimento de seguro auto. Suas informações devem ser usadas apenas para essa finalidade.

Versao curta para rodapé do chat:

> Assistente virtual. Não informe dados desnecessários. Usamos suas informações para triagem e contato sobre seguro auto.

## 7. Histórico de conversas com privacidade

### 7.1 O que já existe

O backend já salva:

- Conversa em `conversations`.
- Mensagens em `conversation_messages`.

Portanto, o histórico é tecnicamente possível.

### 7.2 Risco principal

Não devemos criar endpoint público para buscar histórico apenas por ID numérico.

Exemplo perigoso:

```http
GET /api/conversations/10/messages
```

Motivo:

- `conversationId` e previsível.
- Outro usuário poderia testar IDs diferentes.
- As mensagens podem conter CPF, placa, CEP, e-mail e informações de seguro.

### 7.3 Implementação recomendada em duas fases

#### Fase 1: Histórico local no navegador

Salvar no `localStorage`:

- `messages`
- `leadId`
- `conversationId`
- `protocol`
- `updatedAt`

Vantagens:

- Não muda banco.
- Não abre endpoint sensível.
- Evita perda de conversa ao atualizar a pagina.

Limite:

- Funciona apenas no mesmo navegador.

#### Fase 2: Histórico recuperavel do banco

Adicionar coluna ou tabela de token:

- `conversation_public_token`
- valor aleatório longo.
- criado junto com a conversa.
- retornado ao frontend.

Buscar mensagens somente com:

```http
GET /api/conversations/:conversationId/messages?token=...
```

Regras:

- Token obrigatório.
- Não retornar conversas sem token valido.
- Mascarar dados em listagens resumidas.
- Retornar conteúdo completo somente na conversa ativa do próprio usuário.

## 8. Anonimização e mascaramento

### 8.1 Na interface

Quando for exibir resumos, histórico lateral ou lista de conversas:

- CPF: `***.***.***-12`
- CNPJ: `**.***.***/0001-**`
- Placa: `ABC-****`
- E-mail: `m***@dominio.com`

Na conversa ativa, o dado pode aparecer como o usuário digitou, mas isso aumenta a importancia de acesso seguro.

### 8.2 Em relatórios e apresentações

Usar apenas:

- Dados fictícios.
- Dados anonimizados.
- Protocolos sem vínculo real.

Não usar:

- CPF real.
- Placa real.
- Nome completo real.
- E-mail real.
- Conversa real com dados identificaveis.

### 8.3 Na base de conhecimento

A base `knowledge/` deve conter:

- Documentos públicos.
- FAQs técnicas.
- Conteúdo oficial.
- Exemplos fictícios.

Não deve conter:

- Dados de usuários reais.
- Leads reais.
- Conversas reais sem anonimização.

## 9. Checklist antes de implementar histórico completo

Antes de buscar histórico do banco no frontend, validar:

- Existe token aleatório por conversa.
- O endpoint exige token.
- O frontend salva token com cuidado.
- Não há listagem pública de conversas.
- Dados pessoais são mascarados em resumos.
- O texto de consentimento esta visível.
- A política de uso dos dados esta explícita no chat.
- Endpoints administrativos estão protegidos ou, no mínimo, documentados como risco.
- Dados usados em demo são fictícios.

## 10. Recomendação final

Ordem recomendada:

1. Criar avatar visual da Lia.
2. Atualizar frontend para diferenciar claramente Lia e usuário.
3. Atualizar texto de consentimento e rodapé do chat.
4. Implementar histórico local via `localStorage`.
5. Depois implementar histórico do banco com token público aleatório.
6. Mascarar dados em listas e resumos.
7. Usar apenas dados fictícios ou anonimizados em demonstrações.

Essa sequência melhora a experiência do usuário sem comprometer privacidade e sem reestruturar o projeto.

## 11. Fontes oficiais consultadas

- ANPD - Guia orientativo para definições dos agentes de tratamento de dados pessoais e do encarregado: https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-para-definicoes-dos-agentes-de-tratamento-de-dados-pessoais-e-do-encarregado
- Governo Federal - Tipos de dados abordados pela LGPD: https://www.gov.br/funasa/pt-br/acesso-a-informacao/lei-geral-de-protecao-de-dados-pessoais-lgpd/tipos-de-dados-abordados-pela-lgpd
- Ministério da Ciência, Tecnologia e Inovação - LGPD, privacidade e proteção de dados pessoais: https://www.gov.br/mcti/pt-br/acesso-a-informacao/lei-geral-de-protecao-de-dados-pessoais-lgpd
- Ministério da Saúde - Direitos do titular, incluindo anonimização, bloqueio ou eliminação: https://www.gov.br/saude/pt-br/acesso-a-informacao/lgpd
