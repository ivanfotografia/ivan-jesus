import React, { useState, useEffect } from 'react';
import { X, Image, Lock, Shield, Sparkles, Plus, Trash2, Camera } from 'lucide-react';
import { ClientGallery, GalleryCategory, GalleryStatus } from '../../types';
import { useWork } from '../../context/WorkContext';

interface GalleryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  galleryToEdit?: ClientGallery | null;
}

const CATEGORIES: { id: GalleryCategory; label: string }[] = [
  { id: 'casamento', label: '💍 Casamentos' },
  { id: 'formatura', label: '🎓 Formaturas' },
  { id: 'ensaio', label: '📸 Ensaios' },
  { id: 'aniversario', label: '🎂 Aniversários' },
  { id: 'corporativo', label: '🏢 Eventos corporativos' },
  { id: 'esportivo', label: '🏃 Eventos esportivos' },
  { id: 'escolar', label: '🏫 Fotografia escolar' },
  { id: 'produtos', label: '🛍️ Fotos de produtos' },
  { id: 'gestante', label: '🤰 Ensaio gestante' },
  { id: 'newborn', label: '👶 Newborn' },
  { id: 'danca_artes', label: '🩰 Dança e artes' },
  { id: 'outro', label: '✨ Outro' },
];

const SAMPLE_COVERS: { label: string; url: string }[] = [
  {
    label: 'Casamento',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Formatura',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Ensaio Casal',
    url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Aniversário / Festa',
    url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Retrato Corporativo',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Gestante',
    url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80',
  },
];

