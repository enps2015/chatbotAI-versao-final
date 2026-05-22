const API_BASE = process.env.API_BASE ?? "http://localhost:3000";

const cases = [
  {
    name: "RAG - Dúvida sobre questionário de risco",
    message: "Por que fazem tantas perguntas sobre garagem e idade do carro?",
    required: [/avaliar o risco|calcular o pr[eê]mio|aceitar ou n[aã]o/i],
    forbidden: [/n[aã]o entendi/i, /fallback/i],
  },
  {
    name: "RAG - Dúvida sobre indenização integral",
    message: "Se eu tiver perda total, recebo o carro novo?",
    required: [/indeniza[cç][aã]o integral|ap[oó]lice/i],
    forbidden: [/sim, recebe/i, /garantido/i],
  },
  {
    name: "RAG - Dúvida sobre cancelamento",
    message: "Posso cancelar meu seguro quando quiser e pegar o dinheiro de volta?",
    required: [/regras da ap[oó]lice|c[aá]lculo proporcional/i],
    forbidden: [/sim, recebe tudo/i, /quando quiser/i],
  }
];

async function postChat(message) {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  return response.json();
}

let failures = 0;

for (const testCase of cases) {
  try {
    const payload = await postChat(testCase.message);
    const text = String(payload.text ?? "");

    const missingRequired = testCase.required.filter((pattern) => !pattern.test(text));
    const foundForbidden = testCase.forbidden.filter((pattern) => pattern.test(text));

    if (missingRequired.length || foundForbidden.length) {
      failures += 1;
      console.error(`FAIL: ${testCase.name}`);
      if (missingRequired.length) {
        console.error(`  padrões obrigatórios ausentes: ${missingRequired.map(String).join(", ")}`);
      }
      if (foundForbidden.length) {
        console.error(`  padrões proibidos encontrados: ${foundForbidden.map(String).join(", ")}`);
      }
      console.error(`  resposta: ${text.replace(/\s+/g, " ").slice(0, 500)}`);
      continue;
    }

    console.log(`PASS: ${testCase.name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL: ${testCase.name} - Request Error: ${error.message}`);
  }
}

if (failures) {
  process.exitCode = 1;
} else {
  console.log("ALL PASS: Testes de RAG concluídos com sucesso.");
}
