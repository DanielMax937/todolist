/**
 * Writes public/stats.html from a demo TaskEngine + computeTaskStatistics.
 * Run: npx tsx scripts/generate-stats-page.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { TaskEngine } from '../src/engine.js';
import { computeTaskStatistics } from '../src/statistics.js';
import type { Task } from '../src/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function leaf(id: string, title: string, status: Task['status'] = 'pending'): Task {
  return { id, title, status, subtasks: [], dependsOn: [] };
}

function buildDemoEngine(): TaskEngine {
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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderPage(jsonPayload: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Todo task statistics</title>
  <style>
    :root {
      color-scheme: light dark;
      --bg: #f6f7f9;
      --card: #fff;
      --border: #e2e5eb;
      --text: #1a1d26;
      --muted: #5c6578;
      --accent: #2563eb;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #12141a;
        --card: #1c1f28;
        --border: #2a2f3d;
        --text: #e8eaf0;
        --muted: #9aa3b5;
        --accent: #60a5fa;
      }
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding: 2rem clamp(1rem, 4vw, 2.5rem);
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 0.25rem;
    }
    .sub {
      color: var(--muted);
      font-size: 0.9rem;
      margin-bottom: 1.75rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 1rem 1.1rem;
    }
    .card .label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--muted);
      margin-bottom: 0.35rem;
    }
    .card .value {
      font-size: 1.65rem;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }
    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
      gap: 0.5rem;
    }
    .status-grid .card .value { font-size: 1.35rem; }
    footer {
      font-size: 0.8rem;
      color: var(--muted);
      margin-top: 2rem;
    }
    code {
      font-size: 0.85em;
      background: var(--border);
      padding: 0.15em 0.4em;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <h1>Todo task statistics</h1>
  <p class="sub">Snapshot from <code>computeTaskStatistics(TaskEngine)</code> — demo data generated at build time.</p>

  <div id="root"></div>

  <script type="application/json" id="stats-data">${jsonPayload}</script>
  <script>
    const data = JSON.parse(document.getElementById('stats-data').textContent);
    const root = document.getElementById('root');
    const labels = {
      total: 'Total tasks',
      rootCount: 'Root tasks',
      maxDepth: 'Max subtask depth',
      prerequisiteEdgeCount: 'Prerequisite edges',
      pending: 'Pending',
      in_progress: 'In progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };

    function card(label, value) {
      const el = document.createElement('div');
      el.className = 'card';
      el.innerHTML = '<div class="label">' + label + '</div><div class="value"></div>';
      el.querySelector('.value').textContent = String(value);
      return el;
    }

    const overview = document.createElement('div');
    overview.className = 'grid';
    overview.appendChild(card(labels.total, data.total));
    overview.appendChild(card(labels.rootCount, data.rootCount));
    overview.appendChild(card(labels.maxDepth, data.maxDepth));
    overview.appendChild(card(labels.prerequisiteEdgeCount, data.prerequisiteEdgeCount));

    const statusTitle = document.createElement('p');
    statusTitle.className = 'sub';
    statusTitle.style.marginBottom = '0.5rem';
    statusTitle.textContent = 'By status';

    const by = data.byStatus || {};
    const statusBlock = document.createElement('div');
    statusBlock.className = 'status-grid';
    for (const k of ['pending', 'in_progress', 'completed', 'cancelled']) {
      statusBlock.appendChild(card(labels[k] || k, by[k] ?? 0));
    }

    root.appendChild(overview);
    root.appendChild(statusTitle);
    root.appendChild(statusBlock);

    const foot = document.createElement('footer');
    foot.textContent = 'Open this file after running npm run build:stats to refresh numbers from the demo graph.';
    root.appendChild(foot);
  </script>
</body>
</html>
`;
}

const engine = buildDemoEngine();
const stats = computeTaskStatistics(engine);
const jsonPayload = escapeHtml(JSON.stringify(stats, null, 2));

const publicDir = join(__dirname, '..', 'public');
mkdirSync(publicDir, { recursive: true });
const outPath = join(publicDir, 'stats.html');
writeFileSync(outPath, renderPage(jsonPayload), 'utf8');
console.log('Wrote', outPath);
