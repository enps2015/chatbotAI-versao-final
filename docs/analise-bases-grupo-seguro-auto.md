# Análise das Bases Locais do Grupo - Seguro Auto

Data: 2026-05-20

## Objetivo

Analisar as bases coletadas por integrantes do grupo e verificar como elas podem fortalecer a base documental do chatbot sem alterar a estrutura atual do projeto.

## Bases encontradas

### `documentacao_base_seguros/`

Contém 31 PDFs, cerca de 69 MB.

Tipos encontrados:

- condições gerais de seguradoras;
- manuais do segurado;
- cartilhas e guias;
- apostila didática de seguros auto;
- relatório de mercado;
- manual de bônus;
- materiais sobre nova lei de seguros.

### `docs/faqs-coletadas-integrante-grupo.pdf`

Contém 4 páginas com perguntas é observações de uma integrante que atua com seguros.

Apesar de não ser fonte normativa, é uma fonte importante para:

- linguagem real do cliente;
- priorização das dúvidas;
- identificação de riscos;
- desenho do fluxo conversacional.

## Fontes mais úteis para a próxima etapa

### Alta prioridade

1. `Apostila_Seguros-Automoveis_2025.pdf`
   - Melhor fonte local para conhecimento estruturado de seguro auto.
   - Abrange coberturas, RCF-V, APP, sinistro, prêmio, franquia, bônus, perfil, vistoria e regulação.

2. `cartilha_susep2e.pdf`
   - Boa para glossário e direitos/deveres do segurado.
   - Fonte institucional forte.

3. `tipos_de_cobertura_auto.pdf`
   - Muito útil para explicar cobertura compreensiva, roubo/furto/incêndio, RCF-V, APP, vidros, carro reserva, assistência e exclusões.

4. `Manual_de_criterio_de_bonus_nov_2025_53bc41517d.pdf`
   - Útil para FAQ de bônus e renovação.

5. `docs/faqs-coletadas-integrante-grupo.pdf`
   - Útil para intents, linguagem e casos de cuidado.

### Média prioridade

1. Condições gerais de seguradoras.
   - Úteis para exemplos e comparação.
   - Devem ser usadas com metadados de seguradora/produto.

2. `Relatorio FGV - Mercado de automoveis.pdf`
   - Útil para relatório final e contexto de mercado.
   - Não deve ser usado para prometer preço ou cobertura.

3. `Cartilha-Nova-Lei-do-Seguros.pdf`
   - Útil para contexto jurídico geral.
   - Requer cuidado para não virar aconselhamento jurídico.

### Baixa prioridade ou exige tratamento

1. `NOVA LEI DO SEGURO O QUE O CONSUMIDOR PRECISA SABER.pdf`
   - Extração textual retornou praticamente vazia.
   - Pode exigir OCR antes de uso.

2. Condições gerais antigas.
   - Podem estar desatualizadas.
   - Usar apenas como referência histórica ou com aviso de versão.

## Como essas bases corrigem uma lacuna do projeto

O projeto atual é um robô de triagem e roteamento. O Desafio 2, porém, pede chatbot/assistente de atendimento baseado em IA, com respostas a FAQs e uso de bases documentais/RAG.

As bases locais permitem evoluir o projeto sem reescrever tudo:

- FAQ da integrante melhora a linguagem é o foco prático.
- Apostila e cartilhas dão base conceitual.
- Condições gerais dão exemplos reais de mercado.
- Tipos de cobertura ajuda a responder perguntas comuns.
- Manual de bônus cobre tema recorrente de renovação.

## Ajustes realizados nesta etapa

Foram criados ou atualizados:

- `knowledge/fontes-locais-grupo.md`
- `knowledge/README.md`
- `knowledge/fontes-publicas.md`
- `knowledge/faq-seguro-auto.md`
- `knowledge/base-rag-seguro-auto.md`
- `knowledge/intencoes-faq-seguro-auto.jsonl`
- `docs/coleta-base-conhecimento-faq-seguro-auto.md`

## Expansão feita na base

A base passou a contemplar também:

- cobertura para terceiros;
- RCF-V;
- linguagem informal do cliente;
- atraso de parcela;
- cancelamento;
- cálculo de valor;
- exclusões;
- assistência versus sinistro;
- guincho;
- vidros;
- carro reserva;
- segunda via de apólice;
- negativa de indenização como caso sensível.

## Recomendação técnica

Próxima etapa recomendada:

1. Implementar carregamento de `knowledge/intencoes-faq-seguro-auto.jsonl`.
2. Substituir ou complementar o array fixo `FAQS` do `server.ts`.
3. Incluir fonte na resposta.
4. Manter handoff humano em sinistro, negativa de indenização e cobertura duvidosa.
5. Só depois implementar RAG com chunking dos documentos maiores.

## Cuidados obrigatórios

1. Não usar condição geral de uma seguradora como regra universal.
2. Não confirmar cobertura sem apólice.
3. Não confirmar indenização.
4. Não afirmar negativa de sinistro sem análise humana.
5. Não expor dados pessoais em respostas.
6. Não usar documentos antigos sem registrar versão.
7. Não usar conteúdo da FAQ da integrante como fonte jurídica.

## Conclusão

As bases locais coletadas pelo grupo são relevantes e deveriam ser aproveitadas. Elas não exigem refazer a arquitetura atual. O melhor uso imediato é enriquecer a FAQ estruturada e preparar uma futura camada de RAG.

Com essas bases, o projeto pode evoluir de um robô de triagem para um assistente de atendimento com conhecimento rastreável em seguro auto.
