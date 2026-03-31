/**
 * Task status for the dependency-aware engine.
 * Only `completed` satisfies dependency / cascade rules.
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

/**
 * A task may nest subtasks arbitrarily deep. All `id` values MUST be unique
 * within the entire tree managed by one {@link TaskEngine}.
 *
 * **Spec alignment (dependencies / blockedBy):**
 * - **dependencies** (prerequisite edges) are stored only as **`dependsOn`**: task IDs that must
 *   reach `completed` before this task may be completed.
 * - **blockedBy** is the *same* set as `dependsOn` (tasks that block you). It is **not** duplicated
 *   on the object to avoid drift; use {@link TaskEngine.getBlockedByIds} for a read-only view.
 * - Reverse edges (“who depends on me?”) via {@link TaskEngine.listDependents}.
 */
export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  subtasks: Task[];
  /** Prerequisite task IDs = dependency sources = “blocked by” these tasks. */
  dependsOn: string[];
}
