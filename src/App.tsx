import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Car, 
  ShieldCheck, 
  MessageSquare, 
  Send, 
  Zap, 
  User, 
  Clock, 
  Menu, 
  X,
  CreditCard,
  PhoneCall,
  Info,
  Users,
  Save,
  PlusCircle,
  RotateCcw
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';
import heroCarImage from './assets/images/hero_car_1779023796469.png';
import logoImage from './assets/images/logo.png';
import liaAvatar from './assets/images/lia_avatar.png';
import userAvatar from './assets/images/user_avatar.png';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface StoredChatSession {
  messages: Message[];
  leadId: number | null;
  conversationId: number | null;
  conversationToken: string | null;
  protocol: string | null;
}

interface Agent {
  id: number;
  code: 'PF-1' | 'PF-2' | 'PJ-1' | 'PJ-2' | 'PJ-3';
  name: string;
  email: string;
  segment: 'PF' | 'PJ';
  flow_type: string;
  active: boolean;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
const CHAT_STORAGE_KEY = 'seguroauto-ai-chat-session';
const ADMIN_KEY_STORAGE_KEY = 'seguroauto-ai-admin-key';
const INITIAL_ASSISTANT_MESSAGE = 'Olá! Eu sou a Lia, consultora virtual da SeguroAuto AI. Estou aqui para tornar o seu dia um pouco mais fácil e resolver tudo sobre o seu seguro.\n\nPara começarmos uma conversa melhor, como você gostaria que eu te chamasse?';

const initialMessages = (): Message[] => [
  { role: 'assistant', content: INITIAL_ASSISTANT_MESSAGE },
];

const loadStoredChatSession = (): StoredChatSession => {
  if (typeof window === 'undefined') {
    return { messages: initialMessages(), leadId: null, conversationId: null, conversationToken: null, protocol: null };
  }

  try {
    const raw = window.localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) {
      return { messages: initialMessages(), leadId: null, conversationId: null, conversationToken: null, protocol: null };
    }

    const parsed = JSON.parse(raw) as Partial<StoredChatSession>;
    const messages = Array.isArray(parsed.messages) && parsed.messages.length
      ? parsed.messages.filter((message): message is Message =>
          (message?.role === 'user' || message?.role === 'assistant') &&
          typeof message.content === 'string'
        )
      : initialMessages();

    return {
      messages: messages.length ? messages : initialMessages(),
      leadId: typeof parsed.leadId === 'number' ? parsed.leadId : null,
      conversationId: typeof parsed.conversationId === 'number' ? parsed.conversationId : null,
      conversationToken: typeof parsed.conversationToken === 'string' ? parsed.conversationToken : null,
      protocol: typeof parsed.protocol === 'string' ? parsed.protocol : null,
    };
  } catch {
    return { messages: initialMessages(), leadId: null, conversationId: null, conversationToken: null, protocol: null };
  }
};

const loadStoredAdminKey = () => {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(ADMIN_KEY_STORAGE_KEY) ?? '';
};

const splitAssistantText = (text: string) => text
  .split(/\n+/)
  .map((chunk) => chunk.trim())
  .filter(Boolean);

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const typingDelayFor = (text: string) => Math.min(1000, Math.max(350, text.length * 10));

const inferQuickReplies = (text: string): string[] => {
  if (/Pessoa F[ií]sica.*Pessoa Jur[ií]dica|PF.*PJ/i.test(text)) {
    return ['PF', 'PJ'];
  }
  if (/sim ou n[aã]o|\(sim ou n[aã]o\)|\?$/.test(text) && /(renova|garagem|trabalho|app|condutor|condi[cç][aã]o especial)/i.test(text)) {
    return ['Sim', 'Não'];
  }
  if (/principal d[uú]vida|seguro auto hoje|entender seu cen[aá]rio|como voc[eê] gostaria que eu te chamasse/i.test(text)) {
    return ['Fazer cotação', 'Tirar dúvida', 'Sinistro ou assistência'];
  }
  return [];
};

