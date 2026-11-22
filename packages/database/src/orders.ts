import { createAdminClient } from "./admin-client";
import { createOrderEvent } from "./order-events";

export type SelectedOption = {
  optionName: string;
  optionValue: string;
};

export type CreateOrderItem = {
  productId: string;
  variantId: string;
  sku: string;
  productName: string;
  variantTitle: string;
  quantity: number;
  unitPrice: number;
  selectedOptions?: SelectedOption[];
};

export type ShippingAddress = {
  name: string;
  phone?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type CreateOrderInput = {
  customerEmail: string;
  customerId?: string | null;
  subtotal: number;
  taxTotal?: number;
  shippingTotal?: number;
  shippingAddress?: ShippingAddress | null;
  items: CreateOrderItem[];
};

// An order that has been started at checkout but not paid for yet. These
// are hidden from admin lists, metrics and customer order history until the
// Stripe webhook marks them paid.
export const AWAITING_PAYMENT_STATUS =
  "awaiting_payment";

export type CheckoutVariant = {
  variantId: string;
  productId: string;
  sku: string;
  productName: string;
  variantTitle: string;
  price: number;
  selectedOptions: SelectedOption[];
};

// Look up the real, current price and names for each variant in the cart.
// Checkout must never trust prices sent by the browser.
export async function getCheckoutVariants(
  variantIds: string[],
): Promise<Map<string, CheckoutVariant>> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("product_variants")
    .select(`
      id,
      sku,
      title,
      price,
      active,
      product_id,
      products!inner(name, status),
      variant_options(option_name, option_value)
    `)
    .in("id", variantIds)
    .eq("active", true)
    .eq("products.status", "active");

  if (error) {
    throw error;
  }

  const map = new Map<string, CheckoutVariant>();

  for (const row of data ?? []) {
    map.set(row.id, {
      variantId: row.id,
      productId: row.product_id,
      sku: row.sku,
      productName: row.products.name,
      variantTitle: row.title,
      price: Number(row.price),
      selectedOptions: (row.variant_options ?? []).map(
        (option) => ({
          optionName: option.option_name,
          optionValue: option.option_value,
        }),
      ),
    });
  }

  return map;
}

export async function createOrder(
  input: CreateOrderInput,
) {

  if (input.items.length === 0) {
    throw new Error(
      "Cannot create an order with no items.",
    );
  }

  const supabase = createAdminClient();

  const taxTotal = input.taxTotal ?? 0;
  const shippingTotal = input.shippingTotal ?? 0;
  const grandTotal = input.subtotal + taxTotal + shippingTotal;
  const orderNumber = `TKO-${Date.now()}`;
  const address = input.shippingAddress;

  const {
    data: order,
    error: orderError,
  } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      status: AWAITING_PAYMENT_STATUS,
      customer_email: input.customerEmail,
      customer_id: input.customerId ?? null,
      subtotal: input.subtotal,
      tax_total: taxTotal,
      shipping_total: shippingTotal,
      grand_total: grandTotal,
      shipping_name: address?.name ?? null,
      shipping_phone: address?.phone ?? null,
      shipping_line1: address?.line1 ?? null,
      shipping_line2: address?.line2 ?? null,
      shipping_city: address?.city ?? null,
      shipping_state: address?.state ?? null,
      shipping_postal_code: address?.postalCode ?? null,
      shipping_country: address?.country ?? null,
    })
    .select()
    .single();

  if (orderError) {
    throw orderError;
  }

  const orderItems =
    input.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      variant_id: item.variantId,
      sku: item.sku,
      product_name: item.productName,
      variant_title: item.variantTitle,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      selected_options: item.selectedOptions ?? [],
    }));

  const {
    error: itemsError,
  } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    throw itemsError;
  }

  await createOrderEvent(
    order.id,
    "ORDER_CREATED",
    `Order ${order.order_number} was created and is awaiting payment`,
  );

  return order;
}

export async function setOrderPaymentIntent(
  orderId: string,
  paymentIntentId: string,
) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("orders")
    .update({
      stripe_payment_intent_id: paymentIntentId,
    })
    .eq("id", orderId);

  if (error) {
    throw error;
  }
}

