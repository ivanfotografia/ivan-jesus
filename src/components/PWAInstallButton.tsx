import React, { useState } from 'react';
import {
  Download,
  Monitor,
  Smartphone,
  CheckCircle2,
  X,
  ExternalLink,
  Copy,
  Check,
  Laptop,
  Apple,
  Sparkles,
  Info,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'sidebar' | 'banner' | 'card';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'windows' | 'mac' | 'mobile'>('windows');

  const appUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      try {
        const accepted = await install();
        if (!accepted) {
          setShowGuideModal(true);
        }
      } catch {
        setShowGuideModal(true);
      } finally {
        setIsInstalling(false);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  // If already running as installed system app, display active status pill
  if (isInstalled) {
    if (variant === 'sidebar') {
      return (
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate font-medium">App de Sistema Instalado</span>
        </div>
      );
    }
    return null;
  }

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleInstallClick}
          title="Como Instalar FotoGestor no seu PC (Windows, Mac ou Linux)"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-700 dark:text-amber-400 transition-all shadow-2xs cursor-pointer group"
        >
          <Download className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform text-amber-500" />
          <span className="hidden sm:inline">Instalar no PC</span>
        </button>
      )}

      {variant === 'sidebar' && (
        <button
          onClick={handleInstallClick}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500/15 to-orange-500/10 hover:from-amber-500/25 hover:to-orange-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-400 transition-all text-left shadow-2xs group cursor-pointer"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Laptop className="w-4 h-4 shrink-0 text-amber-500 group-hover:scale-110 transition-transform" />
            <div className="truncate">
              <div className="font-semibold leading-tight text-zinc-900 dark:text-zinc-100">Instalar no PC</div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal">Usar como software nativo</div>
            </div>
          </div>
          <span className="text-[9px] bg-amber-500 text-zinc-950 font-bold px-1.5 py-0.5 rounded shrink-0">
            APP
          </span>
        </button>
      )}

      {variant === 'card' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#151518] border border-amber-500/30 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Instalar Aplicativo no PC</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Windows, Mac e Linux sem abrir o navegador</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 font-bold">
              PWA NATIVO
            </span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
            Tenha o FotoGestor Pro instalado diretamente no seu computador com ícone na Área de Trabalho, Barra de Tarefas ou Dock, operando em janela própria de alta velocidade e suporte 100% offline.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isInstallable ? 'Instalar Agora no PC' : 'Ver Como Instalar no PC'}</span>
            </button>
            <button
              onClick={() => setShowGuideModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Passo a Passo Detalhado</span>
            </button>
          </div>
        </div>
      )}

      {/* Comprehensive PC & Mobile Installation Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-white/[0.09] rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-zinc-200 dark:border-white/[0.08] flex items-start justify-between bg-zinc-50 dark:bg-zinc-900/40">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/15 text-amber-500 rounded-xl">
                  <Laptop className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    Como Instalar o FotoGestor no PC
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500 text-zinc-950">
                      DESKTOP APP
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Funciona como software nativo no Windows, macOS Sonoma/Sequoia e Linux
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Platform Selector Tabs */}
            <div className="flex border-b border-zinc-200 dark:border-white/[0.08] px-5 bg-white dark:bg-[#121215]">
              <button
                onClick={() => setActiveTab('windows')}
                className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
                  activeTab === 'windows'
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>Windows / Linux (Chrome & Edge)</span>
              </button>

              <button
                onClick={() => setActiveTab('mac')}
                className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
                  activeTab === 'mac'
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
                }`}
              >
                <Apple className="w-4 h-4" />
                <span>Mac (macOS / Safari / Chrome)</span>
              </button>

              <button
                onClick={() => setActiveTab('mobile')}
                className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
                  activeTab === 'mobile'
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Celular (Android / iOS)</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-zinc-600 dark:text-zinc-300">
              {/* Special Note when previewing inside iFrame / AI Studio */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Importante: para instalar no seu PC, abra em uma aba externa
                  </p>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                    Navegadores como o Google Chrome e Microsoft Edge só mostram o botão de instalação nativa de sistema quando o site está em uma aba própria (fora de visualizadores embutidos).
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-[11px] hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Link Copiado!' : 'Copiar Link do Aplicativo'}</span>
                    </button>
                    <a
                      href={appUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-[11px] transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Abrir em Nova Aba Completa</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Windows Tab */}
              {activeTab === 'windows' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                    <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-sky-500" />
                      Passo a Passo no Windows (Google Chrome ou Microsoft Edge):
                    </div>
                    <ol className="list-decimal pl-5 space-y-2 text-zinc-600 dark:text-zinc-300">
                      <li>
                        <strong>Pelo Ícone da Barra de Endereços:</strong>
                        <br />
                        Abra o FotoGestor no Google Chrome ou Edge. Na barra de endereços (ao lado do botão de favoritos/estrela), clique no ícone de <strong>Instalar FotoGestor Pro</strong> (ícone de monitor com seta para baixo 🖥️ ⬇️).
                      </li>
                      <li>
                        <strong>Ou pelo Menu do Navegador:</strong>
                        <br />
                        No <strong>Chrome</strong>: Clique nos 3 pontinhos <code className="px-1 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded">⋮</code> no canto superior direito &gt; <strong>Salvar e compartilhar</strong> &gt; <strong>Instalar FotoGestor Pro...</strong>
                        <br />
                        No <strong>Edge</strong>: Clique em <code className="px-1 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded">...</code> &gt; <strong>Aplicativos</strong> &gt; <strong>Instalar este site como um aplicativo</strong>.
                      </li>
                      <li>
                        Clique em <strong>Instalar</strong> na janela de confirmação.
                      </li>
                      <li>
                        <strong>Pronto!</strong> O FotoGestor abrirá como um programa dedicado, com ícone próprio na sua <strong>Área de Trabalho</strong> e na <strong>Barra de Tarefas</strong> do Windows.
                      </li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Mac Tab */}
              {activeTab === 'mac' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                    <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                      <Apple className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                      Passo a Passo no Mac (macOS Sonoma, Sequoia ou Chrome/Edge no Mac):
                    </div>
                    <ol className="list-decimal pl-5 space-y-2 text-zinc-600 dark:text-zinc-300">
                      <li>
                        <strong>Pelo Safari (macOS Sonoma / Sequoia):</strong>
                        <br />
                        Abra o link do FotoGestor no Safari. No menu superior da tela do Mac, clique em <strong>Arquivo</strong> &gt; <strong>Adicionar ao Dock...</strong>. O app será criado instantaneamente no seu Dock e Launchpad com ícone nativo!
                      </li>
                      <li>
                        <strong>Pelo Chrome ou Edge no Mac:</strong>
                        <br />
                        Clique no ícone de <strong>Instalar</strong> na barra de endereços (canto direito da URL) ou no menu <code className="px-1 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded">⋮</code> &gt; <strong>Instalar FotoGestor Pro</strong>.
                      </li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Mobile Tab */}
              {activeTab === 'mobile' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                    <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-amber-500" />
                      Como Instalar no Celular ou Tablet:
                    </div>
                    <div className="space-y-2.5">
                      <div>
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">📱 No iPhone ou iPad (Safari):</div>
                        <ol className="list-decimal pl-5 space-y-1 text-zinc-500 dark:text-zinc-400">
                          <li>Toque no botão <strong>Compartilhar</strong> (quadrado com seta para cima) na barra inferior do Safari.</li>
                          <li>Role para baixo e toque em <strong>Adicionar à Tela de Início</strong>.</li>
                          <li>Toque em <strong>Adicionar</strong> no topo direito.</li>
                        </ol>
                      </div>
                      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">🤖 No Android (Google Chrome):</div>
                        <ol className="list-decimal pl-5 space-y-1 text-zinc-500 dark:text-zinc-400">
                          <li>Toque no menu de três pontinhos <code className="px-1 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded">⋮</code> no canto superior direito.</li>
                          <li>Selecione <strong>Instalar aplicativo</strong> ou <strong>Adicionar à tela inicial</strong>.</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Benefits Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px]">
                <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                  <span className="font-bold block text-zinc-900 dark:text-zinc-100 mb-0.5">⚡ Janela Exclusiva</span>
                  Abre em tela cheia, sem barra de navegação, como um software instalado.
                </div>
                <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                  <span className="font-bold block text-zinc-900 dark:text-zinc-100 mb-0.5">📴 100% Offline</span>
                  Acesse contratos, dados de ensaios e cronômetro mesmo sem internet.
                </div>
                <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                  <span className="font-bold block text-zinc-900 dark:text-zinc-100 mb-0.5">🚀 Atalho Rápido</span>
                  Inicie pelo menu Iniciar, barra de tarefas do Windows ou Dock do Mac.
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-200 dark:border-white/[0.08] flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40">
              {isInstallable ? (
                <button
                  onClick={async () => {
                    await install();
                    setShowGuideModal(false);
                  }}
                  disabled={isInstalling}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isInstalling ? 'Instalando...' : 'Instalar Agora no Navegador'}</span>
                </button>
              ) : (
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Disponível para qualquer navegador moderno com suporte a PWA.
                </span>
              )}
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-semibold text-xs transition-colors cursor-pointer"
              >
                Fechar Guia
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
