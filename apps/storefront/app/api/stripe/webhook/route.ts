import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { createOrderEvent } from "@tkb/database";

import {
  finalizePaidOrder,
  getStripe,
  getStripeWebhookSecret,
} from "@/lib/stripe";

// Stripe calls this endpoint for payment events. Register it in the Stripe
// dashboard (Developers > Webhooks) as https://<storefront>/api/stripe/webhook
// with at least payment_intent.succeeded and payment_intent.payment_failed.
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    // The signature is computed over the raw body, so read it as text.
    const payload = await request.text();

    event = getStripe().webhooks.constructEvent(
      payload,
      signature,
      getStripeWebhookSecret(),
    );
  } catch (error) {
    console.error("Stripe webhook signature check failed:", error);

    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.order_id;

        if (orderId) {
          await finalizePaidOrder(orderId, paymentIntent.id);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.order_id;

        if (orderId) {
          await createOrderEvent(
            orderId,
            "PAYMENT_FAILED",
            paymentIntent.last_payment_error?.message ??
              "Payment failed",
          );
        }
        break;
      }

      default:
        break;
    }
  } catch (error) {
    // Returning 500 makes Stripe retry the event later.
    console.error(`Failed to handle Stripe event ${event.type}:`, error);

    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
