// Server-side only: never import this from a "use client" component.
import Stripe from "stripe";

import { env } from "@tkb/config";
import {
  getOrder,
  markOrderPaid,
} from "@tkb/database";
import { sendOrderConfirmationEmail } from "@tkb/email";

let stripeClient: Stripe | null = null;

// Read lazily (not via packages/config's eager env) so admin and brochure,
// which share that package, don't need Stripe keys to boot.
export function getStripe() {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      throw new Error(
        "Missing required environment variable: STRIPE_SECRET_KEY",
      );
    }

    stripeClient = new Stripe(secretKey);
  }

  return stripeClient;
}

export function getStripeWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error(
      "Missing required environment variable: STRIPE_WEBHOOK_SECRET",
    );
  }

  return secret;
}

// Marks the order paid (decrementing inventory) and sends the confirmation
// email. Called from both the webhook and the order page after Stripe
// redirects back; markOrderPaid guarantees only the first caller does the
// work, so the email goes out exactly once.
export async function finalizePaidOrder(
  orderId: string,
  paymentIntentId: string,
) {
  const updated = await markOrderPaid(
    orderId,
    paymentIntentId,
  );

  if (!updated) {
    return false;
  }

  const order = await getOrder(orderId);

  if (!order) {
    return true;
  }

  try {
    await sendOrderConfirmationEmail({
      customerEmail: order.customer_email,
      customerName:
        order.shipping_name ?? order.customer_email,
      orderNumber: order.order_number,
      orderUrl: `${env.storefrontUrl}/orders/${order.id}`,
      subtotal: Number(order.subtotal ?? 0),
      taxTotal: Number(order.tax_total ?? 0),
      shippingTotal: Number(order.shipping_total ?? 0),
      grandTotal: Number(order.grand_total ?? 0),
      items: order.order_items.map((item) => ({
        productName: item.product_name,
        variantTitle: item.variant_title,
        quantity: item.quantity,
        unitPrice: Number(item.unit_price),
      })),
    });
  } catch (error) {
    console.error(
      "Failed to send order confirmation email:",
      error,
    );
  }

  return true;
}
