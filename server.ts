import cors from "cors";
import crypto from "crypto";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import { spawn } from "child_process";
import nodemailer from "nodemailer";
import path from "path";
import { Pool } from "pg";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

dotenv.config();

type Segment = "PF" | "PJ";
type AgentCode = "PF-1" | "PF-2" | "PJ-1" | "PJ-2" | "PJ-3";

type Lead = {
  id: number;
  protocol: string;
  segment: Segment | null;
  person_type: Segment | null;
  full_name: string | null;
  email: string | null;
  cpf_cnpj: string | null;
  birth_date: string | null;
  marital_status: string | null;
  cep: string | null;
  vehicle_model: string | null;
  vehicle_year: string | null;
  plate: string | null;
  app_usage: boolean | null;
  has_young_driver: boolean | null;
  young_driver_details: string | null;
  renewal: boolean | null;
  has_home_garage: boolean | null;
  residence_type: string | null;
  work_commute_usage: boolean | null;
  work_garage: boolean | null;
  third_party_coverage_value: string | null;
  fleet_complexity: "media_ou_alta" | "leve" | null;
  special_condition: boolean | null;
  assigned_agent_id: number | null;
  status: string;
  created_at: string;
  updated_at: string;
};

type Agent = {
  id: number;
  code: AgentCode;
  name: string;
  email: string;
  segment: Segment;
  flow_type: string;
  active: boolean;
};

type Conversation = {
  id: number;
  lead_id: number;
  channel: string;
  access_token: string | null;
  started_at: string;
  ended_at: string | null;
};

type ExtractedLeadData = Partial<
  Pick<
    Lead,
    | "segment"
    | "person_type"
    | "full_name"
    | "email"
    | "cpf_cnpj"
    | "birth_date"
    | "marital_status"
    | "cep"
    | "vehicle_model"
    | "vehicle_year"
    | "plate"
    | "app_usage"
    | "has_young_driver"
    | "young_driver_details"
    | "renewal"
    | "has_home_garage"
    | "residence_type"
    | "work_commute_usage"
    | "work_garage"
    | "third_party_coverage_value"
    | "fleet_complexity"
    | "special_condition"
  >
>;

const FIELD_LABELS: Record<string, string> = {
  person_type: "tipo de cliente (PF/PJ)",
  renewal: "se é renovação",
  full_name: "nome completo",
  birth_date: "data de nascimento",
  marital_status: "estado civil",
  cpf_cnpj: "CPF ou CNPJ",
  cep: "CEP",
  vehicle_model: "modelo do veículo",
  vehicle_year: "ano do veículo",
  plate: "placa",
  app_usage: "uso para app (Uber/99)",
  has_young_driver: "condutor entre 18 e 25 anos",
  has_home_garage: "garagem na residência",
  residence_type: "tipo de residência",
  work_commute_usage: "uso para ir ao trabalho",
  work_garage: "garagem no trabalho",
  third_party_coverage_value: "valor de cobertura para terceiros",
  fleet_complexity: "complexidade da frota",
  special_condition: "condição especial PJ",
  email: "e-mail",
};

const QUESTION_BY_FIELD: Record<string, string> = {
  person_type: "Seu seguro é para Pessoa Física (PF) ou Pessoa Jurídica (PJ)?",
  renewal: "É renovação de apólice? (sim ou não)",
  full_name: "Qual seu nome completo?",
  birth_date: "Qual sua data de nascimento?",
  marital_status: "Qual seu estado civil?",
  cpf_cnpj: "Qual seu CPF (ou CNPJ, se for PJ)?",
  cep: "Qual o CEP de pernoite do veículo?",
  vehicle_model: "Qual o modelo do veículo?",
  vehicle_year: "Qual o ano de fabricação/modelo do veículo?",
  plate: "Qual a placa do veículo?",
  app_usage: "O veículo é usado para app de transporte (Uber, 99 etc.)?",
  has_young_driver: "Há condutor entre 18 e 25 anos?",
  has_home_garage: "O veículo fica em garagem na sua residência? (sim ou não)",
  residence_type: "Sua residência é casa ou apartamento?",
  work_commute_usage: "Você usa o veículo para ir ao trabalho? (sim ou não)",
  work_garage: "No trabalho, o veículo fica em garagem ou estacionamento fechado? (sim ou não)",
  third_party_coverage_value: "Qual valor deseja para cobertura de terceiros? Se não souber, posso considerar de R$ 100 mil a R$ 150 mil para análise.",
  fleet_complexity: "A frota é leve ou de média/alta complexidade?",
  special_condition: "Há alguma condição especial para a empresa ou para os veículos? (sim ou não)",
  email: "Qual seu melhor e-mail para enviarmos o resumo e protocolo?",
};

type KnowledgeIntent = {
  intent: string;
  perguntas: string[];
  resposta_curta: string;
  fonte: string;
  url: string;
  tags: string[];
};

type KnowledgeChunk = {
  id: string;
  title: string;
  content: string;
  source: string;
  sourcePath: string;
};

type ControlledKnowledgeAnswer = {
  answer: string;
  source: string;
  sourcePath: string;
  topic: string;
  mode: "intent" | "rag" | "safe_fallback" | "legacy";
  confidence: number;
};

const LEGACY_FAQS: Array<{ pattern: RegExp; answer: string; source: string; sourcePath: string }> = [
  {
    pattern: /valor|preco|cotacao/i,
    answer:
      "O valor final depende da análise da seguradora e do seu perfil de risco. Posso te ajudar a coletar os dados obrigatórios para uma cotação assertiva.",
    source: "FAQ legada do backend",
    sourcePath: "server.ts",
  },
  {
    pattern: /viajar|viagem/i,
    answer:
      "A cobertura em viagem depende das cláusulas da apólice e da abrangência contratada. A confirmação final vem na proposta da seguradora.",
    source: "FAQ legada do backend",
    sourcePath: "server.ts",
  },
  {
    pattern: /vigencia|inicio|termino/i,
    answer:
      "A vigência costuma ser anual, com data de início e término definida em apólice. Posso orientar no processo, mas a confirmação final é da seguradora.",
    source: "FAQ legada do backend",
    sourcePath: "server.ts",
  },
  {
    pattern: /\b(uber|99)\b|aplicativo de transporte|app de transporte|motorista de app/i,
    answer:
      "Existe seguro para uso em app, mas a aceitação e precificação variam por seguradora e perfil. Vou considerar isso no seu encaminhamento.",
    source: "FAQ legada do backend",
    sourcePath: "server.ts",
  },
  {
    pattern: /assistencia 24|24h/i,
    answer:
      "Sim, existem opções focadas em assistência 24h. A disponibilidade depende da seguradora e plano contratado.",
    source: "FAQ legada do backend",
    sourcePath: "server.ts",
  },
];

const KNOWLEDGE_DIR = path.join(process.cwd(), "knowledge");
const FAQ_INTENTS_PATH = path.join(KNOWLEDGE_DIR, "intencoes-faq-seguro-auto.jsonl");
const FAQ_MARKDOWN_PATH = path.join(KNOWLEDGE_DIR, "faq-seguro-auto.md");
const RAG_BASE_PATH = path.join(KNOWLEDGE_DIR, "base-rag-seguro-auto.md");

const SAFE_KNOWLEDGE_FALLBACK =
  "Não tenho uma fonte confiável suficiente nesta base para cravar essa resposta. O caminho seguro é verificar a apólice, a proposta ou falar com a seguradora/corretor. Posso seguir com a triagem e direcionar seu caso para análise humana.";

const FRAUD_PREVENTION_ANSWER =
  "Não oriento omissão ou alteração de informação para reduzir preço. Dados incorretos no perfil, como CEP, uso do veículo ou condutor principal, podem prejudicar a aceitação da proposta e o direito à indenização. O caminho seguro é informar os dados reais para análise da seguradora.";

function loadKnowledgeIntents(): KnowledgeIntent[] {
  if (!fs.existsSync(FAQ_INTENTS_PATH)) {
    return [];
  }

  return fs
    .readFileSync(FAQ_INTENTS_PATH, "utf-8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      try {
        const parsed = JSON.parse(line) as KnowledgeIntent;
        if (!parsed.intent || !parsed.resposta_curta) {
          return [];
        }
        return [{
          intent: parsed.intent,
          perguntas: Array.isArray(parsed.perguntas) ? parsed.perguntas : [],
          resposta_curta: parsed.resposta_curta,
          fonte: parsed.fonte || "Base FAQ controlada",
          url: parsed.url || "knowledge/intencoes-faq-seguro-auto.jsonl",
          tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        }];
      } catch {
        return [];
      }
    });
}

