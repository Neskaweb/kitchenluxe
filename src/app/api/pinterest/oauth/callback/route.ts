import { NextRequest, NextResponse } from "next/server";

import {
  exchangePinterestAuthorizationCode,
  getPinterestApiConfig,
} from "@/lib/pinterest-api";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code") || "";
  const state = req.nextUrl.searchParams.get("state") || "";
  const error = req.nextUrl.searchParams.get("error");
  const errorDescription = req.nextUrl.searchParams.get("error_description");
  const config = getPinterestApiConfig();

  if (error) {
    return NextResponse.json({
      success: false,
      error,
      errorDescription,
      state,
    }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({
      success: false,
      error: "Missing Pinterest authorization code.",
      state,
    }, { status: 400 });
  }

  if (!config.clientSecret) {
    return NextResponse.json({
      success: true,
      mode: "manual_exchange",
      code,
      state,
      redirectUri: config.redirectUri,
      nextStep: "Add PINTEREST_CLIENT_ID, PINTEREST_CLIENT_SECRET and PINTEREST_REDIRECT_URI to .env.local, then reopen this callback URL or exchange the code manually.",
    });
  }

  const result = await exchangePinterestAuthorizationCode(code);
  const token = result.data?.access_token || "";
  const refreshToken = result.data?.refresh_token || "";

  return NextResponse.json({
    success: result.ok,
    status: result.status,
    state,
    tokenReceived: Boolean(token),
    refreshTokenReceived: Boolean(refreshToken),
    tokenPrefix: token ? token.slice(0, 4) : "",
    refreshTokenPrefix: refreshToken ? refreshToken.slice(0, 4) : "",
    expiresIn: result.data?.expires_in,
    refreshTokenExpiresIn: result.data?.refresh_token_expires_in,
    scope: result.data?.scope,
    missingEnv: result.missingEnv,
    nextStep: result.ok
      ? "Copy the access_token from the server response only if you are viewing it securely, then store it as PINTEREST_ACCESS_TOKEN. Do not paste it into chat."
      : "Check Pinterest client env vars and redirect URI.",
    raw: result.ok ? result.data : result.text,
  }, { status: result.ok ? 200 : result.status });
}
