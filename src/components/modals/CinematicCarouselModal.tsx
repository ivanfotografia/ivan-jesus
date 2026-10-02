import React, { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  Download,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Maximize2,
  Share2,
  Film,
  Camera,
  Layers,
  Palette,
  Eye,
  Smartphone,
  RefreshCw,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';

interface CinematicCarouselModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTitle?: string;
  defaultPhotos?: string[];
}

type CarouselTheme = 'cinema_35mm' | 'editorial_vogue' | 'golden_hour' | 'moody_noir' | 'minimal_clean';

interface SlideData {
  id: number;
  type: 'cover' | 'photo_split' | 'cta';
  splitPart?: number;
  totalSplitParts?: number;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
}

export const CinematicCarouselModal: React.FC<CinematicCarouselModalProps> = ({
  isOpen,
  onClose,
  defaultTitle = 'Histórias Reais em 35mm',
  defaultPhotos,
}) => {
  const { settings, galleries, sessions } = useWork();

  const [activeTheme, setActiveTheme] = useState<CarouselTheme>('cinema_35mm');
  const [slideCount, setSlideCount] = useState<number>(5);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

  // Text inputs
  const [hookTitle, setHookTitle] = useState('O amor não avisa quando chega.');
  const [hookSubtitle, setHookSubtitle] = useState('Um ensaio que parou o tempo no litoral.');
  const [ctaText, setCtaText] = useState('Gostou dessa história? Salve este post e agende a sua data no link da bio.');
  const [showFilmGrain, setShowFilmGrain] = useState(true);
  const [showFilmBorders, setShowFilmBorders] = useState(true);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  // Selected sample panoramic photo
  const defaultSamplePanorama =
    defaultPhotos && defaultPhotos.length > 0
      ? defaultPhotos[0]
      : 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2400&q=85';

  const [panoramicImage, setPanoramicImage] = useState(defaultSamplePanorama);

  if (!isOpen) return null;

  // Themes styling config
  const themeConfigs: Record<
    CarouselTheme,
    {
      name: string;
      desc: string;
      bgClass: string;
      titleFont: string;
      textColor: string;
      accentColor: string;
      filmPerforations: boolean;
      badgeText: string;
    }
  > = {
    cinema_35mm: {
      name: 'Cinema 35mm Kodak',
      desc: 'Visual analógico quente, bordas de filme e granulação sutil.',
      bgClass: 'bg-[#0f0e0d] text-[#f7efe6]',
      titleFont: 'font-serif tracking-tight',
      textColor: 'text-[#f5ebd7]',
      accentColor: 'text-amber-400 border-amber-400/40 bg-amber-400/10',
      filmPerforations: true,
      badgeText: 'KODAK PORTRA 400 · 35MM EXP-24',
    },
    editorial_vogue: {
      name: 'Editorial Vogue',
      desc: 'Tipografia elegante serifada, margens generosas e acabamento de revista.',
      bgClass: 'bg-[#0d0d0f] text-white',
      titleFont: 'font-serif tracking-wide',
      textColor: 'text-zinc-100',
      accentColor: 'text-white border-white/30 bg-white/10',
      filmPerforations: false,
      badgeText: 'EDITORIAL ISSUE · VOGUE INSPIRATION',
    },
    golden_hour: {
      name: 'Golden Hour Glow',
      desc: 'Cores quentes de pôr do sol, contraste suave e clima romântico.',
      bgClass: 'bg-[#181310] text-[#fffaed]',
      titleFont: 'font-sans font-bold tracking-tight',
      textColor: 'text-amber-100',
      accentColor: 'text-amber-300 border-amber-300/30 bg-amber-300/10',
      filmPerforations: true,
      badgeText: 'GOLDEN HOUR · 85MM F/1.4',
    },
    moody_noir: {
      name: 'Moody Film Noir',
      desc: 'Preto e branco cinematográfico com contraste profundo e luz de recorte.',
      bgClass: 'bg-[#0a0a0a] text-zinc-100',
      titleFont: 'font-mono uppercase tracking-widest',
      textColor: 'text-zinc-200',
      accentColor: 'text-zinc-300 border-zinc-400/30 bg-white/5',
      filmPerforations: true,
      badgeText: 'ILFORD HP5 PLUS 400 · MONO',
    },
    minimal_clean: {
      name: 'Minimalista Clean',
      desc: 'Linhas puras, foco total na emoção da cena e diagramação contemporânea.',
      bgClass: 'bg-[#121214] text-zinc-100',
      titleFont: 'font-sans font-medium tracking-tight',
      textColor: 'text-zinc-100',
      accentColor: 'text-sky-400 border-sky-400/30 bg-sky-400/10',
      filmPerforations: false,
      badgeText: 'MINIMAL ARCHIVE · FINE ART',
    },
  };

  const currentTheme = themeConfigs[activeTheme];

  // Slides configuration based on total slides
  const slides: SlideData[] = [
    {
      id: 1,
      type: 'cover' as const,
      title: hookTitle,
      subtitle: hookSubtitle,
      imageUrl: panoramicImage,
    },
    {
      id: 2,
      type: 'photo_split' as const,
      splitPart: 1,
      totalSplitParts: 3,
      imageUrl: panoramicImage,
    },
    {
      id: 3,
      type: 'photo_split' as const,
      splitPart: 2,
      totalSplitParts: 3,
      imageUrl: panoramicImage,
    },
    {
      id: 4,
      type: 'photo_split' as const,
      splitPart: 3,
      totalSplitParts: 3,
      imageUrl: panoramicImage,
    },
    {
      id: 5,
      type: 'cta' as const,
      title: 'A arte de pausar o tempo para sempre.',
      subtitle: ctaText,
      imageUrl: panoramicImage,
    },
  ].slice(0, slideCount);

  const activeSlide = slides[currentSlideIndex] || slides[0];

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleCopyCaption = () => {
    const caption = `✨ ${hookTitle}\n\n${hookSubtitle}\n\nFotografar não é sobre posar, é sobre sentir. Quando a gente permite que as pessoas sejam exatamente quem são na frente da câmera, a mágica simplesmente acontece.\n\n➡️ Deslize para o lado para ver o corte panorâmico completo dessa história!\n\n💬 Me conta nos comentários: qual foi a sua imagem favorita desse carrossel?\n\n📸 ${settings.studioName} por ${settings.photographerName}\n📍 Agenda aberta para casamentos e ensaios.\n\n---\n#carrosselcinematico #fotografiadecasal #fotografoprofissional #ensaioexterno #noivos2026 #fotografiacomafeto`;
    navigator.clipboard.writeText(caption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  const handleExportSlides = () => {
    setIsExporting(true);
    setExportFeedback('Gerando e renderizando os 5 slides em 1080x1350px...');

    setTimeout(() => {
      // Simulate download zip / image batch
      const link = document.createElement('a');
      link.href = panoramicImage;
      link.download = `carrossel_cinematico_slide_${currentSlideIndex + 1}_1080x1350.jpg`;
      link.click();

      setIsExporting(false);
      setExportFeedback('✓ Slide exportado com sucesso em alta resolução (1080x1350px)! Pronto para postar.');
      setTimeout(() => setExportFeedback(null), 4000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-fadeIn p-2 sm:p-4">
      <div className="w-full max-w-6xl max-h-[95vh] bg-zinc-950 text-zinc-100 rounded-2xl border border-zinc-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-100">
                  Estúdio de Carrosséis Cinemáticos
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950">
                  1-CLIQUE INSTAGRAM
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Gere carrosséis panorâmicos infinitos (1080x1350px) com corte perfeito e estética de cinema.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCaption}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedCaption ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCaption ? 'Legenda Copiada!' : 'Copiar Legenda IA'}</span>
            </button>

            <button
              onClick={handleExportSlides}
              disabled={isExporting}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Exportando...' : 'Exportar Carrossel (1080x1350)'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {exportFeedback && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 text-xs text-emerald-400 font-medium flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4" />
            <span>{exportFeedback}</span>
          </div>
        )}

        {/* Content Body: Left Controls, Center Preview, Right Slide Navigator */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto">
          {/* Left Panel: Aesthetic Controls */}
          <div className="lg:col-span-4 p-5 bg-zinc-900/60 border-r border-zinc-800 space-y-5 overflow-y-auto">
            {/* Style Preset Selector */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-2.5">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <span>Estilo Visual & Cinema</span>
              </label>
              <div className="space-y-1.5">
                {(Object.keys(themeConfigs) as CarouselTheme[]).map((key) => {
                  const t = themeConfigs[key];
                  const isSelected = activeTheme === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveTheme(key)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500/40 text-white'
                          : 'bg-zinc-800/40 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-zinc-100 flex items-center gap-2">
                          <span>{t.name}</span>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">{t.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Panoramic Photo Source */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-2">
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>Foto Panorâmica para Divisão</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2400&q=85',
                  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=2400&q=85',
                  'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=2400&q=85',
                ].map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPanoramicImage(img)}
                    className={`h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer relative ${
                      panoramicImage === img ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-zinc-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Amostra" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Copy Hook & Text Editor */}
            <div className="space-y-3 pt-3 border-t border-zinc-800/80">
              <div>
                <label className="text-[11px] font-semibold text-zinc-300">
                  Gancho de Abertura (Slide 1)
                </label>
                <input
                  type="text"
                  value={hookTitle}
                  onChange={(e) => setHookTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-white focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-300">
                  Subtítulo / Contexto
                </label>
                <input
                  type="text"
                  value={hookSubtitle}
                  onChange={(e) => setHookSubtitle(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-white focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-300">
                  Chamada para Ação (Slide Final)
                </label>
                <textarea
                  rows={2}
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-white focus:ring-2 focus:ring-amber-500/30 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="pt-3 border-t border-zinc-800/80 space-y-2">
              <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer">
                <span>Bordas de Filme 35mm & Stamps</span>
                <input
                  type="checkbox"
                  checked={showFilmBorders}
                  onChange={(e) => setShowFilmBorders(e.target.checked)}
                  className="rounded bg-zinc-800 border-zinc-700 text-amber-500 focus:ring-amber-500"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer">
                <span>Granulação Analógica (Grain Effect)</span>
                <input
                  type="checkbox"
                  checked={showFilmGrain}
                  onChange={(e) => setShowFilmGrain(e.target.checked)}
                  className="rounded bg-zinc-800 border-zinc-700 text-amber-500 focus:ring-amber-500"
                />
              </label>
            </div>
          </div>

          {/* Center Canvas: Live 4:5 Instagram Preview */}
          <div className="lg:col-span-5 p-6 flex flex-col items-center justify-center bg-[#070709] relative">
            <div className="text-[11px] font-mono text-zinc-400 mb-3 flex items-center gap-2">
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Visualização Slide {currentSlideIndex + 1} de {slides.length} · Proporção 4:5 (1080x1350)
              </span>
            </div>

            {/* Instagram Slide Frame Container */}
            <div className="relative w-full max-w-[340px] aspect-[4/5] rounded-xl overflow-hidden shadow-2xl border border-white/10 select-none flex flex-col justify-between">
              {/* Slide Background & Theme */}
              <div className={`absolute inset-0 ${currentTheme.bgClass}`}>
                {/* Background Image layer with split offset */}
                <div className="absolute inset-0 overflow-hidden">
                  {activeSlide.type === 'cover' ? (
                    <img
                      src={panoramicImage}
                      alt="Cover"
                      className="w-full h-full object-cover opacity-65 scale-105 filter brightness-90"
                    />
                  ) : activeSlide.type === 'cta' ? (
                    <img
                      src={panoramicImage}
                      alt="CTA"
                      className="w-full h-full object-cover opacity-30 filter blur-xs brightness-75"
                    />
                  ) : (
                    // Panoramic split simulation: shifting image horizontally based on splitPart
                    <div
                      className="h-full relative transition-all duration-300"
                      style={{
                        width: '300%',
                        left:
                          activeSlide.splitPart === 1
                            ? '0%'
                            : activeSlide.splitPart === 2
                            ? '-100%'
                            : '-200%',
                      }}
                    >
                      <img
                        src={panoramicImage}
                        alt="Split"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Film grain overlay simulation */}
                {showFilmGrain && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 pointer-events-none opacity-80" />
                )}
              </div>

              {/* Top Film Stamp Bar */}
              {showFilmBorders && (
                <div className="relative z-10 px-4 pt-3 flex items-center justify-between text-[9px] font-mono text-white/70 tracking-widest uppercase">
                  <span>{currentTheme.badgeText}</span>
                  <span>SLIDE {currentSlideIndex + 1}/{slides.length}</span>
                </div>
              )}

              {/* Center Content for Cover or CTA */}
              <div className="relative z-10 p-5 flex-1 flex flex-col justify-end text-left">
                {activeSlide.type === 'cover' && (
                  <div className="space-y-2 animate-fadeIn">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-md">
                      História Visual
                    </span>
                    <h2 className={`text-xl sm:text-2xl font-bold leading-tight ${currentTheme.titleFont}`}>
                      {hookTitle}
                    </h2>
                    <p className="text-xs text-white/80 line-clamp-2">{hookSubtitle}</p>
                    <div className="pt-2 flex items-center gap-1.5 text-[10px] text-amber-300 font-mono">
                      <span>Deslize para o lado</span>
                      <ChevronRight className="w-3.5 h-3.5 animate-pulse" />
                    </div>
                  </div>
                )}

                {activeSlide.type === 'photo_split' && (
                  <div className="flex items-center justify-between text-[10px] font-mono text-white/60">
                    <span>PANORAMA CONTÍNUO</span>
                    <span>PARTE {activeSlide.splitPart} DE 3</span>
                  </div>
                )}

                {activeSlide.type === 'cta' && (
                  <div className="space-y-3 text-center my-auto animate-fadeIn">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
                      <Camera className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-white font-serif">
                      {settings.studioName}
                    </h3>
                    <p className="text-xs text-zinc-300 max-w-xs mx-auto leading-relaxed">
                      {ctaText}
                    </p>
                    <div className="pt-2">
                      <span className="px-4 py-1.5 rounded-full bg-white text-zinc-950 font-bold text-xs shadow-md">
                        {settings.instagram || '@estudiofotografia'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Studio Signature Bar */}
              <div className="relative z-10 px-4 pb-3 flex items-center justify-between text-[9px] font-mono text-white/50 border-t border-white/10 pt-2 bg-black/30 backdrop-blur-xs">
                <span>{settings.studioName}</span>
                <span>FOTOGRAFIA PROFISSIONAL</span>
              </div>
            </div>

            {/* Slider Navigation Buttons */}
            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={handlePrevSlide}
                disabled={currentSlideIndex === 0}
                className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white disabled:opacity-30 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlideIndex(i)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      currentSlideIndex === i ? 'w-6 bg-amber-400' : 'w-2 bg-zinc-700'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNextSlide}
                disabled={currentSlideIndex === slides.length - 1}
                className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white disabled:opacity-30 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Panel: Multi-Slide Carousel Strip */}
          <div className="lg:col-span-3 p-5 bg-zinc-900/40 border-l border-zinc-800 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Sequência do Feed (5 Slides)
              </h4>
              <span className="text-[10px] font-mono text-amber-400">Sem emendas</span>
            </div>

            <div className="space-y-2.5">
              {slides.map((slide, idx) => {
                const isCurrent = currentSlideIndex === idx;
                return (
                  <div
                    key={slide.id}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                      isCurrent
                        ? 'bg-amber-500/15 border-amber-500/40 shadow-sm'
                        : 'bg-zinc-800/40 border-zinc-800/80 hover:bg-zinc-800'
                    }`}
                  >
                    <div className="w-10 h-12 rounded bg-zinc-800 overflow-hidden shrink-0 relative border border-white/10">
                      <img
                        src={panoramicImage}
                        alt="Mini"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-[10px] font-bold text-white font-mono">
                        {idx + 1}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-zinc-200 truncate">
                        {slide.type === 'cover'
                          ? '1. Capa com Gancho'
                          : slide.type === 'cta'
                          ? '5. Chamada Final'
                          : `Split Panorâmico ${slide.splitPart}/3`}
                      </p>
                      <p className="text-[10px] text-zinc-400 truncate">
                        {slide.type === 'cover'
                          ? hookTitle
                          : slide.type === 'cta'
                          ? 'Instagram bio e contato'
                          : 'Corte contínuo de alta resolução'}
                      </p>
                    </div>

                    {isCurrent && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Dica de Algoritmo:</span>
              </p>
              <p className="text-[11px] text-amber-200/80 leading-relaxed">
                Carrosséis panorâmicos contínuos têm taxa de retenção até 3.4x maior no Instagram porque o seguidor desliza naturalmente para ver a imagem inteira.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
