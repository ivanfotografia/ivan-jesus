import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckSquare,
  ClipboardList,
  FileQuestion,
  Users,
  BellRing,
  Package,
  Plus,
  Check,
  Clock,
  ExternalLink,
  Download,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Shield,
  Send,
  Trash2,
  Edit2,
  Camera,
  Globe,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import { ManagementTask, TeamRole, TeamPermission, SessionCategory } from '../../types';
import { SmartBookingModal } from '../modals/SmartBookingModal';

export const ManagementView: React.FC = () => {
  const {
    sessions,
    tasks,
    checklistPresets,
    briefingForms,
    briefingSubmissions,
    teamMembers,
    autoReminders,
    gear,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompleted,
    togglePresetItem,
    addTeamMember,
    deleteTeamMember,
    toggleAutoReminder,
    formatCurrency,
    settings,
  } = useWork();

  const [activeSubTab, setActiveSubTab] = useState<
    'calendar' | 'tasks' | 'checklists' | 'briefings' | 'team' | 'reminders' | 'inventory'
  >('calendar');

  const [isSmartBookingOpen, setIsSmartBookingOpen] = useState(false);

  // Task creation state
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskStage, setNewTaskStage] = useState<any>('pre_producao');
  const [newTaskDueDate, setNewTaskDueDate] = useState('2026-10-15');
  const [newTaskPriority, setNewTaskPriority] = useState<any>('normal');
  const [newTaskSessionId, setNewTaskSessionId] = useState(sessions[0]?.id || '');

  // Team member creation state
  const [isNewTeamOpen, setIsNewTeamOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamRole, setTeamRole] = useState<TeamRole>('segundo_fotografo');
  const [teamEmail, setTeamEmail] = useState('');
  const [teamPhone, setTeamPhone] = useState('');
  const [teamDailyRate, setTeamDailyRate] = useState(500);
  const [teamPermission, setTeamPermission] = useState<TeamPermission>('editor');

  // Feedback toast
  const [feedback, setFeedback] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  // Google Calendar .ics export
  const handleExportIcs = () => {
    let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//FotoGestor Pro//Agenda Estúdio//PT\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\nX-WR-CALNAME:FotoGestor Agenda\n`;

    sessions.forEach((s) => {
      const dateClean = s.sessionDate.replace(/-/g, '');
      const timeClean = (s.sessionTime || '14:00').replace(':', '') + '00';
      icsContent += `BEGIN:VEVENT\nSUMMARY:${s.title} (${s.category})\nDESCRIPTION:Ensaio agendado pelo FotoGestor. Pacote: R$ ${s.packagePrice}\nLOCATION:${s.location || 'Estúdio'}\nDTSTART:${dateClean}T${timeClean}\nDTEND:${dateClean}T${Number(timeClean) + 20000}\nSTATUS:CONFIRMED\nEND:VEVENT\n`;
    });

    icsContent += `END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fotogestor_agenda_${new Date().toISOString().substring(0, 10)}.ics`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('✓ Arquivo de agenda .ics baixado! Pronto para importar no Google Agenda ou Apple Calendar.');
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const matchedSession = sessions.find((s) => s.id === newTaskSessionId);

    addTask({
      title: newTaskTitle.trim(),
      stage: newTaskStage,
      dueDate: newTaskDueDate,
      priority: newTaskPriority,
      completed: false,
      sessionId: matchedSession?.id,
      sessionTitle: matchedSession?.title,
      assignedMemberName: settings.photographerName || 'Ivan Silva',
    });

    setIsNewTaskOpen(false);
    setNewTaskTitle('');
    showToast('✓ Tarefa adicionada ao quadro operacional!');
  };

  const handleCreateTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !teamEmail.trim()) return;

    addTeamMember({
      name: teamName.trim(),
      role: teamRole,
      email: teamEmail.trim(),
      phone: teamPhone.trim() || '(11) 98888-0000',
      dailyRate: Number(teamDailyRate || 0),
      permission: teamPermission,
      active: true,
    });

    setIsNewTeamOpen(false);
    setTeamName('');
    setTeamEmail('');
    showToast('✓ Membro da equipe cadastrado com sucesso!');
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-semibold rounded-xl shadow-2xl border border-amber-500/30 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold">
              Gestão & Operações
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-display mt-1">
            Gestão Operacional do Estúdio
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Google Agenda integrado, tarefas do pós-produção, checklists de equipamentos, formulários de briefing, equipe com permissões e lembretes automáticos.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {activeSubTab === 'calendar' && (
            <>
              <button
                onClick={() => setIsSmartBookingOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <Globe className="w-4 h-4" />
                <span>Link de Agendamento Inteligente</span>
              </button>

              <button
                onClick={handleExportIcs}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100 bg-white dark:bg-[#18181c] border border-zinc-200 dark:border-white/[0.08] rounded-xl hover:bg-zinc-50 dark:hover:bg-white/[0.04] transition-all shadow-2xs cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-500" />
                <span>Sincronizar (.ics / Google Calendar)</span>
              </button>
            </>
          )}

          {activeSubTab === 'tasks' && (
            <button
              onClick={() => setIsNewTaskOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Tarefa</span>
            </button>
          )}

          {activeSubTab === 'team' && (
            <button
              onClick={() => setIsNewTeamOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Convidar Membro</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 border-b border-zinc-200 dark:border-white/[0.07] pb-px overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('calendar')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeSubTab === 'calendar'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Google Agenda</span>
        </button>

        <button
          onClick={() => setActiveSubTab('tasks')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeSubTab === 'tasks'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Trabalhos & Tarefas</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            {tasks.filter((t) => !t.completed).length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('checklists')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeSubTab === 'checklists'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Materiais & Checklists</span>
        </button>

        <button
          onClick={() => setActiveSubTab('briefings')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeSubTab === 'briefings'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <FileQuestion className="w-4 h-4" />
          <span>Formulários Sob Medida</span>
        </button>

        <button
          onClick={() => setActiveSubTab('team')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeSubTab === 'team'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Equipe & Permissões</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            {teamMembers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('reminders')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeSubTab === 'reminders'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <BellRing className="w-4 h-4" />
          <span>Lembretes Automáticos</span>
        </button>

        <button
          onClick={() => setActiveSubTab('inventory')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeSubTab === 'inventory'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Inventário do Estúdio</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            {gear.length}
          </span>
        </button>
      </div>

      {/* 1. GOOGLE AGENDA INTEGRADA */}
      {activeSubTab === 'calendar' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Sincronização Bidirecional com Google Agenda
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Adicione seus ensaios e prazos de entrega diretamente ao seu Google Agenda pessoal ou da equipe com links instantâneos.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportIcs}
                className="px-3.5 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Calendário (.ics)</span>
              </button>
            </div>
          </div>

          {/* Agenda Grid List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sessions.map((s) => {
              const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                s.title
              )}&dates=${s.sessionDate.replace(/-/g, '')}T${(s.sessionTime || '14:00').replace(':', '')}00Z/${s.sessionDate.replace(
                /-/g,
                ''
              )}T${(s.sessionTime || '16:00').replace(':', '')}00Z&details=${encodeURIComponent(
                `Ensaio fotográfico no valor de ${formatCurrency(s.packagePrice)}. Local: ${s.location}`
              )}&location=${encodeURIComponent(s.location || '')}`;

              return (
                <div
                  key={s.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.07] hover:border-amber-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-2">
                      <span className="flex items-center gap-1 text-amber-500 font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        {s.sessionDate} às {s.sessionTime || '14:00'}
                      </span>
                      <span className="uppercase">{s.category.replace('_', ' ')}</span>
                    </div>

                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-display">
                      {s.title}
                    </h4>

                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 space-y-1">
                      <div>📍 Local: {s.location || 'A definir'}</div>
                      <div>💰 Valor: {formatCurrency(s.packagePrice)}</div>
                      <div>📸 {s.contractedPhotos} fotos contratadas</div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-white/[0.06] flex items-center justify-between">
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                        s.stage === 'entregue'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : s.stage === 'edicao'
                          ? 'bg-purple-500/10 text-purple-400'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}
                    >
                      {s.stage.replace('_', ' ')}
                    </span>

                    <a
                      href={googleCalendarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-white/[0.06] hover:bg-amber-500 hover:text-zinc-950 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>Abrir no Google Calendar</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. TRABALHOS & TAREFAS */}
      {activeSubTab === 'tasks' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[
              { id: 'pre_producao', label: 'Pré-Produção', color: 'text-amber-500' },
              { id: 'backup_culling', label: 'Backup & Culling', color: 'text-sky-500' },
              { id: 'edicao', label: 'Edição & Retoque', color: 'text-purple-500' },
              { id: 'diagramacao', label: 'Diagramação & Entrega', color: 'text-emerald-500' },
            ].map((col) => {
              const colTasks = tasks.filter((t) => t.stage === col.id);
              return (
                <div key={col.id} className="p-4 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.07] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-white/[0.06]">
                    <span className={`text-xs font-bold uppercase font-mono ${col.color}`}>
                      {col.label}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {colTasks.length === 0 ? (
                      <div className="py-6 text-center text-xs text-zinc-400">
                        Nenhuma tarefa nesta etapa
                      </div>
                    ) : (
                      colTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`p-3 rounded-xl border transition-all ${
                            task.completed
                              ? 'bg-zinc-50 dark:bg-zinc-900/30 border-zinc-200 dark:border-white/[0.04] opacity-60'
                              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/[0.08] shadow-2xs'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <button
                              onClick={() => toggleTaskCompleted(task.id)}
                              className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                                task.completed
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : 'border-zinc-300 dark:border-zinc-700 hover:border-amber-500'
                              }`}
                            >
                              {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                            </button>

                            <div className="flex-1 space-y-1">
                              <div
                                className={`text-xs font-medium text-zinc-900 dark:text-zinc-100 leading-snug ${
                                  task.completed ? 'line-through text-zinc-400 dark:text-zinc-500' : ''
                                }`}
                              >
                                {task.title}
                              </div>

                              {task.sessionTitle && (
                                <div className="text-[10px] text-zinc-400 truncate">
                                  {task.sessionTitle}
                                </div>
                              )}

                              <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1">
                                <span>Prazo: {task.dueDate}</span>
                                {task.assignedMemberName && (
                                  <span className="font-semibold text-zinc-300">
                                    {task.assignedMemberName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. MATERIAIS & CHECKLISTS DE ENSAIO */}
      {activeSubTab === 'checklists' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.08]">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Conferência Pré-Saída de Equipamentos
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Evite esquecer cartões, baterias reservas ou lentes em casa antes de entrar no carro para o ensaio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {checklistPresets.map((preset) => {
              const totalItems = preset.items.length;
              const checkedItems = preset.items.filter((i) => i.checked).length;
              const pct = Math.round((checkedItems / (totalItems || 1)) * 100);

              return (
                <div
                  key={preset.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.07] space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-mono uppercase text-amber-500 font-semibold">
                        {preset.category.replace('_', ' ')}
                      </span>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-display mt-0.5">
                        {preset.name}
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        {preset.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-bold text-amber-500 font-mono">{pct}%</div>
                      <div className="text-[10px] text-zinc-400">
                        {checkedItems}/{totalItems} itens
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        pct === 100 ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Items list */}
                  <div className="space-y-2">
                    {preset.items.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/[0.04] hover:border-amber-500/30 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={() => togglePresetItem(preset.id, item.id)}
                            className="rounded text-amber-500 focus:ring-amber-400"
                          />
                          <span
                            className={`text-xs ${
                              item.checked ? 'line-through text-zinc-400' : 'text-zinc-800 dark:text-zinc-200'
                            }`}
                          >
                            {item.name}
                          </span>
                        </div>
                        {item.essential && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold">
                            OBRIGATÓRIO
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. FORMULÁRIOS SOB MEDIDA & BRIEFINGS */}
      {activeSubTab === 'briefings' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Questionários de Briefing Pré-Ensaio
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Envie o link para o cliente responder preferências estéticas, músicas, pessoas especiais e locais.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {briefingForms.map((form) => (
              <div
                key={form.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.07] space-y-3"
              >
                <div>
                  <span className="text-[11px] font-mono uppercase text-amber-500 font-semibold">
                    {form.category.replace('_', ' ')}
                  </span>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-display mt-0.5">
                    {form.title}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {form.description}
                  </p>
                </div>

                <div className="space-y-2 py-2">
                  <div className="text-[11px] font-semibold text-zinc-400 uppercase font-mono">
                    Perguntas incluídas ({form.questions.length}):
                  </div>
                  {form.questions.map((q, idx) => (
                    <div key={q.id} className="text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-1.5">
                      <span className="font-mono text-amber-500 font-bold">{idx + 1}.</span>
                      <span>{q.label}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-white/[0.06] flex items-center justify-between">
                  <span className="text-xs text-zinc-400">
                    {briefingSubmissions.filter((s) => s.formId === form.id).length} respostas recebidas
                  </span>
                  <button
                    onClick={() => {
                      const msg = encodeURIComponent(
                        `Olá! Para prepararmos o seu ensaio com todo o cuidado, criamos um questionário de briefing rápido de 3 minutos. Por favor responda quando puder: https://fotogestor.studio/briefing/${form.id}`
                      );
                      const link = document.createElement('a');
                      link.href = `https://wa.me/?text=${msg}`;
                      link.target = '_blank';
                      link.rel = 'noopener noreferrer';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar no WhatsApp</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Submissions Section */}
          {briefingSubmissions.length > 0 && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.07] space-y-3">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-display">
                Últimas Respostas Enviadas por Clientes
              </h4>
              <div className="space-y-3">
                {briefingSubmissions.map((sub) => (
                  <div key={sub.id} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{sub.clientName}</span>
                      <span className="text-zinc-400 font-mono">{sub.submittedAt.substring(0, 10)}</span>
                    </div>
                    <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                      {Object.entries(sub.answers).map(([key, val]) => (
                        <div key={key} className="p-2 rounded-lg bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-white/[0.04]">
                          <div className="font-semibold text-amber-600 dark:text-amber-400 text-[11px]">Resposta:</div>
                          <div className="mt-0.5">{Array.isArray(val) ? val.join(', ') : val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. EQUIPE & PERMISSÕES */}
      {activeSubTab === 'team' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.07] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                        member.permission === 'admin'
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {member.permission === 'admin' ? 'Administrador' : member.permission === 'editor' ? 'Editor' : 'Visualizador'}
                    </span>
                    <button
                      onClick={() => deleteTeamMember(member.id)}
                      className="text-zinc-400 hover:text-rose-500 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                        {member.name[0]}
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{member.name}</h4>
                      <p className="text-xs text-zinc-400 capitalize">{member.role.replace('_', ' ')}</p>
                    </div>
                  </div>

                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-4 space-y-1">
                    <div>📧 {member.email}</div>
                    <div>📱 {member.phone}</div>
                    <div>💰 Cachê diária: {formatCurrency(member.dailyRate)}</div>
                  </div>
                </div>

                <div className="pt-3 mt-4 border-t border-zinc-100 dark:border-white/[0.06] text-[11px] text-zinc-400">
                  {member.notes || 'Membro ativo do estúdio'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. LEMBRETES AUTOMÁTICOS */}
      {activeSubTab === 'reminders' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.08]">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Régua de Comunicação & Lembretes Automáticos
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Notificações programadas para WhatsApp e E-mail. Reduza no-shows e atrasos com orientações enviadas automaticamente.
            </p>
          </div>

          <div className="space-y-3">
            {autoReminders.map((rem) => (
              <div
                key={rem.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.07] flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {rem.title}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase font-bold">
                      {rem.channel}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-white/[0.04] font-mono">
                    "{rem.messageTemplate}"
                  </p>
                </div>

                <div className="flex items-center gap-3 justify-end">
                  <button
                    onClick={() => toggleAutoReminder(rem.id)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      rem.active
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {rem.active ? 'Ativado' : 'Pausado'}
                  </button>

                  <button
                    onClick={() => {
                      const msg = encodeURIComponent(rem.messageTemplate.replace(/\{\{nome\}\}/g, 'Cliente').replace(/\{\{local\}\}/g, 'Estúdio'));
                      const link = document.createElement('a');
                      link.href = `https://wa.me/?text=${msg}`;
                      link.target = '_blank';
                      link.rel = 'noopener noreferrer';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="p-2 text-zinc-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-colors cursor-pointer"
                    title="Testar disparo"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. INVENTÁRIO DO ESTÚDIO */}
      {activeSubTab === 'inventory' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.08]">
              <div className="text-[11px] text-zinc-400 uppercase font-mono">Valor Total do Patrimônio</div>
              <div className="text-xl font-bold text-amber-500 font-mono mt-1">
                {formatCurrency(gear.reduce((sum, g) => sum + (g.estimatedValue || 0), 0))}
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">Segurado e protegido</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.08]">
              <div className="text-[11px] text-emerald-500 uppercase font-mono">Itens Disponíveis</div>
              <div className="text-xl font-bold text-emerald-500 font-mono mt-1">
                {gear.filter((g) => g.status === 'available').length} de {gear.length}
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">Prontos para disparos</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.08]">
              <div className="text-[11px] text-sky-500 uppercase font-mono">Apólices de Seguro</div>
              <div className="text-xl font-bold text-sky-500 font-mono mt-1">Porto Seguro</div>
              <div className="text-xs text-zinc-500 mt-0.5">Cobertura nacional e roubo qualificado</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {gear.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-white/[0.07] space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{item.name}</h4>
                      <span className="text-[10px] font-mono text-zinc-400 capitalize">{item.category}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full ${
                      item.status === 'available'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-amber-500/10 text-amber-500'
                    }`}
                  >
                    {item.status === 'available' ? 'Disponível' : 'Em Uso'}
                  </span>
                </div>

                <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
                  <div>Número de Série: <strong className="text-zinc-300 font-mono">{item.serialNumber || 'SN-PADRAO'}</strong></div>
                  <div>Valor Estimado: <strong className="text-amber-500 font-mono">{formatCurrency(item.estimatedValue || 5000)}</strong></div>
                  {item.nextMaintenanceDate && <div>Próxima Revisão: {item.nextMaintenanceDate}</div>}
                  {item.insuranceCompany && <div>Seguradora: {item.insuranceCompany}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: NOVA TAREFA */}
      {isNewTaskOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#151518] rounded-2xl border border-zinc-200 dark:border-white/[0.1] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-white/[0.08]">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-display">
                Nova Tarefa Operacional
              </h3>
              <button onClick={() => setIsNewTaskOpen(false)} className="text-zinc-400 hover:text-zinc-600 text-lg cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Título da Tarefa
                </label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Ex: Formatar cartões e checar baterias"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.1] text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Etapa do Fluxo
                </label>
                <select
                  value={newTaskStage}
                  onChange={(e) => setNewTaskStage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.1] text-zinc-900 dark:text-zinc-100"
                >
                  <option value="pre_producao">Pré-Produção</option>
                  <option value="backup_culling">Backup & Culling</option>
                  <option value="edicao">Edição & Retoque</option>
                  <option value="diagramacao">Diagramação & Entrega</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Prazo de Conclusão
                </label>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.1] text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-white/[0.08] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewTaskOpen(false)}
                  className="px-4 py-2 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-xl cursor-pointer"
                >
                  Salvar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVO MEMBRO DA EQUIPE */}
      {isNewTeamOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#151518] rounded-2xl border border-zinc-200 dark:border-white/[0.1] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-white/[0.08]">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-display">
                Cadastrar Membro da Equipe
              </h3>
              <button onClick={() => setIsNewTeamOpen(false)} className="text-zinc-400 hover:text-zinc-600 text-lg cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTeamMember} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Ex: Lucas Prado"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.1] text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Função no Estúdio
                </label>
                <select
                  value={teamRole}
                  onChange={(e) => setTeamRole(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.1] text-zinc-900 dark:text-zinc-100"
                >
                  <option value="fotografo_principal">Fotógrafo Titular</option>
                  <option value="segundo_fotografo">Segundo Fotógrafo</option>
                  <option value="assistente">Assistente de Iluminação</option>
                  <option value="editor">Editor & Retocador</option>
                  <option value="comercial">Comercial & Atendimento</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={teamEmail}
                    onChange={(e) => setTeamEmail(e.target.value)}
                    placeholder="lucas@email.com"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.1] text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    WhatsApp / Telefone
                  </label>
                  <input
                    type="text"
                    value={teamPhone}
                    onChange={(e) => setTeamPhone(e.target.value)}
                    placeholder="(11) 98888-0000"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.1] text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Cachê Diária (R$)
                </label>
                <input
                  type="number"
                  value={teamDailyRate}
                  onChange={(e) => setTeamDailyRate(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.1] text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-white/[0.08] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewTeamOpen(false)}
                  className="px-4 py-2 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-xl cursor-pointer"
                >
                  Cadastrar Membro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Smart Booking Modal */}
      <SmartBookingModal
        isOpen={isSmartBookingOpen}
        onClose={() => setIsSmartBookingOpen(false)}
      />
    </div>
  );
};
