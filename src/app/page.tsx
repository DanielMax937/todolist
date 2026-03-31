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
      <TodoApp />
    </main>
  );
}
