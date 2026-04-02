import Link from 'next/link';

import { ShareBar } from '@/components/share-bar';
import { TodoApp } from '@/components/todo-app';

export default function HomePage() {
  return (
    <main>
      <div className="page-header-top">
        <h1 className="page-title">Smart Todo</h1>
        <ShareBar
          shareTitle="Smart Todo — dependency graph"
          shareText="Dependency-aware tasks: nested subtasks, dependsOn, and TaskEngine completion rules."
        />
      </div>
      <p className="page-lead">
        Dependency-aware tasks: <code>dependsOn</code> prerequisites, nested subtasks, and{' '}
        <code>completeTask</code> with unlocked downstream IDs — powered by the same{' '}
        <code>TaskEngine</code> as the unit tests.
      </p>
      <p className="page-lead">
        <Link href="/stats">Task statistics</Link> — aggregate counts from <code>computeTaskStatistics</code>.
        {' · '}
        <Link href="/share">Shared list</Link> — read-only share view (skeleton).
        {' · '}
        <Link href="/share/demo">Shared todo (demo)</Link> — snapshot with loading / empty / error states.
      </p>
      <TodoApp />
    </main>
  );
}
