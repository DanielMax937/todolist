import { TaskEngine } from './engine';
import type { Task } from './types';

function leaf(id: string, title: string, status: Task['status'] = 'pending'): Task {
  return { id, title, status, subtasks: [], dependsOn: [] };
}

/** Demo graph aligned with `scripts/generate-stats-page.ts` / stats UI. */
export function buildDemoEngineForStats(): TaskEngine {
  const onboarding: Task = {
    id: 'onboarding',
    title: 'Onboarding',
    status: 'in_progress',
    dependsOn: [],
    subtasks: [
      leaf('onb-account', 'Create account', 'completed'),
      leaf('onb-profile', 'Fill profile', 'pending'),
    ],
  };

  const engine = new TaskEngine([
    onboarding,
    leaf('infra', 'Provision infra', 'pending'),
    leaf('design', 'Design review', 'completed'),
    leaf('blocked', 'Blocked legacy', 'cancelled'),
  ]);

  engine.addTaskDependency('infra', 'design');
  engine.addTaskDependency('onboarding', 'design');

  return engine;
}
