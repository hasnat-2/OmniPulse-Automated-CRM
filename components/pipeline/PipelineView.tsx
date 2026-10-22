'use client';

import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  Search,
  Filter,
  Plus,
  Layers,
  Sparkles,
  Trophy,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useCRM } from '@/lib/crm-store';
import { useToast } from '@/components/ui/Toast';
import { Deal } from '@/types/crm';
import { PipelineStageColumn } from '@/components/pipeline/PipelineStageColumn';
import { DealCard } from '@/components/pipeline/DealCard';
import { AddDealModal } from '@/components/pipeline/AddDealModal';
import { usePipelineSync } from '@/hooks/usePipelineSync';

export function PipelineView() {
  const {
    currentOrg,
    pipelines,
    deals,
    contacts,
    orgUsers,
    hasPermission,
    moveDealStage,
  } = useCRM();
  const { toast } = useToast();
  const { isConnected, lastSyncedAt, broadcastUpdate } = usePipelineSync(currentOrg.id);

  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [isAddDealModalOpen, setIsAddDealModalOpen] = useState(false);
  const [quickAddStageId, setQuickAddStageId] = useState<string | undefined>();

  const canViewFinancials = hasPermission('VIEW_FINANCIALS');
  const currentPipeline = pipelines[0];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Filtered Deals
  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      if (deal.pipelineId !== currentPipeline?.id) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const contact = contacts.find((c) => c.id === deal.contactId);
        const matchesTitle = deal.title.toLowerCase().includes(q);
        const matchesContact = contact && `${contact.firstName} ${contact.lastName} ${contact.company}`.toLowerCase().includes(q);
        if (!matchesTitle && !matchesContact) return false;
      }

      if (selectedAssignee !== 'ALL' && deal.assignedTo !== selectedAssignee) {
        return false;
      }

      if (selectedPriority !== 'ALL' && deal.priority !== selectedPriority) {
        return false;
      }

      return true;
    });
  }, [deals, currentPipeline, searchQuery, selectedAssignee, selectedPriority, contacts]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const deal = deals.find((d) => d.id === active.id);
    if (deal) {
      setActiveDeal(deal);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);

    if (!over) return;

    const dealId = active.id as string;
    let targetStageId: string | undefined;

    // Check if over a stage container or over another deal in a stage
    if (currentPipeline?.stages.some((s) => s.id === over.id)) {
      targetStageId = over.id as string;
    } else {
      const overDeal = deals.find((d) => d.id === over.id);
      if (overDeal) {
        targetStageId = overDeal.stageId;
      }
    }

    if (targetStageId) {
      const currentDeal = deals.find((d) => d.id === dealId);
      if (currentDeal && currentDeal.stageId !== targetStageId) {
        const result = moveDealStage(dealId, targetStageId);
        if (result?.won) {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
          });
          toast(
            '🏆 Deal Closed Won!',
            `"${result.deal.title}" marked as Won! Triggered automated onboarding sequence.`,
            'success'
          );
        } else {
          toast('Deal Stage Updated', `Moved deal to new stage.`, 'info');
        }

        // Broadcast to other clients and invalidate TanStack Query caches
        broadcastUpdate('DEAL_MOVED', { dealId, targetStageId });
      }
    }
  };

  const totalFilteredValue = filteredDeals.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {currentPipeline?.name || 'Sales Pipeline'}
            </h1>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {currentPipeline?.stages.length || 0} Stages
            </span>

            {/* Live SSE Synchronization Badge */}
            <div
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono border transition-colors ${
                isConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
              title={isConnected ? 'Listening for live pipeline events via SSE' : 'Connecting to SSE stream...'}
            >
              {isConnected ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>SSE Live Sync</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>Sync Offline</span>
                </>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Drag deals across stages to advance lifecycle milestones and dispatch event-driven automations.
          </p>
        </div>

        {/* Action Button & Quick Stats */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <span className="text-slate-500">Pipeline Volume:</span>
            <span className="font-mono font-bold text-slate-900 tabular-nums">
              {canViewFinancials ? `$${totalFilteredValue.toLocaleString()}` : '••••••••'}
            </span>
          </div>

          <button
            onClick={() => {
              setQuickAddStageId(undefined);
              setIsAddDealModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Deal</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search deals or contacts..."
            className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden bg-transparent"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Assignee Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Owner:</span>
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">All Owners</option>
              {orgUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Board Container */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-6 pt-1">
          {currentPipeline?.stages.map((stage) => {
            const stageDeals = filteredDeals.filter((d) => d.stageId === stage.id);
            return (
              <PipelineStageColumn
                key={stage.id}
                stage={stage}
                deals={stageDeals}
                contacts={contacts}
                users={orgUsers}
                canViewFinancials={canViewFinancials}
                onQuickAddDeal={(stgId) => {
                  setQuickAddStageId(stgId);
                  setIsAddDealModalOpen(true);
                }}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeDeal ? (
            <div className="w-72 shadow-xl rotate-1 pointer-events-none">
              <DealCard
                deal={activeDeal}
                contact={contacts.find((c) => c.id === activeDeal.contactId)}
                assignedUser={orgUsers.find((u) => u.id === activeDeal.assignedTo)}
                canViewFinancials={canViewFinancials}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Add Deal Modal */}
      <AddDealModal
        isOpen={isAddDealModalOpen}
        onClose={() => setIsAddDealModalOpen(false)}
        defaultStageId={quickAddStageId}
      />
    </div>
  );
}
