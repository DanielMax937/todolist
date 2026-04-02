# Smart Todo (Next.js + dependency graph engine)

Next.js 15 (App Router) UI on top of the same **TaskEngine** as the unit tests: nested subtasks, prerequisite edges (`dependsOn`), cycle detection, and `completeTask` with downstream **unlocked** IDs.

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

## Project layout

- **`src/lib/`** — `Task`, `TaskEngine`, and error types (used by UI and tests).
- **`src/app/`** — App Router (`layout.tsx`, `page.tsx`, `globals.css`, `not-found.tsx`).
- **`src/components/todo-app.tsx`** — client demo that wires the engine to buttons and nested task rows.

## Commands

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run start
npm test         # unit + demo integration tests (node:test + tsx)
npm run typecheck
npm run lint
npm run verify   # test + typecheck + lint + build (release gate)
```

## Release verification (联调 / 回归 / 上线验收)

Run before tagging or deploying:

1. `npm install`
2. `npm run verify` — runs tests, typecheck, lint, and production build (or run those four steps individually)
3. Smoke: `npm run start` and open `/` and `/stats` in a browser (complete tasks on `/` per on-page hints; confirm no console errors)

If you use a root-level **`app/`** directory, Next.js picks it over **`src/app/`**. Keep routes in one place (here: **`src/app/`** only).
