import React, { useState, useMemo } from 'react';
import {
  Camera,
  Plus,
  Search,
  Filter,
  Share2,
  Sparkles,
  ExternalLink,
  ShoppingBag,
  QrCode,
  Lock,
  Eye,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  Image as ImageIcon,
  Edit2,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import { ClientGallery, GalleryCategory, GalleryStatus, GalleryOrder } from '../../types';
import { GalleryFormModal } from '../modals/GalleryFormModal';
import { GalleryShareModal } from '../modals/GalleryShareModal';
import { GalleryCheckoutModal } from '../modals/GalleryCheckoutModal';
import { ClientGalleryPortalModal } from '../modals/ClientGalleryPortalModal';
import { CinematicCarouselModal } from '../modals/CinematicCarouselModal';
import { SmartBookingModal } from '../modals/SmartBookingModal';
import { Film, Calendar, HardDrive, ShieldCheck as ShieldCheckIcon } from 'lucide-react';

export const GalleriesView: React.FC = () => {
  const { galleries, deleteGallery, approveGalleryOrder, formatCurrency } = useWork();

  const [activeTab, setActiveTab] = useState<'galleries' | 'orders' | 'reports'>('galleries');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [galleryToEdit, setGalleryToEdit] = useState<ClientGallery | null>(null);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [galleryToShare, setGalleryToShare] = useState<ClientGallery | null>(null);

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [galleryForCheckout, setGalleryForCheckout] = useState<ClientGallery | null>(null);

  const [isPortalModalOpen, setIsPortalModalOpen] = useState(false);
  const [galleryForPortal, setGalleryForPortal] = useState<ClientGallery | null>(null);

  const [isCarouselModalOpen, setIsCarouselModalOpen] = useState(false);
  const [carouselTitle, setCarouselTitle] = useState('Ensaio Histórias');
  const [carouselPhotos, setCarouselPhotos] = useState<string[]>([]);

  const [isSmartBookingOpen, setIsSmartBookingOpen] = useState(false);
  const [whiteLabelActive, setWhiteLabelActive] = useState(true);

  // Filtered galleries
  const filteredGalleries = useMemo(() => {
    return galleries.filter((gal) => {
      const matchSearch =
        gal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gal.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gal.date.includes(searchTerm);

      const matchCategory =
        selectedCategory === 'all' || gal.category === selectedCategory;

      const matchStatus =
        selectedStatus === 'all' || gal.status === selectedStatus;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [galleries, searchTerm, selectedCategory, selectedStatus]);

  // Aggregate orders from all galleries
  const allOrders = useMemo(() => {
    const list: { order: GalleryOrder; gallery: ClientGallery }[] = [];
    galleries.forEach((gal) => {
      if (gal.orders && gal.orders.length > 0) {
        gal.orders.forEach((ord) => {
          list.push({ order: ord, gallery: gal });
        });
      }
    });
    return list.sort((a, b) => b.order.createdAt.localeCompare(a.order.createdAt));
  }, [galleries]);

  // Metrics
  const metrics = useMemo(() => {
    const totalGalleries = galleries.length;
    let totalPhotos = 0;
    let totalExtrasSold = 0;
    let totalRevenueFromExtras = 0;
    let pendingOrdersCount = 0;

    galleries.forEach((g) => {
      totalPhotos += g.photos?.length || 0;
      if (g.orders) {
        g.orders.forEach((o) => {
          if (o.paymentStatus === 'paid') {
            totalExtrasSold += o.extraPhotosCount;
            totalRevenueFromExtras += o.totalAmount;
          } else {
            pendingOrdersCount++;
          }
        });
      }
    });

    return {
      totalGalleries,
      totalPhotos,
      totalExtrasSold,
      totalRevenueFromExtras,
      pendingOrdersCount,
    };
  }, [galleries]);

  const handleCreateNew = () => {
    setGalleryToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (gal: ClientGallery) => {
    setGalleryToEdit(gal);
    setIsFormModalOpen(true);
  };

  const handleOpenShare = (gal: ClientGallery) => {
    setGalleryToShare(gal);
    setIsShareModalOpen(true);
  };

  const handleOpenCheckout = (gal: ClientGallery) => {
    setGalleryForCheckout(gal);
    setIsCheckoutModalOpen(true);
  };

  const handleOpenPortal = (gal: ClientGallery) => {
    setGalleryForPortal(gal);
    setIsPortalModalOpen(true);
  };

  const handleDelete = (gal: ClientGallery) => {
    if (confirm(`Deseja realmente remover a galeria "${gal.title}"?`)) {
      deleteGallery(gal.id);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Flyer Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d0d10] via-[#121216] to-[#0d0d10] border border-white/[0.08] p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-bold text-xs uppercase tracking-wider font-mono">
                FluxoWeby Galerias
              </span>
              <span className="text-xs text-amber-400 font-mono">
                Mais que fotos, grandes histórias!
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">
              Sua fotografia, mais organizada, mais valorizada e mais próxima dos seus clientes.
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Crie galerias personalizadas, compartilhe o acesso com segurança, permita que seus
              clientes selecionem com corações e venda fotos extras instantaneamente com Pix e Mercado Pago.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto shrink-0 flex-wrap">
            <button
              onClick={() => {
                setCarouselTitle('Carrossel Panorâmico');
                setCarouselPhotos([]);
                setIsCarouselModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Film className="w-4 h-4" />
              <span>Carrossel Cinemático 1-Clique</span>
            </button>

            <button
              onClick={() => setIsSmartBookingOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold text-xs flex items-center justify-center gap-1.5 border border-zinc-700 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Agenda Inteligente</span>
            </button>

            <button
              onClick={handleCreateNew}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Nova Galeria</span>
            </button>
          </div>
        </div>

        {/* 4 Steps Flow from the Flyer */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/[0.07]">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-xs">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0 font-mono">
              1
            </div>
            <div className="text-[11px]">
              <p className="font-semibold text-zinc-200">Envie suas fotos</p>
              <p className="text-zinc-400 text-[10px]">Crie suas galerias com facilidade</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-xs">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-bold shrink-0 font-mono">
              2
            </div>
            <div className="text-[11px]">
              <p className="font-semibold text-zinc-200">Compartilhe o acesso</p>
              <p className="text-zinc-400 text-[10px]">Link, WhatsApp e senha segura</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-xs">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs font-bold shrink-0 font-mono">
              3
            </div>
            <div className="text-[11px]">
              <p className="font-semibold text-zinc-200">Cliente seleciona</p>
              <p className="text-zinc-400 text-[10px]">Corações e limite do pacote</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 font-mono">
              4
            </div>
            <div className="text-[11px]">
              <p className="font-semibold text-zinc-200">Venda fotos extras</p>
              <p className="text-zinc-400 text-[10px]">Pix imediato & Mercado Pago</p>
            </div>
          </div>
        </div>

        {/* 300 GB Storage & White-Label Customization Status Bar */}
        <div className="relative z-10 mt-4 pt-4 border-t border-white/[0.07] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* 300 GB Storage */}
          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <HardDrive className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <p className="text-[11px] font-medium text-zinc-300">
                  Armazenamento em Nuvem
                </p>
                <p className="text-[10px] text-zinc-500">142 GB de 300 GB utilizados (47%)</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
              300 GB PRO
            </span>
          </div>

          {/* Remover Marca GOFOTÓGRAFO (White-label) */}
          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="text-[11px] font-medium text-zinc-300">
                  Marca GOFOTÓGRAFO Removida
                </p>
                <p className="text-[10px] text-zinc-500">White-label 100% com sua identidade</p>
              </div>
            </div>
            <button
              onClick={() => setWhiteLabelActive(!whiteLabelActive)}
              className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                whiteLabelActive
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {whiteLabelActive ? 'ATIVO ✓' : 'DESATIVADO'}
            </button>
          </div>

          {/* Proteção por Senha */}
          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <p className="text-[11px] font-medium text-zinc-300">
                  Proteção por Senha
                </p>
                <p className="text-[10px] text-zinc-500">Acesso seguro exclusivo para o cliente</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold">
              SEGURANÇA ATIVA
            </span>
          </div>
        </div>
      </div>

      {/* Tabs & Metrics Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Sub-tabs */}
        <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-[#18181c] rounded-xl border border-zinc-200/80 dark:border-white/[0.08] text-xs">
          <button
            onClick={() => setActiveTab('galleries')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'galleries'
                ? 'bg-white dark:bg-[#222228] text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            Minhas Galerias ({galleries.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-white dark:bg-[#222228] text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <span>Pedidos & Vendas Pix</span>
            {metrics.pendingOrdersCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-white dark:bg-[#222228] text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            Relatório de Faturamento
          </button>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-white/[0.08] flex items-center gap-2">
            <span className="text-zinc-500">Extras Vendidas:</span>
            <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
              {metrics.totalExtrasSold} fotos
            </span>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5" />
            <span className="font-mono font-bold">
              {formatCurrency(metrics.totalRevenueFromExtras)}
            </span>
          </div>
        </div>
      </div>

      {/* Tab 1: Minhas Galerias */}
      {activeTab === 'galleries' && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-[#121215] p-3.5 rounded-2xl border border-zinc-200/80 dark:border-white/[0.08]">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar por título, cliente ou data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-[#18181c] text-xs text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-white/[0.08] focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>

            {/* Categories & Status Dropdowns */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#18181c] text-xs text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/[0.08] cursor-pointer"
              >
                <option value="all">Todas Categorias</option>
                <option value="casamento">Casamentos</option>
                <option value="formatura">Formaturas</option>
                <option value="ensaio">Ensaios</option>
                <option value="aniversario">Aniversários</option>
                <option value="corporativo">Corporativos</option>
                <option value="esportivo">Esportivos</option>
                <option value="escolar">Escolares</option>
                <option value="gestante">Gestante</option>
                <option value="newborn">Newborn</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#18181c] text-xs text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/[0.08] cursor-pointer"
              >
                <option value="all">Todos Status</option>
                <option value="selection">Em Seleção</option>
                <option value="approved">Aprovadas</option>
                <option value="delivered">Entregues</option>
              </select>
            </div>
          </div>

          {/* Galleries Grid (Styled after the laptop screen in the flyer!) */}
          {filteredGalleries.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-[#121215] rounded-2xl border border-zinc-200/80 dark:border-white/[0.08] space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                <ImageIcon className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 font-display">
                Nenhuma galeria encontrada
              </p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Crie sua primeira galeria de clientes para começar a enviar fotos e vender fotos extras.
              </p>
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer"
              >
                + Criar Nova Galeria
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredGalleries.map((gal) => {
                const photos = gal.photos || [];
                const selectedCount = photos.filter((p) => p.selected).length;
                const contractedCount = gal.contractedPhotos;
                const extraCount = Math.max(0, selectedCount - contractedCount);
                const extraAmount = extraCount * (gal.extraPhotoPrice || 35);

                return (
                  <div
                    key={gal.id}
                    className="bg-white dark:bg-[#121215] rounded-2xl border border-zinc-200/80 dark:border-white/[0.08] overflow-hidden shadow-xs hover:border-amber-500/40 dark:hover:border-amber-500/30 transition-all flex flex-col group"
                  >
                    {/* Cover image & Category Pill */}
                    <div className="relative h-48 overflow-hidden bg-zinc-950">
                      <img
                        src={gal.coverImage}
                        alt={gal.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter brightness-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30" />

                      {/* Top Badges */}
                      <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-amber-400 border border-amber-500/30 uppercase tracking-wider font-mono">
                          {gal.category.replace('_', ' ')}
                        </span>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-md ${
                            gal.status === 'approved'
                              ? 'bg-emerald-500/90 text-white'
                              : 'bg-black/60 text-zinc-300 border border-white/10'
                          }`}
                        >
                          {gal.status === 'selection'
                            ? 'Seleção Aberta'
                            : gal.status === 'approved'
                            ? 'Aprovada'
                            : 'Entregue'}
                        </span>
                      </div>

                      {/* Title & Date on Cover */}
                      <div className="absolute bottom-3 inset-x-3 text-white">
                        <h3 className="text-base font-bold truncate drop-shadow-sm font-display">{gal.title}</h3>
                        <p className="text-xs text-zinc-300 drop-shadow-xs">
                          {gal.clientName} · {gal.date}
                        </p>
                      </div>
                    </div>

                    {/* Gallery Body Metrics */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      {/* Selection Progress & Extra badge */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500 dark:text-zinc-400">Seleção de Fotos:</span>
                          <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                            {selectedCount} de {contractedCount} inclusas
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-zinc-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              selectedCount >= contractedCount ? 'bg-amber-500' : 'bg-zinc-400'
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round((selectedCount / (contractedCount || 1)) * 100)
                              )}%`,
                            }}
                          />
                        </div>

                        {/* Extra Photos Callout if exceeds */}
                        {extraCount > 0 ? (
                          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs text-amber-700 dark:text-amber-400">
                            <span className="flex items-center gap-1 font-medium">
                              <ShoppingBag className="w-3.5 h-3.5" />
                              +{extraCount} extras selecionadas
                            </span>
                            <span className="font-mono font-bold">
                              {formatCurrency(extraAmount)}
                            </span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                            <span>Total na galeria: {photos.length} fotos</span>
                            {gal.accessCode && <span>· 🔑 Senha ativa</span>}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="pt-2 border-t border-zinc-100 dark:border-white/[0.06] space-y-2">
                        {/* Primary Client Portal button */}
                        <button
                          onClick={() => handleOpenPortal(gal)}
                          className="w-full py-2.5 px-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Abrir Área do Cliente (Portal)</span>
                        </button>

                        {/* 1-Click Cinematic Carousel for Instagram */}
                        <button
                          onClick={() => {
                            setCarouselTitle(gal.title);
                            setCarouselPhotos(
                              gal.photos && gal.photos.length > 0
                                ? gal.photos.map((p) => p.url)
                                : [gal.coverImage]
                            );
                            setIsCarouselModalOpen(true);
                          }}
                          className="w-full py-1.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 border border-rose-500/20 text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Film className="w-3.5 h-3.5" />
                          <span>Criar Carrossel Cinemático (Feed)</span>
                        </button>

                        {/* Secondary utility buttons */}
                        <div className="grid grid-cols-3 gap-1.5">
                          <button
                            onClick={() => handleOpenShare(gal)}
                            className="py-1.5 px-2 rounded-xl bg-zinc-100 dark:bg-white/[0.05] hover:bg-zinc-200 dark:hover:bg-white/[0.08] text-zinc-700 dark:text-zinc-300 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer border border-transparent dark:border-white/[0.04]"
                            title="Compartilhar link e WhatsApp"
                          >
                            <Share2 className="w-3 h-3" />
                            <span>Enviar</span>
                          </button>

                          <button
                            onClick={() => handleOpenCheckout(gal)}
                            className="py-1.5 px-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer border border-emerald-500/20"
                            title="Checkout de Fotos Extras Pix"
                          >
                            <QrCode className="w-3 h-3" />
                            <span>Vender Pix</span>
                          </button>

                          <button
                            onClick={() => handleEdit(gal)}
                            className="py-1.5 px-2 rounded-xl bg-zinc-100 dark:bg-white/[0.05] hover:bg-zinc-200 dark:hover:bg-white/[0.08] text-zinc-700 dark:text-zinc-300 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer border border-transparent dark:border-white/[0.04]"
                            title="Editar configurações"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Editar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Pedidos & Vendas Pix */}
      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-[#121215] rounded-2xl border border-zinc-200/80 dark:border-white/[0.08] p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-display">
                Pedidos de Fotos Extras
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Histórico de excedentes selecionados e pagamentos via Pix / Mercado Pago
              </p>
            </div>

            <div className="text-xs text-zinc-500 font-mono">
              Total de pedidos: {allOrders.length}
            </div>
          </div>

          {allOrders.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 dark:text-zinc-600 text-xs border border-dashed border-zinc-200 dark:border-white/[0.06] rounded-xl">
              Nenhum pedido de fotos extras registrado até o momento.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-white/[0.06] text-zinc-500 dark:text-zinc-400 font-mono text-[10px] uppercase">
                    <th className="pb-3 font-semibold">Data</th>
                    <th className="pb-3 font-semibold">Cliente</th>
                    <th className="pb-3 font-semibold">Galeria</th>
                    <th className="pb-3 font-semibold">Extras</th>
                    <th className="pb-3 font-semibold">Valor</th>
                    <th className="pb-3 font-semibold">Método</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.04]">
                  {allOrders.map(({ order, gallery }) => (
                    <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02]">
                      <td className="py-3 font-mono text-zinc-500">{order.createdAt}</td>
                      <td className="py-3 font-medium text-zinc-900 dark:text-zinc-100">
                        {order.clientName}
                      </td>
                      <td className="py-3 text-zinc-600 dark:text-zinc-400">{gallery.title}</td>
                      <td className="py-3 font-mono font-semibold text-amber-600 dark:text-amber-400">
                        +{order.extraPhotosCount} fotos
                      </td>
                      <td className="py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="py-3 uppercase text-[10px] font-mono text-zinc-500">
                        {order.paymentMethod}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            order.paymentStatus === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {order.paymentStatus === 'paid' ? 'Pago (Liberado)' : 'Pendente Pix'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {order.paymentStatus !== 'paid' ? (
                          <button
                            onClick={() => approveGalleryOrder(gallery.id, order.id)}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold cursor-pointer"
                          >
                            Aprovar Pix
                          </button>
                        ) : (
                          <span className="text-[11px] text-zinc-400 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            Integrado ao Caixa
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Relatório de Faturamento */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-white/[0.08] space-y-1">
              <span className="text-xs text-zinc-500 font-medium">Receita de Fotos Extras</span>
              <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {formatCurrency(metrics.totalRevenueFromExtras)}
              </p>
              <p className="text-[11px] text-zinc-400">Lucro 100% adicional sobre os pacotes</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-white/[0.08] space-y-1">
              <span className="text-xs text-zinc-500 font-medium">Volume de Extras Vendidas</span>
              <p className="text-2xl font-bold font-mono text-amber-500">
                {metrics.totalExtrasSold} fotos
              </p>
              <p className="text-[11px] text-zinc-400">
                Média de{' '}
                {galleries.length > 0
                  ? (metrics.totalExtrasSold / galleries.length).toFixed(1)
                  : 0}{' '}
                extras por galeria
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-white/[0.08] space-y-1">
              <span className="text-xs text-zinc-500 font-medium">Ticket Médio por Venda Extra</span>
              <p className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
                {formatCurrency(
                  allOrders.filter((o) => o.order.paymentStatus === 'paid').length > 0
                    ? metrics.totalRevenueFromExtras /
                        allOrders.filter((o) => o.order.paymentStatus === 'paid').length
                    : 0
                )}
              </p>
              <p className="text-[11px] text-zinc-400">Via Pix e Mercado Pago</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-white/[0.08] space-y-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-display">
              Vantagens do FluxoWeby Galerias
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.05]">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 block mb-1">
                  📸 Valorização do seu Trabalho
                </span>
                Apresente suas fotos em um portal limpo, sem distrações, que encanta noivos e formandos.
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.05]">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 block mb-1">
                  ⚡ Upsell Automático com Pix
                </span>
                O cliente seleciona mais fotos do que o pacote e pode pagar imediatamente para liberar o download.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <GalleryFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        galleryToEdit={galleryToEdit}
      />

      <GalleryShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        gallery={galleryToShare}
        onOpenPortal={handleOpenPortal}
      />

      <GalleryCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        gallery={galleryForCheckout}
      />

      <ClientGalleryPortalModal
        isOpen={isPortalModalOpen}
        onClose={() => setIsPortalModalOpen(false)}
        gallery={galleryForPortal}
        onOpenCheckout={handleOpenCheckout}
        onOpenShare={handleOpenShare}
      />

      {/* Cinematic Carousel Studio Modal */}
      <CinematicCarouselModal
        isOpen={isCarouselModalOpen}
        onClose={() => setIsCarouselModalOpen(false)}
        defaultTitle={carouselTitle}
        defaultPhotos={carouselPhotos}
      />

      {/* Smart Booking Modal */}
      <SmartBookingModal
        isOpen={isSmartBookingOpen}
        onClose={() => setIsSmartBookingOpen(false)}
      />
    </div>
  );
};
