'use client';

import React from 'react';
import Image from 'next/image';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, Mail, CheckCircle2, Trash2 } from 'lucide-react';
import { Deal, Contact, User as UserType } from '@/types/crm';

interface DealCardProps {
  deal: Deal;
  contact?: Contact;
  assignedUser?: UserType;
  canViewFinancials: boolean;
  onEditDeal?: (deal: Deal) => void;
  onDeleteDeal?: (dealId: string) => void;
}

export function DealCard({
  deal,
  contact,
  assignedUser,
  canViewFinancials,
  onEditDeal,
  onDeleteDeal,
}: DealCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: deal.id,
    data: {
      deal,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'HIGH':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'MEDIUM':
        return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative bg-white border rounded-xl p-3.5 shadow-2xs hover:shadow-xs transition-all cursor-grab active:cursor-grabbing ${
        isDragging
          ? 'border-indigo-500 shadow-md ring-2 ring-indigo-500/20 z-50'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Top Header: Priority & Deal Title */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h4 className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
          {deal.title}
        </h4>
        <span
          className={`shrink-0 text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getPriorityStyle(
            deal.priority
          )}`}
        >
          {deal.priority}
        </span>
      </div>

      {/* Contact Name & Company */}
      {contact && (
        <div className="text-[11px] text-slate-500 mb-2.5 truncate">
          <span className="font-medium text-slate-700">
            {contact.firstName} {contact.lastName}
          </span>
          <span className="text-slate-400"> · {contact.company}</span>
        </div>
      )}

      {/* Monetary Value & Dates */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <div className="font-mono font-bold text-slate-900 tabular-nums">
          {canViewFinancials ? `$${deal.value.toLocaleString()}` : '••••••'}
        </div>

        <div className="flex items-center gap-2">
          {deal.expectedCloseDate && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{deal.expectedCloseDate.slice(5)}</span>
            </div>
          )}

          {assignedUser && (
            <div
              className="w-5 h-5 rounded-full overflow-hidden bg-slate-200 relative shrink-0 ring-1 ring-slate-200"
              title={`Assigned to ${assignedUser.name}`}
            >
              <Image
                src={assignedUser.avatar}
                alt={assignedUser.name}
                width={20}
                height={20}
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
        </div>
      </div>

      {/* Progressive Disclosure: Actions reveal smoothly on hover only */}
      {contact && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-1 bg-white/95 px-1.5 py-1 rounded-md shadow-xs border border-slate-200">
          <a
            href={`mailto:${contact.email}`}
            onClick={(e) => e.stopPropagation()}
            className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
            title={`Email ${contact.firstName}`}
          >
            <Mail className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}
