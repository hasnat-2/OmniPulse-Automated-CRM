'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { PipelineStage, Deal, Contact, User } from '@/types/crm';
import { DealCard } from '@/components/pipeline/DealCard';

interface PipelineStageColumnProps {
  stage: PipelineStage;
  deals: Deal[];
  contacts: Contact[];
  users: User[];
  canViewFinancials: boolean;
  onQuickAddDeal: (stageId: string) => void;
  onEditDeal?: (deal: Deal) => void;
  onDeleteDeal?: (dealId: string) => void;
}

export function PipelineStageColumn({
  stage,
  deals,
  contacts,
  users,
  canViewFinancials,
  onQuickAddDeal,
  onEditDeal,
  onDeleteDeal,
}: PipelineStageColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: {
      type: 'stage',
      stage,
    },
  });

  const totalStageValue = deals.reduce((sum, d) => sum + d.value, 0);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col flex-1 min-w-[280px] max-w-[340px] bg-slate-100/60 border rounded-2xl p-3.5 transition-colors ${
        isOver ? 'border-indigo-400 bg-indigo-50/40 ring-2 ring-indigo-500/10' : 'border-slate-200/80'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: stage.color }}
          />
          <h3 className="text-xs font-bold text-slate-800 tracking-tight">
            {stage.name}
          </h3>
          <span className="text-[11px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 tabular-nums">
            {deals.length}
          </span>
        </div>

        <button
          onClick={() => onQuickAddDeal(stage.id)}
          className="text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded hover:bg-white"
          title="Add Deal to this stage"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Stage Summary Total */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3 px-1">
        <span>Stage Volume</span>
        <span className="font-mono font-semibold text-slate-800 tabular-nums">
          {canViewFinancials ? `$${totalStageValue.toLocaleString()}` : '••••••'}
        </span>
      </div>

      {/* Cards List */}
      <div className="flex-1 space-y-2.5 overflow-y-auto min-h-[300px] max-h-[calc(100vh-280px)] pr-1">
        <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
          {deals.length === 0 ? (
            <div className="h-28 border border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 text-xs gap-1">
              <span>No active deals</span>
              <button
                onClick={() => onQuickAddDeal(stage.id)}
                className="text-indigo-600 font-medium text-[11px] hover:underline"
              >
                + Add deal
              </button>
            </div>
          ) : (
            deals.map((deal) => {
              const contact = contacts.find((c) => c.id === deal.contactId);
              const assignedUser = users.find((u) => u.id === deal.assignedTo);
              return (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  contact={contact}
                  assignedUser={assignedUser}
                  canViewFinancials={canViewFinancials}
                  onEditDeal={onEditDeal}
                  onDeleteDeal={onDeleteDeal}
                />
              );
            })
          )}
        </SortableContext>
      </div>
    </div>
  );
}
