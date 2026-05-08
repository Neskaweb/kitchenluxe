import { NextResponse } from "next/server";

export function getAdminApiKey(): string {
  return (
    process.env.KITCHENLUXE_API_KEY ||
    process.env.ADMIN_API_KEY ||
    process.env.KitchenLuxe_API_KEY ||
    ""
  ).trim();
}

export function requiresApiKey(): boolean {
  return process.env.NODE_ENV === "production" || Boolean(getAdminApiKey());
}

export function isAuthorizedRequest(req: Request): boolean {
  if (!requiresApiKey()) return true;

  const apiKey = getAdminApiKey();
  if (!apiKey) return false;

  const authHeader = req.headers.get("authorization") || "";
  const bearerKey = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (bearerKey === apiKey) return true;

  const xApiKey = req.headers.get("x-api-key") || "";
  if (xApiKey.trim() === apiKey) return true;

  const queryKey = new URL(req.url).searchParams.get("key") || "";
  if (queryKey.trim() === apiKey) return true;

  const cookieHeader = req.headers.get("cookie") || "";
  const cookieKey = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("kitchenluxe_admin_session="))
    ?.split("=")
    .slice(1)
    .join("=") || "";

  return decodeURIComponent(cookieKey).trim() === apiKey;
}

export function unauthorizedJson() {
  return NextResponse.json(
    { success: false, error: "Unauthorized. Provide a valid KITCHENLUXE_API_KEY." },
    { status: 401 },
  );
}
