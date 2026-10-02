import React, { useState } from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  FileText,
  DollarSign,
  QrCode,
  CreditCard,
  Barcode,
  Camera,
  Heart,
  Star,
  Shield,
  Download,
  Share2,
  Send,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';

export const ClientPortalView: React.FC = () => {
  const {
    sessions,
    clients,
    proposals,
    contracts,
    galleries,
    briefingForms,
    briefingSubmissions,
    submitBriefing,
    signContractElectronically,
    formatCurrency,
    settings,
    testimonials,
    addTestimonial,
  } = useWork();

  // Select which client view to simulate/display
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Active section inside the client portal
  const [portalSection, setPortalSection] = useState<
    'overview' | 'proposal' | 'contract' | 'payment' | 'briefing' | 'gallery' | 'review'
  >('overview');

  // Client signature drawing simulation
  const [signatureDrawn, setSignatureDrawn] = useState(false);

  // Review form in portal
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSent, setReviewSent] = useState(false);

  // Briefing answers in portal
  const [briefingAnswers, setBriefingAnswers] = useState<Record<string, string>>({});
  const [briefingSubmitted, setBriefingSubmitted] = useState(false);

  const client = clients.find((c) => c.id === selectedClientId) || clients[0];
  const clientSession = sessions.find((s) => s.clientId === client?.id) || sessions[0];
  const clientProposal = proposals.find((p) => p.clientId === client?.id) || proposals[0];
  const clientContract = contracts.find((c) => c.clientId === client?.id) || contracts[0];
  const clientGallery = galleries.find((g) => g.clientId === client?.id) || galleries[0];

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleCopyPortalLink = () => {
    const portalUrl = `https://fotogestor.studio/portal/${client?.id || 'demo'}`;
    navigator.clipboard.writeText(portalUrl);
    setCopiedLink(true);
    showToast('✓ Link exclusivo do Portal do Cliente copiado! Envie no WhatsApp dos noivos/cliente.');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyPix = () => {
    const pixKey = settings.pixKey || 'pix@fotogestor.com.br';
    navigator.clipboard.writeText(pixKey);
    setCopiedPix(true);
    showToast('✓ Chave Pix Copia e Cola copiada para a área de transferência!');
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleSignContractInPortal = () => {
    if (!clientContract) return;
    const dummySignature =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="70"><path d="M15 45 Q 65 15 110 40 T 205 30" fill="none" stroke="%2310b981" stroke-width="3" stroke-linecap="round"/></svg>';
    signContractElectronically(clientContract.id, dummySignature, 'client');
    setSignatureDrawn(true);
    showToast('✓ Contrato assinado com sucesso pelo cliente com certificado digital!');
  };

  const handleSendReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    addTestimonial({
      clientId: client?.id,
      clientName: client?.name || 'Cliente Satisfeito',
      clientRole: 'Cliente do Estúdio',
      sessionCategory: clientSession?.category || 'casamento',
      rating: reviewRating,
      content: reviewText.trim(),
      featured: true,
      approved: true,
      source: 'portal',
    });

    setReviewSent(true);
    showToast('✓ Obrigado pela sua avaliação 5 estrelas!');
  };

  const handleSendBriefing = (e: React.FormEvent) => {
    e.preventDefault();
    const form = briefingForms[0];
    if (!form || !client) return;

    submitBriefing(
      form.id,
      client.id,
      client.name,
      briefingAnswers,
      clientSession?.id
    );

    setBriefingSubmitted(true);
    showToast('✓ Respostas do briefing enviadas diretamente para a equipe de fotografia!');
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-semibold rounded-xl shadow-2xl border border-amber-500/30 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Control Bar for the Photographer */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Visualização do Portal do Cliente
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                ONLINE
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Esta é a experiência exclusiva e moderna que seu cliente visualiza ao acessar o link do portal.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-zinc-400">Ver como:</span>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] text-zinc-900 dark:text-zinc-100 font-medium"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleCopyPortalLink}
            className="px-3.5 py-1.5 text-xs font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>Copiar Link do Portal</span>
          </button>
        </div>
      </div>

      {/* CLIENT PORTAL CANVAS (High-end Client View) */}
      <div className="rounded-3xl bg-zinc-950 text-zinc-100 border border-white/[0.1] shadow-2xl overflow-hidden">
        {/* Editorial Hero Header */}
        <div className="relative h-64 md:h-80 w-full overflow-hidden bg-zinc-900">
          <img
            src={
              clientGallery?.coverImage ||
              'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80'
            }
            alt="Cover"
            className="w-full h-full object-cover opacity-45 brightness-90 filter"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 tracking-wider uppercase font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Portal Exclusivo · {settings.studioName || 'Lumina Studio'}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold font-display tracking-tight text-white mt-1">
                {client?.name || 'Mariana & Felipe'}
              </h1>
              <div className="flex items-center gap-3 text-xs text-zinc-300 mt-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  {clientSession?.sessionDate || '2026-11-14'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {clientSession?.sessionTime || '15:30'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  {clientSession?.location || 'Espaço Jardim da Serra'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-medium">
                {clientSession?.stage === 'entregue'
                  ? 'Fotos Entregues'
                  : clientSession?.stage === 'edicao'
                  ? 'Em Edição no Lightroom'
                  : 'Sessão Confirmada'}
              </span>
            </div>
          </div>
        </div>

        {/* Portal Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 border-b border-white/[0.08] bg-[#101014] overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Visão Geral' },
            { id: 'proposal', label: 'Proposta Comercial' },
            { id: 'contract', label: 'Contrato Digital' },
            { id: 'payment', label: 'Pagamento (Pix/Cartão)' },
            { id: 'briefing', label: 'Responder Briefing' },
            { id: 'gallery', label: 'Galeria de Fotos' },
            { id: 'review', label: 'Avaliação & Depoimento' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPortalSection(tab.id as any)}
              className={`px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                portalSection === tab.id
                  ? 'border-amber-400 text-amber-400 font-bold bg-amber-500/5'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Section Body */}
        <div className="p-6 md:p-8 space-y-6">
          {/* SECTION: OVERVIEW */}
          {portalSection === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-2">
                  <div className="text-[11px] font-mono text-amber-400 uppercase font-semibold">
                    1. Pacote Escolhido
                  </div>
                  <div className="text-lg font-bold text-white">
                    {clientProposal?.packageName || 'Casamento Premium · Cobertura Completa'}
                  </div>
                  <div className="text-xs text-zinc-400">
                    {clientSession?.contractedPhotos || 450} fotos editadas inclusas • Álbum Panorâmico
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-2">
                  <div className="text-[11px] font-mono text-emerald-400 uppercase font-semibold">
                    2. Status do Contrato
                  </div>
                  <div className="text-lg font-bold text-white flex items-center gap-2">
                    {clientContract?.status === 'signed' ? (
                      <span className="text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-5 h-5" /> Assinado & Válido
                      </span>
                    ) : (
                      <span className="text-amber-400">Aguardando Assinatura</span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-400">
                    Certificado eletrônico com validade jurídica nacional
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-2">
                  <div className="text-[11px] font-mono text-purple-400 uppercase font-semibold">
                    3. Pagamento & Quitação
                  </div>
                  <div className="text-lg font-bold text-white font-mono">
                    {formatCurrency(clientProposal?.totalAmount || 5700)}
                  </div>
                  <div className="text-xs text-zinc-400">
                    Pix instantâneo sem taxas ou em até 10x no cartão
                  </div>
                </div>
              </div>

              {/* Next steps timeline */}
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-4">
                <h3 className="text-sm font-bold text-white font-display">
                  Próximos Passos do seu Ensaio:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {[
                    { step: '1', title: 'Aprovar Proposta', desc: 'Conferir os itens e adicionais inclusos', done: true },
                    { step: '2', title: 'Assinar Contrato', desc: 'Assinatura digital rápida com dedo ou mouse', done: clientContract?.status === 'signed' },
                    { step: '3', title: 'Pagar Entrada / Sinal', desc: 'Garante o bloqueio da data da equipe', done: true },
                    { step: '4', title: 'Receber a Galeria', desc: 'Escolher fotos e baixar em alta resolução', done: clientSession?.stage === 'entregue' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          item.done ? 'bg-emerald-500 text-zinc-950' : 'bg-white/[0.1] text-zinc-400'
                        }`}
                      >
                        {item.done ? '✓' : item.step}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{item.title}</div>
                        <div className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION: PROPOSAL */}
          {portalSection === 'proposal' && (
            <div className="max-w-3xl mx-auto p-6 md:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div>
                  <span className="text-[11px] font-mono text-amber-400 uppercase font-semibold">
                    Proposta Comercial Oficial
                  </span>
                  <h3 className="text-xl font-bold text-white font-display mt-0.5">
                    {clientProposal?.title || 'Proposta de Cobertura Fotográfica'}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold font-mono text-white">
                    {formatCurrency(clientProposal?.totalAmount || 5700)}
                  </div>
                  <div className="text-xs text-zinc-400">em até {clientProposal?.installmentsCount || 6}x sem juros</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-zinc-300 uppercase font-mono">Itens Inclusos:</h4>
                <div className="space-y-2">
                  {[
                    'Cobertura com Fotógrafo Titular + Segundo Fotógrafo',
                    'Cobertura do Making Of, Cerimônia e Festa até o fim',
                    'Ensaio Pré-Wedding externo com 2h de captação',
                    'Galeria digital privativa FluxoWeby com seleção e download',
                    'Álbum Panorâmico 30x30 em Couro Legitimo (40 páginas)',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 leading-relaxed">
                💡 <strong>Condição Especial do Estúdio:</strong> Proposta com validade até {clientProposal?.validUntil || '31/10/2026'}. Ao clicar em aprovar, o contrato de prestação de serviços é gerado instantaneamente com todas as garantias legais.
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  onClick={() => {
                    setPortalSection('contract');
                    showToast('✓ Proposta conferida! Prossiga para a assinatura digital do contrato.');
                  }}
                  className="px-5 py-2.5 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Avançar para Assinatura do Contrato
                </button>
              </div>
            </div>
          )}

          {/* SECTION: DIGITAL CONTRACT & SIGNATURE */}
          {portalSection === 'contract' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                  <div>
                    <h3 className="text-base font-bold text-white font-display">
                      {clientContract?.title || 'Contrato de Prestação de Serviços Fotográficos'}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Assine abaixo com o dedo no celular ou com o cursor do mouse.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    MP 2.200-2/2001 Válido
                  </span>
                </div>

                {/* Contract text preview */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] text-xs text-zinc-300 font-mono space-y-3 max-h-56 overflow-y-auto leading-relaxed">
                  <p>
                    <strong>CONTRATADA:</strong> {settings.studioName} · {settings.photographerName}
                  </p>
                  <p>
                    <strong>CONTRATANTE:</strong> {client?.name} · CPF: {client?.document || '123.456.789-00'}
                  </p>
                  <p>
                    <strong>CLÁUSULA 1ª:</strong> O objeto deste contrato é a cobertura fotográfica do evento realizado em {clientSession?.sessionDate || '14/11/2026'}.
                  </p>
                  <p>
                    <strong>CLÁUSULA 2ª:</strong> O valor total é de {formatCurrency(clientContract?.totalAmount || 5700)}, sendo entrada/sinal de {formatCurrency(clientContract?.depositAmount || 1500)} para reserva irrevogável de agenda.
                  </p>
                  <p>
                    <strong>CLÁUSULA 3ª:</strong> A entrega ocorrerá em até 20 dias úteis através de galeria digital em alta resolução, com cessão de uso pessoal à contratante nos termos da Lei nº 9.610/98.
                  </p>
                </div>

                {/* Digital Signature Canvas Box */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Campo de Assinatura do(a) Cliente:
                  </label>

                  <div className="relative h-32 rounded-xl bg-black/60 border-2 border-dashed border-amber-500/40 flex flex-col items-center justify-center p-3 select-none">
                    {clientContract?.clientSignature || signatureDrawn ? (
                      <div className="flex flex-col items-center">
                        <img
                          src={
                            clientContract?.clientSignature ||
                            'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="70"><path d="M15 45 Q 65 15 110 40 T 205 30" fill="none" stroke="%2310b981" stroke-width="3" stroke-linecap="round"/></svg>'
                          }
                          alt="Assinatura"
                          className="h-14 object-contain"
                        />
                        <span className="text-[10px] text-emerald-400 font-mono mt-1">
                          ✓ Assinado digitalmente • SHA256:4a81b239ff9142ec
                        </span>
                      </div>
                    ) : (
                      <div className="text-center space-y-2">
                        <span className="text-xs text-zinc-400">
                          Desenhe sua assinatura aqui com o dedo ou clique no botão abaixo para assinar
                        </span>
                        <div>
                          <button
                            onClick={handleSignContractInPortal}
                            className="px-4 py-2 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all cursor-pointer shadow-xs"
                          >
                            Assinar Documento Agora
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {clientContract?.status === 'signed' && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center justify-between">
                    <span>✓ Este contrato está 100% assinado e certificado pelas duas partes.</span>
                    <button
                      onClick={() => showToast('✓ Baixando cópia em PDF do contrato assinado...')}
                      className="text-xs font-bold underline flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Baixar PDF
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION: PAYMENT */}
          {portalSection === 'payment' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="p-6 md:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-6">
                <div className="text-center space-y-1">
                  <span className="text-[11px] font-mono text-emerald-400 uppercase font-semibold">
                    Pagamento Seguro & Desconto
                  </span>
                  <h3 className="text-xl font-bold text-white font-display">
                    Efetuar Pagamento do Ensaio
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Pague com Pix instantâneo ou parcele em até 12x no cartão de crédito.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.06] flex flex-col items-center text-center space-y-4">
                  {/* Dynamic simulated Pix QR Code */}
                  <div className="p-3 rounded-2xl bg-white shadow-xl">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 160 160"
                      className="w-36 h-36"
                    >
                      <rect width="160" height="160" fill="white" />
                      {/* Stylized QR Matrix */}
                      <rect x="10" y="10" width="40" height="40" fill="#09090b" />
                      <rect x="18" y="18" width="24" height="24" fill="white" />
                      <rect x="24" y="24" width="12" height="12" fill="#09090b" />

                      <rect x="110" y="10" width="40" height="40" fill="#09090b" />
                      <rect x="118" y="18" width="24" height="24" fill="white" />
                      <rect x="124" y="24" width="12" height="12" fill="#09090b" />

                      <rect x="10" y="110" width="40" height="40" fill="#09090b" />
                      <rect x="18" y="118" width="24" height="24" fill="white" />
                      <rect x="24" y="124" width="12" height="12" fill="#09090b" />

                      <rect x="60" y="20" width="10" height="20" fill="#09090b" />
                      <rect x="80" y="10" width="20" height="10" fill="#09090b" />
                      <rect x="70" y="40" width="20" height="20" fill="#09090b" />
                      <rect x="60" y="70" width="40" height="20" fill="#09090b" />
                      <rect x="110" y="60" width="20" height="30" fill="#09090b" />
                      <rect x="20" y="70" width="20" height="20" fill="#09090b" />
                      <rect x="70" y="110" width="30" height="20" fill="#09090b" />
                      <rect x="110" y="110" width="20" height="20" fill="#09090b" />
                      <rect x="130" y="130" width="20" height="20" fill="#09090b" />
                    </svg>
                  </div>

                  <div>
                    <div className="text-2xl font-bold font-mono text-emerald-400">
                      {formatCurrency(clientSession?.depositAmount || 1500)}
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      Valor do Sinal / Reserva de Data
                    </div>
                  </div>

                  <div className="w-full space-y-2">
                    <div className="p-3 rounded-xl bg-zinc-900 border border-white/[0.08] text-xs font-mono text-zinc-300 truncate">
                      {settings.pixKey || 'ivanpoc15@gmail.com'}
                    </div>

                    <button
                      onClick={handleCopyPix}
                      className="w-full py-2.5 px-4 text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      {copiedPix ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>Copiar Chave Pix Copia e Cola</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-zinc-400 text-center">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <CreditCard className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                    <span>Cartão de Crédito em até 12x</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <Barcode className="w-4 h-4 text-sky-400 mx-auto mb-1" />
                    <span>Boleto Bancário sem juros</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: BRIEFING */}
          {portalSection === 'briefing' && (
            <div className="max-w-2xl mx-auto p-6 md:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-6">
              <div>
                <span className="text-[11px] font-mono text-amber-400 uppercase font-semibold">
                  Alinhamento & Expectativas
                </span>
                <h3 className="text-xl font-bold text-white font-display mt-0.5">
                  Questionário de Briefing Pré-Ensaio
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Suas respostas nos ajudam a preparar cada lente, roteiro de poses e iluminação com a sua personalidade.
                </p>
              </div>

              {briefingSubmitted ? (
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h4 className="text-base font-bold text-white">Respostas Enviadas com Sucesso!</h4>
                  <p className="text-xs text-zinc-300 max-w-md mx-auto">
                    Nossa equipe já recebeu suas preferências e está preparando uma experiência inesquecível para o grande dia.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendBriefing} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      1. Qual é o estilo principal que mais emociona vocês nas fotos?
                    </label>
                    <select
                      value={briefingAnswers.style || ''}
                      onChange={(e) => setBriefingAnswers((prev) => ({ ...prev, style: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-white/[0.1] text-zinc-100"
                    >
                      <option value="">Selecione...</option>
                      <option value="espontaneo">Documental & Espontâneo (quase sem poses forçadas)</option>
                      <option value="editorial">Editorial & Romântico (capa de revista)</option>
                      <option value="classico">Tradicional & Clássico (fotos com família)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      2. Há alguma pessoa especial ou momento que exige atenção redobrada?
                    </label>
                    <textarea
                      rows={3}
                      value={briefingAnswers.specialPeople || ''}
                      onChange={(e) => setBriefingAnswers((prev) => ({ ...prev, specialPeople: e.target.value }))}
                      placeholder="Ex: Avó paterna de 90 anos, surpresa da aliança, etc."
                      className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-white/[0.1] text-zinc-100 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      3. Músicas ou artistas favoritos para tocar na caixinha de som durante o ensaio:
                    </label>
                    <input
                      type="text"
                      value={briefingAnswers.music || ''}
                      onChange={(e) => setBriefingAnswers((prev) => ({ ...prev, music: e.target.value }))}
                      placeholder="Ex: Coldplay, Silva, John Mayer..."
                      className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-white/[0.1] text-zinc-100"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all cursor-pointer shadow-md"
                  >
                    Enviar Respostas para o Fotógrafo
                  </button>
                </form>
              )}
            </div>
          )}

          {/* SECTION: GALLERY */}
          {portalSection === 'gallery' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white font-display">
                    {clientGallery?.title || 'Galeria de Prova e Seleção'}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Selecione suas fotos favoritas e compre fotos extras em alta resolução por {formatCurrency(clientGallery?.extraPhotoPrice || 35)} cada.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-bold">
                    {clientGallery?.photos?.length || 2} fotos na galeria
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(clientGallery?.photos || []).map((photo) => (
                  <div
                    key={photo.id}
                    className="relative group rounded-2xl overflow-hidden bg-zinc-900 border border-white/[0.08] aspect-4/5"
                  >
                    <img
                      src={photo.url}
                      alt={photo.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                      <span className="text-[10px] font-mono text-white truncate">{photo.filename}</span>
                      <button
                        onClick={() => showToast('✓ Foto adicionada aos seus favoritos!')}
                        className="p-1.5 rounded-full bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-colors cursor-pointer"
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: REVIEW & TESTIMONIAL */}
          {portalSection === 'review' && (
            <div className="max-w-xl mx-auto p-6 md:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-6">
              <div className="text-center space-y-1">
                <span className="text-[11px] font-mono text-amber-400 uppercase font-semibold">
                  Feedback & Carinho
                </span>
                <h3 className="text-xl font-bold text-white font-display">
                  Como foi sua experiência com o {settings.studioName}?
                </h3>
                <p className="text-xs text-zinc-400">
                  Sua avaliação ajuda outros casais e clientes a conhecerem o nosso trabalho com confiança.
                </p>
              </div>

              {reviewSent ? (
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                  <Star className="w-8 h-8 text-amber-400 fill-amber-400 mx-auto" />
                  <h4 className="text-base font-bold text-white">Depoimento Enviado!</h4>
                  <p className="text-xs text-zinc-300">
                    Muito obrigado pelo seu carinho e pela confiança em nosso olhar fotográfico!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendReview} className="space-y-4">
                  <div className="flex justify-center items-center gap-2 py-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 text-amber-400 cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= reviewRating ? 'fill-amber-400' : 'text-zinc-700'
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Deixe seu depoimento em poucas linhas:
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Conte como foi ser fotografado(a), o atendimento e o resultado das fotos..."
                      className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-white/[0.1] text-zinc-100 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all cursor-pointer shadow-md"
                  >
                    Publicar Avaliação
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
