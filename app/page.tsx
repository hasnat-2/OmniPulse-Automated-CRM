'use client';

import React, { useState, useEffect } from 'react';
import { useIsMounted } from '@/hooks/use-mounted';
import { ToastProvider } from '@/components/ui/Toast';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { PipelineView } from '@/components/pipeline/PipelineView';
import { ContactsView } from '@/components/contacts/ContactsView';
import { AutomationsView } from '@/components/automations/AutomationsView';
import { JobsEngineView } from '@/components/jobs/JobsEngineView';
import { AppointmentsView } from '@/components/appointments/AppointmentsView';
import { SettingsView } from '@/components/settings/SettingsView';
import { AddDealModal } from '@/components/pipeline/AddDealModal';
import { AddContactModal } from '@/components/contacts/AddContactModal';

export default function Home() {
  const isMounted = useIsMounted();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNewDealModalOpen, setIsNewDealModalOpen] = useState(false);
  const [isNewContactModalOpen, setIsNewContactModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Global Keyboard Shortcuts (Power-User Efficiency)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl instanceof HTMLSelectElement ||
        activeEl?.getAttribute('contenteditable') === 'true';

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarCollapsed((prev) => !prev);
      } else if (!isInput && (e.key === 'n' || e.key === 'N') && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setIsNewDealModalOpen(true);
      } else if (!isInput && (e.key === 'c' || e.key === 'C') && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setIsNewContactModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <QueryProvider>
      <ToastProvider>
        <div className="flex h-screen w-full bg-slate-50 text-slate-700 overflow-hidden font-sans">
        {/* Zone A: Navigation (Fixed Sidebar) */}
        <div className="hidden md:flex shrink-0 h-full">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            onOpenNewDealModal={() => setIsNewDealModalOpen(true)}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          />
        </div>

        {/* Mobile Slide-Over Sidebar Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl">
              <Sidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {
                  setActiveTab(tab);
                  setMobileMenuOpen(false);
                }}
                onOpenCommandPalette={() => {
                  setIsCommandPaletteOpen(true);
                  setMobileMenuOpen(false);
                }}
                onOpenNewDealModal={() => {
                  setIsNewDealModalOpen(true);
                  setMobileMenuOpen(false);
                }}
              />
            </div>
          </div>
        )}

        {/* Content Area: Header (Zone B) + Active Workspace (Zone C) */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Zone B: Command Header */}
          <Header
            activeTab={activeTab}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            onOpenNewDealModal={() => setIsNewDealModalOpen(true)}
            onOpenNewContactModal={() => setIsNewContactModalOpen(true)}
            onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          />

          {/* Zone C: Active Workspace Canvas (Soft Neutral Pearl-Slate #F8FAFC) */}
          <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {activeTab === 'dashboard' && (
                <DashboardView
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onOpenNewDealModal={() => setIsNewDealModalOpen(true)}
                />
              )}

              {activeTab === 'pipeline' && <PipelineView />}

              {activeTab === 'contacts' && <ContactsView />}

              {activeTab === 'automations' && <AutomationsView />}

              {activeTab === 'jobs' && <JobsEngineView />}

              {activeTab === 'appointments' && <AppointmentsView />}

              {activeTab === 'settings' && <SettingsView />}
            </div>
          </main>
        </div>

        {/* Global Command Palette (Cmd + K) */}
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onSelectTab={(tab) => setActiveTab(tab)}
          onOpenNewDealModal={() => setIsNewDealModalOpen(true)}
          onOpenNewContactModal={() => setIsNewContactModalOpen(true)}
        />

        {/* Global Action Modals */}
        <AddDealModal
          isOpen={isNewDealModalOpen}
          onClose={() => setIsNewDealModalOpen(false)}
        />

        <AddContactModal
          isOpen={isNewContactModalOpen}
          onClose={() => setIsNewContactModalOpen(false)}
        />
      </div>
    </ToastProvider>
  </QueryProvider>
);
}
