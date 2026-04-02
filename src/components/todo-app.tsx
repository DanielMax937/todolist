'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import { buildDemoEngine } from '@/lib/demo-graph';
import { TaskEngine, TaskCompletionError, type Task } from '@/lib/engine';

function useTaskEngine(): { engine: TaskEngine; version: number; bump: () => void } {
  const engineRef = useRef<TaskEngine | null>(null);
  const [version, setVersion] = useState(0);

  if (!engineRef.current) {
    engineRef.current = buildDemoEngine();
  }

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  return { engine: engineRef.current as TaskEngine, version, bump };
}

function statusClass(status: Task['status']): string {
  return `badge badge-${status}`;
}

function TaskBlock({
  task,
  engine,
  onCompleteSuccess,
}: {
  task: Task;
  engine: TaskEngine;
  onCompleteSuccess: (unlocked: string[]) => void;
}) {
  const [localError, setLocalError] = useState<string | null>(null);

  const canComplete = task.status !== 'completed' && task.status !== 'cancelled';

  const handleComplete = () => {
    setLocalError(null);
    try {
      const { unlocked } = engine.completeTask(task.id);
      onCompleteSuccess(unlocked);
    } catch (e) {
      const msg = e instanceof TaskCompletionError ? e.message : String(e);
      setLocalError(msg);
    }
  };

  const blockedBy = engine.getBlockedByIds(task.id);
  const dependents = engine.listDependents(task.id);

  return (
    <li className="task-item">
      <div className="task-row">
        <span className="task-title">{task.title}</span>
        <span className={statusClass(task.status)} title="Task status">
          {task.status.replace('_', ' ')}
        </span>
        {canComplete ? (
          <button type="button" className="btn" onClick={handleComplete}>
            Complete
          </button>
        ) : (
          <button type="button" className="btn" disabled>
            Done
          </button>
        )}
      </div>
      {localError ? (
        <div className="flash" role="status">
          {localError}
        </div>
      ) : null}
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
            <TaskBlock key={s.id} task={s} engine={engine} onCompleteSuccess={onCompleteSuccess} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function TodoApp() {
  const { engine, version, bump } = useTaskEngine();
  const [lastUnlocked, setLastUnlocked] = useState<string[] | null>(null);

  const roots = useMemo(() => {
    void version;
    return engine.rootTasks;
  }, [engine, version]);

  const onCompleteSuccess = useCallback(
    (unlocked: string[]) => {
      setLastUnlocked(unlocked.length > 0 ? unlocked : null);
      bump();
    },
    [bump],
  );

  return (
    <div className="panel">
      <p style={{ marginTop: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>
        Try completing prerequisites first (e.g. <code>gate</code> unblocks <code>down1</code> /{' '}
        <code>down2</code>). Complete nested subtasks before <code>root</code>.
      </p>
      <ul className="task-list">
        {roots.map((t) => (
          <TaskBlock key={t.id} task={t} engine={engine} onCompleteSuccess={onCompleteSuccess} />
        ))}
      </ul>
      {lastUnlocked && lastUnlocked.length > 0 ? (
        <p className="unlocked">
          Unlocked by last completion: <strong>{lastUnlocked.join(', ')}</strong>
        </p>
      ) : null}
    </div>
  );
}
