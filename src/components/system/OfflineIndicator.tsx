import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-10 right-4 z-50 flex items-center gap-2 rounded-xl bg-zinc-900 border border-amber-500/40 px-3.5 py-2 text-xs font-medium text-amber-300 shadow-2xl animate-bounce">
      <WifiOff className="w-4 h-4 text-amber-400" />
      <span>
        Modo Offline Ativo — O sistema FotoGestor continua funcionando normalmente com o banco de dados local.
      </span>
    </div>
  );
};
