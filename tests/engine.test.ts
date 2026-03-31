import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  TaskEngine,
  CircularDependencyError,
  TaskCompletionError,
} from '../src/engine.js';
import type { Task } from '../src/types.js';

function leaf(id: string, title: string, status: Task['status'] = 'pending'): Task {
  return { id, title, status, subtasks: [], dependsOn: [] };
}

describe('TaskEngine', () => {
  it('addTaskDependency rejects self-loop', () => {
    const engine = new TaskEngine([leaf('a', 'A')]);
    assert.throws(() => engine.addTaskDependency('a', 'a'), CircularDependencyError);
  });

  it('detects simple 3-cycle A → B → C → A', () => {
    const engine = new TaskEngine([leaf('a', 'A'), leaf('b', 'B'), leaf('c', 'C')]);
    engine.addTaskDependency('a', 'b'); // b before a
    engine.addTaskDependency('b', 'c'); // c before b
    assert.throws(() => engine.addTaskDependency('c', 'a'), CircularDependencyError);
  });

  it('detects deep transitive cycle before adding edge', () => {
    const tasks = ['t1', 't2', 't3', 't4', 't5'].map((id) => leaf(id, id));
    const engine = new TaskEngine(tasks);
    engine.addTaskDependency('t1', 't2');
    engine.addTaskDependency('t2', 't3');
    engine.addTaskDependency('t3', 't4');
    engine.addTaskDependency('t4', 't5');
    assert.throws(() => engine.addTaskDependency('t5', 't1'), CircularDependencyError);
  });

  it('allows DAG after multiple valid edges', () => {
    const engine = new TaskEngine([leaf('x', 'X'), leaf('y', 'Y'), leaf('z', 'Z')]);
    engine.addTaskDependency('z', 'y');
    engine.addTaskDependency('z', 'x');
    engine.addTaskDependency('y', 'x');
    engine.completeTask('x');
    engine.completeTask('y');
    const { unlocked } = engine.completeTask('z');
    assert.ok(unlocked.length >= 0);
  });

  it('completeTask rule A: blocked by unfinished prerequisite', () => {
    const engine = new TaskEngine([leaf('a', 'A'), leaf('b', 'B')]);
    engine.addTaskDependency('b', 'a');
    assert.throws(() => engine.completeTask('b'), TaskCompletionError);
    engine.completeTask('a');
    engine.completeTask('b');
  });

  it('completeTask rule B: recursive subtasks must be done', () => {
    const root: Task = {
      id: 'root',
      title: 'Root',
      status: 'pending',
      dependsOn: [],
      subtasks: [
        {
          id: 's1',
          title: 'S1',
          status: 'pending',
          dependsOn: [],
          subtasks: [leaf('s1a', 'S1a')],
        },
      ],
    };
    const engine = new TaskEngine([root]);
    assert.throws(() => engine.completeTask('root'), TaskCompletionError);
    engine.getTask('s1a')!.status = 'completed';
    engine.getTask('s1')!.status = 'completed';
    engine.completeTask('root');
  });

  it('completeTask rule C: returns downstream tasks whose deps all become satisfied', () => {
    const engine = new TaskEngine([
      leaf('gate', 'Gate'),
      leaf('down1', 'D1'),
      leaf('down2', 'D2'),
    ]);
    engine.addTaskDependency('down1', 'gate');
    engine.addTaskDependency('down2', 'gate');
    const { unlocked } = engine.completeTask('gate');
    assert.deepEqual(unlocked, ['down1', 'down2']);
  });

  it('unlocked is sorted lexicographically (stable across environments)', () => {
    const engine = new TaskEngine([
      leaf('gate', 'Gate'),
      leaf('z-last', 'Z'),
      leaf('a-first', 'A'),
      leaf('m-mid', 'M'),
    ]);
    engine.addTaskDependency('z-last', 'gate');
    engine.addTaskDependency('a-first', 'gate');
    engine.addTaskDependency('m-mid', 'gate');
    const { unlocked } = engine.completeTask('gate');
    assert.deepEqual(unlocked, ['a-first', 'm-mid', 'z-last']);
  });

  it('unlocked uses localeCompare(en) for non-ASCII task ids', () => {
    const ids = ['任务-z', '任务-a', '任务-m'];
    const engine = new TaskEngine([
      leaf('gate', 'Gate'),
      ...ids.map((id) => leaf(id, id)),
    ]);
    for (const id of ids) engine.addTaskDependency(id, 'gate');
    const { unlocked } = engine.completeTask('gate');
    const expected = [...ids].sort((a, b) => a.localeCompare(b, 'en'));
    assert.deepEqual(unlocked, expected);
  });

  it('rule C: only returns tasks that are still pending and now fully unblocked', () => {
    const engine = new TaskEngine([leaf('p', 'P'), leaf('q', 'Q'), leaf('r', 'R')]);
    engine.addTaskDependency('q', 'p');
    engine.addTaskDependency('r', 'p');
    engine.getTask('q')!.status = 'completed';
    const { unlocked } = engine.completeTask('p');
    assert.deepEqual(unlocked, ['r']);
  });

  it('getBlockedByIds matches dependsOn; listDependents is inverse', () => {
    const engine = new TaskEngine([leaf('a', 'A'), leaf('b', 'B'), leaf('c', 'C')]);
    engine.addTaskDependency('b', 'a');
    engine.addTaskDependency('c', 'a');
    assert.deepEqual(engine.getBlockedByIds('b'), ['a']);
    assert.deepEqual(new Set(engine.listDependents('a')), new Set(['b', 'c']));
  });

  it('addTaskDependency is idempotent when adding the same edge twice', () => {
    const engine = new TaskEngine([leaf('a', 'A'), leaf('b', 'B')]);
    engine.addTaskDependency('b', 'a');
    engine.addTaskDependency('b', 'a');
    assert.equal(engine.getTask('b')!.dependsOn.filter((x) => x === 'a').length, 1);
  });

  it('completeTask rejects cancelled task (terminal state)', () => {
    const engine = new TaskEngine([leaf('x', 'X')]);
    engine.getTask('x')!.status = 'cancelled';
    assert.throws(() => engine.completeTask('x'), TaskCompletionError);
  });

  it('rule A: cancelled prerequisite does not count as satisfied (only completed does)', () => {
    const engine = new TaskEngine([leaf('a', 'A'), leaf('b', 'B')]);
    engine.addTaskDependency('b', 'a');
    engine.getTask('a')!.status = 'cancelled';
    assert.throws(() => engine.completeTask('b'), TaskCompletionError);
    engine.getTask('a')!.status = 'completed';
    engine.completeTask('b');
  });

  it('rule B: in_progress subtask blocks parent completion (only completed counts)', () => {
    const root: Task = {
      id: 'root',
      title: 'Root',
      status: 'pending',
      dependsOn: [],
      subtasks: [
        {
          id: 'sub',
          title: 'Sub',
          status: 'in_progress',
          dependsOn: [],
          subtasks: [],
        },
      ],
    };
    const engine = new TaskEngine([root]);
    assert.throws(() => engine.completeTask('root'), TaskCompletionError);
    engine.getTask('sub')!.status = 'completed';
    engine.completeTask('root');
  });

  it('cross-hierarchy dependency with nested tasks', () => {
    const child = leaf('child', 'Child');
    const root: Task = {
      id: 'root',
      title: 'Root',
      status: 'pending',
      dependsOn: [],
      subtasks: [child],
    };
    const engine = new TaskEngine([root, leaf('other', 'Other')]);
    engine.addTaskDependency('root', 'other');
    assert.throws(() => engine.completeTask('root'));
    engine.completeTask('other');
    engine.getTask('child')!.status = 'completed';
    engine.completeTask('root');
  });
});
