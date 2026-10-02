import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Camera,
  Users,
  FolderKanban,
  FileText,
  Plus,
  DollarSign,
  Sun,
  Moon,
  Clock,
  ArrowRight,
  X,
  BookOpen,
  Sparkles,
  MessageSquare,
  Globe,
  Laptop,
  Download,
} from 'lucide-react';
import { useWork } from '../context/WorkContext';
import { useTheme } from '../context/ThemeContext';
import { ActiveTab } from './TopBar';
import { PhotoSession, Client, GearItem } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewSession: () => void;
  onOpenNewClient: () => void;
  onOpenNewGear: () => void;
  onOpenNewTx: () => void;
  onOpenContract: (sessionId?: string) => void;
  onEditSession: (session: PhotoSession) => void;
  onEditClient: (client: Client) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  setActiveTab,
  onOpenNewSession,
  onOpenNewClient,
  onOpenNewGear,
  onOpenNewTx,
  onOpenContract,
  onEditSession,
  onEditClient,
}) => {
  const { sessions, clients, gear, formatCurrency, exportDataJson } = useWork();
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // handled outside or toggled
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  const matchingSessions = sessions.filter(
    (s) =>
      s.title.toLowerCase().includes(cleanQuery) ||
      s.location.toLowerCase().includes(cleanQuery) ||
      s.category.toLowerCase().includes(cleanQuery)
  );

  const matchingClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(cleanQuery) ||
      (c.company && c.company.toLowerCase().includes(cleanQuery)) ||
      c.email.toLowerCase().includes(cleanQuery)
  );

  const matchingGear = gear.filter(
    (g) =>
      g.name.toLowerCase().includes(cleanQuery) ||
      g.category.toLowerCase().includes(cleanQuery) ||
      (g.serialNumber && g.serialNumber.toLowerCase().includes(cleanQuery))
  );

  const quickActions = [
    {
      id: 'new-session',
      label: 'Novo Ensaio ou Casamento',
      sub: 'Agendar nova sessão fotográfica no calendário',
      icon: Plus,
      action: () => {
        onClose();
        onOpenNewSession();
      },
    },
    {
      id: 'gen-contract',
      label: 'Gerar Contrato de Fotografia / Recibo',
      sub: 'Criar documento com cláusulas autorais e PIX',
      icon: FileText,
      action: () => {
        onClose();
        onOpenContract();
      },
    },
    {
      id: 'goto-templates',
      label: 'Central de Templates 2026',
      sub: 'Modelos atualizados de contratos blindados, propostas comerciais e WhatsApp',
      icon: BookOpen,
      action: () => {
        onClose();
        setActiveTab('templates');
      },
    },
    {
      id: 'goto-galleries',
      label: 'Galerias Web (FluxoWeby)',
      sub: 'Gerenciar galerias de clientes, seleções e venda de fotos extras Pix',
      icon: Camera,
      action: () => {
        onClose();
        setActiveTab('galleries');
      },
    },
    {
      id: 'new-client',
      label: 'Novo Cliente / Noivos',
      sub: 'Cadastrar contato com WhatsApp e Instagram',
      icon: Users,
      action: () => {
        onClose();
        onOpenNewClient();
      },
    },
    {
      id: 'new-tx',
      label: 'Registrar Lançamento Financeiro',
      sub: 'Entrada de sinal, pagamento ou despesa de estúdio',
      icon: DollarSign,
      action: () => {
        onClose();
        onOpenNewTx();
      },
    },
    {
      id: 'goto-freela',
      label: 'FREELA · Copiloto IA de Fotografia',
      sub: 'Direção de poses, legendas para Instagram, estratégias e cálculo de preço',
      icon: Sparkles,
      action: () => {
        onClose();
        setActiveTab('freela_ai');
      },
    },
    {
      id: 'goto-whatsapp',
      label: 'Extensão do WhatsApp Studio',
      sub: 'Disparo de propostas, lembretes de ensaio e cobrança amigável via Pix',
      icon: MessageSquare,
      action: () => {
        onClose();
        setActiveTab('whatsapp_ext');
      },
    },
    {
      id: 'goto-client-portal',
      label: 'Portal do Cliente (Visão dos Noivos)',
      sub: 'Visualizar como o cliente vê cronograma, contrato e seleção de fotos',
      icon: Globe,
      action: () => {
        onClose();
        setActiveTab('client_portal');
      },
    },
    {
      id: 'export-backup',
      label: 'Exportar Backup do Estúdio (JSON)',
      sub: 'Baixar arquivo de segurança de todos os ensaios, contratos e financeiro',
      icon: Download,
      action: () => {
        onClose();
        exportDataJson();
      },
    },
    {
      id: 'toggle-theme',
      label: theme === 'dark' ? 'Mudar para Tema Claro (Editorial)' : 'Mudar para Tema Escuro (Studio)',
      sub: theme === 'dark' ? 'Ativar visual claro de alta leitura' : 'Ativar visual cinematográfico escuro',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => {
        toggleTheme();
        onClose();
      },
    },
  ];

  const filteredActions = cleanQuery
    ? quickActions.filter(
        (a) =>
          a.label.toLowerCase().includes(cleanQuery) ||
          a.sub.toLowerCase().includes(cleanQuery)
      )
    : quickActions;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <Search className="w-5 h-5 text-zinc-400 dark:text-zinc-500 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar ensaios, noivos, câmeras, lentes, ações rápidas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 mr-2 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-3 space-y-4">
          {/* Quick Actions */}
          {filteredActions.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Ações Rápidas
              </div>
              <div className="mt-1 space-y-1">
                {filteredActions.map((act) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.id}
                      onClick={act.action}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg text-left text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 group-hover:bg-amber-500/10 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                            {act.label}
                          </div>
                          <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            {act.sub}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sessions matching */}
          {matchingSessions.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Ensaios & Casamentos ({matchingSessions.length})
              </div>
              <div className="mt-1 space-y-1">
                {matchingSessions.slice(0, 5).map((session) => (
                  <button
                    key={session.id}
                    onClick={() => {
                      onClose();
                      onEditSession(session);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-left text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                        <Camera className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                          {session.title}
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {session.sessionDate} · {session.location} · {formatCurrency(session.packagePrice)}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                      {session.stage}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clients matching */}
          {matchingClients.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Clientes & Noivos ({matchingClients.length})
              </div>
              <div className="mt-1 space-y-1">
                {matchingClients.slice(0, 4).map((client) => (
                  <button
                    key={client.id}
                    onClick={() => {
                      onClose();
                      onEditClient(client);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-left text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                          {client.name}
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {client.company || client.phone} · {client.email}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Gear matching */}
          {matchingGear.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Equipamentos ({matchingGear.length})
              </div>
              <div className="mt-1 space-y-1">
                {matchingGear.slice(0, 4).map((g) => (
                  <div
                    key={g.id}
                    onClick={() => {
                      onClose();
                      setActiveTab('gear');
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-left text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
                  >
                    <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                      {g.name}
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {g.serialNumber || g.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cleanQuery &&
            matchingSessions.length === 0 &&
            matchingClients.length === 0 &&
            matchingGear.length === 0 &&
            filteredActions.length === 0 && (
              <div className="p-8 text-center text-zinc-400 dark:text-zinc-500 text-xs">
                Nenhum resultado encontrado para &ldquo;{query}&rdquo;
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">↑</kbd>{' '}
              <kbd className="font-mono bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">↓</kbd> Navegar
            </span>
            <span>
              <kbd className="font-mono bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">↵</kbd> Selecionar
            </span>
          </div>
          <span>FotoGestor Studio Search</span>
        </div>
      </div>
    </div>
  );
};
