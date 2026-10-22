'use client';

import React, { useState } from 'react';
import {
  Zap,
  Clock,
  Mail,
  CheckSquare,
  MessageSquare,
  Tag,
  ArrowDown,
  Play,
  Settings,
  Plus,
  Trash2,
} from 'lucide-react';
import { AutomationWorkflow, WorkflowAction, ActionType } from '@/types/crm';
import { useCRM } from '@/lib/crm-store';
import { useToast } from '@/components/ui/Toast';

interface WorkflowCanvasProps {
  workflow: AutomationWorkflow;
  onSave: (updated: AutomationWorkflow) => void;
}

export function WorkflowCanvas({ workflow, onSave }: WorkflowCanvasProps) {
  const { pipelines, dispatchJob } = useCRM();
  const { toast } = useToast();

  const [actions, setActions] = useState<WorkflowAction[]>(workflow.actions);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);

  const pipeline = pipelines[0];

  const handleTestRun = () => {
    // Dispatch test simulated job to BullMQ queue
    dispatchJob('automation-worker', `test_run_${workflow.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`, {
      workflowId: workflow.id,
      workflowName: workflow.name,
      triggerType: workflow.triggerType,
      actionsCount: actions.length,
      executedBy: 'Manual Test Trigger',
    });

    toast(
      'Automation Dispatched to Queue',
      `Queued simulated async jobs in BullMQ worker pool for "${workflow.name}".`,
      'success'
    );
  };

  const handleAddAction = (type: ActionType) => {
    let label = 'New Action';
    let config: any = {};

    if (type === 'DELAY') {
      label = 'Delay 24 Hours';
      config = { delayMinutes: 1440, delayUnit: 'HOURS' };
    } else if (type === 'SEND_EMAIL') {
      label = 'Send Follow-up Email';
      config = {
        emailSubject: 'Quick follow up regarding your project scope',
        emailTemplate: 'Hi {{firstName}},\n\nChecking in on our previous discussion...',
      };
    } else if (type === 'SLACK_NOTIFY') {
      label = 'Send Slack Notification';
      config = { channel: '#deals-feed', message: 'Triggered automation event.' };
    } else if (type === 'CREATE_TASK') {
      label = 'Create Action Item';
      config = { taskTitle: 'Follow up with lead regarding contract' };
    } else if (type === 'ADD_TAG') {
      label = 'Add Tag to Contact';
      config = { tagToAdd: 'VIP-Client' };
    }

    const newAction: WorkflowAction = {
      id: `act-wf-${Date.now()}`,
      type,
      label,
      config,
    };

    const updated = [...actions, newAction];
    setActions(updated);
    onSave({ ...workflow, actions: updated });
    toast('Action Node Added', `Added ${label} to automation sequence.`, 'info');
  };

  const handleDeleteAction = (actionId: string) => {
    const updated = actions.filter((a) => a.id !== actionId);
    setActions(updated);
    onSave({ ...workflow, actions: updated });
    toast('Action Removed', 'Removed node from workflow.', 'info');
  };

  const getActionIcon = (type: ActionType) => {
    switch (type) {
      case 'DELAY':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'SEND_EMAIL':
        return <Mail className="w-4 h-4 text-indigo-600" />;
      case 'SLACK_NOTIFY':
        return <MessageSquare className="w-4 h-4 text-emerald-600" />;
      case 'CREATE_TASK':
        return <CheckSquare className="w-4 h-4 text-cyan-600" />;
      case 'ADD_TAG':
        return <Tag className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-6 relative">
      {/* Canvas Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">{workflow.name}</span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                workflow.active
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : 'text-slate-500 bg-slate-100 border-slate-200'
              }`}
            >
              {workflow.active ? 'ACTIVE WORKFLOW' : 'PAUSED'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{workflow.description}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTestRun}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors shadow-2xs"
          >
            <Play className="w-3.5 h-3.5 fill-indigo-600 text-indigo-600" />
            <span>Test Run In Queue</span>
          </button>
        </div>
      </div>

      {/* Node Graph Visualizer */}
      <div className="max-w-md mx-auto flex flex-col items-center space-y-4">
        {/* Node 1: Trigger Node */}
        <div className="w-full bg-white border-2 border-indigo-500 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase font-mono">
                TRIGGER EVENT
              </div>
              <h4 className="text-xs font-bold text-slate-900">
                {workflow.triggerType === 'STAGE_CHANGED' && 'Deal Enters Pipeline Stage'}
                {workflow.triggerType === 'DEAL_WON' && 'Deal Reaches Closed Won (100%)'}
                {workflow.triggerType === 'DEAL_STALLED_5D' && 'Deal Stalled > 5 Days Without Touch'}
                {workflow.triggerType === 'CONTACT_CREATED' && 'New Inbound Contact Registered'}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Evaluated by database hooks & real-time event pipeline
              </p>
            </div>
          </div>
        </div>

        {/* Vertical Connector Line */}
        <div className="flex flex-col items-center">
          <div className="w-0.5 h-6 bg-slate-300" />
          <ArrowDown className="w-4 h-4 text-slate-400 -mt-1" />
        </div>

        {/* Action Nodes Chain */}
        {actions.map((act, index) => (
          <React.Fragment key={act.id}>
            <div className="w-full bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all group relative">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    {getActionIcon(act.type)}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-mono">
                      STEP {index + 1} · {act.type}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">{act.label}</h4>

                    {act.type === 'DELAY' && (
                      <p className="text-[11px] text-amber-700 font-mono mt-0.5">
                        Queued in Redis delayed set for {act.config.delayMinutes} minutes
                      </p>
                    )}

                    {act.type === 'SEND_EMAIL' && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Subject: &quot;{act.config.emailSubject}&quot;
                      </p>
                    )}

                    {act.type === 'SLACK_NOTIFY' && (
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Target: {act.config.channel}
                      </p>
                    )}

                    {act.type === 'ADD_TAG' && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Tag to attach: #{act.config.tagToAdd}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteAction(act.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-all p-1"
                  title="Remove this step"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {index < actions.length - 1 && (
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-6 bg-slate-300" />
                <ArrowDown className="w-4 h-4 text-slate-400 -mt-1" />
              </div>
            )}
          </React.Fragment>
        ))}

        {/* Add Action Step Menu */}
        <div className="w-full pt-3 flex flex-col items-center">
          <div className="text-slate-400 text-[11px] mb-2 font-medium">Add next node:</div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => handleAddAction('DELAY')}
              className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-2xs"
            >
              + Delay (Timer)
            </button>
            <button
              onClick={() => handleAddAction('SEND_EMAIL')}
              className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-2xs"
            >
              + Send Email
            </button>
            <button
              onClick={() => handleAddAction('SLACK_NOTIFY')}
              className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-2xs"
            >
              + Slack Alert
            </button>
            <button
              onClick={() => handleAddAction('ADD_TAG')}
              className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-2xs"
            >
              + Add Tag
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
