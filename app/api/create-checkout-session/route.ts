import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Make sure required env vars exist
    if (!process.env.STRIPE_PRICE_ID || !process.env.NEXT_PUBLIC_SITE_URL) {
      throw new Error("Missing Stripe environment variables");
    }

    // Try to get existing customer if possible
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
        console.error("Error looking up existing Stripe customer", lookupError);
      }
    }

    // Build checkout session config
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID, // your Pro plan price
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

    // ✅ Save customer_id to Supabase profiles table if new
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

    // ✅ Return the session URL so frontend can redirect instantly
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}