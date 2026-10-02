export type SessionCategory =
  | 'casamento'
  | 'ensaio_casal'
  | 'retrato_corporativo'
  | 'familia_gestante'
  | 'moda_editorial'
  | 'evento_aniversario'
  | 'gastronomia';

export type SessionStage = 'agendado' | 'sessao_feita' | 'edicao' | 'entregue';
export type SessionPriority = 'baixa' | 'normal' | 'alta' | 'urgente';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface GearItem {
  id: string;
  name: string;
  category: 'camera' | 'lens' | 'lighting' | 'audio_accessory' | 'storage';
  serialNumber?: string;
  status: 'available' | 'in_use' | 'maintenance';
  notes?: string;
  nextMaintenanceDate?: string; // YYYY-MM-DD
  lastMaintenanceDate?: string; // YYYY-MM-DD
  maintenanceType?: string; // e.g. Limpeza de sensor, calibração
  insuranceRenewalDate?: string; // YYYY-MM-DD
  insurancePolicyNumber?: string;
  insuranceCompany?: string;
  estimatedValue?: number;
}

export interface PhotoSession {
  id: string;
  title: string;
  category: SessionCategory;
  clientId: string;
  stage: SessionStage;
  priority: SessionPriority;
  sessionDate: string; // YYYY-MM-DD
  sessionTime: string; // HH:MM
  location: string;
  packagePrice: number;
  depositAmount: number;
  depositPaid: boolean;
  balancePaid: boolean;
  contractedPhotos: number;
  selectedPhotos: number;
  editedPhotos: number;
  extraPhotosCount: number;
  extraPhotoPrice: number;
  galleryUrl: string;
  notes: string;
  gearChecklist: ChecklistItem[];
  workflowChecklist: ChecklistItem[];
  createdAt: string;
}

export type ClientStatus = 'active' | 'lead' | 'inactive';

export interface Client {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  document: string; // CPF or CNPJ
  instagram?: string;
  status: ClientStatus;
  notes: string;
  createdAt: string;
}

export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'paid' | 'pending' | 'overdue';

export interface FinancialTransaction {
  id: string;
  type: TransactionType;
  title: string;
  amount: number;
  date: string;
  category: string;
  status: TransactionStatus;
  sessionId?: string;
  clientId?: string;
  notes?: string;
}

export interface TimeLog {
  id: string;
  sessionId?: string;
  description: string;
  date: string;
  durationSeconds: number;
  hourlyRate: number;
  activityType: 'shooting' | 'culling' | 'editing' | 'meeting' | 'travel';
}

export interface UserSettings {
  studioName: string;
  photographerName: string;
  specialty: string;
  currency: 'BRL' | 'USD' | 'EUR';
  defaultHourlyRate: number;
  defaultExtraPhotoPrice: number;
  fiscalId: string;
  email: string;
  phone: string;
  instagram: string;
  pixKey: string;
  monthlyRevenueGoal?: number;
}

export interface ActiveTimer {
  running: boolean;
  seconds: number;
  sessionId: string;
  activityType: 'editing' | 'shooting' | 'culling' | 'meeting';
  description: string;
  startTime?: number;
}

// FluxoWeby Galerias Types
export type GalleryCategory =
  | 'casamento'
  | 'formatura'
  | 'ensaio'
  | 'aniversario'
  | 'corporativo'
  | 'esportivo'
  | 'escolar'
  | 'produtos'
  | 'gestante'
  | 'newborn'
  | 'danca_artes'
  | 'outro';

export type GalleryStatus = 'draft' | 'selection' | 'approved' | 'delivered';

export interface GalleryPhoto {
  id: string;
  url: string;
  thumbnailUrl: string;
  filename: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
  selected?: boolean;
  favorited?: boolean;
  notes?: string;
}

export interface GalleryOrder {
  id: string;
  galleryId: string;
  sessionId?: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  contractedPhotos: number;
  selectedPhotosCount: number;
  extraPhotosCount: number;
  extraPhotoPrice: number;
  totalAmount: number;
  paymentMethod: 'pix' | 'mercadopago' | 'credit_card';
  paymentStatus: 'pending' | 'paid';
  pixCode?: string;
  createdAt: string;
  paidAt?: string;
}

export interface ClientGallery {
  id: string;
  title: string;
  category: GalleryCategory;
  sessionId?: string;
  clientId: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  coverImage: string;
  status: GalleryStatus;
  date: string; // YYYY-MM-DD
  accessCode?: string;
  contractedPhotos: number;
  extraPhotoPrice: number;
  watermarkEnabled: boolean;
  watermarkText?: string;
  downloadAllowed: boolean;
  photos: GalleryPhoto[];
  orders: GalleryOrder[];
  customMessage?: string;
  createdAt: string;
}

// -------------------------------------------------------------
// CRM DE VENDAS & PROPOSTAS
// -------------------------------------------------------------
export interface PackageAddon {
  id: string;
  name: string;
  description?: string;
  price: number;
}

export interface ProposalPackage {
  id: string;
  name: string;
  category: SessionCategory;
  description: string;
  price: number;
  durationHours: number;
  deliveredPhotosCount: number;
  includedItems: string[];
  availableAddons: PackageAddon[];
  installmentOptions: string;
  isPopular?: boolean;
}

export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'approved' | 'declined';

