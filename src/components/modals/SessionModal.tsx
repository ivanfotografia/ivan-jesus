import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  Plus,
  CheckSquare,
  Square,
  Camera,
  ExternalLink,
  MapPin,
  Calendar,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import {
  PhotoSession,
  SessionCategory,
  SessionPriority,
  SessionStage,
  ChecklistItem,
} from '../../types';

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionToEdit?: PhotoSession | null;
  defaultStage?: SessionStage;
}

export const SessionModal: React.FC<SessionModalProps> = ({
  isOpen,
  onClose,
  sessionToEdit,
  defaultStage = 'agendado',
}) => {
  const { clients, addSession, updateSession, deleteSession } = useWork();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<SessionCategory>('ensaio_casal');
  const [clientId, setClientId] = useState('');
  const [stage, setStage] = useState<SessionStage>(defaultStage);
  const [priority, setPriority] = useState<SessionPriority>('normal');
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [location, setLocation] = useState('');
  const [packagePrice, setPackagePrice] = useState(1500);
  const [depositAmount, setDepositAmount] = useState(500);
  const [depositPaid, setDepositPaid] = useState(true);
  const [balancePaid, setBalancePaid] = useState(false);
  const [contractedPhotos, setContractedPhotos] = useState(30);
  const [selectedPhotos, setSelectedPhotos] = useState(0);
  const [editedPhotos, setEditedPhotos] = useState(0);
  const [extraPhotoPrice, setExtraPhotoPrice] = useState(35);
  const [galleryUrl, setGalleryUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [gearChecklist, setGearChecklist] = useState<ChecklistItem[]>([]);
  const [workflowChecklist, setWorkflowChecklist] = useState<ChecklistItem[]>([]);
  const [newGearText, setNewGearText] = useState('');
  const [newWorkflowText, setNewWorkflowText] = useState('');

  const categoryLabels: Record<SessionCategory, string> = {
    casamento: 'Casamento',
    ensaio_casal: 'Ensaio de Casal / Pré-Wedding',
    retrato_corporativo: 'Retrato Corporativo / Profissional',
    familia_gestante: 'Família & Gestante',
    moda_editorial: 'Moda & Editorial',
    evento_aniversario: 'Evento & Aniversário',
    gastronomia: 'Gastronomia & Produto',
  };

  useEffect(() => {
    if (sessionToEdit) {
      setTitle(sessionToEdit.title);
      setCategory(sessionToEdit.category);
      setClientId(sessionToEdit.clientId);
      setStage(sessionToEdit.stage);
      setPriority(sessionToEdit.priority);
      setSessionDate(sessionToEdit.sessionDate);
      setSessionTime(sessionToEdit.sessionTime);
      setLocation(sessionToEdit.location);
      setPackagePrice(sessionToEdit.packagePrice);
      setDepositAmount(sessionToEdit.depositAmount);
      setDepositPaid(sessionToEdit.depositPaid);
      setBalancePaid(sessionToEdit.balancePaid);
      setContractedPhotos(sessionToEdit.contractedPhotos);
      setSelectedPhotos(sessionToEdit.selectedPhotos);
      setEditedPhotos(sessionToEdit.editedPhotos);
      setExtraPhotoPrice(sessionToEdit.extraPhotoPrice);
      setGalleryUrl(sessionToEdit.galleryUrl);
      setNotes(sessionToEdit.notes);
      setGearChecklist(sessionToEdit.gearChecklist || []);
      setWorkflowChecklist(sessionToEdit.workflowChecklist || []);
    } else {
      setTitle('');
      setCategory('ensaio_casal');
      setClientId(clients[0]?.id || '');
      setStage(defaultStage);
      setPriority('normal');
      const d = new Date();
      d.setDate(d.getDate() + 7);
      setSessionDate(d.toISOString().split('T')[0]);
      setSessionTime('15:30 - 18:00 (Golden Hour)');
      setLocation('Locação externa ou Estúdio');
      setPackagePrice(1500);
      setDepositAmount(500);
      setDepositPaid(true);
      setBalancePaid(false);
      setContractedPhotos(30);
      setSelectedPhotos(0);
      setEditedPhotos(0);
      setExtraPhotoPrice(35);
      setGalleryUrl('');
      setNotes('');
      setGearChecklist([
        { id: '1', text: 'Câmera principal + Baterias carregadas', completed: false },
        { id: '2', text: 'Lente principal + Lente reserva', completed: false },
        { id: '3', text: 'Cartões de memória formatados', completed: false },
        { id: '4', text: 'Flash Speedlight + Difusor', completed: false },
      ]);
      setWorkflowChecklist([
        { id: '1', text: 'Briefing e referências alinhadas', completed: false },
        { id: '2', text: 'Sessão fotográfica realizada', completed: false },
        { id: '3', text: 'Backup duplo (HD + Nuvem)', completed: false },
        { id: '4', text: 'Envio da galeria de seleção para o cliente', completed: false },
        { id: '5', text: 'Tratamento de cor no Lightroom', completed: false },
        { id: '6', text: 'Entrega final dos arquivos em alta resolução', completed: false },
      ]);
    }
  }, [sessionToEdit, defaultStage, clients, isOpen]);

  if (!isOpen) return null;

  const extraPhotosCount = Math.max(0, selectedPhotos - contractedPhotos);
  const extraRevenue = extraPhotosCount * extraPhotoPrice;

  const handleAddGear = () => {
    if (!newGearText.trim()) return;
    setGearChecklist((prev) => [
      ...prev,
      { id: `gear-${Date.now()}`, text: newGearText.trim(), completed: false },
    ]);
    setNewGearText('');
  };

  const handleAddWorkflow = () => {
    if (!newWorkflowText.trim()) return;
    setWorkflowChecklist((prev) => [
      ...prev,
      { id: `wf-${Date.now()}`, text: newWorkflowText.trim(), completed: false },
    ]);
    setNewWorkflowText('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (sessionToEdit) {
      updateSession(sessionToEdit.id, {
        title,
        category,
        clientId,
        stage,
        priority,
        sessionDate,
        sessionTime,
        location,
        packagePrice: Number(packagePrice) || 0,
        depositAmount: Number(depositAmount) || 0,
        depositPaid,
        balancePaid,
        contractedPhotos: Number(contractedPhotos) || 0,
        selectedPhotos: Number(selectedPhotos) || 0,
        editedPhotos: Number(editedPhotos) || 0,
        extraPhotosCount,
        extraPhotoPrice: Number(extraPhotoPrice) || 0,
        galleryUrl,
        notes,
        gearChecklist,
        workflowChecklist,
      });
    } else {
      addSession({
        title,
        category,
        clientId,
        stage,
        priority,
        sessionDate,
        sessionTime,
        location,
        packagePrice: Number(packagePrice) || 0,
        depositAmount: Number(depositAmount) || 0,
        depositPaid,
        balancePaid,
        contractedPhotos: Number(contractedPhotos) || 0,
        selectedPhotos: Number(selectedPhotos) || 0,
        editedPhotos: Number(editedPhotos) || 0,
        extraPhotosCount,
        extraPhotoPrice: Number(extraPhotoPrice) || 0,
        galleryUrl,
        notes,
        gearChecklist,
        workflowChecklist,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden text-zinc-900 dark:text-zinc-100 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {sessionToEdit ? 'Editar Ensaio / Evento' : 'Novo Ensaio / Evento Fotográfico'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors p-1 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Título do Trabalho / Ensaio *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Ensaio Pré-Wedding Marina & Thiago"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Tipo de Ensaio / Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SessionCategory)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 focus:outline-none"
              >
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Cliente / Contratante
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 focus:outline-none"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company || c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Etapa do Fluxo
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as SessionStage)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 focus:outline-none"
              >
                <option value="agendado">1. Agendado / Briefing</option>
                <option value="sessao_feita">2. Sessão Feita / Seleção</option>
                <option value="edicao">3. Tratamento & Edição</option>
                <option value="entregue">4. Galeria Entregue</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Data do Ensaio / Evento
              </label>
              <input
                type="date"
                required
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Horário da Sessão
              </label>
              <input
                type="text"
                placeholder="Ex: 16:00 - 18:30 (Golden Hour)"
                value={sessionTime}
                onChange={(e) => setSessionTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Local / Estúdio / Endereço
              </label>
              <input
                type="text"
                placeholder="Ex: Fazenda Santa Gertrudes, Holambra"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 focus:outline-none"
              />
            </div>
          </div>

          {/* Pricing & Deposit details */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 font-medium mb-1">
                Valor do Pacote (R$)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={packagePrice}
                onChange={(e) => setPackagePrice(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-md font-mono tabular-nums bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 font-medium mb-1">
                Sinal de Reserva (R$)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={depositAmount}
                onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-md font-mono tabular-nums bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="flex flex-col justify-center">
              <label className="flex items-center gap-2 cursor-pointer mt-3">
                <input
                  type="checkbox"
                  checked={depositPaid}
                  onChange={(e) => setDepositPaid(e.target.checked)}
                  className="rounded border-zinc-300 text-zinc-900"
                />
                <span className="text-zinc-700 dark:text-zinc-300">Sinal Recebido</span>
              </label>
            </div>

            <div className="flex flex-col justify-center">
              <label className="flex items-center gap-2 cursor-pointer mt-3">
                <input
                  type="checkbox"
                  checked={balancePaid}
                  onChange={(e) => setBalancePaid(e.target.checked)}
                  className="rounded border-zinc-300 text-zinc-900"
                />
                <span className="text-zinc-700 dark:text-zinc-300">Saldo Quitado</span>
              </label>
            </div>
          </div>

          {/* Photos Tracking & Upsell / Extra Photos */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 font-medium mb-1">
                Fotos Contratadas
              </label>
              <input
                type="number"
                min="1"
                value={contractedPhotos}
                onChange={(e) => setContractedPhotos(parseInt(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-md font-mono tabular-nums bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 font-medium mb-1">
                Fotos Selecionadas
              </label>
              <input
                type="number"
                min="0"
                value={selectedPhotos}
                onChange={(e) => setSelectedPhotos(parseInt(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-md font-mono tabular-nums bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 font-medium mb-1">
                Fotos já Editadas
              </label>
              <input
                type="number"
                min="0"
                value={editedPhotos}
                onChange={(e) => setEditedPhotos(parseInt(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-md font-mono tabular-nums bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 font-medium mb-1">
                Preço Foto Extra (R$)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={extraPhotoPrice}
                onChange={(e) => setExtraPhotoPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-md font-mono tabular-nums bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            {extraPhotosCount > 0 && (
              <div className="sm:col-span-4 pt-2 border-t border-zinc-200 dark:border-zinc-700 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-between">
                <span>
                  Fotos Extras: {extraPhotosCount} fotos acima do pacote contratado
                </span>
                <span className="font-mono">
                  + R$ {(extraPhotosCount * extraPhotoPrice).toFixed(2)} a faturar
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Link da Galeria Online (Pixieset, Google Drive, Pic-Time)
            </label>
            <input
              type="url"
              placeholder="https://suagaleria.pixieset.com/ensaio"
              value={galleryUrl}
              onChange={(e) => setGalleryUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
            />
          </div>

          {/* Workflow Checklist */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Etapas do Fluxo de Trabalho ({workflowChecklist.filter((s) => s.completed).length}/{workflowChecklist.length})
            </label>
            <div className="space-y-1.5 mb-2 max-h-36 overflow-y-auto">
              {workflowChecklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 text-xs"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setWorkflowChecklist((prev) =>
                        prev.map((i) =>
                          i.id === item.id ? { ...i, completed: !i.completed } : i
                        )
                      )
                    }
                    className="flex items-center gap-2 text-left cursor-pointer flex-1"
                  >
                    {item.completed ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-zinc-400 shrink-0" />
                    )}
                    <span className={item.completed ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-800 dark:text-zinc-200'}>
                      {item.text}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setWorkflowChecklist((prev) => prev.filter((i) => i.id !== item.id))
                    }
                    className="text-zinc-400 hover:text-rose-600 p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Adicionar etapa personalizada (ex: Diagramação do álbum)..."
                value={newWorkflowText}
                onChange={(e) => setNewWorkflowText(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddWorkflow}
                className="px-3 py-1.5 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-md transition-colors cursor-pointer"
              >
                Adicionar
              </button>
            </div>
          </div>

          {/* Gear Checklist for shoot day */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Checklist de Equipamentos para o Dia da Sessão
            </label>
            <div className="space-y-1.5 mb-2 max-h-36 overflow-y-auto">
              {gearChecklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 text-xs"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setGearChecklist((prev) =>
                        prev.map((i) =>
                          i.id === item.id ? { ...i, completed: !i.completed } : i
                        )
                      )
                    }
                    className="flex items-center gap-2 text-left cursor-pointer flex-1"
                  >
                    {item.completed ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-zinc-400 shrink-0" />
                    )}
                    <span className={item.completed ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-800 dark:text-zinc-200'}>
                      {item.text}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setGearChecklist((prev) => prev.filter((i) => i.id !== item.id))
                    }
                    className="text-zinc-400 hover:text-rose-600 p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Adicionar equipamento ou acessório (ex: Bateria extra, Prism)..."
                value={newGearText}
                onChange={(e) => setNewGearText(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddGear}
                className="px-3 py-1.5 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-md transition-colors cursor-pointer"
              >
                Adicionar
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Observações Gerais & Notas do Cliente
            </label>
            <textarea
              rows={2}
              placeholder="Preferências do cliente, trocas de roupa, pessoas chave para fotografar..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            {sessionToEdit ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Tem certeza que deseja excluir esta sessão?')) {
                    deleteSession(sessionToEdit.id);
                    onClose();
                  }
                }}
                className="text-xs font-medium text-rose-600 hover:text-rose-500 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Excluir Sessão
              </button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white rounded-md shadow-xs cursor-pointer transition-colors"
              >
                {sessionToEdit ? 'Salvar Alterações' : 'Criar Ensaio'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
