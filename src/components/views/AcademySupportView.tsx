import React, { useState } from 'react';
import {
  GraduationCap,
  Play,
  CheckCircle2,
  Smartphone,
  Headphones,
  Send,
  MessageSquare,
  ShieldCheck,
  Download,
  Check,
  Clock,
  Sparkles,
  HelpCircle,
  ExternalLink,
  Monitor,
  Laptop,
  Apple,
  Copy,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import { PWAInstallButton } from '../PWAInstallButton';

export const AcademySupportView: React.FC = () => {
  const { videoClasses, toggleVideoCompleted, supportTickets, addSupportMessage, createSupportTicket, settings } =
    useWork();

  const [activeTab, setActiveTab] = useState<'classes' | 'mobile_app' | 'vip_support'>('classes');

  // Video modal player
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  // New ticket state
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState('duvida');
  const [newMessage, setNewMessage] = useState('');
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);

  // Chat message input for current ticket
  const [activeTicketId, setActiveTicketId] = useState(supportTickets[0]?.id || '');
  const [chatInput, setChatInput] = useState('');

  const activeTicket = supportTickets.find((t) => t.id === activeTicketId) || supportTickets[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeTicket) return;
    addSupportMessage(activeTicket.id, chatInput.trim());
    setChatInput('');
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) return;
    createSupportTicket(newSubject.trim(), newCategory, newMessage.trim());
    setIsCreatingTicket(false);
    setNewSubject('');
    setNewMessage('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold flex items-center gap-1">
              <GraduationCap className="w-3 h-3" />
              Academia & Atendimento VIP
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-display mt-1">
            Aulas em Vídeo, App Mobile & Suporte Prioritário
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Capacitação contínua para fotógrafos, atalhos do aplicativo iOS/Android instalável e suporte direto com SLA prioritário de 1 hora.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>SLA VIP: 1 Hora Garantida</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-zinc-200 dark:border-white/[0.07] pb-px overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('classes')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeTab === 'classes'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Masterclasses em Vídeo</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            {videoClasses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('mobile_app')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeTab === 'mobile_app'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Laptop className="w-4 h-4" />
          <span>Instalar no PC & Celular (PWA)</span>
        </button>

        <button
          onClick={() => setActiveTab('vip_support')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeTab === 'vip_support'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>Suporte Prioritário VIP</span>
        </button>
      </div>

      {/* 1. MASTERCLASSES EM VÍDEO */}
      {activeTab === 'classes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {videoClasses.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.07] overflow-hidden flex flex-col justify-between hover:border-amber-500/40 transition-all shadow-xs"
              >
                <div className="relative aspect-video bg-zinc-900 group cursor-pointer" onClick={() => setPlayingVideoId(item.id)}>
                  <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/80 text-white">
                    {item.duration}
                  </span>
                </div>

                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-amber-500 font-semibold">
                      {item.category} • {item.level}
                    </span>
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 dark:border-white/[0.06] flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400">{item.instructor}</span>
                    <button
                      onClick={() => toggleVideoCompleted(item.id)}
                      className={`text-xs p-1 rounded-lg transition-colors cursor-pointer ${
                        item.completed ? 'text-emerald-500 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                      title={item.completed ? 'Aula concluída' : 'Marcar como concluída'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Video Player Modal */}
          {playingVideoId && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-3xl bg-zinc-950 rounded-2xl border border-white/[0.1] shadow-2xl overflow-hidden animate-in fade-in">
                <div className="p-3 bg-zinc-900 border-b border-white/[0.08] flex items-center justify-between text-xs text-white">
                  <span className="font-bold">Reproduzindo Masterclass</span>
                  <button onClick={() => setPlayingVideoId(null)} className="text-zinc-400 hover:text-white cursor-pointer text-sm">✕</button>
                </div>
                <div className="aspect-video bg-black flex items-center justify-center">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
                    title="Vídeo Aula"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. APP NO PC & CELULAR (PWA) */}
      {activeTab === 'mobile_app' && (
        <div className="space-y-6">
          {/* Quick Install Interactive Action Card */}
          <PWAInstallButton variant="card" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PC Installation Guide Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.07] space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Como Instalar no PC (Windows / Mac / Linux)
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Google Chrome, Microsoft Edge, Brave, Opera ou Safari (macOS Sonoma+)
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300">
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Laptop className="w-4 h-4 text-amber-500" />
                    Opção 1: Pela Barra de Endereços (Mais Rápido)
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    Na barra onde fica o endereço do site no navegador (ao lado da estrela de favoritos), clique no ícone de <strong>Instalar Aplicativo</strong> (ícone de computador ou botão "Instalar FotoGestor Pro"). Confirme e o sistema criará o programa no seu PC.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Monitor className="w-4 h-4 text-sky-500" />
                    Opção 2: Pelo Menu do Navegador
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-zinc-500 dark:text-zinc-400">
                    <li><strong>No Chrome / Brave:</strong> Clique nos 3 pontinhos ⋮ no topo direito &gt; Salvar e compartilhar &gt; Instalar FotoGestor Pro.</li>
                    <li><strong>No Edge:</strong> Clique no menu ... &gt; Aplicativos &gt; Instalar este site como um aplicativo.</li>
                    <li><strong>No Mac (Safari):</strong> Clique no menu superior "Arquivo" &gt; "Adicionar ao Dock".</li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-400">
                  💡 <strong>Dica de Produtividade:</strong> Uma vez instalado, você pode fixar o FotoGestor na Barra de Tarefas do Windows ou Dock do Mac. Ele abre como uma janela sem distrações nem abas!
                </div>
              </div>
            </div>

            {/* Mobile Installation Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.07] space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Como Instalar no Celular (iPhone & Android)
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Acesso rápido durante ensaios externos e eventos
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300">
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Apple className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                    No iPhone / iPad (Safari)
                  </div>
                  <ol className="list-decimal pl-4 space-y-1 text-zinc-500 dark:text-zinc-400">
                    <li>Abra no Safari e toque no botão <strong>Compartilhar</strong> (ícone de quadrado com seta para cima).</li>
                    <li>Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.</li>
                    <li>Toque em <strong>Adicionar</strong>. O ícone aparecerá junto aos seus outros aplicativos.</li>
                  </ol>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-500" />
                    No Android (Google Chrome)
                  </div>
                  <ol className="list-decimal pl-4 space-y-1 text-zinc-500 dark:text-zinc-400">
                    <li>Toque no menu de três pontos ⋮ no canto superior direito.</li>
                    <li>Toque em <strong>Instalar aplicativo</strong> ou <strong>Adicionar à tela inicial</strong>.</li>
                  </ol>
                </div>

                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <Check className="w-4 h-4" />
                  <span>Modo Offline 100% ativo: funciona mesmo em locais sem sinal de celular.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUPORTE PRIORITÁRIO VIP */}
      {activeTab === 'vip_support' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Tickets list */}
            <div className="lg:col-span-4 space-y-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.07] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase font-mono">
                    Seus Chamados
                  </h4>
                  <button
                    onClick={() => setIsCreatingTicket(true)}
                    className="text-xs font-semibold text-amber-500 hover:text-amber-400 cursor-pointer"
                  >
                    + Novo Chamado
                  </button>
                </div>

                <div className="space-y-2">
                  {supportTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => setActiveTicketId(ticket.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        ticket.id === activeTicket?.id
                          ? 'bg-amber-500/10 border-amber-500/30 text-zinc-900 dark:text-zinc-100'
                          : 'bg-zinc-50 dark:bg-white/[0.03] border-transparent text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <div className="text-xs font-bold leading-tight">{ticket.subject}</div>
                      <div className="text-[10px] text-zinc-400 mt-1 flex items-center justify-between">
                        <span>{ticket.category}</span>
                        <span className="text-emerald-500 font-mono font-semibold">Prioridade VIP</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Box */}
            <div className="lg:col-span-8">
              <div className="p-6 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.07] min-h-[450px] flex flex-col justify-between space-y-4">
                <div className="space-y-4 flex-1">
                  <div className="pb-3 border-b border-zinc-100 dark:border-white/[0.06] flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {activeTicket?.subject || 'Atendimento Humanizado com Especialista'}
                      </h4>
                      <div className="text-[10px] text-zinc-400">Canal direto de suporte técnico e comercial</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold">
                      SLA ATIVO
                    </span>
                  </div>

                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {activeTicket?.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          msg.sender === 'user' ? 'items-end' : 'items-start'
                        }`}
                      >
                        <div
                          className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-amber-500 text-zinc-950 font-medium'
                              : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-white/[0.06]'
                          }`}
                        >
                          <div className="text-[10px] font-bold opacity-75 mb-0.5">{msg.senderName}</div>
                          <div>{msg.text}</div>
                        </div>
                        <span className="text-[9px] text-zinc-400 mt-1 font-mono">{msg.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-3 border-t border-zinc-100 dark:border-white/[0.06]">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Digite sua dúvida ou mensagem para a equipe..."
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] text-zinc-900 dark:text-zinc-100"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVO TICKET */}
      {isCreatingTicket && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#151518] rounded-2xl border border-zinc-200 dark:border-white/[0.1] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-white/[0.08]">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-display">
                Abrir Chamado com Suporte VIP
              </h3>
              <button onClick={() => setIsCreatingTicket(false)} className="text-zinc-400 hover:text-zinc-600 text-lg cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Assunto
                </label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Ex: Como configurar webhook do Pix"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.1] text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Categoria
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.1] text-zinc-900 dark:text-zinc-100"
                >
                  <option value="duvida">Dúvida Operacional</option>
                  <option value="financeiro">Financeiro / Pagamento</option>
                  <option value="contrato">Contratos & Assinaturas</option>
                  <option value="bug">Dificuldade Técnica</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Mensagem
                </label>
                <textarea
                  rows={4}
                  required
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Descreva detalhadamente o que você precisa..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.1] text-zinc-900 dark:text-zinc-100 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-white/[0.08] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingTicket(false)}
                  className="px-4 py-2 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-xl cursor-pointer"
                >
                  Enviar Chamado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
