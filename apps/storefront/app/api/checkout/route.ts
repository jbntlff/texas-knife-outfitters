import { NextResponse } from "next/server";

import { createServerActionSupabaseClient } from "@tkb/auth/server";
import {
  createOrder,
  getCheckoutVariants,
  setOrderPaymentIntent,
  type CreateOrderItem,
  type ShippingAddress,
} from "@tkb/database";

import { calculateTotals, toCents } from "@/lib/pricing";
import { getStripe } from "@/lib/stripe";

type RequestBody = {
  email?: unknown;
  address?: Partial<Record<keyof ShippingAddress, unknown>>;
  items?: {
    variantId?: unknown;
    quantity?: unknown;
  }[];
};

const MAX_QUANTITY_PER_ITEM = 20;

function text(value: unknown, maxLength = 200) {
  return typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : "";
}

function badRequest(error: string) {
  return NextResponse.json(
    { success: false, error },
    { status: 400 },
  );
}

// Starts checkout: re-prices the cart from the database, creates the order
// in awaiting_payment, and creates a Stripe PaymentIntent for the exact
// total. The browser then confirms payment with the returned clientSecret;
// the order only becomes "paid" once Stripe confirms it (webhook, or the
// order page checking the PaymentIntent on return).
export async function POST(request: Request) {
  let body: RequestBody;

  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return badRequest("Invalid request.");
  }

  const email = text(body.email, 254);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return badRequest("Please enter a valid email address.");
  }

  const address: ShippingAddress = {
    name: text(body.address?.name),
    phone: text(body.address?.phone, 40) || null,
    line1: text(body.address?.line1),
    line2: text(body.address?.line2) || null,
    city: text(body.address?.city, 100),
    state: text(body.address?.state, 50).toUpperCase(),
    postalCode: text(body.address?.postalCode, 20),
    country: "US",
  };

  if (
    !address.name ||
    !address.line1 ||
    !address.city ||
    !address.state ||
    !address.postalCode
  ) {
    return badRequest("Please complete your shipping address.");
  }

  // Merge duplicate lines and validate quantities.
  const quantities = new Map<string, number>();

  for (const item of body.items ?? []) {
    const variantId = text(item.variantId, 64);
    const quantity = Number(item.quantity);

    if (
      !variantId ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return badRequest("Your cart contains an invalid item.");
    }

    quantities.set(
      variantId,
      (quantities.get(variantId) ?? 0) + quantity,
    );
  }

  if (quantities.size === 0) {
    return badRequest("Your cart is empty.");
  }

  for (const quantity of quantities.values()) {
    if (quantity > MAX_QUANTITY_PER_ITEM) {
      return badRequest(
        `Please contact us for orders of more than ${MAX_QUANTITY_PER_ITEM} of one item.`,
      );
    }
  }

  try {
    // Fail before creating an order if Stripe isn't configured.
    const stripe = getStripe();

    const variants = await getCheckoutVariants([
      ...quantities.keys(),
    ]);

    const items: CreateOrderItem[] = [];

    for (const [variantId, quantity] of quantities) {
      const variant = variants.get(variantId);

      if (!variant) {
        return badRequest(
          "One of the items in your cart is no longer available. Please remove it and try again.",
        );
      }

      items.push({
        productId: variant.productId,
        variantId: variant.variantId,
        sku: variant.sku,
        productName: variant.productName,
        variantTitle: variant.variantTitle,
        quantity,
        unitPrice: variant.price,
        selectedOptions: variant.selectedOptions,
      });
    }

    const totals = calculateTotals(
      items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0,
      ),
      address.state,
    );

    const supabase = await createServerActionSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const order = await createOrder({
      customerEmail: email,
      customerId: user?.id ?? null,
      subtotal: totals.subtotal,
      taxTotal: totals.taxTotal,
      shippingTotal: totals.shippingTotal,
      shippingAddress: address,
      items,
    });

    const paymentIntent =
      await stripe.paymentIntents.create(
        {
          amount: toCents(totals.grandTotal),
          currency: "usd",
          automatic_payment_methods: { enabled: true },
          receipt_email: email,
          description: `Order ${order.order_number}`,
          metadata: {
            order_id: order.id,
            order_number: order.order_number,
          },
          shipping: {
            name: address.name,
            phone: address.phone ?? undefined,
            address: {
              line1: address.line1,
              line2: address.line2 ?? undefined,
              city: address.city,
              state: address.state,
              postal_code: address.postalCode,
              country: address.country,
            },
          },
        },
        { idempotencyKey: `order-${order.id}` },
      );

    await setOrderPaymentIntent(order.id, paymentIntent.id);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      clientSecret: paymentIntent.client_secret,
      totals,
    });
  } catch (error) {
    console.error("Checkout failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to start checkout. Please try again.",
      },
      { status: 500 },
    );
  }
}
