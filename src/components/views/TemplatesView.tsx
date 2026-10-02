import React, { useState, useMemo } from 'react';
import {
  FileText,
  Shield,
  MessageSquare,
  Sparkles,
  ClipboardList,
  Mail,
  Film,
  DollarSign,
  Search,
  Copy,
  Check,
  Download,
  Printer,
  ExternalLink,
  Plus,
  Edit3,
  Bookmark,
  Filter,
  CheckCircle2,
  Share2,
  Trash2,
  ArrowRight,
  Eye,
  SlidersHorizontal,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import { ActiveTab } from '../TopBar';
import { PhotographyTemplate, TemplateCategory } from '../../types';
import { INITIAL_TEMPLATES_2026 } from '../../data/templatesData';
import { jsPDF } from 'jspdf';

interface TemplatesViewProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenContract?: (sessionId?: string) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  onNavigateTab,
  onOpenContract,
}) => {
  const { settings, addPackage, addBriefingForm, formatCurrency } = useWork();

  // Templates state: combine initial templates with any user-created custom templates
  const [customTemplates, setCustomTemplates] = useState<PhotographyTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('fotogestor_custom_templates_2026');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const allTemplates = useMemo(() => {
    return [...INITIAL_TEMPLATES_2026, ...customTemplates];
  }, [customTemplates]);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('todos');
  const [selectedNiche, setSelectedNiche] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fillVariables, setFillVariables] = useState<boolean>(true);

  // Active viewing/editing modal state
  const [activeTemplate, setActiveTemplate] = useState<PhotographyTemplate | null>(null);
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Feedback states
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [appliedToast, setAppliedToast] = useState<string | null>(null);

  // New template form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<PhotographyTemplate['category']>('contratos');
  const [newNiche, setNewNiche] = useState('Casamentos');
  const [newDescription, setNewDescription] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');

  // Categories config
  const categoryFilters: {
    id: TemplateCategory;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count: number;
    color: string;
  }[] = [
    {
      id: 'todos',
      label: 'Todos os Modelos',
      icon: Layers,
      count: allTemplates.length,
      color: 'text-zinc-700 dark:text-zinc-200',
    },
    {
      id: 'contratos',
      label: 'Contratos Jurídicos',
      icon: Shield,
      count: allTemplates.filter((t) => t.category === 'contratos').length,
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'propostas',
      label: 'Propostas Comerciais',
      icon: FileText,
      count: allTemplates.filter((t) => t.category === 'propostas').length,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 'whatsapp',
      label: 'Scripts WhatsApp',
      icon: MessageSquare,
      count: allTemplates.filter((t) => t.category === 'whatsapp').length,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      id: 'briefings',
      label: 'Questionários & Briefings',
      icon: ClipboardList,
      count: allTemplates.filter((t) => t.category === 'briefings').length,
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      id: 'carrosseis',
      label: 'Carrosséis Instagram',
      icon: Film,
      count: allTemplates.filter((t) => t.category === 'carrosseis').length,
      color: 'text-rose-600 dark:text-rose-400',
    },
    {
      id: 'emails',
      label: 'E-mails Comerciais',
      icon: Mail,
      count: allTemplates.filter((t) => t.category === 'emails').length,
      color: 'text-amber-600 dark:text-amber-400',
    },
    {
      id: 'precificacao',
      label: 'Tabelas & Precificação',
      icon: DollarSign,
      count: allTemplates.filter((t) => t.category === 'precificacao').length,
      color: 'text-teal-600 dark:text-teal-400',
    },
  ];

  // Niches list
  const availableNiches = useMemo(() => {
    const set = new Set(allTemplates.map((t) => t.niche));
    return ['todos', ...Array.from(set)];
  }, [allTemplates]);

  // Variable replacement utility
  const interpolateTemplate = (content: string): string => {
    if (!fillVariables) return content;

    const today = new Date();
    const formattedDate = today.toLocaleDateString('pt-BR');
    const randomContractNum = `2026/${Math.floor(100 + Math.random() * 900)}`;

    return content
      .replace(/\{\{nome_estudio\}\}/g, settings.studioName || 'Lumina Studio Fotografia')
      .replace(/\{\{nome_fotografo\}\}/g, settings.photographerName || 'Ivan Silva')
      .replace(/\{\{telefone_fotografo\}\}/g, settings.phone || '(11) 98765-4321')
      .replace(/\{\{email_fotografo\}\}/g, settings.email || 'ivanpoc15@gmail.com')
      .replace(/\{\{documento_fiscal\}\}/g, settings.fiscalId || '28.910.456/0001-34')
      .replace(/\{\{chave_pix\}\}/g, settings.pixKey || 'ivanpoc15@gmail.com')
      .replace(/\{\{instagram_fotografo\}\}/g, settings.instagram || '@ivansilva.foto')
      .replace(/\{\{website_estudio\}\}/g, 'https://luminastudio.com.br')
      .replace(/\{\{endereco_estudio\}\}/g, 'Av. Paulista, 1000 - São Paulo/SP')
      .replace(/\{\{numero_contrato\}\}/g, randomContractNum)
      .replace(/\{\{cidade_data\}\}/g, `São Paulo/SP, ${formattedDate}`)
      .replace(/\{\{nome_cliente\}\}/g, 'Mariana Rios')
      .replace(/\{\{documento_cliente\}\}/g, '349.882.108-44')
      .replace(/\{\{telefone_cliente\}\}/g, '(11) 97123-4567')
      .replace(/\{\{email_cliente\}\}/g, 'mari.rios@gmail.com')
      .replace(/\{\{endereco_cliente\}\}/g, 'Rua das Flores, 120 - São Paulo/SP')
      .replace(/\{\{data_evento\}\}/g, '14 de Novembro de 2026')
      .replace(/\{\{local_evento\}\}/g, 'Espaço Jardim da Serra, Mairiporã - SP')
      .replace(/\{\{horario_evento\}\}/g, '16:00')
      .replace(/\{\{quantidade_fotografos\}\}/g, '02 (dois)')
      .replace(/\{\{inclui_drone_ou_detalhes\}\}/g, 'Cobertura com Drone 4K inclusa')
      .replace(/\{\{quantidade_fotos\}\}/g, '450')
      .replace(/\{\{prazo_entrega_dias\}\}/g, '25')
      .replace(/\{\{valor_total\}\}/g, formatCurrency(4900))
      .replace(/\{\{valor_sinal\}\}/g, formatCurrency(1200))
      .replace(/\{\{saldo_restante\}\}/g, formatCurrency(3700))
      .replace(/\{\{tipo_ensaio\}\}/g, 'Ensaio Gestante & Família')
      .replace(/\{\{duracao_horas\}\}/g, '2')
      .replace(/\{\{data_ensaio\}\}/g, '28 de Outubro de 2026')
      .replace(/\{\{horario_ensaio\}\}/g, '16:30 (Golden Hour)')
      .replace(/\{\{local_ensaio\}\}/g, 'Parque Ibirapuera ou Fazenda Histórica')
      .replace(/\{\{preco_foto_extra\}\}/g, formatCurrency(settings.defaultExtraPhotoPrice || 35))
      .replace(/\{\{preco_extra\}\}/g, formatCurrency(settings.defaultExtraPhotoPrice || 35))
      .replace(/\{\{fotos_inclusas\}\}/g, '30')
      .replace(/\{\{link_galeria\}\}/g, 'https://fotogestor.studio/galeria/mariana-felipe')
      .replace(/\{\{codigo_acesso\}\}/g, 'MARI2026')
      .replace(/\{\{nome_empresa\}\}/g, 'Harmonia Saúde & Imagem')
      .replace(/\{\{quantidade_trocas_roupa\}\}/g, '3')
      .replace(/\{\{tipo_servico\}\}/g, 'ensaio fotográfico')
      .replace(/\{\{detalhe_desejo_cliente\}\}/g, 'fotos espontâneas ao pôr do sol')
      .replace(/\{\{mes_evento\}\}/g, 'Novembro')
      .replace(/\{\{max_parcelas\}\}/g, '10')
      .replace(/\{\{preco_pacote_essencial\}\}/g, '590,00')
      .replace(/\{\{nome_segundo_fotografo\}\}/g, 'Lucas Prado')
      .replace(/\{\{cpf_segundo_fotografo\}\}/g, '410.892.331-50')
      .replace(/\{\{cidade_segundo_fotografo\}\}/g, 'São Paulo/SP')
      .replace(/\{\{valor_diaria\}\}/g, formatCurrency(650))
      .replace(/\{\{nome_cerimonialista\}\}/g, 'Patrícia Assis');
  };

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return allTemplates.filter((item) => {
      // Category filter
      if (selectedCategory !== 'todos' && item.category !== selectedCategory) {
        return false;
      }
      // Niche filter
      if (selectedNiche !== 'todos' && item.niche !== selectedNiche) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesNiche = item.niche.toLowerCase().includes(q);
        const matchesTags = item.tags.some((t) => t.toLowerCase().includes(q));
        const matchesContent = item.content.toLowerCase().includes(q);
        return matchesTitle || matchesDesc || matchesNiche || matchesTags || matchesContent;
      }
      return true;
    });
  }, [allTemplates, selectedCategory, selectedNiche, searchQuery]);

  // Actions
  const handleCopyText = (template: PhotographyTemplate) => {
    const textToCopy = interpolateTemplate(template.content);
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDownloadTxt = (template: PhotographyTemplate) => {
    const textToDownload = interpolateTemplate(template.content);
    const element = document.createElement('a');
    const file = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${template.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_2026.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrint = (template: PhotographyTemplate) => {
    const content = interpolateTemplate(template.content);
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Top Brand Accent
    doc.setFillColor(245, 158, 11);
    doc.rect(20, 15, 170, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(24, 24, 27);
    doc.text(template.title.toUpperCase(), 20, 24);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(113, 113, 122);
    doc.text(`${settings.studioName || 'FotoGestor Studio'} · ${new Date().toLocaleDateString('pt-BR')}`, 20, 29);

    doc.setDrawColor(228, 228, 231);
    doc.line(20, 33, 190, 33);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(50, 50, 50);
    const splitLines = doc.splitTextToSize(content, 170);

    let curY = 40;
    for (let i = 0; i < splitLines.length; i++) {
      if (curY > 275) {
        doc.addPage();
        curY = 20;
      }
      doc.text(splitLines[i], 20, curY);
      curY += 4.5;
    }

    doc.save(`${template.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_2026.pdf`);
  };

  // Direct Apply to system modules
  const handleApplyToSystem = (template: PhotographyTemplate) => {
    if (template.category === 'contratos') {
      if (onOpenContract) {
        onOpenContract();
      } else {
        onNavigateTab('proposals');
      }
      showToast(`Modelo carregado para novo contrato!`);
    } else if (template.category === 'propostas') {
      addPackage({
        name: template.title.replace('Proposta Comercial: ', ''),
        category: template.niche === 'Casamentos' ? 'casamento' : 'familia_gestante',
        description: template.description,
        price: template.niche === 'Casamentos' ? 4900 : 890,
        durationHours: template.niche === 'Casamentos' ? 10 : 2,
        deliveredPhotosCount: template.niche === 'Casamentos' ? 450 : 30,
        includedItems: [
          'Tratamento autoral de cores e pele',
          'Galeria web privativa de seleção',
          'Download gratuito em alta resolução',
          'Suporte e alinhamento prévio via WhatsApp',
        ],
        availableAddons: [
          { id: `add-${Date.now()}-1`, name: 'Álbum Panorâmico Luxo', price: 950 },
          { id: `add-${Date.now()}-2`, name: 'Fotos extras por R$ 35/unidade', price: 35 },
        ],
        installmentOptions: 'Até 10x sem juros no cartão ou desconto no Pix',
        isPopular: true,
      });
      showToast(`Pacote adicionado com sucesso ao seu CRM de Vendas!`);
    } else if (template.category === 'whatsapp') {
      onNavigateTab('whatsapp_ext');
      showToast(`Script aberto na Extensão WhatsApp!`);
    } else if (template.category === 'briefings') {
      addBriefingForm({
        category: template.niche === 'Casamentos' ? 'casamento' : 'familia_gestante',
        title: template.title,
        description: template.description,
        questions: [
          {
            id: 'q1',
            label: 'Qual é o estilo fotográfico preferido de vocês?',
            type: 'select',
            options: ['Espontâneo', 'Editorial Romântico', 'Clássico', 'Misto'],
            required: true,
          },
          {
            id: 'q2',
            label: 'Pessoas prioritárias ou momentos indispensáveis no cronograma:',
            type: 'textarea',
            required: true,
          },
        ],
      });
      showToast(`Formulário de Briefing cadastrado na Gestão Operacional!`);
    } else {
      handleCopyText(template);
      showToast(`Texto copiado para a área de transferência!`);
    }
  };

  const showToast = (msg: string) => {
    setAppliedToast(msg);
    setTimeout(() => setAppliedToast(null), 3500);
  };

  // Create custom template handler
  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newTmpl: PhotographyTemplate = {
      id: `tmpl-custom-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      niche: newNiche,
      description: newDescription.trim() || 'Modelo personalizado criado pelo estúdio.',
      badge: 'Personalizado',
      version: '2026.3',
      tags: newTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      content: newContent,
      isCustom: true,
      wordCount: newContent.split(/\s+/).length,
    };

    const updated = [newTmpl, ...customTemplates];
    setCustomTemplates(updated);
    try {
      localStorage.setItem('fotogestor_custom_templates_2026', JSON.stringify(updated));
    } catch {
      // storage error
    }

    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    setNewContent('');
    setNewTags('');
    showToast('Novo template salvo com sucesso!');
  };

  const handleDeleteCustom = (id: string) => {
    const updated = customTemplates.filter((t) => t.id !== id);
    setCustomTemplates(updated);
    try {
      localStorage.setItem('fotogestor_custom_templates_2026', JSON.stringify(updated));
    } catch {
      // storage error
    }
    if (activeTemplate?.id === id) {
      setActiveTemplate(null);
    }
    showToast('Template removido.');
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {appliedToast && (
        <div className="fixed bottom-12 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 rounded-2xl shadow-2xl border border-zinc-700/50 dark:border-white/20 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
          <span className="text-sm font-medium">{appliedToast}</span>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 text-white p-6 sm:p-8 border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                Edição 2026.3 · Mais Atualizada
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                <Shield className="w-3.5 h-3.5" />
                Cláusula Anti-IA & LGPD
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-zinc-300 border border-white/10">
                Lei 9.610/98 (Direitos Autorais)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display tracking-tight text-white">
              Central de Templates 2026
            </h1>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              Modelos profissionais prontos para uso: Contratos blindados, Propostas comerciais de
              alta conversão, Scripts de vendas para WhatsApp, Questionários de Briefing e
              Carrosséis para Instagram.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Preenchimento dinâmico com dados do seu estúdio</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-amber-400" />
                <span>Importação em 1 clique para CRM e Contratos</span>
              </div>
            </div>
          </div>

          {/* Quick Actions in Header */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition-all shadow-lg hover:shadow-amber-500/20 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Novo Template</span>
            </button>
            <button
              onClick={() => setFillVariables(!fillVariables)}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors cursor-pointer ${
                fillVariables
                  ? 'bg-white/15 text-white border-white/20 hover:bg-white/20'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
              }`}
              title="Preencher automaticamente variáveis como {{nome_fotografo}} com seus dados cadastrados"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>{fillVariables ? 'Dados do Estúdio: Ativados' : 'Exibir Tags Brutas'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Mini-Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-white/[0.06] shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Modelos</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-display">
            {allTemplates.length}
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
            Prontos para copiar & usar
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-white/[0.06] shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Contratos</span>
            <Shield className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-display">
            {allTemplates.filter((t) => t.category === 'contratos').length}
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Com cláusula Anti-IA</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-white/[0.06] shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Scripts Vendas</span>
            <MessageSquare className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-black text-green-600 dark:text-green-400 font-display">
            {allTemplates.filter((t) => t.category === 'whatsapp').length}
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Funil de WhatsApp</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-white/[0.06] shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Propostas CRM</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-display">
            {allTemplates.filter((t) => t.category === 'propostas').length}
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Pacotes ancorados</p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar em todos os templates (ex: casamento, chuva, LGPD, orçamento, golden hour)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 px-1.5 py-0.5"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Niche Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-4 h-4 text-zinc-400 hidden sm:block" />
            <select
              value={selectedNiche}
              onChange={(e) => setSelectedNiche(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all cursor-pointer shadow-sm"
            >
              <option value="todos">Todos os Nichos</option>
              {availableNiches
                .filter((n) => n !== 'todos')
                .map((niche) => (
                  <option key={niche} value={niche}>
                    {niche}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Category Pills Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categoryFilters.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md font-bold'
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-zinc-200/80 dark:border-white/[0.06]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isSelected ? 'text-amber-400 dark:text-amber-600' : cat.color
                  }`}
                />
                <span>{cat.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    isSelected
                      ? 'bg-white/20 dark:bg-zinc-900/20 text-white dark:text-zinc-900'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-white/[0.06]">
          <HelpCircle className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Nenhum template encontrado
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
            Tente remover os filtros ou buscar por outro termo como "casamento", "cláusula" ou
            "whatsapp".
          </p>
          <button
            onClick={() => {
              setSelectedCategory('todos');
              setSelectedNiche('todos');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 transition-colors cursor-pointer"
          >
            Limpar todos os filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => {
            const isCopied = copiedId === template.id;
            return (
              <div
                key={template.id}
                className="group flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/90 dark:border-white/[0.07] hover:border-amber-500/50 dark:hover:border-amber-500/40 shadow-sm hover:shadow-xl transition-all duration-200"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {template.badge || 'Atualizado 2026'}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      v{template.version}
                    </span>
                  </div>

                  {/* Title & Niche */}
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                    {template.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 mb-2.5">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      {template.niche}
                    </span>
                    {template.legalClausesCount && (
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                        {template.legalClausesCount} Cláusulas
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed mb-4">
                    {template.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-zinc-100 dark:border-white/[0.06] flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveTemplate(template)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 text-zinc-900 dark:text-zinc-100 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Visualizar</span>
                  </button>

                  <button
                    onClick={() => handleCopyText(template)}
                    className={`p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isCopied
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                    }`}
                    title="Copiar texto com variáveis preenchidas"
                  >
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleApplyToSystem(template)}
                    className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 transition-all cursor-pointer"
                    title={
                      template.category === 'contratos'
                        ? 'Criar contrato com este modelo'
                        : template.category === 'propostas'
                        ? 'Importar pacote para o CRM'
                        : template.category === 'whatsapp'
                        ? 'Abrir no WhatsApp'
                        : 'Aplicar ao sistema'
                    }
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL TEMPLATE READER & EXPORT MODAL */}
      {activeTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-zinc-200 dark:border-white/[0.08] flex items-start justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {activeTemplate.badge || 'Modelo 2026'}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {activeTemplate.niche} · v{activeTemplate.version}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-display text-zinc-900 dark:text-zinc-100">
                  {activeTemplate.title}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">
                  {activeTemplate.description}
                </p>
              </div>

              <button
                onClick={() => setActiveTemplate(null)}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Variable Interpolation Toggle in Reader */}
            <div className="px-6 py-2.5 bg-amber-500/5 dark:bg-amber-500/10 border-b border-amber-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  Visualizando com:{' '}
                  <strong>
                    {fillVariables
                      ? `Dados de ${settings.studioName}`
                      : 'Marcadores brutos {{tags}}'}
                  </strong>
                </span>
              </div>
              <button
                onClick={() => setFillVariables(!fillVariables)}
                className="text-amber-600 dark:text-amber-400 hover:underline font-semibold cursor-pointer"
              >
                Alternar para {fillVariables ? 'Marcadores Brutos' : 'Dados do Estúdio'}
              </button>
            </div>

            {/* Modal Body / Text Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-8 bg-zinc-50/30 dark:bg-zinc-950/40 font-mono text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap select-text">
              {interpolateTemplate(activeTemplate.content)}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 sm:p-5 border-t border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyText(activeTemplate)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md"
                >
                  {copiedId === activeTemplate.id ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Copiado com Sucesso!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Texto Completo</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDownloadTxt(activeTemplate)}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
                  title="Baixar arquivo de texto .txt"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Baixar TXT</span>
                </button>

                <button
                  onClick={() => handlePrint(activeTemplate)}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
                  title="Imprimir ou Salvar em PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Imprimir / PDF</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {activeTemplate.isCustom && (
                  <button
                    onClick={() => handleDeleteCustom(activeTemplate.id)}
                    className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Excluir este modelo personalizado"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => handleApplyToSystem(activeTemplate)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {activeTemplate.category === 'contratos'
                      ? 'Gerar Contrato com Este Modelo'
                      : activeTemplate.category === 'propostas'
                      ? 'Importar Pacote para o CRM'
                      : activeTemplate.category === 'whatsapp'
                      ? 'Enviar pelo WhatsApp'
                      : 'Aplicar ao Sistema'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW TEMPLATE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-zinc-200 dark:border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold">
                  +
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Criar Novo Template Personalizado
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustom} className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Título do Modelo *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Contrato de Batizado & Primeira Eucaristia 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Categoria
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] text-sm text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="contratos">Contratos Jurídicos</option>
                    <option value="propostas">Propostas Comerciais</option>
                    <option value="whatsapp">Scripts WhatsApp</option>
                    <option value="briefings">Questionários / Briefings</option>
                    <option value="carrosseis">Carrosséis Instagram</option>
                    <option value="emails">E-mails</option>
                    <option value="precificacao">Precificação</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Nicho de Atuação
                  </label>
                  <input
                    type="text"
                    value={newNiche}
                    onChange={(e) => setNewNiche(e.target.value)}
                    placeholder="Ex: Casamentos, Família, Corporativo"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] text-sm text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Breve Descrição
                </label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Ex: Cláusulas específicas para cerimônias religiosas e padrinhos."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] text-sm text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Conteúdo do Template * (Pode usar tags como {'{{nome_cliente}}'},{' '}
                  {'{{nome_fotografo}}'}, {'{{valor_total}}'})
                </label>
                <textarea
                  required
                  rows={8}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Cole aqui o texto completo do contrato, proposta ou mensagem..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Tags (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="Ex: Batizado, Igreja, Família, Fotos Extras"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] text-sm text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-white/[0.08] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition-all shadow-md"
                >
                  Salvar nos Meus Templates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
