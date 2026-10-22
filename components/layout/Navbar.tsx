'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Building2,
  ChevronDown,
  ShieldCheck,
  Search,
  Plus,
  Activity,
  Layers,
  Sparkles,
  Check,
} from 'lucide-react';
import { useCRM } from '@/lib/crm-store';
import { Role } from '@/types/crm';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCommandPalette: () => void;
  onOpenNewDealModal: () => void;
}

export function Navbar({
  activeTab,
  setActiveTab,
  onOpenCommandPalette,
  onOpenNewDealModal,
}: NavbarProps) {
  const {
    currentOrg,
    currentUser,
    allOrgs,
    orgUsers,
    setOrganization,
    setCurrentUser,
    updateUserRole,
    jobs,
  } = useCRM();

  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const orgRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (orgRef.current && !orgRef.current.contains(event.target as Node)) {
        setOrgDropdownOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setRoleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeJobsCount = jobs.filter((j) => j.status === 'ACTIVE' || j.status === 'WAITING').length;

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'pipeline', label: 'Pipeline' },
    { id: 'contacts', label: 'Contacts' },
    { id: 'automations', label: 'Automations' },
    { id: 'jobs', label: 'Async Queue' },
    { id: 'appointments', label: 'Appointments' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Primary Top Bar adhering to 3-zone contract */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 max-w-7xl mx-auto">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 text-left focus:outline-hidden"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-900 leading-none">
                OmniPulse
              </span>
              <span className="text-[10px] font-medium text-slate-400 leading-tight">
                Agency CRM & Scale
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'text-indigo-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action & Quick Tools */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenCommandPalette}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded text-slate-400">
              ⌘K
            </kbd>
          </button>

          <button
            onClick={onOpenNewDealModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-xs whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Deal</span>
          </button>
        </div>
      </header>

      {/* Tenant Context & Live RBAC Simulator Bar */}
      <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          {/* Organization Switcher */}
          <div className="flex items-center gap-2 relative" ref={orgRef}>
            <span className="text-slate-400 text-[11px] font-medium">Organization:</span>
            <button
              onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-800 font-medium hover:border-slate-300 transition-colors shadow-2xs"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>{currentOrg.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">({currentOrg.plan})</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {orgDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Tenant Isolation
                </div>
                {allOrgs.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => {
                      setOrganization(org.id);
                      setOrgDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs hover:bg-slate-50 transition-colors ${
                      org.id === currentOrg.id ? 'bg-indigo-50/50 text-indigo-700 font-medium' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-slate-900">{org.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{org.plan} Tier · {org.seatLimit} Seats</p>
                    </div>
                    {org.id === currentOrg.id && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active User & Live Role Simulator */}
          <div className="flex items-center gap-3">
            {/* BullMQ worker queue ticker */}
            <button
              onClick={() => setActiveTab('jobs')}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <Activity className="w-3 h-3 text-slate-400" />
              <span>Queue:</span>
              <span className="font-mono text-slate-700 tabular-nums">
                {activeJobsCount} active
              </span>
            </button>

            <span className="text-slate-300">|</span>

            {/* User & Role Switcher */}
            <div className="flex items-center gap-2 relative" ref={roleRef}>
              <span className="text-slate-400 text-[11px] font-medium">Session:</span>
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-800 hover:border-slate-300 transition-colors shadow-2xs"
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
                <span className="font-medium">{currentUser.name}</span>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.2 rounded font-mono ${
                    currentUser.role === 'OWNER'
                      ? 'text-indigo-700 bg-indigo-50 border border-indigo-200'
                      : currentUser.role === 'ADMIN'
                      ? 'text-cyan-700 bg-cyan-50 border border-cyan-200'
                      : 'text-slate-600 bg-slate-100 border border-slate-200'
                  }`}
                >
                  {currentUser.role}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 w-72 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Simulate Team Member (RBAC)
                  </div>
                  {orgUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUser(u.id);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs hover:bg-slate-50 transition-colors ${
                        u.id === currentUser.id ? 'bg-indigo-50/50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
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
                        <div>
                          <p className="font-medium text-slate-900">{u.name}</p>
                          <p className="text-[10px] text-slate-400">{u.title}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {u.role}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