export default function App() {
  const [initialSession] = useState(loadStoredChatSession);
  const [activeView, setActiveView] = useState<'chat' | 'agents'>('chat');
  const [messages, setMessages] = useState<Message[]>(initialSession.messages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [leadId, setLeadId] = useState<number | null>(initialSession.leadId);
  const [conversationId, setConversationId] = useState<number | null>(initialSession.conversationId);
  const [conversationToken, setConversationToken] = useState<string | null>(initialSession.conversationToken);
  const [protocol, setProtocol] = useState<string | null>(initialSession.protocol);
  const [quickReplies, setQuickReplies] = useState<string[]>(() => {
    const lastAssistant = [...initialSession.messages].reverse().find((message) => message.role === 'assistant');
    return inferQuickReplies(lastAssistant?.content ?? INITIAL_ASSISTANT_MESSAGE);
  });

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [agentsError, setAgentsError] = useState<string | null>(null);
  const [agentsSuccess, setAgentsSuccess] = useState<string | null>(null);
  const [adminApiKey, setAdminApiKey] = useState(loadStoredAdminKey);
  const [selectedSegment, setSelectedSegment] = useState<'PF' | 'PJ'>('PF');
  const [agentDraft, setAgentDraft] = useState({
    code: 'PF-1' as Agent['code'],
    name: '',
    email: '',
    segment: 'PF' as Agent['segment'],
    flowType: '',
    active: true,
  });

  const [llmStatus, setLlmStatus] = useState<'gemini' | 'fallback' | 'checking'>('checking');
  const [geminiApiKeyInput, setGeminiApiKeyInput] = useState('');
  const [savingKey, setSavingKey] = useState(false);

  const checkHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/health`);
      const data = await res.json();
      setLlmStatus(data.llm);
    } catch {
      setLlmStatus('fallback');
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const saveApiKey = async () => {
    if (!geminiApiKeyInput.trim()) return;
    setSavingKey(true);
    try {
      const res = await fetch(`${API_BASE}/api/settings/apikey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: geminiApiKeyInput }),
      });
      if (res.ok) {
        await checkHealth();
        setGeminiApiKeyInput('');
      }
    } catch {
      // ignore
    } finally {
      setSavingKey(false);
    }
  };

  const chatEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    const el = messagesContainerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({
      messages,
      leadId,
      conversationId,
      conversationToken,
      protocol,
      updatedAt: new Date().toISOString(),
    }));
  }, [messages, leadId, conversationId, conversationToken, protocol]);

  useEffect(() => {
    window.localStorage.setItem(ADMIN_KEY_STORAGE_KEY, adminApiKey);
  }, [adminApiKey]);

  const adminHeaders = () => ({
    'Content-Type': 'application/json',
    ...(adminApiKey.trim() ? { 'x-admin-api-key': adminApiKey.trim() } : {}),
  });

  const loadAgents = async () => {
    setLoadingAgents(true);
    setAgentsError(null);
    try {
      const response = await fetch(`${API_BASE}/api/agents`, {
        headers: adminHeaders(),
      });
      if (!response.ok) {
        throw new Error(response.status === 401 ? 'Chave administrativa inválida.' : 'Nao foi possivel carregar os atendentes.');
      }
      const data = await response.json();
      setAgents(data);
    } catch {
      setAgents([]);
      setAgentsError('Nao foi possivel carregar os atendentes.');
    } finally {
      setLoadingAgents(false);
    }
  };

  useEffect(() => {
    if (activeView === 'agents') {
      loadAgents();
    }
  }, [activeView]);

  const appendAssistantText = async (text: string) => {
    const chunks = splitAssistantText(text);
    const safeChunks = chunks.length ? chunks : ['Desculpe, tive um problema técnico. Pode repetir?'];
    for (const chunk of safeChunks) {
      setIsTyping(true);
      await wait(typingDelayFor(chunk));
      setMessages(prev => [...prev, { role: 'assistant', content: chunk }]);
    }
  };

  const sendMessage = async (userMessage: string) => {
    const trimmed = userMessage.trim();
    if (!trimmed || isTyping) return;

    setInput('');
    setQuickReplies([]);
    setMessages(prev => [...prev, { role: 'user', content: trimmed }]);
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, leadId, conversationId, conversationToken }),
      });

      const data = await response.json();
      if (data.leadId) {
        setLeadId(data.leadId);
      }
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }
      if (data.conversationToken) {
        setConversationToken(data.conversationToken);
      }
      if (data.protocol) {
        setProtocol(data.protocol);
      }

      const assistantText = data.text || 'Desculpe, tive um problema técnico. Pode repetir?';
      await appendAssistantText(assistantText);
      setQuickReplies(inferQuickReplies(assistantText));
    } catch (error) {
      const errorText = 'Erro de conexão. Verifique sua internet.';
      await appendAssistantText(errorText);
      setQuickReplies([]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = () => {
    void sendMessage(input);
  };

  const handleQuickReply = (reply: string) => {
    void sendMessage(reply);
  };

  const resetChat = () => {
    const messages = initialMessages();
    setMessages(messages);
    setLeadId(null);
    setConversationId(null);
    setConversationToken(null);
    setProtocol(null);
    setInput('');
    setQuickReplies(inferQuickReplies(INITIAL_ASSISTANT_MESSAGE));
    window.localStorage.removeItem(CHAT_STORAGE_KEY);
  };

  const handleCreateAgent = async () => {
    setAgentsError(null);
    setAgentsSuccess(null);

    if (!agentDraft.name.trim() || !agentDraft.email.trim() || !agentDraft.flowType.trim()) {
      setAgentsError('Preencha nome, email e fluxo do profissional.');
      return;
    }

    const existingByCode = agents.find((agent) => agent.code === agentDraft.code);
    const method = existingByCode ? 'PUT' : 'POST';
    const endpoint = existingByCode
      ? `${API_BASE}/api/agents/${existingByCode.id}`
      : `${API_BASE}/api/agents`;

    try {
      const response = await fetch(endpoint, {
        method,
        headers: adminHeaders(),
        body: JSON.stringify(agentDraft),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        throw new Error(errorPayload?.error || 'Falha ao salvar atendente.');
      }

      setAgentsSuccess(existingByCode ? 'Atendente atualizado com sucesso.' : 'Atendente cadastrado com sucesso.');
      setAgentDraft({
        code: selectedSegment === 'PF' ? 'PF-1' : 'PJ-1',
        name: '',
        email: '',
        segment: selectedSegment,
        flowType: '',
        active: true,
      });
      await loadAgents();
    } catch (error) {
      setAgentsError(error instanceof Error ? error.message : 'Falha ao salvar atendente.');
    }
  };

  const handleToggleAgent = async (agent: Agent) => {
    try {
      await fetch(`${API_BASE}/api/agents/${agent.id}/active`, {
        method: 'PATCH',
        headers: adminHeaders(),
        body: JSON.stringify({ active: !agent.active }),
      });
      await loadAgents();
    } catch {
      // Sem acao adicional, mantendo UI responsiva.
    }
  };

  const pfCodes: Agent['code'][] = ['PF-1', 'PF-2'];
  const pjCodes: Agent['code'][] = ['PJ-1', 'PJ-2', 'PJ-3'];

  const availableCodes = selectedSegment === 'PF' ? pfCodes : pjCodes;

  useEffect(() => {
    if (!availableCodes.includes(agentDraft.code)) {
      setAgentDraft((prev) => ({
        ...prev,
        segment: selectedSegment,
        code: availableCodes[0],
      }));
    }
  }, [selectedSegment]);

  const segmentedAgents = agents.filter((agent) => agent.segment === selectedSegment);

  const handleSelectAgentForEdit = (agent: Agent) => {
    setSelectedSegment(agent.segment);
    setAgentDraft({
      code: agent.code,
      name: agent.name,
      email: agent.email,
      segment: agent.segment,
      flowType: agent.flow_type,
      active: agent.active,
    });
    setAgentsSuccess(`Editando ${agent.code}. Altere os dados e clique em salvar.`);
    setAgentsError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
              <img src={logoImage} alt="SeguroAuto AI Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold font-display text-slate-100 tracking-tight">
              SeguroAuto <span className="text-brand-secondary">AI</span>
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button onClick={() => setActiveView('chat')} className={cn("hover:text-brand-primary transition-colors", activeView === 'chat' && "text-brand-primary")}>Assistente</button>
            <button onClick={() => setActiveView('agents')} className={cn("hover:text-brand-primary transition-colors", activeView === 'agents' && "text-brand-primary")}>Atendentes</button>
            <button className="bg-brand-primary text-white px-5 py-2 rounded-full hover:bg-brand-primary/90 transition-all shadow-md active:scale-95">
              Área do Cliente
            </button>
          </nav>

          <button className="md:hidden text-slate-600">
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16 flex flex-col md:flex-row max-w-7xl mx-auto w-full relative overflow-hidden">
        
        {/* Left Panel: Info & Marketing */}
        <section className="flex-1 p-6 md:p-12 flex flex-col justify-center overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-brand-secondary rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              <Zap size={14} />
              {activeView === 'chat' ? 'Seguro Inteligente em Minutos' : 'Operacao de Atendentes'}
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-100 leading-[1.1] mb-6">
              {activeView === 'chat' ? (
                <>
                  Proteção real para quem <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">vive intensamente.</span>
                </>
              ) : (
                <>
                  Configure os <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">5 fluxos de atendimento.</span>
                </>
              )}
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-lg leading-relaxed">
              {activeView === 'chat'
                ? 'Diga adeus à burocracia. Nosso agente de IA encontra a cobertura perfeita para você e seu veículo em segundos.'
                : 'Cadastre e mantenha os atendentes PF e PJ para o roteamento automatico dos leads da triagem.'}
            </p>

            {activeView === 'chat' ? (
              <>
                <div className="relative w-full aspect-video rounded-3xl overflow-hidden mb-12 shadow-2xl group">
                  <img 
                    src={heroCarImage}
                    alt="Modern Car" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  {[
                    { icon: <Car />, title: "Cotação Instantânea", desc: "IA treinada no mercado brasileiro." },
                    { icon: <Clock />, title: "Suporte 24/7", desc: "Estamos aqui sempre que precisar." },
                    { icon: <CreditCard />, title: "Preço Justo", desc: "Pague apenas pelo que você usa." },
                    { icon: <PhoneCall />, title: "Assistência Rápida", desc: "Guincho e reparos em um toque." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 shadow-sm">
                      <div className="text-brand-secondary shrink-0">{item.icon}</div>
                      <div>
                        <h3 className="font-bold text-slate-100">{item.title}</h3>
                        <p className="text-sm text-slate-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-3xl border border-slate-700 bg-slate-800 p-6 shadow-xl">
                <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2 mb-6">
                  <Users size={22} className="text-brand-secondary" /> Cadastro de Atendentes
                </h2>

                <div className="mb-5">
                  <label className="block text-xs font-semibold text-slate-400 mb-2">
                    Chave administrativa
                  </label>
                  <input
                    value={adminApiKey}
                    onChange={(e) => setAdminApiKey(e.target.value)}
                    type="password"
                    placeholder="Informe a ADMIN_API_KEY"
                    className="w-full border border-slate-600 bg-slate-900 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div className="flex gap-2 mb-5">
                  <button
                    onClick={() => setSelectedSegment('PF')}
                    className={cn(
                      'px-4 py-2 rounded-xl text-sm font-semibold border',
                      selectedSegment === 'PF'
                        ? 'bg-brand-primary text-white border-brand-primary'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-700 transition-colors'
                    )}
                  >
                    Pessoa Fisica (PF)
                  </button>
                  <button
                    onClick={() => setSelectedSegment('PJ')}
                    className={cn(
                      'px-4 py-2 rounded-xl text-sm font-semibold border',
                      selectedSegment === 'PJ'
                        ? 'bg-brand-primary text-white border-brand-primary'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-700 transition-colors'
                    )}
                  >
                    Pessoa Juridica (PJ)
                  </button>
                </div>

                {agentsError && <p className="mb-4 rounded-xl bg-red-50 text-red-700 px-3 py-2 text-sm">{agentsError}</p>}
                {agentsSuccess && <p className="mb-4 rounded-xl bg-green-50 text-green-700 px-3 py-2 text-sm">{agentsSuccess}</p>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <input value={agentDraft.name} onChange={(e) => setAgentDraft(prev => ({ ...prev, name: e.target.value }))} placeholder="Nome" className="border border-slate-200 rounded-xl p-3" />
                  <input value={agentDraft.email} onChange={(e) => setAgentDraft(prev => ({ ...prev, email: e.target.value }))} placeholder="Email" className="border border-slate-200 rounded-xl p-3" />
                  <select
                    value={agentDraft.code}
                    onChange={(e) => setAgentDraft(prev => ({ ...prev, code: e.target.value as Agent['code'], segment: selectedSegment }))}
                    className="border border-slate-200 rounded-xl p-3"
                  >
                    {availableCodes.map((code) => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                  </select>
                  <input value={selectedSegment} readOnly className="border border-slate-200 rounded-xl p-3 bg-slate-100 text-slate-600" />
                  <input value={agentDraft.flowType} onChange={(e) => setAgentDraft(prev => ({ ...prev, flowType: e.target.value }))} placeholder="Fluxo" className="border border-slate-200 rounded-xl p-3 md:col-span-2" />
                </div>

                <button onClick={handleCreateAgent} className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-3 text-white font-medium hover:bg-brand-primary/90">
                  <PlusCircle size={16} /> Salvar profissional
                </button>

                <div className="mt-8 space-y-3 max-h-[320px] overflow-auto pr-2">
                  {loadingAgents && <p className="text-slate-500">Carregando atendentes...</p>}
                  {!loadingAgents && segmentedAgents.map(agent => (
                    <div key={agent.id} className="rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{agent.code} - {agent.name}</p>
                        <p className="text-sm text-slate-500">{agent.email} • {agent.segment} • {agent.flow_type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSelectAgentForEdit(agent)}
                          className="rounded-xl px-3 py-2 text-sm font-medium bg-slate-100 text-slate-700"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleToggleAgent(agent)}
                          className={cn(
                            "rounded-xl px-3 py-2 text-sm font-medium",
                            agent.active ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-700"
                          )}
                        >
                          <Save size={14} className="inline mr-1" /> {agent.active ? 'Ativo' : 'Inativo'}
                        </button>
                      </div>
                    </div>
                  ))}
                  {!loadingAgents && segmentedAgents.length === 0 && (
                    <p className="text-slate-500">Nenhum profissional cadastrado para {selectedSegment}.</p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </section>

        {/* Right Panel: AI Chat Agent */}
        {activeView === 'chat' && <aside className={cn(
          "w-full md:w-[450px] bg-slate-800/80 backdrop-blur-xl border-l border-slate-700 flex flex-col h-[calc(100vh-64px)] fixed inset-y-16 right-0 transition-transform duration-300 md:relative md:inset-0 md:translate-x-0 z-40 shadow-2xl shadow-black/50 md:shadow-none",
          showMobileChat ? "translate-x-0" : "translate-x-full"
        )}>
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-slate-800/90">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center overflow-hidden">
                  <img src={liaAvatar} alt="Lia Avatar" className="w-full h-full object-cover scale-110" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-800 rounded-full"></div>
              </div>
              <div className="text-left">
                <h2 className="font-bold text-slate-100 leading-none">Lia - SeguroAuto AI</h2>
                <span className="text-xs text-green-600 font-medium tracking-wide">Online agora {protocol ? `• Protocolo ${protocol}` : ''}</span>
              </div>
            </div>
            <button 
              className="md:hidden p-2 text-slate-400 hover:text-slate-600"
              onClick={() => setShowMobileChat(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex items-end gap-2 max-w-[92%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "w-8 h-8 shrink-0 rounded-full flex items-center justify-center overflow-hidden border",
                  msg.role === 'user'
                    ? "border-brand-primary/50 shadow-sm"
                    : "border-slate-600 shadow-sm"
                )}>
                  {msg.role === 'user' ? <img src={userAvatar} alt="User" className="w-full h-full object-cover scale-110" /> : <img src={liaAvatar} alt="Lia" className="w-full h-full object-cover scale-110" />}
                </div>
                <div className={cn("flex flex-col max-w-[calc(100%-2.5rem)]", msg.role === 'user' ? "items-end" : "items-start")}>
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed text-left",
                    msg.role === 'user' 
                      ? "bg-brand-primary text-white rounded-tr-none shadow-md shadow-brand-primary/20"
                      : "bg-slate-700/80 text-slate-100 rounded-tl-none border border-slate-600 shadow-sm"
                  )}>
                    <div className="markdown-body">
                      <ReactMarkdown>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                  <span className={cn(
                    "text-[10px] text-slate-400 mt-1 px-1",
                    msg.role === 'user' ? "text-right" : "text-left"
                  )}>
                    {msg.role === 'user' ? 'Você' : 'Lia - assistente virtual'} • Agora
                  </span>
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <div className="flex items-center gap-2 p-2 mr-auto">
                <div className="w-8 h-8 rounded-full bg-transparent border border-slate-600 flex items-center justify-center shadow-sm overflow-hidden">
                  <img src={liaAvatar} alt="Lia" className="w-full h-full object-cover scale-110" />
                </div>
                <div className="flex gap-1 px-4 py-3 bg-slate-700/80 border border-slate-600 rounded-2xl rounded-tl-none shadow-sm">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-slate-300 rounded-full" />
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-slate-300 rounded-full" />
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-slate-300 rounded-full" />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-700 bg-slate-800/95">
            {quickReplies.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    type="button"
                    onClick={() => handleQuickReply(reply)}
                    disabled={isTyping}
                    className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-600 bg-slate-800 text-slate-300 hover:border-brand-primary/50 hover:text-white transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}
            <div className="relative group">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!isTyping && input.trim()) handleSendMessage();
                  }
                }}
                placeholder="Pergunte sobre coberturas, preços..."
                rows={2}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-2xl py-3 pl-4 pr-12 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all placeholder:text-slate-500 resize-none scrollbar-hide"
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isTyping}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-brand-primary text-white rounded-xl flex items-center justify-center hover:bg-brand-primary/90 transition-all disabled:opacity-50 disabled:grayscale active:scale-95 shadow-md shadow-brand-primary/20"
              >
                <Send size={18} />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <Info size={10} /> Assistente virtual. Não informe dados desnecessários. Usamos suas informações para triagem e contato sobre seguro auto.
              </p>
              <button
                type="button"
                onClick={resetChat}
                className="shrink-0 inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 hover:text-brand-primary transition-colors"
              >
                <RotateCcw size={11} /> Nova conversa
              </button>
            </div>
          </div>
        </aside>}

        {/* Mobile Toggle Button */}
        {activeView === 'chat' && !showMobileChat && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => setShowMobileChat(true)}
            className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-brand-primary text-white rounded-full flex items-center justify-center shadow-2xl z-50"
          >
            <MessageSquare size={24} />
          </motion.button>
        )}
      </main>

      {/* Footer (Simplified) */}
      <footer className="bg-slate-900 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
              <img src={logoImage} alt="SeguroAuto AI Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-white font-display font-bold">SeguroAuto AI</span>
          </div>
          <div className="flex gap-8 text-slate-500 text-sm">
            <a href="#" className="hover:text-white transition-colors">Termos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">SAC</a>
          </div>
          <p className="text-slate-600 text-xs text-center md:text-right">
            © 2024 SeguroAuto AI Brasil Ltd. <br className="hidden md:block" />
            CNPJ 00.123.456/0001-00
          </p>
        </div>
      </footer>

      {/* API Key Modal */}
      {llmStatus === 'fallback' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="text-brand-secondary" size={28} />
              <h3 className="text-2xl font-bold text-slate-100">Configure a IA</h3>
            </div>
            <p className="text-slate-300 mb-6 leading-relaxed text-sm">
              Para conversar comigo, você precisa fornecer uma chave da API do Google Gemini.
              Se você não tiver uma, pode criar gratuitamente no <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-brand-primary font-bold hover:underline">Google AI Studio</a>.
            </p>
            <input
              type="password"
              placeholder="Cole sua API Key aqui..."
              value={geminiApiKeyInput}
              onChange={(e) => setGeminiApiKeyInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-xl py-3 px-4 text-slate-100 mb-6 focus:outline-none focus:border-brand-primary"
            />
            <button
              onClick={saveApiKey}
              disabled={savingKey || !geminiApiKeyInput.trim()}
              className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
            >
              {savingKey ? 'Salvando e Conectando...' : 'Salvar Chave e Iniciar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
