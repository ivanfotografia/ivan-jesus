import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  ActiveTimer,
  Client,
  FinancialTransaction,
  GearItem,
  PhotoSession,
  SessionCategory,
  SessionStage,
  TimeLog,
  UserSettings,
  ClientGallery,
  GalleryPhoto,
  GalleryOrder,
  ProposalPackage,
  SalesProposal,
  LegalContract,
  ClientTestimonial,
  ManagementTask,
  PresetGearChecklist,
  CustomBriefingForm,
  BriefingSubmission,
  TeamMember,
  AutoReminder,
  VideoClass,
  SupportTicket,
  SupportTicketMessage,
} from '../types';
import {
  initialClients,
  initialGear,
  initialSessions,
  initialSettings,
  initialTimeLogs,
  initialTransactions,
  initialGalleries,
  initialPackages,
  initialProposals,
  initialContracts,
  initialTestimonials,
  initialTasks,
  initialChecklistPresets,
  initialBriefingForms,
  initialBriefingSubmissions,
  initialTeamMembers,
  initialAutoReminders,
  initialVideoClasses,
  initialSupportTickets,
} from '../data/mockData';

interface WorkContextType {
  sessions: PhotoSession[];
  clients: Client[];
  gear: GearItem[];
  transactions: FinancialTransaction[];
  timeLogs: TimeLog[];
  settings: UserSettings;
  activeTimer: ActiveTimer;
  galleries: ClientGallery[];

  // CRM: Pacotes & Propostas
  packages: ProposalPackage[];
  proposals: SalesProposal[];
  addPackage: (pkg: Omit<ProposalPackage, 'id'>) => void;
  updatePackage: (id: string, pkg: Partial<ProposalPackage>) => void;
  deletePackage: (id: string) => void;
  addProposal: (proposal: Omit<SalesProposal, 'id' | 'createdAt'>) => SalesProposal;
  updateProposal: (id: string, proposal: Partial<SalesProposal>) => void;
  deleteProposal: (id: string) => void;
  approveProposalAndCreateContract: (proposalId: string) => LegalContract | null;

  // Assinaturas Ilimitadas & Contratos
  contracts: LegalContract[];
  addContract: (contract: Omit<LegalContract, 'id' | 'createdAt'>) => LegalContract;
  updateContract: (id: string, contract: Partial<LegalContract>) => void;
  deleteContract: (id: string) => void;
  signContractElectronically: (
    contractId: string,
    signatureData: string,
    signerRole: 'client' | 'photographer'
  ) => void;

  // Central de Depoimentos
  testimonials: ClientTestimonial[];
  addTestimonial: (test: Omit<ClientTestimonial, 'id' | 'date'>) => void;
  updateTestimonial: (id: string, test: Partial<ClientTestimonial>) => void;
  deleteTestimonial: (id: string) => void;

