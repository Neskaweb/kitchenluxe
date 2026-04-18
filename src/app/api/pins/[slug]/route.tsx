import { NextResponse } from 'next/server';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { getBlogPosts } from '@/lib/blog';

// Module-level font cache — fetched once per cold start
let fontData: ArrayBuffer | null = null;

async function getFont(): Promise<ArrayBuffer> {
  if (fontData) return fontData;
  const res = await fetch(
    'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.woff2'
  );
  fontData = await res.arrayBuffer();
  return fontData;
}

async function fetchImageAsDataUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    const buffer = await res.arrayBuffer();
    const mime = res.headers.get('content-type') || 'image/jpeg';
    return `data:${mime};base64,${Buffer.from(buffer).toString('base64')}`;
  } catch {
    // Fallback to a solid luxury dark background if image fails
    return '';
  }
}

const GOLD = '#c9a96e';
const DARK = '#0d0d0d';
const DARK2 = '#141414';

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  const posts = getBlogPosts();
  const post = posts.find(p => p.slug === slug);

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const [font, imageDataUrl] = await Promise.all([
    getFont(),
    post.image ? fetchImageAsDataUrl(post.image) : Promise.resolve(''),
  ]);

  const title = post.title.length > 60 ? post.title.slice(0, 58) + '…' : post.title;
  const category = (post.category || 'Cuisine').toUpperCase();

  const svg = await satori(
    <div
      style={{
        width: 1000,
        height: 1500,
        display: 'flex',
        flexDirection: 'column',
        background: DARK,
        fontFamily: 'Inter',
        overflow: 'hidden',
      }}
    >
      {/* Brand header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '36px 52px',
          borderBottom: `1px solid rgba(201,169,110,0.25)`,
        }}
      >
        <span style={{ color: GOLD, fontSize: 20, letterSpacing: 8, fontWeight: 700 }}>
          KITCHENLUXE
        </span>
        <span style={{ color: GOLD, fontSize: 16, letterSpacing: 2 }}>★★★★★</span>
      </div>

      {/* Product image */}
      {imageDataUrl ? (
        <img
          src={imageDataUrl}
          style={{ width: 1000, height: 660, objectFit: 'cover' }}
        />
      ) : (
        <div
          style={{
            width: 1000,
            height: 660,
            background: `linear-gradient(135deg, #1a1208 0%, #2a1f0a 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ color: GOLD, fontSize: 80, opacity: 0.3 }}>✦</span>
        </div>
      )}

      {/* Gold gradient overlay on image bottom */}
      <div
        style={{
          marginTop: -80,
          height: 80,
          background: `linear-gradient(to bottom, transparent, ${DARK})`,
          display: 'flex',
        }}
      />

      {/* Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          padding: '12px 52px 52px',
          background: DARK,
        }}
      >
        {/* Category badge */}
        <div style={{ display: 'flex', marginBottom: 24 }}>
          <span
            style={{
              border: `1px solid ${GOLD}`,
              color: GOLD,
              padding: '5px 18px',
              fontSize: 12,
              letterSpacing: 5,
              fontWeight: 700,
            }}
          >
            {category}
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            color: '#ffffff',
            fontSize: 48,
            fontWeight: 700,
            lineHeight: 1.25,
            flex: 1,
            display: 'flex',
            alignItems: 'flex-start',
          }}
        >
          {title}
        </div>

        {/* Gold divider */}
        <div
          style={{
            width: 52,
            height: 2,
            background: GOLD,
            marginBottom: 28,
            marginTop: 24,
          }}
        />

        {/* CTA row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: DARK2,
            padding: '18px 28px',
            border: `1px solid rgba(201,169,110,0.2)`,
          }}
        >
          <span style={{ color: GOLD, fontSize: 15, letterSpacing: 4, fontWeight: 700 }}>
            VOIR SUR AMAZON →
          </span>
          <span style={{ color: 'rgba(201,169,110,0.4)', fontSize: 12, letterSpacing: 1 }}>
            kitchenluxe.vercel.app
          </span>
        </div>
      </div>
    </div>,
    {
      width: 1000,
      height: 1500,
      fonts: [{ name: 'Inter', data: font, weight: 700, style: 'normal' }],
    }
  );

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1000 } });
  const png = new Uint8Array(resvg.render().asPng());

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      // CDN cache 7 days — pins don't change once created
      'Cache-Control': 'public, immutable, max-age=604800, s-maxage=604800',
    },
  });
}
