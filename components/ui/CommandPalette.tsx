'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, UserCheck, DollarSign, Zap, Plus, X, ArrowRight } from 'lucide-react';
import { useCRM } from '@/lib/crm-store';
import { Contact, Deal } from '@/types/crm';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
  onSelectContact?: (contact: Contact) => void;
  onSelectDeal?: (deal: Deal) => void;
  onOpenNewDealModal: () => void;
  onOpenNewContactModal: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onSelectTab,
  onSelectContact,
  onSelectDeal,
  onOpenNewDealModal,
  onOpenNewContactModal,
}: CommandPaletteProps) {
  const { contacts, deals, automations } = useCRM();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredContacts = useMemo(() => {
    if (!query) return contacts.slice(0, 3);
    const q = query.toLowerCase();
    return contacts
      .filter(
        (c) =>
          c.firstName.toLowerCase().includes(q) ||
          c.lastName.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
      )
      .slice(0, 4);
  }, [contacts, query]);

  const filteredDeals = useMemo(() => {
    if (!query) return deals.slice(0, 3);
    const q = query.toLowerCase();
    return deals
      .filter((d) => d.title.toLowerCase().includes(q) || d.value.toString().includes(q))
      .slice(0, 4);
  }, [deals, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100 gap-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search deals, contacts, automations, or commands..."
            className="w-full text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden bg-transparent"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 rounded border border-slate-200">
            ESC
          </kbd>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100">
          {/* Quick Actions */}
          <div className="pb-2">
            <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Quick Actions
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  onClose();
                  onOpenNewDealModal();
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg group text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium text-slate-800">Create New Deal Opportunity</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-colors" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenNewContactModal();
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg group text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium text-slate-800">Add New Contact Profile</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-colors" />
              </button>
            </div>
          </div>

          {/* Deals */}
          {filteredDeals.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Deals ({filteredDeals.length})
              </div>
              <div className="space-y-0.5">
                {filteredDeals.map((deal) => (
                  <button
                    key={deal.id}
                    onClick={() => {
                      onClose();
                      onSelectTab('pipeline');
                      onSelectDeal?.(deal);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg text-left"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{deal.title}</span>
                    </div>
                    <span className="font-mono text-slate-600 tabular-nums shrink-0 ml-2">
                      ${deal.value.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Contacts */}
          {filteredContacts.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Contacts ({filteredContacts.length})
              </div>
              <div className="space-y-0.5">
                {filteredContacts.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onClose();
                      onSelectTab('contacts');
                      onSelectContact?.(c);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg text-left"
                  >
                    <div className="truncate">
                      <span className="font-medium text-slate-900">
                        {c.firstName} {c.lastName}
                      </span>
                      <span className="text-slate-400 ml-1.5 text-[11px]">· {c.company}</span>
                    </div>
                    <span className="text-slate-400 text-[11px] truncate">{c.email}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Shortcuts */}
          <div className="pt-2">
            <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Navigation
            </div>
            <div className="grid grid-cols-2 gap-1 px-1">
              {[
                { label: 'Dashboard', id: 'dashboard' },
                { label: 'Sales Pipeline', id: 'pipeline' },
                { label: 'Contacts Inspector', id: 'contacts' },
                { label: 'Workflow Automations', id: 'automations' },
                { label: 'Async Queue Monitor', id: 'jobs' },
                { label: 'Calendar & Meetings', id: 'appointments' },
                { label: 'Organization Settings', id: 'settings' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onClose();
                    onSelectTab(item.id);
                  }}
                  className="px-2.5 py-1.5 text-xs text-left text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 rounded transition-colors"
                >
                  Jump to {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
