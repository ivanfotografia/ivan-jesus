import React, { useState, useMemo } from 'react';
import {
  X,
  Heart,
  Check,
  CheckCircle2,
  Download,
  Share2,
  Smartphone,
  Monitor,
  Shield,
  ShieldAlert,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Lock,
  ShoppingBag,
  SlidersHorizontal,
} from 'lucide-react';
import { ClientGallery, GalleryPhoto } from '../../types';
import { useWork } from '../../context/WorkContext';

interface ClientGalleryPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  gallery: ClientGallery | null;
  onOpenCheckout: (gallery: ClientGallery) => void;
  onOpenShare: (gallery: ClientGallery) => void;
}

type ViewportMode = 'mobile' | 'desktop';
type FilterFilter = 'all' | 'selected' | 'favorites';

export const ClientGalleryPortalModal: React.FC<ClientGalleryPortalModalProps> = ({
  isOpen,
  onClose,
  gallery,
  onOpenCheckout,
  onOpenShare,
}) => {
  const {
    settings,
    formatCurrency,
    togglePhotoSelection,
    togglePhotoFavorite,
  } = useWork();

  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');
  const [filterMode, setFilterMode] = useState<FilterFilter>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [clientWatermark, setClientWatermark] = useState<boolean>(true);
  const [showDownloadAlert, setShowDownloadAlert] = useState(false);

  // Sync initial watermark setting
  React.useEffect(() => {
    if (gallery) {
      setClientWatermark(gallery.watermarkEnabled);
    }
  }, [gallery]);

  if (!isOpen || !gallery) return null;

  const photos = gallery.photos || [];
  const selectedPhotos = photos.filter((p) => p.selected);
  const favoritePhotos = photos.filter((p) => p.favorited);

  const contractedCount = gallery.contractedPhotos;
  const currentSelectedCount = selectedPhotos.length;
  const extraCount = Math.max(0, currentSelectedCount - contractedCount);
  const extraPrice = gallery.extraPhotoPrice || settings.defaultExtraPhotoPrice || 35;
  const extraTotalAmount = extraCount * extraPrice;

  // Filtered photos
  const displayedPhotos = photos.filter((p) => {
    if (filterMode === 'selected') return p.selected;
    if (filterMode === 'favorites') return p.favorited;
    return true;
  });

  const handleDownloadAttempt = () => {
    if (extraCount > 0 && !gallery.downloadAllowed) {
      setShowDownloadAlert(true);
      setTimeout(() => setShowDownloadAlert(false), 5000);
    } else {
      // Simulate download of high-res package
      const link = document.createElement('a');
      link.href = gallery.coverImage;
      link.download = `${gallery.title.replace(/\s+/g, '_')}_selecao.zip`;
      link.click();
    }
  };

  const handleNextPhoto = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % displayedPhotos.length);
    }
  };

  const handlePrevPhoto = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(
        (lightboxIndex - 1 + displayedPhotos.length) % displayedPhotos.length
      );
    }
  };

  const currentLightboxPhoto =
    lightboxIndex !== null ? displayedPhotos[lightboxIndex] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-fadeIn p-0 sm:p-4">
      {/* Container with Device Frame or Full Screen */}
      <div className="w-full h-full flex flex-col justify-between max-w-7xl max-h-[98vh] bg-zinc-950 text-zinc-100 rounded-none sm:rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden">
        {/* Top Control Bar (Photographer simulator bar) */}
        <div className="px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-xs shrink-0 select-none">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Portal do Cliente · FluxoWeby</span>
            </div>
            <span className="hidden sm:inline text-zinc-400 font-mono text-[11px]">
              {gallery.title}
            </span>
          </div>

          {/* Viewport switch buttons (like flyer showing smartphone + laptop) */}
          <div className="flex items-center gap-2">
            <div className="bg-zinc-800 p-0.5 rounded-lg flex items-center">
              <button
                type="button"
                onClick={() => setViewportMode('desktop')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-colors ${
                  viewportMode === 'desktop'
                    ? 'bg-zinc-700 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Visualização Computador"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setViewportMode('mobile')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-colors ${
                  viewportMode === 'mobile'
                    ? 'bg-zinc-700 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Visualização Celular (Mockup do Flyer)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Celular</span>
              </button>
            </div>

            <button
              onClick={() => onOpenShare(gallery)}
              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] flex items-center gap-1 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Compartilhar</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport Area */}
        <div className="flex-1 overflow-hidden flex items-center justify-center p-0 sm:p-2 bg-zinc-950">
          <div
            className={`h-full transition-all duration-300 flex flex-col ${
              viewportMode === 'mobile'
                ? 'w-[390px] max-h-[820px] rounded-[42px] border-[8px] border-zinc-800 shadow-2xl relative overflow-hidden bg-zinc-900'
                : 'w-full rounded-xl border border-zinc-800/60 bg-zinc-900 overflow-hidden'
            }`}
          >
            {/* Mobile notch header simulation */}
            {viewportMode === 'mobile' && (
              <div className="h-6 bg-zinc-950 flex items-center justify-between px-6 text-[10px] text-zinc-400 shrink-0 select-none">
                <span>09:41</span>
                <div className="w-16 h-3.5 bg-zinc-900 rounded-full" />
                <span className="font-mono">5G 100%</span>
              </div>
            )}

            {/* Client Portal Content View */}
            <div className="flex-1 overflow-y-auto flex flex-col scroll-smooth">
              {/* Client Gallery Header / Hero */}
              <div className="relative bg-zinc-950 shrink-0">
                <div className="h-44 sm:h-64 relative overflow-hidden">
                  <img
                    src={gallery.coverImage}
                    alt={gallery.title}
                    className="w-full h-full object-cover filter brightness-70"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

                  {/* Brand Pill in Hero */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-semibold text-white tracking-wide border border-white/10 uppercase">
                      {settings.studioName}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-[10px] font-bold text-zinc-950">
                      FluxoWeby Galerias
                    </span>
                  </div>
                </div>

                <div className="px-4 sm:px-8 -mt-12 sm:-mt-16 relative z-10 space-y-2">
                  <div className="inline-block px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[11px] font-semibold border border-amber-500/30 capitalize">
                    {gallery.category.replace('_', ' ')} · {gallery.date}
                  </div>
                  <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {gallery.title}
                  </h1>
                  <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                    {gallery.customMessage ||
                      'Mais que fotos, grandes histórias! Selecione suas fotos favoritas marcando o coração.'}
                  </p>
                </div>
              </div>

              {/* Floating Client Sticky Selection Bar */}
              <div className="sticky top-0 z-30 bg-zinc-900/95 backdrop-blur-md border-y border-zinc-800 px-4 sm:px-8 py-3 mt-6 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Counters */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-zinc-400">Pacote:</span>
                      <span className="font-mono font-bold text-zinc-200">
                        {contractedCount} inclusas
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-zinc-400">Selecionadas:</span>
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded-full ${
                          currentSelectedCount > contractedCount
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-zinc-800 text-zinc-200'
                        }`}
                      >
                        {currentSelectedCount} / {contractedCount}
                      </span>
                    </div>

                    {extraCount > 0 && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 animate-pulse">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>
                          +{extraCount} extras ({formatCurrency(extraTotalAmount)})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions & Filters */}
                  <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
                    {/* Filter Pills */}
                    <div className="flex items-center bg-zinc-800/80 p-0.5 rounded-lg text-[11px]">
                      <button
                        onClick={() => setFilterMode('all')}
                        className={`px-2 py-1 rounded-md transition-colors ${
                          filterMode === 'all'
                            ? 'bg-zinc-700 text-white font-medium'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        Todas ({photos.length})
                      </button>
                      <button
                        onClick={() => setFilterMode('selected')}
                        className={`px-2 py-1 rounded-md transition-colors ${
                          filterMode === 'selected'
                            ? 'bg-zinc-700 text-white font-medium'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        Selecionadas ({selectedPhotos.length})
                      </button>
                      <button
                        onClick={() => setFilterMode('favorites')}
                        className={`px-2 py-1 rounded-md transition-colors ${
                          filterMode === 'favorites'
                            ? 'bg-zinc-700 text-white font-medium'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        Favoritas ({favoritePhotos.length})
                      </button>
                    </div>

                    {/* Watermark toggle */}
                    <button
                      onClick={() => setClientWatermark(!clientWatermark)}
                      className={`px-2 py-1 rounded-lg text-[11px] border flex items-center gap-1 transition-colors ${
                        clientWatermark
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                          : 'border-zinc-700 text-zinc-400 hover:text-zinc-200'
                      }`}
                      title="Alternar marca d'água de proteção"
                    >
                      <Shield className="w-3 h-3" />
                      <span>{clientWatermark ? 'Marca Ativa' : 'Sem Marca'}</span>
                    </button>

                    {/* Checkout Button */}
                    <button
                      onClick={() => onOpenCheckout(gallery)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {extraCount > 0 ? (
                        <span>Pagar Extras ({formatCurrency(extraTotalAmount)})</span>
                      ) : (
                        <span>Finalizar Seleção</span>
                      )}
                    </button>

                    {/* Download Button */}
                    <button
                      onClick={handleDownloadAttempt}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                      title="Download das fotos selecionadas"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Download Protection Alert if extras not paid */}
                {showDownloadAlert && (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>
                        Você possui {extraCount} fotos extras selecionadas. Conclua o pagamento via
                        Pix ou Mercado Pago para liberar o download em alta resolução!
                      </span>
                    </div>
                    <button
                      onClick={() => onOpenCheckout(gallery)}
                      className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded text-[11px] shrink-0"
                    >
                      Pagar Agora
                    </button>
                  </div>
                )}
              </div>

              {/* Photo Grid */}
              <div className="p-4 sm:p-8 flex-1">
                {displayedPhotos.length === 0 ? (
                  <div className="py-20 text-center text-zinc-500 space-y-2">
                    <p className="text-sm">Nenhuma foto encontrada para o filtro selecionado.</p>
                    <button
                      onClick={() => setFilterMode('all')}
                      className="text-xs text-amber-400 hover:underline"
                    >
                      Ver todas as fotos
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                    {displayedPhotos.map((photo, index) => {
                      const isSelected = !!photo.selected;
                      const isFavorited = !!photo.favorited;

                      return (
                        <div
                          key={photo.id}
                          className={`group relative rounded-xl overflow-hidden bg-zinc-900 border transition-all duration-200 aspect-3/2 sm:aspect-4/3 cursor-pointer ${
                            isSelected
                              ? 'border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-950/40'
                              : 'border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          {/* Image */}
                          <img
                            src={photo.url}
                            alt={photo.filename}
                            loading="lazy"
                            onClick={() => setLightboxIndex(index)}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
                          />

                          {/* Watermark Overlay (Flyer feature: Proteção e marca d'água) */}
                          {clientWatermark && (
                            <div
                              onClick={() => setLightboxIndex(index)}
                              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
                            >
                              <div className="transform -rotate-25 text-white/35 font-bold font-mono tracking-widest text-xs sm:text-sm drop-shadow-md text-center px-2">
                                {gallery.watermarkText || `${settings.studioName} · Prova`}
                              </div>
                            </div>
                          )}

                          {/* Top Action Overlay (Selection & Favorite) */}
                          <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10 pointer-events-auto">
                            {/* Favorite Heart Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePhotoFavorite(gallery.id, photo.id);
                              }}
                              className={`p-1.5 rounded-full transition-transform active:scale-90 ${
                                isFavorited
                                  ? 'bg-rose-600 text-white shadow-md'
                                  : 'bg-black/50 hover:bg-black/80 text-white/80'
                              }`}
                              title={isFavorited ? 'Remover dos favoritos' : 'Favoritar foto'}
                            >
                              <Heart
                                className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`}
                              />
                            </button>

                            {/* Selection Check Circle Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePhotoSelection(gallery.id, photo.id);
                              }}
                              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold transition-all active:scale-95 ${
                                isSelected
                                  ? 'bg-emerald-600 text-white shadow-md'
                                  : 'bg-black/60 hover:bg-black/85 text-white/90 border border-white/20'
                              }`}
                              title={isSelected ? 'Desmarcar seleção' : 'Selecionar foto'}
                            >
                              <CheckCircle2
                                className={`w-3.5 h-3.5 ${
                                  isSelected ? 'fill-emerald-100 text-emerald-700' : ''
                                }`}
                              />
                              <span className="text-[10px]">
                                {isSelected ? 'Escolhida' : 'Escolher'}
                              </span>
                            </button>
                          </div>

                          {/* Bottom filename on hover */}
                          <div
                            onClick={() => setLightboxIndex(index)}
                            className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between text-[10px] text-zinc-300"
                          >
                            <span className="truncate">{photo.filename}</span>
                            <Maximize2 className="w-3 h-3 text-zinc-400 shrink-0" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Portal Footer */}
              <div className="p-6 border-t border-zinc-800/80 text-center text-xs text-zinc-500 bg-zinc-950/80 space-y-1">
                <p>
                  {gallery.title} · Fotografia por {settings.photographerName} ({settings.studioName})
                </p>
                <p className="text-[11px] text-zinc-600">
                  FluxoWeby Galerias · Acesso exclusivo em celular, tablet e computador.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lightbox Modal */}
        {currentLightboxPhoto && (
          <div className="fixed inset-0 z-60 bg-black/95 flex flex-col justify-between animate-fadeIn p-4">
            {/* Lightbox Topbar */}
            <div className="flex items-center justify-between text-xs text-white z-10">
              <span className="font-mono text-zinc-400">
                {currentLightboxPhoto.filename} ({lightboxIndex! + 1} de {displayedPhotos.length})
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    togglePhotoFavorite(gallery.id, currentLightboxPhoto.id)
                  }
                  className={`p-2 rounded-full flex items-center gap-1.5 text-xs font-semibold ${
                    currentLightboxPhoto.favorited
                      ? 'bg-rose-600 text-white'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      currentLightboxPhoto.favorited ? 'fill-current' : ''
                    }`}
                  />
                  <span>
                    {currentLightboxPhoto.favorited ? 'Favoritada' : 'Favoritar'}
                  </span>
                </button>

                <button
                  onClick={() =>
                    togglePhotoSelection(gallery.id, currentLightboxPhoto.id)
                  }
                  className={`p-2 rounded-full flex items-center gap-1.5 text-xs font-semibold ${
                    currentLightboxPhoto.selected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {currentLightboxPhoto.selected ? 'Selecionada' : 'Selecionar'}
                  </span>
                </button>

                <button
                  onClick={() => setLightboxIndex(null)}
                  className="p-2 rounded-full bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Lightbox Center Image */}
            <div className="relative flex-1 flex items-center justify-center overflow-hidden my-4">
              <img
                src={currentLightboxPhoto.url}
                alt={currentLightboxPhoto.filename}
                className="max-w-full max-h-full object-contain select-none shadow-2xl"
              />

              {/* Watermark in Lightbox if enabled */}
              {clientWatermark && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                  <div className="transform -rotate-25 text-white/30 font-bold font-mono tracking-widest text-xl sm:text-2xl drop-shadow-lg text-center px-4">
                    {gallery.watermarkText || `${settings.studioName} · Prova`}
                  </div>
                </div>
              )}

              {/* Prev / Next buttons */}
              {displayedPhotos.length > 1 && (
                <>
                  <button
                    onClick={handlePrevPhoto}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleNextPhoto}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Lightbox Bottom Info */}
            <div className="text-center text-xs text-zinc-400">
              Use as setas para navegar · Pressione ESC ou o X para fechar
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
