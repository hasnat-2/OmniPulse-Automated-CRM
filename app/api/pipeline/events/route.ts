import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('orgId') || 'org-nexus';

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial handshake
      const initialPayload = JSON.stringify({
        type: 'INITIAL_SYNC',
        orgId,
        timestamp: new Date().toISOString(),
        message: 'SSE pipeline synchronization channel established.',
      });
      controller.enqueue(encoder.encode(`event: pipeline:sync\ndata: ${initialPayload}\n\n`));

      // Periodic heartbeat and active pipeline broadcast
      const interval = setInterval(() => {
        try {
          const heartbeatData = JSON.stringify({
            type: 'PIPELINE_HEARTBEAT',
            orgId,
            timestamp: new Date().toISOString(),
          });
          controller.enqueue(encoder.encode(`event: pipeline:heartbeat\ndata: ${heartbeatData}\n\n`));
        } catch {
          clearInterval(interval);
        }
      }, 15000);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
