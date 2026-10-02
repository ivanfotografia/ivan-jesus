import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Printer,
  Camera,
  Check,
  FileDown,
  PenTool,
  RotateCcw,
  CheckCircle2,
  Lock,
  Calendar,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import { generateContractPdf } from '../../utils/contractPdfGenerator';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSessionId?: string;
}

export const ContractModal: React.FC<ContractModalProps> = ({
  isOpen,
  onClose,
  defaultSessionId,
}) => {
  const { sessions, clients, settings, formatCurrency } = useWork();

  const [selectedSessionId, setSelectedSessionId] = useState(
    defaultSessionId || sessions[0]?.id || ''
  );
  const [docType, setDocType] = useState<'contract' | 'receipt' | 'proposal'>('contract');
  const [deliveryDays, setDeliveryDays] = useState(25);
  const [paymentTerms, setPaymentTerms] = useState(
    '50% no ato da contratação como sinal de reserva da data e 50% até o dia da realização da sessão fotográfica.'
  );

  // Digital Signature State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);

  useEffect(() => {
    if (defaultSessionId) {
      setSelectedSessionId(defaultSessionId);
    }
  }, [defaultSessionId]);

  if (!isOpen) return null;

  const currentSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0];
  const client = currentSession ? clients.find((c) => c.id === currentSession.clientId) : undefined;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    if (!currentSession) return;
    generateContractPdf({
      session: currentSession,
      client,
      settings,
      deliveryDays,
      paymentTerms,
      signatureDataUrl: signatureData || undefined,
      documentType: docType,
    });
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#18181b';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current) {
      setSignatureData(canvasRef.current.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
  };

  const todayStr = new Date().toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#121215] rounded-2xl border border-zinc-200 dark:border-white/[0.08] shadow-2xl max-w-5xl w-full max-h-[95vh] flex flex-col overflow-hidden text-zinc-900 dark:text-zinc-100 transition-colors">
        {/* Modal Controls Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-b border-zinc-200 dark:border-white/[0.08] bg-zinc-50/80 dark:bg-zinc-900/60 no-print">
          <div className="flex items-center gap-3">
            <Camera className="w-5 h-5 text-amber-500" />
            <div className="flex items-center gap-1 p-1 bg-zinc-200/70 dark:bg-zinc-800 rounded-xl">
              <button
                onClick={() => setDocType('contract')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  docType === 'contract'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                Contrato Jurídico
              </button>
              <button
                onClick={() => setDocType('receipt')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  docType === 'receipt'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                Recibo / Fatura
              </button>
              <button
                onClick={() => setDocType('proposal')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  docType === 'proposal'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                Proposta Comercial
              </button>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="text-xs px-3 py-1.5 border border-zinc-200 dark:border-white/[0.08] rounded-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none"
            >
              {sessions.map((s) => {
                const c = clients.find((item) => item.id === s.clientId);
                return (
                  <option key={s.id} value={s.id}>
                    {s.title} ({c?.name || 'Cliente'})
                  </option>
                );
              })}
            </select>

            {/* Signature Toggle */}
            <button
              onClick={() => setShowSignaturePad((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                signatureData
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : showSignaturePad
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400'
                  : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>{signatureData ? 'Assinado ✓' : 'Assinar na Tela'}</span>
            </button>

            {/* Direct Official PDF Download */}
            <button
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all shadow-xs cursor-pointer"
              title="Baixar Contrato Formatado em PDF Oficial (A4)"
            >
              <FileDown className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Baixar PDF Oficial</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl transition-colors cursor-pointer"
              title="Imprimir pelo navegador"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors p-1.5 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Digital Signature Drawer (if active) */}
        {showSignaturePad && (
          <div className="bg-amber-50/80 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-900/40 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top duration-150">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-900 dark:text-amber-200">
                <PenTool className="w-4 h-4 text-amber-500" />
                <span>Assinatura Digital Manuscrita (Touch / Mouse):</span>
              </div>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-400/80">
                Rubrique ou assine na caixa ao lado. A assinatura será inserida no contrato e no PDF gerado.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white rounded-xl border border-amber-300 dark:border-amber-700 overflow-hidden shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={240}
                  height={70}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="cursor-crosshair touch-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={clearSignature}
                  className="p-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 rounded-lg transition-colors border border-zinc-200 dark:border-zinc-700 cursor-pointer flex items-center gap-1"
                  title="Limpar assinatura"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Limpar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSignaturePad(false)}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-amber-500 text-zinc-950 rounded-lg hover:bg-amber-400 transition-colors cursor-pointer"
                >
                  Concluir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Document Content Sheet */}
        <div className="flex-1 overflow-y-auto bg-zinc-100/70 dark:bg-[#0c0c0e] p-4 sm:p-8">
          <div className="bg-white text-zinc-900 rounded-2xl p-8 sm:p-12 shadow-lg border border-zinc-200 max-w-3xl mx-auto font-sans leading-relaxed">
            {/* Header of the document */}
            <div className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">
                  {settings.studioName}
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  {settings.photographerName} · {settings.specialty}
                </p>
                <div className="text-[11px] text-slate-500 font-mono mt-1 space-y-0.5">
                  <p>CNPJ/CPF: {settings.fiscalId}</p>
                  <p>Instagram: {settings.instagram} · WhatsApp: {settings.phone}</p>
                  <p>E-mail: {settings.email}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs uppercase font-mono font-bold tracking-wider text-slate-500 block">
                  {docType === 'contract'
                    ? 'Instrumento Particular de Contrato'
                    : docType === 'receipt'
                    ? 'Recibo de Pagamento Fotográfico'
                    : 'Proposta de Cobertura Fotográfica'}
                </span>
                <p className="text-base font-bold font-mono mt-1 text-slate-900">
                  Nº {currentSession?.id.slice(-6).toUpperCase()} / 2026
                </p>
                <p className="text-xs text-slate-500 mt-1">{todayStr}</p>
              </div>
            </div>

            {/* Document Body */}
            {docType === 'contract' ? (
              <div className="space-y-6 text-xs text-slate-700 leading-normal">
                <p className="text-justify">
                  Pelo presente instrumento particular, de um lado <strong>{settings.studioName}</strong>, inscrito no CNPJ/CPF sob nº <strong>{settings.fiscalId}</strong>, doravante denominado simplesmente <strong>CONTRATADA</strong>, e de outro lado <strong>{client?.name || 'Cliente'}</strong>, documento nº <strong>{client?.document || '000.000.000-00'}</strong>, contato <strong>{client?.phone || '(00) 00000-0000'}</strong>, doravante denominado <strong>CONTRATANTE</strong>, têm entre si justo e acordado o que segue:
                </p>

                <section>
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
                    Cláusula 1ª - Do Objeto do Contrato
                  </h3>
                  <p>
                    O presente contrato tem por objeto a prestação de serviços de cobertura fotográfica profissional na modalidade <strong>{currentSession?.title}</strong>, a ser realizado na data provável de <strong>{currentSession?.sessionDate}</strong> com início às <strong>{currentSession?.sessionTime || '15:00'}</strong>, no local denominado <strong>{currentSession?.location}</strong>.
                  </p>
                </section>

                <section>
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
                    Cláusula 2ª - Dos Serviços e Entregáveis Inclusos
                  </h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Cobertura fotográfica com câmeras profissionais e lentes de alta nitidez.</li>
                    <li>Entrega de no mínimo <strong>{currentSession?.contractedPhotos || 30} fotografias</strong> tratadas individualmente em alta resolução digital.</li>
                    <li>Disponibilização de galeria web protegida por senha para visualização e seleção de fotos extras.</li>
                    <li>Fotos adicionais poderão ser adquiridas pelo valor de <strong>{formatCurrency(currentSession?.extraPhotoPrice || 35)} por fotografia extra</strong>.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
                    Cláusula 3ª - Dos Valores & Condições de Pagamento
                  </h3>
                  <p>
                    Pela prestação dos serviços contratados, o CONTRATANTE pagará o valor total de <strong>{formatCurrency(currentSession?.packagePrice || 0)}</strong>, sendo:
                  </p>
                  <ul className="list-disc pl-5 mt-1 space-y-0.5">
                    <li>Sinal de reserva no valor de <strong>{formatCurrency(currentSession?.depositAmount || 0)}</strong> (garantia da data reservada na agenda).</li>
                    <li>Saldo restante de <strong>{formatCurrency((currentSession?.packagePrice || 0) - (currentSession?.depositAmount || 0))}</strong> a ser quitado até a data da sessão.</li>
                    <li>Chave PIX para pagamento: <strong className="font-mono">{settings.pixKey}</strong> ({settings.photographerName}).</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
                    Cláusula 4ª - Dos Prazos de Entrega
                  </h3>
                  <p>
                    A galeria online protegida para visualização e seleção das fotos será disponibilizada em até <strong>7 (sete) dias úteis</strong> após o evento. O prazo final para entrega das fotos tratadas e em alta definição é de até <strong>{deliveryDays} dias úteis</strong> a contar da confirmação da seleção feita pelo CONTRATANTE.
                  </p>
                </section>

                <section>
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
                    Cláusula 5ª - Dos Direitos Autorais & Uso de Imagem
                  </h3>
                  <p>
                    Em conformidade com a Lei de Direitos Autorais (Lei nº 9.610/98), os direitos autorais e morais sobre as imagens pertencem ao FOTÓGRAFO. É concedida ao CONTRATANTE a licença perpétua para uso pessoal, impressão e compartilhamento em redes sociais. Fica autorizada a inclusão de imagens no portfólio profissional do fotógrafo, redes sociais e mostruários impressos.
                  </p>
                </section>

                {/* Signatures */}
                <div className="pt-12 grid grid-cols-2 gap-8 text-center text-xs">
                  <div>
                    <div className="border-t border-slate-400 pt-2 font-medium">
                      {settings.photographerName}
                    </div>
                    <span className="text-slate-500 text-[10px]">CONTRATADA / FOTÓGRAFO</span>
                  </div>

                  <div>
                    {signatureData ? (
                      <div className="mb-1 flex flex-col items-center">
                        <img
                          src={signatureData}
                          alt="Assinatura Digital"
                          className="h-10 object-contain"
                        />
                        <span className="text-[9px] text-emerald-600 font-mono font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Assinado Digitalmente
                        </span>
                      </div>
                    ) : (
                      <div className="h-6" />
                    )}
                    <div className="border-t border-slate-400 pt-2 font-medium">
                      {client?.name || 'Contratante'}
                    </div>
                    <span className="text-slate-500 text-[10px]">CONTRATANTE</span>
                  </div>
                </div>
              </div>
            ) : docType === 'receipt' ? (
              /* RECEIPT / FATURA */
              <div className="space-y-6 text-xs text-slate-700">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300 text-slate-900 font-bold">
                      <th className="py-2 text-left">Item / Descrição do Serviço</th>
                      <th className="py-2 text-center">Qtd.</th>
                      <th className="py-2 text-right">Valor Unitário</th>
                      <th className="py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-3">
                        <p className="font-semibold text-slate-900">{currentSession?.title}</p>
                        <p className="text-slate-500 text-[11px]">Pacote com {currentSession?.contractedPhotos || 30} fotos tratadas em alta resolução</p>
                      </td>
                      <td className="py-3 text-center font-mono">1</td>
                      <td className="py-3 text-right font-mono tabular-nums">{formatCurrency(currentSession?.packagePrice || 0)}</td>
                      <td className="py-3 text-right font-mono font-semibold tabular-nums text-slate-900">{formatCurrency(currentSession?.packagePrice || 0)}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="border-t border-slate-300 pt-4 flex justify-end">
                  <div className="w-64 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Total dos Serviços:</span>
                      <span className="font-mono tabular-nums font-bold text-slate-900">
                        {formatCurrency(currentSession?.packagePrice || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
                  <p className="font-bold text-slate-900">Dados para Pagamento via PIX:</p>
                  <p className="font-mono text-slate-700">Chave PIX: {settings.pixKey}</p>
                  <p className="text-slate-600">Beneficiário: {settings.photographerName} · {settings.studioName}</p>
                </div>
              </div>
            ) : (
              /* PROPOSAL */
              <div className="space-y-6 text-xs text-slate-700">
                <p className="text-sm text-slate-800">
                  Olá <strong>{client?.name || 'Cliente'}</strong>, é uma honra apresentar a proposta comercial para a realização do seu <strong>{currentSession?.title}</strong>.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                    <h4 className="font-bold text-slate-900 mb-2">O QUE ESTÁ INCLUSO:</h4>
                    <ul className="space-y-1.5 list-disc pl-4">
                      <li>Cobertura fotográfica profissional no local combinado</li>
                      <li>Equipamentos de alta resolução com backup em slot duplo</li>
                      <li>{currentSession?.contractedPhotos || 30} fotos com tratamento de cor refinado e pele natural</li>
                      <li>Galeria online privada para download e compartilhamento com familiares</li>
                      <li>Prazo de entrega em até {deliveryDays} dias úteis</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                    <h4 className="font-bold text-slate-900 mb-2">INVESTIMENTO & RESERVA:</h4>
                    <div className="text-2xl font-bold font-mono text-slate-900 my-2">
                      {formatCurrency(currentSession?.packagePrice || 0)}
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Reserva confirmada mediante sinal de {formatCurrency(currentSession?.depositAmount || 0)}.
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Fotos extras além do pacote: {formatCurrency(currentSession?.extraPhotoPrice || 35)} por imagem.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
