'use client';

import React, { useState } from 'react';
import {
  Activity,
  Cpu,
  RefreshCw,
  Play,
  CheckCircle2,
  Clock,
  AlertCircle,
  Database,
  Layers,
  ChevronDown,
  Terminal,
} from 'lucide-react';
import { useCRM } from '@/lib/crm-store';
import { useToast } from '@/components/ui/Toast';
import { JobStatus, AsyncJob } from '@/types/crm';

export function JobsEngineView() {
  const { jobs, retryJob, simulateBatchInboundJobs, dispatchJob, currentOrg } = useCRM();
  const { toast } = useToast();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedJob, setSelectedJob] = useState<AsyncJob | null>(null);

  const filteredJobs = jobs.filter((j) => {
    if (statusFilter !== 'ALL' && j.status !== statusFilter) return false;
    return true;
  });

  const completedCount = jobs.filter((j) => j.status === 'COMPLETED').length;
  const activeCount = jobs.filter((j) => j.status === 'ACTIVE').length;
  const delayedCount = jobs.filter((j) => j.status === 'DELAYED').length;
  const waitingCount = jobs.filter((j) => j.status === 'WAITING').length;
  const failedCount = jobs.filter((j) => j.status === 'FAILED').length;

  const handleSimulateBatch = () => {
    simulateBatchInboundJobs();
    toast(
      'Batch Jobs Enqueued',
      'Dispatched 4 simulated background jobs to BullMQ queue workers.',
      'info'
    );
  };

  const handleRetry = (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    retryJob(jobId);
    toast('Job Re-enqueued', `Reset job ${jobId} status to WAITING for worker pickup.`, 'info');
  };

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'ACTIVE':
        return 'text-indigo-700 bg-indigo-50 border-indigo-200 animate-pulse';
      case 'DELAYED':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'WAITING':
        return 'text-slate-600 bg-slate-100 border-slate-200';
      case 'FAILED':
        return 'text-rose-700 bg-rose-50 border-rose-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              BullMQ & Redis Background Worker Engine
            </h1>
            <span className="text-xs font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              Worker Pool: 4 Concurrency
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time queue monitoring, exponential backoff retries, and scheduled follow-up job inspection for{' '}
            <span className="font-medium text-slate-800">{currentOrg.name}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSimulateBatch}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Simulate Batch Inbound Jobs</span>
          </button>
        </div>
      </div>

      {/* Worker Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[11px] text-slate-400 block">Total Jobs</span>
          <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
            {jobs.length}
          </span>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[11px] text-indigo-600 font-medium block">Active Workers</span>
          <span className="text-xl font-bold font-mono text-indigo-600 tabular-nums">
            {activeCount}
          </span>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[11px] text-amber-600 font-medium block">Delayed / Sched</span>
          <span className="text-xl font-bold font-mono text-amber-600 tabular-nums">
            {delayedCount}
          </span>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[11px] text-slate-500 block">Waiting Queue</span>
          <span className="text-xl font-bold font-mono text-slate-700 tabular-nums">
            {waitingCount}
          </span>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[11px] text-emerald-600 font-medium block">Completed</span>
          <span className="text-xl font-bold font-mono text-emerald-600 tabular-nums">
            {completedCount}
          </span>
        </div>
      </div>

      {/* Status Filter Buttons */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        {['ALL', 'ACTIVE', 'WAITING', 'DELAYED', 'COMPLETED', 'FAILED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              statusFilter === st
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Jobs Table & Payload Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Job ID & Name</th>
                  <th className="py-3 px-4">Queue</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Attempts</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      No jobs currently match this filter.
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => {
                    const isSelected = selectedJob?.id === job.id;
                    return (
                      <tr
                        key={job.id}
                        onClick={() => setSelectedJob(job)}
                        className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                          isSelected ? 'bg-indigo-50/40' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900 font-mono text-[11px] truncate max-w-xs">
                            {job.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">{job.id}</p>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                          {job.queueName}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusBadge(
                              job.status
                            )}`}
                          >
                            {job.status} {job.status === 'ACTIVE' && `(${job.progress}%)`}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 tabular-nums">
                          {job.durationMs ? `${job.durationMs}ms` : '—'}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 tabular-nums">
                          {job.attempts}/{job.maxAttempts}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => handleRetry(job.id, e)}
                            className="text-slate-400 hover:text-indigo-600 p-1"
                            title="Retry job"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Payload Inspector */}
        <div className="lg:col-span-4 bg-slate-900 text-slate-200 rounded-xl p-4 font-mono text-xs shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-slate-100">Job Payload Inspector</span>
            </div>
            {selectedJob && (
              <span className="text-[10px] text-emerald-400">{selectedJob.status}</span>
            )}
          </div>

          {selectedJob ? (
            <div className="space-y-3">
              <div>
                <span className="text-slate-400 text-[10px] block">JOB NAME:</span>
                <span className="text-white font-bold">{selectedJob.name}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">QUEUE NAME:</span>
                <span className="text-indigo-300">{selectedJob.queueName}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">CREATED AT:</span>
                <span className="text-slate-300 text-[11px]">{selectedJob.createdAt}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">DATA PAYLOAD:</span>
                <pre className="bg-slate-950 p-2.5 rounded border border-slate-800 text-[11px] overflow-x-auto text-emerald-300">
                  {JSON.stringify(selectedJob.data, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-xs py-8 text-center">
              Click any background job in the table to inspect its Redis JSON payload and runtime metadata.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
