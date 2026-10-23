import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'ar_dine_frontend',
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  );
}
