import type { Task } from './types.js';

export class CircularDependencyError extends Error {
  readonly name = 'CircularDependencyError';
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, CircularDependencyError.prototype);
  }
}

export class TaskCompletionError extends Error {
  readonly name = 'TaskCompletionError';
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, TaskCompletionError.prototype);
  }
}

export class TaskNotFoundError extends Error {
  readonly name = 'TaskNotFoundError';
  constructor(id: string) {
    super(`Task not found: ${id}`);
    Object.setPrototypeOf(this, TaskNotFoundError.prototype);
  }
}

/**
 * In-memory engine: flat index of all tasks by id + prerequisite graph on `dependsOn`.
 *
 * Graph edge: `p -> t` iff `t.dependsOn` contains `p` (p must complete before t).
 */
export class TaskEngine {
  private readonly roots: Task[] = [];
  private readonly byId = new Map<string, Task>();

  constructor(initialRoots?: Task[]) {
    if (initialRoots) {
      for (const r of initialRoots) this.addRoot(r);
    }
  }

  /** Register a top-level task (indexes the full subtree). */
  addRoot(task: Task): void {
    this.indexTree(task);
    this.roots.push(task);
  }

  private indexTree(t: Task): void {
    if (this.byId.has(t.id)) {
      throw new Error(`Duplicate task id across tree: ${t.id}`);
    }
    this.byId.set(t.id, t);
    for (const s of t.subtasks) {
      this.indexTree(s);
    }
  }

  getTask(id: string): Task | undefined {
    return this.byId.get(id);
  }

  requireTask(id: string): Task {
    const t = this.byId.get(id);
    if (!t) throw new TaskNotFoundError(id);
    return t;
  }

  /**
   * IDs of tasks that **block** `taskId` until they complete — identical to {@link Task.dependsOn}
   * (spec name: **blockedBy**). Read-only copy.
   */
  getBlockedByIds(taskId: string): readonly string[] {
    return [...this.requireTask(taskId).dependsOn];
  }

  /**
   * Task IDs that list `taskId` in their `dependsOn` (downstream / “dependents”).
   */
  listDependents(taskId: string): string[] {
    this.requireTask(taskId);
    const out: string[] = [];
    for (const [id, t] of this.byId) {
      if (t.dependsOn.includes(taskId)) out.push(id);
    }
    return out;
  }

  /**
   * `taskId` will depend on `dependsOnTaskId` (taskId cannot complete until dependsOnTaskId completes).
   * Detects cycles in the prerequisite graph.
   */
  addTaskDependency(taskId: string, dependsOnTaskId: string): void {
    if (taskId === dependsOnTaskId) {
      throw new CircularDependencyError('A task cannot depend on itself.');
    }
    this.requireTask(taskId);
    this.requireTask(dependsOnTaskId);

    const task = this.byId.get(taskId)!;
    if (task.dependsOn.includes(dependsOnTaskId)) {
      return;
    }

    // New edge: dependsOnTaskId -> taskId. Cycle iff taskId can already reach dependsOnTaskId.
    if (this.canReachDownstream(taskId, dependsOnTaskId, new Set())) {
      throw new CircularDependencyError(
        `Adding dependency would create a cycle: ${taskId} already transitively depends (downstream) on ${dependsOnTaskId}.`,
      );
    }

    task.dependsOn.push(dependsOnTaskId);
  }

  /**
   * From prerequisite `from`, follow edges to tasks that list `from` in `dependsOn`
   * (i.e. tasks blocked until `from` completes). Returns whether `target` is reachable.
   */
  private canReachDownstream(from: string, target: string, visiting: Set<string>): boolean {
    if (from === target) return true;
    if (visiting.has(from)) return false;
    visiting.add(from);

    for (const [id, t] of this.byId) {
      if (t.dependsOn.includes(from)) {
        if (id === target || this.canReachDownstream(id, target, visiting)) {
          return true;
        }
      }
    }
    return false;
  }

  private allSubtasksCompletedRecursive(t: Task): boolean {
    for (const s of t.subtasks) {
      if (s.status !== 'completed') return false;
      if (!this.allSubtasksCompletedRecursive(s)) return false;
    }
    return true;
  }

  private allPrerequisitesCompleted(t: Task): boolean {
    for (const pid of t.dependsOn) {
      const p = this.requireTask(pid);
      if (p.status !== 'completed') return false;
    }
    return true;
  }

  /**
   * Rules:
   * - A: all `dependsOn` tasks must be `completed`.
   * - B: all nested `subtasks` must be `completed` (recursive).
   * - Marks task `completed`, returns task IDs that become runnable (all deps satisfied) due to this completion.
   */
  completeTask(taskId: string): { unlocked: string[] } {
    const task = this.requireTask(taskId);
    if (task.status === 'completed') {
      throw new TaskCompletionError(`Task already completed: ${taskId}`);
    }
    if (task.status === 'cancelled') {
      throw new TaskCompletionError(
        `Cannot complete "${taskId}": task is cancelled (terminal state; not eligible for completion).`,
      );
    }

    for (const pid of task.dependsOn) {
      const p = this.requireTask(pid);
      if (p.status !== 'completed') {
        throw new TaskCompletionError(
          `Cannot complete "${taskId}": prerequisite "${pid}" is not completed (status: ${p.status}).`,
        );
      }
    }

    if (!this.allSubtasksCompletedRecursive(task)) {
      throw new TaskCompletionError(
        `Cannot complete "${taskId}": not all subtasks are completed (recursive).`,
      );
    }

    task.status = 'completed';

    const unlocked: string[] = [];
    for (const [id, t] of this.byId) {
      if (id === taskId || t.status === 'completed') continue;
      if (!t.dependsOn.includes(taskId)) continue;
      if (this.allPrerequisitesCompleted(t)) {
        unlocked.push(id);
      }
    }

    unlocked.sort((a, b) => a.localeCompare(b, 'en'));

    return { unlocked };
  }

  /** Utility: shallow clone snapshot for tests / debugging. */
  listTaskIds(): string[] {
    return [...this.byId.keys()];
  }

  /** Top-level tasks registered via {@link addRoot}. */
  get rootTasks(): readonly Task[] {
    return this.roots;
  }
}
