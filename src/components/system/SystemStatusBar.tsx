import React, { useState, useEffect } from 'react';
import { Database, HardDrive, Clock, Terminal, Wifi, WifiOff, Aperture } from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

interface SystemStatusBarProps {
  onOpenDiagnostics: () => void;
  onOpenCommandPalette: () => void;
  onOpenShortcuts?: () => void;
}

export const SystemStatusBar: React.FC<SystemStatusBarProps> = ({
  onOpenDiagnostics,
  onOpenCommandPalette,
  onOpenShortcuts,
}) => {
  const {
    sessions,
    galleries,
    gear,
    clients,
    activeTimer,
    formatDuration,
    settings,
  } = useWork();

  const isOnline = useOnlineStatus();
  const [storageKB, setStorageKB] = useState('0.0');

  useEffect(() => {
    let total = 0;
    try {
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          total += (localStorage[key].length + key.length) * 2;
        }
      }
    } catch {
      total = 1024 * 50;
    }
    setStorageKB((total / 1024).toFixed(1));
  }, [sessions, galleries, gear, clients]);

  return (
    <footer className="h-7 bg-[#09090b] border-t border-white/[0.07] text-[11px] font-mono text-zinc-400 flex items-center justify-between px-3.5 select-none shrink-0 z-20 no-print">
      {/* Left: System Status & Storage */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenDiagnostics}
          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer group"
          title="Ver integridade do banco de dados local"
        >
          <Aperture className="w-3 h-3 text-amber-500 group-hover:rotate-45 transition-transform" />
          <span className="font-semibold text-zinc-300">FotoGestor Studio OS</span>
        </button>

        <span className="text-zinc-700 hidden sm:inline">|</span>

        <button
          onClick={onOpenDiagnostics}
          className="hidden sm:flex items-center gap-1 hover:text-zinc-200 transition-colors cursor-pointer"
          title="Armazenamento Local Utilizado"
        >
          <HardDrive className="w-3 h-3 text-sky-400" />
          <span className="tabular-nums">{storageKB} KB</span>
        </button>

        <span className="text-zinc-700 hidden md:inline">|</span>

        <div className="hidden md:flex items-center gap-1 text-zinc-400">
          <Database className="w-3 h-3 text-emerald-400" />
          <span className="tabular-nums">
            {sessions.length} ensaios · {galleries.length} galerias · {clients.length} clientes
          </span>
        </div>
      </div>

      {/* Center: Live Timer if running */}
      {activeTimer.running && (
        <div className="flex items-center gap-1.5 text-amber-400 animate-pulse">
          <Clock className="w-3 h-3" />
          <span className="tabular-nums">Exposição em gravação: {formatDuration(activeTimer.seconds)}</span>
        </div>
      )}

      {/* Right: Network Status & Studio info */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2">
          <span className="text-zinc-300">{settings.studioName || 'Estúdio'}</span>
          <span className="text-zinc-700">·</span>
        </div>

        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="Abrir Busca Rápida (⌘K)"
        >
          <Terminal className="w-3 h-3 text-zinc-400" />
          <span>⌘K</span>
        </button>

        {onOpenShortcuts && (
          <button
            onClick={onOpenShortcuts}
            className="hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Ver Atalhos de Teclado (?)"
          >
            <span>? Atalhos</span>
          </button>
        )}

        <span className="text-zinc-700 hidden sm:inline">|</span>

        <div className="flex items-center gap-1.5">
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3 text-emerald-400" />
              <span className="hidden sm:inline text-emerald-400 font-medium">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-amber-400" />
              <span className="text-amber-400 font-medium">Offline</span>
            </>
          )}
        </div>
      </div>
    </footer>
  );
};
