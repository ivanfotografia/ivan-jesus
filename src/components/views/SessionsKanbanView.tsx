import React, { useState } from 'react';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Calendar,
  MapPin,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  FileText,
  Camera,
  MessageCircle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import { PhotoSession, SessionCategory, SessionStage } from '../../types';

interface SessionsKanbanViewProps {
  onOpenNewSessionModal: (defaultStage?: SessionStage) => void;
  onEditSession: (session: PhotoSession) => void;
  onOpenContractModal: (sessionId: string) => void;
}

export const SessionsKanbanView: React.FC<SessionsKanbanViewProps> = ({
  onOpenNewSessionModal,
  onEditSession,
  onOpenContractModal,
}) => {
  const {
    sessions,
    moveSessionStage,
    formatCurrency,
    getClientById,
  } = useWork();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const columns: { id: SessionStage; label: string; count: number; totalValue: number }[] = [
    {
      id: 'agendado',
      label: '1. Agendado & Briefing',
      count: sessions.filter((s) => s.stage === 'agendado').length,
      totalValue: sessions
        .filter((s) => s.stage === 'agendado')
        .reduce((sum, s) => sum + s.packagePrice, 0),
    },
    {
      id: 'sessao_feita',
      label: '2. Sessão Feita & Seleção',
      count: sessions.filter((s) => s.stage === 'sessao_feita').length,
      totalValue: sessions
        .filter((s) => s.stage === 'sessao_feita')
        .reduce((sum, s) => sum + s.packagePrice, 0),
    },
    {
      id: 'edicao',
      label: '3. Tratamento & Edição',
      count: sessions.filter((s) => s.stage === 'edicao').length,
      totalValue: sessions
        .filter((s) => s.stage === 'edicao')
        .reduce((sum, s) => sum + s.packagePrice, 0),
    },
    {
      id: 'entregue',
      label: '4. Galeria Entregue',
      count: sessions.filter((s) => s.stage === 'entregue').length,
      totalValue: sessions
        .filter((s) => s.stage === 'entregue')
        .reduce((sum, s) => sum + s.packagePrice, 0),
    },
  ];

  const categoryLabels: Record<SessionCategory, string> = {
    casamento: 'Casamento',
    ensaio_casal: 'Pré-Wedding / Casal',
    retrato_corporativo: 'Retrato Corporativo',
    familia_gestante: 'Gestante & Família',
    moda_editorial: 'Moda / Editorial',
    evento_aniversario: 'Evento & Aniversário',
    gastronomia: 'Gastronomia',
  };

  const filteredSessions = sessions.filter((session) => {
    const client = getClientById(session.clientId);
    const matchesSearch =
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client && client.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (client && client.company && client.company.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      categoryFilter === 'all' || session.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const getNextStage = (current: SessionStage): SessionStage | null => {
    if (current === 'agendado') return 'sessao_feita';
    if (current === 'sessao_feita') return 'edicao';
    if (current === 'edicao') return 'entregue';
    return null;
  };

  const getPrevStage = (current: SessionStage): SessionStage | null => {
    if (current === 'entregue') return 'edicao';
    if (current === 'edicao') return 'sessao_feita';
    if (current === 'sessao_feita') return 'agendado';
    return null;
  };

  const getWhatsAppLink = (phone: string, clientName: string, sessionTitle: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const text = encodeURIComponent(
      `Olá ${clientName}! Aqui é o Ivan do Lumina Studio Fotografia. Passando para alinhar os detalhes da sua sessão: "${sessionTitle}".`
    );
    return `https://wa.me/${phoneWithCountry}?text=${text}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200/80 dark:border-white/[0.07] transition-colors">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-display">
            Fluxo de Ensaios & Casamentos
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Pipeline fotográfico completo: do briefing inicial e dia do ensaio à bancada de edição e entrega na nuvem.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center p-1 bg-zinc-100 dark:bg-[#18181c] rounded-xl border border-zinc-200/80 dark:border-white/[0.08]">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-[#222228] text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-[#222228] text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Tabela</span>
            </button>
          </div>

          <button
            onClick={() => onOpenNewSessionModal('agendado')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Novo Trabalho</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-white/[0.08] rounded-2xl flex flex-wrap items-center gap-3 shadow-2xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, noivos, local, ensaio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 dark:bg-[#18181c] border border-zinc-200 dark:border-white/[0.08] rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-500 dark:text-zinc-400">Categoria:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs bg-white dark:bg-[#18181c] text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
          >
            <option value="all">Todas as Categorias</option>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* View: KANBAN PIPELINE */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {columns.map((col) => {
            const colSessions = filteredSessions.filter((s) => s.stage === col.id);

            return (
              <div
                key={col.id}
                className="bg-zinc-100/70 dark:bg-[#101013] border border-zinc-200/80 dark:border-white/[0.06] rounded-2xl p-3.5 min-h-[560px] flex flex-col transition-colors"
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-white/[0.06]">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 font-mono">
                        {col.label}
                      </h3>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-white/[0.08] text-zinc-700 dark:text-zinc-300 tabular-nums">
                        {colSessions.length}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 mt-1">
                      Subtotal: {formatCurrency(col.totalValue)}
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenNewSessionModal(col.id)}
                    className="text-zinc-500 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                    title={`Adicionar em ${col.label}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Session Cards */}
                <div className="space-y-3 pt-3 flex-1 overflow-y-auto">
                  {colSessions.length === 0 ? (
                    <div className="text-center py-16 text-xs text-zinc-400 dark:text-zinc-600 border border-dashed border-zinc-200 dark:border-white/[0.08] rounded-xl">
                      Nenhum trabalho nesta etapa
                    </div>
                  ) : (
                    colSessions.map((session) => {
                      const client = getClientById(session.clientId);
                      const next = getNextStage(session.stage);
                      const prev = getPrevStage(session.stage);
                      const totalPhotos = session.selectedPhotos || session.contractedPhotos;
                      const progressPct =
                        totalPhotos > 0
                          ? Math.min(100, Math.round((session.editedPhotos / totalPhotos) * 100))
                          : 0;

                      return (
                        <div
                          key={session.id}
                          className="p-4 bg-white dark:bg-[#151518] border border-zinc-200/90 dark:border-white/[0.07] rounded-xl shadow-xs hover:border-amber-500/40 dark:hover:border-amber-500/30 transition-all flex flex-col justify-between group"
                        >
                          <div>
                            {/* Category Kicker */}
                            <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 mb-1.5">
                              <span className="font-mono text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                                {categoryLabels[session.category]}
                              </span>
                              <span className="font-mono tabular-nums font-semibold text-zinc-900 dark:text-zinc-100">
                                {formatCurrency(session.packagePrice)}
                              </span>
                            </div>

                            {/* Title */}
                            <button
                              onClick={() => onEditSession(session)}
                              className="text-left w-full text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:text-amber-500 dark:hover:text-amber-400 transition-colors leading-snug cursor-pointer font-display"
                            >
                              {session.title}
                            </button>

                            {/* Client & Date & Location */}
                            <div className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="truncate text-zinc-700 dark:text-zinc-300 font-medium">
                                  {client?.name || 'Cliente'}
                                </span>
                                {client?.phone && (
                                  <a
                                    href={getWhatsAppLink(client.phone, client.name, session.title)}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Enviar mensagem via WhatsApp"
                                    className="p-1 rounded text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                              <div className="flex items-center gap-1 font-mono text-[10px]">
                                <Calendar className="w-3 h-3 text-zinc-400" />
                                <span>{session.sessionDate}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[11px]">
                                <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                                <span className="truncate">{session.location}</span>
                              </div>
                            </div>

                            {/* Photos Progress Bar in Editing Stage */}
                            {(session.stage === 'edicao' || session.editedPhotos > 0) && (
                              <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-white/[0.05]">
                                <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 font-mono mb-1">
                                  <span>Tratamento</span>
                                  <span className="tabular-nums">
                                    {session.editedPhotos}/{totalPhotos} fotos ({progressPct}%)
                                  </span>
                                </div>
                                <div className="w-full bg-zinc-100 dark:bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="bg-amber-500 dark:bg-amber-400 h-full rounded-full transition-all duration-300"
                                    style={{ width: `${progressPct}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Gallery Link if available */}
                            {session.galleryUrl && (
                              <div className="mt-2.5">
                                <a
                                  href={session.galleryUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                                >
                                  <span>Galeria Pixieset / Weby</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}

                            {/* Extra photos badge */}
                            {session.extraPhotosCount > 0 && (
                              <div className="mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                <span>
                                  +{session.extraPhotosCount} extras (+
                                  {formatCurrency(session.extraPhotosCount * session.extraPhotoPrice)})
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Action row: Stage Move + Contract */}
                          <div className="mt-3.5 pt-3 border-t border-zinc-100 dark:border-white/[0.06] flex items-center justify-between text-[11px]">
                            {prev ? (
                              <button
                                type="button"
                                onClick={() => moveSessionStage(session.id, prev)}
                                title="Voltar etapa"
                                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 inline-flex items-center gap-0.5 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/[0.06] cursor-pointer"
                              >
                                <ArrowLeft className="w-3 h-3" /> Voltar
                              </button>
                            ) : (
                              <span />
                            )}

                            <button
                              type="button"
                              onClick={() => onOpenContractModal(session.id)}
                              className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 inline-flex items-center gap-1 hover:underline cursor-pointer"
                            >
                              <FileText className="w-3 h-3" /> Contrato
                            </button>

                            {next && (
                              <button
                                type="button"
                                onClick={() => moveSessionStage(session.id, next)}
                                title="Avançar etapa"
                                className="font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-0.5 p-1 rounded-lg hover:bg-amber-500/10 cursor-pointer"
                              >
                                Avançar <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* View: TABLE LIST */
        <div className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-[#18181c] border-b border-zinc-200 dark:border-white/[0.06] text-zinc-500 dark:text-zinc-400 font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Ensaio / Evento</th>
                  <th className="py-3.5 px-4">Cliente / Contato</th>
                  <th className="py-3.5 px-4">Data & Horário</th>
                  <th className="py-3.5 px-4">Local</th>
                  <th className="py-3.5 px-4">Etapa</th>
                  <th className="py-3.5 px-4">Valor Pacote</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.04] text-zinc-700 dark:text-zinc-300">
                {filteredSessions.map((session) => {
                  const client = getClientById(session.clientId);
                  return (
                    <tr
                      key={session.id}
                      className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => onEditSession(session)}
                          className="font-bold text-zinc-900 dark:text-zinc-100 hover:text-amber-500 dark:hover:text-amber-400 text-left cursor-pointer font-display"
                        >
                          {session.title}
                        </button>
                        <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                          {categoryLabels[session.category]}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-zinc-800 dark:text-zinc-200">
                          {client?.name || '-'}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono">{client?.phone}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] whitespace-nowrap">
                        {session.sessionDate} às {session.sessionTime}
                      </td>
                      <td className="py-3.5 px-4 truncate max-w-xs">{session.location}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[10px] uppercase font-semibold text-zinc-600 dark:text-zinc-300">
                          {session.stage}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                        {formatCurrency(session.packagePrice)}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-3 whitespace-nowrap">
                        <button
                          onClick={() => onOpenContractModal(session.id)}
                          className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs hover:underline cursor-pointer"
                        >
                          Contrato
                        </button>
                        <button
                          onClick={() => onEditSession(session)}
                          className="text-amber-600 dark:text-amber-400 font-semibold hover:underline text-xs cursor-pointer"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