  // Gestão: Tarefas
  tasks: ManagementTask[];
  addTask: (task: Omit<ManagementTask, 'id'>) => void;
  updateTask: (id: string, task: Partial<ManagementTask>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompleted: (taskId: string) => void;

  // Gestão: Presets de Checklist & Checklists de Ensaio
  checklistPresets: PresetGearChecklist[];
  togglePresetItem: (presetId: string, itemId: string) => void;
  addChecklistPreset: (preset: Omit<PresetGearChecklist, 'id'>) => void;

  // Gestão: Formulários e Briefings
  briefingForms: CustomBriefingForm[];
  briefingSubmissions: BriefingSubmission[];
  addBriefingForm: (form: Omit<CustomBriefingForm, 'id'>) => void;
  submitBriefing: (formId: string, clientId: string, clientName: string, answers: Record<string, string | string[]>, sessionId?: string) => void;

  // Gestão: Equipe
  teamMembers: TeamMember[];
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  updateTeamMember: (id: string, member: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;

  // Gestão: Lembretes Automáticos
  autoReminders: AutoReminder[];
  toggleAutoReminder: (id: string) => void;
  updateAutoReminder: (id: string, reminder: Partial<AutoReminder>) => void;

  // Experiência: Aulas em Vídeo
  videoClasses: VideoClass[];
  toggleVideoCompleted: (id: string) => void;

  // Experiência: Suporte VIP
  supportTickets: SupportTicket[];
  addSupportMessage: (ticketId: string, text: string) => void;
  createSupportTicket: (subject: string, category: string, initialMessage: string) => void;

  // Gallery actions (FluxoWeby Galerias)
  addGallery: (gallery: Omit<ClientGallery, 'id' | 'createdAt'>) => void;
  updateGallery: (id: string, gallery: Partial<ClientGallery>) => void;
  deleteGallery: (id: string) => void;
  togglePhotoSelection: (galleryId: string, photoId: string) => void;
  togglePhotoFavorite: (galleryId: string, photoId: string) => void;
  addPhotosToGallery: (galleryId: string, photos: Omit<GalleryPhoto, 'id'>[]) => void;
  removePhotoFromGallery: (galleryId: string, photoId: string) => void;
  createGalleryOrder: (order: Omit<GalleryOrder, 'id' | 'createdAt'>) => GalleryOrder;
  approveGalleryOrder: (galleryId: string, orderId: string) => void;

  // Session actions
  addSession: (session: Omit<PhotoSession, 'id' | 'createdAt'>) => void;
  updateSession: (id: string, session: Partial<PhotoSession>) => void;
  deleteSession: (id: string) => void;
  moveSessionStage: (id: string, newStage: SessionStage) => void;
  toggleWorkflowItem: (sessionId: string, itemId: string) => void;
  addWorkflowItem: (sessionId: string, text: string) => void;
  toggleGearItemInSession: (sessionId: string, itemId: string) => void;
  addGearItemToSession: (sessionId: string, text: string) => void;

  // Client actions
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // Gear Inventory actions
  addGearItem: (item: Omit<GearItem, 'id'>) => void;
  updateGearItem: (id: string, item: Partial<GearItem>) => void;
  deleteGearItem: (id: string) => void;

  // Financial actions
  addTransaction: (tx: Omit<FinancialTransaction, 'id'>) => void;
  updateTransaction: (id: string, tx: Partial<FinancialTransaction>) => void;
  deleteTransaction: (id: string) => void;
  toggleTransactionStatus: (id: string) => void;

  // Time tracking actions
  addTimeLog: (log: Omit<TimeLog, 'id'>) => void;
  deleteTimeLog: (id: string) => void;
  startTimer: (
    sessionId?: string,
    activityType?: 'editing' | 'shooting' | 'culling' | 'meeting',
    description?: string
  ) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopAndSaveTimer: () => void;
  resetTimer: () => void;
  updateTimerDetails: (data: Partial<ActiveTimer>) => void;

  // Settings & System
  updateSettings: (settings: Partial<UserSettings>) => void;
  exportDataJson: () => void;
  importDataJson: (jsonData: string) => boolean;
  resetToDefaults: () => void;

  // Helpers
  formatCurrency: (amount: number) => string;
  formatDuration: (seconds: number) => string;
  getSessionById: (id: string) => PhotoSession | undefined;
  getClientById: (id: string) => Client | undefined;
}

const STORAGE_KEYS = {
  SESSIONS: 'fotogestor_sessions_v2',
  CLIENTS: 'fotogestor_clients_v2',
  GEAR: 'fotogestor_gear_v2',
  TRANSACTIONS: 'fotogestor_transactions_v2',
  TIMELOGS: 'fotogestor_timelogs_v2',
  SETTINGS: 'fotogestor_settings_v2',
  TIMER: 'fotogestor_timer_v2',
  GALLERIES: 'fotogestor_galleries_v2',
  PACKAGES: 'fotogestor_packages_v2',
  PROPOSALS: 'fotogestor_proposals_v2',
  CONTRACTS: 'fotogestor_contracts_v2',
  TESTIMONIALS: 'fotogestor_testimonials_v2',
  TASKS: 'fotogestor_tasks_v2',
  CHECKLIST_PRESETS: 'fotogestor_checklist_presets_v2',
  BRIEFING_FORMS: 'fotogestor_briefing_forms_v2',
  BRIEFING_SUBMISSIONS: 'fotogestor_briefing_submissions_v2',
  TEAM_MEMBERS: 'fotogestor_team_members_v2',
  AUTO_REMINDERS: 'fotogestor_auto_reminders_v2',
  VIDEO_CLASSES: 'fotogestor_video_classes_v2',
  SUPPORT_TICKETS: 'fotogestor_support_tickets_v2',
};

const WorkContext = createContext<WorkContextType | undefined>(undefined);

export const WorkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [galleries, setGalleries] = useState<ClientGallery[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GALLERIES);
      return saved ? JSON.parse(saved) : initialGalleries;
    } catch {
      return initialGalleries;
    }
  });

  const [packages, setPackages] = useState<ProposalPackage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PACKAGES);
      return saved ? JSON.parse(saved) : initialPackages;
    } catch {
      return initialPackages;
    }
  });

  const [proposals, setProposals] = useState<SalesProposal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROPOSALS);
      return saved ? JSON.parse(saved) : initialProposals;
    } catch {
      return initialProposals;
    }
  });

  const [contracts, setContracts] = useState<LegalContract[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONTRACTS);
      return saved ? JSON.parse(saved) : initialContracts;
    } catch {
      return initialContracts;
    }
  });

  const [testimonials, setTestimonials] = useState<ClientTestimonial[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TESTIMONIALS);
      return saved ? JSON.parse(saved) : initialTestimonials;
    } catch {
      return initialTestimonials;
    }
  });

  const [tasks, setTasks] = useState<ManagementTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
      return saved ? JSON.parse(saved) : initialTasks;
    } catch {
      return initialTasks;
    }
  });

  const [checklistPresets, setChecklistPresets] = useState<PresetGearChecklist[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHECKLIST_PRESETS);
      return saved ? JSON.parse(saved) : initialChecklistPresets;
    } catch {
      return initialChecklistPresets;
    }
  });

  const [briefingForms, setBriefingForms] = useState<CustomBriefingForm[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BRIEFING_FORMS);
      return saved ? JSON.parse(saved) : initialBriefingForms;
    } catch {
      return initialBriefingForms;
    }
  });

  const [briefingSubmissions, setBriefingSubmissions] = useState<BriefingSubmission[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BRIEFING_SUBMISSIONS);
      return saved ? JSON.parse(saved) : initialBriefingSubmissions;
    } catch {
      return initialBriefingSubmissions;
    }
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEAM_MEMBERS);
      return saved ? JSON.parse(saved) : initialTeamMembers;
    } catch {
      return initialTeamMembers;
    }
  });

  const [autoReminders, setAutoReminders] = useState<AutoReminder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTO_REMINDERS);
      return saved ? JSON.parse(saved) : initialAutoReminders;
    } catch {
      return initialAutoReminders;
    }
  });

  const [videoClasses, setVideoClasses] = useState<VideoClass[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VIDEO_CLASSES);
      return saved ? JSON.parse(saved) : initialVideoClasses;
    } catch {
      return initialVideoClasses;
    }
  });

  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUPPORT_TICKETS);
      return saved ? JSON.parse(saved) : initialSupportTickets;
    } catch {
      return initialSupportTickets;
    }
  });
  const [sessions, setSessions] = useState<PhotoSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return saved ? JSON.parse(saved) : initialSessions;
    } catch {
      return initialSessions;
    }
  });

  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      return saved ? JSON.parse(saved) : initialClients;
    } catch {
      return initialClients;
    }
  });

  const [gear, setGear] = useState<GearItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GEAR);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((item: GearItem) => {
          const init = initialGear.find((g) => g.id === item.id);
          return init ? { ...init, ...item } : item;
        });
      }
      return initialGear;
    } catch {
      return initialGear;
    }
  });

  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : initialTransactions;
    } catch {
      return initialTransactions;
    }
  });

  const [timeLogs, setTimeLogs] = useState<TimeLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TIMELOGS);
      return saved ? JSON.parse(saved) : initialTimeLogs;
    } catch {
      return initialTimeLogs;
    }
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : initialSettings;
    } catch {
      return initialSettings;
    }
  });

  const [activeTimer, setActiveTimer] = useState<ActiveTimer>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TIMER);
      return saved
        ? JSON.parse(saved)
        : {
            running: false,
            seconds: 0,
            sessionId: '',
            activityType: 'editing',
            description: '',
          };
    } catch {
      return {
        running: false,
        seconds: 0,
        sessionId: '',
        activityType: 'editing',
        description: '',
      };
    }
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GEAR, JSON.stringify(gear));
  }, [gear]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TIMELOGS, JSON.stringify(timeLogs));
  }, [timeLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TIMER, JSON.stringify(activeTimer));
  }, [activeTimer]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GALLERIES, JSON.stringify(galleries));
  }, [galleries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(packages));
  }, [packages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROPOSALS, JSON.stringify(proposals));
  }, [proposals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(contracts));
  }, [contracts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(testimonials));
  }, [testimonials]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHECKLIST_PRESETS, JSON.stringify(checklistPresets));
  }, [checklistPresets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BRIEFING_FORMS, JSON.stringify(briefingForms));
  }, [briefingForms]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BRIEFING_SUBMISSIONS, JSON.stringify(briefingSubmissions));
  }, [briefingSubmissions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(teamMembers));
  }, [teamMembers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUTO_REMINDERS, JSON.stringify(autoReminders));
  }, [autoReminders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VIDEO_CLASSES, JSON.stringify(videoClasses));
  }, [videoClasses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUPPORT_TICKETS, JSON.stringify(supportTickets));
  }, [supportTickets]);

  // Active Timer Interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeTimer.running) {
      interval = setInterval(() => {
        setActiveTimer((prev) => ({
          ...prev,
          seconds: prev.seconds + 1,
        }));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer.running]);

  // Formatters
  const formatCurrency = (amount: number): string => {
    const symbol = settings.currency === 'USD' ? '$' : settings.currency === 'EUR' ? '€' : 'R$';
    return `${symbol} ${amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  const getSessionById = (id: string) => sessions.find((s) => s.id === id);
  const getClientById = (id: string) => clients.find((c) => c.id === id);

  // Session Actions
  const addSession = (newSession: Omit<PhotoSession, 'id' | 'createdAt'>) => {
    const session: PhotoSession = {
      ...newSession,
      id: `sess-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setSessions((prev) => [session, ...prev]);

    // Automatically create income transaction for package / deposit
    if (session.depositAmount > 0) {
      addTransaction({
        type: 'income',
        title: `Sinal / Reserva - ${session.title}`,
        amount: session.depositAmount,
        date: session.createdAt,
        category: 'Sinal de Ensaio / Evento',
        status: session.depositPaid ? 'paid' : 'pending',
        sessionId: session.id,
        clientId: session.clientId,
      });
    }
  };

  const updateSession = (id: string, updatedFields: Partial<PhotoSession>) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedFields } : s))
    );
  };

  const deleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const moveSessionStage = (id: string, newStage: SessionStage) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, stage: newStage } : s))
    );
  };

  const toggleWorkflowItem = (sessionId: string, itemId: string) => {
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id !== sessionId) return session;
        const updated = session.workflowChecklist.map((item) =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        return { ...session, workflowChecklist: updated };
      })
    );
  };

  const addWorkflowItem = (sessionId: string, text: string) => {
    if (!text.trim()) return;
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id !== sessionId) return session;
        const newItem = {
          id: `wf-${Date.now()}`,
          text: text.trim(),
          completed: false,
        };
        return {
          ...session,
          workflowChecklist: [...session.workflowChecklist, newItem],
        };
      })
    );
  };

  const toggleGearItemInSession = (sessionId: string, itemId: string) => {
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id !== sessionId) return session;
        const updated = session.gearChecklist.map((item) =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        return { ...session, gearChecklist: updated };
      })
    );
  };

  const addGearItemToSession = (sessionId: string, text: string) => {
    if (!text.trim()) return;
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id !== sessionId) return session;
        const newItem = {
          id: `gc-${Date.now()}`,
          text: text.trim(),
          completed: false,
        };
        return {
          ...session,
          gearChecklist: [...session.gearChecklist, newItem],
        };
      })
    );
  };

  // Client Actions
  const addClient = (newClient: Omit<Client, 'id' | 'createdAt'>) => {
    const client: Client = {
      ...newClient,
      id: `cli-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setClients((prev) => [client, ...prev]);
  };

  const updateClient = (id: string, updatedFields: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  // Gear Actions
  const addGearItem = (item: Omit<GearItem, 'id'>) => {
    const newItem: GearItem = {
      ...item,
      id: `gear-${Date.now()}`,
    };
    setGear((prev) => [...prev, newItem]);
  };

  const updateGearItem = (id: string, updatedFields: Partial<GearItem>) => {
    setGear((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updatedFields } : g))
    );
  };

  const deleteGearItem = (id: string) => {
    setGear((prev) => prev.filter((g) => g.id !== id));
  };

  // Financial Actions
  const addTransaction = (tx: Omit<FinancialTransaction, 'id'>) => {
    const newTx: FinancialTransaction = {
      ...tx,
      id: `tx-${Date.now()}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const updateTransaction = (
    id: string,
    updatedFields: Partial<FinancialTransaction>
  ) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...updatedFields } : tx))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  const toggleTransactionStatus = (id: string) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id !== id) return tx;
        return {
          ...tx,
          status: tx.status === 'paid' ? 'pending' : 'paid',
        };
      })
    );
  };

  // Gallery Actions (FluxoWeby Galerias)
  const addGallery = (newGal: Omit<ClientGallery, 'id' | 'createdAt'>) => {
    const gallery: ClientGallery = {
      ...newGal,
      id: `gal-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      orders: newGal.orders || [],
      photos: newGal.photos || [],
    };
    setGalleries((prev) => [gallery, ...prev]);
  };

  const updateGallery = (id: string, updatedFields: Partial<ClientGallery>) => {
    setGalleries((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updatedFields } : g))
    );
  };

  const deleteGallery = (id: string) => {
    setGalleries((prev) => prev.filter((g) => g.id !== id));
  };

  const togglePhotoSelection = (galleryId: string, photoId: string) => {
    setGalleries((prev) =>
      prev.map((gal) => {
        if (gal.id !== galleryId) return gal;
        const updatedPhotos = gal.photos.map((p) =>
          p.id === photoId ? { ...p, selected: !p.selected } : p
        );
        const selectedCount = updatedPhotos.filter((p) => p.selected).length;
        const extraCount = Math.max(0, selectedCount - gal.contractedPhotos);

        // Also sync with linked session if exists
        if (gal.sessionId) {
          setSessions((sPrev) =>
            sPrev.map((s) =>
              s.id === gal.sessionId
                ? {
                    ...s,
                    selectedPhotos: selectedCount,
                    extraPhotosCount: extraCount,
                  }
                : s
            )
          );
        }

        return {
          ...gal,
          photos: updatedPhotos,
        };
      })
    );
  };

  const togglePhotoFavorite = (galleryId: string, photoId: string) => {
    setGalleries((prev) =>
      prev.map((gal) => {
        if (gal.id !== galleryId) return gal;
        return {
          ...gal,
          photos: gal.photos.map((p) =>
            p.id === photoId ? { ...p, favorited: !p.favorited } : p
          ),
        };
      })
    );
  };

  const addPhotosToGallery = (
    galleryId: string,
    newPhotos: Omit<GalleryPhoto, 'id'>[]
  ) => {
    setGalleries((prev) =>
      prev.map((gal) => {
        if (gal.id !== galleryId) return gal;
        const mapped = newPhotos.map((np, idx) => ({
          ...np,
          id: `p-${Date.now()}-${idx}`,
        }));
        return {
          ...gal,
          photos: [...gal.photos, ...mapped],
        };
      })
    );
  };

  const removePhotoFromGallery = (galleryId: string, photoId: string) => {
    setGalleries((prev) =>
      prev.map((gal) => {
        if (gal.id !== galleryId) return gal;
        return {
          ...gal,
          photos: gal.photos.filter((p) => p.id !== photoId),
        };
      })
    );
  };

  const createGalleryOrder = (
    newOrder: Omit<GalleryOrder, 'id' | 'createdAt'>
  ): GalleryOrder => {
    const order: GalleryOrder = {
      ...newOrder,
      id: `ord-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setGalleries((prev) =>
      prev.map((gal) => {
        if (gal.id !== newOrder.galleryId) return gal;
        return {
          ...gal,
          orders: [order, ...(gal.orders || [])],
        };
      })
    );

    return order;
  };

  const approveGalleryOrder = (galleryId: string, orderId: string) => {
    const today = new Date().toISOString().split('T')[0];

    setGalleries((prev) =>
      prev.map((gal) => {
        if (gal.id !== galleryId) return gal;
        const targetOrder = gal.orders?.find((o) => o.id === orderId);
        if (!targetOrder) return gal;

        const updatedOrders = gal.orders.map((o) =>
          o.id === orderId
            ? { ...o, paymentStatus: 'paid' as const, paidAt: today }
            : o
        );

        // Auto create income in Finance!
        if (targetOrder.totalAmount > 0) {
          addTransaction({
            type: 'income',
            title: `Venda de Fotos Extras (${targetOrder.extraPhotosCount} un.) · ${gal.title}`,
            amount: targetOrder.totalAmount,
            date: today,
            category: 'Fotos Extras',
            status: 'paid',
            sessionId: gal.sessionId,
            notes: `Pedido #${orderId} aprovado via ${targetOrder.paymentMethod.toUpperCase()} · Cliente: ${targetOrder.clientName}`,
          });
        }

        return {
          ...gal,
          status: 'approved',
          downloadAllowed: true,
          orders: updatedOrders,
        };
      })
    );
  };

  // Time Logs & Timer
  const addTimeLog = (log: Omit<TimeLog, 'id'>) => {
    const newLog: TimeLog = {
      ...log,
      id: `log-${Date.now()}`,
    };
    setTimeLogs((prev) => [newLog, ...prev]);
  };

  const deleteTimeLog = (id: string) => {
    setTimeLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const startTimer = (
    sessionId = '',
    activityType: 'editing' | 'shooting' | 'culling' | 'meeting' = 'editing',
    description = ''
  ) => {
    setActiveTimer({
      running: true,
      seconds: 0,
      sessionId,
      activityType,
      description,
      startTime: Date.now(),
    });
  };

  const pauseTimer = () => {
    setActiveTimer((prev) => ({ ...prev, running: false }));
  };

  const resumeTimer = () => {
    setActiveTimer((prev) => ({ ...prev, running: true }));
  };

  const stopAndSaveTimer = () => {
    if (activeTimer.seconds > 10) {
      addTimeLog({
        sessionId: activeTimer.sessionId || undefined,
        description:
          activeTimer.description.trim() ||
          (activeTimer.activityType === 'editing'
            ? 'Tratamento de fotos'
            : activeTimer.activityType === 'shooting'
            ? 'Sessão fotográfica'
            : activeTimer.activityType === 'culling'
            ? 'Seleção e descarte'
            : 'Atendimento e briefing'),
        date: new Date().toISOString().split('T')[0],
        durationSeconds: activeTimer.seconds,
        hourlyRate: settings.defaultHourlyRate,
        activityType: activeTimer.activityType,
      });
    }
    setActiveTimer({
      running: false,
      seconds: 0,
      sessionId: '',
      activityType: 'editing',
      description: '',
    });
  };

  const resetTimer = () => {
    setActiveTimer({
      running: false,
      seconds: 0,
      sessionId: '',
      activityType: 'editing',
      description: '',
    });
  };

  const updateTimerDetails = (data: Partial<ActiveTimer>) => {
    setActiveTimer((prev) => ({ ...prev, ...data }));
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const exportDataJson = () => {
    const data = {
      version: '2.0-photography',
      exportedAt: new Date().toISOString(),
      settings,
      sessions,
      clients,
      gear,
      transactions,
      timeLogs,
      galleries,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fotogestor_backup_${
      new Date().toISOString().split('T')[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importDataJson = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.sessions && parsed.clients) {
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.sessions) setSessions(parsed.sessions);
        if (parsed.clients) setClients(parsed.clients);
        if (parsed.gear) setGear(parsed.gear);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.timeLogs) setTimeLogs(parsed.timeLogs);
        if (parsed.galleries) setGalleries(parsed.galleries);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Packages
  const addPackage = (pkg: Omit<ProposalPackage, 'id'>) => {
    const newPkg: ProposalPackage = { ...pkg, id: `pkg-${Date.now()}` };
    setPackages((prev) => [newPkg, ...prev]);
  };
  const updatePackage = (id: string, pkg: Partial<ProposalPackage>) => {
    setPackages((prev) => prev.map((p) => (p.id === id ? { ...p, ...pkg } : p)));
  };
  const deletePackage = (id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
  };

  // Proposals
  const addProposal = (proposal: Omit<SalesProposal, 'id' | 'createdAt'>): SalesProposal => {
    const newProp: SalesProposal = {
      ...proposal,
      id: `prop-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProposals((prev) => [newProp, ...prev]);
    return newProp;
  };
  const updateProposal = (id: string, proposal: Partial<SalesProposal>) => {
    setProposals((prev) => prev.map((p) => (p.id === id ? { ...p, ...proposal } : p)));
  };
  const deleteProposal = (id: string) => {
    setProposals((prev) => prev.filter((p) => p.id !== id));
  };

  // Approval automatically creates a contract
  const approveProposalAndCreateContract = (proposalId: string): LegalContract | null => {
    const prop = proposals.find((p) => p.id === proposalId);
    if (!prop) return null;

    const contractId = `contract-${Date.now()}`;
    const newContract: LegalContract = {
      id: contractId,
      proposalId: prop.id,
      clientId: prop.clientId,
      clientName: prop.clientName,
      clientDocument: 'A preencher no aceite',
      clientEmail: prop.clientEmail,
      title: `Contrato de Prestação de Serviços Fotográficos · ${prop.title}`,
      status: 'pending_signature',
      sessionType: prop.packageName,
      sessionDate: prop.validUntil,
      location: 'A definir com o estúdio',
      totalAmount: prop.totalAmount,
      depositAmount: Math.round(prop.totalAmount * 0.3),
      contractedPhotos: 30,
      deliveryDays: 15,
      content: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS E CESSÃO DE DIREITOS AUTORAIS\n\nCONTRATADA: ${settings.studioName} (Representada por ${settings.photographerName})\nCONTRATANTE: ${prop.clientName} (${prop.clientEmail})\n\n1. OBJETO: Cobertura fotográfica com base na proposta aprovada (${prop.packageName}) no valor total de R$ ${prop.totalAmount.toFixed(2)}.\n2. FORMA DE PAGAMENTO: Entrada/sinal de reserva de R$ ${(prop.totalAmount * 0.3).toFixed(2)} e saldo parcelado em ${prop.installmentsCount}x.\n3. DIREITOS AUTORAIS: Nos termos da Lei 9.610/98, os direitos morais permanecem com o autor, com licença de uso pessoal irrevogável ao contratante.\n4. ASSINATURA ELETRÔNICA: As partes reconhecem a validade jurídica deste documento assinado digitalmente.`,
      createdAt: new Date().toISOString().split('T')[0],
      photographerSignature:
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M10 30 Q 60 50 120 20 T 190 35" fill="none" stroke="%23f59e0b" stroke-width="2.5"/></svg>',
      photographerSignedAt: new Date().toISOString(),
    };

    setContracts((prev) => [newContract, ...prev]);
    setProposals((prev) =>
      prev.map((p) =>
        p.id === proposalId
          ? {
              ...p,
              status: 'approved',
              approvedAt: new Date().toISOString().split('T')[0],
              generatedContractId: contractId,
            }
          : p
      )
    );

    return newContract;
  };

  // Contracts
  const addContract = (contract: Omit<LegalContract, 'id' | 'createdAt'>): LegalContract => {
    const newContract: LegalContract = {
      ...contract,
      id: `contract-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setContracts((prev) => [newContract, ...prev]);
    return newContract;
  };
  const updateContract = (id: string, contract: Partial<LegalContract>) => {
    setContracts((prev) => prev.map((c) => (c.id === id ? { ...c, ...contract } : c)));
  };
  const deleteContract = (id: string) => {
    setContracts((prev) => prev.filter((c) => c.id !== id));
  };
  const signContractElectronically = (
    contractId: string,
    signatureData: string,
    signerRole: 'client' | 'photographer'
  ) => {
    setContracts((prev) =>
      prev.map((c) => {
        if (c.id !== contractId) return c;
        const now = new Date().toISOString();
        const auditHash = `SHA256:${Math.random().toString(36).substring(2)}${Date.now().toString(16)}`;
        if (signerRole === 'client') {
          return {
            ...c,
            clientSignature: signatureData,
            clientSignedAt: now,
            ipAddress: '189.40.112.58 (São Paulo/SP)',
            auditHash,
            status: 'signed',
          };
        } else {
          return {
            ...c,
            photographerSignature: signatureData,
            photographerSignedAt: now,
          };
        }
      })
    );
  };

  // Testimonials
  const addTestimonial = (test: Omit<ClientTestimonial, 'id' | 'date'>) => {
    const newTest: ClientTestimonial = {
      ...test,
      id: `test-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setTestimonials((prev) => [newTest, ...prev]);
  };
  const updateTestimonial = (id: string, test: Partial<ClientTestimonial>) => {
    setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, ...test } : t)));
  };
  const deleteTestimonial = (id: string) => {
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
  };

  // Tasks
  const addTask = (task: Omit<ManagementTask, 'id'>) => {
    const newTask: ManagementTask = { ...task, id: `task-${Date.now()}` };
    setTasks((prev) => [newTask, ...prev]);
  };
  const updateTask = (id: string, task: Partial<ManagementTask>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...task } : t)));
  };
  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };
  const toggleTaskCompleted = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  // Checklist Presets
  const togglePresetItem = (presetId: string, itemId: string) => {
    setChecklistPresets((prev) =>
      prev.map((p) => {
        if (p.id !== presetId) return p;
        return {
          ...p,
          items: p.items.map((i) => (i.id === itemId ? { ...i, checked: !i.checked } : i)),
        };
      })
    );
  };
  const addChecklistPreset = (preset: Omit<PresetGearChecklist, 'id'>) => {
    const newPreset: PresetGearChecklist = { ...preset, id: `chk-${Date.now()}` };
    setChecklistPresets((prev) => [newPreset, ...prev]);
  };

  // Briefing Forms & Submissions
  const addBriefingForm = (form: Omit<CustomBriefingForm, 'id'>) => {
    const newForm: CustomBriefingForm = { ...form, id: `form-${Date.now()}` };
    setBriefingForms((prev) => [newForm, ...prev]);
  };
  const submitBriefing = (
    formId: string,
    clientId: string,
    clientName: string,
    answers: Record<string, string | string[]>,
    sessionId?: string
  ) => {
    const newSub: BriefingSubmission = {
      id: `sub-${Date.now()}`,
      formId,
      clientId,
      clientName,
      answers,
      sessionId,
      submittedAt: new Date().toISOString(),
    };
    setBriefingSubmissions((prev) => [newSub, ...prev]);
  };

  // Team
  const addTeamMember = (member: Omit<TeamMember, 'id'>) => {
    const newMember: TeamMember = { ...member, id: `team-${Date.now()}` };
    setTeamMembers((prev) => [newMember, ...prev]);
  };
  const updateTeamMember = (id: string, member: Partial<TeamMember>) => {
    setTeamMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...member } : m)));
  };
  const deleteTeamMember = (id: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
  };

  // Reminders
  const toggleAutoReminder = (id: string) => {
    setAutoReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };
  const updateAutoReminder = (id: string, reminder: Partial<AutoReminder>) => {
    setAutoReminders((prev) => prev.map((r) => (r.id === id ? { ...r, ...reminder } : r)));
  };

  // Video Classes
  const toggleVideoCompleted = (id: string) => {
    setVideoClasses((prev) =>
      prev.map((v) => (v.id === id ? { ...v, completed: !v.completed } : v))
    );
  };

  // Support
  const addSupportMessage = (ticketId: string, text: string) => {
    const newMsg: SupportTicketMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      senderName: settings.photographerName || 'Fotógrafo',
      text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setSupportTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.id !== ticketId) return ticket;
        return {
          ...ticket,
          messages: [...ticket.messages, newMsg],
        };
      })
    );
  };
  const createSupportTicket = (subject: string, category: string, initialMessage: string) => {
    const newTicket: SupportTicket = {
      id: `sup-${Date.now()}`,
      subject,
      category: category as any,
      status: 'open',
      priority: 'vip_urgente',
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'user',
          senderName: settings.photographerName || 'Fotógrafo',
          text: initialMessage,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        },
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'support',
          senderName: 'Suporte VIP FotoGestor',
          text: 'Recebemos o seu chamado com prioridade VIP! Um especialista da nossa equipe responderá em breve.',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };
    setSupportTickets((prev) => [newTicket, ...prev]);
  };

  const resetToDefaults = () => {
    setSessions(initialSessions);
    setClients(initialClients);
    setGear(initialGear);
    setTransactions(initialTransactions);
    setTimeLogs(initialTimeLogs);
    setSettings(initialSettings);
    setGalleries(initialGalleries);
    setPackages(initialPackages);
    setProposals(initialProposals);
    setContracts(initialContracts);
    setTestimonials(initialTestimonials);
    setTasks(initialTasks);
    setChecklistPresets(initialChecklistPresets);
    setBriefingForms(initialBriefingForms);
    setBriefingSubmissions(initialBriefingSubmissions);
    setTeamMembers(initialTeamMembers);
    setAutoReminders(initialAutoReminders);
    setVideoClasses(initialVideoClasses);
    setSupportTickets(initialSupportTickets);
    setActiveTimer({
      running: false,
      seconds: 0,
      sessionId: '',
      activityType: 'editing',
      description: '',
    });
  };

  const value = useMemo(
    () => ({
      sessions,
      clients,
      gear,
      transactions,
      timeLogs,
      settings,
      activeTimer,
      galleries,
      packages,
      proposals,
      contracts,
      testimonials,
      tasks,
      checklistPresets,
      briefingForms,
      briefingSubmissions,
      teamMembers,
      autoReminders,
      videoClasses,
      supportTickets,
      addPackage,
      updatePackage,
      deletePackage,
      addProposal,
      updateProposal,
      deleteProposal,
      approveProposalAndCreateContract,
      addContract,
      updateContract,
      deleteContract,
      signContractElectronically,
      addTestimonial,
      updateTestimonial,
      deleteTestimonial,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskCompleted,
      togglePresetItem,
      addChecklistPreset,
      addBriefingForm,
      submitBriefing,
      addTeamMember,
      updateTeamMember,
      deleteTeamMember,
      toggleAutoReminder,
      updateAutoReminder,
      toggleVideoCompleted,
      addSupportMessage,
      createSupportTicket,
      addGallery,
      updateGallery,
      deleteGallery,
      togglePhotoSelection,
      togglePhotoFavorite,
      addPhotosToGallery,
      removePhotoFromGallery,
      createGalleryOrder,
      approveGalleryOrder,
      addSession,
      updateSession,
      deleteSession,
      moveSessionStage,
      toggleWorkflowItem,
      addWorkflowItem,
      toggleGearItemInSession,
      addGearItemToSession,
      addClient,
      updateClient,
      deleteClient,
      addGearItem,
      updateGearItem,
      deleteGearItem,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      toggleTransactionStatus,
      addTimeLog,
      deleteTimeLog,
      startTimer,
      pauseTimer,
      resumeTimer,
      stopAndSaveTimer,
      resetTimer,
      updateTimerDetails,
      updateSettings,
      exportDataJson,
      importDataJson,
      resetToDefaults,
      formatCurrency,
      formatDuration,
      getSessionById,
      getClientById,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      sessions,
      clients,
      gear,
      transactions,
      timeLogs,
      settings,
      activeTimer,
      galleries,
      packages,
      proposals,
      contracts,
      testimonials,
      tasks,
      checklistPresets,
      briefingForms,
      briefingSubmissions,
      teamMembers,
      autoReminders,
      videoClasses,
      supportTickets,
    ]
  );

  return <WorkContext.Provider value={value}>{children}</WorkContext.Provider>;
};

export const useWork = () => {
  const context = useContext(WorkContext);
  if (!context) {
    throw new Error('useWork must be used within a WorkProvider');
  }
  return context;
};
