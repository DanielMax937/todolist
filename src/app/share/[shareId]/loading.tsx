import { ShareBar } from '@/components/share-bar';

export default function ShareLoading() {
  return (
    <main>
      <div className="page-header-top">
        <h1 className="page-title">Shared todo</h1>
        <ShareBar
          shareTitle="Smart Todo — shared list"
          shareText="Read-only task snapshot from Smart Todo."
        />
      </div>
      <p className="page-lead">
        View-only snapshot loaded from <code>/api/share/…</code>
      </p>
      <div className="share-state share-state--loading" role="status" aria-live="polite">
        <div className="share-skeleton" />
        <p className="share-state-text">Opening share…</p>
      </div>
    </main>
  );
}
