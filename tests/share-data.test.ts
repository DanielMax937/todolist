import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { resolveSharedSnapshot } from '../src/lib/share-data';

describe('resolveSharedSnapshot', () => {
  it('returns demo snapshot for "demo"', () => {
    const r = resolveSharedSnapshot('demo');
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.ok(r.snapshot.roots.length > 0);
    assert.match(r.snapshot.title, /demo/i);
  });

  it('returns empty roots for "empty"', () => {
    const r = resolveSharedSnapshot('empty');
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.deepEqual(r.snapshot.roots, []);
  });

  it('returns not_found for unknown ids', () => {
    const r = resolveSharedSnapshot('no-such-share-xyz');
    assert.equal(r.ok, false);
    if (r.ok) return;
    assert.equal(r.kind, 'not_found');
  });

  it('returns server_error for "error"', () => {
    const r = resolveSharedSnapshot('error');
    assert.equal(r.ok, false);
    if (r.ok) return;
    assert.equal(r.kind, 'server_error');
  });

  it('is case-insensitive for known ids', () => {
    const a = resolveSharedSnapshot('DEMO');
    const b = resolveSharedSnapshot('Empty');
    assert.equal(a.ok, true);
    assert.equal(b.ok, true);
  });
});
