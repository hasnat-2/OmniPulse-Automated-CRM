'use client';

import React, { useState } from 'react';
import { X, DollarSign, Briefcase } from 'lucide-react';
import { useCRM } from '@/lib/crm-store';
import { useToast } from '@/components/ui/Toast';
import { DealPriority } from '@/types/crm';
import { useQueryClient } from '@tanstack/react-query';

interface AddDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStageId?: string;
}

export function AddDealModal({ isOpen, onClose, defaultStageId }: AddDealModalProps) {
  const { contacts, pipelines, orgUsers, createDeal } = useCRM();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const currentPipeline = pipelines[0];

  const [title, setTitle] = useState('');
  const [value, setValue] = useState('45000');
  const [contactId, setContactId] = useState(contacts[0]?.id || '');
  const [stageId, setStageId] = useState(defaultStageId || currentPipeline?.stages[0]?.id || '');
  const [priority, setPriority] = useState<DealPriority>('HIGH');
  const [expectedCloseDate, setExpectedCloseDate] = useState(() =>
    new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
  );
  const [assignedTo, setAssignedTo] = useState(orgUsers[0]?.id || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const numValue = parseFloat(value) || 0;
    const newDeal = createDeal({
      title: title.trim(),
      value: numValue,
      contactId,
      pipelineId: currentPipeline?.id,
      stageId: stageId || currentPipeline?.stages[0]?.id,
      priority,
      expectedCloseDate,
      assignedTo,
    });

    queryClient.invalidateQueries({ queryKey: ['pipeline'] });
    queryClient.invalidateQueries({ queryKey: ['deals'] });

    toast('Deal Created', `Added "${newDeal.title}" to pipeline ($${numValue.toLocaleString()}).`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Create New Sales Deal</h3>
              <p className="text-[11px] text-slate-400">Add an opportunity to your active sales pipeline</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deal Title / Mandate Name *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q4 Brand Identity Sprint & Retainer"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Deal Value (USD) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-mono text-slate-400">$</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  required
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full pl-6 pr-3 py-2 text-xs font-mono font-semibold border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority Tier
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as DealPriority)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Associated Contact *
              </label>
              <select
                required
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.company})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pipeline Stage
              </label>
              <select
                value={stageId}
                onChange={(e) => setStageId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {currentPipeline?.stages.map((stg) => (
                  <option key={stg.id} value={stg.id}>
                    {stg.name} ({stg.probability}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expected Close Date
              </label>
              <input
                type="date"
                value={expectedCloseDate}
                onChange={(e) => setExpectedCloseDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Team Member
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {orgUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
            >
              Create Deal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
