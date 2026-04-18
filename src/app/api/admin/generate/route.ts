import { NextResponse } from 'next/server';
import { runAutopilot } from '@/lib/autopilot';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type } = body;

    if (type !== 'article') {
      return NextResponse.json(
        { error: 'Type invalide. Utilisez type: "article"' },
        { status: 400 }
      );
    }

    const result = await runAutopilot();
    return NextResponse.json({
      ...result,
      message: `✅ Article généré: "${result.article}" (style: ${result.style})`,
    });
  } catch (error: any) {
    console.error('Admin generate error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