export interface SalesProposal {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  category: SessionCategory;
  packageId: string;
  packageName: string;
  basePrice: number;
  selectedAddons: { id: string; name: string; price: number }[];
  discount: number;
  totalAmount: number;
  status: ProposalStatus;
  installmentsCount: number;
  notes?: string;
  validUntil: string; // YYYY-MM-DD
  createdAt: string;
  viewedAt?: string;
  approvedAt?: string;
  generatedContractId?: string;
}

// -------------------------------------------------------------
// ASSINATURAS ILIMITADAS & CONTRATOS DIGITAIS
// -------------------------------------------------------------
export type ContractStatus = 'draft' | 'pending_signature' | 'signed' | 'cancelled';

export interface LegalContract {
  id: string;
  proposalId?: string;
  sessionId?: string;
  clientId: string;
  clientName: string;
  clientDocument: string;
  clientEmail: string;
  title: string;
  status: ContractStatus;
  sessionType: string;
  sessionDate: string;
  location: string;
  totalAmount: number;
  depositAmount: number;
  contractedPhotos: number;
  deliveryDays: number;
  content: string;
  clientSignature?: string; // Base64 data URL
  clientSignedAt?: string;
  photographerSignature?: string;
  photographerSignedAt?: string;
  ipAddress?: string;
  auditHash?: string; // Electronic seal hash
  createdAt: string;
}

// -------------------------------------------------------------
// CENTRAL DE DEPOIMENTOS
// -------------------------------------------------------------
export interface ClientTestimonial {
  id: string;
  clientId?: string;
  clientName: string;
  clientRole?: string; // Ex: 'Noiva', 'Modelo', 'Mãe da Alice'
  sessionCategory: SessionCategory;
  rating: number; // 1 to 5
  content: string;
  avatarUrl?: string;
  photoUrl?: string;
  date: string;
  featured: boolean;
  approved: boolean;
  source: 'whatsapp' | 'portal' | 'manual';
}

// -------------------------------------------------------------
// GESTÃO OPERACIONAL: TAREFAS, CHECKLISTS, FORMULÁRIOS, EQUIPE
// -------------------------------------------------------------
export type TaskStage =
  | 'pre_producao'
  | 'sessao'
  | 'backup_culling'
  | 'edicao'
  | 'diagramacao'
  | 'entregue';

export interface ManagementTask {
  id: string;
  sessionId?: string;
  sessionTitle?: string;
  title: string;
  stage: TaskStage;
  dueDate: string;
  completed: boolean;
  priority: SessionPriority;
  assignedMemberId?: string;
  assignedMemberName?: string;
  notes?: string;
}

export interface PresetGearChecklist {
  id: string;
  category: SessionCategory;
  name: string;
  description: string;
  items: { id: string; name: string; checked: boolean; essential: boolean }[];
}

export interface BriefingQuestion {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox';
  options?: string[];
  placeholder?: string;
  required: boolean;
}

export interface CustomBriefingForm {
  id: string;
  category: SessionCategory;
  title: string;
  description: string;
  questions: BriefingQuestion[];
}

export interface BriefingSubmission {
  id: string;
  formId: string;
  sessionId?: string;
  clientId: string;
  clientName: string;
  answers: Record<string, string | string[]>;
  submittedAt: string;
}

export type TeamRole =
  | 'fotografo_principal'
  | 'segundo_fotografo'
  | 'assistente'
  | 'editor'
  | 'comercial';

export type TeamPermission = 'admin' | 'editor' | 'viewer';

export interface TeamMember {
  id: string;
  name: string;
  role: TeamRole;
  email: string;
  phone: string;
  dailyRate: number;
  permission: TeamPermission;
  active: boolean;
  avatarUrl?: string;
  notes?: string;
}

export interface AutoReminder {
  id: string;
  triggerType: 'before_session' | 'after_session' | 'pending_payment' | 'gallery_ready';
  daysOffset: number; // e.g. -3 (3 days before) or 1 (1 day after)
  title: string;
  messageTemplate: string;
  channel: 'whatsapp' | 'email';
  active: boolean;
}

// -------------------------------------------------------------
// EXPERIÊNCIA: AULAS EM VÍDEO & SUPORTE VIP
// -------------------------------------------------------------
export interface VideoClass {
  id: string;
  title: string;
  category: 'vendas' | 'negocios' | 'lightroom' | 'fotografia';
  duration: string;
  instructor: string;
  description: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  thumbnailUrl: string;
  videoUrl: string;
  completed?: boolean;
}

export interface SupportTicketMessage {
  id: string;
  sender: 'user' | 'support';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: 'duvida' | 'financeiro' | 'contrato' | 'bug' | 'outros';
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'normal' | 'alta' | 'vip_urgente';
  createdAt: string;
  messages: SupportTicketMessage[];
}

// -------------------------------------------------------------
// CENTRAL DE TEMPLATES & MODELOS ATUALIZADOS 2026
// -------------------------------------------------------------
export type TemplateCategory =
  | 'todos'
  | 'contratos'
  | 'propostas'
  | 'whatsapp'
  | 'briefings'
  | 'emails'
  | 'carrosseis'
  | 'precificacao';

export interface PhotographyTemplate {
  id: string;
  title: string;
  category: 'contratos' | 'propostas' | 'whatsapp' | 'briefings' | 'emails' | 'carrosseis' | 'precificacao';
  niche: string;
  description: string;
  badge?: string;
  version: string;
  tags: string[];
  content: string;
  structureNotes?: string[];
  targetAudience?: string;
  recommendedUse?: string;
  isPopular?: boolean;
  legalClausesCount?: number;
  wordCount?: number;
  isCustom?: boolean;
}


