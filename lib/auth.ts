import { NextRequest } from "next/server";

/**
 * Very lightweight authorization guard for admin write endpoints.
 *
 * If ADMIN_TOKEN is set in the environment, requests to admin POST/PUT/DELETE
 * endpoints must include the header `x-admin-token` matching that value.
 * If ADMIN_TOKEN is empty/unset, the guard is disabled (all writes allowed).
 *
 * This is intentionally simple for an internal tool; for production use,
 * replace with proper SSO / session-based auth.
 */
export function isAuthorized(req: NextRequest): boolean {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return true;
  const provided = req.headers.get("x-admin-token");
  return provided === token;
}

export function unauthorizedResponse() {
  return new Response(
    JSON.stringify({ error: "Unauthorized. Provide a valid x-admin-token header." }),
    { status: 401, headers: { "content-type": "application/json" } }
  );
}
