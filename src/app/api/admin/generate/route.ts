import { NextResponse } from 'next/server';

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

    // Delegate to the cron autopilot endpoint (works in both local and Vercel)
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const res = await fetch(`${baseUrl}/api/cron/autopilot`, {
      headers: {
        Authorization: `Bearer ${process.env.CRON_SECRET || ''}`,
      },
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Génération échouée');

    return NextResponse.json({
      success: true,
      message: `✅ Article généré: "${result.article}" (style: ${result.style}, format gagnant: ${result.winningStyle || 'en apprentissage'})`,
      ...result,
    });
  } catch (error: any) {
    console.error('Admin generate error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
