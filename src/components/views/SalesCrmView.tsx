import React, { useState } from 'react';
import {
  FileText,
  Package,
  Sparkles,
  Plus,
  Check,
  CheckCircle2,
  Clock,
  Send,
  Eye,
  FileCheck,
  MessageSquare,
  Star,
  ExternalLink,
  Copy,
  PenTool,
  Share2,
  Trash2,
  DollarSign,
  ChevronRight,
  Shield,
  Search,
  Film,
  CalendarCheck,
  TrendingUp,
  Layers,
  Download,
  QrCode,
  Smartphone,
  BookOpen,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import { ProposalPackage, SalesProposal, ClientTestimonial, SessionCategory } from '../../types';

interface SalesCrmViewProps {
  onOpenContract: (sessionId?: string) => void;
  onNavigateToPortal?: (proposalId?: string) => void;
  onNavigateToTemplates?: () => void;
}

export const SalesCrmView: React.FC<SalesCrmViewProps> = ({ onOpenContract, onNavigateToPortal, onNavigateToTemplates }) => {
  const {
    packages,
    proposals,
    contracts,
    testimonials,
    clients,
    formatCurrency,
    addPackage,
    deletePackage,
    addProposal,
    updateProposal,
    deleteProposal,
    approveProposalAndCreateContract,
    signContractElectronically,
    addTestimonial,
    deleteTestimonial,
    settings,
  } = useWork();

  const [activeSubTab, setActiveSubTab] = useState<
    'pipeline' | 'proposals' | 'packages' | 'contracts' | 'scheduler' | 'carousel' | 'testimonials'
  >('pipeline');

  // Pipeline Kanban State
  const [pipelineLeads, setPipelineLeads] = useState([
    {
      id: 'lead-1',
      name: 'Laura & Daniel',
      category: 'Casamento 2027',
      stage: 'lead',
      phone: '(11) 98111-9988',
      value: 5200,
      date: '2026-09-24',
      notes: 'Contato pelo Instagram, querem orçamento com drone',
    },
    {
      id: 'lead-2',
      name: 'Dr. Rodrigo Mendes',
      category: 'Retrato Médico',
      stage: 'contacted',
      phone: '(11) 97222-3344',
      value: 850,
      date: '2026-09-23',
      notes: 'Briefing enviado, aguardando resposta',
    },
    {
      id: 'lead-3',
      name: 'Bruna & Lucas',
      category: 'Ensaio Gestante',
      stage: 'proposal_sent',
      phone: '(11) 98111-2233',
      value: 1150,
      date: '2026-09-20',
      notes: 'Proposta enviada pelo WhatsApp',
    },
    {
      id: 'lead-4',
      name: 'Clínica Bella Pele',
      category: 'Corporativo',
      stage: 'negotiation',
      phone: '(11) 99887-1122',
      value: 2400,
      date: '2026-09-18',
      notes: 'Negociando parcelamento em 4x',
    },
    {
      id: 'lead-5',
      name: 'Mariana Rios & Felipe',
      category: 'Casamento Premium',
      stage: 'won',
      phone: '(11) 97123-4567',
      value: 5700,
      date: '2026-09-15',
      notes: 'Contrato assinado e sinal pago via Pix!',
    },
  ]);

  // Cinematic Carousel Generator State
  const [carouselTitle, setCarouselTitle] = useState('Mariana & Felipe · Um Amor que Transborda');
  const [carouselSubtitle, setCarouselSubtitle] = useState('Ensaio Pré-Wedding ao Pôr do Sol');
  const [carouselAuthor, setCarouselAuthor] = useState(settings.photographerName || 'Ivan Silva Fotografia');
  const [carouselTheme, setCarouselTheme] = useState<'cinematic_black' | 'editorial_cream' | 'golden_amber'>(
    'cinematic_black'
  );
  const [carouselImage, setCarouselImage] = useState(
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80'
  );

  // Public Online Scheduler Simulation State (/agendar)
  const [schedulerCategory, setSchedulerCategory] = useState<SessionCategory>('casamento');
  const [schedulerDate, setSchedulerDate] = useState('2026-10-18');
  const [schedulerTime, setSchedulerTime] = useState('16:30');
  const [schedulerName, setSchedulerName] = useState('');
  const [schedulerPhone, setSchedulerPhone] = useState('');
  const [schedulerBooked, setSchedulerBooked] = useState(false);

  // New Proposal Form State
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [selectedPackageId, setSelectedPackageId] = useState(packages[0]?.id || '');
  const [proposalTitle, setProposalTitle] = useState('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [installments, setInstallments] = useState(3);
  const [validUntil, setValidUntil] = useState('2026-10-31');

  // Digital Signature Canvas Modal State
  const [signingContractId, setSigningContractId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signaturePaths, setSignaturePaths] = useState<string>('');

  // New Testimonial State
  const [isCreatingTestimonial, setIsCreatingTestimonial] = useState(false);
  const [newTestimonialName, setNewTestimonialName] = useState('');
  const [newTestimonialRole, setNewTestimonialRole] = useState('Noiva / Cliente');
  const [newTestimonialRating, setNewTestimonialRating] = useState(5);
  const [newTestimonialContent, setNewTestimonialContent] = useState('');

  // Feedback Toast
  const [feedback, setFeedback] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleCreateProposal = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === selectedClientId);
    const pkg = packages.find((p) => p.id === selectedPackageId);
    if (!client || !pkg) return;

    const addons = pkg.availableAddons
      .filter((a) => selectedAddons.includes(a.id))
      .map((a) => ({ id: a.id, name: a.name, price: a.price }));

    const addonsTotal = addons.reduce((sum, a) => sum + a.price, 0);
    const finalTotal = Math.max(0, pkg.price + addonsTotal - Number(discountAmount || 0));

    const newProp = addProposal({
      title: proposalTitle.trim() || `Proposta ${pkg.name} · ${client.name}`,
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      clientPhone: client.phone,
      category: pkg.category,
      packageId: pkg.id,
      packageName: pkg.name,
      basePrice: pkg.price,
      selectedAddons: addons,
      discount: Number(discountAmount || 0),
      totalAmount: finalTotal,
      status: 'sent',
      installmentsCount: installments,
      validUntil,
      notes: `Válido até ${validUntil}. Condição especial de fechamento com ${installments}x sem juros.`,
    });

    setIsCreatingProposal(false);
    showToast(`✓ Proposta criada com sucesso para ${client.name}!`);
  };

  const handleApproveProposal = (proposalId: string) => {
    const contract = approveProposalAndCreateContract(proposalId);
    if (contract) {
      showToast(`✓ Proposta aprovada! Contrato gerado automaticamente com sucesso.`);
    }
  };

  const handleSignContract = (contractId: string) => {
    // Generate simulated digital signature curve
    const dummySignature =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="70"><path d="M15 45 Q 65 15 110 40 T 205 30" fill="none" stroke="%23f59e0b" stroke-width="3" stroke-linecap="round"/></svg>';
    signContractElectronically(contractId, dummySignature, 'client');
    setSigningContractId(null);
    showToast('✓ Contrato assinado eletronicamente com carimbo e hash SHA-256!');
  };

  const handleCreateTestimonialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestimonialName.trim() || !newTestimonialContent.trim()) return;

    addTestimonial({
      clientName: newTestimonialName.trim(),
      clientRole: newTestimonialRole.trim(),
      sessionCategory: 'casamento',
      rating: newTestimonialRating,
      content: newTestimonialContent.trim(),
      featured: true,
      approved: true,
      source: 'manual',
    });

    setIsCreatingTestimonial(false);
    setNewTestimonialName('');
    setNewTestimonialContent('');
    showToast('✓ Depoimento adicionado com sucesso!');
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-semibold rounded-xl shadow-2xl border border-amber-500/30 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-amber-500" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold">
              Módulo Comercial
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-display mt-1">
            CRM de Vendas, Propostas & Contratos
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Apresente pacotes encantadores, colete assinaturas eletrônicas ilimitadas com validade jurídica e transforme aprovações em contratos automáticos.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onNavigateToTemplates && (
            <button
              onClick={onNavigateToTemplates}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl transition-all cursor-pointer border border-zinc-200 dark:border-white/[0.08]"
              title="Acessar Central de Templates 2026 com modelos de contratos, propostas e scripts"
            >
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>Modelos & Templates 2026</span>
            </button>
          )}
          <button
            onClick={() => setIsCreatingProposal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-500 rounded-xl hover:from-amber-300 hover:to-amber-400 transition-all shadow-md shadow-amber-500/15 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Proposta</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-zinc-200 dark:border-white/[0.07] pb-px overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('pipeline')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeSubTab === 'pipeline'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Pipeline & Funil</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            {pipelineLeads.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('proposals')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeSubTab === 'proposals'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Propostas</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            {proposals.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('packages')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeSubTab === 'packages'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Pacotes</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            {packages.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('contracts')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeSubTab === 'contracts'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Contratos Digitais</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            {contracts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('scheduler')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeSubTab === 'scheduler'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Agenda Online (/agendar)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('carousel')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeSubTab === 'carousel'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Carrossel Cinemático</span>
        </button>

        <button
          onClick={() => setActiveSubTab('testimonials')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeSubTab === 'testimonials'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Depoimentos</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            {testimonials.length}
          </span>
        </button>
      </div>

      {/* 0. TAB: PIPELINE & FUNIL DE VENDAS */}
      {activeSubTab === 'pipeline' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Pipeline & Funil Comercial do Estúdio
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Acompanhe a jornada de cada noivo e cliente desde o primeiro contato até o contrato ganho.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono font-bold text-amber-500">
              Volume no Funil: {formatCurrency(pipelineLeads.reduce((s, l) => s + l.value, 0))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 overflow-x-auto">
            {[
              { id: 'lead', label: 'Lead Novo', color: 'text-zinc-400' },
              { id: 'contacted', label: '1º Contato Feito', color: 'text-sky-500' },
              { id: 'proposal_sent', label: 'Proposta Enviada', color: 'text-amber-500' },
              { id: 'negotiation', label: 'Em Negociação', color: 'text-purple-500' },
              { id: 'won', label: 'Contrato Ganho! 🎉', color: 'text-emerald-500' },
            ].map((col) => {
              const colLeads = pipelineLeads.filter((l) => l.stage === col.id);
              const colTotal = colLeads.reduce((s, l) => s + l.value, 0);

              return (
                <div
                  key={col.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.07] space-y-3 min-w-[210px]"
                >
                  <div className="pb-2 border-b border-zinc-100 dark:border-white/[0.06] flex items-center justify-between">
                    <div>
                      <span className={`text-xs font-bold font-mono ${col.color}`}>{col.label}</span>
                      <div className="text-[10px] text-zinc-400">{formatCurrency(colTotal)}</div>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-bold">
                      {colLeads.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {colLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] shadow-2xs space-y-2 hover:border-amber-500/40 transition-all"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                            {lead.name}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-amber-500 shrink-0">
                            {formatCurrency(lead.value)}
                          </span>
                        </div>

                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 space-y-0.5">
                          <div>{lead.category}</div>
                          <div className="text-[10px] text-zinc-400 truncate">{lead.notes}</div>
                        </div>

                        <div className="pt-2 border-t border-zinc-200/60 dark:border-white/[0.04] flex items-center justify-between text-[10px]">
                          <button
                            onClick={() => {
                              const msg = encodeURIComponent(`Olá, ${lead.name}! Como estão os preparativos para o seu ensaio?`);
                              const link = document.createElement('a');
                              link.href = `https://wa.me/?text=${msg}`;
                              link.target = '_blank';
                              link.rel = 'noopener noreferrer';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="text-emerald-500 hover:text-emerald-400 font-medium flex items-center gap-1 cursor-pointer"
                          >
                            <Send className="w-3 h-3" /> WhatsApp
                          </button>

                          {col.id !== 'won' && (
                            <button
                              onClick={() => {
                                const nextStages = ['lead', 'contacted', 'proposal_sent', 'negotiation', 'won'];
                                const currIdx = nextStages.indexOf(lead.stage);
                                if (currIdx < nextStages.length - 1) {
                                  const next = nextStages[currIdx + 1];
                                  setPipelineLeads((prev) =>
                                    prev.map((l) => (l.id === lead.id ? { ...l, stage: next as any } : l))
                                  );
                                  showToast(`✓ Lead avançou para a etapa seguinte!`);
                                }
                              }}
                              className="text-zinc-400 hover:text-amber-500 cursor-pointer flex items-center gap-0.5 font-bold"
                            >
                              <span>Avançar</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 1. TAB: PROPOSTAS COMERCIAIS */}
      {activeSubTab === 'proposals' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.08]">
              <div className="text-[11px] text-zinc-400 uppercase font-mono">Propostas em Aberto</div>
              <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                {proposals.filter((p) => p.status === 'sent' || p.status === 'viewed').length}
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">Aguardando decisão do cliente</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.08]">
              <div className="text-[11px] text-emerald-500 uppercase font-mono">Aprovadas & Fechadas</div>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {proposals.filter((p) => p.status === 'approved').length}
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">Contratos gerados automaticamente</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.08]">
              <div className="text-[11px] text-amber-500 uppercase font-mono">Volume Total em Propostas</div>
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {formatCurrency(proposals.reduce((sum, p) => sum + p.totalAmount, 0))}
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">Pipeline comercial ativo</div>
            </div>
          </div>

          {/* Proposals List */}
          <div className="space-y-3">
            {proposals.map((proposal) => {
              const hasContract = Boolean(proposal.generatedContractId);
              return (
                <div
                  key={proposal.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.07] hover:border-amber-500/40 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-display">
                        {proposal.title}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full ${
                          proposal.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : proposal.status === 'viewed'
                            ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {proposal.status === 'approved'
                          ? '✓ Aprovada'
                          : proposal.status === 'viewed'
                          ? 'Visualizada'
                          : 'Enviada'}
                      </span>
                      {hasContract && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                          Contrato Gerado
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-3 flex-wrap">
                      <span>Cliente: <strong className="text-zinc-800 dark:text-zinc-200">{proposal.clientName}</strong></span>
                      <span>•</span>
                      <span>Pacote: <strong className="text-zinc-800 dark:text-zinc-200">{proposal.packageName}</strong></span>
                      <span>•</span>
                      <span>Validade: {proposal.validUntil}</span>
                    </div>

                    {proposal.selectedAddons.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[11px] text-zinc-400">Adicionais:</span>
                        {proposal.selectedAddons.map((ad) => (
                          <span
                            key={ad.id}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-white/[0.05] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/[0.06]"
                          >
                            + {ad.name} ({formatCurrency(ad.price)})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-zinc-100 dark:border-white/[0.05]">
                    <div className="text-right">
                      <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                        {formatCurrency(proposal.totalAmount)}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        em até {proposal.installmentsCount}x de {formatCurrency(proposal.totalAmount / proposal.installmentsCount)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {proposal.status !== 'approved' ? (
                        <button
                          onClick={() => handleApproveProposal(proposal.id)}
                          title="Aprovação gera contrato automaticamente"
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Aprovar & Gerar Contrato</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveSubTab('contracts')}
                          className="px-3 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-white/[0.08] hover:bg-zinc-200 dark:hover:bg-white/[0.12] rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-amber-500" />
                          <span>Ver Contrato</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          const message = encodeURIComponent(
                            `Olá, ${proposal.clientName}! Segue o link da sua proposta personalizada do ${settings.studioName} para o pacote ${proposal.packageName} no valor de ${formatCurrency(proposal.totalAmount)}: https://fotogestor.studio/proposta/${proposal.id}`
                          );
                          const link = document.createElement('a');
                          link.href = `https://wa.me/?text=${message}`;
                          link.target = '_blank';
                          link.rel = 'noopener noreferrer';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        title="Enviar proposta pelo WhatsApp"
                        className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-colors cursor-pointer"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => deleteProposal(proposal.id)}
                        title="Excluir proposta"
                        className="p-2 text-zinc-400 hover:text-rose-500 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. TAB: PACOTES COMERCIAIS */}
      {activeSubTab === 'packages' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`p-6 rounded-2xl bg-white dark:bg-[#151518] border transition-all flex flex-col justify-between ${
                pkg.isPopular
                  ? 'border-amber-500/50 shadow-lg shadow-amber-500/5'
                  : 'border-zinc-200 dark:border-white/[0.07]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold">
                    {pkg.category.replace('_', ' ')}
                  </span>
                  {pkg.isPopular && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-zinc-950">
                      MAIS VENDIDO
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-display mt-1">
                  {pkg.name}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                  {pkg.description}
                </p>

                <div className="my-4 py-3 border-y border-zinc-100 dark:border-white/[0.06] flex items-baseline justify-between">
                  <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                    {formatCurrency(pkg.price)}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {pkg.durationHours}h de cobertura • {pkg.deliveredPhotosCount} fotos editadas
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                    Incluso no pacote:
                  </div>
                  {pkg.includedItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                      <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {pkg.availableAddons.length > 0 && (
                  <div className="space-y-1.5 pt-3 border-t border-zinc-100 dark:border-white/[0.05]">
                    <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                      Opcionais disponíveis:
                    </div>
                    {pkg.availableAddons.map((add) => (
                      <div key={add.id} className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                        <span>+ {add.name}</span>
                        <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">
                          {formatCurrency(add.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-5 mt-4 border-t border-zinc-100 dark:border-white/[0.06] flex items-center justify-between gap-3">
                <span className="text-[11px] text-zinc-400">{pkg.installmentOptions}</span>
                <button
                  onClick={() => {
                    setSelectedPackageId(pkg.id);
                    setIsCreatingProposal(true);
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-white/[0.08] hover:bg-amber-500 hover:text-zinc-950 dark:hover:bg-amber-400 dark:hover:text-zinc-950 rounded-xl transition-all cursor-pointer"
                >
                  Criar Proposta com este Pacote
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. TAB: ASSINATURAS ILIMITADAS & CONTRATOS DIGITAIS */}
      {activeSubTab === 'contracts' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-500 shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Assinaturas Digitais Ilimitadas com Validade Jurídica
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Conformidade com a MP 2.200-2/2001 e Lei 14.063/2020. Seus clientes assinam na tela de qualquer smartphone ou computador com registro de data, IP e carimbo SHA-256.
                </p>
              </div>
            </div>
            <button
              onClick={() => onOpenContract()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Contrato</span>
            </button>
          </div>

          <div className="space-y-3">
            {contracts.map((contract) => (
              <div
                key={contract.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.07] hover:border-amber-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-display">
                      {contract.title}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full ${
                        contract.status === 'signed'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {contract.status === 'signed' ? '✓ Assinado Digitalmente' : 'Aguardando Assinatura'}
                    </span>
                  </div>

                  <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-3 flex-wrap">
                    <span>Cliente: <strong className="text-zinc-800 dark:text-zinc-200">{contract.clientName}</strong></span>
                    <span>•</span>
                    <span>Documento: {contract.clientDocument}</span>
                    <span>•</span>
                    <span>Evento: {contract.sessionDate}</span>
                  </div>

                  {contract.auditHash && (
                    <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-1.5 pt-1">
                      <Shield className="w-3 h-3 text-emerald-500" />
                      <span>Selo Eletrônico: {contract.auditHash} ({contract.ipAddress})</span>
                    </div>
                  )}

                  {contract.clientSignature && (
                    <div className="flex items-center gap-3 pt-2">
                      <div className="p-1 rounded-lg bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/[0.06]">
                        <img src={contract.clientSignature} alt="Assinatura Cliente" className="h-7 object-contain" />
                      </div>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Assinado pelo cliente em {contract.clientSignedAt?.substring(0, 10)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-zinc-100 dark:border-white/[0.05]">
                  <div className="text-right">
                    <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                      {formatCurrency(contract.totalAmount)}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      Sinal: {formatCurrency(contract.depositAmount)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {contract.status !== 'signed' ? (
                      <button
                        onClick={() => handleSignContract(contract.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        <span>Assinar na Tela</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => showToast('✓ Contrato válido e certificado disponível no Portal do Cliente.')}
                        className="px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Certificado Ativo</span>
                      </button>
                    )}

                    <button
                      onClick={() => onOpenContract(contract.sessionId)}
                      className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/[0.06] rounded-xl transition-colors cursor-pointer"
                      title="Ver minuta completa"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TAB: AGENDA INTELIGENTE COM LINK PÚBLICO (/agendar) */}
      {activeSubTab === 'scheduler' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Link Público de Agendamento Online & Sinal Automático
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                    ATIVO
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Coloque este link na bio do Instagram ou envie no WhatsApp. O cliente escolhe a data livre, horário e já paga o sinal do agendamento por Pix na hora!
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://fotogestor.studio/agendar/${settings.studioName.toLowerCase().replace(/\s+/g, '-')}`);
                showToast('✓ Link público de agendamento copiado para a área de transferência!');
              }}
              className="px-3.5 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            >
              <Copy className="w-4 h-4" />
              <span>Copiar Link para a Bio</span>
            </button>
          </div>

          {/* Public Booking Simulation Box */}
          <div className="max-w-3xl mx-auto rounded-3xl bg-zinc-950 text-white border border-white/[0.1] shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-1 pb-4 border-b border-white/[0.08]">
              <span className="text-xs font-mono uppercase text-amber-400 tracking-wider font-semibold">
                Agendamento Online · {settings.studioName}
              </span>
              <h2 className="text-2xl font-bold font-display">Reserve sua Sessão Fotográfica</h2>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Escolha a data ideal na nossa agenda e garanta o bloqueio exclusivo da equipe com pagamento de sinal seguro.
              </p>
            </div>

            {schedulerBooked ? (
              <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">Sessão Agendada com Sucesso!</h3>
                <p className="text-xs text-zinc-300 max-w-md mx-auto leading-relaxed">
                  Recebemos a sua reserva para <strong>{schedulerDate} às {schedulerTime}</strong>. Nossa equipe entrará em contato via WhatsApp ({schedulerPhone || '(11) 98765-4321'}) para enviar o guia de figurinos!
                </p>
                <button
                  onClick={() => setSchedulerBooked(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-amber-400 rounded-xl cursor-pointer"
                >
                  Fazer Outro Agendamento
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* 1. Category */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">
                    1. Escolha o Tipo de Ensaio ou Evento:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'casamento', label: 'Casamento', price: 4800 },
                      { id: 'ensaio_casal', label: 'Ensaio Casal', price: 1200 },
                      { id: 'familia_gestante', label: 'Gestante & Família', price: 950 },
                      { id: 'retrato_corporativo', label: 'Retrato VIP', price: 780 },
                    ].map((cat) => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setSchedulerCategory(cat.id as any)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          schedulerCategory === cat.id
                            ? 'bg-amber-500/20 border-amber-500 text-white'
                            : 'bg-white/[0.04] border-white/[0.06] text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <div className="text-xs font-bold">{cat.label}</div>
                        <div className="text-[10px] text-amber-400 font-mono mt-0.5">
                          a partir de {formatCurrency(cat.price)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Date & Available slots */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      2. Data Desejada:
                    </label>
                    <input
                      type="date"
                      value={schedulerDate}
                      onChange={(e) => setSchedulerDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-white/[0.1] text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      3. Horário Disponível:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['09:30', '14:00', '16:30 (Pôr do Sol)'].map((slot) => (
                        <button
                          type="button"
                          key={slot}
                          onClick={() => setSchedulerTime(slot)}
                          className={`py-2 px-1 text-center text-[11px] rounded-xl border cursor-pointer transition-all ${
                            schedulerTime === slot
                              ? 'bg-amber-500 text-zinc-950 font-bold border-amber-500'
                              : 'bg-white/[0.04] border-white/[0.06] text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Client details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Seu Nome Completo:
                    </label>
                    <input
                      type="text"
                      value={schedulerName}
                      onChange={(e) => setSchedulerName(e.target.value)}
                      placeholder="Ex: Amanda Guimarães"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-white/[0.1] text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Seu WhatsApp para Contato:
                    </label>
                    <input
                      type="text"
                      value={schedulerPhone}
                      onChange={(e) => setSchedulerPhone(e.target.value)}
                      placeholder="(11) 98765-4321"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-white/[0.1] text-white"
                    />
                  </div>
                </div>

                {/* Pix Deposit Booking Checkout */}
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-mono uppercase text-emerald-400 font-semibold">
                      Sinal de Reserva Imediata
                    </div>
                    <div className="text-xl font-bold font-mono text-white mt-0.5">
                      R$ 350,00 via Pix
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      O saldo restante é pago somente na semana do ensaio.
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSchedulerBooked(true);
                      showToast('✓ Agendamento e sinal registrados com sucesso!');
                    }}
                    className="px-5 py-2.5 text-xs font-bold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Confirmar & Pagar Sinal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. TAB: CARROSSÉIS CINEMÁTICOS EM 1 CLIQUE */}
      {activeSubTab === 'carousel' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">
                  Instagram 1080 × 1350
                </span>
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-display mt-1">
                Criador de Carrosséis Cinemáticos Panorâmicos
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Transforme suas fotos horizontais em um carrossel sem emendas com corte contínuo perfeito para parar o feed no Instagram.
              </p>
            </div>

            <button
              onClick={() => showToast('✓ 3 Slides recortados em 1080x1350 gerados e prontos para postar!')}
              className="px-4 py-2 text-xs font-bold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Slides do Carrossel (Zip)</span>
            </button>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Título do Carrossel</label>
              <input
                type="text"
                value={carouselTitle}
                onChange={(e) => setCarouselTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Subtítulo / Citação</label>
              <input
                type="text"
                value={carouselSubtitle}
                onChange={(e) => setCarouselSubtitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Assinatura / Estúdio</label>
              <input
                type="text"
                value={carouselAuthor}
                onChange={(e) => setCarouselAuthor(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08]"
              />
            </div>
          </div>

          {/* Continuous 3-Slide Panoramic Preview */}
          <div className="p-6 rounded-3xl bg-[#09090b] border border-white/[0.1] shadow-2xl space-y-4">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-mono">Visualização Contínua dos 3 Slides (Deslize para a direita ➡️)</span>
              <span className="text-[10px] text-amber-400 font-mono">Resolução Nativa: 3240 × 1350 px</span>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-white/[0.1] shadow-2xl">
              {/* Background panoramic image */}
              <div className="relative h-80 sm:h-96 w-full flex">
                {/* Slide 1 */}
                <div className="relative flex-1 h-full border-r-2 border-dashed border-amber-500/50 overflow-hidden flex flex-col justify-between p-6 group">
                  <img
                    src={carouselImage}
                    alt="Panorama"
                    className="absolute inset-0 w-[300%] max-w-none h-full object-cover -left-[0%]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-sm">
                      SLIDE 1/3
                    </span>
                    <span className="text-[10px] font-mono text-zinc-300">Corte 1080x1350</span>
                  </div>

                  <div className="relative z-10 space-y-1">
                    <h2 className="text-base sm:text-lg font-bold text-white font-serif leading-snug">
                      {carouselTitle}
                    </h2>
                    <p className="text-xs text-zinc-300 font-light">{carouselSubtitle}</p>
                  </div>
                </div>

                {/* Slide 2 */}
                <div className="relative flex-1 h-full border-r-2 border-dashed border-amber-500/50 overflow-hidden flex flex-col justify-between p-6">
                  <img
                    src={carouselImage}
                    alt="Panorama"
                    className="absolute inset-0 w-[300%] max-w-none h-full object-cover -left-[100%]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-sm">
                      SLIDE 2/3
                    </span>
                    <span className="text-[10px] font-mono text-amber-400">Continuidade Perfeita</span>
                  </div>

                  <div className="relative z-10 text-center text-xs text-zinc-200 italic font-serif">
                    "O amor se revela nas entrelinhas do tempo e no silêncio de um olhar."
                  </div>
                </div>

                {/* Slide 3 */}
                <div className="relative flex-1 h-full overflow-hidden flex flex-col justify-between p-6">
                  <img
                    src={carouselImage}
                    alt="Panorama"
                    className="absolute inset-0 w-[300%] max-w-none h-full object-cover -left-[200%]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-sm">
                      SLIDE 3/3
                    </span>
                    <span className="text-[10px] font-mono text-zinc-300">Encerramento</span>
                  </div>

                  <div className="relative z-10 text-right space-y-1">
                    <div className="text-xs font-bold text-white font-mono">{carouselAuthor}</div>
                    <div className="text-[10px] text-amber-400">Reserve a sua data • Link na Bio</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB: CENTRAL DE DEPOIMENTOS */}
      {activeSubTab === 'testimonials' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Depoimentos & Prova Social dos Clientes
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Solicite avaliações pós-ensaio com 1 clique no WhatsApp ou aprove avaliações enviadas pelo Portal do Cliente.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const msg = encodeURIComponent(
                    `Olá! Esperamos que você tenha amado a experiência e as fotos do seu ensaio. Poderia nos deixar um breve depoimento de 1 minuto para o nosso portfólio? Clica aqui: https://fotogestor.studio/avaliar`
                  );
                  const link = document.createElement('a');
                  link.href = `https://wa.me/?text=${msg}`;
                  link.target = '_blank';
                  link.rel = 'noopener noreferrer';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="px-3.5 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Pedir Depoimento no WhatsApp</span>
              </button>
              <button
                onClick={() => setIsCreatingTestimonial(true)}
                className="px-3.5 py-1.5 text-xs font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Depoimento</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((test) => (
              <div
                key={test.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.07] flex flex-col justify-between hover:border-amber-500/40 transition-all shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < test.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-zinc-300 dark:text-zinc-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono uppercase text-zinc-400">
                      {test.source === 'whatsapp' ? 'via WhatsApp' : 'via Portal'}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-700 dark:text-zinc-300 italic leading-relaxed">
                    "{test.content}"
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {test.avatarUrl ? (
                      <img src={test.avatarUrl} alt={test.clientName} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-xs font-bold font-mono">
                        {test.clientName[0]}
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {test.clientName}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        {test.clientRole || 'Cliente'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTestimonial(test.id)}
                    className="p-1.5 text-zinc-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                    title="Remover depoimento"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: CRIAR PROPOSTA */}
      {isCreatingProposal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white dark:bg-[#151518] rounded-2xl border border-zinc-200 dark:border-white/[0.1] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-white/[0.08]">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-display">
                  Criar Nova Proposta Comercial
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Gere um orçamento interativo e envie com 1 clique para o cliente aprovar.
                </p>
              </div>
              <button
                onClick={() => setIsCreatingProposal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProposal} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Cliente / Noivos
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.1] text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Pacote Base
                </label>
                <select
                  value={selectedPackageId}
                  onChange={(e) => {
                    setSelectedPackageId(e.target.value);
                    setSelectedAddons([]);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.1] text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatCurrency(p.price)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Addons selector */}
              {(() => {
                const pkg = packages.find((p) => p.id === selectedPackageId);
                if (!pkg || pkg.availableAddons.length === 0) return null;
                return (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Adicionais e Opcionais
                    </label>
                    <div className="space-y-2 max-h-36 overflow-y-auto p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/[0.06]">
                      {pkg.availableAddons.map((ad) => {
                        const isChecked = selectedAddons.includes(ad.id);
                        return (
                          <label key={ad.id} className="flex items-center justify-between text-xs cursor-pointer">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedAddons((prev) => [...prev, ad.id]);
                                  } else {
                                    setSelectedAddons((prev) => prev.filter((id) => id !== ad.id));
                                  }
                                }}
                                className="rounded text-amber-500 focus:ring-amber-400"
                              />
                              <span className="text-zinc-800 dark:text-zinc-200">{ad.name}</span>
                            </div>
                            <span className="font-mono text-zinc-600 dark:text-zinc-400">
                              +{formatCurrency(ad.price)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Desconto Especial (R$)
                  </label>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.1] text-zinc-900 dark:text-zinc-100"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Parcelamento Máximo
                  </label>
                  <select
                    value={installments}
                    onChange={(e) => setInstallments(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.1] text-zinc-900 dark:text-zinc-100"
                  >
                    <option value={1}>1x (À vista com Pix)</option>
                    <option value={2}>2x sem juros</option>
                    <option value={3}>3x sem juros</option>
                    <option value={6}>6x no cartão</option>
                    <option value={10}>10x no cartão</option>
                    <option value={12}>12x no cartão</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Validade da Proposta
                </label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.1] text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-white/[0.08] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingProposal(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  Gerar Proposta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CRIAR DEPOIMENTO */}
      {isCreatingTestimonial && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#151518] rounded-2xl border border-zinc-200 dark:border-white/[0.1] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-white/[0.08]">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-display">
                Cadastrar Depoimento
              </h3>
              <button
                onClick={() => setIsCreatingTestimonial(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTestimonialSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Nome do Cliente / Noivos
                </label>
                <input
                  type="text"
                  required
                  value={newTestimonialName}
                  onChange={(e) => setNewTestimonialName(e.target.value)}
                  placeholder="Ex: Beatriz & Lucas"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.1] text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Papel ou Evento
                </label>
                <input
                  type="text"
                  value={newTestimonialRole}
                  onChange={(e) => setNewTestimonialRole(e.target.value)}
                  placeholder="Ex: Noiva (Casamento na Fazenda)"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.1] text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Nota (Estrelas)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setNewTestimonialRating(num)}
                      className="p-1 text-amber-400 cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          num <= newTestimonialRating ? 'fill-amber-400' : 'text-zinc-300 dark:text-zinc-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 ml-2">
                    {newTestimonialRating} de 5 estrelas
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Texto do Depoimento
                </label>
                <textarea
                  rows={4}
                  required
                  value={newTestimonialContent}
                  onChange={(e) => setNewTestimonialContent(e.target.value)}
                  placeholder="Cole aqui o depoimento ou feedback recebido do cliente..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.1] text-zinc-900 dark:text-zinc-100 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-white/[0.08] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingTestimonial(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  Salvar Depoimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
