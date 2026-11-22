-- Stripe payments: an order is now created in 'awaiting_payment' before the
-- customer pays, and the Stripe webhook flips it to 'paid'. These columns
-- link the order to its PaymentIntent and capture the shipping address the
-- customer entered on /checkout (needed for tax and fulfillment).

alter table public.orders
  add column stripe_payment_intent_id text unique,
  add column paid_at timestamptz,
  add column shipping_name text,
  add column shipping_phone text,
  add column shipping_line1 text,
  add column shipping_line2 text,
  add column shipping_city text,
  add column shipping_state text,
  add column shipping_postal_code text,
  add column shipping_country text;

create index if not exists idx_orders_status
  on public.orders(status);