// Called from the Stripe webhook once a payment succeeds. Safe to call more
// than once for the same order (Stripe retries webhooks): only the call
// that actually moves the order out of awaiting_payment decrements
// inventory and returns the order; later calls return null.
export async function markOrderPaid(
  orderId: string,
  paymentIntentId: string,
) {
  const supabase = createAdminClient();

  const {
    data: order,
    error,
  } = await supabase
    .from("orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      stripe_payment_intent_id: paymentIntentId,
    })
    .eq("id", orderId)
    .eq("status", AWAITING_PAYMENT_STATUS)
    .select("id, order_number")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!order) {
    return null;
  }

  const {
    data: items,
    error: itemsError,
  } = await supabase
    .from("order_items")
    .select("variant_id, quantity")
    .eq("order_id", order.id);

  if (itemsError) {
    throw itemsError;
  }

  for (const item of items ?? []) {
    const {
      data: inventory,
      error: inventoryError,
    } = await supabase
      .from("inventory")
      .select("quantity")
      .eq(
        "variant_id",
        item.variant_id,
      )
      .maybeSingle();

    if (inventoryError) {
      throw inventoryError;
    }

    const currentQuantity = inventory?.quantity ?? 0;

    const newQuantity =
      Math.max(
        0,
        currentQuantity -
        item.quantity,
      );

    const {
      error: updateError,
    } = await supabase
      .from("inventory")
      .upsert({
        variant_id:
          item.variant_id,

        quantity:
          newQuantity,
      });

    if (updateError) {
      throw updateError;
    }
  }

  await createOrderEvent(
    order.id,
    "PAYMENT_SUCCEEDED",
    `Payment received via Stripe (${paymentIntentId})`,
  );

  return order;
}

export async function getOrder(
  orderId: string,
) {
  const supabase =
    createAdminClient();

  const { data, error } =
    await supabase
      .from("orders")
      .select(`
        *,
        order_items(*)
      `)
      .eq("id", orderId)
      .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getOrders(
  search?: string,
  status?: string,
) {
  const supabase = createAdminClient();

  let query = supabase
    .from("orders")
    .select("*");

  if (status) {
    query = query.eq("status", status,);
  } else {
    // Unpaid checkouts (including abandoned ones) only show up when the
    // admin filters for them explicitly, and never count toward metrics.
    query = query.neq("status", AWAITING_PAYMENT_STATUS);
  }

  if (search) {
    query = query.or(
      [
        `order_number.ilike.%${search}%`,
        `customer_email.ilike.%${search}%`,
      ].join(","),
    );
  }

  const { data, error } =
    await query.order(
      "created_at",
      {
        ascending: false,
      },
    );

  if (error) {
    throw error;
  }

  return data;
}



export async function getOrdersByCustomerId(
  customerId: string,
) {
  const supabase =
    createAdminClient();

  const {
    data,
    error,
  } = await supabase
    .from("orders")
    .select(`
      *,
      order_items(*)
    `)
    .eq("customer_id", customerId)
    .neq("status", AWAITING_PAYMENT_STATUS)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data;
}



export async function updateOrderStatus(
  orderId: string,
  status: string,
) {
  const supabase =
    createAdminClient();

  if (status === "shipped") {
    const order = await getOrder(orderId)
    if (!order?.carrier || !order.tracking_number) {
      throw new Error(
        "Carrier and tracking number are required before marking an order as shipped",
      )
    }
  }
  const { error } =
    await supabase
      .from("orders")
      .update({
        status,
      })
      .eq("id", orderId);

  if (error) {
    throw error;
  }

  await createOrderEvent(
    orderId,
    "STATUS_CHANGED",
    `Order marked as ${status}`,
  );

}

export async function getOrderMetrics() {
  const orders =
    await getOrders();

  const totalOrders =
    orders.length;

  const pendingOrders =
    orders.filter(
      (order) =>
        order.status ===
        "pending",
    ).length;

  const revenue =
    orders.reduce(
      (sum, order) =>
        sum +
        Number(
          order.grand_total,
        ),
      0,
    );

  const averageOrderValue =
    totalOrders === 0
      ? 0
      : revenue /
      totalOrders;

  return {
    totalOrders,
    pendingOrders,
    revenue,
    averageOrderValue,
  };
}

export async function updateShipment(
  orderId: string,
  carrier: string,
  trackingNumber: string,
) {
  const supabase =
    createAdminClient();

  const { error } =
    await supabase
      .from("orders")
      .update({
        carrier,
        tracking_number:
          trackingNumber,
        shipped_at:
          new Date()
            .toISOString(),
        status: "shipped",
      })
      .eq(
        "id",
        orderId,
      );

  if (error) {
    throw error;
  }


  await createOrderEvent(
    orderId,
    "SHIPMENT_ADDED",
    `${carrier} • ${trackingNumber}`,
  );

}