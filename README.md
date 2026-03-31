# Smart task engine (dependency graph)

TypeScript library: nested subtasks, prerequisite edges (`dependsOn`), cycle detection, and `completeTask` with prerequisite / subtask checks plus downstream **unlocked** IDs.

## `dependencies` / `blockedBy` (spec wording)

- **Stored field:** `Task.dependsOn` — prerequisite task IDs (cross-hierarchy).
- **blockedBy:** the **same** set as `dependsOn` (who blocks this task). Not duplicated on the object; use **`TaskEngine.getBlockedByIds(taskId)`** for a read-only copy.
- **Reverse query:** **`TaskEngine.listDependents(taskId)`** — tasks that depend on `taskId`.

## `completeTask` semantics (original requirements 3)

- **Rule A:** If the task has **unfinished** prerequisite tasks (`dependsOn`), completion is **rejected**. Only prerequisite status **`completed`** counts as satisfied (`pending`, `in_progress`, `cancelled` all block).
- **Rule B:** If the task has **subtasks**, **every** subtask must be **`completed`** recursively (so `in_progress` / `pending` subtasks block the parent).
- **Rule C:** After the task is successfully marked **`completed`**, returns **`unlocked`**: IDs of tasks that were not yet completed, list this task as a prerequisite, and now have **all** prerequisites completed. **`unlocked` is sorted** with **`String.prototype.localeCompare`** using locale **`en`** (Unicode-aware; not raw ASCII code-point order).

### Terminal states

- **`completed`:** calling `completeTask` again throws `TaskCompletionError`.
- **`cancelled`:** also terminal — `completeTask` **always throws** (no “un-cancel” / completion of cancelled work). To model rework, create a new task id.

```bash
npm install
npm test
npm run typecheck
npm run build   # emits dist/
```
