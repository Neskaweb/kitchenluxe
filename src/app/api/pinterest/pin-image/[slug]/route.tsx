/* eslint-disable @next/next/no-img-element */
import { NextResponse } from "next/server";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

import { getProductBySlug } from "@/lib/data";
import {
  cleanPinterestText,
  getPinterestCategoryProfile,
  getPinterestHighlights,
} from "@/lib/pinterest";

export const runtime = "nodejs";

let fontData: ArrayBuffer | null = null;

const FALLBACK_IMAGE_BY_CATEGORY: Record<string, string> = {
  "Precision culinaire": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070&auto=format&fit=crop",
  "Electromenager premium": "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop",
  "Ustensiles de chef": "https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?q=80&w=1974&auto=format&fit=crop",
  Coutellerie: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?q=80&w=2070&auto=format&fit=crop",
  default: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop",
};

async function getFont(): Promise<ArrayBuffer> {
  if (fontData) return fontData;
  const response = await fetch("https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmWUlfBBc9.ttf");
  fontData = await response.arrayBuffer();
  return fontData;
}

async function fetchImageAsDataUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return "";
    const buffer = await response.arrayBuffer();
    const mime = response.headers.get("content-type") || "image/jpeg";
    return `data:${mime};base64,${Buffer.from(buffer).toString("base64")}`;
  } catch {
    return "";
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const profile = getPinterestCategoryProfile(product);
  const highlights = getPinterestHighlights(product);
  const productName = cleanPinterestText(product.name);
  const brand = cleanPinterestText(product.brand || "KitchenLuxe");
  const category = cleanPinterestText(profile.label).toUpperCase();
  const title = fitTitle(productName);
  let imageDataUrl = product.image ? await fetchImageAsDataUrl(product.image) : "";
  if (!imageDataUrl) {
    imageDataUrl = await fetchImageAsDataUrl(FALLBACK_IMAGE_BY_CATEGORY[profile.label] || FALLBACK_IMAGE_BY_CATEGORY.default);
  }
  const font = await getFont();

  const svg = await satori(
    <div
      style={{
        width: 1000,
        height: 1500,
        display: "flex",
        flexDirection: "column",
        background: "#f8f3ea",
        fontFamily: "Roboto",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: 1000,
          height: 850,
          display: "flex",
          position: "relative",
          background: profile.deep,
          overflow: "hidden",
        }}
      >
        {imageDataUrl ? (
          <img
            alt=""
            src={imageDataUrl}
            style={{
              width: 1000,
              height: 850,
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: 1000,
              height: 850,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `linear-gradient(135deg, ${profile.deep}, ${profile.accent})`,
            }}
          >
            <span style={{ color: "#f8f3ea", fontSize: 64, letterSpacing: 8 }}>KITCHENLUXE</span>
          </div>
        )}

        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            display: "flex",
            background: "linear-gradient(180deg, rgba(0,0,0,0.14) 0%, rgba(0,0,0,0.02) 44%, rgba(0,0,0,0.58) 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 42,
            left: 48,
            right: 48,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              padding: "12px 18px",
              background: "rgba(248,243,234,0.92)",
              color: "#17120d",
              fontSize: 21,
              letterSpacing: 5,
            }}
          >
            KITCHENLUXE
          </div>
          <div
            style={{
              display: "flex",
              padding: "10px 16px",
              background: profile.accent,
              color: "#fffaf0",
              fontSize: 18,
              letterSpacing: 2,
            }}
          >
            GUIDE
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 48,
            right: 48,
            bottom: 48,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "10px 16px",
              background: "#fffaf0",
              color: profile.deep,
              fontSize: 18,
              letterSpacing: 2,
            }}
          >
            {category}
          </div>
          <div
            style={{
              display: "flex",
              color: "#fffaf0",
              fontSize: title.length > 48 ? 56 : 64,
              lineHeight: 1.08,
              letterSpacing: 0,
              textShadow: "0 2px 18px rgba(0,0,0,0.34)",
            }}
          >
            {title}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: "50px 58px 44px",
          background: "#fffaf0",
          color: "#17120d",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 28,
          }}
        >
          <span style={{ color: profile.accent, fontSize: 24, letterSpacing: 3 }}>
            {brand.toUpperCase()}
          </span>
          <span style={{ color: "#6f6254", fontSize: 20 }}>
            Selection cuisine premium
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 34 }}>
          {highlights.map((highlight) => (
            <div
              key={highlight}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                color: "#2a221b",
                fontSize: 34,
                lineHeight: 1.18,
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  display: "flex",
                  background: profile.accent,
                }}
              />
              <span>{highlight}</span>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid #e9ddcc",
            paddingTop: 26,
          }}
        >
          <span style={{ color: "#17120d", fontSize: 25 }}>
            Voir le guide complet
          </span>
          <span style={{ color: profile.accent, fontSize: 22, letterSpacing: 1 }}>
            kitchenluxe.vercel.app
          </span>
        </div>
      </div>
    </div>,
    {
      width: 1000,
      height: 1500,
      fonts: [{ name: "Roboto", data: font, weight: 700, style: "normal" }],
    }
  );

  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1000 } });
  const png = new Uint8Array(resvg.render().asPng());

  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, immutable, max-age=604800, s-maxage=604800",
    },
  });
}

function fitTitle(value: string): string {
  const clean = cleanPinterestText(value);
  if (clean.length <= 72) return clean;
  return `${clean.slice(0, 69).trim()}...`;
}
