# Fontes Locais Coletadas Pelo Grupo

Data da análise: 2026-05-20

## Objetivo

Registrar e classificar as bases locais existentes no workspace para uso futuro em FAQ estruturada ou RAG.

Pastas/arquivos analisados:

- `documentacao_base_seguros/`
- `docs/faqs-coletadas-integrante-grupo.pdf`

## Observação importante

As fontes locais têm naturezas diferentes. Nem tudo deve ser usado da mesma forma pelo chatbot.

- Fontes oficiais/regulatórias e educacionais podem apoiar respostas gerais.
- Condições gerais de seguradoras devem ser usadas como exemplos de mercado ou para comparação, não como regra universal.
- A FAQ da integrante do grupo deve ser usada como experiência prática e linguagem real do cliente, não como fonte normativa.

## Classificação das fontes

### 1. Fontes de maior prioridade para conhecimento geral

| Arquivo | Tipo | Uso recomendado |
|---|---|---|
| `Apostila_Seguros-Automoveis_2025.pdf` | Material didático especializado | Base principal para conceitos de seguro auto, RCF-V, APP, franquia, prêmio, sinistro, regulação, perfil e coberturas. |
| `cartilha_susep2e.pdf` | Guia SUSEP | Base para glossário, direitos do segurado, proposta, apólice, prêmio, sinistro e franquia. |
| `tipos_de_cobertura_auto.pdf` | Material explicativo sobre coberturas | Base para FAQ de coberturas, terceiros, APP, indenização integral, carro reserva, vidros, assistência e exclusões. |
| `Manual_de_criterio_de_bonus_nov_2025_53bc41517d.pdf` | Manual de bônus | Base para FAQ sobre bônus, renovação e critérios de experiência. |
| `Cartilha-Nova-Lei-do-Seguros.pdf` | FAQ sobre Lei nº 15.040/2024 | Base para alertas gerais sobre nova lei de seguros. |
| `NOVA LEI DO SEGURO O QUE O CONSUMIDOR PRECISA SABER.pdf` | Material sobre nova lei | Pode ser usado se o OCR/texto for melhorado; extração atual retornou quase vazia. |
| `SeguroPopularAutomovel.pdf` | Condições gerais seguro popular | Apoio para modalidade de seguro popular, aceitação, glossário e limites. |
| `Relatorio FGV - Mercado de automoveis.pdf` | Relatório de mercado | Apoio para relatório do experimento e contexto de mercado, não para resposta individual de cobertura. |

### 2. Condições gerais e manuais de seguradoras

Estes documentos são úteis para RAG, mas precisam ser identificados como fonte específica da seguradora/produto.

| Arquivo | Seguradora/produto identificado | Uso recomendado |
|---|---|---|
| `1713292625_cc-santander-auto-automovel-20190625.pdf` | Santander Auto | Exemplo de condições gerais, aceitação, recusa, vigência, sinistro. |
| `20260213_seguro_auto_pier.pdf` | Pier Seguro Auto | Exemplo de produto digital/condições contratuais. |
| `CG140-Porto-Seguro-3402.pdf` | Porto Seguro Auto | Exemplo de manual do segurado e condições gerais. |
| `seguro auto porto.pdf` | Porto Seguro Auto | Exemplo de condições gerais e serviços. |
| `veiculo1505_azul_seguro_auto.pdf` | Azul Seguro Auto | Exemplo de manual do segurado e procedimentos de sinistro. |
| `CG_05052024_tokio_marine_seguradora.pdf` | Tokio Marine Auto | Exemplo de condições gerais. |
| `CG_07.06.2025.pdf` | Tokio Marine Auto | Versão mais recente disponível no workspace. |
| `Condicoes-Gerais-do-Seguro-Allianz Auto_01.2025.pdf` | Allianz Auto | Exemplo de condições gerais. |
| `Condicoes-Gerais-do-Seguro-Allianz-Auto_052025.pdf` | Allianz Auto | Versão 05/2025. |
| `Condicoes_Gerais_Allianz_Auto_1225.pdf` | Allianz Auto | Versão 12/2025. |
| `CG_AXA_FROTAS_15414_636542_2022_44_20251210_dad85cce29.pdf` | AXA Frotas | Fonte específica para frota/PJ. |
| `CG_Automovel_V24_tcm909-237095.pdf` | Seguro de Automóvel versão 24 | Condições gerais com processo SUSEP; seguradora não identificada pelo nome do arquivo. |
| `Condições Gerais_versão 100223_manual_do_segurado.pdf` | Alfa Seguro Automóvel | Exemplo de manual do segurado. |
| `ManualSuhai.pdf` | Suhai | Exemplo de coberturas com roubo/furto, RCF e operação. |
| `SAS_CondGerais_Abril_sulamerica_seguros.pdf` | SulAmérica Auto | Exemplo de manual do segurado. |
| `condicoes-gerais-itau-assistencia-24-horas-cg09.pdf` | Itaú Assistência 24h | Fonte específica sobre assistência. |
| `condicoes-gerais-itau-seguro-auto-compacto-cg050.pdf` | Itaú Auto Compacto | Exemplo de produto compacto. |
| `condicoes-gerais-itau-seguro-auto-compacto-cg49.pdf` | Itaú Auto Compacto | Exemplo de produto compacto. |
| `condicoes-gerais-novo-seguro-auto_caixa_seguradora.pdf` | Caixa Seguradora Auto | Exemplo de condições gerais. |
| `manual do segurado.pdf` | Bradesco Seguro Auto | Exemplo de manual do segurado, sinistro e glossário. |
| `manual_automovel.pdf` | DaGama Corretora | Material de corretora com FAQ; usar como apoio, não como fonte normativa. |
| `ms-auto-condicoes-gerais.pdf` | Mitsui Sumitomo Auto/RCF-V/APP | Exemplo de condições gerais. |

