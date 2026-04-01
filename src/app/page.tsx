import Link from 'next/link';

import { TodoApp } from '@/components/todo-app';

export default function HomePage() {
  return (
    <main>
      <h1 className="page-title">Smart Todo</h1>
      <p className="page-lead">
        Dependency-aware tasks: <code>dependsOn</code> prerequisites, nested subtasks, and{' '}
        <code>completeTask</code> with unlocked downstream IDs — powered by the same{' '}
        <code>TaskEngine</code> as the unit tests.
      </p>
      <p className="page-lead">
        <Link href="/stats">Task statistics</Link> — aggregate counts from <code>computeTaskStatistics</code>.
        {' · '}
        <Link href="/share">Shared list</Link> — read-only share view (skeleton).
      </p>
      <TodoApp />
    </main>
  );
}
