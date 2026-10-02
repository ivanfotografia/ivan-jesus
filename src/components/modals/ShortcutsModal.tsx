import React from 'react';
import { X, Keyboard, Command, Sparkles } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: 'Navegação e Sistema',
      shortcuts: [
        { key: '⌘ K  /  Ctrl K', desc: 'Abrir Busca Global & Paleta de Comandos' },
        { key: '?', desc: 'Abrir esta Central de Atalhos' },
        { key: 'Esc', desc: 'Fechar modais, gavetas e menus suspensos' },
      ],
    },
    {
      title: 'Ações Rápidas de Produção',
      shortcuts: [
        { key: '+ Novo', desc: 'Criar Ensaio, Galeria, Cliente ou Despesa' },
        { key: 'Baixar PDF', desc: 'Gerar Contrato Oficial com Cláusulas e Assinatura' },
        { key: 'Play / Pause', desc: 'Cronometrar tempo de tratamento no Lightroom / Photoshop' },
        { key: 'Instalar no PC', desc: 'Usar FotoGestor Pro como aplicativo desktop nativo' },
      ],
    },
    {
      title: 'Segurança & Armazenamento',
      shortcuts: [
        { key: '100% Offline', desc: 'Seus dados salvos no computador sem risco de perda' },
        { key: 'Backup JSON', desc: 'Exportar todos os ensaios e contratos em 1 clique' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-[#121215] border border-zinc-200 dark:border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-white/[0.08] flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/15 text-amber-500 rounded-xl">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Atalhos do Teclado & Produtividade
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-amber-500/15 text-amber-500 rounded font-bold">
                  STUDIO OS
                </span>
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Ganhe velocidade no fluxo diário do estúdio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {shortcutGroups.map((group, idx) => (
            <div key={idx} className="space-y-2">
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-bold">
                {group.title}
              </h4>
              <div className="space-y-1.5">
                {group.shortcuts.map((sc, scIdx) => (
                  <div
                    key={scIdx}
                    className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-white/[0.05] text-xs"
                  >
                    <span className="text-zinc-700 dark:text-zinc-300 text-[11px]">{sc.desc}</span>
                    <kbd className="px-2 py-0.8 text-[11px] font-mono font-semibold bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-md border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-200 dark:border-white/[0.08] flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 text-[11px] text-zinc-500">
          <span>Pressione <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono text-[10px]">Esc</kbd> para fechar</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-semibold text-xs transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
