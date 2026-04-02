import { TaskEngine } from './engine';
import type { Task } from './types';

function leaf(id: string, title: string, status: Task['status'] = 'pending'): Task {
  return { id, title, status, subtasks: [], dependsOn: [] };
}

/** Same task tree and cross-links as the interactive demo (`TodoApp`). */
export function buildDemoRoots(): Task[] {
  const child = leaf('child', 'Finish child work');
  const root: Task = {
    id: 'root',
    title: 'Ship feature',
    status: 'pending',
    dependsOn: [],
    subtasks: [
      {
        id: 's1',
        title: 'Design review',
        status: 'pending',
        dependsOn: [],
        subtasks: [leaf('s1a', 'Sketch flows')],
      },
      child,
    ],
  };
  return [
    root,
    leaf('gate', 'Release gate'),
    leaf('down1', 'Downstream A'),
    leaf('down2', 'Downstream B'),
  ];
}

/** Engine instance used by the demo UI — single source of truth for integration tests. */
export function buildDemoEngine(): TaskEngine {
  const engine = new TaskEngine();
  for (const r of buildDemoRoots()) engine.addRoot(r);
  engine.addTaskDependency('down1', 'gate');
  engine.addTaskDependency('down2', 'gate');
  engine.addTaskDependency('root', 'gate');
  return engine;
}
