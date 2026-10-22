'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  Target,
  ArrowUpRight,
  Clock,
  Sparkles,
  Calendar,
  Lock,
  Mail,
  Phone,
  FileText,
  UserCheck,
} from 'lucide-react';
import { useCRM } from '@/lib/crm-store';
import { ActivityType } from '@/types/crm';
import { formatDateTime } from '@/lib/date-utils';

interface DashboardViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenNewDealModal: () => void;
}

export function DashboardView({ onNavigateTab, onOpenNewDealModal }: DashboardViewProps) {
  const { currentOrg, currentUser, deals, contacts, activities, pipelines, appointments, hasPermission } =
    useCRM();

  const canViewFinancials = hasPermission('VIEW_FINANCIALS');

  // KPI Calculations
  const metrics = useMemo(() => {
    const defaultPipeline = pipelines[0];
    const wonStage = defaultPipeline?.stages.find((s) => s.name.toLowerCase().includes('won'));

    const wonDeals = deals.filter((d) => d.stageId === wonStage?.id);
    const activeDeals = deals.filter((d) => d.stageId !== wonStage?.id);

    const totalPipelineValue = deals.reduce((sum, d) => sum + d.value, 0);
    const totalWonRevenue = wonDeals.reduce((sum, d) => sum + d.value, 0);
    const activePipelineValue = activeDeals.reduce((sum, d) => sum + d.value, 0);

    const winRate = deals.length > 0 ? (wonDeals.length / deals.length) * 100 : 0;
    const avgDealSize = deals.length > 0 ? totalPipelineValue / deals.length : 0;

    return {
      totalPipelineValue,
      totalWonRevenue,
      activePipelineValue,
      totalDealsCount: deals.length,
      activeDealsCount: activeDeals.length,
      wonDealsCount: wonDeals.length,
      winRate: Math.round(winRate * 10) / 10,
      avgDealSize: Math.round(avgDealSize),
    };
  }, [deals, pipelines]);

  // Conversion Funnel Calculations
  const funnelStages = useMemo(() => {
    const pipeline = pipelines[0];
    if (!pipeline) return [];

    let runningDeals = deals.length;
    return pipeline.stages.map((stage, idx) => {
      const dealsInStage = deals.filter((d) => d.stageId === stage.id);
      const stageValue = dealsInStage.reduce((sum, d) => sum + d.value, 0);
      const stageCount = dealsInStage.length;

      // Simulated cumulative funnel drop-off
      const percentageOfTotal = deals.length > 0 ? Math.round((stageCount / deals.length) * 100) : 0;

      return {
        stage,
        stageCount,
        stageValue,
        percentageOfTotal,
      };
    });
  }, [pipelines, deals]);

  const upcomingAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.status === 'SCHEDULED')
      .slice(0, 3);
  }, [appointments]);

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'EMAIL':
        return <Mail className="w-3.5 h-3.5 text-indigo-600" />;
      case 'CALL':
        return <Phone className="w-3.5 h-3.5 text-cyan-600" />;
      case 'MEETING':
        return <Calendar className="w-3.5 h-3.5 text-amber-600" />;
      case 'STAGE_CHANGE':
        return <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Viewport Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Agency Revenue & Pipeline Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time pipeline metrics, conversion velocity, and team interaction feed for{' '}
            <span className="font-medium text-slate-800">{currentOrg.name}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!canViewFinancials && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md">
              <Lock className="w-3.5 h-3.5" />
              <span>Role ({currentUser.role}): Sensitive financial metrics masked by RBAC policy</span>
            </div>
          )}
          <button
            onClick={() => onNavigateTab('pipeline')}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            Open Kanban Board
          </button>
          <button
            onClick={onOpenNewDealModal}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
          >
            + Create Deal
          </button>
        </div>
      </div>

      {/* Metric KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pipeline Value */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Pipeline Value</span>
            <span className="flex items-center text-emerald-600 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" /> +18.4%
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {canViewFinancials
                ? `$${metrics.totalPipelineValue.toLocaleString()}`
                : '••••••••'}
            </span>
            <span className="text-xs text-slate-400">USD</span>
          </div>
          <p className="mt-1.5 text-[11px] text-slate-400">
            Across {metrics.totalDealsCount} qualified agency deals
          </p>
        </div>

        {/* Won Closed Revenue */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Closed Won Revenue</span>
            <span className="flex items-center text-emerald-600 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" /> +24.1%
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-600 font-mono tabular-nums">
              {canViewFinancials
                ? `$${metrics.totalWonRevenue.toLocaleString()}`
                : '••••••••'}
            </span>
            <span className="text-xs text-slate-400">USD</span>
          </div>
          <p className="mt-1.5 text-[11px] text-slate-400">
            {metrics.wonDealsCount} closed retainer agreements
          </p>
        </div>

        {/* Win Rate */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Win Rate Conversion</span>
            <span className="text-[11px] text-slate-400 font-medium">Industry avg 32%</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-indigo-600 font-mono tabular-nums">
              {metrics.winRate}%
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-slate-400">
            Based on completed proposal cycles
          </p>
        </div>

        {/* Active Open Opportunities */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Active Pipeline Velocity</span>
            <span className="text-[11px] text-slate-400">Avg 19 days cycle</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {metrics.activeDealsCount}
            </span>
            <span className="text-xs text-slate-400">open deals</span>
          </div>
          <p className="mt-1.5 text-[11px] text-slate-400">
            {canViewFinancials
              ? `$${metrics.activePipelineValue.toLocaleString()} in active discussion`
              : 'Active stage discussions'}
          </p>
        </div>
      </div>

      {/* 2-Column Analytics & Real-Time Sync Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Conversion Funnel & Stage Revenue Distribution (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Conversion Funnel Analysis */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Sales Pipeline Stage Velocity & Funnel
                </h2>
                <p className="text-xs text-slate-500">
                  Deal count, total stage volume, and conversion progression
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('pipeline')}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                Inspect Stages →
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              {funnelStages.map((item, idx) => {
                const widthPercent = Math.max(12, Math.min(100, (item.stageCount / (metrics.totalDealsCount || 1)) * 100));
                return (
                  <div key={item.stage.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: item.stage.color }}
                        />
                        <span className="font-medium text-slate-800">
                          {item.stage.name}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          ({item.stage.probability}% prob.)
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 font-mono tabular-nums">
                          {item.stageCount} deal{item.stageCount === 1 ? '' : 's'}
                        </span>
                        <span className="font-semibold text-slate-900 font-mono tabular-nums">
                          {canViewFinancials
                            ? `$${item.stageValue.toLocaleString()}`
                            : '••••••'}
                        </span>
                      </div>
                    </div>

                    {/* Funnel Progress Bar */}
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${widthPercent}%`,
                          backgroundColor: item.stage.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Schedule / Upcoming Appointments */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-semibold text-slate-900">
                  Upcoming Discovery Calls & Walkthroughs
                </h2>
              </div>
              <button
                onClick={() => onNavigateTab('appointments')}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                View Calendar →
              </button>
            </div>

            <div className="mt-3 divide-y divide-slate-100">
              {upcomingAppointments.length === 0 ? (
                <p className="text-xs text-slate-400 py-3">No upcoming appointments scheduled.</p>
              ) : (
                upcomingAppointments.map((apt) => {
                  const contact = contacts.find((c) => c.id === apt.contactId);
                  const dateStr = formatDateTime(apt.startTime);

                  return (
                    <div key={apt.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-medium text-slate-900">{apt.title}</p>
                        <p className="text-slate-400 text-[11px]">
                          {contact ? `${contact.firstName} ${contact.lastName} (${contact.company})` : 'Client'}{' '}
                          · <span className="font-mono">{dateStr}</span> · {apt.locationType}
                        </p>
                      </div>
                      {apt.meetingUrl && (
                        <a
                          href={apt.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                        >
                          Join Link
                        </a>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Streaming Activity Feed (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-semibold text-slate-900">
                  Team Activity & Automation Feed
                </h2>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Live Sync</span>
            </div>

            <div className="mt-3 divide-y divide-slate-100 max-h-[460px] overflow-y-auto pr-1">
              {activities.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No recent activity recorded.</p>
              ) : (
                activities.slice(0, 8).map((act) => {
                  const contact = contacts.find((c) => c.id === act.contactId);
                  const timeFormatted = formatDateTime(act.timestamp);

                  return (
                    <div key={act.id} className="py-3 flex items-start gap-3 text-xs">
                      <div className="mt-0.5 p-1.5 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
                        {getActivityIcon(act.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-slate-900 truncate">{act.title}</p>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            {timeFormatted}
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs mt-0.5">{act.description}</p>
                        {contact && (
                          <p className="text-[11px] text-slate-400 mt-1">
                            Contact: {contact.firstName} {contact.lastName} · {contact.company}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
