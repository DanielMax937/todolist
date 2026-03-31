export class TaskNotFoundError extends Error {
  constructor(readonly taskId: string) {
    super(`Task not found: ${taskId}`);
    this.name = 'TaskNotFoundError';
  }
}

export class CircularDependencyError extends Error {
  constructor(readonly taskId: string, readonly dependsOnTaskId: string) {
    super(
      `Adding dependency would create a cycle: ${taskId} cannot depend on ${dependsOnTaskId} (reachable path exists).`,
    );
    this.name = 'CircularDependencyError';
  }
}

export class CannotCompleteTaskError extends Error {
  constructor(
    readonly taskId: string,
    readonly reason: 'blocked_by_dependencies' | 'subtasks_incomplete',
    readonly detail: string,
  ) {
    super(`Cannot complete task ${taskId}: ${reason} — ${detail}`);
    this.name = 'CannotCompleteTaskError';
  }
}
