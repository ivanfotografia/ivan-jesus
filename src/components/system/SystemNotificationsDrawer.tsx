import React from 'react';
import {
  Bell,
  X,
  AlertTriangle,
  Camera,
  Calendar,
  CheckCircle,
  Wrench,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import { ActiveTab } from '../TopBar';

interface SystemNotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const SystemNotificationsDrawer: React.FC<SystemNotificationsDrawerProps> = ({
  isOpen,
  onClose,
  setActiveTab,
}) => {
  const { sessions, galleries, gear, transactions } = useWork();

  if (!isOpen) return null;

  // Compute live system alerts
  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(now.getDate() + 7);

  // 1. Upcoming sessions in next 7 days
  const upcomingSessions = sessions.filter((s) => {
    if (!s.sessionDate) return false;
    const sessionDate = new Date(s.sessionDate);
    return sessionDate >= now && sessionDate <= nextWeek && s.stage === 'agendado';
  });

  // 2. Pending extra photo orders in galleries
  const pendingGalleryOrders = galleries.flatMap((g) =>
    (g.orders || [])
      .filter((o) => o.paymentStatus === 'pending')
      .map((o) => ({ ...o, galleryTitle: g.title, galleryId: g.id }))
  );

  // 3. Gear requiring maintenance
  const gearInMaintenance = gear.filter((item) => item.status === 'maintenance');

  // 4. Pending financial transactions (income pending)
  const pendingIncomes = transactions.filter(
    (t) => t.type === 'income' && t.status === 'pending'
  );

  const totalAlerts =
    upcomingSessions.length +
    pendingGalleryOrders.length +
    gearInMaintenance.length +
    pendingIncomes.length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                Central de Notificações
                {totalAlerts > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-amber-500 text-zinc-950 rounded-full">
                    {totalAlerts}
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Alertas operacionais do sistema
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {totalAlerts === 0 ? (
            <div className="text-center py-12 text-zinc-500 dark:text-zinc-400 space-y-2">
              <CheckCircle className="w-10 h-10 mx-auto text-emerald-500/80 stroke-1" />
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Tudo sob controle!
              </p>
              <p className="text-xs">
                Nenhum ensaio pendente ou alerta operacional requer atenção no momento.
              </p>
            </div>
          ) : (
            <>
              {/* Upcoming sessions */}
              {upcomingSessions.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-sky-500" />
                    Ensaios Próximos (7 dias)
                  </div>
                  <div className="space-y-2">
                    {upcomingSessions.map((session) => (
                      <div
                        key={session.id}
                        onClick={() => {
                          setActiveTab('sessions');
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-sky-500/5 border border-sky-500/20 hover:border-sky-500/40 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-sky-600 dark:group-hover:text-sky-400">
                            {session.title}
                          </h4>
                          <span className="text-[10px] font-mono text-sky-600 dark:text-sky-400 font-medium">
                            {session.sessionDate}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                          Local: {session.location || 'A definir'} · Categoria: {session.category}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending gallery extra sales */}
              {pendingGalleryOrders.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Camera className="w-3.5 h-3.5 text-amber-500" />
                    Vendas Pix de Fotos Extras
                  </div>
                  <div className="space-y-2">
                    {pendingGalleryOrders.map((order) => (
                      <div
                        key={order.id}
                        onClick={() => {
                          setActiveTab('galleries');
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/40 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                            {order.clientName} · {order.extraPhotosCount} fotos extras
                          </h4>
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                            R$ {order.totalAmount.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                          Galeria: {order.galleryTitle} (Aguardando conferência Pix)
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gear requiring attention */}
              {gearInMaintenance.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Wrench className="w-3.5 h-3.5 text-rose-500" />
                    Equipamentos em Manutenção
                  </div>
                  <div className="space-y-2">
                    {gearInMaintenance.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setActiveTab('gear');
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 hover:border-rose-500/40 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400">
                            {item.name}
                          </h4>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold">
                            {item.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                          Categoria: {item.category} {item.serialNumber ? `· S/N: ${item.serialNumber}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Receivables */}
              {pendingIncomes.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    Receitas Pendentes de Quitação
                  </div>
                  <div className="space-y-2">
                    {pendingIncomes.slice(0, 3).map((tx) => (
                      <div
                        key={tx.id}
                        onClick={() => {
                          setActiveTab('finance');
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/40 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                            {tx.title}
                          </h4>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            R$ {tx.amount.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                          Vencimento: {tx.date}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>Sistema Atualizado em tempo real</span>
          <button
            onClick={() => {
              setActiveTab('settings');
              onClose();
            }}
            className="inline-flex items-center gap-1 text-zinc-700 dark:text-zinc-300 hover:text-amber-500 dark:hover:text-amber-400 font-medium cursor-pointer"
          >
            Ajustar Notificações <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
