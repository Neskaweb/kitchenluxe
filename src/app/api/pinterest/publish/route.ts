import { NextRequest, NextResponse } from "next/server";

import { isAuthorizedRequest, unauthorizedJson } from "@/lib/api-auth";
import { getProductById, getProducts } from "@/lib/data";
import {
  getPinterestApiConfig,
  isPinterestLiveConfirmed,
  publishPinToPinterestApi,
} from "@/lib/pinterest-api";
import { buildMakeWebhookPayload, buildPinData } from "@/lib/pinterest";

const MAKE_WEBHOOK = process.env.PINTEREST_WEBHOOK || process.env.MAKE_WEBHOOK_URL || "";

async function sendToMake(payload: object, liveConfirmed: boolean): Promise<{ ok: boolean; status: number; text: string; dryRun: boolean }> {
  if (!liveConfirmed) {
    return { ok: true, status: 200, text: "Dry-run: Make webhook not called. Use mode=live&confirm=publish for a real send.", dryRun: true };
  }

  if (!MAKE_WEBHOOK) {
    return { ok: false, status: 412, text: "PINTEREST_WEBHOOK or MAKE_WEBHOOK_URL is not configured. Export/manual mode is available.", dryRun: false };
  }

  try {
    const response = await fetch(MAKE_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const text = await response.text();
    return { ok: response.ok, status: response.status, text, dryRun: false };
  } catch (error) {
    return { ok: false, status: 500, text: String(error), dryRun: false };
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedRequest(req)) return unauthorizedJson();

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const batchSize = Number.parseInt(searchParams.get("batch") || "0", 10);
  const provider = searchParams.get("provider") === "make" ? "make" : "pinterest";
  const liveConfirmed = isPinterestLiveConfirmed(searchParams);
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://kitchenluxe.vercel.app").replace(/\/+$/, "");

  if (productId) {
    const product = getProductById(productId);
    if (!product) return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });

    const pin = buildPinData(product, baseUrl);
    if (!pin.quality.passed) {
      return NextResponse.json({
        success: false,
        error: "Pinterest quality gate blocked this pin.",
        productId,
        productName: product.name,
        provider,
        quality: pin.quality,
      }, { status: 422 });
    }

    const result = provider === "make"
      ? await sendToMake(buildMakeWebhookPayload(pin), liveConfirmed)
      : await publishPinToPinterestApi(pin, liveConfirmed);
    const resultSuccess = "ok" in result ? result.ok : result.success;

    return NextResponse.json({
      success: resultSuccess,
      provider,
      dryRun: result.dryRun,
      productId,
      productName: product.name,
      pinTitle: pin.title,
      quality: pin.quality,
      response: result.text,
      publishPayload: "payload" in result ? result.payload : buildMakeWebhookPayload(pin),
      pinterestPinId: "pinId" in result ? result.pinId : undefined,
      configured: "configured" in result ? result.configured : Boolean(MAKE_WEBHOOK),
      missingEnv: "missingEnv" in result ? result.missingEnv : [],
      imageUrl: pin.imageUrl,
    }, { status: resultSuccess ? 200 : result.status || 502 });
  }

  if (batchSize > 0) {
    const products = getProducts()
      .sort((a, b) => b.reviews - a.reviews)
      .slice(0, Math.min(batchSize, 5));

    const results = [];
    for (const product of products) {
      const pin = buildPinData(product, baseUrl);
      if (!pin.quality.passed) {
        results.push({
          productId: product.id,
          productName: product.name,
          success: false,
          provider,
          dryRun: false,
          quality: pin.quality,
          response: `Quality gate blocked: ${pin.quality.warnings.join(" ")}`,
        });
        continue;
      }

      const result = provider === "make"
        ? await sendToMake(buildMakeWebhookPayload(pin), liveConfirmed)
        : await publishPinToPinterestApi(pin, liveConfirmed);
      const resultSuccess = "ok" in result ? result.ok : result.success;

      results.push({
        productId: product.id,
        productName: product.name,
        success: resultSuccess,
        provider,
        dryRun: result.dryRun,
        quality: pin.quality,
        response: result.text,
        publishPayload: "payload" in result ? result.payload : buildMakeWebhookPayload(pin),
        pinterestPinId: "pinId" in result ? result.pinId : undefined,
        configured: "configured" in result ? result.configured : Boolean(MAKE_WEBHOOK),
        missingEnv: "missingEnv" in result ? result.missingEnv : [],
      });
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    const successCount = results.filter((item) => item.success).length;
    const blockedCount = results.filter((item) => !item.success && item.response.startsWith("Quality gate blocked")).length;
    const dryRunCount = results.filter((item) => item.dryRun).length;
    return NextResponse.json({
      success: successCount === results.length || (dryRunCount > 0 && blockedCount === 0),
      provider,
      sent: successCount,
      blocked: blockedCount,
      dryRun: dryRunCount,
      total: results.length,
      results,
    });
  }

  return NextResponse.json({ success: false, error: "Provide ?productId=xxx or ?batch=N" }, { status: 400 });
}

export async function GET(req: NextRequest) {
  if (!isAuthorizedRequest(req)) return unauthorizedJson();

  const pinterestApi = getPinterestApiConfig();

  return NextResponse.json({
    success: true,
    defaultProvider: "pinterest",
    pinterestApi: {
      configured: pinterestApi.configured,
      dryRunByEnv: pinterestApi.dryRunByEnv,
      missingEnv: pinterestApi.missingEnv,
      boardConfigured: Boolean(pinterestApi.boardId),
      boardSectionConfigured: Boolean(pinterestApi.boardSectionId),
      apiBaseUrl: pinterestApi.apiBaseUrl,
    },
    webhookConfigured: Boolean(MAKE_WEBHOOK),
    status: pinterestApi.configured ? "pinterest_api_ready" : "pinterest_api_dry_run_or_missing_env",
    qualityGate: {
      enabled: true,
      minScore: Number.parseInt(process.env.PINTEREST_MIN_QUALITY_SCORE || "85", 10),
      blocksPublish: true,
    },
    usage: {
      dryRunSingle: "POST /api/pinterest/publish?productId=PRODUCT_ID",
      dryRunBatch: "POST /api/pinterest/publish?batch=5",
      liveSingle: "POST /api/pinterest/publish?productId=PRODUCT_ID&mode=live&confirm=publish with PINTEREST_API_DRY_RUN=0",
      makeFallback: "POST /api/pinterest/publish?provider=make&productId=PRODUCT_ID&mode=live&confirm=publish",
      export: "GET /api/pinterest/export?format=csv",
    },
  });
}
