import React, { useState, useEffect } from 'react';
import { X, Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import { FinancialTransaction, TransactionStatus, TransactionType } from '../../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  txToEdit?: FinancialTransaction | null;
  defaultType?: TransactionType;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  txToEdit,
  defaultType = 'income',
}) => {
  const { sessions, clients, addTransaction, updateTransaction, deleteTransaction } = useWork();

  const [type, setType] = useState<TransactionType>(defaultType);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState(1500);
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<TransactionStatus>('paid');
  const [sessionId, setSessionId] = useState('');
  const [clientId, setClientId] = useState('');
  const [notes, setNotes] = useState('');

  const incomeCategories = [
    'Pacote de Casamento',
    'Ensaio Fotográfico',
    'Fotos Extras / Up-sell',
    'Retratos Corporativos',
    'Cobertura de Evento',
    'Álbum Fotográfico Adicional',
    'Outras Receitas',
  ];

  const expenseCategories = [
    'Álbuns & Encadernadora',
    'Locação de Estúdio',
    'Equipamentos & Manutenção',
    'Softwares (Adobe CC / Pixieset)',
    'Segundo Fotógrafo / Assistente',
    'Deslocamento & Viagem',
    'Embalagens & Entrega',
    'Marketing & Anúncios',
    'Outras Despesas',
  ];

  useEffect(() => {
    if (txToEdit) {
      setType(txToEdit.type);
      setTitle(txToEdit.title);
      setAmount(txToEdit.amount);
      setDate(txToEdit.date);
      setCategory(txToEdit.category);
      setStatus(txToEdit.status);
      setSessionId(txToEdit.sessionId || '');
      setClientId(txToEdit.clientId || '');
      setNotes(txToEdit.notes || '');
    } else {
      setType(defaultType);
      setTitle('');
      setAmount(1500);
      setDate(new Date().toISOString().split('T')[0]);
      setCategory(defaultType === 'income' ? incomeCategories[0] : expenseCategories[0]);
      setStatus('paid');
      setSessionId('');
      setClientId('');
      setNotes('');
    }
  }, [txToEdit, defaultType, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (txToEdit) {
      updateTransaction(txToEdit.id, {
        type,
        title,
        amount: Number(amount) || 0,
        date,
        category,
        status,
        sessionId: sessionId || undefined,
        clientId: clientId || undefined,
        notes: notes || undefined,
      });
    } else {
      addTransaction({
        type,
        title,
        amount: Number(amount) || 0,
        date,
        category,
        status,
        sessionId: sessionId || undefined,
        clientId: clientId || undefined,
        notes: notes || undefined,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden text-zinc-900 dark:text-zinc-100 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40">
          <div className="flex items-center gap-2">
            {type === 'income' ? (
              <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
            ) : (
              <ArrowUpRight className="w-5 h-5 text-rose-500" />
            )}
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {txToEdit ? 'Editar Lançamento' : 'Novo Lançamento Financeiro'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors p-1 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Segmented type selector */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Tipo de Transação
            </label>
            <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setType('income');
                  setCategory(incomeCategories[0]);
                }}
                className={`py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  type === 'income'
                    ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                + Entrada / Receita
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('expense');
                  setCategory(expenseCategories[0]);
                }}
                className={`py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  type === 'expense'
                    ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                - Saída / Despesa
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Descrição do Lançamento *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Sinal Reserva Ensaio Pré-Wedding"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Valor (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Data do Registro
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 focus:outline-none"
              >
                {(type === 'income' ? incomeCategories : expenseCategories).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Status do Pagamento
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TransactionStatus)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 focus:outline-none"
              >
                <option value="paid">Recebido / Pago</option>
                <option value="pending">Pendente / A Receber</option>
                <option value="overdue">Vencido</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Ensaio / Evento Relacionado
              </label>
              <select
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 focus:outline-none"
              >
                <option value="">Nenhum específico</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Cliente Relacionado
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 focus:outline-none"
              >
                <option value="">Nenhum específico</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company || c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Observações Adicionais
            </label>
            <textarea
              rows={2}
              placeholder="Comprovante PIX, parcelamento, nota de encadernadora..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            {txToEdit ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Tem certeza que deseja excluir este lançamento?')) {
                    deleteTransaction(txToEdit.id);
                    onClose();
                  }
                }}
                className="text-xs font-medium text-rose-600 hover:text-rose-500 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Excluir Lançamento
              </button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white rounded-md transition-colors shadow-xs cursor-pointer"
              >
                {txToEdit ? 'Salvar Alterações' : 'Registrar Lançamento'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
