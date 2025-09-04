import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  // === Ensure required env vars ===
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecret || !supabaseUrl || !supabaseServiceRoleKey || !webhookSecret) {
    console.error("❌ Missing environment variables:", {
      stripeSecret: !!stripeSecret,
      supabaseUrl: !!supabaseUrl,
      supabaseServiceRoleKey: !!supabaseServiceRoleKey,
      webhookSecret: !!webhookSecret,
    });
    return NextResponse.json(
      { error: "Server misconfigured: missing Stripe/Supabase env vars" },
      { status: 500 }
    );
  }

  // ✅ Create clients at runtime
  const stripe = new Stripe(stripeSecret, { apiVersion: "2025-08-27.basil" });
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  // === Verify Stripe signature ===
  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig as string, webhookSecret);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("⚠️ Webhook signature error:", err.message);
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("⚠️ Webhook signature error (non-Error):", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // === Handle event types ===
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("✅ Checkout completed:", session.id);

        if (session.customer && session.client_reference_id) {
          const { error } = await supabase
            .from("profiles")
            .update({
              stripe_customer_id: session.customer,
              plan: "pro", // upgrade user
            })
            .eq("id", session.client_reference_id);

          if (error) console.error("Supabase update error:", error);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription & {
          current_period_end: number;
        };
        console.log("🔄 Subscription event:", subscription.id);

        if (subscription.customer) {
          const { error } = await supabase
            .from("profiles")
            .update({
              subscription_status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              plan: subscription.status === "active" ? "pro" : "free",
            })
            .eq("stripe_customer_id", subscription.customer.toString());

          if (error) console.error("Supabase update error:", error);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("❌ Subscription canceled:", subscription.id);

        if (subscription.customer) {
          const { error } = await supabase
            .from("profiles")
            .update({
              subscription_status: "canceled",
              plan: "free", // downgrade
            })
            .eq("stripe_customer_id", subscription.customer.toString());

          if (error) console.error("Supabase update error:", error);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("❌ Webhook handler error:", err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    console.error("❌ Webhook handler error (non-Error):", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
