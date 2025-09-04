import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// ✅ Ensure required env vars
const secretKey = process.env.STRIPE_SECRET_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const priceId = process.env.STRIPE_PRICE_ID;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

if (!secretKey) throw new Error("❌ STRIPE_SECRET_KEY is not set in environment variables");
if (!supabaseUrl) throw new Error("❌ NEXT_PUBLIC_SUPABASE_URL is not set in environment variables");
if (!supabaseServiceKey) throw new Error("❌ SUPABASE_SERVICE_ROLE_KEY is not set in environment variables");
if (!priceId) throw new Error("❌ STRIPE_PRICE_ID is not set in environment variables");
if (!siteUrl) throw new Error("❌ NEXT_PUBLIC_SITE_URL is not set in environment variables");

// ✅ Stripe client (use latest supported API version from Stripe typings)
const stripe = new Stripe(secretKey, {
  apiVersion: "2025-08-27.basil", // latest stable supported version
});

// ✅ Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Lookup existing Stripe customer if we already saved it in profiles
    let customerId: string | undefined = body?.customer_id || body?.customerId;

    if (!customerId && body?.user_id) {
      const { data, error } = await supabase
        .from("profiles")
        .select("stripe_customer_id")
        .eq("id", body.user_id)
        .maybeSingle();

      if (error) console.error("Supabase lookup error:", error);
      if (data?.stripe_customer_id) customerId = data.stripe_customer_id as string;
    }

    // Build checkout session config
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/dashboard?canceled=true`,
    };

    if (customerId) {
      sessionConfig.customer = customerId;
    } else if (body?.email) {
      sessionConfig.customer_email = body.email;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Save new Stripe customer to Supabase if needed
    if (!customerId && body?.user_id && session.customer) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ stripe_customer_id: session.customer })
        .eq("id", body.user_id);

      if (updateError) {
        console.error("Error saving stripe_customer_id:", updateError);
      }
    }

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Stripe error:", err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }

    console.error("Stripe error (non-Error):", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
