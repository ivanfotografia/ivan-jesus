import React, { useState, useEffect } from 'react';
import {
  Activity,
  X,
  Database,
  HardDrive,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Server,
  Cpu,
  ShieldCheck,
  FileCode,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';

interface SystemDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemDiagnosticsModal: React.FC<SystemDiagnosticsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    sessions,
    clients,
    gear,
    transactions,
    galleries,
    timeLogs,
    settings,
    exportDataJson,
    importDataJson,
    resetToDefaults,
  } = useWork();

  const [storageBytes, setStorageBytes] = useState(0);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Compute local storage usage
  useEffect(() => {
    let total = 0;
    try {
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          total += (localStorage[key].length + key.length) * 2; // approx UTF-16 bytes
        }
      }
    } catch {
      total = 1024 * 50;
    }
    setStorageBytes(total);
  }, [sessions, clients, gear, transactions, galleries, timeLogs]);

  if (!isOpen) return null;

  const storageKB = (storageBytes / 1024).toFixed(1);
  const isStandalone =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true);

  const totalPhotosCount = galleries.reduce((acc, g) => acc + (g.photos?.length || 0), 0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDataJson(content);
      if (success) {
        setImportStatus('Backup restaurado com sucesso no sistema!');
        setTimeout(() => setImportStatus(null), 4000);
      } else {
        setImportStatus('Erro ao ler arquivo de backup. Formato inválido.');
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (
      window.confirm(
        'Tem certeza que deseja resetar os dados do sistema para os padrões do estúdio? Isso recarregará o conjunto inicial de demonstração.'
      )
    ) {
      resetToDefaults();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Diagnóstico & Gestão do Sistema
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                  ONLINE & ATIVO
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Informações de integridade, memória local e cópia de segurança
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {importStatus && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                importStatus.includes('sucesso')
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30'
              }`}
            >
              {importStatus.includes('sucesso') ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              )}
              {importStatus}
            </div>
          )}

          {/* System Specs Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60">
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">MODO DE EXECUÇÃO</div>
              <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-amber-500" />
                {isStandalone ? 'PWA Nativo' : 'Navegador Web'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60">
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">BANCO DE DADOS</div>
              <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-500" />
                Local Storage
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60">
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">ESPAÇO UTILIZADO</div>
              <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-sky-500" />
                {storageKB} KB
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60">
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">STATUS SEGURANÇA</div>
              <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                100% Protegido
              </div>
            </div>
          </div>

          {/* Database Entities Metrics */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-mono flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-amber-500" />
              Contagem de Registros no Sistema
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/50 flex justify-between items-center">
                <span className="text-zinc-600 dark:text-zinc-400">Ensaios / Eventos:</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{sessions.length}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/50 flex justify-between items-center">
                <span className="text-zinc-600 dark:text-zinc-400">Galerias FluxoWeby:</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{galleries.length}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/50 flex justify-between items-center">
                <span className="text-zinc-600 dark:text-zinc-400">Fotos em Galerias:</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{totalPhotosCount}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/50 flex justify-between items-center">
                <span className="text-zinc-600 dark:text-zinc-400">Clientes & Noivos:</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{clients.length}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/50 flex justify-between items-center">
                <span className="text-zinc-600 dark:text-zinc-400">Equipamentos:</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{gear.length}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/50 flex justify-between items-center">
                <span className="text-zinc-600 dark:text-zinc-400">Transações Caixa:</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{transactions.length}</span>
              </div>
            </div>
          </div>

          {/* Backup & Restore Action Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-mono flex items-center gap-2">
              <FileCode className="w-3.5 h-3.5 text-amber-500" />
              Operações de Cópia de Segurança (Backup)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-emerald-500" />
                    Exportar Backup Completo
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                    Gera um arquivo JSON contendo todas as sessões, clientes, fotos de galerias, equipamentos e financeiro para arquivamento no seu computador.
                  </p>
                </div>
                <button
                  onClick={exportDataJson}
                  className="mt-3 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Baixar Backup (.json)
                </button>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-sky-500" />
                    Restaurar Arquivo de Backup
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                    Carregue um arquivo JSON gerado anteriormente para restaurar todo o banco de dados no sistema instantaneamente.
                  </p>
                </div>
                <label className="mt-3 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer text-center">
                  <Upload className="w-3.5 h-3.5" /> Selecionar Arquivo JSON
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Reset section */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Restaurar Dados de Exemplo</div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Restaura o conjunto de dados inicial de demonstração</div>
            </div>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Resetar Sistema
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-white transition-colors cursor-pointer"
          >
            Fechar Diagnóstico
          </button>
        </div>
      </div>
    </div>
  );
};
