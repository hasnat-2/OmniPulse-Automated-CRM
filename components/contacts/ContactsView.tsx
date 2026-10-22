'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  Mail,
  Phone,
  Building2,
  ChevronRight,
  ShieldAlert,
  ArrowUpDown,
  Tag,
  CheckCircle,
} from 'lucide-react';
import { useCRM } from '@/lib/crm-store';
import { useToast } from '@/components/ui/Toast';
import { Contact, ContactStatus } from '@/types/crm';
import { ContactSlideOver } from '@/components/contacts/ContactSlideOver';
import { AddContactModal } from '@/components/contacts/AddContactModal';

export function ContactsView() {
  const { contacts, orgUsers, currentUser, hasPermission, triggerCsvExport } = useCRM();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const canExportData = hasPermission('EXPORT_DATA');
  const canViewFinancials = hasPermission('VIEW_FINANCIALS');

  // Extract all unique tags
  const allUniqueTags = useMemo(() => {
    const set = new Set<string>();
    contacts.forEach((c) => c.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [contacts]);

  // Filter contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const full = `${contact.firstName} ${contact.lastName} ${contact.email} ${contact.company}`.toLowerCase();
        if (!full.includes(q)) return false;
      }

      if (selectedStatus !== 'ALL' && contact.status !== selectedStatus) {
        return false;
      }

      if (selectedTag !== 'ALL' && !contact.tags.includes(selectedTag)) {
        return false;
      }

      return true;
    });
  }, [contacts, searchQuery, selectedStatus, selectedTag]);

  // Handle CSV Export with RBAC enforcement
  const handleExportCSV = () => {
    if (!canExportData) {
      toast(
        'RBAC Permission Denied',
        `Role (${currentUser.role}) lacks fine-grained access to export contact databases. Requires ADMIN or OWNER.`,
        'error'
      );
      return;
    }

    // Trigger BullMQ job in store
    triggerCsvExport();

    // Generate CSV string and trigger browser download
    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Status', 'LTV', 'Tags'];
    const rows = filteredContacts.map((c) => [
      c.id,
      `"${c.firstName}"`,
      `"${c.lastName}"`,
      `"${c.email}"`,
      `"${c.phone}"`,
      `"${c.company}"`,
      c.status,
      c.lifetimeValue,
      `"${c.tags.join('; ')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `omnipulse_contacts_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast(
      'CSV Export Dispatched',
      `Queued background job and downloaded ${filteredContacts.length} contact records.`,
      'success'
    );
  };

  const getStatusBadge = (status: ContactStatus) => {
    switch (status) {
      case 'CUSTOMER':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'OPPORTUNITY':
        return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      case 'QUALIFIED':
        return 'text-cyan-700 bg-cyan-50 border-cyan-200';
      case 'LEAD':
        return 'text-slate-700 bg-slate-100 border-slate-200';
      case 'CHURNED':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Contacts & Accounts Inspector
            </h1>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {contacts.length} Total Profiles
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Client directories, activity timelines, interaction logs, and fine-grained data export controls.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors shadow-2xs ${
              canExportData
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
            }`}
            title={canExportData ? 'Export CSV' : 'Restricted by RBAC'}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
            {!canExportData && <span className="text-[10px] text-amber-600 font-mono">(Restricted)</span>}
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs">
        <div className="flex items-center gap-2 flex-1 min-w-[220px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, company, or email..."
            className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden bg-transparent"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Lifecycle:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">All Lifecycle Stages</option>
              <option value="LEAD">Lead</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="OPPORTUNITY">Opportunity</option>
              <option value="CUSTOMER">Customer</option>
              <option value="CHURNED">Churned</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Tag:</span>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">All Tags</option>
              {allUniqueTags.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* High-Density Data Grid Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Tags (Unboxed)</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4 text-right">LTV Value</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No matching contacts found.
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => {
                  const owner = orgUsers.find((u) => u.id === contact.ownerId);

                  return (
                    <tr
                      key={contact.id}
                      onClick={() => setSelectedContact(contact)}
                      className="h-12 hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Name & Email */}
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[11px] shrink-0 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
                            {contact.firstName.charAt(0)}
                            {contact.lastName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {contact.firstName} {contact.lastName}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">{contact.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Company */}
                      <td className="py-2 px-4 text-slate-700 font-medium">
                        {contact.company}
                      </td>

                      {/* Status */}
                      <td className="py-2 px-4">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider font-semibold ${getStatusBadge(
                            contact.status
                          )}`}
                        >
                          {contact.status}
                        </span>
                      </td>

                      {/* Unboxed Tags (Zero-Pill Discipline) */}
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 flex-wrap">
                          {contact.tags.map((t, idx) => (
                            <React.Fragment key={t}>
                              <span>#{t}</span>
                              {idx < contact.tags.length - 1 && <span className="text-slate-300">·</span>}
                            </React.Fragment>
                          ))}
                        </div>
                      </td>

                      {/* Owner */}
                      <td className="py-2 px-4 text-slate-600">
                        {owner?.name || 'Unassigned'}
                      </td>

                      {/* LTV Value (Tabular Numerals) */}
                      <td className="py-2 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                        {canViewFinancials
                          ? `$${contact.lifetimeValue.toLocaleString()}`
                          : '••••••'}
                      </td>

                      {/* Progressive Disclosure Actions: reveal on hover */}
                      <td className="py-2 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-1">
                            <a
                              href={`mailto:${contact.email}`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                              title="Send Email"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                            <a
                              href={`tel:${contact.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 text-slate-400 hover:text-cyan-600 hover:bg-slate-100 rounded transition-colors"
                              title="Call Phone"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          </div>
                          <span className="inline-flex items-center gap-0.5 text-slate-400 group-hover:text-indigo-600 text-xs font-medium pl-1">
                            Inspect <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Profile Drawer */}
      <ContactSlideOver
        contact={selectedContact}
        onClose={() => setSelectedContact(null)}
      />

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
