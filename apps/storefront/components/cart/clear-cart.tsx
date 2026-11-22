"use client";

import { useEffect, useRef } from "react";

import { useCart } from "@/components/cart/cart-provider";

// Rendered on the order page after Stripe redirects back from a successful
// (or processing) payment, so the purchased items leave the cart.
//
// CartProvider loads the cart from localStorage in an effect after mount,
// so clearing on mount would be overwritten by that load. Instead, wait
// until the loaded cart actually has items, then clear it once.
export function ClearCart() {
  const { cart, clearCart } = useCart();
  const cleared = useRef(false);

  useEffect(() => {
    if (!cleared.current && cart.items.length > 0) {
      cleared.current = true;
      clearCart();
    }
  }, [cart.items.length, clearCart]);

  return null;
}
