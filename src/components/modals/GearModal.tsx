import React, { useState, useEffect } from 'react';
import { X, Trash2, Camera } from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import { GearItem } from '../../types';

interface GearModalProps {
  isOpen: boolean;
  onClose: () => void;
  gearToEdit?: GearItem | null;
}

export const GearModal: React.FC<GearModalProps> = ({
  isOpen,
  onClose,
  gearToEdit,
}) => {
  const { addGearItem, updateGearItem, deleteGearItem } = useWork();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<GearItem['category']>('camera');
  const [serialNumber, setSerialNumber] = useState('');
  const [status, setStatus] = useState<GearItem['status']>('available');
  const [notes, setNotes] = useState('');
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState('');
  const [lastMaintenanceDate, setLastMaintenanceDate] = useState('');
  const [maintenanceType, setMaintenanceType] = useState('');
  const [insuranceRenewalDate, setInsuranceRenewalDate] = useState('');
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState('');
  const [insuranceCompany, setInsuranceCompany] = useState('');
  const [estimatedValue, setEstimatedValue] = useState<number | ''>('');

  useEffect(() => {
    if (gearToEdit) {
      setName(gearToEdit.name);
      setCategory(gearToEdit.category);
      setSerialNumber(gearToEdit.serialNumber || '');
      setStatus(gearToEdit.status);
      setNotes(gearToEdit.notes || '');
      setNextMaintenanceDate(gearToEdit.nextMaintenanceDate || '');
      setLastMaintenanceDate(gearToEdit.lastMaintenanceDate || '');
      setMaintenanceType(gearToEdit.maintenanceType || '');
      setInsuranceRenewalDate(gearToEdit.insuranceRenewalDate || '');
      setInsurancePolicyNumber(gearToEdit.insurancePolicyNumber || '');
      setInsuranceCompany(gearToEdit.insuranceCompany || '');
      setEstimatedValue(gearToEdit.estimatedValue ?? '');
    } else {
      setName('');
      setCategory('camera');
      setSerialNumber('');
      setStatus('available');
      setNotes('');
      setNextMaintenanceDate('');
      setLastMaintenanceDate('');
      setMaintenanceType('');
      setInsuranceRenewalDate('');
      setInsurancePolicyNumber('');
      setInsuranceCompany('');
      setEstimatedValue('');
    }
  }, [gearToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload: Partial<GearItem> = {
      name,
      category,
      serialNumber: serialNumber || undefined,
      status,
      notes: notes || undefined,
      nextMaintenanceDate: nextMaintenanceDate || undefined,
      lastMaintenanceDate: lastMaintenanceDate || undefined,
      maintenanceType: maintenanceType || undefined,
      insuranceRenewalDate: insuranceRenewalDate || undefined,
      insurancePolicyNumber: insurancePolicyNumber || undefined,
      insuranceCompany: insuranceCompany || undefined,
      estimatedValue: estimatedValue !== '' ? Number(estimatedValue) : undefined,
    };

    if (gearToEdit) {
      updateGearItem(gearToEdit.id, payload);
    } else {
      addGearItem(payload as any);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-md w-full overflow-hidden text-zinc-900 dark:text-zinc-100 transition-colors">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {gearToEdit ? 'Editar Equipamento' : 'Cadastrar Equipamento'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors p-1 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Nome do Equipamento *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Sony A7 IV, Lente 24-70mm GM II..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 focus:outline-none"
              >
                <option value="camera">Câmera / Corpo</option>
                <option value="lens">Lente / Objetiva</option>
                <option value="lighting">Iluminação & Flash</option>
                <option value="storage">Cartão / Armazenamento</option>
                <option value="audio_accessory">Acessórios / Suportes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 focus:outline-none"
              >
                <option value="available">Pronto para Uso</option>
                <option value="in_use">Em Campo / Sessão</option>
                <option value="maintenance">Manutenção / Limpeza</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Número de Série (Para seguro e controle)
            </label>
            <input
              type="text"
              placeholder="Ex: SN-9812401"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Observações
            </label>
            <textarea
              rows={2}
              placeholder="Última limpeza de sensor, baterias inclusas..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
            />
          </div>

          {/* Seção de Manutenção Preventiva */}
          <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                🔧 Manutenção Preventiva & Revisão
              </span>
              <span className="text-[10px] text-zinc-400">Alertas automáticos</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Próxima Manutenção
                </label>
                <input
                  type="date"
                  value={nextMaintenanceDate}
                  onChange={(e) => setNextMaintenanceDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Última Realizada
                </label>
                <input
                  type="date"
                  value={lastMaintenanceDate}
                  onChange={(e) => setLastMaintenanceDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Tipo / Procedimento de Revisão
              </label>
              <input
                type="text"
                placeholder="Ex: Limpeza de sensor, Calibração de foco, Troca de lâmpada..."
                value={maintenanceType}
                onChange={(e) => setMaintenanceType(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Seção de Seguro de Equipamento */}
          <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                🛡️ Apólice de Seguro Fotográfico
              </span>
              <span className="text-[10px] text-zinc-400">Renovação anual</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Data de Renovação
                </label>
                <input
                  type="date"
                  value={insuranceRenewalDate}
                  onChange={(e) => setInsuranceRenewalDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Valor Segurado (R$)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 15000"
                  value={estimatedValue}
                  onChange={(e) =>
                    setEstimatedValue(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Nº da Apólice
                </label>
                <input
                  type="text"
                  placeholder="Ex: PORTO-88910"
                  value={insurancePolicyNumber}
                  onChange={(e) => setInsurancePolicyNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Seguradora / Corretor
                </label>
                <input
                  type="text"
                  placeholder="Ex: Porto Seguro, Sompo..."
                  value={insuranceCompany}
                  onChange={(e) => setInsuranceCompany(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            {gearToEdit ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Excluir este equipamento?')) {
                    deleteGearItem(gearToEdit.id);
                    onClose();
                  }
                }}
                className="text-xs text-rose-600 hover:text-rose-500 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
            ) : (
              <span />
            )}

            <div className="flex gap-2">
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
                Salvar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
