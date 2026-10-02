import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Search,
  Camera,
  Disc,
  Zap,
  HardDrive,
  Sliders,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  Wrench,
  AlertTriangle,
  AlertCircle,
  Bell,
  BellRing,
  Calendar,
  Clock,
  CheckCircle2,
  X,
  ExternalLink,
  ChevronRight,
  Filter,
  Sparkles,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import { GearItem } from '../../types';

interface GearViewProps {
  onOpenNewGearModal: () => void;
  onEditGear: (item: GearItem) => void;
}

// Reference anchor date in the studio timeline: 2026-09-23
const TODAY_REF = new Date(2026, 8, 23, 12, 0, 0); // Month index 8 is September

interface GearAlertInfo {
  type: 'maintenance' | 'insurance';
  severity: 'overdue' | 'critical' | 'warning' | 'ok';
  days: number;
  label: string;
  badgeText: string;
  dateStr: string;
  formattedDate: string;
  description?: string;
  details?: string;
}

export const GearView: React.FC<GearViewProps> = ({
  onOpenNewGearModal,
  onEditGear,
}) => {
  const { gear, updateGearItem, formatCurrency } = useWork();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [alertFilter, setAlertFilter] = useState<'all' | 'with_alerts' | 'maintenance' | 'insurance'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Selected gear item for active notification / inspection
  const [selectedGearId, setSelectedGearId] = useState<string | null>('gear-1');
  const [notificationToast, setNotificationToast] = useState<{
    show: boolean;
    gearName: string;
    message: string;
    severity: 'critical' | 'warning' | 'info' | 'success';
  } | null>(null);

  const categoryLabels: Record<GearItem['category'], string> = {
    camera: 'Câmeras & Corpos',
    lens: 'Lentes & Objetivas',
    lighting: 'Iluminação & Flashes',
    storage: 'Cartões & Armazenamento',
    audio_accessory: 'Acessórios & Suportes',
  };

  const getCategoryIcon = (category: GearItem['category']) => {
    switch (category) {
      case 'camera':
        return Camera;
      case 'lens':
        return Disc;
      case 'lighting':
        return Zap;
      case 'storage':
        return HardDrive;
      case 'audio_accessory':
        return Sliders;
    }
  };

  const statusConfig: Record<GearItem['status'], { label: string; dot: string; text: string }> = {
    available: {
      label: 'Pronto para Uso',
      dot: 'bg-emerald-500',
      text: 'text-emerald-600 dark:text-emerald-400',
    },
    in_use: {
      label: 'Em Campo / Sessão',
      dot: 'bg-amber-500',
      text: 'text-amber-600 dark:text-amber-400',
    },
    maintenance: {
      label: 'Em Manutenção / Limpeza',
      dot: 'bg-rose-500',
      text: 'text-rose-600 dark:text-rose-400',
    },
  };

  // Helper to format date YYYY-MM-DD into DD/MM/YYYY
  const formatBrazilianDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    if (!y || !m || !d) return dateStr;
    return `${d}/${m}/${y}`;
  };

  // Calculate day difference from reference date
  const getDaysDifference = (targetDateStr?: string): number | null => {
    if (!targetDateStr) return null;
    const [y, m, d] = targetDateStr.split('-').map(Number);
    if (!y || !m || !d) return null;
    const target = new Date(y, m - 1, d, 12, 0, 0);
    const diffTime = target.getTime() - TODAY_REF.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  // Compute alert for maintenance
  const getMaintenanceAlert = (item: GearItem): GearAlertInfo | null => {
    if (!item.nextMaintenanceDate) return null;
    const days = getDaysDifference(item.nextMaintenanceDate);
    if (days === null) return null;

    const formattedDate = formatBrazilianDate(item.nextMaintenanceDate);

    if (days < 0) {
      return {
        type: 'maintenance',
        severity: 'overdue',
        days,
        label: 'Manutenção Atrasada',
        badgeText: `🚨 Vencida há ${Math.abs(days)}d`,
        dateStr: item.nextMaintenanceDate,
        formattedDate,
        description: item.maintenanceType || 'Revisão e limpeza periódica recomendada',
      };
    } else if (days <= 7) {
      return {
        type: 'maintenance',
        severity: 'critical',
        days,
        label: 'Manutenção Iminente',
        badgeText: `⚠️ Revisão em ${days === 0 ? 'hoje' : `${days}d`}`,
        dateStr: item.nextMaintenanceDate,
        formattedDate,
        description: item.maintenanceType || 'Limpeza e calibração preventiva urgente',
      };
    } else if (days <= 30) {
      return {
        type: 'maintenance',
        severity: 'warning',
        days,
        label: 'Manutenção Próxima',
        badgeText: `🔧 Revisão em ${days}d`,
        dateStr: item.nextMaintenanceDate,
        formattedDate,
        description: item.maintenanceType || 'Revisão preventiva programada',
      };
    }
    return {
      type: 'maintenance',
      severity: 'ok',
      days,
      label: 'Manutenção em Dia',
      badgeText: '✓ Revisão em dia',
      dateStr: item.nextMaintenanceDate,
      formattedDate,
      description: item.maintenanceType,
    };
  };

  // Compute alert for insurance renewal
  const getInsuranceAlert = (item: GearItem): GearAlertInfo | null => {
    if (!item.insuranceRenewalDate) return null;
    const days = getDaysDifference(item.insuranceRenewalDate);
    if (days === null) return null;

    const formattedDate = formatBrazilianDate(item.insuranceRenewalDate);

    if (days < 0) {
      return {
        type: 'insurance',
        severity: 'overdue',
        days,
        label: 'Apólice de Seguro Expirada',
        badgeText: `🚨 Seguro Vencido (${Math.abs(days)}d)`,
        dateStr: item.insuranceRenewalDate,
        formattedDate,
        description: item.insuranceCompany
          ? `${item.insuranceCompany} (Apólice ${item.insurancePolicyNumber || 'S/N'})`
          : 'Renovação urgente de apólice de seguro',
        details: item.estimatedValue ? `Valor segurado: ${formatCurrency(item.estimatedValue)}` : undefined,
      };
    } else if (days <= 7) {
      return {
        type: 'insurance',
        severity: 'critical',
        days,
        label: 'Renovação de Seguro Iminente',
        badgeText: `🛡️ Renovar Seguro (${days === 0 ? 'hoje' : `${days}d`})`,
        dateStr: item.insuranceRenewalDate,
        formattedDate,
        description: item.insuranceCompany
          ? `${item.insuranceCompany} (Apólice ${item.insurancePolicyNumber || 'S/N'})`
          : 'Renovação da apólice dentro de 7 dias',
        details: item.estimatedValue ? `Valor segurado: ${formatCurrency(item.estimatedValue)}` : undefined,
      };
    } else if (days <= 30) {
      return {
        type: 'insurance',
        severity: 'warning',
        days,
        label: 'Renovação de Seguro Próxima',
        badgeText: `🛡️ Seguro em ${days}d`,
        dateStr: item.insuranceRenewalDate,
        formattedDate,
        description: item.insuranceCompany
          ? `${item.insuranceCompany} (Apólice ${item.insurancePolicyNumber || 'S/N'})`
          : 'Prazo para cotação e renovação anual',
        details: item.estimatedValue ? `Valor segurado: ${formatCurrency(item.estimatedValue)}` : undefined,
      };
    }
    return {
      type: 'insurance',
      severity: 'ok',
      days,
      label: 'Seguro Ativo',
      badgeText: '✓ Seguro em dia',
      dateStr: item.insuranceRenewalDate,
      formattedDate,
      description: item.insuranceCompany ? `${item.insuranceCompany}` : undefined,
    };
  };

  // Global summary of gear alerts
  const alertStats = useMemo(() => {
    let overdueCount = 0;
    let criticalCount = 0;
    let warningCount = 0;
    let maintenancePendingCount = 0;
    let insurancePendingCount = 0;

    const alertGearItems: Array<{
      gear: GearItem;
      maintAlert: GearAlertInfo | null;
      insAlert: GearAlertInfo | null;
      highestSeverity: 'overdue' | 'critical' | 'warning' | 'ok';
    }> = [];

    gear.forEach((item) => {
      const maintAlert = getMaintenanceAlert(item);
      const insAlert = getInsuranceAlert(item);

      const isMaintPending = maintAlert && maintAlert.severity !== 'ok';
      const isInsPending = insAlert && insAlert.severity !== 'ok';

      if (isMaintPending || isInsPending) {
        if (isMaintPending) maintenancePendingCount++;
        if (isInsPending) insurancePendingCount++;

        const severities = [maintAlert?.severity, insAlert?.severity];
        let highest: 'overdue' | 'critical' | 'warning' | 'ok' = 'warning';
        if (severities.includes('overdue')) {
          highest = 'overdue';
          overdueCount++;
        } else if (severities.includes('critical')) {
          highest = 'critical';
          criticalCount++;
        } else {
          warningCount++;
        }

        alertGearItems.push({
          gear: item,
          maintAlert,
          insAlert,
          highestSeverity: highest,
        });
      }
    });

    return {
      totalAlerts: alertGearItems.length,
      overdueCount,
      criticalCount,
      warningCount,
      maintenancePendingCount,
      insurancePendingCount,
      itemsWithAlerts: alertGearItems,
    };
  }, [gear]);

  // Selected item object
  const selectedGear = useMemo(() => {
    if (!selectedGearId) return null;
    return gear.find((g) => g.id === selectedGearId) || null;
  }, [gear, selectedGearId]);

  // Selected item alerts
  const selectedAlerts = useMemo(() => {
    if (!selectedGear) return { maintAlert: null, insAlert: null, hasActiveAlert: false };
    const maintAlert = getMaintenanceAlert(selectedGear);
    const insAlert = getInsuranceAlert(selectedGear);
    const hasActiveAlert =
      (maintAlert && maintAlert.severity !== 'ok') ||
      (insAlert && insAlert.severity !== 'ok');
    return { maintAlert, insAlert, hasActiveAlert };
  }, [selectedGear]);

  // Handle selecting a gear item with trigger toast
  const handleSelectGear = (item: GearItem) => {
    setSelectedGearId(item.id);

    const maint = getMaintenanceAlert(item);
    const ins = getInsuranceAlert(item);

    const hasMaintAlert = maint && maint.severity !== 'ok';
    const hasInsAlert = ins && ins.severity !== 'ok';

    if (hasMaintAlert || hasInsAlert) {
      let msg = '';
      if (hasMaintAlert && hasInsAlert) {
        msg = `Atenção: ${maint!.label} (${maint!.badgeText}) e ${ins!.label} (${ins!.badgeText}).`;
      } else if (hasMaintAlert) {
        msg = `Alerta de Manutenção: ${maint!.badgeText} (${maint!.description || maint!.formattedDate}).`;
      } else {
        msg = `Alerta de Seguro: ${ins!.badgeText} (${ins!.description || ins!.formattedDate}).`;
      }

      setNotificationToast({
        show: true,
        gearName: item.name,
        message: msg,
        severity: maint?.severity === 'overdue' || ins?.severity === 'overdue' ? 'critical' : 'warning',
      });
    } else {
      setNotificationToast({
        show: true,
        gearName: item.name,
        message: 'Equipamento selecionado. Manutenções e apólice de seguro em dia!',
        severity: 'info',
      });
    }
  };

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (notificationToast?.show) {
      const timer = setTimeout(() => {
        setNotificationToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notificationToast]);

  // Action: Mark maintenance completed (+6 months ahead)
  const handleCompleteMaintenance = (item: GearItem) => {
    // Reference date: 2026-09-23 -> new maintenance +6 months = 2027-03-23
    updateGearItem(item.id, {
      lastMaintenanceDate: '2026-09-23',
      nextMaintenanceDate: '2027-03-23',
      status: 'available',
    });

    setNotificationToast({
      show: true,
      gearName: item.name,
      message: '✅ Manutenção registrada com sucesso! Próxima revisão agendada para 23/03/2027.',
      severity: 'success',
    });
  };

  // Action: Renew insurance (+1 year)
  const handleRenewInsurance = (item: GearItem) => {
    let nextYear = '2027-10-08';
    if (item.insuranceRenewalDate) {
      const parts = item.insuranceRenewalDate.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10) + 1;
        nextYear = `${y}-${parts[1]}-${parts[2]}`;
      }
    }

    updateGearItem(item.id, {
      insuranceRenewalDate: nextYear,
    });

    setNotificationToast({
      show: true,
      gearName: item.name,
      message: `🛡️ Seguro renovado com sucesso! Nova vigência até ${formatBrazilianDate(nextYear)}.`,
      severity: 'success',
    });
  };

  // Filtered gear list
  const filteredGear = gear.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.serialNumber && item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.insurancePolicyNumber && item.insurancePolicyNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.maintenanceType && item.maintenanceType.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      categoryFilter === 'all' || item.category === categoryFilter;

    let matchesAlert = true;
    if (alertFilter === 'with_alerts') {
      const m = getMaintenanceAlert(item);
      const i = getInsuranceAlert(item);
      matchesAlert = Boolean((m && m.severity !== 'ok') || (i && i.severity !== 'ok'));
    } else if (alertFilter === 'maintenance') {
      const m = getMaintenanceAlert(item);
      matchesAlert = Boolean(m && m.severity !== 'ok');
    } else if (alertFilter === 'insurance') {
      const i = getInsuranceAlert(item);
      matchesAlert = Boolean(i && i.severity !== 'ok');
    }

    return matchesSearch && matchesCategory && matchesAlert;
  });

  const handleCopySerial = (e: React.MouseEvent, id: string, serial: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(serial);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Alert (When selecting equipment) */}
      {notificationToast && (
        <div
          role="alert"
          className={`fixed bottom-5 right-5 z-50 max-w-md w-full p-4 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 flex items-start justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 ${
            notificationToast.severity === 'critical'
              ? 'bg-rose-950/90 text-rose-100 border-rose-700/80 shadow-rose-950/50'
              : notificationToast.severity === 'warning'
              ? 'bg-amber-950/90 text-amber-100 border-amber-700/80 shadow-amber-950/50'
              : notificationToast.severity === 'success'
              ? 'bg-emerald-950/90 text-emerald-100 border-emerald-700/80 shadow-emerald-950/50'
              : 'bg-zinc-900/90 text-zinc-100 border-zinc-700/80 shadow-black/50'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              {notificationToast.severity === 'critical' ? (
                <AlertCircle className="w-5 h-5 text-rose-400" />
              ) : notificationToast.severity === 'warning' ? (
                <BellRing className="w-5 h-5 text-amber-400 animate-bounce" />
              ) : notificationToast.severity === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Bell className="w-5 h-5 text-zinc-400" />
              )}
            </div>
            <div>
              <div className="font-semibold text-xs tracking-wide uppercase opacity-80">
                {notificationToast.gearName}
              </div>
              <p className="text-xs font-medium mt-0.5 leading-relaxed">
                {notificationToast.message}
              </p>
            </div>
          </div>
          <button
            onClick={() => setNotificationToast(null)}
            className="text-zinc-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200/80 dark:border-white/[0.07] transition-colors">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-display">
              Armário de Equipamentos & Gear
            </h1>
            {alertStats.totalAlerts > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <BellRing className="w-3 h-3" />
                {alertStats.totalAlerts} com alertas ativos
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Inventário técnico de câmeras, lentes e iluminação com monitoramento de revisões preventivas e renovação de apólice de seguro.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewGearModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Cadastrar Equipamento</span>
          </button>
        </div>
      </div>

      {/* SISTEMA DE NOTIFICAÇÕES & ALERTA GLOBAL */}
      <div className="bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-white/[0.08] rounded-2xl p-5 shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 font-display">
                <span>Central de Notificações de Manutenção & Seguro</span>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400">
                  Timeline 2026
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Monitora datas de limpeza de sensor, calibração ótica e vigência de apólice contra furto e quebra.
              </p>
            </div>
          </div>

          {/* Quick Filters for Alerts */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setAlertFilter('all')}
              className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all cursor-pointer ${
                alertFilter === 'all'
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-semibold'
                  : 'bg-zinc-100 dark:bg-white/[0.05] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Todos ({gear.length})
            </button>

            <button
              onClick={() => setAlertFilter('with_alerts')}
              className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all cursor-pointer inline-flex items-center gap-1 ${
                alertFilter === 'with_alerts'
                  ? 'bg-amber-500 text-zinc-950 font-semibold'
                  : 'bg-zinc-100 dark:bg-white/[0.05] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              <span>Com Alertas ({alertStats.totalAlerts})</span>
            </button>

            <button
              onClick={() => setAlertFilter('maintenance')}
              className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all cursor-pointer inline-flex items-center gap-1 ${
                alertFilter === 'maintenance'
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-semibold'
                  : 'bg-zinc-100 dark:bg-white/[0.05] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Wrench className="w-3 h-3 text-zinc-400" />
              <span>Manutenção ({alertStats.maintenancePendingCount})</span>
            </button>

            <button
              onClick={() => setAlertFilter('insurance')}
              className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all cursor-pointer inline-flex items-center gap-1 ${
                alertFilter === 'insurance'
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-semibold'
                  : 'bg-zinc-100 dark:bg-white/[0.05] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <ShieldAlert className="w-3 h-3 text-zinc-400" />
              <span>Seguro ({alertStats.insurancePendingCount})</span>
            </button>
          </div>
        </div>

        {/* Quick Clickable Alert Badges Deck */}
        {alertStats.itemsWithAlerts.length > 0 ? (
          <div className="mt-3.5 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-medium text-zinc-400 shrink-0">
              Atenção imediata:
            </span>
            {alertStats.itemsWithAlerts.map(({ gear: item, maintAlert, insAlert, highestSeverity }) => (
              <button
                key={item.id}
                onClick={() => handleSelectGear(item)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium transition-all shrink-0 cursor-pointer border ${
                  selectedGearId === item.id
                    ? 'ring-2 ring-amber-500 font-bold'
                    : ''
                } ${
                  highestSeverity === 'overdue'
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60 hover:bg-rose-100'
                    : highestSeverity === 'critical'
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60 hover:bg-amber-100'
                    : 'bg-zinc-100 dark:bg-white/[0.05] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/[0.08] hover:bg-zinc-200'
                }`}
                title={`Clique para selecionar e auditar ${item.name}`}
              >
                {highestSeverity === 'overdue' ? (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span>{item.name.split('(')[0].trim()}</span>
                <span className="text-[10px] opacity-75">
                  ({maintAlert?.severity !== 'ok' ? maintAlert?.badgeText : insAlert?.badgeText})
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-3.5 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Todos os equipamentos estão com manutenções e seguros em conformidade.</span>
          </div>
        )}
      </div>

      {/* INSPECTOR DO EQUIPAMENTO SELECIONADO: NOTIFICAÇÃO CONTEXTUAL COM AÇÕES */}
      {selectedGear && (
        <div
          className={`p-5 rounded-2xl border transition-all duration-300 shadow-md ${
            selectedAlerts.hasActiveAlert
              ? selectedAlerts.maintAlert?.severity === 'overdue' || selectedAlerts.insAlert?.severity === 'overdue'
                ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/80'
                : 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80'
              : 'bg-zinc-50 dark:bg-[#121215] border-zinc-200 dark:border-white/[0.08]'
          }`}
        >
          {/* Header of Selected Item Alert */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200/80 dark:border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  selectedAlerts.hasActiveAlert
                    ? selectedAlerts.maintAlert?.severity === 'overdue' || selectedAlerts.insAlert?.severity === 'overdue'
                      ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400'
                      : 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'
                    : 'bg-zinc-100 dark:bg-white/[0.05] text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {selectedAlerts.hasActiveAlert ? (
                  <BellRing className="w-5 h-5 animate-pulse" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-zinc-200/80 dark:bg-white/[0.08] text-zinc-700 dark:text-zinc-300">
                    Equipamento Selecionado
                  </span>
                  <span className="text-xs text-zinc-400">·</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                    {categoryLabels[selectedGear.category]}
                  </span>
                  {selectedGear.serialNumber && (
                    <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                      S/N: {selectedGear.serialNumber}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 font-display">
                  {selectedGear.name}
                </h3>
              </div>
            </div>

            {/* Actions for Selected Gear */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onEditGear(selectedGear)}
                className="px-3.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-[#18181c] border border-zinc-200 dark:border-white/[0.08] rounded-xl hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
              >
                Editar Ficha & Prazos
              </button>
              <button
                onClick={() => setSelectedGearId(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
                title="Fechar inspeção"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Alert Content Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Maintenance Alert Box */}
            <div
              className={`p-4 rounded-xl border transition-colors ${
                selectedAlerts.maintAlert && selectedAlerts.maintAlert.severity !== 'ok'
                  ? selectedAlerts.maintAlert.severity === 'overdue'
                    ? 'bg-rose-100/60 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
                    : 'bg-amber-100/60 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                  : 'bg-white dark:bg-[#18181c] border-zinc-200 dark:border-white/[0.06]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  <Wrench className="w-4 h-4 text-amber-500" />
                  <span>Manutenção Preventiva</span>
                </div>
                {selectedAlerts.maintAlert ? (
                  <span
                    className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                      selectedAlerts.maintAlert.severity === 'overdue'
                        ? 'bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
                        : selectedAlerts.maintAlert.severity === 'critical'
                        ? 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200'
                        : selectedAlerts.maintAlert.severity === 'warning'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                    }`}
                  >
                    {selectedAlerts.maintAlert.badgeText}
                  </span>
                ) : (
                  <span className="text-[10px] text-zinc-400">Não cadastrada</span>
                )}
              </div>

              {selectedAlerts.maintAlert ? (
                <div className="mt-2.5 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Data agendada:</span>
                    <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                      {selectedAlerts.maintAlert.formattedDate}
                    </span>
                  </div>

                  {selectedAlerts.maintAlert.description && (
                    <div className="text-[11px] text-zinc-600 dark:text-zinc-300 pt-1">
                      <span className="font-medium text-zinc-500 dark:text-zinc-400">Procedimento: </span>
                      {selectedAlerts.maintAlert.description}
                    </div>
                  )}

                  {selectedGear.lastMaintenanceDate && (
                    <div className="text-[10px] text-zinc-400 pt-0.5">
                      Última revisão realizada em: {formatBrazilianDate(selectedGear.lastMaintenanceDate)}
                    </div>
                  )}

                  {/* Quick Action Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => handleCompleteMaintenance(selectedGear)}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Concluir Revisão (+6 meses em dia)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <p>Nenhuma data de manutenção cadastrada para este item.</p>
                  <button
                    onClick={() => onEditGear(selectedGear)}
                    className="mt-2 text-xs text-amber-600 dark:text-amber-400 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    Definir prazo de revisão →
                  </button>
                </div>
              )}
            </div>

            {/* Insurance Alert Box */}
            <div
              className={`p-4 rounded-xl border transition-colors ${
                selectedAlerts.insAlert && selectedAlerts.insAlert.severity !== 'ok'
                  ? selectedAlerts.insAlert.severity === 'overdue'
                    ? 'bg-rose-100/60 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
                    : 'bg-amber-100/60 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                  : 'bg-white dark:bg-[#18181c] border-zinc-200 dark:border-white/[0.06]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Seguro & Apólice</span>
                </div>
                {selectedAlerts.insAlert ? (
                  <span
                    className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                      selectedAlerts.insAlert.severity === 'overdue'
                        ? 'bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
                        : selectedAlerts.insAlert.severity === 'critical'
                        ? 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200'
                        : selectedAlerts.insAlert.severity === 'warning'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                    }`}
                  >
                    {selectedAlerts.insAlert.badgeText}
                  </span>
                ) : (
                  <span className="text-[10px] text-zinc-400">Não cadastrado</span>
                )}
              </div>

              {selectedAlerts.insAlert ? (
                <div className="mt-2.5 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Vencimento da apólice:</span>
                    <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                      {selectedAlerts.insAlert.formattedDate}
                    </span>
                  </div>

                  {selectedAlerts.insAlert.description && (
                    <div className="text-[11px] text-zinc-600 dark:text-zinc-300 pt-1">
                      <span className="font-medium text-zinc-500 dark:text-zinc-400">Seguradora: </span>
                      {selectedAlerts.insAlert.description}
                    </div>
                  )}

                  {selectedAlerts.insAlert.details && (
                    <div className="text-[11px] font-mono text-zinc-600 dark:text-zinc-300">
                      {selectedAlerts.insAlert.details}
                    </div>
                  )}

                  {/* Quick Action Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => handleRenewInsurance(selectedGear)}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white transition-colors cursor-pointer shadow-2xs"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Confirmar Renovação da Apólice (+1 ano)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <p>Equipamento sem apólice de seguro vinculada.</p>
                  <button
                    onClick={() => onEditGear(selectedGear)}
                    className="mt-2 text-xs text-amber-600 dark:text-amber-400 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    Vincular seguro fotográfico →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-3.5 bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-white/[0.08] rounded-2xl flex flex-wrap items-center gap-3 shadow-2xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por equipamento, número de série, apólice ou tipo de revisão..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 dark:bg-[#18181c] border border-zinc-200 dark:border-white/[0.08] rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-500 dark:text-zinc-400">Categoria:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs bg-white dark:bg-[#18181c] text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
          >
            <option value="all">Todas as Categorias ({gear.length})</option>
            <option value="camera">Câmeras & Corpos</option>
            <option value="lens">Lentes & Objetivas</option>
            <option value="lighting">Iluminação & Flashes</option>
            <option value="storage">Cartões & Armazenamento</option>
            <option value="audio_accessory">Acessórios & Suportes</option>
          </select>
        </div>
      </div>

      {/* Gear Grid with Alert Badges & Selection Interaction */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGear.map((item) => {
          const Icon = getCategoryIcon(item.category);
          const status = statusConfig[item.status];
          const isCopied = copiedId === item.id;
          const isSelected = selectedGearId === item.id;

          const maintAlert = getMaintenanceAlert(item);
          const insAlert = getInsuranceAlert(item);

          const hasOverdue =
            maintAlert?.severity === 'overdue' || insAlert?.severity === 'overdue';
          const hasCritical =
            maintAlert?.severity === 'critical' || insAlert?.severity === 'critical';
          const hasWarning =
            maintAlert?.severity === 'warning' || insAlert?.severity === 'warning';

          return (
            <div
              key={item.id}
              onClick={() => handleSelectGear(item)}
              className={`p-5 bg-white dark:bg-[#121215] rounded-2xl transition-all cursor-pointer flex flex-col justify-between shadow-2xs group relative border ${
                isSelected
                  ? hasOverdue
                    ? 'border-rose-500 ring-2 ring-rose-500/30 dark:ring-rose-500/20'
                    : hasCritical || hasWarning
                    ? 'border-amber-500 ring-2 ring-amber-500/30 dark:ring-amber-500/20'
                    : 'border-zinc-900 dark:border-white ring-2 ring-zinc-900/20 dark:ring-white/20'
                  : hasOverdue
                  ? 'border-rose-300 dark:border-rose-800/80 hover:border-rose-400'
                  : hasCritical
                  ? 'border-amber-300 dark:border-amber-800/80 hover:border-amber-400'
                  : 'border-zinc-200/90 dark:border-white/[0.08] hover:border-zinc-300 dark:hover:border-white/[0.16]'
              }`}
            >
              <div>
                {/* Top Category & Status Line */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-zinc-100 dark:bg-white/[0.05] text-zinc-600 dark:text-zinc-300">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      {categoryLabels[item.category]}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-medium">
                    <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                    <span className={status.text}>{status.label}</span>
                  </div>
                </div>

                {/* Equipment Title */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors font-display">
                    {item.name}
                  </h3>
                  {isSelected && (
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-zinc-950 shrink-0">
                      Ativo
                    </span>
                  )}
                </div>

                {/* Serial Number */}
                {item.serialNumber && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                      S/N: {item.serialNumber}
                    </span>
                    <button
                      onClick={(e) => handleCopySerial(e, item.id, item.serialNumber!)}
                      title="Copiar Número de Série"
                      className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-0.5 rounded cursor-pointer"
                    >
                      {isCopied ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                )}

                {/* Notification Badges on the Card */}
                {(maintAlert || insAlert) && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {maintAlert && maintAlert.severity !== 'ok' && (
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1 ${
                          maintAlert.severity === 'overdue'
                            ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-900'
                            : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-900'
                        }`}
                      >
                        <Wrench className="w-3 h-3" />
                        {maintAlert.badgeText}
                      </span>
                    )}

                    {insAlert && insAlert.severity !== 'ok' && (
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1 ${
                          insAlert.severity === 'overdue'
                            ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-900'
                            : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-900'
                        }`}
                      >
                        <ShieldAlert className="w-3 h-3" />
                        {insAlert.badgeText}
                      </span>
                    )}

                    {maintAlert?.severity === 'ok' && insAlert?.severity === 'ok' && (
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Em conformidade
                      </span>
                    )}
                  </div>
                )}

                {/* Notes */}
                {item.notes && (
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2.5 line-clamp-2 leading-relaxed">
                    {item.notes}
                  </p>
                )}
              </div>

              {/* Bottom Card Footer with Actions */}
              <div className="mt-4 pt-3.5 border-t border-zinc-100 dark:border-white/[0.05] flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                  {isSelected ? (
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      Selecionado
                    </span>
                  ) : (
                    <span>Clique para auditar</span>
                  )}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditGear(item);
                  }}
                  className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline transition-colors p-1 cursor-pointer"
                >
                  Editar Ficha →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
