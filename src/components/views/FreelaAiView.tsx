import React, { useState } from 'react';
import {
  Sparkles,
  Camera,
  Share2,
  DollarSign,
  MessageSquare,
  FileText,
  Copy,
  Check,
  Send,
  Loader2,
  HelpCircle,
  Lightbulb,
  Zap,
  Film,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import { CinematicCarouselModal } from '../modals/CinematicCarouselModal';

export const FreelaAiView: React.FC = () => {
  const { settings, formatCurrency } = useWork();

  const [activeMode, setActiveMode] = useState<
    'pose_direction' | 'instagram_copy' | 'client_objections' | 'pricing_calculator' | 'strategies' | 'contract_generator' | 'cinematic_carousel'
  >('pose_direction');

  const [isCarouselModalOpen, setIsCarouselModalOpen] = useState(false);

  const [userPrompt, setUserPrompt] = useState('');
  const [sessionContext, setSessionContext] = useState('Ensaio Casal em locação externa ao entardecer');
  const [isLoading, setIsLoading] = useState(false);
  const [responseResult, setResponseResult] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [aiCreditsUsed, setAiCreditsUsed] = useState(3);

  // Precifique calculator fields
  const [calcHoursShooting, setCalcHoursShooting] = useState(2);
  const [calcHoursEditing, setCalcHoursEditing] = useState(4);
  const [calcHourlyRate, setCalcHourlyRate] = useState(settings.defaultHourlyRate || 140);
  const [calcDirectCosts, setCalcDirectCosts] = useState(150);
  const [calcDesiredMargin, setCalcDesiredMargin] = useState(45);

  const calculateSuggestedPrice = () => {
    const timeCost = (calcHoursShooting + calcHoursEditing) * calcHourlyRate;
    const totalCost = timeCost + calcDirectCosts;
    const finalPrice = totalCost / (1 - calcDesiredMargin / 100);
    return Math.round(finalPrice / 10) * 10;
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setResponseResult('');

    try {
      const endpoint = activeMode === 'contract_generator' ? '/api/ai/generate-contract' : '/api/ai/freela';
      const body =
        activeMode === 'contract_generator'
          ? {
              sessionType: sessionContext,
              clientName: 'Cliente Contratante',
              studioName: settings.studioName,
              photographerName: settings.photographerName,
              packagePrice: formatCurrency(2500),
            }
          : {
              mode: activeMode,
              prompt: userPrompt || 'Gere recomendações especializadas para este tipo de ensaio fotográfico.',
              context: sessionContext,
            };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        setResponseResult(data.result || data.contract || 'Resultado gerado com sucesso.');
        setAiCreditsUsed((prev) => Math.min(10, prev + 1));
      } else {
        throw new Error('Falha na resposta do servidor');
      }
    } catch (err) {
      // Fallback smart responses
      if (activeMode === 'pose_direction') {
        setResponseResult(`✨ **Roteiro de Poses & Direção Natural (FREELA):**\n\n1. **Caminhada Descontraída:** Peça para o casal caminhar de mãos dadas em direção à câmera contando a primeira memória engraçada do relacionamento. Dispare em modo contínuo (Burst).\n2. **Abraço por trás com quebra-gelo:** Ele abraça pela cintura e sussurra no ouvido dela qual foi o primeiro pensamento quando a viu. Capture o riso espontâneo.\n3. **Close Intimista (85mm f/1.8):** Aproxime para um plano fechado. Testas encostadas de olhos fechados sentindo a brisa suave. Luz dourada de recorte.\n4. **Giro dinâmico:** Ela dá um giro suave com o vestido enquanto ele a segura com uma das mãos. Movimento e leveza!\n\n💡 *Dica FREELA:* Direcione ações e perguntas em vez de posições estáticas.`);
      } else if (activeMode === 'instagram_copy') {
        setResponseResult(`📸 **Legenda Magnética para Instagram:**\n\nO amor de verdade mora nas entrelinhas. No olhar cúmplice, nas mãos dadas sem soltar e na certeza de que encontramos o nosso lugar no mundo.\n\nRegistrar momentos como esse me faz lembrar por que a fotografia é a arte de pausar o tempo para sempre.\n\nDeslize para o lado para se encantar com esse ensaio ➡️✨\n\n💬 *Qual dessas fotos tocou mais você? Comenta aqui embaixo!*\n\n📅 **Agenda aberta para o próximo semestre.** Link no direct para garantir a sua data com o ${settings.studioName}.\n\n---\n#fotografiadecasal #noivos2026 #fotografiacomafeto #ensaioprewedding #momentosunicos`);
      } else if (activeMode === 'client_objections') {
        setResponseResult(`💼 **Resposta Elegante para "Está caro / Achei outro mais barato":**\n\n"Olá, [Nome do Cliente]! Tudo bem?\n\nEntendo perfeitamente a sua pesquisa. No mercado existem opções com diferentes propostas e equipamentos. No nosso estúdio, nós não entregamos apenas arquivos digitais: garantimos segurança absoluta com backup duplo redundante em tempo real no local, lentes de altíssima nitidez para baixa luminosidade e uma pós-produção artesanal de cor e pele para valorizar a sua história com excelência.\n\nPara viabilizar que você tenha esse registro sem apertar o orçamento, consigo dividir o investimento em até 10x no cartão ou oferecer 5% de desconto para pagamento à vista no Pix.\n\nVamos garantir a sua reserva para a data não ser preenchida?"`);
      } else if (activeMode === 'strategies') {
        setResponseResult(`🚀 **Estratégia de Captação de Clientes (FREELA AI):**\n\n1. **Ação VIP de Aniversário de Ensaio:** Mande uma mensagem para clientes que fotografaram com você há 1 ano oferecendo um mini-álbum de recordação ou um desconto exclusivo para uma nova sessão.\n2. **Parceria com Espaços & Cerimonialistas:** Visite espaços de eventos locais e presenteie os proprietários com fotos profissionais do ambiente decorado para o portfólio deles em troca de recomendação direta aos noivos.\n3. **Campanha Relâmpago de Fotos Extras:** Abra a galeria de clientes dos últimos 6 meses com um cupom de 20% para compra de fotos extras por Pix nas próximas 48 horas.`);
      } else {
        setResponseResult(`MINUTA DE CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS\n\nCONTRATADA: ${settings.studioName}, representada por ${settings.photographerName}.\nCONTRATANTE: Cliente Contratante.\n\n1. DO OBJETO: Cobertura profissional na categoria ${sessionContext}.\n2. DO VALOR E SINAL: Valor ajustado conforme proposta comercial, com sinal de reserva de data e saldo antes da entrega dos arquivos.\n3. DOS DIREITOS AUTORAIS: Nos termos da Lei 9.610/98, os direitos morais pertencem ao autor, com licença irrevogável de uso pessoal ao cliente.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!responseResult) return;
    navigator.clipboard.writeText(responseResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Assistente Especializado
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-display mt-1">
            FREELA · O Copiloto IA do Fotógrafo
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Direção de poses espontâneas, copy para Instagram, resposta a objeções difíceis, cálculo de preços (Precifique) e estratégias de captação de clientes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-2.5 rounded-xl bg-white dark:bg-[#18181c] border border-zinc-200 dark:border-white/[0.08] text-xs font-mono">
            <span className="text-zinc-400">Estratégias IA no mês: </span>
            <strong className="text-amber-500">{aiCreditsUsed}/10 utilizadas</strong>
          </div>
        </div>
      </div>

      {/* Mode Selectors */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
        {[
          { id: 'cinematic_carousel', label: 'Carrossel Cinemático', icon: Film },
          { id: 'pose_direction', label: 'Direção de Poses', icon: Camera },
          { id: 'instagram_copy', label: 'Legendas Instagram', icon: Share2 },
          { id: 'client_objections', label: 'Contornar Objeções', icon: MessageSquare },
          { id: 'pricing_calculator', label: 'Precifique (Calculadora)', icon: DollarSign },
          { id: 'strategies', label: 'Estratégias de Venda', icon: Lightbulb },
          { id: 'contract_generator', label: 'Contratos com IA', icon: FileText },
        ].map((m) => {
          const Icon = m.icon;
          const isActive = activeMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => {
                setActiveMode(m.id as any);
                if (m.id === 'cinematic_carousel') {
                  setIsCarouselModalOpen(true);
                }
              }}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                isActive
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-500 shadow-xs'
                  : 'bg-white dark:bg-[#151518] border-zinc-200 dark:border-white/[0.07] text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-white/[0.15]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-bold leading-tight">{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Workspace Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input Configuration Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.07] space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-display">
              Configurar Parâmetros
            </h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Contexto do Ensaio / Cliente
              </label>
              <input
                type="text"
                value={sessionContext}
                onChange={(e) => setSessionContext(e.target.value)}
                placeholder="Ex: Casamento no campo, Ensaio gestante 30 semanas, etc."
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.1] text-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* Special Precifique Calculator Mode Controls */}
            {activeMode === 'pricing_calculator' ? (
              <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-white/[0.06]">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Horas de Sessão</label>
                    <input
                      type="number"
                      value={calcHoursShooting}
                      onChange={(e) => setCalcHoursShooting(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.1]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Horas de Edição</label>
                    <input
                      type="number"
                      value={calcHoursEditing}
                      onChange={(e) => setCalcHoursEditing(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.1]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Hora Técnica (R$)</label>
                    <input
                      type="number"
                      value={calcHourlyRate}
                      onChange={(e) => setCalcHourlyRate(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.1]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Custos Diretos (R$)</label>
                    <input
                      type="number"
                      value={calcDirectCosts}
                      onChange={(e) => setCalcDirectCosts(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.1]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Margem Líquida de Lucro: {calcDesiredMargin}%</label>
                  <input
                    type="range"
                    min={20}
                    max={70}
                    value={calcDesiredMargin}
                    onChange={(e) => setCalcDesiredMargin(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1">
                  <div className="text-[11px] text-amber-500 font-mono font-semibold uppercase">Preço Recomendado:</div>
                  <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(calculateSuggestedPrice())}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Detalhes ou Instruções Extras
                </label>
                <textarea
                  rows={4}
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="Ex: O casal é muito tímido e não gosta de olhar para a câmera; ou o cliente achou caro em relação a um amigo iniciante..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.1] text-zinc-900 dark:text-zinc-100 resize-none"
                />
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-xs font-bold text-zinc-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Consultando FREELA IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Gerar com Inteligência Artificial</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Output Display Column */}
        <div className="lg:col-span-7">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.07] min-h-[420px] flex flex-col justify-between space-y-4">
            <div className="space-y-3 flex-1">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-xs font-mono font-bold uppercase text-zinc-900 dark:text-zinc-100">
                    Resposta do Assistente FREELA
                  </span>
                </div>

                {responseResult && (
                  <button
                    onClick={handleCopy}
                    className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                )}
              </div>

              {responseResult ? (
                <div className="prose prose-sm dark:prose-invert max-w-none text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans whitespace-pre-line">
                  {responseResult}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-zinc-400 space-y-2">
                  <Sparkles className="w-8 h-8 text-amber-500/40" />
                  <p className="text-xs max-w-sm">
                    Selecione um modo acima, insira o contexto do seu ensaio e clique no botão para gerar poses, legendas, precificação ou contratos inteligentes.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-400">
              <span>Modelo: Gemini 3.8 Flash • Especializado em Negócios de Fotografia</span>
              <span>100% Personalizado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cinematic Carousel Studio Modal */}
      <CinematicCarouselModal
        isOpen={isCarouselModalOpen}
        onClose={() => setIsCarouselModalOpen(false)}
      />
    </div>
  );
};
