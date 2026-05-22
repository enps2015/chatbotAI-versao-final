# Base RAG Inicial - Seguro Auto

Data da coleta inicial: 2026-05-20

Formato: blocos curtos, pensados para chunking e recuperação.

## Bloco 1 - Papel do chatbot

O chatbot deve atuar como assistente de pre-atendimento em seguro auto. Ele pode orientar o usuário, coletar dados para cotação, responder perguntas frequentes com base documental e direcionar casos para atendimento humano.

Limite: o chatbot não deve confirmar preço, aceitar risco, prometer cobertura, regular sinistro ou substituir seguradora/corretor.

## Bloco 2 - Aceitação da proposta

A seguradora pode analisar o risco da proposta de seguro auto e decidir pela aceitação ou recusa conforme seus critérios. A decisão final de aceitação pertence à seguradora, observadas as regras aplicáveis e a comunicação formal quando houver recusa.

Fonte: SUSEP - Seguro de Automóveis.

## Bloco 3 - Questionário de avaliação do risco

O questionário de avaliação do risco reune perguntas sobre segurado, condutor, veículo e uso. Ele ajuda a seguradora a avaliar o risco e calcular o prêmio. Podem ser considerados idade, uso do veículo, regiao, garagem, condutor jovem, dispositivos de segurança e uso profissional ou por aplicativo.

Fonte: SUSEP - Seguro de Automóveis.

## Bloco 4 - Informacoes corretas e mudança de perfil

Informacoes incorretas ou omitidas podem prejudicar o direito a indenização. Se o perfil de risco mudar durante a vigência, o segurado deve procurar corretor ou seguradora para avaliar necessidade de endosso.

Fonte: SUSEP - Seguro de Automóveis; SUSEP - Perguntas Frequentes.

## Bloco 5 - Coberturas adicionais

Seguradoras podem oferecer coberturas adicionais em seguro auto, como acessórios, blindagem, assistência 24 horas, danos morais e despesas extraordinárias. A existência e o alcance dessas coberturas dependem da proposta, da apólice e das condições contratuais.

Fonte: SUSEP - Seguro de Automóveis.

## Bloco 6 - Assistência 24 horas

Assistência 24 horas pode indenizar ou prestar suporte em eventos como acidente, pane mecânica ou pane eletrica, conforme contratado. O chatbot deve informar que limites e serviços dependem da seguradora e do plano.

Fonte: SUSEP - Seguro de Automóveis.

## Bloco 7 - Franquia

Franquia é a parte do prejuízo que fica sob responsabilidade do segurado em determinados sinistros. Se o prejuízo não superar a franquia, pode não haver indenização pela seguradora. A regra deve estar prevista na apólice.

Fonte: SUSEP - Perguntas Frequentes.

## Bloco 8 - Bônus

Bônus e critério usado por seguradoras para reduzir o prêmio, geralmente associado ao histórico sem sinistros. A SUSEP não define regra única de bônus; quando houver, deve constar na proposta e na apólice.

Fonte: SUSEP - Perguntas Frequentes.

## Bloco 9 - Sinistro

Em caso de sinistro, o segurado deve comunicar a seguradora, seguir os procedimentos previstos nas condições contratuais e apresentar documentos. O chatbot deve encaminhar sinistro para atendimento humano, evitando interpretar cobertura ou indenização.

Fonte: SUSEP - Seguro de Automóveis.

## Bloco 10 - Prazo de liquidacao de sinistro

A liquidacao de sinistro deve observar prazo regulatorio contado da entrega dos documentos básicos. Quando a seguradora solicita documentos complementares de forma justificada, a contagem pode ser suspensa até a entrega.

Fonte: SUSEP - Seguro de Automóveis; SUSEP - Perguntas Frequentes.

## Bloco 11 - Indenização integral

Indenização integral ocorre quando o prejuízo atinge ou ultrapassa o percentual previsto nas condições contratuais em relação ao valor contratado. Roubo ou furto sem recuperação também pode gerar indenização integral, conforme a apólice.

Fonte: SUSEP - Seguro de Automóveis; SUSEP - Perguntas Frequentes.

## Bloco 12 - Seguro vinculado ao veículo ou ao condutor

Seguro auto pode ser vinculado ao veículo ou ao condutor, dependendo do produto. O seguro tradicional e geralmente vinculado ao veículo, mas existem produtos que podem acompanhar o condutor em diferentes veículos.

Fonte: SUSEP - Seguro de Automóveis.

## Bloco 13 - Cobertura parcial

Pode existir cobertura parcial, em que a seguradora assume apenas parte do risco e o segurado assume o restante. Essa opção pode reduzir prêmio, mas também reduz indenização em determinados cenários.

Fonte: SUSEP - Seguro de Automóveis.

## Bloco 14 - Peças e oficinas

Seguradoras podem prever uso de peças novas, usadas, originais ou não originais, desde que isso esteja claro no contrato e observe regras técnicas. A escolha de oficina também depende do produto, podendo haver livre escolha ou rede referenciada.

