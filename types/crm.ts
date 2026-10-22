export type Role = 'OWNER' | 'ADMIN' | 'AGENT';

export type PlanTier = 'STARTER' | 'GROWTH' | 'ENTERPRISE';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: PlanTier;
  seatLimit: number;
  createdAt: string;
  currency: string;
  timezone: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  organizationId: string;
  avatar: string;
  title: string;
  phone?: string;
}

export type ContactStatus = 'LEAD' | 'QUALIFIED' | 'OPPORTUNITY' | 'CUSTOMER' | 'CHURNED';

export interface Contact {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  status: ContactStatus;
  tags: string[];
  lifetimeValue: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  lastContactedAt?: string;
  notesCount: number;
}

export interface PipelineStage {
  id: string;
  pipelineId: string;
  organizationId: string;
  name: string;
  position: number;
  color: string;
  probability: number; // 0 - 100%
}

export interface Pipeline {
  id: string;
  organizationId: string;
  name: string;
  isDefault: boolean;
  stages: PipelineStage[];
}

export type DealPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Deal {
  id: string;
  organizationId: string;
  title: string;
  value: number;
  currency: string;
  contactId: string;
  pipelineId: string;
  stageId: string;
  priority: DealPriority;
  expectedCloseDate: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}

export type LocationType = 'ZOOM' | 'MEET' | 'PHONE' | 'IN_PERSON';
export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: string;
  organizationId: string;
  title: string;
  startTime: string;
  endTime: string;
  contactId: string;
  assignedUserId: string;
  locationType: LocationType;
  status: AppointmentStatus;
  meetingUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface Note {
  id: string;
  organizationId: string;
  contactId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export type ActivityType = 'EMAIL' | 'CALL' | 'MEETING' | 'NOTE' | 'STAGE_CHANGE' | 'AUTOMATION';

export interface Activity {
  id: string;
  organizationId: string;
  contactId: string;
  userId: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export type TriggerType =
  | 'STAGE_CHANGED'
  | 'CONTACT_CREATED'
  | 'DEAL_WON'
  | 'DEAL_STALLED_5D'
  | 'APPOINTMENT_BOOKED';

export type ActionType =
  | 'DELAY'
  | 'SEND_EMAIL'
  | 'CREATE_TASK'
  | 'ADD_TAG'
  | 'SLACK_NOTIFY';

export interface WorkflowAction {
  id: string;
  type: ActionType;
  label: string;
  config: {
    delayMinutes?: number;
    delayUnit?: 'MINUTES' | 'HOURS' | 'DAYS';
    emailSubject?: string;
    emailTemplate?: string;
    taskTitle?: string;
    tagToAdd?: string;
    channel?: string;
    message?: string;
  };
}

export interface AutomationWorkflow {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  triggerType: TriggerType;
  triggerConfig: {
    stageId?: string;
    tag?: string;
  };
  actions: WorkflowAction[];
  active: boolean;
  executionCount: number;
  lastTriggeredAt?: string;
}

export type QueueName =
  | 'email-sequence'
  | 'followup-reminder'
  | 'csv-export'
  | 'webhook-dispatch'
  | 'automation-worker';

export type JobStatus = 'WAITING' | 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'DELAYED';

export interface AsyncJob {
  id: string;
  organizationId: string;
  queueName: QueueName;
  name: string;
  status: JobStatus;
  data: Record<string, any>;
  progress: number; // 0 - 100
  attempts: number;
  maxAttempts: number;
  delayMs?: number;
  error?: string;
  createdAt: string;
  processedAt?: string;
  durationMs?: number;
}
