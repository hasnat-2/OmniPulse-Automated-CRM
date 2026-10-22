'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  Mail,
  Phone,
  Building2,
  Calendar,
  FileText,
  Clock,
  Plus,
  Send,
  CheckCircle,
  Tag,
  DollarSign,
  User,
} from 'lucide-react';
import { useCRM } from '@/lib/crm-store';
import { useToast } from '@/components/ui/Toast';
import { Contact, ActivityType } from '@/types/crm';
import { formatDateTime, formatDate } from '@/lib/date-utils';

interface ContactSlideOverProps {
  contact: Contact | null;
  onClose: () => void;
}

export function ContactSlideOver({ contact, onClose }: ContactSlideOverProps) {
  const {
    getContactNotes,
    getContactActivities,
    addNote,
    logActivity,
    updateContact,
    orgUsers,
    deals,
    appointments,
    hasPermission,
  } = useCRM();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'timeline' | 'notes' | 'deals' | 'details'>('timeline');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isLoggingCall, setIsLoggingCall] = useState(false);
  const [callNotes, setCallNotes] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  if (!contact) return null;

  const notes = getContactNotes(contact.id);
  const activities = getContactActivities(contact.id);
  const contactDeals = deals.filter((d) => d.contactId === contact.id);
  const contactAppointments = appointments.filter((a) => a.contactId === contact.id);
  const owner = orgUsers.find((u) => u.id === contact.ownerId);

  const canViewFinancials = hasPermission('VIEW_FINANCIALS');

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    addNote(contact.id, newNoteContent.trim());
    setNewNoteContent('');
    toast('Note Added', 'Internal note recorded on contact profile.', 'success');
  };

  const handleLogCall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callNotes.trim()) return;

    logActivity(
      contact.id,
      'CALL',
      'Client Phone Interaction Logged',
      callNotes.trim()
    );
    setCallNotes('');
    setIsLoggingCall(false);
    toast('Call Logged', 'Phone interaction recorded to timeline.', 'success');
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSubject.trim() || !emailBody.trim()) return;

    logActivity(
      contact.id,
      'EMAIL',
      `Sent: ${emailSubject.trim()}`,
      emailBody.trim()
    );
    setEmailSubject('');
    setEmailBody('');
    setIsSendingEmail(false);
    toast('Email Dispatched', `Simulated delivery to ${contact.email}`, 'success');
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'EMAIL':
        return <Mail className="w-3.5 h-3.5 text-indigo-600" />;
      case 'CALL':
        return <Phone className="w-3.5 h-3.5 text-cyan-600" />;
      case 'MEETING':
        return <Calendar className="w-3.5 h-3.5 text-amber-600" />;
      case 'STAGE_CHANGE':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Slide-over Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                {contact.firstName.charAt(0)}
                {contact.lastName.charAt(0)}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {contact.firstName} {contact.lastName}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{contact.company}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-slate-600">{contact.status}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Button Strip */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => {
                setIsSendingEmail(true);
                setIsLoggingCall(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Mail className="w-3.5 h-3.5 text-indigo-600" />
              <span>Send Email</span>
            </button>
            <button
              onClick={() => {
                setIsLoggingCall(true);
                setIsSendingEmail(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Phone className="w-3.5 h-3.5 text-cyan-600" />
              <span>Log Call</span>
            </button>
            <div className="ml-auto text-xs text-slate-500 font-mono">
              LTV: <span className="font-semibold text-slate-900 tabular-nums">{canViewFinancials ? `$${contact.lifetimeValue.toLocaleString()}` : '••••••'}</span>
            </div>
          </div>
        </div>

        {/* Modal Inline Forms for Log Call or Send Email */}
        {isLoggingCall && (
          <form onSubmit={handleLogCall} className="p-4 bg-cyan-50/50 border-b border-cyan-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-cyan-900">Log Phone Call Interaction</span>
              <button
                type="button"
                onClick={() => setIsLoggingCall(false)}
                className="text-xs text-cyan-700 hover:text-cyan-900"
              >
                Cancel
              </button>
            </div>
            <textarea
              required
              rows={2}
              value={callNotes}
              onChange={(e) => setCallNotes(e.target.value)}
              placeholder="Summary of phone call, client objections, next steps agreed upon..."
              className="w-full p-2 text-xs bg-white border border-cyan-200 rounded-md focus:outline-hidden"
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                className="px-3 py-1 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-md"
              >
                Save Call Entry
              </button>
            </div>
          </form>
        )}

        {isSendingEmail && (
          <form onSubmit={handleSendEmail} className="p-4 bg-indigo-50/50 border-b border-indigo-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-900">Simulate Direct Email Dispatch</span>
              <button
                type="button"
                onClick={() => setIsSendingEmail(false)}
                className="text-xs text-indigo-700 hover:text-indigo-900"
              >
                Cancel
              </button>
            </div>
            <input
              type="text"
              required
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Email Subject Line"
              className="w-full p-2 text-xs bg-white border border-indigo-200 rounded-md focus:outline-hidden"
            />
            <textarea
              required
              rows={3}
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder={`Write email message to ${contact.firstName}...`}
              className="w-full p-2 text-xs bg-white border border-indigo-200 rounded-md focus:outline-hidden"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
              >
                <Send className="w-3 h-3" />
                <span>Send Email</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-5 text-xs font-medium">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'timeline'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Activity Timeline ({activities.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'notes'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Internal Notes ({notes.length})
          </button>
          <button
            onClick={() => setActiveTab('deals')}
            className={`py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'deals'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Deals ({contactDeals.length})
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Metadata & Tags
          </button>
        </div>

        {/* Tab Content Viewport */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {activities.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No activities recorded yet.</p>
              ) : (
                <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {activities.map((act) => {
                    const formatted = formatDateTime(act.timestamp);
                    return (
                      <div key={act.id} className="relative text-xs">
                        <div className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-white border border-slate-300 flex items-center justify-center">
                          {getActivityIcon(act.type)}
                        </div>
                        <div className="flex items-center justify-between text-slate-400 text-[11px] mb-0.5 font-mono">
                          <span className="font-semibold text-slate-800">{act.title}</span>
                          <span>{formatted}</span>
                        </div>
                        <p className="text-slate-600 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                          {act.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  rows={3}
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Record an internal meeting note, budget confirmation, or strategic insight..."
                  className="w-full p-3 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save Note</span>
                  </button>
                </div>
              </form>

              <div className="divide-y divide-slate-100">
                {notes.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No internal notes written yet.</p>
                ) : (
                  notes.map((note) => {
                    const author = orgUsers.find((u) => u.id === note.authorId);
                    const formatted = formatDate(note.createdAt);
                    return (
                      <div key={note.id} className="py-3 text-xs space-y-1">
                        <div className="flex items-center justify-between text-slate-400 text-[11px]">
                          <span className="font-medium text-slate-700">{author?.name || 'Team Member'}</span>
                          <span className="font-mono">{formatted}</span>
                        </div>
                        <p className="text-slate-700 whitespace-pre-wrap">{note.content}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Deals Tab */}
          {activeTab === 'deals' && (
            <div className="space-y-3">
              {contactDeals.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No deals currently linked to this contact.</p>
              ) : (
                contactDeals.map((d) => (
                  <div key={d.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{d.title}</span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        {canViewFinancials ? `$${d.value.toLocaleString()}` : '••••••'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                      <span>Priority: {d.priority}</span>
                      <span>·</span>
                      <span>Close: {d.expectedCloseDate}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Details & Tags Tab */}
          {activeTab === 'details' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[11px] block">Email</span>
                  <a href={`mailto:${contact.email}`} className="text-indigo-600 font-medium">
                    {contact.email}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Phone</span>
                  <span className="font-mono text-slate-800">{contact.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Company</span>
                  <span className="text-slate-800 font-medium">{contact.company}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Owner</span>
                  <span className="text-slate-800">{owner?.name || 'Unassigned'}</span>
                </div>
              </div>

              {/* Zero-Pill Tags Presentation */}
              <div className="space-y-1">
                <span className="text-slate-400 text-[11px] block">Categorization Tags</span>
                <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap">
                  {contact.tags.map((tag, idx) => (
                    <React.Fragment key={tag}>
                      <span className="font-medium text-slate-700">#{tag}</span>
                      {idx < contact.tags.length - 1 && <span className="text-slate-300">·</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="pt-2 text-slate-400 text-[11px]">
                Created on {formatDate(contact.createdAt)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
