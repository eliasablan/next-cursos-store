import type Stripe from "stripe";
import { type NextRequest, NextResponse } from "next/server";
import stripe from "@/server/stripe";
import { env } from "@/env";
import { api } from "@/trpc/server";

const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed.", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed." },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed":
      const checkout = event.data.object;
      const subscriptionId = checkout.metadata?.subscriptionId;
      if (!subscriptionId) break;
      await api.subs.updateSubscriptionPayment({
        subscriptionId,
        paid: true,
      });
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
