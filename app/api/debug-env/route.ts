import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // Hide in prod, even if deployed accidentally
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not Found", { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
