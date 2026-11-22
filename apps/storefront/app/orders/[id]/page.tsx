import Link from "next/link";
import { notFound } from "next/navigation";

import { createServerSupabaseClient } from "@tkb/auth/server";
import {
  AWAITING_PAYMENT_STATUS,
  getOrder,
} from "@tkb/database";
import { formatPrice } from "@tkb/ui";

import { ClearCart } from "@/components/cart/clear-cart";
import {
  finalizePaidOrder,
  getStripe,
} from "@/lib/stripe";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    redirect_status?: string;
  }>;
};

function formatDate(
  value: string | null,
) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  );
}

function formatStatus(
  status: string | null,
) {
  if (!status) {
    return "Pending";
  }

  return status
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (char) => char.toUpperCase(),
    );
}

export default async function OrderPage({
  params,
  searchParams,
}: PageProps) {
  const { id } =
    await params;

  const { redirect_status: redirectStatus } =
    await searchParams;

  let order =
    await getOrder(id);

  if (!order) {
    notFound();
  }

  // Stripe redirects here after payment. If the webhook hasn't marked the
  // order paid yet, check the PaymentIntent directly so the customer sees
  // the right state immediately (finalizePaidOrder is idempotent).
  let paymentStatus: string | null = null;

  if (
    order.status === AWAITING_PAYMENT_STATUS &&
    order.stripe_payment_intent_id
  ) {
    try {
      const paymentIntent =
        await getStripe().paymentIntents.retrieve(
          order.stripe_payment_intent_id,
        );

      paymentStatus = paymentIntent.status;

      if (paymentIntent.status === "succeeded") {
        await finalizePaidOrder(
          order.id,
          paymentIntent.id,
        );

        // Don't re-fetch here: Next.js memoizes identical GET fetches within
        // a render, so getOrder() would return the stale awaiting_payment row.
        order = {
          ...order,
          status: "paid",
        };
      }
    } catch (error) {
      console.error(
        "Unable to check payment status:",
        error,
      );
    }
  }

  const awaitingPayment =
    order.status === AWAITING_PAYMENT_STATUS;

  const paymentProcessing =
    awaitingPayment &&
    paymentStatus === "processing";

  const shouldClearCart =
    redirectStatus === "succeeded" ||
    redirectStatus === "processing";

  const supabase =
    await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isCustomer = false;

  if (user) {
    const { data: profile } =
      await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

    isCustomer =
      profile?.role === "customer";
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      {shouldClearCart && <ClearCart />}

      {awaitingPayment && !paymentProcessing ? (
        <div className="mb-10 rounded-2xl border border-red-200 bg-red-50 p-8 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight">
            Payment not completed
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            We haven’t received payment for this order, so it hasn’t been
            placed. Your cart has been kept — head back to checkout to try
            again.
          </p>
          <div className="mt-6">
            <Link
              href="/checkout"
              className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
            >
              Return to checkout
            </Link>
          </div>
        </div>
      ) : paymentProcessing ? (
        <div className="mb-10 rounded-2xl border bg-muted p-8 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight">
            Payment processing
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Your payment is being processed. We’ll email{" "}
            <span className="font-medium text-foreground">
              {order.customer_email}
            </span>{" "}
            a confirmation as soon as it clears.
          </p>
        </div>
      ) : (
      <div className="mb-10 rounded-2xl border bg-muted p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Order Received
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Thank you for your order
        </h1>

        <p className="mt-3 max-w-2xl text-muted-foreground">
          We’ve received your order and sent a confirmation email to{" "}
          <span className="font-medium text-foreground">
            {order.customer_email}
          </span>
          . We’ll send another update when your shipment is on the way.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
          >
            Continue shopping
          </Link>

          {isCustomer ? (
            <Link
              href="/account"
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              View my account
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Sign in to view your account
            </Link>
          )}
        </div>
      </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <div className="rounded-xl border bg-muted p-6">
            <h2 className="mb-4 text-xl font-semibold">
              Order Items
            </h2>

            <div className="space-y-4">
              {order.order_items.map(
                (item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-6 border-b pb-4 last:border-b-0 last:pb-0"
                  >
                    <div>
                      <div className="font-medium">
                        {item.product_name}
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {item.variant_title}
                      </div>

                      {Array.isArray(
                        item.selected_options,
                      ) &&
                        item.selected_options.length >
                          0 && (
                          <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                            {(
                              item.selected_options as {
                                optionName: string;
                                optionValue: string;
                              }[]
                            ).map((option) => (
                              <div
                                key={option.optionName}
                              >
                                {option.optionName}:{" "}
                                {option.optionValue}
                              </div>
                            ))}
                          </div>
                        )}

                      <div className="mt-1 text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </div>
                    </div>

                    <div className="text-right font-medium">
                      {formatPrice(
                        item.unit_price *
                          item.quantity,
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-muted p-6">
            <h2 className="mb-4 text-xl font-semibold">
              What happens next
            </h2>

            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">
                  Order confirmation:
                </span>{" "}
                You should receive a confirmation email shortly with your order details.
              </p>

              <p>
                <span className="font-medium text-foreground">
                  Order processing:
                </span>{" "}
                We’ll begin preparing your order and verifying inventory for shipment.
              </p>

              <p>
                <span className="font-medium text-foreground">
                  Shipping update:
                </span>{" "}
                Once your package ships, we’ll email you tracking information so you can follow its progress.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border bg-muted p-6">
            <h2 className="mb-4 text-xl font-semibold">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">
                  Order Number
                </span>
                <span className="font-medium">
                  {order.order_number}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">
                  Order Date
                </span>
                <span className="text-right">
                  {formatDate(
                    order.created_at,
                  )}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">
                  Status
                </span>
                <span>
                  {formatStatus(
                    order.status,
                  )}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">
                  Email
                </span>
                <span className="text-right">
                  {order.customer_email}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-muted p-6">
            <h2 className="mb-4 text-xl font-semibold">
              Totals
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Subtotal
                </span>
                <span>
                  {formatPrice(
                    order.subtotal,
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Tax
                </span>
                <span>
                  {formatPrice(
                    order.tax_total,
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Shipping
                </span>
                <span>
                  {formatPrice(
                    order.shipping_total,
                  )}
                </span>
              </div>

              <div className="flex justify-between border-t pt-3 text-base font-semibold">
                <span>Total</span>
                <span>
                  {formatPrice(
                    order.grand_total,
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-muted p-6">
            <h2 className="mb-4 text-xl font-semibold">
              Shipping
            </h2>

            {order.carrier &&
            order.tracking_number ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">
                    Carrier
                  </span>
                  <span>{order.carrier}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">
                    Tracking
                  </span>
                  <span className="text-right">
                    {order.tracking_number}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">
                    Shipped
                  </span>
                  <span className="text-right">
                    {formatDate(
                      order.shipped_at,
                    )}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Tracking information will appear here once your order has shipped.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}