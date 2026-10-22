'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Building2,
  Users,
  ShieldCheck,
  CreditCard,
  Plus,
  Check,
  AlertCircle,
  X,
  Lock,
} from 'lucide-react';
import { useCRM } from '@/lib/crm-store';
import { useToast } from '@/components/ui/Toast';
import { Role, PlanTier } from '@/types/crm';

export function SettingsView() {
  const {
    currentOrg,
    currentUser,
    orgUsers,
    updateUserRole,
    inviteMember,
    hasPermission,
  } = useCRM();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'team' | 'plan' | 'permissions'>('team');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('AGENT');
  const [inviteTitle, setInviteTitle] = useState('');

  const canManageUsers = hasPermission('MANAGE_USERS');
  const canManageBilling = hasPermission('MANAGE_BILLING');

  const handleRoleChange = (userId: string, newRole: Role) => {
    if (!canManageUsers) {
      toast(
        'Action Restricted',
        `Role (${currentUser.role}) does not have permission to modify team access tiers.`,
        'error'
      );
      return;
    }
    updateUserRole(userId, newRole);
    toast('Role Updated', `Changed user permission tier to ${newRole}.`, 'success');
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    if (!canManageUsers) {
      toast('Permission Denied', 'Only ADMIN and OWNER can invite team members.', 'error');
      return;
    }

    inviteMember(inviteName.trim(), inviteEmail.trim(), inviteRole, inviteTitle.trim());
    toast('Invitation Dispatched', `Invited ${inviteName} (${inviteRole}) to ${currentOrg.name}.`, 'success');
    setIsInviteModalOpen(false);
    setInviteName('');
    setInviteEmail('');
    setInviteTitle('');
  };

  const plans: { tier: PlanTier; name: string; price: string; seats: number; features: string[] }[] = [
    {
      tier: 'STARTER',
      name: 'Starter Studio',
      price: '$149 / mo',
      seats: 5,
      features: ['Up to 5 team seats', '1 Active sales pipeline', 'Standard email reminders', 'CSV export', 'Community support'],
    },
    {
      tier: 'GROWTH',
      name: 'Growth Agency',
      price: '$399 / mo',
      seats: 15,
      features: [
        'Up to 15 team seats',
        'Unlimited sales pipelines',
        'BullMQ asynchronous queue engine',
        'Visual workflow automation builder',
        'Role-Based & Fine-Grained Access Control',
        'Priority queue workers',
      ],
    },
    {
      tier: 'ENTERPRISE',
      name: 'Sovereign Enterprise',
      price: '$999 / mo',
      seats: 50,
      features: [
        'Up to 50 team seats',
        'Custom Redis cluster & dedicated workers',
        'Row-Level Security multi-tenancy isolation',
        'Custom domain & SSO SAML 2.0',
        'Dedicated Technical Account Manager',
        'Custom Webhook integrations',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Organization & Access Management
            </h1>
            <span className="text-xs font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              Tenant ID: {currentOrg.slug}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure multi-tenant isolation, RBAC roles, subscription seats, and fine-grained access policies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'team' && canManageUsers && (
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Invite Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold text-slate-500">
        <button
          onClick={() => setActiveTab('team')}
          className={`pb-2.5 transition-colors relative ${
            activeTab === 'team' ? 'text-indigo-600 font-bold' : 'hover:text-slate-800'
          }`}
        >
          Team & RBAC ({orgUsers.length} Members)
          {activeTab === 'team' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('plan')}
          className={`pb-2.5 transition-colors relative ${
            activeTab === 'plan' ? 'text-indigo-600 font-bold' : 'hover:text-slate-800'
          }`}
        >
          Subscription & Seats ({currentOrg.plan})
          {activeTab === 'plan' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('permissions')}
          className={`pb-2.5 transition-colors relative ${
            activeTab === 'permissions' ? 'text-indigo-600 font-bold' : 'hover:text-slate-800'
          }`}
        >
          Fine-Grained Access Control Matrix
          {activeTab === 'permissions' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>
      </div>

      {/* Team & Members Tab */}
      {activeTab === 'team' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-4">Title / Role</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Assigned RBAC Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orgUsers.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 relative shrink-0">
                            <Image
                              src={member.avatar}
                              alt={member.name}
                              width={32}
                              height={32}
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{member.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{member.id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {member.title}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {member.email}
                      </td>

                      <td className="py-3 px-4">
                        <select
                          disabled={!canManageUsers || member.id === currentUser.id}
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value as Role)}
                          className="px-2.5 py-1 bg-white border border-slate-200 rounded-md font-mono text-xs font-semibold focus:outline-hidden disabled:bg-slate-50 disabled:text-slate-400"
                        >
                          <option value="OWNER">OWNER</option>
                          <option value="ADMIN">ADMIN</option>
                          <option value="AGENT">AGENT</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Subscription & Seats Tab */}
      {activeTab === 'plan' && (
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px]">Current Plan:</span>
              <span className="text-base font-bold text-slate-900">{currentOrg.plan} Tier</span>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Using <span className="font-mono font-semibold text-slate-800">{orgUsers.length}</span> of{' '}
                <span className="font-mono font-semibold text-slate-800">{currentOrg.seatLimit}</span> allocated seats.
              </p>
            </div>
            {!canManageBilling && (
              <span className="text-xs text-amber-700 bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
                Plan modifications restricted to OWNER role
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((p) => {
              const isCurrent = p.tier === currentOrg.plan;
              return (
                <div
                  key={p.tier}
                  className={`bg-white border rounded-xl p-5 shadow-xs flex flex-col justify-between ${
                    isCurrent ? 'border-indigo-600 ring-2 ring-indigo-600/10' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-sm text-slate-900">{p.name}</h3>
                      {isCurrent && (
                        <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          CURRENT
                        </span>
                      )}
                    </div>
                    <div className="text-xl font-bold font-mono text-slate-900 mb-4 tabular-nums">
                      {p.price}
                    </div>

                    <ul className="space-y-2 text-xs text-slate-600 mb-6">
                      {p.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    disabled={isCurrent || !canManageBilling}
                    onClick={() => toast('Plan Selected', `Requested transition to ${p.name}.`, 'info')}
                    className={`w-full py-2 text-xs font-semibold rounded-lg transition-colors ${
                      isCurrent
                        ? 'bg-slate-100 text-slate-400 cursor-default'
                        : canManageBilling
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {isCurrent ? 'Current Plan' : 'Select Plan'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Fine-Grained Permissions Matrix Tab */}
      {activeTab === 'permissions' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 text-xs">
              Role-Based Access Control (RBAC) & Fine-Grained Permission Enforcement
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Strict scoping enforced across both API queries and client state.
            </p>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Capability / Operation</th>
                <th className="py-3 px-4 text-center">OWNER</th>
                <th className="py-3 px-4 text-center">ADMIN</th>
                <th className="py-3 px-4 text-center">AGENT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-3 px-4 font-medium">View Aggregate Financial Metrics (Pipeline LTV & Totals)</td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><X className="w-4 h-4 text-rose-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Export Client Contact Databases (Streaming CSV)</td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><X className="w-4 h-4 text-rose-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Manage Team Members, Invite Users & Change Roles</td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><X className="w-4 h-4 text-rose-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Configure Automations & Modify Node Graphs</td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><span className="text-[10px] text-slate-400 font-mono">View Only</span></td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Organization Billing, Plan Upgrades & Tenant Deletion</td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><X className="w-4 h-4 text-rose-500 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><X className="w-4 h-4 text-rose-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Create & Move Sales Deals Across Pipeline Stages</td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Add Internal Notes, Log Calls & Schedule Discovery Meetings</td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Invite Team Member</h3>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Jordan Hayes"
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Work Email *</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="jordan@nexusgrowth.io"
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  value={inviteTitle}
                  onChange={(e) => setInviteTitle(e.target.value)}
                  placeholder="Senior Account Executive"
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">RBAC Role Tier</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as Role)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                >
                  <option value="AGENT">AGENT (Pipeline management, calls, notes)</option>
                  <option value="ADMIN">ADMIN (Full reporting, CSV export, automations)</option>
                  <option value="OWNER">OWNER (Full control + billing)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-3 py-1.5 font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
