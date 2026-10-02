import React, { useState, useMemo, useEffect } from 'react';
import {
  Camera,
  Calendar,
  Layers,
  Sparkles,
  Wallet,
  Play,
  ArrowRight,
  Plus,
  Clock,
  MapPin,
  FileText,
  SunMedium,
  Copy,
  Check,
  TrendingUp,
  Aperture,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
  Trophy,
  Sliders,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Cell,
  PieChart,
  Pie,
  ReferenceLine,
} from 'recharts';
import { useWork } from '../../context/WorkContext';
import { useTheme } from '../../context/ThemeContext';
import { ActiveTab } from '../TopBar';
import { PhotoSession, SessionCategory, SessionStage } from '../../types';

interface PhotographyDashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewSessionModal: () => void;
  onOpenContractModal: (sessionId?: string) => void;
  onEditSession: (session: PhotoSession) => void;
}

export const PhotographyDashboardView: React.FC<PhotographyDashboardViewProps> = ({
  setActiveTab,
  onOpenNewSessionModal,
  onOpenContractModal,
  onEditSession,
}) => {
  const {
    sessions,
    gear,
    transactions,
    settings,
    updateSettings,
    formatCurrency,
    formatDuration,
    startTimer,
    activeTimer,
  } = useWork();

  const { theme } = useTheme();
  const [copiedPix, setCopiedPix] = useState(false);

  // Monthly Revenue Goal State
  const monthlyGoal = settings.monthlyRevenueGoal || 8000;
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalInput, setGoalInput] = useState<number>(monthlyGoal);

  // Financial general metrics
  const paidIncome = transactions
    .filter((t) => t.type === 'income' && t.status === 'paid')
    .reduce((acc, t) => acc + t.amount, 0);

  const paidExpenses = transactions
    .filter((t) => t.type === 'expense' && t.status === 'paid')
    .reduce((acc, t) => acc + t.amount, 0);

  const netBalance = paidIncome - paidExpenses;

  const pendingIncome = transactions
    .filter((t) => t.type === 'income' && t.status === 'pending')
    .reduce((acc, t) => acc + t.amount, 0);

  // Extra photos sold
  const totalExtraPhotos = sessions.reduce((acc, s) => acc + s.extraPhotosCount, 0);
  const totalExtraRevenue = sessions.reduce(
    (acc, s) => acc + s.extraPhotosCount * s.extraPhotoPrice,
    0
  );

  // Editing Pipeline Stats
  const editingSessions = sessions.filter((s) => s.stage === 'edicao');

  const totalPhotosToEdit = editingSessions.reduce(
    (acc, s) => acc + (s.selectedPhotos || s.contractedPhotos),
    0
  );
  const totalPhotosEdited = editingSessions.reduce(
    (acc, s) => acc + s.editedPhotos,
    0
  );

  const progressPercentage =
    totalPhotosToEdit > 0 ? Math.round((totalPhotosEdited / totalPhotosToEdit) * 100) : 0;

  const categoryLabels: Record<SessionCategory, string> = {
    casamento: 'Casamento',
    ensaio_casal: 'Pré-Wedding / Casal',
    retrato_corporativo: 'Retrato Corporativo',
    familia_gestante: 'Gestante & Família',
    moda_editorial: 'Moda / Editorial',
    evento_aniversario: 'Evento & Aniversário',
    gastronomia: 'Gastronomia',
  };

  const nextSession = sessions
    .filter((s) => s.stage === 'agendado')
    .sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime())[0];

  const handleCopyPix = () => {
    if (settings.pixKey) {
      navigator.clipboard.writeText(settings.pixKey);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2000);
    }
  };

  // Recharts Data 1: Monthly Revenue (Faturamento Mensal - Last 6 Months)
  const monthlyRevenueData = useMemo(() => {
    const monthNames = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ];

    const now = new Date();
    let refYear = now.getFullYear();
    let refMonth = now.getMonth();

    // Check maximum transaction date to anchor properly
    transactions.forEach((t) => {
      if (t.date) {
        const parts = t.date.split('-');
        if (parts.length >= 2) {
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          if (y > refYear || (y === refYear && m > refMonth)) {
            refYear = y;
            refMonth = m;
          }
        }
      }
    });

    const months: Array<{
      key: string;
      label: string;
      monthName: string;
      realizado: number;
      pendente: number;
      total: number;
    }> = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(refYear, refMonth - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const key = `${y}-${String(m + 1).padStart(2, '0')}`;
      months.push({
        key,
        label: `${monthNames[m]} ${String(y).slice(-2)}`,
        monthName: monthNames[m],
        realizado: 0,
        pendente: 0,
        total: 0,
      });
    }

    transactions
      .filter((t) => t.type === 'income')
      .forEach((t) => {
        if (!t.date) return;
        const key = t.date.slice(0, 7);
        const target = months.find((m) => m.key === key);
        if (target) {
          if (t.status === 'paid') {
            target.realizado += t.amount;
          } else if (t.status === 'pending') {
            target.pendente += t.amount;
          }
          target.total += t.amount;
        }
      });

    return months;
  }, [transactions]);

  const totalPeriodRealizado = useMemo(() => {
    return monthlyRevenueData.reduce((acc, m) => acc + m.realizado, 0);
  }, [monthlyRevenueData]);

  const averageMonthlyRevenue = useMemo(() => {
    return monthlyRevenueData.length > 0 ? totalPeriodRealizado / monthlyRevenueData.length : 0;
  }, [totalPeriodRealizado, monthlyRevenueData]);

  // Month selector for Monthly Goal System (defaults to latest active month, e.g. "2026-09")
  const latestMonthKey = monthlyRevenueData[monthlyRevenueData.length - 1]?.key || '2026-09';
  const [selectedGoalMonth, setSelectedGoalMonth] = useState<string>(latestMonthKey);

  useEffect(() => {
    if (!selectedGoalMonth && latestMonthKey) {
      setSelectedGoalMonth(latestMonthKey);
    }
  }, [latestMonthKey, selectedGoalMonth]);

  // Goal metrics for the chosen month
  const goalMonthMetrics = useMemo(() => {
    const activeKey = selectedGoalMonth || latestMonthKey;
    const targetMonthObj = monthlyRevenueData.find((m) => m.key === activeKey);

    const realizado = targetMonthObj ? targetMonthObj.realizado : 0;
    const pendente = targetMonthObj ? targetMonthObj.pendente : 0;
    const total = realizado + pendente;

    const realPercent = monthlyGoal > 0 ? (realizado / monthlyGoal) * 100 : 0;
    const projectedPercent = monthlyGoal > 0 ? (total / monthlyGoal) * 100 : 0;

    const remainingReal = Math.max(0, monthlyGoal - realizado);
    const remainingProjected = Math.max(0, monthlyGoal - total);
    const isGoalAchieved = realizado >= monthlyGoal;
    const isProjectedAchieved = total >= monthlyGoal;

    const [yearStr, monthStr] = activeKey.split('-');
    const mIdx = parseInt(monthStr, 10) - 1;
    const monthNamesFull = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
    const monthFullName = monthNamesFull[mIdx] ? `${monthNamesFull[mIdx]} de ${yearStr}` : activeKey;

    return {
      activeKey,
      monthFullName,
      realizado,
      pendente,
      total,
      realPercent: Math.round(realPercent * 10) / 10,
      projectedPercent: Math.round(projectedPercent * 10) / 10,
      remainingReal,
      remainingProjected,
      isGoalAchieved,
      isProjectedAchieved,
    };
  }, [selectedGoalMonth, latestMonthKey, monthlyRevenueData, monthlyGoal]);

  const handleOpenGoalModal = () => {
    setGoalInput(monthlyGoal);
    setIsGoalModalOpen(true);
  };

  const handleSaveGoal = (newVal?: number) => {
    const val = newVal !== undefined ? newVal : goalInput;
    if (val > 0) {
      updateSettings({ monthlyRevenueGoal: val });
      setIsGoalModalOpen(false);
    }
  };

  // Recharts Data 2: Session Stages Distribution (Gráfico de Rosca)
  const stageDistributionData = useMemo(() => {
    const stageConfig: Record<
      SessionStage,
      { label: string; shortLabel: string; color: string; darkColor: string }
    > = {
      agendado: {
        label: 'Agendado / Briefing',
        shortLabel: 'Agendados',
        color: '#3b82f6', // blue-500
        darkColor: '#60a5fa', // blue-400
      },
      sessao_feita: {
        label: 'Sessão Realizada (Seleção)',
        shortLabel: 'Sessão Feita',
        color: '#8b5cf6', // violet-500
        darkColor: '#a78bfa', // violet-400
      },
      edicao: {
        label: 'Edição / Lightroom',
        shortLabel: 'Em Edição',
        color: '#f59e0b', // amber-500
        darkColor: '#fbbf24', // amber-400
      },
      entregue: {
        label: 'Entregue / Concluído',
        shortLabel: 'Entregues',
        color: '#10b981', // emerald-500
        darkColor: '#34d399', // emerald-400
      },
    };

    const counts: Record<SessionStage, number> = {
      agendado: 0,
      sessao_feita: 0,
      edicao: 0,
      entregue: 0,
    };

    sessions.forEach((s) => {
      if (counts[s.stage] !== undefined) {
        counts[s.stage]++;
      }
    });

    const total = sessions.length;

    return (Object.keys(stageConfig) as SessionStage[]).map((stage) => {
      const count = counts[stage];
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      return {
        stage,
        name: stageConfig[stage].label,
        shortLabel: stageConfig[stage].shortLabel,
        value: count,
        percentage,
        color: stageConfig[stage].color,
        darkColor: stageConfig[stage].darkColor,
      };
    });
  }, [sessions]);

  // Custom Tooltip for Bar Chart
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg shadow-xl text-xs space-y-2 min-w-[170px]">
          <div className="font-semibold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-1 flex justify-between items-center">
            <span>{data.label}</span>
            <span className="text-[10px] font-mono text-zinc-400 uppercase">Faturamento</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-zinc-600 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" />
              <span>Realizado:</span>
            </span>
            <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
              {formatCurrency(data.realizado)}
            </span>
          </div>
          {data.pendente > 0 && (
            <div className="flex items-center justify-between gap-3 text-zinc-600 dark:text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-zinc-400 dark:bg-zinc-600 inline-block" />
                <span>A Receber:</span>
              </span>
              <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
                {formatCurrency(data.pendente)}
              </span>
            </div>
          )}
          <div className="pt-1.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
            <span>Total Mês:</span>
            <span className="font-mono text-amber-600 dark:text-amber-400">
              {formatCurrency(data.total)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Donut Chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-lg shadow-xl text-xs space-y-1.5 min-w-[160px]">
          <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
              style={{ backgroundColor: theme === 'dark' ? data.darkColor : data.color }}
            />
            <span className="truncate">{data.name}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-zinc-600 dark:text-zinc-400 text-[11px] pt-1 border-t border-zinc-100 dark:border-zinc-800">
            <span>Quantidade:</span>
            <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
              {data.value} {data.value === 1 ? 'ensaio' : 'ensaios'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 text-zinc-600 dark:text-zinc-400 text-[11px]">
            <span>Proporção:</span>
            <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
              {data.percentage}%
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Modern Studio Executive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-zinc-200/80 dark:border-white/[0.07] transition-colors">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-display">
              {settings.studioName || 'Estúdio Fotográfico'}
            </h1>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              · {settings.photographerName || 'Fotógrafo Principal'}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Operação Ativa
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Painel executivo de produção: metas financeiras em tempo real, pipeline de revelação e fluxo de ensaios e casamentos.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyPix}
            title="Copiar Chave PIX cadastrada para recebimentos"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-[#121215] border border-zinc-300/80 dark:border-white/[0.08] rounded-xl hover:bg-zinc-50 dark:hover:bg-white/[0.06] transition-all shadow-2xs cursor-pointer"
          >
            {copiedPix ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">PIX Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>Chave PIX</span>
              </>
            )}
          </button>

          <button
            onClick={() => onOpenContractModal()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-[#121215] border border-zinc-300/80 dark:border-white/[0.08] rounded-xl hover:bg-zinc-50 dark:hover:bg-white/[0.06] transition-all shadow-2xs cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-zinc-400" />
            <span>Emitir Contrato</span>
          </button>

          <button
            onClick={() => setActiveTab('galleries')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-amber-500" />
            <span>Galerias Web (FluxoWeby)</span>
          </button>

          <button
            onClick={onOpenNewSessionModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Novo Ensaio</span>
          </button>
        </div>
      </div>

      {/* Modern High-End Bento KPI Deck */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Saldo Líquido Realizado */}
        <div className="p-5 bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-white/[0.08] rounded-2xl shadow-xs transition-all hover:border-zinc-300 dark:hover:border-white/[0.15] group">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span>Saldo Líquido Realizado</span>
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300 group-hover:scale-105 transition-transform">
              <Wallet className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100 tracking-tight font-display">
            {formatCurrency(netBalance)}
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              +{formatCurrency(paidIncome)}
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <span className="font-mono text-rose-500 dark:text-rose-400">
              -{formatCurrency(paidExpenses)}
            </span>
          </div>
        </div>

        {/* KPI 2: Valores a Receber */}
        <div className="p-5 bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-white/[0.08] rounded-2xl shadow-xs transition-all hover:border-zinc-300 dark:hover:border-white/[0.15] group">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span>Valores a Receber (Saldos)</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 tracking-tight font-display">
            {formatCurrency(pendingIncome)}
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            Saldos contratuais e parcelas pendentes
          </div>
        </div>

        {/* KPI 3: Fila de Revelação & Tratamento */}
        <div className="p-5 bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-white/[0.08] rounded-2xl shadow-xs transition-all hover:border-zinc-300 dark:hover:border-white/[0.15] group">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span>Fila de Revelação & Edição</span>
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4 text-sky-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100 font-display">
              {totalPhotosEdited}
            </span>
            <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
              / {totalPhotosToEdit} fotos tratadas
            </span>
          </div>

          {/* Micro Progress Bar */}
          <div className="mt-3 w-full bg-zinc-100 dark:bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <div className="mt-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
            <span>{editingSessions.length} sessões na bancada</span>
            <span className="font-mono text-amber-500 font-semibold">{progressPercentage}%</span>
          </div>
        </div>

        {/* KPI 4: Fotos Extras / Up-sell */}
        <div className="p-5 bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-white/[0.08] rounded-2xl shadow-xs transition-all hover:border-zinc-300 dark:hover:border-white/[0.15] group">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span>Fotos Extras / Up-sell Pix</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 dark:text-amber-400 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100 tracking-tight font-display">
            {formatCurrency(totalExtraRevenue)}
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <span className="font-semibold text-amber-600 dark:text-amber-400 font-mono">
              +{totalExtraPhotos} fotos vendidas
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <span>méd. R$ {settings.defaultExtraPhotoPrice}/un</span>
          </div>
        </div>
      </div>

      {/* SISTEMA DE METAS MENSAIS DE FATURAMENTO */}
      <div className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-white/[0.08] rounded-2xl p-6 shadow-xs transition-all relative overflow-hidden">
        {/* Glow decorativo de fundo */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header of Goal System */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-zinc-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-400/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 font-display">
                  Meta Mensal de Faturamento
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-medium bg-zinc-100 dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300">
                  {goalMonthMetrics.monthFullName}
                </span>
                {goalMonthMetrics.isGoalAchieved ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Trophy className="w-3 h-3" /> Meta Superada!
                  </span>
                ) : goalMonthMetrics.isProjectedAchieved ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <TrendingUp className="w-3 h-3" /> Quase lá (com previsões)
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Progresso em tempo real do faturamento acumulado sobre o valor alvo planejado
              </p>
            </div>
          </div>

          {/* Month selector & Adjust Goal button */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {monthlyRevenueData.length > 1 && (
              <select
                value={selectedGoalMonth}
                onChange={(e) => setSelectedGoalMonth(e.target.value)}
                className="px-3 py-1.5 text-xs font-mono bg-zinc-50 dark:bg-[#18181c] border border-zinc-200 dark:border-white/[0.08] rounded-xl text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
              >
                {monthlyRevenueData.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={handleOpenGoalModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/[0.1] border border-zinc-200 dark:border-white/[0.08] rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-500" />
              <span>Ajustar Meta ({formatCurrency(monthlyGoal)})</span>
            </button>
          </div>
        </div>

        {/* Goal Stats Deck */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-5">
          {/* Card 1: Faturamento Realizado (Já Recebido) */}
          <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-white/[0.03] border border-zinc-200/70 dark:border-white/[0.06]">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>Realizado (Pago)</span>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 tabular-nums font-display">
              {formatCurrency(goalMonthMetrics.realizado)}
            </div>
            <div className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {goalMonthMetrics.realPercent}%
              </span>{' '}
              da meta atingida
            </div>
          </div>

          {/* Card 2: Previsão a Receber */}
          <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-white/[0.03] border border-zinc-200/70 dark:border-white/[0.06]">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>A Receber no Mês</span>
              <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-600" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 tabular-nums font-display">
              {formatCurrency(goalMonthMetrics.pendente)}
            </div>
            <div className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              Saldos e parcelas contratuais
            </div>
          </div>

          {/* Card 3: Total Acumulado (Projetado) */}
          <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-white/[0.03] border border-zinc-200/70 dark:border-white/[0.06]">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>Total Acumulado</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 tabular-nums font-display">
              {formatCurrency(goalMonthMetrics.total)}
            </div>
            <div className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {goalMonthMetrics.projectedPercent}%
              </span>{' '}
              com previsões
            </div>
          </div>

          {/* Card 4: Restante para Meta */}
          <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-white/[0.03] border border-zinc-200/70 dark:border-white/[0.06]">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>Alvo da Meta</span>
              <span className="font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {formatCurrency(monthlyGoal)}
              </span>
            </div>
            <div className="mt-2 text-xl font-bold font-mono tabular-nums font-display">
              {goalMonthMetrics.isGoalAchieved ? (
                <span className="text-emerald-600 dark:text-emerald-400">
                  +{formatCurrency(goalMonthMetrics.realizado - monthlyGoal)}
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400">
                  {formatCurrency(goalMonthMetrics.remainingReal)}
                </span>
              )}
            </div>
            <div className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              {goalMonthMetrics.isGoalAchieved ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Saldo excedente alcançado!
                </span>
              ) : (
                <span>
                  Faltam para atingir o valor alvo
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Dual-Layer Visual Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-semibold">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" />
                <span>Realizado: {goalMonthMetrics.realPercent}%</span>
              </span>
              {goalMonthMetrics.pendente > 0 && (
                <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                  <span className="w-2.5 h-2.5 rounded-xs bg-amber-300 dark:bg-amber-600/70 inline-block" />
                  <span>Projetado: {goalMonthMetrics.projectedPercent}%</span>
                </span>
              )}
            </div>
            <span className="text-zinc-500 dark:text-zinc-400">
              Alvo: {formatCurrency(monthlyGoal)}
            </span>
          </div>

          {/* Dual Segment Progress Track */}
          <div className="relative w-full h-3.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-200 dark:border-zinc-700/80">
            {/* Projected bar (behind) */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-amber-300/80 dark:bg-amber-600/60 transition-all duration-700 rounded-full"
              style={{ width: `${Math.min(100, goalMonthMetrics.projectedPercent)}%` }}
            />
            {/* Realized bar (in front) */}
            <div
              className={`absolute left-0 top-0 bottom-0 transition-all duration-700 rounded-full ${
                goalMonthMetrics.isGoalAchieved
                  ? 'bg-emerald-500 dark:bg-emerald-400'
                  : 'bg-amber-500 dark:bg-amber-400'
              }`}
              style={{ width: `${Math.min(100, goalMonthMetrics.realPercent)}%` }}
            />
          </div>

          {/* Goal Milestones & Ticks */}
          <div className="flex justify-between items-center text-[10px] text-zinc-400 dark:text-zinc-500 font-mono px-0.5 pt-0.5">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
              <Target className="w-3 h-3 inline" /> 100% ({formatCurrency(monthlyGoal)})
            </span>
          </div>
        </div>

        {/* Studio Insight Run-Rate Pill */}
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            {goalMonthMetrics.isGoalAchieved ? (
              <span>
                Excelente trabalho! Você superou sua meta de faturamento em{' '}
                <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatCurrency(goalMonthMetrics.realizado - monthlyGoal)}
                </strong>
                .
              </span>
            ) : (
              <span>
                Faltam{' '}
                <strong className="text-zinc-900 dark:text-zinc-100 font-mono">
                  {formatCurrency(goalMonthMetrics.remainingReal)}
                </strong>{' '}
                (ou{' '}
                <span className="font-mono text-amber-600 dark:text-amber-400">
                  {formatCurrency(goalMonthMetrics.remainingProjected)}
                </span>{' '}
                considerando contratos e saldos a receber).
              </span>
            )}
          </div>

          <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
            {goalMonthMetrics.remainingReal > 0 && (
              <span>
                ~{Math.ceil(goalMonthMetrics.remainingReal / (sessions[0]?.packagePrice || 1500))}{' '}
                ensaios adicionais para atingir a meta
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Visual Analytics Deck: Recharts Bar Chart & Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Gráfico de Barras com o Faturamento Mensal */}
        <div className="lg:col-span-7 bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-white/[0.08] rounded-2xl p-6 shadow-xs transition-all flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-100 dark:border-white/[0.06]">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-500" />
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-display">
                    Faturamento Mensal
                  </h2>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Receita recebida e previsões nos últimos 6 meses (Linha tracejada: Meta atual)
                </p>
              </div>

              {/* Badges / Legend */}
              <div className="flex items-center gap-3 text-xs flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-zinc-600 dark:text-zinc-400 text-[11px]">Realizado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                  <span className="text-zinc-600 dark:text-zinc-400 text-[11px]">A Receber</span>
                </div>
                <button
                  onClick={() => setActiveTab('finance')}
                  className="text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  Financeiro <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Recharts Bar Chart Container */}
            <div className="mt-4 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyRevenueData}
                  margin={{ top: 16, right: 10, left: -10, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={theme === 'dark' ? '#27272a' : '#f4f4f5'}
                  />
                  <XAxis
                    dataKey="monthName"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 11,
                      fill: theme === 'dark' ? '#a1a1aa' : '#71717a',
                      fontFamily: 'monospace',
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) =>
                      val >= 1000 ? `R$ ${(val / 1000).toFixed(0)}k` : `R$ ${val}`
                    }
                    tick={{
                      fontSize: 10,
                      fill: theme === 'dark' ? '#71717a' : '#a1a1aa',
                      fontFamily: 'monospace',
                    }}
                  />
                  <RechartsTooltip
                    content={<CustomBarTooltip />}
                    cursor={{ fill: theme === 'dark' ? '#ffffff06' : '#f4f4f560' }}
                  />
                  {/* Reference line showing current monthly revenue goal */}
                  <ReferenceLine
                    y={monthlyGoal}
                    stroke={theme === 'dark' ? '#f59e0b' : '#d97706'}
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: `Meta: ${formatCurrency(monthlyGoal)}`,
                      fill: theme === 'dark' ? '#fbbf24' : '#b45309',
                      fontSize: 10,
                      position: 'top',
                      fontFamily: 'monospace',
                    }}
                  />
                  <Bar
                    dataKey="realizado"
                    name="Realizado"
                    fill={theme === 'dark' ? '#f59e0b' : '#d97706'}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={38}
                  />
                  <Bar
                    dataKey="pendente"
                    name="A Receber"
                    fill={theme === 'dark' ? '#3f3f46' : '#d4d4d8'}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={38}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Stats Footnote */}
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <span>Total faturado no período:</span>
              <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                {formatCurrency(totalPeriodRealizado)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span>Média mensal:</span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                {formatCurrency(averageMonthlyRevenue)}/mês
              </span>
            </div>
          </div>
        </div>

        {/* Right 5 cols: Gráfico de Rosca com Distribuição dos Estágios dos Ensaios */}
        <div className="lg:col-span-5 bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-white/[0.08] rounded-2xl p-6 shadow-xs transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-white/[0.06]">
              <div>
                <div className="flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-amber-500" />
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-display">
                    Estágios dos Ensaios
                  </h2>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Distribuição da carteira atual de sessões
                </p>
              </div>

              <button
                onClick={() => setActiveTab('sessions')}
                className="text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 cursor-pointer transition-colors"
              >
                Kanban <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Donut Chart with Centered Total */}
            <div className="relative w-full h-48 flex items-center justify-center mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stageDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={82}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stageDistributionData.map((entry) => (
                      <Cell
                        key={`stage-cell-${entry.stage}`}
                        fill={theme === 'dark' ? entry.darkColor : entry.color}
                        stroke={theme === 'dark' ? '#121215' : '#ffffff'}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Centered Total Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold font-mono text-zinc-900 dark:text-zinc-100 leading-none font-display">
                  {sessions.length}
                </span>
                <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mt-1">
                  {sessions.length === 1 ? 'Ensaio' : 'Ensaios'}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Legend Grid */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-zinc-100 dark:border-white/[0.06]">
            {stageDistributionData.map((item) => (
              <div
                key={item.stage}
                onClick={() => setActiveTab('sessions')}
                className="p-2.5 rounded-xl bg-zinc-50/80 dark:bg-white/[0.03] border border-zinc-200/60 dark:border-white/[0.06] flex items-center justify-between cursor-pointer hover:border-amber-500/40 hover:bg-zinc-100/80 dark:hover:bg-white/[0.06] transition-all"
                title={`Ver ensaios em ${item.name}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: theme === 'dark' ? item.darkColor : item.color }}
                  />
                  <span className="text-xs text-zinc-700 dark:text-zinc-300 truncate">
                    {item.shortLabel}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-1">
                  <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {item.value}
                  </span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                    ({item.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Golden Hour & Next Scheduled Session Spotlight */}
      {nextSession && (
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/15 dark:via-[#121215] dark:to-[#121215] border border-amber-500/30 dark:border-amber-500/20 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-amber-500/20 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 shadow-inner">
              <SunMedium className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="font-mono uppercase font-semibold text-amber-600 dark:text-amber-400 tracking-wider text-[10px]">
                  Próxima Sessão Agendada
                </span>
                <span className="text-zinc-300 dark:text-zinc-700">·</span>
                <span className="text-zinc-600 dark:text-zinc-400 font-mono">
                  {nextSession.sessionDate} às {nextSession.sessionTime}
                </span>
                <span className="text-zinc-300 dark:text-zinc-700">·</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                  <Aperture className="w-3.5 h-3.5" />
                  Golden Hour Sugerida: 17:15 - 18:05
                </span>
              </div>
              <h2
                onClick={() => onEditSession(nextSession)}
                className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 hover:text-amber-500 dark:hover:text-amber-400 transition-colors cursor-pointer mt-1 font-display"
              >
                {nextSession.title}
              </h2>
              <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400 mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                  {nextSession.location}
                </span>
                <span className="text-zinc-300 dark:text-zinc-700">·</span>
                <span>Pacote: {formatCurrency(nextSession.packagePrice)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto justify-end">
            <button
              onClick={() => onOpenContractModal(nextSession.id)}
              className="px-3.5 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-[#18181c] border border-zinc-200 dark:border-white/[0.08] rounded-xl hover:bg-zinc-50 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              Contrato
            </button>
            <button
              onClick={() => onEditSession(nextSession)}
              className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              Abrir Ficha do Ensaio
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Agenda & Shoot Day Checklist + Editing Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Próximas Sessões Agendadas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 font-display">
              <Calendar className="w-4 h-4 text-amber-500" />
              Ensaios & Produções Agendadas
            </h2>
            <button
              onClick={() => setActiveTab('sessions')}
              className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              Abrir Kanban Completo <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {sessions
              .filter((s) => s.stage === 'agendado' || s.stage === 'sessao_feita')
              .map((session) => {
                const checkedGear = session.gearChecklist.filter((g) => g.completed).length;

                return (
                  <div
                    key={session.id}
                    className="p-5 bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-white/[0.08] rounded-2xl hover:border-zinc-300 dark:hover:border-white/[0.15] transition-all shadow-2xs group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-[10px] font-mono uppercase font-semibold text-amber-600 dark:text-amber-400 tracking-wider">
                            {categoryLabels[session.category]}
                          </span>
                          <span className="text-zinc-300 dark:text-zinc-700">·</span>
                          <span className="text-zinc-500 dark:text-zinc-400 font-mono">
                            {session.sessionDate} às {session.sessionTime}
                          </span>
                        </div>
                        <h3
                          onClick={() => onEditSession(session)}
                          className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 hover:text-amber-500 dark:hover:text-amber-400 transition-colors cursor-pointer mt-1 font-display"
                        >
                          {session.title}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span>{session.location}</span>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                          {formatCurrency(session.packagePrice)}
                        </span>
                        <div className="text-[11px] mt-0.5">
                          {session.depositPaid ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Sinal Confirmado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Sinal Pendente
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Metadata & Fast Actions */}
                    <div className="mt-3.5 pt-3.5 border-t border-zinc-100 dark:border-white/[0.06] flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                      <div className="flex items-center gap-2 text-[11px]">
                        <Camera className="w-3.5 h-3.5 text-zinc-400" />
                        <span>
                          Checklist de Mala: <strong className="font-mono text-zinc-800 dark:text-zinc-200">{checkedGear}</strong>/{session.gearChecklist.length} itens
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onOpenContractModal(session.id)}
                          className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline text-xs cursor-pointer"
                        >
                          Contrato
                        </button>
                        <span className="text-zinc-300 dark:text-zinc-700">·</span>
                        <button
                          onClick={() => onEditSession(session)}
                          className="text-amber-600 dark:text-amber-400 font-semibold hover:underline text-xs cursor-pointer"
                        >
                          Gerenciar Ensaio
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Right 1 Col: Quick Editing Focus & Gear Availability */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 font-display">
              <Clock className="w-4 h-4 text-amber-500" />
              Sessão de Edição & Foco
            </h2>
            <button
              onClick={() => setActiveTab('timetracker')}
              className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              Apontamentos <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Timer Box */}
          <div className="p-5 bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-white/[0.08] rounded-2xl space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Tempo de Foco (Hoje)</span>
              <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                {formatDuration(activeTimer.seconds)}
              </span>
            </div>

            {!activeTimer.running ? (
              <button
                onClick={() =>
                  startTimer(editingSessions[0]?.id, 'editing', 'Edição no Lightroom')
                }
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-zinc-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Iniciar Revelação / Lightroom</span>
              </button>
            ) : (
              <div className="p-3 bg-amber-500/10 dark:bg-amber-400/15 border border-amber-500/20 rounded-xl text-center text-xs text-amber-700 dark:text-amber-300 font-medium">
                Cronometrando: {activeTimer.description || 'Edição no Lightroom'}
              </div>
            )}

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Monitore o tempo de revelação e retoque fino no Photoshop para calcular seu custo real por foto tratada.
            </p>
          </div>

          {/* Equipment Status Mini-Deck */}
          <div className="p-5 bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-white/[0.08] rounded-2xl space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-display">
                Equipamentos em Prontidão
              </h3>
              <button
                onClick={() => setActiveTab('gear')}
                className="text-xs text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                Ver todos ({gear.length})
              </button>
            </div>

            <div className="space-y-2">
              {gear.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-xs py-2 border-b border-zinc-100 dark:border-white/[0.04] last:border-0"
                >
                  <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate pr-2">
                    {item.name}
                  </span>
                  <span
                    className={`text-[11px] font-mono shrink-0 font-medium flex items-center gap-1.5 ${
                      item.status === 'available'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : item.status === 'in_use'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-rose-500 dark:text-rose-400'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.status === 'available'
                          ? 'bg-emerald-500'
                          : item.status === 'in_use'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                    />
                    {item.status === 'available'
                      ? 'Disponível'
                      : item.status === 'in_use'
                      ? 'Em Campo'
                      : 'Manutenção'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE DEFINIÇÃO DE META DE FATURAMENTO */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-white/[0.08] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-400/20 text-amber-600 dark:text-amber-400">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-display">
                    Definir Meta de Faturamento Mensal
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Estabeleça seu objetivo financeiro para guiar a prospecção e precificação
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsGoalModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Input & Slider */}
            <div className="space-y-3">
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Valor Alvo Desejado (R$)
              </label>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-mono font-semibold text-zinc-400">
                  R$
                </span>
                <input
                  type="number"
                  step="500"
                  min="500"
                  max="100000"
                  value={goalInput}
                  onChange={(e) => setGoalInput(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full pl-11 pr-4 py-2.5 text-lg font-mono font-bold bg-zinc-50 dark:bg-[#18181c] border border-zinc-200 dark:border-white/[0.08] rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              {/* Slider for smooth visual adjustment */}
              <input
                type="range"
                min="2000"
                max="30000"
                step="500"
                value={Math.min(30000, Math.max(2000, goalInput))}
                onChange={(e) => setGoalInput(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                <span>R$ 2.000</span>
                <span>R$ 15.000</span>
                <span>R$ 30.000+</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Valores Frequentes para Estúdios:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[5000, 8000, 10000, 12000, 15000, 20000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setGoalInput(preset)}
                    className={`py-2 px-2 text-xs font-mono rounded-xl border text-center transition-all cursor-pointer ${
                      goalInput === preset
                        ? 'bg-amber-500 text-zinc-950 font-bold border-amber-500 shadow-sm'
                        : 'bg-zinc-50 dark:bg-[#18181c] border-zinc-200 dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.06]'
                    }`}
                  >
                    {formatCurrency(preset)}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulation Footnote */}
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/60 dark:border-white/[0.06] text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
              <div className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Estimativa de Produção:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Para alcançar <strong className="font-mono text-zinc-900 dark:text-zinc-100">{formatCurrency(goalInput)}</strong>, com um ticket médio de R$ 1.500 por sessão, você precisará de aproximadamente{' '}
                <strong className="font-mono text-amber-600 dark:text-amber-400">{Math.ceil(goalInput / 1500)} ensaios</strong> no mês.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-white/[0.06]">
              <button
                type="button"
                onClick={() => setIsGoalModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.06] rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleSaveGoal()}
                className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Salvar Nova Meta</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
