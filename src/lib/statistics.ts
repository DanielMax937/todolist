import type { TaskEngine } from './engine';
import type { Task, TaskStatus } from './types';

/** Aggregated counts for every task in the engine (flat index, all subtrees). */
export interface TaskStatsSnapshot {
  total: number;
  byStatus: Record<TaskStatus, number>;
  /** Number of top-level roots registered with {@link TaskEngine.addRoot}. */
  rootCount: number;
  /** Maximum nesting depth of subtasks (roots at depth 0). */
  maxDepth: number;
  /** Sum of `dependsOn.length` across all tasks (prerequisite edge count). */
  prerequisiteEdgeCount: number;
}

function emptyByStatus(): Record<TaskStatus, number> {
  return {
    pending: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
  };
}

function walkDepth(task: Task, baseDepth: number): number {
  let max = baseDepth;
  for (const s of task.subtasks) {
    max = Math.max(max, walkDepth(s, baseDepth + 1));
  }
  return max;
}

/**
 * Computes aggregate statistics for all tasks indexed by the engine.
 */
export function computeTaskStatistics(engine: TaskEngine): TaskStatsSnapshot {
  const byStatus = emptyByStatus();
  let prerequisiteEdgeCount = 0;
  const ids = engine.listTaskIds();

  for (const id of ids) {
    const t = engine.requireTask(id);
    byStatus[t.status] += 1;
    prerequisiteEdgeCount += t.dependsOn.length;
  }

  let maxDepth = 0;
  for (const r of engine.rootTasks) {
    maxDepth = Math.max(maxDepth, walkDepth(r, 0));
  }

  return {
    total: ids.length,
    byStatus,
    rootCount: engine.rootTasks.length,
    maxDepth,
    prerequisiteEdgeCount,
  };
}
