import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    STRIPE_PRICE_ID: !!process.env.STRIPE_PRICE_ID,
    NEXT_PUBLIC_SITE_URL: !!process.env.NEXT_PUBLIC_SITE_URL,
    HCAPTCHA_SECRET: !!process.env.HCAPTCHA_SECRET,
    NEXT_PUBLIC_HCAPTCHA_SITEKEY: !!process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY,
  });
}
