import React, { useState } from 'react';
import {
  Plus,
  Search,
  Mail,
  Phone,
  Camera,
  Instagram,
  MessageCircle,
  ExternalLink,
  Wallet,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import { Client, ClientStatus } from '../../types';

interface ClientsViewProps {
  onOpenNewClientModal: () => void;
  onEditClient: (client: Client) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  onOpenNewClientModal,
  onEditClient,
}) => {
  const { clients, sessions, transactions, formatCurrency } = useWork();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const statusLabels: Record<ClientStatus, { text: string; dot: string; textColor: string }> = {
    active: {
      text: 'Cliente Ativo',
      dot: 'bg-emerald-500',
      textColor: 'text-emerald-600 dark:text-emerald-400',
    },
    lead: {
      text: 'Orçamento / Lead',
      dot: 'bg-amber-500',
      textColor: 'text-amber-600 dark:text-amber-400',
    },
    inactive: {
      text: 'Inativo',
      dot: 'bg-zinc-400',
      textColor: 'text-zinc-500 dark:text-zinc-400',
    },
  };

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.document.includes(searchQuery) ||
      (c.instagram && c.instagram.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Calculate high-level CRM stats
  const totalLTV = clients.reduce((acc, client) => {
    const clientBilled = transactions
      .filter((t) => t.clientId === client.id && t.type === 'income' && t.status === 'paid')
      .reduce((tAcc, t) => tAcc + t.amount, 0);
    return acc + clientBilled;
  }, 0);

  const activeCount = clients.filter((c) => c.status === 'active').length;
  const leadCount = clients.filter((c) => c.status === 'lead').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200/80 dark:border-white/[0.07] transition-colors">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-display">
            Carteira de Clientes, Noivos & Famílias
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            CRM do fotógrafo: cadastro completo, histórico de ensaios, documentos para contratos e contato direto via WhatsApp.
          </p>
        </div>

        <button
          onClick={onOpenNewClientModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Cadastrar Cliente</span>
        </button>
      </div>

      {/* CRM Quick Stats Deck */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-white/[0.08] rounded-2xl shadow-xs">
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block">Total na Carteira</span>
          <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1 block">
            {clients.length}
          </span>
          <span className="text-[10px] text-zinc-400">Contatos salvos</span>
        </div>

        <div className="p-4 bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-white/[0.08] rounded-2xl shadow-xs">
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block">Clientes Ativos</span>
          <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
            {activeCount}
          </span>
          <span className="text-[10px] text-zinc-400">Com ensaios contratados</span>
        </div>

        <div className="p-4 bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-white/[0.08] rounded-2xl shadow-xs">
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block">Orçamentos / Leads</span>
          <span className="text-2xl font-bold font-mono text-amber-500 mt-1 block">
            {leadCount}
          </span>
          <span className="text-[10px] text-zinc-400">Em negociação ativa</span>
        </div>

        <div className="p-4 bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-white/[0.08] rounded-2xl shadow-xs">
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block">LTV Total Gerado</span>
          <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1 block">
            {formatCurrency(totalLTV)}
          </span>
          <span className="text-[10px] text-zinc-400">Receita histórica acumulada</span>
        </div>
      </div>

      {/* Filter and search */}
      <div className="p-3.5 bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-white/[0.08] rounded-2xl flex flex-wrap items-center gap-3 shadow-2xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por nome, empresa, e-mail, Instagram ou CPF..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 dark:bg-[#18181c] border border-zinc-200 dark:border-white/[0.08] rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-500 dark:text-zinc-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs bg-white dark:bg-[#18181c] text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
          >
            <option value="all">Todos os Status ({clients.length})</option>
            <option value="active">Clientes Ativos</option>
            <option value="lead">Orçamentos / Leads</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => {
          const clientSessions = sessions.filter((s) => s.clientId === client.id);
          const clientTotalBilled = transactions
            .filter((t) => t.clientId === client.id && t.type === 'income' && t.status === 'paid')
            .reduce((acc, t) => acc + t.amount, 0);

          const cleanPhone = client.phone.replace(/\D/g, '');
          const status = statusLabels[client.status];
          const cleanInsta = client.instagram ? client.instagram.replace('@', '') : '';

          return (
            <div
              key={client.id}
              className="p-5 bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-white/[0.08] rounded-2xl hover:border-zinc-300 dark:hover:border-white/[0.16] transition-all flex flex-col justify-between shadow-2xs group"
            >
              <div>
                {/* Header: Avatar, Name & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-400 font-bold font-mono text-xs flex items-center justify-center shrink-0 border border-amber-500/20">
                      {getInitials(client.name)}
                    </div>
                    <div>
                      <h3
                        onClick={() => onEditClient(client)}
                        className="text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:text-amber-500 dark:hover:text-amber-400 transition-colors cursor-pointer leading-snug font-display"
                      >
                        {client.name}
                      </h3>
                      {client.company && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {client.company}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-medium shrink-0">
                    <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                    <span className={status.textColor}>{status.text}</span>
                  </div>
                </div>

                {client.document && (
                  <p className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 mt-2">
                    CPF/CNPJ: {client.document}
                  </p>
                )}

                {/* Contact and Social Row */}
                <div className="mt-3.5 pt-3.5 border-t border-zinc-100 dark:border-white/[0.05] space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
                  {client.phone && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="font-mono text-[11px]">{client.phone}</span>
                      </div>
                      {cleanPhone && (
                        <a
                          href={`https://wa.me/55${cleanPhone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>
                  )}

                  {client.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="truncate text-[11px] font-mono">{client.email}</span>
                    </div>
                  )}

                  {client.instagram && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Instagram className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                        <span className="text-[11px] text-zinc-700 dark:text-zinc-300 font-medium">
                          {client.instagram}
                        </span>
                      </div>
                      {cleanInsta && (
                        <a
                          href={`https://instagram.com/${cleanInsta}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Perfil</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {client.notes && (
                  <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 italic line-clamp-2">
                    &ldquo;{client.notes}&rdquo;
                  </p>
                )}
              </div>

              {/* Bottom LTV & Sessions Count */}
              <div className="mt-4 pt-3.5 border-t border-zinc-100 dark:border-white/[0.05] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                  <Camera className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono">
                    {clientSessions.length}
                  </span>
                  <span>{clientSessions.length === 1 ? 'ensaio' : 'ensaios'}</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 block font-mono">Total Pago (LTV)</span>
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {formatCurrency(clientTotalBilled)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
