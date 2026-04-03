import { ShareBar } from '@/components/share-bar';
import { SharedTodoView } from '@/components/shared-todo-view';

type SharePageProps = {
  params: Promise<{ shareId: string }>;
};

export default async function SharePage({ params }: SharePageProps) {
  const { shareId } = await params;

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
      <SharedTodoView shareId={shareId} />
    </main>
  );
}
