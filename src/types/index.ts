export type AppScreen = 'cover' | 'report' | 'chat' | 'routes' | 'protocols' | 'network' | 'cases';

export type DeviceMode = 'auto' | 'mobile' | 'tablet' | 'desktop';

export type UserRole = 'estudiante' | 'docente' | 'coordinador' | 'rector' | 'padre';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  gradeOrTitle: string; // e.g. "3er Año B", "Prof. Matemáticas", "Coordinadora de Convivencia", "Rectoría General", "Padre / Tutor"
  campus: string; // e.g. "Plantel Central · Turno Matutino"
  avatar?: string;
  enrolledSince?: string;
  representedStudent?: string; // e.g. "Mateo R. (3°A)" when role is 'padre'
  phone?: string;
}

export interface RegisteredAccount extends UserProfile {
  password: string;
  createdAt: string;
}

export type IncidentUrgency = 'baja' | 'moderada' | 'alta';

export interface VideoEvidence {
  name: string;
  size: string;
  url: string;
}

export interface TargetGuardianNotification {
  studentName: string;
  guardianName: string;
  relationship: string;
  contactChannel: string;
  phoneOrEmail: string;
  status: 'entregado' | 'leido' | 'firmado' | 'enviando';
  notifiedAt: string;
}

export interface SolutionPlan {
  resolvedByRole: 'docente' | 'coordinador' | 'rector';
  resolvedByName: string;
  resolvedAt: string;
  solutionType: 'mediacion_dialogo' | 'compromiso_convivencia' | 'taller_paz' | 'reparacion_restaurativa' | 'intervencion_directiva';
  diagnosis: string;
  agreements: string[];
  restorativeMeasure: string;
  guidanceForParents: string;
  notifiedToParents: boolean;
  isConfidentialToInvolved: boolean; // Strictly true: not broadcast to all parents, sent only to involved guardians
  targetGuardians: TargetGuardianNotification[];
  parentSignatures?: {
    parentName: string;
    studentName?: string;
    signedAt: string;
    comment?: string;
    signatureHash?: string;
  }[];
}

export interface IncidentReport {
  id: string;
  category: string;
  location: string;
  urgency: IncidentUrgency;
  description: string;
  isAnonymous: boolean;
  reporterName?: string;
  reporterRole?: UserRole;
  involvedPersons?: string;
  targetStudent?: string;
  targetGrade?: string;
  videoEvidence?: VideoEvidence;
  date: string;
  status: 'recibido' | 'en_revision' | 'mediacion_iniciada' | 'acuerdo_firmado' | 'solucionado_notificado';
  assignedMediator?: string;
  solutionPlan?: SolutionPlan;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'mediator';
  text: string;
  timestamp: string;
}

export interface SafeZone {
  id: string;
  name: string;
  type: 'auxilio' | 'vigilada' | 'mediacion' | 'enfermeria';
  coordinates: { x: number; y: number };
  description: string;
  supervisor: string;
}
