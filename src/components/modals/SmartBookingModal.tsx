import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  DollarSign,
  User,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Share2,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import { SessionCategory } from '../../types';

interface SmartBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmartBookingModal: React.FC<SmartBookingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { settings, addSession, addTransaction, formatCurrency } = useWork();

  const [step, setStep] = useState<'service' | 'datetime' | 'client_info' | 'deposit_payment' | 'confirmed'>('service');
  const [selectedCategory, setSelectedCategory] = useState<SessionCategory>('ensaio_casal');
  const [selectedDate, setSelectedDate] = useState('2026-10-20');
  const [selectedTime, setSelectedTime] = useState('15:30');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [locationPreference, setLocationPreference] = useState('Locação Externa (Praia / Parque)');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);

  if (!isOpen) return null;

  const bookingPublicUrl = `https://fotogestor.app/agendar/@${(settings.studioName || 'meuestudio').toLowerCase().replace(/\s+/g, '')}`;

  const servicePackages: {
    category: SessionCategory;
    title: string;
    duration: string;
    totalPrice: number;
    depositPrice: number;
    desc: string;
  }[] = [
    {
      category: 'ensaio_casal',
      title: 'Ensaio Pré-Wedding / Casal',
      duration: '2h00',
      totalPrice: 1450,
      depositPrice: 400,
      desc: 'Sessão fotográfica externa com 45 fotos em alta resolução e galeria online.',
    },
    {
      category: 'casamento',
      title: 'Cobertura de Casamento Completa',
      duration: '8h00',
      totalPrice: 5800,
      depositPrice: 1200,
      desc: 'Making of, cerimônia e recepção com 2 fotógrafos e entrega em caixa personalizada.',
    },
    {
      category: 'retrato_corporativo',
      title: 'Retratos Corporativos & Posicionamento',
      duration: '1h30',
      totalPrice: 890,
      depositPrice: 250,
      desc: 'Fotos em estúdio ou escritório para LinkedIn, site e imprensa.',
    },
    {
      category: 'familia_gestante',
      title: 'Ensaio Gestante Afetivo',
      duration: '2h00',
      totalPrice: 1250,
      depositPrice: 350,
      desc: 'Fotos intimistas com luz natural e figurino do estúdio incluso.',
    },
  ];

  const currentPkg =
    servicePackages.find((p) => p.category === selectedCategory) || servicePackages[0];

  const handleCopyPublicLink = () => {
    navigator.clipboard.writeText(bookingPublicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyPix = () => {
    const pixCode = `00020126580014br.gov.bcb.pix0136${settings.pixKey || 'pix@estudio.com'}520400005303986540${currentPkg.depositPrice.toFixed(2)}5802BR5925${settings.studioName}6009SAO PAULO62070503***6304`;
    navigator.clipboard.writeText(pixCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleConfirmBooking = () => {
    // 1. Create real session in WorkContext
    addSession({
      clientId: `cli-${Date.now()}`,
      title: `${currentPkg.title} - ${clientName || 'Online'}`,
      category: selectedCategory,
      priority: 'normal',
      sessionDate: selectedDate,
      sessionTime: selectedTime,
      location: locationPreference,
      packagePrice: currentPkg.totalPrice,
      depositAmount: currentPkg.depositPrice,
      depositPaid: true,
      balancePaid: false,
      contractedPhotos: 40,
      selectedPhotos: 0,
      editedPhotos: 0,
      extraPhotosCount: 0,
      extraPhotoPrice: settings.defaultExtraPhotoPrice || 35,
      stage: 'agendado',
      workflowChecklist: [
        { id: 'wf-1', text: 'Briefing e referências enviadas', completed: true },
        { id: 'wf-2', text: 'Sinal de reserva confirmado via Pix', completed: true },
        { id: 'wf-3', text: 'Contrato assinado digitalmente', completed: false },
      ],
      gearChecklist: [],
      notes: `Agendado pelo link público do estúdio. E-mail: ${clientEmail} | Tel: ${clientPhone}`,
      galleryUrl: '',
    });

    // 2. Create financial transaction for the deposit
    addTransaction({
      type: 'income',
      title: `Sinal Reserva - ${clientName || 'Cliente'} (${currentPkg.title})`,
      amount: currentPkg.depositPrice,
      date: new Date().toISOString().substring(0, 10),
      category: 'Ensaios',
      status: 'paid',
      notes: `Recebido via Pix / Link de Agendamento Inteligente`,
    });

    setStep('confirmed');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-fadeIn p-2 sm:p-4">
      <div className="w-full max-w-4xl max-h-[95vh] bg-zinc-950 text-zinc-100 rounded-2xl border border-zinc-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-100">
                  Agenda Inteligente & Link de Agendamento
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  PAGAMENTO AUTOMÁTICO DE SINAL
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Seus clientes escolhem a data, preenchem os dados e pagam o sinal de reserva por Pix imediatamente.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPublicLink}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link Público'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Public Link Share Bar */}
        <div className="bg-zinc-900/90 border-b border-zinc-800/80 px-5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="text-zinc-500 font-mono shrink-0">Link da sua bio:</span>
            <code className="text-amber-400 bg-black/40 px-2 py-1 rounded text-[11px] truncate font-mono">
              {bookingPublicUrl}
            </code>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-zinc-400">Sincronizado com Google Calendar</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>

        {/* Modal Body: Client Simulator View */}
        <div className="flex-1 p-6 overflow-y-auto max-w-2xl mx-auto w-full">
          {/* Step Progress Indicators */}
          <div className="flex items-center justify-between mb-8 relative">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-zinc-800 -z-10" />
            {[
              { key: 'service', label: '1. Pacote' },
              { key: 'datetime', label: '2. Data & Hora' },
              { key: 'client_info', label: '3. Dados' },
              { key: 'deposit_payment', label: '4. Sinal' },
              { key: 'confirmed', label: '5. Sucesso' },
            ].map((s, idx) => (
              <div key={s.key} className="flex flex-col items-center gap-1 bg-zinc-950 px-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === s.key
                      ? 'bg-amber-400 text-zinc-950 ring-4 ring-amber-400/20'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {idx + 1}
                </div>
                <span className="text-[10px] text-zinc-400 font-medium">{s.label}</span>
              </div>
            ))}
          </div>

          {/* STEP 1: SERVICE */}
          {step === 'service' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center space-y-1 mb-4">
                <h4 className="text-base font-bold text-white">Escolha a experiência fotográfica</h4>
                <p className="text-xs text-zinc-400">
                  Selecione o ensaio desejado para consultar horários disponíveis na agenda do estúdio.
                </p>
              </div>

              <div className="space-y-2.5">
                {servicePackages.map((pkg) => (
                  <div
                    key={pkg.category}
                    onClick={() => setSelectedCategory(pkg.category)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                      selectedCategory === pkg.category
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{pkg.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          {pkg.duration}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">{pkg.desc}</p>
                      <div className="text-xs text-amber-400 font-semibold pt-1">
                        Sinal de reserva: {formatCurrency(pkg.depositPrice)} (Saldo antes da entrega)
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-bold text-white font-mono">
                        {formatCurrency(pkg.totalPrice)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setStep('datetime')}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Continuar para Data & Horário →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: DATETIME */}
          {step === 'datetime' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="text-center space-y-1 mb-4">
                <h4 className="text-base font-bold text-white">Escolha a data e horário</h4>
                <p className="text-xs text-zinc-400">
                  Horários com melhor luz natural recomendados pelo estúdio.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Data do Ensaio
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Horários Disponíveis (Luz Ideal)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['08:30', '10:00', '15:30', '17:00'].map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 px-3 rounded-lg border text-xs font-mono font-medium transition-all cursor-pointer ${
                          selectedTime === time
                            ? 'bg-amber-400 text-zinc-950 border-amber-400 font-bold'
                            : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        {time} {time === '17:00' ? '✨ Golden' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setStep('service')}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                >
                  ← Voltar
                </button>
                <button
                  onClick={() => setStep('client_info')}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Avançar para Seus Dados →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CLIENT INFO */}
          {step === 'client_info' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center space-y-1 mb-4">
                <h4 className="text-base font-bold text-white">Dados para Contrato e Contato</h4>
                <p className="text-xs text-zinc-400">
                  Preencha para enviarmos a confirmação e o contrato com assinatura digital.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Seu Nome Completo
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Ex: Mariana Castro & Felipe Lima"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                      WhatsApp para Contato
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        placeholder="(11) 98765-4321"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                      E-mail para Receber as Fotos
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        placeholder="mariana@email.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Preferencia de Local do Ensaio
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={locationPreference}
                      onChange={(e) => setLocationPreference(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setStep('datetime')}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                >
                  ← Voltar
                </button>
                <button
                  onClick={() => setStep('deposit_payment')}
                  disabled={!clientName.trim()}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-40"
                >
                  Prosseguir para Reserva com Sinal →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: DEPOSIT PAYMENT */}
          {step === 'deposit_payment' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
                <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase">
                  Garantia de Reserva de Data
                </span>
                <h4 className="text-lg font-bold text-white">
                  Sinal de Reserva: {formatCurrency(currentPkg.depositPrice)}
                </h4>
                <p className="text-xs text-zinc-300">
                  O valor do sinal é deduzido do total de {formatCurrency(currentPkg.totalPrice)}.
                </p>
              </div>

              {/* Pix QR Code Mockup */}
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-4">
                <div className="w-36 h-36 mx-auto bg-white rounded-xl p-2.5 shadow-lg flex items-center justify-center">
                  <QrCode className="w-32 h-32 text-zinc-950" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-zinc-200">
                    Pague com Pix Instantâneo (Mercado Pago / Asaas)
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Aprovação imediata da data em tempo real na agenda do fotógrafo.
                  </p>
                </div>

                <button
                  onClick={handleCopyPix}
                  className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-amber-400 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {copiedPix ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedPix ? 'Código Pix Copiado!' : 'Copiar Código Pix Copia e Cola'}</span>
                </button>
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  onClick={() => setStep('client_info')}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                >
                  ← Voltar
                </button>
                <button
                  onClick={handleConfirmBooking}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar Pagamento & Agendar</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: CONFIRMED */}
          {step === 'confirmed' && (
            <div className="py-6 text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-bold text-white">Agendamento Confirmado com Sucesso!</h4>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  A data foi reservada e lançada automaticamente no Google Agenda e no painel do estúdio.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-left max-w-md mx-auto text-xs space-y-2">
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400">Cliente:</span>
                  <span className="font-bold text-white">{clientName || 'Cliente'}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400">Serviço:</span>
                  <span className="font-bold text-amber-400">{currentPkg.title}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400">Data e Hora:</span>
                  <span className="font-mono text-zinc-200">
                    {selectedDate} às {selectedTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Sinal Pago via Pix:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {formatCurrency(currentPkg.depositPrice)} (Confirmado)
                  </span>
                </div>
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Concluir & Ver no Painel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
