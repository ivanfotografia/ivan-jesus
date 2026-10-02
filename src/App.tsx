import React, { useState, useEffect } from 'react';
import { WorkProvider, useWork } from './context/WorkContext';
import { ThemeProvider } from './context/ThemeContext';
import { ActiveTab } from './components/TopBar';
import { SystemSidebar } from './components/system/SystemSidebar';
import { SystemHeader } from './components/system/SystemHeader';
import { SystemStatusBar } from './components/system/SystemStatusBar';
import { SystemNotificationsDrawer } from './components/system/SystemNotificationsDrawer';
import { SystemDiagnosticsModal } from './components/system/SystemDiagnosticsModal';
import { OfflineIndicator } from './components/system/OfflineIndicator';

import { PhotographyDashboardView } from './components/views/PhotographyDashboardView';
import { SessionsKanbanView } from './components/views/SessionsKanbanView';
import { GearView } from './components/views/GearView';
import { ClientsView } from './components/views/ClientsView';
import { GalleriesView } from './components/views/GalleriesView';
import { FinanceView } from './components/views/FinanceView';
import { TimeTrackerView } from './components/views/TimeTrackerView';
import { SettingsView } from './components/views/SettingsView';
import { SalesCrmView } from './components/views/SalesCrmView';
import { ManagementView } from './components/views/ManagementView';
import { ClientPortalView } from './components/views/ClientPortalView';
import { FreelaAiView } from './components/views/FreelaAiView';
import { WhatsAppExtensionView } from './components/views/WhatsAppExtensionView';
import { AcademySupportView } from './components/views/AcademySupportView';
import { TemplatesView } from './components/views/TemplatesView';

import { SessionModal } from './components/modals/SessionModal';
import { GearModal } from './components/modals/GearModal';
import { ClientModal } from './components/modals/ClientModal';
import { TransactionModal } from './components/modals/TransactionModal';
import { ContractModal } from './components/modals/ContractModal';
import { ShortcutsModal } from './components/modals/ShortcutsModal';
import { CommandPalette } from './components/CommandPalette';

import {
  Client,
  FinancialTransaction,
  GearItem,
  PhotoSession,
  SessionStage,
  TransactionType,
} from './types';

const MainPhotographyApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Sidebar Layout State (Persisted)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('fotogestor_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // System Diagnostics & Notifications Modals
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Business Entity Modals
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState<PhotoSession | null>(null);
  const [defaultSessionStage, setDefaultSessionStage] = useState<SessionStage>('agendado');

  const [isGearModalOpen, setIsGearModalOpen] = useState(false);
  const [gearToEdit, setGearToEdit] = useState<GearItem | null>(null);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txToEdit, setTxToEdit] = useState<FinancialTransaction | null>(null);
  const [defaultTxType, setDefaultTxType] = useState<TransactionType>('income');

  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [contractSessionId, setContractSessionId] = useState<string | undefined>(undefined);

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Save sidebar collapse state
  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('fotogestor_sidebar_collapsed', String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  // Keyboard shortcut for Cmd+K / Ctrl+K and ?
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (e.key === '?' && !isInput && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers for entity creation/editing
  const handleOpenNewSession = (stage: SessionStage = 'agendado') => {
    setSessionToEdit(null);
    setDefaultSessionStage(stage);
    setIsSessionModalOpen(true);
  };

  const handleEditSession = (session: PhotoSession) => {
    setSessionToEdit(session);
    setIsSessionModalOpen(true);
  };

  const handleOpenNewGear = () => {
    setGearToEdit(null);
    setIsGearModalOpen(true);
  };

  const handleEditGear = (item: GearItem) => {
    setGearToEdit(item);
    setIsGearModalOpen(true);
  };

  const handleOpenNewClient = () => {
    setClientToEdit(null);
    setIsClientModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setClientToEdit(client);
    setIsClientModalOpen(true);
  };

  const handleOpenNewTransaction = (type: TransactionType = 'income') => {
    setTxToEdit(null);
    setDefaultTxType(type);
    setIsTxModalOpen(true);
  };

  const handleEditTransaction = (tx: FinancialTransaction) => {
    setTxToEdit(tx);
    setIsTxModalOpen(true);
  };

  const handleOpenContractModal = (sessionId?: string) => {
    setContractSessionId(sessionId);
    setIsContractModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col selection:bg-amber-500/20 selection:text-amber-600 transition-colors">
      {/* Complete System Sidebar */}
      <SystemSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebarCollapse}
        onOpenNewSession={() => handleOpenNewSession('agendado')}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main System Work Area (dynamically offset by sidebar width) */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
        }`}
      >
        {/* System Top Header */}
        <SystemHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenSidebarMobile={() => setIsMobileSidebarOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenNewSession={() => handleOpenNewSession('agendado')}
          onOpenNewClient={handleOpenNewClient}
          onOpenNewGear={handleOpenNewGear}
          onOpenNewTransaction={() => handleOpenNewTransaction('income')}
          onOpenContract={handleOpenContractModal}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        />

        {/* View Content Canvas */}
        <main className="flex-1 w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-5">
          {activeTab === 'dashboard' && (
            <PhotographyDashboardView
              setActiveTab={setActiveTab}
              onOpenNewSessionModal={() => handleOpenNewSession('agendado')}
              onOpenContractModal={handleOpenContractModal}
              onEditSession={handleEditSession}
            />
          )}

          {activeTab === 'proposals' && (
            <SalesCrmView
              onOpenContract={handleOpenContractModal}
              onNavigateToPortal={() => setActiveTab('client_portal')}
              onNavigateToTemplates={() => setActiveTab('templates')}
            />
          )}

          {activeTab === 'templates' && (
            <TemplatesView
              onNavigateTab={setActiveTab}
              onOpenContract={handleOpenContractModal}
            />
          )}

          {activeTab === 'management' && <ManagementView />}

          {activeTab === 'sessions' && (
            <SessionsKanbanView
              onOpenNewSessionModal={handleOpenNewSession}
              onEditSession={handleEditSession}
              onOpenContractModal={handleOpenContractModal}
            />
          )}

          {activeTab === 'gear' && (
            <GearView
              onOpenNewGearModal={handleOpenNewGear}
              onEditGear={handleEditGear}
            />
          )}

          {activeTab === 'clients' && (
            <ClientsView
              onOpenNewClientModal={handleOpenNewClient}
              onEditClient={handleEditClient}
            />
          )}

          {activeTab === 'galleries' && <GalleriesView />}

          {activeTab === 'finance' && (
            <FinanceView
              onOpenNewTransactionModal={handleOpenNewTransaction}
              onEditTransaction={handleEditTransaction}
              onOpenContractModal={handleOpenContractModal}
            />
          )}

          {activeTab === 'client_portal' && <ClientPortalView />}

          {activeTab === 'freela_ai' && <FreelaAiView />}

          {activeTab === 'whatsapp_ext' && (
            <WhatsAppExtensionView
              onNavigateToTemplates={() => setActiveTab('templates')}
            />
          )}

          {activeTab === 'timetracker' && <TimeTrackerView />}

          {activeTab === 'academy_support' && <AcademySupportView />}

          {activeTab === 'settings' && <SettingsView />}
        </main>

        {/* System Status Bar Taskbar */}
        <SystemStatusBar
          onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
        />
      </div>

      {/* Offline Toast Indicator */}
      <OfflineIndicator />

      {/* System Modals & Drawers */}
      <SystemNotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        setActiveTab={setActiveTab}
      />

      <SystemDiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
      />

      {/* Business Modals */}
      <SessionModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        sessionToEdit={sessionToEdit}
        defaultStage={defaultSessionStage}
      />

      <GearModal
        isOpen={isGearModalOpen}
        onClose={() => setIsGearModalOpen(false)}
        gearToEdit={gearToEdit}
      />

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        clientToEdit={clientToEdit}
      />

      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        txToEdit={txToEdit}
        defaultType={defaultTxType}
      />

      <ContractModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        defaultSessionId={contractSessionId}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        setActiveTab={setActiveTab}
        onOpenNewSession={() => handleOpenNewSession('agendado')}
        onOpenNewClient={handleOpenNewClient}
        onOpenNewGear={handleOpenNewGear}
        onOpenNewTx={() => handleOpenNewTransaction('income')}
        onOpenContract={handleOpenContractModal}
        onEditSession={handleEditSession}
        onEditClient={handleEditClient}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <WorkProvider>
        <MainPhotographyApp />
      </WorkProvider>
    </ThemeProvider>
  );
}
