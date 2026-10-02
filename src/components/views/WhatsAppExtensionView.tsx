import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Copy,
  Check,
  ExternalLink,
  Users,
  Search,
  Sparkles,
  Phone,
  Calendar,
  DollarSign,
  FileCheck,
  BookOpen,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';

interface WhatsAppExtensionViewProps {
  onNavigateToTemplates?: () => void;
}

export const WhatsAppExtensionView: React.FC<WhatsAppExtensionViewProps> = ({ onNavigateToTemplates }) => {
  const { clients, sessions, proposals, settings, formatCurrency } = useWork();

  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>('orcamento');
  const [customMessage, setCustomMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0];
  const clientSession = sessions.find((s) => s.clientId === selectedClient?.id) || sessions[0];
  const clientProposal = proposals.find((p) => p.clientId === selectedClient?.id) || proposals[0];

  const templates: Record<string, { title: string; template: string }> = {
    orcamento: {
      title: 'Envio de Proposta Comercial',
      template: `Olá, {{nome}}! Tudo bem com você? ✨\n\nFoi um prazer imenso conversar contigo! Preparei uma proposta personalizada e sob medida do ${settings.studioName} para o seu ensaio.\n\nVocê pode conferir todos os detalhes, fotos inclusas e condições no link exclusivo abaixo:\n👉 {{link_proposta}}\n\nQualquer dúvida sobre as datas ou pacotes, estou à sua disposição!`,
    },
    lembrete_ensaio: {
      title: 'Lembrete de Ensaio (3 Dias Antes)',
      template: `Oi, {{nome}}! Passando para lembrar que faltam apenas 3 dias para o nosso ensaio fotográfico no dia {{data_ensaio}} às {{horario}}!\n\n📍 Local confirmado: {{local}}\n\nDicas rápidas: durmam bem, tragam água e venham com roupas confortáveis para vivermos um momento leve e inesquecível.\n\nNos vemos em breve! 📸`,
    },
    galeria_pronta: {
      title: 'Galeria Pronta para Seleção',
      template: `{{nome}}, as suas fotos estão prontas! ✨\n\nFizemos uma seleção incrível e o tratamento de cor já está impecável. Acesse o seu portal para escolher suas fotos favoritas e compartilhar com a família:\n👉 {{link_portal}}\n\nDepois me conta qual foi a sua favorita! 💛`,
    },
    cobranca_pix: {
      title: 'Lembrete Amigável de Pagamento / Sinal',
      template: `Olá, {{nome}}! Tudo bem?\n\nPassando para enviar os dados de quitação da sua reserva no valor de {{valor}}.\n\nChave Pix do estúdio: {{chave_pix}}\n\nAssim que fizer a transferência, é só nos mandar o comprovante por aqui. Muito obrigado!`,
    },
    pos_ensaio: {
      title: 'Agradecimento Pós-Sessão & Feedback',
      template: `Oi, {{nome}}! Queria agradecer de coração pela entrega e carinho na nossa sessão de ontem. Foi maravilhoso fotografar você!\n\nJá estamos no estúdio fazendo o backup dos cartões e descarregando cada detalhe. Em breve envio as primeiras prévias! ✨`,
    },
  };

  const getPopulatedMessage = (templateString: string) => {
    if (!selectedClient) return templateString;
    return templateString
      .replace(/\{\{nome\}\}/g, selectedClient.name)
      .replace(/\{\{data_ensaio\}\}/g, clientSession?.sessionDate || '14/11/2026')
      .replace(/\{\{horario\}\}/g, clientSession?.sessionTime || '15:00')
      .replace(/\{\{local\}\}/g, clientSession?.location || 'Estúdio')
      .replace(/\{\{valor\}\}/g, formatCurrency(clientProposal?.totalAmount || 2500))
      .replace(/\{\{chave_pix\}\}/g, settings.pixKey || 'ivanpoc15@gmail.com')
      .replace(/\{\{link_proposta\}\}/g, `https://fotogestor.studio/proposta/${clientProposal?.id || 'demo'}`)
      .replace(/\{\{link_portal\}\}/g, `https://fotogestor.studio/portal/${selectedClient.id}`);
  };

  const currentPopulated = getPopulatedMessage(
    customMessage || templates[selectedTemplateKey]?.template || ''
  );

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(currentPopulated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const cleanPhone = (selectedClient?.phone || '').replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const encoded = encodeURIComponent(currentPopulated);
    const link = document.createElement('a');
    link.href = `https://wa.me/${phoneWithCountry}?text=${encoded}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              WhatsApp Studio Pro
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-display mt-1">
            Extensão do WhatsApp para Fotógrafos
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Painel lateral inteligente integrado ao WhatsApp Web. Dispare propostas, contratos, links de galerias e lembretes automáticos com tags dinâmicas em 1 clique.
          </p>
        </div>

        {onNavigateToTemplates && (
          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateToTemplates}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors border border-zinc-200 dark:border-white/[0.08] cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-emerald-500" />
              <span>Ver Todos os Scripts 2026</span>
            </button>
          </div>
        )}
      </div>

      {/* Main WhatsApp Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Contact Selector */}
        <div className="lg:col-span-4 space-y-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.07] space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar cliente ou telefone..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
              {filteredClients.map((client) => {
                const isSelected = client.id === selectedClientId;
                return (
                  <button
                    key={client.id}
                    onClick={() => {
                      setSelectedClientId(client.id);
                      setCustomMessage('');
                    }}
                    className={`w-full p-3 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/10 border border-amber-500/30 text-zinc-900 dark:text-zinc-100'
                        : 'bg-zinc-50 dark:bg-white/[0.03] hover:bg-zinc-100 dark:hover:bg-white/[0.06] border border-transparent text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold leading-tight">{client.name}</div>
                      <div className="text-[11px] text-zinc-400">{client.phone}</div>
                    </div>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Template & Message Composer */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.07] space-y-5">
            {/* Quick Templates Buttons */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Escolha o Modelo de Mensagem Rápida:
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {Object.entries(templates).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedTemplateKey(key);
                      setCustomMessage('');
                    }}
                    className={`px-3 py-1.5 text-xs rounded-xl transition-all cursor-pointer font-medium ${
                      selectedTemplateKey === key
                        ? 'bg-amber-500 text-zinc-950 font-bold shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-white/[0.06]'
                    }`}
                  >
                    {val.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Preview with WhatsApp Styling */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Mensagem Pronta com Variáveis Preenchidas:</span>
                <span className="text-[10px] font-mono text-emerald-500">Destinatário: {selectedClient?.name}</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0b141a] text-zinc-100 border border-white/[0.08] shadow-inner font-sans text-xs whitespace-pre-line leading-relaxed min-h-[180px]">
                {currentPopulated}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-zinc-100 dark:border-white/[0.06] flex items-center justify-between gap-3 flex-wrap">
              <div className="text-[11px] text-zinc-400">
                Tags ativas: <code className="text-amber-500">{'{{nome}}'}</code>,{' '}
                <code className="text-amber-500">{'{{data_ensaio}}'}</code>,{' '}
                <code className="text-amber-500">{'{{link_proposta}}'}</code>,{' '}
                <code className="text-amber-500">{'{{chave_pix}}'}</code>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyMessage}
                  className="px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
                </button>

                <button
                  onClick={handleOpenWhatsApp}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar no WhatsApp Web</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
