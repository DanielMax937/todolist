'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { TaskEngine, type Task } from '@/lib/engine';
import type { SharedTodoSnapshot } from '@/lib/share-data';

type FetchState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; snapshot: SharedTodoSnapshot };

function statusClass(status: Task['status']): string {
  return `badge badge-${status}`;
}

function ReadOnlyTaskBlock({ task, engine }: { task: Task; engine: TaskEngine }) {
  const blockedBy = engine.getBlockedByIds(task.id);
  const dependents = engine.listDependents(task.id);

  return (
    <li className="task-item">
      <div className="task-row">
        <span className="task-title">{task.title}</span>
        <span className={statusClass(task.status)} title="Task status">
          {task.status.replace('_', ' ')}
        </span>
      </div>
      <div className="task-meta">
        <span>
          <strong>id:</strong> {task.id}
        </span>
        {blockedBy.length > 0 ? (
          <>
            {' · '}
            <span>
              <strong>blocked by:</strong> {blockedBy.join(', ')}
            </span>
          </>
        ) : null}
        {dependents.length > 0 ? (
          <>
            {' · '}
            <span>
              <strong>dependents:</strong> {dependents.join(', ')}
            </span>
          </>
        ) : null}
      </div>
      {task.subtasks.length > 0 ? (
        <ul className="task-list task-indent">
          {task.subtasks.map((s) => (
            <ReadOnlyTaskBlock key={s.id} task={s} engine={engine} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

async function fetchShare(shareId: string): Promise<SharedTodoSnapshot> {
  const res = await fetch(`/api/share/${encodeURIComponent(shareId)}`, {
    cache: 'no-store',
  });

  const body = (await res.json()) as
    | { ok: true; data: SharedTodoSnapshot }
    | { ok: false; error: string };

  if (!res.ok || !body.ok) {
    if (res.status === 404) {
      throw new Error('This share link does not exist or has expired.');
    }
    if (res.status >= 500) {
      throw new Error('Could not load the shared list. Please try again.');
    }
    throw new Error('Could not load the shared list.');
  }

  return body.data;
}

export function SharedTodoView({ shareId }: { shareId: string }) {
  const [state, setState] = useState<FetchState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    fetchShare(shareId)
      .then((snapshot) => {
        if (!cancelled) {
          setState({ status: 'ready', snapshot });
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          const message = e instanceof Error ? e.message : String(e);
          setState({ status: 'error', message });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [shareId]);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    fetchShare(shareId)
      .then((snapshot) => {
        setState({ status: 'ready', snapshot });
      })
      .catch((e: unknown) => {
        const message = e instanceof Error ? e.message : String(e);
        setState({ status: 'error', message });
      });
  }, [shareId]);

  const engine = useMemo(() => {
    if (state.status !== 'ready') {
      return null;
    }
    return new TaskEngine(state.snapshot.roots);
  }, [state]);

  return (
    <>
      <p className="page-lead" style={{ marginBottom: '0.5rem' }}>
        <Link href="/">← Back to Smart Todo</Link>
      </p>

      {state.status === 'loading' ? (
        <div className="share-state share-state--loading" role="status" aria-live="polite">
          <div className="share-skeleton" />
          <p className="share-state-text">Loading shared list…</p>
        </div>
      ) : null}

      {state.status === 'error' ? (
        <div className="share-state share-state--error" role="alert">
          <p className="share-state-title">Something went wrong</p>
          <p className="share-state-text">{state.message}</p>
          <button type="button" className="btn" onClick={retry}>
            Retry
          </button>
        </div>
      ) : null}

      {state.status === 'ready' && state.snapshot.roots.length === 0 ? (
        <div className="share-state share-state--empty" role="status">
          <p className="share-state-title">Nothing here yet</p>
          <p className="share-state-text">This shared list has no tasks.</p>
        </div>
      ) : null}

      {state.status === 'ready' && state.snapshot.roots.length > 0 && engine ? (
        <div className="panel">
          <p style={{ marginTop: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>
            Read-only snapshot — <strong>{state.snapshot.title}</strong>
          </p>
          <ul className="task-list">
            {state.snapshot.roots.map((t) => (
              <ReadOnlyTaskBlock key={t.id} task={t} engine={engine} />
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}
