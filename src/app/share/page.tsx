import Link from 'next/link';

export default function SharePage() {
  return (
    <main>
      <p className="page-lead" style={{ marginBottom: '0.5rem' }}>
        <Link href="/">← Back to Smart Todo</Link>
      </p>
      <h1 className="page-title">Shared list</h1>
      <p className="page-lead">
        Read-only view for a shared todo snapshot. Data loading and link generation will plug in here.
      </p>

      <div className="panel">
        <p className="share-skeleton-lead">Placeholder</p>
        <div className="share-skeleton-block" />
        <div className="share-skeleton-block share-skeleton-block--short" />
      </div>
    </main>
  );
}
