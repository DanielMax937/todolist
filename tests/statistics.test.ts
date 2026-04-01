import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { TaskEngine } from '../src/lib/engine';
import { computeTaskStatistics } from '../src/lib/statistics';
import type { Task } from '../src/lib/types';

function leaf(id: string, title: string, status: Task['status'] = 'pending'): Task {
  return { id, title, status, subtasks: [], dependsOn: [] };
}

describe('computeTaskStatistics', () => {
  it('counts statuses and edges for a flat engine', () => {
    const engine = new TaskEngine([
      leaf('a', 'A', 'completed'),
      leaf('b', 'B', 'pending'),
    ]);
    engine.addTaskDependency('b', 'a');

    const s = computeTaskStatistics(engine);
    assert.equal(s.total, 2);
    assert.equal(s.byStatus.completed, 1);
    assert.equal(s.byStatus.pending, 1);
    assert.equal(s.prerequisiteEdgeCount, 1);
    assert.equal(s.rootCount, 2);
    assert.equal(s.maxDepth, 0);
  });

  it('computes maxDepth for nested subtasks', () => {
    const root: Task = {
      id: 'r',
      title: 'R',
      status: 'pending',
      dependsOn: [],
      subtasks: [
        {
          id: 's1',
          title: 'S1',
          status: 'pending',
          dependsOn: [],
          subtasks: [leaf('s1a', 'Deep', 'in_progress')],
        },
      ],
    };
    const engine = new TaskEngine([root]);
    const s = computeTaskStatistics(engine);
    assert.equal(s.total, 3);
    assert.equal(s.maxDepth, 2);
    assert.equal(s.rootCount, 1);
  });

  it('sums all prerequisite edges', () => {
    const engine = new TaskEngine([leaf('x', 'X'), leaf('y', 'Y'), leaf('z', 'Z')]);
    engine.addTaskDependency('y', 'x');
    engine.addTaskDependency('z', 'x');
    const s = computeTaskStatistics(engine);
    assert.equal(s.prerequisiteEdgeCount, 2);
  });
});
