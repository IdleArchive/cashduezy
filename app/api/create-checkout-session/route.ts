import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// ✅ Ensure env vars are loaded
const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  throw new Error("❌ STRIPE_SECRET_KEY is not set in environment variables");
}

const stripe = new Stripe(secretKey, {
  apiVersion: "2025-08-27.basil",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!process.env.STRIPE_PRICE_ID || !process.env.NEXT_PUBLIC_SITE_URL) {
      throw new Error("❌ Missing Stripe environment variables");
    }

    // Lookup existing customer if possible
    let customerId: string | undefined = body?.customer_id || body?.customerId;
    if (!customerId && body?.user_id) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("stripe_customer_id")
          .eq("id", body.user_id)
          .maybeSingle();

        if (error) console.error("Supabase lookup error", error);
        if (data?.stripe_customer_id) {
          customerId = data.stripe_customer_id as string;
        }
      } catch (lookupError) {
        console.error("Error looking up Stripe customer:", lookupError);
      }
    }

    // Build checkout session
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?canceled=true`,
    };

    if (customerId) {
      sessionConfig.customer = customerId;
    } else if (body?.email) {
      sessionConfig.customer_email = body.email;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Save new customer_id to Supabase
    if (!customerId && body?.user_id && session.customer) {
      try {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ stripe_customer_id: session.customer })
          .eq("id", body.user_id);

        if (updateError) {
          console.error("Error saving stripe_customer_id:", updateError);
        }
      } catch (saveError) {
        console.error("Unexpected error saving stripe_customer_id:", saveError);
      }
    }

    // Return the checkout session URL
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