Fonte: SUSEP - Seguro de Automóveis.

## Bloco 15 - Dados públicos e estatisticos

A SUSEP publica bases anonimizadas de seguro auto, como R_AUTO e S_AUTO, com dados enviados pelo mercado supervisionado. Essas bases são úteis para análise estatística e relatório, mas não devem ser usadas para prometer preço individual.

Fonte: SUSEP - Bases Anonimizadas de Seguro de Automóvel.

## Bloco 16 - Linguagem real do cliente

Clientes frequentemente descrevem problemas de seguro auto em linguagem informal. Em vez de dizer "responsabilidade civil facultativa", podem dizer "bati no carro do cara e ele esta me cobrando". O chatbot deve reconhecer a intenção e traduzir para linguagem simples: cobertura para danos causados a terceiros.

Fonte: FAQ da integrante do grupo.

## Bloco 17 - Principais dúvidas práticas no atendimento

As dúvidas mais frequentes no atendimento de seguros envolvem: o que esta coberto, valor da franquia, acionamento em emergência, parcelamento, cobertura para terceiros, atraso de parcela, calculo do valor, exclusões e cancelamento.

Fonte: FAQ da integrante do grupo.

## Bloco 18 - Auto: prioridades de atendimento

No seguro auto, os temas de maior urgência para o cliente costumam ser franquia, guincho, carro reserva, vidros, cobertura para terceiros e sinistro. O chatbot deve priorizar resposta clara e encaminhamento rápido quando houver acidente, roubo, furto, vítimas ou negativa de indenização.

Fonte: FAQ da integrante do grupo.

## Bloco 19 - Assistência não é necessariamente sinistro

Troca de pneu, guincho, chaveiro, pane seca e outros serviços podem ser assistência 24 horas, quando contratados, e não sinistro. O chatbot deve diferenciar pedido de assistência de aviso de sinistro, sem negar atendimento.

Fonte: FAQ da integrante do grupo; Condições Gerais Itaú Assistência 24 Horas.

## Bloco 20 - Dados essenciais para sinistro

Em abertura ou triagem de sinistro, os dados essenciais citados pela experiência operacional são: CPF do segurado, numero da apólice ou placa no caso de seguro auto, data e hora do evento e breve relato. Antes de orientar cobertura, deve-se validar vigência, pagamento e encaminhar para a seguradora ou atendimento humano.

Fonte: FAQ da integrante do grupo.

## Bloco 21 - Negativa de indenização exige cuidado

O chatbot não deve afirmar "seu sinistro foi negado" sem motivo formal e validação humana. Negativa de indenização e tema sensível e deve ser encaminhada para atendimento humano, com postura neutra e acolhedora.

Fonte: FAQ da integrante do grupo.

## Bloco 22 - RCF-V e terceiros

Responsabilidade Civil Facultativa de Veículos, ou RCF-V, é a cobertura relacionada a danos causados a terceiros, respeitando limites e condições contratadas. Pode envolver danos materiais e corporais, conforme a apólice.

Fonte: Tipos de Coberturas - Automóveis; Apostila Seguros de Automóveis 2025.

## Bloco 23 - Coberturas comuns no seguro auto

No mercado, coberturas comuns incluem compreensiva, roubo/furto/incendio, responsabilidade civil facultativa, acidentes pessoais de passageiros, vidros, carro reserva, assistência 24 horas e despesas extraordinárias. A disponibilidade depende da seguradora e do produto.

Fonte: Tipos de Coberturas - Automóveis; condições gerais de seguradoras no workspace.

## Bloco 24 - Condições gerais de seguradoras

O workspace possui condições gerais de várias seguradoras, incluindo Porto, Allianz, Tokio Marine, Santander, Pier, Suhai, Itaú, Caixa, Bradesco, Azul, SulAmérica, Mitsui e AXA Frotas. Esses documentos devem ser usados com metadados de seguradora/produto e não como regra geral única.

Fonte: `documentacao_base_seguros/`.

## Bloco 25 - Definição Oficial de RCF-V (Cartilha SUSEP / Apostila 2025)

A cobertura de Responsabilidade Civil Facultativa de Veículos (RCF-V) garante o reembolso de indenizações que o segurado seja obrigado a pagar por danos materiais ou corporais causados a terceiros, em decorrência de acidente com o veículo segurado, conforme as disposições do contrato.

Fonte: Apostila_Seguros-Automoveis_2025.pdf e cartilha_susep2e.pdf.

## Bloco 26 - Definição Oficial de Franquia (Cartilha SUSEP / Apostila 2025)

Franquia é o valor ou percentual, expresso na apólice, que representa a participação obrigatória do segurado nos prejuízos em caso de sinistro de perda parcial. A seguradora só indenizará o valor dos prejuízos que ultrapassar a franquia. Não há cobrança de franquia em casos de Indenização Integral, salvo previsão contratual específica.

Fonte: Apostila_Seguros-Automoveis_2025.pdf e cartilha_susep2e.pdf.
