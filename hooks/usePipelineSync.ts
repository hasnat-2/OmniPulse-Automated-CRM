'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCRM } from '@/lib/crm-store';
import { useToast } from '@/components/ui/Toast';

export interface PipelineSyncEvent {
  type: 'INITIAL_SYNC' | 'PIPELINE_UPDATED' | 'DEAL_MOVED' | 'DEAL_CREATED' | 'PIPELINE_HEARTBEAT';
  orgId: string;
  timestamp: string;
  data?: any;
  message?: string;
}

export function usePipelineSync(orgIdOverride?: string) {
  const queryClient = useQueryClient();
  const { currentOrg } = useCRM();
  const { toast } = useToast();

  const orgId = orgIdOverride || currentOrg.id;
  const [isConnected, setIsConnected] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const handleSyncEvent = useCallback(
    (eventPayload: PipelineSyncEvent) => {
      setLastSyncedAt(eventPayload.timestamp || new Date().toISOString());

      // TanStack Query invalidations to keep Kanban & pipeline caches fresh across clients
      queryClient.invalidateQueries({ queryKey: ['pipeline', orgId] });
      queryClient.invalidateQueries({ queryKey: ['deals', orgId] });

      if (eventPayload.type === 'DEAL_MOVED') {
        toast('Pipeline Synchronized', 'Real-time stage update received from server.', 'info');
      }
    },
    [queryClient, orgId, toast]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Connect to Server-Sent Events endpoint
    const url = `/api/pipeline/events?orgId=${encodeURIComponent(orgId)}`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onerror = () => {
      setIsConnected(false);
    };

    // Generic pipeline:sync listener
    eventSource.addEventListener('pipeline:sync', (e: MessageEvent) => {
      try {
        const payload: PipelineSyncEvent = JSON.parse(e.data);
        handleSyncEvent(payload);
      } catch {
        // parse error ignored
      }
    });

    // Specific deal:moved and deal:updated listeners
    eventSource.addEventListener('deal:moved', (e: MessageEvent) => {
      try {
        const payload: PipelineSyncEvent = JSON.parse(e.data);
        handleSyncEvent(payload);
      } catch {
        // ignore
      }
    });

    eventSource.addEventListener('pipeline:heartbeat', (e: MessageEvent) => {
      try {
        const payload: PipelineSyncEvent = JSON.parse(e.data);
        setLastSyncedAt(payload.timestamp);
      } catch {
        // ignore
      }
    });

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    };
  }, [orgId, handleSyncEvent]);

  // Method for components to broadcast an optimistic update and trigger query invalidation
  const broadcastUpdate = useCallback(
    (actionType: 'DEAL_MOVED' | 'DEAL_CREATED' | 'STAGE_UPDATED', data?: any) => {
      const now = new Date().toISOString();
      setLastSyncedAt(now);

      // Invalidate TanStack Query caches immediately
      queryClient.invalidateQueries({ queryKey: ['pipeline', orgId] });
      queryClient.invalidateQueries({ queryKey: ['deals', orgId] });

      // Trigger cross-window/client broadcast via BroadcastChannel if supported
      try {
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel(`omnipulse_pipeline_${orgId}`);
          bc.postMessage({ type: actionType, orgId, timestamp: now, data });
          bc.close();
        }
      } catch {
        // fallback
      }
    },
    [queryClient, orgId]
  );

  // Cross-tab synchronization via BroadcastChannel alongside SSE
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;

    const bc = new BroadcastChannel(`omnipulse_pipeline_${orgId}`);
    bc.onmessage = (event) => {
      if (event.data?.orgId === orgId) {
        queryClient.invalidateQueries({ queryKey: ['pipeline', orgId] });
        queryClient.invalidateQueries({ queryKey: ['deals', orgId] });
        setLastSyncedAt(event.data.timestamp || new Date().toISOString());
      }
    };

    return () => {
      bc.close();
    };
  }, [orgId, queryClient]);

  return {
    isConnected,
    lastSyncedAt,
    broadcastUpdate,
  };
}
