import { NextResponse } from 'next/server';

// Simple health endpoint. All data currently lives client-side in mock state.
export async function GET(request, { params }) {
  const path = params?.path || [];
  if (path[0] === 'health') {
    return NextResponse.json({ ok: true, service: 'apexprep', mode: 'mock' });
  }
  return NextResponse.json({ ok: true, path });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({ ok: true, received: body });
}
