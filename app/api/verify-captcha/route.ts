import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Missing captcha token" },
        { status: 400 }
      );
    }

    const secret = process.env.HCAPTCHA_SECRET;
    if (!secret) {
      return NextResponse.json(
        { success: false, error: "Missing hCaptcha secret key" },
        { status: 500 }
      );
    }

    // Verify with hCaptcha servers
    const response = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `response=${token}&secret=${secret}`,
    });

    const data = await response.json();

    if (data.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: data["error-codes"] || "Verification failed" },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("Captcha verification error:", err);
    return NextResponse.json(
      { success: false, error: "Server error verifying captcha" },
      { status: 500 }
    );
  }
}
