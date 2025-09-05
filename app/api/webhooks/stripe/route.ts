import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // === Ensure required env vars ===
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecret || !supabaseUrl || !supabaseServiceRoleKey || !webhookSecret) {
    return NextResponse.json(
      { error: "Server misconfigured: missing Stripe/Supabase env vars" },
      { status: 500 }
    );
  }

  console.log("stripe webhook: received");

  // Create clients at runtime (no invalid apiVersion)
  const stripe = new Stripe(stripeSecret);
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  // === Verify Stripe signature ===
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    console.error("⚠️ Webhook signature error:", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // === Handle event types ===
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Normalize customer id (string or object)
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;

        // Prefer metadata.user_id, else fallback to client_reference_id
        const userId =
          (session.metadata as Record<string, string> | undefined)?.user_id ||
          session.client_reference_id ||
          null;

        if (customerId && userId) {
          const { error } = await supabase
            .from("profiles")
            .update({
              stripe_customer_id: customerId,
              plan: "pro",
            })
            .eq("id", userId);

          if (error) console.error("Supabase update error:", error);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription & {
          current_period_end: number;
        };

        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id;

        if (customerId) {
          const { error } = await supabase
            .from("profiles")
            .update({
              subscription_status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              plan: subscription.status === "active" ? "pro" : "free",
            })
            .eq("stripe_customer_id", customerId);

          if (error) console.error("Supabase update error:", error);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id;

        if (customerId) {
          const { error } = await supabase
            .from("profiles")
            .update({
              subscription_status: "canceled",
              plan: "free",
            })
            .eq("stripe_customer_id", customerId);

          if (error) console.error("Supabase update error:", error);
        }
        break;
      }

      default:
        // Keep this log; it helps diagnose unexpected events without dumping payloads
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Webhook processing failed";
    console.error("❌ Webhook handler error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
