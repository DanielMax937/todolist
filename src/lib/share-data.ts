import type { Task } from './types';
import { buildDemoEngineForStats } from './stats-demo';

/** Serializable payload returned by `GET /api/share/[shareId]`. */
export type SharedTodoSnapshot = {
  title: string;
  roots: Task[];
};

export type ShareResolveResult =
  | { ok: true; snapshot: SharedTodoSnapshot }
  | { ok: false; kind: 'not_found' }
  | { ok: false; kind: 'server_error' };

function cloneRoots(roots: readonly Task[]): Task[] {
  return structuredClone(roots) as Task[];
}

/**
 * Resolves a share id to a read-only task snapshot.
 *
 * Built-in ids (for demos and QA):
 * - `demo` — same graph as {@link buildDemoEngineForStats}
 * - `empty` — valid share with zero root tasks
 * - `error` — forces a server error (500) for error-state UI
 * - `not-found` — forces 404
 *
 * Any other id returns not found.
 */
export function resolveSharedSnapshot(shareId: string): ShareResolveResult {
  const id = shareId.trim().toLowerCase();

  if (id === 'empty') {
    return { ok: true, snapshot: { title: 'Shared list', roots: [] } };
  }

  if (id === 'error') {
    return { ok: false, kind: 'server_error' };
  }

  if (id === 'not-found') {
    return { ok: false, kind: 'not_found' };
  }

  if (id === 'demo') {
    const engine = buildDemoEngineForStats();
    return {
      ok: true,
      snapshot: {
        title: 'Shared list (demo)',
        roots: cloneRoots(engine.rootTasks),
      },
    };
  }

  return { ok: false, kind: 'not_found' };
}
