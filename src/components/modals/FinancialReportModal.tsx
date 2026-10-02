import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  Wallet,
  Clock,
  Sparkles,
  Target,
  CheckCircle2,
  Calendar,
  Building2,
  Phone,
  Mail,
  QrCode,
  Layers,
} from 'lucide-react';
import { FinancialReportData, generateFinancialPdf } from '../../utils/financialPdfReport';

interface FinancialReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: FinancialReportData;
}

export const FinancialReportModal: React.FC<FinancialReportModalProps> = ({
  isOpen,
  onClose,
  reportData,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPdf = () => {
    setIsExporting(true);
    try {
      generateFinancialPdf(reportData);
    } finally {
      setTimeout(() => setIsExporting(false), 800);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatBRL = (amount: number) => {
    return `R$ ${amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const marginPct =
    reportData.paidIncome > 0
      ? Math.round((reportData.netBalance / reportData.paidIncome) * 100)
      : 0;

  const goalPct =
    reportData.monthlyGoal > 0
      ? Math.round((reportData.paidIncome / reportData.monthlyGoal) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-zinc-100 dark:bg-zinc-950 rounded-2xl border border-zinc-300 dark:border-zinc-800 shadow-2xl max-w-4xl w-full max-h-[96vh] flex flex-col overflow-hidden text-zinc-900 dark:text-zinc-100 transition-colors my-auto">
        {/* Top Control Bar (Hidden on print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 no-print">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Relatório Financeiro Consolidado · {reportData.monthName}
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Resumo de faturamento, custos operacionais e DRE simplificado do estúdio.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors cursor-pointer"
              title="Imprimir documento ou salvar via diálogo do navegador"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white rounded-md transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="Gerar e baixar o arquivo PDF formatado"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Gerando PDF...' : 'Baixar PDF (.pdf)'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet (A4 Styling) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-zinc-200/50 dark:bg-zinc-950/80">
          <div className="max-w-[780px] mx-auto bg-white text-zinc-900 shadow-xl rounded-xl p-6 sm:p-10 border border-zinc-200 font-sans print:shadow-none print:border-none print:p-0">
            {/* Header: Studio & Report Info */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-zinc-900">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-amber-600 block mb-1">
                  Relatório Financeiro Mensal Consolidado
                </span>
                <h1 className="text-2xl font-black text-zinc-950 tracking-tight">
                  {reportData.settings.studioName || 'LUMINA STUDIO DE FOTOGRAFIA'}
                </h1>
                <p className="text-xs text-zinc-600 mt-1 font-medium">
                  {reportData.settings.photographerName} · Fotografia Profissional & Audiovisual
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-zinc-400" />
                    {reportData.settings.email || 'contato@luminastudio.com'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-zinc-400" />
                    {reportData.settings.phone || '(11) 98765-4321'}
                  </span>
                  {reportData.settings.pixKey && (
                    <span className="flex items-center gap-1">
                      <QrCode className="w-3 h-3 text-zinc-400" />
                      PIX: {reportData.settings.pixKey}
                    </span>
                  )}
                </div>
              </div>

              <div className="sm:text-right shrink-0">
                <div className="inline-block bg-zinc-100 px-3 py-1.5 rounded-lg border border-zinc-200 sm:text-right">
                  <div className="text-[10px] font-mono uppercase text-zinc-500 font-bold">
                    Período Contábil
                  </div>
                  <div className="text-sm font-black text-zinc-900">
                    {reportData.monthName}
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">
                    Emissão: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>

            {/* KPI Cards Summary Deck */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-800 tracking-wider block">
                  Entradas Recebidas
                </span>
                <span className="text-lg font-bold font-mono text-emerald-700 block mt-1">
                  +{formatBRL(reportData.paidIncome)}
                </span>
                <span className="text-[10px] text-emerald-700/80 mt-1 block">
                  {formatBRL(reportData.extraPhotosRevenue)} em fotos extras
                </span>
              </div>

              <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-lg">
                <span className="text-[10px] font-mono font-bold uppercase text-rose-800 tracking-wider block">
                  Despesas Pagas
                </span>
                <span className="text-lg font-bold font-mono text-rose-700 block mt-1">
                  -{formatBRL(reportData.paidExpenses)}
                </span>
                <span className="text-[10px] text-rose-700/80 mt-1 block">
                  Encadernação & operação
                </span>
              </div>

              <div className="p-3.5 bg-zinc-100 border border-zinc-200 rounded-lg">
                <span className="text-[10px] font-mono font-bold uppercase text-zinc-700 tracking-wider block">
                  Saldo Líquido
                </span>
                <span
                  className={`text-lg font-bold font-mono block mt-1 ${
                    reportData.netBalance >= 0 ? 'text-zinc-950' : 'text-rose-600'
                  }`}
                >
                  {formatBRL(reportData.netBalance)}
                </span>
                <span className="text-[10px] text-zinc-600 mt-1 block">
                  Margem Líquida: {marginPct}%
                </span>
              </div>

              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg">
                <span className="text-[10px] font-mono font-bold uppercase text-amber-800 tracking-wider block">
                  A Receber no Mês
                </span>
                <span className="text-lg font-bold font-mono text-amber-700 block mt-1">
                  {formatBRL(reportData.pendingIncome)}
                </span>
                <span className="text-[10px] text-amber-700/80 mt-1 block">
                  Meta atingida: {goalPct}%
                </span>
              </div>
            </div>

            {/* Performance Indicators & Goal Meter */}
            <div className="mb-6 p-4 bg-zinc-50 border border-zinc-200 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900">
                    Meta Mensal de Faturamento: {formatBRL(reportData.monthlyGoal)}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    {goalPct >= 100 ? (
                      <span className="text-emerald-700 font-semibold">
                        🎉 Meta superada em {goalPct - 100}% (+{formatBRL(reportData.paidIncome - reportData.monthlyGoal)})
                      </span>
                    ) : (
                      <span>
                        Faltam {formatBRL(Math.max(0, reportData.monthlyGoal - reportData.paidIncome))} para atingir 100% da meta.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full sm:w-48">
                <div className="flex justify-between text-[10px] font-mono font-medium text-zinc-500 mb-1">
                  <span>Progresso</span>
                  <span className="font-bold text-zinc-800">{goalPct}%</span>
                </div>
                <div className="w-full h-2.5 bg-zinc-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all rounded-full ${
                      goalPct >= 100 ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, goalPct)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Category Breakdown (2 Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Income Categories */}
              <div className="p-4 bg-zinc-50/70 border border-zinc-200 rounded-lg">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200 text-xs font-bold text-emerald-800">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Receitas por Categoria
                  </span>
                  <span>{formatBRL(reportData.paidIncome)}</span>
                </div>
                <div className="mt-2.5 space-y-1.5 text-xs">
                  {Object.entries(reportData.incomeByCategory).length === 0 ? (
                    <div className="text-[11px] text-zinc-400 italic">Sem registros de receitas.</div>
                  ) : (
                    Object.entries(reportData.incomeByCategory).map(([cat, amount]) => (
                      <div key={cat} className="flex items-center justify-between text-zinc-700">
                        <span className="truncate pr-2">{cat}</span>
                        <span className="font-mono font-semibold shrink-0">
                          {formatBRL(amount)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Expense Categories */}
              <div className="p-4 bg-zinc-50/70 border border-zinc-200 rounded-lg">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200 text-xs font-bold text-rose-800">
                  <span className="flex items-center gap-1.5">
                    <TrendingDown className="w-3.5 h-3.5" />
                    Despesas por Categoria
                  </span>
                  <span>{formatBRL(reportData.paidExpenses)}</span>
                </div>
                <div className="mt-2.5 space-y-1.5 text-xs">
                  {Object.entries(reportData.expenseByCategory).length === 0 ? (
                    <div className="text-[11px] text-zinc-400 italic">Sem registros de despesas.</div>
                  ) : (
                    Object.entries(reportData.expenseByCategory).map(([cat, amount]) => (
                      <div key={cat} className="flex items-center justify-between text-zinc-700">
                        <span className="truncate pr-2">{cat}</span>
                        <span className="font-mono font-semibold shrink-0">
                          {formatBRL(amount)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Analytical Table of Transactions */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900">
                  Extrato Consolidado de Lançamentos ({reportData.transactions.length})
                </h3>
                <span className="text-[10px] text-zinc-500">Valores em Reais (BRL)</span>
              </div>

              <div className="border border-zinc-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-100 border-b border-zinc-200 text-[10px] font-mono uppercase text-zinc-600">
                    <tr>
                      <th className="py-2.5 px-3">Data</th>
                      <th className="py-2.5 px-3">Descrição / Sessão</th>
                      <th className="py-2.5 px-3">Categoria</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-700">
                    {reportData.transactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-zinc-400 italic">
                          Nenhum lançamento registrado neste mês.
                        </td>
                      </tr>
                    ) : (
                      reportData.transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-zinc-50/80">
                          <td className="py-2 px-3 font-mono text-[11px] whitespace-nowrap text-zinc-600">
                            {tx.date ? tx.date.split('-').reverse().join('/') : '-'}
                          </td>
                          <td className="py-2 px-3 font-medium text-zinc-900">
                            {tx.title}
                          </td>
                          <td className="py-2 px-3 text-[11px] text-zinc-500 font-mono">
                            {tx.category}
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                tx.status === 'paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : tx.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {tx.status === 'paid' ? 'Pago' : tx.status === 'pending' ? 'Pendente' : 'Atrasado'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold tabular-nums whitespace-nowrap">
                            <span
                              className={
                                tx.type === 'income' ? 'text-emerald-700' : 'text-rose-700'
                              }
                            >
                              {tx.type === 'income' ? '+' : '-'} {formatBRL(tx.amount)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {reportData.transactions.length > 0 && (
                    <tfoot className="bg-zinc-100/80 font-bold border-t border-zinc-200">
                      <tr>
                        <td colSpan={4} className="py-2.5 px-3 text-right text-[11px] text-zinc-700">
                          Total Líquido do Período:
                        </td>
                        <td
                          className={`py-2.5 px-3 text-right font-mono tabular-nums ${
                            reportData.netBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {formatBRL(reportData.netBalance)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            {/* Document Signature & Accounting Note */}
            <div className="pt-6 border-t border-zinc-200 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
              <div>
                <p className="font-semibold text-zinc-800">
                  {reportData.settings.studioName || 'Lumina Studio'} · Gestão Financeira
                </p>
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  Documento emitido para fins de prestação de contas e planejamento tributário.
                </p>
              </div>

              <div className="text-right">
                <p className="font-mono text-[10px] text-zinc-400">
                  Assinado eletronicamente por {reportData.settings.photographerName}
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 sm:justify-end">
                  <CheckCircle2 className="w-3 h-3" />
                  Conferência contábil concluída
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
