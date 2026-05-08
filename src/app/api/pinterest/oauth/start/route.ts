import { NextRequest, NextResponse } from "next/server";

import { isAuthorizedRequest, unauthorizedJson } from "@/lib/api-auth";
import {
  buildPinterestOAuthUrl,
  getPinterestApiConfig,
  getPinterestOAuthScopes,
} from "@/lib/pinterest-api";

export async function GET(req: NextRequest) {
  if (!isAuthorizedRequest(req)) return unauthorizedJson();

  const config = getPinterestApiConfig();
  const state = crypto.randomUUID();
  const authUrl = buildPinterestOAuthUrl(state);

  if (req.nextUrl.searchParams.get("redirect") === "1") {
    return NextResponse.redirect(authUrl);
  }

  return NextResponse.json({
    success: true,
    authUrl,
    state,
    clientIdConfigured: Boolean(config.clientId),
    redirectUri: config.redirectUri,
    scopes: getPinterestOAuthScopes(),
    usage: "Open authUrl in the browser, approve Pinterest, then copy the returned code or let the callback exchange it if PINTEREST_CLIENT_SECRET is configured.",
  });
}
