# Integracao Front-end x Backend do Agente de Seguros

Este repositorio possui front-end estatico em HTML + JS. O backend foi criado em `backend/` com API HTTP.

## 1) Subir backend

1. Entre em `backend/`
2. Instale dependencias
3. Inicie o servidor

Exemplo (PowerShell):

```powershell
cd c:\mauricio\projetos_ia\ml-education\backend
npm install
npm run dev
```

## 2) Incluir cliente JS no front

Nas paginas da raiz:

```html
<script src="shared/insurance-agent-client.js"></script>
```

Nas paginas em subpastas (ex: `supervised/`):

```html
<script src="../shared/insurance-agent-client.js"></script>
```

## 3) Exemplo de uso

```html
<script>
  const api = InsuranceAgentApi.createClient("http://localhost:4000/api");

  async function conversar() {
    const resposta = await api.chat({
      sessionId: "sessao-demo-1",
      message: "Tenho um SUV 2022 e uso diário. Qual cobertura você recomenda?",
      customerProfile: {
        age: 33,
        city: "Sao Paulo",
        vehicleType: "suv",
        vehicleYear: 2022,
        hasGarage: true,
        claimsLast5Years: 0,
      },
    });
    console.log(resposta.reply);
  }

  async function cotar() {
    const quote = await api.quote({
      age: 33,
      city: "Sao Paulo",
      vehicleType: "suv",
      vehicleYear: 2022,
      vehicleValue: 135000,
      hasGarage: true,
      claimsLast5Years: 0,
      coveragePlan: "complete",
    });
    console.log(quote);
  }
</script>
```

## 4) Endpoints disponiveis

- `GET /api/health`
- `POST /api/agent/chat`
- `POST /api/agent/quote`

## 5) Observacoes

- Sem Ollama ativo, o backend opera em modo fallback local (sem LLM).
- Com Ollama ativo, utiliza LangChain + modelo local para respostas contextuais.
- Sempre tratar as respostas como estimativa informativa; cotacao final depende da seguradora.
