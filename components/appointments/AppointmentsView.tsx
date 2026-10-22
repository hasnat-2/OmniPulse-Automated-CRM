'use client';

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Phone,
  MapPin,
  Plus,
  CheckCircle,
  X,
  ExternalLink,
} from 'lucide-react';
import { useCRM } from '@/lib/crm-store';
import { useToast } from '@/components/ui/Toast';
import { Appointment, LocationType } from '@/types/crm';
import { formatShortDate, formatTime } from '@/lib/date-utils';

export function AppointmentsView() {
  const { appointments, contacts, orgUsers, updateAppointmentStatus, createAppointment } = useCRM();
  const { toast } = useToast();

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [contactId, setContactId] = useState(contacts[0]?.id || '');
  const [locationType, setLocationType] = useState<LocationType>('ZOOM');
  const [date, setDate] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [time, setTime] = useState('14:00');
  const [notes, setNotes] = useState('');

  const handleMarkCompleted = (apt: Appointment) => {
    updateAppointmentStatus(apt.id, 'COMPLETED');
    toast('Meeting Completed', `Marked "${apt.title}" as completed.`, 'success');
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const start = new Date(`${date}T${time}:00Z`).toISOString();
    const end = new Date(new Date(start).getTime() + 45 * 60000).toISOString();

    createAppointment({
      title: title.trim(),
      startTime: start,
      endTime: end,
      contactId,
      locationType,
      notes: notes.trim(),
      meetingUrl: locationType === 'ZOOM' ? 'https://zoom.us/j/98127391823' : locationType === 'MEET' ? 'https://meet.google.com/xyz-qwer-abc' : undefined,
    });

    toast('Appointment Booked', `Scheduled "${title}" on calendar.`, 'success');
    setIsScheduleModalOpen(false);
    setTitle('');
  };

  const getLocationIcon = (type: LocationType) => {
    switch (type) {
      case 'ZOOM':
      case 'MEET':
        return <Video className="w-3.5 h-3.5 text-indigo-600" />;
      case 'PHONE':
        return <Phone className="w-3.5 h-3.5 text-cyan-600" />;
      case 'IN_PERSON':
        return <MapPin className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Client Discovery Calls & Executive Walkthroughs
            </h1>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {appointments.length} Meetings
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Synchronized scheduling, Zoom integration, and follow-up automated activity logs.
          </p>
        </div>

        <button
          onClick={() => setIsScheduleModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Schedule Meeting</span>
        </button>
      </div>

      {/* Appointment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {appointments.map((apt) => {
          const contact = contacts.find((c) => c.id === apt.contactId);
          const assignedUser = orgUsers.find((u) => u.id === apt.assignedUserId);
          const dateStr = formatShortDate(apt.startTime);
          const timeStr = formatTime(apt.startTime);

          return (
            <div
              key={apt.id}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors text-xs space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-100">
                      {getLocationIcon(apt.locationType)}
                    </div>
                    <span className="font-mono text-[11px] text-slate-500">{apt.locationType}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${
                      apt.status === 'COMPLETED'
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : 'text-indigo-700 bg-indigo-50 border-indigo-200'
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mb-1">{apt.title}</h3>

                {contact && (
                  <p className="text-slate-600 text-xs mb-2">
                    Client: <span className="font-semibold text-slate-800">{contact.firstName} {contact.lastName}</span> · {contact.company}
                  </p>
                )}

                <div className="flex items-center gap-3 text-slate-500 text-[11px] font-mono bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>{dateStr}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{timeStr}</span>
                  </div>
                </div>

                {apt.notes && (
                  <p className="mt-2 text-[11px] text-slate-500 italic bg-slate-50/50 p-2 rounded">
                    &quot;{apt.notes}&quot;
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                {apt.meetingUrl ? (
                  <a
                    href={apt.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    <span>Launch Room</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-400">Direct Contact</span>
                )}

                {apt.status === 'SCHEDULED' && (
                  <button
                    onClick={() => handleMarkCompleted(apt)}
                    className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md transition-colors"
                  >
                    <CheckCircle className="w-3 h-3" />
                    <span>Mark Complete</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Schedule Client Meeting</h3>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Meeting Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q4 Scope Walkthrough & Proposal"
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Client Contact *</label>
                <select
                  value={contactId}
                  onChange={(e) => setContactId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                >
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} ({c.company})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time (UTC)</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Meeting Medium</label>
                <select
                  value={locationType}
                  onChange={(e) => setLocationType(e.target.value as LocationType)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                >
                  <option value="ZOOM">Zoom Video Conference</option>
                  <option value="MEET">Google Meet</option>
                  <option value="PHONE">Direct Phone Call</option>
                  <option value="IN_PERSON">In-Person Meeting</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Agenda / Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Key milestones to review during call..."
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-3 py-1.5 font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
