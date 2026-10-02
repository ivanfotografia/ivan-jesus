import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Camera,
  Users,
  DollarSign,
  Package,
  Clock,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Activity,
  Aperture,
  FileText,
  CheckSquare,
  Sparkles,
  Smartphone,
  MessageSquare,
  GraduationCap,
  Globe,
  FileCheck,
  BookOpen,
} from 'lucide-react';
import { ActiveTab } from '../TopBar';
import { useWork } from '../../context/WorkContext';
import { PWAInstallButton } from '../PWAInstallButton';

interface SystemSidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenNewSession: () => void;
  onOpenDiagnostics: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  subLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number | null;
  badgeColor?: string;
  highlight?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const SystemSidebar: React.FC<SystemSidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  onToggleCollapse,
  onOpenNewSession,
  onOpenDiagnostics,
  isMobileOpen,
  onCloseMobile,
}) => {
  const {
    sessions,
    galleries,
    gear,
    clients,
    activeTimer,
    settings,
    proposals,
    contracts,
    tasks,
    teamMembers,
  } = useWork();

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  const navGroups: NavGroup[] = [
    {
      title: 'Visão Geral & CRM',
      items: [
        {
          id: 'dashboard' as ActiveTab,
          label: 'Painel Geral',
          icon: LayoutDashboard,
          badge: null,
        },
        {
          id: 'proposals' as ActiveTab,
          label: 'CRM & Vendas',
          subLabel: 'Propostas & Pacotes',
          icon: FileText,
          badge: proposals.length > 0 ? proposals.length : null,
          highlight: true,
        },
        {
          id: 'templates' as ActiveTab,
          label: 'Central de Templates',
          subLabel: 'Contratos 2026 & Vendas',
          icon: BookOpen,
          badge: '2026',
          badgeColor: 'bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30',
          highlight: true,
        },
        {
          id: 'management' as ActiveTab,
          label: 'Gestão Operacional',
          subLabel: 'Agenda, Tarefas & Equipe',
          icon: CheckSquare,
          badge: tasks.filter((t) => !t.completed).length > 0 ? tasks.filter((t) => !t.completed).length : null,
        },
      ],
    },
    {
      title: 'Ensaios & Fotos',
      items: [
        {
          id: 'sessions' as ActiveTab,
          label: 'Ensaios & Eventos',
          icon: CalendarDays,
          badge: sessions.length > 0 ? sessions.length : null,
        },
        {
          id: 'galleries' as ActiveTab,
          label: 'Galerias Web',
          subLabel: 'Venda de Fotos Pix',
          icon: Camera,
          badge: galleries.length > 0 ? galleries.length : null,
        },
        {
          id: 'clients' as ActiveTab,
          label: 'Clientes & Noivos',
          icon: Users,
          badge: clients.length > 0 ? clients.length : null,
        },
      ],
    },
    {
      title: 'Financeiro Empresarial',
      items: [
        {
          id: 'finance' as ActiveTab,
          label: 'Financeiro & Caixa',
          subLabel: 'Mercado Pago, Asaas & IA',
          icon: DollarSign,
          badge: null,
          highlight: true,
        },
      ],
    },
    {
      title: 'Experiência & Automação',
      items: [
        {
          id: 'client_portal' as ActiveTab,
          label: 'Portal do Cliente',
          subLabel: 'Visão dos Noivos',
          icon: Globe,
          badge: 'PORTAL',
          badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        },
        {
          id: 'freela_ai' as ActiveTab,
          label: 'FREELA · Copiloto IA',
          subLabel: 'Poses, Legendas & Preço',
          icon: Sparkles,
          badge: 'IA',
          badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
          highlight: true,
        },
        {
          id: 'whatsapp_ext' as ActiveTab,
          label: 'Extensão WhatsApp',
          subLabel: 'Mensagens em 1 Clique',
          icon: MessageSquare,
          badge: null,
        },
      ],
    },
    {
      title: 'Estúdio & Capacitação',
      items: [
        {
          id: 'gear' as ActiveTab,
          label: 'Equipamentos & Lentes',
          icon: Package,
          badge: gear.length > 0 ? gear.length : null,
        },
        {
          id: 'timetracker' as ActiveTab,
          label: 'Tempo de Edição',
          icon: Clock,
          badge: activeTimer.running ? 'GRAVANDO' : null,
          badgeColor: 'bg-rose-500 text-white animate-pulse',
        },
        {
          id: 'academy_support' as ActiveTab,
          label: 'Aulas & Suporte VIP',
          subLabel: 'Vídeos & App Mobile',
          icon: GraduationCap,
          badge: 'VIP',
        },
      ],
    },
    {
      title: 'Preferências',
      items: [
        {
          id: 'settings' as ActiveTab,
          label: 'Configurações',
          icon: Settings,
          badge: null,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#0d0d10] border-r border-white/[0.07] text-zinc-300 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none shadow-2xl ${
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-18' : 'lg:w-64'}`}
      >
        {/* Studio Brand Header */}
        <div className="h-16 flex items-center justify-between px-3.5 border-b border-white/[0.06] shrink-0 bg-[#09090b]/80 backdrop-blur-sm">
          <div
            onClick={() => handleNavClick('dashboard')}
            className={`flex items-center gap-3 cursor-pointer overflow-hidden transition-all ${
              isCollapsed ? 'justify-center w-full' : ''
            }`}
          >
            {/* Aperture Camera Insignia */}
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-zinc-950 font-bold shrink-0 shadow-lg shadow-amber-500/20 ring-1 ring-white/20">
              <Aperture className="w-5 h-5 text-zinc-950 stroke-[2.2]" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0d0d10]" />
            </div>

            {!isCollapsed && (
              <div className="leading-tight truncate">
                <div className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 font-display">
                  <span>FotoGestor</span>
                  <span className="text-[10px] font-mono tracking-wider px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/25">
                    STUDIO
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                  {settings.studioName || 'Estúdio Fotográfico'}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expandir Barra Lateral' : 'Recolher Barra Lateral'}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick New Session Action Button */}
        <div className="p-3 border-b border-white/[0.06] shrink-0">
          <button
            onClick={onOpenNewSession}
            title="Agendar Novo Ensaio ou Evento"
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-xs transition-all shadow-md cursor-pointer ${
              isCollapsed
                ? 'bg-amber-500 text-zinc-950 hover:bg-amber-400'
                : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-500 text-zinc-950 hover:from-amber-300 hover:to-amber-400 shadow-amber-500/15'
            }`}
          >
            <Plus className="w-4 h-4 shrink-0 stroke-[2.5]" />
            {!isCollapsed && <span className="font-semibold tracking-tight">Novo Ensaio</span>}
          </button>
        </div>

        {/* Nav Items List */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-2.5 pb-1 text-[11px] font-medium tracking-tight text-zinc-500">
                  {group.title}
                </div>
              )}
              {group.items.map((item) => {
                const isActive = activeTab === item.id;
                const IconComponent = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer relative group ${
                      isActive
                        ? 'bg-white/[0.09] text-white font-semibold shadow-xs ring-1 ring-white/[0.08]'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    {/* Active highlight indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-amber-400 rounded-r-full shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                    )}

                    <IconComponent
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? 'text-amber-400'
                          : 'text-zinc-400 group-hover:text-zinc-200'
                      }`}
                    />

                    {!isCollapsed && (
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <span className="truncate tracking-tight">{item.label}</span>
                        {item.badge !== null && item.badge !== undefined && (
                          <span
                            className={`ml-1.5 text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold tabular-nums ${
                              item.badgeColor
                                ? item.badgeColor
                                : isActive
                                ? 'bg-amber-400/20 text-amber-300'
                                : 'bg-white/[0.06] text-zinc-400'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer Zone */}
        <div className="p-3 border-t border-white/[0.06] shrink-0 space-y-2 bg-[#09090b]/70 backdrop-blur-sm">
          {/* PWA Install Button in Sidebar */}
          {!isCollapsed && (
            <div className="mb-2">
              <PWAInstallButton variant="sidebar" />
            </div>
          )}

          {/* Diagnostics / System Health Trigger */}
          <button
            onClick={onOpenDiagnostics}
            title="Diagnóstico & Backup do Banco de Dados"
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05] transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
            {!isCollapsed && (
              <div className="flex-1 flex items-center justify-between text-left">
                <span className="text-[11px] font-medium">Diagnóstico & Backup</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            )}
          </button>

          {/* System Profile Pill */}
          {!isCollapsed ? (
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-zinc-800/90 border border-white/[0.08] flex items-center justify-center text-xs font-bold text-amber-400 shrink-0 shadow-inner">
                  {settings.photographerName ? settings.photographerName.charAt(0).toUpperCase() : 'F'}
                </div>
                <div className="truncate text-left">
                  <div className="text-xs font-semibold text-white truncate">
                    {settings.photographerName || 'Administrador Master'}
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono">Studio OS Pro</div>
                </div>
              </div>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                PRO
              </span>
            </div>
          ) : (
            <div className="flex justify-center pt-1">
              <div className="w-8 h-8 rounded-xl bg-zinc-800/90 border border-white/[0.08] flex items-center justify-center text-xs font-bold text-amber-400 shadow-inner">
                {settings.photographerName ? settings.photographerName.charAt(0).toUpperCase() : 'F'}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
