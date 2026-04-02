import type { Metadata } from 'next';

import './globals.css';

const siteName = 'Smart Todo';

const defaultDescription =
  'Nested subtasks, dependsOn edges, and completion rules in the browser — same TaskEngine as the unit tests.';

function getMetadataBase(): URL {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL);
  }
  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`);
  }
  return new URL('http://localhost:3000');
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: `${siteName} — dependency graph`,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  applicationName: siteName,
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName,
    title: `${siteName} — dependency graph`,
    description: defaultDescription,
    url: '/',
  },
  twitter: {
    card: 'summary',
    title: `${siteName} — dependency graph`,
    description: defaultDescription,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
