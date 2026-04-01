import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Smart Todo — dependency graph',
  description: 'Nested subtasks, dependsOn edges, and completion rules in the browser.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