### 3. FAQ da integrante do grupo

Arquivo:

- `docs/faqs-coletadas-integrante-grupo.pdf`

Classificação:

- fonte de experiência prática;
- guia de linguagem do cliente;
- insumo para intents;
- guia de priorização de automação.

Principais aprendizados:

- Clientes perguntam primeiro sobre cobertura, franquia, emergência, parcelamento, terceiros, atraso de parcela, cálculo de valor, exclusões e cancelamento.
- Clientes novos perguntam mais sobre contrato, confiança, cláusulas e detalhes técnicos.
- Clientes antigos perguntam mais em renovação ou uso do serviço.
- Em seguro auto, os temas mais fortes são franquia, guincho, carro reserva, vidros e cobertura para terceiros.
- O cliente fala em linguagem comum, por exemplo: "bati no carro do cara e ele está me cobrando", não "responsabilidade civil facultativa".
- Sinistro exige cuidado, validação de vigência, aviso à seguradora, protocolo e coleta de dados essenciais.
- O chatbot não deve confirmar cobertura nem dizer que o seguro paga sem validação.
- A própria integrante recomenda automatizar triagem e qualificação de leads como primeiro passo.

Uso recomendado:

- melhorar intents;
- criar sinônimos e frases reais;
- orientar tom de voz;
- definir gatilhos de handoff humano;
- priorizar perguntas de FAQ.

## Estratégia de uso no chatbot

### Camada 1 - Resposta geral com fonte forte

Usar:

- SUSEP/Gov.br;
- `cartilha_susep2e.pdf`;
- `Apostila_Seguros-Automoveis_2025.pdf`;
- `tipos_de_cobertura_auto.pdf`;
- `Manual_de_criterio_de_bonus_nov_2025_53bc41517d.pdf`.

Essas fontes servem para respostas gerais, glossário e educação do segurado.

### Camada 2 - Resposta específica por seguradora/produto

Usar condições gerais somente quando o usuário perguntar explicitamente sobre seguradora/produto específico ou quando a resposta deixar claro:

> Em condições gerais de algumas seguradoras, esse tema pode aparecer desta forma, mas a confirmação depende da apólice contratada.

### Camada 3 - Experiência prática

Usar a FAQ da integrante para:

- classificar intenção;
- entender linguagem informal;
- priorizar triagem;
- decidir quando encaminhar para humano.

Não usar como autoridade jurídica ou contratual.

## Riscos de uso incorreto

- Tratar regra de uma seguradora como regra geral do mercado.
- Responder com certeza sobre cobertura sem saber a apólice.
- Usar documento antigo sem avisar que pode haver versão mais recente.
- Misturar assistência 24h com sinistro.
- Confirmar indenização ou negativa de sinistro sem análise humana.

## Recomendação prática

Para a próxima versão do chatbot, recomenda-se:

1. Integrar primeiro `knowledge/intencoes-faq-seguro-auto.jsonl`.
2. Usar `knowledge/base-rag-seguro-auto.md` como base de resposta.
3. Adicionar os aprendizados da FAQ da integrante como variações de perguntas.
4. Criar uma etapa futura de ingestão dos PDFs locais com metadados de fonte.
5. Dar prioridade às fontes gerais e oficiais antes de documentos de seguradoras específicas.
