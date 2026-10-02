import React, { useState } from 'react';
import { X, Copy, Check, Share2, MessageCircle, QrCode, Lock, ExternalLink } from 'lucide-react';
import { ClientGallery } from '../../types';

interface GalleryShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  gallery: ClientGallery | null;
  onOpenPortal: (gallery: ClientGallery) => void;
}

export const GalleryShareModal: React.FC<GalleryShareModalProps> = ({
  isOpen,
  onClose,
  gallery,
  onOpenPortal,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  if (!isOpen || !gallery) return null;

  const galleryUrl = `https://fluxoweby.fotogestor.app/g/${gallery.id}`;

  const defaultMessage = `Olá, ${gallery.clientName}! ✨\n\nSua galeria exclusiva "${gallery.title}" está pronta no FluxoWeby Galerias!\n\nVocê já pode visualizar suas fotos, favoritar e selecionar suas preferidas com todo o carinho.\n\n🔗 Acesse aqui: ${galleryUrl}${
    gallery.accessCode ? `\n🔑 Senha de acesso: ${gallery.accessCode}` : ''
  }\n📸 Pacote contratado: ${gallery.contractedPhotos} fotos inclusas.\n\nQualquer dúvida estamos à disposição!`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(galleryUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(defaultMessage);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(defaultMessage);
    const phone = gallery.clientPhone ? gallery.clientPhone.replace(/\D/g, '') : '';
    const waUrl = phone
      ? `https://wa.me/55${phone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    const link = document.createElement('a');
    link.href = waUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Compartilhar Galeria
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Envie o acesso direto para {gallery.clientName}
              </p>
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
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Link Section */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              Link Direto da Galeria
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-800 dark:text-zinc-200 truncate">
                {galleryUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 flex items-center gap-1.5 shrink-0 transition-colors"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {copiedLink ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>

          {/* Access Code Pill if configured */}
          {gallery.accessCode && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Senha de Acesso do Cliente:</span>
              </div>
              <span className="font-mono font-bold bg-white dark:bg-zinc-900 px-2 py-0.5 rounded border border-amber-500/30">
                {gallery.accessCode}
              </span>
            </div>
          )}

          {/* WhatsApp Action */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              Mensagem para WhatsApp
            </label>
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">
              {defaultMessage}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={handleWhatsAppShare}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Enviar no WhatsApp
              </button>
              <button
                onClick={handleCopyMessage}
                className="py-2.5 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedMessage ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {copiedMessage ? 'Copiada!' : 'Copiar Texto'}
              </button>
            </div>
          </div>

          {/* QR Code and Quick Preview */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-1 flex items-center justify-center">
                <QrCode className="w-9 h-9 text-zinc-800 dark:text-zinc-200" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                  Acesso via Celular
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  O cliente pode escanear o QR Code em tablets ou convites
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenPortal(gallery);
              }}
              className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              Testar Portal <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
