// Checkout pricing rules. Totals are always computed on the server from
// database prices; the client only displays what the server returns.

// Flat shipping charge per order, in dollars.
export const FLAT_SHIPPING_RATE = 15;

// Texas sales tax (state 6.25% + max local 2%). Charged only when the order
// ships to a Texas address. Texas taxes delivery charges on taxable items,
// so shipping is included in the taxable amount.
export const TEXAS_TAX_RATE = 0.0825;

export function roundCents(value: number) {
  return Math.round(value * 100) / 100;
}

export function toCents(value: number) {
  return Math.round(value * 100);
}

export function isTexas(state: string) {
  const normalized = state.trim().toUpperCase();

  return normalized === "TX" || normalized === "TEXAS";
}

export function calculateTotals(
  subtotal: number,
  shippingState: string,
) {
  const shippingTotal =
    subtotal > 0 ? FLAT_SHIPPING_RATE : 0;

  const taxTotal = isTexas(shippingState)
    ? roundCents(
        (subtotal + shippingTotal) *
          TEXAS_TAX_RATE,
      )
    : 0;

  const grandTotal = roundCents(
    subtotal + shippingTotal + taxTotal,
  );

  return {
    subtotal: roundCents(subtotal),
    shippingTotal,
    taxTotal,
    grandTotal,
  };
}
