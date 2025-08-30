import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("⚠️ Webhook signature error:", err.message);
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    console.error("⚠️ Webhook signature error (non-Error):", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("✅ Checkout completed:", session.id);

        if (session.customer && session.client_reference_id) {
          await supabase
            .from("profiles")
            .update({
              stripe_customer_id: session.customer,
              plan: "pro", // mark as pro when checkout succeeds
            })
            .eq("id", session.client_reference_id);
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
    await supabase
      .from("profiles")
      .update({
        subscription_status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        plan: subscription.status === "active" ? "pro" : "free",
      })
      .eq("stripe_customer_id", subscription.customer.toString());
  }
  break;
}


      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("❌ Subscription canceled:", subscription.id);

        if (subscription.customer) {
          await supabase
            .from("profiles")
            .update({
              subscription_status: "canceled",
              plan: "free", // downgrade back to free
            })
            .eq("stripe_customer_id", subscription.customer.toString());
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