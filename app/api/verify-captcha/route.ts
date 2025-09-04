import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    // --- Validate request body ---
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid captcha token" },
        { status: 400 }
      );
    }

    // ✅ Load secret at runtime (no top-level access)
    const secret = process.env.HCAPTCHA_SECRET;
    if (!secret) {
      console.error("❌ Missing HCAPTCHA_SECRET in environment variables");
      return NextResponse.json(
        { success: false, error: "Server misconfiguration: missing hCaptcha secret" },
        { status: 500 }
      );
    }

    // --- Verify token with hCaptcha ---
    const verifyResponse = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: token,
      }),
    });

    if (!verifyResponse.ok) {
      console.error("❌ hCaptcha API error:", verifyResponse.status);
      return NextResponse.json(
        { success: false, error: "hCaptcha API unreachable" },
        { status: 502 }
      );
    }

    const data = await verifyResponse.json();
    console.log("🔎 hCaptcha verify result:", data);

    if (data.success === true) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      {
        success: false,
        error: data["error-codes"] || "Captcha verification failed",
      },
      { status: 400 }
    );
  } catch (err) {
    console.error("❌ Captcha verification error:", err);
    return NextResponse.json(
      { success: false, error: "Unexpected server error verifying captcha" },
      { status: 500 }
    );
  }
}
