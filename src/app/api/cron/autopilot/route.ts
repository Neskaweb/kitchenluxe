import { NextResponse } from 'next/server';
import { runAutopilot } from '@/lib/autopilot';

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const result = await runAutopilot();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Autopilot cron error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
