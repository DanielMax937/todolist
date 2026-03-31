import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{ padding: '2rem', maxWidth: 560, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem' }}>Not found</h1>
      <p style={{ color: 'var(--muted)' }}>
        <Link href="/">Back home</Link>
      </p>
    </main>
  );
}
