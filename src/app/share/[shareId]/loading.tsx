export default function ShareLoading() {
  return (
    <main>
      <h1 className="page-title">Shared todo</h1>
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
