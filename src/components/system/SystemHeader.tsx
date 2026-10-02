import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Search,
  Plus,
  Play,
  Pause,
  Square,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  Bell,
  Activity,
  Calendar,
  Camera,
  Users,
  DollarSign,
  Package,
  FileText,
  ChevronDown,
  Aperture,
} from 'lucide-react';
import { ActiveTab } from '../TopBar';
import { useWork } from '../../context/WorkContext';
import { useTheme } from '../../context/ThemeContext';
import { PWAInstallButton } from '../PWAInstallButton';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

interface SystemHeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSidebarMobile: () => void;
  onOpenCommandPalette: () => void;
  onOpenNewSession: () => void;
  onOpenNewClient: () => void;
  onOpenNewGear: () => void;
  onOpenNewTransaction: () => void;
  onOpenContract: () => void;
  onOpenNotifications: () => void;
  onOpenDiagnostics: () => void;
}

export const SystemHeader: React.FC<SystemHeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSidebarMobile,
  onOpenCommandPalette,
  onOpenNewSession,
  onOpenNewClient,
  onOpenNewGear,
  onOpenNewTransaction,
  onOpenContract,
  onOpenNotifications,
  onOpenDiagnostics,
}) => {
  const {
    activeTimer,
    pauseTimer,
    resumeTimer,
    stopAndSaveTimer,
    formatDuration,
    sessions,
    galleries,
  } = useWork();

  const { theme, toggleTheme } = useTheme();
  const isOnline = useOnlineStatus();

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const quickMenuRef = useRef<HTMLDivElement>(null);

  // Realtime clock
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Close quick menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (quickMenuRef.current && !quickMenuRef.current.contains(e.target as Node)) {
        setIsQuickMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore if prevented by browser
    }
  };

  // Notification badge calculation
  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(now.getDate() + 7);
  const upcomingCount = sessions.filter((s) => {
    if (!s.sessionDate) return false;
    const sessionDate = new Date(s.sessionDate);
    return sessionDate >= now && sessionDate <= nextWeek && s.stage === 'agendado';
  }).length;
  const pendingOrdersCount = galleries.flatMap((g) =>
    (g.orders || []).filter((o) => o.paymentStatus === 'pending')
  ).length;
  const totalNotifications = upcomingCount + pendingOrdersCount;

  const tabLabels: Record<ActiveTab, { name: string; category: string }> = {
    dashboard: { name: 'Painel Geral', category: 'Visão Geral' },
    proposals: { name: 'CRM & Vendas', category: 'Comercial' },
    templates: { name: 'Central de Templates 2026', category: 'Modelos & Jurídico' },
    management: { name: 'Gestão Operacional', category: 'Operações' },
    sessions: { name: 'Ensaios & Eventos', category: 'Produção' },
    galleries: { name: 'Galerias Web (FluxoWeby)', category: 'Vendas & Clientes' },
    clients: { name: 'Clientes & Noivos', category: 'Comercial' },
    finance: { name: 'Gestão Financeira & Caixa', category: 'Financeiro' },
    client_portal: { name: 'Portal do Cliente', category: 'Experiência' },
    freela_ai: { name: 'FREELA · Copiloto IA', category: 'Inteligência Artificial' },
    whatsapp_ext: { name: 'Extensão do WhatsApp', category: 'Comunicação' },
    gear: { name: 'Equipamentos & Lentes', category: 'Patrimônio' },
    timetracker: { name: 'Tempo de Edição & Produtividade', category: 'Estúdio' },
    academy_support: { name: 'Aulas em Vídeo & Suporte VIP', category: 'Capacitação' },
    settings: { name: 'Configurações do Sistema', category: 'Preferências' },
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl border-b border-zinc-200/80 dark:border-white/[0.07] transition-colors select-none">
      <div className="w-full px-3 sm:px-6">
        <div className="flex items-center justify-between h-15 gap-3">
          {/* Left: Mobile Toggle & System Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onOpenSidebarMobile}
              className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/[0.08] lg:hidden cursor-pointer transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Module Indicator */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-zinc-400 dark:text-zinc-500 font-display">
                <Aperture className="w-3.5 h-3.5 text-amber-500" />
                <span>FotoGestor Studio</span>
              </div>
              <span className="hidden sm:inline-block text-zinc-300 dark:text-zinc-700">/</span>
              <div className="truncate flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate tracking-tight">
                  {tabLabels[activeTab]?.name}
                </span>
                <span className="hidden md:inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-white/[0.06] text-zinc-500 dark:text-zinc-400 font-medium">
                  {tabLabels[activeTab]?.category}
                </span>
              </div>
            </div>
          </div>

          {/* Center: System Clock (Desktop) & Connectivity */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100/80 dark:bg-[#121215] border border-zinc-200/80 dark:border-white/[0.06] text-xs font-mono">
              <span className="text-zinc-500 dark:text-zinc-400 capitalize">{currentDate}</span>
              <span className="text-zinc-300 dark:text-zinc-700">·</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                {currentTime}
              </span>
            </div>

            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border ${
                isOnline
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
              }`}
              title={isOnline ? 'Sistema sincronizado com banco local' : 'Operando em modo offline'}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>

          {/* Right Action Icons Zone */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Command Bar Trigger */}
            <button
              onClick={onOpenCommandPalette}
              title="Busca Global no Sistema (Atalho: ⌘K ou Ctrl+K)"
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100/90 dark:bg-[#121215] hover:bg-zinc-200 dark:hover:bg-white/[0.08] rounded-xl border border-zinc-200/80 dark:border-white/[0.07] transition-all cursor-pointer shadow-2xs"
            >
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden xl:inline">Buscar...</span>
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 bg-white dark:bg-white/[0.06] rounded-md border border-zinc-200 dark:border-white/[0.08]">
                ⌘K
              </kbd>
            </button>

            {/* Quick Create Dropdown "+ Novo" */}
            <div className="relative" ref={quickMenuRef}>
              <button
                onClick={() => setIsQuickMenuOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">Novo</span>
                <ChevronDown className="w-3 h-3 text-zinc-400 dark:text-zinc-600" />
              </button>

              {isQuickMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-white/[0.08] rounded-2xl shadow-2xl py-1.5 z-50 text-xs backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3.5 py-1.5 text-[10px] font-medium tracking-tight text-zinc-400 dark:text-zinc-500">
                    Ações Rápidas de Criação
                  </div>
                  <button
                    onClick={() => {
                      setIsQuickMenuOpen(false);
                      onOpenNewSession();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors text-left"
                  >
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <span>Novo Ensaio / Evento</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsQuickMenuOpen(false);
                      setActiveTab('galleries');
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors text-left"
                  >
                    <Camera className="w-4 h-4 text-amber-500" />
                    <span>Nova Galeria FluxoWeby</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsQuickMenuOpen(false);
                      onOpenNewClient();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors text-left"
                  >
                    <Users className="w-4 h-4 text-sky-500" />
                    <span>Novo Cliente / Noivos</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsQuickMenuOpen(false);
                      onOpenNewTransaction();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors text-left"
                  >
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    <span>Nova Transação Financeira</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsQuickMenuOpen(false);
                      onOpenNewGear();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors text-left"
                  >
                    <Package className="w-4 h-4 text-indigo-500" />
                    <span>Novo Equipamento</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsQuickMenuOpen(false);
                      onOpenContract();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors text-left"
                  >
                    <FileText className="w-4 h-4 text-purple-500" />
                    <span>Gerar Contrato Fotográfico</span>
                  </button>
                </div>
              )}
            </div>

            {/* Live Camera/Editing Timer Widget in System Header */}
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1.5 bg-zinc-100/90 dark:bg-[#121215] rounded-xl border border-zinc-200/80 dark:border-white/[0.07] shadow-2xs">
              <div className="flex items-center gap-1.5">
                {activeTimer.running ? (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                  </span>
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                )}
                <span className="font-mono text-xs font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                  {formatDuration(activeTimer.seconds)}
                </span>
              </div>

              {activeTimer.running ? (
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={pauseTimer}
                    title="Pausar cronômetro"
                    className="p-1 text-amber-500 hover:text-amber-400 rounded-md transition-colors"
                  >
                    <Pause className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={stopAndSaveTimer}
                    title="Salvar e finalizar tempo"
                    className="p-1 text-zinc-400 hover:text-white rounded-md transition-colors"
                  >
                    <Square className="w-3 h-3 fill-current" />
                  </button>
                </div>
              ) : activeTimer.seconds > 0 ? (
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={resumeTimer}
                    title="Retomar cronômetro"
                    className="p-1 text-emerald-500 hover:text-emerald-400 rounded-md transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={stopAndSaveTimer}
                    title="Salvar tempo"
                    className="p-1 text-zinc-400 hover:text-white rounded-md transition-colors"
                  >
                    <Square className="w-3 h-3 fill-current" />
                  </button>
                </div>
              ) : null}
            </div>

            {/* PWA Install Button in Header */}
            <PWAInstallButton variant="header" />

            {/* System Notifications Bell */}
            <button
              onClick={onOpenNotifications}
              title="Central de Notificações do Estúdio"
              className="relative p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/[0.08] rounded-xl transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {totalNotifications > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-[#09090b] animate-pulse" />
              )}
            </button>

            {/* Fullscreen Toggle (Studio Desktop Mode) */}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Sair da Tela Cheia' : 'Modo Estúdio Tela Cheia'}
              className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/[0.08] rounded-xl transition-colors cursor-pointer hidden sm:inline-flex"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Diagnostics Quick Icon */}
            <button
              onClick={onOpenDiagnostics}
              title="Diagnóstico de Integridade e Banco Local"
              className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/[0.08] rounded-xl transition-colors cursor-pointer"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
            </button>

            {/* Dark / Light Mode */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
              className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/[0.08] rounded-xl transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
