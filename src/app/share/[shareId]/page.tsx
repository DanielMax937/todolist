import { SharedTodoView } from '@/components/shared-todo-view';

type SharePageProps = {
  params: Promise<{ shareId: string }>;
};

export default async function SharePage({ params }: SharePageProps) {
  const { shareId } = await params;

  return (
    <main>
      <h1 className="page-title">Shared todo</h1>
      <p className="page-lead">
        View-only snapshot loaded from <code>/api/share/…</code>
      </p>
      <SharedTodoView shareId={shareId} />
    </main>
  );
}
