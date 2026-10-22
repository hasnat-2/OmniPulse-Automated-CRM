'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Search,
  Plus,
  Activity,
  ShieldCheck,
  ChevronDown,
  Menu,
  Sparkles,
  Command,
  UserCheck,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useCRM } from '@/lib/crm-store';
import { Role } from '@/types/crm';

interface HeaderProps {
  activeTab: string;
  onOpenCommandPalette: () => void;
  onOpenNewDealModal: () => void;
  onOpenNewContactModal: () => void;
  onToggleMobileMenu?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Header({
  activeTab,
  onOpenCommandPalette,
  onOpenNewDealModal,
  onOpenNewContactModal,
  onToggleMobileMenu,
  isSidebarCollapsed = false,
  onToggleCollapse,
}: HeaderProps) {
  const { currentOrg, currentUser, orgUsers, setCurrentUser, jobs } = useCRM();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setRoleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeJobsCount = jobs.filter((j) => j.status === 'ACTIVE' || j.status === 'WAITING').length;

  const getBreadcrumbTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return 'Executive Revenue Dashboard';
      case 'pipeline':
        return 'Sales Pipeline Kanban';
      case 'contacts':
        return 'Contacts & Accounts Inspector';
      case 'automations':
        return 'Workflow Automations Builder';
      case 'jobs':
        return 'Async Engine & Worker Pool';
      case 'appointments':
        return 'Client Discovery & Appointments';
      case 'settings':
        return 'Organization & RBAC Settings';
      default:
        return 'Overview';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Left: Mobile Toggle & Contextual Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors items-center justify-center shrink-0"
            title={isSidebarCollapsed ? "Expand sidebar (⌘B)" : "Collapse sidebar (⌘B)"}
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        )}

        <div className="flex items-center gap-2 text-xs truncate">
          <span className="font-semibold text-slate-800 truncate">
            {currentOrg.name}
          </span>
          <span className="text-slate-300">/</span>
          <span className="font-medium text-slate-500 truncate">
            {getBreadcrumbTitle(activeTab)}
          </span>
        </div>
      </div>

      {/* Center: Global Search Input (Cmd + K Trigger) */}
      <div className="flex-1 max-w-md hidden sm:block">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-slate-500 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 rounded-lg transition-colors group text-left"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            <span className="text-slate-500">Search...</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-white border border-slate-200 rounded shadow-2xs">
              ⌘K
            </kbd>
          </div>
        </button>
      </div>

      {/* Right: Actions, RBAC Simulator, and Primary CTA */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Background Queue Monitor Status */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-200/60 text-[11px] text-slate-500">
          <Activity className="w-3 h-3 text-indigo-500 animate-pulse" />
          <span>Workers:</span>
          <span className="font-mono font-bold text-slate-700 tabular-nums">
            {activeJobsCount} queue
          </span>
        </div>

        {/* Live RBAC Role Simulator Dropdown */}
        <div className="relative" ref={roleDropdownRef}>
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-lg text-xs transition-colors"
            title="Simulate team member session"
          >
            <div className="w-4 h-4 rounded-full overflow-hidden bg-slate-200 relative shrink-0">
              <Image
                src={currentUser.avatar}
                alt={currentUser.name}
                width={16}
                height={16}
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-medium text-slate-800 hidden md:inline truncate max-w-[100px]">
              {currentUser.name}
            </span>
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
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Simulate Role Privileges (RBAC)
              </div>
              {orgUsers.map((u) => {
                const isCurrent = u.id === currentUser.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      setCurrentUser(u.id);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                      isCurrent ? 'bg-indigo-50/60 font-medium' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 shrink-0">
                        <Image
                          src={u.avatar}
                          alt={u.name}
                          width={24}
                          height={24}
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="truncate">
                        <p className="font-semibold text-slate-800 truncate">{u.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{u.title}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                      {u.role}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Primary Action Button: New Deal (Keyboard Shortcut N) */}
        <button
          onClick={onOpenNewDealModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg transition-colors shadow-xs whitespace-nowrap shrink-0 group"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Deal</span>
          <kbd className="hidden sm:inline-block ml-1 px-1 py-0.2 text-[9px] font-mono bg-indigo-700 text-indigo-200 rounded">
            N
          </kbd>
        </button>
      </div>
    </header>
  );
}