export const GalleryFormModal: React.FC<GalleryFormModalProps> = ({
  isOpen,
  onClose,
  galleryToEdit,
}) => {
  const { clients, sessions, settings, addGallery, updateGallery } = useWork();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GalleryCategory>('casamento');
  const [clientId, setClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [coverImage, setCoverImage] = useState(SAMPLE_COVERS[0].url);
  const [status, setStatus] = useState<GalleryStatus>('selection');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [accessCode, setAccessCode] = useState('');
  const [contractedPhotos, setContractedPhotos] = useState(20);
  const [extraPhotoPrice, setExtraPhotoPrice] = useState(settings.defaultExtraPhotoPrice || 35);
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);
  const [watermarkText, setWatermarkText] = useState(`${settings.studioName} · Prova`);
  const [customMessage, setCustomMessage] = useState(
    'Mais que fotos, grandes histórias! Selecione suas fotos favoritas com amor.'
  );

  useEffect(() => {
    if (galleryToEdit) {
      setTitle(galleryToEdit.title);
      setCategory(galleryToEdit.category);
      setClientId(galleryToEdit.clientId);
      setClientName(galleryToEdit.clientName);
      setClientEmail(galleryToEdit.clientEmail || '');
      setClientPhone(galleryToEdit.clientPhone || '');
      setSessionId(galleryToEdit.sessionId || '');
      setCoverImage(galleryToEdit.coverImage);
      setStatus(galleryToEdit.status);
      setDate(galleryToEdit.date);
      setAccessCode(galleryToEdit.accessCode || '');
      setContractedPhotos(galleryToEdit.contractedPhotos);
      setExtraPhotoPrice(galleryToEdit.extraPhotoPrice);
      setWatermarkEnabled(galleryToEdit.watermarkEnabled);
      setWatermarkText(galleryToEdit.watermarkText || `${settings.studioName} · Prova`);
      setCustomMessage(galleryToEdit.customMessage || '');
    } else {
      setTitle('');
      setCategory('casamento');
      setClientId('');
      setClientName('');
      setClientEmail('');
      setClientPhone('');
      setSessionId('');
      setCoverImage(SAMPLE_COVERS[0].url);
      setStatus('selection');
      setDate(new Date().toISOString().split('T')[0]);
      setAccessCode('');
      setContractedPhotos(20);
      setExtraPhotoPrice(settings.defaultExtraPhotoPrice || 35);
      setWatermarkEnabled(true);
      setWatermarkText(`${settings.studioName} · Prova`);
      setCustomMessage(
        'Mais que fotos, grandes histórias! Selecione suas fotos favoritas com amor.'
      );
    }
  }, [galleryToEdit, isOpen, settings]);

  if (!isOpen) return null;

  const handleSelectClient = (id: string) => {
    setClientId(id);
    const found = clients.find((c) => c.id === id);
    if (found) {
      setClientName(found.name);
      setClientEmail(found.email);
      setClientPhone(found.phone);
    }
  };

  const handleSelectSession = (id: string) => {
    setSessionId(id);
    const found = sessions.find((s) => s.id === id);
    if (found) {
      if (!title) setTitle(found.title);
      setDate(found.sessionDate);
      if (found.contractedPhotos) setContractedPhotos(found.contractedPhotos);
      if (found.extraPhotoPrice) setExtraPhotoPrice(found.extraPhotoPrice);
      if (found.clientId) handleSelectClient(found.clientId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientName.trim()) return;

    if (galleryToEdit) {
      updateGallery(galleryToEdit.id, {
        title,
        category,
        clientId: clientId || 'cli-custom',
        clientName,
        clientEmail,
        clientPhone,
        sessionId: sessionId || undefined,
        coverImage,
        status,
        date,
        accessCode: accessCode.trim() || undefined,
        contractedPhotos: Number(contractedPhotos),
        extraPhotoPrice: Number(extraPhotoPrice),
        watermarkEnabled,
        watermarkText,
        customMessage,
      });
    } else {
      // Default demo photos for new gallery so it's immediately testable!
      const demoPhotos = [
        {
          id: `p-${Date.now()}-1`,
          url: coverImage,
          thumbnailUrl: coverImage,
          filename: 'foto_01_destaque.jpg',
          selected: true,
          favorited: true,
        },
        {
          id: `p-${Date.now()}-2`,
          url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80',
          thumbnailUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80',
          filename: 'foto_02_emocao.jpg',
          selected: false,
          favorited: false,
        },
        {
          id: `p-${Date.now()}-3`,
          url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1000&q=80',
          thumbnailUrl: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=400&q=80',
          filename: 'foto_03_retrato.jpg',
          selected: false,
          favorited: false,
        },
        {
          id: `p-${Date.now()}-4`,
          url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1000&q=80',
          thumbnailUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=400&q=80',
          filename: 'foto_04_golden_hour.jpg',
          selected: false,
          favorited: false,
        },
      ];

      addGallery({
        title,
        category,
        clientId: clientId || `cli-${Date.now()}`,
        clientName,
        clientEmail,
        clientPhone,
        sessionId: sessionId || undefined,
        coverImage,
        status,
        date,
        accessCode: accessCode.trim() || undefined,
        contractedPhotos: Number(contractedPhotos),
        extraPhotoPrice: Number(extraPhotoPrice),
        watermarkEnabled,
        watermarkText,
        downloadAllowed: false,
        customMessage,
        orders: [],
        photos: demoPhotos,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {galleryToEdit ? 'Editar Galeria' : 'Nova Galeria de Clientes'}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                FluxoWeby Galerias · Mais que fotos, grandes histórias!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Title & Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Título da Galeria *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Casamento Beatriz & Thiago"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Categoria *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GalleryCategory)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick link to Session & Client */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Vincular a um Ensaio / Evento (Opcional)
              </label>
              <select
                value={sessionId}
                onChange={(e) => handleSelectSession(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100"
              >
                <option value="">Nenhum (Galeria independente)</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.sessionDate})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Cliente Cadastrado
              </label>
              <select
                value={clientId}
                onChange={(e) => handleSelectClient(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100"
              >
                <option value="">Inserir manualmente...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company ? `(${c.company})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Client Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Nome do Cliente *
              </label>
              <input
                type="text"
                required
                placeholder="Nome completo"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                E-mail
              </label>
              <input
                type="email"
                placeholder="cliente@email.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                WhatsApp / Celular
              </label>
              <input
                type="text"
                placeholder="(11) 99999-9999"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Cover Photo Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Image className="w-3.5 h-3.5" />
                Foto de Capa da Galeria
              </label>
              <span className="text-[11px] text-zinc-400">Escolha uma prévia ou cole a URL</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {SAMPLE_COVERS.map((sc, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setCoverImage(sc.url)}
                  className={`relative rounded-lg overflow-hidden border-2 aspect-4/3 group cursor-pointer transition-all ${
                    coverImage === sc.url
                      ? 'border-amber-500 ring-2 ring-amber-500/20 scale-102'
                      : 'border-transparent hover:border-zinc-300'
                  }`}
                >
                  <img
                    src={sc.url}
                    alt={sc.label}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-end p-1">
                    <span className="text-[9px] text-white font-medium truncate">{sc.label}</span>
                  </div>
                </button>
              ))}
            </div>

            <input
              type="url"
              placeholder="Ou cole uma URL personalizada da imagem de capa..."
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-700 dark:text-zinc-300"
            />
          </div>

          {/* Package & Extra Photo Rules */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Fotos Contratadas no Pacote
              </label>
              <input
                type="number"
                min="1"
                required
                value={contractedPhotos}
                onChange={(e) => setContractedPhotos(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100"
              />
              <span className="text-[10px] text-zinc-500">Inclusas sem custo extra</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Valor por Foto Extra (R$)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                required
                value={extraPhotoPrice}
                onChange={(e) => setExtraPhotoPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400"
              />
              <span className="text-[10px] text-zinc-500">Cobrado via Pix / Mercado Pago</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Senha de Acesso (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: NOIVOS2026"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-zinc-100"
              />
              <span className="text-[10px] text-zinc-500">Privacidade para o cliente</span>
            </div>
          </div>

          {/* Watermark Protection (From flyer!) */}
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Proteção & Marca d'Água nas Prévias
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={watermarkEnabled}
                  onChange={(e) => setWatermarkEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-200 dark:bg-zinc-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {watermarkEnabled && (
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Texto da marca d'água sobreposta
                </label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>
            )}
          </div>

          {/* Welcome Message */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Mensagem de Boas-Vindas para o Cliente
            </label>
            <textarea
              rows={2}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 resize-none"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {galleryToEdit ? 'Salvar Alterações' : 'Criar Galeria FluxoWeby'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
