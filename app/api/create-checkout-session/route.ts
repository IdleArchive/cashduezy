import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    // ✅ Load env vars at runtime (not module level)
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const priceId = process.env.STRIPE_PRICE_ID;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    // ✅ Debugging logs (will show in Vercel logs, not sent to client)
    console.log("=== Environment Variable Check (Stripe Checkout) ===");
    console.log("STRIPE_SECRET_KEY exists?", !!secretKey);
    console.log("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl || "❌ MISSING");
    console.log("SUPABASE_SERVICE_ROLE_KEY exists?", !!supabaseServiceKey);
    console.log("STRIPE_PRICE_ID:", priceId || "❌ MISSING");
    console.log("NEXT_PUBLIC_SITE_URL:", siteUrl || "❌ MISSING");

    if (!secretKey || !supabaseUrl || !supabaseServiceKey || !priceId || !siteUrl) {
      return NextResponse.json(
        { error: "❌ Missing required environment variables" },
        { status: 500 }
      );
    }

    // ✅ Initialize clients inside handler
    const stripe = new Stripe(secretKey, {
      apiVersion: "2025-08-27.basil",
    });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();

    // --- Lookup existing customer ---
    let customerId: string | undefined = body?.customer_id || body?.customerId;
    if (!customerId && body?.user_id) {
      const { data, error } = await supabase
        .from("profiles")
        .select("stripe_customer_id")
        .eq("id", body.user_id)
        .maybeSingle();

      if (error) console.error("Supabase lookup error", error);
      if (data?.stripe_customer_id) {
        customerId = data.stripe_customer_id as string;
      }
    }

    // --- Build checkout session ---
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

    const session = await stripe.checkout.sessions.create(sessionConfig);

    // --- Save new customer_id to Supabase ---
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
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
