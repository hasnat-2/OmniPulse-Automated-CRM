'use client';

import React, { useState } from 'react';
import {
  Zap,
  Play,
  CheckCircle,
  Clock,
  Layers,
  Sparkles,
  Settings,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useCRM } from '@/lib/crm-store';
import { useToast } from '@/components/ui/Toast';
import { AutomationWorkflow } from '@/types/crm';
import { WorkflowCanvas } from '@/components/automations/WorkflowCanvas';

export function AutomationsView() {
  const { automations, toggleAutomation, saveAutomation, hasPermission, currentUser } = useCRM();
  const { toast } = useToast();

  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(
    automations[0]?.id || ''
  );

  const canManageAutomations = hasPermission('MANAGE_AUTOMATIONS');

  const selectedWorkflow = automations.find((a) => a.id === selectedWorkflowId) || automations[0];

  const handleToggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canManageAutomations) {
      toast(
        'Permission Restricted',
        `Role (${currentUser.role}) cannot toggle live workflows. Requires ADMIN or OWNER.`,
        'error'
      );
      return;
    }
    toggleAutomation(id);
    toast('Workflow Status Changed', 'Updated active background trigger state.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Viewport Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Event-Driven Sales Automations
            </h1>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              BullMQ & Redis Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Visual trigger-action builder, delayed sequence schedulers, and automated email reminders.
          </p>
        </div>

        {!canManageAutomations && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>Viewer Mode: Role ({currentUser.role}) has read-only access to workflows</span>
          </div>
        )}
      </div>

      {/* Main 2-Column Layout: Workflow List (4 cols) & Visual Node Canvas (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Workflows Directory */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Active Sequences ({automations.length})
          </div>

          <div className="space-y-2">
            {automations.map((wf) => {
              const isSelected = wf.id === selectedWorkflowId;

              return (
                <div
                  key={wf.id}
                  onClick={() => setSelectedWorkflowId(wf.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-white border-indigo-500 shadow-sm ring-1 ring-indigo-500/10'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          wf.active ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      />
                      <h3 className="font-bold text-slate-900 line-clamp-1">{wf.name}</h3>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={(e) => handleToggle(wf.id, e)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        wf.active ? 'bg-indigo-600' : 'bg-slate-200'
                      }`}
                      title={wf.active ? 'Disable workflow' : 'Enable workflow'}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                          wf.active ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <p className="text-slate-500 text-[11px] mt-1.5 line-clamp-2">
                    {wf.description}
                  </p>

                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
                    <span>{wf.actions.length} action nodes</span>
                    <span className="tabular-nums font-semibold text-slate-700">
                      {wf.executionCount} executions
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Engine Spec Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              <span>Queue Architecture</span>
            </h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Automations enqueue async jobs into BullMQ queues with exponential retry policies (3x backoff), isolated by organization ID.
            </p>
          </div>
        </div>

        {/* Right Column: Visual Canvas */}
        <div className="lg:col-span-8">
          {selectedWorkflow ? (
            <WorkflowCanvas
              workflow={selectedWorkflow}
              onSave={(updated) => saveAutomation(updated)}
            />
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 text-xs">
              Select or create an automation workflow to inspect its node structure.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
