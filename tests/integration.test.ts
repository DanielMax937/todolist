import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildDemoEngine } from '../src/lib/demo-graph';
import { TaskCompletionError } from '../src/lib/engine';

/**
 * Regression / integration: the interactive demo graph stays aligned with TaskEngine
 * (same wiring as {@link buildDemoEngine} + `TodoApp`).
 */
describe('Demo graph integration', () => {
  it('exposes the same root order and gate dependents as the UI', () => {
    const engine = buildDemoEngine();
    assert.deepEqual(
      engine.rootTasks.map((t) => t.id),
      ['root', 'gate', 'down1', 'down2'],
    );
    assert.deepEqual(new Set(engine.listDependents('gate')), new Set(['down1', 'down2', 'root']));
  });

  it('completing gate after subtasks unlocks down1, down2, and root (sorted)', () => {
    const engine = buildDemoEngine();
    engine.completeTask('s1a');
    engine.completeTask('s1');
    engine.completeTask('child');
    const { unlocked } = engine.completeTask('gate');
    assert.deepEqual(unlocked, ['down1', 'down2', 'root']);
  });

  it('cannot complete root before gate or before nested subtasks', () => {
    const engine = buildDemoEngine();
    assert.throws(() => engine.completeTask('root'), TaskCompletionError);
    engine.getTask('s1a')!.status = 'completed';
    engine.getTask('s1')!.status = 'completed';
    engine.getTask('child')!.status = 'completed';
    assert.throws(() => engine.completeTask('root'), TaskCompletionError);
  });

  it('cannot complete down1/down2 before gate', () => {
    const engine = buildDemoEngine();
    assert.throws(() => engine.completeTask('down1'), TaskCompletionError);
    assert.throws(() => engine.completeTask('down2'), TaskCompletionError);
  });

  it('full demo path: gate then root then downstreams completes all roots', () => {
    const engine = buildDemoEngine();
    engine.completeTask('s1a');
    engine.completeTask('s1');
    engine.completeTask('child');
    engine.completeTask('gate');
    engine.completeTask('root');
    engine.completeTask('down1');
    engine.completeTask('down2');
    for (const id of ['root', 'gate', 'down1', 'down2', 's1', 's1a', 'child']) {
      assert.equal(engine.getTask(id)!.status, 'completed');
    }
  });
});
