import Link from 'next/link';

import { ShareBar } from '@/components/share-bar';

export default function SharePage() {
  return (
    <main>
      <p className="page-lead" style={{ marginBottom: '0.5rem' }}>
        <Link href="/">← Back to Smart Todo</Link>
      </p>
      <div className="page-header-top">
        <h1 className="page-title">Shared list</h1>
        <ShareBar
          shareTitle="Smart Todo — shared lists"
          shareText="Open a share link from the home page or try /share/demo for a sample snapshot."
        />
      </div>
      <p className="page-lead">
        Read-only hub for shared todo snapshots. Use a link from the owner or open{' '}
        <Link href="/share/demo">the demo share</Link> to see a sample.
      </p>

      <div className="panel">
        <p className="share-skeleton-lead">Placeholder</p>
        <div className="share-skeleton-block" />
        <div className="share-skeleton-block share-skeleton-block--short" />
      </div>
    </main>
  );
}
