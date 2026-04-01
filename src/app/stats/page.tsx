import Link from 'next/link';

import { ShareBar } from '@/components/share-bar';
import { computeTaskStatistics } from '@/lib/statistics';
import { buildDemoEngineForStats } from '@/lib/stats-demo';

const statusOrder = ['pending', 'in_progress', 'completed', 'cancelled'] as const;

const statusLabels: Record<(typeof statusOrder)[number], string> = {
  pending: 'Pending',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function StatsPage() {
  const stats = computeTaskStatistics(buildDemoEngineForStats());

  return (
    <main>
      <p className="page-lead" style={{ marginBottom: '0.5rem' }}>
        <Link href="/">← Back to Smart Todo</Link>
      </p>
      <div className="page-header-top">
        <h1 className="page-title">Todo task statistics</h1>
        <ShareBar
          shareTitle="Smart Todo — task statistics"
          shareText="Snapshot from computeTaskStatistics — same demo graph as the main app."
        />
      </div>
      <p className="page-lead">
        Snapshot from <code>computeTaskStatistics(TaskEngine)</code> — same demo graph as{' '}
        <code>npm run build:stats</code> / <code>public/stats.html</code>.
      </p>

      <div className="stats-grid">
        <div className="panel stat-card">
          <div className="stat-label">Total tasks</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="panel stat-card">
          <div className="stat-label">Root tasks</div>
          <div className="stat-value">{stats.rootCount}</div>
        </div>
        <div className="panel stat-card">
          <div className="stat-label">Max subtask depth</div>
          <div className="stat-value">{stats.maxDepth}</div>
        </div>
        <div className="panel stat-card">
          <div className="stat-label">Prerequisite edges</div>
          <div className="stat-value">{stats.prerequisiteEdgeCount}</div>
        </div>
      </div>

      <h2 className="stats-heading">By status</h2>
      <div className="stats-grid stats-grid--status">
        {statusOrder.map((key) => (
          <div key={key} className="panel stat-card">
            <div className="stat-label">{statusLabels[key]}</div>
            <div className="stat-value">{stats.byStatus[key]}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
