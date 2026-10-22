'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Organization,
  User,
  Contact,
  Pipeline,
  Deal,
  Appointment,
  Note,
  Activity,
  AutomationWorkflow,
  AsyncJob,
  Role,
  QueueName,
  AppointmentStatus,
  ActivityType,
} from '@/types/crm';
import {
  INITIAL_ORGANIZATIONS,
  INITIAL_USERS,
  INITIAL_PIPELINES,
  INITIAL_CONTACTS,
  INITIAL_DEALS,
  INITIAL_APPOINTMENTS,
  INITIAL_NOTES,
  INITIAL_ACTIVITIES,
  INITIAL_AUTOMATIONS,
  INITIAL_JOBS,
} from '@/lib/mock-data';

const STORAGE_KEYS = {
  CURRENT_ORG: 'omnipulse_current_org',
  CURRENT_USER: 'omnipulse_current_user',
  ORGANIZATIONS: 'omnipulse_orgs',
  USERS: 'omnipulse_users',
  PIPELINES: 'omnipulse_pipelines',
  CONTACTS: 'omnipulse_contacts',
  DEALS: 'omnipulse_deals',
  APPOINTMENTS: 'omnipulse_appointments',
  NOTES: 'omnipulse_notes',
  ACTIVITIES: 'omnipulse_activities',
  AUTOMATIONS: 'omnipulse_automations',
  JOBS: 'omnipulse_jobs',
};

export type AppPermission =
  | 'VIEW_FINANCIALS'
  | 'EXPORT_DATA'
  | 'MANAGE_BILLING'
  | 'MANAGE_USERS'
  | 'MANAGE_AUTOMATIONS'
  | 'CREATE_EDIT_DEALS'
  | 'CREATE_EDIT_CONTACTS'
  | 'SCHEDULE_APPOINTMENTS'
  | 'VIEW_AUDIT_LOGS';

export function hasPermission(role: Role, permission: AppPermission): boolean {
  switch (permission) {
    case 'VIEW_FINANCIALS':
    case 'EXPORT_DATA':
    case 'MANAGE_AUTOMATIONS':
    case 'MANAGE_USERS':
    case 'VIEW_AUDIT_LOGS':
      return role === 'OWNER' || role === 'ADMIN';
    case 'MANAGE_BILLING':
      return role === 'OWNER';
    case 'CREATE_EDIT_DEALS':
    case 'CREATE_EDIT_CONTACTS':
    case 'SCHEDULE_APPOINTMENTS':
      return true; // OWNER, ADMIN, AGENT
    default:
      return false;
  }
}

// In-memory global store with listeners for client-side cross-component reactivity
class CRMStoreManager {
  private organizations: Organization[] = INITIAL_ORGANIZATIONS;
  private users: User[] = INITIAL_USERS;
  private pipelines: Pipeline[] = INITIAL_PIPELINES;
  private contacts: Contact[] = INITIAL_CONTACTS;
  private deals: Deal[] = INITIAL_DEALS;
  private appointments: Appointment[] = INITIAL_APPOINTMENTS;
  private notes: Note[] = INITIAL_NOTES;
  private activities: Activity[] = INITIAL_ACTIVITIES;
  private automations: AutomationWorkflow[] = INITIAL_AUTOMATIONS;
  private jobs: AsyncJob[] = INITIAL_JOBS;

  private currentOrgId: string = 'org-nexus';
  private currentUserId: string = 'usr-alex';
  private listeners: Set<() => void> = new Set();
  private workerInterval: NodeJS.Timeout | null = null;

  private initialized = false;

  constructor() {
    // Pure initialization during SSR and first render
  }

