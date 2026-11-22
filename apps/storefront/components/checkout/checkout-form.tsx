"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

import { useCart } from "@/components/cart/cart-provider";
import type { CartItem } from "@/lib/cart";
import { calculateTotals } from "@/lib/pricing";
import { US_STATES } from "@/lib/us-states";

const publishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

const stripePromise = publishableKey
  ? loadStripe(publishableKey)
  : null;

type CheckoutFormProps = {
  initialEmail?: string;
  initialName?: string;
};

type Totals = ReturnType<typeof calculateTotals>;

type PaymentSession = {
  orderId: string;
  clientSecret: string;
  totals: Totals;
};

type Address = {
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

const inputClass =
  "w-full rounded-md border px-3 py-2 disabled:opacity-60";

export function CheckoutForm({
  initialEmail = "",
  initialName = "",
}: CheckoutFormProps) {
  const { cart } = useCart();

  const [email, setEmail] = useState(initialEmail);

  const [address, setAddress] = useState<Address>({
    name: initialName,
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
  });

  const [session, setSession] =
    useState<PaymentSession | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const estimate = calculateTotals(
    cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    ),
    address.state,
  );

  // Once payment has started, show the server's authoritative totals.
  const totals = session?.totals ?? estimate;

  function updateAddress(field: keyof Address, value: string) {
    setAddress((current) => ({ ...current, [field]: value }));

    if (error) {
      setError(null);
    }
  }

  async function handleContinue(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (cart.items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!stripePromise) {
      setError(
        "Online payment is not configured yet. Please contact us to place your order.",
      );
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          address,
          items: cart.items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.clientSecret) {
        setError(
          result?.error ??
            "Unable to start checkout. Please try again.",
        );
        return;
      }

      setSession({
        orderId: result.orderId,
        clientSecret: result.clientSecret,
        totals: result.totals,
      });
    } catch (err) {
      console.error(err);
      setError(
        "Something went wrong while starting checkout. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  const detailsLocked = session !== null;

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleContinue} className="space-y-6">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Contact</h2>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError(null);
              }}
              className={inputClass}
              disabled={detailsLocked}
              required
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Shipping Address</h2>

          <p className="text-sm text-muted-foreground">
            We currently ship within the United States only.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="mb-2 block text-sm font-medium">
                Full Name
              </label>
              <input
                id="name"
                autoComplete="shipping name"
                value={address.name}
                onChange={(e) => updateAddress("name", e.target.value)}
                className={inputClass}
                disabled={detailsLocked}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="line1" className="mb-2 block text-sm font-medium">
                Address
              </label>
              <input
                id="line1"
                autoComplete="shipping address-line1"
                value={address.line1}
                onChange={(e) => updateAddress("line1", e.target.value)}
                className={inputClass}
                disabled={detailsLocked}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="line2" className="mb-2 block text-sm font-medium">
                Apartment, suite, etc. (optional)
              </label>
              <input
                id="line2"
                autoComplete="shipping address-line2"
                value={address.line2}
                onChange={(e) => updateAddress("line2", e.target.value)}
                className={inputClass}
                disabled={detailsLocked}
              />
            </div>

            <div>
              <label htmlFor="city" className="mb-2 block text-sm font-medium">
                City
              </label>
              <input
                id="city"
                autoComplete="shipping address-level2"
                value={address.city}
                onChange={(e) => updateAddress("city", e.target.value)}
                className={inputClass}
                disabled={detailsLocked}
                required
              />
            </div>

            <div>
              <label htmlFor="state" className="mb-2 block text-sm font-medium">
                State
              </label>
              <select
                id="state"
                autoComplete="shipping address-level1"
                value={address.state}
                onChange={(e) => updateAddress("state", e.target.value)}
                className={inputClass}
                disabled={detailsLocked}
                required
              >
                <option value="">Select a state</option>
                {US_STATES.map((state) => (
                  <option key={state.code} value={state.code}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="postalCode" className="mb-2 block text-sm font-medium">
                ZIP Code
              </label>
              <input
                id="postalCode"
                autoComplete="shipping postal-code"
                inputMode="numeric"
                pattern="\d{5}(-\d{4})?"
                value={address.postalCode}
                onChange={(e) => updateAddress("postalCode", e.target.value)}
                className={inputClass}
                disabled={detailsLocked}
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium">
                Phone (optional, for delivery issues)
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="shipping tel"
                value={address.phone}
                onChange={(e) => updateAddress("phone", e.target.value)}
                className={inputClass}
                disabled={detailsLocked}
              />
            </div>
          </div>
        </section>

        <OrderSummary items={cart.items} totals={totals} hasState={address.state !== ""} />

        {!detailsLocked && (
          <button
            type="submit"
            disabled={loading || cart.items.length === 0}
            className="rounded-md bg-foreground px-6 py-3 text-background disabled:opacity-50"
          >
            {loading ? "Preparing payment..." : "Continue to Payment"}
          </button>
        )}
      </form>

      {session && stripePromise && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Payment</h2>
            <button
              type="button"
              onClick={() => setSession(null)}
              className="text-sm font-medium underline underline-offset-4"
            >
              Edit details
            </button>
          </div>

          <Elements
            key={session.clientSecret}
            stripe={stripePromise}
            options={{
              clientSecret: session.clientSecret,
              appearance: {
                theme: "stripe",
                variables: { borderRadius: "6px" },
              },
            }}
          >
            <PaymentStep
              orderId={session.orderId}
              grandTotal={session.totals.grandTotal}
            />
          </Elements>
        </section>
      )}
    </div>
  );
}


function OrderSummary({
  items,
  totals,
  hasState,
}: {
  items: CartItem[];
  totals: Totals;
  hasState: boolean;
}) {
  return (
    <div className="rounded-2xl border bg-muted p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Order Summary</h2>
        <span className="text-sm text-muted-foreground">
          {items.length} item{items.length === 1 ? "" : "s"}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.variantId}
                className="flex items-start justify-between gap-4 border-b pb-4 last:border-b-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.variantTitle}
                  </p>
                  {item.selectedOptions &&
                    item.selectedOptions.length > 0 && (
                      <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                        {item.selectedOptions.map((option) => (
                          <div key={option.optionName}>
                            {option.optionName}: {option.optionValue}
                          </div>
                        ))}
                      </div>
                    )}
                  <p className="mt-1 text-sm text-muted-foreground">
                    Qty: {item.quantity}
                  </p>
                </div>
                <div className="text-right font-medium">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3 border-t pt-6 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{formatPrice(totals.shippingTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>
                {hasState ? formatPrice(totals.taxTotal) : "Calculated from address"}
              </span>
            </div>
            <div className="flex justify-between border-t pt-3 text-base font-semibold">
              <span>Total</span>
              <span>{formatPrice(totals.grandTotal)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function PaymentStep({
  orderId,
  grandTotal,
}: {
  orderId: string;
  grandTotal: number;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setSubmitting(true);
    setError(null);

    // On success Stripe redirects to return_url (with ?payment_intent=...),
    // where the order page confirms payment and clears the cart.
    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders/${orderId}`,
      },
    });

    // Only reached if confirmation failed immediately (card declined,
    // validation error, etc.).
    setError(
      confirmError.message ??
        "Your payment could not be completed. Please try again.",
    );
    setSubmitting(false);
  }

  return (
    <form onSubmit={handlePay} className="space-y-6">
      <PaymentElement />

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || submitting}
        className="rounded-md bg-foreground px-6 py-3 text-background disabled:opacity-50"
      >
        {submitting ? "Processing..." : `Pay ${formatPrice(grandTotal)}`}
      </button>
    </form>
  );
}
