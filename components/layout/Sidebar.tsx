'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  LayoutDashboard,
  Kanban,
  Users,
  Zap,
  Cpu,
  Calendar,
  ShieldCheck,
  Building2,
  ChevronDown,
  Check,
  Layers,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useCRM } from '@/lib/crm-store';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCommandPalette: () => void;
  onOpenNewDealModal: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  onOpenCommandPalette,
  onOpenNewDealModal,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const {
    currentOrg,
    currentUser,
    allOrgs,
    setOrganization,
    jobs,
    deals,
    contacts,
  } = useCRM();

  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOrgDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeJobsCount = jobs.filter((j) => j.status === 'ACTIVE' || j.status === 'WAITING').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Executive Dashboard',
      icon: LayoutDashboard,
      iconBg: 'bg-indigo-50 text-indigo-600',
      activeIconBg: 'bg-indigo-600 text-white',
    },
    {
      id: 'pipeline',
      label: 'Sales Pipeline',
      icon: Kanban,
      badge: deals.length > 0 ? `${deals.length}` : undefined,
      iconBg: 'bg-emerald-50 text-emerald-600',
      activeIconBg: 'bg-emerald-600 text-white',
    },
    {
      id: 'contacts',
      label: 'Contacts & Accounts',
      icon: Users,
      badge: contacts.length > 0 ? `${contacts.length}` : undefined,
      iconBg: 'bg-cyan-50 text-cyan-600',
      activeIconBg: 'bg-cyan-600 text-white',
    },
    {
      id: 'automations',
      label: 'Workflow Automations',
      icon: Zap,
      iconBg: 'bg-violet-50 text-violet-600',
      activeIconBg: 'bg-violet-600 text-white',
    },
    {
      id: 'jobs',
      label: 'Async Queue Monitor',
      icon: Cpu,
      badge: activeJobsCount > 0 ? `${activeJobsCount}` : undefined,
      badgeColor: activeJobsCount > 0 ? 'bg-amber-100 text-amber-800' : undefined,
      iconBg: 'bg-amber-50 text-amber-600',
      activeIconBg: 'bg-amber-600 text-white',
    },
    {
      id: 'appointments',
      label: 'Client Appointments',
      icon: Calendar,
      iconBg: 'bg-rose-50 text-rose-600',
      activeIconBg: 'bg-rose-600 text-white',
    },
    {
      id: 'settings',
      label: 'Organization & RBAC',
      icon: ShieldCheck,
      iconBg: 'bg-slate-100 text-slate-700',
      activeIconBg: 'bg-slate-800 text-white',
    },
  ];

  return (
    <aside
      className={`bg-white border-r border-slate-200/80 flex flex-col shrink-0 select-none z-30 transition-all duration-200 ease-in-out ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand & Organization Switcher Lockup */}
      <div className="p-3.5 border-b border-slate-100">
        {/* Brand Wordmark & Collapse Toggle */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 truncate">
                <h1 className="text-sm font-bold tracking-tight text-slate-900 leading-none truncate">
                  OmniPulse
                </h1>
                <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                  Agency CRM
                </p>
              </div>
            )}
          </div>

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Tenant Switcher Button */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
            className={`w-full flex items-center rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 text-left transition-colors ${
              isCollapsed ? 'justify-center p-2' : 'justify-between p-2'
            }`}
            title={isCollapsed ? currentOrg.name : undefined}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shrink-0">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              {!isCollapsed && (
                <div className="min-w-0 truncate">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {currentOrg.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {currentOrg.plan} Tier · {currentOrg.seatLimit} seats
                  </p>
                </div>
              )}
            </div>
            {!isCollapsed && <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />}
          </button>

          {/* Org Switcher Menu */}
          {orgDropdownOpen && (
            <div
              className={`absolute top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 ${
                isCollapsed ? 'left-full ml-2 w-64' : 'left-0 right-0'
              }`}
            >
              <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Isolated Tenant
              </div>
              {allOrgs.map((org) => {
                const isSelected = org.id === currentOrg.id;
                return (
                  <button
                    key={org.id}
                    onClick={() => {
                      setOrganization(org.id);
                      setOrgDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-indigo-50/60 text-indigo-900 font-medium'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{org.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {org.plan} Tier · {org.currency}
                      </p>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links with Colorful Icons & Ergonomic Spacing */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {!isCollapsed && (
          <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Workspace
          </div>
        )}

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center rounded-lg text-xs font-medium transition-all group ${
                isCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-2'
              } ${
                isActive
                  ? 'bg-indigo-50/80 text-indigo-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className={`flex items-center gap-2.5 ${isCollapsed ? '' : 'truncate'}`}>
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors relative ${
                    isActive ? item.activeIconBg : item.iconBg
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {isCollapsed && item.badge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </div>
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!isCollapsed && item.badge && (
                <span
                  className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${
                    item.badgeColor || 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User Session & Role Profile Footer */}
      <div className="p-3 border-t border-slate-100 bg-white">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 relative shrink-0 ring-1 ring-slate-200"
              title={`${currentUser.name} (${currentUser.role})`}
            >
              <Image
                src={currentUser.avatar}
                alt={currentUser.name}
                width={32}
                height={32}
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {currentUser.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                      currentUser.role === 'OWNER'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : currentUser.role === 'ADMIN'
                        ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {currentUser.role}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    Active
                  </span>
                </div>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={() => setActiveTab('settings')}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              title="Manage Permissions & Session"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
