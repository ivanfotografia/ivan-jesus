import React, { useState, useRef } from 'react';
import {
  Save,
  Download,
  Upload,
  RefreshCw,
  Check,
  Camera,
  Instagram,
  Sun,
  Moon,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import { useTheme } from '../../context/ThemeContext';
import { PWAInstallButton } from '../PWAInstallButton';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    exportDataJson,
    importDataJson,
    resetToDefaults,
  } = useWork();

  const { theme, setTheme } = useTheme();

  const [formData, setFormData] = useState(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDataJson(content);
      if (success) {
        setImportMessage('Backup restaurado com sucesso! Seus dados de fotografia foram carregados.');
      } else {
        setImportMessage('Erro ao importar arquivo. Verifique o arquivo JSON.');
      }
      setTimeout(() => setImportMessage(null), 5000);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-5 border-b border-zinc-200/80 dark:border-white/[0.07] transition-colors">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-display">
          Configurações do Estúdio Fotográfico & Backup
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
          Identidade visual do estúdio, dados para contratos e recibos, chave PIX, valores padrão e segurança de dados.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Configurações do estúdio salvas com sucesso!</span>
        </div>
      )}

      {importMessage && (
        <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
          <span>{importMessage}</span>
        </div>
      )}

      {/* Theme Preference Card */}
      <div className="p-6 bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-white/[0.08] rounded-2xl space-y-3.5 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 font-mono flex items-center gap-2">
          Aparência do Software
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Escolha a estética de trabalho ideal para seu ambiente de revelação e edição:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
              theme === 'dark'
                ? 'border-amber-500 bg-[#16161a] text-white shadow-sm ring-1 ring-amber-500'
                : 'border-zinc-200 dark:border-white/[0.08] hover:border-zinc-300 dark:hover:border-white/[0.16] text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-100 flex items-center gap-1.5 font-display">
                Modo Escuro Studio OS (Darkroom)
                {theme === 'dark' && <span className="text-[10px] text-amber-400 font-mono">● Ativo</span>}
              </div>
              <div className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                Contraste suave e visual cinematográfico para preservar a fidelidade de cor no monitor.
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
              theme === 'light'
                ? 'border-zinc-900 bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-900'
                : 'border-zinc-200 dark:border-white/[0.08] hover:border-zinc-300 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-white/[0.05] text-zinc-800 dark:text-zinc-200">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 font-display">
                Modo Claro Editorial (Clean Print)
                {theme === 'light' && <span className="text-[10px] text-zinc-900 font-mono">● Ativo</span>}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                Alta legibilidade e estética minimalista inspirada em editoriais de moda e arquitetura.
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Studio Profile Form */}
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-white/[0.08] rounded-2xl shadow-xs space-y-5 transition-colors"
      >
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 font-mono flex items-center gap-2">
          <Camera className="w-4 h-4 text-amber-500" />
          Identificação do Estúdio & Emissão de Documentos
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Nome do Estúdio / Marca Fotográfica *
            </label>
            <input
              type="text"
              required
              value={formData.studioName}
              onChange={(e) => setFormData({ ...formData, studioName: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-[#18181c] border border-zinc-200 dark:border-white/[0.08] rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Nome do Fotógrafo(a) Principal *
            </label>
            <input
              type="text"
              required
              value={formData.photographerName}
              onChange={(e) => setFormData({ ...formData, photographerName: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-[#18181c] border border-zinc-200 dark:border-white/[0.08] rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Especialidade / Foco do Portfólio
            </label>
            <input
              type="text"
              placeholder="Ex: Casamentos, Ensaios Externos, Retratos Corporativos..."
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-[#18181c] border border-zinc-200 dark:border-white/[0.08] rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              CPF ou CNPJ (Para Contratos e Recibos)
            </label>
            <input
              type="text"
              value={formData.fiscalId}
              onChange={(e) => setFormData({ ...formData, fiscalId: e.target.value })}
              className="w-full px-3.5 py-2 text-xs font-mono bg-zinc-50 dark:bg-[#18181c] border border-zinc-200 dark:border-white/[0.08] rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              E-mail Comercial
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-[#18181c] border border-zinc-200 dark:border-white/[0.08] rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Telefone / WhatsApp Comercial
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-[#18181c] border border-zinc-200 dark:border-white/[0.08] rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Instagram Profissional
            </label>
            <input
              type="text"
              placeholder="@usuario"
              value={formData.instagram}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-[#18181c] border border-zinc-200 dark:border-white/[0.08] rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none"
            />
          </div>
        </div>

        {/* Financial defaults & PIX */}
        <div className="pt-4 border-t border-zinc-100 dark:border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Chave PIX (Para Contratos & Recibos)
            </label>
            <input
              type="text"
              placeholder="E-mail, CPF ou Aleatória"
              value={formData.pixKey}
              onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
              className="w-full px-3.5 py-2 text-xs font-mono bg-zinc-50 dark:bg-[#18181c] border border-zinc-200 dark:border-white/[0.08] rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Hora Técnica de Edição (R$/h)
            </label>
            <input
              type="number"
              step="5"
              value={formData.defaultHourlyRate}
              onChange={(e) =>
                setFormData({ ...formData, defaultHourlyRate: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-3.5 py-2 text-xs font-mono bg-zinc-50 dark:bg-[#18181c] border border-zinc-200 dark:border-white/[0.08] rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Preço Base da Foto Extra (R$)
            </label>
            <input
              type="number"
              step="1"
              value={formData.defaultExtraPhotoPrice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  defaultExtraPhotoPrice: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3.5 py-2 text-xs font-mono bg-zinc-50 dark:bg-[#18181c] border border-zinc-200 dark:border-white/[0.08] rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Meta Mensal de Faturamento (R$)
            </label>
            <input
              type="number"
              step="500"
              value={formData.monthlyRevenueGoal || 8000}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  monthlyRevenueGoal: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3.5 py-2 text-xs font-mono bg-zinc-50 dark:bg-[#18181c] border border-zinc-200 dark:border-white/[0.08] rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-zinc-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </form>

      {/* Desktop App Installation Card */}
      <PWAInstallButton variant="card" />

      {/* Backup and Data Persistence Card */}
      <div className="p-6 bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-white/[0.08] rounded-2xl space-y-4 shadow-xs transition-colors">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 font-mono flex items-center gap-2">
          <Shield className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          Backup Local & Exportação de Dados
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Exporte todos os seus ensaios, contratos, faturamento e inventário em arquivo JSON para guardar em seu computador ou transferir de máquina com segurança.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={exportDataJson}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/[0.1] rounded-xl transition-colors cursor-pointer border border-zinc-200 dark:border-white/[0.08]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar Backup (JSON)</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/[0.1] rounded-xl transition-colors cursor-pointer border border-zinc-200 dark:border-white/[0.08]"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Restaurar Backup (JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm('Atenção: deseja realmente restaurar os dados de demonstração originais?')) {
                resetToDefaults();
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer ml-auto border border-rose-200 dark:border-rose-900/40"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restaurar Exemplo Inicial</span>
          </button>
        </div>
      </div>
    </div>
  );
};
