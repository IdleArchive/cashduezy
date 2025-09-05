import { NextResponse, NextRequest } from "next/server";
export const dynamic = "force-dynamic";

// Ensure Node.js runtime so we can reliably access env vars
export const runtime = "nodejs";

// Helpful: prevent any caching of responses
const noStoreHeaders = { "Cache-Control": "no-store" };

interface HCaptchaResponse {
  success: boolean;
  // hCaptcha uses "error-codes" (hyphenated) in responses
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
  credit?: boolean;
  score?: number;
  score_reason?: string[];
}

export async function POST(req: NextRequest) {
  // 1) Safely parse JSON body
  let token: unknown;
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { success: false, error: "Content-Type must be application/json" },
        { status: 415, headers: noStoreHeaders }
      );
    }
    const body = await req.json();
    token = (body as any)?.token;
  } catch {
    return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400, headers: noStoreHeaders }
    );
  }

  // 2) Validate token
  if (typeof token !== "string" || token.trim().length === 0) {
    return NextResponse.json(
      { success: false, error: "Missing or invalid captcha token" },
      { status: 400, headers: noStoreHeaders }
    );
  }

  // 3) Load secret at runtime
  const secret = process.env.HCAPTCHA_SECRET;
  if (!secret || typeof secret !== "string") {
    if (process.env.NODE_ENV !== "production") {
      console.error("❌ Missing HCAPTCHA_SECRET in environment variables");
    }
    return NextResponse.json(
      { success: false, error: "Server misconfiguration: missing hCaptcha secret" },
      { status: 500, headers: noStoreHeaders }
    );
  }

  // 4) Forward remote IP if available (helps hCaptcha verification)
  // Vercel/Proxies often provide comma-separated IPs; the first is the client IP
  const xff = req.headers.get("x-forwarded-for") || "";
  const xRealIp = req.headers.get("x-real-ip") || "";
  const remoteip = (xff.split(",")[0]?.trim() || xRealIp || "").trim();

  // 5) Call hCaptcha with timeout + robust error handling
  const controller = new AbortController();
  const timeoutMs = 10000; // 10s timeout window
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const params = new URLSearchParams({
      secret,
      response: token,
    });
    if (remoteip) {
      params.set("remoteip", remoteip);
    }

    const verifyResponse = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
      signal: controller.signal,
    });

    if (!verifyResponse.ok) {
      // Upstream service error
      if (process.env.NODE_ENV !== "production") {
        console.error("❌ hCaptcha API error:", verifyResponse.status);
      }
      return NextResponse.json(
        { success: false, error: "hCaptcha API unreachable" },
        { status: 502, headers: noStoreHeaders }
      );
    }

    const data: HCaptchaResponse = await verifyResponse.json();

    if (process.env.NODE_ENV !== "production") {
      // Keep logs quiet in production
      console.log("🔎 hCaptcha verify result:", {
        success: data.success,
        hostname: data.hostname,
        credit: data.credit,
        errorCodes: data["error-codes"],
      });
    }

    if (data.success === true) {
      // Optionally, you could validate the hostname here if you want to enforce it:
      // const expectedHost = process.env.NEXT_PUBLIC_APP_HOSTNAME; // e.g. "www.cashduezy.com"
      // if (expectedHost && data.hostname && data.hostname !== expectedHost) { ... }

      return NextResponse.json(
        { success: true, credit: data.credit === true },
        { status: 200, headers: noStoreHeaders }
      );
    }

    // Verification failed (most common: invalid token, expired, wrong domain, or bad secret)
    return NextResponse.json(
      {
        success: false,
        error: data["error-codes"]?.join(", ") || "Captcha verification failed",
      },
      { status: 400, headers: noStoreHeaders }
    );
  } catch (err: any) {
    if (err?.name === "AbortError") {
      if (process.env.NODE_ENV !== "production") {
        console.error("⏱️ hCaptcha verification timed out");
      }
      return NextResponse.json(
        { success: false, error: "hCaptcha verification timed out" },
        { status: 504, headers: noStoreHeaders }
      );
    }

    if (process.env.NODE_ENV !== "production") {
      console.error("❌ Captcha verification error:", err);
    }
    return NextResponse.json(
      { success: false, error: "Unexpected server error verifying captcha" },
      { status: 500, headers: noStoreHeaders }
    );
  } finally {
    clearTimeout(timer);
  }
}

// Optional: handle CORS preflight if you ever call this route cross-origin.
// Not required for same-origin usage from your app, but harmless to include.
export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...noStoreHeaders,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