function loadMarkdownChunks(filePath: string, sourcePath: string): KnowledgeChunk[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const blocks = raw.split(/\n##\s+/).slice(1);
  return blocks.flatMap((block, index) => {
    const [rawTitle, ...contentLines] = block.split(/\r?\n/);
    const title = rawTitle?.trim().replace(/^#+\s*/, "") || `Bloco ${index + 1}`;
    const content = contentLines.join("\n").trim();
    if (!content) {
      return [];
    }
    const sourceMatch = content.match(/Fonte:\s*([^\n]+)/i);
    return [{
      id: `${sourcePath}-${index + 1}`,
      title,
      content,
      source: sourceMatch?.[1]?.trim() || sourcePath,
      sourcePath,
    }];
  });
}

const KNOWLEDGE_INTENTS = loadKnowledgeIntents();
const KNOWLEDGE_CHUNKS = [
  ...loadMarkdownChunks(RAG_BASE_PATH, "knowledge/base-rag-seguro-auto.md"),
  ...loadMarkdownChunks(FAQ_MARKDOWN_PATH, "knowledge/faq-seguro-auto.md"),
];

function extractKnowledgeChunkAnswer(chunk: KnowledgeChunk) {
  const safeAnswerMatch = chunk.content.match(/Resposta segura do chatbot:\s*\n+\s*>\s*([^\n]+)/i);
  if (safeAnswerMatch?.[1]) {
    return safeAnswerMatch[1].trim();
  }

  return chunk.content
    .split(/\n\n+/)
    .find((part) => !/^Fonte:/i.test(part.trim()))
    ?.replace(/\s+/g, " ")
    .trim();
}

function detectRiskyAdviceRequest(message: string): ControlledKnowledgeAnswer | null {
  if (/mentir|omitir|esconder|fraudar|fraude|informar.*cep.*diferente|cep.*pagar menos/i.test(message)) {
    return {
      answer: FRAUD_PREVENTION_ANSWER,
      source: "knowledge/base-rag-seguro-auto.md - Bloco 4",
      sourcePath: "knowledge/base-rag-seguro-auto.md",
      topic: "informacoes_corretas",
      mode: "safe_fallback",
      confidence: 1,
    };
  }
  return null;
}

function isInsuranceKnowledgeQuestion(message: string) {
  return /seguro|ap[oó]lice|cobertura|cobre|franquia|sinistro|indeniza|indeniza[cç][aã]o|seguradora|corretor|guincho|assist[eê]ncia|parcela|pagamento|terceiro|terceiros|b[oô]nus|renova[cç][aã]o|vidro|carro reserva|recusar|proposta|pre[cç]o|cot[aç][aã]o|perfil|cep|uber|99|aplicativo|rcf-v|rcf|susep|cartilha|danos/i.test(
    message,
  );
}

function formatControlledAnswer(answer: ControlledKnowledgeAnswer) {
  if (answer.mode === "safe_fallback") {
    return answer.answer;
  }

  return [
    answer.answer,
    "Orientação informativa: cobertura, aceitação, preço e indenização dependem da análise da seguradora e das condições da apólice.",
  ].join("\n\n");
}

function cosineSimilarity(a: number[], b: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

class SimpleMemoryVectorStore {
  documents: { pageContent: string; metadata: any; embedding: number[] }[] = [];
  
  constructor(private embeddings: GoogleGenerativeAIEmbeddings) {}

  async addDocuments(docs: Document[]) {
    // Process in batches to avoid rate limits
    const batchSize = 20;
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = docs.slice(i, i + batchSize);
      const texts = batch.map(d => d.pageContent);
      const vectors = await this.embeddings.embedDocuments(texts);
      for (let j = 0; j < batch.length; j++) {
        this.documents.push({
          pageContent: batch[j].pageContent,
          metadata: batch[j].metadata,
          embedding: vectors[j],
        });
      }
    }
  }

  async similaritySearch(query: string, k: number = 1) {
    const queryVector = await this.embeddings.embedQuery(query);
    const scored = this.documents.map(doc => ({
      ...doc,
      score: cosineSimilarity(queryVector, doc.embedding),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, k);
  }
}

let vectorStore: SimpleMemoryVectorStore | null = null;

async function initVectorStore() {
  if (!geminiApiKey) {
    console.warn("Chave do Gemini não encontrada, RAG não será inicializado.");
    return;
  }

  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: geminiApiKey,
    model: "gemini-embedding-2",
  });

  vectorStore = new SimpleMemoryVectorStore(embeddings);

  const docs: Document[] = [];

  for (const intent of KNOWLEDGE_INTENTS) {
    for (const q of intent.perguntas) {
      docs.push(new Document({
        pageContent: q,
        metadata: {
          topic: intent.intent,
          source: intent.fonte,
          sourcePath: intent.url,
          answer: intent.resposta_curta,
          mode: "intent"
        }
      }));
    }
  }

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  for (const chunk of KNOWLEDGE_CHUNKS) {
    const splitDocs = await textSplitter.createDocuments([`${chunk.title}\n${chunk.content}`]);
    for (const doc of splitDocs) {
      docs.push(new Document({
        pageContent: doc.pageContent,
        metadata: {
          topic: chunk.title,
          source: chunk.source,
          sourcePath: chunk.sourcePath,
          answer: extractKnowledgeChunkAnswer(chunk) || doc.pageContent.slice(0, 520),
          mode: "rag"
        }
      }));
    }
  }

  for (const faq of LEGACY_FAQS) {
    docs.push(new Document({
      pageContent: faq.answer,
      metadata: {
        topic: "faq_legada",
        source: faq.source,
        sourcePath: faq.sourcePath,
        answer: faq.answer,
        mode: "legacy"
      }
    }));
  }

  if (docs.length > 0) {
    await vectorStore.addDocuments(docs);
    console.log(`Vector Store inicializado com ${docs.length} documentos.`);
  }
}

async function detectControlledKnowledgeAnswer(message: string): Promise<ControlledKnowledgeAnswer | null> {
  const riskyAdvice = detectRiskyAdviceRequest(message);
  if (riskyAdvice) {
    return riskyAdvice;
  }

  if (!vectorStore) {
    if (isInsuranceKnowledgeQuestion(message)) {
      return {
        answer: SAFE_KNOWLEDGE_FALLBACK,
        source: "Fallback seguro sem fonte suficiente",
        sourcePath: "knowledge/",
        topic: "fallback_seguro",
        mode: "safe_fallback",
        confidence: 0,
      };
    }
    return null;
  }

  const results = await vectorStore.similaritySearch(message, 1);
  if (results.length > 0 && isInsuranceKnowledgeQuestion(message)) {
    const best = results[0];
    let finalAnswer = best.metadata.answer;

    if (llm) {
      try {
        const prompt = `Você é a Lia, uma assistente virtual de seguros auto amigável e profissional.
Sua tarefa é REESCREVER a resposta técnica abaixo de forma conversacional, humana e empática.
Mantenha estritamente os fatos. 

[REGRAS DE SEGURANÇA E ANTI-ALUCINAÇÃO]:
1. NUNCA invente coberturas, garantias ou condições que não estejam no texto original.
2. NUNCA informe preços, valores ou cotação final.
3. NUNCA prometa aprovação da seguradora.
4. NUNCA dê aconselhamento jurídico.
5. Mantenha o foco absoluto em seguro auto. Se o texto não tiver a resposta completa, não invente o resto.

Pergunta do usuário: "${message}"
Resposta técnica original: "${best.metadata.answer}"

Sua reescrita amigável e segura (Português do Brasil):`;
        
        const rewriteRes = await llm.invoke(prompt);
        if (rewriteRes && rewriteRes.content) {
          finalAnswer = rewriteRes.content.toString().trim();
        }
      } catch (error) {
        console.error("Erro ao reescrever resposta via LLM:", error);
      }
    }

    return {
      answer: finalAnswer,
      source: best.metadata.source,
      sourcePath: best.metadata.sourcePath,
      topic: best.metadata.topic,
      mode: best.metadata.mode as any,
      confidence: 5,
    };
  }

  if (isInsuranceKnowledgeQuestion(message)) {
    return {
      answer: SAFE_KNOWLEDGE_FALLBACK,
      source: "Fallback seguro sem fonte suficiente",
      sourcePath: "knowledge/",
      topic: "fallback_seguro",
      mode: "safe_fallback",
      confidence: 0,
    };
  }

  return null;
}

type PythonReplyPayload = {
  agentStyle: string;
  stage: "listening" | "collecting" | "routed" | "sinistro_handoff";
  offTopic: boolean;
  collectingTransition: boolean;
  faqAnswer: string | null;
  question: string | null;
  missingLabel: string;
  firstMissingLabel: string | null;
  missingCount: number;
  contextSnippet: string;
  assigned: string | null;
  protocol: string;
  isRouted: boolean;
  includeIntro: boolean;
};

const PYTHON_TIMEOUT_MS = 6_000;
const chatRateLimitHits = new Map<string, { count: number; resetAt: number }>();

function createAccessToken() {
  return crypto.randomBytes(32).toString("hex");
}

function adminApiKey() {
  return process.env.ADMIN_API_KEY?.trim() || "";
}

function isAdminRequest(req: express.Request) {
  const configuredKey = adminApiKey();
  const receivedKey = req.header("x-admin-api-key")?.trim() || "";
  if (!configuredKey || !receivedKey || configuredKey.length !== receivedKey.length) {
    return false;
  }
  return crypto.timingSafeEqual(
    Buffer.from(receivedKey),
    Buffer.from(configuredKey),
  );
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const configuredKey = adminApiKey();
  if (!configuredKey) {
    res.status(503).json({ error: "ADMIN_API_KEY nao configurada no backend." });
    return;
  }

  const receivedKey = req.header("x-admin-api-key")?.trim() || "";
  if (!receivedKey || !isAdminRequest(req)) {
    res.status(401).json({ error: "Acesso administrativo nao autorizado." });
    return;
  }

  next();
}

function chatRateLimit(req: express.Request, res: express.Response, next: express.NextFunction) {
  const windowMs = Number(process.env.CHAT_RATE_LIMIT_WINDOW_MS || 60_000);
  const maxHits = Number(process.env.CHAT_RATE_LIMIT_MAX || 30);
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || "unknown";
  const current = chatRateLimitHits.get(key);

  if (!current || current.resetAt <= now) {
    chatRateLimitHits.set(key, { count: 1, resetAt: now + windowMs });
    next();
    return;
  }

  if (current.count >= maxHits) {
    res.status(429).json({ error: "Muitas mensagens em pouco tempo. Tente novamente em instantes." });
    return;
  }

  current.count += 1;
  next();
}

function maskCpfCnpj(value: string | null) {
  if (!value) return "-";
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.***.***-${digits.slice(-2)}`;
  }
  if (digits.length === 14) {
    return `${digits.slice(0, 2)}.***.***/****-${digits.slice(-2)}`;
  }
  return "***";
}

function maskPlate(value: string | null) {
  if (!value) return "-";
  const clean = value.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  if (clean.length < 4) return "***";
  return `${clean.slice(0, 3)}***${clean.slice(-1)}`;
}

function maskEmail(value: string | null) {
  if (!value) return "-";
  const [name, domain] = value.split("@");
  if (!name || !domain) return "***";
  return `${name.slice(0, 2)}***@${domain}`;
}

function maskSensitiveText(value: string) {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, (email) => maskEmail(email))
    .replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, (cpf) => maskCpfCnpj(cpf))
    .replace(/\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g, (cnpj) => maskCpfCnpj(cnpj))
    .replace(/\b[A-Z]{3}-?\d[A-Z0-9]\d{2}\b/gi, (plate) => maskPlate(plate));
}

function runPythonCommunicator(payload: PythonReplyPayload): Promise<string | null> {
  return new Promise((resolve) => {
    if ((process.env.PYTHON_AGENT_ENABLED ?? "true") !== "true") {
      resolve(null);
      return;
    }

    const scriptPath = path.join(process.cwd(), "python", "agent_communicator.py");
    if (!fs.existsSync(scriptPath)) {
      resolve(null);
      return;
    }

    const pythonCommand = process.platform === "win32" ? "python" : "python3";
    const child = spawn(pythonCommand, [scriptPath], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let resolved = false;
    const done = (value: string | null) => {
      if (!resolved) {
        resolved = true;
        resolve(value);
      }
    };

    // Kill the process and resolve null if it hangs.
    const timer = setTimeout(() => {
      child.kill();
      done(null);
    }, PYTHON_TIMEOUT_MS);

    let stdout = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.on("error", () => {
      clearTimeout(timer);
      done(null);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0 || !stdout.trim()) {
        done(null);
        return;
      }
      try {
        const parsed = JSON.parse(stdout) as { text?: string };
        done(parsed.text ?? null);
      } catch {
        done(null);
      }
    });

    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  });
}

async function buildAssistantText(params: {
  stage: "listening" | "collecting" | "routed" | "sinistro_handoff";
  offTopic: boolean;
  collectingTransition: boolean;
  faqAnswer: string | null;
  missing: Array<keyof Lead>;
  question: string | null;
  contextSnippet: string;
  assigned: string | null;
  protocol: string;
  isRouted: boolean;
  includeIntro: boolean;
  fullName?: string | null;
}) {
  const missingLabel = params.missing.map((field) => FIELD_LABELS[String(field)]).join(", ");

  const pythonText = await runPythonCommunicator({
    agentStyle: process.env.AGENT_VOICE_STYLE || "consultiva",
    stage: params.stage,
    offTopic: params.offTopic,
    collectingTransition: params.collectingTransition,
    faqAnswer: params.faqAnswer,
    question: params.question,
    missingLabel,
    firstMissingLabel: params.missing[0] ? FIELD_LABELS[String(params.missing[0])] : null,
    missingCount: params.missing.length,
    contextSnippet: params.contextSnippet,
    assigned: params.assigned,
    protocol: params.protocol,
    isRouted: params.isRouted,
    includeIntro: params.includeIntro,
    fullName: params.fullName,
  });

  if (pythonText) {
    return pythonText;
  }

  if (params.stage === "sinistro_handoff") {
    return "Sinto muito pelo ocorrido. Vou te transferir agora para o time humano responsavel por sinistro para continuidade imediata.";
  }

  if (params.stage === "routed" || params.isRouted) {
    return [
      params.faqAnswer,
      "Perfeito, concluimos sua triagem e seu caso ja foi direcionado ao especialista certo.",
      `Protocolo: ${params.protocol}.`,
      "A cotacao final depende da analise da seguradora.",
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  if (params.stage === "listening") {
    return [
      params.faqAnswer,
      "Quero entender direitinho o seu contexto antes de partir para os dados do cadastro.",
      params.contextSnippet ? `Pelo que entendi ate aqui: ${params.contextSnippet}.` : null,
      "Pode me contar o que voce prioriza no seguro (preco, cobertura, assistencia 24h, carro reserva, franquia)?",
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  return [
    params.faqAnswer,
    "Que bom falar com voce. Vou te ajudar com calma para coletar os dados e seguir com sua cotacao.",
    missingLabel ? `Ainda faltam: ${missingLabel}.` : null,
    params.question,
    "Ao continuar, voce concorda com o uso dos dados para contato e cotacao.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function boolFromPortuguese(value: string): boolean | null {
  const normalized = value.trim().toLowerCase();
  if (["sim", "s", "yes", "true"].includes(normalized)) {
    return true;
  }
  if (["nao", "não", "n", "no", "false"].includes(normalized)) {
    return false;
  }
  return null;
}

function readGeminiApiKey(): string {
  if (process.env.GEMINI_API_KEY_FILE) {
    try {
      return fs.readFileSync(process.env.GEMINI_API_KEY_FILE, "utf-8").trim();
    } catch {
      return process.env.GEMINI_API_KEY ?? "";
    }
  }
  return process.env.GEMINI_API_KEY ?? "";
}

let geminiApiKey = readGeminiApiKey();
let llm = geminiApiKey
  ? new ChatGoogleGenerativeAI({
      apiKey: geminiApiKey,
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      temperature: 0.1,
    })
  : null;

function reloadGeminiLLM(newKey: string) {
  geminiApiKey = newKey;
  llm = new ChatGoogleGenerativeAI({
    apiKey: geminiApiKey,
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    temperature: 0.1,
  });
}

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/seguro_auto_ai",
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS agents (
      id SERIAL PRIMARY KEY,
      code VARCHAR(10) UNIQUE NOT NULL,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(180) NOT NULL,
      segment VARCHAR(2) NOT NULL,
      flow_type VARCHAR(120) NOT NULL,
      active BOOLEAN NOT NULL DEFAULT true
    );

    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      protocol VARCHAR(40) UNIQUE NOT NULL,
      segment VARCHAR(2),
      person_type VARCHAR(2),
      full_name VARCHAR(160),
      email VARCHAR(180),
      cpf_cnpj VARCHAR(20),
      birth_date VARCHAR(20),
      marital_status VARCHAR(40),
      cep VARCHAR(12),
      vehicle_model VARCHAR(120),
      vehicle_year VARCHAR(20),
      plate VARCHAR(12),
      app_usage BOOLEAN,
      has_young_driver BOOLEAN,
      young_driver_details VARCHAR(120),
      renewal BOOLEAN,
      has_home_garage BOOLEAN,
      residence_type VARCHAR(40),
      work_commute_usage BOOLEAN,
      work_garage BOOLEAN,
      third_party_coverage_value VARCHAR(40),
      fleet_complexity VARCHAR(20),
      special_condition BOOLEAN,
      assigned_agent_id INTEGER REFERENCES agents(id),
      status VARCHAR(40) NOT NULL DEFAULT 'collecting_data',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS lead_answers (
      id SERIAL PRIMARY KEY,
      lead_id INTEGER NOT NULL REFERENCES leads(id),
      question_key VARCHAR(80) NOT NULL,
      answer_value TEXT NOT NULL,
      collected_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id SERIAL PRIMARY KEY,
      lead_id INTEGER NOT NULL REFERENCES leads(id),
      channel VARCHAR(40) NOT NULL DEFAULT 'web',
      access_token VARCHAR(128),
      started_at TIMESTAMP NOT NULL DEFAULT NOW(),
      ended_at TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS conversation_messages (
      id SERIAL PRIMARY KEY,
      conversation_id INTEGER NOT NULL REFERENCES conversations(id),
      role VARCHAR(16) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS email_logs (
      id SERIAL PRIMARY KEY,
      lead_id INTEGER NOT NULL REFERENCES leads(id),
      recipient_email VARCHAR(180) NOT NULL,
      template_name VARCHAR(80) NOT NULL,
      status VARCHAR(30) NOT NULL,
      provider_id VARCHAR(180),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS knowledge_answer_logs (
      id SERIAL PRIMARY KEY,
      conversation_id INTEGER NOT NULL REFERENCES conversations(id),
      lead_id INTEGER NOT NULL REFERENCES leads(id),
      topic VARCHAR(160) NOT NULL,
      source_name TEXT NOT NULL,
      source_path TEXT NOT NULL,
      answer_mode VARCHAR(40) NOT NULL,
      confidence NUMERIC,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE conversations
    ADD COLUMN IF NOT EXISTS access_token VARCHAR(128);

    CREATE INDEX IF NOT EXISTS idx_conversations_access_token
    ON conversations (access_token);
  `);

  const defaultAgents: Array<Omit<Agent, "id">> = [
    {
      code: "PF-1",
      name: "Atendente PF Novo",
      email: "pf1@seguroauto.ai",
      segment: "PF",
      flow_type: "PF Novo",
      active: true,
    },
    {
      code: "PF-2",
      name: "Atendente PF Renovacao",
      email: "pf2@seguroauto.ai",
      segment: "PF",
      flow_type: "PF Renovacao/Sensivel",
      active: true,
    },
    {
      code: "PJ-1",
      name: "Atendente PJ Frota Leve",
      email: "pj1@seguroauto.ai",
      segment: "PJ",
      flow_type: "PJ Frota Leve",
      active: true,
    },
    {
      code: "PJ-2",
      name: "Atendente PJ Complexidade",
      email: "pj2@seguroauto.ai",
      segment: "PJ",
      flow_type: "PJ Media/Alta Complexidade",
      active: true,
    },
    {
      code: "PJ-3",
      name: "Atendente PJ Renovacao",
      email: "pj3@seguroauto.ai",
      segment: "PJ",
      flow_type: "PJ Renovacao/Especial",
      active: true,
    },
  ];

  for (const agent of defaultAgents) {
    await pool.query(
      `
      INSERT INTO agents (code, name, email, segment, flow_type, active)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (code) DO NOTHING
      `,
      [
        agent.code,
        agent.name,
        agent.email,
        agent.segment,
        agent.flow_type,
        agent.active,
      ],
    );
  }
}

function protocolCode() {
  const date = new Date();
  const d = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SA-${d}-${rand}`;
}

async function createLeadAndConversation() {
  const createdLead = await pool.query<Lead>(
    `
    INSERT INTO leads (protocol, status)
    VALUES ($1, 'listening')
    RETURNING *
    `,
    [protocolCode()],
  );

  const lead = createdLead.rows[0];
  const accessToken = createAccessToken();
  const createdConversation = await pool.query(
    `
    INSERT INTO conversations (lead_id, channel, access_token)
    VALUES ($1, 'web', $2)
    RETURNING id, access_token
    `,
    [lead.id, accessToken],
  );

  return {
    lead,
    conversationId: createdConversation.rows[0].id as number,
    conversationToken: createdConversation.rows[0].access_token as string,
  };
}

async function getLeadById(leadId: number) {
  const result = await pool.query<Lead>(`SELECT * FROM leads WHERE id = $1`, [leadId]);
  return result.rows[0] || null;
}

async function getConversationById(conversationId: number) {
  const result = await pool.query<Conversation>(
    `SELECT * FROM conversations WHERE id = $1`,
    [conversationId],
  );
  return result.rows[0] || null;
}

async function insertConversationMessage(
  conversationId: number,
  role: "user" | "assistant" | "system",
  content: string,
) {
  await pool.query(
    `
    INSERT INTO conversation_messages (conversation_id, role, content)
    VALUES ($1, $2, $3)
    `,
    [conversationId, role, content],
  );
}

async function insertKnowledgeAnswerLog(
  conversationId: number,
  leadId: number,
  answer: ControlledKnowledgeAnswer,
) {
  await pool.query(
    `
    INSERT INTO knowledge_answer_logs (
      conversation_id,
      lead_id,
      topic,
      source_name,
      source_path,
      answer_mode,
      confidence
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
    [
      conversationId,
      leadId,
      answer.topic,
      answer.source,
      answer.sourcePath,
      answer.mode,
      answer.confidence,
    ],
  );
}

const BOOLEAN_FIELDS: Array<keyof Lead> = [
  "renewal",
  "app_usage",
  "has_young_driver",
  "has_home_garage",
  "work_commute_usage",
  "work_garage",
  "special_condition",
];

// String fields that can be directly set from a short, clean reply
// when the agent already asked specifically for them.
const DIRECT_ANSWER_FIELDS: Partial<Record<keyof Lead, (msg: string) => string | null>> = {
  full_name: (msg) => {
    const t = msg.trim();
    // Aceita 1 a 5 palavras como nome.
    if (/^[A-Za-zÀ-ÖØ-öø-ÿ'-]+(?: [A-Za-zÀ-ÖØ-öø-ÿ'-]+){0,4}$/.test(t) && t.length >= 2 && t.length <= 80) {
      return t;
    }
    return null;
  },
  vehicle_model: (msg) => {
    const t = msg.trim();
    // Accept any short answer as a vehicle model description.
    return t.length >= 2 && t.length <= 60 ? t : null;
  },
  birth_date: (msg) => {
    const t = msg.trim();
    // dd/mm/yyyy, dd-mm-yyyy, yyyy-mm-dd
    if (/\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/.test(t)) return t;
    if (/\b\d{4}[\/\-]\d{2}[\/\-]\d{2}\b/.test(t)) return t;
    // Data por extenso (ex: 13 de julho de 1976)
    if (/\b\d{1,2}\s+(de\s+)?[a-zç]+\s+(de\s+)?\d{4}\b/i.test(t)) return t;
    return null;
  },
  marital_status: (msg) => {
    const t = msg.trim().toLowerCase();
    const map: Record<string, string> = {
      solteiro: "Solteiro", solteira: "Solteira",
      casado: "Casado", casada: "Casada",
      divorciado: "Divorciado", divorciada: "Divorciada",
      viuvo: "Viúvo", viuva: "Viúva", viúvo: "Viúvo", viúva: "Viúva",
      separado: "Separado", separada: "Separada",
      "união estável": "União Estável", uniao: "União Estável",
    };
    for (const [key, val] of Object.entries(map)) {
      if (t.includes(key)) return val;
    }
    return null;
  },
  residence_type: (msg) => {
    const t = msg.trim().toLowerCase();
    if (/\bcasa\b/.test(t)) return "Casa";
    if (/apartamento|\bapto\b|\bap\b/.test(t)) return "Apartamento";
    return null;
  },
  third_party_coverage_value: (msg) => {
    const t = msg.trim();
    const money = t.match(/r\$\s*[\d.,]+(?:\s*mil)?|[\d.,]+\s*(?:mil|k)\b/i);
    if (money) return money[0].trim();
    if (/100/.test(t) && /150/.test(t)) return "R$ 100.000 a R$ 150.000";
    if (/nao sei|não sei|sugest|recomend/i.test(t)) return "A definir com orientação de R$ 100.000 a R$ 150.000";
    return null;
  },
  fleet_complexity: (msg) => {
    const t = msg.trim().toLowerCase();
    if (/m[eé]dia|alta|complex/.test(t)) return "media_ou_alta";
    if (/leve|simples|pequena|poucos/.test(t)) return "leve";
    return null;
  },
  cpf_cnpj: (msg) => {
    // Strip common CPF/CNPJ punctuation: dots, dashes, slashes.
    const digits = msg.replace(/[.\-\/\s]/g, "").match(/\d+/g)?.join("") ?? "";
    if (digits.length === 11) return digits; // CPF
    if (digits.length === 14) return digits; // CNPJ
    return null;
  },
  vehicle_year: (msg) => {
    const m = msg.match(/\b(19|20)\d{2}\b/);
    return m ? m[0] : null;
  },
  plate: (msg) => {
    // Standard Mercosul (ABC1D23) or old (ABC-1234 / ABC1234)
    const standard = msg.match(/\b([A-Z]{3}-?\d[A-Z0-9]\d{2}|[A-Z]{3}-?\d{4})\b/i);
    if (standard) return standard[1].replace("-", "").toUpperCase();
    // Lenient: any 5-8 alphanumeric token with at least 1 letter and 1 digit
    const tokens = msg.match(/\b[A-Z0-9]{5,8}\b/ig) ?? [];
    for (const tok of tokens) {
      if (/[A-Z]/i.test(tok) && /\d/.test(tok)) return tok.toUpperCase();
    }
    return null;
  },
};

function fallbackExtraction(message: string, lastAskedField?: keyof Lead): ExtractedLeadData {
  const extracted: ExtractedLeadData = {};
  const lowerMessage = message.toLowerCase();

  // If the agent just asked about a boolean field and the user replied with a bare sim/não,
  // map the answer directly to that field without requiring the field name in the message.
  if (lastAskedField && BOOLEAN_FIELDS.includes(lastAskedField)) {
    const boolGuess = boolFromPortuguese(message.trim());
    if (boolGuess !== null) {
      (extracted as Record<string, unknown>)[lastAskedField as string] = boolGuess;
    }
  }

  // If the agent asked for a direct-answer string field and the reply looks like a valid answer,
  // set it immediately without needing the LLM.
  if (lastAskedField && lastAskedField in DIRECT_ANSWER_FIELDS) {
    const parser = DIRECT_ANSWER_FIELDS[lastAskedField];
    const parsed = parser ? parser(message) : null;
    if (parsed !== null) {
      (extracted as Record<string, unknown>)[lastAskedField as string] = parsed;
    }
  }

  if (/\bpf\b|pessoa f[ií]sica/.test(lowerMessage)) {
    extracted.person_type = "PF";
    extracted.segment = "PF";
  }
  if (/\bpj\b|pessoa jur[ií]dica|cnpj/.test(lowerMessage)) {
    extracted.person_type = "PJ";
    extracted.segment = "PJ";
  }

  const renewalMatch = lowerMessage.match(/renovacao|renovação/);
  if (renewalMatch) {
    const boolGuess = boolFromPortuguese(message);
    if (boolGuess !== null) {
      extracted.renewal = boolGuess;
    }
  }

  const cpfCnpjMatch = message.replace(/[.\-\/]/g, "").match(/\b(\d{11}|\d{14})\b/);
  if (cpfCnpjMatch) {
    extracted.cpf_cnpj = cpfCnpjMatch[1];
    if (cpfCnpjMatch[1].length === 14) {
      extracted.person_type = "PJ";
      extracted.segment = "PJ";
    }
  }

  const cepMatch = message.match(/\b\d{5}-?\d{3}\b/);
  if (cepMatch) {
    extracted.cep = cepMatch[0];
  }

  const plateMatch = message.match(/\b[A-Z]{3}-?\d[A-Z0-9]\d{2}\b/i);
  if (plateMatch) {
    extracted.plate = plateMatch[0].toUpperCase();
  }

  // Only extract vehicle_year from a bare year or car description.
  // Avoid false positives from birth-date entries like "16/12/1980".
  const hasDateContext = /\b\d{1,2}[\/-]\d{1,2}[\/-]\d{4}\b/.test(message);
  if (!hasDateContext || lastAskedField === "vehicle_year") {
    const yearMatch = message.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
      extracted.vehicle_year = yearMatch[0];
    }
  }

  const emailMatch = message.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  if (emailMatch) {
    extracted.email = emailMatch[0];
  }

  if (/\b(uber|99)\b|aplicativo de transporte|app de transporte|motorista de app/.test(lowerMessage)) {
    extracted.app_usage = true;
  }
  if (/nao uso app|não uso app|nao trabalho com app|não trabalho com app|uso pessoal|nao uso para aplicativo|não uso para aplicativo/.test(lowerMessage)) {
    extracted.app_usage = false;
  }

  if (/18|19|20|21|22|23|24|25/.test(lowerMessage) && /condutor|motorista/.test(lowerMessage)) {
    extracted.has_young_driver = true;
  }

  return extracted;
}

function canSkipLlm(message: string, lastAskedField?: keyof Lead): boolean {
  const trimmed = message.trim();
  const lower = trimmed.toLowerCase();

  // Short greeting / small-talk — nothing to extract.
  const greetingPattern = /^\s*(oi|ol[aá]|tudo bem|bom dia|boa tarde|boa noite|obrigad[oa]|ok|certo)\s*[!.,]?\s*$/i;
  if (trimmed.length <= 40 && greetingPattern.test(lower)) {
    return true;
  }

  // Bare sim/não answering a boolean field — fallback handles it perfectly.
  if (lastAskedField && BOOLEAN_FIELDS.includes(lastAskedField)) {
    if (boolFromPortuguese(trimmed) !== null) return true;
  }

  // Clear PF/PJ answer when that's what was asked.
  if (lastAskedField === "person_type" && /\bpf\b|pessoa f[ií]sica|\bpj\b|pessoa jur[ií]dica/.test(lower)) {
    return true;
  }

  // If fallback already resolved the asked field via DIRECT_ANSWER_FIELDS, skip LLM.
  if (lastAskedField && lastAskedField in DIRECT_ANSWER_FIELDS) {
    const parser = DIRECT_ANSWER_FIELDS[lastAskedField];
    if (parser && parser(message) !== null) return true;
  }

  return false;
}

async function extractLeadData(
  message: string,
  currentLead: Lead,
  lastAskedField?: keyof Lead,
): Promise<ExtractedLeadData> {
  const t = message.trim();
  if (/^(tirar d[uú]vida|fazer cota[cç][aã]o|sinistro ou assist[eê]ncia)$/i.test(t)) {
    return {};
  }

  const fallback = fallbackExtraction(message, lastAskedField);
  if (!llm || canSkipLlm(message, lastAskedField)) {
    return fallback;
  }

  const lastAskedHint = lastAskedField
    ? `\nCampo que acabou de ser perguntado ao cliente: ${lastAskedField} ("${FIELD_LABELS[lastAskedField] ?? lastAskedField}"). Se a resposta for um simples sim/nao ou valor curto, interprete como resposta a este campo.`
    : "";

  const prompt = ChatPromptTemplate.fromTemplate(`
Voce extrai dados de lead de seguro auto.
Retorne somente JSON valido, sem markdown.

Campos permitidos:
- person_type (PF ou PJ)
- segment (PF ou PJ)
- full_name
- email
- cpf_cnpj
- birth_date
- marital_status
- cep
- vehicle_model
- vehicle_year
- plate
- app_usage (true/false)
- has_young_driver (true/false)
- young_driver_details
- renewal (true/false)
- has_home_garage (true/false)
- residence_type (Casa ou Apartamento)
- work_commute_usage (true/false)
- work_garage (true/false)
- third_party_coverage_value
- fleet_complexity (leve ou media_ou_alta)
- special_condition (true/false)

Nao invente dados. Use null quando nao identificado.{lastAskedHint}

Lead atual:
{currentLead}

Mensagem do cliente:
{message}
`);

  const LLM_TIMEOUT_MS = 15_000;
  try {
    const messages = await prompt.formatMessages({
      currentLead: JSON.stringify(currentLead),
      message,
      lastAskedHint,
    });
    const response = await Promise.race([
      llm.invoke(messages),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("LLM timeout")), LLM_TIMEOUT_MS)
      ),
    ]);
    const content = String(response.content);
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return fallback;
    }
    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    return {
      ...fallback,
      person_type:
        parsed.person_type === "PF" || parsed.person_type === "PJ"
          ? (parsed.person_type as Segment)
          : fallback.person_type,
      segment:
        parsed.segment === "PF" || parsed.segment === "PJ"
          ? (parsed.segment as Segment)
          : fallback.segment,
      full_name: typeof parsed.full_name === "string" ? parsed.full_name : fallback.full_name,
      email: typeof parsed.email === "string" ? parsed.email : fallback.email,
      cpf_cnpj: typeof parsed.cpf_cnpj === "string" ? parsed.cpf_cnpj : fallback.cpf_cnpj,
      birth_date:
        typeof parsed.birth_date === "string" ? parsed.birth_date : fallback.birth_date,
      marital_status:
        typeof parsed.marital_status === "string"
          ? parsed.marital_status
          : fallback.marital_status,
      cep: typeof parsed.cep === "string" ? parsed.cep : fallback.cep,
      vehicle_model:
        typeof parsed.vehicle_model === "string"
          ? parsed.vehicle_model
          : fallback.vehicle_model,
      vehicle_year:
        typeof parsed.vehicle_year === "string"
          ? parsed.vehicle_year
          : fallback.vehicle_year,
      plate: typeof parsed.plate === "string" ? parsed.plate : fallback.plate,
      app_usage:
        typeof parsed.app_usage === "boolean" ? parsed.app_usage : fallback.app_usage,
      has_young_driver:
        typeof parsed.has_young_driver === "boolean"
          ? parsed.has_young_driver
          : fallback.has_young_driver,
      young_driver_details:
        typeof parsed.young_driver_details === "string"
          ? parsed.young_driver_details
          : fallback.young_driver_details,
      renewal: typeof parsed.renewal === "boolean" ? parsed.renewal : fallback.renewal,
      has_home_garage:
        typeof parsed.has_home_garage === "boolean"
          ? parsed.has_home_garage
          : fallback.has_home_garage,
      residence_type:
        typeof parsed.residence_type === "string"
          ? parsed.residence_type
          : fallback.residence_type,
      work_commute_usage:
        typeof parsed.work_commute_usage === "boolean"
          ? parsed.work_commute_usage
          : fallback.work_commute_usage,
      work_garage:
        typeof parsed.work_garage === "boolean"
          ? parsed.work_garage
          : fallback.work_garage,
      third_party_coverage_value:
        typeof parsed.third_party_coverage_value === "string"
          ? parsed.third_party_coverage_value
          : fallback.third_party_coverage_value,
      fleet_complexity:
        parsed.fleet_complexity === "leve" || parsed.fleet_complexity === "media_ou_alta"
          ? (parsed.fleet_complexity as "leve" | "media_ou_alta")
          : fallback.fleet_complexity,
      special_condition:
        typeof parsed.special_condition === "boolean"
          ? parsed.special_condition
          : fallback.special_condition,
    };
  } catch {
    return fallback;
  }
}

async function updateLead(lead: Lead, data: ExtractedLeadData) {
  const keys = Object.keys(data).filter(
    (key) => data[key as keyof ExtractedLeadData] !== undefined,
  );
  if (!keys.length) {
    return lead;
  }

  const values = keys.map((key) => data[key as keyof ExtractedLeadData]);
  const assignments = keys.map((key, index) => `${key} = $${index + 1}`);
  assignments.push(`updated_at = NOW()`);
  values.push(lead.id as never);

  const result = await pool.query<Lead>(
    `
    UPDATE leads
    SET ${assignments.join(", ")}
    WHERE id = $${values.length}
    RETURNING *
    `,
    values,
  );

  for (const key of keys) {
    const value = data[key as keyof ExtractedLeadData];
    if (value !== undefined && value !== null && value !== "") {
      await pool.query(
        `
        INSERT INTO lead_answers (lead_id, question_key, answer_value)
        VALUES ($1, $2, $3)
        `,
        [lead.id, key, String(value)],
      );
    }
  }

  return result.rows[0];
}

function requiredFieldsForLead(lead: Lead): Array<keyof Lead> {
  const isPJ = lead.person_type === "PJ" || lead.segment === "PJ";

  const fields: Array<keyof Lead> = [
    "full_name",
    "person_type",
    "renewal",
  ];

  if (!isPJ) {
    fields.push("birth_date", "marital_status");
  }

  fields.push(
    "cpf_cnpj",
    "cep",
    "vehicle_model",
    "vehicle_year",
    "plate",
  );

  if (isPJ) {
    fields.push("fleet_complexity", "special_condition");
  }

  fields.push(
    "has_home_garage",
    "residence_type",
    "work_commute_usage",
  );

  if (lead.work_commute_usage === true) {
    fields.push("work_garage");
  }

  fields.push(
    "app_usage",
    "has_young_driver",
    "third_party_coverage_value",
    "email",
  );

  return fields;
}

function missingRequiredFields(lead: Lead) {
  return requiredFieldsForLead(lead).filter((field) => {
    const value = lead[field];
    return value === null || value === undefined || value === "";
  });
}

function hasAnyRequiredFieldFilled(lead: Lead) {
  return requiredFieldsForLead(lead).some((field) => {
    const value = lead[field];
    return value !== null && value !== undefined && value !== "";
  });
}

async function countUserMessages(conversationId: number) {
  const result = await pool.query<{ total: string }>(
    `
    SELECT COUNT(*)::text AS total
    FROM conversation_messages
    WHERE conversation_id = $1 AND role = 'user'
    `,
    [conversationId],
  );
  return Number(result.rows[0]?.total ?? "0");
}

async function buildContextSnippet(conversationId: number) {
  const result = await pool.query<{ content: string }>(
    `
    SELECT content
    FROM conversation_messages
    WHERE conversation_id = $1 AND role = 'user'
    ORDER BY id DESC
    LIMIT 2
    `,
    [conversationId],
  );

  return result.rows
    .map((item) => item.content.trim())
    .reverse()
    .join(" | ")
    .slice(0, 320);
}

function shouldStartDataCollection(message: string, userMessageCount: number, lead: Lead) {
  // Se clicou em "Tirar dúvida", atrasamos a coleta para ele fazer a pergunta.
  if (/tirar d[úu]vida/i.test(message)) return false;

  // Se já tiver preenchido algum campo, deve continuar coletando.
  if (hasAnyRequiredFieldFilled(lead)) return true;

  // Se já conversou 2 vezes ou pediu cotação direta, vamos coletar.
  if (userMessageCount > 1 || /cotar|cotacao|cotação|simular|proposta|contratar|fechar|orcamento|orçamento/i.test(message)) {
    return true;
  }
  
  return true;
}

function isClearlyOffTopic(message: string) {
  return /filme|série|serie|netflix|cinema|musica|música|jogo|game|receita|culinaria|culinária|horoscopo|horóscopo/i.test(
    message,
  );
}

function isSinistroIntent(message: string) {
  if (/seguradora|cobre|cobertura|pagar|indeniza|indeniza[cç][aã]o|ap[oó]lice|franquia|qualquer/i.test(message)) {
    return false;
  }

  return /sinistro|bati|bateram|colis[aã]o|roubo|furt[o]?|furtaram|roubaram|acidente|perda total|guincho urgente|capotei|ferid[oa]|v[ií]tima|socorro/i.test(
    message,
  );
}

function nextQuestionForLead(lead: Lead) {
  const missing = missingRequiredFields(lead);
  if (!missing.length) {
    if (!lead.email) {
      return QUESTION_BY_FIELD.email;
    }
    return null;
  }
  return QUESTION_BY_FIELD[missing[0]];
}

async function getAgentByCode(code: AgentCode) {
  const result = await pool.query<Agent>(
    `SELECT * FROM agents WHERE code = $1 AND active = true LIMIT 1`,
    [code],
  );
  return result.rows[0] || null;
}

async function getAgentById(id: number) {
  const result = await pool.query<Agent>(
    `SELECT * FROM agents WHERE id = $1 LIMIT 1`,
    [id],
  );
  return result.rows[0] || null;
}

async function routeLead(lead: Lead) {
  const missing = missingRequiredFields(lead);
  if (missing.length) {
    return {
      status: "MISSING_DATA" as const,
      assigned_agent: null,
      segment: lead.segment,
      flow: null,
      missing_fields: missing.map((field) => FIELD_LABELS[String(field)]),
      manual_review: false,
      reason: "Dados obrigatorios incompletos.",
    };
  }

  const segment = (lead.person_type || lead.segment) as Segment | null;
  if (!segment) {
    const fallbackAgent = await getAgentByCode("PJ-2");
    return {
      status: "OK" as const,
      assigned_agent: fallbackAgent?.code || "PJ-2",
      segment: "PJ" as const,
      flow: "Triagem especializada",
      missing_fields: [],
      manual_review: true,
      reason: "Segmento ambiguo. Roteamento de fallback para PJ-2.",
    };
  }

  let assignedCode: AgentCode;
  let flow = "";
  let manualReview = false;

  if (segment === "PF") {
    if (lead.renewal || lead.has_young_driver || lead.app_usage) {
      assignedCode = "PF-2";
      flow = "PF Renovacao e Perfil Sensivel";
    } else {
      assignedCode = "PF-1";
      flow = "PF Novo";
    }
  } else {
    if (lead.renewal || lead.special_condition) {
      assignedCode = "PJ-3";
      flow = "PJ Renovacao e Condicoes Especiais";
    } else if (lead.fleet_complexity === "media_ou_alta") {
      assignedCode = "PJ-2";
      flow = "PJ Frota Media/Alta Complexidade";
    } else {
      assignedCode = "PJ-1";
      flow = "PJ Frota Leve";
    }
  }

  const assignedAgent = await getAgentByCode(assignedCode);
  if (!assignedAgent) {
    const fallbackAgent = await getAgentByCode("PJ-2");
    assignedCode = fallbackAgent?.code || "PJ-2";
    flow = "Triagem especializada";
    manualReview = true;
  }

  return {
    status: "OK" as const,
    assigned_agent: assignedCode,
    segment,
    flow,
    missing_fields: [],
    manual_review: manualReview,
    reason: "Roteamento concluido com base nas regras da fase 1.",
  };
}

async function buildConversationSummary(conversationId: number) {
  const result = await pool.query<{ role: string; content: string }>(
    `
    SELECT role, content
    FROM conversation_messages
    WHERE conversation_id = $1
    ORDER BY id ASC
    `,
    [conversationId],
  );
  const messages = result.rows.slice(-12);
  return maskSensitiveText(messages.map((m) => `${m.role}: ${m.content}`).join("\n"));
}

async function buildConversationTranscript(conversationId: number) {
  const result = await pool.query<{ role: string; content: string; created_at: string }>(
    `
    SELECT role, content, TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
    FROM conversation_messages
    WHERE conversation_id = $1
    ORDER BY id ASC
    `,
    [conversationId],
  );

  return result.rows
    .map((message) => `[${message.created_at}] ${message.role}: ${message.content}`)
    .join("\n");
}

function smtpConfigured() {
  const host = process.env.SMTP_HOST?.trim();
  if (!host || host === "smtp.example.com") {
    return false;
  }

  return Boolean(
    host &&
      process.env.SMTP_PORT?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim() &&
      process.env.SMTP_FROM?.trim(),
  );
}

async function sendRoutingEmails(
  lead: Lead,
  assignedAgent: Agent | null,
  summary: string,
  transcript: string,
) {
  if (!smtpConfigured()) {
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const baseChecklist = [
    `Nome: ${lead.full_name ?? "-"}`,
    `CPF/CNPJ: ${maskCpfCnpj(lead.cpf_cnpj)}`,
    `Nascimento: ${lead.birth_date ?? "-"}`,
    `CEP: ${lead.cep ?? "-"}`,
    `Veiculo: ${lead.vehicle_model ?? "-"}`,
    `Ano: ${lead.vehicle_year ?? "-"}`,
    `Placa: ${maskPlate(lead.plate)}`,
    `Email: ${maskEmail(lead.email)}`,
    `Renovacao: ${lead.renewal === null ? "-" : lead.renewal ? "Sim" : "Nao"}`,
    `Uso app: ${lead.app_usage === null ? "-" : lead.app_usage ? "Sim" : "Nao"}`,
    `Condutor 18-25: ${
      lead.has_young_driver === null ? "-" : lead.has_young_driver ? "Sim" : "Nao"
    }`,
  ].join("\n");

  if (lead.email) {
    const leadMail = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: lead.email,
      subject: `Recebemos sua solicitacao de seguro auto - Protocolo ${lead.protocol}`,
      text: [
        `Ola ${lead.full_name ?? "cliente"},`,
        "",
        "Recebemos sua solicitacao e ja direcionamos para o fluxo adequado.",
        `Protocolo: ${lead.protocol}`,
        `Atendente: ${assignedAgent?.name ?? "Triagem especializada"}`,
        "",
        "Resumo da conversa:",
        summary || "Resumo indisponivel.",
        "",
        "Dados coletados:",
        baseChecklist,
        "",
        "A cotacao final depende da analise da seguradora.",
      ].join("\n"),
    });
    await pool.query(
      `
      INSERT INTO email_logs (lead_id, recipient_email, template_name, status, provider_id)
      VALUES ($1, $2, 'lead_summary', 'sent', $3)
      `,
      [lead.id, lead.email, leadMail.messageId],
    );
  }

  if (assignedAgent?.email) {
    const agentMail = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: assignedAgent.email,
      subject: `Novo lead roteado - ${assignedAgent.code} - ${lead.full_name ?? "Lead sem nome"}`,
      text: [
        `Segmento: ${lead.segment ?? lead.person_type ?? "-"}`,
        `Protocolo: ${lead.protocol}`,
        "",
        "Checklist:",
        baseChecklist,
        "",
        "Resumo IA:",
        summary || "Resumo indisponivel.",
        "",
        "Historico completo da conversa:",
        transcript || "Historico indisponivel.",
        "",
        "Alertas:",
        `- Renovacao: ${lead.renewal ? "Sim" : "Nao"}`,
        `- Uso App: ${lead.app_usage ? "Sim" : "Nao"}`,
        `- Condutor Jovem: ${lead.has_young_driver ? "Sim" : "Nao"}`,
      ].join("\n"),
    });

    await pool.query(
      `
      INSERT INTO email_logs (lead_id, recipient_email, template_name, status, provider_id)
      VALUES ($1, $2, 'agent_summary', 'sent', $3)
      `,
      [lead.id, assignedAgent.email, agentMail.messageId],
    );
  }
}

async function startServer() {
  await initDb();
  await initVectorStore();

  const app = express();
  const PORT = Number(process.env.PORT || 3000);
  const corsOrigins = (process.env.CORS_ORIGIN || "http://localhost:8080")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(cors({
    origin(origin, callback) {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
  }));
  app.use(express.json());
  app.use("/api/chat", chatRateLimit);

  app.get("/api/health", async (_req, res) => {
    const dbOk = await pool
      .query("SELECT 1")
      .then(() => true)
      .catch(() => false);
    res.json({
      status: "ok",
      db: dbOk ? "up" : "down",
      llm: llm ? "gemini" : "fallback",
    });
  });

  app.post("/api/settings/apikey", async (req, res) => {
    const { apiKey } = req.body;
    if (!apiKey) {
      res.status(400).json({ error: "Chave nao informada" });
      return;
    }
    
    try {
      if (process.env.GEMINI_API_KEY_FILE) {
        fs.writeFileSync(process.env.GEMINI_API_KEY_FILE, apiKey.trim(), "utf-8");
      } else {
        process.env.GEMINI_API_KEY = apiKey.trim();
      }
      reloadGeminiLLM(apiKey.trim());
      res.json({ success: true });
    } catch (err) {
      console.error("Erro ao salvar api key:", err);
      res.status(500).json({ error: "Erro ao salvar a chave no servidor" });
    }
  });

  app.get("/api/agents", requireAdmin, async (_req, res) => {
    const result = await pool.query<Agent>(`SELECT * FROM agents ORDER BY code ASC`);
    res.json(result.rows);
  });

  app.post("/api/agents", requireAdmin, async (req, res) => {
    const { code, name, email, segment, flowType, active } = req.body;
    if (!code || !name || !email || !segment || !flowType) {
      res.status(400).json({ error: "Campos obrigatorios: code, name, email, segment, flowType." });
      return;
    }

    try {
      const result = await pool.query<Agent>(
        `
        INSERT INTO agents (code, name, email, segment, flow_type, active)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `,
        [code, name, email, segment, flowType, active ?? true],
      );
      res.status(201).json(result.rows[0]);
    } catch (error: unknown) {
      const pgError = error as { code?: string };
      if (pgError.code === "23505") {
        res.status(409).json({ error: "Codigo de atendente ja cadastrado. Use edicao para atualizar." });
        return;
      }
      res.status(500).json({ error: "Erro ao cadastrar atendente." });
    }
  });

  app.put("/api/agents/:id", requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const { name, email, segment, flowType, active } = req.body;
    if (!id) {
      res.status(400).json({ error: "ID invalido." });
      return;
    }
    const result = await pool.query<Agent>(
      `
      UPDATE agents
      SET name = $1, email = $2, segment = $3, flow_type = $4, active = $5
      WHERE id = $6
      RETURNING *
      `,
      [name, email, segment, flowType, active, id],
    );
    if (!result.rows[0]) {
      res.status(404).json({ error: "Atendente nao encontrado." });
      return;
    }
    res.json(result.rows[0]);
  });

  app.patch("/api/agents/:id/active", requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const { active } = req.body;
    const result = await pool.query<Agent>(
      `
      UPDATE agents
      SET active = $1
      WHERE id = $2
      RETURNING *
      `,
      [Boolean(active), id],
    );
    if (!result.rows[0]) {
      res.status(404).json({ error: "Atendente nao encontrado." });
      return;
    }
    res.json(result.rows[0]);
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    const conversationId = Number(req.params.id);
    const token = String(req.query.token || "");
    if (!conversationId || !token) {
      res.status(401).json({ error: "Token da conversa obrigatorio." });
      return;
    }

    const conversation = await getConversationById(conversationId);
    if (!conversation?.access_token || conversation.access_token !== token) {
      res.status(403).json({ error: "Historico nao autorizado." });
      return;
    }

    const result = await pool.query<{ role: "user" | "assistant" | "system"; content: string; created_at: string }>(
      `
      SELECT role, content, created_at
      FROM conversation_messages
      WHERE conversation_id = $1
      ORDER BY id ASC
      `,
      [conversationId],
    );

    res.json({
      conversationId,
      messages: result.rows.map((message) => ({
        ...message,
        content: maskSensitiveText(message.content),
      })),
    });
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { message, leadId, conversationId, conversationToken } = req.body as {
        message: string;
        leadId?: number;
        conversationId?: number;
        conversationToken?: string;
      };

      if (!message || !message.trim()) {
        res.status(400).json({ error: "Mensagem obrigatoria." });
        return;
      }

      let currentLead: Lead | null = null;
      let currentConversationId = conversationId;
      let currentConversationToken: string | null = null;

      if (!leadId || !conversationId) {
        const created = await createLeadAndConversation();
        currentLead = created.lead;
        currentConversationId = created.conversationId;
        currentConversationToken = created.conversationToken;
      } else {
        currentLead = await getLeadById(leadId);
        const conversation = await getConversationById(conversationId);
        if (!conversation || conversation.lead_id !== leadId) {
          res.status(403).json({ error: "Conversa nao pertence ao lead informado." });
          return;
        }
        if (conversationToken && conversation.access_token && conversationToken !== conversation.access_token) {
          res.status(403).json({ error: "Token da conversa invalido." });
          return;
        }
        currentConversationToken = conversation.access_token;
      }

      if (!currentLead || !currentConversationId) {
        res.status(404).json({ error: "Lead ou conversa nao encontrado." });
        return;
      }

      await insertConversationMessage(currentConversationId, "user", message.trim());

      if (isSinistroIntent(message)) {
        await pool.query(
          `
          UPDATE leads
          SET status = 'in_human_service', updated_at = NOW()
          WHERE id = $1
          `,
          [currentLead.id],
        );

        const sinistroText = await buildAssistantText({
          stage: "sinistro_handoff",
          offTopic: false,
          collectingTransition: false,
          faqAnswer: null,
          missing: [],
          question: null,
          contextSnippet: "",
          assigned: null,
          protocol: currentLead.protocol,
          isRouted: false,
          includeIntro: false,
        });

        await insertConversationMessage(currentConversationId, "assistant", sinistroText);

        res.json({
          text: sinistroText,
          leadId: currentLead.id,
          conversationId: currentConversationId,
          protocol: currentLead.protocol,
          conversationToken: currentConversationToken,
          status: "HUMAN_HANDOFF",
          assignedAgent: null,
          missingFields: [],
        });
        return;
      }

      if (currentLead.status === "routed_to_agent" && currentLead.assigned_agent_id) {
        const assignedAgent = await getAgentById(currentLead.assigned_agent_id);
        const assigned = assignedAgent
          ? `${assignedAgent.code} (${assignedAgent.name})`
          : "equipe especializada";
        const routedText = await buildAssistantText({
          stage: "routed",
          offTopic: false,
          collectingTransition: false,
          faqAnswer: null,
          missing: [],
          question: null,
          contextSnippet: "",
          assigned,
          protocol: currentLead.protocol,
          isRouted: true,
          includeIntro: false,
          fullName: currentLead.full_name,
        });

        await insertConversationMessage(currentConversationId, "assistant", routedText);

        res.json({
          text: routedText,
          leadId: currentLead.id,
          conversationId: currentConversationId,
          protocol: currentLead.protocol,
          conversationToken: currentConversationToken,
          status: "ROUTED",
          assignedAgent: assignedAgent?.code ?? null,
          missingFields: [],
        });
        return;
      }

      const lastAskedField = missingRequiredFields(currentLead)[0];
      const extracted = await extractLeadData(message, currentLead, lastAskedField);
      if (extracted.person_type && !extracted.segment) {
        extracted.segment = extracted.person_type;
      }

      const updatedLead = await updateLead(currentLead, extracted);
      const userMessageCount = await countUserMessages(currentConversationId);
      const contextSnippet = await buildContextSnippet(currentConversationId);
      const offTopic = isClearlyOffTopic(message);

      const startDataCollection =
        updatedLead.status === "collecting_data" ||
        (!offTopic && shouldStartDataCollection(message, userMessageCount, updatedLead));
      const transitionedToCollecting =
        startDataCollection && updatedLead.status === "listening";

      if (!startDataCollection && updatedLead.status !== "listening") {
        await pool.query(
          `
          UPDATE leads
          SET status = 'listening', updated_at = NOW()
          WHERE id = $1
          `,
          [updatedLead.id],
        );
      }

      if (startDataCollection && updatedLead.status === "listening") {
        await pool.query(
          `
          UPDATE leads
          SET status = 'collecting_data', updated_at = NOW()
          WHERE id = $1
          `,
          [updatedLead.id],
        );
      }

      const routing = startDataCollection ? await routeLead(updatedLead) : {
        status: "MISSING_DATA" as const,
        assigned_agent: null,
        segment: updatedLead.segment,
        flow: null,
        missing_fields: missingRequiredFields(updatedLead).map((field) => FIELD_LABELS[String(field)]),
        manual_review: false,
        reason: "Etapa de escuta ativa antes da coleta completa.",
      };

      let finalLead = updatedLead;
      let assignedAgent: Agent | null = null;
      let routedNow = false;

      if (routing.status === "OK" && routing.assigned_agent) {
        assignedAgent = await getAgentByCode(routing.assigned_agent);
        if (assignedAgent && !updatedLead.assigned_agent_id) {
          const routed = await pool.query<Lead>(
            `
            UPDATE leads
            SET assigned_agent_id = $1, status = 'routed_to_agent', updated_at = NOW()
            WHERE id = $2
            RETURNING *
            `,
            [assignedAgent.id, updatedLead.id],
          );
          finalLead = routed.rows[0];
          routedNow = true;
        }
      }

      const knowledgeAnswer = offTopic ? null : await detectControlledKnowledgeAnswer(message);
      const faqAnswer = knowledgeAnswer ? formatControlledAnswer(knowledgeAnswer) : null;
      const safeContextSnippet = knowledgeAnswer ? "" : contextSnippet;
      const missing = missingRequiredFields(finalLead);
      const question = nextQuestionForLead(finalLead);

      let assistantText = "";
      if (!missing.length && finalLead.assigned_agent_id) {
        const assigned = assignedAgent
          ? `${assignedAgent.code} (${assignedAgent.name})`
          : "fluxo especializado";
        assistantText = await buildAssistantText({
          stage: "routed",
          offTopic: false,
          collectingTransition: false,
          faqAnswer,
          missing,
          question,
          contextSnippet: safeContextSnippet,
          assigned,
          protocol: finalLead.protocol,
          isRouted: routedNow,
          includeIntro: transitionedToCollecting,
          fullName: finalLead.full_name,
        });
      } else {
        const stage = startDataCollection ? "collecting" : "listening";
        assistantText = await buildAssistantText({
          stage,
          offTopic,
          collectingTransition: stage === "collecting" ? transitionedToCollecting : false,
          faqAnswer,
          missing,
          question: stage === "collecting" ? question : null,
          contextSnippet: safeContextSnippet,
          assigned: null,
          protocol: finalLead.protocol,
          isRouted: false,
          includeIntro: false,
          fullName: finalLead.full_name,
        });
      }

      await insertConversationMessage(currentConversationId, "assistant", assistantText);
      if (knowledgeAnswer) {
        await insertKnowledgeAnswerLog(currentConversationId, finalLead.id, knowledgeAnswer);
      }

      if (routedNow) {
        const summary = await buildConversationSummary(currentConversationId);
        const transcript = await buildConversationTranscript(currentConversationId);
        try {
          await sendRoutingEmails(finalLead, assignedAgent, summary, transcript);
        } catch (emailError) {
          console.error("Email delivery error:", emailError);
          if (finalLead.email) {
            await pool.query(
              `
              INSERT INTO email_logs (lead_id, recipient_email, template_name, status, provider_id)
              VALUES ($1, $2, 'routing_notification', 'failed', NULL)
              `,
              [finalLead.id, finalLead.email],
            );
          }
        }
      }

      res.json({
        text: assistantText,
        leadId: finalLead.id,
        conversationId: currentConversationId,
        protocol: finalLead.protocol,
        conversationToken: currentConversationToken,
        status: routing.status,
        assignedAgent: routing.assigned_agent,
        missingFields: missing.map((field) => FIELD_LABELS[String(field)]),
        knowledgeSource: knowledgeAnswer
          ? {
              topic: knowledgeAnswer.topic,
              source: knowledgeAnswer.source,
              sourcePath: knowledgeAnswer.sourcePath,
              mode: knowledgeAnswer.mode,
            }
          : null,
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Erro ao processar a conversa de triagem." });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Erro ao iniciar o servidor:", error);
  process.exit(1);
});
