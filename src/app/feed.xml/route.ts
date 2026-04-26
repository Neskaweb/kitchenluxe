import { NextResponse } from 'next/server';
import { getBlogPosts } from '@/lib/blog';

export async function GET() {
    const posts = getBlogPosts();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kitchenluxe.vercel.app';

    let rssItems = '';
    const recentPosts = posts.slice(0, 50);

    recentPosts.forEach((post) => {
        const canonicalUrl = encodeURI(`${siteUrl}/blog/${post.slug}`);
        const url = encodeURI(`${siteUrl}/blog/${post.slug}?utm_source=rss&utm_medium=feed&utm_campaign=autopilot&utm_content=${post.slug}`);

        // Pinterest can ingest this public RSS feed automatically from the account.
        // Keep one item per article to avoid publishing near-duplicate pin variants.
        const imageToPin = post.pinterestImage
            || (Array.isArray(post.pinterestImages) ? post.pinterestImages[0] : undefined)
            || post.image;

        if (!imageToPin) return;

        let imageUrl = imageToPin.startsWith('http') ? imageToPin : `${siteUrl}${imageToPin}`;
        imageUrl = encodeURI(imageUrl);

        const guid = `${canonicalUrl}#${encodeURIComponent(post.id || post.slug)}`;

        rssItems += `
        <item>
            <title><![CDATA[${post.title}]]></title>
            <link>${url}</link>
            <guid isPermaLink="true">${guid}</guid>
            <pubDate>${new Date(post.publishedDate).toUTCString()}</pubDate>
            <description><![CDATA[${post.metaDescription || post.excerpt}]]></description>
            <enclosure url="${imageUrl.replace(/&/g, '&amp;')}" type="image/jpeg" />
            <media:content url="${imageUrl.replace(/&/g, '&amp;')}" type="image/jpeg" medium="image" />
        </item>`;
    });

    const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>KitchenLuxe | Excellence Culinaire &amp; Design</title>
        <link>${siteUrl}</link>
        <description>Decouvrez les meilleurs ustensiles de chef, robots de cuisine et conseils gastronomiques de luxe.</description>
        <language>fr</language>
        <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
        ${rssItems}
    </channel>
</rss>`;

    return new NextResponse(rssFeed, {
        headers: {
            'Content-Type': 'text/xml',
            'Cache-Control': 's-maxage=3600, stale-while-revalidate',
        },
    });
}
