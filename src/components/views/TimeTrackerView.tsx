import React, { useState } from 'react';
import { Play, Pause, Square, Trash2, Clock, CheckCircle2, RotateCcw } from 'lucide-react';
import { useWork } from '../../context/WorkContext';

export const TimeTrackerView: React.FC = () => {
  const {
    timeLogs,
    sessions,
    activeTimer,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopAndSaveTimer,
    resetTimer,
    updateTimerDetails,
    addTimeLog,
    deleteTimeLog,
    formatDuration,
    formatCurrency,
    settings,
    getSessionById,
  } = useWork();

  const [manualDescription, setManualDescription] = useState('');
  const [manualSessionId, setManualSessionId] = useState(sessions[0]?.id || '');
  const [manualActivityType, setManualActivityType] = useState<
    'editing' | 'shooting' | 'culling' | 'meeting'
  >('editing');
  const [manualHours, setManualHours] = useState(2);
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);

  const activityLabels = {
    editing: 'Edição & Retoque (Lightroom/PS)',
    culling: 'Seleção & Descarte (Photo Mechanic)',
    shooting: 'Sessão / Ensaio Fotográfico',
    meeting: 'Reunião de Alinhamento / Briefing',
    travel: 'Deslocamento / Viagem',
  };

  const handleAddManualLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDescription.trim()) return;

    addTimeLog({
      sessionId: manualSessionId || undefined,
      description: manualDescription.trim(),
      date: manualDate,
      durationSeconds: Math.round(manualHours * 3600),
      hourlyRate: settings.defaultHourlyRate,
      activityType: manualActivityType,
    });

    setManualDescription('');
    setManualHours(2);
  };

  const totalSeconds = timeLogs.reduce((acc, l) => acc + l.durationSeconds, 0);
  const totalValue = timeLogs.reduce(
    (acc, l) => acc + (l.durationSeconds / 3600) * l.hourlyRate,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200/80 dark:border-white/[0.07] transition-colors">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-display">
            Controle de Tempo: Edição & Ensaios
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Cronômetro de tratamento de imagens no Lightroom/Photoshop, sessões fotográficas e tempo de seleção no Photo Mechanic.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200/80 dark:border-white/[0.08]">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Custo de Hora Técnica:</span>
          <span className="font-mono font-semibold text-xs text-zinc-900 dark:text-zinc-100 tabular-nums">
            {formatCurrency(settings.defaultHourlyRate)}/h
          </span>
        </div>
      </div>

      {/* Modern Live Timer Card */}
      <div className="p-6 bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-white/[0.08] rounded-2xl shadow-xs space-y-6 transition-colors">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              {activeTimer.running && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                </span>
              )}
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {activeTimer.running
                  ? 'Cronômetro Gravando'
                  : activeTimer.seconds > 0
                  ? 'Cronômetro Pausado'
                  : 'Cronômetro Pronto'}
              </span>
            </div>

            <div className="text-5xl sm:text-6xl font-mono font-bold tracking-tight text-zinc-900 dark:text-zinc-100 tabular-nums mt-1.5">
              {formatDuration(activeTimer.seconds)}
            </div>

            {activeTimer.seconds > 0 && (
              <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-1.5">
                Custo de tempo acumulado:{' '}
                <span className="text-amber-500 font-semibold font-mono">
                  {formatCurrency((activeTimer.seconds / 3600) * settings.defaultHourlyRate)}
                </span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {!activeTimer.running && activeTimer.seconds === 0 && (
              <button
                onClick={() =>
                  startTimer(
                    activeTimer.sessionId,
                    activeTimer.activityType,
                    activeTimer.description || 'Tratamento de cor no Lightroom'
                  )
                }
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-zinc-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current stroke-[2.5]" />
                <span>Iniciar Cronômetro</span>
              </button>
            )}

            {activeTimer.running && (
              <>
                <button
                  onClick={pauseTimer}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.08] rounded-xl hover:bg-zinc-200 dark:hover:bg-white/[0.1] transition-colors cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pausar</span>
                </button>
                <button
                  onClick={stopAndSaveTimer}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-zinc-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Salvar Apontamento</span>
                </button>
              </>
            )}

            {!activeTimer.running && activeTimer.seconds > 0 && (
              <>
                <button
                  onClick={resumeTimer}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Continuar</span>
                </button>
                <button
                  onClick={stopAndSaveTimer}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-zinc-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Salvar</span>
                </button>
                <button
                  onClick={resetTimer}
                  title="Zerar cronômetro sem salvar"
                  className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-white/[0.05] rounded-xl transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Live Timer Metadata Inputs */}
        <div className="pt-4 border-t border-zinc-100 dark:border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Atividade
            </label>
            <select
              value={activeTimer.activityType}
              onChange={(e) =>
                updateTimerDetails({
                  activityType: e.target.value as any,
                })
              }
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-[#18181c] border border-zinc-200 dark:border-white/[0.08] rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none"
            >
              {Object.entries(activityLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Ensaio Relacionado
            </label>
            <select
              value={activeTimer.sessionId}
              onChange={(e) => updateTimerDetails({ sessionId: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-[#18181c] border border-zinc-200 dark:border-white/[0.08] rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none"
            >
              <option value="">Nenhum específico</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Descrição da Tarefa
            </label>
            <input
              type="text"
              placeholder="Ex: Curva de tons e remoção de manchas"
              value={activeTimer.description}
              onChange={(e) => updateTimerDetails({ description: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-[#18181c] border border-zinc-200 dark:border-white/[0.08] rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
        </div>
      </div>

      {/* Manual Time Entry & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Manual Log */}
        <div className="p-5 bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-white/[0.08] rounded-2xl space-y-4 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 font-mono">
            Lançamento Manual de Horas
          </h3>

          <form onSubmit={handleAddManualLog} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Descrição da Produção *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Culling de 1.800 fotos do casamento"
                value={manualDescription}
                onChange={(e) => setManualDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-[#18181c] border border-zinc-200 dark:border-white/[0.08] rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Tempo (Horas)
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  required
                  value={manualHours}
                  onChange={(e) => setManualHours(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs font-mono bg-zinc-50 dark:bg-[#18181c] border border-zinc-200 dark:border-white/[0.08] rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Data
                </label>
                <input
                  type="date"
                  required
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-[#18181c] border border-zinc-200 dark:border-white/[0.08] rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Atividade
              </label>
              <select
                value={manualActivityType}
                onChange={(e) => setManualActivityType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-[#18181c] border border-zinc-200 dark:border-white/[0.08] rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
              >
                {Object.entries(activityLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Ensaio Relacionado
              </label>
              <select
                value={manualSessionId}
                onChange={(e) => setManualSessionId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-[#18181c] border border-zinc-200 dark:border-white/[0.08] rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
              >
                <option value="">Geral / Sem ensaio específico</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2.5 text-xs font-semibold text-zinc-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-pointer mt-2"
            >
              Registrar Horas
            </button>
          </form>
        </div>

        {/* Right Table: Time Logs History */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 font-mono">
              Histórico de Apontamentos ({timeLogs.length})
            </h3>
            <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
              Total: {formatDuration(totalSeconds)} ·{' '}
              <span className="text-zinc-900 dark:text-zinc-100 font-bold">
                {formatCurrency(totalValue)}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-white/[0.02] border-b border-zinc-200/80 dark:border-white/[0.06] text-zinc-500 dark:text-zinc-400 font-mono uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Atividade & Descrição</th>
                    <th className="py-3 px-4">Data</th>
                    <th className="py-3 px-4">Duração</th>
                    <th className="py-3 px-4">Valor</th>
                    <th className="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.04] text-zinc-700 dark:text-zinc-300">
                  {timeLogs.map((log) => {
                    const session = log.sessionId ? getSessionById(log.sessionId) : null;
                    const logValue = (log.durationSeconds / 3600) * log.hourlyRate;

                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-zinc-900 dark:text-zinc-100">
                            {log.description}
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            {activityLabels[log.activityType]}
                            {session && ` · ${session.title}`}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap">
                          {log.date}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap">
                          {formatDuration(log.durationSeconds)}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          {formatCurrency(logValue)}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => deleteTimeLog(log.id)}
                            className="text-zinc-400 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                            title="Excluir apontamento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
