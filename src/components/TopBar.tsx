import React from 'react';
import { Camera, Play, Pause, Square, Plus, Search, Sun, Moon } from 'lucide-react';
import { useWork } from '../context/WorkContext';
import { useTheme } from '../context/ThemeContext';

export type ActiveTab =
  | 'dashboard'
  | 'proposals'
  | 'templates'
  | 'sessions'
  | 'galleries'
  | 'clients'
  | 'finance'
  | 'management'
  | 'client_portal'
  | 'freela_ai'
  | 'whatsapp_ext'
  | 'gear'
  | 'timetracker'
  | 'academy_support'
  | 'settings';

interface TopBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewSessionModal: () => void;
  onOpenCommandPalette: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewSessionModal,
  onOpenCommandPalette,
}) => {
  const {
    activeTimer,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopAndSaveTimer,
    formatDuration,
  } = useWork();

  const { theme, toggleTheme } = useTheme();

  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'dashboard', label: 'Painel Geral' },
    { id: 'sessions', label: 'Ensaios & Eventos' },
    { id: 'galleries', label: 'Galerias Web' },
    { id: 'gear', label: 'Equipamentos' },
    { id: 'clients', label: 'Clientes & Noivos' },
    { id: 'finance', label: 'Financeiro' },
    { id: 'timetracker', label: 'Tempo de Edição' },
    { id: 'settings', label: 'Configurações' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 no-print transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Wordmark with Leica-style Aperture Dot */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className="text-left group flex items-center gap-2.5 focus:outline-none cursor-pointer shrink-0"
          >
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-xs">
              <Camera className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-zinc-950" />
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-sans leading-none flex items-center gap-1">
                FotoGestor
                <span className="text-[10px] font-mono tracking-wider font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-500/10 dark:bg-amber-400/15 text-amber-600 dark:text-amber-400">
                  STUDIO
                </span>
              </div>
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono tracking-wider">
                PRO WORKFLOW
              </div>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all cursor-pointer relative ${
                    isActive
                      ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Zone: Search, Timer, Theme, New Session */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Command Bar Trigger */}
            <button
              onClick={onOpenCommandPalette}
              title="Buscar (Atalho: ⌘K ou Ctrl+K)"
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100/80 dark:bg-zinc-900/80 hover:bg-zinc-200/80 dark:hover:bg-zinc-800 rounded-md border border-zinc-200/70 dark:border-zinc-800 transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden md:inline">Buscar...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700">
                ⌘K
              </kbd>
            </button>

            {/* Live Editing Stopwatch with glow */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-100 dark:bg-zinc-900 rounded-md border border-zinc-200/70 dark:border-zinc-800">
              <div className="flex items-center gap-1.5">
                {activeTimer.running ? (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                  </span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                )}
                <span className="font-mono text-xs font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                  {formatDuration(activeTimer.seconds)}
                </span>
              </div>

              {activeTimer.running ? (
                <div className="flex items-center">
                  <button
                    onClick={pauseTimer}
                    title="Pausar cronômetro"
                    className="p-1 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors"
                  >
                    <Pause className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={stopAndSaveTimer}
                    title="Salvar tempo de trabalho"
                    className="p-1 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors"
                  >
                    <Square className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : activeTimer.seconds > 0 ? (
                <div className="flex items-center">
                  <button
                    onClick={resumeTimer}
                    title="Retomar cronômetro"
                    className="p-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={stopAndSaveTimer}
                    title="Salvar tempo"
                    className="p-1 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors"
                  >
                    <Square className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startTimer(undefined, 'editing', 'Edição de fotos')}
                  title="Cronometrar edição (Lightroom / Photoshop)"
                  className="p-1 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dark / Light Mode Switch */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro Studio'}
              className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md border border-zinc-200/70 dark:border-zinc-800 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-700" />
              )}
            </button>

            {/* Primary Action Button */}
            <button
              onClick={onOpenNewSessionModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 rounded-md hover:bg-zinc-800 dark:hover:bg-white transition-all whitespace-nowrap shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Novo Ensaio</span>
            </button>
          </div>
        </div>

        {/* Secondary Navigation on medium screens */}
        <div className="flex xl:hidden overflow-x-auto py-2 border-t border-zinc-200/60 dark:border-zinc-800/60 gap-1 no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`text-xs whitespace-nowrap px-3 py-1 font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
