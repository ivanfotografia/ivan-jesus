import React, { useState } from 'react';
import {
  X,
  QrCode,
  Copy,
  CheckCircle2,
  Sparkles,
  CreditCard,
  Lock,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { ClientGallery } from '../../types';
import { useWork } from '../../context/WorkContext';

interface GalleryCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  gallery: ClientGallery | null;
  selectedPhotosCount?: number;
  onSuccess?: () => void;
}

export const GalleryCheckoutModal: React.FC<GalleryCheckoutModalProps> = ({
  isOpen,
  onClose,
  gallery,
  selectedPhotosCount,
  onSuccess,
}) => {
  const { settings, formatCurrency, approveGalleryOrder, createGalleryOrder } = useWork();

  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'mercadopago'>('pix');
  const [copiedPix, setCopiedPix] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen || !gallery) return null;

  const currentSelected =
    selectedPhotosCount !== undefined
      ? selectedPhotosCount
      : gallery.photos.filter((p) => p.selected).length;

  const contracted = gallery.contractedPhotos;
  const extraCount = Math.max(0, currentSelected - contracted);
  const unitPrice = gallery.extraPhotoPrice || settings.defaultExtraPhotoPrice || 35;
  const totalAmount = extraCount * unitPrice;

  // Pix string simulation
  const pixKey = settings.pixKey || 'pix@luminafoto.com.br';
  const simulatedPixCode = `00020126580014BR.GOV.BCB.PIX0114${pixKey}520400005303986540${totalAmount.toFixed(
    2
  )}5802BR5916${settings.studioName.replace(/[^a-zA-Z0-9 ]/g, '').slice(0, 16)}6009SAOPAULO62070503***6304${Math.floor(
    1000 + Math.random() * 9000
  )}`;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(simulatedPixCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const handleConfirmPayment = () => {
    setIsProcessing(true);

    setTimeout(() => {
      // Create and approve order
      const newOrder = createGalleryOrder({
        galleryId: gallery.id,
        sessionId: gallery.sessionId,
        clientName: gallery.clientName,
        clientEmail: gallery.clientEmail,
        clientPhone: gallery.clientPhone,
        contractedPhotos: contracted,
        selectedPhotosCount: currentSelected,
        extraPhotosCount: extraCount,
        extraPhotoPrice: unitPrice,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        paymentStatus: 'paid',
        pixCode: simulatedPixCode,
      });

      approveGalleryOrder(gallery.id, newOrder.id);
      setIsProcessing(false);
      setIsCompleted(true);

      if (onSuccess) onSuccess();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Checkout de Fotos Extras
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                  Pix / Mercado Pago
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{gallery.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {isCompleted ? (
            <div className="py-8 text-center space-y-4 animate-scaleUp">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Pagamento Confirmado!
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                  As {extraCount} fotos extras foram liberadas com sucesso. A receita de{' '}
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(totalAmount)}
                  </span>{' '}
                  foi integrada automaticamente ao painel financeiro do estúdio.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 max-w-sm mx-auto text-left space-y-1.5">
                <div className="flex justify-between">
                  <span>Galeria:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {gallery.title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Download liberado:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Sim (Alta Resolução)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Método:</span>
                  <span className="font-semibold uppercase">{paymentMethod}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs"
              >
                Concluir
              </button>
            </div>
          ) : (
            <>
              {/* Summary Card */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                  <span>Pacote contratado</span>
                  <span className="font-mono text-zinc-900 dark:text-zinc-100">
                    {contracted} fotos inclusas
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                  <span>Total de fotos selecionadas</span>
                  <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                    {currentSelected} fotos
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                  <span>Fotos extras adicionais</span>
                  <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                    +{extraCount} fotos ({formatCurrency(unitPrice)} cada)
                  </span>
                </div>

                <div className="border-t border-zinc-200 dark:border-zinc-700/60 pt-2.5 flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Valor total das fotos extras:
                  </span>
                  <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  Forma de Pagamento
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'pix'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    <span className="text-xs font-semibold">Pix Imediato</span>
                    <span className="text-[10px] text-zinc-400">Liberação automática</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mercadopago')}
                    className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'mercadopago'
                        ? 'border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400 ring-2 ring-sky-500/20'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="text-xs font-semibold">Mercado Pago</span>
                    <span className="text-[10px] text-zinc-400">Cartão até 3x</span>
                  </button>
                </div>
              </div>

              {/* Pix Details */}
              {paymentMethod === 'pix' ? (
                <div className="space-y-3.5 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800">
                  <div className="flex flex-col items-center text-center space-y-2">
                    {/* Visual QR Code Box */}
                    <div className="p-3 bg-white rounded-xl shadow-xs border border-zinc-200 inline-block">
                      <svg
                        className="w-36 h-36 text-zinc-900"
                        viewBox="0 0 100 100"
                        fill="currentColor"
                      >
                        {/* Realistic Mock SVG QR Code pattern */}
                        <path d="M0 0h30v30H0zM5 5h20v20H5zM10 10h10v10H10z" />
                        <path d="M70 0h30v30H70zM75 5h20v20H75zM80 10h10v10H80z" />
                        <path d="M0 70h30v30H0zM5 75h20v20H5zM10 80h10v10H10z" />
                        <path d="M40 10h10v10H40zM55 10h10v10H55zM35 35h15v10H35zM60 35h10v10H60zM40 50h20v10H40zM75 45h15v10H75zM75 60h10v15H75zM45 70h10v20H45zM65 75h25v15H65zM35 85h8v8H35z" />
                      </svg>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        Chave Pix: <span className="font-mono text-emerald-600">{pixKey}</span>
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        Abra o app do seu banco e escaneie o QR Code ou use o Pix Copia e Cola
                      </p>
                    </div>
                  </div>

                  {/* Pix Copy and Paste */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                      Código Pix Copia e Cola
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[11px] font-mono text-zinc-700 dark:text-zinc-300 truncate border border-zinc-200 dark:border-zinc-700">
                        {simulatedPixCode}
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyPix}
                        className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1 shrink-0 transition-colors"
                      >
                        {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedPix ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Mercado Pago Details */
                <div className="space-y-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        Mercado Pago Checkout Transparente
                      </h4>
                      <p className="text-[11px] text-zinc-500">
                        Pagamento seguro com cartão de crédito, boleto ou saldo
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs space-y-1">
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                      <span>1x de {formatCurrency(totalAmount)}</span>
                      <span className="text-emerald-600 font-medium">Sem juros</span>
                    </div>
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                      <span>2x de {formatCurrency(totalAmount / 2)}</span>
                      <span className="text-emerald-600 font-medium">Sem juros</span>
                    </div>
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                      <span>3x de {formatCurrency(totalAmount / 3)}</span>
                      <span className="text-emerald-600 font-medium">Sem juros</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Ambiente criptografado e certificado PCI-DSS</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleConfirmPayment}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Confirmando transação...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>
                        Confirmar Pagamento de {formatCurrency(totalAmount)} & Liberar Fotos
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-zinc-400">
                  Simulação de pagamento instantâneo: o pedido será aprovado e integrado ao financeiro.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
