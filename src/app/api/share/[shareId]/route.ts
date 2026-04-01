import { NextResponse } from 'next/server';

import { resolveSharedSnapshot } from '@/lib/share-data';

export async function GET(
  _request: Request,
  context: { params: Promise<{ shareId: string }> },
) {
  const { shareId: raw } = await context.params;
  const shareId = decodeURIComponent(raw);
  const result = resolveSharedSnapshot(shareId);

  if (!result.ok) {
    if (result.kind === 'not_found') {
      return NextResponse.json(
        { ok: false as const, error: 'NOT_FOUND' },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { ok: false as const, error: 'SERVER_ERROR' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true as const, data: result.snapshot });
}
