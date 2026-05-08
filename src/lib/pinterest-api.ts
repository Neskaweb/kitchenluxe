import { PinData } from "./pinterest";

export interface PinterestApiConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  accessToken: string;
  boardId: string;
  boardSectionId: string;
  apiBaseUrl: string;
  dryRunByEnv: boolean;
  configured: boolean;
  missingEnv: string[];
}

export interface PinterestPinCreatePayload {
  board_id?: string;
  board_section_id?: string;
  title: string;
  description: string;
  alt_text: string;
  link: string;
  media_source: {
    source_type: "image_url";
    url: string;
    is_standard: true;
  };
}

export interface PinterestPublishResult {
  success: boolean;
  provider: "pinterest_api";
  dryRun: boolean;
  status: number;
  text: string;
  payload: PinterestPinCreatePayload;
  configured: boolean;
  missingEnv: string[];
  pinId?: string;
  pinterestResponse?: unknown;
}

export interface PinterestOAuthTokenResponse {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  refresh_token_expires_in?: number;
  scope?: string;
  response_type?: string;
  [key: string]: unknown;
}

const DEFAULT_API_BASE_URL = "https://api.pinterest.com/v5";

export function getPinterestApiConfig(): PinterestApiConfig {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://kitchenluxe.vercel.app").replace(/\/+$/, "");
  const clientId = process.env.PINTEREST_CLIENT_ID || process.env.PINTEREST_APP_ID || "";
  const clientSecret = process.env.PINTEREST_CLIENT_SECRET || "";
  const redirectUri = process.env.PINTEREST_REDIRECT_URI || `${siteUrl}/api/pinterest/oauth/callback`;
  const accessToken = process.env.PINTEREST_ACCESS_TOKEN || "";
  const boardId = process.env.PINTEREST_BOARD_ID || "";
  const boardSectionId = process.env.PINTEREST_BOARD_SECTION_ID || "";
  const apiBaseUrl = (process.env.PINTEREST_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
  const missingEnv = [
    ["PINTEREST_ACCESS_TOKEN", accessToken],
    ["PINTEREST_BOARD_ID", boardId],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  return {
    clientId,
    clientSecret,
    redirectUri,
    accessToken,
    boardId,
    boardSectionId,
    apiBaseUrl,
    dryRunByEnv: process.env.PINTEREST_API_DRY_RUN !== "0",
    configured: missingEnv.length === 0,
    missingEnv,
  };
}

export function getPinterestOAuthScopes(): string[] {
  return ["boards:read", "boards:write", "pins:read", "pins:write"];
}

export function buildPinterestOAuthUrl(state: string): string {
  const config = getPinterestApiConfig();
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: getPinterestOAuthScopes().join(","),
    state,
  });

  return `https://www.pinterest.com/oauth/?${params.toString()}`;
}

export async function exchangePinterestAuthorizationCode(code: string): Promise<{
  ok: boolean;
  status: number;
  text: string;
  data: PinterestOAuthTokenResponse | null;
  missingEnv: string[];
}> {
  const config = getPinterestApiConfig();
  const missingEnv = [
    ["PINTEREST_CLIENT_ID", config.clientId],
    ["PINTEREST_CLIENT_SECRET", config.clientSecret],
    ["PINTEREST_REDIRECT_URI", config.redirectUri],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missingEnv.length > 0) {
    return {
      ok: false,
      status: 412,
      text: `Pinterest OAuth exchange is not configured. Missing env: ${missingEnv.join(", ")}.`,
      data: null,
      missingEnv,
    };
  }

  const basic = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: config.redirectUri,
  });

  try {
    const response = await fetch(`${config.apiBaseUrl}/oauth/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    const text = await response.text();
    const data = parseJsonSafely(text);

    return {
      ok: response.ok,
      status: response.status,
      text,
      data: data && typeof data === "object" ? data as PinterestOAuthTokenResponse : null,
      missingEnv: [],
    };
  } catch (error) {
    return {
      ok: false,
      status: 500,
      text: String(error),
      data: null,
      missingEnv: [],
    };
  }
}

export function isPinterestLiveConfirmed(searchParams: URLSearchParams): boolean {
  return searchParams.get("mode") === "live" && searchParams.get("confirm") === "publish";
}

export function buildPinterestApiPayload(pin: PinData, config: PinterestApiConfig = getPinterestApiConfig()): PinterestPinCreatePayload {
  return {
    board_id: config.boardId || undefined,
    board_section_id: config.boardSectionId || undefined,
    title: pin.title,
    description: `${pin.description}\n\n${pin.hashtags.join(" ")}`,
    alt_text: pin.altText,
    link: pin.link,
    media_source: {
      source_type: "image_url",
      url: pin.imageUrl,
      is_standard: true,
    },
  };
}

export async function publishPinToPinterestApi(
  pin: PinData,
  liveConfirmed: boolean
): Promise<PinterestPublishResult> {
  const config = getPinterestApiConfig();
  const payload = buildPinterestApiPayload(pin, config);
  const dryRun = config.dryRunByEnv || !liveConfirmed;

  if (dryRun) {
    const reason = config.dryRunByEnv
      ? "Dry-run: PINTEREST_API_DRY_RUN is not set to 0."
      : "Dry-run: live publishing requires mode=live&confirm=publish.";

    return {
      success: true,
      provider: "pinterest_api",
      dryRun: true,
      status: 200,
      text: config.configured ? reason : `${reason} Missing env: ${config.missingEnv.join(", ")}.`,
      payload,
      configured: config.configured,
      missingEnv: config.missingEnv,
    };
  }

  if (!config.configured) {
    return {
      success: false,
      provider: "pinterest_api",
      dryRun: false,
      status: 412,
      text: `Pinterest API is not configured. Missing env: ${config.missingEnv.join(", ")}.`,
      payload,
      configured: false,
      missingEnv: config.missingEnv,
    };
  }

  try {
    const response = await fetch(`${config.apiBaseUrl}/pins`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const text = await response.text();
    const parsed = parseJsonSafely(text);

    return {
      success: response.ok,
      provider: "pinterest_api",
      dryRun: false,
      status: response.status,
      text,
      payload,
      configured: true,
      missingEnv: [],
      pinId: extractPinterestPinId(parsed),
      pinterestResponse: parsed,
    };
  } catch (error) {
    return {
      success: false,
      provider: "pinterest_api",
      dryRun: false,
      status: 500,
      text: String(error),
      payload,
      configured: true,
      missingEnv: [],
    };
  }
}

function parseJsonSafely(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function extractPinterestPinId(value: unknown): string | undefined {
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    return typeof id === "string" ? id : undefined;
  }
  return undefined;
}
