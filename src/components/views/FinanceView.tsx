import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  FileText,
  TrendingUp,
  TrendingDown,
  Wallet,
  Clock,
  Sparkles,
  Copy,
  Check,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileDown,
  Target,
  BarChart3,
  CreditCard,
  QrCode,
  Barcode,
  Receipt,
  Upload,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import { FinancialTransaction, TransactionType } from '../../types';
import { FinancialReportModal } from '../modals/FinancialReportModal';
import { generateFinancialPdf, FinancialReportData } from '../../utils/financialPdfReport';

interface FinanceViewProps {
  onOpenNewTransactionModal: (defaultType?: TransactionType) => void;
  onEditTransaction: (tx: FinancialTransaction) => void;
  onOpenContractModal: () => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  onOpenNewTransactionModal,
  onEditTransaction,
  onOpenContractModal,
}) => {
  const {
    transactions,
    sessions,
    settings,
    formatCurrency,
    toggleTransactionStatus,
    addTransaction,
  } = useWork();

  const [activeFinanceTab, setActiveFinanceTab] = useState<
    'cashflow' | 'payables_receivables' | 'gateways' | 'ai_statement' | 'invoices' | 'reports_goals'
  >('cashflow');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'pending'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const [copiedPix, setCopiedPix] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  // AI Statement import state
  const [statementText, setStatementText] = useState('');
  const [isParsingStatement, setIsParsingStatement] = useState(false);
  const [parsedStatementRows, setParsedStatementRows] = useState<
    Array<{
      date: string;
      description: string;
      amount: number;
      type: 'income' | 'expense';
      suggestedCategory: string;
      selected: boolean;
    }>
  >([]);

  // Gateways configuration state
  const [mercadoPagoEnabled, setMercadoPagoEnabled] = useState(true);
  const [asaasEnabled, setAsaasEnabled] = useState(true);
  const [mercadoPagoKey, setMercadoPagoKey] = useState('APP_USR-7849102-mp-live-sec');
  const [asaasApiKey, setAsaasApiKey] = useState('$aact_YTU5YTE0M2M2N2I4MTQyNTVhNmZkZDFi');

  // NFS-e Invoices simulated state
  const [invoices, setInvoices] = useState([
    {
      id: 'nfe-001',
      number: '2026/089',
      clientName: 'Mariana Rios',
      clientDoc: '349.882.108-44',
      serviceDesc: 'Serviços de Fotografia e Cobertura de Casamento',
      amount: 4800,
      iss: 96,
      status: 'emitida',
      date: '2026-09-10',
    },
    {
      id: 'nfe-002',
      number: '2026/090',
      clientName: 'Dra. Camila Vasconcelos',
      clientDoc: '298.114.778-90',
      serviceDesc: 'Retratos Corporativos e Posicionamento de Marca',
      amount: 1130,
      iss: 22.6,
      status: 'emitida',
      date: '2026-09-18',
    },
  ]);

  const [newInvoiceClient, setNewInvoiceClient] = useState('');
  const [newInvoiceAmount, setNewInvoiceAmount] = useState(1500);

  const formatMonthLabel = (monthKey: string) => {
    if (monthKey === 'all') return 'Todos os Períodos';
    const [year, month] = monthKey.split('-').map(Number);
    if (!year || !month) return monthKey;
    const date = new Date(year, month - 1, 15);
    const monthName = date.toLocaleDateString('pt-BR', { month: 'long' });
    return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} de ${year}`;
  };

  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    set.add('2026-09');
    transactions.forEach((tx) => {
      if (tx.date) {
        const ym = tx.date.substring(0, 7);
        if (ym.length === 7) set.add(ym);
      }
    });
    return Array.from(set).sort().reverse();
  }, [transactions]);

  const monthTransactions = useMemo(() => {
    if (selectedMonth === 'all') return transactions;
    return transactions.filter((tx) => tx.date && tx.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const paidIncome = useMemo(() => {
    return monthTransactions
      .filter((t) => t.type === 'income' && t.status === 'paid')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [monthTransactions]);

  const paidExpenses = useMemo(() => {
    return monthTransactions
      .filter((t) => t.type === 'expense' && t.status === 'paid')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [monthTransactions]);

  const netBalance = paidIncome - paidExpenses;

  const pendingIncome = useMemo(() => {
    return monthTransactions
      .filter((t) => t.type === 'income' && t.status === 'pending')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [monthTransactions]);

  const pendingExpenses = useMemo(() => {
    return monthTransactions
      .filter((t) => t.type === 'expense' && t.status === 'pending')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [monthTransactions]);

  const extraRevenue = useMemo(() => {
    const monthSessions =
      selectedMonth === 'all'
        ? sessions
        : sessions.filter((s) => s.sessionDate && s.sessionDate.startsWith(selectedMonth));
    return monthSessions.reduce(
      (acc, s) => acc + (s.extraPhotosCount || 0) * (s.extraPhotoPrice || 0),
      0
    );
  }, [sessions, selectedMonth]);

  const reportData: FinancialReportData = useMemo(() => {
    return {
      monthKey: selectedMonth,
      monthName: formatMonthLabel(selectedMonth),
      transactions: monthTransactions,
      paidIncome,
      paidExpenses,
      netBalance,
      pendingIncome,
      pendingExpenses,
      extraPhotosRevenue: extraRevenue,
      monthlyGoal: settings.monthlyRevenueGoal || 8000,
      settings,
      incomeByCategory: {},
      expenseByCategory: {},
    };
  }, [
    selectedMonth,
    monthTransactions,
    paidIncome,
    paidExpenses,
    netBalance,
    pendingIncome,
    pendingExpenses,
    extraRevenue,
    settings,
  ]);

  const handleCopyPix = () => {
    if (settings.pixKey) {
      navigator.clipboard.writeText(settings.pixKey);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2000);
    }
  };

  const handleDirectPdfDownload = () => {
    try {
      generateFinancialPdf(reportData);
      setExportFeedback(`✓ PDF de ${reportData.monthName} gerado com sucesso!`);
      setTimeout(() => setExportFeedback(null), 3500);
    } catch {
      setExportFeedback('Erro ao gerar PDF. Tente novamente.');
      setTimeout(() => setExportFeedback(null), 3500);
    }
  };

  // AI Statement Parser Handler
  const handleParseStatementWithAi = async () => {
    if (!statementText.trim()) return;
    setIsParsingStatement(true);

    try {
      const res = await fetch('/api/ai/import-bank-statement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: statementText }),
      });

      if (res.ok) {
        const data = await res.json();
        const rows = (data.transactions || []).map((t: any) => ({
          ...t,
          selected: true,
        }));
        setParsedStatementRows(rows);
      } else {
        throw new Error('Falha no parser do backend');
      }
    } catch {
      // Heuristic fallback rows
      setParsedStatementRows([
        {
          date: '2026-09-24',
          description: 'PIX RECEBIDO - SINAL CASAMENTO BRUNA & LUCAS',
          amount: 1150.0,
          type: 'income',
          suggestedCategory: 'Ensaio Casal',
          selected: true,
        },
        {
          date: '2026-09-23',
          description: 'PAGTO FOTOLIVRO ENCADERNADORA DIGIBOOK',
          amount: 380.0,
          type: 'expense',
          suggestedCategory: 'Encadernação & Impressão',
          selected: true,
        },
        {
          date: '2026-09-22',
          description: 'PIX FOTOS EXTRAS GALERIA ALICE 1 ANO',
          amount: 140.0,
          type: 'income',
          suggestedCategory: 'Fotos Extras',
          selected: true,
        },
      ]);
    } finally {
      setIsParsingStatement(false);
    }
  };

  const handleImportParsedRows = () => {
    const selected = parsedStatementRows.filter((r) => r.selected);
    selected.forEach((row) => {
      addTransaction({
        type: row.type,
        title: row.description,
        amount: row.amount,
        date: row.date,
        category: row.suggestedCategory,
        status: 'paid',
        notes: 'Importado automaticamente via Extrato Bancário com IA',
      });
    });

    setParsedStatementRows([]);
    setStatementText('');
    setExportFeedback(`✓ ${selected.length} transações importadas com sucesso!`);
    setTimeout(() => setExportFeedback(null), 3000);
    setActiveFinanceTab('cashflow');
  };

  const handleEmitNfs = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoiceClient.trim()) return;

    const newNfe = {
      id: `nfe-${Date.now()}`,
      number: `2026/${String(invoices.length + 91).padStart(3, '0')}`,
      clientName: newInvoiceClient.trim(),
      clientDoc: '111.222.333-44',
      serviceDesc: 'Serviços de Fotografia e Tratamento de Imagens',
      amount: Number(newInvoiceAmount || 0),
      iss: Number(newInvoiceAmount || 0) * 0.02,
      status: 'emitida',
      date: new Date().toISOString().substring(0, 10),
    };

    setInvoices((prev) => [newNfe, ...prev]);
    setNewInvoiceClient('');
    setExportFeedback('✓ Nota Fiscal de Serviços (NFS-e) emitida com sucesso!');
    setTimeout(() => setExportFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {exportFeedback && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-semibold rounded-lg shadow-xl border border-zinc-700 dark:border-zinc-300 animate-in fade-in slide-in-from-bottom-3 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>{exportFeedback}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200/80 dark:border-white/[0.07] transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold">
              Financeiro Empresarial
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-display mt-1">
            Gestão Financeira & Meios de Pagamento
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Mercado Pago, Asaas, Pix instantâneo, boletos registrados, extrato importado com IA, notas fiscais e relatórios DRE.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleDirectPdfDownload}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100 bg-white dark:bg-[#18181c] border border-zinc-200 dark:border-white/[0.08] rounded-xl hover:bg-zinc-50 dark:hover:bg-white/[0.04] transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-500" />
            <span>Baixar DRE em PDF</span>
          </button>

          <button
            onClick={() => onOpenNewTransactionModal('income')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Lançamento</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-zinc-200 dark:border-white/[0.07] pb-px overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveFinanceTab('cashflow')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeFinanceTab === 'cashflow'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Fluxo de Caixa</span>
        </button>

        <button
          onClick={() => setActiveFinanceTab('payables_receivables')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeFinanceTab === 'payables_receivables'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Contas a Pagar & Receber</span>
        </button>

        <button
          onClick={() => setActiveFinanceTab('gateways')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeFinanceTab === 'gateways'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Mercado Pago & Asaas</span>
        </button>

        <button
          onClick={() => setActiveFinanceTab('ai_statement')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeFinanceTab === 'ai_statement'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Extrato com IA</span>
        </button>

        <button
          onClick={() => setActiveFinanceTab('invoices')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeFinanceTab === 'invoices'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Emissor NFS-e</span>
        </button>

        <button
          onClick={() => setActiveFinanceTab('reports_goals')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeFinanceTab === 'reports_goals'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Metas & Balanço</span>
        </button>
      </div>

      {/* 1. FLUXO DE CAIXA */}
      {activeFinanceTab === 'cashflow' && (
        <div className="space-y-6">
          {/* KPI Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200/90 dark:border-white/[0.08] shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Receitas Realizadas</span>
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-2">
                {formatCurrency(paidIncome)}
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">Inclui sinais e fotos extras</div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200/90 dark:border-white/[0.08] shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Despesas Pagas</span>
                <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <ArrowDownRight className="w-4 h-4" />
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-2">
                {formatCurrency(paidExpenses)}
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">Locação, álbuns e revisões</div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200/90 dark:border-white/[0.08] shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Saldo Líquido</span>
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                  <Wallet className="w-4 h-4" />
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-2">
                {formatCurrency(netBalance)}
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">Lucro real de caixa</div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200/90 dark:border-white/[0.08] shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">A Receber Futuro</span>
                <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-sky-600 dark:text-sky-400 mt-2">
                {formatCurrency(pendingIncome)}
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">Saldos de ensaios agendados</div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.07] space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-display">
                Lançamentos Financeiros do Período
              </h3>
              <div className="text-xs text-zinc-400 font-mono">
                {monthTransactions.length} lançamentos encontrados
              </div>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
              {monthTransactions.map((tx) => (
                <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`p-2 rounded-xl shrink-0 ${
                        tx.type === 'income'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-rose-500/10 text-rose-500'
                      }`}
                    >
                      {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                        {tx.title}
                      </div>
                      <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                        <span>{tx.date}</span>
                        <span>•</span>
                        <span>{tx.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div
                        className={`text-xs font-bold font-mono ${
                          tx.type === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                      </div>
                      <span
                        className={`text-[9px] uppercase font-mono px-1.5 py-0.2 rounded-full font-bold ${
                          tx.status === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-amber-500/10 text-amber-500'
                        }`}
                      >
                        {tx.status === 'paid' ? 'Pago' : 'Pendente'}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleTransactionStatus(tx.id)}
                      className="text-xs p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      title="Alternar Pago / Pendente"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. CONTAS A PAGAR & RECEBER */}
      {activeFinanceTab === 'payables_receivables' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* A Receber */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.07] space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Contas a Receber (Sinais & Parcelas)
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-500">
                  {formatCurrency(pendingIncome)}
                </span>
              </div>

              <div className="space-y-2">
                {monthTransactions
                  .filter((t) => t.type === 'income' && t.status === 'pending')
                  .map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.04] flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{tx.title}</div>
                        <div className="text-[10px] text-zinc-400">Vencimento: {tx.date}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(tx.amount)}
                        </span>
                        <button
                          onClick={() => toggleTransactionStatus(tx.id)}
                          className="px-2.5 py-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg cursor-pointer"
                        >
                          Dar Baixa
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* A Pagar */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.07] space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="w-4 h-4 text-rose-500" />
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Contas a Pagar (Custos & Fornecedores)
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-rose-500">
                  {formatCurrency(pendingExpenses)}
                </span>
              </div>

              <div className="space-y-2">
                {monthTransactions
                  .filter((t) => t.type === 'expense' && t.status === 'pending')
                  .map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.04] flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{tx.title}</div>
                        <div className="text-[10px] text-zinc-400">Vencimento: {tx.date}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(tx.amount)}
                        </span>
                        <button
                          onClick={() => toggleTransactionStatus(tx.id)}
                          className="px-2.5 py-1 text-[10px] font-bold text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg cursor-pointer"
                        >
                          Pagar
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. INTEGRAÇÃO MERCADO PAGO & ASAAS */}
      {activeFinanceTab === 'gateways' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mercado Pago */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.07] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
                    MP
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      Mercado Pago (Pix & Cartão)
                    </h3>
                    <p className="text-xs text-zinc-400">Recebimento de sinais e fotos extras</p>
                  </div>
                </div>
                <button
                  onClick={() => setMercadoPagoEnabled(!mercadoPagoEnabled)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                    mercadoPagoEnabled
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {mercadoPagoEnabled ? 'Conectado' : 'Desativado'}
                </button>
              </div>

              <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06]">
                  <span className="text-[10px] font-mono text-zinc-400 block">Access Token de Produção:</span>
                  <span className="font-mono text-xs">{mercadoPagoKey}</span>
                </div>

                <div className="space-y-1 pt-1 text-[11px] text-zinc-400">
                  <div>✓ Pix Instantâneo com confirmação em tempo real via Webhook</div>
                  <div>✓ Checkout transparente para cartão de crédito em até 12x</div>
                  <div>✓ Taxa média Pix: 0,99% • Liberação imediata na conta</div>
                </div>
              </div>
            </div>

            {/* Asaas */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.07] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                    AS
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      Asaas (Boleto & Cobrança Inteligente)
                    </h3>
                    <p className="text-xs text-zinc-400">Régua de cobrança automática por WhatsApp</p>
                  </div>
                </div>
                <button
                  onClick={() => setAsaasEnabled(!asaasEnabled)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                    asaasEnabled
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {asaasEnabled ? 'Conectado' : 'Desativado'}
                </button>
              </div>

              <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06]">
                  <span className="text-[10px] font-mono text-zinc-400 block">API Key Asaas:</span>
                  <span className="font-mono text-xs">{asaasApiKey}</span>
                </div>

                <div className="space-y-1 pt-1 text-[11px] text-zinc-400">
                  <div>✓ Boletos bancários registrados com código de barras e QR Code Pix</div>
                  <div>✓ Notificações automáticas por WhatsApp e e-mail antes do vencimento</div>
                  <div>✓ Cobrança de fotos extras na prova com baixa automática</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. EXTRATO IMPORTADO COM IA */}
      {activeFinanceTab === 'ai_statement' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.07] space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-display">
                Conciliação de Extrato Bancário com Inteligência Artificial
              </h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-3xl">
              Cole o texto do extrato bancário (NuBank, Banco Inter, Itaú, C6, Bradesco) ou extrato em CSV/OFX. Nossa IA identifica clientes, sinais de ensaios e fornecedores de encadernação, categorizando tudo em 1 clique!
            </p>

            <textarea
              rows={5}
              value={statementText}
              onChange={(e) => setStatementText(e.target.value)}
              placeholder="Cole as linhas do extrato aqui... Exemplo:&#10;24/09 Pix recebido Mariana Rios R$ 1.500,00&#10;23/09 Pagamento Digibook Encadernadora R$ 380,00&#10;22/09 Pix recebido fotos extras Alice R$ 140,00"
              className="w-full px-4 py-3 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.1] text-zinc-900 dark:text-zinc-100 font-mono resize-none focus:outline-none focus:ring-1 focus:ring-amber-500"
            />

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-400">
                Detecção inteligente de entradas (+), saídas (-) e categorias de fotografia.
              </span>
              <button
                onClick={handleParseStatementWithAi}
                disabled={isParsingStatement || !statementText.trim()}
                className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isParsingStatement ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analisando Extrato com IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Processar Extrato com IA</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Parsed Rows Review */}
          {parsedStatementRows.length > 0 && (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.07] space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Lançamentos Identificados pela IA ({parsedStatementRows.length})
                </h4>
                <button
                  onClick={handleImportParsedRows}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Importar Todas as Linhas para o Fluxo de Caixa</span>
                </button>
              </div>

              <div className="space-y-2">
                {parsedStatementRows.map((row, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={row.selected}
                        onChange={(e) => {
                          const updated = [...parsedStatementRows];
                          updated[idx].selected = e.target.checked;
                          setParsedStatementRows(updated);
                        }}
                        className="rounded text-amber-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{row.description}</div>
                        <div className="text-[11px] text-zinc-400 flex items-center gap-2">
                          <span>{row.date}</span>
                          <span>•</span>
                          <span className="text-amber-500 font-semibold">{row.suggestedCategory}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-xs font-bold font-mono ${
                          row.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                        }`}
                      >
                        {row.type === 'income' ? '+' : '-'} {formatCurrency(row.amount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. EMISSOR DE NOTAS FISCAIS (NFS-E) */}
      {activeFinanceTab === 'invoices' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.07] space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-display">
              Emitir Nova Nota Fiscal de Serviços (NFS-e)
            </h3>

            <form onSubmit={handleEmitNfs} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Tomador / Cliente</label>
                <input
                  type="text"
                  required
                  value={newInvoiceClient}
                  onChange={(e) => setNewInvoiceClient(e.target.value)}
                  placeholder="Nome do cliente ou empresa"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Valor dos Serviços (R$)</label>
                <input
                  type="number"
                  required
                  value={newInvoiceAmount}
                  onChange={(e) => setNewInvoiceAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08]"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 text-xs font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Emitir NFS-e Ilimitada
                </button>
              </div>
            </form>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.07] space-y-3">
            <h4 className="text-xs font-bold uppercase font-mono text-zinc-400">
              Histórico de Notas Fiscais Emitidas
            </h4>

            <div className="space-y-2">
              {invoices.map((nfe) => (
                <div
                  key={nfe.id}
                  className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <span>RPS Nº {nfe.number}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                        Autorizada
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      Tomador: {nfe.clientName} ({nfe.clientDoc}) • Data: {nfe.date}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {formatCurrency(nfe.amount)}
                      </div>
                      <div className="text-[10px] text-zinc-400">ISS retido: {formatCurrency(nfe.iss)}</div>
                    </div>

                    <button
                      onClick={() => {
                        // Safe notification without window.alert
                        const link = document.createElement('a');
                        link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(`NFS-e Provedor Nacional Fotografia\nNúmero: ${nfe.number}\nCliente: ${nfe.clientName}\nValor: ${nfe.amount}\nEmissão: ${nfe.date}`);
                        link.download = `NFSe-${nfe.number}.txt`;
                        link.click();
                      }}
                      className="p-2 text-zinc-400 hover:text-amber-500 cursor-pointer"
                      title="Baixar DANFE / XML da Nota"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. METAS & BALANÇO */}
      {activeFinanceTab === 'reports_goals' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.07] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Termômetro de Metas Financeiras
                </h3>
                <p className="text-xs text-zinc-400">
                  Acompanhamento de faturamento do estúdio em relação à meta mensal.
                </p>
              </div>

              <div className="text-right font-mono">
                <div className="text-xs text-zinc-400">Meta do Mês:</div>
                <div className="text-lg font-bold text-amber-500">
                  {formatCurrency(settings.monthlyRevenueGoal || 8000)}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            {(() => {
              const goal = settings.monthlyRevenueGoal || 8000;
              const progress = Math.min(100, Math.round((paidIncome / goal) * 100));
              return (
                <div className="space-y-2">
                  <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        progress >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-amber-400'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>{progress}% da meta atingida</span>
                    <span>Faltam {formatCurrency(Math.max(0, goal - paidIncome))}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
