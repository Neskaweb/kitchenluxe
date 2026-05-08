import { NextRequest, NextResponse } from "next/server";
import { getProducts, getProductById } from "@/lib/data";
import { buildPinterestApiPayload, getPinterestApiConfig } from "@/lib/pinterest-api";
import { buildPinData, buildMakeWebhookPayload } from "@/lib/pinterest";

// GET /api/pinterest/export?productId=xxx  → single pin data
// GET /api/pinterest/export                → all products pin data (batch)
// GET /api/pinterest/export?format=csv     → CSV for Tailwind/Buffer
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const format = searchParams.get("format") || "json";
    const limit = parseInt(searchParams.get("limit") || "20");
    const includeRejected = searchParams.get("includeRejected") === "1";
    const baseUrl = searchParams.get("baseUrl") || `${req.headers.get("x-forwarded-proto") || "https"}://${req.headers.get("host")}`;

    if (productId) {
        const product = getProductById(productId);
        if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

        const pin = buildPinData(product, baseUrl);
        return NextResponse.json({ success: true, pin, makePayload: buildMakeWebhookPayload(pin) });
    }

    // Batch: most popular products first, with rejected pins hidden by default.
    const pins = getProducts()
        .sort((a, b) => b.reviews - a.reviews)
        .map((p) => buildPinData(p, baseUrl))
        .filter((pin) => includeRejected || pin.quality.passed)
        .slice(0, limit);

    if (format === "csv") {
        // CSV format compatible with Tailwind & Buffer bulk upload
        const header = "Title,Description,Link,Image URL,Board";
        const rows = pins.map((pin) => {
            const desc = `${pin.description}\n\n${pin.hashtags.join(" ")}`.replace(/"/g, '""');
            return `"${pin.title}","${desc}","${pin.link}","${pin.imageUrl}","KitchenLuxe — Excellence Culinaire"`;
        });
        const csv = [header, ...rows].join("\n");
        return new NextResponse(csv, {
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="KitchenLuxe-pins-${Date.now()}.csv"`,
            },
        });
    }

    const pinterestApiConfig = getPinterestApiConfig();

    return NextResponse.json({
        success: true,
        count: pins.length,
        qualityGate: {
            minScore: pins[0]?.quality.minScore ?? Number.parseInt(process.env.PINTEREST_MIN_QUALITY_SCORE || "85", 10),
            includeRejected,
            approvedOnly: !includeRejected,
        },
        pins,
        makePayloads: pins.map(buildMakeWebhookPayload),
        pinterestApi: {
            configured: pinterestApiConfig.configured,
            dryRunByEnv: pinterestApiConfig.dryRunByEnv,
            payloads: pins.map((pin) => buildPinterestApiPayload(pin)),
        },
        tip: "Use ?format=csv to download a CSV for Tailwind or Buffer bulk upload",
    });
}

// POST /api/pinterest/export → Receive Make.com webhook confirmation
export async function POST(req: NextRequest) {
    const body = await req.json();
    // Log the Make.com confirmation (in production: save to DB)
    console.log("📌 Make.com Pin Published:", body);
    return NextResponse.json({ success: true, received: body });
}