  public initClient() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;
    this.loadFromStorage();
    this.startWorkerSimulation();
    this.notify();
  }

  private loadFromStorage() {
    try {
      const savedOrgId = localStorage.getItem(STORAGE_KEYS.CURRENT_ORG);
      if (savedOrgId) this.currentOrgId = savedOrgId;

      const savedUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (savedUserId) this.currentUserId = savedUserId;

      const savedContacts = localStorage.getItem(STORAGE_KEYS.CONTACTS);
      if (savedContacts) this.contacts = JSON.parse(savedContacts);

      const savedDeals = localStorage.getItem(STORAGE_KEYS.DEALS);
      if (savedDeals) this.deals = JSON.parse(savedDeals);

      const savedActivities = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      if (savedActivities) this.activities = JSON.parse(savedActivities);

      const savedAppointments = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
      if (savedAppointments) this.appointments = JSON.parse(savedAppointments);

      const savedNotes = localStorage.getItem(STORAGE_KEYS.NOTES);
      if (savedNotes) this.notes = JSON.parse(savedNotes);

      const savedAutomations = localStorage.getItem(STORAGE_KEYS.AUTOMATIONS);
      if (savedAutomations) this.automations = JSON.parse(savedAutomations);

      const savedJobs = localStorage.getItem(STORAGE_KEYS.JOBS);
      if (savedJobs) this.jobs = JSON.parse(savedJobs);

      const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      if (savedUsers) this.users = JSON.parse(savedUsers);

      const savedOrgs = localStorage.getItem(STORAGE_KEYS.ORGANIZATIONS);
      if (savedOrgs) this.organizations = JSON.parse(savedOrgs);
    } catch {
      // Fallback to initial seed
    }
  }

  private persist() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_ORG, this.currentOrgId);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, this.currentUserId);
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(this.contacts));
      localStorage.setItem(STORAGE_KEYS.DEALS, JSON.stringify(this.deals));
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(this.activities));
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(this.appointments));
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(this.notes));
      localStorage.setItem(STORAGE_KEYS.AUTOMATIONS, JSON.stringify(this.automations));
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(this.jobs));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
      localStorage.setItem(STORAGE_KEYS.ORGANIZATIONS, JSON.stringify(this.organizations));
    } catch {
      // ignore
    }
  }

  private notify() {
    this.persist();
    this.listeners.forEach((listener) => listener());
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // BullMQ & Redis Simulated Worker Loop
  private startWorkerSimulation() {
    if (this.workerInterval) return;
    this.workerInterval = setInterval(() => {
      let changed = false;

      // Look for waiting or active jobs
      this.jobs = this.jobs.map((job) => {
        if (job.status === 'WAITING') {
          changed = true;
          return {
            ...job,
            status: 'ACTIVE',
            progress: 25,
            processedAt: new Date().toISOString(),
          };
        } else if (job.status === 'ACTIVE') {
          if (job.progress < 85) {
            changed = true;
            return {
              ...job,
              progress: Math.min(100, job.progress + 35),
            };
          } else {
            changed = true;
            return {
              ...job,
              status: 'COMPLETED',
              progress: 100,
              durationMs: Math.floor(Math.random() * 800) + 200,
            };
          }
        }
        return job;
      });

      if (changed) {
        this.notify();
      }
    }, 2800);
  }

  // Multi-Tenant Accessors (scoping by organizationId)
  public getCurrentOrg(): Organization {
    const org = this.organizations.find((o) => o.id === this.currentOrgId);
    return org || this.organizations[0];
  }

  public getAllOrganizations(): Organization[] {
    return this.organizations;
  }

  public getCurrentUser(): User {
    const user = this.users.find((u) => u.id === this.currentUserId);
    if (user && user.organizationId === this.currentOrgId) return user;
    // fallback to first user in org
    const orgUser = this.users.find((u) => u.organizationId === this.currentOrgId);
    return orgUser || this.users[0];
  }

  public getOrgUsers(): User[] {
    return this.users.filter((u) => u.organizationId === this.currentOrgId);
  }

  public getOrgPipelines(): Pipeline[] {
    return this.pipelines.filter((p) => p.organizationId === this.currentOrgId);
  }

  public getOrgContacts(): Contact[] {
    return this.contacts.filter((c) => c.organizationId === this.currentOrgId);
  }

  public getOrgDeals(): Deal[] {
    return this.deals.filter((d) => d.organizationId === this.currentOrgId);
  }

  public getOrgAppointments(): Appointment[] {
    return this.appointments.filter((a) => a.organizationId === this.currentOrgId);
  }

  public getOrgNotes(contactId?: string): Note[] {
    return this.notes.filter(
      (n) => n.organizationId === this.currentOrgId && (!contactId || n.contactId === contactId)
    );
  }

  public getOrgActivities(contactId?: string): Activity[] {
    return this.activities.filter(
      (a) => a.organizationId === this.currentOrgId && (!contactId || a.contactId === contactId)
    );
  }

  public getOrgAutomations(): AutomationWorkflow[] {
    return this.automations.filter((a) => a.organizationId === this.currentOrgId);
  }

  public getOrgJobs(): AsyncJob[] {
    return this.jobs.filter((j) => j.organizationId === this.currentOrgId);
  }

  // Tenancy & RBAC Switching
  public setOrganization(orgId: string) {
    this.currentOrgId = orgId;
    // adjust user to someone in that org
    const orgUser = this.users.find((u) => u.organizationId === orgId);
    if (orgUser) this.currentUserId = orgUser.id;
    this.notify();
  }

  public setCurrentUser(userId: string) {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      this.currentUserId = userId;
      if (user.organizationId !== this.currentOrgId) {
        this.currentOrgId = user.organizationId;
      }
      this.notify();
    }
  }

  public updateUserRole(userId: string, newRole: Role) {
    this.users = this.users.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
    this.notify();
  }

  public inviteMember(name: string, email: string, role: Role, title: string) {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      organizationId: this.currentOrgId,
      name,
      email,
      role,
      title: title || 'Growth Specialist',
      avatar: '/avatars/avatar_sarah_chen_1792687122471.jpg',
    };
    this.users.push(newUser);
    this.notify();
    return newUser;
  }

  // Pipeline & Deal Mutations
  public moveDealStage(dealId: string, targetStageId: string): { deal: Deal; won: boolean } | null {
    const deal = this.deals.find((d) => d.id === dealId && d.organizationId === this.currentOrgId);
    if (!deal) return null;

    const pipeline = this.pipelines.find((p) => p.id === deal.pipelineId);
    const targetStage = pipeline?.stages.find((s) => s.id === targetStageId);
    if (!targetStage) return null;

    const oldStage = pipeline?.stages.find((s) => s.id === deal.stageId);
    const isWon = targetStage.name.toLowerCase().includes('won');

    // Optimistically update
    deal.stageId = targetStageId;
    deal.updatedAt = new Date().toISOString();

    // Log Activity
    const activity: Activity = {
      id: `act-${Date.now()}`,
      organizationId: this.currentOrgId,
      contactId: deal.contactId,
      userId: this.currentUserId,
      type: 'STAGE_CHANGE',
      title: isWon ? '🏆 Deal Closed Won!' : 'Pipeline Stage Shift',
      description: `Moved "${deal.title}" from "${oldStage?.name || 'Stage'}" to "${targetStage.name}" (${new Intl.NumberFormat('en-US', { style: 'currency', currency: deal.currency, maximumFractionDigits: 0 }).format(deal.value)}).`,
      timestamp: new Date().toISOString(),
    };
    this.activities.unshift(activity);

    // If target stage triggers automations
    this.evaluateStageAutomations(deal, targetStage, isWon);

    this.notify();
    return { deal, won: isWon };
  }

  private evaluateStageAutomations(deal: Deal, stage: { id: string; name: string }, isWon: boolean) {
    const orgAutomations = this.getOrgAutomations().filter((a) => a.active);
    const contact = this.contacts.find((c) => c.id === deal.contactId);

    orgAutomations.forEach((automation) => {
      let triggered = false;

      if (automation.triggerType === 'STAGE_CHANGED' && automation.triggerConfig.stageId === stage.id) {
        triggered = true;
      } else if (automation.triggerType === 'DEAL_WON' && isWon) {
        triggered = true;
      }

      if (triggered) {
        automation.executionCount += 1;
        automation.lastTriggeredAt = new Date().toISOString();

        // Enqueue actions to BullMQ simulated queues
        automation.actions.forEach((action, idx) => {
          let queueName: QueueName = 'email-sequence';
          let jobName = `auto_${automation.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

          if (action.type === 'SEND_EMAIL') {
            queueName = 'email-sequence';
            jobName = 'send_automated_email';
          } else if (action.type === 'SLACK_NOTIFY') {
            queueName = 'webhook-dispatch';
            jobName = 'dispatch_slack_alert';
          } else if (action.type === 'DELAY') {
            queueName = 'followup-reminder';
            jobName = `delay_${action.config.delayMinutes || 60}m_workflow`;
          } else if (action.type === 'ADD_TAG') {
            queueName = 'automation-worker';
            jobName = 'sync_contact_tags';
            if (contact && action.config.tagToAdd && !contact.tags.includes(action.config.tagToAdd)) {
              contact.tags.push(action.config.tagToAdd);
            }
          }

          const newJob: AsyncJob = {
            id: `job-${Date.now()}-${idx}`,
            organizationId: this.currentOrgId,
            queueName,
            name: jobName,
            status: action.type === 'DELAY' ? 'DELAYED' : 'WAITING',
            data: {
              dealId: deal.id,
              dealTitle: deal.title,
              amount: deal.value,
              contactEmail: contact?.email,
              actionLabel: action.label,
              config: action.config,
            },
            progress: 0,
            attempts: 0,
            maxAttempts: 3,
            delayMs: action.type === 'DELAY' ? (action.config.delayMinutes || 60) * 60 * 1000 : undefined,
            createdAt: new Date().toISOString(),
          };

          this.jobs.unshift(newJob);
        });

        // Add an activity record
        this.activities.unshift({
          id: `act-auto-${Date.now()}`,
          organizationId: this.currentOrgId,
          contactId: deal.contactId,
          userId: this.currentUserId,
          type: 'AUTOMATION',
          title: `Automation Triggered: ${automation.name}`,
          description: `Dispatched ${automation.actions.length} async background job(s) via automation engine.`,
          timestamp: new Date().toISOString(),
        });
      }
    });
  }

  public createDeal(dealData: Partial<Deal>): Deal {
    const pipeline = this.getOrgPipelines()[0];
    const firstStage = pipeline?.stages[0];

    const newDeal: Deal = {
      id: `deal-${Date.now()}`,
      organizationId: this.currentOrgId,
      title: dealData.title || 'New Opportunity',
      value: dealData.value || 25000,
      currency: dealData.currency || 'USD',
      contactId: dealData.contactId || this.getOrgContacts()[0]?.id || '',
      pipelineId: dealData.pipelineId || pipeline?.id || '',
      stageId: dealData.stageId || firstStage?.id || '',
      priority: dealData.priority || 'MEDIUM',
      expectedCloseDate: dealData.expectedCloseDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      assignedTo: dealData.assignedTo || this.currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.deals.unshift(newDeal);

    // Record creation activity
    this.activities.unshift({
      id: `act-${Date.now()}`,
      organizationId: this.currentOrgId,
      contactId: newDeal.contactId,
      userId: this.currentUserId,
      type: 'STAGE_CHANGE',
      title: 'Deal Created',
      description: `Created new deal "${newDeal.title}" with expected value of ${new Intl.NumberFormat('en-US', { style: 'currency', currency: newDeal.currency, maximumFractionDigits: 0 }).format(newDeal.value)}.`,
      timestamp: new Date().toISOString(),
    });

    this.notify();
    return newDeal;
  }

  public updateDeal(dealId: string, updates: Partial<Deal>) {
    this.deals = this.deals.map((d) =>
      d.id === dealId && d.organizationId === this.currentOrgId
        ? { ...d, ...updates, updatedAt: new Date().toISOString() }
        : d
    );
    this.notify();
  }

  public deleteDeal(dealId: string) {
    this.deals = this.deals.filter((d) => d.id !== dealId);
    this.notify();
  }

  // Contact Operations
  public createContact(contactData: Partial<Contact>): Contact {
    const newContact: Contact = {
      id: `cnt-${Date.now()}`,
      organizationId: this.currentOrgId,
      firstName: contactData.firstName || 'New',
      lastName: contactData.lastName || 'Contact',
      email: contactData.email || 'lead@example.com',
      phone: contactData.phone || '+1 (555) 000-0000',
      company: contactData.company || 'Enterprise Prospect',
      status: contactData.status || 'LEAD',
      tags: contactData.tags || ['Inbound'],
      lifetimeValue: contactData.lifetimeValue || 0,
      ownerId: contactData.ownerId || this.currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notesCount: 0,
    };

    this.contacts.unshift(newContact);

    this.activities.unshift({
      id: `act-${Date.now()}`,
      organizationId: this.currentOrgId,
      contactId: newContact.id,
      userId: this.currentUserId,
      type: 'NOTE',
      title: 'Contact Created',
      description: `Added ${newContact.firstName} ${newContact.lastName} from ${newContact.company} to the CRM database.`,
      timestamp: new Date().toISOString(),
    });

    this.notify();
    return newContact;
  }

  public updateContact(contactId: string, updates: Partial<Contact>) {
    this.contacts = this.contacts.map((c) =>
      c.id === contactId && c.organizationId === this.currentOrgId
        ? { ...c, ...updates, updatedAt: new Date().toISOString() }
        : c
    );
    this.notify();
  }

  public deleteContact(contactId: string) {
    this.contacts = this.contacts.filter((c) => c.id !== contactId);
    this.deals = this.deals.filter((d) => d.contactId !== contactId);
    this.appointments = this.appointments.filter((a) => a.contactId !== contactId);
    this.notes = this.notes.filter((n) => n.contactId !== contactId);
    this.notify();
  }

  // Notes & Activity Logging
  public addNote(contactId: string, content: string): Note {
    const newNote: Note = {
      id: `nte-${Date.now()}`,
      organizationId: this.currentOrgId,
      contactId,
      authorId: this.currentUserId,
      content,
      createdAt: new Date().toISOString(),
    };

    this.notes.unshift(newNote);

    // update contact note count
    const contact = this.contacts.find((c) => c.id === contactId);
    if (contact) {
      contact.notesCount += 1;
      contact.updatedAt = new Date().toISOString();
    }

    this.activities.unshift({
      id: `act-${Date.now()}`,
      organizationId: this.currentOrgId,
      contactId,
      userId: this.currentUserId,
      type: 'NOTE',
      title: 'Note Added',
      description: content.length > 90 ? content.slice(0, 90) + '...' : content,
      timestamp: new Date().toISOString(),
    });

    this.notify();
    return newNote;
  }

  public logActivity(
    contactId: string,
    type: ActivityType,
    title: string,
    description: string
  ): Activity {
    const activity: Activity = {
      id: `act-${Date.now()}`,
      organizationId: this.currentOrgId,
      contactId,
      userId: this.currentUserId,
      type,
      title,
      description,
      timestamp: new Date().toISOString(),
    };

    this.activities.unshift(activity);

    const contact = this.contacts.find((c) => c.id === contactId);
    if (contact) {
      contact.lastContactedAt = new Date().toISOString();
      contact.updatedAt = new Date().toISOString();
    }

    this.notify();
    return activity;
  }

  // Appointments
  public createAppointment(aptData: Partial<Appointment>): Appointment {
    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      organizationId: this.currentOrgId,
      title: aptData.title || 'Client Strategy Session',
      startTime: aptData.startTime || new Date(Date.now() + 86400000).toISOString(),
      endTime: aptData.endTime || new Date(Date.now() + 86400000 + 3600000).toISOString(),
      contactId: aptData.contactId || this.getOrgContacts()[0]?.id || '',
      assignedUserId: aptData.assignedUserId || this.currentUserId,
      locationType: aptData.locationType || 'ZOOM',
      status: 'SCHEDULED',
      meetingUrl: aptData.meetingUrl || (aptData.locationType === 'ZOOM' ? 'https://zoom.us/j/849201928' : undefined),
      notes: aptData.notes,
      createdAt: new Date().toISOString(),
    };

    this.appointments.unshift(newApt);

    // Activity
    this.activities.unshift({
      id: `act-${Date.now()}`,
      organizationId: this.currentOrgId,
      contactId: newApt.contactId,
      userId: this.currentUserId,
      type: 'MEETING',
      title: 'Appointment Booked',
      description: `Scheduled "${newApt.title}" (${newApt.locationType}) for ${new Date(newApt.startTime).toLocaleDateString()}.`,
      timestamp: new Date().toISOString(),
    });

    this.notify();
    return newApt;
  }

  public updateAppointmentStatus(aptId: string, status: AppointmentStatus) {
    this.appointments = this.appointments.map((a) =>
      a.id === aptId && a.organizationId === this.currentOrgId ? { ...a, status } : a
    );
    this.notify();
  }

  // Automations
  public toggleAutomation(automationId: string) {
    this.automations = this.automations.map((a) =>
      a.id === automationId && a.organizationId === this.currentOrgId ? { ...a, active: !a.active } : a
    );
    this.notify();
  }

  public saveAutomation(wf: AutomationWorkflow) {
    const index = this.automations.findIndex((a) => a.id === wf.id);
    if (index >= 0) {
      this.automations[index] = wf;
    } else {
      this.automations.push(wf);
    }
    this.notify();
  }

  // BullMQ Jobs Engine Controls
  public dispatchJob(queueName: QueueName, name: string, data: Record<string, any>) {
    const job: AsyncJob = {
      id: `job-${Date.now()}`,
      organizationId: this.currentOrgId,
      queueName,
      name,
      status: 'WAITING',
      data,
      progress: 0,
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date().toISOString(),
    };
    this.jobs.unshift(job);
    this.notify();
    return job;
  }

  public retryJob(jobId: string) {
    this.jobs = this.jobs.map((j) => {
      if (j.id === jobId) {
        return {
          ...j,
          status: 'WAITING',
          attempts: j.attempts + 1,
          progress: 0,
          error: undefined,
          createdAt: new Date().toISOString(),
        };
      }
      return j;
    });
    this.notify();
  }

  public simulateBatchInboundJobs() {
    const sampleJobs = [
      { queue: 'email-sequence' as QueueName, name: 'dispatch_client_q4_summary', data: { campaign: 'VIP Agency Pulse' } },
      { queue: 'webhook-dispatch' as QueueName, name: 'sync_stripe_invoice_webhook', data: { invoiceId: 'in_9921_rec' } },
      { queue: 'followup-reminder' as QueueName, name: 'evaluate_stalled_deal_sla', data: { threshold: '48h' } },
      { queue: 'automation-worker' as QueueName, name: 'run_lead_enrichment_enricher', data: { provider: 'Apollo' } },
    ];

    sampleJobs.forEach((s, idx) => {
      setTimeout(() => {
        this.dispatchJob(s.queue, s.name, s.data);
      }, idx * 400);
    });
  }

  public triggerCsvExport(): AsyncJob {
    const job = this.dispatchJob('csv-export', 'stream_contacts_csv_export', {
      totalContacts: this.getOrgContacts().length,
      requester: this.getCurrentUser().email,
      timestamp: new Date().toISOString(),
    });
    return job;
  }
}

// Singleton Instance
export const crmStore = new CRMStoreManager();

// React Hook to consume reactive state cleanly
export function useCRM() {
  const [, setTick] = useState(0);

  useEffect(() => {
    crmStore.initClient();
    const unsubscribe = crmStore.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  const currentOrg = crmStore.getCurrentOrg();
  const currentUser = crmStore.getCurrentUser();
  const allOrgs = crmStore.getAllOrganizations();
  const orgUsers = crmStore.getOrgUsers();
  const pipelines = crmStore.getOrgPipelines();
  const contacts = crmStore.getOrgContacts();
  const deals = crmStore.getOrgDeals();
  const appointments = crmStore.getOrgAppointments();
  const automations = crmStore.getOrgAutomations();
  const jobs = crmStore.getOrgJobs();
  const activities = crmStore.getOrgActivities();

  const userHasPermission = useCallback(
    (permission: AppPermission) => hasPermission(currentUser.role, permission),
    [currentUser.role]
  );

  return {
    currentOrg,
    currentUser,
    allOrgs,
    orgUsers,
    pipelines,
    contacts,
    deals,
    appointments,
    automations,
    jobs,
    activities,
    hasPermission: userHasPermission,
    setOrganization: (orgId: string) => crmStore.setOrganization(orgId),
    setCurrentUser: (userId: string) => crmStore.setCurrentUser(userId),
    updateUserRole: (userId: string, role: Role) => crmStore.updateUserRole(userId, role),
    inviteMember: (name: string, email: string, role: Role, title: string) =>
      crmStore.inviteMember(name, email, role, title),
    moveDealStage: (dealId: string, stageId: string) => crmStore.moveDealStage(dealId, stageId),
    createDeal: (data: Partial<Deal>) => crmStore.createDeal(data),
    updateDeal: (id: string, updates: Partial<Deal>) => crmStore.updateDeal(id, updates),
    deleteDeal: (id: string) => crmStore.deleteDeal(id),
    createContact: (data: Partial<Contact>) => crmStore.createContact(data),
    updateContact: (id: string, updates: Partial<Contact>) => crmStore.updateContact(id, updates),
    deleteContact: (id: string) => crmStore.deleteContact(id),
    addNote: (contactId: string, content: string) => crmStore.addNote(contactId, content),
    logActivity: (contactId: string, type: ActivityType, title: string, desc: string) =>
      crmStore.logActivity(contactId, type, title, desc),
    createAppointment: (data: Partial<Appointment>) => crmStore.createAppointment(data),
    updateAppointmentStatus: (id: string, status: AppointmentStatus) =>
      crmStore.updateAppointmentStatus(id, status),
    toggleAutomation: (id: string) => crmStore.toggleAutomation(id),
    saveAutomation: (wf: AutomationWorkflow) => crmStore.saveAutomation(wf),
    dispatchJob: (queue: QueueName, name: string, data: any) => crmStore.dispatchJob(queue, name, data),
    retryJob: (id: string) => crmStore.retryJob(id),
    simulateBatchInboundJobs: () => crmStore.simulateBatchInboundJobs(),
    triggerCsvExport: () => crmStore.triggerCsvExport(),
    getContactNotes: (contactId: string) => crmStore.getOrgNotes(contactId),
    getContactActivities: (contactId: string) => crmStore.getOrgActivities(contactId),
  };
}
